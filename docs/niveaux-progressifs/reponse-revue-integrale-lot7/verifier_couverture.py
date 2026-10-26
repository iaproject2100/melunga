"""Read-only, generator-independent audit of Claude lot7's documentary scope.

Before values are read from pinned Git objects. Local structure comparisons are
separate and intentionally allow only the reviewed phrase fields to differ.
This is an audit of traceability; it is not a native or acquisition assessment.
"""
from __future__ import annotations
from collections import Counter, defaultdict
from functools import lru_cache
import hashlib
import json
from pathlib import Path
import re
import subprocess
import unicodedata

ROOT = Path(__file__).resolve().parents[3]
BASE = 'd56fe23b4bafd63bbd2d4aefb67896dbc12374a2'
LOT = 'dec4e90a01ca40dca2394ac43eb37a4771b011b1'
PROOF = 'docs/revue-integrale/lot7-fr-en-L1-L10/'
DATA = 'melunga_deploy/content/niveaux-progressifs/'
PINS = {
 'registre-phonetique.json':'ad4c4aa3db44e56a2d4c493b5779a869362ab495d5359910582c79adbe662c46',
 'lot-contenu-gloses.json':'7492a7da2e909fd83040be2f1f146c5b87b5641ff5b02660a076fe87387af87f',
 'propositions-niveaux-themes.json':'5ab38d121b56595b6865382d85327a82be4ad7c754b75248011567da085a4f5c',
 'conventions-a-decider.json':'68daac6071e40c294d2ab21662632971d79d3d171603239d94a124cc9d030c23',
 'couverture.json':'6f1bebb8480ce009d542a30db36b8fbbf88aa8f6525a563e3ac6a8766f0ed8fc',
}
STATUS = {'verifie', 'proposition', 'incertain', 'glose-a-corriger', 'corrige'}


def require(condition, message):
 if not condition: raise AssertionError(message)


@lru_cache(None)
def git_bytes(commit, path):
 return subprocess.check_output(['git', 'show', commit + ':' + path], cwd=ROOT)


def git_json(commit, path): return json.loads(git_bytes(commit, path))
def digest(raw): return hashlib.sha256(raw).hexdigest()


def address(value, location):
 for token in location: value = value[token]
 return value


def snapshot(commit, pair):
 primary, received, positions, themes, paths = {}, {}, [], {}, {}
 for level in range(1, 11):
  path = DATA + pair + f'/L{level}.json'
  cell = git_json(commit, path)
  paths[path] = cell
  themes[level] = {theme['id']: theme for theme in cell['themes'] + cell['heldThemes']}
  for collection in ('themes', 'heldThemes'):
   for t_index, theme in enumerate(cell[collection]):
    for p_index, phrase in enumerate(theme['phrases']):
     require(phrase['id'] not in primary, 'Duplicate canonical identity')
     row = {'phrase': phrase, 'role': 'canonical', 'level': level, 'theme': theme['id'],
            'themeTitle': theme['title'], 'path': path, 'location': [collection, t_index, 'phrases', p_index]}
     primary[phrase['id']] = row; positions.append(row)
  for index, phrase in enumerate(cell['reserve']):
   require(phrase['id'] not in primary, 'Duplicate reserved identity')
   row = {'phrase': phrase, 'role': 'canonical', 'level': level, 'theme': 'reserve',
          'themeTitle': None, 'path': path, 'location': ['reserve', index]}
   primary[phrase['id']] = row; positions.append(row)
 path = DATA + 'repertoires/' + pair + '.json'
 bank = git_json(commit, path); paths[path] = bank
 for index, phrase in enumerate(bank['receivedModels']):
  require(phrase.get('heardOnly') is True and phrase.get('referenceOnly') is True, 'Received role is not explicit')
  require(phrase['id'] not in received, 'Duplicate received identity')
  row = {'phrase': phrase, 'role': 'received', 'level': None, 'theme': 'receivedModels',
         'themeTitle': None, 'path': path, 'location': ['receivedModels', index]}
  received[phrase['id']] = row; positions.append(row)
 return primary, received, positions, themes, paths, bank


def normalized_study(value):
 return re.sub(r'[\s。、，,.!?！？…〜～\-–—·・:：;；「」『』\"\'’]', '', unicodedata.normalize('NFKC', value)).casefold()


def structure(value):
 if isinstance(value, dict):
  if all(key in value for key in ('id','study','native','phon','source')):
   return {key:value[key] for key in ('id','source','placement','editorialLevel','contentType','kind','speaker','heardOnly','referenceOnly') if key in value}
  return {key:structure(child) for key, child in value.items()}
 if isinstance(value,list): return [structure(child) for child in value]
 return value


def audit():
 primary, received, positions, themes, paths, bank = snapshot(BASE,'fr-en')
 docs={}
 for name,expected in PINS.items():
  raw=git_bytes(LOT,PROOF+name);require(digest(raw)==expected,'Frozen evidence differs: '+name)
  docs[name]=json.loads(raw)
  require(docs[name].get('reference',docs[name].get('baseSnapshotCommit'))==BASE,'Wrong before reference: '+name)
 coverage=docs['couverture.json'];declared=Counter();by_id=defaultdict(list);by_chunk=defaultdict(list)
 for item in coverage['items']:
  require(item['status'] in STATUS,'Unknown status')
  if item['chunk']=='fr-en-recus':role,level='received',None
  else:
   match=re.fullmatch(r'fr-en-L(\d+)-part\d+',item['chunk']);require(match,'Unknown chunk')
   role,level='canonical',int(match[1])
  declared[(item['id'],role,level)]+=1;by_id[item['id']].append(item);by_chunk[item['chunk']].append(item['id'])
 actual=Counter((row['phrase']['id'],row['role'],row['level']) for row in positions)
 require(declared==actual,'Coverage omits/adds/mistypes a position')
 require(len(primary)==4704 and len(received)==36 and len(positions)==coverage['total']==4740,'Wrong inventory')
 require(len(by_id)==coverage['distinctIds']==4735,'Wrong distinct IDs')
 status_counts=dict(Counter(x['status'] for x in coverage['items']))
 require(status_counts==coverage['counts']=={'verifie':3763,'corrige':228,'incertain':100,'proposition':633,'glose-a-corriger':16},'Wrong status counts')
 for level in range(1,11):
  chunks=sorted((key for key in by_chunk if key.startswith(f'fr-en-L{level}-')),key=lambda x:int(x.rsplit('part',1)[1]))
  require([identity for chunk in chunks for identity in by_chunk[chunk]]==[row['phrase']['id'] for row in positions if row['role']=='canonical' and row['level']==level],'Within-level coverage order differs')
 require(by_chunk['fr-en-recus']==[row['phrase']['id'] for row in positions if row['role']=='received'],'Received coverage order differs')
 overlap=sorted(set(primary)&set(received));require(len(overlap)==5,'Wrong overlap count')
 for identity in overlap:require(len({x['status'] for x in by_id[identity]})==1,'Conflicting statuses across roles')
 phon=docs['registre-phonetique.json']['events'];ph_ids={x['id'] for x in phon}
 require(len(phon)==len(ph_ids)==228,'Wrong phonetic scope')
 require({x['id'] for x in coverage['items'] if x['status']=='corrige'}==ph_ids,'Corrected coverage differs')
 phon_rules=dict(Counter(rule for item in phon for rule in item['rules']))
 require(phon_rules=={'G':145,'W':22,'A':21,'H':21,'Z':18,'T':7},'Wrong rule counts')
 for event in phon:
  source=address(paths[event['occurrence']['path']],event['occurrence']['location'])
  require(source['id']==event['id'] and {field:source[field] for field in ('study','native','phon')}==event['occurrence']['expectedBefore'],'Wrong phon before profile')
  require(source['study']==event['study'] and source['native']==event['native'] and source['phon']==event['beforePhon'],'Phon compact before differs')
  require('reading' not in source,'Unexpected reading in English evidence')
 received_phon=[x['id'] for x in phon if x['id'] in received and x['id'] not in primary]
 require(len(received_phon)==3,'Wrong received phonetic count')
 gloss=docs['lot-contenu-gloses.json'];certain=[]
 require(len(gloss['items'])==106 and Counter(x['certainty'] for x in gloss['items'])=={'certain':11,'incertain':95},'Wrong content scope')
 for item in gloss['items']:
  row=primary.get(item['id'],received.get(item['id']));require(row is not None,'Unknown gloss identity')
  source=row['phrase'];require(source['study']==item['study'] and row['level']==item['level'] and source[item['field']]==item['before'],'Gloss before differs')
  if item['certainty']=='certain':require(item['field']=='native','Non-native certain item');certain.append(item)
 bundles=gloss['linkedBundles'];require(len(bundles)==5,'Wrong atomic bundle count')
 for item in bundles:
  source=primary[item['id']]['phrase'];require(item['applyTogether'] is True and item['certainty']=='certain','Non-atomic bundle')
  require(set(item['before'])==set(item['after']) and set(item['before']) in ({'study','phon'},{'study','native','phon'}),'Wrong bundle fields')
  require(all(source[field]==before for field,before in item['before'].items()),'Bundle before differs')
 content_ids={x['id'] for x in certain+bundles};require(content_ids=={x['id'] for x in coverage['items'] if x['status']=='glose-a-corriger'},'Content coverage differs')
 fullwidth=[x for x in certain if '？' in x['before']]
 require(len(fullwidth)==8 and all(x['after']==x['before'].replace('？','?') for x in fullwidth),'Full-width punctuation scope differs')
 all_source_fullwidth=[row['phrase']['id'] for row in positions if '？' in row['phrase']['native']]
 ascii_question_rows=[row['phrase']['id'] for row in positions if ' ?' in row['phrase']['native']]
 ending_question_rows=[row['phrase']['id'] for row in positions if row['phrase']['native'].endswith(' ?')]
 require(len(ending_question_rows)==740 and len(set(ending_question_rows))==739,'Question-mark convention count differs')
 require(set(all_source_fullwidth)=={x['id'] for x in fullwidth},'Other full-width question marks omitted')
 proposals=docs['propositions-niveaux-themes.json']['items'];kinds=dict(Counter(x['kind'] for x in proposals))
 require(len(proposals)==689 and len({x['id'] for x in proposals})==672 and kinds=={'theme':618,'duplicate':38,'level':33},'Wrong proposal scope')
 named,contextual,title_checks,comparisons,warnings=[],[],0,[],[]
 for item in proposals:
  row=primary[item['id']];source=row['phrase']
  require(row['level']==item['level'] and source['study']==item['study'] and source['native']==item['native'],'Proposal before differs')
  require(row['theme']==item['theme'] and row['themeTitle']==item['themeTitle'],'Proposal placement differs')
  if item['kind']=='theme':
   flag=item['destinationExistsAtSameLevel']
   if flag is None:
    require(item['proposed'] is None and 'contextualiser' in item['readerProposal'],'Contextual destination is not explicit null');contextual.append(item['id'])
   else:
    require(flag is True,'Named destination declared absent')
    match=re.match(r'^([A-Za-z0-9-]+)(.*)$',item['proposed']);require(match is not None,'Unparsed destination')
    destination,tail=match.groups();require(destination in themes[item['level']],'Named destination absent at same level')
    title=themes[item['level']][destination]['title']
    if tail:
     described=tail.strip().strip('— ').strip('()').strip().strip('«»" ')
     require(described==title,'Destination title differs: '+item['proposed']);title_checks+=1
    named.append({'sourceId':item['id'],'level':item['level'],'themeId':destination,'themeTitle':title})
  else:require(item['destinationExistsAtSameLevel'] is None,'Non-theme claims theme destination')
  if item['kind']=='duplicate':
   text=' '.join(item.get(key,'') or '' for key in ('current','proposed','reason'));targets={}
   for identity in re.findall(r'catalogue:en:\d+',text):
    if identity!=item['id'] and identity in primary:targets[identity]=primary[identity]['phrase']
   for path in set(re.findall(r'(?:themes/\d+/phrases/\d+|reserve/\d+)',text)):
    try:
     phrase=address(paths[row['path']],[int(x) if x.isdigit() else x for x in path.split('/')])
     if phrase['id']!=item['id']:targets[phrase['id']]=phrase
    except (IndexError,KeyError,TypeError):warnings.append({'id':item['id'],'path':path,'issue':'descriptive target path unresolved'})
   require(targets,'Duplicate without resolvable comparison target: '+item['id'])
   for identity,phrase in sorted(targets.items()):
    kind='exact' if phrase['study']==item['study'] else 'normalized-punctuation' if normalized_study(phrase['study'])==normalized_study(item['study']) else 'different-study'
    comparisons.append({'id':item['id'],'targetId':identity,'comparison':kind})
 require(len(named)==425 and len(contextual)==193,'Wrong destination counts')
 groups=docs['conventions-a-decider.json']['groups'];conventions=[x for group in groups.values() for x in group];group_counts={k:len(v) for k,v in groups.items()}
 require(len(conventions)==30,'Wrong convention scope')
 for item in conventions:
  row=primary.get(item['id'],received.get(item['id']));require(row is not None,'Unknown convention identity')
  require(item['stage']=='snapshot-d56fe23' and row['level']==item['level'] and row['phrase']['study']==item['study'] and row['phrase'][item['field']]==item['before'],'Convention stage/before differs')
  local=address(json.loads((ROOT/row['path']).read_text()),row['location'])
  require(local[item['field']]==item['before'],'Unapproved local convention field changed')
 followup={x['id'] for x in phon+gloss['items']+bundles+proposals+conventions}
 hidden=[x['id'] for x in coverage['items'] if x['status']=='verifie' and x['id'] in followup]
 require(not hidden,'Verified status hides follow-up')
 structure_paths=[]
 for pair in ('fr-en','fr-es','fr-it','fr-ja','fr-ko','fr-zh','zh-fr'):
  for level in range(1,11):
   path=DATA+pair+f'/L{level}.json';require(structure(json.loads((ROOT/path).read_text()))==structure(git_json(BASE,path)),'Local structure changed: '+path);structure_paths.append(path)
  path=DATA+'repertoires/'+pair+'.json';require(structure(json.loads((ROOT/path).read_text()))==structure(git_json(BASE,path)),'Local transport structure changed: '+path);structure_paths.append(path)
 tracked=subprocess.check_output(['git','ls-tree','-r','--name-only',BASE,'melunga_deploy','docs/niveaux-progressifs/sources/conversation'],cwd=ROOT,text=True).splitlines()
 assets=[path for path in tracked if path.startswith('melunga_deploy/') and Path(path).parent==Path('melunga_deploy') and Path(path).suffix in ('.html','.css','.js')]
 conversations=[path for path in tracked if path.startswith('docs/niveaux-progressifs/sources/conversation/') and path.endswith('.json')]
 for path in assets+conversations:require((ROOT/path).read_bytes()==git_bytes(BASE,path),'Original UI/catalogue/conversation source changed: '+path)
 require(len(assets)==36 and len(conversations)==7,'Unexpected UI or source inventory')
 return {'baseSnapshotCommit':BASE,'evidenceCommit':LOT,'proofSha256':{name:digest(git_bytes(LOT,PROOF+name)) for name in PINS},
  'canonicalPositions':len(primary),'receivedPositions':len(received),'positions':len(positions),'distinctIds':len(by_id),'statusCounts':status_counts,'chunks':{k:len(v) for k,v in by_chunk.items()},'withinLevelAndReceivedOrderExact':True,
  'overlapIds':overlap,'overlapStatuses':{identity:by_id[identity][0]['status'] for identity in overlap},'missingExpectedPositions':0,'extraPositions':0,'verifiedStatusesHidingRegisteredFollowup':hidden,
  'phonetic':{'aids':len(phon),'receivedOnlyAids':received_phon,'rules':phon_rules,'ruleMemberships':sum(phon_rules.values()),'multipleRuleIds':[x['id'] for x in phon if len(x['rules'])>1],'beforeProfilesExact':True,'readingChanged':False},
  'content':{'glossItems':len(gloss['items']),'certainNativeItems':len(certain),'uncertainItems':95,'atomicBundles':len(bundles),'bundleIds':[x['id'] for x in bundles],'beforeFieldsExact':True,'fullWidthQuestionMarkIds':[x['id'] for x in fullwidth],'allFullWidthQuestionMarksCovered':True,'existingAsciiSpaceQuestionPositions':len(ascii_question_rows),'endingAsciiSpaceQuestionPositions':len(ending_question_rows),'endingAsciiSpaceQuestionDistinctIds':len(set(ending_question_rows))},
  'proposals':{'events':len(proposals),'identities':len({x['id'] for x in proposals}),'kinds':kinds,'namedThemeRows':len(named),'contextualNullRows':len(contextual),'destinationTitlesExplicitlyChecked':title_checks,'destinationReferences':named,'duplicateComparisons':dict(Counter(x['comparison'] for x in comparisons)),'duplicateTargetReferences':comparisons,'uniqueUndirectedDuplicateComparisonPairs':len({tuple(sorted((x['id'],x['targetId']))) for x in comparisons}),'duplicateWarnings':warnings,'allBeforeFieldsAndCurrentThemesExact':True,'applied':False},
  'conventions':{'events':len(conventions),'identities':len({x['id'] for x in conventions}),'groups':group_counts,'readerCertainty':dict(Counter(x['readerCertainty'] for x in conventions)),'stages':dict(Counter(x['stage'] for x in conventions)),'beforeFieldsExact':True,'localFieldValuesStillBefore':True,'applied':False},
  'unchangedLocalStructure':{'levelFiles':70,'repertoireFiles':7,'placementsSequencesSourcesAndRolesUnchanged':True,'uiAssets':len(assets),'localL1ConversationSnapshots':len(conversations),'appSha256':digest((ROOT/'melunga_deploy/app.html').read_bytes()),'freeAccessDefinitionUnchanged':'FREE_LV=[1]; isFreeCard checks the original catalogue lv only'},
  'claudeHumanCoverage':{'cells':50,'totalCells':70,'remainingCells':20},'generatorImported':False,'productWritten':False,'nativeOrPedagogicalApproval':False}


if __name__=='__main__':print(json.dumps(audit(),ensure_ascii=False,indent=2))

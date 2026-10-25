"""Read-only, generator-independent audit of Claude lot6's documentary scope.

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
BASE = '161d0ebef38bb38ea9e26a836ca701b9d136f6d2'
LOT = '87357b16c7d77a1c94fdbd940dcb3f232758748d'
ERRATA = '45cebbdd1659a893f4941253a4bee4a33e0eefab'
LOT5 = '62daa86414d937b0554831a4c032e05b3046bb61'
PROOF = 'docs/revue-integrale/lot6-fr-ko-L1-L10/'
PRIOR_PROOF = 'docs/revue-integrale/lot5-fr-ja-L1-L10/lot-contenu-gloses.json'
DATA = 'melunga_deploy/content/niveaux-progressifs/'
PINS = {
 'registre-phonetique.json': '4c5861f15f7c77b4107c70ba3a7a2106065874ed42147f1bf428cc97e5230239',
 'registre-lectures.json': 'd250e9fbd5b2d5d6b27eb9469c7563fac20d6cbc12f410b28cf172b9d24f89de',
 'lot-contenu-gloses.json': '9a522d18d620ce38b2b462ab543a6c78179bf5b00b5989427a82c2ae6df8f73e',
 'propositions-niveaux-themes.json': '19364cd64b4750fcc29e6985715310361a219edef98650c1835aa71e4ca7cfa9',
 'conventions-a-decider.json': '74c40c97582c8bb55bdfe0d20af897aa946571f5f015709f60eef6f4c05b7d9f',
 'couverture.json': 'f0735f8bc3a4a872278376881868e61f120f0072cc718c37f141122249526a32',
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
 primary, received, positions, themes, paths, bank = snapshot(BASE, 'fr-ko')
 docs = {}
 for name, expected in PINS.items():
  raw = git_bytes(LOT, PROOF + name)
  require(digest(raw) == expected, 'Frozen evidence differs: ' + name)
  docs[name] = json.loads(raw)
  require(docs[name].get('reference',docs[name].get('baseSnapshotCommit')) == BASE, 'Wrong before reference: ' + name)
 coverage = docs['couverture.json']; declared = Counter(); by_id = defaultdict(list)
 for item in coverage['items']:
  require(item['status'] in STATUS, 'Unknown coverage status')
  if item['chunk'] == 'fr-ko-recus': role,level = 'received',None
  else:
   match = re.fullmatch(r'fr-ko-L(\d+)-part\d+',item['chunk']); require(match,'Unknown coverage chunk')
   role,level = 'canonical',int(match[1])
  declared[(item['id'],role,level)] += 1; by_id[item['id']].append(item)
 actual = Counter((row['phrase']['id'],row['role'],row['level']) for row in positions)
 require(declared == actual, 'Coverage omits/adds/mistypes a position')
 require(len(primary)==4734 and len(received)==36 and len(positions)==coverage['total']==4770,'Wrong inventory')
 require(len(by_id)==coverage['distinctIds']==4766,'Wrong distinct IDs')
 status_counts = dict(Counter(x['status'] for x in coverage['items']))
 require(status_counts==coverage['counts']=={'verifie':3916,'corrige':18,'proposition':424,'incertain':365,'glose-a-corriger':47},'Wrong status counts')
 overlap = sorted(set(primary)&set(received))
 require(overlap==sorted('catalogue:ko:'+x for x in ['136','527','646','1053']),'Wrong overlaps')
 for identity in overlap:
  require(len({x['status'] for x in by_id[identity]})==1,'Conflicting statuses across roles')
 phon = docs['registre-phonetique.json']['events']; reading = docs['registre-lectures.json']['events']
 ph_ids = {x['id'] for x in phon}; reading_ids = {x['id'] for x in reading}
 require(len(phon)==len(ph_ids)==18 and len(reading)==len(reading_ids)==5 and reading_ids<=ph_ids,'Wrong paired scope')
 require({x['id'] for x in coverage['items'] if x['status']=='corrige'}==ph_ids,'Corrected coverage differs')
 for event in phon:
  occurrence=event['occurrence']; source=address(paths[occurrence['path']],occurrence['location'])
  require(source['id']==event['id'] and {field:source[field] for field in ('study','native','reading','phon')}==occurrence['expectedBefore'],'Wrong phon before profile')
  require(source['study']==event['study'] and source['native']==event['native'] and source['reading']==event['reading'] and source['phon']==event['beforePhon'],'Phon compact before differs')
 for event in reading:
  source=address(paths[event['occurrence']['path']],event['occurrence']['location'])
  require(source['id']==event['id'] and source['reading']==event['beforeReading'] and source['study']==event['study'],'Wrong linked reading before')
  require(event['linkedPhonEvent'] is True,'Unlinked reading event')
 gloss=docs['lot-contenu-gloses.json']; certain=[]
 require(len(gloss['items'])==193 and Counter(x['certainty'] for x in gloss['items'])=={'certain':45,'incertain':148},'Wrong content scope')
 for item in gloss['items']:
  row=primary.get(item['id'],received.get(item['id'])); require(row is not None,'Unknown gloss identity')
  source=row['phrase']
  require(source['study']==item['study'] and row['level']==item['level'] and source[item['field']]==item['before'],'Gloss before differs')
  if item['certainty']=='certain': require(item['field']=='native','Non-native certain item');certain.append(item['id'])
 bundles=gloss['linkedBundles']; require(len(bundles)==2,'Wrong atomic bundle count')
 for item in bundles:
  source=primary[item['id']]['phrase']; require(item['applyTogether'] is True and item['certainty']=='certain','Non-atomic bundle')
  require(set(item['before'])==set(item['after'])=={'study','reading','phon'},'Wrong bundle fields')
  require(all(source[field]==before for field,before in item['before'].items()),'Bundle before differs')
 require(set(certain)|{x['id'] for x in bundles}=={x['id'] for x in coverage['items'] if x['status']=='glose-a-corriger'},'Content coverage differs')
 proposals=docs['propositions-niveaux-themes.json']['items']; kinds=dict(Counter(x['kind'] for x in proposals))
 require(len(proposals)==447 and len({x['id'] for x in proposals})==432 and kinds=={'level':31,'theme':327,'duplicate':89},'Wrong proposal scope')
 named,contextual,title_checks,comparisons,warnings=[],[],0,[],[]
 for item in proposals:
  row=primary[item['id']]; source=row['phrase']
  require(row['level']==item['level'] and source['study']==item['study'] and source['native']==item['native'],'Proposal before differs')
  require(row['theme']==item['theme'] and row['themeTitle']==item['themeTitle'],'Proposal current placement differs')
  if item['kind']=='theme':
   flag=item['destinationExistsAtSameLevel']
   if flag is None:
    require('contextualiser' in item['proposed'],'Null destination is not contextual');contextual.append(item['id'])
   else:
    require(flag is True,'Named destination declared absent')
    match=re.match(r'^([A-Za-z0-9-]+)(.*)$',item['proposed']); require(match is not None,'Unparsed destination')
    destination,tail=match.groups(); require(destination in themes[item['level']],'Named destination missing at same level')
    title=themes[item['level']][destination]['title']
    if tail:
     described=tail.strip().strip('— ').strip('()').strip().strip('«»\" ')
     require(described==title,'Destination title differs: '+item['proposed']);title_checks+=1
    named.append({'sourceId':item['id'],'level':item['level'],'themeId':destination,'themeTitle':title})
  else: require(item['destinationExistsAtSameLevel'] is None,'Non-theme claims a theme destination')
  if item['kind']=='duplicate':
   text=' '.join(item.get(key,'') for key in ('current','proposed','reason')); targets={}
   for identity in re.findall(r'catalogue:ko:\d+',text):
    if identity!=item['id'] and identity in primary: targets[identity]=primary[identity]['phrase']
   for path in set(re.findall(r'(?:themes/\d+/phrases/\d+|reserve/\d+)',text)):
    try:
     phrase=address(paths[row['path']],[int(x) if x.isdigit() else x for x in path.split('/')])
     if phrase['id']!=item['id']: targets[phrase['id']]=phrase
    except (IndexError,KeyError,TypeError): warnings.append({'id':item['id'],'path':path,'issue':'descriptive target path unresolved'})
   require(targets,'Duplicate without a resolvable comparison target: '+item['id'])
   for identity,phrase in sorted(targets.items()):
    kind='exact' if phrase['study']==item['study'] else 'normalized-punctuation' if normalized_study(phrase['study'])==normalized_study(item['study']) else 'different-study'
    comparisons.append({'id':item['id'],'targetId':identity,'comparison':kind})
    if kind=='different-study':warnings.append({'id':item['id'],'targetId':identity,'issue':'study differs after punctuation normalization'})
 require(len(named)==239 and len(contextual)==88,'Wrong theme destination counts')
 groups=docs['conventions-a-decider.json']['groups']; conventions=[x for group in groups.values() for x in group]
 group_counts={name:len(items) for name,items in groups.items()}
 require(len(conventions)==260 and len({x['id'] for x in conventions})==259,'Wrong convention scope')
 require(sorted(group_counts.values())==[3,10,13,53,66,115],'Wrong convention group counts')
 for item in conventions:
  row=primary.get(item['id'],received.get(item['id']));require(row is not None,'Unknown convention identity')
  require(item['stage']=='snapshot-161d0eb' and row['level']==item['level'] and row['phrase']['study']==item['study'] and row['phrase'][item['field']]==item['before'],'Convention stage or before differs')
 followup={x['id'] for x in phon+reading+gloss['items']+bundles+proposals+conventions}
 hidden=[x['id'] for x in coverage['items'] if x['status']=='verifie' and x['id'] in followup]
 require(not hidden,'Verified status hides registered follow-up')
 before5=git_json(LOT5,PRIOR_PROOF); after5=git_json(ERRATA,PRIOR_PROOF)
 old={x['id']:x for x in before5['items']};new={x['id']:x for x in after5['items']}
 changed=[identity for identity in old if old[identity]!=new[identity]]
 require(changed==['catalogue:ja:833'],'Japanese erratum changed another item')
 old833,new833=old[changed[0]],new[changed[0]]; stripped=dict(new833)
 stripped['before']=old833['before'];stripped['reason']=old833['reason']
 require(stripped==old833 and new833['certainty']=='incertain' and new833['field']=='study','Erratum altered the decision')
 ja_primary,_,_,_,_,_=snapshot(BASE,'fr-ja'); current833=ja_primary['catalogue:ja:833']['phrase']
 require(new833['before']==current833['study']=='私に似合います。' and old833['before']==current833['reading'],'Japanese corrected before still differs')
 # Compare local product structure with the before snapshot, never mutate it.
 structure_paths=[]
 for pair in ('fr-en','fr-es','fr-it','fr-ja','fr-ko','fr-zh','zh-fr'):
  for level in range(1,11):
   path=DATA+pair+f'/L{level}.json'
   require(structure(json.loads((ROOT/path).read_text()))==structure(git_json(BASE,path)),'Local level/theme/order/provenance structure changed: '+path)
   structure_paths.append(path)
  path=DATA+'repertoires/'+pair+'.json'
  require(structure(json.loads((ROOT/path).read_text()))==structure(git_json(BASE,path)),'Local transport structure changed: '+path)
  structure_paths.append(path)
 tracked=subprocess.check_output(['git','ls-tree','-r','--name-only',BASE,'melunga_deploy','docs/niveaux-progressifs/sources/conversation'],cwd=ROOT,text=True).splitlines()
 assets=[path for path in tracked if path.startswith('melunga_deploy/') and Path(path).parent==Path('melunga_deploy') and Path(path).suffix in ('.html','.css','.js')]
 conversations=[path for path in tracked if path.startswith('docs/niveaux-progressifs/sources/conversation/') and path.endswith('.json')]
 for path in assets+conversations:require((ROOT/path).read_bytes()==git_bytes(BASE,path),'Original UI/catalogue/conversation source changed: '+path)
 require(len(assets)==36 and len(conversations)==7,'Unexpected UI or local L1 source inventory')
 return {'baseSnapshotCommit':BASE,'evidenceCommit':LOT,'proofSha256':{name:digest(git_bytes(LOT,PROOF+name)) for name in PINS},
  'canonicalPositions':len(primary),'receivedPositions':len(received),'positions':len(positions),'distinctIds':len(by_id),'statusCounts':status_counts,
  'overlapIds':overlap,'overlapStatuses':{identity:by_id[identity][0]['status'] for identity in overlap},'missingExpectedPositions':0,'extraPositions':0,'verifiedStatusesHidingRegisteredFollowup':hidden,
  'phonetic':{'aids':len(phon),'linkedReadings':len(reading),'registeredFieldEvents':len(phon)+len(reading),'beforeProfilesExact':True},
  'content':{'glossItems':len(gloss['items']),'certainNativeItems':len(certain),'uncertainItems':148,'atomicBundles':len(bundles),'bundleIds':[x['id'] for x in bundles],'beforeFieldsExact':True,'hangugeoMistranslatedAsFrenchIds':sorted(x['id'] for x in gloss['items'] if x['certainty']=='certain' and '한국어' in x['study'] and 'franç' in x['before'].casefold())},
  'proposals':{'events':len(proposals),'identities':len({x['id'] for x in proposals}),'kinds':kinds,'namedThemeRows':len(named),'contextualNullRows':len(contextual),'destinationTitlesExplicitlyChecked':title_checks,'destinationReferences':named,'duplicateComparisons':dict(Counter(x['comparison'] for x in comparisons)),'duplicateTargetReferences':comparisons,'duplicateWarnings':warnings,'allBeforeFieldsAndCurrentThemesExact':True,'applied':False},
  'conventions':{'events':len(conventions),'identities':len({x['id'] for x in conventions}),'groups':group_counts,'readerCertainty':dict(Counter(x['readerCertainty'] for x in conventions)),'stages':dict(Counter(x['stage'] for x in conventions)),'repeatedId':'heard-authored:fr-ko:piste-trouver-gare-received-01','beforeFieldsExact':True,'applied':False},
  'japaneseErratum':{'commit':ERRATA,'proofSha256':digest(git_bytes(ERRATA,PRIOR_PROOF)),'id':'catalogue:ja:833','onlyBeforeAndReasonChanged':True,'oldBefore':old833['before'],'correctedBefore':new833['before'],'proposalAfter':new833['after'],'certainty':new833['certainty'],'runtimeStudyUnchanged':True,'applied':False},
  'unchangedLocalStructure':{'levelFiles':70,'repertoireFiles':7,'placementsSequencesSourcesAndRolesUnchanged':True,'uiAssets':len(assets),'localL1ConversationSnapshots':len(conversations),'appSha256':digest((ROOT/'melunga_deploy/app.html').read_bytes()),'freeAccessDefinitionUnchanged':'FREE_LV=[1]; isFreeCard checks the original catalogue lv only'},
  'claudeHumanCoverage':{'cells':40,'totalCells':70,'remainingCells':30},'generatorImported':False,'productWritten':False,'nativeOrPedagogicalApproval':False}


if __name__=='__main__':print(json.dumps(audit(),ensure_ascii=False,indent=2))

"""Read-only, generator-independent audit of Claude lot9's documentary scope.

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
BASE = '40d4c0b264b364fe31d4fd1bc9acae03dc130e01'
LOT = '5d450cc79f32d180f9331c5d06387fe36e8d94a6'
PROOF = 'docs/revue-integrale/lot9-fr-it-L1-L10/'
DATA = 'melunga_deploy/content/niveaux-progressifs/'
PINS = {'registre-phonetique.json': '661131a84a421f29d017872879713ccc3ddcbd8a5f4f9b441a312dcedaaa51e9', 'lot-contenu-gloses.json': 'cf20a6f4595f4e8c3627aac8bd4956ef5724bd9f220b2676288a88878f4636a0', 'propositions-niveaux-themes.json': '73871088e0d78f8c3b19625c8bbb0ba68a3739b4712a7a07c4c964aeacdb585a', 'conventions-a-decider.json': '03dc5421ff176eab2005c2d905d1cf8f4190c62af6979a70e1784e86262e7eb1', 'couverture.json': 'a3e466a04f3cc1f3e15b43f1182a26bdc38e6a3b78426886022269f4cb81d242', 'README.md': 'a02dfc9331d87fcc39d0c5b818b0ac5d089b2fc7d233f555dbb8138ca0d525f0', 'message-pour-codex.md': '2adf3923513adad85b299213f9fbc1563156bb2686a833b7b675cc1ee989d00f', 'consignes-de-lecture.md': 'eb50c9d0c87272fa6156d1800a5be1a58f9c53aaeeabfd5abf1c814ca1c245da'}
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
 return re.sub(r'[\s。、，,.!?！？¡¿…〜～\-–—·・:：;；「」『』\"\'’]', '', unicodedata.normalize('NFKC', value)).casefold()


def structure(value):
 if isinstance(value, dict):
  if all(key in value for key in ('id','study','native','phon','source')):
   return {key:value[key] for key in ('id','source','placement','editorialLevel','contentType','kind','speaker','heardOnly','referenceOnly') if key in value}
  return {key:structure(child) for key, child in value.items()}
 if isinstance(value,list): return [structure(child) for child in value]
 return value


def audit():
 primary, received, positions, themes, paths, bank = snapshot(BASE,'fr-it')
 docs={}
 for name,expected in PINS.items():
  raw=git_bytes(LOT,PROOF+name);require(digest(raw)==expected,'Frozen evidence differs: '+name)
  require((Path(__file__).parent/'preuves-claude'/name).read_bytes()==raw,'Local proof differs: '+name)
  if name.endswith('.json'):
   docs[name]=json.loads(raw)
   require(docs[name].get('reference',docs[name].get('baseSnapshotCommit'))==BASE,'Wrong before reference: '+name)
 coverage=docs['couverture.json'];declared=Counter();by_id=defaultdict(list);by_chunk=defaultdict(list)
 for item in coverage['items']:
  require(item['status'] in STATUS,'Unknown status')
  if item['chunk']=='fr-it-recus':role,level='received',None
  else:
   match=re.fullmatch(r'fr-it-L(\d+)-part\d+',item['chunk']);require(match,'Unknown chunk')
   role,level='canonical',int(match[1])
  declared[(item['id'],role,level)]+=1;by_id[item['id']].append(item);by_chunk[item['chunk']].append(item['id'])
 actual=Counter((row['phrase']['id'],row['role'],row['level']) for row in positions)
 require(declared==actual,'Coverage omits/adds/mistypes a position')
 require(len(primary)==4720 and len(received)==36 and len(positions)==coverage['total']==4756,'Wrong inventory')
 require(len(by_id)==coverage['distinctIds']==4753,'Wrong distinct IDs')
 status_counts=dict(Counter(x['status'] for x in coverage['items']))
 require(status_counts==coverage['counts']=={'verifie':4276,'corrige':70,'incertain':111,'proposition':263,'glose-a-corriger':36},'Wrong status counts')
 require(len(by_chunk)==21,'Wrong number of reader parts')
 for level in range(1,11):
  chunks=sorted((key for key in by_chunk if key.startswith(f'fr-it-L{level}-')),key=lambda x:int(x.rsplit('part',1)[1]))
  require([identity for chunk in chunks for identity in by_chunk[chunk]]==[row['phrase']['id'] for row in positions if row['role']=='canonical' and row['level']==level],'Within-level coverage order differs')
 require(by_chunk['fr-it-recus']==[row['phrase']['id'] for row in positions if row['role']=='received'],'Received coverage order differs')
 overlap=sorted(set(primary)&set(received));require(len(overlap)==3,'Wrong overlap count')
 for identity in overlap:require(len({x['status'] for x in by_id[identity]})==1,'Conflicting statuses across roles')
 phon=docs['registre-phonetique.json']['events'];ph_ids={x['id'] for x in phon}
 require(len(phon)==len(ph_ids)==70,'Wrong phonetic scope')
 require({x['id'] for x in coverage['items'] if x['status']=='corrige'}==ph_ids,'Corrected coverage differs')
 phon_rules=dict(Counter(rule for item in phon for rule in item['rules']))
 require(phon_rules=={'N':63,'S':3,'T':3,'A':1},'Wrong rule counts')
 for event in phon:
  source=address(paths[event['occurrence']['path']],event['occurrence']['location'])
  require(source['id']==event['id'] and {field:source[field] for field in ('study','native','phon')}==event['occurrence']['expectedBefore'],'Wrong phon before profile')
  require(source['study']==event['study'] and source['native']==event['native'] and source['phon']==event['beforePhon'],'Phon compact before differs')
  require('reading' not in source,'Unexpected reading in Italian evidence')
 received_phon=[x['id'] for x in phon if x['id'] in received and x['id'] not in primary]
 require(len(received_phon)==1,'Wrong received phonetic count')
 gloss=docs['lot-contenu-gloses.json'];certain=[]
 require(len(gloss['items'])==130 and Counter(x['certainty'] for x in gloss['items'])=={'certain':34,'incertain':96},'Wrong content scope')
 for item in gloss['items']:
  row=primary.get(item['id'],received.get(item['id']));require(row is not None,'Unknown gloss identity')
  source=row['phrase'];require(source['study']==item['study'] and row['level']==item['level'] and source[item['field']]==item['before'],'Gloss before differs')
  if item['certainty']=='certain':require(item['field']=='native','Unknown certain field');certain.append(item)
 bundles=gloss['linkedBundles'];require(len(bundles)==3,'Wrong atomic bundle count')
 for item in bundles:
  source=primary[item['id']]['phrase'];require(item['applyTogether'] is True and item['certainty']=='certain','Non-atomic bundle')
  require(set(item['before'])==set(item['after'])=={'study','native','phon'},'Wrong bundle fields')
  require(all(source[field]==before for field,before in item['before'].items()),'Bundle before differs')
 content_ids={x['id'] for x in certain+bundles}
 require(content_ids-ph_ids=={x['id'] for x in coverage['items'] if x['status']=='glose-a-corriger'},'Content coverage differs')
 require(ph_ids&content_ids=={'catalogue:it:1736'},'Wrong phonetic/content shared identity')
 require([x['id'] for x in phon if x['priorCorrection']]==[],'Unexpected prior correction')
 copy_counts=Counter(p['id'] for p in bank['phrases'] if p['id'] in ph_ids)
 require(sum(copy_counts.values())==4,'Wrong phonetic transport count')
 for item in phon:require(copy_counts[item['id']]==item['transportCopies'],'Phonetic copy declaration differs')
 content_fields={item['id']:{item['field']} for item in certain}
 for item in bundles:content_fields[item['id']]=set(item['before'])
 content_copies=[p['id'] for p in bank['phrases'] if p['id'] in content_fields]
 require(not content_copies,'Unexpected content copy')
 certain_received=[item['id'] for item in certain if item['id'] in received and item['id'] not in primary]
 require(len(certain_received)==2,'Wrong received native count')
 proposals=docs['propositions-niveaux-themes.json']['items'];kinds=dict(Counter(x['kind'] for x in proposals))
 require(len(proposals)==280 and len({x['id'] for x in proposals})==278 and kinds=={'theme':217,'duplicate':47,'level':16},'Wrong proposal scope')
 named,contextual,title_checks,comparisons,warnings=[],[],0,[],[]
 duplicate_rows=[]
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
     described=re.sub(r'\s*\(L\d+\)\s*$','',tail).strip().strip('— ').strip('()').strip().strip('«»" ')
     require(described==title,'Destination title differs: '+item['proposed']);title_checks+=1
    named.append({'sourceId':item['id'],'level':item['level'],'themeId':destination,'themeTitle':title})
  else:require(item['destinationExistsAtSameLevel'] is None,'Non-theme claims theme destination')
  if item['kind']=='duplicate':
   text=' '.join(item.get(key,'') or '' for key in ('current','proposed','reason'));targets={}
   for identity in re.findall(r'catalogue:it:\d+',text):
    if identity!=item['id'] and identity in primary:targets[identity]=primary[identity]['phrase']
   explicit_targets=set(targets)
   described_paths=set(re.findall(r'(?:themes/\d+/phrases/\d+|reserve/\d+)',text))
   for match in re.finditer(r'(themes/\d+/phrases/|reserve/)(\d+)\s+et\s+/?(\d+)',text):
    described_paths.add(match[1]+match[3])
   for path in sorted(described_paths):
    try:
     phrase=address(paths[row['path']],[int(x) if x.isdigit() else x for x in path.split('/')])
     if phrase['id']!=item['id']:
      if explicit_targets and phrase['id'] not in explicit_targets:
       warnings.append({'id':item['id'],'path':path,'resolvedId':phrase['id'],'resolvedStudy':phrase['study'],'issue':'descriptive path points to neither source nor explicit duplicate target; explicit ID retained'})
      else:targets[phrase['id']]=phrase
    except (IndexError,KeyError,TypeError):warnings.append({'id':item['id'],'path':path,'issue':'descriptive target path unresolved'})
   require(targets,'Duplicate without resolvable comparison target: '+item['id'])
   kinds_this=[]
   for identity,phrase in sorted(targets.items()):
    kind='exact' if phrase['study']==item['study'] else 'normalized-punctuation' if normalized_study(phrase['study'])==normalized_study(item['study']) else 'different-study'
    comparisons.append({'id':item['id'],'targetId':identity,'comparison':kind,'targetStudy':phrase['study']});kinds_this.append(kind)
   duplicate_rows.append({'id':item['id'],'hasExactStudyTarget':'exact' in kinds_this,'comparisons':kinds_this})
 require(len(named)==150 and len(contextual)==67,'Wrong destination counts')
 require(sum(x['hasExactStudyTarget'] for x in duplicate_rows)==28,'Wrong exact duplicate row count')
 groups=docs['conventions-a-decider.json']['groups'];conventions=[x for group in groups.values() for x in group];group_counts={k:len(v) for k,v in groups.items()}
 require(len(conventions)==30,'Wrong convention scope')
 for item in conventions:
  row=primary.get(item['id'],received.get(item['id']));require(row is not None,'Unknown convention identity')
  require(item['stage']=='snapshot-40d4c0b' and row['level']==item['level'] and row['phrase']['study']==item['study'] and row['phrase'][item['field']]==item['before'],'Convention stage/before differs')
  require(item['field'] not in content_fields.get(item['id'],set()) and item['id'] not in ph_ids,'Applied field overlaps open convention')
  local=address(json.loads((ROOT/row['path']).read_text()),row['location'])
  require(local[item['field']]==item['before'],'Unapproved local convention field changed')
 critical_followup={x['id'] for x in phon+gloss['items']+bundles+proposals}
 hidden=[x['id'] for x in coverage['items'] if x['status']=='verifie' and x['id'] in critical_followup]
 require(not hidden,'Verified status hides correction/content/proposal follow-up')
 verified_ids={x['id'] for x in coverage['items'] if x['status']=='verifie'}
 verified_conventions=[x for x in conventions if x['id'] in verified_ids]
 require(not verified_conventions,'Unexpected verified/open-convention intersection')
 structure_paths=[];global_inventory={}
 for pair in ('fr-en','fr-es','fr-it','fr-ja','fr-ko','fr-zh','zh-fr'):
  gp,gr,gpos,_,_,_=snapshot(BASE,pair)
  global_inventory[pair]={'canonical':len(gp),'received':len(gr),'positionCount':len(gpos),'distinctIds':len(set(gp)|set(gr))}
  for level in range(1,11):
   path=DATA+pair+f'/L{level}.json';require(structure(json.loads((ROOT/path).read_text()))==structure(git_json(BASE,path)),'Local structure changed: '+path);structure_paths.append(path)
  path=DATA+'repertoires/'+pair+'.json';require(structure(json.loads((ROOT/path).read_text()))==structure(git_json(BASE,path)),'Local transport structure changed: '+path);structure_paths.append(path)
 tracked=subprocess.check_output(['git','ls-tree','-r','--name-only',BASE,'melunga_deploy','docs/niveaux-progressifs/sources/conversation'],cwd=ROOT,text=True).splitlines()
 assets=[path for path in tracked if path.startswith('melunga_deploy/') and Path(path).parent==Path('melunga_deploy') and Path(path).suffix in ('.html','.css','.js')]
 conversations=[path for path in tracked if path.startswith('docs/niveaux-progressifs/sources/conversation/') and path.endswith('.json')]
 for path in assets+conversations:require((ROOT/path).read_bytes()==git_bytes(BASE,path),'Original UI/catalogue/conversation source changed: '+path)
 require(len(assets)==36 and len(conversations)==7,'Unexpected UI or source inventory')
 return {'baseSnapshotCommit':BASE,'evidenceCommit':LOT,'proofSha256':PINS,'auditScriptSha256':digest(Path(__file__).read_bytes()),'beforeSnapshotFilesSha256':{path:digest(git_bytes(BASE,path)) for path in structure_paths},
  'canonicalPositions':len(primary),'receivedPositions':len(received),'positions':len(positions),'distinctIds':len(by_id),'statusCounts':status_counts,'chunks':{k:len(v) for k,v in by_chunk.items()},'withinLevelAndReceivedOrderExact':True,
  'overlapIds':overlap,'overlapStatuses':{identity:by_id[identity][0]['status'] for identity in overlap},'missingExpectedPositions':0,'extraPositions':0,'verifiedStatusesHidingCorrectionContentOrProposal':hidden,'verifiedStatusesWithOpenConventions':[x['id'] for x in verified_conventions],
  'phonetic':{'aids':len(phon),'receivedOnlyAids':received_phon,'rules':phon_rules,'ruleMemberships':sum(phon_rules.values()),'multipleRuleIds':[x['id'] for x in phon if len(x['rules'])>1],'beforeProfilesExact':True,'readingChanged':False,'runtimeObjects':len(phon)+sum(copy_counts.values()),'canonicalObjects':len(phon)-len(received_phon),'receivedObjects':len(received_phon),'runtimeTransportCopies':dict(copy_counts),'priorCorrectedIds':[x['id'] for x in phon if x['priorCorrection']]},
  'content':{'items':len(gloss['items']),'certainNativeItems':34,'uncertainItems':96,'uncertainDistinctIds':len({x['id'] for x in gloss['items'] if x['certainty']=='incertain'}),'uncertainFields':dict(Counter(x['field'] for x in gloss['items'] if x['certainty']=='incertain')),'documentedUncertainItems':93,'documentaryCountDiscrepancy':'README and message say 93; raw ledger contains 96 uncertain rows on 96 different IDs, with no bundle overlap','atomicBundles':len(bundles),'bundleIds':[x['id'] for x in bundles],'certainReceivedIds':certain_received,'beforeFieldsExact':True,'registryChangedFields':sum(len(v) for v in content_fields.values()),'runtimeTransportCopies':content_copies,'runtimeObjects':len(content_fields)+len(content_copies),'runtimeChangedFields':sum(len(v) for v in content_fields.values())+sum(len(content_fields[identity]) for identity in content_copies),'sharedPhoneticContentIds':sorted(ph_ids&content_ids)},
  'proposals':{'events':len(proposals),'identities':len({x['id'] for x in proposals}),'kinds':kinds,'namedThemeRows':len(named),'contextualNullRows':len(contextual),'destinationTitlesExplicitlyChecked':title_checks,'destinationReferences':named,'duplicateRowsWithExactStudyTarget':sum(x['hasExactStudyTarget'] for x in duplicate_rows),'duplicateComparisons':dict(Counter(x['comparison'] for x in comparisons)),'duplicateTargetReferences':comparisons,'uniqueUndirectedDuplicateComparisonPairs':len({tuple(sorted((x['id'],x['targetId']))) for x in comparisons}),'duplicateWarnings':warnings,'allBeforeFieldsAndCurrentThemesExact':True,'applied':False},
  'conventions':{'events':len(conventions),'identities':len({x['id'] for x in conventions}),'groups':group_counts,'readerCertainty':dict(Counter(x.get('readerCertainty') or 'not-specified' for x in conventions)),'stages':dict(Counter(x['stage'] for x in conventions)),'beforeFieldsExact':True,'localFieldValuesStillBefore':True,'appliedFieldIntersections':[],'contentIdentityOverlap':[x['id'] for x in conventions if x['id'] in content_fields],'applied':False,'groupNamesAreDocumentaryNotLinguisticValidation':True},
  'unchangedLocalStructure':{'levelFiles':70,'repertoireFiles':7,'placementsSequencesSourcesAndRolesUnchanged':True,'uiAssets':len(assets),'localL1ConversationSnapshots':len(conversations),'appSha256':digest((ROOT/'melunga_deploy/app.html').read_bytes()),'freeAccessDefinitionUnchanged':'FREE_LV=[1]; isFreeCard checks the original catalogue lv only'},
  'claudeHumanCoverage':{'cells':70,'totalCells':70,'remainingCells':0,'attribution':'Claude declares individual reading of all 70 cells; this script verifies inventory and statuses, not the cognitive act of reading','globalInventoryAtBefore':global_inventory,'canonicalPositions':sum(x['canonical'] for x in global_inventory.values()),'receivedPositions':sum(x['received'] for x in global_inventory.values()),'pendingIntervocalicS':{'countClaimed':33,'claimedNoCertainStandardItalianSError':True,'claimedStatuses':{'verifie':26,'proposition':4,'incertain':2,'corrigeForNNotS':1},'scopeLimitation':'README and message state these results; source coverage has no per-ID marker linking the 33, so this count is not independently reconstructed here; no blanket s rewrite is applied'}},'generatorImported':False,'productWritten':False,'nativeOrPedagogicalApproval':False}


if __name__=='__main__':print(json.dumps(audit(),ensure_ascii=False,indent=2))

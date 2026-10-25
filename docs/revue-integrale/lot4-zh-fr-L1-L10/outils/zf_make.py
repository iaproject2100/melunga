import sys,json,re,collections,subprocess
sys.path.insert(0,'/tmp/claude-0/-home-claude/be89a11b-450d-53fe-9c0d-7b9f183e8f46/scratchpad/tools')
import build
build.ROOT='/home/claude/edition'
from build import load_cards,BASE,ROOT
from zf_decisions import *
OUT=sys.argv[1]
idx=load_cards('zh-fr')
F=json.load(open('/tmp/claude-0/-home-claude/be89a11b-450d-53fe-9c0d-7b9f183e8f46/scratchpad/lot2/all-findings.json'))
RULES={'T':"aide tronquée : un ou plusieurs mots prononcés n'ont aucun segment",
'L':"liaison obligatoire absente (on‿a, un‿N, vous‿V, mon‿N…)",
'X':"son parasite : fausse liaison, syllabe ou consonne en trop",
'A':"lecture à l'anglaise d'un mot ou d'une lettre (production, bus, B, QR…)",
'R':"aide en lettres latines ou cyrilliques au lieu de caractères chinois",
'G':"« une » rendu comme « un » (安, 团, 战) ou « bonne » comme « bon »/« beau » : le genre change",
'S':"segment qui fait lire un autre mot ou un autre son (consonne perdue, voyelle fausse, finale nasale au lieu d'orale…)"}
def classify(f):
    t=(f.get('reason','')+' '+f.get('alignment','')).lower()
    if re.search(r'lettres? (latines|cyrill)',t): return 'R'
    if 'tronqu' in t or 'aucun segment' in t or 'manque :' in t and 'manquant' in t: return 'T'
    if 'anglais' in t or 'anglaise' in t: return 'A'
    if re.search(r'« ?une ?»|« ?bonne ?»',t) and re.search(r'genre|« un »|masculin|beau|« bon »|nasale',t): return 'G'
    if 'liaison obligatoire' in t or 'liaison [n] absente' in t or ('liaison' in t and 'absente' in t): return 'L'
    if re.search(r'fausse liaison|liaison fautive|en trop|parasite|inexistant|n.existe pas|ajoute',t): return 'X'
    return 'S'
events=[]
def add(id_,rule,before,after,align,reason):
    e=idx[id_];p=e['card']
    assert p['phon']==before,(id_,p['phon'],before); assert before!=after,id_
    r=json.load(open(f"{ROOT}/{BASE}/repertoires/zh-fr.json"))
    events.append({'pair':'zh-fr','id':id_,'level':e['level'],'theme':e['theme'],'rules':[rule],'study':p['study'],'native':p['native'],
      'beforePhon':before,'afterPhon':after,'alignment':align,'reason':reason,
      'occurrence':{'path':e['path'],'location':e['location'],'expectedBefore':{k:p.get(k) for k in ('study','native','phon')}},
      'priorCorrection':bool(p.get('phoneticCorrection')),'transportCopies':sum(1 for q in r['phrases'] if q['id']==id_)})
done=set()
for f in F:
    if f['category']!='phon' or f['certainty']!='certain': continue
    i=f['id']; after=OVERRIDE.get(i,f['after'])
    if i not in OVERRIDE and ' ' not in f['before'] and '，' not in f['before']: after=after.replace(' ','')
    add(i,RULE_OVERRIDE.get(i) or classify(f),f['before'],after,f.get('alignment') or '',f['reason']); done.add(i)
    if i in EXTRA_RULES: events[-1]['rules']=EXTRA_RULES[i]
for i,(r,b,a,al) in EXTRA.items():
    assert i not in done,i
    add(i,r,b,a,al,RULES[r]+' (trouvé par recherche de famille, aligné à la main)')
head=subprocess.check_output(['git','-C',ROOT,'rev-parse','HEAD']).decode().strip()
reg={'id':'revue-claude-lot4-zh-fr','status':'proposed-whole-aid-corrections-for-generator','baseSnapshotCommit':head,
 'scope':'zh-fr L1–L10 (themes[].phrases et reserve[]) et receivedModels du répertoire zh-fr',
 'policy':"avant/après entiers et figés ; aucune règle à étendre ; provenance d'origine inchangée ; un événement sur une carte déjà corrigée s'ajoute après la correction existante",
 'rules':RULES,'eventCount':len(events),'events':sorted(events,key=lambda e:(e['level'] if isinstance(e['level'],int) else 99,e['id']))}
json.dump(reg,open(f'{OUT}/registre-phonetique.json','w'),ensure_ascii=False,indent=1)
print(len(events),collections.Counter(e['rules'][0] for e in events),sum(e['priorCorrection'] for e in events),sum(1 for e in events if e['transportCopies']))

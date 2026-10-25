import sys,json,re,collections,glob,subprocess
sys.path.insert(0,'/tmp/claude-0/-home-claude/be89a11b-450d-53fe-9c0d-7b9f183e8f46/scratchpad/tools')
import build; build.ROOT='/home/claude/edition'
from build import load_cards,ROOT,BASE
OUT='/home/claude/lot5-out'; LOT='/tmp/claude-0/-home-claude/be89a11b-450d-53fe-9c0d-7b9f183e8f46/scratchpad/lot5'
PAIR='fr-ja'
idx=load_cards(PAIR); F=json.load(open(f'{LOT}/all-findings.json'))
head=subprocess.check_output(['git','-C',ROOT,'rev-parse','HEAD']).decode().strip()
rep=json.load(open(f'{ROOT}/{BASE}/repertoires/{PAIR}.json'))
def occ(i):
    e=idx[i];p=e['card'];return {'path':e['path'],'location':e['location'],'expectedBefore':{k:p.get(k) for k in('study','native','reading','phon')}}
PH={'catalogue:ja:3630':('M',"lecture et aide d'un autre mot (食器洗い機) ; 食洗機 se lit shokusenki"),
    'catalogue:ja:3771':('P',"particule に lue et rendue comme へ (e / é)"),
    'catalogue:ja:2400':('M',"more en trop : さよなら n'a pas de voyelle longue (c'est さようなら qui en a une)"),
    'catalogue:ja:4320':('M',"more en trop : ボディ s'écrit sans voyelle longue")}
RULES={'M':'more manquant ou en trop, ou lecture d’un autre mot','P':'particule mal lue'}
ph=[];rd=[]
for f in F:
    if f['certainty']!='certain' or f['id'] not in PH: continue
    i=f['id'];e=idx[i];p=e['card']
    if f['category']=='phon':
        assert p['phon']==f['before'];ph.append({'pair':PAIR,'id':i,'level':e['level'],'rules':[PH[i][0]],'study':p['study'],'reading':p['reading'],'native':p['native'],'beforePhon':f['before'],'afterPhon':f['after'],'alignment':f.get('alignment'),'reason':PH[i][1],'occurrence':occ(i),'priorCorrection':bool(p.get('phoneticCorrection')),'transportCopies':sum(1 for q in rep['phrases'] if q['id']==i)})
    if f['category']=='reading':
        assert p['reading']==f['before'];rd.append({'pair':PAIR,'id':i,'level':e['level'],'field':'reading','study':p['study'],'native':p['native'],'beforeReading':f['before'],'afterReading':f['after'],'reason':PH[i][1],'linkedPhonEvent':True,'occurrence':{'path':e['path'],'location':e['location']}})
json.dump({'id':'revue-claude-lot5-fr-ja','baseSnapshotCommit':head,'policy':'avant/après entiers et figés ; aucune règle à étendre','rules':RULES,'eventCount':len(ph),'events':ph},open(f'{OUT}/registre-phonetique.json','w'),ensure_ascii=False,indent=1)
json.dump({'id':'revue-claude-lot5-fr-ja-lectures','baseSnapshotCommit':head,'note':'chaque lecture corrigée a son aide liée dans registre-phonetique.json','eventCount':len(rd),'events':rd},open(f'{OUT}/registre-lectures.json','w'),ensure_ascii=False,indent=1)
DOWN={'catalogue:ja:652':"です neutre-poli : le tutoiement reste défendable dans une appli ; à harmoniser avec la politique de registre",
      'catalogue:ja:1734':"補足 « ajouter une précision » est juste ; le tutoiement relève de la politique de registre",
      'catalogue:ja:4135':"infinitif : entrée de type dictionnaire, choix de présentation plutôt que faux sens",
      'catalogue:ja:4209':"infinitif : entrée de type dictionnaire, choix de présentation plutôt que faux sens"}
TH={}
for L in range(1,11):
    d=json.load(open(f'{ROOT}/{BASE}/{PAIR}/L{L}.json')); TH[L]={t['id']:t['title'] for t in d['themes']}
status={};corr={e['id'] for e in ph}
def note(i,s):
    o=['verifie','incertain','proposition','glose-a-corriger','corrige']
    if o.index(s)>o.index(status.get(i,'verifie')): status[i]=s
content=[];props=[];conv=[]
for f in F:
    i=f['id'];c=f['category'];cert=f['certainty'];e=idx[i];L=e['level']
    if c in('phon','reading'):
        if i in corr: note(i,'corrige')
        else: conv.append({'id':i,'level':L,'field':c,'study':e['card']['study'],'before':f['before'],'proposed':f['after'],'reason':f['reason'],'stage':f'snapshot-{head[:7]}'}); note(i,'incertain')
    elif c in('native','study'):
        reason=f['reason']
        if i in DOWN and cert=='certain': cert='incertain'; reason+=' — Déclassé : '+DOWN[i]
        content.append({'id':i,'level':L,'field':c,'certainty':cert,'study':e['card']['study'],'before':f['before'],'after':f['after'],'reason':reason})
        note(i,'glose-a-corriger' if cert=='certain' else 'incertain')
    else:
        dest=f['after'] or '';ok=None
        if c=='theme' and 'contextualiser' not in dest:
            m=re.match(r'(L\d+-[\w-]+|[a-z]+)\b',dest);tid=m.group(1) if m else None;ok=bool(L in TH and tid in TH[L])
        props.append({'id':i,'level':L,'theme':e['theme'],'themeTitle':e['themeTitle'],'kind':c,'readerCertainty':cert,'study':e['card']['study'],'native':e['card']['native'],'current':f['before'],'proposed':dest,'destinationExistsAtSameLevel':ok,'reason':f['reason']})
        note(i,'proposition')
for i in corr: status[i]='corrige'
cov=[]
for fn in sorted(glob.glob(f'{LOT}/results/*.json')):
    r=json.load(open(fn));name=fn.split('/')[-1][:-5]
    for i in r['readIds']: cov.append({'id':i,'chunk':name,'status':status.get(i,'verifie')})
json.dump({'reference':head,'certainCount':sum(1 for x in content if x['certainty']=='certain'),'items':content},open(f'{OUT}/lot-contenu-gloses.json','w'),ensure_ascii=False,indent=1)
json.dump({'reference':head,'note':"propositions non appliquées ; destinationExistsAtSameLevel : true/false pour un thème nommé, null pour « à contextualiser », les niveaux et les doublons",'items':props},open(f'{OUT}/propositions-niveaux-themes.json','w'),ensure_ascii=False,indent=1)
json.dump({'reference':head,'note':'aides ou lectures discutables, rien n’est changé','items':conv},open(f'{OUT}/conventions-a-decider.json','w'),ensure_ascii=False,indent=1)
cnt=collections.Counter(c['status'] for c in cov)
json.dump({'reference':head,'counts':dict(cnt),'total':len(cov),'distinctIds':len({c['id'] for c in cov}),'note':'un statut principal par position ; une carte peut avoir un autre suivi ailleurs','items':cov},open(f'{OUT}/couverture.json','w'),ensure_ascii=False,indent=1)
print(len(ph),len(rd),dict(cnt),len(cov),len({c['id'] for c in cov}))
print('contenu',len(content),sum(1 for x in content if x['certainty']=='certain'))
print('props',collections.Counter((p['kind'],p['destinationExistsAtSameLevel']) for p in props),len(conv))

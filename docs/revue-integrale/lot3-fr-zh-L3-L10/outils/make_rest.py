import sys,json,re,collections
sys.path.insert(0,'/tmp/claude-0/-home-claude/be89a11b-450d-53fe-9c0d-7b9f183e8f46/scratchpad/tools')
from build import *
from decisions import *
OUT=sys.argv[1]
idx=load_cards('fr-zh')
F=json.load(open('/tmp/claude-0/-home-claude/be89a11b-450d-53fe-9c0d-7b9f183e8f46/scratchpad/lot1/all-findings.json'))
reg=json.load(open(f'{OUT}/registre-phonetique.json'))
corr_phon={e['id'] for e in reg['events']}
# themes per level
TH={}
for L in range(1,11):
    d=json.load(open(f'{ROOT}/{BASE}/fr-zh/L{L}.json'))
    TH[L]={t['id']:t['title'] for t in d['themes']}
# gloss/study decisions: agent certainty, with my overrides
DOWN={'catalogue:zh:497'}  # pragmatique : « Tu m'as fait peur » reste possible
content=[];levels=[];conv=collections.defaultdict(list);status={}
def note(i,s):
    order=['verifie','incertain','proposition','glose-a-corriger','corrige']
    if order.index(s)>order.index(status.get(i,'verifie')): status[i]=s
CONVKEY=[(r'lǜ|lü|律|虑|率|绿|ü → u|lou','lü rendu « lou » ou « lu »'),
 (r'dz/ts|z rendu|« ts »|tseou|tsao|tsouo|tsong|tseu','initiale z rendue « ts » hors de 在/怎'),
 (r'x rendu|« s »|siang|sia|sié|siène|sing','initiale x rendue « s » (aides d’ancien style)'),
 (r'儿|érisation|-j|houèï-j','érisation 儿 (pinyin sans r, syllabe « er » séparée, « -j » final)'),
 (r'i-eou','有 écrit « i-eou »'),(r'deou','都 écrit « deou »'),(r'hou »|\bhou\b','后 hòu écrit « hou »'),
 (r'houé','回 écrit « houé »'),(r'sigle|YKK|EN71','sigles CE/EN71/YKK'),(r'pann|pan','-n final écrit « n » simple')]
for f in F:
    i=f['id']; c=f['category']; cert=f['certainty']
    if c in ('phon','reading'):
        if c=='phon' and i in corr_phon: note(i,'corrige'); continue
        if c=='reading' and i in READING: note(i,'corrige'); continue
        txt=f"{f.get('before','')} {f.get('alignment','')} {f.get('reason','')}"
        key=next((k for rx,k in CONVKEY if re.search(rx,txt)),'autre')
        conv[key].append({'id':i,'level':idx[i]['level'] if i in idx else None,'field':c,'study':idx[i]['card']['study'] if i in idx else None,
             'before':f['before'],'proposed':f['after'],'alignment':f.get('alignment'),'readerCertainty':cert,'reason':f['reason']})
        note(i,'incertain')
    elif c in ('native','study'):
        cc='certain' if cert=='certain' and i not in DOWN else 'incertain'
        content.append({'id':i,'level':idx[i]['level'] if i in idx else None,'field':c,'certainty':cc,'study':idx[i]['card']['study'] if i in idx else None,
            'before':f['before'],'after':f['after'],'reason':f['reason']})
        note(i,'glose-a-corriger' if cc=='certain' else 'incertain')
    elif c in ('level','theme','duplicate'):
        e=idx.get(i); L=e['level'] if e else None
        dest=f['after']; ok=None
        if c=='theme':
            m=re.match(r'(L\d+-[\w-]+|[a-z]+)\b',dest or '')
            tid=m.group(1) if m else None
            ok = 'à contextualiser' in (dest or '') or (L in TH and tid in TH[L])
        levels.append({'id':i,'level':L,'theme':e['theme'] if e else None,'themeTitle':e['themeTitle'] if e else None,'kind':c,
            'readerCertainty':cert,'study':e['card']['study'] if e else None,'native':e['card']['native'] if e else None,
            'current':f['before'],'proposed':dest,'destinationExistsAtSameLevel':ok,'reason':f['reason']})
        note(i,'proposition')
for k in READING: note(k,'corrige')
for e in reg['events']: status[e['id']]='corrige'
# coverage over all read ids
txtdir='/tmp/claude-0/-home-claude/be89a11b-450d-53fe-9c0d-7b9f183e8f46/scratchpad/lot1'
import glob
cov=[]
for fn in sorted(glob.glob(f'{txtdir}/results/*.json')):
    r=json.load(open(fn)); name=fn.split('/')[-1][:-5]
    for i in r['readIds']:
        cov.append({'id':i,'chunk':name,'status':status.get(i,'verifie')})
extra=[e['id'] for e in reg['events'] if e['id'] not in {c['id'] for c in cov}]
for i in extra: cov.append({'id':i,'chunk':'hors-lot (L1–L2 fr-zh relus pour les familles E/G, ou zh-fr reçus)','status':'corrige'})
json.dump({'reference':reg['baseSnapshotCommit'],'certainCount':sum(1 for c in content if c['certainty']=='certain'),'items':content},open(f'{OUT}/lot-contenu-gloses.json','w'),ensure_ascii=False,indent=1)
json.dump({'reference':reg['baseSnapshotCommit'],'note':"propositions des lecteurs ; destination vérifiée comme thème réel du même niveau, l'acte de parole reste à arbitrer ; rien n'est appliqué",'items':levels},open(f'{OUT}/propositions-niveaux-themes.json','w'),ensure_ascii=False,indent=1)
json.dump({'reference':reg['baseSnapshotCommit'],'note':'conventions non tranchées : aucune correction appliquée','groups':{k:v for k,v in sorted(conv.items())}},open(f'{OUT}/conventions-a-decider.json','w'),ensure_ascii=False,indent=1)
cnt=collections.Counter(c['status'] for c in cov)
json.dump({'reference':reg['baseSnapshotCommit'],'statusLegend':{'verifie':'relu, sans changement','corrige':'aide ou pinyin corrigé dans les registres','glose-a-corriger':'glose ou chinois à corriger (lot de contenu séparé)','proposition':'proposition de niveau ou de thème, non appliquée','incertain':'doute documenté, convention ou contexte à décider'},
  'counts':dict(cnt),'total':len(cov),'items':cov},open(f'{OUT}/couverture.json','w'),ensure_ascii=False,indent=1)
print(dict(cnt),len(cov))
print({k:len(v) for k,v in conv.items()})
print('contenu',len(content),sum(1 for c in content if c['certainty']=='certain'))
print('niveaux/themes',len(levels),collections.Counter((l['kind'],l['destinationExistsAtSameLevel']) for l in levels))

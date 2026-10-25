import sys,json,re,collections,glob
sys.path.insert(0,'/tmp/claude-0/-home-claude/be89a11b-450d-53fe-9c0d-7b9f183e8f46/scratchpad/tools')
import build; build.ROOT='/home/claude/edition'
from build import load_cards,ROOT,BASE
from zf_decisions import BUNDLES,DOWNGRADE_NATIVE
OUT=sys.argv[1]; LOT='/tmp/claude-0/-home-claude/be89a11b-450d-53fe-9c0d-7b9f183e8f46/scratchpad/lot2'
idx=load_cards('zh-fr'); F=json.load(open(f'{LOT}/all-findings.json'))
reg=json.load(open(f'{OUT}/registre-phonetique.json'))
for e in reg['events']:
    if e['id']=='catalogue:fr:497': e['reason']="« une » rendu 团, le rendu de « un » nasal (genre perdu) ; et 勒尔 fait entendre « l'heure ». Après : 迪 讷尔 [ty.nœʁ]."
    if e['id']=='catalogue:fr:1870': e['reason']="赞 fait entendre une liaison en [z] inexistante ; après le pronom inversé « peut-on », la liaison n'est pas obligatoire et n'est pas notée."
    if e['id'] in ('catalogue:fr:971','catalogue:fr:2426','catalogue:fr:2439','catalogue:fr:2581','catalogue:fr:1451'): e['reason']+=" — Le rendu 维 rétablit le [v] mais pas le [y] : la graphie de [vy] reste une convention à décider (voir conventions-a-decider.json)."
    if e['id']=='catalogue:fr:517': e['reason']="坦 fait entendre une liaison en [t] qui n'existe pas ; la liaison vais‿imprimer est facultative et n'est pas notée."
json.dump(reg,open(f'{OUT}/registre-phonetique.json','w'),ensure_ascii=False,indent=1)
corr={e['id'] for e in reg['events']}
TH={}
for L in range(1,11):
    d=json.load(open(f'{ROOT}/{BASE}/zh-fr/L{L}.json')); TH[L]={t['id']:t['title'] for t in d['themes']}
status={}
def note(i,s):
    order=['verifie','incertain','proposition','glose-a-corriger','corrige']
    if order.index(s)>order.index(status.get(i,'verifie')): status[i]=s
content=[];levels=[];conv=collections.defaultdict(list)
G=[(r'liaison','liaison facultative ou à confirmer'),(r'\bl\b final|le l final|le \[l\]|« ?l ?» final','consonne finale (l, t, s) non rendue'),
   (r'nasale|orale','voyelle nasale ou orale'),(r'\[v\]|le v |sans le v|f\b','consonne v/f perdue'),(r'sigle|lettre','sigles et lettres'),(r'.','autres aides à confirmer')]
for f in F:
    i=f['id']; c=f['category']; cert=f['certainty']; e=idx.get(i); L=e['level'] if e else None
    if c=='phon':
        if i in corr: note(i,'corrige'); continue
        txt=f.get('reason','')+' '+f.get('alignment','')
        k=next(k for rx,k in G if re.search(rx,txt))
        conv[k].append({'id':i,'level':L,'study':e['card']['study'],'before':f['before'],'proposed':f['after'],'alignment':f.get('alignment'),'reason':f['reason']})
        note(i,'incertain')
    elif c in('native','study'):
        if i in BUNDLES: continue
        if i in DOWNGRADE_NATIVE and c=='native': cert='incertain'; f['reason']=f['reason']+' — '+DOWNGRADE_NATIVE[i]
        content.append({'id':i,'level':L,'field':c,'certainty':cert,'study':e['card']['study'],'before':f['before'],'after':f['after'],'reason':f['reason']})
        note(i,'glose-a-corriger' if cert=='certain' else 'incertain')
    else:
        dest=f['after'] or ''; ok=None
        if c=='theme' and 'contextualiser' not in dest:
            m=re.match(r'(L\d+-[\w-]+|[a-z]+)\b',dest); tid=m.group(1) if m else None
            ok = bool(L in TH and tid in TH[L])
        levels.append({'id':i,'level':L,'theme':e['theme'] if e else None,'themeTitle':e['themeTitle'] if e else None,'kind':c,'readerCertainty':cert,
          'study':e['card']['study'] if e else None,'native':e['card']['native'] if e else None,'current':f['before'],'proposed':dest,'destinationExistsAtSameLevel':ok,'reason':f['reason']})
        note(i,'proposition')
for i in BUNDLES: note(i,'glose-a-corriger')
for i in corr: status[i]='corrige'
cov=[]
for fn in sorted(glob.glob(f'{LOT}/results/*.json')):
    r=json.load(open(fn)); name=fn.split('/')[-1][:-5]
    for i in r['readIds']: cov.append({'id':i,'chunk':name,'status':status.get(i,'verifie')})
ref=reg['baseSnapshotCommit']
bl=[dict(id=i,level=idx[i]['level'],certainty='certain',applyTogether=True,**v) for i,v in BUNDLES.items()]
json.dump({'reference':ref,'certainCount':sum(1 for x in content if x['certainty']=='certain'),'items':content,'linkedBundles':bl},open(f'{OUT}/lot-contenu-gloses.json','w'),ensure_ascii=False,indent=1)
json.dump({'reference':ref,'note':"propositions des lecteurs, non appliquées ; destinationExistsAtSameLevel : true si le thème nommé existe au même niveau, false sinon, null pour « à contextualiser » et pour les niveaux/doublons",'items':levels},open(f'{OUT}/propositions-niveaux-themes.json','w'),ensure_ascii=False,indent=1)
json.dump({'reference':ref,'note':'aides lisibles ou doutes de convention : aucune correction appliquée','groups':dict(sorted(conv.items()))},open(f'{OUT}/conventions-a-decider.json','w'),ensure_ascii=False,indent=1)
cnt=collections.Counter(c['status'] for c in cov)
json.dump({'reference':ref,'statusLegend':{'verifie':'relu, sans changement','corrige':'aide corrigée dans le registre','glose-a-corriger':'glose ou phrase à corriger (lot de contenu séparé)','proposition':'niveau, thème ou doublon à reconsidérer, non appliqué','incertain':'doute documenté'},
 'note':"un statut principal par position ; une carte peut avoir aussi un suivi dans un autre fichier (ex. aide corrigée et glose à revoir)",'counts':dict(cnt),'total':len(cov),'distinctIds':len({c['id'] for c in cov}),'items':cov},open(f'{OUT}/couverture.json','w'),ensure_ascii=False,indent=1)
print(dict(cnt),len(cov),len({c['id'] for c in cov}))
print({k:len(v) for k,v in conv.items()})
print('contenu',len(content),sum(1 for x in content if x['certainty']=='certain'),'+bundles',len(bl))
print('props',collections.Counter((l['kind'],l['destinationExistsAtSameLevel']) for l in levels))

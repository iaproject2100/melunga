import sys,json,re,collections,glob,subprocess
sys.path.insert(0,'/tmp/claude-0/-home-claude/be89a11b-450d-53fe-9c0d-7b9f183e8f46/scratchpad/tools')
import build; build.ROOT='/home/claude/edition'
from build import load_cards,ROOT,BASE
OUT='/home/claude/lot6-out'; LOT='/tmp/claude-0/-home-claude/be89a11b-450d-53fe-9c0d-7b9f183e8f46/scratchpad/lot6'; PAIR='fr-ko'
idx=load_cards(PAIR); F=json.load(open(f'{LOT}/all-findings.json'))
head=subprocess.check_output(['git','-C',ROOT,'rev-parse','HEAD']).decode().strip()
rep=json.load(open(f'{ROOT}/{BASE}/repertoires/{PAIR}.json'))
RULES={'R':"lettres de romanisation laissées dans l'aide (eo, j de 앉, u de 휴) alors que le deck les convertit ailleurs, L1 compris",
       'S':"syllabe ou consonne perdue ou ajoutée (ㄹ de 닭, 스 d'ABS/ASTM, « reul » après QR)"}
CERT_PH={'conversation:L1-fr-ko.json:L1-fr-ko-01:v1':'R','conversation:L1-fr-ko.json:L1-fr-ko-09:v0':'R',
 'catalogue:ko:2075':'R','catalogue:ko:313':'R','catalogue:ko:2712':'R','catalogue:ko:822':'R','catalogue:ko:1474':'R','catalogue:ko:1968':'R',
 'situation-authored:fr-ko:numerique-quotidien-01':'R','situation-authored:fr-ko:piste-recuperer-compte-06':'R','situation-authored:fr-ko:piste-incident-objet-07':'R','heard-authored:fr-ko:piste-incident-objet-received-01':'R',
 'catalogue:ko:3766':'S','catalogue:ko:3980':'S','catalogue:ko:4125':'S','catalogue:ko:4341':'S','catalogue:ko:4271':'S','catalogue:ko:4391':'S'}
CERT_RD={'catalogue:ko:3766','catalogue:ko:3980','catalogue:ko:4125','catalogue:ko:4341','catalogue:ko:4391'}
BUNDLES={
 'catalogue:ko:2362':{'before':{'study':'최악의 경우에요.','reading':'choe-ak-ui gyeong-u-e-yo','phon':'tchoué-ak-eui guyong-ou-é-yo'},
   'after':{'study':'최악의 경우예요.','reading':'choe-ak-ui gyeong-u-ye-yo','phon':'tchoué-ak-eui guyong-ou-yé-yo'},
   'reason':"après une voyelle, la copule s'écrit -예요 : 경우에요 est une faute d'orthographe. Étude, lecture et aide changent ensemble ; la glose « Au pire. » reste (incertitude séparée sur son sens exact)."},
 'catalogue:ko:1896':{'before':{'study':'예를 들면 오자마자 모두 것을 주문한다니까요.','reading':'ye-reul deul-myeon o-ja-ma-ja mo-du geos-eul ju-mun-han-da-ni-kka-yo','phon':'yé-reul deul-myon o-dja-ma-dja mo-dou got-eul djou-moun-han-da-ni-kka-yo'},
   'after':{'study':'예를 들면 오자마자 모두의 것을 주문한다니까요.','reading':'ye-reul deul-myeon o-ja-ma-ja mo-du-ui geos-eul ju-mun-han-da-ni-kka-yo','phon':'yé-reul deul-myon o-dja-ma-dja mo-dou-é got-eul djou-moun-han-da-ni-kka-yo'},
   'reason':"« 모두 것을 » est agrammatical : 모두의 것을. Le génitif 의 se dit [에] ici ; seuls les segments de 모두의 changent."}}
for i,b in BUNDLES.items():
    p=idx[i]['card']
    for k,v in b['before'].items(): assert p[k]==v,(i,k,p[k])
ph=[];rd=[]
for f in F:
    if f['certainty']!='certain': continue
    i=f['id'];e=idx.get(i)
    if f['category']=='phon' and i in CERT_PH:
        p=e['card'];assert p['phon']==f['before'],i
        ph.append({'pair':PAIR,'id':i,'level':e['level'],'rules':[CERT_PH[i]],'study':p['study'],'reading':p.get('reading'),'native':p['native'],'beforePhon':f['before'],'afterPhon':f['after'],'alignment':f.get('alignment'),'reason':f['reason'],
          'occurrence':{'path':e['path'],'location':e['location'],'expectedBefore':{k:p.get(k) for k in('study','native','reading','phon')}},'priorCorrection':bool(p.get('phoneticCorrection')),'transportCopies':sum(1 for q in rep['phrases'] if q['id']==i)})
    if f['category']=='reading' and i in CERT_RD:
        p=e['card'];assert p['reading']==f['before'],i
        rd.append({'pair':PAIR,'id':i,'level':e['level'],'field':'reading','study':p['study'],'beforeReading':f['before'],'afterReading':f['after'],'reason':f['reason'],'linkedPhonEvent':True,'occurrence':{'path':e['path'],'location':e['location']}})
assert {e['id'] for e in ph}==set(CERT_PH),set(CERT_PH)-{e['id'] for e in ph}
json.dump({'id':'revue-claude-lot6-fr-ko','baseSnapshotCommit':head,'policy':'avant/après entiers et figés ; aucune règle à étendre','rules':RULES,'eventCount':len(ph),'events':ph},open(f'{OUT}/registre-phonetique.json','w'),ensure_ascii=False,indent=1)
json.dump({'id':'revue-claude-lot6-fr-ko-lectures','baseSnapshotCommit':head,'eventCount':len(rd),'events':rd},open(f'{OUT}/registre-lectures.json','w'),ensure_ascii=False,indent=1)
G=[(r'같이|palatal|닫|붙이|batchim|liaison|myoch|kkoch|dolb|ilg|ilh|lh|mat-a|groupe|ㄼ|ㅊ final|romanisation','batchim écrit selon l’orthographe (liaison, palatalisation, ㅊ final, groupes doubles)'),
   (r'nasal|assimil|latéral|ㄴ','nasalisation et assimilations non rendues'),
   (r'tch|ddj|ㅈ|ㅉ|dj','consonnes ㅈ/ㅉ/ㅊ, surtout dans les cartes de situation'),
   (r'aspir|ph|kh|th|ㅎ','aspiration (h, ph, kh, th)'),(r'의|희|eui','의 et 희'),(r'.','autres aides à confirmer')]
TH={}
for L in range(1,11):
    d=json.load(open(f'{ROOT}/{BASE}/{PAIR}/L{L}.json')); TH[L]={t['id']:t['title'] for t in d['themes']}
status={};corr={e['id'] for e in ph}|set(BUNDLES)
def note(i,s):
    o=['verifie','incertain','proposition','glose-a-corriger','corrige']
    if o.index(s)>o.index(status.get(i,'verifie')): status[i]=s
content=[];props=[];conv=collections.defaultdict(list)
for f in F:
    i=f['id'];c=f['category'];cert=f['certainty'];e=idx[i];L=e['level']
    if c in('phon','reading'):
        if i in corr and (i in CERT_PH or i in CERT_RD): note(i,'corrige'); continue
        txt=f['reason']+' '+(f.get('alignment') or '')+' '+f['before']
        k=next(k for rx,k in G if re.search(rx,txt))
        conv[k].append({'id':i,'level':L,'field':c,'study':e['card']['study'],'before':f['before'],'proposed':f['after'],'readerCertainty':cert,'reason':f['reason'],'stage':f'snapshot-{head[:7]}'})
        note(i,'incertain')
    elif c in('native','study'):
        if i in BUNDLES and c=='study': continue
        content.append({'id':i,'level':L,'field':c,'certainty':cert,'study':e['card']['study'],'before':f['before'],'after':f['after'],'reason':f['reason']})
        note(i,'glose-a-corriger' if cert=='certain' else 'incertain')
    else:
        dest=f['after'] or '';ok=None
        if c=='theme' and 'contextualiser' not in dest:
            m=re.match(r'(L\d+-[\w-]+|[a-z]+)\b',dest);tid=m.group(1) if m else None;ok=bool(L in TH and tid in TH[L])
        props.append({'id':i,'level':L,'theme':e['theme'],'themeTitle':e['themeTitle'],'kind':c,'readerCertainty':cert,'study':e['card']['study'],'native':e['card']['native'],'current':f['before'],'proposed':dest,'destinationExistsAtSameLevel':ok,'reason':f['reason']})
        note(i,'proposition')
for i in BUNDLES: note(i,'glose-a-corriger')
for i in {e['id'] for e in ph}: status[i]='corrige'
cov=[]
for fn in sorted(glob.glob(f'{LOT}/results/*.json')):
    r=json.load(open(fn));name=fn.split('/')[-1][:-5]
    for i in r['readIds']: cov.append({'id':i,'chunk':name,'status':status.get(i,'verifie')})
bl=[dict(id=i,level=idx[i]['level'],certainty='certain',applyTogether=True,**v) for i,v in BUNDLES.items()]
json.dump({'reference':head,'certainCount':sum(1 for x in content if x['certainty']=='certain'),'items':content,'linkedBundles':bl},open(f'{OUT}/lot-contenu-gloses.json','w'),ensure_ascii=False,indent=1)
json.dump({'reference':head,'note':"propositions non appliquées ; destinationExistsAtSameLevel : true/false pour un thème nommé, null sinon",'items':props},open(f'{OUT}/propositions-niveaux-themes.json','w'),ensure_ascii=False,indent=1)
json.dump({'reference':head,'note':"aides lisibles, systématiques ou discutables ; rien n'est changé. Les lignes classées « certain » par un lecteur ici reproduisent une convention présente dans le L1 du deck lui-même : la décision est d'ensemble.",'groups':dict(sorted(conv.items()))},open(f'{OUT}/conventions-a-decider.json','w'),ensure_ascii=False,indent=1)
cnt=collections.Counter(c['status'] for c in cov)
json.dump({'reference':head,'counts':dict(cnt),'total':len(cov),'distinctIds':len({c['id'] for c in cov}),'note':'un statut principal par position ; une carte peut avoir un autre suivi ailleurs','items':cov},open(f'{OUT}/couverture.json','w'),ensure_ascii=False,indent=1)
print(len(ph),len(rd),dict(cnt),len(cov),len({c['id'] for c in cov}))
print('contenu',len(content),sum(1 for x in content if x['certainty']=='certain'),'bundles',len(bl))
print('props',collections.Counter((p['kind'],p['destinationExistsAtSameLevel']) for p in props))
print({k:len(v) for k,v in conv.items()})

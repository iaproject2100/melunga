import sys,json,re,collections,glob,subprocess
sys.path.insert(0,'/tmp/claude-0/-home-claude/be89a11b-450d-53fe-9c0d-7b9f183e8f46/scratchpad/tools')
import build; build.ROOT='/home/claude/edition'
from build import load_cards,ROOT,BASE
OUT='/home/claude/lot8-out'; LOT='/tmp/claude-0/-home-claude/be89a11b-450d-53fe-9c0d-7b9f183e8f46/scratchpad/lot8'; PAIR='fr-es'
idx=load_cards(PAIR); F=json.load(open(f'{LOT}/all-findings.json'))
head=subprocess.check_output(['git','-C',ROOT,'rev-parse','HEAD']).decode().strip()
rep=json.load(open(f'{ROOT}/{BASE}/repertoires/{PAIR}.json'))
def rid(s):
    m=[i for i in idx if i==s or i.endswith(':'+s) or i.endswith(s)]
    assert len(m)==1,(s,m); return m[0]
RULES={
 'G':"g dur des passés en -gué/-guí écrit GÉ/GI, que le francophone lit [ʒ] → GUÉ/GUI (même défaut que la règle B, cas non couverts)",
 'R':"rr écrit avec un seul r là où cela fait lire un autre mot espagnol (perros/peros, barra/vara, parra/para, corro/coro, cerros/ceros, cerré/seré, cerremos/seremos) ; les autres r simples restent une convention à décider",
 'S':"sigle ou nombre sans segment, tronqué ou laissé en lettres que le francophone lit à la française → épelé à l'espagnole ou écrit en toutes lettres",
 'A':"accent tonique ou découpage faux : euros (diphtongue eu), tíquet, audioguía (tilde sur í), continuar, anglicismes en -ing (KINR)",
 'T':"faute de frappe : u de jueves écrit u (lu [y]), check-out écrit OOUT",
}
R=[
 *[(s,'G',[(o,n)]) for s,o,n in [('es:712','pa-GÉ','pa-GUÉ'),('es:787','tré-GÉ','tré-GUÉ'),('es:1219','yé-GÉ','yé-GUÉ'),('es:3776','yé-GÉ','yé-GUÉ'),('es:1382','pa-GÉ','pa-GUÉ'),('es:3838','sé-GI','sé-GUI'),('es:1652','pa-GÉ','pa-GUÉ'),('es:1783','sé-GI','sé-GUI'),('es:4202','rou-GÉ','rou-GUÉ'),('es:4375','riés-GÉ','riés-GUÉ'),('es:4392','kar-GÉ','kar-GUÉ')]],
 *[(s,'R',[(o,n)]) for s,o,n in [('es:3806','PÉ-ros','PÉ-rros'),('es:1497','PÉ-ros','PÉ-rros'),('es:1730','BA-ra','BA-rra'),('es:2732','BA-ras','BA-rras'),('es:4443','PA-ra','PA-rra'),('es:619','KO-ro','KO-rro'),('es:4255','SÉ-ros','SÉ-rros'),('es:1176','sé-RÉ','sé-RRÉ'),('es:2352','sé-RÉ-mos','sé-RRÉ-mos'),('es:2904','sé-RÉ-mos','sé-RRÉ-mos')]],
 ('es:4563','T',[('RUÉ-bés','ROUÉ-bés')]),('es:2452','T',[('OOUT','A-OUT')]),
 ('es:2295','A',[('é-OU-ros','ÉOU-ros')]),('es:2491','A',[('é-OU-ros','ÉOU-ros')]),('es:2233','A',[('tik-KÉT','TI-két')]),
 ('es:673','A',[('a-ou-DIO-gui-a','a-ou-dio-GUI-a')]),('piste-depannage-connexion-received-02','A',[('konn-ti-NOU-ar','konn-ti-NOUAR')]),
 ('es:1258','A',[('par-KINR','PAR-kinn')]),('es:2774','A',[('drop-sip-PINR','DROP-chi-pinn')]),('es:3159','A',[('trak-KINR','TRA-kinn')]),('es:3199','A',[('pak-KINR','PA-kinn')]),
 *[(s,'S',[(o,n)]) for s,o,n in [('es:1148','SÉ','SÉ É'),('es:2764','SÉ','SÉ É'),('es:2831','SÉ','SÉ É'),('es:2887','SÉ','SÉ É'),('es:3049','SÉ','SÉ É'),('es:3270','SÉ y','SÉ É y'),
   ('es:2819','B L','BÉ É-lé'),('es:3245','B L','BÉ É-lé'),('es:4361','B L','BÉ É-lé'),('es:3073','L S','É-lé SÉ'),('es:3140','PDF','PÉ DÉ É-fé'),('es:1726','ABS','a-bé É-sé'),('es:2188','T T','TÉ TÉ'),
   ('es:1971','KR','kou-É-rré'),('es:2040','FKS','É-fé sé SÉ'),('es:2256','DL','dé A-tché É-lé'),('es:2879','dé DL','dé dé A-tché É-lé'),('es:2523','S KO-dé','A-tché É-sé KO-dé'),('es:2840','S KO-dé','A-tché É-sé KO-dé'),
   ('es:2387','KBM','sé bé É-mé'),('es:2421','ODM','o dé É-mé'),('es:2883','ODM','o dé É-mé'),('es:2427','MDF','É-mé dé É-fé'),
   ('es:2205','NOR-ma én','NOR-ma é-né sé-TÉN-ta i OU-no'),('es:4426','KA-da é','KA-da é OU-no'),('es:2425','kon BOL','kon dos-SIÉN-tos BÉÏN-té BOL'),
   ('es:2825','él por','él TRÉÏN-ta por SIÉN-to por'),('es:2972','dé PIÉS','dé koua-RÉN-ta PIÉS'),('es:3215','dé PIÉS','dé BÉÏN-té PIÉS'),('es:4247','dé DI-as','dé TRÉÏN-ta DI-as'),
   ('es:3418','dé a-dé-LAN-to AN-tés','TRÉÏN-ta por SIÉN-to dé a-dé-LAN-to sé-TÉN-ta por SIÉN-to AN-tés')]],
]
edits=collections.OrderedDict()
for s,rule,subs in R:
    i=rid(s); p=idx[i]['card']; cur=edits.get(i,{'phon':p['phon'],'rules':[]})
    for o,n in subs:
        assert cur['phon'].count(o)>=1,(i,o,cur['phon']); cur['phon']=cur['phon'].replace(o,n,1)
    if rule not in cur['rules']: cur['rules'].append(rule)
    edits[i]=cur
FB=collections.defaultdict(list)
for f in F:
    if f['category']=='phon': FB[f['id']].append(f)
BUNDLES={
 'catalogue:es:1340':({'study':'¿Me lo pone para llevar?','native':'Vous me le mettez à emporter ?','phon':'mé lo PO-né PA-ra yé-BAR'},"« me lo pongo » veut dire « je me le mets » (un vêtement) ; pour un plat à emporter : « ¿Me lo pone para llevar? »."),
 'catalogue:es:2727':({'study':'¿Cuánto tarda en llegar a España?','phon':'KOUAN-to TAR-da én yé-GAR a és-PA-nya'},"« tardar a » n'est pas grammatical : « tardar en llegar a ». La glose reste juste."),
 'catalogue:es:3186':({'study':'Necesito ver un vídeo de la línea.','phon':'né-sé-SSI-to BÉR oun BI-dé-o dé la LI-né-a'},"le nom comptable « vídeo » demande un déterminant ; la glose « une vidéo » le donne déjà."),
}
for i in BUNDLES: assert i not in edits,i
ph=[]
for i,ed in edits.items():
    e=idx[i];p=e['card']
    assert ed['phon']!=p['phon'],i
    fs=FB.get(i,[])
    ph.append({'pair':PAIR,'id':i,'level':e['level'],'rules':ed['rules'],'study':p['study'],'native':p['native'],'beforePhon':p['phon'],'afterPhon':ed['phon'],
      'alignment':(fs[0].get('alignment') if fs else None),'reason':' ; '.join(RULES[r].split(' : ')[0].split(' (')[0] for r in ed['rules']),'readerFinding':bool(fs),
      'occurrence':{'path':e['path'],'location':e['location'],'expectedBefore':{k:p.get(k) for k in('study','native','phon')}},'priorCorrection':bool(p.get('phoneticCorrection')),'transportCopies':sum(1 for q in rep['phrases'] if q['id']==i)})
json.dump({'id':'revue-claude-lot8-fr-es','baseSnapshotCommit':head,'policy':'avant/après entiers et figés ; aucune règle à étendre','rules':RULES,'eventCount':len(ph),'events':ph},open(f'{OUT}/registre-phonetique.json','w'),ensure_ascii=False,indent=1)
NAT={'douleur-simple-support-02':'l\'estomac','situation-authored:fr-es:piste-sport-habitudes-04':'Chaque entraînement dure une demi-heure.','es:999':'ne fais pas trop confiance','situation-authored:fr-es:piste-incident-objet-03':'Je l’ai posé sur la table.',
 'es:1738':'Je dois aller aux urgences.','es:1743':'Je peux le rendre ailleurs ?','es:1840':'Toi aussi, tu es touriste ?','es:2288':'On peut s\'inscrire ensemble dans un groupe ?',
 'es:4032':'le délai de livraison est très long','es:2478':'pas besoin de décider aujourd\'hui','es:2439':'Y a-t-il un magasin près d\'ici ? J\'ai besoin d\'eau.',
 'es:2696':'Recommandez-moi quelque chose qui plaise aux gens du coin.','es:2623':'où est-ce que je récupère la voiture de location ?','es:2633':'Y a-t-il des vélos en libre-service près d\'ici ?',
 'es:2638':'Faut-il le rendre avec le plein fait ?','es:4174':'l\'angle du faisceau est très large','es:4334':'tu délires','es:3195':'est-ce que cela couvre une pénalité ?'}
STU={'es:661':'¡Qué día tan largo!','es:875':'¡Qué bochorno hace!'}
content=[]
for d,field in((NAT,'native'),(STU,'study')):
    for s,a in d.items():
        i=rid(s);p=idx[i]['card']
        f=next(f for f in F if f['id']==i and f['category']==field)
        content.append({'id':i,'level':idx[i]['level'],'field':field,'certainty':'certain','study':p['study'],'before':p[field],'after':a,'reason':f['reason']})
TH={}
for L in range(1,11):
    d=json.load(open(f'{ROOT}/{BASE}/{PAIR}/L{L}.json')); TH[L]={t['id']:t['title'] for t in d['themes']}
status={}
def note(i,s):
    o=['verifie','incertain','proposition','glose-a-corriger','corrige']
    if o.index(s)>o.index(status.get(i,'verifie')): status[i]=s
corrected={e['id'] for e in ph}; done={c['id'] for c in content}
G=[(r'(?i)\bkh\b|kh|rh|jota','jota écrite kh ou rh au lieu de r (cartes de situation surtout)'),
   (r'(?i)\brr\b|r simple|r initial|roul','rr ou r initial écrit avec un seul r'),
   (r'(?i)ñ|gn\b|`gn`','ñ écrit gn'),
   (r'(?i)sigle|OEM|PU\b|épel','sigles lisibles mais discutables'),(r'(?i)accent|tonique|tilde|hiatus','accent tonique discutable'),(r'.','autres aides à confirmer')]
conv=collections.defaultdict(list);props=[]
for f in F:
    i=f['id'];c=f['category'];cert=f['certainty'];e=idx[i];L=e['level']
    if c=='phon':
        if i in corrected or i in BUNDLES: continue
        txt=f['reason']+' '+(f.get('alignment') or '')
        k=next(k for rx,k in G if re.search(rx,txt))
        conv[k].append({'id':i,'level':L,'field':'phon','study':e['card']['study'],'before':f['before'],'proposed':f['after'],'readerCertainty':cert,'reason':f['reason'],'stage':f'snapshot-{head[:7]}'})
        note(i,'incertain')
    elif c in('native','study'):
        if i in BUNDLES or (i,c) in {(x['id'],x['field']) for x in content}: continue
        content.append({'id':i,'level':L,'field':c,'certainty':'incertain','readerCertainty':cert,'study':e['card']['study'],'before':f['before'],'after':f['after'],'reason':f['reason']})
        note(i,'incertain')
    else:
        dest=f['after'] or '';ok=None
        if c=='theme' and 'contextualiser' not in dest:
            m=re.match(r'(L\d+-[\w-]+|[a-z]+)\b',dest);tid=m.group(1) if m else None;ok=bool(L in TH and tid in TH[L])
            if not ok: dest=None;ok=None
        elif c=='theme': dest=None
        props.append({'id':i,'level':L,'theme':e['theme'],'themeTitle':e['themeTitle'],'kind':c,'readerCertainty':cert,'study':e['card']['study'],'native':e['card']['native'],'current':f['before'],'proposed':dest,'readerProposal':f['after'],'destinationExistsAtSameLevel':ok,'reason':f['reason']})
        note(i,'proposition')
# convention sweep: every aid with kh/rh, and single-r rr not certain
seen={x['id'] for v in conv.values() for x in v}
for i,e in idx.items():
    ph_=e['card'].get('phon') or ''
    if i in corrected or i in seen: continue
    if re.search(r'(?i)kh|rh',ph_):
        conv['jota écrite kh ou rh au lieu de r (cartes de situation surtout)'].append({'id':i,'level':e['level'],'field':'phon','study':e['card']['study'],'before':ph_,'proposed':None,'readerCertainty':None,'reason':'balayage : jota écrite kh ou rh','stage':f'snapshot-{head[:7]}'})
for i in done|set(BUNDLES): note(i,'glose-a-corriger')
for i in corrected: status[i]='corrige'
cov=[]
for fn in sorted(glob.glob(f'{LOT}/results/*.json')):
    r=json.load(open(fn));name=fn.split('/')[-1][:-5]
    for i in r['readIds']: cov.append({'id':i,'chunk':name,'status':status.get(i,'verifie')})
bl=[]
for i,(after,why) in BUNDLES.items():
    p=idx[i]['card'];bl.append({'id':i,'level':idx[i]['level'],'certainty':'certain','applyTogether':True,'before':{k:p[k] for k in after},'after':after,'reason':why})
json.dump({'reference':head,'certainCount':sum(1 for x in content if x['certainty']=='certain'),'items':content,'linkedBundles':bl},open(f'{OUT}/lot-contenu-gloses.json','w'),ensure_ascii=False,indent=1)
json.dump({'reference':head,'note':"propositions non appliquées ; destinationExistsAtSameLevel : true pour un thème nommé qui existe au même niveau ; proposed null = à contextualiser (readerProposal garde le texte du lecteur)",'items':props},open(f'{OUT}/propositions-niveaux-themes.json','w'),ensure_ascii=False,indent=1)
json.dump({'reference':head,'note':"aides lisibles, systématiques ou discutables ; rien n'est changé, même quand un lecteur a écrit certain",'groups':dict(sorted(conv.items()))},open(f'{OUT}/conventions-a-decider.json','w'),ensure_ascii=False,indent=1)
cnt=collections.Counter(c['status'] for c in cov)
json.dump({'reference':head,'counts':dict(cnt),'total':len(cov),'distinctIds':len({c['id'] for c in cov}),'items':cov},open(f'{OUT}/couverture.json','w'),ensure_ascii=False,indent=1)
print('ph',len(ph),collections.Counter(r for e in ph for r in e['rules']),'recv',sum(1 for e in ph if 'receivedModels' in e['occurrence']['location']),'reader',sum(e['readerFinding'] for e in ph))
print(dict(cnt),len(cov),len({c['id'] for c in cov}))
print('contenu',len(content),sum(1 for x in content if x['certainty']=='certain'),'bundles',len(bl))
print('props',len(props),len({p['id'] for p in props}),collections.Counter((p['kind'],p['destinationExistsAtSameLevel']) for p in props))
print({k:len(v) for k,v in conv.items()})
for f in F:
    if f['category']=='phon' and f['certainty']=='certain' and f['id'] not in corrected and f['id'] not in BUNDLES: print('NOT USED',f['id'],f['before'],'->',f['after'])
    if f['category'] in('native','study') and f['certainty']=='certain' and f['id'] not in done and f['id'] not in BUNDLES: print('NOT USED C',f['id'],f['before'])
c=json.load(open(f'{OUT}/lot-contenu-gloses.json'))
for x in c['items']:
    if x['id']=='catalogue:es:2370':
        x['after']='Quedemos a medio camino.'; x['reason']+=" — Claude : « Vamos a medio camino » se lit d'abord « on est à mi-chemin » ; « Partamos la diferencia » est un calque de l'anglais ; « Quedemos a medio camino » est l'idiome du compromis. Incertain : le changement d'étude demande aussi l'aide."
json.dump(c,open(f'{OUT}/lot-contenu-gloses.json','w'),ensure_ascii=False,indent=1)

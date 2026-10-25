import sys,json,re,collections,glob,subprocess
sys.path.insert(0,'/tmp/claude-0/-home-claude/be89a11b-450d-53fe-9c0d-7b9f183e8f46/scratchpad/tools')
import build; build.ROOT='/home/claude/edition'
from build import load_cards,ROOT,BASE
OUT='/home/claude/lot7-out'; LOT='/tmp/claude-0/-home-claude/be89a11b-450d-53fe-9c0d-7b9f183e8f46/scratchpad/lot7'; PAIR='fr-en'
idx=load_cards(PAIR); F=json.load(open(f'{LOT}/all-findings.json'))
head=subprocess.check_output(['git','-C',ROOT,'rev-parse','HEAD']).decode().strip()
rep=json.load(open(f'{ROOT}/{BASE}/repertoires/{PAIR}.json'))
def rid(s):
    m=[i for i in idx if i==s or i.endswith(':'+s) or i.endswith(s)]
    assert len(m)==1,(s,m); return m[0]
RULES={
 'H':"h anglais transcrit j (faute de frappe) : le francophone lit [ʒ] (he, her, have, here, hand, help, how, his, hard, had, highway, house)",
 'G':"g dur de l'anglais écrit g devant e, é, è, i ou y : le francophone lit [ʒ] ; écrit gu (règle B, déjà retenue pour fr-es). Cas particuliers : singer et bringing n'ont pas de [g] (SING-eur, BRING-ing) ; argue et regularly → guiou",
 'Z':"s/z qui change le mot : verbe use et close en z, excuse me en z ; used to (habitude) en s sourd sans d",
 'A':"accent tonique sur la mauvaise syllabe pour la nature du mot dans la carte : nom refund/discount/transfer/produce, verbe refund, adjectif perfect/content, sometimes, sunscreen, overheats",
 'W':"segment qui fait lire un autre mot ou un autre son : lead/read en LID/RID, wind, live, Wi-Fi, w de would, do, even, accept, reusable, t de restaurant, only, house",
 'T':"aide tronquée ou faute de frappe : percent absent, Q de MOQ en KY, E de EN71, découpage de postpone",
}
R=[ # (id-suffix, rule, [(old,new),...])
 ('en:10','Z',[('ik-SKYOUS','ik-SKYOUZ')]),
 *[(s,'Z',[('KLOS','KLOZ')]) for s in ('en:902','en:798','en:642','en:1053','en:1108','en:2409')],
 *[(s,'Z',[('YOUS ','YOUZ ') if s=='en:1289' else ('YOUS','YOUZ')]) for s in ('en:1289','en:1847','en:1907')],
 *[(s,'Z',[('YOUZD','YOUST')]) for s in ('en:971','en:1442','en:2049','en:2050','en:2234','en:2303','en:2560')],
 ('en:2372','Z',[('YOUZD','YOUST')]),
 ('en:2372','W',[('LAÏV','LIV')]),
 ('en:3853','A',[('KAN-tènt','keun-TÈNT')]),
 ('en:3744','A',[('seum-TAÏMZ','SEUM-taïmz')]),
 ('en:3681','A',[('seun-SKRIN','SEUN-skrin')]),
 ('en:3592','A',[('O-veur-hits','o-veur-HITS')]),
 ('en:67','A',[('peur-FÈKT','PEUR-fèkt')]),('en:268','A',[('peur-FÈKT','PEUR-fèkt')]),
 *[(s,'A',[('dis-KAOUNT','DIS-kaount')]) for s in ('en:792','en:1468','en:1952','en:3461','en:2208','en:2215','en:3563')],
 ('en:3320','A',[('tran-SFEUR','TRANS-feur')]),('en:3328','A',[('tran-SFEUR','TRANS-feur')]),
 ('en:3357','A',[('preu-DOUS','PRO-dous')]),
 ('en:1026','A',[('RI-feund','ri-FEUND')]),
 *[(s,'A',[('ri-FEUND','RI-feund')]) for s in ('en:794','en:2021','en:2203','en:2676')],
 *[(s,'W',[('LÈD','LID')]) for s in ('en:3167','en:3254','en:2056','en:2175','en:2464')],
 ('en:1803','W',[('RÈD','RID')]),
 ('en:4141','W',[('WAÏND','WIND')]),
 ('en:3574','W',[('wi FAÏ','WAÏ-faï')]),('en:813','W',[('wi FAÏ','WAÏ-faï')]),('en:4315','W',[('wi FAÏ','WAÏ-faï')]),('en:3628','W',[('wi FAÏ','WAÏ-faï')]),
 ('en:1820','W',[('ouat oud','ouat woud')]),('en:2128','W',[('ouat oud','ouat woud')]),('en:2656','W',[('ouat oud','ouat woud')]),
 ('en:1577','W',[('AÏL du','AÏL dou')]),
 ('en:2989','W',[('I-vin','I-veun')]),('en:2896','W',[('I-vin','I-veun')]),
 ('argent-paiements-01','W',[('eu-SÈPT','ak-SÈPT')]),
 ('en:3588','W',[('ri-OU-zeu-beul','ri-YOU-zeu-beul')]),
 ('en:4468','W',[('RÈS-tronn','RÈS-tronnt')]),
 ('piste-reclamation-tact-03','W',[('OUN-li','ÔN-li')]),
 ('en:2937','T',[('deu-PA-zit','peur-SÈNT deu-PA-zit'),('SÈ-veun-ti bi-FOR','SÈ-veun-ti peur-SÈNT bi-FOR')]),
 ('en:461','T',[('weun-HEUN-dreud KA-teun','weun-HEUN-dreud peur-SÈNT KA-teun')]),
 *[(s,'T',[('èm-o-KY','èm-o-KYOU')]) for s in ('en:1935','en:1947','en:2423')],
 ('en:2063','T',[('hav ÈN','hav I-ÈN')]),
 ('en:2430','T',[('pos-TPON','post-PON')]),
 ('en:2836','H',[('JAND','HAND')]),('en:678','H',[('jir','HIR')]),('en:1858','H',[('jir','HIR')]),
 ('en:690','H',[('jav','hav')]),('en:1728','H',[('jav','hav')]),('en:1991','H',[('JAO','HAOU'),('jav','hav')]),
 ('en:1623','H',[('jèlp','HÈLP')]),('en:1958','H',[('JI','hi'),('JER','HEUR')]),('en:2084','H',[('jeur','heur')]),
 ('en:2096','H',[('JI','HI')]),('en:2349','H',[('JI','HI')]),('en:2247','H',[('JI','HI')]),('en:2353','H',[('JI','HI')]),('en:2569','H',[('JI','HI')]),
 ('en:2317','H',[('JANDZ','HANDZ')]),('en:2571','H',[('JANDZ','HANDZ')]),('en:2351','H',[('JAÏ','HAÏ')]),
 ('en:2243','H',[('jáus','HAOUS')]),('en:2258','H',[('jiz','hiz')]),('en:2318','H',[('JARD','HARD')]),('en:2566','H',[('JAD','HAD')]),
 ('en:4230','G',[('SI-ngeur','SING-eur')]),('en:1095','G',[('BRI-nging','BRING-ing')]),
 ('en:1055','G',[('AR-gyou','AR-guiou')]),('sport-habitudes-07','G',[('RÈ-gyou','RÈ-guiou')]),('sport-habitudes-received-01','G',[('RÈ-gyou','RÈ-guiou')]),
]
grx=re.compile(r'(?<![dD])([gG])(?=[eéèiyEÉÈIY])')
edits=collections.OrderedDict()
for s,rule,subs in R:
    i=rid(s); p=idx[i]['card']; cur=edits.get(i,{'phon':p['phon'],'rules':[]})
    for o,n in subs:
        assert o in cur['phon'],(i,o,cur['phon']); cur['phon']=cur['phon'].replace(o,n,1)
    if rule not in cur['rules']: cur['rules'].append(rule)
    edits[i]=cur
for i,e in idx.items():
    ph=(edits[i]['phon'] if i in edits else e['card'].get('phon')) or ''
    if grx.search(ph):
        new=grx.sub(lambda m:m.group(1)+('U' if m.group(1)=='G' else 'u'),ph)
        cur=edits.get(i,{'phon':ph,'rules':[]}); cur['phon']=new
        if 'G' not in cur['rules']: cur['rules'].append('G')
        edits[i]=cur
# certain reader findings phon, for alignment/reason
FB=collections.defaultdict(list)
for f in F:
    if f['category']=='phon': FB[f['id']].append(f)
BUNDLES={
 'catalogue:en:1024':({'study':'Not spicy, please.','phon':'nat SPAÏ-si PLIZ'},"« No spicy » est agrammatical : spicy est un adjectif. La glose « sans piment, svp » reste juste."),
 'catalogue:en:1271':({'study':'Can you dye it in our color?','native':'pouvez-vous le teindre dans notre couleur ?','phon':'kan you DAÏ it in AOU-eur KEU-leur'},"« dye our color » ferait teindre la couleur elle-même : il faut un objet et « in our color »."),
 'catalogue:en:2567':({'study':"I'll prepare a quote.",'native':'je vais préparer un devis','phon':'aïl pri-PÈR eu KWOT'},"« I make a quote » est un calque de « je fais un devis » : le présent simple ne convient pas pour une action ponctuelle annoncée."),
 'catalogue:en:2594':({'study':"We'll cross that bridge when we come to it.",'native':'On avisera le moment venu.','phon':'ouil KROS zat BRIDJ ouèn oui KEUM tou it'},"Expression déformée : l'idiome est « cross that bridge » (on avisera le moment venu) ; « burn that bridge » veut dire couper les ponts. « advienne que pourra » ajoutait un sens."),
 'catalogue:en:2732':({'study':'Could you accept payment in installments?','phon':'koud you ak-SÈPT PÉÏ-meunt in in-STOL-meunts'},"« accept installment payment » sans article ni pluriel n'est pas idiomatique : « payment in installments »."),
}
for i in BUNDLES: assert i not in edits,i
ph=[]
for i,ed in edits.items():
    e=idx[i];p=e['card']
    if ed['phon']==p['phon']: continue
    fs=FB.get(i,[])
    ph.append({'pair':PAIR,'id':i,'level':e['level'],'rules':ed['rules'],'study':p['study'],'native':p['native'],'beforePhon':p['phon'],'afterPhon':ed['phon'],
      'alignment':(fs[0].get('alignment') if fs else None),'reason':' ; '.join(RULES[r].split(' : ')[0] for r in ed['rules']),
      'readerFinding':bool(fs),
      'occurrence':{'path':e['path'],'location':e['location'],'expectedBefore':{k:p.get(k) for k in('study','native','phon')}},'priorCorrection':bool(p.get('phoneticCorrection')),'transportCopies':sum(1 for q in rep['phrases'] if q['id']==i)})
json.dump({'id':'revue-claude-lot7-fr-en','baseSnapshotCommit':head,'policy':'avant/après entiers et figés ; aucune règle à étendre','rules':RULES,'eventCount':len(ph),'events':ph},open(f'{OUT}/registre-phonetique.json','w'),ensure_ascii=False,indent=1)
NAT={'en:403':'À quoi bon ?','en:908':"Qu'est-ce que tu veux vraiment ?",'en:896':'Tu peux jeter un œil ?','en:1175':'Ça vaut le coup ?','en:1815':"Pourquoi tu as changé d'avis ?",'en:1901':"Devine qui j'ai croisé ?",'en:1902':'Y a-t-il quelque chose que je peux faire ?','en:2272':"Pourquoi tu ne me l'as pas dit avant ?",
     'en:1145':'on se voit à huit heures','transport-imprevus-06':'Est-ce que je peux encore utiliser le même billet ?','en:2684':'Pouvez-vous envoyer des échantillons pour vérifier la qualité ?'}
NATR={'?':"point d'interrogation pleine chasse (？, U+FF1F) au lieu de « ? » précédé d'une espace, comme dans les 739 autres gloses"}
content=[]
for s,a in NAT.items():
    i=rid(s);p=idx[i]['card']
    f=next((f for f in F if f['id']==i and f['category']=='native'),None)
    reason=NATR['?'] if '？' in p['native'] else f['reason']
    content.append({'id':i,'level':idx[i]['level'],'field':'native','certainty':'certain','study':p['study'],'before':p['native'],'after':a,'reason':reason})
TH={}
for L in range(1,11):
    d=json.load(open(f'{ROOT}/{BASE}/{PAIR}/L{L}.json')); TH[L]={t['id']:t['title'] for t in d['themes']}
status={}
def note(i,s):
    o=['verifie','incertain','proposition','glose-a-corriger','corrige']
    if o.index(s)>o.index(status.get(i,'verifie')): status[i]=s
corrected={e['id'] for e in ph}
natdone={c['id'] for c in content}
G=[(r'(?i)américain|britann|variété|\br\b final|HAT|HOT','variété américaine ou britannique'),
   (r'(?i)OUANN|WEUN|one\b','rendus de one et de w'),
   (r'(?i)\bth\b|\bz\b|\bs\b pour th','th rendu z ou s'),
   (r'(?i)tone|Pantone|\bON-li|LON-li|nasal','voyelle o devant n lue nasale (ON-li, tone)'),
   (r'(?i)accent','accent tonique discutable'),(r'.','autres aides à confirmer')]
props=[];conv=collections.defaultdict(list)
for f in F:
    i=f['id'];c=f['category'];cert=f['certainty'];e=idx[i];L=e['level']
    if c=='phon':
        if i in corrected or i in BUNDLES: continue
        txt=f['reason']+' '+(f.get('alignment') or '')
        k=next(k for rx,k in G if re.search(rx,txt))
        conv[k].append({'id':i,'level':L,'field':'phon','study':e['card']['study'],'before':f['before'],'proposed':f['after'],'readerCertainty':cert,'reason':f['reason'],'stage':f'snapshot-{head[:7]}'})
        note(i,'incertain')
    elif c in('native','study'):
        if i in BUNDLES or i in natdone: continue
        content.append({'id':i,'level':L,'field':c,'certainty':'incertain','readerCertainty':cert,'study':e['card']['study'],'before':f['before'],'after':f['after'],'reason':f['reason']})
        note(i,'incertain')
    else:
        dest=f['after'] or '';ok=None
        if c=='theme' and 'contextualiser' not in dest:
            m=re.match(r'(L\d+-[\w-]+|[a-z]+)\b',dest);tid=m.group(1) if m else None;ok=bool(L in TH and tid in TH[L])
            if not ok: dest=None
        elif c=='theme': dest=None
        props.append({'id':i,'level':L,'theme':e['theme'],'themeTitle':e['themeTitle'],'kind':c,'readerCertainty':cert,'study':e['card']['study'],'native':e['card']['native'],'current':f['before'],'proposed':dest,'readerProposal':f['after'],'destinationExistsAtSameLevel':ok,'reason':f['reason']})
        note(i,'proposition')
for i in natdone|set(BUNDLES): note(i,'glose-a-corriger')
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
print('ph',len(ph),collections.Counter(r for e in ph for r in e['rules']),'recv',sum(1 for e in ph if 'receivedModels' in e['occurrence']['location']),'readerFinding',sum(e['readerFinding'] for e in ph))
print(dict(cnt),len(cov),len({c['id'] for c in cov}))
print('contenu',len(content),sum(1 for x in content if x['certainty']=='certain'),'bundles',len(bl))
print('props',collections.Counter((p['kind'],p['destinationExistsAtSameLevel']) for p in props))
print({k:len(v) for k,v in conv.items()})
# certain reader phon findings not used
for f in F:
    if f['category']=='phon' and f['certainty']=='certain' and f['id'] not in corrected and f['id'] not in BUNDLES: print('NOT USED',f['id'],f['before'],'->',f['after'])

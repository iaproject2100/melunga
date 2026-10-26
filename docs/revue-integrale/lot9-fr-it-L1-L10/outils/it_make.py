import sys,json,re,collections,glob,subprocess
sys.path.insert(0,'/tmp/claude-0/-home-claude/be89a11b-450d-53fe-9c0d-7b9f183e8f46/scratchpad/tools')
import build; build.ROOT='/home/claude/edition'
from build import load_cards,ROOT,BASE
OUT='/home/claude/lot9-out'; LOT='/tmp/claude-0/-home-claude/be89a11b-450d-53fe-9c0d-7b9f183e8f46/scratchpad/lot9'; PAIR='fr-it'
idx=load_cards(PAIR); F=json.load(open(f'{LOT}/all-findings.json'))
head=subprocess.check_output(['git','-C',ROOT,'rev-parse','HEAD']).decode().strip()
rep=json.load(open(f'{ROOT}/{BASE}/repertoires/{PAIR}.json'))
def rid(s):
    m=[i for i in idx if i==s or i.endswith(':'+s) or i.endswith(s)]
    assert len(m)==1,(s,m); return m[0]
RULES={
 'N':"voyelle + n ou m simple devant consonne ou en fin de mot (an-co-ra, im-por-, non, cam-pa-gna, champ-po, link) : le francophone lit une voyelle nasale et avale la consonne ; le deck écrit nn/mm dans près de 2 000 autres cas (nonn, ann-dia-mo, comm-pli-ca-to)",
 'S':"lettre de sigle nommée à la française : C de CE écrit tché au lieu de ci, ASTM épelé a-ès-té-èm au lieu de a-èsse-ti-èmme",
 'A':"accent tonique marqué sur la mauvaise syllabe (rivedere = ri-ve-DE-re)",
 'T':"faute de frappe ou lettre fausse : i muet de sci devant o prononcé (sciocchezze), d doublé à tort (commedie), minuscule fautive (tro-Va-ré)",
}
NASAL_SKIP={'catalogue:it:1791','catalogue:it:2173','catalogue:it:4267','catalogue:it:2370','catalogue:it:2020'}
nrx=re.compile(r'(?<![oOéÉèÈ])([aeiouAEIOUàìòùÀÌÒÙ])([nmNM])(?![nmNM])(?=(-[bcdfghjklpqrstvzBCDFGHJKLPQRSTVZ])|[\s,.!?;:/]|$)')
R=[]
for i,e in idx.items():
    ph=e['card'].get('phon') or ''
    if i in NASAL_SKIP: continue
    if nrx.search(ph):
        R.append((i,'N','RX'))
R+=[('it:955','N',[('link','linnk')]),('it:1123','N',[('link','linnk')]),('it:2329','N',[('link','linnk')]),('it:3442','N',[('djins','djinnss')]),('it:3702','N',[('champ-po','chamm-po')]),
 ('it:1549','S',[('tché-é','tchi-é')]),('it:1669','S',[('tché-é','tchi-é')]),('it:1555','S',[('a-ès-té-èm','a-ès-sé-ti-èm-mé')]),
 ('piste-cours-aide-received-01','A',[('ri-VÉ-dé-ré','ri-vé-DÉ-ré')]),
 ('it:2615','T',[('chioc-qué-tsé','choc-quét-tsé')]),('piste-gouts-activites-05','T',[('kom-MÈD-dié','kom-MÈ-dié')]),('piste-reclamation-tact-02','T',[('tro-Va-ré','tro-VA-ré')])]

edits=collections.OrderedDict()
for s,rule,subs in R:
    i=s if s in idx else rid(s); p=idx[i]['card']; cur=edits.get(i,{'phon':p['phon'],'rules':[]})
    if subs=='RX':
        cur['phon']=nrx.sub(lambda m:m.group(1)+m.group(2)*2,cur['phon'])
    else:
        for o,n in subs:
            assert o in cur['phon'],(i,o,cur['phon']); cur['phon']=cur['phon'].replace(o,n,1)
    if rule not in cur['rules']: cur['rules'].append(rule)
    edits[i]=cur

FB=collections.defaultdict(list)
for f in F:
    if f['category']=='phon': FB[f['id']].append(f)
BUNDLES={
 'catalogue:it:2489':({'study':'Faccio seguito alla mia mail.','native':'Je fais suite à mon mail.','phon':'fatch-tcho sé-goui-to al-la mi-a mèïl'},"« Torno da voi » est un calque de « je reviens vers vous » : tornare da voi veut dire revenir physiquement chez vous. La formule de relance est « Faccio seguito alla mia mail »."),
 'catalogue:it:3879':({'study':'In caso di controversia, privilegiamo la via amichevole.','native':'En cas de litige, on privilégie la voie amiable.','phon':'inn ca-zo di conn-tro-vèr-sia, pri-vi-lé-dja-mo la vi-a a-mi-qué-vo-lé'},"employé seul, « l'amichevole » désigne un match amical ; la voie amiable se dit « la via amichevole »."),
 'catalogue:it:4098':({'study':'Un altro fornitore offre un prezzo più basso.','native':'Un autre fournisseur offre un prix plus bas.','phon':'oun al-tro for-ni-to-ré of-fré oun prèt-tso piou bas-so'},"« propone meno caro » calque « propose moins cher » : proporre ne se construit pas avec un adverbe de prix."),
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
json.dump({'id':'revue-claude-lot9-fr-it','baseSnapshotCommit':head,'policy':'avant/après entiers et figés ; aucune règle à étendre','rules':RULES,'eventCount':len(ph),'events':ph},open(f'{OUT}/registre-phonetique.json','w'),ensure_ascii=False,indent=1)
NAT={'it:2647':"L'excès nuit en tout.",'it:218':"J'ai bien reçu, merci.",'it:321':'Combien je te dois ?','it:2883':"C'est absurde !",'it:3272':"Depuis quand tu apprends l'italien ?",
 'it:1794':'Est-ce que vous êtes ouverts le dimanche ?','fr-it:piste-sport-habitudes-04':'Chaque entraînement dure une demi-heure.','it:502':'Dis-lui bonjour de ma part.','it:629':'Ne quittez pas.',
 'it:3092':'Je suis sur le point de...','it:970':'Tu veux goûter ?','it:930':'On est en dessous de zéro.','it:734':'Ça change mes habitudes.','it:841':'On peut en parler plus tard ?',
 'it:846':'On en verra de belles.','it:978':'Fais comme chez toi.','fr-it:transport-imprevus-06':'Est-ce que je peux encore utiliser le même billet ?','fr-it:piste-equipement-chambre-08':'Merci, j’ai pu bien dormir.',
 'it:1375':'J\'ai oublié de te le dire.','it:1208':'Il a touché la cible.','fr-it:piste-depannage-connexion-05':'Le problème continue sur un autre réseau.','it:1603':'Voici mon billet.','it:1466':'Ça tombe bien.',
 'it:1506':'Permets-moi de préciser.','it:1591':'Comment on dit ça en italien ?','it:1736':"Je ne l'ai pas encore reçu.",'it:1859':"Je m'en occupe demain à la première heure.",'it:4091':'En conclusion, je dirais que...',
 'it:2249':"— Depuis quand tu apprends l'italien ? — Depuis six mois.",'it:2270':'— Comment on dit ça en italien ? — On dit « appuntamento ».','it:2244':'— Tu parles italien ? — Oui, un petit peu.',
 'it:2360':'Ravi de faire votre connaissance.','piste-depannage-connexion-received-01':'Vous m’entendez mieux maintenant ?','piste-vetement-taille-received-01':'Quelle taille prenez-vous ?'}
STU={}
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
G=[(r'(?i)\bsh\b|`sh`|sci|sce','sc devant e/i écrit sh'),(r'(?i)gli|llia|llio|`lli`','gli écrit lli'),
   (r'(?i)nasal|im-|an-|\bon\b','voyelle nasale (cas laissés : SIM, team, Wang)'),(r'(?i)wi-?fi|oui-fi|anglais|label|puzzle|shock','emprunts anglais (wifi, label, puzzle)'),
   (r'(?i)z sourd|z sonore|polizza|dz|ts','z sourd ou sonore'),(r'(?i)sigle|épel|OEM','sigles lisibles mais discutables'),(r'(?i)accent|tonique','accent tonique discutable'),(r'.','autres aides à confirmer')]
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
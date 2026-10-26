import sys,re,json,collections,random
sys.path.insert(0,'/tmp/claude-0/-home-claude/be89a11b-450d-53fe-9c0d-7b9f183e8f46/scratchpad/tools');sys.path.insert(0,'.')
import build; build.ROOT='/home/claude/edition'
from kopron import aid
from loose import L
idx=build.load_cards('fr-ko')
VOW='aàâeéèêiïîoôuûy'
def lead(w):
    m=re.match(r'[^aàâeéèêiïîoôuûy]*',w);return m.group(0)
auto=[];manual=[]
for i,e in idx.items():
    c=e['card'];st=c['study'];ph=c.get('phon') or ''
    toks=re.findall(r'[\w\-àâäéèêëïîôöùûüç]+',ph)
    if re.search(r'[A-Za-z0-9]',st) or not re.search(r'[가-힣]',st):
        continue
    P=aid(st).split()
    if len(P)!=len(toks):
        manual.append((i,'mots non alignés',st,ph,' '.join(P)));continue
    situ=not i.startswith('catalogue') or bool(re.search(r'kh|ph|th',ph))
    new=ph;changed=[]
    pos=0;out=[]
    for w,p in zip(toks,P):
        if L(w)==L(p): continue
        lw,lp=lead(w),lead(p)
        q=p
        if lw and lp and L(lw)==L(lp): q=lw+p[len(lp):]
        changed.append((w,q))
    if not changed: continue
    if situ: manual.append((i,'carte de situation (autre convention)',st,ph,' '.join(P)));continue
    s=ph
    for w,q in changed:
        s=re.sub(r'(?<![\w\-])'+re.escape(w)+r'(?![\w\-])',q,s,count=1)
    auto.append({'id':i,'level':e['level'],'study':st,'reading':c.get('reading'),'native':c['native'],'beforePhon':ph,'afterPhon':s,'words':changed,'occurrence':{'path':e['path'],'location':e['location']}})
print('auto',len(auto),'manual',len(manual),collections.Counter(m[1] for m in manual))
json.dump({'auto':auto,'manual':manual},open('ko-batch.json','w'),ensure_ascii=False,indent=0)
random.seed(5)
for a in random.sample(auto,40): print(a['study'],'|',a['beforePhon'],'=>',a['afterPhon'])

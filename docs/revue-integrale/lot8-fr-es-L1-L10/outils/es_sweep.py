import sys,json,re,collections
sys.path.insert(0,'tools')
import build; build.ROOT='/home/claude/edition'
idx=build.load_cards('fr-es')
def show(k,hits):
    print('==',k,len(hits))
    for i,s,p in hits: print('  ',i.split(':')[-1][-26:],'|',s,'|',p)
G=[];KH=[];KINR=[];EUR=[];OO=[];RR=[];NUM=[];SIG=[]
words=re.compile(r'\b(perr\w*|carr\w*|corr\w*|parr\w*|cerr\w*|ahorr\w*|forr\w*|morr\w*|barr\w*|perra\w*|torre\w*|tierra\w*|guerra\w*)',re.I)
for i,e in idx.items():
    p=e['card'];ph=p.get('phon') or '';s=p['study']
    if re.search(r'(?<![dDuU])[gG][eéèiyEÉÈIY]',ph): G.append((i,s,ph))
    if re.search(r'(?i)kh|rh',ph): KH.append((i,s,ph))
    if re.search(r'(?i)INR\b|KINR',ph): KINR.append((i,s,ph))
    if re.search(r'(?i)é-OU-ros|euro',ph): EUR.append((i,s,ph))
    if re.search(r'OO|oo',ph): OO.append((i,s,ph))
    if re.search(r'\d',s): NUM.append((i,s,ph))
    if re.search(r'\b[A-Z]{2,}\b|\b[A-Z]/[A-Z]\b',s): SIG.append((i,s,ph))
    for w in words.findall(s): RR.append((i,s+'  ['+w+']',ph))
for k,h in [('G',G),('KH/RH',KH),('KINR',KINR),('EUR',EUR),('OO',OO),('NUM',NUM),('SIG',SIG),('RR',RR)]: show(k,h)

# Korean -> deck aid (French-based), orthographic or pronounced
import re
CHO='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'
JUNG='ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'
JONG=['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
def dec(ch):
    o=ord(ch)-0xAC00
    if 0<=o<11172: return [CHO[o//588],JUNG[(o%588)//28],JONG[o%28]]
    return None
V={'ㅏ':'a','ㅐ':'è','ㅑ':'ya','ㅒ':'yè','ㅓ':'o','ㅔ':'é','ㅕ':'yo','ㅖ':'yé','ㅗ':'o','ㅘ':'oua','ㅙ':'ouè','ㅚ':'oué','ㅛ':'yo','ㅜ':'ou','ㅝ':'ouo','ㅞ':'oué','ㅟ':'oui','ㅠ':'you','ㅡ':'eu','ㅢ':'eui','ㅣ':'i'}
I={'ㄱ':'g','ㄲ':'kk','ㄴ':'n','ㄷ':'d','ㄸ':'tt','ㄹ':'r','ㅁ':'m','ㅂ':'b','ㅃ':'pp','ㅅ':'s','ㅆ':'ss','ㅇ':'','ㅈ':'dj','ㅉ':'ddj','ㅊ':'tch','ㅋ':'k','ㅌ':'t','ㅍ':'p','ㅎ':'h'}
FREP={'ㄱ':'ㄱ','ㄲ':'ㄱ','ㅋ':'ㄱ','ㄳ':'ㄱ','ㄺ':'ㄱ','ㄴ':'ㄴ','ㄵ':'ㄴ','ㄶ':'ㄴ','ㄷ':'ㄷ','ㅅ':'ㄷ','ㅆ':'ㄷ','ㅈ':'ㄷ','ㅊ':'ㄷ','ㅌ':'ㄷ','ㅎ':'ㄷ','ㄹ':'ㄹ','ㄼ':'ㄹ','ㄽ':'ㄹ','ㄾ':'ㄹ','ㅀ':'ㄹ','ㄻ':'ㅁ','ㅁ':'ㅁ','ㅂ':'ㅂ','ㅍ':'ㅂ','ㅄ':'ㅂ','ㄿ':'ㅂ','ㅇ':'ㅇ'}
F={'ㄱ':'k','ㄴ':'n','ㄷ':'t','ㄹ':'l','ㅁ':'m','ㅂ':'p','ㅇ':'ng'}
SPLIT={'ㄳ':('ㄱ','ㅅ'),'ㄵ':('ㄴ','ㅈ'),'ㄶ':('ㄴ','ㅎ'),'ㄺ':('ㄹ','ㄱ'),'ㄻ':('ㄹ','ㅁ'),'ㄼ':('ㄹ','ㅂ'),'ㄽ':('ㄹ','ㅅ'),'ㄾ':('ㄹ','ㅌ'),'ㄿ':('ㄹ','ㅍ'),'ㅀ':('ㄹ','ㅎ'),'ㅄ':('ㅂ','ㅅ')}
ASP={'ㄱ':'ㅋ','ㄷ':'ㅌ','ㅂ':'ㅍ','ㅈ':'ㅊ'}
def pron(sylls):
    """sylls: list of [cho,jung,jong] within a phrase (word-linked); returns modified list"""
    s=[list(x) for x in sylls]
    for k in range(1,len(s)):
        if s[k]==['ㅇ','ㅕ','ㄱ'] and s[k-1][2] and s[k-1][2]!='ㅇ': s[k][0]='ㄴ'
    for k in range(len(s)):
        c,v,f=s[k]
        nxt=s[k+1] if k+1<len(s) else None
        if not nxt: continue
        n=nxt[0]
        # ㅎ final
        if f in('ㅎ','ㄶ','ㅀ'):
            keep='' if f=='ㅎ' else SPLIT[f][0]
            if n in ASP: s[k][2]=keep; nxt[0]=ASP[n]; continue
            if n=='ㅇ':
                s[k][2]=''
                if keep: nxt[0]=keep
                continue
            if n=='ㅅ': s[k][2]=keep; nxt[0]='ㅆ'; continue
            if n=='ㄴ': s[k][2]=keep or 'ㄴ'; continue
            if n in('ㅊ','ㅉ','ㅆ','ㅋ','ㅌ','ㅍ','ㅁ','ㄹ','ㄲ','ㄸ','ㅃ'): s[k][2]=keep; continue
        # final + ㅎ -> aspiration
        if n=='ㅎ' and f:
            if f in SPLIT: keep,base=SPLIT[f]
            else: keep,base='',f
            if f in('ㄳ','ㄽ','ㅄ'): keep,base=SPLIT[f][0],''
            if base in ASP: asp=ASP[base]
            elif base=='ㅊ': asp='ㅊ'
            elif base: asp=ASP.get(FREP.get(base,base))
            else: asp=None
            if asp=='ㅌ' and (nxt[1]=='ㅣ' or (nxt[1]=='ㅕ' and not nxt[2])): asp='ㅊ'
            if asp:
                s[k][2]=keep; nxt[0]=asp; continue
        # liaison
        if n=='ㅇ' and f and f!='ㅇ':
            if f in SPLIT: a,b=SPLIT[f]; s[k][2]=a; nxt[0]='ㅆ' if b=='ㅅ' else b
            else: s[k][2]=''; nxt[0]=f
            # palatalization
            if nxt[1]=='ㅣ' and nxt[0] in('ㄷ','ㅌ'): nxt[0]={'ㄷ':'ㅈ','ㅌ':'ㅊ'}[nxt[0]]
            continue
    # finals neutralization
    for k in range(len(s)):
        f=s[k][2]
        if f in SPLIT and f not in('ㄺ','ㄻ','ㄼ'): s[k][2]=SPLIT[f][0] if f!='ㄿ' else 'ㅂ'
        elif f=='ㄺ': s[k][2]='ㄱ'
        elif f=='ㄻ': s[k][2]='ㅁ'
        elif f=='ㄼ': s[k][2]='ㄹ'
        s[k][2]=FREP.get(s[k][2],s[k][2])
    # assimilation
    for k in range(len(s)-1):
        f=s[k][2];n=s[k+1][0]
        if n=='ㄹ' and f not in('','ㄹ'):
            if f=='ㄴ': s[k][2]='ㄹ'
            else: s[k+1][0]='ㄴ'; n='ㄴ'
        if f=='ㄹ' and n=='ㄴ': s[k+1][0]='ㄹ'
        if n in('ㄴ','ㅁ'):
            if s[k][2]=='ㄱ': s[k][2]='ㅇ'
            elif s[k][2]=='ㄷ': s[k][2]='ㄴ'
            elif s[k][2]=='ㅂ': s[k][2]='ㅁ'
    # tensification after obstruent finals
    T={'ㄱ':'ㄲ','ㄷ':'ㄸ','ㅂ':'ㅃ','ㅅ':'ㅆ','ㅈ':'ㅉ'}
    for k in range(len(s)-1):
        if s[k][2] in('ㄱ','ㄷ','ㅂ') and s[k+1][0] in T: s[k+1][0]=T[s[k+1][0]]
        if s[k][2]=='ㄷ' and s[k+1][0] in('ㅆ','ㄸ','ㅉ'): s[k][2]=''
    return s
def render(s,prev_final=None):
    out=[]
    for k,(c,v,f) in enumerate(s):
        ini=I[c]
        if c=='ㄹ' and k>0 and s[k-1][2]=='ㄹ': ini='l'
        vv=V[v]
        if c in('ㅈ','ㅊ','ㅉ') and v=='ㅕ': vv='o'
        if ini=='g' and vv[0] in 'eéèiy': ini='gu'
        if c in('ㅅ','ㅆ') and (vv[0]=='i' or v=='ㅟ'): ini='ch'
        if ini=='ss' and vv[0] in 'iy': ini='ss'
        fin=F.get(FREP.get(f,f),'') if f else ''
        out.append(ini+vv+fin)
    return '-'.join(out)
NI={'별일':1,'볼일':1,'물약':1,'색연필':1,'식용유':2,'솜이불':1,'맨입':1,'한여름':1,'늦여름':1,'집안일':2,'부엌일':2,'눈약':1,'담요':1,'영업용':2,'휘발유':2,'나뭇잎':2,'깻잎':1,'콩엿':1,'신여성':1,'직행열차':2}
def aid(text,pronounced=True):
    words=re.findall(r'[가-힣]+|[^가-힣\s]+',text)
    res=[]
    for w in words:
        if not re.match(r'[가-힣]',w): continue
        syl=[dec(ch) for ch in w]
        if pronounced:
            for sub,off in NI.items():
                p=w.find(sub)
                if p>=0: syl[p+off][0]='ㄴ'
            syl=pron(syl)
        else:
            syl=[[c,v,FREP.get(f if f not in SPLIT else SPLIT[f][0],'') if f else ''] for c,v,f in syl]
        res.append(render(syl))
    return ' '.join(res)

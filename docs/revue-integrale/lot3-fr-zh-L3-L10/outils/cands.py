import json,re,unicodedata,sys
def strip(s):
    s=unicodedata.normalize('NFD',s); s=''.join(c for c in s if unicodedata.category(c)!='Mn')
    return s.lower().replace('ü','v')
INI='zh|ch|sh|b|p|m|f|d|t|n|l|g|k|h|j|q|x|r|z|c|s|y|w'
FIN='iang|iong|uang|ueng|ang|eng|ing|ong|ian|iao|uai|uan|van|ai|ei|ao|ou|an|en|in|un|vn|ia|ie|iu|ua|uo|ui|ve|ue|er|a|o|e|i|u|v'
SYL=re.compile(rf'(?:{INI})?(?:{FIN})(?:r(?![aeiouv]))?')
def syls(rd):
    out=[]
    for w in re.findall(r"[a-zü]+",strip(rd).replace('ü','v')):
        pos=0;cur=[]
        # greedy with backtrack-lite: prefer split where next starts with consonant
        while pos<len(w):
            best=None
            for m in sorted({m.end() for m in [SYL.match(w,pos)] if m},reverse=True): best=m
            # try alternatives: shorter finals if remaining doesn't parse
            cands=[]
            for L in range(len(w)-pos,0,-1):
                piece=w[pos:pos+L]
                if SYL.fullmatch(piece): cands.append(L)
            ok=None
            for L in cands:
                rest=w[pos+L:]
                if not rest or SYL.match(rest) and rest[0] not in 'aeiouv' or rest[0]=="'" : ok=L;break
            if ok is None: ok=cands[0] if cands else len(w)-pos
            cur.append(w[pos:pos+ok]); pos+=ok
        out+=cur
    return out

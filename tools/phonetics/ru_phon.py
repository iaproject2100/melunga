# -*- coding: utf-8 -*-
# ru_phon.py — générateur phonétique RUSSE Melunga
# Entrée : prononciation RÉELLE déjà syllabée, écrite par le rédacteur
#   (réduction vocalique, assourdissement final et assimilations DÉJÀ appliqués).
#   - mots séparés par des espaces, syllabes par '-'
#   - syllabe tonique en MAJUSCULES : "zdrast-vuy-t'e" -> "ZDRAST-vuj-t'e"
#   - consonnes : b v g d zh z k l m n p r s t f kh ts ch sh shch
#   - j = й / yod (ja = я initial, jo = ё, ju = ю, je = е initial)
#   - ' = consonne mouillée : n'et (нет), l'u-BOF' (любовь)
#   - voyelles : a e i o u, y = ы
# Sorties : py (anglophone), pf (francophone), ps (hispanophone), pi (italophone), phon (汉字)
import sys
sys.path.insert(0,'/home/claude')
from de_phon import HCV, HN, HLEAD, HCODA as _HCODA, HV0
HCODA=dict(_HCODA); HCODA.update({'z':'斯','v':'夫','y':'','J':'日'})

SEGS=['shch','zh','kh','ts','ch','sh',"'"]+list('bvgdzklmnprstfjaeiouy')
VOW={'a','e','i','o','u','y'}

def _tok(syl):
    s=syl.lower(); out=[]; i=0
    while i<len(s):
        for g in SEGS:
            if s.startswith(g,i): out.append(g); i+=len(g); break
        else: i+=1
    return out

# --- tables de base ---
EN_C={'zh':'zh','kh':'kh','ts':'ts','ch':'ch','sh':'sh','shch':'shch','j':'y'}
EN_V={'a':'a','e':'e','i':'ee','o':'o','u':'oo','y':'ih'}
FR_C={'zh':'j','kh':'kh','ts':'ts','ch':'tch','sh':'ch','shch':'chtch','j':'y'}
FR_V={'a':'a','e':'è','i':'i','o':'o','u':'ou','y':'y'}
ES_C={'zh':'zh','kh':'j','ts':'ts','ch':'ch','sh':'sh','shch':'shch','j':'y','z':'s','v':'v'}
ES_V={'a':'a','e':'e','i':'i','o':'o','u':'u','y':'i'}
IT_C={'zh':'j','kh':'kh','ts':'z','j':'i','z':'s'}
IT_V={'a':'a','e':'e','i':'i','o':'o','u':'u','y':'i'}

def _nextv(toks,k):
    return toks[k+1] if k+1<len(toks) and toks[k+1] in VOW else None

def _ren(toks, lang, last_syl):
    out=''
    n=len(toks)
    for k,t in enumerate(toks):
        nv=_nextv(toks,k)
        if t=="'":
            # mouillure : glide devant voyelle, sinon muet
            if nv and nv not in ('i','e'):
                out+={'en':'y','fr':'i','es':'i','it':'i'}[lang]
            elif nv=='e' and lang=='en':
                out+='y'
            elif nv=='e':
                out+='i'
            continue
        if t in VOW:
            if lang=='en':
                r=EN_V[t]
                if k==n-1 and last_syl:
                    r={'a':'ah','e':'eh','o':'oh'}.get(t,r)
            elif lang=='fr':
                r=FR_V[t]
                # "j" + voyelle en début : y + voyelle ; 'ou' après i-glide déjà ok
            elif lang=='es': r=ES_V[t]
            else: r=IT_V[t]
            out+=r; continue
        # consonnes
        if lang=='en':
            r=EN_C.get(t,t)
        elif lang=='fr':
            r=FR_C.get(t,t)
            if t=='g' and nv in ('e','i','y'): r='gu'
            if t=='j' and k>0 and toks[k-1] in VOW: r='ï'
            if t=='s' and k>0 and toks[k-1] in VOW and nv: r='ss'
        elif lang=='es':
            r=ES_C.get(t,t)
            if t=='g' and nv in ('e','i','y'): r='gu'
            if t=='j' and k>0 and toks[k-1] in VOW: r='i'
        else:  # it
            soft = nv in ('e','i','y') or (k+1<n and toks[k+1]=="'")
            if t=='ch':   r='c' if soft else 'ci'
            elif t in ('sh','shch'): r='sc' if soft else 'sci'
            elif t=='k':  r='ch' if nv in ('e','i','y') else 'c'
            elif t=='g':  r='gh' if nv in ('e','i','y') else 'g'
            else: r=IT_C.get(t,t)
            if t=='j' and nv=='i': r=''
            if t in ('ch','sh','shch') and not nv: r={'ch':'c','sh':'sc','shch':'sc'}[t]
            if t in ('ch','sh','shch') and not nv and k==n-1: r={'ch':'ci','sh':'sc','shch':'sc'}[t]
        out+=r
    return out

def _acc(seg, table):
    # accentue la première voyelle « pleine » (saute le glide i des mouillures)
    for i,ch in enumerate(seg):
        if ch in table:
            if ch=='i' and i+1<len(seg) and seg[i+1] in 'aeouà':
                continue
            return seg[:i]+table[ch]+seg[i+1:]
    return seg

# --- hanzi ---
HZMAP={'zh':'J','kh':'X','ts':'ts','ch':'tS','sh':'S','shch':'S','j':'y'}
JHZ={'a':'扎','e':'热','i':'日','o':'若','u':'茹'}
VCL={'a':'a','e':'e','i':'i','o':'o','u':'u','y':'i'}
def _hz(toks):
    on=[]; nu=None; co=[]
    for t in toks:
        if t=="'": continue
        if t in VOW:
            if nu is None: nu=VCL[t]
            continue
        m=HZMAP.get(t,t)
        (on if nu is None else co).append(m)
    if nu is None: return ''.join(HCODA.get(c,'') for c in on)
    last=on[-1] if on else ''
    lead=''.join((HLEAD.get(c,'') if c!='J' else '日') for c in on[:-1])
    if last=='J':
        cv=JHZ.get(nu,'日')
    elif last=='tS':
        cv={'a':'恰','e':'切','i':'奇','o':'乔','u':'丘'}.get(nu,'奇')
    elif co and co[0]=='n' and (last,nu) in HN:
        return lead+HN[(last,nu)]+''.join(HCODA.get(c,'') for c in co[1:])
    else:
        cv=HCV.get((last,nu)) or ((HLEAD.get(last,'') if last else '')+HV0.get(nu,''))
    tail=''.join(('日' if c=='J' else HCODA.get(c,'')) for c in co)
    return lead+cv+tail

def word_phon(word_tr):
    syls=word_tr.split('-')
    stress=next((k for k,s in enumerate(syls) if s.upper()==s and any(c.isalpha() for c in s)), None)
    en=[];fr=[];es=[];it=[];hz=''
    for k,s in enumerate(syls):
        toks=_tok(s); last=(k==len(syls)-1)
        pe=_ren(toks,'en',last); pf=_ren(toks,'fr',last)
        ps=_ren(toks,'es',last); pi=_ren(toks,'it',last)
        if stress is not None and k==stress and len(syls)>1:
            pe=pe.upper(); pf=pf.upper()
            ps=_acc(ps,{'a':'á','e':'é','i':'í','o':'ó','u':'ú'})
            pi=_acc(pi,{'a':'à','e':'è','i':'ì','o':'ò','u':'ù'})
        en.append(pe); fr.append(pf); es.append(ps); it.append(pi); hz+=_hz(toks)
    return ('-'.join(en),'-'.join(fr),'-'.join(es),'-'.join(it),hz)

def phon_all(translit):
    pys=[];pfs=[];pss=[];pis=[];hz=''
    for w in translit.split():
        a,b,c,d,e=word_phon(w)
        pys.append(a);pfs.append(b);pss.append(c);pis.append(d);hz+=e
    return (' '.join(pys),' '.join(pfs),' '.join(pss),' '.join(pis),hz)

def GR(t, tr, cn, en, frm, esm, itm, jam, kom, cat='core', lv=1):
    py,pf,ps,pi,hz=phon_all(tr)
    return dict(t=t,py=py,pf=pf,ps=ps,pi=pi,phon=hz,cn=cn,en=en,frm=frm,esm=esm,itm=itm,jam=jam,kom=kom,lv=lv,cat=cat)

if __name__=='__main__':
    DEMO=[("Привет!","pri-V'ET"),("Здравствуйте!","ZDRAST-vuj-t'e"),("Спасибо","spa-SI-ba"),("Пожалуйста","pa-ZHAL-sta"),
          ("Да","da"),("Нет","n'et"),("Как дела?","kak d'i-LA"),("Хорошо","kha-ra-SHO"),("Меня зовут Анна.","m'i-N'A za-VUT A-na"),
          ("Я не понимаю.","ja n'i pa-n'i-MA-ju"),("Молоко","ma-la-KO"),("Хлеб","khl'ep"),("Где туалет?","gd'e tu-a-L'ET"),
          ("Сколько это стоит?","SKOL'-ka E-ta STO-it"),("Любовь","l'u-BOF'"),("Щи","shchi"),("Жизнь","zhyzn'"),("Чай","chaj"),
          ("Вы","vy"),("Извините","iz-vi-N'I-t'e"),("Я люблю тебя.","ja l'u-BL'U t'i-B'A"),("Ещё","ji-SHCHO")]
    for t,tr in DEMO:
        py,pf,ps,pi,hz=phon_all(tr)
        print(f'{t:22} | {tr}')
        print(f'    py: {py:28} pf: {pf}')
        print(f'    ps: {ps:28} pi: {pi}   zh: {hz}')

# -*- coding: utf-8 -*-
# ar_phon.py — générateur phonétique ARABE (MSA usuel) Melunga
# Entrée : translittération DÉJÀ syllabée fournie par le rédacteur.
#   - mots séparés par des espaces, syllabes par '-'
#   - syllabe tonique en MAJUSCULES : "as-sa-LAA-mu 3a-LAY-kum"
#   - alphabet translit : b t j d r z s f q k l m n h w y + digraphes kh gh sh th dh
#     emphatiques S D T Z (rendues simples) ; 7=ح ; 3=ع (omis, la voyelle porte) ; '=hamza (omise)
#     voyelles : a i u (+ aa ii uu longues), diphtongues ay aw ; e o tolérées (emprunts)
# Sorties : py (anglophone), pf (francophone), ps (hispanophone), pi (italophone), phon (汉字)
import re, sys
sys.path.insert(0,'/home/claude')
from de_phon import HCV, HN, HLEAD, HCODA, HV0

SEGS=['kh','gh','sh','th','dh','aa','ii','uu','ay','aw','ee','oo']+list("btjdrzsfqklmnhwySDTZ7aiueo3'vpg")
def _tok(syl):
    s=syl.lower(); out=[]; i=0
    while i<len(s):
        for g in SEGS:
            if s.startswith(g,i): out.append(g); i+=len(g); break
        else: i+=1
    return out
VOW={'a','i','u','e','o','aa','ii','uu','ay','aw','ee','oo'}

EN={'kh':'kh','gh':'gh','sh':'sh','th':'th','dh':'dh','7':'h','3':'',"'":'','S':'s','D':'d','T':'t','Z':'z','q':'k','j':'j','w':'w','y':'y',
    'aa':'ah','ii':'ee','uu':'oo','ay':'ay','aw':'ow','ee':'ay','oo':'oh','a':'a','i':'i','u':'u','e':'e','o':'o'}
FR={'kh':'kh','gh':'r','sh':'ch','th':'th','dh':'dh','7':'h','3':'',"'":'','S':'s','D':'d','T':'t','Z':'z','q':'k','j':'dj','w':'ou','y':'y',
    'aa':'a','ii':'i','uu':'ou','ay':'aï','aw':'aou','ee':'é','oo':'o','a':'a','i':'i','u':'ou','e':'é','o':'o'}
ES={'kh':'j','gh':'g','sh':'sh','th':'z','dh':'d','7':'j','h':'j','3':'',"'":'','S':'s','D':'d','T':'t','Z':'z','q':'k','j':'y','w':'u','y':'y',
    'aa':'a','ii':'i','uu':'u','ay':'ai','aw':'au','ee':'e','oo':'o','a':'a','i':'i','u':'u','e':'e','o':'o'}
IT={'kh':'ch','gh':'g','sh':'sc','th':'t','dh':'d','7':'h','3':'',"'":'','S':'s','D':'d','T':'t','Z':'z','q':'c','j':'g','w':'u','y':'i',
    'aa':'a','ii':'i','uu':'u','ay':'ai','aw':'au','ee':'e','oo':'o','a':'a','i':'i','u':'u','e':'e','o':'o'}

def _ren(toks, table, final):
    out=''
    for k,t in enumerate(toks):
        r=table.get(t,t)
        if table is EN:
            if t=='u' and k==len(toks)-1: r='oo'
            if t=='i' and k==len(toks)-1: r='ee'
            if t=='a' and k==len(toks)-1: r='ah'
        if t=='g' and table is not EN:
            nxt=toks[k+1] if k+1<len(toks) else ''
            front=table.get(nxt,'')[:1] in ('e','i')
            r=('gu' if front else 'g') if table in (FR,ES) else ('gh' if front else 'g')
        if table is IT:
            nxt=toks[k+1] if k+1<len(toks) else ''
            if t=='sh': r='sci' if table.get(nxt,'')[:1] in ('a','o','u') else 'sc'
            if t=='j':  r='gi'  if table.get(nxt,'')[:1] in ('a','o','u') else 'g'
            if t=='k' and table.get(nxt,'')[:1] in ('e','i'): r='ch'
        out+=r
    return out

def _acc(seg, table):
    for i,ch in enumerate(seg):
        if ch not in table: continue
        pv=seg[i-1] if i>0 else ''; nx=seg[i+1] if i+1<len(seg) else ''
        if ch=='u' and pv in 'gq' and nx and nx in 'ei': continue   # gui / qui : digramme
        if ch=='i' and pv in 'cg' and nx and nx in 'aou': continue  # cia / gio (it)
        return seg[:i]+table[ch]+seg[i+1:]
    return seg

# ---- hanzi : réutilise les tables du générateur allemand, complétées pour l'arabe (v3.2 : codas ج ز ذ ظ ح ه و ي, emprunts v p g) ----
HZMAP={'kh':'X','gh':'r','sh':'S','th':'s','dh':'z','7':'h','3':'',"'":'','S':'s','D':'d','T':'t','Z':'z','q':'k','j':'J','w':'v','y':'y','v':'v','p':'p','g':'g'}
# codas propres à l'arabe : les tables allemandes n'ont pas J (ج), z (ز/ذ/ظ), h (ح/ه), v (و) ni y (ي) en fin de syllabe
HCODA_AR=dict(HCODA); HCODA_AR.update({'J':'吉','z':'兹','h':'赫','v':'乌','y':'伊','X':'赫','r':'尔','ts':'茨'})
HLEAD_AR=dict(HLEAD); HLEAD_AR.update({'J':'季','v':'夫','p':'普','g':'格'})
JHZ={'a':'贾','e':'杰','i':'吉','o':'乔','u':'朱','ai':'贾伊','au':'焦','oy':'乔伊'}
VCL={'aa':'a','ii':'i','uu':'u','ay':'ai','aw':'au','ee':'e','oo':'o','a':'a','i':'i','u':'u','e':'e','o':'o'}
def _hz(toks):
    on=[]; nu=None; co=[]
    for t in toks:
        m=HZMAP.get(t,t)
        if t in VOW: 
            if nu is None: nu=VCL[t]
            continue
        if m=='' : continue
        tgt=on if nu is None else co
        if tgt is co and co and co[-1]==m: continue   # gémination en coda : une seule fois
        if tgt is co and not co and ((m=='y' and nu=='i') or (m=='v' and nu=='u')): continue   # iy / uw : glide redondante
        tgt.append(m)
    out=''
    if nu is None: return ''.join(HCODA_AR.get(c,'') for c in on)
    last=on[-1] if on else ''
    lead=''.join(HLEAD_AR.get(c,'') for c in on[:-1])
    if last=='J':
        cv=JHZ.get(nu,'吉')
    elif co and co[0]=='n' and (last,nu) in HN:
        return lead+HN[(last,nu)]+''.join(HCODA_AR.get(c,'') for c in co[1:])
    else:
        cv=HCV.get((last,nu)) or ((HLEAD_AR.get(last,'') if last else '')+HV0.get(nu,''))
    return lead+cv+''.join(HCODA_AR.get(c,'') for c in co)

def word_phon(word_tr):
    syls=word_tr.split('-')
    stress=next((k for k,s in enumerate(syls) if s.upper()==s and any(c.isalpha() for c in s)), None)
    en=[];fr=[];es=[];it=[];hz=''
    for k,s in enumerate(syls):
        toks=_tok(s)
        pe=_ren(toks,EN,k==len(syls)-1); pf=_ren(toks,FR,k==len(syls)-1)
        ps=_ren(toks,ES,False); pi=_ren(toks,IT,False)
        if stress is not None:
            if k==stress: pe=pe.upper(); pf=pf.upper(); ps=_acc(ps,{'a':'á','e':'é','i':'í','o':'ó','u':'ú'}); pi=_acc(pi,{'a':'à','e':'è','i':'ì','o':'ò','u':'ù'})
        en.append(pe); fr.append(pf); es.append(ps); it.append(pi); hz+=_hz(toks)
    return ('-'.join(en),'-'.join(fr),'-'.join(es),'-'.join(it),hz)

def phon_all(translit):
    pys=[];pfs=[];pss=[];pis=[];hz=''
    for w in translit.split():
        a,b,c,d,e=word_phon(w)
        pys.append(a);pfs.append(b);pss.append(c);pis.append(d);hz+=e
    return (' '.join(pys),' '.join(pfs),' '.join(pss),' '.join(pis),hz)

def GA(t, tr, cn, en, frm, esm, itm, jam, kom, cat='core', lv=1):
    py,pf,ps,pi,hz=phon_all(tr)
    return dict(t=t,py=py,pf=pf,ps=ps,pi=pi,phon=hz,cn=cn,en=en,frm=frm,esm=esm,itm=itm,jam=jam,kom=kom,lv=lv,cat=cat)

if __name__=='__main__':
    DEMO=[("مرحبا","MAR-7a-ba"),("السلام عليكم","as-sa-LAA-mu 3a-LAY-kum"),("وعليكم السلام","wa-3a-LAY-ku-mu s-sa-LAAM"),
          ("صباح الخير","Sa-BAA-7al KHAYR"),("كيف حالك؟","KAY-fa 7AA-lak"),("أنا بخير، شكرا","A-na bi-KHAYR SHUK-ran"),
          ("شكرا جزيلا","SHUK-ran ja-ZII-lan"),("من فضلك","min FAD-lak"),("نعم","NA-3am"),("لا","laa"),
          ("ما اسمك؟","MAS-muk"),("أين الحمام؟","AY-nal 7am-MAAM")]
    for t,tr in DEMO:
        py,pf,ps,pi,hz=phon_all(tr)
        print(t,'|',tr); print('  py:',py,'| pf:',pf); print('  ps:',ps,'| pi:',pi,'| zh:',hz)

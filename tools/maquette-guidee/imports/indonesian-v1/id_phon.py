# -*- coding: utf-8 -*-
# id_phon.py — générateur phonétique INDONÉSIEN (bahasa Indonesia standard), Melunga
# Entrée : prononciation syllabée
#   - mots séparés par des espaces, syllabes par '-', syllabe tonique préfixée par '*'
#     (indonésien : accent léger sur l'avant-dernière syllabe, sur la dernière si l'avant-dernière contient un e muet)
#   - voyelles : a, i, u, o, e (é fermé : sate, enak), E (è ouvert : nenek, bebek), @ (e muet/schwa : besar, terima)
#   - semi-voyelles : y (pakai -> pa-*kay), w (pulau -> *pu-law)
#   - consonnes : p b t d k g f v s z m n l r (r roulé) h ; c (= tch : cari), j (= dj : jalan),
#     ng (dengan), ny (nyanyi), sy (syukur), kh (akhir), q = coup de glotte (k final : tidak -> ti-*daq ; bapak -> *ba-paq)
# Sorties : py (EN), pf (FR), ps (ES), pi (IT), phon (汉字)
import sys
sys.path.insert(0,'/home/claude')
import ru_phon as _ru

SEGS=['ng','ny','sy','kh']+list('pbtdkgfvszmnlrhcjqywaeEi@ou')
VOW={'a','e','E','i','o','u','@'}
GLI={'y','w'}
FRONT={'e','E','i'}

def _tok(s):
    out=[];i=0
    while i<len(s):
        for g in SEGS:
            if s.startswith(g,i): out.append(g); i+=len(g); break
        else: i+=1
    return out

V={'en':{'a':'ah','e':'ay','E':'eh','i':'ee','o':'oh','u':'oo','@':'uh'},
   'fr':{'a':'a','e':'é','E':'è','i':'i','o':'o','u':'ou','@':'e'},
   'es':{'a':'a','e':'e','E':'e','i':'i','o':'o','u':'u','@':'e'},
   'it':{'a':'a','e':'e','E':'e','i':'i','o':'o','u':'u','@':'e'}}
# diphtongues (anglais) pour éviter « ahy »
END={('a','y'):'ai',('a','w'):'ow',('o','y'):'oy',('u','y'):'ooy',('e','y'):'ay',('E','y'):'ey'}

def _cons(c,lang,nv,prev,last):
    soft=nv in FRONT
    if c=='q': return "'"
    if lang=='en':
        if c=='g' and soft: return 'gh'
        if c=='h' and last and prev in VOW: return ''
        return {'c':'ch','j':'j','ny':'ny','ng':'ng','sy':'sh','kh':'kh','r':'r','y':'y','w':'w'}.get(c,c)
    if lang=='fr':
        if c=='g' and soft: return 'gu'
        if c=='s' and prev in VOW|GLI and nv in VOW: return 'ss'
        if c=='h' and last: return 'h'
        return {'c':'tch','j':'dj','ny':'gn','ng':'ng','sy':'ch','kh':'kh','y':'y','w':'ou'}.get(c,c)
    if lang=='es':
        if c=='g' and soft: return 'gu'
        if c=='k' and soft: return 'k'
        if c=='h' and last and prev in VOW: return ''
        return {'c':'ch','j':'dy','ny':'ñ','ng':'ng','sy':'sh','kh':'j','h':'j','z':'s','v':'b','y':'y','w':'u'}.get(c,c)
    # it
    if c=='k': return 'ch' if soft else 'c'
    if c=='g': return 'gh' if soft else 'g'
    if c=='c': return 'c' if soft else ('ci' if nv else 'c')
    if c=='j': return 'g' if soft else ('gi' if nv else 'dj')
    if c=='sy': return 'sc' if soft else ('sci' if nv else 'sc')
    return {'ny':'gn','ng':'ng','kh':'kh','y':'i','w':'u'}.get(c,c)

def _ren(toks,lang):
    out='';n=len(toks);k=0
    while k<n:
        t=toks[k]
        nxt=toks[k+1] if k+1<n else None
        if t in VOW:
            if lang=='en' and nxt in GLI and (t,nxt) in END:
                out+=END[(t,nxt)]; k+=2; continue
            # deux voyelles identiques ou voyelle + voyelle : rien de spécial
            out+=V[lang][t]; k+=1; continue
        prev=toks[k-1] if k>0 else None
        if t in GLI and prev in VOW:
            if (t=='w' and prev=='u') or (t=='y' and prev=='i'): k+=1; continue
            out+={'en':{'y':'y','w':'w'},'fr':{'y':'ï','w':'ou'},'es':{'y':'i','w':'u'},'it':{'y':'i','w':'u'}}[lang][t]
            k+=1; continue
        nv=nxt if nxt in VOW else None
        out+=_cons(t,lang,nv,prev,k==n-1); k+=1
    return out

def _acc(seg,table):
    for i,ch in enumerate(seg):
        if ch not in table: continue
        nx=seg[i+1] if i+1<len(seg) else ''
        pv=seg[i-1] if i>0 else ''
        if ch=='i' and pv in 'cgl' and nx and nx in 'aeou': continue   # ci-, gi-, sci-, gli- (it)
        if ch=='u' and pv in 'gq' and nx and nx in 'ei': continue      # gue, gui (es/fr)
        return seg[:i]+table[ch]+seg[i+1:]
    return seg

HZ={'p':'p','b':'b','t':'t','d':'d','k':'k','g':'g','f':'f','v':'v','s':'s','z':'z','m':'m','n':'n',
    'l':'l','r':'r','h':'kh','c':'ch','j':'ch','ng':'n','ny':'n','sy':'sh','kh':'kh','y':'j','w':'v',
    'a':'a','e':'e','E':'e','i':'i','o':'o','u':'u','@':'y'}

def _hzsyl(toks):
    out=[];seen=False
    for t in toks:
        if t=='q': continue
        if t in GLI and seen: continue
        if t=='h' and seen: continue            # h final peu audible
        if t in VOW: seen=True
        if t=='ny' : out+=['n']; continue
        out.append(HZ[t])
    return _ru._hz(out)

def word_phon(w):
    syls=w.split('-')
    en=[];fr=[];es=[];it=[];hz=''
    multi=len(syls)>1
    for s in syls:
        st=s.startswith('*'); s=s.lstrip('*')
        toks=_tok(s)
        pe=_ren(toks,'en');pf=_ren(toks,'fr');ps=_ren(toks,'es');pi=_ren(toks,'it')
        if st and multi:
            pe=pe.upper();pf=pf.upper()
            ps=_acc(ps,{'a':'á','e':'é','i':'í','o':'ó','u':'ú'})
            pi=_acc(pi,{'a':'à','e':'è','i':'ì','o':'ò','u':'ù'})
        en.append(pe);fr.append(pf);es.append(ps);it.append(pi)
        hz+=_hzsyl(toks)
    return '-'.join(en),'-'.join(fr),'-'.join(es),'-'.join(it),hz

def phon_all(tr):
    a=[];b=[];c=[];d=[];h=''
    for w in tr.split():
        x=word_phon(w);a.append(x[0]);b.append(x[1]);c.append(x[2]);d.append(x[3]);h+=x[4]
    return ' '.join(a),' '.join(b),' '.join(c),' '.join(d),h

def GR(t,tr,cn,en,frm,esm,itm,jam,kom,cat='core',lv=1):
    py,pf,ps,pi,hz=phon_all(tr)
    return dict(t=t,py=py,pf=pf,ps=ps,pi=pi,phon=hz,cn=cn,en=en,frm=frm,esm=esm,itm=itm,jam=jam,kom=kom,lv=lv,cat=cat)

if __name__=='__main__':
    for t,tr in [("Selamat pagi.","s@-*la-mat *pa-gi"),("Terima kasih.","t@-*ri-ma *ka-sih"),("Tidak.","ti-*daq"),
                 ("Apa kabar?","*a-pa *ka-bar"),("Saya tidak mengerti.","*sa-ya ti-*daq m@-*ngEr-ti"),("Bapak","*ba-paq"),
                 ("Sampai jumpa!","*sam-pay *jum-pa"),("Pulau","*pu-law"),("Syukurlah.","syu-*kur-lah"),("Cari","*ca-ri"),
                 ("Nyanyi","*nya-nyi"),("enak","*e-naq"),("Gigi","*gi-gi"),("Kecil","k@-*cil"),("Akhir","*a-khir")]:
        print(t,'|',*phon_all(tr),sep=' ')

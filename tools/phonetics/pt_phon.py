# -*- coding: utf-8 -*-
# pt_phon.py — générateur phonétique PORTUGAIS DU BRÉSIL, Melunga
# Entrée : prononciation RÉELLE brésilienne (standard de São Paulo / Rio neutralisé), syllabée
#   - mots séparés par des espaces, syllabes par '-', syllabe tonique préfixée par '*'
#   - voyelles : a, e (ê fermé), E (é ouvert), i, o (ô fermé), O (ó ouvert), u
#     '~' après une voyelle = nasale (ã = a~, õ = o~, em = e~y, ão = a~w)
#   - semi-voyelles : y (i de pai), w (u de mau, l final de Brasil -> bra-*ziw)
#   - consonnes : p b t d k g f v s z m n l r (r battu, caro) R (r guttural, rio/carro/r final)
#     ch (t+ch de tia -> chi-a), dj (d+j de dia -> dji-a), sh (x/ch de chá), zh (j de já),
#     lh (filho), nh (vinho)
#   - e/o finaux réduits déjà écrits i/u (leite -> *ley-chi, obrigado -> o-bri-*ga-du)
# Sorties : py (EN), pf (FR), ps (ES), pi (IT), phon (汉字)
import sys
sys.path.insert(0,'/home/claude')
import ru_phon as _ru

SEGS=['ch','dj','sh','zh','lh','nh','~']+list('pbtdkgfvszmnlrRywaeEioOu')
VOW={'a','e','E','i','o','O','u'}
GLI={'y','w'}
FRONT={'e','E','i'}

def _tok(s):
    out=[];i=0
    while i<len(s):
        for g in SEGS:
            if s.startswith(g,i): out.append(g); i+=len(g); break
        else: i+=1
    return out

V={'en':{'a':'ah','e':'ay','E':'eh','i':'ee','o':'oh','O':'aw','u':'oo'},
   'fr':{'a':'a','e':'é','E':'è','i':'i','o':'ô','O':'o','u':'ou'},
   'es':{'a':'a','e':'e','E':'e','i':'i','o':'o','O':'o','u':'u'},
   'it':{'a':'a','e':'e','E':'e','i':'i','o':'o','O':'o','u':'u'}}
# voyelle nasale seule
NAS={'en':{'a':'un','e':'ayn','E':'ayn','i':'een','o':'ohn','O':'ohn','u':'oon'},
     'fr':{'a':'an','e':'ein','E':'ein','i':'in','o':'on','O':'on','u':'oun'},
     'es':{'a':'an','e':'en','E':'en','i':'in','o':'on','O':'on','u':'un'},
     'it':{'a':'an','e':'en','E':'en','i':'in','o':'on','O':'on','u':'un'}}
# voyelle nasale + semi-voyelle (ão, ãe, em, õe, ui~)
NASD={'en':{('a','w'):'own',('a','y'):'ighn',('e','y'):'ayn',('o','y'):'oyn',('u','y'):'ooyn'},
      'fr':{('a','w'):'aon',('a','y'):'aïn',('e','y'):'eïn',('o','y'):'oïn',('u','y'):'ouïn'},
      'es':{('a','w'):'aun',('a','y'):'ain',('e','y'):'ein',('o','y'):'oin',('u','y'):'uin'},
      'it':{('a','w'):'aun',('a','y'):'ain',('e','y'):'ein',('o','y'):'oin',('u','y'):'uin'}}
# voyelle orale + semi-voyelle (anglais seulement, pour éviter « ahy »)
END={('a','y'):'eye',('a','w'):'ow',('e','y'):'ay',('E','y'):'ey',('o','y'):'oy',('O','y'):'oy',
     ('u','y'):'ooy',('e','w'):'ayw',('E','w'):'ew',('i','w'):'eew',('o','w'):'oh',('O','w'):'ow',('u','w'):'oo'}

def _cons(c,lang,nv,prev):
    soft=nv in FRONT
    if lang=='en':
        if c=='g' and soft: return 'gh'
        return {'R':'h','ch':'ch','dj':'j','sh':'sh','zh':'zh','lh':'ly','nh':'ny','y':'y','w':'w'}.get(c,c)
    if lang=='fr':
        if c=='g' and soft: return 'gu'
        if c=='s' and prev in VOW|GLI and nv in VOW: return 'ss'
        return {'R':'rr','ch':'tch','dj':'dj','sh':'ch','zh':'j','lh':'ly','nh':'gn','y':'y','w':'ou'}.get(c,c)
    if lang=='es':
        if c=='g' and soft: return 'gu'
        return {'R':'j','ch':'ch','dj':'dy','sh':'sh','zh':'y','lh':'ll','nh':'ñ','z':'s','y':'y','w':'u'}.get(c,c)
    # it
    if c=='k': return 'ch' if soft else 'c'
    if c=='g': return 'gh' if soft else 'g'
    if c=='ch': return 'c' if soft else ('ci' if nv else 'c')
    if c=='dj': return 'g' if soft else ('gi' if nv else 'dj')
    if c=='sh': return 'sc' if soft else ('sci' if nv else 'sc')
    if c=='lh': return 'gl' if nv=='i' else 'gli'
    return {'R':'rr','zh':'j','nh':'gn','z':'s','y':'i','w':'u'}.get(c,c)

def _ren(toks,lang):
    out='';n=len(toks);k=0
    while k<n:
        t=toks[k]
        nxt=toks[k+1] if k+1<n else None
        if t in VOW:
            if nxt=='~':
                g=toks[k+2] if k+2<n and toks[k+2] in GLI else None
                if g and (t,g) in NASD[lang]:
                    out+=NASD[lang][(t,g)]; k+=3; continue
                out+=NAS[lang][t]; k+=2; continue
            if lang=='en' and nxt in GLI and (t,nxt) in END:
                out+=END[(t,nxt)]; k+=2; continue
            if (t=='u' and nxt=='w') or (t=='i' and nxt=='y'):
                out+=V[lang][t]; k+=2; continue
            out+=V[lang][t]; k+=1; continue
        if t=='~': k+=1; continue
        prev=toks[k-1] if k>0 else None
        if t in GLI and prev in VOW:          # semi-voyelle après voyelle
            if (t=='w' and prev=='u') or (t=='y' and prev=='i'): k+=1; continue   # uw -> u, iy -> i
            out+={'en':{'y':'y','w':'w'},'fr':{'y':'ï','w':'ou'},'es':{'y':'i','w':'u'},'it':{'y':'i','w':'u'}}[lang][t]
            k+=1; continue
        nv=nxt if nxt in VOW else None
        out+=_cons(t,lang,nv,prev); k+=1
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
    'l':'l','r':'r','R':'kh','ch':'ch','dj':'ch','sh':'sh','zh':'zh','lh':'l','nh':'n','y':'j','w':'v',
    'a':'a','e':'e','E':'e','i':'i','o':'o','O':'o','u':'u'}

def _hzsyl(toks):
    out=[];seen=False
    for k,t in enumerate(toks):
        if t=='~': out.append('n'); continue
        if t in GLI and seen: continue          # semi-voyelle de diphtongue : ignorée
        if t in VOW: seen=True
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
    for t,tr in [("Olá.","o-*la"),("Obrigado.","o-bri-*ga-du"),("Bom dia!","bo~ *dji-a"),("Tudo bem?","*tu-du be~y"),
                 ("Não.","na~w"),("Mãe","ma~y"),("Eu sou do Brasil.","ew so du bra-*ziw"),("Muito prazer.","*mu~y-tu pra-*zeR"),
                 ("leite","*ley-chi"),("trabalho","tra-*ba-lhu"),("vinho","*vi-nhu"),("carro","*ka-Ru"),("café","ka-*fE"),
                 ("cidade","si-*da-dji"),("Onde fica?","*o~-dji *fi-ka"),("chave","*sha-vi"),("hoje","*o-zhi"),("pão","pa~w"),("avó / avô","a-*vO a-*vo")]:
        print(t,'|',*phon_all(tr),sep=' ')

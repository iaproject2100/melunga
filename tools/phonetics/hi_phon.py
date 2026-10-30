# -*- coding: utf-8 -*-
# hi_phon.py — générateur phonétique HINDI Melunga
# Entrée : prononciation RÉELLE, syllabée, écrite par le rédacteur (schwa final/médian déjà supprimé)
#   - mots séparés par des espaces, syllabes par '-', syllabe tonique préfixée par '*'
#   - voyelles : a (ə bref), aa, i, ii, u, uu, e, ai (ɛː), o, au (ɔː) ; '~' = nasalisation (haa~)
#   - consonnes : k kh g gh ch chh j jh t th d dh n p ph b bh m y r l v s sh h
#     rétroflexes en MAJUSCULE : T Th D Dh N R (ड़) Rh (ढ़) S (ष) ; emprunts : q x(ख़) G(ग़) z f
# Sorties : py (EN), pf (FR), ps (ES), pi (IT), phon (汉字)
import sys
sys.path.insert(0,'/home/claude')
import ru_phon as _ru

SEGS=['chh','kh','gh','ch','jh','Th','th','Dh','dh','ph','bh','sh','ng','ny','Rh',
      'aa','ii','uu','ai','au','~']+list('kgjtdnpbmyrlvshTDNRSqxGzfaeiou')
VOW={'a','aa','i','ii','u','uu','e','ai','o','au'}
ASP={'kh':'k','gh':'g','chh':'ch','jh':'j','th':'t','Th':'T','dh':'d','Dh':'D','ph':'p','bh':'b','Rh':'R'}

def _tok(s):
    out=[];i=0
    while i<len(s):
        for g in SEGS:
            if s.startswith(g,i): out.append(g); i+=len(g); break
        else: i+=1
    return out

V={'en':{'a':'uh','aa':'aa','i':'i','ii':'ee','u':'u','uu':'oo','e':'ay','ai':'eh','o':'oh','au':'aw'},
   'fr':{'a':'a','aa':'â','i':'i','ii':'î','u':'ou','uu':'oû','e':'é','ai':'è','o':'o','au':'o'},
   'es':{'a':'a','aa':'aa','i':'i','ii':'ii','u':'u','uu':'uu','e':'e','ai':'e','o':'o','au':'o'},
   'it':{'a':'a','aa':'aa','i':'i','ii':'ii','u':'u','uu':'uu','e':'e','ai':'e','o':'o','au':'o'}}
FRONT={'e','i','ii','ai'}

def _base(c,lang,nv,prev):
    if lang=='en':
        return {'ch':'ch','j':'j','sh':'sh','S':'sh','y':'y','v':'v','x':'kh','G':'gh','q':'q',
                'T':'t','D':'d','N':'n','R':'r','ng':'ng','ny':'ny'}.get(c,c)
    if lang=='fr':
        if c=='g' and nv in FRONT: return 'gu'
        if c=='s' and prev in VOW and nv in VOW: return 'ss'
        return {'ch':'tch','j':'dj','sh':'ch','S':'ch','y':'y','v':'v','x':'kh','G':'gh','q':'q',
                'T':'t','D':'d','N':'n','R':'r','ng':'ng','ny':'gn'}.get(c,c)
    if lang=='es':
        if c=='g' and nv in FRONT: return 'gu'
        return {'ch':'ch','j':'y','sh':'sh','S':'sh','y':'y','v':'v','h':'j','x':'j','G':'g','q':'k',
                'z':'s','T':'t','D':'d','N':'n','R':'r','ng':'ng','ny':'ñ'}.get(c,c)
    # it
    soft = nv in FRONT
    if c=='k': return 'ch' if soft else 'c'
    if c=='g': return 'gh' if soft else 'g'
    if c=='ch': return 'c' if soft else ('ci' if nv else 'c')
    if c=='j': return 'g' if soft else ('gi' if nv else 'dj')
    if c in ('sh','S'): return 'sc' if soft else ('sci' if nv else 'sc')
    return {'y':'i','v':'v','x':'kh','G':'gh','q':'k','z':'s','T':'t','D':'d','N':'n','R':'r',
            'ng':'ng','ny':'gn'}.get(c,c)

def _ren(toks,lang):
    out='';n=len(toks)
    for k,t in enumerate(toks):
        nv=toks[k+1] if k+1<n and toks[k+1] in VOW else None
        prev=toks[k-1] if k>0 else None
        if t=='~': out+='n'; continue
        if t in VOW:
            r=V[lang][t]
            if lang=='en' and t=='a' and k+1<n and toks[k+1] not in VOW and toks[k+1]!='~': r='u'
            out+=r; continue
        if t in ASP:
            b=_base(ASP[t],lang,nv,prev)
            if lang=='es': out+=b+'j'
            else: out+=b+"'h"
            continue
        out+=_base(t,lang,nv,prev)
    return out

def _acc(seg,table):
    for i,ch in enumerate(seg):
        if ch in table: return seg[:i]+table[ch]+seg[i+1:]
    return seg

HZ={'k':'k','kh':'k','q':'k','g':'g','gh':'g','G':'g','ch':'ch','chh':'ch','j':'ch','jh':'ch',
    't':'t','th':'t','T':'t','Th':'t','d':'d','dh':'d','D':'d','Dh':'d','n':'n','N':'n','ng':'n','ny':'n',
    'p':'p','ph':'p','b':'b','bh':'b','m':'m','y':'j','r':'r','R':'r','Rh':'r','l':'l','v':'v',
    's':'s','sh':'sh','S':'sh','h':'kh','x':'kh','z':'z','f':'f',
    'a':'a','aa':'a','i':'i','ii':'i','u':'u','uu':'u','e':'e','ai':'e','o':'o','au':'o'}

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
        hz+=_ru._hz([HZ[t] for t in toks if t in HZ])
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
    for t,tr in [("नमस्ते","na-*mas-te"),("धन्यवाद","*dhan-ya-vaad"),("हाँ","haa~"),("नहीं","na-*hii~"),
                 ("आप कैसे हैं?","aap *kai-se hai~"),("मैं ठीक हूँ।","mai~ *Thiik huu~"),("मेरा नाम राज है।","*me-raa naam raaj hai"),
                 ("पानी","*paa-nii"),("खाना","*khaa-naa"),("भारत","*bhaa-rat"),("बच्चा","*bach-chaa"),("घर","ghar"),("ज़िंदगी","*zin-da-gii"),("पढ़ना","*paRh-naa")]:
        print(t,'|',*phon_all(tr),sep=' ')

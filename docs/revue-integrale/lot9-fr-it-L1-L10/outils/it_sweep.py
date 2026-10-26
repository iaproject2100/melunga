import sys,json,re,collections
sys.path.insert(0,'tools')
import build; build.ROOT='/home/claude/edition'
idx=build.load_cards('fr-it')
# nasal: vowel a/e/i/o/u (not preceded by o for 'ou', not é/è) + single n/m, followed by '-'+consonant, or by space/end
rx=re.compile(r'(?<![oOéÉèÈ])([aeiouAEIOUàìòùÀÌÒÙ])([nmNM])(?![nmNM])(?=(-[bcdfghjklpqrstvzBCDFGHJKLPQRSTVZ])|[\s,.!?;:/]|$)')
H=[];tok=collections.Counter();conv=collections.Counter()
for i,e in idx.items():
    ph=e['card'].get('phon') or ''
    for m in rx.finditer(ph):
        # skip 'ou'+n handled by lookbehind of o? 'oun': o-u-n -> vowel u preceded by o -> lookbehind on u char: (?<![oO]) checks char before u = o -> skip. good
        st=max(0,m.start()-4); tok[ph[st:m.end()+3]]+=1
        H.append((i,e['card']['study'],ph,m.group(0)))
    conv['nn']+=len(re.findall(r'[aeiou]nn',ph)); conv['mm']+=len(re.findall(r'[aeiou]mm',ph))
print('hits',len(H),'cards',len({h[0] for h in H}),conv)
c=collections.Counter(h[3].lower() for h in H);print(c)
for h in H[:400]: print(h[0].split(':')[-1][-24:],'|',h[1],'|',h[2],'|',h[3])
print('== FRANCAIS')
for i,e in idx.items():
    if re.search(r'(?i)italian',e['card']['study']) and re.search(r'(?i)fran[cç]ais',e['card']['native']): print(i,e['card']['study'],'|',e['card']['native'])
print('== SIGLES')
for i,e in idx.items():
    s=e['card']['study']
    if re.search(r'\b[A-Z]{2,}\b|\b[A-Z]/[A-Z]\b',s): print(i.split(':')[-1],'|',s,'|',e['card']['phon'])
print('== NUMS')
for i,e in idx.items():
    if re.search(r'\d',e['card']['study']): print(i.split(':')[-1],'|',e['card']['study'],'|',e['card']['phon'])

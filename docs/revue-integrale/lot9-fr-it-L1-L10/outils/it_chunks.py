import json,math,sys
ROOT='/home/claude/edition';B='melunga_deploy/content/niveaux-progressifs';P='fr-it';O='/tmp/claude-0/-home-claude/be89a11b-450d-53fe-9c0d-7b9f183e8f46/scratchpad/lot9'
def line(loc,p):
    m='aide-déjà-corrigée-par-Claude' if p.get('phoneticCorrection') else ''
    f=lambda s:(s or '').replace('\n',' / ').replace('|','¦')
    return f"[{loc}] {p['id']} | {p.get('contentType')} | {f(p['study'])} | {f(p.get('phon'))} | {f(p['native'])} | {m}"
th=open(f'{O}/themes-{P}.txt','w')
for L in range(1,11):
    d=json.load(open(f'{ROOT}/{B}/{P}/L{L}.json'))
    th.write(f"L{L} — {d['levelTitle']}\n"+''.join(f"  {t['id']} — « {t['title']} » ({len(t['phrases'])} cartes)\n" for t in d['themes']))
    items=[]
    for ti,t in enumerate(d['themes']):
        for pi,p in enumerate(t['phrases']): items.append((t,f'themes/{ti}/phrases/{pi}',p))
    for ri,p in enumerate(d['reserve']): items.append((None,f'reserve/{ri}',p))
    if L==1: open(f'{O}/reference-L1.txt','w').write('# Référence : cartes fr-es L1 (ÉTUDE | AIDE)\n'+''.join(f"{p['study']} | {p.get('phon')}\n" for _,_,p in items))
    k=max(1,round(len(items)/250)); size=math.ceil(len(items)/k)
    for c in range(k):
        part=items[c*size:(c+1)*size]; cur=None
        out=[f"# {P} L{L} — {d['levelTitle']} — partie {c+1}/{k} — {len(part)} cartes","# Format : [loc] id | type | ÉTUDE (italien) | AIDE (pour francophones) | GLOSE FR | marques"]
        for t,loc,p in part:
            key=t['id'] if t else 'reserve'
            if key!=cur: cur=key; out.append('' ); out.append(f"## {t['id']} — « {t['title']} »" if t else '## reserve — cartes en réserve (sans thème)')
            out.append(line(loc,p))
        open(f'{O}/{P}-L{L}-part{c+1}.txt','w').write('\n'.join(out)+'\n')
r=json.load(open(f'{ROOT}/{B}/repertoires/{P}.json'))
out=[f"# {P} — modèles reçus (receivedModels) — {len(r['receivedModels'])} cartes","# Format : [loc] id | type | ÉTUDE | AIDE | GLOSE FR | marques ; niveau éditorial entre crochets",'']
for i,p in enumerate(r['receivedModels']): out.append(line(f"receivedModels/{i}",p)+f" [niveau {p.get('editorialLevel')}]")
open(f'{O}/{P}-recus.txt','w').write('\n'.join(out)+'\n')

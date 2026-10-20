# -*- coding: utf-8 -*-
"""Les dialogues demandent-ils plus que ce que les variantes préparent ?
Pour chaque dialogue : part des briques de ses répliques jamais vues dans les variantes
du même niveau ni dans les niveaux précédents."""
import json, glob, re, collections
C = "c49/melunga_deploy/content/conversation"
def toks(s, lang):
    if lang in ("zh","ja"): return [c for c in s if '぀' <= c <= '鿿']
    if lang == "ko": return re.findall(r"[가-힯]+", s)
    return re.findall(r"[^\W\d_]+", s.lower(), re.UNICODE)
pairs = sorted({(p.split('/')[-1].split('-')[1], p.split('/')[-1].split('-')[2].split('.')[0]) for p in glob.glob(f"{C}/L*-*.json")})
print(f"{'couple':10} " + " ".join(f"L{n:<4}" for n in range(1,11)) + "   (% de briques du dialogue non préparées)")
agg_n = collections.Counter(); agg_t = collections.Counter(); worst = []
for nat, study in pairs:
    seen, row = set(), []
    for n in range(1, 11):
        try: doc = json.load(open(f"{C}/L{n}-{nat}-{study}.json", encoding="utf-8"))
        except OSError: row.append("  -  "); continue
        var = set()
        for u in doc["units"]:
            for v in u["variants"]: var |= set(toks(v["study"], study))
        prepared = seen | var
        for d in doc["dialogues"]:
            dt = set(t for x in d["turns"] for t in toks(x["study"], study))
            miss = dt - prepared
            if dt: worst.append((100*len(miss)/len(dt), d["id"], len(miss), len(dt)))
        dall = set(t for d in doc["dialogues"] for x in d["turns"] for t in toks(x["study"], study))
        m = dall - prepared
        row.append(f"{100*len(m)/max(1,len(dall)):4.0f}%")
        agg_n[n] += len(m); agg_t[n] += len(dall)
        seen = prepared | dall
    print(f"{nat}→{study:<7} " + " ".join(row))
print("\nmoyenne  " + " ".join(f"{100*agg_n[n]/max(1,agg_t[n]):4.0f}%" for n in range(1,11)))
worst.sort(reverse=True)
print("\nDialogues les moins préparés :")
for p, i, m, t in worst[:8]: print(f"   {i:<16} {p:3.0f}% ({m}/{t} briques nouvelles)")

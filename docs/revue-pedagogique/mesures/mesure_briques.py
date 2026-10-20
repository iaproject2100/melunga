# -*- coding: utf-8 -*-
"""Mesure la préparation des briques : pour chaque niveau, part des mots/caractères d'une phrase
qui n'ont jamais été vus aux niveaux précédents du même couple de langues.
Mot = suite de lettres ; pour zh/ja, caractère. Indicateur grossier mais comparable entre niveaux."""
import json, glob, re, collections
C = "c49/melunga_deploy/content/conversation"
def toks(s, lang):
    if lang in ("zh", "ja"): return [c for c in s if '぀' <= c <= '鿿']
    if lang == "ko": return re.findall(r"[가-힯]+", s)
    return re.findall(r"[^\W\d_]+", s.lower(), re.UNICODE)
pairs = sorted({(f.split('-')[1], f.split('-')[2].split('.')[0]) for f in map(lambda p: p.split('/')[-1], glob.glob(f"{C}/L*-*.json"))})
print(f"{'couple':10} " + " ".join(f"L{n:<4}" for n in range(1, 11)) + "   (% de briques nouvelles par niveau)")
glob_new = collections.Counter(); glob_tot = collections.Counter()
for nat, study in pairs:
    seen, row = set(), []
    for n in range(1, 11):
        try: doc = json.load(open(f"{C}/L{n}-{nat}-{study}.json", encoding="utf-8"))
        except OSError: row.append("  -  "); continue
        t = []
        for u in doc["units"]:
            for v in u["variants"]: t += toks(v["study"], study)
        for d in doc["dialogues"]:
            for x in d["turns"]: t += toks(x["study"], study)
        new = [w for w in t if w not in seen]
        pct = 100 * len(set(new)) / max(1, len(set(t)))
        row.append(f"{pct:4.0f}%")
        glob_new[n] += len(set(new)); glob_tot[n] += len(set(t))
        seen |= set(t)
    print(f"{nat}→{study:<7} " + " ".join(row))
print("\nmoyenne  " + " ".join(f"{100*glob_new[n]/max(1,glob_tot[n]):4.0f}%" for n in range(1, 11)))

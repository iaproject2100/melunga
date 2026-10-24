# -*- coding: utf-8 -*-
"""Étape 3 — cohérence syllabe à syllabe pour zh, ja, ko.
Un caractère chinois = une syllabe ; un bloc hangeul = une syllabe ; pour le
japonais on aligne sur le kana du champ reading quand il est disponible.
Lecture seule."""
import json, os, re, sys, unicodedata
from collections import Counter, defaultdict

REPO = sys.argv[1]
SCR = os.path.dirname(os.path.abspath(__file__))
os.chdir(REPO)
FIELD = {"zh": "phf", "ja": "pf", "ko": "pf"}
src = open("melunga_deploy/app.html", encoding="utf-8").read()
i = src.index("var DECKS = ") + len("var DECKS = ")
DECKS = json.loads(src[i:src.index("\n", i)].rstrip(";"))


def han(t):
    return [c for c in t if "一" <= c <= "鿿"]


def hangul(t):
    return [c for c in t if "가" <= c <= "힣"]


def syl(p):
    return [x for x in re.split(r"[\s\-]+", p.strip()) if x]


def build(lang, splitter):
    lex = defaultdict(Counter)
    pool = [(e.get("t", ""), e.get(FIELD[lang]) or "") for e in (DECKS.get(lang) or [])]
    root = "melunga_deploy/content/conversation"
    for fn in os.listdir(root):
        if not (fn.endswith(".json") and fn.startswith("L")):
            continue
        p = fn[:-5].split("-")
        if len(p) != 3 or p[2] != lang:
            continue
        d = json.load(open(f"{root}/{fn}", encoding="utf-8"))
        for u in d["units"]:
            for v in u["variants"]:
                pool.append((v["study"], v["phon"]))
        for dg in d["dialogues"]:
            for t in dg["turns"]:
                pool.append((t["study"], t["phon"]))
    for st, ph in pool:
        if not st or not ph:
            continue
        S, T = splitter(st), syl(ph)
        if len(S) == len(T) and S:
            for s, t in zip(S, T):
                lex[s][t.strip(".,!?;:，。！？")] += 1
    return lex


rows = json.load(open(os.path.join(SCR, "aides.json"), encoding="utf-8"))
newly = [r for r in rows if r["status"] == "pending-Claude"]
out = []
print("=== COHÉRENCE SYLLABE À SYLLABE, écritures non latines ===\n")
for pair, lang, sp in (("fr-zh", "zh", han), ("fr-ko", "ko", hangul)):
    lex = build(lang, sp)
    stable = {k: c.most_common(1)[0][0] for k, c in lex.items()
              if sum(c.values()) >= 3 and c.most_common(1)[0][1] / sum(c.values()) >= 0.9}
    mine = [r for r in newly if r["pair"] == pair]
    checked = clash = 0
    seen = defaultdict(list)
    for r in mine:
        S, T = sp(r["study"] or ""), syl(r["phon"] or "")
        if len(S) != len(T):
            continue
        for s, t in zip(S, T):
            if s not in stable:
                continue
            checked += 1
            a, b = stable[s], t.strip(".,!?;:，。！？")
            if a.lower() != b.lower():
                clash += 1
                seen[(s, a, b)].append(r["id"])
    print(f"── {pair}  référence : {len(stable)} syllabes au rendu stable")
    print(f"   {checked} rendus comparables · {clash} divergences")
    for (s, a, b), ids in sorted(seen.items(), key=lambda x: -len(x[1]))[:10]:
        print(f"     « {s} » corpus = {a:<14} lot = {b:<14} ({len(ids)} fois)  ex. {ids[0]}")
        out.append({"pair": pair, "unit": s, "corpus": a, "lot": b, "count": len(ids), "ids": ids[:6]})
    print()

# japonais : alignement moins sûr, on se limite aux énoncés courts
print("── fr-ja : l'alignement kana/syllabe n'est pas fiable automatiquement.")
ja = [r for r in newly if r["pair"] == "fr-ja"]
print(f"   {len(ja)} aides japonaises à relire ; contrôle de convention seulement (étape suivante).")

json.dump(out, open(os.path.join(SCR, "divergences_cjk.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"\n→ {sum(r['count'] for r in out)} divergences syllabiques retenues")

# -*- coding: utf-8 -*-
"""Règle C — zh→fr : « les » repéré par 雷 (léi) et non 莱 (lái).

Le français « les » vaut /le/ ; 雷 léi en est proche, 莱 lái introduit une
diphtongue absente. On ne remplace que le jeton STRICTEMENT égal à 莱 et
aligné sur le mot « les » : le même caractère dans 托瓦莱特 (toilettes),
德莱 (délai) ou 普雷 doit rester intact.
"""
import json, os, re, sys
from collections import Counter

REPO = sys.argv[1]
SCR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(REPO, "melunga_deploy/content/niveaux-progressifs")
APPLY = "--apply" in sys.argv


def flat(d):
    o = []
    for t in (d.get("themes") or []) + (d.get("heldThemes") or []):
        o += (t.get("phrases") or [])
    return o + (d.get("reserve") or [])


reg, tot, skipped = [], 0, 0
for lv in range(1, 11):
    f = os.path.join(ROOT, "zh-fr", f"L{lv}.json")
    d = json.load(open(f, encoding="utf-8"))
    ch = 0
    for p in flat(d):
        st, ph = (p.get("study") or ""), (p.get("phon") or "")
        if "莱" not in ph:
            continue
        toks = ph.split()
        mots = [w for w in re.split(r"[^A-Za-zÀ-ÿ']+", st) if w]
        nles = sum(1 for w in mots if w.lower() == "les")
        nseuls = sum(1 for t in toks if t == "莱")
        if nseuls == 0 or nles == 0:
            continue
        if len(toks) == len(mots):
            new = [("雷" if (t == "莱" and w.lower() == "les") else t)
                   for t, w in zip(toks, mots)]
        elif nseuls <= nles:
            # alignement positionnel impossible mais le jeton isolé ne peut
            # représenter que « les » : il n'y a pas d'autre mot d'une syllabe
            # rendu par ce seul caractère dans ces aides
            new = [("雷" if t == "莱" else t) for t in toks]
        else:
            skipped += 1
            continue
        if new != toks:
            old = ph
            p["phon"] = " ".join(new)
            p["phoneticReviewStatus"] = "corrected-by-Claude-les-lei"
            ch += 1
            tot += 1
            reg.append({"pair": "zh-fr", "level": lv, "id": p.get("id"),
                        "study": st, "native": p.get("native"),
                        "avant": old, "apres": p["phon"], "regle": "C"})
    if APPLY and ch:
        with open(f, "w", encoding="utf-8") as fh:
            json.dump(d, fh, ensure_ascii=False, separators=(",", ":"))
            fh.write("\n")

print("=== règle C — zh→fr : 莱 → 雷 pour « les » ===")
print(f"   {tot} aides corrigées, {skipped} écartées faute d'alignement sûr\n")
for x in reg[:6]:
    print(f"   L{x['level']} {x['study'][:44]}")
    print(f"      avant : {x['avant']}")
    print(f"      après : {x['apres']}")

# contrôle : aucun 莱 d'un autre mot n'a bougé
print("\n   contrôle — occurrences de 莱 restantes (dans d'autres mots) :")
restant = Counter()
for lv in range(1, 11):
    d = json.load(open(os.path.join(ROOT, "zh-fr", f"L{lv}.json"), encoding="utf-8"))
    for p in flat(d):
        ph = p.get("phon") or ""
        for t in ph.split():
            if "莱" in t:
                restant[t] += 1
print("      " + " · ".join(f"«{k}»×{v}" for k, v in restant.most_common(8)))

json.dump(reg, open(os.path.join(SCR, "regC.json"), "w", encoding="utf-8"), ensure_ascii=False)
print(f"\n→ regC.json : {len(reg)} corrections")

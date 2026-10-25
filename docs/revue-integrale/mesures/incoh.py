# -*- coding: utf-8 -*-
"""Incohérences phonétiques CERTAINES : même forme étudiée, deux aides différentes.

C'est le seul test phonétique qui ne dépend d'aucune convention à trancher :
si la même phrase, ou le même caractère au même rang dans la même phrase,
reçoit deux rendus différents dans le corpus, l'un des deux est faux. On ne
tranche pas lequel par la majorité — on le tranche à la lecture.

Deux niveaux :
  A. forme étudiée identique (chaîne exacte) → aides différentes.
  B. pour zh/ko, caractère ou bloc identique à l'intérieur de phrases de même
     longueur → syllabes différentes, en notant la position (initiale/médiane).
Lecture seule.
"""
import json, os, re, sys, unicodedata
from collections import Counter, defaultdict

SCR = os.path.dirname(os.path.abspath(__file__))
inv = json.load(open(os.path.join(SCR, "inventaire.json"), encoding="utf-8"))
rows = [r for r in inv["rows"] if r.get("phon")]
PAIRS = ["fr-en", "fr-es", "fr-it", "fr-zh", "fr-ja", "fr-ko", "zh-fr"]


def key(t):
    return re.sub(r"\s+", "", (t or "")).strip("。，！？、.,!?;:¡¿ ")


print("=== A. MÊME FORME ÉTUDIÉE, AIDES DIFFÉRENTES ===")
print("    (faute certaine : indépendante de toute convention)\n")
A = []
for p in PAIRS:
    g = defaultdict(list)
    for r in rows:
        if r["pair"] != p:
            continue
        g[key(r["study"])].append(r)
    bad = 0
    for k, rs in g.items():
        ph = {}
        for r in rs:
            ph.setdefault((r["phon"] or "").strip(), []).append(r)
        if len(ph) > 1 and k:
            bad += 1
            A.append({"pair": p, "study": k, "variants": [
                {"phon": a, "n": len(b), "ids": [x["id"] for x in b][:4],
                 "levels": sorted(set(x["level"] for x in b if x["level"])),
                 "native": b[0]["native"]} for a, b in
                sorted(ph.items(), key=lambda x: -len(x[1]))]})
    print(f"   {p:<7} {len(g):>6} formes distinctes · {bad:>4} portent plusieurs aides")

A.sort(key=lambda x: -sum(v["n"] for v in x["variants"]))
print(f"\n   → {len(A)} formes au total reçoivent plusieurs aides différentes")

print("\n=== B. zh : même caractère, rendus divergents dans le corpus entier ===\n")


def han(t):
    return [c for c in (t or "") if "一" <= c <= "鿿"]


def syl(p):
    return [x for x in re.split(r"[\s\-]+", (p or "").strip()) if x]


B = []
for p, pick in (("fr-zh", "study"), ("zh-fr", None)):
    if p != "fr-zh":
        continue
    pos = defaultdict(lambda: defaultdict(list))
    for r in rows:
        if r["pair"] != p:
            continue
        S, T = han(r["study"]), syl(r["phon"])
        if len(S) != len(T) or not S:
            continue
        for i, (s, t) in enumerate(zip(S, T)):
            place = "initiale" if i == 0 else "mediane"
            pos[s][place].append((t.strip(".,!?;:，。！？").lower(), r))
    for c, places in pos.items():
        for place, lst in places.items():
            cnt = Counter(t for t, _ in lst)
            if len(cnt) > 1 and sum(cnt.values()) >= 4:
                top, n = cnt.most_common(1)[0]
                if n / sum(cnt.values()) < 0.97:
                    B.append({"char": c, "place": place, "total": sum(cnt.values()),
                              "renderings": cnt.most_common(6),
                              "examples": {t: [r["id"] for tt, r in lst if tt == t][:3]
                                           for t, _ in cnt.most_common(4)}})
B.sort(key=lambda x: -x["total"])
print(f"   {len(B)} couples (caractère, position) reçoivent plusieurs rendus\n")
for b in B[:18]:
    rn = " · ".join(f"{t}×{n}" for t, n in b["renderings"])
    print(f"   « {b['char']} » {b['place']:<9} {b['total']:>4} fois : {rn}")

json.dump({"A": A, "B": B}, open(os.path.join(SCR, "incoh.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
print(f"\n→ incoh.json écrit : {len(A)} formes, {len(B)} caractères")

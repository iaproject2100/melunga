# -*- coding: utf-8 -*-
"""Ce que la lecture carte par carte a révélé, mesuré sur les 70 cellules.

Trois défauts qu'aucun test phonétique ne voit, trouvés en lisant le L1 chinois :
  1. la même forme étudiée présentée deux fois dans la même cellule ;
  2. deux formes différentes portant la même traduction française, si bien que
     l'apprenant ne peut pas savoir laquelle employer ;
  3. les coquilles d'aide : suites de lettres qu'aucune autre aide n'emploie.
Lecture seule.
"""
import json, os, re, sys, unicodedata
from collections import Counter, defaultdict

SCR = os.path.dirname(os.path.abspath(__file__))
inv = json.load(open(os.path.join(SCR, "inventaire.json"), encoding="utf-8"))
rows = [r for r in inv["rows"] if r["origin"] == "theme"]
PAIRS = ["fr-en", "fr-es", "fr-it", "fr-zh", "fr-ja", "fr-ko", "zh-fr"]


def nk(t):
    return re.sub(r"\s+", "", (t or "")).strip("。，！？、.,!?;:¡¿ ").lower()


def gk(t):
    t = unicodedata.normalize("NFD", (t or "").lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z' ]+", "", t).strip()


print("=== 1. MÊME FORME ÉTUDIÉE PRÉSENTÉE DEUX FOIS DANS LA MÊME CELLULE ===\n")
tot1 = 0
det1 = []
for p in PAIRS:
    n = 0
    for lv in range(1, 11):
        g = defaultdict(list)
        for r in rows:
            if r["pair"] == p and r["level"] == lv:
                g[nk(r["study"])].append(r)
        for k, rs in g.items():
            if len(rs) > 1 and k:
                n += 1
                aides = {(x["phon"] or "").strip() for x in rs}
                det1.append({"pair": p, "level": lv, "study": rs[0]["study"],
                             "n": len(rs), "aides": sorted(aides),
                             "aidesDifferentes": len(aides) > 1,
                             "gloses": sorted({x["native"] for x in rs}),
                             "themes": sorted({x["themeId"] for x in rs}),
                             "ids": [x["id"] for x in rs]})
    tot1 += n
    print(f"   {p:<8} {n:>4} formes présentées plusieurs fois")
dd = sum(1 for x in det1 if x["aidesDifferentes"])
print(f"\n   total {tot1} · dont {dd} avec des aides DIFFÉRENTES pour la même forme")

print("\n=== 2. DEUX FORMES DIFFÉRENTES, MÊME TRADUCTION FRANÇAISE ===")
print("    (l'apprenant ne peut pas savoir laquelle employer)\n")
tot2 = 0
det2 = []
for p in PAIRS:
    n = 0
    for lv in range(1, 11):
        g = defaultdict(set)
        rec = defaultdict(list)
        for r in rows:
            if r["pair"] == p and r["level"] == lv:
                fr = r["study"] if p == "zh-fr" else r["native"]
                k = gk(fr)
                if len(k) < 3:
                    continue
                etu = r["native"] if p == "zh-fr" else r["study"]
                g[k].add(nk(etu))
                rec[k].append(r)
        for k, s in g.items():
            if len(s) > 1:
                n += 1
                det2.append({"pair": p, "level": lv, "glose": rec[k][0]["native"] if p != "zh-fr" else rec[k][0]["study"],
                             "formes": sorted(s), "n": len(s),
                             "themes": sorted({x["themeId"] for x in rec[k]}),
                             "ids": [x["id"] for x in rec[k]]})
    tot2 += n
    print(f"   {p:<8} {n:>4} traductions portées par plusieurs formes")
print(f"\n   total {tot2}")

print("\n=== 3. COQUILLES : suites de lettres uniques dans tout le corpus ===\n")
det3 = []
for p in PAIRS:
    if p == "zh-fr":
        continue
    tri = Counter()
    where = defaultdict(list)
    for r in rows:
        if r["pair"] != p:
            continue
        for s in re.split(r"[\s\-]+", (r["phon"] or "").lower()):
            s = s.strip(".,!?;:")
            if not s:
                continue
            for i in range(len(s) - 1):
                b = s[i:i + 2]
                tri[b] += 1
                if len(where[b]) < 4:
                    where[b].append(r)
    rares = [(b, c) for b, c in tri.items() if c <= 2 and re.fullmatch(r"[a-zéèêëàâîïôûùç]{2}", b)]
    print(f"   {p:<8} {len(rares):>3} digrammes vus au plus deux fois dans {sum(tri.values())} digrammes")
    for b, c in sorted(rares, key=lambda x: x[1])[:6]:
        r = where[b][0]
        print(f"      « {b} » ×{c}  L{r['level']}  {str(r['study'])[:22]:<24} {r['phon'][:40]}")
        det3.append({"pair": p, "digramme": b, "n": c, "level": r["level"],
                     "study": r["study"], "phon": r["phon"], "id": r["id"]})

json.dump({"doublons": det1, "glosesPartagees": det2, "coquilles": det3},
          open(os.path.join(SCR, "doublons.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
print(f"\n→ doublons.json : {len(det1)} doublons, {len(det2)} gloses partagées, {len(det3)} coquilles candidates")

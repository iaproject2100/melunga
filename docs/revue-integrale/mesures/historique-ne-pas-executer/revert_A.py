# -*- coding: utf-8 -*-
"""Retire la règle A et ne garde que B et C.

La notation de la production écrit un s simple : « dé-sou » dans 872 cartes
sur 872, « an-nyong-ha-sé-yo » dans 22 sur 22, « GRA-sias » dans 27 sur 27.
C'est la stratégie de Kartech ; la règle A la remplaçait. On remet chaque
aide touchée par A seule à sa valeur de 4ec163e, et pour les aides touchées
par A ET B on ne réapplique que B.
"""
import json, os, re, subprocess, sys
from collections import Counter

REPO = sys.argv[1]
SCR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(REPO, "melunga_deploy/content/niveaux-progressifs")
PAIRS = ["fr-en", "fr-es", "fr-it", "fr-zh", "fr-ja", "fr-ko", "zh-fr"]

reg = json.load(open(os.path.join(REPO, "docs/revue-integrale/registre-phonetique.json"),
                     encoding="utf-8"))["corrections"]
par_id = {}
for x in reg:
    par_id.setdefault(x["id"], []).append(x)


def regle_B(ph):
    n = 0

    def rep(m):
        nonlocal n
        n += 1
        g = m.group(1)
        return g + ("u" if g == "g" else "U")

    return re.sub(r"(?<![gG])([gG])(?=[eéèêëiîïyEÉÈÊËIÎÏY])", rep, ph or ""), n


def flat(d):
    o = []
    for t in (d.get("themes") or []) + (d.get("heldThemes") or []):
        o += (t.get("phrases") or [])
    return o + (d.get("reserve") or [])


B_PAIRS = {"fr-zh", "fr-ko"}
garde, rendu = Counter(), Counter()
nouveau = []

for p in PAIRS:
    for lv in range(1, 11):
        f = f"melunga_deploy/content/niveaux-progressifs/{p}/L{lv}.json"
        fp = os.path.join(REPO, f)
        orig = json.loads(subprocess.run(["git", "show", f"4ec163e:{f}"],
                                         capture_output=True, text=True, cwd=REPO).stdout)
        base = {x["id"]: x for x in flat(orig)}
        d = json.load(open(fp, encoding="utf-8"))
        ch = 0
        for ph in flat(d):
            i = ph.get("id")
            if i not in par_id:
                continue
            avant = base[i].get("phon")
            entrees = par_id[i]
            nb = sum(x.get("nB", 0) for x in entrees)
            regles = "".join(x.get("regle", "") or x.get("regles", "") for x in entrees)
            if "C" in regles:
                garde[(p, "C")] += 1
                continue                      # la règle C reste
            if nb and p in B_PAIRS or (nb and p == "fr-es"):
                neuf, k = regle_B(avant)
                if neuf != ph["phon"]:
                    ph["phon"] = neuf
                    ch += 1
                ph["phoneticReviewStatus"] = "corrected-by-Claude-g-devant-e-i"
                garde[(p, "B")] += 1
                nouveau.append({"pair": p, "level": lv, "id": i, "study": ph.get("study"),
                                "native": ph.get("native"), "avant": avant,
                                "apres": neuf, "regle": "B"})
            else:
                if ph["phon"] != avant:
                    ph["phon"] = avant
                    ch += 1
                ph.pop("phoneticReviewStatus", None) if base[i].get("phoneticReviewStatus") is None \
                    else ph.__setitem__("phoneticReviewStatus", base[i]["phoneticReviewStatus"])
                rendu[p] += 1
        if ch:
            with open(fp, "w", encoding="utf-8") as fh:
                json.dump(d, fh, ensure_ascii=False, separators=(",", ":"))
                fh.write("\n")

print("=== RÈGLE A RETIRÉE — la notation de la production est rétablie ===\n")
print("   aides rendues à leur valeur d'origine :")
for p in PAIRS:
    if rendu[p]:
        print(f"      {p:<8} {rendu[p]:>5}")
print(f"      total    {sum(rendu.values()):>5}")
print("\n   corrections conservées :")
for (p, r), n in sorted(garde.items()):
    print(f"      {p:<8} règle {r}  {n:>5}")
print(f"      total    {sum(garde.values()):>5}")
json.dump(nouveau, open(os.path.join(SCR, "registre_BC.json"), "w", encoding="utf-8"),
          ensure_ascii=False)

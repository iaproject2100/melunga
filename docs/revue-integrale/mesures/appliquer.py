# -*- coding: utf-8 -*-
"""Applicateur unique et idempotent des corrections du lot 1.

Remplace `corrige.py` et `revert_A.py`, qui sont désormais archivés et NE
DOIVENT PLUS ÊTRE EXÉCUTÉS : le premier contient encore la règle A retirée,
le second annulerait les 719 corrections B parce que le registre final ne
porte plus la clé `nB` qu'il attend. Codex a signalé les deux pièges.

Ce script ne lit qu'une source de vérité : `registre-phonetique.json`.
Pour chaque correction il compare la valeur actuelle à l'avant ATTENDU :

  valeur == avant  → à appliquer
  valeur == apres  → déjà appliquée, rien à faire
  ni l'un ni l'autre → DÉRIVE, refusée et signalée, rien n'est écrit

Il est donc rejouable sans risque et refuse d'écrire sur un fichier qui a
bougé entre-temps.

    python3 -BI appliquer.py <racine>            # contrôle seul
    python3 -BI appliquer.py <racine> --apply    # écrit
"""
import json, os, sys
from collections import Counter

ROOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
APPLY = "--apply" in sys.argv
REG = os.path.join(ROOT, "docs/revue-integrale/registre-phonetique.json")
CONTENT = os.path.join(ROOT, "melunga_deploy/content/niveaux-progressifs")

reg = json.load(open(REG, encoding="utf-8"))
corr = reg["corrections"]
par_fichier = {}
for x in corr:
    par_fichier.setdefault((x["pair"], x["level"]), []).append(x)


def flat(d):
    o = {}
    for t in (d.get("themes") or []) + (d.get("heldThemes") or []):
        for p in (t.get("phrases") or []):
            o[p["id"]] = p
    for p in (d.get("reserve") or []):
        o[p["id"]] = p
    return o


etat = Counter()
derive = []
ecrits = 0

for (pair, lv), lst in sorted(par_fichier.items()):
    fp = os.path.join(CONTENT, pair, f"L{lv}.json")
    d = json.load(open(fp, encoding="utf-8"))
    idx = flat(d)
    change = 0
    for x in lst:
        p = idx.get(x["id"])
        if p is None:
            etat["identifiant absent"] += 1
            derive.append({**x, "motif": "identifiant absent du fichier"})
            continue
        cur = p.get("phon")
        if cur == x["apres"]:
            etat["déjà appliquée"] += 1
        elif cur == x["avant"]:
            etat["à appliquer"] += 1
            if APPLY:
                p["phon"] = x["apres"]
                p["phoneticReviewStatus"] = (
                    "corrected-by-Claude-g-devant-e-i" if x["regle"] == "B"
                    else "corrected-by-Claude-les-lei")
                change += 1
        else:
            etat["DÉRIVE"] += 1
            derive.append({**x, "motif": "valeur actuelle inattendue",
                           "actuel": cur})
    if APPLY and change:
        if derive:
            print("REFUS : des dérives ont été détectées, rien n'est écrit.")
            break
        with open(fp, "w", encoding="utf-8") as fh:
            json.dump(d, fh, ensure_ascii=False, separators=(",", ":"))
            fh.write("\n")
        ecrits += change

print("=== APPLICATEUR DU LOT 1 ===" + ("  (écriture)" if APPLY else "  (contrôle seul)"))
print(f"\n   {len(corr)} corrections au registre\n")
for k, v in etat.most_common():
    print(f"   {k:<22} {v:>5}")
if derive:
    print(f"\n   ⚠ {len(derive)} dérives — aucune écriture n'a lieu tant qu'elles subsistent :")
    for x in derive[:8]:
        print(f"      {x['id']}  attendu « {x['avant']} »  trouvé « {x.get('actuel')} »")
else:
    print("\n   aucune dérive : chaque aide porte soit l'avant attendu, soit l'après.")
if APPLY:
    print(f"\n   {ecrits} aides écrites")
print("\n   Ce script ne touche que le champ phon et son statut. Il ne connaît")
print("   pas la règle A et ne peut pas la réintroduire.")

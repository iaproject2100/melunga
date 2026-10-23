# -*- coding: utf-8 -*-
"""Squelette d'un module de données pour une autre langue maternelle, à partir des fichiers existants.
  python3 derive_native.py <nat> <étude>   → levels/data_<nat>_<étude>.py
La partie « langue étudiée » (study, reading, structure des unités et des dialogues) est reprise telle quelle des
fichiers L<n>-fr-<étude>.json (ou L<n>-zh-fr.json pour le français). Les champs à réécrire pour le nouveau lecteur
sont préfixés « ?? » : native (traduction), phon (prononciation écrite dans sa langue), situation, readiness, roles.
Le rédacteur remplace chaque « ?? … » puis lance conv_build.py --nat <nat> et validate.py."""
import json, os, sys, pprint
HERE = os.path.dirname(os.path.abspath(__file__))
nat, study = sys.argv[1], sys.argv[2]
src_nat = "zh" if study == "fr" else "fr"
out = f"{HERE}/levels/data_{nat}_{study}.py"
if os.path.exists(out): sys.exit(f"{out} existe déjà")
LEVELS = {}
for n in range(1, 11):
    doc = json.load(open(f"{HERE}/L{n}-{src_nat}-{study}.json", encoding="utf-8"))
    units = []
    for u in doc["units"]:
        model = {"study": u["model"]["study"], "phon": "?? " + u["model"]["phon"], "native": "?? " + u["model"]["native"]}
        if "reading" in u["model"]: model["reading"] = u["model"]["reading"]
        if "note" in u["model"]: model["note"] = "?? " + u["model"]["note"]
        slots = []
        for v in u["variants"]:
            sl = {"study": v["slot"]["study"], "phon": "?? " + v["slot"]["phon"], "native": "?? " + v["slot"]["native"]}
            if "reading" in v["slot"]: sl["reading"] = v["slot"]["reading"]
            sl["_full"] = {"study": v["study"], "native_src": v["native"]}  # référence : phrase complète et sa traduction source
            slots.append(sl)
        units.append(("?? " + u["situation"], model, slots))
    dialogues = []
    for d in doc["dialogues"]:
        turns = [((t["speaker"], t["study"], t["reading"], "?? " + t["phon"], "?? " + t["native"]) if "reading" in t else (t["speaker"], t["study"], "?? " + t["phon"], "?? " + t["native"])) for t in d["turns"]]
        dialogues.append(("?? " + d["situation"], turns, {"roles": {k: "?? " + v for k, v in d.get("roles", {}).items()}, "learnerRole": d.get("learnerRole", "A")}))
    LEVELS[n] = {"units": units, "dialogues": dialogues, "readiness": "?? " + doc["readiness"]}
with open(out, "w", encoding="utf-8") as f:
    f.write('# -*- coding: utf-8 -*-\n')
    f.write(f'# Contenus de conversation : {study} étudié par des lecteurs « {nat} ». Partie étudiée reprise de L<n>-{src_nat}-{study}.json ;\n# champs « ?? » à réécrire pour ce lecteur (traduction, prononciation écrite, situations, rôles, readiness).\n')
    f.write(f'NAT = "{nat}"\nPHON_CONV = "?? convention de prononciation écrite pour ce lecteur"\nREVIEW = "?? statut de relecture"\n')
    f.write("LEVELS = " + pprint.pformat(LEVELS, width=200, sort_dicts=False) + "\n")
print(out, "écrit —", sum(len(L["units"]) for L in LEVELS.values()), "modèles,", sum(len(d[1]) for L in LEVELS.values() for d in L["dialogues"]), "répliques")

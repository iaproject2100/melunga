# -*- coding: utf-8 -*-
"""Vérifie chaque référence L<n>-<nat>-<étude>-<nn> citée dans le dossier de revue :
existence, et si une phrase est citée juste après, correspondance avec le contenu réel."""
import json, glob, os, re, collections
C = "c49/melunga_deploy/content/conversation"
D = "revue/Melunga-proposition-pedagogique"
units = {}
for f in glob.glob(f"{C}/L*-*.json"):
    doc = json.load(open(f, encoding="utf-8"))
    for u in doc["units"]:
        units[u["id"]] = u
    for d in doc["dialogues"]:
        units[d["id"]] = d
missing, ok, quoted_bad, quoted_ok = [], 0, [], 0
ref_rx = re.compile(r'`(L\d+-(?:fr|zh|en)-[a-z]{2}-(?:d?\d+))`\s*(?::\s*«\s*(.+?)\s*»)?')
for md in sorted(glob.glob(f"{D}/*.md")):
    for m in ref_rx.finditer(open(md, encoding="utf-8").read()):
        rid, quote = m.group(1), m.group(2)
        if rid not in units:
            missing.append((os.path.basename(md), rid)); continue
        ok += 1
        if quote:
            u = units[rid]
            texts = []
            if "variants" in u:
                texts = [v["study"] for v in u["variants"]] + [v["native"] for v in u["variants"]] + [u["model"]["study"]]
            else:
                texts = [t["study"] for t in u["turns"]] + [t["native"] for t in u["turns"]]
            norm = lambda s: re.sub(r"[\s'’,.!?¿¡。、，？！…]+", "", s).lower()
            if any(norm(quote) == norm(t) for t in texts): quoted_ok += 1
            else: quoted_bad.append((os.path.basename(md), rid, quote, texts[:4]))
print(f"références citées existantes : {ok} · introuvables : {len(missing)}")
for x in missing: print("   MANQUANTE", x)
print(f"citations vérifiées exactes : {quoted_ok} · divergentes : {len(quoted_bad)}")
for f, rid, q, t in quoted_bad: print(f"   ÉCART {rid} ({f}) : cité « {q} » | réel {t}")

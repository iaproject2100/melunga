# -*- coding: utf-8 -*-
"""Chargeur du périmètre intégral : 70 cellules + 7 répertoires + modèles reçus.
Lecture seule. Produit inventaire.json, utilisé par toutes les passes suivantes."""
import json, os, sys
from collections import Counter, defaultdict

REPO = sys.argv[1] if len(sys.argv) > 1 else "/home/claude/wt-revue"
SCR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(REPO, "melunga_deploy/content/niveaux-progressifs")
PAIRS = ["fr-en", "fr-es", "fr-it", "fr-zh", "fr-ja", "fr-ko", "zh-fr"]

rows = []          # une entrée par identifiant de contenu
cells = {}         # (pair, level) -> métadonnées de cellule
themes = []        # une entrée par thème


def add(p, lv, origin, theme, ph):
    rows.append({
        "pair": p, "level": lv, "origin": origin,
        "themeId": (theme or {}).get("id"),
        "themeTitle": (theme or {}).get("title"),
        "section": (theme or {}).get("section") or (ph.get("placement") or {}).get("section"),
        "themeContentType": (theme or {}).get("contentType"),
        "id": ph.get("id"),
        "study": ph.get("study"), "native": ph.get("native"),
        "phon": ph.get("phon"), "reading": ph.get("reading"),
        "contentType": ph.get("contentType"),
        "lexicalClass": ph.get("lexicalClass"),
        "editorialLevel": ph.get("editorialLevel"),
        "kind": ph.get("kind"), "isTemplate": ph.get("isTemplate"),
        "phoneticReviewStatus": ph.get("phoneticReviewStatus"),
        "semanticStatus": (ph.get("semanticReview") or {}).get("status"),
        "sourceCollection": (ph.get("source") or {}).get("collection"),
        "sourceIndex": (ph.get("source") or {}).get("sourceIndex"),
        "sourceLevel": (ph.get("source") or {}).get("sourceLevel"),
        "fieldMap": (ph.get("source") or {}).get("fieldMap"),
        "placementDomain": (ph.get("placement") or {}).get("domain"),
        "originalDomain": (ph.get("placement") or {}).get("originalDomain"),
        "classification": (ph.get("placement") or {}).get("classification"),
        "prereq": (ph.get("placement") or {}).get("plannedPrerequisiteIndices"),
    })


for p in PAIRS:
    for lv in range(1, 11):
        fp = os.path.join(ROOT, p, f"L{lv}.json")
        if not os.path.exists(fp):
            cells[(p, lv)] = {"missing": True}
            continue
        d = json.load(open(fp, encoding="utf-8"))
        cells[(p, lv)] = {
            "status": d.get("status"), "levelTitle": d.get("levelTitle"),
            "totalPhrases": d.get("totalPhrases"),
            "totalCanonical": d.get("totalCanonicalPhrases"),
            "reserved": d.get("reservedPhrases"), "held": d.get("heldPhrases"),
            "themes": len(d.get("themes") or []),
            "heldThemes": len(d.get("heldThemes") or []),
            "counts": d.get("counts"), "lexCounts": d.get("lexicalClassCounts"),
        }
        for t in (d.get("themes") or []):
            themes.append({
                "pair": p, "level": lv, "id": t.get("id"), "title": t.get("title"),
                "section": t.get("section"), "contentType": t.get("contentType"),
                "domain": t.get("domain"), "total": t.get("totalPhrases"),
                "newCount": t.get("newCount"), "reuseCount": t.get("reuseCount"),
                "densityStatus": t.get("densityStatus"),
                "optional": t.get("optional"),
                "isTemplateCollection": t.get("isTemplateCollection"),
                "sequences": len(t.get("sequences") or []),
            })
            for ph in (t.get("phrases") or []):
                add(p, lv, "theme", t, ph)
        for t in (d.get("heldThemes") or []):
            for ph in (t.get("phrases") or []):
                add(p, lv, "heldTheme", t, ph)
        for ph in (d.get("reserve") or []):
            add(p, lv, "reserve", None, ph)
        for ph in (d.get("heldPhrases") or []) if isinstance(d.get("heldPhrases"), list) else []:
            add(p, lv, "held", None, ph)

# répertoires : modèles reçus et copies de transport
rep = {}
for p in PAIRS:
    fp = os.path.join(ROOT, "repertoires", f"{p}.json")
    if not os.path.exists(fp):
        continue
    d = json.load(open(fp, encoding="utf-8"))
    rep[p] = {"keys": list(d.keys())}
    rm = d.get("receivedModels") or []
    rep[p]["receivedModels"] = len(rm)
    for m in rm:
        rows.append({
            "pair": p, "level": m.get("editorialLevel") or m.get("level"),
            "origin": "receivedModel", "themeId": m.get("themeId"),
            "section": "received", "id": m.get("id"),
            "study": m.get("study"), "native": m.get("native"),
            "phon": m.get("phon"), "reading": m.get("reading"),
            "contentType": m.get("contentType"), "kind": m.get("kind"),
            "phoneticReviewStatus": m.get("phoneticReviewStatus"),
            "sourceCollection": (m.get("source") or {}).get("collection"),
            "sourceIndex": (m.get("source") or {}).get("sourceIndex"),
            "fieldMap": (m.get("source") or {}).get("fieldMap"),
        })
    rep[p]["phrases"] = len(d.get("phrases") or [])

print("=== INVENTAIRE DU PÉRIMÈTRE ===\n")
print(f"entrées chargées (hors dédoublonnage) : {len(rows)}")
byo = Counter(r["origin"] for r in rows)
for k, v in byo.most_common():
    print(f"   {k:<16} {v:>7}")
ids = Counter(r["id"] for r in rows)
print(f"\nidentifiants distincts : {len(ids)}")
dup = {k: v for k, v in ids.items() if v > 1}
print(f"identifiants portés par plusieurs entrées : {len(dup)}")

print("\n=== matrice des 70 cellules : phrases visibles / réserve / thèmes ===\n")
print("        " + "".join(f"{'L'+str(l):>14}" for l in range(1, 11)))
for p in PAIRS:
    line = f"{p:<8}"
    for lv in range(1, 11):
        c = cells.get((p, lv)) or {}
        if c.get("missing"):
            line += f"{'absent':>14}"
        else:
            line += f"{str(c['totalPhrases'])+'/'+str(c['reserved'])+'/'+str(c['themes']):>14}"
    print(line)

tot_vis = sum(c.get("totalPhrases") or 0 for c in cells.values())
tot_res = sum(c.get("reserved") or 0 for c in cells.values())
print(f"\ntotal visibles déclarés : {tot_vis}   réserve déclarée : {tot_res}   somme : {tot_vis+tot_res}")
print(f"entrées réellement lues dans themes[] : {byo['theme']}   dans reserve[] : {byo['reserve']}")

print("\n=== répertoires ===")
for p, v in rep.items():
    print(f"   {p:<7} modèles reçus {v['receivedModels']:>4}   copies de transport {v['phrases']:>5}")
print(f"   total modèles reçus : {sum(v['receivedModels'] for v in rep.values())}")

print("\n=== sections et types de contenu ===")
for k, v in Counter(r.get("section") for r in rows).most_common():
    print(f"   section {str(k):<16} {v:>7}")
print()
for k, v in Counter(r.get("contentType") for r in rows).most_common():
    print(f"   contentType {str(k):<16} {v:>7}")

print("\n=== thèmes ===")
print(f"   {len(themes)} thèmes au total sur les 70 cellules")
print(f"   identifiants de thème distincts : {len(set(t['id'] for t in themes))}")

json.dump({"rows": rows, "themes": themes,
           "cells": {f"{k[0]}|{k[1]}": v for k, v in cells.items()}, "rep": rep},
          open(os.path.join(SCR, "inventaire.json"), "w", encoding="utf-8"),
          ensure_ascii=False)
print(f"\n→ inventaire.json écrit ({len(rows)} entrées)")

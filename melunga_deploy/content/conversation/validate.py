# -*- coding: utf-8 -*-
"""Vérifie les fichiers de contenu conversation : champs manquants, {s} résiduels,
identifiants en double, références de dialogues, minimums (10 modèles × 4 variantes, 3 dialogues de 6 à 10 répliques).
Usage : python3 validate.py [dossier]"""
import json, glob, os, sys
D = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
REQ = ("study", "phon", "native")
errs = []
ids = set()
for f in sorted(glob.glob(f"{D}/L*-*.json")):
    doc = json.load(open(f, encoding="utf-8")); n = os.path.basename(f)
    need_reading = doc["studyLanguage"] in ("zh", "ja", "ko")
    def chk(e, where):
        for k in REQ + (("reading",) if need_reading else ()):
            if not e.get(k): errs.append(f"{n} {where}: champ manquant « {k} »")
        for k, v in e.items():
            if isinstance(v, str) and "{s}" in v: errs.append(f"{n} {where}: « {{s}} » non remplacé dans {k}")
    for k in ("studyLanguage", "nativeLanguage", "phoneticConvention", "reviewStatus", "level", "title", "goal", "units", "dialogues"):
        if k not in doc: errs.append(f"{n}: champ racine manquant « {k} »")
    if doc.get("coverageClaim") not in (None, ""): errs.append(f"{n}: coverageClaim doit rester vide (pas de promesse de couverture)")
    units = doc["units"]
    if len(units) < 10: errs.append(f"{n}: {len(units)} modèles (< 10)")
    for u in units:
        if u["id"] in ids: errs.append(f"{n} {u['id']}: identifiant en double")
        ids.add(u["id"])
        m = u["model"]
        for k in REQ:
            if not m.get(k): errs.append(f"{n} {u['id']}: modèle sans « {k} »")
        if "{s}" not in m["study"]: errs.append(f"{n} {u['id']}: modèle sans emplacement {{s}}")
        if len(u["variants"]) < 4: errs.append(f"{n} {u['id']}: {len(u['variants'])} variantes (< 4)")
        seen = set()
        for i, v in enumerate(u["variants"]):
            chk(v, f"{u['id']}#{i}"); chk(v["slot"], f"{u['id']}#{i}.slot")
            if v["slot"]["study"] not in v["study"]: errs.append(f"{n} {u['id']}#{i}: le morceau remplacé n'apparaît pas dans la phrase")
            if v["study"] in seen: errs.append(f"{n} {u['id']}#{i}: variante en double")
            seen.add(v["study"])
        p = u.get("practice", {})
        for idx in [p.get("discover")] + list(p.get("replace", [])) + [p.get("recall")]:
            if idx is None or idx >= len(u["variants"]): errs.append(f"{n} {u['id']}: practice référence une variante inexistante")
    dl = doc["dialogues"]
    if len(dl) < 3: errs.append(f"{n}: {len(dl)} dialogues (< 3)")
    uids = {u["id"] for u in units}
    for d in dl:
        if d["id"] in ids: errs.append(f"{n} {d['id']}: identifiant en double")
        ids.add(d["id"])
        if not 6 <= len(d["turns"]) <= 10: errs.append(f"{n} {d['id']}: {len(d['turns'])} répliques (hors 6–10)")
        for i, t in enumerate(d["turns"]):
            chk(t, f"{d['id']}#{i}")
            if t.get("speaker") not in ("A", "B"): errs.append(f"{n} {d['id']}#{i}: speaker invalide")
        for r in d.get("reuses", []):
            if r not in uids: errs.append(f"{n} {d['id']}: réutilise un modèle inconnu {r}")
    print(f"{n}: {len(units)} modèles, {sum(len(u['variants']) for u in units)} variantes, {len(dl)} dialogues, {sum(len(d['turns']) for d in dl)} répliques")
if os.path.exists(f"{D}/matrix.json"):
    mx = json.load(open(f"{D}/matrix.json", encoding="utf-8"))
    lv = mx["levels"] if isinstance(mx, dict) and "levels" in mx else mx
    if len(lv) != 10: errs.append(f"matrix.json: {len(lv)} niveaux (≠ 10)")
    else: print("matrix.json: 10 niveaux")
print("\n".join(errs) if errs else "✔ aucune erreur"); sys.exit(1 if errs else 0)

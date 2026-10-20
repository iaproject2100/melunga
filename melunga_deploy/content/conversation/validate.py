# -*- coding: utf-8 -*-
"""Vérifie les fichiers de contenu conversation : champs manquants, {s} résiduels,
identifiants en double, références de dialogues, minimums (10 modèles × 4 variantes, 3 dialogues de 6 à 10 répliques).
Usage : python3 validate.py [dossier] [langue étudiée à vérifier seule, ex. es]"""
import json, glob, os, sys
D = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
REQ = ("study", "phon", "native")
LANGS = ("fr", "en", "es", "zh", "it", "ja", "ko")
studied = set()
errs = []
warns = []
ids = set()
files_seen = set()
ONLY = sys.argv[2] if len(sys.argv) > 2 else None
for f in sorted(glob.glob(f"{D}/L*-*.json")):
    if ONLY and not f.endswith(f"-{ONLY}.json"): continue
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
            if not isinstance(idx, int) or isinstance(idx, bool) or idx < 0 or idx >= len(u["variants"]): errs.append(f"{n} {u['id']}: practice référence une variante inexistante ({idx!r})")
        if not p.get("replace"): errs.append(f"{n} {u['id']}: practice.replace vide")
        if u["id"].split("-")[0] != f"L{doc['level']}" or u["id"].split("-")[1:3] != [doc["nativeLanguage"], doc["studyLanguage"]]: errs.append(f"{n} {u['id']}: identifiant incohérent avec niveau / langues")
    dl = doc["dialogues"]
    if len(dl) < 3: errs.append(f"{n}: {len(dl)} dialogues (< 3)")
    uids = {u["id"] for u in units}
    for lv in range(1, doc["level"]):  # modèles des niveaux antérieurs du même couple de langues
        pf = f"{D}/L{lv}-{doc['nativeLanguage']}-{doc['studyLanguage']}.json"
        if os.path.exists(pf): uids |= {u["id"] for u in json.load(open(pf, encoding="utf-8"))["units"]}
    for d in dl:
        if d["id"] in ids: errs.append(f"{n} {d['id']}: identifiant en double")
        ids.add(d["id"])
        if not 6 <= len(d["turns"]) <= 10: errs.append(f"{n} {d['id']}: {len(d['turns'])} répliques (hors 6–10)")
        for i, t in enumerate(d["turns"]):
            chk(t, f"{d['id']}#{i}")
            if t.get("speaker") not in ("A", "B"): errs.append(f"{n} {d['id']}#{i}: speaker invalide")
        for r in d.get("reuses", []):
            if r not in uids: errs.append(f"{n} {d['id']}: réutilise un modèle inconnu {r}")
        if not d.get("reuses"): errs.append(f"{n} {d['id']}: aucun modèle réutilisé détecté")
        r = d.get("roles")
        if r is not None:
            if not (isinstance(r, dict) and r.get("A") and r.get("B") and r["A"] != r["B"]): errs.append(f"{n} {d['id']}: roles invalides {r!r}")
            if d.get("learnerRole") not in ("A", "B"): errs.append(f"{n} {d['id']}: learnerRole doit valoir A ou B")
    if doc["level"] > 1 and not any(int(r.split("-")[0][1:]) < doc["level"] for d in dl for r in d.get("reuses", [])):
        warns.append(f"{n}: aucun dialogue ne réutilise un niveau antérieur")
    studied.add(doc["studyLanguage"]); files_seen.add((doc["level"], doc["nativeLanguage"], doc["studyLanguage"]))
    print(f"{n}: {len(units)} modèles, {sum(len(u['variants']) for u in units)} variantes, {len(dl)} dialogues, {sum(len(d['turns']) for d in dl)} répliques")
if os.path.exists(f"{D}/matrix.json"):
    mx = json.load(open(f"{D}/matrix.json", encoding="utf-8"))
    lv = mx["levels"] if isinstance(mx, dict) and "levels" in mx else mx
    nums = sorted(l.get("level") for l in lv)
    if nums != list(range(1, 11)): errs.append(f"matrix.json: niveaux {nums} (attendu 1 à 10, sans doublon)")
    for l in lv:
        for k in ("title", "goal", "functions", "situations", "structures", "reuse"):
            if k not in l: errs.append(f"matrix.json L{l.get('level')}: champ manquant « {k} »")
        miss = [g for g in LANGS if not l.get("structures", {}).get(g)]
        if miss: errs.append(f"matrix.json L{l.get('level')}: structures manquantes pour {miss}")
        for r in l.get("reuse", []):
            if not isinstance(r, int) or not 1 <= r < l["level"]: errs.append(f"matrix.json L{l['level']}: réutilisation invalide {r!r}")
    if not errs: print("matrix.json: niveaux 1 à 10, 7 langues")
PAIRS = {("fr", g) for g in LANGS if g != "fr"} | {("zh", "fr")}
if not ONLY:
    missing = [f"L{lv}-{nat}-{g}" for lv in range(1, 11) for nat, g in sorted(PAIRS) if (lv, nat, g) not in files_seen]
    if missing: errs.append(f"fichiers manquants ({len(missing)}/70) : {', '.join(missing[:10])}{'…' if len(missing) > 10 else ''}")
    else: print("70 fichiers présents : 10 niveaux × 7 couples de langues")
if warns: print("avertissements :\n" + "\n".join(warns))
if not ONLY and studied and studied != set(LANGS): errs.append(f"langues étudiées présentes {sorted(studied)} ≠ {sorted(LANGS)}")
print("\n".join(errs) if errs else "✔ aucune erreur"); sys.exit(1 if errs else 0)

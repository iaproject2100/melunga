# -*- coding: utf-8 -*-
"""Adaptateur de schéma : rend équivalents le format initial de Codex (conversation-fr-es.json, version 1 :
levels[], clés es/pf/fr, dialogue unique, model = début de phrase) et le format générique de la PR #6
(version 2 : un niveau par fichier, clés study/phon/native[/reading], dialogues[], model = gabarit {s}).

  python3 adapt.py to-generic ../conversation-fr-es.json out_dir/   → out_dir/L<n>-fr-es.json (format v2)
  python3 adapt.py check ../conversation-fr-es.json                  → vérifie la conversion sans écrire

Aucune donnée existante n'est modifiée : l'adaptateur produit des copies.
"""
import json, os, re, sys

def _entry(e, nat, study):
    out = {"study": e[study], "phon": e["pf"], "native": e[nat]}
    return out

def _template(unit, nat, study):
    """Reconstitue le gabarit {s} à partir de la première variante et de son morceau."""
    v = unit["variants"][0]
    tpl = {}
    for key, gkey in ((study, "study"), ("pf", "phon"), (nat, "native")):
        full, part = v[key], v["slot"][key]
        tpl[gkey] = full.replace(part, "{s}", 1) if part and part in full else (unit["model"][key] + " {s}")
    return tpl

def to_generic(doc):
    nat, study = doc["nativeLanguage"], doc["studyLanguage"]
    files = {}
    for L in doc["levels"]:
        n = L["level"]
        units = []
        for i, u in enumerate(L["units"], 1):
            units.append({"id": f"L{n}-{nat}-{study}-{i:02d}", "sourceId": u.get("id"), "situation": u.get("situation", ""),
                          "model": _template(u, nat, study),
                          "variants": [dict(slot=_entry(v["slot"], nat, study), **_entry(v, nat, study)) for v in u["variants"]],
                          "practice": u.get("practice", {"discover": 0, "replace": list(range(1, len(u["variants"]))), "recall": len(u["variants"]) - 1})})
        dl = L.get("dialogues") or ([L["dialogue"]] if L.get("dialogue") else [])
        dialogues = [{"id": f"L{n}-{nat}-{study}-d{j}", "situation": d.get("situation", ""), "turns": [dict(speaker=t["speaker"], **_entry(t, nat, study)) for t in d["turns"]],
                      "practice": d.get("practice", ""), "reuses": [x["id"] for x in units][:4]} for j, d in enumerate(dl, 1)]
        files[f"L{n}-{nat}-{study}.json"] = {
            "version": 2, "format": "conversation-generic", "status": doc.get("status", "converti"), "convertedFrom": "conversation-v1",
            "studyLanguage": study, "nativeLanguage": nat,
            "fields": {"study": f"phrase en {study}", "phon": f"prononciation écrite pour lecteurs {nat}", "native": "traduction en langue maternelle"},
            "phoneticConvention": doc.get("phoneticConvention", ""), "reviewStatus": doc.get("reviewStatus", "statut du fichier d'origine"), "coverageClaim": doc.get("coverageClaim"),
            "level": n, "title": L["title"], "goal": L["goal"], "reviewPreviousLevels": L.get("reviewPreviousLevels", list(range(1, n))),
            "exercisePath": ["découvrir", "remplacer", "essayer sans réponse visible", "converser"],
            "units": units, "dialogues": dialogues, "readiness": L.get("readiness", "")}
    return files

if __name__ == "__main__":
    cmd, src = sys.argv[1], sys.argv[2]
    doc = json.load(open(src, encoding="utf-8"))
    files = to_generic(doc)
    for name, f in files.items():
        bad = [u["id"] for u in f["units"] if "{s}" not in u["model"]["study"]]
        print(f"{name}: {len(f['units'])} modèles, {sum(len(u['variants']) for u in f['units'])} variantes, {len(f['dialogues'])} dialogue(s)" + (f" — gabarit non reconstitué : {bad}" if bad else ""))
    if cmd == "to-generic":
        out = sys.argv[3]; os.makedirs(out, exist_ok=True)
        for name, f in files.items():
            json.dump(f, open(os.path.join(out, name), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print("écrit dans", out)

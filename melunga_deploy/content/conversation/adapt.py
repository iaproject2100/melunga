# -*- coding: utf-8 -*-
"""Adaptateur de schéma : rend équivalents le format initial de Codex (conversation-fr-es.json, version 1 :
levels[], clés es/pf/fr, dialogue unique, model = début de phrase) et le format générique de la PR #6
(version 2 : un niveau par fichier, clés study/phon/native[/reading], dialogues[], model = gabarit {s}).

  python3 adapt.py to-generic ../conversation-fr-es.json out_dir/   → out_dir/L<n>-fr-es.json (format v2)
  python3 adapt.py check ../conversation-fr-es.json                  → vérifie la conversion sans écrire

Règle : les phrases complètes des variantes et des répliques font autorité ; le gabarit {s} est une aide
reconstituée (il peut ne pas redonner la phrase exacte quand l'original porte une exception d'accord ou
d'élision — ces cas sont listés par `check` et marqués `assembled: false` sur la variante). Un consommateur
du format générique affiche toujours variants[i].study / .native, jamais le gabarit rempli.
Aucune donnée existante n'est modifiée : l'adaptateur produit des copies.
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from conv_build import find_reuses, fill, native_fill

def _entry(e, nat, study):
    out = {"study": e[study], "phon": e["pf"], "native": e[nat]}
    return out

def _tpl_from(v, unit, nat, study):
    tpl = {}
    for key, gkey in ((study, "study"), ("pf", "phon"), (nat, "native")):
        full, part = v[key], v["slot"][key]
        tpl[gkey] = full.replace(part, "{s}", 1) if part and part in full else (unit["model"][key] + " {s}")
    return tpl

def _assembles(tpl, v, nat):
    """True si le gabarit rempli redonne exactement la phrase complète (study, phon, native)."""
    g = {"study": v["study"], "phon": v["phon"], "native": v["native"]}
    return all((native_fill(tpl[k], v["slot"][k], nat) if k == "native" else fill(tpl[k], v["slot"][k])) == g[k] for k in g)

def _template(unit, nat, study, variants):
    """Gabarit {s} reconstitué à partir de la variante qui redonne le plus d'autres variantes (les exceptions restent dans les phrases complètes)."""
    best, best_n = None, -1
    for v0 in unit["variants"]:
        tpl = _tpl_from(v0, unit, nat, study)
        n = sum(_assembles(tpl, v, nat) for v in variants)
        if n > best_n: best, best_n = tpl, n
    return best

def to_generic(doc):
    nat, study = doc["nativeLanguage"], doc["studyLanguage"]
    files = {}
    units_by_level = {}
    for L in doc["levels"]:
        n = L["level"]
        units = []
        for i, u in enumerate(L["units"], 1):
            variants = [dict(slot=_entry(v["slot"], nat, study), **_entry(v, nat, study)) for v in u["variants"]]
            tpl = _template(u, nat, study, variants)
            for v in variants:
                if not _assembles(tpl, v, nat): v["assembled"] = False  # exception d'accord / d'élision : la phrase complète fait foi
            units.append({"id": f"L{n}-{nat}-{study}-{i:02d}", "sourceId": u.get("id"), "situation": u.get("situation", ""),
                          "model": tpl, "variants": variants,
                          "practice": u.get("practice", {"discover": 0, "replace": list(range(1, len(u["variants"]))), "recall": len(u["variants"]) - 1})})
        dl = L.get("dialogues") or ([L["dialogue"]] if L.get("dialogue") else [])
        units_by_level[n] = units
        dialogues = []
        for j, d in enumerate(dl, 1):
            T = [dict(speaker=t["speaker"], **_entry(t, nat, study)) for t in d["turns"]]
            dialogues.append({"id": f"L{n}-{nat}-{study}-d{j}", "situation": d.get("situation", ""), "turns": T,
                              "practice": d.get("practice", ""), "reuses": find_reuses(T, units_by_level, n)})
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
    problems = 0
    for name, f in files.items():
        bad = [u["id"] for u in f["units"] if "{s}" not in u["model"]["study"]]
        exc = [(u["id"], v["study"]) for u in f["units"] for v in u["variants"] if v.get("assembled") is False]
        lost = [u["id"] for u in f["units"] if any(not v["study"] or not v["native"] or not v["phon"] for v in u["variants"])]
        noreuse = [d["id"] for d in f["dialogues"] if not d["reuses"]]
        problems += len(bad) + len(lost)
        print(f"{name}: {len(f['units'])} modèles, {sum(len(u['variants']) for u in f['units'])} variantes, {len(f['dialogues'])} dialogue(s), {sum(len(d['reuses']) for d in f['dialogues'])} réutilisations")
        if bad: print("   gabarit non reconstitué :", bad)
        if lost: print("   champs vides :", lost)
        for uid, st in exc: print(f"   exception préservée (phrase complète ≠ gabarit rempli) : {uid} « {st} »")
        if noreuse: print("   dialogues sans réutilisation détectée :", noreuse)
    # contrôle d'intégrité : chaque phrase complète de l'original se retrouve telle quelle dans la conversion
    orig = {(L["level"], v[doc["studyLanguage"]], v[doc["nativeLanguage"]]) for L in doc["levels"] for u in L["units"] for v in u["variants"]}
    conv = {(f["level"], v["study"], v["native"]) for f in files.values() for u in f["units"] for v in u["variants"]}
    if orig != conv: problems += 1; print("   ⚠ phrases complètes perdues ou altérées :", sorted(orig ^ conv)[:5])
    else: print(f"intégrité : {len(orig)} phrases complètes conservées à l'identique")
    if cmd == "check": sys.exit(1 if problems else 0)
    if cmd == "to-generic":
        out = sys.argv[3]; os.makedirs(out, exist_ok=True)
        for name, f in files.items():
            json.dump(f, open(os.path.join(out, name), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print("écrit dans", out)

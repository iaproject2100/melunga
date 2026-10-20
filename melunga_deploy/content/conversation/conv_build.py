# -*- coding: utf-8 -*-
"""Assemblage commun des fichiers de contenu conversation (niveaux 2 à 10).
Données : levels/data_<étude>.py exposant NAT, PHON_CONV, REVIEW, LEVELS.
  LEVELS[n] = {
    "units": [ (situation, model, slots) × ≥10 ],
    "dialogues": [ (situation, turns) × 3 ],
    "readiness": "…",
  }
  model = {"study": "… {s} …", "phon": "… {s} …", "native": "… {s} …"[, "reading": "… {s} …"][, "note": "…"]}
  slot  = {"study", "phon", "native"[, "reading"][, "<champ>Full"]}  — <champ>Full (nativeFull, studyFull, readingFull, phonFull) : phrase complète qui remplace l'assemblage mécanique quand celui-ci est faux (accord, élision, particule)
  turn  = (speaker, study, phon, native)  ou  (speaker, study, reading, phon, native) pour zh/ja/ko
Sortie : melunga_deploy/content/conversation/L<n>-<nat>-<étude>.json et docs/conversation/niveau-L<n>.md
"""
import json, os, re, sys, importlib
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
OUT_DIR = HERE
DOC_DIR = f"{REPO}/docs/conversation"
NAMES = {"fr": "Français", "en": "Anglais", "es": "Espagnol", "zh": "Chinois", "it": "Italien", "ja": "Japonais", "ko": "Coréen"}
NAT_NAMES = {"fr": "francophones", "zh": "sinophones"}
READING = {"zh": "pinyin avec tons", "ja": "lecture en hiragana", "ko": "romanisation révisée"}
MATRIX = json.load(open(f"{HERE}/matrix.json", encoding="utf-8"))
LEVEL_META = {l["level"]: l for l in MATRIX["levels"]}
PUNCT = r"([.?!。？！])\s*[.?!。？！]$"

def fill(tpl, s): return tpl.replace("{s}", s).replace("  ", " ")

def native_fill(tpl, s, nat):
    if nat == "fr":
        if " de {s}" in tpl and re.match(r"^[aeiouéèêhAEIOU]", s): tpl = tpl.replace(" de {s}", " d'{s}")
        if " que {s}" in tpl and re.match(r"^[aeiouéèêhAEIOU]", s): tpl = tpl.replace(" que {s}", " qu'{s}")
    out = fill(tpl, s)
    return out[0].upper() + out[1:] if nat == "fr" and out else out

def compose(model, slot, nat):
    e = {}
    for k in ("study", "phon", "native", "reading"):
        if k in model:
            full = slot.get(k + "Full")  # la phrase complète fait autorité sur l'assemblage mécanique
            e[k] = full or (native_fill(model[k], slot[k], nat) if k == "native" else fill(model[k], slot[k]))
            e[k] = re.sub(PUNCT, r"\1", e[k])
    return e

_END = re.compile(r"[\s.?!。？！,，、]+$")
def _norm(x): return _END.sub("", x.strip()).lower()

def find_reuses(turns, units_by_level, level):
    """Modèles réellement réutilisés par un dialogue : une variante complète apparaît dans une réplique,
    ou tous les fragments fixes du gabarit (hors {s}) apparaissent dans la même réplique.
    units_by_level : {niveau: [unit, …]} pour le même couple de langues, niveaux ≤ level."""
    found = []
    texts = [t["study"].lower() for t in turns]
    for lv in sorted(k for k in units_by_level if k <= level):
        for u in units_by_level[lv]:
            frags = [_norm(f) for f in u["model"]["study"].split("{s}")]
            frags = [f for f in frags if len(f) >= (2 if re.search(r"[\u3040-\u9fff\uac00-\ud7af]", f) else 4)]
            hit = False
            for tx in texts:
                if any(_norm(v["study"]) and _norm(v["study"]) in tx for v in u["variants"]): hit = True; break
                if frags and all(f in tx for f in frags): hit = True; break
            if hit and u["id"] not in found: found.append(u["id"])
    return found

def build(level, study, D, prev_units=None):
    nat, meta, L = D.NAT, LEVEL_META[level], D.LEVELS[level]
    units = []
    for i, (situation, model, slots) in enumerate(L["units"], 1):
        m = dict(model)
        if m["study"] == "{s}" and "note" not in m:
            m["note"] = "Phrase entière à apprendre telle quelle (la langue n'isole pas un morceau remplaçable ici)."
        variants = [dict(slot={k: v for k, v in sl.items() if not k.endswith("Full")}, **compose(model, sl, nat)) for sl in slots]
        units.append({"id": f"L{level}-{nat}-{study}-{i:02d}", "situation": situation, "model": m, "variants": variants,
                      "practice": {"discover": 0, "replace": list(range(1, len(variants))), "recall": len(variants) - 1}})
    uids = [u["id"] for u in units]
    dialogues = []
    for j, (situation, turns) in enumerate(L["dialogues"], 1):
        T = [({"speaker": t[0], "study": t[1], "reading": t[2], "phon": t[3], "native": t[4]} if len(t) == 5 else {"speaker": t[0], "study": t[1], "phon": t[2], "native": t[3]}) for t in turns]
        dialogues.append({"id": f"L{level}-{nat}-{study}-d{j}", "situation": situation, "turns": T,
                          "practice": "Écouter les deux rôles, masquer un rôle, répondre, puis remplacer une réplique par une variante personnelle." if nat == "fr" else "先听两个角色，遮住一个角色自己回答，再把一句台词换成自己的说法。",
                          "reuses": find_reuses(T, {**(prev_units or {}), level: units}, level)})
    return {"version": 2, "format": "conversation-generic", "status": "à-valider", "studyLanguage": study, "nativeLanguage": nat,
            "fields": {"study": f"phrase en {NAMES[study].lower()}", "phon": f"prononciation écrite pour {NAT_NAMES[nat]}", "native": "traduction en langue maternelle", **({"reading": READING[study]} if study in READING else {})},
            "phoneticConvention": D.PHON_CONV, "reviewStatus": D.REVIEW, "coverageClaim": None,
            "level": level, "title": meta["title"], "goal": meta["goal"], "reviewPreviousLevels": list(range(1, level)),
            "exercisePath": ["découvrir", "remplacer", "essayer sans réponse visible", "converser"],
            "units": units, "dialogues": dialogues, "readiness": L["readiness"]}

def write_level_doc(level, docs):
    meta = LEVEL_META[level]
    md = [f"# Niveau {level} « {meta['title']} » — 7 langues étudiées", "", f"Objectif : {meta['goal']}", "",
          "Pour chaque langue : ≥ 10 modèles × 4 variantes (morceau remplaçable en **gras**), 3 dialogues de 6 à 10 répliques. Réutilise les niveaux " + ", ".join(f"L{k}" for k in range(1, level)) + ".", ""]
    for study, doc in docs.items():
        md += [f"## {NAMES[study]} (lecteurs {NAT_NAMES[doc['nativeLanguage']]})", "", f"*Convention phonétique* : {doc['phoneticConvention']}", "", f"*Statut* : {doc['reviewStatus']}", ""]
        for u in doc["units"]:
            md += [f"### {u['id']} · {u['situation']} — modèle « {u['model']['study']} »", ""]
            if "note" in u["model"]: md += [f"> {u['model']['note']}", ""]
            r = "reading" in u["model"]
            md += ["| Phrase | " + ("Lecture | " if r else "") + "Prononciation | Traduction |", "|---|" + ("---|" if r else "") + "---|---|"]
            for v in u["variants"]:
                st = v["study"].replace(v["slot"]["study"], f"**{v['slot']['study']}**", 1)
                md.append(f"| {st} | " + (f"{v['reading']} | " if r else "") + f"{v['phon']} | {v['native']} |")
            md.append("")
        for d in doc["dialogues"]:
            md += [f"### {d['id']} · {d['situation']}", ""]
            for t in d["turns"]:
                rr = f" *({t['reading']})*" if "reading" in t else ""
                md.append(f"- **{t['speaker']}** : {t['study']}{rr} — {t['phon']} — {t['native']}")
            md.append("")
        md += [f"*Acquis attendu* : {doc['readiness']}", ""]
    open(f"{DOC_DIR}/niveau-L{level}.md", "w", encoding="utf-8").write("\n".join(md))

if __name__ == "__main__":
    sys.path.insert(0, f"{HERE}/levels")
    langs = sys.argv[1].split(",") if len(sys.argv) > 1 else ["es", "en", "zh", "it", "ja", "ko", "fr"]
    levels = [int(x) for x in sys.argv[2].split(",")] if len(sys.argv) > 2 else list(range(2, 11))
    mods = {g: importlib.import_module(f"data_{g}") for g in langs if os.path.exists(f"{HERE}/levels/data_{g}.py")}
    prev = {g: {} for g in mods}
    for g, D in mods.items():
        for lv in range(1, min(levels)):
            f = f"{OUT_DIR}/L{lv}-{D.NAT}-{g}.json"
            if os.path.exists(f): prev[g][lv] = json.load(open(f, encoding="utf-8"))["units"]
    for level in levels:
        docs = {}
        for g, D in mods.items():
            if level not in D.LEVELS: continue
            doc = build(level, g, D, prev[g]); docs[g] = doc; prev[g][level] = doc["units"]
            json.dump(doc, open(f"{OUT_DIR}/L{level}-{D.NAT}-{g}.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
            print(f"L{level}-{D.NAT}-{g}.json  {len(doc['units'])} modèles · {sum(len(u['variants']) for u in doc['units'])} variantes · {len(doc['dialogues'])} dialogues · {sum(len(d['turns']) for d in doc['dialogues'])} répliques")
        if docs: write_level_doc(level, docs)

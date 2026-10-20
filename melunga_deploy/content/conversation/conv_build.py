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
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import roles
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
OUT_DIR = HERE
DOC_DIR = f"{REPO}/docs/conversation"
NAMES = {"fr": "Français", "en": "Anglais", "es": "Espagnol", "zh": "Chinois", "it": "Italien", "ja": "Japonais", "ko": "Coréen"}
NAT_NAMES = {"fr": "francophones", "zh": "sinophones", "en": "anglophones", "es": "hispanophones", "it": "italophones", "ja": "japonophones", "ko": "coréanophones"}
READING = {"zh": "pinyin avec tons", "ja": "lecture en hiragana", "ko": "romanisation révisée"}
MATRIX = json.load(open(f"{HERE}/matrix.json", encoding="utf-8"))
LEVEL_META = {l["level"]: l for l in MATRIX["levels"]}
def _labels():
    """Titres et objectifs des niveaux dans chaque langue maternelle, lus dans conversation-labels.js (lot D)."""
    out = {}
    try:
        src = open(f"{REPO}/melunga_deploy/conversation-labels.js", encoding="utf-8").read()
        for m in re.finditer(r"\n    (\w\w): \{(.*?)\n    \}", src, re.S):
            nat, body = m.group(1), m.group(2)
            t = re.search(r"levelTitles: \[(.*?)\]", body, re.S); g = re.search(r"levelGoals: \[(.*?)\]", body, re.S)
            if t and g: out[nat] = {"titles": re.findall(r"'([^']*)'", t.group(1)), "goals": re.findall(r"'([^']*)'", g.group(1))}
    except OSError: pass
    return out
LEVEL_TITLES = _labels()
PUNCT = r"([.?!。？！])\s*[.?!。？！]$"
PRACTICE = {"fr": "Écouter les deux rôles, masquer un rôle, répondre, puis remplacer une réplique par une variante personnelle.",
            "zh": "先听两个角色，遮住一个角色自己回答，再把一句台词换成自己的说法。",
            "en": "Listen to both roles, hide one role, answer, then swap one line for a variant of your own.",
            "es": "Escucha los dos papeles, oculta uno, responde y luego sustituye una réplica por una variante tuya.",
            "it": "Ascolta i due ruoli, nascondi un ruolo, rispondi, poi sostituisci una battuta con una variante tua.",
            "ja": "両方の役を聞き、片方を隠して答え、そのあと一つのセリフを自分の言い方に入れ替える。",
            "ko": "두 역할을 듣고, 한 역할을 가린 채 대답한 뒤, 한 대사를 자신의 표현으로 바꿔 본다."}

def fill(tpl, s): return tpl.replace("{s}", s).replace("  ", " ")

def native_fill(tpl, s, nat):
    if nat == "fr":
        if " de {s}" in tpl and re.match(r"^[aeiouéèêhAEIOU]", s): tpl = tpl.replace(" de {s}", " d'{s}")
        if " que {s}" in tpl and re.match(r"^[aeiouéèêhAEIOU]", s): tpl = tpl.replace(" que {s}", " qu'{s}")
    out = fill(tpl, s)
    return out[0].upper() + out[1:] if nat in ("fr", "en", "es", "it") and out else out

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
        variants = [dict(slot={k: v for k, v in sl.items() if not k.endswith("Full") and not k.startswith("_")}, **compose(model, sl, nat)) for sl in slots]
        units.append({"id": f"L{level}-{nat}-{study}-{i:02d}", "situation": situation, "model": m, "variants": variants,
                      "practice": {"discover": 0, "replace": list(range(1, len(variants))), "recall": len(variants) - 1}})
    uids = [u["id"] for u in units]
    dialogues = []
    for j, dl in enumerate(L["dialogues"], 1):
        situation, turns = dl[0], dl[1]; dmeta = dl[2] if len(dl) > 2 else {}
        T = [({"speaker": t[0], "study": t[1], "reading": t[2], "phon": t[3], "native": t[4]} if len(t) == 5 else {"speaker": t[0], "study": t[1], "phon": t[2], "native": t[3]}) for t in turns]
        dialogues.append({"id": f"L{level}-{nat}-{study}-d{j}", "situation": situation, "turns": T,
                          "practice": PRACTICE.get(nat, PRACTICE["fr"]),
                          "reuses": find_reuses(T, {**(prev_units or {}), level: units}, level)})
        if dmeta.get("roles"): dialogues[-1].update(roles=dmeta["roles"], learnerRole=dmeta.get("learnerRole", "A"))
        else:
            r = roles.assign(nat, situation)
            if r: dialogues[-1].update(roles={"A": r[0], "B": r[1]}, learnerRole=r[2])
    title, goal = meta["title"], meta["goal"]
    if nat != "fr":
        tg = LEVEL_TITLES.get(nat)
        if tg: title, goal = tg["titles"][level - 1], tg["goals"][level - 1]
    return {"version": 2, "format": "conversation-generic", "status": "à-valider", "studyLanguage": study, "nativeLanguage": nat,
            "fields": {"study": f"phrase en {NAMES[study].lower()}", "phon": f"prononciation écrite pour {NAT_NAMES[nat]}", "native": "traduction en langue maternelle", **({"reading": READING[study]} if study in READING else {})},
            "phoneticConvention": D.PHON_CONV, "reviewStatus": D.REVIEW, "coverageClaim": None,
            "level": level, "title": title, "goal": goal, "reviewPreviousLevels": list(range(1, level)),
            "exercisePath": ["découvrir", "remplacer", "essayer sans réponse visible", "converser"],
            "units": units, "dialogues": dialogues, "readiness": L["readiness"]}

def write_level_doc(level, docs, suffix=""):
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
    open(f"{DOC_DIR}/niveau-L{level}{suffix}.md", "w", encoding="utf-8").write("\n".join(md))

if __name__ == "__main__":
    # Usage : conv_build.py [langues étudiées] [niveaux] [--nat en]
    #   modules : levels/data_<étude>.py (lecteurs fr, et zh pour le français) ou levels/data_<nat>_<étude>.py pour une autre langue maternelle
    sys.path.insert(0, f"{HERE}/levels")
    nat_opt = sys.argv[sys.argv.index("--nat") + 1] if "--nat" in sys.argv else None
    argv = [a for i, a in enumerate(sys.argv[1:], 1) if not a.startswith("--") and not (nat_opt and sys.argv[i - 1] == "--nat")]
    langs = argv[0].split(",") if len(argv) > 0 else ["es", "en", "zh", "it", "ja", "ko", "fr"]
    mods = {}
    for g in langs:
        name = f"data_{nat_opt}_{g}" if nat_opt else f"data_{g}"
        if os.path.exists(f"{HERE}/levels/{name}.py"): mods[g] = importlib.import_module(name)
    levels = [int(x) for x in argv[1].split(",")] if len(argv) > 1 else sorted({lv for D in mods.values() for lv in D.LEVELS})
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
        if docs and not nat_opt: write_level_doc(level, docs)
        elif docs: write_level_doc(level, docs, suffix=f"-{nat_opt}")

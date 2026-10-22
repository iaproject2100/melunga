# -*- coding: utf-8 -*-
"""Mesure indépendante de la progression L1→L10 sur les 7 couples actifs.
Ne lit que les 110 JSON de contenu et le catalogue ; n'écrit rien dans le dépôt.

Trois mesures :
  1. saut de difficulté  : briques nouvelles par niveau, longueur des phrases
  2. substitution        : l'élément remplacé est-il préparé avant ? les 4 variantes
                           ont-elles la même nature (même nombre de jetons) ?
  3. dialogues           : part des briques non préparées par les niveaux 1..N
"""
import json, os, re, sys, unicodedata
from collections import defaultdict

ROOT = sys.argv[1] if len(sys.argv) > 1 else "melunga_deploy/content/conversation"
ACTIVE = [("fr", g) for g in ("en", "es", "zh", "it", "ja", "ko")] + [("zh", "fr")]
CJK = ("zh", "ja", "ko")

PUNCT = "".join(chr(c) for c in range(0x20, 0x300) if unicodedata.category(chr(c)).startswith("P"))
PUNCT += "。，、？！：；（）「」『』〜・…—　？！"


def tokens(text, lang):
    """Briques : caractères pour zh/ja/ko (hors ponctuation), mots pour les langues latines."""
    t = text.strip()
    if lang in CJK:
        return [c for c in t if c not in PUNCT and not c.isspace() and not c.isascii()] or \
               [w for w in re.split(r"[\s" + re.escape(PUNCT) + r"]+", t.lower()) if w]
    return [w for w in re.split(r"[\s" + re.escape(PUNCT) + r"]+", t.lower()) if w]


def load(nat, study, lv):
    p = os.path.join(ROOT, f"L{lv}-{nat}-{study}.json")
    return json.load(open(p, encoding="utf-8")) if os.path.exists(p) else None


rows = []
subst = []
dialog = []

for nat, study in ACTIVE:
    known = set()            # briques vues dans les niveaux antérieurs (modèles + variantes)
    prepared_sentences = set()
    for lv in range(1, 11):
        doc = load(nat, study, lv)
        if not doc:
            continue
        lvl_tokens, lengths = [], []
        for u in doc["units"]:
            for s in [u["model"]["study"]] + [v["study"] for v in u["variants"]]:
                tk = tokens(s, study)
                lvl_tokens += tk
                if "{s}" not in s:
                    lengths.append(len(tk))
        new = [t for t in set(lvl_tokens) if t not in known]
        rows.append({
            "couple": f"{nat}→{study}", "lv": lv,
            "unites": len(doc["units"]),
            "briques": len(set(lvl_tokens)),
            "nouvelles": len(new),
            "part_nouvelles": round(100 * len(new) / max(1, len(set(lvl_tokens)))),
            "long_moy": round(sum(lengths) / max(1, len(lengths)), 1),
            "long_max": max(lengths) if lengths else 0,
        })

        # ---- mesure 2 : substitutions
        for u in doc["units"]:
            slot_sizes = []
            unprepared = []
            for i, v in enumerate(u["variants"]):
                st = v["slot"]["study"]
                tk = tokens(st, study)
                slot_sizes.append(len(tk))
                newbits = [t for t in tk if t not in known]
                if newbits and i in (u.get("practice", {}).get("replace") or []):
                    unprepared.append((i, st, "".join(newbits) if study in CJK else " ".join(newbits)))
            subst.append({
                "couple": f"{nat}→{study}", "lv": lv, "id": u["id"],
                "situation": u["situation"],
                "tailles_emplacement": slot_sizes,
                "nature_homogene": len(set(slot_sizes)) == 1,
                "remplacements_non_prepares": unprepared,
            })

        # ---- mesure 3 : dialogues
        for d in doc["dialogues"]:
            tot, miss = set(), set()
            for t in d["turns"]:
                for tk in tokens(t["study"], study):
                    tot.add(tk)
                    if tk not in known:
                        miss.add(tk)
            learner = d.get("learnerRole")
            prod_miss = set()
            for t in d["turns"]:
                if t.get("speaker") == learner:
                    for tk in tokens(t["study"], study):
                        if tk not in known:
                            prod_miss.add(tk)
            reuses = d.get("reuses", [])
            back = [r for r in reuses if r.split("-")[0][1:].isdigit() and int(r.split("-")[0][1:]) < lv]
            dialog.append({
                "couple": f"{nat}→{study}", "lv": lv, "id": d["id"], "situation": d["situation"],
                "briques": len(tot), "non_preparees": len(miss),
                "part": round(100 * len(miss) / max(1, len(tot))),
                "prod_non_preparees": sorted(prod_miss),
                "reprise_anterieure": len(back),
            })

        known |= set(lvl_tokens)   # le niveau courant devient acquis pour le suivant

json.dump({"niveaux": rows, "substitutions": subst, "dialogues": dialog},
          open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mesures.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)

print(f"{len(rows)} cases, {len(subst)} unités, {len(dialog)} dialogues mesurés → mesures.json")

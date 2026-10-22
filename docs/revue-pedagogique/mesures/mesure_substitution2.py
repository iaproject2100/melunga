# -*- coding: utf-8 -*-
"""Mesure 2, deux bornes explicites pour éviter l'artefact de critère.

BORNE HAUTE (stricte) — « préparable comme brique » :
    l'élément de remplacement existe en entier comme carte du catalogue au
    niveau <= N, donc avec sa propre phonétique et son oreille, ou il est
    déjà apparu tel quel dans les niveaux conversation antérieurs.
    C'est le critère appliqué à 回家 dans le pilote chinois.

BORNE BASSE (indulgente) — « morceaux déjà rencontrés » :
    chaque jeton de l'élément a été rencontré avant, soit dans le contenu
    conversation antérieur, soit dans n'importe quelle carte du catalogue
    de niveau <= N.

La vérité pédagogique est entre les deux : la borne basse ne garantit pas que
l'apprenant ait vu l'élément comme unité, la borne haute exige une carte dédiée.
"""
import json, os, re, sys, unicodedata
from collections import Counter

REPO = sys.argv[1]
ROOT = os.path.join(REPO, "melunga_deploy/content/conversation")
ACTIVE = [("fr", g) for g in ("en", "es", "zh", "it", "ja", "ko")] + [("zh", "fr")]
CJK = ("zh", "ja", "ko")
PUNCT = "".join(chr(c) for c in range(0x20, 0x300) if unicodedata.category(chr(c)).startswith("P")) + "。，、？！：；（）「」『』〜・…—　？！"


def toks(t, lang):
    t = t.strip()
    if lang in CJK:
        r = [c for c in t if c not in PUNCT and not c.isspace() and not c.isascii()]
        return r or [w for w in re.split(r"[\s" + re.escape(PUNCT) + r"]+", t.lower()) if w]
    return [w for w in re.split(r"[\s" + re.escape(PUNCT) + r"]+", t.lower()) if w]


def norm(s):
    return re.sub(r"[\s" + re.escape(PUNCT) + r"]+", "", s.strip().lower())


src = open(os.path.join(REPO, "melunga_deploy/app.html"), encoding="utf-8").read()
i = src.index("var DECKS = ") + len("var DECKS = ")
DECKS = json.loads(src[i:src.index("\n", i)].rstrip(";"))

# catalogue : par langue, texte entier -> niveau mini ; et jeton -> niveau mini
cat_full, cat_tok = {}, {}
for lang, deck in DECKS.items():
    f, t = {}, {}
    for e in deck:
        lv = e.get("lv") or 99
        k = norm(e.get("t", ""))
        if k:
            f[k] = min(f.get(k, 99), lv)
        for tk in toks(e.get("t", ""), lang):
            t[tk] = min(t.get(tk, 99), lv)
    cat_full[lang], cat_tok[lang] = f, t

rows = []
for nat, study in ACTIVE:
    seen_full, seen_tok = set(), set()
    for lv in range(1, 11):
        p = os.path.join(ROOT, f"L{lv}-{nat}-{study}.json")
        if not os.path.exists(p):
            continue
        doc = json.load(open(p, encoding="utf-8"))
        for u in doc["units"]:
            repl = u.get("practice", {}).get("replace") or []
            strict, lenient = [], []
            for idx, v in enumerate(u["variants"]):
                if idx not in repl:
                    continue
                st = v["slot"]["study"]
                k = norm(st)
                cl = cat_full[study].get(k)
                if not ((k in seen_full) or (cl is not None and cl <= lv)):
                    strict.append({"i": idx, "slot": st, "carte": f"lv{cl}" if cl else "absente"})
                miss = [tk for tk in toks(st, study)
                        if tk not in seen_tok and cat_tok[study].get(tk, 99) > lv]
                if miss:
                    lenient.append({"i": idx, "slot": st, "jetons_inedits": miss})
            rows.append({"couple": f"{nat}→{study}", "lv": lv, "id": u["id"],
                         "situation": u["situation"], "modele": u["model"]["study"],
                         "strict": strict, "lenient": lenient})
        for u in doc["units"]:
            for s in [u["model"]["study"]] + [v["study"] for v in u["variants"]] + [v["slot"]["study"] for v in u["variants"]]:
                seen_full.add(norm(s)); seen_tok.update(toks(s, study))

json.dump(rows, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "subst2.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
tot = len(rows)
S = [r for r in rows if r["strict"]]
L = [r for r in rows if r["lenient"]]
print(f"{tot} unités\n")
print(f"BORNE HAUTE  — pas de carte dédiée pour l'élément remplacé : {len(S):>3} unités ({round(100*len(S)/tot)} %)")
print(f"BORNE BASSE  — au moins un jeton jamais rencontré          : {len(L):>3} unités ({round(100*len(L)/tot)} %)")
print("\nBorne basse, par niveau :")
a = Counter(r["lv"] for r in L); b = Counter(r["lv"] for r in rows)
for lv in range(1, 11):
    print(f"  L{lv:<3} {a[lv]:>3}/{b[lv]:<3} ({round(100*a[lv]/max(1,b[lv])):>3} %)")
print("\nBorne basse, par couple :")
a = Counter(r["couple"] for r in L); b = Counter(r["couple"] for r in rows)
for c in sorted(b):
    print(f"  {c:<8} {a[c]:>3}/{b[c]:<3} ({round(100*a[c]/b[c]):>3} %)")
print("\nPires cas en borne basse (L1, où rien ne précède sauf le catalogue) :")
for r in [x for x in L if x["lv"] == 1][:6]:
    print(f"  {r['id']} « {r['modele']} » ({r['situation']})")
    for e in r["lenient"][:3]:
        print(f"      slot « {e['slot']} » → jetons inédits : {' '.join(e['jetons_inedits'])}")

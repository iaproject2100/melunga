# -*- coding: utf-8 -*-
"""Étape 2 — cohérence mot à mot contre le corpus existant.

Construit, pour chaque couple, un lexique « mot étudié → rendu phonétique »
à partir des aides EXISTANTES (catalogue pf/phf + contenu conversation phon),
en n'exploitant que les énoncés dont le nombre de mots égale le nombre de
jetons de l'aide — l'alignement y est alors certain.

Puis vérifie que les aides nouvelles rendent ces mots de la même façon.
C'est le contrôle qui a trouvé THANKS/SANGKS et chyang/siang.
Lecture seule."""
import json, os, re, sys, unicodedata
from collections import Counter, defaultdict

REPO = sys.argv[1]
SCR = os.path.dirname(os.path.abspath(__file__))
os.chdir(REPO)
LATIN = {"fr-en": "en", "fr-es": "es", "fr-it": "it", "zh-fr": "fr"}
FIELD = {"en": "pf", "es": "pf", "it": "pf", "fr": "phon", "ja": "pf", "ko": "pf", "zh": "phf"}

src = open("melunga_deploy/app.html", encoding="utf-8").read()
i = src.index("var DECKS = ") + len("var DECKS = ")
DECKS = json.loads(src[i:src.index("\n", i)].rstrip(";"))

P = "".join(chr(c) for c in range(0x20, 0x300) if unicodedata.category(chr(c)).startswith("P"))


def words(t):
    return [w for w in re.split(r"[\s" + re.escape(P) + r"]+", t.strip()) if w]


def toks(p):
    return [x for x in re.split(r"[\s]+", p.strip()) if x]


def norm(w):
    return unicodedata.normalize("NFC", w).lower().strip("'’")


# ---------- lexique de référence, bâti sur les aides existantes ----------
def build_lexicon(lang):
    lex = defaultdict(Counter)
    deck = DECKS.get(lang) or []
    f = FIELD[lang]
    pool = [(e.get("t", ""), e.get(f) or "") for e in deck]
    for fn in os.listdir("melunga_deploy/content/conversation"):
        if not fn.endswith(".json") or not fn.startswith("L"):
            continue
        parts = fn[:-5].split("-")
        if len(parts) != 3 or parts[2] != lang:
            continue
        d = json.load(open(f"melunga_deploy/content/conversation/{fn}", encoding="utf-8"))
        for u in d["units"]:
            for v in u["variants"]:
                pool.append((v["study"], v["phon"]))
        for dg in d["dialogues"]:
            for t in dg["turns"]:
                pool.append((t["study"], t["phon"]))
    for st, ph in pool:
        if not st or not ph:
            continue
        W, T = words(st), toks(ph)
        if len(W) == len(T) and len(W) >= 1:
            for w, t in zip(W, T):
                lex[norm(w)][t.strip(P)] += 1
    return lex


rows = json.load(open(os.path.join(SCR, "aides.json"), encoding="utf-8"))
newly = [r for r in rows if r["status"] == "pending-Claude"]
print(f"{len(newly)} aides à relire (statut pending-Claude)\n")

print("=== COHÉRENCE MOT À MOT, couples à écriture latine ===\n")
report = []
for pair, lang in LATIN.items():
    lex = build_lexicon(lang)
    stable = {w: c.most_common(1)[0][0] for w, c in lex.items()
              if sum(c.values()) >= 3 and c.most_common(1)[0][1] / sum(c.values()) >= 0.9}
    mine = [r for r in newly if r["pair"] == pair]
    checked = clash = 0
    seen = defaultdict(list)
    for r in mine:
        W, T = words(r["study"] or ""), toks(r["phon"] or "")
        if len(W) != len(T):
            continue
        for w, t in zip(W, T):
            nw = norm(w)
            if nw not in stable:
                continue
            checked += 1
            a, b = stable[nw], t.strip(P)
            if a.lower() != b.lower():
                clash += 1
                seen[(nw, a, b)].append(r["id"])
    print(f"── {pair}  ({lang})  lexique de référence : {len(stable)} mots au rendu stable")
    print(f"   {checked} rendus comparables · {clash} divergences")
    for (w, a, b), ids in sorted(seen.items(), key=lambda x: -len(x[1]))[:8]:
        print(f"     « {w:<14} » corpus = {a:<16} lot = {b:<16} ({len(ids)} fois)  ex. {ids[0]}")
        report.append({"pair": pair, "word": w, "corpus": a, "lot": b, "count": len(ids), "ids": ids[:6]})
    print()

json.dump(report, open(os.path.join(SCR, "divergences.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"→ {sum(r['count'] for r in report)} divergences retenues, détaillées dans divergences.json")

# -*- coding: utf-8 -*-
"""Détection des cartes mal thématisées.

Méthode : le lexique de chaque domaine est appris SUR LA DONNÉE, pas inventé.
Pour chaque domaine situationnel on mesure, mot français par mot français, le
rapport entre sa fréquence dans le domaine et sa fréquence partout ailleurs
(log-odds lissé). Une carte est ensuite notée contre son propre domaine et
contre les treize autres. Celles dont un autre domaine l'emporte nettement sont
les candidates — à lire une par une, le score ne tranche rien.

Le français est la langue commune de six couples sur sept ; pour zh-fr c'est la
langue étudiée, donc le même lexique sert, appliqué au champ `study`.
Lecture seule.
"""
import json, math, os, re, sys, unicodedata
from collections import Counter, defaultdict

SCR = os.path.dirname(os.path.abspath(__file__))
inv = json.load(open(os.path.join(SCR, "inventaire.json"), encoding="utf-8"))
rows = inv["rows"]

STOP = set("""je tu il elle on nous vous ils elles me te se le la les un une des du de
la a à au aux et ou mais donc or ni car que qui quoi dont où ce cet cette ces mon ton
son ma ta sa mes tes ses notre votre leur leurs en y est sont suis es êtes sommes ai
as avons avez ont avait était pour par avec sans sur sous dans vers chez ne pas plus
moins très trop peu bien mal si comme quand alors aussi encore déjà tout tous toute
toutes rien personne quelque quelques même autre autres faire fait fais dit dire
peux peut pouvez pouvons veux veut voulez d l n s c j m t qu'il qu'elle y'a""".split())


def norm(t):
    t = unicodedata.normalize("NFD", (t or "").lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return t


def words(t):
    return [w for w in re.split(r"[^a-z']+", norm(t)) if len(w) > 1 and w not in STOP]


def frtext(r):
    """Le texte français de la carte, quel que soit le sens du couple."""
    return r["study"] if r["pair"] == "zh-fr" else r["native"]


sit = [r for r in rows if r["origin"] == "theme" and r["section"] == "situations"]
print(f"{len(sit)} cartes de situation sur les 70 cellules\n")


def dom(r):
    """Domaine nu, sans le préfixe de niveau."""
    t = r["themeId"] or ""
    m = re.match(r"^L\d+-(.*)$", t)
    return (m.group(1) if m else t)


# ---------- apprentissage du lexique par domaine ----------
df = defaultdict(Counter)
tot = Counter()
for r in sit:
    d = dom(r)
    ws = set(words(frtext(r)))
    df[d].update(ws)
    tot.update(ws)

DOMS = [d for d in df if sum(df[d].values()) >= 400]
print(f"{len(DOMS)} domaines situationnels assez fournis pour être calibrés :")
print("   " + " · ".join(sorted(DOMS)) + "\n")

N = sum(tot.values())
lex = {}
for d in DOMS:
    n = sum(df[d].values())
    sc = {}
    for w, c in df[d].items():
        if tot[w] < 6:
            continue
        p_in = (c + 0.5) / (n + 1.0)
        p_out = (tot[w] - c + 0.5) / (N - n + 1.0)
        sc[w] = math.log(p_in / p_out)
    lex[d] = sc


def score(d, ws):
    s = lex.get(d) or {}
    v = [s.get(w, 0.0) for w in ws]
    return sum(v) / math.sqrt(len(v)) if v else 0.0


cands = []
for r in sit:
    d = dom(r)
    if d not in DOMS:
        continue
    ws = set(words(frtext(r)))
    if len(ws) < 2:
        continue
    own = score(d, ws)
    alt = sorted(((score(o, ws), o) for o in DOMS if o != d), reverse=True)
    best, bdom = alt[0]
    if best - own > 1.4:
        cands.append({**r, "dom": d, "own": round(own, 2),
                      "best": round(best, 2), "bestDom": bdom,
                      "gap": round(best - own, 2), "fr": frtext(r)})

cands.sort(key=lambda x: -x["gap"])
print(f"=== {len(cands)} cartes dont un autre domaine l'emporte de plus de 1,4 ===")
print(f"    soit {100*len(cands)/len(sit):.1f} % des cartes de situation\n")
print("   répartition par couple : " + " · ".join(
    f"{k}:{v}" for k, v in sorted(Counter(c["pair"] for c in cands).items())))
print("\n   mouvements les plus fréquents (domaine actuel → domaine suggéré) :")
for (a, b), n in Counter((c["dom"], c["bestDom"]) for c in cands).most_common(12):
    print(f"      {a:<16} → {b:<16} {n:>4}")

json.dump(cands, open(os.path.join(SCR, "cand_themes.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
print(f"\n→ cand_themes.json : {len(cands)} candidates, à lire individuellement")

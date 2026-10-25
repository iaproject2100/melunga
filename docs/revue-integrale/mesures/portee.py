# -*- coding: utf-8 -*-
"""Portée des deux fautes de lecture française, par couple et par niveau.

Règle 1 — s simple entre voyelles : le français le lit /z/.
   Retenue comme faute CERTAINE seulement là où la langue étudiée n'a pas de
   /z/ à cet endroit : japonais (さしすせそ = /s/), coréen (ㅅ = /s/, le coréen
   n'a aucun /z/), espagnol (/s/, pas de /z/ phonémique).
   Anglais : /s/ ou /z/ selon le mot → lecture individuelle, non comptée ici.
   Italien : /s/ au sud et en Toscane, /z/ au nord → variante, non comptée.

Règle 2 — g devant e/é/è/i/y : le français le lit /ʒ/.
   Retenue là où le son visé est l'occlusive /g/ : vérifié par le pinyin pour
   le chinois, par la romanisation pour le coréen, par l'orthographe pour
   l'anglais et l'espagnol (qui écrivent eux-mêmes « gu »).
Lecture seule.
"""
import json, os, re, unicodedata
from collections import Counter, defaultdict

SCR = os.path.dirname(os.path.abspath(__file__))
inv = json.load(open(os.path.join(SCR, "inventaire.json"), encoding="utf-8"))
V = "aàâeéèêëiîïoôuûùy"


def sacc(t):
    t = unicodedata.normalize("NFD", (t or "").lower())
    return "".join(c for c in t if unicodedata.category(c) != "Mn")


def s_trap(phon):
    """positions du s simple entre voyelles, syllabation retirée"""
    a = sacc(phon).replace("-", "")
    return len(re.findall(r"(?<=[" + V + r"])s(?=[" + V + r"])", a))


def g_trap(phon):
    return len(re.findall(r"g(?=[eéèêiîy])", (phon or "").lower()))


CERT_S = {"fr-ja", "fr-ko", "fr-es"}
rows = [r for r in inv["rows"] if r.get("phon")]

print("=== RÈGLE 1 — s simple entre voyelles lu /z/ par le francophone ===\n")
print(f"   {'couple':<8}" + "".join(f"{'L'+str(l):>7}" for l in range(1, 11)) +
      f"{'total':>8}{'aides':>8}{'statut':>12}")
tot = {}
for p in ["fr-ja", "fr-ko", "fr-es", "fr-en", "fr-it"]:
    per = Counter()
    hit = set()
    for r in rows:
        if r["pair"] != p:
            continue
        if s_trap(r["phon"]):
            per[r["level"]] += 1
            hit.add(r["phon"])
    t = sum(per.values())
    tot[p] = t
    st = "certain" if p in CERT_S else ("individuel" if p == "fr-en" else "variante")
    print(f"   {p:<8}" + "".join(f"{per.get(l,0):>7}" for l in range(1, 11)) +
          f"{t:>8}{len(hit):>8}{st:>12}")
print(f"\n   total certain (ja+ko+es) : {tot['fr-ja']+tot['fr-ko']+tot['fr-es']}")
print(f"   anglais à lire un par un : {tot['fr-en']}   italien (variante) : {tot['fr-it']}")

print("\n=== RÈGLE 2 — g devant e/i lu /ʒ/ par le francophone ===\n")
print(f"   {'couple':<8}" + "".join(f"{'L'+str(l):>7}" for l in range(1, 11)) + f"{'total':>8}")
pieges = json.load(open(os.path.join(SCR, "pieges.json"), encoding="utf-8"))
g2 = {}
for p in ["fr-zh", "fr-ko", "fr-en", "fr-es", "fr-ja"]:
    per = Counter(x["level"] for x in pieges[p]["g"])
    g2[p] = sum(per.values())
    print(f"   {p:<8}" + "".join(f"{per.get(l,0):>7}" for l in range(1, 11)) + f"{g2[p]:>8}")
print(f"\n   total : {sum(g2.values())}")

print("\n=== CE QUE REPRÉSENTE LE L1 SEUL (premier lot demandé par Kartech) ===\n")
l1s = l1g = 0
for p in CERT_S:
    l1s += sum(1 for r in rows if r["pair"] == p and r["level"] == 1 and s_trap(r["phon"]))
for p in g2:
    l1g += sum(1 for x in pieges[p]["g"] if x["level"] == 1)
print(f"   règle 1 au L1 : {l1s} cartes")
print(f"   règle 2 au L1 : {l1g} cartes")
print(f"   ensemble L1   : environ {l1s+l1g} corrections, sur les sept couples")

print("\n=== les formes les plus fréquentes touchées ===\n")
for p, lbl in (("fr-ja", "japonais"), ("fr-ko", "coréen"), ("fr-es", "espagnol")):
    c = Counter()
    for r in rows:
        if r["pair"] != p or not s_trap(r["phon"]):
            continue
        a = sacc(r["phon"]).replace("-", "")
        for m in re.finditer(r"(?<=[" + V + r"])s(?=[" + V + r"])", a):
            c[a[max(0, m.start() - 2):m.start() + 3]] += 1
    print(f"   {lbl:<10} " + " · ".join(f"«{k}»×{n}" for k, n in c.most_common(7)))

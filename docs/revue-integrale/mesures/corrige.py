# -*- coding: utf-8 -*-
"""Applique les deux corrections certaines et réécrit les 70 JSON.

Règle A — s simple entre voyelles → ss, pour ja / ko / es uniquement.
   Ces trois langues n'ont pas de /z/ à cet endroit : la correction ne peut
   pas introduire d'erreur. Anglais et italien sont exclus et listés à part.

Règle B — g devant e/é/è/i/y → gu, pour zh / ko uniquement, plus es quand
   l'orthographe espagnole écrit elle-même « gu ». Ni le mandarin ni le coréen
   n'ont de /ʒ/ : la correction ne peut pas introduire d'erreur.
   Anglais exclu (« giraffe » est bien /dʒ/) et listé à part.

Aucun autre champ n'est touché : ni lv, ni niveau, ni thème, ni identifiant,
ni reading/pinyin. Écrit un registre avant/après par identifiant.
"""
import json, os, re, sys, unicodedata
from collections import Counter, defaultdict

SCR = os.path.dirname(os.path.abspath(__file__))
REPO = sys.argv[1]
ROOT = os.path.join(REPO, "melunga_deploy/content/niveaux-progressifs")
APPLY = "--apply" in sys.argv
PAIRS = ["fr-en", "fr-es", "fr-it", "fr-zh", "fr-ja", "fr-ko", "zh-fr"]
V = "aàâeéèêëiîïoôuûùyAÀÂEÉÈÊËIÎÏOÔUÛÙY"


def isv(c):
    return c in V


def regle_A(ph):
    """s simple entre voyelles → ss. Retourne (nouvelle aide, nb corrections)."""
    if not ph:
        return ph, 0
    out = list(ph)
    n = 0
    i = 0
    res = []
    while i < len(out):
        c = out[i]
        if c in "sS":
            # voyelle précédente, en sautant les traits d'union
            j = i - 1
            while j >= 0 and out[j] in "- ":
                j -= 1
            k = i + 1
            while k < len(out) and out[k] in "- ":
                k += 1
            prev_v = j >= 0 and isv(out[j])
            next_v = k < len(out) and isv(out[k])
            already = (i + 1 < len(out) and out[i + 1] in "sS") or (j >= 0 and out[j] in "sS")
            # pas de blanc franchi : un espace sépare deux mots, la liaison
            # française ne sonorise pas un s initial de mot
            crossed_space = any(out[x] == " " for x in range(j + 1, i)) or \
                            any(out[x] == " " for x in range(i + 1, k))
            if prev_v and next_v and not already and not crossed_space:
                res.append(c)
                res.append("s" if c == "s" else "S")
                n += 1
                i += 1
                continue
        res.append(c)
        i += 1
    return "".join(res), n


def regle_B(ph):
    """g devant voyelle antérieure → gu."""
    if not ph:
        return ph, 0
    n = 0

    def rep(m):
        nonlocal n
        n += 1
        g = m.group(1)
        return g + ("u" if g == "g" else "U")

    new = re.sub(r"(?<![gG])([gG])(?=[eéèêëiîïyEÉÈÊËIÎÏY])", rep, ph)
    return new, n


def esp_a_gu(study, syl):
    """l'espagnol écrit-il « gu » là où l'aide écrit « g » ?"""
    return bool(re.search(r"gu[ei]", (study or "").lower()))


A_PAIRS = {"fr-ja", "fr-ko", "fr-es"}
B_PAIRS = {"fr-zh", "fr-ko"}

registre = []
exclus = []
stats = Counter()

for p in PAIRS:
    for lv in range(1, 11):
        fp = os.path.join(ROOT, p, f"L{lv}.json")
        if not os.path.exists(fp):
            continue
        d = json.load(open(fp, encoding="utf-8"))
        touched = 0

        def walk(ph, origin, theme):
            global touched
            old = ph.get("phon")
            if not old:
                return
            new, na, nb = old, 0, 0
            if p in A_PAIRS:
                new, na = regle_A(new)
            if p in B_PAIRS:
                new, nb = regle_B(new)
            elif p == "fr-es":
                cand, k = regle_B(new)
                if k and esp_a_gu(ph.get("study"), None):
                    new, nb = cand, k
            if new != old:
                ph["phon"] = new
                touched += 1
                stats[(p, "A")] += na
                stats[(p, "B")] += nb
                registre.append({
                    "pair": p, "level": lv, "id": ph.get("id"), "origin": origin,
                    "theme": theme, "study": ph.get("study"), "native": ph.get("native"),
                    "avant": old, "apres": new,
                    "regles": ("A" if na else "") + ("B" if nb else ""),
                    "nA": na, "nB": nb,
                })
                st = ph.setdefault("phoneticReviewStatus", None)
                ph["phoneticReviewStatus"] = "corrected-by-Claude-french-reading-rule"

        for t in (d.get("themes") or []):
            for ph in (t.get("phrases") or []):
                walk(ph, "theme", t.get("id"))
        for t in (d.get("heldThemes") or []):
            for ph in (t.get("phrases") or []):
                walk(ph, "heldTheme", t.get("id"))
        for ph in (d.get("reserve") or []):
            walk(ph, "reserve", None)

        if APPLY and touched:
            # on reproduit exactement le format d'origine : une ligne, separateurs
            # compacts, retour ligne final — pour que le diff soit lisible
            with open(fp, "w", encoding="utf-8") as fh:
                json.dump(d, fh, ensure_ascii=False, separators=(",", ":"))
                fh.write("\n")

# les exclusions, à lire une par une
inv = json.load(open(os.path.join(SCR, "inventaire.json"), encoding="utf-8"))
for r in inv["rows"]:
    if not r.get("phon"):
        continue
    if r["pair"] == "fr-en":
        _, na = regle_A(r["phon"])
        _, nb = regle_B(r["phon"])
        if na or nb:
            exclus.append({**{k: r[k] for k in ("pair", "level", "id", "study", "native", "phon")},
                           "motif": "anglais : s et g peuvent être /z/ et /dʒ/ selon le mot",
                           "nA": na, "nB": nb})
    if r["pair"] == "fr-it":
        _, na = regle_A(r["phon"])
        if na:
            exclus.append({**{k: r[k] for k in ("pair", "level", "id", "study", "native", "phon")},
                           "motif": "italien : s intervocalique /s/ au sud, /z/ au nord — variante régionale",
                           "nA": na, "nB": 0})

print("=== CORRECTIONS APPLIQUÉES ===" if APPLY else "=== SIMULATION (rien n'est écrit) ===")
print()
print(f"   {'couple':<9}{'règle A (ss)':>14}{'règle B (gu)':>14}{'cartes':>9}")
for p in PAIRS:
    a, b = stats[(p, "A")], stats[(p, "B")]
    n = sum(1 for x in registre if x["pair"] == p)
    if a or b:
        print(f"   {p:<9}{a:>14}{b:>14}{n:>9}")
print(f"\n   total : {sum(v for k,v in stats.items() if k[1]=='A')} corrections A, "
      f"{sum(v for k,v in stats.items() if k[1]=='B')} corrections B, "
      f"{len(registre)} cartes touchées")
print(f"   exclues pour lecture individuelle : {len(exclus)} "
      f"(anglais {sum(1 for e in exclus if e['pair']=='fr-en')}, "
      f"italien {sum(1 for e in exclus if e['pair']=='fr-it')})")

print("\n=== échantillon du registre ===\n")
for x in registre[:14]:
    print(f"   {x['pair']} L{x['level']} {x['id']}")
    print(f"      {x['study']}")
    print(f"      avant : {x['avant']}")
    print(f"      après : {x['apres']}   [règle {x['regles']}]")

json.dump({"registre": registre, "exclus": exclus},
          open(os.path.join(SCR, "registre.json"), "w", encoding="utf-8"), ensure_ascii=False)
print(f"\n→ registre.json : {len(registre)} corrections, {len(exclus)} exclusions")

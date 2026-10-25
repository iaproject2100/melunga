# -*- coding: utf-8 -*-
"""Phonétique chinoise : trancher par la finale pinyin, pas par la majorité.

Le champ `reading` porte le pinyin. On aligne caractère ↔ syllabe pinyin ↔
syllabe de l'aide française, puis on regroupe par FINALE pinyin. Une finale
a un seul rendu français correct ; si le corpus en donne plusieurs pour la
même finale, c'est mesurable sans rien supposer.

Cas décisif : les finales -i après zh/ch/sh/r (rétroflexe) et z/c/s (apicale)
ne contiennent aucune voyelle. 是 shì ne se dit pas /ʃø/. Les écrire avec
« eu » introduit une voyelle arrondie absente du chinois.
Lecture seule.
"""
import json, os, re, unicodedata
from collections import Counter, defaultdict

SCR = os.path.dirname(os.path.abspath(__file__))
inv = json.load(open(os.path.join(SCR, "inventaire.json"), encoding="utf-8"))
rows = [r for r in inv["rows"] if r["pair"] == "fr-zh" and r.get("phon") and r.get("reading")]
print(f"{len(rows)} cartes fr-zh portant à la fois une aide et un pinyin\n")


def han(t):
    return [c for c in (t or "") if "一" <= c <= "鿿"]


def depinyin(t):
    """Syllabes pinyin, sans tons."""
    t = unicodedata.normalize("NFD", (t or "").lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    t = t.replace("ü", "v")
    return [x for x in re.split(r"[^a-zv]+", t) if x]


def syl(p):
    return [x for x in re.split(r"[\s\-]+", (p or "").strip()) if x]


INITIALES = ["zh", "ch", "sh", "b", "p", "m", "f", "d", "t", "n", "l", "g", "k",
             "h", "j", "q", "x", "r", "z", "c", "s", "y", "w"]


def split_py(s):
    for i in INITIALES:
        if s.startswith(i):
            return i, s[len(i):]
    return "", s


# alignement strict : autant de hanzi que de syllabes pinyin que de jetons d'aide
align = []
for r in rows:
    H, P, F = han(r["study"]), depinyin(r["reading"]), syl(r["phon"])
    if len(H) == len(P) == len(F) and H:
        for h, p, f in zip(H, P, F):
            align.append((h, p, f.strip(".,!?;:，。！？").lower(), r))

print(f"{len(align)} syllabes alignées sur les trois niveaux (caractère/pinyin/aide)\n")

RETRO = {"zh", "ch", "sh", "r"}
APICAL = {"z", "c", "s"}

print("=== LES FINALES -i SANS VOYELLE (rétroflexes et apicales) ===")
print("    是 shì, 时 shí, 知 zhī, 吃 chī, 四 sì, 字 zì… : aucune voyelle à arrondir\n")
groups = defaultdict(Counter)
ex = defaultdict(lambda: defaultdict(list))
for h, p, f, r in align:
    ini, fin = split_py(p)
    if fin == "i" and (ini in RETRO or ini in APICAL):
        groups[(ini, fin)][f] += 1
        ex[(ini, fin)][f].append(r["id"])

tot_ok = tot_bad = 0
for (ini, fin), c in sorted(groups.items(), key=lambda x: -sum(x[1].values())):
    s = sum(c.values())
    rend = " · ".join(f"{t}×{n}" for t, n in c.most_common(6))
    print(f"   {ini+fin:<5} ({s:>4} occurrences) : {rend}")
    for t, n in c.items():
        if re.search(r"(eu|e)$", t) and not t.endswith("r"):
            tot_bad += n
        else:
            tot_ok += n

print(f"\n   rendus sans voyelle parasite : {tot_ok}   rendus avec voyelle ajoutée : {tot_bad}")

print("\n=== LA FINALE -e (schwa) : 的 de, 了 le, 么 me, 个 ge, 这 zhe ===\n")
g2 = defaultdict(Counter)
for h, p, f, r in align:
    ini, fin = split_py(p)
    if fin == "e":
        g2[p][f] += 1
for p, c in sorted(g2.items(), key=lambda x: -sum(x[1].values()))[:12]:
    s = sum(c.values())
    print(f"   {p:<5} ({s:>4}) : " + " · ".join(f"{t}×{n}" for t, n in c.most_common(5)))

print("\n=== cohérence globale : une finale pinyin, combien de rendus ? ===\n")
g3 = defaultdict(Counter)
for h, p, f, r in align:
    ini, fin = split_py(p)
    g3[fin][re.sub(r"^(zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])", "", f)] += 1
multi = [(k, c) for k, c in g3.items() if sum(c.values()) >= 25 and len(c) > 1]
multi.sort(key=lambda x: -sum(x[1].values()))
print(f"   {len(multi)} finales pinyin reçoivent plusieurs rendus de rime\n")
for k, c in multi[:14]:
    s = sum(c.values())
    top = c.most_common(1)[0][1]
    print(f"   -{k:<5} ({s:>4}) majorité {100*top/s:>3.0f} % : " +
          " · ".join(f"{t or 'Ø'}×{n}" for t, n in c.most_common(5)))

json.dump({"retroflex": {f"{a}{b}": dict(c) for (a, b), c in groups.items()},
           "retroflex_ex": {f"{a}{b}": {t: v[:8] for t, v in d.items()} for (a, b), d in ex.items()},
           "schwa": {k: dict(v) for k, v in g2.items()}},
          open(os.path.join(SCR, "retro.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)
print("\n→ retro.json écrit")

# -*- coding: utf-8 -*-
"""La règle unifiée de la méthode Kartech, appliquée aux sept couples.

L'aide doit être orthographiée de telle sorte que les règles de lecture du
FRANÇAIS produisent le son visé. Trois pièges orthographiques français créent
des fautes certaines, indépendantes de toute convention à débattre :

  g + e/i/é/è/y  → /ʒ/   (« ge » se lit « je »)      il faut « gu »
  c + e/i/é/è/y  → /s/   (« ce » se lit « se »)      il faut « qu » ou « k »
  s entre voyelles → /z/ (« asa » se lit « aza »)    il faut « ss »

On ne signale un piège que si le son visé est bien l'occlusive ou la sifflante
sourde, lu dans la source : pinyin pour le chinois, orthographe étudiée pour
les langues latines. Pour zh→fr l'aide est en caractères chinois : la règle ne
s'y applique pas, ce couple est traité à part.
Lecture seule.
"""
import json, os, re, sys, unicodedata
from collections import Counter, defaultdict

SCR = os.path.dirname(os.path.abspath(__file__))
inv = json.load(open(os.path.join(SCR, "inventaire.json"), encoding="utf-8"))
V = "aàâeéèêëiîïoôuûùyœæ"


def strip_acc(t):
    t = unicodedata.normalize("NFD", (t or "").lower())
    return "".join(c for c in t if unicodedata.category(c) != "Mn")


def piege_g(aide):
    """g suivi d'une voyelle antérieure, hors digrammes gu/gn."""
    out = []
    a = (aide or "").lower()
    for m in re.finditer(r"g(?=[eéèêiîy])", a):
        out.append(("g", m.start(), a[max(0, m.start() - 2):m.start() + 3]))
    return out


def piege_c(aide):
    out = []
    a = (aide or "").lower()
    for m in re.finditer(r"c(?=[eéèêiîy])", a):
        if a[m.start():m.start() + 2] in ("ch",):
            continue
        out.append(("c", m.start(), a[max(0, m.start() - 2):m.start() + 3]))
    return out


def piege_s(aide):
    """s simple entre deux voyelles → lu /z/."""
    out = []
    a = strip_acc(aide)
    orig = (aide or "").lower()
    for m in re.finditer(r"(?<=[" + V + r"])s(?=[" + V + r"])", a):
        out.append(("s", m.start(), orig[max(0, m.start() - 2):m.start() + 3]))
    return out


# ---------- chinois : le pinyin dit si le son visé est /g/ ou /k/ ou /s/ ----------
def han(t):
    return [c for c in (t or "") if "一" <= c <= "鿿"]


def dp(t):
    t = strip_acc(t).replace("ü", "v")
    return [x for x in re.split(r"[^a-zv]+", t) if x]


def sy(p):
    return [x for x in re.split(r"[\s\-]+", (p or "").strip()) if x]


print("=== LES TROIS PIÈGES DE LECTURE FRANÇAISE, PAR COUPLE ===\n")
res = defaultdict(lambda: defaultdict(list))

# chinois : appariement pinyin ↔ aide, on ne retient que les syllabes dont
# l'initiale pinyin est g/k/s et dont l'aide tombe dans le piège
zh = [r for r in inv["rows"] if r["pair"] == "fr-zh" and r.get("phon") and r.get("reading")]
for r in zh:
    H, P, F = han(r["study"]), dp(r["reading"]), sy(r["phon"])
    if not (len(H) == len(P) == len(F) and H):
        continue
    for h, p, f in zip(H, P, F):
        fl = f.lower()
        if p.startswith("g") and re.match(r"^g[eéèêiîy]", fl):
            res["fr-zh"]["g"].append({"id": r["id"], "char": h, "pinyin": p, "syl": f,
                                      "study": r["study"], "phon": r["phon"], "level": r["level"]})
        if p.startswith("k") and re.match(r"^c[eéèêiîy]", fl):
            res["fr-zh"]["c"].append({"id": r["id"], "char": h, "pinyin": p, "syl": f,
                                      "study": r["study"], "phon": r["phon"], "level": r["level"]})
        if p.startswith("s") and re.search(r"(?<=[" + V + r"])s(?=[" + V + r"])", strip_acc(f)):
            res["fr-zh"]["s"].append({"id": r["id"], "char": h, "pinyin": p, "syl": f,
                                      "study": r["study"], "phon": r["phon"], "level": r["level"]})

# langues latines + ja/ko : on lit l'aide entière
for pair, src in (("fr-en", "en"), ("fr-es", "es"), ("fr-it", "it"),
                  ("fr-ja", "ja"), ("fr-ko", "ko")):
    for r in inv["rows"]:
        if r["pair"] != pair or not r.get("phon"):
            continue
        for kind, fn in (("g", piege_g), ("c", piege_c), ("s", piege_s)):
            for _, pos, ctx in fn(r["phon"]):
                res[pair][kind].append({"id": r["id"], "ctx": ctx, "pos": pos,
                                        "study": r["study"], "native": r["native"],
                                        "phon": r["phon"], "level": r["level"]})

print(f"   {'couple':<8}{'piège g':>10}{'piège c':>10}{'piège s':>10}")
for p in ["fr-en", "fr-es", "fr-it", "fr-zh", "fr-ja", "fr-ko"]:
    print(f"   {p:<8}{len(res[p]['g']):>10}{len(res[p]['c']):>10}{len(res[p]['s']):>10}")

print("\n=== piège g : chinois, les syllabes visées ===")
c = Counter((x["pinyin"], x["syl"].lower()) for x in res["fr-zh"]["g"])
for (p, s), n in c.most_common(10):
    print(f"   pinyin {p:<6} écrit « {s:<6} » {n:>4} fois  → le français lit « j{s[1:]} »")

print("\n=== piège s : contextes les plus fréquents, par couple ===")
for p in ["fr-es", "fr-it", "fr-en", "fr-ja", "fr-ko"]:
    c = Counter(x["ctx"] for x in res[p]["s"])
    if not c:
        continue
    print(f"   {p} : " + " · ".join(f"«{k}»×{n}" for k, n in c.most_common(6)))

json.dump({k: {kk: vv for kk, vv in v.items()} for k, v in res.items()},
          open(os.path.join(SCR, "pieges.json"), "w", encoding="utf-8"),
          ensure_ascii=False)
tot = sum(len(v2) for v in res.values() for v2 in v.values())
print(f"\n→ pieges.json : {tot} occurrences relevées")

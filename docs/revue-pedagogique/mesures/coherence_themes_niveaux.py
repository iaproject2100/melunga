# -*- coding: utf-8 -*-
"""Cohérence du classement par thème et par niveau. Lecture seule."""
import json, os, subprocess, sys, unicodedata, re
from collections import Counter, defaultdict

REV = "origin/review/themes-niveaux-progressifs"
REPO = sys.argv[1]
SCR = os.path.dirname(os.path.abspath(__file__))
os.chdir(REPO)
PAIRS = ["fr-en", "fr-es", "fr-it", "fr-zh", "fr-ja", "fr-ko", "zh-fr"]


def show(p):
    r = subprocess.run(["git", "show", f"{REV}:{p}"], capture_output=True, text=True)
    return json.loads(r.stdout) if r.returncode == 0 and r.stdout.strip() else None


cl = json.load(open(os.path.join(SCR, "cl.json"), encoding="utf-8"))
src = open("melunga_deploy/app.html", encoding="utf-8").read()
i = src.index("var DECKS = ") + len("var DECKS = ")
DECKS = json.loads(src[i:src.index("\n", i)].rstrip(";"))

print("=== 1. Nature des 418 prérequis déclarés ===\n")
pp = cl["plannedPrerequisites"]
print("   par type de contenu du prérequis :")
for k, v in Counter(p.get("prerequisiteContentType") for p in pp).most_common():
    print(f"      {str(k):<14} {v:>4}")
print("\n   par statut :")
for k, v in Counter(p.get("status") for p in pp).most_common():
    print(f"      {str(k):<52} {v:>4}")
later = [p for p in pp if p.get("appearsEarlierInEditorialOrder") is False]
print(f"\n   prérequis qui n'apparaissent PAS avant leur cible : {len(later)} sur {len(pp)}")
byp = Counter(p["pair"] for p in later)
print("      " + " · ".join(f"{k}:{v}" for k, v in sorted(byp.items())))

print("\n=== 2. Un même thème est-il au même niveau dans les sept couples ? ===\n")
lv = defaultdict(dict)
for pair in PAIRS:
    d = show(f"docs/niveaux-progressifs/enrichissement-situations/extension-{pair}.json")
    if not d:
        continue
    for it in (d.get("items") or []):
        t = it.get("topicId")
        if t:
            lv[t].setdefault(pair, set()).add(it.get("proposedLevel"))
rows = []
for t, m in sorted(lv.items()):
    mins = {p: min(s) for p, s in m.items() if s}
    if not mins:
        continue
    vals = set(mins.values())
    rows.append((t, mins, len(vals)))
diff = [r for r in rows if r[2] > 1]
print(f"   {len(rows)} thèmes présents dans l'extension")
print(f"   thèmes dont le niveau d'entrée varie selon la langue : {len(diff)}")
for t, mins, n in diff[:12]:
    print(f"      {t:<34} " + " ".join(f"{p.split('-')[1]}:L{v}" for p, v in sorted(mins.items())))

print("\n=== 3. Progression mesurée du classement éditorial ===\n")
P = "".join(chr(c) for c in range(0x20, 0x300) if unicodedata.category(chr(c)).startswith("P"))


def syl(p):
    return len([x for x in re.split(r"[\s\-]+", (p or "").strip()) if x])


for pair in PAIRS:
    d = show(f"docs/niveaux-progressifs/enrichissement-situations/extension-{pair}.json")
    if not d:
        continue
    per = defaultdict(list)
    for it in (d.get("items") or []):
        if it.get("phon"):
            per[it.get("proposedLevel")].append(syl(it["phon"]))
    ks = sorted(k for k in per if isinstance(k, int))
    moy = {k: sum(per[k]) / len(per[k]) for k in ks}
    bad = [f"L{k}>L{k+1}" for k in ks if k + 1 in moy and moy[k] > moy[k + 1]]
    print(f"   {pair:<7} " + "  ".join(f"L{k}:{moy[k]:.1f}" for k in ks) +
          ("   ✔ croissant" if not bad else "   ✘ " + " · ".join(bad)))
print("\n   (syllabes par énoncé, mesurées sur le champ phonétique — comparable entre couples)")

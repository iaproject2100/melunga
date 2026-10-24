# -*- coding: utf-8 -*-
"""Étape 1 — cadrer le périmètre réel de la relecture phonétique.
Extrait toutes les aides du lot, les classe par statut et par usage,
et distingue les créations des copies verbatim. Lecture seule."""
import json, os, subprocess, sys
from collections import Counter, defaultdict

REV = "origin/review/themes-niveaux-progressifs"
REPO = sys.argv[1]
os.chdir(REPO)
PAIRS = ["fr-en", "fr-es", "fr-it", "fr-zh", "fr-ja", "fr-ko", "zh-fr"]
BASE = "docs/niveaux-progressifs"


def ls(prefix):
    r = subprocess.run(["git", "ls-tree", "-r", "--name-only", REV, "--", prefix],
                       capture_output=True, text=True)
    return [x for x in r.stdout.splitlines() if x.endswith(".json")]


def show(path):
    r = subprocess.run(["git", "show", f"{REV}:{path}"], capture_output=True, text=True)
    if r.returncode:
        return None
    try:
        return json.loads(r.stdout)
    except Exception:
        return None


files = ls(f"{BASE}/enrichissement-situations") + ls(f"{BASE}/corrections-themes")
print(f"{len(files)} fichiers JSON dans le lot\n")

rows = []
for f in files:
    d = show(f)
    if not isinstance(d, dict):
        continue
    pair = d.get("pair")
    for bucket in ("items", "receivedTurns", "lexicalSupports", "entries", "introductions"):
        for it in (d.get(bucket) or []):
            if not isinstance(it, dict) or "phon" not in it:
                continue
            rows.append({
                "file": f.split("/")[-1],
                "pair": it.get("pair") or pair,
                "bucket": bucket,
                "id": it.get("id"),
                "level": it.get("proposedLevel"),
                "study": it.get("study"),
                "native": it.get("native"),
                "phon": it.get("phon"),
                "status": it.get("phoneticReviewStatus"),
                "kind": it.get("kind"),
                "source": it.get("source"),
            })

print(f"{len(rows)} entrées portant une aide phonétique\n")
print("Par statut de relecture phonétique :")
for k, v in Counter(r["status"] for r in rows).most_common():
    print(f"   {str(k):<28} {v:>5}")
print("\nPar usage :")
for k, v in Counter(r["bucket"] for r in rows).most_common():
    print(f"   {k:<20} {v:>5}")
print("\nPar couple et statut :")
g = defaultdict(Counter)
for r in rows:
    g[r["pair"]][r["status"]] += 1
sts = sorted({r["status"] for r in rows}, key=str)
print(f"   {'couple':<9}" + "".join(f"{str(s)[:22]:>24}" for s in sts))
for p in PAIRS:
    print(f"   {p:<9}" + "".join(f"{g[p][s]:>24}" for s in sts))

json.dump(rows, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "aides.json"), "w", encoding="utf-8"),
          ensure_ascii=False)
newly = [r for r in rows if r["status"] not in ("existing-verbatim",)]
print(f"\n→ {len(newly)} aides hors copie verbatim : c'est le périmètre que Kartech me confie.")
print(f"→ {len(rows) - len(newly)} copies verbatim d'aides existantes, hors périmètre.")

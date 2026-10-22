# -*- coding: utf-8 -*-
"""Vérification indépendante du lot 30e7d40.

Trois contrôles :
  A. chaque copie de la banque est exactement la tranche annoncée du tour source
  B. les deux fragments d'un tour couvrent le tour sans perte (hors séparateur)
  C. le tour parent déclaré dans la banque est bien celui du fichier réel
Lecture seule."""
import json, os, sys

SCR = os.path.dirname(os.path.abspath(__file__))
REPO = sys.argv[1]
bank = json.load(open(os.path.join(SCR, "bank.json"), encoding="utf-8"))
plan = json.load(open(os.path.join(SCR, "l1b.json"), encoding="utf-8"))
FIELDS = ("study", "phon", "native", "reading")

docs = {}
def turn(f, did, idx):
    if f not in docs:
        docs[f] = json.load(open(os.path.join(REPO, f), encoding="utf-8"))
    d = [x for x in docs[f]["dialogues"] if x["id"] == did][0]
    return d["turns"][idx]

pb = []
nslice = nparent = 0
for e in bank["entries"]:
    s, cp = e["source"], e["copy"]
    t = turn(s["file"], s["dialogueId"], s["turnIndex"])
    # C. parent déclaré == parent réel
    for f, v in s["expectedParent"].items():
        if t.get(f) != v:
            pb.append(f"{e['id']} parent.{f} : réel « {t.get(f)} » ≠ déclaré « {v} »")
        else:
            nparent += 1
    # A. la copie est la tranche annoncée
    for f in FIELDS:
        if f not in cp:
            continue
        sp = s["spans"].get(f)
        if sp is None:
            pb.append(f"{e['id']} champ {f} copié sans span déclaré")
            continue
        cut = (t.get(f) or "")[sp[0]:sp[1]]
        if cut != cp[f]:
            pb.append(f"{e['id']} champ {f} : tranche [{sp[0]}:{sp[1]}] = « {cut} » ≠ copie « {cp[f]} »")
        else:
            nslice += 1

print(f"A/C — {nslice} tranches exactes, {nparent} champs de parent conformes")

# B. couverture sans perte
print("\nB — couverture du tour par les deux fragments :")
by = {}
for e in bank["entries"]:
    k = (e["source"]["file"], e["source"]["dialogueId"], e["source"]["turnIndex"])
    by.setdefault(k, []).append(e)
for k, es in sorted(by.items()):
    t = turn(*k)
    tag = k[1]
    msgs = []
    for f in FIELDS:
        if not t.get(f):
            continue
        spans = sorted([e["source"]["spans"][f] for e in es if f in e["source"]["spans"]])
        if not spans:
            msgs.append(f"{f}: aucun span")
            continue
        if spans[0][0] != 0:
            msgs.append(f"{f}: début perdu « {t[f][:spans[0][0]]} »")
        if spans[-1][1] != len(t[f]):
            msgs.append(f"{f}: fin perdue « {t[f][spans[-1][1]:]} »")
        for a, b in zip(spans, spans[1:]):
            gap = t[f][a[1]:b[0]]
            if gap.strip():
                msgs.append(f"{f}: texte perdu entre les fragments « {gap} »")
    print(f"   {tag:<16} " + ("✔ couverture complète, seuls des blancs entre fragments" if not msgs else "✘ " + " · ".join(msgs)))

print(f"\n{len(pb)} écart(s)")
for p in pb[:15]:
    print("   " + p)
if not pb:
    print("✔ conservation exacte confirmée : aucune phonétique modifiée, aucune tranche inexacte")

# -*- coding: utf-8 -*-
"""Vérification du contenu livré par l'intégration (b0171bd) :
chaque phrase de melunga_deploy/content/l1-cafe.json est-elle identique
à sa source dans les 110 JSON ? Les fragments sont comparés à la tranche
du tour parent. Lecture seule."""
import json, os, sys

REPO = sys.argv[1]
CONV = os.path.join(REPO, "melunga_deploy/content/conversation")
d = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "rt.json"), encoding="utf-8"))

docs = {}
def doc(f):
    if f not in docs:
        docs[f] = json.load(open(os.path.join(CONV, f), encoding="utf-8"))
    return docs[f]

FIELDS = ("study", "phon", "native", "reading")
ok = frag = pb = 0
problems = []

for p in d["pairs"]:
    for ph in p["phrases"]:
        ref = ph["id"].split(":")
        fname = ref[0]
        doc_ = doc(fname)
        if "-d" in ref[1]:                       # tour de dialogue
            dlg = [x for x in doc_["dialogues"] if x["id"] == ref[1]][0]
            idx = int(ref[2].lstrip("t"))
            t = dlg["turns"][idx]
            if len(ref) > 3:                     # fragment : doit être une sous-chaîne
                frag += 1
                for f in FIELDS:
                    if f in ph:
                        if ph[f] not in (t.get(f) or ""):
                            problems.append(f"{ph['id']} {f} : « {ph[f]} » n'est pas une sous-chaîne de « {t.get(f)} »")
                        else:
                            ok += 1
            else:
                for f in FIELDS:
                    if f in ph or t.get(f):
                        if (ph.get(f) or "") != (t.get(f) or ""):
                            problems.append(f"{ph['id']} {f} : livré « {ph.get(f)} » ≠ source « {t.get(f)} »")
                        else:
                            ok += 1
            if ph["speaker"] != t["speaker"]:
                problems.append(f"{ph['id']} : locuteur livré {ph['speaker']} ≠ source {t['speaker']}")
            # cohérence kind / rôle de l'apprenant
            exp = "learner" if t["speaker"] == dlg["learnerRole"] else "received"
            if ph["kind"] != exp and len(ref) <= 3:
                problems.append(f"{ph['id']} : kind {ph['kind']} alors que le locuteur est {t['speaker']} (apprenant {dlg['learnerRole']})")
        else:                                     # variante d'unité
            uid, vi = ref[1], int(ref[2].lstrip("v"))
            u = [x for x in doc_["units"] if x["id"] == uid][0]
            v = u["variants"][vi]
            for f in FIELDS:
                if f in ph or v.get(f):
                    if (ph.get(f) or "") != (v.get(f) or ""):
                        problems.append(f"{ph['id']} {f} : livré « {ph.get(f)} » ≠ source « {v.get(f)} »")
                    else:
                        ok += 1

print(f"{sum(len(p['phrases']) for p in d['pairs'])} phrases livrées, dont {frag} fragments")
print(f"{ok} champs conformes à la source, {len(problems)} écart(s)")
for q in problems[:15]:
    print("   ! " + q)
if not problems:
    print("✔ contenu livré identique aux sources : aucune phonétique ni lecture modifiée")

# accès : la nouvelle rubrique est-elle gratuite ?
print(f"\ndoesNotChangeAccess déclaré : {d.get('doesNotChangeAccess')}")
print(f"nativeReviewPending : {d.get('nativeReviewPending')}")
print(f"sourceCommit : {d.get('sourceCommit')}")
print("\nrépliques reçues par couple (doivent être celles du serveur) :")
for p in d["pairs"]:
    kinds = [x["kind"] for x in p["phrases"]]
    print(f"   {p['id']:<8} {kinds.count('learner')} apprenant · {kinds.count('received')} reçues · "
          f"clôtures sans réponse : {sum(1 for r in p['received'] if not r.get('replyRequired'))}")

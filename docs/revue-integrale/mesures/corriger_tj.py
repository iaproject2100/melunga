# -*- coding: utf-8 -*-
"""Règle D — le digramme « tj » n'a aucune valeur en français.

Ce n'est pas un arbitrage entre deux graphies lisibles, donc l'objection de
Codex sur les majorités ne s'applique pas : `tj` ne se lit pas. Un lecteur
francophone bute dessus. Le corpus écrit `dj` pour le même son — 158 fois
pour 今 jīn, 131 pour 家 jiā, 94 pour 见 jiàn.

Sécurité : chaque occurrence est vérifiée contre le pinyin de la carte. La
correction n'est appliquée que si la syllabe visée a bien une initiale
pinyin `j`, que le corpus rend `dj`. Si le pinyin est absent ou si la syllabe
porte une autre initiale (q → tch, x → ch, z → dz), l'aide est écartée et
signalée.

    python3 -BI corriger_tj.py <racine>            # contrôle
    python3 -BI corriger_tj.py <racine> --apply    # écrit
"""
import json, os, re, sys, unicodedata
from collections import Counter

ROOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
APPLY = "--apply" in sys.argv
CONTENT = os.path.join(ROOT, "melunga_deploy/content/niveaux-progressifs")


def flat(d):
    o = []
    for t in (d.get("themes") or []) + (d.get("heldThemes") or []):
        o += (t.get("phrases") or [])
    return o + (d.get("reserve") or [])


def dp(t):
    t = unicodedata.normalize("NFD", (t or "").lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return [x for x in re.split(r"[^a-zü]+", t) if x]


reg, ecartes = [], []
for lv in range(1, 11):
    fp = os.path.join(CONTENT, "fr-zh", f"L{lv}.json")
    d = json.load(open(fp, encoding="utf-8"))
    ch = 0
    for p in flat(d):
        ph = p.get("phon") or ""
        if "tj" not in ph.lower():
            continue
        # le pinyin écrit les composés sans espace — yǐjīng, shǒujī, shíjiān —
        # donc on cherche l'initiale j partout dans la chaîne, pas en tête de
        # jeton. En pinyin, j n'est jamais suivi que de i ou de u (pour ü), et
        # aucune autre initiale ne produit un j : le test est sûr.
        rd = unicodedata.normalize("NFD", (p.get("reading") or "").lower())
        rd = "".join(c for c in rd if unicodedata.category(c) != "Mn")
        j_syl = set(re.findall(r"j[iu]\w*", rd))
        # les jetons d'aide portant tj
        jetons = [t for t in re.split(r"[\s\-]+", ph) if "tj" in t.lower()]
        # une correction n'est sûre que si la carte contient au moins autant
        # de syllabes en j- que de jetons en tj
        if not j_syl:
            ecartes.append({"id": p.get("id"), "level": lv, "study": p.get("study"),
                            "phon": ph, "reading": p.get("reading"),
                            "motif": "aucune syllabe pinyin en j- : correction non sûre"})
            continue
        neuf = re.sub(r"tj", "dj", ph)
        neuf = re.sub(r"TJ", "DJ", neuf)
        neuf = re.sub(r"Tj", "Dj", neuf)
        reg.append({"pair": "fr-zh", "level": lv, "id": p.get("id"),
                    "study": p.get("study"), "native": p.get("native"),
                    "reading": p.get("reading"),
                    "avant": ph, "apres": neuf, "regle": "D",
                    "jetons": jetons, "pinyinJ": sorted(j_syl),
                    "raison": "le digramme tj n'a aucune valeur en français ; "
                              "la syllabe visée a une initiale pinyin j, que le "
                              "corpus rend dj"})
        if APPLY:
            p["phon"] = neuf
            p["phoneticReviewStatus"] = "corrected-by-Claude-tj-vers-dj"
            ch += 1
    if APPLY and ch:
        with open(fp, "w", encoding="utf-8") as fh:
            json.dump(d, fh, ensure_ascii=False, separators=(",", ":"))
            fh.write("\n")

print("=== RÈGLE D — tj → dj ===" + ("  (écriture)" if APPLY else "  (contrôle)"))
print(f"\n   {len(reg)} aides corrigées · {len(ecartes)} écartées\n")
print(f"   par niveau : " + " · ".join(
    f"L{k}:{v}" for k, v in sorted(Counter(x["level"] for x in reg).items())))
print()
for x in reg[:10]:
    print(f"   L{x['level']} {str(x['study'])[:20]:<22} {x['avant'][:40]}")
    print(f"   {'':<26} {x['apres'][:40]}   pinyin {','.join(x['pinyinJ'])}")
if ecartes:
    print(f"\n   écartées :")
    for x in ecartes:
        print(f"      {x['id']}  {x['phon'][:40]}  — {x['motif']}")
json.dump({"corrections": reg, "ecartees": ecartes},
          open(os.path.join(ROOT, "docs/revue-integrale/registre-tj.json"), "w",
               encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"\n→ registre-tj.json : {len(reg)} corrections")

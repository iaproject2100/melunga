# -*- coding: utf-8 -*-
"""Le reclassement proposé corrige-t-il les anomalies mesurées sur bcd108d ?

1. vérifie que les phrases recopiées sont identiques aux sources
2. rejoue la mesure de difficulté en suivant proposedLevel au lieu du niveau
   d'origine, et compare les deux courbes
"""
import json, os, re, sys, unicodedata
from collections import defaultdict

REPO = sys.argv[1]
CONV = os.path.join(REPO, "melunga_deploy/content/conversation")
SCR = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.path.join(SCR, "pc.json"), encoding="utf-8"))
CJK = ("zh", "ja", "ko")
PUNCT = "".join(chr(c) for c in range(0x20, 0x300) if unicodedata.category(chr(c)).startswith("P")) + "。，、？！：；（）「」『』〜・…—　？！"


def toks(t, lang):
    t = t.strip()
    if lang in CJK:
        r = [c for c in t if c not in PUNCT and not c.isspace() and not c.isascii()]
        return r or [w for w in re.split(r"[\s" + re.escape(PUNCT) + r"]+", t.lower()) if w]
    return [w for w in re.split(r"[\s" + re.escape(PUNCT) + r"]+", t.lower()) if w]


docs = {}
def doc(f):
    if f not in docs:
        docs[f] = json.load(open(os.path.join(CONV, f), encoding="utf-8"))
    return docs[f]

# ---------- 1. conservation ----------
nok = 0
pb = []
for pair in d["pairs"]:
    for lvl in pair["levels"]:
        for u in lvl["units"]:
            for ph in u["phrases"]:
                ref = ph["id"].split(":")
                dc = doc(ref[0])
                un = [x for x in dc["units"] if x["id"] == ref[1]][0]
                v = un["variants"][int(ref[2].lstrip("v"))]
                for f in ("study", "phon", "native", "reading"):
                    if f in ph or v.get(f):
                        if (ph.get(f) or "") != (v.get(f) or ""):
                            pb.append(f"{ph['id']} {f} : « {ph.get(f)} » ≠ source « {v.get(f)} »")
                        else:
                            nok += 1
print(f"1. CONSERVATION — {nok} champs conformes, {len(pb)} écart(s)")
for q in pb[:8]:
    print("   ! " + q)

# ---------- 2. courbe avant / après ----------
def curve(by_level):
    """by_level : {couple: {niveau: [unités]}} -> longueur moyenne par niveau"""
    out = {}
    for couple, lv in by_level.items():
        study = couple.split("→")[1]
        known = set()
        res = {}
        for n in range(1, 11):
            tk, lens = [], []
            for u in lv.get(n, []):
                for s in u:
                    t = toks(s, study)
                    tk += t
                    if "{s}" not in s:
                        lens.append(len(t))
            res[n] = (round(sum(lens) / max(1, len(lens)), 1),
                      round(100 * len([x for x in set(tk) if x not in known]) / max(1, len(set(tk)))))
            known |= set(tk)
        out[couple] = res
    return out

avant, apres = defaultdict(lambda: defaultdict(list)), defaultdict(lambda: defaultdict(list))
for pair in d["pairs"]:
    c = f"{pair['nativeLanguage']}→{pair['studyLanguage']}"
    for lvl in pair["levels"]:
        for u in lvl["units"]:
            phrases = [p["study"] for p in u["phrases"]]
            avant[c][u["sourceLevel"]].append(phrases)
            apres[c][u["proposedLevel"]].append(phrases)

A, B = curve(avant), curve(apres)
print("\n2. NON-MONOTONIES (un niveau plus long que le suivant)")
print(f"   {'couple':<9} {'avant (niveau source)':<44} {'après (niveau proposé)'}")
tot_a = tot_b = 0
for c in ["fr→en", "fr→es", "fr→zh", "fr→it", "fr→ja", "fr→ko", "zh→fr"]:
    def bad(M):
        return [f"L{n}>L{n+1}" for n in range(1, 10) if M[c][n][0] > M[c][n + 1][0]]
    ba, bb = bad(A), bad(B)
    tot_a += len(ba); tot_b += len(bb)
    print(f"   {c:<9} {(' · '.join(ba) or '—'):<44} {' · '.join(bb) or '— monotone —'}")
print(f"\n   total : {tot_a} non-monotonies avant → {tot_b} après")

print("\n3. LE PIC L7 (longueur moyenne L6 → L7 → L8)")
print(f"   {'couple':<9} {'avant':<26} {'après'}")
fix = 0
for c in ["fr→en", "fr→es", "fr→zh", "fr→it", "fr→ja", "fr→ko", "zh→fr"]:
    a = [A[c][n][0] for n in (6, 7, 8)]
    b = [B[c][n][0] for n in (6, 7, 8)]
    pa = "PIC" if a[1] > a[2] else "ok"
    pb_ = "PIC" if b[1] > b[2] else "ok"
    if a[1] > a[2] and not b[1] > b[2]:
        fix += 1
    print(f"   {c:<9} {a[0]:>5} → {a[1]:>5} → {a[2]:<5} {pa:<5} {b[0]:>5} → {b[1]:>5} → {b[2]:<5} {pb_}")
print(f"\n   pic L7 corrigé dans {fix} couple(s) sur 7")

print("\n4. DÉPLACEMENTS — sens et amplitude")
mv = defaultdict(int)
amp = defaultdict(int)
for pair in d["pairs"]:
    for lvl in pair["levels"]:
        for u in lvl["units"]:
            if u["sourceLevel"] != u["proposedLevel"]:
                mv[f"{pair['nativeLanguage']}→{pair['studyLanguage']}"] += 1
                amp[u["proposedLevel"] - u["sourceLevel"]] += 1
print("   par couple : " + " · ".join(f"{k}:{v}" for k, v in sorted(mv.items())) + f"  (total {sum(mv.values())})")
print("   amplitude  : " + " · ".join(f"{k:+d} niveau(x) : {v}" for k, v in sorted(amp.items())))
print("\n   unités L1 déplacées : " + str(sum(1 for pair in d['pairs'] for lvl in pair['levels'] for u in lvl['units'] if u['sourceLevel'] == 1 and u['proposedLevel'] != 1)))

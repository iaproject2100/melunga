# -*- coding: utf-8 -*-
"""Vérification indépendante du curriculum v2 (afc39f3) :
conservation des champs sources, différés L1, charge du L1 chinois réellement
présenté, substitutions, et dépendances devenues futures. Lecture seule."""
import json, os, re, subprocess, sys, unicodedata
from collections import Counter, defaultdict

REV = "origin/review/parcours-complet-progressif"
REPO = sys.argv[1]
os.chdir(REPO)
CONV = "melunga_deploy/content/conversation"
PAIRS = ["fr-en", "fr-es", "fr-it", "fr-zh", "fr-ja", "fr-ko", "zh-fr"]


def show(path):
    r = subprocess.run(["git", "show", f"{REV}:{path}"], capture_output=True, text=True)
    return r.stdout if r.returncode == 0 else None


cur = {}
for p in PAIRS:
    t = show(f"melunga_deploy/content/curriculum/{p}.json")
    if t:
        cur[p] = json.loads(t)
print(f"{len(cur)} fichiers de curriculum récupérés\n")
if not cur:
    sys.exit("fichiers absents")

k = cur["fr-zh"]
print("── structure d'un fichier de curriculum ──")
for a, b in k.items():
    print(f"   {a}: " + (f"{type(b).__name__}[{len(b)}]" if isinstance(b, (list, dict)) else repr(b)[:70]))

# ---- conservation : chaque phrase doit venir d'une source inchangée
docs = {}
def doc(f):
    if f not in docs:
        docs[f] = json.load(open(os.path.join(CONV, f), encoding="utf-8"))
    return docs[f]

src = open("melunga_deploy/app.html", encoding="utf-8").read()
i = src.index("var DECKS = ") + len("var DECKS = ")
DECKS = json.loads(src[i:src.index("\n", i)].rstrip(";"))

FIELDS = ("study", "phon", "native", "reading")
ok = bad = unres = 0
problems = []

def check_phrase(ph, pair):
    """Vérifie une phrase du curriculum contre sa source déclarée."""
    global ok, bad, unres
    ref = ph.get("id") or ph.get("sourceId") or ""
    if ":" not in ref:
        unres += 1
        return
    parts = ref.split(":")
    if parts[0].startswith("catalogue") or "DECKS" in ref:
        m = re.search(r"(\d+)", ":".join(parts[1:]))
        lang = pair.split("-")[1]
        if not m or lang not in DECKS:
            unres += 1
            return
        card = DECKS[lang][int(m.group(1))]
        pairs_to_check = [("study", "t"), ("native", "frm")]
        for dst, s in pairs_to_check:
            if ph.get(dst) is not None:
                if ph[dst] != card.get(s):
                    bad += 1
                    problems.append(f"{pair} {ref} {dst}: « {ph[dst]} » ≠ catalogue « {card.get(s)} »")
                else:
                    ok += 1
        return
    fname = parts[0]
    if not fname.endswith(".json"):
        unres += 1
        return
    try:
        d = doc(fname)
    except FileNotFoundError:
        unres += 1
        return
    uid = parts[1]
    if "-d" in uid:
        dl = [x for x in d["dialogues"] if x["id"] == uid]
        if not dl:
            unres += 1
            return
        idx = int(re.sub(r"\D", "", parts[2]) or 0)
        t = dl[0]["turns"][idx]
    else:
        un = [x for x in d["units"] if x["id"] == uid]
        if not un:
            unres += 1
            return
        vi = int(re.sub(r"\D", "", parts[2]) or 0)
        t = un[0]["variants"][vi]
    frag = parts[3] if len(parts) > 3 else None
    for f in FIELDS:
        if ph.get(f) is not None or t.get(f):
            a, b = ph.get(f), t.get(f)
            if frag:                                  # fragment : doit être une sous-chaîne du tour
                if a and a not in (b or ""):
                    bad += 1
                    problems.append(f"{pair} {ref} {f}: « {a} » n'est pas une sous-chaîne de « {b} »")
                else:
                    ok += 1
            elif (a or "") != (b or ""):
                bad += 1
                problems.append(f"{pair} {ref} {f}: « {a} » ≠ source « {b} »")
            else:
                ok += 1


def phrases_of(obj):
    """Parcourt récursivement et rend tout objet qui ressemble à une phrase."""
    out = []
    def rec(o):
        if isinstance(o, dict):
            if "study" in o and ("id" in o or "sourceId" in o):
                out.append(o)
            for v in o.values():
                rec(v)
        elif isinstance(o, list):
            for v in o:
                rec(v)
    rec(obj)
    return out


print("\n── conservation des champs sources ──")
for p, data in cur.items():
    for ph in phrases_of(data):
        check_phrase(ph, p)
print(f"   {ok} champs conformes · {bad} écart(s) · {unres} références non résolues par mon lecteur")
for q in problems[:10]:
    print("   ! " + q)

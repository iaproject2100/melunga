# -*- coding: utf-8 -*-
"""Rôles nommés des dialogues (à la place de « Personne A / Personne B »).
Ajoute à chaque dialogue :  "roles": {"A": "…", "B": "…"},  "learnerRole": "A" | "B"
Les noms sont dans la langue maternelle du fichier (fr pour fr→*, zh pour zh→fr). Le rôle de l'apprenant est celui
que l'interface masque par défaut. Les règles ci-dessous vont du plus précis au plus général ; `OVERRIDES` fixe
les cas où l'apprenant n'est pas A (le professionnel ouvre l'échange).
Usage : python3 roles.py            → applique aux 70 fichiers L*-*.json et affiche le récapitulatif
        python3 roles.py --dry-run  → affiche seulement
"""
import json, glob, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))

# (regex sur la situation, rôle A, rôle B) — l'apprenant est A sauf OVERRIDES
RULES_FR = [
    (r"café|bar$", "Client", "Serveur"),
    (r"restaurant entre amis|que choisir|préférence argumentée|parler d'alimentation|goûts à table", "Toi", "Un ami"),
    (r"restaurant", "Client", "Serveur"),
    (r"hôtel|réception", "Client", "Réceptionniste"),
    (r"pharmacie", "Client", "Pharmacien"),
    (r"médecin", "Patient", "Médecin"),
    (r"changement de plan", "Toi", "Un ami"),
    (r"gare|billet|train|vol annulé", "Voyageur", "Agent"),
    (r"poste", "Client", "Employé de la poste"),
    (r"immigration|démarche|inscription|document manque", "Usager", "Employé"),
    (r"propriétaire", "Locataire", "Propriétaire"),
    (r"marché|magasin|boutique|négocier|marchander|sac|téléphone$|comparer", "Client", "Vendeur"),
    (r"choisir un logement|choisir un appartement|déménag|ville ou campagne|changer de travail|télétravail|nouveau projet|réunion de travail", "Toi", "Un collègue"),
    (r"congé|délai|absence|malentendu|réunion|bureau|travail|collègue|projet", "Toi", "Un collègue"),
    (r"mère|famille", "Toi", "Ta mère"),
    (r"voisin", "Toi", "Un voisin"),
    (r"ami|rencontre|retrouvailles|sortie|dîner|rendez-vous|week-end|voyage|vacances|quartier|journée|soirée|vie en", "Toi", "Un ami"),
]
RULES_ZH = [
    (r"咖啡馆", "顾客", "服务员"), (r"餐厅|选餐厅", "顾客", "服务员"), (r"和朋友吃饭", "你", "朋友"),
    (r"火车|车站碰头", "旅客", "工作人员"), (r"医生", "病人", "医生"), (r"房东", "房客", "房东"),
    (r"商店|市场", "顾客", "店员"), (r"手续", "办事人", "工作人员"),
    (r"上司|会议|远程办公|同事|工作的变化", "你", "同事"), (r"家人", "你", "妈妈"),
    (r"见面|朋友|周末|电影|家庭|住处|工作和一天|假期|搬|旅行|初次", "你", "朋友"),
]
# Précisions : famille/travail ambigus, et dialogues où l'apprenant répond (B)
OVERRIDES = {
    ("fr", "Parler de sa famille"): ("Toi", "Un ami", "A"), ("fr", "Parler de sa famille (entre amis, tu)"): ("Toi", "Un ami", "A"),
    ("fr", "Chez le médecin"): ("Médecin", "Patient", "B"),            # L9-fr-en : le médecin ouvre
    ("fr", "Au travail, demander un délai"): ("Responsable", "Toi", "B"),  # L8-fr-en : le responsable demande le rapport
    ("fr", "Au travail : demander un délai"): ("Toi", "Responsable", "A"),
    ("fr", "Au travail : demander un délai (Lei)"): ("Toi", "Responsable", "A"),
    ("fr", "Demander un délai au travail"): ("Toi", "Responsable", "A"),
    ("fr", "Demander un congé"): ("Toi", "Responsable", "A"),
    ("fr", "Une absence"): ("Responsable", "Toi", "B"),
    ("fr", "Fixer une réunion (travail, Lei)"): ("Toi", "Responsable", "A"),
    ("fr", "Chez un ami"): ("Toi", "Un ami", "A"),
    ("fr", "Pause café entre collègues"): ("Toi", "Un collègue", "A"),
    ("fr", "Choisir un logement"): ("Toi", "Un ami", "A"), ("fr", "Choisir un appartement"): ("Toi", "Un ami", "A"),
    ("fr", "Première rencontre"): ("Toi", "Une nouvelle connaissance", "A"),
    ("zh", "车站碰头"): ("你", "朋友", "A"), ("zh", "选餐厅"): ("你", "朋友", "A"), ("zh", "工作上的初次见面"): ("你", "同事", "A"), ("zh", "初次见面"): ("你", "新认识的人", "A"),
    ("fr", "Le nouveau voisin (Lei)"): ("Toi", "Une voisine", "A"),
    ("fr", "Entre voisins"): ("Toi", "Une voisine", "A"),
    ("fr", "Au magasin, choisir"): ("Toi", "Un ami", "A"),
    ("fr", "Choisir un sac"): ("Toi", "Un ami", "A"),
    ("fr", "Dans un magasin : comparer"): ("Client", "Vendeur", "A"),
    ("fr", "Au restaurant : préférence argumentée"): ("Un ami", "Toi", "B"),  # L7-fr-ja : l'ami interroge Marie
    ("fr", "Débat amical : ville ou campagne"): ("Un ami", "Toi", "B"),
    ("fr", "Bilan d'une vie en Corée"): ("Un ami", "Toi", "B"),
    ("fr", "Mon quartier"): ("Un ami", "Toi", "B"),
    ("fr", "Une journée type"): ("Toi", "Un ami", "A"),
    ("fr", "Lundi matin au travail"): ("Un collègue", "Toi", "B"),
    ("fr", "Refuser et proposer autre chose"): ("Un collègue", "Toi", "B"),
    ("fr", "Au travail : un malentendu"): ("Toi", "Un collègue", "A"),
    ("fr", "Malentendu au bureau"): ("Un collègue", "Toi", "B"),
    ("fr", "Retour de voyage"): ("Un ami", "Toi", "B"),
    ("fr", "Retrouvailles, raconter un voyage"): ("Un ami", "Toi", "B"),
    ("fr", "Un voyage raconté"): ("Un ami", "Toi", "B"),
    ("fr", "Raconter ses vacances"): ("Un ami", "Toi", "B"),
    ("fr", "Changer de travail"): ("Toi", "Un ami", "A"),
    ("fr", "Changer de travail ?"): ("Un ami", "Toi", "B"),
    ("fr", "Déménager ou pas"): ("Un collègue", "Toi", "B"),
    ("fr", "Déménager ou pas ?"): ("Un ami", "Toi", "B"),
    ("fr", "Déménager ou pas ? (entre amis, tu)"): ("Un ami", "Toi", "B"),
    ("fr", "Déménager ou rester"): ("Un ami", "Toi", "B"),
    ("fr", "Décider d'un déménagement"): ("Un ami", "Toi", "B"),
    ("fr", "Pourquoi déménager"): ("Un ami", "Toi", "B"),
    ("fr", "Pourquoi tu as déménagé ? (entre amis, tu)"): ("Un ami", "Toi", "B"),
    ("fr", "Au travail, nouveau rythme"): ("Un collègue", "Toi", "B"),
    ("fr", "Au travail : expliquer un choix"): ("Toi", "Un collègue", "A"),
    ("fr", "Télétravail ou bureau"): ("Un ami", "Toi", "B"),
    ("fr", "Débat sur le télétravail"): ("Toi", "Un collègue", "A"),
    ("fr", "Au bureau, le nouveau projet"): ("Toi", "Un collègue", "A"),
    ("fr", "Réunion de travail : décider"): ("Toi", "Un collègue", "A"),
    ("fr", "Appel à la famille"): ("Toi", "Ta mère", "A"), ("fr", "Un appel à la famille"): ("Toi", "Ta mère", "A"), ("fr", "Au téléphone avec sa mère (tu)"): ("Toi", "Ta mère", "A"),
    ("fr", "Appeler le propriétaire"): ("Locataire", "Propriétaire", "A"),
    ("zh", "工作：远程办公的讨论"): ("你", "同事", "A"), ("zh", "向上司请求延期"): ("你", "上司", "A"),
    ("zh", "旅行归来的讲述"): ("朋友", "你", "B"), ("zh", "要不要搬到乡下"): ("朋友", "你", "B"), ("zh", "聊工作的变化"): ("朋友", "你", "B"),
    ("zh", "假期归来（同事之间）"): ("你", "同事", "A"), ("zh", "安排工作会议"): ("你", "上司", "A"),
}

def assign(nat, situation):
    if (nat, situation) in OVERRIDES: return OVERRIDES[(nat, situation)]
    for rx, a, b in (RULES_FR if nat == "fr" else RULES_ZH):
        if re.search(rx, situation, re.I): return (a, b, "A")
    return None

if __name__ == "__main__":
    dry = "--dry-run" in sys.argv
    missing, done = [], 0
    for f in sorted(glob.glob(f"{HERE}/L*-*.json")):
        doc = json.load(open(f, encoding="utf-8")); changed = False
        for d in doc["dialogues"]:
            r = assign(doc["nativeLanguage"], d["situation"])
            if not r: missing.append((os.path.basename(f), d["situation"])); continue
            d["roles"] = {"A": r[0], "B": r[1]}; d["learnerRole"] = r[2]; changed = True; done += 1
        if changed and not dry: json.dump(doc, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{done} dialogues avec rôles" + (" (simulation)" if dry else ""))
    if missing: print("sans règle :", missing); sys.exit(1)

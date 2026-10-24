#!/usr/bin/env python3
"""Build the separate themed L1 mockup, copying catalogue strings verbatim.

Classification is an editable editorial proposal, not a level reassignment or
an assertion about a learner's knowledge. The application catalogue is read
only. Run with --check to verify the four generated artefacts are current.
"""
import argparse
import hashlib
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
APP = ROOT / "melunga_deploy/app.html"
DATA = ROOT / "melunga_deploy/content/maquette-guidee.json"
REPORT = ROOT / "docs/maquette-guidee/donnees.json"
DOC = ROOT / "docs/maquette-guidee/donnees.md"

PAIRS = [
    ("fr-en", "fr", "en", "Anglais", "🇬🇧", 323),
    ("fr-es", "fr", "es", "Espagnol", "🇪🇸", 289),
    ("fr-it", "fr", "it", "Italien", "🇮🇹", 338),
    ("fr-zh", "fr", "zh", "Chinois", "🇨🇳", 314),
    ("fr-ja", "fr", "ja", "Japonais", "🇯🇵", 290),
    ("fr-ko", "fr", "ko", "Coréen", "🇰🇷", 287),
    ("zh-fr", "zh", "fr", "法语", "🇫🇷", 293),
]

THEMES = [
    ("saluer", "Saluer et faire connaissance", "问候与相识"),
    ("comprendre", "Se comprendre et demander de l’aide", "理解与求助"),
    ("ressentis", "Besoins, envies et santé", "需求、感受与健康"),
    ("repas", "Sortir, commander et acheter", "用餐、点单与购物"),
    ("deplacements", "Se déplacer et voyager", "出行与旅行"),
    ("reperes", "Temps et nombres", "时间与数字"),
    ("quotidien", "Chez soi et avec ses proches", "居家与亲友"),
    ("decrire", "Décrire et comparer", "描述与比较"),
    ("conversation", "Faire vivre la conversation", "延续对话"),
    ("travail", "Travail et échanges professionnels", "工作与商务交流"),
    ("personnaliser", "À personnaliser", "待补全的表达"),
]


def normal(text):
    text = text.lower().replace("’", "'").replace("œ", "oe")
    text = "".join(c for c in unicodedata.normalize("NFD", text)
                   if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", text).strip(" .!?;:…")


def words(text):
    return set(re.findall(r"[a-z]+", normal(text)))


def contains(text, patterns):
    return any(re.search(pattern, text) for pattern in patterns)


GREETINGS = [r"\bbonjour\b", r"\bbonsoir\b", r"\bsalut\b", r"\bmerci\b",
             r"\bpardon\b", r"\bdesole", r"excuse", r"au revoir", r"a bientot",
             r"a demain", r"a plus tard", r"a tout (a l'heure|de suite)",
             r"bonne (nuit|journee|soiree|annee|chance)", r"bienvenue", r"de rien",
             r"s'il (vous|te) plait$", r"avec plaisir$", r"je vous en prie",
             r"apres vous$", r"felicitations", r"joyeux anniversaire", r"prenez soin",
             r"ca fait longtemps", r"ce n'est rien$"]
FOOD = [r"\b(mang|mange|manges|manger|mangeons|repas|dejeuner|diner|petit-dejeuner)\b",
        r"\b(cafe|the|eau|boire|boisson|pain|lait|oeuf|oeufs|soupe|poisson|riz|viande|poulet|biere|vin|jus|sucre|sel|fruit|fruits|legumes|pomme|pommes|nouilles|plat|plats|menu|restaurant|addition|serveur|table|assiette|verre|tasse)\b",
        r"a emporter", r"sur place", r"a point$", r"epice", r"delicieux", r"regale",
        r"bon appetit", r"sers-toi", r"c'est moi qui offre", r"sent (trop )?bon",
        r"c'est pret$", r"vous etes combien", r"^la carte$", r"\bcanette\b"]
SHOP = [r"\b(prix|cout|coute|coutent|cher|chere|chers|acheter|achete|achetez|achat|payer|paie|payez|especes|monnaie|recu|ticket|reduction|promo|remboursable|gratuit|gratuitement|argent|euro|euros|dollar|dollars|magasin|boutique|taille|tailles|vetement|vetements|essayer|essaie|essayez|chaussure|chaussures)\b",
        r"combien (ca|cela|c'est|l'unite)", r"ca fait combien", r"c'est combien",
        r"vous en avez", r"vous avez en (grand|petit)", r"un neuf$", r"je veux (ca|cela|ceci)$"]
TRAVEL = [r"\b(aller|allons|va|vais|vas|allez|partir|pars|partez|venir|viens|venez|arrive|arriver|arrives|arrives|arrivez|arrivee|arrivees|arrivons|retour|revenir|reviens|route|rue|adresse|gauche|droite|droit|loin|pres|taxi|metro|station|aeroport|train|bus|avion|billet|billets|transport|voiture|pied|hotel|chambre|reservation|reserve|passeport|bagages|voyage|voyager|plan|carte|place)\b",
          r"par (ici|la)$", r"(ici|la-bas)$", r"c'est (ou|derriere|devant|a l'interieur)",
          r"(tout droit|on y est|arretez ici|en haut|en bas|a l'interieur|a l'exterieur)",
          r"^(devant|derriere|dedans|dehors|partout|sur|sous|dans|entre)$",
          r"sens unique", r"\barret\b", r"terminus", r"a cote de", r"au-dessus", r"en dessous",
          r"a l'etage", r"c'est par ou", r"je suis perdu", r"n'importe ou",
          r"^je suis (la|ici)$", r"^ou est-ce$"]
TIME = [r"\b(heure|heures|minute|minutes|seconde|secondes|instant|moment|jour|jours|journee|semaine|semaines|mois|annee|an|ans|matin|matinee|soir|nuit|apres-midi|week-end|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre|hier|demain|aujourd'hui|maintenant|tard|tot|bientot|recemment|souvent|parfois|rarement|jamais|toujours|temps|retard|rendez-vous|ete|hiver|printemps|automne)\b",
        r"(fois|premier|premiere|deuxieme|troisieme|quatrieme|cinquieme|sixieme|dernier|derniere|demi|moitie)",
        r"^(avant|apres|ensuite|pendant|depuis|deja|enfin|encore|auparavant|a present|en ce moment)",
        r"tout de suite", r"de temps en temps", r"a l'instant", r"au combien", r"le combien",
        r"^pas encore$", r"^de nouveau$", r"^dans le passe$", r"n'importe quand"]
PEOPLE = [r"\b(famille|mere|pere|maman|papa|fils|fille|frere|soeur|mari|femme|epouse|epoux|enfant|enfants|bebe|homme|hommes|femmes|gens|personne|personnes|ami|amie|amis|amies|copain|copine|monsieur|madame|grand-mere|grand-pere|petit-fils|petite-fille|tout-petit|celibataire)\b"]
FEELINGS = [r"\b(froid|chaud|faim|soif|malade|hopital|medecin|secours|aide|aider|urgence|mal|douleur|sang|tete|main|mains|corps|peur|fatigue|fatiguee|heureux|heureuse|triste|content|contente|jaloux|jalouse|gene|genee|decu|decue|reconnaissant|reconnaissante|nerveux|nerveuse|coupable|seul|seule|curieux|curieuse|depasse|depassee|satisfait|satisfaite|impatient|impatiente|envie|besoin|veux|vouloir|aime|aimer|plait|adore|prefere|preferer|deteste|espere|esperer)\b",
            r"(comment|ca|tout) (vas?-tu|va|allez-vous)", r"je vais bien", r"n'en peux plus", r"j'en peux plus", r"tout va", r"ca ne va pas", r"ca va$",
            r"\b(soulage|anxieux|confiant|frustre|emu|honteux|stupefait|dos|coeur|visage)\b"]
HOME = [r"\b(maison|porte|cle|cles|habite|habiter|vis|vivre|douche|dormir|dors|laver|nettoyer|menage|lit|fenetre|toilettes|d'habitude|meteo|pluie|pleut|plu|neige|soleil|vent|terre|colis|internet|telephone|peinture|scie)\b",
        r"^(l')?air$", r"il fait (beau|chaud|froid)", r"asseyez-vous", r"assieds-toi", r"entrez", r"fermer", r"c'est ferme", r"salle de bain", r"ruban adhesif", r"feu d'artifice", r"^le feu$", r"leve-toi"]
WORK = [r"\b(travail|travaille|travaillons|travaillez|travailler|entreprise|usine|fabrique|fabriquez|fabrication|echantillon|echantillons|commande|commander|client|fournisseur|livraison|expediez|contrat|facture|devis|stock|qualite|quantite|dimensions|materiau|emballage|catalogue|minimum|personnalisable|bureau|cours|ecole|compte|carte de visite|deborde)\b",
        r"envoie-moi des photos", r"votre prix", r"on en discute"]
UNDERSTAND = [r"\b(comprend|comprends|comprenez|comprendre|compris|repete|repeter|repetez|lentement|parle|parlez|parler|dites|dire|ecoute|ecoutez|entends|entendre|question|demande)\b",
              r"je (ne )?sais", r"aucune idee", r"qu'est-ce que", r"c'est quoi", r"^(qui|quoi|ou|quand|pourquoi|comment|quel|combien)( / .*| \(.*\))?$",
              r"particule interrogative", r"ca veut dire", r"dis-moi", r"dis moi", r"doucement$", r"\b(lequel|reponse)\b", r"montre-moi", r"faux numero"]
INTRO = [r"(m'appelle|ton nom|votre nom|mon nom|je suis francais|je suis chino|je suis anglais|je suis italien|je suis japonais|je suis coreen|d'ou viens|d'ou venez|d'ou es|d'ou etes|quel age|\bans$)",
         r"^(je / moi|tu / toi|il / lui|elle|nous|vous \(pluriel\)|ils / eux|nom)$", r"c'est qui", r"^je viens de"]
DESCRIBE_WORDS = set(normal(x) for x in (
    "grand|petit|nouveau|neuf|vieux|facile|difficile|rapide|lent|propre|sale|plein|vide|lourd|leger|long|court|fort|faible|pareil|different|assez|tellement|interessant|ennuyeux|utile|inutile|dangereux|sur|important|etrange|normal|celebre|populaire|simple|complique|serieux|drole|bizarre|incroyable|terrible|confortable|necessaire|brillant|mat|clair|vif|pale|plusieurs|dur|serre|large|fin|profond|plat|rond|droit|lache|rouge|bleu|blanc|noir|vert|jaune|gris|marron|rose|orange|beige|dore|argente|bleu fonce|bleu clair|couleur|bon|mauvais|chose / truc|ceci|cela|celui-ci|celui-la|tres|tout|tous|chaque|autre|le meme|la meme chose|beaucoup|un peu|un petit peu|un peu plus|un peu moins|trop|au total|plus|moins|seulement|ensemble|soi-meme|tous / les deux|deux (unites)|correct / exact|faux"
).split("|"))


def classify(card, study_lang):
    gloss = card["t"] if study_lang == "fr" else card["frm"]
    text = normal(gloss)
    if card.get("cat") == "template" or card.get("pedagogicalStatus") == "modele-a-completer":
        return "personnaliser", "source-template"
    if card.get("cat") == "biz":
        return "travail", "source-business"
    # Exact adjective glosses distinguish « sûr » from spatial « sur », and
    # adjectival « plat » from a meal. Idioms are not literal comparisons.
    if text in ("moi non plus", "on est sur la meme longueur d'onde"):
        return "conversation", "editorial-expression"
    is_spatial_sur = text == "sur" and "û" not in gloss.lower()
    if not is_spatial_sur and (text in DESCRIBE_WORDS or text.split(" / ")[0] in DESCRIBE_WORDS or text in ("uni", "doux / mou")):
        return "decrire", "whole-description"
    # Scenario-specific nouns take priority over general time/location words.
    for theme, patterns in [
        ("repas", FOOD), ("travail", WORK), ("saluer", GREETINGS),
        ("saluer", INTRO), ("repas", SHOP), ("quotidien", HOME), ("ressentis", FEELINGS),
        ("quotidien", PEOPLE), ("deplacements", TRAVEL),
        ("reperes", TIME), ("comprendre", UNDERSTAND),
    ]:
        if contains(text, patterns):
            return theme, "french-meaning"
    number_atom = r"(?:zero|un|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|vingt|vingts|trente|quarante|cinquante|soixante|cent|cents|mille)"
    number_text = re.sub(r"\s*\([^)]*\)", "", text)
    if re.fullmatch(number_atom + r"(?:[ -](?:et|" + number_atom + r"))*", number_text):
        return "reperes", "whole-number-expression"
    if contains(text, [r"\b(trop|plus|moins|beaucoup|assez|meme)\b", r"^(c'est|il est) (grand|petit|bon|mauvais|beau|joli|important|parfait)", r"^le (meilleur|suivant)$", r"^(haut|bas|fonce|a carreaux|doux|lisse|rugueux|tranchant|collant|epais|etroit|peu profond|affreux)$"]):
        return "decrire", "description"
    return "conversation", "conversation-expression"


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def sha(value):
    return hashlib.sha256(canonical(value)).hexdigest()


def make():
    raw = APP.read_bytes()
    line = next(l for l in raw.decode().splitlines() if l.startswith("var DECKS = "))
    decks = json.loads(line.split("=", 1)[1].strip().rstrip(";"))
    data = {"version": 1, "status": "editorial-mockup-not-published", "pairs": []}
    report = {
        "version": 1, "sourceFile": "melunga_deploy/app.html",
        "sourceAppSha256": hashlib.sha256(raw).hexdigest(),
        "selection": "Every source card whose lv is the integer 1; no deduplication.",
        "classification": "Editable theme grouping by source category and French meaning; source order retained inside each theme.",
        "doesNotMeasureAcquisition": True, "publicationApproved": False,
        "levelChanges": 0, "newStudiedPhrases": 0, "newPhonetics": 0,
        "pairs": [], "checks": {},
    }
    total = 0
    for pair_id, native_lang, study_lang, name, flag, expected in PAIRS:
        deck = decks[study_lang]
        fmap = {"study": "t", "native": "cn" if study_lang == "fr" else "frm",
                "phon": "phon" if study_lang == "fr" else "phf" if study_lang == "zh" else "pf"}
        if study_lang in ("zh", "ja", "ko"):
            fmap["reading"] = "py"
        pair = {"id": pair_id, "nativeLanguage": native_lang, "studyLanguage": study_lang,
                "name": name, "flag": flag, "totalPhrases": expected, "themes": []}
        groups = {theme[0]: [] for theme in THEMES}
        reasons = Counter()
        source_indices = [i for i, card in enumerate(deck) if card.get("lv") == 1]
        assert len(source_indices) == expected, (pair_id, len(source_indices), expected)
        for index in source_indices:
            card = deck[index]
            theme_id, reason = classify(card, study_lang)
            reasons[reason] += 1
            phrase = {"id": f"catalogue:{study_lang}:{index}",
                      "study": card.get(fmap["study"], ""),
                      "native": card.get(fmap["native"], ""),
                      "phon": card.get(fmap["phon"], ""),
                      "speaker": "A", "kind": "learner",
                      "source": {"collection": f"DECKS.{study_lang}", "sourceIndex": index,
                                 "sourceLevel": 1, "fieldMap": fmap, "sourceSha256": sha(card)}}
            if "reading" in fmap and fmap["reading"] in card:
                phrase["reading"] = card[fmap["reading"]]
            if theme_id == "personnaliser":
                phrase["isTemplate"] = True
            groups[theme_id].append(phrase)
        counts = []
        seen = []
        field_count = 0
        for theme_id, fr_title, zh_title in THEMES:
            phrases = groups[theme_id]
            if not phrases:
                continue
            theme = {"id": theme_id, "title": zh_title if native_lang == "zh" else fr_title,
                     "totalPhrases": len(phrases), "phrases": phrases, "sequences": []}
            if theme_id == "travail":
                theme["optional"] = True
            if theme_id == "personnaliser":
                theme["isTemplateCollection"] = True
            for offset in range(0, len(phrases), 5):
                batch = phrases[offset:offset + 5]
                sid = f"{pair_id}:{theme_id}:{offset // 5 + 1}"
                ids = [p["id"] for p in batch]
                steps = []
                for phrase in batch:
                    for kind in (("understand",) if theme_id == "personnaliser" else ("understand", "imitate")):
                        steps.append({"id": f"{sid}:{phrase['source']['sourceIndex']}:{kind}",
                                      "kind": kind, "utterance": phrase["id"]})
                if theme_id != "personnaliser":
                    for phrase in batch:
                        steps.append({"id": f"{sid}:{phrase['source']['sourceIndex']}:recall",
                                      "kind": "choose-and-recall", "utterance": phrase["id"]})
                theme["sequences"].append({"id": sid,
                    "title": f"第 {offset // 5 + 1} 组" if native_lang == "zh" else f"Séquence {offset // 5 + 1}",
                    "phraseIds": ids, "steps": steps})
            pair["themes"].append(theme)
            counts.append({"id": theme_id, "title": theme["title"], "phrases": len(phrases),
                           "sequences": len(theme["sequences"]), "sourceIndices": [p["source"]["sourceIndex"] for p in phrases]})
            for phrase in phrases:
                index = phrase["source"]["sourceIndex"]
                seen.append(index)
                for output_field, source_field in fmap.items():
                    if source_field in deck[index]:
                        assert phrase[output_field] == deck[index][source_field], (pair_id, index, output_field)
                        field_count += 1
                assert phrase["source"]["sourceSha256"] == sha(deck[index])
            for seq in theme["sequences"]:
                assert 1 <= len(seq["phraseIds"]) <= 5
                prepared = set()
                for step in seq["steps"]:
                    if step["kind"] == "imitate":
                        prepared.add(step["utterance"])
                    if step["kind"] == "choose-and-recall":
                        assert step["utterance"] in prepared
                        assert set(step.get("choices", [])) <= prepared
        assert sorted(seen) == source_indices
        assert len(seen) == len(set(seen))
        all_phrases = [p for theme in pair["themes"] for p in theme["phrases"]]
        pair_report = {"id": pair_id, "rawL1": expected, "retainedIndices": len(seen),
                       "missingIndices": [], "extraIndices": [], "fieldComparisons": field_count,
                       "fieldDifferences": 0, "themes": counts,
                       "templates": sum(bool(p.get("isTemplate")) for p in all_phrases),
                       "sameStudyTextAdditionalOccurrencesRetained": expected - len({p["study"] for p in all_phrases}),
                       "classificationReasons": dict(reasons), "fieldMap": fmap}
        data["pairs"].append(pair)
        report["pairs"].append(pair_report)
        total += expected
    assert total == 2134
    report["checks"] = {"rawL1": total, "retainedDistinctSourceIndices": total,
                        "missingSourceIndices": 0, "extraSourceIndices": 0,
                        "fieldComparisons": sum(p["fieldComparisons"] for p in report["pairs"]),
                        "fieldDifferences": 0, "maxPhrasesPerSequence": 5,
                        "everyRecallPreparedEarlierInSameSequence": True}
    report["runtimeDataSha256"] = sha(data)
    return data, report


def markdown(report):
    lines = ["# Données de la maquette thématique L1", "",
        "Cette proposition conserve **les 2 134 cartes L1 du catalogue restauré**, sans dédoublonner les textes. Elle n’est pas publiée. Les thèmes organisent les cartes existantes ; ils ne changent ni leur niveau, ni les droits d’accès, ni les prix.", "",
        "Les petites séquences contiennent au maximum cinq expressions. Un thème réunit toutes ses séquences : il ne se limite donc pas à deux ou trois phrases. Chaque expression est présentée entière avant son rappel. Les séquences ne prétendent pas partager un même invariant grammatical et ne constituent pas un dialogue fabriqué.", "",
        "## Conservation des sources", "",
        "| Couple | Cartes L1 source | Indices conservés | Champs comparés | Écarts |", "|---|---:|---:|---:|---:|"]
    for p in report["pairs"]:
        lines.append(f"| {p['id']} | {p['rawL1']} | {p['retainedIndices']} | {p['fieldComparisons']} | 0 |")
    lines += [f"| **Total** | **2134** | **2134** | **{report['checks']['fieldComparisons']}** | **0** |", "",
        "L’identité est l’indice d’origine, pas le texte. Les occurrences de texte identique restent présentes, y compris quand leur sens ou leur aide diffèrent. Chaque entrée porte l’empreinte de la carte source et la correspondance des champs. Le rapport JSON donne tous les indices par thème.", "",
        "Le champ d’aide francophone est `pf` pour en/es/it/ja/ko et `phf` pour zh. Pour les sinophones étudiant le français, la traduction vient de `cn` et l’aide de `phon`. Les lectures `py` présentes pour zh/ja/ko sont recopiées, jamais transformées. Aucun champ vide n’est complété par un autre corpus.", "",
        "## Volumes par thème", "",
        "| Thème | fr-en | fr-es | fr-it | fr-zh | fr-ja | fr-ko | zh-fr |", "|---|---:|---:|---:|---:|---:|---:|---:|"]
    for theme_id, title, _ in THEMES:
        counts = [next((t["phrases"] for t in p["themes"] if t["id"] == theme_id), 0) for p in report["pairs"]]
        lines.append("| " + title + " | " + " | ".join(str(x) for x in counts) + " |")
    lines += ["", "## Limites éditoriales", "",
        "Le regroupement s’appuie sur le sens français et les catégories de la source. L’ordre source est conservé à l’intérieur de chaque thème, afin de garder les formules de départ avant les extensions du catalogue. C’est un ordre éditorial révisable, pas une preuve d’acquisition ni une validation de difficulté.", "",
        "Le thème professionnel reste optionnel et arrive à la fin. Les 45 cartes chinoises `cat: biz` y figurent toutes. Les modèles à trous sont conservés à part, dans « À personnaliser » ; leur présence n’est pas présentée comme un échange réussi. L’étendue du L1 historique comprend des mots, des expressions et des phrases complètes, d’où l’emploi du mot « expressions » dans l’interface.", "",
        "Aucune phrase étudiée, traduction, lecture ou phonétique n’est écrite, harmonisée ou recomposée. Aucun niveau n’est modifié. Rien de cette maquette n’est branché dans les leçons publiées.", "",
        "## Reproduction", "", "```sh", "python3 tools/maquette-guidee/build_data.py", "python3 tools/maquette-guidee/build_data.py --check", "```", "",
        f"Empreinte SHA-256 du fichier source : `{report['sourceAppSha256']}`.", ""]
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    data, report = make()
    outputs = {DATA: json.dumps(data, ensure_ascii=False, indent=2) + "\n",
               REPORT: json.dumps(report, ensure_ascii=False, indent=2) + "\n",
               DOC: markdown(report)}
    for path, text in outputs.items():
        if args.check:
            if not path.exists() or path.read_text() != text:
                raise SystemExit(f"Out of date: {path.relative_to(ROOT)}")
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text)
    print(json.dumps(report["checks"], ensure_ascii=False))


if __name__ == "__main__":
    main()

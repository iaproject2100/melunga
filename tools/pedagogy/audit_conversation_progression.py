#!/usr/bin/env python3
"""Inventaire et indices de relecture ; ne modifie aucune source pédagogique.

--write produit le rapport JSON et sa synthèse Markdown. --check recalcule et
compare ces deux rapports, sans écrire. Les égalités de textes ne constituent
ni une mesure de compréhension, ni une preuve d'exposition ou d'acquisition.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
import unicodedata

VERSION = 1
SOURCE_FILES = (
    "melunga_deploy/app.html",
    "melunga_deploy/conversation-loader.js",
    "melunga_deploy/construire.js",
    "melunga_deploy/content/conversation/matrix.json",
)
REPORT_DIR = "docs/progression-complete"
CJK = {"zh", "ja", "ko"}
TRANSLATION = {"fr": "frm", "en": "en", "es": "esm", "it": "itm", "ja": "jam", "ko": "kom"}
SOURCING = {"biz", "textile", "elec", "furniture", "lighting", "toys", "shoes", "bags", "machinery"}


def normalized(text: str) -> str:
    """Égalité de phrase entière sans casse/ponctuation, pas analyse lexicale."""
    return "".join(c for c in unicodedata.normalize("NFC", text).casefold()
                   if unicodedata.category(c)[0] in "LN")


def descriptive_length(text: str, study: str) -> int:
    if study in CJK:
        return len(normalized(text))
    return len(re.findall(r"[^\W\d_]+(?:['’][^\W\d_]+)?", text, re.U))


def embedded_json(source: str, marker: str) -> dict:
    start = source.index("=", source.index(marker)) + 1
    result, _ = json.JSONDecoder().raw_decode(source[start:].lstrip())
    if not isinstance(result, dict):
        raise ValueError(f"{marker}: objet JSON attendu")
    return result


def active_pairs(loader: str) -> set[str]:
    match = re.search(r"\bvar PAIRS\s*=\s*(\{[^;]+\});", loader)
    if not match:
        raise ValueError("PAIRS littéral introuvable ; relire le chargeur")
    result = set()
    for native, targets in re.findall(r"([a-z]+)\s*:\s*\[([^]]*)\]", match[1]):
        result.update(f"{native}-{target}" for target in re.findall(r"['\"]([a-z]+)['\"]", targets))
    if not result:
        raise ValueError("Aucun couple actif extrait du chargeur")
    return result


def readable_cards(decks: dict, native: str, study: str, guided=False) -> list[dict]:
    cards = decks.get(study, [])
    field = TRANSLATION.get(native)
    # guidedActiveDeck n'applique pas le filtre métier et omet encore ko.
    if guided and native == "ko":
        field = None
    if field:
        cards = [card for card in cards if card.get(field)]
    sourcing = native == "zh" or study == "zh" or native in {"fr", "es"} and study == "en"
    if not guided and not sourcing:
        cards = [card for card in cards if card.get("th") not in SOURCING]
    return cards


def frame_candidates(text: str, units: list[dict], study: str) -> list[str]:
    """Indice faible de relecture, jamais équivalent à une préparation validée."""
    target = normalized(text)
    minimum = 2 if study in CJK else 4
    found = []
    for unit in units:
        fragments = [normalized(part) for part in unit["model"]["study"].split("{s}")]
        fragments = [part for part in fragments if len(part) >= minimum]
        if not fragments:
            continue
        position = 0
        for fragment in fragments:
            index = target.find(fragment, position)
            if index < 0:
                break
            position = index + len(fragment)
        else:
            found.append(unit["id"])
    return found


def example(record: dict, where: dict, study: str) -> dict:
    return {**where, "study": record["study"], "phon": record["phon"],
            "native": record["native"], **({"reading": record["reading"]} if record.get("reading") else {}),
            "descriptiveLength": descriptive_length(record["study"], study)}


def build_report(root: Path, source_commit: str) -> dict:
    app = (root / SOURCE_FILES[0]).read_text()
    loader = (root / SOURCE_FILES[1]).read_text()
    decks = embedded_json(app, "var DECKS =")
    guided = embedded_json(app, "PEDAGOGY_FAMILIES =")
    enabled = active_pairs(loader)
    folder = root / "melunga_deploy/content/conversation"
    sources = [root / name for name in SOURCE_FILES]
    docs = defaultdict(list)
    for path in sorted(folder.glob("L*-*-*.json")):
        match = re.fullmatch(r"L(\d+)-([a-z]+)-([a-z]+)\.json", path.name)
        if not match:
            continue
        doc = json.loads(path.read_text())
        if doc.get("version") != 2 or doc.get("format") != "conversation-generic":
            raise ValueError(f"Schéma inattendu : {path.name}")
        pair = f'{doc["nativeLanguage"]}-{doc["studyLanguage"]}'
        if (int(match[1]), f"{match[2]}-{match[3]}") != (doc["level"], pair):
            raise ValueError(f"Nom/langues/niveau incohérents : {path.name}")
        docs[pair].append((path, doc))
        sources.append(path)
    if not docs:
        raise ValueError("Aucun fichier par couple/niveau")
    missing = sorted(f"L{level}-{pair}.json" for pair, entries in docs.items()
                     for level in range(1, 11) if level not in {doc["level"] for _, doc in entries})
    absent_enabled = sorted(enabled - set(docs))
    digest = hashlib.sha256()
    hashes = {}
    for path in sorted(sources):
        relative = path.relative_to(root).as_posix()
        raw = path.read_bytes()
        hashes[relative] = hashlib.sha256(raw).hexdigest()
        digest.update(relative.encode() + b"\0" + raw + b"\0")
    files, pairs = [], []
    for pair, entries in sorted(docs.items()):
        native, study = pair.split("-")
        catalogue = {normalized(card["t"]) for card in readable_cards(decks, native, study)}
        guided_readable = {card["t"] for card in readable_cards(decks, native, study, guided=True)}
        families = guided["languages"].get(study, {}).get("families", [])
        guided_targets = {normalized(ref["target"]) for family in families for ref in family["cards"]
                          if ref["target"] in guided_readable}
        earlier_variants, earlier_units, earlier_frames = {}, [], set()
        pair_files = []
        for path, doc in sorted(entries, key=lambda entry: entry[1]["level"]):
            relative = path.relative_to(root).as_posix()
            level = doc["level"]
            current_variants = defaultdict(list)
            for unit in doc["units"]:
                for index, variant in enumerate(unit["variants"]):
                    current_variants[normalized(variant["study"])].append({"unitId": unit["id"], "variantIndex": index})
            available_variants = {text: list(refs) for text, refs in earlier_variants.items()}
            for text, refs in current_variants.items():
                available_variants.setdefault(text, []).extend(refs)
            unit_reports, variant_examples = [], []
            for unit in doc["units"]:
                frame = unit["model"]["study"]
                fixed = normalized(frame.replace("{s}", ""))
                variants = unit["variants"]
                mismatches = [index for index, variant in enumerate(variants)
                              if frame.replace("{s}", variant["slot"]["study"]) != variant["study"]]
                normalized_mismatches = [index for index in mismatches
                                         if normalized(frame.replace("{s}", variants[index]["slot"]["study"])) != normalized(variants[index]["study"])]
                for index, variant in enumerate(variants):
                    variant_examples.append(example(variant, {"unitId": unit["id"], "variantIndex": index}, study))
                unit_reports.append({
                    "unitId": unit["id"], "situation": unit.get("situation", ""), "frame": frame,
                    "variantCount": len(variants), "wholePhraseFamily": not fixed,
                    "frameSeenEarlierLevel": bool(fixed and fixed in earlier_frames),
                    "literalTemplateMismatchIndices": mismatches,
                    "normalizedTemplateMismatchIndices": normalized_mismatches,
                    "punctuationOrCaseOnlyMismatchIndices": [index for index in mismatches if index not in normalized_mismatches],
                    "assembledFalseIndices": [index for index, variant in enumerate(variants) if variant.get("assembled") is False],
                    "exactEarlierVariantCount": sum(normalized(v["study"]) in earlier_variants for v in variants),
                    "exactReadableCatalogueCount": sum(normalized(v["study"]) in catalogue for v in variants),
                    "exactGuidedCount": sum(normalized(v["study"]) in guided_targets for v in variants),
                    "practice": unit.get("practice"),
                    "firstVariant": example(variants[0], {"variantIndex": 0}, study),
                    "lastVariant": example(variants[-1], {"variantIndex": len(variants) - 1}, study),
                })
            dialogue_reports, turn_examples = [], []
            for dialogue in doc["dialogues"]:
                learner_role = dialogue.get("learnerRole", "B")
                turns = []
                for index, turn in enumerate(dialogue["turns"]):
                    text = normalized(turn["study"])
                    refs = available_variants.get(text, [])
                    earlier = list(earlier_variants.get(text, []))
                    candidates = frame_candidates(turn["study"], earlier_units + doc["units"], study)
                    turns.append({**example(turn, {"turnIndex": index}, study),
                                  "speaker": turn["speaker"],
                                  "practiceRole": "learner" if turn["speaker"] == learner_role else "received",
                                  "exactVariantAtOrBefore": refs,
                                  "exactVariantEarlierLevel": earlier,
                                  "frameCandidatesNotValidated": candidates,
                                  "explicitPreparationAnnotation": bool(turn.get("preparation") or turn.get("answerWith"))})
                    turn_examples.append(example(turn, {"dialogueId": dialogue["id"], "turnIndex": index}, study))
                reuses = dialogue.get("reuses", [])
                previous = [reference for reference in reuses
                            if re.match(r"L(\d+)", reference) and int(re.match(r"L(\d+)", reference)[1]) < level]
                dialogue_reports.append({"dialogueId": dialogue["id"], "situation": dialogue.get("situation", ""),
                                         "roles": dialogue.get("roles"), "learnerRole": learner_role,
                                         "reuses": reuses, "earlierLevelReuses": previous, "turns": turns})
            flat_turns = [turn for dialogue in dialogue_reports for turn in dialogue["turns"]]
            received = [turn for turn in flat_turns if turn["practiceRole"] == "received"]
            learner = [turn for turn in flat_turns if turn["practiceRole"] == "learner"]
            counts = {"units": len(unit_reports), "variants": len(variant_examples), "dialogues": len(dialogue_reports),
                      "turns": len(flat_turns), "wholePhraseFamilies": sum(u["wholePhraseFamily"] for u in unit_reports),
                      "literalTemplateMismatches": sum(len(u["literalTemplateMismatchIndices"]) for u in unit_reports),
                      "normalizedTemplateMismatches": sum(len(u["normalizedTemplateMismatchIndices"]) for u in unit_reports),
                      "framesSeenEarlierLevel": sum(u["frameSeenEarlierLevel"] for u in unit_reports),
                      "exactReadableCatalogueVariants": sum(u["exactReadableCatalogueCount"] for u in unit_reports),
                      "exactGuidedVariants": sum(u["exactGuidedCount"] for u in unit_reports),
                      "learnerTurns": len(learner), "receivedTurns": len(received),
                      "learnerExactVariantAtOrBefore": sum(bool(t["exactVariantAtOrBefore"]) for t in learner),
                      "receivedExactVariantAtOrBefore": sum(bool(t["exactVariantAtOrBefore"]) for t in received),
                      "learnerFrameCandidateNotValidated": sum(bool(t["frameCandidatesNotValidated"]) for t in learner),
                      "receivedFrameCandidateNotValidated": sum(bool(t["frameCandidatesNotValidated"]) for t in received),
                      "dialoguesWithEarlierLevelReuse": sum(bool(d["earlierLevelReuses"]) for d in dialogue_reports),
                      "explicitPreparationAnnotations": sum(t["explicitPreparationAnnotation"] for t in flat_turns)}
            record = {"file": relative, "pair": pair, "activeInLoader": pair in enabled, "level": level,
                      "title": doc.get("title"), "goal": doc.get("goal"), "reviewStatus": doc.get("reviewStatus"),
                      "reviewPreviousLevels": doc.get("reviewPreviousLevels", []), "counts": counts,
                      "descriptiveLengthUnit": "Unicode letters/digits" if study in CJK else "alphabetic word tokens",
                      "longestVariant": max(variant_examples, key=lambda item: item["descriptiveLength"]),
                      "longestTurn": max(turn_examples, key=lambda item: item["descriptiveLength"]),
                      "units": unit_reports, "dialogues": dialogue_reports}
            files.append(record)
            pair_files.append(record)
            for text, references in current_variants.items():
                earlier_variants.setdefault(text, []).extend(references)
            earlier_units.extend(doc["units"])
            earlier_frames.update(normalized(u["model"]["study"].replace("{s}", "")) for u in doc["units"])
        total = {key: sum(record["counts"][key] for record in pair_files) for key in pair_files[0]["counts"]}
        pairs.append({"pair": pair, "nativeLanguage": native, "studyLanguage": study,
                      "activeInLoader": pair in enabled, "levels": [record["level"] for record in pair_files],
                      "guidedFamiliesForStudyLanguage": len(families),
                      "guidedReferencesForStudyLanguage": sum(len(f["cards"]) for f in families),
                      "counts": total})
    totals = {key: sum(record["counts"][key] for record in files) for key in files[0]["counts"]}
    return {
        "auditVersion": VERSION, "sourceCommit": source_commit, "sourceFingerprint": digest.hexdigest(),
        "scope": {"files": len(files), "storedPairs": len(pairs), "activeFiles": sum(f["activeInLoader"] for f in files),
                  "activePairs": sorted(enabled), "storedButNotEnabledPairs": sorted(set(docs) - enabled),
                  "missingLevelFiles": missing, "enabledPairsWithoutFiles": absent_enabled,
                  "productionOrDeviceChecked": False},
        "method": {
            "wholePhraseEquality": "NFC, casse ignorée, lettres/chiffres Unicode seuls ; égalité du tour entier à une variante entière.",
            "exactMatchWarning": "Présence textuelle, jamais preuve d'exposition, d'acquisition ou de compréhension. L'absence d'égalité n'est pas une erreur linguistique.",
            "frameCandidate": "Fragments fixes ordonnés dans le tour, longueur minimale 2 (zh/ja/ko) ou 4 (autres). Simple indice, faux positifs/négatifs possibles.",
            "length": "Mots alphabétiques (langues latines) ou lettres/chiffres (zh/ja/ko) ; descriptif seulement, pas échelle commune de difficulté.",
            "catalogue": "Cibles normalisées après filtres de lecture et de métier d'activeDeck, indépendamment des droits et de l'historique personnel.",
            "guided": "Références PEDAGOGY_FAMILIES résolubles dans guidedActiveDeck ; ne prouve aucun acquis et ne modifie pas les droits.",
            "templateMismatch": "Écart littéral au gabarit, potentiellement adaptation grammaticale correcte ; la phrase complète fait autorité.",
        },
        "totals": totals, "pairs": pairs, "files": files, "sourceSha256": hashes,
    }


def cell(value) -> str:
    return str(value).replace("|", "\\|").replace("\n", " ")


def render_markdown(report: dict) -> str:
    scope, totals = report["scope"], report["totals"]
    lines = ["# Audit de préparation des conversations — proposition locale", "",
             f"Source : `{report['sourceCommit']}`. Audit statique du corpus, aucun essai de compréhension, aucun changement de contenu ou de droits.", "",
             f"Le corpus contient **{scope['files']} fichiers**, **{scope['storedPairs']} couples** et les niveaux L1–L10 pour chacun. Le chargeur n'active que **{len(scope['activePairs'])} couples**, soit **{scope['activeFiles']} fichiers**. Les couples stockés mais non activés sont : {', '.join(scope['storedButNotEnabledPairs'])}.", "",
             f"Total : {totals['units']} unités, {totals['variants']} variantes entières, {totals['dialogues']} dialogues et {totals['turns']} répliques. Ces nombres décrivent le stock ; ils ne prouvent pas son apprentissage.", "",
             "## Ce qui doit guider l'amélioration", "",
             "Conserver les phrases complètes, leurs aides et les identifiants ; ajouter des parcours d'exposition et de réemploi par couple. Les niveaux actuels restent des adresses de contenu, sans être présentés comme une maîtrise attestée.", "",
             "1. Présenter une intention quotidienne et une phrase complète, faire écouter puis imiter, préparer un groupe de remplacement en contexte, montrer une autre phrase entière, puis combiner avec une question reçue et une clôture déjà présentées.",
             "2. Rendre l'essai sans modèle volontaire, réversible, après exposition du modèle choisi. Dans `construire.js:324–330`, le bouton d'essai passe aujourd'hui à la variante suivante, éventuellement jamais vue. Le dialogue est accessible dès la liste des unités (`:318`) et masque par défaut `learnerRole` (`:351–369`). Une présence dans le JSON ne prouve donc pas une préparation préalable.",
             "3. Traiter les répliques reçues comme compréhension globale ou travail explicite de structure, selon une annotation relue. Une question, une offre, un prix et une clôture n'imposent pas tous une réponse. Ne pas fabriquer une phonétique pour compléter un lien absent.",
             "4. Relier le Guidé, les unités de Mes phrases et les rubriques par références exactes. Garder catalogue, thèmes, vocabulaire et révisions comme ressources accessibles, sans les assimiler automatiquement à des prérequis acquis.", "",
             f"**Cas à relire, sans réécriture automatique :** {totals['wholePhraseFamilies']} unités ont un gabarit sans partie fixe alphanumérique (familles de phrases complètes) ; {totals['literalTemplateMismatches']} variantes diffèrent de la substitution littérale du gabarit, dont {totals['literalTemplateMismatches'] - totals['normalizedTemplateMismatches']} seulement par la ponctuation ou la casse. Une adaptation d'accord ou de particule peut être correcte : ne jamais remplacer la phrase complète par un collage.", "",
             "Le cas non limité à la ponctuation est `L3-fr-ko-11`, variante index 1 : le gabarit donnerait **어디에서 살아요?**, alors que la phrase entière livrée est **어디에 살아요?**. L'interface conserve correctement cette phrase entière. La série doit être expliquée comme une variation de construction, sans appliquer le gabarit à toutes les réponses.", "",
             "### Charge d'entrée et montée en difficulté", "",
             "Chaque L1 contient déjà onze unités de quatre variantes, puis trois dialogues : le stock peut rester, mais ne doit pas imposer quarante-quatre formes et toutes les relances dans une première séance. Choisir un objectif concret, peu de variantes proches et une courte scène préparée ; les autres cartes restent des ressources et des séances suivantes.", "",
             "Dans `L1-fr-zh-01`, la variante index 3 **我是来度假的。** ajoute 来…的 aux identités nominales. Dans `L1-fr-ko-01`, la variante index 2 **저는 파리에서 왔어요.** ajoute provenance et passé. Les garder comme phrases entières et les préparer avant un rappel ; ne pas présenter ces changements comme le seul remplacement d'un nom. Les séries anglaise, espagnole, italienne, japonaise et française comportent aussi des groupes d'origine ou de situation : l'appui utile est un groupe complet dans sa phrase, pas un mot isolé.", "",
             "La progression thématique générale vers récit, conditions et argumentation est plausible. Le problème vérifiable est le raccord : les fichiers déclarent des niveaux précédents et des `reuses`, sans définir quelle phrase entière, quelle relance et quelle réponse ont été exposées avant chaque combinaison. Les exemples L1–L10 ci-dessous servent à préparer cette annotation, sans attribuer une difficulté chiffrée.", "",
             "## Raccord avec le Guidé et les rubriques", "",
             "`app.html:2934–2958` résout chaque famille guidée vers une carte entière du catalogue et conserve son `pathLv`. `setMode` (`:3431–3470`) filtre catalogue, niveaux, rubriques, thèmes et révisions séparément. Les liens proposés n'ajoutent ni nouveau verrou ni renumérotation.", "",
             "Le bloc Guidé contient actuellement 26 familles et 151 références pour chacune des langues fr/en/es/zh/it/ja. Il n'a pas de configuration coréenne. Les unités de conversation fr→ko existent pourtant aux dix niveaux : le raccord coréen doit être rédigé et relu, pas traduit mécaniquement depuis un autre gabarit.", "",
             "## Comment lire les indices", "",
             "« Apprenant exact » et « Reçu exact » comptent les tours qui égalent une variante entière du même niveau ou d'un niveau antérieur, après normalisation de casse et ponctuation. Une combinaison correcte peut échouer à ce test. À l'inverse, une égalité ne prouve ni exposition ni mémorisation. Les candidats de structure dans le JSON sont de simples pistes de relecture, pas des prérequis validés.", "",
             "La longueur sert à retrouver des exemples à relire, jamais à comparer la difficulté du chinois et de l'espagnol, ni à attribuer un niveau CECRL.", "",
             "## Résultats par couple et niveau", ""]
    for pair in report["pairs"]:
        pair_id = pair["pair"]
        files = [record for record in report["files"] if record["pair"] == pair_id]
        state = "actif dans le chargeur" if pair["activeInLoader"] else "stocké, non activé dans le chargeur"
        lines.extend([f"### {pair_id} — {state}", "",
                      "| Niveau | Unités | Variantes | Tours | Familles de phrases entières | Apprenant exact | Reçu exact | Plus longue variante : référence et texte |",
                      "| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |"])
        for record in files:
            counts, ex = record["counts"], record["longestVariant"]
            lines.append(f"| L{record['level']} | {counts['units']} | {counts['variants']} | {counts['turns']} | {counts['wholePhraseFamilies']} | {counts['learnerExactVariantAtOrBefore']}/{counts['learnerTurns']} | {counts['receivedExactVariantAtOrBefore']}/{counts['receivedTurns']} | {ex['unitId']} v{ex['variantIndex']} — {cell(ex['study'])} |")
        l1 = files[0]
        candidate = next((turn for dialogue in l1["dialogues"] for turn in dialogue["turns"]
                          if turn["practiceRole"] == "received" and not turn["exactVariantAtOrBefore"]), None)
        if candidate:
            dialogue = next(d for d in l1["dialogues"] if candidate in d["turns"])
            lines.extend(["", f"Exemple reçu L1 sans égalité de phrase entière : `{dialogue['dialogueId']}`, tour index {candidate['turnIndex']} : « {candidate['study']} » ({candidate['native']}). À annoter ; ce seul test ne démontre pas un manque de compréhension."])
        ex = files[-1]["longestTurn"]
        lines.extend(["", f"Exemple L10 à préparer par réemploi et combinaison : `{ex['dialogueId']}`, tour index {ex['turnIndex']} : « {ex['study']} » ({ex['native']}).", ""])
    lines.extend(["## Contrat proposé pour l'outil d'annotation", "",
                  "Une annexe par couple, indépendante des 110 fichiers et du chargeur, avec état `proposition-à-relire`, commit/fichier/identifiant/index et texte exact attendu pour chaque référence. Ne pas réutiliser la phonétique francophone pour un lecteur anglophone ou sinophone.", "",
                  "- **Unité** : objectif concret, type (`substitution productive`, `famille de phrases entières`, `combinaison`), phrase de départ complète, variantes complètes retenues, appui éventuel existant, nouveautés à introduire et éléments réemployés.",
                  "- **Étapes** : comprendre → imiter → préparer le remplacement → remplacer → recevoir la question → recevoir la clôture → scène entière → essai volontaire sans modèle. La séquence peut être adaptée à la situation ; huit étapes ne prouvent pas l'efficacité.",
                  "- **Réception** : rôle, tour exact, `analyse:false` si compréhension globale, `replyRequired`, références exactes `answerWith` ou tableau vide explicite pour une clôture sans production. Ne pas confondre vide et non renseigné.",
                  "- **Réemploi** : liens vers phrases exactes du couple, Guidé (`familyId`, référence de carte, `pathLv` inchangé), catalogue et rubriques. Un groupe remplaçable ne remplace pas la phrase entière et peut porter sa particule ou son accord.",
                  "- **Validation** : références résolues, langue/lecteur cohérents, phrases et aides entières, ordre d'exposition déclaré avant rappel, réponse adaptée à la question, distinction proposition/original, relecture pédagogique et native séparées. Aucune note de réussite, aucun verrou ou changement de prix/droits.", "",
                  "## Utilisation et limites", "",
                  "`python3 tools/pedagogy/audit_conversation_progression.py --check` recalcule les deux rapports sans écrire. `--write` met à jour uniquement les rapports dans `docs/progression-complete/`. La comparaison protège les fichiers sources par une empreinte ; le commit indique l'origine de l'audit.", "",
                  "Les détails de chaque unité et tour, les aides exactes des exemples et les candidats de réemploi figurent dans `audit-conversation.json`. Ce rapport ne remplace pas la relecture native ni des essais avec de vrais débutants. Le partage ordinateur/site mobile/application doit être vérifié lors d'une future intégration : aucun appareil ni site en ligne n'a été testé dans cet audit.", ""])
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[2])
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--write", action="store_true")
    group.add_argument("--check", action="store_true")
    parser.add_argument("--source-commit", help="Commit d'origine explicite, sinon HEAD (--write) ou celui du rapport (--check).")
    args = parser.parse_args()
    root = args.root.resolve()
    output = root / REPORT_DIR
    json_path, md_path = output / "audit-conversation.json", output / "audit-conversation.md"
    previous = json.loads(json_path.read_text()) if args.check and json_path.exists() else None
    commit = args.source_commit or (previous.get("sourceCommit") if previous else None)
    if not commit:
        commit = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=root, text=True).strip()
    report = build_report(root, commit)
    if report["scope"]["missingLevelFiles"] or report["scope"]["enabledPairsWithoutFiles"]:
        raise ValueError("Couples/niveaux manquants : " + json.dumps(report["scope"], ensure_ascii=False))
    encoded = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    markdown = render_markdown(report)
    if args.check:
        if not json_path.exists() or not md_path.exists():
            print("Rapports absents ; utiliser --write pour préparer un résultat relisible.", file=sys.stderr)
            return 1
        if json_path.read_text() != encoded or md_path.read_text() != markdown:
            print("Écart de sources ou de rapport ; relire avant de régénérer avec --write.", file=sys.stderr)
            return 1
    else:
        output.mkdir(parents=True, exist_ok=True)
        json_path.write_text(encoded)
        md_path.write_text(markdown)
    print(json.dumps({"mode": "check" if args.check else "write", **report["scope"], "totals": report["totals"]}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (ValueError, OSError, KeyError, IndexError, json.JSONDecodeError) as error:
        print(f"Audit impossible : {error}", file=sys.stderr)
        raise SystemExit(1)

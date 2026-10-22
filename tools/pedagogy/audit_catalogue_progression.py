#!/usr/bin/env python3
"""Audit every DECKS entry and the 7 × 10 guided-level cases without editing them.

Default: write the two documentary reports. --check compares them without writing.
Counts describe editorial data, never learner understanding or language coverage.
"""

import argparse
from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path
import subprocess
import sys

sys.dont_write_bytecode = True
from refresh_family_metadata import extract_object


ROOT = Path(__file__).resolve().parents[2]
LANGUAGES = ("fr", "en", "es", "zh", "it", "ja", "ko")
NAMES = dict(zip(LANGUAGES, ("Français", "Anglais", "Espagnol", "Chinois", "Italien", "Japonais", "Coréen")))
NATIVE_FIELDS = {"fr": "frm", "en": "en", "es": "esm", "it": "itm", "ja": "jam"}
ELLIPSES = ("...", "…", "〜", "___", "{s}")


def encoded(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False)


def digest(value):
    return hashlib.sha256(encoded(value).encode("utf-8")).hexdigest()


def pronunciation(card):
    # Include all existing pronunciation spellings, including partial legacy fields.
    # Presence here neither makes a field complete nor authorizes a fallback to it.
    return {k: value for k, value in card.items()
            if k in ("py", "pf", "ps", "pi", "reading") or k.startswith("ph")}


def sorted_counts(values):
    return dict(sorted(Counter(values).items()))


def source_record(language, index, card):
    return {"locator": f"DECKS.{language}[{index}]", "sourceIndex": index,
            "study": card["t"], "historicalLevel": card.get("lv"),
            "category": card.get("cat"), "inheritedStatus": card.get("pedagogicalStatus"),
            "nativeRaw": {key: card[key] for key in ("frm", "cn", "en", "esm", "itm", "jam", "kom") if key in card},
            "pronunciationRaw": pronunciation(card), "cardSha256": digest(card)}


def source_commit(app):
    result = subprocess.run(["git", "log", "-1", "--format=%H", "--", str(app.relative_to(ROOT))],
                            cwd=ROOT, capture_output=True, text=True, check=True)
    return result.stdout.strip() or None


def make_audit(app):
    source = app.read_text(encoding="utf-8")
    decks, _, _ = extract_object(source, "DECKS")
    pedigree, _, _ = extract_object(source, "PEDAGOGY_FAMILIES")
    config = pedigree["languages"]
    languages = []
    cases = []
    reference_errors = []
    all_pronunciation = []
    validated_entries = 0

    for language in LANGUAGES:
        deck = decks[language]
        by_text = defaultdict(list)
        for index, card in enumerate(deck):
            validated_entries += 1
            if not isinstance(card.get("t"), str) or not card["t"].strip():
                raise ValueError(f"DECKS.{language}[{index}]: empty or non-string study")
            if type(card.get("lv")) is not int or not 1 <= card["lv"] <= 10:
                raise ValueError(f"DECKS.{language}[{index}]: invalid historical level")
            by_text[card["t"]].append((index, card))
            all_pronunciation.append({"language": language, "index": index,
                                      "study": card["t"], "fields": pronunciation(card)})

        families = config.get(language, {}).get("families", [])
        family_ids = [family["id"] for family in families]
        if len(family_ids) != len(set(family_ids)):
            raise ValueError(f"{language}: duplicate family id")
        if any(type(family.get("pathLv")) is not int or not 1 <= family["pathLv"] <= 10 for family in families):
            raise ValueError(f"{language}: invalid guided level")
        refs = [(family, ref) for family in families for ref in family["cards"]]
        selected_indices = set()
        selected_texts = set()
        matrix = [[0 for _ in range(10)] for _ in range(10)]
        ambiguous = []
        placeholders = []
        inherited_statuses = []

        for level in range(1, 11):
            level_families = []
            level_sources = set()
            level_texts = set()
            level_legacy = []
            level_statuses = []
            level_placeholder = []
            for family in families:
                if family["pathLv"] != level:
                    continue
                actual = len(family["cards"])
                family_issues = []
                if [r.get("step") for r in family["cards"]] != list(range(1, actual + 1)):
                    family_issues.append("steps-not-contiguous")
                if family.get("selectedVariants") != actual:
                    family_issues.append("selectedVariants-mismatch")
                if family.get("requestedVariants") != actual:
                    # A quota difference is a documentary signal, not an obligation to add phrases.
                    family_issues.append("requestedVariants-differs-from-actual")
                records = []
                for ref in family["cards"]:
                    target = ref["target"]
                    matches = by_text.get(target, [])
                    record = {"step": ref.get("step"), "expectedStudy": target,
                              "editorialSourceIndex": ref.get("sourceIndex"),
                              "editorialCurrentLevel": ref.get("currentLevel")}
                    if not matches:
                        record["issues"] = ["target-not-found"]
                        reference_errors.append({"language": language, "familyId": family["id"], **record})
                        records.append(record)
                        continue
                    index, card = matches[0]
                    record["source"] = source_record(language, index, card)
                    record["issues"] = []
                    if type(ref.get("sourceIndex")) is not int or ref["sourceIndex"] != index:
                        record["issues"].append("sourceIndex-not-first-runtime-match")
                    if type(ref.get("currentLevel")) is not int or ref["currentLevel"] != card["lv"]:
                        record["issues"].append("currentLevel-mismatch")
                    if record["issues"]:
                        reference_errors.append({"language": language, "familyId": family["id"], **record})
                    record["allMatchingSourceIndices"] = [i for i, _ in matches]
                    resolution = {}
                    for native in LANGUAGES:
                        if native == language:
                            continue
                        field = NATIVE_FIELDS.get(native)
                        eligible = [(i, c) for i, c in matches if not field or c.get(field)]
                        resolution[native] = eligible[0][0] if eligible else None
                    record["runtimeSourceIndexByNative"] = resolution
                    record["legacyDelta"] = card["lv"] - level
                    record["placeholderCandidates"] = [mark for mark in ELLIPSES if mark in target]
                    if len(matches) > 1:
                        ambiguous.append({"familyId": family["id"], "step": ref["step"],
                                          "study": target, "indices": [i for i, _ in matches]})
                    if record["placeholderCandidates"]:
                        candidate = {"familyId": family["id"], "step": ref["step"],
                                     "source": record["source"], "markers": record["placeholderCandidates"]}
                        placeholders.append(candidate)
                        level_placeholder.append(candidate)
                    status = card.get("pedagogicalStatus", "unmarked")
                    inherited_statuses.append(status)
                    level_statuses.append(status)
                    selected_indices.add(index)
                    selected_texts.add(target)
                    level_sources.add(index)
                    level_texts.add(target)
                    level_legacy.append(card["lv"])
                    matrix[level - 1][card["lv"] - 1] += 1
                    records.append(record)
                level_families.append({"id": family["id"], "frame": family["frame"],
                                       "requestedVariants": family.get("requestedVariants"),
                                       "selectedVariants": family.get("selectedVariants"),
                                       "issues": family_issues, "references": records})
            legacy_cards = [card for card in deck if card["lv"] == level]
            cases.append({"language": language, "guidedLevel": level,
                          "historicalCatalogueAtSameNumber": len(legacy_cards),
                          "historicalCoreAtSameNumber": sum(c.get("cat") == "core" for c in legacy_cards),
                          "historicalCategoryCounts": sorted_counts(c.get("cat", "unmarked") for c in legacy_cards),
                          "familyCount": len(level_families),
                          "guidedReferences": sum(len(f["references"]) for f in level_families),
                          "guidedUniqueTexts": len(level_texts), "guidedUniqueSourceIndices": len(level_sources),
                          "legacyLevelRange": [min(level_legacy), max(level_legacy)] if level_legacy else None,
                          "legacyLevelDistribution": sorted_counts(level_legacy),
                          "legacyAtLeastTwoLevelsAbove": sum(n >= level + 2 for n in level_legacy),
                          "legacyBelowGuidedNumber": sum(n < level for n in level_legacy),
                          "inheritedStatusCounts": sorted_counts(level_statuses),
                          "placeholderReferenceCount": len(level_placeholder),
                          "missingGuidedLanguageConfiguration": language not in config,
                          "families": level_families})

        duplicates = [{"study": text, "occurrences": [source_record(language, i, c) for i, c in matches],
                       "historicalLevels": sorted({c["lv"] for _, c in matches})}
                      for text, matches in by_text.items() if len(matches) > 1]
        languages.append({"language": language, "name": NAMES[language], "catalogueEntries": len(deck),
                          "coreEntries": sum(c.get("cat") == "core" for c in deck),
                          "categoryCounts": sorted_counts(c.get("cat", "unmarked") for c in deck),
                          "inheritedStatusCounts": sorted_counts(c.get("pedagogicalStatus", "unmarked") for c in deck),
                          "familyCount": len(families), "guidedReferences": len(refs),
                          "guidedUniqueTexts": len(selected_texts), "guidedUniqueSourceIndices": len(selected_indices),
                          "catalogueRepresentation": {"selectedSourceIndices": len(selected_indices), "catalogueEntries": len(deck)},
                          "repeatedGuidedReferences": len(refs) - len(selected_indices),
                          "duplicateCatalogueSurplus": sum(len(v) - 1 for v in by_text.values()),
                          "duplicateCatalogueGroups": duplicates,
                          "guidedAmbiguousTextReferences": ambiguous,
                          "guidedInheritedStatusCounts": sorted_counts(inherited_statuses),
                          "guidedPlaceholderCandidates": placeholders,
                          "historicalCrossTab": {"rows": "guidedLevel1to10", "columns": "historicalLevel1to10", "counts": matrix}})

    return {"auditVersion": 1, "scope": "catalogue-and-guided-metadata-read-only",
            "source": {"file": "melunga_deploy/app.html", "lastCommitTouchingFile": source_commit(app),
                       "fileSha256": hashlib.sha256(app.read_bytes()).hexdigest(),
                       "decksSha256": digest(decks), "pronunciationInventorySha256": digest(all_pronunciation)},
            "interpretation": {"historicalLevelIsMastery": False, "lengthIsDifficulty": False,
                               "inheritedFragmentTagIsLinguisticVerdict": False,
                               "catalogueRepresentationIsLanguageCoverage": False,
                               "presenceIsExposureOrUnderstanding": False,
                               "pronunciationPolicy": "Exact source values, no normalization, correction or phonetic concatenation.",
                               "runtimeResolution": "guidedPool first matching text after guidedActiveDeck native-field filter; zh/ko have no filter in that helper."},
            "totals": {"validatedCatalogueEntries": validated_entries, "guidedLevelCases": len(cases),
                       "families": sum(x["familyCount"] for x in languages),
                       "guidedReferences": sum(x["guidedReferences"] for x in languages),
                       "referenceErrors": len(reference_errors)},
            "unexpectedCatalogueLanguages": sorted(set(decks) - set(LANGUAGES)),
            "unexpectedGuidedLanguages": sorted(set(config) - set(LANGUAGES)),
            "languages": languages, "cases": cases, "referenceErrors": reference_errors}


def inline(value):
    return str(value).replace("|", "\\|").replace("\n", " ").replace("`", "'")


def markdown(report):
    t = report["totals"]
    lines = ["# Audit complet du catalogue et des familles guidées", "",
             "Rapport généré, documentaire uniquement. Aucun texte, niveau, aide phonétique ou accès n’est modifié.", "",
             f"Source : `melunga_deploy/app.html`, dernier commit touchant le fichier `{report['source']['lastCommitTouchingFile']}`.",
             f"SHA-256 du fichier : `{report['source']['fileSha256']}`.", "",
             f"Contrôle de **{str(t['validatedCatalogueEntries'] // 1000) + ' ' + str(t['validatedCatalogueEntries'] % 1000).zfill(3)} entrées**, **70 cases langue × niveau**, "
             f"**{t['families']} familles** et **{t['guidedReferences']} références guidées**. "
             f"Références introuvables ou métadonnées inexactes : **{t['referenceErrors']}**.", "",
             "## Limites et sens des mesures", "",
             "- `lv` est le classement historique du catalogue ; `pathLv` est le classement du parcours guidé. Leur écart déclenche une relecture, sans établir automatiquement la difficulté.",
             "- Les compteurs ne prouvent ni exposition, ni compréhension, ni maîtrise. La longueur n’est pas un classement de difficulté.",
             "- Le statut hérité `fragment` peut aussi marquer des phrases complètes. Il reste distinct des candidats contenant des points de suspension ou un emplacement à remplir.",
             "- Une reprise entre familles peut être un réemploi utile. Un même texte au catalogue peut avoir plusieurs usages contextuels. Les ambiguïtés ne sont pas supprimées automatiquement.",
             "- Les aides de prononciation sont copiées dans le JSON avec leurs clés et valeurs exactes, y compris les champs partiels. Ce contrôle ne certifie pas leur justesse linguistique et ne les harmonise pas.",
             "- Le rapport examine les données locales et leur résolution, pas le site publié ni la réussite d’un apprenant. Le contenu conversation fait l’objet d’une revue distincte.", "",
             "## Synthèse par langue", "",
             "| Langue | Catalogue | Core | Familles | Références guidées | Sources guidées uniques | Doublons catalogue supplémentaires | Références avec texte ambigu | Candidats avec emplacement |",
             "|---|---:|---:|---:|---:|---:|---:|---:|---:|"]
    for language in report["languages"]:
        x = language
        lines.append(f"| {x['name']} | {x['catalogueEntries']} | {x['coreEntries']} | {x['familyCount']} | {x['guidedReferences']} | {x['guidedUniqueSourceIndices']} | {x['duplicateCatalogueSurplus']} | {len(x['guidedAmbiguousTextReferences'])} | {len(x['guidedPlaceholderCandidates'])} |")
    lines.extend(["", "La part de catalogue représentée est le rapport des sources uniques sélectionnées au nombre d’entrées. Elle ne décrit pas un pourcentage de la langue couvert. Le coréen possède un catalogue mais aucune configuration `PEDAGOGY_FAMILIES.languages.ko` ; le parcours guidé retourne actuellement une liste vide pour cette langue.", "",
                  "## Les 70 cases langue × niveau", "",
                  "Les colonnes catalogue/core sont comptées au **numéro historique** ; les colonnes guidées au **numéro du parcours**. Elles ne constituent pas des ensembles équivalents.", "",
                  "| Langue | N° | Catalogue historique | Core historique | Familles guidées | Références | Sources uniques | Étendue historique des sources guidées | Références historiques ≥ n+2 | Emplacements |",
                  "|---|---:|---:|---:|---:|---:|---:|---|---:|---:|"])
    for c in report["cases"]:
        extent = c["legacyLevelRange"]
        extent = f"{extent[0]}–{extent[1]}" if extent else "—"
        lines.append(f"| {NAMES[c['language']]} | {c['guidedLevel']} | {c['historicalCatalogueAtSameNumber']} | {c['historicalCoreAtSameNumber']} | {c['familyCount']} | {c['guidedReferences']} | {c['guidedUniqueSourceIndices']} | {extent} | {c['legacyAtLeastTwoLevelsAbove']} | {c['placeholderReferenceCount']} |")
    lines.extend(["", "## Exemples à relire, avec provenance exacte", "",
                  "Les choix ci-dessous sont des pistes de relecture. Toutes les références et tous les doublons, avec traductions et aides brutes, figurent dans `audit-catalogue.json`.", ""])
    for language in report["languages"]:
        lang = language["language"]
        refs = [(c, f, r) for c in report["cases"] if c["language"] == lang for f in c["families"] for r in f["references"] if "source" in r]
        lines.extend([f"### {language['name']}", ""])
        if not refs:
            lines.extend(["Configuration guidée absente à chacun des dix niveaux. Enrichir à partir des phrases existantes, après préparation des répliques reçues ; ne pas imposer un quota de 26 familles.", ""])
            continue
        largest = sorted(refs, key=lambda x: (-x[2]["legacyDelta"], x[0]["guidedLevel"], x[1]["id"], x[2]["step"]))[:2]
        candidates = largest + [x for x in refs if x[2]["placeholderCandidates"]][:2]
        shown = set()
        for c, f, r in candidates:
            key = (f["id"], r["step"])
            if key in shown:
                continue
            shown.add(key)
            src = r["source"]
            lines.append(f"- `{src['locator']}` — **{inline(src['study'])}** ; `{f['id']}`, étape {r['step']}, parcours L{c['guidedLevel']}, classement historique L{src['historicalLevel']}. Aides exactes : `{inline(encoded(src['pronunciationRaw']))}`.")
        ambiguous = language["guidedAmbiguousTextReferences"]
        if ambiguous:
            a = ambiguous[0]
            lines.append(f"- Texte guidé à occurrences multiples : **{inline(a['study'])}**, indices {a['indices']}. La résolution actuelle retient la première occurrence admissible ; une autre occurrence n’est pas une nouvelle variante acquise.")
        lines.append("")
    lines.extend(["## Enrichir sans réécrire la réserve", "",
                  "1. Décrire la capacité quotidienne visée, les briques déjà préparées et une seule transformation principale.",
                  "2. Sélectionner des phrases entières existantes avec index, texte attendu, empreinte de carte et aides exactes ; aucune génération de nouvelle phonétique par collage.",
                  "3. Préparer la question ou la réponse de l’autre rôle et distinguer réception et production. Une référence dans le catalogue n’atteste pas son apprentissage.",
                  "4. Organiser substitution, combinaison quand elle est préparée, échange, puis réemploi dans une autre situation. Distinguer quotidien et spécialisation de métier.",
                  "5. Relire le naturel, la difficulté et les transitions sur ordinateur, site mobile et application, avant validation par Kartech. Aucun changement publié ne découle de cet audit.", "",
                  "## Reproduction", "", "```sh", "python3 tools/pedagogy/audit_catalogue_progression.py", "python3 tools/pedagogy/audit_catalogue_progression.py --check", "```", "",
                  "La première commande écrit uniquement les deux rapports documentaires ; `--check` compare leur contenu et ne les modifie pas. Les empreintes `decksSha256` et `pronunciationInventorySha256` servent de repères d’intégrité. Une divergence doit être expliquée ; elle ne déclenche aucune correction automatique.", ""])
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    try:
        app = ROOT / "melunga_deploy/app.html"
        report = make_audit(app)
        folder = ROOT / "docs/progression-complete"
        outputs = {folder / "audit-catalogue.json": json.dumps(report, ensure_ascii=False, indent=2, allow_nan=False) + "\n",
                   folder / "audit-catalogue.md": markdown(report)}
        stale = []
        for path, expected in outputs.items():
            if args.check:
                if not path.exists() or path.read_text(encoding="utf-8") != expected:
                    stale.append(str(path.relative_to(ROOT)))
            else:
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(expected, encoding="utf-8")
        print(json.dumps({"mode": "check" if args.check else "write", **report["totals"], "staleOutputs": stale}, ensure_ascii=False))
        return 1 if stale or report["referenceErrors"] else 0
    except (OSError, KeyError, TypeError, ValueError, subprocess.CalledProcessError) as error:
        print(str(error), file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())

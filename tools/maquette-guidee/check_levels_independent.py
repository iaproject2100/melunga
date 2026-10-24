#!/usr/bin/env python3
"""Independently check the level preview against source data, without its builders.

No generation module is imported. The default run reads only; --write-report
writes the two review reports owned by this checker. It never repairs data.
"""
from __future__ import annotations

import argparse
import copy
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import struct
import subprocess
import sys

from check_situations_independent import (
    read_inputs as read_situation_inputs,
    validate_sources as validate_situation_sources,
    resolve_sources as resolve_situation_sources,
)


ROOT = Path(__file__).resolve().parents[2]
PAIR_LANGUAGES = {
    "fr-en": ("fr", "en"), "fr-es": ("fr", "es"), "fr-it": ("fr", "it"),
    "fr-zh": ("fr", "zh"), "fr-ja": ("fr", "ja"), "fr-ko": ("fr", "ko"),
    "zh-fr": ("zh", "fr"),
}
DATA_ROOT = "melunga_deploy/content/niveaux-progressifs"
REVIEW_ROOT = "docs/niveaux-progressifs"
PROTECTED_FILES = [
    "melunga_deploy/app.html", "melunga_deploy/index.html", "melunga_deploy/store-billing.js",
    "melunga_deploy/netlify/functions/get-pricing.mjs",
    "melunga_deploy/netlify/functions/create-payment-link.mjs",
    "melunga_deploy/netlify/functions/airwallex-webhook.mjs",
    "melunga_deploy/netlify/functions/check-status.mjs",
    "melunga_deploy/netlify/functions/login.mjs", "melunga_deploy/netlify/functions/logout.mjs",
    "melunga_deploy/netlify/functions/request-device-replacement.mjs",
    "melunga_deploy/netlify/functions/confirm-device-replacement.mjs",
    "melunga_deploy/netlify/functions/admin-shared-access.mjs",
    "melunga_deploy/netlify/functions/device-access.mjs",
    "melunga_deploy/netlify/functions/complimentary-access.mjs",
    "melunga_deploy/netlify/functions/access-store.mjs",
]


class VerificationError(Exception):
    pass


def require(condition, explanation):
    if not condition:
        raise VerificationError(explanation)


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def digest(value):
    return hashlib.sha256(value).hexdigest()


def concept_key(phrase):
    concept = phrase.get("lexicalConceptId")
    if concept:
        # Owner-approved editorial alias only; source IDs and strings remain
        # exact. Do not normalize other accents (e.g. sur versus sûr).
        return "leger" if concept in {"leger", "léger", "le\u0301ger"} else concept
    return digest(canonical((phrase["study"], phrase["native"])))


def source_decks(raw):
    lines = raw.decode().splitlines()
    definitions = [line for line in lines if line.startswith("var DECKS = ")]
    require(len(definitions) == 1, "Expected one DECKS definition in source app")
    return json.loads(definitions[0].partition("=")[2].strip().removesuffix(";"))


def field_map(study):
    result = {"study": "t", "native": "cn" if study == "fr" else "frm",
              "phon": "phon" if study == "fr" else "phf" if study == "zh" else "pf"}
    if study in {"zh", "ja", "ko"}:
        result["reading"] = "py"
    return result


def read_pack(root):
    fingerprints = {}

    def raw(relative):
        path = root / relative
        require(path.is_file(), "Missing input: " + relative)
        value = path.read_bytes()
        fingerprints[relative] = digest(value)
        return value

    def js(relative):
        return json.loads(raw(relative))

    app = raw("melunga_deploy/app.html")
    pack = {
        "root": root, "app": app, "decks": source_decks(app),
        "manifest": js(DATA_ROOT + "/manifest.json"),
        "decisions": js(REVIEW_ROOT + "/decisions.json"),
        "enrichments": js(REVIEW_ROOT + "/enrichissements.json"),
        "plan": js(REVIEW_ROOT + "/plan-themes.json"),
        "vocabularyPolicy": js(REVIEW_ROOT + "/politique-vocabulaire-phrases.json"),
        "cells": {}, "snapshots": {}, "reviews": [], "semanticPartitions": {}, "fingerprints": fingerprints,
        "repertoires": {}, "introductions": {},
    }
    for filename in ("introductions-lexicales.json", "introductions-nombres.json",
                     "introductions-phrases-L1.json", "introductions-lexicales-complement.json",
                     "introductions-relations-zh.json", "introductions-relations-zh-progression.json"):
        relative = REVIEW_ROOT + "/corrections-themes/" + filename
        if (root / relative).is_file():
            pack["introductions"][relative] = js(relative)
    pack["authored"] = js(REVIEW_ROOT + "/corrections-themes/enrichissements-rediges.json")
    pack["densityPolicy"] = js(REVIEW_ROOT + "/corrections-themes/politique-densite.json")
    for pair in PAIR_LANGUAGES:
        pack["semanticPartitions"][pair] = js(REVIEW_ROOT + "/types-contenu/" + pair + ".json")
    for review in pack["decisions"]["reviewSources"]:
        content = raw(review["path"])
        require(digest(content) == review["sha256"], "Review fingerprint differs: " + review["path"])
        pack["reviews"].append(json.loads(content))
    pack["adjudications"] = js(pack["decisions"]["adjudicationsSource"])
    for pair in PAIR_LANGUAGES:
        for level in range(1, 11):
            relative = f"{DATA_ROOT}/{pair}/L{level}.json"
            pack["cells"][(pair, level)] = js(relative)
        repertoire = DATA_ROOT + "/repertoires/" + pair + ".json"
        if (root / repertoire).is_file():
            pack["repertoires"][pair] = js(repertoire)
    expected = {root / DATA_ROOT / "manifest.json"} | {
        root / DATA_ROOT / pair / f"L{level}.json" for pair in PAIR_LANGUAGES for level in range(1, 11)
    } | {root / DATA_ROOT / "repertoires" / (pair + ".json") for pair in PAIR_LANGUAGES}
    actual = set((root / DATA_ROOT).rglob("*.json"))
    require(actual == expected, "Runtime directory must contain exactly manifest, 70 cells and 7 transport repertoires")
    for snapshot in pack["enrichments"]["sourceSnapshots"]:
        relative = snapshot["sourceFile"]
        require(relative.startswith(REVIEW_ROOT + "/sources/conversation/")
                and ".." not in Path(relative).parts, "Snapshot outside allowed source folder")
        data = raw(relative)
        require(digest(data) == snapshot["sourceFileSha256"], "Snapshot hash mismatch: " + relative)
        original = subprocess.run(
            ["git", "show", snapshot["sourceCommit"] + ":" + snapshot["sourceRepositoryPath"]],
            cwd=root, capture_output=True, check=True,
        ).stdout
        require(data == original, "Snapshot differs from referenced Git source: " + relative)
        pack["snapshots"][relative] = json.loads(data)
    registry_path = REVIEW_ROOT + "/visuels.json"
    pack["visualRegistry"] = js(registry_path) if (root / registry_path).is_file() else None
    pack["languages"] = PAIR_LANGUAGES
    raw("tools/maquette-guidee/check_situations_independent.py")
    pack["situations"] = read_situation_inputs(root, raw, js, require, canonical, digest, PAIR_LANGUAGES)
    return pack


def check_pack(pack):
    decks, manifest, decisions, enrichment, plan = (
        pack[k] for k in ("decks", "manifest", "decisions", "enrichments", "plan")
    )
    require(set(decks) == {study for native, study in PAIR_LANGUAGES.values()}, "Unexpected source deck set")
    require(sum(map(len, decks.values())) == 32115, "Classic source catalogue count changed")
    validate_situation_sources(pack, require, canonical, digest)
    require(manifest.get("publicationApproved") is False, "Manifest must remain unapproved for production")
    require(manifest.get("doesNotMeasureAcquisition") is True, "Manifest overclaims learner acquisition")
    minimum_concepts = pack["densityPolicy"]["displayRule"]["minimumPresentedItems"]
    require(type(minimum_concepts) is int and minimum_concepts >= 6, "Visible-density policy was silently weakened")
    require(len(manifest["pairs"]) == 7 and {p["id"] for p in manifest["pairs"]} == set(PAIR_LANGUAGES), "Pair manifest mismatch")
    require({level["level"] for level in manifest["levels"]} == set(range(1, 11)), "Missing common level")
    require(len(plan["levels"]) == 10, "Expected ten editorial level plans")
    plan_map, visual_cells = {}, {}
    for level in plan["levels"]:
        require(len(level["themes"]) == 11, "Expected eleven proposed theme definitions per level")
        for theme in level["themes"]:
            key = (level["level"], theme["id"])
            require(key not in plan_map, "Duplicate theme definition")
            plan_map[key] = theme
            require(theme["visualId"] not in visual_cells, "Two distinct themes reuse a visual ID")
            visual_cells[theme["visualId"]] = key
    require(len(visual_cells) == 110, "Expected 110 distinct level/theme visuals")
    for number in range(1, 11):
        for template in pack["vocabularyPolicy"]["themeDefinitions"]:
            theme = {**template, "id": template["idPattern"].format(level=number),
                     "visualId": template["visualIdPattern"].format(level=number),
                     "optional": False, "isTemplateCollection": False}
            key = (number, theme["id"])
            require(key not in plan_map and theme["visualId"] not in visual_cells, "Lexical theme or visual ID duplicates a situation")
            plan_map[key] = theme
            visual_cells[theme["visualId"]] = key
    for theme in pack["situations"]["plan"]["themes"] if pack["situations"] else []:
        key = (theme["level"], theme["themeId"])
        require(key not in plan_map and theme["visualId"] not in visual_cells, "A new situation duplicates an old theme or photo")
        plan_map[key] = {**theme, "id": theme["themeId"], "optional": False, "isTemplateCollection": False}
        visual_cells[theme["visualId"]] = key
    require(len(visual_cells) == 250 + (10 if pack["situations"] else 0), "Independent visual definition coverage differs")
    semantic_map, semantic_counts = {}, Counter()
    exceptions = {
        ("fr-en", 3463), ("fr-ja", 2985), ("fr-ko", 2138),
        *(("zh-fr", index) for index in (2902, 3046, 3140, 3193, 3201, 3245, 3292, 3321)),
    }
    exceptions_seen = set()
    for pair, document in pack["semanticPartitions"].items():
        study = PAIR_LANGUAGES[pair][1]
        require(document["version"] == 1 and document["pair"] == pair and document["studyLanguage"] == study,
                "Semantic partition identity differs")
        require(document["sourceDeckSha256"] == digest(canonical(decks[study])), "Semantic partition belongs to another deck")
        seen = set()
        for item in document["assignments"]:
            index = item["sourceIndex"]
            require(type(index) is int and 0 <= index < len(decks[study]) and index not in seen, "Semantic index is duplicated or invalid")
            seen.add(index)
            require(item["contentType"] in {"utterance", "vocabulary", "number", "incomplete", "review"}, "Unknown semantic content type")
            require(item["reason"] and item["reviewStatus"] in {"reviewed", "rule-based-candidate"}, "Semantic rationale or status missing")
            require(("lexicalClass" in item) == (item["contentType"] == "vocabulary"), "Lexical class belongs only on vocabulary")
            if item["contentType"] == "vocabulary":
                require(item["lexicalClass"] in {"adjective", "preposition", "adverb", "color", "other", "uncertain"}
                        and item["lexicalClassReason"] and item["lexicalClassReviewStatus"] in {"reviewed", "rule-based-candidate"},
                        "Incomplete lexical-class contract")
            if item.get("sourceTemplateException") is True:
                require((pair, index) in exceptions and item["reviewStatus"] == "reviewed", "Unapproved source-template exception")
                require(not re.search(r"\{[\w-]+\}|_{2,}", decks[study][index]["t"]), "A source-template exception contains an actual open slot")
                exceptions_seen.add((pair, index))
            semantic_map[(pair, index)] = item
            semantic_counts[item["contentType"]] += 1
        require(seen == set(range(len(decks[study]))), "Semantic partition omits a source card")
    require(exceptions_seen == exceptions, "The eleven bounded source-template exceptions differ")
    introduction_map, introduction_counts = {}, {}
    introduction_fields_compared = 0
    for relative, document in pack["introductions"].items():
        introduction_counts[Path(relative).name] = len(document["items"])
        for item in document["items"]:
            pair, index = item["pair"], item["sourceIndex"]
            key = (pair, index)
            require(pair in PAIR_LANGUAGES and key not in introduction_map, "An introduction duplicates a canonical source decision")
            card = decks[PAIR_LANGUAGES[pair][1]][index]
            require(type(item["sourceLevel"]) is int and item["sourceLevel"] == card["lv"]
                    and item["sourceSha256"] == digest(canonical(card)), "Introduction source identity differs")
            require(type(item["proposedLevel"]) is int and 1 <= item["proposedLevel"] <= 10 and item["reason"], "Invalid introduction level/rationale")
            require(item.get("editorialReviewStatus", item.get("reviewStatus")) in {"reviewed", "reviewed-by-Codex"},
                    "A source introduction lacks its explicit editorial review")
            require(item["contentType"] == semantic_map[key]["contentType"], "Introduction changes a semantic source type")
            if item["contentType"] == "number":
                require(item.get("numberKind") in {"cardinal", "ordinal", "fraction", "approximate-quantity", "multiplier", "collective-quantity"}
                        and isinstance(item.get("numberOrder"), list) and len(item["numberOrder"]) == 2,
                        "Whole-number kind/order is undeclared")
            for field, original in field_map(PAIR_LANGUAGES[pair][1]).items():
                if field == "reading" and field not in item:
                    continue
                require(item.get(field) == card.get(original), "An introduction edits or extracts a source field")
                introduction_fields_compared += 1
            introduction_map[key] = {**item, "file": relative}
    numeric_source_keys = {key for key, item in semantic_map.items() if item["contentType"] == "number"}
    numeric_introductions = {key for key, item in introduction_map.items() if item["contentType"] == "number"}
    require(numeric_source_keys == numeric_introductions, "Standalone numbers do not have an exact progression partition")
    authored_map, authored_reused_phonetics = {}, 0
    authored_file = REVIEW_ROOT + "/corrections-themes/enrichissements-rediges.json"
    require(pack["authored"]["publicationApproved"] is False and pack["authored"]["existingSourceFieldsChanged"] == 0,
            "New editorial source overclaims publication or changes historical fields")
    for item in pack["authored"]["items"]:
        identity = "editorial:" + item["id"]
        key = (item["pair"], identity)
        require(item["pair"] in PAIR_LANGUAGES and key not in authored_map, "Repeated/invalid authored source identity")
        require(item["editorialReviewStatus"] == "reviewed" and item["phoneticReviewStatus"] == "pending-Claude",
                "A new whole-entry phonetic was silently declared verified")
        require(item["contentType"] in {"vocabulary", "number"} and item["lexicalFamily"] in {d["domain"] for d in pack["vocabularyPolicy"]["themeDefinitions"]},
                "New editorial entry has an unsupported semantic type/family")
        require(all(isinstance(item.get(field), str) and item[field] for field in ("study", "native", "phon"))
                and not re.search(r"\{[\w-]+\}|_{2,}", item["study"]), "An editorial entry is empty or an open frame")
        study_language = PAIR_LANGUAGES[item["pair"]][1]
        require(not any(card["t"] == item["study"] and card.get(field_map(study_language)["native"]) == item["native"]
                        for card in decks[study_language]), "An authored entry duplicates the exact existing source sense")
        if item.get("wholeHeadwordPhonSource"):
            reference = item["wholeHeadwordPhonSource"]
            original = decks[study_language][reference["sourceIndex"]]
            require(reference["collection"] == "DECKS." + study_language
                    and reference["field"] == field_map(study_language)["phon"]
                    and original["t"] == item["study"] and original[reference["field"]] == item["phon"],
                    "Headword phonetic reuse is an extraction or a changed source")
            authored_reused_phonetics += 1
        authored_map[key] = item

    move_map = {}
    for move in decisions["moves"]:
        key = (move["pair"], move["sourceIndex"])
        require(key not in move_map, "Duplicate editorial move: " + str(key))
        require(move["pair"] in PAIR_LANGUAGES, "Move for an unexpected pair")
        study = PAIR_LANGUAGES[move["pair"]][1]
        card = decks[study][move["sourceIndex"]]
        require(type(move["sourceLevel"]) is int and move["sourceLevel"] == card["lv"], "Decision source level differs")
        require(type(move["proposedLevel"]) is int and 1 <= move["proposedLevel"] <= 10, "Invalid target level")
        move_map[key] = move
    require(len(move_map) == 518, "Expected the 518 explicit decisions under review")
    review_moves = {}
    for review in pack["reviews"]:
        for pair_review in review.get("pairs", [review]):
            for move in pair_review["moves"]:
                key = (pair_review["pair"], move["sourceIndex"])
                require(key not in review_moves, "Duplicate move in source reviews")
                review_moves[key] = move
    require(set(review_moves) == set(move_map), "Aggregate decisions differ from the reviewed card set")
    adjudications = {(item["pair"], item["sourceIndex"]): item for item in pack["adjudications"]["items"]}
    require(pack["decisions"]["adjudications"] == pack["adjudications"]["items"], "Adjudication trail differs from its file")
    rejected_links = []
    for key, original in review_moves.items():
        move = move_map[key]
        for field in ("sourceLevel", "proposedLevel", "copy"):
            require(move.get(field) == original.get(field), "Aggregate decision changes reviewed " + field)
        original_links = original.get("plannedPrerequisiteIndices", [])
        reject = adjudications.get(key, {}).get("rejectPrerequisites", [])
        rejected_indices = {item["sourceIndex"] for item in reject}
        require(rejected_indices <= set(original_links), "Adjudication rejects a nonexistent reviewed link")
        require(move.get("plannedPrerequisiteIndices", []) == [i for i in original_links if i not in rejected_indices],
                "Prerequisite links were added or removed without a matching adjudication")
        if reject:
            require(move.get("originalPlannedPrerequisiteIndices") == original_links and move.get("rejectedPrerequisites") == reject,
                    "Rejected prerequisite lost its original trace")
            for item in reject:
                card = decks[PAIR_LANGUAGES[key[0]][1]][item["sourceIndex"]]
                require(item["reason"] and item["sourceStudy"] == card["t"] and item["sourceNative"] == card[field_map(PAIR_LANGUAGES[key[0]][1])["native"]],
                        "Adjudicated prerequisite does not preserve its source meaning")
                rejected_links.append({"pair": key[0], "sourceIndex": key[1],
                                       "prerequisiteSourceIndex": item["sourceIndex"],
                                       **{field: value for field, value in item.items() if field != "sourceIndex"}})
    require({(r["pair"], r["sourceIndex"], r["sourceStudy"]) for r in rejected_links} == {("fr-zh", 245, "是")},
            "Unexpected prerequisite rejection outside the documented copula ambiguity")
    ancestor_cache = {}

    def declared_ancestors(pair, index, trail=()):
        key = (pair, index)
        require(key not in trail, "The declared prerequisite graph contains a cycle")
        if key not in ancestor_cache:
            direct = move_map.get(key, {}).get("plannedPrerequisiteIndices", [])
            ancestor_cache[key] = set(direct)
            for parent in direct:
                ancestor_cache[key].update(declared_ancestors(pair, parent, (*trail, key)))
        return ancestor_cache[key]

    for pair, index in move_map:
        declared_ancestors(pair, index)

    runtime_imports, held_imports = {}, {}
    for item in enrichment["items"]:
        source_key = (item["pair"], item["sourceFile"], item["unitId"], item["variantIndex"])
        require(source_key not in runtime_imports and source_key not in held_imports, "Duplicate enrichment candidate")
        target = runtime_imports if item.get("runtimeCandidate") is True else held_imports
        target[source_key] = item
    require(len(runtime_imports) == 43 and len(held_imports) == 13, "Enrichment selection must remain 43 active / 13 held")

    primary_lookup, primary_locations, held_identities = {}, {}, set()
    for (pair, number), cell in pack["cells"].items():
        for held, themes in ((False, cell["themes"]), (True, cell.get("heldThemes", []))):
            for theme in themes:
                for phrase in theme["phrases"]:
                    key = (pair, phrase["id"])
                    require(key not in primary_lookup, "Canonical primary identity is duplicated across cells/themes")
                    primary_lookup[key] = phrase
                    primary_locations[key] = {"pairId": pair, "level": number, "themeId": theme["id"],
                                              "domain": theme["domain"], "contentType": theme["contentType"], "held": held}
                    if held:
                        held_identities.add(key)
        for phrase in cell["reserve"]:
            key = (pair, phrase["id"])
            require(key not in primary_lookup, "A reserved primary identity duplicates an active/held source")
            primary_lookup[key] = phrase
            primary_locations[key] = {"pairId": pair, "level": number, "themeId": None,
                                      "domain": "reserve", "contentType": phrase["contentType"], "held": False}
    require(set(pack["repertoires"]) == set(PAIR_LANGUAGES), "A review transport bank is absent")
    base_levels = {}
    for pair, (_native, study) in PAIR_LANGUAGES.items():
        for index, card in enumerate(decks[study]):
            intro = introduction_map.get((pair, index))
            move = move_map.get((pair, index))
            base_levels[(pair, f"catalogue:{study}:{index}")] = intro["proposedLevel"] if intro else move["proposedLevel"] if move else card["lv"]
    for key, item in authored_map.items():
        base_levels[key] = item["proposedLevel"]
    for (pair, relative, unit_id, variant_index), item in runtime_imports.items():
        base_levels[(pair, f"conversation:{Path(relative).name}:{unit_id}:v{variant_index}")] = item["proposedLevel"]
    situation_resolution = resolve_situation_sources(pack, primary_lookup, primary_locations, base_levels, require, canonical, digest)
    pack["situationResolution"] = situation_resolution
    situation_introductions = situation_resolution["catalogueIntroductions"]
    if pack["situations"]:
        expected_authored = sum(entry["authored"] for entry in situation_resolution["newEntries"].values())
        expected_additional = {"planSha256": pack["situations"]["freeze"]["planSha256"],
                               "themeCount": 10, "intentsPerTheme": 8, "candidatePositions": 560,
                               "newAuthoredUtterances": expected_authored,
                               "existingConversationImports": len(situation_resolution["newEntries"]) - expected_authored,
                               "existingSourcePositions": 560 - expected_authored}
        require(manifest.get("additionalSituations") == expected_additional,
                "Manifest falsely counts situation reuse, imports or intent positions as new authored phrases")
    else:
        require(not manifest.get("additionalSituations"), "Runtime declares a situation extension without frozen source ledgers")
    bank_map, used_review_banks = {}, set()
    for pair, bank in pack["repertoires"].items():
        require(bank["version"] == 1 and bank["pairId"] == pair
                and bank["sourceDecksSha256"] == digest(canonical(decks)), "Review bank source identity differs")
        for copied in bank["phrases"]:
            key = (pair, copied["id"])
            require(key in primary_lookup and key not in bank_map and key not in held_identities, "Review bank is duplicate, unknown, or uses held material")
            location = primary_locations[key]
            require(location["domain"] != "reserve", "Reserved material entered a transport bank")
            require(copied.get("referenceOnly") is True and copied.get("sourceHash") == primary_lookup[key]["source"]["sourceSha256"],
                    "A transport copy is falsely declared a new primary or source")
            require(copied.get("canonicalLocation") == {field: location[field] for field in ("pairId", "level", "themeId")},
                    "Review bank first canonical location differs")
            require({field: value for field, value in copied.items() if field not in {"referenceOnly", "sourceHash", "canonicalLocation"}}
                    == primary_lookup[key], "A transport copy differs from its canonical whole source")
            bank_map[key] = copied

    # Local preparation and transport references never create another primary.
    canonical_in_cell = {
        key: {phrase["id"]: phrase for phrase in ([p for theme in cell["themes"] + cell.get("heldThemes", []) for p in theme["phrases"]] + cell["reserve"])}
        for key, cell in pack["cells"].items()
    }

    catalogue_seen = {pair: set() for pair in PAIR_LANGUAGES}
    imports_seen, phrase_ids, step_ids = set(), set(), set()
    positions, pair_reports = {}, []
    copied_fields = imported_fields = step_count = template_count = l1_count = preparation_steps = 0
    local_support, local_orders, all_phrases = {}, [], {}
    active_count = reserved_count = situation_step_count = lexical_step_count = 0
    held_count = held_theme_count = review_reference_count = visible_theme_count = concept_count = 0
    context_reference_count = new_situation_fields = 0
    authored_seen, authored_fields = set(), 0
    for pair_manifest in manifest["pairs"]:
        pair = pair_manifest["id"]
        native, study = PAIR_LANGUAGES[pair]
        repertoire_path = f"content/niveaux-progressifs/repertoires/{pair}.json"
        require(pair_manifest.get("repertoirePath") == repertoire_path
                and pair_manifest.get("repertoireSha256") == pack["fingerprints"]["melunga_deploy/" + repertoire_path],
                "Manifest points to an unchecked or stale review bank")
        require((pair_manifest["nativeLanguage"], pair_manifest["studyLanguage"]) == (native, study), "Pair language identity differs")
        expected_fields = field_map(study)
        require(len(pair_manifest["levels"]) == 10, "Pair lacks ten levels")
        require({level["level"] for level in pair_manifest["levels"]} == set(range(1, 11)), "Pair level list duplicated or missing")
        catalogue_count = import_count = authored_pair_count = presented_count = pair_reserved_count = new_situation_pair_count = 0
        pair_types, pair_lexical_types = Counter(), Counter()
        source_l1_indices = {i for i, card in enumerate(decks[study]) if card["lv"] == 1}
        for level_metadata in pair_manifest["levels"]:
            number = level_metadata["level"]
            require(level_metadata["dataPath"] == f"content/niveaux-progressifs/{pair}/L{number}.json", "Unexpected cell path")
            cell = pack["cells"][(pair, number)]
            require((cell["pairId"], cell["nativeLanguage"], cell["studyLanguage"], cell["level"]) == (pair, native, study, number), "Cell identity differs")
            require(cell.get("repertoirePath") == repertoire_path, "Cell review bank path differs from checked transport")
            require(len(cell["themes"]) == level_metadata["themeCount"], "Theme count differs from manifest")
            require(len({theme["id"] for theme in cell["themes"]}) == len(cell["themes"]), "A level repeats a theme identity")
            cell_count = 0
            cell_types, cell_lexical_types = Counter(), Counter()
            reserve_theme = {"id": None, "domain": "reserve", "phrases": cell["reserve"],
                             "isTemplateCollection": False, "sequences": [], "totalPhrases": len(cell["reserve"])}
            require(all(isinstance(item, dict) for item in cell["reserve"]), "Malformed reserve record")
            held_theme_ids = {theme["id"] for theme in cell.get("heldThemes", [])}
            require(len({theme["id"] for theme in cell["themes"]}) == len(cell["themes"]), "A visible theme is duplicated to inflate coverage")
            require(len(held_theme_ids) == len(cell.get("heldThemes", []))
                    and not held_theme_ids & {theme["id"] for theme in cell["themes"]}, "A theme is both visible and held")
            for theme_position, theme in enumerate([*cell["themes"], *cell.get("heldThemes", []), reserve_theme]):
                is_reserve = theme["id"] is None
                is_held = theme["id"] in held_theme_ids
                if not is_reserve:
                    definition = plan_map.get((number, theme["id"]))
                    require(definition is not None and definition["domain"] != "personnaliser", "Active theme is outside situation/lexical definitions")
                    for field in ("domain", "visualId", "optional", "isTemplateCollection"):
                        require(theme[field] == definition.get(field, False), "Theme metadata differs: " + field)
                    title = definition.get("studyLanguageTitleOverrides", {}).get(study, definition["title"])
                    require(theme["title"] == title[native], "Theme title differs from planned locale")
                    expected_type = definition.get("contentType", "utterance")
                    require(theme["contentType"] == expected_type and theme["section"] == ("situations" if expected_type == "utterance" else "vocabulary"),
                            "Theme mixes situation and lexical sections")
                    registered = next((item for item in pack["visualRegistry"]["themes"] if item["visualId"] == theme["visualId"]), None)
                    require(registered is not None, "Theme photo is unregistered")
                    expected_photo = {key: registered.get(key, 3 if key == "columns" else 4) for key in ("asset", "column", "row", "columns", "rows")}
                    require(theme["photo"] == expected_photo, "Runtime theme photo differs from its canonical registry")
                phrases = {}
                for phrase_position, phrase in enumerate(theme["phrases"]):
                    require(phrase["id"] not in phrase_ids, "Duplicate runtime phrase identity: " + phrase["id"])
                    phrase_ids.add(phrase["id"])
                    all_phrases[(pair, phrase["id"])] = phrase
                    phrases[phrase["id"]] = phrase
                    source = phrase["source"]
                    require(phrase["editorialLevel"] == number, "Phrase target level differs from its cell")
                    if source["collection"].startswith("DECKS."):
                        index = source["sourceIndex"]
                        require(type(index) is int and 0 <= index < len(decks[study]), "Catalogue index outside its source deck")
                        require(index not in catalogue_seen[pair], "Classic source index appears more than once")
                        catalogue_seen[pair].add(index)
                        card = decks[study][index]
                        require(source["collection"] == "DECKS." + study, "Wrong source deck identity")
                        require(phrase["id"] == f"catalogue:{study}:{index}", "Classic phrase identity differs")
                        require(type(source["sourceLevel"]) is int and source["sourceLevel"] == card["lv"], "Classic source lv was changed")
                        require(source["fieldMap"] == expected_fields, "Wrong learner phonetic field map")
                        require(source["sourceSha256"] == digest(canonical(card)), "Whole classic source fingerprint differs")
                        for output, original in expected_fields.items():
                            if original in card:
                                require(phrase.get(output) == card[original], f"Source field differs: {pair}:{index}:{output}")
                                copied_fields += 1
                            else:
                                require(phrase.get(output, "") == "", "A missing source field was manufactured")
                        decision = move_map.get((pair, index))
                        introduction = introduction_map.get((pair, index))
                        situation_introduction = situation_introductions.get((pair, index))
                        expected_level = situation_introduction["proposedLevel"] if situation_introduction else introduction["proposedLevel"] if introduction else decision["proposedLevel"] if decision else card["lv"]
                        require(number == expected_level, "Unexpected editorial level reassignment")
                        require(phrase["placement"].get("plannedPrerequisiteIndices", []) == (decision.get("plannedPrerequisiteIndices", []) if decision else []), "Runtime prerequisite links differ from explicit decisions")
                        expected_template = card.get("cat") == "template" or card.get("pedagogicalStatus") == "modele-a-completer" or bool(re.search(r"\{[\w-]+\}|_{2,}", card["t"]))
                        annotation = semantic_map[(pair, index)]
                        require(phrase["contentType"] == annotation["contentType"], "Runtime content type differs from its semantic partition")
                        require(phrase["semanticReview"]["status"] == annotation["reviewStatus"] and phrase["semanticReview"]["reason"] == annotation["reason"],
                                "Runtime semantic rationale differs from its source annotation")
                        require(phrase["sourceDeclaredTemplate"] == expected_template, "Original template marker was hidden")
                        require(phrase["isTemplate"] == (expected_template and (pair, index) not in exceptions), "Template changed without its bounded exception")
                        require(bool(phrase["semanticReview"].get("sourceTemplateException")) == ((pair, index) in exceptions),
                                "Runtime exception lacks its source-specific approval")
                        if phrase["contentType"] == "vocabulary":
                            introduced_class = introduction.get("lexicalClass") if introduction else None
                            if introduced_class not in {"adjective", "preposition", "adverb", "color", "other", "uncertain"}:
                                introduced_class = annotation["lexicalClass"]
                            require(phrase["lexicalClass"] == introduced_class
                                    and phrase["semanticReview"]["lexicalClassReason"] == annotation["lexicalClassReason"]
                                    and phrase["semanticReview"]["lexicalClassStatus"] == annotation["lexicalClassReviewStatus"],
                                    f"Runtime lexical class or rationale differs: {pair}:{index}")
                            prioritized = {"adjective": "vocab-adjectifs", "preposition": "vocab-prepositions", "adverb": "vocab-adverbes", "color": "vocab-couleurs"}.get(phrase["lexicalClass"])
                            require(not prioritized or theme["domain"] == prioritized, "Specialized lexical class lost its primary theme priority")
                            reviewed_family = annotation.get("lexicalFamilyOverride") or (introduction.get("lexicalFamily") if introduction else None)
                            require(not reviewed_family or theme["domain"] == reviewed_family, "Reviewed lexical family was ignored")
                        else:
                            require("lexicalClass" not in phrase, "A non-vocabulary phrase carries a lexical class")
                        reviewed_domain = situation_introduction["domain"] if situation_introduction else annotation.get("situationDomainOverride") or (introduction.get("domain") if introduction else None)
                        require(not reviewed_domain or theme["domain"] == reviewed_domain, "Reviewed situation purpose was ignored")
                        expected_concept = annotation.get("lexicalConceptId") or annotation.get("conceptId")
                        if introduction:
                            expected_concept = introduction.get("lexicalConceptId", expected_concept)
                            if not expected_concept:
                                expected_concept = introduction.get("conceptId")
                        require(phrase.get("lexicalConceptId") == expected_concept, "A source concept identity was invented, split, or dropped")
                        if introduction and "numberOrder" in introduction:
                            require(phrase.get("numberOrder") == introduction["numberOrder"]
                                    and phrase.get("numberKind") == introduction.get("numberKind")
                                    and phrase.get("numberValue") == introduction.get("numberValue"), "Whole-number progression metadata differs")
                        positions[(pair, index)] = (number, theme_position, phrase_position, theme["id"])
                        catalogue_count += 1
                    elif source["collection"] == "editorial-authored":
                        key = (pair, phrase["id"])
                        require(key in authored_map and key not in authored_seen, "Undeclared or repeated new editorial source")
                        item = authored_map[key]
                        require(source["file"] == authored_file and source["itemId"] == item["id"]
                                and source["sourceFileSha256"] == pack["fingerprints"][authored_file]
                                and source["sourceSha256"] == digest(canonical(item)), "New editorial source fingerprint differs")
                        expected_fields_authored = {field: field for field in ("study", "native", "phon", "reading") if field in item}
                        require(source["fieldMap"] == expected_fields_authored, "New editorial fields are not mapped whole")
                        for field in expected_fields_authored:
                            require(phrase.get(field) == item[field], "New editorial field or phonetic was altered")
                            authored_fields += 1
                        require(phrase["contentType"] == item["contentType"] and number == item["proposedLevel"]
                                and theme["domain"] == item["lexicalFamily"] and phrase["phoneticReviewStatus"] == "pending-Claude"
                                and phrase["isTemplate"] is False and phrase["sourceDeclaredTemplate"] is False,
                                "New editorial entry changes type, placement or pending review")
                        require(phrase.get("lexicalConceptId") == item.get("lexicalConceptId")
                                and phrase.get("wholeHeadwordPhonSource") == item.get("wholeHeadwordPhonSource"), "New entry concept/whole-headword provenance differs")
                        if item["contentType"] == "vocabulary":
                            require(phrase["lexicalClass"] == item["lexicalClass"], "New editorial lexical class differs")
                        else:
                            require(theme["domain"] == "nombres" and phrase["numberOrder"] == item["numberOrder"], "New zero/number order differs")
                        authored_seen.add(key)
                        authored_pair_count += 1
                    elif source["collection"] in {"situation-authored", "situation-conversation"}:
                        expected = situation_resolution["newEntries"].get((pair, phrase["id"]))
                        require(expected is not None, "Undeclared new situation canonical source")
                        item = expected["item"]
                        require(source == expected["source"] and phrase["contentType"] == "utterance"
                                and phrase.get("isTemplate") is False and phrase.get("sourceDeclaredTemplate") is False,
                                "New situation source provenance or complete-utterance status differs")
                        for field in ("study", "native", "phon", "reading"):
                            require((field in phrase) == (field in item) and phrase.get(field) == item.get(field),
                                    "New situation text, reading or phonetic was changed or assembled")
                            if field in item:
                                new_situation_fields += 1
                        require(number == item["proposedLevel"] and theme["domain"] == pack["situations"]["intents"][item["intentId"]][0]["domain"]
                                and phrase["phoneticReviewStatus"] == item["phoneticReviewStatus"],
                                "New situation canonical changed its placement or review status")
                        new_situation_pair_count += 1
                    else:
                        require(source["collection"] == "conversation" and source["kind"] == "conversation-variant", "Unknown source collection")
                        source_key = (pair, source["file"], source["unitId"], source["variantIndex"])
                        require(source_key in runtime_imports and source_key not in held_imports, "Held or undeclared enrichment was imported")
                        require(source_key not in imports_seen, "Enrichment imported more than once")
                        imports_seen.add(source_key)
                        item = runtime_imports[source_key]
                        snapshot = pack["snapshots"].get(source["file"])
                        require(snapshot is not None, "Missing immutable enrichment snapshot")
                        unit = next((u for u in snapshot["units"] if u["id"] == source["unitId"]), None)
                        require(unit is not None, "Enrichment unit does not exist")
                        variant = unit["variants"][source["variantIndex"]]
                        require(source["sourceSha256"] == digest(canonical(variant)) == item["sourceVariantSha256"], "Whole enrichment source fingerprint differs")
                        require(source["sourceFileSha256"] == item["sourceFileSha256"] == pack["fingerprints"][source["file"]], "Enrichment snapshot fingerprint differs")
                        require(source["sourceLevel"] == snapshot["level"], "Enrichment source level differs")
                        expected_variant_fields = {key: key for key in ("study", "native", "phon", "reading") if key in variant}
                        require(source["fieldMap"] == expected_variant_fields, "Enrichment fields do not map directly to its variant")
                        for field in expected_variant_fields:
                            require(phrase.get(field) == variant[field], "Enrichment field was changed or assembled")
                            imported_fields += 1
                        require(number == item["proposedLevel"] and theme["domain"] == item["domain"], "Enrichment placement differs from its declared candidate")
                        require(phrase["placement"]["enrichmentId"] == item["id"], "Wrong enrichment decision identity")
                        require(phrase["study"] not in {c["t"] for c in decks[study]}, "Imported text duplicates a held catalogue text")
                        require(phrase["contentType"] == "utterance" and not phrase["isTemplate"], "Whole conversation enrichment became a word or open frame")
                        import_count += 1
                    cell_types[phrase["contentType"]] += 1
                    if phrase["contentType"] == "vocabulary":
                        cell_lexical_types[phrase["lexicalClass"]] += 1
                    if is_reserve:
                        require(phrase["contentType"] in {"incomplete", "review"}, "An active word or utterance was silently reserved")
                        require(phrase["placement"]["section"] == "reserve" and phrase["placement"]["themeId"] is None and phrase["placement"]["domain"] == "reserve",
                                "Reserved phrase has an active lesson destination")
                        require(phrase["reserveReason"] == phrase["semanticReview"]["reason"], "Reserve rationale differs")
                        require(not ({"steps", "sequences", "requiresProduction"} & set(phrase)), "A reserved source declares a lesson or production task")
                        reserved_count += 1
                    else:
                        require(phrase["contentType"] == theme["contentType"] and phrase["contentType"] in {"utterance", "vocabulary", "number"},
                                "A situation or lexical theme contains a different semantic type")
                        require(not phrase["isTemplate"], "An incomplete source entered active training")
                        require(phrase["placement"]["section"] == theme["section"] and phrase["placement"]["themeId"] == theme["id"],
                                "Active phrase destination differs from its canonical theme")
                        require((theme["domain"] == "nombres") == (phrase["contentType"] == "number"), "Numbers are mixed with other lexical material")
                        active_count += 1
                        if is_held:
                            held_count += 1
                    if phrase["isTemplate"]:
                        template_count += 1
                require(len(phrases) == theme["totalPhrases"] and (is_reserve or len(phrases) > 0 or bool(theme.get("reviewReferences")) or bool(theme.get("contextReferences"))), "Empty or miscounted runtime theme")
                practice_phrases = dict(phrases)
                reference_ids, context_ids = set(), set()
                situation_uses = None
                if not is_reserve:
                    references = theme.get("reviewReferences", [])
                    for reference in references:
                        key = (pair, reference["id"])
                        require(key in primary_lookup and key in bank_map and reference["id"] not in reference_ids
                                and reference["id"] not in phrases and key not in held_identities, "A revision is duplicate, unbanked, new, held or unknown")
                        original = primary_lookup[key]
                        location = primary_locations[key]
                        require(reference["firstEditorialLevel"] == location["level"] < number
                                and reference["canonicalThemeId"] == location["themeId"]
                                and reference.get("reason"), "A revision is future/current-level or cites a false first encounter")
                        require(location["domain"] == theme["domain"] and original["contentType"] == theme["contentType"],
                                "A revision belongs to another semantic family or type")
                        reference_ids.add(reference["id"])
                        practice_phrases[reference["id"]] = original
                        used_review_banks.add(key)
                    contextual = theme.get("contextReferences", [])
                    situation_uses = situation_resolution["usesByTheme"].get((pair, number, theme["id"]))
                    require(bool(theme.get("isAdditionalSituation")) == bool(situation_uses), "An additional situation hides or invents its source-plan identity")
                    require(not contextual or situation_uses, "Contextual references were added outside an explicitly reviewed new situation")
                    expected_intents = {use["item"]["intentId"]: use["canonicalId"] for use in situation_uses or []}
                    for reference in contextual:
                        key = (pair, reference["id"])
                        require(key in primary_lookup and key in bank_map and reference["id"] not in context_ids
                                and reference["id"] not in phrases and reference["id"] not in reference_ids
                                and key not in held_identities, "A contextual use is duplicated, unbanked, new, held or unknown")
                        original, location = primary_lookup[key], primary_locations[key]
                        require(reference["firstEditorialLevel"] == location["level"] <= number
                                and reference["canonicalThemeId"] == location["themeId"]
                                and isinstance(reference.get("reason"), str) and reference["reason"].strip(),
                                "Contextual use precedes or misidentifies its canonical first encounter")
                        require(expected_intents.get(reference.get("intentId")) == reference["id"]
                                and original["contentType"] == "utterance" and not original["isTemplate"],
                                "A contextual use substitutes the wrong intent, isolated lexeme or incomplete source")
                        context_ids.add(reference["id"])
                        practice_phrases[reference["id"]] = original
                        used_review_banks.add(key)
                    if situation_uses:
                        require(not references, "A new situation silently treats contextual reuse as an earlier revision")
                        require(theme.get("presentationOrder") == "plan-intent-order-with-explicit-preparations",
                                "New situation declares an obsolete reuse-before-new ordering policy")
                        require(theme.get("intentIds") == [use["item"]["intentId"] for use in situation_uses]
                                and set(practice_phrases) == set(expected_intents.values()) and len(practice_phrases) == 8,
                                "A new situation omits an intent or counts a canonical phrase more than once")
                        actual_authored = sum(phrase["source"]["collection"] == "situation-authored" for phrase in phrases.values())
                        require(theme.get("authoredCount") == actual_authored
                                and theme.get("existingSourceCount") == len(practice_phrases) - actual_authored,
                                "A theme falsely labels a contextual or archived phrase as newly authored")
                    concepts = {concept_key(phrase) for phrase in practice_phrases.values()}
                    require(theme["newCount"] == theme["totalPhrases"] == len(phrases)
                            and theme["reviewCount"] == len(references)
                            and theme.get("reuseCount", 0) == len(contextual)
                            and theme["presentedCount"] == len(practice_phrases)
                            and theme["pedagogicalConceptCount"] == len(concepts), "Presentation/concept counters inflate primary sources or gender variants")
                    if is_held:
                        held_theme_count += 1
                        require(not references and not theme["sequences"] and len(concepts) < minimum_concepts, "A held source is exercised or meets visible density")
                    else:
                        visible_theme_count += 1
                        concept_count += len(concepts)
                        require(len(concepts) >= minimum_concepts, "A visible theme contains fewer than six actual concepts")
                    review_reference_count += len(references)
                    context_reference_count += len(contextual)
                assigned_to_sequences = []
                previous_group_rank = -1
                for sequence in theme["sequences"]:
                    ids = sequence["phraseIds"]
                    require(1 <= len(ids) <= 5 and len(ids) == len(set(ids)), "Invalid internal practice group")
                    require(set(ids) <= set(practice_phrases), "Sequence refers outside its canonical or valid review sources")
                    categories = {0 if identity in reference_ids else 1 if identity in context_ids else 2 for identity in ids}
                    if situation_uses:
                        require(categories <= {1, 2}, "A new situation disguises contextual reuse as a revision")
                    else:
                        require(len(categories) == 1, "A group mixes revision and new learning before recall completes")
                        group_rank = next(iter(categories))
                        require(group_rank >= previous_group_rank, "A revision group starts after new learning")
                        previous_group_rank = group_rank
                    assigned_to_sequences.extend(ids)
                    understood, imitated = {}, {}
                    preparation_ids = sequence.get("preparationIds", [])
                    require(len(preparation_ids) == len(set(preparation_ids)), "Duplicate local preparation identity")
                    require(not set(preparation_ids) & set(ids), "Preparation duplicates a primary group member")
                    require(set(preparation_ids) <= set(canonical_in_cell[(pair, number)]), "Preparation reference is outside its canonical level cell")
                    actual_preparation_ids, prepared_for, primary_started = set(), {}, set()
                    preparation_positions = {}
                    primary_stages = {identity: [] for identity in ids}
                    for step_position, step in enumerate(sequence["steps"]):
                        step_count += 1
                        require(step["id"] not in step_ids, "Duplicate step identity")
                        step_ids.add(step["id"])
                        require(step.get("wholePhrase") is (theme["contentType"] == "utterance"), "A lexical word is falsely declared a whole situation phrase")
                        require(step.get("contentType") == theme["contentType"], "Step content type differs from its active theme")
                        if theme["contentType"] == "utterance":
                            situation_step_count += 1
                        else:
                            lexical_step_count += 1
                        require(not ({"study", "native", "phon", "reading"} & set(step)), "A step embeds a second text or phonetic instead of a canonical reference")
                        target = step.get("utterance")
                        is_preparation = step.get("isPreparation") is True
                        if is_preparation:
                            preparation_steps += 1
                            require(target in preparation_ids, "Undeclared preparation reference")
                            phrase = canonical_in_cell[(pair, number)][target]
                            require(phrase["contentType"] == "utterance" and theme["contentType"] == "utterance",
                                    "Lexical or reserved prerequisite was injected into a situation step")
                            require(phrase["source"]["collection"].startswith("DECKS."), "Preparation must point to the declared catalogue prerequisite")
                            prepares = step.get("prepares")
                            require(prepares in ids, "Preparation does not identify a primary target")
                            require(prepares in phrases, "A local preparation targets a revision rather than a new primary")
                            require(prepares not in primary_started, "Local preparation starts after its primary source presentation")
                            primary = phrases[prepares]
                            require(primary["source"]["collection"].startswith("DECKS."), "Preparation target has no catalogue prerequisite decision")
                            primary_index = primary["source"]["sourceIndex"]
                            require(phrase["source"]["sourceIndex"] in declared_ancestors(pair, primary_index),
                                    "Preparation has no declared direct or transitive path to its target")
                            require(step["kind"] in {"understand", "imitate"}, "Preparation must not add a hidden recall task")
                            actual_preparation_ids.add(target)
                            traces = prepared_for.setdefault((prepares, target), {})
                            require(step["kind"] not in traces, "A local preparation repeats the same stage")
                            require(step["kind"] != "imitate" or "understand" in traces,
                                    "A local prerequisite is imitated before its own comprehension step")
                            traces[step["kind"]] = step["id"]
                            preparation_positions.setdefault(prepares, {}).setdefault(phrase["source"]["sourceIndex"], {})[step["kind"]] = step_position
                        else:
                            require(target not in {p["id"] for p in cell["reserve"]}, "A lesson step activates a reserved source")
                            require(target in ids, "Step refers outside its internal primary group")
                            phrase = practice_phrases[target]
                            require(step.get("isReview") is (target in reference_ids), "A revision or contextual source is counted as the wrong presentation type")
                            require(step.get("isContextReuse", False) is (target in context_ids), "A contextual source is disguised as a new phrase or revision")
                            primary_stages[target].append(step["kind"])
                        template = phrase["isTemplate"] or (not is_preparation and theme["isTemplateCollection"])
                        require(not template or (step["kind"] == "understand" and step.get("requiresProduction") is False), "Incomplete model was turned into learner production")
                        if step["kind"] == "understand":
                            require(step.get("requiresProduction") is False, "Comprehension was marked as production")
                            if not is_preparation:
                                primary_started.add(target)
                                for (primary_id, prerequisite_id), traces in prepared_for.items():
                                    if primary_id == target:
                                        require(set(traces) == {"understand", "imitate"}, "The target starts before its local prerequisite was presented and imitated")
                                        prerequisite = canonical_in_cell[(pair, number)][prerequisite_id]
                                        key = (pair, phrase["source"]["sourceIndex"], prerequisite["source"]["sourceIndex"])
                                        local_support[key] = {"sequenceId": sequence["id"],
                                                              "understoodInStep": traces["understand"],
                                                              "imitatedInStep": traces["imitate"],
                                                              "targetUnderstoodInStep": step["id"]}
                            understood[target] = step["id"]
                        elif step["kind"] == "imitate":
                            require(target in understood and step.get("requiresProduction") is True, "Imitation precedes the source presentation")
                            imitated[target] = step["id"]
                        elif step["kind"] == "choose-and-recall":
                            require(target in understood and target in imitated, "Recall precedes presentation and imitation")
                            require(step.get("requiresProduction") is True, "Recall lacks its production status")
                            require(step.get("preparedInSteps") == {"understoodInStep": understood[target], "imitatedInStep": imitated[target]}, "Recall has a false preparation reference")
                            for choice in step.get("choices", []):
                                require(choice in understood and choice in imitated, "A choice was not prepared in the same group")
                        else:
                            raise VerificationError("Unexpected step kind: " + str(step["kind"]))
                    require(actual_preparation_ids == set(preparation_ids), "A declared preparation is never played")
                    for traces in prepared_for.values():
                        require(set(traces) == {"understand", "imitate"}, "A local preparation lacks one of its two steps")
                    for identity, stages in primary_stages.items():
                        expected = ["understand"] if practice_phrases[identity]["isTemplate"] or theme["isTemplateCollection"] else ["understand", "imitate", "choose-and-recall"]
                        require(stages == expected, "A primary card omits, repeats, or reorders its learning stages")
                    if situation_uses:
                        for stage in ("understand", "imitate", "choose-and-recall"):
                            stage_order = [step["utterance"] for step in sequence["steps"]
                                           if step["kind"] == stage and not step.get("isPreparation")]
                            require(stage_order == ids, "Playback reorders the situation intentions inside a learning phase")
                    for primary_id, order in preparation_positions.items():
                        local_orders.append({"pair": pair, "sourceIndex": phrases[primary_id]["source"]["sourceIndex"],
                                             "sequenceId": sequence["id"], "order": order})
                require(is_reserve or is_held or len(assigned_to_sequences) == len(practice_phrases)
                        and set(assigned_to_sequences) == set(practice_phrases), "Practice groups omit or duplicate a new/review presentation")
                if not is_reserve and not is_held and theme["contentType"] == "number":
                    for review_block in (True, False):
                        number_orders = [practice_phrases[identity]["numberOrder"] for identity in assigned_to_sequences
                                         if (identity not in phrases) == review_block]
                        require(number_orders == sorted(number_orders), "A review/new number block is not in numeric pedagogical order")
                elif not is_reserve and not is_held and theme["domain"] == "vocab-adjectifs":
                    priorities = {label: order for order, label in enumerate(("grand", "petit", "gros", "beau", "leger", "lourd", "triste", "heureux"))}
                    for review_block in (True, False):
                        labels = [concept_key(practice_phrases[identity]) for identity in assigned_to_sequences
                                  if (identity not in phrases) == review_block]
                        basic_orders = [priorities[label] for label in labels if label in priorities]
                        require(basic_orders == sorted(basic_orders), "An adjective block reverses the owner-selected basic concepts")
                        if any(label in {"radin", "égoïste"} for label in labels):
                            trait_start = next(i for i, label in enumerate(labels) if label in {"radin", "égoïste"})
                            require(all(label in {"radin", "égoïste"} for label in labels[trait_start:]),
                                    "Personality traits precede physical/descriptive adjective material")
                        starts = [label for i, label in enumerate(labels) if i == 0 or labels[i - 1] != label]
                        require(len(starts) == len(set(starts)), "Declared adjective concept variants are scattered to simulate separate learning groups")
                elif not is_reserve and not is_held:
                    review_levels = [primary_locations[(pair, identity)]["level"] for identity in assigned_to_sequences if identity in reference_ids]
                    require(review_levels == sorted(review_levels), "Revisions are not ordered by their earlier first encounter")
                if not is_reserve and (pair, number, theme["id"]) in situation_resolution["usesByTheme"]:
                    planned_order = [use["canonicalId"] for use in situation_resolution["usesByTheme"][(pair, number, theme["id"])]]
                    require(assigned_to_sequences == planned_order, "The new situation plays its intentions outside global 01-to-08 order")
                cell_count += len(phrases)
            require(cell_count == cell["totalCanonicalPhrases"] == level_metadata["totalCanonicalPhrases"], "Cell canonical count differs")
            require(cell["reservedPhrases"] == level_metadata["reservedPhrases"] == len(cell["reserve"]), "Cell reserve count differs")
            require(cell["totalPhrases"] == level_metadata["totalPhrases"] == cell_count - len(cell["reserve"]), "Cell active count differs")
            cell_held_count = sum(len(theme["phrases"]) for theme in cell.get("heldThemes", []))
            require(cell.get("heldPhrases") == cell_held_count and cell.get("visibleCanonicalPhrases") == cell["totalPhrases"] - cell_held_count,
                    "Held material was lost or falsely counted as visibly presented")
            expected_additional_count = sum(theme["level"] == number for theme in pack["situations"]["plan"]["themes"]) if pack["situations"] else 0
            actual_additional_count = sum(bool(theme.get("isAdditionalSituation")) for theme in cell["themes"])
            actual_context_count = sum(len(theme.get("contextReferences", [])) for theme in cell["themes"])
            require(actual_additional_count == expected_additional_count == level_metadata.get("additionalSituationCount", 0),
                    "A level omits a new situation or falsely reports the number of added themes")
            require(cell.get("contextReuseCount", 0) == level_metadata.get("contextReuseCount", 0) == actual_context_count,
                    "A cell or manifest level inflates contextual source reuse counts")
            actual_presented_count = sum(theme["presentedCount"] for theme in cell["themes"])
            require(cell.get("presentedCount") == level_metadata.get("presentedCount") == actual_presented_count,
                    "A cell or manifest level counts transported sources as new canonical presentations")
            require(dict(cell_types) == {key: value for key, value in cell["counts"].items() if value}, "Cell semantic counts differ")
            require(dict(cell_lexical_types) == cell["lexicalClassCounts"] == level_metadata["lexicalClassCounts"], "Cell lexical-class counts differ")
            pair_types.update(cell_types)
            pair_lexical_types.update(cell_lexical_types)
            pair_reserved_count += len(cell["reserve"])
            presented_count += cell["totalPhrases"]
        require(catalogue_seen[pair] == set(range(len(decks[study]))), "Missing or added classic source indices")
        require(source_l1_indices <= catalogue_seen[pair], "A historically L1 source card disappeared")
        require(catalogue_count == pair_manifest["totalCataloguePhrases"] == len(decks[study]), "Classic total differs from manifest")
        require(presented_count == pair_manifest["totalPhrases"] == catalogue_count + import_count + authored_pair_count + new_situation_pair_count - pair_reserved_count, "Active total differs from manifest")
        require(pair_manifest["totalCanonicalPhrases"] == catalogue_count + import_count + authored_pair_count + new_situation_pair_count and pair_manifest["reservedPhrases"] == pair_reserved_count, "Pair canonical/reserve totals differ")
        require(dict(pair_types) == {k: v for k, v in pair_manifest["counts"].items() if v}
                and dict(pair_lexical_types) == pair_manifest["lexicalClassCounts"], "Pair semantic totals differ")
        l1_count += len(source_l1_indices)
        pair_reports.append({"pair": pair, "catalogueCards": catalogue_count, "importedWholePhrases": import_count,
                             "historicalSourceL1IndicesConserved": len(source_l1_indices), "levelCells": 10,
                             "activePhrases": presented_count, "reservedPhrases": pair_reserved_count,
                             "authoredEntries": authored_pair_count, "newSituationEntries": new_situation_pair_count,
                             "counts": dict(pair_types), "lexicalClassCounts": dict(pair_lexical_types)})
    require(imports_seen == set(runtime_imports), "A declared enrichment was omitted")
    require(authored_seen == set(authored_map), "A declared whole-entry draft was omitted")
    require(used_review_banks == set(bank_map), "The transport bank includes unused, unvalidated or unreferenced copies")
    require(copied_fields == 110277 and imported_fields == 150, "Unexpected source-field comparison count")
    require(l1_count == 2134, "Historic raw L1 set differs")
    for pair, index in (("fr-zh", 2246), ("fr-en", 3038), ("fr-it", 2632), ("fr-ja", 3017), ("fr-ko", 2169)):
        identity = f"catalogue:{PAIR_LANGUAGES[pair][1]}:{index}"
        require(primary_lookup[(pair, identity)]["contentType"] != "number",
                f"A known new/first nominal-adnominal false friend became a number: {pair}:{index}")
    for pair, index, expected_type, family in (
        ("fr-es", 1668, "utterance", "saluer"),
        ("fr-es", 4190, "vocabulary", "vocab-actions"),
        ("fr-es", 1394, "utterance", "conversation"),
        ("fr-es", 3748, "vocabulary", "vocab-voyage"),
        ("fr-es", 3894, "vocabulary", "vocab-prepositions"),
        ("fr-en", 4089, "vocabulary", "vocab-loisirs"),
        ("fr-en", 4076, "vocabulary", "vocab-restaurant"),
    ):
        identity = f"catalogue:{PAIR_LANGUAGES[pair][1]}:{index}"
        phrase = primary_lookup[(pair, identity)]
        require(phrase["contentType"] == expected_type and phrase["placement"]["domain"] == family,
                f"Known semantic regression returned: {pair}:{index}")
    # A transitive preparation must introduce its own declared ancestor first.
    # An ancestor omitted locally is permitted only when its canonical primary
    # presentation already precedes the target in the editorial order.
    for support in local_orders:
        pair, primary_index, order = support["pair"], support["sourceIndex"], support["order"]
        for prepared_index, traces in order.items():
            for ancestor in move_map.get((pair, prepared_index), {}).get("plannedPrerequisiteIndices", []):
                if semantic_map[(pair, ancestor)]["contentType"] != "utterance":
                    continue  # Lexical/reserved supports are not situation steps.
                if ancestor in order:
                    require(order[ancestor]["imitate"] < traces["understand"],
                            "A local transitive preparation precedes its own ancestor's completed presentation")
                else:
                    require(positions[(pair, ancestor)][:3] < positions[(pair, primary_index)][:3],
                            "A local preparation still depends on an unprepared later ancestor")
    late, comprehension_links, structural_late, reserved_gaps = [], [], [], []
    link_classes, lexical_reuse_count = Counter(), 0
    link_count = 0
    for (pair, index), move in move_map.items():
        for prerequisite in move.get("plannedPrerequisiteIndices", []):
            link_count += 1
            require((pair, prerequisite) in positions, "Planned prerequisite source is missing")
            source_position, target_position = positions[(pair, prerequisite)], positions[(pair, index)]
            target_type = semantic_map[(pair, index)]["contentType"]
            prerequisite_type = semantic_map[(pair, prerequisite)]["contentType"]
            if target_type in {"incomplete", "review"} or prerequisite_type in {"incomplete", "review"}:
                link_classes["reserved"] += 1
                if target_type == "utterance" and prerequisite_type in {"incomplete", "review"}:
                    reserved_gaps.append({"pair": pair, "sourceIndex": index, "prerequisiteSourceIndex": prerequisite,
                                          "contentType": prerequisite_type, "reason": "reserved-source-not-exercised"})
            elif target_type == prerequisite_type == "utterance":
                link_classes["structural-utterance"] += 1
            elif prerequisite_type in {"vocabulary", "number"}:
                link_classes["lexical"] += 1
            else:
                link_classes["other-non-utterance-target"] += 1
            if source_position[:3] >= target_position[:3]:
                late.append({"pair": pair, "sourceIndex": index, "prerequisiteSourceIndex": prerequisite,
                             "targetPosition": list(target_position), "prerequisitePosition": list(source_position),
                             "localPreparation": local_support.get((pair, index, prerequisite)),
                             "targetContentType": target_type, "prerequisiteContentType": prerequisite_type,
                             "doesNotProveAcquisition": True})
                if target_type == prerequisite_type == "utterance":
                    structural_late.append(late[-1])
    for (pair, identity), phrase in all_phrases.items():
        source = phrase["source"]
        if source["collection"] in {"conversation", "editorial-authored", "situation-authored", "situation-conversation"}:
            require(not phrase.get("reuseVocabularyIds"), "Imported whole variant has undeclared lexical prerequisites")
            continue
        index = source["sourceIndex"]
        expected_reuses = []
        if phrase["contentType"] == "utterance":
            for prerequisite in move_map.get((pair, index), {}).get("plannedPrerequisiteIndices", []):
                if (semantic_map[(pair, prerequisite)]["contentType"] in {"vocabulary", "number"}
                        and positions[(pair, prerequisite)][0] <= phrase["editorialLevel"]):
                    expected_reuses.append(f"catalogue:{PAIR_LANGUAGES[pair][1]}:{prerequisite}")
        require(phrase.get("reuseVocabularyIds", []) == list(dict.fromkeys(expected_reuses)),
                "Lexical reuse references differ from typed same-or-earlier-level declared sources")
        lexical_reuse_count += len(expected_reuses)
    return {
        "pairs": pair_reports, "checks": {
            "levelCells": 70, "catalogueCardsRetainedExactlyOnce": sum(map(len, catalogue_seen.values())),
            "catalogueFieldsCompared": copied_fields, "catalogueFieldDifferences": 0,
            "sourceLevelOneIndicesConserved": l1_count, "explicitPlacementProposals": len(move_map),
            "sourceLevelsNotIndividuallyReviewed": 32115 - len(set(move_map) | set(introduction_map) | set(situation_introductions)),
            "historicalPlacementDecisionsPreserved": len(move_map),
            "wholeSourceIntroductionDecisions": len(introduction_map),
            "uniqueSourcesWithExplicitPlacementDecision": len(set(move_map) | set(introduction_map) | set(situation_introductions)),
            "introductionCounts": introduction_counts,
            "introductionSourceFieldsCompared": introduction_fields_compared,
            "importedWholePhrases": len(imports_seen), "importedFieldsCompared": imported_fields,
            "excludedEnrichmentsAbsent": len(held_imports), "immutableSnapshotsComparedToGit": len(pack["snapshots"]),
            "templatesWithoutProduction": template_count, "stepsChecked": step_count,
            "activePhrases": active_count, "reservedPhrasesRetainedWithoutSteps": reserved_count,
            "visibleCanonicalPhrases": active_count - held_count, "heldCanonicalPhrases": held_count,
            "heldThemes": held_theme_count, "visibleThemes": visible_theme_count,
            "reviewPresentationReferences": review_reference_count,
            "reviewTransportCopies": len(bank_map), "visibleThemeConceptsIncludingReviews": concept_count,
            "newEditorialWholeEntries": len(authored_seen), "newEditorialFieldsCompared": authored_fields,
            "newWholeEntryPhoneticsPendingClaude": len(authored_seen) - authored_reused_phonetics,
            "wholeHeadwordPhoneticsReused": authored_reused_phonetics,
            "additionalSituationThemesPerPair": 10 if pack["situations"] else 0,
            "situationCandidatePositions": len(pack["situations"]["items"]) if pack["situations"] else 0,
            "situationCandidateKinds": pack["situations"].get("inputKindCounts", {}) if pack["situations"] else {},
            "situationSourceFieldsCompared": pack["situations"]["sourceFieldsCompared"] if pack["situations"] else 0,
            "situationImmutableConversationParentsChecked": 70 if pack["situations"] else 0,
            "newSituationAuthoredUtterances": sum(item["authored"] for item in situation_resolution["newEntries"].values()),
            "newSituationExistingConversationImports": sum(not item["authored"] for item in situation_resolution["newEntries"].values()),
            "newSituationWholeFieldsCompared": new_situation_fields,
            "contextPresentationReferences": context_reference_count,
            "situationCatalogueIntroductionDecisions": len(situation_introductions),
            "allVisibleThemesAtLeastSixConcepts": True,
            "editorialConceptAliases": {"léger": "leger", "le\u0301ger": "leger"},
            "reviewsStrictlyEarlierSameFamily": True, "reviewsRecalledBeforeNewLearning": True,
            "sourceContentTypeCounts": dict(semantic_counts),
            "reviewedSourceTemplateExceptions": len(exceptions_seen),
            "situationStepsContainOnlyUtterances": True, "situationSteps": situation_step_count, "lexicalSteps": lexical_step_count,
            "everyRecallPreparedInItsInternalGroup": True, "sourceOrPhoneticAssemblyDetected": False,
            "distinctEditorialVisualIds": len(visual_cells), "plannedPrerequisiteLinks": link_count,
            "plannedPrerequisitesNotEarlier": len(late),
            "localPreparationSteps": preparation_steps,
            "localPreparationReferences": sum(len(item["order"]) for item in local_orders),
            "distinctLocallyPreparedSources": len({(item["pair"], source) for item in local_orders for source in item["order"]}),
            "comprehensionOnlyPrerequisiteReferences": len(comprehension_links),
            "plannedPrerequisitesLocallyPrepared": sum(bool(link["localPreparation"]) for link in structural_late),
            "plannedPrerequisitesStillUnclosed": sum(not link["localPreparation"] for link in structural_late),
            "structuralUtteranceLinks": link_classes["structural-utterance"],
            "structuralUtteranceLinksPrimaryLate": len(structural_late),
            "lexicalPrerequisiteLinks": link_classes["lexical"], "plannedLexicalReuseReferences": lexical_reuse_count,
            "reservedPrerequisiteLinks": link_classes["reserved"],
            "otherNonUtterancePrerequisiteLinks": link_classes["other-non-utterance-target"],
            "globalPrerequisiteClosureValidated": False,
            "activeUtteranceDependenciesOnReservedSources": len(reserved_gaps),
        }, "plannedPrerequisitesNotEarlier": late, "explicitlyRejectedPrerequisites": rejected_links,
        "comprehensionOnlyPrerequisiteReferences": comprehension_links,
        "reservedPrerequisiteGaps": reserved_gaps,
    }


def webp_dimensions(data):
    require(data[:4] == b"RIFF" and data[8:12] == b"WEBP", "Visual asset is not a WebP image")
    require(len(data) >= 20 and struct.unpack_from("<I", data, 4)[0] + 8 == len(data),
            "WebP RIFF length differs from its complete file")
    offset = 12
    while offset + 8 <= len(data):
        kind, size = data[offset:offset + 4], struct.unpack_from("<I", data, offset + 4)[0]
        require(offset + 8 + size <= len(data), "Truncated WebP chunk")
        payload = data[offset + 8:offset + 8 + size]
        if kind == b"VP8X":
            require(len(payload) >= 10, "Truncated extended WebP header")
            return (1 + int.from_bytes(payload[4:7], "little"), 1 + int.from_bytes(payload[7:10], "little"))
        if kind == b"VP8 ":
            require(len(payload) >= 10, "Truncated VP8 frame header")
            require(payload[3:6] == b"\x9d\x01\x2a", "Invalid VP8 frame header")
            width, height = struct.unpack_from("<HH", payload, 6)
            return width & 0x3FFF, height & 0x3FFF
        if kind == b"VP8L":
            require(len(payload) >= 5, "Truncated lossless WebP header")
            require(payload[0] == 0x2F, "Invalid lossless WebP header")
            bits = int.from_bytes(payload[1:5], "little")
            return 1 + (bits & 0x3FFF), 1 + ((bits >> 14) & 0x3FFF)
        offset += 8 + size + size % 2
    raise VerificationError("WebP has no recognised frame dimensions")


def check_visuals(pack, required=False):
    """Check all registered atlas cells, not the image semantics themselves."""
    root, registry = pack["root"], pack["visualRegistry"]
    require(registry is not None, "The visual registry is missing")
    require(len(registry["levels"]) == 10 and len(registry["vocabularyAtlases"]) == 5
            and len(registry["grammarAtlases"]) == 3 and len(registry["correctionAtlases"]) == 3
            and len(registry.get("situationAtlases", [])) == (1 if pack["situations"] else 0),
            "Registered atlas count differs from the frozen theme scope")
    records = registry["levels"] + registry["vocabularyAtlases"] + registry["grammarAtlases"] + registry["correctionAtlases"] + registry.get("situationAtlases", [])
    atlas_map, hashes, result = {}, set(), []
    for item in records:
        asset = item["asset"]
        require(asset.startswith("assets/") and ".." not in Path(asset).parts and asset not in atlas_map,
                "Unsafe or duplicate atlas path")
        relative = "melunga_deploy/" + asset
        path = root / relative
        if not path.is_file():
            require(not required, "Missing registered photo atlas: " + asset)
            result.append({"asset": asset, "status": "pending"})
            continue
        raw = path.read_bytes()
        checksum = digest(raw)
        require(checksum == item["sha256"] and len(raw) == item["bytes"], "Visual atlas registry hash or bytes differ")
        require(checksum not in hashes, "Two different atlases reuse identical image data")
        hashes.add(checksum)
        width, height = webp_dimensions(raw)
        require(width >= 768 and height >= 768, "Atlas resolution is below the registered preview requirements")
        require(item["columns"] in {3, 4} and item["rows"] == 4, "Unexpected registered atlas grid")
        atlas_map[asset] = item
        pack["fingerprints"][relative] = checksum
        result.append({"asset": asset, "status": "present", "bytes": len(raw), "width": width,
                       "height": height, "sha256": checksum, "columns": item["columns"], "rows": item["rows"]})
    expected, cells, identities = {}, set(), set()
    for level in pack["plan"]["levels"]:
        for theme in level["themes"]:
            expected[(level["level"], theme["id"])] = theme["visualId"]
        for definition in pack["vocabularyPolicy"]["themeDefinitions"]:
            expected[(level["level"], definition["idPattern"].format(level=level["level"]))] = definition["visualIdPattern"].format(level=level["level"])
    for theme in pack["situations"]["plan"]["themes"] if pack["situations"] else []:
        expected[(theme["level"], theme["themeId"])] = theme["visualId"]
    registered = set()
    for theme in registry["themes"]:
        key = (theme["level"], theme["themeId"])
        require(key not in registered and expected.get(key) == theme["visualId"], "Unexpected or duplicate theme photo registration")
        require(theme["visualId"] not in identities, "Two visual identities repeat")
        identities.add(theme["visualId"])
        registered.add(key)
        atlas = atlas_map.get(theme["asset"])
        if atlas is None:
            require(not required, "Theme refers to an absent registered atlas")
            continue
        columns, rows = theme.get("columns", 3), theme.get("rows", 4)
        require((columns, rows) == (atlas["columns"], atlas["rows"]), "Theme grid differs from its atlas")
        require(type(theme["column"]) is int and 0 <= theme["column"] < columns
                and type(theme["row"]) is int and 0 <= theme["row"] < rows, "Theme coordinates lie outside its atlas")
        scope = {definition["level"] for definition in atlas["themes"]} if "themes" in atlas else atlas.get("levels", atlas.get("usedLevels", [atlas.get("level")]))
        require(theme["level"] in scope, "Theme uses another level's atlas")
        cell = (theme["asset"], theme["column"], theme["row"])
        require(cell not in cells, "Distinct themes reuse the same physical photo cell")
        cells.add(cell)
    require(registered == set(expected) and len(registered) == 250 + (10 if pack["situations"] else 0), "Visual registry does not cover every independent situation/reserve/lexical slot")
    pending = any(item["status"] == "pending" for item in result)
    return {"status": "pending" if pending else "all-registered-atlases-present" if pack["situations"] else "all-twenty-one-atlases-present", "atlases": result,
            "distinctAssetCells": len(cells), "registryChecked": True,
            "ownerApprovedThemeVisuals": sum(item.get("ownerApproved") is True for item in registry["themes"]),
            "themeVisualsAwaitingOwnerReview": sum(item.get("ownerApproved") is not True for item in registry["themes"]),
            "semanticOrNativeReviewClaimed": False}


def adversarial_checks(pack):
    """In-memory faults exercise this reader; no source or generated file is edited."""
    def locate(test_pack, predicate):
        for cell in test_pack["cells"].values():
            for theme in cell["themes"]:
                for phrase in theme["phrases"]:
                    if predicate(phrase):
                        return theme, phrase
        raise VerificationError("Missing adversarial test fixture")

    def changed_phon(test_pack):
        _, phrase = locate(test_pack, lambda p: p["source"]["collection"].startswith("DECKS."))
        phrase["phon"] += " altered"

    def changed_level(test_pack):
        _, phrase = locate(test_pack, lambda p: True)
        phrase["editorialLevel"] = phrase["editorialLevel"] % 10 + 1

    def duplicated_primary(test_pack):
        theme, phrase = locate(test_pack, lambda p: True)
        theme["phrases"].append(copy.deepcopy(phrase))

    def wrong_phonetic_map(test_pack):
        _, phrase = locate(test_pack, lambda p: p["source"]["collection"] == "DECKS.en")
        phrase["source"]["fieldMap"]["phon"] = "py"

    def false_recall_reference(test_pack):
        for cell in test_pack["cells"].values():
            for theme in cell["themes"]:
                for sequence in theme["sequences"]:
                    for step in sequence["steps"]:
                        if step["kind"] == "choose-and-recall":
                            step["preparedInSteps"]["imitatedInStep"] = "nonexistent-step"
                            return
        raise VerificationError("Missing recall test fixture")

    def template_production(test_pack):
        for cell in test_pack["cells"].values():
            if cell["reserve"]:
                cell["reserve"][0]["requiresProduction"] = True
                return
        raise VerificationError("Missing reserve production fixture")

    def word_in_situation(test_pack):
        for cell in test_pack["cells"].values():
            lexical = next((theme for theme in cell["themes"] if theme["contentType"] == "vocabulary"), None)
            situation = next((theme for theme in cell["themes"] if theme["contentType"] == "utterance"), None)
            if lexical and situation:
                situation["phrases"].append(lexical["phrases"].pop())
                return
        raise VerificationError("Missing lexical/situation isolation fixture")

    def lexical_reuse_in_situation_steps(test_pack):
        for cell in test_pack["cells"].values():
            identities = {p["id"] for t in cell["themes"] for p in t["phrases"]}
            for theme in cell["themes"]:
                for phrase in theme["phrases"]:
                    for reused in phrase.get("reuseVocabularyIds", []):
                        if reused not in identities:
                            continue
                        sequence = next(s for s in theme["sequences"] if phrase["id"] in s["phraseIds"])
                        sequence["preparationIds"].append(reused)
                        sequence["steps"].insert(0, {
                            "id": sequence["id"] + ":adversarial-word-step", "kind": "understand",
                            "utterance": reused, "wholePhrase": True, "contentType": "utterance",
                            "requiresProduction": False, "isPreparation": True, "prepares": phrase["id"],
                        })
                        return
        raise VerificationError("Missing direct lexical reuse fixture")

    def held_import(test_pack):
        _, phrase = locate(test_pack, lambda p: p["source"]["collection"] == "conversation")
        source = phrase["source"]
        pair = next(pair for pair, cell_level in test_pack["cells"]
                    if any(phrase is p for t in test_pack["cells"][(pair, cell_level)]["themes"] for p in t["phrases"]))
        item = next(item for item in test_pack["enrichments"]["items"]
                    if item["pair"] == pair and not item.get("runtimeCandidate"))
        source.update({"file": item["sourceFile"], "unitId": item["unitId"], "variantIndex": item["variantIndex"]})

    def late_preparation(test_pack):
        for cell in test_pack["cells"].values():
            for theme in cell["themes"]:
                for sequence in theme["sequences"]:
                    preparation = [step for step in sequence["steps"] if step.get("isPreparation")]
                    if preparation:
                        sequence["steps"] = [step for step in sequence["steps"] if not step.get("isPreparation")] + preparation
                        return
        raise VerificationError("Missing local preparation test fixture")

    def future_revision(test_pack):
        for cell in test_pack["cells"].values():
            for theme in cell["themes"]:
                if theme["reviewReferences"]:
                    theme["reviewReferences"][0]["firstEditorialLevel"] = cell["level"]
                    return
        raise VerificationError("Missing real revision fixture")

    def wrong_family_revision(test_pack):
        locations = {(pair, phrase["id"]): (level, theme["id"], theme["domain"], phrase["contentType"])
                     for (pair, level), cell in test_pack["cells"].items()
                     for theme in cell["themes"] for phrase in theme["phrases"]}
        for (pair, level), cell in test_pack["cells"].items():
            candidates = test_pack["repertoires"][pair]["phrases"]
            for theme in cell["themes"]:
                if not theme["reviewReferences"]:
                    continue
                occupied = {p["id"] for p in theme["phrases"]} | {r["id"] for r in theme["reviewReferences"]}
                for candidate in candidates:
                    earlier, theme_id, family, content_type = locations[(pair, candidate["id"])]
                    if earlier < level and family != theme["domain"] and content_type == theme["contentType"] and candidate["id"] not in occupied:
                        theme["reviewReferences"][0].update(id=candidate["id"], firstEditorialLevel=earlier,
                                                           canonicalThemeId=theme_id)
                        return
        raise VerificationError("Missing cross-family revision fixture")

    def inflated_presented_count(test_pack):
        cell = next(iter(test_pack["cells"].values()))
        cell["themes"][0]["presentedCount"] += 1

    def gender_concept_split(test_pack):
        groups = {}
        for item in test_pack["authored"]["items"]:
            if item.get("lexicalConceptId"):
                groups.setdefault((item["pair"], item["lexicalConceptId"]), []).append(item["id"])
        pair, ids = next((pair, ids) for (pair, concept), ids in groups.items() if len(ids) > 1)
        identity = "editorial:" + ids[0]
        for (cell_pair, level), cell in test_pack["cells"].items():
            if cell_pair != pair:
                continue
            for theme in cell["themes"] + cell.get("heldThemes", []):
                for phrase in theme["phrases"]:
                    if phrase["id"] == identity:
                        phrase["lexicalConceptId"] += ":false-extra-concept"
        for phrase in test_pack["repertoires"][pair]["phrases"]:
            if phrase["id"] == identity:
                phrase["lexicalConceptId"] += ":false-extra-concept"

    def authored_phonetic_changed(test_pack):
        for (pair, level), cell in test_pack["cells"].items():
            for theme in cell["themes"]:
                for phrase in theme["phrases"]:
                    if phrase["source"]["collection"] == "editorial-authored":
                        phrase["phon"] += " altered"
                        for copied in test_pack["repertoires"][pair]["phrases"]:
                            if copied["id"] == phrase["id"]:
                                copied["phon"] = phrase["phon"]
                        return
        raise VerificationError("Missing whole-entry draft fixture")

    def reviews_after_new_learning(test_pack):
        for cell in test_pack["cells"].values():
            for theme in cell["themes"]:
                primaries = {p["id"] for p in theme["phrases"]}
                if theme["reviewReferences"] and primaries:
                    theme["sequences"].sort(key=lambda seq: 0 if seq["phraseIds"][0] in primaries else 1)
                    return
        raise VerificationError("Missing review-before-new grouping fixture")

    def numeric_review_inversion(test_pack):
        for pair, level in test_pack["cells"]:
            bank = {p["id"]: p for p in test_pack["repertoires"][pair]["phrases"]}
            for theme in test_pack["cells"][(pair, level)]["themes"]:
                if theme["contentType"] != "number":
                    continue
                primaries = {p["id"] for p in theme["phrases"]}
                for sequence in theme["sequences"]:
                    ids = sequence["phraseIds"]
                    if len(ids) < 2 or not all(identity not in primaries for identity in ids):
                        continue
                    if len({tuple(bank[identity]["numberOrder"]) for identity in ids}) < 2:
                        continue
                    sequence["phraseIds"] = list(reversed(ids))
                    original = sequence["steps"]
                    sequence["steps"] = [step for identity in reversed(ids) for step in original
                                         if step["utterance"] == identity and step["kind"] != "choose-and-recall"]
                    sequence["steps"] += [step for identity in reversed(ids) for step in original
                                          if step["utterance"] == identity and step["kind"] == "choose-and-recall"]
                    return
        raise VerificationError("Missing numeric revision order fixture")

    def reversed_transitive_preparation(test_pack):
        links = {(m["pair"], m["sourceIndex"]): m.get("plannedPrerequisiteIndices", [])
                 for m in test_pack["decisions"]["moves"]}
        for cell in test_pack["cells"].values():
            pair = cell["pairId"]
            for theme in cell["themes"]:
                for sequence in theme["sequences"]:
                    groups = {}
                    for position, step in enumerate(sequence["steps"]):
                        if step.get("isPreparation"):
                            groups.setdefault((step["prepares"], step["utterance"]), []).append(position)
                    for (primary, descendant), descendant_positions in groups.items():
                        descendant_index = int(descendant.rsplit(":", 1)[1])
                        for ancestor_index in links.get((pair, descendant_index), []):
                            ancestor = descendant.rsplit(":", 1)[0] + ":" + str(ancestor_index)
                            ancestor_positions = groups.get((primary, ancestor))
                            if ancestor_positions:
                                altered = [sequence["steps"][p] for p in descendant_positions + ancestor_positions]
                                for position, step in zip(sorted(descendant_positions + ancestor_positions), altered):
                                    sequence["steps"][position] = step
                                return
        raise VerificationError("Missing transitive preparation test fixture")

    mutations = [changed_phon, changed_level, duplicated_primary, wrong_phonetic_map,
                 false_recall_reference, template_production, held_import, word_in_situation,
                 lexical_reuse_in_situation_steps, future_revision, wrong_family_revision,
                 inflated_presented_count, gender_concept_split, authored_phonetic_changed,
                 reviews_after_new_learning, numeric_review_inversion]
    if any(s.get("preparationIds") for c in pack["cells"].values() for t in c["themes"] for s in t["sequences"]):
        mutations.append(late_preparation)
    if pack.get("situations"):
        def contextual_theme(test_pack):
            for cell in test_pack["cells"].values():
                for theme in cell["themes"]:
                    if theme.get("contextReferences"):
                        return cell, theme
            raise VerificationError("No contextual situation fixture")

        def context_claimed_as_new(test_pack):
            _cell, theme = contextual_theme(test_pack)
            source_id = theme["contextReferences"][0]["id"]
            for sequence in theme["sequences"]:
                for step in sequence["steps"]:
                    if step.get("utterance") == source_id:
                        step["isContextReuse"] = False
                        return

        def future_context_reference(test_pack):
            cell, theme = contextual_theme(test_pack)
            theme["contextReferences"][0]["firstEditorialLevel"] = cell["level"] + 1

        def wrong_context_intent(test_pack):
            _cell, theme = contextual_theme(test_pack)
            theme["contextReferences"][0]["intentId"] = "not-this-reviewed-intent"

        def inflated_context_reuse_count(test_pack):
            _cell, theme = contextual_theme(test_pack)
            theme["reuseCount"] += 1

        def situation_draft_phonetic_changed(test_pack):
            _theme, phrase = locate(test_pack, lambda row: row["source"]["collection"] == "situation-authored")
            phrase["phon"] += " altered"

        def catalogue_reuse_claimed_as_authored(test_pack):
            item = next(item for item in test_pack["situations"]["items"].values() if item["kind"] == "catalogue-reference")
            item["kind"] = "editorial-authored-whole-entry"
            item["source"] = {"kind": "editorial-authored-whole-utterance"}
            item["phoneticReviewStatus"] = "pending-Claude"

        def future_source_without_introduction(test_pack):
            item = next(item for item in test_pack["situations"]["items"].values() if item.get("introductionDecision"))
            item.pop("introductionDecision")

        def preferred_canonical_changes_whole_fields(test_pack):
            item = next(iter(test_pack["situations"]["items"].values()))
            study = PAIR_LANGUAGES[item["pair"]][1]
            index = next(index for index, row in enumerate(test_pack["decks"][study]) if row["t"] != item["study"])
            item["duplicateAudit"].update(decision="reuse-existing", preferredCanonicalId=f"catalogue:{study}:{index}")

        def manifest_reuse_claimed_as_creation(test_pack):
            test_pack["manifest"]["additionalSituations"]["newAuthoredUtterances"] += 1

        def level_context_count_inflated(test_pack):
            cell, _theme = contextual_theme(test_pack)
            cell["contextReuseCount"] += 1

        def theme_old_source_claimed_as_authored(test_pack):
            _cell, theme = contextual_theme(test_pack)
            theme["authoredCount"] += 1

        def new_situation_groups_reversed(test_pack):
            _cell, theme = contextual_theme(test_pack)
            require(len(theme["sequences"]) >= 2, "Missing complete eight-intent fixture")
            theme["sequences"][0], theme["sequences"][1] = theme["sequences"][1], theme["sequences"][0]

        def new_situation_playback_order_reversed(test_pack):
            for cell in test_pack["cells"].values():
                for theme in cell["themes"]:
                    if not theme.get("isAdditionalSituation"):
                        continue
                    for sequence in theme["sequences"]:
                        if len(sequence["phraseIds"]) < 2 or any(step.get("isPreparation") for step in sequence["steps"]):
                            continue
                        first, second = sequence["phraseIds"][:2]
                        one = [step for step in sequence["steps"] if step["utterance"] == first and step["kind"] in {"understand", "imitate"}]
                        two = [step for step in sequence["steps"] if step["utterance"] == second and step["kind"] in {"understand", "imitate"}]
                        slots = [index for index, step in enumerate(sequence["steps"]) if step in one + two]
                        require(len(one) == len(two) == 2, "Missing paired situation playback fixture")
                        for index, step in zip(slots, two + one):
                            sequence["steps"][index] = step
                        return
            raise VerificationError("Missing new-situation playback fixture")

        mutations.extend([context_claimed_as_new, future_context_reference, wrong_context_intent,
                          inflated_context_reuse_count, situation_draft_phonetic_changed,
                          catalogue_reuse_claimed_as_authored, future_source_without_introduction,
                          preferred_canonical_changes_whole_fields,
                          manifest_reuse_claimed_as_creation, level_context_count_inflated,
                          theme_old_source_claimed_as_authored, new_situation_groups_reversed,
                          new_situation_playback_order_reversed])
    results = []
    for mutation in mutations:
        changed = copy.deepcopy(pack)
        mutation(changed)
        try:
            check_pack(changed)
        except VerificationError as error:
            results.append({"fault": mutation.__name__, "rejected": True, "reason": str(error)})
        else:
            raise VerificationError("Adversarial fault was accepted: " + mutation.__name__)
    return results


def protected_files(root, base_ref):
    base = subprocess.run(["git", "rev-parse", "--verify", base_ref + "^{commit}"], cwd=root,
                          capture_output=True, text=True, check=True).stdout.strip()
    results = []
    for relative in PROTECTED_FILES:
        original = subprocess.run(["git", "show", base + ":" + relative], cwd=root,
                                  capture_output=True, check=True).stdout
        current = (root / relative).read_bytes()
        require(current == original, "Protected product source changed: " + relative)
        results.append({"path": relative, "identicalToMain": True, "sha256": digest(current)})
    return {"baseCommit": base, "files": results, "existingPriceAndAccessCodeChanged": False}


def markdown(report):
    c = report["checks"]
    source_types = c["sourceContentTypeCounts"]
    total_canonical = c["catalogueCardsRetainedExactlyOnce"] + c["importedWholePhrases"] + c["newEditorialWholeEntries"] + c["newSituationAuthoredUtterances"] + c["newSituationExistingConversationImports"]
    lines = [
        "# Vérification indépendante — sources, progression et densité", "",
        "Ce lecteur ne charge aucun générateur. Il relit le catalogue réel, les partitions sémantiques, les overlays, les sources entières nouvelles, les 70 cellules et les sept banques de révision. Il ne répare aucune donnée et n’approuve aucune publication.", "",
        "## Conservation et provenance", "",
        "| Couple | Catalogue exact | Imports L1 | Lot lexical rédigé | Ajouts de situation | Hors réserve | Réserve | L1 historique conservé |",
        "|---|---:|---:|---:|---:|---:|---:|---:|",
    ]
    for pair in report["pairs"]:
        lines.append(f"| {pair['pair']} | {pair['catalogueCards']} | {pair['importedWholePhrases']} | {pair['authoredEntries']} | {pair['newSituationEntries']} | {pair['activePhrases']} | {pair['reservedPhrases']} | {pair['historicalSourceL1IndicesConserved']} |")
    lines += [
        "", f"**{c['catalogueCardsRetainedExactlyOnce']:,} cartes classiques** sont canoniques exactement une fois. **{c['catalogueFieldsCompared']:,} champs** étudiés, natifs, phonétiques et lectures sont identiques aux sources. Les **{c['importedWholePhrases']} imports entiers / {c['importedFieldsCompared']} champs** correspondent aux sept instantanés, comparés octet pour octet à leur commit source ; les **{c['excludedEnrichmentsAbsent']} candidats écartés** sont absents.",
        "", f"Le total canonique est **{total_canonical:,}**, dont **{c['activePhrases']:,} entrées hors réserve** et **{c['reservedPhrasesRetainedWithoutSteps']} réservées**. Les banques et les révisions ne sont jamais ajoutées à ces totaux. La réserve n’a aucune étape de leçon.",
        "", "Les champs sont relus indépendamment : pf pour en/es/it/ja/ko, phf pour zh, phon et cn pour les apprenants sinophones du français ; py sert seulement de lecture complémentaire. Aucun morceau de phonétique n’est extrait ou assemblé.",
        "", "## Décisions éditoriales et ajouts", "",
        f"Les **{c['historicalPlacementDecisionsPreserved']} décisions historiques** et leur unique adjudication sont conservées. **{c['wholeSourceIntroductionDecisions']} introductions sources** ont une identité, un niveau source et une empreinte contrôlés ; **{c['introductionSourceFieldsCompared']} champs d’overlay** correspondent aux cartes entières. Ces nouveaux placements prennent priorité explicitement sans changer lv.", "",
    ]
    if c["situationCandidatePositions"]:
        lines += [
            f"Le lot de situations remplit **{c['situationCandidatePositions']} positions** dans dix thèmes communs, huit positions par thème et par couple. Il ajoute réellement **{c['newSituationAuthoredUtterances']} phrases rédigées** avec aides pending-Claude et **{c['newSituationExistingConversationImports']} phrases anciennes importées** ; les réemplois du catalogue et les références à un candidat ne sont pas comptés comme des créations. **{c['situationSourceFieldsCompared']} champs de réemploi** et **{c['newSituationWholeFieldsCompared']} champs d’ajouts** sont comparés aux objets entiers. L’index de recherche est reconstruit depuis **70 parents de conversation** immuables, sans charger le générateur.", "",
            f"Les **{c['contextPresentationReferences']} références contextuelles** pointent vers un seul canonique existant, au même niveau ou à un niveau antérieur. Leur intention est reliée au plan et leurs champs restent entiers. Elles utilisent isContextReuse et restent distinctes des révisions strictement antérieures. Dans chaque nouveau thème, les huit intentions suivent globalement l’ordre01→08, réemplois contextuels et primaires mêlés : ni une confirmation tardive ni un accord ne passe devant le problème initial. **{c['situationCatalogueIntroductionDecisions']} décisions du nouveau lot** introduisent explicitement un canonique de catalogue plus tôt, sans toucher son lv ni la frontière d’accès.", "",
            "Les intentions de dépendance de ces situations restent prévues : ce contrôle ne démontre ni acquisition, ni fermeture linguistique globale, ni conformité des nouvelles phonétiques à la méthode.", "",
        ]
    for filename, count in sorted(c["introductionCounts"].items()):
        lines.append(f"- {filename} : {count} décisions sources exactes.")
    lines += [
        "", f"Les **{c['newEditorialWholeEntries']} entrées rédigées / {c['newEditorialFieldsCompared']} champs** correspondent intégralement au master. Leurs aides gardent pending-Claude : **{c['newWholeEntryPhoneticsPendingClaude']} nouvelles propositions entières** et **{c['wholeHeadwordPhoneticsReused']} reprise du mot entier light**, dont la forme et l’aide sont comparées directement à la carte nominale d’origine. Le nouveau sens adjectival ne modifie pas cette carte. Les formes M/F liées à un même concept ne peuvent inventer deux concepts.",
        "", f"Le catalogue comporte **{source_types['utterance']:,} énoncés**, **{source_types['vocabulary']:,} entrées lexicales**, **{source_types['number']} nombres isolés**, **{source_types['incomplete']} incomplets** et **{source_types['review']} réserves sémantiques**. La partition est complète et ses décisions de type/POS/destination sont comparées à l’exécution. Les situations n’accueillent aucun mot ou nombre isolé, même par le chemin des préparations.",
        "", "Les classes spécialisées ont priorité sur les familles générales. Une famille fonctionnelle de relations peut aussi contenir un groupe locatif entier ou un localisateur chinois de classe other, sans le présenter comme une préposition française. Les régressions Saludos a tu familia→Saluer et Salirse con la suya→lexique Actions sont vérifiées séparément des heuristiques.",
        "", "## Densité réelle et reprises", "",
        f"**{c['visibleThemes']} thèmes visibles** ont chacun au moins six concepts mesurés à partir de leurs sources. **{c['heldThemes']} thèmes / {c['heldCanonicalPhrases']} cartes** sont conservés en attente sans entraînement ; **{c['visibleCanonicalPhrases']:,} cartes canoniques** sont visibles. Le drapeau require-no-held exige zéro contenu en attente.",
        "", f"Les **{c['reviewPresentationReferences']} révisions présentées** sont strictement postérieures à leur première rencontre, dans la même famille et le même type. Elles correspondent à **{c['reviewTransportCopies']} copies de transport uniques**, marquées referenceOnly et liées à leur emplacement canonique réel. Chaque copie, tous ses champs et sa provenance correspondent à cet original. Les compteurs newCount, reviewCount, presentedCount et pedagogicalConceptCount sont recalculés.",
        "", "Un concept explicitement lié dans les décisions ou le master garde exactement cet identifiant. Seul l’alias éditorial déclaré leger/léger est rapproché pour compter et trier les variantes, sans changer les identifiants ni aucun texte/phonétique source. À défaut, le couple étudié/sens exact sert de clé de comptage : cette mesure n’est pas une analyse universelle de synonymie. Elle ne remplace pas la revue sémantique de Codex.",
        "", f"Les **{c['stepsChecked']:,} étapes** comprennent **{c['situationSteps']:,} étapes de situation** et **{c['lexicalSteps']:,} étapes lexicales**. Compréhension puis imitation précèdent chaque rappel. Dans les anciennes rubriques, les groupes de révision sont séparés et terminent leurs rappels avant les nouveautés ; les nouveaux thèmes suivent leurs huit intentions dans l’ordre global du plan. Les nombres sont triés par numberOrder séparément dans le bloc révision puis dans le bloc nouveau. Les adjectifs suivent les concepts prioritaires grand/petit/gros/beau/léger/lourd/triste/heureux, avec variantes groupées et traits de personnalité après les propriétés. Les autres révisions suivent leur première rencontre croissante.",
        "", "## Prérequis : ce qui reste ouvert", "",
        f"Sur **{c['plannedPrerequisiteLinks']} liens hérités**, **{c['structuralUtteranceLinks']} relient deux énoncés**. **{c['structuralUtteranceLinksPrimaryLate']} présentations primaires tardives** sont précédées localement d’une préparation source : **{c['localPreparationReferences']} références / {c['localPreparationSteps']} étapes**. **{c['plannedPrerequisitesStillUnclosed']} liens structurels** restent sans fermeture d’ordre.",
        "", f"Les **{c['lexicalPrerequisiteLinks']} liens lexicaux** et **{c['plannedLexicalReuseReferences']} références de mots/nombres** restent distincts des étapes de situation. **{c['reservedPrerequisiteLinks']} liens impliquent une réserve**, et **{c['otherNonUtterancePrerequisiteLinks']}** concernent d’autres types. **{c['activeUtteranceDependenciesOnReservedSources']} cible active dépend encore d’une réserve**. La fermeture globale des prérequis n’est pas présumée.", "",
    ]
    for gap in report["reservedPrerequisiteGaps"]:
        lines.append(f"- {gap['pair']} : {gap['sourceIndex']} ← {gap['prerequisiteSourceIndex']} ({gap['contentType']}) ; source réservée non exercée.")
    lines += [
        "", "Le seul lien retiré, fr-zh245←2168, conserve son motif et sa trace : 是 est traduit « oui / c’est ça » dans sa carte autonome, ce qui ne prépare pas la copule. Aucun autre lien de revue n’est effacé.",
        "", f"Les **{c['sourceLevelsNotIndividuallyReviewed']:,} autres placements** gardent leur niveau source sans validation individuelle revendiquée. Exactitude des copies, densité et ordre prévu ne démontrent ni une acquisition ni la progressivité globale L1–L10.",
        "", "## Accès et photos", "",
        f"Les **{len(report['protectedProductFiles']['files'])} fichiers produit protégés** sont identiques à origin/main ({report['protectedProductFiles']['baseCommit'][:7]}), dont le catalogue, les accès et les prix. Les **{c['sourceLevelOneIndicesConserved']:,} indices de source L1** sont conservés ; les niveaux éditoriaux ne changent pas le lv qui détermine les droits historiques.",
        "", f"**{c['distinctEditorialVisualIds']} emplacements visuels** correspondent à **{report['visuals']['distinctAssetCells']} cases photo distinctes** dans **{len(report['visuals']['atlases'])} atlas** : empreintes, octets, dimensions, grilles et coordonnées vérifiés. Le registre indique **{report['visuals']['ownerApprovedThemeVisuals']} emplacements approuvés** et **{report['visuals']['themeVisualsAwaitingOwnerReview']} proposés** ; le contrôle ne juge pas l’adéquation visuelle de chacun.",
        "", "## Reproduire", "",
        "    python3 -B tools/maquette-guidee/check_levels_independent.py --write-report --require-visuals --strict-editorial --require-no-held",
        "    python3 -B tools/maquette-guidee/check_levels_independent.py --check-report --require-visuals --strict-editorial --require-no-held --self-test", "",
        "Les contre-exemples en mémoire incluent une phonétique changée, une source dupliquée, un mauvais champ, un rappel avant préparation, une réserve productive, un import exclu, un mot injecté dans une situation, une révision future ou de mauvaise famille, un compteur gonflé et une séparation fictive d’un concept M/F. Le contrôle ne remplace pas une écoute ou un essai avec apprenants ; Claude intervient seulement pour les phonétiques nouvelles. Aucune publication n’est approuvée.", "",
    ]
    return re.sub(r"(?<=\d),(?=\d{3}\b)", " ", "\n".join(lines))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--base-ref", default="origin/main")
    parser.add_argument("--write-report", action="store_true")
    parser.add_argument("--check-report", action="store_true")
    parser.add_argument("--require-visuals", action="store_true")
    parser.add_argument("--strict-editorial", action="store_true")
    parser.add_argument("--require-no-held", action="store_true")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    try:
        pack = read_pack(args.root.resolve())
        result = check_pack(pack)
        adverse = adversarial_checks(pack) if args.self_test else None
        result.update({"version": 1, "checker": "independent-no-generator-import", "date": pack["plan"]["date"],
                       "sourceIntegrity": "pass", "publicationApproved": False, "doesNotMeasureAcquisition": True,
                       "visuals": check_visuals(pack, args.require_visuals),
                       "protectedProductFiles": protected_files(pack["root"], args.base_ref),
                       "inputSha256": dict(sorted(pack["fingerprints"].items()))})
        runtime_hashes = {path: checksum for path, checksum in result["inputSha256"].items()
                          if path.startswith(DATA_ROOT + "/")}
        result["runtimeManifestSha256"] = runtime_hashes[DATA_ROOT + "/manifest.json"]
        result["runtimeBundleSha256"] = digest(canonical(runtime_hashes))
        result["runtimeBundleHashMethod"] = "sha256(JSON(sorted relative-path -> sha256-file, compact separators))"
        result["checkerSha256"] = digest(Path(__file__).read_bytes())
        for relative, checksum in pack["fingerprints"].items():
            require(digest((pack["root"] / relative).read_bytes()) == checksum,
                    "Inputs changed during verification; rerun: " + relative)
        if args.strict_editorial:
            require(result["checks"]["plannedPrerequisitesStillUnclosed"] == 0,
                    "A primary-late prerequisite still lacks prior local preparation")
        if args.require_no_held:
            require(result["checks"]["heldCanonicalPhrases"] == 0 and result["checks"]["heldThemes"] == 0,
                    "The owner-requested zero-held density goal is not met")
        result["editorialProgression"] = (
            "structural-order-still-open" if result["checks"]["plannedPrerequisitesStillUnclosed"]
            else "structural-links-ordered-lexical-and-reserve-closure-unvalidated"
        )
        outputs = {
            REVIEW_ROOT + "/verification-independante.json": json.dumps(result, ensure_ascii=False, indent=2) + "\n",
            REVIEW_ROOT + "/verification-independante.md": markdown(result),
        }
        if args.write_report:
            for relative, content in outputs.items():
                (pack["root"] / relative).write_text(content)
        if args.check_report:
            for relative, content in outputs.items():
                require((pack["root"] / relative).is_file() and (pack["root"] / relative).read_text() == content,
                        "Independent report is stale: " + relative)
        print(json.dumps({"sourceIntegrity": result["sourceIntegrity"], "checks": result["checks"],
                          "visuals": result["visuals"]["status"], "editorialProgression": result["editorialProgression"]}))
        if adverse is not None:
            print(json.dumps({"adversarialFaultsRejected": len(adverse), "adversarialChecks": adverse}, ensure_ascii=False))
        return 0
    except (VerificationError, OSError, ValueError, KeyError, subprocess.CalledProcessError) as error:
        print("Independent verification failed: " + str(error), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

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
    }
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
    expected = {root / DATA_ROOT / "manifest.json"} | {
        root / DATA_ROOT / pair / f"L{level}.json" for pair in PAIR_LANGUAGES for level in range(1, 11)
    }
    actual = set((root / DATA_ROOT).rglob("*.json"))
    require(actual == expected, "Runtime directory must contain exactly manifest + 70 level cells")
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
    return pack


def check_pack(pack):
    decks, manifest, decisions, enrichment, plan = (
        pack[k] for k in ("decks", "manifest", "decisions", "enrichments", "plan")
    )
    require(set(decks) == {study for native, study in PAIR_LANGUAGES.values()}, "Unexpected source deck set")
    require(sum(map(len, decks.values())) == 32115, "Classic source catalogue count changed")
    require(manifest.get("publicationApproved") is False, "Manifest must remain unapproved for production")
    require(manifest.get("doesNotMeasureAcquisition") is True, "Manifest overclaims learner acquisition")
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
    require(len(visual_cells) == 220, "Expected 220 independently declared theme/reserve visual slots")
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
                require(item["lexicalClass"] in {"adjective", "preposition", "adverb", "other", "uncertain"}
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

    # Preparation steps may point to another theme's canonical source record in
    # the same cell. They must not create a second primary card or copy its text.
    canonical_in_cell = {
        key: {phrase["id"]: phrase for phrase in ([p for theme in cell["themes"] for p in theme["phrases"]] + cell["reserve"])}
        for key, cell in pack["cells"].items()
    }

    catalogue_seen = {pair: set() for pair in PAIR_LANGUAGES}
    imports_seen, phrase_ids, step_ids = set(), set(), set()
    positions, pair_reports = {}, []
    copied_fields = imported_fields = step_count = template_count = l1_count = preparation_steps = 0
    local_support, local_orders, all_phrases = {}, [], {}
    active_count = reserved_count = situation_step_count = lexical_step_count = 0
    for pair_manifest in manifest["pairs"]:
        pair = pair_manifest["id"]
        native, study = PAIR_LANGUAGES[pair]
        require((pair_manifest["nativeLanguage"], pair_manifest["studyLanguage"]) == (native, study), "Pair language identity differs")
        expected_fields = field_map(study)
        require(len(pair_manifest["levels"]) == 10, "Pair lacks ten levels")
        require({level["level"] for level in pair_manifest["levels"]} == set(range(1, 11)), "Pair level list duplicated or missing")
        catalogue_count = import_count = presented_count = pair_reserved_count = 0
        pair_types, pair_lexical_types = Counter(), Counter()
        source_l1_indices = {i for i, card in enumerate(decks[study]) if card["lv"] == 1}
        for level_metadata in pair_manifest["levels"]:
            number = level_metadata["level"]
            require(level_metadata["dataPath"] == f"content/niveaux-progressifs/{pair}/L{number}.json", "Unexpected cell path")
            cell = pack["cells"][(pair, number)]
            require((cell["pairId"], cell["nativeLanguage"], cell["studyLanguage"], cell["level"]) == (pair, native, study, number), "Cell identity differs")
            require(len(cell["themes"]) == level_metadata["themeCount"], "Theme count differs from manifest")
            cell_count = 0
            cell_types, cell_lexical_types = Counter(), Counter()
            reserve_theme = {"id": None, "domain": "reserve", "phrases": cell["reserve"],
                             "isTemplateCollection": False, "sequences": [], "totalPhrases": len(cell["reserve"])}
            require(all(isinstance(item, dict) for item in cell["reserve"]), "Malformed reserve record")
            for theme_position, theme in enumerate([*cell["themes"], reserve_theme]):
                is_reserve = theme["id"] is None
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
                        require(number == (decision["proposedLevel"] if decision else card["lv"]), "Unexpected editorial level reassignment")
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
                            require(phrase["lexicalClass"] == annotation["lexicalClass"]
                                    and phrase["semanticReview"]["lexicalClassReason"] == annotation["lexicalClassReason"]
                                    and phrase["semanticReview"]["lexicalClassStatus"] == annotation["lexicalClassReviewStatus"],
                                    "Runtime lexical class or rationale differs")
                            prioritized = {"adjective": "vocab-adjectifs", "preposition": "vocab-prepositions", "adverb": "vocab-adverbes"}.get(phrase["lexicalClass"])
                            require(not prioritized or theme["domain"] == prioritized, "Specialized lexical class lost its primary theme priority")
                        else:
                            require("lexicalClass" not in phrase, "A non-vocabulary phrase carries a lexical class")
                        positions[(pair, index)] = (number, theme_position, phrase_position, theme["id"])
                        catalogue_count += 1
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
                    if phrase["isTemplate"]:
                        template_count += 1
                require(len(phrases) == theme["totalPhrases"] and (is_reserve or len(phrases) > 0), "Empty or miscounted runtime theme")
                assigned_to_sequences = []
                for sequence in theme["sequences"]:
                    ids = sequence["phraseIds"]
                    require(1 <= len(ids) <= 5 and len(ids) == len(set(ids)), "Invalid internal practice group")
                    require(set(ids) <= set(phrases), "Sequence refers to a phrase outside its theme")
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
                            phrase = phrases[target]
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
                        expected = ["understand"] if phrases[identity]["isTemplate"] or theme["isTemplateCollection"] else ["understand", "imitate", "choose-and-recall"]
                        require(stages == expected, "A primary card omits, repeats, or reorders its learning stages")
                    for primary_id, order in preparation_positions.items():
                        local_orders.append({"pair": pair, "sourceIndex": phrases[primary_id]["source"]["sourceIndex"],
                                             "sequenceId": sequence["id"], "order": order})
                require(is_reserve or len(assigned_to_sequences) == len(phrases) and set(assigned_to_sequences) == set(phrases), "Practice groups omit or duplicate an active phrase")
                cell_count += len(phrases)
            require(cell_count == cell["totalCanonicalPhrases"] == level_metadata["totalCanonicalPhrases"], "Cell canonical count differs")
            require(cell["reservedPhrases"] == level_metadata["reservedPhrases"] == len(cell["reserve"]), "Cell reserve count differs")
            require(cell["totalPhrases"] == level_metadata["totalPhrases"] == cell_count - len(cell["reserve"]), "Cell active count differs")
            require(dict(cell_types) == {key: value for key, value in cell["counts"].items() if value}, "Cell semantic counts differ")
            require(dict(cell_lexical_types) == cell["lexicalClassCounts"] == level_metadata["lexicalClassCounts"], "Cell lexical-class counts differ")
            pair_types.update(cell_types)
            pair_lexical_types.update(cell_lexical_types)
            pair_reserved_count += len(cell["reserve"])
            presented_count += cell["totalPhrases"]
        require(catalogue_seen[pair] == set(range(len(decks[study]))), "Missing or added classic source indices")
        require(source_l1_indices <= catalogue_seen[pair], "A historically L1 source card disappeared")
        require(catalogue_count == pair_manifest["totalCataloguePhrases"] == len(decks[study]), "Classic total differs from manifest")
        require(presented_count == pair_manifest["totalPhrases"] == catalogue_count + import_count - pair_reserved_count, "Active total differs from manifest")
        require(pair_manifest["totalCanonicalPhrases"] == catalogue_count + import_count and pair_manifest["reservedPhrases"] == pair_reserved_count, "Pair canonical/reserve totals differ")
        require(dict(pair_types) == {k: v for k, v in pair_manifest["counts"].items() if v}
                and dict(pair_lexical_types) == pair_manifest["lexicalClassCounts"], "Pair semantic totals differ")
        l1_count += len(source_l1_indices)
        pair_reports.append({"pair": pair, "catalogueCards": catalogue_count, "importedWholePhrases": import_count,
                             "historicalSourceL1IndicesConserved": len(source_l1_indices), "levelCells": 10,
                             "activePhrases": presented_count, "reservedPhrases": pair_reserved_count,
                             "counts": dict(pair_types), "lexicalClassCounts": dict(pair_lexical_types)})
    require(imports_seen == set(runtime_imports), "A declared enrichment was omitted")
    require(copied_fields == 110277 and imported_fields == 150, "Unexpected source-field comparison count")
    require(l1_count == 2134, "Historic raw L1 set differs")
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
        if source["collection"] == "conversation":
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
            "sourceLevelsNotIndividuallyReviewed": 32115 - len(move_map),
            "importedWholePhrases": len(imports_seen), "importedFieldsCompared": imported_fields,
            "excludedEnrichmentsAbsent": len(held_imports), "immutableSnapshotsComparedToGit": len(pack["snapshots"]),
            "templatesWithoutProduction": template_count, "stepsChecked": step_count,
            "activePhrases": active_count, "reservedPhrasesRetainedWithoutSteps": reserved_count,
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
            and len(registry["grammarAtlases"]) == 3, "Expected 10 situation, 5 vocabulary and 3 lexical-class atlases")
    records = registry["levels"] + registry["vocabularyAtlases"] + registry["grammarAtlases"]
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
        scope = atlas.get("levels", [atlas.get("level")])
        require(theme["level"] in scope, "Theme uses another level's atlas")
        cell = (theme["asset"], theme["column"], theme["row"])
        require(cell not in cells, "Distinct themes reuse the same physical photo cell")
        cells.add(cell)
    require(registered == set(expected) and len(registered) == 220, "Visual registry does not cover exactly 220 situation/reserve/lexical slots")
    pending = any(item["status"] == "pending" for item in result)
    return {"status": "pending" if pending else "all-eighteen-atlases-present", "atlases": result,
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
                 lexical_reuse_in_situation_steps]
    if any(s.get("preparationIds") for c in pack["cells"].values() for t in c["themes"] for s in t["sequences"]):
        mutations.append(late_preparation)
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
    lines = [
        "# Vérification indépendante des niveaux et types de contenu", "",
        "Le contrôle relit le catalogue, les sept partitions sémantiques, les 70 cellules, les décisions, les instantanés conversation et le registre photo. Il n’importe aucun générateur et ne répare aucune donnée.", "",
        "## Sources, actifs et réserve", "",
        "| Couple | Catalogue exact | Imports entiers | Actifs | Réserve | Indices L1 historiques |",
        "|---|---:|---:|---:|---:|---:|",
    ]
    for pair in report["pairs"]:
        lines.append(f"| {pair['pair']} | {pair['catalogueCards']} | {pair['importedWholePhrases']} | {pair['activePhrases']} | {pair['reservedPhrases']} | {pair['historicalSourceL1IndicesConserved']} |")
    lines += [
        "", f"**{c['catalogueCardsRetainedExactlyOnce']:,} cartes classiques** existent exactement une fois, dans les thèmes actifs ou dans la réserve. **{c['catalogueFieldsCompared']:,} champs** étudiés, natifs, phonétiques et lectures sont identiques aux sources. Les **{c['importedWholePhrases']} imports entiers / {c['importedFieldsCompared']} champs** sont identiques aux sept instantanés comparés à leur commit source ; les **{c['excludedEnrichmentsAbsent']} imports écartés** sont absents.",
        "", f"Le bundle contient **{c['activePhrases']:,} entrées actives** et **{c['reservedPhrasesRetainedWithoutSteps']} réservées**, soit 32 158 sources canoniques. La réserve ne reçoit aucune étape de leçon. Le catalogue classique et ses droits restent accessibles par leur code existant, inchangé.",
        "", "L’aide francophone provient de pf en anglais/espagnol/italien/japonais/coréen et phf en chinois ; le lecteur sinophone reçoit phon et cn. py sert uniquement de lecture complémentaire quand il existe. Aucun collage ou calcul phonétique n’est autorisé.",
        "", "## Partition sémantique et entraînement", "",
        f"La partition du catalogue compte **{source_types['utterance']:,} énoncés**, **{source_types['vocabulary']:,} éléments de vocabulaire**, **{source_types['number']} nombres**, **{source_types['incomplete']} formes incomplètes** et **{source_types['review']} réserves de sens**. Chaque indice a exactement une affectation et l’empreinte exacte de son deck.",
        "", "Les situations ne contiennent que des énoncés ; le vocabulaire et les nombres ont leurs thèmes distincts. Les classes adjective/preposition/adverb ont priorité sur les familles maison/restaurant/etc, sans duplication principale. La correspondance entre annotation et exécution est contrôlée ; l’annotation elle-même reste candidate à une relecture sémantique.",
        "", f"Les **{c['stepsChecked']:,} étapes** se répartissent en **{c['situationSteps']:,} étapes de situations** et **{c['lexicalSteps']:,} étapes lexicales**. Chaque rappel cite une compréhension puis une imitation réellement antérieures dans son groupe. Les sources réservées ne sont jamais référencées par ces étapes.",
        "", f"**{c['reviewedSourceTemplateExceptions']} exceptions nominatives bornées** neutralisent des faux marqueurs de modèle sans toucher à la source (dont an X-ray). Les **{c['templatesWithoutProduction']} autres marqueurs de modèle** restent hors production. Une exception contenant un véritable emplacement est refusée.",
        "", "## Liens prévus : ordre vérifié et limites", "",
        f"Sur **{c['plannedPrerequisiteLinks']} liens déclarés**, **{c['structuralUtteranceLinks']} relient deux énoncés**. Parmi ces derniers, **{c['structuralUtteranceLinksPrimaryLate']}** ont une présentation primaire tardive et sont tous préparés localement avant leur cible : **{c['localPreparationReferences']} références / {c['distinctLocallyPreparedSources']} sources / {c['localPreparationSteps']} étapes**, sans deuxième carte principale. Le nombre de liens entre énoncés sans fermeture d’ordre est **{c['plannedPrerequisitesStillUnclosed']}**.",
        "", f"Les **{c['lexicalPrerequisiteLinks']} liens lexicaux** sont comptés à part ; **{c['plannedLexicalReuseReferences']} références** à des mots/nombres d’un niveau égal ou antérieur figurent sur leurs phrases cibles. Ces mots ne sont jamais injectés dans les étapes de situation. Leur présence dans un autre thème ne prouve pas qu’ils ont été étudiés.",
        "", f"**{c['reservedPrerequisiteLinks']} liens impliquent une réserve** sur au moins une extrémité ; **{c['otherNonUtterancePrerequisiteLinks']}** ont une autre cible non phrastique. **{c['activeUtteranceDependenciesOnReservedSources']} phrase active dépend encore d’une source réservée**. La fermeture globale des prérequis est donc explicitement non validée.", "",
    ]
    for gap in report["reservedPrerequisiteGaps"]:
        lines.append(f"- {gap['pair']} : carte {gap['sourceIndex']} ← {gap['prerequisiteSourceIndex']} ({gap['contentType']}) ; source réservée, jamais exercée.")
    lines += [
        "", "Le seul lien supprimé est fr-zh 245 ← 2168 : 是 signifie dans sa carte source « oui / c’est ça », ce qui ne prépare pas son emploi de copule. La revue originale et l’adjudication restent traçables ; aucun autre lien n’est effacé.",
        "", f"**{c['explicitPlacementProposals']} placements** sont proposés individuellement ; les **{c['sourceLevelsNotIndividuallyReviewed']:,} autres** restent au niveau source sans validation individuelle revendiquée. Ni une copie exacte, ni une affectation de type, ni un ordre prévu ne démontrent la progressivité L1–L10 ou une acquisition.",
        "", "## Droits, prix et photos", "",
        f"Les **{len(report['protectedProductFiles']['files'])} fichiers produit protégés** sont identiques à origin/main ({report['protectedProductFiles']['baseCommit'][:7]}), dont app.html et les fonctions de compte, accès et prix. Les **{c['sourceLevelOneIndicesConserved']:,} indices de source L1** sont conservés. Les nouveaux niveaux éditoriaux doivent rester distincts du lv qui détermine l’accès historique.",
        "", f"**{c['distinctEditorialVisualIds']} emplacements visuels** et **{report['visuals']['distinctAssetCells']} cases photo physiques distinctes** sont vérifiés dans **{len(report['visuals']['atlases'])} atlas**. Les empreintes, octets, dimensions, grilles et coordonnées correspondent au registre. **{report['visuals']['ownerApprovedThemeVisuals']} emplacements sont signalés approuvés** et **{report['visuals']['themeVisualsAwaitingOwnerReview']} proposés** ; l’adéquation de chaque image reste une question visuelle.",
        "", "## Reproduire", "",
        "    python3 -B tools/maquette-guidee/check_levels_independent.py --write-report --require-visuals --strict-editorial",
        "    python3 -B tools/maquette-guidee/check_levels_independent.py --check-report --require-visuals --strict-editorial --self-test", "",
        "strict-editorial exige ici la fermeture d’ordre des seuls liens énoncé→énoncé. Il ne transforme pas les liens lexicaux ou réservés en acquis. Les dix fautes adverses en mémoire couvrent la phonétique, le niveau, une identité dupliquée, le champ phonétique, le rappel, la production d’une réserve, un import exclu, un mot injecté dans un thème de situation, un mot inséré par une préparation et une préparation après sa cible.",
        "", "Ce contrôle ne remplace ni Claude pour la méthode phonétique, ni une relecture native, ni un essai avec apprenants. Aucune publication n’est approuvée par ce rapport.", "",
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
        for relative, checksum in pack["fingerprints"].items():
            require(digest((pack["root"] / relative).read_bytes()) == checksum,
                    "Inputs changed during verification; rerun: " + relative)
        if args.strict_editorial:
            require(result["checks"]["plannedPrerequisitesStillUnclosed"] == 0,
                    "A primary-late prerequisite still lacks prior local preparation")
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

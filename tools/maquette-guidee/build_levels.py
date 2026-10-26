#!/usr/bin/env python3
"""Build a separate L1-L10 editorial preview, preserving every source string.

This never writes app.html, source lv fields, the approved L1 mockup, or access
rules. A source level is retained by default; explicitly sourced decisions form
a reviewable overlay, not a claim that all catalogue levels are now validated.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
import hashlib
import heapq
import importlib.util
import json
import math
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[2]
APP = ROOT / "melunga_deploy/app.html"
PLAN = ROOT / "docs/niveaux-progressifs/plan-themes.json"
DECISIONS = ROOT / "docs/niveaux-progressifs/decisions.json"
ENRICHMENTS = ROOT / "docs/niveaux-progressifs/enrichissements.json"
CONTENT_TYPES = ROOT / "docs/niveaux-progressifs/types-contenu"
VOCABULARY_POLICY = ROOT / "docs/niveaux-progressifs/politique-vocabulaire-phrases.json"
VISUALS = ROOT / "docs/niveaux-progressifs/visuels.json"
CORRECTIONS = ROOT / "docs/niveaux-progressifs/corrections-themes"
LEXICAL_INTRODUCTIONS = CORRECTIONS / "introductions-lexicales.json"
NUMBER_INTRODUCTIONS = CORRECTIONS / "introductions-nombres.json"
PHRASE_INTRODUCTIONS = CORRECTIONS / "introductions-phrases-L1.json"
INTRODUCTION_COMPLEMENT = CORRECTIONS / "introductions-lexicales-complement.json"
RELATION_INTRODUCTIONS = CORRECTIONS / "introductions-relations-zh.json"
RELATION_PROGRESSION = CORRECTIONS / "introductions-relations-zh-progression.json"
AUTHORED = CORRECTIONS / "enrichissements-rediges.json"
DENSITY_POLICY = CORRECTIONS / "politique-densite.json"
OWNER_APPROVED_TEMPLATE_EXCEPTIONS = {
    ("fr-en", 3463), ("fr-ja", 2985), ("fr-ko", 2138),
    *(('zh-fr', index) for index in (2902, 3046, 3140, 3193, 3201, 3245, 3292, 3321)),
}
ADJECTIVE_CONCEPT_ORDER = ("grand", "petit", "gros", "beau", "léger", "lourd", "triste", "heureux")
OUTPUT = ROOT / "melunga_deploy/content/niveaux-progressifs"
REPORT = ROOT / "docs/niveaux-progressifs/classement.json"
DOC = ROOT / "docs/niveaux-progressifs/classement.md"
LEGACY = Path(__file__).with_name("build_data.py")
spec = importlib.util.spec_from_file_location("approved_l1_builder", LEGACY)
legacy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(legacy)
_situation_spec = importlib.util.spec_from_file_location("separate_situation_content", Path(__file__).with_name("situation_content.py"))
situation_content = importlib.util.module_from_spec(_situation_spec)
_situation_spec.loader.exec_module(situation_content)
_phonetic_spec = importlib.util.spec_from_file_location("audited_phonetic_corrections", Path(__file__).with_name("phonetic_corrections.py"))
phonetic_corrections = importlib.util.module_from_spec(_phonetic_spec)
_phonetic_spec.loader.exec_module(phonetic_corrections)
_reviewed_fields_spec = importlib.util.spec_from_file_location("audited_reviewed_field_corrections", Path(__file__).with_name("reviewed_field_corrections.py"))
reviewed_field_corrections = importlib.util.module_from_spec(_reviewed_fields_spec)
_reviewed_fields_spec.loader.exec_module(reviewed_field_corrections)
_lot4_spec = importlib.util.spec_from_file_location("audited_lot4_corrections", Path(__file__).with_name("lot4_corrections.py"))
lot4_corrections = importlib.util.module_from_spec(_lot4_spec)
_lot4_spec.loader.exec_module(lot4_corrections)
_lot5_spec = importlib.util.spec_from_file_location("audited_lot5_corrections", Path(__file__).with_name("lot5_corrections.py"))
lot5_corrections = importlib.util.module_from_spec(_lot5_spec)
_lot5_spec.loader.exec_module(lot5_corrections)
_lot6_spec = importlib.util.spec_from_file_location("audited_lot6_corrections", Path(__file__).with_name("lot6_corrections.py"))
lot6_corrections = importlib.util.module_from_spec(_lot6_spec)
_lot6_spec.loader.exec_module(lot6_corrections)
_lot7_spec = importlib.util.spec_from_file_location("audited_lot7_corrections", Path(__file__).with_name("lot7_corrections.py"))
lot7_corrections = importlib.util.module_from_spec(_lot7_spec)
_lot7_spec.loader.exec_module(lot7_corrections)
_lot8_spec = importlib.util.spec_from_file_location("audited_lot8_corrections", Path(__file__).with_name("lot8_corrections.py"))
lot8_corrections = importlib.util.module_from_spec(_lot8_spec)
_lot8_spec.loader.exec_module(lot8_corrections)
_lot9_spec = importlib.util.spec_from_file_location("audited_lot9_corrections", Path(__file__).with_name("lot9_corrections.py"))
lot9_corrections = importlib.util.module_from_spec(_lot9_spec)
_lot9_spec.loader.exec_module(lot9_corrections)
_english_classification_spec = importlib.util.spec_from_file_location("audited_english_classification", Path(__file__).with_name("english_classification.py"))
english_classification = importlib.util.module_from_spec(_english_classification_spec)
_english_classification_spec.loader.exec_module(english_classification)


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def sha(value):
    return hashlib.sha256(canonical(value)).hexdigest()


def file_sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def ensure(condition, message):
    if not condition:
        raise ValueError(message)


def source_level(value):
    return type(value) is int and 1 <= value <= 10


def localize(value, language):
    ensure(isinstance(value, dict), "Expected localized title")
    text = value.get(language, value.get("fr"))
    ensure(isinstance(text, str) and bool(text.strip()), "Empty localized title")
    return text


def field_map(study):
    result = {"study": "t", "native": "cn" if study == "fr" else "frm",
              "phon": "phon" if study == "fr" else "phf" if study == "zh" else "pf"}
    if study in ("zh", "ja", "ko"):
        result["reading"] = "py"
    return result


def copied_fields(source, mapping, location):
    result = {}
    for output, original in mapping.items():
        ensure(isinstance(source.get(original), str) and bool(source[original].strip()),
               f"Missing source field {original} at {location}")
        result[output] = source[original]
    return result


def explicit_template(card):
    return bool(card.get("cat") == "template"
                or card.get("pedagogicalStatus") == "modele-a-completer"
                or re.search(r"\{[\w-]+\}|_{2,}", card.get("t", "")))


def phrase_key(phrase):
    # Missing and empty reading are distinct. No punctuation or phonetic
    # normalization is permitted when recognizing a catalogue bridge.
    return tuple(phrase.get(name) for name in ("study", "native", "phon", "reading"))


def checked_content_types(decks, pairs):
    """Load an explicit source partition; never infer speech from word counts.

    The semantic annotations are review candidates, not a claim of native
    approval. Every original card still has exactly one canonical destination.
    A declared source frame cannot become a production exercise by annotation.
    """
    result, sources = {}, []
    allowed_types = {"utterance", "vocabulary", "number", "incomplete", "review"}
    allowed_reviews = {"rule-based-candidate", "reviewed"}
    for pair_id, (_native, study, *_rest) in pairs.items():
        path = CONTENT_TYPES / f"{pair_id}.json"
        ensure(path.is_file(), f"Missing semantic source partition: {pair_id}")
        raw_document = path.read_bytes()
        document = json.loads(raw_document)
        ensure(type(document.get("version")) is int and document["version"] == 1 and document.get("pair") == pair_id
               and document.get("studyLanguage") == study,
               f"Wrong semantic partition contract: {pair_id}")
        ensure(document.get("sourceDeckSha256") == sha(decks[study]),
               f"Semantic partition belongs to another source deck: {pair_id}")
        assignments = document.get("assignments")
        ensure(isinstance(assignments, list), f"Invalid semantic partition: {pair_id}")
        seen = set()
        for assignment in assignments:
            ensure(isinstance(assignment, dict), f"Invalid semantic assignment: {pair_id}")
            index = assignment.get("sourceIndex")
            ensure(type(index) is int and 0 <= index < len(decks[study]) and index not in seen,
                   f"Repeated or invalid semantic source index: {pair_id}:{index}")
            seen.add(index)
            ensure(assignment.get("contentType") in allowed_types,
                   f"Unknown semantic source type: {pair_id}:{index}")
            ensure(assignment.get("reviewStatus") in allowed_reviews,
                   f"Unknown semantic review status: {pair_id}:{index}")
            ensure(isinstance(assignment.get("reason"), str) and assignment["reason"].strip(),
                   f"Missing semantic source rationale: {pair_id}:{index}")
            if "sourceSha256" in assignment:
                ensure(assignment["sourceSha256"] == sha(decks[study][index]), "Semantic decision source index/hash mismatch")
            for output, original in field_map(study).items():
                if output in assignment:
                    ensure(assignment[output] == decks[study][index][original], "Semantic decision copied field mismatch")
            if assignment["contentType"] == "vocabulary":
                ensure(assignment.get("lexicalClass") in {"adjective", "preposition", "adverb", "color", "other", "uncertain"}
                       and assignment.get("lexicalClassReviewStatus") in allowed_reviews
                       and isinstance(assignment.get("lexicalClassReason"), str) and assignment["lexicalClassReason"].strip(),
                       f"Missing or invalid explicit lexical class: {pair_id}:{index}")
            else:
                ensure("lexicalClass" not in assignment,
                       f"A non-vocabulary entry declares a lexical class: {pair_id}:{index}")
            for key, required_type in (("lexicalFamilyOverride", "vocabulary"), ("situationDomainOverride", "utterance")):
                if key in assignment:
                    ensure(assignment["contentType"] == required_type and assignment["reviewStatus"] == "reviewed"
                           and isinstance(assignment[key], str) and assignment[key]
                           and isinstance(assignment.get(key + "Reason", assignment.get("reason")), str)
                           and assignment.get(key + "Reason", assignment.get("reason")).strip(),
                           f"Unreviewed or inconsistent semantic destination override: {pair_id}:{index}")
            exception = assignment.get("sourceTemplateException") is True
            if exception:
                ensure((pair_id, index) in OWNER_APPROVED_TEMPLATE_EXCEPTIONS
                       and assignment["reviewStatus"] == "reviewed"
                       and explicit_template(decks[study][index])
                       and not re.search(r"\{[\w-]+\}|_{2,}", decks[study][index]["t"]),
                       f"Unapproved or open-frame source exception: {pair_id}:{index}")
            ensure(not explicit_template(decks[study][index]) or exception
                   or assignment["contentType"] in {"incomplete", "review"},
                   f"An explicit source frame cannot enter active training: {pair_id}:{index}")
            result[(pair_id, index)] = assignment
        ensure(seen == set(range(len(decks[study]))),
               f"Semantic assignments are not an exact source partition: {pair_id}")
        sources.append({"pair": pair_id, "file": str(path.relative_to(ROOT)),
                        "fileSha256": hashlib.sha256(raw_document).hexdigest(), "sourceDeckSha256": sha(decks[study]),
                        "status": document.get("status"),
                        "counts": dict(sorted(Counter(item["contentType"] for item in assignments).items())),
                        "reviewStatusCounts": dict(sorted(Counter(item["reviewStatus"] for item in assignments).items()))})
    return result, sources


def checked_vocabulary_policy():
    ensure(VOCABULARY_POLICY.is_file(), "Missing explicit vocabulary routing policy")
    policy = json.loads(VOCABULARY_POLICY.read_text())
    ensure(type(policy.get("version")) is int and policy["version"] == 1, "Unsupported vocabulary policy")
    families = policy.get("lexicalFamilies")
    ensure(isinstance(families, list) and len(families) >= 10, "Missing declared lexical families")
    family_ids = [item.get("id") for item in families]
    ensure(len(set(family_ids)) == len(family_ids), "Duplicate lexical family")
    definitions = policy.get("themeDefinitions")
    ensure(isinstance(definitions, list) and len(definitions) == len(family_ids) + 1, "Expected each lexical family and Numbers")
    for definition in definitions:
        ensure(definition.get("contentType") in {"vocabulary", "number"}, "Unknown lexical theme type")
        ensure(definition.get("domain") in set(family_ids + ["nombres"]), "Unknown lexical theme domain")
        ensure(isinstance(definition.get("idPattern"), str) and "{level}" in definition["idPattern"], "Missing lexical theme ID pattern")
        ensure(isinstance(definition.get("visualIdPattern"), str) and "{level}" in definition["visualIdPattern"], "Missing lexical visual ID pattern")
        localize(definition.get("title"), "fr")
        localize(definition.get("title"), "zh")
    ensure({item["domain"] for item in definitions} == set(family_ids + ["nombres"]), "Incomplete lexical destinations")
    return policy


def lexical_family(card, study, old_domain, policy, source_index, semantic):
    """Route a typed lexeme by declared semantic signals, with a traced fallback.

    This does not decide whether an entry is a lexeme: the source-index semantic
    partition already made that decision. Family suggestions remain candidates.
    """
    families = {item["id"] for item in policy["lexicalFamilies"]}
    lexical_class = semantic.get("lexicalClass")
    by_class = policy.get("buildContract", {}).get("lexicalClassFamilyMap", {
        "adjective": "vocab-adjectifs", "preposition": "vocab-prepositions", "adverb": "vocab-adverbes", "color": "vocab-couleurs"})
    if "lexicalFamilyOverride" in semantic:
        destination = semantic["lexicalFamilyOverride"]
        ensure(destination in families, f"Unknown reviewed lexical destination: {destination}")
        ensure(lexical_class not in by_class or destination == by_class[lexical_class],
               "Reviewed lexical destination conflicts with the declared specialized lexical class")
        return destination, "reviewed-source-lexical-family-override"
    if lexical_class in by_class:
        ensure(by_class[lexical_class] in families, "Missing declared lexical-class family")
        return by_class[lexical_class], "explicit-source-lexical-class-candidate"
    for evidence in policy.get("sourceEvidence", []):
        if (evidence.get("collection") == f"DECKS.{study}"
                and evidence.get("sourceIndex") == source_index
                and evidence.get("proposedDestination") in families):
            ensure(evidence.get("sourceCardSha256") == sha(card), "Explicit lexical evidence changed")
            return evidence["proposedDestination"], "explicit-source-index-evidence"
    gloss = card["t"] if study == "fr" else card["frm"]
    normalized = legacy.normal(gloss)
    signals = policy.get("lexicalSignals", {})
    ensure(isinstance(signals, dict), "Invalid lexical signal map")
    # Dedicated semantic families take priority over a broad house/action
    # fallback. Explicit source-index decisions above always remain first.
    family_order = sorted(policy["lexicalFamilies"], key=lambda family: (
        0 if family["id"] in {"vocab-nature", "vocab-loisirs"} else 1,
        policy["lexicalFamilies"].index(family)))
    for family in family_order:
        patterns = signals.get(family["id"], [])
        ensure(isinstance(patterns, list) and all(isinstance(value, str) for value in patterns), "Invalid lexical semantic signals")
        if any(re.search(pattern, normalized) for pattern in patterns):
            return family["id"], "source-semantic-signal-candidate"
    destination = policy.get("domainDestinations", {}).get(old_domain)
    ensure(destination in families, f"No safe lexical destination for DECKS.{study}:{source_index}")
    return destination, "previous-domain-fallback-needs-review"


def level_definitions(plan_level, policy, additional_situations=None):
    level = plan_level["level"]
    definitions = [{**item, "contentType": "utterance", "section": "situations"}
                   for item in plan_level["themes"] if item["domain"] != "personnaliser"]
    for item in additional_situations or []:
        if item["level"] == level:
            definitions.append({**item, "id": item["themeId"], "contentType": "utterance", "section": "situations",
                                "isAdditionalSituation": True, "intentIds": [intent["id"] for intent in item["intents"]]})
    for item in sorted(policy["themeDefinitions"], key=lambda value: value.get("order", 0)):
        definitions.append({**item, "id": item["idPattern"].format(level=level),
                            "visualId": item["visualIdPattern"].format(level=level),
                            "section": "vocabulary", "optional": False})
    ensure(len({item["id"] for item in definitions}) == len(definitions), "Repeated active theme ID")
    return definitions


def checked_visuals():
    ensure(VISUALS.is_file(), "Missing source visual registry")
    registry = json.loads(VISUALS.read_text())
    result = {}
    for item in registry.get("themes", []):
        key = item.get("visualId")
        ensure(isinstance(key, str) and key not in result, "Repeated or missing registered visual ID")
        asset = item.get("asset")
        ensure(isinstance(asset, str) and asset.startswith("assets/")
               and (ROOT / "melunga_deploy" / asset).resolve().is_relative_to((ROOT / "melunga_deploy/assets").resolve())
               and (ROOT / "melunga_deploy" / asset).is_file(), f"Missing registered photograph: {key}")
        columns, rows = item.get("columns", 3), item.get("rows", 4)
        ensure(type(columns) is int and type(rows) is int and columns > 0 and rows > 0
               and type(item.get("column")) is int and 0 <= item["column"] < columns
               and type(item.get("row")) is int and 0 <= item["row"] < rows,
               f"Invalid registered photograph crop: {key}")
        result[key] = {"asset": asset, "column": item["column"], "row": item["row"],
                       "columns": columns, "rows": rows}
    return result


def read_inputs():
    app_raw = APP.read_bytes()
    line = next(line for line in app_raw.decode().splitlines() if line.startswith("var DECKS = "))
    decks = json.loads(line.split("=", 1)[1].strip().rstrip(";"))
    plan = json.loads(PLAN.read_text())
    ensure(isinstance(plan.get("levels"), list), "Missing level plan")
    ensure([item.get("level") for item in plan["levels"]] == list(range(1, 11)), "The plan must define L1-L10 in order")
    domains = plan.get("domains")
    ensure(isinstance(domains, list) and len(set(domains)) == len(domains), "Invalid plan domains")
    all_visual_ids = []
    for level in plan["levels"]:
        themes = level.get("themes")
        ensure(isinstance(themes, list), f"Missing themes at L{level['level']}")
        ensure(len({item.get("id") for item in themes}) == len(themes), "Duplicate theme ID")
        ensure({item.get("domain") for item in themes} == set(domains), "Each level must resolve every classification domain")
        ensure(len({item.get("domain") for item in themes}) == len(themes), "Duplicate domain within a level")
        for theme in themes:
            ensure(isinstance(theme.get("visualId"), str), "Missing visual ID")
            all_visual_ids.append(theme["visualId"])
            localize(theme.get("title"), "fr")
            localize(theme.get("title"), "zh")
    ensure(len(set(all_visual_ids)) == len(all_visual_ids), "Distinct themes must have distinct visual IDs")
    decisions = json.loads(DECISIONS.read_text()) if DECISIONS.exists() else {"moves": [], "enrichments": []}
    ensure(isinstance(decisions, dict) and isinstance(decisions.get("moves", []), list), "Invalid editorial decisions")
    enrichments = list(decisions.get("enrichments", []))
    if ENRICHMENTS.exists():
        enrichment_document = json.loads(ENRICHMENTS.read_text())
        ensure(isinstance(enrichment_document.get("items"), list), "Invalid enrichment document")
        enrichments.extend(enrichment_document["items"])
    ensure(isinstance(enrichments, list), "Invalid enrichment list")
    if "sourceDecksSha256" in decisions:
        ensure(decisions["sourceDecksSha256"] == sha(decks), "Decisions belong to a different catalogue")
    return app_raw, decks, plan, decisions, enrichments


def checked_moves(decisions, decks, known_pairs, domains):
    moves = {}
    for item in decisions.get("moves", []):
        pair_id = item.get("pair")
        ensure(pair_id in known_pairs, f"Unknown decision pair: {pair_id}")
        study = known_pairs[pair_id][1]
        index = item.get("sourceIndex")
        ensure(type(index) is int and 0 <= index < len(decks[study]), f"Invalid catalogue index in {pair_id}")
        key = (pair_id, index)
        ensure(key not in moves, f"Duplicate move for {pair_id}:{index}")
        ensure(source_level(item.get("sourceLevel")) and decks[study][index].get("lv") == item["sourceLevel"],
               f"Wrong source level for {pair_id}:{index}")
        ensure(source_level(item.get("proposedLevel")), f"Invalid editorial level for {pair_id}:{index}")
        ensure(isinstance(item.get("reason"), str) and bool(item["reason"].strip()), f"Missing move rationale for {pair_id}:{index}")
        ensure(item.get("domain", domains[0]) in domains, f"Unknown move domain for {pair_id}:{index}")
        prerequisites = item.get("plannedPrerequisiteIndices", [])
        ensure(isinstance(prerequisites, list) and len(prerequisites) == len(set(prerequisites)), "Invalid prerequisite list")
        ensure(all(type(value) is int and 0 <= value < len(decks[study]) and value != index for value in prerequisites),
               f"Invalid prerequisite reference for {pair_id}:{index}")
        if "sourceSha256" in item:
            ensure(item["sourceSha256"] == sha(decks[study][index]), f"Move source text changed for {pair_id}:{index}")
        for output, original in field_map(study).items():
            if output in item:
                ensure(item[output] == decks[study][index].get(original),
                       f"Move annotation does not match {output} at {pair_id}:{index}")
        moves[key] = item
    return moves


def checked_introductions(path, decks, pairs, semantic_types):
    if not path.exists():
        return []
    document = json.loads(path.read_text())
    ensure(isinstance(document.get("items"), list), f"Invalid introduction overlay: {path.name}")
    if "sourceDecksSha256" in document:
        ensure(document["sourceDecksSha256"] == sha(decks), f"Introduction overlay belongs to another catalogue: {path.name}")
    result, seen = [], set()
    for item in document["items"]:
        pair, index = item.get("pair"), item.get("sourceIndex")
        ensure(pair in pairs, f"Unknown introduction pair: {pair}")
        study = pairs[pair][1]
        ensure(type(index) is int and 0 <= index < len(decks[study]) and (pair, index) not in seen,
               f"Repeated or invalid introduction index: {pair}:{index}")
        seen.add((pair, index))
        card = decks[study][index]
        ensure(source_level(item.get("sourceLevel")) and item["sourceLevel"] == card.get("lv") and source_level(item.get("proposedLevel"))
               and item.get("sourceSha256") == sha(card), f"Introduction source identity changed: {pair}:{index}")
        ensure(isinstance(item.get("reason"), str) and item["reason"].strip(), "Missing introduction rationale")
        for output, original in field_map(study).items():
            if output == "reading" and output not in item:
                continue  # The whole-card hash still binds the original reading.
            ensure(item.get(output) == card.get(original), f"Introduction rewrites source {output}: {pair}:{index}")
        expected_type = ("number" if path == NUMBER_INTRODUCTIONS else "utterance" if path == PHRASE_INTRODUCTIONS
                         else item.get("contentType", "vocabulary") if path == INTRODUCTION_COMPLEMENT else "vocabulary")
        ensure(expected_type in {"utterance", "vocabulary", "number"}, "Invalid introduction semantic type")
        ensure(semantic_types[(pair, index)]["contentType"] == expected_type,
               f"Introduction disagrees with source semantic type: {pair}:{index}")
        if expected_type == "number":
            ensure(item.get("contentType", "number") == "number" and isinstance(item.get("numberOrder"), list)
                   and len(item["numberOrder"]) == 2
                   and all(type(value) in (int, float) and math.isfinite(value) and value >= 0 for value in item["numberOrder"])
                   and item.get("numberKind") in {"cardinal", "ordinal", "fraction", "approximate-quantity", "collective-quantity", "multiplier"},
                   "Invalid whole-number order")
        result.append({**item, "overlayFile": str(path.relative_to(ROOT)), "overlaySha256": file_sha(path)})
    return result


def authored_phrase(item, pairs, policy):
    pair = item.get("pair")
    ensure(pair in pairs and isinstance(item.get("id"), str) and item["id"], "Invalid authored entry identity")
    ensure(item.get("contentType") in {"vocabulary", "number"} and source_level(item.get("proposedLevel")), "Invalid authored entry type or level")
    ensure(item.get("editorialReviewStatus") == "reviewed" and item.get("phoneticReviewStatus") == "pending-Claude",
           "Authored material must retain explicit pending phonetic review")
    fields = copied_fields(item, {name: name for name in ("study", "native", "phon")}, f"authored:{item['id']}")
    if "reading" in item:
        fields.update(copied_fields(item, {"reading": "reading"}, f"authored:{item['id']}"))
    ensure(not re.search(r"\{[\w-]+\}|_{2,}", item["study"]), "Authored entries must be whole, not open frames")
    domain = item.get("lexicalFamily")
    ensure(domain in {definition["domain"] for definition in policy["themeDefinitions"]}, "Unknown authored lexical destination")
    phrase = {"id": "editorial:" + item["id"], **fields, "speaker": "A", "kind": "learner",
              "contentType": item["contentType"], "isTemplate": False, "sourceDeclaredTemplate": False,
              "editorialLevel": item["proposedLevel"],
              "semanticReview": {"status": "reviewed", "reason": item["reason"]},
              "phoneticReviewStatus": item["phoneticReviewStatus"],
              "source": {"collection": "editorial-authored", "kind": "editorial-authored-whole-entry",
                         "file": str(AUTHORED.relative_to(ROOT)), "sourceFileSha256": file_sha(AUTHORED),
                         "itemId": item["id"], "sourceSha256": sha(item),
                         "fieldMap": {key: key for key in fields}},
              "placement": {"domain": domain, "classification": "explicit-authored-whole-entry",
                            "reason": item["reason"], "plannedPrerequisiteIndices": []}}
    if item["contentType"] == "vocabulary":
        ensure(item.get("lexicalClass") in {"adjective", "preposition", "adverb", "color", "other", "uncertain"}, "Invalid authored lexical class")
        phrase["lexicalClass"] = item["lexicalClass"]
    else:
        ensure(domain == "nombres" and isinstance(item.get("numberOrder"), list) and len(item["numberOrder"]) == 2,
               "Authored whole number lacks numeric order")
        phrase["numberOrder"] = item["numberOrder"]
        phrase["numberKind"] = item.get("numberKind")
        phrase["numberValue"] = item.get("numberValue")
    for name in ("lexicalUsage", "lexicalConceptId", "wholeHeadwordPhonSource"):
        if name in item:
            phrase[name] = item[name]
    return phrase


def conversation_phrase(item, pair_info):
    pair_id = item.get("pair")
    ensure(pair_id in pair_info, f"Unknown enrichment pair: {pair_id}")
    native, study, _name, _flag, _historical = pair_info[pair_id]
    ensure(item.get("kind") == "conversation-variant", "Unsupported enrichment source kind")
    ensure(source_level(item.get("proposedLevel")), "Invalid enrichment level")
    ensure(isinstance(item.get("reason"), str) and bool(item["reason"].strip()), "Missing enrichment rationale")
    ensure(type(item.get("priority")) is int and item["priority"] >= 0, "Invalid enrichment priority")
    relative = item.get("sourceFile")
    ensure(isinstance(relative, str), "Missing enrichment snapshot")
    path = (ROOT / relative).resolve()
    safe_root = (ROOT / "docs/niveaux-progressifs/sources/conversation").resolve()
    ensure(path.is_relative_to(safe_root) and path.suffix == ".json", "Enrichment snapshot is outside its declared source directory")
    ensure(path.is_file(), f"Missing enrichment snapshot: {relative}")
    ensure(file_sha(path) == item.get("sourceFileSha256"), f"Snapshot fingerprint changed: {relative}")
    source = json.loads(path.read_text())
    ensure(source.get("nativeLanguage") == native and source.get("studyLanguage") == study,
           f"Wrong language pair in snapshot: {relative}")
    ensure(source_level(source.get("level")), "Invalid snapshot source level")
    units = [unit for unit in source.get("units", []) if unit.get("id") == item.get("unitId")]
    ensure(len(units) == 1, f"Missing or ambiguous source unit: {item.get('unitId')}")
    variants = units[0].get("variants", [])
    index = item.get("variantIndex")
    ensure(type(index) is int and 0 <= index < len(variants), "Invalid source variant")
    variant = variants[index]
    if "sourceVariantSha256" in item:
        ensure(item["sourceVariantSha256"] == sha(variant), "Enrichment variant fingerprint changed")
    mapping = {name: name for name in ("study", "native", "phon")}
    if "reading" in variant:
        mapping["reading"] = "reading"
    fields = copied_fields(variant, mapping, f"{relative}:{units[0]['id']}:{index}")
    ensure(not re.search(r"\{[\w-]+\}|_{2,}", fields["study"]), "An enrichment variant must be a complete source phrase")
    phrase = {"id": f"conversation:{path.name}:{units[0]['id']}:v{index}", **fields,
              "speaker": "A", "kind": "learner", "isTemplate": False,
              "contentType": "utterance",
              "semanticReview": {"status": "existing-source-whole-variant",
                                 "reason": "Variante entière existante, extraite sans recomposition."},
              "editorialLevel": item["proposedLevel"],
              "source": {"collection": "conversation", "kind": "conversation-variant",
                         "file": relative, "sourceFileSha256": item["sourceFileSha256"],
                         "unitId": units[0]["id"], "variantIndex": index,
                         "sourceLevel": source["level"], "fieldMap": mapping,
                         "sourceSha256": sha(variant)},
              "placement": {"classification": "explicit-existing-source-enrichment",
                            "reason": item["reason"], "plannedPrerequisiteIndices": []}}
    return phrase, variant


def dependency_ancestors(pair_id, moves):
    """Validate the complete declared graph, including inter-theme edges."""
    graph = {index: item.get("plannedPrerequisiteIndices", [])
             for (pair, index), item in moves.items() if pair == pair_id}
    ancestors = {}
    visiting = set()

    def visit(index):
        if index in ancestors:
            return ancestors[index]
        ensure(index not in visiting, f"Cyclic planned prerequisites in {pair_id} at source index {index}")
        visiting.add(index)
        result = set()
        for dependency in graph.get(index, []):
            result.add(dependency)
            result.update(visit(dependency))
        visiting.remove(index)
        ancestors[index] = result
        return result

    for index in graph:
        visit(index)
    return ancestors


def ordered_phrases(phrases, pair_id, moves, order_keys, ancestors=None):
    """Stable local order, including dependencies reached through another theme."""
    by_id = {phrase["id"]: phrase for phrase in phrases}
    by_source_index = {phrase["source"]["sourceIndex"]: phrase for phrase in phrases
                       if phrase["source"]["collection"].startswith("DECKS.")}
    edges = defaultdict(set)
    indegree = {key: 0 for key in by_id}
    for index, phrase in by_source_index.items():
        prerequisites = ancestors.get(index, set()) if ancestors is not None else moves.get((pair_id, index), {}).get("plannedPrerequisiteIndices", [])
        for prerequisite in prerequisites:
            other = by_source_index.get(prerequisite)
            if other and phrase["id"] not in edges[other["id"]]:
                edges[other["id"]].add(phrase["id"])
                indegree[phrase["id"]] += 1
    ready = [(order_keys[key], key) for key, value in indegree.items() if value == 0]
    heapq.heapify(ready)
    result = []
    while ready:
        _priority, key = heapq.heappop(ready)
        result.append(by_id[key])
        for child in sorted(edges[key]):
            indegree[child] -= 1
            if indegree[child] == 0:
                heapq.heappush(ready, (order_keys[child], child))
    ensure(len(result) == len(phrases), f"Cyclic planned prerequisites within {pair_id}")
    return result


def adjective_priority_keys(phrases, base_keys):
    """Order declared concepts, never infer gender or meaning from spelling."""
    aliases = {"leger": "léger"}
    groups = {}
    labels = {}
    for phrase in phrases:
        explicit = phrase.get("lexicalConceptId")
        label = aliases.get(explicit, explicit) if explicit else phrase["id"]
        labels[phrase["id"]] = label
        groups[label] = min(groups.get(label, base_keys[phrase["id"]]), base_keys[phrase["id"]])
    priorities = {name: index for index, name in enumerate(ADJECTIVE_CONCEPT_ORDER)}
    result = {}
    for phrase in phrases:
        label = labels[phrase["id"]]
        tier = 0 if label in priorities else 2 if label in {"radin", "égoïste"} else 1
        # The authored IDs explicitly mark these gender variants. No automatic
        # adjective ending or feminine pronunciation is fabricated.
        feminine = int(phrase["source"].get("itemId", "").endswith("-f"))
        result[phrase["id"]] = (tier, priorities.get(label, 0), groups[label], feminine,
                                  base_keys[phrase["id"]], phrase["id"])
    return result


def sequences(pair_id, level, theme_id, phrases, native, context=None, review_ids=None, context_ids=None,
              preserve_input_order=False, received_usages=None):
    result = []
    locally_presented = set()
    review_ids = review_ids or set()
    context_ids = context_ids or set()
    review_phrases = [phrase for phrase in phrases if phrase["id"] in review_ids]
    contextual_phrases = [phrase for phrase in phrases if phrase["id"] in context_ids]
    new_phrases = [phrase for phrase in phrases if phrase["id"] not in review_ids | context_ids]
    ordered_blocks = (phrases,) if preserve_input_order else (review_phrases, contextual_phrases, new_phrases)
    batches = [block[offset:offset + 5] for block in ordered_blocks
               for offset in range(0, len(block), 5)]
    for batch_number, batch in enumerate(batches, 1):
        sid = f"{pair_id}:L{level}:{theme_id}:{batch_number}"
        steps = []
        preparations = {}
        preparation_ids = []
        for position, phrase in enumerate(batch):
            prefix = f"{sid}:{position}"
            if context and phrase["id"] not in review_ids | context_ids and phrase.get("contentType") == "utterance" and phrase["source"]["collection"].startswith("DECKS."):
                target_index = phrase["source"]["sourceIndex"]
                visiting = set()
                pending = []

                def present(index):
                    source_phrase = context["byIndex"][index]
                    # Lexical preparation belongs to its dedicated section.
                    # A planned cross-reference never inserts an isolated word
                    # or a number into a situation lesson.
                    if source_phrase["contentType"] in {"vocabulary", "number"}:
                        return
                    if source_phrase["contentType"] in {"incomplete", "review"}:
                        context["gaps"].append({"pair": pair_id, "targetSourceIndex": target_index,
                            "prerequisiteSourceIndex": index, "isValidationBlocker": True,
                            "reason": "reserved-source-not-exercised", "contentType": source_phrase["contentType"]})
                        return
                    if index in context.get("heldIndices", set()):
                        context["gaps"].append({"pair": pair_id, "targetSourceIndex": target_index,
                            "prerequisiteSourceIndex": index, "isValidationBlocker": True,
                            "reason": "held-source-not-available"})
                        return
                    if context["positions"][index] < context["positions"][target_index] or index in locally_presented:
                        return
                    ensure(index not in visiting, f"Local preparation cycle in {pair_id} at {index}")
                    visiting.add(index)
                    if context["positions"][index][0] != level:
                        context["gaps"].append({"pair": pair_id, "targetSourceIndex": target_index,
                            "prerequisiteSourceIndex": index, "isValidationBlocker": True,
                            "reason": "different-editorial-level"})
                        visiting.remove(index)
                        return
                    for dependency in context["moves"].get((pair_id, index), {}).get("plannedPrerequisiteIndices", []):
                        present(dependency)
                    visiting.remove(index)
                    if index not in locally_presented:
                        locally_presented.add(index)
                        pending.append(source_phrase)

                for prerequisite in context["moves"].get((pair_id, target_index), {}).get("plannedPrerequisiteIndices", []):
                    present(prerequisite)
                for preparation in pending:
                    index = preparation["source"]["sourceIndex"]
                    preparation_ids.append(preparation["id"])
                    ids = []
                    for kind in ("understand", "imitate"):
                        step_id = f"{prefix}:prepare:{index}:{kind}"
                        ids.append(step_id)
                        steps.append({"id": step_id, "kind": kind, "utterance": preparation["id"],
                            "wholePhrase": True, "contentType": "utterance", "requiresProduction": kind == "imitate",
                            "isPreparation": True, "prepares": phrase["id"]})
                    context["presentations"].append({"pair": pair_id, "level": level,
                        "themeId": theme_id, "sequenceId": sid, "preparationId": preparation["id"],
                        "preparationSourceIndex": index, "beforeTargetId": phrase["id"],
                        "beforeTargetSourceIndex": target_index, "stepIds": ids,
                        "sourcePhraseCopiedAgain": False, "doesNotProveAcquisition": True})
            understood = prefix + ":understand"
            steps.append({"id": understood, "kind": "understand", "utterance": phrase["id"],
                          "wholePhrase": phrase["contentType"] == "utterance",
                          "contentType": phrase["contentType"], "requiresProduction": False,
                          "isReview": phrase["id"] in review_ids, "isContextReuse": phrase["id"] in context_ids})
            if not phrase.get("isTemplate"):
                imitated = prefix + ":imitate"
                steps.append({"id": imitated, "kind": "imitate", "utterance": phrase["id"],
                              "wholePhrase": phrase["contentType"] == "utterance",
                              "contentType": phrase["contentType"], "requiresProduction": True,
                              "isReview": phrase["id"] in review_ids, "isContextReuse": phrase["id"] in context_ids})
                preparations[phrase["id"]] = {"understoodInStep": understood, "imitatedInStep": imitated}
        for position, phrase in enumerate(batch):
            if phrase.get("isTemplate"):
                continue
            steps.append({"id": f"{sid}:{position}:recall", "kind": "choose-and-recall",
                          "utterance": phrase["id"], "wholePhrase": phrase["contentType"] == "utterance",
                          "contentType": phrase["contentType"],
                          "requiresProduction": True, "preparedInSteps": preparations[phrase["id"]],
                          "isReview": phrase["id"] in review_ids, "isContextReuse": phrase["id"] in context_ids})
        result.append({"id": sid, "title": f"第 {batch_number} 组" if native == "zh" else f"Séquence {batch_number}",
                       "phraseIds": [phrase["id"] for phrase in batch],
                       "preparationIds": list(dict.fromkeys(preparation_ids)), "steps": steps})
    if received_usages:
        presented, understood, imitated, inserted = {}, {}, {}, set()
        for sequence in result:
            rewritten, received_ids = [], []
            for step in sequence["steps"]:
                if step["kind"] == "understand":
                    understood[step["utterance"]] = step["id"]
                elif step["kind"] == "imitate":
                    imitated[step["utterance"]] = step["id"]
                relevant = [usage for usage in received_usages if usage["prepares"] == step.get("utterance")
                            and step["kind"] == "choose-and-recall"]

                def received_step(usage):
                    ensure(usage["id"] not in inserted, "Received cue was inserted twice")
                    ensure(all(identifier in understood and identifier in imitated for identifier in usage["answerWithUtteranceIds"]),
                           "A received question precedes understanding or imitation of its answer")
                    inserted.add(usage["id"])
                    received_ids.append(usage["utterance"])
                    return {"id": f"{sequence['id']}:received:{usage['id']}", "kind": "receive",
                        "receivedId": usage["id"], "utterance": usage["utterance"], "role": usage["role"],
                        "level": usage["level"], "analyse": False, "requiresProduction": False,
                        "countsForProgress": False, "countsTowardProductionProgression": False,
                        "wholePhrase": True, "contentType": "utterance", "prepares": usage["prepares"],
                        "targetIntentId": usage["targetIntentId"], "answerWith": usage["answerWith"],
                        "answerWithUtteranceIds": usage["answerWithUtteranceIds"],
                        "preparedAnswerSteps": {identifier: {"understoodInStep": understood[identifier], "imitatedInStep": imitated[identifier]}
                                                for identifier in usage["answerWithUtteranceIds"]},
                        **{key: usage[key] for key in ("beforeIntentId", "afterIntentId") if key in usage}}
                for usage in relevant:
                    if usage.get("beforeIntentId"):
                        rewritten.append(received_step(usage))
                rewritten.append(step)
                for usage in relevant:
                    if usage.get("afterIntentId"):
                        ensure(usage["answerWith"] == [], "A closure requires an explicit empty answer list")
                        rewritten.append(received_step(usage))
            sequence["steps"] = rewritten
            sequence["receivedIds"] = list(dict.fromkeys(received_ids))
        ensure(inserted == {usage["id"] for usage in received_usages}, "A received cue has no real target recall")
    return result


def density_groups(pair_id, grouped_phrases, definitions_by_level, report, moves=None, ancestors=None,
                   contextual_uses=None, phrase_lookup=None):
    """Select earlier, available sources; never relabel a future word as review.

    The bank emitted later is a transport copy of only these selected sources.
    Canonical identities and first encounters remain solely in the 70 cells.
    """
    minimum = 6
    if DENSITY_POLICY.exists():
        document = json.loads(DENSITY_POLICY.read_text())
        minimum = document.get("displayRule", {}).get("minimumPresentedItems",
            document.get("minimumPresentedCount", document.get("minimumPresentations", 6)))
    ensure(type(minimum) is int and minimum >= 6, "Invalid density minimum")
    cumulative = {"vocab-adjectifs", "vocab-couleurs"}
    available = defaultdict(list)
    result, bank = {}, {}
    contextual_uses = contextual_uses or []
    phrase_lookup = phrase_lookup or {}

    def concept(phrase):
        explicit = phrase.get("lexicalConceptId")
        return {"leger": "léger"}.get(explicit, explicit) if explicit else sha((phrase["study"], phrase["native"]))

    for level in range(1, 11):
        newly_available = []
        for definition in definitions_by_level[level]:
            domain = definition["domain"]
            chosen = grouped_phrases[(level, domain)]
            primary_ids = {phrase["id"] for phrase in chosen}
            context_rows, context_references = [], []
            for use in contextual_uses:
                if use["level"] != level or use["topicId"] != domain or use["canonicalId"] in primary_ids:
                    continue
                source_phrase = phrase_lookup[use["canonicalId"]]
                ensure(source_phrase["contentType"] == "utterance" and source_phrase["editorialLevel"] <= level,
                       "Context reuse references a lexeme or a future first encounter")
                ensure(source_phrase["id"] not in {row["id"] for row in context_rows}, "Context duplicates cannot inflate a new theme")
                context_rows.append(source_phrase)
                context_references.append({"id": source_phrase["id"], "firstEditorialLevel": source_phrase["editorialLevel"],
                    "canonicalThemeId": source_phrase["placement"]["themeId"], "intentId": use["intentId"], "reason": use["reason"]})
            candidates = sorted(available[(definition["contentType"], domain)],
                                key=lambda row: (-row["editorialLevel"], row["id"]))
            concepts = {concept(phrase) for phrase in chosen + context_rows}
            selected = []
            selected_concepts = set()
            identities = {phrase_key(phrase) for phrase in chosen + context_rows}
            if chosen or context_rows or domain in cumulative:
                for phrase in candidates:
                    if phrase_key(phrase) in identities:
                        continue
                    current_concept = concept(phrase)
                    if domain not in cumulative:
                        if current_concept in concepts and current_concept not in selected_concepts:
                            continue
                        if len(concepts) >= minimum and current_concept not in selected_concepts:
                            continue
                    concepts.add(concept(phrase))
                    selected_concepts.add(current_concept)
                    identities.add(phrase_key(phrase))
                    selected.append(phrase)
            presented = chosen + context_rows + selected
            review_keys = {phrase["id"]: (phrase["editorialLevel"], phrase["id"]) for phrase in selected}
            if domain == "vocab-adjectifs":
                review_keys = adjective_priority_keys(selected, review_keys)
            elif definition["contentType"] == "number":
                review_keys = {phrase["id"]: (*phrase["numberOrder"], phrase["editorialLevel"], phrase["id"])
                               for phrase in selected}
            selected = ordered_phrases(selected, pair_id, moves or {}, review_keys, ancestors)
            visible = bool(presented) and len(concepts) >= minimum
            references = []
            if visible:
                for phrase in context_rows:
                    bank[phrase["id"]] = {**phrase, "referenceOnly": True,
                        "sourceHash": phrase["source"]["sourceSha256"], "canonicalLocation": {
                            "pairId": pair_id, "level": phrase["editorialLevel"], "themeId": phrase["placement"]["themeId"]}}
                for phrase in selected:
                    location = {"pairId": pair_id, "level": phrase["editorialLevel"],
                                "themeId": phrase["placement"]["themeId"]}
                    ensure(location["level"] < level, "A future source cannot become a revision")
                    references.append({"id": phrase["id"], "firstEditorialLevel": location["level"],
                        "canonicalThemeId": location["themeId"],
                        "reason": "Révision d’une source entière déjà introduite dans la même famille ; ne prouve pas son acquisition."})
                    bank[phrase["id"]] = {**phrase, "referenceOnly": True,
                                          "sourceHash": phrase["source"]["sourceSha256"], "canonicalLocation": location}
                newly_available.extend(chosen)
            # Held primary entries remain canonical and inventory-accessible,
            # but cannot be cited as an earlier presentation in another level.
            state = {"visible": visible, "reviewReferences": references,
                     "contextReferences": context_references if visible else [],
                     "contextPhrases": context_rows if visible else [], "reuseCount": len(context_rows) if visible else 0,
                     "reviewPhrases": selected if visible else [],
                     "newCount": len(chosen), "reviewCount": len(references),
                     "presentedCount": len(presented) if visible else len(chosen),
                     "pedagogicalConceptCount": len(concepts) if visible else len({concept(p) for p in chosen}),
                     "densityStatus": "source-repertoire-ready" if visible else "insufficient-source-repertoire",
                     "canonicalCount": len(chosen)}
            result[(level, domain)] = state
            if chosen or visible:
                report["density"].append({"pair": pair_id, "level": level, "themeId": definition["id"],
                    **{key: value for key, value in state.items() if key not in {"reviewPhrases", "reviewReferences", "contextPhrases", "contextReferences"}},
                    "referenceIds": [item["id"] for item in references], "minimumPedagogicalConcepts": minimum,
                    "contextIds": [item["id"] for item in context_references] if visible else [],
                    "claimsAcquisition": False, "futureSourcesUsedAsReview": False})
        for phrase in newly_available:
            available[(phrase["contentType"], phrase["placement"]["domain"])].append(phrase)
    return result, bank


def make(include_situations=True):
    app_raw, decks, plan, decisions, enrichment_items = read_inputs()
    domains = plan["domains"]
    pairs = {pair_id: (native, study, name, flag, historical)
             for pair_id, native, study, name, flag, historical in legacy.PAIRS}
    semantic_types, semantic_sources = checked_content_types(decks, pairs)
    frozen_situations = situation_content.read_frozen_inputs(ROOT, pairs) if include_situations else None
    vocabulary_policy = checked_vocabulary_policy()
    visuals = checked_visuals()
    lexical_introductions = checked_introductions(LEXICAL_INTRODUCTIONS, decks, pairs, semantic_types)
    number_introductions = checked_introductions(NUMBER_INTRODUCTIONS, decks, pairs, semantic_types)
    phrase_introductions = checked_introductions(PHRASE_INTRODUCTIONS, decks, pairs, semantic_types)
    introduction_complement = checked_introductions(INTRODUCTION_COMPLEMENT, decks, pairs, semantic_types)
    relation_introductions = checked_introductions(RELATION_INTRODUCTIONS, decks, pairs, semantic_types)
    relation_progression = checked_introductions(RELATION_PROGRESSION, decks, pairs, semantic_types)
    ensure({(item["pair"], item["sourceIndex"]) for item in number_introductions}
           == {key for key, assignment in semantic_types.items() if assignment["contentType"] == "number"},
           "Every standalone source number needs a checked progression and numeric order")
    introductions = {}
    all_introductions = lexical_introductions + number_introductions + phrase_introductions + introduction_complement + relation_introductions + relation_progression
    overlay_replacements = []
    for item in all_introductions:
        key = (item["pair"], item["sourceIndex"])
        if key in introductions:
            previous = introductions[key]
            ensure(item.get("supersedesProposedLevel") == previous["proposedLevel"]
                   and item.get("supersedesOverlay") == previous["overlayFile"],
                   "Two introduction overlays target the same canonical source without an explicit replacement")
            overlay_replacements.append({"pair": key[0], "sourceIndex": key[1],
                "previous": previous, "replacement": item, "canonicalCardCountAdded": 0})
        introductions[key] = item
    moves = checked_moves(decisions, decks, {key: value[:2] for key, value in pairs.items()}, domains)
    explicit_level_keys = set(moves) | set(introductions)
    manifest = {"version": 2, "status": "editorial-review", "publicationApproved": False, "productionApproved": False,
                "doesNotMeasureAcquisition": True,
                "review": {"sourceIdentity": "verified", "phoneticMethod": "pending-claude",
                           "pedagogicalProgressivity": "editorial-proposal",
                           "semanticClassification": "candidate-requires-semantic-review"},
                "contentSections": [{"id": "situations", "contentTypes": ["utterance"]},
                                    {"id": "vocabulary", "contentTypes": ["vocabulary", "number"]}],
                "levels": [{key: value for key, value in item.items() if key != "themes"} for item in plan["levels"]],
                "pairs": []}
    report = {"version": 1, "status": "catalogue-classification-candidate-not-progressivity-approved",
              "sourceFile": "melunga_deploy/app.html", "sourceAppSha256": hashlib.sha256(app_raw).hexdigest(),
              "sourceDecksSha256": sha(decks), "planSha256": file_sha(PLAN),
              "decisionsPresent": DECISIONS.exists(),
              "decisionsSha256": file_sha(DECISIONS) if DECISIONS.exists() else None,
              "enrichmentFileSha256": file_sha(ENRICHMENTS) if ENRICHMENTS.exists() else None,
              "semanticPartitions": semantic_sources, "sourceTemplateExceptions": [],
              "vocabularyPolicySha256": file_sha(VOCABULARY_POLICY),
              "visualRegistrySha256": file_sha(VISUALS),
              "densityPolicySha256": file_sha(DENSITY_POLICY) if DENSITY_POLICY.exists() else None,
              "lexicalIntroductions": lexical_introductions, "numberIntroductions": number_introductions,
              "phraseIntroductions": phrase_introductions,
              "introductionComplement": introduction_complement, "relationIntroductions": relation_introductions,
              "relationProgression": relation_progression, "introductionOverlayReplacements": overlay_replacements,
              "authoredEntries": [], "authoredFileSha256": file_sha(AUTHORED) if AUTHORED.exists() else None,
              "supersededLevelDecisions": [], "density": [], "reviewTransports": [],
              "doesNotMeasureAcquisition": True, "publicationApproved": False, "productionApproved": False,
              "editorialAdjudications": decisions.get("adjudications", []),
              "sourceLevelChanges": 0, "newlyAuthoredStudyPhrases": 0, "newlyAuthoredPhonetics": 0,
              "accessPolicy": "Original catalogue lv fields are preserved; editorialLevel does not define free/paid access.",
              "pairs": [], "moves": [], "enrichments": [], "excludedEnrichmentCandidates": [],
              "plannedPrerequisites": [], "localPreparations": [], "localPreparationGaps": [], "lexicalReuses": [],
              "progressivityReviewComplete": False, "checks": {}}
    rows = {}
    order_keys = {}
    by_identity = {}
    by_study = {}
    for pair_id, (native, study, name, flag, historical) in pairs.items():
        rows[pair_id] = []
        by_identity[pair_id] = defaultdict(list)
        by_study[pair_id] = defaultdict(list)
        for index, card in enumerate(decks[study]):
            ensure(source_level(card.get("lv")), f"Invalid source level at {study}:{index}")
            mapping = field_map(study)
            fields = copied_fields(card, mapping, f"DECKS.{study}:{index}")
            move = moves.get((pair_id, index))
            introduction = introductions.get((pair_id, index))
            level = introduction["proposedLevel"] if introduction else move["proposedLevel"] if move else card["lv"]
            if introduction and move and move["proposedLevel"] != level:
                report["supersededLevelDecisions"].append({"pair": pair_id, "sourceIndex": index,
                    "historicalProposedLevel": move["proposedLevel"], "newProposedLevel": level,
                    "introductionFile": introduction["overlayFile"], "reason": introduction["reason"],
                    "historicalDecisionPreserved": move})
            domain, classification = legacy.classify(card, study)
            semantic = semantic_types[(pair_id, index)]
            declared_template = explicit_template(card)
            is_template = declared_template and semantic.get("sourceTemplateException") is not True
            if is_template:
                domain, classification = "personnaliser", "source-template"
            elif semantic.get("sourceTemplateException") is True:
                domain, classification = "conversation", "reviewed-source-template-exception"
                report["sourceTemplateExceptions"].append({"pair": pair_id, "sourceIndex": index,
                    "sourceSha256": sha(card), "contentType": semantic["contentType"],
                    "reason": semantic["reason"], "sourceDeclarationUnchanged": True,
                    "doesNotGenerateSentenceFromLexeme": True})
            if move and "domain" in move:
                domain, classification = move["domain"], "explicit-domain-decision"
            ensure(domain in domains, f"Unresolved source domain: {domain}")
            phrase = {"id": f"catalogue:{study}:{index}", **fields, "speaker": "A", "kind": "learner",
                      "isTemplate": is_template, "editorialLevel": level,
                      "sourceDeclaredTemplate": declared_template,
                      "contentType": semantic["contentType"],
                      "semanticReview": {"status": semantic["reviewStatus"], "reason": semantic["reason"]},
                      "source": {"collection": f"DECKS.{study}", "sourceIndex": index,
                                 "sourceLevel": card["lv"], "fieldMap": mapping, "sourceSha256": sha(card)},
                      "placement": {"domain": domain, "classification": classification,
                                    "decision": "explicit-source-introduction" if introduction else "explicit-proposal" if move else "source-level-retained",
                                    "reason": introduction["reason"] if introduction else move["reason"] if move else "Niveau source conservé en attente de sa revue pédagogique.",
                                    "plannedPrerequisiteIndices": move.get("plannedPrerequisiteIndices", []) if move else []}}
            if semantic["contentType"] == "vocabulary":
                phrase["lexicalClass"] = semantic["lexicalClass"]
                phrase["semanticReview"].update(lexicalClassReason=semantic["lexicalClassReason"],
                                               lexicalClassStatus=semantic["lexicalClassReviewStatus"])
                if introduction and introduction.get("lexicalClass") in {"adjective", "preposition", "adverb", "color", "other", "uncertain"}:
                    phrase["semanticReview"]["originalLexicalClass"] = phrase["lexicalClass"]
                    phrase["lexicalClass"] = introduction["lexicalClass"]
                    phrase["semanticReview"]["lexicalClassIntroductionFile"] = introduction["overlayFile"]
            if semantic.get("sourceTemplateException") is True:
                phrase["semanticReview"]["sourceTemplateException"] = True
            for key in ("lexicalFamilyOverride", "lexicalFamilyOverrideReason", "situationDomainOverride", "situationDomainOverrideReason", "lexicalConceptId", "lexicalUsage", "previousFamily", "previousDomain"):
                if key in semantic:
                    phrase[key] = semantic[key]
            if "lexicalConceptId" not in phrase and semantic.get("conceptId"):
                phrase["lexicalConceptId"] = semantic["conceptId"]
            if introduction and "numberOrder" in introduction:
                phrase.update({key: introduction[key] for key in ("numberOrder", "numberKind", "numberValue") if key in introduction})
                if "numberSystem" in introduction:
                    phrase["numberSystem"] = introduction["numberSystem"]
            if introduction:
                for key in ("densityGroupId", "lexicalUsage", "requiresNoun", "lexicalConceptId", "previousFamily", "previousDomain"):
                    if key in introduction:
                        phrase[key] = introduction[key]
                if introduction.get("conceptId") and "lexicalConceptId" not in introduction:
                    phrase["lexicalConceptId"] = introduction["conceptId"]
            rows[pair_id].append(phrase)
            by_identity[pair_id][phrase_key(phrase)].append(phrase)
            by_study[pair_id][phrase["study"]].append(phrase)
            order_keys[phrase["id"]] = (1, index, index)
            if "numberOrder" in phrase:
                order_keys[phrase["id"]] = (0, *phrase["numberOrder"], index)
            if move:
                report["moves"].append({**move, "actualDomain": domain, "sourceSha256": sha(card)})
    proposal_ids = set()
    variant_ids = set()
    imported_fields = 0
    for position, item in enumerate(enrichment_items):
        ensure(isinstance(item, dict), "Invalid enrichment item")
        ensure(isinstance(item.get("id"), str) and item["id"] not in proposal_ids, "Missing or duplicate enrichment proposal ID")
        proposal_ids.add(item["id"])
        ensure(item.get("domain") in domains, "Unknown enrichment domain")
        phrase, variant = conversation_phrase(item, pairs)
        ensure(phrase["id"] not in variant_ids, "The same source variant cannot be imported twice")
        variant_ids.add(phrase["id"])
        pair_id = item["pair"]
        if item.get("runtimeCandidate") is not True:
            report["excludedEnrichmentCandidates"].append({**item,
                "sourceVariantSha256": sha(variant),
                "sameStudyCatalogueIndices": [candidate["source"]["sourceIndex"] for candidate in by_study[pair_id].get(phrase["study"], [])],
                "includedInRuntime": False})
            continue
        matches = by_identity[pair_id].get(phrase_key(phrase), [])
        ensure(matches or not by_study[pair_id].get(phrase["study"]),
               "An enrichment with an existing study text but different meaning/phonetics needs an explicit review and cannot be imported")
        priority = (0, item["priority"], position)
        entry = {**item, "sourceVariantSha256": sha(variant), "fieldsCopied": list(phrase["source"]["fieldMap"])}
        if matches:
            target = min(matches, key=lambda candidate: (
                candidate["editorialLevel"] != item["proposedLevel"], candidate["source"]["sourceIndex"]))
            existing_move = moves.get((pair_id, target["source"]["sourceIndex"]))
            ensure(not existing_move or existing_move["proposedLevel"] == item["proposedLevel"],
                   "Enrichment bridge conflicts with an explicit level move")
            entry.update(kind="catalogue-bridge", catalogueId=target["id"],
                         catalogueSourceIndex=target["source"]["sourceIndex"],
                         matchingCatalogueIndices=[candidate["source"]["sourceIndex"] for candidate in matches],
                         previousEditorialLevel=target["editorialLevel"], previousDomain=target["placement"]["domain"])
            target["editorialLevel"] = item["proposedLevel"]
            target["placement"].update(domain=item["domain"], classification="exact-existing-source-bridge",
                                       reason=item["reason"], enrichmentId=item["id"])
            order_keys[target["id"]] = min(priority, order_keys[target["id"]])
        else:
            phrase["placement"].update(domain=item["domain"], enrichmentId=item["id"])
            rows[pair_id].append(phrase)
            order_keys[phrase["id"]] = priority
            entry.update(kind="imported-existing-phrase", runtimeId=phrase["id"])
            imported_fields += len(phrase["source"]["fieldMap"])
        report["enrichments"].append(entry)
    authored_ids = set()
    if AUTHORED.exists():
        authored_document = json.loads(AUTHORED.read_text())
        ensure(isinstance(authored_document.get("items"), list), "Invalid whole-entry authored source")
        for item in authored_document["items"]:
            phrase = authored_phrase(item, pairs, vocabulary_policy)
            ensure(phrase["id"] not in authored_ids, "Repeated authored entry ID")
            authored_ids.add(phrase["id"])
            pair_id = item["pair"]
            ensure(not any(phrase_key(existing) == phrase_key(phrase) for existing in rows[pair_id]),
                   f"Authored entry duplicates an existing complete source: {item['id']}")
            headword = item.get("wholeHeadwordPhonSource")
            if headword:
                study = pairs[pair_id][1]
                ensure(headword.get("collection") == f"DECKS.{study}" and type(headword.get("sourceIndex")) is int,
                       "Invalid whole-headword phonetic source")
                ensure(0 <= headword["sourceIndex"] < len(decks[study])
                       and headword.get("field") == field_map(study)["phon"], "Invalid whole-headword phonetic field or index")
                card = decks[study][headword["sourceIndex"]]
                ensure(card.get("t") == phrase["study"] and card.get(headword.get("field")) == phrase["phon"],
                       "Whole-headword phonetic source does not match; no concatenation or rewriting allowed")
            rows[pair_id].append(phrase)
            order_keys[phrase["id"]] = ((0, *phrase["numberOrder"], -1) if "numberOrder" in phrase else (0, -1, len(authored_ids)))
            report["authoredEntries"].append({"id": phrase["id"], "pair": pair_id, "contentType": phrase["contentType"],
                "lexicalClass": phrase.get("lexicalClass"), "level": phrase["editorialLevel"],
                "sourceSha256": phrase["source"]["sourceSha256"], "fields": list(phrase["source"]["fieldMap"]),
                "phoneticReviewStatus": "pending-Claude", "reusesWholeHeadwordPhonetic": bool(headword)})
    report["newlyAuthoredStudyPhrases"] = len(report["authoredEntries"])
    report["newlyAuthoredPhonetics"] = sum(not item["reusesWholeHeadwordPhonetic"] for item in report["authoredEntries"])
    # Routing is separate from the source level and the source text. A reserve
    # is canonical storage for review, never a hidden situation exercise.
    for pair_id, (_native, study, _name, _flag, _historical) in pairs.items():
        for phrase in rows[pair_id]:
            old_domain = phrase["placement"]["domain"]
            phrase["placement"]["originalDomain"] = old_domain
            content_type = phrase["contentType"]
            if phrase["source"]["collection"] == "editorial-authored":
                phrase["placement"].update(section="vocabulary", lexicalFamilyClassification="explicit-authored-source-destination")
                continue
            if content_type in {"incomplete", "review"}:
                phrase["placement"].update(domain="reserve", section="reserve")
                phrase["reserveReason"] = phrase["semanticReview"]["reason"]
            elif content_type == "number":
                phrase["placement"].update(domain="nombres", section="vocabulary",
                                          lexicalFamilyClassification="isolated-number-source-partition")
            elif content_type == "vocabulary":
                ensure(phrase["source"]["collection"].startswith("DECKS."), "Imported variants cannot become isolated lexemes")
                index = phrase["source"]["sourceIndex"]
                semantic = semantic_types[(pair_id, index)]
                semantic = {**semantic, "lexicalClass": phrase["lexicalClass"]}
                introduction = introductions.get((pair_id, index))
                if introduction and introduction.get("lexicalFamily") and semantic.get("lexicalFamilyOverride"):
                    ensure(introduction["lexicalFamily"] == semantic["lexicalFamilyOverride"],
                           f"Reviewed introduction and semantic destination conflict: {pair_id}:{index}")
                if introduction and introduction.get("lexicalFamily") and "lexicalFamilyOverride" not in semantic:
                    semantic = {**semantic, "lexicalFamilyOverride": introduction["lexicalFamily"]}
                destination, rationale = lexical_family(decks[study][index], study, old_domain, vocabulary_policy, index, semantic)
                phrase["placement"].update(domain=destination, section="vocabulary",
                                          lexicalFamilyClassification=rationale)
                if phrase.get("previousDomain") or phrase.get("previousFamily"):
                    phrase["placement"]["previousDomain"] = phrase.get("previousDomain", phrase.get("previousFamily"))
            else:
                ensure(content_type == "utterance" and not phrase.get("isTemplate"), "Only complete utterances enter situations")
                ensure(old_domain != "personnaliser", "An active utterance cannot enter a frame collection")
                explicit_domain = phrase.get("situationDomainOverride")
                introduction = introductions.get((pair_id, phrase["source"].get("sourceIndex")))
                if introduction and introduction.get("domain"):
                    ensure(not explicit_domain or explicit_domain == introduction["domain"],
                           f"Reviewed phrase introduction and situation override conflict: {pair_id}:{phrase['id']}")
                    explicit_domain = introduction["domain"]
                if explicit_domain:
                    ensure(explicit_domain in domains and explicit_domain != "personnaliser", "Unknown reviewed situation destination")
                    phrase["placement"].update(domain=explicit_domain, situationClassification="reviewed-source-situation-override")
                # Troubleshooting requests can contain a politeness formula;
                # their communicative function takes priority over greetings.
                if not explicit_domain and phrase["source"]["collection"].startswith("DECKS."):
                    card = decks[study][phrase["source"]["sourceIndex"]]
                    gloss = card["t"] if study == "fr" else card["frm"]
                    normalized = legacy.normal(gloss)
                    if re.search(r"\b(repet(?:e|es|ez|er)|lentement|ne comprends|pas compris|no comprendo)\b", normalized):
                        phrase["placement"].update(domain="comprendre", situationClassification="troubleshooting-function-candidate")
                    elif re.search(r"\b(gare|station|aeroport)\b", normalized) and re.search(r"\b(ou|trouve|direction|aller)\b", normalized):
                        phrase["placement"].update(domain="deplacements", situationClassification="travel-location-question-candidate")
                phrase["placement"]["section"] = "situations"

    situation_resolution = situation_content.resolve(ROOT, frozen_situations, rows, pairs, decks)
    additional_themes = situation_resolution["plan"]["themes"] if situation_resolution else []
    if situation_resolution:
        for position, entry in enumerate(situation_resolution["entries"]):
            if entry["category"] != "received":
                order_keys[entry["id"]] = (0, position, position)
        situation_rows = {pair: {row["id"]: row for row in values} for pair, values in rows.items()}
        for use in situation_resolution["uses"]:
            row = situation_rows[use["pair"]][use["canonicalId"]]
            if row["editorialLevel"] == use["level"] and row["placement"]["domain"] == use["topicId"]:
                order_keys[row["id"]] = (0, use["topicOrder"], use["intentOrder"])
        report["situationEnrichment"] = {key: value for key, value in situation_resolution.items() if key not in {"plan", "baseline", "heardModels"}}
        manifest["additionalSituations"] = {"planSha256": frozen_situations["fingerprints"][str(situation_content.DIRECTORY / "plan.json")],
            "themeCount": len(additional_themes), "intentsPerTheme": 8, "candidatePositions": len(frozen_situations["items"]),
            "newAuthoredUtterances": sum(entry["authored"] and entry["category"] == "learner" for entry in situation_resolution["entries"]),
            "existingConversationImports": sum(entry["preexistingConversation"] and entry["category"] == "learner" for entry in situation_resolution["entries"]),
            "receivedUsages": len(situation_resolution["receivedUses"]),
            "receivedCreated": sum(entry["authored"] and entry["category"] == "received" for entry in situation_resolution["entries"]),
            "receivedExistingConversationImports": sum(entry["preexistingConversation"] and entry["category"] == "received" for entry in situation_resolution["entries"]),
            "lexicalSupportUses": len(situation_resolution["lexicalSupportUses"]),
            "lexicalSupportCreated": sum(entry["authored"] and entry["category"] == "support" for entry in situation_resolution["entries"]),
            "lexicalSupportExistingConversationImports": sum(entry["preexistingConversation"] and entry["category"] == "support" for entry in situation_resolution["entries"])}
        manifest["additionalSituations"]["existingSourcePositions"] = len(frozen_situations["items"]) - manifest["additionalSituations"]["newAuthoredUtterances"]
        manifest["additionalSituations"]["baseCandidatePositions"] = frozen_situations.get("baseIntentCount", len(frozen_situations["intents"])) * len(pairs)
        manifest["additionalSituations"]["extensionCandidatePositions"] = len(frozen_situations["items"]) - manifest["additionalSituations"]["baseCandidatePositions"]
        for introduction in situation_resolution["introductions"]:
            row = next(row for row in rows[introduction["pair"]] if row["id"] == introduction["canonicalId"])
            if row["source"]["collection"].startswith("DECKS."):
                explicit_level_keys.add((introduction["pair"], row["source"]["sourceIndex"]))
    for item in report["moves"]:
        phrase = next(phrase for phrase in rows[item["pair"]]
                      if phrase["source"].get("sourceIndex") == item["sourceIndex"])
        item["initialSituationDomain"] = item["actualDomain"]
        item["actualDomain"] = phrase["placement"]["domain"]
        item["actualContentType"] = phrase["contentType"]

    outputs = {}
    catalogue_count = field_count = total_steps = template_count = 0
    type_names = ("utterance", "vocabulary", "number", "incomplete", "review")
    for pair_id, (native, study, name, flag, historical) in pairs.items():
        canonical_rows = rows[pair_id]
        active_rows = [phrase for phrase in canonical_rows if phrase["contentType"] not in {"incomplete", "review"}]
        counts = {key: sum(phrase["contentType"] == key for phrase in canonical_rows) for key in type_names}
        lexical_counts = dict(sorted(Counter(phrase["lexicalClass"] for phrase in canonical_rows
                                            if phrase["contentType"] == "vocabulary").items()))
        pair_manifest = {"id": pair_id, "nativeLanguage": native, "studyLanguage": study,
                         "name": name, "flag": flag, "totalPhrases": len(active_rows),
                         "totalCanonicalPhrases": len(canonical_rows), "reservedPhrases": counts["incomplete"] + counts["review"],
                         "counts": counts, "lexicalClassCounts": lexical_counts,
                         "totalCataloguePhrases": len(decks[study]), "levels": []}
        repertoire_path = f"content/niveaux-progressifs/repertoires/{pair_id}.json"
        pair_manifest["repertoirePath"] = repertoire_path
        pair_report = {"id": pair_id, "cataloguePhrases": len(decks[study]), "totalPresentedPhrases": len(active_rows),
                       "totalCanonicalPhrases": len(canonical_rows), "reservedPhrases": pair_manifest["reservedPhrases"],
                       "counts": counts, "lexicalClassCounts": lexical_counts,
                       "sourceLevelOneCards": historical, "levels": [], "fieldComparisons": 0,
                       "catalogueCardsWithExplicitDecision": sum(key[0] == pair_id for key in explicit_level_keys),
                       "catalogueCardsRetainingUnreviewedSourceLevel": len(decks[study]) - sum(key[0] == pair_id for key in explicit_level_keys),
                       "historicalSourceLevelOneDistribution": {}, "classificationReasons": {}, "lexicalFamilyReasons": {}}
        seen_indices, seen_ids = [], []
        final_positions, source_themes, grouped_phrases, reserve_by_level = {}, {}, {}, {}
        ancestors = dependency_ancestors(pair_id, moves)
        catalogue_lookup = {phrase["source"]["sourceIndex"]: phrase for phrase in canonical_rows
                            if phrase["source"]["collection"].startswith("DECKS.")}
        phrase_lookup = {phrase["id"]: phrase for phrase in canonical_rows}
        definitions_by_level = {item["level"]: level_definitions(item, vocabulary_policy, additional_themes) for item in plan["levels"]}
        for planned_level in plan["levels"]:
            level = planned_level["level"]
            for theme_position, definition in enumerate(definitions_by_level[level]):
                selected = [phrase for phrase in canonical_rows if phrase["editorialLevel"] == level
                            and phrase["contentType"] == definition["contentType"]
                            and phrase["placement"]["domain"] == definition["domain"]]
                theme_order_keys = adjective_priority_keys(selected, order_keys) if definition["domain"] == "vocab-adjectifs" else order_keys
                selected = (sorted(selected, key=lambda phrase: theme_order_keys[phrase["id"]])
                            if definition.get("isAdditionalSituation") else ordered_phrases(selected, pair_id, moves, theme_order_keys, ancestors))
                grouped_phrases[(level, definition["domain"])] = selected
                for phrase_position, phrase in enumerate(selected):
                    phrase["placement"]["themeId"] = definition["id"]
                    if phrase["source"]["collection"].startswith("DECKS."):
                        index = phrase["source"]["sourceIndex"]
                        final_positions[index] = (level, theme_position, phrase_position)
                        source_themes[index] = definition["id"]
            reserve = [phrase for phrase in canonical_rows if phrase["editorialLevel"] == level
                       and phrase["contentType"] in {"incomplete", "review"}]
            reserve.sort(key=lambda phrase: order_keys[phrase["id"]])
            reserve_by_level[level] = reserve
            for phrase_position, phrase in enumerate(reserve):
                phrase["placement"]["themeId"] = None
                if phrase["source"]["collection"].startswith("DECKS."):
                    index = phrase["source"]["sourceIndex"]
                    final_positions[index] = (level, len(definitions_by_level[level]), phrase_position)
                    source_themes[index] = None

        ensure(set(final_positions) == set(range(len(decks[study]))), "Routing must retain each catalogue index")
        # These IDs are planned lexical supports, never extra situation steps.
        for (move_pair, index), move in moves.items():
            if move_pair != pair_id or catalogue_lookup[index]["contentType"] != "utterance":
                continue
            target = catalogue_lookup[index]
            reused = []
            for prerequisite in move.get("plannedPrerequisiteIndices", []):
                other = catalogue_lookup[prerequisite]
                if other["contentType"] not in {"vocabulary", "number"}:
                    continue
                valid_level = other["editorialLevel"] <= target["editorialLevel"]
                trace = {"pair": pair_id, "targetId": target["id"], "targetSourceIndex": index,
                         "vocabularyId": other["id"], "vocabularySourceIndex": prerequisite,
                         "targetEditorialLevel": target["editorialLevel"], "vocabularyEditorialLevel": other["editorialLevel"],
                         "status": "planned-same-or-earlier-level-reuse" if valid_level else "future-level-lexical-gap",
                         "includedAsReuseReference": valid_level, "insertedIntoSituationSteps": False,
                         "doesNotProveAcquisition": True, "themeOrderEnforced": False}
                report["lexicalReuses"].append(trace)
                if valid_level:
                    reused.append(other["id"])
            if reused:
                target["reuseVocabularyIds"] = list(dict.fromkeys(reused))

        contextual_uses = sorted([use for use in situation_resolution["uses"] if use["pair"] == pair_id],
                                key=lambda use: (use["topicOrder"], use["intentOrder"])) if situation_resolution else []
        density, bank = density_groups(pair_id, grouped_phrases, definitions_by_level, report, moves, ancestors,
                                       contextual_uses, phrase_lookup)
        held_indices = {index for index, phrase in catalogue_lookup.items()
                        if phrase["contentType"] not in {"incomplete", "review"}
                        and not density[(phrase["editorialLevel"], phrase["placement"]["domain"])]["visible"]}
        for trace in report["lexicalReuses"]:
            if trace["pair"] == pair_id and trace["vocabularySourceIndex"] in held_indices:
                trace.update(status="held-source-not-available", includedAsReuseReference=False)
                target = catalogue_lookup[trace["targetSourceIndex"]]
                target["reuseVocabularyIds"] = [ident for ident in target.get("reuseVocabularyIds", [])
                                                if ident != trace["vocabularyId"]]
        bank = {ident: {**phrase_lookup[ident], "referenceOnly": True,
                        "sourceHash": phrase_lookup[ident]["source"]["sourceSha256"],
                        "canonicalLocation": copy["canonicalLocation"]} for ident, copy in bank.items()}
        support_references = defaultdict(list)
        if situation_resolution:
            for use in situation_resolution["lexicalSupportUses"]:
                if use["pair"] != pair_id:
                    continue
                phrase = phrase_lookup[use["canonicalId"]]
                ensure(phrase["contentType"] in {"vocabulary", "number"} and phrase["editorialLevel"] <= use["level"],
                       "A lexical support references a future word or a sentence")
                ensure(density[(phrase["editorialLevel"], phrase["placement"]["domain"] )]["visible"],
                       "A lexical support is held; enrich its real vocabulary family first")
                location = {"pairId": pair_id, "level": phrase["editorialLevel"], "themeId": phrase["placement"]["themeId"]}
                bank[phrase["id"]] = {**phrase, "referenceOnly": True, "sourceHash": phrase["source"]["sourceSha256"], "canonicalLocation": location}
                support_references[use["topicId"]].append({"id": phrase["id"], "supportId": use["id"],
                    "firstEditorialLevel": phrase["editorialLevel"], "canonicalThemeId": location["themeId"],
                    "introducedBeforeIntentId": use["introducedBeforeIntentId"], "reason": use["reason"],
                    "analyse": False, "countsTowardProductionProgression": False, "insertedIntoPhraseSteps": False})
        bank_document = {"version": 1, "pairId": pair_id, "sourceDecksSha256": sha(decks),
                         "phrases": [bank[key] for key in sorted(bank)]}
        received_models = {}
        if situation_resolution and situation_resolution["heardModels"][pair_id]:
            for identifier, model in situation_resolution["heardModels"][pair_id].items():
                original = phrase_lookup.get(identifier)
                copied = {key: value for key, value in (original or model).items() if key not in {"speaker", "kind", "role"}}
                copied.update(heardOnly=True, referenceOnly=True, firstHeardLevel=model["firstHeardLevel"])
                if original:
                    copied["canonicalLocation"] = {"pairId": pair_id, "level": original["editorialLevel"],
                                                   "themeId": original["placement"]["themeId"]}
                received_models[identifier] = copied
            bank_document["receivedModels"] = [received_models[key] for key in sorted(received_models)]
        for copied in bank_document["phrases"]:
            ensure(phrase_key(copied) == phrase_key(phrase_lookup[copied["id"]])
                   and copied["source"] == phrase_lookup[copied["id"]]["source"],
                   "Review transport changed a canonical source field")
        bank_text = json.dumps(bank_document, ensure_ascii=False, separators=(",", ":")) + "\n"
        outputs[ROOT / "melunga_deploy" / repertoire_path] = bank_text
        pair_manifest["repertoireSha256"] = hashlib.sha256(bank_text.encode()).hexdigest()
        report["reviewTransports"].append({"pair": pair_id, "path": repertoire_path,
            "transportCopies": len(bank), "sourceIds": sorted(bank), "canonicalCardsAdded": 0,
            "fileSha256": pair_manifest["repertoireSha256"], "receivedModelTransports": len(received_models)})
        preparation_context = {"byIndex": catalogue_lookup, "positions": final_positions,
                               "moves": moves, "presentations": report["localPreparations"],
                               "gaps": report["localPreparationGaps"], "heldIndices": held_indices}
        reasons, lexical_reasons = Counter(), Counter()

        def check_canonical_phrase(phrase):
            nonlocal template_count
            seen_ids.append(phrase["id"])
            template_count += bool(phrase.get("isTemplate"))
            reasons[phrase["placement"]["classification"]] += 1
            if phrase["contentType"] == "vocabulary":
                lexical_reasons[phrase["placement"]["lexicalFamilyClassification"]] += 1
            if not phrase["source"]["collection"].startswith("DECKS."):
                return None
            index = phrase["source"]["sourceIndex"]
            seen_indices.append(index)
            original = decks[study][index]
            ensure(phrase["source"]["sourceLevel"] == original["lv"], "Source access boundary changed")
            ensure(phrase["source"]["sourceSha256"] == sha(original), "Source card identity changed")
            for output, source_field in phrase["source"]["fieldMap"].items():
                ensure(phrase[output] == original[source_field], "Catalogue string changed")
                pair_report["fieldComparisons"] += 1
            if original["lv"] == 1:
                distribution = pair_report["historicalSourceLevelOneDistribution"]
                level_key = str(phrase["editorialLevel"])
                distribution[level_key] = distribution.get(level_key, 0) + 1
            return index

        for plan_level in plan["levels"]:
            level = plan_level["level"]
            level_title = localize(plan_level["title"], native)
            cell_rows = [phrase for phrase in canonical_rows if phrase["editorialLevel"] == level]
            cell_counts = {key: sum(phrase["contentType"] == key for phrase in cell_rows) for key in type_names}
            cell_lexical_counts = dict(sorted(Counter(phrase["lexicalClass"] for phrase in cell_rows
                                                     if phrase["contentType"] == "vocabulary").items()))
            cell = {"version": 2, "status": "editorial-review", "id": pair_id, "pairId": pair_id,
                    "nativeLanguage": native, "studyLanguage": study, "name": name, "flag": flag,
                    "level": level, "levelTitle": level_title, "totalPhrases": 0, "themes": [],
                    "heldThemes": [], "repertoirePath": repertoire_path,
                    "totalCanonicalPhrases": len(cell_rows), "counts": cell_counts, "lexicalClassCounts": cell_lexical_counts,
                    "reservedPhrases": len(reserve_by_level[level]), "reserve": reserve_by_level[level]}
            cell_report = {"level": level, "totalPhrases": 0, "totalCanonicalPhrases": len(cell_rows),
                           "reservedPhrases": len(cell["reserve"]), "counts": cell_counts, "lexicalClassCounts": cell_lexical_counts,
                           "cataloguePhrases": 0, "importedPhrases": 0, "themes": [], "steps": 0,
                           "heldThemes": [], "reservedCatalogueSourceIndices": [], "lexicalThemesWithoutSourceContent": []}
            for definition in definitions_by_level[level]:
                chosen = grouped_phrases[(level, definition["domain"])]
                stock = density[(level, definition["domain"])]
                if not chosen and not stock["visible"]:
                    if definition["section"] == "vocabulary":
                        cell_report["lexicalThemesWithoutSourceContent"].append({
                            "id": definition["id"], "domain": definition["domain"],
                            "reason": "No source entry currently assigned at this editorial level; no empty card or invented example generated.",
                            "needsEditorialReview": True})
                    continue
                presented_phrases = stock["reviewPhrases"] + stock["contextPhrases"] + chosen
                if definition.get("isAdditionalSituation"):
                    by_intent = {phrase["id"]: phrase.get("situationIntentId", phrase.get("intentId")) for phrase in chosen}
                    by_intent.update({reference["id"]: reference["intentId"] for reference in stock["contextReferences"]})
                    ensure(not stock["reviewReferences"], "A new situation cannot pad its eight intents with unrelated revisions")
                    presented_phrases.sort(key=lambda phrase: definition["intentIds"].index(by_intent[phrase["id"]]))
                if definition["contentType"] == "number":
                    presented_phrases = sorted(stock["reviewPhrases"], key=lambda phrase: (*phrase["numberOrder"], phrase["editorialLevel"], phrase["id"])) + sorted(chosen, key=lambda phrase: (*phrase["numberOrder"], phrase["id"]))
                theme = {"id": definition["id"], "domain": definition["domain"],
                         "visualId": definition["visualId"],
                         "title": localize(definition.get("studyLanguageTitleOverrides", {}).get(study, definition["title"]), native),
                         "optional": bool(definition.get("optional")), "isTemplateCollection": False,
                         "contentType": definition["contentType"], "section": definition["section"],
                         "totalPhrases": len(chosen), "phrases": chosen,
                         "reviewReferences": stock["reviewReferences"], "newCount": len(chosen),
                         "contextReferences": stock["contextReferences"], "reuseCount": stock["reuseCount"],
                         "reviewCount": stock["reviewCount"], "presentedCount": stock["presentedCount"],
                         "pedagogicalConceptCount": stock["pedagogicalConceptCount"], "densityStatus": stock["densityStatus"],
                         "presentationOrder": "plan-intent-order-with-explicit-preparations" if definition.get("isAdditionalSituation") else "earlier-reviews-then-new-primary",
                         "sequences": sequences(pair_id, level, definition["id"], presented_phrases, native,
                                                preparation_context, {item["id"] for item in stock["reviewReferences"]},
                                                {item["id"] for item in stock["contextReferences"]},
                                                preserve_input_order=bool(definition.get("isAdditionalSituation")),
                                                received_usages=[use for use in situation_resolution["receivedUses"]
                                                    if use["pair"] == pair_id and use["topicId"] == definition["domain"]] if situation_resolution else None) if stock["visible"] else []}
                if definition.get("isAdditionalSituation"):
                    theme.update(isAdditionalSituation=True, intentIds=definition["intentIds"], topicId=definition["domain"])
                    theme["authoredCount"] = sum(phrase["source"]["collection"] == "situation-authored" for phrase in chosen)
                    theme["existingSourceCount"] = theme["presentedCount"] - theme["authoredCount"]
                    usages = [use for use in situation_resolution["receivedUses"] if use["pair"] == pair_id and use["topicId"] == theme["domain"]]
                    if usages:
                        theme["receivedTurns"] = [{key: value for key, value in use.items() if key not in {"pair", "topicId"}} for use in usages]
                        theme["receivedCount"] = len(usages)
                        theme["lexicalSupports"] = support_references[theme["domain"]]
                        ensure(len({reference["id"] for reference in theme["lexicalSupports"]}) >= 2, "Each extended module needs two distinct lexical supports")
                    presented_ids = [ident for sequence in theme["sequences"] for ident in sequence["phraseIds"]]
                    ensure(len(presented_ids) == len(set(presented_ids)) == 8, "New situations must contain eight distinct whole phrases")
                    covered = {phrase.get("situationIntentId", phrase.get("intentId")) for phrase in chosen}
                    covered.update(reference["intentId"] for reference in theme["contextReferences"])
                    ensure(covered == set(theme["intentIds"]), "New situation has incomplete or duplicated intent coverage")
                ensure(definition["visualId"] in visuals, f"Missing active theme photograph: {definition['visualId']}")
                theme["photo"] = visuals[definition["visualId"]]
                cell["themes" if stock["visible"] else "heldThemes"].append(theme)
                source_indices = []
                for phrase in chosen:
                    ensure(phrase["contentType"] == theme["contentType"], "Mixed semantic types in a theme")
                    ensure(not phrase.get("isTemplate"), "A frame entered active training")
                    index = check_canonical_phrase(phrase)
                    if index is not None:
                        source_indices.append(index)
                steps = sum(len(sequence["steps"]) for sequence in theme["sequences"])
                for sequence in theme["sequences"]:
                    preparations = set()
                    for step in sequence["steps"]:
                        if step["kind"] == "receive":
                            ensure(step["utterance"] in received_models and step.get("countsForProgress") is False
                                   and step.get("requiresProduction") is False and step.get("analyse") is False,
                                   "Received turn entered production counts or lost its heard-only source")
                            ensure(step["utterance"] in sequence["receivedIds"] and step.get("prepares") in sequence["phraseIds"],
                                   "Received step has no explicit source and target")
                            continue
                        p = phrase_lookup[step["utterance"]]
                        ensure(p["editorialLevel"] == level or step.get("isReview") is True
                               and p["editorialLevel"] < level and p["id"] in bank
                               or step.get("isContextReuse") is True and p["editorialLevel"] <= level and p["id"] in bank,
                               "An unmarked future or earlier source entered a lesson step")
                        ensure(p["contentType"] == theme["contentType"], "A lesson step crosses semantic sections")
                        ensure(p["contentType"] not in {"incomplete", "review"} and not p.get("isTemplate"), "Reserved source assigned a lesson step")
                        if step.get("isPreparation"):
                            ensure(p["contentType"] == "utterance" and theme["section"] == "situations", "Only whole utterances may prepare situation utterances")
                            ensure(step["kind"] in ("understand", "imitate"), "Preparation assigned an unsupported step")
                            ensure(step["utterance"] in sequence["preparationIds"] and step.get("prepares") in sequence["phraseIds"],
                                   "Preparation does not point to a canonical phrase and a primary target")
                        if step["kind"] == "imitate":
                            preparations.add(step["utterance"])
                        if step["kind"] == "choose-and-recall":
                            ensure(step["utterance"] in preparations, "Recall occurs before preparation")
                cell_report["themes" if stock["visible"] else "heldThemes"].append({"id": theme["id"], "domain": theme["domain"],
                    "contentType": theme["contentType"], "section": theme["section"],
                    "newCount": theme["newCount"], "reviewCount": theme["reviewCount"],
                    "reuseCount": theme["reuseCount"],
                    "presentedCount": theme["presentedCount"], "densityStatus": theme["densityStatus"],
                    "authoredCount": theme.get("authoredCount", 0), "existingSourceCount": theme.get("existingSourceCount", 0),
                    "visualId": theme["visualId"], "phrases": len(chosen), "catalogueSourceIndices": source_indices,
                    "importedPhraseIds": [phrase["id"] for phrase in chosen if phrase["source"]["collection"] == "conversation"]})
                cell_report["cataloguePhrases"] += len(source_indices)
                cell_report["importedPhrases"] += sum(p["source"]["collection"] == "conversation" for p in chosen)
                cell_report.setdefault("authoredPhrases", 0)
                cell_report["authoredPhrases"] += sum(p["source"]["collection"] == "editorial-authored" for p in chosen)
                cell_report.setdefault("situationAuthoredPhrases", 0)
                cell_report.setdefault("situationConversationPhrases", 0)
                cell_report["situationAuthoredPhrases"] += sum(p["source"]["collection"] == "situation-authored" for p in chosen)
                cell_report["situationConversationPhrases"] += sum(p["source"]["collection"] == "situation-conversation" for p in chosen)
                cell_report.setdefault("situationSupportAuthoredPhrases", 0)
                cell_report.setdefault("situationSupportConversationPhrases", 0)
                cell_report.setdefault("receivedSteps", 0)
                cell_report["situationSupportAuthoredPhrases"] += sum(p["source"]["collection"] == "situation-support-authored" for p in chosen)
                cell_report["situationSupportConversationPhrases"] += sum(p["source"]["collection"] == "situation-support-conversation" for p in chosen)
                cell_report["receivedSteps"] += len(theme.get("receivedTurns", []))
                cell_report["steps"] += steps
                total_steps += steps
            for phrase in cell["reserve"]:
                ensure(phrase["contentType"] in {"incomplete", "review"}, "An active phrase entered reserve")
                index = check_canonical_phrase(phrase)
                if index is not None:
                    cell_report["reservedCatalogueSourceIndices"].append(index)
                    cell_report["cataloguePhrases"] += 1
            cell["totalPhrases"] = sum(len(theme["phrases"]) for theme in cell["themes"] + cell["heldThemes"])
            cell["heldPhrases"] = sum(len(theme["phrases"]) for theme in cell["heldThemes"])
            cell["visibleCanonicalPhrases"] = cell["totalPhrases"] - cell["heldPhrases"]
            cell["presentedCount"] = sum(theme["presentedCount"] for theme in cell["themes"])
            cell["contextReuseCount"] = sum(theme["reuseCount"] for theme in cell["themes"])
            ensure(cell["totalPhrases"] + len(cell["reserve"]) == cell["totalCanonicalPhrases"], "Active plus reserve does not cover level")
            cell_report["totalPhrases"] = cell["totalPhrases"]
            cell_report["heldPhrases"] = cell["heldPhrases"]
            cell_report["visibleCanonicalPhrases"] = cell["visibleCanonicalPhrases"]
            cell_report["presentedCount"] = cell["presentedCount"]
            cell_report["contextReuseCount"] = cell["contextReuseCount"]
            relative_path = f"content/niveaux-progressifs/{pair_id}/L{level}.json"
            pair_manifest["levels"].append({"level": level, "title": level_title,
                "totalPhrases": cell["totalPhrases"], "totalCanonicalPhrases": cell["totalCanonicalPhrases"],
                "reservedPhrases": cell["reservedPhrases"], "counts": cell_counts, "lexicalClassCounts": cell_lexical_counts,
                "heldPhrases": cell["heldPhrases"], "heldThemeCount": len(cell["heldThemes"]),
                "additionalSituationCount": sum(bool(theme.get("isAdditionalSituation")) for theme in cell["themes"]),
                "contextReuseCount": cell["contextReuseCount"],
                "presentedCount": cell["presentedCount"], "themeCount": len(cell["themes"]), "dataPath": relative_path})
            pair_report["levels"].append(cell_report)
            outputs[ROOT / "melunga_deploy" / relative_path] = json.dumps(cell, ensure_ascii=False, separators=(",", ":")) + "\n"
        ensure(sorted(seen_indices) == list(range(len(decks[study]))), f"Missing or repeated catalogue indices in {pair_id}")
        ensure(len(seen_ids) == len(set(seen_ids)) == len(canonical_rows), f"Repeated or missing runtime phrase identity in {pair_id}")
        ensure(sum(pair_report["historicalSourceLevelOneDistribution"].values()) == historical,
               f"Historical source-level-one cards missing in {pair_id}")
        for (move_pair, index), move in moves.items():
            if move_pair != pair_id:
                continue
            target = catalogue_lookup[index]
            for prerequisite in move.get("plannedPrerequisiteIndices", []):
                other = catalogue_lookup[prerequisite]
                target_position, prerequisite_position = final_positions[index], final_positions[prerequisite]
                earlier = prerequisite_position < target_position
                local_presentations = [item for item in report["localPreparations"]
                    if item["pair"] == pair_id and item["themeId"] == source_themes[index]
                    and item["preparationSourceIndex"] == prerequisite
                    and final_positions[item["beforeTargetSourceIndex"]] <= target_position]
                reserved = target["contentType"] in {"incomplete", "review"} or other["contentType"] in {"incomplete", "review"}
                lexical = other["contentType"] in {"vocabulary", "number"}
                structural = target["contentType"] == other["contentType"] == "utterance"
                held = index in held_indices or prerequisite in held_indices
                effective = structural and not held and (earlier or bool(local_presentations))
                if held:
                    link_kind, link_status, blocker = "held", "held-source-not-presented", True
                elif reserved:
                    link_kind, link_status, blocker = "reserve", "reserved-reference-not-exercised", True
                elif lexical:
                    future = other["editorialLevel"] > target["editorialLevel"]
                    link_kind, link_status, blocker = "lexical", "future-level-lexical-gap" if future else "lexical-reuse-planned-not-presented-in-situation", future
                elif structural:
                    link_kind = "structural-utterance"
                    link_status = "earlier-planned-utterance" if earlier else "locally-presented-before-target" if local_presentations else "utterance-not-earlier"
                    blocker = not effective
                else:
                    link_kind, link_status, blocker = "other", "cross-type-reference-needs-review", True
                report["plannedPrerequisites"].append({"pair": pair_id, "sourceIndex": index,
                    "prerequisiteSourceIndex": prerequisite, "targetContentType": target["contentType"],
                    "prerequisiteContentType": other["contentType"], "linkKind": link_kind,
                    "appearsEarlierInEditorialOrder": earlier, "status": link_status,
                    "isValidationBlocker": blocker,
                    "targetRequiresProduction": target["contentType"] not in {"incomplete", "review"},
                    "prerequisiteIsIncomplete": other["contentType"] == "incomplete",
                    "prerequisiteImitationScheduledBeforeTarget": bool(local_presentations) or bool(
                        structural and earlier and target_position[0] == prerequisite_position[0]
                        and source_themes[index] == source_themes[prerequisite]),
                    "claimsMasteryOrConstructionReadiness": False, "themeOrderEnforced": False,
                    "preparationEffectivelyPresentedBefore": bool(local_presentations),
                    "editorialReferenceOrderSatisfied": effective,
                    "localPresentationStepIds": [step_id for item in local_presentations for step_id in item["stepIds"]],
                    "targetEditorialPosition": {"level": target_position[0], "themeOrder": target_position[1] + 1, "phraseOrder": target_position[2] + 1},
                    "prerequisiteEditorialPosition": {"level": prerequisite_position[0], "themeOrder": prerequisite_position[1] + 1, "phraseOrder": prerequisite_position[2] + 1},
                    "doesNotProveAcquisition": True})
        pair_report["classificationReasons"] = dict(sorted(reasons.items()))
        pair_report["lexicalFamilyReasons"] = dict(sorted(lexical_reasons.items()))
        catalogue_count += len(seen_indices)
        field_count += pair_report["fieldComparisons"]
        report["pairs"].append(pair_report)
        manifest["pairs"].append(pair_manifest)
    ensure(catalogue_count == 32115, "Unexpected catalogue scope; update and review the inventory first")
    ensure(field_count == 110277, "Unexpected copied catalogue field scope")
    ensure(APP.read_bytes() == app_raw, "Source app changed during generation; retry on a stable snapshot")
    for source in semantic_sources:
        ensure(file_sha(ROOT / source["file"]) == source["fileSha256"], "A semantic partition changed during generation")
    for path, key in ((PLAN, "planSha256"), (DECISIONS, "decisionsSha256"),
                      (VOCABULARY_POLICY, "vocabularyPolicySha256"), (VISUALS, "visualRegistrySha256"),
                      (AUTHORED, "authoredFileSha256"), (DENSITY_POLICY, "densityPolicySha256")):
        ensure((file_sha(path) if path.exists() else None) == report[key], f"Input changed during generation: {path.name}")
    for introduction in all_introductions:
        ensure(file_sha(ROOT / introduction["overlayFile"]) == introduction["overlaySha256"], "An introduction overlay changed during generation")
    if situation_resolution:
        for relative, fingerprint in situation_resolution["fingerprints"].items():
            ensure(file_sha(ROOT / relative) == fingerprint, "A frozen situation input changed during generation")
    overall_counts = {key: sum(pair["counts"][key] for pair in manifest["pairs"]) for key in type_names}
    report["checks"] = {"pairs": len(pairs), "levelCells": len(pairs) * 10,
        "catalogueCardsRetainedExactlyOnce": catalogue_count, "sourceLevelOneCardsRetained": sum(value[4] for value in pairs.values()),
        "catalogueFieldComparisons": field_count, "catalogueFieldDifferences": 0,
        "explicitLevelChanges": sum(phrase["editorialLevel"] != phrase["source"]["sourceLevel"] for pair_rows in rows.values() for phrase in pair_rows if phrase["source"]["collection"].startswith("DECKS.")),
        "historicalLevelDecisions": len(moves), "lexicalIntroductionDecisions": len(lexical_introductions),
        "phraseIntroductionDecisions": len(phrase_introductions),
        "complementIntroductionDecisions": len(introduction_complement),
        "relationIntroductionDecisions": len(relation_introductions),
        "relationProgressionDecisions": len(relation_progression),
        "numberIntroductionDecisions": len(number_introductions),
        "numberIntroductionLevelChanges": sum(item["sourceLevel"] != item["proposedLevel"] for item in number_introductions),
        "catalogueCardsWithExplicitDecision": len(explicit_level_keys),
        "catalogueCardsRetainingUnreviewedSourceLevel": catalogue_count - len(explicit_level_keys),
        "semanticPartitionedCatalogueCards": len(semantic_types), "contentTypeCounts": overall_counts,
        "allSemanticPartitionsExact": True, "situationStepsContainOnlyUtterances": True,
        "reservedPhrasesHaveNoLessonSteps": True,
        "enrichmentCandidates": len(enrichment_items),
        "excludedEnrichmentCandidates": len(report["excludedEnrichmentCandidates"]),
        "exactCatalogueEnrichmentBridges": sum(item["kind"] == "catalogue-bridge" for item in report["enrichments"]),
        "importedExistingPhrases": sum(item["kind"] == "imported-existing-phrase" for item in report["enrichments"]),
        "importedSourceFieldComparisons": imported_fields,
        "totalPresentedPhrases": sum(pair["totalPhrases"] for pair in manifest["pairs"]),
        "totalCanonicalPhrases": sum(pair["totalCanonicalPhrases"] for pair in manifest["pairs"]),
        "reservedPhrases": sum(pair["reservedPhrases"] for pair in manifest["pairs"]),
        "visibleCanonicalPhrases": sum(item["newCount"] for item in report["density"] if item["visible"]),
        "heldCanonicalPhrases": sum(item["newCount"] for item in report["density"] if not item["visible"]),
        "heldThemeCount": sum(not item["visible"] for item in report["density"]),
        "visibleThemeCount": sum(item["visible"] for item in report["density"]),
        "presentationsIncludingReviews": sum(item["presentedCount"] for item in report["density"] if item["visible"]),
        "reviewPresentationReferences": sum(item["reviewCount"] for item in report["density"] if item["visible"]),
        "contextPresentationReferences": sum(item.get("reuseCount", 0) for item in report["density"] if item["visible"]),
        "reviewTransportCopies": sum(item["transportCopies"] for item in report["reviewTransports"]),
        "heldThemesAreNotUsedAsReviewSources": True, "allVisibleThemesAtLeastSixConcepts": True,
        "sourceTemplateMarkerCount": sum(bool(phrase.get("sourceDeclaredTemplate")) for row in rows.values() for phrase in row),
        "reviewedSourceTemplateExceptions": len(report["sourceTemplateExceptions"]),
        "templatePhrasesWithoutProduction": template_count, "steps": total_steps,
        "everyRecallPreparedInSameInternalGroup": True,
        "plannedPrerequisiteLinks": len(report["plannedPrerequisites"]),
        "plannedPrerequisitesNotEarlier": sum(not item["appearsEarlierInEditorialOrder"] for item in report["plannedPrerequisites"]),
        "localPreparationReferences": len(report["localPreparations"]),
        "localPreparationDistinctPhrases": len({item["preparationId"] for item in report["localPreparations"]}),
        "localPreparationSteps": sum(len(item["stepIds"]) for item in report["localPreparations"]),
        "plannedPrerequisitesWithoutEarlierPresentation": sum(not item["preparationEffectivelyPresentedBefore"] for item in report["plannedPrerequisites"]),
        "plannedPrerequisitesWithoutEditorialOrderClosure": sum(not item["editorialReferenceOrderSatisfied"] for item in report["plannedPrerequisites"]),
        "structuralUtteranceLinks": sum(item["linkKind"] == "structural-utterance" for item in report["plannedPrerequisites"]),
        "structuralUtteranceLinksOrderNotClosed": sum(item["linkKind"] == "structural-utterance" and not item["editorialReferenceOrderSatisfied"] for item in report["plannedPrerequisites"]),
        "lexicalPrerequisiteLinks": sum(item["linkKind"] == "lexical" for item in report["plannedPrerequisites"]),
        "plannedLexicalReuseReferences": sum(item["includedAsReuseReference"] for item in report["lexicalReuses"]),
        "reservedPrerequisiteLinks": sum(item["linkKind"] == "reserve" for item in report["plannedPrerequisites"]),
        "heldPrerequisiteLinks": sum(item["linkKind"] == "held" for item in report["plannedPrerequisites"]),
        "localPreparationGaps": len(report["localPreparationGaps"]),
        "localPreparationsDoNotInflatePrimaryPhraseCounts": True,
        "newlyAuthoredStudyPhrases": report["newlyAuthoredStudyPhrases"],
        "newlyAuthoredVocabularyEntries": sum(item["contentType"] == "vocabulary" for item in report["authoredEntries"]),
        "newlyAuthoredNumberEntries": sum(item["contentType"] == "number" for item in report["authoredEntries"]),
        "newlyAuthoredPhonetics": report["newlyAuthoredPhonetics"],
        "wholeHeadwordPhoneticsReusedForNewSense": sum(item["reusesWholeHeadwordPhonetic"] for item in report["authoredEntries"]),
        "newSituationAuthoredUtterances": sum(item["authored"] and item["category"] == "learner" for item in situation_resolution["entries"]) if situation_resolution else 0,
        "newSituationExistingConversationImports": sum(item["preexistingConversation"] and item["category"] == "learner" for item in situation_resolution["entries"]) if situation_resolution else 0,
        "newSituationThemes": len(additional_themes) * len(pairs) if situation_resolution else 0,
        "newSituationCandidatePositions": len(situation_resolution["uses"]) if situation_resolution else 0,
        "newSituationExistingSourcePositions": (len(situation_resolution["uses"]) - sum(item["authored"] and item["category"] == "learner" for item in situation_resolution["entries"])) if situation_resolution else 0,
        "newSituationWholePhoneticsPendingClaude": sum(item["authored"] and item["category"] == "learner" for item in situation_resolution["entries"]) if situation_resolution else 0,
        "allCatalogueSourceLevelsUnchanged": True}
    if situation_resolution:
        situation_entries = situation_resolution["entries"]
        report["checks"].update(
            receivedUsageCount=len(situation_resolution["receivedUses"]),
            newReceivedAuthoredModels=sum(entry["authored"] and entry["category"] == "received" for entry in situation_entries),
            receivedExistingConversationImports=sum(entry["preexistingConversation"] and entry["category"] == "received" for entry in situation_entries),
            receivedModelsExcludedFromProductionCounts=True,
            receivedDistinctModels=sum(len(models) for models in situation_resolution["heardModels"].values()),
            receivedExistingCanonicalModels=sum(len(models) for models in situation_resolution["heardModels"].values())-sum(entry["category"] == "received" for entry in situation_entries),
            extensionLearnerCreated=sum(entry["authored"] and entry["category"] == "learner" and entry["scope"] == "extension" for entry in situation_entries),
            extensionLearnerConversationImports=sum(entry["preexistingConversation"] and entry["category"] == "learner" and entry["scope"] == "extension" for entry in situation_entries),
            receivedExistingCanonicalUses=sum(use["utterance"] not in {entry["id"] for entry in situation_entries if entry["category"] == "received"} for use in situation_resolution["receivedUses"]),
            receivedStepCount=len(situation_resolution["receivedUses"]),
            productionStepCount=total_steps-len(situation_resolution["receivedUses"]),
            lexicalSupportUses=len(situation_resolution["lexicalSupportUses"]),
            newSituationAuthoredLexicalSupports=sum(entry["authored"] and entry["category"] == "support" for entry in situation_entries),
            newSituationImportedLexicalSupports=sum(entry["preexistingConversation"] and entry["category"] == "support" for entry in situation_entries))
        baseline = situation_resolution.get("baseline")
        if baseline:
            final_rows = {row["id"]: row for values in rows.values() for row in values}
            for identifier in baseline["protectedCanonicalIds"]:
                before, now = baseline["canonical"][identifier], final_rows[identifier]
                ensure(now["editorialLevel"] == before["level"] and now["placement"].get("themeId") == before["themeId"],
                       "A protected original model moved its first editorial location")
            for path, text in outputs.items():
                if path.parent.name not in pairs:
                    continue
                cell = json.loads(text)
                for theme in cell["themes"]:
                    old_hash = baseline["protectedThemeSha256"].get(cell["pairId"] + ":" + theme["id"])
                    ensure(old_hash is None or sha(theme) == old_hash, "An original situation theme changed during append-only extension")
            report["checks"].update(appendOnlyBaselineCanonicalCount=baseline["canonicalCount"],
                previousCanonicalTuplesAndSourcesIntact=len(baseline["canonical"]),
                protectedPreviousCanonicalLocationsIntact=len(baseline["protectedCanonicalIds"]),
                protectedOriginalSituationThemesIntact=len(baseline["protectedThemeSha256"]))
    ensure(report["checks"]["visibleCanonicalPhrases"] + report["checks"]["heldCanonicalPhrases"]
           == report["checks"]["totalPresentedPhrases"], "Density routing lost an active canonical entry")
    ensure(report["checks"]["visibleCanonicalPhrases"] + report["checks"]["reviewPresentationReferences"] + report["checks"]["contextPresentationReferences"]
           == report["checks"]["presentationsIncludingReviews"], "Reviews were counted as new canonical entries")
    ensure(report["checks"]["totalCanonicalPhrases"] == catalogue_count
           + report["checks"]["importedExistingPhrases"] + report["checks"]["newlyAuthoredStudyPhrases"]
           + report["checks"]["newSituationAuthoredUtterances"] + report["checks"]["newSituationExistingConversationImports"]
           + report["checks"].get("newSituationAuthoredLexicalSupports", 0) + report["checks"].get("newSituationImportedLexicalSupports", 0),
           "Source, imported and authored canonical scopes do not reconcile")
    report["editorialReferenceOrderClosed"] = not bool(report["checks"]["plannedPrerequisitesWithoutEditorialOrderClosure"]
                                                       or report["localPreparationGaps"])
    report["structuralUtteranceReferenceOrderClosed"] = not bool(report["checks"]["structuralUtteranceLinksOrderNotClosed"])
    report["checks"]["totalAuthoredEntriesAcrossLots"] = (report["checks"]["newlyAuthoredStudyPhrases"] + report["checks"]["newSituationAuthoredUtterances"]
        + report["checks"].get("newReceivedAuthoredModels", 0) + report["checks"].get("newSituationAuthoredLexicalSupports", 0))
    report["checks"]["totalNewWholePhoneticsAcrossLots"] = (report["checks"]["newlyAuthoredPhonetics"] + report["checks"]["newSituationWholePhoneticsPendingClaude"]
        + report["checks"].get("newReceivedAuthoredModels", 0) + report["checks"].get("newSituationAuthoredLexicalSupports", 0))
    report["progressivityValidationBlocked"] = not report["progressivityReviewComplete"]
    report["manifestSha256"] = sha(manifest)
    outputs[OUTPUT / "manifest.json"] = json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"
    # All original-source and access checks above remain authoritative. Apply
    # the separately evidenced edition only after those checks have completed.
    if include_situations:
        outputs, correction_summary = phonetic_corrections.apply_to_outputs(ROOT, outputs, report)
        report["phoneticCorrections"] = correction_summary
        outputs, reviewed_fields_summary = reviewed_field_corrections.apply_to_outputs(ROOT, outputs, report)
        report["reviewedFieldCorrections"] = reviewed_fields_summary
        outputs, lot4_phonetic_summary = lot4_corrections.apply_to_outputs(ROOT, outputs, report, "phonetic")
        report["lot4PhoneticCorrections"] = lot4_phonetic_summary
        outputs, content_summary = lot4_corrections.apply_to_outputs(ROOT, outputs, report, "content")
        report["reviewedContentCorrections"] = content_summary
        outputs, lot5_fields_summary = lot5_corrections.apply_to_outputs(ROOT, outputs, report, "phonetic")
        report["lot5FieldCorrections"] = lot5_fields_summary
        outputs, lot5_content_summary = lot5_corrections.apply_to_outputs(ROOT, outputs, report, "content")
        report["lot5ContentCorrections"] = lot5_content_summary
        outputs, lot6_fields_summary = lot6_corrections.apply_to_outputs(ROOT, outputs, report, "phonetic")
        report["lot6FieldCorrections"] = lot6_fields_summary
        outputs, lot6_content_summary = lot6_corrections.apply_to_outputs(ROOT, outputs, report, "content")
        report["lot6ContentCorrections"] = lot6_content_summary
        outputs, lot7_phonetic_summary = lot7_corrections.apply_to_outputs(ROOT, outputs, report, "phonetic")
        report["lot7PhoneticCorrections"] = lot7_phonetic_summary
        outputs, lot7_content_summary = lot7_corrections.apply_to_outputs(ROOT, outputs, report, "content")
        report["lot7ContentCorrections"] = lot7_content_summary
        outputs, lot8_phonetic_summary = lot8_corrections.apply_to_outputs(ROOT, outputs, report, "phonetic")
        report["lot8PhoneticCorrections"] = lot8_phonetic_summary
        outputs, lot8_content_summary = lot8_corrections.apply_to_outputs(ROOT, outputs, report, "content")
        report["lot8ContentCorrections"] = lot8_content_summary
        outputs, lot8_erratum_summary = lot9_corrections.apply_to_outputs(ROOT, outputs, report, "erratum")
        report["lot8Erratum1Corrections"] = lot8_erratum_summary
        outputs, lot9_phonetic_summary = lot9_corrections.apply_to_outputs(ROOT, outputs, report, "phonetic")
        report["lot9PhoneticCorrections"] = lot9_phonetic_summary
        outputs, lot9_content_summary = lot9_corrections.apply_to_outputs(ROOT, outputs, report, "content")
        report["lot9ContentCorrections"] = lot9_content_summary
        outputs, english_classification_summary = english_classification.apply_to_outputs(ROOT, outputs, report, sequences)
        report["englishClassification"] = english_classification_summary
        for transport in report["reviewTransports"]:
            if transport["pair"] != "fr-en":
                transport["fileSha256"] = lot9_content_summary["transportSha256ByPair"][transport["pair"]]
        report["manifestSha256"] = sha(json.loads(outputs[OUTPUT / "manifest.json"]))
    # include_situations=False is the source-exact historical baseline used by
    # validate_situation_drafts.py. It is not a served runtime edition and has
    # no correction declaration; the current runtime checker rejects it as such.
    outputs[REPORT] = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    outputs[DOC] = markdown(report)
    return outputs, report

def markdown(report):
    checks = report["checks"]
    source_checks = report.get("historicalSourceChecksBeforeClassification", {}).get("checks", checks)
    counts = checks["contentTypeCounts"]
    lines = ["# Classement éditorial L1–L10 — proposition à relire", "",
        "Les thèmes de situation et les rubriques de vocabulaire figurent dans la même grille, sans nouvel écran de sélection. Une situation ne présente que des phrases ou répliques communicatives entières. Les mots, groupes lexicaux et nombres isolés se pratiquent dans leurs rubriques dédiées. Les modèles ouverts et les cas incertains sont conservés dans une réserve de revue, hors entraînement.", "",
        f"**{checks['catalogueCardsRetainedExactlyOnce']} cartes du catalogue** sont conservées exactement une fois, entre rubriques actives et réserve ; **{checks['catalogueFieldComparisons']} champs** sont vérifiés identiques aux sources avant application des couches figées d’aides, de lectures et de contenu tracées ci-dessous. Les identités source restent intactes ; les champs corrigés sont déclarés séparément, sans prétendre qu’ils figuraient dans la source originale. Les **{checks['sourceLevelOneCardsRetained']} cartes historiquement lv1** restent présentes avec leur niveau source. Les droits de l’application classique sont inchangés.", "",
        f"Le lot comporte **{checks['catalogueCardsWithExplicitDecision']} décisions explicites** de placement. Les **{checks['catalogueCardsRetainingUnreviewedSourceLevel']} autres cartes** gardent un niveau source non revu individuellement. Ni une partition complète ni la conservation des textes ne prouvent la progressivité ou l’acquisition.", "",
        "## Typage et couverture", "",
        "| Type | Nombre canonique | Destination |", "|---|---:|---|",
        f"| Répliques et phrases entières | {counts['utterance']} | Thèmes de situation |",
        f"| Vocabulaire | {counts['vocabulary']} | Familles lexicales et catégories déclarées |",
        f"| Nombres isolés | {counts['number']} | Nombres |",
        f"| Modèles incomplets | {counts['incomplete']} | Réserve, aucune étape |",
        f"| Cas à revoir | {counts['review']} | Réserve, aucune étape |", "",
        f"Total canonique : **{checks['totalCanonicalPhrases']}** ; contenu canonique hors réserve : **{checks['totalPresentedPhrases']}** ; réserve : **{checks['reservedPhrases']}**. Parmi les contenus hors réserve, **{checks['visibleCanonicalPhrases']}** sont présentés dans les thèmes et **{checks['heldCanonicalPhrases']}** restent dans **{checks['heldThemeCount']} thèmes en attente de consolidation**, accessibles à l’inventaire. Aucun thème de moins de six concepts n’est publié comme une petite leçon complète.", "",
        "Les sept partitions s’appuient sur des indices et une empreinte du deck source. Elles distinguent la fonction communicative du lexème : Bonjour, Merci ou Oui peuvent former une réplique entière ; un groupe lexical de plusieurs mots peut rester du vocabulaire. Le nombre de mots, la ponctuation et la catégorie source ne constituent pas à eux seuls ce jugement. Les classements candidats et leurs raisons restent exposés pour revue. Les familles lexicales déduites de signaux ou de l’ancien domaine sont aussi des propositions, sans prétention de relecture exhaustive.", "",
        "## Répartition active par niveau", "",
        "| Couple | L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 | L10 | Réserve | Canonique |",
        "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|"]
    for pair in report["pairs"]:
        lines.append("| " + pair["id"] + " | " + " | ".join(str(level["totalPhrases"]) for level in pair["levels"])
                     + f" | {pair['reservedPhrases']} | {pair['totalCanonicalPhrases']} |")
    correction = report.get("phoneticCorrections")
    if correction:
        lines.extend(["", "## Corrections phonétiques après validation des sources", "",
            f"Le registre `{correction['registryPath']}` applique **{correction['eventCount']} événements audités à {correction['correctionCount']} identifiants**, dans **{correction['occurrenceCount']} occurrences** canoniques ou de transport. Les deux cartes concernées par B puis D conservent cet ordre explicite. Aucune règle de calcul phonétique ni règle du ss retirée n’est exécutée.", "",
            "Chaque aide originale, son statut et sa provenance restent vérifiables ; cette première couche ne change que phon, le statut de correction et une annotation traçable après les contrôles de copie originale. Les cellules et les copies de révision emploient la même édition corrigée. Cette couche seule conserve textes étudiés, traductions, lectures/Pinyin, niveaux, types et droits ; les cinq corrections de lecture du lot suivant sont déclarées séparément ci-dessous.", "",
            "Cette application de corrections ciblées ne vaut pas validation phonétique globale. Les statuts de relecture du parcours restent en attente et la relecture native reste distincte.", "",
            f"Empreinte du registre : `{correction['registrySha256']}` ; preuves figées au commit `{correction['evidenceCommit']}`.", ""])
    reviewed_fields = report.get("reviewedFieldCorrections")
    if reviewed_fields:
        lines.extend(["", "## Lot 3 — aides et cinq lectures révisées, sans règle automatique", "",
            f"Le registre `{reviewed_fields['registryPath']}` applique **{reviewed_fields['phoneticEventCount']} aides entières et {reviewed_fields['readingEventCount']} Pinyin**, soit **{reviewed_fields['eventCount']} événements / {reviewed_fields['correctionCount']} identifiants**, après la couche précédente. Les sept prolongations d’une correction B conservent cette première annotation et déclarent leur nouvelle étape séparément.", "",
            f"L’édition comporte **{reviewed_fields['occurrenceCount']} objets corrigés** : {reviewed_fields['occurrenceProfiles'].get('canonical', 0)} canoniques, {reviewed_fields['occurrenceProfiles'].get('transport-phrase', 0)} copies de transport et {reviewed_fields['occurrenceProfiles'].get('received-model', 0)} modèles reçus. Dans cette couche, les cinq lectures changées sont les seuls Pinyin modifiés ; aucun champ d’étude, sens, emplacement, type ou droit d’accès ne change.", "",
            "Les valeurs avant entières, sources et annotations antérieures sont vérifiées avant application. Les deux registres figés ne sont pas des règles à étendre. Les gloses, propositions de niveaux/thèmes et conventions à arbitrer restent hors de ce raccord ; aucune validation native globale n’en découle.", "",
            f"Empreinte du registre : `{reviewed_fields['registrySha256']}` ; preuves figées au commit `{reviewed_fields['evidenceCommit']}`.", ""])
    lot4_phonetics = report.get("lot4PhoneticCorrections")
    if lot4_phonetics:
        lines.extend(["", "## Lot 4 — aides françaises pour sinophones", "",
            f"Le registre `{lot4_phonetics['registryPath']}` applique **{lot4_phonetics['eventCount']} événements figés** à **{lot4_phonetics['correctionCount']} identifiants**, dans **{lot4_phonetics['occurrenceCount']} objets** : {lot4_phonetics['occurrenceProfiles'].get('canonical', 0)} canoniques, {lot4_phonetics['occurrenceProfiles'].get('transport-phrase', 0)} copies de transport et {lot4_phonetics['occurrenceProfiles'].get('received-model', 0)} modèles reçus.", "",
            "Cette couche ne change que les aides entières attestées, leur statut phonétique et leur annotation distincte. Les textes, sens, lectures, types, emplacements et droits ne changent pas dans cette couche. La règle nommée A dans ce registre désigne des lectures à l’anglaise ; elle n’a aucun rapport avec l’ancienne proposition espagnole s→ss retirée. Aucune de ces règles n’est exécutée comme calcul extensible.", "",
            f"Empreinte du registre : `{lot4_phonetics['registrySha256']}`.", ""])
    content = report.get("reviewedContentCorrections")
    if content:
        lines.extend(["", "## Contenu certain — lot distinct des aides du lot 4", "",
            f"Le registre `{content['registryPath']}` porte **{content['eventCount']} événements sur {content['correctionCount']} identifiants** : 25 gloses natives amendées du lot 3, huit du lot 4, et les deux blocs complets 1900 et 757. Les **{content['approvedFieldCount']} champs approuvés** comprennent **{content['changedFieldCount']} valeurs effectivement changées** ; le sens de 757 est une garde inchangée.", "",
            f"Avec la copie de révision de 2451, la couche concerne **{content['occurrenceCount']} objets**, **{content['approvedRuntimeFields']} champs approuvés / {content['changedRuntimeFields']} changés**. La citation 1900 change étude, lecture, aide entière et sens en une seule opération ; 757 change étude et aide ensemble, en conservant sa glose. Ni suppression automatique de syllabes ni collage de nouvelles aides n’est calculé.", "",
            "Les champs source originaux et toutes les anciennes annotations restent vérifiables. Les blocs ne sont jamais appliqués champ par champ ; un avant inattendu ou une application partielle échoue. Les propositions incertaines, les thèmes/niveaux proposés et les conventions restent non appliqués. Le catalogue classique, les identifiants, les emplacements, les prix et les droits gratuits restent intacts. La relecture bornée de ces événements ne vaut pas certification native globale.", "",
            f"Empreinte du registre de contenu : `{content['registrySha256']}`.", ""])
    lot5_fields = report.get("lot5FieldCorrections")
    if lot5_fields:
        lines.extend(["", "## Lot 5 — aides et lectures japonaises indissociables", "",
            f"Le registre `{lot5_fields['registryPath']}` applique **quatre paires aide/lecture** : {lot5_fields['eventCount']} événements figés pour {lot5_fields['correctionCount']} identifiants, dans **{lot5_fields['occurrenceCount']} objets / {lot5_fields['changedRuntimeFields']} champs réellement changés**. La copie de 4320 reçoit les deux valeurs ; le modèle à trou 3771 reste réservé et sans production.", "",
            "Les deux champs de chaque paire sont contrôlés et appliqués ensemble ; une aide seule ou une lecture seule est refusée. L’étude japonaise et le sens restent inchangés dans cette couche. Ni allongement vocalique, ni particule, ni conversion mora/phonétique ne sont calculés pour d’autres cartes. Les origines et les annotations antérieures restent intacts.", "",
            f"Empreinte du registre : `{lot5_fields['registrySha256']}`.", ""])
    lot5_content = report.get("lot5ContentCorrections")
    if lot5_content:
        lines.extend(["", "## Gloses du lot 5 — registre de contenu distinct", "",
            f"Le registre `{lot5_content['registryPath']}` applique **{lot5_content['correctionCount']} gloses natives certaines**, dans **{lot5_content['occurrenceCount']} objets / {lot5_content['changedRuntimeFields']} champs changés**, après les paires d’aides/lectures. Les cinq mentions de 日本語 sont rendues comme japonais, sans modifier les textes étudiés ni leurs aides.", "",
            "Les 147 propositions incertaines de contenu, 604 propositions de classement et l’aide クッション à arbitrer ne sont pas appliquées. Les corrections de registre retenues sont des décisions par carte, pas une conversion globale de です en vouvoiement. Type, emplacement, niveau, identifiant, rôle, étape et droit restent conservés ; aucune validation native globale n’est déclarée.", "",
            f"Empreinte du registre de contenu : `{lot5_content['registrySha256']}`.", ""])
    if checks["newSituationThemes"]:
        lines.extend(["", "## Enrichissement de situations — lot distinct", "",
            f"{checks['newSituationThemes'] // checks['pairs']} rubriques de situation comportent chacune huit intentions dans les sept couples : **{checks['newSituationCandidatePositions']} positions pédagogiques**. Elles ne représentent pas autant de créations : **{checks['newSituationAuthoredUtterances']} formes entières réellement rédigées** et **{checks['newSituationExistingSourcePositions']} positions utilisant des sources préexistantes**. Parmi ces sources, **{checks['newSituationExistingConversationImports']} phrases de conversation** sont importées entières sans être comptées comme nouvelles rédactions.", "",
            f"Les **{checks['newSituationWholePhoneticsPendingClaude']} nouvelles aides entières** restent `pending-Claude`. Les 140 entrées du lot précédent sont inchangées et comptées séparément. Les recherches de doublons portent aussi sur l’index portable des 70 conversations : espaces, ponctuation et casse ne suffisent jamais à faire une nouvelle forme ; aucun champ source n’est normalisé à l’affichage.", "",
            f"**{checks['contextPresentationReferences']} réemplois contextuels** conservent l’identifiant, les champs et le premier emplacement canoniques. Une première rencontre au même niveau est autorisée, avec compréhension, imitation et rappel ici ; elle ne suppose aucune acquisition antérieure. Les sources plus tardives ne sont introduites plus tôt que par une décision explicite, tracée sans modifier leur niveau d’accès d’origine.", ""])
        if checks.get("receivedUsageCount"):
            lines.extend([
                f"Les dix-huit pistes supplémentaires ajoutent des échanges avec **{checks['receivedUsageCount']} répliques reçues**, dont **{checks['newReceivedAuthoredModels']} modèles entiers réellement rédigés pour l’écoute** et **{checks['receivedExistingConversationImports']} imports conversation réservés à l’écoute**. Les autres usages reçus réemploient un canonique existant sans le déplacer. Les reçus ont un rôle explicite, `analyse: false`, et une liste `answerWith` explicite ; les clôtures portent `answerWith: []`.", "",
                f"Une question est entendue immédiatement avant le rappel de sa réponse, après les étapes comprendre et imiter réellement inscrites ; la clôture vient immédiatement après la réponse. Ces **{checks['receivedStepCount']} étapes d’écoute** sont exclues du compteur et des mesures de production. Le niveau de première écoute ne déplace pas le niveau de première production d’une source existante.", "",
                f"Les modules déclarent **{checks['lexicalSupportUses']} références de soutien lexical**, dont **{checks['newSituationAuthoredLexicalSupports']} mots réellement rédigés** et **{checks['newSituationImportedLexicalSupports']} imports lexicaux entiers**. Les mots se trouvent dans leurs familles dédiées ; aucun n’est introduit en exercice de phrase et aucun ne gonfle les huit intentions du module.", "",
                f"Le verrou additif conserve les **{source_checks['previousCanonicalTuplesAndSourcesIntact']} tuples et sources du lot antérieur**, les **{source_checks['protectedPreviousCanonicalLocationsIntact']} premiers emplacements protégés** et les **{source_checks['protectedOriginalSituationThemesIntact']} thèmes initiaux**. Les nouvelles aides entières de production, de réception et de vocabulaire restent à relire par Claude ; cette conservation n’est pas une validation pédagogique ou native.", ""])
        lines.extend(["Dans ces rubriques de situation, les intentions 01 à 08 définissent l’ordre global : sources contextuelles et nouvelles premières rencontres restent mélangées à leur place. Le générateur ne repousse pas une conclusion au début sous prétexte qu’elle est réemployée. Les préparations structurelles explicites précèdent leur cible. La règle de révisions en amont reste applicable aux rubriques historiques, pas à ce nouveau déroulé de contexte.", ""])
    lines.extend(["", "## Réemploi de sources existantes", "",
        f"Phrases existantes importées depuis des variantes entières de conversation : **{checks['importedExistingPhrases']}**, avec **{checks['importedSourceFieldComparisons']} champs** copiés. Candidats exclus en attendant une décision sur l’aide ou le sens : **{checks['excludedEnrichmentCandidates']}**. Ces imports restent des copies entières.", "",
        f"Un lot distinct apporte **{checks['newlyAuthoredStudyPhrases']} nouvelles entrées entières**, dont **{checks['newlyAuthoredPhonetics']} transcriptions nouvelles** et **{checks['wholeHeadwordPhoneticsReusedForNewSense']} prononciation de mot entier reprise pour un nouveau sens**. Toutes restent marquées `pending-Claude` pour la revue phonétique ; aucune aide ancienne n’est modifiée ou assemblée.", "",
        f"Placements explicitement distingués : **{checks['historicalLevelDecisions']} décisions historiques**, **{checks['lexicalIntroductionDecisions']} introductions lexicales sourcées**, **{checks['numberIntroductionDecisions']} introductions numériques** et **{checks['phraseIntroductionDecisions']} introductions de phrases entières**. Parmi les introductions numériques, **{checks['numberIntroductionLevelChanges']} changent le niveau éditorial**. Les conflits avec une décision historique sont tracés, sans modification du niveau d’accès source.", "",
        f"Compléments distincts : **{checks['complementIntroductionDecisions']} introductions supplémentaires**, **{checks['relationIntroductionDecisions']} localisateurs chinois** et **{checks['relationProgressionDecisions']} placements progressifs de relations chinoises**. Les localisateurs restent des entrées lexicales de position, sans fausse équivalence avec les prépositions françaises ; leur regroupement fonctionnel conserve la famille précédente dans la provenance.", "",
        "## Densité et révisions sourcées", "",
        f"Les thèmes visibles réunissent **{checks['presentationsIncludingReviews']} présentations**, dont **{checks['reviewPresentationReferences']} révisions référencées**. Une même source reste une seule carte canonique. Les banques de transport contiennent **{checks['reviewTransportCopies']} copies de sources reprises sélectionnées**, vérifiables contre leur première cellule et marquées `referenceOnly` ; elles ne créent ni nouvelle carte ni nouvelle première rencontre.", "",
        "Chaque révision conserve la même famille et le même type, et sa première rencontre est strictement antérieure. Une source en attente de consolidation n’est jamais prétendue déjà présentée. Adjectifs et Couleurs constituent des répertoires cumulatifs explicites ; les autres thèmes reprennent le complément antérieur pertinent. Les révisions sont d’abord réactivées, avec leur rappel, puis viennent les nouveautés dans leurs propres groupes. Dans chacun des deux blocs, les adjectifs privilégient grand, petit, gros, beau, léger, lourd, triste, heureux, en regroupant les variantes de concept déclarées ; un prérequis topologique reste prioritaire. Les nombres suivent numberOrder, le niveau de première rencontre ne départageant que les égalités. Les autres révisions suivent leur première rencontre croissante. Ce déroulé ne prouve pas l’acquisition. Nouveautés, révisions et concepts distincts sont comptés séparément ; les variantes explicitement liées au même concept ne gonflent pas le seuil pédagogique.", "",
        "Chaque import vérifie le fichier source, la paire de langues, l’unité, l’indice de variante et les empreintes. Une copie exacte ne valide pas la conformité à la méthode phonétique de Kartech ; Claude doit encore la relire.", "",
        "## Préparation prévue et limites", "",
        f"Les groupes internes comptent au maximum cinq expressions primaires et s’enchaînent directement. Les **{checks['templatePhrasesWithoutProduction']} modèles source explicites** restent en réserve, sans étape de compréhension, imitation, rappel ou audio dans les leçons.", "",
        f"Parmi les **{checks['sourceTemplateMarkerCount']} marqueurs source de modèle**, **{checks['reviewedSourceTemplateExceptions']} faux marqueurs** ont une exception explicite approuvée par indice : entrées lexicales bornées ou formules conventionnelles complètes. Leur source reste intacte ; leur statut n’autorise aucune phrase fabriquée à partir d’un mot.", "",
        f"Le graphe déclare **{checks['plannedPrerequisiteLinks']} liens** : **{checks['structuralUtteranceLinks']} liens entre répliques entières**, **{checks['lexicalPrerequisiteLinks']} liens lexicaux**, **{checks['reservedPrerequisiteLinks']} liens touchant la réserve**, **{checks['heldPrerequisiteLinks']} liens touchant un contenu en attente de consolidation** et **{checks['plannedPrerequisiteLinks'] - checks['structuralUtteranceLinks'] - checks['lexicalPrerequisiteLinks'] - checks['reservedPrerequisiteLinks'] - checks['heldPrerequisiteLinks']} liens entre d’autres types, non clos et à revoir**. Les supports lexicaux admissibles sont référencés par **{checks['plannedLexicalReuseReferences']} `reuseVocabularyIds`** canoniques, au même niveau ou à un niveau antérieur documenté. Aucun mot ni nombre de ces références n’est inséré dans les étapes de situation.", "",
        f"Les reprises locales entre phrases entières ajoutent **{checks['localPreparationReferences']} références**, soit **{checks['localPreparationSteps']} étapes** de compréhension et d’imitation. Elles ne recopient pas la carte et n’augmentent pas le compteur primaire. Liens structurels sans fermeture de l’ordre éditorial : **{checks['structuralUtteranceLinksOrderNotClosed']}**. La fermeture globale vaut **{str(report['editorialReferenceOrderClosed']).lower()}** ; les références lexicales prévues et les liens vers réserve ne sont pas présentés comme une préparation accomplie.", "",
        f"Les deux compteurs de position et de reprise ont des périmètres différents : `plannedPrerequisitesNotEarlier` compte **{checks['plannedPrerequisitesNotEarlier']} liens** dont le prérequis ne précède pas la cible dans l’ordre canonique ; `plannedPrerequisitesWithoutEarlierPresentation` compte **{checks['plannedPrerequisitesWithoutEarlierPresentation']} liens** sans reprise locale explicitement insérée, y compris des prérequis déjà antérieurs dans l’ordre prévu. Ils ne mesurent pas l’acquisition et ne sont pas interchangeables.", "",
        "L’ordre entre thèmes reste libre. Un emplacement antérieur est un rendez-vous éditorial prévu, pas la preuve que la personne l’a parcouru ou acquis. Les étapes réellement ajoutées, les liens lexicaux, les réserves et les écarts sont détaillés séparément dans le JSON de rapport. Un cycle du graphe complet fait échouer la génération. Les dépendances à une source réservée restent des écarts explicites ; elles ne réintroduisent aucun modèle incomplet dans une leçon.", "",
        "L’adjudication retirant le lien de 我是学生 à la carte 是, rendue « oui / c’est ça » dans la source, reste tracée. Aucun sens n’est réécrit pour faire passer une métrique. La revue globale de progressivité reste incomplète.", "",
        "## Droits et diffusion", "",
        "Le champ source lv du catalogue n’est jamais écrit. L’application classique, son filtre isFreeCard(lv === 1), les prix et les abonnements restent indépendants de editorialLevel. Une future intégration doit préserver les droits source ; verrouiller tous les niveaux éditoriaux supérieurs à L1 retirerait des cartes historiquement gratuites et n’est pas autorisé par ce classement.", "",
        "Ces 70 fichiers constituent un aperçu de revue. Aucun contenu de cette proposition n’est publié dans les leçons de production par cet outil.", "",
        "## Reproduction", "", "```sh", "python3 -B tools/maquette-guidee/build_levels.py", "python3 -B tools/maquette-guidee/build_levels.py --check", "```", "",
        "Entrées : catalogue, plan de thèmes, décisions de placement, partitions sémantiques, politique de vocabulaire et snapshots conversation. Une identité, une partition, un niveau ou une empreinte incohérents fait échouer la génération. Le générateur et le JSON L1 approuvés restent intacts.", "",
        f"Empreinte du catalogue : `{report['sourceDecksSha256']}`.", ""])
    lot6_fields = report.get("lot6FieldCorrections")
    if lot6_fields:
        lines.extend(["## Raccord des aides et lectures coréennes — lot 6", "",
            f"Le registre `{lot6_fields['registryPath']}` applique **18 aides entières et cinq lectures liées** : {lot6_fields['eventCount']} événements figés dans **{lot6_fields['occurrenceCount']} objets / {lot6_fields['changedRuntimeFields']} champs changés**. Les cinq paires sont atomiques ; l’ancienne correction B de 3980 reste annotée. Le modèle reçu est corrigé en compréhension seule.", "",
            "Les 260 conventions, dont le batchim orthographique, ne sont pas appliquées. Aucun classement ni niveau n’est modifié.", "",
            f"Empreinte du registre : `{lot6_fields['registrySha256']}`.", ""])
    lot6_content = report.get("lot6ContentCorrections")
    if lot6_content:
        lines.extend(["## Lot de contenu coréen séparé — lot 6", "",
            f"Le registre `{lot6_content['registryPath']}` applique **45 gloses natives certaines et deux blocs étude/lecture/aide atomiques**, dans **{lot6_content['occurrenceCount']} objets / {lot6_content['changedRuntimeFields']} champs changés**, après le raccord phonétique. Les gloses et les blocs ont leurs preuves et leur annotation propres ; les aides antérieures restent dans leur provenance.", "",
            "Les 447 propositions de niveaux et thèmes restent non appliquées. Aucune règle universelle de registre ou de prononciation n’est inférée.", "",
            f"Empreinte du registre de contenu : `{lot6_content['registrySha256']}`.", ""])
    lot7_phonetic = report.get("lot7PhoneticCorrections")
    if lot7_phonetic:
        lines.extend(["## Raccord des aides anglaises — lot 7", "",
            f"Le registre `{lot7_phonetic['registryPath']}` applique **228 aides entières figées**, dont trois modèles reçus. Les copies de transport sont mises à jour : **{lot7_phonetic['occurrenceCount']} objets / {lot7_phonetic['changedRuntimeFields']} champs**. Aucune lecture n’est modifiée. Les étiquettes G/W/A/H/Z/T décrivent ces seuls événements ; aucune règle n’est étendue.", "",
            "Les 30 conventions restent en attente ; G applique localement le repère du g dur déjà retenu, et A désigne ici l’accent anglais, sans réactiver l’ancienne règle espagnole retirée.", "",
            f"Empreinte du registre : `{lot7_phonetic['registrySha256']}`.", ""])
    lot7_content = report.get("lot7ContentCorrections")
    if lot7_content:
        lines.extend(["## Lot de contenu anglais séparé — lot 7", "",
            f"Le registre `{lot7_content['registryPath']}` applique **11 gloses certaines et cinq blocs complets étude/aide, avec glose quand elle change**, dans **{lot7_content['occurrenceCount']} objets / {lot7_content['changedRuntimeFields']} champs**. Les deux blocs à deux champs gardent leur sens original, les trois autres changent les trois champs ensemble.", "",
            "Les 95 gloses incertaines, 689 propositions de thème/niveau/doublon et 30 conventions restent non appliquées. Aucun placement, niveau ni droit n’est modifié.", "",
            f"Empreinte du registre de contenu : `{lot7_content['registrySha256']}`.", ""])
    lot8_phonetic = report.get("lot8PhoneticCorrections")
    if lot8_phonetic:
        lines.extend(["## Aides espagnoles figées — lot 8", "",
            f"Le registre `{lot8_phonetic['registryPath']}` applique **63 aides entières**, dont un modèle reçu et une copie de transport : **{lot8_phonetic['occurrenceCount']} objets / {lot8_phonetic['changedRuntimeFields']} champs**. Aucune lecture ne change. Les 31 S, 11 G, dix R, neuf A et deux T sont des événements ciblés ; R ne s’étend pas aux autres r simples.", "",
            "Les 151 conventions, dont les 112 lignes de jota r/kh/rh, restent non appliquées. L’ancienne correction B de 3159 conserve sa provenance.", "",
            f"Empreinte du registre : `{lot8_phonetic['registrySha256']}`.", ""])
    lot8_content = report.get("lot8ContentCorrections")
    if lot8_content:
        lines.extend(["## Contenu espagnol séparé — lot 8", "",
            f"Le registre `{lot8_content['registryPath']}` applique **18 gloses, deux études de ponctuation seules et trois blocs atomiques étude/aide ± sens**, dans **{lot8_content['occurrenceCount']} objets / {lot8_content['changedRuntimeFields']} champs**. Les études seules gardent aides, sens et statuts phonétiques ; la copie du soutien estómago est mise à jour avec son canonique.", "",
            "Les 310 propositions et 119 corrections incertaines restent non appliquées. Aucun niveau, thème, rôle ou droit ne change.", "",
            f"Empreinte du registre de contenu : `{lot8_content['registrySha256']}`.", ""])
    for key, title, description in (
        ("lot8Erratum1Corrections", "Erratum espagnol EN71 après le lot 8", "Un événement figé épelle distinctement E et N ; la provenance du lot 8 est conservée."),
        ("lot9PhoneticCorrections", "Aides italiennes figées — lot 9", "70 aides entières, dont un modèle reçu ; quatre copies de transport sont conservées avec leur canonique. N ne couvre que les 63 cartes du registre. Aucune lecture ne change."),
        ("lot9ContentCorrections", "Contenu italien séparé — lot 9", "34 gloses certaines et trois blocs atomiques étude/sens/aide. Les 280 propositions, 30 conventions et 96 contenus incertains restent non appliqués."),
    ):
        batch = report.get(key)
        if batch:
            lines.extend(["## " + title, "", description, "",
                f"{batch['occurrenceCount']} objets / {batch['changedRuntimeFields']} champs. Registre `{batch['registryPath']}` ; SHA-256 `{batch['registrySha256']}`.", ""])
    classification = report.get("englishClassification")
    if classification:
        lines[2] = "Le classement anglais applique le registre accepté, en conservant les types de chaque carte. Les rubriques comportant plusieurs types sont marquées mixed, bornées par identifiants et signalées dans le rapport. Les mots ne sont pas réétiquetés phrases et les phrases ne sont pas réétiquetées mots. Les modèles incomplets et les réserves de classement restent hors production."
        lines = [line.replace("Le lot comporte **", "Le classement initial comportait **").replace("autres cartes** gardent un niveau source non revu individuellement.", "autres cartes** conservaient alors leur niveau source ; le registre anglais appliqué ensuite est déclaré séparément.").replace("Aucun thème de moins de six concepts n’est publié comme une petite leçon complète.", "Le classement anglais conserve visibles les thèmes devenus petits, avec des exceptions finies et des effectifs exposés ; il ne les complète pas artificiellement.") for line in lines]
        lines = [line.replace("Les 95 gloses incertaines, 689 propositions de thème/niveau/doublon et 30 conventions restent non appliquées. Aucun placement, niveau ni droit n’est modifié.", "À la livraison du lot 7, les propositions de classement n’étaient pas appliquées. Le présent registre anglais tranche leur classement séparément ; les 95 gloses incertaines et 30 conventions restent non appliquées, et les droits ne changent pas.") for line in lines]
        lines = [line.replace("Le verrou additif conserve les **", "Avant les couches de corrections et le classement anglais, le contrôle additif avait conservé les **").replace("premiers emplacements protégés** et les **", "premiers emplacements protégés** et les **").replace("thèmes initiaux**. Les nouvelles aides entières", "thèmes initiaux**. Ces compteurs sont historiques et ne décrivent pas les placements actuellement reclassés. Les nouvelles aides entières") for line in lines]
        lines.extend(["", "## Classement anglais accepté — registre distinct", "",
            "**670 opérations : 610 déplacements, dont 127 changements de niveau éditorial, 37 passages en réserve et 23 maintiens.** Les 4 704 identités canoniques restent présentes : 4 542 actives et 162 en réserve. Les champs étudiés, sens, aides, lectures, types et sources ne changent pas dans cette couche ; les niveaux source d’accès restent intacts.", "",
            f"Les trois nouveaux thèmes présentent chacun trois cartes. Les **{len(classification['smallThemeExceptions'])} petits thèmes** sont signalés sans ajout inventé ; **{len(classification['largeThemes'])} thèmes dépassent le seuil de suivi de 100 présentations**. Ce seuil est un repère d’inventaire, pas une preuve de difficulté ou une limite automatiquement imposée. Deux thèmes sans présentation sont retirés de la grille, avec leurs métadonnées conservées, sans suppression de carte.", "",
            "Les 151 placements traversant les anciens types de rubrique donnent 25 thèmes mixtes explicitement bornés. Neuf exceptions de classe lexicale conservent leurs annotations source. Les 29 compléments de situation suivent les huit intentions et leurs répliques reçues d’origine, sans les remplacer ni inventer des intentions supplémentaires.", "",
            f"Le déroulé courant contient **{checks['steps']} étapes**, dont **{checks['receivedStepCount']} reçues**, soit **{checks['productionStepCount']} étapes hors réception**. Ce compteur hors réception ne signifie pas que chaque étape exige une production orale. Les **{checks['explicitLevelChanges']} cartes catalogue** dont le niveau éditorial diffère du niveau source constituent un autre périmètre que les 127 déplacements entre niveaux de ce registre.", "",
            f"Le contrôle courant situationStepsContainOnlyUtterances vaut **{str(checks['situationStepsContainOnlyUtterances']).lower()}** : quatre identités lexicales approuvées dans les rubriques initialement de situation produisent **{checks['classifiedSituationNonUtteranceStepCount']} étapes**, avec leur type source conservé. Elles sont exposées dans classifiedSituationNonUtteranceSteps. Les situations additionnelles présentent désormais **{checks['additionalSituationPresentedPositions']} positions**, dont les 29 compléments classés après les intentions d’origine.", "",
            "Les 700 emplacements et 70 thèmes protégés appartiennent au contrôle historique avant les couches révisées ; ils sont conservés sous historicalSourceChecksBeforeClassification, sans prétendre être tous intacts dans le classement courant.", "",
            "Les révisions devenues incompatibles sont retirées des références : 22 références supprimées, quatre pointeurs mis à jour ; un soutien lexical change de pointeur. Les copies de transport suivent leur source. Have a good trip. reste une réplique entendue au niveau 2, alors que son identité de production est réservée au niveau canonique 3. La préparation locale de 2442 avant 2787 reste insérée.", "",
            f"Registre `{classification['registryPath']}` ; SHA-256 `{classification['registrySha256']}` ; preuve `{classification['evidenceCommit']}`. La lecture et l’ordre prévu ne démontrent pas l’acquisition. Aucune fusion ou publication n’est autorisée dans ce lot.", ""])
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    outputs, report = make()
    for path, content in outputs.items():
        if args.check:
            ensure(path.is_file() and path.read_text() == content, "Out of date: " + str(path.relative_to(ROOT)))
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)
    print(json.dumps(report["checks"], ensure_ascii=False))


if __name__ == "__main__":
    main()

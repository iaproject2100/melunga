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
OWNER_APPROVED_TEMPLATE_EXCEPTIONS = {
    ("fr-en", 3463), ("fr-ja", 2985), ("fr-ko", 2138),
    *(('zh-fr', index) for index in (2902, 3046, 3140, 3193, 3201, 3245, 3292, 3321)),
}
OUTPUT = ROOT / "melunga_deploy/content/niveaux-progressifs"
REPORT = ROOT / "docs/niveaux-progressifs/classement.json"
DOC = ROOT / "docs/niveaux-progressifs/classement.md"
LEGACY = Path(__file__).with_name("build_data.py")
spec = importlib.util.spec_from_file_location("approved_l1_builder", LEGACY)
legacy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(legacy)


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
        document = json.loads(path.read_text())
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
            if assignment["contentType"] == "vocabulary":
                ensure(assignment.get("lexicalClass") in {"adjective", "preposition", "adverb", "other", "uncertain"}
                       and assignment.get("lexicalClassReviewStatus") in allowed_reviews
                       and isinstance(assignment.get("lexicalClassReason"), str) and assignment["lexicalClassReason"].strip(),
                       f"Missing or invalid explicit lexical class: {pair_id}:{index}")
            else:
                ensure("lexicalClass" not in assignment,
                       f"A non-vocabulary entry declares a lexical class: {pair_id}:{index}")
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
                        "fileSha256": file_sha(path), "sourceDeckSha256": sha(decks[study]),
                        "status": document.get("status"),
                        "counts": dict(sorted(Counter(item["contentType"] for item in assignments).items())),
                        "reviewStatusCounts": dict(sorted(Counter(item["reviewStatus"] for item in assignments).items()))})
    return result, sources


def checked_vocabulary_policy():
    ensure(VOCABULARY_POLICY.is_file(), "Missing explicit vocabulary routing policy")
    policy = json.loads(VOCABULARY_POLICY.read_text())
    ensure(type(policy.get("version")) is int and policy["version"] == 1, "Unsupported vocabulary policy")
    families = policy.get("lexicalFamilies")
    ensure(isinstance(families, list) and len(families) == 10, "Expected seven contextual and three lexical-class families")
    family_ids = [item.get("id") for item in families]
    ensure(len(set(family_ids)) == 10, "Duplicate lexical family")
    definitions = policy.get("themeDefinitions")
    ensure(isinstance(definitions, list) and len(definitions) == 11, "Expected ten lexical themes and Numbers")
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
    by_class = {"adjective": "vocab-adjectifs", "preposition": "vocab-prepositions", "adverb": "vocab-adverbes"}
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
    for family in policy["lexicalFamilies"]:
        patterns = signals.get(family["id"], [])
        ensure(isinstance(patterns, list) and all(isinstance(value, str) for value in patterns), "Invalid lexical semantic signals")
        if any(re.search(pattern, normalized) for pattern in patterns):
            return family["id"], "source-semantic-signal-candidate"
    destination = policy.get("domainDestinations", {}).get(old_domain)
    ensure(destination in families, f"No safe lexical destination for DECKS.{study}:{source_index}")
    return destination, "previous-domain-fallback-needs-review"


def level_definitions(plan_level, policy):
    level = plan_level["level"]
    definitions = [{**item, "contentType": "utterance", "section": "situations"}
                   for item in plan_level["themes"] if item["domain"] != "personnaliser"]
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


def sequences(pair_id, level, theme_id, phrases, native, context=None):
    result = []
    locally_presented = set()
    for offset in range(0, len(phrases), 5):
        batch = phrases[offset:offset + 5]
        sid = f"{pair_id}:L{level}:{theme_id}:{offset // 5 + 1}"
        steps = []
        preparations = {}
        preparation_ids = []
        for position, phrase in enumerate(batch):
            prefix = f"{sid}:{position}"
            if context and phrase.get("contentType") == "utterance" and phrase["source"]["collection"].startswith("DECKS."):
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
                          "contentType": phrase["contentType"], "requiresProduction": False})
            if not phrase.get("isTemplate"):
                imitated = prefix + ":imitate"
                steps.append({"id": imitated, "kind": "imitate", "utterance": phrase["id"],
                              "wholePhrase": phrase["contentType"] == "utterance",
                              "contentType": phrase["contentType"], "requiresProduction": True})
                preparations[phrase["id"]] = {"understoodInStep": understood, "imitatedInStep": imitated}
        for position, phrase in enumerate(batch):
            if phrase.get("isTemplate"):
                continue
            steps.append({"id": f"{sid}:{position}:recall", "kind": "choose-and-recall",
                          "utterance": phrase["id"], "wholePhrase": phrase["contentType"] == "utterance",
                          "contentType": phrase["contentType"],
                          "requiresProduction": True, "preparedInSteps": preparations[phrase["id"]]})
        result.append({"id": sid, "title": f"第 {offset // 5 + 1} 组" if native == "zh" else f"Séquence {offset // 5 + 1}",
                       "phraseIds": [phrase["id"] for phrase in batch],
                       "preparationIds": list(dict.fromkeys(preparation_ids)), "steps": steps})
    return result


def make():
    app_raw, decks, plan, decisions, enrichment_items = read_inputs()
    domains = plan["domains"]
    pairs = {pair_id: (native, study, name, flag, historical)
             for pair_id, native, study, name, flag, historical in legacy.PAIRS}
    semantic_types, semantic_sources = checked_content_types(decks, pairs)
    vocabulary_policy = checked_vocabulary_policy()
    visuals = checked_visuals()
    moves = checked_moves(decisions, decks, {key: value[:2] for key, value in pairs.items()}, domains)
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
            level = move["proposedLevel"] if move else card["lv"]
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
                                    "decision": "explicit-proposal" if move else "source-level-retained",
                                    "reason": move["reason"] if move else "Niveau source conservé en attente de sa revue pédagogique.",
                                    "plannedPrerequisiteIndices": move.get("plannedPrerequisiteIndices", []) if move else []}}
            if semantic["contentType"] == "vocabulary":
                phrase["lexicalClass"] = semantic["lexicalClass"]
                phrase["semanticReview"].update(lexicalClassReason=semantic["lexicalClassReason"],
                                               lexicalClassStatus=semantic["lexicalClassReviewStatus"])
            if semantic.get("sourceTemplateException") is True:
                phrase["semanticReview"]["sourceTemplateException"] = True
            rows[pair_id].append(phrase)
            by_identity[pair_id][phrase_key(phrase)].append(phrase)
            by_study[pair_id][phrase["study"]].append(phrase)
            order_keys[phrase["id"]] = (1, index, index)
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
    # Routing is separate from the source level and the source text. A reserve
    # is canonical storage for review, never a hidden situation exercise.
    for pair_id, (_native, study, _name, _flag, _historical) in pairs.items():
        for phrase in rows[pair_id]:
            old_domain = phrase["placement"]["domain"]
            phrase["placement"]["originalDomain"] = old_domain
            content_type = phrase["contentType"]
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
                destination, rationale = lexical_family(decks[study][index], study, old_domain, vocabulary_policy, index, semantic)
                phrase["placement"].update(domain=destination, section="vocabulary",
                                          lexicalFamilyClassification=rationale)
            else:
                ensure(content_type == "utterance" and not phrase.get("isTemplate"), "Only complete utterances enter situations")
                ensure(old_domain != "personnaliser", "An active utterance cannot enter a frame collection")
                # Troubleshooting requests can contain a politeness formula;
                # their communicative function takes priority over greetings.
                if phrase["source"]["collection"].startswith("DECKS."):
                    card = decks[study][phrase["source"]["sourceIndex"]]
                    gloss = card["t"] if study == "fr" else card["frm"]
                    normalized = legacy.normal(gloss)
                    if re.search(r"\b(repet(?:e|es|ez|er)|lentement|ne comprends|pas compris|no comprendo)\b", normalized):
                        phrase["placement"].update(domain="comprendre", situationClassification="troubleshooting-function-candidate")
                    elif re.search(r"\b(gare|station|aeroport)\b", normalized) and re.search(r"\b(ou|trouve|direction|aller)\b", normalized):
                        phrase["placement"].update(domain="deplacements", situationClassification="travel-location-question-candidate")
                phrase["placement"]["section"] = "situations"

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
        pair_report = {"id": pair_id, "cataloguePhrases": len(decks[study]), "totalPresentedPhrases": len(active_rows),
                       "totalCanonicalPhrases": len(canonical_rows), "reservedPhrases": pair_manifest["reservedPhrases"],
                       "counts": counts, "lexicalClassCounts": lexical_counts,
                       "sourceLevelOneCards": historical, "levels": [], "fieldComparisons": 0,
                       "catalogueCardsWithExplicitDecision": sum(key[0] == pair_id for key in moves),
                       "catalogueCardsRetainingUnreviewedSourceLevel": len(decks[study]) - sum(key[0] == pair_id for key in moves),
                       "historicalSourceLevelOneDistribution": {}, "classificationReasons": {}, "lexicalFamilyReasons": {}}
        seen_indices, seen_ids = [], []
        final_positions, source_themes, grouped_phrases, reserve_by_level = {}, {}, {}, {}
        ancestors = dependency_ancestors(pair_id, moves)
        catalogue_lookup = {phrase["source"]["sourceIndex"]: phrase for phrase in canonical_rows
                            if phrase["source"]["collection"].startswith("DECKS.")}
        phrase_lookup = {phrase["id"]: phrase for phrase in canonical_rows}
        definitions_by_level = {item["level"]: level_definitions(item, vocabulary_policy) for item in plan["levels"]}
        for planned_level in plan["levels"]:
            level = planned_level["level"]
            for theme_position, definition in enumerate(definitions_by_level[level]):
                selected = [phrase for phrase in canonical_rows if phrase["editorialLevel"] == level
                            and phrase["contentType"] == definition["contentType"]
                            and phrase["placement"]["domain"] == definition["domain"]]
                selected = ordered_phrases(selected, pair_id, moves, order_keys, ancestors)
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

        preparation_context = {"byIndex": catalogue_lookup, "positions": final_positions,
                               "moves": moves, "presentations": report["localPreparations"],
                               "gaps": report["localPreparationGaps"]}
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
                    "totalCanonicalPhrases": len(cell_rows), "counts": cell_counts, "lexicalClassCounts": cell_lexical_counts,
                    "reservedPhrases": len(reserve_by_level[level]), "reserve": reserve_by_level[level]}
            cell_report = {"level": level, "totalPhrases": 0, "totalCanonicalPhrases": len(cell_rows),
                           "reservedPhrases": len(cell["reserve"]), "counts": cell_counts, "lexicalClassCounts": cell_lexical_counts,
                           "cataloguePhrases": 0, "importedPhrases": 0, "themes": [], "steps": 0,
                           "reservedCatalogueSourceIndices": [], "lexicalThemesWithoutSourceContent": []}
            for definition in definitions_by_level[level]:
                chosen = grouped_phrases[(level, definition["domain"])]
                if not chosen:
                    if definition["section"] == "vocabulary":
                        cell_report["lexicalThemesWithoutSourceContent"].append({
                            "id": definition["id"], "domain": definition["domain"],
                            "reason": "No source entry currently assigned at this editorial level; no empty card or invented example generated.",
                            "needsEditorialReview": True})
                    continue
                theme = {"id": definition["id"], "domain": definition["domain"],
                         "visualId": definition["visualId"],
                         "title": localize(definition.get("studyLanguageTitleOverrides", {}).get(study, definition["title"]), native),
                         "optional": bool(definition.get("optional")), "isTemplateCollection": False,
                         "contentType": definition["contentType"], "section": definition["section"],
                         "totalPhrases": len(chosen), "phrases": chosen,
                         "sequences": sequences(pair_id, level, definition["id"], chosen, native, preparation_context)}
                ensure(definition["visualId"] in visuals, f"Missing active theme photograph: {definition['visualId']}")
                theme["photo"] = visuals[definition["visualId"]]
                cell["themes"].append(theme)
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
                        p = phrase_lookup[step["utterance"]]
                        ensure(p["editorialLevel"] == level, "A preparation references another level")
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
                cell_report["themes"].append({"id": theme["id"], "domain": theme["domain"],
                    "contentType": theme["contentType"], "section": theme["section"],
                    "visualId": theme["visualId"], "phrases": len(chosen), "catalogueSourceIndices": source_indices,
                    "importedPhraseIds": [phrase["id"] for phrase in chosen if phrase["source"]["collection"] == "conversation"]})
                cell_report["cataloguePhrases"] += len(source_indices)
                cell_report["importedPhrases"] += len(chosen) - len(source_indices)
                cell_report["steps"] += steps
                total_steps += steps
            for phrase in cell["reserve"]:
                ensure(phrase["contentType"] in {"incomplete", "review"}, "An active phrase entered reserve")
                index = check_canonical_phrase(phrase)
                if index is not None:
                    cell_report["reservedCatalogueSourceIndices"].append(index)
                    cell_report["cataloguePhrases"] += 1
            cell["totalPhrases"] = sum(len(theme["phrases"]) for theme in cell["themes"])
            ensure(cell["totalPhrases"] + len(cell["reserve"]) == cell["totalCanonicalPhrases"], "Active plus reserve does not cover level")
            cell_report["totalPhrases"] = cell["totalPhrases"]
            relative_path = f"content/niveaux-progressifs/{pair_id}/L{level}.json"
            pair_manifest["levels"].append({"level": level, "title": level_title,
                "totalPhrases": cell["totalPhrases"], "totalCanonicalPhrases": cell["totalCanonicalPhrases"],
                "reservedPhrases": cell["reservedPhrases"], "counts": cell_counts, "lexicalClassCounts": cell_lexical_counts,
                "themeCount": len(cell["themes"]), "dataPath": relative_path})
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
                effective = structural and (earlier or bool(local_presentations))
                if reserved:
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
    overall_counts = {key: sum(pair["counts"][key] for pair in manifest["pairs"]) for key in type_names}
    report["checks"] = {"pairs": len(pairs), "levelCells": len(pairs) * 10,
        "catalogueCardsRetainedExactlyOnce": catalogue_count, "sourceLevelOneCardsRetained": sum(value[4] for value in pairs.values()),
        "catalogueFieldComparisons": field_count, "catalogueFieldDifferences": 0,
        "explicitLevelChanges": sum(move["sourceLevel"] != move["proposedLevel"] for move in moves.values()),
        "catalogueCardsWithExplicitDecision": len(moves),
        "catalogueCardsRetainingUnreviewedSourceLevel": catalogue_count - len(moves),
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
        "localPreparationGaps": len(report["localPreparationGaps"]),
        "localPreparationsDoNotInflatePrimaryPhraseCounts": True,
        "newlyAuthoredStudyPhrases": 0, "newlyAuthoredPhonetics": 0,
        "allCatalogueSourceLevelsUnchanged": True}
    report["editorialReferenceOrderClosed"] = not bool(report["checks"]["plannedPrerequisitesWithoutEditorialOrderClosure"]
                                                       or report["localPreparationGaps"])
    report["structuralUtteranceReferenceOrderClosed"] = not bool(report["checks"]["structuralUtteranceLinksOrderNotClosed"])
    report["progressivityValidationBlocked"] = not report["progressivityReviewComplete"]
    report["manifestSha256"] = sha(manifest)
    outputs[OUTPUT / "manifest.json"] = json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"
    outputs[REPORT] = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    outputs[DOC] = markdown(report)
    return outputs, report

def markdown(report):
    checks = report["checks"]
    counts = checks["contentTypeCounts"]
    lines = ["# Classement éditorial L1–L10 — proposition à relire", "",
        "Les thèmes de situation et les rubriques de vocabulaire figurent dans la même grille, sans nouvel écran de sélection. Une situation ne présente que des phrases ou répliques communicatives entières. Les mots, groupes lexicaux et nombres isolés se pratiquent dans leurs rubriques dédiées. Les modèles ouverts et les cas incertains sont conservés dans une réserve de revue, hors entraînement.", "",
        f"**{checks['catalogueCardsRetainedExactlyOnce']} cartes du catalogue** sont conservées exactement une fois, entre rubriques actives et réserve ; **{checks['catalogueFieldComparisons']} champs** restent identiques aux sources. Les **{checks['sourceLevelOneCardsRetained']} cartes historiquement lv1** restent présentes avec leur niveau source. Les droits de l’application classique sont inchangés.", "",
        f"Le lot comporte **{checks['catalogueCardsWithExplicitDecision']} décisions explicites** de placement. Les **{checks['catalogueCardsRetainingUnreviewedSourceLevel']} autres cartes** gardent un niveau source non revu individuellement. Ni une partition complète ni la conservation des textes ne prouvent la progressivité ou l’acquisition.", "",
        "## Typage et couverture", "",
        "| Type | Nombre canonique | Destination |", "|---|---:|---|",
        f"| Répliques et phrases entières | {counts['utterance']} | Thèmes de situation |",
        f"| Vocabulaire | {counts['vocabulary']} | Familles lexicales et catégories déclarées |",
        f"| Nombres isolés | {counts['number']} | Nombres |",
        f"| Modèles incomplets | {counts['incomplete']} | Réserve, aucune étape |",
        f"| Cas à revoir | {counts['review']} | Réserve, aucune étape |", "",
        f"Total canonique : **{checks['totalCanonicalPhrases']}** ; contenu actif : **{checks['totalPresentedPhrases']}** ; réserve : **{checks['reservedPhrases']}**. La réserve n’est ni supprimée de l’inventaire ni publiée comme une leçon de phrases complètes.", "",
        "Les sept partitions s’appuient sur des indices et une empreinte du deck source. Elles distinguent la fonction communicative du lexème : Bonjour, Merci ou Oui peuvent former une réplique entière ; un groupe lexical de plusieurs mots peut rester du vocabulaire. Le nombre de mots, la ponctuation et la catégorie source ne constituent pas à eux seuls ce jugement. Les classements candidats et leurs raisons restent exposés pour revue. Les familles lexicales déduites de signaux ou de l’ancien domaine sont aussi des propositions, sans prétention de relecture exhaustive.", "",
        "## Répartition active par niveau", "",
        "| Couple | L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 | L10 | Réserve | Canonique |",
        "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|"]
    for pair in report["pairs"]:
        lines.append("| " + pair["id"] + " | " + " | ".join(str(level["totalPhrases"]) for level in pair["levels"])
                     + f" | {pair['reservedPhrases']} | {pair['totalCanonicalPhrases']} |")
    lines.extend(["", "## Réemploi de sources existantes", "",
        f"Phrases existantes importées depuis des variantes entières de conversation : **{checks['importedExistingPhrases']}**, avec **{checks['importedSourceFieldComparisons']} champs** copiés. Candidats exclus en attendant une décision sur l’aide ou le sens : **{checks['excludedEnrichmentCandidates']}**. Aucune phrase ni phonétique nouvelle n’est composée.", "",
        "Chaque import vérifie le fichier source, la paire de langues, l’unité, l’indice de variante et les empreintes. Une copie exacte ne valide pas la conformité à la méthode phonétique de Kartech ; Claude doit encore la relire.", "",
        "## Préparation prévue et limites", "",
        f"Les groupes internes comptent au maximum cinq expressions primaires et s’enchaînent directement. Les **{checks['templatePhrasesWithoutProduction']} modèles source explicites** restent en réserve, sans étape de compréhension, imitation, rappel ou audio dans les leçons.", "",
        f"Parmi les **{checks['sourceTemplateMarkerCount']} marqueurs source de modèle**, **{checks['reviewedSourceTemplateExceptions']} faux marqueurs** ont une exception explicite approuvée par indice : entrées lexicales bornées ou formules conventionnelles complètes. Leur source reste intacte ; leur statut n’autorise aucune phrase fabriquée à partir d’un mot.", "",
        f"Le graphe déclare **{checks['plannedPrerequisiteLinks']} liens** : **{checks['structuralUtteranceLinks']} liens entre répliques entières**, **{checks['lexicalPrerequisiteLinks']} liens lexicaux**, **{checks['reservedPrerequisiteLinks']} liens touchant la réserve** et **{checks['plannedPrerequisiteLinks'] - checks['structuralUtteranceLinks'] - checks['lexicalPrerequisiteLinks'] - checks['reservedPrerequisiteLinks']} liens entre d’autres types, non clos et à revoir**. Les supports lexicaux admissibles sont référencés par **{checks['plannedLexicalReuseReferences']} `reuseVocabularyIds`** canoniques, au même niveau ou à un niveau antérieur documenté. Aucun mot ni nombre de ces références n’est inséré dans les étapes de situation.", "",
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

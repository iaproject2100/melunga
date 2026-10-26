"""Validated inputs and canonical resolution for the separate situation lot.

This module never writes product files. The ready catalogue is an explicit
freeze of the plan and language ledgers; partial writer files stay inactive.
"""
from __future__ import annotations

from collections import defaultdict
import hashlib
import json
from pathlib import Path
import re
import unicodedata


DIRECTORY = Path("docs/niveaux-progressifs/enrichissement-situations")
KINDS = {"catalogue-reference", "conversation-whole-entry", "editorial-authored-whole-entry", "candidate-reference"}


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def sha(value):
    return hashlib.sha256(canonical(value)).hexdigest()


def file_sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def ensure(condition, message):
    if not condition:
        raise ValueError(message)


def whole_fields(value, location):
    result = {}
    for field in ("study", "native", "phon"):
        ensure(isinstance(value.get(field), str) and value[field].strip(), f"Missing whole field {field}: {location}")
        result[field] = value[field]
    if "reading" in value:
        ensure(isinstance(value["reading"], str) and value["reading"].strip(), f"Empty source reading: {location}")
        result["reading"] = value["reading"]
    ensure(not re.search(r"\{[\w-]+\}|_{2,}", result["study"]), f"Open model cannot become a situation utterance: {location}")
    return result


def identity(value):
    return tuple(value.get(key) for key in ("study", "native", "phon", "reading"))


def form_key(study):
    """Comparison only: no stored text or pronunciation is normalized."""
    text = unicodedata.normalize("NFC", study).casefold()
    return "".join(character for character in text
                   if not character.isspace() and not unicodedata.category(character).startswith("P"))


def json_pointer(document, pointer):
    ensure(isinstance(pointer, str) and (pointer == "" or pointer.startswith("/")), "Invalid whole-entry JSON pointer")
    value = document
    for token in pointer.split("/")[1:] if pointer else []:
        token = token.replace("~1", "/").replace("~0", "~")
        if isinstance(value, list):
            ensure(token.isdigit() and 0 <= int(token) < len(value), "Source pointer index is invalid")
            value = value[int(token)]
        else:
            ensure(isinstance(value, dict) and token in value, "Source pointer key is absent")
            value = value[token]
    ensure(isinstance(value, dict), "Source pointer must identify a whole utterance object")
    return value


def read_plan(root):
    path = root / DIRECTORY / "plan.json"
    document = json.loads(path.read_text())
    themes = document.get("themes")
    ensure(isinstance(themes, list) and themes, "The situation plan needs themes")
    base_path = root / DIRECTORY / "plan-base10.json"
    if base_path.exists():
        base = json.loads(base_path.read_text())
        ensure(file_sha(base_path) == "01a6ddae871e0df8dcf27bfbbae254565c4fb3d55b767f4b75219ce991473604", "Protected base plan changed")
        ensure(themes[:len(base["themes"])] == base["themes"], "The original ten situation definitions changed")
    theme_ids, domains, visuals, intents = set(), set(), set(), {}
    for theme in themes:
        ensure(type(theme.get("level")) is int and 1 <= theme["level"] <= 10, "Situation level must be L1-L10")
        for field, seen in (("themeId", theme_ids), ("domain", domains), ("visualId", visuals)):
            ensure(isinstance(theme.get(field), str) and theme[field] and theme[field] not in seen, f"Duplicate situation {field}")
            seen.add(theme[field])
        ensure(isinstance(theme.get("title"), dict) and all(isinstance(theme["title"].get(lang), str) for lang in ("fr", "zh")), "Missing localized situation title")
        ensure(isinstance(theme.get("intents"), list) and len(theme["intents"]) == 8, "Each situation needs eight intents")
        for intent in theme["intents"]:
            ensure(isinstance(intent.get("id"), str) and intent["id"] not in intents, "Repeated situation intent")
            ensure(intent.get("level", intent.get("proposedLevel")) == theme["level"], "Intent is outside its theme level")
            intents[intent["id"]] = {"theme": theme, "intent": intent}
    received = document.get("receivedTurnsDefs", [])
    ensure(isinstance(received, list) and len({turn.get("id") for turn in received}) == len(received), "Repeated received definition")
    for turn in received:
        topic = next((theme for theme in themes if theme["id"] == turn.get("topicId")), None)
        ensure(topic and turn.get("analyse") is False and isinstance(turn.get("answerWith"), list), "Invalid planned received turn")
        anchor = turn.get("beforeIntentId") or turn.get("afterIntentId")
        ensure(bool(turn.get("beforeIntentId")) != bool(turn.get("afterIntentId")) and anchor in intents and intents[anchor]["theme"] is topic, "Received anchor is outside its theme")
        ensure(all(identifier in intents and intents[identifier]["theme"] is topic for identifier in turn["answerWith"]), "Received answer is outside its theme")
        ensure(bool(turn["answerWith"]) == bool(turn.get("beforeIntentId")) and (not turn.get("beforeIntentId") or anchor in turn["answerWith"]), "A question needs its target answer and a closure needs an explicit empty list")
        ensure(len(turn["answerWith"]) == len(set(turn["answerWith"])), "Repeated answer intent")
    return document, intents, file_sha(path)


def read_frozen_inputs(root, pairs):
    """Return None until a complete, explicitly frozen catalogue is prepared."""
    catalogue_path = root / DIRECTORY / "catalogue.json"
    if not catalogue_path.exists():
        return None
    catalogue = json.loads(catalogue_path.read_text())
    if catalogue.get("status") != "ready-for-preview":
        return None
    plan, intents, plan_sha = read_plan(root)
    ensure(catalogue.get("version") in (1, 2) and catalogue.get("planSha256") == plan_sha, "Frozen situation plan changed")
    extended = bool(catalogue.get("extensionPairFiles"))
    base_path = root / DIRECTORY / "plan-base10.json"
    base = json.loads(base_path.read_text()) if extended else plan
    base_sha = file_sha(base_path) if extended else plan_sha
    base_intents = {intent["id"] for theme in base["themes"] for intent in theme["intents"]}
    extension_intents = set(intents) - base_intents
    ensure(not extended or extension_intents and catalogue.get("basePlanSha256") == base_sha, "Extension has another base plan")
    index_relative = catalogue.get("searchIndexPath")
    ensure(isinstance(index_relative, str), "Frozen catalogue lacks its portable existing-form search index")
    index_path = (root / index_relative).resolve()
    ensure(index_path.is_relative_to((root / DIRECTORY).resolve()) and file_sha(index_path) == catalogue.get("searchIndexSha256"), "Existing-form search index changed")
    search_index = json.loads(index_path.read_text())
    ensure(search_index.get("version") == 1 and set(search_index.get("pairs", {})) == set(pairs), "Existing-form search index has another scope")
    items, received, supports, identifiers = [], [], [], set()
    fingerprints = {str(DIRECTORY / "plan.json"): plan_sha, str(DIRECTORY / "catalogue.json"): file_sha(catalogue_path), index_relative: catalogue["searchIndexSha256"]}
    if extended:
        fingerprints[str(DIRECTORY / "plan-base10.json")] = base_sha
    planned_received = {turn["id"]: turn for turn in plan.get("receivedTurnsDefs", [])}
    topics = {theme["id"]: theme for theme in plan["themes"]}

    def add(row, entry, path, category, pair):
        ensure(isinstance(row.get("id"), str) and row["id"] and row["id"] not in identifiers, "Repeated situation item ID")
        identifiers.add(row["id"])
        theme = topics.get(row.get("topicId"))
        ensure(theme and row.get("pair") == pair and row.get("proposedLevel") == theme["level"], "Candidate theme/level disagrees with plan")
        ensure(row.get("kind") in KINDS and row.get("editorialReviewStatus") == "reviewed" and isinstance(row.get("reason"), str) and row["reason"].strip(), "Invalid situation source or editorial reasoning")
        whole_fields(row, row["id"])
        ensure(isinstance(row.get("source"), dict) and isinstance(row.get("duplicateAudit"), dict), "Missing provenance or duplicate audit")
        copy = {**row, "_ledgerPath": str(path.relative_to(root)), "_ledgerSha256": entry["sha256"], "_category": category}
        if category == "learner":
            ensure(row.get("contentType") == "utterance" and row.get("intentId") in intents and intents[row["intentId"]]["theme"] is theme, "Invalid learner intent")
            items.append(copy)
        elif category == "received":
            definition_id = row.get("definitionId", row["id"].removeprefix(pair + "-"))
            definition = planned_received.get(definition_id)
            # IDs may be pair-prefixed; the definition ID stays explicit when needed.
            ensure(definition and definition["topicId"] == row["topicId"], "Received turn has no exact plan definition")
            for field in ("beforeIntentId", "afterIntentId", "answerWith"):
                ensure(row.get(field) == definition.get(field), "Received anchor/answerWith differs from plan")
            ensure(row.get("contentType") == "utterance" and row.get("analyse") is False and isinstance(row.get("answerWith"), list), "Received turn must be comprehension-only")
            ensure(isinstance(row.get("role"), dict) and all(isinstance(row["role"].get(language), str) and row["role"][language] for language in ("fr", "zh")), "Received usage lacks localized role")
            ensure(row["role"] == definition["role"]["label"], "Received role differs from its planned interlocutor")
            received.append(copy)
        else:
            ensure(row.get("contentType") in {"vocabulary", "number"} and isinstance(row.get("lexicalFamily"), str), "Lexical support must be an autonomous lexical entry")
            ensure(row.get("introducedBeforeIntentId") in {intent["id"] for intent in theme["intents"]}, "Lexical support has no target intent")
            if row["contentType"] == "vocabulary":
                ensure(isinstance(row.get("lexicalClass"), str), "Lexical support lacks its real lexical class")
            supports.append(copy)

    for file_key, expected_ids, expected_sha in (("pairFiles", base_intents, base_sha), ("extensionPairFiles", extension_intents, plan_sha)):
        if file_key == "extensionPairFiles" and not extended:
            continue
        files = catalogue.get(file_key)
        ensure(isinstance(files, list) and {entry.get("pair") for entry in files} == set(pairs) and len(files) == len(pairs), "Frozen catalogue needs all seven pair ledgers")
        for entry in files:
            pair = entry["pair"]
            path = (root / entry["path"]).resolve()
            ensure(path.is_relative_to((root / DIRECTORY).resolve()) and path.suffix == ".json", "Situation ledger is outside its directory")
            ensure(file_sha(path) == entry.get("sha256"), f"Frozen language ledger changed: {pair}")
            document = json.loads(path.read_text())
            ensure(document.get("version") == 1 and document.get("pair") == pair and document.get("planHash") == expected_sha, f"Wrong situation ledger identity: {pair}")
            rows = document.get("items")
            ensure(isinstance(rows, list) and len(rows) == len(expected_ids) and {row.get("intentId") for row in rows} == expected_ids, f"Situation intent coverage is not exact: {pair}")
            for row in rows:
                add(row, entry, path, "learner", pair)
            if file_key == "extensionPairFiles":
                turn_rows, support_rows = document.get("receivedTurns"), document.get("lexicalSupports")
                ensure(isinstance(turn_rows, list) and len(turn_rows) == len(planned_received), "Received coverage must match every plan cue")
                ensure(isinstance(support_rows, list), "Missing explicit lexical supports list")
                before_count = len(received)
                for row in turn_rows:
                    add(row, entry, path, "received", pair)
                ensure(len({row.get("definitionId", row["id"].removeprefix(pair + "-")) for row in received[before_count:]}) == len(planned_received), "Repeated received definition")
                for row in support_rows:
                    add(row, entry, path, "support", pair)
                for theme in plan["themes"][len(base["themes"]):]:
                    ensure(sum(row["topicId"] == theme["id"] for row in support_rows) >= 2, f"Each extended module needs two lexical supports: {pair}:{theme['id']}")
            fingerprints[str(path.relative_to(root))] = entry["sha256"]
    baseline = None
    if extended:
        baseline_path = root / DIRECTORY / "extension-pistes/baseline.json"
        baseline = json.loads(baseline_path.read_text())
        ensure(baseline.get("canonicalCount") == 32779, "Unexpected append-only baseline scope")
        fingerprints[str(baseline_path.relative_to(root))] = file_sha(baseline_path)
    return {"plan": plan, "intents": intents, "items": items, "receivedTurns": received,
            "lexicalSupports": supports, "baseIntentCount": len(base_intents), "baseline": baseline, "fingerprints": fingerprints, "searchIndex": search_index}


def source_entry(root, item, pair_info, decks, fingerprints, search_index=None):
    """Validate the complete declared source before any canonical deduplication."""
    fields = whole_fields(item, item["id"])
    source = item["source"]
    study = pair_info[1]
    kind = item["kind"]
    if kind == "catalogue-reference":
        index = source.get("sourceIndex")
        ensure(source.get("collection") == f"DECKS.{study}" and type(index) is int and 0 <= index < len(decks[study]), "Invalid catalogue situation reference")
        card = decks[study][index]
        mapping = {"study": "t", "native": "cn" if study == "fr" else "frm", "phon": "phon" if study == "fr" else "phf" if study == "zh" else "pf"}
        if study in ("zh", "ja", "ko"):
            mapping["reading"] = "py"
        expected = {output: card[field] for output, field in mapping.items()}
        ensure(fields == expected and source.get("sourceLevel") == card["lv"] and source.get("sourceSha256") == sha(card), f"Catalogue situation source changed: {item['id']}")
        ensure(item.get("phoneticReviewStatus") == "existing-verbatim", "Existing source was mislabeled as newly transcribed")
        return fields, {"canonicalId": f"catalogue:{study}:{index}", "source": source}
    if kind == "conversation-whole-entry":
        relative = source.get("path")
        ensure(isinstance(relative, str), "Missing conversation snapshot")
        path = (root / relative).resolve()
        ensure(path.is_relative_to((root / DIRECTORY / "sources").resolve()) and path.suffix == ".json", "Conversation evidence must be a portable full-file snapshot")
        ensure(file_sha(path) == source.get("fileSha256"), "Conversation snapshot fingerprint changed")
        if search_index is not None:
            registered = search_index["pairs"][item["pair"]]
            ensure(any(entry["sourceFile"] == path.name and entry["fileSha256"] == source["fileSha256"] for entry in registered["files"]),
                   "Conversation snapshot is not a registered historical parent; new writing must remain authored")
            ensure(any(entry["sourceFile"] == path.name and entry["jsonPointer"] == source.get("jsonPointer")
                       and entry["entrySha256"] == source.get("entrySha256") for entry in registered["entries"]),
                   "Conversation reference is not an indexed whole historical object")
        document = json.loads(path.read_text())
        ensure(document.get("nativeLanguage") == pair_info[0] and document.get("studyLanguage") == study, "Conversation snapshot has another language pair")
        entry = json_pointer(document, source.get("jsonPointer"))
        ensure(sha(entry) == source.get("entrySha256") and whole_fields(entry, item["id"]) == fields, "Conversation whole entry changed")
        ensure(item.get("phoneticReviewStatus") == "existing-verbatim", "Existing conversation help was relabeled as new")
        fingerprints[relative] = source["fileSha256"]
        return fields, {"source": source, "entry": entry, "sourceLevel": document.get("level")}
    if kind == "editorial-authored-whole-entry":
        ensure(item.get("phoneticReviewStatus") == "pending-Claude", "New whole-entry help needs explicit Claude review")
        return fields, {"source": source}
    ensure(kind == "candidate-reference" and bool(source.get("candidateId")) != bool(source.get("canonicalId")), "Candidate reuse needs one explicit item or canonical reference")
    return fields, {key: source[key] for key in ("candidateId", "canonicalId") if key in source} | {"source": source}


def resolve(root, frozen, rows, pairs, decks):
    """Resolve whole models once, keeping production, heard usage and supports distinct."""
    if frozen is None:
        return None
    by_id = {pair: {row["id"]: row for row in values} for pair, values in rows.items()}
    by_identity, by_form = {}, {}
    for pair, values in rows.items():
        by_identity[pair], by_form[pair] = defaultdict(list), defaultdict(list)
        for row in values:
            by_identity[pair][identity(row)].append(row)
            by_form[pair][form_key(row["study"])].append(row)
    all_items = frozen["items"] + frozen.get("lexicalSupports", []) + frozen.get("receivedTurns", [])
    items = {item["id"]: item for item in all_items}
    topics = {theme["id"]: theme for theme in frozen["plan"]["themes"]}
    external_forms = {pair: {form_key(entry["study"]) for entry in data["entries"]}
                      for pair, data in frozen["searchIndex"]["pairs"].items()}
    protected = set((frozen.get("baseline") or {}).get("protectedCanonicalIds", []))
    resolved, visiting, uses, entries, introductions = {}, set(), [], [], []
    heard_models, heard_uses, support_uses = {pair: {} for pair in pairs}, [], []

    def source_record(item, fields, proof, collection):
        raw = {key: value for key, value in item.items() if not key.startswith("_")}
        record = {"collection": collection, "kind": item["kind"], "ledgerFile": item["_ledgerPath"],
            "ledgerFileSha256": item["_ledgerSha256"], "itemId": item["id"],
            "sourceSha256": sha(raw) if item["kind"] == "editorial-authored-whole-entry" else proof["source"].get("entrySha256", sha(raw)),
            "ledgerItemSha256": sha(raw), "fieldMap": {key: key for key in fields}, "provenance": proof["source"]}
        if "sourceRole" in item:
            record["sourceRole"] = item["sourceRole"]
        if "sourceLevel" in proof:
            record["sourceLevel"] = proof["sourceLevel"]
        return record

    def introduction(item, model, domain, previous_level=None, previous_domain=None, newly_imported=False):
        before = model["editorialLevel"] if previous_level is None else previous_level
        if before <= item["proposedLevel"]:
            return
        is_base_item = Path(item["_ledgerPath"]).name == f"{item['pair']}.json"
        ensure(model["id"] not in protected or is_base_item, f"The original 560 situation uses and 140 words cannot move: {item['id']}")
        decision = item.get("introductionDecision", {})
        ensure(decision.get("action") == "introduce-earlier" and decision.get("fromEditorialLevel") == before
               and decision.get("proposedLevel") == item["proposedLevel"] and decision.get("reviewStatus") == "reviewed"
               and isinstance(decision.get("reason"), str) and decision["reason"].strip(),
               f"Future source requires an explicit first-introduction decision: {item['id']}")
        introductions.append({"pair": item["pair"], "canonicalId": model["id"], "itemId": item["id"],
            "previousEditorialLevel": before, "previousDomain": previous_domain or model["placement"]["domain"],
            "proposedLevel": item["proposedLevel"], "domain": domain, "decision": decision,
            **({"newToThisRuntime": True} if newly_imported else {})})
        if not newly_imported:
            model["editorialLevel"] = item["proposedLevel"]
            model["placement"].update(previousDomain=model["placement"]["domain"], domain=domain,
                classification="explicit-situation-first-introduction", reason=decision["reason"])
            if item.get("_category", "learner") == "learner":
                model["situationIntentId"] = item["intentId"]
                model["topicId"] = item["topicId"]

    def visit(item_id):
        if item_id in resolved:
            return resolved[item_id]
        ensure(item_id in items and item_id not in visiting, "Missing or cyclic candidate reference")
        visiting.add(item_id)
        item = items[item_id]
        pair, category = item["pair"], item.get("_category", "learner")
        fields, proof = source_entry(root, item, pairs[pair], decks, frozen["fingerprints"], frozen["searchIndex"])
        existing = None
        if "candidateId" in proof:
            other = items.get(proof["candidateId"])
            ensure(other and other["pair"] == pair, "Candidate reuse crosses language pairs")
            existing = visit(proof["candidateId"])
            ensure(identity(existing) == identity(fields), "Candidate reuse changes a whole field")
        elif "canonicalId" in proof:
            existing = by_id[pair].get(proof["canonicalId"])
            ensure(existing is not None and identity(existing) == identity(fields), f"Unknown or changed canonical source: {item_id}")
        elif by_identity[pair].get(identity(fields)):
            existing = min(by_identity[pair][identity(fields)], key=lambda row: (row.get("editorialLevel", row.get("firstHeardLevel", 11)), row["id"]))
        preferred = item["duplicateAudit"].get("preferredCanonicalId")
        if preferred:
            ensure(item["duplicateAudit"].get("decision") == "reuse-existing" and preferred in by_id[pair], "Unreviewed duplicate preference")
            existing = by_id[pair][preferred]
            ensure(identity(existing) == identity(fields), "A preferred canonical source must preserve every declared whole field")
        authored = item["kind"] == "editorial-authored-whole-entry"
        if existing is None:
            ensure(not by_form[pair].get(form_key(fields["study"])), f"Existing studied form needs whole-source reuse, not a new translation: {item_id}")
            ensure(not authored or form_key(fields["study"]) not in external_forms[pair],
                   f"Authored form already exists in the conversation corpus: {item_id}")
            if category == "received":
                collection = "situation-received-authored" if authored else "situation-received-conversation"
                existing = {"id": ("heard-authored:" if authored else "heard-conversation:") + item_id,
                    **fields, "contentType": "utterance", "heardOnly": True,
                    "firstHeardLevel": item["proposedLevel"], "isTemplate": False,
                    "phoneticReviewStatus": item["phoneticReviewStatus"],
                    "source": source_record(item, fields, proof, collection)}
                if "readingScript" in item:
                    existing["readingScript"] = item["readingScript"]
                heard_models[pair][existing["id"]] = existing
            else:
                topic = topics[item["topicId"]]
                is_support = category == "support"
                collection = ("situation-support-authored" if authored else "situation-support-conversation") if is_support else ("situation-authored" if authored else "situation-conversation")
                canonical_id = (("situation-support-authored:" if authored else "situation-support-conversation:") if is_support else ("situation-authored:" if authored else "situation-conversation:")) + item_id
                domain = item["lexicalFamily"] if is_support else topic["domain"]
                existing = {"id": canonical_id, **fields, "speaker": "A", "kind": "learner", "contentType": item["contentType"],
                    "isTemplate": False, "sourceDeclaredTemplate": False, "editorialLevel": item["proposedLevel"],
                    "phoneticReviewStatus": item["phoneticReviewStatus"], "source": source_record(item, fields, proof, collection),
                    "semanticReview": {"status": "reviewed", "reason": item["reason"]},
                    "placement": {"domain": domain, "section": "vocabulary" if is_support else "situations",
                        "classification": "new-situation-lexical-support" if is_support else "new-situation-whole-utterance",
                        "reason": item["reason"], "plannedPrerequisiteIndices": []}}
                if is_support:
                    existing["lexicalClass"] = item.get("lexicalClass", "other")
                    existing["placement"]["lexicalFamilyClassification"] = "reviewed-whole-situation-support"
                    for key in ("lexicalConceptId", "lexicalUsage", "numberKind", "numberValue", "numberOrder"):
                        if key in item:
                            existing[key] = item[key]
                else:
                    existing.update(intentId=item["intentId"], topicId=item["topicId"])
                if "readingScript" in item:
                    existing["readingScript"] = item["readingScript"]
                if not authored and type(proof.get("sourceLevel")) is int:
                    introduction(item, existing, domain, proof["sourceLevel"], "conversation-source", True)
                rows[pair].append(existing)
                by_id[pair][canonical_id] = existing
            by_identity[pair][identity(existing)].append(existing)
            by_form[pair][form_key(existing["study"])].append(existing)
            entries.append({"id": existing["id"], "pair": pair, "itemId": item_id, "category": category,
                "authored": authored, "newStudiedForm": authored, "preexistingConversation": not authored,
                "scope": "base" if Path(item["_ledgerPath"]).name == f"{pair}.json" else "extension"})
        else:
            expected_status = existing.get("phoneticReviewStatus", "existing-verbatim")
            ensure(item.get("phoneticReviewStatus") == expected_status, f"Reuse changes the source phonetic review state: {item_id}")
        ensure(not existing.get("isTemplate"), "An open model cannot become an utterance or lexical support")
        if category == "received":
            ensure(existing["contentType"] == "utterance", "A received turn cannot repurpose an isolated word or a reserve")
            model = {key: value for key, value in existing.items() if key not in {"speaker", "kind", "role"}}
            model.update(heardOnly=True, firstHeardLevel=min(item["proposedLevel"], heard_models[pair].get(existing["id"], {}).get("firstHeardLevel", 11)))
            heard_models[pair][existing["id"]] = model
            anchor = item.get("beforeIntentId") or item.get("afterIntentId")
            usage = {"id": item_id, "pair": pair, "topicId": item["topicId"], "utterance": existing["id"],
                "role": item["role"], "level": item["proposedLevel"], "analyse": False,
                "answerWith": item["answerWith"], "targetIntentId": anchor,
                **{key: item[key] for key in ("beforeIntentId", "afterIntentId") if key in item}}
            heard_uses.append(usage)
        elif category == "support":
            ensure(existing["contentType"] == item["contentType"] and existing["contentType"] in {"vocabulary", "number"}, "Support source is not the declared standalone lexical type")
            ensure(not existing.get("heardOnly"), "A heard-only model cannot serve as a lexical support")
            ensure(existing["placement"]["domain"] == item["lexicalFamily"], f"Lexical support family disagrees with its reviewed canonical annotation: {item_id}")
            introduction(item, existing, existing["placement"]["domain"])
            support_uses.append({"id": item_id, "pair": pair, "topicId": item["topicId"], "canonicalId": existing["id"],
                "level": item["proposedLevel"], "introducedBeforeIntentId": item["introducedBeforeIntentId"],
                "reason": item["reason"], "countsTowardProductionProgression": False})
        else:
            ensure(existing["contentType"] == "utterance" and not existing.get("heardOnly"), "A situation cannot repurpose a lexeme, reserve or heard-only model as a learner utterance")
            introduction(item, existing, topics[item["topicId"]]["domain"])
            uses.append({"pair": pair, "topicId": item["topicId"], "intentId": item["intentId"],
                "level": item["proposedLevel"], "canonicalId": existing["id"], "reason": item["reason"],
                "itemId": item_id, "candidateKind": item["kind"]})
        resolved[item_id] = existing
        visiting.remove(item_id)
        return existing

    # The original eighty learner items are resolved before appended candidates.
    for item in frozen["items"] + frozen.get("lexicalSupports", []) + frozen.get("receivedTurns", []):
        visit(item["id"])
    for theme in frozen["plan"]["themes"]:
        for pair in pairs:
            group = [use for use in uses if use["pair"] == pair and use["topicId"] == theme["id"]]
            if (pair, theme["id"]) in frozen.get("_privateAbsentTopics", set()):
                ensure(not group, "A private absent scope unexpectedly contains candidates")
                continue
            ensure(len(group) == 8 and len({use["canonicalId"] for use in group}) == 8,
                   f"Eight intent positions must not disguise repeated copies of one phrase: {pair}:{theme['id']}")
            ensure(len({form_key(by_id[pair][use["canonicalId"]]["study"]) for use in group}) == 8,
                   f"Eight distinct source IDs cannot disguise repeated studied forms: {pair}:{theme['id']}")
    for use in uses:
        row = by_id[use["pair"]][use["canonicalId"]]
        theme = frozen["intents"][use["intentId"]]["theme"]
        use["topicOrder"] = next(index for index, topic in enumerate(frozen["plan"]["themes"]) if topic["id"] == use["topicId"])
        use["intentOrder"] = next(index for index, intent in enumerate(theme["intents"]) if intent["id"] == use["intentId"])
        use.update(firstEditorialLevel=row["editorialLevel"], canonicalDomain=row["placement"]["domain"],
            sourceCollection=row["source"]["collection"],
            presentationKind="primary" if row["editorialLevel"] == use["level"] and row["placement"]["domain"] == use["topicId"] else "context-reuse",
            authoredCreationHere=row["source"]["collection"] == "situation-authored" and row["source"].get("itemId") == use["itemId"])
    intents_by_pair = {(use["pair"], use["intentId"]): use["canonicalId"] for use in uses}
    for usage in heard_uses:
        usage["answerWithUtteranceIds"] = [intents_by_pair[(usage["pair"], identifier)] for identifier in usage["answerWith"]]
        usage["prepares"] = intents_by_pair[(usage["pair"], usage["targetIntentId"])]
    baseline = frozen.get("baseline")
    if baseline:
        for identifier, before in baseline["canonical"].items():
            now = by_id[before["pairId"]].get(identifier)
            ensure(now is not None and sha({key: now[key] for key in ("study", "native", "phon", "reading") if key in now}) == before["fieldsSha256"] and sha(now["source"]) == before["sourceSha256"], "The append-only lot changed a previous source tuple or provenance")
            if identifier in protected:
                ensure(now["editorialLevel"] == before["level"], "A protected previous first introduction moved")
    return {"plan": frozen["plan"], "uses": uses, "entries": entries, "introductions": introductions,
        "heardModels": heard_models, "receivedUses": heard_uses, "lexicalSupportUses": support_uses,
        "baseline": baseline, "fingerprints": frozen["fingerprints"]}

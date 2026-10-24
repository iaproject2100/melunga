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
    ensure(isinstance(themes, list) and len(themes) == 10, "The situation plan needs ten themes")
    theme_ids, domains, visuals, intents = set(), set(), set(), {}
    for theme in themes:
        ensure(type(theme.get("level")) is int and 2 <= theme["level"] <= 6, "Situation level must be L2-L6")
        for field, seen in (("themeId", theme_ids), ("domain", domains), ("visualId", visuals)):
            ensure(isinstance(theme.get(field), str) and theme[field] and theme[field] not in seen, f"Duplicate situation {field}")
            seen.add(theme[field])
        ensure(isinstance(theme.get("title"), dict) and all(isinstance(theme["title"].get(lang), str) for lang in ("fr", "zh")), "Missing localized situation title")
        ensure(isinstance(theme.get("intents"), list) and len(theme["intents"]) == 8, "Each situation needs eight intents")
        for intent in theme["intents"]:
            ensure(isinstance(intent.get("id"), str) and intent["id"] not in intents, "Repeated situation intent")
            ensure(intent.get("level", intent.get("proposedLevel")) == theme["level"], "Intent is outside its theme level")
            intents[intent["id"]] = {"theme": theme, "intent": intent}
    ensure(all(sum(theme["level"] == level for theme in themes) == 2 for level in range(2, 7)), "Two new situations are required at each level L2-L6")
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
    ensure(catalogue.get("version") == 1 and catalogue.get("planSha256") == plan_sha, "Frozen situation plan changed")
    files = catalogue.get("pairFiles")
    ensure(isinstance(files, list) and {entry.get("pair") for entry in files} == set(pairs) and len(files) == len(pairs), "Frozen situation catalogue needs all seven pairs")
    index_relative = catalogue.get("searchIndexPath")
    ensure(isinstance(index_relative, str), "Frozen catalogue lacks its portable existing-form search index")
    index_path = (root / index_relative).resolve()
    ensure(index_path.is_relative_to((root / DIRECTORY).resolve()) and file_sha(index_path) == catalogue.get("searchIndexSha256"), "Existing-form search index changed")
    search_index = json.loads(index_path.read_text())
    ensure(search_index.get("version") == 1 and set(search_index.get("pairs", {})) == set(pairs), "Existing-form search index has another scope")
    items, fingerprints, identifiers = [], {str((DIRECTORY / "plan.json")): plan_sha,
        str(DIRECTORY / "catalogue.json"): file_sha(catalogue_path)}, set()
    fingerprints[index_relative] = catalogue["searchIndexSha256"]
    for entry in files:
        pair = entry["pair"]
        path = (root / entry["path"]).resolve()
        ensure(path.is_relative_to((root / DIRECTORY).resolve()) and path.suffix == ".json", "Situation ledger is outside its directory")
        ensure(file_sha(path) == entry.get("sha256"), f"Frozen language ledger changed: {pair}")
        document = json.loads(path.read_text())
        ensure(document.get("version") == 1 and document.get("pair") == pair and document.get("planHash") == plan_sha, f"Wrong situation ledger identity: {pair}")
        rows = document.get("items")
        ensure(isinstance(rows, list) and len(rows) == 80 and {item.get("intentId") for item in rows} == set(intents), f"Situation intent coverage is not exact: {pair}")
        ensure(len({item.get("intentId") for item in rows}) == 80, f"Repeated pair intent: {pair}")
        for item in rows:
            ensure(isinstance(item.get("id"), str) and item["id"] and item["id"] not in identifiers, "Repeated situation item ID")
            identifiers.add(item["id"])
            theme = intents[item["intentId"]]["theme"]
            ensure(item.get("pair") == pair and item.get("topicId") == theme["id"] and item.get("proposedLevel") == theme["level"], "Candidate theme/level disagrees with its intent")
            ensure(item.get("contentType") == "utterance" and item.get("kind") in KINDS, "Invalid situation candidate type")
            ensure(item.get("editorialReviewStatus") == "reviewed" and isinstance(item.get("reason"), str) and item["reason"].strip(), "Situation candidate lacks editorial reasoning")
            whole_fields(item, item["id"])
            ensure(isinstance(item.get("source"), dict) and isinstance(item.get("duplicateAudit"), dict), "Missing candidate provenance or duplicate audit")
            items.append({**item, "_ledgerPath": str(path.relative_to(root)), "_ledgerSha256": entry["sha256"]})
        fingerprints[str(path.relative_to(root))] = entry["sha256"]
    return {"plan": plan, "intents": intents, "items": items, "fingerprints": fingerprints, "searchIndex": search_index}


def source_entry(root, item, pair_info, decks, fingerprints):
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
    ensure(kind == "candidate-reference" and isinstance(source.get("candidateId"), str), "Invalid candidate reuse")
    return fields, {"candidateId": source["candidateId"], "source": source}


def resolve(root, frozen, rows, pairs, decks):
    """Add real canonical entries and record contextual uses without duplication."""
    if frozen is None:
        return None
    by_id = {pair: {row["id"]: row for row in values} for pair, values in rows.items()}
    by_identity, by_form = {}, {}
    for pair, values in rows.items():
        by_identity[pair], by_form[pair] = defaultdict(list), defaultdict(list)
        for row in values:
            by_identity[pair][identity(row)].append(row)
            by_form[pair][form_key(row["study"])].append(row)
    items = {item["id"]: item for item in frozen["items"]}
    external_forms = {pair: {form_key(entry["study"]) for entry in data["entries"]}
                      for pair, data in frozen["searchIndex"]["pairs"].items()}
    resolved, visiting, uses, entries, introductions = {}, set(), [], [], []

    def visit(item_id):
        if item_id in resolved:
            return resolved[item_id]
        ensure(item_id in items and item_id not in visiting, "Missing or cyclic candidate reference")
        visiting.add(item_id)
        item = items[item_id]
        pair = item["pair"]
        fields, proof = source_entry(root, item, pairs[pair], decks, frozen["fingerprints"])
        existing = None
        if "candidateId" in proof:
            other = items.get(proof["candidateId"])
            ensure(other and other["pair"] == pair, "Candidate reuse crosses language pairs")
            existing = visit(proof["candidateId"])
            ensure(identity(existing) == identity(fields), "Candidate reuse changes a whole field")
            expected_status = existing.get("phoneticReviewStatus", "existing-verbatim")
            ensure(item.get("phoneticReviewStatus") == expected_status, "Candidate reuse changes its phonetic review state")
        elif "canonicalId" in proof:
            existing = by_id[pair][proof["canonicalId"]]
        elif by_identity[pair].get(identity(fields)):
            existing = min(by_identity[pair][identity(fields)], key=lambda row: (row["editorialLevel"], row["id"]))
        preferred = item["duplicateAudit"].get("preferredCanonicalId")
        if preferred:
            ensure(item["duplicateAudit"].get("decision") == "reuse-existing" and preferred in by_id[pair], "Unreviewed duplicate preference")
            existing = by_id[pair][preferred]
            ensure(identity(existing) == identity(fields),
                   "A preferred canonical source must preserve every declared whole field; select that source explicitly instead of swapping its aids")
        if existing is None:
            collisions = by_form[pair].get(form_key(fields["study"]), [])
            ensure(not collisions, f"Existing studied form needs an explicit whole-source reuse decision, not a new translation: {item_id}")
            authored = item["kind"] == "editorial-authored-whole-entry"
            ensure(not authored or form_key(fields["study"]) not in external_forms[pair],
                   f"Authored candidate already exists in the conversation corpus; reference the whole source instead: {item_id}")
            canonical_id = ("situation-authored:" if authored else "situation-conversation:") + item_id
            topic = frozen["intents"][item["intentId"]]["theme"]
            source_record = {"collection": "situation-authored" if authored else "situation-conversation",
                "kind": item["kind"], "ledgerFile": item["_ledgerPath"], "ledgerFileSha256": item["_ledgerSha256"],
                "itemId": item_id, "sourceSha256": sha({key: value for key, value in item.items() if not key.startswith("_")}) if authored else proof["source"]["entrySha256"],
                "ledgerItemSha256": sha({key: value for key, value in item.items() if not key.startswith("_")}),
                "fieldMap": {key: key for key in fields}, "provenance": proof["source"]}
            if "sourceRole" in item:
                source_record["sourceRole"] = item["sourceRole"]
            if "sourceLevel" in proof:
                source_record["sourceLevel"] = proof["sourceLevel"]
            existing = {"id": canonical_id, **fields, "speaker": "A", "kind": "learner", "contentType": "utterance",
                "isTemplate": False, "sourceDeclaredTemplate": False, "editorialLevel": item["proposedLevel"],
                "intentId": item["intentId"], "topicId": item["topicId"],
                "phoneticReviewStatus": item["phoneticReviewStatus"], "source": source_record,
                "semanticReview": {"status": "reviewed", "reason": item["reason"]},
                "placement": {"domain": topic["domain"], "section": "situations", "classification": "new-situation-whole-utterance",
                    "reason": item["reason"], "plannedPrerequisiteIndices": []}}
            if "readingScript" in item:
                existing["readingScript"] = item["readingScript"]
            if not authored and type(proof.get("sourceLevel")) is int and proof["sourceLevel"] > item["proposedLevel"]:
                decision = item.get("introductionDecision", {})
                ensure(decision.get("action") == "introduce-earlier" and decision.get("fromEditorialLevel") == proof["sourceLevel"]
                       and decision.get("proposedLevel") == item["proposedLevel"] and decision.get("reviewStatus") == "reviewed"
                       and isinstance(decision.get("reason"), str) and decision["reason"].strip(), "Archived future-level source requires an explicit first-introduction decision")
                introductions.append({"pair": pair, "canonicalId": canonical_id, "itemId": item_id,
                    "previousEditorialLevel": proof["sourceLevel"], "previousDomain": "conversation-source",
                    "proposedLevel": item["proposedLevel"], "domain": topic["domain"], "decision": decision,
                    "newToThisRuntime": True})
            rows[pair].append(existing)
            by_id[pair][canonical_id] = existing
            by_identity[pair][identity(existing)].append(existing)
            by_form[pair][form_key(existing["study"])].append(existing)
            entries.append({"id": canonical_id, "pair": pair, "itemId": item_id, "authored": authored,
                "newStudiedForm": authored, "preexistingConversation": not authored})
        ensure(existing["contentType"] == "utterance" and not existing.get("isTemplate"), "A situation cannot repurpose a lexeme, reserve or open model as a complete utterance")
        if existing["editorialLevel"] > item["proposedLevel"]:
            decision = item.get("introductionDecision", {})
            ensure(decision.get("action") == "introduce-earlier" and decision.get("fromEditorialLevel") == existing["editorialLevel"]
                   and decision.get("proposedLevel") == item["proposedLevel"] and decision.get("reviewStatus") == "reviewed"
                   and isinstance(decision.get("reason"), str) and decision["reason"].strip(),
                   f"Future existing source needs an explicit first-introduction decision: {item_id}")
            topic = frozen["intents"][item["intentId"]]["theme"]
            introductions.append({"pair": pair, "canonicalId": existing["id"], "itemId": item_id,
                "previousEditorialLevel": existing["editorialLevel"], "previousDomain": existing["placement"]["domain"],
                "proposedLevel": item["proposedLevel"], "domain": topic["domain"], "decision": decision})
            existing["editorialLevel"] = item["proposedLevel"]
            existing["placement"].update(previousDomain=existing["placement"]["domain"], domain=topic["domain"],
                                         classification="explicit-situation-first-introduction", reason=decision["reason"])
            existing["situationIntentId"] = item["intentId"]
            existing["topicId"] = topic["id"]
        resolved[item_id] = existing
        visiting.remove(item_id)
        uses.append({"pair": pair, "topicId": item["topicId"], "intentId": item["intentId"],
                     "level": item["proposedLevel"], "canonicalId": existing["id"], "reason": item["reason"],
                     "itemId": item_id, "candidateKind": item["kind"]})
        return existing

    for item in frozen["items"]:
        visit(item["id"])
    for theme in frozen["plan"]["themes"]:
        for pair in pairs:
            group = [use for use in uses if use["pair"] == pair and use["topicId"] == theme["id"]]
            ensure(len(group) == 8 and len({use["canonicalId"] for use in group}) == 8,
                   f"Eight intent positions must not disguise repeated copies of one phrase: {pair}:{theme['id']}")
    for use in uses:
        row = by_id[use["pair"]][use["canonicalId"]]
        theme = frozen["intents"][use["intentId"]]["theme"]
        use["topicOrder"] = next(index for index, topic in enumerate(frozen["plan"]["themes"]) if topic["id"] == use["topicId"])
        use["intentOrder"] = next(index for index, intent in enumerate(theme["intents"]) if intent["id"] == use["intentId"])
        use.update(firstEditorialLevel=row["editorialLevel"], canonicalDomain=row["placement"]["domain"],
                   sourceCollection=row["source"]["collection"],
                   presentationKind="primary" if row["editorialLevel"] == use["level"] and row["placement"]["domain"] == use["topicId"] else "context-reuse",
                   authoredCreationHere=row["source"]["collection"] == "situation-authored" and row["source"].get("itemId") == use["itemId"])
    return {"plan": frozen["plan"], "uses": uses, "entries": entries, "introductions": introductions,
            "fingerprints": frozen["fingerprints"]}

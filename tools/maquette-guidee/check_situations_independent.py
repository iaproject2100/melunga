"""Source-side checks for situation extensions; no generator is imported.

The caller supplies its assertion and hashing helpers so failures belong to the
same independent report. Source identities come from literal ledgers, DECKS,
and complete archived parents, never from the builder's resolution table.
"""
from collections import Counter, defaultdict
from pathlib import Path
import json
import re
import subprocess
import unicodedata


DIRECTORY = "docs/niveaux-progressifs/enrichissement-situations"
SOURCE_COMMIT = "7d245568102f16fb8ae9e29c46bb89221358058b"
BASELINE_COMMIT = "30ef75b3556755497e82a9a9c8505c27f988603b"


def form(text):
    # Search only. The source and all displayed fields are compared verbatim.
    return re.sub(r"[^\w]+", " ", unicodedata.normalize("NFC", text).casefold()).strip()


def fields(entry):
    return {key: entry[key] for key in ("study", "native", "phon", "reading") if key in entry}


def identity(entry):
    return tuple(entry.get(key) for key in ("study", "native", "phon", "reading"))


def pointer(document, path, require):
    require(isinstance(path, str) and (path == "" or path.startswith("/")), "Invalid whole-source pointer")
    result = document
    for token in path.split("/")[1:] if path else []:
        token = token.replace("~1", "/").replace("~0", "~")
        if isinstance(result, list):
            require(token.isdigit() and int(token) < len(result), "Whole-source pointer has an invalid index")
            result = result[int(token)]
        else:
            require(isinstance(result, dict) and token in result, "Whole-source pointer has an absent key")
            result = result[token]
    require(isinstance(result, dict), "A situation source is not an entire object")
    return result


def walk_entries(value, path=""):
    if isinstance(value, dict):
        if all(isinstance(value.get(key), str) for key in ("study", "native", "phon")):
            yield path, value
        for key, child in value.items():
            yield from walk_entries(child, path + "/" + key.replace("~", "~0").replace("/", "~1"))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from walk_entries(child, path + "/" + str(index))


def read_inputs(root, raw, js, require, canonical, digest, languages):
    freeze_path = DIRECTORY + "/catalogue.json"
    if not (root / freeze_path).is_file():
        return None
    freeze = js(freeze_path)
    if freeze.get("status") != "ready-for-preview":
        return None
    require(freeze.get("version") in {1, 2} and freeze.get("publicationApproved") is False,
            "Situation freeze has another version or overclaims publication")
    plan_path = DIRECTORY + "/plan.json"
    plan = js(plan_path)
    require(digest(raw(plan_path)) == freeze.get("planSha256"), "Situation plan differs from frozen source")
    extended = freeze["version"] == 2
    require(len(plan.get("themes", [])) == (28 if extended else 10), "Incomplete situation definitions")
    base = js(DIRECTORY + "/plan-base10.json") if extended else plan
    base_hash = digest(raw(DIRECTORY + "/plan-base10.json")) if extended else freeze["planSha256"]
    if extended:
        require(base_hash == "01a6ddae871e0df8dcf27bfbbae254565c4fb3d55b767f4b75219ce991473604"
                and base_hash == freeze.get("basePlanSha256") and plan["themes"][:10] == base["themes"],
                "Original ten-topic plan changed during append-only extension")
        for path, expected in plan["extension"]["preservedInputFingerprints"].items():
            require(digest(raw(path)) == expected, "Protected original ledger or lexical source changed")
    intent_map, visual_ids, theme_ids, domains = {}, set(), set(), set()
    topics = {theme["id"]: theme for theme in plan["themes"]}
    for theme in plan["themes"]:
        require(type(theme.get("level")) is int and 1 <= theme["level"] <= 10, "Invalid situation level")
        require(theme["themeId"] not in theme_ids and theme["domain"] not in domains
                and theme["visualId"] not in visual_ids, "A theme aliases a different theme")
        theme_ids.add(theme["themeId"]); domains.add(theme["domain"]); visual_ids.add(theme["visualId"])
        require(len(theme["intents"]) == 8, "A situation needs eight learner intents")
        for intent in theme["intents"]:
            require(intent["id"] not in intent_map and intent["level"] == theme["level"], "Intent identity or level differs")
            intent_map[intent["id"]] = (theme, intent)
    items, lexical, received, ledgers = {}, {}, {}, {}
    groups = [(freeze.get("pairFiles", []), set(i["id"] for t in base["themes"] for i in t["intents"]), base_hash, False)]
    if extended:
        groups.append((freeze.get("extensionPairFiles", []), set(intent_map) - groups[0][1], freeze["planSha256"], True))
    received_definitions = {row["id"]: row for row in plan.get("receivedTurnsDefs", [])}
    for descriptors, required_intents, expected_hash, extension in groups:
        require(len(descriptors) == 7 and {row["pair"] for row in descriptors} == set(languages), "Ledgers lack exact seven-pair coverage")
        for descriptor in descriptors:
            pair, relative = descriptor["pair"], descriptor["path"]
            require(relative == DIRECTORY + "/" + ("extension-" if extension else "") + pair + ".json",
                    "Unexpected language ledger path")
            require(digest(raw(relative)) == descriptor["sha256"], "Language ledger changed after freeze")
            document = js(relative)
            require(document["version"] == 1 and document["pair"] == pair and document["planHash"] == expected_hash,
                    "Ledger identity or plan hash differs")
            require(len(document["items"]) == len(required_intents)
                    and {row["intentId"] for row in document["items"]} == required_intents, "Learner intent coverage differs")
            for row in document["items"]:
                theme = intent_map[row["intentId"]][0]
                require(row["topicId"] == theme["id"] and row["proposedLevel"] == theme["level"]
                        and row["contentType"] == "utterance", "Learner intent changes topic, level or type")
            if extension:
                require(len(document.get("receivedTurns", [])) == len(received_definitions), "Incomplete received-turn list")
                definitions_seen = set()
                for row in document["receivedTurns"]:
                    definition_id = row.get("definitionId") or row["id"].removeprefix(pair + "-")
                    definition = received_definitions.get(definition_id)
                    require(definition is not None and definition_id not in definitions_seen, "Missing or repeated received definition")
                    definitions_seen.add(definition_id)
                    require(row["topicId"] == definition["topicId"] and row["analyse"] is False
                            and row["contentType"] == "utterance" and row["answerWith"] == definition["answerWith"]
                            and row["role"] == definition["role"]["label"], "Received use changes role, answer or source function")
                    for anchor in ("beforeIntentId", "afterIntentId"):
                        require(row.get(anchor) == definition.get(anchor), "Received-turn anchor differs")
                    require(row["proposedLevel"] == topics[row["topicId"]]["level"], "Received level differs")
                for theme in plan["themes"][10:]:
                    supports = [row for row in document.get("lexicalSupports", []) if row["topicId"] == theme["id"]]
                    require(len(supports) >= 2 and len({identity(row) for row in supports}) >= 2, "A module lacks two distinct whole lexical supports")
                    for row in supports:
                        require(row["contentType"] in {"vocabulary", "number"} and row["proposedLevel"] == theme["level"]
                                and row["introducedBeforeIntentId"] in {i["id"] for i in theme["intents"]}
                                and (row.get("lexicalFamily", "").startswith("vocab-") or row.get("lexicalFamily") == "nombres"),
                                "Invalid lexical support intent, level or family")
            for name, target in [("items", items), ("lexicalSupports", lexical), ("receivedTurns", received)]:
                for row in document.get(name, []):
                    require(row["id"] not in ledgers and row["pair"] == pair and row["topicId"] in topics,
                            "Candidate identity is duplicated or crosses pairs")
                    require(row.get("editorialReviewStatus") == "reviewed" and isinstance(row.get("reason"), str) and row["reason"].strip(),
                            "Candidate has no semantic decision")
                    require(all(isinstance(row.get(k), str) and row[k].strip() for k in ("study", "native", "phon"))
                            and not re.search(r"\{[\w-]+\}|_{2,}", row["study"]), "Candidate is empty or an open model")
                    require(isinstance(row.get("source"), dict) and isinstance(row.get("duplicateAudit"), dict), "Missing provenance or duplicate audit")
                    target[row["id"]] = row
                    ledgers[row["id"]] = descriptor
    index_path = freeze.get("searchIndexPath")
    require(isinstance(index_path, str) and Path(index_path).is_relative_to(DIRECTORY)
            and ".." not in Path(index_path).parts, "Conversation search index escapes its source directory")
    require(digest(raw(index_path)) == freeze.get("searchIndexSha256"), "Conversation search index changed after freeze")
    search = js(index_path)
    require(search.get("version") == 1 and set(search["pairs"]) == set(languages), "Search index has another pair scope")
    # Independently reconstruct the portable index from its immutable parents.
    # A changed or partial index must not make an old phrase seem new.
    archive_records, archive_forms = {}, {}
    for pair, data in search["pairs"].items():
        expected_files, expected_entries = [], []
        records, forms = {}, set()
        for level in range(1, 11):
            name = f"L{level}-{pair}.json"
            original = subprocess.run(["git", "show", SOURCE_COMMIT + ":melunga_deploy/content/conversation/" + name],
                                      cwd=root, capture_output=True, check=True).stdout
            document, file_hash = json.loads(original), digest(original)
            require((document["nativeLanguage"], document["studyLanguage"]) == languages[pair], "Archived parent has another language pair")
            expected_files.append({"sourceFile": name, "fileSha256": file_hash})
            for path, entry in walk_entries(document):
                expected_entries.append({"sourceFile": name, "fileSha256": file_hash, "jsonPointer": path,
                                         "entrySha256": digest(canonical(entry)), "study": entry["study"], "native": entry["native"]})
                records[(name, path)] = (entry, file_hash, level)
                forms.add(form(entry["study"]))
        require(data["files"] == expected_files and data["entries"] == expected_entries,
                "Portable search index omits or rewrites an existing whole conversation form")
        archive_records[pair], archive_forms[pair] = records, forms
    return {"freeze": freeze, "plan": plan, "intents": intent_map, "items": items,
            "ledgers": ledgers, "lexicalItems": lexical, "receivedItems": received,
            "allItems": {**items, **lexical, **received}, "archiveRecords": archive_records, "archiveForms": archive_forms,
            "baseline": read_baseline(root, raw, js, require, canonical, digest, languages) if extended else None,
            "parents": {}, "sourceFieldsCompared": 0}


def validate_sources(pack, require, canonical, digest):
    data = pack.get("situations")
    if data is None:
        return
    data["sourceFieldsCompared"] = 0
    kinds = {"catalogue-reference", "conversation-whole-entry", "editorial-authored-whole-entry", "candidate-reference"}
    new_forms, counts = defaultdict(set), Counter()
    existing_forms = {}
    for pair, (_native, study) in pack["languages"].items():
        existing_forms[pair] = ({form(card["t"]) for card in pack["decks"][study]}
                                | data["archiveForms"][pair]
                                | {form(entry["study"]) for entry in pack["authored"]["items"] if entry["pair"] == pair})
    for item_id, item in data["allItems"].items():
        pair, kind, source = item["pair"], item["kind"], item["source"]
        require(kind in kinds, "Unknown situation source kind")
        study = pack["languages"][pair][1]
        counts[kind] += 1
        if kind == "catalogue-reference":
            index = source.get("sourceIndex")
            require(source.get("collection") == "DECKS." + study and type(index) is int
                    and 0 <= index < len(pack["decks"][study]), "Situation catalogue reference has an invalid source index")
            card = pack["decks"][study][index]
            mapping = {"study": "t", "native": "cn" if study == "fr" else "frm",
                       "phon": "phon" if study == "fr" else "phf" if study == "zh" else "pf"}
            if study in {"zh", "ja", "ko"}: mapping["reading"] = "py"
            expected = {out: card[original] for out, original in mapping.items()}
            require(fields(item) == expected and source["sourceLevel"] == card["lv"]
                    and source["sourceSha256"] == digest(canonical(card)), "Situation catalogue source field or level was changed")
            require(item["phoneticReviewStatus"] == "existing-verbatim", "Existing catalogue help is relabeled as newly written")
            data["sourceFieldsCompared"] += len(expected)
        elif kind == "conversation-whole-entry":
            relative = source.get("path")
            require(isinstance(relative, str) and Path(relative).is_relative_to(DIRECTORY + "/sources")
                    and ".." not in Path(relative).parts, "Conversation evidence is not a portable complete parent")
            original, file_hash, _level = data["archiveRecords"][pair].get((Path(relative).name, source.get("jsonPointer")), (None, None, None))
            require(original is not None and source.get("fileSha256") == file_hash
                    and source.get("entrySha256") == digest(canonical(original)), "Whole conversation provenance disagrees with the immutable parent")
            parent = pack["root"] / relative
            require(parent.is_file() and digest(parent.read_bytes()) == file_hash, "Complete conversation parent was edited or omitted")
            pack["fingerprints"][relative] = file_hash
            require(fields(item) == fields(original) and item["phoneticReviewStatus"] == "existing-verbatim",
                    "A conversation field was clipped, retranslated, retranscribed or relabeled as new")
            role = item.get("sourceRole")
            source_speaker = role.get("speaker") if isinstance(role, dict) else role if role in ("A", "B") else None
            if source_speaker is not None:
                require(source_speaker == original.get("speaker"), "Declared source speaker differs from the actual whole turn")
            data["sourceFieldsCompared"] += len(fields(original))
        elif kind == "editorial-authored-whole-entry":
            require(isinstance(source.get("kind"), str) and source["kind"].startswith("editorial-authored-whole-")
                    and item["phoneticReviewStatus"] == "pending-Claude", "New whole-phrase help lacks its pending Claude review")
            normalized = form(item["study"])
            require(normalized not in existing_forms[pair],
                    "An allegedly new situation phrase is an old form with a new translation or punctuation")
            require(normalized not in new_forms[pair], "Two authored positions disguise a duplicated new phrase")
            new_forms[pair].add(normalized)
        else:
            other = data["allItems"].get(source.get("candidateId"))
            canonical_id = source.get("canonicalId")
            require(bool(other) != bool(canonical_id), "Reuse must name one whole candidate or canonical")
            if other is not None:
                require(other["pair"] == pair and fields(other) == fields(item)
                        and other["phoneticReviewStatus"] == item["phoneticReviewStatus"], "Candidate reuse crosses pairs or changes a field")
                if item_id not in data["receivedItems"]:
                    require(other["proposedLevel"] <= item["proposedLevel"] or item.get("introductionDecision"), "Future production reuse without an introduction")
            else:
                require(isinstance(canonical_id, str), "Invalid explicit canonical reference")
    data["inputKindCounts"] = dict(counts)


def resolve_sources(pack, primaries, locations, base_levels, require, canonical, digest):
    """Resolve literal inputs independently; heard models never become production."""
    data = pack.get("situations")
    empty = {"newEntries": {}, "newSupportEntries": {}, "heardEntries": {}, "catalogueIntroductions": {},
             "usesByTheme": {}, "resolved": {}, "receivedUsesByTheme": {}, "supportUsesByTheme": {}}
    if data is None:
        return empty
    new_collections = {"situation-authored", "situation-conversation", "situation-support-authored", "situation-support-conversation"}
    base_identities, base_forms = defaultdict(list), defaultdict(list)
    for (pair, source_id), phrase in primaries.items():
        if phrase["source"]["collection"] not in new_collections:
            base_identities[(pair, identity(phrase))].append(source_id)
            base_forms[(pair, form(phrase["study"]))].append(source_id)
    heard = {(pair, model["id"]): model for pair, bank in pack["repertoires"].items() for model in bank.get("receivedModels", [])}
    all_models = {**heard, **primaries}
    new_entries, support_entries, heard_entries = {}, {}, {}
    resolved, visiting, newly_registered, catalogue_introductions = {}, set(), {}, {}
    first_levels = dict(base_levels)
    topics = {row["id"]: row for row in data["plan"]["themes"]}

    def visit(item_id):
        if item_id in resolved:
            return resolved[item_id]
        require(item_id in data["allItems"] and item_id not in visiting, "Missing or cyclic whole-source reference")
        visiting.add(item_id)
        item = data["allItems"][item_id]
        pair, kind, source = item["pair"], item["kind"], item["source"]
        is_heard, is_support = item_id in data["receivedItems"], item_id in data["lexicalItems"]
        source_level = None
        if kind == "catalogue-reference":
            source_id = f"catalogue:{pack['languages'][pair][1]}:{source['sourceIndex']}"
        elif kind == "candidate-reference":
            source_id = source.get("canonicalId") or visit(source["candidateId"])
        elif base_identities.get((pair, identity(item))):
            source_id = min(base_identities[(pair, identity(item))], key=lambda identifier: (locations[(pair, identifier)]["level"], identifier))
        elif (pair, identity(item)) in newly_registered:
            source_id = newly_registered[(pair, identity(item))]
        else:
            require(not base_forms.get((pair, form(item["study"]))), "An old form was recreated with changed translation or phonetics")
            authored = kind == "editorial-authored-whole-entry"
            category = "received" if is_heard else "support" if is_support else "learner"
            collection = ("situation-received-" if is_heard else "situation-support-" if is_support else "situation-") + ("authored" if authored else "conversation")
            source_id = (("heard-" + ("authored" if authored else "conversation")) if is_heard else collection) + ":" + item_id
            ledger = data["ledgers"][item_id]
            expected_source = {"collection": collection, "kind": kind, "ledgerFile": ledger["path"],
                "ledgerFileSha256": ledger["sha256"], "itemId": item_id,
                "sourceSha256": digest(canonical(item)) if authored else source["entrySha256"],
                "ledgerItemSha256": digest(canonical(item)), "fieldMap": {key: key for key in fields(item)}, "provenance": source}
            if "sourceRole" in item:
                expected_source["sourceRole"] = item["sourceRole"]
            if not authored:
                source_level = data["archiveRecords"][pair][(Path(source["path"]).name, source["jsonPointer"])][2]
                expected_source["sourceLevel"] = source_level
            expected = {"item": item, "source": expected_source, "authored": authored, "category": category}
            (heard_entries if is_heard else support_entries if is_support else new_entries)[(pair, source_id)] = expected
            newly_registered[(pair, identity(item))] = source_id
        preferred = item["duplicateAudit"].get("preferredCanonicalId")
        if preferred:
            require(item["duplicateAudit"].get("decision") == "reuse-existing" and (pair, preferred) in primaries
                    and fields(primaries[(pair, preferred)]) == fields(item), "Preferred source silently changes a whole field")
            source_id = preferred
        require((pair, source_id) in all_models and fields(all_models[(pair, source_id)]) == fields(item),
                "Resolved whole source is missing or changed")
        original = all_models[(pair, source_id)]
        require(not original.get("isTemplate"), "A whole model is an open template")
        if is_heard:
            require(original["contentType"] == "utterance" and (pair, source_id) in heard, "Received turn has no separate heard model")
            require(heard[(pair, source_id)].get("phoneticReviewStatus", "existing-verbatim") == item["phoneticReviewStatus"], "Received reuse changes review status")
        else:
            require((pair, source_id) in primaries and original["contentType"] == item["contentType"]
                    and locations[(pair, source_id)]["domain"] != "reserve" and not locations[(pair, source_id)]["held"],
                    "A productive use repurposes held, reserved, heard-only or wrongly typed material")
            require(original.get("phoneticReviewStatus", "existing-verbatim") == item["phoneticReviewStatus"],
                    "A productive reuse silently changes its source phonetic review status")
            old_level = first_levels.get((pair, source_id), source_level)
            if old_level is not None and old_level > item["proposedLevel"]:
                decision = item.get("introductionDecision", {})
                require(decision.get("action") == "introduce-earlier" and decision.get("reviewStatus") == "reviewed"
                        and decision.get("fromEditorialLevel") == old_level and decision.get("proposedLevel") == item["proposedLevel"]
                        and isinstance(decision.get("reason"), str) and decision["reason"].strip(), "Future productive source lacks explicit preparation decision")
                if kind == "catalogue-reference":
                    key = (pair, source["sourceIndex"])
                    domain = original["placement"]["domain"] if is_support else topics[item["topicId"]]["domain"]
                    prior = catalogue_introductions.get(key)
                    if prior is None or item["proposedLevel"] < prior["proposedLevel"]:
                        catalogue_introductions[key] = {"proposedLevel": item["proposedLevel"], "domain": domain, "itemId": item_id, "decision": decision}
            first_levels[(pair, source_id)] = min(old_level, item["proposedLevel"]) if old_level is not None else item["proposedLevel"]
            require(locations[(pair, source_id)]["level"] <= item["proposedLevel"], "Productive use precedes first canonical introduction")
        resolved[item_id] = source_id
        visiting.remove(item_id)
        return source_id

    for item_id in data["allItems"]:
        visit(item_id)
    uses = {}
    for pair in pack["languages"]:
        for theme in data["plan"]["themes"]:
            by_intent = {row["intentId"]: row for row in data["items"].values() if row["pair"] == pair and row["topicId"] == theme["id"]}
            ordered = [{"item": by_intent[intent["id"]], "canonicalId": resolved[by_intent[intent["id"]]["id"]]} for intent in theme["intents"]]
            require(len(ordered) == 8 and len({row["canonicalId"] for row in ordered}) == 8, "Eight learner positions disguise fewer sources")
            uses[(pair, theme["level"], theme["themeId"])] = ordered
    actual_new = {key for key, row in primaries.items() if row["source"]["collection"] in new_collections}
    require(actual_new == set(new_entries) | set(support_entries), "Undeclared or missing learner/support canonical")
    require({key for key, row in heard.items() if row["source"]["collection"].startswith("situation-received-")} == set(heard_entries),
            "Undeclared or missing heard-only canonical")
    for key, expected in {**new_entries, **support_entries, **heard_entries}.items():
        actual, item = all_models[key], expected["item"]
        require(actual["source"] == expected["source"] and actual.get("phoneticReviewStatus") == item["phoneticReviewStatus"],
                "New whole source changed provenance or phonetic status")
        if expected["category"] != "received":
            require(actual.get("semanticReview") == {"status": "reviewed", "reason": item["reason"]}, "Missing semantic rationale")
        if expected["category"] == "learner":
            require(actual.get("intentId") == item["intentId"] and actual.get("topicId") == item["topicId"], "Learner intent differs")
        require(actual.get("readingScript") == item.get("readingScript"), "Whole reading metadata differs")
    received_uses, support_uses = defaultdict(list), defaultdict(list)
    for item_id, item in data["receivedItems"].items():
        theme = topics[item["topicId"]]
        received_uses[(item["pair"], theme["level"], theme["themeId"])].append({"item": item, "canonicalId": resolved[item_id]})
    for item_id, item in data["lexicalItems"].items():
        theme = topics[item["topicId"]]
        support_uses[(item["pair"], theme["level"], theme["themeId"])].append({"item": item, "canonicalId": resolved[item_id]})
    result = {"newEntries": new_entries, "newSupportEntries": support_entries, "heardEntries": heard_entries,
            "catalogueIntroductions": catalogue_introductions, "usesByTheme": uses, "resolved": resolved,
            "receivedUsesByTheme": dict(received_uses), "supportUsesByTheme": dict(support_uses)}
    validate_interaction_contract(pack, primaries, locations, result, require, canonical, digest)
    return result


def read_baseline(root, raw, js, require, canonical, digest, languages):
    """Verify the append-only witness against the actual pre-extension commit."""
    path = DIRECTORY + "/extension-pistes/baseline.json"
    baseline = js(path)
    expected_paths = {"melunga_deploy/content/niveaux-progressifs/manifest.json"}
    expected_paths.update(f"melunga_deploy/content/niveaux-progressifs/{pair}/L{level}.json" for pair in languages for level in range(1, 11))
    expected_paths.update(f"melunga_deploy/content/niveaux-progressifs/repertoires/{pair}.json" for pair in languages)
    require(set(baseline["runtimeFileSha256"]) == expected_paths, "Append-only baseline omits an old runtime file")
    records, protected, themes = {}, set(), {}
    for relative in sorted(expected_paths):
        original = subprocess.run(["git", "show", BASELINE_COMMIT + ":" + relative], cwd=root, capture_output=True, check=True).stdout
        require(digest(original) == baseline["runtimeFileSha256"][relative], "Baseline is not the actual pre-extension commit")
        if "/repertoires/" in relative or relative.endswith("/manifest.json"):
            continue
        cell = json.loads(original)
        all_themes = [*cell["themes"], *cell.get("heldThemes", []), {"id": None, "phrases": cell.get("reserve", [])}]
        for theme in all_themes:
            if theme.get("isAdditionalSituation"):
                themes[cell["pairId"] + ":" + theme["id"]] = digest(canonical(theme))
                protected.update(identifier for sequence in theme["sequences"] for identifier in sequence["phraseIds"])
            for phrase in theme["phrases"]:
                records[phrase["id"]] = {"pairId": cell["pairId"], "level": cell["level"], "themeId": theme["id"],
                    "contentType": phrase["contentType"], "fieldsSha256": digest(canonical(fields(phrase))),
                    "sourceSha256": digest(canonical(phrase["source"])), "recordSha256": digest(canonical(phrase))}
                if phrase["source"]["collection"] == "editorial-authored":
                    protected.add(phrase["id"])
    require(len(records) == 32779 and baseline["canonicalCount"] == len(records) and baseline["canonical"] == records,
            "Canonical baseline fields or identities differ from the actual old commit")
    require(set(baseline["protectedCanonicalIds"]) == protected and len(protected) == 700
            and baseline["protectedThemeSha256"] == themes and len(themes) == 70, "Protected old models/themes differ from source")
    return baseline


def validate_interaction_contract(pack, primaries, locations, resolution, require, canonical, digest):
    data = pack["situations"]
    heard_uses = defaultdict(list)
    usage_count = support_count = 0
    for (pair, level), cell in pack["cells"].items():
        for theme in cell["themes"]:
            key = (pair, level, theme["id"])
            expected_received = resolution["receivedUsesByTheme"].get(key, [])
            expected_supports = resolution["supportUsesByTheme"].get(key, [])
            if not expected_received and not expected_supports:
                require(not theme.get("receivedTurns") and not theme.get("lexicalSupports"), "Undeclared interaction data outside planned module")
                continue
            intents = {row["item"]["intentId"]: row["canonicalId"] for row in resolution["usesByTheme"][key]}
            expected_turns = {}
            for use in expected_received:
                item, identifier = use["item"], use["canonicalId"]
                target = item.get("beforeIntentId") or item.get("afterIntentId")
                turn = {"id": item["id"], "utterance": identifier, "role": item["role"], "level": level,
                    "analyse": False, "answerWith": item["answerWith"], "targetIntentId": target,
                    "answerWithUtteranceIds": [intents[intent] for intent in item["answerWith"]], "prepares": intents[target],
                    **{anchor: item[anchor] for anchor in ("beforeIntentId", "afterIntentId") if anchor in item}}
                expected_turns[turn["id"]] = turn
                heard_uses[(pair, identifier)].append(level)
            require(theme.get("receivedTurns") == list(expected_turns.values()) and theme.get("receivedCount") == len(expected_turns),
                    "Theme received uses changed role, model, explicit answer list or anchor")
            expected_references = []
            for use in expected_supports:
                item, identifier = use["item"], use["canonicalId"]
                location = locations[(pair, identifier)]
                source = primaries[(pair, identifier)]
                require(source["contentType"] in {"vocabulary", "number"} and location["level"] <= level
                        and not location["held"] and location["domain"] == item["lexicalFamily"],
                        "Lexical support is future, held or belongs to another semantic family")
                expected_references.append({"id": identifier, "supportId": item["id"], "firstEditorialLevel": location["level"],
                    "canonicalThemeId": location["themeId"], "introducedBeforeIntentId": item["introducedBeforeIntentId"],
                    "reason": item["reason"], "analyse": False, "countsTowardProductionProgression": False, "insertedIntoPhraseSteps": False})
            require(theme.get("lexicalSupports") == expected_references and len({row["id"] for row in expected_references}) >= 2,
                    "Theme drops, clips, duplicates or silently alters a whole lexical support")
            seen, understood, imitated, recalled = set(), {}, {}, set()
            for sequence in theme["sequences"]:
                model_ids = set()
                for index, step in enumerate(sequence["steps"]):
                    if step["kind"] != "receive":
                        if step["kind"] == "understand": understood[step["utterance"]] = step["id"]
                        if step["kind"] == "imitate": imitated[step["utterance"]] = step["id"]
                        if step["kind"] == "choose-and-recall": recalled.add(step["utterance"])
                        continue
                    turn = expected_turns.get(step.get("receivedId"))
                    require(turn is not None and turn["id"] not in seen, "Received step is undeclared or duplicated")
                    for field, value in turn.items():
                        if field != "id": require(step.get(field) == value, "Received step differs from its explicit use: " + field)
                    require(step["id"] == sequence["id"] + ":received:" + turn["id"] and step.get("contentType") == "utterance"
                            and step.get("wholePhrase") is True and step.get("countsForProgress") is False
                            and step.get("countsTowardProductionProgression") is False and step.get("requiresProduction") is False
                            and not step.get("isPreparation") and not step.get("isReview") and not step.get("isContextReuse"),
                            "Received utterance entered learner production, review or progress")
                    require(turn["prepares"] in sequence["phraseIds"], "Received turn has no learner anchor")
                    prepared = {}
                    for identifier in turn["answerWithUtteranceIds"]:
                        require(identifier in understood and identifier in imitated, "Question precedes actual response preparation")
                        prepared[identifier] = {"understoodInStep": understood[identifier], "imitatedInStep": imitated[identifier]}
                    require(step.get("preparedAnswerSteps") == prepared, "Received preparation evidence refers to absent/wrong steps")
                    if "beforeIntentId" in turn:
                        require(index + 1 < len(sequence["steps"]) and sequence["steps"][index + 1]["kind"] == "choose-and-recall"
                                and sequence["steps"][index + 1]["utterance"] == turn["prepares"], "Cue is not followed by its prepared learner answer")
                    else:
                        require(turn["answerWith"] == [] and index > 0 and sequence["steps"][index - 1]["kind"] == "choose-and-recall"
                                and sequence["steps"][index - 1]["utterance"] == turn["prepares"] and turn["prepares"] in recalled,
                                "Closure is implicit, misplaced or used before a learner answer")
                    seen.add(turn["id"]); model_ids.add(turn["utterance"])
                    usage_count += 1
                require(set(sequence.get("receivedIds", [])) == model_ids
                        and len(sequence.get("receivedIds", [])) == len(model_ids), "Sequence received models are omitted or duplicated")
            require(seen == set(expected_turns), "A planned question/closure is missing")
            support_count += len(expected_references)
    for pair, bank in pack["repertoires"].items():
        models = bank.get("receivedModels", [])
        require(len({model["id"] for model in models}) == len(models), "Duplicate received bank model")
        require({model["id"] for model in models} == {identifier for p, identifier in heard_uses if p == pair},
                "Unused or missing received bank model")
        for model in models:
            key = (pair, model["id"])
            require(model.get("heardOnly") is True and model.get("referenceOnly") is True
                    and model.get("firstHeardLevel") == min(heard_uses[key])
                    and model.get("contentType") == "utterance" and not any(field in model for field in ("role", "speaker", "kind")),
                    "Received model owns an intrinsic role or wrong first-listening level")
            if key in primaries:
                expected = {field: value for field, value in primaries[key].items() if field not in {"role", "speaker", "kind"}}
                expected.update(heardOnly=True, referenceOnly=True, firstHeardLevel=min(heard_uses[key]),
                    canonicalLocation={field: locations[key][field] for field in ("pairId", "level", "themeId")})
                require(model == expected, "Received reuse changes a whole source or its production location")
            else:
                require(key in resolution["heardEntries"] and "canonicalLocation" not in model, "Heard-only model claims a production canonical")
    baseline = data.get("baseline")
    if baseline:
        for identifier, before in baseline["canonical"].items():
            key = (before["pairId"], identifier)
            require(key in primaries and digest(canonical(fields(primaries[key]))) == before["fieldsSha256"]
                    and digest(canonical(primaries[key]["source"])) == before["sourceSha256"], "An old source tuple/provenance changed during extension")
        for identifier in baseline["protectedCanonicalIds"]:
            before = baseline["canonical"][identifier]
            location = locations[(before["pairId"], identifier)]
            require(location["level"] == before["level"] and location["themeId"] == before["themeId"], "A protected old model moved")
        actual_themes = {cell["pairId"] + ":" + theme["id"]: theme for cell in pack["cells"].values() for theme in cell["themes"]}
        for key, expected_hash in baseline["protectedThemeSha256"].items():
            require(key in actual_themes and digest(canonical(actual_themes[key])) == expected_hash, "An old situation theme was altered")
    resolution.update(receivedUsageCount=usage_count, lexicalSupportUses=support_count,
                      receivedModels=len(heard_uses), previousCanonicalSourcesIntact=len(baseline["canonical"]) if baseline else 0)

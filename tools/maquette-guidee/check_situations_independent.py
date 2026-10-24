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
    require(freeze.get("version") == 1 and freeze.get("publicationApproved") is False,
            "Situation freeze has another version or overclaims publication")
    plan_path = DIRECTORY + "/plan.json"
    plan = js(plan_path)
    require(digest(raw(plan_path)) == freeze.get("planSha256"), "Situation plan differs from the frozen source")
    require(len(plan.get("themes", [])) == 10, "Situation extension needs exactly ten themes")
    intent_map, visual_ids, theme_ids, domains = {}, set(), set(), set()
    for theme in plan["themes"]:
        require(type(theme.get("level")) is int and 2 <= theme["level"] <= 6, "Situation theme is outside L2-L6")
        require(theme["themeId"] not in theme_ids and theme["domain"] not in domains
                and theme["visualId"] not in visual_ids, "Situation definition aliases a different theme")
        theme_ids.add(theme["themeId"]); domains.add(theme["domain"]); visual_ids.add(theme["visualId"])
        require(len(theme["intents"]) == 8, "A new situation has fewer than eight intent positions")
        for intent in theme["intents"]:
            require(intent["id"] not in intent_map and intent["level"] == theme["level"], "Intent identity or level differs")
            intent_map[intent["id"]] = (theme, intent)
    require(all(sum(t["level"] == level for t in plan["themes"]) == 2 for level in range(2, 7)),
            "New themes do not retain two complete situations per level")
    files = freeze.get("pairFiles", [])
    require(len(files) == 7 and {entry["pair"] for entry in files} == set(languages), "Situation ledgers lack exact seven-pair coverage")
    items, ledgers = {}, {}
    for descriptor in files:
        pair, relative = descriptor["pair"], descriptor["path"]
        require(Path(relative).is_relative_to(DIRECTORY) and ".." not in Path(relative).parts,
                "Situation ledger escapes its source directory")
        require(digest(raw(relative)) == descriptor["sha256"], "Situation ledger changed after its freeze")
        document = js(relative)
        require(document["version"] == 1 and document["pair"] == pair
                and document["planHash"] == freeze["planSha256"], "Situation ledger identity or plan hash differs")
        require(len(document["items"]) == 80 and {i["intentId"] for i in document["items"]} == set(intent_map),
                "A situation pair omits, repeats or substitutes an intent")
        for item in document["items"]:
            theme, _intent = intent_map[item["intentId"]]
            require(item["id"] not in items and item["pair"] == pair and item["topicId"] == theme["id"]
                    and item["proposedLevel"] == theme["level"], "Candidate identity, theme or level differs")
            require(item.get("contentType") == "utterance" and item.get("editorialReviewStatus") == "reviewed"
                    and isinstance(item.get("reason"), str) and item["reason"].strip(), "Situation candidate lacks its semantic decision")
            require(all(isinstance(item.get(k), str) and item[k].strip() for k in ("study", "native", "phon"))
                    and not re.search(r"\{[\w-]+\}|_{2,}", item["study"]), "Situation candidate is empty or an open model")
            require(isinstance(item.get("source"), dict) and isinstance(item.get("duplicateAudit"), dict),
                    "Situation candidate has no source or duplicate decision")
            items[item["id"]] = item
            ledgers[item["id"]] = descriptor
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
            "ledgers": ledgers, "archiveRecords": archive_records, "archiveForms": archive_forms,
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
    for item_id, item in data["items"].items():
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
            data["sourceFieldsCompared"] += len(fields(original))
        elif kind == "editorial-authored-whole-entry":
            require(source.get("kind") == "editorial-authored-whole-utterance"
                    and item["phoneticReviewStatus"] == "pending-Claude", "New whole-phrase help lacks its pending Claude review")
            normalized = form(item["study"])
            require(normalized not in existing_forms[pair],
                    "An allegedly new situation phrase is an old form with a new translation or punctuation")
            require(normalized not in new_forms[pair], "Two authored positions disguise a duplicated new phrase")
            new_forms[pair].add(normalized)
        else:
            other = data["items"].get(source.get("candidateId"))
            require(other is not None and other["pair"] == pair and other["proposedLevel"] <= item["proposedLevel"]
                    and fields(other) == fields(item) and other["phoneticReviewStatus"] == item["phoneticReviewStatus"],
                    "Candidate reuse is future, crosses pairs or changes an entire field")
    data["inputKindCounts"] = dict(counts)


def resolve_sources(pack, primaries, locations, base_levels, require, canonical, digest):
    """Independently distinguish old canonical uses from actual new entries."""
    data = pack.get("situations")
    if data is None:
        return {"newEntries": {}, "catalogueIntroductions": {}, "usesByTheme": {}, "resolved": {}}
    base_identities, base_forms = defaultdict(list), defaultdict(list)
    for (pair, source_id), phrase in primaries.items():
        if phrase["source"]["collection"] not in {"situation-authored", "situation-conversation"}:
            base_identities[(pair, identity(phrase))].append(source_id)
            base_forms[(pair, form(phrase["study"]))].append(source_id)
    resolved, visiting, new_entries, catalogue_introductions = {}, set(), {}, {}
    first_levels = dict(base_levels)
    newly_registered = {}

    def visit(item_id):
        if item_id in resolved:
            return resolved[item_id]
        require(item_id in data["items"] and item_id not in visiting, "Missing or cyclic situation candidate reference")
        visiting.add(item_id)
        item = data["items"][item_id]
        pair, kind, source = item["pair"], item["kind"], item["source"]
        source_level = None
        if kind == "catalogue-reference":
            study = pack["languages"][pair][1]
            source_id = f"catalogue:{study}:{source['sourceIndex']}"
        elif kind == "candidate-reference":
            source_id = visit(source["candidateId"])
        elif base_identities.get((pair, identity(item))):
            source_id = min(base_identities[(pair, identity(item))], key=lambda source_id: (locations[(pair, source_id)]["level"], source_id))
        elif (pair, identity(item)) in newly_registered:
            source_id = newly_registered[(pair, identity(item))]
        else:
            require(not base_forms.get((pair, form(item["study"]))),
                    "An existing studied form was imported again with a different translation or help")
            authored = kind == "editorial-authored-whole-entry"
            source_id = ("situation-authored:" if authored else "situation-conversation:") + item_id
            ledger = data["ledgers"][item_id]
            expected_source = {"collection": "situation-authored" if authored else "situation-conversation",
                               "kind": kind, "ledgerFile": ledger["path"], "ledgerFileSha256": ledger["sha256"],
                               "itemId": item_id,
                               "sourceSha256": digest(canonical(item)) if authored else source["entrySha256"],
                               "ledgerItemSha256": digest(canonical(item)),
                               "fieldMap": {key: key for key in fields(item)}, "provenance": source}
            if "sourceRole" in item:
                expected_source["sourceRole"] = item["sourceRole"]
            if not authored:
                source_level = data["archiveRecords"][pair][(Path(source["path"]).name, source["jsonPointer"])][2]
                expected_source["sourceLevel"] = source_level
            new_entries[(pair, source_id)] = {"item": item, "source": expected_source, "authored": authored}
            newly_registered[(pair, identity(item))] = source_id
        preferred = item["duplicateAudit"].get("preferredCanonicalId")
        if preferred:
            require(item["duplicateAudit"].get("decision") == "reuse-existing"
                    and (pair, preferred) in primaries and fields(primaries[(pair, preferred)]) == fields(item),
                    "A preferred canonical ID silently substitutes a different translation or phonetic")
            source_id = preferred
        require((pair, source_id) in primaries and fields(primaries[(pair, source_id)]) == fields(item),
                "Resolved situation source is missing, duplicated or changed at runtime")
        original = primaries[(pair, source_id)]
        require(original["contentType"] == "utterance" and not original.get("isTemplate")
                and locations[(pair, source_id)]["domain"] != "reserve"
                and not locations[(pair, source_id)]["held"], "A situation repurposes a lexeme, held entry or reserved model")
        old_level = first_levels.get((pair, source_id), source_level)
        if old_level is not None and old_level > item["proposedLevel"]:
            decision = item.get("introductionDecision", {})
            require(decision.get("action") == "introduce-earlier" and decision.get("reviewStatus") == "reviewed"
                    and decision.get("fromEditorialLevel") == old_level and decision.get("proposedLevel") == item["proposedLevel"]
                    and isinstance(decision.get("reason"), str) and decision["reason"].strip(),
                    "A future source is shown without an explicit whole-phrase introduction decision")
            if kind == "catalogue-reference":
                key = (pair, source["sourceIndex"])
                previous = catalogue_introductions.get(key)
                if previous is None or item["proposedLevel"] < previous["proposedLevel"]:
                    theme = data["intents"][item["intentId"]][0]
                    catalogue_introductions[key] = {"proposedLevel": item["proposedLevel"], "domain": theme["domain"],
                                                   "itemId": item_id, "decision": decision}
        first_levels[(pair, source_id)] = min(old_level, item["proposedLevel"]) if old_level is not None else item["proposedLevel"]
        require(locations[(pair, source_id)]["level"] <= item["proposedLevel"], "Context reuse precedes its canonical first level")
        resolved[item_id] = source_id
        visiting.remove(item_id)
        return source_id

    for item_id in data["items"]:
        visit(item_id)
    uses = {}
    for pair in pack["languages"]:
        for theme in data["plan"]["themes"]:
            by_intent = {item["intentId"]: item for item in data["items"].values()
                         if item["pair"] == pair and item["topicId"] == theme["id"]}
            ordered = [{"item": by_intent[intent["id"]], "canonicalId": resolved[by_intent[intent["id"]]["id"]]}
                       for intent in theme["intents"]]
            require(len(ordered) == 8 and len({use["canonicalId"] for use in ordered}) == 8,
                    "Eight intent positions are disguised copies of fewer than eight whole sources")
            uses[(pair, theme["level"], theme["themeId"])] = ordered
    actual_new = {key for key, row in primaries.items() if row["source"]["collection"] in {"situation-authored", "situation-conversation"}}
    require(actual_new == set(new_entries), "Actual new situation canonicals differ from source-proven creations/imports")
    for key, expected in new_entries.items():
        actual = primaries[key]
        require(actual["source"] == expected["source"] and actual.get("intentId") == expected["item"]["intentId"]
                and actual.get("topicId") == expected["item"]["topicId"], "New situation provenance or intent was changed")
        require(actual.get("phoneticReviewStatus") == expected["item"]["phoneticReviewStatus"]
                and actual.get("semanticReview") == {"status": "reviewed", "reason": expected["item"]["reason"]},
                "New situation help was declared reviewed or lost its editorial decision")
        require(actual.get("readingScript") == expected["item"].get("readingScript"),
                "New situation reading-script metadata differs from its whole entry")
    return {"newEntries": new_entries, "catalogueIntroductions": catalogue_introductions,
            "usesByTheme": uses, "resolved": resolved}

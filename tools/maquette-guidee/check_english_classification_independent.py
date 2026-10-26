#!/usr/bin/env python3
"""Independent reader for the frozen English classification ledger.

No builder is imported.  The current edition is checked before a private
projection onto the previously verified source edition is returned.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
import copy
import hashlib
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
BASE = "13f42b5814f2b230d76d2d0ef267dcf406c523c2"
EVIDENCE = "1bf76c72f58e2ffe37e27d2b137a1ebe350e097f"
SOURCE_PATH = "docs/revue-integrale/classement-fr-en/registre-classement.json"
REGISTRY_PATH = "docs/niveaux-progressifs/classement-fr-en/registre/registre-classement.json"
REGISTRY_SHA = "a605a44eb886e598014dab0ed4b1000c819060ad4dcf83f939fd70c9a4dc020a"
VISUAL_PATH = "docs/niveaux-progressifs/classement-fr-en/visuels.json"
VISUAL_SHA = "a7aa72f90aa3ebd42823d7632bd1a6e25d5fa72006d585484990d9ad877a47da"
DATA_ROOT = "melunga_deploy/content/niveaux-progressifs"
PAIRS = ("fr-en", "fr-es", "fr-it", "fr-zh", "fr-ja", "fr-ko", "zh-fr")
MANIFEST_PATH = DATA_ROOT + "/manifest.json"
NEW_THEMES = {"L3-sante": (3, "Santé : demander une aide médicale"),
              "L5-cuisine-recette": (5, "Cuisine : suivre une recette"),
              "L9-telephone": (9, "Téléphone : accueillir, filtrer et faire patienter")}
RENAMED_TITLE = "Remercier et s’excuser en registre soutenu"


class ClassificationError(ValueError):
    pass


def require(condition, reason):
    if not condition:
        raise ClassificationError("English classification: " + reason)


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def document_paths():
    return [f"{DATA_ROOT}/{pair}/L{level}.json" for pair in PAIRS for level in range(1, 11)] + [
        f"{DATA_ROOT}/repertoires/{pair}.json" for pair in PAIRS]


_GIT_CACHE = {}


def git_bytes(root, commit, path):
    key = str(root), commit, path
    if key not in _GIT_CACHE:
        _GIT_CACHE[key] = subprocess.check_output(["git", "show", commit + ":" + path], cwd=root)
    return _GIT_CACHE[key]


def baseline_documents(root):
    return {path: json.loads(git_bytes(root, BASE, path)) for path in [*document_paths(), MANIFEST_PATH]}


def read_registry(root, override_raw=None):
    raw = (root / REGISTRY_PATH).read_bytes() if override_raw is None else override_raw
    require(sha(raw) == REGISTRY_SHA, "frozen registry bytes differ")
    require(raw == git_bytes(root, EVIDENCE, SOURCE_PATH), "registry differs from pinned reviewer commit")
    data = json.loads(raw)
    require(data.get("id") == "tri-themes-claude-fr-en" and data.get("pair") == "fr-en"
            and data.get("baseSnapshotCommit") == BASE, "wrong registry identity or before edition")
    ops = data.get("ops")
    require(isinstance(ops, list) and len(ops) == 670 and len({o["id"] for o in ops}) == 670,
            "operation identities missing or repeated")
    require(Counter(o.get("op") for o in ops) == {"move": 610, "to-reserve": 37, "keep": 23},
            "operation distribution changed")
    require(sum(o["op"] == "move" and o["fromLevel"] != o["toLevel"] for o in ops) == 127,
            "cross-level operation count differs")
    require({row["id"]: (row["level"], row["title"]) for row in data["newThemes"]} == NEW_THEMES,
            "new theme scope or title changed")
    require(data["renameThemes"] == [{"id": "L9-saluer", "level": 9, "newTitle": RENAMED_TITLE}],
            "renamed theme differs from reviewed literal")
    return data, raw


def at(document, location):
    for part in location:
        document = document[part]
    return document


def index_canonical(documents):
    result = {}
    for level in range(1, 11):
        path = f"{DATA_ROOT}/fr-en/L{level}.json"
        cell = documents[path]
        require(cell["pairId"] == "fr-en" and cell["level"] == level, "English cell identity changed")
        for field in ("themes", "heldThemes"):
            for ti, theme in enumerate(cell.get(field, [])):
                for pi, phrase in enumerate(theme["phrases"]):
                    require(phrase["id"] not in result, "canonical identity duplicated")
                    result[phrase["id"]] = (level, theme["id"], path, [field, ti, "phrases", pi], phrase)
        for pi, phrase in enumerate(cell["reserve"]):
            require(phrase["id"] not in result, "canonical identity duplicated in reserve")
            result[phrase["id"]] = (level, None, path, ["reserve", pi], phrase)
    return result


def validate_before_anchors(ledger, before):
    index = index_canonical(before)
    require(len(index) == 4704, "English before inventory no longer has 4,704 canonical identities")
    for op in ledger["ops"]:
        require(op["id"] in index, "operation targets an unknown identity")
        level, theme, path, location, phrase = index[op["id"]]
        locator_theme = "reserve" if location[0] == "reserve" else theme
        expected = {"level": level, "theme": locator_theme, "path": path, "location": location,
                    "study": phrase["study"]}
        require(op["expectedBefore"] == expected and op["fromLevel"] == level
                and op["fromTheme"] == locator_theme and op["study"] == phrase["study"],
                "before locator or whole study differs for " + op["id"])
        require(at(before[path], location) == phrase, "before location does not resolve exact object")
    return index


def read_minimal_pack(root):
    root = Path(root).resolve()
    fingerprints = {}
    def read(path):
        raw = (root / path).read_bytes(); fingerprints[path] = sha(raw)
        return json.loads(raw)
    manifest = read(MANIFEST_PATH)
    documents = {path: read(path) for path in document_paths()}
    return {"root": root, "manifest": manifest,
            "cells": {(pair, level): documents[f"{DATA_ROOT}/{pair}/L{level}.json"]
                      for pair in PAIRS for level in range(1, 11)},
            "repertoires": {pair: documents[f"{DATA_ROOT}/repertoires/{pair}.json"] for pair in PAIRS},
            "fingerprints": fingerprints,
            "englishClassificationRegistryRaw": (root / REGISTRY_PATH).read_bytes(),
            "englishClassificationVisualRaw": (root / VISUAL_PATH).read_bytes()}


def runtime_documents(pack):
    documents = {f"{DATA_ROOT}/{pair}/L{level}.json": cell for (pair, level), cell in pack["cells"].items()}
    documents.update({f"{DATA_ROOT}/repertoires/{pair}.json": bank for pair, bank in pack["repertoires"].items()})
    documents[MANIFEST_PATH] = pack["manifest"]
    return documents


def concept_key(phrase):
    concept = phrase.get("lexicalConceptId")
    if concept:
        return "leger" if concept in {"leger", "léger", "le\u0301ger"} else concept
    return sha(canonical([phrase["study"], phrase["native"]]))


def expected_canonicals(ledger, before):
    old = validate_before_anchors(ledger, before)
    ops = {op["id"]: op for op in ledger["ops"]}
    definitions = {}
    for level in range(1, 11):
        cell = before[f"{DATA_ROOT}/fr-en/L{level}.json"]
        for theme in cell["themes"] + cell.get("heldThemes", []):
            definitions[(level, theme["id"])] = theme
    for identifier, (level, title) in NEW_THEMES.items():
        definitions[(level, identifier)] = {"id": identifier, "title": title,
            "domain": identifier.split("-", 1)[1], "section": "situations", "contentType": "utterance"}
    expected, locations, new_orders = {}, {}, defaultdict(list)
    for identifier, (level, theme, _path, _location, original) in old.items():
        op = ops.get(identifier)
        phrase = copy.deepcopy(original)
        destination = level, theme
        if op and op["op"] != "keep":
            if op["op"] == "move":
                destination = op["toLevel"], op["toTheme"]
                require(destination in definitions, "unresolved destination for " + identifier)
                definition = definitions[destination]
                phrase["editorialLevel"] = destination[0]
                phrase["placement"].update(domain=definition["domain"], themeId=destination[1], section=definition["section"])
            else:
                destination = level, None
                phrase["placement"].update(domain="reserve", themeId=None, section="reserve")
            phrase["englishClassification"] = {"registrySha256": REGISTRY_SHA, "operation": op["op"],
                "fromLevel": level, "fromTheme": theme, "toLevel": destination[0], "toTheme": destination[1]}
        expected[identifier] = phrase
        locations[identifier] = destination
        if not op or op["op"] == "keep":
            new_orders[destination].append(identifier)
    for op in ledger["ops"]:
        if op["op"] != "keep":
            new_orders[locations[op["id"]]].append(op["id"])
    return old, expected, locations, new_orders, definitions


def checked_visuals(pack):
    root = pack["root"]
    raw = pack.get("englishClassificationVisualRaw", (root / VISUAL_PATH).read_bytes())
    require(sha(raw) == VISUAL_SHA, "new visual registry changed")
    document = json.loads(raw)
    require(document["baseSnapshotCommit"] == BASE and document["decisionSourceCommit"] == EVIDENCE
            and document["decisionSourceSha256"] == REGISTRY_SHA, "new visual provenance changed")
    require(len(document["themes"]) == 3, "new visual count differs")
    result, cells = {}, set()
    for row in document["themes"]:
        require(row["themeId"] in NEW_THEMES and row["pair"] == "fr-en"
                and (row["level"], row["title"]) == NEW_THEMES[row["themeId"]]
                and row["visualId"] == row["themeId"], "visual belongs to another theme or pair")
        require(row["themeId"] not in result, "duplicated new visual identity")
        photo = row["photo"]
        require(set(photo) == {"asset", "column", "row", "columns", "rows"}
                and photo["asset"].startswith("assets/") and ".." not in Path(photo["asset"]).parts,
                "new photo path or crop shape is unsafe")
        require(type(photo["columns"]) is int and type(photo["rows"]) is int
                and photo["columns"] in {3, 4} and photo["rows"] == 4
                and type(photo["column"]) is int and 0 <= photo["column"] < photo["columns"]
                and type(photo["row"]) is int and 0 <= photo["row"] < photo["rows"], "photo crop is outside its atlas")
        asset = "melunga_deploy/" + photo["asset"]
        actual = (root / asset).read_bytes()
        require(sha(actual) == row["assetSha256"] and actual == git_bytes(root, BASE, asset),
                "new crop changes its existing image source")
        address = photo["asset"], photo["column"], photo["row"]
        require(address not in cells, "new themes repeat the same photo")
        cells.add(address); result[row["themeId"]] = row
    require(set(result) == set(NEW_THEMES), "new photos do not cover all approved themes")
    return result


def _expected_reviews(original, level, theme_id, expected, locations, definitions, primary_ids):
    result = []
    for row in original.get("reviewReferences", []):
        identifier = row["id"]
        require(identifier in expected, "old review references an unknown English canonical")
        first_level, first_theme = locations[identifier]
        if first_theme is None or first_level >= level or identifier in primary_ids:
            continue
        source_theme = definitions[(first_level, first_theme)]
        if source_theme["domain"] != original["domain"] or expected[identifier]["contentType"] != original["contentType"]:
            continue
        value = copy.deepcopy(row)
        value["firstEditorialLevel"] = first_level
        value["canonicalThemeId"] = first_theme
        result.append(value)
    return result


def _step_sources(theme, primary, bank, expected):
    result = dict(primary)
    for row in [*theme.get("reviewReferences", []), *theme.get("contextReferences", [])]:
        require(row["id"] in expected and row["id"] in bank, "practice reference has no canonical or transport source")
        result[row["id"]] = expected[row["id"]]
    return result


def _check_sequences(theme, level, expected, locations, bank, *, prefix_sequences=()):
    """Check references, preparation order and exact model/recall stages independently."""
    practice = _step_sources(theme, {p["id"]: p for p in theme["phrases"]}, bank, expected)
    review_ids = {row["id"] for row in theme.get("reviewReferences", [])}
    context_ids = {row["id"] for row in theme.get("contextReferences", [])}
    allowed_received = {s["id"]: s for q in prefix_sequences for s in q["steps"] if s["kind"] == "receive"}
    assigned, step_ids, prepared_references = [], set(), set()
    for sequence_number, sequence in enumerate(theme["sequences"]):
        ids = sequence["phraseIds"]
        require(1 <= len(ids) <= 5 and len(ids) == len(set(ids)) and set(ids) <= set(practice),
                "invalid primary sequence members")
        assigned.extend(ids)
        if sequence_number >= len(prefix_sequences):
            number = sequence_number - len(prefix_sequences) + 1
            sid = f"fr-en:L{level}:{theme['id']}" + (":classification-extra" if prefix_sequences else "") + f":{number}"
            require(set(sequence) == {"id", "title", "phraseIds", "preparationIds", "steps"}
                    and sequence["id"] == sid and sequence["title"] == f"Séquence {number}",
                    "ordinary sequence identity, title or metadata differs")
        declarations = sequence.get("preparationIds", [])
        require(len(declarations) == len(set(declarations)) and not set(declarations) & set(ids),
                "local preparation repeats a group primary")
        stages, preparations = defaultdict(list), defaultdict(dict)
        used_preparations, started = set(), set()
        for pos, step in enumerate(sequence["steps"]):
            require(step["id"] not in step_ids, "step identity duplicated")
            step_ids.add(step["id"])
            require(not ({"study", "native", "phon", "reading"} & set(step)), "step embeds a second source text")
            if step["kind"] == "receive":
                require(step == allowed_received.get(step["id"]), "a received line or its source role escaped its original cycle")
                continue
            target = step.get("utterance")
            require(target in expected and locations[target][1] is not None,
                    "exercise activates a reserved or unknown canonical")
            phrase = expected[target]
            require(step.get("wholePhrase") is (phrase["contentType"] == "utterance")
                    and step.get("contentType") == phrase["contentType"], "step retypes its source")
            if step.get("isPreparation") is True:
                target_primary = step.get("prepares")
                require(target in declarations and target_primary in ids and target_primary not in started,
                        "preparation is missing, late or targets another group")
                require(locations[target][0] == level and phrase["contentType"] == "utterance"
                        and expected[target_primary]["contentType"] == "utterance",
                        "preparation is future, lexical or outside this level")
                reachable, pending = set(), list(expected[target_primary]["placement"].get("plannedPrerequisiteIndices", []))
                while pending:
                    index = pending.pop()
                    if index in reachable:continue
                    reachable.add(index)
                    source = expected.get(f"catalogue:en:{index}")
                    if source:pending.extend(source["placement"].get("plannedPrerequisiteIndices", []))
                require(phrase.get("source", {}).get("collection") == "DECKS.en"
                        and phrase["source"]["sourceIndex"] in reachable,
                        "local preparation has no declared prerequisite path")
                require(step["kind"] in {"understand", "imitate"}
                        and step["kind"] not in preparations[(target_primary, target)], "preparation has a repeated or hidden recall stage")
                require(set(step) == {"id", "kind", "utterance", "wholePhrase", "contentType", "requiresProduction", "isPreparation", "prepares"}
                        and step["requiresProduction"] is (step["kind"] == "imitate")
                        and step["id"] == f"{sequence['id']}:{ids.index(target_primary)}:prepare:{phrase['source']['sourceIndex']}:{step['kind']}",
                        "local preparation metadata or step identity changed")
                if step["kind"] == "imitate":
                    require("understand" in preparations[(target_primary, target)], "preparation imitates before understanding")
                preparations[(target_primary, target)][step["kind"]] = step["id"]
                used_preparations.add(target);prepared_references.add((target_primary, target))
                continue
            require(target in ids, "step points outside its declared group")
            ordinary_keys = {"id", "kind", "utterance", "wholePhrase", "contentType", "requiresProduction", "isReview", "isContextReuse"}
            if step["kind"] == "choose-and-recall":ordinary_keys.add("preparedInSteps")
            require(set(step) == ordinary_keys, "primary step has undeclared metadata")
            stage = "recall" if step["kind"] == "choose-and-recall" else step["kind"]
            require(step["id"] == f"{sequence['id']}:{ids.index(target)}:{stage}", "primary step identity differs from its group/member/stage")
            started.add(target)
            stages[target].append(step)
            require(step.get("isReview") is (target in review_ids)
                    and step.get("isContextReuse", False) is (target in context_ids), "practice role flags changed")
        require(set(declarations) == used_preparations, "unused or omitted local preparation declaration")
        for target in ids:
            trace = stages[target]
            require([s["kind"] for s in trace] == ["understand", "imitate", "choose-and-recall"],
                    "a primary lacks ordered comprehension, imitation and recall")
            require(all(type(s["requiresProduction"]) is bool for s in trace)
                    and [s["requiresProduction"] for s in trace] == [False, True, True], "primary production roles differ")
            require(trace[2].get("preparedInSteps") == {"understoodInStep": trace[0]["id"], "imitatedInStep": trace[1]["id"]},
                    "recall points to false or missing preparation")
    require(len(assigned) == len(set(assigned)) and set(assigned) == set(practice),
            "a practice source is omitted or repeated across sequences")
    return {"steps": len(step_ids), "practiceIds": assigned, "localPreparations": prepared_references}


def _counts(phrases):
    return {kind: sum(p["contentType"] == kind for p in phrases)
            for kind in ("utterance", "vocabulary", "number", "incomplete", "review")}


def _lexical_counts(phrases):
    return dict(sorted(Counter(p["lexicalClass"] for p in phrases if p["contentType"] == "vocabulary").items()))


def _theme_metrics(documents):
    totals = Counter()
    for level in range(1, 11):
        cell = documents[f"{DATA_ROOT}/fr-en/L{level}.json"]
        totals["activePhrases"] += sum(len(t["phrases"]) for t in cell["themes"])
        totals["reservedPhrasesRetainedWithoutSteps"] += len(cell["reserve"])
        totals["visibleThemes"] += len(cell["themes"])
        for theme in cell["themes"]:
            totals["reviewPresentationReferences"] += len(theme.get("reviewReferences", []))
            totals["contextPresentationReferences"] += len(theme.get("contextReferences", []))
            totals["visibleThemeConceptsIncludingReviews"] += theme["pedagogicalConceptCount"]
            for sequence in theme["sequences"]:
                totals["localPreparationReferences"] += len(sequence.get("preparationIds", []))
                for step in sequence["steps"]:
                    totals["stepsChecked"] += 1
                    totals["situationSteps" if step["contentType"] == "utterance" else "lexicalSteps"] += 1
                    if step.get("isPreparation") is True:
                        totals["localPreparationSteps"] += 1
    return totals


def validate_and_project(pack):
    root = Path(pack["root"])
    ledger, raw = read_registry(root, pack.get("englishClassificationRegistryRaw"))
    require(pack["manifest"].get("englishClassification") is not None, "classification declaration is absent")
    before = baseline_documents(root)
    actual = runtime_documents(pack)
    require(set(actual) == set(before), "runtime bundle omits or adds a document")
    for path in document_paths():
        if "/fr-en/" not in path and not path.endswith("/fr-en.json"):
            require(canonical(actual[path]) == canonical(before[path]), "another language pair was changed: " + path)
    old, expected, locations, orders, definitions = expected_canonicals(ledger, before)
    actual_index = index_canonical(actual)
    require(set(actual_index) == set(old), "English canonical inventory lost or invented a card")
    for identifier, entry in actual_index.items():
        require((entry[0], entry[1]) == locations[identifier], "wrong final destination for " + identifier)
        require(canonical(entry[4]) == canonical(expected[identifier]), "source, tuple, type, annotation or undeclared field changed for " + identifier)
    visuals = checked_visuals(pack)
    bank_path = f"{DATA_ROOT}/repertoires/fr-en.json"
    old_bank, bank = before[bank_path], actual[bank_path]
    expected_bank = copy.deepcopy(old_bank)
    for index, original in enumerate(old_bank["phrases"]):
        identifier = original["id"]
        require(identifier in expected and locations[identifier][1] is not None, "transport retained an unknown or newly reserved learner source")
        phrase = copy.deepcopy(expected[identifier])
        for field in ("referenceOnly", "sourceHash"):
            if field in original:phrase[field] = copy.deepcopy(original[field])
        phrase["canonicalLocation"] = {"pairId": "fr-en", "level": locations[identifier][0], "themeId": locations[identifier][1]}
        expected_bank["phrases"][index] = phrase
    for index, original in enumerate(old_bank["receivedModels"]):
        identifier = original["id"]
        if identifier in locations and locations[identifier][1] is None and "canonicalLocation" in original:
            phrase = copy.deepcopy(original)
            phrase.pop("canonicalLocation")
            phrase["canonicalReserveLocation"] = {"pairId": "fr-en", "level": locations[identifier][0], "themeId": None}
            expected_bank["receivedModels"][index] = phrase
    expected_bank["englishClassificationEdition"] = {"registrySha256": REGISTRY_SHA, "pair": "fr-en"}
    require(canonical(bank) == canonical(expected_bank), "transport/received copy, order, role or canonical location differs")
    bank_map = {p["id"]: p for p in bank["phrases"]}
    dynamic = {"phrases", "totalPhrases", "reviewReferences", "newCount", "contextReferences", "reuseCount",
               "reviewCount", "presentedCount", "pedagogicalConceptCount", "densityStatus", "sequences",
               "contentType", "contentTypes", "classificationExtensionIds", "existingSourceCount"}
    thin, large, retired, mixed, extensions, metadata_by_level, canonical_locations = [], [], [], [], [], {}, {}
    total_steps, all_step_ids, preparations = 0, set(), set()
    changed_themes = []
    for level in range(1, 11):
        path = f"{DATA_ROOT}/fr-en/L{level}.json"
        original_cell, cell = before[path], actual[path]
        require(cell.get("heldThemes") == [] and cell.get("heldPhrases") == 0, "classification hid non-reserved cards in held themes")
        previous = {t["id"]: t for t in original_cell["themes"]}
        present_ids = [t["id"] for t in cell["themes"]]
        require(len(present_ids) == len(set(present_ids)), "theme identities duplicated")
        allowed_ids = [t["id"] for t in original_cell["themes"]]
        inserts = [identifier for identifier, (number, _) in NEW_THEMES.items() if number == level]
        insert_at = next((i for i, t in enumerate(original_cell["themes"]) if t["section"] == "vocabulary"), len(allowed_ids))
        allowed_ids[insert_at:insert_at] = inserts
        expected_visible = []
        for identifier in allowed_ids:
            definition = definitions[(level, identifier)]
            original_theme = previous.get(identifier)
            pids = orders[(level, identifier)]
            refs = _expected_reviews(original_theme, level, identifier, expected, locations, definitions, set(pids)) if original_theme else []
            contexts = copy.deepcopy(original_theme.get("contextReferences", [])) if original_theme else []
            for row in contexts:
                first_level, first_theme = locations[row["id"]]
                require(first_theme is not None and first_level <= level, "a contextual practice became reserved or future")
                row.update(firstEditorialLevel=first_level, canonicalThemeId=first_theme)
            if not pids and not refs and not contexts:
                retired.append({"id": identifier, "level": level, **{k: copy.deepcopy(definition[k]) for k in
                    ("title", "domain", "contentType", "section", "visualId", "photo")},
                    "reason": "no-presented-source-after-classification"})
                continue
            expected_visible.append(identifier)
        require(present_ids == expected_visible, "visible theme order or exact empty-theme retirement differs")
        for theme in cell["themes"]:
            identifier = theme["id"]
            definition = definitions[(level, identifier)]
            original_theme = previous.get(identifier)
            pids = orders[(level, identifier)]
            require([p["id"] for p in theme["phrases"]] == pids, "primary survivors or ledger arrivals reordered")
            references = _expected_reviews(original_theme, level, identifier, expected, locations, definitions, set(pids)) if original_theme else []
            require(canonical(theme.get("reviewReferences", [])) == canonical(references), "review pruning, eligibility or location update differs")
            contexts = copy.deepcopy(original_theme.get("contextReferences", [])) if original_theme else []
            for row in contexts:
                row.update(firstEditorialLevel=locations[row["id"]][0], canonicalThemeId=locations[row["id"]][1])
            require(canonical(theme.get("contextReferences", [])) == canonical(contexts), "contextual uses were silently changed")
            if original_theme:
                static_before = copy.deepcopy({k: v for k, v in original_theme.items() if k not in dynamic})
                if identifier == "L9-saluer":static_before["title"] = RENAMED_TITLE
                # A lexical support keeps its source; only its canonical address may move.
                if "lexicalSupports" in static_before:
                    for row in static_before["lexicalSupports"]:
                        if row.get("id") in locations:
                            row["firstEditorialLevel"], row["canonicalThemeId"] = locations[row["id"]]
                require(canonical({k: v for k, v in theme.items() if k not in dynamic}) == canonical(static_before),
                        "existing theme static metadata/source/visual changed: " + identifier)
            else:
                require(theme["domain"] == definition["domain"] and theme["section"] == "situations"
                        and theme["title"] == definition["title"] and theme["visualId"] == identifier
                        and theme["contentType"] == "utterance" and theme["optional"] is False
                        and theme["isTemplateCollection"] is False and canonical(theme["photo"]) == canonical(visuals[identifier]["photo"]),
                        "new theme metadata or visual differs from its explicit scope")
                require(set(theme) == {"id", "domain", "visualId", "title", "optional", "isTemplateCollection", "contentType", "section",
                    "totalPhrases", "phrases", "reviewReferences", "newCount", "contextReferences", "reuseCount", "reviewCount", "presentedCount",
                    "pedagogicalConceptCount", "densityStatus", "presentationOrder", "sequences", "photo"}
                    and theme["presentationOrder"] == "earlier-reviews-then-new-primary", "new theme has undeclared metadata")
            practice = _step_sources(theme, {p["id"]: p for p in theme["phrases"]}, bank_map, expected)
            n, r, c = len(pids), len(references), len(contexts)
            concepts = len({concept_key(p) for p in practice.values()})
            require(all(type(theme[key]) is int for key in ("totalPhrases", "newCount", "reviewCount", "reuseCount", "presentedCount", "pedagogicalConceptCount")),
                    "theme count type is not an integer")
            require(theme["totalPhrases"] == theme["newCount"] == n and theme["reviewCount"] == r
                    and theme["reuseCount"] == c and theme["presentedCount"] == len(practice)
                    and theme["pedagogicalConceptCount"] == concepts, "theme counters inflate or omit practice sources")
            require(len(practice) > 0, "an empty theme remains visible")
            if concepts < 6:
                thin.append({"id": identifier, "level": level, "presentedCount": len(practice), "conceptCount": concepts,
                             "newTheme": identifier in NEW_THEMES})
                require(theme["densityStatus"] == ("owner-approved-small-theme" if identifier in NEW_THEMES else "classification-small-theme-to-enrich"),
                        "small theme status does not expose its finite exception")
            else:
                require(theme["densityStatus"] == (original_theme["densityStatus"] if original_theme else "owner-approved-small-theme"),
                        "normal theme density status changed")
            if len(practice) > 100:
                large.append({"id": identifier, "level": level, "title": theme["title"],
                              "newCount": n, "presentedCount": len(practice)})
            phrase_types = sorted({p["contentType"] for p in practice.values()})
            original_type = original_theme["contentType"] if original_theme else "utterance"
            if len(phrase_types) > 1 or phrase_types[0] != original_type:
                mixed.append({"id": identifier, "level": level, "contentTypes": phrase_types,
                              "phraseIds": pids})
                require(theme["contentType"] == "mixed" and theme.get("contentTypes") == phrase_types,
                        "heterogeneous theme lacks exact card-type declaration")
            else:
                require(theme["contentType"] == original_type and "contentTypes" not in theme,
                        "homogeneous theme is falsely retyped")
            prefix = original_theme["sequences"] if original_theme and original_theme.get("isAdditionalSituation") else []
            if prefix:
                require(canonical(theme["sequences"][:len(prefix)]) == canonical(prefix), "original eight-intent/received sequence prefix changed")
                added = [p for p in pids if p not in {p["id"] for p in original_theme["phrases"]}]
                if added:
                    extensions.append({"id": identifier, "level": level, "addedIds": added})
                    require(theme.get("classificationExtensionIds") == added, "special situation extension differs from its added learner cards")
                else:
                    require("classificationExtensionIds" not in theme, "a special situation declares nonexistent added cards")
                require(theme["existingSourceCount"] == len(practice) - theme.get("authoredCount", 0),
                        "special situation existing-source count omits its extension")
            else:
                require("classificationExtensionIds" not in theme, "ordinary theme has an invented special extension")
                require(theme.get("existingSourceCount") == (original_theme.get("existingSourceCount") if original_theme else None),
                        "ordinary theme invents source-count provenance")
            seq = _check_sequences(theme, level, expected, locations, bank_map, prefix_sequences=prefix)
            total_steps += seq["steps"]; preparations.update(seq["localPreparations"])
            for sequence in theme["sequences"]:
                for step in sequence["steps"]:
                    require(step["id"] not in all_step_ids, "step identity duplicated across English themes")
                    all_step_ids.add(step["id"])
            if not prefix:
                require(seq["practiceIds"] == [row["id"] for row in references] + [row["id"] for row in contexts] + pids,
                        "ordinary group order is not revisions, contexts, stable primaries")
            if original_theme != theme:changed_themes.append(identifier)
            for rank, identifier in enumerate(pids):canonical_locations[identifier] = level, present_ids.index(theme["id"]), rank
        require([p["id"] for p in cell["reserve"]] == orders[(level, None)], "reserve order or retained inventory changed")
        all_rows = [p for t in cell["themes"] for p in t["phrases"]] + cell["reserve"]
        active = sum(len(t["phrases"]) for t in cell["themes"])
        expected_cell = copy.deepcopy(original_cell)
        expected_cell.update(themes=cell["themes"], heldThemes=[], reserve=cell["reserve"],
            totalPhrases=active, totalCanonicalPhrases=len(all_rows), counts=_counts(all_rows),
            lexicalClassCounts=_lexical_counts(all_rows), reservedPhrases=len(cell["reserve"]),
            heldPhrases=0, visibleCanonicalPhrases=active,
            presentedCount=sum(t["presentedCount"] for t in cell["themes"]),
            contextReuseCount=sum(t["reuseCount"] for t in cell["themes"]))
        expected_cell["englishClassificationEdition"] = {"registrySha256": REGISTRY_SHA, "pair": "fr-en"}
        retired_here = [row for row in retired if row["level"] == level]
        if retired_here:expected_cell["retiredThemes"] = retired_here
        else:require("retiredThemes" not in cell, "cell declares phantom retired themes")
        require(canonical(cell) == canonical(expected_cell), "cell counters, identity or undeclared metadata changed")
        metadata_by_level[level] = {"cell": cell, "active": active, "allRows": all_rows}
    require(sum(v["active"] for v in metadata_by_level.values()) == 4542
            and sum(len(v["cell"]["reserve"]) for v in metadata_by_level.values()) == 162,
            "active/reserve totals differ from the exact 37-card decision")
    # Every structural first encounter that is now late needs source-bound local preparation.
    missing_preparations = []
    for identifier, phrase in expected.items():
        if locations[identifier][1] is None or phrase["contentType"] != "utterance":continue
        for number in phrase["placement"].get("plannedPrerequisiteIndices", []):
            ancestor = f"catalogue:en:{number}"
            if ancestor not in expected or expected[ancestor]["contentType"] != "utterance" or locations[ancestor][1] is None:continue
            if canonical_locations.get(ancestor, (99,)) >= canonical_locations.get(identifier, (99,)):
                if (identifier, ancestor) not in preparations:missing_preparations.append([identifier, ancestor])
    require(not missing_preparations, "a moved structural prerequisite lacks local preparation")
    summary = {"registryPath": REGISTRY_PATH, "registrySha256": REGISTRY_SHA, "evidenceCommit": EVIDENCE,
        "baseSnapshotCommit": BASE, "operationCount": 670, "move": 610, "levelChanges": 127,
        "toReserve": 37, "keep": 23, "canonicalIdentities": 4704, "activeBefore": 4579,
        "activeAfter": 4542, "reserveBefore": 125, "reserveAfter": 162,
        "sourceFieldsPreserved": True, "newThemeVisuals": 3, "smallThemes": thin, "largeThemes": large,
        "retiredThemes": retired, "mixedThemes": mixed, "situationExtensions": extensions,
        "changedThemeIds": changed_themes, "stepsChecked": total_steps,
        "missingLocalPreparations": missing_preparations,
        "beforeMetrics": dict(_theme_metrics(before)), "afterMetrics": dict(_theme_metrics(actual)),
        "newlyReservedLearnerCanRemainHeardOnly": "catalogue:en:748"}
    summary["crossTypePlacements"] = [{"id": identifier, "level": number, "themeId": theme_id,
        "sourceContentType": phrase["contentType"], "originalThemeContentType": definitions[(number, theme_id)]["contentType"]}
        for identifier, (number, theme_id, _path, _pointer, phrase) in actual_index.items()
        if theme_id is not None and phrase["contentType"] != definitions[(number, theme_id)]["contentType"]]
    positions = {}
    for identifier, (number, theme_id, path, pointer, _phrase) in actual_index.items():
        positions[identifier] = ([number, pointer[1], pointer[3], theme_id] if theme_id is not None
                                else [number, len(actual[path]["themes"]), pointer[1], None])
    late = []
    for identifier, phrase in expected.items():
        for index in phrase["placement"].get("plannedPrerequisiteIndices", []):
            prerequisite_id = f"catalogue:en:{index}"
            if positions[prerequisite_id][:3] < positions[identifier][:3]:continue
            preparation = None
            for number in range(1, 11):
                for theme in actual[f"{DATA_ROOT}/fr-en/L{number}.json"]["themes"]:
                    for sequence in theme["sequences"]:
                        trace = {step["kind"]: step["id"] for step in sequence["steps"]
                                 if step.get("isPreparation") is True and step.get("prepares") == identifier
                                 and step.get("utterance") == prerequisite_id}
                        if trace:
                            preparation = {"sequenceId": sequence["id"], "understoodInStep": trace["understand"],
                                "imitatedInStep": trace["imitate"], "targetUnderstoodInStep": next(step["id"]
                                 for step in sequence["steps"] if step["kind"] == "understand"
                                 and step["utterance"] == identifier and not step.get("isPreparation"))}
            late.append({"pair": "fr-en", "sourceIndex": phrase["source"]["sourceIndex"],
                "prerequisiteSourceIndex": index, "targetPosition": positions[identifier],
                "prerequisitePosition": positions[prerequisite_id], "localPreparation": preparation,
                "targetContentType": phrase["contentType"], "prerequisiteContentType": expected[prerequisite_id]["contentType"],
                "doesNotProveAcquisition": True})
    summary["lateEnglishPrerequisites"] = late
    _validate_manifest(pack, ledger, before, actual, expected, metadata_by_level, summary)
    projected = dict(pack)
    projected["cells"] = dict(pack["cells"])
    for level in range(1, 11):projected["cells"][("fr-en", level)] = copy.deepcopy(before[f"{DATA_ROOT}/fr-en/L{level}.json"])
    projected["repertoires"] = dict(pack["repertoires"])
    projected["repertoires"]["fr-en"] = copy.deepcopy(before[bank_path])
    projected["manifest"] = copy.deepcopy(before[MANIFEST_PATH])
    projected["fingerprints"] = dict(pack["fingerprints"])
    for path in [MANIFEST_PATH, bank_path, *(f"{DATA_ROOT}/fr-en/L{level}.json" for level in range(1, 11))]:
        projected["fingerprints"][path] = sha(git_bytes(root, BASE, path))
    return projected, summary


def _validate_manifest(pack, ledger, before, actual, expected, levels, summary):
    operations = []
    modified = set()
    for op in ledger["ops"]:
        to_level = op.get("toLevel", op["fromLevel"])
        to_theme = op["toTheme"] if op["op"] == "move" else op["fromTheme"] if op["op"] == "keep" else None
        operations.append({"id": op["id"], "op": op["op"], "fromLevel": op["fromLevel"], "fromTheme": op["fromTheme"],
                           "toLevel": to_level, "toTheme": to_theme, "contentType": expected[op["id"]]["contentType"]})
        if op["op"] != "keep":
            modified.add(op["fromTheme"])
            if to_theme is not None:modified.add(to_theme)
    modified.update(NEW_THEMES)
    pruned, retargeted, supports, changes, rebuilt, lexical = [], [], [], [], [], []
    original_themes = {t["id"]: t for level in range(1, 11)
                       for t in before[f"{DATA_ROOT}/fr-en/L{level}.json"]["themes"]}
    for level in range(1, 11):
        current = {t["id"]: t for t in levels[level]["cell"]["themes"]}
        for old in before[f"{DATA_ROOT}/fr-en/L{level}.json"]["themes"]:
            final_refs = {row["id"]: row for row in current.get(old["id"], {}).get("reviewReferences", [])}
            for ref in old["reviewReferences"]:
                identifier = ref["id"]
                final = expected[identifier]
                if identifier not in final_refs:
                    reason = ("reserved" if final["placement"]["themeId"] is None
                              else "future-or-same-level" if final["editorialLevel"] >= level
                              else "different-family" if final["placement"]["domain"] != old["domain"]
                              else "different-type" if final["contentType"] != old["contentType"] else None)
                    require(reason is not None, "an eligible source review disappeared")
                    pruned.append({"themeId": old["id"], "id": identifier, "reason": reason})
                    modified.add(old["id"])
                elif final_refs[identifier] != ref:
                    retargeted.append({"themeId": old["id"], "id": identifier, "before": ref, "after": final_refs[identifier]})
                    modified.add(old["id"])
            if old["id"] in current:
                for field in ("contextReferences", "lexicalSupports"):
                    new_rows = {row["id"]: row for row in current[old["id"]].get(field, [])}
                    for row in old.get(field, []):
                        if new_rows[row["id"]] != row:
                            supports.append({"themeId": old["id"], "field": field, "id": row["id"],
                                             "before": row, "after": new_rows[row["id"]]})
        for theme in levels[level]["cell"]["themes"]:
            old = original_themes.get(theme["id"])
            if theme["id"] in modified:
                rebuilt.append(theme["id"])
            elif old is not None:
                require(theme["sequences"] == old["sequences"], "an untouched practice sequence changed")
            if old != theme:
                changes.append({"id": theme["id"], "level": level, "title": theme["title"],
                    "beforeNewCount": len(old["phrases"]) if old else 0, "afterNewCount": len(theme["phrases"]),
                    "beforePresentedCount": old["presentedCount"] if old else 0, "afterPresentedCount": theme["presentedCount"],
                    "pedagogicalConceptCount": theme["pedagogicalConceptCount"]})
            wanted = {"vocab-adjectifs": "adjective", "vocab-couleurs": "color", "vocab-adverbes": "adverb"}.get(theme["domain"])
            if wanted:
                lexical.extend({"id": p["id"], "themeId": theme["id"], "level": level,
                                "actual": p.get("lexicalClass"), "expected": wanted}
                               for p in theme["phrases"] if p.get("lexicalClass") != wanted)
    small = [{"id": row["id"], "level": row["level"], "presentedCount": row["presentedCount"],
              "pedagogicalConceptCount": row["conceptCount"],
              "minimum": 3 if row["newTheme"] else min(row["presentedCount"], row["conceptCount"]),
              "reason": "new-theme-approved" if row["newTheme"] else "existing-became-small"}
             for row in summary["smallThemes"]]
    runtime_hashes = {}
    for path in [*(f"{DATA_ROOT}/fr-en/L{level}.json" for level in range(1, 11)), f"{DATA_ROOT}/repertoires/fr-en.json"]:
        computed = sha((json.dumps(actual[path], ensure_ascii=False, separators=(",", ":")) + "\n").encode())
        require(pack["fingerprints"].get(path) == computed, "actual runtime fingerprint differs from parsed classification edition")
        runtime_hashes[path] = computed
    declaration = {"version": 1, "id": ledger["id"], "pair": "fr-en", "registryPath": REGISTRY_PATH,
        "registrySha256": REGISTRY_SHA, "evidenceCommit": EVIDENCE, "baseSnapshotCommit": BASE,
        "counts": ledger["counts"], "operations": operations,
        "reserveIds": [op["id"] for op in ledger["ops"] if op["op"] == "to-reserve"],
        "newThemes": ledger["newThemes"], "renamedThemes": ledger["renameThemes"],
        "mixedThemes": summary["mixedThemes"], "situationExtensions": summary["situationExtensions"],
        "smallThemeExceptions": small, "lexicalClassExceptions": lexical, "retiredThemes": summary["retiredThemes"],
        "visualRegistryPath": VISUAL_PATH, "visualRegistrySha256": VISUAL_SHA,
        "prunedReviewReferences": pruned, "retargetedReviewReferences": retargeted,
        "supportReferenceUpdates": supports, "rebuiltSequenceThemeIds": rebuilt, "themeCountChanges": changes,
        "largeThemeWarningThreshold": 100, "largeThemes": summary["largeThemes"],
        "canonicalPhrasesRetained": 4704, "reservedBefore": 125, "reservedAfter": 162,
        "phoneticAndSourceFieldsChanged": 0, "doesNotMeasureAcquisition": True, "publicationApproved": False,
        "runtimeSha256ByPath": runtime_hashes}
    require(canonical(pack["manifest"]["englishClassification"]) == canonical(declaration),
            "classification descriptor, scope, exceptions, counts or exact runtime fingerprints changed")
    original_manifest = before[MANIFEST_PATH]
    expected_manifest = copy.deepcopy(original_manifest)
    pair = next(p for p in expected_manifest["pairs"] if p["id"] == "fr-en")
    pair.update(totalPhrases=4542, reservedPhrases=162,
                repertoireSha256=runtime_hashes[f"{DATA_ROOT}/repertoires/fr-en.json"])
    for metadata in pair["levels"]:
        cell = levels[metadata["level"]]["cell"]
        for key in ("totalPhrases", "totalCanonicalPhrases", "reservedPhrases", "counts", "lexicalClassCounts",
                    "heldPhrases", "contextReuseCount", "presentedCount"):
            metadata[key] = copy.deepcopy(cell[key])
        metadata.update(heldThemeCount=0, themeCount=len(cell["themes"]),
                        additionalSituationCount=sum(bool(t.get("isAdditionalSituation")) for t in cell["themes"]))
    expected_manifest["englishClassification"] = declaration
    require(canonical(pack["manifest"]) == canonical(expected_manifest), "manifest changes outside the English classification are undeclared")
    summary["descriptor"] = declaration
    summary["lexicalClassExceptions"] = lexical
    summary["newReferencesPruned"] = len(pruned)
    summary["reviewReferencesRetargeted"] = len(retargeted)
    summary["supportReferencesRetargeted"] = len(supports)
    return declaration


def adversarial_checks(pack):
    """Finite classification attacks, all in memory and with rebound file hashes."""
    def canonical_card(p, predicate=lambda row: True):
        return next(row for number in range(1, 11) for theme in p["cells"][("fr-en", number)]["themes"]
                    for row in theme["phrases"] if predicate(row))
    def reserved_card(p):
        return next(row for number in range(1, 11) for row in p["cells"][("fr-en", number)]["reserve"]
                    if row.get("englishClassification", {}).get("operation") == "to-reserve")
    def theme(p, predicate=lambda row: True):
        return next(t for number in range(1, 11) for t in p["cells"][("fr-en", number)]["themes"] if predicate(t))
    def step(p, predicate=lambda row: True):
        return next(s for number in range(1, 11) for t in p["cells"][("fr-en", number)]["themes"]
                    for q in t["sequences"] for s in q["steps"] if predicate(s))
    def descriptor(p):return p["manifest"]["englishClassification"]
    def changed_field(field, value):
        return lambda p: canonical_card(p, lambda r: "englishClassification" in r).__setitem__(field, value)
    def delete_reserved(p):
        card = reserved_card(p)
        p["cells"][("fr-en", card["editorialLevel"])]["reserve"].remove(card)
    def duplicate_card(p):theme(p)["phrases"].append(copy.deepcopy(canonical_card(p)))
    def activate_reserve(p):theme(p)["phrases"].append(copy.deepcopy(reserved_card(p)))
    def stale_copy(p):p["repertoires"]["fr-en"]["phrases"][0]["canonicalLocation"]["level"] = 10
    def heard_pointer(p):
        next(r for r in p["repertoires"]["fr-en"]["receivedModels"] if r["id"] == "catalogue:en:748")["canonicalReserveLocation"]["level"] = 2
    def heard_deleted(p):
        p["repertoires"]["fr-en"]["receivedModels"] = [r for r in p["repertoires"]["fr-en"]["receivedModels"] if r["id"] != "catalogue:en:748"]
    def future_review(p):
        target = theme(p, lambda t: t["id"] == "L2-vocab-travail")
        target["reviewReferences"].append({"id": "catalogue:en:3045", "firstEditorialLevel": 9,
            "canonicalThemeId": "L9-telephone", "reason": "forged future review"})
    def stale_support(p):
        next(r for number in range(1, 11) for t in p["cells"][("fr-en", number)]["themes"]
             for r in t.get("lexicalSupports", []) if r["id"] == "catalogue:en:3231")["canonicalThemeId"] = "wrong-support-theme"
    def source_lv(p):canonical_card(p)["source"]["sourceLevel"] = 10
    def prior_annotation(p):
        card = canonical_card(p, lambda r: "lot7PhoneticCorrection" in r)
        card.pop("lot7PhoneticCorrection")
    def ledger_rebound(p):
        data = json.loads(p["englishClassificationRegistryRaw"]);data["ops"][0]["toLevel"] = 10
        p["englishClassificationRegistryRaw"] = canonical(data)
        descriptor(p)["registrySha256"] = sha(p["englishClassificationRegistryRaw"])
    def move_pointer(p):canonical_card(p, lambda r: "englishClassification" in r)["placement"]["themeId"] = "unreviewed-theme"
    def new_photo(p):theme(p, lambda t: t["id"] == "L3-sante")["photo"]["column"] = 0
    def photo_bool(p):theme(p, lambda t: t["id"] == "L5-cuisine-recette")["photo"]["column"] = False
    def review_level_bool(p):
        next(r for number in range(1, 11) for t in p["cells"][("fr-en", number)]["themes"]
             for r in t["reviewReferences"] if r["firstEditorialLevel"] == 1)["firstEditorialLevel"] = True
    def new_metadata(p):theme(p, lambda t: t["id"] == "L3-sante")["nativeReviewApproved"] = True
    def new_count(p):theme(p, lambda t: t["id"] == "L3-sante")["presentedCount"] = 30
    def float_count(p):theme(p, lambda t: t["id"] == "L3-sante")["totalPhrases"] = 3.0
    def exception_missing(p):descriptor(p)["smallThemeExceptions"].pop()
    def mixed_missing(p):descriptor(p)["mixedThemes"].pop()
    def lexical_retyped(p):canonical_card(p, lambda r: r.get("lexicalClass") == "other")["lexicalClass"] = "adverb"
    def special_received(p):step(p, lambda s: s["kind"] == "receive")["requiresProduction"] = True
    def recall_pointer(p):step(p, lambda s: s["kind"] == "choose-and-recall")["preparedInSteps"]["understoodInStep"] = "missing-comprehension"
    def extra_step_field(p):step(p, lambda s: s["kind"] == "understand")["nativeApproval"] = True
    def prep_wrong_ancestor(p):
        replacement = canonical_card(p, lambda r: r["editorialLevel"] == 6 and r["contentType"] == "utterance"
                                     and r["id"] not in {"catalogue:en:2442", "catalogue:en:2787"}
                                     and r["source"]["collection"] == "DECKS.en")
        sequence = next(q for t in p["cells"][("fr-en", 6)]["themes"] for q in t["sequences"]
                        if any(s.get("isPreparation") is True for s in q["steps"]))
        previous = sequence["preparationIds"][0]
        sequence["preparationIds"] = [replacement["id"] if identifier == previous else identifier for identifier in sequence["preparationIds"]]
        for s in sequence["steps"]:
            if s.get("isPreparation") is True and s["utterance"] == previous:
                s["utterance"] = replacement["id"]
                s["id"] = f"{sequence['id']}:{sequence['phraseIds'].index(s['prepares'])}:prepare:{replacement['source']['sourceIndex']}:{s['kind']}"
    def reserved_retyped(p):reserved_card(p)["contentType"] = "review"
    def retired_forged(p):descriptor(p)["retiredThemes"][0]["id"] = "L9-saluer"
    def hidden_theme(p):
        cell = p["cells"][("fr-en", 3)];entry = next(t for t in cell["themes"] if t["id"] == "L3-sante")
        cell["themes"].remove(entry);cell["heldThemes"].append(entry)
    def other_pair(p):p["cells"][("fr-ko", 1)]["themes"][0]["phrases"][0]["phon"] += " unapproved"
    def unauthorized_publish(p):p["manifest"]["publicationApproved"] = True
    def arrivals_reordered(p):
        t = theme(p, lambda t: t["id"] == "L3-sante");t["phrases"].reverse()
    cases = [("registry-proof-rebound", ledger_rebound), ("move-wrong-level", changed_field("editorialLevel", 10)),
        ("move-wrong-theme", move_pointer), ("study-changed", changed_field("study", "unapproved study")),
        ("phonetic-changed", changed_field("phon", "unapproved phonetic")),
        ("native-changed", changed_field("native", "unapproved native")), ("reading-invented", changed_field("reading", "new reading")),
        ("source-lv-changed", source_lv), ("prior-phonetic-proof-lost", prior_annotation),
        ("reserved-card-deleted", delete_reserved), ("canonical-card-duplicated", duplicate_card),
        ("reserved-card-activated", activate_reserve), ("transport-pointer-stale", stale_copy),
        ("heard-748-pointer-from-first-heard-level", heard_pointer), ("heard-748-deleted", heard_deleted),
        ("future-review-restored", future_review), ("lexical-support-pointer-stale", stale_support),
        ("new-photo-wrong-crop", new_photo), ("new-theme-invented-approval", new_metadata),
        ("new-photo-integer-replaced-by-boolean", photo_bool), ("review-level-integer-replaced-by-boolean", review_level_bool),
        ("new-theme-counter-inflated", new_count), ("integer-counter-changed-to-float", float_count),
        ("finite-small-exception-missing", exception_missing), ("mixed-exception-omitted", mixed_missing),
        ("source-lexical-class-retyped", lexical_retyped), ("heard-line-produced", special_received),
        ("recall-preparation-pointer-forged", recall_pointer), ("step-invented-metadata", extra_step_field),
        ("local-preparation-unrelated-ancestor", prep_wrong_ancestor), ("reserved-source-retyped", reserved_retyped),
        ("retirement-declaration-forged", retired_forged), ("visible-card-hidden", hidden_theme),
        ("other-language-pair-changed", other_pair), ("publication-approval-invented", unauthorized_publish),
        ("reviewed-arrival-order-reversed", arrivals_reordered)]
    results = []
    for label, mutation in cases:
        candidate = copy.deepcopy(pack)
        mutation(candidate)
        # Rebind superficial fingerprints so rejection concerns semantic scope,
        # provenance and exact before/after contracts, not a trivial stale SHA.
        for path, document in runtime_documents(candidate).items():
            if path == MANIFEST_PATH:continue
            raw = (json.dumps(document, ensure_ascii=False, separators=(",", ":")) + "\n").encode()
            candidate["fingerprints"][path] = sha(raw)
            if path in descriptor(candidate)["runtimeSha256ByPath"]:
                descriptor(candidate)["runtimeSha256ByPath"][path] = sha(raw)
        next(p for p in candidate["manifest"]["pairs"] if p["id"] == "fr-en")["repertoireSha256"] = candidate["fingerprints"][f"{DATA_ROOT}/repertoires/fr-en.json"]
        try:
            validate_and_project(candidate)
        except ClassificationError as error:
            results.append({"fault": label, "rejected": True, "reason": str(error)})
        else:
            raise ClassificationError("Adversarial classification fault was accepted: " + label)
    return results


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--project-runtime", action="store_true")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    try:
        pack = read_minimal_pack(args.root)
        projected, summary = validate_and_project(pack)
        output = {"summary": summary}
        if args.self_test:
            adverse = adversarial_checks(pack)
            output["adversarialFaultsRejected"] = len(adverse)
            output["adversarialChecks"] = adverse
        if args.project_runtime:
            output["documents"] = runtime_documents(projected)
            output["actualDocumentsSha256"] = {p: sha(canonical(d)) for p, d in runtime_documents(pack).items()}
            output["actualRawDocumentSha256"] = {p: pack["fingerprints"][p] for p in runtime_documents(pack)}
        print(json.dumps(output, ensure_ascii=False, separators=(",", ":")))
        return 0
    except (ClassificationError, OSError, KeyError, ValueError, subprocess.CalledProcessError) as exc:
        print(str(exc), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())



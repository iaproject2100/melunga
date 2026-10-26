#!/usr/bin/env python3
"""Independent reader for the seven frozen classification ledgers.

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
EVIDENCE = "342600641c8a621019d0c05d75a481843640e9ed"
REVIEW_ROOT = "docs/niveaux-progressifs/classement-sept-couples"
REGISTRY_PATHS = {pair: REVIEW_ROOT + "/registre/" + pair + ".json" for pair in
    ("fr-en", "fr-es", "fr-it", "fr-zh", "fr-ja", "fr-ko", "zh-fr")}
REGISTRY_SHAS = {
    "fr-en": "dfcde432da30d22ca3375c5544e14fb5f7b6e84db04af9cec8271cf696e984e9",
    "fr-es": "6bb12de6032dc75d68a9d5f4fe1ad37129b01b51870c38e882627856dac63aee",
    "fr-it": "1705666cea584e445b8c2f77548da2728b353e2931789798fb30c2b2896ae754",
    "fr-zh": "c89ec95f6d592cd296b506d8542db90becb6eca8c9569e8096611a53b9317480",
    "fr-ja": "04c62d9afe93415a0eaa28da0c7a721a0bdb0795a2cac6f70e34441a14f6659d",
    "fr-ko": "42c3d363fdf494ba5cb46b5979a3dce645431c82b6d2cdd37e25b08ec958acc6",
    "zh-fr": "fb2123136e462cc72cdcd881b5c86bebd019cab66f182acb5c5320c80a7199f4",
}
VISUAL_PATH = REVIEW_ROOT + "/visuels.json"
VISUAL_SHA = "e2703326a63f8cf7a2b8d49454b3f6e55722a382809672abcaa0063826655f6a"
DATA_ROOT = "melunga_deploy/content/niveaux-progressifs"
PAIRS = ("fr-en", "fr-es", "fr-it", "fr-ja", "fr-ko", "fr-zh", "zh-fr")
MANIFEST_PATH = DATA_ROOT + "/manifest.json"
# Frozen only after independently checking every actual object and derived field.
DESCRIPTOR_SHA = "57d7731c5001d065ce53ced537f782953dcd40dd61846627739adeb1bfd06f20"
MANIFEST_SHA = "d0c785ebd39b1cc5fa14f6445b08c7982dda03255741f61bcf21c991c34c423c"
COMPOSITION_INPUT = "d30c1c97769fa180e2370e6b182535e3886bc70f"
COMPOSITION_MANIFEST_SHA = "8dfc984fd2384deec689b6d59670a0efb128c76ac783fbc602ad985231789b9b"
COMPOSITION_PROOF = REVIEW_ROOT + "/registre/composition-entree.json"
COMPOSITION_PROOF_SHA = "e3a227bfb6a9a927ed64330c3d1c4ccef6df548005dc7f0d1b7d8578d65e5091"
CONVENTION_CHECKER_SHA = "9da06b3f30b2282c445aa6f79eb91b36b05ad85576d66ef8bd457c0082b6ce43"
_COMPOSITION_CACHE = {}

class ClassificationError(ValueError):
    pass


def require(condition, reason):
    if not condition:
        raise ClassificationError("Seven-pair classification: " + reason)


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def document_paths():
    return [f"{DATA_ROOT}/{pair}/L{level}.json" for pair in PAIRS for level in range(1, 11)] + [
        f"{DATA_ROOT}/repertoires/{pair}.json" for pair in PAIRS]


_GIT_CACHE = {}
_BASELINE_CACHE = {}


def git_bytes(root, commit, path):
    key = str(root), commit, path
    if key not in _GIT_CACHE:
        _GIT_CACHE[key] = subprocess.check_output(["git", "show", commit + ":" + path], cwd=root)
    return _GIT_CACHE[key]


def baseline_documents(root):
    # Immutable Git anchors are read-only; expected objects are always copied
    # before construction. Reuse avoids reparsing 78 documents for every fault.
    key=str(root),BASE
    if key not in _BASELINE_CACHE:
        _BASELINE_CACHE[key]={path:json.loads(git_bytes(root,BASE,path)) for path in [*document_paths(),MANIFEST_PATH]}
    return _BASELINE_CACHE[key]


def composition_metadata():
    return {"version": 1, "classificationReferenceCommit": BASE,
        "inputCommit": COMPOSITION_INPUT, "inputManifestSha256": COMPOSITION_MANIFEST_SHA,
        "preservedLayers": [
            {"manifestKey": "uncertainContentCorrections", "registrySha256": "3fa187478a03e1398e7b14fa545c0950bf1ff166789a480745ca689061377130"},
            {"manifestKey": "conventionCorrections", "registrySha256": "3058f970810166d471607251a2544cb7cdb73e50422794a8bbbedbd613b62705"}],
        "expectedBeforeChecksUse": "classification-reference", "routesCurrentWholeObjects": True}


def composition_documents(pack):
    """Independently validate the approved C input, distinct from A's anchors.

    Only immutable Git documents are admitted. The existing independent C
    reader reconstructs B and C from their frozen evidence before those whole
    current objects can be routed by classification. No producer is imported.
    """
    import check_uncertain_content_independent as content
    import check_conventions_independent as conventions
    root = Path(pack["root"])
    checker_path = "tools/maquette-guidee/check_conventions_independent.py"
    require(sha((root / checker_path).read_bytes()) == CONVENTION_CHECKER_SHA,
            "pinned independent convention reader differs")
    pack["fingerprints"][checker_path] = CONVENTION_CHECKER_SHA
    raw_proof = pack.get("allClassificationCompositionRaw", (root / COMPOSITION_PROOF).read_bytes())
    require(sha(raw_proof) == COMPOSITION_PROOF_SHA, "composition input proof differs")
    pack["fingerprints"][COMPOSITION_PROOF] = COMPOSITION_PROOF_SHA
    proof = json.loads(raw_proof)
    require(proof.get("version") == 1 and proof.get("id") == "seven-pair-classification-approved-composition-input"
            and canonical(proof.get("composition")) == canonical(composition_metadata())
            and proof.get("doesNotChangeRawClassificationRegisters") is True,
            "composition contract identity or scope differs")
    require(subprocess.run(["git", "merge-base", "--is-ancestor", COMPOSITION_INPUT, "HEAD"],
            cwd=root, capture_output=True).returncode == 0, "approved composition input is not an ancestor")
    paths = [*document_paths(), MANIFEST_PATH]
    raw = {path: git_bytes(root, COMPOSITION_INPUT, path) for path in paths}
    raw_hashes = {path: sha(value) for path, value in raw.items()}
    require(raw_hashes[MANIFEST_PATH] == COMPOSITION_MANIFEST_SHA
            and proof.get("inputRuntimeSha256ByPath") == raw_hashes,
            "approved C input whole raw hashes differ")
    reference_hashes = {path: sha(git_bytes(root, BASE, path)) for path in paths}
    require(proof.get("referenceRuntimeSha256ByPath") == reference_hashes,
            "classification anchor whole raw hashes differ")
    input_manifest=json.loads(raw[MANIFEST_PATH])
    require(proof.get("preservedLayerDescriptorSha256") == {
        layer["manifestKey"]: sha(canonical(input_manifest[layer["manifestKey"]]))
        for layer in composition_metadata()["preservedLayers"]}, "preserved layer descriptors differ")
    def source_raw(path):
        value = (root / path).read_bytes(); pack["fingerprints"][path] = sha(value)
        return value
    inputs = pack.get("uncertainContentInputs") or content.input_data(root, source_raw)
    convention_inputs = pack.get("conventionInputs") or conventions.input_data(root, source_raw)
    pack["uncertainContentInputs"]=inputs
    pack["conventionInputs"]=convention_inputs
    cache_key = (str(root), sha(canonical({key:sha(value) for key,value in inputs.items()})),
                 sha(canonical({key:sha(value) for key,value in convention_inputs.items()})))
    if cache_key not in _COMPOSITION_CACHE:
        documents = {path: json.loads(value) for path,value in raw.items()}
        original = dict(pack)
        original.update(cells={(pair, level): documents[f"{DATA_ROOT}/{pair}/L{level}.json"]
            for pair in PAIRS for level in range(1,11)},
            repertoires={pair: documents[f"{DATA_ROOT}/repertoires/{pair}.json"] for pair in PAIRS},
            manifest=documents[MANIFEST_PATH], fingerprints={**pack["fingerprints"], **raw_hashes},
            uncertainContentInputs=inputs, conventionInputs=convention_inputs)
        validated = conventions.validate(original)
        require(validated["runtimeObjects"] == 2167 and len(validated["selected"]) == 2100,
                "approved convention input scope differs")
        _COMPOSITION_CACHE[cache_key] = (documents, raw_hashes)
    return _COMPOSITION_CACHE[cache_key]


def at(document, location):
    for part in location:
        document = document[part]
    return document


def index_canonical(documents, pair):
    result = {}
    for level in range(1, 11):
        path = f"{DATA_ROOT}/{pair}/L{level}.json"
        cell = documents[path]
        require(cell["pairId"] == pair and cell["level"] == level, "Pair cell identity changed")
        for field in ("themes", "heldThemes"):
            for ti, theme in enumerate(cell.get(field, [])):
                for pi, phrase in enumerate(theme["phrases"]):
                    require(phrase["id"] not in result, "canonical identity duplicated")
                    result[phrase["id"]] = (level, theme["id"], path, [field, ti, "phrases", pi], phrase)
        for pi, phrase in enumerate(cell["reserve"]):
            require(phrase["id"] not in result, "canonical identity duplicated in reserve")
            result[phrase["id"]] = (level, None, path, ["reserve", pi], phrase)
    return result


def concept_key(phrase):
    concept = phrase.get("lexicalConceptId")
    if concept:
        return "leger" if concept in {"leger", "léger", "le\u0301ger"} else concept
    return sha(canonical([phrase["study"], phrase["native"]]))


def _counts(phrases):
    return {kind: sum(p["contentType"] == kind for p in phrases)
            for kind in ("utterance", "vocabulary", "number", "incomplete", "review")}


def _lexical_counts(phrases):
    return dict(sorted(Counter(p["lexicalClass"] for p in phrases if p["contentType"] == "vocabulary").items()))


def _theme_metrics(documents, pair):
    totals = Counter()
    for level in range(1, 11):
        cell = documents[f"{DATA_ROOT}/{pair}/L{level}.json"]
        totals["activePhrases"] += sum(len(t["phrases"]) for t in cell["themes"])
        totals["reservedPhrasesRetainedWithoutSteps"] += len(cell["reserve"])
        totals["visibleThemes"] += len(cell["themes"])
        for theme in cell["themes"]:
            totals["reviewPresentationReferences"] += len(theme.get("reviewReferences", []))
            totals["contextPresentationReferences"] += len(theme.get("contextReferences", []))
            totals["visibleThemeConceptsIncludingReviews"] += theme["pedagogicalConceptCount"]
            totals["lexicalSupportUses"] += len(theme.get("lexicalSupports", []))
            if theme.get("isAdditionalSituation"):totals["additionalSituationPresentedPositions"] += theme["presentedCount"]
            for sequence in theme["sequences"]:
                totals["localPreparationReferences"] += len(sequence.get("preparationIds", []))
                for step in sequence["steps"]:
                    totals["stepsChecked"] += 1
                    totals["situationSteps" if step["contentType"] == "utterance" else "lexicalSteps"] += 1
                    if step.get("isPreparation") is True:
                        totals["localPreparationSteps"] += 1
    return totals


def read_registries(root, overrides=None):
    result = {}
    for pair in PAIRS:
        path = REGISTRY_PATHS[pair]
        raw = overrides[pair] if overrides is not None else (root / path).read_bytes()
        source = f"docs/revue-integrale/classement-{pair}/registre-classement.json"
        require(sha(raw) == REGISTRY_SHAS[pair] and raw == git_bytes(root, EVIDENCE, source),
                "frozen whole registry differs: " + pair)
        ledger = json.loads(raw)
        require(ledger["pair"] == pair and ledger["id"] == "tri-themes-claude-" + pair
                and ledger["baseSnapshotCommit"] == BASE, "registry identity differs: " + pair)
        ops = ledger["ops"]
        require(len(ops) == len({op["id"] for op in ops}) == ledger["counts"]["cards"],
                "registry repeats or omits an operation")
        require(Counter(op["op"] for op in ops) == {k: ledger["counts"].get(k, 0) for k in ("move", "to-reserve", "keep")},
                "source operation counts differ")
        result[pair] = ledger
    require(sum(len(r["ops"]) for r in result.values()) == 2906
            and sum(r["counts"]["move"] for r in result.values()) == 2532
            and sum(r["counts"]["to-reserve"] for r in result.values()) == 318
            and sum(r["counts"]["keep"] for r in result.values()) == 56
            and sum(r["counts"]["levelChanges"] for r in result.values()) == 622
            and sum(len(r["newThemes"]) for r in result.values()) == 9
            and sum(len(r["hideThemes"]) for r in result.values()) == 29,
            "seven-source aggregate scope differs")
    return result


def read_minimal_pack(root):
    root = Path(root).resolve()
    fingerprints = {}
    def raw_read(path):
        value = (root / path).read_bytes(); fingerprints[path] = sha(value)
        return value
    def read(path):
        return json.loads(raw_read(path))
    manifest = read(MANIFEST_PATH)
    documents = {path: read(path) for path in document_paths()}
    raw_read("tools/maquette-guidee/check_all_classification_independent.py")
    return {"root": root, "manifest": manifest,
            "cells": {(pair, level): documents[f"{DATA_ROOT}/{pair}/L{level}.json"]
                      for pair in PAIRS for level in range(1, 11)},
            "repertoires": {pair: documents[f"{DATA_ROOT}/repertoires/{pair}.json"] for pair in PAIRS},
            "fingerprints": fingerprints,
            "allClassificationRegistryRaw": {pair: raw_read(path) for pair, path in REGISTRY_PATHS.items()},
            "allClassificationVisualRaw": raw_read(VISUAL_PATH),
            "allClassificationCompositionRaw": raw_read(COMPOSITION_PROOF)}


def runtime_documents(pack):
    result = {f"{DATA_ROOT}/{pair}/L{level}.json": cell for (pair, level), cell in pack["cells"].items()}
    result.update({f"{DATA_ROOT}/repertoires/{pair}.json": bank for pair, bank in pack["repertoires"].items()})
    result[MANIFEST_PATH] = pack["manifest"]
    return result


def expected_canonicals(pair, ledger, before, anchor_before):
    old = index_canonical(before, pair)
    anchors = index_canonical(anchor_before, pair)
    require(set(old) == set(anchors), "corrected input changed canonical inventory")
    definitions = {(level, theme["id"]): theme for level in range(1, 11)
                   for theme in before[f"{DATA_ROOT}/{pair}/L{level}.json"]["themes"]}
    for row in ledger["newThemes"]:
        definitions[(row["level"], row["id"])] = {"id": row["id"], "title": row["title"],
            "domain": row["id"].split("-", 1)[1], "section": "situations", "contentType": "utterance"}
    ops = {op["id"]: op for op in ledger["ops"]}
    # All before anchors resolve against the same original edition; no operation
    # or hide may alter the evidence used to validate a later operation.
    for op in ledger["ops"]:
        require(op["id"] in anchors, "unknown source operation: " + op["id"])
        level, theme, path, location, original = anchors[op["id"]]
        source_theme = "reserve" if theme is None else theme
        require(op["expectedBefore"] == {"level": level, "theme": source_theme, "path": path,
                "location": location, "study": original["study"]}
                and op["fromLevel"] == level and op["fromTheme"] == source_theme
                and op["study"] == original["study"], "whole before anchor differs: " + op["id"])
        require(at(anchor_before[path], location) == original, "unresolved before object")
    expected, locations = {}, {}
    for identifier, (level, theme, _path, _location, original) in old.items():
        phrase = copy.deepcopy(original); destination = level, theme
        op = ops.get(identifier)
        if op and op["op"] != "keep":
            destination = (op["toLevel"], op["toTheme"]) if op["op"] == "move" else (op.get("toLevel", level), None)
            require(destination[1] is None or destination in definitions, "unknown move destination")
            phrase["editorialLevel"] = destination[0]
            definition = definitions.get(destination)
            phrase["placement"].update(domain=definition["domain"] if definition else "reserve",
                themeId=destination[1], section=definition["section"] if definition else "reserve")
            phrase["classification"] = {"registrySha256": REGISTRY_SHAS[pair], "operation": op["op"],
                "fromLevel": level, "fromTheme": op["fromTheme"], "toLevel": destination[0], "toTheme": destination[1]}
        expected[identifier] = phrase; locations[identifier] = destination
    # Form the complete simultaneous operation result before hiding any theme.
    orders = defaultdict(list)
    for identifier in old:
        if identifier not in ops or ops[identifier]["op"] == "keep" or old[identifier][1] is None:
            orders[locations[identifier]].append(identifier)
    for op in ledger["ops"]:
        if op["op"] != "keep" and old[op["id"]][1] is not None:orders[locations[op["id"]]].append(op["id"])
    hidden_additions, superseded, ignored = [], [], []
    hidden = {(row["level"], row["theme"]): row for row in ledger["hideThemes"]}
    for key, row in hidden.items():
        require(key in definitions, "hidden source theme unknown")
        original_theme = definitions[key]
        require(row["title"] == original_theme["title"] and row["cardsBefore"] == len(original_theme["phrases"]),
                "hidden before theme metadata differs")
        survivors = orders[key][:]
        require(set(survivors) == set(row["remainingToReserve"]), "declared hidden remaining differs from simultaneous operations")
        for identifier in survivors:
            phrase = expected[identifier]
            phrase["editorialLevel"] = key[0]
            phrase["placement"].update(domain="reserve", themeId=None, section="reserve")
            annotation = {"registrySha256": REGISTRY_SHAS[pair], "operation": "hide-theme-to-reserve",
                "fromLevel": key[0], "fromTheme": key[1], "toLevel": key[0], "toTheme": None}
            if identifier in ops:
                annotation["supersededOperation"] = ops[identifier]["op"]
                superseded.append(identifier)
            phrase["classification"] = annotation
            locations[identifier] = key[0], None
            hidden_additions.append(identifier)
            orders[(key[0], None)].append(identifier)
        orders[key] = []
    return old, expected, locations, orders, definitions, hidden_additions, superseded, ignored


def checked_visuals(pack, ledgers=None):
    root = Path(pack["root"])
    ledgers = ledgers or read_registries(root, pack.get("allClassificationRegistryRaw"))
    raw = pack.get("allClassificationVisualRaw")
    if raw is None:raw = (root / VISUAL_PATH).read_bytes()
    require(sha(raw) == VISUAL_SHA, "new visual registry changed")
    document = json.loads(raw)
    require(document["baseSnapshotCommit"] == BASE and document["decisionSourceCommit"] == EVIDENCE,
            "visual edition provenance differs")
    expected = {(pair, row["id"]): row for pair, ledger in ledgers.items() for row in ledger["newThemes"]}
    result, crops = {}, set()
    for row in document["themes"]:
        key = row["pair"], row["themeId"]
        require(key in expected and key not in result and row["level"] == expected[key]["level"]
                and row["title"] == expected[key]["title"] and row["visualId"] == row["themeId"],
                "new visual theme identity differs")
        photo = row["photo"]
        require(set(photo) == {"asset", "column", "row", "columns", "rows"}
                and photo["asset"].startswith("assets/") and ".." not in Path(photo["asset"]).parts,
                "new photo shape or path differs")
        require(all(type(photo[k]) is int for k in ("columns", "rows", "column", "row"))
                and photo["columns"] in {3, 4} and photo["rows"] == 4
                and 0 <= photo["column"] < photo["columns"] and 0 <= photo["row"] < photo["rows"],
                "photo numeric types or crop bounds differ")
        path = "melunga_deploy/" + photo["asset"]
        data = (root / path).read_bytes()
        require(sha(data) == row["assetSha256"] and data == git_bytes(root, BASE, path), "photo source bytes differ")
        crop = row["pair"], photo["asset"], photo["column"], photo["row"]
        require(crop not in crops, "new photos repeat a physical crop")
        crops.add(crop); result[key] = row
    require(set(result) == set(expected), "new photo coverage differs")
    return result


def expected_sequences(pair, level, theme_id, blocks, expected, locations, positions, *, review_ids=(), context_ids=()):
    """Independent deterministic exercise replay, using only checked source facts."""
    result, prepared = [], set()
    review_ids, context_ids = set(review_ids), set(context_ids)
    language = pair.split("-")[1]
    for batch in [block[i:i+5] for block in blocks for i in range(0, len(block), 5)]:
        number = len(result) + 1
        sid = f"{pair}:L{level}:{theme_id}:{number}"
        steps, preparation_ids, recall = [], [], []
        for rank, identifier in enumerate(batch):
            phrase = expected[identifier]
            pending, visiting = [], set()
            def visit(ancestor):
                aid = f"catalogue:{language}:{ancestor}"
                require(aid in expected, "unknown prerequisite source")
                source = expected[aid]
                if (source["contentType"] != "utterance" or locations[aid][1] is None
                    or positions[aid] < positions[identifier] or aid in prepared or locations[aid][0] != level):return
                require(aid not in visiting, "cyclic local preparation")
                visiting.add(aid)
                for parent in source["placement"].get("plannedPrerequisiteIndices", []):visit(parent)
                visiting.remove(aid)
                if aid not in prepared:prepared.add(aid);pending.append(aid)
            if (identifier not in review_ids | context_ids and phrase["contentType"] == "utterance"
                and phrase["source"]["collection"].startswith("DECKS.")):
                for ancestor in phrase["placement"].get("plannedPrerequisiteIndices", []):visit(ancestor)
            prefix = f"{sid}:{rank}"
            for aid in pending:
                preparation_ids.append(aid)
                for kind in ("understand", "imitate"):
                    steps.append({"id": f"{prefix}:prepare:{expected[aid]['source']['sourceIndex']}:{kind}",
                        "kind": kind, "utterance": aid, "wholePhrase": True, "contentType": "utterance",
                        "requiresProduction": kind == "imitate", "isPreparation": True, "prepares": identifier})
            for kind in ("understand", "imitate"):
                if kind == "imitate" and phrase.get("isTemplate"):continue
                steps.append({"id": f"{prefix}:{kind}", "kind": kind, "utterance": identifier,
                    "wholePhrase": phrase["contentType"] == "utterance", "contentType": phrase["contentType"],
                    "requiresProduction": kind == "imitate", "isReview": identifier in review_ids,
                    "isContextReuse": identifier in context_ids})
            if not phrase.get("isTemplate"):
                recall.append({"id": prefix + ":recall", "kind": "choose-and-recall", "utterance": identifier,
                    "wholePhrase": phrase["contentType"] == "utterance", "contentType": phrase["contentType"],
                    "requiresProduction": True,
                    "preparedInSteps": {"understoodInStep": prefix + ":understand", "imitatedInStep": prefix + ":imitate"},
                    "isReview": identifier in review_ids, "isContextReuse": identifier in context_ids})
        result.append({"id": sid, "title": f"第 {number} 组" if pair == "zh-fr" else f"Séquence {number}",
            "phraseIds": batch, "preparationIds": list(dict.fromkeys(preparation_ids)), "steps": steps + recall})
    return result


def validate_pair(pack, pair, ledger, before, actual, visuals, anchor_before):
    old, expected, locations, orders, definitions, hidden_ids, superseded_ids, ignored = expected_canonicals(pair, ledger, before, anchor_before)
    current = index_canonical(actual, pair)
    require(set(current) == set(old), "canonical inventory lost or invented a card: " + pair)
    for identifier, row in current.items():
        require((row[0], row[1]) == locations[identifier], "wrong final destination: " + pair + "/" + identifier)
        require(canonical(row[4]) == canonical(expected[identifier]), "source, tuple, type, prior proof or annotation changed: " + pair + "/" + identifier)
    hidden_keys = {(row["level"], row["theme"]) for row in ledger["hideThemes"]}
    new_themes = {row["id"]: row for row in ledger["newThemes"]}
    renames = {row["id"]: row["newTitle"] for row in ledger["renameThemes"]}
    modified = {theme for op in ledger["ops"] if op["op"] != "keep" for theme in
                (op["fromTheme"], op.get("toTheme")) if theme is not None}
    modified.update(key[1] for key in hidden_keys)
    models, pruned, retargeted, support_updates, aliases, outbound = {}, [], [], [], [], []
    for (level, identifier), definition in definitions.items():
        original = definition if identifier not in new_themes else None
        if original:
            theme = copy.deepcopy(original)
            if identifier in renames:theme["title"] = renames[identifier]
        else:
            theme = {"id": identifier, "domain": definition["domain"], "visualId": identifier,
                "title": definition["title"], "optional": False, "isTemplateCollection": False,
                "contentType": "utterance", "section": "situations", "totalPhrases": 0,
                "phrases": [], "reviewReferences": [], "newCount": 0, "contextReferences": [],
                "reuseCount": 0, "reviewCount": 0, "presentedCount": 0, "pedagogicalConceptCount": 0,
                "densityStatus": "owner-approved-small-theme", "presentationOrder": "earlier-reviews-then-new-primary",
                "sequences": [], "photo": copy.deepcopy(visuals[(pair, identifier)]["photo"])}
        theme["phrases"] = [expected[i] for i in orders[(level, identifier)]]
        primary = {p["id"] for p in theme["phrases"]}
        if original and original.get("isAdditionalSituation"):
            for phrase in original["phrases"]:
                if phrase["id"] in primary:continue
                target = expected[phrase["id"]]
                require(locations[phrase["id"]][1] is not None and target["editorialLevel"] <= level,
                        "original scene core became unavailable")
                row = {"id": phrase["id"], "firstEditorialLevel": target["editorialLevel"],
                    "canonicalThemeId": target["placement"]["themeId"], "intentId": phrase["intentId"],
                    "reason": "Intention initiale conservée par réemploi après reclassement de son canonique."}
                theme["contextReferences"].append(row);outbound.append({"themeId": identifier, **row})
        references = []
        for row in theme["reviewReferences"]:
            source = expected[row["id"]]; source_level, source_theme = locations[row["id"]]
            reason = ("reserved" if source_theme is None else "future-or-same-level" if source_level >= level
                else "different-family" if source["placement"]["domain"] != theme["domain"]
                else "different-type" if source["contentType"] != definition["contentType"] else None)
            if reason:
                pruned.append({"themeId": identifier, "id": row["id"], "reason": reason});modified.add(identifier)
            else:
                updated = copy.deepcopy(row); updated.update(firstEditorialLevel=source_level, canonicalThemeId=source_theme)
                if updated != row:
                    retargeted.append({"themeId": identifier, "id": row["id"], "before": row, "after": updated});modified.add(identifier)
                references.append(updated)
        theme["reviewReferences"] = references
        for field in ("contextReferences", "lexicalSupports"):
            if field not in theme:continue
            rows = []
            for row in theme[field]:
                source_level, source_theme = locations[row["id"]]
                if source_theme is None or source_level > level:
                    require(field != "contextReferences" or not theme.get("isAdditionalSituation"), "original scene context became unavailable")
                    pruned.append({"themeId": identifier, "id": row["id"], "field": field,
                        "reason": "reserved" if source_theme is None else "future"});modified.add(identifier)
                    continue
                updated = copy.deepcopy(row); updated.update(firstEditorialLevel=source_level, canonicalThemeId=source_theme)
                if row != updated:support_updates.append({"themeId": identifier, "field": field, "id": row["id"], "before": row, "after": updated})
                if field == "contextReferences" and row["id"] in primary:
                    require(theme.get("isAdditionalSituation"), "ordinary context unexpectedly aliases a primary")
                    aliases.append({"themeId": identifier, "id": row["id"], "intentId": row["intentId"]})
                rows.append(updated)
            theme[field] = rows
        models[(level, identifier)] = theme
    # Canonical positions are computed before the removal of empty themes, as in
    # the original source ordering contract. Empty slots cannot change relative order.
    positions, allowed_ids = {}, {}
    for level in range(1, 11):
        source_cell = before[f"{DATA_ROOT}/{pair}/L{level}.json"]
        ids = [t["id"] for t in source_cell["themes"]]
        insert_at = next((i for i, t in enumerate(source_cell["themes"]) if t["section"] == "vocabulary"), len(ids))
        ids[insert_at:insert_at] = [r["id"] for r in ledger["newThemes"] if r["level"] == level]
        allowed_ids[level] = ids
        for rank, identifier in enumerate(ids):
            for pi, card_id in enumerate(orders[(level, identifier)]):positions[card_id] = (level, rank, pi)
        for pi, card_id in enumerate(orders[(level, None)]):positions[card_id] = (level, len(ids), pi)
    retired, thin, large, mixed, extensions, typed, lexical, changes, rebuilt = [], [], [], [], [], [], [], [], []
    for level in range(1, 11):
        path = f"{DATA_ROOT}/{pair}/L{level}.json"
        source_cell, cell = before[path], actual[path]
        require(cell.get("heldThemes") == [] and cell.get("heldPhrases") == 0, "classification introduced held content")
        visible = []
        for identifier in allowed_ids[level]:
            theme = models[(level, identifier)]
            definition = definitions[(level, identifier)]
            original = definition if identifier not in new_themes else None
            pids = orders[(level, identifier)]; primary = set(pids)
            refs = theme["reviewReferences"]; contexts = theme["contextReferences"]
            practice_ids = [r["id"] for r in refs + contexts if r["id"] not in primary] + pids
            require(len(practice_ids) == len(set(practice_ids)), "practice reference duplicates an identity")
            if (level, identifier) in hidden_keys or not practice_ids:
                retired.append({**{key: copy.deepcopy(theme[key]) for key in
                    ("id", "title", "domain", "contentType", "section", "visualId", "photo")},
                    "level": level, "reason": "owner-approved-hide-theme" if (level, identifier) in hidden_keys else "no-presented-source-after-classification",
                    "remainingReviewReferenceIds": [r["id"] for r in refs],
                    "remainingContextReferenceIds": [r["id"] for r in contexts]})
                continue
            kinds = sorted({expected[i]["contentType"] for i in practice_ids})
            if len(kinds) > 1 or kinds[0] != theme["contentType"]:
                theme["contentType"] = "mixed"; theme["contentTypes"] = kinds
                mixed.append({"id": identifier, "level": level, "contentTypes": kinds, "phraseIds": pids})
            wanted = {"vocab-adjectifs": "adjective", "vocab-couleurs": "color", "vocab-adverbes": "adverb"}.get(theme["domain"])
            if wanted:lexical.extend({"id": p["id"], "themeId": identifier, "level": level, "actual": p.get("lexicalClass"), "expected": wanted}
                for p in theme["phrases"] if p.get("lexicalClass") != wanted)
            concepts = len({concept_key(expected[i]) for i in practice_ids})
            theme.update(totalPhrases=len(pids), newCount=len(pids), reviewCount=len(refs),
                reuseCount=sum(r["id"] not in primary for r in contexts), presentedCount=len(practice_ids), pedagogicalConceptCount=concepts)
            if len(practice_ids) < 6 or concepts < 6:
                theme["densityStatus"] = "owner-approved-small-theme" if identifier in new_themes else "classification-small-theme-to-enrich"
                minimum = new_themes[identifier]["cards"] if identifier in new_themes else min(len(practice_ids), concepts)
                require(concepts >= minimum and len(practice_ids) >= minimum, "finite small theme falls below its declared minimum")
                thin.append({"id": identifier, "level": level, "presentedCount": len(practice_ids),
                    "pedagogicalConceptCount": concepts, "minimum": minimum,
                    "reason": "new-theme-approved" if identifier in new_themes else "existing-became-small"})
            if len(practice_ids) > 100:large.append({"id": identifier, "level": level, "title": theme["title"], "newCount": len(pids), "presentedCount": len(practice_ids)})
            if identifier in modified or identifier in new_themes:
                if original and theme.get("isAdditionalSituation"):
                    core_ids = {i for sequence in original["sequences"] for i in sequence["phraseIds"]}
                    incoming = [i for i in pids if i not in core_ids]
                    typed_ids = [i for i in incoming if expected[i]["contentType"] != "utterance"]
                    if typed_ids:
                        theme["classificationTypedExtensionIds"] = typed_ids
                        typed.extend({"themeId": identifier, "id": i, "contentType": expected[i]["contentType"],
                            "reason": "approved-classified-typed-tail-after-original-core"} for i in typed_ids)
                    theme["classificationExtensionIds"] = incoming
                    theme["sequences"] = copy.deepcopy(original["sequences"]) + expected_sequences(pair, level,
                        identifier + ":classification-extra", [incoming], expected, locations, positions)
                    theme["existingSourceCount"] = len(practice_ids) - theme.get("authoredCount", 0)
                    extensions.append({"id": identifier, "level": level, "addedIds": incoming})
                else:
                    review_ids = [r["id"] for r in refs]
                    context_ids = [r["id"] for r in contexts if r["id"] not in primary]
                    theme["sequences"] = expected_sequences(pair, level, identifier, [review_ids, context_ids, pids],
                        expected, locations, positions, review_ids=review_ids, context_ids=context_ids)
                rebuilt.append(identifier)
            target = next((t for t in cell["themes"] if t["id"] == identifier), None)
            require(target is not None and canonical(target) == canonical(theme), "theme fields, references, counts or exact steps differ: " + pair + "/" + identifier)
            require(all(type(target[key]) is int for key in ("totalPhrases", "newCount", "reviewCount", "reuseCount", "presentedCount", "pedagogicalConceptCount")), "theme count is not an integer")
            visible.append(theme)
            if original != theme:changes.append({"id": identifier, "level": level, "title": theme["title"],
                "beforeNewCount": len(original["phrases"]) if original else 0, "afterNewCount": len(pids),
                "beforePresentedCount": original["presentedCount"] if original else 0, "afterPresentedCount": len(practice_ids), "pedagogicalConceptCount": concepts})
        expected_cell = copy.deepcopy(source_cell)
        reserve = [expected[i] for i in orders[(level, None)]]
        all_rows = [p for t in visible for p in t["phrases"]] + reserve
        active = sum(len(t["phrases"]) for t in visible)
        expected_cell.update(themes=visible, heldThemes=[], reserve=reserve, totalPhrases=active,
            totalCanonicalPhrases=len(all_rows), counts=_counts(all_rows), lexicalClassCounts=_lexical_counts(all_rows),
            reservedPhrases=len(reserve), heldPhrases=0, visibleCanonicalPhrases=active,
            presentedCount=sum(t["presentedCount"] for t in visible), contextReuseCount=sum(t["reuseCount"] for t in visible))
        expected_cell["classificationEdition"] = {"registrySha256": REGISTRY_SHAS[pair], "pair": pair}
        retired_here = [r for r in retired if r["level"] == level]
        if retired_here:expected_cell["retiredThemes"] = retired_here
        require(canonical(cell) == canonical(expected_cell), "cell inventory, metadata, order or counters differ: " + path)
    bank_path = f"{DATA_ROOT}/repertoires/{pair}.json"
    source_bank, bank = before[bank_path], actual[bank_path]
    expected_bank = copy.deepcopy(source_bank); bank_reserve, received_updates = [], []
    for row in expected_bank["phrases"]:
        identifier = row["id"];row.update(copy.deepcopy(expected[identifier]))
        pointer = {"pairId": pair, "level": locations[identifier][0], "themeId": locations[identifier][1]}
        if locations[identifier][1] is None:
            row.pop("canonicalLocation", None);row["canonicalReserveLocation"] = pointer;bank_reserve.append(identifier)
        else:row["canonicalLocation"] = pointer
    for row in expected_bank["receivedModels"]:
        identifier = row["id"]
        if identifier not in locations:continue
        old_pointer = {k: copy.deepcopy(row[k]) for k in ("canonicalLocation", "canonicalReserveLocation") if k in row}
        pointer = {"pairId": pair, "level": locations[identifier][0], "themeId": locations[identifier][1]}
        if locations[identifier][1] is None:row.pop("canonicalLocation", None);row["canonicalReserveLocation"] = pointer
        elif "canonicalLocation" in row:row["canonicalLocation"] = pointer
        new_pointer = {k: copy.deepcopy(row[k]) for k in ("canonicalLocation", "canonicalReserveLocation") if k in row}
        if old_pointer != new_pointer:received_updates.append({"id": identifier, "before": old_pointer, "after": new_pointer})
    expected_bank["classificationEdition"] = {"registrySha256": REGISTRY_SHAS[pair], "pair": pair}
    require(canonical(bank) == canonical(expected_bank), "transport or received model tuple, pointer, role, count or metadata changed: " + pair)
    runtime_hashes = {}
    for path in [f"{DATA_ROOT}/{pair}/L{level}.json" for level in range(1, 11)] + [bank_path]:
        checksum = sha((json.dumps(actual[path], ensure_ascii=False, separators=(",", ":")) + "\n").encode())
        require(pack["fingerprints"].get(path) == checksum, "actual raw runtime bytes differ from canonical publication encoding")
        runtime_hashes[path] = checksum
    operations = [{"id": op["id"], "op": op["op"], "fromLevel": op["fromLevel"], "fromTheme": op["fromTheme"],
        "toLevel": op.get("toLevel", op["fromLevel"]), "toTheme": op["toTheme"] if op["op"] == "move" else op["fromTheme"] if op["op"] == "keep" else None,
        "contentType": expected[op["id"]]["contentType"]} for op in ledger["ops"]]
    hidden_rows = [{"id": row["theme"], "level": row["level"],
        "additionalReserveIds": [i for i in hidden_ids if expected[i]["classification"]["fromTheme"] == row["theme"]],
        "declaredRemainingToReserve": row["remainingToReserve"]} for row in ledger["hideThemes"]]
    superseded = [{"id": i, "operation": expected[i]["classification"]["supersededOperation"],
        "themeId": expected[i]["classification"]["fromTheme"]} for i in superseded_ids]
    declaration = {"version": 1, "id": ledger["id"], "pair": pair, "registryPath": REGISTRY_PATHS[pair],
        "registrySha256": REGISTRY_SHAS[pair], "evidenceCommit": EVIDENCE, "baseSnapshotCommit": BASE,
        "counts": ledger["counts"], "operations": operations, "reserveIds": [o["id"] for o in ledger["ops"] if o["op"] == "to-reserve"],
        "reserveLevelChanges": [{"id": o["id"], "fromLevel": o["fromLevel"], "toLevel": o["toLevel"]} for o in ledger["ops"] if o["op"] == "to-reserve" and o.get("toLevel", o["fromLevel"]) != o["fromLevel"]],
        "reserveOperationsAlreadyReservedIds": [o["id"] for o in ledger["ops"] if o["op"] == "to-reserve" and old[o["id"]][1] is None],
        "newThemes": ledger["newThemes"], "renamedThemes": ledger["renameThemes"], "hiddenThemes": hidden_rows,
        "hiddenThemeReserveIds": hidden_ids, "hiddenThemeSupersededOperations": superseded, "mixedThemes": mixed,
        "situationExtensions": extensions, "contextPrimaryAliases": aliases, "outboundCoreContextReuses": outbound,
        "typedSituationExtensions": typed, "smallThemeExceptions": thin, "lexicalClassExceptions": lexical, "retiredThemes": retired,
        "visualRegistryPath": VISUAL_PATH, "visualRegistrySha256": VISUAL_SHA,
        "prunedReviewReferences": pruned, "retargetedReviewReferences": retargeted, "supportReferenceUpdates": support_updates,
        "bankReservedReferenceIds": bank_reserve, "receivedPointerUpdates": received_updates,
        "rebuiltSequenceThemeIds": rebuilt, "themeCountChanges": changes, "largeThemeWarningThreshold": 100, "largeThemes": large,
        "canonicalPhrasesRetained": len(old), "reservedBefore": sum(1 for row in old.values() if row[1] is None),
        "reservedAfter": sum(1 for row in locations.values() if row[1] is None), "phoneticAndSourceFieldsChanged": 0,
        "doesNotMeasureAcquisition": True, "publicationApproved": False, "runtimeSha256ByPath": dict(sorted(runtime_hashes.items()))}
    cross_types = [{"id": i, "pair": pair, "level": level, "themeId": tid,
        "sourceContentType": phrase["contentType"], "originalThemeContentType": definitions[(level, tid)]["contentType"]}
        for i, (level, tid, _path, _pointer, phrase) in current.items()
        if tid is not None and phrase["contentType"] != definitions[(level, tid)]["contentType"]]
    return declaration, {"pair": pair, "beforeMetrics": dict(_theme_metrics(before, pair)), "afterMetrics": dict(_theme_metrics(actual, pair)),
        "activeBefore": len(old) - declaration["reservedBefore"], "activeAfter": len(old) - declaration["reservedAfter"],
        "crossTypePlacements": cross_types, "newThemeCounts": [{"id": i, "level": row["level"],
            "canonicalCount": len(orders[(row["level"], i)]), "presentedCount": models[(row["level"], i)]["presentedCount"]} for i, row in new_themes.items()]}

def validate_and_project(pack):
    """Validate the entire actual edition before returning a private historical view."""
    root = Path(pack["root"])
    ledgers = read_registries(root, pack.get("allClassificationRegistryRaw"))
    anchor_before = baseline_documents(root)
    (before, before_raw_hashes), actual = composition_documents(pack), runtime_documents(pack)
    require(set(actual) == set(before), "runtime pack omits or adds a document")
    visuals = checked_visuals(pack, ledgers)
    declarations, audits = [], []
    for pair in PAIRS:
        declaration, audit = validate_pair(pack, pair, ledgers[pair], before, actual, visuals, anchor_before)
        declarations.append(declaration);audits.append(audit)
    totals = dict(sum((Counter(r["counts"]) for r in declarations), Counter()))
    already_reserved = sum(len(r["reserveOperationsAlreadyReservedIds"]) for r in declarations)
    hidden_additions = sum(len(r["hiddenThemeReserveIds"]) for r in declarations)
    actual_new = totals["to-reserve"] - already_reserved + hidden_additions
    require(already_reserved == 7 and hidden_additions == 33 and actual_new == 344,
            "explicit reservations and hiding do not reconcile with the simultaneous source edition")
    declaration = {"version": 1, "id": "classement-sept-couples", "pairIds": list(PAIRS), "evidenceCommit": EVIDENCE,
        "baseSnapshotCommit": BASE, "composition": composition_metadata(), "counts": totals, "pairs": declarations,
        "hiddenThemeAdditionalReserves": hidden_additions,
        "reserveLevelChanges": sum(len(r["reserveLevelChanges"]) for r in declarations),
        "reserveOperationsAlreadyReserved": already_reserved, "actualNewReserves": actual_new,
        "canonicalPhrasesRetained": sum(r["canonicalPhrasesRetained"] for r in declarations),
        "reservedBefore": sum(r["reservedBefore"] for r in declarations),
        "reservedAfter": sum(r["reservedAfter"] for r in declarations),
        "visualRegistryPath": VISUAL_PATH, "visualRegistrySha256": VISUAL_SHA,
        "runtimeSha256ByPath": {p: h for row in declarations for p, h in row["runtimeSha256ByPath"].items()},
        "doesNotMeasureAcquisition": True, "publicationApproved": False}
    require(declaration["canonicalPhrasesRetained"] == 33654 and declaration["reservedBefore"] == 862
            and declaration["reservedAfter"] == 1206, "whole canonical and reserve inventory differs")
    descriptor = pack["manifest"].get("allClassification")
    require(canonical(descriptor) == canonical(declaration), "complete classification descriptor differs from independently reconstructed facts")
    require(sha(canonical(descriptor)) == DESCRIPTOR_SHA, "frozen descriptor hash differs")
    expected_manifest = copy.deepcopy(before[MANIFEST_PATH])
    for pair_metadata in expected_manifest["pairs"]:
        pair = pair_metadata["id"]
        pair_metadata.update(totalPhrases=sum(actual[f"{DATA_ROOT}/{pair}/L{level}.json"]["totalPhrases"] for level in range(1, 11)),
            reservedPhrases=next(r["reservedAfter"] for r in declarations if r["pair"] == pair),
            repertoireSha256=declaration["runtimeSha256ByPath"][f"{DATA_ROOT}/repertoires/{pair}.json"])
        for metadata in pair_metadata["levels"]:
            cell = actual[f"{DATA_ROOT}/{pair}/L{metadata['level']}.json"]
            for key in ("totalPhrases", "totalCanonicalPhrases", "reservedPhrases", "counts", "lexicalClassCounts",
                        "heldPhrases", "contextReuseCount", "presentedCount"):
                metadata[key] = copy.deepcopy(cell[key])
            metadata.update(heldThemeCount=0, themeCount=len(cell["themes"]),
                additionalSituationCount=sum(bool(t.get("isAdditionalSituation")) for t in cell["themes"]))
    expected_manifest["allClassification"] = declaration
    require(canonical(pack["manifest"]) == canonical(expected_manifest), "manifest has an undeclared field, permission, count or identity change")
    expected_manifest_raw = (json.dumps(pack["manifest"], ensure_ascii=False, indent=2) + "\n").encode()
    require(pack["fingerprints"].get(MANIFEST_PATH) == sha(expected_manifest_raw), "actual manifest bytes differ from checked document")
    require(sha(expected_manifest_raw) == MANIFEST_SHA, "frozen actual manifest hash differs")
    late, missing, reserved_gaps = [], [], []
    for pair in PAIRS:
        index = index_canonical(actual, pair)
        language = pair.split("-")[1]
        positions = {i: [row[0], row[3][1] if row[1] is not None else len(actual[row[2]]["themes"]),
            row[3][3] if row[1] is not None else row[3][1], row[1]] for i, row in index.items()}
        prep = {}
        for level in range(1, 11):
            for theme in actual[f"{DATA_ROOT}/{pair}/L{level}.json"]["themes"]:
                for sequence in theme["sequences"]:
                    for step in sequence["steps"]:
                        if step.get("isPreparation"):
                            prep.setdefault((step["prepares"], step["utterance"]), {})[step["kind"]] = step["id"]
        for identifier, row in index.items():
            phrase = row[4]
            for ancestor in phrase["placement"].get("plannedPrerequisiteIndices", []):
                aid = f"catalogue:{language}:{ancestor}"
                require(aid in index, "prerequisite absent from retained catalogue")
                if row[1] is not None and phrase["contentType"] == "utterance" and index[aid][1] is None:
                    reserved_gaps.append({"pair": pair, "sourceIndex": phrase["source"]["sourceIndex"],
                        "prerequisiteSourceIndex": ancestor, "contentType": index[aid][4]["contentType"],
                        "reason": "reserved-canonical-source-not-exercised", "targetId": identifier, "prerequisiteId": aid})
                if positions[aid][:3] < positions[identifier][:3]:continue
                preparation = prep.get((identifier, aid))
                structural = phrase["contentType"] == index[aid][4]["contentType"] == "utterance" and row[1] is not None and index[aid][1] is not None
                if structural and not preparation:missing.append({"pair": pair, "id": identifier, "prerequisiteId": aid})
                late.append({"pair": pair, "sourceIndex": phrase["source"]["sourceIndex"], "prerequisiteSourceIndex": ancestor,
                    "targetPosition": positions[identifier], "prerequisitePosition": positions[aid], "localPreparation": preparation,
                    "targetContentType": phrase["contentType"], "prerequisiteContentType": index[aid][4]["contentType"],
                    "targetCurrentlyReserved": row[1] is None, "prerequisiteCurrentlyReserved": index[aid][1] is None,
                    "doesNotProveAcquisition": True})
    before_metrics, after_metrics = Counter(), Counter()
    for audit in audits:
        before_metrics.update(audit["beforeMetrics"]);after_metrics.update(audit["afterMetrics"])
    operation_ids={(pair,op["id"]) for pair,ledger in ledgers.items() for op in ledger["ops"]}
    content_registry=json.loads((root/"docs/niveaux-progressifs/contenu-tranche/registre-contenu-tranche.json").read_bytes())
    convention_registry=json.loads((root/"docs/niveaux-progressifs/conventions-tranchees/registre/conventions-tranchees.json").read_bytes())
    content_ids={(row["pairId"],row["id"]) for row in content_registry["corrections"]}
    convention_ids={(row["pairId"],row["id"]) for row in convention_registry["corrections"]}
    current_indices={pair:index_canonical(before,pair) for pair in PAIRS}
    composition_counts={"operationContentOverlaps":len(operation_ids&content_ids),
        "operationConventionOverlaps":len(operation_ids&convention_ids),
        "operationContentAndConventionOverlaps":len(operation_ids&content_ids&convention_ids),
        "operationStudyAnchorsDifferentFromCurrentStudy":sum(op["study"]!=current_indices[pair][op["id"]][4]["study"]
            for pair,ledger in ledgers.items() for op in ledger["ops"]),
        "canonicalCorrectedContentIdentitiesPreserved":sum("uncertainContentCorrection" in row[4] for index in current_indices.values() for row in index.values()),
        "canonicalConventionIdentitiesPreserved":sum("conventionCorrection" in row[4] for index in current_indices.values() for row in index.values())}
    require(composition_counts=={"operationContentOverlaps":75,"operationConventionOverlaps":211,
        "operationContentAndConventionOverlaps":6,"operationStudyAnchorsDifferentFromCurrentStudy":23,
        "canonicalCorrectedContentIdentitiesPreserved":626,"canonicalConventionIdentitiesPreserved":2099},
        "approved composition overlap scope differs")
    summary = {**declaration, "descriptor": declaration, "pairAudits": audits, "compositionCounts":composition_counts,
        "beforeMetrics": dict(before_metrics), "afterMetrics": dict(after_metrics),
        "crossTypePlacements": [r for audit in audits for r in audit["crossTypePlacements"]],
        "newThemeCounts": [{"pair": audit["pair"], **r} for audit in audits for r in audit["newThemeCounts"]],
        "latePrerequisites": late, "missingLocalPreparations": missing, "reservedPrerequisiteGaps": reserved_gaps,
        "sourceFieldsPreserved": True, "actualEditionCheckedBeforePrivateHistoricalProjection": True,
        "compositionInputIndependentlyValidated": True, "classificationAnchorsRetainedAtOriginalEdition": True,
        "newThemeVisuals": len(visuals)}
    projected = dict(pack)
    projected["cells"] = {(pair, level): copy.deepcopy(before[f"{DATA_ROOT}/{pair}/L{level}.json"])
        for pair in PAIRS for level in range(1, 11)}
    projected["repertoires"] = {pair: copy.deepcopy(before[f"{DATA_ROOT}/repertoires/{pair}.json"]) for pair in PAIRS}
    projected["manifest"] = copy.deepcopy(before[MANIFEST_PATH])
    projected["fingerprints"] = dict(pack["fingerprints"])
    for path in [*document_paths(), MANIFEST_PATH]:projected["fingerprints"][path] = before_raw_hashes[path]
    return projected, summary


def adversarial_checks(pack):
    """Focused semantic faults; superficial hashes are rebound before validation."""
    def theme(p, pair="fr-en", predicate=lambda t: True):
        return next(t for level in range(1, 11) for t in p["cells"][(pair, level)]["themes"] if predicate(t))
    def card(p, pair="fr-en", predicate=lambda row: True):
        return next(row for level in range(1, 11) for t in p["cells"][(pair, level)]["themes"] for row in t["phrases"] if predicate(row))
    def reserved(p, pair="fr-en", predicate=lambda r: True):
        return next(row for level in range(1, 11) for row in p["cells"][(pair, level)]["reserve"] if predicate(row))
    def step(p, predicate=lambda s: True):
        return next(s for pair in PAIRS for level in range(1, 11) for t in p["cells"][(pair, level)]["themes"] for q in t["sequences"] for s in q["steps"] if predicate(s))
    def descriptor(p):return p["manifest"]["allClassification"]
    def scope_pair(p,pair):return next(r for r in descriptor(p)["pairs"] if r["pair"]==pair)
    def source_lv(p):card(p)["source"]["sourceLevel"] = 10
    def lose_proof(p):card(p,predicate=lambda r:"lot7PhoneticCorrection" in r).pop("lot7PhoneticCorrection")
    def rebound_registry(p):
        row=json.loads(p["allClassificationRegistryRaw"]["fr-es"]);row["ops"][0]["toLevel"]=10
        p["allClassificationRegistryRaw"]["fr-es"]=canonical(row)
        scope_pair(p,"fr-es")["registrySha256"]=sha(p["allClassificationRegistryRaw"]["fr-es"])
    def duplicate(p):theme(p)["phrases"].append(copy.deepcopy(card(p)))
    def activate(p):theme(p)["phrases"].append(copy.deepcopy(reserved(p)))
    def delete_reserved(p):
        row=reserved(p,predicate=lambda r:r.get("classification",{}).get("operation")=="hide-theme-to-reserve")
        p["cells"][("fr-en",row["editorialLevel"])]["reserve"].remove(row)
    def keep_unhidden(p):
        row=reserved(p,"fr-es",lambda r:r["id"]=="catalogue:es:3211")
        row["placement"]["themeId"]="L9-saluer"
    def already_reserved_duplicated(p):
        row=reserved(p,"fr-es",lambda r:r["id"]=="catalogue:es:3484")
        p["cells"][("fr-es",row["editorialLevel"])]["reserve"].append(copy.deepcopy(row))
    def future_review(p):theme(p)["reviewReferences"].append({"id":"catalogue:en:3045","firstEditorialLevel":9,"canonicalThemeId":"L9-telephone","reason":"forged"})
    def new_photo_bool(p):theme(p,predicate=lambda t:t["id"]=="L3-sante")["photo"]["column"]=False
    def float_count(p):theme(p)["totalPhrases"]=float(theme(p)["totalPhrases"])
    def prior_received(p):
        row=next(r for r in p["repertoires"]["fr-en"]["receivedModels"] if r["id"]=="catalogue:en:748")
        row["canonicalReserveLocation"]["level"]=2
    def special_core(p):step(p,lambda s:s["kind"]=="receive")["requiresProduction"]=True
    def typed_source(p):card(p,"fr-it",lambda r:r["id"]=="situation-support-authored:fr-it:piste-ralentir-repeter-support-02")["contentType"]="utterance"
    def received_tuple(p):p["repertoires"]["fr-ko"]["receivedModels"][0]["phon"]+=" forged"
    cases=[("registry-proof-rebound",rebound_registry),("study-changed",lambda p:card(p).__setitem__("study","forged")),
        ("phonetic-changed",lambda p:card(p).__setitem__("phon","forged")),("native-changed",lambda p:card(p).__setitem__("native","forged")),
        ("source-level-changed",source_lv),("prior-phonetic-proof-lost",lose_proof),("canonical-identity-duplicated",duplicate),
        ("reserved-card-activated",activate),("hidden-survivor-deleted",delete_reserved),("hide-superseded-keep-restored",keep_unhidden),
        ("already-reserved-operation-appended-twice",already_reserved_duplicated),("future-review-restored",future_review),
        ("new-photo-boolean-integer",new_photo_bool),("counter-integer-to-float",float_count),
        ("heard-reserved-748-stale-pointer",prior_received),("heard-model-tuple-changed",received_tuple),("received-line-produced",special_core),
        ("new-theme-invented-approval",lambda p:theme(p,predicate=lambda t:t["id"]=="L3-sante").__setitem__("nativeReviewApproved",True)),
        ("finite-small-exception-removed",lambda p:scope_pair(p,"fr-ja")["smallThemeExceptions"].pop()),
        ("mixed-source-declaration-removed",lambda p:scope_pair(p,"fr-it")["mixedThemes"].pop()),
        ("hidden-theme-declaration-removed",lambda p:scope_pair(p,"fr-en")["hiddenThemes"].pop()),
        ("exact-recall-pointer-forged",lambda p:step(p,lambda s:s["kind"]=="choose-and-recall")["preparedInSteps"].__setitem__("understoodInStep","missing")),
        ("exact-step-metadata-invented",lambda p:step(p).__setitem__("approved",True)),
        ("typed-tail-source-retyped",typed_source),
        ("reviewed-arrivals-reordered",lambda p:theme(p,predicate=lambda t:t["id"]=="L3-sante")["phrases"].reverse()),
        ("publication-approval-invented",lambda p:p["manifest"].__setitem__("publicationApproved",True))]
    def corrected_canonical(p, annotation, field=None):
        return next(row[4] for pair in PAIRS for row in index_canonical(runtime_documents(p),pair).values()
            if annotation in row[4] and (field is None or field in row[4][annotation]["beforeFields"])
            and row[4].get("classification"))
    def rollback_content_study(p):
        row=corrected_canonical(p,"uncertainContentCorrection","study")
        row["study"]=row["uncertainContentCorrection"]["beforeFields"]["study"]
    def rollback_convention_phon(p):
        row=corrected_canonical(p,"conventionCorrection","phon")
        row["phon"]=row["conventionCorrection"]["beforeFields"]["phon"]
    def stale_transport(p, annotation, field):
        row=next(card for bank in p["repertoires"].values() for card in bank["phrases"]
            if annotation in card and field in card[annotation]["beforeFields"]
            and card[field] != card[annotation]["beforeFields"][field])
        row[field]=row[annotation]["beforeFields"][field]
    cases += [
        ("composition-content-study-rolled-back-after-routing",rollback_content_study),
        ("composition-convention-phon-rolled-back-after-routing",rollback_convention_phon),
        ("composition-current-content-annotation-lost",lambda p:corrected_canonical(p,"uncertainContentCorrection").pop("uncertainContentCorrection")),
        ("composition-current-convention-annotation-lost",lambda p:corrected_canonical(p,"conventionCorrection").pop("conventionCorrection")),
        ("composition-corrected-content-transport-stale",lambda p:stale_transport(p,"uncertainContentCorrection","native")),
        ("composition-corrected-convention-transport-stale",lambda p:stale_transport(p,"conventionCorrection","phon")),
        ("composition-preserved-content-manifest-lost",lambda p:p["manifest"].pop("uncertainContentCorrections")),
        ("composition-preserved-convention-manifest-lost",lambda p:p["manifest"].pop("conventionCorrections")),
        ("composition-wrong-input-commit",lambda p:descriptor(p)["composition"].__setitem__("inputCommit",BASE)),
        ("composition-input-proof-bytes-changed",lambda p:p.__setitem__("allClassificationCompositionRaw",p["allClassificationCompositionRaw"]+b"\n")),
        ("composition-official-compound-erratum-rolled-back",lambda p:index_canonical(runtime_documents(p),"fr-ko")["catalogue:ko:3090"][4].__setitem__("phon","kko-tchip"))]
    results=[]
    for label, mutation in cases:
        candidate=copy.deepcopy(pack)
        mutation(candidate)
        for path,document in runtime_documents(candidate).items():
            raw=(json.dumps(document,ensure_ascii=False,indent=2 if path==MANIFEST_PATH else None,
                separators=None if path==MANIFEST_PATH else (",",":"))+"\n").encode()
            candidate["fingerprints"][path]=sha(raw)
            if path!=MANIFEST_PATH:
                descriptor(candidate)["runtimeSha256ByPath"][path]=sha(raw)
                pair=path.split("/")[-1].removesuffix(".json") if "/repertoires/" in path else path.split("/")[-2]
                scope_pair(candidate,pair)["runtimeSha256ByPath"][path]=sha(raw)
        for row in candidate["manifest"]["pairs"]:
            row["repertoireSha256"]=candidate["fingerprints"][f"{DATA_ROOT}/repertoires/{row['id']}.json"]
        try:validate_and_project(candidate)
        except ClassificationError as error:results.append({"fault":label,"rejected":True,"reason":str(error)})
        else:raise ClassificationError("Adversarial classification fault accepted: "+label)
    return results


def write_audit(root, summary, adverse=None):
    report={"checker":"independent-no-producer-import","checkerSha256":sha(Path(__file__).read_bytes()),
        "actualManifestSha256":MANIFEST_SHA,"descriptorSha256":DESCRIPTOR_SHA,
        "sourceRegistrySha256ByPair":REGISTRY_SHAS,"visualRegistrySha256":VISUAL_SHA,
        "evidenceCommit":EVIDENCE,"baseSnapshotCommit":BASE,
        "approvedCompositionInputCommit":COMPOSITION_INPUT,"compositionProofSha256":COMPOSITION_PROOF_SHA,
        "independentConventionReaderSha256":CONVENTION_CHECKER_SHA,
        "actualEditionCheckedBeforePrivateHistoricalProjection":True,"summary":summary,
        "adversarialFaultsRejected":len(adverse) if adverse is not None else None,
        "adversarialChecks":adverse,"publicationApproved":False}
    directory=root/REVIEW_ROOT
    directory.mkdir(parents=True,exist_ok=True)
    (directory/"audit-independant.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    rows=["# Audit indépendant du classement des sept couples", "",
        f"Les sept registres proviennent du commit `{EVIDENCE}` et tous les avant de classement sont résolus simultanément dans `{BASE}`. Les objets entiers routés proviennent de l’édition approuvée `{COMPOSITION_INPUT}`, dont les corrections de contenu et conventions sont reconstruites indépendamment avant utilisation.", "",
        "La composition conserve 626 canoniques corrigés par le contenu et 2 099 par les conventions. Parmi les opérations de classement, 75 rencontrent le contenu, 211 les conventions et six les deux ; 23 études diffèrent de leur ancre historique et gardent l’étude actuelle approuvée. La projection privée rend les 78 documents C exacts avant la chaîne C → B → historique.", "",
        f"{summary['canonicalPhrasesRetained']} cartes canoniques sont conservées exactement une fois ; {summary['counts']['cards']} opérations, {summary['counts']['levelChanges']} changements de niveau déclarés, plus 6 niveaux cibles explicites de réserve. Aucun texte, aide, lecture, type, niveau source ni preuve antérieure n’est modifié.", "",
        f"{summary['counts']['to-reserve']} décisions vers la réserve comprennent 7 cartes déjà réservées. Les 29 thèmes masqués ajoutent 33 cartes réservées, dont deux déplacements et deux maintiens supplantés. La réserve augmente de 344 cartes, de {summary['reservedBefore']} à {summary['reservedAfter']}.", "",
        "Les nouvelles photos sont des découpes des atlas existants ; les octets et coordonnées sont vérifiés. Les huit intentions et leurs séquences reçues sont conservées ; les extensions typées sont ajoutées après ce noyau. Une présentation déjà contextuelle garde son alias d’intention et compte une seule fois.","",
        "| Couple | Thème nouveau | Niveau | Cartes | Présentées |","|---|---|---:|---:|---:|"]
    rows += [f"| {r['pair']} | {r['id']} | {r['level']} | {r['canonicalCount']} | {r['presentedCount']} |" for r in summary["newThemeCounts"]]
    rows += ["","Les seuils des petits thèmes sont des exceptions finies calculées sur cette édition ; aucun seuil global n’est abaissé. Les thèmes de plus de 100 présentations restent signalés dans le JSON.","",
        f"{len(summary['missingLocalPreparations'])} lien(s) structurel(s) actif→actif tardif(s) sans préparation locale. Deux cibles actives dépendent encore d’une réserve (ja1730←1292 et zh2944←2207) ; cette vérification ne prouve pas l’acquisition ni la fermeture linguistique de la progression.","",
        "72 thèmes visibles restent sous six concepts avec leurs seuils finis explicites. Le thème fr-es L8-travail contient 188 cartes et 188 présentations, au-dessus du seuil d’alerte de 100.","",
        f"Contre-exemples ciblés rejetés : {len(adverse) if adverse is not None else 'non exécutés dans ce rapport'}. Aucune publication n’est approuvée.",""]
    (directory/"audit-independant.md").write_text("\n".join(rows))
    (directory/"audit-reproduire.md").write_text("# Reproduire le contrôle indépendant\n\n```sh\npython3 -B tools/maquette-guidee/check_all_classification_independent.py --self-test --write-report\npython3 -B tools/maquette-guidee/check_levels_independent.py --require-visuals --strict-editorial --require-no-held --classification-self-test\n```\n\nLe lecteur n’importe aucun producteur. Il contrôle l’édition réelle complète avant de fournir une copie privée de l’édition historique aux contrôles antérieurs. Les tests négatifs restent en mémoire.\n")


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root",type=Path,default=ROOT)
    views=parser.add_mutually_exclusive_group()
    views.add_argument("--project-runtime",action="store_true",help="Verified C whole documents before classification")
    views.add_argument("--project-conventions-runtime",action="store_true",help="Verified B documents before conventions")
    views.add_argument("--project-historical-runtime",action="store_true",help="Verified13f before content/conventions/classification")
    views.add_argument("--project-all-runtimes",action="store_true",help="All three verified stages after current edition validation")
    parser.add_argument("--self-test",action="store_true")
    parser.add_argument("--write-report",action="store_true")
    args=parser.parse_args()
    try:
        pack=read_minimal_pack(args.root)
        projected,summary=validate_and_project(pack)
        adverse=adversarial_checks(pack) if args.self_test else None
        if args.write_report:write_audit(args.root,summary,adverse)
        output={"summary":summary}
        if adverse is not None:output.update(adversarialFaultsRejected=len(adverse),adversarialChecks=adverse)
        if args.project_runtime or args.project_conventions_runtime or args.project_historical_runtime or args.project_all_runtimes:
            stages={"conventions": runtime_documents(projected)}
            if not args.project_runtime:
                import check_conventions_independent as conventions
                import check_uncertain_content_independent as content
                after_convention_projection, convention_validated=conventions.project_runtime(projected)
                stages["content"]=convention_validated["beforeDocuments"]
                require(all(canonical(document) == canonical(json.loads(git_bytes(pack["root"], conventions.CONTENT_DEPENDENCY_COMMIT, path)))
                        for path,document in stages["content"].items()), "private B export differs from complete approved Git documents")
                output["projectionSummaries"]={"conventions": {**conventions.declaration({}), "runtimeObjects":convention_validated["runtimeObjects"]}}
                if args.project_historical_runtime or args.project_all_runtimes:
                    after_content_projection, content_validated=content.project_runtime(after_convention_projection)
                    stages["historical"]=content.export_before_documents(after_content_projection, content_validated)
                    require(all(canonical(document) == canonical(json.loads(git_bytes(pack["root"], BASE, path)))
                            for path,document in stages["historical"].items()), "private historical export differs from complete source Git documents")
                    output["projectionSummaries"]["content"]={**content_validated["declaration"],"runtimeObjects":content_validated["runtimeObjects"],
                        "runtimeProfiles":content_validated["runtimeProfiles"],"runtimeChangedFields":content_validated["runtimeChangedFields"]}
            if args.project_all_runtimes:output["documentsByStage"]=stages
            else:
                stage="conventions" if args.project_runtime else "content" if args.project_conventions_runtime else "historical"
                output["projectionStage"]=stage;output["documents"]=stages[stage]
            output["actualDocumentsSha256"]={p:sha(canonical(d)) for p,d in runtime_documents(pack).items()}
            output["actualRawDocumentSha256"]={p:pack["fingerprints"][p] for p in runtime_documents(pack)}
            for path,checksum in pack["fingerprints"].items():
                require(sha((pack["root"]/path).read_bytes())==checksum,"actual source/runtime changed during projection: "+path)
        print(json.dumps(output,ensure_ascii=False,separators=(",",":")))
        return 0
    except (ClassificationError,OSError,KeyError,ValueError,subprocess.CalledProcessError) as exc:
        print(str(exc),file=sys.stderr);return 1


if __name__=="__main__":raise SystemExit(main())

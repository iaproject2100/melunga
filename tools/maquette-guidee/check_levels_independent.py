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
PHONETIC_REGISTRY = REVIEW_ROOT + "/corrections-phonetiques/revue-claude-lot2.json"
PHONETIC_EVIDENCE_COMMIT = "dfc665bf5574dd99d308c756efc69c571aec62cc"
# These anchors are independent of the producer and of its editable registry.
PHONETIC_EVIDENCE_PINS = {
    "docs/revue-integrale/registre-phonetique.json": ("2833fca404acbac078e03090c864b4dd1a8aaa658ab626563672d20c0db9569c", 736),
    "docs/revue-integrale/registre-tj.json": ("856ccdd4525fdd74706ae16081c28e60bd629b3e83039502df81f824ebca74d0", 38),
}
PHONETIC_STATUSES = {
    "B": "corrected-by-Claude-g-devant-e-i",
    "C": "corrected-by-Claude-les-lei",
    "D": "corrected-by-Claude-tj-vers-dj",
    "B+D": "corrected-by-Claude-tj-vers-dj",
}


class VerificationError(Exception):
    pass


def require(condition, explanation):
    if not condition:
        raise VerificationError(explanation)


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def digest(value):
    return hashlib.sha256(value).hexdigest()


def _private_runtime_copy(pack, changed_paths):
    """Keep a private mutable copy of exactly the documents to be projected.

    The source validators only read runtime cells/banks. The named projection
    paths come from actual matched objects, so a future transport/reclassification
    is copied too. validate_situation_sources writes two derived counters in its
    top-level map; that map and all changed hash/manifest maps are private.
    """
    result = dict(pack)
    result["cells"] = {key: copy.deepcopy(cell) if f"{DATA_ROOT}/{key[0]}/L{key[1]}.json" in changed_paths else cell
                       for key, cell in pack["cells"].items()}
    result["repertoires"] = {pair: copy.deepcopy(bank) if f"{DATA_ROOT}/repertoires/{pair}.json" in changed_paths else bank
                            for pair, bank in pack["repertoires"].items()}
    result["manifest"] = copy.deepcopy(pack["manifest"])
    result["fingerprints"] = dict(pack["fingerprints"])
    if pack.get("situations") is not None:
        result["situations"] = dict(pack["situations"])
    return result


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
    registry_raw = raw(PHONETIC_REGISTRY)
    pack["phoneticRegistryRaw"] = registry_raw
    pack["phoneticRegistry"] = json.loads(registry_raw)
    pack["phoneticEvidenceRaw"] = {}
    for descriptor in pack["phoneticRegistry"].get("evidenceFiles", []):
        relative = descriptor.get("path")
        require(isinstance(relative, str) and relative.startswith(REVIEW_ROOT + "/corrections-phonetiques/")
                and ".." not in Path(relative).parts and (root / relative).resolve().is_relative_to(root.resolve()),
                "Phonetic evidence path escapes its source directory")
        pack["phoneticEvidenceRaw"][relative] = raw(relative)
    lot3_raw = raw(LOT3_REGISTRY)
    pack["reviewedFieldRegistryRaw"] = lot3_raw
    pack["reviewedFieldRegistry"] = json.loads(lot3_raw)
    pack["reviewedFieldEvidenceRaw"] = {}
    for descriptor in pack["reviewedFieldRegistry"].get("evidenceFiles", []):
        relative = descriptor.get("path")
        require(isinstance(relative, str) and relative.startswith(REVIEW_ROOT + "/corrections-phonetiques/lot3/")
                and ".." not in Path(relative).parts and (root / relative).resolve().is_relative_to(root.resolve()),
                "Lot3 evidence path escapes its directory")
        pack["reviewedFieldEvidenceRaw"][relative] = raw(relative)
    for name, config in LOT4_CONFIG.items():
        content = raw(config["registryPath"])
        pack[name + "RegistryRaw"] = content
        pack[name + "Registry"] = json.loads(content)
        pack[name + "EvidenceRaw"] = {}
        for descriptor in pack[name + "Registry"].get("evidenceFiles", []):
            relative = descriptor.get("path")
            require(isinstance(relative, str) and relative.startswith(config["directory"] + "/")
                    and ".." not in Path(relative).parts and (root / relative).resolve().is_relative_to(root.resolve()),
                    "Lot4 evidence path escapes its separate directory")
            pack[name + "EvidenceRaw"][relative] = raw(relative)
    for name, config in LOT5_CONFIG.items():
        content = raw(config["registryPath"])
        pack[name + "RegistryRaw"] = content
        pack[name + "Registry"] = json.loads(content)
        pack[name + "EvidenceRaw"] = {}
        for descriptor in pack[name + "Registry"].get("evidenceFiles", []):
            relative = descriptor.get("path")
            require(isinstance(relative, str) and relative.startswith(config["directory"] + "/")
                    and ".." not in Path(relative).parts and (root / relative).resolve().is_relative_to(root.resolve()),
                    "Lot5 evidence path escapes its separate directory")
            pack[name + "EvidenceRaw"][relative] = raw(relative)
    for name, config in LOT6_CONFIG.items():
        content = raw(config["registryPath"])
        pack[name + "RegistryRaw"] = content
        pack[name + "Registry"] = json.loads(content)
        pack[name + "EvidenceRaw"] = {}
        for descriptor in pack[name + "Registry"].get("evidenceFiles", []):
            relative = descriptor.get("path")
            require(isinstance(relative, str) and relative.startswith(config["directory"] + "/")
                    and ".." not in Path(relative).parts and (root / relative).resolve().is_relative_to(root.resolve()),
                    "Lot6 evidence path escapes its separate directory")
            pack[name + "EvidenceRaw"][relative] = raw(relative)
    for name, config in LOT7_CONFIG.items():
        content = raw(config["registryPath"])
        pack[name + "RegistryRaw"] = content
        pack[name + "Registry"] = json.loads(content)
        pack[name + "EvidenceRaw"] = {}
        for descriptor in pack[name + "Registry"].get("evidenceFiles", []):
            relative = descriptor.get("path")
            require(isinstance(relative, str) and relative.startswith(config["directory"] + "/")
                    and ".." not in Path(relative).parts and (root / relative).resolve().is_relative_to(root.resolve()),
                    "Lot7 evidence path escapes its separate directory")
            pack[name + "EvidenceRaw"][relative] = raw(relative)
    for name, config in LOT8_CONFIG.items():
        content = raw(config["registryPath"])
        pack[name + "RegistryRaw"] = content
        pack[name + "Registry"] = json.loads(content)
        pack[name + "EvidenceRaw"] = {}
        for descriptor in pack[name + "Registry"].get("evidenceFiles", []):
            relative = descriptor.get("path")
            require(isinstance(relative, str) and relative.startswith(config["directory"] + "/")
                    and ".." not in Path(relative).parts and (root / relative).resolve().is_relative_to(root.resolve()),
                    "Lot8 evidence path escapes its separate directory")
            pack[name + "EvidenceRaw"][relative] = raw(relative)
    return pack


def _runtime_objects(pack):
    """Walk concrete runtime objects, including every transport/received bank."""
    def walk(value, location=()):
        if isinstance(value, dict):
            yield location, value
            for key, child in value.items():
                # Scalars never yield a concrete object. Avoid recursing through
                # them; every dict/list path and yielded identity is unchanged.
                if isinstance(child, (dict, list)):
                    yield from walk(child, (*location, key))
        elif isinstance(value, list):
            for index, child in enumerate(value):
                if isinstance(child, (dict, list)):
                    yield from walk(child, (*location, index))
    for (pair, level), cell in pack["cells"].items():
        path = f"{DATA_ROOT}/{pair}/L{level}.json"
        for location, value in walk(cell):
            yield pair, path, location, "canonical", value
    for pair, bank in pack["repertoires"].items():
        path = f"{DATA_ROOT}/repertoires/{pair}.json"
        for location, value in walk(bank):
            profile = "received-model" if location and location[0] == "receivedModels" else "transport-phrase"
            yield pair, path, location, profile, value


def _before_fields(phrase, annotation=None):
    """Only original fields are reconstructed; provenance is NEVER restored."""
    return {
        "study": phrase.get("study"), "native": phrase.get("native"),
        "phon": annotation["beforePhon"] if annotation is not None else phrase.get("phon"),
        "readingPresent": "reading" in phrase, "reading": phrase.get("reading"),
        "source": phrase.get("source"),
        "phoneticReviewStatusPresent": annotation["originalReviewStatusPresent"] if annotation is not None else "phoneticReviewStatus" in phrase,
        "phoneticReviewStatus": annotation["originalReviewStatus"] if annotation is not None else phrase.get("phoneticReviewStatus"),
    }


def _phonetic_declarations(pack):
    registry, raw_registry = pack.get("phoneticRegistry"), pack.get("phoneticRegistryRaw")
    require(isinstance(registry, dict) and isinstance(raw_registry, bytes), "Phonetic correction registry is absent")
    require(json.loads(raw_registry) == registry, "Phonetic correction registry differs from its loaded bytes")
    registry_hash = digest(raw_registry)
    require(pack["fingerprints"].get(PHONETIC_REGISTRY) == registry_hash, "Phonetic registry fingerprint differs")
    require(registry.get("version") == 1 and registry.get("id") == "revue-claude-lot2"
            and registry.get("evidenceCommit") == PHONETIC_EVIDENCE_COMMIT,
            "Unknown phonetic batch or unpinned evidence commit")
    require(registry.get("status") == "audited-correction-batch-not-global-phonetic-approval"
            and registry.get("allowedRules") == ["B", "C", "D"] and registry.get("withdrawnRules") == ["A"],
            "Phonetic batch changes its rule scope or claims global approval")
    require(registry.get("correctionCount") == 772 and registry.get("eventCount") == 774,
            "The pinned batch is exactly 772 identities and 774 correction events")
    files = registry.get("evidenceFiles")
    require(isinstance(files, list) and len(files) == 2, "Expected the two frozen phonetic evidence files")
    evidence, expected_events, evidence_paths = {}, {}, set()
    git_paths = set()
    for descriptor in files:
        path, git_path = descriptor.get("path"), descriptor.get("gitPath")
        require(isinstance(path, str) and isinstance(git_path, str)
                and git_path in PHONETIC_EVIDENCE_PINS and git_path not in git_paths and path not in evidence_paths,
                "Phonetic evidence identity is unknown or duplicated")
        git_paths.add(git_path); evidence_paths.add(path)
        expected_hash, expected_count = PHONETIC_EVIDENCE_PINS[git_path]
        raw = pack.get("phoneticEvidenceRaw", {}).get(path)
        require(isinstance(raw, bytes) and digest(raw) == expected_hash
                and descriptor.get("sha256") == expected_hash and descriptor.get("eventCount") == expected_count
                and pack["fingerprints"].get(path) == expected_hash, "Frozen phonetic evidence fingerprint differs")
        original = subprocess.run(["git", "show", PHONETIC_EVIDENCE_COMMIT + ":" + git_path],
                                  cwd=pack["root"], capture_output=True, check=True).stdout
        require(raw == original, "Phonetic evidence differs from its pinned Git object")
        rows = json.loads(raw).get("corrections")
        require(isinstance(rows, list) and len(rows) == expected_count, "Incomplete frozen correction evidence")
        evidence[path] = rows
        for index, row in enumerate(rows):
            require(row.get("pair") in PAIR_LANGUAGES and row.get("regle") in {"B", "C", "D"},
                    "Frozen correction evidence contains another pair or rule")
            expected_events[(path, index)] = row
    corrections = registry.get("corrections")
    require(isinstance(corrections, list) and len(corrections) == 772, "Missing or additional phonetic declarations")
    lookup, consumed = {}, set()
    expected_ids = {(row["pair"], row["id"]) for row in expected_events.values()}
    before_keys = {"study", "native", "phon", "readingPresent", "reading", "source",
                   "phoneticReviewStatusPresent", "phoneticReviewStatus"}
    for entry in corrections:
        key = (entry.get("pairId"), entry.get("id"))
        require(all(isinstance(value, str) for value in key) and key in expected_ids and key not in lookup,
                "Unknown or duplicated phonetic correction identity")
        require(entry.get("rule") in PHONETIC_STATUSES
                and entry.get("afterReviewStatus") == PHONETIC_STATUSES[entry["rule"]], "Unexpected corrected review status")
        events, occurrences = entry.get("events"), entry.get("occurrences")
        require(isinstance(events, list) and events and isinstance(occurrences, list) and occurrences,
                "Correction lacks its ordered events or original whole-field profiles")
        previous = None
        for event in events:
            event_key = (event.get("evidencePath"), event.get("evidenceIndex"))
            require(type(event_key[1]) is int and event_key in expected_events and event_key not in consumed,
                    "Missing, reused, or unknown phonetic evidence event")
            row = expected_events[event_key]
            require((row["pair"], row["id"]) == key and event.get("rule") == row["regle"]
                    and event.get("beforePhon") == row["avant"] and event.get("afterPhon") == row["apres"],
                    "Correction event is not the exact pinned before/after evidence")
            require(previous is None or event["beforePhon"] == previous, "Broken B-to-D phonetic correction chain")
            previous = event["afterPhon"]; consumed.add(event_key)
        require(entry["rule"] == "+".join(event["rule"] for event in events)
                and entry.get("afterPhon") == previous, "Correction final aid or ordered rules differ from evidence")
        canonical_profiles = 0
        for occurrence in occurrences:
            profile, before = occurrence.get("profile"), occurrence.get("expectedBefore")
            require(profile in {"canonical", "transport-phrase", "received-model"}
                    and isinstance(before, dict) and set(before) == before_keys,
                    "Correction has no exact original whole-field profile")
            require(type(before["readingPresent"]) is bool and type(before["phoneticReviewStatusPresent"]) is bool
                    and (before["readingPresent"] or before["reading"] is None)
                    and (before["phoneticReviewStatusPresent"] or before["phoneticReviewStatus"] is None)
                    and isinstance(before["source"], dict), "Malformed original reading/status/provenance profile")
            require(isinstance(before["source"].get("collection"), str), "Original correction source collection is absent")
            path, location = occurrence.get("path"), occurrence.get("location")
            require(isinstance(path, str) and isinstance(location, list) and location
                    and all(isinstance(token, str) or type(token) is int and token >= 0 for token in location),
                    "Malformed informative correction snapshot location")
            if profile == "canonical":
                require(re.fullmatch(re.escape(DATA_ROOT + "/" + key[0] + "/") + r"L(?:[1-9]|10)\.json", path)
                        and location[0] in {"themes", "heldThemes", "reserve"}, "Correction snapshot has another canonical pair/profile")
            else:
                require(path == f"{DATA_ROOT}/repertoires/{key[0]}.json"
                        and location[0] == ("receivedModels" if profile == "received-model" else "phrases"),
                        "Correction snapshot has another transport pair/profile")
            require(before["phon"] == events[0]["beforePhon"], "Original aid differs from the first frozen event")
            for event in events:
                row = expected_events[(event["evidencePath"], event["evidenceIndex"])]
                require(before["study"] == row["study"] and before["native"] == row["native"],
                        "Correction evidence belongs to another whole study/meaning tuple")
                if "reading" in row:
                    require(before["readingPresent"] and before["reading"] == row["reading"], "Correction evidence reading differs")
            canonical_profiles += profile == "canonical"
        require(canonical_profiles == 1, "Every corrected identity needs one original canonical profile")
        lookup[key] = entry
    require(set(lookup) == expected_ids and consumed == set(expected_events), "Pinned phonetic evidence coverage is incomplete")
    return lookup, registry_hash


def _check_lot2_pack(pack):
    """Validate declared lot2 overlays, then check a private original projection."""
    lookup, registry_hash = _phonetic_declarations(pack)
    require(digest(pack["app"]) == pack["fingerprints"].get("melunga_deploy/app.html")
            and source_decks(pack["app"]) == pack["decks"], "Pinned original catalogue was modified")
    for (pair, identity), entry in lookup.items():
        for occurrence in entry["occurrences"]:
            before = occurrence["expectedBefore"]
            if before["source"]["collection"].startswith("DECKS."):
                study = PAIR_LANGUAGES[pair][1]
                match = re.fullmatch(r"catalogue:" + re.escape(study) + r":(0|[1-9][0-9]*)", identity)
                require(match is not None, "Corrected catalogue identity is inconsistent with its pair")
                index = int(match[1])
                require(index < len(pack["decks"][study]), "Corrected original source index is outside its deck")
                card, mapping = pack["decks"][study][index], field_map(study)
                expected_source = {"collection": "DECKS." + study, "sourceIndex": index,
                                   "sourceLevel": card["lv"], "fieldMap": mapping,
                                   "sourceSha256": digest(canonical(card))}
                require(before["source"] == expected_source, "Correction original source object was changed")
                require(all(before[field] == card.get(mapping[field]) for field in ("study", "native", "phon")),
                        "Correction original whole fields differ from the untouched catalogue")
                has_reading = "reading" in mapping and mapping["reading"] in card
                require(before["readingPresent"] == has_reading
                        and before["reading"] == (card[mapping["reading"]] if has_reading else None),
                        "Correction original reading presence or value differs from catalogue")
                require(before["phoneticReviewStatusPresent"] is False and before["phoneticReviewStatus"] is None,
                        "The pinned catalogue correction batch invents an original review status")
    expected_manifest = {"registryPath": PHONETIC_REGISTRY, "registrySha256": registry_hash,
                         "correctionCount": 772, "eventCount": 774, "evidenceCommit": PHONETIC_EVIDENCE_COMMIT}
    require(pack["manifest"].get("phoneticCorrections") == expected_manifest, "Runtime manifest has absent or forged phonetic declarations")
    # Check actual hashes first; the private projection must never hide a stale real bank hash.
    for pair in pack["manifest"]["pairs"]:
        path = f"{DATA_ROOT}/repertoires/{pair['id']}.json"
        require(pair.get("repertoireSha256") == pack["fingerprints"].get(path), "Actual corrected repertoire hash differs from manifest")
    restorations, seen, canonical_seen, collections = [], Counter(), Counter(), Counter()
    profile_counts = Counter()
    for pair, path, location, profile, phrase in _runtime_objects(pack):
        is_phrase = all(isinstance(phrase.get(k), str) for k in ("id", "study", "native", "phon"))
        annotation = phrase.get("phoneticCorrection")
        key = (pair, phrase.get("id"))
        if not is_phrase:
            require("phoneticCorrection" not in phrase, "Stray phonetic annotation on a non-phrase object")
            continue
        if key not in lookup:
            require("phoneticCorrection" not in phrase, "Undeclared phonetic correction on another identity")
            continue
        entry = lookup[key]
        require(isinstance(annotation, dict) and set(annotation) == {
            "id", "registryPath", "registrySha256", "beforePhon", "originalReviewStatusPresent",
            "originalReviewStatus", "evidenceCommit", "rule"}, "A corrected phrase/copy lacks its exact phonetic declaration")
        matches = [item["expectedBefore"] for item in entry["occurrences"]
                   if (item["profile"] == profile or (profile != "canonical" and item["profile"] == "canonical"))
                   and _before_fields(phrase, annotation) == item["expectedBefore"]]
        require(matches, "Corrected whole fields, original status, or untouched source differs from its before profile")
        before = matches[0]
        expected_annotation = {
            "id": key[1], "registryPath": PHONETIC_REGISTRY, "registrySha256": registry_hash,
            "beforePhon": before["phon"], "originalReviewStatusPresent": before["phoneticReviewStatusPresent"],
            "originalReviewStatus": before["phoneticReviewStatus"], "evidenceCommit": PHONETIC_EVIDENCE_COMMIT,
            "rule": entry["rule"],
        }
        require(annotation == expected_annotation, "Phonetic annotation differs from its exact registry hash/before/rule")
        require(phrase["phon"] == entry["afterPhon"] and phrase.get("phoneticReviewStatus") == entry["afterReviewStatus"],
                "Corrected aid or local review status differs from its authorized after value")
        restorations.append((path, location, before)); seen[key] += 1; profile_counts[profile] += 1
        if profile == "canonical":
            canonical_seen[key] += 1; collections[phrase["source"]["collection"]] += 1
    require(set(seen) == set(lookup) and all(canonical_seen[key] == 1 for key in lookup),
            "A declared phonetic correction is absent or has no unique canonical entry")
    projected = _private_runtime_copy(pack, {path for path, _location, _before in restorations})
    documents = {f"{DATA_ROOT}/{pair}/L{level}.json": cell for (pair, level), cell in projected["cells"].items()}
    documents.update({f"{DATA_ROOT}/repertoires/{pair}.json": bank for pair, bank in projected["repertoires"].items()})
    for path, location, before in restorations:
        phrase = documents[path]
        for token in location:
            phrase = phrase[token]
        phrase["phon"] = before["phon"]
        if before["phoneticReviewStatusPresent"]:
            phrase["phoneticReviewStatus"] = before["phoneticReviewStatus"]
        else:
            phrase.pop("phoneticReviewStatus", None)
        del phrase["phoneticCorrection"]
    for pair in projected["manifest"]["pairs"]:
        path = f"{DATA_ROOT}/repertoires/{pair['id']}.json"
        projected_hash = digest((json.dumps(projected["repertoires"][pair["id"]], ensure_ascii=False, indent=2) + "\n").encode())
        projected["fingerprints"][path] = projected_hash
        pair["repertoireSha256"] = projected_hash
    result = check_original_pack(projected)
    checks = result["checks"]
    catalogue_overrides = sum(count for collection, count in collections.items() if collection.startswith("DECKS."))
    checks.update({
        "phoneticCorrectionIdentities": 772, "phoneticCorrectionEvidenceEvents": 774,
        "phoneticCorrectionRuntimeOccurrences": len(restorations),
        "phoneticCorrectedCanonicalFields": sum(canonical_seen.values()),
        "phoneticCorrectedTransportAndReceivedCopies": len(restorations) - sum(canonical_seen.values()),
        "catalogueVerbatimFields": checks["catalogueFieldsCompared"] - catalogue_overrides,
        "catalogueFieldDifferences": catalogue_overrides, "catalogueUnauthorizedFieldDifferences": 0,
        "nonCatalogueCanonicalPhoneticCorrections": 772 - catalogue_overrides,
        "catalogueOriginalFieldsCheckedViaBeforeProjection": checks["catalogueFieldsCompared"],
        "importedVerbatimFields": checks["importedFieldsCompared"] - collections["conversation"],
        "newEditorialVerbatimFields": checks["newEditorialFieldsCompared"] - collections["editorial-authored"],
        "newSituationVerbatimWholeFields": checks["newSituationWholeFieldsCompared"]
            - sum(collections[name] for name in ("situation-authored", "situation-conversation")),
        "newSupportVerbatimWholeFields": checks["newSupportWholeFieldsCompared"]
            - sum(collections[name] for name in ("situation-support-authored", "situation-support-conversation")),
        "originalSourceProjectionValidated": True, "callerPackMutatedByProjection": False,
        "localPhoneticCorrectionDoesNotApproveWholeNativePronunciation": True,
    })
    result["phoneticCorrections"] = {
        **expected_manifest, "runtimeOccurrences": len(restorations),
        "runtimeProfiles": {name: profile_counts[name] for name in ("canonical", "transport-phrase", "received-model")},
        "correctedCanonicalCollections": dict(collections), "wholeEntryNativeReviewStillPending": True,
        "validation": "exact pinned evidence events and complete before profiles, then private original-source projection",
        "runtimeSourceEquality": "verbatim-except-explicit-phonetic-overlays",
        "actualRuntimeFileSha256": {path: value for path, value in sorted(pack["fingerprints"].items()) if path.startswith(DATA_ROOT + "/")},
        "originalSourceAppSha256": pack["fingerprints"]["melunga_deploy/app.html"],
    }
    return result


LOT3_REGISTRY = REVIEW_ROOT + "/corrections-phonetiques/lot3/revue-claude-lot3.json"
LOT3_BASE_COMMIT = "3df885df8db00f0bdc2a703b92bd17801accabce"
LOT3_EVIDENCE_COMMIT = "d06a62ea36120ffd73b8059645848c13bd4f172d"
LOT2_REGISTRY_SHA256 = "efc075c6bbfbe660e1f62cc83ced4244fa8df8368b8e70ef90c6faf5897acbdc"
LOT3_EVIDENCE_PINS = {
    "docs/revue-integrale/lot3-fr-zh-L3-L10/registre-phonetique.json":
        ("09e470b8fba9004b62bcb9fbc5fe036dbda2d91c68868b178f9ba810a06ea9ba", 90, "phon"),
    "docs/revue-integrale/lot3-fr-zh-L3-L10/registre-lectures.json":
        ("c029d571a59303733d5bfa85fec59b94f0b989eb24a4d3c490a4a9fe50fd4ea8", 5, "reading"),
}
_LOT3_GIT_DOCUMENTS = {}


def _lot3_before_fields(phrase):
    fields = _before_fields(phrase)
    fields.update(phoneticCorrectionPresent="phoneticCorrection" in phrase,
                  phoneticCorrection=phrase.get("phoneticCorrection"))
    return fields


def _git_lot3_document(pack, path):
    key = (str(pack["root"].resolve()), path)
    if key not in _LOT3_GIT_DOCUMENTS:
        raw = subprocess.run(["git", "show", LOT3_BASE_COMMIT + ":" + path],
                             cwd=pack["root"], capture_output=True, check=True).stdout
        _LOT3_GIT_DOCUMENTS[key] = json.loads(raw)
    return _LOT3_GIT_DOCUMENTS[key]


def _lot3_declarations(pack):
    registry, raw_registry = pack.get("reviewedFieldRegistry"), pack.get("reviewedFieldRegistryRaw")
    require(isinstance(registry, dict) and isinstance(raw_registry, bytes)
            and json.loads(raw_registry) == registry, "Lot3 field registry is absent or differs from its bytes")
    checksum = digest(raw_registry)
    require(pack["fingerprints"].get(LOT3_REGISTRY) == checksum, "Lot3 registry fingerprint differs")
    require(registry.get("version") == 1 and registry.get("id") == "revue-claude-lot3"
            and registry.get("status") == "reviewed-frozen-field-events-not-global-native-approval"
            and registry.get("evidenceCommit") == LOT3_EVIDENCE_COMMIT
            and registry.get("baseSnapshotCommit") == LOT3_BASE_COMMIT,
            "Unknown lot3 batch, evidence, baseline, or global approval claim")
    predecessor = {"registryPath": PHONETIC_REGISTRY, "registrySha256": LOT2_REGISTRY_SHA256}
    require(registry.get("appliesAfter") == predecessor
            and digest(pack["phoneticRegistryRaw"]) == LOT2_REGISTRY_SHA256,
            "Lot3 predecessor is not the unchanged lot2 registry")
    require(registry.get("correctionCount") == 91 and registry.get("eventCount") == 95
            and registry.get("phoneticEventCount") == 90 and registry.get("readingEventCount") == 5,
            "Lot3 must declare exactly 91 IDs, 90 phonetic and 5 reading events")
    descriptors = registry.get("evidenceFiles")
    require(isinstance(descriptors, list) and len(descriptors) == 2, "Lot3 evidence file count differs")
    events, used_git_paths, source_rows = {}, set(), {}
    for descriptor in descriptors:
        path, git_path = descriptor.get("path"), descriptor.get("gitPath")
        require(isinstance(path, str) and isinstance(git_path, str) and git_path in LOT3_EVIDENCE_PINS
                and git_path not in used_git_paths, "Lot3 evidence path is unknown or duplicated")
        used_git_paths.add(git_path)
        expected_hash, expected_count, field = LOT3_EVIDENCE_PINS[git_path]
        raw = pack.get("reviewedFieldEvidenceRaw", {}).get(path)
        require(isinstance(raw, bytes) and digest(raw) == expected_hash
                and descriptor == {"path": path, "gitPath": git_path, "sha256": expected_hash,
                                   "eventCount": expected_count, "field": field}
                and pack["fingerprints"].get(path) == expected_hash,
                "Frozen lot3 evidence fingerprint or descriptor differs")
        original = subprocess.run(["git", "show", LOT3_EVIDENCE_COMMIT + ":" + git_path],
                                  cwd=pack["root"], capture_output=True, check=True).stdout
        require(raw == original, "Lot3 evidence differs from its pinned Git object")
        data = json.loads(raw)
        rows = data.get("events")
        require(data.get("baseSnapshotCommit") == LOT3_BASE_COMMIT
                and data.get("eventCount") == expected_count
                and isinstance(rows, list) and len(rows) == expected_count,
                "Lot3 evidence event count or before edition differs")
        for index, row in enumerate(rows):
            key = (row.get("pair"), row.get("id"))
            require(key[0] in PAIR_LANGUAGES and isinstance(key[1], str), "Unknown lot3 pair or ID")
            before_name, after_name = ("beforePhon", "afterPhon") if field == "phon" else ("beforeReading", "afterReading")
            expected = {"before": row[before_name], "after": row[after_name],
                        "evidencePath": path, "evidenceIndex": index}
            if field == "phon":
                expected["rules"] = row["rules"]
            require((key, field) not in events and isinstance(expected["before"], str)
                    and isinstance(expected["after"], str) and expected["after"] != expected["before"],
                    "Lot3 frozen event duplicates an ID/field or lacks an actual correction")
            events[(key, field)] = expected
            source_rows[(key, field)] = row
    corrections = registry.get("corrections")
    require(isinstance(corrections, list) and len(corrections) == 91, "Lot3 correction coverage differs")
    lookup, consumed, locations = {}, set(), set()
    before_keys = {"study", "native", "phon", "readingPresent", "reading", "source",
                   "phoneticReviewStatusPresent", "phoneticReviewStatus", "phoneticCorrectionPresent", "phoneticCorrection"}
    for entry in corrections:
        require(isinstance(entry, dict) and isinstance(entry.get("pairId"), str)
                and isinstance(entry.get("id"), str), "Lot3 pair/identity is not a string")
        key = (entry.get("pairId"), entry.get("id"))
        fields, occurrences = entry.get("fields"), entry.get("occurrences")
        require(key not in lookup and isinstance(fields, dict) and fields
                and set(fields) <= {"phon", "reading"} and isinstance(occurrences, list) and occurrences,
                "Lot3 identity, fields, or occurrences are malformed")
        expected_fields = {field: value for (event_key, field), value in events.items() if event_key == key}
        require(fields == expected_fields, "Lot3 before/after does not match the exact frozen evidence")
        consumed.update((key, field) for field in fields)
        canonical_count = 0
        for occurrence in occurrences:
            path, location = occurrence.get("path"), occurrence.get("location")
            profile, before = occurrence.get("profile"), occurrence.get("expectedBefore")
            require(profile in {"canonical", "transport-phrase", "received-model"}
                    and isinstance(path, str) and isinstance(location, list) and location
                    and all(type(token) is int and token >= 0 or isinstance(token, str)
                            and token and token not in {"..", "/"} for token in location),
                    "Lot3 informative occurrence path/profile is malformed")
            if profile == "canonical":
                require(re.fullmatch(re.escape(DATA_ROOT + "/" + key[0] + "/") + r"L(?:[1-9]|10)\.json", path)
                        and location[0] in {"themes", "heldThemes", "reserve"}, "Lot3 canonical occurrence belongs to another pair")
                canonical_count += 1
            else:
                require(path == f"{DATA_ROOT}/repertoires/{key[0]}.json"
                        and location[0] == ("receivedModels" if profile == "received-model" else "phrases"),
                        "Lot3 transport/received occurrence belongs to another pair")
            address = (path, tuple(location))
            require(address not in locations, "Lot3 duplicates a runtime occurrence")
            locations.add(address)
            require(isinstance(before, dict) and set(before) == before_keys,
                    "Lot3 lacks its full before source/status/predecessor profile")
            original = _git_lot3_document(pack, path)
            try:
                for token in location:
                    original = original[token]
            except (KeyError, IndexError, TypeError):
                raise VerificationError("Lot3 occurrence does not resolve in its pinned before edition")
            require(original.get("id") == key[1] and _lot3_before_fields(original) == before,
                    "Lot3 original profile or predecessor differs from the pinned 3df885d card")
            for field, event in fields.items():
                row = source_rows[(key, field)]
                require(before[field] == event["before"] and before["study"] == row["study"]
                        and before["native"] == row["native"], "Lot3 event before/study/meaning belongs to another original card")
                if field == "phon":
                    require(before["reading"] == row["reading"], "Lot3 phonetic event has another before Pinyin")
        require(canonical_count in {0, 1} and (canonical_count == 1 or all(
            occurrence["profile"] == "received-model" for occurrence in occurrences)),
            "Lot3 identity has no unique canonical card or explicit received-only profile")
        lookup[key] = entry
    require(consumed == set(events) and len(lookup) == 91, "Lot3 omits frozen correction events")
    expected_manifest = {"registryPath": LOT3_REGISTRY, "registrySha256": checksum,
        "correctionCount": 91, "eventCount": 95, "phoneticEventCount": 90, "readingEventCount": 5,
        "evidenceCommit": LOT3_EVIDENCE_COMMIT, "baseSnapshotCommit": LOT3_BASE_COMMIT,
        "appliesAfter": predecessor}
    require(pack["manifest"].get("reviewedFieldCorrections") == expected_manifest,
            "Runtime manifest has absent or forged lot3 declarations")
    return lookup, checksum, expected_manifest


def _check_lot3_pack(pack):
    """Validate lot3 AFTER, privately restore lot2 AFTER, then original sources."""
    lookup, registry_hash, declaration = _lot3_declarations(pack)
    for pair in pack["manifest"]["pairs"]:
        path = f"{DATA_ROOT}/repertoires/{pair['id']}.json"
        require(pair.get("repertoireSha256") == pack["fingerprints"].get(path),
                "Actual lot3 repertoire fingerprint differs from runtime manifest")
    restorations, seen, profiles, canonical_keys, field_profiles = [], Counter(), Counter(), set(), Counter()
    for pair, path, location, profile, phrase in _runtime_objects(pack):
        key = (pair, phrase.get("id"))
        annotation = phrase.get("reviewedFieldCorrection")
        is_phrase = all(isinstance(phrase.get(field), str) for field in ("id", "study", "native", "phon"))
        if not is_phrase or key not in lookup:
            require("reviewedFieldCorrection" not in phrase, "Stray lot3 correction annotation outside its identity")
            continue
        entry = lookup[key]
        require(isinstance(annotation, dict), "Lot3 corrected card/copy has no field declaration")
        before_fields = {field: event["before"] for field, event in entry["fields"].items()}
        projected_phrase = copy.deepcopy(phrase)
        projected_phrase.update(before_fields)
        projected_phrase.pop("reviewedFieldCorrection", None)
        matches = []
        for occurrence in entry["occurrences"]:
            if occurrence["profile"] != profile and not (profile != "canonical" and occurrence["profile"] == "canonical"):
                continue
            before = occurrence["expectedBefore"]
            if "phon" in entry["fields"]:
                if before["phoneticReviewStatusPresent"]:
                    projected_phrase["phoneticReviewStatus"] = before["phoneticReviewStatus"]
                else:
                    projected_phrase.pop("phoneticReviewStatus", None)
            if _lot3_before_fields(projected_phrase) == before:
                matches.append(before)
        require(matches, "Lot3 before source, whole tuple, or prior B/D declaration was altered")
        before = matches[0]
        expected_annotation = {"id": key[1], "registryPath": LOT3_REGISTRY, "registrySha256": registry_hash,
            "evidenceCommit": LOT3_EVIDENCE_COMMIT, "baseSnapshotCommit": LOT3_BASE_COMMIT,
            "fields": sorted(entry["fields"]), "beforeFields": before_fields,
            "originalPhoneticReviewStatusPresent": before["phoneticReviewStatusPresent"],
            "originalPhoneticReviewStatus": before["phoneticReviewStatus"]}
        require(annotation == expected_annotation, "Lot3 annotation differs from its exact before/profile/registry")
        for field, event in entry["fields"].items():
            require(phrase.get(field) == event["after"], "Lot3 actual after field is not the authorized whole value")
            field_profiles[(profile, field)] += 1
        if "phon" in entry["fields"]:
            status = "corrected-by-Claude-lot3-" + "+".join(entry["fields"]["phon"]["rules"])
            require(phrase.get("phoneticReviewStatus") == status, "Lot3 invents or loses its local phonetic status")
        else:
            require(_lot3_before_fields(phrase)["phoneticReviewStatusPresent"] == before["phoneticReviewStatusPresent"]
                    and phrase.get("phoneticReviewStatus") == before["phoneticReviewStatus"],
                    "Reading-only correction changes the phonetic review status")
        restorations.append((path, location, before, entry["fields"]))
        seen[key] += 1; profiles[profile] += 1
        if profile == "canonical":
            require(key not in canonical_keys, "Lot3 has duplicate canonical identity")
            canonical_keys.add(key)
    require(set(seen) == set(lookup), "A lot3 declared identity has no actual occurrence")
    for key, entry in lookup.items():
        require((key in canonical_keys) == any(o["profile"] == "canonical" for o in entry["occurrences"]),
                "Lot3 canonical/received-only coverage differs")
    projected = _private_runtime_copy(pack, {path for path, _location, _before, _fields in restorations})
    documents = {f"{DATA_ROOT}/{pair}/L{level}.json": cell for (pair, level), cell in projected["cells"].items()}
    documents.update({f"{DATA_ROOT}/repertoires/{pair}.json": bank for pair, bank in projected["repertoires"].items()})
    for path, location, before, fields in restorations:
        phrase = documents[path]
        for token in location:
            phrase = phrase[token]
        for field in fields:
            phrase[field] = before[field]
        if "phon" in fields:
            if before["phoneticReviewStatusPresent"]:
                phrase["phoneticReviewStatus"] = before["phoneticReviewStatus"]
            else:
                phrase.pop("phoneticReviewStatus", None)
        del phrase["reviewedFieldCorrection"]
    projected["manifest"].pop("reviewedFieldCorrections")
    for pair in projected["manifest"]["pairs"]:
        path = f"{DATA_ROOT}/repertoires/{pair['id']}.json"
        checksum = digest((json.dumps(projected["repertoires"][pair["id"]], ensure_ascii=False, indent=2) + "\n").encode())
        projected["fingerprints"][path] = checksum
        pair["repertoireSha256"] = checksum
    result = _check_lot2_pack(projected)
    checks = result["checks"]
    # Count real source-field differences only once, even after B then lot3.
    catalogue_differences, catalogue_fields, changed_canonical_keys = Counter(), set(), set()
    new_canonical_fields, new_non_catalogue_fields = Counter(), Counter()
    lot2_keys = {(entry["pairId"], entry["id"]) for entry in pack["phoneticRegistry"]["corrections"]}
    combined_objects, combined_fields, combined_ids, combined_phonetic_ids = set(), set(), set(), set()
    combined_canonical_ids, combined_canonical_fields = set(), set()
    for pair, path, location, profile, phrase in _runtime_objects(pack):
        if not all(isinstance(phrase.get(field), str) for field in ("id", "study", "native", "phon")):
            continue
        fields = set()
        if "phoneticCorrection" in phrase:
            fields.add("phon")
        if "reviewedFieldCorrection" in phrase:
            fields.update(phrase["reviewedFieldCorrection"]["fields"])
        if fields:
            address, identity = (path, location), (pair, phrase["id"])
            combined_objects.add(address); combined_ids.add(identity)
            combined_fields.update((address, field) for field in fields)
            if "phon" in fields:
                combined_phonetic_ids.add(identity)
            if profile == "canonical":
                combined_canonical_ids.add(identity)
                combined_canonical_fields.update((identity, field) for field in fields)
        if profile != "canonical" or not all(isinstance(phrase.get(field), str) for field in ("id", "study", "native", "phon")):
            continue
        source = phrase.get("source", {})
        collection = source.get("collection", "")
        key = (pair, phrase["id"])
        if collection.startswith("DECKS."):
            language = PAIR_LANGUAGES[pair][1]
            card = pack["decks"][language][source["sourceIndex"]]
            for field, original_field in field_map(language).items():
                if phrase.get(field) != card.get(original_field):
                    catalogue_fields.add((pair, phrase["id"], field)); catalogue_differences[field] += 1
                    changed_canonical_keys.add(key)
        if key in lookup:
            for field in lookup[key]["fields"]:
                if field == "phon" and key in lot2_keys:
                    continue
                new_canonical_fields[(collection, field)] += 1
                if not collection.startswith("DECKS."):
                    new_non_catalogue_fields[collection] += 1
    checks.update({
        "catalogueVerbatimFields": checks["catalogueFieldsCompared"] - len(catalogue_fields),
        "catalogueFieldDifferences": len(catalogue_fields), "cataloguePhoneticFieldDifferences": catalogue_differences["phon"],
        "catalogueReadingFieldDifferences": catalogue_differences["reading"], "catalogueUnauthorizedFieldDifferences": 0,
        "lot3CorrectionIdentities": 91, "lot3FieldEvidenceEvents": 95, "lot3PhoneticEvidenceEvents": 90,
        "lot3ReadingEvidenceEvents": 5, "lot3RuntimeObjects": len(restorations),
        "lot3RuntimeFieldOverrides": sum(field_profiles.values()), "lot3CanonicalObjects": len(canonical_keys),
        "lot3TransportObjects": profiles["transport-phrase"], "lot3ReceivedOnlyObjects": profiles["received-model"],
        "lot3CanonicalPhoneticOverrides": field_profiles[("canonical", "phon")],
        "lot3CanonicalReadingOverrides": field_profiles[("canonical", "reading")],
        "lot3TransportPhoneticOverrides": field_profiles[("transport-phrase", "phon")],
        "lot3ReceivedPhoneticOverrides": field_profiles[("received-model", "phon")],
        "lot3OriginalProfilesCheckedAgainstPinnedGit": True, "readingChangesAreOnlyTheFivePinnedPinyinEvents": True,
        "combinedCorrectedIdentities": len(combined_ids), "combinedCorrectedPhoneticIdentities": len(combined_phonetic_ids),
        "combinedCorrectedCanonicalIdentities": len(combined_canonical_ids),
        "combinedCorrectedRuntimeObjects": len(combined_objects), "combinedCorrectedRuntimeFields": len(combined_fields),
        "combinedCorrectedCanonicalFields": len(combined_canonical_fields),
        "combinedEvidenceEvents": pack["phoneticRegistry"]["eventCount"] + 95,
        "callerPackMutatedByProjection": False,
    })
    checks["importedVerbatimFields"] -= new_non_catalogue_fields["conversation"]
    checks["newEditorialVerbatimFields"] -= new_non_catalogue_fields["editorial-authored"]
    checks["newSituationVerbatimWholeFields"] -= sum(new_non_catalogue_fields[name] for name in ("situation-authored", "situation-conversation"))
    checks["newSupportVerbatimWholeFields"] -= sum(new_non_catalogue_fields[name] for name in ("situation-support-authored", "situation-support-conversation"))
    checks["newReceivedVerbatimWholeFields"] = checks["newReceivedWholeFieldsCompared"] - field_profiles[("received-model", "phon")]
    real_hashes = {path: value for path, value in sorted(pack["fingerprints"].items()) if path.startswith(DATA_ROOT + "/")}
    result["phoneticCorrections"]["actualRuntimeFileSha256"] = real_hashes
    result["reviewedFieldCorrections"] = {**declaration, "runtimeObjects": len(restorations),
        "runtimeFieldOverrides": sum(field_profiles.values()),
        "runtimeProfiles": {name: profiles[name] for name in ("canonical", "transport-phrase", "received-model")},
        "fieldProfiles": {profile: {field: field_profiles[(profile, field)] for field in ("phon", "reading")}
                          for profile in ("canonical", "transport-phrase", "received-model")},
        "validation": "pinned evidence and exact Git 3df885d before profiles; actual after checked before private lot3→lot2→original projection",
        "actualRuntimeFileSha256": real_hashes, "globalNativeApproval": False,
        "sourceStudyMeaningPlacementAndAccessUnchanged": True}
    return result


LOT4_BASE_COMMIT = "606592ccf11886810a6bb9fbabc56728cf5055c9"
LOT4_EVIDENCE_COMMIT = "7631c0fe64170f952e086487462e94c87bfb13e1"
LOT3_CONTENT_COMMIT = "c849bf3d13d4141eae8b34f8cc5d3d43167bec60"
LOT3_REGISTRY_SHA256 = "20ad657496a94a036c8e6aa74088f172ddc8c4ebb7eacb074f2133fa84beb393"
LOT4_CONFIG = {
    "lot4Phonetic": {
        "registryPath": REVIEW_ROOT + "/corrections-phonetiques/lot4/revue-claude-lot4.json",
        "directory": REVIEW_ROOT + "/corrections-phonetiques/lot4",
        "id": "revue-claude-lot4-phonetique", "status": "frozen-whole-events-not-global-native-approval",
        "annotation": "lot4PhoneticCorrection", "manifest": "lot4PhoneticCorrections",
        "counts": (259, 259, 259, 259),
        "pins": {
            "docs/revue-integrale/lot4-zh-fr-L1-L10/registre-phonetique.json":
                (LOT4_EVIDENCE_COMMIT, "15237777a65b287a4008d53167b458dde2e486af27deafb31698e91c99ff5167", "zh-fr"),
        },
    },
    "reviewedContent": {
        "registryPath": REVIEW_ROOT + "/corrections-contenu/lot3-lot4/revue-contenu-lot3-lot4.json",
        "directory": REVIEW_ROOT + "/corrections-contenu/lot3-lot4",
        "id": "revue-contenu-lot3-lot4", "status": "frozen-certain-content-bundles-not-global-native-approval",
        "annotation": "reviewedContentCorrection", "manifest": "reviewedContentCorrections",
        "counts": (35, 35, 40, 39),
        "pins": {
            "docs/revue-integrale/lot3-fr-zh-L3-L10/lot-contenu-gloses.json":
                (LOT3_CONTENT_COMMIT, "b78984789b573c89d1cb0a755cc14a097a331927c3143b38fcbabaf4207a3367", "fr-zh"),
            "docs/revue-integrale/lot4-zh-fr-L1-L10/lot-contenu-gloses.json":
                (LOT4_EVIDENCE_COMMIT, "2a9fb36c77f2749d646faac352fe527d7c9df3d922b1e1c6baccca4d970f2ba6", "zh-fr"),
        },
    },
}
_LOT4_GIT_DOCUMENTS = {}


def _lot4_profile(phrase):
    result = _lot3_before_fields(phrase)
    result.update(reviewedFieldCorrectionPresent="reviewedFieldCorrection" in phrase,
                  reviewedFieldCorrection=phrase.get("reviewedFieldCorrection"),
                  lot4PhoneticCorrectionPresent="lot4PhoneticCorrection" in phrase,
                  lot4PhoneticCorrection=phrase.get("lot4PhoneticCorrection"))
    return result


def _lot4_git_document(pack, path):
    key = str(pack["root"].resolve()), path
    if key not in _LOT4_GIT_DOCUMENTS:
        raw = subprocess.run(["git", "show", LOT4_BASE_COMMIT + ":" + path], cwd=pack["root"],
                             capture_output=True, check=True).stdout
        _LOT4_GIT_DOCUMENTS[key] = json.loads(raw)
    return _LOT4_GIT_DOCUMENTS[key]


def _lot4_at(document, location):
    try:
        for token in location:
            document = document[token]
        require(isinstance(document, dict), "Lot4 occurrence is not a concrete phrase")
        return document
    except (KeyError, IndexError, TypeError):
        raise VerificationError("Lot4 occurrence does not exist in its pinned before edition")


def _lot4_annotation(name, entry, before, checksum, commits):
    config = LOT4_CONFIG[name]
    return {"id": entry["id"], "registryPath": config["registryPath"], "registrySha256": checksum,
        "baseSnapshotCommit": LOT4_BASE_COMMIT, "evidenceCommits": commits,
        "fields": sorted(entry["fields"]),
        "beforeFields": {field: value["before"] for field, value in entry["fields"].items()},
        "originalPhoneticReviewStatusPresent": before["phoneticReviewStatusPresent"],
        "originalPhoneticReviewStatus": before["phoneticReviewStatus"]}


def _lot4_status(name, entry):
    return ("corrected-by-Claude-lot4-" + "+".join(entry["rules"]) if name == "lot4Phonetic"
            else "corrected-by-Claude-content-lot3-lot4")


def _lot4_declarations(pack, name, prior=None):
    """Reconstruct allowed events from separately pinned evidence, not the producer."""
    config = LOT4_CONFIG[name]
    registry, raw_registry = pack.get(name + "Registry"), pack.get(name + "RegistryRaw")
    require(isinstance(registry, dict) and isinstance(raw_registry, bytes)
            and json.loads(raw_registry) == registry, "Lot4 separate registry differs from its loaded bytes")
    checksum = digest(raw_registry)
    require(pack["fingerprints"].get(config["registryPath"]) == checksum,
            "Lot4 separate registry fingerprint differs")
    require(registry.get("version") == 1 and registry.get("id") == config["id"]
            and registry.get("status") == config["status"]
            and registry.get("baseSnapshotCommit") == LOT4_BASE_COMMIT,
            "Unknown lot4 batch, before edition, or global approval claim")
    expected_counts = config["counts"]
    require(tuple(registry.get(field) for field in ("correctionCount", "eventCount", "approvedFieldCount", "changedFieldCount"))
            == expected_counts, "Lot4 correction/event/field counts differ from the accepted finite batch")
    predecessor = ([{"registryPath": LOT3_REGISTRY, "registrySha256": LOT3_REGISTRY_SHA256}]
                   if name == "lot4Phonetic" else [{"registryPath": LOT4_CONFIG["lot4Phonetic"]["registryPath"],
                                                    "registrySha256": prior[1]}])
    require(registry.get("appliesAfter") == predecessor, "Lot4 changes or omits its exact preceding layer")
    if name == "lot4Phonetic":
        require(digest(pack["reviewedFieldRegistryRaw"]) == LOT3_REGISTRY_SHA256,
                "Lot4 predecessor is not the unchanged lot3 registry")
    descriptors = registry.get("evidenceFiles")
    require(isinstance(descriptors, list) and len(descriptors) == len(config["pins"]),
            "Lot4 separate evidence file count differs")
    approved, used_paths, used_git_paths = {}, set(), set()
    for descriptor in descriptors:
        path, git_path = descriptor.get("path"), descriptor.get("gitPath")
        require(isinstance(path, str) and path.startswith(config["directory"] + "/")
                and ".." not in Path(path).parts and path not in used_paths
                and git_path in config["pins"] and git_path not in used_git_paths,
                "Lot4 separate evidence path is unknown, unsafe, or duplicated")
        used_paths.add(path); used_git_paths.add(git_path)
        commit, expected_hash, pair = config["pins"][git_path]
        raw = pack.get(name + "EvidenceRaw", {}).get(path)
        require(isinstance(raw, bytes) and digest(raw) == expected_hash
                and pack["fingerprints"].get(path) == expected_hash
                and descriptor == {"path": path, "gitPath": git_path, "gitCommit": commit, "sha256": expected_hash},
                "Frozen lot4/content evidence fingerprint or descriptor differs")
        original = subprocess.run(["git", "show", commit + ":" + git_path], cwd=pack["root"],
                                  capture_output=True, check=True).stdout
        require(raw == original, "Lot4/content evidence differs from its pinned Git bytes")
        evidence = json.loads(raw)
        if name == "lot4Phonetic":
            require(evidence.get("eventCount") == 259 and evidence.get("baseSnapshotCommit") == LOT4_BASE_COMMIT,
                    "Lot4 phonetic proof has another event count or before edition")
            selected = [("events", index, row) for index, row in enumerate(evidence["events"])]
        else:
            reference = LOT3_BASE_COMMIT if pair == "fr-zh" else LOT4_BASE_COMMIT
            require(evidence.get("reference") == reference,
                    "Content proof refers to another original before edition")
            selected = [("items", index, row) for index, row in enumerate(evidence["items"])
                        if row.get("certainty") == "certain"]
            selected += [("linkedBundles", index, row) for index, row in enumerate(evidence.get("linkedBundles", []))
                         if row.get("certainty") == "certain"]
            require(sum(collection == "items" for collection, _index, _row in selected) == (25 if pair == "fr-zh" else 8)
                    and sum(collection == "linkedBundles" for collection, _index, _row in selected) == 1,
                    "Certain content selection differs from accepted gloses and linked bundles")
        for collection, index, row in selected:
            key = (pair, row.get("id"))
            require(isinstance(key[1], str) and key not in approved, "Lot4 proof duplicates a correction identity")
            event = {"evidencePath": path, "evidenceCollection": collection, "evidenceIndex": index}
            if name == "lot4Phonetic":
                require(row.get("pair") == pair and row.get("priorCorrection") is False,
                        "Lot4 phonetic event has another pair or prior-correction claim")
                fields = {"phon": {"before": row["beforePhon"], "after": row["afterPhon"]}}
                rules, atomic = row["rules"], False
                require(isinstance(rules, list) and rules and set(rules) <= {"S", "L", "T", "G", "A", "X", "R"},
                        "Lot4 phonetic event changes its namespaced rule scope")
            elif collection == "items":
                require(row.get("field") == "native", "Certain simple content event is not a native glose")
                fields = {"native": {"before": row["before"], "after": row["after"]}}
                rules, atomic = [], False
            else:
                require(row.get("applyTogether") is True and isinstance(row.get("before"), dict)
                        and set(row["before"]) == set(row.get("after", {})), "Atomic content bundle loses whole before/after fields")
                fields = {field: {"before": value, "after": row["after"][field]} for field, value in row["before"].items()}
                expected_bundle = {"study", "reading", "phon", "native"} if pair == "fr-zh" else {"study", "phon", "native"}
                require(set(fields) == expected_bundle and key[1] == ("catalogue:zh:1900" if pair == "fr-zh" else "catalogue:fr:757"),
                        "Unapproved or partial linked content bundle")
                rules, atomic = [], True
            require(all(isinstance(value[field], str) for value in fields.values() for field in ("before", "after"))
                    and any(value["before"] != value["after"] for value in fields.values()),
                    "Lot4/content event lacks literal whole string changes")
            approved[key] = {"fields": fields, "events": [event], "rules": rules, "atomicBundle": atomic,
                             "proof": row, "collection": collection}
    require(len(approved) == expected_counts[0], "Lot4/content approved identity selection is incomplete")
    rows, lookup, locations = registry.get("corrections"), {}, set()
    require(isinstance(rows, list) and len(rows) == expected_counts[0], "Lot4/content registry coverage differs")
    before_keys = set(_lot4_profile({}))
    for entry in rows:
        key = entry.get("pairId"), entry.get("id")
        require(key in approved and key not in lookup, "Unknown or duplicate lot4/content correction identity")
        source = approved[key]
        require(entry.get("fields") == source["fields"] and entry.get("events") == source["events"]
                and entry.get("rules") == source["rules"] and entry.get("atomicBundle") is source["atomicBundle"],
                "Lot4/content row changes its exact frozen event or bundle boundaries")
        occurrences = entry.get("occurrences")
        require(isinstance(occurrences, list) and occurrences, "Lot4/content identity has no declared occurrences")
        canonical_count = 0
        for occurrence in occurrences:
            path, location, profile = occurrence.get("path"), occurrence.get("location"), occurrence.get("profile")
            before = occurrence.get("expectedBefore")
            require(profile in {"canonical", "transport-phrase", "received-model"}
                    and isinstance(path, str) and isinstance(location, list) and location
                    and all(type(token) is int and token >= 0 or isinstance(token, str)
                            and token and token not in {"..", "/"} for token in location),
                    "Lot4/content snapshot path or profile is malformed")
            if profile == "canonical":
                require(re.fullmatch(re.escape(DATA_ROOT + "/" + key[0] + "/") + r"L(?:[1-9]|10)\.json", path)
                        and location[0] in {"themes", "heldThemes", "reserve"}, "Lot4/content canonical is in another pair")
                canonical_count += 1
            else:
                require(path == f"{DATA_ROOT}/repertoires/{key[0]}.json"
                        and location[0] == ("receivedModels" if profile == "received-model" else "phrases"),
                        "Lot4/content transport/received snapshot is in another pair")
            address = path, tuple(location)
            require(address not in locations, "Lot4/content duplicates a snapshot occurrence")
            locations.add(address)
            require(isinstance(before, dict) and set(before) == before_keys, "Lot4/content lacks its complete before profile")
            original = copy.deepcopy(_lot4_at(_lot4_git_document(pack, path), location))
            require(original.get("id") == key[1], "Lot4/content snapshot points to another identity")
            # Content is after phonetic lot4. Rebuild that predecessor from its
            # separately verified event, rather than trusting expectedBefore.
            if prior is not None and key in prior[0]:
                prior_entry = prior[0][key]
                pre_before = _lot4_profile(original)
                for field, value in prior_entry["fields"].items():
                    require(original.get(field) == value["before"], "Content predecessor has a false original before")
                    original[field] = value["after"]
                original["phoneticReviewStatus"] = _lot4_status("lot4Phonetic", prior_entry)
                original["lot4PhoneticCorrection"] = _lot4_annotation("lot4Phonetic", prior_entry, pre_before,
                                                                     prior[1], prior[2]["evidenceCommits"])
            require(_lot4_profile(original) == before, "Lot4/content original source or prior annotations differ from pinned 606592c")
            for field, value in entry["fields"].items():
                require(before.get(field) == value["before"], "Lot4/content before field is not its exact predecessor")
            proof = source["proof"]
            if source["collection"] != "linkedBundles":
                require(before["study"] == proof["study"], "Lot4/content evidence belongs to another studied phrase")
                if name == "lot4Phonetic":
                    require(before["native"] == proof["native"], "Lot4 phonetic proof changes the meaning")
        require(canonical_count in {0, 1} and (canonical_count == 1 or all(
            occurrence["profile"] == "received-model" for occurrence in occurrences)),
            "Lot4/content identity has no unique canonical or explicit received-only entry")
        lookup[key] = entry
    require(set(lookup) == set(approved), "Lot4/content omits exact frozen events")
    require(sum(len(entry["fields"]) for entry in rows) == expected_counts[2]
            and sum(value["before"] != value["after"] for entry in rows for value in entry["fields"].values()) == expected_counts[3],
            "Lot4/content approved versus actually changed field counts differ")
    commits = sorted({pin[0] for pin in config["pins"].values()})
    declaration = {"registryPath": config["registryPath"], "registrySha256": checksum,
        "baseSnapshotCommit": LOT4_BASE_COMMIT, "appliesAfter": predecessor,
        "correctionCount": expected_counts[0], "eventCount": expected_counts[1],
        "approvedFieldCount": expected_counts[2], "changedFieldCount": expected_counts[3], "evidenceCommits": commits}
    require(pack["manifest"].get(config["manifest"]) == declaration, "Runtime manifest has absent or forged lot4/content declarations")
    return lookup, checksum, declaration


def _lot4_validate_project(pack, name, data):
    """Validate actual after values and restore this layer in an already private pack."""
    config = LOT4_CONFIG[name]
    lookup, checksum, declaration = data
    seen, profiles, approved_fields, changed_fields, addresses = Counter(), Counter(), Counter(), Counter(), set()
    canonical_keys, profile_seen = set(), Counter()
    for pair, path, location, profile, phrase in _runtime_objects(pack):
        key = pair, phrase.get("id")
        is_phrase = all(isinstance(phrase.get(field), str) for field in ("id", "study", "native", "phon"))
        annotation = phrase.get(config["annotation"])
        if not is_phrase or key not in lookup:
            require(config["annotation"] not in phrase, "Stray lot4/content annotation outside its identity")
            continue
        entry = lookup[key]
        require(isinstance(annotation, dict), "Lot4/content card or copy has no exact declaration")
        original = copy.deepcopy(phrase)
        original.pop(config["annotation"], None)
        original.update({field: value["before"] for field, value in entry["fields"].items()})
        candidates = []
        for occurrence in entry["occurrences"]:
            if occurrence["profile"] != profile and not (profile == "transport-phrase" and occurrence["profile"] == "canonical"):
                continue
            before = occurrence["expectedBefore"]
            if "phon" in entry["fields"] and entry["fields"]["phon"]["before"] != entry["fields"]["phon"]["after"]:
                if before["phoneticReviewStatusPresent"]:
                    original["phoneticReviewStatus"] = before["phoneticReviewStatus"]
                else:
                    original.pop("phoneticReviewStatus", None)
            if _lot4_profile(original) == before:
                candidates.append(before)
        require(candidates, "Lot4/content original tuple, source, or earlier annotation was changed")
        before = candidates[0]
        require(annotation == _lot4_annotation(name, entry, before, checksum, declaration["evidenceCommits"]),
                "Lot4/content annotation differs from exact before/status/registry")
        for field, value in entry["fields"].items():
            require(phrase.get(field) == value["after"], "Lot4/content actual after is not the approved whole value (or bundle is partial)")
            approved_fields[(profile, field)] += 1
            changed_fields[(profile, field)] += int(value["before"] != value["after"])
        phon_changed = "phon" in entry["fields"] and entry["fields"]["phon"]["before"] != entry["fields"]["phon"]["after"]
        if phon_changed:
            require(phrase.get("phoneticReviewStatus") == _lot4_status(name, entry), "Lot4/content local phonetic status is forged")
        else:
            require(("phoneticReviewStatus" in phrase) == before["phoneticReviewStatusPresent"]
                    and phrase.get("phoneticReviewStatus") == before["phoneticReviewStatus"],
                    "Content-only correction changes the phonetic review status")
        if profile == "canonical":
            require(key not in canonical_keys, "Lot4/content duplicates a canonical identity")
            canonical_keys.add(key)
        seen[key] += 1; profiles[profile] += 1; profile_seen[(key, profile)] += 1; addresses.add((path, location))
        # Mutate only the private concrete phrase, after checking every after.
        for field, value in entry["fields"].items():
            phrase[field] = value["before"]
        if phon_changed:
            if before["phoneticReviewStatusPresent"]:
                phrase["phoneticReviewStatus"] = before["phoneticReviewStatus"]
            else:
                phrase.pop("phoneticReviewStatus", None)
        del phrase[config["annotation"]]
    require(set(seen) == set(lookup), "Lot4/content loses a declared identity")
    for key, entry in lookup.items():
        expected_profiles = Counter(occurrence["profile"] for occurrence in entry["occurrences"])
        require((key in canonical_keys) == bool(expected_profiles["canonical"]), "Lot4/content canonical versus heard-only coverage changed")
        for profile in ("canonical", "received-model"):
            expected = expected_profiles[profile]
            # Full old source checks also reject added/removed concrete entries.
            require(profile_seen[(key, profile)] == expected,
                    "Lot4/content original role occurrence missing or duplicated")
        require(profile_seen[(key, "transport-phrase")] >= expected_profiles["transport-phrase"],
                "Lot4/content omits a declared transport copy")
    pack["manifest"].pop(config["manifest"])
    return {**declaration, "runtimeObjects": sum(profiles.values()),
        "runtimeProfiles": {profile: profiles[profile] for profile in ("canonical", "transport-phrase", "received-model")},
        "runtimeApprovedFields": sum(approved_fields.values()), "runtimeChangedFields": sum(changed_fields.values()),
        "canonicalApprovedFields": sum(count for (profile, _field), count in approved_fields.items() if profile == "canonical"),
        "canonicalChangedFields": sum(count for (profile, _field), count in changed_fields.items() if profile == "canonical"),
        "fieldProfiles": {profile: {field: changed_fields[(profile, field)] for field in ("study", "native", "phon", "reading")}
                          for profile in ("canonical", "transport-phrase", "received-model")},
        "atomicBundleIdentities": sorted(entry["id"] for entry in lookup.values() if entry["atomicBundle"]),
        "validation": "pinned complete events and Git606 before profiles; actual after checked before private content→phon4→lot3→lot2→origin projection",
        "globalNativeApproval": False}


def _check_before_lot5_pack(pack):
    """Validate two separately evidenced lot4 batches before prior source checks."""
    phonetic = _lot4_declarations(pack, "lot4Phonetic")
    content = _lot4_declarations(pack, "reviewedContent", phonetic)
    for pair in pack["manifest"]["pairs"]:
        path = f"{DATA_ROOT}/repertoires/{pair['id']}.json"
        require(pair.get("repertoireSha256") == pack["fingerprints"].get(path), "Actual lot4/content bank hash differs from manifest")
    # Keep one common private projection for both new layers. Earlier validators
    # still receive a private pack and retain their own original invariants.
    correction_keys = set(phonetic[0]) | set(content[0])
    changed_paths = {path for pair, path, _location, _profile, phrase in _runtime_objects(pack)
                     if (pair, phrase.get("id")) in correction_keys
                     and all(isinstance(phrase.get(field), str) for field in ("study", "native", "phon"))}
    projected = _private_runtime_copy(pack, changed_paths)
    content_summary = _lot4_validate_project(projected, "reviewedContent", content)
    phonetic_summary = _lot4_validate_project(projected, "lot4Phonetic", phonetic)
    for pair in projected["manifest"]["pairs"]:
        path = f"{DATA_ROOT}/repertoires/{pair['id']}.json"
        value = digest((json.dumps(projected["repertoires"][pair["id"]], ensure_ascii=False, indent=2) + "\n").encode())
        projected["fingerprints"][path] = value
        pair["repertoireSha256"] = value
    result = _check_lot3_pack(projected)
    checks = result["checks"]
    actual_hashes = {path: value for path, value in sorted(pack["fingerprints"].items()) if path.startswith(DATA_ROOT + "/")}
    catalogue_differences, canonical_fields = Counter(), set()
    combined_objects, combined_ids, combined_fields, combined_canonical_ids = set(), set(), set(), set()
    combined_canonical_fields, noncatalogue_canonical_fields, heard_only_changed_fields = set(), Counter(), 0
    annotations = ("phoneticCorrection", "reviewedFieldCorrection", "lot4PhoneticCorrection", "reviewedContentCorrection")
    for pair, path, location, profile, phrase in _runtime_objects(pack):
        if not all(isinstance(phrase.get(field), str) for field in ("id", "study", "native", "phon")):
            continue
        changed = set()
        if "phoneticCorrection" in phrase:
            changed.add("phon")
        for annotation_name in annotations[1:]:
            annotation = phrase.get(annotation_name)
            if annotation:
                changed.update(field for field in annotation["fields"] if phrase.get(field) != annotation["beforeFields"].get(field))
        if changed:
            address, identity = (path, location), (pair, phrase["id"])
            combined_objects.add(address); combined_ids.add(identity)
            combined_fields.update((address, field) for field in changed)
            if profile == "canonical":
                combined_canonical_ids.add(identity)
                combined_canonical_fields.update((identity, field) for field in changed)
        source = phrase.get("source", {})
        collection = source.get("collection", "")
        if profile == "received-model" and collection.startswith("situation-received-"):
            heard_only_changed_fields += len(changed)
        if profile != "canonical":
            continue
        if not collection.startswith("DECKS."):
            noncatalogue_canonical_fields[collection] += len(changed)
        if collection.startswith("DECKS."):
            card = pack["decks"][PAIR_LANGUAGES[pair][1]][source["sourceIndex"]]
            for field, original in field_map(PAIR_LANGUAGES[pair][1]).items():
                if phrase.get(field) != card.get(original):
                    catalogue_differences[field] += 1
                    canonical_fields.add((pair, phrase["id"], field))
    checks.update({
        "catalogueFieldDifferences": len(canonical_fields),
        "catalogueVerbatimFields": checks["catalogueFieldsCompared"] - len(canonical_fields),
        "cataloguePhoneticFieldDifferences": catalogue_differences["phon"],
        "catalogueReadingFieldDifferences": catalogue_differences["reading"],
        "catalogueStudyFieldDifferences": catalogue_differences["study"],
        "catalogueNativeFieldDifferences": catalogue_differences["native"],
        "catalogueUnauthorizedFieldDifferences": 0,
        "lot4PhoneticIdentities": 259, "lot4PhoneticEvidenceEvents": 259,
        "lot4PhoneticRuntimeObjects": phonetic_summary["runtimeObjects"],
        "lot4PhoneticRuntimeFields": phonetic_summary["runtimeChangedFields"],
        "contentCorrectionIdentities": 35, "contentCorrectionEvidenceEvents": 35,
        "contentApprovedRegistryFields": 40, "contentChangedRegistryFields": 39,
        "contentApprovedCanonicalFields": content_summary["canonicalApprovedFields"],
        "contentChangedCanonicalFields": content_summary["canonicalChangedFields"],
        "contentRuntimeApprovedFields": content_summary["runtimeApprovedFields"],
        "contentRuntimeChangedFields": content_summary["runtimeChangedFields"],
        "contentRuntimeObjects": content_summary["runtimeObjects"],
        "contentAtomicBundleIdentities": content_summary["atomicBundleIdentities"],
        "combinedCorrectedIdentities": len(combined_ids), "combinedCorrectedRuntimeObjects": len(combined_objects),
        "combinedCorrectedRuntimeFields": len(combined_fields), "combinedCorrectedCanonicalIdentities": len(combined_canonical_ids),
        "combinedCorrectedCanonicalFields": len(combined_canonical_fields),
        "combinedEvidenceEvents": 774 + 95 + 259 + 35,
        "callerPackMutatedByProjection": False,
        "studyAndNativeChangesOnlyInSeparateApprovedContentBatch": True,
        "atomicContentBundlesAppliedAsWhole": True,
        "readingChangesAreOnlyTheFivePinnedPinyinEvents": False,
        "lot3ReadingChangesRemainTheFivePinnedPinyinEvents": True,
        "readingAndStudyExceptionsOnlyInExplicitAtomicContentBundles": True,
    })
    checks["importedVerbatimFields"] = checks["importedFieldsCompared"] - noncatalogue_canonical_fields["conversation"]
    checks["newEditorialVerbatimFields"] = checks["newEditorialFieldsCompared"] - noncatalogue_canonical_fields["editorial-authored"]
    checks["newSituationVerbatimWholeFields"] = checks["newSituationWholeFieldsCompared"] - sum(
        noncatalogue_canonical_fields[name] for name in ("situation-authored", "situation-conversation"))
    checks["newSupportVerbatimWholeFields"] = checks["newSupportWholeFieldsCompared"] - sum(
        noncatalogue_canonical_fields[name] for name in ("situation-support-authored", "situation-support-conversation"))
    checks["newReceivedVerbatimWholeFields"] = checks["newReceivedWholeFieldsCompared"] - heard_only_changed_fields
    # The final report always describes bytes actually served, never the private
    # source projection. Layer summaries keep their respective event counts.
    for key in ("phoneticCorrections", "reviewedFieldCorrections"):
        result[key]["actualRuntimeFileSha256"] = actual_hashes
    result["reviewedFieldCorrections"]["sourceStudyMeaningPlacementAndAccessUnchanged"] = False
    result["reviewedFieldCorrections"]["sourceStudyMeaningUnchangedByThatLayer"] = True
    result["lot4PhoneticCorrections"] = {**phonetic_summary, "actualRuntimeFileSha256": actual_hashes,
        "studyMeaningPlacementAndAccessUnchangedByThisLayer": True}
    result["reviewedContentCorrections"] = {**content_summary, "actualRuntimeFileSha256": actual_hashes,
        "originalSourcesAndAccessUnchanged": True, "studyAndMeaningExceptionsExplicit": True}
    return result


LOT5_BASE_COMMIT = "f22202cc4622c26794a6ada0c88d1741b82c1967"
LOT5_EVIDENCE_COMMIT = "62daa86414d937b0554831a4c032e05b3046bb61"
LOT4_CONTENT_REGISTRY_SHA = "346a85c459bb3adfc556c8946262509d19e9ffd46e65e9aa2dba40729aceab91"
LOT5_CONFIG = {
    "lot5Field": {
        "registryPath": REVIEW_ROOT + "/corrections-phonetiques/lot5/revue-claude-lot5.json",
        "directory": REVIEW_ROOT + "/corrections-phonetiques/lot5",
        "id": "revue-claude-lot5-phonetique-lectures", "status": "frozen-paired-reading-events-not-global-native-approval",
        "annotation": "lot5FieldCorrection", "manifest": "lot5FieldCorrections",
        "counts": (4, 8, 8, 8),
        "pins": {
            "docs/revue-integrale/lot5-fr-ja-L1-L10/registre-phonetique.json":
                ("76a8bed5f6218fc74aa0fb75f7f19b2bcd9518aa1440780877d5dd03b6789158", "phon"),
            "docs/revue-integrale/lot5-fr-ja-L1-L10/registre-lectures.json":
                ("2e863193df9228431b04011f343acc38af3bb4266921777291f97077100195c5", "reading"),
        },
    },
    "lot5Content": {
        "registryPath": REVIEW_ROOT + "/corrections-contenu/lot5/revue-contenu-lot5.json",
        "directory": REVIEW_ROOT + "/corrections-contenu/lot5",
        "id": "revue-contenu-lot5", "status": "frozen-certain-gloss-events-not-global-native-approval",
        "annotation": "lot5ContentCorrection", "manifest": "lot5ContentCorrections",
        "counts": (26, 26, 26, 26),
        "pins": {
            "docs/revue-integrale/lot5-fr-ja-L1-L10/lot-contenu-gloses.json":
                ("2fd7c7b35af687260013d563b8f7bd4fd6e14bdce0e4d7025fc1dd4f847a5cd0", "native"),
        },
    },
}
_LOT5_GIT_DOCUMENTS = {}
_LOT5_BASE_ENTRIES = {}


def _lot5_profile(phrase):
    profile = _lot4_profile(phrase)
    for name in ("reviewedContentCorrection", "lot5FieldCorrection"):
        profile[name + "Present"] = name in phrase
        profile[name] = phrase.get(name)
    return profile


def _lot5_git_document(pack, path):
    key = str(pack["root"].resolve()), path
    if key not in _LOT5_GIT_DOCUMENTS:
        raw = subprocess.run(["git", "show", LOT5_BASE_COMMIT + ":" + path], cwd=pack["root"],
                             capture_output=True, check=True).stdout
        _LOT5_GIT_DOCUMENTS[key] = json.loads(raw)
    return _LOT5_GIT_DOCUMENTS[key]


def _lot5_baseline_entries(pack):
    """Reconstruct all source roles/copies from Git, not editable declarations."""
    cache_key = str(pack["root"].resolve())
    if cache_key not in _LOT5_BASE_ENTRIES:
        entries = {}
        for level in range(1, 11):
            path = f"{DATA_ROOT}/fr-ja/L{level}.json"
            cell = _lot5_git_document(pack, path)
            for section in ("themes", "heldThemes"):
                for ti, theme in enumerate(cell.get(section, [])):
                    for pi, phrase in enumerate(theme.get("phrases", [])):
                        entries.setdefault(("fr-ja", phrase["id"]), {})[(path, (section, ti, "phrases", pi))] = ("canonical", phrase)
            for pi, phrase in enumerate(cell.get("reserve", [])):
                entries.setdefault(("fr-ja", phrase["id"]), {})[(path, ("reserve", pi))] = ("canonical", phrase)
        path = f"{DATA_ROOT}/repertoires/fr-ja.json"
        bank = _lot5_git_document(pack, path)
        for field, role in (("phrases", "transport-phrase"), ("receivedModels", "received-model")):
            for pi, phrase in enumerate(bank.get(field, [])):
                entries.setdefault(("fr-ja", phrase["id"]), {})[(path, (field, pi))] = (role, phrase)
        _LOT5_BASE_ENTRIES[cache_key] = entries
    return _LOT5_BASE_ENTRIES[cache_key]


def _lot5_annotation(name, entry, before, checksum):
    config = LOT5_CONFIG[name]
    return {"id": entry["id"], "registryPath": config["registryPath"], "registrySha256": checksum,
        "baseSnapshotCommit": LOT5_BASE_COMMIT, "evidenceCommits": [LOT5_EVIDENCE_COMMIT],
        "fields": sorted(entry["fields"]),
        "beforeFields": {field: value["before"] for field, value in entry["fields"].items()},
        "originalPhoneticReviewStatusPresent": before["phoneticReviewStatusPresent"],
        "originalPhoneticReviewStatus": before["phoneticReviewStatus"]}


def _lot5_status(entry):
    return "corrected-by-Claude-lot5-" + "+".join(entry["rules"])


def _lot5_declarations(pack, name, prior=None):
    config = LOT5_CONFIG[name]
    registry, raw_registry = pack.get(name + "Registry"), pack.get(name + "RegistryRaw")
    require(isinstance(registry, dict) and isinstance(raw_registry, bytes) and json.loads(raw_registry) == registry,
            "Lot5 registry differs from its loaded bytes")
    checksum = digest(raw_registry)
    require(pack["fingerprints"].get(config["registryPath"]) == checksum, "Lot5 registry fingerprint differs")
    require(registry.get("version") == 1 and registry.get("id") == config["id"]
            and registry.get("status") == config["status"] and registry.get("baseSnapshotCommit") == LOT5_BASE_COMMIT,
            "Lot5 changes its batch identity, before edition, or approval scope")
    require(tuple(registry.get(field) for field in ("correctionCount", "eventCount", "approvedFieldCount", "changedFieldCount"))
            == config["counts"], "Lot5 finite identity/event/field counts differ")
    if name == "lot5Field":
        predecessor = [{"registryPath": LOT4_CONFIG["reviewedContent"]["registryPath"],
                        "registrySha256": LOT4_CONTENT_REGISTRY_SHA}]
        require(digest(pack["reviewedContentRegistryRaw"]) == LOT4_CONTENT_REGISTRY_SHA,
                "Lot5 predecessor content registry changed")
    else:
        predecessor = [{"registryPath": LOT5_CONFIG["lot5Field"]["registryPath"], "registrySha256": prior[1]}]
    require(registry.get("appliesAfter") == predecessor, "Lot5 drops or forges its preceding layer")
    descriptors = registry.get("evidenceFiles")
    require(isinstance(descriptors, list) and len(descriptors) == len(config["pins"]), "Lot5 evidence file count differs")
    approved, used_paths, used_git_paths = {}, set(), set()
    for descriptor in descriptors:
        path, git_path = descriptor.get("path"), descriptor.get("gitPath")
        require(isinstance(path, str) and path.startswith(config["directory"] + "/")
                and ".." not in Path(path).parts and path not in used_paths and git_path in config["pins"]
                and git_path not in used_git_paths, "Unknown, duplicated or unsafe lot5 evidence path")
        used_paths.add(path); used_git_paths.add(git_path)
        expected_hash, field = config["pins"][git_path]
        raw = pack.get(name + "EvidenceRaw", {}).get(path)
        require(isinstance(raw, bytes) and digest(raw) == expected_hash
                and pack["fingerprints"].get(path) == expected_hash
                and descriptor == {"path": path, "gitPath": git_path, "gitCommit": LOT5_EVIDENCE_COMMIT, "sha256": expected_hash},
                "Pinned lot5 evidence fingerprint or descriptor differs")
        original = subprocess.run(["git", "show", LOT5_EVIDENCE_COMMIT + ":" + git_path], cwd=pack["root"],
                                  capture_output=True, check=True).stdout
        require(raw == original, "Lot5 evidence differs from pinned Git bytes")
        evidence = json.loads(raw)
        if name == "lot5Field":
            require(evidence.get("eventCount") == 4 and evidence.get("baseSnapshotCommit") == LOT5_BASE_COMMIT,
                    "Lot5 phonetic/reading proof has another count or before edition")
            selected = list(enumerate(evidence["events"]))
        else:
            require(evidence.get("reference") == LOT5_BASE_COMMIT, "Lot5 glose before edition differs")
            selected = [(index, row) for index, row in enumerate(evidence["items"]) if row.get("certainty") == "certain"]
            require(len(selected) == 26, "Lot5 certain-only glose selection differs")
        for index, row in selected:
            key = ("fr-ja", row.get("id"))
            require(isinstance(key[1], str), "Lot5 proof has no identity")
            if name == "lot5Field":
                require(row.get("pair") == key[0], "Lot5 phonetic/reading pair differs")
                if field == "phon":
                    require(row.get("priorCorrection") is False and set(row.get("rules", [])) <= {"M", "P"}
                            and row.get("rules"), "Lot5 phonetic prior correction or rule differs")
                    change = {"before": row["beforePhon"], "after": row["afterPhon"]}
                else:
                    require(row.get("field") == "reading" and row.get("linkedPhonEvent") is True,
                            "Lot5 reading is not linked to the complete aid")
                    change = {"before": row["beforeReading"], "after": row["afterReading"]}
                collection = "events"
            else:
                require(row.get("field") == "native", "Lot5 certain glose changes another field")
                change, collection = {"before": row["before"], "after": row["after"]}, "items"
            require(isinstance(change["before"], str) and isinstance(change["after"], str)
                    and change["before"] != change["after"], "Lot5 event lacks literal whole changes")
            entry = approved.setdefault(key, {"fields": {}, "refs": {}, "proofs": {}})
            require(field not in entry["fields"], "Lot5 duplicates a field event")
            entry["fields"][field] = change
            entry["refs"][field] = {"evidencePath": path, "evidenceCollection": collection, "evidenceIndex": index}
            entry["proofs"][field] = row
    require(len(approved) == config["counts"][0], "Lot5 approved identity set is incomplete")
    for key, entry in approved.items():
        fields = ["phon", "reading"] if name == "lot5Field" else ["native"]
        require(set(entry["fields"]) == set(fields), "Lot5 aid/reading pair is partial")
        entry["events"] = [entry["refs"][field] for field in fields]
        entry["rules"] = entry["proofs"]["phon"]["rules"] if name == "lot5Field" else []
        entry["atomicBundle"] = name == "lot5Field"
        if name == "lot5Field":
            phon, reading = entry["proofs"]["phon"], entry["proofs"]["reading"]
            require(phon["study"] == reading["study"] and phon["native"] == reading["native"],
                    "Lot5 linked reading belongs to another studied phrase or meaning")
    rows, lookup, locations = registry.get("corrections"), {}, set()
    require(isinstance(rows, list) and len(rows) == config["counts"][0], "Lot5 registry identity coverage differs")
    baseline_entries = _lot5_baseline_entries(pack)
    for entry in rows:
        key = entry.get("pairId"), entry.get("id")
        require(key in approved and key not in lookup, "Unknown or duplicated lot5 identity")
        source = approved[key]
        require(all(entry.get(field) == source[field] for field in ("fields", "events", "rules"))
                and entry.get("atomicBundle") is source["atomicBundle"],
                "Lot5 frozen event pair or certain glose is altered")
        occurrences = entry.get("occurrences")
        require(isinstance(occurrences, list) and occurrences, "Lot5 identity has no occurrences")
        addresses = set()
        for occurrence in occurrences:
            path, location, profile = occurrence.get("path"), occurrence.get("location"), occurrence.get("profile")
            require(isinstance(path, str) and isinstance(location, list) and location
                    and all(type(token) is int and token >= 0 or isinstance(token, str) and token and token not in {"..", "/"}
                            for token in location), "Lot5 occurrence path/location malformed")
            address = path, tuple(location)
            require(address not in locations and address in baseline_entries.get(key, {}),
                    "Lot5 occurrence duplicated or absent from pinned edition")
            locations.add(address); addresses.add(address)
            expected_profile, original = baseline_entries[key][address]
            require(profile == expected_profile, "Lot5 changes an original canonical/transport/received role")
            original = copy.deepcopy(original)
            if prior is not None and key in prior[0]:
                previous = prior[0][key]; before_previous = _lot5_profile(original)
                for field, value in previous["fields"].items():
                    require(original.get(field) == value["before"], "Lot5 content predecessor before differs")
                    original[field] = value["after"]
                original["phoneticReviewStatus"] = _lot5_status(previous)
                original["lot5FieldCorrection"] = _lot5_annotation("lot5Field", previous, before_previous, prior[1])
            before = occurrence.get("expectedBefore")
            require(isinstance(before, dict) and set(before) == set(_lot5_profile({})) and before == _lot5_profile(original),
                    "Lot5 original tuple/source/status/prior annotations differ from Git f22202c")
            for field, value in entry["fields"].items():
                require(before.get(field) == value["before"], "Lot5 field before is not its exact predecessor")
                proof = source["proofs"][field]
                require(before["study"] == proof["study"], "Lot5 proof targets another studied phrase")
                if name == "lot5Field":
                    require(before["native"] == proof["native"], "Lot5 phonetic/reading proof changes its meaning")
        require(addresses == set(baseline_entries[key]), "Lot5 before declarations omit a source role or transport copy")
        lookup[key] = entry
    require(set(lookup) == set(approved), "Lot5 registry omits approved identities")
    counts = config["counts"]
    require(sum(len(entry["fields"]) for entry in rows) == counts[2]
            and sum(value["before"] != value["after"] for entry in rows for value in entry["fields"].values()) == counts[3],
            "Lot5 approved/changed field counts differ")
    declaration = {"registryPath": config["registryPath"], "registrySha256": checksum,
        "baseSnapshotCommit": LOT5_BASE_COMMIT, "appliesAfter": predecessor,
        "correctionCount": counts[0], "eventCount": counts[1], "approvedFieldCount": counts[2],
        "changedFieldCount": counts[3], "evidenceCommits": [LOT5_EVIDENCE_COMMIT]}
    require(pack["manifest"].get(config["manifest"]) == declaration, "Lot5 manifest declaration absent or forged")
    return lookup, checksum, declaration


def _lot5_validate_project(pack, name, data):
    """Check after values, then restore just this layer in an already private pack."""
    config = LOT5_CONFIG[name]; lookup, checksum, declaration = data
    seen, profiles, fields, addresses, profile_counts = Counter(), Counter(), Counter(), set(), Counter()
    canonical_ids = set()
    for pair, path, location, profile, phrase in _runtime_objects(pack):
        key = pair, phrase.get("id")
        actual_phrase = all(isinstance(phrase.get(field), str) for field in ("id", "study", "native", "phon"))
        if not actual_phrase or key not in lookup:
            require(config["annotation"] not in phrase, "Stray lot5 annotation outside its identity")
            continue
        entry = lookup[key]; annotation = phrase.get(config["annotation"])
        require(isinstance(annotation, dict), "Lot5 corrected card/copy lacks exact annotation")
        restored = copy.deepcopy(phrase);restored.pop(config["annotation"], None)
        restored.update({field: value["before"] for field, value in entry["fields"].items()})
        candidates = []
        for occurrence in entry["occurrences"]:
            if occurrence["profile"] != profile and not (profile == "transport-phrase" and occurrence["profile"] == "canonical"):
                continue
            before = occurrence["expectedBefore"]
            if "phon" in entry["fields"]:
                if before["phoneticReviewStatusPresent"]:restored["phoneticReviewStatus"] = before["phoneticReviewStatus"]
                else:restored.pop("phoneticReviewStatus", None)
            if _lot5_profile(restored) == before:candidates.append(before)
        require(candidates, "Lot5 before tuple, provenance, status or earlier annotations altered")
        before = candidates[0]
        require(annotation == _lot5_annotation(name, entry, before, checksum), "Lot5 annotation before/hash/fields changed")
        for field, value in entry["fields"].items():
            require(phrase.get(field) == value["after"], "Lot5 actual after differs, or aid/reading pair is partial")
            fields[(profile, field)] += 1
        if "phon" in entry["fields"]:
            require(phrase.get("phoneticReviewStatus") == _lot5_status(entry), "Lot5 paired local phonetic status changed")
        else:
            require(("phoneticReviewStatus" in phrase) == before["phoneticReviewStatusPresent"]
                    and phrase.get("phoneticReviewStatus") == before["phoneticReviewStatus"],
                    "Lot5 native-only glose invents a phonetic status")
        if profile == "canonical":
            require(key not in canonical_ids, "Duplicate lot5 canonical identity")
            canonical_ids.add(key)
        seen[key] += 1;profiles[profile] += 1;profile_counts[(key, profile)] += 1;addresses.add((path, location))
        phrase.update({field: value["before"] for field, value in entry["fields"].items()})
        if "phon" in entry["fields"]:
            if before["phoneticReviewStatusPresent"]:phrase["phoneticReviewStatus"] = before["phoneticReviewStatus"]
            else:phrase.pop("phoneticReviewStatus", None)
        del phrase[config["annotation"]]
    require(set(seen) == set(lookup), "Lot5 declared identity missing from actual runtime")
    for key, entry in lookup.items():
        expected = Counter(row["profile"] for row in entry["occurrences"])
        for profile in ("canonical", "received-model"):
            require(profile_counts[(key, profile)] == expected[profile], "Lot5 canonical/received occurrence missing or duplicated")
        require(profile_counts[(key, "transport-phrase")] >= expected["transport-phrase"], "Lot5 transport copy missing")
    pack["manifest"].pop(config["manifest"])
    return {**declaration, "runtimeObjects": sum(profiles.values()),
        "runtimeProfiles": {profile: profiles[profile] for profile in ("canonical", "transport-phrase", "received-model")},
        "runtimeApprovedFields": sum(fields.values()), "runtimeChangedFields": sum(fields.values()),
        "canonicalChangedFields": sum(n for (profile, _), n in fields.items() if profile == "canonical"),
        "fieldProfiles": {profile: {field: fields[(profile, field)] for field in ("study", "native", "phon", "reading")}
                          for profile in ("canonical", "transport-phrase", "received-model")},
        "validation": "pinned complete paired events and certain gloses, Git f22202c before profiles, actual after before private native→phon/reading→older layers projection",
        "globalNativeApproval": False}


def _check_before_lot6_pack(pack):
    """Validate both lot5 layers without mutating caller data or older sources."""
    paired = _lot5_declarations(pack, "lot5Field")
    content = _lot5_declarations(pack, "lot5Content", paired)
    for pair in pack["manifest"]["pairs"]:
        path = f"{DATA_ROOT}/repertoires/{pair['id']}.json"
        require(pair.get("repertoireSha256") == pack["fingerprints"].get(path), "Actual lot5 bank fingerprint differs from manifest")
    keys = set(paired[0]) | set(content[0])
    changed_paths = {path for pair, path, _location, _profile, phrase in _runtime_objects(pack)
                     if (pair, phrase.get("id")) in keys
                     and all(isinstance(phrase.get(field), str) for field in ("study", "native", "phon"))}
    projected = _private_runtime_copy(pack, changed_paths)
    content_summary = _lot5_validate_project(projected, "lot5Content", content)
    paired_summary = _lot5_validate_project(projected, "lot5Field", paired)
    for pair in projected["manifest"]["pairs"]:
        path = f"{DATA_ROOT}/repertoires/{pair['id']}.json"
        value = digest((json.dumps(projected["repertoires"][pair["id"]], ensure_ascii=False, indent=2) + "\n").encode())
        projected["fingerprints"][path] = value;pair["repertoireSha256"] = value
    # A corrected open model remains an open model; no new exercise may use it.
    reserved = [p for p in pack["cells"][("fr-ja", 5)]["reserve"] if p.get("id") == "catalogue:ja:3771"]
    require(len(reserved) == 1, "Lot5 reserve3771 was activated or lost")
    for cell in pack["cells"].values():
        for theme in cell["themes"] + cell.get("heldThemes", []):
            require(all(p.get("id") != "catalogue:ja:3771" for p in theme.get("phrases", [])), "Lot5 reserve3771 entered an active theme")
            for sequence in theme.get("sequences", []):
                require("catalogue:ja:3771" not in sequence.get("phraseIds", [])
                        and all(step.get("utterance") != "catalogue:ja:3771" for step in sequence.get("steps", [])),
                        "Lot5 reserve3771 gained a production/listening step")
    result = _check_before_lot5_pack(projected)
    checks = result["checks"]
    actual_hashes = {path: value for path, value in sorted(pack["fingerprints"].items()) if path.startswith(DATA_ROOT + "/")}
    differences, canonical_fields = Counter(), set()
    combined_ids, combined_objects, combined_fields, combined_canonical_ids, combined_canonical_fields = set(), set(), set(), set(), set()
    noncatalogue_canonical_fields, heard_only_changed_fields = Counter(), 0
    annotations = ("phoneticCorrection", "reviewedFieldCorrection", "lot4PhoneticCorrection", "reviewedContentCorrection", "lot5FieldCorrection", "lot5ContentCorrection")
    for pair, path, location, profile, phrase in _runtime_objects(pack):
        if not all(isinstance(phrase.get(field), str) for field in ("id", "study", "native", "phon")):continue
        changed = {"phon"} if "phoneticCorrection" in phrase else set()
        for annotation_name in annotations[1:]:
            annotation = phrase.get(annotation_name)
            if annotation:changed.update(field for field in annotation["fields"] if phrase.get(field) != annotation["beforeFields"].get(field))
        if changed:
            address, identity = (path, location), (pair, phrase["id"])
            combined_ids.add(identity);combined_objects.add(address);combined_fields.update((address, field) for field in changed)
            if profile == "canonical":
                combined_canonical_ids.add(identity);combined_canonical_fields.update((identity, field) for field in changed)
        collection = phrase.get("source", {}).get("collection", "")
        if profile == "received-model" and collection.startswith("situation-received-"):heard_only_changed_fields += len(changed)
        if profile != "canonical":continue
        if collection.startswith("DECKS."):
            card = pack["decks"][PAIR_LANGUAGES[pair][1]][phrase["source"]["sourceIndex"]]
            for field, original in field_map(PAIR_LANGUAGES[pair][1]).items():
                if phrase.get(field) != card.get(original):
                    differences[field] += 1;canonical_fields.add((pair, phrase["id"], field))
        else:noncatalogue_canonical_fields[collection] += len(changed)
    checks.update({"catalogueFieldDifferences": len(canonical_fields),
        "catalogueVerbatimFields": checks["catalogueFieldsCompared"] - len(canonical_fields),
        "cataloguePhoneticFieldDifferences": differences["phon"], "catalogueReadingFieldDifferences": differences["reading"],
        "catalogueStudyFieldDifferences": differences["study"], "catalogueNativeFieldDifferences": differences["native"],
        "catalogueUnauthorizedFieldDifferences": 0, "lot5PairedIdentities": 4, "lot5PairedEvidenceEvents": 8,
        "lot5PairedRuntimeObjects": paired_summary["runtimeObjects"], "lot5PairedRuntimeFields": paired_summary["runtimeChangedFields"],
        "lot5GlossIdentities": 26, "lot5GlossEvidenceEvents": 26, "lot5GlossRuntimeObjects": content_summary["runtimeObjects"],
        "lot5GlossRuntimeFields": content_summary["runtimeChangedFields"], "lot5PairsAppliedAtomically": True,
        "lot5Reserve3771HasNoLessonSteps": True,
        "combinedCorrectedIdentities": len(combined_ids), "combinedCorrectedRuntimeObjects": len(combined_objects),
        "combinedCorrectedRuntimeFields": len(combined_fields), "combinedCorrectedCanonicalIdentities": len(combined_canonical_ids),
        "combinedCorrectedCanonicalFields": len(combined_canonical_fields), "combinedEvidenceEvents": 774+95+259+35+8+26,
        "callerPackMutatedByProjection": False, "lot5StudyPlacementLevelsRolesStepsAndAccessUnchanged": True,
        "lot5MeaningExceptionsOnlyInSeparateCertainGlossRegistry": True,
        "readingAndStudyExceptionsOnlyInExplicitAtomicContentBundles": False,
        "lot4ReadingAndStudyContentExceptionsRemainAtomic": True,
        "allReadingExceptionsAreExplicitlyRegistered": True})
    checks["importedVerbatimFields"] = checks["importedFieldsCompared"] - noncatalogue_canonical_fields["conversation"]
    checks["newEditorialVerbatimFields"] = checks["newEditorialFieldsCompared"] - noncatalogue_canonical_fields["editorial-authored"]
    checks["newSituationVerbatimWholeFields"] = checks["newSituationWholeFieldsCompared"] - sum(noncatalogue_canonical_fields[n] for n in ("situation-authored", "situation-conversation"))
    checks["newSupportVerbatimWholeFields"] = checks["newSupportWholeFieldsCompared"] - sum(noncatalogue_canonical_fields[n] for n in ("situation-support-authored", "situation-support-conversation"))
    checks["newReceivedVerbatimWholeFields"] = checks["newReceivedWholeFieldsCompared"] - heard_only_changed_fields
    for name in ("phoneticCorrections", "reviewedFieldCorrections", "lot4PhoneticCorrections", "reviewedContentCorrections"):
        result[name]["actualRuntimeFileSha256"] = actual_hashes
    result["lot5FieldCorrections"] = {**paired_summary, "actualRuntimeFileSha256": actual_hashes,
        "studyMeaningPlacementAndAccessUnchangedByThisLayer": True, "pairedAidAndReadingAtomic": True}
    result["lot5ContentCorrections"] = {**content_summary, "actualRuntimeFileSha256": actual_hashes,
        "originalSourcesAndAccessUnchanged": True, "nativeExceptionsExplicit": True}
    return result


LOT6_BASE_COMMIT = "161d0ebef38bb38ea9e26a836ca701b9d136f6d2"
LOT6_EVIDENCE_COMMIT = "87357b16c7d77a1c94fdbd940dcb3f232758748d"
LOT5_CONTENT_REGISTRY_SHA = "ef394ba1007bc474ca98cc4a166cc680d185ad824c894b710656e5e60ca1758a"
LOT6_CONFIG = {
    "lot6Field": {
        "registryPath": REVIEW_ROOT + "/corrections-phonetiques/lot6/revue-claude-lot6.json",
        "directory": REVIEW_ROOT + "/corrections-phonetiques/lot6",
        "id": "revue-claude-lot6-phonetique-lectures", "status": "frozen-whole-and-paired-reading-events-not-global-native-approval",
        "annotation": "lot6FieldCorrection", "manifest": "lot6FieldCorrections",
        "counts": (18, 23, 23, 23),
        "pins": {
            "docs/revue-integrale/lot6-fr-ko-L1-L10/registre-phonetique.json":
                ("4c5861f15f7c77b4107c70ba3a7a2106065874ed42147f1bf428cc97e5230239", "phon"),
            "docs/revue-integrale/lot6-fr-ko-L1-L10/registre-lectures.json":
                ("d250e9fbd5b2d5d6b27eb9469c7563fac20d6cbc12f410b28cf172b9d24f89de", "reading"),
        },
    },
    "lot6Content": {
        "registryPath": REVIEW_ROOT + "/corrections-contenu/lot6/revue-contenu-lot6.json",
        "directory": REVIEW_ROOT + "/corrections-contenu/lot6",
        "id": "revue-contenu-lot6", "status": "frozen-certain-gloss-and-linked-bundle-events-not-global-native-approval",
        "annotation": "lot6ContentCorrection", "manifest": "lot6ContentCorrections",
        "counts": (47, 47, 51, 51),
        "pins": {
            "docs/revue-integrale/lot6-fr-ko-L1-L10/lot-contenu-gloses.json":
                ("9a522d18d620ce38b2b462ab543a6c78179bf5b00b5989427a82c2ae6df8f73e", "native"),
        },
    },
}
_LOT6_GIT_DOCUMENTS = {}
_LOT6_BASE_ENTRIES = {}


def _lot6_profile(phrase):
    profile = _lot5_profile(phrase)
    for name in ("lot5ContentCorrection", "lot6FieldCorrection"):
        profile[name + "Present"] = name in phrase
        profile[name] = phrase.get(name)
    return profile


def _lot6_git_document(pack, path):
    key = str(pack["root"].resolve()), path
    if key not in _LOT6_GIT_DOCUMENTS:
        raw = subprocess.run(["git", "show", LOT6_BASE_COMMIT + ":" + path], cwd=pack["root"],
                             capture_output=True, check=True).stdout
        _LOT6_GIT_DOCUMENTS[key] = json.loads(raw)
    return _LOT6_GIT_DOCUMENTS[key]


def _lot6_baseline_entries(pack):
    """Reconstruct all source roles/copies from Git, not editable declarations."""
    cache_key = str(pack["root"].resolve())
    if cache_key not in _LOT6_BASE_ENTRIES:
        entries = {}
        for level in range(1, 11):
            path = f"{DATA_ROOT}/fr-ko/L{level}.json"
            cell = _lot6_git_document(pack, path)
            for section in ("themes", "heldThemes"):
                for ti, theme in enumerate(cell.get(section, [])):
                    for pi, phrase in enumerate(theme.get("phrases", [])):
                        entries.setdefault(("fr-ko", phrase["id"]), {})[(path, (section, ti, "phrases", pi))] = ("canonical", phrase)
            for pi, phrase in enumerate(cell.get("reserve", [])):
                entries.setdefault(("fr-ko", phrase["id"]), {})[(path, ("reserve", pi))] = ("canonical", phrase)
        path = f"{DATA_ROOT}/repertoires/fr-ko.json"
        bank = _lot6_git_document(pack, path)
        for field, role in (("phrases", "transport-phrase"), ("receivedModels", "received-model")):
            for pi, phrase in enumerate(bank.get(field, [])):
                entries.setdefault(("fr-ko", phrase["id"]), {})[(path, (field, pi))] = (role, phrase)
        _LOT6_BASE_ENTRIES[cache_key] = entries
    return _LOT6_BASE_ENTRIES[cache_key]


def _lot6_annotation(name, entry, before, checksum):
    config = LOT6_CONFIG[name]
    return {"id": entry["id"], "registryPath": config["registryPath"], "registrySha256": checksum,
        "baseSnapshotCommit": LOT6_BASE_COMMIT, "evidenceCommits": [LOT6_EVIDENCE_COMMIT],
        "fields": sorted(entry["fields"]),
        "beforeFields": {field: value["before"] for field, value in entry["fields"].items()},
        "originalPhoneticReviewStatusPresent": before["phoneticReviewStatusPresent"],
        "originalPhoneticReviewStatus": before["phoneticReviewStatus"]}


def _lot6_status(entry):
    return "corrected-by-Claude-lot6-" + "+".join(entry["rules"]) if entry["rules"] else "corrected-by-Claude-content-lot6"


def _lot6_declarations(pack, name, prior=None):
    config = LOT6_CONFIG[name]
    registry, raw_registry = pack.get(name + "Registry"), pack.get(name + "RegistryRaw")
    require(isinstance(registry, dict) and isinstance(raw_registry, bytes) and json.loads(raw_registry) == registry,
            "Lot6 registry differs from its loaded bytes")
    checksum = digest(raw_registry)
    require(pack["fingerprints"].get(config["registryPath"]) == checksum, "Lot6 registry fingerprint differs")
    require(registry.get("version") == 1 and registry.get("id") == config["id"]
            and registry.get("status") == config["status"] and registry.get("baseSnapshotCommit") == LOT6_BASE_COMMIT,
            "Lot6 changes its batch identity, before edition, or approval scope")
    require(tuple(registry.get(field) for field in ("correctionCount", "eventCount", "approvedFieldCount", "changedFieldCount"))
            == config["counts"], "Lot6 finite identity/event/field counts differ")
    if name == "lot6Field":
        predecessor = [{"registryPath": LOT5_CONFIG["lot5Content"]["registryPath"],
                        "registrySha256": LOT5_CONTENT_REGISTRY_SHA}]
        require(digest(pack["lot5ContentRegistryRaw"]) == LOT5_CONTENT_REGISTRY_SHA,
                "Lot6 predecessor content registry changed")
    else:
        predecessor = [{"registryPath": LOT6_CONFIG["lot6Field"]["registryPath"], "registrySha256": prior[1]}]
    require(registry.get("appliesAfter") == predecessor, "Lot6 drops or forges its preceding layer")
    descriptors = registry.get("evidenceFiles")
    require(isinstance(descriptors, list) and len(descriptors) == len(config["pins"]), "Lot6 evidence file count differs")
    approved, used_paths, used_git_paths = {}, set(), set()
    for descriptor in descriptors:
        path, git_path = descriptor.get("path"), descriptor.get("gitPath")
        require(isinstance(path, str) and path.startswith(config["directory"] + "/")
                and ".." not in Path(path).parts and path not in used_paths and git_path in config["pins"]
                and git_path not in used_git_paths, "Unknown, duplicated or unsafe lot6 evidence path")
        used_paths.add(path); used_git_paths.add(git_path)
        expected_hash, field = config["pins"][git_path]
        raw = pack.get(name + "EvidenceRaw", {}).get(path)
        require(isinstance(raw, bytes) and digest(raw) == expected_hash
                and pack["fingerprints"].get(path) == expected_hash
                and descriptor == {"path": path, "gitPath": git_path, "gitCommit": LOT6_EVIDENCE_COMMIT, "sha256": expected_hash},
                "Pinned lot6 evidence fingerprint or descriptor differs")
        original = subprocess.run(["git", "show", LOT6_EVIDENCE_COMMIT + ":" + git_path], cwd=pack["root"],
                                  capture_output=True, check=True).stdout
        require(raw == original, "Lot6 evidence differs from pinned Git bytes")
        evidence = json.loads(raw)
        if name == "lot6Field":
            require(evidence.get("eventCount") == (18 if field == "phon" else 5)
                    and evidence.get("baseSnapshotCommit") == LOT6_BASE_COMMIT,
                    "Lot6 phonetic/reading proof has another count or before edition")
            selected = [("events", index, row) for index, row in enumerate(evidence["events"])]
        else:
            require(evidence.get("reference") == LOT6_BASE_COMMIT and evidence.get("certainCount") == 45,
                    "Lot6 content before edition/count differs")
            selected = [("items", index, row) for index, row in enumerate(evidence["items"])
                        if row.get("certainty") == "certain"]
            require(len(selected) == 45 and len(evidence.get("linkedBundles", [])) == 2,
                    "Lot6 certain-only content selection differs")
            selected.extend(("linkedBundles", index, row) for index, row in enumerate(evidence["linkedBundles"]))
        for collection, index, row in selected:
            key = ("fr-ko", row.get("id"))
            require(isinstance(key[1], str), "Lot6 proof has no identity")
            if name == "lot6Field":
                require(row.get("pair") == key[0], "Lot6 phonetic/reading pair differs")
                if field == "phon":
                    require(type(row.get("priorCorrection")) is bool and row.get("rules") in (["R"], ["S"]),
                            "Lot6 phonetic prior correction or frozen rule differs")
                    changes = {"phon": {"before": row["beforePhon"], "after": row["afterPhon"]}}
                else:
                    require(row.get("field") == "reading" and row.get("linkedPhonEvent") is True,
                            "Lot6 reading is not linked to the complete aid")
                    changes = {"reading": {"before": row["beforeReading"], "after": row["afterReading"]}}
            elif collection == "items":
                require(row.get("field") == "native", "Lot6 certain glose changes another field")
                changes = {"native": {"before": row["before"], "after": row["after"]}}
            else:
                require(row.get("certainty") == "certain" and row.get("applyTogether") is True
                        and set(row["before"]) == set(row["after"]) == {"study", "reading", "phon"},
                        "Lot6 content bundle is partial or uncertain")
                changes = {f: {"before": row["before"][f], "after": row["after"][f]}
                           for f in ("study", "reading", "phon")}
            entry = approved.setdefault(key, {"fields": {}, "refs": {}, "proofs": {}, "events": []})
            ref = {"evidencePath": path, "evidenceCollection": collection, "evidenceIndex": index}
            entry["events"].append(ref)
            for changed_field, change in changes.items():
                require(isinstance(change["before"], str) and isinstance(change["after"], str)
                        and change["before"] != change["after"], "Lot6 event lacks literal whole changes")
                require(changed_field not in entry["fields"], "Lot6 duplicates a field event")
                entry["fields"][changed_field] = change
                entry["refs"][changed_field] = ref
                entry["proofs"][changed_field] = row
    require(len(approved) == config["counts"][0], "Lot6 approved identity set is incomplete")
    for key, entry in approved.items():
        fields = list(entry["fields"])
        if name == "lot6Field":
            require(set(fields) in ({"phon"}, {"phon", "reading"}), "Lot6 aid/reading pair is partial")
            entry["rules"] = entry["proofs"]["phon"]["rules"]
            if "reading" in fields:
                require(entry["proofs"]["phon"]["study"] == entry["proofs"]["reading"]["study"],
                        "Lot6 linked reading belongs to another studied phrase")
        else:
            require(set(fields) in ({"native"}, {"study", "reading", "phon"}), "Lot6 content bundle is partial")
            entry["rules"] = []
        entry["atomicBundle"] = len(fields) > 1
    require(sum(len(e["events"]) for e in approved.values()) == config["counts"][1],
            "Lot6 event coverage differs")
    rows, lookup, locations = registry.get("corrections"), {}, set()
    require(isinstance(rows, list) and len(rows) == config["counts"][0], "Lot6 registry identity coverage differs")
    baseline_entries = _lot6_baseline_entries(pack)
    for entry in rows:
        key = entry.get("pairId"), entry.get("id")
        require(key in approved and key not in lookup, "Unknown or duplicated lot6 identity")
        source = approved[key]
        require(all(entry.get(field) == source[field] for field in ("fields", "events", "rules"))
                and entry.get("atomicBundle") is source["atomicBundle"],
                "Lot6 frozen event pair or certain glose is altered")
        occurrences = entry.get("occurrences")
        require(isinstance(occurrences, list) and occurrences, "Lot6 identity has no occurrences")
        addresses = set()
        for occurrence in occurrences:
            path, location, profile = occurrence.get("path"), occurrence.get("location"), occurrence.get("profile")
            require(isinstance(path, str) and isinstance(location, list) and location
                    and all(type(token) is int and token >= 0 or isinstance(token, str) and token and token not in {"..", "/"}
                            for token in location), "Lot6 occurrence path/location malformed")
            address = path, tuple(location)
            require(address not in locations and address in baseline_entries.get(key, {}),
                    "Lot6 occurrence duplicated or absent from pinned edition")
            locations.add(address); addresses.add(address)
            expected_profile, original = baseline_entries[key][address]
            require(profile == expected_profile, "Lot6 changes an original canonical/transport/received role")
            original = copy.deepcopy(original)
            if prior is not None and key in prior[0]:
                previous = prior[0][key]; before_previous = _lot6_profile(original)
                for field, value in previous["fields"].items():
                    require(original.get(field) == value["before"], "Lot6 content predecessor before differs")
                    original[field] = value["after"]
                original["phoneticReviewStatus"] = _lot6_status(previous)
                original["lot6FieldCorrection"] = _lot6_annotation("lot6Field", previous, before_previous, prior[1])
            before = occurrence.get("expectedBefore")
            require(isinstance(before, dict) and set(before) == set(_lot6_profile({})) and before == _lot6_profile(original),
                    "Lot6 original tuple/source/status/prior annotations differ from Git 161d0eb")
            for field, value in entry["fields"].items():
                require(before.get(field) == value["before"], "Lot6 field before is not its exact predecessor")
                proof = source["proofs"][field]
                if "study" in proof:
                    require(before["study"] == proof["study"], "Lot6 proof targets another studied phrase")
                if name == "lot6Field":
                    phon_proof = source["proofs"]["phon"]
                    require(before["native"] == phon_proof["native"], "Lot6 phonetic/reading proof changes its meaning")
                    require(before["phoneticCorrectionPresent"] is phon_proof["priorCorrection"],
                            "Lot6 earlier B-event declared incorrectly")
                    anchor = proof["occurrence"]
                    require(any(o["path"] == anchor["path"] and o["location"] == anchor["location"] for o in occurrences),
                            "Lot6 proof anchor is absent from its original roles")
        require(addresses == set(baseline_entries[key]), "Lot6 before declarations omit a source role or transport copy")
        lookup[key] = entry
    require(set(lookup) == set(approved), "Lot6 registry omits approved identities")
    counts = config["counts"]
    require(sum(len(entry["fields"]) for entry in rows) == counts[2]
            and sum(value["before"] != value["after"] for entry in rows for value in entry["fields"].values()) == counts[3],
            "Lot6 approved/changed field counts differ")
    declaration = {"registryPath": config["registryPath"], "registrySha256": checksum,
        "baseSnapshotCommit": LOT6_BASE_COMMIT, "appliesAfter": predecessor,
        "correctionCount": counts[0], "eventCount": counts[1], "approvedFieldCount": counts[2],
        "changedFieldCount": counts[3], "evidenceCommits": [LOT6_EVIDENCE_COMMIT]}
    require(pack["manifest"].get(config["manifest"]) == declaration, "Lot6 manifest declaration absent or forged")
    return lookup, checksum, declaration


def _lot6_validate_project(pack, name, data):
    """Check after values, then restore just this layer in an already private pack."""
    config = LOT6_CONFIG[name]; lookup, checksum, declaration = data
    seen, profiles, fields, addresses, profile_counts = Counter(), Counter(), Counter(), set(), Counter()
    canonical_ids = set()
    for pair, path, location, profile, phrase in _runtime_objects(pack):
        key = pair, phrase.get("id")
        actual_phrase = all(isinstance(phrase.get(field), str) for field in ("id", "study", "native", "phon"))
        if not actual_phrase or key not in lookup:
            require(config["annotation"] not in phrase, "Stray lot6 annotation outside its identity")
            continue
        entry = lookup[key]; annotation = phrase.get(config["annotation"])
        require(isinstance(annotation, dict), "Lot6 corrected card/copy lacks exact annotation")
        restored = copy.deepcopy(phrase);restored.pop(config["annotation"], None)
        restored.update({field: value["before"] for field, value in entry["fields"].items()})
        candidates = []
        for occurrence in entry["occurrences"]:
            if occurrence["profile"] != profile and not (profile == "transport-phrase" and occurrence["profile"] == "canonical"):
                continue
            before = occurrence["expectedBefore"]
            if "phon" in entry["fields"]:
                if before["phoneticReviewStatusPresent"]:restored["phoneticReviewStatus"] = before["phoneticReviewStatus"]
                else:restored.pop("phoneticReviewStatus", None)
            if _lot6_profile(restored) == before:candidates.append(before)
        require(candidates, "Lot6 before tuple, provenance, status or earlier annotations altered")
        before = candidates[0]
        require(annotation == _lot6_annotation(name, entry, before, checksum), "Lot6 annotation before/hash/fields changed")
        for field, value in entry["fields"].items():
            require(phrase.get(field) == value["after"], "Lot6 actual after differs, or aid/reading pair is partial")
            fields[(profile, field)] += 1
        if "phon" in entry["fields"]:
            require(phrase.get("phoneticReviewStatus") == _lot6_status(entry), "Lot6 paired local phonetic status changed")
        else:
            require(("phoneticReviewStatus" in phrase) == before["phoneticReviewStatusPresent"]
                    and phrase.get("phoneticReviewStatus") == before["phoneticReviewStatus"],
                    "Lot6 native-only glose invents a phonetic status")
        if profile == "canonical":
            require(key not in canonical_ids, "Duplicate lot6 canonical identity")
            canonical_ids.add(key)
        seen[key] += 1;profiles[profile] += 1;profile_counts[(key, profile)] += 1;addresses.add((path, location))
        phrase.update({field: value["before"] for field, value in entry["fields"].items()})
        if "phon" in entry["fields"]:
            if before["phoneticReviewStatusPresent"]:phrase["phoneticReviewStatus"] = before["phoneticReviewStatus"]
            else:phrase.pop("phoneticReviewStatus", None)
        del phrase[config["annotation"]]
    require(set(seen) == set(lookup), "Lot6 declared identity missing from actual runtime")
    for key, entry in lookup.items():
        expected = Counter(row["profile"] for row in entry["occurrences"])
        for profile in ("canonical", "received-model"):
            require(profile_counts[(key, profile)] == expected[profile], "Lot6 canonical/received occurrence missing or duplicated")
        require(profile_counts[(key, "transport-phrase")] >= expected["transport-phrase"], "Lot6 transport copy missing")
    pack["manifest"].pop(config["manifest"])
    return {**declaration, "runtimeObjects": sum(profiles.values()),
        "runtimeProfiles": {profile: profiles[profile] for profile in ("canonical", "transport-phrase", "received-model")},
        "runtimeApprovedFields": sum(fields.values()), "runtimeChangedFields": sum(fields.values()),
        "canonicalChangedFields": sum(n for (profile, _), n in fields.items() if profile == "canonical"),
        "fieldProfiles": {profile: {field: fields[(profile, field)] for field in ("study", "native", "phon", "reading")}
                          for profile in ("canonical", "transport-phrase", "received-model")},
        "validation": "pinned literal events and certain content, Git 161d0eb full before profiles, actual after before private content→phon/reading→older layers projection",
        "globalNativeApproval": False}


def _check_before_lot7_pack(pack):
    """Validate both lot6 layers without mutating caller data or older sources."""
    paired = _lot6_declarations(pack, "lot6Field")
    content = _lot6_declarations(pack, "lot6Content", paired)
    for pair in pack["manifest"]["pairs"]:
        path = f"{DATA_ROOT}/repertoires/{pair['id']}.json"
        require(pair.get("repertoireSha256") == pack["fingerprints"].get(path), "Actual lot6 bank fingerprint differs from manifest")
    keys = set(paired[0]) | set(content[0])
    changed_paths = {path for pair, path, _location, _profile, phrase in _runtime_objects(pack)
                     if (pair, phrase.get("id")) in keys
                     and all(isinstance(phrase.get(field), str) for field in ("study", "native", "phon"))}
    projected = _private_runtime_copy(pack, changed_paths)
    content_summary = _lot6_validate_project(projected, "lot6Content", content)
    paired_summary = _lot6_validate_project(projected, "lot6Field", paired)
    for pair in projected["manifest"]["pairs"]:
        path = f"{DATA_ROOT}/repertoires/{pair['id']}.json"
        value = digest((json.dumps(projected["repertoires"][pair["id"]], ensure_ascii=False, indent=2) + "\n").encode())
        projected["fingerprints"][path] = value;pair["repertoireSha256"] = value
    result = _check_before_lot6_pack(projected)
    checks = result["checks"]
    actual_hashes = {path: value for path, value in sorted(pack["fingerprints"].items()) if path.startswith(DATA_ROOT + "/")}
    differences, canonical_fields = Counter(), set()
    combined_ids, combined_objects, combined_fields, combined_canonical_ids, combined_canonical_fields = set(), set(), set(), set(), set()
    noncatalogue_canonical_fields, heard_only_changed_fields = Counter(), 0
    combined_phonetic_ids = set()
    annotations = ("phoneticCorrection", "reviewedFieldCorrection", "lot4PhoneticCorrection", "reviewedContentCorrection", "lot5FieldCorrection", "lot5ContentCorrection", "lot6FieldCorrection", "lot6ContentCorrection")
    for pair, path, location, profile, phrase in _runtime_objects(pack):
        if not all(isinstance(phrase.get(field), str) for field in ("id", "study", "native", "phon")):continue
        changed = {"phon"} if "phoneticCorrection" in phrase else set()
        for annotation_name in annotations[1:]:
            annotation = phrase.get(annotation_name)
            if annotation:changed.update(field for field in annotation["fields"] if phrase.get(field) != annotation["beforeFields"].get(field))
        if changed:
            address, identity = (path, location), (pair, phrase["id"])
            combined_ids.add(identity);combined_objects.add(address);combined_fields.update((address, field) for field in changed)
            if "phon" in changed:combined_phonetic_ids.add(identity)
            if profile == "canonical":
                combined_canonical_ids.add(identity);combined_canonical_fields.update((identity, field) for field in changed)
        collection = phrase.get("source", {}).get("collection", "")
        if profile == "received-model" and collection.startswith("situation-received-"):heard_only_changed_fields += len(changed)
        if profile != "canonical":continue
        if collection.startswith("DECKS."):
            card = pack["decks"][PAIR_LANGUAGES[pair][1]][phrase["source"]["sourceIndex"]]
            for field, original in field_map(PAIR_LANGUAGES[pair][1]).items():
                if phrase.get(field) != card.get(original):
                    differences[field] += 1;canonical_fields.add((pair, phrase["id"], field))
        else:noncatalogue_canonical_fields[collection] += len(changed)
    checks.update({"catalogueFieldDifferences": len(canonical_fields),
        "catalogueVerbatimFields": checks["catalogueFieldsCompared"] - len(canonical_fields),
        "cataloguePhoneticFieldDifferences": differences["phon"], "catalogueReadingFieldDifferences": differences["reading"],
        "catalogueStudyFieldDifferences": differences["study"], "catalogueNativeFieldDifferences": differences["native"],
        "catalogueUnauthorizedFieldDifferences": 0, "lot6PhoneticIdentities": 18, "lot6PhoneticEvidenceEvents": 18, "lot6LinkedReadingEvents": 5, "lot6FieldEvidenceEvents": 23,
        "lot6FieldRuntimeObjects": paired_summary["runtimeObjects"], "lot6FieldRuntimeFields": paired_summary["runtimeChangedFields"],
        "lot6GlossIdentities": 45, "lot6ContentBundleIdentities": 2, "lot6ContentEvidenceEvents": 47, "lot6ContentRuntimeObjects": content_summary["runtimeObjects"],
        "lot6ContentRuntimeFields": content_summary["runtimeChangedFields"], "lot6FivePairsAppliedAtomically": True, "lot6TwoContentBundlesAppliedAtomically": True,
        "lot6OrthographicReadingIsNotGlobalBatchimNormalization": True,
        "combinedCorrectedPhoneticIdentities": len(combined_phonetic_ids),
        "combinedCorrectedIdentities": len(combined_ids), "combinedCorrectedRuntimeObjects": len(combined_objects),
        "combinedCorrectedRuntimeFields": len(combined_fields), "combinedCorrectedCanonicalIdentities": len(combined_canonical_ids),
        "combinedCorrectedCanonicalFields": len(combined_canonical_fields), "combinedEvidenceEvents": 774+95+259+35+8+26+23+47,
        "callerPackMutatedByProjection": False, "lot6PlacementLevelsRolesStepsAndAccessUnchanged": True,
        "lot6StudyAndMeaningExceptionsOnlyInSeparateContentRegistry": True,
        "readingAndStudyExceptionsOnlyInExplicitAtomicContentBundles": False,
        "lot4ReadingAndStudyContentExceptionsRemainAtomic": True,
        "allReadingExceptionsAreExplicitlyRegistered": True})
    checks["importedVerbatimFields"] = checks["importedFieldsCompared"] - noncatalogue_canonical_fields["conversation"]
    checks["newEditorialVerbatimFields"] = checks["newEditorialFieldsCompared"] - noncatalogue_canonical_fields["editorial-authored"]
    checks["newSituationVerbatimWholeFields"] = checks["newSituationWholeFieldsCompared"] - sum(noncatalogue_canonical_fields[n] for n in ("situation-authored", "situation-conversation"))
    checks["newSupportVerbatimWholeFields"] = checks["newSupportWholeFieldsCompared"] - sum(noncatalogue_canonical_fields[n] for n in ("situation-support-authored", "situation-support-conversation"))
    checks["newReceivedVerbatimWholeFields"] = checks["newReceivedWholeFieldsCompared"] - heard_only_changed_fields
    for name in ("phoneticCorrections", "reviewedFieldCorrections", "lot4PhoneticCorrections", "reviewedContentCorrections", "lot5FieldCorrections", "lot5ContentCorrections"):
        result[name]["actualRuntimeFileSha256"] = actual_hashes
    result["lot6FieldCorrections"] = {**paired_summary, "actualRuntimeFileSha256": actual_hashes,
        "studyMeaningPlacementAndAccessUnchangedByThisLayer": True, "fivePairedAidsAndReadingsAtomic": True}
    result["lot6ContentCorrections"] = {**content_summary, "actualRuntimeFileSha256": actual_hashes,
        "originalSourcesAndAccessUnchanged": True, "nativeAndStudyBundleExceptionsExplicit": True}
    return result


LOT7_BASE_COMMIT = "d56fe23b4bafd63bbd2d4aefb67896dbc12374a2"
LOT7_EVIDENCE_COMMIT = "dec4e90a01ca40dca2394ac43eb37a4771b011b1"
LOT6_CONTENT_REGISTRY_SHA = "40083b22a87d0ab246b8a979f659e06b777840dcbfca501b95edfe78ea546eb5"
LOT7_CONFIG = {
    "lot7Phonetic": {
        "registryPath": REVIEW_ROOT + "/corrections-phonetiques/lot7/revue-claude-lot7.json",
        "directory": REVIEW_ROOT + "/corrections-phonetiques/lot7",
        "id": "revue-claude-lot7-phonetique", "status": "frozen-whole-phonetic-events-not-global-native-approval",
        "annotation": "lot7PhoneticCorrection", "manifest": "lot7PhoneticCorrections",
        "counts": (228, 228, 228, 228),
        "pins": {"docs/revue-integrale/lot7-fr-en-L1-L10/registre-phonetique.json":
            ("ad4c4aa3db44e56a2d4c493b5779a869362ab495d5359910582c79adbe662c46", "phon")},
    },
    "lot7Content": {
        "registryPath": REVIEW_ROOT + "/corrections-contenu/lot7/revue-contenu-lot7.json",
        "directory": REVIEW_ROOT + "/corrections-contenu/lot7",
        "id": "revue-contenu-lot7", "status": "frozen-certain-gloss-and-linked-bundle-events-not-global-native-approval",
        "annotation": "lot7ContentCorrection", "manifest": "lot7ContentCorrections",
        "counts": (16, 16, 24, 24),
        "pins": {"docs/revue-integrale/lot7-fr-en-L1-L10/lot-contenu-gloses.json":
            ("7492a7da2e909fd83040be2f1f146c5b87b5641ff5b02660a076fe87387af87f", "native")},
    },
}
_LOT7_GIT_DOCUMENTS = {}
_LOT7_BASE_ENTRIES = {}


def _lot7_profile(phrase):
    profile = _lot6_profile(phrase)
    for name in ("lot6ContentCorrection", "lot7PhoneticCorrection"):
        profile[name + "Present"] = name in phrase
        profile[name] = phrase.get(name)
    return profile


def _lot7_git_document(pack, path):
    key = str(pack["root"].resolve()), path
    if key not in _LOT7_GIT_DOCUMENTS:
        raw = subprocess.run(["git", "show", LOT7_BASE_COMMIT + ":" + path], cwd=pack["root"],
                             capture_output=True, check=True).stdout
        _LOT7_GIT_DOCUMENTS[key] = json.loads(raw)
    return _LOT7_GIT_DOCUMENTS[key]


def _lot7_baseline_entries(pack):
    """Reconstruct all source roles/copies from Git, not editable declarations."""
    cache_key = str(pack["root"].resolve())
    if cache_key not in _LOT7_BASE_ENTRIES:
        entries = {}
        for level in range(1, 11):
            path = f"{DATA_ROOT}/fr-en/L{level}.json"
            cell = _lot7_git_document(pack, path)
            for section in ("themes", "heldThemes"):
                for ti, theme in enumerate(cell.get(section, [])):
                    for pi, phrase in enumerate(theme.get("phrases", [])):
                        entries.setdefault(("fr-en", phrase["id"]), {})[(path, (section, ti, "phrases", pi))] = ("canonical", phrase)
            for pi, phrase in enumerate(cell.get("reserve", [])):
                entries.setdefault(("fr-en", phrase["id"]), {})[(path, ("reserve", pi))] = ("canonical", phrase)
        path = f"{DATA_ROOT}/repertoires/fr-en.json"
        bank = _lot7_git_document(pack, path)
        for field, role in (("phrases", "transport-phrase"), ("receivedModels", "received-model")):
            for pi, phrase in enumerate(bank.get(field, [])):
                entries.setdefault(("fr-en", phrase["id"]), {})[(path, (field, pi))] = (role, phrase)
        _LOT7_BASE_ENTRIES[cache_key] = entries
    return _LOT7_BASE_ENTRIES[cache_key]


def _lot7_annotation(name, entry, before, checksum):
    config = LOT7_CONFIG[name]
    return {"id": entry["id"], "registryPath": config["registryPath"], "registrySha256": checksum,
        "baseSnapshotCommit": LOT7_BASE_COMMIT, "evidenceCommits": [LOT7_EVIDENCE_COMMIT],
        "fields": sorted(entry["fields"]),
        "beforeFields": {field: value["before"] for field, value in entry["fields"].items()},
        "originalPhoneticReviewStatusPresent": before["phoneticReviewStatusPresent"],
        "originalPhoneticReviewStatus": before["phoneticReviewStatus"]}


def _lot7_status(entry):
    return "corrected-by-Claude-lot7-" + "+".join(entry["rules"]) if entry["rules"] else "corrected-by-Claude-content-lot7"


def _lot7_declarations(pack, name, prior=None):
    config = LOT7_CONFIG[name]
    registry, raw_registry = pack.get(name + "Registry"), pack.get(name + "RegistryRaw")
    require(isinstance(registry, dict) and isinstance(raw_registry, bytes) and json.loads(raw_registry) == registry,
            "Lot7 registry differs from its loaded bytes")
    checksum = digest(raw_registry)
    require(pack["fingerprints"].get(config["registryPath"]) == checksum, "Lot7 registry fingerprint differs")
    require(registry.get("version") == 1 and registry.get("id") == config["id"]
            and registry.get("status") == config["status"] and registry.get("baseSnapshotCommit") == LOT7_BASE_COMMIT,
            "Lot7 changes its batch identity, before edition, or approval scope")
    require(tuple(registry.get(field) for field in ("correctionCount", "eventCount", "approvedFieldCount", "changedFieldCount"))
            == config["counts"], "Lot7 finite identity/event/field counts differ")
    if name == "lot7Phonetic":
        predecessor = [{"registryPath": LOT6_CONFIG["lot6Content"]["registryPath"],
                        "registrySha256": LOT6_CONTENT_REGISTRY_SHA}]
        require(digest(pack["lot6ContentRegistryRaw"]) == LOT6_CONTENT_REGISTRY_SHA,
                "Lot7 predecessor content registry changed")
    else:
        predecessor = [{"registryPath": LOT7_CONFIG["lot7Phonetic"]["registryPath"], "registrySha256": prior[1]}]
    require(registry.get("appliesAfter") == predecessor, "Lot7 drops or forges its preceding layer")
    descriptors = registry.get("evidenceFiles")
    require(isinstance(descriptors, list) and len(descriptors) == len(config["pins"]), "Lot7 evidence file count differs")
    approved, used_paths, used_git_paths = {}, set(), set()
    for descriptor in descriptors:
        path, git_path = descriptor.get("path"), descriptor.get("gitPath")
        require(isinstance(path, str) and path.startswith(config["directory"] + "/")
                and ".." not in Path(path).parts and path not in used_paths and git_path in config["pins"]
                and git_path not in used_git_paths, "Unknown, duplicated or unsafe lot7 evidence path")
        used_paths.add(path); used_git_paths.add(git_path)
        expected_hash, field = config["pins"][git_path]
        raw = pack.get(name + "EvidenceRaw", {}).get(path)
        require(isinstance(raw, bytes) and digest(raw) == expected_hash
                and pack["fingerprints"].get(path) == expected_hash
                and descriptor == {"path": path, "gitPath": git_path, "gitCommit": LOT7_EVIDENCE_COMMIT, "sha256": expected_hash},
                "Pinned lot7 evidence fingerprint or descriptor differs")
        original = subprocess.run(["git", "show", LOT7_EVIDENCE_COMMIT + ":" + git_path], cwd=pack["root"],
                                  capture_output=True, check=True).stdout
        require(raw == original, "Lot7 evidence differs from pinned Git bytes")
        evidence = json.loads(raw)
        if name == "lot7Phonetic":
            require(evidence.get("eventCount") == 228 and evidence.get("baseSnapshotCommit") == LOT7_BASE_COMMIT,
                    "Lot7 phonetic proof has another count or before edition")
            selected = [("events", index, row) for index, row in enumerate(evidence["events"])]
            rule_counts = Counter(rule for _collection, _index, row in selected for rule in row.get("rules", []))
            require(rule_counts == {"G": 145, "W": 22, "A": 21, "H": 21, "Z": 18, "T": 7},
                    "Lot7 frozen English rule membership changed; G and accent-A are scoped to this proof")
        else:
            require(evidence.get("reference") == LOT7_BASE_COMMIT and evidence.get("certainCount") == 11,
                    "Lot7 content before edition/count differs")
            selected = [("items", index, row) for index, row in enumerate(evidence["items"])
                        if row.get("certainty") == "certain"]
            require(len(selected) == 11 and len(evidence.get("linkedBundles", [])) == 5,
                    "Lot7 certain-only content selection differs")
            selected.extend(("linkedBundles", index, row) for index, row in enumerate(evidence["linkedBundles"]))
        for collection, index, row in selected:
            key = ("fr-en", row.get("id"))
            require(isinstance(key[1], str), "Lot7 proof has no identity")
            if name == "lot7Phonetic":
                require(row.get("pair") == key[0] and type(row.get("priorCorrection")) is bool
                        and isinstance(row.get("rules"), list) and row["rules"]
                        and set(row["rules"]) <= {"G", "W", "A", "H", "Z", "T"}
                        and len(row["rules"]) == len(set(row["rules"])),
                        "Lot7 phonetic pair, prior event, or scoped rules differ")
                changes = {"phon": {"before": row["beforePhon"], "after": row["afterPhon"]}}
            elif collection == "items":
                require(row.get("field") == "native", "Lot7 certain glose changes another field")
                changes = {"native": {"before": row["before"], "after": row["after"]}}
            else:
                require(row.get("certainty") == "certain" and row.get("applyTogether") is True
                        and set(row["before"]) == set(row["after"])
                        and set(row["before"]) in ({"study", "phon"}, {"study", "native", "phon"}),
                        "Lot7 whole study/aid/native content bundle is partial or uncertain")
                changes = {f: {"before": row["before"][f], "after": row["after"][f]}
                           for f in row["before"]}
            entry = approved.setdefault(key, {"fields": {}, "refs": {}, "proofs": {}, "events": []})
            ref = {"evidencePath": path, "evidenceCollection": collection, "evidenceIndex": index}
            entry["events"].append(ref)
            for changed_field, change in changes.items():
                require(isinstance(change["before"], str) and isinstance(change["after"], str)
                        and change["before"] != change["after"], "Lot7 event lacks literal whole changes")
                require(changed_field not in entry["fields"], "Lot7 duplicates a field event")
                entry["fields"][changed_field] = change
                entry["refs"][changed_field] = ref
                entry["proofs"][changed_field] = row
    require(len(approved) == config["counts"][0], "Lot7 approved identity set is incomplete")
    for key, entry in approved.items():
        fields = list(entry["fields"])
        if name == "lot7Phonetic":
            require(set(fields) == {"phon"}, "Lot7 phonetic batch invents a reading or another field")
            entry["rules"] = entry["proofs"]["phon"]["rules"]
        else:
            require(set(fields) in ({"native"}, {"study", "phon"}, {"study", "native", "phon"}),
                    "Lot7 study/aid/native content bundle is partial")
            entry["rules"] = []
        entry["atomicBundle"] = len(fields) > 1
    require(sum(len(e["events"]) for e in approved.values()) == config["counts"][1],
            "Lot7 event coverage differs")
    rows, lookup, locations = registry.get("corrections"), {}, set()
    require(isinstance(rows, list) and len(rows) == config["counts"][0], "Lot7 registry identity coverage differs")
    baseline_entries = _lot7_baseline_entries(pack)
    for entry in rows:
        key = entry.get("pairId"), entry.get("id")
        require(key in approved and key not in lookup, "Unknown or duplicated lot7 identity")
        source = approved[key]
        require(all(entry.get(field) == source[field] for field in ("fields", "events", "rules"))
                and entry.get("atomicBundle") is source["atomicBundle"],
                "Lot7 frozen event pair or certain glose is altered")
        occurrences = entry.get("occurrences")
        require(isinstance(occurrences, list) and occurrences, "Lot7 identity has no occurrences")
        addresses = set()
        for occurrence in occurrences:
            path, location, profile = occurrence.get("path"), occurrence.get("location"), occurrence.get("profile")
            require(isinstance(path, str) and isinstance(location, list) and location
                    and all(type(token) is int and token >= 0 or isinstance(token, str) and token and token not in {"..", "/"}
                            for token in location), "Lot7 occurrence path/location malformed")
            address = path, tuple(location)
            require(address not in locations and address in baseline_entries.get(key, {}),
                    "Lot7 occurrence duplicated or absent from pinned edition")
            locations.add(address); addresses.add(address)
            expected_profile, original = baseline_entries[key][address]
            require(profile == expected_profile, "Lot7 changes an original canonical/transport/received role")
            original = copy.deepcopy(original)
            if prior is not None and key in prior[0]:
                previous = prior[0][key]; before_previous = _lot7_profile(original)
                for field, value in previous["fields"].items():
                    require(original.get(field) == value["before"], "Lot7 content predecessor before differs")
                    original[field] = value["after"]
                original["phoneticReviewStatus"] = _lot7_status(previous)
                original["lot7PhoneticCorrection"] = _lot7_annotation("lot7Phonetic", previous, before_previous, prior[1])
            before = occurrence.get("expectedBefore")
            require(isinstance(before, dict) and set(before) == set(_lot7_profile({})) and before == _lot7_profile(original),
                    "Lot7 original tuple/source/status/prior annotations differ from Git d56fe23")
            for field, value in entry["fields"].items():
                require(before.get(field) == value["before"], "Lot7 field before is not its exact predecessor")
                proof = source["proofs"][field]
                if "study" in proof:
                    require(before["study"] == proof["study"], "Lot7 proof targets another studied phrase")
                if name == "lot7Phonetic":
                    phon_proof = source["proofs"]["phon"]
                    require(before["native"] == phon_proof["native"], "Lot7 phonetic/reading proof changes its meaning")
                    require(any(before.get(name + "Present") for name in ("phoneticCorrection", "reviewedFieldCorrection", "lot4PhoneticCorrection", "reviewedContentCorrection", "lot5FieldCorrection", "lot5ContentCorrection", "lot6FieldCorrection", "lot6ContentCorrection")) is phon_proof["priorCorrection"],
                            "Lot7 prior correction declared incorrectly")
                    anchor = proof["occurrence"]
                    require(any(o["path"] == anchor["path"] and o["location"] == anchor["location"] for o in occurrences),
                            "Lot7 proof anchor is absent from its original roles")
        require(addresses == set(baseline_entries[key]), "Lot7 before declarations omit a source role or transport copy")
        if name == "lot7Phonetic":
            require(sum(role == "transport-phrase" for role, _phrase in baseline_entries[key].values())
                    == source["proofs"]["phon"]["transportCopies"],
                    "Lot7 transport copy count differs from frozen proof")
        lookup[key] = entry
    require(set(lookup) == set(approved), "Lot7 registry omits approved identities")
    counts = config["counts"]
    require(sum(len(entry["fields"]) for entry in rows) == counts[2]
            and sum(value["before"] != value["after"] for entry in rows for value in entry["fields"].values()) == counts[3],
            "Lot7 approved/changed field counts differ")
    declaration = {"registryPath": config["registryPath"], "registrySha256": checksum,
        "baseSnapshotCommit": LOT7_BASE_COMMIT, "appliesAfter": predecessor,
        "correctionCount": counts[0], "eventCount": counts[1], "approvedFieldCount": counts[2],
        "changedFieldCount": counts[3], "evidenceCommits": [LOT7_EVIDENCE_COMMIT]}
    require(pack["manifest"].get(config["manifest"]) == declaration, "Lot7 manifest declaration absent or forged")
    return lookup, checksum, declaration


def _lot7_validate_project(pack, name, data):
    """Check after values, then restore just this layer in an already private pack."""
    config = LOT7_CONFIG[name]; lookup, checksum, declaration = data
    seen, profiles, fields, addresses, profile_counts = Counter(), Counter(), Counter(), set(), Counter()
    canonical_ids = set()
    for pair, path, location, profile, phrase in _runtime_objects(pack):
        key = pair, phrase.get("id")
        actual_phrase = all(isinstance(phrase.get(field), str) for field in ("id", "study", "native", "phon"))
        if not actual_phrase or key not in lookup:
            require(config["annotation"] not in phrase, "Stray lot7 annotation outside its identity")
            continue
        entry = lookup[key]; annotation = phrase.get(config["annotation"])
        require(isinstance(annotation, dict), "Lot7 corrected card/copy lacks exact annotation")
        restored = copy.deepcopy(phrase);restored.pop(config["annotation"], None)
        restored.update({field: value["before"] for field, value in entry["fields"].items()})
        candidates = []
        for occurrence in entry["occurrences"]:
            if occurrence["profile"] != profile and not (profile == "transport-phrase" and occurrence["profile"] == "canonical"):
                continue
            before = occurrence["expectedBefore"]
            if "phon" in entry["fields"]:
                if before["phoneticReviewStatusPresent"]:restored["phoneticReviewStatus"] = before["phoneticReviewStatus"]
                else:restored.pop("phoneticReviewStatus", None)
            if _lot7_profile(restored) == before:candidates.append(before)
        require(candidates, "Lot7 before tuple, provenance, status or earlier annotations altered")
        before = candidates[0]
        require(annotation == _lot7_annotation(name, entry, before, checksum), "Lot7 annotation before/hash/fields changed")
        for field, value in entry["fields"].items():
            require(phrase.get(field) == value["after"], "Lot7 actual after differs, or aid/reading pair is partial")
            fields[(profile, field)] += 1
        if "phon" in entry["fields"]:
            require(phrase.get("phoneticReviewStatus") == _lot7_status(entry), "Lot7 paired local phonetic status changed")
        else:
            require(("phoneticReviewStatus" in phrase) == before["phoneticReviewStatusPresent"]
                    and phrase.get("phoneticReviewStatus") == before["phoneticReviewStatus"],
                    "Lot7 native-only glose invents a phonetic status")
        if profile == "canonical":
            require(key not in canonical_ids, "Duplicate lot7 canonical identity")
            canonical_ids.add(key)
        seen[key] += 1;profiles[profile] += 1;profile_counts[(key, profile)] += 1;addresses.add((path, location))
        phrase.update({field: value["before"] for field, value in entry["fields"].items()})
        if "phon" in entry["fields"]:
            if before["phoneticReviewStatusPresent"]:phrase["phoneticReviewStatus"] = before["phoneticReviewStatus"]
            else:phrase.pop("phoneticReviewStatus", None)
        del phrase[config["annotation"]]
    require(set(seen) == set(lookup), "Lot7 declared identity missing from actual runtime")
    for key, entry in lookup.items():
        expected = Counter(row["profile"] for row in entry["occurrences"])
        for profile in ("canonical", "received-model"):
            require(profile_counts[(key, profile)] == expected[profile], "Lot7 canonical/received occurrence missing or duplicated")
        require(profile_counts[(key, "transport-phrase")] >= expected["transport-phrase"], "Lot7 transport copy missing")
    pack["manifest"].pop(config["manifest"])
    return {**declaration, "runtimeObjects": sum(profiles.values()),
        "runtimeProfiles": {profile: profiles[profile] for profile in ("canonical", "transport-phrase", "received-model")},
        "runtimeApprovedFields": sum(fields.values()), "runtimeChangedFields": sum(fields.values()),
        "canonicalChangedFields": sum(n for (profile, _), n in fields.items() if profile == "canonical"),
        "fieldProfiles": {profile: {field: fields[(profile, field)] for field in ("study", "native", "phon", "reading")}
                          for profile in ("canonical", "transport-phrase", "received-model")},
        "validation": "pinned literal whole aids and certain content, Git d56fe23 full before profiles, actual after before private content→phonetic→older layers projection",
        "globalNativeApproval": False}


def _check_before_lot8_pack(pack):
    """Validate both lot7 layers without mutating caller data or older sources."""
    paired = _lot7_declarations(pack, "lot7Phonetic")
    content = _lot7_declarations(pack, "lot7Content", paired)
    for pair in pack["manifest"]["pairs"]:
        path = f"{DATA_ROOT}/repertoires/{pair['id']}.json"
        require(pair.get("repertoireSha256") == pack["fingerprints"].get(path), "Actual lot7 bank fingerprint differs from manifest")
    keys = set(paired[0]) | set(content[0])
    changed_paths = {path for pair, path, _location, _profile, phrase in _runtime_objects(pack)
                     if (pair, phrase.get("id")) in keys
                     and all(isinstance(phrase.get(field), str) for field in ("study", "native", "phon"))}
    projected = _private_runtime_copy(pack, changed_paths)
    content_summary = _lot7_validate_project(projected, "lot7Content", content)
    paired_summary = _lot7_validate_project(projected, "lot7Phonetic", paired)
    for pair in projected["manifest"]["pairs"]:
        path = f"{DATA_ROOT}/repertoires/{pair['id']}.json"
        value = digest((json.dumps(projected["repertoires"][pair["id"]], ensure_ascii=False, indent=2) + "\n").encode())
        projected["fingerprints"][path] = value;pair["repertoireSha256"] = value
    result = _check_before_lot7_pack(projected)
    checks = result["checks"]
    actual_hashes = {path: value for path, value in sorted(pack["fingerprints"].items()) if path.startswith(DATA_ROOT + "/")}
    differences, canonical_fields = Counter(), set()
    combined_ids, combined_objects, combined_fields, combined_canonical_ids, combined_canonical_fields = set(), set(), set(), set(), set()
    noncatalogue_canonical_fields, heard_only_changed_fields = Counter(), 0
    combined_phonetic_ids = set()
    annotations = ("phoneticCorrection", "reviewedFieldCorrection", "lot4PhoneticCorrection", "reviewedContentCorrection", "lot5FieldCorrection", "lot5ContentCorrection", "lot6FieldCorrection", "lot6ContentCorrection", "lot7PhoneticCorrection", "lot7ContentCorrection")
    for pair, path, location, profile, phrase in _runtime_objects(pack):
        if not all(isinstance(phrase.get(field), str) for field in ("id", "study", "native", "phon")):continue
        changed = {"phon"} if "phoneticCorrection" in phrase else set()
        for annotation_name in annotations[1:]:
            annotation = phrase.get(annotation_name)
            if annotation:changed.update(field for field in annotation["fields"] if phrase.get(field) != annotation["beforeFields"].get(field))
        if changed:
            address, identity = (path, location), (pair, phrase["id"])
            combined_ids.add(identity);combined_objects.add(address);combined_fields.update((address, field) for field in changed)
            if "phon" in changed:combined_phonetic_ids.add(identity)
            if profile == "canonical":
                combined_canonical_ids.add(identity);combined_canonical_fields.update((identity, field) for field in changed)
        collection = phrase.get("source", {}).get("collection", "")
        if profile == "received-model" and collection.startswith("situation-received-"):heard_only_changed_fields += len(changed)
        if profile != "canonical":continue
        if collection.startswith("DECKS."):
            card = pack["decks"][PAIR_LANGUAGES[pair][1]][phrase["source"]["sourceIndex"]]
            for field, original in field_map(PAIR_LANGUAGES[pair][1]).items():
                if phrase.get(field) != card.get(original):
                    differences[field] += 1;canonical_fields.add((pair, phrase["id"], field))
        else:noncatalogue_canonical_fields[collection] += len(changed)
    checks.update({"catalogueFieldDifferences": len(canonical_fields),
        "catalogueVerbatimFields": checks["catalogueFieldsCompared"] - len(canonical_fields),
        "cataloguePhoneticFieldDifferences": differences["phon"], "catalogueReadingFieldDifferences": differences["reading"],
        "catalogueStudyFieldDifferences": differences["study"], "catalogueNativeFieldDifferences": differences["native"],
        "catalogueUnauthorizedFieldDifferences": 0,
        "lot7PhoneticIdentities": 228, "lot7PhoneticEvidenceEvents": 228,
        "lot7PhoneticRuntimeObjects": paired_summary["runtimeObjects"],
        "lot7PhoneticRuntimeFields": paired_summary["runtimeChangedFields"],
        "lot7PhoneticCanonicalObjects": paired_summary["runtimeProfiles"]["canonical"],
        "lot7PhoneticTransportObjects": paired_summary["runtimeProfiles"]["transport-phrase"],
        "lot7PhoneticReceivedObjects": paired_summary["runtimeProfiles"]["received-model"],
        "lot7GlossIdentities": 11, "lot7ContentBundleIdentities": 5,
        "lot7ContentEvidenceEvents": 16, "lot7ContentRuntimeObjects": content_summary["runtimeObjects"],
        "lot7ContentRuntimeFields": content_summary["runtimeChangedFields"],
        "lot7FiveStudyAidNativeBundlesAppliedAtomically": True,
        "lot7ReadingsUnchanged": True, "lot7EnglishAccentRuleAHasSeparateNamespace": True,
        "lot7OnlyFiniteWholeEventsAppliedNoRuleExtension": True,
        "combinedCorrectedPhoneticIdentities": len(combined_phonetic_ids),
        "combinedCorrectedIdentities": len(combined_ids), "combinedCorrectedRuntimeObjects": len(combined_objects),
        "combinedCorrectedRuntimeFields": len(combined_fields), "combinedCorrectedCanonicalIdentities": len(combined_canonical_ids),
        "combinedCorrectedCanonicalFields": len(combined_canonical_fields),
        "combinedEvidenceEvents": 774+95+259+35+8+26+23+47+228+16,
        "callerPackMutatedByProjection": False, "lot7PlacementLevelsRolesStepsAndAccessUnchanged": True,
        "lot7StudyAndMeaningExceptionsOnlyInSeparateContentRegistry": True,
        "allReadingExceptionsAreExplicitlyRegistered": True})
    checks["importedVerbatimFields"] = checks["importedFieldsCompared"] - noncatalogue_canonical_fields["conversation"]
    checks["newEditorialVerbatimFields"] = checks["newEditorialFieldsCompared"] - noncatalogue_canonical_fields["editorial-authored"]
    checks["newSituationVerbatimWholeFields"] = checks["newSituationWholeFieldsCompared"] - sum(noncatalogue_canonical_fields[n] for n in ("situation-authored", "situation-conversation"))
    checks["newSupportVerbatimWholeFields"] = checks["newSupportWholeFieldsCompared"] - sum(noncatalogue_canonical_fields[n] for n in ("situation-support-authored", "situation-support-conversation"))
    checks["newReceivedVerbatimWholeFields"] = checks["newReceivedWholeFieldsCompared"] - heard_only_changed_fields
    for name in ("phoneticCorrections", "reviewedFieldCorrections", "lot4PhoneticCorrections", "reviewedContentCorrections", "lot5FieldCorrections", "lot5ContentCorrections", "lot6FieldCorrections", "lot6ContentCorrections"):
        result[name]["actualRuntimeFileSha256"] = actual_hashes
    result["lot7PhoneticCorrections"] = {**paired_summary, "actualRuntimeFileSha256": actual_hashes,
        "studyMeaningReadingPlacementAndAccessUnchangedByThisLayer": True, "onlyWholePhoneticEventsNoBroadRules": True}
    result["lot7ContentCorrections"] = {**content_summary, "actualRuntimeFileSha256": actual_hashes,
        "originalSourcesAndAccessUnchanged": True, "fiveWholeStudyAidNativeBundlesAtomic": True}
    return result



LOT8_BASE_COMMIT = "224e45948ac3739066f34178375b2e4437197e90"
LOT8_EVIDENCE_COMMIT = "e12c600f97a6339a0566cdaf879aa0d449f96284"
LOT7_CONTENT_REGISTRY_SHA = "68a81f3568ba85f1de5f0ca3e2f5494728f65e806536e36f136376b22fac22a0"
LOT8_CONFIG = {
    "lot8Phonetic": {
        "registryPath": REVIEW_ROOT + "/corrections-phonetiques/lot8/revue-claude-lot8.json",
        "directory": REVIEW_ROOT + "/corrections-phonetiques/lot8",
        "id": "revue-claude-lot8-phonetique", "status": "frozen-whole-phonetic-events-not-global-native-approval",
        "annotation": "lot8PhoneticCorrection", "manifest": "lot8PhoneticCorrections",
        "counts": (63, 63, 63, 63),
        "pins": {"docs/revue-integrale/lot8-fr-es-L1-L10/registre-phonetique.json":
            ("3bdbb4a152ab80fea877bec8f1a6f70e88ea69c2f3bdb88f781ea9bd77992da6", "phon")},
    },
    "lot8Content": {
        "registryPath": REVIEW_ROOT + "/corrections-contenu/lot8/revue-contenu-lot8.json",
        "directory": REVIEW_ROOT + "/corrections-contenu/lot8",
        "id": "revue-contenu-lot8", "status": "frozen-certain-gloss-and-linked-bundle-events-not-global-native-approval",
        "annotation": "lot8ContentCorrection", "manifest": "lot8ContentCorrections",
        "counts": (23, 23, 27, 27),
        "pins": {"docs/revue-integrale/lot8-fr-es-L1-L10/lot-contenu-gloses.json":
            ("4c078120ce79094af6d968c6c3ac590cb01958eb3f9dfe9e5152d4e35c3ae821", "native")},
    },
}
_LOT8_GIT_DOCUMENTS = {}
_LOT8_BASE_ENTRIES = {}


def _lot8_profile(phrase):
    profile = _lot7_profile(phrase)
    for name in ("lot7ContentCorrection", "lot8PhoneticCorrection"):
        profile[name + "Present"] = name in phrase
        profile[name] = phrase.get(name)
    return profile


def _lot8_git_document(pack, path):
    key = str(pack["root"].resolve()), path
    if key not in _LOT8_GIT_DOCUMENTS:
        raw = subprocess.run(["git", "show", LOT8_BASE_COMMIT + ":" + path], cwd=pack["root"],
                             capture_output=True, check=True).stdout
        _LOT8_GIT_DOCUMENTS[key] = json.loads(raw)
    return _LOT8_GIT_DOCUMENTS[key]


def _lot8_baseline_entries(pack):
    """Reconstruct all source roles/copies from Git, not editable declarations."""
    cache_key = str(pack["root"].resolve())
    if cache_key not in _LOT8_BASE_ENTRIES:
        entries = {}
        for level in range(1, 11):
            path = f"{DATA_ROOT}/fr-es/L{level}.json"
            cell = _lot8_git_document(pack, path)
            for section in ("themes", "heldThemes"):
                for ti, theme in enumerate(cell.get(section, [])):
                    for pi, phrase in enumerate(theme.get("phrases", [])):
                        entries.setdefault(("fr-es", phrase["id"]), {})[(path, (section, ti, "phrases", pi))] = ("canonical", phrase)
            for pi, phrase in enumerate(cell.get("reserve", [])):
                entries.setdefault(("fr-es", phrase["id"]), {})[(path, ("reserve", pi))] = ("canonical", phrase)
        path = f"{DATA_ROOT}/repertoires/fr-es.json"
        bank = _lot8_git_document(pack, path)
        for field, role in (("phrases", "transport-phrase"), ("receivedModels", "received-model")):
            for pi, phrase in enumerate(bank.get(field, [])):
                entries.setdefault(("fr-es", phrase["id"]), {})[(path, (field, pi))] = (role, phrase)
        _LOT8_BASE_ENTRIES[cache_key] = entries
    return _LOT8_BASE_ENTRIES[cache_key]


def _lot8_annotation(name, entry, before, checksum):
    config = LOT8_CONFIG[name]
    return {"id": entry["id"], "registryPath": config["registryPath"], "registrySha256": checksum,
        "baseSnapshotCommit": LOT8_BASE_COMMIT, "evidenceCommits": [LOT8_EVIDENCE_COMMIT],
        "fields": sorted(entry["fields"]),
        "beforeFields": {field: value["before"] for field, value in entry["fields"].items()},
        "originalPhoneticReviewStatusPresent": before["phoneticReviewStatusPresent"],
        "originalPhoneticReviewStatus": before["phoneticReviewStatus"]}


def _lot8_status(entry):
    return "corrected-by-Claude-lot8-" + "+".join(entry["rules"]) if entry["rules"] else "corrected-by-Claude-content-lot8"


def _lot8_declarations(pack, name, prior=None):
    config = LOT8_CONFIG[name]
    registry, raw_registry = pack.get(name + "Registry"), pack.get(name + "RegistryRaw")
    require(isinstance(registry, dict) and isinstance(raw_registry, bytes) and json.loads(raw_registry) == registry,
            "Lot8 registry differs from its loaded bytes")
    checksum = digest(raw_registry)
    require(pack["fingerprints"].get(config["registryPath"]) == checksum, "Lot8 registry fingerprint differs")
    require(registry.get("version") == 1 and registry.get("id") == config["id"]
            and registry.get("status") == config["status"] and registry.get("baseSnapshotCommit") == LOT8_BASE_COMMIT,
            "Lot8 changes its batch identity, before edition, or approval scope")
    require(tuple(registry.get(field) for field in ("correctionCount", "eventCount", "approvedFieldCount", "changedFieldCount"))
            == config["counts"], "Lot8 finite identity/event/field counts differ")
    if name == "lot8Phonetic":
        predecessor = [{"registryPath": LOT7_CONFIG["lot7Content"]["registryPath"],
                        "registrySha256": LOT7_CONTENT_REGISTRY_SHA}]
        require(digest(pack["lot7ContentRegistryRaw"]) == LOT7_CONTENT_REGISTRY_SHA,
                "Lot8 predecessor content registry changed")
    else:
        predecessor = [{"registryPath": LOT8_CONFIG["lot8Phonetic"]["registryPath"], "registrySha256": prior[1]}]
    require(registry.get("appliesAfter") == predecessor, "Lot8 drops or forges its preceding layer")
    descriptors = registry.get("evidenceFiles")
    require(isinstance(descriptors, list) and len(descriptors) == len(config["pins"]), "Lot8 evidence file count differs")
    approved, used_paths, used_git_paths = {}, set(), set()
    for descriptor in descriptors:
        path, git_path = descriptor.get("path"), descriptor.get("gitPath")
        require(isinstance(path, str) and path.startswith(config["directory"] + "/")
                and ".." not in Path(path).parts and path not in used_paths and git_path in config["pins"]
                and git_path not in used_git_paths, "Unknown, duplicated or unsafe lot8 evidence path")
        used_paths.add(path); used_git_paths.add(git_path)
        expected_hash, field = config["pins"][git_path]
        raw = pack.get(name + "EvidenceRaw", {}).get(path)
        require(isinstance(raw, bytes) and digest(raw) == expected_hash
                and pack["fingerprints"].get(path) == expected_hash
                and descriptor == {"path": path, "gitPath": git_path, "gitCommit": LOT8_EVIDENCE_COMMIT, "sha256": expected_hash},
                "Pinned lot8 evidence fingerprint or descriptor differs")
        original = subprocess.run(["git", "show", LOT8_EVIDENCE_COMMIT + ":" + git_path], cwd=pack["root"],
                                  capture_output=True, check=True).stdout
        require(raw == original, "Lot8 evidence differs from pinned Git bytes")
        evidence = json.loads(raw)
        if name == "lot8Phonetic":
            require(evidence.get("eventCount") == 63 and evidence.get("baseSnapshotCommit") == LOT8_BASE_COMMIT,
                    "Lot8 phonetic proof has another count or before edition")
            selected = [("events", index, row) for index, row in enumerate(evidence["events"])]
            rule_counts = Counter(rule for _collection, _index, row in selected for rule in row.get("rules", []))
            require(rule_counts == {"S": 31, "G": 11, "R": 10, "A": 9, "T": 2},
                    "Lot8 frozen Spanish rule membership changed; R and accent-A are finite labels scoped to this proof")
        else:
            require(evidence.get("reference") == LOT8_BASE_COMMIT and evidence.get("certainCount") == 20,
                    "Lot8 content before edition/count differs")
            selected = [("items", index, row) for index, row in enumerate(evidence["items"])
                        if row.get("certainty") == "certain"]
            require(len(selected) == 20 and len(evidence.get("linkedBundles", [])) == 3,
                    "Lot8 certain-only content selection differs")
            selected.extend(("linkedBundles", index, row) for index, row in enumerate(evidence["linkedBundles"]))
        for collection, index, row in selected:
            key = ("fr-es", row.get("id"))
            require(isinstance(key[1], str), "Lot8 proof has no identity")
            if name == "lot8Phonetic":
                require(row.get("pair") == key[0] and type(row.get("priorCorrection")) is bool
                        and isinstance(row.get("rules"), list) and row["rules"]
                        and set(row["rules"]) <= {"S", "G", "R", "A", "T"}
                        and len(row["rules"]) == len(set(row["rules"])),
                        "Lot8 phonetic pair, prior event, or scoped rules differ")
                changes = {"phon": {"before": row["beforePhon"], "after": row["afterPhon"]}}
            elif collection == "items":
                require(row.get("field") in {"native", "study"}, "Lot8 certain content invents another field")
                field = row["field"]
                if field == "study":
                    require(row["id"] in {"catalogue:es:661", "catalogue:es:875"}
                            and row["study"] == row["before"]
                            and row["after"] == "¡" + row["before"].removesuffix(".") + "!",
                            "Lot8 study-only event changes more than its declared exclamation punctuation")
                changes = {field: {"before": row["before"], "after": row["after"]}}
            else:
                require(row.get("certainty") == "certain" and row.get("applyTogether") is True
                        and set(row["before"]) == set(row["after"])
                        and set(row["before"]) in ({"study", "phon"}, {"study", "native", "phon"}),
                        "Lot8 whole study/aid/native content bundle is partial or uncertain")
                changes = {f: {"before": row["before"][f], "after": row["after"][f]}
                           for f in row["before"]}
            entry = approved.setdefault(key, {"fields": {}, "refs": {}, "proofs": {}, "events": []})
            ref = {"evidencePath": path, "evidenceCollection": collection, "evidenceIndex": index}
            entry["events"].append(ref)
            for changed_field, change in changes.items():
                require(isinstance(change["before"], str) and isinstance(change["after"], str)
                        and change["before"] != change["after"], "Lot8 event lacks literal whole changes")
                require(changed_field not in entry["fields"], "Lot8 duplicates a field event")
                entry["fields"][changed_field] = change
                entry["refs"][changed_field] = ref
                entry["proofs"][changed_field] = row
    require(len(approved) == config["counts"][0], "Lot8 approved identity set is incomplete")
    for key, entry in approved.items():
        fields = list(entry["fields"])
        if name == "lot8Phonetic":
            require(set(fields) == {"phon"}, "Lot8 phonetic batch invents a reading or another field")
            entry["rules"] = entry["proofs"]["phon"]["rules"]
        else:
            require(set(fields) in ({"native"}, {"study"}, {"study", "phon"}, {"study", "native", "phon"}),
                    "Lot8 study/aid/native content bundle is partial")
            entry["rules"] = []
        entry["atomicBundle"] = len(fields) > 1
    require(sum(len(e["events"]) for e in approved.values()) == config["counts"][1],
            "Lot8 event coverage differs")
    rows, lookup, locations = registry.get("corrections"), {}, set()
    require(isinstance(rows, list) and len(rows) == config["counts"][0], "Lot8 registry identity coverage differs")
    baseline_entries = _lot8_baseline_entries(pack)
    for entry in rows:
        key = entry.get("pairId"), entry.get("id")
        require(key in approved and key not in lookup, "Unknown or duplicated lot8 identity")
        source = approved[key]
        require(all(entry.get(field) == source[field] for field in ("fields", "events", "rules"))
                and entry.get("atomicBundle") is source["atomicBundle"],
                "Lot8 frozen event pair or certain glose is altered")
        occurrences = entry.get("occurrences")
        require(isinstance(occurrences, list) and occurrences, "Lot8 identity has no occurrences")
        addresses = set()
        for occurrence in occurrences:
            path, location, profile = occurrence.get("path"), occurrence.get("location"), occurrence.get("profile")
            require(isinstance(path, str) and isinstance(location, list) and location
                    and all(type(token) is int and token >= 0 or isinstance(token, str) and token and token not in {"..", "/"}
                            for token in location), "Lot8 occurrence path/location malformed")
            address = path, tuple(location)
            require(address not in locations and address in baseline_entries.get(key, {}),
                    "Lot8 occurrence duplicated or absent from pinned edition")
            locations.add(address); addresses.add(address)
            expected_profile, original = baseline_entries[key][address]
            require(profile == expected_profile, "Lot8 changes an original canonical/transport/received role")
            original = copy.deepcopy(original)
            if prior is not None and key in prior[0]:
                previous = prior[0][key]; before_previous = _lot8_profile(original)
                for field, value in previous["fields"].items():
                    require(original.get(field) == value["before"], "Lot8 content predecessor before differs")
                    original[field] = value["after"]
                original["phoneticReviewStatus"] = _lot8_status(previous)
                original["lot8PhoneticCorrection"] = _lot8_annotation("lot8Phonetic", previous, before_previous, prior[1])
            before = occurrence.get("expectedBefore")
            require(isinstance(before, dict) and set(before) == set(_lot8_profile({})) and before == _lot8_profile(original),
                    "Lot8 original tuple/source/status/prior annotations differ from Git 224e459")
            for field, value in entry["fields"].items():
                require(before.get(field) == value["before"], "Lot8 field before is not its exact predecessor")
                proof = source["proofs"][field]
                if "study" in proof:
                    require(before["study"] == proof["study"], "Lot8 proof targets another studied phrase")
                if name == "lot8Phonetic":
                    phon_proof = source["proofs"]["phon"]
                    require(before["native"] == phon_proof["native"], "Lot8 phonetic/reading proof changes its meaning")
                    require(any(before.get(name + "Present") for name in ("phoneticCorrection", "reviewedFieldCorrection", "lot4PhoneticCorrection", "reviewedContentCorrection", "lot5FieldCorrection", "lot5ContentCorrection", "lot6FieldCorrection", "lot6ContentCorrection", "lot7PhoneticCorrection", "lot7ContentCorrection")) is phon_proof["priorCorrection"],
                            "Lot8 prior correction declared incorrectly")
                    anchor = proof["occurrence"]
                    require(any(o["path"] == anchor["path"] and o["location"] == anchor["location"] for o in occurrences),
                            "Lot8 proof anchor is absent from its original roles")
        require(addresses == set(baseline_entries[key]), "Lot8 before declarations omit a source role or transport copy")
        if name == "lot8Phonetic":
            require(sum(role == "transport-phrase" for role, _phrase in baseline_entries[key].values())
                    == source["proofs"]["phon"]["transportCopies"],
                    "Lot8 transport copy count differs from frozen proof")
        lookup[key] = entry
    require(set(lookup) == set(approved), "Lot8 registry omits approved identities")
    counts = config["counts"]
    require(sum(len(entry["fields"]) for entry in rows) == counts[2]
            and sum(value["before"] != value["after"] for entry in rows for value in entry["fields"].values()) == counts[3],
            "Lot8 approved/changed field counts differ")
    declaration = {"registryPath": config["registryPath"], "registrySha256": checksum,
        "baseSnapshotCommit": LOT8_BASE_COMMIT, "appliesAfter": predecessor,
        "correctionCount": counts[0], "eventCount": counts[1], "approvedFieldCount": counts[2],
        "changedFieldCount": counts[3], "evidenceCommits": [LOT8_EVIDENCE_COMMIT]}
    require(pack["manifest"].get(config["manifest"]) == declaration, "Lot8 manifest declaration absent or forged")
    return lookup, checksum, declaration


def _lot8_validate_project(pack, name, data):
    """Check after values, then restore just this layer in an already private pack."""
    config = LOT8_CONFIG[name]; lookup, checksum, declaration = data
    seen, profiles, fields, addresses, profile_counts = Counter(), Counter(), Counter(), set(), Counter()
    canonical_ids = set()
    for pair, path, location, profile, phrase in _runtime_objects(pack):
        key = pair, phrase.get("id")
        actual_phrase = all(isinstance(phrase.get(field), str) for field in ("id", "study", "native", "phon"))
        if not actual_phrase or key not in lookup:
            require(config["annotation"] not in phrase, "Stray lot8 annotation outside its identity")
            continue
        entry = lookup[key]; annotation = phrase.get(config["annotation"])
        require(isinstance(annotation, dict), "Lot8 corrected card/copy lacks exact annotation")
        restored = copy.deepcopy(phrase);restored.pop(config["annotation"], None)
        restored.update({field: value["before"] for field, value in entry["fields"].items()})
        candidates = []
        for occurrence in entry["occurrences"]:
            if occurrence["profile"] != profile and not (profile == "transport-phrase" and occurrence["profile"] == "canonical"):
                continue
            before = occurrence["expectedBefore"]
            if "phon" in entry["fields"]:
                if before["phoneticReviewStatusPresent"]:restored["phoneticReviewStatus"] = before["phoneticReviewStatus"]
                else:restored.pop("phoneticReviewStatus", None)
            if _lot8_profile(restored) == before:candidates.append(before)
        require(candidates, "Lot8 before tuple, provenance, status or earlier annotations altered")
        before = candidates[0]
        require(annotation == _lot8_annotation(name, entry, before, checksum), "Lot8 annotation before/hash/fields changed")
        for field, value in entry["fields"].items():
            require(phrase.get(field) == value["after"], "Lot8 actual after differs, or aid/reading pair is partial")
            fields[(profile, field)] += 1
        if "phon" in entry["fields"]:
            require(phrase.get("phoneticReviewStatus") == _lot8_status(entry), "Lot8 paired local phonetic status changed")
        else:
            require(("phoneticReviewStatus" in phrase) == before["phoneticReviewStatusPresent"]
                    and phrase.get("phoneticReviewStatus") == before["phoneticReviewStatus"],
                    "Lot8 content without phon change invents a phonetic status")
        if profile == "canonical":
            require(key not in canonical_ids, "Duplicate lot8 canonical identity")
            canonical_ids.add(key)
        seen[key] += 1;profiles[profile] += 1;profile_counts[(key, profile)] += 1;addresses.add((path, location))
        phrase.update({field: value["before"] for field, value in entry["fields"].items()})
        if "phon" in entry["fields"]:
            if before["phoneticReviewStatusPresent"]:phrase["phoneticReviewStatus"] = before["phoneticReviewStatus"]
            else:phrase.pop("phoneticReviewStatus", None)
        del phrase[config["annotation"]]
    require(set(seen) == set(lookup), "Lot8 declared identity missing from actual runtime")
    for key, entry in lookup.items():
        expected = Counter(row["profile"] for row in entry["occurrences"])
        for profile in ("canonical", "received-model"):
            require(profile_counts[(key, profile)] == expected[profile], "Lot8 canonical/received occurrence missing or duplicated")
        require(profile_counts[(key, "transport-phrase")] >= expected["transport-phrase"], "Lot8 transport copy missing")
    pack["manifest"].pop(config["manifest"])
    return {**declaration, "runtimeObjects": sum(profiles.values()),
        "runtimeProfiles": {profile: profiles[profile] for profile in ("canonical", "transport-phrase", "received-model")},
        "runtimeApprovedFields": sum(fields.values()), "runtimeChangedFields": sum(fields.values()),
        "canonicalChangedFields": sum(n for (profile, _), n in fields.items() if profile == "canonical"),
        "fieldProfiles": {profile: {field: fields[(profile, field)] for field in ("study", "native", "phon", "reading")}
                          for profile in ("canonical", "transport-phrase", "received-model")},
        "validation": "pinned literal whole aids and certain content, Git 224e459 full before profiles, actual after before private content→phonetic→older layers projection",
        "globalNativeApproval": False}


def check_pack(pack):
    """Validate both lot8 layers without mutating caller data or older sources."""
    paired = _lot8_declarations(pack, "lot8Phonetic")
    content = _lot8_declarations(pack, "lot8Content", paired)
    for pair in pack["manifest"]["pairs"]:
        path = f"{DATA_ROOT}/repertoires/{pair['id']}.json"
        require(pair.get("repertoireSha256") == pack["fingerprints"].get(path), "Actual lot8 bank fingerprint differs from manifest")
    keys = set(paired[0]) | set(content[0])
    changed_paths = {path for pair, path, _location, _profile, phrase in _runtime_objects(pack)
                     if (pair, phrase.get("id")) in keys
                     and all(isinstance(phrase.get(field), str) for field in ("study", "native", "phon"))}
    projected = _private_runtime_copy(pack, changed_paths)
    content_summary = _lot8_validate_project(projected, "lot8Content", content)
    paired_summary = _lot8_validate_project(projected, "lot8Phonetic", paired)
    for pair in projected["manifest"]["pairs"]:
        path = f"{DATA_ROOT}/repertoires/{pair['id']}.json"
        value = digest((json.dumps(projected["repertoires"][pair["id"]], ensure_ascii=False, indent=2) + "\n").encode())
        projected["fingerprints"][path] = value;pair["repertoireSha256"] = value
    result = _check_before_lot8_pack(projected)
    checks = result["checks"]
    actual_hashes = {path: value for path, value in sorted(pack["fingerprints"].items()) if path.startswith(DATA_ROOT + "/")}
    differences, canonical_fields = Counter(), set()
    combined_ids, combined_objects, combined_fields, combined_canonical_ids, combined_canonical_fields = set(), set(), set(), set(), set()
    noncatalogue_canonical_fields, heard_only_changed_fields = Counter(), 0
    combined_phonetic_ids = set()
    annotations = ("phoneticCorrection", "reviewedFieldCorrection", "lot4PhoneticCorrection", "reviewedContentCorrection", "lot5FieldCorrection", "lot5ContentCorrection", "lot6FieldCorrection", "lot6ContentCorrection", "lot7PhoneticCorrection", "lot7ContentCorrection", "lot8PhoneticCorrection", "lot8ContentCorrection")
    for pair, path, location, profile, phrase in _runtime_objects(pack):
        if not all(isinstance(phrase.get(field), str) for field in ("id", "study", "native", "phon")):continue
        changed = {"phon"} if "phoneticCorrection" in phrase else set()
        for annotation_name in annotations[1:]:
            annotation = phrase.get(annotation_name)
            if annotation:changed.update(field for field in annotation["fields"] if phrase.get(field) != annotation["beforeFields"].get(field))
        if changed:
            address, identity = (path, location), (pair, phrase["id"])
            combined_ids.add(identity);combined_objects.add(address);combined_fields.update((address, field) for field in changed)
            if "phon" in changed:combined_phonetic_ids.add(identity)
            if profile == "canonical":
                combined_canonical_ids.add(identity);combined_canonical_fields.update((identity, field) for field in changed)
        collection = phrase.get("source", {}).get("collection", "")
        if profile == "received-model" and collection.startswith("situation-received-"):heard_only_changed_fields += len(changed)
        if profile != "canonical":continue
        if collection.startswith("DECKS."):
            card = pack["decks"][PAIR_LANGUAGES[pair][1]][phrase["source"]["sourceIndex"]]
            for field, original in field_map(PAIR_LANGUAGES[pair][1]).items():
                if phrase.get(field) != card.get(original):
                    differences[field] += 1;canonical_fields.add((pair, phrase["id"], field))
        else:noncatalogue_canonical_fields[collection] += len(changed)
    checks.update({"catalogueFieldDifferences": len(canonical_fields),
        "catalogueVerbatimFields": checks["catalogueFieldsCompared"] - len(canonical_fields),
        "cataloguePhoneticFieldDifferences": differences["phon"], "catalogueReadingFieldDifferences": differences["reading"],
        "catalogueStudyFieldDifferences": differences["study"], "catalogueNativeFieldDifferences": differences["native"],
        "catalogueUnauthorizedFieldDifferences": 0,
        "lot8PhoneticIdentities": 63, "lot8PhoneticEvidenceEvents": 63,
        "lot8PhoneticRuntimeObjects": paired_summary["runtimeObjects"],
        "lot8PhoneticRuntimeFields": paired_summary["runtimeChangedFields"],
        "lot8PhoneticCanonicalObjects": paired_summary["runtimeProfiles"]["canonical"],
        "lot8PhoneticTransportObjects": paired_summary["runtimeProfiles"]["transport-phrase"],
        "lot8PhoneticReceivedObjects": paired_summary["runtimeProfiles"]["received-model"],
        "lot8GlossIdentities": 18, "lot8StudyOnlyIdentities": 2, "lot8ContentBundleIdentities": 3,
        "lot8ContentEvidenceEvents": 23, "lot8ContentRuntimeObjects": content_summary["runtimeObjects"],
        "lot8ContentRuntimeFields": content_summary["runtimeChangedFields"],
        "lot8ThreeStudyAidNativeBundlesAppliedAtomically": True,
        "lot8TwoStudyOnlyPunctuationEventsPreservePhoneticsAndMeaning": True,
        "lot8ReadingsUnchanged": True, "lot8SpanishAccentRuleAHasSeparateNamespace": True, "lot8RuleRDoesNotNormalizeAllTrills": True,
        "lot8OnlyFiniteWholeEventsAppliedNoRuleExtension": True,
        "combinedCorrectedPhoneticIdentities": len(combined_phonetic_ids),
        "combinedCorrectedIdentities": len(combined_ids), "combinedCorrectedRuntimeObjects": len(combined_objects),
        "combinedCorrectedRuntimeFields": len(combined_fields), "combinedCorrectedCanonicalIdentities": len(combined_canonical_ids),
        "combinedCorrectedCanonicalFields": len(combined_canonical_fields),
        "combinedEvidenceEvents": 774+95+259+35+8+26+23+47+228+16+63+23,
        "callerPackMutatedByProjection": False, "lot8PlacementLevelsRolesStepsAndAccessUnchanged": True,
        "lot8StudyAndMeaningExceptionsOnlyInSeparateContentRegistry": True,
        "allReadingExceptionsAreExplicitlyRegistered": True})
    checks["importedVerbatimFields"] = checks["importedFieldsCompared"] - noncatalogue_canonical_fields["conversation"]
    checks["newEditorialVerbatimFields"] = checks["newEditorialFieldsCompared"] - noncatalogue_canonical_fields["editorial-authored"]
    checks["newSituationVerbatimWholeFields"] = checks["newSituationWholeFieldsCompared"] - sum(noncatalogue_canonical_fields[n] for n in ("situation-authored", "situation-conversation"))
    checks["newSupportVerbatimWholeFields"] = checks["newSupportWholeFieldsCompared"] - sum(noncatalogue_canonical_fields[n] for n in ("situation-support-authored", "situation-support-conversation"))
    checks["newReceivedVerbatimWholeFields"] = checks["newReceivedWholeFieldsCompared"] - heard_only_changed_fields
    for name in ("phoneticCorrections", "reviewedFieldCorrections", "lot4PhoneticCorrections", "reviewedContentCorrections", "lot5FieldCorrections", "lot5ContentCorrections", "lot6FieldCorrections", "lot6ContentCorrections", "lot7PhoneticCorrections", "lot7ContentCorrections"):
        result[name]["actualRuntimeFileSha256"] = actual_hashes
    result["lot8PhoneticCorrections"] = {**paired_summary, "actualRuntimeFileSha256": actual_hashes,
        "studyMeaningReadingPlacementAndAccessUnchangedByThisLayer": True, "onlyWholePhoneticEventsNoBroadRules": True}
    result["lot8ContentCorrections"] = {**content_summary, "actualRuntimeFileSha256": actual_hashes,
        "originalSourcesAndAccessUnchanged": True, "threeWholeStudyAidNativeBundlesAtomic": True, "twoStudyOnlyPunctuationEventsAreNotPhoneticRewrites": True}
    return result



def check_original_pack(pack):
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
    require(len(visual_cells) == 250 + (len(pack["situations"]["plan"]["themes"]) if pack["situations"] else 0), "Independent visual definition coverage differs")
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
                               "themeCount": len(pack["situations"]["plan"]["themes"]), "intentsPerTheme": 8,
                               "candidatePositions": len(pack["situations"]["items"]),
                               "newAuthoredUtterances": expected_authored,
                               "existingConversationImports": len(situation_resolution["newEntries"]) - expected_authored,
                               "existingSourcePositions": len(pack["situations"]["items"]) - expected_authored}
        if pack["situations"]["freeze"]["version"] == 2:
            supports = situation_resolution["newSupportEntries"]
            heard = situation_resolution["heardEntries"]
            base_positions = 10 * 8 * len(PAIR_LANGUAGES)
            expected_additional.update(
                receivedUsages=len(pack["situations"]["receivedItems"]),
                receivedCreated=sum(row["authored"] for row in heard.values()),
                receivedExistingConversationImports=sum(not row["authored"] for row in heard.values()),
                lexicalSupportUses=len(pack["situations"]["lexicalItems"]),
                lexicalSupportCreated=sum(row["authored"] for row in supports.values()),
                lexicalSupportExistingConversationImports=sum(not row["authored"] for row in supports.values()),
                baseCandidatePositions=base_positions,
                extensionCandidatePositions=len(pack["situations"]["items"]) - base_positions)
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

    # Source-exact lexical supports are transport uses, never phrase steps.
    for uses in situation_resolution.get("supportUsesByTheme", {}).values():
        for use in uses:
            key = (use["item"]["pair"], use["canonicalId"])
            require(key in bank_map, "An explicit lexical support has no checked transport copy")
            used_review_banks.add(key)

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
    context_reference_count = new_situation_fields = new_support_fields = received_step_count = 0
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
                    elif source["collection"] in {"situation-authored", "situation-conversation", "situation-support-authored", "situation-support-conversation"}:
                        is_support_source = source["collection"].startswith("situation-support-")
                        expected = situation_resolution["newSupportEntries" if is_support_source else "newEntries"].get((pair, phrase["id"]))
                        require(expected is not None, "Undeclared new situation canonical source")
                        item = expected["item"]
                        require(source == expected["source"] and phrase["contentType"] == item["contentType"]
                                and phrase.get("isTemplate") is False and phrase.get("sourceDeclaredTemplate") is False,
                                "New situation source provenance or complete-utterance status differs")
                        for field in ("study", "native", "phon", "reading"):
                            require((field in phrase) == (field in item) and phrase.get(field) == item.get(field),
                                    "New situation text, reading or phonetic was changed or assembled")
                            if field in item:
                                if is_support_source:
                                    new_support_fields += 1
                                else:
                                    new_situation_fields += 1
                        expected_domain = item["lexicalFamily"] if is_support_source else pack["situations"]["intents"][item["intentId"]][0]["domain"]
                        require(number == item["proposedLevel"] and theme["domain"] == expected_domain
                                and phrase["phoneticReviewStatus"] == item["phoneticReviewStatus"],
                                "New situation/support canonical changed its placement or review status")
                        if is_support_source and item["contentType"] == "vocabulary":
                            require(phrase["lexicalClass"] == item["lexicalClass"], "New whole support lexical class changed")
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
                        if step["kind"] == "receive":
                            # resolve_sources already verified every role, answer,
                            # anchor, actual preparation step and heard-only model.
                            require(situation_uses and any(use["item"]["id"] == step.get("receivedId")
                                    for use in situation_resolution["receivedUsesByTheme"].get((pair, number, theme["id"]), [])),
                                    "A received step escaped its independently checked usage")
                            received_step_count += 1
                            continue
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
    require(received_step_count == situation_resolution.get("receivedUsageCount", 0),
            "A received usage is missing from the step count or counted twice")
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
        ("zh-fr", 2969, "vocabulary", "vocab-voyage"),
        ("zh-fr", 3076, "vocabulary", "vocab-travail"),
        ("zh-fr", 3892, "vocabulary", "vocab-travail"),
        ("zh-fr", 4270, "vocabulary", "vocab-travail"),
        ("zh-fr", 3877, "vocabulary", "vocab-maison"),
        ("zh-fr", 4386, "vocabulary", "vocab-maison"),
        ("zh-fr", 3455, "vocabulary", "vocab-reperes"),
        ("zh-fr", 3872, "vocabulary", "vocab-voyage"),
        ("zh-fr", 4347, "vocabulary", "vocab-loisirs"),
        ("zh-fr", 4356, "vocabulary", "vocab-personnes"),
        ("zh-fr", 3366, "vocabulary", "vocab-restaurant"),
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
        if source["collection"] in {"conversation", "editorial-authored", "situation-authored", "situation-conversation", "situation-support-authored", "situation-support-conversation"}:
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
            "additionalSituationThemesPerPair": len(pack["situations"]["plan"]["themes"]) if pack["situations"] else 0,
            "situationCandidatePositions": len(pack["situations"]["items"]) if pack["situations"] else 0,
            "situationCandidateKinds": pack["situations"].get("inputKindCounts", {}) if pack["situations"] else {},
            "situationSourceFieldsCompared": pack["situations"]["sourceFieldsCompared"] if pack["situations"] else 0,
            "situationImmutableConversationParentsChecked": 70 if pack["situations"] else 0,
            "newSituationAuthoredUtterances": sum(item["authored"] for item in situation_resolution["newEntries"].values()),
            "newSituationExistingConversationImports": sum(not item["authored"] for item in situation_resolution["newEntries"].values()),
            "newSituationWholeFieldsCompared": new_situation_fields,
            "newSupportWholeFieldsCompared": new_support_fields,
            "newSupportAuthoredEntries": sum(row["authored"] for row in situation_resolution.get("newSupportEntries", {}).values()),
            "newSupportExistingConversationImports": sum(not row["authored"] for row in situation_resolution.get("newSupportEntries", {}).values()),
            "lexicalSupportUses": situation_resolution.get("lexicalSupportUses", 0),
            "receivedUsages": situation_resolution.get("receivedUsageCount", 0),
            "receivedModels": situation_resolution.get("receivedModels", 0),
            "receivedStepsExcludedFromProduction": received_step_count,
            "newReceivedWholeFieldsCompared": sum(sum(field in row["item"] for field in ("study", "native", "phon", "reading"))
                                                    for row in situation_resolution.get("heardEntries", {}).values()),
            "receivedAuthoredModels": sum(row["authored"] for row in situation_resolution.get("heardEntries", {}).values()),
            "receivedExistingConversationModels": sum(not row["authored"] for row in situation_resolution.get("heardEntries", {}).values()),
            "previousCanonicalSourcesIntact": situation_resolution.get("previousCanonicalSourcesIntact", 0),
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
            and len(registry.get("situationAtlases", [])) == (3 if pack["situations"] and pack["situations"]["freeze"]["version"] == 2 else 1 if pack["situations"] else 0),
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
    require(registered == set(expected) and len(registered) == 250 + (len(pack["situations"]["plan"]["themes"]) if pack["situations"] else 0), "Visual registry does not cover every independent situation/reserve/lexical slot")
    pending = any(item["status"] == "pending" for item in result)
    return {"status": "pending" if pending else "all-registered-atlases-present" if pack["situations"] else "all-twenty-one-atlases-present", "atlases": result,
            "distinctAssetCells": len(cells), "registryChecked": True,
            "ownerApprovedThemeVisuals": sum(item.get("ownerApproved") is True for item in registry["themes"]),
            "themeVisualsAwaitingOwnerReview": sum(item.get("ownerApproved") is not True for item in registry["themes"]),
            "semanticOrNativeReviewClaimed": False}


def adversarial_checks(pack, *, only_phonetic=False, only_lot3=False, only_lot4=False, only_lot5=False, only_lot6=False, only_lot7=False, only_lot8=False):
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
    if pack.get("situations") and pack["situations"]["freeze"]["version"] == 2:
        def interaction_theme(test_pack):
            for cell in test_pack["cells"].values():
                for theme in cell["themes"]:
                    if theme.get("receivedTurns") and theme.get("lexicalSupports"):
                        return cell, theme
            raise VerificationError("Missing complete interaction fixture")

        def question_step(test_pack):
            _cell, theme = interaction_theme(test_pack)
            for sequence in theme["sequences"]:
                for index, step in enumerate(sequence["steps"]):
                    if step["kind"] == "receive" and step.get("answerWith"):
                        return theme, sequence, index, step
            raise VerificationError("Missing prepared question fixture")

        def received_marked_as_production(test_pack):
            _theme, _sequence, _index, step = question_step(test_pack)
            step["requiresProduction"] = True

        def received_role_changed(test_pack):
            _cell, theme = interaction_theme(test_pack)
            theme["receivedTurns"][0]["role"] = {"fr": "Autre personne", "zh": "另一人"}

        def closure_answer_list_omitted(test_pack):
            _cell, theme = interaction_theme(test_pack)
            closure = next(turn for turn in theme["receivedTurns"] if "afterIntentId" in turn)
            closure.pop("answerWith")

        def response_moved_before_preparation(test_pack):
            _theme, sequence, index, step = question_step(test_pack)
            # Keep cue/answer adjacency while moving both before real learning.
            answer = sequence["steps"][index + 1]
            del sequence["steps"][index:index + 2]
            sequence["steps"][:0] = [step, answer]

        def received_preparation_step_missing(test_pack):
            _theme, _sequence, _index, step = question_step(test_pack)
            target = next(iter(step["preparedAnswerSteps"]))
            step["preparedAnswerSteps"][target]["understoodInStep"] = "absent-preparation-step"

        def heard_model_phonetic_changed(test_pack):
            for bank in test_pack["repertoires"].values():
                model = next((row for row in bank.get("receivedModels", [])
                              if row["source"]["collection"].startswith("situation-received-")), None)
                if model:
                    model["phon"] += " altered"
                    return
            raise VerificationError("Missing newly authored heard-only model fixture")

        def received_counted_as_learner_phrase(test_pack):
            _theme, sequence, _index, step = question_step(test_pack)
            sequence["phraseIds"].append(step["utterance"])

        def lexical_support_wrong_family(test_pack):
            item = next(iter(test_pack["situations"]["lexicalItems"].values()))
            item["lexicalFamily"] = "vocab-maison" if item["lexicalFamily"] != "vocab-maison" else "vocab-voyage"

        def lexical_support_future_first_encounter(test_pack):
            cell, theme = interaction_theme(test_pack)
            theme["lexicalSupports"][0]["firstEditorialLevel"] = cell["level"] + 1

        def protected_old_model_moved(test_pack):
            protected = set(test_pack["situations"]["baseline"]["protectedCanonicalIds"])
            for (pair, level), cell in test_pack["cells"].items():
                for theme in cell["themes"]:
                    for index, phrase in enumerate(theme["phrases"]):
                        if phrase["id"] not in protected or phrase["source"]["collection"] != "editorial-authored":
                            continue
                        for (other_pair, other_level), other_cell in test_pack["cells"].items():
                            if pair != other_pair or level == other_level:
                                continue
                            target = next((row for row in other_cell["themes"] + other_cell.get("heldThemes", [])
                                           if row["domain"] == theme["domain"]), None)
                            if target:
                                moved = theme["phrases"].pop(index)
                                moved["editorialLevel"] = other_level
                                moved["placement"]["themeId"] = target["id"]
                                target["phrases"].append(moved)
                                return
            raise VerificationError("Missing movable protected old whole-entry fixture")

        def original_source_speaker_forged(test_pack):
            data = test_pack["situations"]
            for item in data["allItems"].values():
                if item["kind"] != "conversation-whole-entry":
                    continue
                source = item["source"]
                original = data["archiveRecords"][item["pair"]][(Path(source["path"]).name, source["jsonPointer"])][0]
                if original.get("speaker") in {"A", "B"}:
                    item["sourceRole"] = {"speaker": "B" if original["speaker"] == "A" else "A"}
                    return
            raise VerificationError("Missing original dialogue-speaker fixture")

        def productive_reuse_review_status_forged(test_pack):
            data = test_pack["situations"]
            referenced = {row["source"].get("candidateId") for row in data["allItems"].values()}
            item = next(row for row in data["items"].values()
                        if row["kind"] == "editorial-authored-whole-entry" and row["id"] not in referenced)
            # Reuse an already present whole model without changing its tuple.
            # The refusal must concern the false status, not a later omission.
            canonical_id = next(phrase["id"] for cell in test_pack["cells"].values()
                                for theme in cell["themes"] for phrase in theme["phrases"]
                                if phrase.get("source", {}).get("itemId") == item["id"])
            item.update(kind="candidate-reference", source={"canonicalId": canonical_id},
                        phoneticReviewStatus="existing-verbatim")
            test_pack["adversarialExpectedReason"] = "phonetic review status"

        mutations.extend([received_marked_as_production, received_role_changed, closure_answer_list_omitted,
                          response_moved_before_preparation, received_preparation_step_missing,
                          heard_model_phonetic_changed, received_counted_as_learner_phrase,
                          lexical_support_wrong_family, lexical_support_future_first_encounter,
                          protected_old_model_moved, original_source_speaker_forged,
                          productive_reuse_review_status_forged])
    def corrected(test_pack, *, transport=False):
        for _pair, _path, _location, profile, phrase in _runtime_objects(test_pack):
            if isinstance(phrase.get("phoneticCorrection"), dict) and (not transport or profile != "canonical"):
                return phrase
        raise VerificationError("Missing corrected canonical/transport adversarial fixture")

    def rebind_registry(test_pack):
        # Stronger attacks also update the self-declared SHA everywhere. Only
        # the independent evidence anchors and original-source checks stop them.
        raw = (json.dumps(test_pack["phoneticRegistry"], ensure_ascii=False, indent=2) + "\n").encode()
        test_pack["phoneticRegistryRaw"] = raw
        checksum = digest(raw)
        test_pack["fingerprints"][PHONETIC_REGISTRY] = checksum
        test_pack["manifest"]["phoneticCorrections"]["registrySha256"] = checksum
        for *_prefix, phrase in _runtime_objects(test_pack):
            if isinstance(phrase.get("phoneticCorrection"), dict):
                phrase["phoneticCorrection"]["registrySha256"] = checksum

    def corrected_after_value_changed(test_pack):
        corrected(test_pack)["phon"] += " altered"

    def corrected_declaration_missing(test_pack):
        del corrected(test_pack)["phoneticCorrection"]

    def corrected_transport_copy_not_updated(test_pack):
        phrase = corrected(test_pack, transport=True)
        phrase["phon"] = phrase["phoneticCorrection"]["beforePhon"]

    def corrected_annotation_wrong_registry_hash(test_pack):
        corrected(test_pack)["phoneticCorrection"]["registrySha256"] = "0" * 64

    def corrected_unknown_registry_identity(test_pack):
        test_pack["phoneticRegistry"]["corrections"][0]["id"] = "unknown:forged-phonetic-source"
        rebind_registry(test_pack)

    def corrected_original_source_changed(test_pack):
        source = corrected(test_pack)["source"]
        require(source["collection"].startswith("DECKS."), "Expected catalogue correction fixture")
        language = source["collection"].split(".", 1)[1]
        test_pack["decks"][language][source["sourceIndex"]][source["fieldMap"]["phon"]] += " altered"

    def corrected_before_source_profile_forged(test_pack):
        phrase = corrected(test_pack)
        identity = phrase["phoneticCorrection"]["id"]
        entry = next(item for item in test_pack["phoneticRegistry"]["corrections"] if item["id"] == identity)
        for occurrence in entry["occurrences"]:
            occurrence["expectedBefore"]["source"]["sourceSha256"] = "0" * 64
        for *_prefix, item in _runtime_objects(test_pack):
            if item.get("id") == identity and "phoneticCorrection" in item:
                item["source"]["sourceSha256"] = "0" * 64
        rebind_registry(test_pack)

    def corrected_before_aid_forged(test_pack):
        entry = test_pack["phoneticRegistry"]["corrections"][0]
        for occurrence in entry["occurrences"]:
            occurrence["expectedBefore"]["phon"] += " altered"
        rebind_registry(test_pack)

    def corrected_source_extra_metadata_forged(test_pack):
        identity = corrected(test_pack)["id"]
        entry = next(item for item in test_pack["phoneticRegistry"]["corrections"] if item["id"] == identity)
        for occurrence in entry["occurrences"]:
            occurrence["expectedBefore"]["source"]["forgedNativeApproval"] = True
        for *_prefix, phrase in _runtime_objects(test_pack):
            if phrase.get("id") == identity and "phoneticCorrection" in phrase:
                phrase["source"]["forgedNativeApproval"] = True
        rebind_registry(test_pack)

    def corrected_original_review_status_forged(test_pack):
        identity = corrected(test_pack)["id"]
        entry = next(item for item in test_pack["phoneticRegistry"]["corrections"] if item["id"] == identity)
        for occurrence in entry["occurrences"]:
            occurrence["expectedBefore"].update(phoneticReviewStatusPresent=True, phoneticReviewStatus="native-approved")
        for *_prefix, phrase in _runtime_objects(test_pack):
            if phrase.get("id") == identity and "phoneticCorrection" in phrase:
                phrase["phoneticCorrection"].update(originalReviewStatusPresent=True, originalReviewStatus="native-approved")
        rebind_registry(test_pack)

    def corrected_b_then_d_chain_reversed(test_pack):
        entry = next(item for item in test_pack["phoneticRegistry"]["corrections"] if item["rule"] == "B+D")
        entry["events"].reverse()
        rebind_registry(test_pack)

    def corrected_stray_annotation(test_pack):
        annotation = copy.deepcopy(corrected(test_pack)["phoneticCorrection"])
        _, phrase = locate(test_pack, lambda item: "phoneticCorrection" not in item)
        phrase["phoneticCorrection"] = annotation

    def corrected_evidence_ledger_and_after_forged(test_pack):
        entry = test_pack["phoneticRegistry"]["corrections"][0]
        event = entry["events"][-1]
        path, index = event["evidencePath"], event["evidenceIndex"]
        evidence = json.loads(test_pack["phoneticEvidenceRaw"][path])
        evidence["corrections"][index]["apres"] += " altered"
        raw = (json.dumps(evidence, ensure_ascii=False, indent=2) + "\n").encode()
        test_pack["phoneticEvidenceRaw"][path] = raw
        test_pack["fingerprints"][path] = digest(raw)
        next(row for row in test_pack["phoneticRegistry"]["evidenceFiles"] if row["path"] == path)["sha256"] = digest(raw)
        event["afterPhon"] += " altered"; entry["afterPhon"] += " altered"
        for *_prefix, phrase in _runtime_objects(test_pack):
            if phrase.get("id") == entry["id"] and "phoneticCorrection" in phrase:
                phrase["phon"] = entry["afterPhon"]
        rebind_registry(test_pack)

    if only_phonetic:
        mutations = []
    mutations.extend([corrected_after_value_changed, corrected_declaration_missing,
                      corrected_transport_copy_not_updated, corrected_annotation_wrong_registry_hash,
                      corrected_unknown_registry_identity, corrected_original_source_changed,
                      corrected_before_source_profile_forged, corrected_before_aid_forged,
                      corrected_source_extra_metadata_forged, corrected_original_review_status_forged,
                      corrected_b_then_d_chain_reversed, corrected_stray_annotation,
                      corrected_evidence_ledger_and_after_forged])
    def lot3_fixture(test_pack, predicate=lambda phrase, profile: True):
        for _pair, _path, _location, profile, phrase in _runtime_objects(test_pack):
            if isinstance(phrase.get("reviewedFieldCorrection"), dict) and predicate(phrase, profile):
                return phrase
        raise VerificationError("Missing lot3 adversarial fixture")

    def rebind_lot3(test_pack):
        raw = (json.dumps(test_pack["reviewedFieldRegistry"], ensure_ascii=False, indent=2) + "\n").encode()
        checksum = digest(raw)
        test_pack["reviewedFieldRegistryRaw"] = raw
        test_pack["fingerprints"][LOT3_REGISTRY] = checksum
        test_pack["manifest"]["reviewedFieldCorrections"]["registrySha256"] = checksum
        for *_prefix, phrase in _runtime_objects(test_pack):
            if isinstance(phrase.get("reviewedFieldCorrection"), dict):
                phrase["reviewedFieldCorrection"]["registrySha256"] = checksum

    def lot3_reading_after_changed(test_pack):
        lot3_fixture(test_pack, lambda phrase, profile: "reading" in phrase["reviewedFieldCorrection"]["fields"])["reading"] += " changed"

    def lot3_unregistered_reading_changed(test_pack):
        for *_prefix, phrase in _runtime_objects(test_pack):
            if isinstance(phrase.get("reading"), str) and "reviewedFieldCorrection" not in phrase:
                phrase["reading"] += " changed"
                return
        raise VerificationError("Missing unregistered Pinyin fixture")

    def lot3_before_reading_forged(test_pack):
        entry = next(row for row in test_pack["reviewedFieldRegistry"]["corrections"] if "reading" in row["fields"])
        entry["fields"]["reading"]["before"] += " invented"
        for occurrence in entry["occurrences"]:
            occurrence["expectedBefore"]["reading"] += " invented"
        rebind_lot3(test_pack)

    def lot3_after_ledger_forged(test_pack):
        entry = test_pack["reviewedFieldRegistry"]["corrections"][0]
        entry["fields"]["phon"]["after"] += " invented"
        for *_prefix, phrase in _runtime_objects(test_pack):
            if phrase.get("id") == entry["id"] and isinstance(phrase.get("source"), dict):
                phrase["phon"] = entry["fields"]["phon"]["after"]
        rebind_lot3(test_pack)

    def lot3_predecessor_B_annotation_lost(test_pack):
        phrase = lot3_fixture(test_pack, lambda phrase, profile: "phoneticCorrection" in phrase)
        del phrase["phoneticCorrection"]

    def lot3_transport_copy_stale(test_pack):
        phrase = lot3_fixture(test_pack, lambda phrase, profile: profile == "transport-phrase")
        phrase["phon"] = phrase["reviewedFieldCorrection"]["beforeFields"]["phon"]

    def lot3_received_copy_stale(test_pack):
        phrase = lot3_fixture(test_pack, lambda phrase, profile: profile == "received-model")
        phrase["phon"] = phrase["reviewedFieldCorrection"]["beforeFields"]["phon"]

    def lot3_local_status_invented(test_pack):
        lot3_fixture(test_pack, lambda phrase, profile: "phon" in phrase["reviewedFieldCorrection"]["fields"])["phoneticReviewStatus"] = "native-approved"

    def lot3_annotation_registry_hash_forged(test_pack):
        lot3_fixture(test_pack)["reviewedFieldCorrection"]["registrySha256"] = "0" * 64

    def lot3_frozen_evidence_and_registry_forged(test_pack):
        entry = test_pack["reviewedFieldRegistry"]["corrections"][0]
        event = entry["fields"]["phon"]
        path, index = event["evidencePath"], event["evidenceIndex"]
        evidence = json.loads(test_pack["reviewedFieldEvidenceRaw"][path])
        evidence["events"][index]["afterPhon"] += " invented"
        raw = (json.dumps(evidence, ensure_ascii=False, indent=2) + "\n").encode()
        test_pack["reviewedFieldEvidenceRaw"][path] = raw
        test_pack["fingerprints"][path] = digest(raw)
        next(row for row in test_pack["reviewedFieldRegistry"]["evidenceFiles"] if row["path"] == path)["sha256"] = digest(raw)
        event["after"] += " invented"
        for *_prefix, phrase in _runtime_objects(test_pack):
            if phrase.get("id") == entry["id"] and isinstance(phrase.get("source"), dict):
                phrase["phon"] = event["after"]
        rebind_lot3(test_pack)

    def lot3_before_source_and_runtime_forged(test_pack):
        entry = test_pack["reviewedFieldRegistry"]["corrections"][0]
        for occurrence in entry["occurrences"]:
            occurrence["expectedBefore"]["source"]["forgedApproval"] = True
        for *_prefix, phrase in _runtime_objects(test_pack):
            if phrase.get("id") == entry["id"] and isinstance(phrase.get("source"), dict):
                phrase["source"]["forgedApproval"] = True
        rebind_lot3(test_pack)

    def lot3_reading_only_phonetic_changed(test_pack):
        phrase = lot3_fixture(test_pack, lambda phrase, profile: phrase["reviewedFieldCorrection"]["fields"] == ["reading"])
        phrase["phon"] += " altered"

    def lot3_received_role_changed(test_pack):
        phrase = lot3_fixture(test_pack, lambda phrase, profile: profile == "received-model")
        for cell in test_pack["cells"].values():
            for theme in cell["themes"]:
                for use in theme.get("receivedTurns", []):
                    if use.get("utterance") == phrase["id"]:
                        use["role"] = {"fr": "Autre rôle inventé", "zh": "另一个角色"}
                        return
        raise VerificationError("Missing corrected received-role fixture")

    def lot3_received_marked_as_production(test_pack):
        phrase = lot3_fixture(test_pack, lambda phrase, profile: profile == "received-model")
        for cell in test_pack["cells"].values():
            for theme in cell["themes"]:
                for sequence in theme["sequences"]:
                    for step in sequence["steps"]:
                        if step.get("kind") == "receive" and step.get("utterance") == phrase["id"]:
                            step["requiresProduction"] = True
                            return
        raise VerificationError("Missing corrected received-production fixture")

    lot3_mutations = [lot3_reading_after_changed, lot3_unregistered_reading_changed,
        lot3_before_reading_forged, lot3_after_ledger_forged, lot3_predecessor_B_annotation_lost,
        lot3_transport_copy_stale, lot3_received_copy_stale, lot3_local_status_invented,
        lot3_annotation_registry_hash_forged, lot3_frozen_evidence_and_registry_forged,
        lot3_before_source_and_runtime_forged, lot3_reading_only_phonetic_changed,
        lot3_received_role_changed, lot3_received_marked_as_production]
    if only_lot3:
        mutations = lot3_mutations
    elif not only_phonetic:
        mutations.extend(lot3_mutations)

    def lot4_fixture(test_pack, name="lot4Phonetic", predicate=lambda phrase, profile: True):
        annotation_name = LOT4_CONFIG[name]["annotation"]
        for _pair, _path, _location, profile, phrase in _runtime_objects(test_pack):
            if (annotation_name in phrase and all(isinstance(phrase.get(field), str)
                    for field in ("id", "study", "native", "phon")) and predicate(phrase, profile)):
                return phrase
        raise VerificationError("Missing lot4/content adversarial phrase fixture")

    def lot4_rebind(test_pack, name):
        config = LOT4_CONFIG[name]
        raw = (json.dumps(test_pack[name + "Registry"], ensure_ascii=False, indent=2) + "\n").encode()
        checksum = digest(raw)
        test_pack[name + "RegistryRaw"] = raw
        test_pack["fingerprints"][config["registryPath"]] = checksum
        test_pack["manifest"][config["manifest"]]["registrySha256"] = checksum
        for _pair, _path, _location, _profile, phrase in _runtime_objects(test_pack):
            if config["annotation"] in phrase:
                phrase[config["annotation"]]["registrySha256"] = checksum

    def lot4_actual_phonetic_stale(test_pack):
        phrase = lot4_fixture(test_pack)
        phrase["phon"] = phrase["lot4PhoneticCorrection"]["beforeFields"]["phon"]

    def lot4_unregistered_reading_changed(test_pack):
        phrase = lot4_fixture(test_pack)
        phrase["reading"] = "unapproved extra reading"

    def lot4_annotation_omitted(test_pack):
        lot4_fixture(test_pack).pop("lot4PhoneticCorrection")

    def lot4_source_profile_forged(test_pack):
        entry = test_pack["lot4PhoneticRegistry"]["corrections"][0]
        entry["occurrences"][0]["expectedBefore"]["source"]["forged"] = True
        lot4_rebind(test_pack, "lot4Phonetic")

    def lot4_frozen_after_forged(test_pack):
        entry = test_pack["lot4PhoneticRegistry"]["corrections"][0]
        entry["fields"]["phon"]["after"] += " invented"
        lot4_rebind(test_pack, "lot4Phonetic")

    def lot4_proof_bytes_forged(test_pack):
        path = next(iter(test_pack["lot4PhoneticEvidenceRaw"]))
        raw = test_pack["lot4PhoneticEvidenceRaw"][path] + b"\n"
        test_pack["lot4PhoneticEvidenceRaw"][path] = raw
        test_pack["fingerprints"][path] = digest(raw)
        test_pack["lot4PhoneticRegistry"]["evidenceFiles"][0]["sha256"] = digest(raw)
        lot4_rebind(test_pack, "lot4Phonetic")

    def lot4_transport_stale(test_pack):
        phrase = lot4_fixture(test_pack, predicate=lambda phrase, profile: profile == "transport-phrase")
        phrase["phon"] = phrase["lot4PhoneticCorrection"]["beforeFields"]["phon"]

    def lot4_received_stale(test_pack):
        phrase = lot4_fixture(test_pack, predicate=lambda phrase, profile: profile == "received-model")
        phrase["phon"] = phrase["lot4PhoneticCorrection"]["beforeFields"]["phon"]

    def content_only_phonetic_status_forged(test_pack):
        phrase = lot4_fixture(test_pack, "reviewedContent", lambda phrase, profile: phrase["reviewedContentCorrection"]["fields"] == ["native"])
        phrase["phoneticReviewStatus"] = "native-review-approved-without-evidence"

    def content_glose_after_forged(test_pack):
        phrase = lot4_fixture(test_pack, "reviewedContent", lambda phrase, profile: phrase["reviewedContentCorrection"]["fields"] == ["native"])
        phrase["native"] += " invented"

    def content_757_study_only(test_pack):
        phrase = lot4_fixture(test_pack, "reviewedContent", lambda phrase, profile: phrase["id"] == "catalogue:fr:757")
        phrase["phon"] = phrase["reviewedContentCorrection"]["beforeFields"]["phon"]

    def content_757_phon_only(test_pack):
        phrase = lot4_fixture(test_pack, "reviewedContent", lambda phrase, profile: phrase["id"] == "catalogue:fr:757")
        phrase["study"] = phrase["reviewedContentCorrection"]["beforeFields"]["study"]

    def content_1900_reading_stale(test_pack):
        phrase = lot4_fixture(test_pack, "reviewedContent", lambda phrase, profile: phrase["id"] == "catalogue:zh:1900")
        phrase["reading"] = phrase["reviewedContentCorrection"]["beforeFields"]["reading"]

    def content_1900_glose_only(test_pack):
        phrase = lot4_fixture(test_pack, "reviewedContent", lambda phrase, profile: phrase["id"] == "catalogue:zh:1900")
        for field in ("study", "phon", "reading"):
            phrase[field] = phrase["reviewedContentCorrection"]["beforeFields"][field]

    def content_prior_annotation_lost(test_pack):
        phrase = lot4_fixture(test_pack, "reviewedContent", lambda phrase, profile: "phoneticCorrection" in phrase)
        del phrase["phoneticCorrection"]

    def content_unregistered_study_changed(test_pack):
        phrase = lot4_fixture(test_pack, "reviewedContent", lambda phrase, profile: phrase["reviewedContentCorrection"]["fields"] == ["native"])
        phrase["study"] += " unapproved"

    def content_757_native_guard_changed(test_pack):
        phrase = lot4_fixture(test_pack, "reviewedContent", lambda phrase, profile: phrase["id"] == "catalogue:fr:757")
        phrase["native"] += " invented"

    def content_transport_glose_stale(test_pack):
        phrase = lot4_fixture(test_pack, "reviewedContent", lambda phrase, profile: profile == "transport-phrase")
        phrase["native"] = phrase["reviewedContentCorrection"]["beforeFields"]["native"]

    def content_received_glose_stale(test_pack):
        phrase = lot4_fixture(test_pack, "reviewedContent", lambda phrase, profile: profile == "received-model")
        phrase["native"] = phrase["reviewedContentCorrection"]["beforeFields"]["native"]

    def lot4_received_production_changed(test_pack):
        phrase = lot4_fixture(test_pack, predicate=lambda phrase, profile: profile == "received-model")
        for cell in test_pack["cells"].values():
            for theme in cell["themes"]:
                for sequence in theme["sequences"]:
                    for step in sequence["steps"]:
                        if step.get("kind") == "receive" and step.get("utterance") == phrase["id"]:
                            step["requiresProduction"] = True
                            return
        raise VerificationError("Missing lot4 corrected received-production fixture")

    def content_level_changed(test_pack):
        phrase = lot4_fixture(test_pack, "reviewedContent", lambda phrase, profile: profile == "canonical")
        phrase["editorialLevel"] = 10 if phrase["editorialLevel"] != 10 else 1

    def lot4_old_registry_changed(test_pack):
        test_pack["reviewedFieldRegistryRaw"] += b"\n"

    def lot4_wrong_frozen_event_reference(test_pack):
        test_pack["lot4PhoneticRegistry"]["corrections"][0]["events"][0]["evidenceIndex"] += 1
        lot4_rebind(test_pack, "lot4Phonetic")

    def content_bundle_boundary_changed(test_pack):
        entry = next(entry for entry in test_pack["reviewedContentRegistry"]["corrections"] if entry["id"] == "catalogue:zh:1900")
        del entry["fields"]["reading"]
        lot4_rebind(test_pack, "reviewedContent")

    lot4_mutations = [lot4_actual_phonetic_stale, lot4_unregistered_reading_changed,
        lot4_annotation_omitted, lot4_source_profile_forged, lot4_frozen_after_forged,
        lot4_proof_bytes_forged, lot4_transport_stale, lot4_received_stale,
        content_only_phonetic_status_forged, content_glose_after_forged,
        content_757_study_only, content_757_phon_only, content_1900_reading_stale,
        content_1900_glose_only, content_prior_annotation_lost, content_unregistered_study_changed,
        content_757_native_guard_changed, content_transport_glose_stale,
        content_received_glose_stale, lot4_received_production_changed, content_level_changed,
        lot4_old_registry_changed, lot4_wrong_frozen_event_reference, content_bundle_boundary_changed]
    if only_lot4:
        mutations = lot4_mutations
    elif not only_phonetic and not only_lot3:
        mutations.extend(lot4_mutations)

    def lot5_fixture(test_pack, name="lot5Field", predicate=lambda phrase, profile: True):
        annotation_name = LOT5_CONFIG[name]["annotation"]
        for _pair, _path, _location, profile, phrase in _runtime_objects(test_pack):
            if all(isinstance(phrase.get(field), str) for field in ("id", "study", "native", "phon")) and annotation_name in phrase and predicate(phrase, profile):
                return phrase
        raise VerificationError("Missing lot5 paired/glose adversarial fixture")

    def lot5_rebind(test_pack, name):
        config = LOT5_CONFIG[name]
        data = json.dumps(test_pack[name + "Registry"], ensure_ascii=False, indent=2).encode() + b"\n"
        checksum = digest(data);test_pack[name + "RegistryRaw"] = data
        test_pack["fingerprints"][config["registryPath"]] = checksum
        test_pack["manifest"][config["manifest"]]["registrySha256"] = checksum
        for _pair, _path, _location, _profile, phrase in _runtime_objects(test_pack):
            if config["annotation"] in phrase:
                phrase[config["annotation"]]["registrySha256"] = checksum
        if name == "lot5Field":
            test_pack["lot5ContentRegistry"]["appliesAfter"][0]["registrySha256"] = checksum
            test_pack["manifest"]["lot5ContentCorrections"]["appliesAfter"][0]["registrySha256"] = checksum
            lot5_rebind(test_pack, "lot5Content")

    def lot5_pair_phon_only(test_pack):
        phrase = lot5_fixture(test_pack)
        phrase["reading"] = phrase["lot5FieldCorrection"]["beforeFields"]["reading"]

    def lot5_pair_reading_only(test_pack):
        phrase = lot5_fixture(test_pack)
        phrase["phon"] = phrase["lot5FieldCorrection"]["beforeFields"]["phon"]

    def lot5_pair_annotation_missing(test_pack):
        lot5_fixture(test_pack).pop("lot5FieldCorrection")

    def lot5_pair_boundary_forged(test_pack):
        test_pack["lot5FieldRegistry"]["corrections"][0]["atomicBundle"] = False
        lot5_rebind(test_pack, "lot5Field")

    def lot5_pair_reading_proof_omitted(test_pack):
        entry = test_pack["lot5FieldRegistry"]["corrections"][0]
        entry["events"].pop();entry["fields"].pop("reading")
        lot5_rebind(test_pack, "lot5Field")

    def lot5_reading_after_forged(test_pack):
        entry = test_pack["lot5FieldRegistry"]["corrections"][0]
        entry["fields"]["reading"]["after"] += " forged"
        for _pair, _path, _location, _profile, phrase in _runtime_objects(test_pack):
            if phrase.get("id") == entry["id"] and "lot5FieldCorrection" in phrase:
                phrase["reading"] = entry["fields"]["reading"]["after"]
        lot5_rebind(test_pack, "lot5Field")

    def lot5_whole_before_source_forged(test_pack):
        entry = test_pack["lot5FieldRegistry"]["corrections"][0]
        for occurrence in entry["occurrences"]:occurrence["expectedBefore"]["source"]["forged"] = True
        lot5_rebind(test_pack, "lot5Field")

    def lot5_proof_bytes_and_registry_forged(test_pack):
        path = next(iter(test_pack["lot5FieldEvidenceRaw"]))
        value = test_pack["lot5FieldEvidenceRaw"][path] + b"\n"
        test_pack["lot5FieldEvidenceRaw"][path] = value;test_pack["fingerprints"][path] = digest(value)
        for descriptor in test_pack["lot5FieldRegistry"]["evidenceFiles"]:
            if descriptor["path"] == path:descriptor["sha256"] = digest(value)
        lot5_rebind(test_pack, "lot5Field")

    def lot5_transport_phon_stale(test_pack):
        phrase = lot5_fixture(test_pack, predicate=lambda phrase, profile: profile == "transport-phrase")
        phrase["phon"] = phrase["lot5FieldCorrection"]["beforeFields"]["phon"]

    def lot5_transport_reading_stale(test_pack):
        phrase = lot5_fixture(test_pack, predicate=lambda phrase, profile: profile == "transport-phrase")
        phrase["reading"] = phrase["lot5FieldCorrection"]["beforeFields"]["reading"]

    def lot5_transport_snapshot_omitted(test_pack):
        entry = next(entry for entry in test_pack["lot5FieldRegistry"]["corrections"]
                     if any(o["profile"] == "transport-phrase" for o in entry["occurrences"]))
        entry["occurrences"] = [o for o in entry["occurrences"] if o["profile"] != "transport-phrase"]
        lot5_rebind(test_pack, "lot5Field")

    def lot5_undeclared_phonetic_change(test_pack):
        phrase = lot5_fixture(test_pack, "lot5Content")
        phrase["phon"] += " forged"

    def lot5_glose_after_forged(test_pack):
        lot5_fixture(test_pack, "lot5Content")["native"] += " forged"

    def lot5_native_only_status_forged(test_pack):
        lot5_fixture(test_pack, "lot5Content")["phoneticReviewStatus"] = "native-approved"

    def lot5_prior_annotation_invented(test_pack):
        lot5_fixture(test_pack)["reviewedContentCorrection"] = {"id": "invented", "fields": ["native"], "beforeFields": {"native": "x"}}

    def lot5_older_registry_changed(test_pack):
        test_pack["reviewedContentRegistryRaw"] += b"\n"

    def lot5_reserve3771_activated(test_pack):
        cell = test_pack["cells"][("fr-ja", 5)]
        phrase = next(p for p in cell["reserve"] if p["id"] == "catalogue:ja:3771")
        cell["reserve"].remove(phrase);cell["themes"][0]["phrases"].append(phrase)

    def lot5_reserve3771_production_step(test_pack):
        cell = test_pack["cells"][("fr-ja", 5)]
        sequence = next(theme["sequences"][0] for theme in cell["themes"] if theme.get("sequences"))
        sequence["steps"].append({"kind": "recall", "utterance": "catalogue:ja:3771", "requiresProduction": True})

    lot5_mutations = [lot5_pair_phon_only, lot5_pair_reading_only, lot5_pair_annotation_missing,
        lot5_pair_boundary_forged, lot5_pair_reading_proof_omitted, lot5_reading_after_forged,
        lot5_whole_before_source_forged, lot5_proof_bytes_and_registry_forged,
        lot5_transport_phon_stale, lot5_transport_reading_stale, lot5_transport_snapshot_omitted,
        lot5_undeclared_phonetic_change, lot5_glose_after_forged, lot5_native_only_status_forged,
        lot5_prior_annotation_invented, lot5_older_registry_changed,
        lot5_reserve3771_activated, lot5_reserve3771_production_step]
    if only_lot5:mutations = lot5_mutations
    elif not only_phonetic and not only_lot3 and not only_lot4 and not only_lot6:mutations.extend(lot5_mutations)

    def lot6_fixture(test_pack, name="lot6Field", predicate=lambda phrase, profile: True):
        annotation_name = LOT6_CONFIG[name]["annotation"]
        for _pair, _path, _loc, profile, phrase in _runtime_objects(test_pack):
            if (all(isinstance(phrase.get(f), str) for f in ("id", "study", "native", "phon"))
                    and annotation_name in phrase and predicate(phrase, profile)):
                return phrase
        raise VerificationError("Missing lot6 aid/content adversarial fixture")

    def lot6_rebind(test_pack, name):
        config = LOT6_CONFIG[name]
        raw = (json.dumps(test_pack[name + "Registry"], ensure_ascii=False, indent=2) + "\n").encode()
        checksum = digest(raw)
        test_pack[name + "RegistryRaw"] = raw
        test_pack["fingerprints"][config["registryPath"]] = checksum
        test_pack["manifest"][config["manifest"]]["registrySha256"] = checksum
        for _pair, _path, _location, _profile, phrase in _runtime_objects(test_pack):
            annotation = phrase.get(config["annotation"])
            if isinstance(annotation, dict):annotation["registrySha256"] = checksum
        if name == "lot6Field":
            test_pack["lot6ContentRegistry"]["appliesAfter"][0]["registrySha256"] = checksum
            test_pack["manifest"]["lot6ContentCorrections"]["appliesAfter"][0]["registrySha256"] = checksum
            lot6_rebind(test_pack, "lot6Content")

    def lot6_pair_phon_only(test_pack):
        phrase = lot6_fixture(test_pack, predicate=lambda p, _: "reading" in p["lot6FieldCorrection"]["fields"])
        phrase["reading"] = phrase["lot6FieldCorrection"]["beforeFields"]["reading"]

    def lot6_pair_reading_only(test_pack):
        phrase = lot6_fixture(test_pack, predicate=lambda p, _: "reading" in p["lot6FieldCorrection"]["fields"])
        phrase["phon"] = phrase["lot6FieldCorrection"]["beforeFields"]["phon"]

    def lot6_pair_declaration_partial(test_pack):
        entry = next(e for e in test_pack["lot6FieldRegistry"]["corrections"] if "reading" in e["fields"])
        entry["atomicBundle"] = False
        lot6_rebind(test_pack, "lot6Field")

    def lot6_phon_only_invents_reading(test_pack):
        phrase = lot6_fixture(test_pack, predicate=lambda p, _: len(p["lot6FieldCorrection"]["fields"]) == 1)
        phrase["reading"] = phrase.get("reading", "") + " invented"

    def lot6_received_after_stale(test_pack):
        phrase = lot6_fixture(test_pack, predicate=lambda p, profile: profile == "received-model")
        phrase["phon"] = phrase["lot6FieldCorrection"]["beforeFields"]["phon"]

    def lot6_received_role_forged(test_pack):
        entry = next(e for e in test_pack["lot6FieldRegistry"]["corrections"] if e["id"].startswith("heard-"))
        entry["occurrences"][0]["profile"] = "canonical"
        lot6_rebind(test_pack, "lot6Field")

    def lot6_prior_B_annotation_lost(test_pack):
        phrase = lot6_fixture(test_pack, predicate=lambda p, _: p["id"] == "catalogue:ko:3980")
        phrase.pop("phoneticCorrection")

    def lot6_prior_B_whole_before_forged(test_pack):
        entry = next(e for e in test_pack["lot6FieldRegistry"]["corrections"] if e["id"] == "catalogue:ko:3980")
        entry["occurrences"][0]["expectedBefore"]["phoneticCorrection"]["beforePhon"] += " forged"
        lot6_rebind(test_pack, "lot6Field")

    def lot6_proof_and_registry_forged(test_pack):
        path = next(iter(test_pack["lot6FieldEvidenceRaw"]))
        raw = test_pack["lot6FieldEvidenceRaw"][path] + b"\n"
        test_pack["lot6FieldEvidenceRaw"][path] = raw;test_pack["fingerprints"][path] = digest(raw)
        for descriptor in test_pack["lot6FieldRegistry"]["evidenceFiles"]:
            if descriptor["path"] == path:descriptor["sha256"] = digest(raw)
        lot6_rebind(test_pack, "lot6Field")

    def lot6_unknown_after_forged(test_pack):
        entry = test_pack["lot6FieldRegistry"]["corrections"][0]
        entry["fields"]["phon"]["after"] += " forged"
        for _pair, _path, _loc, _profile, phrase in _runtime_objects(test_pack):
            if phrase.get("id") == entry["id"] and "lot6FieldCorrection" in phrase:phrase["phon"] = entry["fields"]["phon"]["after"]
        lot6_rebind(test_pack, "lot6Field")

    def lot6_content_bundle_study_only(test_pack):
        phrase = lot6_fixture(test_pack, "lot6Content", lambda p, _: "study" in p["lot6ContentCorrection"]["fields"])
        before = phrase["lot6ContentCorrection"]["beforeFields"]
        phrase.update({field: before[field] for field in ("phon", "reading")})

    def lot6_content_bundle_reading_stale(test_pack):
        phrase = lot6_fixture(test_pack, "lot6Content", lambda p, _: "study" in p["lot6ContentCorrection"]["fields"])
        phrase["reading"] = phrase["lot6ContentCorrection"]["beforeFields"]["reading"]

    def lot6_content_bundle_boundary_forged(test_pack):
        entry = next(e for e in test_pack["lot6ContentRegistry"]["corrections"] if "study" in e["fields"])
        entry["atomicBundle"] = False
        lot6_rebind(test_pack, "lot6Content")

    def lot6_content_bundle_native_guard_changed(test_pack):
        phrase = lot6_fixture(test_pack, "lot6Content", lambda p, _: "study" in p["lot6ContentCorrection"]["fields"])
        phrase["native"] += " non approuvé"

    def lot6_content_before_prior_B_lost(test_pack):
        entry = next(e for e in test_pack["lot6ContentRegistry"]["corrections"] if e["id"] == "catalogue:ko:2362")
        entry["occurrences"][0]["expectedBefore"]["phoneticCorrectionPresent"] = False
        entry["occurrences"][0]["expectedBefore"]["phoneticCorrection"] = None
        lot6_rebind(test_pack, "lot6Content")

    def lot6_gloss_only_invents_phonetic_status(test_pack):
        phrase = lot6_fixture(test_pack, "lot6Content", lambda p, _: p["lot6ContentCorrection"]["fields"] == ["native"])
        phrase["phoneticReviewStatus"] = "native-approved"

    def lot6_gloss_after_forged(test_pack):
        phrase = lot6_fixture(test_pack, "lot6Content", lambda p, _: p["lot6ContentCorrection"]["fields"] == ["native"])
        phrase["native"] += " forged"

    def lot6_unapproved_batchim_normalization(test_pack):
        _, phrase = locate(test_pack, lambda p: p["id"].startswith("catalogue:ko:")
                          and "lot6FieldCorrection" not in p and "lot6ContentCorrection" not in p)
        phrase["phon"] += " batchim-non-approuvé"

    def lot6_unapproved_level_move(test_pack):
        phrase = lot6_fixture(test_pack)
        phrase["editorialLevel"] = phrase["editorialLevel"] % 10 + 1

    def lot6_annotation_missing(test_pack):
        lot6_fixture(test_pack).pop("lot6FieldCorrection")

    lot6_mutations = [lot6_pair_phon_only, lot6_pair_reading_only, lot6_pair_declaration_partial,
        lot6_phon_only_invents_reading, lot6_received_after_stale, lot6_received_role_forged,
        lot6_prior_B_annotation_lost, lot6_prior_B_whole_before_forged,
        lot6_proof_and_registry_forged, lot6_unknown_after_forged,
        lot6_content_bundle_study_only, lot6_content_bundle_reading_stale,
        lot6_content_bundle_boundary_forged, lot6_content_bundle_native_guard_changed,
        lot6_content_before_prior_B_lost, lot6_gloss_only_invents_phonetic_status,
        lot6_gloss_after_forged, lot6_unapproved_batchim_normalization,
        lot6_unapproved_level_move, lot6_annotation_missing]
    if only_lot6:mutations = lot6_mutations
    elif not only_phonetic and not only_lot3 and not only_lot4 and not only_lot5:mutations.extend(lot6_mutations)


    def lot7_fixture(test_pack, name="lot7Phonetic", predicate=lambda phrase, profile: True):
        annotation_name = LOT7_CONFIG[name]["annotation"]
        for _pair, _path, _location, profile, phrase in _runtime_objects(test_pack):
            if all(isinstance(phrase.get(field), str) for field in ("id", "study", "native", "phon")) \
                    and annotation_name in phrase and predicate(phrase, profile):return phrase
        raise VerificationError("Missing lot7 phonetic/content adversarial fixture")

    def lot7_rebind(test_pack, name):
        config = LOT7_CONFIG[name]
        raw = (json.dumps(test_pack[name + "Registry"], ensure_ascii=False, indent=2) + "\n").encode()
        checksum = digest(raw)
        test_pack[name + "RegistryRaw"] = raw;test_pack["fingerprints"][config["registryPath"]] = checksum
        test_pack["manifest"][config["manifest"]]["registrySha256"] = checksum
        for _pair, _path, _location, _profile, phrase in _runtime_objects(test_pack):
            if config["annotation"] in phrase:phrase[config["annotation"]]["registrySha256"] = checksum
        if name == "lot7Phonetic":
            test_pack["lot7ContentRegistry"]["appliesAfter"][0]["registrySha256"] = checksum
            test_pack["manifest"]["lot7ContentCorrections"]["appliesAfter"][0]["registrySha256"] = checksum
            lot7_rebind(test_pack, "lot7Content")

    def lot7_canonical_after_stale(test_pack):
        phrase = lot7_fixture(test_pack, predicate=lambda p, profile: profile == "canonical")
        phrase["phon"] = phrase["lot7PhoneticCorrection"]["beforeFields"]["phon"]

    def lot7_transport_after_stale(test_pack):
        phrase = lot7_fixture(test_pack, predicate=lambda p, profile: profile == "transport-phrase")
        phrase["phon"] = phrase["lot7PhoneticCorrection"]["beforeFields"]["phon"]

    def lot7_received_after_stale(test_pack):
        phrase = lot7_fixture(test_pack, predicate=lambda p, profile: profile == "received-model")
        phrase["phon"] = phrase["lot7PhoneticCorrection"]["beforeFields"]["phon"]

    def lot7_annotation_missing(test_pack):
        lot7_fixture(test_pack).pop("lot7PhoneticCorrection")

    def lot7_phonetic_batch_invents_reading(test_pack):
        lot7_fixture(test_pack)["reading"] = "unapproved-reading"

    def lot7_phonetic_batch_changes_native(test_pack):
        lot7_fixture(test_pack)["native"] += " non approuvé"

    def lot7_before_source_forged(test_pack):
        entry = test_pack["lot7PhoneticRegistry"]["corrections"][0]
        entry["occurrences"][0]["expectedBefore"]["source"]["sourceSha256"] = "0" * 64
        lot7_rebind(test_pack, "lot7Phonetic")

    def lot7_rule_G_replaced_by_B(test_pack):
        entry = next(e for e in test_pack["lot7PhoneticRegistry"]["corrections"] if e["rules"] == ["G"])
        entry["rules"] = ["B"]
        lot7_rebind(test_pack, "lot7Phonetic")

    def lot7_proof_and_registry_forged(test_pack):
        path = next(iter(test_pack["lot7PhoneticEvidenceRaw"]))
        raw = test_pack["lot7PhoneticEvidenceRaw"][path] + b"\n"
        test_pack["lot7PhoneticEvidenceRaw"][path] = raw;test_pack["fingerprints"][path] = digest(raw)
        test_pack["lot7PhoneticRegistry"]["evidenceFiles"][0]["sha256"] = digest(raw)
        lot7_rebind(test_pack, "lot7Phonetic")

    def lot7_unknown_after_forged(test_pack):
        entry = test_pack["lot7PhoneticRegistry"]["corrections"][0]
        entry["fields"]["phon"]["after"] += " forged"
        for _pair, _path, _location, _profile, phrase in _runtime_objects(test_pack):
            if phrase.get("id") == entry["id"] and "lot7PhoneticCorrection" in phrase:phrase["phon"] = entry["fields"]["phon"]["after"]
        lot7_rebind(test_pack, "lot7Phonetic")

    def lot7_transport_declaration_omitted(test_pack):
        entry = next(e for e in test_pack["lot7PhoneticRegistry"]["corrections"]
                     if any(o["profile"] == "transport-phrase" for o in e["occurrences"]))
        entry["occurrences"] = [o for o in entry["occurrences"] if o["profile"] != "transport-phrase"]
        lot7_rebind(test_pack, "lot7Phonetic")

    def lot7_received_role_forged(test_pack):
        entry = next(e for e in test_pack["lot7PhoneticRegistry"]["corrections"]
                     if any(o["profile"] == "received-model" for o in e["occurrences"]))
        next(o for o in entry["occurrences"] if o["profile"] == "received-model")["profile"] = "canonical"
        lot7_rebind(test_pack, "lot7Phonetic")

    def lot7_bundle_study_only(test_pack):
        phrase = lot7_fixture(test_pack, "lot7Content", lambda p, _: "study" in p["lot7ContentCorrection"]["fields"])
        phrase["phon"] = phrase["lot7ContentCorrection"]["beforeFields"]["phon"]

    def lot7_bundle_phon_only(test_pack):
        phrase = lot7_fixture(test_pack, "lot7Content", lambda p, _: "study" in p["lot7ContentCorrection"]["fields"])
        phrase["study"] = phrase["lot7ContentCorrection"]["beforeFields"]["study"]

    def lot7_bundle_declaration_partial(test_pack):
        entry = next(e for e in test_pack["lot7ContentRegistry"]["corrections"] if set(e["fields"]) == {"study", "phon", "native"})
        del entry["fields"]["native"]
        lot7_rebind(test_pack, "lot7Content")

    def lot7_unchanged_bundle_native_guard_forged(test_pack):
        phrase = lot7_fixture(test_pack, "lot7Content", lambda p, _: p["id"] == "catalogue:en:1024")
        phrase["native"] += " non approuvé"

    def lot7_gloss_invents_phonetic_status(test_pack):
        phrase = lot7_fixture(test_pack, "lot7Content", lambda p, _: p["lot7ContentCorrection"]["fields"] == ["native"])
        phrase["phoneticReviewStatus"] = "native-approved"

    def lot7_gloss_after_forged(test_pack):
        phrase = lot7_fixture(test_pack, "lot7Content", lambda p, _: p["lot7ContentCorrection"]["fields"] == ["native"])
        phrase["native"] += " forged"

    def lot7_unapproved_convention_extension(test_pack):
        _, phrase = locate(test_pack, lambda p: p["id"].startswith("catalogue:en:")
                          and "lot7PhoneticCorrection" not in p and "lot7ContentCorrection" not in p)
        phrase["phon"] += " convention-non-approuvée"

    def lot7_unapproved_level_move(test_pack):
        phrase = lot7_fixture(test_pack)
        phrase["editorialLevel"] = phrase["editorialLevel"] % 10 + 1

    lot7_mutations = [lot7_canonical_after_stale, lot7_transport_after_stale, lot7_received_after_stale,
        lot7_annotation_missing, lot7_phonetic_batch_invents_reading, lot7_phonetic_batch_changes_native,
        lot7_before_source_forged, lot7_rule_G_replaced_by_B, lot7_proof_and_registry_forged,
        lot7_unknown_after_forged, lot7_transport_declaration_omitted, lot7_received_role_forged,
        lot7_bundle_study_only, lot7_bundle_phon_only, lot7_bundle_declaration_partial,
        lot7_unchanged_bundle_native_guard_forged, lot7_gloss_invents_phonetic_status,
        lot7_gloss_after_forged, lot7_unapproved_convention_extension, lot7_unapproved_level_move]
    if only_lot7:mutations = lot7_mutations
    elif not any((only_phonetic, only_lot3, only_lot4, only_lot5, only_lot6)):mutations.extend(lot7_mutations)


    def lot8_fixture(test_pack, name="lot8Phonetic", predicate=lambda phrase, profile: True):
        annotation_name = LOT8_CONFIG[name]["annotation"]
        for pair, path, location, profile, phrase in _runtime_objects(test_pack):
            if all(isinstance(phrase.get(field), str) for field in ("id", "study", "native", "phon")) and annotation_name in phrase and predicate(phrase, profile):
                return phrase
        raise VerificationError("Missing lot8 phonetic/content adversarial fixture")

    def lot8_rebind(test_pack, name):
        config = LOT8_CONFIG[name]
        raw = (json.dumps(test_pack[name + "Registry"], ensure_ascii=False, indent=2) + "\n").encode()
        checksum = digest(raw)
        test_pack[name + "RegistryRaw"] = raw;test_pack["fingerprints"][config["registryPath"]] = checksum
        test_pack["manifest"][config["manifest"]]["registrySha256"] = checksum
        for _pair, _path, _loc, _profile, phrase in _runtime_objects(test_pack):
            if config["annotation"] in phrase:phrase[config["annotation"]]["registrySha256"] = checksum
        if name == "lot8Phonetic":
            test_pack["lot8ContentRegistry"]["appliesAfter"][0]["registrySha256"] = checksum
            test_pack["manifest"]["lot8ContentCorrections"]["appliesAfter"][0]["registrySha256"] = checksum
            lot8_rebind(test_pack, "lot8Content")

    def lot8_canonical_after_stale(test_pack):
        phrase = lot8_fixture(test_pack, predicate=lambda p, profile: profile == "canonical")
        phrase["phon"] = phrase["lot8PhoneticCorrection"]["beforeFields"]["phon"]

    def lot8_transport_after_stale(test_pack):
        phrase = lot8_fixture(test_pack, predicate=lambda p, profile: profile == "transport-phrase")
        phrase["phon"] = phrase["lot8PhoneticCorrection"]["beforeFields"]["phon"]

    def lot8_received_after_stale(test_pack):
        phrase = lot8_fixture(test_pack, predicate=lambda p, profile: profile == "received-model")
        phrase["phon"] = phrase["lot8PhoneticCorrection"]["beforeFields"]["phon"]

    def lot8_prior_B_annotation_lost(test_pack):
        phrase = lot8_fixture(test_pack, predicate=lambda p, _: p["id"] == "catalogue:es:3159")
        phrase.pop("phoneticCorrection")

    def lot8_before_prior_B_forged(test_pack):
        entry = next(e for e in test_pack["lot8PhoneticRegistry"]["corrections"] if e["id"] == "catalogue:es:3159")
        entry["occurrences"][0]["expectedBefore"]["phoneticCorrectionPresent"] = False
        entry["occurrences"][0]["expectedBefore"]["phoneticCorrection"] = None
        lot8_rebind(test_pack, "lot8Phonetic")

    def lot8_phonetic_batch_invents_reading(test_pack):
        lot8_fixture(test_pack)["reading"] = "unapproved-reading"

    def lot8_finite_rule_R_extended(test_pack):
        entry = next(e for e in test_pack["lot8PhoneticRegistry"]["corrections"] if "R" in e["rules"])
        entry["rules"].append("normalize-all-trills")
        lot8_rebind(test_pack, "lot8Phonetic")

    def lot8_proof_and_registry_forged(test_pack):
        path = next(iter(test_pack["lot8PhoneticEvidenceRaw"]))
        raw = test_pack["lot8PhoneticEvidenceRaw"][path] + b"\n"
        test_pack["lot8PhoneticEvidenceRaw"][path] = raw;test_pack["fingerprints"][path] = digest(raw)
        test_pack["lot8PhoneticRegistry"]["evidenceFiles"][0]["sha256"] = digest(raw)
        lot8_rebind(test_pack, "lot8Phonetic")

    def lot8_unknown_after_forged(test_pack):
        entry = test_pack["lot8PhoneticRegistry"]["corrections"][0]
        entry["fields"]["phon"]["after"] += " forged"
        for _pair, _path, _loc, _profile, phrase in _runtime_objects(test_pack):
            if phrase.get("id") == entry["id"] and "lot8PhoneticCorrection" in phrase:phrase["phon"] = entry["fields"]["phon"]["after"]
        lot8_rebind(test_pack, "lot8Phonetic")

    def lot8_transport_declaration_omitted(test_pack):
        entry = next(e for e in test_pack["lot8PhoneticRegistry"]["corrections"] if any(o["profile"] == "transport-phrase" for o in e["occurrences"]))
        entry["occurrences"] = [o for o in entry["occurrences"] if o["profile"] != "transport-phrase"]
        lot8_rebind(test_pack, "lot8Phonetic")

    def lot8_content_support_copy_stale(test_pack):
        phrase = lot8_fixture(test_pack, "lot8Content", lambda p, profile: profile == "transport-phrase")
        phrase["native"] = phrase["lot8ContentCorrection"]["beforeFields"]["native"]

    def lot8_study_only_changes_phonetic_aid(test_pack):
        phrase = lot8_fixture(test_pack, "lot8Content", lambda p, _: p["lot8ContentCorrection"]["fields"] == ["study"])
        phrase["phon"] += " unapproved"

    def lot8_study_only_after_stale(test_pack):
        phrase = lot8_fixture(test_pack, "lot8Content", lambda p, _: p["lot8ContentCorrection"]["fields"] == ["study"])
        phrase["study"] = phrase["lot8ContentCorrection"]["beforeFields"]["study"]

    def lot8_study_only_invents_phonetic_status(test_pack):
        phrase = lot8_fixture(test_pack, "lot8Content", lambda p, _: p["lot8ContentCorrection"]["fields"] == ["study"])
        phrase["phoneticReviewStatus"] = "native-approved"

    def lot8_bundle_study_only(test_pack):
        phrase = lot8_fixture(test_pack, "lot8Content", lambda p, _: "phon" in p["lot8ContentCorrection"]["fields"])
        phrase["phon"] = phrase["lot8ContentCorrection"]["beforeFields"]["phon"]

    def lot8_bundle_phon_only(test_pack):
        phrase = lot8_fixture(test_pack, "lot8Content", lambda p, _: "phon" in p["lot8ContentCorrection"]["fields"])
        phrase["study"] = phrase["lot8ContentCorrection"]["beforeFields"]["study"]

    def lot8_bundle_declaration_partial(test_pack):
        entry = next(e for e in test_pack["lot8ContentRegistry"]["corrections"] if set(e["fields"]) == {"study", "phon", "native"})
        entry["fields"].pop("native")
        lot8_rebind(test_pack, "lot8Content")

    def lot8_unchanged_bundle_native_guard_changed(test_pack):
        phrase = lot8_fixture(test_pack, "lot8Content", lambda p, _: p["id"] == "catalogue:es:2727")
        phrase["native"] += " unapproved"

    def lot8_unapproved_jota_normalization(test_pack):
        _, phrase = locate(test_pack, lambda p: p["id"].startswith("catalogue:es:") and "lot8PhoneticCorrection" not in p and "lot8ContentCorrection" not in p)
        phrase["phon"] += " jota-non-approuvée"

    def lot8_unapproved_level_move(test_pack):
        phrase = lot8_fixture(test_pack)
        phrase["editorialLevel"] = phrase["editorialLevel"] % 10 + 1

    lot8_mutations = [lot8_canonical_after_stale, lot8_transport_after_stale, lot8_received_after_stale,
        lot8_prior_B_annotation_lost, lot8_before_prior_B_forged, lot8_phonetic_batch_invents_reading,
        lot8_finite_rule_R_extended, lot8_proof_and_registry_forged, lot8_unknown_after_forged,
        lot8_transport_declaration_omitted, lot8_content_support_copy_stale,
        lot8_study_only_changes_phonetic_aid, lot8_study_only_after_stale,
        lot8_study_only_invents_phonetic_status, lot8_bundle_study_only, lot8_bundle_phon_only,
        lot8_bundle_declaration_partial, lot8_unchanged_bundle_native_guard_changed,
        lot8_unapproved_jota_normalization, lot8_unapproved_level_move]
    if only_lot8:mutations = lot8_mutations
    elif not any((only_phonetic, only_lot3, only_lot4, only_lot5, only_lot6, only_lot7)):mutations.extend(lot8_mutations)

    results = []
    for mutation in mutations:
        changed = copy.deepcopy(pack)
        mutation(changed)
        try:
            check_pack(changed)
        except VerificationError as error:
            if changed.get("adversarialExpectedReason"):
                require(changed["adversarialExpectedReason"] in str(error),
                        "The forged review status was rejected for another reason: " + str(error))
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
    total_canonical = (c["catalogueCardsRetainedExactlyOnce"] + c["importedWholePhrases"] + c["newEditorialWholeEntries"]
                       + c["newSituationAuthoredUtterances"] + c["newSituationExistingConversationImports"]
                       + c["newSupportAuthoredEntries"] + c["newSupportExistingConversationImports"])
    lines = [
        "# Vérification indépendante — sources, progression et densité", "",
        "Ce lecteur ne charge aucun générateur. Il relit le catalogue réel, les partitions sémantiques, les overlays, les sources entières nouvelles, les 70 cellules et les sept banques de révision. Il ne répare aucune donnée et n’approuve aucune publication.", "",
        "## Conservation et provenance", "",
        "| Couple | Catalogue exact | Imports L1 | Lot lexical rédigé | Ajouts situations et soutiens | Hors réserve | Réserve | L1 historique conservé |",
        "|---|---:|---:|---:|---:|---:|---:|---:|",
    ]
    for pair in report["pairs"]:
        lines.append(f"| {pair['pair']} | {pair['catalogueCards']} | {pair['importedWholePhrases']} | {pair['authoredEntries']} | {pair['newSituationEntries']} | {pair['activePhrases']} | {pair['reservedPhrases']} | {pair['historicalSourceL1IndicesConserved']} |")
    lines += [
        "", f"**{c['catalogueCardsRetainedExactlyOnce']:,} cartes classiques** sont canoniques exactement une fois. Sur **{c['catalogueFieldsCompared']:,} champs de catalogue contrôlés**, **{c['catalogueVerbatimFields']:,} champs runtime sont verbatim** et **{c['catalogueFieldDifferences']} champs runtime** sont des corrections explicites ({c['cataloguePhoneticFieldDifferences']} aides, {c['catalogueReadingFieldDifferences']} lectures, {c['catalogueStudyFieldDifferences']} études et {c['catalogueNativeFieldDifferences']} sens), vérifiées contre leurs preuves figées ; zéro autre divergence n'est accepté. Leurs champs d'origine sont contrôlés dans une projection privée avant correction, jamais déclarés égaux aux valeurs affichées après correction. Les **{c['importedWholePhrases']} imports entiers / {c['importedVerbatimFields']} champs verbatim** correspondent aux sept instantanés, comparés octet pour octet à leur commit source ; les **{c['excludedEnrichmentsAbsent']} candidats écartés** sont absents.",
        "", f"Le registre phonétique déclare **{c['phoneticCorrectionIdentities']} identités / {c['phoneticCorrectionEvidenceEvents']} événements B, C et D**, soit **{c['phoneticCorrectionRuntimeOccurrences']} objets runtime**, dont **{c['phoneticCorrectedTransportAndReceivedCopies']} copies de transport ou modèles reçus**. Les canoniques corrigés se répartissent entre **{sum(count for name, count in report['phoneticCorrections']['correctedCanonicalCollections'].items() if name.startswith('DECKS.'))} aides du catalogue** et **{c['nonCatalogueCanonicalPhoneticCorrections']} aides de phrases rédigées**. Chaque événement doit égaler une entrée des deux preuves Git dont les SHA sont épinglées dans ce lecteur ; les deux chaînes B→D restent ordonnées. Les aides corrigées, statuts et annotations sont contrôlés dans toutes les cellules et banques avant toute projection. Les empreintes du rapport sont celles des fichiers corrigés réels ; aucune donnée du pack appelant n'est réécrite. Ces corrections locales ne certifient pas la phonétique complète ni une relecture native.",
        "", f"Le total canonique est **{total_canonical:,}**, dont **{c['activePhrases']:,} entrées hors réserve** et **{c['reservedPhrasesRetainedWithoutSteps']} réservées**. Les banques et les révisions ne sont jamais ajoutées à ces totaux. La réserve n’a aucune étape de leçon.",
        "", "Les champs sont relus indépendamment : pf pour en/es/it/ja/ko, phf pour zh, phon et cn pour les apprenants sinophones du français ; py sert seulement de lecture complémentaire. Aucun morceau de phonétique n’est extrait ou assemblé.",
        "", "## Décisions éditoriales et ajouts", "",
        f"Les **{c['historicalPlacementDecisionsPreserved']} décisions historiques** et leur unique adjudication sont conservées. **{c['wholeSourceIntroductionDecisions']} introductions sources** ont une identité, un niveau source et une empreinte contrôlés ; **{c['introductionSourceFieldsCompared']} champs d’overlay** correspondent aux cartes entières. Ces nouveaux placements prennent priorité explicitement sans changer lv.", "",
    ]
    if "reviewedFieldCorrections" in report:
        lines += [
            f"Le lot 3 ajoute **{c['lot3FieldEvidenceEvents']} événements sur {c['lot3CorrectionIdentities']} identifiants** : **{c['lot3PhoneticEvidenceEvents']} aides entières** et **{c['lot3ReadingEvidenceEvents']} Pinyin**. Ils sont vérifiés dans **{c['lot3RuntimeObjects']} objets / {c['lot3RuntimeFieldOverrides']} champs**, dont {c['lot3CanonicalObjects']} canoniques, {c['lot3TransportObjects']} copies de transport et {c['lot3ReceivedOnlyObjects']} modèles reçus. Les sept cartes déjà corrigées en B gardent cette déclaration avant leur nouvelle correction. Chaque avant complet est comparé au snapshot Git `3df885d`, puis l’après réel et son annotation sont vérifiés avant la projection privée lot3→lot2→origine. Cette couche lot3 seule conserve les autres lectures, les études, sens, emplacements et accès. Les exceptions de contenu ultérieures sont déclarées séparément ci-dessous. Les compteurs B/C/D ci-dessus décrivent le lot2 conservé ; les champs catalogue verbatim tiennent compte des deux couches sans compter deux fois les sept chaînes.", "",
        ]
    if "lot4PhoneticCorrections" in report:
        lines += [
            f"Le lot phonétique 4 ajoute **{c['lot4PhoneticIdentities']} aides entières figées**, dans **{c['lot4PhoneticRuntimeObjects']} objets / {c['lot4PhoneticRuntimeFields']} champs**. Ses preuves sont comparées à Git `7631c0f` et ses profils avant complets à `606592c`. La règle A de ce lot nomme l’anglicisation ; elle n’est pas l’ancienne règle automatique s→ss retirée. Aucun événement n’est étendu à d’autres cartes.", "",
            f"Le **lot de contenu séparé** applique **{c['contentCorrectionIdentities']} identifiants / {c['contentCorrectionEvidenceEvents']} événements atomiques** : 25 gloses amendées du lot3, huit gloses du lot4 et les blocs 1900 et757. Il déclare **{c['contentApprovedRegistryFields']} champs à l’échelle des entrées du registre**, dont **{c['contentChangedRegistryFields']} valeurs changent**. Dans le runtime : **{c['contentRuntimeObjects']} objets, {c['contentRuntimeApprovedFields']} champs approuvés et {c['contentRuntimeChangedFields']} changements effectifs**. Le sens natif de757 est une garde inchangée ; étude et aide changent ensemble. Le bloc1900 change étude, lecture, aide et sens ensemble. Une application partielle est refusée.", "",
            "Les valeurs après des deux couches du lot4 sont contrôlées avant leur projection privée commune, puis les deux couches historiques et les sources originales sont vérifiées. La provenance, les annotations précédentes, identifiants, types, emplacements, niveaux éditoriaux, rôles, étapes et accès restent conservés. Les exceptions d’étude/sens/lecture de ce lot sont explicitement nommées ; les lectures liées et gloses du lot5 sont déclarées séparément ci-dessous. Aucune proposition de thème/niveau ni convention ouverte n’est appliquée.", "",
        ]
    if "lot8PhoneticCorrections" in report:
        lines.extend([
            f"Le **lot8 espagnol** vérifie **{c['lot8PhoneticIdentities']} aides entières figées**, dans **{c['lot8PhoneticRuntimeObjects']} objets / {c['lot8PhoneticRuntimeFields']} champs** : {c['lot8PhoneticCanonicalObjects']} canoniques, {c['lot8PhoneticTransportObjects']} copie et {c['lot8PhoneticReceivedObjects']} modèle reçu. Les avant complets sont ancrés à Git `224e459`, les preuves à `e12c600`. L'ancienne correction B de3159 est conservée. Aucune lecture ne change.", "",
            f"La couche de contenu séparée vérifie **{c['lot8GlossIdentities']} gloses certaines, {c['lot8StudyOnlyIdentities']} études seules de ponctuation et {c['lot8ContentBundleIdentities']} blocs étude/aide ± sens** : **{c['lot8ContentRuntimeObjects']} objets / {c['lot8ContentRuntimeFields']} champs**. Les deux ¡! ne modifient ni aide ni sens ni statut phonétique ; les trois blocs sont atomiques. La copie de soutien estómago reçoit le même sens corrigé. Les après sont validés avant projection privée contenu→phonétique→lots7/6/5/4/3/2→sources.", "",
            "Les 310 propositions, 151 conventions et119 contenus incertains restent non appliqués. R ne concerne que ses dix événements et n'uniformise pas toutes les vibrantes ; la jota sur112lignes reste une décision d'ensemble. L'étiquette A désigne l'accent espagnol dans cet espace, sans restaurer l'ancienne règle espagnole A retirée. Les prix, droits, niveaux, thèmes, rôles et étapes restent conservés ; les tests ne certifient pas une écoute native.", "",
        ])
    if "lot7PhoneticCorrections" in report:
        lines.extend([
            f"Le **lot7 anglais** vérifie **{c['lot7PhoneticIdentities']} aides entières figées**, dans **{c['lot7PhoneticRuntimeObjects']} objets / {c['lot7PhoneticRuntimeFields']} champs** : {c['lot7PhoneticCanonicalObjects']} canoniques, {c['lot7PhoneticTransportObjects']} copies et {c['lot7PhoneticReceivedObjects']} modèles reçus. Aucune lecture ne change. Les preuves sont épinglées à `dec4e90` et les profils avant complets à Git `d56fe23`.", "",
            f"La couche de contenu séparée vérifie **{c['lot7GlossIdentities']} gloses certaines et {c['lot7ContentBundleIdentities']} blocs étude/aide/glose**, soit **{c['lot7ContentRuntimeObjects']} objets / {c['lot7ContentRuntimeFields']} champs**. Chaque bloc conserve exactement ses deux ou trois champs déclarés ; les sens non corrigés de1024/2732 restent gardés. Les après sont validés avant projection privée contenu→phonétique→lots6/5/4/3/2→sources.", "",
            "Les règles G/W/A/H/Z/T sont des étiquettes de ces événements anglais seulement. G reprend le principe du g dur, sans étendre une substitution ; A désigne l'accent anglais et ne réactive pas l'ancienne proposition espagnole A retirée. Les 689 propositions, 30 conventions et 95 gloses incertaines restent non appliquées. Identifiants, sources, emplacements, rôles, étapes, niveaux, tarifs, droits et présentation restent conservés. La lecture individuelle annoncée par Claude est 50 cellules sur70, pas une validation native globale par ces essais.", "",
        ])
    if "lot6FieldCorrections" in report:
        lines.extend([
            f"Le **lot6 coréen** vérifie **{c['lot6PhoneticIdentities']} aides entières** et **{c['lot6LinkedReadingEvents']} lectures liées**, soit **{c['lot6FieldEvidenceEvents']} événements / {c['lot6FieldRuntimeObjects']} objets / {c['lot6FieldRuntimeFields']} champs**. Les cinq paires restent atomiques ; les treize autres aides ne changent aucune lecture. Les preuves sont épinglées à `87357b1`, les avant complets à Git `161d0eb`, et la chaîne antérieure B de 3980 reste explicite.", "",
            f"La couche de contenu séparée vérifie **{c['lot6GlossIdentities']} gloses certaines + {c['lot6ContentBundleIdentities']} blocs étude/lecture/aide**, soit **{c['lot6ContentRuntimeObjects']} objets / {c['lot6ContentRuntimeFields']} champs**. Les études 2362/1896, leurs lectures et aides changent d'un seul tenant ; leurs sens restent gardés au caractère près. Les cinq anciennes annotations B rencontrées dans les deux couches sont conservées.", "",
            "Les après réellement servis sont validés avant la projection privée contenu→aide/lecture→lots5/4/3/2→sources. Aucun niveau, thème, rôle, droit ou prix n'est modifié. Les 447 propositions et 260 conventions restent ouvertes ; les trois lectures orthographiques de 닭 ne constituent aucune normalisation globale du batchim. Les tests sont mécaniques et ne remplacent pas une écoute native.", "",
        ])
    if "lot5FieldCorrections" in report:
        lines += [
            f"Le **lot5 japonais** applique **{c['lot5PairedIdentities']} paires atomiques aide/lecture**, soit **{c['lot5PairedEvidenceEvents']} événements figés**, dans **{c['lot5PairedRuntimeObjects']} objets / {c['lot5PairedRuntimeFields']} champs**. Chaque aide et sa lecture correspondante sont vérifiées ensemble contre les preuves épinglées de `62daa86`, avec avant complet Git `f22202c`. La copie4320 est actualisée ; le modèle ouvert3771 reste en réserve et n’acquiert aucune étape.", "",
            f"Les **{c['lot5GlossIdentities']} gloses certaines** constituent un registre distinct, appliqué après les paires : **{c['lot5GlossRuntimeObjects']} objets / {c['lot5GlossRuntimeFields']} champs de sens**. Les cinq corrections 日本語→japonais ne modifient pas l’étude japonaise. La phonétique ne change pas pour corriger un sens, et aucun statut phonétique n’est inventé pour ces gloses.", "",
            "Les après réels sont contrôlés avant une projection privée commune glose→aide/lecture, puis les couches antérieures et les sources originales sont vérifiées. Le rapport garde les empreintes des fichiers effectivement servis ; les études, types, placements, niveaux, rôles, étapes et accès ne changent pas dans le lot5. Ses seules exceptions sont les quatre paires et les 26 gloses explicitement attestées, sans arbitrage de la convention クッション ni application des propositions de classement.", "",
        ]
    if c["situationCandidatePositions"]:
        lines += [
            f"Le lot de situations remplit **{c['situationCandidatePositions']} positions** dans **{c['additionalSituationThemesPerPair']} thèmes communs**, huit positions par thème et par couple. Il ajoute réellement **{c['newSituationAuthoredUtterances']} phrases rédigées** dont la relecture phonétique entière reste à faire, et **{c['newSituationExistingConversationImports']} phrases anciennes importées** ; les réemplois du catalogue et les références à un candidat ne sont pas comptés comme des créations. Les annotations de correction locale ne valent pas approbation native globale. **{c['situationSourceFieldsCompared']} champs de réemploi** et **{c['newSituationWholeFieldsCompared']} champs d’ajouts** sont contrôlés contre les objets entiers d'origine ; **{c['newSituationVerbatimWholeFields']} champs d'ajouts runtime restent verbatim**, les autres aides étant les seules exceptions explicitement enregistrées. L’index de recherche est reconstruit depuis **70 parents de conversation** immuables, sans charger le générateur.", "",
            f"Les **{c['contextPresentationReferences']} références contextuelles** pointent vers un seul canonique existant, au même niveau ou à un niveau antérieur. Leur intention est reliée au plan et leurs champs restent entiers. Elles utilisent isContextReuse et restent distinctes des révisions strictement antérieures. Dans chaque nouveau thème, les huit intentions suivent globalement l’ordre01→08, réemplois contextuels et primaires mêlés : ni une confirmation tardive ni un accord ne passe devant le problème initial. **{c['situationCatalogueIntroductionDecisions']} décisions du nouveau lot** introduisent explicitement un canonique de catalogue plus tôt, sans toucher son lv ni la frontière d’accès.", "",
            f"Les **{c['lexicalSupportUses']} soutiens lexicaux** restent autonomes dans leur famille et hors des étapes de phrase ; **{c['newSupportAuthoredEntries']} mots rédigés** et **{c['newSupportExistingConversationImports']} mots importés** sont comparés par champs entiers. Les **{c['receivedUsages']} usages reçus / {c['receivedModels']} modèles** ont leurs rôles, réponses préparées et clôtures explicites ; leurs **{c['receivedStepsExcludedFromProduction']} étapes** sont exclues de la production et du progrès. Les **{c['receivedAuthoredModels']} modèles entendus rédigés** et **{c['receivedExistingConversationModels']} modèles entendus importés** sont comptés séparément du catalogue canonique de production.", "",
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
        "", f"Les **{c['reviewPresentationReferences']} révisions présentées** sont strictement postérieures à leur première rencontre, dans la même famille et le même type. Le transport commun aux révisions, réemplois contextuels et soutiens contient **{c['reviewTransportCopies']} copies uniques**, marquées referenceOnly et liées à leur emplacement canonique réel. Chaque copie, tous ses champs et sa provenance correspondent à cet original. Les compteurs newCount, reviewCount, presentedCount et pedagogicalConceptCount sont recalculés.",
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
        "Les contre-exemples en mémoire incluent une phonétique changée, une source dupliquée, un mauvais champ, un rappel avant préparation, une réserve productive, un import exclu, un mot injecté dans une situation, une révision future ou de mauvaise famille, un compteur gonflé et une séparation fictive d’un concept M/F. Les nouveaux contre-exemples couvrent aussi les rôles et clôtures reçus, la réponse avant sa préparation, une fausse étape de préparation, une aide de modèle entendu changée, un reçu compté comme production, un soutien futur ou de mauvaise famille, une attribution de source forgée, un faux statut de revue et le déplacement d’un ancien modèle protégé. Le lot4 ajoute les copies ou reçus périmés, une preuve forgée, une ancienne annotation perdue, une glose non autorisée et les blocs1900/757 appliqués partiellement, y compris la garde native inchangée de757. Le lot5 ajoute les paires aide/lecture partielles, les copies ou déclarations de transport omises, une glose/statut/preuve inventés et la réserve3771 activée à tort. Le lot6 ajoute les paires coréennes partielles, la réplique reçue périmée, la chaîne B3980 altérée, les blocs2362/1896 partiels et leurs sens gardés, les preuves/annotations forgées et une normalisation batchim non approuvée. Le lot7 ajoute les aides/copies/reçus anglais périmés, une lecture inventée, les règles ou preuves falsifiées, une copie omise, les cinq blocs partiels ou leurs sens gardés altérés et une convention étendue sans accord. Le lot8 ajoute les copies/aides/reçus espagnols périmés, la chaîne B3159 perdue, les deux études de ponctuation assorties à tort de nouvelles aides ou statuts, le soutien estómago périmé, les trois blocs partiels et la normalisation de jota ou de vibrantes sans décision. Le contrôle ne remplace pas une écoute ou un essai avec apprenants. La revue humaine de Claude couvre les thèmes, les niveaux et les phonétiques anciennes comme nouvelles ; ces contrôles mécaniques ne prouvent ni leur justesse linguistique globale ni la fermeture globale de la progression. Aucune publication n’est approuvée.", "",
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

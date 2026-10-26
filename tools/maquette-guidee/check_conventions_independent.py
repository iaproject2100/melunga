#!/usr/bin/env python3
"""Independently check the finite jota/batchim tranche without any builder.

Read-only by default. Every actual document is checked against pinned Git
objects plus the literal content and convention events before inverse
projection convention -> content -> historical independent verification.
"""
from __future__ import annotations

import argparse
from collections import Counter
import copy
import hashlib
import json
from pathlib import Path
import subprocess
import sys

import check_uncertain_content_independent as content

ROOT = Path(__file__).resolve().parents[2]
BASE = "13f42b5814f2b230d76d2d0ef267dcf406c523c2"
CONTENT_DEPENDENCY_COMMIT = "e85c8c355be8cc0213543eddb21467432edb57b8"
CONTENT_CHECKER_SHA = "248d194b72e13aa79ae65fe5022448e622ec1462993181459663f99014b95796"
SOURCE = "68031b7c8643e78cae7b40ad59600db32b08f79a"
ERRATUM_COMMIT = "4247ca470354f59ea37992608b38e3728a6e22f9"
DIRECTORY = "docs/niveaux-progressifs/conventions-tranchees"
REGISTRY = DIRECTORY + "/registre/conventions-tranchees.json"
REGISTRY_SHA = "3058f970810166d471607251a2544cb7cdb73e50422794a8bbbedbd613b62705"
ERRATUM = DIRECTORY + "/registre/evidence-errata-contenu-1.json"
ERRATUM_GIT_PATH = "docs/revue-integrale/contenu-incertain/errata-1.json"
ERRATUM_SHA = "5418f06dcef98785a617e55a2f033c9bbdd99d9b563efe28f689fca81b9e1453"
BATCHIM_ERRATUM_COMMIT = "d5ad5e422f3fe1563d425ef8e0a07bea7b874559"
BATCHIM_ERRATUM = DIRECTORY + "/registre/evidence-errata-batchim-1.json"
BATCHIM_ERRATUM_GIT_PATH = "docs/revue-integrale/convention-batchim-ko/errata-1.json"
BATCHIM_ERRATUM_SHA = "0a724d5f9d9de43baee3188cbec543f86eda13433ae0a42a80dd9c7a58bb86ba"
PREFIX = "melunga_deploy/content/niveaux-progressifs/"
ANNOTATION = "conventionCorrection"
MANIFEST_KEY = "conventionCorrections"
PAIRS = ("fr-en", "fr-es", "fr-it", "fr-zh", "fr-ja", "fr-ko", "zh-fr")
SOURCES = {
    "jota": ("fr-es", "convention-jota-es", "docs/revue-integrale/convention-jota-es/registre-jota.json",
             "a7ab05654d63f82f17b2e42fa379af1d9a652e1128090347a59c089e244b7bbc", 110),
    "batchim": ("fr-ko", "convention-batchim-ko", "docs/revue-integrale/convention-batchim-ko/registre-batchim.json",
                "13104a811bf0bc6f123622dbafc24a13ef7da794f7406b05134b274fcbf8a818", 1989),
}
SUPERSEDED = {("fr-es", "catalogue:es:3353"), ("fr-ko", "catalogue:ko:3767"),
         ("fr-ko", "catalogue:ko:3637")}
_CACHE = {}


def require(condition, explanation):
    if not condition:
        raise ValueError("Conventions independent: " + explanation)


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def compact(value):
    return (json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n").encode()


def exact(actual, expected, explanation):
    difference = content.first_difference(actual, expected)
    require(difference is None, explanation + " " + repr(difference))


def ordered_occurrences(values):
    return sorted(values, key=lambda value: (value["path"], canonical(value["location"])))


def evidence_path(kind):
    return DIRECTORY + "/registre/evidence-registre-" + kind + ".json"


def input_data(root, raw):
    return {"registryRaw": raw(REGISTRY), "erratumRaw": raw(ERRATUM),
            "batchimErratumRaw": raw(BATCHIM_ERRATUM),
            "counterreadRaw": raw(DIRECTORY + "/contrelecture-linguistique-independante.json"),
            **{kind + "Raw": raw(evidence_path(kind)) for kind in SOURCES}}


def actual_documents(pack):
    return content.actual_documents(pack)


def phrase_occurrences(documents):
    """Walk all dictionaries, so a copied/moved object cannot hide in a new slot."""
    for path, document in documents.items():
        if path.endswith("/manifest.json"):
            continue
        pair = document.get("pairId", document.get("id"))
        for location, phrase in content.walk(document):
            if all(type(phrase.get(field)) is str for field in ("id", "study", "native", "phon")):
                profile = ("received-model" if location[0] == "receivedModels" else "transport-phrase") \
                    if "/repertoires/" in path else "canonical"
                yield path, location, phrase, (pair, phrase["id"]), profile


def snapshot(phrase):
    result = {field: copy.deepcopy(phrase.get(field)) for field in ("study", "native", "phon", "source")}
    for field in ("reading", "phoneticReviewStatus"):
        result[field + "Present"] = field in phrase
        result[field] = copy.deepcopy(phrase.get(field))
    result["priorAnnotations"] = {key: copy.deepcopy(value) for key, value in phrase.items()
                                  if key.endswith("Correction") and key != ANNOTATION}
    result["preservedFieldsSha256"] = sha(canonical({key: value for key, value in phrase.items()
        if key not in {"phon", "phoneticReviewStatus", ANNOTATION}}))
    result["wholeObjectSha256"] = sha(canonical(phrase))
    return result


def frozen_sources(root, inputs):
    raw_erratum = inputs["erratumRaw"]
    require(sha(raw_erratum) == ERRATUM_SHA
            and raw_erratum == content.git_bytes(root, ERRATUM_COMMIT, ERRATUM_GIT_PATH),
            "official whole-content erratum bytes differ")
    erratum = json.loads(raw_erratum)
    require(erratum.get("id") == "contenu-incertain-errata-1" and len(erratum.get("events", [])) == 4,
            "official erratum edition differs")
    require({("fr-es" if row["id"].startswith("catalogue:es:") else "fr-ko", row["id"])
             for row in erratum["events"] if "supersedes" in row} == SUPERSEDED,
            "official superseded convention identities differ")
    sources, selected, excluded, primary, post = {}, {}, {}, {}, {}
    for kind, (pair, convention, path, pin, count) in SOURCES.items():
        raw = inputs[kind + "Raw"]
        require(sha(raw) == pin and raw == content.git_bytes(root, SOURCE, path),
                "source proof bytes differ from exact Git edition: " + kind)
        source = json.loads(raw)
        require(source.get("id") == convention and source.get("pair") == pair
                and source.get("baseSnapshotCommit") == BASE
                and type(source.get("eventCount")) is int
                and source["eventCount"] == len(source["events"]) == count,
                "source edition/count differs: " + kind)
        sources[kind] = source
        for index, event in enumerate(source["events"]):
            key = pair, event["id"]
            require(key not in primary and type(event.get("beforePhon")) is str
                    and type(event.get("afterPhon")) is str and event["beforePhon"] != event["afterPhon"],
                    "repeated identity or non-whole phon literal")
            pointer = {"evidencePath": evidence_path(kind), "evidenceCollection": "events", "evidenceIndex": index}
            primary[key] = event, pointer
            selected[key] = {"pairId": pair, "id": event["id"], "convention": convention,
                "beforePhon": event["beforePhon"], "afterPhon": event["afterPhon"],
                "events": [pointer], "sourceAnchor": event["occurrence"]}
        overrides = source.get("afterContentRegister", [])
        require(len(overrides) == (21 if kind == "batchim" else 0), "wrong post-content count")
        for index, event in enumerate(overrides):
            key = pair, event["id"]
            require(key not in post and type(event.get("contentBlocAfterPhon")) is str
                    and type(event.get("afterBatchim")) is str
                    and event["contentBlocAfterPhon"] != event["afterBatchim"], "invalid whole post-content aid")
            pointer = {"evidencePath": evidence_path(kind), "evidenceCollection": "afterContentRegister",
                       "evidenceIndex": index}
            post[key] = event, pointer
            if key not in selected:
                selected[key] = {"pairId": pair, "id": event["id"], "convention": convention,
                                 "events": [], "sourceAnchor": None}
            selected[key].update(beforePhon=event["contentBlocAfterPhon"], afterPhon=event["afterBatchim"])
            selected[key]["events"].append(pointer)
        omitted = source.get("notApplied", [])
        require(len(omitted) == (69 if kind == "batchim" else 0), "wrong excluded count")
        for index, event in enumerate(omitted):
            key = pair, event["id"]
            require(key not in selected and key not in excluded, "excluded/approved identity overlap")
            excluded[key] = event, {"evidencePath": evidence_path(kind), "evidenceCollection": "notApplied",
                                    "evidenceIndex": index}
    require(len(primary) == 2099 and len(post) == 21 and len(set(post) & set(primary)) == 17,
            "primary/override intersection differs")
    replacement_raw = inputs["batchimErratumRaw"]
    require(sha(replacement_raw) == BATCHIM_ERRATUM_SHA
            and replacement_raw == content.git_bytes(root, BATCHIM_ERRATUM_COMMIT, BATCHIM_ERRATUM_GIT_PATH),
            "whole batchim replacement erratum bytes differ")
    replacements = json.loads(replacement_raw)
    require(replacements.get("id") == "convention-batchim-ko-errata-1"
            and [event.get("id") for event in replacements.get("events", [])] == [
                "catalogue:ko:3090", "catalogue:ko:4275", "catalogue:ko:3870", "catalogue:ko:1433", "catalogue:ko:4193"],
            "whole batchim replacement selection differs")
    sources["batchimErratum"] = replacements
    for index, event in enumerate(replacements["events"]):
        key = "fr-ko", event["id"]
        original, _pointer = primary[key]
        require(key not in post and type(event.get("afterPhon")) is str
                and event["study"] == original["study"] and event["beforePhon"] == original["beforePhon"]
                and event["deliveredAfterPhon"] == original["afterPhon"]
                and event["afterPhon"] != event["deliveredAfterPhon"],
                "whole batchim replacement breaks exact before/delivered-after/study chain")
        selected[key]["afterPhon"] = event["afterPhon"]
        selected[key]["events"].append({"evidencePath": BATCHIM_ERRATUM, "evidenceCollection": "events", "evidenceIndex": index})
    require(SUPERSEDED <= set(primary) and not SUPERSEDED & set(post), "superseded source identities differ")
    for key in SUPERSEDED:
        del selected[key]
    require(len(selected) == 2100 and sum(len(row["events"]) for row in selected.values()) == 2122,
            "effective selection/reference count differs")
    return sources, selected, excluded, primary, post


def content_after(pack):
    """Build expected B from independent source literals, without the producer."""
    inputs = pack.get("uncertainContentInputs")
    require(isinstance(inputs, dict), "content source reader inputs missing")
    _source, events = content._source_events(pack["root"], inputs)
    require(sha(inputs["registryRaw"]) == content.REGISTRY_SHA
            and sha(inputs["exceptionsRaw"]) == content.EXCEPTIONS_SHA, "content registry/hold bytes differ")
    baseline, hashes = content.source_documents(pack["root"])
    expected = copy.deepcopy(baseline)
    lookup = {(event["pair"], event["id"]): (index, event) for index, event in enumerate(events) if index != 211}
    for path, location, phrase, key, _profile in phrase_occurrences(baseline):
        if key not in lookup:
            continue
        index, event = lookup[key]
        require(all(type(phrase.get(field)) is str and phrase[field] == event["before"][field]
                    for field in event["fields"]), "content literal before differs")
        after = content.at(expected[path], location)
        after.update(event["after"])
        if "phon" in event["fields"] and event["before"]["phon"] != event["after"]["phon"]:
            after["phoneticReviewStatus"] = content.STATUS
        after[content.ANNOTATION] = content.annotation(event, index, phrase, content.REGISTRY_SHA)
    content.refresh_concept_counts(expected)
    registry = json.loads(inputs["registryRaw"])
    expected[PREFIX + "manifest.json"][content.MANIFEST_KEY] = content._declaration(registry, content.REGISTRY_SHA)
    require(subprocess.run(["git", "merge-base", "--is-ancestor", CONTENT_DEPENDENCY_COMMIT, "HEAD"],
                           cwd=pack["root"], capture_output=True).returncode == 0,
            "pinned content dependency is not an ancestor of this checkout")
    checker_path = "tools/maquette-guidee/check_uncertain_content_independent.py"
    require(sha(content.git_bytes(pack["root"], CONTENT_DEPENDENCY_COMMIT, checker_path)) == CONTENT_CHECKER_SHA
            and sha(Path(content.__file__).read_bytes()) == CONTENT_CHECKER_SHA,
            "independent content checker differs from pinned dependency")
    dependency_raw = {path: content.git_bytes(pack["root"], CONTENT_DEPENDENCY_COMMIT, path) for path in expected}
    dependency_documents = {path: json.loads(raw) for path, raw in dependency_raw.items()}
    dependency_hashes = {path: sha(raw) for path, raw in dependency_raw.items()}
    for pair in expected[PREFIX + "manifest.json"]["pairs"]:
        pair["repertoireSha256"] = dependency_hashes[PREFIX + "repertoires/" + pair["id"] + ".json"]
    for path in sorted(expected):
        exact(dependency_documents[path], expected[path],
              "pinned B dependency differs from independently reconstructed whole content: " + path)
    # Git byte hashes are admitted only after complete typed B reconstruction.
    return baseline, dependency_documents, events, hashes, dependency_hashes


def declaration(registry):
    return {"registryPath": REGISTRY, "registrySha256": REGISTRY_SHA, "baseSnapshotCommit": BASE,
        "appliesAfter": [{"registryPath": content.REGISTRY, "registrySha256": content.REGISTRY_SHA}],
        "correctionCount": 2100, "sourceEventCount": 2099, "postContentOverrideCount": 21,
        "supersededSourceEventCount": 3, "notAppliedCount": 69,
        "batchimErratumEventCount": 5, "appliedSourceReferenceCount": 2122,
        "evidenceCommits": [SOURCE, ERRATUM_COMMIT, BATCHIM_ERRATUM_COMMIT]}


def annotation(row, before):
    return {"id": row["id"], "convention": row["convention"], "registryPath": REGISTRY,
        "registrySha256": REGISTRY_SHA, "baseSnapshotCommit": BASE, "fields": ["phon"],
        "beforeFields": {"phon": before["phon"]},
        "originalPhoneticReviewStatusPresent": before["phoneticReviewStatusPresent"],
        "originalPhoneticReviewStatus": before["phoneticReviewStatus"],
        "evidenceCommits": [SOURCE, ERRATUM_COMMIT, BATCHIM_ERRATUM_COMMIT], "events": row["events"]}


def overlap_matrix(events, selected, excluded, primary, post):
    result = []
    for index, event in enumerate(events):
        key = event["pair"], event["id"]
        if key not in set(primary) | set(post) | set(excluded):
            continue
        disposition = ("notApplied-preserve-approved-content-native-only" if key in excluded else
            "superseded-by-official-content-erratum" if key in SUPERSEDED else
            "explicit-after-content-literal" if key in post else
            "preserve-approved-content-fields-and-apply-frozen-phon")
        result.append({"pairId": key[0], "id": key[1], "contentEventIndex": index,
            "contentKind": event["kind"], "contentFields": sorted(event["fields"]),
            "inPrimaryConventionEvents": key in primary, "hasExplicitPostContentOverride": key in post,
            "disposition": disposition})
    return result


def validate(pack):
    inputs = pack.get("conventionInputs")
    require(isinstance(inputs, dict), "convention source reader inputs missing")
    sources, selected, excluded, primary, post = frozen_sources(pack["root"], inputs)
    raw = inputs["registryRaw"]
    require(sha(raw) == REGISTRY_SHA, "frozen registry bytes differ")
    content_inputs = pack.get("uncertainContentInputs")
    require(isinstance(content_inputs, dict), "content source reader inputs missing")
    content._source_events(pack["root"], content_inputs)
    require(sha(content_inputs["registryRaw"]) == content.REGISTRY_SHA
            and sha(content_inputs["exceptionsRaw"]) == content.EXCEPTIONS_SHA, "content source/hold bytes differ")
    registry = json.loads(raw)
    exact(registry.get("evidenceFiles"), [
        {"path": evidence_path(kind), "gitPath": values[2], "gitCommit": SOURCE, "sha256": values[3]}
        for kind, values in SOURCES.items()] + [{"path": ERRATUM, "gitPath": ERRATUM_GIT_PATH,
        "gitCommit": ERRATUM_COMMIT, "sha256": ERRATUM_SHA},
        {"path": BATCHIM_ERRATUM, "gitPath": BATCHIM_ERRATUM_GIT_PATH,
         "gitCommit": BATCHIM_ERRATUM_COMMIT, "sha256": BATCHIM_ERRATUM_SHA}], "source proof descriptors differ")
    official = {row["id"]: (index, row) for index, row in enumerate(json.loads(inputs["erratumRaw"])["events"])
                if "supersedes" in row}
    require({(row["pairId"], row["id"]) for row in registry.get("supersededByContent", [])} == SUPERSEDED,
            "official superseded registry identities differ")
    for row in registry["supersededByContent"]:
        index, event = official[row["id"]]
        require(row.get("status") == "superseded-by-official-content-erratum"
                and row.get("officialAction") == event["action"] and row.get("reason") == event["reason"]
                and row.get("finalPhon") == event["finalPhon"], "official superseded action or aid differs")
        exact(row.get("officialEvent"), {"evidencePath": ERRATUM, "evidenceCollection": "events", "evidenceIndex": index},
              "official superseded pointer differs")
    cache_key = (str(pack["root"].resolve()), sha(raw), sha(pack["uncertainContentInputs"]["registryRaw"]),
                 tuple(sorted(pack["fingerprints"].items())))
    if cache_key in _CACHE:
        validated = _CACHE[cache_key]
        compare_actual(pack, validated["expected"])
        return validated
    baseline, before_documents, events, baseline_hashes, dependency_hashes = content_after(pack)
    matrix = overlap_matrix(events, selected, excluded, primary, post)
    require(len(matrix) == 69, "whole 638-content/source overlap matrix differs")
    exact(registry.get("overlapMatrix"), [row for row in matrix if (row["pairId"], row["id"]) not in excluded],
          "registry content overlap matrix differs")
    excluded_overlaps = [{"pairId": event["pair"], "id": event["id"], "contentEventIndex": index,
        "approvedContentFields": sorted(event["fields"]), "approvedContentAfter": event["after"]}
        for index, event in enumerate(events) if (event["pair"], event["id"]) in excluded]
    require(len(excluded_overlaps) == 3 and all(row["approvedContentFields"] == ["native"]
                                             for row in excluded_overlaps),
            "notApplied/content overlaps exceed three approved native-only events")
    exact(registry.get("notAppliedContentOverlaps"), excluded_overlaps, "notApplied/content overlap audit differs")
    require(registry.get("version") == 1 and registry.get("id") == "conventions-tranchees"
            and registry.get("status") == "frozen-owner-decided-phonetic-literals-not-global-native-approval"
            and registry.get("baseSnapshotCommit") == BASE, "registry edition differs")
    expected = copy.deepcopy(before_documents)
    occurrences, profiles = {key: [] for key in selected}, Counter()
    protected = {key: [] for key in set(excluded) | SUPERSEDED}
    source_before_mismatches = []
    for path, location, phrase, key, profile in phrase_occurrences(before_documents):
        if key in protected:
            protected[key].append({"path": path, "location": list(location), "profile": profile,
                                   "expectedBefore": snapshot(phrase)})
        if key not in selected:
            continue
        row = selected[key]
        require(type(phrase["phon"]) is str and phrase["phon"] == row["beforePhon"],
                "current B whole aid differs: " + str(key))
        before = snapshot(phrase)
        occurrences[key].append({"path": path, "location": list(location), "profile": profile,
                                "expectedBefore": before})
        after = content.at(expected[path], location)
        after["phon"] = row["afterPhon"]
        after["phoneticReviewStatus"] = "corrected-by-owner-" + row["convention"]
        after[ANNOTATION] = annotation(row, before)
        profiles[profile] += 1
    # Every frozen source event is first anchored against its original whole
    # typed tuple. Later B differences are admitted only by pinned content events.
    content_by_key = {(event["pair"], event["id"]): event for index, event in enumerate(events) if index != 211}
    for key, (event, pointer) in primary.items():
        anchor = event["occurrence"]
        original = content.at(baseline[anchor["path"]], anchor["location"])
        require(original["id"] == key[1], "source anchor identity differs")
        source_fields = {"study": event["study"], "phon": event["beforePhon"]}
        source_fields.update({field: event[field] for field in ("native", "reading") if field in event})
        for field, value in source_fields.items():
            require(type(value) is str and type(original.get(field)) is str and original[field] == value,
                    "frozen original whole tuple differs: " + str(key) + " " + field)
        current = content.at(before_documents[anchor["path"]], anchor["location"])
        differences = {field: {"frozenSource": value, "afterContent": current.get(field)}
                       for field, value in source_fields.items() if current.get(field) != value}
        if differences:
            require(key in content_by_key, "B difference lacks complete approved content event")
            require(set(differences) <= set(content_by_key[key]["fields"]), "B difference crosses content boundary")
            source_before_mismatches.append({"pairId": key[0], "id": key[1], "sourceEvent": pointer,
                                             "differences": differences})
    exact(registry.get("sourceBeforeMismatchesBeforeContent"), [], "unexpected original source mismatch")
    exact(registry.get("sourceBeforeMismatchesAfterContent"), source_before_mismatches,
          "current-B tuple mismatch audit differs")
    rows = registry.get("corrections")
    require(isinstance(rows, list) and len(rows) == len(selected), "registry selection count differs")
    seen = set()
    for row in rows:
        key = row.get("pairId"), row.get("id")
        require(key in selected and key not in seen, "unknown or duplicate whole event")
        seen.add(key)
        comparable_row = {**row, "occurrences": ordered_occurrences(row["occurrences"])}
        exact(comparable_row, {**selected[key], "occurrences": ordered_occurrences(occurrences[key])},
              "complete expected before/address differs")
        anchor = row["sourceAnchor"]
        require(anchor is None or any(occ["path"] == anchor["path"] and occ["location"] == anchor["location"]
                                     for occ in occurrences[key]), "original canonical/received anchor absent")
    require(seen == set(selected) and all(occurrences.values()), "approved source identity absent")
    require(profiles == {"canonical": 2099, "transport-phrase": 66, "received-model": 2},
            "independent canonical/copy/received counts differ")
    require(len(protected) == 72 and sum(map(len, protected.values())) == 78 and all(protected.values()),
            "excluded/superseded protection counts differ")
    protected_rows = {(row["pairId"], row["id"]): row for row in registry["protectedExcluded"]}
    require(set(protected_rows) == set(protected), "excluded/superseded identities differ")
    for key, values in protected.items():
        exact(ordered_occurrences(protected_rows[key]["occurrences"]), ordered_occurrences(values),
              "excluded/superseded whole B profiles differ")
        if key in excluded:
            event, pointer = excluded[key]
            require(all(type(occ["expectedBefore"][field]) is str
                        and occ["expectedBefore"][field] == event[field]
                        for occ in values for field in ("study", "phon")),
                    "notApplied original studied string or aid changed")
            exact(protected_rows[key]["sourceEvent"], pointer, "excluded pointer differs")
            if key in content_by_key:
                require(content_by_key[key]["fields"] == ["native"], "excluded overlap exceeds approved native field")
    exact(registry.get("occurrenceProfiles"), dict(sorted(profiles.items())), "registry profiles differ")
    require(tuple(registry.get(field) for field in ("sourceEventCount", "postContentOverrideCount", "sourceRecordCount",
        "correctionCount", "approvedFieldCount", "changedFieldCount", "appliedSourceReferenceCount", "occurrenceCount",
        "notAppliedCount")) == (2099, 21, 2120, 2100, 2100, 2100, 2122, 2167, 69), "registry totals differ")
    require(type(registry.get("batchimErratumEventCount")) is int
            and registry["batchimErratumEventCount"] == 5, "batchim whole-after erratum count differs")
    exact(registry.get("pairCounts"), dict(Counter(key[0] for key in selected)), "registry pair counts differ")
    manifest = expected[PREFIX + "manifest.json"]
    manifest[MANIFEST_KEY] = declaration(registry)
    for pair in manifest["pairs"]:
        path = PREFIX + "repertoires/" + pair["id"] + ".json"
        # Complete object equality is checked separately; actual-byte hashes
        # reflect the real runtime files, including their original whitespace.
        pair["repertoireSha256"] = pack["fingerprints"][path]
    compare_actual(pack, expected)
    validated = {"registrySha256": REGISTRY_SHA, "selected": selected, "occurrences": occurrences,
        "protected": protected, "expected": expected, "beforeDocuments": before_documents,
        "baselineSha256": baseline_hashes, "runtimeObjects": sum(profiles.values()),
        "contentDependencyRuntimeSha256": dependency_hashes,
        "runtimeProfiles": dict(sorted(profiles.items())), "sourceBeforeMismatchesAfterContent": source_before_mismatches,
        "overlapMatrix": matrix, "sources": sources}
    _CACHE[cache_key] = validated
    return validated


def compare_actual(pack, expected):
    actual = actual_documents(pack)
    require(set(actual) == set(expected), "runtime document set differs")
    for path in sorted(expected):
        exact(actual[path], expected[path], "actual after/unchanged field/role/placement differs: " + path)


def project_runtime(pack):
    validated = validate(pack)
    projected = dict(pack)
    projected["cells"] = copy.deepcopy(pack["cells"])
    projected["repertoires"] = copy.deepcopy(pack["repertoires"])
    projected["manifest"] = copy.deepcopy(pack["manifest"])
    projected["fingerprints"] = dict(pack["fingerprints"])
    documents = actual_documents(projected)
    for key, row in validated["selected"].items():
        for occurrence in validated["occurrences"][key]:
            phrase = content.at(documents[occurrence["path"]], occurrence["location"])
            phrase["phon"] = row["beforePhon"]
            phrase.pop(ANNOTATION)
            before = occurrence["expectedBefore"]
            if before["phoneticReviewStatusPresent"]:
                phrase["phoneticReviewStatus"] = before["phoneticReviewStatus"]
            else:
                phrase.pop("phoneticReviewStatus", None)
    projected["manifest"].pop(MANIFEST_KEY)
    projected_expected = dict(validated["beforeDocuments"])
    projected_expected[PREFIX + "manifest.json"] = copy.deepcopy(validated["beforeDocuments"][PREFIX + "manifest.json"])
    for pair in projected["manifest"]["pairs"]:
        path = PREFIX + "repertoires/" + pair["id"] + ".json"
        value = validated["contentDependencyRuntimeSha256"][path]
        pair["repertoireSha256"] = value
        projected["fingerprints"][path] = value
        expected_pair = next(item for item in projected_expected[PREFIX + "manifest.json"]["pairs"]
                             if item["id"] == pair["id"])
        expected_pair["repertoireSha256"] = value
    compare_actual(projected, projected_expected)
    return projected, validated


def validate_and_project(pack, previous_check):
    projected, validated = project_runtime(pack)
    result = previous_check(projected)
    result[MANIFEST_KEY] = {**declaration({}), "runtimeObjects": validated["runtimeObjects"],
        "runtimeProfiles": validated["runtimeProfiles"], "runtimeChangedFields": validated["runtimeObjects"],
        "sourceRecordCount": 2120, "acceptedSourceReferences": 2122,
        "protectedExcludedIdentities": 72, "protectedExcludedOccurrences": 78,
        "wholeRuntimeDataDocumentsCompared": 77, "globalNativeApproval": False,
        "contentDependencyCommit": CONTENT_DEPENDENCY_COMMIT,
        "validation": "Complete typed actual afters checked before private convention -> content -> legacy inverse."}
    result["checks"].update({"conventionSourceRecords": 2120, "conventionSourceReferencesApplied": 2122,
        "conventionBatchimErratumEvents": 5,
        "conventionCorrectionIdentities": 2100, "conventionRuntimeObjects": 2167,
        "conventionProtectedExcludedIdentities": 72, "conventionProtectedExcludedOccurrences": 78,
        "conventionWholeRuntimeDocumentsCompared": 77, "callerPackMutatedByProjection": False})
    # Historical counters see private inverse documents. Recount on real afters.
    content._refresh_actual_totals(pack, result, additional_annotations=(ANNOTATION,),
                                  additional_evidence_events=2122)
    return result


def adversarial_checks(pack, validated):
    """New faults scoped to this convention layer; no historical suite rerun."""
    documents = actual_documents(pack)
    cases = []

    def field_case(name, occurrence, field, value=None, remove=False, suffix=()):
        path, location = occurrence["path"], (*occurrence["location"], *suffix)
        def mutate(target):
            if remove:
                target.pop(field, None)
            else:
                target[field] = copy.deepcopy(value)
        cases.append((name, lambda: content.at(documents[path], location), mutate))

    row = next(iter(validated["selected"].values()))
    first = validated["occurrences"][(row["pairId"], row["id"])][0]
    for field, value in (("phon", row["beforePhon"]), ("study", "wrong study"), ("native", "wrong native"),
                         ("reading", None), ("phoneticReviewStatus", "global-native-approved"),
                         ("contentType", "wrong-type"), ("editorialLevel", True), ("source", {})):
        field_case("actual " + field + " forged", first, field, value)
    field_case("convention annotation missing", first, ANNOTATION, remove=True)
    field_case("annotation registry hash forged", first, "registrySha256", "0" * 64, suffix=(ANNOTATION,))
    field_case("annotation event index boolean", first, "evidenceIndex", False,
               suffix=(ANNOTATION, "events", 0))
    field_case("annotation before phon forged", first, "phon", "wrong before", suffix=(ANNOTATION, "beforeFields"))
    prior = next(occ for values in validated["occurrences"].values() for occ in values
                 if occ["expectedBefore"]["priorAnnotations"])
    field_case("prior annotation removed", prior, next(iter(prior["expectedBefore"]["priorAnnotations"])), remove=True)
    overridden = next((key, value) for key, value in validated["selected"].items() if len(value["events"]) == 2)
    field_case("post-content aid replaced with old source aid", validated["occurrences"][overridden[0]][0],
               "phon", validated["sources"]["batchim"]["events"][overridden[1]["events"][0]["evidenceIndex"]]["afterPhon"])
    for key in sorted(SUPERSEDED):
        occurrence = validated["protected"][key][0]
        field_case("officially superseded whole B aid changed " + key[1], occurrence, "phon", "old convention aid")
        field_case("officially superseded whole B study changed " + key[1], occurrence, "study", "old source study")
    excluded = next((key, values[0]) for key, values in validated["protected"].items() if key not in SUPERSEDED)
    field_case("notApplied aid converted", excluded[1], "phon", "unapproved suggested pronunciation")
    field_case("notApplied source tuple changed", excluded[1], "reading", "invented reading")
    for profile in ("canonical", "transport-phrase", "received-model"):
        occurrence = next(occ for values in validated["occurrences"].values() for occ in values if occ["profile"] == profile)
        field_case(profile + " stale after", occurrence, "phon", occurrence["expectedBefore"]["phon"])
        path, parent, index = occurrence["path"], occurrence["location"][:-1], occurrence["location"][-1]
        cases.append((profile + " occurrence missing", lambda p=path, l=parent: content.at(documents[p], l),
                      lambda target, i=index: target.pop(i)))
        cases.append((profile + " occurrence duplicated", lambda p=path, l=parent: content.at(documents[p], l),
                      lambda target, i=index: target.append(copy.deepcopy(target[i]))))
    received = next(occ for values in validated["occurrences"].values() for occ in values if occ["profile"] == "received-model")
    field_case("received production role invented", received, "productionEligible", True)
    manifest_occ = {"path": PREFIX + "manifest.json", "location": []}
    field_case("manifest convention declaration missing", manifest_occ, MANIFEST_KEY, remove=True)
    field_case("manifest count boolean", manifest_occ, "correctionCount", True, suffix=(MANIFEST_KEY,))
    field_case("access declaration invented", manifest_occ, "publicationApproved", True)
    for event in validated["sources"]["batchimErratum"]["events"]:
        key = "fr-ko", event["id"]
        field_case("superseded delivered batchim after restored " + event["id"],
                   validated["occurrences"][key][0], "phon", event["deliveredAfterPhon"])
    for key in ("registryRaw", "jotaRaw", "batchimRaw", "erratumRaw", "batchimErratumRaw"):
        cases.append(("frozen " + key + " altered", lambda: pack["conventionInputs"],
                      lambda target, k=key: target.update({k: target[k] + b"\n"})))
    results = []
    for name, resolve, mutate in cases:
        target, saved = resolve(), copy.deepcopy(resolve())
        try:
            mutate(target)
            try:
                validate(pack)
            except (ValueError, KeyError, TypeError):
                results.append(name)
            else:
                raise AssertionError("New convention fault accepted: " + name)
        finally:
            if isinstance(target, dict):
                target.clear()
                target.update(saved)
            else:
                target[:] = saved
    validate(pack)
    return results


def audit_report(pack, validated, adverse):
    hashes = {path: value for path, value in sorted(pack["fingerprints"].items()) if path.startswith(PREFIX)}
    counterread = DIRECTORY + "/contrelecture-linguistique-independante.json"
    linguistic = json.loads((pack["root"] / counterread).read_bytes())
    require(linguistic.get("resolvedMaterialFindings") == 5 and linguistic.get("unresolvedMaterialFindings") == 0
            and linguistic.get("resolution", {}).get("sha256") == BATCHIM_ERRATUM_SHA,
            "linguistic counterread no longer records the five exact official whole-after resolutions")
    return {"version": 1, "checker": "independent-no-generation-module-import",
        "checkerSha256": sha(Path(__file__).read_bytes()), "sourceCommit": SOURCE, "baseSnapshotCommit": BASE,
        "contentDependencyCommit": CONTENT_DEPENDENCY_COMMIT, "contentCheckerSha256": CONTENT_CHECKER_SHA,
        "contentDependencyRuntimeSha256": validated["contentDependencyRuntimeSha256"],
        "sourceSha256": {kind: values[3] for kind, values in SOURCES.items()}, "registrySha256": REGISTRY_SHA,
        "sourcePrimaryEvents": 2099, "sourcePostContentRecords": 21, "sourceRecordsAudited": 2120,
        "postContentOverridesOfPrimaryEvents": 17, "postContentNewIdentities": 4,
        "acceptedIdentities": 2100, "acceptedSourceReferences": 2122,
        "batchimErratumEventCount": 5, "batchimErratumCommit": BATCHIM_ERRATUM_COMMIT,
        "batchimErratumSha256": BATCHIM_ERRATUM_SHA,
        "officiallySupersededIdentitiesPreserveWholeContentResult": [list(key) for key in sorted(SUPERSEDED)],
        "officialContentErratumCommit": ERRATUM_COMMIT, "officialContentErratumSha256": ERRATUM_SHA,
        "officialContentErratumEventsAudited": 4,
        "notAppliedIdentities": 69, "protectedExcludedIdentities": 72, "protectedExcludedOccurrences": 78,
        "runtimeObjects": validated["runtimeObjects"], "runtimeProfiles": validated["runtimeProfiles"],
        "runtimeChangedFields": validated["runtimeObjects"], "runtimeSha256": hashes,
        "runtimeBundleSha256": sha(canonical(hashes)), "baselineSha256": validated["baselineSha256"],
        "wholeRuntimeDataDocumentsCompared": 77, "manifestComparedSeparately": True,
        "wholeTypedTuplePriorAnnotationsExactLocationsRolesCopiesAndStepsChecked": True,
        "inverseProjectionOrder": ["conventions", "content", "legacy"],
        "overlapMatrixSourceContentEvents": 638, "overlapMatrix": validated["overlapMatrix"],
        "sourceBeforeMismatchesAfterContent": validated["sourceBeforeMismatchesAfterContent"],
        "adversarialFaultsRejected": adverse,
        "linguisticCounterread": {"path": counterread, "sha256": sha((pack["root"] / counterread).read_bytes()),
                                  "resolvedMaterialFindings": 5, "unresolvedMaterialFindings": 0,
                                  "scope": "systematic changed-word and whole-aid counterread; finite findings recorded separately"},
        "globalNativeApproval": False, "globalPhoneticApproval": False}


def markdown_report(report):
    return "\n".join(["# Vérification indépendante des conventions tranchées", "",
        "Les 2 120 enregistrements sources sont contrôlés depuis les octets Git figés : 2 099 événements et "
        "21 après-contenu. Ces derniers remplacent 17 événements et ajoutent quatre identités. "
        "Trois événements antérieurs sont remplacés officiellement par le bloc de contenu : leur tuple approuvé est conservé entier. "
        "La sélection effective compte 2 100 identités et 2 122 références sources acceptées, dont cinq "
        "remplacements entiers attestés par l’erratum batchim d5ad5e4.", "",
        "Le contrôle compare les 70 cellules et sept banques complètes, puis le manifeste : "
        "2 167 objets (2 099 canoniques, 66 copies et deux modèles reçus). Seuls l’aide, son statut et "
        "son annotation changent. Les 69 exclus et trois événements remplacés restent protégés dans leurs 78 objets. "
        "La matrice croise les 638 décisions de contenu avec les événements initiaux, les 21 après-contenu "
        "et les 69 exclus ; les trois chevauchements exclus ne changent que le sens approuvé en contenu.", "",
        "Les objets réels, types JSON, annotations antérieures, rôles reçus, emplacements et étapes sont "
        "vérifiés avant toute projection privée convention → contenu → historique. Aucune génération ni "
        "conversion phonétique n’est importée par ce lecteur.", "",
        f"Tests négatifs propres à cette couche : **{len(report['adversarialFaultsRejected'])} fautes rejetées**. "
        "Le résultat ne constitue pas une certification native ou phonétique globale.", "",
        "La [contrelecture linguistique](contrelecture-linguistique-independante.md) a repéré cinq erreurs sources "
        "matérielles, toutes résolues par l’erratum entier officiel. Les autres observations restent qualifiées. "
        "La fidélité mécanique aux événements figés ne vaut "
        "pas approbation linguistique de chacun de leurs littéraux.", "",
        "Reproduction :", "", "```sh",
        "python3 tools/maquette-guidee/check_conventions_independent.py --self-test --check-report",
        "python3 tools/maquette-guidee/check_levels_independent.py --base-ref origin/main --check-report",
        "```", "", f"SHA du registre : `{REGISTRY_SHA}`.",
        f"SHA des fichiers runtime réels : `{report['runtimeBundleSha256']}`.", ""])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--write-report", action="store_true")
    parser.add_argument("--check-report", action="store_true")
    projection = parser.add_mutually_exclusive_group()
    projection.add_argument("--project-runtime", action="store_true",
                            help="Emit independently validated private B documents; never write them")
    projection.add_argument("--project-content-runtime", action="store_true",
                            help="Emit independently validated private pre-B documents through C then B")
    args = parser.parse_args()
    try:
        from check_levels_independent import read_pack
        pack = read_pack(args.root.resolve())
        if "conventionInputs" not in pack:
            def raw(path):
                value = (pack["root"] / path).read_bytes()
                pack["fingerprints"][path] = sha(value)
                return value
            pack["conventionInputs"] = input_data(pack["root"], raw)
        validated = validate(pack)
        if args.project_runtime or args.project_content_runtime:
            projected, _validated = project_runtime(pack)
            summary = {"conventions": {**declaration({}), "runtimeObjects": validated["runtimeObjects"],
                                       "contentDependencyCommit": CONTENT_DEPENDENCY_COMMIT,
                                       "runtimeProfiles": validated["runtimeProfiles"]}}
            if args.project_content_runtime:
                projected, content_validated = content.project_runtime(projected)
                summary["content"] = {**content_validated["declaration"],
                    "runtimeObjects": content_validated["runtimeObjects"],
                    "runtimeProfiles": content_validated["runtimeProfiles"],
                    "runtimeChangedFields": content_validated["runtimeChangedFields"]}
                exported_documents = content.export_before_documents(projected, content_validated)
            else:
                exported_documents = validated["beforeDocuments"]
            for path, checksum in pack["fingerprints"].items():
                require(sha((pack["root"] / path).read_bytes()) == checksum,
                        "actual input bytes changed during projection: " + path)
            print(json.dumps({"summary": summary, "documents": exported_documents,
                "actualDocumentsSha256": {path: sha(canonical(document))
                                           for path, document in actual_documents(pack).items()},
                "actualRawDocumentSha256": {path: pack["fingerprints"][path] for path in actual_documents(pack)}},
                ensure_ascii=False, separators=(",", ":")))
            return 0
        adverse = adversarial_checks(pack, validated) if args.self_test else []
        report = audit_report(pack, validated, adverse)
        for path, checksum in pack["fingerprints"].items():
            require(sha((pack["root"] / path).read_bytes()) == checksum,
                    "actual input bytes changed during verification: " + path)
        outputs = {DIRECTORY + "/verification-independante.json": json.dumps(report, ensure_ascii=False, indent=2) + "\n",
                   DIRECTORY + "/verification-independante.md": markdown_report(report)}
        if args.write_report:
            for path, data in outputs.items():
                (pack["root"] / path).write_text(data)
        if args.check_report:
            for path, data in outputs.items():
                require((pack["root"] / path).read_text() == data, "audit report stale: " + path)
        print(json.dumps({"runtimeObjects": validated["runtimeObjects"], "runtimeProfiles": validated["runtimeProfiles"],
                          "adversarialFaultsRejected": len(adverse), "registrySha256": REGISTRY_SHA}))
        return 0
    except (OSError, ValueError, KeyError, TypeError, subprocess.CalledProcessError) as error:
        print("Independent convention verification failed: " + str(error), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

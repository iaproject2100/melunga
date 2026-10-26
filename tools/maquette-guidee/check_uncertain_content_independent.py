#!/usr/bin/env python3
"""Read-only independent verification of the finite content tranche.

No generation module is imported. Frozen Git evidence, all 77 source JSON
documents, exact occurrence addresses and whole objects are checked before any
private inverse projection is passed to the historical independent verifier.
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

ROOT = Path(__file__).resolve().parents[2]
BASE = "13f42b5814f2b230d76d2d0ef267dcf406c523c2"
EVIDENCE_COMMIT = "17b003810a15954d933f49decc2bafa53de8d881"
EVIDENCE_GIT_PATH = "docs/revue-integrale/contenu-incertain/registre-contenu.json"
EVIDENCE_SHA = "0276ad1dac00161a6619de315d22d558f65b55a8821f3ddab95a1f10ad9a9e02"
ERRATUM_COMMIT = "4247ca470354f59ea37992608b38e3728a6e22f9"
ERRATUM_GIT_PATH = "docs/revue-integrale/contenu-incertain/errata-1.json"
ERRATUM_SHA = "5418f06dcef98785a617e55a2f033c9bbdd99d9b563efe28f689fca81b9e1453"
REGISTRY_SHA = "3fa187478a03e1398e7b14fa545c0950bf1ff166789a480745ca689061377130"
DIRECTORY = "docs/niveaux-progressifs/contenu-tranche"
REGISTRY = DIRECTORY + "/registre-contenu-tranche.json"
EVIDENCE = DIRECTORY + "/evidence-registre-contenu.json"
ERRATUM = DIRECTORY + "/evidence-errata-1.json"
EVIDENCE_README = DIRECTORY + "/evidence-README.md"
README_SHA = "e8db013b8fa4a8fda5e87bf75fa199faf742459ba326e8f33f9c190c543608c6"
EXCEPTIONS = DIRECTORY + "/exceptions-contenu-tranche.json"
EXCEPTIONS_SHA = "ac33db585c121465613d6e0fcd41131986271b48c4a057ec867062d2d2655844"
PREFIX = "melunga_deploy/content/niveaux-progressifs/"
ANNOTATION = "uncertainContentCorrection"
MANIFEST_KEY = "uncertainContentCorrections"
STATUS = "corrected-by-Claude-content-tranche"
PAIRS = ("fr-en", "fr-es", "fr-it", "fr-zh", "fr-ja", "fr-ko", "zh-fr")
PRIOR_ANNOTATIONS = (
    "phoneticCorrection", "reviewedFieldCorrection", "lot4PhoneticCorrection",
    "reviewedContentCorrection", "lot5FieldCorrection", "lot5ContentCorrection",
    "lot6FieldCorrection", "lot6ContentCorrection", "lot7PhoneticCorrection",
    "lot7ContentCorrection", "lot8PhoneticCorrection", "lot8ContentCorrection",
    "lot8Erratum1Correction", "lot9PhoneticCorrection", "lot9ContentCorrection",
)
_CACHE = {}
_VALIDATION_CACHE = {}


def require(condition, explanation):
    if not condition:
        raise ValueError("Content tranche: " + explanation)


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def sha(value):
    return hashlib.sha256(value).hexdigest()


def git_bytes(root, commit, path):
    return subprocess.run(["git", "show", commit + ":" + path], cwd=root,
                          capture_output=True, check=True).stdout


def walk(value, location=()):
    if isinstance(value, dict):
        yield location, value
        for key, child in value.items():
            if isinstance(child, (dict, list)):
                yield from walk(child, (*location, key))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            if isinstance(child, (dict, list)):
                yield from walk(child, (*location, index))


def at(document, location):
    for key in location:
        document = document[key]
    return document


def source_documents(root):
    key = str(root.resolve())
    if key not in _CACHE:
        paths = [PREFIX + pair + f"/L{level}.json" for pair in PAIRS for level in range(1, 11)]
        paths += [PREFIX + "repertoires/" + pair + ".json" for pair in PAIRS]
        paths += [PREFIX + "manifest.json"]
        raw = {path: git_bytes(root, BASE, path) for path in paths}
        _CACHE[key] = ({path: json.loads(data) for path, data in raw.items()},
                       {path: sha(data) for path, data in raw.items()})
    return _CACHE[key]


def before_snapshot(phrase):
    result = {field: copy.deepcopy(phrase.get(field)) for field in ("study", "native", "phon", "source")}
    for field in ("reading", "phoneticReviewStatus", *PRIOR_ANNOTATIONS):
        result[field + "Present"] = field in phrase
        result[field] = copy.deepcopy(phrase.get(field))
    return result


def input_data(root, raw):
    """Extend the main reader's actual-file fingerprints without producing data."""
    raw("tools/maquette-guidee/check_uncertain_content_independent.py")
    return {"registryRaw": raw(REGISTRY), "evidenceRaw": raw(EVIDENCE), "readmeRaw": raw(EVIDENCE_README),
            "exceptionsRaw": raw(EXCEPTIONS), "erratumRaw": raw(ERRATUM)}


def actual_documents(pack):
    documents = {PREFIX + pair + f"/L{level}.json": document
                 for (pair, level), document in pack["cells"].items()}
    documents.update({PREFIX + "repertoires/" + pair + ".json": document
                      for pair, document in pack["repertoires"].items()})
    documents[PREFIX + "manifest.json"] = pack["manifest"]
    return documents


def _source_events(root, inputs):
    raw = inputs["evidenceRaw"]
    require(sha(raw) == EVIDENCE_SHA and raw == git_bytes(root, EVIDENCE_COMMIT, EVIDENCE_GIT_PATH),
            "frozen 638-event source bytes changed")
    source = json.loads(raw)
    require(sha(inputs["readmeRaw"]) == README_SHA
            and inputs["readmeRaw"] == git_bytes(root, EVIDENCE_COMMIT,
                                                "docs/revue-integrale/contenu-incertain/README.md"),
            "frozen decision README differs")
    events = source.get("events")
    require(source.get("baseSnapshotCommit") == BASE and isinstance(events, list) and len(events) == 638,
            "wrong source edition or selection count")
    require(Counter(event.get("kind") for event in events) == {"glose": 478, "bloc": 160},
            "gloss/bundle selection changed")
    require(len({(event["pair"], event["id"]) for event in events}) == 638,
            "duplicate source identity")
    for event in events:
        fields = event.get("fields")
        require(event["pair"] in PAIRS and isinstance(fields, list) and len(set(fields)) == len(fields)
                and set(fields) <= {"study", "native", "phon", "reading"}
                and set(fields) == set(event["before"]) == set(event["after"]),
                "source field set is not a finite whole event")
        require(all(type(event[side][field]) is str for side in ("before", "after") for field in fields),
                "literal field is not a string")
        require((event["kind"] == "glose" and fields == ["native"])
                or (event["kind"] == "bloc" and "study" in fields), "wrong event kind")
    require(sum(source["counts"]["ecartes"].values()) == 145, "rejected proposal count changed")
    erratum_raw = inputs["erratumRaw"]
    require(sha(erratum_raw) == ERRATUM_SHA and erratum_raw == git_bytes(root, ERRATUM_COMMIT, ERRATUM_GIT_PATH),
            "author erratum differs from its pinned Git object")
    erratum = json.loads(erratum_raw)
    corrections = erratum.get("events", [])
    require(erratum.get("id") == "contenu-incertain-errata-1" and len(corrections) == 4
            and [(row.get("id"), row.get("action")) for row in corrections] == [
                ("catalogue:it:1239", "retirer-l-evenement-de-contenu"),
                ("catalogue:es:3353", "appliquer-le-bloc-seul"),
                ("catalogue:ko:3767", "appliquer-le-bloc-seul"),
                ("catalogue:ko:3637", "appliquer-le-bloc-avec-cette-aide")], "author erratum scope changed")
    by_id = {event["id"]: event for event in events}
    for correction in corrections[1:3]:
        require(by_id[correction["id"]]["after"]["phon"] == correction["finalPhon"],
                "author block-only decision no longer matches its literal source")
    row = corrections[3]
    event = by_id[row["id"]]
    require(event["after"]["phon"] == row["blocAfterPhon"]
            and event["after"]["study"] == row["study"]
            and event["after"]["reading"] == row["reading"] and isinstance(row["finalPhon"], str),
            "Korean linked whole-block erratum chain changed")
    event["after"]["phon"] = row["finalPhon"]
    return source, events


def annotation(event, index, before, registry_hash):
    return {"id": event["id"], "registryPath": REGISTRY, "registrySha256": registry_hash,
            "baseSnapshotCommit": BASE, "fields": sorted(event["fields"]),
            "beforeFields": {field: before[field] for field in sorted(event["fields"])},
            "originalPhoneticReviewStatusPresent": "phoneticReviewStatus" in before,
            "originalPhoneticReviewStatus": before.get("phoneticReviewStatus"),
            "evidenceCommits": [EVIDENCE_COMMIT, ERRATUM_COMMIT], "kind": event["kind"], "evidenceEventIndex": index}


def concept(phrase):
    explicit = phrase.get("lexicalConceptId")
    if explicit:
        return "leger" if explicit in {"leger", "léger", "le\u0301ger"} else explicit
    return sha(canonical((phrase["study"], phrase["native"])))


def theme_concept_counts(documents):
    """Count real primaries and declared review/context references, read-only."""
    for pair in PAIRS:
        bank = documents[PREFIX + "repertoires/" + pair + ".json"]
        copied = {phrase["id"]: phrase for phrase in bank["phrases"]}
        for level in range(1, 11):
            cell = documents[PREFIX + pair + f"/L{level}.json"]
            for theme in cell["themes"] + cell.get("heldThemes", []):
                phrases = list(theme["phrases"])
                for reference in theme.get("reviewReferences", []) + theme.get("contextReferences", []):
                    require(reference["id"] in copied, "unbanked concept-count reference")
                    phrases.append(copied[reference["id"]])
                yield pair, level, theme, len({concept(phrase) for phrase in phrases})


def refresh_concept_counts(documents):
    for _pair, _level, theme, count in theme_concept_counts(documents):
        theme["pedagogicalConceptCount"] = count


def first_difference(actual, expected, location=()):
    if type(actual) is not type(expected):
        return location
    if isinstance(expected, dict):
        if set(actual) != set(expected):
            return (*location, "<keys>")
        for key in expected:
            difference = first_difference(actual[key], expected[key], (*location, key))
            if difference is not None:
                return difference
    elif isinstance(expected, list):
        if len(actual) != len(expected):
            return (*location, "<length>")
        for index, (left, right) in enumerate(zip(actual, expected)):
            difference = first_difference(left, right, (*location, index))
            if difference is not None:
                return difference
    elif actual != expected:
        return location
    return None


def validate(pack):
    """Check actual complete documents against independently constructed afters."""
    root = pack["root"]
    inputs = pack.get("uncertainContentInputs")
    require(isinstance(inputs, dict), "missing tranche reader inputs")
    source, events = _source_events(root, inputs)
    registry_raw = inputs["registryRaw"]
    registry, registry_hash = json.loads(registry_raw), sha(registry_raw)
    require(registry_hash == REGISTRY_SHA, "frozen registry bytes differ")
    require(sha(inputs["exceptionsRaw"]) == EXCEPTIONS_SHA, "frozen Italian withdrawal bytes differ")
    exceptions = json.loads(inputs["exceptionsRaw"])
    held = events[211]
    withdrawals = exceptions.get("withdrawals", [])
    require(exceptions.get("status") == "officially-withdrawn-whole-block"
            and exceptions.get("erratumCommit") == ERRATUM_COMMIT
            and len(withdrawals) == 1 and withdrawals[0].get("eventIndex") == 211
            and (withdrawals[0].get("pair"), withdrawals[0].get("id")) == (held["pair"], held["id"])
            and withdrawals[0].get("before") == held["before"] and withdrawals[0].get("rejectedAfter") == held["after"],
            "Italian withdrawal no longer matches the exact source block")
    accepted_pair_counts = copy.deepcopy(source["counts"]["parCouple"])
    accepted_pair_counts["fr-it"]["blocs"] -= 1
    require(registry.get("version") == 1 and registry.get("id") == "contenu-incertain-tranche"
            and registry.get("status") == "frozen-whole-content-events-not-global-native-or-phonetic-approval"
            and registry.get("baseSnapshotCommit") == BASE
            and registry.get("kindCounts") == {"glose": 478, "bloc": 159}
            and registry.get("pairCounts") == accepted_pair_counts
            and registry.get("rejectedCount") == 145
            and registry.get("rejectedCounts") == source["counts"]["ecartes"]
            and registry.get("sourceEventCount") == 638 and registry.get("withdrawnEventCount") == 1
            and registry.get("withdrawnEvents") == [{"eventIndex": 211, "pair": "fr-it", "id": "catalogue:it:1239"}]
            and registry.get("authorErratum") == {"evidencePath": ERRATUM, "eventCount": 4,
                "withdrawnSourceEventIndices": [211], "correctedSourceEventIndices": [467],
                "confirmedBlockOnlySourceEventIndices": [76, 426]}
            and registry.get("exceptionsFile") == {"path": EXCEPTIONS, "sha256": EXCEPTIONS_SHA},
            "registry edition or decisions differ")
    cache_key = (str(root.resolve()), registry_hash, tuple(sorted(pack["fingerprints"].items())))
    if cache_key in _VALIDATION_CACHE:
        expected, result = _VALIDATION_CACHE[cache_key]
        _compare_actual(pack, expected)
        return result
    baseline, baseline_hashes = source_documents(root)
    actual = actual_documents(pack)
    require(set(actual) == set(baseline), "runtime must have exactly all 77 cells and banks plus manifest")
    selected_events = [(index, event) for index, event in enumerate(events) if index != 211]
    lookup = {(event["pair"], event["id"]): (index, event) for index, event in selected_events}
    occurrences = {key: [] for key in lookup}
    expected = copy.deepcopy(baseline)
    profiles, field_counts = Counter(), Counter()
    for path, document in baseline.items():
        if path.endswith("/manifest.json"):
            continue
        pair = document.get("pairId", document.get("id"))
        for location, phrase in walk(document):
            if not all(isinstance(phrase.get(field), str) for field in ("id", "study", "native", "phon")):
                continue
            key = pair, phrase["id"]
            if key not in lookup:
                continue
            index, event = lookup[key]
            require(all(phrase.get(field) == event["before"][field] for field in event["fields"]),
                    "source/copy before literal differs for " + str(key))
            profile = ("received-model" if location and location[0] == "receivedModels" else "transport-phrase") \
                if "/repertoires/" in path else "canonical"
            occurrence = {"path": path, "location": list(location), "profile": profile,
                          "expectedBefore": before_snapshot(phrase), "expectedBeforeObjectSha256": sha(canonical(phrase))}
            occurrences[key].append(occurrence)
            after = at(expected[path], location)
            after.update(event["after"])
            if "phon" in event["fields"] and event["before"]["phon"] != event["after"]["phon"]:
                after["phoneticReviewStatus"] = STATUS
            after[ANNOTATION] = annotation(event, index, phrase, registry_hash)
            profiles[profile] += 1
            field_counts.update(event["fields"])
    rows = registry.get("corrections")
    require(isinstance(rows, list) and len(rows) == 637, "registry must declare exactly 637 accepted source events")
    seen = set()
    for values in occurrences.values():
        values.sort(key=lambda occurrence: (occurrence["path"], canonical(occurrence["location"])))
    for row in rows:
        key = row.get("pairId"), row.get("id")
        require(key in lookup and key not in seen, "unknown or duplicate registry identity")
        seen.add(key)
        index, event = lookup[key]
        require(type(row.get("eventIndex")) is int and row["eventIndex"] == index
                and row.get("kind") == event["kind"] and row.get("atomicBundle") is (event["kind"] == "bloc")
                and row.get("fields") == {field: {"before": event["before"][field], "after": event["after"][field]}
                                           for field in event["fields"]},
                "registry event does not equal pinned typed literal source")
        require(row.get("occurrences") == occurrences[key], "registry full before profiles or exact addresses differ")
        anchor = event["occurrence"]
        require(any(occ["path"] == anchor["path"] and occ["location"] == anchor["location"]
                    for occ in occurrences[key]), "source event position missing")
    require(profiles == {"canonical": 626, "transport-phrase": 17, "received-model": 11}
            and field_counts == {"native": 528, "study": 159, "phon": 150, "reading": 50},
            "independent object/field counts changed")
    declaration = _declaration(registry, registry_hash)
    expected[PREFIX + "manifest.json"][MANIFEST_KEY] = declaration
    inherited_counts = {(pair, level, theme["id"]): count
                        for pair, level, theme, count in theme_concept_counts(baseline)}
    metadata_changes = []
    for pair, level, theme, count in theme_concept_counts(expected):
        before = theme["pedagogicalConceptCount"]
        if before != count:
            metadata_changes.append({"pairId": pair, "level": level, "themeId": theme["id"],
                "before": before, "after": count,
                "inherited": inherited_counts[(pair, level, theme["id"])] != before})
    require(registry.get("derivedMetadataChanges") == metadata_changes,
            "derived concept metadata differs from independently recounted before/afters")
    refresh_concept_counts(expected)
    for pair in expected[PREFIX + "manifest.json"]["pairs"]:
        path = PREFIX + "repertoires/" + pair["id"] + ".json"
        require(path in pack["fingerprints"], "actual/projected bank fingerprint missing")
        pair["repertoireSha256"] = pack["fingerprints"][path]
    _compare_actual(pack, expected)
    result = {"declaration": declaration, "source": source, "events": [event for _, event in selected_events], "occurrences": occurrences,
            "baseline": baseline, "baselineSha256": baseline_hashes, "registrySha256": registry_hash,
            "runtimeObjects": sum(profiles.values()), "runtimeProfiles": dict(profiles),
            "runtimeChangedFields": sum(field_counts.values()), "fieldOccurrences": dict(field_counts),
            "derivedMetadataChanges": metadata_changes}
    _VALIDATION_CACHE[cache_key] = expected, result
    return result


def _compare_actual(pack, expected):
    actual = actual_documents(pack)
    require(set(actual) == set(expected), "runtime document set changed")
    for path in sorted(expected):
        difference = first_difference(actual[path], expected[path])
        require(difference is None, "unapproved actual after/guard/placement at " + path + " " + repr(difference))


def _declaration(registry, registry_hash):
    fields = ("correctionCount", "eventCount", "approvedFieldCount", "changedFieldCount")
    require(tuple(registry.get(field) for field in fields) == (637, 637, 870, 870), "registry totals changed")
    predecessor = [{"registryPath": "docs/niveaux-progressifs/corrections-contenu/lot9/revue-contenu-lot9.json",
                    "registrySha256": "db40f6ae9a0b88595b0c4f5591b7ca1263b5ff1facfb9d6c1c723e6ed204ad74"}]
    require(registry.get("appliesAfter") == predecessor, "preceding correction registry differs")
    return {"registryPath": REGISTRY, "registrySha256": registry_hash, "baseSnapshotCommit": BASE,
            "appliesAfter": registry["appliesAfter"], **{field: registry[field] for field in fields},
            **{field: registry[field] for field in ("kindCounts", "pairCounts", "rejectedCount", "rejectedCounts")},
            **{field: registry[field] for field in ("sourceEventCount", "withdrawnEventCount", "withdrawnEvents", "exceptionsFile", "authorErratum")},
            "evidenceCommits": [EVIDENCE_COMMIT, ERRATUM_COMMIT]}


def project_runtime(pack):
    validated = validate(pack)
    # Validation above already compared every complete actual document. The
    # private inverse below restores only explicitly approved fields/annotations.
    projected = dict(pack)
    projected["cells"] = copy.deepcopy(pack["cells"])
    projected["repertoires"] = copy.deepcopy(pack["repertoires"])
    projected["manifest"] = copy.deepcopy(pack["manifest"])
    projected["fingerprints"] = dict(pack["fingerprints"])
    documents = actual_documents(projected)
    for event in validated["events"]:
        for occurrence in validated["occurrences"][(event["pair"], event["id"])]:
            phrase = at(documents[occurrence["path"]], occurrence["location"])
            phrase.update(event["before"])
            phrase.pop(ANNOTATION)
            before = occurrence["expectedBefore"]
            if before["phoneticReviewStatusPresent"]:
                phrase["phoneticReviewStatus"] = before["phoneticReviewStatus"]
            else:
                phrase.pop("phoneticReviewStatus", None)
    projected["manifest"].pop(MANIFEST_KEY)
    # The original source counters intentionally precede historical inverses;
    # preserve those exact values after independently checking corrected counts.
    for (pair, level), cell in projected["cells"].items():
        original = validated["baseline"][PREFIX + pair + f"/L{level}.json"]
        for name in ("themes", "heldThemes"):
            for theme, before_theme in zip(cell.get(name, []), original.get(name, [])):
                theme["pedagogicalConceptCount"] = before_theme["pedagogicalConceptCount"]
    for pair in projected["manifest"]["pairs"]:
        path = PREFIX + "repertoires/" + pair["id"] + ".json"
        value = sha((json.dumps(documents[path], ensure_ascii=False, indent=2) + "\n").encode())
        pair["repertoireSha256"] = value
        projected["fingerprints"][path] = value
    return projected, validated


def validate_and_project(pack, previous_check):
    projected, validated = project_runtime(pack)
    result = previous_check(projected)
    result[MANIFEST_KEY] = {**validated["declaration"], "runtimeObjects": validated["runtimeObjects"],
        "runtimeProfiles": validated["runtimeProfiles"], "runtimeChangedFields": validated["runtimeChangedFields"],
        "fieldOccurrences": validated["fieldOccurrences"], "globalNativeApproval": False,
        "derivedMetadataChanges": validated["derivedMetadataChanges"],
        "independentlyComparedFullRuntimeDocuments": 77,
        "validation": "all actual complete objects and unchanged fields checked before finite inverse projection"}
    result["checks"].update({"uncertainContentSourceEventsAudited": 638,
        "uncertainContentEvents": 637, "uncertainContentGlosses": 478,
        "uncertainContentAtomicBundles": 159, "uncertainContentRuntimeObjects": validated["runtimeObjects"],
        "uncertainContentRuntimeFields": validated["runtimeChangedFields"],
        "uncertainContentRejectedProposalsNotApplied": 145,
        "uncertainContentSelectedSourceEventWithdrawnUnchanged": 1,
        "uncertainContentUnchangedFieldsPriorAnnotationsCopiesAndPositionsChecked": True,
        "callerPackMutatedByProjection": False})
    _refresh_actual_totals(pack, result)
    return result


def export_before_documents(projected, validated):
    """Export exact source metadata only after proving every inverse object."""
    documents = actual_documents(projected)
    baseline = validated["baseline"]
    for path, document in documents.items():
        if path.endswith("/manifest.json"):
            continue
        require(first_difference(document, baseline[path]) is None,
                "private inverse no longer equals its full pinned source document: " + path)
    source_pairs = {pair["id"]: pair for pair in baseline[PREFIX + "manifest.json"]["pairs"]}
    for pair in projected["manifest"]["pairs"]:
        path = PREFIX + "repertoires/" + pair["id"] + ".json"
        source_hash = validated["baselineSha256"][path]
        require(source_pairs[pair["id"]]["repertoireSha256"] == source_hash,
                "source manifest bank hash differs from pinned source bytes")
        pair["repertoireSha256"] = source_hash
    require(first_difference(projected["manifest"], baseline[PREFIX + "manifest.json"]) is None,
            "exported inverse manifest differs beyond proven source bank hashes")
    return documents


def _refresh_actual_totals(pack, result, *, additional_annotations=(), additional_evidence_events=637):
    """Historical validators see the inverse; reported totals see real afters."""
    checks = result["checks"]
    identities, objects, fields, canonical_ids, canonical_fields, phonetic_ids = (set() for _ in range(6))
    catalogue_differences, noncatalogue = Counter(), Counter()
    heard_fields = 0
    for path, document in actual_documents(pack).items():
        if path.endswith("/manifest.json"):
            continue
        pair = document.get("pairId", document.get("id"))
        for location, phrase in walk(document):
            if not all(isinstance(phrase.get(field), str) for field in ("id", "study", "native", "phon")):
                continue
            changed = {"phon"} if "phoneticCorrection" in phrase else set()
            for name in (*PRIOR_ANNOTATIONS[1:], ANNOTATION, *additional_annotations):
                review = phrase.get(name)
                if review:
                    changed.update(field for field in review["fields"]
                                   if phrase.get(field) != review["beforeFields"].get(field))
            identity, address = (pair, phrase["id"]), (path, location)
            is_canonical = "/repertoires/" not in path
            if changed:
                identities.add(identity); objects.add(address)
                fields.update((address, field) for field in changed)
                if "phon" in changed:
                    phonetic_ids.add(identity)
                if is_canonical:
                    canonical_ids.add(identity)
                    canonical_fields.update((identity, field) for field in changed)
            collection = phrase.get("source", {}).get("collection", "")
            if not is_canonical:
                if collection.startswith("situation-received-"):
                    heard_fields += len(changed)
                continue
            if collection.startswith("DECKS."):
                study = pack["languages"][pair][1]
                card = pack["decks"][study][phrase["source"]["sourceIndex"]]
                mapping = {"study": "t", "native": "cn" if study == "fr" else "frm",
                           "phon": "phon" if study == "fr" else "phf" if study == "zh" else "pf"}
                if study in {"zh", "ja", "ko"}:
                    mapping["reading"] = "py"
                for field, original in mapping.items():
                    catalogue_differences[field] += int(phrase.get(field) != card.get(original))
            else:
                noncatalogue[collection] += len(changed)
    count = sum(catalogue_differences.values())
    checks.update({"catalogueFieldDifferences": count,
        "visibleThemeConceptsIncludingReviews": sum(theme["pedagogicalConceptCount"]
            for cell in pack["cells"].values() for theme in cell["themes"]),
        "catalogueVerbatimFields": checks["catalogueFieldsCompared"] - count,
        "cataloguePhoneticFieldDifferences": catalogue_differences["phon"],
        "catalogueReadingFieldDifferences": catalogue_differences["reading"],
        "catalogueStudyFieldDifferences": catalogue_differences["study"],
        "catalogueNativeFieldDifferences": catalogue_differences["native"],
        "combinedCorrectedPhoneticIdentities": len(phonetic_ids),
        "combinedCorrectedIdentities": len(identities), "combinedCorrectedRuntimeObjects": len(objects),
        "combinedCorrectedRuntimeFields": len(fields), "combinedCorrectedCanonicalIdentities": len(canonical_ids),
        "combinedCorrectedCanonicalFields": len(canonical_fields),
        "combinedEvidenceEvents": checks["combinedEvidenceEvents"] + additional_evidence_events})
    for target, source, collections in (
        ("importedVerbatimFields", "importedFieldsCompared", ("conversation",)),
        ("newEditorialVerbatimFields", "newEditorialFieldsCompared", ("editorial-authored",)),
        ("newSituationVerbatimWholeFields", "newSituationWholeFieldsCompared", ("situation-authored", "situation-conversation")),
        ("newSupportVerbatimWholeFields", "newSupportWholeFieldsCompared", ("situation-support-authored", "situation-support-conversation")),
    ):
        checks[target] = checks[source] - sum(noncatalogue[name] for name in collections)
    checks["newReceivedVerbatimWholeFields"] = checks["newReceivedWholeFieldsCompared"] - heard_fields
    hashes = {path: value for path, value in sorted(pack["fingerprints"].items()) if path.startswith(PREFIX)}
    for summary in result.values():
        if isinstance(summary, dict) and "registryPath" in summary:
            summary["actualRuntimeFileSha256"] = hashes


def adversarial_checks(pack, validated):
    """Only new layer faults; the historical 196-case suite is separate."""
    documents = actual_documents(pack)
    cases = []

    def field_case(name, path, location, field, value=None, remove=False):
        def mutate(target):
            if remove:
                target.pop(field, None)
            else:
                target[field] = copy.deepcopy(value)
        cases.append((name, lambda: at(documents[path], location), mutate))

    first = validated["events"][0]
    first_occ = validated["occurrences"][(first["pair"], first["id"])][0]
    p, loc = first_occ["path"], first_occ["location"]
    field_case("native after edited", p, loc, "native", first["before"]["native"])
    field_case("native-only event changes aid", p, loc, "phon", "invented aid")
    field_case("native-only event invents reading", p, loc, "reading", "invented reading")
    field_case("native-only event invents phonetic approval", p, loc, "phoneticReviewStatus", STATUS)
    field_case("correction annotation missing", p, loc, ANNOTATION, remove=True)
    field_case("earlier annotation invented", p, loc, "lot9ContentCorrection", {})
    field_case("source provenance changed", p, [*loc, "source"], "sourceIndex", -1)
    field_case("editorial level changed", p, loc, "editorialLevel", 10)
    field_case("content type changed", p, loc, "contentType", "vocabulary")
    field_case("annotation source event index boolean", p, [*loc, ANNOTATION], "evidenceEventIndex", False)
    field_case("annotation registry hash forged", p, [*loc, ANNOTATION], "registrySha256", "0" * 64)
    field_case("annotation before field forged", p, [*loc, ANNOTATION, "beforeFields"], "native", "forged before")
    bundle = next(event for event in validated["events"] if "phon" in event["fields"])
    bundle_occ = validated["occurrences"][(bundle["pair"], bundle["id"])][0]
    bp, bl = bundle_occ["path"], bundle_occ["location"]
    field_case("atomic bundle study restored only", bp, bl, "study", bundle["before"]["study"])
    field_case("atomic bundle aid restored only", bp, bl, "phon", bundle["before"]["phon"])
    field_case("atomic bundle phonetic status missing", bp, bl, "phoneticReviewStatus", remove=True)
    reading = next(event for event in validated["events"] if "reading" in event["fields"])
    occurrence = validated["occurrences"][(reading["pair"], reading["id"])][0]
    field_case("atomic bundle reading restored only", occurrence["path"], occurrence["location"],
               "reading", reading["before"]["reading"])
    field_case("atomic bundle reading wrong type", occurrence["path"], occurrence["location"], "reading", None)
    korean_source = json.loads(pack["uncertainContentInputs"]["evidenceRaw"])["events"][467]
    occurrence = validated["occurrences"][(korean_source["pair"], korean_source["id"])][0]
    field_case("author Korean whole-block aid not corrected", occurrence["path"], occurrence["location"],
               "phon", korean_source["after"]["phon"])
    punctuation = next(event for event in validated["events"] if event["fields"] == ["study"])
    occurrence = validated["occurrences"][(punctuation["pair"], punctuation["id"])][0]
    field_case("study-only bundle changes unchanged aid", occurrence["path"], occurrence["location"], "phon", "invented aid")
    field_case("study-only bundle changes unchanged native", occurrence["path"], occurrence["location"], "native", "invented meaning")
    field_case("study-only bundle invents phonetic approval", occurrence["path"], occurrence["location"], "phoneticReviewStatus", STATUS)
    for profile in ("transport-phrase", "received-model"):
        occurrence = next(occ for values in validated["occurrences"].values() for occ in values if occ["profile"] == profile)
        field_case(profile + " stale after", occurrence["path"], occurrence["location"], "native", "stale copy")
        if profile == "received-model":
            field_case("received-only model made productive", occurrence["path"], occurrence["location"], "heardOnly", False)
        parent_location = occurrence["location"][:-1]
        index = occurrence["location"][-1]
        cases.append((profile + " occurrence missing", lambda p=occurrence["path"], l=parent_location: at(documents[p], l),
                      lambda target, i=index: target.pop(i)))
        cases.append((profile + " occurrence duplicated", lambda p=occurrence["path"], l=parent_location: at(documents[p], l),
                      lambda target, i=index: target.append(copy.deepcopy(target[i]))))
    prior = next((occ, name) for values in validated["occurrences"].values() for occ in values
                 for name in PRIOR_ANNOTATIONS if occ["expectedBefore"][name + "Present"])
    field_case("prior correction annotation altered", prior[0]["path"], prior[0]["location"], prior[1], {})
    field_case("theme concept counter inflated", p, loc[:2], "pedagogicalConceptCount", 999)
    field_case("theme steps altered", p, loc[:2], "sequences", [])
    field_case("access declaration altered", PREFIX + "manifest.json", [], "publicationApproved", True)
    field_case("new manifest declaration missing", PREFIX + "manifest.json", [], MANIFEST_KEY, remove=True)
    held = json.loads(pack["uncertainContentInputs"]["evidenceRaw"])["events"][211]
    field_case("withdrawn Italian study applied", held["occurrence"]["path"], held["occurrence"]["location"],
               "study", held["after"]["study"])
    field_case("withdrawn Italian aid applied", held["occurrence"]["path"], held["occurrence"]["location"],
               "phon", held["after"]["phon"])
    cases.append(("frozen source bytes edited", lambda: pack["uncertainContentInputs"],
                  lambda target: target.update(evidenceRaw=target["evidenceRaw"] + b"\n")))
    cases.append(("frozen registry bytes edited", lambda: pack["uncertainContentInputs"],
                  lambda target: target.update(registryRaw=target["registryRaw"] + b"\n")))
    cases.append(("frozen Italian withdrawal overlay edited", lambda: pack["uncertainContentInputs"],
                  lambda target: target.update(exceptionsRaw=target["exceptionsRaw"] + b"\n")))
    cases.append(("frozen author erratum bytes edited", lambda: pack["uncertainContentInputs"],
                  lambda target: target.update(erratumRaw=target["erratumRaw"] + b"\n")))
    results = []
    for name, resolve, mutate in cases:
        target = resolve()
        saved = copy.deepcopy(target)
        try:
            mutate(target)
            try:
                validate(pack)
            except ValueError:
                results.append(name)
            else:
                raise AssertionError("New adversarial fault accepted: " + name)
        finally:
            if isinstance(target, dict):
                target.clear(); target.update(saved)
            else:
                target[:] = saved
    validate(pack)
    return results


def audit_report(pack, validated, adverse):
    hashes = {path: value for path, value in sorted(pack["fingerprints"].items()) if path.startswith(PREFIX)}
    return {"version": 1, "checker": "independent-no-generation-module-import",
        "checkerSha256": sha(Path(__file__).read_bytes()), "baseSnapshotCommit": BASE,
        "sourceCommit": EVIDENCE_COMMIT, "sourceSha256": EVIDENCE_SHA,
        "authorErratumCommit": ERRATUM_COMMIT, "authorErratumSha256": ERRATUM_SHA,
        "sourceSelectedEventsAudited": 638, "acceptedEventsApplied": 637,
        "acceptedGlosses": 478, "acceptedAtomicBundles": 159, "officiallyWithdrawnSelectedEvents": [211],
        "originalRejectedProposalsNotApplied": 145,
        "runtimeObjects": validated["runtimeObjects"], "runtimeProfiles": validated["runtimeProfiles"],
        "runtimeChangedFields": validated["runtimeChangedFields"], "fieldOccurrences": validated["fieldOccurrences"],
        "registrySha256": validated["registrySha256"], "runtimeSha256": hashes,
        "derivedMetadataChanges": validated["derivedMetadataChanges"],
        "runtimeBundleSha256": sha(canonical(hashes)), "baselineSha256": validated["baselineSha256"],
        "wholeRuntimeDataDocumentsCompared": 77, "manifestComparedSeparately": True,
        "unchangedFieldsPriorAnnotationsExactLocationsRolesAndStepsChecked": True,
        "nativeOnlyPreservesPhoneticReviewStatus": True, "globalNativeApproval": False,
        "adversarialFaultsRejected": adverse,
        "counterread": {"path": DIRECTORY + "/contrelecture-linguistique-independante.json",
                        "scope": "638 whole source decisions; contextual variants explicitly qualified; event211 officially withdrawn by author erratum"}}


def markdown_report(report):
    lines = ["# Vérification indépendante de la tranche de contenu", "",
        "Les **638 décisions sources** sont auditées. **637 sont appliquées** : **478 gloses et 159 blocs atomiques**. "
        "L’événement italien 211 est officiellement retiré par l’erratum auteur 4247ca4 et reste entièrement à son état avant. "
        "Les 145 propositions initialement écartées restent absentes.", "",
        f"Le contrôle indépendant vérifie **{report['runtimeObjects']} objets / {report['runtimeChangedFields']} champs** "
        "dans les 70 cellules et 7 banques de transport, ainsi que le manifeste. Il compare les objets complets, "
        "les valeurs après et les champs inchangés aux documents Git figés et aux seuls événements autorisés. "
        "Les anciennes annotations, positions, rôles, étapes, accès et copies restent exacts. "
        "La projection inverse privée est construite seulement après ces contrôles.", "",
        "Les compteurs de concepts sont recalculés depuis les objets corrigés et leurs références explicites. "
        "La projection historique restaure les compteurs sources uniquement après validation de leur valeur corrigée.", "",
        "La contrelecture intégrale qualifie les variantes et reformulations contextuelles. "
        "Ce résultat mécanique ne constitue pas une certification native globale.", "",
        f"Tests négatifs propres à cette couche : **{len(report['adversarialFaultsRejected'])} fautes rejetées**. "
        "La suite historique complète n’est pas relancée par cette commande.", "",
        "Reproduction :", "", "```sh",
        "python3 tools/maquette-guidee/check_uncertain_content_independent.py --self-test --check-report",
        "python3 tools/maquette-guidee/check_levels_independent.py --base-ref origin/main --check-report",
        "```", "", f"SHA du registre : `{report['registrySha256']}`.",
        f"SHA des fichiers runtime réels : `{report['runtimeBundleSha256']}`.", ""]
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--project-runtime", action="store_true")
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--write-report", action="store_true")
    parser.add_argument("--check-report", action="store_true")
    args = parser.parse_args()
    try:
        from check_levels_independent import read_pack
        pack = read_pack(args.root.resolve())
        result = validate(pack)
        adverse = adversarial_checks(pack, result) if args.self_test else []
        report = audit_report(pack, result, adverse)
        for path, fingerprint in pack["fingerprints"].items():
            require(sha((pack["root"] / path).read_bytes()) == fingerprint,
                    "actual input changed during standalone verification: " + path)
        outputs = {DIRECTORY + "/verification-independante.json": json.dumps(report, ensure_ascii=False, indent=2) + "\n",
                   DIRECTORY + "/verification-independante.md": markdown_report(report)}
        if args.write_report:
            for path, content in outputs.items():
                (pack["root"] / path).write_text(content)
        if args.check_report:
            for path, content in outputs.items():
                require((pack["root"] / path).read_text() == content, "independent report stale: " + path)
        summary = {key: result[key] for key in ("registrySha256", "runtimeObjects", "runtimeProfiles",
                                                "runtimeChangedFields", "fieldOccurrences")}
        if args.project_runtime:
            projected, _validated = project_runtime(pack)
            output = {"summary": summary, "documents": export_before_documents(projected, _validated),
                "actualDocumentsSha256": {path: sha(canonical(document)) for path, document in actual_documents(pack).items()},
                "actualRawDocumentSha256": {path: pack["fingerprints"][path] for path in actual_documents(pack)}}
            if args.self_test:
                output["adversarialFaultsRejected"] = len(adverse)
                output["adversarialChecks"] = adverse
            print(json.dumps(output, ensure_ascii=False, separators=(",", ":")))
        else:
            print(json.dumps(summary, ensure_ascii=False))
        if args.self_test and not args.project_runtime:
            print(json.dumps({"adversarialFaultsRejected": len(adverse), "checks": adverse}, ensure_ascii=False))
        return 0
    except (OSError, ValueError, KeyError, subprocess.CalledProcessError) as error:
        print("Independent content tranche verification failed: " + str(error), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

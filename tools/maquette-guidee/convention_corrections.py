"""Apply only the frozen, decided Spanish jota and Korean batchim literals.

This layer follows the separately reviewed content layer. It never converts a
word, extrapolates a pronunciation rule, or changes a source/placement/type.
"""
from __future__ import annotations

import copy
from collections import Counter
import hashlib
import json
from pathlib import Path, PurePosixPath


BASE_SNAPSHOT = "13f42b5814f2b230d76d2d0ef267dcf406c523c2"
EVIDENCE_COMMIT = "68031b7c8643e78cae7b40ad59600db32b08f79a"
ERRATUM_COMMIT = "4247ca470354f59ea37992608b38e3728a6e22f9"
BATCHIM_ERRATUM_COMMIT = "d5ad5e422f3fe1563d425ef8e0a07bea7b874559"
REGISTRY = "docs/niveaux-progressifs/conventions-tranchees/registre/conventions-tranchees.json"
REGISTRY_SHA256 = "3058f970810166d471607251a2544cb7cdb73e50422794a8bbbedbd613b62705"
ANNOTATION = "conventionCorrection"
MANIFEST_KEY = "conventionCorrections"
PREVIOUS_MANIFEST_KEY = "uncertainContentCorrections"
PREFIX = "melunga_deploy/content/niveaux-progressifs/"
PAIR_IDS = ("fr-en", "fr-es", "fr-it", "fr-zh", "fr-ja", "fr-ko", "zh-fr")
EVIDENCE = {
    "jota": {
        "path": "docs/niveaux-progressifs/conventions-tranchees/registre/evidence-registre-jota.json",
        "gitPath": "docs/revue-integrale/convention-jota-es/registre-jota.json",
        "gitCommit": EVIDENCE_COMMIT,
        "sha256": "a7ab05654d63f82f17b2e42fa379af1d9a652e1128090347a59c089e244b7bbc",
        "pair": "fr-es", "id": "convention-jota-es", "eventCount": 110,
    },
    "batchim": {
        "path": "docs/niveaux-progressifs/conventions-tranchees/registre/evidence-registre-batchim.json",
        "gitPath": "docs/revue-integrale/convention-batchim-ko/registre-batchim.json",
        "gitCommit": EVIDENCE_COMMIT,
        "sha256": "13104a811bf0bc6f123622dbafc24a13ef7da794f7406b05134b274fcbf8a818",
        "pair": "fr-ko", "id": "convention-batchim-ko", "eventCount": 1989,
    },
}
ERRATUM = {
    "path": "docs/niveaux-progressifs/conventions-tranchees/registre/evidence-errata-contenu-1.json",
    "gitPath": "docs/revue-integrale/contenu-incertain/errata-1.json",
    "gitCommit": ERRATUM_COMMIT,
    "sha256": "5418f06dcef98785a617e55a2f033c9bbdd99d9b563efe28f689fca81b9e1453",
}
BATCHIM_ERRATUM = {
    "path": "docs/niveaux-progressifs/conventions-tranchees/registre/evidence-errata-batchim-1.json",
    "gitPath": "docs/revue-integrale/convention-batchim-ko/errata-1.json",
    "gitCommit": BATCHIM_ERRATUM_COMMIT,
    "sha256": "0a724d5f9d9de43baee3188cbec543f86eda13433ae0a42a80dd9c7a58bb86ba",
}


def ensure(condition, message):
    if not condition:
        raise ValueError("Decided conventions: " + message)


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha(value):
    return hashlib.sha256(canonical(value)).hexdigest()


def file_sha(raw):
    return hashlib.sha256(raw).hexdigest()


def _read(root, path):
    candidate = root / path
    ensure(candidate.resolve().is_relative_to(root.resolve()), "path escapes root")
    return candidate.read_bytes()


def compact(document):
    return json.dumps(document, ensure_ascii=False, separators=(",", ":")) + "\n"


def allowed_runtime_path(path):
    if not isinstance(path, str):
        return False
    parts = PurePosixPath(path)
    return (not parts.is_absolute() and ".." not in parts.parts and str(parts) == path
            and path in {PREFIX + pair + f"/L{level}.json"
                         for pair in PAIR_IDS for level in range(1, 11)}
            | {PREFIX + "repertoires/" + pair + ".json" for pair in PAIR_IDS})


def occurrences(document, bank):
    """Expose every canonical, transport and received entry at an exact address."""
    if bank:
        for field, profile in (("phrases", "transport-phrase"), ("receivedModels", "received-model")):
            for index, phrase in enumerate(document.get(field, [])):
                yield phrase, [field, index], profile
    else:
        for field in ("themes", "heldThemes"):
            for theme_index, theme in enumerate(document.get(field, [])):
                for index, phrase in enumerate(theme.get("phrases", [])):
                    yield phrase, [field, theme_index, "phrases", index], "canonical"
        for index, phrase in enumerate(document.get("reserve", [])):
            yield phrase, ["reserve", index], "canonical"


def before_snapshot(phrase):
    """Record the full protected object as well as readable tuple/provenance."""
    result = {field: copy.deepcopy(phrase.get(field)) for field in ("study", "native", "phon", "source")}
    for field in ("reading", "phoneticReviewStatus"):
        result[field + "Present"] = field in phrase
        result[field] = copy.deepcopy(phrase.get(field))
    result["priorAnnotations"] = {key: copy.deepcopy(value) for key, value in phrase.items()
                                  if key.endswith("Correction") and key != ANNOTATION}
    result["preservedFieldsSha256"] = sha({key: value for key, value in phrase.items()
                                           if key not in {"phon", "phoneticReviewStatus", ANNOTATION}})
    result["wholeObjectSha256"] = sha(phrase)
    return result


def _pointer(kind, collection, index):
    return {"evidencePath": EVIDENCE[kind]["path"], "evidenceCollection": collection,
            "evidenceIndex": index}


def _approved_rows(evidence, superseded, batchim_erratum):
    """Reconstruct the exact literal selection, including explicit content overrides."""
    rows = {}
    for kind, document in evidence.items():
        config = EVIDENCE[kind]
        ensure(document.get("id") == config["id"] and document.get("pair") == config["pair"]
               and document.get("baseSnapshotCommit") == BASE_SNAPSHOT
               and document.get("eventCount") == len(document.get("events", [])) == config["eventCount"],
               "wrong frozen evidence edition/count")
        for index, event in enumerate(document["events"]):
            key = config["pair"], event["id"]
            ensure(key not in rows, "duplicate whole event identity")
            before, after = event["beforePhon"], event["afterPhon"]
            ensure(isinstance(before, str) and isinstance(after, str) and before != after,
                   "invalid whole pronunciation literal")
            rows[key] = {"pairId": key[0], "id": key[1], "convention": config["id"],
                         "beforePhon": before, "afterPhon": after,
                         "events": [_pointer(kind, "events", index)], "sourceAnchor": event["occurrence"]}
        overrides = document.get("afterContentRegister", [])
        ensure(len(overrides) == (21 if kind == "batchim" else 0), "wrong explicit post-content override count")
        for index, event in enumerate(overrides):
            key = config["pair"], event["id"]
            pointer = _pointer(kind, "afterContentRegister", index)
            before, after = event["contentBlocAfterPhon"], event["afterBatchim"]
            ensure(isinstance(before, str) and isinstance(after, str) and before != after,
                   "invalid explicit post-content pronunciation literal")
            if key in rows:
                rows[key].update(beforePhon=before, afterPhon=after)
                rows[key]["events"].append(pointer)
            else:
                rows[key] = {"pairId": key[0], "id": key[1], "convention": config["id"],
                             "beforePhon": before, "afterPhon": after, "events": [pointer], "sourceAnchor": None}
        excluded = document.get("notApplied", [])
        ensure(len(excluded) == (69 if kind == "batchim" else 0), "wrong non-applied evidence count")
        ensure(not ({(config["pair"], event["id"]) for event in excluded} & set(rows)),
               "non-applied pronunciation entered the approved selection")
    for key in superseded:
        ensure(key in rows and len(rows[key]["events"]) == 1, "wrong superseded event")
        del rows[key]
    ensure(batchim_erratum.get("id") == "convention-batchim-ko-errata-1"
           and batchim_erratum.get("reference") == "68031b7"
           and len(batchim_erratum.get("events", [])) == 5, "wrong whole-after batchim erratum edition")
    for index, event in enumerate(batchim_erratum["events"]):
        key = "fr-ko", event["id"]
        ensure(key in rows and rows[key]["beforePhon"] == event["beforePhon"]
               and rows[key]["afterPhon"] == event["deliveredAfterPhon"]
               and len(rows[key]["events"]) == 1, "whole-after erratum does not match the delivered event")
        original = evidence["batchim"]["events"][rows[key]["events"][0]["evidenceIndex"]]
        ensure(original["study"] == event["study"] and event["afterPhon"] != event["deliveredAfterPhon"],
               "whole-after erratum changed the source study or retained the wrong after")
        rows[key]["afterPhon"] = event["afterPhon"]
        rows[key]["events"].append({"evidencePath": BATCHIM_ERRATUM["path"],
                                    "evidenceCollection": "events", "evidenceIndex": index})
    return rows


def load_registry(root):
    root = Path(root)
    raw = _read(root, REGISTRY)
    ensure(file_sha(raw) == REGISTRY_SHA256, "frozen registry bytes differ")
    registry = json.loads(raw)
    ensure(registry.get("version") == 1 and registry.get("id") == "conventions-tranchees"
           and registry.get("status") == "frozen-owner-decided-phonetic-literals-not-global-native-approval"
           and registry.get("baseSnapshotCommit") == BASE_SNAPSHOT,
           "unknown edition or global approval claim")
    predecessor = registry.get("appliesAfter")
    ensure(isinstance(predecessor, list) and len(predecessor) == 1, "missing content predecessor")
    ensure(file_sha(_read(root, predecessor[0]["registryPath"])) == predecessor[0]["registrySha256"],
           "preceding content registry changed")
    evidence = {}
    for kind, config in EVIDENCE.items():
        descriptor = {field: config[field] for field in ("path", "gitPath", "gitCommit", "sha256")}
        ensure(descriptor in registry.get("evidenceFiles", []), "evidence descriptor differs")
        evidence_raw = _read(root, config["path"])
        ensure(file_sha(evidence_raw) == config["sha256"], "pinned evidence bytes differ")
        evidence[kind] = json.loads(evidence_raw)
    ensure(ERRATUM in registry.get("evidenceFiles", []), "official erratum descriptor differs")
    erratum_raw = _read(root, ERRATUM["path"])
    ensure(file_sha(erratum_raw) == ERRATUM["sha256"], "pinned official erratum bytes differ")
    erratum = json.loads(erratum_raw)
    ensure(erratum.get("id") == "contenu-incertain-errata-1" and len(erratum.get("events", [])) == 4,
           "wrong official content erratum edition")
    ensure(BATCHIM_ERRATUM in registry.get("evidenceFiles", []), "whole-after erratum descriptor differs")
    batchim_erratum_raw = _read(root, BATCHIM_ERRATUM["path"])
    ensure(file_sha(batchim_erratum_raw) == BATCHIM_ERRATUM["sha256"], "pinned whole-after erratum bytes differ")
    batchim_erratum = json.loads(batchim_erratum_raw)
    ensure(len(registry.get("evidenceFiles", [])) == len(EVIDENCE) + 2, "extra evidence file")
    superseded = {(row["pairId"], row["id"]) for row in registry.get("supersededByContent", [])}
    official_superseded = {("fr-es" if event["id"].startswith("catalogue:es:") else "fr-ko", event["id"]): (index, event)
                          for index, event in enumerate(erratum["events"]) if "supersedes" in event}
    ensure(superseded == set(official_superseded) and len(superseded) == 3,
           "official superseded convention selection differs")
    for row in registry["supersededByContent"]:
        index, event = official_superseded[(row["pairId"], row["id"])]
        ensure(row.get("status") == "superseded-by-official-content-erratum"
               and row.get("officialEvent") == {"evidencePath": ERRATUM["path"], "evidenceCollection": "events", "evidenceIndex": index}
               and row.get("officialAction") == event["action"] and row.get("reason") == event["reason"]
               and row.get("finalPhon") == event["finalPhon"], "official superseded disposition differs")
    approved = _approved_rows(evidence, superseded, batchim_erratum)
    corrections, addresses = {}, set()
    for row in registry.get("corrections", []):
        key = row.get("pairId"), row.get("id")
        ensure(key in approved and key not in corrections, "unapproved or repeated identity")
        for field, value in approved[key].items():
            ensure(row.get(field) == value, "frozen whole event or override differs: " + str(key))
        ensure(isinstance(row.get("occurrences"), list) and row["occurrences"], "missing occurrence profiles")
        for occurrence in row["occurrences"]:
            path, location = occurrence.get("path"), occurrence.get("location")
            ensure(allowed_runtime_path(path) and isinstance(location, list) and location,
                   "unsafe occurrence address")
            ensure(occurrence.get("profile") in {"canonical", "transport-phrase", "received-model"},
                   "unknown occurrence profile")
            address = path, json.dumps(location)
            ensure(address not in addresses, "repeated occurrence address")
            addresses.add(address)
            before = occurrence.get("expectedBefore")
            ensure(isinstance(before, dict) and before.get("phon") == row["beforePhon"]
                   and isinstance(before.get("source"), dict) and before["source"], "wrong full before profile")
        corrections[key] = row
    ensure(set(corrections) == set(approved), "a complete frozen event was omitted")
    ensure(registry.get("correctionCount") == len(corrections)
           and registry.get("occurrenceCount") == sum(len(row["occurrences"]) for row in corrections.values())
           and registry.get("sourceRecordCount") == 2120 and registry.get("batchimErratumEventCount") == 5
           and registry.get("appliedSourceReferenceCount") == sum(len(row["events"]) for row in corrections.values()) == 2122,
           "wrong identity/occurrence count")
    protected = registry.get("protectedExcluded", [])
    not_applied = {("fr-ko", event["id"]): event for event in evidence["batchim"]["notApplied"]}
    ensure(len(protected) == 72 and {(row["pairId"], row["id"]) for row in protected}
           == set(not_applied) | set(official_superseded), "excluded/superseded protection differs")
    for row in protected:
        key = row["pairId"], row["id"]
        expected_phon = (not_applied[key]["phon"] if key in not_applied
                         else official_superseded[key][1]["finalPhon"])
        ensure(row.get("occurrences") and all(occurrence["expectedBefore"]["phon"] == expected_phon
                                              for occurrence in row["occurrences"]),
               "excluded phon or official final phon differs: " + str(key))
    return registry, corrections, file_sha(raw)


def annotation_for(row, before, registry_hash):
    return {"id": row["id"], "convention": row["convention"], "registryPath": REGISTRY,
            "registrySha256": registry_hash, "baseSnapshotCommit": BASE_SNAPSHOT,
            "fields": ["phon"], "beforeFields": {"phon": before["phon"]},
            "originalPhoneticReviewStatusPresent": before["phoneticReviewStatusPresent"],
            "originalPhoneticReviewStatus": before["phoneticReviewStatus"],
            "evidenceCommits": [EVIDENCE_COMMIT, ERRATUM_COMMIT, BATCHIM_ERRATUM_COMMIT], "events": row["events"]}


def after_status(row):
    return "corrected-by-owner-" + row["convention"]


def apply_to_outputs(root, outputs, report):
    """Return new output texts after exact guards; never write generated files."""
    root = Path(root)
    registry, corrections, registry_hash = load_registry(root)
    result, hits, profiles, modified, transports = dict(outputs), Counter(), Counter(), set(), {}
    protected = {(entry["pairId"], entry["id"]): entry for entry in registry["protectedExcluded"]}
    protected_hits = Counter()
    for path, text in outputs.items():
        relative = Path(path).relative_to(root).as_posix()
        if not allowed_runtime_path(relative):
            continue
        document = json.loads(text)
        bank = "/repertoires/" in relative
        pair = document.get("pairId", document.get("id"))
        ensure(pair in PAIR_IDS, "unknown runtime pair")
        touched = False
        for phrase, location, profile in occurrences(document, bank):
            key = pair, phrase.get("id")
            row = corrections.get(key)
            if row is None:
                ensure(ANNOTATION not in phrase, "stray convention annotation")
                if key in protected:
                    matches = [occ for occ in protected[key]["occurrences"]
                               if occ["path"] == relative and occ["location"] == location and occ["profile"] == profile]
                    ensure(len(matches) == 1 and sha(phrase) == matches[0]["expectedBefore"]["wholeObjectSha256"],
                           "excluded/superseded content changed: " + str(key))
                    protected_hits[key] += 1
                continue
            matches = [occ for occ in row["occurrences"]
                       if occ["path"] == relative and occ["location"] == location and occ["profile"] == profile]
            ensure(len(matches) == 1, "unexpected alias, duplicate or moved occurrence: " + str(key))
            original = copy.deepcopy(phrase)
            annotation = original.pop(ANNOTATION, None)
            if annotation is not None:
                ensure(isinstance(annotation, dict), "invalid existing convention annotation")
                original["phon"] = annotation.get("beforeFields", {}).get("phon")
                if annotation.get("originalPhoneticReviewStatusPresent") is True:
                    original["phoneticReviewStatus"] = annotation.get("originalPhoneticReviewStatus")
                else:
                    original.pop("phoneticReviewStatus", None)
            before = before_snapshot(original)
            ensure(before == matches[0]["expectedBefore"],
                   "unexpected whole before/source/prior annotations: " + str(key))
            expected_annotation = annotation_for(row, before, registry_hash)
            if annotation is not None:
                ensure(annotation == expected_annotation and phrase.get("phon") == row["afterPhon"]
                       and phrase.get("phoneticReviewStatus") == after_status(row),
                       "existing after or convention declaration altered")
            phrase["phon"] = row["afterPhon"]
            phrase["phoneticReviewStatus"] = after_status(row)
            phrase[ANNOTATION] = expected_annotation
            ensure(before_snapshot(phrase)["preservedFieldsSha256"] == before["preservedFieldsSha256"],
                   "a protected field changed")
            hits[key] += 1
            profiles[profile] += 1
            touched = True
        if touched:
            result[path] = compact(document)
            modified.add(relative)
        if bank:
            transports[pair] = file_sha(result[path].encode("utf-8"))
    ensure(set(hits) == set(corrections) and all(hits[key] == len(row["occurrences"])
                                              for key, row in corrections.items()),
           "an approved identity/alias disappeared or duplicated")
    ensure(set(protected_hits) == set(protected) and all(protected_hits[key] == len(row["occurrences"])
                                                        for key, row in protected.items()),
           "an excluded/superseded identity/alias disappeared")
    ensure(set(transports) == set(PAIR_IDS), "transport bank output missing")
    manifest_path = root / PREFIX / "manifest.json"
    ensure(manifest_path in result, "manifest output missing")
    manifest = json.loads(result[manifest_path])
    predecessor = registry["appliesAfter"][0]
    ensure(manifest.get(PREVIOUS_MANIFEST_KEY, {}).get("registrySha256") == predecessor["registrySha256"],
           "content output declaration changed or missing")
    declaration = {"registryPath": REGISTRY, "registrySha256": registry_hash,
                   "baseSnapshotCommit": BASE_SNAPSHOT, "appliesAfter": registry["appliesAfter"],
                   "correctionCount": registry["correctionCount"], "sourceEventCount": registry["sourceEventCount"],
                   "postContentOverrideCount": 21, "supersededSourceEventCount": len(registry["supersededByContent"]),
                   "batchimErratumEventCount": 5, "appliedSourceReferenceCount": registry["appliedSourceReferenceCount"],
                   "notAppliedCount": 69, "evidenceCommits": [EVIDENCE_COMMIT, ERRATUM_COMMIT, BATCHIM_ERRATUM_COMMIT]}
    ensure(MANIFEST_KEY not in manifest or manifest[MANIFEST_KEY] == declaration,
           "existing convention manifest declaration altered")
    manifest[MANIFEST_KEY] = declaration
    for pair in manifest["pairs"]:
        pair["repertoireSha256"] = transports[pair["id"]]
    result[manifest_path] = json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"
    summary = {**declaration, "occurrenceCount": sum(profiles.values()),
               "occurrenceProfiles": dict(sorted(profiles.items())), "changedRuntimeFields": sum(profiles.values()),
               "changedFieldOccurrences": {"phon": sum(profiles.values())},
               "modifiedRuntimeFiles": sorted(modified), "transportSha256ByPair": transports,
               "protectedExcludedIdentities": len(protected), "protectedExcludedOccurrences": sum(protected_hits.values()),
               "globalPhoneticApproval": False, "globalNativeApproval": False,
               "sourceValidation": "Exact whole aids after the frozen content layer; all source, type, level, copied metadata and prior annotations preserved."}
    return result, summary

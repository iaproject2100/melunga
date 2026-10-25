"""Two separate, frozen correction batches after the lot-2 and lot-3 editions.

The first batch changes only the 259 explicitly reviewed whole aids. The second
changes certain glosses and two complete, atomic study/reading/aid/meaning
bundles. No sound rule, translation rule, or classification rule is inferred.
"""
from __future__ import annotations

import copy
from collections import Counter
import hashlib
import json
from pathlib import Path, PurePosixPath

BASE_SNAPSHOT = "606592ccf11886810a6bb9fbabc56728cf5055c9"
PHONETIC_REGISTRY = "docs/niveaux-progressifs/corrections-phonetiques/lot4/revue-claude-lot4.json"
CONTENT_REGISTRY = "docs/niveaux-progressifs/corrections-contenu/lot3-lot4/revue-contenu-lot3-lot4.json"
LOT3_PREDECESSOR = {"registryPath": "docs/niveaux-progressifs/corrections-phonetiques/lot3/revue-claude-lot3.json",
                   "registrySha256": "20ad657496a94a036c8e6aa74088f172ddc8c4ebb7eacb074f2133fa84beb393"}
PHONETIC_PREDECESSOR = {"registryPath": PHONETIC_REGISTRY,
                       "registrySha256": "92f93724dfe4ef1586a588b1372c72639e0fa1016834d1cc9a1ab66fda9b6c88"}
EVIDENCE = {
    "docs/niveaux-progressifs/corrections-phonetiques/lot4/evidence-registre-phonetique.json": {
        "gitPath": "docs/revue-integrale/lot4-zh-fr-L1-L10/registre-phonetique.json",
        "gitCommit": "7631c0fe64170f952e086487462e94c87bfb13e1",
        "sha256": "15237777a65b287a4008d53167b458dde2e486af27deafb31698e91c99ff5167"},
    "docs/niveaux-progressifs/corrections-contenu/lot3-lot4/evidence-contenu-lot3-amende.json": {
        "gitPath": "docs/revue-integrale/lot3-fr-zh-L3-L10/lot-contenu-gloses.json",
        "gitCommit": "c849bf3d13d4141eae8b34f8cc5d3d43167bec60",
        "sha256": "b78984789b573c89d1cb0a755cc14a097a331927c3143b38fcbabaf4207a3367"},
    "docs/niveaux-progressifs/corrections-contenu/lot3-lot4/evidence-contenu-lot4.json": {
        "gitPath": "docs/revue-integrale/lot4-zh-fr-L1-L10/lot-contenu-gloses.json",
        "gitCommit": "7631c0fe64170f952e086487462e94c87bfb13e1",
        "sha256": "2a9fb36c77f2749d646faac352fe527d7c9df3d922b1e1c6baccca4d970f2ba6"},
}
PHONETIC_EVIDENCE = next(iter(EVIDENCE))
CONTENT_EVIDENCE = tuple(list(EVIDENCE)[1:])
CONFIGS = {
    "phonetic": {
        "path": PHONETIC_REGISTRY, "id": "revue-claude-lot4-phonetique",
        "status": "frozen-whole-events-not-global-native-approval",
        "annotation": "lot4PhoneticCorrection", "manifestKey": "lot4PhoneticCorrections",
        "evidencePaths": (PHONETIC_EVIDENCE,), "predecessor": LOT3_PREDECESSOR,
        "counts": (259, 259, 259, 259),
    },
    "content": {
        "path": CONTENT_REGISTRY, "id": "revue-contenu-lot3-lot4",
        "status": "frozen-certain-content-bundles-not-global-native-approval",
        "annotation": "reviewedContentCorrection", "manifestKey": "reviewedContentCorrections",
        "evidencePaths": CONTENT_EVIDENCE, "predecessor": PHONETIC_PREDECESSOR,
        "counts": (35, 35, 40, 39),
    },
}
PAIR_IDS = ("fr-en", "fr-es", "fr-it", "fr-zh", "fr-ja", "fr-ko", "zh-fr")
PREFIX = "melunga_deploy/content/niveaux-progressifs/"
PRIOR_ANNOTATIONS = ("phoneticCorrection", "reviewedFieldCorrection", "lot4PhoneticCorrection")
PRESENT_FIELDS = ("reading", "phoneticReviewStatus", *PRIOR_ANNOTATIONS)
SNAPSHOT_KEYS = {"study", "native", "phon", "source", *PRESENT_FIELDS,
                 *(field + "Present" for field in PRESENT_FIELDS)}


def ensure(condition, message):
    if not condition:
        raise ValueError("Lot-4 corrections: " + message)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def _read(root, relative):
    path = root / relative
    ensure(path.resolve().is_relative_to(root.resolve()), "path escapes root")
    return path.read_bytes()


def compact(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n"


def allowed_runtime_path(path):
    if not isinstance(path, str):
        return False
    parts = PurePosixPath(path)
    return not parts.is_absolute() and ".." not in parts.parts and str(parts) == path and path in {
        PREFIX + pair + f"/L{level}.json" for pair in PAIR_IDS for level in range(1, 11)} | {
        PREFIX + "repertoires/" + pair + ".json" for pair in PAIR_IDS}


def before_snapshot(phrase):
    result = {field: copy.deepcopy(phrase.get(field)) for field in ("study", "native", "phon", "source")}
    for field in PRESENT_FIELDS:
        result[field + "Present"] = field in phrase
        result[field] = copy.deepcopy(phrase.get(field))
    return result


def _approved_events(kind, evidence):
    """Select only literal, pinned reviewer events; never discover new changes."""
    approved = {}
    for path, document in evidence.items():
        if kind == "phonetic":
            ensure(document.get("baseSnapshotCommit") == BASE_SNAPSHOT
                   and document.get("eventCount") == len(document.get("events", [])) == 259,
                   "phonetic evidence edition/count changed")
            for index, event in enumerate(document["events"]):
                ensure(event.get("pair") == "zh-fr" and event.get("rules")
                       and set(event["rules"]) <= {"S", "L", "T", "G", "A", "X", "R"},
                       "unapproved lot-4 rule or language")
                approved[(path, "events", index)] = {
                    "pair": event["pair"], "id": event["id"], "study": event["study"],
                    "native": event["native"], "fields": {"phon": {"before": event["beforePhon"], "after": event["afterPhon"]}},
                    "rules": event["rules"], "atomic": False, "anchor": event["occurrence"],
                    "transportCopies": event["transportCopies"],
                }
        else:
            pair = "fr-zh" if path == CONTENT_EVIDENCE[0] else "zh-fr"
            expected_reference = "3df885df8db00f0bdc2a703b92bd17801accabce" if pair == "fr-zh" else BASE_SNAPSHOT
            ensure(document.get("reference") == expected_reference, "content evidence reference changed")
            certain = [(index, event) for index, event in enumerate(document["items"]) if event.get("certainty") == "certain"]
            ensure(len(certain) == (25 if pair == "fr-zh" else 8), "certain gloss selection changed")
            for index, event in certain:
                ensure(event.get("field") == "native" and event["before"] != event["after"], "unapproved certain field")
                approved[(path, "items", index)] = {
                    "pair": pair, "id": event["id"], "study": event["study"],
                    "fields": {"native": {"before": event["before"], "after": event["after"]}},
                    "rules": [], "atomic": False,
                }
            bundles = document.get("linkedBundles")
            ensure(isinstance(bundles, list) and len(bundles) == 1, "linked bundle selection changed")
            event = bundles[0]
            ensure(event.get("certainty") == "certain" and event.get("applyTogether") is True
                   and event.get("id") == ("catalogue:zh:1900" if pair == "fr-zh" else "catalogue:fr:757"),
                   "unapproved or non-atomic content bundle")
            fields = {field: {"before": value, "after": event["after"][field]} for field, value in event["before"].items()}
            ensure(set(fields) == ({"study", "native", "phon", "reading"} if pair == "fr-zh" else {"study", "native", "phon"}),
                   "a bundle field was dropped or invented")
            approved[(path, "linkedBundles", 0)] = {
                "pair": pair, "id": event["id"], "study": event["before"]["study"],
                "fields": fields, "rules": [], "atomic": True,
            }
    return approved


def load_registry(root, kind):
    root = Path(root)
    ensure(kind in CONFIGS, "unknown batch")
    config = CONFIGS[kind]
    raw = _read(root, config["path"])
    registry = json.loads(raw)
    ensure(registry.get("version") == 1 and registry.get("id") == config["id"]
           and registry.get("status") == config["status"] and registry.get("baseSnapshotCommit") == BASE_SNAPSHOT,
           "unknown correction edition or global approval claim")
    ensure(registry.get("appliesAfter") == [config["predecessor"]], "wrong preceding layer")
    ensure(sha(_read(root, config["predecessor"]["registryPath"])) == config["predecessor"]["registrySha256"],
           "preceding registry changed")
    counts = tuple(registry.get(field) for field in ("correctionCount", "eventCount", "approvedFieldCount", "changedFieldCount"))
    ensure(counts == config["counts"], "batch counts changed")
    descriptors = registry.get("evidenceFiles")
    ensure(isinstance(descriptors, list) and len(descriptors) == len(config["evidencePaths"]), "wrong evidence list")
    evidence = {}
    for path in config["evidencePaths"]:
        ensure([d for d in descriptors if d.get("path") == path] == [{"path": path, **EVIDENCE[path]}], "evidence descriptor differs")
        content = _read(root, path)
        ensure(sha(content) == EVIDENCE[path]["sha256"], "pinned evidence bytes differ")
        evidence[path] = json.loads(content)
    approved = _approved_events(kind, evidence)
    corrections, used, addresses = {}, set(), set()
    rows = registry.get("corrections")
    ensure(isinstance(rows, list) and len(rows) == counts[0], "incorrect correction list")
    for row in rows:
        key = row.get("pairId"), row.get("id")
        ensure(key[0] in PAIR_IDS and isinstance(key[1], str) and key not in corrections, "unknown or duplicate ID")
        events = row.get("events")
        ensure(isinstance(events, list) and len(events) == 1, "one atomic reviewer event expected per ID")
        event_ref = events[0]
        ensure(set(event_ref) == {"evidencePath", "evidenceCollection", "evidenceIndex"}, "bad event pointer")
        ensure(type(event_ref["evidenceIndex"]) is int and event_ref["evidenceIndex"] >= 0,
               "evidence index is not a non-negative integer")
        pointer = event_ref["evidencePath"], event_ref["evidenceCollection"], event_ref["evidenceIndex"]
        ensure(pointer in approved and pointer not in used, "unapproved or reused reviewer event")
        event = approved[pointer]
        ensure(key == (event["pair"], event["id"]) and row.get("fields") == event["fields"]
               and row.get("rules") == event["rules"] and row.get("atomicBundle") is event["atomic"],
               "literal event or complete atomic bundle differs")
        used.add(pointer)
        occurrences = row.get("occurrences")
        ensure(isinstance(occurrences, list) and occurrences, "missing occurrence profiles")
        profiles = Counter()
        for occurrence in occurrences:
            path, location, profile = occurrence.get("path"), occurrence.get("location"), occurrence.get("profile")
            ensure(allowed_runtime_path(path), "unsafe runtime path")
            ensure(profile in {"canonical", "transport-phrase", "received-model"}, "unknown occurrence profile")
            ensure(isinstance(location, list) and location and all(type(x) is int and x >= 0 or isinstance(x, str) and x and x not in {"..", "/"} for x in location), "unsafe occurrence location")
            address = path, json.dumps(location)
            ensure(address not in addresses, "duplicate occurrence address")
            addresses.add(address)
            before = occurrence.get("expectedBefore")
            ensure(isinstance(before, dict) and set(before) == SNAPSHOT_KEYS, "incomplete whole before profile")
            ensure(isinstance(before["source"], dict) and before["source"], "missing original provenance")
            for field in PRESENT_FIELDS:
                ensure(type(before[field + "Present"]) is bool and (before[field + "Present"] or before[field] is None), "invalid presence/value pair")
            ensure(before["study"] == event["study"], "whole studied source changed")
            for field, values in event["fields"].items():
                ensure(before[field] == values["before"], "before differs from reviewer evidence")
            if kind == "phonetic":
                ensure(before["native"] == event["native"] and all(not before[name + "Present"] for name in PRIOR_ANNOTATIONS),
                       "unannounced earlier correction or changed meaning")
            profiles[profile] += 1
        ensure(profiles["canonical"] <= 1 and profiles["received-model"] <= 1
               and (profiles["canonical"] == 1 or profiles["received-model"] == 1), "missing unique primary or received-only source")
        if kind == "phonetic":
            anchor = event["anchor"]
            ensure(any(o["path"] == anchor["path"] and o["location"] == anchor["location"] for o in occurrences), "reviewer anchor absent")
            ensure(profiles["transport-phrase"] == event["transportCopies"], "reviewer transport count differs")
        corrections[key] = row
    ensure(used == set(approved), "a frozen approved event was omitted")
    ensure(sum(len(row["fields"]) for row in rows) == counts[2]
           and sum(event["before"] != event["after"] for row in rows for event in row["fields"].values()) == counts[3],
           "approved/changed field counters differ")
    return registry, corrections, sha(raw)


def _occurrences(document, bank):
    if bank:
        for field, profile in (("phrases", "transport-phrase"), ("receivedModels", "received-model")):
            for phrase in document.get(field, []):
                yield phrase, profile
    else:
        for field in ("themes", "heldThemes"):
            for theme in document.get(field, []):
                for phrase in theme.get("phrases", []):
                    yield phrase, "canonical"
        for phrase in document.get("reserve", []):
            yield phrase, "canonical"


def annotation_for(row, before, config, registry_hash, registry):
    return {"id": row["id"], "registryPath": config["path"], "registrySha256": registry_hash,
            "baseSnapshotCommit": BASE_SNAPSHOT, "fields": sorted(row["fields"]),
            "beforeFields": {field: before[field] for field in sorted(row["fields"])},
            "originalPhoneticReviewStatusPresent": before["phoneticReviewStatusPresent"],
            "originalPhoneticReviewStatus": before["phoneticReviewStatus"],
            "evidenceCommits": sorted({file["gitCommit"] for file in registry["evidenceFiles"]})}


def after_phonetic_status(row, kind):
    return "corrected-by-Claude-lot4-" + "+".join(row["rules"]) if kind == "phonetic" else "corrected-by-Claude-content-lot3-lot4"


def apply_to_outputs(root, outputs, report, kind):
    """Apply one separate batch to in-memory outputs, preserving every source."""
    root = Path(root)
    config = CONFIGS[kind]
    registry, corrections, registry_hash = load_registry(root, kind)
    result = dict(outputs)
    profiles, identity_hits, approved_hits, changed_hits, modified = Counter(), Counter(), Counter(), Counter(), set()
    transports = {}
    for path, text in outputs.items():
        relative = Path(path).relative_to(root).as_posix()
        if not allowed_runtime_path(relative):
            continue
        document = json.loads(text)
        bank = "/repertoires/" in relative
        pair = document.get("pairId", document.get("id"))
        ensure(pair in PAIR_IDS, "unknown runtime pair")
        touched = False
        for phrase, profile in _occurrences(document, bank):
            key = pair, phrase.get("id")
            row = corrections.get(key)
            if row is None:
                ensure(config["annotation"] not in phrase, "stray correction annotation")
                continue
            candidates = [occ["expectedBefore"] for occ in row["occurrences"] if occ["profile"] == profile]
            if profile == "transport-phrase":
                candidates += [occ["expectedBefore"] for occ in row["occurrences"] if occ["profile"] == "canonical"]
            original = copy.deepcopy(phrase)
            annotation = original.pop(config["annotation"], None)
            phon_changes = "phon" in row["fields"] and row["fields"]["phon"]["before"] != row["fields"]["phon"]["after"]
            if annotation is not None:
                ensure(isinstance(annotation, dict), "invalid existing annotation")
                for field in row["fields"]:
                    original[field] = annotation.get("beforeFields", {}).get(field)
                if phon_changes:
                    if annotation.get("originalPhoneticReviewStatusPresent") is True:
                        original["phoneticReviewStatus"] = annotation.get("originalPhoneticReviewStatus")
                    else:
                        original.pop("phoneticReviewStatus", None)
            before = before_snapshot(original)
            ensure(before in candidates, "unexpected complete before/source/prior annotation for " + str(key))
            expected_annotation = annotation_for(row, before, config, registry_hash, registry)
            if annotation is not None:
                ensure(annotation == expected_annotation, "existing correction declaration altered")
                ensure(all(phrase.get(field) == values["after"] for field, values in row["fields"].items()), "existing after altered or bundle partly applied")
                if phon_changes:
                    ensure(phrase.get("phoneticReviewStatus") == after_phonetic_status(row, kind), "phonetic status altered")
            # Validate all guards first; every bundle is then applied as one operation.
            for field, values in row["fields"].items():
                phrase[field] = values["after"]
                approved_hits[field] += 1
                changed_hits[field] += int(values["before"] != values["after"])
            if phon_changes:
                phrase["phoneticReviewStatus"] = after_phonetic_status(row, kind)
            phrase[config["annotation"]] = expected_annotation
            profiles[profile] += 1
            identity_hits[(key, profile)] += 1
            touched = True
        if touched:
            result[path] = compact(document)
            modified.add(relative)
        if bank:
            transports[pair] = sha(result[path].encode("utf-8"))
    ensure({key for key, profile in identity_hits} == set(corrections), "a declared identity disappeared")
    for key, row in corrections.items():
        expected = Counter(occ["profile"] for occ in row["occurrences"])
        ensure(all(identity_hits[(key, profile)] == count for profile, count in expected.items() if profile != "transport-phrase"),
               "primary/received entry disappeared or duplicated")
        ensure(identity_hits[(key, "transport-phrase")] >= expected["transport-phrase"], "transport copy disappeared")
    ensure(set(transports) == set(PAIR_IDS), "transport bank output missing")
    declaration = {"registryPath": config["path"], "registrySha256": registry_hash,
        "baseSnapshotCommit": BASE_SNAPSHOT, "appliesAfter": registry["appliesAfter"],
        **{field: registry[field] for field in ("correctionCount", "eventCount", "approvedFieldCount", "changedFieldCount")},
        "evidenceCommits": sorted({file["gitCommit"] for file in registry["evidenceFiles"]})}
    manifest_path = root / PREFIX / "manifest.json"
    ensure(manifest_path in result, "manifest output missing")
    manifest = json.loads(result[manifest_path])
    previous_key = "reviewedFieldCorrections" if kind == "phonetic" else "lot4PhoneticCorrections"
    ensure(manifest.get(previous_key, {}).get("registrySha256") == config["predecessor"]["registrySha256"], "prior output declaration changed")
    manifest[config["manifestKey"]] = declaration
    for pair in manifest["pairs"]:
        pair["repertoireSha256"] = transports[pair["id"]]
    result[manifest_path] = json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"
    summary = {**declaration, "occurrenceCount": sum(profiles.values()), "occurrenceProfiles": dict(sorted(profiles.items())),
        "approvedRuntimeFields": sum(approved_hits.values()), "changedRuntimeFields": sum(changed_hits.values()),
        "approvedFieldOccurrences": dict(sorted(approved_hits.items())), "changedFieldOccurrences": dict(sorted(changed_hits.items())),
        "modifiedRuntimeFiles": sorted(modified), "transportSha256ByPair": transports,
        "globalPhoneticApproval": False, "globalNativeApproval": False,
        "sourceValidation": "Original sources and preceding layers verified before this separate frozen batch; literal events and atomic bundles only."}
    return result, summary

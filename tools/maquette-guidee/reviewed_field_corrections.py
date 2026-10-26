"""Apply frozen lot-3 whole-aid/Pinyin events after the earlier lot-2 layer.

No phonetic rule is inferred here. Old source objects and old correction
annotations remain intact; this edition has its own before/after declaration.
"""
from __future__ import annotations

import copy
from collections import Counter
import hashlib
import json
from pathlib import Path, PurePosixPath

REGISTRY_PATH = "docs/niveaux-progressifs/corrections-phonetiques/lot3/revue-claude-lot3.json"
BASE_SNAPSHOT = "3df885df8db00f0bdc2a703b92bd17801accabce"
EVIDENCE_COMMIT = "d06a62ea36120ffd73b8059645848c13bd4f172d"
APPLIES_AFTER = {
    "registryPath": "docs/niveaux-progressifs/corrections-phonetiques/revue-claude-lot2.json",
    "registrySha256": "efc075c6bbfbe660e1f62cc83ced4244fa8df8368b8e70ef90c6faf5897acbdc",
}
EVIDENCE = {
    "docs/niveaux-progressifs/corrections-phonetiques/lot3/evidence-registre-phonetique.json": {
        "gitPath": "docs/revue-integrale/lot3-fr-zh-L3-L10/registre-phonetique.json",
        "sha256": "09e470b8fba9004b62bcb9fbc5fe036dbda2d91c68868b178f9ba810a06ea9ba",
        "eventCount": 90, "field": "phon"},
    "docs/niveaux-progressifs/corrections-phonetiques/lot3/evidence-registre-lectures.json": {
        "gitPath": "docs/revue-integrale/lot3-fr-zh-L3-L10/registre-lectures.json",
        "sha256": "c029d571a59303733d5bfa85fec59b94f0b989eb24a4d3c490a4a9fe50fd4ea8",
        "eventCount": 5, "field": "reading"},
}
PAIR_IDS = ("fr-en", "fr-es", "fr-it", "fr-zh", "fr-ja", "fr-ko", "zh-fr")
PREFIX = "melunga_deploy/content/niveaux-progressifs/"
ANNOTATION = "reviewedFieldCorrection"
SNAPSHOT_KEYS = {"study", "native", "phon", "readingPresent", "reading", "source",
                 "phoneticReviewStatusPresent", "phoneticReviewStatus",
                 "phoneticCorrectionPresent", "phoneticCorrection"}


def ensure(condition, message):
    if not condition:
        raise ValueError("Reviewed field corrections: " + message)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def compact(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n"


def _read(root, relative):
    path = root / relative
    ensure(path.resolve().is_relative_to(root.resolve()), "path escapes root")
    return path.read_bytes()


def allowed_runtime_path(path):
    if not isinstance(path, str):
        return False
    parts = PurePosixPath(path)
    return not parts.is_absolute() and ".." not in parts.parts and str(parts) == path and path in {
        PREFIX + pair + f"/L{level}.json" for pair in PAIR_IDS for level in range(1, 11)} | {
        PREFIX + "repertoires/" + pair + ".json" for pair in PAIR_IDS}


def before_snapshot(phrase):
    return {"study": phrase.get("study"), "native": phrase.get("native"), "phon": phrase.get("phon"),
            "readingPresent": "reading" in phrase, "reading": phrase.get("reading"),
            "source": phrase.get("source"),
            "phoneticReviewStatusPresent": "phoneticReviewStatus" in phrase,
            "phoneticReviewStatus": phrase.get("phoneticReviewStatus"),
            "phoneticCorrectionPresent": "phoneticCorrection" in phrase,
            "phoneticCorrection": phrase.get("phoneticCorrection")}


def load_registry(root):
    root = Path(root)
    raw = _read(root, REGISTRY_PATH)
    registry = json.loads(raw)
    ensure(registry.get("version") == 1 and registry.get("id") == "revue-claude-lot3", "unknown registry")
    ensure(registry.get("baseSnapshotCommit") == BASE_SNAPSHOT
           and registry.get("evidenceCommit") == EVIDENCE_COMMIT, "wrong frozen edition")
    ensure(registry.get("appliesAfter") == APPLIES_AFTER, "incorrect preceding layer")
    ensure(sha(_read(root, APPLIES_AFTER["registryPath"])) == APPLIES_AFTER["registrySha256"], "preceding registry changed")
    ensure(registry.get("eventCount") == 95 and registry.get("phoneticEventCount") == 90
           and registry.get("readingEventCount") == 5 and registry.get("correctionCount") == 91,
           "wrong event/identity counts")
    descriptors = registry.get("evidenceFiles")
    ensure(isinstance(descriptors, list) and len(descriptors) == 2, "wrong evidence list")
    evidence = {}
    for path, descriptor in EVIDENCE.items():
        ensure([d for d in descriptors if d.get("path") == path] == [{"path": path, **descriptor}], "evidence descriptor changed")
        content = _read(root, path)
        ensure(sha(content) == descriptor["sha256"], "pinned evidence bytes changed")
        document = json.loads(content)
        ensure(document.get("baseSnapshotCommit") == BASE_SNAPSHOT, "evidence before edition changed")
        events = document["events"]
        ensure(len(events) == document.get("eventCount") == descriptor["eventCount"], "evidence count changed")
        evidence[path] = events
    corrections, used, addresses = {}, set(), set()
    rows = registry.get("corrections")
    ensure(isinstance(rows, list) and len(rows) == 91, "wrong correction list")
    for row in rows:
        key = row.get("pairId"), row.get("id")
        ensure(key[0] in {"fr-zh", "zh-fr"} and isinstance(key[1], str) and key not in corrections,
               "unknown or duplicated correction identity")
        fields, occurrences = row.get("fields"), row.get("occurrences")
        ensure(isinstance(fields, dict) and fields and set(fields) <= {"phon", "reading"}, "unapproved field")
        ensure(isinstance(occurrences, list) and occurrences, "missing occurrence profiles")
        for field, change in fields.items():
            path, index = change.get("evidencePath"), change.get("evidenceIndex")
            ensure(path in EVIDENCE and EVIDENCE[path]["field"] == field and type(index) is int
                   and 0 <= index < len(evidence[path]) and (path, index) not in used, "bad evidence pointer")
            e = evidence[path][index]
            expected = {"before": e["beforePhon" if field == "phon" else "beforeReading"],
                        "after": e["afterPhon" if field == "phon" else "afterReading"],
                        "evidencePath": path, "evidenceIndex": index}
            if field == "phon":
                ensure(e.get("rules") and set(e["rules"]) <= {"C", "E", "F", "G", "H", "I", "J"}, "unapproved sound rule")
                expected["rules"] = e["rules"]
            ensure(change == expected and change["before"] != change["after"], "event differs from frozen evidence")
            ensure((e["pair"], e["id"]) == key, "wrong evidence identity")
            anchor = e["occurrence"]
            ensure(any(o.get("path") == anchor["path"] and o.get("location") == anchor["location"]
                       for o in occurrences), "missing reviewer anchor")
            for occurrence in occurrences:
                before = occurrence.get("expectedBefore", {})
                ensure(before.get("study") == e["study"] and before.get("native") == e["native"]
                       and before.get(field) == change["before"], "whole before differs from reviewer evidence")
                if field == "phon":
                    ensure(before.get("reading") == e["reading"], "original reading changed")
                    ensure(before.get("phoneticCorrectionPresent") == e["priorCorrection"], "earlier correction lost/invented")
            if field == "phon":
                ensure(sum(o.get("profile") == "transport-phrase" for o in occurrences) == e["transportCopies"],
                       "reviewer transport count differs")
            used.add((path, index))
        profile_counts = Counter()
        for occurrence in occurrences:
            path, location, profile = occurrence.get("path"), occurrence.get("location"), occurrence.get("profile")
            ensure(allowed_runtime_path(path), "unsafe snapshot occurrence path")
            ensure(profile in {"canonical", "transport-phrase", "received-model"}, "unknown profile")
            ensure(isinstance(location, list) and location and all(
                type(v) is int and v >= 0 or isinstance(v, str) and v and v not in {"..", "/"} for v in location), "invalid location")
            address = path, json.dumps(location)
            ensure(address not in addresses, "duplicate snapshot occurrence")
            addresses.add(address)
            before = occurrence.get("expectedBefore")
            ensure(isinstance(before, dict) and set(before) == SNAPSHOT_KEYS, "incomplete before profile")
            ensure(isinstance(before["source"], dict) and before["source"], "missing source provenance")
            for presence, field in (("readingPresent", "reading"), ("phoneticReviewStatusPresent", "phoneticReviewStatus"),
                                    ("phoneticCorrectionPresent", "phoneticCorrection")):
                ensure(type(before[presence]) is bool and (before[presence] or before[field] is None), "invalid presence/value pair")
            profile_counts[profile] += 1
        ensure(profile_counts["canonical"] <= 1 and profile_counts["received-model"] <= 1
               and (profile_counts["canonical"] == 1 or profile_counts["received-model"] == 1), "no unique original entry")
        corrections[key] = row
    ensure(used == {(path, index) for path, events in evidence.items() for index in range(len(events))}, "evidence event omitted")
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


def annotation_for(row, before, registry_sha):
    return {"id": row["id"], "registryPath": REGISTRY_PATH, "registrySha256": registry_sha,
            "evidenceCommit": EVIDENCE_COMMIT, "baseSnapshotCommit": BASE_SNAPSHOT,
            "fields": sorted(row["fields"]),
            "beforeFields": {field: before[field] for field in sorted(row["fields"])},
            "originalPhoneticReviewStatusPresent": before["phoneticReviewStatusPresent"],
            "originalPhoneticReviewStatus": before["phoneticReviewStatus"]}


def after_phonetic_status(row):
    return "corrected-by-Claude-lot3-" + "+".join(row["fields"]["phon"]["rules"])


def apply_to_outputs(root, outputs, report):
    """Return serialized corrected outputs, never write files or edit sources."""
    root = Path(root)
    registry, corrections, registry_sha = load_registry(root)
    result = dict(outputs)
    profiles, field_hits, identity_hits, modified = Counter(), Counter(), Counter(), set()
    transport_shas = {}
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
                ensure(ANNOTATION not in phrase, "stray lot-3 annotation")
                continue
            candidates = [o["expectedBefore"] for o in row["occurrences"] if o["profile"] == profile]
            if profile == "transport-phrase":
                candidates += [o["expectedBefore"] for o in row["occurrences"] if o["profile"] == "canonical"]
            original = copy.deepcopy(phrase)
            annotation = original.pop(ANNOTATION, None)
            if annotation is not None:
                ensure(isinstance(annotation, dict), "invalid existing lot-3 annotation")
                for field in row["fields"]:
                    original[field] = annotation.get("beforeFields", {}).get(field)
                if "phon" in row["fields"]:
                    if annotation.get("originalPhoneticReviewStatusPresent") is True:
                        original["phoneticReviewStatus"] = annotation.get("originalPhoneticReviewStatus")
                    else:
                        original.pop("phoneticReviewStatus", None)
            before = before_snapshot(original)
            ensure(before in candidates, "unexpected whole before/source/earlier annotation for " + str(key))
            expected_annotation = annotation_for(row, before, registry_sha)
            if annotation is not None:
                ensure(annotation == expected_annotation, "existing lot-3 declaration was altered")
                for field, event in row["fields"].items():
                    ensure(phrase.get(field) == event["after"], "existing corrected field was altered")
                if "phon" in row["fields"]:
                    ensure(phrase.get("phoneticReviewStatus") == after_phonetic_status(row), "corrected status altered")
            for field, event in row["fields"].items():
                phrase[field] = event["after"]
                field_hits[field] += 1
            if "phon" in row["fields"]:
                phrase["phoneticReviewStatus"] = after_phonetic_status(row)
            phrase[ANNOTATION] = expected_annotation
            profiles[profile] += 1
            identity_hits[(key, profile)] += 1
            touched = True
        if touched:
            result[path] = compact(document)
            modified.add(relative)
        if bank:
            transport_shas[pair] = sha(result[path].encode("utf-8"))
    ensure(set(key for key, profile in identity_hits) == set(corrections), "a correction identity disappeared")
    for key, row in corrections.items():
        expected = Counter(o["profile"] for o in row["occurrences"])
        ensure(all(identity_hits[(key, profile)] == count for profile, count in expected.items() if profile != "transport-phrase"),
               "original canonical/received entry missing or duplicated")
        ensure(identity_hits[(key, "transport-phrase")] >= expected["transport-phrase"], "a transport correction disappeared")
    ensure(set(transport_shas) == set(PAIR_IDS), "missing transport bank output")
    declaration = {"registryPath": REGISTRY_PATH, "registrySha256": registry_sha,
                   "correctionCount": registry["correctionCount"], "eventCount": registry["eventCount"],
                   "phoneticEventCount": registry["phoneticEventCount"], "readingEventCount": registry["readingEventCount"],
                   "evidenceCommit": EVIDENCE_COMMIT, "baseSnapshotCommit": BASE_SNAPSHOT, "appliesAfter": APPLIES_AFTER}
    manifest_path = root / PREFIX / "manifest.json"
    ensure(manifest_path in result, "missing manifest")
    manifest = json.loads(result[manifest_path])
    ensure(manifest.get("phoneticCorrections", {}).get("registrySha256") == APPLIES_AFTER["registrySha256"],
           "lot-3 must follow verified lot-2 output")
    manifest["reviewedFieldCorrections"] = declaration
    for pair in manifest["pairs"]:
        pair["repertoireSha256"] = transport_shas[pair["id"]]
    result[manifest_path] = json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"
    summary = {**declaration, "occurrenceCount": sum(profiles.values()), "occurrenceProfiles": dict(sorted(profiles.items())),
               "fieldOccurrences": dict(sorted(field_hits.items())), "modifiedRuntimeFiles": sorted(modified),
               "transportSha256ByPair": transport_shas, "globalPhoneticApproval": False,
               "sourceValidation": "Frozen lot-3 before/after applied after original and lot-2 checks; only named phon/reading, phon review status and separate lot-3 annotation change.",
               "perPair": dict(sorted(Counter(pair for pair, ident in corrections).items()))}
    return result, summary

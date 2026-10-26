"""Apply the separately reviewed, frozen uncertain-content decisions.

Only literal whole events are executable. A bloc is one atomic operation;
neither pronunciation conventions nor editorial classification are inferred.
"""
from __future__ import annotations

import copy
from collections import Counter
import hashlib
import json
from pathlib import Path, PurePosixPath

BASE_SNAPSHOT = "13f42b5814f2b230d76d2d0ef267dcf406c523c2"
EVIDENCE_COMMIT = "17b003810a15954d933f49decc2bafa53de8d881"
ERRATUM_COMMIT = "4247ca470354f59ea37992608b38e3728a6e22f9"
ERRATUM_PATH = "docs/niveaux-progressifs/contenu-tranche/evidence-errata-1.json"
REGISTRY_PATH = "docs/niveaux-progressifs/contenu-tranche/registre-contenu-tranche.json"
REGISTRY_SHA256 = "3fa187478a03e1398e7b14fa545c0950bf1ff166789a480745ca689061377130"
EXCEPTIONS_PATH = "docs/niveaux-progressifs/contenu-tranche/exceptions-contenu-tranche.json"
EXCEPTIONS_SHA256 = "ac33db585c121465613d6e0fcd41131986271b48c4a057ec867062d2d2655844"
EVIDENCE_PATH = "docs/niveaux-progressifs/contenu-tranche/evidence-registre-contenu.json"
README_PATH = "docs/niveaux-progressifs/contenu-tranche/evidence-README.md"
EVIDENCE_FILES = [{'path': 'docs/niveaux-progressifs/contenu-tranche/evidence-registre-contenu.json', 'gitPath': 'docs/revue-integrale/contenu-incertain/registre-contenu.json', 'gitCommit': '17b003810a15954d933f49decc2bafa53de8d881', 'sha256': '0276ad1dac00161a6619de315d22d558f65b55a8821f3ddab95a1f10ad9a9e02'}, {'path': 'docs/niveaux-progressifs/contenu-tranche/evidence-README.md', 'gitPath': 'docs/revue-integrale/contenu-incertain/README.md', 'gitCommit': '17b003810a15954d933f49decc2bafa53de8d881', 'sha256': 'e8db013b8fa4a8fda5e87bf75fa199faf742459ba326e8f33f9c190c543608c6'}, {'path': 'docs/niveaux-progressifs/contenu-tranche/evidence-errata-1.json', 'gitPath': 'docs/revue-integrale/contenu-incertain/errata-1.json', 'gitCommit': '4247ca470354f59ea37992608b38e3728a6e22f9', 'sha256': '5418f06dcef98785a617e55a2f033c9bbdd99d9b563efe28f689fca81b9e1453'}]
PREDECESSOR = {
    "registryPath": "docs/niveaux-progressifs/corrections-contenu/lot9/revue-contenu-lot9.json",
    "registrySha256": "db40f6ae9a0b88595b0c4f5591b7ca1263b5ff1facfb9d6c1c723e6ed204ad74",
}
ANNOTATION = "uncertainContentCorrection"
MANIFEST_KEY = "uncertainContentCorrections"
PHONETIC_STATUS = "corrected-by-Claude-content-tranche"
STATUS = "frozen-whole-content-events-not-global-native-or-phonetic-approval"
PAIR_IDS = ("fr-en", "fr-es", "fr-it", "fr-zh", "fr-ja", "fr-ko", "zh-fr")
PREFIX = "melunga_deploy/content/niveaux-progressifs/"
PRIOR_ANNOTATIONS = (
    "phoneticCorrection", "reviewedFieldCorrection", "lot4PhoneticCorrection",
    "reviewedContentCorrection", "lot5FieldCorrection", "lot5ContentCorrection",
    "lot6FieldCorrection", "lot6ContentCorrection", "lot7PhoneticCorrection",
    "lot7ContentCorrection", "lot8PhoneticCorrection", "lot8ContentCorrection",
    "lot8Erratum1Correction", "lot9PhoneticCorrection", "lot9ContentCorrection",
)
PRESENT_FIELDS = ("reading", "phoneticReviewStatus", *PRIOR_ANNOTATIONS)
SNAPSHOT_KEYS = {"study", "native", "phon", "source", *PRESENT_FIELDS,
                 *(field + "Present" for field in PRESENT_FIELDS)}
PAIR_COUNTS = {
    "fr-en": {"gloses": 41, "blocs": 31}, "fr-es": {"gloses": 59, "blocs": 36},
    "fr-it": {"gloses": 59, "blocs": 20}, "fr-ja": {"gloses": 103, "blocs": 18},
    "fr-ko": {"gloses": 97, "blocs": 27}, "fr-zh": {"gloses": 56, "blocs": 7},
    "zh-fr": {"gloses": 63, "blocs": 21},
}
REJECTED_COUNTS = {"fr-en": 23, "fr-es": 24, "fr-it": 17, "fr-ja": 26,
                   "fr-ko": 24, "fr-zh": 11, "zh-fr": 20}
ACCEPTED_PAIR_COUNTS = {pair: dict(counts) for pair, counts in PAIR_COUNTS.items()}
ACCEPTED_PAIR_COUNTS["fr-it"]["blocs"] = 19
WITHDRAWN_EVENTS = [{"eventIndex": 211, "pair": "fr-it", "id": "catalogue:it:1239"}]
WITHDRAWN_OCCURRENCE = (PREFIX + "fr-it/L5.json", ("themes", 7, "phrases", 76))
WITHDRAWN_OBJECT_SHA256 = "e9a5160e714fcc2912c4ef282db800a0ab010ab73ac3ca4b451a59b59b5f9b68"
WITHDRAWAL_REASON = "« Si guadagna bene la vita » n'est pas meilleur : « bene » s'insère mal dans « guadagnarsi la vita ». L'étude actuelle « Si guadagna bene da vivere. » reste correcte (guadagnarsi da vivere). La carte garde son étude, son aide et sa glose."
AUTHOR_ERRATUM = {"evidencePath": ERRATUM_PATH, "eventCount": 4,
                  "withdrawnSourceEventIndices": [211], "correctedSourceEventIndices": [467],
                  "confirmedBlockOnlySourceEventIndices": [76, 426]}
DERIVED_METADATA = [
    {"pairId": "fr-es", "level": 8, "themeId": "L8-conversation", "before": 187, "after": 186, "inherited": False},
    {"pairId": "fr-it", "level": 3, "themeId": "L3-vocab-actions", "before": 87, "after": 86, "inherited": True},
    {"pairId": "fr-ja", "level": 4, "themeId": "L4-conversation", "before": 203, "after": 202, "inherited": False},
    {"pairId": "fr-ko", "level": 2, "themeId": "L2-conversation", "before": 192, "after": 191, "inherited": True},
    {"pairId": "fr-ko", "level": 4, "themeId": "L4-conversation", "before": 188, "after": 187, "inherited": False},
    {"pairId": "fr-ko", "level": 5, "themeId": "L5-conversation", "before": 220, "after": 219, "inherited": True},
    {"pairId": "fr-ko", "level": 8, "themeId": "L8-conversation", "before": 133, "after": 132, "inherited": False},
]


def ensure(condition, message):
    if not condition:
        raise ValueError("Uncertain-content corrections: " + message)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def object_sha(value):
    return sha(json.dumps(value, ensure_ascii=False, sort_keys=True,
                          separators=(",", ":")).encode("utf-8"))


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
        PREFIX + pair + f"/L{level}.json" for pair in PAIR_IDS for level in range(1, 11)
    } | {PREFIX + "repertoires/" + pair + ".json" for pair in PAIR_IDS}


def before_snapshot(phrase):
    snapshot = {field: copy.deepcopy(phrase.get(field)) for field in ("study", "native", "phon", "source")}
    for field in PRESENT_FIELDS:
        snapshot[field + "Present"] = field in phrase
        snapshot[field] = copy.deepcopy(phrase.get(field))
    return snapshot


def occurrences(document, bank):
    """Every mutable phrase copy, with its frozen address and occurrence role."""
    if bank:
        for field, profile in (("phrases", "transport-phrase"), ("receivedModels", "received-model")):
            for index, phrase in enumerate(document.get(field, [])):
                yield phrase, profile, [field, index]
    else:
        for field in ("themes", "heldThemes"):
            for theme_index, theme in enumerate(document.get(field, [])):
                for phrase_index, phrase in enumerate(theme.get("phrases", [])):
                    yield phrase, "canonical", [field, theme_index, "phrases", phrase_index]
        for index, phrase in enumerate(document.get("reserve", [])):
            yield phrase, "canonical", ["reserve", index]


def load_registry(root):
    root = Path(root)
    raw = _read(root, REGISTRY_PATH)
    ensure(sha(raw) == REGISTRY_SHA256, "frozen registry bytes differ")
    registry = json.loads(raw)
    ensure(registry.get("version") == 1 and registry.get("id") == "contenu-incertain-tranche"
           and registry.get("status") == STATUS and registry.get("baseSnapshotCommit") == BASE_SNAPSHOT,
           "unknown content edition or global approval claim")
    ensure(registry.get("appliesAfter") == [PREDECESSOR]
           and sha(_read(root, PREDECESSOR["registryPath"])) == PREDECESSOR["registrySha256"],
           "preceding lot-9 content layer differs")
    ensure(registry.get("evidenceFiles") == EVIDENCE_FILES, "evidence descriptors differ")
    exception_raw = _read(root, EXCEPTIONS_PATH)
    ensure(sha(exception_raw) == EXCEPTIONS_SHA256
           and registry.get("exceptionsFile") == {"path": EXCEPTIONS_PATH, "sha256": EXCEPTIONS_SHA256},
           "frozen exception overlay differs")
    exceptions = json.loads(exception_raw)
    evidence, erratum = {}, {}
    for descriptor in EVIDENCE_FILES:
        data = _read(root, descriptor["path"])
        ensure(sha(data) == descriptor["sha256"], "frozen evidence bytes differ")
        if descriptor["path"] == EVIDENCE_PATH:
            evidence = json.loads(data)
        elif descriptor["path"] == ERRATUM_PATH:
            erratum = json.loads(data)
    events = evidence.get("events")
    ensure(evidence.get("id") == "contenu-incertain-claude"
           and evidence.get("baseSnapshotCommit") == BASE_SNAPSHOT
           and evidence.get("decisions") == {}
           and evidence.get("counts") == {"events": 638, "parCouple": PAIR_COUNTS, "ecartes": REJECTED_COUNTS}
           and isinstance(events, list) and len(events) == 638,
           "unapproved source selection or rejected-decision counts")
    erratum_events = erratum.get("events")
    ensure(erratum.get("id") == "contenu-incertain-errata-1"
           and erratum.get("reference") == "17b0038 et 68031b7"
           and isinstance(erratum_events, list) and len(erratum_events) == 4
           and [(event.get("id"), event.get("action")) for event in erratum_events] == [
               ("catalogue:it:1239", "retirer-l-evenement-de-contenu"),
               ("catalogue:es:3353", "appliquer-le-bloc-seul"),
               ("catalogue:ko:3767", "appliquer-le-bloc-seul"),
               ("catalogue:ko:3637", "appliquer-le-bloc-avec-cette-aide")],
           "unknown four-case author erratum")
    ensure(erratum_events[0]["reason"] == WITHDRAWAL_REASON
           and erratum_events[1]["finalPhon"] == events[76]["after"]["phon"]
           and erratum_events[2]["finalPhon"] == events[426]["after"]["phon"]
           and erratum_events[3]["id"] == events[467]["id"]
           and erratum_events[3]["blocAfterPhon"] == events[467]["after"]["phon"]
           and erratum_events[3]["study"] == events[467]["after"]["study"]
           and erratum_events[3]["reading"] == events[467]["after"]["reading"]
           and erratum_events[3]["finalPhon"] == "gueu-nyo-neun sam-guè gou-go-reul hè-sso-yo",
           "whole block erratum chain differs")
    withdrawn = events[211]
    ensure(withdrawn.get("pair") == "fr-it" and withdrawn.get("id") == "catalogue:it:1239"
           and withdrawn.get("kind") == "bloc" and withdrawn.get("fields") == ["phon", "study"],
           "withdrawn source block differs")
    ensure(exceptions == {"version": 1, "id": "contenu-tranche-exceptions",
               "status": "officially-withdrawn-whole-block",
               "baseSnapshotCommit": BASE_SNAPSHOT, "evidenceCommit": EVIDENCE_COMMIT,
               "erratumCommit": ERRATUM_COMMIT,
               "sourceRegistrySha256": EVIDENCE_FILES[0]["sha256"],
               "withdrawals": [{**WITHDRAWN_EVENTS[0], "kind": withdrawn["kind"], "fields": withdrawn["fields"],
                          "before": withdrawn["before"], "rejectedAfter": withdrawn["after"],
                          "reason": WITHDRAWAL_REASON, "erratumEventIndex": 0}]},
           "withdrawn before, refused whole after, or reason differs")
    ensure(tuple(registry.get(field) for field in ("sourceEventCount", "withdrawnEventCount", "correctionCount", "eventCount", "approvedFieldCount", "changedFieldCount"))
           == (638, 1, 637, 637, 870, 870) and registry.get("withdrawnEvents") == WITHDRAWN_EVENTS,
           "source/withdrawn/executed event or field totals differ")
    ensure(registry.get("kindCounts") == {"glose": 478, "bloc": 159}
           and registry.get("rejectedCount") == 145
           and registry.get("pairCounts") == ACCEPTED_PAIR_COUNTS
           and registry.get("rejectedCounts") == REJECTED_COUNTS,
           "kind, pair, or rejected totals differ")
    ensure(registry.get("derivedMetadataChanges") == DERIVED_METADATA,
           "derived concept metadata differs")
    ensure(registry.get("authorErratum") == AUTHOR_ERRATUM, "author erratum scope differs")
    rows = registry.get("corrections")
    ensure(isinstance(rows, list) and len(rows) == 637, "correction list incomplete")
    corrections, addresses, kinds, field_counts = {}, set(), Counter(), Counter()
    occurrence_counts = Counter()
    accepted = [(index, event) for index, event in enumerate(events) if index != 211]
    for row, (index, event) in zip(rows, accepted):
        key = event.get("pair"), event.get("id")
        ensure(key[0] in PAIR_IDS and isinstance(key[1], str) and key not in corrections,
               "unknown or repeated evidence identity")
        kind, fields = event.get("kind"), event.get("fields")
        ensure(kind in {"glose", "bloc"} and isinstance(fields, list) and fields
               and len(set(fields)) == len(fields)
               and set(fields) == set(event.get("before", {})) == set(event.get("after", {}))
               and set(fields) <= {"native", "study", "phon", "reading"}, "invalid whole event")
        ensure(fields == ["native"] if kind == "glose" else "study" in fields,
               "glose/block field scope differs")
        literals = {field: {"before": event["before"][field], "after": event["after"][field]} for field in fields}
        if index == 467:
            literals["phon"]["after"] = erratum_events[3]["finalPhon"]
        ensure(all(isinstance(value[side], str) for value in literals.values() for side in ("before", "after"))
               and all(value["before"] != value["after"] for value in literals.values()),
               "unchanged or nonliteral field")
        ensure(row.get("pairId") == key[0] and row.get("id") == key[1]
               and row.get("eventIndex") == index and type(row.get("eventIndex")) is int
               and row.get("kind") == kind and row.get("atomicBundle") is (kind == "bloc")
               and row.get("fields") == literals, "evidence pointer, literal, or complete bloc differs")
        declared = row.get("occurrences")
        ensure(isinstance(declared, list) and declared, "missing occurrence guards")
        profiles, anchor_found = Counter(), False
        for occurrence in declared:
            path, location, profile = occurrence.get("path"), occurrence.get("location"), occurrence.get("profile")
            ensure(allowed_runtime_path(path) and isinstance(location, list) and location
                   and all((type(part) is int and part >= 0) or (isinstance(part, str) and part in {
                       "themes", "heldThemes", "phrases", "reserve", "receivedModels"}) for part in location),
                   "unsafe occurrence address")
            ensure(profile in {"canonical", "transport-phrase", "received-model"}, "unknown occurrence profile")
            address = path, tuple(location)
            ensure(address not in addresses, "repeated occurrence address")
            addresses.add(address)
            before = occurrence.get("expectedBefore")
            ensure(isinstance(before, dict) and set(before) == SNAPSHOT_KEYS
                   and isinstance(before["source"], dict) and before["source"], "incomplete before/source guards")
            for field in PRESENT_FIELDS:
                ensure(type(before[field + "Present"]) is bool and (before[field + "Present"] or before[field] is None),
                       "invalid presence/value guard")
            ensure(all(before[field] == values["before"] for field, values in literals.items()),
                   "copy literal differs from source event")
            digest = occurrence.get("expectedBeforeObjectSha256")
            ensure(isinstance(digest, str) and len(digest) == 64 and set(digest) <= set("0123456789abcdef"),
                   "missing complete before-object hash")
            anchor_found |= {"path": path, "location": location} == event["occurrence"]
            profiles[profile] += 1
        ensure(anchor_found and profiles["canonical"] + profiles["received-model"] == 1,
               "unique source anchor missing")
        kinds[kind] += 1
        field_counts.update(fields)
        occurrence_counts.update(profiles)
        corrections[key] = row
    ensure(kinds == {"glose": 478, "bloc": 159}
           and field_counts == {"native": 511, "study": 159, "phon": 150, "reading": 50}
           and occurrence_counts == {"canonical": 626, "transport-phrase": 17, "received-model": 11},
           "frozen event or occurrence totals differ")
    return registry, corrections, sha(raw)


def annotation_for(row, before, registry_hash):
    return {"id": row["id"], "registryPath": REGISTRY_PATH, "registrySha256": registry_hash,
            "baseSnapshotCommit": BASE_SNAPSHOT, "kind": row["kind"], "evidenceEventIndex": row["eventIndex"],
            "fields": sorted(row["fields"]),
            "beforeFields": {field: copy.deepcopy(before[field]) for field in sorted(row["fields"])},
            "originalPhoneticReviewStatusPresent": before["phoneticReviewStatusPresent"],
            "originalPhoneticReviewStatus": copy.deepcopy(before["phoneticReviewStatus"]),
            "evidenceCommits": [EVIDENCE_COMMIT, ERRATUM_COMMIT]}


def refresh_derived_metadata(root, outputs, report):
    """Count existing presentations again; never choose or move a presentation."""
    expected = {(row["pairId"], row["level"], row["themeId"]): row for row in DERIVED_METADATA}
    seen, changed = set(), set()

    def concept(phrase):
        explicit = phrase.get("lexicalConceptId")
        return ("declared", {"leger": "léger"}.get(explicit, explicit)) if explicit else (
            "literal", phrase["study"], phrase["native"])

    for pair in PAIR_IDS:
        bank = json.loads(outputs[root / PREFIX / "repertoires" / (pair + ".json")])
        lookup = {phrase["id"]: phrase for phrase in bank["phrases"]}
        for level in range(1, 11):
            path = root / PREFIX / pair / f"L{level}.json"
            ensure(path in outputs, "runtime cell output missing")
            cell, touched = json.loads(outputs[path]), False
            for field in ("themes", "heldThemes"):
                for theme in cell[field]:
                    rows = list(theme["phrases"])
                    for references in ("reviewReferences", "contextReferences"):
                        for reference in theme.get(references, []):
                            ensure(reference["id"] in lookup, "concept reference missing from transport bank")
                            rows.append(lookup[reference["id"]])
                    count = len({concept(phrase) for phrase in rows})
                    key = pair, level, theme["id"]
                    correction = expected.get(key)
                    if correction is not None:
                        ensure(count == correction["after"]
                               and theme.get("pedagogicalConceptCount") in {correction["before"], correction["after"]},
                               "frozen concept-counter transition differs")
                        seen.add(key)
                    else:
                        ensure(count == theme.get("pedagogicalConceptCount"),
                               "unexpected concept-counter change")
                    if count != theme.get("pedagogicalConceptCount"):
                        theme["pedagogicalConceptCount"] = count
                        touched = True
            if touched:
                outputs[path] = compact(cell)
                changed.add(path.relative_to(root).as_posix())
    ensure(seen == set(expected), "derived metadata theme disappeared")
    for density in report.get("density", []):
        correction = expected.get((density["pair"], density["level"], density["themeId"]))
        if correction is not None:
            ensure(density.get("pedagogicalConceptCount") in {correction["before"], correction["after"]},
                   "report concept-counter transition differs")
            density["pedagogicalConceptCount"] = correction["after"]
    return changed


def apply_to_outputs(root, outputs, report):
    """Return a new in-memory edition; validate all guards before any result escapes."""
    root = Path(root)
    registry, corrections, registry_hash = load_registry(root)
    result, seen, withdrawn_seen, profiles = dict(outputs), set(), set(), Counter()
    approved_hits, changed_hits, modified, transports = Counter(), Counter(), set(), {}
    status_changes = 0
    for path, text in outputs.items():
        relative = Path(path).relative_to(root).as_posix()
        if not allowed_runtime_path(relative):
            continue
        document = json.loads(text)
        bank = "/repertoires/" in relative
        pair = document.get("pairId", document.get("id"))
        ensure(pair in PAIR_IDS, "unknown runtime pair")
        touched = False
        for phrase, profile, location in occurrences(document, bank):
            if (pair, phrase.get("id")) == ("fr-it", "catalogue:it:1239"):
                address = relative, tuple(location)
                ensure(address == WITHDRAWN_OCCURRENCE and address not in withdrawn_seen
                       and profile == "canonical" and object_sha(phrase) == WITHDRAWN_OBJECT_SHA256,
                       "withdrawn whole block, provenance, or location changed")
                withdrawn_seen.add(address)
            row = corrections.get((pair, phrase.get("id")))
            if row is None:
                ensure(ANNOTATION not in phrase, "stray correction annotation")
                continue
            address = relative, tuple(location)
            candidates = [occurrence for occurrence in row["occurrences"]
                          if (occurrence["path"], tuple(occurrence["location"])) == address
                          and occurrence["profile"] == profile]
            ensure(len(candidates) == 1 and address not in seen,
                   "missing, extra, moved, or duplicated frozen occurrence: " + str((pair, row["id"], address)))
            occurrence = candidates[0]
            original = copy.deepcopy(phrase)
            existing = original.pop(ANNOTATION, None)
            phon_changes = "phon" in row["fields"]
            if existing is not None:
                ensure(isinstance(existing, dict), "invalid existing annotation")
                for field in row["fields"]:
                    original[field] = existing.get("beforeFields", {}).get(field)
                if phon_changes:
                    if existing.get("originalPhoneticReviewStatusPresent") is True:
                        original["phoneticReviewStatus"] = existing.get("originalPhoneticReviewStatus")
                    else:
                        original.pop("phoneticReviewStatus", None)
            before = before_snapshot(original)
            ensure(before == occurrence["expectedBefore"]
                   and object_sha(original) == occurrence["expectedBeforeObjectSha256"],
                   "complete before/source/prior annotation or outside field changed: " + str((pair, row["id"], address)))
            expected = annotation_for(row, before, registry_hash)
            if existing is not None:
                ensure(existing == expected, "existing correction annotation altered")
                ensure(all(phrase.get(field) == value["after"] for field, value in row["fields"].items()),
                       "existing after altered or atomic bloc partly applied")
                ensure(not phon_changes or phrase.get("phoneticReviewStatus") == PHONETIC_STATUS,
                       "corrected phonetic status altered")
            # All fields in the source bloc are applied together after validation.
            for field, value in row["fields"].items():
                phrase[field] = value["after"]
                approved_hits[field] += 1
                changed_hits[field] += 1
            if phon_changes:
                phrase["phoneticReviewStatus"] = PHONETIC_STATUS
                status_changes += 1
            phrase[ANNOTATION] = expected
            seen.add(address)
            profiles[profile] += 1
            touched = True
        if touched:
            result[path] = compact(document)
            modified.add(relative)
        if bank:
            transports[pair] = sha(result[path].encode("utf-8"))
    expected_addresses = {(occurrence["path"], tuple(occurrence["location"]))
                          for row in corrections.values() for occurrence in row["occurrences"]}
    ensure(seen == expected_addresses, "a frozen canonical or transport occurrence disappeared")
    ensure(withdrawn_seen == {WITHDRAWN_OCCURRENCE}, "withdrawn whole block disappeared")
    ensure(set(transports) == set(PAIR_IDS), "transport bank output missing")
    refresh_derived_metadata(root, result, report)
    # These seven cells already carry approved content changes. Keep this stable
    # on the second application, even when their counters are already current.
    modified.update(PREFIX + row["pairId"] + f"/L{row['level']}.json" for row in DERIVED_METADATA)
    declaration = {"registryPath": REGISTRY_PATH, "registrySha256": registry_hash,
        "baseSnapshotCommit": BASE_SNAPSHOT, "appliesAfter": registry["appliesAfter"],
        **{field: registry[field] for field in ("correctionCount", "eventCount", "approvedFieldCount", "changedFieldCount",
                                               "kindCounts", "pairCounts", "rejectedCount", "rejectedCounts",
                                               "sourceEventCount", "withdrawnEventCount", "withdrawnEvents", "exceptionsFile",
                                               "authorErratum")},
        "evidenceCommits": [EVIDENCE_COMMIT, ERRATUM_COMMIT]}
    manifest_path = root / PREFIX / "manifest.json"
    ensure(manifest_path in result, "manifest output missing")
    manifest = json.loads(result[manifest_path])
    ensure(manifest.get("lot9ContentCorrections", {}).get("registrySha256") == PREDECESSOR["registrySha256"],
           "prior output declaration changed")
    ensure(MANIFEST_KEY not in manifest or manifest[MANIFEST_KEY] == declaration,
           "existing manifest declaration altered")
    manifest[MANIFEST_KEY] = declaration
    for pair in manifest["pairs"]:
        pair["repertoireSha256"] = transports[pair["id"]]
    result[manifest_path] = json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"
    summary = {**declaration, "occurrenceCount": sum(profiles.values()), "occurrenceProfiles": dict(sorted(profiles.items())),
        "approvedRuntimeFields": sum(approved_hits.values()), "changedRuntimeFields": sum(changed_hits.values()),
        "approvedFieldOccurrences": dict(sorted(approved_hits.items())), "changedFieldOccurrences": dict(sorted(changed_hits.items())),
        "phoneticStatusChangedOccurrences": status_changes, "modifiedRuntimeFiles": sorted(modified),
        "derivedMetadataChanges": copy.deepcopy(DERIVED_METADATA),
        "transportSha256ByPair": transports, "globalPhoneticApproval": False, "globalNativeApproval": False,
        "sourceValidation": "Original sources and all preceding layers checked before frozen whole content events; exact tuples, complete objects and atomic blocs only."}
    return result, summary

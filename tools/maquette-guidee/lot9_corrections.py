"""Frozen Italian lot-9 events and separate Spanish EN71 erratum.

Whole literals and atomic bundles only. No convention or placement is inferred.
"""
from __future__ import annotations

import copy
from collections import Counter
import hashlib
import json
from pathlib import Path, PurePosixPath

BASE_SNAPSHOT = '40d4c0b264b364fe31d4fd1bc9acae03dc130e01'
EVIDENCE_COMMIT = '5d450cc79f32d180f9331c5d06387fe36e8d94a6'
PHONETIC_REGISTRY = 'docs/niveaux-progressifs/corrections-phonetiques/lot9/revue-claude-lot9.json'
CONTENT_REGISTRY = 'docs/niveaux-progressifs/corrections-contenu/lot9/revue-contenu-lot9.json'
ERRATUM_REGISTRY = 'docs/niveaux-progressifs/corrections-phonetiques/lot8-errata-1/revue-claude-lot8-errata-1.json'
EVIDENCE = {'docs/niveaux-progressifs/corrections-phonetiques/lot8-errata-1/evidence-errata-1.json': {'gitPath': 'docs/revue-integrale/lot8-fr-es-L1-L10/errata-1.json', 'gitCommit': '76602a1b0be0a3539171090733d0a17b079644c6', 'sha256': '480f4c9348a393d29f1c3c3d6d0ffe5e16b01e802d94403840d90c15b52f7535'}, 'docs/niveaux-progressifs/corrections-phonetiques/lot9/evidence-registre-phonetique.json': {'gitPath': 'docs/revue-integrale/lot9-fr-it-L1-L10/registre-phonetique.json', 'gitCommit': '5d450cc79f32d180f9331c5d06387fe36e8d94a6', 'sha256': '661131a84a421f29d017872879713ccc3ddcbd8a5f4f9b441a312dcedaaa51e9'}, 'docs/niveaux-progressifs/corrections-contenu/lot9/evidence-contenu-lot9.json': {'gitPath': 'docs/revue-integrale/lot9-fr-it-L1-L10/lot-contenu-gloses.json', 'gitCommit': '5d450cc79f32d180f9331c5d06387fe36e8d94a6', 'sha256': 'cf20a6f4595f4e8c3627aac8bd4956ef5724bd9f220b2676288a88878f4636a0'}}
ERRATUM_EVIDENCE = ('docs/niveaux-progressifs/corrections-phonetiques/lot8-errata-1/evidence-errata-1.json',)
PHONETIC_EVIDENCE = ('docs/niveaux-progressifs/corrections-phonetiques/lot9/evidence-registre-phonetique.json',)
CONTENT_EVIDENCE = ('docs/niveaux-progressifs/corrections-contenu/lot9/evidence-contenu-lot9.json',)
CONFIGS = {'erratum': {'path': 'docs/niveaux-progressifs/corrections-phonetiques/lot8-errata-1/revue-claude-lot8-errata-1.json', 'id': 'revue-claude-lot8-errata-1', 'status': 'frozen-whole-phonetic-erratum-not-global-native-approval', 'annotation': 'lot8Erratum1Correction', 'manifestKey': 'lot8Erratum1Corrections', 'evidencePaths': ('docs/niveaux-progressifs/corrections-phonetiques/lot8-errata-1/evidence-errata-1.json',), 'predecessor': {'registryPath': 'docs/niveaux-progressifs/corrections-contenu/lot8/revue-contenu-lot8.json', 'registrySha256': '756c2e867928b24a0e4e8a86216072f4fea2dfa832d3938b5e38dc622c01a8ce'}, 'previousManifestKey': 'lot8ContentCorrections', 'counts': (1, 1, 1, 1), 'sha256': 'cbbfa4e5f1ca6afd83e53eb8f12045d3cd0d2d7e879f1053efa69bf4e9e1361e'}, 'phonetic': {'path': 'docs/niveaux-progressifs/corrections-phonetiques/lot9/revue-claude-lot9.json', 'id': 'revue-claude-lot9-phonetique', 'status': 'frozen-whole-phonetic-events-not-global-native-approval', 'annotation': 'lot9PhoneticCorrection', 'manifestKey': 'lot9PhoneticCorrections', 'evidencePaths': ('docs/niveaux-progressifs/corrections-phonetiques/lot9/evidence-registre-phonetique.json',), 'predecessor': {'registryPath': 'docs/niveaux-progressifs/corrections-phonetiques/lot8-errata-1/revue-claude-lot8-errata-1.json', 'registrySha256': 'cbbfa4e5f1ca6afd83e53eb8f12045d3cd0d2d7e879f1053efa69bf4e9e1361e'}, 'previousManifestKey': 'lot8Erratum1Corrections', 'counts': (70, 70, 70, 70), 'sha256': '313973bdf60a2bf629b4410ae7895e1e0bb4604f08bde2c5037058fa332e5665'}, 'content': {'path': 'docs/niveaux-progressifs/corrections-contenu/lot9/revue-contenu-lot9.json', 'id': 'revue-contenu-lot9', 'status': 'frozen-certain-gloss-and-linked-bundle-events-not-global-native-approval', 'annotation': 'lot9ContentCorrection', 'manifestKey': 'lot9ContentCorrections', 'evidencePaths': ('docs/niveaux-progressifs/corrections-contenu/lot9/evidence-contenu-lot9.json',), 'predecessor': {'registryPath': 'docs/niveaux-progressifs/corrections-phonetiques/lot9/revue-claude-lot9.json', 'registrySha256': '313973bdf60a2bf629b4410ae7895e1e0bb4604f08bde2c5037058fa332e5665'}, 'previousManifestKey': 'lot9PhoneticCorrections', 'counts': (37, 37, 43, 43), 'sha256': 'db40f6ae9a0b88595b0c4f5591b7ca1263b5ff1facfb9d6c1c723e6ed204ad74'}}
PAIR_IDS = ("fr-en", "fr-es", "fr-it", "fr-zh", "fr-ja", "fr-ko", "zh-fr")
PREFIX = "melunga_deploy/content/niveaux-progressifs/"
PRIOR_ANNOTATIONS = ("phoneticCorrection", "reviewedFieldCorrection", "lot4PhoneticCorrection",
                     "reviewedContentCorrection", "lot5FieldCorrection", "lot5ContentCorrection",
                     "lot6FieldCorrection", "lot6ContentCorrection", "lot7PhoneticCorrection",
                     "lot7ContentCorrection", "lot8PhoneticCorrection", "lot8ContentCorrection",
                     "lot8Erratum1Correction", "lot9PhoneticCorrection")
PRESENT_FIELDS = ("reading", "phoneticReviewStatus", *PRIOR_ANNOTATIONS)
SNAPSHOT_KEYS = {"study", "native", "phon", "source", *PRESENT_FIELDS,
                 *(field + "Present" for field in PRESENT_FIELDS)}


def ensure(condition, message):
    if not condition:
        raise ValueError("Lot-9 corrections: " + message)


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
    """Select exactly the reviewer literals; no inferred phonetic rule."""
    approved = {}
    if kind == "erratum":
        path = ERRATUM_EVIDENCE[0]
        document = evidence[path]
        ensure(document.get("reference") == "e12c600" and len(document.get("events", [])) == 1,
               "wrong erratum edition")
        event = document["events"][0]
        ensure(event.get("id") == "catalogue:es:2205" and event.get("rules") == ["S"]
               and event.get("beforePhon") == "KOUM-plé la NOR-ma én"
               and event.get("deliveredAfterPhon") == "KOUM-plé la NOR-ma é-né sé-TÉN-ta i OU-no"
               and event.get("afterPhon") == "KOUM-plé la NOR-ma é É-né sé-TÉN-ta i OU-no",
               "wrong EN71 literal chain")
        approved[(path, "events", 0)] = {
            "pair": "fr-es", "id": event["id"], "study": event["study"],
            "fields": {"phon": {"before": event["deliveredAfterPhon"], "after": event["afterPhon"]}},
            "rules": ["S"], "native": "c'est conforme à la norme EN71 ?",
            "priorCorrection": True, "transportCopies": 0,
        }
    elif kind == "phonetic":
        for path, document in evidence.items():
            ensure(path == PHONETIC_EVIDENCE[0]
                   and document.get("baseSnapshotCommit") == BASE_SNAPSHOT
                   and document.get("eventCount") == len(document.get("events", [])) == 70,
                   "whole-aid evidence edition or count changed")
            counts = Counter()
            for index, event in enumerate(document["events"]):
                ensure(event.get("pair") == "fr-it", "unapproved evidence pair")
                labels = event.get("rules")
                ensure(isinstance(labels, list) and labels and len(set(labels)) == len(labels)
                       and set(labels) <= {"N", "S", "T", "A"}, "unapproved lot-9 sound label")
                counts.update(labels)
                before, after = event["beforePhon"], event["afterPhon"]
                ensure(type(event.get("priorCorrection")) is bool and type(event.get("transportCopies")) is int,
                       "prior correction or transport declaration changed")
                ensure(isinstance(before, str) and isinstance(after, str) and before != after,
                       "invalid literal before/after")
                approved[(path, "events", index)] = {
                    "pair": "fr-it", "id": event["id"], "study": event["study"],
                    "fields": {"phon": {"before": before, "after": after}},
                    "rules": labels, "anchor": event["occurrence"],
                    "native": event["native"], "priorCorrection": event["priorCorrection"],
                    "transportCopies": event["transportCopies"],
                }
            ensure(counts == {"N":63, "S":3, "T":3, "A":1}, "whole event rule counts differ")
    else:
        for path, document in evidence.items():
            ensure(document.get("reference") == BASE_SNAPSHOT and document.get("certainCount") == 34,
                   "content evidence edition/count changed")
            selected = [(index, event) for index, event in enumerate(document.get("items", []))
                        if event.get("certainty") == "certain"]
            ensure(len(selected) == 34 and all(event.get("field") == "native" for _,event in selected),
                   "certain gloss selection changed")
            for index, event in selected:
                ensure(isinstance(event.get("before"), str) and isinstance(event.get("after"), str)
                       and event["before"] != event["after"], "invalid literal gloss")
                approved[(path, "items", index)] = {
                    "pair": "fr-it", "id": event["id"], "study": event["study"],
                    "fields": {"native": {"before": event["before"], "after": event["after"]}},
                    "rules": [], "atomic": False,
                }
            bundles = document.get("linkedBundles")
            ensure(isinstance(bundles, list) and len(bundles) == 3, "linked bundle selection changed")
            for index, event in enumerate(bundles):
                expected_id = ("catalogue:it:2489", "catalogue:it:3879", "catalogue:it:4098")[index]
                ensure(event.get("certainty") == "certain" and event.get("applyTogether") is True
                       and event.get("id") == expected_id, "unapproved or non-atomic content bundle")
                ensure(set(event.get("before", {})) == set(event.get("after", {})) == {"study", "native", "phon"},
                       "a linked bundle field was dropped or invented")
                fields = {field: {"before": value, "after": event["after"][field]}
                          for field, value in event["before"].items()}
                ensure(all(isinstance(value["before"], str) and isinstance(value["after"], str)
                           and value["before"] != value["after"] for value in fields.values()),
                       "invalid linked bundle literal")
                approved[(path, "linkedBundles", index)] = {
                    "pair": "fr-it", "id": event["id"], "study": event["before"]["study"],
                    "fields": fields, "rules": [], "atomic": True,
                }
    return approved

def load_registry(root, kind):
    root = Path(root)
    ensure(kind in CONFIGS, "unknown batch")
    config = CONFIGS[kind]
    raw = _read(root, config["path"])
    ensure(sha(raw) == config["sha256"], "frozen registry bytes differ")
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
        ensure(isinstance(events, list) and len(events) == 1,
               "complete atomic event references expected")
        merged, event, rules, row_pointers = {}, None, [], []
        expected_fields = ("phon",) if kind in {"phonetic", "erratum"} else None
        for index, event_ref in enumerate(events):
            ensure(set(event_ref) == {"evidencePath", "evidenceCollection", "evidenceIndex"}, "bad event pointer")
            ensure(type(event_ref["evidenceIndex"]) is int and event_ref["evidenceIndex"] >= 0,
                   "evidence index is not a non-negative integer")
            pointer = event_ref["evidencePath"], event_ref["evidenceCollection"], event_ref["evidenceIndex"]
            ensure(pointer in approved and pointer not in used, "unapproved or reused reviewer event")
            item = approved[pointer]
            ensure(key == (item["pair"], item["id"]), "reviewer event identity changed")
            if kind in {"phonetic", "erratum"}:
                ensure(set(item["fields"]) == {expected_fields[index]}, "aid/reading field or order changed")
            if event is None:
                event = item
                rules = item["rules"]
            else:
                ensure(item["study"] == event["study"], "linked pair changes study")
            ensure(not set(merged) & set(item["fields"]), "same field approved twice")
            merged.update(item["fields"])
            used.add(pointer); row_pointers.append(pointer)
        atomic = False if kind in {"phonetic", "erratum"} else event["atomic"]
        ensure(row.get("fields") == merged and row.get("rules") == rules
               and row.get("atomicBundle") is atomic, "literal event or complete atomic bundle differs")
        if kind in {"phonetic", "erratum"}:
            ensure(set(merged) == {"phon"}, "a whole aid changed an unapproved field")
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
            for field, values in merged.items():
                ensure(before[field] == values["before"], "before differs from reviewer evidence")
            if kind in {"phonetic", "erratum"}:
                ensure(before["native"] == event["native"]
                       and any(before[name + "Present"] for name in PRIOR_ANNOTATIONS[:-1]) is event["priorCorrection"],
                       "unannounced earlier correction or changed meaning")
            profiles[profile] += 1
        ensure(profiles["canonical"] <= 1 and profiles["received-model"] <= 1
               and (profiles["canonical"] == 1 or profiles["received-model"] == 1), "missing unique primary or received-only source")
        if kind == "phonetic":
            for pointer in row_pointers:
                anchor = approved[pointer]["anchor"]
                ensure(any(o["path"] == anchor["path"] and o["location"] == anchor["location"] for o in occurrences), "whole reviewer anchor absent")
            ensure(profiles["transport-phrase"] == event["transportCopies"], "reviewer transport count differs")
        corrections[key] = row
    ensure(used == set(approved) and sum(len(row["events"]) for row in rows) == counts[1], "a frozen approved event was omitted")
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
    if kind == "erratum":
        return "corrected-by-Claude-lot8-errata-1-" + "+".join(row["rules"])
    return "corrected-by-Claude-lot9-" + "+".join(row["rules"]) if kind == "phonetic" else "corrected-by-Claude-content-lot9"


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
    previous_key = config["previousManifestKey"]
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

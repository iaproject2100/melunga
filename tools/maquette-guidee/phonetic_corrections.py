"""Apply the audited Claude ledger after original-source generation checks.

This module copies no sound rules: every replacement is an exact, pinned
before/after event. Source objects and learner-access metadata stay unchanged.
"""
from __future__ import annotations

import copy
from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path, PurePosixPath


REGISTRY_PATH = "docs/niveaux-progressifs/corrections-phonetiques/revue-claude-lot2.json"
EVIDENCE_COMMIT = "dfc665bf5574dd99d308c756efc69c571aec62cc"
EVIDENCE = {
    "docs/niveaux-progressifs/corrections-phonetiques/evidence-registre-phonetique.json": {
        "sha256": "2833fca404acbac078e03090c864b4dd1a8aaa658ab626563672d20c0db9569c",
        "gitPath": "docs/revue-integrale/registre-phonetique.json", "eventCount": 736},
    "docs/niveaux-progressifs/corrections-phonetiques/evidence-registre-tj.json": {
        "sha256": "856ccdd4525fdd74706ae16081c28e60bd629b3e83039502df81f824ebca74d0",
        "gitPath": "docs/revue-integrale/registre-tj.json", "eventCount": 38},
}
PAIR_IDS = ("fr-en", "fr-es", "fr-it", "fr-zh", "fr-ja", "fr-ko", "zh-fr")
STATUS = {"B": "corrected-by-Claude-g-devant-e-i", "C": "corrected-by-Claude-les-lei",
          "D": "corrected-by-Claude-tj-vers-dj"}
PREFIX = "melunga_deploy/content/niveaux-progressifs/"


def ensure(condition, message):
    if not condition:
        raise ValueError("Phonetic corrections: " + message)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def compact(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n"


def allowed_runtime_path(path):
    parts = PurePosixPath(path)
    if parts.is_absolute() or ".." in parts.parts or str(parts) != path:
        return False
    return path in {PREFIX + pair + f"/L{level}.json" for pair in PAIR_IDS for level in range(1, 11)} | {
        PREFIX + "repertoires/" + pair + ".json" for pair in PAIR_IDS}


def before_snapshot(phrase):
    return {"study": phrase.get("study"), "native": phrase.get("native"), "phon": phrase.get("phon"),
            "readingPresent": "reading" in phrase, "reading": phrase.get("reading"),
            "source": phrase.get("source"),
            "phoneticReviewStatusPresent": "phoneticReviewStatus" in phrase,
            "phoneticReviewStatus": phrase.get("phoneticReviewStatus")}


def _read(root, relative):
    path = root / relative
    ensure(path.resolve().is_relative_to(root.resolve()), "registry/evidence path escapes root")
    return path.read_bytes()


def load_registry(root):
    """Validate ledger events against independently pinned evidence bytes."""
    root = Path(root)
    raw = _read(root, REGISTRY_PATH)
    registry = json.loads(raw)
    ensure(registry.get("version") == 1 and registry.get("id") == "revue-claude-lot2", "unknown registry")
    ensure(registry.get("evidenceCommit") == EVIDENCE_COMMIT, "wrong evidence commit")
    evidence_files = registry.get("evidenceFiles")
    ensure(isinstance(evidence_files, list) and len(evidence_files) == len(EVIDENCE), "wrong evidence file count")
    evidence_rows = {}
    for relative, expected in EVIDENCE.items():
        descriptors = [row for row in evidence_files if row.get("path") == relative]
        ensure(len(descriptors) == 1 and descriptors[0] == {"path": relative, **expected}, "evidence descriptor differs")
        content = _read(root, relative)
        ensure(sha(content) == expected["sha256"], "pinned evidence bytes changed: " + relative)
        rows = json.loads(content)["corrections"]
        ensure(len(rows) == expected["eventCount"], "evidence event count differs")
        evidence_rows[relative] = rows
    rows = registry.get("corrections")
    ensure(isinstance(rows, list) and len(rows) == registry.get("correctionCount") == 772, "expected 772 corrected IDs")
    ensure(registry.get("eventCount") == 774, "expected 774 evidence events")
    corrections, used_events = {}, set()
    for row in rows:
        key = (row.get("pairId"), row.get("id"))
        ensure(key[0] in PAIR_IDS and isinstance(key[1], str) and key not in corrections, "duplicate/invalid correction ID")
        events, occurrences = row.get("events"), row.get("occurrences")
        ensure(isinstance(events, list) and events and isinstance(occurrences, list) and occurrences, "empty correction")
        previous, rules, evidence_order = None, [], []
        evidence_first = None
        for event in events:
            relative, index = event.get("evidencePath"), event.get("evidenceIndex")
            ensure(relative in evidence_rows and type(index) is int and 0 <= index < len(evidence_rows[relative]), "invalid evidence event reference")
            ensure((relative, index) not in used_events, "evidence event used twice")
            original = evidence_rows[relative][index]
            ensure((original["pair"], original["id"]) == key, "evidence ID/pair differs")
            ensure(event.get("rule") == original["regle"] in STATUS
                   and event.get("beforePhon") == original["avant"]
                   and event.get("afterPhon") == original["apres"], "event differs from pinned evidence")
            ensure(isinstance(original["avant"], str) and isinstance(original["apres"], str)
                   and original["avant"] != original["apres"], "invalid phonetic event")
            if previous is not None:
                ensure(previous == original["avant"], "inconsistent ordered correction chain")
            else:
                evidence_first = original
            previous = original["apres"]
            rules.append(original["regle"])
            evidence_order.append(list(EVIDENCE).index(relative))
            used_events.add((relative, index))
        ensure(evidence_order == sorted(evidence_order), "correction event order changed")
        ensure(row.get("rule") == "+".join(rules) and row.get("afterPhon") == previous
               and row.get("afterReviewStatus") == STATUS[rules[-1]], "incorrect final correction")
        canonical_profiles = []
        for occurrence in occurrences:
            ensure(allowed_runtime_path(occurrence.get("path", "")), "unsafe snapshot occurrence path")
            ensure(occurrence.get("profile") in {"canonical", "transport-phrase", "received-model"}, "unknown occurrence profile")
            location = occurrence.get("location")
            ensure(isinstance(location, list) and location and all(type(v) is int and v >= 0 or isinstance(v, str) and v and v not in {"..", "/"} for v in location), "invalid snapshot location")
            expected = occurrence.get("expectedBefore")
            ensure(isinstance(expected, dict) and set(expected) == {
                "study", "native", "phon", "readingPresent", "reading", "source",
                "phoneticReviewStatusPresent", "phoneticReviewStatus"}, "incomplete before profile")
            ensure(expected["study"] == evidence_first["study"] and expected["native"] == evidence_first["native"]
                   and expected["phon"] == events[0]["beforePhon"], "before profile differs from evidence")
            ensure(type(expected["readingPresent"]) is bool and type(expected["phoneticReviewStatusPresent"]) is bool
                   and isinstance(expected["source"], dict) and expected["source"], "invalid original source/status profile")
            ensure(expected["readingPresent"] or expected["reading"] is None, "missing reading carries a value")
            ensure(expected["phoneticReviewStatusPresent"] or expected["phoneticReviewStatus"] is None, "missing review status carries a value")
            if occurrence["profile"] == "canonical":
                canonical_profiles.append(expected)
        ensure(len(canonical_profiles) == 1, "expected one canonical before profile per ID")
        corrections[key] = row
    ensure(used_events == {(path, i) for path, rows in evidence_rows.items() for i in range(len(rows))}, "evidence events omitted")
    return registry, corrections, sha(raw)


def _occurrences(document, is_bank):
    if is_bank:
        for field, profile in (("phrases", "transport-phrase"), ("receivedModels", "received-model")):
            for phrase in document.get(field, []):
                yield phrase, profile
    else:
        for collection in ("themes", "heldThemes"):
            for theme in document.get(collection, []):
                for phrase in theme.get("phrases", []):
                    yield phrase, "canonical"
        for phrase in document.get("reserve", []):
            yield phrase, "canonical"


def apply_to_outputs(root, outputs, report):
    """Return corrected output strings and summary; never write any file.

    Existing make() checks validate original source strings first. Snapshot
    locations document provenance; matching uses pair/ID and complete before
    profiles, so a separately authorized reclassification does not lose an aid.
    """
    root = Path(root)
    registry, corrections, registry_sha = load_registry(root)
    result = dict(outputs)
    hits, profiles, changed_paths = Counter(), Counter(), set()
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
            key = (pair, phrase.get("id"))
            row = corrections.get(key)
            if row is None:
                ensure("phoneticCorrection" not in phrase, "unregistered correction annotation")
                continue
            expected_profiles = [o["expectedBefore"] for o in row["occurrences"] if o["profile"] == profile]
            # A new transport use can inherit the original canonical whole entry.
            if profile != "canonical":
                expected_profiles += [o["expectedBefore"] for o in row["occurrences"] if o["profile"] == "canonical"]
            original = copy.deepcopy(phrase)
            annotation = phrase.get("phoneticCorrection")
            if annotation is not None:
                ensure(isinstance(annotation, dict), "invalid existing correction annotation")
                original["phon"] = annotation.get("beforePhon")
                original.pop("phoneticCorrection")
                if annotation.get("originalReviewStatusPresent") is True:
                    original["phoneticReviewStatus"] = annotation.get("originalReviewStatus")
                else:
                    original.pop("phoneticReviewStatus", None)
            baseline = before_snapshot(original)
            ensure(baseline in expected_profiles, "unexpected original fields/source/status for " + str(key))
            expected_annotation = {"id": key[1], "registryPath": REGISTRY_PATH, "registrySha256": registry_sha,
                "beforePhon": baseline["phon"],
                "originalReviewStatusPresent": baseline["phoneticReviewStatusPresent"],
                "originalReviewStatus": baseline["phoneticReviewStatus"],
                "evidenceCommit": EVIDENCE_COMMIT, "rule": row["rule"]}
            if annotation is not None:
                ensure(annotation == expected_annotation and phrase.get("phon") == row["afterPhon"]
                       and phrase.get("phoneticReviewStatus") == row["afterReviewStatus"], "existing correction was altered")
            phrase["phon"] = row["afterPhon"]
            phrase["phoneticReviewStatus"] = row["afterReviewStatus"]
            phrase["phoneticCorrection"] = expected_annotation
            hits[key] += int(profile == "canonical")
            profiles[profile] += 1
            touched = True
        if touched:
            result[path] = compact(document)
            changed_paths.add(relative)
        if bank:
            transport_shas[pair] = sha(result[path].encode("utf-8"))
    ensure(set(hits) == set(corrections) and all(hits[key] == 1 for key in corrections), "missing or duplicate canonical correction target")
    ensure(set(transport_shas) == set(PAIR_IDS), "missing transport bank output")
    manifest_path = root / PREFIX / "manifest.json"
    ensure(manifest_path in result, "missing manifest output")
    manifest = json.loads(result[manifest_path])
    declaration = {"registryPath": REGISTRY_PATH, "registrySha256": registry_sha,
                   "correctionCount": len(corrections), "eventCount": registry["eventCount"],
                   "evidenceCommit": EVIDENCE_COMMIT}
    manifest["phoneticCorrections"] = declaration
    for pair in manifest["pairs"]:
        pair["repertoireSha256"] = transport_shas[pair["id"]]
    result[manifest_path] = json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"
    summary = {**declaration, "occurrenceCount": sum(profiles.values()),
        "occurrenceProfiles": dict(sorted(profiles.items())), "modifiedRuntimeFiles": sorted(changed_paths),
        "transportSha256ByPair": transport_shas,
        "sourceValidation": "Original source tuples verified before overlay; only phon, review status and correction annotation overridden.",
        "globalPhoneticApproval": False,
        "perPair": dict(sorted(Counter(pair for pair, ident in corrections).items())),
        "perRule": dict(sorted(Counter(row["rule"] for row in corrections.values()).items()))}
    return result, summary

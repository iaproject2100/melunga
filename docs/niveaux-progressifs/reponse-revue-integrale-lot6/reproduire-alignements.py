#!/usr/bin/env python3
"""Contre-vérification ciblée du lot 6, sans import du générateur.

Les preuves et le corpus avant sont lus dans Git aux commits figés. L'option
--runtime vérifie en plus les fichiers de travail, après génération du lot 6.
Ce contrôle n'étend aucune règle de transcription et n'évalue pas une voix.
"""
import argparse
import collections
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[3]
BASE = "161d0ebef38bb38ea9e26a836ca701b9d136f6d2"
EVIDENCE = "87357b16c7d77a1c94fdbd940dcb3f232758748d"
EVIDENCE_DIR = "docs/revue-integrale/lot6-fr-ko-L1-L10"
PREFIX = "melunga_deploy/content/niveaux-progressifs"
PINNED = {
    "registre-phonetique.json": "4c5861f15f7c77b4107c70ba3a7a2106065874ed42147f1bf428cc97e5230239",
    "registre-lectures.json": "d250e9fbd5b2d5d6b27eb9469c7563fac20d6cbc12f410b28cf172b9d24f89de",
    "conventions-a-decider.json": "74c40c97582c8bb55bdfe0d20af897aa946571f5f015709f60eef6f4c05b7d9f",
}


def git_bytes(commit, path):
    return subprocess.check_output(["git", "show", f"{commit}:{path}"], cwd=ROOT)


def proof(name):
    data = git_bytes(EVIDENCE, f"{EVIDENCE_DIR}/{name}")
    assert hashlib.sha256(data).hexdigest() == PINNED[name], name
    return json.loads(data)


def positions(node, path, location=()):
    if isinstance(node, dict):
        if all(key in node for key in ("id", "study", "native", "phon", "source")):
            yield path, location, node
        for key, value in node.items():
            if isinstance(value, (dict, list)):
                yield from positions(value, path, location + (key,))
    elif isinstance(node, list):
        for index, value in enumerate(node):
            if isinstance(value, (dict, list)):
                yield from positions(value, path, location + (index,))


def index_runtime(use_disk=False):
    result = collections.defaultdict(list)
    paths = subprocess.check_output(
        ["git", "ls-tree", "-r", "--name-only", BASE, "--", PREFIX], cwd=ROOT,
        text=True,
    ).splitlines()
    paths = [path for path in paths if path.endswith(".json") and
             ("/repertoires/" in path or Path(path).name.startswith("L"))]
    assert len(paths) == 77
    for path in paths:
        data = (ROOT / path).read_bytes() if use_disk else git_bytes(BASE, path)
        for occurrence in positions(json.loads(data), path):
            result[occurrence[2]["id"]].append(occurrence)
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--runtime", action="store_true")
    args = parser.parse_args()
    phon = proof("registre-phonetique.json")
    readings = proof("registre-lectures.json")
    conventions = proof("conventions-a-decider.json")
    before = index_runtime()
    events = phon["events"]
    reading_events = {event["id"]: event for event in readings["events"]}
    assert len(events) == len({event["id"] for event in events}) == 18
    assert len(reading_events) == 5
    assert set(reading_events).issubset({event["id"] for event in events})
    assert collections.Counter(rule for event in events for rule in event["rules"]) == {"R": 12, "S": 6}
    actual = index_runtime(True) if args.runtime else None
    records = []
    for event in events:
        occurrences = before[event["id"]]
        expected = event["occurrence"]
        assert len(occurrences) == 1 + event["transportCopies"]
        for path, location, phrase in occurrences:
            assert {key: phrase.get(key) for key in expected["expectedBefore"]} == expected["expectedBefore"], event["id"]
            assert phrase["phon"] == event["beforePhon"]
            assert bool(phrase.get("phoneticCorrection")) == event["priorCorrection"]
        assert any(path == expected["path"] and list(location) == expected["location"]
                   for path, location, _ in occurrences)
        reading = reading_events.get(event["id"])
        if reading:
            assert reading["linkedPhonEvent"] is True
            assert reading["study"] == event["study"]
            assert reading["beforeReading"] == event["reading"]
            assert reading["occurrence"] == {key: expected[key] for key in ("path", "location")}
            assert all(phrase["reading"] == reading["beforeReading"] for _, _, phrase in occurrences)
        if actual is not None:
            now = actual[event["id"]]
            assert [(path, loc) for path, loc, _ in now] == [(path, loc) for path, loc, _ in occurrences]
            for (_, _, old), (_, _, new) in zip(occurrences, now):
                assert new["phon"] == event["afterPhon"]
                assert new.get("reading") == (reading["afterReading"] if reading else old.get("reading"))
                assert new["source"] == old["source"]
                assert new.get("phoneticCorrection") == old.get("phoneticCorrection")
                assert "lot6FieldCorrection" in new
        record = {
            "id": event["id"], "study": event["study"], "beforePhon": event["beforePhon"],
            "afterPhon": event["afterPhon"], "beforeReading": event["reading"],
            "afterReading": reading["afterReading"] if reading else event["reading"],
            "readingChanged": bool(reading), "priorCorrectionPreserved": event["priorCorrection"],
            "occurrences": [{"path": path, "location": list(location)} for path, location, _ in occurrences],
        }
        records.append(record)
    convention_rows = [(group, row) for group, rows in conventions["groups"].items() for row in rows]
    assert len(convention_rows) == 260
    assert not {row["id"] for _, row in convention_rows}.intersection(event["id"] for event in events)
    for group, row in convention_rows:
        assert row["stage"] == "snapshot-161d0eb"
        occurrences = before[row["id"]]
        assert occurrences, row["id"]
        assert all(phrase[row["field"]] == row["before"] and phrase["study"] == row["study"]
                   for _, _, phrase in occurrences), row["id"]
        if actual is not None:
            assert all(phrase[row["field"]] == row["before"] for _, _, phrase in actual[row["id"]]), row["id"]
    summary = {
        "schemaVersion": 1, "baseSnapshotCommit": BASE, "evidenceCommit": EVIDENCE,
        "scope": "18 aides et 5 lectures ciblées ; classification des conventions ; aucune écoute native",
        "evidenceSha256": PINNED, "runtimeChecked": args.runtime,
        "beforeMismatches": 0, "afterMismatches": 0 if args.runtime else None,
        "phoneticEventCount": 18, "readingEventCount": 5,
        "phoneticRuleCounts": {"R": 12, "S": 6}, "targetObjects": 18,
        "canonicalObjects": 17, "receivedObjects": 1, "transportCopies": 0,
        "priorEventChains": [event["id"] for event in events if event["priorCorrection"]],
        "conventions": {
            "rows": 260, "distinctIds": len({row["id"] for _, row in convention_rows}),
            "bySourceGroup": {group: len(rows) for group, rows in conventions["groups"].items()},
            "byReaderCertainty": dict(collections.Counter(row["readerCertainty"] for _, row in convention_rows)),
            "byField": dict(collections.Counter(row["field"] for _, row in convention_rows)),
            "byStage": dict(collections.Counter(row["stage"] for _, row in convention_rows)),
            "overlapWithAppliedPhoneticEvents": 0, "applied": False,
        },
        "events": records,
        "limitations": [
            "Les décisions phonologiques générales restent à Kartech ; aucune convention n'est adoptée ici.",
            "Les aides après sont des chaînes entières figées, pas les résultats d'un remplacement générique.",
            "La contrelecture est ciblée ; elle ne répète pas la lecture individuelle des 4 770 positions de Claude.",
            "Ni voix native, ni sortie audio réelle, ni navigateur hébergé ne sont évalués par ce script.",
        ],
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

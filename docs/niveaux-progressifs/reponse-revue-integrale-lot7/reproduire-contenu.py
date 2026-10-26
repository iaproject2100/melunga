#!/usr/bin/env python3
"""Reproduce the selected lot-7 content review without importing the generator."""
import argparse
import copy
import hashlib
import json
import subprocess
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[3]
BASE = "d56fe23b4bafd63bbd2d4aefb67896dbc12374a2"
COMMIT = "dec4e90a01ca40dca2394ac43eb37a4771b011b1"
EVIDENCE = "docs/revue-integrale/lot7-fr-en-L1-L10/lot-contenu-gloses.json"
PHONETIC_EVIDENCE = "docs/revue-integrale/lot7-fr-en-L1-L10/registre-phonetique.json"
EVIDENCE_SHA = "7492a7da2e909fd83040be2f1f146c5b87b5641ff5b02660a076fe87387af87f"
PREFIX = "melunga_deploy/content/niveaux-progressifs/"


def git_bytes(commit, path):
    return subprocess.check_output(["git", "show", commit + ":" + path], cwd=ROOT)


def walk(value, location=()):
    if isinstance(value, dict):
        if all(k in value for k in ("id", "study", "native", "phon", "source")):
            yield location, value
        for key, child in value.items():
            if isinstance(child, (dict, list)):
                yield from walk(child, location + (key,))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            if isinstance(child, (dict, list)):
                yield from walk(child, location + (index,))


def at(document, location):
    for part in location:
        document = document[part]
    return document


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--runtime", action="store_true")
    args = parser.parse_args()
    raw = git_bytes(COMMIT, EVIDENCE)
    assert hashlib.sha256(raw).hexdigest() == EVIDENCE_SHA
    source = json.loads(raw)
    assert source["reference"] == BASE
    certain = [row for row in source["items"] if row["certainty"] == "certain"]
    uncertain = [row for row in source["items"] if row["certainty"] != "certain"]
    bundles = source["linkedBundles"]
    assert len(certain) == source["certainCount"] == 11
    assert len(uncertain) == 95 and len(bundles) == 5
    rows = certain + bundles
    ids = {row["id"] for row in rows}
    assert len(ids) == 16
    phonetic = json.loads(git_bytes(COMMIT, PHONETIC_EVIDENCE))
    assert len(phonetic["events"]) == 228
    assert not ids.intersection(row["id"] for row in phonetic["events"])
    files = subprocess.check_output(
        ["git", "ls-tree", "-r", "--name-only", BASE, "--", PREFIX],
        cwd=ROOT, text=True,
    ).splitlines()
    files = [path for path in files if path.endswith(".json") and not path.endswith("/manifest.json")]
    assert len(files) == 77
    found = defaultdict(list)
    for path in files:
        document = json.loads(git_bytes(BASE, path))
        for location, phrase in walk(document):
            if phrase["id"] in ids:
                found[phrase["id"]].append({"path": path, "location": list(location), "phrase": phrase})
    assert set(found) == ids and all(len(entries) == 1 for entries in found.values())
    records = []
    field_counts = Counter()
    for row in rows:
        occurrence = found[row["id"]][0]
        before = occurrence["phrase"]
        fields = {row["field"]: row["before"]} if "field" in row else row["before"]
        after = {row["field"]: row["after"]} if "field" in row else row["after"]
        assert before["editorialLevel"] == row["level"]
        if "field" in row:
            assert row["field"] == "native" and before["study"] == row["study"]
        else:
            assert row["applyTogether"] and row["certainty"] == "certain"
            assert set(fields) == set(after) and set(fields) in ({"study", "phon"}, {"study", "phon", "native"})
        assert all(before[field] == value for field, value in fields.items())
        assert all(fields[field] != value for field, value in after.items())
        field_counts.update(after.keys())
        current = None
        if args.runtime:
            current = at(json.loads((ROOT / occurrence["path"]).read_text()), occurrence["location"])
            assert all(current[field] == value for field, value in after.items())
            expected = copy.deepcopy(before)
            expected.update(after)
            declaration = current.get("lot7ContentCorrection")
            assert isinstance(declaration, dict) and declaration["id"] == row["id"]
            assert declaration["fields"] == sorted(fields) and declaration["beforeFields"] == fields
            expected["lot7ContentCorrection"] = declaration
            if "phon" in after:
                assert current["phoneticReviewStatus"] == "corrected-by-Claude-content-lot7"
                expected["phoneticReviewStatus"] = current["phoneticReviewStatus"]
            assert current == expected, (row["id"], "undeclared field/source/previous annotation changed")
        records.append({
            "id": row["id"], "decision": "accepted-as-a-bounded-event",
            "fields": sorted(after), "before": fields, "after": after,
            "nativeGuardUnchanged": before["native"] if "native" not in fields else None,
            "sourceOccurrence": occurrence, "runtimeChecked": args.runtime,
        })
    assert dict(field_counts) == {"native": 14, "study": 5, "phon": 5}
    punctuation = [row for row in certain if "？" in row["before"]]
    assert len(punctuation) == 8
    assert all(row["after"] == row["before"].replace("？", "?") for row in punctuation)
    report = {
        "id": "codex-lot7-selected-content-counter-review",
        "reviewedAt": datetime.now(timezone.utc).isoformat(),
        "humanDateParis": datetime.now(ZoneInfo("Europe/Paris")).strftime("%d/%m/%Y"),
        "sourceCommit": COMMIT, "beforeSnapshotCommit": BASE,
        "evidencePathAtSource": EVIDENCE, "evidenceSha256": EVIDENCE_SHA,
        "status": "selected-content-accepted",
        "publicationApproved": False, "globalNativeApproval": False,
        "runtimeChecked": args.runtime, "runtimeDocumentsScanned": 77,
        "certainNativeGlosses": 11, "punctuationOnlyGlosses": 8,
        "semanticGlosses": 3, "linkedBundles": 5,
        "selectedIds": 16, "canonicalObjects": 16,
        "transportCopies": 0, "receivedModels": 0,
        "approvedFieldCounts": dict(field_counts), "approvedFieldTotal": sum(field_counts.values()),
        "beforeMismatches": 0, "overlapWithPhoneticRegistry": [],
        "unappliedUncertainGlosses": 95,
        "linguisticQualifications": [
            "I make a quote is possible as a habitual statement. The retained replacement expresses the intended announced one-off action; no universal grammatical ban is inferred.",
            "Burn that bridge when we come to it can be deliberate humor. The unmarked teaching card is restored to the ordinary idiom cross that bridge.",
            "Not spicy, please is a natural request; retaining sans piment is contextually acceptable, without claiming spicy and chili have identical meanings in every context.",
            "Payment in installments is the retained idiomatic wording; no general ban on the noun phrase installment payment is inferred.",
        ],
        "limitations": [
            "Targeted individual counter-reading of the 16 selected content records, not a second human reading of all4740positions.",
            "No real audio or native-speaker certification.",
            "The30conventions,689placement/duplicate proposals and95uncertain glosses are not applied.",
        ],
        "corrections": records,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Reproduce the selected lot-8 content counter-review without importing its producer."""
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
BASE = "224e45948ac3739066f34178375b2e4437197e90"
COMMIT = "e12c600f97a6339a0566cdaf879aa0d449f96284"
EVIDENCE = "docs/revue-integrale/lot8-fr-es-L1-L10/lot-contenu-gloses.json"
PHONETIC_EVIDENCE = "docs/revue-integrale/lot8-fr-es-L1-L10/registre-phonetique.json"
EVIDENCE_SHA = "4c078120ce79094af6d968c6c3ac590cb01958eb3f9dfe9e5152d4e35c3ae821"
REGISTRY = "docs/niveaux-progressifs/corrections-contenu/lot8/revue-contenu-lot8.json"
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
    assert len(certain) == source["certainCount"] == 20
    assert Counter(row["field"] for row in certain) == {"native": 18, "study": 2}
    assert len(uncertain) == 119 and len(bundles) == 3
    rows = certain + bundles
    ids = {row["id"] for row in rows}
    assert len(ids) == 23
    phonetic = json.loads(git_bytes(COMMIT, PHONETIC_EVIDENCE))
    assert len(phonetic["events"]) == 63
    assert not ids.intersection(row["id"] for row in phonetic["events"])
    files = subprocess.check_output(
        ["git", "ls-tree", "-r", "--name-only", BASE, "--", PREFIX],
        cwd=ROOT, text=True,
    ).splitlines()
    files = [path for path in files if path.endswith(".json") and not path.endswith("/manifest.json")]
    assert len(files) == 77
    found, current_found = defaultdict(list), defaultdict(list)
    runtime_documents = {}
    for path in files:
        document = json.loads(git_bytes(BASE, path))
        for location, phrase in walk(document):
            if phrase["id"] in ids:
                profile = "received-model" if "receivedModels" in location else "transport-phrase" if "/repertoires/" in path else "canonical"
                found[phrase["id"]].append({"path": path, "location": list(location), "profile": profile, "phrase": phrase})
        if args.runtime:
            runtime_documents[path] = json.loads((ROOT / path).read_text())
            for location, phrase in walk(runtime_documents[path]):
                if phrase["id"] in ids:
                    current_found[phrase["id"]].append((path, list(location)))
    assert set(found) == ids
    profiles = Counter(o["profile"] for entries in found.values() for o in entries)
    assert profiles == {"canonical": 23, "transport-phrase": 1}
    copied = "situation-support-conversation:fr-es:piste-douleur-simple-support-02"
    assert {identifier for identifier, entries in found.items() if len(entries) > 1} == {copied}
    assert len(found[copied]) == 2
    if args.runtime:
        assert set(current_found) == ids
        assert all(sorted(current_found[i], key=str) == sorted([(o["path"], o["location"]) for o in found[i]], key=str) for i in ids)
        registry_sha = hashlib.sha256((ROOT / REGISTRY).read_bytes()).hexdigest()
    else:
        registry_sha = None
    records = []
    field_counts, runtime_fields = Counter(), Counter()
    for row in rows:
        fields = {row["field"]: row["before"]} if "field" in row else row["before"]
        after = {row["field"]: row["after"]} if "field" in row else row["after"]
        if "field" in row:
            assert row["field"] in {"native", "study"}
        else:
            assert row["applyTogether"] and row["certainty"] == "certain"
            assert set(fields) == set(after) and set(fields) in ({"study", "phon"}, {"study", "phon", "native"})
        assert all(fields[field] != value for field, value in after.items())
        field_counts.update(after.keys())
        occurrences = []
        for occurrence in found[row["id"]]:
            before = occurrence["phrase"]
            assert before["editorialLevel"] == row["level"]
            if "field" in row:
                assert before["study"] == row["study"]
            assert all(before[field] == value for field, value in fields.items())
            assert not any(key.endswith("Correction") for key in before), "unexpected prior correction annotation"
            runtime_fields.update(after.keys())
            if args.runtime:
                current = at(runtime_documents[occurrence["path"]], occurrence["location"])
                assert all(current[field] == value for field, value in after.items())
                declaration = current.get("lot8ContentCorrection")
                assert isinstance(declaration, dict) and declaration["id"] == row["id"]
                assert set(declaration) == {"id", "registryPath", "registrySha256", "baseSnapshotCommit", "fields", "beforeFields", "originalPhoneticReviewStatusPresent", "originalPhoneticReviewStatus", "evidenceCommits"}
                assert declaration["fields"] == sorted(fields) and declaration["beforeFields"] == fields
                assert declaration["registryPath"] == REGISTRY and declaration["registrySha256"] == registry_sha
                assert declaration["baseSnapshotCommit"] == BASE and declaration["evidenceCommits"] == [COMMIT]
                assert declaration["originalPhoneticReviewStatusPresent"] is ("phoneticReviewStatus" in before)
                assert declaration["originalPhoneticReviewStatus"] == before.get("phoneticReviewStatus")
                expected = copy.deepcopy(before)
                expected.update(after)
                expected["lot8ContentCorrection"] = declaration
                if "phon" in after:
                    assert current["phoneticReviewStatus"] == "corrected-by-Claude-content-lot8"
                    expected["phoneticReviewStatus"] = current["phoneticReviewStatus"]
                assert current == expected, (row["id"], "undeclared field/source/status/annotation changed")
            occurrences.append(occurrence)
        records.append({
            "id": row["id"], "decision": "accepted-as-a-bounded-event",
            "fields": sorted(after), "before": fields, "after": after,
            "nativeGuardsUnchanged": [o["phrase"]["native"] for o in found[row["id"]]] if "native" not in fields else [],
            "phoneticAndStatusGuardForStudyOnly": list(fields) == ["study"],
            "sourceOccurrences": occurrences, "runtimeChecked": args.runtime,
        })
    assert dict(field_counts) == {"native": 19, "study": 5, "phon": 3}
    assert dict(runtime_fields) == {"native": 20, "study": 5, "phon": 3}
    punctuation = [row for row in certain if row["field"] == "study"]
    assert {row["id"] for row in punctuation} == {"catalogue:es:661", "catalogue:es:875"}
    assert all(row["after"] == "¡" + row["before"][:-1] + "!" for row in punctuation)
    report = {
        "id": "codex-lot8-selected-content-counter-review",
        "reviewedAt": datetime.now(timezone.utc).isoformat(),
        "humanDateParis": datetime.now(ZoneInfo("Europe/Paris")).strftime("%d/%m/%Y"),
        "sourceCommit": COMMIT, "beforeSnapshotCommit": BASE,
        "evidencePathAtSource": EVIDENCE, "evidenceSha256": EVIDENCE_SHA,
        "status": "selected-content-accepted",
        "publicationApproved": False, "globalNativeApproval": False,
        "runtimeChecked": args.runtime, "runtimeDocumentsScanned": 77,
        "certainNativeGlosses": 18, "punctuationOnlyStudies": 2,
        "linkedBundles": 3, "selectedIds": 23, "canonicalObjects": 23,
        "transportCopies": 1, "transportCopyId": copied, "receivedModels": 0,
        "approvedFieldCounts": dict(field_counts), "approvedFieldTotal": sum(field_counts.values()),
        "runtimeFieldCounts": dict(runtime_fields), "runtimeFieldTotal": sum(runtime_fields.values()),
        "beforeMismatches": 0, "overlapWithPhoneticRegistry": [],
        "priorCorrectionAnnotationsOnSelectedObjects": [],
        "unappliedUncertainContentItems": 119,
        "linguisticQualifications": [
            "No hay que can express lack of necessity or a recommendation/prohibition depending on context; the retained gloss chooses lack of necessity, not a universal prohibition on the former translation.",
            "Flipas is present morphology, but tu vas halluciner can be a natural colloquial pragmatic equivalent. Tu délires is a defensible selected reading, not proof that any future French paraphrase is wrong.",
            "Muy is rendered tres rather than trop for these unmarked lexical cards; context can license an excessive-degree interpretation elsewhere.",
            "French on can render a first-person Spanish question idiomatically in context; the retained je makes the person explicit without declaring every impersonal rendering ungrammatical.",
            "The two exclamations change orthography only. Their complete aids, native glosses, status and all other attributes stay guarded.",
            "Poner is not restricted to clothing; me lo pone is the selected client-to-server request in this take-away context.",
            "Video may be mass-like elsewhere; un video is chosen here for the countable exemplar already expressed in the native gloss.",
            "The three complete replacement aids are copied whole; no segments are generated or joined by this checker.",
        ],
        "limitations": [
            "Targeted individual counter-reading of 23 selected content records, not a second reading of all 4,995 positions.",
            "No real audio or native-speaker certification.",
            "310 placement proposals, 151 conventions (including 112 jota) and 119 uncertain content items are not applied.",
        ],
        "corrections": records,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

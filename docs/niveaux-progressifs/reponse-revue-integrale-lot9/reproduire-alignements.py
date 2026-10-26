#!/usr/bin/env python3
"""Check literal lot-9 aids and EN71 against Git; no producer import.

--runtime constructs an independent expected tree from the 77 frozen runtime
documents and the separate literal content evidence, then compares whole trees.
No voice, real audio, acquisition or global linguistic approval is measured.
"""
import argparse
import collections
import copy
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[3]
BASE = "40d4c0b264b364fe31d4fd1bc9acae03dc130e01"
EVIDENCE = "5d450cc79f32d180f9331c5d06387fe36e8d94a6"
ERRATUM_EVIDENCE = "76602a1b0be0a3539171090733d0a17b079644c6"
SOURCE_DIR = "docs/revue-integrale/lot9-fr-it-L1-L10"
PREFIX = "melunga_deploy/content/niveaux-progressifs"
PINNED = {
    "registre-phonetique.json": "661131a84a421f29d017872879713ccc3ddcbd8a5f4f9b441a312dcedaaa51e9",
    "lot-contenu-gloses.json": "cf20a6f4595f4e8c3627aac8bd4956ef5724bd9f220b2676288a88878f4636a0",
    "conventions-a-decider.json": "03dc5421ff176eab2005c2d905d1cf8f4190c62af6979a70e1784e86262e7eb1",
    "errata-1.json": "480f4c9348a393d29f1c3c3d6d0ffe5e16b01e802d94403840d90c15b52f7535",
}
REGISTRIES = {
    "phonetic": {
        "path": "docs/niveaux-progressifs/corrections-phonetiques/lot9/revue-claude-lot9.json",
        "sha256": "313973bdf60a2bf629b4410ae7895e1e0bb4604f08bde2c5037058fa332e5665",
        "annotation": "lot9PhoneticCorrection", "evidence": EVIDENCE,
    },
    "content": {
        "path": "docs/niveaux-progressifs/corrections-contenu/lot9/revue-contenu-lot9.json",
        "sha256": "db40f6ae9a0b88595b0c4f5591b7ca1263b5ff1facfb9d6c1c723e6ed204ad74",
        "annotation": "lot9ContentCorrection", "evidence": EVIDENCE,
    },
    "erratum": {
        "path": "docs/niveaux-progressifs/corrections-phonetiques/lot8-errata-1/revue-claude-lot8-errata-1.json",
        "sha256": "cbbfa4e5f1ca6afd83e53eb8f12045d3cd0d2d7e879f1053efa69bf4e9e1361e",
        "annotation": "lot8Erratum1Correction", "evidence": ERRATUM_EVIDENCE,
    },
}
PRIOR_ANNOTATIONS = (
    "phoneticCorrection", "reviewedFieldCorrection", "lot4PhoneticCorrection",
    "reviewedContentCorrection", "lot5FieldCorrection", "lot5ContentCorrection",
    "lot6FieldCorrection", "lot6ContentCorrection", "lot7PhoneticCorrection",
    "lot7ContentCorrection", "lot8PhoneticCorrection", "lot8ContentCorrection",
)
RULE_COUNTS = {"N": 63, "S": 3, "T": 3, "A": 1}


def git_bytes(commit, path):
    return subprocess.check_output(["git", "show", f"{commit}:{path}"], cwd=ROOT)


def proof(name):
    commit = ERRATUM_EVIDENCE if name == "errata-1.json" else EVIDENCE
    path = "docs/revue-integrale/lot8-fr-es-L1-L10/errata-1.json" if name == "errata-1.json" else f"{SOURCE_DIR}/{name}"
    raw = git_bytes(commit, path)
    assert hashlib.sha256(raw).hexdigest() == PINNED[name], name
    return json.loads(raw)


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


def profile(path, location):
    if "/repertoires/" not in path:
        return "canonical"
    return "received-model" if location[0] == "receivedModels" else "transport-phrase"


def index_documents(documents):
    result = collections.defaultdict(list)
    for path, document in documents.items():
        for occurrence in positions(document, path):
            result[occurrence[2]["id"]].append(occurrence)
    return result


def literal_event(phrase, kind, before_fields, after_fields, rules=()):
    config = REGISTRIES[kind]
    assert {field: phrase[field] for field in before_fields} == before_fields, phrase["id"]
    assert all(before_fields[field] != after_fields[field] for field in before_fields)
    assert config["annotation"] not in phrase
    phrase[config["annotation"]] = {
        "id": phrase["id"], "registryPath": config["path"],
        "registrySha256": config["sha256"], "baseSnapshotCommit": BASE,
        "fields": sorted(before_fields),
        "beforeFields": {field: before_fields[field] for field in sorted(before_fields)},
        "originalPhoneticReviewStatusPresent": "phoneticReviewStatus" in phrase,
        "originalPhoneticReviewStatus": phrase.get("phoneticReviewStatus"),
        "evidenceCommits": [config["evidence"]],
    }
    phrase.update(after_fields)
    if "phon" in before_fields:
        status = {
            "erratum": "corrected-by-Claude-lot8-errata-1-" + "+".join(rules),
            "phonetic": "corrected-by-Claude-lot9-" + "+".join(rules),
            "content": "corrected-by-Claude-content-lot9",
        }[kind]
        phrase["phoneticReviewStatus"] = status


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--runtime", action="store_true")
    args = parser.parse_args()
    phon, content, conventions, erratum = (proof(name) for name in PINNED)
    assert phon["baseSnapshotCommit"] == content["reference"] == conventions["reference"] == BASE
    events = phon["events"]
    assert len(events) == len({row["id"] for row in events}) == phon["eventCount"] == 70
    assert collections.Counter(rule for row in events for rule in row["rules"]) == RULE_COUNTS
    assert sum(row["transportCopies"] for row in events) == 4
    content_items = [row for row in content["items"] if row["certainty"] == "certain"]
    assert len(content_items) == content["certainCount"] == 34
    assert all(row["field"] == "native" for row in content_items)
    assert len(content["linkedBundles"]) == 3
    content_ids = {row["id"] for row in content_items + content["linkedBundles"]}
    assert {row["id"] for row in events}.intersection(content_ids) == {"catalogue:it:1736"}

    paths = subprocess.check_output(["git", "ls-tree", "-r", "--name-only", BASE, "--", PREFIX], cwd=ROOT, text=True).splitlines()
    paths = [path for path in paths if path.endswith(".json") and ("/repertoires/" in path or Path(path).name.startswith("L"))]
    assert len(paths) == 77
    before_documents = {path: json.loads(git_bytes(BASE, path)) for path in paths}
    before = index_documents(before_documents)
    expected_documents = copy.deepcopy(before_documents)
    expected = index_documents(expected_documents)
    profiles = collections.Counter()
    records = []
    for event in events:
        occurrences = before[event["id"]]
        anchor = event["occurrence"]
        assert len(occurrences) == 1 + event["transportCopies"]
        assert any(path == anchor["path"] and list(loc) == anchor["location"] for path, loc, _ in occurrences)
        for path, loc, phrase in occurrences:
            assert {field: phrase.get(field) for field in anchor["expectedBefore"]} == anchor["expectedBefore"], event["id"]
            assert phrase["study"] == event["study"] and phrase["native"] == event["native"]
            assert phrase["phon"] == event["beforePhon"]
            assert "reading" not in phrase
            assert bool(any(field in phrase for field in PRIOR_ANNOTATIONS)) == event["priorCorrection"]
            profiles[profile(path, loc)] += 1
        for _, _, phrase in expected[event["id"]]:
            literal_event(phrase, "phonetic", {"phon": event["beforePhon"]}, {"phon": event["afterPhon"]}, event["rules"])
        records.append({
            "id": event["id"], "study": event["study"], "native": event["native"],
            "rules": event["rules"], "beforePhon": event["beforePhon"], "afterPhon": event["afterPhon"],
            "priorCorrection": event["priorCorrection"], "transportCopies": event["transportCopies"],
            "linguisticCounterReview": "selected-after-value-accepted-no-certain-false-fix-found",
            "occurrences": [{"path": path, "location": list(loc), "profile": profile(path, loc)} for path, loc, _ in occurrences],
        })
    assert profiles == {"canonical": 69, "transport-phrase": 4, "received-model": 1}

    # Separate content events are projected only to permit whole-tree comparison;
    # their linguistic counterreview is in contenu.md, not claimed here.
    content_profiles = collections.Counter()
    for row in content_items:
        assert before[row["id"]]
        for _, _, phrase in before[row["id"]]:
            assert phrase["study"] == row["study"] and phrase[row["field"]] == row["before"]
        for path, loc, phrase in expected[row["id"]]:
            literal_event(phrase, "content", {row["field"]: row["before"]}, {row["field"]: row["after"]})
            content_profiles[profile(path, loc)] += 1
    for row in content["linkedBundles"]:
        assert row["applyTogether"] is True and row["certainty"] == "certain"
        assert set(row["before"]) == set(row["after"]) == {"study", "native", "phon"}
        for path, loc, phrase in expected[row["id"]]:
            literal_event(phrase, "content", row["before"], row["after"])
            content_profiles[profile(path, loc)] += 1

    assert len(erratum["events"]) == 1
    correction = erratum["events"][0]
    assert correction["id"] == "catalogue:es:2205" and correction["rules"] == ["S"]
    assert len(before[correction["id"]]) == 1
    for _, _, phrase in expected[correction["id"]]:
        assert phrase["study"] == correction["study"]
        prior = copy.deepcopy(phrase["lot8PhoneticCorrection"])
        assert prior["beforeFields"] == {"phon": correction["beforePhon"]}
        literal_event(phrase, "erratum", {"phon": correction["deliveredAfterPhon"]}, {"phon": correction["afterPhon"]}, ["S"])
        assert phrase["lot8PhoneticCorrection"] == prior

    rows = [(group, row) for group, items in conventions["groups"].items() for row in items]
    assert len(rows) == len({row["id"] for _, row in rows}) == 30
    assert not {row["id"] for _, row in rows}.intersection({row["id"] for row in events} | content_ids)
    for _, row in rows:
        assert row["stage"] == "snapshot-40d4c0b"
        assert before[row["id"]]
        assert all(phrase["study"] == row["study"] and phrase[row["field"]] == row["before"] for _, _, phrase in before[row["id"]])
        assert all(new == old for (_, _, new), (_, _, old) in zip(expected[row["id"]], before[row["id"]]))

    if args.runtime:
        for config in REGISTRIES.values():
            assert hashlib.sha256((ROOT / config["path"]).read_bytes()).hexdigest() == config["sha256"]
        for path, expected_document in expected_documents.items():
            actual_document = json.loads((ROOT / path).read_bytes())
            assert actual_document == expected_document, "whole-tree difference: " + path

    print(json.dumps({
        "schemaVersion": 1, "baseSnapshotCommit": BASE, "evidenceCommit": EVIDENCE,
        "publicationApproved": False, "globalNativeApproval": False,
        "scope": "70 aides figées, erratum EN71 distinct et conventions ; aucune écoute native",
        "evidenceSha256": PINNED, "runtimeChecked": args.runtime,
        "runtimeDocumentsCompared": len(paths) if args.runtime else 0,
        "beforeMismatches": 0, "afterMismatches": 0 if args.runtime else None,
        "phoneticEventCount": 70, "readingEventCount": 0,
        "phoneticRuleCounts": RULE_COUNTS, "targetObjects": sum(profiles.values()),
        "profiles": dict(profiles), "priorEventChains": [],
        "contentProjectedSeparately": {"ids": len(content_ids), "profiles": dict(content_profiles),
            "phoneticOverlapNativeOnly": ["catalogue:it:1736"]},
        "conventions": {"rows": 30, "distinctIds": 30,
            "bySourceGroup": {group: len(items) for group, items in conventions["groups"].items()},
            "byReaderCertainty": dict(collections.Counter(row["readerCertainty"] or "not-specified" for _, row in rows)),
            "byField": dict(collections.Counter(row["field"] for _, row in rows)),
            "byStage": dict(collections.Counter(row["stage"] for _, row in rows)),
            "overlapWithAppliedEvents": 0, "applied": False,
            "sourceGroupsAreLabelsOnly": True},
        "events": records,
        "erratum": {**correction, "evidenceCommit": ERRATUM_EVIDENCE,
            "targetObjects": 1, "priorLot8AnnotationPreserved": True,
            "originalLot8RegistryPreserved": True},
        "linguisticCounterReview": {
            "selectedAfterValuesAccepted": 70, "certainFalseAfterValuesFound": 0,
            "notes": [
                "N se borne aux 63 événements : nn/mm évite la lecture nasale française ; il ne déclare pas des géminées italiennes nouvelles.",
                "SIM, team, Wang et les autres conventions ne sont pas normalisés ; le libellé d'un groupe ne prouve pas la présence de ces mots dans ses lignes.",
                "CE nomme C comme ci ; ASTM explicite a esse ti emme. Ces trois événements ne décident pas de tous les sigles.",
                "rivedere est accentué sur DE. Les T corrigent le i muet de sciocchezze, le d de commedie et la capitale de trovare.",
                "djinnss conserve une voyelle orale et un s final audible pour jeans ; c'est la chaîne sélectionnée, pas une règle générale des emprunts.",
                "EN71 : Claude a confirmé l'épellation séparée e + ene ; é É-né distingue les deux noms de lettre. L'ancien événement lot8 reste conservé, suivi d'un erratum entier.",
            ]},
        "limitations": [
            "Les 30 conventions restent non appliquées ; aucune normalisation globale n'est décidée.",
            "La lecture des 33 aides s intervocaliques par Claude n'ajoute pas 33 corrections : aucune erreur certaine en italien standard n'est annoncée.",
            "Cette contrelecture ciblée ne répète pas la lecture individuelle des 4 756 positions annoncée par Claude.",
            "Ni voix native, ni sortie audio réelle, ni navigateur hébergé ne sont évalués par ce script.",
        ],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

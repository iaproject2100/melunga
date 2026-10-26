#!/usr/bin/env python3
"""Contre-vérification ciblée du lot7, sans import du générateur.

Avant et preuves sont lus dans Git aux commits figés. --runtime vérifie aussi
les fichiers de travail après génération. Aucun son réel n'est évalué.
"""
import argparse
import collections
import copy
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[3]
BASE = "d56fe23b4bafd63bbd2d4aefb67896dbc12374a2"
EVIDENCE = "dec4e90a01ca40dca2394ac43eb37a4771b011b1"
EVIDENCE_DIR = "docs/revue-integrale/lot7-fr-en-L1-L10"
PREFIX = "melunga_deploy/content/niveaux-progressifs"
PINNED = {
    "registre-phonetique.json": "ad4c4aa3db44e56a2d4c493b5779a869362ab495d5359910582c79adbe662c46",
    "conventions-a-decider.json": "68daac6071e40c294d2ab21662632971d79d3d171603239d94a124cc9d030c23",
}
RULE_COUNTS = {"G": 145, "W": 22, "A": 21, "H": 21, "Z": 18, "T": 7}
ANNOTATION = "lot7PhoneticCorrection"
REGISTRY_PATH = "docs/niveaux-progressifs/corrections-phonetiques/lot7/revue-claude-lot7.json"
PRIOR_ANNOTATIONS = ("phoneticCorrection", "reviewedFieldCorrection", "lot4PhoneticCorrection", "reviewedContentCorrection", "lot5FieldCorrection", "lot5ContentCorrection", "lot6FieldCorrection", "lot6ContentCorrection")


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
    paths = subprocess.check_output(["git", "ls-tree", "-r", "--name-only", BASE, "--", PREFIX], cwd=ROOT, text=True).splitlines()
    paths = [path for path in paths if path.endswith(".json") and ("/repertoires/" in path or Path(path).name.startswith("L"))]
    assert len(paths) == 77
    for path in paths:
        data = (ROOT / path).read_bytes() if use_disk else git_bytes(BASE, path)
        for occurrence in positions(json.loads(data), path):
            result[occurrence[2]["id"]].append(occurrence)
    return result


def profile(path, location):
    if "/repertoires/" not in path:
        return "canonical"
    return "received-model" if location[0] == "receivedModels" else "transport-phrase"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--runtime", action="store_true")
    args = parser.parse_args()
    phon = proof("registre-phonetique.json")
    conventions = proof("conventions-a-decider.json")
    before = index_runtime()
    events = phon["events"]
    assert phon["baseSnapshotCommit"] == BASE
    assert len(events) == len({event["id"] for event in events}) == phon["eventCount"] == 228
    assert collections.Counter(rule for event in events for rule in event["rules"]) == RULE_COUNTS
    assert sum(event["transportCopies"] for event in events) == 10
    actual = index_runtime(True) if args.runtime else None
    registry_sha = hashlib.sha256((ROOT / REGISTRY_PATH).read_bytes()).hexdigest() if args.runtime else None
    records, profiles = [], collections.Counter()
    for event in events:
        occurrences = before[event["id"]]
        expected = event["occurrence"]
        assert event["beforePhon"] != event["afterPhon"]
        assert len(occurrences) == 1 + event["transportCopies"], event["id"]
        for path, location, phrase in occurrences:
            assert {key: phrase.get(key) for key in expected["expectedBefore"]} == expected["expectedBefore"], event["id"]
            assert phrase["study"] == event["study"] and phrase["native"] == event["native"]
            assert phrase["phon"] == event["beforePhon"]
            assert "reading" not in phrase, event["id"]
            assert bool(any(name in phrase for name in PRIOR_ANNOTATIONS)) == event["priorCorrection"], event["id"]
            profiles[profile(path, location)] += 1
        assert any(path == expected["path"] and list(location) == expected["location"] for path, location, _ in occurrences)
        if actual is not None:
            now = actual[event["id"]]
            assert [(path, loc) for path, loc, _ in now] == [(path, loc) for path, loc, _ in occurrences]
            for (_, _, old), (_, _, new) in zip(occurrences, now):
                assert new["phon"] == event["afterPhon"]
                assert "reading" not in new
                annotation = new[ANNOTATION]
                assert annotation["id"] == event["id"]
                assert annotation["fields"] == ["phon"]
                assert annotation["beforeFields"] == {"phon": event["beforePhon"]}
                assert annotation["registryPath"] == REGISTRY_PATH and annotation["registrySha256"] == registry_sha
                assert annotation["baseSnapshotCommit"] == BASE and annotation["evidenceCommits"] == [EVIDENCE]
                projected = copy.deepcopy(new)
                projected.pop(ANNOTATION)
                projected["phon"] = old["phon"]
                if "phoneticReviewStatus" in old:
                    projected["phoneticReviewStatus"] = old["phoneticReviewStatus"]
                else:
                    projected.pop("phoneticReviewStatus", None)
                assert projected == old, event["id"]
        records.append({
            "id": event["id"], "study": event["study"], "native": event["native"],
            "rules": event["rules"], "beforePhon": event["beforePhon"], "afterPhon": event["afterPhon"],
            "priorCorrection": event["priorCorrection"], "transportCopies": event["transportCopies"],
            "occurrences": [{"path": path, "location": list(location), "profile": profile(path, location)} for path, location, _ in occurrences],
        })
    assert profiles == {"canonical": 225, "transport-phrase": 10, "received-model": 3}, profiles
    rows = [(group, row) for group, items in conventions["groups"].items() for row in items]
    assert len(rows) == len({row["id"] for _, row in rows}) == 30
    assert not {row["id"] for _, row in rows}.intersection(event["id"] for event in events)
    for group, row in rows:
        assert row["stage"] == "snapshot-d56fe23"
        occurrences = before[row["id"]]
        assert occurrences
        assert all(phrase[row["field"]] == row["before"] and phrase["study"] == row["study"] for _, _, phrase in occurrences), row["id"]
        if actual is not None:
            assert all(phrase[row["field"]] == row["before"] for _, _, phrase in actual[row["id"]]), row["id"]
    print(json.dumps({
        "schemaVersion": 1, "baseSnapshotCommit": BASE, "evidenceCommit": EVIDENCE,
        "scope": "228 aides entières ciblées et classification des conventions ; aucune écoute native",
        "evidenceSha256": PINNED, "runtimeChecked": args.runtime,
        "beforeMismatches": 0, "afterMismatches": 0 if args.runtime else None,
        "phoneticEventCount": 228, "readingEventCount": 0, "phoneticRuleCounts": RULE_COUNTS,
        "ruleLabelAssignments": sum(RULE_COUNTS.values()), "targetObjects": sum(profiles.values()),
        "profiles": dict(profiles), "priorEventChains": [event["id"] for event in events if event["priorCorrection"]],
        "conventions": {"rows": 30, "distinctIds": 30,
            "bySourceGroup": {group: len(items) for group, items in conventions["groups"].items()},
            "byReaderCertainty": dict(collections.Counter(row["readerCertainty"] for _, row in rows)),
            "byField": dict(collections.Counter(row["field"] for _, row in rows)),
            "byStage": dict(collections.Counter(row["stage"] for _, row in rows)),
            "overlapWithAppliedPhoneticEvents": 0, "applied": False},
        "events": records,
        "linguisticCounterReview": {
            "selectedAfterValuesAccepted": 228,
            "certainFalseAfterValuesFound": 0,
            "notes": [
                "G est un événement figé du g dur ciblé, pas une règle à étendre ; les quatre cas singer, bringing, argue et regularly sont contrôlés séparément.",
                "A est ici le nom local de la correction d'accent anglais, sans lien avec l'ancienne règle A espagnole retirée.",
                "accept admet aussi une initiale réduite /ə/ ; eu-SÈPT n'est donc pas universellement faux. ak-SÈPT est retenu comme variante ciblée, sans généralisation.",
                "Les accents de transfer/discount et la réalisation de restaurant peuvent varier ; les après retenus sont défendables pour les sens et la variété choisis.",
                "ÔN-li reste la valeur entière livrée ; ce choix local ne tranche pas les conventions générales de nasalisation ou de o devant n.",
                "L'absence de g séparé dans singer/bringing ne constitue pas une certification de la façon dont chaque francophone lira NG.",
            ]},
        "limitations": [
            "Les 30 conventions restent à décider ; aucune normalisation n'est adoptée.",
            "Les aides après sont des chaînes entières figées, jamais des résultats d'une substitution générale.",
            "Cette contrelecture ciblée ne répète pas la lecture individuelle des 4 740 positions annoncée par Claude.",
            "Ni voix native, ni sortie audio réelle, ni navigateur hébergé ne sont évalués par ce script.",
        ],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

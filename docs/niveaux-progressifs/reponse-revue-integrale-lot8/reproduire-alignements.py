#!/usr/bin/env python3
"""Contre-vérification ciblée du lot8, sans import du générateur.

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
BASE = "224e45948ac3739066f34178375b2e4437197e90"
EVIDENCE = "e12c600f97a6339a0566cdaf879aa0d449f96284"
EVIDENCE_DIR = "docs/revue-integrale/lot8-fr-es-L1-L10"
PREFIX = "melunga_deploy/content/niveaux-progressifs"
PINNED = {
    "lot-contenu-gloses.json": "4c078120ce79094af6d968c6c3ac590cb01958eb3f9dfe9e5152d4e35c3ae821",
    "registre-phonetique.json": "3bdbb4a152ab80fea877bec8f1a6f70e88ea69c2f3bdb88f781ea9bd77992da6",
    "conventions-a-decider.json": "6ff7f0a74371e824b1581967625668f1a89fbfa73c4a1caa471053d9140258d9",
}
RULE_COUNTS = {"S": 31, "G": 11, "R": 10, "A": 9, "T": 2}
ANNOTATION = "lot8PhoneticCorrection"
REGISTRY_PATH = "docs/niveaux-progressifs/corrections-phonetiques/lot8/revue-claude-lot8.json"
PRIOR_ANNOTATIONS = ("phoneticCorrection", "reviewedFieldCorrection", "lot4PhoneticCorrection", "reviewedContentCorrection", "lot5FieldCorrection", "lot5ContentCorrection", "lot6FieldCorrection", "lot6ContentCorrection", "lot7PhoneticCorrection", "lot7ContentCorrection")


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
    content = proof("lot-contenu-gloses.json")
    certain_content_fields = {row["id"]: {row["field"]} for row in content["items"] if row["certainty"] == "certain"}
    certain_content_fields.update({row["id"]: set(row["before"]) for row in content["linkedBundles"]})
    before = index_runtime()
    events = phon["events"]
    assert phon["baseSnapshotCommit"] == BASE
    assert len(events) == len({event["id"] for event in events}) == phon["eventCount"] == 63
    assert collections.Counter(rule for event in events for rule in event["rules"]) == RULE_COUNTS
    assert not set(certain_content_fields).intersection(event["id"] for event in events)
    assert sum(event["transportCopies"] for event in events) == 1
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
    assert profiles == {"canonical": 62, "transport-phrase": 1, "received-model": 1}, profiles
    rows = [(group, row) for group, items in conventions["groups"].items() for row in items]
    assert len(rows) == len({row["id"] for _, row in rows}) == 151
    assert not {row["id"] for _, row in rows}.intersection(event["id"] for event in events)
    convention_content_overlap = []
    for group, row in rows:
        if row["id"] in certain_content_fields:
            assert certain_content_fields[row["id"]] == {"native"}
            assert row["field"] not in certain_content_fields[row["id"]]
            convention_content_overlap.append({"id": row["id"], "contentFields": ["native"], "preservedConventionField": row["field"]})
        assert row["stage"] == "snapshot-224e459"
        occurrences = before[row["id"]]
        assert occurrences
        assert all(phrase[row["field"]] == row["before"] and phrase["study"] == row["study"] for _, _, phrase in occurrences), row["id"]
        if actual is not None:
            assert all(phrase[row["field"]] == row["before"] for _, _, phrase in actual[row["id"]]), row["id"]
    print(json.dumps({
        "schemaVersion": 1, "baseSnapshotCommit": BASE, "evidenceCommit": EVIDENCE,
        "publicationApproved": False, "globalNativeApproval": False,
        "scope": "63 aides entières ciblées et classification des conventions ; aucune écoute native",
        "evidenceSha256": PINNED, "runtimeChecked": args.runtime,
        "beforeMismatches": 0, "afterMismatches": 0 if args.runtime else None,
        "phoneticEventCount": 63, "readingEventCount": 0, "phoneticRuleCounts": RULE_COUNTS,
        "ruleLabelAssignments": sum(RULE_COUNTS.values()), "targetObjects": sum(profiles.values()),
        "profiles": dict(profiles), "priorEventChains": [event["id"] for event in events if event["priorCorrection"]],
        "conventions": {"rows": 151, "distinctIds": 151,
            "bySourceGroup": {group: len(items) for group, items in conventions["groups"].items()},
            "byReaderCertainty": dict(collections.Counter(row["readerCertainty"] or "not-specified" for _, row in rows)),
            "byField": dict(collections.Counter(row["field"] for _, row in rows)),
            "byStage": dict(collections.Counter(row["stage"] for _, row in rows)),
            "overlapWithAppliedPhoneticEvents": 0, "contentNativeOnlyOverlaps": convention_content_overlap, "applied": False},
        "events": records,
        "linguisticCounterReview": {
            "selectedAfterValuesAccepted": 63,
            "certainFalseAfterValuesFound": 0,
            "notes": [
                "G corrige onze événements gué/guí ciblés ; aucune substitution générale n'est appliquée.",
                "R se limite aux dix aides retenues pour un contraste de mot. Cela ne décide pas de tous les rr ou r initiaux.",
                "A est ici l'accent/découpage espagnol ; cette étiquette n'a aucun lien avec l'ancienne règle A espagnole de doublement du s retirée.",
                "EN71 : e + ene est l'épellation sous-jacente. é-né peut rendre la coalescence naturelle /e e.ne/ en [e.ne] ; la chaîne ne distingue alors pas E N de N seul. L'après figé est retenu comme réalisation possible, pas comme preuve d'une transcription séparée des deux noms de lettre.",
                "Les accents des emprunts parking/tracking/packing/dropshipping dépendent des usages ; les après sont retenus comme variantes ciblées, sans décision générale de variété.",
                "Les noms de lettre explicitent les sigles ciblés ; slash, rythme et coalescence restent de l'oral, non une nouvelle convention universelle d'épellation.",
                "Les jota r/kh/rh et les 28 autres rr restent dans les conventions non appliquées.",
            ]},
        "limitations": [
            "Les 151 conventions restent à décider ; aucune normalisation n'est adoptée.",
            "Les aides après sont des chaînes entières figées, jamais des résultats d'une substitution générale.",
            "Cette contrelecture ciblée ne répète pas la lecture individuelle des 4 995 positions annoncée par Claude.",
            "Ni voix native, ni sortie audio réelle, ni navigateur hébergé ne sont évalués par ce script.",
        ],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

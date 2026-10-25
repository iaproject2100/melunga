"""Read-only audit of Claude lot5 coverage and lot4 documentation amendments.

No generator is imported. All before values come from pinned Git objects, so
this script remains reproducible after the current runtime is regenerated.
It verifies traceability, not native pronunciation or pedagogical acquisition.
"""
from __future__ import annotations
from collections import Counter, defaultdict
from functools import lru_cache
import hashlib
import json
from pathlib import Path
import re
import subprocess
import unicodedata

ROOT = Path(__file__).resolve().parents[3]
BASE = "f22202cc4622c26794a6ada0c88d1741b82c1967"
LOT5 = "62daa86414d937b0554831a4c032e05b3046bb61"
LOT4 = "7631c0fe64170f952e086487462e94c87bfb13e1"
ERRATA = "8bd6297ef5da93d74530f7252184d8717b0f3a90"
LOT4_BASE = "606592ccf11886810a6bb9fbabc56728cf5055c9"
P5 = "docs/revue-integrale/lot5-fr-ja-L1-L10/"
P4 = "docs/revue-integrale/lot4-zh-fr-L1-L10/"
DATA = "melunga_deploy/content/niveaux-progressifs/"
PINS = {
    "registre-phonetique.json": "76a8bed5f6218fc74aa0fb75f7f19b2bcd9518aa1440780877d5dd03b6789158",
    "registre-lectures.json": "2e863193df9228431b04011f343acc38af3bb4266921777291f97077100195c5",
    "lot-contenu-gloses.json": "2fd7c7b35af687260013d563b8f7bd4fd6e14bdce0e4d7025fc1dd4f847a5cd0",
    "propositions-niveaux-themes.json": "fcf4e2bdbaad225bc253fc0d62128cc014fd03af8cdcebe11e91ec1102f4b3e2",
    "conventions-a-decider.json": "066538944c8cd70f73ea6ac317895a986d0ef2f867149563dff740c3c27db608",
    "couverture.json": "a105f352b15cc1f2b5ee1adf0e182de66795c193008e7f943b8d37b835e20e5d",
}
STATUS = {"verifie", "proposition", "incertain", "glose-a-corriger", "corrige"}


def require(condition, message):
    if not condition:
        raise AssertionError(message)


@lru_cache(None)
def git_bytes(commit, path):
    return subprocess.check_output(["git", "show", commit + ":" + path], cwd=ROOT)


def git_json(commit, path):
    return json.loads(git_bytes(commit, path))


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def address(value, location):
    for token in location:
        value = value[token]
    return value


def snapshot(commit, pair):
    primary, received, positions, themes, paths = {}, {}, [], {}, {}
    for level in range(1, 11):
        path = DATA + pair + f"/L{level}.json"
        cell = git_json(commit, path)
        paths[path] = cell
        themes[level] = {theme["id"]: theme for theme in cell["themes"] + cell["heldThemes"]}
        for collection in ("themes", "heldThemes"):
            for t_index, theme in enumerate(cell[collection]):
                for p_index, phrase in enumerate(theme["phrases"]):
                    require(phrase["id"] not in primary, "Duplicate canonical identity")
                    row = {"phrase": phrase, "role": "canonical", "level": level,
                           "theme": theme["id"], "themeTitle": theme["title"],
                           "path": path, "location": [collection, t_index, "phrases", p_index]}
                    primary[phrase["id"]] = row
                    positions.append(row)
        for index, phrase in enumerate(cell["reserve"]):
            require(phrase["id"] not in primary, "Duplicate reserved identity")
            row = {"phrase": phrase, "role": "canonical", "level": level, "theme": "reserve",
                   "themeTitle": None, "path": path, "location": ["reserve", index]}
            primary[phrase["id"]] = row
            positions.append(row)
    path = DATA + "repertoires/" + pair + ".json"
    bank = git_json(commit, path)
    paths[path] = bank
    for index, phrase in enumerate(bank["receivedModels"]):
        require(phrase.get("heardOnly") is True and phrase.get("referenceOnly") is True,
                "A received model is not explicitly comprehension-only")
        require(phrase["id"] not in received, "Duplicate received model")
        row = {"phrase": phrase, "role": "received", "level": None, "theme": "receivedModels",
               "themeTitle": None, "path": path, "location": ["receivedModels", index]}
        received[phrase["id"]] = row
        positions.append(row)
    return primary, received, positions, themes, paths, bank


def normalized_study(value):
    return re.sub(r"[\s。、，,.!?！？…〜～\-–—·・:：;；「」『』\"'’]", "",
                  unicodedata.normalize("NFKC", value)).casefold()


def audit():
    primary, received, positions, themes, paths, bank = snapshot(BASE, "fr-ja")
    docs = {}
    for name, expected in PINS.items():
        raw = git_bytes(LOT5, P5 + name)
        require(digest(raw) == expected, "Frozen lot5 evidence differs: " + name)
        docs[name] = json.loads(raw)
        require(docs[name].get("reference", docs[name].get("baseSnapshotCommit")) == BASE,
                "Wrong before reference: " + name)
    coverage = docs["couverture.json"]
    declared = Counter()
    by_id = defaultdict(list)
    for item in coverage["items"]:
        require(item["status"] in STATUS, "Unknown coverage status")
        if item["chunk"] == "fr-ja-recus":
            role, level = "received", None
        else:
            match = re.fullmatch(r"fr-ja-L(\d+)-part\d+", item["chunk"])
            require(match, "Unknown coverage chunk")
            role, level = "canonical", int(match[1])
        declared[(item["id"], role, level)] += 1
        by_id[item["id"]].append(item)
    actual = Counter((row["phrase"]["id"], row["role"], row["level"]) for row in positions)
    require(declared == actual, "Coverage omits/adds/mistypes a position")
    require(len(primary) == 4727 and len(received) == 36, "Wrong inventory")
    require(coverage["total"] == len(positions) == 4763, "Wrong position count")
    require(coverage["distinctIds"] == len(by_id) == 4757, "Wrong distinct identity count")
    status_counts = dict(Counter(x["status"] for x in coverage["items"]))
    require(status_counts == coverage["counts"], "Coverage status counters differ")
    overlap = sorted(set(primary) & set(received))
    require(len(overlap) == 6, "Wrong canonical/received overlap")
    for identity in overlap:
        require(len({x["status"] for x in by_id[identity]}) == 1,
                "Contradictory statuses across roles: " + identity)

    phon = docs["registre-phonetique.json"]["events"]
    reading = docs["registre-lectures.json"]["events"]
    require(len(phon) == docs["registre-phonetique.json"]["eventCount"] == 4, "Wrong phon count")
    require(len(reading) == docs["registre-lectures.json"]["eventCount"] == 4, "Wrong reading count")
    ph_ids, reading_ids, copies, prior = set(), set(), [], []
    phon_by_id = {row["id"]: row for row in phon}
    active_ids, reserved_ids = [], []
    for event in phon:
        identity = event["id"]
        require(identity not in ph_ids and event["pair"] == "fr-ja", "Duplicate/wrong phon identity")
        ph_ids.add(identity)
        occurrence = event["occurrence"]
        require(occurrence["path"] in paths, "Phon path outside pair")
        source = address(paths[occurrence["path"]], occurrence["location"])
        require(source["id"] == identity and primary[identity]["level"] == event["level"], "Wrong phon position")
        expected = {field: source[field] for field in ("study", "native", "reading", "phon")}
        require(occurrence["expectedBefore"] == expected, "Wrong complete compact phon before")
        require(source["study"] == event["study"] and source["native"] == event["native"]
                and source["phon"] == event["beforePhon"] and source["reading"] == event["reading"],
                "Phon before fields differ")
        earlier = [key for key in source if key.endswith("Correction")]
        require(event["priorCorrection"] is bool(earlier) is False, "Unexpected earlier correction")
        prior.append({"id": identity, "priorAnnotations": earlier})
        matches = [phrase for phrase in bank["phrases"] if phrase["id"] == identity]
        require(len(matches) == event["transportCopies"], "Wrong transport count")
        for phrase in matches:
            require(all(phrase.get(field) == source.get(field) for field in expected), "Transport before differs")
            require(phrase.get("source") == source.get("source"), "Transport provenance differs")
            copies.append(identity)
        (reserved_ids if primary[identity]["theme"] == "reserve" else active_ids).append(identity)
    for event in reading:
        identity = event["id"]
        require(identity not in reading_ids and identity in ph_ids and event["pair"] == "fr-ja", "Wrong linked reading identity")
        reading_ids.add(identity)
        occurrence = event["occurrence"]
        source = address(paths[occurrence["path"]], occurrence["location"])
        require(source["id"] == identity and source["study"] == event["study"]
                and source["native"] == event["native"] and source["reading"] == event["beforeReading"],
                "Reading before fields differ")
        require(event["linkedPhonEvent"] is True and occurrence["path"] == phon_by_id[identity]["occurrence"]["path"]
                and occurrence["location"] == phon_by_id[identity]["occurrence"]["location"], "Reading not linked to the same whole entry")
    require(reading_ids == ph_ids, "Reading/phon changes do not cover identical entries")
    require(copies == ["catalogue:ja:4320"] and reserved_ids == ["catalogue:ja:3771"], "Unexpected copy/reserve scope")
    for theme in paths[primary[reserved_ids[0]]["path"]]["themes"]:
        for sequence in theme["sequences"]:
            require(reserved_ids[0] not in sequence["phraseIds"] and
                    all(step.get("utterance") != reserved_ids[0] for step in sequence["steps"]),
                    "Reserved model appears in a production sequence")
    require({x["id"] for x in coverage["items"] if x["status"] == "corrige"} == ph_ids,
            "Corrected principal statuses differ from phon/reading evidence")

    glosses = docs["lot-contenu-gloses.json"]["items"]
    require(len(glosses) == 173 and len({x["id"] for x in glosses}) == 172, "Wrong gloss inventory")
    certainty = dict(Counter(x["certainty"] for x in glosses))
    require(certainty == {"incertain": 147, "certain": 26}, "Wrong gloss certainty counts")
    certain_ids, gloss_before_mismatches = [], []
    for item in glosses:
        source = primary.get(item["id"], received.get(item["id"]))
        require(source is not None, "Unknown gloss identity")
        require(source["phrase"]["study"] == item["study"] and source["level"] == item["level"],
                "Gloss study/source level differs")
        if source["phrase"][item["field"]] != item["before"]:
            require(item["id"] == "catalogue:ja:833" and item["certainty"] == "incertain"
                    and item["field"] == "study" and item["before"] == source["phrase"]["reading"],
                    "Unexpected unapplied gloss before mismatch")
            gloss_before_mismatches.append({"id": item["id"], "field": item["field"],
                "deliveredBefore": item["before"], "actualBefore": source["phrase"][item["field"]],
                "issue": "unapplied study proposal uses the reading as its before"})
        if item["certainty"] == "certain":
            require(item["field"] == "native", "Certain gloss changes a non-native field")
            certain_ids.append(item["id"])
    require(set(certain_ids).isdisjoint(ph_ids), "Gloss/aide lots unexpectedly overlap")
    wrong_language = sorted(identity for identity, row in primary.items()
                            if "日本語" in row["phrase"]["study"] and "franç" in row["phrase"]["native"].casefold()
                            and "フランス語" not in row["phrase"]["study"])
    expected_language = sorted(["catalogue:ja:1956", "catalogue:ja:2352", "catalogue:ja:2395", "catalogue:ja:2615", "catalogue:ja:2647"])
    require(wrong_language == expected_language and set(wrong_language) <= set(certain_ids), "Japanese/French candidates differ")

    proposals = docs["propositions-niveaux-themes.json"]["items"]
    require(len(proposals) == 604 and len({x["id"] for x in proposals}) == 582, "Wrong proposal inventory")
    kind_counts = dict(Counter(x["kind"] for x in proposals))
    require(kind_counts == {"theme": 463, "level": 41, "duplicate": 100}, "Wrong proposal kinds")
    named, contextual, title_checks, duplicate_targets, duplicate_warnings = [], [], 0, [], []
    for item in proposals:
        source = primary[item["id"]]
        require(source["level"] == item["level"] and source["phrase"]["study"] == item["study"]
                and source["phrase"]["native"] == item["native"], "Proposal before fields differ")
        require(source["theme"] == item["theme"] and source["themeTitle"] == item["themeTitle"],
                "Proposal current theme/title differs")
        if item["kind"] == "theme":
            flag = item["destinationExistsAtSameLevel"]
            if flag is None:
                require("contextualiser" in item["proposed"], "Null theme destination lacks explicit context status")
                contextual.append(item["id"])
            else:
                require(flag is True, "A named destination is declared absent")
                match = re.match(r"^([A-Za-z0-9-]+)(?:\s+—\s+(.+))?$", item["proposed"])
                require(match is not None, "Unparsed named destination: " + item["proposed"])
                identity, title = match.groups()
                require(identity in themes[item["level"]], "Named destination does not exist at the same level")
                actual_title = themes[item["level"]][identity]["title"]
                if title:
                    title = title.strip().strip("«»\" ")
                    require(title == actual_title, "Proposed destination title differs")
                    title_checks += 1
                named.append({"sourceId": item["id"], "level": item["level"], "themeId": identity,
                              "themeTitle": actual_title})
        else:
            require(item["destinationExistsAtSameLevel"] is None, "Non-theme proposal has a destination assertion")
        if item["kind"] == "duplicate":
            text = " ".join(item.get(key, "") for key in ("current", "proposed", "reason"))
            targets = {}
            for identity in re.findall(r"catalogue:ja:\d+", text):
                if identity != item["id"] and identity in primary:
                    targets[identity] = primary[identity]["phrase"]
            for path in set(re.findall(r"(?:themes/\d+/phrases/\d+|reserve/\d+)", text)):
                try:
                    tokens = [int(x) if x.isdigit() else x for x in path.split("/")]
                    phrase = address(paths[source["path"]], tokens)
                    if phrase["id"] != item["id"]:
                        targets[phrase["id"]] = phrase
                except (IndexError, KeyError, TypeError):
                    duplicate_warnings.append({"id": item["id"], "path": path, "issue": "descriptive target path unresolved"})
            require(targets, "Duplicate proposal has no resolvable comparison target")
            for identity, phrase in sorted(targets.items()):
                kind = "exact" if phrase["study"] == item["study"] else (
                    "normalized-punctuation" if normalized_study(phrase["study"]) == normalized_study(item["study"]) else "different-study")
                if (item["id"] == "catalogue:ja:3031"
                        and identity == "conversation:L1-fr-ja.json:L1-fr-ja-11:v0"
                        and {phrase["study"], item["study"]} == {"分かりません。", "わかりません。"}):
                    kind = "documented-kanji-kana-variant"
                duplicate_targets.append({"id": item["id"], "targetId": identity, "comparison": kind})
                if kind == "different-study":
                    duplicate_warnings.append({"id": item["id"], "targetId": identity, "issue": "study differs even after punctuation normalization"})
    require(len(named) == 306 and len(contextual) == 157, "Wrong named/contextual theme counts")

    conventions = docs["conventions-a-decider.json"]["items"]
    require(len(conventions) == 1 and conventions[0]["id"] == "catalogue:ja:3890", "Wrong convention scope")
    item = conventions[0]
    require(item["stage"] == "snapshot-f22202c" and primary[item["id"]]["phrase"][item["field"]] == item["before"]
            and primary[item["id"]]["phrase"]["study"] == item["study"], "Convention before/stage differs")
    followup = {x["id"] for x in phon + reading + glosses + proposals + conventions}
    hidden = [x["id"] for x in coverage["items"] if x["status"] == "verifie" and x["id"] in followup]
    require(not hidden, "A verified status hides registered follow-up")

    # The lot4 amendments are documentary only: the frozen phonetic registry is identical.
    old_phon_bytes = git_bytes(LOT4, P4 + "registre-phonetique.json")
    require(git_bytes(ERRATA, P4 + "registre-phonetique.json") == old_phon_bytes,
            "Lot4 errata changed the phonetic registry")
    old_phon = {x["id"]: x for x in json.loads(old_phon_bytes)["events"]}
    errata = git_json(ERRATA, P4 + "errata-motifs.json")
    require({x["id"] for x in errata["items"]} == {"catalogue:fr:604", "catalogue:fr:2158", "catalogue:fr:2463"},
            "Unexpected motif errata scope")
    primary_fr, received_fr, _, _, _, _ = snapshot(BASE, "zh-fr")
    for item in errata["items"]:
        source = primary_fr.get(item["id"], received_fr.get(item["id"]))["phrase"]
        event = old_phon[item["id"]]
        require(item["afterPhon"] == event["afterPhon"] == source["phon"], "Erratum changes the actual deployed after")
        require(item["reasonDelivered"] == event["reason"] and item["reasonCorrected"] != item["reasonDelivered"],
                "Erratum does not preserve its delivered reason")
    old_conventions = git_json(LOT4, P4 + "conventions-a-decider.json")
    staged_conventions = git_json(ERRATA, P4 + "conventions-a-decider.json")
    unstage = json.loads(json.dumps(staged_conventions))
    stages, stage_ids = Counter(), defaultdict(list)
    primary_old_fr, received_old_fr, _, _, _, _ = snapshot(LOT4_BASE, "zh-fr")
    for group in unstage["groups"].values():
        for item in group:
            stage = item.pop("stage")
            stages[stage] += 1
            stage_ids[stage].append(item["id"])
            original = primary_old_fr.get(item["id"], received_old_fr.get(item["id"]))["phrase"]
            if stage == "snapshot-606592c":
                require(item["before"] == original[item.get("field", "phon")], "Lot4 snapshot stage is not its exact before")
            else:
                require(stage == "after-lot4-register" and item["id"] in old_phon
                        and item["before"] == old_phon[item["id"]]["afterPhon"], "Lot4 after-stage is not the registered after")
    require(unstage == old_conventions, "Lot4 convention values changed beyond the stage field")
    require(dict(stages) == {"snapshot-606592c": 76, "after-lot4-register": 5}, "Wrong lot4 stage counts")
    return {
        "baseSnapshotCommit": BASE, "evidenceCommit": LOT5, "errataCommit": ERRATA,
        "proofSha256": {name: digest(git_bytes(LOT5, P5 + name)) for name in PINS},
        "canonicalPositions": len(primary), "receivedPositions": len(received),
        "positions": len(positions), "distinctIds": len(by_id), "overlapIds": overlap,
        "statusCounts": status_counts, "missingExpectedPositions": 0, "extraPositions": 0,
        "verifiedStatusesHidingRegisteredFollowup": hidden,
        "phonetic": {"events": 4, "identities": 4, "readingEvents": 4, "canonicalObjects": 4,
                     "transportObjects": len(copies), "runtimeObjects": 4 + len(copies),
                     "changedRuntimeFields": 8 + 2 * len(copies), "activeIds": active_ids,
                     "reservedIds": reserved_ids, "transportIds": copies,
                     "noPriorAnnotations": prior},
        "glosses": {"events": len(glosses), "identities": len({x["id"] for x in glosses}),
                    "certain": 26, "uncertain": 147, "japaneseMistranslatedAsFrenchIds": wrong_language,
                    "certainBeforeFieldsExact": True,
                    "unappliedBeforeMismatches": gloss_before_mismatches},
        "proposals": {"events": len(proposals), "identities": len({x["id"] for x in proposals}),
                      "kinds": kind_counts, "namedThemeRows": len(named), "contextualNullRows": len(contextual),
                      "destinationTitlesExplicitlyChecked": title_checks, "destinationReferences": named,
                      "duplicateComparisons": dict(Counter(x["comparison"] for x in duplicate_targets)),
                      "duplicateTargetReferences": duplicate_targets, "duplicateWarnings": duplicate_warnings,
                      "allBeforeFieldsAndCurrentThemesExact": True},
        "conventions": {"events": 1, "identities": 1, "stage": conventions[0]["stage"],
                        "id": conventions[0]["id"], "beforeExact": True},
        "lot4Errata": {"motifIds": [x["id"] for x in errata["items"]],
                       "phoneticRegistryBytesUnchanged": True,
                       "phoneticRegistrySha256": digest(old_phon_bytes),
                       "errataSha256": digest(git_bytes(ERRATA, P4 + "errata-motifs.json")),
                       "actualAfterValuesUnchanged": True,
                       "conventionFieldsUnchangedExceptStage": True,
                       "conventionStages": dict(stages), "afterStageIds": sorted(stage_ids["after-lot4-register"])},
        "productChanged": False, "nativeOrPedagogicalApproval": False,
    }


if __name__ == "__main__":
    print(json.dumps(audit(), ensure_ascii=False, indent=2))

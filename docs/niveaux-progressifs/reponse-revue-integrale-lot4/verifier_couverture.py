"""Independent structural audit of Claude's lot4 review and lot3 amendments.

Read-only: this script uses pinned Git objects, not the current generated pack,
imports no generator, and changes no application or proof file.
"""
from __future__ import annotations
from collections import Counter, defaultdict
from functools import lru_cache
import hashlib
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[3]
BASE = "606592ccf11886810a6bb9fbabc56728cf5055c9"
LOT4 = "7631c0fe64170f952e086487462e94c87bfb13e1"
LOT3_AMENDED = "c849bf3d13d4141eae8b34f8cc5d3d43167bec60"
LOT3_ORIGINAL = "d06a62ea36120ffd73b8059645848c13bd4f172d"
LOT4_PATH = "docs/revue-integrale/lot4-zh-fr-L1-L10/"
LOT3_PATH = "docs/revue-integrale/lot3-fr-zh-L3-L10/"
DATA = "melunga_deploy/content/niveaux-progressifs/"
PHON_SHA = "15237777a65b287a4008d53167b458dde2e486af27deafb31698e91c99ff5167"


def require(ok, message):
    if not ok:
        raise AssertionError(message)


@lru_cache(None)
def git_bytes(commit, path):
    return subprocess.check_output(["git", "show", commit + ":" + path], cwd=ROOT)


def git_json(commit, path):
    return json.loads(git_bytes(commit, path))


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def address(document, location):
    for token in location:
        document = document[token]
    return document


def snapshot(pair):
    primary, positions, themes, paths = {}, [], {}, {}
    for level in range(1, 11):
        path = DATA + pair + f"/L{level}.json"
        document = git_json(BASE, path)
        paths[path] = document
        themes[level] = {row["id"]: row for row in document["themes"] + document["heldThemes"]}
        for collection in ("themes", "heldThemes"):
            for t_index, theme in enumerate(document[collection]):
                for p_index, phrase in enumerate(theme["phrases"]):
                    identity = phrase["id"]
                    require(identity not in primary, "Duplicate primary identity: " + identity)
                    row = {"phrase": phrase, "level": level, "theme": theme["id"],
                           "themeTitle": theme["title"], "path": path,
                           "location": [collection, t_index, "phrases", p_index], "role": "canonical"}
                    primary[identity] = row
                    positions.append(row)
        for p_index, phrase in enumerate(document["reserve"]):
            identity = phrase["id"]
            require(identity not in primary, "Duplicate reserved identity: " + identity)
            row = {"phrase": phrase, "level": level, "theme": "reserve", "themeTitle": None,
                   "path": path, "location": ["reserve", p_index], "role": "canonical"}
            primary[identity] = row
            positions.append(row)
    bank_path = DATA + "repertoires/" + pair + ".json"
    bank = git_json(BASE, bank_path)
    paths[bank_path] = bank
    received = {}
    for index, phrase in enumerate(bank["receivedModels"]):
        require(phrase.get("heardOnly") is True and phrase.get("referenceOnly") is True,
                "A received model lost its comprehension-only role")
        row = {"phrase": phrase, "level": None, "theme": "receivedModels", "themeTitle": None,
               "path": bank_path, "location": ["receivedModels", index], "role": "received"}
        received[phrase["id"]] = row
        positions.append(row)
    return primary, received, positions, themes, paths, bank


def source_entry(identity, primary, received):
    return primary.get(identity, received.get(identity))


def audit():
    primary, received, positions, themes, paths, bank = snapshot("zh-fr")
    proof_files = {name: git_json(LOT4, LOT4_PATH + name) for name in (
        "registre-phonetique.json", "lot-contenu-gloses.json", "propositions-niveaux-themes.json",
        "conventions-a-decider.json", "couverture.json")}
    phon = proof_files["registre-phonetique.json"]
    require(digest(git_bytes(LOT4, LOT4_PATH + "registre-phonetique.json")) == PHON_SHA,
            "Pinned phonetic evidence changed")
    require(phon["baseSnapshotCommit"] == BASE, "Wrong phonetic reference")
    for name, document in proof_files.items():
        if name != "registre-phonetique.json":
            require(document["reference"] == BASE, "Wrong reference in " + name)
    coverage = proof_files["couverture.json"]
    declared_positions = Counter()
    coverage_by_id = defaultdict(list)
    for row in coverage["items"]:
        require(row["status"] in coverage["statusLegend"], "Unknown coverage status")
        if row["chunk"] == "zh-fr-recus":
            role, level = "received", None
        else:
            match = re.fullmatch(r"zh-fr-L(\d+)-part\d+", row["chunk"])
            require(match is not None, "Unknown coverage chunk: " + row["chunk"])
            role, level = "canonical", int(match[1])
        declared_positions[(row["id"], role, level)] += 1
        coverage_by_id[row["id"]].append(row)
    actual_positions = Counter((row["phrase"]["id"], row["role"], row["level"]) for row in positions)
    require(declared_positions == actual_positions, "Coverage omits, adds, or mistypes a position")
    statuses = Counter(row["status"] for row in coverage["items"])
    require(dict(statuses) == coverage["counts"], "Coverage counters differ")
    require(coverage["total"] == len(positions) == 4736, "Wrong coverage position count")
    require(coverage["distinctIds"] == len(coverage_by_id) == 4729, "Wrong distinct-ID count")
    overlaps = sorted(set(primary) & set(received))
    require(len(primary) == 4700 and len(received) == 36 and len(overlaps) == 7,
            "Wrong canonical/received inventory")
    for identity in overlaps:
        require(len({row["status"] for row in coverage_by_id[identity]}) == 1,
                "Contradictory principal statuses for " + identity)
    # Every frozen event and every bank copy must have the exact whole before.
    event_ids, rules, copy_count, affected_positions = set(), Counter(), 0, []
    for event in phon["events"]:
        identity = event["id"]
        require(event["pair"] == "zh-fr" and identity not in event_ids, "Duplicate/wrong phon event")
        event_ids.add(identity)
        occurrence = event["occurrence"]
        require(occurrence["path"] in paths, "Phon event points outside this pair")
        current = address(paths[occurrence["path"]], occurrence["location"])
        require(current["id"] == identity, "False phon event position")
        for field in ("study", "native"):
            require(current[field] == event[field], "False phon before " + identity + ":" + field)
        require(current["phon"] == event["beforePhon"], "False phon before aid " + identity)
        require(occurrence["expectedBefore"] == {
            "study": current["study"], "native": current["native"], "phon": current["phon"]},
            "False compact expectedBefore")
        has_prior = any(field in current for field in ("phoneticCorrection", "reviewedFieldCorrection"))
        require(event["priorCorrection"] is has_prior is False, "Unexpected prior correction")
        matches = [row for row in positions if row["phrase"]["id"] == identity]
        for row in matches:
            for field in ("study", "native", "phon"):
                require(row["phrase"][field] == current[field], "A received/canonical copy has another before")
        copies = [x for x in bank["phrases"] if x["id"] == identity]
        require(len(copies) == event["transportCopies"], "False copy count for " + identity)
        for copy in copies:
            require(all(copy.get(k) == current.get(k) for k in ("study", "native", "phon", "reading")),
                    "False transport before tuple")
        copy_count += len(copies)
        affected_positions.extend({"id": identity, "role": x["role"], "level": x["level"]} for x in matches)
        rules.update(event["rules"])
    require(len(event_ids) == phon["eventCount"] == 259 and copy_count == 15,
            "Wrong phonetic/copy totals")
    corrected_coverage = {identity for identity, rows in coverage_by_id.items()
                          if any(x["status"] == "corrige" for x in rows)}
    require(corrected_coverage == event_ids, "Corrected status differs from exact event set")
    # All separate-content before values are checked, without approving their after.
    gloss = proof_files["lot-contenu-gloses.json"]
    for item in gloss["items"]:
        source = source_entry(item["id"], primary, received)
        require(source is not None, "Unknown gloss identity")
        phrase = source["phrase"]
        require(phrase[item["field"]] == item["before"] and phrase["study"] == item["study"],
                "False gloss before")
        require(source["level"] == item["level"], "False gloss level")
    for bundle in gloss["linkedBundles"]:
        source = source_entry(bundle["id"], primary, received)
        require(bundle.get("applyTogether") is True and source is not None, "Unbound content bundle")
        require(all(source["phrase"].get(k) == v for k, v in bundle["before"].items()),
                "False linked bundle before")
    require(len(gloss["items"]) == 112 and len({x["id"] for x in gloss["items"]}) == 112,
            "Wrong glossary item inventory")
    certain = [x for x in gloss["items"] if x["certainty"] == "certain"]
    require(len(certain) == gloss["certainCount"] == 8 and len(gloss["linkedBundles"]) == 1,
            "Wrong certain/bundle count")
    # Proposed destinations are checked literally, not accepted pedagogically.
    proposals = proof_files["propositions-niveaux-themes.json"]["items"]
    named, contextual, destination_refs = [], [], []
    for item in proposals:
        source = source_entry(item["id"], primary, received)
        require(source is not None and all(source["phrase"][k] == item[k] for k in ("study", "native")),
                "False proposed study/native")
        require((source["level"], source["theme"], source["themeTitle"]) ==
                (item["level"], item["theme"], item["themeTitle"]), "False proposal source placement")
        if item["kind"] == "theme" and item["destinationExistsAtSameLevel"] is True:
            refs = re.findall(r"([\w-]+)(?: —)? «\s*([^»]+?)\s*»", item["proposed"])
            require(refs, "Named destination cannot be parsed")
            for target, title in refs:
                require(target in themes[item["level"]]
                        and themes[item["level"]][target]["title"] == title,
                        "False destination at same level: " + target)
                destination_refs.append({"id": item["id"], "level": item["level"], "target": target, "title": title})
            named.append(item["id"])
        else:
            require(item["destinationExistsAtSameLevel"] is None, "False destination boolean")
            if item["kind"] == "theme":
                require(item["proposed"] == "à contextualiser", "Unbound theme is not marked contextual")
                contextual.append(item["id"])
    kinds = Counter(x["kind"] for x in proposals)
    require(kinds == {"theme": 237, "level": 38, "duplicate": 34}
            and len(named) == 183 and len(contextual) == 54, "Wrong proposal inventory")
    # Five [vy] conventions deliberately cite the after-phon stage, not BASE.
    conventions = proof_files["conventions-a-decider.json"]["groups"]
    convention_rows = [row for group in conventions.values() for row in group]
    by_event = {row["id"]: row for row in phon["events"]}
    base_conventions, after_conventions = [], []
    for item in convention_rows:
        source = source_entry(item["id"], primary, received)
        require(source is not None and source["phrase"]["study"] == item["study"], "False convention study")
        require(source["level"] == item["level"], "False convention level")
        if source["phrase"]["phon"] == item["before"]:
            base_conventions.append(item["id"])
        else:
            require(item["id"] in by_event and by_event[item["id"]]["afterPhon"] == item["before"]
                    and "Corrigé dans le registre" in item["reason"], "Unknown convention-before stage")
            after_conventions.append(item["id"])
    require(len(convention_rows) == len({x["id"] for x in convention_rows}) == 81
            and set(after_conventions) == {"catalogue:fr:" + str(x) for x in (971,1451,2426,2439,2581)},
            "Wrong convention inventory or staging")
    followups = event_ids | {x["id"] for x in gloss["items"] + gloss["linkedBundles"] + proposals + convention_rows}
    require(followups <= set(coverage_by_id), "A followup is missing from coverage")
    verified_followups = [identity for identity in followups
                          if all(row["status"] == "verifie" for row in coverage_by_id[identity])]
    require(not verified_followups, "A verified principal status masks registered followup")
    # Rectification of the previous dossier: same proposals, exactly 81 null flags.
    old_props = git_json(LOT3_ORIGINAL, LOT3_PATH + "propositions-niveaux-themes.json")["items"]
    amended_props = git_json(LOT3_AMENDED, LOT3_PATH + "propositions-niveaux-themes.json")["items"]
    require(len(old_props) == len(amended_props) == 340, "Amendment changed proposition inventory")
    changed_flags, amended_contexts = [], []
    for old, new in zip(old_props, amended_props):
        before, after = dict(old), dict(new)
        old_flag = before.pop("destinationExistsAtSameLevel")
        new_flag = after.pop("destinationExistsAtSameLevel")
        require(before == after, "Amendment silently changed another proposal field")
        if old_flag != new_flag:
            require(old_flag is True and new_flag is None and new["proposed"] == "à contextualiser",
                    "Unexpected destination-flag amendment")
            changed_flags.append(new["id"])
        if new["kind"] == "theme" and new["proposed"] == "à contextualiser":
            require(new_flag is None, "Contextual destination is still marked true")
            amended_contexts.append(new["id"])
    require(len(changed_flags) == len(amended_contexts) == 81, "Wrong contextual amendment count")
    amended_gloss = git_json(LOT3_AMENDED, LOT3_PATH + "lot-contenu-gloses.json")
    fr_zh_primary, fr_zh_received, _, _, _, _ = snapshot("fr-zh")
    for item in amended_gloss["items"]:
        source = source_entry(item["id"], fr_zh_primary, fr_zh_received)
        require(source is not None and source["phrase"][item["field"]] == item["before"]
                and source["phrase"]["study"] == item["study"], "Amended gloss before differs from 606592c")
    amended_by_id = {row["id"]: row for row in amended_gloss["items"] if row["certainty"] == "certain"}
    amended_targets = ["catalogue:zh:" + str(i) for i in (2165,3767,1110)]
    require("même en admettant" in amended_by_id[amended_targets[0]]["after"]
            and "à supposer même" in amended_by_id[amended_targets[1]]["after"]
            and amended_by_id[amended_targets[2]]["after"] == "Existe-t-il une version dans la taille au-dessus ?",
            "Requested gloss amendments absent")
    bundle = amended_gloss["linkedBundles"][0]
    require(bundle["id"] == "catalogue:zh:1900" and bundle["applyTogether"] is True
            and set(bundle["before"]) == set(bundle["after"]) == {"study","reading","phon","native"},
            "1900 is not a complete linked block")
    require(all(fr_zh_primary[bundle["id"]]["phrase"].get(k) == v for k,v in bundle["before"].items()),
            "1900 before tuple differs from 606592c")
    evidence = {LOT4 + ":" + LOT4_PATH + name: digest(git_bytes(LOT4, LOT4_PATH + name))
                for name in proof_files}
    for name in ("lot-contenu-gloses.json", "propositions-niveaux-themes.json"):
        evidence[LOT3_AMENDED + ":" + LOT3_PATH + name] = digest(git_bytes(LOT3_AMENDED, LOT3_PATH + name))
    return {
        "version": 1, "baseSnapshotCommit": BASE, "lot4EvidenceCommit": LOT4,
        "lot3AmendmentCommit": LOT3_AMENDED,
        "doesNotReproduceIndividualLinguisticReading": True,
        "coverage": {"canonicalPositions": len(primary), "receivedPositions": len(received),
                     "positions": len(positions), "distinctIds": len(coverage_by_id), "overlapIds": overlaps,
                     "missingOrExtraPositions": 0, "conflictingOverlapStatuses": 0,
                     "statusCounts": dict(sorted(statuses.items())), "verifiedIdsHidingFollowup": verified_followups,
                     "individualCellsDeclaredByClaude": 20, "totalCells": 70},
        "phoneticEvidence": {"events": len(phon["events"]), "distinctIds": len(event_ids),
                             "sourcePositionBeforeMismatches": 0, "priorCorrections": 0,
                             "ruleCounts": dict(sorted(Counter(x["rules"][0] for x in phon["events"]).items())),
                             "ruleTagCounts": dict(sorted(rules.items())),
                             "multiRuleEvents": [{"id": x["id"], "rules": x["rules"]} for x in phon["events"] if len(x["rules"]) > 1],
                             "transportCopies": copy_count,
                             "canonicalAffected": sum(x["role"] == "canonical" for x in affected_positions),
                             "receivedAffected": sum(x["role"] == "received" for x in affected_positions),
                             "objectsIncludingCopies": len(affected_positions) + copy_count,
                             "correctedPrincipalPositions": statuses["corrige"]},
        "separateContent": {"items": len(gloss["items"]), "itemIds": len({x["id"] for x in gloss["items"]}),
                            "certainItems": len(certain), "uncertainItems": len(gloss["items"])-len(certain),
                            "linkedBundles": len(gloss["linkedBundles"]), "bundleIds": [x["id"] for x in gloss["linkedBundles"]],
                            "beforeMismatches": 0, "doesNotApproveEveryProposedAfter": True},
        "separateProposals": {"rows": len(proposals), "distinctIds": len({x["id"] for x in proposals}),
                              "kinds": dict(sorted(kinds.items())), "sourceBeforeMismatches": 0,
                              "namedThemeProposals": len(named), "namedDestinationReferencesChecked": len(destination_refs),
                              "unboundContextualThemeRows": len(contextual), "nullContextualFlags": True,
                              "fourIdsWithTwoProposals": sorted(identity for identity, count in Counter(x["id"] for x in proposals).items() if count > 1),
                              "destinationsExistDoesNotProvePedagogicalFit": True},
        "separateConventions": {"rows": len(convention_rows), "distinctIds": len({x["id"] for x in convention_rows}),
                                "beforeAtBase606592c": len(base_conventions),
                                "beforeAtPhoneticAfterStage": after_conventions,
                                "unexplainedBeforeMismatches": 0, "appliedByThisAudit": False},
        "lot3Amendments": {"proposalRows": len(amended_props), "onlyChangedDestinationFlags": len(changed_flags),
                           "contextualFlagsNowNull": len(amended_contexts),
                           "amendedCertainGlossIds": amended_targets,
                           "allGlossBeforesMatch606592c": True,
                           "certainItems": sum(x["certainty"] == "certain" for x in amended_gloss["items"]),
                           "amendedGlossItems": len(amended_gloss["items"]),
                           "amendedGlossIds": len({x["id"] for x in amended_gloss["items"]}),
                           "linked1900BeforeMatches606592c": True, "linked1900Fields": sorted(bundle["before"]),
                           "linguisticAcceptanceHandledSeparately": True},
        "evidenceSha256": dict(sorted(evidence.items())),
        "sourceDataChangedByThisScript": False, "publicationApproved": False,
    }


if __name__ == "__main__":
    actual = audit()
    proof_path = Path(__file__).with_name("couverture-preuves.json")
    if proof_path.exists():
        proof = json.loads(proof_path.read_text())
        require(proof["structuralAudit"] == actual, "Stored structural audit is stale")
    print(json.dumps(actual, ensure_ascii=False, sort_keys=True))

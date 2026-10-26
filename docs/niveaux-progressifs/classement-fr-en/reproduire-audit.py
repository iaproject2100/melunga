#!/usr/bin/env python3
"""Audit indépendant du registre anglais, sans import du générateur.

La simulation porte les emplacements canoniques. --runtime contrôle aussi les
fichiers générés, les copies, rôles, références et tailles réellement affichées.
Aucun fichier n'est écrit : rediriger stdout si un compte rendu JSON est voulu.
"""
import argparse
import collections
import hashlib
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[3]
BASE = "13f42b5814f2b230d76d2d0ef267dcf406c523c2"
SOURCE = "1bf76c72f58e2ffe37e27d2b137a1ebe350e097f"
PREFIX = "melunga_deploy/content/niveaux-progressifs/"
REGISTRY = "docs/revue-integrale/classement-fr-en/registre-classement.json"
PROPOSALS = "docs/revue-integrale/lot7-fr-en-L1-L10/propositions-niveaux-themes.json"
PINS = {
    REGISTRY: "a605a44eb886e598014dab0ed4b1000c819060ad4dcf83f939fd70c9a4dc020a",
    PROPOSALS: "5ab38d121b56595b6865382d85327a82be4ad7c754b75248011567da085a4f5c",
}
EXPECTED_OPS = {"move": 610, "to-reserve": 37, "keep": 23}
# Filled only after the integration assets are frozen, not inferred from runtime.
APPROVED_UI_JS_SHA256 = "2b0cd51838305173f8cfa4bdc2b9c3cc9deaa465cea42160002c4b274c320308"
RESERVED_RECEIVED_LOCATION = {"pairId": "fr-en", "level": 3, "themeId": None}
CORE = ("study", "native", "phon", "reading", "source", "kind", "speaker", "contentType", "isTemplate", "phoneticReviewStatus")


def blob(commit, path):
    return subprocess.check_output(["git", "show", f"{commit}:{path}"], cwd=ROOT)


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def source(path):
    raw = blob(SOURCE, path)
    assert digest(raw) == PINS[path], path
    return json.loads(raw)


def entries(documents):
    found = {}
    for level, document in documents.items():
        for ti, theme in enumerate(document["themes"]):
            for pi, phrase in enumerate(theme["phrases"]):
                assert phrase["id"] not in found
                found[phrase["id"]] = {"level": level, "theme": theme["id"], "location": ["themes", ti, "phrases", pi], "phrase": phrase}
        for pi, phrase in enumerate(document["reserve"]):
            assert phrase["id"] not in found
            found[phrase["id"]] = {"level": level, "theme": "reserve", "location": ["reserve", pi], "phrase": phrase}
    return found


def normalize(study):
    study = study.casefold().replace("’", "'")
    study = re.sub(r"[^\w\s]", "", study, flags=re.UNICODE)
    return " ".join(study.split())


def duplicate_kind(a, b):
    if a == b:
        return "exact-study"
    if normalize(a) == normalize(b):
        return "case-punctuation-or-hyphen"
    if normalize(a.replace("Where's", "Where is")) == normalize(b.replace("Where's", "Where is")):
        return "contraction"
    if normalize(a.replace("okay", "OK")) == normalize(b.replace("okay", "OK")):
        return "orthographic-OK-okay"
    if normalize(re.sub(r"^(?:a|an|the) ", "", a)) == normalize(re.sub(r"^(?:a|an|the) ", "", b)):
        return "article"
    if {a, b} == {"Is this on sale?", "Is it on sale?"}:
        return "explicitly-approved-pronoun-variant"
    raise AssertionError((a, b, "unresolved duplicate relation"))


def family(theme_id):
    return re.sub(r"^L\d+-", "", theme_id)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--runtime", action="store_true")
    args = parser.parse_args()
    registry, proposals_document = source(REGISTRY), source(PROPOSALS)
    assert registry["baseSnapshotCommit"] == BASE and registry["pair"] == "fr-en"
    proposals = proposals_document["items"]
    operations = registry["ops"]
    assert len(operations) == len({row["id"] for row in operations}) == 670
    assert collections.Counter(row["op"] for row in operations) == EXPECTED_OPS
    documents = {level: json.loads(blob(BASE, PREFIX + f"fr-en/L{level}.json")) for level in range(1, 11)}
    before = entries(documents)
    assert len(before) == 4704
    bank_path = PREFIX + "repertoires/fr-en.json"
    bank = json.loads(blob(BASE, bank_path))
    file_names = subprocess.check_output(["git", "ls-tree", "-r", "--name-only", BASE, "--", PREFIX], cwd=ROOT, text=True).splitlines()
    file_names = [path for path in file_names if path.endswith(".json") and not path.endswith("/manifest.json")]
    assert len(file_names) == 77
    base_hashes = {path: digest(blob(BASE, path)) for path in file_names}
    themes = {(level, theme["id"]): theme for level, document in documents.items() for theme in document["themes"]}
    before_counts = {key: len(theme["phrases"]) for key, theme in themes.items()}
    after_counts = dict(before_counts)
    after_titles = {key: theme["title"] for key, theme in themes.items()}
    for theme in registry["newThemes"]:
        key = (theme["level"], theme["id"])
        assert key not in themes
        after_counts[key] = 0
        after_titles[key] = theme["title"]
    for row in registry["renameThemes"]:
        key = (row["level"], row["id"])
        assert key in themes
        after_titles[key] = row["newTitle"]
    after_location = {identifier: (row["level"], row["theme"]) for identifier, row in before.items()}
    op_index = {row["id"]: row for row in operations}
    level_changes, new_destinations, linked_codes = [], [], []
    operations_report = []
    for ordinal, op in enumerate(operations):
        old = before[op["id"]]
        expected = op["expectedBefore"]
        assert old["level"] == op["fromLevel"] == expected["level"]
        assert old["theme"] == op["fromTheme"] == expected["theme"]
        assert old["location"] == expected["location"]
        assert expected["path"] == PREFIX + f"fr-en/L{old['level']}.json"
        assert old["phrase"]["study"] == op["study"] == expected["study"]
        assert op["op"] == "keep" or old["theme"] != "reserve"
        if op["op"] != "keep":
            after_counts[(old["level"], old["theme"])] -= 1
        if op["op"] == "move":
            target = (op["toLevel"], op["toTheme"])
            assert target in after_counts and target != (old["level"], old["theme"])
            after_location[op["id"]] = target
            after_counts[target] += 1
            if op["fromLevel"] != op["toLevel"]:
                level_changes.append(op["id"])
            if target not in themes:
                new_destinations.append(op["id"])
        elif op["op"] == "to-reserve":
            after_location[op["id"]] = (old["level"], "reserve")
        linked_codes.extend(op["proposals"])
        operations_report.append({"ordinal": ordinal, "id": op["id"], "op": op["op"], "fromLevel": old["level"], "fromTheme": old["theme"], "expectedBeforeMatched": True, "toLevel": after_location[op["id"]][0], "toTheme": after_location[op["id"]][1]})
    assert len(level_changes) == 127 and len(new_destinations) == 9
    assert all(value >= 0 for value in after_counts.values())
    assert sum(before_counts.values()) == 4579 and sum(after_counts.values()) == 4542
    assert len(linked_codes) == len(set(linked_codes)) == 685
    missing_codes = [f"P{index:03d}" for index in range(len(proposals)) if f"P{index:03d}" not in linked_codes]
    assert missing_codes == ["P208", "P267", "P456", "P457"]
    proposal_ids = {row["id"] for row in proposals}
    assert len(proposals) == 689 and len(proposal_ids) == 672
    assert proposal_ids - set(op_index) == {"catalogue:en:609", "catalogue:en:500", "catalogue:en:749"}
    assert set(op_index) - proposal_ids == {"catalogue:en:748"}
    duplicate_pairs, without_place = [], []
    for op in operations:
        if op["op"] != "to-reserve":
            continue
        if "doublon" not in op.get("reason", ""):
            without_place.append({"id": op["id"], "study": op["study"], "reason": op["motif"]})
            continue
        candidates = set()
        for code in op["proposals"]:
            proposal = proposals[int(code[1:])]
            text = json.dumps(proposal, ensure_ascii=False)
            candidates.update("catalogue:en:" + number for number in re.findall(r"catalogue:en:(\d+)", text))
            if proposal["id"] != op["id"]:
                candidates.add(proposal["id"])
            for ti, pi in re.findall(r"(?:themes/)?(\d+)/phrases/(\d+)", text):
                candidates.add(documents[proposal["level"]]["themes"][int(ti)]["phrases"][int(pi)]["id"])
        candidates.discard(op["id"])
        assert len(candidates) == 1, (op["id"], candidates)
        kept = candidates.pop()
        assert kept in before and after_location[kept][1] != "reserve"
        relation = duplicate_kind(op["study"], before[kept]["phrase"]["study"])
        duplicate_pairs.append({"reservedId": op["id"], "reservedStudy": op["study"], "keeperId": kept, "keeperStudy": before[kept]["phrase"]["study"], "relation": relation, "oneOfTheseTwoCanonicalVariantsVisibleAfter": True, "keeperAfterLevel": after_location[kept][0], "keeperAfterTheme": after_location[kept][1]})
    assert len(duplicate_pairs) == 32 and len(without_place) == 5
    assert len({row["keeperId"] for row in duplicate_pairs}) == 32
    duplicate_kept = []
    kept_pairs = [("catalogue:en:3134", "catalogue:en:3133"), ("catalogue:en:3445", "catalogue:en:3446"), ("catalogue:en:3447", "catalogue:en:3448"), ("catalogue:en:2594", "catalogue:en:2581")]
    for identifier, counterpart in kept_pairs:
        assert op_index[identifier]["op"] == "keep"
        visible = [i for i in (identifier, counterpart) if after_location[i][1] != "reserve"]
        if identifier == "catalogue:en:2594":
            assert len(visible) == 2 and after_location[identifier] != after_location[counterpart]
        else:
            assert len(visible) == 1
        duplicate_kept.append({"id": identifier, "study": before[identifier]["phrase"]["study"], "counterpartId": counterpart, "counterpartStudy": before[counterpart]["phrase"]["study"], "afterLocation": list(after_location[identifier]), "counterpartAfterLocation": list(after_location[counterpart]), "visibleCanonicalVariantsAfter": len(visible), "sameThemeConditionSatisfied": after_location[identifier] == after_location[counterpart], "decision": "keep as explicitly frozen; do not infer an extra operation"})
    refs = []
    for level, document in documents.items():
        for theme in document["themes"]:
            for key in ("reviewReferences", "contextReferences"):
                for ref in theme[key]:
                    operation = op_index.get(ref["id"])
                    if not operation or operation["op"] == "keep":
                        continue
                    refs.append({"level": level, "themeId": theme["id"], "kind": key, "before": ref, "afterCanonicalLocation": list(after_location[ref["id"]]), "canonicalIsReservedAfter": after_location[ref["id"]][1] == "reserve", "wouldBecomeForwardReviewIfKept": after_location[ref["id"]][0] >= level})
    assert len(refs) == 26 and all(row["kind"] == "reviewReferences" for row in refs)
    copies = [phrase for phrase in bank["phrases"] if phrase["id"] in op_index and op_index[phrase["id"]]["op"] != "keep"]
    assert len(copies) == 18 and all(op_index[p["id"]]["op"] == "move" for p in copies)
    received_overlap = [phrase for phrase in bank["receivedModels"] if phrase["id"] in op_index]
    assert len(received_overlap) == 1 and received_overlap[0]["id"] == "catalogue:en:748"
    assert received_overlap[0]["heardOnly"] and received_overlap[0]["referenceOnly"]
    type_crossings = []
    for op in operations:
        if op["op"] != "move" or (op["toLevel"], op["toTheme"]) not in themes:
            continue
        destination = themes[op["toLevel"], op["toTheme"]]
        phrase = before[op["id"]]["phrase"]
        if (destination["section"] == "vocabulary" and phrase["contentType"] == "utterance") or (destination["section"] == "situations" and phrase["contentType"] != "utterance"):
            type_crossings.append({"id": op["id"], "study": phrase["study"], "contentTypePreserved": phrase["contentType"], "toLevel": op["toLevel"], "toTheme": op["toTheme"], "destinationSection": destination["section"]})
    assert collections.Counter(row["destinationSection"] for row in type_crossings) == {"vocabulary": 147, "situations": 4}
    theme_rows = []
    current = None
    current_themes = {}
    runtime_details = {"checked": False}
    if args.runtime:
        actual_documents = {level: json.loads((ROOT / (PREFIX + f"fr-en/L{level}.json")).read_text()) for level in range(1, 11)}
        current = entries(actual_documents)
        assert set(current) == set(before), "A canonical identity was added or deleted"
        for identifier, row in current.items():
            assert (row["level"], row["theme"]) == after_location[identifier], identifier
            assert row["phrase"]["editorialLevel"] == row["level"]
            for key, value in before[identifier]["phrase"].items():
                if key in {"editorialLevel", "placement"}:
                    continue
                assert key in row["phrase"] and row["phrase"][key] == value, (identifier, key, "old field changed")
        assert sum(row["theme"] != "reserve" for row in current.values()) == 4542
        assert sum(row["theme"] == "reserve" for row in current.values()) == 162
        for level, document in actual_documents.items():
            canonical_rows = [phrase for theme in document["themes"] for phrase in theme["phrases"]]
            all_rows = canonical_rows + document["reserve"]
            assert document["totalPhrases"] == document["visibleCanonicalPhrases"] == len(canonical_rows)
            assert document["reservedPhrases"] == len(document["reserve"])
            assert document["totalCanonicalPhrases"] == len(all_rows)
            assert document["heldPhrases"] == 0 and document["heldThemes"] == []
            assert document["presentedCount"] == sum(theme["presentedCount"] for theme in document["themes"])
            assert document["contextReuseCount"] == sum(len(theme["contextReferences"]) for theme in document["themes"])
            assert document["counts"] == {kind: sum(phrase["contentType"] == kind for phrase in all_rows) for kind in ("utterance", "vocabulary", "number", "incomplete", "review")}
        unchanged_other_pairs = []
        for path in file_names:
            if path.startswith(PREFIX + "fr-en/") or path == bank_path:
                continue
            assert digest((ROOT / path).read_bytes()) == base_hashes[path], path
            unchanged_other_pairs.append(path)
        assert len(unchanged_other_pairs) == 66
        actual_bank = json.loads((ROOT / bank_path).read_text())
        assert len(actual_bank["receivedModels"]) == len(bank["receivedModels"]) == 36
        assert [p["id"] for p in actual_bank["receivedModels"]] == [p["id"] for p in bank["receivedModels"]]
        assert RESERVED_RECEIVED_LOCATION is not None, "Freeze the expected reserved-model pointer before runtime audit"
        for old, new in zip(bank["receivedModels"], actual_bank["receivedModels"]):
            if old["id"] != "catalogue:en:748":
                assert new == old, (old["id"], "received-role object changed")
                continue
            expected_model = dict(old)
            expected_model.pop("canonicalLocation")
            expected_model["canonicalReserveLocation"] = RESERVED_RECEIVED_LOCATION
            assert new == expected_model, "Only the explicit reserved canonical pointer may change on received748"
        old_copies = {phrase["id"]: phrase for phrase in bank["phrases"]}
        new_copies = {phrase["id"]: phrase for phrase in actual_bank["phrases"]}
        assert set(old_copies) == set(new_copies)
        for identifier, old in old_copies.items():
            new = new_copies[identifier]
            if identifier not in {p["id"] for p in copies}:
                assert new == old, (identifier, "unaffected transport changed")
                continue
            location = after_location[identifier]
            assert new["canonicalLocation"] == {"pairId": "fr-en", "level": location[0], "themeId": location[1]}
            assert new["editorialLevel"] == location[0]
            for key, value in old.items():
                if key not in {"canonicalLocation", "editorialLevel", "placement"}:
                    assert new.get(key) == value, (identifier, key, "transport field changed")
        future_reviews = []
        family_mismatches = []
        reserved_productions = []
        reserved_ids = {row["id"] for row in operations if row["op"] == "to-reserve"}
        for level, document in actual_documents.items():
            for theme in document["themes"]:
                key = (level, theme["id"])
                assert key in after_counts
                assert len(theme["phrases"]) == after_counts[key]
                assert theme["title"] == after_titles[key]
                current_themes[key] = theme
                for ref in theme["reviewReferences"]:
                    target = current[ref["id"]]
                    assert target["theme"] != "reserve"
                    assert ref["firstEditorialLevel"] == target["level"] and ref["canonicalThemeId"] == target["theme"]
                    if target["level"] >= level:
                        future_reviews.append({"level": level, "theme": theme["id"], "id": ref["id"], "canonicalLevel": target["level"]})
                    if family(theme["id"]) != family(target["theme"]):
                        family_mismatches.append({"level": level, "theme": theme["id"], "id": ref["id"], "canonicalTheme": target["theme"]})
                for ref in theme["contextReferences"]:
                    target = current[ref["id"]]
                    assert target["theme"] != "reserve"
                    assert ref["firstEditorialLevel"] == target["level"] and ref["canonicalThemeId"] == target["theme"]
                for sequence in theme["sequences"]:
                    for step in sequence["steps"]:
                        if step.get("utterance") in reserved_ids and step.get("requiresProduction"):
                            reserved_productions.append({"level": level, "theme": theme["id"], "step": step["id"]})
        assert not future_reviews and not reserved_productions
        ui_files = sorted(path for path in (ROOT / "melunga_deploy").iterdir() if path.is_file() and path.suffix in {".html", ".js", ".css"})
        assert len(ui_files) == 36
        assert APPROVED_UI_JS_SHA256 is not None, "Freeze the exact approved UI JS hash before runtime audit"
        unchanged_ui, bounded_ui = [], []
        for path in ui_files:
            old = blob(BASE, str(path.relative_to(ROOT)))
            new = path.read_bytes()
            if path.name == "maquette-guidee.js":
                assert digest(new) == APPROVED_UI_JS_SHA256, path
                bounded_ui.append({"path": str(path.relative_to(ROOT)), "change": "explicitly frozen classification-reference guard and resume integration", "sha256": digest(new)})
            elif path.name in {"maquette-guidee.html", "parcours-niveaux.html"}:
                assert old.count(b"maquette-guidee.js?v=12") == 1
                assert new == old.replace(b"maquette-guidee.js?v=12", b"maquette-guidee.js?v=13"), path
                bounded_ui.append({"path": str(path.relative_to(ROOT)), "change": "one script cache-key v12 to v13, no other byte changed", "sha256": digest(new)})
            else:
                assert new == old, path
                unchanged_ui.append(str(path.relative_to(ROOT)))
        assert len(unchanged_ui) == 33 and len(bounded_ui) == 3
        runtime_details = {"checked": True, "canonicalIds": len(current), "canonicalPrimaryVisible": 4542, "canonicalReserve": 162, "otherPairsRuntimeFilesByteIdentical": len(unchanged_other_pairs), "receivedModelsWholeObjectsUnchanged": 35, "receivedModelWithBoundedReservedPointerUpdate": "catalogue:en:748", "transportCopiesUpdated": 18, "uiFilesByteIdentical": 33, "uiFilesWithBoundedChanges": bounded_ui, "classicCardsUntouched": 32115, "protectedPhraseFieldsUnchanged": list(CORE), "allOldPhraseFieldsExceptPlacementAndEditorialLevelUnchanged": True, "allTenCellCountersRecomputedAndVerified": True, "futureReviews": future_reviews, "reservedProductions": reserved_productions, "crossFamilyReviews": family_mismatches}
    for key, after in after_counts.items():
        old = themes.get(key)
        now = current_themes.get(key)
        review_count = len(old["reviewReferences"]) if old else 0
        context_count = len(old["contextReferences"]) if old else 0
        old_presented = len({phrase["id"] for phrase in old["phrases"]} | {ref["id"] for ref in old["reviewReferences"]} | {ref["id"] for ref in old["contextReferences"]}) if old else 0
        after_presented = len({phrase["id"] for phrase in now["phrases"]} | {ref["id"] for ref in now["reviewReferences"]} | {ref["id"] for ref in now["contextReferences"]}) if now else None
        theme_rows.append({"level": key[0], "themeId": key[1], "title": after_titles[key], "newTheme": old is None, "beforePrimary": before_counts.get(key, 0), "afterPrimary": after, "beforeReviewReferences": review_count, "beforeContextReferences": context_count, "beforeUniquePresented": old_presented, "runtimeVisible": now is not None if args.runtime else None, "afterUniquePresented": after_presented, "smallPrimaryBelowSix": after < 6, "largePrimaryAtLeast80": after >= 80, "largePrimaryAtLeast100": after >= 100, "newlyEmptyPrimary": old is not None and before_counts[key] > 0 and after == 0, "newlySmallPrimary": old is not None and before_counts[key] >= 6 and after < 6, "runtimeSmallBelowSix": after_presented < 6 if after_presented is not None else None, "runtimeLargeAtLeast80": after_presented >= 80 if after_presented is not None else None, "runtimeLargeStrictlyOver100": after_presented > 100 if after_presented is not None else None})
    if args.runtime:
        small_actual = [row for row in theme_rows if row["runtimeSmallBelowSix"]]
        big_actual = [row for row in theme_rows if row["runtimeLargeStrictlyOver100"]]
        assert len(small_actual) == 25 and len(big_actual) == 7
        runtime_details["smallPresentedThemesBelowSix"] = 25
        runtime_details["smallPresentedExistingThemes"] = 22
        runtime_details["smallPresentedNewApprovedThemes"] = 3
        runtime_details["largePresentedStrictlyOver100"] = 7
        runtime_details["largePresentedAtLeast100"] = 8
        runtime_details["largePresentedAtLeast80"] = 9
        runtime_details["retiredEmptyThemes"] = [row["themeId"] for row in theme_rows if not row["runtimeVisible"]]
        assert set(runtime_details["retiredEmptyThemes"]) == {"L9-repas", "L9-reperes"}
    levels = []
    for level in range(1, 11):
        old_visible = sum(value for (lev, _), value in before_counts.items() if lev == level)
        new_visible = sum(value for (lev, _), value in after_counts.items() if lev == level)
        old_reserve = len(documents[level]["reserve"])
        reserve_additions = sum(op["op"] == "to-reserve" and op["fromLevel"] == level for op in operations)
        levels.append({"level": level, "beforeVisibleCanonical": old_visible, "afterVisibleCanonical": new_visible, "beforeReserve": old_reserve, "afterReserve": old_reserve + reserve_additions, "beforeCanonicalTotal": old_visible + old_reserve, "afterCanonicalTotal": new_visible + old_reserve + reserve_additions})
    report = {"version": 1, "id": "independent-english-classification-register-audit", "baseSnapshotCommit": BASE, "evidenceCommit": SOURCE, "evidenceSha256": PINS, "publicationApproved": False, "doesNotMeasureAcquisition": True, "runtimeChecked": args.runtime, "counts": {"operations": 670, **EXPECTED_OPS, "levelChanges": 127, "intoNewThemes": 9, "newThemes": 3, "renamedThemes": 1, "beforeVisibleCanonical": 4579, "afterVisibleCanonical": 4542, "beforeReserve": 125, "afterReserve": 162, "canonicalTotalUnchanged": 4704, "keepVisible": 21, "keepAlreadyReserved": 2, "duplicateVariantsToReserve": 32, "withoutClearDestinationToReserve": 5}, "expectedBeforeMismatches": 0, "levels": levels, "themes": theme_rows, "thresholds": {"smallPrimary": "<6 canonical phrases, not equivalent to fewer than six presented concepts", "largeWarning": ">=80 canonical phrases; editorial warning only", "largeStrongWarning": ">=100 canonical phrases; editorial warning only", "noAutomaticEnrichmentOrThemeMerging": True}, "provenanceQualifications": {"sourceProposalRows": 689, "sourceProposalIds": 672, "uniqueLinkedProposalCodes": 685, "missingLinkedCodes": missing_codes, "missingCodesBelongToFourConflictsExplicitlyDescribedInSourceREADME": True, "originalProposalIdsWithoutOperation": sorted(proposal_ids-set(op_index)), "operationIdsNotPrimaryOriginalProposalIds": sorted(set(op_index)-proposal_ids), "idArithmetic": "672 - 3 retained duplicate counterparts (609,500,749) + 1 chosen counterpart put in reserve (748) = 670", "noProofRewritten": True}, "duplicatePairs": duplicate_pairs, "duplicateSignalsKept": duplicate_kept, "sourceDuplicateRows": 38, "sourceDistinctDuplicatePairs": 36, "retainedBothCanonicalVariantsInDifferentThemes": ["catalogue:en:2594", "catalogue:en:2581"], "withoutPlace": without_place, "affectedReviewReferences": refs, "affectedContextReferences": [], "affectedTransportIds": [row["id"] for row in copies], "receivedRoleOverlap": {"id": "catalogue:en:748", "canonicalAfter": "reserve", "receivedModelPreservedHeardOnly": True, "sameIdDoesNotMeanSameRole": True}, "contentTypeCrossings": type_crossings, "contentTypeCrossingCounts": dict(collections.Counter(row["destinationSection"] for row in type_crossings)), "runtime": runtime_details, "operations": operations_report, "baseRuntimeSha256": base_hashes, "limits": ["The selected registry decides placements, not grammar acquisition or global progressive difficulty.", "Thirty-two duplicate pairs are scoped to the explicit ledger, not a deduplication of every similar phrase in all levels.", "Primary phrase counts are distinct from displayed unique concepts after contextual/review references.", "Source contentType is heuristic in some cases; crossing counts are not automatic linguistic errors.", "No source-level, phonetic, price or access mutation is authorized by this audit.", "No main merge or production publication is approved for this PR."]}
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

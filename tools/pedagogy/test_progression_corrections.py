#!/usr/bin/env python3
"""Independent source and negative-contract checks for proposed L1–L10 routes.

These checks establish integrity and an editorial ordering, not acquisition,
native naturalness or a measured language level.
"""
import copy
import hashlib
import json
from pathlib import Path
import subprocess
import unittest

from build_progression_corrections import build, validate_runtime, verify_sources

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "docs/progression-corrections/parcours-corriges.json"
PAIRS = {"fr-en", "fr-es", "fr-it", "fr-zh", "fr-ja", "fr-ko", "zh-fr"}
BASELINE = "bcd108d"


def sources():
    result = {}
    for pair in sorted(PAIRS):
        for level in range(1, 11):
            relative = f"melunga_deploy/content/conversation/L{level}-{pair}.json"
            raw = subprocess.check_output(["git", "-C", str(ROOT), "show", f"{BASELINE}:{relative}"])
            document = json.loads(raw)
            for unit in document["units"]:
                result[unit["id"]] = {
                    "pair": pair, "level": level, "file": relative,
                    "unit": unit, "variants": unit["variants"],
                }
    return result


def unit_rows(plan):
    for pair in plan["pairs"]:
        for level in pair["levels"]:
            for unit in level["units"]:
                yield pair, level, unit


def source_fields(variant):
    return {key: value for key, value in variant.items() if key != "slot"}


class ProgressionCorrectionsTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.original = json.loads(OUTPUT.read_text())
        cls.oracle = sources()

    def setUp(self):
        self.plan = copy.deepcopy(self.original)

    def reject(self):
        with self.assertRaises(ValueError):
            validate_runtime(self.plan, root=ROOT)

    def first_unit(self):
        return next(unit_rows(self.plan))[2]

    def comparison_unit(self):
        return next((unit for _, _, unit in unit_rows(self.plan)
                     if unit.get("firstSubstitution") is not None), None)

    def test_all_841_units_and_all_70_levels_have_one_exact_source(self):
        validate_runtime(self.plan, root=ROOT)
        self.assertEqual(len(self.oracle), 841)
        self.assertEqual({pair["id"] for pair in self.plan["pairs"]}, PAIRS)
        seen = set()
        phrases = 0
        for pair in self.plan["pairs"]:
            self.assertEqual([level["level"] for level in pair["levels"]], list(range(1, 11)))
            for level in pair["levels"]:
                self.assertTrue(level["units"], (pair["id"], level["level"]))
                self.assertEqual([unit["order"] for unit in level["units"]],
                                 list(range(1, len(level["units"]) + 1)))
                for unit in level["units"]:
                    self.assertNotIn(unit["unitId"], seen)
                    seen.add(unit["unitId"])
                    source = self.oracle[unit["unitId"]]
                    self.assertEqual(source["pair"], pair["id"])
                    self.assertEqual(unit["sourceLevel"], source["level"])
                    self.assertEqual(unit["proposedLevel"], level["level"])
                    self.assertEqual(unit["source"], {
                        "file": source["file"], "unitId": unit["unitId"], "level": source["level"],
                    })
                    self.assertEqual(sorted(unit["variantOrder"]), [0, 1, 2, 3])
                    expected = {
                        f"L{source['level']}-{pair['id']}.json:{unit['unitId']}:v{index}": source_fields(variant)
                        for index, variant in enumerate(source["variants"])
                    }
                    self.assertEqual({phrase["id"] for phrase in unit["phrases"]}, set(expected))
                    for phrase in unit["phrases"]:
                        fields = expected[phrase["id"]]
                        self.assertEqual({key: phrase[key] for key in fields}, fields)
                        self.assertEqual("reading" in phrase, "reading" in fields)
                        phrases += 1
        self.assertEqual(seen, set(self.oracle))
        self.assertEqual(phrases, 3364)

    def test_preparation_order_does_not_assume_acquisition(self):
        self.assertTrue(self.plan["doesNotMeasureAcquisition"])
        self.assertFalse(self.plan["publicationApproved"])
        for pair in self.plan["pairs"]:
            earlier = set()
            for level in pair["levels"]:
                for unit in level["units"]:
                    source = self.oracle[unit["unitId"]]
                    self.assertEqual(source["level"] == 1, level["level"] == 1,
                                     "Existing L1 stays in L1 and later content does not enter L1")
                    self.assertTrue(set(unit["plannedPrerequisites"]) <= earlier)
                    understood, imitated, prior_steps = set(), set(), {}
                    ids = {phrase["id"] for phrase in unit["phrases"]}
                    for step in unit["steps"]:
                        self.assertTrue(step["wholePhrase"])
                        self.assertEqual(step["requiresProduction"],
                                         step["kind"] in {"imitate", "choose-and-recall"})
                        if step["kind"] == "understand":
                            self.assertIn(step["utterance"], ids)
                            understood.add(step["utterance"])
                        elif step["kind"] == "imitate":
                            self.assertIn(step["utterance"], understood)
                            imitated.add(step["utterance"])
                        else:
                            self.assertTrue(set(step["choices"]) <= understood & imitated)
                            self.assertEqual({entry["utteranceId"] for entry in step["preparedChoices"]},
                                             set(step["choices"]))
                            for entry in step["preparedChoices"]:
                                for field, kind in [("understoodInStep", "understand"),
                                                    ("imitatedInStep", "imitate")]:
                                    preparation = prior_steps[entry[field]]
                                    self.assertEqual(preparation["kind"], kind)
                                    self.assertEqual(preparation["utterance"], entry["utteranceId"])
                        prior_steps[step["id"]] = step
                    self.assertEqual(understood, ids)
                    self.assertEqual(imitated, ids)
                    self.assertFalse(unit["steps"][-1]["gradesOrUnlocks"])
                    earlier.add(unit["unitId"])

    def test_builder_is_reproducible_and_all_canonical_bytes_stay_intact(self):
        protected = sorted(ROOT.glob("melunga_deploy/content/conversation/L*-*.json"))
        self.assertEqual(len(protected), 110)
        protected.append(ROOT / "melunga_deploy/app.html")
        before = {path: hashlib.sha256(path.read_bytes()).hexdigest() for path in protected}
        for path in protected:
            relative = path.relative_to(ROOT).as_posix()
            historical = subprocess.check_output(["git", "-C", str(ROOT), "show", f"{BASELINE}:{relative}"])
            self.assertEqual(path.read_bytes(), historical, relative)
        verify_sources(ROOT)
        self.assertEqual(build(ROOT), self.original)
        self.assertEqual(build(ROOT), self.original)
        self.assertEqual(before, {path: hashlib.sha256(path.read_bytes()).hexdigest() for path in protected})

    def test_missing_unit_is_not_silently_treated_as_complete(self):
        self.plan["pairs"][0]["levels"][0]["units"].pop()
        self.reject()

    def test_duplicate_unit_is_rejected(self):
        units = self.plan["pairs"][0]["levels"][0]["units"]
        units.append(copy.deepcopy(units[0]))
        self.reject()

    def test_phonetic_corruption_is_rejected(self):
        self.first_unit()["phrases"][0]["phon"] += " "
        self.reject()

    def test_missing_original_reading_is_rejected(self):
        unit = next(unit for pair, _, unit in unit_rows(self.plan) if pair["id"] == "fr-ja")
        del unit["phrases"][0]["reading"]
        self.reject()

    def test_reader_cannot_change_without_the_source(self):
        self.plan["pairs"][0]["nativeLanguage"] = "en"
        self.reject()

    def test_future_prerequisite_is_rejected(self):
        pair = self.plan["pairs"][0]
        pair["levels"][0]["units"][0]["plannedPrerequisites"] = [pair["levels"][-1]["units"][-1]["unitId"]]
        self.reject()

    def test_self_prerequisite_is_rejected(self):
        unit = self.first_unit()
        unit["plannedPrerequisites"] = [unit["unitId"]]
        self.reject()

    def test_foreign_pair_prerequisite_is_rejected(self):
        self.first_unit()["plannedPrerequisites"] = [self.plan["pairs"][1]["levels"][0]["units"][0]["unitId"]]
        self.reject()

    def test_choice_cannot_precede_full_understanding_and_imitation(self):
        steps = self.first_unit()["steps"]
        choice = next(step for step in steps if step["kind"] == "choose-and-recall")
        steps.remove(choice)
        steps.insert(0, choice)
        self.reject()

    def test_unknown_utterance_reference_is_rejected(self):
        self.first_unit()["steps"][-1]["choices"][0] = "unwritten-phrase"
        self.reject()

    def test_added_operation_cannot_be_presented_as_the_first_single_change(self):
        unit = self.comparison_unit()
        self.assertIsNotNone(unit, "The route must exercise the declared single-change path")
        unit["firstSubstitution"]["additionalOperations"] = ["unprepared change of register"]
        self.reject()

    def test_same_variant_is_not_a_substitution(self):
        unit = self.comparison_unit()
        self.assertIsNotNone(unit)
        index = unit["firstSubstitution"]["variants"][0]
        unit["firstSubstitution"]["variants"] = [index, index]
        self.reject()

    def test_publication_or_mastery_is_not_enabled_by_a_plan(self):
        self.plan["publicationApproved"] = True
        self.reject()

    def test_editorial_order_cannot_be_relabelled_as_a_measure_of_acquisition(self):
        self.plan["doesNotMeasureAcquisition"] = False
        self.reject()

    def test_native_review_cannot_be_invented_by_a_metadata_change(self):
        self.plan["nativeReview"]["status"] = "approved"
        self.reject()

    def test_source_hash_manifest_cannot_be_falsified(self):
        key = next(iter(self.plan["sourceFilesSha256"]))
        self.plan["sourceFilesSha256"][key] = "0" * 64
        self.reject()

    def test_source_access_cannot_be_lowered(self):
        unit = next(unit for _, _, unit in unit_rows(self.plan) if unit["sourceLevel"] > 1)
        unit["access"]["sourceLevel"] = 1
        self.reject()

    def test_auto_referential_preparation_is_not_a_prior_introduction(self):
        choice = self.first_unit()["steps"][-1]
        choice["preparedChoices"][0]["understoodInStep"] = choice["id"]
        self.reject()


if __name__ == "__main__":
    unittest.main(verbosity=2)

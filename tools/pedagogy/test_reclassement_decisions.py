#!/usr/bin/env python3
"""Regression checks for the scoped response to the 99478df review.

The assertions concern source preservation and specific editorial dependencies.
They deliberately do not treat a monotonically increasing length as learning.
"""
import json
from pathlib import Path
import subprocess
import unittest


ROOT = Path(__file__).resolve().parents[2]
RUNTIME = "docs/progression-corrections/parcours-corriges.json"
BASELINE = "99478dfd515c7498a71209d5316ad702313789bb"


def rows(plan):
    for pair in plan["pairs"]:
        for level in pair["levels"]:
            for unit in level["units"]:
                yield pair["id"], level["level"], unit


class ReclassementDecisionsTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.current = json.loads((ROOT / RUNTIME).read_text(encoding="utf-8"))
        cls.previous = json.loads(subprocess.check_output(
            ["git", "-C", str(ROOT), "show", f"{BASELINE}:{RUNTIME}"]
        ))
        cls.units = {unit["unitId"]: unit for _, _, unit in rows(cls.current)}
        cls.old_units = {unit["unitId"]: unit for _, _, unit in rows(cls.previous)}
        cls.positions = {}
        for pair in cls.current["pairs"]:
            cls.positions[pair["id"]] = {
                unit["unitId"]: index
                for index, unit in enumerate(
                    unit for level in pair["levels"] for unit in level["units"]
                )
            }

    def assert_before(self, pair, first, second):
        self.assertLess(self.positions[pair][first], self.positions[pair][second],
                        f"{first} must precede {second}")

    def test_followup_keeps_every_source_phrase_aid_and_existing_access(self):
        self.assertEqual(set(self.units), set(self.old_units))
        self.assertEqual(len(self.units), 841)
        for uid, current in self.units.items():
            previous = self.old_units[uid]
            for field in ("source", "sourceLevel", "access", "phrases"):
                self.assertEqual(current[field], previous[field], f"{uid}: {field}")
        self.assertEqual(self.current["sourceFilesSha256"],
                         self.previous["sourceFilesSha256"])
        self.assertTrue(self.current["doesNotMeasureAcquisition"])
        self.assertFalse(self.current["publicationApproved"])

    def test_all_seventy_level_cells_and_l1_boundary_are_preserved(self):
        old_pairs = {pair["id"]: pair for pair in self.previous["pairs"]}
        self.assertEqual(len(self.current["pairs"]), 7)
        for pair in self.current["pairs"]:
            self.assertEqual([level["level"] for level in pair["levels"]], list(range(1, 11)))
            self.assertTrue(all(level["units"] for level in pair["levels"]))
            current_l1 = [u["unitId"] for u in pair["levels"][0]["units"]]
            original_l1 = [u["unitId"] for u in old_pairs[pair["id"]]["levels"][0]["units"]]
            self.assertEqual(current_l1, original_l1)
            self.assertEqual(len(current_l1), 11)

    def test_each_declared_prerequisite_still_precedes_its_use(self):
        for pair_id, _, unit in rows(self.current):
            for dependency in unit["plannedPrerequisites"]:
                self.assertIn(dependency, self.positions[pair_id])
                self.assert_before(pair_id, dependency, unit["unitId"])

    def test_english_habit_contrasts_are_not_moved_to_flatten_length(self):
        first, second = "L7-fr-en-08", "L7-fr-en-09"
        for uid in (first, second):
            for field in ("proposedLevel", "order", "variantOrder"):
                self.assertEqual(self.units[uid][field], self.old_units[uid][field],
                                 f"Length alone does not justify changing {uid}: {field}")
        self.assert_before("fr-en", first, second)
        for foundation in ("L5-fr-en-01", "L4-fr-en-01"):
            self.assertIn(foundation, self.units[first]["plannedPrerequisites"])
            self.assert_before("fr-en", foundation, first)
        self.assertIn(first, self.units[second]["plannedPrerequisites"])

    def test_italian_opinion_follows_the_comparatives_it_reuses(self):
        opinion = "L7-fr-it-06"
        self.assertEqual(self.units[opinion]["proposedLevel"], 7)
        for comparison in ("L7-fr-it-02", "L7-fr-it-03"):
            self.assertIn(comparison, self.units[opinion]["plannedPrerequisites"])
            self.assert_before("fr-it", comparison, opinion)

    def test_spanish_causal_preference_follows_explicit_cause_preparation(self):
        cause, preference = "L7-fr-es-01", "L7-fr-es-04"
        self.assertIn(cause, self.units[preference]["plannedPrerequisites"])
        self.assert_before("fr-es", cause, preference)

    def test_spanish_indirect_si_is_not_prepared_by_a_conditional_label(self):
        indirect = self.units["L8-fr-es-10"]
        self.assertNotIn("L8-fr-es-04", indirect["plannedPrerequisites"])
        self.assertIn("L3-fr-es-02", indirect["plannedPrerequisites"])
        self.assert_before("fr-es", "L3-fr-es-02", indirect["unitId"])

    def test_korean_short_news_stays_early_without_a_length_based_reversal(self):
        news = self.units["L5-fr-ko-04"]
        self.assertEqual(news["sourceLevel"], 5)
        self.assertEqual(news["proposedLevel"], 3)
        self.assertEqual(news["phrases"], self.old_units[news["unitId"]]["phrases"])


if __name__ == "__main__":
    unittest.main()

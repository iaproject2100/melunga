#!/usr/bin/env python3
"""Check actual Spanish support presentations against independent Git sources.

These assertions protect source copies and presentation order.  They do not
claim that exposing a phrase establishes comprehension or acquisition.
"""
from copy import deepcopy
import json
from pathlib import Path
import subprocess
import unittest

from build_progression_corrections import validate_runtime


ROOT = Path(__file__).resolve().parents[2]
RUNTIME = "docs/progression-corrections/parcours-corriges.json"
BASELINE = "a4f1ec4e31e436546e775597845ff570476356a8"
SOURCE = "bcd108dff5c5931f935f70f694a040d235403b64"
EXPECTED = {
    ("L4-fr-es-01", 264): 1,
    ("L4-fr-es-01", 283): 0,
    ("L4-fr-es-03", 542): 3,
}


def git_bytes(commit, name):
    return subprocess.check_output(["git", "-C", str(ROOT), "show", f"{commit}:{name}"])


def units(plan):
    return {unit["unitId"]: (pair["id"], level["level"], unit)
            for pair in plan["pairs"] for level in pair["levels"] for unit in level["units"]}


def catalogue_oracle():
    # Parse the canonical literal independently, without the compiler helper.
    raw = git_bytes(SOURCE, "melunga_deploy/app.html").decode("utf-8")
    start = raw.index("=", raw.index("var DECKS =")) + 1
    result, _ = json.JSONDecoder().raw_decode(raw[start:].lstrip())
    return result["es"]


class SpanishPreparationsTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.current = json.loads((ROOT / RUNTIME).read_text(encoding="utf-8"))
        cls.old = json.loads(git_bytes(BASELINE, RUNTIME))
        cls.current_units = units(cls.current)
        cls.old_units = units(cls.old)
        cls.catalogue = catalogue_oracle()

    def setUp(self):
        self.plan = deepcopy(self.current)

    def support(self):
        return units(self.plan)["L4-fr-es-01"][2]["preparations"][0]

    def reject(self):
        with self.assertRaises(ValueError):
            validate_runtime(self.plan, root=ROOT)

    def test_all_original_units_levels_order_phrases_and_access_are_unchanged(self):
        self.assertEqual(set(self.current_units), set(self.old_units))
        self.assertEqual(len(self.current_units), 841)
        for uid, (pair, level, unit) in self.current_units.items():
            old_pair, old_level, old = self.old_units[uid]
            self.assertEqual((pair, level), (old_pair, old_level), uid)
            for field in ("sourceLevel", "proposedLevel", "order", "source", "access", "phrases"):
                self.assertEqual(unit[field], old[field], f"{uid} {field}")
            if pair != "fr-es" or level == 1:
                self.assertEqual(unit, old, uid)
        self.assertEqual(self.current["sourceFilesSha256"], self.old["sourceFilesSha256"])
        self.assertTrue(self.current["doesNotChangeAccess"])
        self.assertTrue(self.current["doesNotMeasureAcquisition"])
        self.assertFalse(self.current["publicationApproved"])

    def test_exactly_three_whole_catalogue_supports_keep_their_source_reader_and_level(self):
        found = {}
        for uid, (pair, level, unit) in self.current_units.items():
            self.assertEqual(len(unit["phrases"]), 4)
            for support in unit.get("preparations", []):
                source = support["source"]
                key = (uid, source["index"])
                self.assertNotIn(key, found)
                found[key] = support["beforeVariantIndex"]
                self.assertEqual((pair, level), ("fr-es", 4))
                self.assertEqual(source["type"], "catalogue-card")
                self.assertEqual(source["file"], "melunga_deploy/app.html")
                self.assertEqual(source["collection"], "DECKS.es")
                self.assertEqual(source["indexBase"], 0)
                self.assertEqual(source["sourceCommit"], SOURCE)
                self.assertEqual((source["readerLanguage"], source["studyLanguage"]), ("fr", "es"))
                self.assertEqual(source["fieldMap"], {"study": "t", "native": "frm", "phon": "pf"})
                card = self.catalogue[source["index"]]
                self.assertEqual(source["sourceLevel"], card["lv"])
                self.assertEqual(support["phrase"], {
                    "id": f"catalogue:DECKS.es:{source['index']}:reader-fr",
                    "study": card["t"], "native": card["frm"], "phon": card["pf"],
                })
                self.assertNotIn(support["phrase"]["id"], {p["id"] for p in unit["phrases"]})
        self.assertEqual(found, EXPECTED)
        counts = self.current["counts"]
        self.assertEqual(counts["phrases"], 3364)
        self.assertEqual(counts["existingCataloguePreparations"], 3)
        self.assertEqual(counts["totalPresentedUtterances"], 3367)
        self.assertEqual(counts["newlyAuthoredStudyPhrases"], 0)
        self.assertEqual(counts["newlyAuthoredPhoneticAids"], 0)

    def test_each_support_is_presented_then_offered_for_imitation_before_its_target(self):
        for _, _, unit in self.current_units.values():
            positions = {step["id"]: index for index, step in enumerate(unit["steps"])}
            variant_ids = {p["id"] for p in unit["phrases"]}
            for support in unit.get("preparations", []):
                understand_index = positions[support["understoodInStep"]]
                imitate_index = positions[support["imitatedInStep"]]
                target_index = positions[f"{unit['unitId']}-understand-{support['beforeVariantIndex']}"]
                self.assertEqual(imitate_index, understand_index + 1)
                self.assertEqual(target_index, imitate_index + 1)
                for index, kind in ((understand_index, "understand"), (imitate_index, "imitate")):
                    step = unit["steps"][index]
                    self.assertEqual(step["kind"], kind)
                    self.assertEqual(step["utterance"], support["phrase"]["id"])
                    self.assertEqual(step["preparationId"], support["id"])
                    self.assertTrue(step["wholePhrase"])
                    self.assertEqual(step["requiresProduction"], kind == "imitate")
            for step in unit["steps"]:
                if step["kind"] in ("compare", "choose-and-recall"):
                    self.assertTrue(set(step["choices"]) <= variant_ids)

    def test_new_variant_orders_use_the_prepared_clause_without_changing_any_variant(self):
        self.assertEqual(self.current_units["L4-fr-es-01"][2]["variantOrder"], [1, 2, 3, 0])
        self.assertEqual(self.current_units["L4-fr-es-03"][2]["variantOrder"], [3, 0, 1, 2])
        for uid, (_, _, unit) in self.current_units.items():
            if uid not in {"L4-fr-es-01", "L4-fr-es-03"}:
                self.assertEqual(unit["variantOrder"], self.old_units[uid][2]["variantOrder"], uid)

    def test_changed_support_phonetic_is_rejected(self):
        self.support()["phrase"]["phon"] += " changed"
        self.reject()

    def test_changed_support_meaning_is_rejected(self):
        self.support()["phrase"]["native"] = "a recomposed translation"
        self.reject()

    def test_wrong_catalogue_locator_is_rejected(self):
        self.support()["source"]["index"] += 1
        self.reject()

    def test_lowered_source_level_is_rejected(self):
        self.support()["source"]["sourceLevel"] = 1
        self.reject()

    def test_missing_support_imitation_is_not_silently_a_preparation(self):
        unit = units(self.plan)["L4-fr-es-01"][2]
        imitate_id = unit["preparations"][0]["imitatedInStep"]
        unit["steps"] = [step for step in unit["steps"] if step["id"] != imitate_id]
        self.reject()

    def test_support_cannot_be_moved_after_its_target(self):
        unit = units(self.plan)["L4-fr-es-01"][2]
        understand_id = unit["preparations"][0]["understoodInStep"]
        index = next(i for i, step in enumerate(unit["steps"]) if step["id"] == understand_id)
        unit["steps"].append(unit["steps"].pop(index))
        self.reject()

    def test_support_does_not_become_an_extra_recall_answer(self):
        unit = units(self.plan)["L4-fr-es-01"][2]
        unit["steps"][-1]["choices"].append(unit["preparations"][0]["phrase"]["id"])
        self.reject()

    def test_support_cannot_claim_that_the_learner_has_acquired_it(self):
        self.support()["acquired"] = True
        self.reject()


if __name__ == "__main__":
    unittest.main()

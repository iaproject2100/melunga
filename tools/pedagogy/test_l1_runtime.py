#!/usr/bin/env python3
"""Independent source checks and negative contracts for the L1 runtime build."""

from copy import deepcopy
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import unittest
import unicodedata
from unittest.mock import patch

sys.dont_write_bytecode = True
SCRIPT = Path(__file__).with_name("build_l1_runtime.py")
spec = importlib.util.spec_from_file_location("build_l1_runtime", SCRIPT)
runtime = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runtime)
ROOT = SCRIPT.resolve().parents[2]
COMMIT = "30e7d40a8af3f51ee186bf83f983596b8ca8798f"
PAIRS = ("fr-en", "fr-es", "fr-it", "fr-zh", "fr-ja", "fr-ko", "zh-fr")


def git_bytes(path):
    return subprocess.check_output(["git", "-C", str(ROOT), "show", COMMIT + ":" + path])


class RuntimeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = runtime.read_sources(ROOT)
        cls.bundle_bytes = (ROOT / runtime.OUTPUT).read_bytes()
        cls.bundle = json.loads(cls.bundle_bytes)

    def changed(self):
        return deepcopy(self.sources)

    def bank_row(self, sources, ref):
        entries = sources[runtime.MAIN_BANK]["entries"] + sources[runtime.FRAGMENTS]["entries"]
        return next(row for row in entries if row["id"] == ref)

    def test_generated_bundle_matches_independent_git_source_read(self):
        # This oracle reads Git directly and does not use the builder's resolver,
        # source-copy helper, split constants or returned bundle as its source.
        self.assertEqual(self.bundle["sourceCommit"], COMMIT)
        self.assertEqual(self.bundle["status"], "integration-review-not-production-approved")
        self.assertIs(self.bundle["nativeReviewPending"], True)
        self.assertIs(self.bundle["doesNotChangeAccess"], True)
        self.assertEqual([pair["id"] for pair in self.bundle["pairs"]], list(PAIRS))
        bank = json.loads(git_bytes("docs/progression-complete/banque-phrases.json"))["entries"]
        bank += json.loads(git_bytes("docs/progression-complete/banks/l1-bridges.json"))["entries"]
        by_id = {entry["id"]: entry for entry in bank}
        for pair in self.bundle["pairs"]:
            pair_id = pair["id"]
            native, study = pair_id.split("-")
            prefix = "L1-" + pair_id
            path = "melunga_deploy/content/conversation/" + prefix + ".json"
            raw = json.loads(git_bytes(path))
            original = next(d for d in raw["dialogues"] if d["id"] == prefix + "-d1")
            expected_ids = [f"{prefix}.json:{prefix}-d1:t0", f"{prefix}.json:{prefix}-d1:t1",
                            f"{prefix}.json:{prefix}-09:v0", f"{prefix}.json:{prefix}-d1:t3",
                            f"{prefix}.json:{prefix}-d1:t4:refusal", f"{prefix}.json:{prefix}-d1:t4:price",
                            f"{prefix}.json:{prefix}-d1:t5"]
            self.assertEqual((pair["nativeLanguage"], pair["studyLanguage"], pair["level"]), (native, study, 1))
            self.assertEqual(pair["roles"], original["roles"])
            self.assertEqual(pair["learnerRole"], original["learnerRole"])
            self.assertEqual([p["id"] for p in pair["phrases"]], expected_ids)
            self.assertEqual([p["kind"] for p in pair["phrases"]],
                             ["learner", "received", "learner", "received", "learner", "learner", "received"])
            self.assertEqual(pair["contextReader"]["scene"], original["situation"])
            for phrase, index in zip(pair["phrases"], (0, 1, 2, 3, 4, 4, 5)):
                row = by_id[phrase["id"]]
                copy = row["copy"]
                self.assertEqual(phrase, {"id": row["id"], "kind": "received" if index in (1, 3, 5) else "learner",
                                          "speaker": original["turns"][index]["speaker"],
                                          "study": copy["study"], "native": copy["native"], **copy["aids"]})
                source_turn = original["turns"][index]
                if index == 4:
                    self.assertEqual(row["source"]["expectedParent"], source_turn)
                    for key, (start, end) in row["source"]["spans"].items():
                        self.assertEqual(phrase[key].encode("utf-8"), source_turn[key][start:end].encode("utf-8"))
                else:
                    for key, value in source_turn.items():
                        self.assertEqual(phrase[key], value)
                if index == 2:
                    variant = next(u for u in raw["units"] if u["id"] == prefix + "-09")["variants"][0]
                    for key in ("study", "native", "phon", "reading"):
                        if key in variant:
                            self.assertEqual(phrase[key].encode("utf-8"), variant[key].encode("utf-8"))
            self.assertEqual(len(pair["preparation"]), 11)
            self.assertEqual(len(pair["bridgeUnits"]), 2)
            self.assertEqual([step["kind"] for step in pair["steps"]],
                             ["listen-whole-dialogue", "reply-with-help", "reply-without-model"])
            for phase in pair["steps"]:
                self.assertEqual(phase["turns"], expected_ids)
            self.assertEqual([[a["utteranceId"] for a in item["answerWith"]] for item in pair["received"]],
                             [[expected_ids[2]], [expected_ids[4]], []])
            self.assertTrue(all(item["countsAsProduction"] is False for item in pair["received"]))
            self.assertEqual(pair["nativeReview"]["status"], "pending")
            self.assertIs(pair["nativeReview"]["productionApproved"], False)
        self.assertEqual(sum(len(pair["phrases"]) for pair in self.bundle["pairs"]), 49)

    def test_all_ten_source_byte_hashes_are_independently_verified(self):
        manifest = self.bundle["sourceFilesSha256"]
        self.assertEqual(len(manifest), 10)
        for path, digest in manifest.items():
            self.assertEqual(hashlib.sha256(git_bytes(path)).hexdigest(), digest)
        with patch.object(runtime.subprocess, "check_output", return_value=b"{\"mutated\":true}"):
            with self.assertRaisesRegex(ValueError, "Source SHA256 mismatch"):
                runtime.read_sources(ROOT)

    def test_wrong_pair_and_role_fail(self):
        sources = self.changed()
        self.bank_row(sources, "L1-fr-en.json:L1-fr-en-d1:t0")["nativeLanguage"] = "zh"
        with self.assertRaisesRegex(ValueError, "Wrong bank pair"):
            runtime.build_bundle(sources)
        sources = self.changed()
        sources[runtime.PLAN]["scenes"][0]["dialogue"]["learnerRole"] = "B"
        with self.assertRaisesRegex(ValueError, "Wrong scene role"):
            runtime.build_bundle(sources)

    def test_missing_reading_and_changed_unicode_aid_fail(self):
        sources = self.changed()
        del self.bank_row(sources, "L1-fr-zh.json:L1-fr-zh-d1:t0")["copy"]["aids"]["reading"]
        with self.assertRaisesRegex(ValueError, "all exact source aids"):
            runtime.build_bundle(sources)
        sources = self.changed()
        aids = self.bank_row(sources, "L1-fr-en.json:L1-fr-en-d1:t0")["copy"]["aids"]
        aids["phon"] = unicodedata.normalize("NFD", aids["phon"])
        with self.assertRaisesRegex(ValueError, "all exact source aids"):
            runtime.build_bundle(sources)

    def test_order_must_match_variant_and_dialogue(self):
        sources = self.changed()
        raw = sources["melunga_deploy/content/conversation/L1-fr-ko.json"]
        next(unit for unit in raw["units"] if unit["id"] == "L1-fr-ko-09")["variants"][0]["reading"] += " "
        with self.assertRaisesRegex(ValueError, "both whole variant and original scene"):
            runtime.build_bundle(sources)

    def test_raw_parent_and_coherent_shifted_fragment_span_fail(self):
        sources = self.changed()
        row = self.bank_row(sources, "L1-fr-en.json:L1-fr-en-d1:t4:refusal")
        row["source"]["expectedParent"]["phon"] += " "
        with self.assertRaisesRegex(ValueError, "raw parent changed"):
            runtime.build_bundle(sources)
        sources = self.changed()
        # Even a self-consistent new slice is not the reviewed linguistic split.
        row = self.bank_row(sources, "L1-fr-zh.json:L1-fr-zh-d1:t4:refusal")
        row["source"]["spans"]["reading"][1] -= 1
        row["copy"]["aids"]["reading"] = row["copy"]["aids"]["reading"][:-1]
        with self.assertRaisesRegex(ValueError, "exact reviewed Unicode spans"):
            runtime.build_bundle(sources)

    def test_missing_fragment_aid_and_reconstruction_separator_fail(self):
        sources = self.changed()
        del self.bank_row(sources, "L1-fr-ja.json:L1-fr-ja-d1:t4:price")["copy"]["aids"]["reading"]
        with self.assertRaisesRegex(ValueError, "every exact source aid slice"):
            runtime.build_bundle(sources)
        sources = self.changed()
        sources[runtime.PLAN]["scenes"][3]["splitReconstruction"]["separators"]["study"] = " "
        with self.assertRaisesRegex(ValueError, "separators must reconstruct"):
            runtime.build_bundle(sources)

    def test_unprepared_answer_and_price_as_milk_reply_fail(self):
        sources = self.changed()
        scene = sources[runtime.PLAN]["scenes"][0]
        scene["dialogue"]["received"][0]["answerWith"][0]["preparedInStep"] = "missing-preparation"
        with self.assertRaisesRegex(ValueError, "unprepared step"):
            runtime.build_bundle(sources)
        sources = self.changed()
        scene = sources[runtime.PLAN]["scenes"][0]
        scene["dialogue"]["received"][1]["answerWith"] = [{
            "utteranceId": "L1-fr-en.json:L1-fr-en-d1:t4:price", "expectedStudy": "How much is it?",
            "preparedInStep": "L1-fr-en-cafe-prepare-prepare-price"}]
        with self.assertRaisesRegex(ValueError, "milk with refusal only"):
            runtime.build_bundle(sources)

    def test_received_cannot_be_required_production(self):
        sources = self.changed()
        sources[runtime.PLAN]["scenes"][0]["dialogue"]["preparation"][2]["requiresProduction"] = True
        with self.assertRaisesRegex(ValueError, "cannot require production"):
            runtime.build_bundle(sources)

    def test_reproducible_build_never_changes_app_decks_or_canonical_sources(self):
        gitdir = subprocess.check_output(["git", "-C", str(ROOT), "rev-parse", "--absolute-git-dir"], text=True).strip()
        app_before = (ROOT / "melunga_deploy/app.html").read_bytes()
        decks_before = re.search(rb"\bvar DECKS = (.+?);\r?\n", app_before).group(1)
        self.assertGreater(len(decks_before), 1000)
        with tempfile.TemporaryDirectory() as directory:
            fixture = Path(directory)
            (fixture / ".git").write_text("gitdir: " + gitdir + "\n", encoding="utf-8")
            app = fixture / "melunga_deploy/app.html"
            app.parent.mkdir(parents=True)
            app.write_bytes(app_before)
            for path in self.bundle["sourceFilesSha256"]:
                if "/conversation/" in path:
                    file = fixture / path
                    file.parent.mkdir(parents=True, exist_ok=True)
                    file.write_bytes(git_bytes(path))
            # A bad local source proves this does not depend on a preview checkout.
            local_plan = fixture / "docs/progression-complete/l1-bridges.json"
            local_plan.parent.mkdir(parents=True)
            local_plan.write_text("invalid and deliberately ignored local source", encoding="utf-8")

            def preserved_files():
                return {str(path.relative_to(fixture)): path.read_bytes() for path in fixture.rglob("*")
                        if path.is_file() and path.relative_to(fixture) != runtime.OUTPUT}

            before = preserved_files()
            command = [sys.executable, str(SCRIPT), "--root", str(fixture)]
            subprocess.run(command, check=True, capture_output=True)
            self.assertEqual((fixture / runtime.OUTPUT).read_bytes(), self.bundle_bytes)
            subprocess.run(command, check=True, capture_output=True)
            subprocess.run(command + ["--check"], check=True, capture_output=True)
            self.assertEqual(preserved_files(), before)
            self.assertEqual(app.read_bytes(), app_before)
            self.assertEqual(re.search(rb"\bvar DECKS = (.+?);\r?\n", app.read_bytes()).group(1), decks_before)
            target = fixture / runtime.OUTPUT
            target.write_bytes(self.bundle_bytes + b" ")
            failed = subprocess.run(command + ["--check"], capture_output=True)
            self.assertNotEqual(failed.returncode, 0)
            self.assertEqual(target.read_bytes(), self.bundle_bytes + b" ")
            self.assertEqual(preserved_files(), before)


if __name__ == "__main__":
    unittest.main()

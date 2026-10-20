import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


SCRIPT = Path(__file__).with_name("refresh_family_metadata.py")
SPEC = importlib.util.spec_from_file_location("family_metadata", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def fixture():
    # The two identical texts deliberately have different levels.
    decks = {"fr": [{"t": "Bonjour.", "lv": 1, "phon": "bon-jour"},
                    {"t": "Bonjour.", "lv": 9, "phon": "other context"}]}
    families = {"version": 2, "languages": {"fr": {"families": [{
        "id": "EXAMPLE", "pathLv": 3, "frame": "Une phrase",
        "cards": [{"step": 1, "target": "Bonjour.", "sourceIndex": 1,
                   "currentLevel": 9, "french": "Bonjour."}]}]}}}
    return decks, families


def javascript(decks, families):
    return ("// unchanged prefix\nvar DECKS = " + json.dumps(decks) + ";\n"
            "var PEDAGOGY_FAMILIES = " + json.dumps(families) + ";\n"
            "function untouched() { return 42; }\n")


class MetadataTests(unittest.TestCase):
    def test_first_duplicate_matches_runtime_without_changing_learning_content(self):
        decks, families = fixture()
        source = javascript(decks, families)
        result, counts = MODULE.refresh(source)
        actual, start, end = MODULE.extract_object(result, "PEDAGOGY_FAMILIES")
        expected = copy.deepcopy(families)
        ref = expected["languages"]["fr"]["families"][0]["cards"][0]
        ref.update(sourceIndex=0, currentLevel=1)
        self.assertEqual(actual, expected)
        self.assertEqual(MODULE.extract_object(result, "DECKS")[0], decks)
        _, old_start, old_end = MODULE.extract_object(source, "PEDAGOGY_FAMILIES")
        self.assertEqual(result[:start], source[:old_start])
        self.assertEqual(result[end:], source[old_end:])
        self.assertEqual(counts["incorrectReferences"], 1)

    def test_correct_index_does_not_hide_an_incorrect_level(self):
        decks, families = fixture()
        ref = families["languages"]["fr"]["families"][0]["cards"][0]
        ref["sourceIndex"] = 0
        _, counts = MODULE.refresh(javascript(decks, families))
        self.assertEqual(counts["sourceIndexChanges"], 0)
        self.assertEqual(counts["currentLevelChanges"], 1)
        self.assertEqual(counts["incorrectReferences"], 1)

    def run_cli(self, content, *arguments):
        with tempfile.TemporaryDirectory() as directory:
            app = Path(directory) / "app.html"
            app.write_text(content, encoding="utf-8")
            process = subprocess.run([sys.executable, str(SCRIPT), "--app", str(app), *arguments],
                                     capture_output=True, text=True)
            return process, app.read_text(encoding="utf-8")

    def test_default_check_is_read_only(self):
        source = javascript(*fixture())
        process, after = self.run_cli(source)
        self.assertEqual(process.returncode, 1)
        self.assertEqual(after, source)

    def test_write_then_check_is_idempotent(self):
        source = javascript(*fixture())
        process, after = self.run_cli(source, "--write")
        self.assertEqual(process.returncode, 0)
        again, same = self.run_cli(after, "--write")
        self.assertEqual(again.returncode, 0)
        self.assertEqual(same, after)
        self.assertEqual(json.loads(again.stdout)["incorrectReferences"], 0)
        check, same = self.run_cli(after, "--check")
        self.assertEqual(check.returncode, 0)
        self.assertEqual(same, after)

    def test_missing_target_stops_before_any_write(self):
        decks, families = fixture()
        families["languages"]["fr"]["families"][0]["cards"].append(
            {"target": "Absent.", "sourceIndex": 0, "currentLevel": 1})
        source = javascript(decks, families)
        process, after = self.run_cli(source, "--write")
        self.assertEqual(process.returncode, 2)
        self.assertIn("missing target", process.stderr)
        self.assertEqual(after, source)

    def test_invalid_catalogue_level_stops_before_any_write(self):
        decks, families = fixture()
        decks["fr"][0]["lv"] = 11
        source = javascript(decks, families)
        process, after = self.run_cli(source, "--write")
        self.assertEqual(process.returncode, 2)
        self.assertEqual(after, source)

    def test_invalid_source_stops_before_any_write(self):
        source = "var DECKS = {broken;\n"
        process, after = self.run_cli(source, "--write")
        self.assertEqual(process.returncode, 2)
        self.assertEqual(after, source)


if __name__ == "__main__":
    unittest.main()

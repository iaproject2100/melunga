"""Release decisions bind individual scenes; synthetic approvals are test-only."""

from copy import deepcopy
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

import build_l1_release as release


class ReleaseTests(unittest.TestCase):
    def setUp(self):
        self.bundle = json.loads((release.ROOT / release.BUNDLE).read_text())
        self.manifest = json.loads((release.ROOT / release.MANIFEST).read_text())
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.evidence = self.root / "synthetic-test-only.txt"
        self.evidence.write_text("Synthetic decision fixture, not a human review or publication authorization.\n")

    def approve(self, index, kind):
        self.manifest["pairs"][index][kind] = {
            "status": "approved", "sceneSha256": release.scene_sha256(self.bundle["pairs"][index]), "evidence": {
                "file": self.evidence.name,
                "sha256": hashlib.sha256(self.evidence.read_bytes()).hexdigest(),
            },
        }

    def enabled(self):
        return release.release_pairs(self.manifest, self.bundle, self.root)

    def test_delivered_decisions_are_all_pending(self):
        for row in self.manifest["pairs"]:
            for kind in ("nativeReview", "kartechApproval"):
                self.assertEqual(row[kind], {"status": "pending", "evidence": None})
        self.assertEqual(self.enabled(), [])
        self.assertEqual((release.ROOT / release.OUTPUT).read_text(), release.render([]))

    def test_native_review_alone_does_not_activate(self):
        self.approve(0, "nativeReview")
        self.assertEqual(self.enabled(), [])

    def test_publication_approval_without_review_is_rejected(self):
        self.approve(0, "kartechApproval")
        with self.assertRaisesRegex(ValueError, "favorable native review"):
            self.enabled()

    def test_each_scene_can_be_activated_independently(self):
        original = deepcopy(self.manifest)
        for index, pair in enumerate(release.PAIRS):
            with self.subTest(pair=pair):
                self.manifest = deepcopy(original)
                self.approve(index, "nativeReview")
                self.approve(index, "kartechApproval")
                self.assertEqual(self.enabled(), [pair])

    def test_pending_or_changes_in_one_language_do_not_block_another(self):
        self.approve(0, "nativeReview")
        self.approve(0, "kartechApproval")
        self.manifest["pairs"][1]["nativeReview"]["status"] = "changes-requested"
        self.bundle["pairs"][1]["phrases"][0]["study"] += " [synthetic change]"
        self.manifest["pairs"][1]["sceneSha256"] = release.scene_sha256(self.bundle["pairs"][1])
        self.assertEqual(self.enabled(), [release.PAIRS[0]])

    def test_changing_study_phonetic_reading_role_or_order_invalidates_review(self):
        self.approve(0, "nativeReview")
        self.approve(0, "kartechApproval")
        original = deepcopy(self.bundle)
        for field in ("study", "phon", "reading", "speaker"):
            with self.subTest(field=field):
                self.bundle = deepcopy(original)
                self.bundle["pairs"][0]["phrases"][0][field] = "synthetic altered value"
                with self.assertRaisesRegex(ValueError, "scene changed"):
                    self.enabled()
        self.bundle = deepcopy(original)
        self.bundle["pairs"][0]["preparation"].reverse()
        with self.assertRaisesRegex(ValueError, "scene changed"):
            self.enabled()

    def test_missing_or_changed_evidence_is_rejected(self):
        self.approve(0, "nativeReview")
        self.evidence.write_text("Changed synthetic evidence")
        with self.assertRaisesRegex(ValueError, "evidence hash mismatch"):
            self.enabled()
        self.evidence.unlink()
        with self.assertRaisesRegex(ValueError, "evidence file missing"):
            self.enabled()

    def test_approval_requires_evidence(self):
        self.manifest["pairs"][0]["nativeReview"]["status"] = "approved"
        self.manifest["pairs"][0]["nativeReview"]["sceneSha256"] = self.manifest["pairs"][0]["sceneSha256"]
        with self.assertRaisesRegex(ValueError, "evidence required"):
            self.enabled()

    def test_updating_snapshot_hash_cannot_reuse_an_old_approval(self):
        self.approve(0, "nativeReview")
        self.approve(0, "kartechApproval")
        self.bundle["pairs"][0]["phrases"][0]["phon"] += " synthetic change"
        self.manifest["pairs"][0]["sceneSha256"] = release.scene_sha256(self.bundle["pairs"][0])
        with self.assertRaisesRegex(ValueError, "another scene version"):
            self.enabled()

    def test_invalid_status_or_pair_is_rejected(self):
        self.manifest["pairs"][0]["nativeReview"]["status"] = "probably fine"
        with self.assertRaisesRegex(ValueError, "invalid status"):
            self.enabled()
        self.manifest["pairs"][0]["nativeReview"]["status"] = "pending"
        self.manifest["pairs"][0]["id"] = "fr-de"
        with self.assertRaisesRegex(ValueError, "release pairs"):
            self.enabled()

    def test_missing_duplicate_and_extra_release_records_are_rejected(self):
        original = deepcopy(self.manifest["pairs"])
        for rows in (original[:-1], original + [original[0]], [original[0]] * 7):
            with self.subTest(count=len(rows)):
                self.manifest["pairs"] = deepcopy(rows)
                with self.assertRaises(ValueError):
                    self.enabled()

    def test_evidence_cannot_escape_repository(self):
        self.approve(0, "nativeReview")
        for path in ("/tmp/elsewhere", "../elsewhere"):
            with self.subTest(path=path):
                self.manifest["pairs"][0]["nativeReview"]["evidence"]["file"] = path
                with self.assertRaisesRegex(ValueError, "repository-relative"):
                    self.enabled()

    def test_build_check_runs_from_site_base_and_refuses_changed_material(self):
        script = self.root / "tools/pedagogy/build_l1_release.py"
        script.parent.mkdir(parents=True)
        shutil.copyfile(release.ROOT / "tools/pedagogy/build_l1_release.py", script)
        for relative in (release.MANIFEST, release.BUNDLE, release.OUTPUT):
            target = self.root / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(release.ROOT / relative, target)
        command = [sys.executable, "../tools/pedagogy/build_l1_release.py", "--check"]
        base = self.root / "melunga_deploy"
        result = subprocess.run(command, cwd=base, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        path = self.root / release.BUNDLE
        altered = json.loads(path.read_text())
        altered["pairs"][0]["phrases"][0]["study"] += " synthetic stale material"
        path.write_text(json.dumps(altered, ensure_ascii=False))
        result = subprocess.run(command, cwd=base, capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("scene changed", result.stderr)


if __name__ == "__main__":
    unittest.main()

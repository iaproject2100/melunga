"""Owner-instruction activation; no individual reviewer or evidence file gate."""
from copy import deepcopy
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

    def enabled(self):
        return release.release_pairs(self.manifest, self.bundle)

    def pending(self):
        for row in self.manifest['pairs']:
            row['kartechApproval'] = {'status': 'pending'}

    def approve(self, index):
        self.manifest['pairs'][index]['kartechApproval'] = {
            'status': 'approved', 'actor': 'Kartech', 'method': 'direct-instruction',
            'sceneSha256': release.scene_sha256(self.bundle['pairs'][index]),
        }

    def test_delivered_owner_instruction_activates_all_seven(self):
        self.assertEqual(self.enabled(), list(release.PAIRS))
        self.assertEqual((release.ROOT / release.OUTPUT).read_text(), release.render(list(release.PAIRS)))
        self.assertTrue(all('evidence' not in row['kartechApproval'] for row in self.manifest['pairs']))

    def test_no_external_evidence_or_named_native_reviewer_is_required(self):
        for row in self.manifest['pairs']:
            row.pop('nativeReview', None)
            row['kartechApproval']['evidence'] = {'file': '/nonexistent/not-required', 'sha256': 'not-required'}
        self.assertEqual(self.enabled(), list(release.PAIRS))

    def test_native_review_metadata_cannot_activate_a_scene(self):
        self.pending()
        for row in self.manifest['pairs']:
            row['nativeReview'] = {'status': 'approved'}
        self.assertEqual(self.enabled(), [])

    def test_native_review_metadata_does_not_override_direct_owner_instruction(self):
        for row in self.manifest['pairs']:
            row['nativeReview'] = {'status': 'pending'}
        self.assertEqual(self.enabled(), list(release.PAIRS))

    def test_each_scene_can_still_be_activated_independently(self):
        original = deepcopy(self.manifest)
        for index, pair in enumerate(release.PAIRS):
            with self.subTest(pair=pair):
                self.manifest = deepcopy(original)
                self.pending()
                self.approve(index)
                self.assertEqual(self.enabled(), [pair])

    def test_withdrawing_one_instruction_keeps_the_other_six_active(self):
        self.manifest['pairs'][1]['kartechApproval'] = {'status': 'withheld'}
        self.assertEqual(self.enabled(), [pair for pair in release.PAIRS if pair != 'fr-es'])

    def test_owner_must_be_explicit_and_cannot_be_inferred_from_review(self):
        for key, value in [('method', 'native-review'), ('actor', 'someone-else')]:
            with self.subTest(key=key):
                original = deepcopy(self.manifest)
                self.manifest['pairs'][0]['kartechApproval'][key] = value
                with self.assertRaisesRegex(ValueError, 'direct owner instruction required'):
                    self.enabled()
                self.manifest = original

    def test_changed_phrase_aid_reading_role_or_order_is_still_rejected(self):
        original = deepcopy(self.bundle)
        for field in ('study', 'phon', 'reading', 'speaker'):
            with self.subTest(field=field):
                self.bundle = deepcopy(original)
                self.bundle['pairs'][0]['phrases'][0][field] = 'synthetic altered value'
                with self.assertRaisesRegex(ValueError, 'scene changed'):
                    self.enabled()
        self.bundle = deepcopy(original)
        self.bundle['pairs'][0]['preparation'].reverse()
        with self.assertRaisesRegex(ValueError, 'scene changed'):
            self.enabled()

    def test_refreshing_snapshot_cannot_reuse_instruction_for_old_version(self):
        self.bundle['pairs'][0]['phrases'][0]['phon'] += ' synthetic change'
        self.manifest['pairs'][0]['sceneSha256'] = release.scene_sha256(self.bundle['pairs'][0])
        with self.assertRaisesRegex(ValueError, 'another scene version'):
            self.enabled()

    def test_one_revised_scene_can_be_held_without_blocking_the_other_six(self):
        self.bundle['pairs'][0]['phrases'][0]['study'] += ' synthetic change'
        self.manifest['pairs'][0]['sceneSha256'] = release.scene_sha256(self.bundle['pairs'][0])
        self.manifest['pairs'][0]['kartechApproval'] = {'status': 'pending'}
        self.assertEqual(self.enabled(), list(release.PAIRS[1:]))

    def test_invalid_status_missing_duplicate_or_extra_pair_is_rejected(self):
        original = deepcopy(self.manifest)
        self.manifest['pairs'][0]['kartechApproval']['status'] = 'probably fine'
        with self.assertRaisesRegex(ValueError, 'invalid owner decision'):
            self.enabled()
        for rows in (original['pairs'][:-1], original['pairs'] + [original['pairs'][0]], [original['pairs'][0]] * 7):
            self.manifest = deepcopy(original)
            self.manifest['pairs'] = rows
            with self.assertRaises(ValueError):
                self.enabled()

    def test_old_evidence_policy_cannot_silently_enable_the_new_manifest(self):
        self.manifest['version'] = 1
        with self.assertRaisesRegex(ValueError, 'Invalid release manifest'):
            self.enabled()

    def test_node_and_python_agree_for_every_activation_subset(self):
        cases = []
        expected = []
        for mask in range(1 << len(release.PAIRS)):
            manifest = deepcopy(self.manifest)
            for index, row in enumerate(manifest['pairs']):
                if not mask & (1 << index):
                    row['kartechApproval'] = {'status': 'pending'}
            cases.append(manifest)
            expected.append(release.release_pairs(manifest, self.bundle))
        checker = release.ROOT / 'melunga_deploy/check-l1-release.cjs'
        script = "const c=require(process.argv[1]),fs=require('node:fs'),d=JSON.parse(fs.readFileSync(0,'utf8'));console.log(JSON.stringify(d.cases.map(m=>c.releasePairs(m,d.bundle))));"
        result = subprocess.run(['node', '-e', script, str(checker)], input=json.dumps({'bundle': self.bundle, 'cases': cases}, ensure_ascii=False), capture_output=True, text=True, check=True)
        self.assertEqual(json.loads(result.stdout), expected)

    def test_node_build_check_is_cwd_independent_and_detects_stale_activation(self):
        files = [release.MANIFEST, release.BUNDLE, release.OUTPUT,
                 Path('melunga_deploy/check-l1-release.cjs'), Path('tools/pedagogy/build_l1_release.py')]
        for relative in files:
            target = self.root / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(release.ROOT / relative, target)
        command = ['node', str(self.root / 'melunga_deploy/check-l1-release.cjs')]
        for cwd in (self.root, self.root / 'melunga_deploy', Path('/tmp')):
            result = subprocess.run(command, cwd=cwd, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
        # A changed selection must fail until the artifact is regenerated.
        manifest_path = self.root / release.MANIFEST
        altered_manifest = deepcopy(self.manifest)
        altered_manifest['pairs'][0]['kartechApproval'] = {'status': 'withheld'}
        manifest_path.write_text(json.dumps(altered_manifest, ensure_ascii=False))
        result = subprocess.run(command, capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Release script differs', result.stderr)
        manifest_path.write_text(json.dumps(self.manifest, ensure_ascii=False))
        bundle_path = self.root / release.BUNDLE
        altered = deepcopy(self.bundle)
        altered['pairs'][0]['phrases'][0]['study'] += ' synthetic stale material'
        bundle_path.write_text(json.dumps(altered, ensure_ascii=False))
        for check in (command, [sys.executable, str(self.root / 'tools/pedagogy/build_l1_release.py'), '--check']):
            result = subprocess.run(check, capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('scene changed', result.stderr)


if __name__ == '__main__':
    unittest.main()

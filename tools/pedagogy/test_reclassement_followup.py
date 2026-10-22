"""Independent tests of weighting, rounding and frozen length replay."""
from copy import deepcopy
from fractions import Fraction
import unittest
import tempfile
from pathlib import Path

from audit_reclassement_followup import (
    build_report, canonical_sources, checked_units, decimal_tenth, git_bytes,
    inversions, length, mean, render_markdown, ROOT, SNAPSHOT, RUNTIME,
)
import json


class LengthReplayTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report = build_report()
        cls.canonical, _ = canonical_sources()
        cls.route = json.loads(git_bytes(ROOT, SNAPSHOT, RUNTIME))

    def test_latin_contract_apostrophe_and_hyphen_are_boundaries(self):
        self.assertEqual(length("I'd like a coffee.", 'en'), 5)
        self.assertEqual(length("D'accord, rendez-vous demain.", 'fr'), 5)

    def test_cjk_counts_letters_numbers_not_spaces_or_punctuation(self):
        self.assertEqual(length('我想喝水。', 'zh'), 4)
        self.assertEqual(length('물 좀 주세요.', 'ko'), 5)
        self.assertEqual(length('こんにちは。', 'ja'), 5)

    def test_means_weight_every_observation_not_preaveraged_groups(self):
        self.assertEqual(mean([1, 3, 3, 3]), Fraction(5, 2))
        self.assertNotEqual(mean([1, 3, 3, 3]), mean([1, 3]))

    def test_rounding_rule_is_explicit_and_distinct_from_exact_comparison(self):
        self.assertGreater(Fraction(113, 16), Fraction(141, 20))
        self.assertEqual(decimal_tenth(Fraction(113, 16)), decimal_tenth(Fraction(141, 20)))
        values = {level: Fraction(level) for level in range(1, 11)}
        values[2], values[3] = Fraction(113, 16), Fraction(141, 20)
        self.assertIn('L2>L3', inversions(values))
        self.assertNotIn('L2>L3', inversions(values, rounded=True))

    def test_reproduces_source_means_and_all_pairs(self):
        pairs = {pair['pair']: pair for pair in self.report['reviewed99478df']['pairs']}
        self.assertEqual(len(pairs), 7)
        self.assertEqual(pairs['fr-en']['source'][5]['mean']['decimal'], 7.0)
        self.assertEqual(pairs['fr-en']['source'][6]['mean']['decimal'], 8.375)
        self.assertEqual(pairs['fr-en']['source'][7]['mean']['decimal'], 7.9375)
        self.assertEqual(pairs['fr-it']['proposed'][6]['mean']['decimal'], 6.25)

    def test_all_841_units_11488_source_fields_are_checked(self):
        checked = self.report['reviewed99478df']
        self.assertEqual(checked['unitCount'], 841)
        self.assertEqual(checked['verifiedSourceFields'], 11488)
        rows, _ = checked_units(self.route, self.canonical)
        self.assertEqual(sum(len(row['phrases']) for _, row, _ in rows), 3364)

    def test_exact_and_rounded_counts_are_reported_separately(self):
        totals = self.report['reviewed99478df']['totals']
        self.assertEqual(totals['rawExactMeans'], {'before': 21, 'after': 17, 'created': 3, 'removed': 7})
        self.assertEqual(totals['roundedHalfUpTenths'], {'before': 21, 'after': 16, 'created': 3, 'removed': 8})

    def test_three_created_edges_are_not_hidden(self):
        pairs = {pair['pair']: pair for pair in self.report['reviewed99478df']['pairs']}
        self.assertEqual(pairs['fr-en']['inversions']['rawExactMeans']['created'], ['L6>L7'])
        self.assertEqual(pairs['fr-ko']['inversions']['rawExactMeans']['created'], ['L5>L6'])
        self.assertEqual(pairs['fr-zh']['inversions']['rawExactMeans']['created'], ['L8>L9'])

    def test_es_and_it_keep_all_four_exact_inversions(self):
        for pair in self.report['reviewed99478df']['pairs']:
            if pair['pair'] in ('fr-es', 'fr-it'):
                edges = pair['inversions']['rawExactMeans']
                self.assertEqual(len(edges['before']), 4)
                self.assertEqual(edges['before'], edges['after'])

    def test_units_reordered_inside_level_do_not_change_length_means(self):
        original = self.route['pairs'][0]['levels'][5]['units']
        before = mean(length(phrase['study'], 'en') for row in original for phrase in row['phrases'])
        after = mean(length(phrase['study'], 'en') for row in reversed(original) for phrase in row['phrases'])
        self.assertEqual(before, after)

    def test_cannot_measure_a_tampered_source_phrase(self):
        route = deepcopy(self.route)
        route['pairs'][0]['levels'][0]['units'][0]['phrases'][0]['study'] += ' extra'
        with self.assertRaises(ValueError):
            checked_units(route, self.canonical)

    def test_duplicate_unit_cannot_be_counted_twice(self):
        route = deepcopy(self.route)
        route['pairs'][0]['levels'][0]['units'].append(route['pairs'][0]['levels'][0]['units'][0])
        with self.assertRaises(ValueError):
            checked_units(route, self.canonical)

    def test_candidate_keeps_the_frozen_reference_and_gets_separate_tables(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'candidate.json'
            path.write_text(json.dumps(self.route), encoding='utf-8')
            report = build_report(candidate_path=path)
        self.assertEqual(report['reviewed99478df'], self.report['reviewed99478df'])
        self.assertEqual(report['candidate']['totals'], self.report['reviewed99478df']['totals'])
        self.assertIn('Inversions du candidat', render_markdown(report))


if __name__ == '__main__':
    unittest.main()

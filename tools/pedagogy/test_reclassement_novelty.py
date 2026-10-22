"""Test scope, type unions, segmentation and frozen novelty replay."""
from copy import deepcopy
from fractions import Fraction
import json
from pathlib import Path
import tempfile
import unittest

from audit_reclassement_novelty import (
    build_report, increases, inventory_statistics, render_markdown,
    rounded_percent, tokens, ROOT, SNAPSHOT, RUNTIME, git_bytes,
)


class NoveltyReplayTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report = build_report()
        cls.route = json.loads(git_bytes(ROOT, SNAPSHOT, RUNTIME))

    def test_latin_surface_forms_keep_accents_split_clitics_not_digits(self):
        self.assertEqual(tokens("J'ai aimé l'école, 12 fois — mais PAS tout.", 'fr'),
                         ['j', 'ai', 'aimé', 'l', 'école', 'fois', 'mais', 'pas', 'tout'])

    def test_korean_compatible_syllables_are_not_legacy_blocks(self):
        self.assertEqual(tokens('물 좀 주세요.', 'ko'), ['물', '좀', '주', '세', '요'])
        self.assertEqual(tokens('물 좀 주세요.', 'ko', legacy=True), ['물', '좀', '주세요'])

    def test_cjk_compounds_not_treated_as_known_meanings(self):
        self.assertEqual(tokens('中国人。', 'zh'), ['中', '国', '人'])
        self.assertEqual(tokens('こんにちは。', 'ja'), list('こんにちは'))
        self.assertEqual(tokens('明日 12:30', 'ja'), ['明', '日', '1', '2', '3', '0'])
        self.assertEqual(tokens('明日 12:30', 'ja', legacy=True), ['明', '日'])

    def test_distinct_types_not_occurrences_and_providers_are_not_additive(self):
        levels = [[('first', ['Hello hello', 'Hello!'], 1)],
                  [('second', ['hello there there'], 2), ('third', ['there friend'], 2)]]
        result = inventory_statistics(levels, 'en')
        row = result['levels'][1]
        self.assertEqual(row['newTypes'], ['friend', 'there'])
        self.assertEqual((row['newTypeCount'], row['typeCount']), (2, 3))
        self.assertEqual(row['ratio'], {'numerator': 2, 'denominator': 3})
        self.assertEqual(sum(p['newTypeCount'] for p in row['providers']), 3)
        self.assertEqual(row['newTypeProviders']['there'], ['second', 'third'])
        self.assertEqual(row['providers'][1]['exclusiveNewTypes'], ['friend'])

    def test_only_previous_levels_are_considered_seen(self):
        levels = [[('a', ['old'], 1)], [('b', ['new'], 2)], [('c', ['old new newer'], 3)]]
        rows = inventory_statistics(levels, 'en')['levels']
        self.assertEqual(rows[0]['newTypes'], ['old'])
        self.assertEqual(rows[1]['newTypes'], ['new'])
        self.assertEqual(rows[2]['newTypes'], ['newer'])

    def test_provider_order_inside_level_does_not_change_ratio(self):
        levels = [[('first', ['known'], 1)],
                  [('a', ['known new'], 2), ('b', ['other new'], 2)]]
        before = inventory_statistics(levels, 'en')
        levels[1].reverse()
        after = inventory_statistics(levels, 'en')
        self.assertEqual(before['levels'][1]['ratio'], after['levels'][1]['ratio'])
        self.assertEqual(before['increasesExact'], after['increasesExact'])

    def test_empty_level_has_zero_novel_forms(self):
        row = inventory_statistics([[]], 'en')['levels'][0]
        self.assertEqual((row['newTypeCount'], row['typeCount'], row['percent']), (0, 0, 0))

    def test_rounded_percentage_can_hide_small_exact_rise(self):
        values = [Fraction(39, 103), Fraction(50, 130)]
        self.assertEqual(increases(values), ['L1<L2'])
        self.assertEqual(increases(values, rounded=True), [])
        self.assertEqual([rounded_percent(value) for value in values], [38, 38])
        self.assertEqual(rounded_percent(Fraction(1, 8)), 13)

    def test_all_seven_reported_edge_lists_are_numerically_compatible(self):
        result = self.report['reviewed99478df']
        self.assertEqual((result['unitCount'], result['verifiedSourceFields']), (841, 11488))
        self.assertEqual(len(result['pairs']), 7)
        self.assertTrue(all(pair['roundedEdgesCompatibleWithReview'] for pair in result['pairs']))
        self.assertIn('hypothesis', self.report['method']['status'])

    def test_es_exact_numerators_and_rounding_caution(self):
        pair = next(pair for pair in self.report['reviewed99478df']['pairs'] if pair['pair'] == 'fr-es')
        stats = pair['scenarios']['variantsOnlyCompatibleHypothesis']
        rows = stats['proposed']['levels']
        self.assertEqual([(rows[l-1]['newTypeCount'], rows[l-1]['typeCount']) for l in (3, 4, 7, 8)],
                         [(59, 103), (70, 110), (37, 107), (39, 92)])
        self.assertIn('L9<L10', stats['proposed']['increasesExact'])
        self.assertNotIn('L9<L10', stats['proposed']['increasesRoundedIntegerPercent'])

    def test_sinophone_new_step_and_hidden_rounding_difference(self):
        pair = next(pair for pair in self.report['reviewed99478df']['pairs'] if pair['pair'] == 'zh-fr')
        stats = pair['scenarios']['variantsOnlyCompatibleHypothesis']['proposed']
        self.assertEqual([(stats['levels'][l-1]['newTypeCount'], stats['levels'][l-1]['typeCount'])
                          for l in (8, 9)], [(29, 85), (44, 124)])
        self.assertEqual(stats['increasesExact'], ['L3<L4', 'L8<L9'])
        self.assertEqual(stats['increasesRoundedIntegerPercent'], ['L8<L9'])

    def test_legacy_scope_does_not_silently_replace_new_hypothesis(self):
        pair = next(pair for pair in self.report['reviewed99478df']['pairs'] if pair['pair'] == 'fr-ko')
        main = pair['scenarios']['variantsOnlyCompatibleHypothesis']['source']['levels'][1]
        old = pair['scenarios']['variantsOnlyLegacyTokenizer']['source']['levels'][1]
        self.assertNotEqual(main['ratio'], old['ratio'])
        self.assertLess(main['percent'], 60)
        self.assertGreater(old['percent'], 80)

    def test_candidate_cannot_change_source_phonetics(self):
        tampered = deepcopy(self.route)
        tampered['pairs'][0]['levels'][0]['units'][0]['phrases'][0]['phon'] += ' changed'
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'candidate.json'
            path.write_text(json.dumps(tampered), encoding='utf-8')
            with self.assertRaises(ValueError):
                build_report(candidate_path=path)

    def test_candidate_keeps_frozen_statistics_separate(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'candidate.json'
            path.write_text(json.dumps(self.route), encoding='utf-8')
            result = build_report(candidate_path=path)
        self.assertEqual(result['reviewed99478df'], self.report['reviewed99478df'])
        self.assertEqual(result['candidate']['pairs'], result['reviewed99478df']['pairs'])
        self.assertIn('Candidat supplémentaire', render_markdown(result))


if __name__ == '__main__':
    unittest.main()

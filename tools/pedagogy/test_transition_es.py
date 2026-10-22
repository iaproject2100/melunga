"""Check ES transition scopes, counterfactuals and actual preparation evidence."""
from copy import deepcopy
import json
from pathlib import Path
import tempfile
import unittest

from audit_transition_es import (
    BASELINE, ROOT, RUNTIME, BRIDGE_SCENARIOS, bridge_records, build_report,
    chronological_preparation, embedded_json, git_bytes, ordered_rows,
    sequence_summary, type_summary, word_types,
)


class SpanishTransitionTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report = build_report()
        cls.route = json.loads(git_bytes(ROOT, BASELINE, RUNTIME))

    def test_exact_reviewed_transition_and_full_source_oracle(self):
        rows = self.report['reviewedA4f1ec4']['levels']
        self.assertEqual((self.report['verifiedUnits'], self.report['verifiedSourceFields']), (841, 11488))
        self.assertEqual((rows[2]['newTypeCount'], rows[2]['typeCount']), (59, 103))
        self.assertEqual((rows[3]['newTypeCount'], rows[3]['typeCount']), (70, 110))
        self.assertAlmostEqual(self.report['reviewedA4f1ec4']['gapsPercentagePoints']['L3<L4'],
                               6.3548102383, places=8)

    def test_scope_is_distinct_surface_forms_not_occurrences(self):
        self.assertEqual(word_types(['Como, como.', 'CÓMO?', '20 veces']), {'como', 'cómo', 'veces'})
        result = type_summary(word_types(['como como en casa']), {'en', 'casa'})
        self.assertEqual((result['newTypeCount'], result['typeCount']), (1, 3))
        self.assertEqual(result['newTypes'], ['como'])

    def test_level_three_loses_no_source_units(self):
        membership = next(row for row in self.report['decomposition']['membership'] if row['level'] == 3)
        self.assertEqual(membership['departed'], [])
        self.assertEqual(membership['entered'], ['L2-fr-es-08', 'L2-fr-es-12'])

    def test_four_entrants_are_not_the_entire_transition(self):
        core = self.report['decomposition']['L4CoreOnly']
        self.assertEqual((core['newTypeCount'], core['typeCount']), (46, 79))
        self.assertEqual(len(self.report['decomposition']['newTypesOnlyInFourEntrants']), 24)
        case = self.report['levelCounterfactuals']['all-four-services-to-L6']['statistics']
        self.assertIn('L3<L4', case['increasesExact'])
        self.assertIn('L4<L5', case['increasesExact'])

    def test_delaying_admin_pair_creates_another_step(self):
        case = self.report['levelCounterfactuals']['administrative-pair-to-L6']['statistics']
        self.assertEqual((case['levels'][3]['newTypeCount'], case['levels'][3]['typeCount']), (60, 99))
        self.assertIn('L3<L4', case['increasesExact'])
        self.assertIn('L4<L5', case['increasesExact'])

    def test_selected_preparations_retain_their_own_introduction_cost(self):
        case = self.report['cataloguePreparationScenarios']['three-selected-routine-preparations']
        self.assertEqual(case['additionalTypesOutsideCurrentL4Variants'], ['temprano'])
        self.assertEqual((case['combinedL4Texts']['newTypeCount'], case['combinedL4Texts']['typeCount']), (70, 111))
        self.assertTrue(case['levelMetricIsNotReplaced'])
        self.assertIn('como', case['typesIntroducedFirstByPreparations'])
        self.assertIn('levanto', case['typesIntroducedFirstByPreparations'])
        # The L2 train already contains temprano; adding its occurrence at L4
        # changes a denominator, not the inventory of novel forms.
        self.assertNotIn('temprano', case['typesIntroducedFirstByPreparations'])

    def test_preparation_occurs_only_before_its_own_variant(self):
        rows = [{'unitId': 'L4-test', 'proposedLevel': 4, 'variantOrder': [0, 1, 2, 3],
                 'phrases': [{'id': f'v{i}', 'study': text} for i, text in enumerate(
                     ['first', 'second', 'new target', 'last'])]}]
        bridges = [{'id': 'bridge', 'destinationUnitId': 'L4-test', 'beforeVariantIndex': 2,
                    'phrase': {'study': 'new'}}]
        trace = chronological_preparation(rows, bridges)['trace']
        self.assertEqual([row['kind'] for row in trace],
                         ['unit-variant', 'unit-variant', 'preparation', 'unit-variant', 'unit-variant'])
        self.assertEqual(trace[3]['withoutPreparation']['newTypeCount'], 2)
        self.assertEqual(trace[3]['withPreparation']['newTypeCount'], 1)
        self.assertEqual(trace[2]['novelAtThisPlannedStep']['newTypes'], ['new'])

    def test_opening_comparison_does_not_invent_a_lexical_advantage(self):
        rows = self.report['openingComparison']
        self.assertEqual(rows['currentOpening']['newTypes'], ['barrio'])
        self.assertEqual(rows['alternativePreparation']['newTypes'], ['como'])
        self.assertEqual(rows['alternativeTargetAfterPreparation']['newTypes'], ['normalmente'])

    def test_local_peak_reduction_is_not_a_claim_about_all_l4(self):
        rows = ordered_rows(self.route)
        before = sequence_summary(chronological_preparation(rows, []))
        for unit in rows:
            if unit['unitId'] == 'L4-fr-es-01':
                unit['variantOrder'] = [1, 2, 3, 0]
            if unit['unitId'] == 'L4-fr-es-03':
                unit['variantOrder'] = [3, 0, 1, 2]
        decks = embedded_json(git_bytes(ROOT, BASELINE, 'melunga_deploy/app.html').decode(), 'var DECKS =')
        preps = bridge_records(decks, BRIDGE_SCENARIOS['three-selected-routine-preparations'])
        after = sequence_summary(chronological_preparation(rows, preps))
        self.assertEqual((before['firstIntroductionTotal'], after['firstIntroductionTotal']), (70, 70))
        self.assertEqual((before['maximumNewTypesPerPresentation'], after['maximumNewTypesPerPresentation']), (4, 4))
        old = {unit['unitId']: unit for unit in before['units']}
        new = {unit['unitId']: unit for unit in after['units']}
        self.assertEqual((old['L4-fr-es-01']['maximumNewTypesPerPresentation'],
                          new['L4-fr-es-01']['maximumNewTypesPerPresentation']), (3, 2))
        self.assertEqual((old['L4-fr-es-03']['maximumNewTypesPerPresentation'],
                          new['L4-fr-es-03']['maximumNewTypesPerPresentation']), (2, 2))

    def candidate_with_preparation(self):
        route = deepcopy(self.route)
        unit = next(unit for pair in route['pairs'] for level in pair['levels'] for unit in level['units']
                    if unit['unitId'] == 'L4-fr-es-01')
        prep_id = unit['unitId'] + '-preparation-264'
        phrase_id = 'catalogue:DECKS.es:264:reader-fr'
        preparation = {
            'id': prep_id, 'beforeVariantIndex': 1,
            'source': {'type': 'catalogue-card', 'file': 'melunga_deploy/app.html',
                       'collection': 'DECKS.es', 'index': 264, 'indexBase': 0,
                       'sourceCommit': BASELINE, 'sourceLevel': 2,
                       'readerLanguage': 'fr', 'studyLanguage': 'es',
                       'fieldMap': {'study': 't', 'native': 'frm', 'phon': 'pf'}},
            'phrase': {'id': phrase_id, 'study': 'Como en casa.', 'native': 'je mange à la maison',
                       'phon': 'KO-mo én KA-ssa'},
            'understoodInStep': prep_id + '-understand', 'imitatedInStep': prep_id + '-imitate'}
        unit['preparations'] = [preparation]
        index = next(i for i, step in enumerate(unit['steps']) if step['id'] == unit['unitId'] + '-understand-1')
        unit['steps'][index:index] = [{'id': preparation[key], 'kind': kind, 'utterance': phrase_id}
                                    for key, kind in [('understoodInStep', 'understand'), ('imitatedInStep', 'imitate')]]
        return route, unit

    def run_candidate(self, route):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'candidate.json'
            path.write_text(json.dumps(route), encoding='utf-8')
            return build_report(candidate_path=path)

    def test_candidate_has_exact_catalogue_phrase_and_real_earlier_steps(self):
        route, _ = self.candidate_with_preparation()
        candidate = self.run_candidate(route)['candidate']
        self.assertEqual(candidate['insertedPreparationCount'], 1)
        self.assertEqual(candidate['statistics'], self.report['reviewedA4f1ec4'])
        self.assertEqual(candidate['chronologicalPreparations']['bridges'][0]['phrase']['phon'], 'KO-mo én KA-ssa')

    def test_candidate_cannot_rewrite_the_catalogue_phonetic(self):
        route, unit = self.candidate_with_preparation()
        unit['preparations'][0]['phrase']['phon'] += ' changed'
        with self.assertRaises(ValueError):
            self.run_candidate(route)

    def test_declared_preparation_without_actual_steps_is_not_counted(self):
        route, unit = self.candidate_with_preparation()
        unit['steps'] = [step for step in unit['steps'] if '-preparation-' not in step['id']]
        with self.assertRaises(ValueError):
            self.run_candidate(route)


if __name__ == '__main__':
    unittest.main()

"""Meaningful failure cases for the review-only reception contract."""
import copy
import json
from pathlib import Path
import sys
import unittest

sys.dont_write_bytecode = True
from prepare import HERE, ROOT, prepare
from received_contract import validate_received
from progression_contract import validate_progression
from review_edits import apply_editorial_amendments


class ReceivedContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        data, report = prepare()
        contracts = [json.loads((HERE / f'received-fr-{study}.json').read_text()) for study in ('zh', 'ko')]
        cls.base = data['pilots'], report['sources'], contracts

    def setUp(self):
        self.pilots, self.sources, self.contracts = copy.deepcopy(self.base)

    def check(self):
        return validate_received(ROOT, self.pilots, self.sources, self.contracts)

    def ko(self):
        return self.contracts[1]['received'][0]

    def reject(self):
        with self.assertRaises(ValueError):
            self.check()

    def test_valid_plan_and_explicit_no_reply_closing(self):
        result = self.check()
        self.assertEqual(result['answerReferences'], 4)
        self.assertEqual(result['noReplyClosings'], 2)
        self.assertFalse(result['learnerAcquisitionValidated'])

    def test_changed_expected_received_text(self):
        self.ko()['source']['expectedStudy'] = 'changed'
        self.reject()

    def test_wrong_reader_language(self):
        self.contracts[1]['nativeLanguage'] = 'en'
        self.reject()

    def test_wrong_original_learner_role(self):
        self.ko()['source']['learnerRole'] = 'B'
        self.reject()

    def test_learner_turn_cannot_be_received(self):
        self.ko()['source']['turnIndex'] = 0
        self.reject()

    def test_whole_unit_is_not_an_exact_answer(self):
        self.ko()['answerWith'][0] = {'unitId': 'L1-fr-ko-03', 'preparedInStep': 'ko-understand'}
        self.reject()

    def test_unknown_answer_reference(self):
        self.ko()['answerWith'][0]['utteranceId'] = 'missing'
        self.reject()

    def test_answer_text_mismatch(self):
        self.ko()['answerWith'][0]['expectedStudy'] = '물 주세요.'
        self.reject()

    def test_preparation_after_scene(self):
        self.ko()['answerWith'][0]['preparedInStep'] = 'ko-choice'
        self.reject()

    def test_source_id_cannot_hide_changed_preparation_text(self):
        step = next(s for s in self.pilots[1]['steps'] if s['id'] == 'ko-received')
        phrase = dict(step['utterances'][0], study='changed')
        step['utterances'] = [phrase]
        self.reject()

    def test_closing_does_not_allow_foreign_language_choice(self):
        source = next(s['expected'] for s in self.sources if s['id'] == 'L1-fr-ko-03-v0')
        self.pilots[0]['steps'][-1]['choices'][0]['utterance'] = source
        self.reject()

    def test_source_pair_mismatch_in_answer(self):
        next(s for s in self.sources if s['id'] == 'L1-fr-ko-03-v0')['nativeLanguage'] = 'en'
        self.reject()

    def test_received_is_not_productive_credit(self):
        self.ko()['countsAsProduction'] = True
        self.reject()

    def test_missing_analysis_flag(self):
        self.ko().pop('analyse')
        self.reject()

    def test_missing_answer_list(self):
        self.ko().pop('answerWith')
        self.reject()

    def test_duplicate_received_entry(self):
        self.contracts[1]['received'].append(copy.deepcopy(self.ko()))
        self.reject()

    def test_cannot_reclassify_question_as_final_closing(self):
        self.ko()['replyRequired'] = False
        self.ko()['answerWith'] = []
        self.reject()

    def test_response_must_follow_received_turn(self):
        scene = next(s for s in self.pilots[1]['steps'] if s['id'] == 'ko-visible')
        scene['utterances'].reverse()
        self.reject()

    def test_repeated_question_requires_another_reply(self):
        scene = next(s for s in self.pilots[1]['steps'] if s['id'] == 'ko-visible')
        scene['utterances'].append(scene['utterances'][0])
        self.reject()

    def test_repeated_question_with_both_prepared_replies_is_valid(self):
        scene = next(s for s in self.pilots[1]['steps'] if s['id'] == 'ko-visible')
        water = next(s['expected'] for s in self.sources if s['id'] == 'L1-fr-ko-03-v1')
        question, coffee, closing = scene['utterances']
        scene['utterances'] = [question, coffee, question, water, closing]
        self.assertEqual(self.check()['receivedSources'], 4)

    def test_introduction_cannot_be_an_arbitrary_later_presentation(self):
        self.ko()['introducedInStep'] = 'ko-visible'
        self.reject()

    def test_old_received_preparation_name_is_rejected(self):
        self.ko()['preparedInStep'] = self.ko()['introducedInStep']
        self.reject()

    def test_catalogue_reply_is_allowed_without_a_fake_unit(self):
        answer = self.contracts[0]['received'][0]['answerWith'][0]
        self.assertEqual(answer['utteranceId'], 'zh-deck-226')
        self.assertNotIn('unitId', answer)
        self.assertEqual(self.check()['answerReferences'], 4)

    def test_real_original_learner_b_receives_a(self):
        # Structural fixture only: final farewell of a real dialogue whose learner is B.
        path = ROOT / 'melunga_deploy/content/conversation/L10-fr-ko.json'
        dialogue = next(d for d in json.loads(path.read_text())['dialogues'] if d['id'] == 'L10-fr-ko-d2')
        self.assertEqual(dialogue['learnerRole'], 'B')
        turn = dialogue['turns'][8]
        self.assertEqual(turn['speaker'], 'A')
        phrase = dict(id='learner-b-farewell', kind='received', role='Un ami',
                      **{key: turn[key] for key in ('study', 'phon', 'native', 'reading')})
        pilot = {'id': 'structural-role-b-fixture', 'pair': {'native': 'fr', 'study': 'ko'},
                 'steps': [{'id': 'listen', 'utterances': [phrase]},
                           {'id': 'closing', 'scene': True, 'utterances': [phrase]}]}
        source = dict(id=phrase['id'], nativeLanguage='fr', studyLanguage='ko',
                      dialogueId=dialogue['id'], turnIndex=8, expected=phrase)
        contract = {'version': 2, 'sourceCommit': self.contracts[1]['sourceCommit'],
                    'nativeLanguage': 'fr', 'studyLanguage': 'ko',
                    'sceneId': pilot['id'], 'sceneType': 'recomposition-pilote',
                    'received': [{'utteranceId': phrase['id'],
                                  'source': {'type': 'dialogueTurn', 'level': 10,
                                             'dialogueId': dialogue['id'], 'turnIndex': 8,
                                             'learnerRole': 'B', 'expectedStudy': turn['study']},
                                  'analyse': False, 'countsAsProduction': False,
                                  'introducedInStep': 'listen', 'replyRequired': False, 'answerWith': []}]}
        result = validate_received(ROOT, [pilot], [source], [contract])
        self.assertEqual(result['receivedSources'], 1)


class PilotProgressionAndEditsTest(unittest.TestCase):
    def setUp(self):
        self.data, self.report = prepare()

    def test_both_pilots_follow_the_same_stages(self):
        stages = [[s['stage'] for s in p['steps']] for p in self.data['pilots']]
        self.assertEqual(stages[0], stages[1])
        self.assertEqual(validate_progression(self.data['pilots'])['completePilotScenes'], 4)

    def test_early_chinese_exchange_is_rejected(self):
        steps = self.data['pilots'][0]['steps']
        scene = steps.pop(6)
        steps.insert(2, scene)
        with self.assertRaises(ValueError):
            validate_progression(self.data['pilots'])

    def test_missing_substitution_is_rejected(self):
        self.data['pilots'][0]['steps'] = [s for s in self.data['pilots'][0]['steps'] if s['stage'] != 'replace']
        with self.assertRaises(ValueError):
            validate_progression(self.data['pilots'])

    def test_half_cycle_is_rejected(self):
        self.data['pilots'][1]['steps'][6]['utterances'].pop()
        with self.assertRaises(ValueError):
            validate_progression(self.data['pilots'])

    def test_duplicate_choice_ids_are_rejected(self):
        step = next(s for s in self.data['pilots'][1]['steps'] if s.get('choices'))
        step['choices'][1]['id'] = step['choices'][0]['id']
        with self.assertRaises(ValueError):
            validate_progression(self.data['pilots'])

    def test_empty_choice_id_is_rejected(self):
        step = next(s for s in self.data['pilots'][1]['steps'] if s.get('choices'))
        step['choices'][0]['id'] = '  '
        with self.assertRaises(ValueError):
            validate_progression(self.data['pilots'])

    def test_source_and_proposed_phonetic_are_both_preserved(self):
        source = next(s for s in self.report['sources'] if s['id'] == 'zh-deck-226')
        self.assertEqual(source['original']['phon'], 'ouo chyang chyo chi')
        self.assertEqual(source['expected']['phon'], 'ouo chyang chyoou chi')
        self.assertEqual(self.report['editorialAmendments']['count'], 3)
        self.assertFalse(self.report['editorialAmendments']['sourceFilesChanged'])

    def test_unexpected_source_cannot_receive_an_editorial_patch(self):
        source = {'id': 'x', 'expected': {'study': 'x', 'phon': 'a', 'native': 'b', 'reading': 'c'}}
        plan = {'status': 'draft', 'changes': [{'id': 'change', 'utteranceId': 'x', 'field': 'phon',
                                              'expectedSource': 'wrong', 'proposed': 'd', 'reason': 'review'}]}
        with self.assertRaises(ValueError):
            apply_editorial_amendments([source], plan)
        self.assertEqual(source['expected']['phon'], 'a')

    def test_editorial_patch_cannot_change_studied_text(self):
        source = {'id': 'x', 'expected': {'study': 'x', 'phon': 'a', 'native': 'b', 'reading': 'c'}}
        plan = {'status': 'draft', 'changes': [{'id': 'change', 'utteranceId': 'x', 'field': 'study',
                                              'expectedSource': 'x', 'proposed': 'y', 'reason': 'review'}]}
        with self.assertRaises(ValueError):
            apply_editorial_amendments([source], plan)


if __name__ == '__main__':
    unittest.main(verbosity=2)

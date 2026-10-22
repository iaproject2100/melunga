#!/usr/bin/env python3
"""Mutation tests for L1 preparation, received replies and source integrity."""

import copy
import unittest

from guard_phonetics import read_json
from validate_l1_bridges import EXPECTED_COUNTS, OUT, ROOT, load_banks, validate


class L1BridgesTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.original = read_json(ROOT / OUT / 'l1-bridges.json')
        cls.original_bank = load_banks()

    def setUp(self):
        self.plan = copy.deepcopy(self.original)
        self.bank = self.original_bank.copy()
        self.scene = self.plan['scenes'][0]
        self.dialogue = self.scene['dialogue']
        self.received = self.dialogue['received']

    def rejects(self, message=None):
        with self.assertRaisesRegex(ValueError, message or '.'):
            validate(self.plan, self.bank)

    def bank_row(self, identity):
        self.bank[identity] = copy.deepcopy(self.bank[identity])
        return self.bank[identity]

    def test_complete_annex_has_four_prepared_learner_turns_per_scene(self):
        self.assertEqual(validate(self.plan, self.bank), EXPECTED_COUNTS)
        self.assertEqual(self.plan, self.original)
        for scene in self.plan['scenes']:
            kinds = [step['kind'] for step in scene['dialogue']['preparation']]
            self.assertEqual(kinds.count('understand'), 4)
            self.assertEqual(kinds.count('imitate'), 4)
            self.assertEqual(kinds.count('receive'), 3)

    def test_missing_scene_is_rejected(self):
        self.plan['scenes'].pop()
        self.rejects('seven')

    def test_duplicate_reader_study_pair_is_rejected(self):
        self.plan['scenes'][-1] = copy.deepcopy(self.scene)
        self.rejects('reader/study pair')

    def test_inactive_english_reader_pair_is_rejected(self):
        self.scene['nativeLanguage'] = 'en'
        self.rejects('reader/study pair')

    def test_snapshot_is_pinned(self):
        self.plan['sourceSnapshot'] = 'ea2619bc6f24e81c254ca00dc272dd76d35cc9a3'
        self.rejects('snapshot')

    def test_annex_cannot_claim_publication(self):
        self.plan['status'] = 'published'
        self.rejects('unpublished editorial review')

    def test_native_review_cannot_be_omitted(self):
        del self.scene['nativeReview']
        self.rejects()

    def test_native_review_cannot_be_claimed_as_approved(self):
        self.scene['nativeReview']['status'] = 'approved'
        self.rejects('native review must remain pending')

    def test_pinned_source_inventory_is_complete(self):
        self.plan['sourceFilesSha256'].pop(next(iter(self.plan['sourceFilesSha256'])))
        self.rejects()

    def test_source_file_hash_cannot_be_ignored(self):
        self.plan['sourceFilesSha256'][next(iter(self.plan['sourceFilesSha256']))] = '0' * 64
        self.rejects('original source file changed')

    def test_access_floor_cannot_be_changed(self):
        self.scene['accessFloor'] = 0
        self.rejects('access floor')

    def test_boolean_is_not_an_l1_level(self):
        self.scene['level'] = True
        self.rejects('access floor')

    def test_greeting_and_refusal_are_exactly_two_whole_expression_units(self):
        self.scene['bridgeUnits'].pop()
        self.rejects('greeting and refusal')

    def test_imitate_cannot_precede_understanding(self):
        steps = self.scene['bridgeUnits'][0]['steps']
        steps[0], steps[1] = steps[1], steps[0]
        self.rejects('preparation order')

    def test_unit_cannot_claim_replacement_between_expressions(self):
        self.scene['bridgeUnits'][0]['replacementClaim'] = True
        self.rejects('whole source expression')

    def test_unit_understanding_cannot_require_production(self):
        self.scene['bridgeUnits'][0]['steps'][0]['requiresProduction'] = True
        self.rejects('before imitation')

    def test_whole_phrase_recall_preserves_help(self):
        self.scene['bridgeUnits'][0]['steps'][-1]['canRestoreHelp'] = False
        self.rejects('preserve help')

    def test_duplicate_preparation_step_id_is_rejected(self):
        self.dialogue['preparation'][1]['id'] = self.dialogue['preparation'][0]['id']
        self.rejects('duplicate identity')

    def test_reusing_original_dialogue_identity_is_rejected(self):
        self.dialogue['dialogueId'] = self.dialogue['originalDialogueId']
        self.rejects('derived scene')

    def test_scene_and_derived_dialogue_identity_must_agree(self):
        self.scene['id'] = self.plan['scenes'][1]['id']
        self.rejects('derived scene')

    def test_bridge_unit_cannot_replace_an_original_unit_identity(self):
        self.scene['bridgeUnits'][0]['unitId'] = 'L1-fr-en-09'
        self.rejects('new identities')

    def test_learner_role_cannot_be_swapped(self):
        self.dialogue['learnerRole'] = 'B'
        self.rejects('learner role')

    def test_original_role_labels_must_remain_exact(self):
        self.dialogue['roles']['A'] = 'Serveur'
        self.rejects('role labels')

    def test_missing_price_preparation_is_rejected(self):
        price = self.scene['pricePreparation']['utteranceId']
        self.dialogue['preparation'] = [step for step in self.dialogue['preparation'] if step['utterance'] != price]
        self.rejects('every derived turn needs')

    def test_price_is_not_implicitly_prepared_by_unit_10(self):
        self.scene['pricePreparation']['utteranceId'] = 'L1-fr-en.json:L1-fr-en-10:v0'
        self.rejects('unit 10')

    def test_price_preparation_must_be_explicit(self):
        del self.scene['pricePreparation']
        self.rejects()

    def test_price_pointer_cannot_name_an_exchange_instead_of_preparation(self):
        self.scene['pricePreparation']['preparedInStep'] = 'reply-with-help'
        self.rejects('earlier dialogue preparation')

    def test_received_turn_cannot_require_production(self):
        self.dialogue['preparation'][2]['requiresProduction'] = True
        self.rejects('cannot require learner production')

    def test_understanding_is_whole_phrase_preparation(self):
        self.dialogue['preparation'][0]['wholePhrase'] = False
        self.rejects('reception/understanding')

    def test_preparation_cannot_reorder_refusal_and_price(self):
        steps = self.dialogue['preparation']
        steps[6:10] = steps[8:10] + steps[6:8]
        self.rejects('ordered whole-phrase preparation')

    def test_exchange_cannot_reorder_the_two_consecutive_learner_turns(self):
        refs = self.dialogue['steps'][1]['turns']
        refs[4], refs[5] = refs[5], refs[4]
        self.rejects('seven prepared source phrases in order')

    def test_exchange_cannot_use_the_unsplit_original_combined_turn(self):
        self.dialogue['steps'][0]['turns'][4:6] = ['L1-fr-en.json:L1-fr-en-d1:t4']
        self.rejects('seven prepared source phrases')

    def test_all_exchange_phases_must_preserve_learner_role(self):
        self.dialogue['steps'][0]['learnerRole'] = 'B'
        self.rejects('in order and role')

    def test_exchange_help_is_restorable(self):
        self.dialogue['steps'][-1]['canRestoreHelp'] = False
        self.rejects('help available')

    def test_missing_received_turn_is_not_implicit_closure(self):
        self.received.pop()
        self.rejects('three received turns')

    def test_duplicate_received_turn_is_rejected(self):
        self.received[-1] = copy.deepcopy(self.received[0])
        self.rejects('three received turns')

    def test_received_introduction_must_be_its_earlier_receive_phase(self):
        self.received[0]['introducedInStep'] = self.dialogue['preparation'][0]['id']
        self.rejects('earlier receive phase')

    def test_received_source_must_identify_original_dialogue(self):
        self.received[0]['source']['dialogueId'] = self.dialogue['dialogueId']
        self.rejects('received original source')

    def test_received_source_must_preserve_original_turn_and_role(self):
        self.received[0]['source']['turnIndex'] = 3
        self.received[0]['source']['learnerRole'] = 'B'
        self.rejects('received original source')

    def test_received_source_must_preserve_exact_studied_text(self):
        self.received[0]['source']['expectedStudy'] += ' '
        self.rejects('received original source')

    def test_received_source_cannot_come_from_another_level(self):
        self.received[0]['source']['level'] = 2
        self.rejects('received original source')

    def test_received_turns_never_count_as_production(self):
        self.received[0]['countsAsProduction'] = True
        self.rejects('cannot certify production')

    def test_received_turns_are_not_analysed(self):
        self.received[0]['analyse'] = True
        self.rejects('received content')

    def test_welcome_answer_list_cannot_be_omitted(self):
        del self.received[0]['answerWith']
        self.rejects()

    def test_welcome_requires_the_prepared_exact_order(self):
        self.received[0]['answerWith'] = []
        self.rejects('welcome requires the order')

    def test_milk_answer_is_only_the_refusal_and_never_the_price(self):
        self.received[1]['answerWith'][0]['utteranceId'] = self.scene['pricePreparation']['utteranceId']
        self.rejects('milk requires only refusal')

    def test_price_cannot_be_added_as_second_answer_to_milk(self):
        self.received[1]['answerWith'].append({'utteranceId': self.scene['pricePreparation']['utteranceId']})
        self.rejects('milk requires only refusal')

    def test_answer_expected_text_cannot_change(self):
        self.received[0]['answerWith'][0]['expectedStudy'] += ' '
        self.rejects('expectedStudy differs')

    def test_answer_must_link_to_that_exact_prepared_learner_phrase(self):
        self.received[0]['answerWith'][0]['preparedInStep'] = self.dialogue['preparation'][0]['id']
        self.rejects('exact whole learner phrase')

    def test_answer_pointer_cannot_use_a_unit_recall_or_acquisition_claim(self):
        self.received[0]['answerWith'][0]['preparedInStep'] = self.scene['bridgeUnits'][0]['steps'][-1]['id']
        self.rejects('earlier dialogue preparation')

    def test_final_amount_requires_an_explicit_empty_answer_list(self):
        del self.received[-1]['answerWith']
        self.rejects()

    def test_final_amount_cannot_require_a_reply(self):
        self.received[-1]['replyRequired'] = True
        self.rejects('false closing answer')

    def test_final_amount_cannot_have_an_implicit_or_invented_answer(self):
        self.received[-1]['answerWith'] = copy.deepcopy(self.received[0]['answerWith'])
        self.rejects('amount requires no reply')

    def test_editorial_recall_cannot_unlock_access(self):
        self.scene['bridgeUnits'][0]['steps'][-1]['gradesOrUnlocks'] = True
        self.rejects('cannot certify production or unlock access')

    def test_payment_unlock_cannot_be_added(self):
        self.plan['paymentUnlock'] = True
        self.rejects('paymentUnlock')

    def test_production_credit_cannot_be_added(self):
        self.received[0]['productionCredits'] = 1
        self.rejects('productionCredits')

    def test_preparation_cannot_be_claimed_as_acquisition(self):
        self.dialogue['learnerAcquisitionValidated'] = True
        self.rejects('cannot certify production')

    def test_bank_reader_pair_is_checked_independently(self):
        identity = self.scene['bridgeUnits'][0]['utteranceId']
        self.bank_row(identity)['nativeLanguage'] = 'en'
        self.rejects('reader/study pair')

    def test_bank_turn_locator_is_checked_against_original_source(self):
        identity = self.scene['bridgeUnits'][0]['utteranceId']
        self.bank_row(identity)['source']['turnIndex'] = 2
        self.rejects('Source phrase differs')

    def test_exact_order_cannot_be_replaced_with_another_unit_variant(self):
        identity = self.received[0]['answerWith'][0]['utteranceId']
        self.bank_row(identity)['source']['variantIndex'] = 1
        self.rejects('Source phrase differs')

    def test_fragment_copy_cannot_rewrite_phonetics(self):
        identity = self.scene['bridgeUnits'][1]['utteranceId']
        self.bank_row(identity)['copy']['aids']['phon'] += ' '
        self.rejects('Copy differs')

    def test_greeting_native_meaning_cannot_be_dropped(self):
        identity = self.scene['bridgeUnits'][0]['utteranceId']
        del self.bank_row(identity)['copy']['native']
        self.rejects('retain native meaning')

    def test_received_native_meaning_cannot_be_dropped(self):
        identity = self.received[0]['utteranceId']
        del self.bank_row(identity)['copy']['native']
        self.rejects('retain native meaning')

    def test_fragment_cannot_drop_a_source_aid(self):
        identity = self.scene['bridgeUnits'][1]['utteranceId']
        del self.bank_row(identity)['source']['spans']['phon']
        self.rejects('ALL present parent aid fields')

    def test_fragment_cannot_claim_the_other_speaker(self):
        identity = self.scene['bridgeUnits'][1]['utteranceId']
        self.bank_row(identity)['source']['learnerRole'] = 'B'
        self.rejects('learnerRole')

    def test_fragment_parent_must_be_the_exact_complete_source_turn(self):
        identity = self.scene['bridgeUnits'][1]['utteranceId']
        self.bank_row(identity)['source']['expectedParent']['study'] += ' '
        self.rejects('expectedParent')

    def test_fragment_split_cannot_change_original_spacing(self):
        self.scene['splitReconstruction']['separators']['study'] = ''
        self.rejects('entire original study')

    def test_valid_individual_slices_cannot_omit_the_start_of_the_original(self):
        identity = self.scene['bridgeUnits'][1]['utteranceId']
        row = self.bank_row(identity)
        row['source']['spans']['study'][0] = 1
        row['source']['expectedStudy'] = row['copy']['study'] = row['copy']['study'][1:]
        self.rejects('reviewed refusal/price split')

    def test_meaningful_price_words_cannot_be_hidden_in_a_split_separator(self):
        identity = self.scene['pricePreparation']['utteranceId']
        row = self.bank_row(identity)
        parent = row['source']['expectedParent']['study']
        row['source']['spans']['study'] = [len(parent) - 1, len(parent)]
        row['copy']['study'] = row['source']['expectedStudy'] = parent[-1:]
        refusal = self.scene['bridgeUnits'][1]['utteranceId']
        refusal_end = self.bank[refusal]['source']['spans']['study'][1]
        self.scene['splitReconstruction']['separators']['study'] = parent[refusal_end:-1]
        self.rejects('reviewed refusal/price split')

    def test_lossless_but_misaligned_phonetic_slices_are_rejected(self):
        refusal = self.bank_row(self.scene['bridgeUnits'][1]['utteranceId'])
        price = self.bank_row(self.scene['pricePreparation']['utteranceId'])
        parent = refusal['source']['expectedParent']['phon']
        refusal['source']['spans']['phon'] = [0, 1]
        refusal['copy']['aids']['phon'] = parent[:1]
        price['source']['spans']['phon'] = [1, len(parent)]
        price['copy']['aids']['phon'] = parent[1:]
        self.scene['splitReconstruction']['separators']['phon'] = ''
        self.rejects('reviewed refusal/price split')

    def test_declared_counts_cannot_replace_verified_counts(self):
        self.plan['counts']['received'] = 20
        self.rejects('counts differ')


if __name__ == '__main__':
    unittest.main(verbosity=2)

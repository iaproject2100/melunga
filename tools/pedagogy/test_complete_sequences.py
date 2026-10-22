#!/usr/bin/env python3
"""Negative checks for editorial preparation and source-role preservation."""
import copy
import json
from pathlib import Path
import unittest

from validate_complete_sequences import validate

OUT = Path(__file__).resolve().parents[2] / 'docs/progression-complete'


class CompleteSequencesTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.original = json.loads((OUT / 'sequences/seq-fr-ko.json').read_text())
        cls.bank = {row['id']: row for row in json.loads((OUT / 'banque-phrases.json').read_text())['entries']}

    def setUp(self):
        self.plan = copy.deepcopy(self.original)

    def rejects(self):
        with self.assertRaises(ValueError):
            validate(self.plan, self.bank)

    def test_original_plan_covers_every_dialogue_and_received_turn(self):
        result = validate(self.plan, self.bank)
        self.assertEqual(result['dialogues'], 30)
        self.assertGreater(result['received'], 100)

    def test_choice_cannot_precede_its_preparation(self):
        unit = self.plan['levels'][0]['units'][2]
        unit['steps'].insert(0, unit['steps'].pop())
        self.rejects()

    def test_foreign_reader_phrase_is_rejected(self):
        foreign = next(key for key, row in self.bank.items() if row['nativeLanguage'] == 'en')
        self.plan['levels'][0]['units'][0]['steps'][0]['utterance'] = foreign
        self.rejects()

    def test_missing_received_entry_is_not_implicit_closure(self):
        self.plan['levels'][0]['dialogues'][0]['received'].pop()
        self.rejects()

    def test_original_learner_role_cannot_be_swapped(self):
        dialogue = self.plan['levels'][0]['dialogues'][0]
        dialogue['learnerRole'] = 'B' if dialogue['learnerRole'] == 'A' else 'A'
        self.rejects()

    def test_wrong_received_next_answer_is_rejected(self):
        dialogue = self.plan['levels'][0]['dialogues'][0]
        entry = next(x for x in dialogue['received'] if x['preparedNextTurns'])
        entry['preparedNextTurns'] = []
        self.rejects()

    def test_misordered_dialogue_turns_are_rejected(self):
        dialogue = self.plan['levels'][0]['dialogues'][0]
        dialogue['steps'][0]['turns'].reverse()
        self.rejects()

    def test_source_access_level_cannot_be_lowered(self):
        self.plan['levels'][1]['accessFloor'] = 1
        self.rejects()

    def test_automatic_unlock_is_rejected(self):
        self.plan['levels'][0]['units'][0]['steps'][-1]['gradesOrUnlocks'] = True
        self.rejects()


if __name__ == '__main__':
    unittest.main(verbosity=2)

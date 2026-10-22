"""Fragment guard regression tests; all mutations stay in temporary fixtures."""

import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


sys.dont_write_bytecode = True
SCRIPT = Path(__file__).with_name('guard_phonetics.py')
SPEC = importlib.util.spec_from_file_location('fragment_guard', SCRIPT)
GUARD = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GUARD)

PARENTS = {
    'zh': {'speaker': 'A', 'study': '不用，谢谢。多少钱？',
           'reading': 'búyòng, xièxie. duōshao qián?',
           'phon': 'pou-yong, sié-sié. douo-chao tchyèn ?',
           'native': 'Non, merci. Combien ça coûte ?'},
    'ja': {'speaker': 'A', 'study': 'いいえ、結構です。いくらですか。',
           'reading': 'いいえ、けっこうです。いくらですか。',
           'phon': 'i-i-é, kek-ko-o dé-sou. i-kou-ra dé-sou ka',
           'native': 'Non, merci. Combien ça coûte ?'},
    'ko': {'speaker': 'A', 'study': '아니요, 괜찮아요. 얼마예요?',
           'reading': 'aniyo, gwaenchanayo. eolmayeyo?',
           'phon': 'a-ni-yo, kouèn-tchan-a-yo. eol-ma-yé-yo',
           'native': 'Non, merci. Combien ça coûte ?'},
}
FRAGMENTS = {
    'zh': {
        'refusal': {'study': '不用，谢谢。', 'native': 'Non, merci.',
                    'phon': 'pou-yong, sié-sié.', 'reading': 'búyòng, xièxie.'},
        'price': {'study': '多少钱？', 'native': 'Combien ça coûte ?',
                  'phon': 'douo-chao tchyèn ?', 'reading': 'duōshao qián?'},
    },
    'ja': {
        'refusal': {'study': 'いいえ、結構です。', 'native': 'Non, merci.',
                    'phon': 'i-i-é, kek-ko-o dé-sou.', 'reading': 'いいえ、けっこうです。'},
        'price': {'study': 'いくらですか。', 'native': 'Combien ça coûte ?',
                  'phon': 'i-kou-ra dé-sou ka', 'reading': 'いくらですか。'},
    },
    'ko': {
        'refusal': {'study': '아니요, 괜찮아요.', 'native': 'Non, merci.',
                    'phon': 'a-ni-yo, kouèn-tchan-a-yo.', 'reading': 'aniyo, gwaenchanayo.'},
        'price': {'study': '얼마예요?', 'native': 'Combien ça coûte ?',
                  'phon': 'eol-ma-yé-yo', 'reading': 'eolmayeyo?'},
    },
}


class FragmentPhoneticsTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.decks = {language: [] for language in PARENTS}
        self.data = {}
        for language, parent in PARENTS.items():
            self.data[language] = {
                'level': 1, 'nativeLanguage': 'fr', 'studyLanguage': language,
                'dialogues': [{'id': f'L1-fr-{language}-d1', 'learnerRole': 'A',
                               'turns': [{'speaker': 'B'}] * 4 + [copy.deepcopy(parent)]}],
            }
            self.save(language)

    def save(self, language):
        path = self.root / GUARD.CONVERSATION / f'L1-fr-{language}.json'
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(self.data[language], ensure_ascii=False), encoding='utf-8')
        return path

    def parent(self, language='zh'):
        return self.data[language]['dialogues'][0]['turns'][4]

    def entry(self, language='zh', fragment='refusal', pieces=None):
        parent = self.parent(language)
        pieces = copy.deepcopy(pieces if pieces is not None else FRAGMENTS[language][fragment])
        spans = {}
        for key, value in pieces.items():
            start = parent[key].index(value)
            spans[key] = [start, start + len(value)]
        return {
            'id': f'{language}-{fragment}', 'nativeLanguage': 'fr', 'studyLanguage': language,
            'source': {'type': 'conversation-fragment',
                       'file': str(GUARD.CONVERSATION / f'L1-fr-{language}.json'),
                       'dialogueId': f'L1-fr-{language}-d1', 'turnIndex': 4,
                       'expectedStudy': pieces['study'], 'expectedParent': copy.deepcopy(parent),
                       'sourceLevel': 1, 'learnerRole': 'A', 'fragment': fragment, 'spans': spans},
            'copy': {'study': pieces['study'], 'native': pieces['native'],
                     'aids': {key: value for key, value in pieces.items()
                              if key not in {'study', 'native'}}},
            'displayPhonField': 'phon',
        }

    def validate(self, entry):
        GUARD.resolve_source(self.root, entry, self.decks)

    def reject(self, entry, message):
        with self.assertRaisesRegex(ValueError, message):
            self.validate(entry)

    def test_chinese_japanese_and_korean_fragments(self):
        for language in PARENTS:
            for fragment in ('refusal', 'price'):
                with self.subTest(language=language, fragment=fragment):
                    self.validate(self.entry(language, fragment))

    def test_wrong_reader_or_study_pair(self):
        for key, value in (('nativeLanguage', 'es'), ('studyLanguage', 'ja')):
            with self.subTest(key=key):
                entry = self.entry()
                entry[key] = value
                self.reject(entry, 'pair mismatch')

    def test_entire_parent_is_pinned_including_unselected_content_and_fields(self):
        mutations = [('speaker', 'B'), ('study', PARENTS['zh']['study'] + '!'),
                     ('reading', PARENTS['zh']['reading'] + '!'),
                     ('note', 'new metadata'), ('phonFuture', 'new aid')]
        for key, value in mutations:
            with self.subTest(key=key):
                entry = self.entry()
                self.parent()[key] = value
                self.save('zh')
                self.reject(entry, 'speaker|parent differs')
                self.data['zh']['dialogues'][0]['turns'][4] = copy.deepcopy(PARENTS['zh'])
                self.save('zh')
        entry = self.entry()
        del entry['source']['expectedParent']['speaker']
        self.reject(entry, 'parent differs')

    def test_level_and_learner_role_must_match(self):
        for value in (2, True, '1', None):
            with self.subTest(sourceLevel=value):
                entry = self.entry()
                entry['source']['sourceLevel'] = value
                self.reject(entry, 'sourceLevel')
            with self.subTest(dataLevel=value):
                self.data['zh']['level'] = value
                self.save('zh')
                self.reject(self.entry(), 'sourceLevel')
        self.data['zh']['level'] = 1
        self.save('zh')
        entry = self.entry()
        entry['source']['learnerRole'] = 'B'
        self.reject(entry, 'learnerRole')
        self.data['zh']['dialogues'][0]['learnerRole'] = 'B'
        self.save('zh')
        self.reject(self.entry(), 'learnerRole')

    def test_missing_or_wrong_dialogue_and_turn_identity(self):
        entry = self.entry()
        entry['source']['dialogueId'] = 'L1-fr-zh-d2'
        self.reject(entry, 'exactly one source ID')
        for index in (-1, 3, 5, True):
            with self.subTest(index=index):
                entry = self.entry()
                entry['source']['turnIndex'] = index
                self.reject(entry, 'source index|learnerRole')
        for key, value in (('unitId', 'unit'), ('model', False),
                           ('variantIndex', 0), ('slot', False)):
            with self.subTest(key=key):
                entry = self.entry()
                entry['source'][key] = value
                self.reject(entry, 'unambiguous')

    def test_off_by_one_spans_and_wrong_expected_study(self):
        for key in FRAGMENTS['zh']['refusal']:
            with self.subTest(key=key):
                entry = self.entry()
                entry['source']['spans'][key][1] -= 1
                self.reject(entry, 'expectedStudy|Copy differs')
        entry = self.entry()
        entry['source']['expectedStudy'] += ' '
        self.reject(entry, 'expectedStudy')

    def test_every_present_aid_requires_a_span_and_exact_copy(self):
        entry = self.entry()
        del entry['source']['spans']['reading']
        self.reject(entry, 'ALL present parent aid')
        entry = self.entry()
        del entry['copy']['aids']['reading']
        self.reject(entry, 'Copy differs')
        self.parent()['phonFuture'] = 'refusal | price'
        self.save('zh')
        entry = self.entry()
        self.reject(entry, 'ALL present parent aid')
        entry['source']['spans']['phonFuture'] = [0, 7]
        self.reject(entry, 'Copy differs')
        entry['copy']['aids']['phonFuture'] = 'refusal'
        self.validate(entry)
        entry['source']['spans']['unexpected'] = [0, 1]
        self.reject(entry, 'ALL present parent aid')

    def test_wrong_phonetics_and_display_selector(self):
        entry = self.entry()
        entry['copy']['aids']['phon'] = 'invented phonetics'
        self.reject(entry, 'Copy differs')
        entry = self.entry()
        entry['displayPhonField'] = 'reading'
        self.reject(entry, 'displayPhonField')

    def test_native_is_mandatory_and_speaker_is_not_copied(self):
        entry = self.entry()
        del entry['copy']['native']
        self.reject(entry, 'Copy differs')
        entry = self.entry()
        entry['copy']['speaker'] = 'A'
        self.reject(entry, 'Copy differs')

    def test_invalid_span_types_bounds_and_empty_slices(self):
        invalid = (None, '0:1', {}, [0], [0, 1, 2], [False, 1], [0, True],
                   [0.0, 1], [0, '1'], [-1, 1], [2, 1], [0, 999], [0, 0])
        for span in invalid:
            with self.subTest(span=span):
                entry = self.entry()
                entry['source']['spans']['study'] = span
                self.reject(entry, 'integer span|out of bounds|nonempty')
        entry = self.entry()
        entry['source']['spans'] = []
        self.reject(entry, 'ALL present parent aid')

    def test_empty_aid_is_preserved_only_as_zero_zero(self):
        self.parent()['phonFuture'] = ''
        self.save('zh')
        pieces = {**FRAGMENTS['zh']['refusal'], 'phonFuture': ''}
        entry = self.entry(pieces=pieces)
        self.validate(entry)
        for span in ([0, 1], [1, 1]):
            with self.subTest(span=span):
                entry['source']['spans']['phonFuture'] = span
                self.reject(entry, 'out of bounds')
        self.parent()['phonFuture'] = 'not empty'
        self.save('zh')
        entry = self.entry(pieces=pieces)
        self.reject(entry, 'nonempty')

    def test_nonstring_source_aid_and_empty_selected_phon_are_rejected(self):
        for value in (None, [], 1):
            with self.subTest(value=value):
                self.parent()['phonFuture'] = value
                self.save('zh')
                entry = self.entry()
                entry['source']['spans']['phonFuture'] = [0, 0]
                self.reject(entry, 'expected a string')
        del self.parent()['phonFuture']
        self.parent()['phon'] = ''
        self.save('zh')
        pieces = {**FRAGMENTS['zh']['refusal'], 'phon': ''}
        self.reject(self.entry(pieces=pieces), 'Selected source phonetics is empty')

    def test_raw_unicode_codepoints_spacing_and_combining_marks_are_preserved(self):
        pieces = {'study': '多少钱？', 'native': ' Combien ça coûte ?',
                  'phon': ' douo-chao tchyèn ?', 'reading': ' duōshao qián?'}
        for key in pieces:
            self.parent()[key] = '😀e\u0301' + pieces[key] + ' '
        self.save('zh')
        entry = self.entry(fragment='price', pieces=pieces)
        self.assertEqual(entry['source']['spans']['study'][0], 3)
        self.validate(entry)
        entry['copy']['aids']['phon'] = pieces['phon'].strip()
        self.reject(entry, 'Copy differs')

    def test_unsafe_paths_and_wrong_source_type(self):
        relative = str(GUARD.CONVERSATION / 'L1-fr-zh.json')
        unsafe = (str(self.root / relative), '../' + relative,
                  str(GUARD.CONVERSATION / '..' / 'conversation' / 'L1-fr-zh.json'),
                  'melunga_deploy/content/L1-fr-zh.json')
        for file in unsafe:
            with self.subTest(file=file):
                entry = self.entry()
                entry['source']['file'] = file
                self.reject(entry, 'without traversal')
        outside = self.root / 'outside.json'
        outside.write_text(json.dumps(self.data['zh']), encoding='utf-8')
        (self.root / GUARD.CONVERSATION / 'escape.json').symlink_to(outside)
        entry = self.entry()
        entry['source']['file'] = str(GUARD.CONVERSATION / 'escape.json')
        self.reject(entry, 'without traversal')
        for source_type in ('conversation_fragment', 'conversation'):
            with self.subTest(source_type=source_type):
                entry = self.entry()
                entry['source']['type'] = source_type
                self.reject(entry, 'Unsupported source type|expectedStudy')
        entry = self.entry()
        entry['source']['fragment'] = 'greeting'
        self.reject(entry, 'refusal or price')

    def test_legacy_whole_turn_conversation_still_allows_native_omission(self):
        entry = self.entry()
        entry['source'] = {'type': 'conversation', 'file': entry['source']['file'],
                           'dialogueId': 'L1-fr-zh-d1', 'turnIndex': 4,
                           'expectedStudy': PARENTS['zh']['study']}
        entry['copy'] = {'study': PARENTS['zh']['study'],
                         'aids': {'phon': PARENTS['zh']['phon'],
                                  'reading': PARENTS['zh']['reading']}}
        self.validate(entry)

    def test_cli_root_automatically_checks_fragment_banks_without_writing_sources(self):
        app = self.root / GUARD.APP
        app.write_text('var DECKS = ' + json.dumps(self.decks) + ';\n', encoding='utf-8')
        (self.root / GUARD.LEGACY).write_text('{}', encoding='utf-8')
        baseline = self.root / GUARD.BASELINE
        baseline.parent.mkdir(parents=True, exist_ok=True)
        baseline.write_text(json.dumps(GUARD.snapshot(self.root)), encoding='utf-8')
        bank = baseline.parent / 'banks' / 'fragments.json'
        bank.parent.mkdir()
        entry = self.entry()
        bank.write_text(json.dumps({'entries': [entry]}), encoding='utf-8')
        before = {path: path.read_bytes() for path in self.root.rglob('*') if path.is_file()}
        command = [sys.executable, str(SCRIPT), '--root', str(self.root), '--check']
        process = subprocess.run(command, capture_output=True, text=True)
        self.assertEqual(process.returncode, 0, process.stderr + process.stdout)
        report = json.loads(process.stdout)
        self.assertEqual((report['checkedBanks'], report['bankEntries']), (1, 1))
        self.assertTrue(report['sourcePreserved'])
        self.assertEqual(before, {path: path.read_bytes() for path in before})
        entry['copy']['aids']['phon'] += '!'
        bank.write_text(json.dumps({'entries': [entry]}), encoding='utf-8')
        process = subprocess.run(command, capture_output=True, text=True)
        self.assertEqual(process.returncode, 1)
        self.assertIn('Copy differs', json.loads(process.stdout)['errors'][0])


if __name__ == '__main__':
    unittest.main()

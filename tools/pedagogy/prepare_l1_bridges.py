#!/usr/bin/env python3
"""Extract review-only L1 bridges without rewriting a source phrase or aid."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess

from guard_phonetics import aids_of, digest, extract_decks

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs/progression-complete'
BASE = 'bcd108dff5c5931f935f70f694a040d235403b64'
PAIRS = ('fr-en', 'fr-es', 'fr-it', 'fr-zh', 'fr-ja', 'fr-ko', 'zh-fr')
REFUSALS = {'fr-en': 'No, thanks.', 'fr-es': 'No, gracias.',
            'fr-it': 'No, grazie.', 'fr-zh': '不用，谢谢。',
            'fr-ja': 'いいえ、結構です。', 'fr-ko': '아니요, 괜찮아요.',
            'zh-fr': 'Non, merci.'}


def dump(value):
    return json.dumps(value, ensure_ascii=False, indent=2) + '\n'


def freeze(relative):
    data = (ROOT / relative).read_bytes()
    original = subprocess.check_output(['git', 'show', f'{BASE}:{relative}'], cwd=ROOT)
    if data != original:
        raise ValueError('Canonical source changed; review before extracting: ' + relative)
    return json.loads(data), hashlib.sha256(data).hexdigest()


def split_field(value):
    """Keep punctuation in the first phrase and record every separator character."""
    match = re.search(r'[.。]', value)
    if not match:
        raise ValueError('No reviewed sentence boundary in source field')
    first_end = match.end()
    second_start = first_end
    while second_start < len(value) and value[second_start].isspace():
        second_start += 1
    if second_start == len(value):
        raise ValueError('Missing second phrase')
    return [0, first_end], [second_start, len(value)], value[first_end:second_start]


def prepare():
    scenes, fragments, hashes = [], [], {}
    source_bank = json.loads((OUT / 'banque-phrases.json').read_text())
    bank = {row['id']: row for row in source_bank['entries']}
    for pair in PAIRS:
        native, study = pair.split('-')
        relative = f'melunga_deploy/content/conversation/L1-{pair}.json'
        data, source_hash = freeze(relative)
        hashes[relative] = source_hash
        raw = next(d for d in data['dialogues'] if d['id'] == f'L1-{pair}-d1')
        turns = raw['turns']
        if len(turns) != 6 or raw['learnerRole'] != 'A' or [t['speaker'] for t in turns] != list('ABABAB'):
            raise ValueError('Unexpected original café roles/order')
        combined = turns[4]
        fields = ['study', 'native', *aids_of(combined)]
        left, right, separators = {}, {}, {}
        for field in fields:
            left[field], right[field], separators[field] = split_field(combined[field])
        ids = {}
        for part, spans in [('refusal', left), ('price', right)]:
            pieces = {field: combined[field][bounds[0]:bounds[1]] for field, bounds in spans.items()}
            identity = f'L1-{pair}.json:{raw["id"]}:t4:{part}'
            row = {'id': identity, 'nativeLanguage': native, 'studyLanguage': study,
                   'source': {'type': 'conversation-fragment', 'file': relative,
                              'dialogueId': raw['id'], 'turnIndex': 4, 'sourceLevel': 1,
                              'learnerRole': raw['learnerRole'], 'fragment': part,
                              'expectedStudy': pieces['study'], 'expectedParent': combined,
                              'spans': spans},
                   'copy': {'study': pieces['study'], 'native': pieces['native'],
                            'aids': {key: pieces[key] for key in aids_of(combined)}}}
            fragments.append(row)
            bank[identity] = row
            ids[part] = identity
        if bank[ids['refusal']]['copy']['study'] != REFUSALS[pair]:
            raise ValueError('Unexpected refusal boundary')
        for field in fields:
            first = combined[field][left[field][0]:left[field][1]]
            second = combined[field][right[field][0]:right[field][1]]
            if first + separators[field] + second != combined[field]:
                raise ValueError('Lossy source segmentation')

        def turn_ref(index):
            return f'L1-{pair}.json:{raw["id"]}:t{index}'

        ids.update(greeting=turn_ref(0), welcome=turn_ref(1), milk=turn_ref(3), amount=turn_ref(5),
                   order=f'L1-{pair}.json:L1-{pair}-09:v0')
        order = bank[ids['order']]['copy']
        if order != {'study': turns[2]['study'], 'native': turns[2]['native'], 'aids': aids_of(turns[2])}:
            raise ValueError('Order unit is not the exact original dialogue reply')
        scene_id = f'L1-{pair}-cafe-prepare'
        bridge_units = []
        for intent in ('greeting', 'refusal'):
            uid = f'L1-{pair}-bridge-{intent}'
            title = ({'greeting': 'Saluer', 'refusal': 'Refuser poliment'} if native == 'fr'
                     else {'greeting': '问候', 'refusal': '礼貌拒绝'})[intent]
            context = ({'greeting': 'Tu arrives au café et tu salues le serveur.',
                        'refusal': 'Au café, le serveur te propose du lait. Tu refuses poliment.'} if native == 'fr'
                       else {'greeting': '你走进咖啡馆，向服务员问好。',
                             'refusal': '在咖啡馆，服务员问你要不要加牛奶。你礼貌地拒绝。'})[intent]
            bridge_units.append({'unitId': uid, 'title': title, 'kind': 'whole-expression',
                                 'contextReader': context,
                                 'utteranceId': ids[intent], 'sourceAccessLevel': 1,
                                 'requiresNewPhonetics': False, 'replacementClaim': False,
                                 'steps': [
                                     {'id': uid + '-understand', 'kind': 'understand', 'utterance': ids[intent],
                                      'wholePhrase': True, 'requiresProduction': False},
                                     {'id': uid + '-imitate', 'kind': 'imitate', 'utterance': ids[intent],
                                      'wholePhrase': True, 'requiresProduction': True},
                                     {'id': uid + '-recall', 'kind': 'recall-whole-phrase', 'utterance': ids[intent],
                                      'hideLearnerModelOnRequest': True, 'canRestoreHelp': True,
                                      'gradesOrUnlocks': False}]})

        order_names = ('greeting', 'welcome', 'order', 'milk', 'refusal', 'price', 'amount')
        speakers = ('A', 'B', 'A', 'B', 'A', 'A', 'B')
        preparation, first_steps = [], {}
        for intent, speaker in zip(order_names, speakers):
            identity = ids[intent]
            phase = 'receive' if speaker != raw['learnerRole'] else 'understand'
            step_id = scene_id + '-prepare-' + intent
            first_steps[intent] = step_id
            preparation.append({'id': step_id, 'kind': phase, 'utterance': identity,
                                'speaker': speaker, 'wholePhrase': True, 'requiresProduction': False})
            if speaker == raw['learnerRole']:
                preparation.append({'id': step_id + '-imitate', 'kind': 'imitate', 'utterance': identity,
                                    'speaker': speaker, 'wholePhrase': True, 'requiresProduction': True})
        received = []
        for intent, original_index, reply in [('welcome', 1, 'order'), ('milk', 3, 'refusal'), ('amount', 5, None)]:
            received.append({'utteranceId': ids[intent],
                             'source': {'type': 'dialogueTurn', 'level': 1, 'dialogueId': raw['id'],
                                        'turnIndex': original_index, 'learnerRole': raw['learnerRole'],
                                        'expectedStudy': bank[ids[intent]]['copy']['study']},
                             'introducedInStep': first_steps[intent], 'analyse': False,
                             'countsAsProduction': False, 'replyRequired': reply is not None,
                             'answerWith': [] if reply is None else [
                                 {'utteranceId': ids[reply], 'expectedStudy': bank[ids[reply]]['copy']['study'],
                                  'preparedInStep': first_steps[reply]}]})
        refs = [ids[intent] for intent in order_names]
        review_note = ('Scène extraite à faire relire : refus détaché, naturel et intonation. '
                       'La demande de prix exacte est préparée séparément ; elle ne répond pas à la question sur le lait.')
        scenes.append({'id': scene_id, 'nativeLanguage': native, 'studyLanguage': study,
                       'level': 1, 'accessFloor': 1, 'bridgeUnits': bridge_units,
                       'pricePreparation': {'utteranceId': ids['price'], 'preparedInStep': first_steps['price'],
                                            'relatedUnitId': f'L1-{pair}-10',
                                            'relatedUnitDoesNotPrepareExactPhrase': True},
                       'splitReconstruction': {'originalTurnIndex': 4, 'first': ids['refusal'],
                                               'second': ids['price'], 'separators': separators},
                       'nativeReview': {'status': 'pending', 'productionApproved': False,
                                        'checks': ['Detached refusal remains polite in the café context',
                                                   'Whole scene naturalness and intonation',
                                                   *(['結構です: tone and pragmatic force'] if study == 'ja' else []),
                                                   *(['괜찮아요: refusal context, not the meaning ça va'] if study == 'ko' else [])]},
                       'dialogue': {'dialogueId': scene_id, 'originalDialogueId': raw['id'],
                                    'sceneType': 'derived-dialogue-exact-segments', 'situation': raw['situation'],
                                    'roles': raw['roles'], 'learnerRole': raw['learnerRole'],
                                    'originalTurnOrder': [0, 1, 2, 3, '4:refusal', '4:price', 5],
                                    'reviewQuestion': review_note, 'preparation': preparation, 'received': received,
                                    'steps': [{'kind': kind, 'turns': refs, 'learnerRole': raw['learnerRole'],
                                               **({'receivedRemainVisible': True, 'canRestoreHelp': True}
                                                  if kind == 'reply-without-model' else {})}
                                              for kind in ('listen-whole-dialogue', 'reply-with-help', 'reply-without-model')],
                                    'automaticVariantGrafting': False, 'gradesOrUnlocks': False,
                                    'learnerAcquisitionValidated': False}})
    document = {'version': 1, 'sourceSnapshot': BASE, 'status': 'editorial-review-not-published',
                'phoneticPolicy': 'exact-source-copy-or-lossless-slice-no-normalization',
                'doesNotChangeAccess': True, 'learnerAcquisitionValidated': False,
                'counts': {'pairs': 7, 'bridgeUnits': 14, 'pricePreparations': 7,
                           'derivedDialogues': 7, 'received': 21, 'newStudiedPhrases': 0,
                           'newPhonetics': 0, 'fragmentReferences': 14},
                'sourceFilesSha256': hashes, 'scenes': scenes}
    fragment_bank = {'version': 1, 'sourceSnapshot': BASE,
                     'status': 'lossless-source-extracts-not-new-phonetics', 'entries': fragments}
    decks = extract_decks(ROOT)
    matches = [(i, card) for i, card in enumerate(decks['fr']) if card['t'] == 'Bonjour !']
    if len(matches) != 1 or matches[0][1]['lv'] != 2:
        raise ValueError('Unexpected Bonjour catalogue reference')
    index, card = matches[0]
    amendment = {'version': 1, 'status': 'review-only-not-applied', 'sourceSnapshot': BASE,
                 'file': 'melunga_deploy/app.html', 'container': 'DECKS',
                 'language': 'fr', 'sourceIndex': index, 'expectedCardSha256': digest(card),
                 'jsonPatch': [{'op': 'test', 'path': f'/fr/{index}/t', 'value': 'Bonjour !'},
                               {'op': 'test', 'path': f'/fr/{index}/lv', 'value': 2},
                               {'op': 'replace', 'path': f'/fr/{index}/lv', 'value': 1}],
                 'preservedAids': aids_of(card), 'catalogueSharedAcrossReaders': True,
                 'activePairConcerned': 'zh-fr',
                 'previewUses': {'source': 'L1-zh-fr.json:L1-zh-fr-d1:t0', 'phon': '蓬茹尔'},
                 'note': 'Only lv changes in this proposed patch. Catalogue and conversation aids remain distinct.'}
    return {OUT / 'l1-bridges.json': dump(document),
            OUT / 'banks/l1-bridges.json': dump(fragment_bank),
            OUT / 'ponts-L1/bonjour-lv1-proposal.json': dump(amendment)}, document['counts']


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    outputs, counts = prepare()
    for path, expected in outputs.items():
        if args.check:
            if not path.exists() or path.read_text() != expected:
                raise SystemExit('Generated review file differs: ' + str(path.relative_to(ROOT)))
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(expected)
    print(json.dumps({'mode': 'check' if args.check else 'write', **counts}))


if __name__ == '__main__':
    main()

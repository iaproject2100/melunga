#!/usr/bin/env python3
"""Prepare source-based editorial sequences; never alter the live curriculum."""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'melunga_deploy/content/conversation'
OUT = ROOT / 'docs/progression-complete'
BASE = 'ea2619bc6f24e81c254ca00dc272dd76d35cc9a3'
ACTIVE = {('fr', code) for code in ('en', 'es', 'zh', 'it', 'ja', 'ko')} | {('zh', 'fr')}


def dump(value):
    return json.dumps(value, ensure_ascii=False, indent=2) + '\n'


def aid_fields(phrase):
    return {key: value for key, value in phrase.items()
            if key in ('phon', 'reading', 'py') or key.startswith(('ph', 'pron'))}


def prepare():
    bank = {}
    pairs = {}
    hashes = {}
    summary = {'levels': 0, 'units': 0, 'dialogues': 0, 'wholeExpressionSets': 0,
               'fixedFrameCandidates': 0, 'preparedReceivedTurns': 0,
               'activePairs': 0, 'storedPairsNotActivated': 0}

    def register(file, data, phrase, **locator):
        tail = (f"{locator['unitId']}:v{locator['variantIndex']}"
                if 'unitId' in locator else f"{locator['dialogueId']}:t{locator['turnIndex']}")
        identity = f'{file.name}:{tail}'
        source = {'type': 'conversation', 'file': str(file.relative_to(ROOT)),
                  **locator, 'expectedStudy': phrase['study']}
        record = {'id': identity, 'nativeLanguage': data['nativeLanguage'],
                  'studyLanguage': data['studyLanguage'], 'source': source,
                  'copy': {'study': phrase['study'], 'native': phrase['native'],
                           'aids': aid_fields(phrase)}}
        if identity in bank and bank[identity] != record:
            raise ValueError('Source identity collision: ' + identity)
        bank[identity] = record
        return identity

    for file in sorted(SOURCE.glob('L*-*-*.json')):
        data = json.loads(file.read_text())
        pair = (data['nativeLanguage'], data['studyLanguage'])
        level = data['level']
        hashes[str(file.relative_to(ROOT))] = hashlib.sha256(file.read_bytes()).hexdigest()
        destination = pairs.setdefault(pair, {'nativeLanguage': pair[0], 'studyLanguage': pair[1],
                                             'currentlyActive': pair in ACTIVE, 'levels': []})
        level_plan = {'sourceFile': str(file.relative_to(ROOT)), 'sourceLevel': level,
                      'proposedLevel': level, 'accessFloor': level, 'title': data['title'],
                      'goal': data['goal'], 'reviewStatus': data.get('reviewStatus'),
                      'priorExposurePlan': list(range(1, level)), 'units': [], 'dialogues': []}
        for unit in data['units']:
            variants = unit['variants']
            refs = [register(file, data, variant, unitId=unit['id'], variantIndex=index, slot=False)
                    for index, variant in enumerate(variants)]
            model = unit['model']['study']
            fixed_frame = model.count('{s}') == 1 and model.strip() != '{s}'
            matches = [isinstance(v.get('slot'), dict) and
                       model.replace('{s}', v['slot']['study']) == v['study'] for v in variants]
            substitution = fixed_frame and all(matches)
            mode = 'fixed-frame-candidate' if substitution else 'whole-expression-set'
            summary['fixedFrameCandidates' if substitution else 'wholeExpressionSets'] += 1
            steps = []
            for index, ref in enumerate(refs):
                steps.append({'id': f'{unit["id"]}-understand-{index}', 'kind': 'understand',
                              'utterance': ref, 'wholePhrase': True, 'requiresProduction': False})
                steps.append({'id': f'{unit["id"]}-imitate-{index}', 'kind': 'imitate',
                              'utterance': ref, 'wholePhrase': True})
                if index and substitution:
                    steps.append({'id': f'{unit["id"]}-replace-{index}', 'kind': 'replace',
                                  'from': refs[0], 'to': ref, 'preparedBefore': True,
                                  'scope': 'complete-source-variants-only'})
            steps.append({'id': f'{unit["id"]}-choose', 'kind': 'choose-and-recall',
                          'choices': refs, 'hideLearnerModelOnRequest': True,
                          'canRestoreHelp': True, 'gradesOrUnlocks': False})
            level_plan['units'].append({'unitId': unit['id'], 'situation': unit['situation'],
                                        'mode': mode, 'exactTemplateMatches': matches,
                                        'editorialReviewRequired': True,
                                        'reviewQuestion': 'Même opération et registre ? Une seule nouveauté réelle ?'
                                        if substitution else 'Expressions entières à répartir par fonction ; ne pas les présenter comme un mot interchangeable.',
                                        'steps': steps})
            summary['units'] += 1
        for dialogue in data['dialogues']:
            roles = dialogue.get('roles', {})
            learner = dialogue.get('learnerRole')
            if learner not in ('A', 'B'):
                raise ValueError('An explicit learner role is required: ' + dialogue['id'])
            turns = dialogue['turns']
            refs = [register(file, data, turn, dialogueId=dialogue['id'], turnIndex=index)
                    for index, turn in enumerate(turns)]
            preparation = []
            received = []
            for index, (ref, turn) in enumerate(zip(refs, turns)):
                productive = turn['speaker'] == learner
                step_id = f'{dialogue["id"]}-prepare-{index}'
                preparation.append({'id': step_id, 'kind': 'understand-and-imitate' if productive else 'receive',
                                    'utterance': ref, 'speaker': turn['speaker'],
                                    'wholePhrase': True, 'requiresProduction': productive})
                if not productive:
                    following = refs[index + 1:index + 2] if index + 1 < len(turns) and turns[index + 1]['speaker'] == learner else []
                    received.append({'utterance': ref, 'introducedInStep': step_id,
                                     'sourceSpeaker': turn['speaker'], 'analyse': False,
                                     'countsAsProduction': False, 'preparedNextTurns': following,
                                     'responsePolicy': 'source-turn-order-not-a-language-rule',
                                     'isSourceFinalTurn': index == len(turns) - 1})
                    summary['preparedReceivedTurns'] += 1
            level_plan['dialogues'].append({
                'dialogueId': dialogue['id'], 'situation': dialogue['situation'],
                'roles': roles, 'learnerRole': learner, 'sourceReuses': dialogue.get('reuses', []),
                'editorialReviewRequired': True,
                'reviewQuestion': 'Faut-il raccourcir la scène ou reporter certains tours ? Préparer le texte ne prouve pas sa compréhension.',
                'preparation': preparation, 'received': received,
                'steps': [{'kind': 'listen-whole-dialogue', 'turns': refs},
                          {'kind': 'reply-with-help', 'turns': refs, 'learnerRole': learner},
                          {'kind': 'reply-without-model', 'turns': refs, 'learnerRole': learner,
                           'receivedRemainVisible': True, 'canRestoreHelp': True}],
                'automaticVariantGrafting': False, 'gradesOrUnlocks': False})
            summary['dialogues'] += 1
        destination['levels'].append(level_plan)
        summary['levels'] += 1

    outputs = {}
    for pair, plan in sorted(pairs.items()):
        plan['levels'].sort(key=lambda item: item['sourceLevel'])
        if [x['sourceLevel'] for x in plan['levels']] != list(range(1, 11)):
            raise ValueError('Every stored pair must have all ten levels')
        summary['activePairs' if pair in ACTIVE else 'storedPairsNotActivated'] += 1
        outputs[OUT / 'sequences' / f'seq-{pair[0]}-{pair[1]}.json'] = dump({
            'version': 1, 'status': 'editorial-proposal-not-published', 'sourceSnapshot': BASE,
            'phoneticPolicy': 'exact-source-copy-no-normalization',
            'doesNotMeasureAcquisition': True, 'doesNotChangeAccess': True, **plan})
    ids = set(bank)
    for path, text in outputs.items():
        def check_refs(node):
            if isinstance(node, dict):
                for key, value in node.items():
                    if key in ('utterance', 'from', 'to') and value not in ids:
                        raise ValueError('Unresolved phrase: ' + value)
                    if key in ('choices', 'turns', 'preparedNextTurns') and any(x not in ids for x in value):
                        raise ValueError('Unresolved phrase list')
                    check_refs(value)
            elif isinstance(node, list):
                for value in node:
                    check_refs(value)
        check_refs(json.loads(text))
    summary['phraseReferences'] = len(bank)
    outputs[OUT / 'banque-phrases.json'] = dump({'version': 1, 'sourceSnapshot': BASE,
                                               'status': 'exact-source-bank-not-new-phonetics',
                                               'entries': list(bank.values())})
    outputs[OUT / 'couverture-sequences.json'] = dump({'sourceSnapshot': BASE, **summary,
                                                      'sourceFilesSha256': hashes,
                                                      'limitations': [
                                                          'Plans couvrant le stock, pas une validation linguistique de toutes les phrases.',
                                                          'Correspondance du gabarit ne garantit pas une seule nouveauté ni une même difficulté.',
                                                          'Préparation éditoriale ne certifie pas la compréhension.',
                                                          'Aucun nouveau public, niveau, droit ou contenu canonique activé.']})
    return outputs, summary


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    outputs, summary = prepare()
    for path, expected in outputs.items():
        if args.check:
            if not path.exists() or path.read_text() != expected:
                raise SystemExit('Generated review file differs: ' + str(path.relative_to(ROOT)))
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(expected)
    print(json.dumps({'mode': 'check' if args.check else 'write', **summary}))


if __name__ == '__main__':
    main()

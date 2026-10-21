#!/usr/bin/env python3
"""Build/check the isolated comparative preview; never change existing lessons."""
import argparse
import hashlib
import json
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.dont_write_bytecode = True
from received_contract import validate_received


def prepare():
    app_path = ROOT / 'melunga_deploy/app.html'
    app_text = app_path.read_text()
    marker = 'var DECKS = '
    start = app_text.index(marker) + len(marker)
    decks = json.JSONDecoder().raw_decode(app_text[start:])[0]
    conversation_path = HERE / 'sources/L1-fr-ko.json'
    conversation = json.loads(conversation_path.read_text())
    sources = []

    def deck(target, role='Toi', kind='learner'):
        matches = [(i, c) for i, c in enumerate(decks['zh']) if c['t'] == target]
        if len(matches) != 1:
            raise ValueError(f'Expected one catalogue source for {target!r}')
        index, card = matches[0]
        record = {'id': f'zh-deck-{index}', 'study': card['t'],
                  'phon': card['phf'], 'native': card['frm'],
                  'reading': card['py'], 'role': role, 'kind': kind}
        sources.append({'id': record['id'], 'file': 'melunga_deploy/app.html',
                        'nativeLanguage': 'fr', 'studyLanguage': 'zh',
                        'locator': f'DECKS.zh[{index}]', 'historicalLevel': card['lv'],
                        'fields': {'study': 't', 'phon': 'phf', 'native': 'frm', 'reading': 'py'},
                        'expected': record})
        return record

    def ko_variant(unit_id, index):
        unit = next(u for u in conversation['units'] if u['id'] == unit_id)
        phrase = unit['variants'][index]
        record = {'id': f'{unit_id}-v{index}',
                  **{k: phrase[k] for k in ['study', 'phon', 'native', 'reading']},
                  'role': 'Client', 'kind': 'learner'}
        sources.append({'id': record['id'], 'file': str(conversation_path.relative_to(ROOT)),
                        'nativeLanguage': 'fr', 'studyLanguage': 'ko',
                        'unitId': unit_id, 'variantIndex': index, 'expected': record})
        return record

    def ko_turn(index, role, kind):
        dialogue = conversation['dialogues'][0]
        assert dialogue['id'] == 'L1-fr-ko-d1' and dialogue['learnerRole'] == 'A'
        phrase = dialogue['turns'][index]
        record = {'id': f'{dialogue["id"]}-t{index}',
                  **{k: phrase[k] for k in ['study', 'phon', 'native', 'reading']},
                  'role': role, 'kind': kind}
        sources.append({'id': record['id'], 'file': str(conversation_path.relative_to(ROOT)),
                        'nativeLanguage': 'fr', 'studyLanguage': 'ko',
                        'dialogueId': dialogue['id'], 'turnIndex': index,
                        'speaker': phrase['speaker'], 'learnerRole': dialogue['learnerRole'],
                        'expected': record})
        return record

    rest = deck('我想休息')
    home = deck('我想回家')
    home_brick = deck('回家', 'Le morceau à réutiliser', 'brick')
    okay = deck('好的', 'Un proche', 'received')
    coffee = ko_variant('L1-fr-ko-03', 0)
    water = ko_variant('L1-fr-ko-03', 1)
    greeting = ko_turn(0, 'Serveur', 'support')
    question = ko_turn(1, 'Serveur', 'received')

    def step(id, phase, title, instruction, novelty, utterances, **extra):
        return dict(id=id, phase=phase, title=title, instruction=instruction,
                    novelty=novelty, utterances=utterances, **extra)

    pilots = [
        {'id': 'fr-zh-envie', 'pair': {'native': 'fr', 'study': 'zh'},
         'title': 'Dire ce que tu veux faire', 'levelLabel': 'Classement L2 provisoire',
         'goal': 'Exprimer une envie, changer l’action, comprendre une réponse d’accord.',
         'steps': [
             step('zh-understand', 'Comprendre', 'Tu veux te reposer',
                  'Après une promenade, tu souhaites faire une pause. Écoute la phrase et retrouve son sens.',
                  'Ici, 我想 sert à dire ce que tu veux faire. Aucun acquis en 需要 n’est supposé. Les usages de 我要 et 我想要 se reprennent séparément, pas comme trois constructions nouvelles à cette première écoute.', [rest]),
             step('zh-imitate', 'Imiter', 'Redis la même envie',
                  'Écoute, puis répète si tu le souhaites. Garde la phonétique à portée de main.',
                  'Aucune phrase nouvelle.', [rest]),
             step('zh-received', 'Comprendre l’autre', 'Ton proche est d’accord',
                  'Écoute ce qu’il te répond. Tu n’as pas de nouvelle demande à construire.',
                  'Une réponse reçue en contexte : d’accord.', [okay]),
             step('zh-visible', 'Échanger', 'Ton premier échange visible',
                  'Écoute les deux rôles dans l’ordre.',
                  'Réemploi des deux phrases déjà présentées.', [rest, okay], scene=True),
             step('zh-prepare-home', 'Préparer la suite', 'Tu veux rentrer à la maison',
                  'Écoute la phrase entière. Repère ensuite le morceau qui veut dire « rentrer à la maison ».',
                  '回家 est préparé dans une phrase complète avant de le substituer à 休息. La carte autonome sert d’appui ; 家 et 家里 ne deviennent pas de nouveaux prérequis.',
                  [home], focusBrick=home_brick),
             step('zh-substitute', 'Remplacer', 'Cette fois, tu veux rentrer',
                  'Compare les deux phrases déjà écoutées. Le début reste identique ; l’action change.',
                  '回家, maintenant préparé, remplace 休息. L’emplacement accueille une action complète, pas n’importe quel mot.', [rest, home]),
             step('zh-choice', 'Choisir et réutiliser', 'À toi de choisir ton envie',
                  'Choisis ton intention. Tu peux garder le modèle ou essayer sans lui, puis retrouver l’aide.',
                  'Choix personnel entre deux groupes préparés ; pas de nouvelle structure.',
                  [rest, okay], scene=True, recall=True,
                  choices=[{'id': 'rest', 'label': 'Me reposer', 'utterance': rest},
                           {'id': 'home', 'label': 'Rentrer à la maison', 'utterance': home}])]},
        {'id': 'fr-ko-demande', 'pair': {'native': 'fr', 'study': 'ko'},
         'title': 'Commander une boisson', 'levelLabel': 'Essai du chemin L1',
         'goal': 'Demander une boisson, en changer, comprendre ce que demande le serveur.',
         'steps': [
             step('ko-understand', 'Comprendre', 'Tu demandes un café',
                  'Au café, tu souhaites commander. Écoute la demande complète et retrouve son sens.',
                  'Première demande complète, sans quantité ni ajout.', [coffee]),
             step('ko-imitate', 'Imiter', 'Redis la même demande',
                  'Écoute, puis répète si tu le souhaites.',
                  'Aucune phrase nouvelle.', [coffee]),
             step('ko-substitute', 'Remplacer', 'Tu préfères de l’eau',
                  'Écoute la phrase entière. Seule la boisson change.',
                  '물 remplace 커피 ; 주세요 reste identique.', [water]),
             step('ko-greeting', 'Comprendre l’autre', 'On te salue',
                  'Écoute la salutation avant de découvrir la question du serveur.',
                  'Une salutation reçue ; sa présence ailleurs ne prouve pas qu’elle est connue.', [greeting]),
             step('ko-received', 'Comprendre l’autre', 'Le serveur te demande ton choix',
                  'Écoute et comprends cette question en situation. Tu n’as pas à la construire toi-même.',
                  'Question reçue comme bloc de compréhension ; la salutation vient d’être présentée.', [question]),
             step('ko-visible', 'Échanger', 'Une demande avec sa réponse',
                  'Écoute le serveur, puis la réponse du client. Les deux sont visibles au premier passage.',
                  'Les deux répliques ont été préparées séparément.', [question, coffee], scene=True),
             step('ko-choice', 'Choisir et réutiliser', 'Commande selon ton envie',
                  'Choisis la boisson. Essaie avec le modèle ou sans lui ; tu peux toujours retrouver l’aide.',
                  'Choix entre deux demandes préparées. Aucun lait, prix ou compteur nouveau.',
                  [question, coffee], scene=True, recall=True,
                  choices=[{'id': 'coffee', 'label': 'Un café', 'utterance': coffee},
                           {'id': 'water', 'label': 'De l’eau', 'utterance': water}])]}
    ]
    contract_paths = [HERE / f'received-{p["pair"]["native"]}-{p["pair"]["study"]}.json' for p in pilots]
    contracts = [json.loads(path.read_text()) for path in contract_paths]
    received_check = validate_received(ROOT, pilots, sources, contracts)
    for source in sources:
        for field in ('study', 'phon', 'native', 'reading'):
            if not source['expected'][field].strip():
                raise ValueError(f'Missing source aid: {source["id"]}/{field}')
        if '{s}' in source['expected']['study'] or '……' in source['expected']['study']:
            raise ValueError('Incomplete principal phrase')
    baseline = json.loads((HERE / 'sources/baseline-data.json').read_text())
    commit = baseline['sourceCommit']
    data = {'status': 'proposition-locale-a-relire', 'sourceCommit': commit,
            'pilots': pilots}
    expected = json.loads(json.dumps(baseline))
    for pilot in expected['pilots']:
        for planned in pilot['steps']:
            for phrase in planned['utterances']:
                if phrase['id'] == 'L1-fr-ko-d1-t0':
                    if phrase['role'] != 'Une personne au café':
                        raise ValueError('Baseline greeting role changed')
                    phrase['role'] = 'Serveur'
    if data != expected:
        raise ValueError('Preview differs from 82ddba4 beyond the permitted greeting role')
    report = {'status': 'references-exactes-non-validation-native',
              'sourceCommit': commit, 'uniqueSources': len(sources),
              'pairs': [p['pair'] for p in pilots], 'sources': sources,
              'sourceSha256': {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest()
                               for p in (app_path, conversation_path)},
              'receivedContracts': received_check,
              'plannedSourcesByUse': {kind: sum(s['expected']['kind'] == kind for s in sources)
                                     for kind in ('learner', 'received', 'support', 'brick')},
              'limitations': ['Deux pilotes seulement, pas une correction complète L1–L10.',
                              'Mini-échanges recomposés, pas de dialogues source remplacés.',
                              'Phonétiques copiées ; relecture native et écoute réelle requises.',
                              'Ni compréhension, ni prononciation, ni maîtrise évaluées.']}
    report['baselineReviewCommit'] = '82ddba461952e9a082915c602649ddddffdd7e30'
    report['baselineRawSourceCommit'] = commit
    report['catalogueMainBaseCommit'] = '5a24a6f72b60457f65de648d7353857339e839a1'
    report['snapshotSources'] = {
        str(conversation_path.relative_to(ROOT)): {
            'upstreamFile': 'melunga_deploy/content/conversation/L1-fr-ko.json',
            'snapshotCommit': report['baselineReviewCommit'],
            'sha256': hashlib.sha256(conversation_path.read_bytes()).hexdigest()}}
    report['scope'] = 'Aperçu comparatif uniquement ; aucune intégration aux leçons.'
    report['onlyPedagogicalChange'] = {'utteranceId': 'L1-fr-ko-d1-t0',
        'field': 'role', 'before': 'Une personne au café', 'after': 'Serveur',
        'sourceSpeaker': 'A', 'note': 'Attribution de présentation du pilote recomposé ; le rôle du dialogue source reste inchangé.'}
    report['baselineComparisonPassed'] = True
    report['canonicalContentChanged'] = False
    report['baselineFilesSha256'] = {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest()
                                    for p in (HERE / 'sources/baseline-data.json', HERE / 'sources/baseline-sources.json')}
    return data, report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    data, report = prepare()
    content = 'window.ProgressionPilotData = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n'
    output = ROOT / 'melunga_deploy/essais-progression/data.js'
    expected_report = json.dumps(report, ensure_ascii=False, indent=2) + '\n'
    if args.check:
        if not output.exists() or output.read_text() != content:
            raise SystemExit('Preview data differs: run prepare.py')
        if not (HERE / 'sources.json').exists() or (HERE / 'sources.json').read_text() != expected_report:
            raise SystemExit('Preview provenance differs: run prepare.py')
    else:
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(content)
        (HERE / 'sources.json').write_text(expected_report)
    print(json.dumps({'mode': 'check' if args.check else 'prepare',
                      'pilots': len(data['pilots']), 'steps': sum(len(p['steps']) for p in data['pilots']),
                      'sourceEntries': len(report['sources']), 'sourceMatch': True,
                      'receivedContracts': report['receivedContracts'],
                      'nativeValidation': False}, ensure_ascii=False))


if __name__ == '__main__':
    main()

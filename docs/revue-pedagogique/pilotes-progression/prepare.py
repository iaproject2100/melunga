#!/usr/bin/env python3
"""Build/check a documentary pilot; never write application content."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
sys.dont_write_bytecode = True
sys.path.insert(0, str(ROOT / 'tools/pedagogy'))
from refresh_family_metadata import extract_object


def prepare():
    app_path = ROOT / 'melunga_deploy/app.html'
    decks, _, _ = extract_object(app_path.read_text(), 'DECKS')
    conversation_path = ROOT / 'melunga_deploy/content/conversation/L1-fr-ko.json'
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
                        'dialogueId': dialogue['id'], 'turnIndex': index,
                        'speaker': phrase['speaker'], 'learnerRole': dialogue['learnerRole'],
                        'expected': record})
        return record

    rest = deck('我想休息')
    home = deck('我想回家')
    okay = deck('好的', 'Un proche', 'received')
    coffee = ko_variant('L1-fr-ko-03', 0)
    water = ko_variant('L1-fr-ko-03', 1)
    greeting = ko_turn(0, 'Une personne au café', 'support')
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
                  'Première phrase entière : ne suppose aucun acquis en 需要.', [rest]),
             step('zh-imitate', 'Imiter', 'Redis la même envie',
                  'Écoute, puis répète si tu le souhaites. Garde la phonétique à portée de main.',
                  'Aucune phrase nouvelle.', [rest]),
             step('zh-received', 'Comprendre l’autre', 'Ton proche est d’accord',
                  'Écoute ce qu’il te répond. Tu n’as pas de nouvelle demande à construire.',
                  'Une réponse reçue en contexte : d’accord.', [okay]),
             step('zh-visible', 'Échanger', 'Ton premier échange visible',
                  'Écoute les deux rôles dans l’ordre.',
                  'Réemploi des deux phrases déjà présentées.', [rest, okay], scene=True),
             step('zh-substitute', 'Remplacer', 'Cette fois, tu veux rentrer',
                  'Écoute la nouvelle phrase entière. Le début reste identique ; l’action change.',
                  'Le groupe 回家 remplace 休息 ; ne change ni le temps ni la personne.', [home]),
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
    for source in sources:
        for field in ('study', 'phon', 'native', 'reading'):
            if not source['expected'][field].strip():
                raise ValueError(f'Missing source aid: {source["id"]}/{field}')
        if '{s}' in source['expected']['study'] or '……' in source['expected']['study']:
            raise ValueError('Incomplete principal phrase')
    commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    data = {'status': 'proposition-locale-a-relire', 'sourceCommit': commit,
            'pilots': pilots}
    report = {'status': 'references-exactes-non-validation-native',
              'sourceCommit': commit, 'uniqueSources': len(sources),
              'pairs': [p['pair'] for p in pilots], 'sources': sources,
              'sourceSha256': {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest()
                               for p in (app_path, conversation_path)},
              'limitations': ['Deux pilotes seulement, pas une correction complète L1–L10.',
                              'Mini-échanges recomposés, pas de dialogues source remplacés.',
                              'Phonétiques copiées ; relecture native et écoute réelle requises.',
                              'Ni compréhension, ni prononciation, ni maîtrise évaluées.']}
    return data, report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    data, report = prepare()
    # Stable content provenance: do not make an unrelated documentation commit stale the pilot.
    content = 'window.ProgressionPilotData = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n'
    if args.check:
        existing = json.loads((HERE / 'data.js').read_text().removeprefix('window.ProgressionPilotData = ').rstrip().removesuffix(';'))
        data['sourceCommit'] = existing['sourceCommit']
        if data != existing:
            raise SystemExit('Pilot source content changed: editorial review required')
        old_report = json.loads((HERE / 'sources.json').read_text())
        if report['sources'] != old_report['sources']:
            raise SystemExit('Pilot source references changed: editorial review required')
    else:
        (HERE / 'data.js').write_text(content)
        (HERE / 'sources.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    template = HERE / 'index.html'
    if template.exists():
        standalone = template.read_text().replace('href="./index.html"', 'href=""').replace(
            '<link rel="stylesheet" href="style.css">',
            '<style>\n' + (HERE / 'style.css').read_text() + '\n</style>')
        for filename in ('data.js', 'app.js'):
            script = (HERE / filename).read_text().replace('</script', '<\\/script')
            # Keep embedded source text out of the live DOM, as with external scripts.
            # This is pedagogical masking, not secrecy: the file still contains its data.
            script += '\n;document.currentScript.remove();\n'
            # Keep initialization after the body without relying on defer for inline scripts.
            standalone = standalone.replace(f'<script defer src="{filename}"></script>', '')
            standalone = standalone.replace('</body>', '<script>\n' + script + '\n</script>\n</body>')
        standalone = '\n'.join(line.rstrip() for line in standalone.splitlines()) + '\n'
        export = HERE / 'Melunga-essais-progression.html'
        if args.check:
            if export.read_text() != standalone:
                raise SystemExit('Standalone preview changed: run prepare.py to refresh it')
        else:
            export.write_text(standalone)
    print(json.dumps({'mode': 'check' if args.check else 'prepare',
                      'pilots': len(data['pilots']), 'steps': sum(len(p['steps']) for p in data['pilots']),
                      'sourcePhrases': len(report['sources']), 'sourceMatch': True,
                      'nativeValidation': False}, ensure_ascii=False))


if __name__ == '__main__':
    main()

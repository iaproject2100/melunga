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
from received_contract import validate_received
from review_edits import apply_editorial_amendments
from progression_contract import validate_progression


def prepare():
    app_path = ROOT / 'melunga_deploy/app.html'
    decks, _, _ = extract_object(app_path.read_text(), 'DECKS')
    conversation_path = ROOT / 'melunga_deploy/content/conversation/L1-fr-ko.json'
    conversation = json.loads(conversation_path.read_text())
    sources = []

    def deck(target, role='Toi', kind='learner', language='zh'):
        matches = [(i, c) for i, c in enumerate(decks[language]) if c['t'] == target]
        if len(matches) != 1:
            raise ValueError(f'Expected one catalogue source for {target!r}')
        index, card = matches[0]
        phon_field = 'phf' if language == 'zh' else 'pf'
        record = {'id': f'{language}-deck-{index}', 'study': card['t'],
                  'phon': card[phon_field], 'native': card['frm'],
                  'reading': card['py'], 'role': role, 'kind': kind}
        sources.append({'id': record['id'], 'file': 'melunga_deploy/app.html',
                        'nativeLanguage': 'fr', 'studyLanguage': language,
                        'locator': f'DECKS.{language}[{index}]', 'historicalLevel': card['lv'],
                        'fields': {'study': 't', 'phon': phon_field, 'native': 'frm', 'reading': 'py'},
                        'expected': record})
        return record

    def ko_variant(unit_id, index, slot=False):
        unit = next(u for u in conversation['units'] if u['id'] == unit_id)
        phrase = unit['variants'][index]['slot'] if slot else unit['variants'][index]
        record = {'id': f'{unit_id}-v{index}' + ('-slot' if slot else ''),
                  **{k: phrase[k] for k in ['study', 'phon', 'native', 'reading']},
                  'role': 'La boisson à réutiliser' if slot else 'Client',
                  'kind': 'brick' if slot else 'learner'}
        source = {'id': record['id'], 'file': str(conversation_path.relative_to(ROOT)),
                  'nativeLanguage': 'fr', 'studyLanguage': 'ko', 'unitId': unit_id,
                  'expected': record}
        source['slotOfVariant' if slot else 'variantIndex'] = index
        sources.append(source)
        return record

    def ko_question():
        dialogue = conversation['dialogues'][0]
        assert dialogue['id'] == 'L1-fr-ko-d1' and dialogue['learnerRole'] == 'A'
        phrase = dialogue['turns'][1]
        record = {'id': f'{dialogue["id"]}-t1',
                  **{k: phrase[k] for k in ['study', 'phon', 'native', 'reading']},
                  'role': 'Serveur', 'kind': 'received'}
        sources.append({'id': record['id'], 'file': str(conversation_path.relative_to(ROOT)),
                        'nativeLanguage': 'fr', 'studyLanguage': 'ko',
                        'dialogueId': dialogue['id'], 'turnIndex': 1,
                        'speaker': phrase['speaker'], 'learnerRole': dialogue['learnerRole'],
                        'expected': record})
        return record

    rest = deck('我想休息')
    home = deck('我想回家')
    home_brick = deck('回家', 'Le morceau à réutiliser', 'brick')
    zh_question = deck('你想好了吗？', 'Un proche', 'received')
    okay = deck('好的', 'Un proche', 'received')
    coffee = ko_variant('L1-fr-ko-03', 0)
    water = ko_variant('L1-fr-ko-03', 1)
    water_brick = ko_variant('L1-fr-ko-03', 1, slot=True)
    ko_prompt = ko_question()
    ko_closing = deck('네.', 'Serveur', 'received', language='ko')

    def step(id, stage, phase, title, instruction, novelty, utterances, **extra):
        return dict(id=id, stage=stage, phase=phase, title=title, instruction=instruction,
                    novelty=novelty, utterances=utterances, **extra)

    label = 'Essai de progression · niveau à positionner'
    pilots = [
        {'id': 'fr-zh-envie', 'pair': {'native': 'fr', 'study': 'zh'},
         'title': 'Dire ce que tu veux faire', 'levelLabel': label,
         'goal': 'Après la promenade, choisir entre se reposer et rentrer, puis dire son choix à un proche.',
         'steps': [
             step('zh-understand', 'understand', 'Comprendre', 'Tu veux te reposer',
                  'Après une promenade, tu souhaites faire une pause. Écoute la phrase et retrouve son sens.',
                  'Ici, 我想 sert à dire ce que tu veux faire. Les autres usages du vouloir ne sont pas ajoutés à cette première écoute. Phonétique chyoou proposée localement, sans modifier le catalogue.', [rest]),
             step('zh-imitate', 'imitate', 'Imiter', 'Redis la même envie',
                  'Écoute, puis répète si tu le souhaites. Garde la phonétique à portée de main.',
                  'Même phrase complète, sans nouveauté.', [rest]),
             step('zh-prepare-home', 'prepareReplacement', 'Préparer la suite', 'Tu veux rentrer à la maison',
                  'Écoute la phrase entière. Repère ensuite le morceau qui veut dire « rentrer à la maison ».',
                  '回家 est préparé dans une phrase complète avant substitution. La carte autonome sert d’appui, pas de leçon de mot isolé.',
                  [home], focusBrick=home_brick),
             step('zh-substitute', 'replace', 'Remplacer', 'Une autre action, le même début',
                  'Compare les deux phrases. Le début reste identique ; l’action change.',
                  '休息 et 回家 sont deux groupes d’action préparés. Pas de nouveau temps ni de nouvelle personne.', [rest, home]),
             step('zh-received-question', 'receive', 'Comprendre l’autre', 'Ton proche te laisse choisir',
                  'Tu hésites entre te reposer et rentrer. Écoute la question de ton proche : il te demande si tu as décidé.',
                  '你想好了吗？ est reçu entier dans cette situation ; pas de production ou d’analyse de 想好, 了 ou 吗 demandée.', [zh_question]),
             step('zh-received', 'receive', 'Comprendre l’autre', 'Ton proche accepte ton choix',
                  'Écoute sa réponse possible. Tu n’as pas de nouvelle phrase à construire.',
                  '好的 est une clôture possible de cette scène, pas une réaction garantie de tout interlocuteur.', [okay]),
             step('zh-visible', 'scene', 'Échanger', 'Écoute l’échange complet',
                  'Ton proche pose sa question, tu dis ton choix, puis il te répond.',
                  'Le cycle vient après le remplacement : question reçue, réponse préparée, clôture reçue.',
                  [zh_question, home, okay], scene=True),
             step('zh-choice', 'recall', 'Choisir et réutiliser', 'À toi de choisir ton envie',
                  'Choisis ton intention. Tu peux garder le modèle ou essayer sans lui, puis retrouver l’aide.',
                  'Choix entre deux réponses préparées ; même question et même clôture.',
                  [zh_question, home, okay], scene=True, recall=True,
                  choices=[{'id': 'home', 'label': 'Rentrer à la maison', 'utterance': home},
                           {'id': 'rest', 'label': 'Me reposer', 'utterance': rest}])]},
        {'id': 'fr-ko-demande', 'pair': {'native': 'fr', 'study': 'ko'},
         'title': 'Commander une boisson', 'levelLabel': label,
         'goal': 'Demander du café ou de l’eau, comprendre le serveur et sa confirmation.',
         'steps': [
             step('ko-understand', 'understand', 'Comprendre', 'Tu demandes un café',
                  'Au café, tu souhaites commander. Écoute la demande complète et retrouve son sens.',
                  'Demande polie sans quantité ni ajout. Traduction française proposée dans cet essai ; L1-03 source reste inchangé.', [coffee]),
             step('ko-imitate', 'imitate', 'Imiter', 'Redis la même demande',
                  'Écoute, puis répète si tu le souhaites.',
                  'Même phrase complète, sans nouveauté.', [coffee]),
             step('ko-prepare-water', 'prepareReplacement', 'Préparer la suite', 'Tu préfères de l’eau',
                  'Écoute la phrase entière. Repère ensuite le morceau qui désigne l’eau.',
                  'Le groupe vient de slot[1] de l’unité 03 et reste secondaire à la phrase complète.', [water], focusBrick=water_brick),
             step('ko-substitute', 'replace', 'Remplacer', 'Une autre boisson, la même demande',
                  'Compare les deux demandes. Seule la boisson change.',
                  '물 remplace 커피 ; 주세요 reste identique. La politesse n’est pas une construction réservée à L2.', [coffee, water]),
             step('ko-received', 'receive', 'Comprendre l’autre', 'Le serveur te demande ton choix',
                  'Le serveur te salue et te demande ce que tu désires. Écoute sa réplique entière.',
                  'Un seul interlocuteur. Le tour source entier est appris globalement ; aucune salutation isolée n’est ajoutée ni aucun extrait fabriqué.', [ko_prompt]),
             step('ko-received-closing', 'receive', 'Comprendre l’autre', 'Le serveur confirme',
                  'Écoute sa confirmation possible après ta demande.',
                  '네. est reçu ici comme accusé de réception de la commande. Son emploi comme réponse produite sera un autre passage.', [ko_closing]),
             step('ko-visible', 'scene', 'Échanger', 'Écoute l’échange complet',
                  'Le serveur te demande ton choix, le client commande, puis le serveur confirme.',
                  'Question, réponse préparée et clôture, sans lait, prix ou quantité nouvelle.', [ko_prompt, coffee, ko_closing], scene=True),
             step('ko-choice', 'recall', 'Choisir et réutiliser', 'Commande selon ton envie',
                  'Choisis la boisson. Essaie avec le modèle ou sans lui ; tu peux toujours retrouver l’aide.',
                  'Le modèle peut être masqué volontairement, les deux répliques reçues restent visibles.',
                  [ko_prompt, coffee, ko_closing], scene=True, recall=True,
                  choices=[{'id': 'coffee', 'label': 'Un café', 'utterance': coffee},
                           {'id': 'water', 'label': 'De l’eau', 'utterance': water}])]}
    ]
    edit_plan = json.loads((HERE / 'editorial-amendments.json').read_text())
    editorial = apply_editorial_amendments(sources, edit_plan)
    contract_paths = [HERE / f'received-{p["pair"]["native"]}-{p["pair"]["study"]}.json' for p in pilots]
    contracts = [json.loads(path.read_text()) for path in contract_paths]
    received_check = validate_received(ROOT, pilots, sources, contracts)
    progression_check = validate_progression(pilots)
    for source in sources:
        for field in ('study', 'phon', 'native', 'reading'):
            if not source['expected'][field].strip():
                raise ValueError(f'Missing source aid: {source["id"]}/{field}')
        if '{s}' in source['expected']['study'] or '……' in source['expected']['study']:
            raise ValueError('Incomplete principal phrase')
    commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    data = {'status': 'proposition-locale-a-relire', 'sourceCommit': commit,
            'editorialAmendments': editorial, 'pilots': pilots}
    report = {'status': 'provenance-verifiee-avec-propositions-locales-declarees',
              'sourceCommit': commit, 'uniqueSources': len(sources),
              'pairs': [p['pair'] for p in pilots], 'sources': sources,
              'sourceSha256': {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest()
                               for p in (app_path, conversation_path)},
              'editorialAmendments': editorial,
              'receivedContracts': received_check, 'progression': progression_check,
              'plannedSourcesByUse': {kind: sum(s['expected']['kind'] == kind for s in sources)
                                     for kind in ('learner', 'received', 'brick')},
              'limitations': ['Deux pilotes seulement, pas une correction complète L1–L10.',
                              'Mini-échanges recomposés, pas de dialogues source remplacés.',
                              'Trois corrections locales proposées et tracées ; sources inchangées.',
                              'Relecture native et écoute réelle requises.',
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
                      'sourceEntries': len(report['sources']), 'sourceProvenanceVerified': True,
                      'displayUsesDeclaredProposals': bool(report['editorialAmendments']['count']),
                      'receivedContracts': report['receivedContracts'],
                      'editorialProposals': report['editorialAmendments']['count'],
                      'progression': report['progression'],
                      'nativeValidation': False}, ensure_ascii=False))


if __name__ == '__main__':
    main()

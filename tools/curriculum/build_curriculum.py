#!/usr/bin/env python3
"""Compile the review curriculum; never construct a studied phrase or its phonetics.

The original validated proposal remains an immutable input. The v2 placements are
an explicit additional editorial proposal, not an assertion of learner mastery.
"""
import argparse
import copy
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'docs/curriculum-v2/source'
OUTPUT = ROOT / 'melunga_deploy/content/curriculum'
FIELDS = ('study', 'native', 'phon', 'reading')
ORDER = ['01', '07', '08', '09', '02', '03', '04', '05', '06']
TITLES = ['Saluer', 'Donner son prénom', 'Signaler une incompréhension',
          'Faire répéter', 'Commander une boisson', 'Changer une boisson',
          'Comprendre l’offre et refuser', 'Demander le prix', 'Au café : à toi de jouer']
ZH_TITLES = ['打招呼', '说出名字', '说明自己没听懂', '请对方再说一遍',
             '点一杯饮料', '换一种饮料', '听懂提议并礼貌拒绝', '询问价格', '在咖啡馆：轮到你说']
GOALS = ['Commence une rencontre par un bonjour.', 'Présente-toi, puis change de prénom.',
         'Dis que tu n’as pas compris.', 'Demande à l’autre personne de répéter.',
         'Commande simplement un café.', 'Choisis un café ou un thé.',
         'Écoute une proposition et refuse poliment.', 'Demande le prix et écoute la réponse.',
         'Joue la scène, du bonjour jusqu’au prix.']
ZH_LEVELS = [
 ('完成第一次实用交流', '练习打招呼、点饮料、礼貌拒绝和询问价格。'),
 ('表达简单的意愿', '在熟悉的请求中，说明数量、物品、地点或时间。'),
 ('让交流继续', '询问信息或请求帮助，并用已练习的表达回答。'),
 ('谈论日常生活', '描述熟悉的活动，并说明时间和地点。'),
 ('讲述一件小事', '说明已经发生的事情，再连接两个已练习的事件。'),
 ('一起安排活动', '提出计划、约定时间，并接受或提出另一种选择。'),
 ('解释和比较', '说明偏好和理由，比较两个熟悉的选择。'),
 ('调整请求和协商', '提出调整、说明条件，并商量一个具体的解决办法。'),
 ('应对意外情况', '说明问题、确认理解，并寻找解决办法。'),
 ('更灵活地交流', '复述对方的意思、补充自己的观点，并结束讨论。'),
]


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'))


def copied(record, source):
    for field in FIELDS:
        assert record.get(field) == source.get(field), (record.get('id'), field)


def verify_entry(entry):
    source_path = SOURCE / 'conversation' / Path(entry['sourceFile']).name
    assert sha(source_path) == entry['sourceFileSha256']
    document = read(source_path)
    for record in entry['records'].values():
        locator = record['source']
        if locator['kind'] == 'conversation-variant':
            unit = next(u for u in document['units'] if u['id'] == locator['unitId'])
            expected = unit['variants'][locator['variantIndex']]
        else:
            dialogue = next(d for d in document['dialogues'] if d['id'] == locator['dialogueId'])
            expected = dialogue['turns'][locator['turnIndex']]
            if locator['kind'] == 'dialogue-turn-fragment':
                expected = {key: expected[key][start:end]
                            for key, (start, end) in locator['unicodeCodepointSpans'].items()}
        copied(record['copy'], expected)


def phrase(record, received=False):
    result = {key: record[key] for key in ('id', *FIELDS) if key in record}
    result.update(kind='received' if received else 'learner', speaker='B' if received else 'A')
    return result


def step(id_, kind, utterance=None, **extra):
    result = {'id': id_, 'kind': kind, 'wholePhrase': True,
              'requiresProduction': kind in ('imitate', 'choose-and-recall', 'reply-with-help', 'reply-without-model')}
    if utterance:
        result['utterance'] = utterance
    result.update(extra)
    return result


def prepare_steps(id_, ids):
    return [step(f'{id_}-{kind}-{i}', kind, pid)
            for i, pid in enumerate(ids) for kind in ('understand', 'imitate')]


def starter_lessons(entry, cafe, native):
    records = {}
    for record in entry['records'].values():
        r = copy.deepcopy(record['copy'])
        r['id'] = Path(entry['sourceFile']).name + ':' + record['id']
        records[record['id']] = phrase(r, record.get('speaker') == 'B')
    # The café integration is the already reviewed extraction, including its
    # character-offset fragments and received/answerWith declarations.
    cafes = {p['id']: p for p in cafe['phrases']}
    for record in records.values():
        if record['id'] in cafes:
            copied(record, cafes[record['id']])
    source_lessons = {l['id'][-2:]: l for l in entry['lessons']}
    lessons = []
    for number, old_id in enumerate(ORDER, 1):
        source = source_lessons[old_id]
        lid = entry['id'] + '-starter-' + str(number).zfill(2)
        ids = [records[r]['id'] for r in source['newLearnerPhraseRefs']]
        ps = [copy.deepcopy(records[r]) for r in source['newLearnerPhraseRefs']]
        steps = prepare_steps(lid, ids)
        if source.get('sourceDialogueOnly'):
            ps = copy.deepcopy(cafe['phrases'])
            steps = []
            for phase in cafe['steps']:
                for index, pid in enumerate(phase['turns']):
                    received = cafes[pid]['kind'] == 'received'
                    steps.append(step(f'{lid}-{phase["kind"]}-{index}', phase['kind'], pid,
                                      speaker=cafes[pid]['speaker'], requiresProduction=(
                                          not received and phase['kind'] != 'listen-whole-dialogue')))
        elif source.get('preparedChoice'):
            choice = source['preparedChoice']
            choices = [records[r]['id'] for r in choice['phraseRefs']]
            for ref in choice['phraseRefs']:
                if records[ref]['id'] not in {p['id'] for p in ps}:
                    ps.append(copy.deepcopy(records[ref]))
                    # A learner may open this lesson directly. Previous lesson
                    # exposure is not assumed, so both whole phrases are heard.
                    steps = prepare_steps(lid, choices)
            steps.append(step(lid + '-compare', 'compare', choices=choices))
            steps.append(step(lid + '-choose', 'choose-and-recall', choices=choices, canRestoreHelp=True))
        else:
            for received in source.get('received', []):
                r = records[received['phrase']]
                ps.append(copy.deepcopy(r))
                steps.append(step(lid + '-receive-' + str(len(steps)), 'receive', r['id'],
                                  speaker='B', requiresProduction=False))
                answers = [records[a['phrase']]['id'] for a in received.get('answerWith', [])]
                if answers:
                    steps.append(step(lid + '-reply', 'reply-without-model', answers[0],
                                      canRestoreHelp=True, speaker='A'))
            if not source.get('received'):
                steps.append(step(lid + '-recall', 'choose-and-recall', choices=ids, canRestoreHelp=True))
        lessons.append({'id': lid, 'title': (ZH_TITLES if native == 'zh' else TITLES)[number - 1],
                        'goal': (ZH_TITLES[number - 1] if native == 'zh' else GOALS[number - 1]),
                        'situation': '在咖啡馆' if native == 'zh' and old_id in ('02','03','04','05','06') else
                                     'Au café' if old_id in ('02','03','04','05','06') else '',
                        'kind': 'dialogue' if old_id == '06' else 'starter',
                        'capability': old_id, 'sourceLevel': 1, 'phrases': ps, 'steps': steps,
                        'freePrompt': '可以重听范例，再试着自己说。' if native == 'zh' else
                                      'Réécoute si besoin, puis essaie de répondre avec tes propres mots.'})
    return lessons


def unit_lesson(unit, native):
    phrases = [phrase(p) for p in unit['phrases']]
    phrases += [phrase(p['phrase']) for p in unit.get('preparations', [])]
    return {'id': unit['unitId'], 'title': unit['situation'] if native == 'zh' else unit['focus'],
            'goal': '先听懂完整句子，跟读，再选择想表达的意思。' if native == 'zh' else
                    'Comprends les phrases entières, répète, puis choisis ce que tu veux dire.',
            'situation': unit['situation'], 'kind': 'unit', 'sourceLevel': unit['sourceLevel'],
            'phrases': phrases, 'steps': copy.deepcopy(unit['steps']),
            'source': unit['source'], 'plannedPrerequisites': unit['plannedPrerequisites'],
            'freePrompt': ('保留已练习的句式，试着换用一个学过的内容。可以随时重听范例。' if native == 'zh' else
                           'Garde le cadre appris et essaie un autre élément déjà rencontré. Le modèle reste accessible.')
                          if unit['firstSubstitution'] else
                          ('选择一句已练习的完整表达，试着在类似场景中说出来。' if native == 'zh' else
                           'Choisis une expression entière préparée et essaie de la réemployer dans une situation semblable.')}


def apply_placement_steps(lesson, unit, placement):
    order = placement.get('variantOrder', unit['variantOrder'])
    steps, prepared = [], set()
    comparison = next((copy.deepcopy(s) for s in unit['steps'] if s['kind'] == 'compare'), None)
    for index in order:
        pid = unit['phrases'][index]['id']
        for kind in ('understand', 'imitate'):
            steps.append(step(unit['unitId'] + '-' + kind + '-' + str(index), kind, pid))
        prepared.add(pid)
        if comparison and set(comparison['choices']).issubset(prepared):
            steps.append(comparison)
            comparison = None
    steps.append(step(unit['unitId'] + '-choose', 'choose-and-recall',
                      choices=[unit['phrases'][i]['id'] for i in order], canRestoreHelp=True))
    lesson['steps'] = steps


def first_exposure(item, native, units):
    unit = units[item['unitId']]
    record = unit['phrases'][item['variantIndex']]
    copied(record, item['phrase'])
    title = ('说出居住的城市' if item['id'].endswith('HOME') else '说明工作地点') if native == 'zh' else item['title']
    pid, lid = record['id'], item['id']
    return {'id': lid, 'title': title, 'goal': '先练习一个完整句子，稍后再练习其他变化。' if native == 'zh' else
            'Prépare une première phrase entière ; les autres variations viendront ensuite.',
            'kind': 'unit', 'sourceLevel': unit['sourceLevel'], 'level': 2,
            'source': unit['source'], 'preparesWholeFamily': False,
            'phrases': [phrase(record)], 'steps': prepare_steps(lid, [pid]) +
                [step(lid + '-recall', 'choose-and-recall', choices=[pid], canRestoreHelp=True)]}


def validate_runtime(data):
    assert [l['level'] for l in data['levels']] == list(range(1, 11))
    assert len(data['levels'][0]['lessons']) == 9
    lessons = [u for l in data['levels'] for u in l['lessons']]
    assert len({u['id'] for u in lessons}) == len(lessons)
    for lesson in lessons:
        bank = {p['id']: p for p in lesson['phrases']}
        assert len(bank) == len(lesson['phrases'])
        prepared = set()
        for s in lesson['steps']:
            if s.get('utterance'):
                assert s['utterance'] in bank, s
                if s['kind'] == 'imitate':
                    prepared.add(s['utterance'])
                if bank[s['utterance']]['kind'] == 'received':
                    assert not s['requiresProduction'], s
            for pid in s.get('choices', []):
                assert pid in bank and pid in prepared, (lesson['id'], s, pid)
    for ref in data['freeLibrary']:
        assert ref['sourceLevel'] == 1 and ref['id'] in {u['id'] for u in lessons}


def build():
    source_manifest = read(SOURCE / 'manifest.json')
    for name, digest in source_manifest['files'].items():
        assert sha(SOURCE / name) == digest, ('source-changed', name)
    plan = read(SOURCE / 'parcours-corriges.json')
    common = read(SOURCE / 'cadre-commun.json')
    placements = read(SOURCE / 'placements-entree-v2.json')
    # The placement file is a separate, reviewable decision. It cannot rewrite
    # phrases or phonetics from the previous reviewed proposal.
    placement_map = {item['unitId']: item for item in placements['placements']}
    cafe = read(ROOT / 'melunga_deploy/content/l1-cafe.json')
    cafe_map = {p['id']: p for p in cafe['pairs']}
    entry_map = {p['id']: p for p in common['l1Entry']['pairs']}
    for entry in entry_map.values():
        verify_entry(entry)
    app_lines = (ROOT / 'melunga_deploy/app.html').read_text().splitlines()
    protected_lines = {name: next(line for line in app_lines if line.startswith('var ' + name + ' = '))
                       for name in ('DECKS', 'PEDAGOGY_FAMILIES')}
    decks, _ = json.JSONDecoder().raw_decode(protected_lines['DECKS'].split('=', 1)[1].lstrip())
    outputs = {}
    counts = {'sourceUnits': 0, 'sourceVariants': 0, 'starterLessons': 0, 'copiedSourceFields': 0,
              'runtimeLessons': 0, 'runtimeSteps': 0, 'firstExposures': 0,
              'newStudiedPhrases': 0, 'newPhonetics': 0}
    for pair in plan['pairs']:
        native = pair['nativeLanguage']
        result = {'version': 1, 'id': pair['id'], 'nativeLanguage': native,
                  'studyLanguage': pair['studyLanguage'], 'status': 'owner-instruction-activated',
                  'publicationApproved': True,
                  'doesNotMeasureAcquisition': True, 'levels': [], 'freeLibrary': []}
        for level in common['commonLevelPlan']:
            number = level['level']
            result['levels'].append({'level': number,
                'title': ZH_LEVELS[number - 1][0] if native == 'zh' else level['title'],
                'goal': ZH_LEVELS[number - 1][1] if native == 'zh' else level['commonCapability'], 'lessons': []})
        result['levels'][0]['lessons'] = starter_lessons(entry_map[pair['id']], cafe_map[pair['id']], native)
        counts['starterLessons'] += 9
        source_units = {u['unitId']: u for l in pair['levels'] for u in l['units']}
        for level in pair['levels']:
            for unit in level['units']:
                source = read(SOURCE / 'conversation' / Path(unit['source']['file']).name)
                original = next(u for u in source['units'] if u['id'] == unit['unitId'])
                assert len(unit['phrases']) == len(original['variants']) == 4
                for record, variant in zip(unit['phrases'], original['variants']):
                    copied(record, variant)
                    counts['copiedSourceFields'] += sum(k in variant for k in FIELDS)
                for prep in unit.get('preparations', []):
                    card = decks[prep['source']['collection'].split('.')[-1]][prep['source']['index']]
                    copied(prep['phrase'], {k: card[v] for k, v in prep['source']['fieldMap'].items()})
                target = placement_map.get(unit['unitId'], {}).get('proposedLevel', unit['proposedLevel'])
                assert 2 <= target <= 10, ('original-unit-in-beginner-L1', unit['unitId'], target)
                lesson = unit_lesson(unit, native)
                if unit['unitId'] in placement_map:
                    apply_placement_steps(lesson, unit, placement_map[unit['unitId']])
                # These are planned editorial links, never an assertion about
                # what this person knows. A moved prerequisite cannot remain
                # recorded as preparation before it has even been presented.
                future = {link['plannedPrerequisite'] for link in placements['forwardPlannedPrerequisites']
                          if link['unitId'] == unit['unitId']}
                lesson['plannedPrerequisites'] = [uid for uid in lesson['plannedPrerequisites'] if uid not in future]
                lesson['level'] = target
                result['levels'][target - 1]['lessons'].append(lesson)
                if unit['sourceLevel'] == 1:
                    result['freeLibrary'].append(copy.deepcopy(lesson))
                counts['sourceUnits'] += 1
                counts['sourceVariants'] += len(unit['phrases'])
        for item in placements['firstExposure']:
            if item['pair'] == pair['id']:
                result['levels'][1]['lessons'].append(first_exposure(item, native, source_units))
                counts['firstExposures'] += 1
        # Follow the explicit full editorial order, including the two common
        # whole-phrase introductions. No level is balanced by token length.
        course_order = next(p for p in placements['courseOrder'] if p['pair'] == pair['id'])
        for level in result['levels'][1:]:
            ordered = next(l for l in course_order['levels'] if l['level'] == level['level'])
            sequence = {item.get('unitId', item.get('id')): item['sequenceOrder'] for item in ordered['sequence']}
            assert set(sequence) == {u['id'] for u in level['lessons']}
            level['lessons'].sort(key=lambda u: sequence[u['id']])
        validate_runtime(result)
        counts['runtimeLessons'] += sum(len(l['lessons']) for l in result['levels'])
        counts['runtimeSteps'] += sum(len(u['steps']) for l in result['levels'] for u in l['lessons'])
        outputs[OUTPUT / (pair['id'] + '.json')] = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
    assert counts['sourceUnits'] == 841 and counts['sourceVariants'] == 3364
    index = {'version': 1, 'pairs': {}}
    for file, content in outputs.items():
        data = json.loads(content)
        index['pairs'][data['id']] = {'levels': [{k: level[k] for k in ('level', 'title', 'goal')}
                                                for level in data['levels']]}
    index_path = ROOT / 'melunga_deploy/curriculum-index.js'
    outputs[index_path] = '/* Generated by tools/curriculum/build_curriculum.py. */\nwindow.MelungaCurriculumIndex = ' + json.dumps(index, ensure_ascii=False, separators=(',', ':')) + ';\n'
    report = {'version': 1, 'status': 'owner-instruction-activated', 'publicationApproved': True,
              'sourcePlanCommit': source_manifest['planSourceCommit'],
              'sourcePlanSha256': sha(SOURCE / 'parcours-corriges.json'),
              'entrySha256': sha(SOURCE / 'cadre-commun.json'),
              'placementSha256': sha(SOURCE / 'placements-entree-v2.json'),
              'classicContentLineSha256': {name: hashlib.sha256(line.encode()).hexdigest()
                                           for name, line in protected_lines.items()},
              'counts': counts, 'unresolvedSourceReservations': 341,
              'limitations': ['This is not a pedagogical validation of all 32115 classic catalogue cards.',
                             'Source dialogue corpus beyond the independently activated café scenes is not integrated here.',
                             'Planned exposure and completed navigation do not measure acquisition.',
                             'Owner explicitly authorizes production of this L1 sequence and v2 placements, accepting the unplayed hosted path and absent native re-review of the new sequence.'],
              'runtimeFilesSha256': {str(p.relative_to(ROOT)): hashlib.sha256(t.encode()).hexdigest()
                                     for p, t in outputs.items()}}
    outputs[ROOT / 'docs/curriculum-v2/build-report.json'] = json.dumps(report, ensure_ascii=False, indent=2) + '\n'
    return outputs, counts


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    outputs, counts = build()
    for path, content in outputs.items():
        if args.check:
            assert path.exists() and path.read_text(encoding='utf-8') == content, ('stale-output', str(path))
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding='utf-8')
    print(json.dumps({'ok': True, 'check': args.check, **counts}, ensure_ascii=False))


if __name__ == '__main__':
    main()

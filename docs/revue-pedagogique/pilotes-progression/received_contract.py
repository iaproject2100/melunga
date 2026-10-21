"""Validate the documentary reception plan; never infer a person's learning."""
import json
import re


def require(condition, message):
    if not condition:
        raise ValueError(message)


def validate_received(root, pilots, sources, contracts):
    by_pilot = {p['id']: p for p in pilots}
    by_source = {s['id']: s for s in sources}
    require(len(by_pilot) == len(pilots) and len(by_source) == len(sources), 'Duplicate pilot or source id')

    def check_phrase(phrase, pilot, kind=None):
        source = by_source.get(phrase.get('id'))
        require(source is not None, 'Unknown presented source')
        require((source.get('nativeLanguage'), source.get('studyLanguage')) ==
                (pilot['pair']['native'], pilot['pair']['study']), 'Presented source pair mismatch')
        require(all(phrase.get(f) == source['expected'].get(f)
                    for f in ('study', 'phon', 'native', 'reading', 'kind')), 'Presented source or aid changed')
        require(kind is None or phrase.get('kind') == kind, 'Invalid source use')
        fields = ('study', 'phon', 'native') + (('reading',) if pilot['pair']['study'] in ('zh', 'ja', 'ko') else ())
        require(all(isinstance(phrase.get(f), str) and phrase[f].strip() for f in fields), 'Missing source aid')

    for pilot in pilots:
        for step in pilot['steps']:
            for phrase in step['utterances']:
                check_phrase(phrase, pilot)
            for choice in step.get('choices', []):
                check_phrase(choice['utterance'], pilot, 'learner')
            if step.get('focusBrick'):
                check_phrase(step['focusBrick'], pilot, 'brick')
    seen = set()
    pending = []
    for contract in contracts:
        require(type(contract.get('version')) is int and contract['version'] == 2, 'Unsupported received version')
        require(bool(re.fullmatch(r'[a-f0-9]{40}', contract.get('sourceCommit', ''))), 'Invalid source commit')
        require(contract.get('sceneType') == 'recomposition-pilote', 'Pilot and original dialogue must remain distinct')
        pilot = by_pilot.get(contract.get('sceneId'))
        require(pilot is not None, 'Unknown pilot scene')
        require((contract.get('nativeLanguage'), contract.get('studyLanguage')) ==
                (pilot['pair']['native'], pilot['pair']['study']), 'Received language pair mismatch')
        order = {s['id']: i for i, s in enumerate(pilot['steps'])}
        require(len(order) == len(pilot['steps']), 'Duplicate step id')
        steps = {s['id']: s for s in pilot['steps']}
        entries = contract.get('received')
        require(isinstance(entries, list) and entries, 'Received entries required')
        for entry in entries:
            uid = entry.get('utteranceId')
            key = (pilot['id'], uid)
            require(key not in seen, 'Duplicate received entry')
            seen.add(key)
            source = by_source.get(uid)
            require(source is not None, 'Unknown received source')
            require((source.get('nativeLanguage'), source.get('studyLanguage')) ==
                    (pilot['pair']['native'], pilot['pair']['study']), 'Received source pair mismatch')
            phrase = source['expected']
            require(phrase.get('kind') == 'received', 'Source is not a received phrase')
            ref = entry.get('source', {})
            require(ref.get('expectedStudy') == phrase['study'], 'Received source text changed')
            if ref.get('type') == 'catalogue':
                require(ref.get('language') == pilot['pair']['study'], 'Catalogue language mismatch')
                index = ref.get('sourceIndex')
                require(type(index) is int and index >= 0, 'Invalid catalogue index')
                require(source.get('locator') == f'DECKS.{ref["language"]}[{index}]', 'Catalogue reference mismatch')
            elif ref.get('type') == 'dialogueTurn':
                index, level, role = ref.get('turnIndex'), ref.get('level'), ref.get('learnerRole')
                require(type(index) is int and index >= 0, 'Invalid turn index')
                require(type(level) is int and 1 <= level <= 10, 'Invalid source level')
                require(role in ('A', 'B'), 'Invalid learner role')
                path = root / 'melunga_deploy/content/conversation' / f'L{level}-{pilot["pair"]["native"]}-{pilot["pair"]["study"]}.json'
                data = json.loads(path.read_text())
                dialogue = next((d for d in data['dialogues'] if d['id'] == ref.get('dialogueId')), None)
                require(dialogue is not None, 'Unknown original dialogue')
                require(dialogue['learnerRole'] == role, 'Original learner role mismatch')
                require(index < len(dialogue['turns']), 'Turn index outside original dialogue')
                turn = dialogue['turns'][index]
                require(turn['speaker'] in ('A', 'B') and turn['speaker'] != role, 'Received turn belongs to learner')
                require(source.get('dialogueId') == dialogue['id'] and source.get('turnIndex') == index,
                        'Dialogue source reference mismatch')
                require(all(turn.get(f) == source.get('original', phrase).get(f) for f in ('study', 'phon', 'native', 'reading')),
                        'Original turn or its aids changed')
            else:
                raise ValueError('Unknown received source type')
            require(entry.get('analyse') is False, 'Received must be presented as a whole')
            require(entry.get('countsAsProduction') is False, 'Received cannot count as production')
            require('preparedInStep' not in entry, 'Use introducedInStep for a received presentation')
            preparation = entry.get('introducedInStep')
            require(preparation in steps, 'Unknown received introduction step')
            require(any(u['id'] == uid for u in steps[preparation]['utterances']), 'Received introduction does not present the source')
            first_presentation = min(order[s['id']] for s in pilot['steps'] if any(u['id'] == uid for u in s['utterances']))
            require(order[preparation] == first_presentation, 'introducedInStep must identify the first presentation')
            scenes = [s for s in pilot['steps'] if s.get('scene') and any(u['id'] == uid for u in s['utterances'])]
            require(bool(scenes), 'Received source is not used in any scene')
            first_scene = min(order[s['id']] for s in scenes)
            require(order[preparation] < first_scene, 'Received preparation must precede scene')
            require(type(entry.get('replyRequired')) is bool, 'Reply requirement must be explicit')
            answers = entry.get('answerWith')
            require(isinstance(answers, list), 'Exact answer references required; use [] for no reply')
            require(bool(answers) == entry['replyRequired'], 'Reply requirement and answer list disagree')
            answer_ids = set()
            for answer in answers:
                require(set(answer) == {'utteranceId', 'expectedStudy', 'preparedInStep'},
                        'Answer must identify one registered whole phrase and its preparation')
                candidate = by_source.get(answer.get('utteranceId'))
                require(candidate is not None, 'Unknown exact answer source')
                require((candidate.get('nativeLanguage'), candidate.get('studyLanguage')) ==
                        (pilot['pair']['native'], pilot['pair']['study']), 'Answer source pair mismatch')
                require(candidate['expected']['kind'] == 'learner', 'Answer is not a productive phrase')
                require(candidate['expected']['study'] == answer.get('expectedStudy'), 'Answer text changed')
                require(candidate['id'] not in answer_ids, 'Duplicate answer reference')
                answer_ids.add(candidate['id'])
                prepared = answer.get('preparedInStep')
                require(prepared in steps and order[prepared] < first_scene, 'Answer preparation must precede scene')
                require(any(u['id'] == candidate['id'] for u in steps[prepared]['utterances']),
                        'Answer preparation does not present the productive phrase')
            if entry['replyRequired']:
                for scene in scenes:
                    positions = [i for i, u in enumerate(scene['utterances']) if u['id'] == uid]
                    for position in positions:
                        following = scene['utterances'][position + 1:position + 2]
                        require(bool(following) and following[0]['kind'] == 'learner',
                                'Expected productive reply must follow every received occurrence')
                        possible = following + [choice['utterance'] for choice in scene.get('choices', [])]
                        require(all(u['id'] in answer_ids for u in possible),
                                'Scene response is not covered by answerWith')
            else:
                require(all(all(i == len(s['utterances']) - 1 for i, u in enumerate(s['utterances']) if u['id'] == uid)
                            for s in scenes),
                        'A no-reply closing must end the pilot scene')
            pending.append((phrase, entry))
    used = {(p['id'], u['id']) for p in pilots for s in p['steps'] for u in s['utterances'] if u['kind'] == 'received'}
    require(seen == used, 'Missing or unused received contract')
    # Apply only after all contracts pass. No partial annotation on failure.
    for phrase, entry in pending:
        for field in ('analyse', 'countsAsProduction', 'replyRequired', 'answerWith', 'introducedInStep'):
            phrase[field] = entry[field]
    return {'scenes': len(contracts), 'receivedSources': len(pending),
            'answerReferences': sum(len(e['answerWith']) for _, e in pending),
            'noReplyClosings': sum(not e['replyRequired'] for _, e in pending),
            'learnerAcquisitionValidated': False}

"""Check the shared editorial order, without assessing the learner."""


def validate_progression(pilots):
    stages = ['understand', 'imitate', 'prepareReplacement', 'replace', 'receive', 'scene', 'recall']
    ranks = {stage: i for i, stage in enumerate(stages)}
    cycles = 0
    for pilot in pilots:
        actual = [step.get('stage') for step in pilot['steps']]
        if any(stage not in ranks for stage in actual):
            raise ValueError('Unknown progression stage')
        if sorted(actual, key=ranks.get) != actual or not all(stage in actual for stage in stages):
            raise ValueError('Expected understand, imitate, prepare, replace, receive, scene, recall order')
        for step in pilot['steps']:
            choice_ids = [choice.get('id') for choice in step.get('choices', [])]
            if (any(not isinstance(choice_id, str) or not choice_id.strip() for choice_id in choice_ids)
                    or len(set(choice_ids)) != len(choice_ids)):
                raise ValueError('Choice ids must be nonempty strings unique within a step')
            if not step.get('scene'):
                continue
            turns = step['utterances']
            if len(turns) != 3 or [u['kind'] for u in turns] != ['received', 'learner', 'received']:
                raise ValueError('Pilot scene must show question, productive reply and closing')
            if turns[0].get('replyRequired') is not True or turns[2].get('replyRequired') is not False:
                raise ValueError('Pilot scene needs a question and a terminal closing')
            cycles += 1
    return {'sharedOrder': stages, 'completePilotScenes': cycles,
            'learnerAcquisitionValidated': False}

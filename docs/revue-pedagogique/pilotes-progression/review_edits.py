"""Apply explicitly declared review proposals, preserving the source snapshot."""
import copy


def apply_editorial_amendments(sources, plan):
    by_id = {s['id']: s for s in sources}
    if len(by_id) != len(sources):
        raise ValueError('Duplicate source id')
    seen = set()
    pending = []
    for change in plan['changes']:
        key = (change.get('utteranceId'), change.get('field'))
        if key in seen or change.get('field') not in ('phon', 'native'):
            raise ValueError('Duplicate or unsupported editorial amendment')
        seen.add(key)
        source = by_id.get(change['utteranceId'])
        if source is None or source['expected'][change['field']] != change.get('expectedSource'):
            raise ValueError('Editorial amendment source mismatch')
        if not all(isinstance(change.get(k), str) and change[k].strip() for k in ('id', 'proposed', 'reason')):
            raise ValueError('Editorial amendment needs an explicit proposal and reason')
        if change['proposed'] == change['expectedSource']:
            raise ValueError('Editorial amendment is unchanged')
        pending.append((source, change))
    for source in sources:
        source['original'] = {k: source['expected'].get(k) for k in ('study', 'phon', 'native', 'reading')}
    for source, change in pending:
        source['expected'][change['field']] = change['proposed']
        source.setdefault('editorialChanges', []).append(copy.deepcopy(change))
        fields = {item['field'] for item in source['editorialChanges']}
        source['expected']['editorialNote'] = ('Phonétique proposée pour cet essai' if fields == {'phon'}
                                              else 'Traduction proposée pour cet essai')
    return {'status': plan['status'], 'count': len(pending),
            'sourceFilesChanged': False, 'changes': copy.deepcopy(plan['changes'])}

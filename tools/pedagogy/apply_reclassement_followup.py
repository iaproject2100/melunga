#!/usr/bin/env python3
"""Replay the selected editorial amendments to the frozen 99478df proposal.

This only writes the selected editorial inputs and the decision log. It never
rewrites the canonical conversation files or their pronunciation aids.
"""
import argparse
from copy import deepcopy
import json
from pathlib import Path
import subprocess
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
BASELINE = '99478dfd515c7498a71209d5316ad702313789bb'
DIRECTORY = Path('docs/progression-corrections')
REVIEW = DIRECTORY / 'suivi-relecture'
INPUTS = ('editorial-en-es.json', 'editorial-ko-it.json', 'editorial-zh-fr.json')
PROPOSALS = ('marches-en-ko-propositions.json', 'espagnol-propositions.json',
             'italien-propositions.json', 'espagnol-nouveaute-propositions.json',
             'sinophones-nouveaute-propositions.json')
ALLOWED = {'proposedLevel', 'order', 'plannedPrerequisites', 'rationale',
           'gaps', 'variantOrder', 'focus', 'firstSubstitution'}
DECLINED = {
    'L7-fr-en-08': 'Le grief de longueur est retiré dans la seconde relecture de Claude. Aucun retour de niveau n’est retenu sur ce signal ; le placement L6 de 99478df reste soumis à revue linguistique.',
    'L7-fr-en-09': 'Même décision que pour L7-fr-en-08 : conserver le candidat 99478df, sans déplacement destiné à rendre la courbe de longueur monotone.',
}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def pinned(path):
    return json.loads(subprocess.check_output(
        ['git', '-C', str(ROOT), 'show', f'{BASELINE}:{path}']))


def formatted(value):
    return json.dumps(value, ensure_ascii=False, indent=2) + '\n'


def replay():
    baseline = pinned(DIRECTORY / 'parcours-corriges.json')
    original = {
        unit['unitId']: unit for pair in baseline['pairs']
        for level in pair['levels'] for unit in level['units']
    }
    documents = {DIRECTORY / name: pinned(DIRECTORY / name) for name in INPUTS}
    pairs = {pair['pair']: pair for data in documents.values() for pair in data['pairs']}
    units = {unit['unitId']: unit for pair in pairs.values() for unit in pair['units']}
    before = deepcopy(units)
    selections, reasons, amended = [], {}, set()

    for filename in PROPOSALS:
        proposal = json.loads((ROOT / REVIEW / filename).read_text(encoding='utf-8'))
        require(BASELINE.startswith(proposal['baseline']), f'Wrong baseline: {filename}')
        for pair in proposal.get('pairs', [proposal]):
            pair_id = pair['pair']
            require(pair_id in pairs, f'Unexpected pair: {pair_id}')
            for decision in pair['units']:
                uid = decision['unitId']
                require(uid in units and uid in original, f'Unknown unit: {uid}')
                require(uid in {u['unitId'] for u in pairs[pair_id]['units']},
                        f'Wrong pair for unit: {uid}')
                evidence_rows = [(uid, item) for item in decision['sourceEvidence']]
                evidence_rows += [(item['unitId'], item)
                                  for item in decision.get('prerequisiteEvidence', [])]
                for evidence_uid, evidence in evidence_rows:
                    require(evidence_uid in original, f'Unknown source evidence: {evidence_uid}')
                    source = original[evidence_uid]
                    phrase = source['phrases'][evidence['variantIndex']]
                    for field in ('study', 'native', 'phon', 'reading'):
                        if field in evidence:
                            require(evidence[field] == phrase.get(field),
                                    f'Source evidence differs: {evidence_uid} {field}')
                    if 'sourceFile' in evidence:
                        require(evidence['sourceFile'] == source['source']['file'],
                                f'Source locator differs: {evidence_uid}')
                    if 'proposedLevel' in evidence:
                        require(evidence['proposedLevel'] == source['proposedLevel'],
                                f'Evidence level differs: {evidence_uid}')
                action, patch = decision['decision'], decision.get('proposedPatch')
                require(action in ('amend', 'retain'), f'Unsupported action: {action}')
                require(bool(patch) == (action == 'amend'), f'Patch/action mismatch: {uid}')
                selections.append({'pair': pair_id, 'unitId': uid,
                                   'decision': 'decline-amendment' if uid in DECLINED else action,
                                   'proposal': str(REVIEW / filename),
                                   'reason': DECLINED.get(uid, decision['rationale'])})
                if action == 'amend' and uid not in DECLINED:
                    require(uid not in amended, f'Duplicate amendment: {uid}')
                    require(set(patch) <= ALLOWED and set(patch) <= set(units[uid]),
                            f'Patch would add or change a protected field: {uid}')
                    units[uid].update(deepcopy(patch))
                    amended.add(uid)
                    reasons[uid] = decision['rationale']
            for level_string, ordered_ids in pair.get('levelOrdersAfterAmendments', {}).items():
                if pair_id == 'fr-en':
                    # The second review withdraws the requested length reversal.
                    continue
                level = int(level_string)
                members = {u['unitId'] for u in pairs[pair_id]['units'] if u['proposedLevel'] == level}
                require(len(set(ordered_ids)) == len(ordered_ids) and set(ordered_ids) == members,
                        f'Incomplete order for {pair_id} L{level}')
                for order, uid in enumerate(ordered_ids, 1):
                    units[uid]['order'] = order
                    reasons.setdefault(uid, f'Renumérotation contiguë après les deux retours en L7 ; ordre relatif conservé en L{level}.')

    for pair_id, pair in pairs.items():
        ordered = sorted(pair['units'], key=lambda u: (u['proposedLevel'], u['order']))
        positions = {u['unitId']: i for i, u in enumerate(ordered)}
        for level in range(1, 11):
            rows = [u for u in ordered if u['proposedLevel'] == level]
            require(rows and [u['order'] for u in rows] == list(range(1, len(rows) + 1)),
                    f'Non-contiguous order: {pair_id} L{level}')
        for unit in ordered:
            uid = unit['unitId']
            require((unit['sourceLevel'] == 1) == (unit['proposedLevel'] == 1), f'L1 boundary: {uid}')
            for dependency in unit['plannedPrerequisites']:
                require(dependency in positions and positions[dependency] < positions[uid],
                        f'Prerequisite not earlier: {uid} -> {dependency}')
            require(sorted(unit['variantOrder']) == [0, 1, 2, 3], f'Variants lost: {uid}')
        previous_l1 = sorted((u for u in before.values() if u['sourceLevel'] == 1
                              and u['unitId'] in positions), key=lambda u: u['order'])
        require([u['unitId'] for u in ordered if u['proposedLevel'] == 1]
                == [u['unitId'] for u in previous_l1], f'L1 order changed: {pair_id}')

    changes = []
    for uid, unit in units.items():
        changed = {key: {'before': before[uid][key], 'after': value}
                   for key, value in unit.items() if value != before[uid][key]}
        require(set(changed) <= ALLOWED, f'Unexpected changed fields: {uid}')
        if changed:
            changes.append({'unitId': uid, 'reason': reasons[uid], 'fields': changed})
    log = {'baseline': BASELINE, 'status': 'editorial-amendments-for-cross-review',
           'publicationApproved': False, 'doesNotMeasureAcquisition': True,
           'canonicalSourcePolicy': 'unchanged-text-phonetics-reading-access',
           'explicitAmendments': len(amended), 'changedEditorialRows': len(changes),
           'levelChanges': [{'unitId': change['unitId'], **change['fields']['proposedLevel']}
                            for change in changes if 'proposedLevel' in change['fields']],
           'decisions': selections, 'changes': changes}
    return {**{path: formatted(data) for path, data in documents.items()},
            REVIEW / 'decisions.json': formatted(log)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    outputs = replay()
    for path, contents in outputs.items():
        target = ROOT / path
        if args.check:
            require(target.exists() and target.read_text(encoding='utf-8') == contents,
                    f'Editorial amendments need regeneration: {path}')
        else:
            target.write_text(contents, encoding='utf-8')
    print(f'{len(outputs)} editorial/log files {"verified" if args.check else "written"}; canonical sources untouched')


if __name__ == '__main__':
    main()

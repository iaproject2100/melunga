#!/usr/bin/env python3
"""Reproduce the lot3 scope/before/target checks without importing a generator.

Read-only: frozen Git objects are inputs; the program prints structural JSON.
It does not claim that counting proves the individual linguistic reading.
"""
import collections
import hashlib
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[3]
BASE = '3df885df8db00f0bdc2a703b92bd17801accabce'
EVIDENCE = 'd06a62ea36120ffd73b8059645848c13bd4f172d'
FOLDER = 'docs/revue-integrale/lot3-fr-zh-L3-L10/'
FILES = ['couverture.json', 'registre-phonetique.json', 'registre-lectures.json',
         'lot-contenu-gloses.json', 'propositions-niveaux-themes.json', 'conventions-a-decider.json']


def git_bytes(commit, path):
    return subprocess.check_output(['git', 'show', commit + ':' + path], cwd=ROOT)


def read(commit, path):
    return json.loads(git_bytes(commit, path))


def audit():
    evidence = {n: read(EVIDENCE, FOLDER + n) for n in FILES}
    canonical, by_level, themes = {}, {}, {}
    inputs = {}
    for level in range(1, 11):
        path = f'melunga_deploy/content/niveaux-progressifs/fr-zh/L{level}.json'
        raw = git_bytes(BASE, path)
        inputs[path] = hashlib.sha256(raw).hexdigest()
        cell = json.loads(raw)
        items = []
        for theme in cell['themes'] + cell.get('heldThemes', []):
            themes[level, theme['id']] = theme['title']
            for phrase in theme['phrases']:
                items.append({'level': level, 'theme': theme['id'], 'themeTitle': theme['title'], **phrase})
        for phrase in cell.get('reserve', []):
            items.append({'level': level, 'theme': 'reserve', 'themeTitle': 'Réserve', **phrase})
        by_level[level] = items
        for item in items:
            assert item['id'] not in canonical
            canonical[item['id']] = item
    banks = {}
    for pair in ['fr-zh', 'zh-fr']:
        path = f'melunga_deploy/content/niveaux-progressifs/repertoires/{pair}.json'
        raw = git_bytes(BASE, path)
        inputs[path] = hashlib.sha256(raw).hexdigest()
        banks[pair] = {item['id']: item for item in json.loads(raw)['receivedModels']}
    expected_occurrences = [item['id'] for level in range(3, 11) for item in by_level[level]] + list(banks['fr-zh'])
    coverage = evidence['couverture.json']
    counts = collections.Counter(item['id'] for item in coverage['items'])
    status_counts = collections.Counter(item['status'] for item in coverage['items'])
    duplicated = []
    for ident, count in counts.items():
        if count > 1:
            rows = [item for item in coverage['items'] if item['id'] == ident]
            duplicated.append({'id': ident, 'count': count, 'rows': rows,
                               'statusesAgree': len({item['status'] for item in rows}) == 1})
    def source(ident):
        if ident in canonical:
            return canonical[ident]
        for bank in banks.values():
            if ident in bank:
                return bank[ident]
        return None
    mismatches = []
    glosses = evidence['lot-contenu-gloses.json']['items']
    proposals = evidence['propositions-niveaux-themes.json']['items']
    conventions = [item for group in evidence['conventions-a-decider.json']['groups'].values() for item in group]
    for name, items in [('glosses', glosses), ('proposals', proposals), ('conventions', conventions)]:
        for index, item in enumerate(items):
            original = source(item['id'])
            if original is None:
                mismatches.append({'file': name, 'index': index, 'id': item['id'], 'error': 'missing ID'})
                continue
            for field in ['study'] + (['native'] if name == 'proposals' else []):
                if original.get(field) != item.get(field):
                    mismatches.append({'file': name, 'index': index, 'id': item['id'], 'error': field + ' mismatch'})
            if 'before' in item and original.get(item['field']) != item['before']:
                mismatches.append({'file': name, 'index': index, 'id': item['id'], 'error': 'before mismatch'})
            if name == 'proposals':
                if original.get('level') != item['level'] or original.get('theme') != item['theme'] or original.get('themeTitle') != item['themeTitle']:
                    mismatches.append({'file': name, 'index': index, 'id': item['id'], 'error': 'current placement/title mismatch'})
    destination_errors, contextual, concrete_targets = [], [], []
    for item in proposals:
        if item['kind'] != 'theme':
            continue
        if item['proposed'] == 'à contextualiser':
            contextual.append(item['id'])
            continue
        match = re.fullmatch(r'([^ ]+) — « (.+) »', item['proposed'])
        actual = themes.get((item['level'], match.group(1))) if match else None
        if not match or actual != match.group(2):
            destination_errors.append(item)
        else:
            concrete_targets.append(item['id'])
    sets = {
        'corrige': {item['id'] for name in ['registre-phonetique.json', 'registre-lectures.json'] for item in evidence[name]['events']},
        'glose-a-corriger': {item['id'] for item in glosses if item['certainty'] == 'certain'},
        'incertain': {item['id'] for item in glosses if item['certainty'] == 'incertain'} | {item['id'] for item in conventions},
        'proposition': {item['id'] for item in proposals},
    }
    status_errors = []
    for item in coverage['items']:
        status, ident = item['status'], item['id']
        if status not in coverage['statusLegend']:
            status_errors.append({'id': ident, 'status': status, 'error': 'unknown status'})
        elif status == 'verifie' and any(ident in ids for ids in sets.values()):
            status_errors.append({'id': ident, 'status': status, 'error': 'verifie despite a registered follow-up'})
        elif status != 'verifie' and ident not in sets[status]:
            status_errors.append({'id': ident, 'status': status, 'error': 'no matching evidence category'})
    conventions_uncovered = sorted(sets['incertain'] - set(counts))
    certain = [item for item in glosses if item['certainty'] == 'certain']
    return {
        'referenceCommit': BASE, 'evidenceCommit': EVIDENCE,
        'evidenceSha256': {n: hashlib.sha256(git_bytes(EVIDENCE, FOLDER + n)).hexdigest() for n in FILES},
        'snapshotSha256': inputs,
        'scope': {
            'canonicalL3L10': sum(len(by_level[level]) for level in range(3, 11)),
            'receivedModelsFrZh': len(banks['fr-zh']),
            'announced4217MeansPositions': len(expected_occurrences),
            'distinctIdsInDeclaredCoreScope': len(set(expected_occurrences)),
            'canonicalReceivedCoreOverlaps': sorted(set(item['id'] for level in range(3, 11) for item in by_level[level]) & set(banks['fr-zh'])),
            'coverageRows': len(coverage['items']), 'coverageDistinctIds': len(counts),
            'coverageDeclaredTotal': coverage['total'],
            'coverageExtraIds': [{'id': ident, 'level': canonical.get(ident, {}).get('level')} for ident in sorted(set(counts)-set(expected_occurrences))],
            'missingCoreIds': sorted(set(expected_occurrences)-set(counts)),
            'duplicatedCoverageIds': duplicated,
            'actualStatusCounts': dict(status_counts),
            'declaredStatusCountsMatch': dict(status_counts) == coverage['counts'],
            'statusMembershipErrors': status_errors,
            'followUpNotInThisCoverage': conventions_uncovered,
            'eachRoleHasOneRow': len(set((item['id'], item['chunk']) for item in coverage['items'])) == len(coverage['items']),
        },
        'separateContent': {
            'glossEvents': len(glosses), 'glossDistinctIds': len({item['id'] for item in glosses}),
            'certainGlossEvents': len(certain), 'certainGlossDistinctIds': len({item['id'] for item in certain}),
            'certainFields': dict(collections.Counter(item['field'] for item in certain)),
            'uncertainGlossEvents': sum(item['certainty'] == 'incertain' for item in glosses),
            'proposalRows': len(proposals), 'proposalDistinctIds': len({item['id'] for item in proposals}),
            'proposalKinds': dict(collections.Counter(item['kind'] for item in proposals)),
            'themeTargetsExistAndTitleMatchesAtCurrentLevel': len(concrete_targets),
            'contextualThemeRowsWithoutDestination': len(contextual), 'contextualThemeIds': contextual,
            'themeDestinationErrors': destination_errors,
            'conventionRows': len(conventions), 'conventionDistinctIds': len({item['id'] for item in conventions}),
            'conventionFields': dict(collections.Counter(item['field'] for item in conventions)),
            'beforeOrSnapshotErrors': mismatches,
        },
        'doesNotVerifyNativePronunciation': True,
        'doesNotProveIndividualReadingByCounting': True,
        'productMutated': False,
    }


if __name__ == '__main__':
    print(json.dumps(audit(), ensure_ascii=False, indent=2))

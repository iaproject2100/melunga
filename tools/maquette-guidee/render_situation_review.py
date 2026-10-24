#!/usr/bin/env python3
"""Render the whole-utterance phonetic review list from the frozen ledgers."""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DIRECTORY = ROOT / 'docs/niveaux-progressifs/enrichissement-situations'


def make():
    plan_path = DIRECTORY / 'plan.json'
    plan = json.loads(plan_path.read_text())
    plan_hash = hashlib.sha256(plan_path.read_bytes()).hexdigest()
    pairs = plan['scope']['languagePairsToAudit']
    items, counts = [], {}
    for pair in pairs:
        ledger = json.loads((DIRECTORY / (pair + '.json')).read_text())
        assert ledger['pair'] == pair and ledger['planHash'] == plan_hash
        assert len(ledger['items']) == 80
        items.extend(ledger['items'])
        counts[pair] = Counter(item['kind'] for item in ledger['items'])
    written = [item for item in items if item['kind'] == 'editorial-authored-whole-entry']
    for item in written:
        assert item['phoneticReviewStatus'] == 'pending-Claude'
        assert all(isinstance(item.get(field), str) and item[field].strip()
                   for field in ('study', 'native', 'phon'))
    lines = [f'# {len(written)} nouvelles phrases — relecture phonétique de Claude', '',
        'Codex prend en charge les intentions, les sens, le naturel des formulations, les thèmes et leur progression. Claude vérifie uniquement la phonétique selon la méthode Melunga. Les anciennes aides ne sont pas réécrites.', '',
        f'Ces {len(written)} phrases entières sont des rédactions, pas les {len(items)} positions du lot. Les {len(items) - len(written)} autres positions réemploient des sources déjà présentes. Les 139 aides nouvelles du précédent lot lexical restent dans [leur tableau séparé](../corrections-themes/enrichissements-rediges.md).', '',
        'Pour chaque correction, citer le couple et intentId, puis donner la prononciation entière corrigée. Pour zh-fr, l’aide est destinée à un lecteur sinophone et reste en caractères chinois ; les autres aides sont destinées aux francophones. La lecture complémentaire demeure dans le JSON.', '',
        '| Couple | Phrases rédigées | Sources réemployées |', '|---|---:|---:|']
    for pair, kinds in counts.items():
        authored = kinds['editorial-authored-whole-entry']
        lines.append(f'| {pair} | {authored} | {80 - authored} |')
    for pair in pairs:
        lines += ['', f'## {pair}', '',
            '| Niveau / intention | Phrase entière | Sens | Aide entière proposée |', '|---|---|---|---|']
        for item in written:
            if item['pair'] != pair:
                continue
            fields = [f"L{item['proposedLevel']} · {item['intentId']}", item['study'], item['native'], item['phon']]
            lines.append('| ' + ' | '.join(value.replace('|', '\\|').replace('\n', ' ') for value in fields) + ' |')
    lines += ['', 'Statut : pending-Claude, aperçu de travail. La conservation exacte d’une source ancienne ne constitue pas une validation de sa phonétique. Ce document n’autorise aucune fusion ni publication sur melunga.com.', '']
    return '\n'.join(lines), len(written)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    text, count = make()
    destination = DIRECTORY / 'nouvelles-phrases-a-relire.md'
    if args.check:
        assert destination.read_text() == text, 'Stale phonetic review table'
    else:
        destination.write_text(text)
    print(json.dumps({'wholeUtterancesForPhoneticReview': count, 'reviewAssignee': 'Claude', 'scope': 'phonetics-only'}))


if __name__ == '__main__':
    main()

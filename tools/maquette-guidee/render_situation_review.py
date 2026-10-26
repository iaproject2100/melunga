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
    base_hash = hashlib.sha256((DIRECTORY / 'plan-base10.json').read_bytes()).hexdigest()
    pairs = plan['scope']['languagePairsToAudit']
    sections = []
    counts = {}
    for pair in pairs:
        base = json.loads((DIRECTORY / (pair + '.json')).read_text())
        assert base['pair'] == pair and base['planHash'] == base_hash and len(base['items']) == 80
        extension = json.loads((DIRECTORY / ('extension-' + pair + '.json')).read_text())
        assert extension['pair'] == pair and extension['planHash'] == plan_hash and len(extension['items']) == 144
        rows = [*[(item, 'production apprise') for item in base['items']],
                *[(item, 'production apprise') for item in extension['items']],
                *[(item, 'interlocuteur — compréhension seule') for item in extension['receivedTurns']],
                *[(item, 'soutien lexical séparé') for item in extension['lexicalSupports']]]
        authored = [(item, role) for item, role in rows if item['kind'] == 'editorial-authored-whole-entry']
        for item, _ in authored:
            assert item['phoneticReviewStatus'] == 'pending-Claude'
            assert all(isinstance(item.get(field), str) and item[field].strip()
                       for field in ('study', 'native', 'phon'))
        sections.append((pair, authored))
        counts[pair] = Counter(role for _, role in authored)
    count = sum(len(rows) for _, rows in sections)
    lines = [f'# {count} formes entières — relecture phonétique de Claude', '',
        'Codex prend en charge les intentions, les sens, le naturel des formulations, les thèmes et leur progression. Claude vérifie uniquement la phonétique selon la méthode Melunga. Les anciennes aides ne sont pas réécrites.', '',
        'Ce tableau distingue les phrases de l’apprenant, les répliques de l’interlocuteur entendues seulement, et les mots de soutien. Une réplique reçue ne devient pas une production à apprendre et ne compte pas dans la progression. Les copies entières de sources existantes ne sont pas présentées comme des créations.', '',
        'Le tableau comprend les 454 phrases rédigées du premier lot et les formes rédigées de l’extension des 18 pistes. Les 139 aides nouvelles du précédent lot lexical restent dans [leur tableau séparé](../corrections-themes/enrichissements-rediges.md). Ne pas compter une aide entière explicitement réemployée comme une nouvelle prononciation.', '',
        'Pour chaque correction, citer le couple et l’identifiant, puis donner la prononciation entière corrigée. Pour zh-fr, l’aide est destinée à un lecteur sinophone et reste en caractères chinois ; les autres aides sont destinées aux francophones. Les lectures complémentaires demeurent dans les JSON.', '',
        '| Couple | Productions apprises | Interlocuteur | Soutiens lexicaux |',
        '|---|---:|---:|---:|']
    for pair, roles in counts.items():
        lines.append(f"| {pair} | {roles['production apprise']} | {roles['interlocuteur — compréhension seule']} | {roles['soutien lexical séparé']} |")
    for pair, rows in sections:
        lines += ['', f'## {pair}', '',
            '| Niveau / identifiant | Usage | Forme entière | Sens | Aide entière proposée |',
            '|---|---|---|---|---|']
        for item, role in rows:
            identifier = item.get('intentId') or item['id']
            fields = [f"L{item['proposedLevel']} · {identifier}", role, item['study'], item['native'], item['phon']]
            lines.append('| ' + ' | '.join(value.replace('|', '\\|').replace('\n', ' ') for value in fields) + ' |')
    lines += ['', 'Statut : pending-Claude, aperçu de travail. La conservation exacte d’une source ancienne ne constitue pas une validation de sa phonétique. Ce document n’autorise aucune fusion ni publication sur melunga.com.', '']
    return '\n'.join(lines), count


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
    print(json.dumps({'wholeFormsForPhoneticReview': count, 'reviewAssignee': 'Claude', 'scope': 'phonetics-only'}))


if __name__ == '__main__':
    main()

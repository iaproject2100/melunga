#!/usr/bin/env python3
"""Validate whole-entry drafts and render the list intended for phonetic review."""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'docs/niveaux-progressifs/corrections-themes/enrichissements-rediges.json'
PAIRS = {'fr-en': 'en', 'fr-es': 'es', 'fr-it': 'it', 'fr-zh': 'zh',
         'fr-ja': 'ja', 'fr-ko': 'ko', 'zh-fr': 'fr'}


def make():
    document = json.loads(SOURCE.read_text())
    line = next(line for line in (ROOT / 'melunga_deploy/app.html').read_text().splitlines()
                if line.startswith('var DECKS = '))
    decks = json.loads(line.split('=', 1)[1].strip().rstrip(';'))
    ids, study_keys, reused = set(), set(), 0
    for entry in document['items']:
        assert entry['pair'] in PAIRS and entry['id'] not in ids
        assert type(entry['proposedLevel']) is int and 1 <= entry['proposedLevel'] <= 10
        assert entry['phoneticReviewStatus'] == 'pending-Claude'
        assert entry['editorialReviewStatus'] == 'reviewed'
        assert entry['contentType'] in ('vocabulary', 'number')
        for key in ('study', 'native', 'phon', 'reason', 'lexicalFamily'):
            assert isinstance(entry[key], str) and entry[key].strip()
        assert not any(token in entry['study'] for token in ('{s}', '___', '…', '...'))
        language = PAIRS[entry['pair']]
        if language in ('ja', 'zh', 'ko'):
            assert isinstance(entry.get('reading'), str) and entry['reading'].strip()
        if entry['contentType'] == 'vocabulary':
            assert entry['lexicalClass'] in ('adjective', 'preposition', 'adverb', 'color', 'other')
        ids.add(entry['id'])
        key = (entry['pair'], entry['study'], entry['native'])
        assert key not in study_keys
        study_keys.add(key)
        headwords = [card for card in decks[language]
                     if card['t'].casefold().strip(' .!?。？！') == entry['study'].casefold().strip(' .!?。？！')]
        reference = entry.get('wholeHeadwordPhonSource')
        if reference:
            assert reference['collection'] == 'DECKS.' + language
            card = decks[language][reference['sourceIndex']]
            assert card['t'] == entry['study'] and card[reference['field']] == entry['phon']
            reused += 1
        else:
            assert not headwords, ('Unexpected existing headword: use an explicit sense decision', entry['id'])
    count = len(document['items'])
    lines = ['# Nouvelles entrées — vérification phonétique de Claude', '',
             'Codex prend en charge les sens, les formes, le classement et la progression. Claude vérifie uniquement la phonétique selon la méthode Melunga. Les aides existantes du catalogue restent intactes.', '',
             f'{count} entrées entières ont été rédigées : {count - reused} aides nouvelles et {reused} aide de headword reprise entière pour un nouveau sens. Leur statut phonétique est pending-Claude.', '',
             'Les mots ne sont pas extraits de phrases ; aucune aide n’est construite par collage. Les indications de forme adnominale ou de complément prépositionnel se trouvent dans lexicalUsage et l’aide facultative.', '',
             '| Couple | Niveau proposé | Mot ou locution | Sens | Aide proposée |', '|---|---:|---|---|---|']
    for entry in document['items']:
        lines.append(f"| {entry['pair']} | L{entry['proposedLevel']} | {entry['study']} | {entry['native']} | {entry['phon']} |")
    lines += ['', 'Le mot anglais light reprend l’aide LAÏT du headword entier existant. Sa nouvelle entrée adjectivale ne modifie ni le mot nominal « lumière / lampe » ni sa prononciation.', '',
              'Chaque correction phonétique doit citer l’identifiant et le mot entier. Une copie exacte d’une aide ancienne ne vaut pas validation de la méthode. Ces données appartiennent à l’aperçu de travail ; aucune mise en production n’est approuvée ici.', '']
    return '\n'.join(lines), {'entries': count, 'newWholeEntryPhoneticDrafts': count - reused,
                              'wholeHeadwordAidsReused': reused,
                              'byPair': dict(Counter(row['pair'] for row in document['items'])),
                              'phoneticReview': 'pending-Claude',
                              'sourceFileSha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write-review', action='store_true')
    args = parser.parse_args()
    markdown, checks = make()
    target = SOURCE.with_suffix('.md')
    if args.write_review:
        target.write_text(markdown)
    else:
        assert target.read_text() == markdown, 'Out of date phonetic-review list'
    print(json.dumps(checks, ensure_ascii=False))


if __name__ == '__main__':
    main()

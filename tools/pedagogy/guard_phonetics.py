#!/usr/bin/env python3
"""Check immutable source content and exact, reader-specific copies in local banks.

The only writing mode creates a NEW documentary baseline. This tool never writes
app.html, a conversation JSON, or a phrase bank. No external packages are needed.
"""

import argparse
from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
BASELINE = Path('docs/progression-complete/phonetics-baseline.json')
APP = Path('melunga_deploy/app.html')
CONVERSATION = Path('melunga_deploy/content/conversation')
LEGACY = Path('melunga_deploy/content/conversation-fr-es.json')
SCHEMA_VERSION = 1
READING_KEYS = {'reading', 'readingFull', 'transcription', 'transcriptions',
                'romanization', 'romanisation', 'pinyin', 'hiragana', 'katakana',
                'romaji', 'kana'}
SHORT_AIDS = {'py', 'pf', 'ps', 'pi', 'pj', 'pk'}
READERS = {'fr', 'es', 'en', 'it', 'ja', 'ko', 'zh'}


def canonical(value):
    # Deliberately no strip(), Unicode normalization, accent/case conversion.
    return json.dumps(value, ensure_ascii=False, sort_keys=True,
                      separators=(',', ':'), allow_nan=False).encode('utf-8')


def digest(value):
    return hashlib.sha256(canonical(value)).hexdigest()


def is_aid(key):
    return key in SHORT_AIDS or key in READING_KEYS or key.startswith('ph')


def aids_of(record):
    return {k: v for k, v in record.items() if is_aid(k)}


def read_json(path):
    # Duplicate keys must fail: a JSON parser must not silently drop a source aid.
    def pairs(items):
        result = {}
        for k, v in items:
            if k in result:
                raise ValueError(f'Duplicate JSON key: {k}')
            result[k] = v
        return result
    return json.loads(path.read_text(encoding='utf-8'), object_pairs_hook=pairs)


def extract_decks(root):
    text = (root / APP).read_text(encoding='utf-8')
    match = re.search(r'(?m)^[ \t]*var\s+DECKS\s*=\s*', text)
    if not match:
        raise ValueError(f'{APP}: DECKS not found')
    # Use the same duplicate-key protection as standalone JSON files.
    def pairs(items):
        result = {}
        for k, v in items:
            if k in result:
                raise ValueError(f'DECKS: duplicate JSON key {k}')
            result[k] = v
        return result
    return json.JSONDecoder(object_pairs_hook=pairs).raw_decode(text[match.end():])[0]


def metrics(records):
    fields, empty = Counter(), Counter()
    for record in records:
        for k, value in record['aids'].items():
            fields[k] += 1
            if value in ('', None):
                empty[k] += 1
    return {'records': len(records), 'fieldOccurrences': dict(sorted(fields.items())),
            'emptyFieldOccurrences': dict(sorted(empty.items())),
            'phoneticsByIdentitySha256': digest(records)}


def json_aid_records(value, path='$', owner=None):
    """Include models, full variants, slots, turns, metadata and future aid keys."""
    records = []
    if isinstance(value, dict):
        owner = value.get('id', owner)
        own = aids_of(value)
        if own:
            records.append({'locator': path, 'sourceId': owner,
                            'study': value.get('study', value.get('es', value.get('t'))),
                            'aids': own})
        for key in sorted(value):
            # An aid value is already included whole. Other objects may hold aids.
            if not is_aid(key):
                records.extend(json_aid_records(value[key], f'{path}/{key}', owner))
    elif isinstance(value, list):
        for index, item in enumerate(value):
            records.extend(json_aid_records(item, f'{path}/{index}', owner))
    return records


def snapshot(root):
    decks = extract_decks(root)
    languages = {}
    for language, cards in sorted(decks.items()):
        records = []
        by_text = defaultdict(list)
        for index, card in enumerate(cards):
            locator = f'DECKS.{language}[{index}]'
            records.append({'locator': locator,
                            'sourceId': card.get('id', card.get('sourceId')),
                            'study': card['t'], 'aids': aids_of(card)})
            by_text[card['t']].append(index)
        collisions = []
        for text, indices in by_text.items():
            if len(indices) > 1 and len({digest(aids_of(cards[i])) for i in indices}) > 1:
                collisions.append({'phraseSha256': digest(text),
                                   'locators': [f'DECKS.{language}[{i}]' for i in indices],
                                   'reviewRequired': True})
        languages[language] = {'cards': len(cards), 'canonicalSha256': digest(cards),
                               **metrics(records), 'differentAidCollisions': collisions}
    paths = sorted((root / CONVERSATION).glob('*.json'))
    paths.append(root / LEGACY)
    files = {}
    for path in paths:
        data = read_json(path)
        files[str(path.relative_to(root))] = {
            'canonicalSha256': digest(data),
            'nativeLanguage': data.get('nativeLanguage'),
            'studyLanguage': data.get('studyLanguage'),
            **metrics(json_aid_records(data))}
    level_files = [p for p in paths if re.fullmatch(r'L\d+-[a-z]+-[a-z]+\.json', p.name)]
    return {'schemaVersion': SCHEMA_VERSION,
            'canonicalization': 'JSON sorted keys; compact UTF-8; exact decoded string values; no normalization',
            'decks': {'file': str(APP), 'canonicalSha256': digest(decks),
                      'cards': sum(len(v) for v in decks.values()), 'languages': languages},
            'levelFileCount': len(level_files), 'jsonFiles': files}


def compare(current, baseline):
    errors = []
    if baseline.get('schemaVersion') != SCHEMA_VERSION:
        return ['Baseline schema version unsupported']
    if current['decks']['canonicalSha256'] != baseline['decks']['canonicalSha256']:
        errors.append('DECKS changed: original card content, order, or inventory differs')
    for language in sorted(set(current['decks']['languages']) | set(baseline['decks']['languages'])):
        before = baseline['decks']['languages'].get(language)
        after = current['decks']['languages'].get(language)
        if before != after:
            if before is None or after is None:
                errors.append(f'DECKS.{language}: language added or removed')
            elif before['phoneticsByIdentitySha256'] != after['phoneticsByIdentitySha256']:
                errors.append(f'DECKS.{language}: source identity/phrase/aids changed')
            else:
                errors.append(f'DECKS.{language}: original non-phonetic content changed')
    for file in sorted(set(current['jsonFiles']) | set(baseline['jsonFiles'])):
        before, after = baseline['jsonFiles'].get(file), current['jsonFiles'].get(file)
        if before != after:
            if before is None or after is None:
                errors.append(f'{file}: original inventory changed (added/removed file)')
            elif before['phoneticsByIdentitySha256'] != after['phoneticsByIdentitySha256']:
                errors.append(f'{file}: source identity/phrase/aids changed')
            else:
                errors.append(f'{file}: original non-phonetic content changed')
    if current['levelFileCount'] != baseline['levelFileCount']:
        errors.append('Number of original level files changed')
    return errors


def native_field(native, study):
    if study == 'zh':
        return {'fr': 'phf', 'es': 'phs', 'en': 'phe', 'it': 'phi',
                'ja': 'pj', 'ko': 'pk', 'zh': 'phon'}[native]
    return {'fr': 'pf', 'es': 'ps', 'en': 'py', 'it': 'pi',
            'ja': 'pj', 'ko': 'pk', 'zh': 'phon'}[native]


def meaning_of(phrase, native):
    if native == 'en':
        return phrase.get('en') or phrase.get('cn', '')
    field = {'fr': 'frm', 'es': 'esm', 'it': 'itm', 'ja': 'jam',
             'ko': 'kom', 'zh': 'cn'}[native]
    return phrase.get(field, '')


def find_one(items, id, context):
    matches = [item for item in items if item.get('id') == id]
    if len(matches) != 1:
        raise ValueError(f'{context}: expected exactly one source ID {id!r}')
    return matches[0]


def at_index(items, index, context):
    if type(index) is not int or not 0 <= index < len(items):
        raise ValueError(f'{context}: invalid source index {index!r}')
    return items[index]


def resolve_source(root, entry, decks):
    source = entry['source']
    native, study = entry['nativeLanguage'], entry['studyLanguage']
    if native not in READERS or study not in decks:
        raise ValueError('Unknown reader/study language')
    if source['type'] == 'deck':
        if source['language'] != study:
            raise ValueError('Deck source language does not match studyLanguage')
        phrase = at_index(decks[study], source['index'], f'DECKS.{study}')
        text, meaning = phrase['t'], meaning_of(phrase, native)
        field = native_field(native, study)
        # Mirror the existing reader-specific selector; a fallback is never
        # silently described as reader-adapted phonetics.
        if not phrase.get(field):
            if not phrase.get('py') or entry.get('phoneticStatus') != 'reading-fallback-not-reader-adapted':
                raise ValueError(f'Missing reader-specific {field}; explicit reviewed fallback required')
            if entry.get('reviewRequired') is not True:
                raise ValueError('Reading fallback must remain reviewRequired')
            field = 'py'
        elif entry.get('phoneticStatus') == 'reading-fallback-not-reader-adapted':
            raise ValueError('Fallback claimed although the dedicated reader field exists')
    elif source['type'] == 'conversation':
        relative = Path(source['file'])
        # No arbitrary read through a local-bank locator, even via symlinks.
        allowed = (root / CONVERSATION).resolve()
        path = (root / relative).resolve()
        if not path.is_relative_to(allowed) or path.suffix != '.json':
            raise ValueError('Conversation source must be inside content/conversation')
        data = read_json(path)
        if data.get('nativeLanguage') != native or data.get('studyLanguage') != study:
            raise ValueError('Conversation reader/study pair mismatch')
        if 'dialogueId' in source:
            if 'unitId' in source or source.get('slot'):
                raise ValueError('Ambiguous dialogue/unit/slot reference')
            dialogue = find_one(data['dialogues'], source['dialogueId'], str(relative))
            phrase = at_index(dialogue['turns'], source['turnIndex'], source['dialogueId'])
        else:
            unit = find_one(data['units'], source['unitId'], str(relative))
            if source.get('model') is True:
                if 'variantIndex' in source or source.get('slot'):
                    raise ValueError('Ambiguous model/variant/slot reference')
                phrase = unit['model']
            else:
                phrase = at_index(unit['variants'], source['variantIndex'], source['unitId'])
                if source.get('slot') is True:
                    phrase = phrase['slot']
        text, field, meaning = phrase['study'], 'phon', phrase.get('native', '')
    else:
        raise ValueError(f'Unsupported source type {source["type"]!r}')
    if text != source['expectedStudy']:
        raise ValueError('Source phrase differs from expectedStudy (index or source changed)')
    expected = {'study': text, 'aids': aids_of(phrase)}
    if 'native' in entry['copy']:
        expected['native'] = meaning
    if entry['copy'] != expected:
        raise ValueError('Copy differs: preserve exact phrase and ALL present aid fields, including empty ones')
    if 'displayPhonField' in entry and entry['displayPhonField'] != field:
        raise ValueError(f'displayPhonField must be {field!r} for this reader/source')
    if not isinstance(phrase.get(field), str) or not phrase[field]:
        raise ValueError('Selected source phonetics is empty or not a string')


def check_bank(root, path, decks):
    data = read_json(path)
    entries = data['entries']
    if not isinstance(entries, list):
        raise ValueError('Bank entries must be a list')
    errors, ids = [], set()
    for index, entry in enumerate(entries):
        label = entry.get('id', f'entry[{index}]')
        try:
            if not isinstance(label, str) or not label or label in ids:
                raise ValueError('Missing, empty or duplicate bank entry ID')
            ids.add(label)
            resolve_source(root, entry, decks)
        except (KeyError, IndexError, TypeError, ValueError, OSError) as error:
            errors.append(f'{path}: {label}: {error}')
    return len(entries), errors


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT, help='Repository/worktree root')
    parser.add_argument('--baseline', type=Path, default=BASELINE)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--check', action='store_true', help='Read only; default mode')
    mode.add_argument('--create-baseline', action='store_true',
                      help='Create a new documentary baseline; refuses to overwrite')
    parser.add_argument('--bank', type=Path, action='append', default=[],
                        help='Also check local bank JSON; repeatable. banks/*.json are automatic.')
    args = parser.parse_args(argv)
    root = args.root.resolve()
    baseline_path = args.baseline if args.baseline.is_absolute() else root / args.baseline
    try:
        current = snapshot(root)
        if args.create_baseline:
            if current['levelFileCount'] != 110:
                raise ValueError(f'Initial baseline expected 110 level files, got {current["levelFileCount"]}')
            revision = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip()
            current['sourceRevision'] = revision
            baseline_path.parent.mkdir(parents=True, exist_ok=True)
            # Atomic exclusive creation; a passing check cannot rewrite its reference.
            with baseline_path.open('x', encoding='utf-8') as output:
                output.write(json.dumps(current, ensure_ascii=False, indent=2) + '\n')
            print(json.dumps({'mode': 'create-baseline', 'baseline': str(baseline_path),
                              'cards': current['decks']['cards'], 'levelFiles': 110}))
            return 0
        baseline = read_json(baseline_path)
        errors = compare(current, baseline)
        banks = set((root / 'docs/progression-complete/banks').glob('*.json'))
        main_bank = root / 'docs/progression-complete/banque-phrases.json'
        if main_bank.exists():
            banks.add(main_bank)
        banks.update(path if path.is_absolute() else root / path for path in args.bank)
        bank_entries = 0
        decks = extract_decks(root)
        for bank in sorted(banks):
            count, bank_errors = check_bank(root, bank, decks)
            bank_entries += count
            errors.extend(bank_errors)
        collisions = sum(len(v['differentAidCollisions']) for v in current['decks']['languages'].values())
        print(json.dumps({'mode': 'check', 'sourcePreserved': not errors,
                          'cards': current['decks']['cards'],
                          'levelFiles': current['levelFileCount'],
                          'protectedJsonFiles': len(current['jsonFiles']),
                          'checkedBanks': len(banks), 'bankEntries': bank_entries,
                          'differentAidCollisionsForReview': collisions,
                          'nativeValidation': False, 'errors': errors}, ensure_ascii=False))
        return 1 if errors else 0
    except (KeyError, TypeError, ValueError, OSError, subprocess.CalledProcessError) as error:
        print(json.dumps({'mode': 'error', 'error': str(error)}, ensure_ascii=False), file=sys.stderr)
        return 2


if __name__ == '__main__':
    sys.exit(main())

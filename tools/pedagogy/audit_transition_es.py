#!/usr/bin/env python3
"""Inspect ES L3/L4 and explicit preparation scenarios without changing sources.

The level statistic always retains the variants-only scope of the reviewed lot.
Catalogue preparation scenarios use a separate, chronological exposure inventory;
presence in that inventory never means comprehension or acquisition.
"""
import argparse
from copy import deepcopy
from fractions import Fraction
import hashlib
import json
from pathlib import Path
import sys

sys.dont_write_bytecode = True
from audit_reclassement_followup import ROOT, RUNTIME, SOURCE, canonical_sources, checked_units, git_bytes, require
from audit_reclassement_novelty import tokens, inventory_statistics
from audit_conversation_progression import embedded_json

BASELINE = 'a4f1ec4e31e436546e775597845ff570476356a8'
OUTPUT = Path('docs/progression-corrections/transition-es/mesures')
ENTRANTS = ('L8-fr-es-01', 'L8-fr-es-02', 'L9-fr-es-13', 'L8-fr-es-13')
BRIDGE_SCENARIOS = {
    'three-selected-routine-preparations': ((264, 'L4-fr-es-01', 1), (283, 'L4-fr-es-01', 0),
                                           (542, 'L4-fr-es-03', 3)),
    'two-whole-routine-bridges': ((264, 'L4-fr-es-01', 1), (542, 'L4-fr-es-03', 3)),
    'four-whole-bridges-without-work': ((264, 'L4-fr-es-01', 1), (1531, 'L4-fr-es-01', 0),
                                       (542, 'L4-fr-es-03', 3), (1286, 'L4-fr-es-08', 0)),
    'three-whole-routine-bridges': ((1531, 'L4-fr-es-01', 0), (1194, 'L4-fr-es-01', 2),
                                    (542, 'L4-fr-es-03', 3)),
    'four-whole-routine-bridges': ((1531, 'L4-fr-es-01', 0), (1194, 'L4-fr-es-01', 2),
                                   (542, 'L4-fr-es-03', 3), (1286, 'L4-fr-es-08', 0)),
}


def word_types(texts):
    return {word for text in texts for word in tokens(text, 'es')}


def type_summary(current, previous):
    new = current - previous
    ratio = Fraction(len(new), max(1, len(current)))
    return {'newTypeCount': len(new), 'typeCount': len(current),
            'ratio': {'numerator': ratio.numerator, 'denominator': ratio.denominator},
            'percent': float(100 * ratio), 'newTypes': sorted(new),
            'alreadyPresentTypes': sorted(current & previous)}


def ordered_rows(route):
    pair = next(pair for pair in route['pairs'] if pair['id'] == 'fr-es')
    return [deepcopy(unit) for level in pair['levels'] for unit in level['units']]


def stats(rows, source_levels=False):
    levels = [[] for _ in range(10)]
    for row in rows:
        level = row['sourceLevel'] if source_levels else row['proposedLevel']
        levels[level-1].append((row['unitId'], [p['study'] for p in row['phrases']], row['sourceLevel']))
    result = inventory_statistics(levels, 'es', detailed=False)
    ratios = [Fraction(row['ratio']['numerator'], row['ratio']['denominator']) for row in result['levels']]
    result['gapsPercentagePoints'] = {
        f'L{level}<L{level+1}': float((ratios[level] - ratios[level-1]) * 100)
        for level in range(1, 10)}
    return result


def move_counterfactual(rows, changes):
    """Append moved units in original relative order; no optimal sorting occurs."""
    require(set(changes) <= {row['unitId'] for row in rows}, 'Unknown counterfactual unit')
    result = []
    for level in range(1, 11):
        residents = [deepcopy(row) for row in rows if row['proposedLevel'] == level and row['unitId'] not in changes]
        arrivals = [deepcopy(row) for row in rows if changes.get(row['unitId']) == level]
        for order, row in enumerate(residents + arrivals, 1):
            row['proposedLevel'], row['order'] = level, order
            result.append(row)
    require(len(result) == len(rows), 'Counterfactual dropped units')
    positions = {row['unitId']: i for i, row in enumerate(result)}
    issues = [{'unitId': row['unitId'], 'prerequisite': dependency}
              for row in result for dependency in row['plannedPrerequisites']
              if positions[dependency] >= positions[row['unitId']]]
    return {'changes': changes, 'placementConvention': 'Moved units appended in prior relative order; not a lesson proposal.',
            'prerequisiteOrderIssues': issues, 'statistics': stats(result)}


def decomposition(rows):
    previous = word_types(p['study'] for row in rows if row['proposedLevel'] < 4 for p in row['phrases'])
    current = [row for row in rows if row['proposedLevel'] == 4]
    all_types = word_types(p['study'] for row in current for p in row['phrases'])
    core = [row for row in current if row['unitId'] not in ENTRANTS]
    core_types = word_types(p['study'] for row in core for p in row['phrases'])
    by_unit = []
    earlier_inside_level = set(previous)
    for row in current:
        values = word_types(p['study'] for p in row['phrases'])
        others = word_types(p['study'] for other in current if other['unitId'] != row['unitId'] for p in other['phrases'])
        by_unit.append({'unitId': row['unitId'], 'sourceLevel': row['sourceLevel'], 'order': row['order'],
                        'study': [phrase['study'] for phrase in row['phrases']],
                        'relativeToPreviousLevels': type_summary(values, previous),
                        'relativeToEarlierPlannedUnits': type_summary(values, earlier_inside_level),
                        'exclusiveNewTypesAtLevel': sorted((values - previous) - others)})
        earlier_inside_level |= values
    membership = []
    for level in (2, 3, 4, 5):
        source_ids = {row['unitId'] for row in rows if row['sourceLevel'] == level}
        proposed_ids = {row['unitId'] for row in rows if row['proposedLevel'] == level}
        membership.append({'level': level, 'sourceUnitCount': len(source_ids), 'proposedUnitCount': len(proposed_ids),
                           'entered': sorted(proposed_ids-source_ids), 'departed': sorted(source_ids-proposed_ids)})
    return {'L4': type_summary(all_types, previous), 'L4CoreOnly': type_summary(core_types, previous),
            'newTypesOnlyInFourEntrants': sorted((all_types-previous)-core_types),
            'units': by_unit, 'membership': membership,
            'contributionWarning': 'Unit contributions overlap; never sum them to obtain level counts.',
            'exposureWarning': 'Earlier planned text is a corpus reference, not observed learner knowledge.'}


def bridge_records(decks, definitions):
    result = []
    for index, destination, variant_index in definitions:
        card = decks['es'][index]
        result.append({'id': f'DECKS.es[{index}]', 'destinationUnitId': destination,
                       'beforeVariantIndex': variant_index,
                       'source': {'file': 'melunga_deploy/app.html', 'collection': 'DECKS.es',
                                  'index': index, 'indexBase': 0, 'commit': BASELINE},
                       'phrase': {'study': card['t'], 'native': card['frm'], 'phon': card['pf']},
                       'sourceLevel': card['lv']})
    return result


def chronological_preparation(rows, bridges):
    """Count first written occurrences in two parallel, explicitly planned paths."""
    prior = word_types(p['study'] for row in rows if row['proposedLevel'] < 4 for p in row['phrases'])
    plain_seen, prepared_seen = set(prior), set(prior)
    trace, blocks, bridge_introductions, target_residual = [], [], set(), set()
    used = set()
    for row in rows:
        if row['proposedLevel'] != 4:
            continue
        for variant_index in row['variantOrder']:
            phrase = row['phrases'][variant_index]
            block_previous = set(prepared_seen)
            block_preparations = []
            for bridge in bridges:
                if bridge['destinationUnitId'] != row['unitId'] or bridge['beforeVariantIndex'] != variant_index:
                    continue
                require(bridge['id'] not in used, 'Duplicate preparation card')
                used.add(bridge['id'])
                values = word_types([bridge['phrase']['study']])
                summary = type_summary(values, prepared_seen)
                block_preparations.append({'id': bridge['id'], 'newTypeCount': summary['newTypeCount'],
                                           'wordCount': len(tokens(bridge['phrase']['study'], 'es'))})
                bridge_introductions |= values-prepared_seen
                trace.append({'kind': 'preparation', **deepcopy(bridge), 'novelAtThisPlannedStep': summary})
                prepared_seen |= values
            values = word_types([phrase['study']])
            with_preparation = type_summary(values, prepared_seen)
            without_preparation = type_summary(values, plain_seen)
            target_residual |= values-prepared_seen
            trace.append({'kind': 'unit-variant', 'unitId': row['unitId'], 'variantIndex': variant_index,
                          'phraseId': phrase['id'], 'study': phrase['study'],
                          'wordCount': len(tokens(phrase['study'], 'es')),
                          'withoutPreparation': without_preparation,
                          'withPreparation': with_preparation})
            if block_preparations:
                all_block_types = set(values)
                for bridge in bridges:
                    if bridge['destinationUnitId'] == row['unitId'] and bridge['beforeVariantIndex'] == variant_index:
                        all_block_types |= word_types([bridge['phrase']['study']])
                blocks.append({'unitId': row['unitId'], 'variantIndex': variant_index,
                               'withoutPreparationNewTypeCount': without_preparation['newTypeCount'],
                               'preparationPresentations': block_preparations,
                               'withPreparationTargetNewTypeCount': with_preparation['newTypeCount'],
                               'allIntroducedTypesAcrossPreparationAndTarget': sorted(all_block_types-block_previous)})
            plain_seen |= values
            prepared_seen |= values
    require(used == {bridge['id'] for bridge in bridges}, 'A preparation target is not in L4')
    current_types = word_types(p['study'] for row in rows if row['proposedLevel'] == 4 for p in row['phrases'])
    all_bridge_types = word_types(bridge['phrase']['study'] for bridge in bridges)
    return {'status': 'counterfactual-planned-presentation-not-acquisition',
            'placement': 'Each whole preparation is presented immediately before its own target variant, following variantOrder.',
            'bridges': bridges, 'typesIntroducedFirstByPreparations': sorted(bridge_introductions),
            'typesIntroducedFirstByTargetVariants': sorted(target_residual),
            'additionalTypesOutsideCurrentL4Variants': sorted(all_bridge_types-current_types),
            'combinedL4Texts': type_summary(current_types | all_bridge_types, prior),
            'levelMetricIsNotReplaced': True,
            'targetBlocks': blocks,
            'maximumNewTypesAtTargetWithoutPreparations': max(
                (block['withoutPreparationNewTypeCount'] for block in blocks), default=0),
            'maximumNewTypesPerPresentationIncludingPreparations': max(
                (value for block in blocks for value in
                 [block['withPreparationTargetNewTypeCount'],
                  *(prep['newTypeCount'] for prep in block['preparationPresentations'])]), default=0),
            'trace': trace,
            'limits': 'First written occurrences in a planned path; the cards themselves introduce types. This is not the learner state at entry to L4 or a lower variants-only level ratio.'}


def checked_candidate_preparations(rows, decks, app_raw, root=ROOT):
    """Require exact catalogue aids and actual earlier understand/imitate steps."""
    result = []
    for row in rows:
        for prep in row.get('preparations', []):
            source = prep['source']
            require(row['proposedLevel'] == 4, 'This audit only describes L4 preparations')
            require(source['type'] == 'catalogue-card' and source['file'] == 'melunga_deploy/app.html'
                    and source['collection'] == 'DECKS.es' and source['indexBase'] == 0,
                    'Unexpected preparation source')
            require(source['readerLanguage'] == 'fr' and source['studyLanguage'] == 'es',
                    'Wrong preparation reader or study language')
            require(source['fieldMap'] == {'study': 't', 'native': 'frm', 'phon': 'pf'},
                    'Preparation field map differs')
            require(type(source['index']) is int and 0 <= source['index'] < len(decks['es']),
                    'Preparation catalogue index is not zero-based within the deck')
            source_raw = git_bytes(root, source['sourceCommit'], source['file'])
            require(source_raw == app_raw, 'Preparation catalogue snapshot differs')
            card = decks['es'][source['index']]
            require(source['sourceLevel'] == card['lv'], 'Preparation source level differs')
            require(prep['phrase'] == {'id': f'catalogue:DECKS.es:{source["index"]}:reader-fr',
                                      'study': card['t'], 'native': card['frm'], 'phon': card['pf']},
                    'Preparation text or aids differ from source')
            target_index = prep['beforeVariantIndex']
            require(target_index in range(4), 'Invalid preparation destination variant')
            positions = {step['id']: i for i, step in enumerate(row['steps'])}
            understood, imitated = prep['understoodInStep'], prep['imitatedInStep']
            target = f'{row["unitId"]}-understand-{target_index}'
            require(understood in positions and imitated in positions and target in positions,
                    'Preparation lacks referenced presentation steps')
            require(positions[understood] < positions[imitated] < positions[target],
                    'Preparation does not precede its target')
            for step_id, kind in ((understood, 'understand'), (imitated, 'imitate')):
                step = row['steps'][positions[step_id]]
                require(step['kind'] == kind and step['utterance'] == prep['phrase']['id'],
                        'Preparation step does not show its whole source phrase')
            result.append({'id': prep['id'], 'destinationUnitId': row['unitId'],
                           'beforeVariantIndex': target_index, 'source': deepcopy(source),
                           'phrase': deepcopy(prep['phrase']), 'sourceLevel': card['lv'],
                           'understoodInStep': understood, 'imitatedInStep': imitated})
    return result


def sequence_summary(sequence):
    """First occurrences per whole-phrase presentation; imitation adds no types."""
    units = {}
    all_counts = []
    for event in sequence['trace']:
        unit_id = event.get('unitId', event.get('destinationUnitId'))
        summary = event['novelAtThisPlannedStep'] if event['kind'] == 'preparation' else event['withPreparation']
        count = summary['newTypeCount']
        all_counts.append(count)
        unit = units.setdefault(unit_id, {'unitId': unit_id, 'presentations': [],
                                         'firstIntroductionTotal': 0, 'maximumNewTypesPerPresentation': 0})
        unit['presentations'].append({'kind': event['kind'], 'variantIndex': event.get('variantIndex'),
                                      'preparationId': event.get('id') if event['kind'] == 'preparation' else None,
                                      'study': event.get('study', event.get('phrase', {}).get('study')),
                                      'newTypeCount': count, 'newTypes': summary['newTypes']})
        unit['firstIntroductionTotal'] += count
        unit['maximumNewTypesPerPresentation'] = max(unit['maximumNewTypesPerPresentation'], count)
    return {'scope': 'First written occurrences per whole-phrase presentation in the scheduled L4 route; no comprehension/grammar claim.',
            'presentationCount': len(all_counts), 'firstIntroductionTotal': sum(all_counts),
            'maximumNewTypesPerPresentation': max(all_counts, default=0), 'units': list(units.values())}


def compare_sequences(before, after):
    before_units = {unit['unitId']: unit for unit in before['units']}
    after_units = {unit['unitId']: unit for unit in after['units']}
    require(set(before_units) == set(after_units), 'Sequence unit coverage differs')
    return {'wholeL4': {'before': {key: value for key, value in before.items() if key != 'units'},
                        'after': {key: value for key, value in after.items() if key != 'units'}},
            'units': [{'unitId': uid, 'before': before_units[uid], 'after': after_units[uid]}
                      for uid in before_units],
            'limits': 'A lower maximum for one unit is a local written-form signal. It does not lower the total number of first introductions or establish learning/difficulty.'}


def opening_comparison(rows, decks):
    previous = word_types(p['study'] for row in rows if row['proposedLevel'] < 4 for p in row['phrases'])
    units = {row['unitId']: row for row in rows}
    current = units['L4-fr-es-11']['phrases'][0]['study']
    bridge = decks['es'][264]['t']
    target = units['L4-fr-es-01']['phrases'][1]['study']
    return {'scope': 'Surface types against variants L1-L3 only; no claim about grammar or actual mastery.',
            'currentOpening': {'study': current, **type_summary(word_types([current]), previous)},
            'alternativePreparation': {'study': bridge, **type_summary(word_types([bridge]), previous)},
            'alternativeTargetAfterPreparation': {'study': target,
                **type_summary(word_types([target]), previous | word_types([bridge]))},
            'warning': 'Current opening adds one type; preparation plus alternative adds two across two phrases. This comparison does not establish a lower lexical opening load.'}


def build_report(root=ROOT, candidate_path=None):
    raw = git_bytes(root, BASELINE, RUNTIME)
    route = json.loads(raw)
    canonical, hashes = canonical_sources(root)
    checked, fields = checked_units(route, canonical)
    rows = ordered_rows(route)
    app_raw = git_bytes(root, BASELINE, 'melunga_deploy/app.html')
    decks = embedded_json(app_raw.decode(), 'var DECKS =')
    scenarios = {
        'administrative-pair-to-L6': {'L9-fr-es-13': 6, 'L8-fr-es-13': 6},
        'only-purpose-of-visit-to-L6': {'L8-fr-es-13': 6},
        'all-four-services-to-L6': {uid: 6 for uid in ENTRANTS},
        'one-routine-to-L3': {'L4-fr-es-01': 3},
        'three-routines-to-L3': {f'L4-fr-es-{index:02d}': 3 for index in (1, 2, 3)},
    }
    report = {'version': 1, 'baselineCommit': BASELINE, 'sourceCommit': SOURCE,
              'baselineRuntimeSha256': hashlib.sha256(raw).hexdigest(),
              'catalogueAppSha256': hashlib.sha256(app_raw).hexdigest(),
              'sourceFilesSha256': hashes, 'verifiedUnits': len(checked), 'verifiedSourceFields': fields,
              'method': {'scope': 'Four whole ES unit variants only, no dialogues/catalogue/model/slot/phonetics.',
                         'types': "Unicode letter groups in lower case; [^\\W\\d_]+; no lemmatisation.",
                         'ratio': 'Distinct types absent from all earlier levels / distinct types at this level.',
                         'comparison': 'Exact rational values; decimals for display only, no threshold.',
                         'preparation': 'Separate chronological first-occurrence scenario; never substituted for the level metric.',
                         'doesNotMeasureAcquisition': True, 'publicationApproved': False},
              'sourceLevels': stats(rows, source_levels=True), 'reviewedA4f1ec4': stats(rows),
              'decomposition': decomposition(rows),
              'levelCounterfactuals': {name: move_counterfactual(rows, changes) for name, changes in scenarios.items()},
              'cataloguePreparationScenarios': {name: chronological_preparation(rows, bridge_records(decks, definitions))
                                                 for name, definitions in BRIDGE_SCENARIOS.items()},
              'baselineL4Sequence': sequence_summary(chronological_preparation(rows, [])),
              'openingComparison': opening_comparison(rows, decks)}
    if candidate_path is not None:
        candidate_raw = Path(candidate_path).read_bytes()
        candidate = json.loads(candidate_raw)
        candidate_checked, candidate_fields = checked_units(candidate, canonical)
        candidate_rows = ordered_rows(candidate)
        preparations = checked_candidate_preparations(candidate_rows, decks, app_raw, root)
        chronological = chronological_preparation(candidate_rows, preparations)
        chronological['status'] = 'runtime-declared-whole-preparations-with-checked-earlier-steps'
        candidate_summary = sequence_summary(chronological)
        report['candidate'] = {'path': str(candidate_path), 'sha256': hashlib.sha256(candidate_raw).hexdigest(),
                               'verifiedUnits': len(candidate_checked), 'verifiedSourceFields': candidate_fields,
                               'statistics': stats(candidate_rows), 'decomposition': decomposition(candidate_rows),
                               'insertedPreparationCount': len(preparations),
                               'additionalPreparationSteps': 2 * len(preparations),
                               'chronologicalPreparations': chronological,
                               'comparisonToBaselineSequence': compare_sequences(report['baselineL4Sequence'], candidate_summary)}
    return report


def render_markdown(report):
    source = report['sourceLevels']['levels']
    baseline = report['reviewedA4f1ec4']['levels']
    lines = ['# Transition espagnole L3→L4 : mesures et scénarios', '',
             'Référence figée `a4f1ec4`, sans mutation du parcours ou des sources par cet outil. Les fractions de types écrits sont des indices de corpus ; elles ne mesurent ni effort grammatical, ni compréhension, ni acquisition.', '',
             '## Référence et décomposition', '',
             '| Niveau | Source : nouveaux/types | `a4f1ec4` : nouveaux/types |',
             '| --- | --- | --- |']
    def cell(row):
        return f'{row["newTypeCount"]}/{row["typeCount"]} = {row["percent"]:.6f} %'
    for level in range(2, 11):
        lines.append(f'| L{level} | {cell(source[level-1])} | {cell(baseline[level-1])} |')
    core = report['decomposition']['L4CoreOnly']
    lines += ['', 'L3 ne perd aucune unité source : deux unités de questions horaires L2 y arrivent. En L4, cinq déclarations personnelles sont préparées en L2 et quatre séries de services/démarches arrivent de L8/L9.', '',
              f'Les huit séries de vie/routines seules portent **{cell(core)}**. Les quatre entrantes apportent **24 des 70 types nouveaux** en dehors de ces huit séries. Les contributions par unité du JSON se recouvrent et ne doivent pas être additionnées.', '',
              '## Contrefactuels de niveaux, non recommandations', '',
              'Les unités déplacées sont ajoutées en fin du niveau visé dans leur ordre relatif initial. Les éventuels prérequis devenus futurs sont listés dans le JSON. Aucun de ces calculs ne démontre qu’un déplacement soit pédagogiquement souhaitable.', '',
              '| Scénario | L3 | L4 | L5 | L6 | Marches exactes |',
              '| --- | --- | --- | --- | --- | --- |']
    for name, scenario in report['levelCounterfactuals'].items():
        stats_ = scenario['statistics']
        lines.append('| ' + ' | '.join([name, *(cell(stats_['levels'][level-1]) for level in (3, 4, 5, 6)),
                                       ' · '.join(stats_['increasesExact']) or '—']) + ' |')
    lines += ['', '**Reporter Falta/Vengo en L6 ne supprime pas L3→L4 et crée une remontée L4→L5.** Déplacer les quatre services réduit davantage L4, mais cette remontée L4→L5 apparaît encore. Anticiper trois routines en L3 efface le premier signe tout en le déplaçant vers L4→L5. Une courbe plus plate sur une frontière ne suffit pas à retenir ces mouvements.', '',
              '## Préparations catalogue : autre périmètre, autres questions', '',
              'Les scénarios ci-dessous insèrent chaque phrase entière immédiatement avant sa variante cible, dans l’ordre déclaré des variantes. Ils ne sont pas une description des acquis à l’entrée de L4. Chaque carte introduit elle-même ses formes ; ces types ne disparaissent pas du niveau.', '',
              '| Scénario de présentation | Types introduits par cartes | Types introduits par variantes après cartes | Types hors variantes L4 | Ratio textes L4 + cartes |',
              '| --- | ---: | ---: | ---: | --- |']
    for name, scenario in report['cataloguePreparationScenarios'].items():
        lines.append('| ' + ' | '.join([name, str(len(scenario['typesIntroducedFirstByPreparations'])),
                                       str(len(scenario['typesIntroducedFirstByTargetVariants'])),
                                       str(len(scenario['additionalTypesOutsideCurrentL4Variants'])),
                                       cell(scenario['combinedL4Texts'])]) + ' |')
    lines += ['', 'Les deux ponts `Como en casa.` / `Me acuesto pronto.` introduisent des formes avant leur emploi avec un repère de routine. Les cartes, leurs textes et leurs aides sont copiés sans retouche depuis le catalogue figé. Les autres scénarios montrent trois/quatre cartes possibles, sans les déclarer intégrées. Les conventions phonétiques de certains candidats (travail/gymnase) diffèrent du contenu conversation ; ce calcul ne les harmonise pas et ne les valide pas.', '',
              'Le tableau ne remplace pas le ratio de variantes : celui-ci reste 70/110 dans tous les scénarios sans mouvement de niveau. Avec les trois supports retenus dans cette passe (264/283/542), le total de tous les textes donne 70/111 parce que temprano, déjà présent en L2, entre dans le dénominateur de L4. Cette baisse purement arithmétique ne constitue pas une amélioration de la transition. La trace chronologique documente où chaque type apparaît d’abord ; son emploi ultérieur reste une reprise prévue, pas une production acquise.', '',
              '## Alternative d’ouverture non retenue : vérifier sans fabriquer un avantage', '',
              'Sur le stock exact des variantes L1–L3, l’ouverture actuelle **En mi barrio hay un mercado.** ajoute `barrio`, un type. Le pont **Como en casa.** ajoute `como`, puis **Normalmente como en casa.** ajoute `normalmente` : deux types sur deux phrases, répartis un puis un. Cet autre chemin ne démontre pas une baisse de nouveauté lexicale de l’ouverture ; le choix final conserve l’ordre des unités et n’en fait pas l’ouverture du niveau.', '',
              '## Garde de périmètre', '',
              f'{report["verifiedUnits"]} unités et {report["verifiedSourceFields"]} champs exacts sont contrôlés avant les calculs. Les 70 sources actives, le runtime figé et l’application catalogue portent leurs empreintes dans le JSON. Les dialogues et les sept scènes L1 restent hors de cette mesure ; aucun tarif, accès, texte ou phonétique source n’est modifié.', '']
    if 'candidate' in report:
        candidate = report['candidate']
        lines += ['## Candidat mesuré séparément', '', f'Empreinte runtime : `{candidate["sha256"]}`. La référence `a4f1ec4` ci-dessus reste conservée.', '',
                  '| Niveau | Candidat : nouveaux/types |', '| --- | --- |']
        for level in range(2, 11):
            lines.append(f'| L{level} | {cell(candidate["statistics"]["levels"][level-1])} |')
        seq = candidate['comparisonToBaselineSequence']
        combined = candidate['chronologicalPreparations']['combinedL4Texts']
        lines += ['', 'Ces valeurs conservent le périmètre variantes seules. Une préparation supplémentaire n’est pas ajoutée implicitement à ce dénominateur.', '',
                  f'Le candidat instancie **{candidate["insertedPreparationCount"]} supports avec {candidate["additionalPreparationSteps"]} étapes supplémentaires** de compréhension/imitation, vérifiées avant leur variante cible. Tous supports L4 : **{cell(combined)}** ; ce chiffre conserve son autre dénominateur et ne remplace pas 70/110.', '',
                  '### Premières occurrences réellement réparties dans le plan candidat', '',
                  '| Unité | Max types nouveaux par présentation, avant → après | Total de premières introductions, avant → après |',
                  '| --- | ---: | ---: |']
        for unit in seq['units']:
            a, b = unit['before'], unit['after']
            lines.append(f'| {unit["unitId"]} | {a["maximumNewTypesPerPresentation"]} → {b["maximumNewTypesPerPresentation"]} | {a["firstIntroductionTotal"]} → {b["firstIntroductionTotal"]} |')
        a, b = seq['wholeL4']['before'], seq['wholeL4']['after']
        lines += [f'| **Tout L4** | **{a["maximumNewTypesPerPresentation"]} → {b["maximumNewTypesPerPresentation"]}** | **{a["firstIntroductionTotal"]} → {b["firstIntroductionTotal"]}** |', '',
                  'Une présentation est ici la première écoute/lecture d’une phrase entière ; sa répétition à l’imitation ne crée pas de nouvelle forme écrite. Les supports introduisent eux-mêmes leurs mots. Le maximum plus faible éventuel d’une unité ne s’étend pas au niveau entier et ne mesure ni reconnaissance orale ni apprentissage.', '']
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--candidate-file', type=Path)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    report = build_report(candidate_path=args.candidate_file)
    outputs = {OUTPUT.with_suffix('.json'): json.dumps(report, ensure_ascii=False, indent=2) + '\n',
               OUTPUT.with_suffix('.md'): render_markdown(report)}
    for relative, content in outputs.items():
        path = ROOT / relative
        if args.check:
            require(path.exists() and path.read_text(encoding='utf-8') == content, f'Stale transition report: {relative}')
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding='utf-8')
    print(json.dumps({'baseline': BASELINE, 'units': report['verifiedUnits'],
                      'sourceFields': report['verifiedSourceFields'], 'candidate': 'candidate' in report}))


if __name__ == '__main__':
    main()

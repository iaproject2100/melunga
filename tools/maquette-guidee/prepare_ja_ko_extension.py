#!/usr/bin/env python3
"""Append-only ledger for the 18 situation modules, Japanese and Korean.

No catalogue, runtime bundle, old ledger or phonetic fragment is edited.
Whole literal new drafts live in extension-pistes/ja-ko-propositions-entières.json.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import re
import shutil
import unicodedata
from collections import Counter
from pathlib import Path
import prepare_ja_ko_situations as base

ROOT = base.ROOT
D = base.DOSSIER
X = D / 'extension-pistes'
FROZEN_PLAN = 'd2ce2e8d9476756ee7e6651a3103b449ee89625ec1065c4fdf6f83382010a379'


def serial(x):
    return json.dumps(x, ensure_ascii=False, indent=2) + '\n'


def normal(x):
    return ''.join(c for c in unicodedata.normalize('NFKC', x).lower() if c.isalnum())


def question(x):
    return x['native'].rstrip().endswith('?')


def stripped_reading_script(x):
    return 'hiragana' if any('\u3040' <= c <= '\u309f' for c in x.get('reading', '')) else 'latin'


def check_base():
    guard = json.loads((D / 'preuves/ja-ko-base-80-empreintes.json').read_text())
    old = {}
    for pair, record in guard['pairs'].items():
        path = D / (pair + '.json')
        assert base.raw_sha(path) == record['fullFileSha256'], ('ancien fichier modifié', pair)
        payload = json.loads(path.read_text())
        assert len(payload['items']) == 80
        assert base.sha(payload['items']) == record['itemsCanonicalSha256']
        for item, expected in zip(payload['items'], record['items']):
            assert item['id'] == expected['id'] and base.sha(item) == expected['canonicalSha256']
        old[pair] = payload
    return old, guard


def stocks(lang, decks, archive, old):
    rows, files = base.stock_for(lang, decks, archive)
    # A whole lexical slot is a source entry too. It may be copied as a support
    # only with all its own fields; never trim a particle or an aid from it.
    for parent in sorted(archive.glob(f'L*-fr-{lang}.json')):
        document = json.loads(parent.read_text())
        for ui, unit in enumerate(document.get('units', [])):
            for vi, variant in enumerate(unit.get('variants', [])):
                slot = variant.get('slot')
                if not isinstance(slot, dict) or not all(isinstance(slot.get(k), str) and slot[k].strip() for k in ['study', 'native', 'phon']):
                    continue
                if re.search(r'\{[^}]+\}|…|\.\.\.|_{2,}|〜|～', slot['study']):
                    continue
                pointer = f'/units/{ui}/variants/{vi}/slot'
                rows.append({'key': f'conversation:{parent.name}:{pointer}', 'kind': 'conversation-whole-entry',
                             **{k: slot[k] for k in ['study', 'native', 'phon', 'reading'] if k in slot},
                             'isLexicalSlot': True,
                             'source': {'archiveFile': parent.name, 'jsonPointer': pointer,
                                        'fileSha256': base.raw_sha(parent), 'entrySha256': base.sha(slot),
                                        'sourceCommit': base.SOURCE_COMMIT, 'sourceLevel': document.get('level'),
                                        'unitId': unit.get('id'), 'originalRole': 'whole lexical source slot'}})
    for item in old['fr-' + lang]['items']:
        # Reuse the primary candidate itself only for its complete existing fields.
        rows.append({'key': 'candidate:' + item['id'], 'kind': 'candidate-reference',
                     **{k: item[k] for k in ['study', 'native', 'phon', 'reading'] if k in item},
                     'source': {'candidateId': item['id']},
                     'phoneticReviewStatus': item['phoneticReviewStatus'],
                     'firstEditorialLevel': item['proposedLevel']})
    master_path = ROOT / 'docs/niveaux-progressifs/corrections-themes/enrichissements-rediges.json'
    for item in json.loads(master_path.read_text())['items']:
        if item['pair'] == 'fr-' + lang:
            rows.append({'key': 'editorial:' + item['id'], 'kind': 'candidate-reference',
                         **{k: item[k] for k in ['study', 'native', 'phon', 'reading'] if k in item},
                         'source': {'canonicalId': 'editorial:' + item['id']},
                         'phoneticReviewStatus': item['phoneticReviewStatus'],
                         'firstEditorialLevel': item.get('proposedLevel', item.get('editorialLevel'))})
    return rows, files


def capture_placements(all_drafts, old):
    path = X / 'ja-ko-source-placements.json'
    if path.exists():
        return json.loads(path.read_text())
    source_map = {}
    for lang in ['ja', 'ko']:
        decisions = {x['sourceIndex']: x for x in json.loads((ROOT / f'docs/niveaux-progressifs/types-contenu/fr-{lang}.json').read_text())['assignments']}
        locations = {}
        for level in range(1, 11):
            cell = json.loads((ROOT / f'melunga_deploy/content/niveaux-progressifs/fr-{lang}/L{level}.json').read_text())
            for item in [p for t in cell['themes'] + cell.get('heldThemes', []) for p in t['phrases']] + cell.get('reserve', []):
                source = item.get('source', {})
                if source.get('collection') == 'DECKS.' + lang:
                    index = source['sourceIndex']
                    decision = decisions[index]
                    locations[index] = {'firstEditorialLevel': item['editorialLevel'], 'contentType': item['contentType'],
                                        'lexicalFamily': decision.get('lexicalFamilyOverride', item.get('placement', {}).get('domain')),
                                        **{k: decision[k] for k in ['lexicalClass', 'lexicalUsage'] if k in decision}}
        # The original eighty usages remain fixed; use their already approved first introduction.
        protected = {}
        for item in old['fr-' + lang]['items']:
            if item['kind'] == 'catalogue-reference':
                index = item['source']['sourceIndex']
                locations[index]['firstEditorialLevel'] = min(locations[index]['firstEditorialLevel'], item['proposedLevel'])
                protected[str(index)] = locations[index]['firstEditorialLevel']
        keys = {draft['reuseKey'] for group in all_drafts['pairs'][lang].values() for draft in group if draft.get('reuseKey', '').startswith('catalogue:')}
        # Include exact source matches to a draft discovered after the independent full drafting.
        source_map[lang] = {'catalogue': {str(index): value for index, value in locations.items()},
                            'protectedCatalogueIntroductions': protected}
    result = {'version': 1, 'sourceManifestSha256': base.raw_sha(ROOT / 'melunga_deploy/content/niveaux-progressifs/manifest.json'),
              'reason': 'Frozen pre-extension editorial placements; no self-derived later first introduction.', 'pairs': source_map}
    path.write_text(serial(result))
    return result


LEVEL_NOTES = {
 'ja': {
  1: 'Formules courtes apprises entières, sans règle de conjugaison déduite. Le départ d’une visite n’utilise pas 行ってきます, qui annonce normalement un départ avec retour au lieu quitté. Les particules, le registre poli et le compteur 一杯 restent dans leurs expressions fixes.',
  2: 'Une demande ou un constat entier est préparé avant sa reprise. ワンサイズ上 reste un groupe fixe : aucune introduction simultanée d’un comparatif productif et d’un compteur variable. 地図 désigne un plan géographique, pas 計画. Les variantes grammaticales distinctes ne sont pas annoncées comme un simple changement de mot.',
  3: 'Préférences, activité, apprentissage et accès numérique dans des situations bornées. アカウント n’est ni 会計 (note à payer) ni 口座 (compte bancaire). Le besoin, la permission, l’offre de capacité et la demande de service restent des actes distincts. Les temps et compteurs sont préparés dans des groupes entiers.',
  4: 'Le passé positif/négatif, l’état résultant et la perception sont explicites. Une question portant sur une soirée ne peut jamais être copiée comme une réponse affirmative au passé. Le récit culturel importé se situe le dimanche : hier et samedi y coïncident. La chambre est décrite après une intervention de nuit, puis le retour à l’accueil a lieu le matin.',
  5: 'Modification d’un rendez-vous réservé et dépannage : ordre des actions, contraste, maintien d’un problème, possibilité puis résultat. La confirmation de réservation concerne la personne qui accepte le nouvel horaire ; elle n’affirme pas être l’employé qui tient l’agenda. Le son reçu et la voix transmise sont distingués, sans inventer une cause technique.',
  8: 'Le tact est réalisé par reconnaissance de contrainte, demande de faisabilité, portée limitée, hypothèse et condition, pas en rebaptisant ください plus poli. L’avis reconnu n’est pas réputé accepté ; la limite personnelle et le choix restent explicites. Chaque construction complexe est portée par une phrase entière et ses mots préparés.',
  9: 'Argument concret sur cours individuel / petit groupe : critère de temps de parole, utilité des échanges entre apprenants, concession puis réponse à une objection précise. Ce ne sont pas huit opinions génériques. Question→réponse03 et objection→réponse08 sont séparées ; les phrases entendues ne deviennent jamais des productions.'},
 'ko': {
  1: 'Formules entières en registre poli. Entrer 들어가도 돼요, annoncer sa place et annoncer son départ ne sont pas confondus. 한 잔 est un groupe fixé pour une boisson, pas une règle générale de compteurs. Les mots 단어 et 뜻 sont rédigés comme entrées lexicales autonomes, avec des aides indépendantes.',
  2: '한 사이즈 위 est conservé entier : pas de comparatif 더 + nouvelle forme adnominale + compteur introduits ensemble. 큰/작은 sont des formes adnominales entières nécessitant un nom dans une phrase. 지도 est une carte géographique, pas 계획. Les permissions et les besoins ne sont pas intervertis.',
  3: 'Registre -요 cohérent pour goûts, études, sport et compte. 계정 n’est ni 계산 (note/calcul) ni 계좌 (compte bancaire). Les groupes relatifs, la comparaison, le but et les quantités de temps restent déclarés dans des énoncés complets ; aucun accord ou pronom français n’est transposé automatiquement.',
  4: 'Passé et état résultant, position d’objet puis résolution. La question 좋은 저녁 보냈어요? n’est pas présentée comme l’affirmation 좋은 저녁을 보냈어요. Le contexte est celui d’un récit terminé ; le retour à l’accueil après la réparation de nuit est situé le matin pour que le sommeil soit déjà passé.',
  5: 'Rendez-vous réservé, plages horaires et dépannage. 예약 est choisi pour un rendez-vous avec un service, pas pour une simple promesse personnelle. Fermeture puis réouverture de l’application, voix reçue et voix non entendue sont distinctes. Les confirmations prononcées par l’agent restent uniquement reçues.',
  8: 'Tact véritable : reconnaître une contrainte sans céder sur le fait, proposer une solution limitée, atténuer une conclusion, préciser une condition et demander une confirmation écrite. -주세요 n’est jamais présenté comme une nouveauté L8. Les répliques se terminent en -요 ; les formules de réception 감사합니다 relèvent du rôle qui les emploie.',
  9: 'Argumenter sur une vraie alternative de cours : petits groupes et cours individuels. Comparaison du temps de parole, reconnaissance d’une limite puis critère des échanges entre élèves. Les relatifs et constructions concessives sont déclarés ; ni un mot important ni un lien éditorial ne prouve l’acquisition de l’argumentation.'}}

SPECIAL = {
 ('ja', 'piste-visite-proches-02'): 'Le remerciement poli bref réalise ici la gratitude envers l’hôte. La traduction source Merci beaucoup est conservée ; elle n’est pas réécrite pour faire croire que le mot accueil est prononcé.',
 ('ko', 'piste-visite-proches-02'): '감사합니다 est le remerciement adressé à l’hôte dans ce contexte. La traduction source Merci reste entière ; aucun complément d’accueil n’est inventé dans la source.',
 ('ja', 'piste-visite-proches-07'): 'そろそろ帰ります est naturel quand un invité quitte la maison d’autrui. 行ってきます n’est pas repris malgré une traduction française proche : cette formule suppose habituellement un retour au lieu que l’on quitte.',
 ('ja', 'piste-visite-proches-04'): 'La source exprime le plaisir de retrouver les proches, avec une intensification conservée. Elle n’est pas confondue avec une première présentation formelle à un inconnu.',
 ('ja', 'piste-ralentir-repeter-06'): 'Le mot vient d’être demandé à l’écrit dans la carte précédente. La question existante Ça veut dire quoi ? a donc son référent, sans inventer un mot de passe ni extraire un segment d’aide.',
 ('ko', 'piste-ralentir-repeter-06'): 'La question signifie Que veut dire cela ? ; le mot montré est l’objet de la demande précédente. Le sens de 뜻 sera préparé lexicalement, sans extraire sa phonétique de 무슨 뜻이에요.',
 ('ja', 'piste-vetement-taille-05'): 'ワンサイズ上 est une expression entière et fixée pour une taille au-dessus. Elle ne sert pas à déduire une comparaison universelle plus grand + n’importe quel compteur.',
 ('ko', 'piste-vetement-taille-05'): '한 사이즈 위 est conservé au caractère près. Le modèle n’ajoute pas 더 큰 et un nouveau compteur à la même première rencontre.',
 ('ja', 'piste-sortie-culturelle-02'): 'Tour de l’apprenant A conservé entier. Le récit est raconté le dimanche ; le hier de la source correspond donc au samedi de la première carte. Le moi initial et les aides restent inchangés.',
 ('ko', 'piste-sortie-culturelle-08'): '여동생 précise petite sœur sans supposer le genre de la personne qui parle ; la traduction française ajoute petite pour garder cette information exacte.',
 ('ja', 'piste-sortie-culturelle-08'): '妹 précise petite sœur ; on ne transpose pas un accord masculin/féminin du français ni un âge relatif non déclaré.',
 ('ja', 'piste-recuperer-compte-05'): 'La fonction est de demander un nouveau code au service d’aide ; la question de service japonaise accomplit cette demande. Elle n’est pas utilisée pour remplacer un énoncé de besoin distinct.',
 ('ko', 'piste-boisson-precise-06'): '차로 할게요 acte le choix du thé après le choix antérieur de café. Ce n’est pas une nouvelle préférence permanente ni une simple modification de traduction d’une forme déjà présente.',
 ('ja', 'piste-limites-relationnelles-02'): '胸にしまう signifie ici garder pour soi ; il ne décrit pas une douleur thoracique et ne doit pas être routé vers santé.',
 ('ko', 'piste-limites-relationnelles-02'): 'La formule explique que le sujet est personnel et difficile à détailler. Ce refus de divulguer respecte la fonction de garder le sujet pour soi, sans être une réponse à une offre de repas.',
 ('ja', 'piste-limites-relationnelles-08'): 'Le remerciement source pour la compréhension clôt la limite qui vient d’être posée. Aucun mot limite absent de la source n’est ajouté.',
 ('ko', 'piste-limites-relationnelles-08'): 'Le remerciement source pour la compréhension suit la limite explicitement posée. Le sens source reste inchangé et la formule n’est pas réputée nouvelle.',
}


def short(row):
    return {k: row[k] for k in ['key', 'study', 'native', 'phon', 'reading', 'source'] if k in row}


def generate_pair(lang, plan, drafts, old, placements, decks, archive, check):
    pair = 'fr-' + lang
    rows, files = stocks(lang, decks, archive, old)
    lookup = {x['key']: x for x in rows}
    forms, readings = {}, {}
    for row in rows:
        forms.setdefault(normal(row['study']), []).append(row)
        if row.get('reading'):
            readings.setdefault(normal(row['reading']), []).append(row)
    themes = {t['topicId']: t for t in plan['themes'][10:]}
    intents = {i['id']: i for t in themes.values() for i in t['intents']}
    received_defs = {x['id']: x for x in plan['receivedTurnsDefs']}
    assert len(drafts['learner']) == len(intents) == 144
    assert len(drafts['received']) == len(received_defs) == 37
    assert {x['id'] for x in drafts['received']} == set(received_defs)
    assert len({x['id'] for x in drafts['lexicalSupports']}) == len(drafts['lexicalSupports'])
    assert len(drafts['lexicalSupports']) >= 36
    assert len({x['intentId'] for x in drafts['learner']}) == 144
    source_copies, evidence, new_forms = {}, [], {}
    groups = {'items': [], 'receivedTurns': [], 'lexicalSupports': []}
    decisions = json.loads((ROOT / f'docs/niveaux-progressifs/types-contenu/{pair}.json').read_text())['assignments']
    classification = {x['sourceIndex']: x for x in decisions}
    for group, output in [('learner', 'items'), ('received', 'receivedTurns'), ('lexicalSupports', 'lexicalSupports')]:
        for draft in drafts[group]:
            entry_id = draft.get('intentId', draft.get('id'))
            definition = intents[entry_id] if group == 'learner' else received_defs[entry_id] if group == 'received' else None
            topic = definition['topicId'] if definition else draft['topicId']
            theme = themes[topic]
            level = theme['level']
            query = definition['referenceUtteranceFr'] if definition else draft.get('native', '')
            row = lookup.get(draft.get('reuseKey'))
            # Exact forms, orthographic variants with the same reading and punctuation-only variants are not new.
            if row is None:
                exact = forms.get(normal(draft['study']), [])
                if not exact and draft.get('reading'):
                    exact = readings.get(normal(draft['reading']), [])
                if exact:
                    compatible = [x for x in exact if question(x) == question(draft)]
                    assert compatible, ('même forme mais acte différent à revoir', pair, entry_id, [x['key'] for x in exact])
                    row = min(compatible, key=lambda z: (z['kind'] != 'catalogue-reference', z['kind'] == 'candidate-reference'))
            values = {k: (row or draft)[k] for k in ['study', 'native', 'phon', 'reading'] if k in (row or draft)}
            assert all(isinstance(x, str) and x.strip() for x in values.values())
            assert not re.search(r'\{[^}]+\}|…|\.\.\.|_{2,}|〜|～', values['study'])
            assert not values['study'].lstrip().startswith(('—', '−')), ('deux voix ne sont pas un modèle apprenant', pair, entry_id)
            if row and row['kind'] == 'conversation-whole-entry' and group == 'learner':
                assert not row.get('isLexicalSlot'), ('slot lexical non produit comme phrase', row['key'])
                source = row['source']
                assert source.get('originalSpeaker', source.get('originalLearnerRole')) == source.get('originalLearnerRole'), ('tour source non apprenant', source)
            kind = row['kind'] if row else 'editorial-authored-whole-entry'
            source = row['source'].copy() if row else {'kind': 'editorial-authored-whole-utterance'}
            if kind == 'conversation-whole-entry':
                parent = archive / source.pop('archiveFile')
                destination = D / 'sources/conversation' / pair / parent.name
                if check:
                    assert destination.read_bytes() == parent.read_bytes()
                else:
                    destination.parent.mkdir(parents=True, exist_ok=True)
                    if destination.exists():
                        assert destination.read_bytes() == parent.read_bytes()
                    else:
                        shutil.copyfile(parent, destination)
                source['path'] = str(destination.relative_to(ROOT))
                source_copies[source['path']] = source['fileSha256']
            exact_matches = forms.get(normal(values['study']), [])
            same_reading = readings.get(normal(values.get('reading', '')), []) if values.get('reading') else []
            newly_written = row is None
            if newly_written:
                assert not exact_matches and not same_reading
                norm = normal(values['study'])
                assert norm not in new_forms, ('doublon entre nouvelles entrées', entry_id, new_forms.get(norm))
                new_forms[norm] = entry_id
            reason = SPECIAL.get((lang, entry_id)) or (
                'Énoncé entier pertinent pour cette intention et ce rôle, copié sans changer les champs ni l’aide.' if row else
                'Forme entière rédigée pour la fonction concrète de cette scène ; les correspondances consultées ne couvraient pas ce sens, ce rôle et cet acte de parole. L’aide est un littéral entier à vérifier par Claude.')
            if group == 'lexicalSupports':
                reason = ('Mot ou groupe lexical autonome copié entier ; sa famille est choisie d’après son sens, pas le défaut vocab-actions.' if row else
                          'Mot autonome rédigé comme entrée de dictionnaire et aide indépendante complète. Sa présence à l’intérieur de phrases ne constitue pas une ancienne entrée lexicale et aucune aide n’en a été extraite.')
            elif group == 'received':
                reason += ' Réplique du rôle ' + definition['role']['label']['fr'] + ', uniquement reçue : jamais analysée ni demandée en production. Les réponses listées sont préparées avant son affichage.'
            exact_keys = [x['key'] for x in exact_matches]
            audit = {'status': 'reviewed', 'exactFormMatches': exact_keys,
                     'existingExactFormCount': len(exact_keys),
                     'sameReadingMatches': [x['key'] for x in same_reading],
                     'newFormClaim': newly_written,
                     'translationOrAidDifferenceIsNotNovelty': True,
                     'oldDraftsAndConversationsSearched': True,
                     'searchQuery': query,
                     'newBroadGrammarClaim': False,
                     'evidencePath': f'docs/niveaux-progressifs/enrichissement-situations/extension-pistes/{pair}-recherche.json',
                     'evidenceId': entry_id,
                     'semanticDecision': reason}
            item = {'id': pair + ':' + entry_id, 'pair': pair, 'topicId': topic, 'proposedLevel': level,
                    'contentType': 'vocabulary' if group == 'lexicalSupports' else 'utterance',
                    'kind': kind, **values, 'source': source,
                    'editorialReviewStatus': 'reviewed',
                    'phoneticReviewStatus': row.get('phoneticReviewStatus', 'existing-verbatim') if row else 'pending-Claude',
                    'reason': reason, 'duplicateAudit': audit,
                    'readingScript': stripped_reading_script(values),
                    'doesNotMeasureAcquisition': True}
            if group == 'learner':
                item['intentId'] = entry_id
                item['dependencyConcepts'] = definition.get('requiredKnownConcepts', [])
                item['pedagogicalNotes'] = {'plannedPreparationOnly': True, 'singleParameterClaim': False,
                    'wholeUtterancePreparedBeforeRecall': True,
                    'languageSpecificPreparation': LEVEL_NOTES[lang][level]}
            elif group == 'received':
                item.update(definitionId=entry_id, role=definition['role']['label'].copy(), analyse=False,
                            answerWith=definition['answerWith'].copy(), countsTowardProductionProgression=False,
                            requiresProduction=False, firstHeardLevel=level)
                key = 'beforeIntentId' if 'beforeIntentId' in definition else 'afterIntentId'
                item[key] = definition[key]
                item['turnKind'] = 'closure' if key == 'afterIntentId' else 'objection' if entry_id == 'piste-repondre-objection-received-02' else 'question'
                assert item['turnKind'] != 'closure' or item['answerWith'] == []
                for answer in item['answerWith']:
                    assert answer in intents and intents[answer]['topicId'] == topic
            else:
                item.update(lexicalClass='other', lexicalClassReviewStatus='reviewed',
                            lexicalClassReason='Mot ou groupe lexical autonome relu avec son sens ; une forme liée ouverte ne peut pas servir de soutien.',
                            introducedBeforeIntentId=topic + '-01', analyse=False,
                            countsTowardProductionProgression=False, insertedIntoPhraseSteps=False)
            if row and kind == 'catalogue-reference':
                index = source['sourceIndex']
                card = decks[lang][index]
                assert source['sourceSha256'] == base.sha(card)
                assert [item[k] for k in ['study', 'native', 'phon', 'reading']] == [card[k] for k in ['t', 'frm', 'pf', 'py']]
                location = placements['pairs'][lang]['catalogue'][str(index)]
                if group == 'lexicalSupports':
                    assert classification[index]['contentType'] in {'vocabulary', 'number'}, ('source non lexicale', index)
                    item['contentType'] = classification[index]['contentType']
                    item['lexicalFamily'] = location['lexicalFamily']
                    for key in ['lexicalClass', 'lexicalUsage']:
                        if key in location:
                            item[key] = location[key]
                if group != 'received' and location['firstEditorialLevel'] > level:
                    assert str(index) not in placements['pairs'][lang]['protectedCatalogueIntroductions'], ('première rencontre protégée', index)
                    item['introductionDecision'] = {'action': 'introduce-earlier', 'fromEditorialLevel': location['firstEditorialLevel'],
                        'proposedLevel': level, 'reviewStatus': 'reviewed',
                        'reason': 'Première rencontre éditoriale locale de cette forme entière. Le niveau source lv et les droits historiques ne sont pas changés. Le modèle ou mot est préparé avant son emploi ; aucun acquis n’est présumé.'}
            elif row and kind == 'candidate-reference':
                assert row['firstEditorialLevel'] <= level, ('ancien candidat protégé plus tardif', row['key'], level)
            elif row and kind == 'conversation-whole-entry' and group != 'received' and source['sourceLevel'] > level:
                item['introductionDecision'] = {'action': 'introduce-earlier', 'fromEditorialLevel': source['sourceLevel'],
                    'proposedLevel': level, 'reviewStatus': 'reviewed',
                    'reason': 'Import entier inédit dans cette rubrique d’une source de conversation plus tardive. Le noyau local est simple et contextualisé ; aucune carte classique ni aide ni droit existant n’est déplacé.'}
            if group == 'lexicalSupports' and 'lexicalFamily' not in item:
                item['lexicalFamily'] = draft.get('lexicalFamily', 'vocab-travail')
            top = sorted(rows, key=lambda z: -base.french_score(query or values['native'], z))[:3]
            evidence.append({'id': entry_id, 'group': group, 'referenceUtteranceFr': query,
                             'chosen': {k: item[k] for k in ['kind', 'study', 'native', 'phon', 'reading', 'source'] if k in item},
                             'exactFormMatches': [short(x) for x in exact_matches],
                             'sameReadingMatches': [short(x) for x in same_reading],
                             'surfaceFrenchCandidates': [short(x) for x in top],
                             'semanticDecision': reason, 'surfaceSimilarityDoesNotProveEquivalence': True})
            groups[output].append(item)
    assert Counter(x['topicId'] for x in groups['items']) == Counter({t: 8 for t in themes})
    assert Counter(x['topicId'] for x in groups['lexicalSupports']) == Counter({t: 2 for t in themes})
    # Paired question/objection/answer/closure contracts are not progress events for the heard role.
    assert len([x for x in groups['receivedTurns'] if x['turnKind'] == 'closure']) == 18
    counts = {}
    for group, items in groups.items():
        kinds = Counter(x['kind'] for x in items)
        counts[group] = {'total': len(items), 'kinds': dict(kinds),
                         'newWholeForms': sum(x['duplicateAudit']['newFormClaim'] for x in items),
                         'wholeAidsPendingClaude': sum(x['phoneticReviewStatus'] == 'pending-Claude' for x in items),
                         'earlierIntroductions': sum('introductionDecision' in x for x in items)}
    report = {'version': 1, 'pair': pair, 'planHash': FROZEN_PLAN,
              'sourceDeckSha256': base.sha(decks[lang]), 'conversationSourceFiles': files,
              'wholeLexicalSourceSlotsSearched': sum(bool(z.get('isLexicalSlot')) for z in rows),
              'conversationWholeEntriesSearched': len(rows) - len(decks[lang]) - 80 - (10 if lang == 'ja' else 8),
              'sourceSnapshotsCopied': source_copies,
              'oldBaseObjectsUnchanged': 80, 'oldBaseFileUnchanged': True,
              'counts': counts,
              'normalization': 'NFKC et caractères alphanumériques : recherche seulement. Toutes les valeurs copiées restent strictement verbatim.',
              'sourceScope': 'DECKS entier du couple, variantes/tours et objets slot lexicaux entiers des dix conversations L1–L10, anciens quatre-vingts candidats et mots éditoriaux ; comparaison entre les nouvelles entrées.',
              'semanticReviewOwner': 'Codex', 'phoneticReviewOwner': 'Claude',
              'limits': ['Les aides nouvelles sont des candidates entières, pas des aides vérifiées en natif.',
                         'Les scores de candidats ne décident pas du sens.',
                         'Les variantes de temps, de personne ou de politesse ne sont pas annoncées comme de nouvelles règles grammaticales.',
                         'Les sources canoniques réemployées ne sont pas comptées comme de nouvelles formes.',
                         'Aucune preuve d’apprentissage ni d’expérience réelle hébergée ne découle de cet audit de contenu.'],
              'entries': evidence}
    payload = {'version': 1, 'pair': pair, 'planHash': FROZEN_PLAN, 'status': 'editorial-review', **groups,
               'extensionPistes': {'moduleCount': 18, 'unchangedBaseItems': 80, 'doesNotMeasureAcquisition': True,
                                   'newPhoneticsRequireClaude': True},
               'searchEvidence': {'path': f'docs/niveaux-progressifs/enrichissement-situations/extension-pistes/{pair}-recherche.json',
                                  'sha256': hashlib.sha256(serial(report).encode()).hexdigest(), 'counts': counts}}
    return payload, report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--archive', type=Path, default=base.DEFAULT_ARCHIVE)
    args = parser.parse_args()
    assert base.raw_sha(D / 'plan.json') == FROZEN_PLAN
    plan = json.loads((D / 'plan.json').read_text())
    assert len(plan['themes']) == 28
    old, _ = check_base()
    drafts = json.loads((X / 'ja-ko-propositions-entières.json').read_text())
    decks = base.parse_decks()
    placements = capture_placements(drafts, old)
    for lang in ['ja', 'ko']:
        payload, report = generate_pair(lang, plan, drafts['pairs'][lang], old, placements, decks, args.archive, args.check)
        for path, value in [(D / f'extension-fr-{lang}.json', payload), (X / f'fr-{lang}-recherche.json', report)]:
            if args.check:
                assert path.read_text() == serial(value), ('à régénérer', str(path))
            else:
                path.write_text(serial(value))
        print(json.dumps({'pair': payload['pair'], 'counts': report['counts'], 'base80unchanged': True}, ensure_ascii=False), flush=True)
    check_base()


if __name__ == '__main__':
    main()

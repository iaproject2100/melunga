#!/usr/bin/env python3
"""Find existing, reader-adapted whole phrases for additional daily-life themes."""
import argparse
import json
import re
from pathlib import Path

from guard_phonetics import extract_decks, aids_of, native_field, meaning_of

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs/progression-complete'
THEMES = [
 ('rencontres', 'Rencontrer et se présenter', [1, 3], r'bonjour|appelle|rencontr|présent'),
 ('famille', 'Famille et proches', [1, 4], r'famille|enfant|frère|soeur|sœur|parents'),
 ('boissons', 'Commander et changer de boisson', [1, 2], r'café|thé|boisson|eau'),
 ('alimentation', 'Repas, goûts et restrictions', [1, 3], r'manger|repas|allerg|végétar|sans sucre'),
 ('marche', 'Marché et courses', [1, 3], r'marché|supermarché|légume|fruit|courses'),
 ('paiement', 'Prix et paiement', [1, 3], r'combien|payer|carte bancaire|monnaie'),
 ('chemin', 'Demander et expliquer un chemin', [1, 4], r'chemin|droite|gauche|tout droit|où est'),
 ('transports', 'Transports et billets', [1, 6], r'billet|métro|gare|bus|train'),
 ('maison', 'Maison et objets du quotidien', [1, 4], r'cuisine|chambre|maison|clé|table'),
 ('routine', 'Une journée ordinaire', [1, 4], r'matin|soir|tous les jours|habitude'),
 ('aide', 'Demander de l’aide et faire répéter', [1, 3], r'aider|répét|plus lentement|comprends pas'),
 ('meteo', 'Météo et petits échanges', [1, 4], r'pleut|pluie|beau temps|il fait|météo'),
 ('vetements', 'Vêtements et tailles', [2, 7], r'taille|vêtement|chaussure|essayer|pantalon'),
 ('sante', 'Un besoin simple de santé', [1, 9], r'j.ai mal|malade|médecin|pharmacie'),
 ('loisirs', 'Loisirs et sorties', [2, 6], r'cinéma|musique|film|sortir|promenade'),
 ('sport', 'Sport et activités', [2, 6], r'sport|gymnase|nager|courir|vélo'),
 ('ecole', 'École et vie des enfants', [2, 5], r'école|devoir|professeur|élève'),
 ('travail', 'Premiers contacts au travail', [3, 6], r'collègue|travaille|réunion|bureau'),
 ('messages', 'Appels et messages', [3, 9], r'message|téléphon|appeler|envoyer'),
 ('hotel', 'Hébergement et réservation', [2, 8], r'hôtel|réserv|hébergement|réception'),
 ('rendezvous', 'Rendez-vous et retards', [2, 9], r'rendez-vous|retard|heure|disponible'),
 ('retours', 'Retourner ou échanger un achat', [7, 9], r'rembours|échang|retourner|défectueux'),
 ('voisins', 'Voisins et logement', [4, 8], r'voisin|propriétaire|loyer|appartement|bruit'),
 ('perdu', 'Objets perdus et dépannage', [3, 9], r'perdu|retrouv|oublié|volé'),
 ('demarches', 'Démarches et documents', [3, 9], r'document|formulaire|passeport|inscri|démarche'),
 ('numerique', 'Connexion et services numériques', [3, 9], r'connexion|internet|mot de passe|compte|en ligne'),
 ('budget', 'Budget et factures', [5, 8], r'facture|budget|dépens|économis|banque'),
 ('invitations', 'Inviter, accepter et refuser', [3, 8], r'invit|envie|disponible|libre|désolé'),
 ('voyage', 'Raconter un voyage', [5, 10], r'voyage|vacances|visité|arrivé'),
 ('discussion', 'Avis, raisons et désaccords', [7, 10], r'je pense|à mon avis|d.accord|raison|pourtant'),
]


def prepare():
    decks = extract_decks(ROOT)
    entries, themes = {}, []
    for identifier, title, levels, expression in THEMES:
        languages = []
        for study in ('fr', 'en', 'es', 'zh', 'it', 'ja', 'ko'):
            native = 'zh' if study == 'fr' else 'fr'
            phon_field = native_field(native, study)
            matches = []
            for index, phrase in enumerate(decks[study]):
                french = phrase['t'] if study == 'fr' else phrase.get('frm', '')
                if not (phrase.get(phon_field) and meaning_of(phrase, native)):
                    continue
                if re.search(r'\{s\}|\.\.\.|…|……|〜', phrase['t']):
                    continue
                if re.search(expression, french, re.I):
                    matches.append((phrase['lv'], index, phrase))
            # A lexical match is only a candidate. Length is not a difficulty score.
            matches.sort(key=lambda item: (not levels[0] <= item[0] <= levels[1], item[0], item[1]))
            selected, seen = [], set()
            for level, index, phrase in matches:
                if phrase['t'] in seen:
                    continue
                seen.add(phrase['t'])
                identity = f'DECKS.{study}[{index}]'
                entries[identity] = {
                    'id': identity, 'nativeLanguage': native, 'studyLanguage': study,
                    'source': {'type': 'deck', 'language': study, 'index': index,
                               'expectedStudy': phrase['t']},
                    'displayPhonField': phon_field,
                    'copy': {'study': phrase['t'], 'native': meaning_of(phrase, native),
                             'aids': aids_of(phrase)},
                    'sourceLegacyLevel': level, 'reviewRequired': True}
                selected.append({'sourceBankId': identity, 'accessFloor': level,
                                 'withinSuggestedLevelRange': levels[0] <= level <= levels[1]})
                if len(selected) == 3:
                    break
            languages.append({'nativeLanguage': native, 'studyLanguage': study,
                              'candidates': selected,
                              'status': 'lexical-candidates-for-human-review' if selected else 'content-gap-to-write-and-review'})
        themes.append({'id': identifier, 'title': title, 'suggestedPracticeRange': levels,
                       'notANewAccessRule': True, 'languages': languages})
    def text(value):
        return json.dumps(value, ensure_ascii=False, indent=2) + '\n'
    return {
        OUT / 'themes-enrichissement.json': text({'status': 'proposal-not-published',
            'selectionMethod': 'French topic-word matches, not linguistic validation or competitor copying',
            'themes': themes}),
        OUT / 'banque-themes.json': text({'version': 1, 'status': 'source-exact-candidates-not-curated-lessons',
                                         'entries': list(entries.values())}),
    }, {'themes': len(themes), 'themeLanguageCases': len(themes)*7, 'uniquePhraseCandidates': len(entries)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    outputs, summary = prepare()
    for path, expected in outputs.items():
        if args.check:
            if not path.exists() or path.read_text() != expected:
                raise SystemExit('Review candidates differ: ' + str(path.relative_to(ROOT)))
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(expected)
    print(json.dumps({'mode': 'check' if args.check else 'write', **summary}))


if __name__ == '__main__':
    main()

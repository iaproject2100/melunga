# Melunga — Intégration de l'indonésien : brief pour Codex

## Livrables
- `id_deck.json` : le deck indonésien complet, **4 487 cartes**, niveaux L1 à L10.
- `id_phon.py` : le générateur phonétique. Il importe `ru_phon.py` (fonction hanzi), qui importe lui-même `de_phon.py`. Les trois fichiers sont joints et doivent rester ensemble.
- `id_tr_map.json` : la translittération d'entrée de chaque carte (`t` → translittération). Elle sert à reproduire et à vérifier la génération phonétique.

Le deck est livré dans un fichier séparé. Intègre-le dans **la dernière version de `app.html` du dépôt `iaproject2100/melunga`**, sans toucher à l'architecture ni aux thèmes.

## Variante
Choix validé par Kartech : **indonésien standard usuel** (bahasa Indonesia, environ 200 millions de locuteurs). Drapeau : 🇮🇩.
- Registre : « Anda » par défaut pour la politesse, « kamu » pour le tutoiement, « saya » pour « je » ; « aku » seulement dans l'intime. Quelques particules courantes (ya, kok, sih, dong), avec modération.
- Contenu localisé en Indonésie :
  - lieux : Jakarta, Bali, Yogyakarta, Bandung, Surabaya, Danau Toba, Bromo, Borobudur, Monas ;
  - monnaie et services : rupiah, MRT/KRL, BPJS ;
  - cuisine : nasi goreng, rendang, sate, martabak, jamu ;
  - fêtes et coutumes : Lebaran, mudik, Nyepi, Imlek, 17 Agustus, batik, gamelan ;
  - écrivains : Chairil Anwar, Pramoedya Ananta Toer.
- Les cartes `bonus` sont de vrais peribahasa (proverbes indonésiens), et non des traductions de proverbes russes.

## Format des cartes
Les 15 champs habituels : `t, py, pf, ps, pi, phon, cn, en, frm, esm, itm, jam, kom, lv, cat`.
- `t` : la phrase en indonésien, en alphabet latin.
- `py` : la prononciation pour anglophones, avec la syllabe accentuée en MAJUSCULES.
- `pf` : la prononciation pour francophones, avec la syllabe accentuée en MAJUSCULES.
- `ps` : pour hispanophones, avec un accent aigu sur la voyelle accentuée.
- `pi` : pour italophones, avec un accent grave sur la voyelle accentuée.
- `phon` : une approximation en caractères chinois.

### Conventions phonétiques déjà appliquées
- **Accent tonique** : léger, sur l'avant-dernière syllabe. Il passe sur la dernière quand l'avant-dernière est une syllabe ouverte avec un e muet : t**e**-MAN, b**e**-NAR. Il est appliqué de façon uniforme sur tout le deck.
- **Les trois « e » de l'indonésien** :
  - le e fermé (sate, enak) s'écrit é en français ;
  - le e ouvert (besok, toilet) s'écrit è ;
  - le e muet (besar, terima) s'écrit « e » en français, « uh » en anglais.
- **Consonnes** : c → « tch », j → « dj », ny → « gn » en français et « ñ » en espagnol.
- **Coup de glotte du k final** (tidak, enak, anak) : il est noté par une apostrophe, par exemple ti-DA'.
- **Diphtongues** : ai → « aï », au → « aou ».

### Genre
- L'indonésien ne marque pas le genre de la personne qui parle. Les paires « (homme)/(femme) » du gabarit sont donc devenues une seule carte neutre. Les cartes libérées ont été remplacées par des phrases indonésiennes fréquentes.
- Quelques paires restent quand l'indonésien distingue vraiment :
  - selon la personne à qui l'on parle : « Terima kasih, Pak » / « Terima kasih, Bu », marquées « (to a man) / (to a woman) » ;
  - selon la personne désignée : « Saya mahasiswa / mahasiswi », c'est-à-dire étudiant / étudiante.
- Aucune carte ne porte le marqueur (male)/(female).

### Catégories
| Catégorie | Cartes |
|---|---|
| core | 3 028 |
| vocab | 1 268 |
| template | 77 |
| bonus | 61 |
| basics | 53 |

### Répartition par niveau (même gabarit que les autres langues)
| Niveau | Cartes |
|---|---|
| L1 | 283 |
| L2 | 545 |
| L3 | 633 |
| L4 | 594 |
| L5 | 683 |
| L6 | 439 |
| L7 | 430 |
| L8 | 402 |
| L9 | 227 |
| L10 | 251 |

### Contrôles déjà passés
- Les 15 champs sont non vides sur toutes les cartes.
- Aucun doublon de `t`. Les quasi-doublons (même phrase à la ponctuation près) ont été remplacés, sauf entre une phrase et un mot de vocabulaire ou un modèle.
- Aucune phrase suspendue en `core` : les « … » sont réservés aux `template`. Les amorces héritées du gabarit (« Ngomong-ngomong, … », « Pertama, … ») sont devenues des phrases complètes.
- Aucun caractère de convention (`*`, `@`) dans les champs de prononciation.
- Aucune référence russe résiduelle dans les traductions (lieux, monnaie, plats, prénoms, auteurs).
- Toutes les phonétiques ont été régénérées par le générateur à partir de `id_tr_map.json`. Aucune n'a été écrite à la main.

## Intégration dans app.html (dernière version)
1. **Données** : ajouter `id` au tableau des langues avec les cartes de `id_deck.json`, sur le même modèle que `pt`, `hi`, `ru` et `de`.
2. **Interface** :
   - bouton `lID`, libellé « Bahasa Indonesia » ;
   - `lID:"id"` dans `LANGUAGE_FLAGS` ;
   - mise à jour des compteurs.
3. **Drapeau** : 🇮🇩. Ajouter le SVG du drapeau indonésien (rouge en haut, blanc en bas) pour `.menu-b-flag.flag-id`, sur le même modèle que `flag-ru`.
4. **Synthèse vocale** :
   - `TTSLANG.id = 'id-ID'` ;
   - dans `tts.mjs`, ajouter une voix `id-ID-Wavenet-*` masculine et une féminine (à vérifier dans la liste Google). Comme l'indonésien n'a pas de cartes (male)/(female), une voix par défaut suffit ; garder l'alternance si l'app l'utilise ;
   - voix du navigateur `id-ID` en solution de repli.
5. **Reconnaissance vocale** : `rec.lang = 'id-ID'`.
6. **Comparaison de réponses** (`_norm`) :
   - minuscules ;
   - ignorer la ponctuation, « … » et les guillemets ;
   - traiter le trait d'union des mots redoublés comme un espace (« laki-laki » = « laki laki ») ;
   - accepter la forme abrégée du redoublement (« laki2 »), courante à l'écrit.

## Sécurité (inchangée)
- La clé est lue uniquement via `process.env.GOOGLE_TTS_API_KEY`.
- Ne jamais copier la clé ni un token Netlify dans un fichier, une PR ou un message.

## Classement thématique (à faire par Codex)
Range les cartes indonésiennes selon la règle décidée par Kartech pour toutes les langues : **par domaine, de L1 à L10**. Une rubrique regroupe les phrases qui parlent du même sujet concret, quel que soit le titre du niveau ; les titres de compétence de L7 à L10 restent des sous-titres.
- Ne reprends pas automatiquement le rangement d'une autre banque quand les traductions anglaise ou française correspondent. C'est ce qui a propagé les erreurs relevées par l'audit (en hindi, 1 688 cartes sur 4 487 sont dans `conversation`).
- La rubrique `conversation` ne reçoit que les relances, les réactions, les opinions générales et les proverbes sans domaine concret.
- Place les 77 modèles en réserve, comme dans les autres langues.
- En cas de doute, prends la banque allemande comme référence : c'est la mieux classée par domaine.

## Revue de contenu demandée
Kartech ne prévoit pas de relecture par un locuteur natif : la vérification revient à Claude et Codex. Relis par sondage, environ 50 cartes par niveau, en vérifiant :
- le naturel des phrases et le registre (Anda/kamu) ;
- les e fermés, ouverts et muets, et l'accent des phonétiques ;
- les traductions japonaise et coréenne.

Signale les écarts sous la forme **n° de carte + champ + correction**, comme pour l'allemand, le russe, le hindi et le portugais.

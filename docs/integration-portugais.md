# Portugais du Brésil — intégration du 30 octobre 2026

Base : `main` au commit `ccd5ecd`, incluant le russe, le hindi et la signature chinoise dorée sous Melunga. Les cartes, la table de translittérations et le générateur portugais sont ceux fournis par Kartech.

## Résultat

- Deck `pt` : **4 487 cartes**, L1–L10, 15 champs, aucune valeur vide, aucun doublon exact de `t`.
- Les 4 410 cartes complètes rejoignent **180 rubriques illustrées** déjà définies dans Melunga. Les 77 modèles à compléter restent en réserve, comme dans les autres imports ; aucune carte n’est supprimée.
- Champs, niveaux, catégories et identités sources conservés. Classement séparé des cartes, avec ordre source conservé dans chaque thème. Les significations exactes déjà présentes réutilisent leurs placements ; les termes brésiliens et les règles restantes ont fait l’objet d’un contrôle complémentaire.
- Bouton `lPT` « Português », drapeau 🇧🇷 en SVG local, choix dans l’accueil et les parcours, exemple d’accueil issu de la carte source n° 83.
- Voix féminine `pt-BR-Wavenet-A` et masculine `pt-BR-Wavenet-B`, reconnaissance navigateur et native `pt-BR`. Le repli vocal navigateur exige `pt-BR` et refuse `pt-PT` ainsi que la langue `pt` sans région.
- Les marqueurs explicites `(male)` / `(female)` choisissent le genre de voix. Une annotation d’interlocuteur `(to a male)` ne change pas le sexe du locuteur. Sans marqueur, le choix personnel enregistré est conservé.
- La comparaison existante accepte déjà les accents portugais, la cédille, les majuscules et la ponctuation ; les exemples réels portugais et les contrastes russe/hindi sont testés.
- L’accueil compte désormais 11 langues étudiées. Le site conserve ses huit langues d’interface. Le portugais est proposé depuis les sept langues dont les traductions sont fournies ; pas de parcours allemand→portugais sans traductions allemandes.

## Contre-vérification demandée

`python3 tools/phonetics/check_pt_deck.py --report docs/relecture-portugais/regeneration.json`

Le vérificateur appelle exclusivement `GR(t, tr_map[t], ...)` pour les 4 487 cartes. **22 435 champs phonétiques comparés : zéro différence.** Les fichiers fournis restent inchangés ; les empreintes SHA-256 et les versions des trois générateurs sont dans le rapport.

La table contient 4 551 entrées : toutes les cartes sont couvertes et 64 entrées ne sont plus utilisées. Elles restent dans la table originale, mais n’ajoutent aucune carte au deck.

La reproduction exacte ne certifie pas la justesse linguistique de chaque translittération : aucun audio natif réel n’a été comparé.

## Relecture du contenu

[Rapport par numéro, champ et correction](relecture-portugais/rapport.md) : **500 cartes, 50 par niveau**, 32 constats (21 corrections recommandées, 11 à arbitrer), dont deux vérifications factuelles complémentaires hors échantillon. Les corrections proposées restent dans le rapport ; aucune carte ni phonétique fournie n’a été réécrite. Les nombres de cartes par niveau et catégorie correspondent exactement au brief.

## Conservation et tests

- Les dix banques précédentes, les droits historiques, les 78 documents relus et les 70 parcours existants restent inchangés. Les fonctions de progression, de compte et de paiement sont protégées par les vérifications de sources.
- Le nouvel export comporte **77 directions** et **50 096 cartes source** dans 11 banques. Les styles, photos, barres de commandes, disposition ordinateur/mobile, signature chinoise et animation de chargement sont conservés.
- Les tests vérifient chaque champ importé sur les 210 combinaisons import/langue de départ/niveau, et comparent les modèles complets des 70 parcours précédents à `ccd5ecd`.
- Tests audio/TTS, genre, choix personnel, refus de `pt-PT`, syntaxe JavaScript, normalisation, navigation réelle ordinateur/mobile, photos et drapeaux, « À revoir », progression, étapes longues, retour du compte et exemple d’accueil.
- Les essais utilisent des réponses locales et des médias simulés. Aucun compte réel, paiement ni fournisseur vocal réel n’a été appelé.

La clé TTS est lue uniquement via `process.env.GOOGLE_TTS_API_KEY`. Aucune clé ni aucun jeton n’est ajouté. Le catalogue Chirp existant n’est pas étendu avec de fausses voix observées : le portugais utilise deux voix WaveNet configurées.

Le déploiement Netlify et la synthèse Google réelle restent à vérifier avec les accès et la configuration de production. L’accès à ces API n’est pas disponible dans cet environnement. Le deck arabe et ses corrections ne font pas partie de cette livraison.

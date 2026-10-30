# Arabe corrigé — contre-vérification et intégration

Base : `main` au commit `77fe0f5`, avec portugais, russe, hindi et signature chinoise. Contrôles du 30 octobre 2026.

## Résultat de la reproduction

**4 487 cartes, 15 champs non vides par carte, aucun doublon exact de `t`.** L’ordre source, les textes arabes, les niveaux, les catégories et les cinq champs phonétiques reçus sont conservés dans l’intégration.

Le script `tools/phonetics/check_ar_deck.py` appelle exclusivement `GA(t, ar_tr_map[t], cn, en, frm, esm, itm, jam, kom, cat, lv)` pour chaque carte. Il compare `py`, `pf`, `ps`, `pi` et `phon` : **22 435 valeurs, zéro différence**, aussi bien pour le fichier reçu que pour la copie préparée pour le site. Aucune valeur phonétique n’a été saisie à la main et le générateur n’a pas été modifié.

- Fichier reçu, conservé octet pour octet : `tools/maquette-guidee/imports/ar-deck-v3.2-received.json` ; SHA-256 `d70df1ac7c05797c8040768cdf0fe4dd78a784d0d517810e22332623f39e8138`.
- Générateur v3.2 reçu : `tools/phonetics/ar_phon.py` ; SHA-256 `36d898bf883c06ab1f9b1e2adb07f5d6c4fe945561b9745affa9450712082b90`. Il importe la référence `de_phon.py` v3.1 conservée à côté.
- Copie intégrée : `tools/maquette-guidee/imports/ar-deck-v3.2.json` ; SHA-256 `fd566528f263b2a4a43d87292ba8f7150bf2652b7f23dcdfedbd9ce7195909d1`.
- Table reçue : 4 528 clés, toutes les cartes couvertes ; 41 anciennes clés inutilisées, conservées sans créer de cartes supplémentaires.

La reproduction exacte ne constitue pas une certification de prononciation native. Les approximations documentées du générateur pour ع, hamza et les emphatiques restent celles choisies par le rédacteur.

## Réponses aux 568 constats

Les **568 identifiants, numéros et niveaux** du document de réponse correspondent à la revue initiale : 301 régénérations, 261 corrections de texte ou de traduction, 6 rapprochements conservés pour réexposition pédagogique. Pour chaque constat hors doublons, au moins un champ signalé a effectivement changé entre l’ancien deck relu et la version intégrée. Ce contrôle de correspondance n’est pas une nouvelle revue exhaustive des 4 487 phrases.

Les 41 textes arabes annoncés ont changé par rapport à l’ancienne version et 1 915 cartes ont au moins un champ phonétique modifié. Aucun `lv` ni `cat` n’a changé. Les arbitrages de sens AR0474/AR0475 (ponctualité), AR0542 (lecture au passé) et AR0561 (alias TVA distinct de la carte L4 existante) sont conservés.

[Réponse du rédacteur](REPONSE_REVUE_ARABE.md), [audit par constat](reponse-audit.json), [reproduction GA](regeneration.json).

## Huit cellules éditoriales nettoyées avant intégration

Le fichier corrigé contenait encore du balisage ou des notes de revue dans cinq cellules et une traduction tronquée dans trois autres. Seules les cellules suivantes sont ajustées dans la copie préparée ; le fichier reçu original reste disponible séparément. Les corrections rétablissent les propositions acceptées dans la revue, sans modifier le texte arabe ni la phonétique.

| Carte | Constat | Champ | Texte intégré |
|---|---|---|---|
| 1728 | AR0139 | `en` | Make a list before going to the market. |
| 1882 | AR0147 | `en` | the defective item |
| 4007 | AR0500 | `frm` | La pizza, c’est moi qui l’offre ; le résultat, c’est notre responsabilité à tous. |
| 4007 | AR0500 | `esm` | La pizza la pago yo; el resultado es responsabilidad de todos. |
| 4007 | AR0500 | `itm` | La pizza la offro io; il risultato dipende da tutti noi. |
| 4062 | AR0509 | `esm` | Hagamos una reunión de seguimiento a finales de la semana. |
| 4279 | AR0537 | `en` | And thanks to you, the beautiful chapters of our story were completed. |
| 3995 | AR0498 | `frm` | — La facture en riyals ou en dollars ? — En riyals pour les transactions locales. |

Le détail avant/après est dans `tools/maquette-guidee/imports/ar-editorial-cleanup-v3.2.json`. Le vérificateur refuse tout écart supplémentaire entre le reçu et la copie intégrée.

## Affichage et fonctions

- **4 410 cartes complètes dans 185 rubriques illustrées existantes** ; 77 modèles à compléter restent en réserve, comme dans les autres imports. Aucune carte n’est supprimée. Le placement est séparé du contenu : les significations déjà présentes réutilisent leur domaine, les cartes propres à l’arabe sont classées dans les domaines existants, avec leur ordre source au sein de chaque rubrique.
- Bouton `lAR` et badge vert neutre « ع », dans les sélecteurs classiques, le menu B, l’accueil et les parcours. Aucun drapeau saoudien n’est ajouté.
- Écriture arabe avec `dir="auto"` sur la phrase uniquement ; disposition de la navigation et des commandes inchangée. Les traductions et les aides latines gardent leur sens d’écriture.
- Synthèse : `ar-XA-Wavenet-A` féminine et `ar-XA-Wavenet-B` masculine ; code Google TTS `ar-XA`. Reconnaissance : `ar-SA`, sur navigateur et adaptateur natif. Les marqueurs de locuteur `(male)` / `(female)` sont distingués des annotations d’interlocuteur.
- Comparaison des réponses : alphabet arabe conservé ; voyelles brèves facultatives, tatweel et ponctuation ignorés. Les lettres différentes, dont hamza, restent distinctes. Tests de non-régression sur russe, hindi et accents portugais.
- Exemple arabe dans l’accueil ordinateur : carte source n° 6, texte, phonétique et traduction fournis, sans génération manuelle.
- Les 11 banques précédentes sont identiques. Les modèles complets des 77 parcours précédents, les fonctions de progression, les comptes, paiements, droits, photos, architecture mobile/ordinateur, signature chinoise et animation de chargement sont conservés.

L’arabe est une langue **étudiée**, accessible depuis les sept langues dont les traductions sont fournies. Il n’ajoute pas une interface entièrement arabe ni un parcours allemand→arabe : le pack ne fournit pas de traduction allemande. Le site garde huit langues d’interface et propose douze langues étudiées au total, soit 84 directions réellement couvertes.

## Cartes source par langue

| Langue | Cartes |
|---|---:|
| Français | 4 500 |
| Anglais | 4 502 |
| Espagnol | 4 672 |
| Italien | 4 509 |
| Chinois | 4 903 |
| Japonais | 4 509 |
| Coréen | 4 520 |
| Allemand | 4 519 |
| Hindi | 4 487 |
| Russe | 4 488 |
| Portugais du Brésil | 4 487 |
| Arabe | 4 487 |

L’export totalise 54 583 cartes source, 52 994 cartes actives et 1 589 cartes en réserve. L’arabe par niveau : L1 283 ; L2 545 ; L3 633 ; L4 594 ; L5 683 ; L6 439 ; L7 430 ; L8 402 ; L9 227 ; L10 251.

## Validation

- `audio` : 49/49 tests réussis, zéro échec.
- `import` : 5/5 tests réussis, zéro échec.
- `native` : 17/17 tests réussis, zéro échec.
- `source` : 29/29 tests réussis, zéro échec.
- `home` : 3/3 tests réussis, zéro échec.
- `browser` : 5/5 tests réussis, zéro échec.
- Syntaxe : 38 blocs ou fichiers JavaScript vérifiés et un bloc JSON ; export déterministe `--check` conforme.
- Les 280 combinaisons des quatre imports, des sept langues de départ et des dix niveaux conservent les champs exacts. Les 77 parcours précédents sont comparés à la base réelle `77fe0f5`.
- Navigation réelle dans Chromium en 390 et 1 366 pixels : choix de l’arabe, thèmes/photos, leçons, badges, sens d’écriture, voix, écoute, « À revoir », progression après rechargement, étapes longues de 30–40 cartes et retour du compte sans soumission.
- Accueil ordinateur : les onze exemples sont visibles et fonctionnent dans les huit langues d’interface ; les champs et les routes audio sont contrôlés.

Les réponses réseau et les médias de ces essais sont simulés localement. Aucun compte réel, paiement ni appel au fournisseur vocal réel n’a eu lieu. `tts.mjs` conserve la lecture exclusive de `process.env.GOOGLE_TTS_API_KEY` ; aucun jeton ni clé n’est ajouté au dépôt.

**Le déploiement Netlify et un retour audio Google réel ne sont pas vérifiés depuis cet environnement.** Aucune variable de production n’a été modifiée. L’intégration dans Git ne prouve pas à elle seule que Netlify a publié le nouveau site.

[Aperçu ordinateur](previews/ar-lesson-1366.png) · [Aperçu mobile](previews/ar-lesson-390.png) · [Validation détaillée](integration-validation.json).

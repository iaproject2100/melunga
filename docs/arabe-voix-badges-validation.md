# Voix arabes, badges et revue de contenu

Les requêtes des deux voix arabes WaveNet recevaient `invalid_voice`. Cette PR autorise `ar-XA-Wavenet-A` (FEMALE) et `ar-XA-Wavenet-B` (MALE), exclusivement avec la locale `ar-XA`, et prépare le badge arabe neutre demandé : lettre blanche `ع` sur fond vert `#0b6e4f`.

Le serveur reçoit seulement deux lignes supplémentaires dans sa liste existante. Les seize voix WaveNet précédentes, les huit langues Chirp, les catalogues versionnés, le cache, CORS, la temporisation du catalogue et les erreurs sans données sensibles conservent leur implémentation actuelle. La clé reste fournie par `process.env.GOOGLE_TTS_API_KEY` ; aucune valeur réelle n’est incluse dans le code ou les tests.

Les drapeaux anglais visibles deviennent américains dans l’interface classique, l’accueil, les leçons modernes et la comparaison de voix. Les SVG représentent les treize bandes et cinquante étoiles. Les métadonnées historiques validées restent inchangées : le contrôleur adapte uniquement leur affichage. À la demande finale de Kartech, les nouvelles pages utilisent désormais les voix américaines `en-US`. Les anciens clients `en-GB` restent compatibles. Les cartes anglaises conservent tous leurs champs.

Le badge arabe fonctionne dans les styles classique et menu B ; le drapeau allemand du menu B reçoit ses bandes noir/rouge/or. Les cartes et l’architecture de navigation restent inchangées. L’app classique actuelle n’a pas de boutons `lAR` ou `lDE`, ni de reconstructions arabes dans `applyNat` : les styles et identifiants sont préparés sans ajouter de cours. Les essais visuels arabes utilisent explicitement des éléments DOM de test, pas un deck arabe intégré.

Inventaire conservé : français 4 500, anglais 4 502, espagnol 4 672, chinois 4 903, italien 4 509, japonais 4 509, coréen 4 520, soit 32 115 cartes classiques. Le catalogue moderne ajoute 4 519 cartes allemandes : huit banques, 36 634 cartes.

Le fichier TTS joint était une ancienne version WaveNet seule, avec journalisation des erreurs du fournisseur. Seules ses deux entrées arabes ont été reprises dans le serveur actuel. L’app jointe a été consultée sans modification : ses voix Salma/Omar et sa locale `ar-XA` concordent, mais ses neuf banques contiennent 37 760 cartes. Aucun ancien fichier d’app ni deck arabe n’a été copié. Le deck arabe complet reçu contient 4 487 cartes ; il reste une source de revue et n’est pas importé par cette PR.

Validation : 30 tests source/TTS réussis, dont les 25 contrats Arabic/Chirp, et 3 cas navigateur hors ligne réussis. Les neuf scripts intégrés (sept dans l’app, deux dans l’accueil) et les scripts externes concernés compilent. Les tests vérifient les littéraux complets, toutes les banques, les identifiants et les locales. Cinq captures montrent les badges classiques, menu B et le drapeau moderne ; les contrôles arabes/allemands absents du produit sont clairement identifiés comme fixtures DOM. La fonction de sélection, le décorateur menu B et les CSS testés sont ceux du produit. Aucune requête fournisseur, opération de compte réelle ou écoute audio n’a eu lieu. La branche est rebasée sur `91fed519`, comprenant le natif allemand et les sept exemples de l’accueil et le scellement fini recomposé passe ses 17 tests ; les anciens fixtures et les sept nouveaux assets allemands gardent leurs pins exacts. Les 12 tests native-courses, les 16 tests apps, les cinq tests German-native et les six cas navigateur allemands passent également. `node --check` a été exécuté sur chacun des neuf blocs de script intégrés.

L’environnement de travail ne dispose pas de secret TTS configuré. La configuration Netlify et l’écoute réelle restent les vérifications de déploiement à effectuer après fourniture des accès et fusion autorisée.


Composition finale sur `91fed519` : les trois tests des sept exemples d’accueil passent également, avec tous les champs sources et voies audio antérieures préservés. Les rapports de preuve locaux sont archivés dans le dossier de travail ; aucune publication de branche ou fusion n’a été effectuée.

Revue du contenu arabe : les 4 487 cartes L1–L10 et leurs 13 champs textuels ont été parcourus, puis tous les constats textuels et phonétiques ont reçu une contrelecture ciblée. Le rapport retient 568 constats sur 542 cartes : 41 sur l’arabe, 220 sur les traductions, 301 sur les aides phonétiques et 6 rapprochements entre niveaux ; 85 demandent un arbitrage de contexte. La contrelecture a retiré 37 faux positifs ou variantes recevables et nuancé 96 constats. Rapports par lots L1–L3/L4–L6/L7–L10, synthèse, JSON de constats et ZIP sont dans `docs/revue-deck-arabe/`.

Le fichier arabe reçu et `ar_phon.py` sont restés identiques. Aucune phonétique de remplacement n’est livrée, aucun `lv`/`cat` ni ordre de carte n’est modifié. Les 12 démonstrations du générateur ont été exécutées, avec les cinq valeurs étalons de السلام عليكم conformes. L’absence des entrées `tr` dans le deck empêche une reproduction complète de toutes les cartes par `GA()` ; les rapports ne prétendent pas la certifier. Les expressions dialectales, proverbes et formules religieuses voulus sont acceptés ; les répétitions restent soumises à un arbitrage pédagogique.

| Banque moderne existante | Cartes |
|---|---:|
| Français | 4 500 |
| Anglais | 4 502 |
| Espagnol | 4 672 |
| Chinois | 4 903 |
| Italien | 4 509 |
| Japonais | 4 509 |
| Coréen | 4 520 |
| Allemand | 4 519 |
| Total déployé avant cette PR | 36 634 |

Le deck arabe reçu (4 487 cartes) est uniquement relu dans cette PR ; il n’entre pas dans ce total et n’est pas publié par ce changement.


## Publication autorisée : anglais américain

Kartech a demandé `en-US` puis autorisé la publication. Le catalogue courant est versionné `kartech-2026-10-30-en-us` : voix Chirp Kore américaine par défaut, comparaison limitée aux candidates américaines observées chez Google, WaveNet C/D en repli. Les deux anciens contrats de catalogue (sept et huit langues) gardent leurs voix britanniques observées pour les pages mises en cache. Le navigateur du parcours anglais accepte uniquement une voix système `en-US`. L’exemple d’accueil et sa démonstration utilisent `en-US` ; les versions des scripts sont incrémentées. Les thèmes, cartes, présentation, droits et progression sont conservés.

Contrôles supplémentaires : 70 tests audio/voix/badges et 16 contrôles d’intégration des applications réussis, six cas navigateur d’accueil réussis, 17 contrôles de conservation des sources réussis. Les tests utilisent des réponses simulées ; aucune disponibilité réelle de Google ou écoute en production n’est affirmée. La PR automatique reste bloquée par l’API GitHub ; la publication Git est autorisée explicitement par Kartech. La configuration des secrets Netlify et le test audio réel restent à effectuer avec les accès sécurisés.

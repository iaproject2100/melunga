# Revue croisée Claude — lots B/C/E (après `62e6c11`)

Vérifications sur la page réelle (Chromium 390×844, serveur local, fichiers JSON du dépôt, `speak()` intercepté) en plus des tests de Codex (`conversation-ui.test.cjs`) et du chargeur, tous passés. Aucune fusion ni déploiement.

## B — modèles, variantes, rappel
- Phrase complète affichée telle quelle, morceau remplaçable souligné par recherche de `slot.study` dans `study` (jamais de recomposition) ; lecture (kana/pinyin/romanisation) et phonétique présentes.
- `speak()` reçoit `study` (vérifié : la phrase prononcée est exactement le texte affiché, pas la phonétique).
- Rappel : aucune `.cxText` dans le DOM, consigne en langue maternelle seulement ; aucune écriture japonaise hors du sélecteur de phrases ; révélation à la demande.

## C — dialogues
- Réplique visible avec lecture et écoute de `turn.study` ; réplique du rôle masqué : ni phrase, ni lecture, ni bouton d'écoute dans le DOM (seule la traduction sert d'amorce) ; révélation puis navigation ; Escape ferme, focus rendu.
- Remarque mineure (non bloquante) : à l'étape dialogue, l'encart F replié occupe trois lignes au-dessus des sélecteurs ; une version plus courte du résumé (`reviewNotice`) pourrait être prévue pour cet écran si l'on veut gagner de la place sur téléphone.

## E — reprise
- Clé `melunga_conversation_resume_v1:<nat>:<étude>` contenant uniquement `{version, level, unitId}` ; rien d'autre n'est écrit (ni score, ni droit).
- Reprise sur le modèle mémorisé (étape 2) après rechargement ; `unitId` inconnu → liste des modèles sans erreur ; `level` hors 1–10 ou non autorisé (`canUseLevel`) → niveau 1 ; stockage bloqué (`setItem` qui lève) → parcours intact.
- Droits : la reprise passe par `canUseLevel()` avant tout chargement ; un `level` modifié à la main dans le stockage ne débloque rien (couvert aussi par le test de Codex « public free/Premium access unchanged »).

## Conclusion
B/C/E conformes au plan et au contrat du lot A. Prêt pour la PR unique (description de Codex reprise dans la PR #7), sous réserve des essais APK listés dans `revue-ADF.md`, qui restent à planifier après un déploiement de test des données et du CORS.

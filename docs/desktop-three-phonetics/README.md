# Version 3 ordinateur et repère phonétique

L’utilisateur a choisi la troisième présentation : une zone centrée de 920 px, quatre thèmes par page, davantage de marge en bas et des liens juridiques discrets. Il demande aussi que la phonétique soit mieux distinguée et accompagnée d’une oreille sur ordinateur.

La pagination utilise les véritables boutons du catalogue, dans leur ordre initial. La page du thème est conservée au retour d’une leçon ; un changement de niveau ou de langue repart à la première page. Les commandes sont traduites dans les sept langues de l’interface. Les deux rangées restent séparées de 18 px sur les grands écrans.

La bande phonétique porte un fond translucide légèrement violet : les couleurs de l’ambiance restent visibles. Le texte et la légende traduite sont prune sur les ambiances claires, et clairs sur les ambiances sombres. Le bouton d’oreille déjà présent reste visible dans un cercle translucide. Il garde son écouteur et le même lecteur serveur que le haut-parleur. Le Pinyin garde son libellé propre. Les états masqués du rappel et de l’attente restent masqués. Aucune transcription n’est modifiée.

Tous les ajouts s’appliquent à partir de 1101 px. En repassant sur mobile, le DOM retrouve ses emplacements et ses attributs `hidden` d’origine ; la légende, la pagination et le pied de page ordinateur sont retirés. Le contenu, les droits, les prix, les voix et le catalogue classique sont inchangés.

## Aperçu du vrai parcours

- [Leçon : phonétique contrastée et oreille](captures/preview-lesson-fr-es-L1-1366.png)
- [Thèmes : quatre cartes par page](captures/preview-themes-fr-es-L1-1366.png)
- [Leçon sur grand écran](captures/preview-lesson-fr-es-L1-1920.png)
- [Thèmes sur grand écran](captures/preview-themes-fr-es-L1-1920.png)

Ces captures viennent du produit local avec ses données et images réelles ; les réponses de compte et les événements audio sont des fixtures. Elles ne prouvent pas une publication sur melunga.com.

## Validation

[Sept groupes navigateur et 41 cas](BROWSER_QA.md) passent, avec les sources stables : pagination complète, traductions, contraste sur les 17 ambiances, oreille et haut-parleur, Pinyin, carte longue, rappel masqué, redimensionnement et trois comparaisons mobiles avec le commit publié `f18316ab`.

Le contraste est mesuré sur les pixels réellement composés derrière les textes, et tient donc compte de la transparence : au minimum 6,40:1 pour la transcription et 5,30:1 pour la légende. L’oreille atteint au minimum 4,52:1 au repos et 3,80:1 au survol ou en lecture, au-dessus du seuil de 3:1 retenu pour l’icône.

Les [contrôles des sources](source-verification.json) comprennent 12 tests de couches, 15 tests d’intégration et la validation des ressources d’entrée. Les quatre fichiers produit modifiés et leurs empreintes sont consignés. Le navigateur est Chromium ; aucun appareil physique, Safari, compte réel, paiement ou TTS distant n’est utilisé.

La publication reste distincte de cette validation locale. Dans l’environnement utilisé, les accès à l’API GitHub et à melunga.com ne sont pas actifs ; les réglages réseau préparés doivent être appliqués avant la création de la PR et le contrôle public.

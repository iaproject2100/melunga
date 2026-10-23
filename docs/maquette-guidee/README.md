# Maquette thématique L1 allégée — aperçu uniquement

Cette maquette répond aux deux retours de Kartech : conserver la présentation par thèmes et retirer les consignes répétées qui encombraient la leçon ; conserver aussi la richesse du L1 actuel, au lieu de réduire un thème à deux ou trois phrases.

## Périmètre

- Route autonome : `melunga_deploy/maquette-guidee.html`.
- Sept couples : fr→en, fr→es, fr→it, fr→zh, fr→ja, fr→ko et zh→fr.
- Les **2 134 cartes dont le niveau source vaut exactement 1** sont conservées, avec leur indice source. Deux cartes portant le même texte ne sont pas fusionnées.
- Les thèmes sont numérotés dans l'ordre conseillé de cette proposition éditoriale. Le thème professionnel est indiqué comme facultatif.
- Sur ordinateur comme sur mobile, un clic sur le thème démarre directement sa leçon complète. Les groupes de pratique s'enchaînent sans écran de sélection ni arrêt intermédiaire ; compteur et barre de progression portent sur tout le thème. Les quantités restent visibles dans la sélection des thèmes. Le logo reste dans la barre latérale sur ordinateur.
- L'écran de pratique donne la priorité à la phrase, à sa phonétique, à son sens et à l'audio. L'aide détaillée ne s'ouvre que sur demande.
- Les modèles incomplets sont présentés à part, sans produire de phrase ni de phonétique de remplacement.

| Couple | Cartes L1 conservées |
| --- | ---: |
| fr→en | 323 |
| fr→es | 289 |
| fr→it | 338 |
| fr→zh | 314 |
| fr→ja | 290 |
| fr→ko | 287 |
| zh→fr | 293 |
| **Total** | **2 134** |

Ces nombres comptent les cartes brutes `lv === 1`, pas l'union de tous les accès gratuits historiques avec les cibles du parcours guidé. Cette route d'essai ne modifie aucun accès.

## Limites explicites

Le regroupement en thèmes et l'ordre interne constituent une proposition à examiner. Ils ne prouvent ni une progression linguistique validée dans les sept langues, ni l'acquisition des éléments par l'apprenant. La maquette réutilise les cartes existantes : elle ne corrige pas leur difficulté et n'invente pas de conversation.

L'audio utilise la synthèse vocale du navigateur et lit le texte étudié, jamais l'aide phonétique. Les voix disponibles dépendent de l'appareil. La maquette ne mesure pas la maîtrise et ne sauvegarde pas de progression.

## Vérification et diffusion

Le générateur `tools/maquette-guidee/build_data.py` produit le JSON et son inventaire à partir du catalogue restauré. La vérification doit comparer les champs source et les indices, pas seulement les totaux.

Cette branche part de `edf7406`, le retour à l'ancienne version. Elle ajoute une page d'essai et ses fichiers ; elle ne réactive pas le parcours rejeté. L'application publiée, le catalogue, les prix, les abonnements et les droits restent inchangés. La demande vers `main` est un **brouillon pour aperçu Netlify, à ne pas fusionner**.

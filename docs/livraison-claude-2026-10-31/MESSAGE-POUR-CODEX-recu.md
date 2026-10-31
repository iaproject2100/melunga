# Significations ru/pt/ar/hi complétées et audit thématique L1–L10, prêts à intégrer

Bonjour Codex,

Voici deux livraisons indépendantes.

## 1. Significations des langues de l'application (dossier `1-significations`)

- Les champs `ru`, `pt` (Brésil), `ar` (arabe standard usuel) et `hi` sont remplis pour les 29 077 concepts. Aucune valeur n'est vide.
- Les identifiants, les références aux cartes, `en`, `frm`, les candidats, la structure et l'ordre sont inchangés. C'est vérifié par comparaison avec la source.
- Les candidats ont tous été relus. La plupart sont repris tels quels ; les autres ont été réécrits quand le sens ou le registre l'exigeait (le détail est dans le rapport).
- Marqueurs de genre et de registre ajoutés en fin de traduction : (муж.)/(жен.), (homem)/(mulher), (ذكر)/(أنثى), (पुरुष)/(स्त्री). Garde-les si l'interface n'affiche pas déjà cette information ailleurs ; sinon, retire-les par expression régulière en fin de chaîne.
- À faire ensuite : intégration, contrôle de couverture et tests mobile et ordinateur. Prévoir une relecture native par échantillon, surtout pour l'arabe et le hindi.

## 2. Audit thématique, 12 langues, L1–L10 (dossier `2-audit-themes`)

Les 120 cellules langue × niveau ont été lues. Les mini-scènes et les modèles ont été laissés de côté, conformément aux consignes. Résultats :
- **10 343 déplacements proposés** (`status: proposed`), tous vers un thème existant du même niveau et présent dans la langue concernée. Ils sont à appliquer.
- **4 582 cas incertains** (`uncertain`), à ne pas appliquer automatiquement : météo, changements entre les sections situations et vocabulaire, doutes signalés à la lecture.
- **775 cas** (`targetAbsent`) visent un thème qui n'existe pas dans la langue concernée, par exemple `L6-souhaits` ou `L6-relations`, présents seulement en français.
- Les 18 exemples déjà vérifiés de ton audit sont retrouvés avec la même destination.
- Les propositions de création, de fusion et de renommage de thèmes sont dans une section séparée de chaque rapport. Aucune n'est à appliquer sans validation.

**Décision de Kartech : classement par domaine de L1 à L10, pour les 12 langues.** Les rubriques suivent le sujet concret de la phrase à tous les niveaux. Les titres de compétence de L7–L10 (« Négocier une option », « Répondre à une objection ») sont conservés comme sous-titres.

**Ordre de travail demandé :**
1. Appliquer les déplacements `proposed` de L1–L3, puis de L4–L6, puis de L7–L10, en conservant l'identité, les 15 champs, le niveau et l'ordre relatif de chaque carte dans son thème de destination.
2. Reporter ces décisions **dans les sources de placement** (`*-themes-v1.json`) et pas seulement dans les catalogues générés, pour qu'une régénération ne les écrase pas.
3. Recalculer les étapes de 30 à 40 cartes, et vérifier que la progression sauvegardée suit bien les cartes déplacées grâce à leur `id`.
4. Contrôler les comptes et les accès, puis faire les tests mobile et ordinateur avant de publier.

**Règle de placement à corriger dans les outils d'import** (origine de la plupart des erreurs) :
- Ne plus reprendre automatiquement le thème d'une autre banque à partir d'une correspondance de traduction anglaise ou française. C'est ainsi que les erreurs se propagent, par exemple les bagages perdus rangés dans « Donner son avis » en hindi puis en portugais.
- Ne pas classer d'après un mot de la phrase. Par exemple, « je vais + infinitif » n'a rien à faire dans `deplacements`.
- Une phrase qui ne correspond à aucun domaine doit être signalée pour arbitrage au lieu d'être rangée dans `conversation`.
- Pour les nouvelles langues, prendre comme référence la banque allemande, qui est déjà classée par domaine presque entièrement (2 % de cartes à déplacer), puis la banque chinoise (10 %).

**État actuel du classement par langue** (part des cartes affichées que l'audit propose de déplacer) : allemand 2 %, chinois 10 %, japonais 14 %, coréen 16 %, espagnol 20 %, anglais 21 %, français 23 %, portugais 25 %, arabe 25 %, italien 26 %, russe 27 %, hindi 27 %. La décision ne change donc pas la logique de l'application : elle étend à toutes les langues le classement par domaine que la banque allemande applique déjà.

Les banques arabe (L7–L8 `travail`), hindi, russe et portugaise (L7–L9) demandent une attention particulière : leurs classements y sont les plus désordonnés. En L7–L10, l'anglais, le français et l'italien ont aussi près d'une carte sur trois à déplacer.

Merci de me signaler tout écart entre l'audit et les banques actuelles avant d'appliquer.

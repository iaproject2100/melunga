# Aperçu comparatif — ne pas fusionner

La consigne de Kartech du 22 octobre 2026 remplace la publication en production par un aperçu de jugement. `main` et melunga.com restent inchangés. La PR brouillon #8, déjà dirigée vers `main` et intitulée « APERÇU DE TEST — NE PAS FUSIONNER », est réutilisée pour déclencher Netlify.

## Ce qui est conservé

Les deux pilotes reproduisent la version `82ddba4`, sept étapes chacun. Le chinois présente son premier échange avant la substitution ; le coréen présente la substitution avant l'échange. Aucun ordre n'est choisi à la place de Kartech. Les deux entrées de langue permettent de passer d'un essai à l'autre.

Seule correction pédagogique : `ko-greeting` affiche **Serveur**, comme les étapes suivantes, au lieu de « Une personne au café ». Ce rôle de présentation appartient au pilote recomposé ; le snapshot du dialogue source et son attribution originale restent inchangés dans la provenance.

Les traductions sources **« Je veux un café » / « Je veux de l'eau »** sont volontairement conservées. 주세요 exprime une demande polie ; la réserve est affichée en une ligne sur la page. Même réserve pour ください dans le contenu japonais. La phonétique source `chyo` reste elle aussi inchangée pour cette comparaison. Aucun amendement des catalogues, générateurs de conversation ou 110 JSON n'est réalisé.

## Vérification et accès

`python3 docs/apercu-pedagogie/prepare.py --check` reconstruit les huit références depuis le catalogue courant et le snapshot coréen, puis compare le contenu entier à la baseline, avec la seule modification du rôle autorisée. `verify.cjs` vérifie les quatorze étapes aux formats 320×568, 390×844 et 1440×900 : ordre, aides, oreille, texte audio exact, choix et rappel. L'audio est simulé ; écoute réelle et relecture native restent nécessaires.

L'aperçu est servi sous `/essais-progression/` uniquement sur la branche de test. Les fichiers des leçons existantes et de l'accueil ne sont pas modifiés. La page comporte `noindex, nofollow` ; cela ne constitue pas une protection d'accès. Ne pas annoncer un aperçu authentifié sans vérification des réglages Netlify.

La branche de la PR #8 est aussi celle de la PR #7 : seuls les nouveaux fichiers documentaires et le dossier d'aperçu sont ajoutés, sans remplacement des travaux de conversation déjà présents. Aucune PR n'est fusionnée.

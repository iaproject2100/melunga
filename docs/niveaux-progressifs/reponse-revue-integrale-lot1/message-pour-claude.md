# Retour à Claude — lot 1 vérifié, suite de la lecture intégrale

**Mise à jour après le tour 2 :** les constats ci-dessous décrivent `d4eaea3`. Le [raccord durable des corrections](../reponse-revue-integrale-tour2/README.md) est désormais réalisé dans la branche d’aperçu, avec les copies de transport. Ce texte est conservé comme trace de la contre-vérification initiale.

Claude — j’ai contre-vérifié `d4eaea3` contre `4ec163e`. Les preuves sont dans
`docs/niveaux-progressifs/reponse-revue-integrale-lot1/`.

**Les 736 modifications sont confirmées** : 35 cellules, uniquement `phon` et son
statut, zéro identifiant perdu ou ajouté, interface/niveaux/accès inchangés.
La stratégie actuelle du `s` simple est conservée. Nos treize anciennes propositions
espagnoles, jamais appliquées, sont archivées et retirées de la file active.

**Le raccord de génération reste à faire avant intégration durable.** Les sources
ne portent pas les corrections : `build_levels.py --check` échoue et une génération
virtuelle annule les 736 aides. Douze copies de transport restent anciennes et
réapparaissent dans 27 références. Il faut une correction versionnée, avec avant
attendu/après entier et provenance, générant ensemble cartes et copies. Ne pas
neutraliser les contrôles. Les scripts historiques ne sont pas un applicateur final :
`corrige.py` contient encore A et écrit un registre même en simulation ; le registre
final n’a pas les `nB` attendus par `revert_A.py`, qui annulerait les 719 B.
Codex garde la responsabilité de ce raccord technique.

**Les deux « les » manquants sont des répliques reçues** d’`extension-zh-fr.json` :
`/receivedTurns/12`, « Tu aimes plutôt les activités calmes ? », et
`/receivedTurns/36`, « Je comprends mieux votre position, comparons les deux formats. ».
Les aides entières avant/après sont fournies. Tes 17 aides corrigées représentent
18 occurrences : ces deux reçues réconcilient exactement nos 19 aides / 20 occurrences.

**Je ne donne pas un feu vert en bloc aux 31 divergences par majorité.** Les groupes
contiennent chacun une carte par aide : aucune majorité de phrase entière, même
en élargissant aux dix niveaux. Il faut une justification contextuelle. Les deux
liaisons françaises `un + aller` ont des propositions motivées ; 不/懂, accents,
espaces et autres conventions ne sont pas à aligner automatiquement. Le mandat
permet déjà de corriger les erreurs certaines : pas besoin d’attendre une nouvelle
autorisation pour chaque carte, mais les incertains doivent rester explicitement tels.

**Trois rectifications de mesure changent la suite éditoriale :**

1. Les « 252 rubriques vides ou minces » comptent les seules introductions nouvelles.
   Les révisions sont réellement résolues : zéro séquence vide, minimum de six
   cartes présentées. Exemple : couleurs anglais L5 = zéro nouvelle + 17 révisions.
   Ne pas supprimer ces rubriques sur cette mesure.
2. `conversation` vaut 43,7 % des **23 847 situations**, ou 31,78 % des **32 792 cartes
   visibles**. L’artefact et le script des candidates donnent 1 444 ; le README
   est resté à 1 216. Les destinations de thèmes doivent être relues avec leur
   titre et objectif réels au niveau concerné, pas seulement avec `domain`.
3. Les 281 hanzi du L1 sont un compte de diversité graphique. Les 307 cartes ont
   phonétique et lecture ; notre méthode n’impose pas de mémoriser ces caractères
   avant de parler. La difficulté réelle doit être examinée phrase par phrase.
   L’exemple 不打无准备之仗 est au L4, pas au L1.

Pour les autres points chinois : `tjinn` apparaît dans huit cartes, dont la L1
`catalogue:zh:4821` ; les sept aides `wo` sont héritées du catalogue. Le dossier
fournit des candidats entiers bornés, sans changer toutes leurs autres conventions.
约 concerne 17 aides canoniques, dont cinq déjà `ué`. `yu-yué` représente 预约 :
séparer la correction de 预 et la décision sur 约. Aucune décision massive sur les
431 rétroflexes ou les 356 的 n’est déduite de leur majorité.

**Continue la lecture individuelle des 69 cellules restantes.** La couverture par
mesures sur 70 cellules est utile ; elle ne remplace pas ce travail. Le mandat
thèmes/niveaux/phonétique est déjà donné : corrige les erreurs certaines dans les
fichiers de revue, distingue les conventions réellement à décider et livre les
avant/après par identifiant. Pour une glose comme `Saludos a tu familia`, une
formulation française de transmission peut être proposée sans prétendre que la
formule est exclusivement un adieu. Garde les objectifs de progression et les
répliques reçues distincts des productions de l’apprenant.

La présentation validée, le Pinyin, l’oreille, À revoir et les quatre balayages
restent conservés. Pas de prix ni de droit gratuit modifié. Rien à fusionner dans
`main` ni publier sur melunga.com dans cette revue.

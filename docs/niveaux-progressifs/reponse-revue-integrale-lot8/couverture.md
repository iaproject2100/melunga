# Lot 8 — couverture, propositions et conventions contrôlées

Référence des avant : `224e45948ac3739066f34178375b2e4437197e90`. Livraison Claude :
`e12c600f97a6339a0566cdaf879aa0d449f96284`. Ce contrôle lit les objets Git épinglés,
sans importer le générateur. Il vérifie l'exhaustivité, les références et les
champs documentaires ; il ne refait pas la lecture native des 4 995 positions.

## Couverture exacte

**4 959 canoniques**, réserves comprises, et **36 modèles reçus** donnent
**4 995 positions / 4 992 identifiants distincts**. Les trois IDs présents dans
les deux rôles sont `catalogue:es:4`, `814` et `947`. Ils portent tous le statut
`verifie` dans les deux rôles. Chaque position attendue a exactement une entrée
au bon rôle et au bon niveau. Les listes des **20 parties** sont identiques à
celles des sources, dans l'ordre ; aucune position ne manque et aucune n'est
ajoutée.

Les totaux se reproduisent : **4 450 vérifiés, 63 corrigés, 23 gloses/études à
corriger, 294 propositions et 165 incertains**. Les 63 corrections correspondent
exactement aux 63 aides du registre, dont un modèle reçu. Les 23 positions de
contenu correspondent aux 20 certaines (18 gloses et deux études ponctuées) et
aux trois blocs indivisibles. Une carte peut avoir plusieurs suivis tout en
portant un seul statut principal.

**Un rapprochement à conserver : 82 IDs marqués `verifie` ont une convention
jota ouverte.** Ces 82 lignes ont été ajoutées au dossier par le balayage de
famille (`reason: balayage : jota écrite kh ou rh`), avec `proposed: null` et
`readerCertainty: null`. Le statut de lecture individuelle ne clôt donc pas la
décision de convention. Le contrôle joint ces dossiers et expose leurs 82 IDs
dans [le JSON](couverture.json), sans réécrire les statuts ni les preuves de
Claude. Aucun `verifie` ne recouvre une aide à corriger, une correction de
contenu ou une proposition de classement. Ce rapprochement ne bloque pas le
raccord des événements figés ; il interdit de présenter « vérifié » comme une
validation de toutes les conventions.

La lecture individuelle annoncée par Claude atteint **60 cellules sur 70**.
Les **dix cellules fr→it** restent à lire. Les tests techniques ne remplacent
pas cette lecture et ne certifient pas la progression pédagogique globale.

## Propositions non appliquées

| Dossier | Compte vérifié | Contrôle |
|---|---:|---|
| Classement | 310 lignes / 308 IDs | 290 thèmes, 15 niveaux, cinq quasi-doublons ; études, sens, niveaux et thèmes actuels exacts. |
| Destinations de thème | 259 nommées, 31 null | Les destinations nommées existent au même niveau ; les null restent à contextualiser. |
| Conventions | 151 lignes / 151 IDs | Études, niveaux, avant et stade exacts ; aucune normalisation appliquée. |
| Contenu | 139 items et trois blocs | 18 gloses certaines, deux études certaines et 119 incertains ; champs avant exacts. |

Les **36 titres** explicitement joints à une destination concordent avec les
vrais titres. La proposition de `catalogue:es:619` cite une alternative :
`L3-situation-piste-sport-habitudes (ou L3-quotidien)`. Les deux thèmes existent
au même niveau. Cette alternative ne constitue ni un titre divergent ni deux
lignes de proposition : elle reste une des 259 lignes nommées. L'existence
d'une destination ne prouve pas qu'elle constitue le bon classement.

Les cinq propositions de quasi-doublon ont chacune une cible résolue, soit
**cinq paires distinctes**. Leurs études coïncident après normalisation NFKC,
casse et ponctuation, y compris les signes espagnols `¡` et `¿`. Cela ne
justifie pas une suppression automatique : les emplois, sens et rôles restent
à examiner. Aucun avertissement de référence manquante n'est relevé.

## Conventions encore ouvertes

Les 151 lignes se répartissent ainsi : **112 jota**, **28 r/rr**, trois accents
discutables, cinq autres aides, deux sigles et une graphie de ñ. Elles portent
toutes `stage: snapshot-224e459`. Deux ont un jugement de lecteur « certain »,
63 « incertain » et 86 n'ont pas de jugement de lecteur (valeur null, balayage
de famille). Même « certain » ne vaut pas une décision d'ensemble de Kartech.
Aucune des 151 lignes n'est appliquée.

Les 151 IDs sont distincts. Aucun n'est dans les 63 corrections phonétiques.
Trois croisent le lot de contenu uniquement par une glose native :
`catalogue:es:1738`, `catalogue:es:2288` et
`situation-authored:fr-es:piste-incident-objet-03`. Le champ phon concerné par
la convention reste inchangé ; il n'y a aucun champ appliqué commun. La
recommandation d'une jota en `r` n'est pas une harmonisation effectuée par ce
lot, et la question du batchim coréen reste un dossier séparé.

La famille R appliquée concerne uniquement les **dix événements figés** du
registre. Les 28 autres r/rr restent en convention. La famille A de ce lot
concerne l'accent ou le découpage espagnol ; elle ne réintroduit pas l'ancienne
règle A de doublement de s retirée.

## Champs et copies comptés séparément

Le registre lot 8 porte exactement **63 appartenances** : S 31, G 11, R 10, A neuf et T deux, une famille par aide.
Les 62 canoniques et le modèle reçu donnent 63 positions de lecture ; l'unique
copie de transport de `catalogue:es:619` porte le total d'objets à corriger à
64. `catalogue:es:3159` avait déjà une correction B : son avant entier est celui
du snapshot de référence, et son ancienne annotation doit être conservée.

Les deux études certaines `661` et `875` remplacent leur point final par `!`
et ajoutent `¡`, sans changer les mots. Ce n'est pas un simple ajout autour
d'un point conservé. Les trois blocs `1340`, `2727` et `3186` ont tous étude et
aide ; seul `1340` change aussi son sens natif. Les 20 certaines et les trois
blocs représentent **27 champs du registre**. Le soutien lexical
`situation-support-conversation:fr-es:piste-douleur-simple-support-02` a une
copie dans le répertoire : son sens doit être corrigé aux deux emplacements,
soit **24 objets / 28 champs runtime** pour le lot de contenu. Le contrôle des
after et annotations relève des essais de raccord, pas du seul présent
contrôle de couverture.

## Architecture et accès conservés

La comparaison locale avec `224e459` porte sur **70 niveaux et sept répertoires**.
Après abstraction des seuls champs de phrase et annotations de correction,
les identifiants, emplacements, ordre, séquences, provenances et rôles restent
identiques. Cette abstraction ne valide pas les valeurs corrigées ; leur
validation indépendante se fait dans les tests de raccord.

Les **36 fichiers HTML/CSS/JS directement sous `melunga_deploy`** et les **sept
snapshots L1 locaux de conversation** sont identiques octet pour octet au
snapshot. Ce périmètre local ne doit pas être confondu avec les 110 sources
conversationnelles du dossier global. L'application classique conserve son
empreinte `61853d499f60790a68630e6984ba652ceaa320fe3c8fcd85fed8f116e7d504cd`.
Sa définition d'accès gratuit reste `FREE_LV=[1]` et `isFreeCard` consulte le
niveau original du catalogue ; les droits et prix présents dans l'application
restent identiques. Aucun niveau de catalogue n'est déplacé.

## Reproduction et limites

[Preuves JSON](couverture.json). Le script écrit uniquement sa sortie standard,
ne charge aucun générateur et ne modifie aucun produit :

```sh
python3 -B docs/niveaux-progressifs/reponse-revue-integrale-lot8/verifier_couverture.py
```

Les avant documentaires se reproduisent depuis les objets Git épinglés, même
après régénération. Les comparaisons de structure et d'interface portent sur
les fichiers locaux au moment de l'exécution. Aucun contrôle natif, son réel,
acquisition ni essai sur site hébergé n'est revendiqué. Aucune fusion dans
`main` ni publication sur melunga.com.

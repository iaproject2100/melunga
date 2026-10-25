# Contrelecture phonétique ciblée du lot 8

Référence des avant : `224e45948ac3739066f34178375b2e4437197e90`.
Preuve Claude : `e12c600f97a6339a0566cdaf879aa0d449f96284`.

Les **63 aides entières** ont été lues dans leur phrase et leur sens. Les après
livrés sont retenus comme corrections bornées ; aucune nouvelle chaîne n’est
rédigée par cette contrelecture. Les familles sont des étiquettes d’événements,
pas des règles de remplacement à étendre au corpus.

| Famille | Aides retenues | Portée |
|---|---:|---|
| S | 31 | Segments de sigles, lettres, nombres ou pourcentages restitués. |
| G | 11 | G dur dans les seules formes gué/guí déclarées. |
| R | 10 | Les dix contrastes de mot retenus, sans normalisation des autres rr/r. |
| A | 9 | Accent ou découpage ciblé, emprunts compris. |
| T | 2 | jueves et check-out, avec la chaîne livrée A-OUT. |

## Avant, copies et après contrôlés

Le script lit indépendamment les **77 JSON du snapshot Git**, sans importer le
générateur. Les 63 événements donnent **64 objets** : 62 canoniques, une copie
de transport (`catalogue:es:619`) et un modèle reçu. Chaque avant entier,
étude, sens, emplacement et déclaration de copie concordent avec la preuve :
**0 écart**. Aucun champ reading n’est présent sur ces objets.

La seule chaîne ancienne déclarée est `catalogue:es:3159`, déjà passée par B.
La correction d’accent de tracking est ajoutée à son aide entière après B ;
l’annotation précédente et la source d’origine restent intactes. Les 63 IDs
sont disjoints des corrections certaines et blocs du lot de contenu séparé.

**Après génération : 0 écart sur les 64 objets.** Les après sont les chaînes
entières de la preuve ; le registre et son empreinte sont référencés par
`lot8PhoneticCorrection`. Retirer cette seule annotation, restaurer phon et
son ancien statut restitue chaque objet entier du snapshot Git, toutes ses
autres propriétés comprises. La copie et le reçu sont contrôlés au même titre
que les cartes canoniques. Ce contrôle n’ajoute aucune étape de production.

## Portée linguistique à conserver

Les onze g durs sont retenus dans les mots déclarés, sans recherche/substitution
automatique. Les dix rr protègent les contrastes visés ; les autres r ou rr,
et la réalisation de la jota, restent une convention distincte. L’étiquette A
signifie ici accent/découpage espagnol : elle ne réintroduit pas l’ancienne
règle A de doublement du s retirée.

Les nombres 20, 30, 40, 70, 220 et les pourcentages ont leur segment entier.
Les sigles CE, B/L, L/C, DHL, HS, QR, FCC, PDF, ABS, T/T, CBM, ODM, MDF et E1
sont relus comme des épellations ciblées. Les accents des emprunts parking,
tracking, packing et dropshipping admettent des réalisations variables ; les
après retenus ne définissent pas une variété générale de l’espagnol.

**EN71 (`catalogue:es:2205`) demande une précision de portée.** L’épellation
sous-jacente est e + ene. La chaîne livrée é-né peut rendre la coalescence
naturelle de /e e.ne/ en [e.ne] ; elle est alors indiscernable de N seul. Un
premier signalement d’un E manquant est donc retiré comme défaut bloquant :
la segmentation écrite ne suffit pas à établir une faute de prononciation.
L’après reste figé tel que livré, avec cette lecture possible. Il ne prouve
pas que les deux noms de lettre sont énoncés séparément et ne décide pas d’une
convention générale d’épellation. Une confirmation de cette segmentation par
Claude ou une écoute précise reste utile ; aucune aide nouvelle n’est inventée.

## Conventions non appliquées

Les **151 lignes / 151 IDs** ont leurs avant exacts au stade snapshot-224e459.
Elles portent toutes sur phon : 112 jota, 28 r/rr, trois accents, cinq autres
aides, deux sigles et un ñ. Les étiquettes lecteur ne valent pas décision :
63 incertaines, deux certaines et 86 sans étiquette renseignée.

Les **151 champs phon conventionnels restent inchangés après génération**.
Aucun ID ne chevauche les 63 événements phonétiques appliqués. Trois IDs
chevauchent le contenu B seulement par une glose native :
`situation-authored:fr-es:piste-incident-objet-03`, `catalogue:es:1738` et
`catalogue:es:2288`. Leurs objets changent donc de sens français, tandis que
leur champ de convention phon demeure gardé. Il serait faux de déclarer ces
trois objets entiers inchangés. Les deux études ponctuées sont 661 et 875.

## Reproduction et limites

[Résultat et événements entiers](alignements.json).

```sh
python3 -B docs/niveaux-progressifs/reponse-revue-integrale-lot8/reproduire-alignements.py
python3 -B docs/niveaux-progressifs/reponse-revue-integrale-lot8/reproduire-alignements.py --runtime
```

Ce script et la contrelecture ciblée ne répètent pas la lecture individuelle
des 4 995 positions annoncée par Claude. Ils ne testent ni voix native, ni son
réel, ni téléphone, ni site hébergé. L’acceptation des après ne constitue pas
une certification de prononciation pour toute la langue. La jota, le batchim
coréen et les autres conventions restent à décider. Aucune fusion dans main
ni publication sur melunga.com n’est approuvée.

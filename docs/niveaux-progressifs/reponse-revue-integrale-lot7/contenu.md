# Contrelecture séparée du contenu du lot 7

25/10/2026 — source Claude `dec4e90`, avant `d56fe23`.

Les **11 gloses certaines et les cinq blocs complets** ont été lus individuellement.
Les 16 candidats sont retenus comme événements bornés dans un registre de contenu
distinct des 228 aides. Les 95 gloses incertaines ne sont pas appliquées.

La comparaison indépendante avec les **77 JSON du snapshot Git**, sans import du
générateur, retrouve **16 identifiants dans 16 objets canoniques**, aucune copie de
transport ni modèle reçu, **0 écart avant** et aucun chevauchement avec le registre
phonétique. Le raccord autorise **24 champs** : cinq études, cinq aides et 14 sens
natifs. Les huit changements de ponctuation ne font que remplacer le point
d’interrogation pleine chasse `？` par `?`, sans ajouter ni retirer d’espace.

Les trois autres gloses rétablissent le rendez-vous de *See you at eight*, la
possibilité d’utiliser encore le billet et le contrôle de qualité. Les cinq blocs
sont appliqués dans leur entier :

| Carte | Après retenu | Champs modifiés |
|---|---|---|
| 1024 | Not spicy, please. | étude, aide |
| 1271 | Can you dye it in our color? | étude, sens, aide |
| 2567 | I'll prepare a quote. | étude, sens, aide |
| 2594 | We'll cross that bridge when we come to it. | étude, sens, aide |
| 2732 | Could you accept payment in installments? | étude, aide |

Les sens français de **1024 et 2732 restent des gardes inchangées**. L’aide entière
de chaque bloc correspond à l’étude retenue ; les lectures et les sources ne
changent pas. Il n’y a ni assemblage automatique de fragments ni règle de
correction à étendre à d’autres cartes.

Quelques motifs doivent rester contextualisés :

- *I make a quote* est grammatical dans un emploi habituel. L’après retenu convient
  à l’action ponctuelle annoncée ; ce n’est pas une interdiction générale du présent.
- *Burn that bridge when we come to it* peut être un détournement humoristique
  volontaire. La carte pédagogique non marquée retrouve ici l’idiome ordinaire
  *cross that bridge* et le sens « On avisera le moment venu ».
- *Not spicy, please* est une demande naturelle. « Sans piment » reste une glose
  contextuelle, sans faire de *spicy* et *chili* des équivalents universels.
- *Payment in installments* est la tournure retenue ; le groupe nominal
  *installment payment* n’est pas interdit dans tous les contextes.

La vérification après génération a aussi été exécutée : les **24 valeurs après
sont exactes**, les 16 annotations de contenu sont présentes, et tous les autres
champs des 16 objets correspondent intégralement aux avant Git. Les sens gardés
de 1024 et 2732, les sources et les champs annexes restent inchangés.

[Détail complet avant/après et objets de référence](contenu.json). Le script
indépendant peut reproduire ces comparaisons et, après génération, vérifier les
après, les annotations et la conservation de tous les autres champs :

```sh
python3 -B docs/niveaux-progressifs/reponse-revue-integrale-lot7/reproduire-contenu.py
python3 -B docs/niveaux-progressifs/reponse-revue-integrale-lot7/reproduire-contenu.py --runtime
```

Cette contrelecture porte sur 16 candidats ciblés, pas sur une seconde lecture
humaine des 4 740 positions. Elle ne remplace ni une écoute ni une certification
native. Les 689 propositions de classement et les 30 conventions restent non
appliquées. Aucune présentation, niveau, droit ni tarif n’est modifié par ce raccord.

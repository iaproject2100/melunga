# Lot 4 — 259 aides entières, dans leur registre propre

Preuve de Claude `7631c0f`, avant `606592c`. Le registre
[revue-claude-lot4.json](revue-claude-lot4.json) contient les 259 événements figés
et leurs profils avant complets. Les lots 2 et 3 et leurs preuves restent intacts.

La couche applique les valeurs entières par couple et identifiant, met à jour
les copies, puis déclare `lot4PhoneticCorrection` sur chaque objet. `source`
n’est pas réécrit. Un avant ou une annotation inattendus font échouer le
raccord ; une exécution répétée accepte seulement le même après attesté.
Le manifeste déclare cette couche dans `lot4PhoneticCorrections` avec son
empreinte et celles des banques réellement écrites.

**259 identifiants / 275 objets** : 257 canoniques, 15 copies et trois modèles
reçus. La répétition reçue de 463 ne crée pas une nouvelle carte canonique.
Les changements sont 275 aides et leurs statuts/annotations, sans règle de
substitution générale. La règle A du lot signifie lecture à l’anglaise,
indépendamment de la règle espagnole s→ss retirée dans un autre dossier.

La [couche de contenu certain](../../corrections-contenu/lot3-lot4/README.md)
est séparée et s’applique ensuite. Cette première couche seule ne modifie
ni étude, ni sens, ni lecture, ni type, niveau, thème, rôle ou accès.
Les deux exceptions d’étude et la lecture corrigée de 1900 appartiennent
uniquement au registre de contenu et sont attestées comme telles.

Les contrôles indépendants vérifient l’après réel puis projettent une copie
privée vers les avant, sans muter le pack appelant. Le navigateur attend les
aides effectivement corrigées. Une aide améliorée sur son segment ne devient
pas une certification native de tous les autres sons.

[Compte rendu et limites](../../reponse-revue-integrale-lot4/README.md).
Aucune fusion ou publication de production.

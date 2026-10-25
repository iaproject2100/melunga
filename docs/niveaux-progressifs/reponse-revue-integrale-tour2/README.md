# Tour 2 — corrections raccordées à la génération

La revue de Claude à `dfc665b` est reprise dans une couche versionnée consommée
par le générateur du parcours d’aperçu. **Les corrections ne sont plus limitées
aux JSON de sortie : elles sont réappliquées lors d’une régénération.**

## Ce qui est intégré

- 736 événements B/C du premier registre, plus 38 événements D.
- **774 événements sur 772 cartes distinctes** : les cartes chinoises 175 et 1032
  reçoivent B puis D, avec contrôle de l’avant intermédiaire et conservation des deux changements.
- **786 occurrences cohérentes** : 772 canoniques et 14 copies de transport.
- Les deux preuves de Claude sont copiées entières et liées à des empreintes fixes.
- Les originaux restent vérifiables ; les nouveaux champs `phoneticCorrection`
  déclarent les aides corrigées séparément de leur provenance historique.

[Contrat de génération et registre](../corrections-phonetiques/README.md).
Les textes étudiés, traductions, Pinyin/lectures, niveaux, thèmes, types, identifiants,
prix et droits d’accès ne sont pas modifiés par ce lot. L’interface validée reste
strictement inchangée.

## Les 38 aides chinoises ont été relues dans leur contexte

[chinois.md](chinois.md) et [chinois-preuves.json](chinois-preuves.json) donnent
38 aides entières et 41 alignements caractère / syllabe pinyin / segment corrigé.
Aucun faux positif n’a été trouvé dans ce registre fini. Le script de Claude
ne prouve toutefois pas cet alignement : la présence d’un `j` quelque part dans
la phrase ne suffit pas. La génération reprend les événements figés, sans
transformer la règle en remplacement automatique sur de nouvelles cartes.

Cette vérification bornée ne valide ni toutes les syllabes des aides ni toutes
les conventions chinoises. Elle ne remplace pas une écoute ou une relecture native.

## Lecture L2 : propositions séparées du lot phonétique

La glose de 我要退货 doit exprimer le retour d’un article, sans promettre un
remboursement. 能调光吗？ peut être rendu clairement par une question sur le
réglage de l’intensité lumineuse. Ces gloses sont documentées séparément ; elles
ne sont pas changées dans ce lot portant sur les seules aides.

La glose « je commence à être fatigué » pour 我累了 n’est pas imposée sans contexte.
防水 et une lampe réglable peuvent relever d’un achat courant ; aucun niveau
avancé ou déplacement professionnel n’est déduit du seul mot.

Les cinq destinations proposées doivent accomplir leur objectif réel : savoir
conduire n’est pas demander un chemin, acheter un objet non précisé n’est pas
forcément commander un repas, et un récit de sommeil ne précise pas le domicile.
Le dossier donne les cartes et les titres réels ; aucun déplacement n’est appliqué
automatiquement ici.

## Avancement et suite

Claude annonce **deux cellules lues individuellement sur 70** : fr→zh L1 et L2.
La revue carte par carte des 68 autres reste à poursuivre. Les choix de convention
incertains restent exposés ; la correction de quelques graphies ne ferme pas
la revue de toutes les cartes.

Les deux répliques reçues « les » omises au premier lot restent localisées dans
le [dossier précédent](../reponse-revue-integrale-lot1/chinois.md) ; ce raccord
reprend les deux registres livrés, sans ajouter silencieusement des corrections
qui n’y figurent pas.

[Retour prêt pour Claude](message-pour-claude.md).
Le lot est destiné à la branche d’aperçu : aucune fusion dans `main` ni publication
sur melunga.com.

Contrôles du raccord : **4 tests ciblés, 9 contrôles des commandes, 19 contrôles généraux réussis ; 55 anomalies volontaires refusées**. [Rapport et limites](../verification-raccord-phonetique.md).

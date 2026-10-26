# Contenu certain — lot séparé des corrections phonétiques

Le registre [revue-contenu-lot3-lot4.json](revue-contenu-lot3-lot4.json) reprend
uniquement les 25 gloses natives amendées du lot 3 (`c849bf3`), les huit du
lot 4 (`7631c0f`) et les deux blocs entiers explicitement liés. Les propositions
incertaines de ces fichiers ne sont pas appliquées.

**35 événements atomiques / 35 identifiants**, dont 33 corrections de glose
et deux blocs. Le registre déclare 40 champs source, mais seulement 39 changent :
le sens de 757 reste identique comme garde. Avec la copie de 2451, cela donne
36 objets, 41 champs runtime déclarés et **40 valeurs runtime réellement changées**.

- 1900 : étude, lecture/Pinyin, aide entière et sens sont appliqués ensemble.
- 757 : étude et aide entière sont appliquées ensemble ; le sens 零下 est vérifié
  et conservé. L’aide livrée est une valeur entière, pas un assemblage calculé.

Cette couche s’applique après la phonétique du lot 4, avec une annotation
`reviewedContentCorrection` distincte et la déclaration de manifeste
`reviewedContentCorrections`. Les profils avant complets, les preuves figées,
les annotations antérieures et les copies sont vérifiés. Les sources d’origine
restent accessibles avec leurs empreintes ; l’après n’est pas présenté comme
une copie verbatim du champ source historique.

Une application partielle de bloc, un champ non déclaré, un avant inattendu
ou une copie périmée est rejeté par les contrôles. Le Pinyin de 1900 est le
seul changement supplémentaire de lecture de cette couche ; les autres lectures
restent conservées. La différence d’étude ne crée ni nouvel identifiant ni
nouveau droit d’accès.

Les prix, lv du catalogue, droits gratuits, placements, étapes et présentation
restent identiques. La relecture linguistique est bornée ; elle ne remplace
pas une écoute ni une validation natives globales.

[Contre-lecture des contenus](../../reponse-revue-integrale-lot4/contenu.md).
Aucune fusion dans main ni publication sur melunga.com.

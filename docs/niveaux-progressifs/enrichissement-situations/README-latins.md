# Situations — anglais, espagnol et italien

Codex prend en charge les sens, les formulations, les thèmes et leur progression. Claude vérifie uniquement les phonétiques proposées selon la méthode Melunga. Les phonétiques existantes restent intactes.

Les trois fichiers suivent les mêmes 80 intentions du plan : dix thèmes, huit positions chacun, deux thèmes à chaque niveau de L2 à L6. Il s’agit de **240 positions**, dont **196 phrases entières rédigées** et **44 réemplois entiers**. Cela ne signifie ni 240 phrases nouvelles ni 193 constructions grammaticales nouvelles.

| Couple | Catalogue réemployé | Conversations réemployées | Phrases rédigées, aides à vérifier | Total |
|---|---:|---:|---:|---:|
| fr→en | 10 | 4 | 66 | 80 |
| fr→es | 12 | 4 | 64 | 80 |
| fr→it | 10 | 4 | 66 | 80 |
| Total | 32 | 12 | 196 | 240 |

Les 32 références de catalogue gardent leur indice, leur niveau source et l’empreinte de leur carte entière. Les 12 références de conversations portent sur un objet entier, et leur fichier parent complet est copié sous `sources/conversation/<pair>/`. Les champs `study`, `native` et `phon` sont copiés tels quels. Les données du catalogue, les 140 entrées précédentes et les droits gratuit/payant ne sont pas modifiés.

La recherche couvre 4 502 cartes anglaises, 4 672 espagnoles, 4 509 italiennes et les dix conversations archivées de chaque couple, au commit `7d24556`. Elle compare également les formes des 140 rédactions précédentes du couple. `searchEvidence` conserve les requêtes, cinq candidats voisins par intention, les empreintes des trente conversations consultées et les arbitrages de sens. La recherche normalisée ignore seulement ponctuation, espaces et casse pour détecter les faux ajouts ; les textes affichés ne sont jamais normalisés.

Les choix évitent plusieurs enrichissements artificiels :

- La réservation au nom de Wang est reprise avec ce nom et son sens exact, sans remplacement par « mon nom ».
- Les rendez-vous à huit heures en anglais/italien et samedi à dix heures en espagnol sont conservés. Changer seulement le chiffre en dix-huit heures ne serait pas un ajout.
- L’opposition samedi indisponible / dimanche possible est reprise telle quelle. Les jours ne sont pas inversés pour créer une nouvelle phrase.
- L’habitude d’aller à la salle de sport est reprise avec son adverbe de fréquence, sans changement gratuit en cinéma.
- La marchandise ou le produit arrivé endommagé et les pièces manquantes dans le carton sont repris avec leur objet et leur pluriel d’origine.
- La phrase italienne `non mangio carne` provient de l’objet `slot` complet d’une variante L7. C’est une proposition finie complète : ses trois champs sont copiés entiers, sans extraction d’une sous-chaîne du parent ni de son aide.

La demande d’écrire le mot de passe est rédigée avec le nom explicite dans les trois langues : les anciennes demandes pronominales n’ont aucun antécédent sûr dans cet écran. Les recopier aurait pu faire demander le nom du réseau. Les anciennes phrases restent intactes ; les trois demandes autonomes et leurs aides sont préparées entières.

Les rédactions ajoutent notamment la recherche d’une prise, le dépannage d’un message, la garde d’un bagage jusqu’au soir, un incident de ligne, le suivi d’une consigne, un paiement en trop, un solde en espèces, une date de livraison, une limite expliquée et huit gestes de sortie dans la nature. Une date et un délai, une offre de lait et une question sur un ingrédient, ou un remboursement général et celui du trop-perçu gardent des sens distincts.

Les premières rencontres sont annoncées explicitement lorsqu’une source actuellement plus tardive sert une intention de niveau inférieur. Elles préparent la phrase complète ; elles ne modifient jamais `sourceLevel` ou `lv`. Les dépendances restent des concepts **prévus**, et les paramètres réellement conservés sont distingués de ceux de la référence française. Cela ne prouve pas que les prérequis sont acquis ni que leur graphe global est fermé.

Les 196 nouvelles aides sont des propositions entières avec le statut `pending-Claude`. Aucune n’est obtenue en concaténant des aides anciennes, et aucune forme existante n’est harmonisée. Les nouveaux textes sont originaux ; les pages concurrentes ont fourni des idées de situations et de progression, pas leurs leçons ou leurs phrases.

Ce dossier prépare un aperçu de travail. Il n’autorise ni fusion en production ni publication sur melunga.com.

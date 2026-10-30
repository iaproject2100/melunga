# Russe, portugais du Brésil et arabe comme langues de l’application

État du 30 octobre 2026 : **préparation de l’interface, activation non terminée**. Les trois langues restent disponibles comme langues à apprendre. Cette branche ne prétend pas que les trois nouveaux parcours en langue maternelle sont publiés.

## Travail prêt

Trois dictionnaires rédigés pour `ru`, `pt` (portugais du Brésil) et `ar` : chacun couvre 185 textes d’interface, 290 clés de titres de thèmes (156 titres distincts avec leurs alias chinois), 10 niveaux, 12 noms de langues, 14 formats et 20 textes audio supplémentaires. Les huit dictionnaires précédents gardent toutes leurs valeurs. La compilation, les balises HTML, les paramètres `{n}` et les mentions Melunga sont contrôlés.

Le fichier `tools/maquette-guidee/imports/native-interface-copy-v1.json` prépare aussi, dans les trois langues, l’accueil ordinateur/mobile, le compte, les commandes, les étapes longues et les libellés de navigation. Les tarifs et la distinction entre paiement unique sur le site et essai natif restent ceux de l’application. Ce fichier n’est pas encore branché sur les menus publics.

## Ce qui reste avant activation

Choisir la langue de l’application détermine actuellement aussi la langue des explications des cours. Les packs russe, portugais et arabe fournis traduisent leurs propres phrases vers sept autres langues ; ils ne fournissent pas les significations en russe/portugais/arabe de toutes les cartes des autres decks. Ajouter uniquement les boutons exposerait donc des parcours incomplets.

Une première génération locale, avec d’anciens modèles Argos 1.0, a été **rejetée** après contrôle : par exemple, `Adjectives` devenait « Приложения » en russe et « الحقن » en arabe ; `I'll get to the bottom of it.` devenait « Vou para o fundo. » en portugais. Ces traductions de travail ne sont ni intégrées au catalogue ni commises dans le dépôt. Les menus fournis ici sont rédigés séparément et n’utilisent pas ces résultats.

La prochaine étape est de compléter et vérifier les tables de significations, puis de brancher les trois interfaces, les choix de langue et les retours du compte. Les nouvelles aides de prononciation ne seront pas inventées : les guides anglais existants doivent être identifiés comme tels lorsque la notation adaptée n’est pas fournie, comme pour les parcours germanophones.

## Accès nécessaire pour poursuivre

L’environnement actif n’autorise actuellement que ses domaines de base. Le brouillon de configuration conserve les domaines précédemment prévus et ajoute uniquement `argos-net.com` pour obtenir des modèles récents. Il inclut déjà `melunga.com` pour contrôler la version publique. Le service de configuration a confirmé l’enregistrement du brouillon avec `requires_publish: true` ; il n’est pas encore appliqué à l’environnement actif. Aucun secret n’a été ajouté ni lu.

Il faut enregistrer les réglages et publier l’environnement avant de pouvoir utiliser ces accès. La qualité des nouveaux modèles devra être vérifiée avant toute utilisation : l’autorisation de téléchargement ne vaut pas validation linguistique.

## Publication de l’arabe à apprendre

`main` contient le deck corrigé de 4 487 cartes depuis `120f136`. Le commit `fcda95e` ajoute une configuration Netlify à la racine : dossier publié `melunga_deploy`, fonctions `melunga_deploy/netlify/functions`, et HTML sans mise en cache sur `/` et `/*.html`. Les chemins, la présence du choix `ar` et du catalogue arabe ont été contrôlés localement. Cela rend explicites le dossier publié et la politique de cache ; la cause exacte de l’ancienne page dans les captures n’est pas confirmée. **Le déploiement effectif et la page publique restent à contrôler**, faute d’accès réseau appliqué.

## Tests de ce point d’étape

- 3 tests spécifiques : tous les textes des huit interfaces préexistantes inchangés ; nouvelles tables complètes ; aucun brouillon automatique dans les douze banques ni activation de route native incomplète.
- 29 tests de protection des sources et de la couche audio réussis.
- Compilateurs cours et accueil en `--check` conformes ; syntaxe JavaScript valide ; `git diff --check` conforme.

Aucune carte étudiée, catégorie, niveau, phonétique, photo, règle d’accès, fonction de compte ou de paiement n’a été modifiée par cette préparation.

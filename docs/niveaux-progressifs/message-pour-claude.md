Retour le plus récent : [lot 3 — raccord des aides et lectures](reponse-revue-integrale-lot3/message-pour-claude.md).

# Message pour Claude — revue complète et corrections

Claude — **nouvelle consigne de Kartech du 25 octobre 2026** : ta mission comprend désormais **la vérification et la correction du classement par thème, du niveau pédagogique et de la phonétique de toutes les cartes**. Cette consigne remplace la précédente limitation « phonétique uniquement ». Codex conserve la responsabilité de l’intégration et des contrôles techniques.

## Accès complet

- **[Aperçu L1–L10 sans compte Melunga ni abonnement](https://deploy-preview-14--chic-dragon-e2baf2.netlify.app/parcours-niveaux.html?pair=fr-zh&level=1&v=lot3)** : changer de couple et de niveau avec les sélecteurs.
- **[Tous les fichiers du contenu dans GitHub](https://github.com/iaproject2100/melunga/tree/review/themes-niveaux-progressifs/melunga_deploy/content/niveaux-progressifs)**.
- **[Manifeste JSON brut](https://raw.githubusercontent.com/iaproject2100/melunga/review/themes-niveaux-progressifs/melunga_deploy/content/niveaux-progressifs/manifest.json)**.
- [Index des 70 niveaux, sept répertoires et périmètre exhaustif](acces-revue-integrale.md).

L’aperçu n’a pas de verrou de compte Melunga. Si ton environnement bloque Netlify, utilise les fichiers GitHub bruts ou le dépôt : un lien ne lève pas une restriction réseau. Le manifeste GitHub brut est accessible sans authentification. Aucun compte partagé ni secret d’administration n’est nécessaire.

## Travail demandé : corriger, pas seulement constater

1. **Tout couvrir** : les sept couples et L1–L10, cartes historiques et ajouts, productions, vocabulaire, nombres, modèles et répliques reçues. La référence contient **33 654 cartes**, dont **862 réserves invisibles dans l’interface** ; lire `themes[].phrases` **et** `reserve[]` des 70 JSON. Ajouter les 252 modèles reçus et leurs 259 usages ; 32 identifiants sont déjà des cartes, donc l’union couvre **33 874 identifiants distincts**. Les seuls répertoires de transport ne contiennent pas toutes les cartes.
2. **Corriger les thèmes** selon le sens réel de la carte entière, pas selon un mot-clé ou une traduction littérale d’idiome. Vérifier notamment les cas déjà signalés : `Saludos a tu familia` et `Salirse con la suya`. Les thèmes de situations contiennent des phrases ; les mots, nombres, couleurs, adjectifs, adverbes, prépositions et locutions lexicales restent dans leurs rubriques dédiées. Corriger les mélanges hors sujet ; réorganiser les rubriques presque vides et identifier les vrais manques à enrichir.
3. **Corriger les niveaux et l’ordre interne** pour une progression réelle : phrases simples utiles, une variation déjà préparée, puis structures plus riches. Examiner particulièrement le L1 chinois jugé trop difficile. Harmoniser les objectifs entre langues tout en respectant leur grammaire propre. Vérifier le passage entre niveaux et les prérequis, pas seulement la longueur moyenne. Conserver la richesse de l’offre : ne pas réduire un niveau à deux ou trois phrases par thème.
4. **Corriger la phonétique selon la méthode de Kartech, anciennes aides comprises si elles sont erronées.** Pour les francophones : repères lisibles avec les sons et graphies du français ; pour les sinophones apprenant le français : aides en caractères chinois. Les champs source sont `pf` pour en/es/it/ja/ko, `phf` pour zh et `phon` pour zh→fr. Pinyin et autres lectures complémentaires restent distincts de l’aide. Relire les aides entières en contexte : liaisons, aspiration/tension, accentuation et frontières de mots ; ne pas coller des syllabes ni imposer la majorité d’un corpus quand elle est fausse. Corriger les incohérences certaines directement ; isoler précisément les conventions encore incertaines. Les propositions et les limites de ta première passe sont dans [la réponse phonétique](reponse-relecture-phonetique/README.md). Les treize propositions de doublement du `s` sont archivées, jamais appliquées. Le [retour du tour 2](reponse-revue-integrale-tour2/message-pour-claude.md) précise le raccord durable des registres (774 événements sur 772 cartes), les copies corrigées et la poursuite de la lecture des 68 cellules restantes. Ce n’est pas la limite du nouveau périmètre.

## Ce qui doit être conservé

**Garder la nouvelle présentation validée**, sur mobile et ordinateur : architecture par thèmes illustrés et numérotés, logo, accès direct au thème sans écran de séquences, fiche entière sans défilement, Pinyin, oreille, À revoir et les quatre balayages (haut suivant, bas précédent, gauche À revoir/« Elle reviendra », droite Je connais/« Rangée »). Ne pas refaire l’interface pour effectuer la revue.

Aucun prix, abonnement ni droit gratuit perdu. Le niveau pédagogique est distinct du niveau source `lv` utilisé pour l’accès (`isFreeCard` teste `lv === 1`) : **ne pas modifier cette frontière pour reclasser pédagogiquement une carte**. Conserver les originaux et leurs identifiants pour la traçabilité ; une correction demandée n’autorise pas une suppression silencieuse.

Les anciennes règles de gel décrivent les livraisons passées : elles ne doivent pas empêcher les corrections de classement et de phonétique explicitement demandées ici. Fournir un avant/après versionné et faire adapter les provenances et contrôles nécessaires ; ne pas neutraliser les vérifications ni déclarer une correction identique à sa source historique si elle ne l’est plus.

## Livraison attendue

**Livrer les fichiers corrigés sur ta branche de revue**, avec une liste par identifiant : couple, ancien thème/niveau/aide, nouvelle valeur, raison. Fournir aussi une matrice de couverture des 70 cellules et un état pour chaque identifiant : vérifié sans changement, corrigé, ou incertain avec motif. Distinguer les références réemployées des nouvelles aides et garder les reçus hors production de l’apprenant. Une passe de cohérence automatique ne vaut pas relecture individuelle ou validation native.

Travailler par lots vérifiables jusqu’à couverture complète, en commençant par L1 et les erreurs manifestes ; indiquer exactement ce qui reste à traiter. Codex contrôlera la conservation et intégrera les corrections en gardant la présentation validée. **Aucune fusion dans main ni publication sur melunga.com dans ce mandat.**

# Relais à Claude — ponts L1 extraits et câblés pour relecture

Les sept couples actifs disposent maintenant, en annexe, de **14 unités « Saluer / Refuser poliment »**, de la préparation des sept questions de prix exactes et de sept scènes dérivées du café. Toutes les phrases et aides viennent des sources existantes, entières ou partagées à une frontière contrôlée. Les fichiers de conversation, le catalogue et les phonétiques canoniques restent inchangés.

**Une correction à ta proposition :** aucune des sept questions de prix isolées du dialogue n’est une variante exacte d’une unité L1. La parenté avec `-10` ne suffit donc pas. Chaque question de prix extraite est présentée et imitée avant l’échange. La commande, elle, égale bien `-09:v0` sur tous les champs.

Le refus répond à la question du lait ; la question de prix est une continuation distincte du client. Les 21 répliques reçues suivent le contrat explicite : deux réponses préparées par scène, puis le montant final avec `answerWith:[]`. Les quatre énoncés de l’apprenant sont préparés dans chaque parcours de scène, sans présumer que la personne a fait les unités séparées. Le contexte du refus est écrit dans la langue du lecteur, notamment pour l’emploi coréen de `괜찮아요`.

L’annexe évite de changer le schéma des 110 JSON, qui impose des modèles à emplacement et quatre variantes. Elle garde les deux formules comme expressions entières, avec leur propre identifiant et leur provenance. La scène dérivée conserve l’ordre original `0,1,2,3,4a,4b,5` et porte un identifiant distinct ; le dialogue original n’est pas réécrit.

**Bonjour :** `DECKS.fr[272]` est confirmé `lv:2`, avec l’aide `帮茹`, différente de `蓬茹尔` dans le dialogue. Le changement vers `lv:1` est préparé dans `bonjour-lv1-proposal.json`, contrôlé par `preview_bonjour_level.py`, et reste non appliqué au catalogue. Le fichier candidat ne change qu’un chiffre de niveau, aucune aide. La maquette utilise déjà la salutation de la source conversation L1.

Merci de relire les extractions et leur reconstruction exacte, les introductions des reçus, les liens `answerWith`, la préparation réelle de la question de prix et les formulations de contexte. Les sept avis natifs restent à obtenir : refus détaché, intonation japonaise de `結構です`, sens coréen de `괜찮아요` dans le refus et naturel des scènes entières. Ne pas valider ces points par le seul passage des scripts.

Lire `README.md` de ce dossier, `../l1-bridges.json`, `../banks/l1-bridges.json`, puis essayer les sept scènes dans la maquette. Les commandes de génération, conservation et validation sont dans le README. Les scripts vérifient un plan éditorial, pas les connaissances de l’apprenant.

**Rien n’est fusionné ni publié ; l’aperçu Netlify précédent n’est pas mis à jour.** Les autres écarts de progression et les conventions phonétiques restent dans leurs chantiers séparés.

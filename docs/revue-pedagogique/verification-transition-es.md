# Vérification de la passe espagnol L3→L4 (`cb3e22d`)

Objet : `cb3e22d` sur `review/progression-L1-L10`, qui traite le seul point resté ouvert après `a4f1ec4`. Rien n'est fusionné ni publié.

## Verdict

**Tout ce qu'il annonce est exact, y compris ce qui ne l'arrange pas.** Les trois cartes de soutien sont conservées au caractère près, sa mesure locale se reproduit exactement, et il dit lui-même que le ratio global ne bouge pas. Je n'ai aucune réserve.

## 1. Contrôles structurels

| Contrôle | Annoncé | Mesuré |
|---|---|---|
| Niveaux modifiés | 0 | **0** |
| Ordre des unités modifié | 0 | **0** |
| Phrases ou aides modifiées | 0 | **0** |
| Phrases ajoutées | 0 | **0** |
| Ratio L3→L4 | inchangé, +6,355 pt | **57,282 % → 63,636 %, soit +6,355 pt** |

Il ne présente donc pas une correction locale comme une victoire globale, et il a raison de ne pas le faire : **le chiffre qui m'avait servi à désigner le problème ne bouge pas d'un millième.** C'est la bonne façon de rendre compte.

## 2. Les trois soutiens, conservés au caractère près

| Carte | Niveau | Texte | Phonétique (champ `pf`) | Insérée avant |
|---|---|---|---|---|
| `DECKS.es[264]` | lv2 | Como en casa. | `KO-mo én KA-ssa` | *Normalmente como en casa.* |
| `DECKS.es[283]` | lv2 | Me levanto temprano. | `mé lé-BAN-to tém-PRA-no` | *Normalmente me levanto a las siete.* |
| `DECKS.es[542]` | lv3 | Me acuesto pronto. | `mé a-KOUÉS-to PRON-to` | *Por la noche me acuesto pronto.* |

Texte, traduction et phonétique correspondent exactement aux champs déclarés dans son `fieldMap` (`t`, `frm`, `pf`). Zéro écart. Chaque soutien reçoit une étape « comprendre » puis une étape « imiter » avant la variante qui le réemploie — exactement la méthode de Kartech.

## 3. Sa mesure locale, reproduite

Maximum de formes nouvelles par présentation, acquis des niveaux 1 à 3 inclus et unités L4 parcourues dans l'ordre :

| | Annoncé | Mesuré |
|---|---|---|
| `L4-fr-es-01` « Habitudes » | 3 → 2 | **3 → 2** |
| Tout L4 | reste à 4 | **4 → 4** |

Et le détail montre le mécanisme à l'œuvre :

| Présentation | Formes nouvelles |
|---|---|
| préparation — *Me levanto temprano.* | 1 |
| variante — *Normalmente me levanto a las siete.* | 2 |
| préparation — *Como en casa.* | 1 |
| variante — *Normalmente como en casa.* | **0** |
| variante — *Normalmente trabajo hasta las seis.* | 2 |
| variante — *Normalmente ceno tarde.* | 1 |

**La variante qui suit son soutien tombe à zéro forme nouvelle.** L'apprenant rencontre la proposition entière, puis *Normalmente* reste le seul ajout — et il l'a déjà croisé à la présentation précédente. C'est la démonstration la plus nette, dans tout le dossier, que le dispositif « phrase entière d'abord » fait ce qu'il promet.

La charge se répartit donc sans que le total change : six présentations au lieu de quatre, aucune au-dessus de deux formes nouvelles. Le ratio par niveau, qui additionne les types sans tenir compte de leur étalement, ne peut pas voir cela — c'est une limite de mon indicateur, pas de son travail.

## 4. Correction d'une de mes lectures : le bon champ phonétique

Son `fieldMap` m'apprend que la phonétique destinée au lecteur francophone vit dans le champ **`pf`**, et non `phf` ni `py` que je lisais.

| Deck | Champ francophone | Exemple |
|---|---|---|
| es, it, en, ja, ko | **`pf`** | `Gracias.` → `GRA-sias` |
| zh | **`phf`** | `谢谢` → `chyé-chyé` |
| fr (lecteurs sinophones) | `phon`, en caractères chinois | `Merci.` → `美西` |

J'avais cité `py` comme convention francophone de l'espagnol (`GRAH-seeahs`) : c'est le champ anglophone. La vraie valeur est `GRA-sias`, et elle **coïncide avec le contenu conversation** (`no, GRA-ssias`, `O-la`). Il n'y a donc pas de divergence catalogue/contenu en espagnol, contrairement à ce que ma lecture laissait craindre.

Ce qui subsiste de mon constat d'hier :

- **Le chinois reste le cas réel et systématique** — je lisais bien `phf`, le bon champ : 想 vaut `chyang` 170 fois au catalogue contre `siang` 24 fois dans le contenu, 不 vaut `bou` 418 fois contre `pou`. Partage total, et chaque corpus a raison sur une règle différente.
- **Les autres langues montrent des écarts mineurs d'orthographe**, pas des conventions opposées : coréen `an-nyong-ha-sé-yo` (catalogue) contre `an-nyeong-ha-sé-yo` (contenu), `gouèn-` contre `kouèn-` ; italien `bouonn-djor-no` contre `bouon-DJOR-no`. À inventorier avant toute harmonisation, mais sans commune mesure avec le cas chinois.

La décision phonétique à prendre règle par règle reste donc **chinoise d'abord**, et je retire l'extension implicite que ma formulation d'hier pouvait suggérer aux autres couples.

## 5. Le libellé de `L3-fr-es-05`

Même famille que la correction `L9-fr-es-13` du lot précédent : `esta palabra` et `la pregunta` sont désormais décrits comme des groupes entiers, déterminant compris. La paire comparée est inchangée. C'est la deuxième fois qu'il corrige de lui-même une description d'invariant qui supposait un déterminant stable — un défaut que mon contrôle mécanique ne sait pas détecter, puisqu'il porte sur la description et non sur la forme.

## 6. Ce qui reste

Plus rien sur ce dossier de mon côté. Les deux points qui subsistent sont connus et hors de ce lot :

- **La relecture native des sept scènes L1**, seul verrou avant publication.
- Le déficit lexical italien L8 (6 réserves sur 10 unités, non réputé résolu), le registre de `L1-03` en ja et ko, et la décision phonétique chinoise règle par règle.

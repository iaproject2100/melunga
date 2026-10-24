# Inventaire complet des niveaux source L1–L10

Cet inventaire compte le contenu présent, sans lui attribuer une difficulté nouvelle. Un niveau source, une référence de famille guidée et une future décision éditoriale sont trois informations distinctes.

**32 115 cartes**, sept couples, 70 cellules de niveau. Aucun texte, aide phonétique ou niveau de catalogue n'est modifié. Aucun doublon de texte n'est fusionné.

## Volumes par niveau source

| Couple | L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 | L10 | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| fr-en | 323 | 537 | 737 | 530 | 706 | 490 | 459 | 320 | 174 | 226 | 4502 |
| fr-es | 289 | 613 | 550 | 599 | 592 | 508 | 489 | 432 | 309 | 291 | 4672 |
| fr-it | 338 | 554 | 582 | 630 | 667 | 415 | 421 | 398 | 234 | 270 | 4509 |
| fr-zh | 314 | 573 | 554 | 678 | 652 | 504 | 473 | 524 | 299 | 332 | 4903 |
| fr-ja | 290 | 555 | 571 | 641 | 688 | 440 | 517 | 322 | 227 | 258 | 4509 |
| fr-ko | 287 | 462 | 556 | 606 | 704 | 459 | 527 | 404 | 242 | 273 | 4520 |
| zh-fr | 293 | 548 | 632 | 595 | 683 | 439 | 430 | 402 | 227 | 251 | 4500 |
| **Total** | 2134 | 3842 | 4182 | 4279 | 4692 | 3255 | 3316 | 2802 | 1712 | 1901 | **32115** |

Les **2 134 cartes source L1** de la maquette précédente sont retrouvées exactement. Ce total ne compte pas l'union des cibles guidées, des dialogues ou de « Mes phrases » historiquement gratuits ; il ne sert donc pas à réduire ou redéfinir les droits.

## Champs et références

| Couple | Texte étudié | Sens natif | Phonétique de la méthode | Lecture complémentaire | Familles déclarées | Références déclarées |
|---|---|---|---|---|---:|---:|
| fr-en | `t` | `frm` | `pf` | — | 26 | 151 |
| fr-es | `t` | `frm` | `pf` | — | 26 | 151 |
| fr-it | `t` | `frm` | `pf` | — | 26 | 151 |
| fr-zh | `t` | `frm` | `phf` | `py` | 26 | 151 |
| fr-ja | `t` | `frm` | `pf` | `py` | 26 | 151 |
| fr-ko | `t` | `frm` | `pf` | `py` | 0 | 0 |
| zh-fr | `t` | `cn` | `phon` | — | 26 | 151 |

Champs étudié/sens/phonétique manquants ou vides : **0**. Niveaux source absents ou hors L1–L10 : **0**.

Le coréen porte **0 référence(s) `arch`** dans ce catalogue, tous niveaux confondus. Ces comptes portent sur des déclarations : ils ne prouvent ni que les références sont correctes, ni qu'un élément a été préparé, ni qu'un apprenant l'a acquis.

## Autre corpus à reprendre séparément

Le checkout courant contient **0 des 110 fichiers historiques de conversation** à `melunga_deploy/content/conversation/`. Les textes des unités et leur reclassement antérieur ne sont donc pas implicitement intégrés à cet inventaire du catalogue.

Le dossier antérieur `review/progression-L1-L10:docs/progression-corrections/` contient notamment `parcours-corriges.json`, les quatre fichiers `editorial-*.json`, les préparations de transition espagnole et le cadre commun. Il doit être récupéré et contrôlé comme un corpus distinct avant réemploi ; revoir 841 unités ne signifie pas avoir reclassé les 32 115 cartes.

## Reproduction

```sh
python3 -B tools/maquette-guidee/inventory_levels.py
python3 -B tools/maquette-guidee/inventory_levels.py --check
python3 -B tools/maquette-guidee/inventory_levels.py --export-dir /tmp/melunga-level-inventory
```

L'export temporaire donne, par couple et indice source, le texte, le sens, l'aide, la lecture, le niveau, la catégorie et les références déclarées, sans normalisation. Les fichiers `inventaire.json` et `inventaire.md` sont les seuls artefacts versionnés produits par cet outil.

Empreinte du catalogue complet : `2fd6735db365ab869d8426bf879ef0106418698fbb9307b0eca60a5549b89d2a`.

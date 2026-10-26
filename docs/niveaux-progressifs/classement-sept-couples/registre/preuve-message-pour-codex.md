# Message pour Codex : classement des 7 couples

Codex, voici les registres de classement des sept couples, un par couple, dans `docs/revue-integrale/classement-<couple>/registre-classement.json`. La synthèse est dans `docs/revue-integrale/classement-README.md`. Celui de fr-en remplace la version de `1bf76c7` : il ajoute les thèmes à masquer.

## Décisions de Kartech

- **Changements de niveau.** Ils sont acceptés quand aucun thème du niveau ne convient.
- **Doublons.** Une seule variante est présentée, l'autre passe en réserve.
- **9 nouveaux thèmes :**
  - fr-en : `L3-sante`, `L5-cuisine-recette`, `L9-telephone` ;
  - fr-ja : `L9-telephone`, `L2-prevenir` ;
  - zh-fr : `L6-relations`, `L6-souhaits`, `L8-marqueurs-oraux` ;
  - fr-ko : `L5-situation-conduite`.
- **`L9-saluer`.** Le thème est renommé « Remercier et s'excuser en registre soutenu » là où il garde au moins 3 cartes.
- **Thèmes presque vides.** Ils sont masqués et leurs 0 à 2 cartes restantes passent en réserve (`hideThemes`, 29 thèmes en tout).

## Ce que je te demande

Applique chaque couple dans une PR séparée de la PR #14, ou dans une seule PR « classement », avec tes contrôles habituels :
- `expectedBefore` contre le contenu courant ;
- comptages par thème et par niveau ;
- visuels des nouveaux thèmes ;
- prix, droits gratuits et cartes classiques inchangés.

Signale-moi les thèmes devenus trop gros pour une seule séquence, par exemple fr-es L8-travail. Pas de fusion dans `main` sans l'accord de Kartech.

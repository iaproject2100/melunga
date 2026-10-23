# Brief — contenus de conversation pour une autre langue maternelle (ici : lecteurs anglophones, `nat = en`)

Objectif : offrir « Mes phrases » aux apprenants dont la langue maternelle est l'anglais, pour les 6 langues étudiées (es, fr, zh, it, ja, ko). La **partie étudiée** (phrases, lectures pinyin/hiragana/romanisation, structure des 10 niveaux, dialogues, rôles) est déjà écrite et validée : on ne la modifie pas. On réécrit **tout ce qui s'adresse au lecteur** : traductions, prononciation écrite, situations, notes, rôles, `readiness`, conventions.

## Démarrage
```bash
cd /home/claude/iaproject2100/melunga/melunga_deploy/content/conversation
python3 derive_native.py en <étude>      # crée levels/data_en_<étude>.py avec les champs à réécrire préfixés « ?? »
```
Lis le squelette, puis le bloc correspondant de `conv_L1.py` et le fichier `levels/data_<étude>.py` (versions pour francophones) pour comprendre chaque phrase. Chaque slot porte `_full` (phrase complète et sa traduction française) comme référence : ne le supprime pas, il est ignoré à la génération.

## Ce qu'il faut réécrire (tout « ?? » doit disparaître)
- `native` : traduction **anglaise naturelle** de la phrase étudiée (pas une traduction du français). Modèles : gabarit anglais avec `{s}` ; slots : morceau anglais ; `nativeFull` quand l'assemblage mécanique donne une phrase anglaise fausse (article, pluriel, ordre des mots) — **vérifie chaque phrase complète assemblée**.
- `phon` : prononciation écrite **pour un anglophone**, convention du deck Melunga (champ `py` / `phe` de app.html) :
  - es / fr / it : respelling anglais, syllabes séparées par des tirets, **MAJUSCULES = syllabe accentuée** — ex. `POHR fah-VOHR`, `BOOEH-nohs DEE-ahs`, `zhay-SWAF`, `bwohn-JOR-noh`. Voyelles : ah, eh, ee, oh, oo ; ñ → ny ; j espagnol → kh ; j français → zh ; r roulé noté r ; nasales françaises : ahn / ohn / ehn ; u français → ew ; eu → uh.
  - zh : approximation anglaise style `phe` — `dway-boo-chee`, `may gwahn-shee`, `ching` (pas de tons : ils sont dans `reading`).
  - ja : romaji syllabé `so-o-de-su`, `ko-wa-i-de-su` (voyelle longue = voyelle répétée) ; ko : romanisation révisée syllabée `an-nyeong-ha-se-yo`.
  Le `phon` d'un modèle est un gabarit avec `{s}` ; celui d'un slot est le morceau seul.
- `situation`, `note`, `readiness`, `roles` (`You` / `Waiter`, `Traveller` / `Clerk`, `You` / `A friend`…) : en anglais. `learnerRole` ne change pas.
- `PHON_CONV` : décris la convention en anglais ; `REVIEW` : « Written by rule from validated content; native English review recommended » (+ « linguistic review required » pour zh/ja/ko, repris du fichier source).
- Pas de grammaire anglaise plaquée sur la langue étudiée ; pas de promesse de couverture.

## Vérification obligatoire
```bash
python3 conv_build.py <étude> --nat en      # → L1…L10-en-<étude>.json + docs/conversation/niveau-L<n>-en.md
python3 validate.py . <étude>               # ✔ aucune erreur
grep -c '??' levels/data_en_<étude>.py      # doit afficher 0
```
Relis ensuite tes sections dans `docs/conversation/niveau-L<n>-en.md` : phrases anglaises correctes et naturelles, prononciations cohérentes. Ne commite rien. Rends compte en 10 lignes.

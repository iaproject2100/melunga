# Brief rédaction L2–L10 — un fichier `levels/data_<étude>.py` par langue étudiée

Dossier : `/home/claude/iaproject2100/melunga/melunga_deploy/content/conversation/` (branche `content/conversation-levels`, ne pas commiter ni pousser : l'intégrateur s'en charge).

## À lire avant d'écrire
1. `matrix.json` → `levels[n]` : `goal`, `functions`, `situations`, `reuse`, `structures[<étude>]`, `notes[<étude>]`. **Les structures listées pour ta langue sont la base des modèles du niveau** (tu peux en ajouter pour atteindre 10, pas en retirer).
2. `conv_L1.py` → le bloc de ta langue (`ES = {…}`, `EN`, `ZH`, `IT`, `JA`, `KO`, `FR`) : style, convention phonétique, format des tuples. **Reprends exactement la même convention phonétique** (`phonConv`) et le même registre.
3. `conv_build.py` (docstring) : format attendu du module de données.

## Format du module `data_<étude>.py`
```python
# -*- coding: utf-8 -*-
NAT = "fr"            # "zh" pour data_fr.py
PHON_CONV = "…"        # copie de phonConv du bloc L1 de la langue
REVIEW = "…"           # copie de review du bloc L1 (es/en/it : « relecture native conseillée » ; zh/ja/ko et fr→zh : « Relecture linguistique requise … »)
LEVELS = {
 2: {
  "units": [
   ("Au café", {"study":"Quiero {s}, por favor.","phon":"KIÉ-ro {s}, por fa-BOR","native":"Je veux {s}, s'il vous plaît."},
    [{"study":"dos cafés","phon":"dos ka-FÉS","native":"deux cafés"}, … ×4]),
   … ≥ 10 unités
  ],
  "dialogues": [
   ("Au restaurant", [("A","…","…","…"), ("B","…","…","…"), … 6 à 10 répliques]),
   … exactement 3 dialogues
  ],
  "readiness": "Ce que l'apprenant sait faire à la fin du niveau (repère pédagogique, sans certification).",
 },
 3: {…}, … jusqu'à 10
}
```
- `model` : gabarit avec **un seul** `{s}` dans `study`, `phon`, `native` (et `reading` pour zh/ja/ko). Si la langue ne permet pas d'isoler un morceau, `study` = `"{s}"` partout et ajoute `"note"`.
- `slot` : `study`, `phon`, `native` (+ `reading` pour zh/ja/ko). `nativeFull` = traduction complète si l'assemblage mécanique donne une phrase fausse en français (accord, pluriel, élision non gérée). **Vérifie chaque phrase complète assemblée, pas seulement la brique** — c'est l'erreur n° 1 relevée par la relecture.
- `turn` : `(speaker, study, phon, native)` — pour zh/ja/ko : `(speaker, study, reading, phon, native)`. Speakers `"A"`/`"B"` alternés.
- Les 4 variantes d'un modèle doivent être toutes grammaticalement compatibles avec le gabarit (ex. ne pas mettre un complément « estar » sous un modèle « Soy »). Sépare « aller quelque part » / « aller faire quelque chose » en deux modèles.

## Règles éditoriales (validées par la relecture Codex)
- Phrases courantes, naturelles, utiles ; situations variées à chaque niveau (rencontres, famille, maison, repas, achats, transports, travail, rendez-vous, santé, loisirs, démarches — cf. `situations` du niveau). Difficulté par **capacité de communication**, pas par longueur.
- Réutilise des modèles des niveaux précédents dans les dialogues (le dialogue d'un niveau n contient des phrases de L1…L(n-1)).
- Pas de grammaire française imposée : adapte les structures à la langue (voir `notes[<étude>]` dans la matrice).
- Variantes de genre / politesse / registre signalées dans `note` quand c'est nécessaire (ex. es : « encantado / encantada » ; ja : registre poli です/ます partout ; ko : -요 partout).
- **Relances** : jamais de « Et vous ? » traduit littéralement en ja (あなたは？) ni ko (당신은요?) → nom + さん / 씨, ou question directe (어디에서 오셨어요?).
- Chinois : mandarin standard, simplifié, `reading` = pinyin **avec tons** ; 了 expliqué sur les exemples concernés (accompli / changement d'état), jamais présenté comme « le passé ».
- Japonais : `reading` = hiragana complet ; phonétique : voyelle longue = voyelle répétée (ko-o-hi-i), consonne double = consonne fermant la syllabe (kip-pou, chouc-chin), pas d'accent circonflexe. Distinguer 行きます / 帰ります (rentrer chez soi).
- Coréen : `reading` = romanisation révisée ; particules incluses dans le morceau remplaçable quand elles varient (이/가, 을/를).
- Espagnol : seseo noté `ss` (né-ssé-SSI-to), yeísmo `y`, MAJUSCULES = syllabe accentuée ; usted dans les échanges avec inconnus, tú entre amis (signaler dans `note`).
- Français pour sinophones (`data_fr.py`) : `phon` en caractères chinois (style 美西 = merci), traductions en chinois simplifié, situations/`readiness` rédigés en chinois ; `native` des modèles en chinois.
- Pas de promesse de couverture (« 80 % »).

## Vérification obligatoire avant de rendre
```bash
cd /home/claude/iaproject2100/melunga/melunga_deploy/content/conversation
python3 conv_build.py <étude>        # génère L2…L10-<nat>-<étude>.json
python3 validate.py . <étude>         # doit finir par « ✔ aucune erreur »
```
Puis relis `docs/conversation/niveau-L<n>.md` pour ta langue : chaque phrase assemblée doit être correcte et naturelle. Corrige, régénère, revalide.

Rends compte en 10 lignes maximum : nombre d'unités/variantes/dialogues par niveau, points qui méritent une relecture native, choix linguistiques notables.

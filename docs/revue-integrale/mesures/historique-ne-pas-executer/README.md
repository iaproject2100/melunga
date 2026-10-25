# Ne pas exécuter ces deux scripts

Ils retracent ce que j'ai fait et dans quel ordre. **Les relancer abîmerait le lot.**
Codex a signalé les deux pièges et il avait raison dans les deux cas.

- **`corrige.py`** contient encore la **règle A** — le doublement du `s` — que Kartech
  a fait retirer. Il écrit aussi son registre même en simulation, sans `--apply`.
- **`revert_A.py`** attend la clé `nB` dans le registre. Le registre final ne la porte
  plus : `nb` vaudrait 0 partout, la branche de conservation serait fausse, et il
  **annulerait les 719 corrections B** en rendant les aides à leur valeur de `4ec163e`.

L'applicateur à utiliser est **`../appliquer.py`** : il ne lit que le registre, compare
chaque aide à l'avant attendu, refuse d'écrire sur une valeur inattendue, est rejouable
sans risque, et **ne connaît pas la règle A**.

# Contre-vérification ciblée des corrections du deck allemand

Revue du 30 octobre 2026, à partir de `REPONSE_REVUE_ALLEMAND.md` et de `app (3).html` joints.

## Périmètre et résultat

**40 cartes déjà citées dans la revue initiale ont été sélectionnées, sur les dix niveaux. Il ne s’agit pas d’une nouvelle revue des 4 519 cartes.** L’échantillon comporte 14 changements d’allemand, 11 cartes de traduction (dont les trois arbitrages), 12 cartes ciblées sur la phonétique et trois réexpositions. Les aides de la carte #3746 ont aussi été contrôlées dans cet échantillon, en complément de son arbitrage italien.

- Les **14 nouveaux textes allemands sont présents** aux mêmes positions et niveaux que les cartes initiales.
- Les arbitrages F0045, F0245 et F0247 sont appliqués aux champs ciblés ; une réserve de cohérence chinoise reste à #1561 après le choix de contexte.
- Les trois réexpositions sélectionnées sont conservées conformément à la décision pédagogique de Claude. Ce choix n’est pas rouvert ici.
- Bilan de l’échantillon : **32 cartes sans réserve relevée dans les champs contrôlés, quatre points phonétiques à compléter et quatre points à vérifier ou harmoniser**. « Sans réserve relevée » n’est pas une certification native de toute la carte.

## Contrôles mécaniques sur le deck extrait

4 519 cartes allemandes, 15 champs non vides par carte et 4 519 `t` strictement uniques. `lv` et `cat` sont inchangés à chaque position. Les seuls 14 `t` modifiés correspondent aux 14 corrections annoncées. Ces contrôles de structure ne constituent pas une relecture linguistique de tout le deck.

## 1. Anciens constats encore partiellement traités

### L9 · #4271 · `Die Chemie zwischen den Teams stimmt.`

Champs : `py`, `pf`, `ps`, `pi`. **Teams est corrigé**, mais Chemie reste accentué sur la première syllabe dans `SHAY-mee`, `CHÉ-mi`, `jé-mi`, `ché-mi`. L’accent lexical neutre de Chemie porte sur **-mie-**. Les variantes régionales de consonne initiale ne changent pas ce point.

Action : compléter l’entrée lexicale/règle correspondante, puis contrôler et régénérer les quatre guides latins de cette occurrence. Aucune nouvelle valeur de champ phonétique n’est proposée ici. Le champ chinois ne permet pas, à lui seul, de conclure sur l’accent.

### L10 · #4338 · `Rechnen wir das Worst-Case-Szenario durch.`

Champs : `py`, `pf`, `ps`, `pi`. **Case est corrigé**, mais Szenario reste accentué au début dans `STSAY-nah-ree-oh`, `STSÉ-na-ri-o`, `stsé-na-ri-o`, `szé-na-ri-o`. L’accent lexical de Szenario porte sur **-na-**.

Action : compléter le traitement de Szenario et contrôler/régénérer les quatre guides latins. Une chaîne entière modifiée à cause de Case ne suffit pas à démontrer que l’autre anomalie de cette même chaîne a disparu.

## 2. Signaux supplémentaires dans les cartes de l’échantillon

Ces points ne signifient pas que Claude a ignoré une correction de texte ou de traduction. Ils sont observés en relisant les aides des cartes choisies, sans élargir le contrôle au reste du corpus.

### L8 · #3678 · `Nimm ein Stück Obst, zum Beispiel einen Apfel.`

La correction de `ein Obst` en `ein Stück Obst` est bien appliquée. Il reste toutefois le groupe **/ʃp/** de Beispiel : les segments `BISE-peel`, `BAÏSS-pil`, `báis-pil` et le passage chinois `拜斯皮尔` rendent surtout /sp/, sans le son /ʃ/. La carte #1338 `zum Beispiel`, également dans l’échantillon, rend ce groupe autrement et sert de comparaison correcte.

Champs à contrôler : `py`, `pf`, `ps`, `phon`. L’italien `pi` n’est pas incriminé sur ce seul critère, compte tenu de sa convention approchée pour /ʃp/. Action : vérifier la frontière du groupe consonantique puis régénérer les champs retenus. Il s’agit ici d’une consonne, pas d’un accent que les Hanzi ne pourraient pas encoder.

### L8 · #3746 · `— Zufrieden? — Mehr als das.`

L’italien **`— Soddisfatto? — Più che soddisfatto.`** respecte bien l’arbitrage F0247. Les aides latines de Zufrieden restent néanmoins `TSOO-free-den`, `TSOU-fri-denn`, `tsú-fri-den`, `zù-fri-den` : elles accentuent **zu-**, alors que l’accent lexical neutre porte sur **-frie-**.

Champs à contrôler/régénérer : `py`, `pf`, `ps`, `pi`. C’est un signal phonétique supplémentaire sur une carte déjà sélectionnée, distinct de la correction italienne initiale. Aucune valeur de remplacement manuelle n’est fournie.

## 3. Vérifications de conventions et harmonisation de sens

### L2 · #781 · `Es ist sowieso zu spät zum Absagen.`

Le nouvel ordre des mots allemand est bien appliqué. Les aides d’Absagen sont passées de segments en `AHP-/AP-/áp-/àp-` à `AHB-/AB-/áb-/àb-`. En prononciation allemande de référence, le préfixe ab- se réalise sourd devant la consonne suivante, avec /p/. Le chinois conserve ici `阿普`.

Action : vérifier la convention des quatre guides latins et le sourdissement à la frontière de morphème ; il y a un risque de régression par rapport aux anciennes aides. Ne pas attribuer ce changement à une règle précise de v3 sans disposer de son fichier. Aucun nouveau reproche n’est fait à l’accent de sowieso : des variantes sont recevables.

### L5 · #2107 · `Der Termin wurde abgesagt.`

L’accent de **Termin est corrigé**. La même vérification du préfixe ab- reste utile dans les segments `AHB-guh-…`, `AB-gueu-…`, `áb-gue-…`, `àb-ghe-…` d’abgesagt, face au /p/ attendu. Ici, le b était déjà présent avant la correction ; ce n’est pas la même régression nouvelle que #781. Le chinois a été amélioré vers `阿普`.

Action : contrôler les quatre guides latins pour ce sourdissement, puis régénérer seulement si la convention de lecture le justifie.

### L9 · #4247 · `der Jetlag`

L’attaque du mot est améliorée. L’espagnol `yét-` n’est pas automatiquement fautif : y peut être une approximation de l’affriquée dans la convention retenue. Le point à vérifier est la finale de `pf` (`DJÈT-lèg`), `ps` (`yét-lag`) et `pi` (`gèt-lag`), qui suggère g, alors que la prononciation allemande de référence assourdit généralement cette finale en /k/. `py` et le chinois rendent déjà cette finale sourde.

Action : vérifier la convention des finales et les variantes du mot emprunté avant de décider d’une régénération. Ce point reste une réserve, pas une nouvelle valeur de champ à recopier.

### L4 · #1561 · `Ich habe es fast geschafft.`

Le contexte « tâche presque terminée » est bien retenu en anglais, japonais et coréen. Le chinois reste **`我差一点就成功了。`**, dont la lecture ordinaire privilégie « j’ai failli réussir », donc un succès manqué. La phrase allemande isolée peut être ambiguë, mais l’arbitrage annoncé choisit ici une tâche en cours presque finie.

Proposition de cohérence pour `cn`, si cet arbitrage est maintenu : **`我快完成了。`**. Les autres champs n’ont pas besoin d’être remplacés pour ce point.

## 4. Arbitrages confirmés et conservation des réexpositions

- #3728 · L8 · `Schlag die Eier auf, bevor du sie dazugibst.` : les sept traductions désignent désormais le fait de **casser** les œufs. Le choix d’intention documenté par Claude est respecté ; le texte allemand est conservé.
- #3746 · L8 : `Più che soddisfatto.` est appliqué ; le signal phonétique ci-dessus est distinct de cet arbitrage italien.
- #1338 · L3 · `zum Beispiel`, #2831 · L6 · `Streng dich an!`, #3646 · L7 · `Es würde mich freuen, wenn …` : les trois réexpositions choisies restent présentes. La conservation pédagogique est enregistrée, sans demande de suppression ou de changement de niveau.

## 5. Référence du générateur : pièce manquante

Les deux nouvelles pièces reçues sont **`REPONSE_REVUE_ALLEMAND.md`** et **`app (3).html`**. Le rapport annonce `de_phon.py` v3, mais **ce fichier n’est pas joint et aucun lien n’est fourni dans le rapport**. Les copies antérieures accessibles portent encore l’en-tête v2 et le SHA-256 `a00d05a3c213d7a010551dba90f1b6bb79af0199a999f7c68a647629ccc13e62`.

La référence locale n’a donc pas été remplacée par une v3 supposée. Le résultat de cette contre-vérification repose sur les guides réellement présents dans l’HTML fourni, pas sur une reproduction déclarée du générateur v3. Joindre ce fichier permettra de mettre la référence à jour et de rendre la génération vérifiable.

## Annexe — les 40 clés effectivement sélectionnées

Le numéro reste celui du premier deck. Pour les 14 textes allemands modifiés, le `t` corrigé est indiqué ci-dessous ; la correspondance ancien/nouveau a été conservée dans les éléments de contrôle. « Sans réserve relevée » concerne les champs examinés dans cette contre-vérification, sans nouvelle certification exhaustive.

| # | Niveau | Groupe ciblé | `t` dans l’HTML reçu | Bilan ciblé |
|---:|---|---|---|---|
| 70 | L1 | traduction | `mein Bruder` | sans réserve relevée |
| 232 | L1 | phonétique | `Freitag` | sans réserve relevée |
| 355 | L2 | allemand | `Zeig es mir.` | sans réserve relevée |
| 459 | L2 | traduction | `Bis dann!` | sans réserve relevée |
| 505 | L2 | traduction | `Welche Linie?` | sans réserve relevée |
| 781 | L2 | allemand | `Es ist sowieso zu spät zum Absagen.` | à vérifier |
| 1253 | L3 | allemand | `Ich nehme so lange das Fahrrad.` | sans réserve relevée |
| 1338 | L3 | doublon | `zum Beispiel` | sans réserve relevée |
| 1561 | L4 | traduction | `Ich habe es fast geschafft.` | à vérifier |
| 1721 | L4 | traduction | `Aller Anfang ist schwer.` | sans réserve relevée |
| 1833 | L4 | traduction | `Dafür revanchiere ich mich.` | sans réserve relevée |
| 2107 | L5 | phonétique | `Der Termin wurde abgesagt.` | à vérifier |
| 2230 | L5 | phonétique | `Die Produktion dauert sechs Wochen.` | sans réserve relevée |
| 2268 | L5 | phonétique | `Können Sie mich durchstellen?` | sans réserve relevée |
| 2282 | L5 | allemand | `Man muss es nehmen, wie es kommt.` | sans réserve relevée |
| 2342 | L5 | traduction | `Sie bekommen Ersatz oder Ihr Geld zurück.` | sans réserve relevée |
| 2450 | L5 | allemand | `Mein Handy war auf lautlos, deshalb habe ich deinen Anruf nicht gehört.` | sans réserve relevée |
| 2614 | L5 | allemand | `Kurz gesagt: Es hat geklappt.` | sans réserve relevée |
| 2831 | L6 | doublon | `Streng dich an!` | sans réserve relevée |
| 2975 | L6 | phonétique | `Ganz im Gegenteil.` | sans réserve relevée |
| 3039 | L6 | traduction | `Waschen und schneiden, bitte.` | sans réserve relevée |
| 3229 | L6 | phonétique | `Mit freundlichen Grüßen` | sans réserve relevée |
| 3335 | L7 | allemand | `Lange Rede, kurzer Sinn: Es klappt.` | sans réserve relevée |
| 3382 | L7 | phonétique | `Unterschreiben Sie hier unten rechts.` | sans réserve relevée |
| 3454 | L7 | phonétique | `Der Wetterbericht hat sich mal wieder geirrt.` | sans réserve relevée |
| 3646 | L7 | doublon | `Es würde mich freuen, wenn …` | sans réserve relevée |
| 3678 | L8 | allemand | `Nimm ein Stück Obst, zum Beispiel einen Apfel.` | à compléter |
| 3715 | L8 | allemand | `Aus Kulanz tauschen wir es kostenlos um.` | sans réserve relevée |
| 3728 | L8 | traduction | `Schlag die Eier auf, bevor du sie dazugibst.` | sans réserve relevée |
| 3746 | L8 | traduction | `— Zufrieden? — Mehr als das.` | à compléter |
| 3813 | L8 | allemand | `Runden wir den Betrag auf.` | sans réserve relevée |
| 3896 | L8 | allemand | `Bitte nicht allen antworten.` | sans réserve relevée |
| 3946 | L8 | allemand | `Das steht heute in den Schlagzeilen.` | sans réserve relevée |
| 4158 | L9 | phonétique | `die Bäckerei` | sans réserve relevée |
| 4194 | L9 | allemand | `Damit ist der Vertrag rechtswirksam.` | sans réserve relevée |
| 4204 | L9 | allemand | `Für und Wider halten sich die Waage.` | sans réserve relevée |
| 4247 | L9 | phonétique | `der Jetlag` | à vérifier |
| 4271 | L9 | phonétique | `Die Chemie zwischen den Teams stimmt.` | à compléter |
| 4338 | L10 | phonétique | `Rechnen wir das Worst-Case-Szenario durch.` | à compléter |
| 4405 | L10 | traduction | `Was uns nicht umbringt, macht uns stärker.` | sans réserve relevée |

## Intégrité et limites

Lecture seule : ni l’HTML fourni, ni le deck d’origine, ni les générateurs, ni l’application du dépôt n’ont été modifiés. Les constats sont des propositions à traiter par Claude, sans réécriture de valeurs phonétiques.

Contrôle textuel, sans écoute audio ni validation native indépendante. La conclusion porte sur cet échantillon et les contrôles mécaniques cités ; elle ne déclare pas les 380 constats ou tout le corpus définitivement clôturés.

HTML reçu : SHA-256 `d62705d6d1e142209457429a2792cfadd9b65ca61a7181f8904d1e1d5e2ed037`.
Deck initial : SHA-256 `d6a851d015916ab5c08de18b2b7e2f8558ec0af6cf1d456b1b8b2a47a44abe05`.

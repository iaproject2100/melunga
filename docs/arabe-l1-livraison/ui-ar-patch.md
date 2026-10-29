# Arabe L1 — ancrages UI proposés, sans application

Ce document décrit l’intégration de `ar_deck_L1.json`. Aucun changement n’est appliqué à `app.html`, aux fonctions Netlify, aux voix ou aux autres cours. Claude conserve la fusion et la validation de l’application.

Référence inspectée : `melunga_deploy/app.html`, commit `541afb7f67b499130af60211e72a8614bdaaf31d`, SHA-256 `125a02d6433ad7117672818112077b9d0c2a1c17cb7a63d46ef05e24ae032f16`. Les numéros de ligne ci-dessous appartiennent à cette copie ; rechercher aussi le nom de fonction ou l’identifiant avant toute fusion.

**Différence d’édition à traiter :** le brief décrit une application contenant `lDE`, `VOICE`, `TTSLANG`, `HELLO` et `GTTS`. Ces cinq ancrages sont absents de la copie inspectée, qui propose sept langues et utilise désormais `MelungaVoiceSelection` / `MelungaLessonAudio`. Les entrées demandées pour l’édition de Claude sont conservées ci-dessous, avec les ancrages réellement trouvés ici. Ne pas introduire ces anciennes maps comme des variables inutilisées dans l’édition actuelle et ne pas remplacer son audio partagé par le fichier TTS joint.

## 1. Bouton de langue `lAR`

Insertion demandée par le brief, à côté de `lDE` dans l’édition qui possède ce bouton :

```html
<button class="lang" id="lAR" onclick="setLang('ar',this)" style="display:none"><span class="fl">🇸🇦</span>العربية</button>
```

Dans la copie inspectée, `lDE` n’existe pas. Le sélecteur est `#selLang .selmenu .langs`, lignes 2900–2908 ; le dernier bouton existant est `#lKO`, ligne 2907. C’est l’ancrage équivalent pour placer le bouton, sans dupliquer son identifiant.

Le `display:none` initial doit être levé lorsque le deck et les traductions sont disponibles. `applyNat()`, ligne 3944, contrôle actuellement les boutons selon la langue maternelle. Proposition à ajouter à cette fonction pour la cible arabe :

```js
var lAR = document.getElementById('lAR');
if (lAR) {
  var arNames = {
    fr:'Arabe', en:'Arabic', es:'Árabe', zh:'阿拉伯语',
    it:'Arabo', ja:'アラビア語', ko:'아랍어'
  };
  lAR.innerHTML = '<span class="fl">🇸🇦</span>' + (arNames[nat] || 'العربية');
  lAR.style.display = DECKS.ar && DECKS.ar.length ? '' : 'none';
}
```

`setLang(l,btn)`, ligne 3773, active explicitement chaque bouton : après le traitement de `lKO`, ligne 3783, prévoir également :

```js
var _la = document.getElementById('lAR');
if (_la) _la.classList.toggle('on', l === 'ar');
```

Le drapeau demandé est un repère visuel de langue ; le contenu reste de l’arabe standard moderne, sans sélection d’un dialecte saoudien.

## 2. Maps `_lm`

Deux définitions distinctes sont présentes, et toutes deux doivent recevoir `ar:'lAR'` :

| Ancrage vérifié | Rôle | Entrée à ajouter |
|---|---|---|
| Ligne 3441, dans `buildLevels()` | Texte du sélecteur `#langSelVal` | `ar:'lAR'` |
| Ligne 3785, dans `setLang(l,btn)` | Texte du sélecteur après changement de langue | `ar:'lAR'` |

Map résultante dans cette édition :

```js
var _lm = {fr:'lFR',en:'lEN',es:'lES',zh:'lZH',it:'lIT',ja:'lJA',ko:'lKO',ar:'lAR'};
```

Ne pas remplacer les autres entrées ni ne mettre à jour qu’une seule des deux copies. La map `_targetBtn` de `applyNat()`, ligne 4030, requiert la même entrée ; elle est reprise au point 7.

## 3. Map `VOICE`

Entrée exacte demandée pour l’édition de Claude qui utilise `VOICE` et `GTTS` :

```js
ar:{
  female:['Salma','/.netlify/functions/tts?voice=ar-XA-Wavenet-A&lang=ar-XA',GTTS('ar')],
  male:['Omar','/.netlify/functions/tts?voice=ar-XA-Wavenet-B&lang=ar-XA',GTTS('ar')]
}
```

`VOICE` et `GTTS` sont absents de l’édition inspectée. Ses ancrages audio réels sont :

| Ancrage | Comportement actuel |
|---|---|
| Ligne 3032, script `voice-selection.js` | Catalogue partagé des voix |
| Ligne 3033, script `lesson-audio.js` | Lecteur audio partagé |
| `updateVoiceLabel()`, ligne 3524 | Nom de la voix effective pour `lang` |
| `applyVoiceUI()`, ligne 4035 | Choix disponibles, filtrés actuellement sur `engine==='chirp3'` |
| `setVoice(g,btn)`, ligne 4050 | Sélection d’un candidat réel du catalogue |
| `speak(text,btn)`, ligne 4500 | `player.play({text,language:lang,rate})` |

Dans cette édition, une entrée Wavenet isolée ne rendrait pas l’arabe jouable : il faut une intégration explicite au catalogue et aux règles du lecteur, décidée par le propriétaire de l’audio. Le présent lot n’effectue pas ce changement et ne déclare pas l’audio arabe validé. Les voix actuelles des sept langues restent intactes.

Le `tts (1).mjs` joint est fourni comme référence par Claude. Il n’est pas copié sur `netlify/functions/tts.mjs` : le périmètre de cette livraison reste les deux fichiers de contenu et de description.

## 4. Map `TTSLANG`

Entrée demandée pour l’édition qui contient cette map :

```js
ar:'ar-XA'
```

La map `TTSLANG` est absente de l’édition inspectée ; son lecteur transmet le code court `language:lang` au système partagé. L’ajout de la langue et de ses voix doit donc être raccordé dans ce système plutôt que par une map sans lecteur.

`ar-XA` est ici le code de synthèse vocale fourni par le brief. Ne pas le transposer automatiquement à la reconnaissance vocale du navigateur ; son ancrage distinct est indiqué au point 7.

## 5. Map `HELLO`

Entrée demandée :

```js
ar:{female:'مرحبا، أنا سلمى.',male:'مرحبا، أنا عمر.'}
```

`HELLO` est absente de l’édition inspectée. Les phrases servent à la préécoute des voix dans l’édition de Claude qui lit cette map ; leur présence seule ne doit pas lancer une lecture automatique. Le nom d’une voix affiché et la voix réellement appelée doivent rester cohérents.

## 6. Texte arabe et direction RTL

La langue maternelle de l’apprenant reste celle de l’interface. **Ne pas inverser toute la page** quand la seule langue étudiée devient l’arabe. Mettre la direction sur les éléments qui portent effectivement un texte, en conservant une direction naturelle pour les traductions et les aides phonétiques.

| Élément vérifié | Déclaration / mise à jour | Proposition |
|---|---|---|
| `#fr` | Élément ligne 2963 ; `show()` affiche `d.t` ligne 4118 et la traduction cachant la réponse ligne 4091 | Ajouter `dir="auto"`, avec `lang="ar"` seulement quand l’élément affiche réellement `d.t` et que `lang==='ar'` |
| `#peek` | Élément ligne 2988 ; `updateSwipeUI()` affiche la prochaine carte ligne 4145 | Ajouter `dir="auto"` ; poser/retirer `lang="ar"` selon la cible |
| `#recallInput` | Élément ligne 2971 ; affiché par `show()` en mode rappel | Ajouter `dir="auto"` ; poser/retirer `lang="ar"` selon la cible, conserver les réglages d’autocorrection existants |
| `#recalldiff` | Élément ligne 2974 ; `checkRecall()` ligne 4351 construit le résultat | Isoler le bloc de mots arabes dans `<div dir="auto" lang="ar">` ; garder le message et le pourcentage dans la direction de l’interface |
| `#heard` | Élément ligne 2969 ; résultats de `startRec()` ligne 4369 et messages d’état audio | Ajouter `dir="auto"` ; ne pas forcer RTL pour les erreurs françaises ou anglaises |
| `#cn` | Élément ligne 2966 ; `show()` y place `meaningOf(d)` ligne 4121 | `dir="auto"` convient aussi ; ne pas lui attribuer systématiquement `lang="ar"` |

Exemple de principe pour `#fr` dans `show()`, après choix du contenu réellement affiché :

```js
var targetNode = document.getElementById('fr');
if (targetNode) {
  targetNode.setAttribute('dir', 'auto');
  if (lang === 'ar' && (!_guess || revealed)) targetNode.setAttribute('lang', 'ar');
  else targetNode.removeAttribute('lang');
}
```

`finishReview()`, ligne 4315, remplace aussi `#fr` par un message de l’interface : retirer alors un éventuel `lang="ar"`. L’auto-direction doit rester applicable après changement vers une autre langue, passage à une carte suivante et affichage/masquage de la réponse.

Conserver le texte arabe en Unicode logique, sans renverser la chaîne et sans insérer de contrôles bidi dans le champ `t`. Les chiffres, tirets, points de suspension des gabarits et ponctuations se testent dans leur contexte visuel. Les aides `py/pf/ps/pi` restent de gauche à droite ; `phon` reste du chinois. Prévoir une police système couvrant correctement les lettres arabes jointes, sans espacement artificiel des lettres ni découpage caractère par caractère de `t`.

## 7. Autres occurrences et ancrages nécessaires

### Résultat de la recherche demandée

Dans la copie inspectée : zéro `lDE`, zéro clé `de:`, aucune clé de langue `'de'` / `"de"`. Les deux chaînes exactes `"de"` trouvées sont des valeurs phonétiques de cartes historiques sur la grande ligne `DECKS`, pas des codes de langue. Aucune de ces cartes ne doit être modifiée pour intégrer l’arabe.

### Maps et listes liées à la langue cible

| Ancrage vérifié | Ajout proposé pour l’arabe |
|---|---|
| `DECKS`, ligne 3035 | Ajouter la propriété `ar` contenant la **liste JSON**, sans chaîne JSON imbriquée : `DECKS.ar = <contenu de ar_deck_L1.json>` lors de la fusion. Ne pas modifier les listes des autres langues. |
| `_FL` dans `setLang()`, ligne 3788 | `ar:'🇸🇦'` |
| `_targetBtn` dans `applyNat()`, ligne 4030 | `ar:'lAR'` |
| Objet de `#studyLang` dans `show()`, ligne 4073 | `ar:'🇸🇦 العربية'` |
| `LANGUAGE_FLAGS`, ligne 4759 | `lAR:'ar'` ; vérifier le décor `.flag-ar` si la feuille de style remplace visuellement les drapeaux |
| `WLC_FLAG`, ligne 3809 | `ar:'🇸🇦'`, si cette édition affiche effectivement l’arabe dans le choix d’accueil |
| `WLC_BTNBG`, ligne 3810 | `ar:'linear-gradient(180deg,#D5EFE4,#87BDA8)'` : couleur proposée, à conserver cohérente avec l’ambiance retenue |
| `WLC_BTNINK`, ligne 3811 | `ar:'#123F34'` pour la proposition précédente |
| `order` dans `wlcGoStep2()`, ligne 3830 | Ajouter `'ar'` comme **cible disponible** une fois le parcours correspondant raccordé ; ne pas en faire par ce seul ajout une nouvelle langue maternelle/site |

Les sept entrées `WLC_I18N[locale].names`, lignes 3801–3807, doivent également connaître le nom de la nouvelle cible si ce choix est utilisé :

```js
// Ajouter la propriété dans chaque objet names existant :
// fr.names : ar:'Arabe'
// it.names : ar:'Arabo'
// ja.names : ar:'アラビア語'
// ko.names : ar:'아랍어'
// en.names : ar:'Arabic'
// es.names : ar:'Árabe'
// zh.names : ar:'阿拉伯语'
```

Les textes « 7 langues » dans ces mêmes entrées ne doivent annoncer une huitième langue que lorsque l’intégration est réellement disponible. Le compteur des cartes L1 arabes reste celui des 283 objets, sans multiplier par les traductions ou les étapes de travail.

### Langue cible et langue maternelle : ne pas élargir aveuglément les listes

Trois tableaux `codes=['fr','en','es','it','zh','ja','ko']` sont vérifiés :

- Ligne 2719 : garde de redirection web classique vers le parcours, avec `validLanguage()` et `pairOf()`.
- Ligne 2816 : garde d’entrée directe `start=1` vers le parcours.
- Ligne 3627 : `validateCourseReturn()`, pour le retour du compte vers le parcours.

Ces tableaux valident actuellement **les deux côtés d’une paire**. Ajouter seulement `'ar'` partout autoriserait aussi une langue maternelle arabe, alors que le présent lot fournit de l’arabe étudié traduit dans les sept langues existantes. Proposition de principe : garder la liste native actuelle et ajouter `'ar'` uniquement à la liste des cibles ; adapter les validations de paire à ces deux listes. N’activer la redirection vers un parcours `fr-ar`, `en-ar`, etc. qu’une fois ce parcours pris en charge par son registre de données. Un deck ajouté à `app.html` ne crée pas automatiquement ces parcours dans `parcours-niveaux.html`.

Les maps ci-dessous sont indexées par `nat`, `WLCSITE` ou `nativeCode`, et **ne demandent donc pas d’entrée `ar` pour ce lot de langue cible** :

| Maps natives vérifiées | Lignes |
|---|---|
| `PATH_UI`, `LVLABELS`, `PACKLABELS`, `SECTORLABELS`, `UI` et ses compléments | 3037, 3064, 3076, 3084, 3099–3242 |
| `ML`, `SL`, `IL`, `errors`, `FAMLBL` | 3182–3184, 3280, 3400 |
| `LGL`, `VH`, `RVH`, `RVV`, `VG`, `VS`, `ALLLV` (deux copies) | 3440–3448, 3538 |
| `CTRL_LBL` | 3463 |
| `WLC_I18N` (texte d’interface hors les noms de la cible), `phoneticLabels`, `_rateText` | 3800, 3884, 3902 |
| Objet `_levelLabel` | 4078 |
| `COPY`, `CHANGE_LANGUAGE`, `NAV_COPY`, `QUICK_COPY` | 4723, 4732, 4741, 4750 |

Une future interface **pour arabophones** serait un lot distinct : ces textes et les champs natifs nécessaires aux autres decks devraient alors être rédigés, plutôt que de faire passer silencieusement une traduction française ou chinoise pour de l’arabe.

### Sélection des aides et des traductions

`phonOf(d)`, ligne 3301, prend déjà le bon chemin générique pour `lang==='ar'` : `pf` pour `nat==='fr'`, `ps` pour l’espagnol, `py` pour l’anglais, `pi` pour l’italien et `phon` pour le chinois. `updatePinyinBtn()`, ligne 3296, est réservé au chinois ; il ne faut pas l’afficher pour l’arabe ni ajouter `tr` au deck pour cette raison.

Le schéma demandé ne comporte pas `pj` ni `pk` : la branche actuelle utilise donc `py` comme secours pour les apprenants japonais et coréens. Le présent lot n’invente pas ces deux champs et ne prétend pas fournir une phonétique japonaise/coréenne dédiée. Les traductions `jam` et `kom` restent disponibles.

`activeDeck()`, ligne 3374, et les fonctions de sens utilisent les traductions existantes ; préserver les sept champs `cn/en/frm/esm/itm/jam/kom`. `PEDAGOGY_FAMILIES`, ligne 3036, est une structure pédagogique séparée : ne pas fabriquer de familles en ajoutant un objet vide ou en réemployant les familles françaises. Sans configuration arabe, `guidedPool()` retourne déjà une liste vide ; la disponibilité du parcours guidé doit être traitée par son intégrateur.

### Rappel écrit et reconnaissance : adaptations fonctionnelles repérées

Ces points sont décrits, **pas modifiés** :

- `_norm()`, ligne 4337, conserve actuellement seulement le latin ASCII, les chiffres ASCII et les idéogrammes chinois. Il supprime entièrement les lettres arabes. `matchPhrase()` (4339), `_recallDiff()` (4340) et `checkRecall()` (4351) en dépendent : un simple rendu RTL ne suffit donc pas. Prévoir une branche arabe conservant ses lettres, normalisant les espaces/ponctuations et, si la règle d’évaluation le prévoit, ignorant les voyelles facultatives et le tatweel. Conserver les autres branches et décider explicitement le traitement des hamzas ; ne pas rendre toutes les variantes de lettres équivalentes par défaut.
- `startRec()`, ligne 4369, assigne `rec.lang` par une chaîne de conditions ligne 4383, qui retomberait aujourd’hui sur `en-US` pour `lang==='ar'`. Proposition d’entrée STT à tester sur le navigateur : `(lang==='ar') ? 'ar-SA' : …`. C’est une locale de reconnaissance distincte de `ar-XA` fourni pour le TTS ; sa disponibilité n’est pas garantie par le deck.
- Les sorties du rappel et les transcriptions reconnues doivent conserver leur texte Unicode réel et leur ordre logique. Ne pas translittérer la réponse pour contourner `_norm()`.

### Contrôles après fusion par Claude

1. Charger le JSON UTF-8 comme une liste plate ; vérifier 283 objets L1, 15 champs exactement par objet, unicité stricte de `t` dans l’ensemble du deck arabe et répartition `258 core / 13 template / 11 bonus / 1 vocab`.
2. Vérifier les cinq aides contre les appels au `GA()` fourni. Ne pas livrer le champ de travail `tr` ni corriger les aides à la main.
3. Extraire les scripts inline de l’édition effectivement fusionnée et passer `node --check` ; un fichier HTML entier ne se vérifie pas directement comme un module JavaScript.
4. Vérifier sélection de l’arabe, changement aller-retour vers les langues existantes, traduction native, affichage RTL de la phrase et de l’aperçu, gabarits, ponctuation mixte et saisie de rappel.
5. Vérifier séparément la disponibilité réelle des voix et de la reconnaissance. Les extraits Wavenet du brief ne constituent pas une validation du catalogue partagé de l’autre édition.

Cette note est une proposition d’intégration sur deux éditions identifiées, pas une application du patch ni une preuve de mise en ligne.

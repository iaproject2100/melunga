# Audit complet du catalogue et des familles guidées

Rapport généré, documentaire uniquement. Aucun texte, niveau, aide phonétique ou accès n’est modifié.

Source : `melunga_deploy/app.html`, dernier commit touchant le fichier `b5ea64cb2d87a8fa385ef36758ff519257c7ac17`.
SHA-256 du fichier : `945a8befad41fd70c7dbbd29ea91d863451a15e750456aee4de73df3fcaf11bb`.

Contrôle de **32 115 entrées**, **70 cases langue × niveau**, **156 familles** et **906 références guidées**. Références introuvables ou métadonnées inexactes : **0**.

## Limites et sens des mesures

- `lv` est le classement historique du catalogue ; `pathLv` est le classement du parcours guidé. Leur écart déclenche une relecture, sans établir automatiquement la difficulté.
- Les compteurs ne prouvent ni exposition, ni compréhension, ni maîtrise. La longueur n’est pas un classement de difficulté.
- Le statut hérité `fragment` peut aussi marquer des phrases complètes. Il reste distinct des candidats contenant des points de suspension ou un emplacement à remplir.
- Une reprise entre familles peut être un réemploi utile. Un même texte au catalogue peut avoir plusieurs usages contextuels. Les ambiguïtés ne sont pas supprimées automatiquement.
- Les aides de prononciation sont copiées dans le JSON avec leurs clés et valeurs exactes, y compris les champs partiels. Ce contrôle ne certifie pas leur justesse linguistique et ne les harmonise pas.
- Le rapport examine les données locales et leur résolution, pas le site publié ni la réussite d’un apprenant. Le contenu conversation fait l’objet d’une revue distincte.

## Synthèse par langue

| Langue | Catalogue | Core | Familles | Références guidées | Sources guidées uniques | Doublons catalogue supplémentaires | Références avec texte ambigu | Candidats avec emplacement |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Français | 4500 | 3097 | 26 | 151 | 144 | 4 | 0 | 4 |
| Anglais | 4502 | 3230 | 26 | 151 | 148 | 4 | 0 | 6 |
| Espagnol | 4672 | 3621 | 26 | 151 | 142 | 0 | 0 | 0 |
| Chinois | 4903 | 2371 | 26 | 151 | 135 | 5 | 1 | 2 |
| Italien | 4509 | 2818 | 26 | 151 | 144 | 88 | 1 | 1 |
| Japonais | 4509 | 3173 | 26 | 151 | 140 | 205 | 7 | 4 |
| Coréen | 4520 | 3534 | 0 | 0 | 0 | 207 | 0 | 0 |

La part de catalogue représentée est le rapport des sources uniques sélectionnées au nombre d’entrées. Elle ne décrit pas un pourcentage de la langue couvert. Le coréen possède un catalogue mais aucune configuration `PEDAGOGY_FAMILIES.languages.ko` ; le parcours guidé retourne actuellement une liste vide pour cette langue.

## Les 70 cases langue × niveau

Les colonnes catalogue/core sont comptées au **numéro historique** ; les colonnes guidées au **numéro du parcours**. Elles ne constituent pas des ensembles équivalents.

| Langue | N° | Catalogue historique | Core historique | Familles guidées | Références | Sources uniques | Étendue historique des sources guidées | Références historiques ≥ n+2 | Emplacements |
|---|---:|---:|---:|---:|---:|---:|---|---:|---:|
| Français | 1 | 293 | 272 | 3 | 19 | 18 | 1–5 | 2 | 0 |
| Français | 2 | 548 | 404 | 3 | 21 | 21 | 2–7 | 4 | 0 |
| Français | 3 | 632 | 428 | 2 | 10 | 10 | 7–10 | 10 | 0 |
| Français | 4 | 595 | 338 | 3 | 18 | 18 | 3–10 | 13 | 0 |
| Français | 5 | 683 | 402 | 3 | 18 | 18 | 2–9 | 4 | 0 |
| Français | 6 | 439 | 342 | 3 | 16 | 16 | 3–7 | 0 | 1 |
| Français | 7 | 430 | 350 | 3 | 16 | 16 | 2–8 | 0 | 1 |
| Français | 8 | 402 | 296 | 2 | 11 | 11 | 4–10 | 1 | 1 |
| Français | 9 | 227 | 132 | 2 | 12 | 12 | 2–10 | 0 | 0 |
| Français | 10 | 251 | 133 | 2 | 10 | 10 | 5–10 | 0 | 1 |
| Anglais | 1 | 323 | 308 | 3 | 19 | 19 | 2–5 | 6 | 0 |
| Anglais | 2 | 537 | 418 | 3 | 21 | 21 | 2–10 | 2 | 0 |
| Anglais | 3 | 737 | 534 | 2 | 10 | 10 | 3–8 | 8 | 1 |
| Anglais | 4 | 530 | 275 | 3 | 18 | 18 | 1–10 | 13 | 1 |
| Anglais | 5 | 706 | 400 | 3 | 18 | 18 | 2–8 | 5 | 1 |
| Anglais | 6 | 490 | 352 | 3 | 16 | 16 | 2–7 | 0 | 0 |
| Anglais | 7 | 459 | 380 | 3 | 16 | 16 | 5–8 | 0 | 0 |
| Anglais | 8 | 320 | 289 | 2 | 11 | 11 | 2–10 | 3 | 1 |
| Anglais | 9 | 174 | 132 | 2 | 12 | 12 | 2–10 | 0 | 1 |
| Anglais | 10 | 226 | 142 | 2 | 10 | 10 | 2–10 | 0 | 1 |
| Espagnol | 1 | 289 | 224 | 3 | 19 | 19 | 1–5 | 8 | 0 |
| Espagnol | 2 | 613 | 491 | 3 | 21 | 21 | 2–10 | 10 | 0 |
| Espagnol | 3 | 550 | 443 | 2 | 10 | 10 | 6–8 | 10 | 0 |
| Espagnol | 4 | 599 | 478 | 3 | 18 | 18 | 2–10 | 10 | 0 |
| Espagnol | 5 | 592 | 480 | 3 | 18 | 18 | 2–9 | 8 | 0 |
| Espagnol | 6 | 508 | 412 | 3 | 16 | 16 | 3–10 | 2 | 0 |
| Espagnol | 7 | 489 | 373 | 3 | 16 | 16 | 1–10 | 2 | 0 |
| Espagnol | 8 | 432 | 348 | 2 | 11 | 11 | 1–10 | 2 | 0 |
| Espagnol | 9 | 309 | 186 | 2 | 12 | 12 | 2–10 | 0 | 0 |
| Espagnol | 10 | 291 | 186 | 2 | 10 | 10 | 3–10 | 0 | 0 |
| Chinois | 1 | 314 | 224 | 3 | 19 | 19 | 1–10 | 8 | 0 |
| Chinois | 2 | 573 | 309 | 3 | 21 | 21 | 2–5 | 5 | 2 |
| Chinois | 3 | 554 | 282 | 2 | 10 | 10 | 8–10 | 10 | 0 |
| Chinois | 4 | 678 | 299 | 3 | 18 | 18 | 2–10 | 9 | 0 |
| Chinois | 5 | 652 | 306 | 3 | 18 | 18 | 2–10 | 5 | 0 |
| Chinois | 6 | 504 | 265 | 3 | 16 | 16 | 2–8 | 2 | 0 |
| Chinois | 7 | 473 | 253 | 3 | 16 | 16 | 2–10 | 1 | 0 |
| Chinois | 8 | 524 | 255 | 2 | 11 | 11 | 4–10 | 4 | 0 |
| Chinois | 9 | 299 | 66 | 2 | 12 | 12 | 1–10 | 0 | 0 |
| Chinois | 10 | 332 | 112 | 2 | 10 | 10 | 3–10 | 0 | 0 |
| Italien | 1 | 338 | 318 | 3 | 19 | 19 | 1–4 | 3 | 0 |
| Italien | 2 | 554 | 354 | 3 | 21 | 21 | 2–7 | 6 | 0 |
| Italien | 3 | 582 | 340 | 2 | 10 | 10 | 7–10 | 10 | 0 |
| Italien | 4 | 630 | 343 | 3 | 18 | 18 | 3–10 | 10 | 0 |
| Italien | 5 | 667 | 353 | 3 | 18 | 18 | 2–10 | 9 | 0 |
| Italien | 6 | 415 | 303 | 3 | 16 | 16 | 2–9 | 3 | 0 |
| Italien | 7 | 421 | 305 | 3 | 16 | 16 | 2–10 | 1 | 0 |
| Italien | 8 | 398 | 268 | 2 | 11 | 11 | 4–10 | 2 | 0 |
| Italien | 9 | 234 | 115 | 2 | 12 | 12 | 2–10 | 0 | 1 |
| Italien | 10 | 270 | 119 | 2 | 10 | 10 | 5–10 | 0 | 0 |
| Japonais | 1 | 290 | 262 | 3 | 19 | 19 | 1–4 | 4 | 0 |
| Japonais | 2 | 555 | 419 | 3 | 21 | 21 | 2–8 | 12 | 0 |
| Japonais | 3 | 571 | 381 | 2 | 10 | 10 | 6–9 | 10 | 0 |
| Japonais | 4 | 641 | 400 | 3 | 18 | 18 | 1–10 | 5 | 0 |
| Japonais | 5 | 688 | 419 | 3 | 18 | 18 | 3–10 | 7 | 0 |
| Japonais | 6 | 440 | 355 | 3 | 16 | 16 | 4–10 | 1 | 1 |
| Japonais | 7 | 517 | 434 | 3 | 16 | 16 | 2–9 | 1 | 0 |
| Japonais | 8 | 322 | 220 | 2 | 11 | 11 | 4–9 | 0 | 0 |
| Japonais | 9 | 227 | 137 | 2 | 12 | 12 | 1–10 | 0 | 0 |
| Japonais | 10 | 258 | 146 | 2 | 10 | 10 | 2–9 | 0 | 3 |
| Coréen | 1 | 287 | 270 | 0 | 0 | 0 | — | 0 | 0 |
| Coréen | 2 | 462 | 328 | 0 | 0 | 0 | — | 0 | 0 |
| Coréen | 3 | 556 | 366 | 0 | 0 | 0 | — | 0 | 0 |
| Coréen | 4 | 606 | 365 | 0 | 0 | 0 | — | 0 | 0 |
| Coréen | 5 | 704 | 435 | 0 | 0 | 0 | — | 0 | 0 |
| Coréen | 6 | 459 | 374 | 0 | 0 | 0 | — | 0 | 0 |
| Coréen | 7 | 527 | 477 | 0 | 0 | 0 | — | 0 | 0 |
| Coréen | 8 | 404 | 404 | 0 | 0 | 0 | — | 0 | 0 |
| Coréen | 9 | 242 | 242 | 0 | 0 | 0 | — | 0 | 0 |
| Coréen | 10 | 273 | 273 | 0 | 0 | 0 | — | 0 | 0 |

## Exemples à relire, avec provenance exacte

Les choix ci-dessous sont des pistes de relecture. Toutes les références et tous les doublons, avec traductions et aides brutes, figurent dans `audit-catalogue.json`.

### Français

- `DECKS.fr[2826]` — **J'aurais aimé venir, mais je travaille.** ; `L3_OPPOSITION`, étape 1, parcours L3, classement historique L10. Aides exactes : `{"phon":"若雷泽梅弗尼尔梅热特拉瓦耶","pi":"jo-ré-se-mé-ve-nír-me-je-tra-vái","ps":"yo-ré-ze-mé-ve-nír-me-ye-tra-vái","py":"zhoh-ray zay-may vuh-neer may zhuh trah-VYE"}`.
- `DECKS.fr[2792]` — **Si tu es fatigué, repose-toi.** ; `L4_CONDITION`, étape 2, parcours L4, classement historique L10. Aides exactes : `{"phon":"西杜埃法蒂盖勒波兹图瓦","pi":"si-tiu-e-fa-ti-ghé-re-pós-tuá","ps":"si-tiu-e-fa-ti-gué-re-póz-tuá","py":"see tew ay fah-tee-GAY ruh-pohz TWAH"}`.
- `DECKS.fr[3072]` — **Il me semble que...** ; `L6_OPINION`, étape 1, parcours L6, classement historique L3. Aides exactes : `{"phon":"伊尔 么 桑布勒 克","pi":"il-me-sonbl-ché","ps":"il-me-sonbl-ké","py":"eel-muh-sonbl-KUH"}`.
- `DECKS.fr[3132]` — **Il paraît que...** ; `L7_INFORMATION_RAPPORTEE`, étape 1, parcours L7, classement historique L4. Aides exactes : `{"phon":"伊尔帕雷克","pi":"il-pa-ré-che","ps":"il-pa-ré-ke","py":"eel-pah-RAY-kuh"}`.

### Anglais

- `DECKS.en[2830]` — **I'd like a quote.** ; `L2_DEMANDE_POLIE`, étape 7, parcours L2, classement historique L10. Aides exactes : `{"pf":"aïd LAÏK eu KWOT","phon":"艾德 莱克 厄 阔特","pi":"áid láic é cuót","ps":"áid láik é kuót","py":"aid-laik-uh-KWOHT"}`.
- `DECKS.en[2831]` — **If you have a question, ask.** ; `L4_CONDITION`, étape 3, parcours L4, classement historique L10. Aides exactes : `{"pf":"if you hav eu KWÈS-tcheun ASK","phon":"伊夫 尤 哈夫 厄 阔斯琴 阿斯克","pi":"if iu hab e cues-cen asc","ps":"if yu jab e kues-tchen ask","py":"if-yoo-hav-uh-kwes-chun-ASK"}`.
- `DECKS.en[3177]` — **I see your point, but...** ; `L3_OPPOSITION`, étape 1, parcours L3, classement historique L3. Aides exactes : `{"pf":"aï SI yor POÏNT beut","phon":"艾 西 油尔 拍恩特 巴特","pi":"ai si ior point bet","ps":"ai si yor point bet","py":"ai-see-yor-POINT-but"}`.
- `DECKS.en[3035]` — **Could you please...?** ; `L4_DEMANDE_FORMELLE`, étape 1, parcours L4, classement historique L1. Aides exactes : `{"pf":"koud you PLIZ","phon":"库德 尤 普利斯","pi":"cud iu plis","ps":"kud yu pliz","py":"kud-yoo-PLEEZ"}`.

### Espagnol

- `DECKS.es[3384]` — **Quisiera agradecerles su presencia.** ; `L2_DEMANDE_POLIE`, étape 5, parcours L2, classement historique L10. Aides exactes : `{"pf":"ki-SIÉ-ra a-gra-dé-CÈR-lés sou pré-CÈN-cia","phon":"基西耶拉阿格拉德塞尔莱斯苏普雷森西亚","pi":"Chisiera agradeserles su presensia.","py":"kee-SYEH-rah ah-grah-deh-SER-lehs soo preh-SEN-syah"}`.
- `DECKS.es[3274]` — **Quisiera un presupuesto detallado.** ; `L2_DEMANDE_POLIE`, étape 7, parcours L2, classement historique L10. Aides exactes : `{"pf":"ki-SSIÉ-ra oun pré-ssou-POUÉS-to dé-ta-YA-do","phon":"基西埃拉 温 普雷苏普埃斯托 德塔亚多","pi":"Chisiera un presupuesto detagliado.","py":"kee-SEEEH-rah OON preh-soo-POOEHS-toh deh-tah-YAH-doh"}`.

### Chinois

- `DECKS.zh[2106]` — **这是最终报价。** ; `L1_ETAT_C_EST`, étape 7, parcours L1, classement historique L10. Aides exactes : `{"phe":"juh shr dzway joong bow jyah.","phf":"dje cheu dzoueï djong bao djya.","phi":"gie sci dzuei giong bao gia.","phon":"","phs":"che shi dsuei chong bao yia.","py":"zhè shì zuì zhōng bào jià."}`.
- `DECKS.zh[2136]` — **虽然很贵，但是很值得。** ; `L3_OPPOSITION`, étape 1, parcours L3, classement historique L10. Aides exactes : `{"phEN":"sooīrán","phES":"suīrán","phFR":"souīrán","phe":"sway rahn hun gway, dahn shr hun jr duh.","phf":"soueï jann heunn goueï, dann cheu heunn djeu de.","phi":"suei ran hen guei, dan sci hen gi de.","phon":"","phs":"suei ran jen guei, dan shi jen chi de.","py":"suī rán hěn guì, dàn shì hěn zhí dé."}`.
- `DECKS.zh[2236]` — **我想吃……** ; `L2_DEMANDE_POLIE`, étape 1, parcours L2, classement historique L2. Aides exactes : `{"phEN":"wǒ-sheeǎng-chī...","phES":"uǒ-siǎng-chī...","phFR":"wǒ-siǎng-tchī...","phe":"woh shyahng chr...","phf":"ouo chyang tchr...","phi":"uo sciang ci...","phon":"","phs":"uo shiang chr...","py":"wǒ xiǎng chī..."}`.
- `DECKS.zh[2237]` — **我想去……** ; `L2_DEMANDE_POLIE`, étape 2, parcours L2, classement historique L2. Aides exactes : `{"phEN":"wǒ-sheeǎng-chù...","phES":"uǒ-siǎng-chù...","phFR":"wǒ-siǎng-tchù...","phe":"woh shyahng chyoo...","phf":"ouo chyang tchu...","phi":"uo sciang ciu...","phon":"","phs":"uo shiang chiu...","py":"wǒ xiǎng qù..."}`.
- Texte guidé à occurrences multiples : **我觉得可以**, indices [352, 383]. La résolution actuelle retient la première occurrence admissible ; une autre occurrence n’est pas une nouvelle variante acquise.

### Italien

- `DECKS.it[2499]` — **Sarei voluto venire, ma lavoro.** ; `L3_OPPOSITION`, étape 1, parcours L3, classement historique L10. Aides exactes : `{"pf":"sa-rèï vo-lou-to vé-ni-ré, ma la-vo-ro","phon":"萨雷沃卢托韦尼雷，马拉沃罗","ps":"sa-réi vo-lú-to ve-ní-re, ma la-vó-ro","py":"sah-RAY voh-LOO-toh veh-NEE-reh, mah lah-VOH-roh"}`.
- `DECKS.it[2376]` — **Perché vuole entrare nella nostra azienda?** ; `L3_CAUSE`, étape 5, parcours L3, classement historique L9. Aides exactes : `{"pf":"pèr-qué vouo-lé ènn-tra-ré nèl-la nos-tra a-dziènn-da","phon":"佩尔凯沃莱恩特拉雷内拉诺斯特拉阿津达","ps":"per-qué vuó-le en-trá-re né-la nós-tra a-dsién-da","py":"pehr-KEH VWOH-leh ehn-TRAH-reh NEHL-lah NOHS-trah ah-DZYEHN-dah"}`.
- `DECKS.it[2879]` — **Sembra che...** ; `L9_PROBABILITE`, étape 3, parcours L9, classement historique L2. Aides exactes : `{"pf":"sèm-bra qué","phon":"森布拉凯","ps":"sém-bra que","py":"SEHM-brah keh"}`.
- Texte guidé à occurrences multiples : **Vado a dormire.**, indices [402, 464]. La résolution actuelle retient la première occurrence admissible ; une autre occurrence n’est pas une nouvelle variante acquise.

### Japonais

- `DECKS.ja[2511]` — **OEM生産をしたいです。** ; `L2_DEMANDE_POLIE`, étape 4, parcours L2, classement historique L8. Aides exactes : `{"pf":"o-o-i-i-é-mou sé-i-san-o chi-ta-i-dé-sou","phon":"欧欧伊伊诶姆塞伊撒恩欧希塔伊德苏","pi":"o-o-i-i-e-mu se-i-san-o sci-ta-i-de-su","ps":"o-o-i-i-e-mu se-i-san-o chi-ta-i-de-su","py":"o-o-i-i-e-mu se-i-sa-n-o shi-ta-i-de-su"}`.
- `DECKS.ja[2779]` — **出ないから、出かけたのでしょう。** ; `L3_CAUSE`, étape 4, parcours L3, classement historique L9. Aides exactes : `{"pf":"dé-na-i-ka-ra dé-ka-ké-ta-no-dé-cho-o","phon":"德纳伊卡拉德卡凯塔诺德肖欧","pi":"de-na-i-ka-ra de-ka-ke-ta-no-de-scio-o","ps":"de-na-i-ka-ra de-ka-ke-ta-no-de-cho-o","py":"de-na-i-ka-ra de-ka-ke-ta-no-de-sho-o"}`.
- `DECKS.ja[4057]` — **正直に言うと、〜と思います。** ; `L6_OPINION`, étape 3, parcours L6, classement historique L6. Aides exactes : `{"pf":"cho-o-dji-ki-ni i-ou-to to o-mo-i-ma-sou","phon":"肖欧季基尼伊乌托托欧莫伊马苏","pi":"scio-o-gi-ki-ni i-u-to to o-mo-i-ma-su","ps":"cho-o-yi-ki-ni i-u-to to o-mo-i-ma-su","py":"sho-o-ji-ki-ni i-u-to to o-mo-i-ma-su"}`.
- `DECKS.ja[3555]` — **正直に言うと…** ; `L10_AVIS_NUANCE`, étape 1, parcours L10, classement historique L4. Aides exactes : `{"pf":"cho-o-dji-ki-ni i-ou-to","phon":"肖欧季基尼伊乌托","pi":"scio-o-gi-ki-ni i-u-to","ps":"cho-o-yi-ki-ni i-u-to","py":"sho-o-ji-ki-ni i-u-to"}`.
- Texte guidé à occurrences multiples : **可能です。**, indices [49, 2990]. La résolution actuelle retient la première occurrence admissible ; une autre occurrence n’est pas une nouvelle variante acquise.

### Coréen

Configuration guidée absente à chacun des dix niveaux. Enrichir à partir des phrases existantes, après préparation des répliques reçues ; ne pas imposer un quota de 26 familles.

## Enrichir sans réécrire la réserve

1. Décrire la capacité quotidienne visée, les briques déjà préparées et une seule transformation principale.
2. Sélectionner des phrases entières existantes avec index, texte attendu, empreinte de carte et aides exactes ; aucune génération de nouvelle phonétique par collage.
3. Préparer la question ou la réponse de l’autre rôle et distinguer réception et production. Une référence dans le catalogue n’atteste pas son apprentissage.
4. Organiser substitution, combinaison quand elle est préparée, échange, puis réemploi dans une autre situation. Distinguer quotidien et spécialisation de métier.
5. Relire le naturel, la difficulté et les transitions sur ordinateur, site mobile et application, avant validation par Kartech. Aucun changement publié ne découle de cet audit.

## Reproduction

```sh
python3 tools/pedagogy/audit_catalogue_progression.py
python3 tools/pedagogy/audit_catalogue_progression.py --check
```

La première commande écrit uniquement les deux rapports documentaires ; `--check` compare leur contenu et ne les modifie pas. Les empreintes `decksSha256` et `pronunciationInventorySha256` servent de repères d’intégrité. Une divergence doit être expliquée ; elle ne déclenche aucune correction automatique.

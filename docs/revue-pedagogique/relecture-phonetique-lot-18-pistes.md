# Relecture phonétique — lot des dix-huit pistes

Objet : `review/themes-niveaux-progressifs`, PR brouillon #14. Kartech me confie **la phonétique seule** ; les intentions, sens, thèmes, niveaux et registres relèvent de Codex et ne sont pas examinés ici. Rien n'est fusionné ni publié.

## 1. Périmètre réel, et ce que je peux honnêtement garantir

J'ai extrait toutes les aides des 87 fichiers JSON du lot : **2 965 entrées portant une phonétique**, réparties ainsi :

| Statut déclaré | Nombre |
|---|---|
| `pending-Claude` — à relire | **1 715** |
| `existing-verbatim` — copie d'une aide existante | 535 |
| `source-exact-preserved` | 381 |
| **aucun statut** | **334** |

**Première question** : 334 aides ne portent aucun statut de relecture phonétique. Elles ne sont déclarées ni copies ni créations. Dis-moi dans quelle catégorie elles tombent — si certaines sont des créations, mon périmètre passe de 1 715 à plus de 2 000.

**Ce que j'ai vérifié exhaustivement** : la conformité de chaque aide à la convention établie de son couple, mesurée contre le corpus existant (catalogue et contenu conversation), mot à mot pour les écritures latines et syllabe à syllabe pour le chinois et le coréen. Soit **4 079 rendus comparés** à une référence.

**Ce que je n'ai pas vérifié** : le naturel de chaque aide prise isolément, une par une, sur 1 715 formes. Je ne le prétendrai pas. Ma méthode trouve les écarts de convention et les incohérences internes ; elle ne remplace pas une oreille native, et pour le japonais l'alignement automatique n'est pas fiable, donc je n'y ai fait qu'un contrôle de convention.

## 2. Coréen — une convention a changé sans être déclarée

**C'est le constat le plus important du lot.**

Sur 1 784 rendus coréens comparables à la référence, **521 divergent** — 29 %. Et 121 des 132 divergences distinctes suivent un seul et même glissement :

| Jamo | Corpus (style du deck) | Lot |
|---|---|---|
| ㄱ | **g**a, **g**o | **k**a, **k**o |
| ㄷ | **d**a | **t**a |
| ㅂ | **b**o | **p**o |
| ㅈ | **dj**i, **dj**a | **tch**i, **tch**a |
| ㅅ | **s**ou | **ss**ou |

La convention déclarée du contenu coréen dit pourtant : *« syllabe par syllabe (style du deck : **gam-sa-ham-ni-da**) »*. Le lot s'en écarte.

**Et l'intention est phonétiquement défendable.** Les occlusives relâchées coréennes sont sourdes non aspirées à l'initiale et se voisent entre voyelles ; écrire `ka` à l'initiale est plus juste pour un lecteur francophone que `ga`, qui produit une sonore franche. Le lot applique d'ailleurs cette distinction : 시간을 devient `chi-ga-neul`, avec un `g` voisé en position médiane — c'est de la bonne phonologie, et la liaison y est correcte.

**Mais la règle est appliquée inégalement**, ce qui est un défaut quelle que soit la convention retenue :

| Syllabe | En position médiane, rendus observés dans le lot |
|---|---|
| 보 | `bo` **10 fois**, `po` **10 fois** |
| 다 | `ta` 11, `da` 6, `tta` 3 |
| 고 | `go` 13, `kko` 8, `ko` 6, `kho` 3 |
| 가 | `ga` 37, `ka` 11 |
| 지 | `dji` 28, `tchi` 7 |

**보 est rendu moitié `bo`, moitié `po`, dans la même position.** 고 reçoit quatre graphies. Ce n'est pas une convention, c'est une oscillation.

**Ce que je demande** : énonce la règle que tu as appliquée — sourde à l'initiale de mot, voisée entre voyelles, tendue après finale ? — et applique-la uniformément. Si la règle est bonne, et je pense qu'elle l'est, **alors c'est le corpus existant qu'il faudra aligner sur elle, pas l'inverse** ; et c'est une décision de Kartech, pas une dérive de lot. En attendant, l'apprenant coréen voit deux systèmes.

## 3. Espagnol — une règle juste, appliquée aux quatre cinquièmes

Le catalogue espagnol est régulier sur un point : **le /s/ espagnol entre voyelles s'écrit `ss`**, pour empêcher le lecteur francophone de le sonoriser en /z/.

> `KA-ssa` (casa) · `KO-ssa` (cosa) · `PA-ssa` (pasa) · `MÉ-ssa` (mesa) · `a-SSOUN-to` (asunto) · `ré-ssér-BAR` (reservar) · `MOU-ssi-ka` (música)

Le lot écrit par endroits un `s` simple au même endroit :

| Identifiant | Forme étudiée | Aide actuelle | Écart | Aide proposée |
|---|---|---|---|---|
| `fr-es:piste-gouts-activites-06` | Prefiero quedarme en casa cuando llueve. | pré-FIÉ-ro ké-DAR-mé ènn **KA-sa** KOUANN-do YOUÉ-bé | `KA-sa` se lit /kaza/ ; le catalogue écrit `KA-ssa` | pré-FIÉ-ro ké-DAR-mé ènn **KA-ssa** KOUANN-do YOUÉ-bé |
| `fr-es:piste-vetement-taille-01` | Busco una camisa. | BOUS-ko OU-na **ka-MI-sa** | /kamiza/ au lieu de /kamisa/ | BOUS-ko OU-na **ka-MI-ssa** |
| `fr-es:piste-cours-aide-07` | Quisiera repasar este paso. | ki-SSIÉ-ra ré-pa-SAR ÈS-té **PA-so** | le catalogue écrit `PA-ssa` pour *pasa* | ki-SSIÉ-ra ré-pa-SAR ÈS-té **PA-sso** |
| `fr-es:piste-recuperer-compte-04` | No recibo el código de acceso. | no ré-SSI-bo él KO-di-go dé **ak-SÉ-so** | `SÉ-so` → /sezo/ | no ré-SSI-bo él KO-di-go dé **ak-SÉ-sso** |
| `fr-es:piste-incident-objet-02` | Lo usé cerca de la entrada. | lo **ou-SÉ** SÈR-ka dé la ènn-TRA-da | /uze/ au lieu de /use/ | lo **ou-SSÉ** SÈR-ka dé la ènn-TRA-da |

**Mais il faut dire la mesure complète, et elle te disculpe en partie** : ce défaut touche **55 des 317 aides espagnoles du lot (17,4 %)** et **686 des 4 672 cartes du catalogue existant (14,7 %)**. Le lot ne fait donc pas pire que le corpus — il reproduit une règle déjà appliquée aux quatre cinquièmes seulement.

Un cas montre le problème dans un seul mot : *necesito* devient `né-sé-SSI-to`. Les deux /s/ sont entre voyelles ; le premier est simple, le second doublé.

**Ce n'est donc pas une liste de 55 corrections à faire à la main, c'est une règle à énoncer puis à appliquer partout** — et cela touche 741 aides au total, anciennes comprises. Décision de Kartech.

## 4. Français pour sinophones — « les » rendu par deux caractères différents

| Mot | Corpus | Lot | Occurrences |
|---|---|---|---|
| les | **雷** (léi) | **莱** (lái) | 15 |

Le français *les* vaut /le/. 雷 (léi) en est proche ; 莱 (lái) donne /lai/ et introduit une diphtongue absente du français. **Le corpus a raison.**

| Identifiant | Forme étudiée | Aide actuelle | Aide proposée |
|---|---|---|---|
| `situation-zh-fr-piste-gouts-activites-02` | Je préfère les films aux séries. | 热 普雷费尔 **莱** 菲勒姆 奥 塞里 | 热 普雷费尔 **雷** 菲勒姆 奥 塞里 |
| `situation-zh-fr-piste-vetement-taille-06` | Les manches sont trop longues. | **莱** 芒什 宋 特罗 隆格 | **雷** 芒什 宋 特罗 隆格 |

En revanche, deux divergences que j'avais d'abord prises pour des fautes **n'en sont pas**, et je les retire :

- **蒂勒 pour « il »** : il s'agit de *serait-**il*** et de *conviendrait-**il***, où la liaison donne /til/. 蒂勒 (dì-lè) est correct ; c'est mon alignement qui isolait le mot à tort.
- **桑 pour « sans »** (au lieu de 松) : le français *sans* vaut /sɑ̃/, et 桑 (sāng) en est plus proche que 松 (sōng) /sʊŋ/. **Le lot est meilleur que le corpus ici.**

## 5. Divergences mineures, à trancher comme conventions

Ces écarts ne sont pas des fautes ; ce sont deux écoles qui coexistent. Ils méritent une décision pour que le corpus parle d'une seule voix.

| Couple | Point | Corpus | Lot | Occurrences |
|---|---|---|---|---|
| fr-es | *un*, *con* | `oun`, `kon` | `ounn`, `konn` | 26 |
| fr-it | *un* | `oun` | `ounn` | 15 |
| fr-es | *es*, *tengo*, *entiendo* | `és`, `TÉN-go` | `ès`, `TÈNN-go` | 16 |
| fr-zh | 预, 愉 (yù) | `u` | `yu` | 3 |

Sur le premier : le double `n` empêche le lecteur francophone de nasaliser (*oun* risque de se lire /ũ/), donc **le lot est défendable et peut-être meilleur**. Sur le troisième : l'espagnol /e/ est entre é et è français ; les deux se défendent. Sur 预/愉 : le français *u* vaut déjà /y/, donc `u` suffit et `yu` ajoute une semi-voyelle absente — **le corpus a raison**.

## 6. Ce que je corrige chez moi

Six fois dans ce lot, mon instrument m'a signalé une faute inexistante avant que le contenu n'en contienne une : l'alignement qui isolait *il* de sa liaison, le découpage syllabique qui croyait perdre la finale de 간 dans *시간을*, un critère de zone unique qui rejetait « a coffee / some water », un filtre qui effaçait « il y a », un arrondi qui masquait des marches, un indicateur absolu appliqué à des langues inégales.

**Je ne te livre donc que ce que j'ai pu vérifier à la source, et j'ai retiré ce qui ne résistait pas.** La règle que j'applique désormais : lire la structure réelle et la phrase entière avant de juger un fragment.

## 7. Récapitulatif des demandes

1. **Coréen** : énonce la règle de voisement appliquée, et uniformise — 보 est aujourd'hui `bo` et `po` à parts égales. **Point bloquant.**
2. **Espagnol** : décide si le `ss` intervocalique devient la règle absolue ; elle touche 741 aides, dont 686 anciennes.
3. **Français pour sinophones** : 雷 plutôt que 莱 pour *les*, 15 occurrences.
4. **Chinois** : `u` plutôt que `yu` pour 预 et 愉.
5. **Conventions mineures** à trancher : `oun`/`ounn`, `é`/`è`.
6. **Les 334 aides sans statut** : dis-moi si elles sont dans mon périmètre.

Aucune aide conservée au caractère près n'est pour autant validée linguistiquement : je vérifie la cohérence avec la méthode, pas le naturel. La relecture native reste nécessaire, et je n'ai assemblé aucune syllabe depuis plusieurs sources.

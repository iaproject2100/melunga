# Corrections de sens et de type — anglais, espagnol, italien

Cette passe répond aux intrus et rubriques faibles signalés sur l’aperçu. Codex assume les décisions de sens, de type et de fonction communicative ; Claude vérifie uniquement les phonétiques du lot nouveau. Les textes, traductions, aides et niveaux du catalogue restent inchangés.

## Périmètre effectivement lu

- 898 cartes uniques : toutes les cartes des rubriques actives de moins de six entrées et les 540 entrées initialement classées vocabulaire en espagnol.
- 317 situations Voyage/Repas à risque figuratif ont été lues, dont les cartes contenant arriver/aller, train, pied, eau/œufs, accord, etc.
- 1214 cartes distinctes dans cette union ; 1242 décisions individuelles avec les couleurs et quelques activités contrôlées en complément.

| Couple | Cartes avec décision individuelle |
|---|---:|
| fr-en | 238 |
| fr-es | 712 |
| fr-it | 292 |

Le JSON conserve chaque indice de couverture, sa forme étudiée et son sens, puis les décisions par indice avec empreinte de carte entière et état antérieur. Aucun simple seuil de longueur ne valide une phrase, aucun mot-clé ne suffit à choisir la nouvelle destination.

## Changements concrets

- 180 tours entiers sortent du vocabulaire pour rejoindre une situation adaptée.
- 6 quantités numériques isolées (la moitié, le double) rejoignent les nombres.
- 1 concession sans principale reste une forme incomplète réelle ; aucune réserve n’est utilisée simplement pour masquer une mauvaise rubrique.
- Saludos a tu familia. : salutation entière → Saluer, et non Corps/personnes.
- Salirse con la suya. : infinitif idiomatique « arriver à ses fins » → vocabulaire Actions, jamais Voyage.
- Je n’y arrive pas, au train où vont les choses, partir du mauvais pied, mettre tous ses œufs dans le même panier : le sens figuré et la fonction du tour décident de la situation, sans trajet ou repas fictif.
- fishing / la pêche et la pesca (attività) vont dans Loisirs ; a peach / una pesca fruit ne sont pas promus en activité par leur homographie.
- Pièce jointe, permis de conduire, robinet d’eau chaude et porte d’embarquement ont des destinations distinguées d’après l’objet réel, et non pièce, conduire, eau ou porte isolément.

Les autres décisions de la liste peuvent conserver un type correct tout en corrigeant la famille, ou confirmer la destination littérale après examen. Reviewed signifie une décision éditoriale individuelle, pas une validation native ou phonétique.

## Couleurs et adjectifs demandés

Les 16 cartes EN, 15 ES et 15 IT de couleur sont relues dans leur série source et reçoivent color, distinct de adjective. Rose/orange y sont des teintes ; or/argent sont les teintes métalliques dans cette série. Une fleur, un fruit ou l’argent monétaire ailleurs n’est pas déduit de ce classement.

| Couple | Concept | Sources isolées existantes |
|---|---|---|
| fr-en | grand | 3721 L1 : big — grand |
| fr-en | petit | 3722 L1 : small — petit |
| fr-en | gros | Absent après recherche des formes et du sens |
| fr-en | beau-belle | Absent après recherche des formes et du sens |
| fr-en | leger-legere | 3818 L3 : lightweight — léger |
| fr-en | lourd | 3734 L1 : heavy — lourd |
| fr-en | radin | Absent après recherche des formes et du sens |
| fr-en | egoiste | Absent après recherche des formes et du sens |
| fr-en | triste | Absent après recherche des formes et du sens |
| fr-en | heureux | Absent après recherche des formes et du sens |
| fr-es | grand | 4476 L1 : grande — grand |
| fr-es | petit | 4477 L1 : pequeño — petit |
| fr-es | gros | Absent après recherche des formes et du sens |
| fr-es | beau-belle | Absent après recherche des formes et du sens |
| fr-es | leger-legere | Absent après recherche des formes et du sens |
| fr-es | lourd | Absent après recherche des formes et du sens |
| fr-es | radin | Absent après recherche des formes et du sens |
| fr-es | egoiste | Absent après recherche des formes et du sens |
| fr-es | triste | Absent après recherche des formes et du sens |
| fr-es | heureux | Absent après recherche des formes et du sens |
| fr-it | grand | 2703 L1 : grande — grand |
| fr-it | petit | 2704 L1 : piccolo — petit |
| fr-it | gros | Absent après recherche des formes et du sens |
| fr-it | beau-belle | Absent après recherche des formes et du sens |
| fr-it | leger-legere | 2717 L1 : leggero — léger |
| fr-it | lourd | 2716 L1 : pesante — lourd |
| fr-it | radin | Absent après recherche des formes et du sens |
| fr-it | egoiste | Absent après recherche des formes et du sens |
| fr-it | triste | Absent après recherche des formes et du sens |
| fr-it | heureux | Absent après recherche des formes et du sens |

Ces entrées sont reprises entières avec leurs aides originales. Les féminins non présents ne sont pas inventés à partir d’un masculin. Le lot rédigé distinct complète les absences après contrôle ; sa phonétique entière est à vérifier par Claude.

La palette commune manque de violet isolé dans les trois catalogues. Les couleurs EN/IT existantes sont réparties L2–L5 ; les mettre toutes dans une palette pédagogique L1 demanderait une décision de placement explicite distincte, sans changer lv. Aucun des 518 placements existants n’est modifié ici.

Le master nouveau a aussi été recherché par forme étudiée exacte et par sens français. Seul light existait avec un autre sens (lumière/lampe, indice3936) ; l’adjectif léger/légère constitue donc un sens entier nouveau, pas un doublon ou une aide extraite. lightweight, indice3818, reste disponible séparément.

## Trace des corrections de type, classe et destination

| Couple / indice | Forme étudiée | Avant | Décision |
|---|---|---|---|
| fr-en / 74 | Come on! | utterance/deplacements | utterance/conversation |
| fr-en / 216 | It's beautiful here. | utterance/deplacements | utterance/decrire |
| fr-en / 454 | Can I smoke here? | utterance/deplacements | utterance/quotidien |
| fr-en / 629 | I'll print this. | utterance/deplacements | utterance/quotidien |
| fr-en / 877 | I'll turn on the TV. | utterance/deplacements | utterance/quotidien |
| fr-en / 878 | It happens. | utterance/deplacements | utterance/conversation |
| fr-en / 949 | I'll take out the trash. | utterance/deplacements | utterance/quotidien |
| fr-en / 1044 | I spend too much. | utterance/decrire | utterance/repas |
| fr-en / 1101 | I spent too much. | utterance/decrire | utterance/repas |
| fr-en / 1231 | You've got this! | utterance/deplacements | utterance/ressentis |
| fr-en / 1273 | Cross the street. | vocabulary/vocab-voyage | utterance/deplacements |
| fr-en / 1557 | There's no hot water. | utterance/repas | utterance/quotidien |
| fr-en / 1588 | They're breaking up. | utterance/deplacements | utterance/ressentis |
| fr-en / 1834 | Here's my card. | utterance/deplacements | utterance/travail |
| fr-en / 2042 | This side up. | vocabulary/vocab-reperes | utterance/travail |
| fr-en / 2086 | I overcooked the pasta. | utterance/decrire | utterance/repas |
| fr-en / 2125 | Congratulations on your wedding. | vocabulary/vocab-personnes | utterance/saluer |
| fr-en / 2146 | Still, he came in first. | utterance/deplacements | utterance/conversation |
| fr-en / 2149 | That ship has sailed. | utterance/deplacements | utterance/conversation |
| fr-en / 2188 | Sorry for the delay. | vocabulary/vocab-personnes | utterance/saluer |
| fr-en / 2261 | Just scroll down to see more. | utterance/decrire | utterance/quotidien |
| fr-en / 2278 | We got off on the wrong foot. | utterance/deplacements | utterance/conversation |
| fr-en / 2289 | Whatever, it doesn't matter now. | utterance/decrire | utterance/conversation |
| fr-en / 2331 | I can't put my finger on it. | utterance/deplacements | utterance/comprendre |
| fr-en / 2364 | I'll give you the benefit of the doubt. | utterance/deplacements | utterance/conversation |
| fr-en / 2441 | Is the raw material in? | utterance/deplacements | utterance/travail |
| fr-en / 2462 | Several pieces arrived broken. | utterance/deplacements | utterance/travail |
| fr-en / 2507 | Whatever happens, I've got your back. | utterance/deplacements | utterance/ressentis |
| fr-en / 2522 | You know, it happens to everyone. | utterance/deplacements | utterance/conversation |
| fr-en / 2534 | Tidy your room before going out. | utterance/deplacements | utterance/quotidien |
| fr-en / 2590 | You can't make an omelette without breaking eggs. | utterance/repas | utterance/conversation |
| fr-en / 2593 | Don't put all your eggs in one basket. | utterance/repas | utterance/conversation |
| fr-en / 2711 | Let's stay in touch — here's my card. | utterance/deplacements | utterance/travail |
| fr-en / 2714 | That's too much, let's be realistic. | utterance/decrire | utterance/conversation |
| fr-en / 2735 | I look forward to hearing from you. | utterance/comprendre | utterance/travail |
| fr-en / 2775 | If you want, we can go. | utterance/ressentis | utterance/conversation |
| fr-en / 2796 | I hope this email finds you well. | utterance/ressentis | utterance/travail |
| fr-en / 3125 | at the top | vocabulary/vocab-voyage | vocabulary/vocab-adverbes (adverb) |
| fr-en / 3153 | a card | vocabulary/vocab-voyage | vocabulary/vocab-actions (other) |
| fr-en / 3189 | the duty | vocabulary/vocab-voyage | vocabulary/vocab-travail (other) |
| fr-en / 3212 | Study hard. | vocabulary/vocab-travail | utterance/quotidien |
| fr-en / 3254 | The lead time is too long. | utterance/decrire | utterance/travail |
| fr-en / 3312 | a dozen | vocabulary/vocab-actions | number/vocab-actions |
| fr-en / 3408 | The goods arrived damaged. | utterance/deplacements | utterance/travail |
| fr-en / 3420 | Boarding now. | vocabulary/vocab-travail | utterance/deplacements |
| fr-en / 3497 | the vegetable garden | vocabulary/vocab-maison | vocabulary/vocab-nature (other) |
| fr-en / 3525 | The water froze. | utterance/repas | utterance/reperes |
| fr-en / 3547 | sunglasses | vocabulary/vocab-maison | vocabulary/vocab-personnes (other) |
| fr-en / 3552 | The car speeds up. | vocabulary/vocab-voyage | utterance/deplacements |
| fr-en / 3555 | shower gel | vocabulary/vocab-maison | vocabulary/vocab-personnes (other) |
| fr-en / 3570 | the attachment | vocabulary/vocab-maison | vocabulary/vocab-travail (other) |
| fr-en / 3597 | the driver's license | vocabulary/vocab-travail | vocabulary/vocab-voyage (other) |
| fr-en / 3599 | That's the last straw. | utterance/decrire | utterance/ressentis |
| fr-en / 3614 | a sunhat | vocabulary/vocab-maison | vocabulary/vocab-personnes (other) |
| fr-en / 3625 | The water's boiling. | vocabulary/vocab-restaurant | utterance/repas |
| fr-en / 3857 | cycling | vocabulary/vocab-voyage | vocabulary/vocab-loisirs (other) |
| fr-en / 3894 | red | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-en / 3895 | blue | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-en / 3896 | green | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-en / 3897 | yellow | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-en / 3898 | black | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-en / 3899 | white | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-en / 3900 | gray | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-en / 3901 | brown | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-en / 3902 | pink | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-en / 3903 | orange | vocabulary/vocab-actions | vocabulary/vocab-couleurs (color) |
| fr-en / 3904 | beige | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-en / 3905 | dark blue | vocabulary/vocab-actions | vocabulary/vocab-couleurs (color) |
| fr-en / 3906 | light blue | vocabulary/vocab-actions | vocabulary/vocab-couleurs (color) |
| fr-en / 3907 | gold | vocabulary/vocab-actions | vocabulary/vocab-couleurs (color) |
| fr-en / 3908 | golden | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-en / 3909 | silver | vocabulary/vocab-restaurant | vocabulary/vocab-couleurs (color) |
| fr-en / 4076 | a peach | vocabulary/vocab-actions | vocabulary/vocab-restaurant (other) |
| fr-en / 4089 | fishing | vocabulary/vocab-actions | vocabulary/vocab-loisirs (other) |
| fr-en / 4448 | The goods have arrived at the port. | utterance/deplacements | utterance/travail |
| fr-en / 4461 | The way things are going, we'll need more time. | utterance/deplacements | utterance/conversation |
| fr-en / 4474 | I took it literally, word for word. | utterance/deplacements | utterance/comprendre |
| fr-en / 4475 | It's the last straw that breaks the camel's back. | utterance/repas | utterance/ressentis |
| fr-en / 4496 | To be fair, he did apologize. | utterance/saluer | utterance/conversation |
| fr-es / 33 | Lo mismo para mí. | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 53 | No del todo. | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 56 | Seguro que sí. | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 66 | Aquí me tienes. | vocabulary/vocab-voyage | utterance/saluer |
| fr-es / 82 | Lo de siempre. | vocabulary/vocab-maison | vocabulary/vocab-reperes (other) |
| fr-es / 94 | Voy a poder. | utterance/deplacements | utterance/ressentis |
| fr-es / 141 | No me digas más. | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 169 | Me aburre esperar. | vocabulary/vocab-actions | utterance/ressentis |
| fr-es / 172 | Que te vaya bien. | vocabulary/vocab-maison | utterance/saluer |
| fr-es / 175 | Cada vez más. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 178 | Justo a tiempo. | vocabulary/vocab-reperes | vocabulary/vocab-adverbes (adverb) |
| fr-es / 180 | Dentro de poco. | vocabulary/vocab-reperes | vocabulary/vocab-adverbes (adverb) |
| fr-es / 184 | Tú primero. | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 217 | Que se mejore. | vocabulary/vocab-actions | utterance/saluer |
| fr-es / 226 | Cada vez mejor. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 231 | No lo tires. | vocabulary/vocab-actions | utterance/quotidien |
| fr-es / 269 | No muy corto. | vocabulary/vocab-actions | vocabulary/vocab-adjectifs (adjective) |
| fr-es / 284 | Pase lo que pase. | utterance/deplacements | incomplete/deplacements |
| fr-es / 292 | Hasta la vista. | vocabulary/vocab-actions | utterance/saluer |
| fr-es / 312 | Igual de bueno. | vocabulary/vocab-actions | vocabulary/vocab-adjectifs (adjective) |
| fr-es / 337 | Hasta la próxima. | vocabulary/vocab-actions | utterance/saluer |
| fr-es / 339 | No te molestes. | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 345 | No tan bueno. | vocabulary/vocab-actions | vocabulary/vocab-adjectifs (adjective) |
| fr-es / 356 | No me funciona la tarjeta. | utterance/deplacements | utterance/quotidien |
| fr-es / 362 | Disculpe mi español. | vocabulary/vocab-personnes | utterance/conversation |
| fr-es / 367 | Cualquiera me vale. | vocabulary/vocab-voyage | utterance/conversation |
| fr-es / 379 | No te preocupes. | vocabulary/vocab-actions | utterance/ressentis |
| fr-es / 380 | Tarde o temprano. | vocabulary/vocab-reperes | vocabulary/vocab-adverbes (adverb) |
| fr-es / 389 | ¡Qué pena! | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 416 | No te enfades. | vocabulary/vocab-actions | utterance/ressentis |
| fr-es / 417 | No te culpes. | vocabulary/vocab-personnes | utterance/ressentis |
| fr-es / 467 | ¿Aceptan tarjeta? | utterance/deplacements | utterance/repas |
| fr-es / 488 | ¿Es resistente al agua? | utterance/repas | utterance/decrire |
| fr-es / 528 | Cae bien a todos. | vocabulary/vocab-actions | utterance/ressentis |
| fr-es / 574 | Que vaya bien. | vocabulary/vocab-maison | utterance/saluer |
| fr-es / 575 | Ambos me convencen. | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 582 | Me tiemblan las manos. | vocabulary/vocab-personnes | utterance/ressentis |
| fr-es / 618 | Solo las puntas. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 629 | Tú puedes con esto. | utterance/deplacements | utterance/ressentis |
| fr-es / 653 | ¡Feliz Navidad! | vocabulary/vocab-actions | utterance/saluer |
| fr-es / 661 | Qué día tan largo. | vocabulary/vocab-reperes | utterance/reperes |
| fr-es / 674 | Conéctate al wifi. | vocabulary/vocab-actions | utterance/quotidien |
| fr-es / 692 | Encantado de ayudar. | vocabulary/vocab-personnes | utterance/ressentis |
| fr-es / 708 | Todo va sobre ruedas. | vocabulary/vocab-actions | utterance/ressentis |
| fr-es / 720 | ¡Qué emoción! | vocabulary/vocab-personnes | utterance/ressentis |
| fr-es / 722 | Me quito el sombrero. | vocabulary/vocab-actions | utterance/ressentis |
| fr-es / 739 | Vamos de tapas. | vocabulary/vocab-restaurant | utterance/repas |
| fr-es / 765 | No me decido. | utterance/deplacements | utterance/ressentis |
| fr-es / 770 | Se avecina tormenta. | vocabulary/vocab-actions | utterance/reperes |
| fr-es / 779 | Claro que no. | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 818 | Resta el descuento. | vocabulary/vocab-actions | utterance/repas |
| fr-es / 829 | ¡Qué mala suerte! | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 843 | ¡Felices fiestas! | vocabulary/vocab-actions | utterance/saluer |
| fr-es / 862 | Déjeme aquí mismo. | vocabulary/vocab-voyage | utterance/deplacements |
| fr-es / 875 | Qué bochorno hace. | vocabulary/vocab-actions | utterance/reperes |
| fr-es / 888 | Me entusiasma la idea. | vocabulary/vocab-actions | utterance/ressentis |
| fr-es / 908 | Siempre a tu servicio. | vocabulary/vocab-reperes | utterance/conversation |
| fr-es / 913 | Divide entre cuatro. | vocabulary/vocab-actions | utterance/reperes |
| fr-es / 935 | Que pases buena noche. | vocabulary/vocab-reperes | utterance/saluer |
| fr-es / 942 | No me lo puedo creer. | utterance/deplacements | utterance/ressentis |
| fr-es / 943 | ¡No me lo puedo creer! | utterance/deplacements | utterance/ressentis |
| fr-es / 958 | ¿Viene desmontado? | utterance/deplacements | utterance/travail |
| fr-es / 1008 | Pica la cebolla. | vocabulary/vocab-actions | utterance/repas |
| fr-es / 1009 | Escanea el código. | vocabulary/vocab-actions | utterance/quotidien |
| fr-es / 1011 | Me fascina este lugar. | vocabulary/vocab-actions | utterance/ressentis |
| fr-es / 1033 | ¡Qué lástima! | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 1034 | ¡Qué alivio! | vocabulary/vocab-actions | utterance/ressentis |
| fr-es / 1069 | No hay agua caliente. | utterance/repas | utterance/quotidien |
| fr-es / 1076 | ¿Me trae la carta? | utterance/deplacements | utterance/repas |
| fr-es / 1092 | Buenas noches a todos. | vocabulary/vocab-reperes | utterance/saluer |
| fr-es / 1095 | Reduce los costes. | vocabulary/vocab-actions | utterance/travail |
| fr-es / 1096 | Pela la fruta. | vocabulary/vocab-restaurant | utterance/repas |
| fr-es / 1106 | Se me bloqueó la tarjeta. | utterance/deplacements | utterance/quotidien |
| fr-es / 1118 | Se corta la llamada. | vocabulary/vocab-actions | utterance/quotidien |
| fr-es / 1172 | Redondee hacia abajo. | vocabulary/vocab-actions | utterance/repas |
| fr-es / 1188 | Qué noche tan estrellada. | vocabulary/vocab-reperes | utterance/reperes |
| fr-es / 1199 | Perdona el retraso. | vocabulary/vocab-personnes | utterance/saluer |
| fr-es / 1225 | Que no falle nada. | vocabulary/vocab-actions | utterance/ressentis |
| fr-es / 1257 | Cruza la calle. | vocabulary/vocab-voyage | utterance/deplacements |
| fr-es / 1268 | Prioricemos lo importante. | vocabulary/vocab-actions | utterance/travail |
| fr-es / 1290 | Perdón por la molestia. | vocabulary/vocab-personnes | utterance/saluer |
| fr-es / 1297 | ¡Qué sorpresa! | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 1302 | ¡Qué fastidio! | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 1306 | No doy abasto. | utterance/deplacements | utterance/ressentis |
| fr-es / 1307 | Piensa en positivo. | vocabulary/vocab-actions | utterance/ressentis |
| fr-es / 1319 | ¡Vamos a la playa! | vocabulary/vocab-voyage | utterance/deplacements |
| fr-es / 1320 | ¡Salud y suerte! | vocabulary/vocab-personnes | utterance/ressentis |
| fr-es / 1373 | Voy a lograrlo. | utterance/deplacements | utterance/ressentis |
| fr-es / 1394 | Vamos a comprobarlo. | vocabulary/vocab-voyage | utterance/conversation |
| fr-es / 1405 | Démosle una vuelta. | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 1471 | ¿Lo cargo a la tarjeta? | utterance/deplacements | utterance/repas |
| fr-es / 1482 | Aquí hay poca cobertura. | utterance/deplacements | utterance/quotidien |
| fr-es / 1507 | Encantado de conocerte. | vocabulary/vocab-actions | utterance/saluer |
| fr-es / 1537 | Ojo con el escalón. | vocabulary/vocab-actions | utterance/deplacements |
| fr-es / 1568 | Qué clima tan agradable. | vocabulary/vocab-reperes | utterance/reperes |
| fr-es / 1603 | Aquí tiene mi tarjeta. | utterance/deplacements | utterance/conversation |
| fr-es / 1623 | Qué vistas tan bonitas. | vocabulary/vocab-actions | utterance/reperes |
| fr-es / 1668 | Saludos a tu familia. | vocabulary/vocab-personnes | utterance/saluer |
| fr-es / 1674 | Vive el presente. | vocabulary/vocab-maison | utterance/quotidien |
| fr-es / 1680 | Más de la cuenta. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 1784 | Pásame las tijeras. | vocabulary/vocab-actions | utterance/quotidien |
| fr-es / 1816 | ¡Que viva la fiesta! | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 1869 | Perdón por interrumpir. | vocabulary/vocab-personnes | utterance/saluer |
| fr-es / 1879 | Se me ha caducado la tarjeta. | utterance/deplacements | utterance/quotidien |
| fr-es / 1981 | Sopla brisa fresca. | vocabulary/vocab-actions | utterance/reperes |
| fr-es / 2076 | Voy a conseguirlo. | utterance/deplacements | utterance/ressentis |
| fr-es / 2078 | Transfiéreme el dinero. | vocabulary/vocab-restaurant | utterance/repas |
| fr-es / 2079 | Voy a crear algo nuevo. | utterance/deplacements | utterance/quotidien |
| fr-es / 2112 | Empezamos con mal pie. | utterance/deplacements | utterance/conversation |
| fr-es / 2113 | Aun así, llegó el primero. | utterance/deplacements | utterance/conversation |
| fr-es / 2185 | Hasta nuestro próximo pedido. | vocabulary/vocab-travail | utterance/travail |
| fr-es / 2190 | Ajusten el color. | vocabulary/vocab-actions | utterance/travail |
| fr-es / 2250 | Encantado de hacer negocios. | vocabulary/vocab-actions | utterance/travail |
| fr-es / 2311 | Estoy deseando que llegue. | utterance/deplacements | utterance/ressentis |
| fr-es / 2352 | Cerremos a este precio. | vocabulary/vocab-restaurant | utterance/repas |
| fr-es / 2357 | Nuestro equipo habla inglés. | vocabulary/vocab-actions | utterance/travail |
| fr-es / 2362 | Mantengan este estándar. | vocabulary/vocab-actions | utterance/travail |
| fr-es / 2369 | Agendemos una reunión. | vocabulary/vocab-travail | utterance/travail |
| fr-es / 2372 | Procedan con la producción. | vocabulary/vocab-actions | utterance/travail |
| fr-es / 2428 | Podemos llegar a un acuerdo. | utterance/deplacements | utterance/conversation |
| fr-es / 2494 | Ese barco ya zarpó. | utterance/deplacements | utterance/conversation |
| fr-es / 2533 | Repartamos los costes. | vocabulary/vocab-actions | utterance/travail |
| fr-es / 2568 | Brindemos por el acuerdo. | vocabulary/vocab-actions | utterance/travail |
| fr-es / 2631 | No hay agua caliente en la habitación. | utterance/repas | utterance/quotidien |
| fr-es / 2650 | Pase lo que pase, te apoyo. | utterance/deplacements | utterance/ressentis |
| fr-es / 2656 | No consigo concentrarme. | utterance/deplacements | utterance/ressentis |
| fr-es / 2693 | Te daré el beneficio de la duda. | utterance/deplacements | utterance/conversation |
| fr-es / 2754 | ¿Ya llegó la materia prima? | utterance/deplacements | utterance/travail |
| fr-es / 2856 | Varias piezas llegaron rotas. | utterance/deplacements | utterance/travail |
| fr-es / 2860 | Consolidemos los pedidos. | vocabulary/vocab-actions | utterance/travail |
| fr-es / 2873 | Optimicemos el flete. | vocabulary/vocab-actions | utterance/travail |
| fr-es / 2904 | Cerremos los flecos. | vocabulary/vocab-reperes | utterance/travail |
| fr-es / 2994 | No se puede hacer tortilla sin romper huevos. | utterance/repas | utterance/conversation |
| fr-es / 3021 | No pongas todos los huevos en la misma cesta. | utterance/repas | utterance/conversation |
| fr-es / 3046 | Tal como van las cosas, necesitaremos más tiempo. | utterance/deplacements | utterance/conversation |
| fr-es / 3121 | Protejan nuestra propiedad intelectual. | vocabulary/vocab-actions | utterance/travail |
| fr-es / 3213 | ¿Este lote va por mar o por avión? | utterance/deplacements | utterance/travail |
| fr-es / 3214 | Sigamos en contacto, aquí tiene mi tarjeta. | utterance/deplacements | utterance/travail |
| fr-es / 3250 | Agrupemos el envío. | vocabulary/vocab-actions | utterance/travail |
| fr-es / 3292 | Atentamente, le saluda. | vocabulary/vocab-actions | utterance/travail |
| fr-es / 3430 | Muy bien. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3433 | Nada más. | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 3437 | ¡Vaya! | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 3443 | ¡Qué va! | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 3445 | Como mucho. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3447 | A ver. | vocabulary/vocab-actions | utterance/comprendre |
| fr-es / 3450 | Mucho mejor. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3453 | Como poco. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3457 | Lo mismo. | vocabulary/vocab-actions | vocabulary/vocab-adjectifs (adjective) |
| fr-es / 3466 | Ni hablar. | vocabulary/vocab-actions | utterance/comprendre |
| fr-es / 3471 | Hoy no. | vocabulary/vocab-reperes | utterance/reperes |
| fr-es / 3481 | ¡Y tanto! | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 3485 | En serio. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3488 | Buen trabajo. | vocabulary/vocab-travail | utterance/travail |
| fr-es / 3489 | Más tarde. | vocabulary/vocab-reperes | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3493 | Ni idea. | vocabulary/vocab-actions | utterance/comprendre |
| fr-es / 3494 | De cabeza. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3497 | Buena idea. | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 3511 | ¡Qué suerte! | vocabulary/vocab-actions | utterance/ressentis |
| fr-es / 3512 | Casi nunca. | vocabulary/vocab-reperes | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3515 | A lo mejor. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3529 | ¡Por fin! | vocabulary/vocab-reperes | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3530 | Bastante bien. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3536 | ¡Claro que sí! | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 3544 | A por todas. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3546 | En parte sí. | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 3553 | Da igual. | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 3555 | Por las buenas. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3588 | ¡Madre mía! | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 3589 | Igual que siempre. | vocabulary/vocab-reperes | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3591 | Tal cual. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3600 | Ni más ni menos. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3603 | Punto y final. | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 3613 | Por supuesto que sí. | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 3619 | La mitad. | vocabulary/vocab-reperes | number/vocab-reperes |
| fr-es / 3621 | ¡No me digas! | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 3624 | Con el tiempo justo. | vocabulary/vocab-reperes | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3634 | Estar en su punto. | vocabulary/vocab-actions | vocabulary/vocab-restaurant (other) |
| fr-es / 3637 | Ir a lo loco. | vocabulary/vocab-personnes | vocabulary/vocab-actions (other) |
| fr-es / 3650 | Salud. | vocabulary/vocab-personnes | utterance/saluer |
| fr-es / 3668 | No me da la vida. | utterance/deplacements | utterance/ressentis |
| fr-es / 3673 | Estar sin un duro. | vocabulary/vocab-actions | vocabulary/vocab-restaurant (other) |
| fr-es / 3677 | A toda prisa. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3680 | Ni de broma. | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 3683 | Un placer verte. | vocabulary/vocab-actions | utterance/saluer |
| fr-es / 3686 | A la derecha. | vocabulary/vocab-voyage | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3696 | A la izquierda. | vocabulary/vocab-voyage | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3698 | Una mesa para dos. | vocabulary/vocab-maison | vocabulary/vocab-restaurant (other) |
| fr-es / 3699 | A ojo. | vocabulary/vocab-personnes | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3704 | De golpe. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3712 | El doble. | vocabulary/vocab-actions | number/vocab-actions |
| fr-es / 3730 | Exacto. | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 3739 | Buena elección. | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 3745 | A su debido tiempo. | vocabulary/vocab-reperes | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3748 | Una habitación doble. | vocabulary/vocab-maison | vocabulary/vocab-voyage (other) |
| fr-es / 3757 | Por unidad. | vocabulary/vocab-actions | vocabulary/vocab-travail (other) |
| fr-es / 3758 | Manos a la obra. | vocabulary/vocab-travail | utterance/travail |
| fr-es / 3764 | El doble de rápido. | vocabulary/vocab-reperes | vocabulary/vocab-adjectifs (adjective) |
| fr-es / 3779 | Ser el alma de la fiesta. | vocabulary/vocab-voyage | vocabulary/vocab-personnes (other) |
| fr-es / 3784 | Tener los pies en la tierra. | vocabulary/vocab-maison | vocabulary/vocab-personnes (other) |
| fr-es / 3790 | Estar de mala leche. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 3797 | Al por menor. | vocabulary/vocab-actions | vocabulary/vocab-restaurant (other) |
| fr-es / 3799 | Da recuerdos. | vocabulary/vocab-personnes | utterance/saluer |
| fr-es / 3800 | Tener cara dura. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 3801 | Tener ángel. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 3802 | Tener la negra. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 3805 | Muchos recuerdos. | vocabulary/vocab-actions | utterance/saluer |
| fr-es / 3806 | Tener un día de perros. | vocabulary/vocab-reperes | vocabulary/vocab-personnes (other) |
| fr-es / 3819 | Un placer haberte conocido. | vocabulary/vocab-actions | utterance/saluer |
| fr-es / 3823 | Poner las cartas sobre la mesa. | vocabulary/vocab-maison | vocabulary/vocab-actions (other) |
| fr-es / 3829 | Estar hecho un brazo de mar. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 3839 | Estar en la gloria. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 3841 | Rara vez. | vocabulary/vocab-reperes | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3847 | Estar como una rosa. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 3849 | Un esfuerzo más. | vocabulary/vocab-reperes | utterance/ressentis |
| fr-es / 3852 | Sin compromiso. | vocabulary/vocab-actions | vocabulary/vocab-travail (other) |
| fr-es / 3854 | Un poco más corto. | vocabulary/vocab-actions | vocabulary/vocab-adjectifs (adjective) |
| fr-es / 3873 | Lo consigo. | utterance/deplacements | utterance/ressentis |
| fr-es / 3881 | Estar pez. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 3883 | ¡Qué casualidad! | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 3884 | Ponerse al día. | vocabulary/vocab-reperes | vocabulary/vocab-actions (other) |
| fr-es / 3886 | Meter la nariz. | vocabulary/vocab-personnes | vocabulary/vocab-actions (other) |
| fr-es / 3890 | Estar entre la espada y la pared. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 3893 | Estar a la altura. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 3894 | Al final del pasillo. | vocabulary/vocab-actions | vocabulary/vocab-prepositions (other) |
| fr-es / 3896 | Estar en su salsa. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 3897 | Ser un cero a la izquierda. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 3905 | Con paciencia se consigue. | utterance/deplacements | utterance/ressentis |
| fr-es / 3912 | Suelta lo que sea. | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 3917 | Estar como pez en el agua. | vocabulary/vocab-restaurant | vocabulary/vocab-personnes (other) |
| fr-es / 3919 | Estar como pez fuera del agua. | vocabulary/vocab-restaurant | vocabulary/vocab-personnes (other) |
| fr-es / 3921 | El total con impuestos. | vocabulary/vocab-actions | vocabulary/vocab-restaurant (other) |
| fr-es / 3922 | Echar humo. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 3926 | Estar como una moto. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 3930 | Justo enfrente. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3932 | Estar en un mar de dudas. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 3936 | Tener buena pata. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 3938 | Como mínimo. | vocabulary/vocab-travail | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3945 | Un fuerte abrazo. | vocabulary/vocab-actions | utterance/saluer |
| fr-es / 3948 | Al grano. | vocabulary/vocab-voyage | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3951 | Ir de punta en blanco. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 3955 | Ponerse las botas. | vocabulary/vocab-actions | vocabulary/vocab-restaurant (other) |
| fr-es / 3961 | Con frecuencia. | vocabulary/vocab-reperes | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3967 | Un abrazo enorme. | vocabulary/vocab-actions | utterance/saluer |
| fr-es / 3972 | Hacer la vista gorda. | vocabulary/vocab-personnes | vocabulary/vocab-actions (other) |
| fr-es / 3974 | Igualmente. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 3979 | Estar entre dos aguas. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 3985 | Ser un as. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 3990 | La batería dura poco. | vocabulary/vocab-actions | utterance/quotidien |
| fr-es / 3995 | El plástico huele mal. | vocabulary/vocab-actions | utterance/decrire |
| fr-es / 3996 | ¡Qué rollo! | vocabulary/vocab-actions | utterance/ressentis |
| fr-es / 3997 | Estar a dos velas. | vocabulary/vocab-actions | vocabulary/vocab-restaurant (other) |
| fr-es / 4000 | Estar al pie del cañón. | vocabulary/vocab-personnes | vocabulary/vocab-actions (other) |
| fr-es / 4002 | Estar en la onda. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4004 | Ánimo. | vocabulary/vocab-actions | utterance/ressentis |
| fr-es / 4009 | El tiempo vuela. | vocabulary/vocab-reperes | utterance/reperes |
| fr-es / 4021 | Lo logro. | utterance/deplacements | utterance/ressentis |
| fr-es / 4022 | A toro pasado. | vocabulary/vocab-reperes | vocabulary/vocab-adverbes (adverb) |
| fr-es / 4023 | ¡Caramba! | vocabulary/vocab-actions | utterance/ressentis |
| fr-es / 4027 | Estar de capa caída. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4028 | Estar como una cabra. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4034 | Menudo alivio. | vocabulary/vocab-actions | utterance/ressentis |
| fr-es / 4038 | El negocio crece. | vocabulary/vocab-actions | utterance/travail |
| fr-es / 4048 | Dar la talla. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4052 | De sobra. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 4055 | El producto no enciende. | vocabulary/vocab-actions | utterance/quotidien |
| fr-es / 4071 | Sin ánimo de ofender. | vocabulary/vocab-personnes | utterance/conversation |
| fr-es / 4072 | No ver tres en un burro. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4079 | La transferencia no ha llegado. | utterance/deplacements | utterance/travail |
| fr-es / 4082 | Con pelos y señales. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 4084 | El coche no arranca. | vocabulary/vocab-voyage | utterance/deplacements |
| fr-es / 4090 | A las mil maravillas. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 4093 | A nombre de Li. | vocabulary/vocab-actions | vocabulary/vocab-travail (other) |
| fr-es / 4095 | Salir rana. | vocabulary/vocab-personnes | vocabulary/vocab-actions (other) |
| fr-es / 4107 | Todo recto. | vocabulary/vocab-voyage | vocabulary/vocab-adverbes (adverb) |
| fr-es / 4114 | Apártate. | vocabulary/vocab-actions | utterance/deplacements |
| fr-es / 4118 | Sin rencor. | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 4124 | Dar en el clavo. | vocabulary/vocab-reperes | vocabulary/vocab-actions (other) |
| fr-es / 4132 | Con actitud positiva. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4138 | Estar en el séptimo cielo. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4140 | El producto llegó dañado. | utterance/deplacements | utterance/travail |
| fr-es / 4141 | Suéltalo. | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 4143 | Llegó dañado. | utterance/deplacements | utterance/travail |
| fr-es / 4145 | No grites. | vocabulary/vocab-actions | utterance/comprendre |
| fr-es / 4148 | Aprieta bien. | vocabulary/vocab-actions | utterance/quotidien |
| fr-es / 4153 | Ser la oveja negra. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4156 | Tráelo aquí. | utterance/deplacements | utterance/quotidien |
| fr-es / 4161 | Llover sobre mojado. | vocabulary/vocab-personnes | vocabulary/vocab-actions (other) |
| fr-es / 4169 | Costar un riñón. | vocabulary/vocab-actions | vocabulary/vocab-restaurant (other) |
| fr-es / 4172 | Pasarlo en grande. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4178 | Hacer de tripas corazón. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4180 | Tener chispa. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4184 | Pillar con las manos en la masa. | vocabulary/vocab-personnes | vocabulary/vocab-actions (other) |
| fr-es / 4185 | A tope. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 4188 | Para variar. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 4190 | Salirse con la suya. | vocabulary/vocab-voyage | vocabulary/vocab-actions (other) |
| fr-es / 4191 | Coser y cantar. | vocabulary/vocab-personnes | vocabulary/vocab-actions (other) |
| fr-es / 4201 | Sin previo aviso. | vocabulary/vocab-actions | vocabulary/vocab-travail (other) |
| fr-es / 4203 | No corras. | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 4206 | Estar como un roble. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4211 | Estar al loro. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4214 | A grandes rasgos. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 4224 | Estar en el candelero. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4225 | Estar en un sinvivir. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4228 | Ser el ojito derecho. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4229 | Romperse la cabeza. | vocabulary/vocab-personnes | vocabulary/vocab-actions (other) |
| fr-es / 4230 | Ser el garbanzo negro. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4234 | Ponerse morado. | vocabulary/vocab-actions | vocabulary/vocab-restaurant (other) |
| fr-es / 4240 | No te enrolles. | vocabulary/vocab-actions | utterance/comprendre |
| fr-es / 4241 | Liarse la manta a la cabeza. | vocabulary/vocab-personnes | vocabulary/vocab-actions (other) |
| fr-es / 4242 | Ser la comidilla. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4243 | Estar en Babia. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4244 | Estar entre algodones. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4246 | Ser la gota que colma el vaso. | vocabulary/vocab-restaurant | vocabulary/vocab-actions (other) |
| fr-es / 4249 | Hacer oídos sordos. | vocabulary/vocab-personnes | vocabulary/vocab-actions (other) |
| fr-es / 4251 | Sacar de quicio. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4256 | Llevarse un chasco. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4257 | Hablar por los codos. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4280 | Mézclalo bien. | vocabulary/vocab-actions | utterance/quotidien |
| fr-es / 4282 | Pégalo aquí. | vocabulary/vocab-voyage | utterance/quotidien |
| fr-es / 4285 | Sin pasarse. | vocabulary/vocab-actions | vocabulary/vocab-adverbes (adverb) |
| fr-es / 4288 | Anímate. | vocabulary/vocab-actions | utterance/ressentis |
| fr-es / 4293 | Írsele la olla. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4296 | ¡Hala! | vocabulary/vocab-actions | utterance/ressentis |
| fr-es / 4299 | Dar el callo. | vocabulary/vocab-actions | vocabulary/vocab-travail (other) |
| fr-es / 4303 | ¡Uf! | vocabulary/vocab-actions | utterance/ressentis |
| fr-es / 4305 | Hacer castillos en el aire. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4325 | Cortar el bacalao. | vocabulary/vocab-reperes | vocabulary/vocab-actions (other) |
| fr-es / 4329 | Convénceme. | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 4332 | Bórralo. | vocabulary/vocab-actions | utterance/quotidien |
| fr-es / 4338 | El avión aterriza pronto. | vocabulary/vocab-voyage | utterance/deplacements |
| fr-es / 4344 | Ir pisando huevos. | vocabulary/vocab-restaurant | vocabulary/vocab-actions (other) |
| fr-es / 4345 | Írsele la pinza. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4346 | ¡No fastidies! | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 4353 | Ser un manitas. | vocabulary/vocab-actions | vocabulary/vocab-loisirs (other) |
| fr-es / 4355 | Estar en la luna de Valencia. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4363 | Tener enchufe. | vocabulary/vocab-actions | vocabulary/vocab-travail (other) |
| fr-es / 4368 | Sacar de sus casillas. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4373 | El agua hierve. | vocabulary/vocab-restaurant | utterance/repas |
| fr-es / 4376 | Un cordial saludo. | vocabulary/vocab-actions | utterance/travail |
| fr-es / 4378 | Crucemos los dedos. | vocabulary/vocab-actions | utterance/ressentis |
| fr-es / 4381 | Estar como un flan. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4386 | Importar un pimiento. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4395 | Anteayer. | vocabulary/vocab-reperes | vocabulary/vocab-adverbes (adverb) |
| fr-es / 4402 | Estar como un fideo. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4403 | Seamos flexibles. | vocabulary/vocab-actions | utterance/conversation |
| fr-es / 4407 | Con IVA incluido. | vocabulary/vocab-actions | vocabulary/vocab-restaurant (other) |
| fr-es / 4409 | Pásamelo. | vocabulary/vocab-actions | utterance/quotidien |
| fr-es / 4414 | Sin IVA. | vocabulary/vocab-actions | vocabulary/vocab-restaurant (other) |
| fr-es / 4425 | Tener labia. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4429 | Cruzarse de brazos. | vocabulary/vocab-personnes | vocabulary/vocab-actions (other) |
| fr-es / 4430 | Sin intermediarios. | vocabulary/vocab-actions | vocabulary/vocab-travail (other) |
| fr-es / 4432 | Irse al garete. | vocabulary/vocab-restaurant | vocabulary/vocab-actions (other) |
| fr-es / 4438 | Tomárselo con filosofía. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4443 | Estar en la parra. | vocabulary/vocab-actions | vocabulary/vocab-personnes (other) |
| fr-es / 4448 | Ser un chollo. | vocabulary/vocab-actions | vocabulary/vocab-restaurant (other) |
| fr-es / 4455 | Ir sobrado. | vocabulary/vocab-voyage | vocabulary/vocab-actions (other) |
| fr-es / 4497 | rojo | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-es / 4498 | azul | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-es / 4499 | verde | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-es / 4500 | negro | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-es / 4501 | blanco | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-es / 4529 | La mercancía ha llegado al puerto. | utterance/deplacements | utterance/travail |
| fr-es / 4538 | Grabemos esto. | vocabulary/vocab-actions | utterance/quotidien |
| fr-es / 4550 | amarillo | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-es / 4551 | gris | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-es / 4552 | marrón | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-es / 4553 | rosa | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-es / 4554 | naranja | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-es / 4555 | beige | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-es / 4556 | dorado | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-es / 4557 | plateado | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-es / 4558 | azul oscuro | vocabulary/vocab-actions | vocabulary/vocab-couleurs (color) |
| fr-es / 4559 | azul claro | vocabulary/vocab-actions | vocabulary/vocab-couleurs (color) |
| fr-es / 4578 | Aquí está. | vocabulary/vocab-voyage | utterance/quotidien |
| fr-es / 4614 | Es la gota que colma el vaso. | utterance/repas | utterance/ressentis |
| fr-es / 4615 | Me lo tomé al pie de la letra. | utterance/deplacements | utterance/comprendre |
| fr-es / 4650 | Por más que lo intente, no funciona. | utterance/repas | utterance/ressentis |
| fr-it / 114 | Posso fumare qui? | utterance/deplacements | utterance/quotidien |
| fr-it / 157 | È bello qui. | utterance/deplacements | utterance/decrire |
| fr-it / 426 | Ecco la mia carta. | utterance/deplacements | utterance/conversation |
| fr-it / 427 | Ecco la sua carta. | utterance/deplacements | utterance/conversation |
| fr-it / 471 | Non lo farò più. | utterance/decrire | utterance/conversation |
| fr-it / 475 | Mi piaci molto. | utterance/decrire | utterance/ressentis |
| fr-it / 532 | Mi ha toccato molto. | utterance/decrire | utterance/ressentis |
| fr-it / 536 | Mi manchi tanto. | utterance/decrire | utterance/ressentis |
| fr-it / 633 | È a buon mercato. | utterance/decrire | utterance/repas |
| fr-it / 728 | Posso vedere il menù? | utterance/deplacements | utterance/repas |
| fr-it / 771 | Accettate la carta? | utterance/deplacements | utterance/repas |
| fr-it / 777 | Attraversa la strada. | vocabulary/vocab-voyage | utterance/deplacements |
| fr-it / 797 | Ce la farai! | utterance/deplacements | utterance/ressentis |
| fr-it / 879 | L'acqua è gelata. | utterance/repas | utterance/reperes |
| fr-it / 1085 | Vorrei vedere il menù. | utterance/deplacements | utterance/repas |
| fr-it / 1151 | Ce la faremo. | utterance/deplacements | utterance/ressentis |
| fr-it / 1236 | Ho cotto troppo la pasta. | utterance/decrire | utterance/repas |
| fr-it / 1287 | l'ordine del giorno | vocabulary/vocab-reperes | vocabulary/vocab-travail (other) |
| fr-it / 1304 | Non c'è acqua calda. | utterance/repas | utterance/quotidien |
| fr-it / 1358 | Si stanno lasciando. | utterance/deplacements | utterance/ressentis |
| fr-it / 1558 | Ci sto riflettendo. | utterance/deplacements | utterance/conversation |
| fr-it / 1606 | Scusa il ritardo. | vocabulary/vocab-personnes | utterance/saluer |
| fr-it / 1630 | Non riesco a crederci. | utterance/deplacements | utterance/ressentis |
| fr-it / 1640 | Non riesco a crederci! | utterance/deplacements | utterance/ressentis |
| fr-it / 1646 | Tentar non costa nulla. | utterance/repas | utterance/conversation |
| fr-it / 1724 | Ottimo lavoro a tutti. | vocabulary/vocab-travail | utterance/travail |
| fr-it / 1826 | Accendo la TV. | utterance/deplacements | utterance/quotidien |
| fr-it / 1936 | Non riesco a connettermi. | utterance/deplacements | utterance/quotidien |
| fr-it / 1946 | Resta il fatto che è arrivato primo. | utterance/deplacements | utterance/conversation |
| fr-it / 2021 | Fissiamo una data limite. | vocabulary/vocab-reperes | utterance/travail |
| fr-it / 2051 | Questo lato verso l'alto. | vocabulary/vocab-reperes | utterance/travail |
| fr-it / 2061 | Registriamo la riunione. | vocabulary/vocab-travail | utterance/travail |
| fr-it / 2116 | Qualunque cosa succeda, ti sostengo. | utterance/deplacements | utterance/ressentis |
| fr-it / 2134 | Qualunque cosa succeda, ci sarò. | utterance/deplacements | utterance/ressentis |
| fr-it / 2158 | Riordina la camera prima di uscire. | utterance/deplacements | utterance/quotidien |
| fr-it / 2178 | Diversi pezzi sono arrivati rotti. | utterance/deplacements | utterance/travail |
| fr-it / 2215 | Non si fa la frittata senza rompere le uova. | utterance/repas | utterance/conversation |
| fr-it / 2391 | Restiamo in contatto, ecco il mio biglietto. | utterance/deplacements | utterance/travail |
| fr-it / 2437 | Ne ha più di una nella manica. | utterance/decrire | utterance/conversation |
| fr-it / 2487 | Però, avrebbe potuto avvisare! | utterance/decrire | utterance/conversation |
| fr-it / 2490 | Vi preghiamo di trattare questo reclamo in priorità. | utterance/saluer | utterance/travail |
| fr-it / 2509 | Ti avviserò appena ne saprò di più. | utterance/decrire | utterance/conversation |
| fr-it / 2516 | — Non trovi che sia troppo? — Sì, dovremmo rallentare. | utterance/decrire | utterance/conversation |
| fr-it / 2849 | Buon lavoro. | vocabulary/vocab-travail | utterance/travail |
| fr-it / 2972 | rosso | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-it / 2973 | nero | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-it / 3044 | a sinistra | vocabulary/vocab-voyage | vocabulary/vocab-adverbes (adverb) |
| fr-it / 3052 | la metà | vocabulary/vocab-reperes | number/vocab-reperes |
| fr-it / 3074 | a destra | vocabulary/vocab-voyage | vocabulary/vocab-adverbes (adverb) |
| fr-it / 3131 | blu | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-it / 3132 | verde | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-it / 3133 | bianco | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-it / 3134 | rosa | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-it / 3135 | azzurro | vocabulary/vocab-actions | vocabulary/vocab-couleurs (color) |
| fr-it / 3268 | Sto cucinando. | utterance/deplacements | utterance/repas |
| fr-it / 3346 | Gli farò un regalo. | utterance/deplacements | utterance/quotidien |
| fr-it / 3365 | giallo | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-it / 3366 | grigio | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-it / 3367 | arancione | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-it / 3429 | una pesca | vocabulary/vocab-actions | vocabulary/vocab-restaurant (other) |
| fr-it / 3433 | la pesca (attività) | vocabulary/vocab-actions | vocabulary/vocab-loisirs (other) |
| fr-it / 3599 | sopra | vocabulary/vocab-reperes | vocabulary/vocab-adverbes (adverb) |
| fr-it / 3603 | la patente | vocabulary/vocab-travail | vocabulary/vocab-voyage (other) |
| fr-it / 3618 | Il bambino piange. | vocabulary/vocab-personnes | utterance/ressentis |
| fr-it / 3635 | Il bambino dorme. | vocabulary/vocab-personnes | utterance/quotidien |
| fr-it / 3661 | marrone | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-it / 3662 | beige | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-it / 3663 | blu scuro | vocabulary/vocab-actions | vocabulary/vocab-couleurs (color) |
| fr-it / 3664 | dorato | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-it / 3665 | argentato | vocabulary/vocab-adjectifs | vocabulary/vocab-couleurs (color) |
| fr-it / 3868 | A forza di provare, ci riuscirai. | utterance/repas | utterance/ressentis |
| fr-it / 3873 | In ogni caso, non abbiamo più scelta. | utterance/decrire | utterance/conversation |
| fr-it / 3881 | Buona giornata. | vocabulary/vocab-personnes | utterance/saluer |
| fr-it / 3888 | gli occhiali da sole | vocabulary/vocab-maison | vocabulary/vocab-personnes (other) |
| fr-it / 3895 | un'erbaccia | vocabulary/vocab-maison | vocabulary/vocab-nature (other) |
| fr-it / 3907 | il biglietto d'ingresso | vocabulary/vocab-voyage | vocabulary/vocab-loisirs (other) |
| fr-it / 3914 | il posto lato corridoio | vocabulary/vocab-reperes | vocabulary/vocab-voyage (other) |
| fr-it / 3943 | una tempesta di neve | vocabulary/vocab-maison | vocabulary/vocab-nature (other) |
| fr-it / 3953 | la materia prima | vocabulary/vocab-reperes | vocabulary/vocab-travail (other) |
| fr-it / 3984 | La merce è arrivata al porto. | utterance/deplacements | utterance/travail |
| fr-it / 4051 | un pupazzo di neve | vocabulary/vocab-maison | vocabulary/vocab-nature (other) |
| fr-it / 4066 | una dozzina | vocabulary/vocab-actions | number/vocab-actions |
| fr-it / 4082 | un foglio di carta | vocabulary/vocab-maison | vocabulary/vocab-travail (other) |
| fr-it / 4101 | La materia prima è arrivata? | utterance/deplacements | utterance/travail |
| fr-it / 4109 | il cartone esterno | vocabulary/vocab-reperes | vocabulary/vocab-travail (other) |
| fr-it / 4181 | La macchina accelera. | vocabulary/vocab-voyage | utterance/deplacements |
| fr-it / 4202 | un terremoto | vocabulary/vocab-maison | vocabulary/vocab-nature (other) |
| fr-it / 4256 | il gate d'imbarco | vocabulary/vocab-maison | vocabulary/vocab-voyage (other) |
| fr-it / 4259 | Il rubinetto dell'acqua calda. | vocabulary/vocab-restaurant | vocabulary/vocab-maison (other) |
| fr-it / 4265 | una decina | vocabulary/vocab-actions | number/vocab-actions |
| fr-it / 4276 | Lo stamperò. | utterance/deplacements | utterance/quotidien |
| fr-it / 4311 | Pioveva molto. | utterance/decrire | utterance/reperes |
| fr-it / 4333 | Il pollo arrostisce. | vocabulary/vocab-restaurant | utterance/repas |
| fr-it / 4348 | Il termosifone scalda troppo. | utterance/decrire | utterance/quotidien |
| fr-it / 4355 | L'ho preso alla lettera. | utterance/deplacements | utterance/comprendre |
| fr-it / 4356 | La password del Wi-Fi, per favore. | utterance/saluer | utterance/quotidien |
| fr-it / 4371 | Sobbolle dolcemente. | utterance/comprendre | utterance/repas |
| fr-it / 4372 | So sciare. | utterance/comprendre | utterance/quotidien |
| fr-it / 4393 | Vattene. | vocabulary/vocab-voyage | utterance/deplacements |
| fr-it / 4400 | La merce è arrivata danneggiata. | utterance/deplacements | utterance/travail |
| fr-it / 4414 | sotto | vocabulary/vocab-reperes | vocabulary/vocab-adverbes (adverb) |
| fr-it / 4421 | il posto lato finestrino | vocabulary/vocab-reperes | vocabulary/vocab-voyage (other) |
| fr-it / 4434 | un fiocco di neve | vocabulary/vocab-maison | vocabulary/vocab-nature (other) |
| fr-it / 4467 | l'allegato | vocabulary/vocab-maison | vocabulary/vocab-travail (other) |
| fr-it / 4482 | La vernice si scrosta. | vocabulary/vocab-maison | utterance/decrire |

Les motifs complets sont conservés dans latins.json ; cette table résume les cartes dont le type, la classe ou une destination contrôlée changent.

## Limites et vérifications

La liste est une revue ciblée de contenu, pas la preuve que les 13 683 cartes latines ni toute la progression L1–L10 sont validées. Les rubriques encore légères demandent du contenu entier pertinent ; leur simple regroupement ou leur renommage ne crée aucun apprentissage nouveau. Les classiques restent intacts et les droits ne sont pas recalculés sur les nouveaux niveaux éditoriaux.

    python3 -B tools/maquette-guidee/classify_latins.py --check --self-test

La génération contrôle les empreintes des trois decks, l’unicité des indices, les formes exactes des décisions et la cohérence type/POS/override. Elle échoue si une source change. Aucun fichier produit, niveau source, prix ou abonnement n’est écrit par cet outil.

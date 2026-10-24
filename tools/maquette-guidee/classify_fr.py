#!/usr/bin/env python3
"""Propose French content types without touching a source, level, or phonetic.

Only DECKS.fr (French for Chinese-speaking learners) is read. Classification
normalization is used for matching only; no source text is rewritten or split.
The generated assignments are candidates for semantic review, not a parser's
claim of native validation. Run --check to verify the generated review files.
"""
import argparse
import hashlib
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
APP = ROOT / 'melunga_deploy/app.html'
OUTPUT = ROOT / 'docs/niveaux-progressifs/types-contenu/zh-fr.json'
DOC = ROOT / 'docs/niveaux-progressifs/types-contenu/zh-fr.md'

def norm(value):
 return re.sub(r'\s+',' ',value.lower().replace('’',"'").replace('œ','oe')).strip()

def clean(value):
 return norm(value).strip(' .!?;:…«»“”"')

ACTS = {'absolument',
 'ah bon',
 'allô',
 'alors',
 'après vous',
 'attention',
 'au plaisir',
 'au revoir',
 'au secours',
 'aucune idée',
 'avec grand plaisir',
 'avec joie',
 'avec plaisir',
 'beau travail',
 'bien cordialement',
 'bien joué',
 'bien reçu',
 'bien sûr',
 'bien sûr que non',
 'bien sûr, pas de problème',
 'bien vu',
 'bienvenue',
 'bof',
 'bon',
 'bon appétit',
 'bon bah, tant pis pour lui',
 'bon courage',
 'bon rétablissement',
 'bon travail',
 'bon travail à tous',
 'bon voyage',
 'bon week-end',
 'bonjour',
 'bonne année',
 'bonne chance',
 'bonne continuation',
 'bonne journée',
 'bonne nuit',
 'bonne route',
 'bonne soirée',
 'bonnes vacances',
 'bonsoir',
 'bravo',
 "c'est noté",
 'carrément',
 'chacun son avis',
 'chaque chose en son temps',
 'cordialement',
 'courage',
 "d'accord",
 'de rien',
 'dommage',
 'doucement',
 'désolé',
 'désolée',
 'eh bien',
 'enchanté',
 'enchantée',
 'enfin',
 'exactement',
 'excellent',
 'formidable',
 'félicitations',
 'génial',
 'incroyable',
 'joyeux anniversaire',
 'joyeux noël',
 'juste un peu',
 'marché conclu',
 'mauvais numéro',
 'meilleurs voeux',
 'merci',
 'merci beaucoup',
 'merci pour tout',
 'mince',
 'moi aussi',
 'moi non plus',
 'moins vite',
 "n'importe quoi",
 'nickel',
 'non',
 'oh là là',
 'oui',
 'pardon',
 'parfait',
 'pas de problème',
 'pas de réseau',
 'pas de signal',
 'pas de souci',
 'pas de souci de mon côté',
 'pas de viande',
 'pas du tout',
 'pas mal',
 'pas possible',
 'pas trop épicé',
 'peut-être',
 'peut-être bien',
 'pourquoi pas',
 'quel soulagement',
 'quelle bonne nouvelle',
 'quelle chance',
 'quelle surprise',
 "ravi de t'avoir rencontré",
 'rien à déclarer',
 "s'il te plaît",
 "s'il vous plaît",
 'salut',
 'sans problème',
 'santé',
 'super',
 "surtout, n'oublie pas tes clés",
 'sérieux',
 'tant mieux',
 'tant mieux pour toi',
 'tant pis',
 'toujours le mot pour rire, celui-là',
 'tous mes voeux de bonheur',
 "tout d'abord, merci d'être venus",
 'tout de suite',
 'tout à fait',
 'toutes mes condoléances',
 'tranquille',
 'trop bien',
 'très bien',
 'un instant',
 'un moment',
 'vite',
 'voilà',
 'volontiers',
 'vraiment',
 'waouh',
 'zut',
 'à bientôt',
 'à demain',
 "à l'aide",
 'à la prochaine'}

CLOSED_ADVERBIALS = {'au fait',
 'au pire',
 'chaque semaine',
 "d'abord",
 'dans le passé',
 'de nos jours',
 'de nouveau',
 'de plus',
 'deux fois',
 'deux fois par jour',
 'du coup',
 'dès que possible',
 'en ce moment',
 'en conclusion',
 'en cours',
 'en fait',
 'en même temps',
 'en plus',
 'en pratique',
 'en théorie',
 'en train',
 'en voiture',
 'en vrai',
 'franchement',
 'honnêtement',
 'ici et là',
 "l'autre jour",
 'pas assez',
 'pas encore',
 'personnellement',
 'petit à petit',
 'peu à peu',
 'plus ou moins',
 'plus tard',
 'porte à porte',
 'pour commencer',
 'pour deux nuits',
 'pour finir',
 "pour l'instant",
 'pour une nuit',
 'pour être honnête',
 'savoir-vivre et savoir-faire',
 'soit dit en passant',
 'sur place',
 'tous les jours',
 'tout le temps',
 "tout à l'heure",
 'tôt le matin',
 'tôt ou tard',
 'une fois',
 'à emporter',
 "à l'instant",
 'à mon avis',
 'à point'}

BOUND = {'afin de',
 'au-dessus de',
 'autant que',
 'beaucoup de',
 'bien que',
 "c'est-à-dire",
 'de sorte que',
 'depuis que',
 'dès que',
 'en ce qui concerne',
 'en dessous de',
 'en raison de',
 'grâce à',
 "jusqu'à",
 'le même que',
 'le plus',
 'loin de',
 'malgré',
 'mieux que',
 'moins que',
 'parce que',
 'pendant que',
 'plus que',
 'pour que',
 'près de',
 'quant à',
 'si possible',
 'tandis que',
 'trop de',
 'un morceau de',
 'un sac de',
 'une bouteille de',
 'une boîte de',
 'une tasse de',
 'à cause de',
 'à côté de',
 'à faire',
 'à moins que',
 'à partir de',
 'à propos de'}

PREPOSITIONS = {'avec',
 'chez',
 'dans',
 'de',
 'depuis',
 'derrière',
 'devant',
 'en',
 'entre',
 'par',
 'pendant',
 'pour',
 'sans',
 'sous',
 'sur',
 'vers',
 'à'}

CONJUNCTIONS = {'car',
 'cependant',
 'donc',
 'et',
 'lorsque',
 'mais',
 'ni',
 'néanmoins',
 'or',
 'ou',
 'pourtant',
 'puisque',
 'quand',
 'que',
 'quoique',
 'si'}

NUM_ATOMS = {'cent',
 'cents',
 'cinq',
 'cinquante',
 'deux',
 'dix',
 'dizaine',
 'douzaine',
 'douze',
 'et',
 'huit',
 'mille',
 'milliard',
 'milliards',
 'million',
 'millions',
 'neuf',
 'onze',
 'quarante',
 'quatorze',
 'quatre',
 'quinze',
 'seize',
 'sept',
 'six',
 'soixante',
 'treize',
 'trente',
 'trois',
 'un',
 'une',
 'vingt',
 'vingts',
 'zero',
 'zéro'}

ORDINALS = {'centième',
 'cinquième',
 'deuxième',
 'dixième',
 'douzième',
 'huitième',
 'millième',
 'neuvième',
 'onzième',
 'premier',
 'première',
 'quatorzième',
 'quatrième',
 'quinzième',
 'second',
 'seconde',
 'seizième',
 'septième',
 'sixième',
 'treizième',
 'trentième',
 'troisième',
 'vingtième'}

FINITE = {'a',
 'accélère',
 'allait',
 'allez',
 'allons',
 'arrive',
 'arrivent',
 'arrivera',
 'as',
 'assure',
 'attend',
 'attendent',
 'augmentent',
 'aura',
 'auraient',
 'aurait',
 'aurez',
 'auront',
 'avaient',
 'avais',
 'avait',
 'avance',
 'avez',
 'avons',
 'baisse',
 'bout',
 'cesse',
 'change',
 'cherche',
 'comprend',
 'compte',
 'contient',
 'continue',
 'convient',
 'correspond',
 'correspondent',
 'coûte',
 'coûtent',
 'craint',
 'cuit',
 'demande',
 'demandent',
 'devra',
 'devraient',
 'devrait',
 'devront',
 'doit',
 'doivent',
 'donne',
 'donnera',
 'dort',
 'dépasse',
 'déteint',
 'es',
 'est',
 'exportez',
 'fais',
 'faisaient',
 'faisait',
 'faisons',
 'fait',
 'faites',
 'fallait',
 'faudra',
 'faut',
 'fera',
 'feraient',
 'ferait',
 'ferme',
 'feront',
 'finit',
 'fleurissent',
 'fonctionne',
 'font',
 'fuit',
 'furent',
 'fut',
 'gagne',
 'gagnent',
 'grandit',
 'grossiront',
 'importe',
 'ira',
 'iront',
 'manque',
 'manquent',
 'marche',
 'monte',
 'montent',
 'ont',
 'ouvre',
 'parle',
 'passe',
 'passent',
 'permet',
 'permettent',
 'peut',
 'peuvent',
 'pleure',
 'pose',
 'pourra',
 'pourraient',
 'pourrait',
 'pourront',
 'pouvez',
 'prend',
 'prendra',
 'prennent',
 'presse',
 'privilégie',
 'produit',
 'rend',
 'rendent',
 'ressemble',
 'ressemblent',
 'reste',
 'restent',
 'règne',
 'répond',
 'rôtit',
 "s'annonce",
 "s'appelle",
 'scintille',
 'semble',
 'sent',
 'sera',
 'serai',
 'seraient',
 'serais',
 'serait',
 'seras',
 'serez',
 'seriez',
 'serions',
 'serons',
 'seront',
 'siffle',
 'soient',
 'soit',
 'sommes',
 'sont',
 'suffit',
 'suis',
 'suit',
 'suivent',
 'surchauffe',
 'tient',
 'tombe',
 'trouve',
 'va',
 'valent',
 'vaut',
 'verra',
 'viendra',
 'viennent',
 'vient',
 'vivra',
 'voit',
 'vont',
 'écaille',
 'étaient',
 'étais',
 'était',
 'étiez',
 'étions',
 'êtes'}

IMPERATIVES = {'abandonne',
 'abandonnez',
 'accélère',
 'accélérez',
 'aie',
 'ajoute',
 'ajoutez',
 'allez',
 'allons',
 'allume',
 'allumez',
 'amuse',
 'amuse-toi',
 'amusez',
 'amusez-vous',
 'annule',
 'annulez',
 'appelez',
 'appelle',
 'apporte',
 'apportez',
 'apprenons',
 'appuie',
 'appuyez',
 'arrête',
 'arrête-toi',
 'arrêtez',
 'arrêtez-vous',
 'asseyez',
 'asseyez-vous',
 'asseyons',
 'asseyons-nous',
 'assieds',
 'assieds-toi',
 'attache',
 'attachez',
 'attendez',
 'attendons',
 'attends',
 'attrape',
 'ayez',
 'baisse',
 'baissez',
 'bats',
 'battez',
 'bois',
 'bouge',
 'bougez',
 'branche',
 'branchez',
 'buvez',
 'calme',
 'calmez',
 'calmons',
 'calmons-nous',
 'changeons',
 'changez',
 'choisis',
 'choisis-en',
 'choisissez',
 'choisissons',
 'clique',
 'cliquez',
 'commençons',
 'comprenons',
 'conduisez',
 'confirmez',
 'contacte',
 'contactez',
 'continue',
 'continuez',
 'convenons',
 'corrige',
 'corrigez',
 'coupons',
 'crois',
 'demande',
 'demandez',
 'descendez',
 'dis',
 'discutons',
 'dites',
 'donne',
 'donnez',
 'déclare',
 'déclarez',
 'décourage',
 'découragez',
 'déduisons',
 'dépêche',
 'dépêche-toi',
 'dépêchez',
 'dépêchez-vous',
 'détendez',
 'détends',
 'embrasse',
 'embrassez',
 'enregistrons',
 'entendons',
 'entendons-nous',
 'entre',
 'entrez',
 'envoie',
 'envoyez',
 'essaie',
 'essayez',
 'excuse',
 'excuse-moi',
 'excusez',
 'excusez-moi',
 'explique',
 'expliquez',
 'fais',
 'faisons',
 'faites',
 'ferme',
 'fermez',
 'fixons',
 'foutez',
 'frappe',
 'frappez',
 'garde',
 'gardez',
 'goûte',
 'goûtez',
 'hésite',
 'hésitez',
 'inquiète',
 'inquiétez',
 'jetez',
 'jette',
 'klaxonne',
 'klaxonnez',
 'laisse',
 'laissez',
 'laissons',
 'lance',
 'lancez',
 'lave',
 'lavez',
 'levez',
 'lâche',
 'lâchez',
 'lève',
 'marche',
 'marchez',
 'mens',
 'mentez',
 'mets',
 'mettez',
 'mettons',
 'montez',
 'montre',
 'montrez',
 'note',
 'notez',
 'organisons',
 'oublie',
 'oubliez',
 'oublié',
 'ouvre',
 'ouvrez',
 'paie',
 'paiez',
 'pardonne',
 'pardonnez',
 'parle',
 'parlez',
 'parlons',
 'passe',
 'passez',
 'passons',
 'patientons',
 'paye',
 'payez',
 'pense',
 'pensez',
 'permets',
 'permettez',
 'permettez-moi',
 'pleure',
 'pleurez',
 'plions',
 'portons',
 'pose',
 'posez',
 'pousse',
 'poussez',
 'prend',
 'prends',
 'prenez',
 'prenons',
 'profite',
 'profitez',
 'prépare',
 'préparez',
 'prévenez',
 'prévenez-moi',
 'quitte',
 'quittez',
 'raccroche',
 'raccrochez',
 'raconte',
 'racontez',
 'ralentis',
 'ralentissez',
 'range',
 'rangez',
 'rappelez',
 'rappelle',
 'rassure',
 'rassure-toi',
 'rassurez',
 'rassurez-vous',
 'recontactez',
 'recontactons',
 'recontactons-nous',
 'redémarre',
 'redémarrez',
 'regarde',
 'regardez',
 'remercie',
 'remerciez',
 'remplis',
 'remplissez',
 'repose',
 'repose-toi',
 'reposez',
 'reposez-vous',
 'reste',
 'restez',
 'restons',
 'revenez',
 'réconcilions',
 'réconcilions-nous',
 'réfléchis',
 'réfléchissez',
 'réfléchissez-y',
 'régale',
 'régalez',
 'réjouissons',
 'réjouissons-nous',
 'répondez',
 'réponds',
 'répète',
 'répétez',
 'réserve',
 'réservez',
 'réservons',
 'sache',
 'sachez',
 'salue',
 'saluez',
 'saute',
 'sautez',
 'savoure',
 'savourez',
 'scanne',
 'scannez',
 'serre',
 'serrez',
 'signez',
 'signons',
 'soignons',
 'sois',
 'sors',
 'sortez',
 'souffle',
 'soufflez',
 'souhaite',
 'souhaitez',
 'souris',
 'soyez',
 'suis',
 'suivez',
 'surveille',
 'surveillez',
 'tais',
 'tais-toi',
 'taisez',
 'taisez-vous',
 'tenez',
 'tiens',
 'tirez',
 'tourne',
 'tournez',
 'transmettez',
 'travaille',
 'travaillez',
 'traverse',
 'traversez',
 'trouvons',
 'tâchez',
 'télécharge',
 'téléchargez',
 'utilise',
 'utilisez',
 'va',
 'vas',
 'venez',
 'veuillez',
 'viens',
 'vise',
 'visez',
 'voyons',
 'vérifie',
 'vérifiez',
 'écoute',
 'écoutez',
 'écris',
 'écrivez',
 'éteignez',
 'éteins',
 'étudions'}

INFINITIVES = {'acheter',
 'aider',
 'aimer',
 'aller',
 'appeler',
 'apprendre',
 'attendre',
 'avoir',
 'boire',
 'changer',
 'chercher',
 'choisir',
 'commencer',
 'comparer',
 'comprendre',
 'conduire',
 'connaître',
 'coucher',
 'demander',
 'devoir',
 'dire',
 'donner',
 'dormir',
 'décrire',
 'déménager',
 'emprunter',
 'entrer',
 'envoyer',
 'essayer',
 'faire',
 'falloir',
 'fermer',
 'finir',
 'garder',
 'jouer',
 'laver',
 'lever',
 'lire',
 'louer',
 'manger',
 'mettre',
 'nettoyer',
 'ouvrir',
 'parler',
 'partir',
 'payer',
 'porter',
 'pouvoir',
 'prendre',
 'prêter',
 'recevoir',
 'reconnaître',
 'regarder',
 'remercier',
 'rentrer',
 'reposer',
 'rester',
 'revenir',
 'rire',
 'réparer',
 'répondre',
 'réussir',
 'réveiller',
 'savoir',
 'sortir',
 'souffrir',
 'sourire',
 'suivre',
 'tenir',
 'toucher',
 'travailler',
 'trouver',
 'vendre',
 'venir',
 'vivre',
 'voir',
 'vouloir',
 'écouter',
 'écrire',
 'être'}

def number_only(c):
 t=clean(c['t']);t=re.sub(r'\s*\([^)]*\)\s*',' ',t).strip()
 if re.fullmatch(r'[+-]?\d+(?:[ .,]\d+)*(?:er|e|ème|%)?',t):return True
 if t in ORDINALS or t in {'le premier','la première','la moitié','un demi','un quart','un tiers'}:return True
 if t.startswith(('le ','la ')) and t[3:] in ORDINALS:return True
 return bool(t) and all(w in NUM_ATOMS for w in re.split(r'[ -]+',t)) and any(w not in {'et'} for w in re.split(r'[ -]+',t))

def has_finite(t):
 tokens=re.findall(r"[a-zà-öø-ÿ]+",t)
 return any(w in FINITE and not (i==1 and tokens[0] in {'le','la','les','l','un','une','des','du','mon','ma','mes','ton','ta','tes','son','sa','ses','notre','votre','leur','leurs'}) for i,w in enumerate(tokens)) or bool(re.search(r"\b(?:j'|je |tu |il |elle |on |nous |vous |ils |elles |c'est|c'était|ce sera|ça |cela |ceci )",t))

def classify(c):
 raw=c['t'];t=norm(raw);base=clean(raw)
 if number_only(c):return 'number','Nombre cardinal, ordinal ou fraction autonome ; aucune phrase ou unité mesurée n’est extraite.','rule-based-candidate'
 if re.search(r'[—–]\s*[^—–]+[—–]',raw):return 'review','Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source.','rule-based-candidate'
 if base in ACTS:return 'utterance','Formule conventionnelle ou réplique autonome, même sans verbe conjugué.','reviewed'
 if re.search(r"s'il (?:vous|te) plaît",t):return 'utterance','Demande polie complète ou formule de politesse autonome ; la ponctuation n’est pas le seul critère.','rule-based-candidate'
 if re.match(r"^(?:merci(?:[ ,]|$)|désolé(?:e)? (?:pour|d')|bienvenue chez |ravi(?:e)? de )",base):return 'utterance','Formule sociale complète, avec son complément fourni.','reviewed'
 if base in {"autant le dire tout de suite","quitte à attendre, autant s'asseoir","ce côté vers le haut","manipuler avec soin"}:return 'utterance','Énoncé elliptique conventionnel ou consigne autonome vérifié dans son emploi français.','reviewed'
 if re.match(r'^au plaisir de .+',base):return 'utterance','Formule de clôture complète avec son complément.','reviewed'
 if base in CLOSED_ADVERBIALS:return 'vocabulary','Locution adverbiale fermée, proposée comme unité lexicale et non comme phrase modèle à compléter.','reviewed'
 if base in BOUND or base in PREPOSITIONS or base in CONJUNCTIONS:return 'incomplete','Mot-outil ou groupe lié qui appelle un complément ou une autre proposition.','reviewed'
 if '...' in t or '…' in t or re.search(r'\{[^}]*\}|\bX\b|_{2,}',raw):return 'incomplete','La source laisse un emplacement ou une continuation non rempli ; aucune recomposition n’est permise.','rule-based-candidate'
 if re.match(r'^comme (?:indiqué|convenu|mentionné)',base):return 'incomplete','Renvoi ou comparaison subordonnée sans proposition principale explicite.','rule-based-candidate'
 if re.match(r'^(?:combien de|pour que|à condition que|en ce qui concerne|dans l’attente de|dans l\'attente de)$',base):return 'incomplete','Amorce liée sans complément ; la marque interrogative ne ferme pas le modèle.','reviewed'
 if re.search(r'\b(?:de|du|des|à|au|aux|pour|avec|sans|que|qu\')$',base) and not has_finite(base):return 'incomplete','Groupe suspendu sur une préposition ou un subordonnant ; complément requis.','rule-based-candidate'
 if not raw.rstrip().endswith('?') and re.match(r'^(?:bien que|quoique|à moins que|pourvu que|alors que|tandis que|parce que|puisque|quand |lorsque |dès que|si jamais)',base) and not re.search(r'[,;]',base):return 'review','Proposition introduite comme dépendante ; vérifier qu’une principale ou une vraie réplique est fournie.','rule-based-candidate'
 first=re.findall(r"[a-zà-öø-ÿ]+(?:'[a-zà-öø-ÿ]+)?(?:-[a-zà-öø-ÿ]+)*",base)
 if first:
  stem=first[0]
  if stem in INFINITIVES and re.search(r"[,;]\s*c'(?:est|était)\b",base):return 'utterance','Proposition autonome construite sur un infinitif sujet, avec prédicat explicite.','reviewed'
  if stem in INFINITIVES or re.fullmatch(r'[a-zà-öø-ÿ]+(?:er|ir|oir)',stem) or (stem in {'se',"s'"} and len(first)>1 and first[1] in INFINITIVES):return 'vocabulary','Verbe ou locution verbale à l’infinitif ; action nommée, pas une réplique autonome.','rule-based-candidate'
  if stem=='ne' and len(first)>2 and first[1]=='pas' and first[2] in INFINITIVES:return 'review','Infinitif négatif pouvant être une consigne ; vérifier le contexte plutôt que l’assimiler à une phrase conjuguée.','rule-based-candidate'
 if raw.rstrip().endswith('?'):return 'utterance','Question autonome ou question elliptique fermée, sans emplacement restant à remplir.','rule-based-candidate'
 imperative_base=re.sub(r"^(?:ne\s+|n')(?:(?:me|te|le|la|les|lui|leur|nous|vous|y|en)\s+|(?:t'|m'|l'))*",'',base)
 imperative_first=re.match(r"([a-zà-öø-ÿ]+)",imperative_base)
 if imperative_first and imperative_first.group(1) in IMPERATIVES and (len(first)>1 or raw.rstrip().endswith(('.', '!'))):return 'utterance','Consigne ou demande à l’impératif, avec ses compléments déjà fournis.','rule-based-candidate'
 if re.match(r'^(?:voici|voilà)\b',base):return 'utterance','Énoncé présentatif autonome.','rule-based-candidate'
 if re.search(r"\b(?:j'|je |tu |il |elle |on |nous |vous |ils |elles |c'est|c'était|ce sera|ça |cela |ceci )",base):return 'utterance','Proposition personnelle ou présentative complète ; le classement ne dépend pas de cat.','rule-based-candidate'
 for clause in re.split(r'[,;]',base)[1:]:
  start=re.match(r"([a-zà-öø-ÿ]+)",clause.strip())
  if start and start.group(1) in IMPERATIVES:return 'utterance','Consigne autonome avec un repère introductif fermé.','rule-based-candidate'
 if has_finite(base):return 'utterance','Proposition dotée d’un prédicat conjugué et de ses compléments dans la source.','rule-based-candidate'
 if re.match(r"^(?:le |la |les |l'|un |une |des |du |de la |de l'|mon |ma |mes |ton |ta |tes |son |sa |ses |notre |nos |votre |vos |leur |leurs |ce |cet |cette |ces |chaque |toute? |tous |toutes |quelques? |aucune? |certains? |certaines )",base):return 'vocabulary','Groupe nominal fermé sans prédicat ; vocabulaire malgré cat ou la majuscule.','rule-based-candidate'
 if len(first)<=2:return 'vocabulary','Mot ou courte unité lexicale sans marque de question, demande ou prédicat autonome.','rule-based-candidate'
 if c.get('cat') in {'vocab','basics'}:return 'vocabulary','Groupe lexical fermé sans prédicat reconnu ; maintien en vocabulaire, sans le faire produire comme réplique.','rule-based-candidate'
 return 'review','Autonomie de l’énoncé non établie par cette passe : vérifier s’il s’agit de vocabulaire, d’une consigne ou d’un fragment.','rule-based-candidate'

# Individually checked conventional replies and directives missed by lexical
# spelling rules. No source phrase is created or repaired here.
ACTS |= {"à tout à l'heure", 'à la semaine prochaine', 'à la vôtre',
         'à vos souhaits', 'à qui le dis-tu', 'possible',
         'aux grands maux les grands remèdes', 'après la pluie, le beau temps'}
IMPERATIVES.add('aide')
_rule_classify = classify

# Bounded dictionary units are not open sentence frames. An ellipsis explicitly
# leaving a slot remains incomplete (e.g. "À cause de..." versus "à cause de").
PREPOSITION_UNITS = {
    'à', 'de', 'du', 'des', 'en', 'avec', 'sans', 'pour', 'par', 'sur', 'sous',
    'dans', 'devant', 'derrière', 'entre', 'chez', 'vers', 'pendant', 'depuis',
    'à côté de', 'à cause de', 'grâce à', 'en raison de', 'afin de', 'loin de',
    'près de', 'à partir de', 'à propos de', 'quant à', "jusqu'à", 'au-dessus de',
    'en dessous de', 'au-dessous de', 'en dehors de', "à l'intérieur de", "à l'extérieur de"
}
AMBIGUOUS_PREPOSITION_ADVERB = {'avant', 'après'}
ADJECTIVES = {
    'grand', 'petit', 'nouveau', 'vieux', 'facile', 'difficile', 'rapide', 'lent',
    'propre', 'sale', 'plein', 'vide', 'cher', 'lourd', 'léger', 'long', 'court',
    'fort', 'faible', 'pareil', 'différent', 'intéressant', 'ennuyeux', 'utile',
    'inutile', 'dangereux', 'sûr', 'important', 'étrange', 'normal', 'célèbre',
    'populaire', 'simple', 'compliqué', 'sérieux', 'drôle', 'bizarre', 'incroyable',
    'terrible', 'confortable', 'nécessaire', 'transparent', 'rayé', 'uni', 'brillant',
    'mat', 'coloré', 'foncé', 'clair', 'vif', 'pâle', 'mou', 'dur', 'lisse',
    'rugueux', 'pointu', 'collant', 'serré', 'large', 'étroit', 'épais', 'fin',
    'profond', 'plat', 'rond', 'droit', 'courbé', 'lâche', 'jaloux', 'gêné',
    'soulagé', 'déçu', 'reconnaissant', 'anxieux', 'confiant', 'frustré', 'ému',
    'nerveux', 'coupable', 'seul', 'curieux', 'agacé', 'honteux', 'dépassé',
    'satisfait', 'impatient', 'étonné', 'célibataire', 'rouge', 'bleu', 'vert',
    'jaune', 'noir', 'blanc', 'gris', 'marron', 'rose', 'orange', 'beige',
    'bleu foncé', 'bleu clair', 'doré', 'argenté', 'frais', 'fragile',
    'imperméable', 'négociable', 'végétarien', 'saignant', 'surgelé', 'bien cuit',
    'peu profond', "plein d'espoir", 'à fleurs', 'à pois', 'à carreaux', 'sans gluten',
    'en cours'
}
ADVERBS = {
    'jamais', 'maintenant', 'toujours', 'encore', 'beaucoup', 'souvent', 'parfois',
    'rarement', 'où', 'quand', 'pourquoi', 'comment', 'combien', 'plus', 'moins',
    'assez', 'tellement', 'dedans', 'dehors', 'partout', 'ensuite', 'déjà', 'enfin',
    'bientôt', 'récemment', 'cependant', 'pourtant', 'donc', 'bref', 'néanmoins',
    'probablement', 'apparemment', 'heureusement', 'évidemment', 'pas forcément', 'de plus en plus', 'de temps en temps', "d'habitude",
    'à partir de maintenant', 'à partir de demain', 'à côté de la banque', 'chez le coiffeur',
    'pour ainsi dire', 'en bas', 'en haut', 'en face', 'à gauche', 'à droite',
    'au milieu', 'au-dessus', 'au-dessous', "à l'étage", 'au rez-de-chaussée',
    'à la fin', 'au début', "à l'avenir", 'en attendant', 'entre-temps',
    "jusqu'à présent", 'avant de dormir', 'avant les repas', 'après les repas',
    'par avion', 'à pied', 'en bus', 'à vélo', 'en métro', 'par voie maritime',
    'en espèces', 'en voiture', 'en train', 'le matin', 'le soir', 'ce matin',
    'ce soir', 'cet après-midi', "l'après-midi", 'hier soir', 'chaque année',
    'la semaine dernière', 'le mois dernier', 'le mois prochain',
    'la semaine prochaine', 'lundi prochain', 'dans cinq minutes'
}
ADVERBS |= CLOSED_ADVERBIALS - {'en cours', 'porte à porte', 'savoir-vivre et savoir-faire'}
LEXICAL_OTHER = {
    'internet', 'monsieur', 'madame', 'maman', 'papa', 'qui', 'quoi', 'quel',
    'plusieurs', 'quelques-uns', 'porte à porte', 'savoir-vivre et savoir-faire',
    'sens unique', 'sens interdit', 'batterie faible', 'le mot de passe',
    'le taux de change', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi',
    'samedi', 'dimanche', 'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
    'de fortes chutes de neige'
}
CONTENT_OVERRIDES = {
    'le mot de passe': ('vocabulary', 'Groupe nominal du secret de connexion ; passe est ici un nom, pas un verbe.'),
    'le taux de change': ('vocabulary', 'Groupe nominal financier ; change est ici un nom, pas un verbe.'),
    'bien cuit': ('vocabulary', 'Groupe adjectival de cuisson, sans sujet ni prédicat autonome.'),
    'sérieux': ('vocabulary', 'Lemme adjectival isolé et sens chinois adjectival ; ne pas le confondre avec la question Sérieux ?.'),
    'incroyable': ('vocabulary', 'Lemme adjectival isolé ; la réaction Incroyable ! est conservée séparément comme réplique.'),
    'enfin': ('vocabulary', 'Adverbe temporel isolé ; l’interjection Enfin ! reste une réplique distincte.'),
    'suite à notre conversation': ('review', 'Renvoi épistolaire sans proposition principale ; emploi à préciser avant production.'),
    "dans l'attente de votre retour": ('review', 'Formule épistolaire suspendue : absence de proposition principale, autonomie à vérifier.'),
    'au cas où': ('review', 'Amorce conditionnelle ou réplique elliptique selon le contexte ; ne pas imposer comme production sans contexte.'),
    'comme convenu': ('review', 'Renvoi à un accord antérieur : autonomie ou fonction adverbiale à situer avant une production.'),
}
NOMINAL_START = re.compile(
    r"^(?:le |la |les |l'|un |une |des |du |de la |de l'|mon |ma |mes |ton |ta |tes |son |sa |ses |"
    r"notre |nos |votre |vos |leur |leurs |ce |cet |cette |ces |chaque |toute? |tous |toutes |"
    r"quelques? |aucune? |certains? |certaines )"
)


def has_open_slot(raw):
    return bool('...' in raw or '…' in raw or re.search(r'\{[^}]*\}|\bX\b|_{2,}', raw))


def classify(card):
    raw = card['t']
    base = clean(raw)
    # Keep genuine punctuation-bearing reactions while treating their bare
    # adjective/adverb counterparts as vocabulary. These are exact source cases.
    if base in CONTENT_OVERRIDES:
        is_bare = raw == raw.lower() and not re.search(r'[.?!…]', raw)
        if base not in {'sérieux', 'incroyable', 'enfin'} or is_bare:
            typ, reason = CONTENT_OVERRIDES[base]
            return typ, reason, 'reviewed'
    if not has_open_slot(raw):
        if base in PREPOSITION_UNITS:
            return 'vocabulary', 'Préposition ou locution prépositive délimitée comme unité lexicale ; aucun cadre de phrase n’est complété.', 'reviewed'
        if base in AMBIGUOUS_PREPOSITION_ADVERB:
            return 'vocabulary', 'Mot lexical pouvant être préposition ou adverbe ; le contexte fourni ne tranche pas sa fonction.', 'reviewed'
        if base in ADVERBS and base not in ACTS:
            return 'vocabulary', 'Adverbe ou locution adverbiale fermée, à distinguer d’une phrase autonome.', 'reviewed'
    return _rule_classify(card)


def lexical_class(card):
    base = clean(card['t'])
    if base in ADJECTIVES:
        return 'adjective', 'Adjectif ou groupe adjectival de propriété, couleur, ressenti ou état ; la source n’est pas une phrase complète.', 'reviewed'
    if base in PREPOSITION_UNITS:
        return 'preposition', 'Préposition ou locution prépositive lexicale : sur/dans/près de, et non phrase complète contenant une préposition.', 'reviewed'
    if base in AMBIGUOUS_PREPOSITION_ADVERB:
        return 'uncertain', 'Avant/après peut être préposition ou adverbe ; absence de complément ou de phrase permettant de trancher.', 'rule-based-candidate'
    if base in ADVERBS:
        return 'adverb', 'Adverbe ou locution circonstancielle fermée reconnue dans le sens fourni ; classement de l’unité entière.', 'reviewed'
    if base in LEXICAL_OTHER:
        return 'other', 'Nom, pronom, déterminant ou autre unité lexicale ; pas de qualification artificielle comme adjectif/adverbe.', 'reviewed'
    if NOMINAL_START.match(base):
        return 'other', 'Groupe nominal fermé ; ses éventuels adjectifs ou prépositions ne changent pas le type de l’ensemble.', 'rule-based-candidate'
    first = re.match(r"([a-zà-öø-ÿ]+)", base)
    if first and (first.group(1) in INFINITIVES or re.fullmatch(r'[a-zà-öø-ÿ]+(?:er|ir|oir)', first.group(1))):
        return 'other', 'Verbe ou locution verbale à l’infinitif ; ce n’est ni une préposition ni un adjectif isolé.', 'rule-based-candidate'
    return 'uncertain', 'Nature de l’unité lexicale non établie avec assez de certitude ; conserver en vocabulaire général pour relecture.', 'rule-based-candidate'


# Eight exact template-labelled source items are complete discourse units,
# not fill-in frames. These exceptions are semantic, explicit and index-bound.
SOURCE_TEMPLATE_EXCEPTIONS = {
    2902: ('Eh bien…', 'Formule entière de prise de tour : Eh bien est une réplique autonome malgré l’ellipse expressive ; aucune suite n’est inventée.'),
    3046: ('À mon avis...', 'Locution adverbiale de point de vue, proposée comme vocabulaire entier ; l’ellipse de source reste inchangée, aucun avis n’est ajouté.'),
    3140: ('Pour être honnête...', 'Locution adverbiale de franchise délimitée ; vocabulaire entier, pas modèle de phrase ni complément recomposé.'),
    3193: ('En théorie...', 'Locution adverbiale de domaine délimitée ; vocabulaire entier malgré l’ellipse expressive, sans proposition ajoutée.'),
    3201: ('Franchement...', 'Adverbe de manière ou d’énonciation isolé ; unité lexicale entière, sans compléter l’ellipse de source.'),
    3245: ('En pratique...', 'Locution adverbiale de domaine délimitée ; vocabulaire entier, sans invention d’une phrase après l’ellipse.'),
    3292: ('Personnellement...', 'Adverbe de point de vue isolé ; unité lexicale entière, sans proposition ni complément ajouté.'),
    3321: ('Soit dit en passant...', 'Locution adverbiale d’incise délimitée ; vocabulaire entier, et non cadre à compléter malgré l’ellipse de source.'),
}


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()


def make():
    source = APP.read_text()
    line = next(line for line in source.splitlines() if line.startswith('var DECKS = '))
    deck = json.loads(line.split('=', 1)[1].strip().rstrip(';'))['fr']
    assert len(deck) == 4500
    assignments = []
    for index, card in enumerate(deck):
        content_type, reason, review_status = classify(card)
        row = {'sourceIndex': index, 'contentType': content_type, 'reason': reason, 'reviewStatus': review_status}
        if index in SOURCE_TEMPLATE_EXCEPTIONS:
            expected, exception_reason = SOURCE_TEMPLATE_EXCEPTIONS[index]
            assert card['t'] == expected, (index, card['t'])
            assert content_type == ('utterance' if index == 2902 else 'vocabulary')
            row.update(sourceTemplateException=True, reviewStatus='reviewed', reason=exception_reason)
        if content_type == 'vocabulary':
            kind, kind_reason, kind_review = lexical_class(card)
            row.update(lexicalClass=kind, lexicalClassReason=kind_reason, lexicalClassReviewStatus=kind_review)
        assignments.append(row)
    result = {'version': 1, 'pair': 'zh-fr', 'studyLanguage': 'fr',
              'sourceDeckSha256': hashlib.sha256(canonical(deck)).hexdigest(),
              'status': 'candidate-requires-semantic-review', 'assignments': assignments}
    return deck, result


def markdown(deck, result):
    assignments = result['assignments']
    counts = Counter(row['contentType'] for row in assignments)
    lexical = Counter(row['lexicalClass'] for row in assignments if row['contentType'] == 'vocabulary')
    lines = [
        '# Types de contenu — français pour sinophones', '',
        '**Candidats à relecture sémantique.** 4 500 cartes, une affectation par indice source. Aucun niveau, texte, traduction, lecture ou aide phonétique n’est changé.', '',
        'Les répliques autonomes restent des énoncés : Bonjour, Merci, Oui, une demande polie nominale et une consigne à l’impératif ne sont pas écartées faute de verbe personnel. Les noms, adjectifs, adverbes et locutions verbales à l’infinitif vont au vocabulaire. Les nombres cardinaux, ordinaux et fractions seuls vont à Nombres ; une phrase comportant un nombre reste une phrase.', '',
        '| Type | Cartes |', '|---|---:|',
    ]
    for name in ['utterance', 'vocabulary', 'number', 'incomplete', 'review']:
        lines.append(f'| `{name}` | {counts[name]} |')
    lines += ['', '## Sous-classes du vocabulaire', '', '| Sous-classe | Cartes |', '|---|---:|']
    for name in ['adjective', 'preposition', 'adverb', 'other', 'uncertain']:
        lines.append(f'| `{name}` | {lexical[name]} |')
    lines += [
        '', 'Une carte n’est pas dupliquée entre les rubriques. Le classement porte sur l’unité entière : `un petit ami` reste un groupe nominal, `C’est cher.` reste une phrase, `cher` est un adjectif. `sur` ou `à côté de` sont des unités prépositives délimitées ; `Je vais à...` et les modèles à trou restent ouverts. `avant` et `après`, sans contexte tranchant leur emploi, sont explicitement incertains.',
        '', 'Un marqueur comme `cat: vocab` ne suffit pas : les sources contiennent des phrases complètes sous cette étiquette. Inversement, des mots isolés sont étiquetés `core`. Les catégories existantes ne sont utilisées qu’après examen de la forme comme indice de secours. Aucun énoncé n’est découpé, recomposé ou complété.',
        '', 'Les cartes regroupant deux interlocuteurs restent en réserve (`review`) : ni la carte entière ni l’un de ses morceaux n’est imposé comme tour de l’apprenant. Les groupes d’unité de mesure ne sont pas confondus avec un nombre seul (`un kilo` reste lexical ; `un million` est numérique).',
        '', '## Exemples vérifiés', '', '| Indice | Source exacte | Affectation | Sous-classe |', '|---:|---|---|---|',
    ]
    examples = [1, 2, 272, 3120, 2918, 3051, 3202, 3338, 3664, 3076, 3297, 3676, 3688, 3697, 3712, 2990, 2854, 3388, 3804, 3826, 3171, 3360, 3497, 4470, 137, 2903, 2997, 2228]
    for index in examples:
        row = assignments[index]
        text = deck[index]['t'].replace('|', r'\|')
        lines.append(f"| {index} | {text} | `{row['contentType']}` | `{row.get('lexicalClass', '')}` |")
    lines += ['', '## Huit exceptions explicites à l’étiquette template', '',
              'Les sources et leurs ellipses restent identiques. 2902 est une formule de prise de tour ; les sept autres sont du vocabulaire adverbial entier. Chaque affectation porte `sourceTemplateException: true`, `reviewStatus: reviewed` et une raison spécifique ; aucun emplacement n’est rempli.', '',
              '| Indice | Source exacte | Traitement |', '|---:|---|---|']
    for index, (text, reason) in SOURCE_TEMPLATE_EXCEPTIONS.items():
        lines.append(f"| {index} | {text} | {reason} |")
    lines += ['', '## Répartition par niveau source', '', '| Niveau source | Énoncés | Vocabulaire | Nombres | Ouverts | Réserve |', '|---|---:|---:|---:|---:|---:|']
    for level in range(1, 11):
        local = Counter(row['contentType'] for row in assignments if deck[row['sourceIndex']]['lv'] == level)
        lines.append('| L' + str(level) + ' | ' + ' | '.join(str(local[k]) for k in ['utterance', 'vocabulary', 'number', 'incomplete', 'review']) + ' |')
    lines += ['', '## Sous-classes lexicales par niveau source', '', '| Niveau source | Adjectifs | Prépositions | Adverbes | Autres | Incertains |', '|---|---:|---:|---:|---:|---:|']
    for level in range(1, 11):
        local = Counter(row['lexicalClass'] for row in assignments if row['contentType'] == 'vocabulary' and deck[row['sourceIndex']]['lv'] == level)
        lines.append('| L' + str(level) + ' | ' + ' | '.join(str(local[k]) for k in ['adjective', 'preposition', 'adverb', 'other', 'uncertain']) + ' |')
    lines += [
        '', 'Ce tableau utilise le niveau historique uniquement pour l’inventaire. Il ne réaffecte aucun niveau et ne touche pas aux droits d’accès. Le `reviewStatus` distingue les cas précisément examinés des décisions proposées par règles ; même le statut `reviewed` ne vaut pas validation native ou validation de la méthode phonétique.',
        '', '## Réserves à examiner', '', '| Indice | Source exacte | Motif |', '|---:|---|---|',
    ]
    for row in assignments:
        if row['contentType'] == 'review':
            text = deck[row['sourceIndex']]['t'].replace('|', r'\|')
            lines.append(f"| {row['sourceIndex']} | {text} | {row['reason']} |")
    lines += ['', '## Reproduction', '', '```sh', 'python3 -B tools/maquette-guidee/classify_fr.py', 'python3 -B tools/maquette-guidee/classify_fr.py --check', '```', '',
              'Empreinte canonique de `DECKS.fr` : `' + result['sourceDeckSha256'] + '`. Aucune phonétique n’a été normalisée ou inférée.', '']
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    deck, data = make()
    content = json.dumps(data, ensure_ascii=False, indent=2) + '\n'

    docs = markdown(deck, data)
    for path, value in [(OUTPUT, content), (DOC, docs)]:
        if args.check:
            if not path.exists() or path.read_text() != value:
                raise SystemExit('Out of date: ' + str(path.relative_to(ROOT)))
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(value)
    print(json.dumps({'cards': len(deck), 'counts': Counter(row['contentType'] for row in data['assignments']),
                      'lexicalCounts': Counter(row['lexicalClass'] for row in data['assignments'] if row['contentType'] == 'vocabulary')}, ensure_ascii=False))


if __name__ == '__main__':
    main()

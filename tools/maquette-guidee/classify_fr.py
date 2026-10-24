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
    "le produit ne s'allume pas": ('utterance', 'Phrase entière examinée : Le produit est le sujet et ne s’allume pas le prédicat négatif conjugué ; ce n’est pas un groupe nominal lexical.'),
    'le prix inclut le transport': ('utterance', 'Phrase entière examinée : Le prix est le sujet, inclut le verbe conjugué et le transport le complément ; ne pas classer en lexique.'),
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


# Owner-requested focused semantic corrections. Source-index decisions only;
# French form and Chinese sense are checked without changing any source field.
REVIEWED_TYPE_BY_INDEX = {264: ('vocabulary',
       'Tout de suite signifie 立刻/马上 : locution temporelle isolée dans cette source, pas une phrase '
       'personnelle complète.'),
 265: ('vocabulary',
       'tout de suite signifie 马上 : locution adverbiale temporelle présentée sans contexte de réplique '
       '; aucun ordre n’est inventé.'),
 3430: ('utterance',
        'Phrase déclarative complète : Le chat est le sujet et grimpe à l’arbre le prédicat ; ne pas '
        'traiter toute la phrase comme un nom.'),
 3537: ('utterance',
        'Phrase déclarative complète : Le prix dépend du grammage, avec sujet, verbe et complément '
        'fournis.'),
 4416: ('utterance',
        'Phrase déclarative complète : Un autre fournisseur est le sujet, propose le verbe conjugué et '
        'moins cher la comparaison de prix.')}

REVIEWED_FAMILY_BY_INDEX = {1144: ('vocab-travail',
        'Sens lexical vérifié sur la source française et son sens chinois : Payer les factures. / 付账单 ; '
        'destination thématique entière, aucun mot extrait.'),
 1776: ('vocab-travail',
        "Sens lexical vérifié sur la source française et son sens chinois : l'ordre du jour / 议程 ; "
        'destination thématique entière, aucun mot extrait.'),
 2047: ('vocab-travail',
        'Sens lexical vérifié sur la source française et son sens chinois : Avoir du pain sur la '
        'planche. / 有很多工作要做 ; destination thématique entière, aucun mot extrait.'),
 2085: ('vocab-loisirs',
        "Sens lexical vérifié sur la source française et son sens chinois : L'art de vivre à la "
        'française. / 法式生活艺术 ; destination thématique entière, aucun mot extrait.'),
 2969: ('vocab-travail',
        'le plan signifie计划 : un programme ou projet, pas une carte géographique ; unité lexicale '
        'entière conservée.'),
 3022: ('vocab-restaurant',
        'Sens lexical vérifié sur la source française et son sens chinois : Pour deux personnes. / 两位 ; '
        'destination thématique entière, aucun mot extrait.'),
 3106: ('vocab-travail',
        'Sens lexical vérifié sur la source française et son sens chinois : le prix de gros / 批发价 ; '
        'destination thématique entière, aucun mot extrait.'),
 3107: ('vocab-personnes',
        'une radio signifieX光, examen médical ; ne pas classer en appareil de musique.'),
 3119: ('vocab-voyage',
        'Sens lexical vérifié sur la source française et son sens chinois : un sac à dos / 背包 ; '
        'destination thématique entière, aucun mot extrait.'),
 3124: ('vocab-personnes',
        'un coup de soleil signifie晒伤, atteinte de la peau ; santé/corps, pas météo malgré le mot '
        'soleil.'),
 3166: ('vocab-loisirs',
        'Sens lexical vérifié sur la source française et son sens chinois : le cinéma / 电影院 ; '
        'destination thématique entière, aucun mot extrait.'),
 3192: ('vocab-voyage',
        'Sens lexical vérifié sur la source française et son sens chinois : le permis de conduire / 驾照 '
        '; destination thématique entière, aucun mot extrait.'),
 3205: ('vocab-restaurant',
        'Sens lexical vérifié sur la source française et son sens chinois : un chapeau de soleil / 遮阳帽 '
        '; destination thématique entière, aucun mot extrait.'),
 3228: ('vocab-restaurant',
        'Sens lexical vérifié sur la source française et son sens chinois : les lunettes de soleil / '
        '太阳镜 ; destination thématique entière, aucun mot extrait.'),
 3233: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : une mauvaise herbe / 杂草 ; '
        'destination thématique entière, aucun mot extrait.'),
 3248: ('vocab-voyage',
        'Sens lexical vérifié sur la source française et son sens chinois : la place côté couloir / '
        '靠走道座位 ; destination thématique entière, aucun mot extrait.'),
 3272: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : une alerte tempête / 暴风预警 ; '
        'destination thématique entière, aucun mot extrait.'),
 3273: ('vocab-loisirs',
        'Sens lexical vérifié sur la source française et son sens chinois : un ballon de plage / 沙滩球 ; '
        'destination thématique entière, aucun mot extrait.'),
 3274: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : une tempête de neige / 暴风雪 '
        '; destination thématique entière, aucun mot extrait.'),
 3277: ('vocab-loisirs',
        'Sens lexical vérifié sur la source française et son sens chinois : le musée / 博物馆 ; '
        'destination thématique entière, aucun mot extrait.'),
 3284: ('vocab-travail',
        'Sens lexical vérifié sur la source française et son sens chinois : la matière première / 原材料 ; '
        'destination thématique entière, aucun mot extrait.'),
 3285: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : un pot de fleurs / 花盆 ; '
        'destination thématique entière, aucun mot extrait.'),
 3312: ('vocab-travail',
        'Sens lexical vérifié sur la source française et son sens chinois : le film plastique / 塑料膜 ; '
        'destination thématique entière, aucun mot extrait.'),
 3319: ('vocab-restaurant',
        'Sens lexical vérifié sur la source française et son sens chinois : des bottes de neige / 雪地靴 ; '
        'destination thématique entière, aucun mot extrait.'),
 3332: ('vocab-restaurant',
        'Sens lexical vérifié sur la source française et son sens chinois : une serviette de plage / '
        '沙滩巾 ; destination thématique entière, aucun mot extrait.'),
 3342: ('vocab-voyage',
        'Sens lexical vérifié sur la source française et son sens chinois : le ticket / 车票 ; '
        'destination thématique entière, aucun mot extrait.'),
 3348: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : un bonhomme de neige / 雪人 ; '
        'destination thématique entière, aucun mot extrait.'),
 3368: ('vocab-travail',
        'Sens lexical vérifié sur la source française et son sens chinois : une feuille de papier / 一张纸 '
        '; destination thématique entière, aucun mot extrait.'),
 3380: ('vocab-travail',
        'Sens lexical vérifié sur la source française et son sens chinois : le carton extérieur / 外箱 ; '
        'destination thématique entière, aucun mot extrait.'),
 3421: ('vocab-travail',
        'Sens lexical vérifié sur la source française et son sens chinois : les conditions de paiement '
        '/ 付款条件 ; destination thématique entière, aucun mot extrait.'),
 3435: ('vocab-loisirs',
        "Sens lexical vérifié sur la source française et son sens chinois : un feu d'artifice / 烟花 ; "
        'destination thématique entière, aucun mot extrait.'),
 3453: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : un tremblement de terre / '
        '地震 ; destination thématique entière, aucun mot extrait.'),
 3491: ('vocab-maison',
        "Sens lexical vérifié sur la source française et son sens chinois : Le robinet d'eau chaude. / "
        '热水龙头 ; destination thématique entière, aucun mot extrait.'),
 3504: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : de fortes chutes de neige / '
        '大雪 ; destination thématique entière, aucun mot extrait.'),
 3525: ('vocab-travail',
        'Sens lexical vérifié sur la source française et son sens chinois : le coût de moule / 开模费 ; '
        'destination thématique entière, aucun mot extrait.'),
 3543: ('vocab-travail',
        'Sens lexical vérifié sur la source française et son sens chinois : le film rétractable / 收缩膜 ; '
        'destination thématique entière, aucun mot extrait.'),
 3617: ('vocab-voyage',
        'Sens lexical vérifié sur la source française et son sens chinois : la place côté hublot / 靠窗座位 '
        '; destination thématique entière, aucun mot extrait.'),
 3626: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : un flocon de neige / 雪花 ; '
        'destination thématique entière, aucun mot extrait.'),
 3653: ('vocab-travail',
        'Sens lexical vérifié sur la source française et son sens chinois : la pièce jointe / 附件 ; '
        'destination thématique entière, aucun mot extrait.'),
 3893: ('vocab-loisirs',
        'Sens lexical vérifié sur la source française et son sens chinois : un livre / 书 ; destination '
        'thématique entière, aucun mot extrait.'),
 3903: ('vocab-maison',
        'Sens lexical vérifié sur la source française et son sens chinois : un bureau / 书桌 ; '
        'destination thématique entière, aucun mot extrait.'),
 3914: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : le jardin / 花园 ; '
        'destination thématique entière, aucun mot extrait.'),
 3929: ('vocab-maison', 'la peinture signifie油漆, matériau domestique ; pas une activité artistique.'),
 3994: ('vocab-restaurant',
        'le poisson, sens鱼, est présenté dans la série alimentaire viande/poulet ; pas de bascule '
        'automatique vers animaux.'),
 4014: ('vocab-restaurant',
        'une orange signifie橙子, fruit ; ce nom ne doit pas rejoindre orange-couleur de sens橙色.'),
 4039: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : un chien / 狗 ; destination '
        'thématique entière, aucun mot extrait.'),
 4040: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : un chat / 猫 ; destination '
        'thématique entière, aucun mot extrait.'),
 4041: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : un oiseau / 鸟 ; destination '
        'thématique entière, aucun mot extrait.'),
 4079: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : le soleil / 太阳 ; '
        'destination thématique entière, aucun mot extrait.'),
 4080: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : la lune / 月亮 ; destination '
        'thématique entière, aucun mot extrait.'),
 4081: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : le ciel / 天空 ; destination '
        'thématique entière, aucun mot extrait.'),
 4082: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : les étoiles / 星星 ; '
        'destination thématique entière, aucun mot extrait.'),
 4083: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : la pluie / 雨 ; destination '
        'thématique entière, aucun mot extrait.'),
 4084: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : la neige / 雪 ; destination '
        'thématique entière, aucun mot extrait.'),
 4085: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : le vent / 风 ; destination '
        'thématique entière, aucun mot extrait.'),
 4086: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : la mer / 大海 ; destination '
        'thématique entière, aucun mot extrait.'),
 4087: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : la montagne / 山 ; '
        'destination thématique entière, aucun mot extrait.'),
 4088: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : la rivière / 河 ; '
        'destination thématique entière, aucun mot extrait.'),
 4089: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : la forêt / 森林 ; destination '
        'thématique entière, aucun mot extrait.'),
 4090: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : la plage / 海滩 ; destination '
        'thématique entière, aucun mot extrait.'),
 4091: ('vocab-nature',
        "Sens lexical vérifié sur la source française et son sens chinois : l'arbre / 树 ; destination "
        'thématique entière, aucun mot extrait.'),
 4092: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : la fleur / 花 ; destination '
        'thématique entière, aucun mot extrait.'),
 4094: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : une feuille / 叶子 ; '
        'destination thématique entière, aucun mot extrait.'),
 4096: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : un lac / 湖 ; destination '
        'thématique entière, aucun mot extrait.'),
 4115: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : un orage / 暴风雨 ; '
        'destination thématique entière, aucun mot extrait.'),
 4119: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : un nuage / 云 ; destination '
        'thématique entière, aucun mot extrait.'),
 4123: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : une fleur / 花 ; destination '
        'thématique entière, aucun mot extrait.'),
 4124: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : un arbre / 树 ; destination '
        'thématique entière, aucun mot extrait.'),
 4134: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : la glace / 冰 ; destination '
        'thématique entière, aucun mot extrait.'),
 4297: ('vocab-loisirs',
        'Sens lexical vérifié sur la source française et son sens chinois : la musique / 音乐 ; '
        'destination thématique entière, aucun mot extrait.'),
 4299: ('vocab-loisirs',
        'Sens lexical vérifié sur la source française et son sens chinois : la guitare / 吉他 ; '
        'destination thématique entière, aucun mot extrait.'),
 4300: ('vocab-loisirs',
        'Sens lexical vérifié sur la source française et son sens chinois : le piano / 钢琴 ; destination '
        'thématique entière, aucun mot extrait.'),
 4302: ('vocab-loisirs',
        'Sens lexical vérifié sur la source française et son sens chinois : un concert / 演唱会 ; '
        'destination thématique entière, aucun mot extrait.'),
 4303: ('vocab-loisirs',
        'Sens lexical vérifié sur la source française et son sens chinois : un film / 电影 ; destination '
        'thématique entière, aucun mot extrait.'),
 4308: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : le jardinage / 园艺 ; '
        'destination thématique entière, aucun mot extrait.'),
 4309: ('vocab-loisirs',
        'Sens lexical vérifié sur la source française et son sens chinois : la lecture / 阅读 ; '
        'destination thématique entière, aucun mot extrait.'),
 4315: ('vocab-loisirs',
        'Sens lexical vérifié sur la source française et son sens chinois : un loisir / 爱好 ; '
        'destination thématique entière, aucun mot extrait.'),
 4345: ('vocab-loisirs',
        'Sens lexical vérifié sur la source française et son sens chinois : le tennis / 网球 ; '
        'destination thématique entière, aucun mot extrait.'),
 4352: ('vocab-nature',
        'Sens lexical vérifié sur la source française et son sens chinois : un arc-en-ciel / 彩虹 ; '
        'destination thématique entière, aucun mot extrait.'),
 4389: ('vocab-loisirs',
        'Sens lexical vérifié sur la source française et son sens chinois : un ballon / 气球 ; '
        'destination thématique entière, aucun mot extrait.')}

REVIEWED_SITUATION_BY_INDEX = {38: ('ressentis',
      'Sens communicatif vérifié : Je vais mieux. / 我好点了 ; le mot de surface ne suffit pas à faire de '
      'cet énoncé un trajet ou un repas.'),
 78: ('conversation',
      'Sens communicatif vérifié : Ça me va. / 我可以接受 ; acceptation, aide ou action domestique, pas '
      'trajet ni sentiment imposé par un mot de surface.'),
 98: ('conversation',
      "Sens communicatif vérifié : J'ai bien reçu. / 我收到了 ; le mot de surface ne suffit pas à faire de "
      'cet énoncé un trajet ou un repas.'),
 154: ('ressentis',
       "Sens communicatif vérifié : J'ai besoin d'argent. / 我需要钱 ; le mot de surface ne suffit pas à "
       'faire de cet énoncé un trajet ou un repas.'),
 161: ('conversation',
       'Sens communicatif vérifié : Je vais essayer. / 我试试看。 ; le mot de surface ne suffit pas à faire '
       'de cet énoncé un trajet ou un repas.'),
 175: ('decrire',
       'Sens communicatif vérifié : Ça me va bien. / 很合身 ; le mot de surface ne suffit pas à faire de '
       'cet énoncé un trajet ou un repas.'),
 177: ('repas',
       'Sens communicatif vérifié : Je vais prendre ça. / 我要这个 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 183: ('comprendre',
       'Sens communicatif vérifié : Moins vite ! / 慢点！ ; le mot de surface ne suffit pas à faire de cet '
       'énoncé un trajet ou un repas.'),
 186: ('decrire',
       'Sens communicatif vérifié : Ça vous va bien. / 您穿很好看 ; le mot de surface ne suffit pas à faire '
       'de cet énoncé un trajet ou un repas.'),
 187: ('decrire',
       'Sens communicatif vérifié : Ça ne me va pas. / 不合身 ; le mot de surface ne suffit pas à faire de '
       'cet énoncé un trajet ou un repas.'),
 196: ('conversation',
       'Sens communicatif vérifié : Je vais réfléchir. / 我再想想 ; le mot de surface ne suffit pas à faire '
       'de cet énoncé un trajet ou un repas.'),
 284: ('conversation',
       'Sens communicatif vérifié : Je vais le faire. / 我打算做 ; le mot de surface ne suffit pas à faire '
       'de cet énoncé un trajet ou un repas.'),
 298: ('ressentis',
       'Sens communicatif vérifié : Je vais me reposer. / 我要去休息 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 311: ('ressentis',
       'Sens communicatif vérifié : Je vais me détendre. / 我要放松一下 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 318: ('conversation',
       'Sens communicatif vérifié : On va célébrer ça. / 我们要庆祝一下。 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 319: ('conversation',
       'Sens communicatif vérifié : Je vais y réfléchir. / 我考虑一下 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 330: ('quotidien',
       'Sens communicatif vérifié : Je vais me changer. / 我要去换衣服 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 332: ('quotidien',
       'Sens communicatif vérifié : Je vais me doucher. / 我要去洗澡 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 342: ('conversation',
       'Sens communicatif vérifié : Tu vas rire. / 你会笑的。 ; le mot de surface ne suffit pas à faire de '
       'cet énoncé un trajet ou un repas.'),
 404: ('conversation',
       'Sens communicatif vérifié : On va voir. / 我们看看吧。/再说吧。 ; le mot de surface ne suffit pas à faire '
       'de cet énoncé un trajet ou un repas.'),
 406: ('ressentis',
       'Sens communicatif vérifié : On fait aller. / 凑合过呗。 ; le mot de surface ne suffit pas à faire de '
       'cet énoncé un trajet ou un repas.'),
 413: ('ressentis',
       'Sens communicatif vérifié : Ça sent bon. / 闻起来很香 ; le mot de surface ne suffit pas à faire de '
       'cet énoncé un trajet ou un repas.'),
 421: ('quotidien',
       'Sens communicatif vérifié : Je vais me coucher. / 我要去睡觉了。 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 425: ('conversation',
       'Sens communicatif vérifié : On va commencer. / 我们要开始了。 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 441: ('repas',
       'Sens communicatif vérifié : Je vais cuisiner. / 我要去做饭 ; le mot de surface ne suffit pas à faire '
       'de cet énoncé un trajet ou un repas.'),
 457: ('quotidien',
       'Sens communicatif vérifié : On va se marier. / 我们要结婚了 ; le mot de surface ne suffit pas à faire '
       'de cet énoncé un trajet ou un repas.'),
 476: ('travail',
       'Sens communicatif vérifié : Voilà ma carte. / 这是我的名片 ; le mot de surface ne suffit pas à faire '
       'de cet énoncé un trajet ou un repas.'),
 484: ('reperes',
       'Sens communicatif vérifié : Ça fait combien de temps ? / 多长时间了？ ; le mot de surface ne suffit '
       'pas à faire de cet énoncé un trajet ou un repas.'),
 493: ('repas',
       'Sens communicatif vérifié : On va te rembourser. / 我们会退款给你。 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 504: ('conversation',
       'Sens communicatif vérifié : On va décider demain. / 我们明天决定。 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 507: ('quotidien',
       'Sens communicatif vérifié : Je vais le réparer. / 我会修好它。 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 509: ('quotidien',
       'Sens communicatif vérifié : Je vais me marier. / 我要结婚了 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 515: ('quotidien',
       'Sens communicatif vérifié : Je vais repasser ça. / 我去熨这个。 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 516: ('travail',
       'Sens communicatif vérifié : Je vais mesurer ça. / 我去量一下。 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 517: ('travail',
       'Sens communicatif vérifié : Je vais imprimer ça. / 我去打印这个。 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 518: ('conversation',
       'Sens communicatif vérifié : Je vais mémoriser ça. / 我要把这个背下来。 ; le mot de surface ne suffit pas '
       'à faire de cet énoncé un trajet ou un repas.'),
 519: ('repas',
       'Sens communicatif vérifié : Je vais mijoter ça. / 我要慢炖这个。 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 527: ('quotidien',
       'Sens communicatif vérifié : On va nager demain. / 我们明天去游泳。 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 541: ('quotidien',
       'Sens communicatif vérifié : Je vais me promener. / 我要去散步 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 542: ('quotidien',
       'Sens communicatif vérifié : Je vais dribbler. / 我来运球。 ; le mot de surface ne suffit pas à faire '
       'de cet énoncé un trajet ou un repas.'),
 558: ('travail',
       'Sens communicatif vérifié : Je signe ici ? / 我在这儿签吗？ ; le mot de surface ne suffit pas à faire '
       'de cet énoncé un trajet ou un repas.'),
 559: ('ressentis',
       "Sens communicatif vérifié : Qu'est-ce qui ne va pas ? / 怎么了？ ; le mot de surface ne suffit pas "
       'à faire de cet énoncé un trajet ou un repas.'),
 588: ('quotidien',
       'Sens communicatif vérifié : Il va pleuvoir. / 要下雨了 ; le mot de surface ne suffit pas à faire de '
       'cet énoncé un trajet ou un repas.'),
 642: ('quotidien',
       'Sens communicatif vérifié : On va patiner demain. / 我们明天去滑冰。 ; le mot de surface ne suffit pas '
       'à faire de cet énoncé un trajet ou un repas.'),
 643: ('quotidien',
       "Sens communicatif vérifié : J'ai peint la chambre. / 我把卧室刷了。 ; le mot de surface ne suffit pas "
       'à faire de cet énoncé un trajet ou un repas.'),
 656: ('reperes',
       'Sens communicatif vérifié : Je vais être en retard. / 我要迟到了 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 659: ('repas',
       'Sens communicatif vérifié : On va trinquer. / 我们来碰个杯。 ; le mot de surface ne suffit pas à faire '
       'de cet énoncé un trajet ou un repas.'),
 674: ('decrire',
       'Sens communicatif vérifié : Il va grandir encore. / 他还会再长。 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 710: ('conversation',
       'Sens communicatif vérifié : Je vais te montrer. / 我给你看。 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 714: ('reperes',
       "Sens communicatif vérifié : Quand est-ce que c'est prêt ? / 什么时候能好？ ; le mot de surface ne "
       'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 719: ('repas',
       'Sens communicatif vérifié : Je peux voir la carte ? / 能看看菜单吗？ ; le mot de surface ne suffit pas '
       'à faire de cet énoncé un trajet ou un repas.'),
 749: ('quotidien',
       'Sens communicatif vérifié : Il va peut-être pleuvoir. / 可能会下雨 ; le mot de surface ne suffit pas '
       'à faire de cet énoncé un trajet ou un repas.'),
 761: ('quotidien',
       'Sens communicatif vérifié : Je vais ranger. / 我要去收拾 ; le mot de surface ne suffit pas à faire '
       'de cet énoncé un trajet ou un repas.'),
 764: ('travail',
       'Sens communicatif vérifié : Je vais tout supprimer. / 我要全部删掉。 ; le mot de surface ne suffit pas '
       'à faire de cet énoncé un trajet ou un repas.'),
 779: ('travail',
       'Sens communicatif vérifié : Tu vas cliquer ici. / 你点这里。 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 786: ('conversation',
       "Sens communicatif vérifié : Je vais t'écrire demain. / 我明天给你写。 ; le mot de surface ne suffit "
       'pas à faire de cet énoncé un trajet ou un repas.'),
 787: ('quotidien',
       'Sens communicatif vérifié : Je vais peindre demain. / 我明天刷漆。 ; le mot de surface ne suffit pas '
       'à faire de cet énoncé un trajet ou un repas.'),
 809: ('reperes',
       'Sens communicatif vérifié : On va être en retard. / 我们要迟到了。 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 816: ('repas',
       'Sens communicatif vérifié : Je vais faire les courses. / 我要去买菜 ; le mot de surface ne suffit '
       'pas à faire de cet énoncé un trajet ou un repas.'),
 817: ('conversation',
       'Sens communicatif vérifié : On va y arriver. / 我们会做到的。 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 829: ('travail',
       'Sens communicatif vérifié : Je vais commencer la production. / 我要开始生产。（将来） ; le mot de surface '
       'ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 840: ('quotidien',
       'Sens communicatif vérifié : Je vais courir ce soir. / 我今晚去跑步。 ; le mot de surface ne suffit pas '
       'à faire de cet énoncé un trajet ou un repas.'),
 841: ('conversation',
       "Sens communicatif vérifié : Je vais t'appeler ce soir. / 我今晚给你打电话。 ; le mot de surface ne "
       'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 843: ('travail',
       'Sens communicatif vérifié : Je voudrais le prix FOB. / 我想要FOB价格。 ; le mot de surface ne suffit '
       'pas à faire de cet énoncé un trajet ou un repas.'),
 863: ('repas',
       'Sens communicatif vérifié : Vous prenez la carte ? / 收卡吗？ ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 869: ('conversation',
       'Sens communicatif vérifié : Tu vas y arriver ! / 你会成功的！ ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 880: ('conversation',
       'Sens communicatif vérifié : On va fêter ensemble. / 我们一起庆祝吧。 ; le mot de surface ne suffit pas '
       'à faire de cet énoncé un trajet ou un repas.'),
 891: ('quotidien',
       "Sens communicatif vérifié : Je vais m'habiller. / 我去穿衣服。 ; le mot de surface ne suffit pas à "
       'faire de cet énoncé un trajet ou un repas.'),
 892: ('conversation',
       'Sens communicatif vérifié : Je vais raccrocher. / 我要挂了。 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 901: ('conversation',
       'Sens communicatif vérifié : Tu veux essayer ? / 你想试试吗？ ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 944: ('comprendre',
       "Sens communicatif vérifié : Je vais t'enseigner. / 我来教你。 ; le mot de surface ne suffit pas à "
       'faire de cet énoncé un trajet ou un repas.'),
 950: ('conversation',
       'Sens communicatif vérifié : Tu vas réussir. / 你会成功的。 ; le mot de surface ne suffit pas à faire '
       'de cet énoncé un trajet ou un repas.'),
 951: ('ressentis',
       'Sens communicatif vérifié : Tu vas glisser. / 你会滑倒的。 ; le mot de surface ne suffit pas à faire '
       'de cet énoncé un trajet ou un repas.'),
 953: ('ressentis',
       'Sens communicatif vérifié : Tu vas frissonner. / 你会打冷战的。 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 954: ('quotidien',
       'Sens communicatif vérifié : Tu vas tout casser. / 你会把一切弄坏。 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 995: ('conversation',
       'Sens communicatif vérifié : Je vais les inviter. / 我要邀请他们。 ; le mot de surface ne suffit pas à '
       'faire de cet énoncé un trajet ou un repas.'),
 1005: ('repas',
        'Sens communicatif vérifié : Je vais moins dépenser. / 我要少花点。 ; le mot de surface ne suffit pas '
        'à faire de cet énoncé un trajet ou un repas.'),
 1013: ('conversation',
        'Sens communicatif vérifié : Je vais passer mon tour. / 我还是算了 ; le mot de surface ne suffit pas '
        'à faire de cet énoncé un trajet ou un repas.'),
 1015: ('quotidien',
        'Sens communicatif vérifié : Je vais réviser ce soir. / 我今晚要复习。 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1032: ('conversation',
        'Sens communicatif vérifié : On va danser ce soir ? / 今晚去跳舞吗？ ; le mot de surface ne suffit pas '
        'à faire de cet énoncé un trajet ou un repas.'),
 1037: ('conversation',
        "Sens communicatif vérifié : Qu'est-ce que tu vas faire ? / 你打算做什么？ ; le mot de surface ne "
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 1039: ('conversation',
        'Sens communicatif vérifié : Tu as reçu mon message ? / 你收到我的信息了吗？ ; le mot de surface ne '
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 1042: ('travail',
        "Sens communicatif vérifié : C'est un emballage à plat ? / 是平板包装吗？ ; le mot de surface ne "
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 1054: ('quotidien',
        'Sens communicatif vérifié : Je vais me coucher tôt. / 我要早点睡 ; le mot de surface ne suffit pas '
        'à faire de cet énoncé un trajet ou un repas.'),
 1073: ('comprendre',
        'Sens communicatif vérifié : Je vais voir le problème. / 我去看看问题。（将来） ; le mot de surface ne '
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 1081: ('repas',
        'Sens communicatif vérifié : On va griller ce soir. / 我们今晚烧烤。 ; le mot de surface ne suffit pas '
        'à faire de cet énoncé un trajet ou un repas.'),
 1082: ('quotidien',
        'Sens communicatif vérifié : Il va geler ce soir. / 今晚会结冰。 ; le mot de surface ne suffit pas à '
        'faire de cet énoncé un trajet ou un repas.'),
 1096: ('saluer',
        'Sens communicatif vérifié : On va le féliciter. / 我们去恭喜他。 ; le mot de surface ne suffit pas à '
        'faire de cet énoncé un trajet ou un repas.'),
 1111: ('ressentis',
        "Sens communicatif vérifié : Je n'en reviens pas ! / 我简直不敢相信！ ; le mot de surface ne suffit pas "
        'à faire de cet énoncé un trajet ou un repas.'),
 1113: ('conversation',
        'Sens communicatif vérifié : Je vais poser la question. / 我去问问。 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1132: ('travail',
        'Sens communicatif vérifié : Je vais tout enregistrer. / 我会全部保存。 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1145: ('quotidien',
        'Sens communicatif vérifié : Je mesure la table. / 我量桌子。 ; le mot de surface ne suffit pas à '
        'faire de cet énoncé un trajet ou un repas.'),
 1165: ('travail',
        'Sens communicatif vérifié : Je vais télécharger ça. / 我去下载这个。 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1179: ('travail',
        'Sens communicatif vérifié : Quel est le prix unitaire ? / 单价是多少？ ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1185: ('conversation',
        'Sens communicatif vérifié : Ça ne mange pas de pain. / 反正也没什么损失。 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1200: ('repas',
        'Sens communicatif vérifié : Je voudrais voir la carte. / 我想看看菜单 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1213: ('quotidien',
        'Sens communicatif vérifié : Il pleuvait beaucoup. / 当时雨下得很大 ; le mot de surface ne suffit pas '
        'à faire de cet énoncé un trajet ou un repas.'),
 1222: ('conversation',
        'Sens communicatif vérifié : Faisons un plan. / 我们定个计划 ; le mot de surface ne suffit pas à '
        'faire de cet énoncé un trajet ou un repas.'),
 1241: ('quotidien',
        'Sens communicatif vérifié : Je vais bricoler un peu. / 我去修修补补。 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1254: ('quotidien',
        'Sens communicatif vérifié : Je vais planter des fleurs. / 我要种花。 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1265: ('repas',
        'Sens communicatif vérifié : Tu vas goûter ? / 你要尝尝吗？ ; le mot de surface ne suffit pas à faire '
        'de cet énoncé un trajet ou un repas.'),
 1269: ('quotidien',
        'Sens communicatif vérifié : Tu vas chanter ? / 你要唱吗？ ; le mot de surface ne suffit pas à faire '
        'de cet énoncé un trajet ou un repas.'),
 1272: ('decrire',
        'Sens communicatif vérifié : Tu vas choisir lequel ? / 你要选哪个？ ; le mot de surface ne suffit pas '
        'à faire de cet énoncé un trajet ou un repas.'),
 1322: ('conversation',
        "Sens communicatif vérifié : Ça vaut le coup d'essayer. / 值得一试。 ; le mot de surface ne suffit "
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1325: ('ressentis',
        'Sens communicatif vérifié : Je vais me reposer un peu. / 我要休息一下。 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1349: ('quotidien',
        'Sens communicatif vérifié : Sors la poubelle. / 倒垃圾 ; acceptation, aide ou action domestique, '
        'pas trajet ni sentiment imposé par un mot de surface.'),
 1352: ('conversation',
        "Sens communicatif vérifié : Je vais t'ajouter sur WeChat. / 我加你微信。 ; le mot de surface ne "
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 1370: ('travail',
        'Sens communicatif vérifié : Vous allez signer là. / 您在这儿签。 ; le mot de surface ne suffit pas à '
        'faire de cet énoncé un trajet ou un repas.'),
 1373: ('quotidien',
        'Sens communicatif vérifié : Je vais regarder un film. / 我要看部电影 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1375: ('quotidien',
        'Sens communicatif vérifié : Je vais tout dépoussiérer. / 我要把灰都擦掉。 ; le mot de surface ne '
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 1381: ('repas',
        "Sens communicatif vérifié : J'ai trop cuit les pâtes. / 我把面煮过头了。 ; le mot de surface ne suffit "
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1391: ('quotidien',
        'Sens communicatif vérifié : Ils vont construire ici. / 他们要在这儿建。 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1401: ('ressentis',
        'Sens communicatif vérifié : Tu vas me faire pleurer. / 你要把我弄哭了。 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1450: ('conversation',
        'Sens communicatif vérifié : On ne va pas se mentir. / 咱们实话实说。 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1456: ('travail',
        'Sens communicatif vérifié : Voici ma carte. / 这是我的名片 ; le mot de surface ne suffit pas à faire '
        'de cet énoncé un trajet ou un repas.'),
 1484: ('conversation',
        'Sens communicatif vérifié : Je suis en train de réfléchir. / 我正在思考 ; le mot de surface ne '
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 1487: ('conversation',
        'Sens communicatif vérifié : Tu ne vas pas échouer. / 你不会失败的。 ; le mot de surface ne suffit pas '
        'à faire de cet énoncé un trajet ou un repas.'),
 1500: ('quotidien',
        "Sens communicatif vérifié : Je vais l'embrasser. / 我要吻她。 ; le mot de surface ne suffit pas à "
        'faire de cet énoncé un trajet ou un repas.'),
 1573: ('decrire',
        'Sens communicatif vérifié : Tu vas prendre lequel ? / 你要拿哪一个？ ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1576: ('saluer',
        'Sens communicatif vérifié : Je file, à plus ! / 我先走了，回见！ ; le mot de surface ne suffit pas à '
        'faire de cet énoncé un trajet ou un repas.'),
 1598: ('quotidien',
        "Sens communicatif vérifié : Il paraît qu'il va neiger. / 听说要下雪了。 ; le mot de surface ne suffit "
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1622: ('quotidien',
        "Sens communicatif vérifié : Je vais m'entraîner ce soir. / 我今晚去训练。 ; le mot de surface ne "
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 1625: ('travail',
        'Sens communicatif vérifié : On va lancer le projet. / 我们要启动项目。 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1626: ('conversation',
        'Sens communicatif vérifié : Je vais rompre le silence. / 我要打破沉默。 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1627: ('quotidien',
        'Sens communicatif vérifié : Je vais balayer la terrasse. / 我去扫露台。 ; le mot de surface ne '
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 1628: ('repas',
        'Sens communicatif vérifié : Je vais frire des frites. / 我去炸薯条。 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1633: ('decrire',
        'Sens communicatif vérifié : Tu préfères lequel ? / 你更喜欢哪个？ ; le mot de surface ne suffit pas à '
        'faire de cet énoncé un trajet ou un repas.'),
 1641: ('quotidien',
        "Sens communicatif vérifié : N'empêche qu'il est arrivé premier. / 尽管如此，他还是得了第一。 ; le mot de "
        'surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 1645: ('reperes',
        'Sens communicatif vérifié : On va rater le début. / 我们要错过开头了。 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1688: ('comprendre',
        "Sens communicatif vérifié : Je n'arrive pas à me connecter. / 我登录不上去 ; le mot de surface ne "
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 1709: ('repas',
        'Sens communicatif vérifié : Je vais râper du gingembre. / 我去磨点姜。 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1710: ('travail',
        'Sens communicatif vérifié : Je vais serrer le boulon. / 我去拧紧螺栓。 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1737: ('quotidien',
        'Sens communicatif vérifié : Peux-tu sortir la poubelle ? / 你能倒一下垃圾吗？ ; acceptation, aide ou '
        'action domestique, pas trajet ni sentiment imposé par un mot de surface.'),
 1755: ('conversation',
        'Sens communicatif vérifié : Je vais prévenir les autres. / 我去通知其他人。 ; le mot de surface ne '
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 1763: ('repas',
        'Sens communicatif vérifié : Je suis en train de cuisiner. / 我正在做饭。 ; le mot de surface ne '
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 1792: ('repas',
        'Sens communicatif vérifié : On va faire les magasins samedi. / 我们周六去逛街购物 ; le mot de surface '
        'ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 1804: ('quotidien',
        'Sens communicatif vérifié : On va skier cet hiver. / 今年冬天我们去滑雪。 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1817: ('quotidien',
        'Sens communicatif vérifié : Ils sont en train de rompre. / 他们在闹分手。 ; le mot de surface ne '
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 1825: ('conversation',
        'Sens communicatif vérifié : Je vais te prêter le mien. / 我把我的借给你。 ; le mot de surface ne '
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 1827: ('quotidien',
        'Sens communicatif vérifié : Je vais jeter la poubelle. / 我去倒垃圾。 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1829: ('quotidien',
        'Sens communicatif vérifié : Je vais à la salle de sport. / 我去健身房 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1844: ('conversation',
        'Sens communicatif vérifié : Tu vas faire quoi ce week-end ? / 你这周末打算干什么？ ; le mot de surface '
        'ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 1856: ('conversation',
        "Sens communicatif vérifié : Tu vas voir, c'est facile. / 你会发现这很简单。 ; le mot de surface ne "
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 1890: ('quotidien',
        'Sens communicatif vérifié : Je vais éteindre la télé. / 我去关电视。 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1891: ('quotidien',
        'Sens communicatif vérifié : Je vais allumer la télé. / 我去开电视。 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1897: ('ressentis',
        'Sens communicatif vérifié : Viens te réchauffer près du feu. / 过来靠近火取暖 ; le mot de surface ne '
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 1917: ('quotidien',
        'Sens communicatif vérifié : Tu vas flirter avec lui ? / 你要跟他调情吗？ ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1920: ('conversation',
        "Sens communicatif vérifié : Qu'est-ce que tu ferais à ma place ? / 你要是我会怎么做？ ; le mot de "
        'surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 1921: ('conversation',
        "Sens communicatif vérifié : Ça te dit d'aller au cinéma ? / 想去看电影吗？ ; le mot de surface ne "
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 1922: ('conversation',
        "Sens communicatif vérifié : Ça te dirait d'aller au cinéma ? / 你想去看电影吗？ ; le mot de surface ne "
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 1932: ('decrire',
        'Sens communicatif vérifié : Je vais prendre celui-là. / 我要这个。 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1943: ('travail',
        "Sens communicatif vérifié : C'est notre prix plancher. / 这是我们的底线 ; le mot de surface ne suffit "
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1944: ('travail',
        'Sens communicatif vérifié : Quel est votre dernier prix ? / 你最低多少？ ; le mot de surface ne '
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 1949: ('travail',
        'Sens communicatif vérifié : Quel est le prix FOB ? / FOB价格是多少？ ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 1963: ('travail',
        'Sens communicatif vérifié : Qui paie le transport ? / 谁付运费？ ; le mot de surface ne suffit pas '
        'à faire de cet énoncé un trajet ou un repas.'),
 1986: ('travail',
        'Sens communicatif vérifié : Il faut signer ici. / 必须在这签字 ; le mot de surface ne suffit pas à '
        'faire de cet énoncé un trajet ou un repas.'),
 1990: ('comprendre',
        'Sens communicatif vérifié : Il faut appuyer ici. / 要按这里。 ; le mot de surface ne suffit pas à '
        'faire de cet énoncé un trajet ou un repas.'),
 2030: ('quotidien',
        "Sens communicatif vérifié : L'arbitre va siffler. / 裁判要吹哨了。 ; le mot de surface ne suffit pas "
        'à faire de cet énoncé un trajet ou un repas.'),
 2049: ('ressentis',
        "Sens communicatif vérifié : Je n'arrive pas à y croire. / 我难以置信 ; le mot de surface ne suffit "
        'pas à faire de cet énoncé un trajet ou un repas.'),
 2054: ('quotidien',
        'Sens communicatif vérifié : Je vais lui offrir un cadeau. / 我要送他一份礼物 ; le mot de surface ne '
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2063: ('decrire',
        "Sens communicatif vérifié : L'un ou l'autre, ça me va. / 都行 ; le mot de surface ne suffit pas "
        'à faire de cet énoncé un trajet ou un repas.'),
 2064: ('travail',
        'Sens communicatif vérifié : Il a été reçu à son examen. / 他考试通过了 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 2075: ('travail',
        'Sens communicatif vérifié : Je vais mettre en ligne les photos. / 我要上传照片 ; le mot de surface '
        'ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2077: ('conversation',
        "Sens communicatif vérifié : Quoi qu'il arrive, je te soutiens. / 不管怎样，我都支持你。 ; le mot de "
        'surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2098: ('ressentis',
        "Sens communicatif vérifié : Je n'arrive pas à y croire ! / 我简直不敢相信！ ; le mot de surface ne "
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2115: ('conversation',
        "Sens communicatif vérifié : Quoi qu'il arrive, je serai là. / 无论发生什么，我都会在。 ; le mot de surface "
        'ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2124: ('conversation',
        "Sens communicatif vérifié : Je viens d'apprendre la nouvelle. / 我刚听说这个消息。 ; le mot de surface "
        'ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2131: ('conversation',
        'Sens communicatif vérifié : On ne va pas y passer la nuit. / 我们不能在这上面耗一整晚。 ; le mot de surface '
        'ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2146: ('travail',
        'Sens communicatif vérifié : Merci pour votre réactivité. / 感谢您的快速反应。 ; le mot de surface ne '
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2150: ('travail',
        'Sens communicatif vérifié : Merci pour votre réponse rapide. / 谢谢您的快速回复 ; le mot de surface ne '
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2156: ('conversation',
        'Sens communicatif vérifié : Désolé de vous couper. / 抱歉打断一下 ; le mot de surface ne suffit pas '
        'à faire de cet énoncé un trajet ou un repas.'),
 2164: ('travail',
        'Sens communicatif vérifié : Envoyez la liste de prix. / 请发价格表 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 2218: ('quotidien',
        'Sens communicatif vérifié : Je vais étudier ce week-end. / 我这周末要学习。 ; le mot de surface ne '
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2224: ('ressentis',
        'Sens communicatif vérifié : Je ne me sens pas à ma place ici. / 我觉得自己不属于这里。 ; le mot de '
        'surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2227: ('comprendre',
        'Sens communicatif vérifié : Tu peux me donner un coup de main ? / 能搭把手吗？ ; acceptation, aide '
        'ou action domestique, pas trajet ni sentiment imposé par un mot de surface.'),
 2250: ('repas',
        "Sens communicatif vérifié : Vous pouvez le réchauffer, s'il vous plaît ? / 可以帮忙加热一下吗？ ; le mot "
        'de surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2279: ('conversation',
        'Sens communicatif vérifié : Je ne suis pas près de recommencer. / 我短期内绝不会再干这种事了。 ; le mot de '
        'surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2282: ('quotidien',
        'Sens communicatif vérifié : Je vais faire une sieste cet après-midi. / 我今天下午要午睡 ; le mot de '
        'surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2293: ('repas',
        'Sens communicatif vérifié : On va voir ailleurs aussi. / 我们再看看别家 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 2322: ('travail',
        'Sens communicatif vérifié : Quel est le coût du transport ? / 运费多少？ ; le mot de surface ne '
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2323: ('travail',
        'Sens communicatif vérifié : Quel est le coût du moule ? / 开模费用是多少？ ; le mot de surface ne '
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2336: ('travail',
        'Sens communicatif vérifié : Je ne peux pas aller plus haut. / 我不能再往上加了 ; le mot de surface ne '
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2352: ('travail',
        'Sens communicatif vérifié : Je reviens vers vous rapidement. / 我会尽快回复您 ; le mot de surface ne '
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2355: ('travail',
        'Sens communicatif vérifié : Qui prend en charge le transport ? / 谁负责运费？ ; le mot de surface ne '
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2370: ('travail',
        'Sens communicatif vérifié : Plusieurs pièces sont arrivées cassées. / 好几件到货就坏了 ; le mot de '
        'surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2383: ('travail',
        "Sens communicatif vérifié : Qu'est-ce que vous pouvez faire sur le prix ? / 价格上您能让多少？ ; le mot "
        'de surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2387: ('conversation',
        'Sens communicatif vérifié : Allez-y, je vous écoute. / 你先说，我在听 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 2419: ('quotidien',
        'Sens communicatif vérifié : Je me coiffe avant de sortir. / 我出门前会梳头 ; acceptation, aide ou '
        'action domestique, pas trajet ni sentiment imposé par un mot de surface.'),
 2426: ('reperes',
        "Sens communicatif vérifié : Ça fait combien de temps qu'on ne s'est pas vus ? / 我们多久没见了？ ; le "
        'mot de surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2450: ('quotidien',
        'Sens communicatif vérifié : Range ta chambre avant de sortir. / 出门前先收拾房间。 ; le mot de surface '
        'ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2451: ('repas',
        'Sens communicatif vérifié : Puisque tu insistes, je vais goûter. / 既然你坚持，那我就尝尝。 ; le mot de '
        'surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2488: ('ressentis',
        'Sens communicatif vérifié : Il ne tient plus en place tellement il est excité. / 他兴奋得坐立不安。 ; '
        'le mot de surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2506: ('conversation',
        "Sens communicatif vérifié : On ne fait pas d'omelette sans casser des œufs. / 有失才有得，不破不立。 ; le "
        'mot de surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2522: ('conversation',
        'Sens communicatif vérifié : On en reparlera après le dîner. / 晚饭后我们再谈。 ; le mot de surface ne '
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2543: ('conversation',
        'Sens communicatif vérifié : Rien ne sert de courir, il faut partir à point. / 跑得快不如动身早。 ; le '
        'mot de surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2567: ('conversation',
        'Sens communicatif vérifié : Cela va sans dire, mais cela va mieux en le disant. / '
        '这不言而喻，但说出来更好。 ; le mot de surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2597: ('travail',
        "Sens communicatif vérifié : On n'a pas reçu le bon nombre. / 我们收到的数量不对 ; le mot de surface ne "
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2601: ('travail',
        'Sens communicatif vérifié : On a reçu une meilleure offre ailleurs. / 别家给了更好的报价 ; le mot de '
        'surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2603: ('conversation',
        "Sens communicatif vérifié : C'est trop, soyons réalistes. / 太高了，现实点吧 ; le mot de surface ne "
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2608: ('conversation',
        'Sens communicatif vérifié : Je crois que tu devrais essayer. / 我觉得你该试试。 ; le mot de surface ne '
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2628: ('travail',
        'Sens communicatif vérifié : Vous pouvez suivre le colis en ligne. / 您可以在网上追踪包裹 ; le mot de '
        'surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2651: ('travail',
        'Sens communicatif vérifié : Il faut négocier le prix. / 必须谈价格 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 2662: ('travail',
        "Sens communicatif vérifié : Il faut payer d'avance. / 必须预付 ; le mot de surface ne suffit pas à "
        'faire de cet énoncé un trajet ou un repas.'),
 2676: ('travail',
        'Sens communicatif vérifié : Ce lot part par mer ou par avion ? / 这批走海运还是空运？ ; le mot de '
        'surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2681: ('saluer',
        'Sens communicatif vérifié : Restons en contact, voici ma carte. / 保持联系，这是我的名片。 ; le mot de '
        'surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2694: ('travail',
        'Sens communicatif vérifié : Je vous remercie de votre réponse. / 感谢您的回复。 ; le mot de surface '
        'ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2713: ('travail',
        'Sens communicatif vérifié : Pourriez-vous revoir le prix ? / 您能重新考虑一下价格吗？ ; le mot de surface '
        'ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2731: ('travail',
        "Sens communicatif vérifié : Ce prix est valable jusqu'à la fin du mois. / 这个价格月底前有效。 ; le mot "
        'de surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2746: ('conversation',
        "Sens communicatif vérifié : Il a plus d'un tour dans son sac. / 他的锦囊里妙计多着呢。 ; le mot de "
        'surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2768: ('travail',
        'Sens communicatif vérifié : Je vous remercie de votre prompte réponse. / 感谢您的及时回复。 ; le mot de '
        'surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2772: ('travail',
        'Sens communicatif vérifié : Je vous saurais gré de votre retour. / 盼复为感。 ; le mot de surface '
        'ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2795: ('travail',
        'Sens communicatif vérifié : Si vous prenez le transport, on valide. / 您包运费我们就定 ; le mot de '
        'surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2801: ('conversation',
        'Sens communicatif vérifié : Quand même, il aurait pu prévenir ! / 不管怎么说，他至少应该提前说一声！ ; le mot '
        'de surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2806: ('travail',
        'Sens communicatif vérifié : Je reviens vers vous suite à mon mail. / 我跟进一下上封邮件 ; le mot de '
        'surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2808: ('travail',
        "Sens communicatif vérifié : Envoyez-nous un plan d'action correctif. / 请发一份纠正措施方案 ; le mot de "
        'surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2813: ('travail',
        'Sens communicatif vérifié : Merci de traiter cette réclamation en priorité. / 请优先处理这个投诉 ; le '
        'mot de surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2835: ('conversation',
        "Sens communicatif vérifié : Je te préviendrai dès que j'en saurai plus. / 我一有更多消息就通知你。 ; le "
        'mot de surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 2837: ('travail',
        'Sens communicatif vérifié : Si on signe sur le long terme, le prix baisse encore ? / '
        '如果签长期合同，价格能再降吗？ ; le mot de surface ne suffit pas à faire de cet énoncé un trajet ou un '
        'repas.'),
 2927: ('conversation',
        'Sens communicatif vérifié : Essaie. / 试试看 ; le mot de surface ne suffit pas à faire de cet '
        'énoncé un trajet ou un repas.'),
 3014: ('repas',
        'Sens communicatif vérifié : Pour commencer, on va prendre une salade. / 首先，我们先来一份沙拉。 ; le mot '
        'de surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 3017: ('conversation',
        'Sens communicatif vérifié : Bien reçu. / 收到。 ; le mot de surface ne suffit pas à faire de cet '
        'énoncé un trajet ou un repas.'),
 3415: ('ressentis',
        'Sens communicatif vérifié : Tiens-toi droit. / 站直，挺起背 ; le mot de surface ne suffit pas à '
        'faire de cet énoncé un trajet ou un repas.'),
 3430: ('quotidien',
        "Sens communicatif vérifié : Le chat grimpe à l'arbre. / 猫爬树。 ; le mot de surface ne suffit pas "
        'à faire de cet énoncé un trajet ou un repas.'),
 3478: ('conversation',
        'Sens communicatif vérifié : Vas-y mollo. / 悠着点。 ; le mot de surface ne suffit pas à faire de '
        'cet énoncé un trajet ou un repas.'),
 3509: ('travail',
        'Sens communicatif vérifié : Le prix inclut le transport. / 价格含运费 ; le mot de surface ne suffit '
        'pas à faire de cet énoncé un trajet ou un repas.'),
 3519: ('travail',
        'Sens communicatif vérifié : Le prix est hors taxe. / 价格不含税 ; le mot de surface ne suffit pas à '
        'faire de cet énoncé un trajet ou un repas.'),
 3537: ('travail',
        'Sens communicatif vérifié : Le prix dépend du grammage. / 价格取决于克重。 ; le mot de surface ne '
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 3564: ('comprendre',
        "Sens communicatif vérifié : Le code Wi-Fi, s'il vous plaît. / 要Wi-Fi密码 ; le mot de surface ne "
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 3580: ('travail',
        'Sens communicatif vérifié : Le prix est négociable. / 价格可以谈 ; le mot de surface ne suffit pas '
        'à faire de cet énoncé un trajet ou un repas.'),
 3600: ('travail',
        'Sens communicatif vérifié : La marchandise est arrivée abîmée. / 货到的时候损坏了 ; le mot de surface '
        'ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 4411: ('travail',
        'Sens communicatif vérifié : La marchandise est arrivée au port. / 货已经到港了 ; le mot de surface '
        'ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 4413: ('travail',
        "Sens communicatif vérifié : Le transitaire a réservé l'espace. / 货代已经订舱了 ; le mot de surface "
        'ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 4414: ('travail',
        'Sens communicatif vérifié : À ce prix, on ne peut vraiment pas. / 这个价我们真做不了 ; le mot de '
        'surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 4416: ('travail',
        'Sens communicatif vérifié : Un autre fournisseur propose moins cher. / 别家报价更低 ; le mot de '
        'surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 4420: ('travail',
        'Sens communicatif vérifié : La matière première est-elle arrivée ? / 原料到位了吗？ ; le mot de '
        'surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 4421: ('travail',
        "Sens communicatif vérifié : La ligne est-elle à l'arrêt ? / 生产线停了吗？ ; le mot de surface ne "
        'suffit pas à faire de cet énoncé un trajet ou un repas.'),
 4434: ('conversation',
        "Sens communicatif vérifié : À force d'essayer, tu vas y arriver. / 坚持尝试，你会成功的。 ; le mot de "
        'surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 4447: ('comprendre',
        "Sens communicatif vérifié : Je l'ai pris au pied de la lettre. / 我把他的话完全当真了。 ; le mot de "
        'surface ne suffit pas à faire de cet énoncé un trajet ou un repas.'),
 4464: ('conversation',
        "Sens communicatif vérifié : De toute manière, on n'a plus le choix. / 反正我们也没别的选择了。 ; le mot de "
        'surface ne suffit pas à faire de cet énoncé un trajet ou un repas.')}

REVIEWED_COLOR_BY_INDEX = {3830: ('rouge', '红色'),
 3831: ('bleu', '蓝色'),
 3832: ('vert', '绿色'),
 3833: ('jaune', '黄色'),
 3834: ('noir', '黑色'),
 3835: ('blanc', '白色'),
 3836: ('gris', '灰色'),
 3837: ('marron', '棕色'),
 3838: ('rose', '粉色'),
 3839: ('orange', '橙色'),
 3840: ('beige', '米色'),
 3841: ('bleu foncé', '深蓝色'),
 3842: ('bleu clair', '浅蓝色'),
 3843: ('doré', '金色的'),
 3844: ('argenté', '银色的')}

REVIEWED_LEXICAL_CLASS_BY_INDEX = {264: ('adverb', 'Locution temporelle de sens immédiatement ; unité lexicale entière.'),
 265: ('adverb', 'Locution temporelle de sens immédiatement ; unité lexicale entière.'),
 2951: ('adverb', 'Locution spatiale de direction : tout droit, sans déplacement ajouté.')}

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
        if index in REVIEWED_TYPE_BY_INDEX:
            content_type, reason = REVIEWED_TYPE_BY_INDEX[index]
            review_status = 'reviewed'
        row = {'sourceIndex': index, 'contentType': content_type, 'reason': reason, 'reviewStatus': review_status}
        if index in SOURCE_TEMPLATE_EXCEPTIONS:
            expected, exception_reason = SOURCE_TEMPLATE_EXCEPTIONS[index]
            assert card['t'] == expected, (index, card['t'])
            assert content_type == ('utterance' if index == 2902 else 'vocabulary')
            row.update(sourceTemplateException=True, reviewStatus='reviewed', reason=exception_reason)
        if content_type == 'vocabulary':
            kind, kind_reason, kind_review = lexical_class(card)
            if index in REVIEWED_COLOR_BY_INDEX:
                expected_study, expected_native = REVIEWED_COLOR_BY_INDEX[index]
                assert (card['t'], card['cn']) == (expected_study, expected_native)
                kind, kind_reason, kind_review = 'color', 'Couleur isolée confirmée par le sens chinois ' + card['cn'] + ' ; aucune fleur, fruit ou monnaie homonyme.', 'reviewed'
            if index in REVIEWED_LEXICAL_CLASS_BY_INDEX:
                kind, kind_reason = REVIEWED_LEXICAL_CLASS_BY_INDEX[index]
                kind_review = 'reviewed'
            row.update(lexicalClass=kind, lexicalClassReason=kind_reason, lexicalClassReviewStatus=kind_review)
        if index in REVIEWED_FAMILY_BY_INDEX:
            assert content_type == 'vocabulary'
            destination, placement_reason = REVIEWED_FAMILY_BY_INDEX[index]
            row.update(lexicalFamilyOverride=destination, reviewStatus='reviewed', reason=placement_reason)
        if index in REVIEWED_SITUATION_BY_INDEX:
            assert content_type == 'utterance'
            destination, placement_reason = REVIEWED_SITUATION_BY_INDEX[index]
            row.update(situationDomainOverride=destination, reviewStatus='reviewed', reason=placement_reason)
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
    for name in ['adjective', 'color', 'preposition', 'adverb', 'other', 'uncertain']:
        lines.append(f'| `{name}` | {lexical[name]} |')
    lines += [
        '', 'Les quinze couleurs isolées #3830–#3844 ont désormais lexicalClass=color, avec leur sens chinois vérifié. rose=粉色, orange=橙色 et argenté=银色 ne sont confondus ni avec une fleur, ni avec une orange-fruit, ni avec l’argent-monnaie. Les accords existants restent intacts. Les décisions de typage et routage ciblées sont documentées séparément dans corrections-themes/zh-fr.json et .md.',
        '', 'Une carte n’est pas dupliquée entre les rubriques. Le classement porte sur l’unité entière : `un petit ami` reste un groupe nominal, `C’est cher.` reste une phrase, `cher` est un adjectif. `sur` ou `à côté de` sont des unités prépositives délimitées ; `Je vais à...` et les modèles à trou restent ouverts. `avant` et `après`, sans contexte tranchant leur emploi, sont explicitement incertains.',
        '', 'Un marqueur comme `cat: vocab` ne suffit pas : les sources contiennent des phrases complètes sous cette étiquette. Inversement, des mots isolés sont étiquetés `core`. Les catégories existantes ne sont utilisées qu’après examen de la forme comme indice de secours. Aucun énoncé n’est découpé, recomposé ou complété.',
        '', 'Les cartes regroupant deux interlocuteurs restent en réserve (`review`) : ni la carte entière ni l’un de ses morceaux n’est imposé comme tour de l’apprenant. Les groupes d’unité de mesure ne sont pas confondus avec un nombre seul (`un kilo` reste lexical ; `un million` est numérique).',
        '', '## Exemples vérifiés', '', '| Indice | Source exacte | Affectation | Sous-classe |', '|---:|---|---|---|',
    ]
    examples = [1, 2, 272, 3120, 3357, 3509, 2918, 3051, 3202, 3338, 3664, 3076, 3297, 3676, 3688, 3697, 3712, 2990, 2854, 3388, 3804, 3826, 3171, 3360, 3497, 4470, 137, 2903, 2997, 2228]
    for index in examples:
        row = assignments[index]
        text = deck[index]['t'].replace('|', r'\|')
        lines.append(f"| {index} | {text} | `{row['contentType']}` | `{row.get('lexicalClass', '')}` |")
    lines += ['', '## Deux corrections de typage observées pendant la recherche', '',
              '| Indice | Source exacte | Niveau source inchangé | Avant | Après |', '|---:|---|---:|---|---|',
              "| 3357 | Le produit ne s'allume pas. | 7 | vocabulary/other | utterance/reviewed |",
              '| 3509 | Le prix inclut le transport. | 9 | vocabulary/other | utterance/reviewed |', '',
              'Ces deux phrases déclaratives avaient été sous-détectées par les règles lexicales. Deux décisions explicites corrigent le type ; aucune extension globale de règle, aucun niveau et aucun champ de source ou de phonétique ne changent.']
    lines += ['', '## Huit exceptions explicites à l’étiquette template', '',
              'Les sources et leurs ellipses restent identiques. 2902 est une formule de prise de tour ; les sept autres sont du vocabulaire adverbial entier. Chaque affectation porte `sourceTemplateException: true`, `reviewStatus: reviewed` et une raison spécifique ; aucun emplacement n’est rempli.', '',
              '| Indice | Source exacte | Traitement |', '|---:|---|---|']
    for index, (text, reason) in SOURCE_TEMPLATE_EXCEPTIONS.items():
        lines.append(f"| {index} | {text} | {reason} |")
    lines += ['', '## Répartition par niveau source', '', '| Niveau source | Énoncés | Vocabulaire | Nombres | Ouverts | Réserve |', '|---|---:|---:|---:|---:|---:|']
    for level in range(1, 11):
        local = Counter(row['contentType'] for row in assignments if deck[row['sourceIndex']]['lv'] == level)
        lines.append('| L' + str(level) + ' | ' + ' | '.join(str(local[k]) for k in ['utterance', 'vocabulary', 'number', 'incomplete', 'review']) + ' |')
    lines += ['', '## Sous-classes lexicales par niveau source', '', '| Niveau source | Adjectifs | Couleurs | Prépositions | Adverbes | Autres | Incertains |', '|---|---:|---:|---:|---:|---:|---:|']
    for level in range(1, 11):
        local = Counter(row['lexicalClass'] for row in assignments if row['contentType'] == 'vocabulary' and deck[row['sourceIndex']]['lv'] == level)
        lines.append('| L' + str(level) + ' | ' + ' | '.join(str(local[k]) for k in ['adjective', 'color', 'preposition', 'adverb', 'other', 'uncertain']) + ' |')
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

window.ProgressionPilotData = {
  "status": "proposition-locale-a-relire",
  "sourceCommit": "db01b1c8eb99db237a56663253f31ee41c40ca67",
  "editorialAmendments": {
    "status": "propositions-locales-sans-modification-des-sources",
    "count": 3,
    "sourceFilesChanged": false,
    "changes": [
      {
        "id": "zh-xiu-diphtongue",
        "utteranceId": "zh-deck-226",
        "field": "phon",
        "expectedSource": "ouo chyang chyo chi",
        "proposed": "ouo chyang chyoou chi",
        "reason": "Proposition relue par Claude pour mieux conserver la finale de xiū ; écouter et relire avec un locuteur. La carte du catalogue reste inchangée."
      },
      {
        "id": "ko-coffee-polite-request",
        "utteranceId": "L1-fr-ko-03-v0",
        "field": "native",
        "expectedSource": "Je veux un café.",
        "proposed": "Un café, s’il vous plaît.",
        "reason": "Rendre la fonction de demande polie de 주세요 dans l'essai ; correction de la source L1-03 et de ses générateurs en attente de décision."
      },
      {
        "id": "ko-water-polite-request",
        "utteranceId": "L1-fr-ko-03-v1",
        "field": "native",
        "expectedSource": "Je veux de l'eau.",
        "proposed": "De l’eau, s’il vous plaît.",
        "reason": "Rendre la fonction de demande polie de 주세요 dans l'essai ; aucun fichier conversation modifié."
      }
    ]
  },
  "pilots": [
    {
      "id": "fr-zh-envie",
      "pair": {
        "native": "fr",
        "study": "zh"
      },
      "title": "Dire ce que tu veux faire",
      "levelLabel": "Essai de progression · niveau à positionner",
      "goal": "Après la promenade, choisir entre se reposer et rentrer, puis dire son choix à un proche.",
      "steps": [
        {
          "id": "zh-understand",
          "stage": "understand",
          "phase": "Comprendre",
          "title": "Tu veux te reposer",
          "instruction": "Après une promenade, tu souhaites faire une pause. Écoute la phrase et retrouve son sens.",
          "novelty": "Ici, 我想 sert à dire ce que tu veux faire. Les autres usages du vouloir ne sont pas ajoutés à cette première écoute. Phonétique chyoou proposée localement, sans modifier le catalogue.",
          "utterances": [
            {
              "id": "zh-deck-226",
              "study": "我想休息",
              "phon": "ouo chyang chyoou chi",
              "native": "je veux me reposer",
              "reading": "wǒ xiǎng xiū xi",
              "role": "Toi",
              "kind": "learner",
              "editorialNote": "Phonétique proposée pour cet essai"
            }
          ]
        },
        {
          "id": "zh-imitate",
          "stage": "imitate",
          "phase": "Imiter",
          "title": "Redis la même envie",
          "instruction": "Écoute, puis répète si tu le souhaites. Garde la phonétique à portée de main.",
          "novelty": "Même phrase complète, sans nouveauté.",
          "utterances": [
            {
              "id": "zh-deck-226",
              "study": "我想休息",
              "phon": "ouo chyang chyoou chi",
              "native": "je veux me reposer",
              "reading": "wǒ xiǎng xiū xi",
              "role": "Toi",
              "kind": "learner",
              "editorialNote": "Phonétique proposée pour cet essai"
            }
          ]
        },
        {
          "id": "zh-prepare-home",
          "stage": "prepareReplacement",
          "phase": "Préparer la suite",
          "title": "Tu veux rentrer à la maison",
          "instruction": "Écoute la phrase entière. Repère ensuite le morceau qui veut dire « rentrer à la maison ».",
          "novelty": "回家 est préparé dans une phrase complète avant substitution. La carte autonome sert d’appui, pas de leçon de mot isolé.",
          "utterances": [
            {
              "id": "zh-deck-416",
              "study": "我想回家",
              "phon": "ouo chyang houèï djya",
              "native": "je veux rentrer à la maison",
              "reading": "wǒ xiǎng huí jiā",
              "role": "Toi",
              "kind": "learner"
            }
          ],
          "focusBrick": {
            "id": "zh-deck-2988",
            "study": "回家",
            "phon": "houèï djya",
            "native": "rentrer à la maison",
            "reading": "huí jiā",
            "role": "Le morceau à réutiliser",
            "kind": "brick"
          }
        },
        {
          "id": "zh-substitute",
          "stage": "replace",
          "phase": "Remplacer",
          "title": "Une autre action, le même début",
          "instruction": "Compare les deux phrases. Le début reste identique ; l’action change.",
          "novelty": "休息 et 回家 sont deux groupes d’action préparés. Pas de nouveau temps ni de nouvelle personne.",
          "utterances": [
            {
              "id": "zh-deck-226",
              "study": "我想休息",
              "phon": "ouo chyang chyoou chi",
              "native": "je veux me reposer",
              "reading": "wǒ xiǎng xiū xi",
              "role": "Toi",
              "kind": "learner",
              "editorialNote": "Phonétique proposée pour cet essai"
            },
            {
              "id": "zh-deck-416",
              "study": "我想回家",
              "phon": "ouo chyang houèï djya",
              "native": "je veux rentrer à la maison",
              "reading": "wǒ xiǎng huí jiā",
              "role": "Toi",
              "kind": "learner"
            }
          ]
        },
        {
          "id": "zh-received-question",
          "stage": "receive",
          "phase": "Comprendre l’autre",
          "title": "Ton proche te laisse choisir",
          "instruction": "Tu hésites entre te reposer et rentrer. Écoute la question de ton proche : il te demande si tu as décidé.",
          "novelty": "你想好了吗？ est reçu entier dans cette situation ; pas de production ou d’analyse de 想好, 了 ou 吗 demandée.",
          "utterances": [
            {
              "id": "zh-deck-511",
              "study": "你想好了吗？",
              "phon": "ni chyang hao le ma?",
              "native": "Tu as décidé ?",
              "reading": "nǐ xiǎng hǎo le ma?",
              "role": "Un proche",
              "kind": "received",
              "analyse": false,
              "countsAsProduction": false,
              "replyRequired": true,
              "answerWith": [
                {
                  "utteranceId": "zh-deck-226",
                  "expectedStudy": "我想休息",
                  "preparedInStep": "zh-understand"
                },
                {
                  "utteranceId": "zh-deck-416",
                  "expectedStudy": "我想回家",
                  "preparedInStep": "zh-prepare-home"
                }
              ],
              "introducedInStep": "zh-received-question"
            }
          ]
        },
        {
          "id": "zh-received",
          "stage": "receive",
          "phase": "Comprendre l’autre",
          "title": "Ton proche accepte ton choix",
          "instruction": "Écoute sa réponse possible. Tu n’as pas de nouvelle phrase à construire.",
          "novelty": "好的 est une clôture possible de cette scène, pas une réaction garantie de tout interlocuteur.",
          "utterances": [
            {
              "id": "zh-deck-2173",
              "study": "好的",
              "phon": "hao deu",
              "native": "d'accord",
              "reading": "hǎo de",
              "role": "Un proche",
              "kind": "received",
              "analyse": false,
              "countsAsProduction": false,
              "replyRequired": false,
              "answerWith": [],
              "introducedInStep": "zh-received"
            }
          ]
        },
        {
          "id": "zh-visible",
          "stage": "scene",
          "phase": "Échanger",
          "title": "Écoute l’échange complet",
          "instruction": "Ton proche pose sa question, tu dis ton choix, puis il te répond.",
          "novelty": "Le cycle vient après le remplacement : question reçue, réponse préparée, clôture reçue.",
          "utterances": [
            {
              "id": "zh-deck-511",
              "study": "你想好了吗？",
              "phon": "ni chyang hao le ma?",
              "native": "Tu as décidé ?",
              "reading": "nǐ xiǎng hǎo le ma?",
              "role": "Un proche",
              "kind": "received",
              "analyse": false,
              "countsAsProduction": false,
              "replyRequired": true,
              "answerWith": [
                {
                  "utteranceId": "zh-deck-226",
                  "expectedStudy": "我想休息",
                  "preparedInStep": "zh-understand"
                },
                {
                  "utteranceId": "zh-deck-416",
                  "expectedStudy": "我想回家",
                  "preparedInStep": "zh-prepare-home"
                }
              ],
              "introducedInStep": "zh-received-question"
            },
            {
              "id": "zh-deck-416",
              "study": "我想回家",
              "phon": "ouo chyang houèï djya",
              "native": "je veux rentrer à la maison",
              "reading": "wǒ xiǎng huí jiā",
              "role": "Toi",
              "kind": "learner"
            },
            {
              "id": "zh-deck-2173",
              "study": "好的",
              "phon": "hao deu",
              "native": "d'accord",
              "reading": "hǎo de",
              "role": "Un proche",
              "kind": "received",
              "analyse": false,
              "countsAsProduction": false,
              "replyRequired": false,
              "answerWith": [],
              "introducedInStep": "zh-received"
            }
          ],
          "scene": true
        },
        {
          "id": "zh-choice",
          "stage": "recall",
          "phase": "Choisir et réutiliser",
          "title": "À toi de choisir ton envie",
          "instruction": "Choisis ton intention. Tu peux garder le modèle ou essayer sans lui, puis retrouver l’aide.",
          "novelty": "Choix entre deux réponses préparées ; même question et même clôture.",
          "utterances": [
            {
              "id": "zh-deck-511",
              "study": "你想好了吗？",
              "phon": "ni chyang hao le ma?",
              "native": "Tu as décidé ?",
              "reading": "nǐ xiǎng hǎo le ma?",
              "role": "Un proche",
              "kind": "received",
              "analyse": false,
              "countsAsProduction": false,
              "replyRequired": true,
              "answerWith": [
                {
                  "utteranceId": "zh-deck-226",
                  "expectedStudy": "我想休息",
                  "preparedInStep": "zh-understand"
                },
                {
                  "utteranceId": "zh-deck-416",
                  "expectedStudy": "我想回家",
                  "preparedInStep": "zh-prepare-home"
                }
              ],
              "introducedInStep": "zh-received-question"
            },
            {
              "id": "zh-deck-416",
              "study": "我想回家",
              "phon": "ouo chyang houèï djya",
              "native": "je veux rentrer à la maison",
              "reading": "wǒ xiǎng huí jiā",
              "role": "Toi",
              "kind": "learner"
            },
            {
              "id": "zh-deck-2173",
              "study": "好的",
              "phon": "hao deu",
              "native": "d'accord",
              "reading": "hǎo de",
              "role": "Un proche",
              "kind": "received",
              "analyse": false,
              "countsAsProduction": false,
              "replyRequired": false,
              "answerWith": [],
              "introducedInStep": "zh-received"
            }
          ],
          "scene": true,
          "recall": true,
          "choices": [
            {
              "id": "home",
              "label": "Rentrer à la maison",
              "utterance": {
                "id": "zh-deck-416",
                "study": "我想回家",
                "phon": "ouo chyang houèï djya",
                "native": "je veux rentrer à la maison",
                "reading": "wǒ xiǎng huí jiā",
                "role": "Toi",
                "kind": "learner"
              }
            },
            {
              "id": "rest",
              "label": "Me reposer",
              "utterance": {
                "id": "zh-deck-226",
                "study": "我想休息",
                "phon": "ouo chyang chyoou chi",
                "native": "je veux me reposer",
                "reading": "wǒ xiǎng xiū xi",
                "role": "Toi",
                "kind": "learner",
                "editorialNote": "Phonétique proposée pour cet essai"
              }
            }
          ]
        }
      ]
    },
    {
      "id": "fr-ko-demande",
      "pair": {
        "native": "fr",
        "study": "ko"
      },
      "title": "Commander une boisson",
      "levelLabel": "Essai de progression · niveau à positionner",
      "goal": "Demander du café ou de l’eau, comprendre le serveur et sa confirmation.",
      "steps": [
        {
          "id": "ko-understand",
          "stage": "understand",
          "phase": "Comprendre",
          "title": "Tu demandes un café",
          "instruction": "Au café, tu souhaites commander. Écoute la demande complète et retrouve son sens.",
          "novelty": "Demande polie sans quantité ni ajout. Traduction française proposée dans cet essai ; L1-03 source reste inchangé.",
          "utterances": [
            {
              "id": "L1-fr-ko-03-v0",
              "study": "커피 주세요.",
              "phon": "keo-pi djou-sé-yo",
              "native": "Un café, s’il vous plaît.",
              "reading": "keopi juseyo.",
              "role": "Client",
              "kind": "learner",
              "editorialNote": "Traduction proposée pour cet essai"
            }
          ]
        },
        {
          "id": "ko-imitate",
          "stage": "imitate",
          "phase": "Imiter",
          "title": "Redis la même demande",
          "instruction": "Écoute, puis répète si tu le souhaites.",
          "novelty": "Même phrase complète, sans nouveauté.",
          "utterances": [
            {
              "id": "L1-fr-ko-03-v0",
              "study": "커피 주세요.",
              "phon": "keo-pi djou-sé-yo",
              "native": "Un café, s’il vous plaît.",
              "reading": "keopi juseyo.",
              "role": "Client",
              "kind": "learner",
              "editorialNote": "Traduction proposée pour cet essai"
            }
          ]
        },
        {
          "id": "ko-prepare-water",
          "stage": "prepareReplacement",
          "phase": "Préparer la suite",
          "title": "Tu préfères de l’eau",
          "instruction": "Écoute la phrase entière. Repère ensuite le morceau qui désigne l’eau.",
          "novelty": "Le groupe vient de slot[1] de l’unité 03 et reste secondaire à la phrase complète.",
          "utterances": [
            {
              "id": "L1-fr-ko-03-v1",
              "study": "물 주세요.",
              "phon": "moul djou-sé-yo",
              "native": "De l’eau, s’il vous plaît.",
              "reading": "mul juseyo.",
              "role": "Client",
              "kind": "learner",
              "editorialNote": "Traduction proposée pour cet essai"
            }
          ],
          "focusBrick": {
            "id": "L1-fr-ko-03-v1-slot",
            "study": "물",
            "phon": "moul",
            "native": "de l'eau",
            "reading": "mul",
            "role": "La boisson à réutiliser",
            "kind": "brick"
          }
        },
        {
          "id": "ko-substitute",
          "stage": "replace",
          "phase": "Remplacer",
          "title": "Une autre boisson, la même demande",
          "instruction": "Compare les deux demandes. Seule la boisson change.",
          "novelty": "물 remplace 커피 ; 주세요 reste identique. La politesse n’est pas une construction réservée à L2.",
          "utterances": [
            {
              "id": "L1-fr-ko-03-v0",
              "study": "커피 주세요.",
              "phon": "keo-pi djou-sé-yo",
              "native": "Un café, s’il vous plaît.",
              "reading": "keopi juseyo.",
              "role": "Client",
              "kind": "learner",
              "editorialNote": "Traduction proposée pour cet essai"
            },
            {
              "id": "L1-fr-ko-03-v1",
              "study": "물 주세요.",
              "phon": "moul djou-sé-yo",
              "native": "De l’eau, s’il vous plaît.",
              "reading": "mul juseyo.",
              "role": "Client",
              "kind": "learner",
              "editorialNote": "Traduction proposée pour cet essai"
            }
          ]
        },
        {
          "id": "ko-received",
          "stage": "receive",
          "phase": "Comprendre l’autre",
          "title": "Le serveur te demande ton choix",
          "instruction": "Le serveur te salue et te demande ce que tu désires. Écoute sa réplique entière.",
          "novelty": "Un seul interlocuteur. Le tour source entier est appris globalement ; aucune salutation isolée n’est ajoutée ni aucun extrait fabriqué.",
          "utterances": [
            {
              "id": "L1-fr-ko-d1-t1",
              "study": "안녕하세요. 뭐 드릴까요?",
              "phon": "an-nyeong-ha-sé-yo. mwo deu-ril-kka-yo",
              "native": "Bonjour. Vous désirez ?",
              "reading": "annyeonghaseyo. mwo deurilkkayo?",
              "role": "Serveur",
              "kind": "received",
              "analyse": false,
              "countsAsProduction": false,
              "replyRequired": true,
              "answerWith": [
                {
                  "utteranceId": "L1-fr-ko-03-v0",
                  "expectedStudy": "커피 주세요.",
                  "preparedInStep": "ko-understand"
                },
                {
                  "utteranceId": "L1-fr-ko-03-v1",
                  "expectedStudy": "물 주세요.",
                  "preparedInStep": "ko-prepare-water"
                }
              ],
              "introducedInStep": "ko-received"
            }
          ]
        },
        {
          "id": "ko-received-closing",
          "stage": "receive",
          "phase": "Comprendre l’autre",
          "title": "Le serveur confirme",
          "instruction": "Écoute sa confirmation possible après ta demande.",
          "novelty": "네. est reçu ici comme accusé de réception de la commande. Son emploi comme réponse produite sera un autre passage.",
          "utterances": [
            {
              "id": "ko-deck-1",
              "study": "네.",
              "phon": "né",
              "native": "Oui.",
              "reading": "ne",
              "role": "Serveur",
              "kind": "received",
              "analyse": false,
              "countsAsProduction": false,
              "replyRequired": false,
              "answerWith": [],
              "introducedInStep": "ko-received-closing"
            }
          ]
        },
        {
          "id": "ko-visible",
          "stage": "scene",
          "phase": "Échanger",
          "title": "Écoute l’échange complet",
          "instruction": "Le serveur te demande ton choix, le client commande, puis le serveur confirme.",
          "novelty": "Question, réponse préparée et clôture, sans lait, prix ou quantité nouvelle.",
          "utterances": [
            {
              "id": "L1-fr-ko-d1-t1",
              "study": "안녕하세요. 뭐 드릴까요?",
              "phon": "an-nyeong-ha-sé-yo. mwo deu-ril-kka-yo",
              "native": "Bonjour. Vous désirez ?",
              "reading": "annyeonghaseyo. mwo deurilkkayo?",
              "role": "Serveur",
              "kind": "received",
              "analyse": false,
              "countsAsProduction": false,
              "replyRequired": true,
              "answerWith": [
                {
                  "utteranceId": "L1-fr-ko-03-v0",
                  "expectedStudy": "커피 주세요.",
                  "preparedInStep": "ko-understand"
                },
                {
                  "utteranceId": "L1-fr-ko-03-v1",
                  "expectedStudy": "물 주세요.",
                  "preparedInStep": "ko-prepare-water"
                }
              ],
              "introducedInStep": "ko-received"
            },
            {
              "id": "L1-fr-ko-03-v0",
              "study": "커피 주세요.",
              "phon": "keo-pi djou-sé-yo",
              "native": "Un café, s’il vous plaît.",
              "reading": "keopi juseyo.",
              "role": "Client",
              "kind": "learner",
              "editorialNote": "Traduction proposée pour cet essai"
            },
            {
              "id": "ko-deck-1",
              "study": "네.",
              "phon": "né",
              "native": "Oui.",
              "reading": "ne",
              "role": "Serveur",
              "kind": "received",
              "analyse": false,
              "countsAsProduction": false,
              "replyRequired": false,
              "answerWith": [],
              "introducedInStep": "ko-received-closing"
            }
          ],
          "scene": true
        },
        {
          "id": "ko-choice",
          "stage": "recall",
          "phase": "Choisir et réutiliser",
          "title": "Commande selon ton envie",
          "instruction": "Choisis la boisson. Essaie avec le modèle ou sans lui ; tu peux toujours retrouver l’aide.",
          "novelty": "Le modèle peut être masqué volontairement, les deux répliques reçues restent visibles.",
          "utterances": [
            {
              "id": "L1-fr-ko-d1-t1",
              "study": "안녕하세요. 뭐 드릴까요?",
              "phon": "an-nyeong-ha-sé-yo. mwo deu-ril-kka-yo",
              "native": "Bonjour. Vous désirez ?",
              "reading": "annyeonghaseyo. mwo deurilkkayo?",
              "role": "Serveur",
              "kind": "received",
              "analyse": false,
              "countsAsProduction": false,
              "replyRequired": true,
              "answerWith": [
                {
                  "utteranceId": "L1-fr-ko-03-v0",
                  "expectedStudy": "커피 주세요.",
                  "preparedInStep": "ko-understand"
                },
                {
                  "utteranceId": "L1-fr-ko-03-v1",
                  "expectedStudy": "물 주세요.",
                  "preparedInStep": "ko-prepare-water"
                }
              ],
              "introducedInStep": "ko-received"
            },
            {
              "id": "L1-fr-ko-03-v0",
              "study": "커피 주세요.",
              "phon": "keo-pi djou-sé-yo",
              "native": "Un café, s’il vous plaît.",
              "reading": "keopi juseyo.",
              "role": "Client",
              "kind": "learner",
              "editorialNote": "Traduction proposée pour cet essai"
            },
            {
              "id": "ko-deck-1",
              "study": "네.",
              "phon": "né",
              "native": "Oui.",
              "reading": "ne",
              "role": "Serveur",
              "kind": "received",
              "analyse": false,
              "countsAsProduction": false,
              "replyRequired": false,
              "answerWith": [],
              "introducedInStep": "ko-received-closing"
            }
          ],
          "scene": true,
          "recall": true,
          "choices": [
            {
              "id": "coffee",
              "label": "Un café",
              "utterance": {
                "id": "L1-fr-ko-03-v0",
                "study": "커피 주세요.",
                "phon": "keo-pi djou-sé-yo",
                "native": "Un café, s’il vous plaît.",
                "reading": "keopi juseyo.",
                "role": "Client",
                "kind": "learner",
                "editorialNote": "Traduction proposée pour cet essai"
              }
            },
            {
              "id": "water",
              "label": "De l’eau",
              "utterance": {
                "id": "L1-fr-ko-03-v1",
                "study": "물 주세요.",
                "phon": "moul djou-sé-yo",
                "native": "De l’eau, s’il vous plaît.",
                "reading": "mul juseyo.",
                "role": "Client",
                "kind": "learner",
                "editorialNote": "Traduction proposée pour cet essai"
              }
            }
          ]
        }
      ]
    }
  ]
};

window.ProgressionPilotData = {
  "status": "proposition-locale-a-relire",
  "sourceCommit": "f30eb821a21e7df67a0646e0c61674f7fba16c79",
  "pilots": [
    {
      "id": "fr-zh-envie",
      "pair": {
        "native": "fr",
        "study": "zh"
      },
      "title": "Dire ce que tu veux faire",
      "levelLabel": "Classement L2 provisoire",
      "goal": "Exprimer une envie, changer l’action, comprendre une réponse d’accord.",
      "steps": [
        {
          "id": "zh-understand",
          "phase": "Comprendre",
          "title": "Tu veux te reposer",
          "instruction": "Après une promenade, tu souhaites faire une pause. Écoute la phrase et retrouve son sens.",
          "novelty": "Première phrase entière : ne suppose aucun acquis en 需要.",
          "utterances": [
            {
              "id": "zh-deck-226",
              "study": "我想休息",
              "phon": "ouo chyang chyo chi",
              "native": "je veux me reposer",
              "reading": "wǒ xiǎng xiū xi",
              "role": "Toi",
              "kind": "learner"
            }
          ]
        },
        {
          "id": "zh-imitate",
          "phase": "Imiter",
          "title": "Redis la même envie",
          "instruction": "Écoute, puis répète si tu le souhaites. Garde la phonétique à portée de main.",
          "novelty": "Aucune phrase nouvelle.",
          "utterances": [
            {
              "id": "zh-deck-226",
              "study": "我想休息",
              "phon": "ouo chyang chyo chi",
              "native": "je veux me reposer",
              "reading": "wǒ xiǎng xiū xi",
              "role": "Toi",
              "kind": "learner"
            }
          ]
        },
        {
          "id": "zh-received",
          "phase": "Comprendre l’autre",
          "title": "Ton proche est d’accord",
          "instruction": "Écoute ce qu’il te répond. Tu n’as pas de nouvelle demande à construire.",
          "novelty": "Une réponse reçue en contexte : d’accord.",
          "utterances": [
            {
              "id": "zh-deck-2173",
              "study": "好的",
              "phon": "hao deu",
              "native": "d'accord",
              "reading": "hǎo de",
              "role": "Un proche",
              "kind": "received"
            }
          ]
        },
        {
          "id": "zh-visible",
          "phase": "Échanger",
          "title": "Ton premier échange visible",
          "instruction": "Écoute les deux rôles dans l’ordre.",
          "novelty": "Réemploi des deux phrases déjà présentées.",
          "utterances": [
            {
              "id": "zh-deck-226",
              "study": "我想休息",
              "phon": "ouo chyang chyo chi",
              "native": "je veux me reposer",
              "reading": "wǒ xiǎng xiū xi",
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
              "kind": "received"
            }
          ],
          "scene": true
        },
        {
          "id": "zh-substitute",
          "phase": "Remplacer",
          "title": "Cette fois, tu veux rentrer",
          "instruction": "Écoute la nouvelle phrase entière. Le début reste identique ; l’action change.",
          "novelty": "Le groupe 回家 remplace 休息 ; ne change ni le temps ni la personne.",
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
          ]
        },
        {
          "id": "zh-choice",
          "phase": "Choisir et réutiliser",
          "title": "À toi de choisir ton envie",
          "instruction": "Choisis ton intention. Tu peux garder le modèle ou essayer sans lui, puis retrouver l’aide.",
          "novelty": "Choix personnel entre deux groupes préparés ; pas de nouvelle structure.",
          "utterances": [
            {
              "id": "zh-deck-226",
              "study": "我想休息",
              "phon": "ouo chyang chyo chi",
              "native": "je veux me reposer",
              "reading": "wǒ xiǎng xiū xi",
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
              "kind": "received"
            }
          ],
          "scene": true,
          "recall": true,
          "choices": [
            {
              "id": "rest",
              "label": "Me reposer",
              "utterance": {
                "id": "zh-deck-226",
                "study": "我想休息",
                "phon": "ouo chyang chyo chi",
                "native": "je veux me reposer",
                "reading": "wǒ xiǎng xiū xi",
                "role": "Toi",
                "kind": "learner"
              }
            },
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
      "levelLabel": "Essai du chemin L1",
      "goal": "Demander une boisson, en changer, comprendre ce que demande le serveur.",
      "steps": [
        {
          "id": "ko-understand",
          "phase": "Comprendre",
          "title": "Tu demandes un café",
          "instruction": "Au café, tu souhaites commander. Écoute la demande complète et retrouve son sens.",
          "novelty": "Première demande complète, sans quantité ni ajout.",
          "utterances": [
            {
              "id": "L1-fr-ko-03-v0",
              "study": "커피 주세요.",
              "phon": "keo-pi djou-sé-yo",
              "native": "Je veux un café.",
              "reading": "keopi juseyo.",
              "role": "Client",
              "kind": "learner"
            }
          ]
        },
        {
          "id": "ko-imitate",
          "phase": "Imiter",
          "title": "Redis la même demande",
          "instruction": "Écoute, puis répète si tu le souhaites.",
          "novelty": "Aucune phrase nouvelle.",
          "utterances": [
            {
              "id": "L1-fr-ko-03-v0",
              "study": "커피 주세요.",
              "phon": "keo-pi djou-sé-yo",
              "native": "Je veux un café.",
              "reading": "keopi juseyo.",
              "role": "Client",
              "kind": "learner"
            }
          ]
        },
        {
          "id": "ko-substitute",
          "phase": "Remplacer",
          "title": "Tu préfères de l’eau",
          "instruction": "Écoute la phrase entière. Seule la boisson change.",
          "novelty": "물 remplace 커피 ; 주세요 reste identique.",
          "utterances": [
            {
              "id": "L1-fr-ko-03-v1",
              "study": "물 주세요.",
              "phon": "moul djou-sé-yo",
              "native": "Je veux de l'eau.",
              "reading": "mul juseyo.",
              "role": "Client",
              "kind": "learner"
            }
          ]
        },
        {
          "id": "ko-greeting",
          "phase": "Comprendre l’autre",
          "title": "On te salue",
          "instruction": "Écoute la salutation avant de découvrir la question du serveur.",
          "novelty": "Une salutation reçue ; sa présence ailleurs ne prouve pas qu’elle est connue.",
          "utterances": [
            {
              "id": "L1-fr-ko-d1-t0",
              "study": "안녕하세요!",
              "phon": "an-nyeong-ha-sé-yo",
              "native": "Bonjour !",
              "reading": "annyeonghaseyo!",
              "role": "Une personne au café",
              "kind": "support"
            }
          ]
        },
        {
          "id": "ko-received",
          "phase": "Comprendre l’autre",
          "title": "Le serveur te demande ton choix",
          "instruction": "Écoute et comprends cette question en situation. Tu n’as pas à la construire toi-même.",
          "novelty": "Question reçue comme bloc de compréhension ; la salutation vient d’être présentée.",
          "utterances": [
            {
              "id": "L1-fr-ko-d1-t1",
              "study": "안녕하세요. 뭐 드릴까요?",
              "phon": "an-nyeong-ha-sé-yo. mwo deu-ril-kka-yo",
              "native": "Bonjour. Vous désirez ?",
              "reading": "annyeonghaseyo. mwo deurilkkayo?",
              "role": "Serveur",
              "kind": "received"
            }
          ]
        },
        {
          "id": "ko-visible",
          "phase": "Échanger",
          "title": "Une demande avec sa réponse",
          "instruction": "Écoute le serveur, puis la réponse du client. Les deux sont visibles au premier passage.",
          "novelty": "Les deux répliques ont été préparées séparément.",
          "utterances": [
            {
              "id": "L1-fr-ko-d1-t1",
              "study": "안녕하세요. 뭐 드릴까요?",
              "phon": "an-nyeong-ha-sé-yo. mwo deu-ril-kka-yo",
              "native": "Bonjour. Vous désirez ?",
              "reading": "annyeonghaseyo. mwo deurilkkayo?",
              "role": "Serveur",
              "kind": "received"
            },
            {
              "id": "L1-fr-ko-03-v0",
              "study": "커피 주세요.",
              "phon": "keo-pi djou-sé-yo",
              "native": "Je veux un café.",
              "reading": "keopi juseyo.",
              "role": "Client",
              "kind": "learner"
            }
          ],
          "scene": true
        },
        {
          "id": "ko-choice",
          "phase": "Choisir et réutiliser",
          "title": "Commande selon ton envie",
          "instruction": "Choisis la boisson. Essaie avec le modèle ou sans lui ; tu peux toujours retrouver l’aide.",
          "novelty": "Choix entre deux demandes préparées. Aucun lait, prix ou compteur nouveau.",
          "utterances": [
            {
              "id": "L1-fr-ko-d1-t1",
              "study": "안녕하세요. 뭐 드릴까요?",
              "phon": "an-nyeong-ha-sé-yo. mwo deu-ril-kka-yo",
              "native": "Bonjour. Vous désirez ?",
              "reading": "annyeonghaseyo. mwo deurilkkayo?",
              "role": "Serveur",
              "kind": "received"
            },
            {
              "id": "L1-fr-ko-03-v0",
              "study": "커피 주세요.",
              "phon": "keo-pi djou-sé-yo",
              "native": "Je veux un café.",
              "reading": "keopi juseyo.",
              "role": "Client",
              "kind": "learner"
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
                "native": "Je veux un café.",
                "reading": "keopi juseyo.",
                "role": "Client",
                "kind": "learner"
              }
            },
            {
              "id": "water",
              "label": "De l’eau",
              "utterance": {
                "id": "L1-fr-ko-03-v1",
                "study": "물 주세요.",
                "phon": "moul djou-sé-yo",
                "native": "Je veux de l'eau.",
                "reading": "mul juseyo.",
                "role": "Client",
                "kind": "learner"
              }
            }
          ]
        }
      ]
    }
  ]
};

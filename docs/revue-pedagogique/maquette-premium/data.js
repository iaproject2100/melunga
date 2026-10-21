/* Données de maquette isolée : phrases et phonétiques sources intégrales. */
window.PREMIUM_DEMO = {
  "pairs": [
    {
      "id": "fr-es",
      "label": "🇪🇸 Espagnol",
      "readerLabel": "Francophone",
      "studyCode": "es",
      "nativeCode": "fr",
      "sourceL1": {
        "file": "melunga_deploy/content/conversation/L1-fr-es.json",
        "dialogueId": "L1-fr-es-d1",
        "turnIndexes": [
          2
        ]
      },
      "sourceL2": {
        "file": "melunga_deploy/content/conversation/L2-fr-es.json",
        "dialogueId": "L2-fr-es-d1",
        "turnIndexes": [
          0,
          1,
          2
        ],
        "previewPlayedTurnIndexes": [
          1,
          2
        ],
        "contextTurnIndex": 0
      },
      "l1": {
        "speaker": "A",
        "study": "Un café, por favor.",
        "phon": "oun ka-FÉ, por fa-BOR",
        "native": "Un café, s'il vous plaît.",
        "turnIndex": 2,
        "role": "Client",
        "roleInterface": "Client"
      },
      "preview": [
        {
          "speaker": "B",
          "study": "Sí, ¿para cuántos?",
          "phon": "SI, PA-ra KOUAN-tos",
          "native": "Oui, pour combien de personnes ?",
          "turnIndex": 1,
          "role": "Serveur",
          "roleInterface": "Serveur"
        },
        {
          "speaker": "A",
          "study": "Para dos, por favor.",
          "phon": "PA-ra DOS, por fa-BOR",
          "native": "Pour deux, s'il vous plaît.",
          "turnIndex": 2,
          "role": "Client",
          "roleInterface": "Client"
        }
      ],
      "l1Dialogue": {
        "id": "L1-fr-es-d1",
        "situation": "Au café",
        "turns": [
          {
            "speaker": "A",
            "study": "¡Hola!",
            "phon": "O-la",
            "native": "Bonjour !",
            "turnIndex": 0,
            "role": "Client",
            "roleInterface": "Client"
          },
          {
            "speaker": "B",
            "study": "Hola. ¿Qué desea?",
            "phon": "O-la. ké dé-SSÉ-a",
            "native": "Bonjour. Vous désirez ?",
            "turnIndex": 1,
            "role": "Serveur",
            "roleInterface": "Serveur"
          },
          {
            "speaker": "A",
            "study": "Un café, por favor.",
            "phon": "oun ka-FÉ, por fa-BOR",
            "native": "Un café, s'il vous plaît.",
            "turnIndex": 2,
            "role": "Client",
            "roleInterface": "Client"
          },
          {
            "speaker": "B",
            "study": "¿Con leche?",
            "phon": "kon LÉ-tché",
            "native": "Avec du lait ?",
            "turnIndex": 3,
            "role": "Serveur",
            "roleInterface": "Serveur"
          },
          {
            "speaker": "A",
            "study": "No, gracias. ¿Cuánto cuesta?",
            "phon": "no, GRA-ssias. KOUAN-to KOUÉS-ta",
            "native": "Non, merci. Combien ça coûte ?",
            "turnIndex": 4,
            "role": "Client",
            "roleInterface": "Client"
          },
          {
            "speaker": "B",
            "study": "Dos euros.",
            "phon": "dos É-ou-ros",
            "native": "Deux euros.",
            "turnIndex": 5,
            "role": "Serveur",
            "roleInterface": "Serveur"
          }
        ],
        "practice": "Écouter les deux rôles, masquer un rôle, répondre, puis remplacer une réplique par une variante personnelle.",
        "reuses": [
          "L1-fr-es-09",
          "L1-fr-es-10"
        ],
        "roles": {
          "A": "Client",
          "B": "Serveur"
        },
        "learnerRole": "A",
        "interfaceSituation": "Au café",
        "rolesInterface": {
          "A": "Client",
          "B": "Serveur"
        }
      },
      "l2Situation": "Au restaurant",
      "l2SourceSituation": "Au restaurant",
      "reviewStatus": {
        "l1": "Généré par règles à partir de briques validées ; relecture par un hispanophone conseillée.",
        "l2": "Généré par règles à partir de briques validées ; relecture par un hispanophone conseillée."
      },
      "phoneticConvention": "Approximation pour lecteurs francophones (MAJUSCULES = syllabe accentuée ; v→b, ll→y, j/ge/gi→KH, c/z→ss, que→ké). Variante à seseo et yeísmo. Ne remplace pas l'audio.",
      "previewContext": {
        "speaker": "A",
        "study": "Buenas tardes. ¿Hay mesa libre?",
        "phon": "BOUÉ-nas TAR-dés. AY MÉ-ssa LI-bré",
        "native": "Bonsoir. Il y a une table libre ?",
        "turnIndex": 0,
        "role": "Client",
        "roleInterface": "Client"
      }
    },
    {
      "id": "fr-en",
      "label": "🇬🇧 Anglais",
      "readerLabel": "Francophone",
      "studyCode": "en",
      "nativeCode": "fr",
      "sourceL1": {
        "file": "melunga_deploy/content/conversation/L1-fr-en.json",
        "dialogueId": "L1-fr-en-d1",
        "turnIndexes": [
          2
        ]
      },
      "sourceL2": {
        "file": "melunga_deploy/content/conversation/L2-fr-en.json",
        "dialogueId": "L2-fr-en-d1",
        "turnIndexes": [
          0,
          1,
          2
        ],
        "previewPlayedTurnIndexes": [
          1,
          2
        ],
        "contextTurnIndex": 0
      },
      "l1": {
        "speaker": "A",
        "study": "One coffee, please.",
        "phon": "OUANN KO-fi, PLIZ",
        "native": "Un café, s'il vous plaît.",
        "turnIndex": 2,
        "role": "Client",
        "roleInterface": "Client"
      },
      "preview": [
        {
          "speaker": "B",
          "study": "Of course. Here or over there?",
          "phon": "ov KORSS. HIR or Ô-veur ZÈR",
          "native": "Bien sûr. Ici ou là-bas ?",
          "turnIndex": 1,
          "role": "Serveur",
          "roleInterface": "Serveur"
        },
        {
          "speaker": "A",
          "study": "Over there, near the window.",
          "phon": "Ô-veur ZÈR, NIR ze OUINN-dô",
          "native": "Là-bas, près de la fenêtre.",
          "turnIndex": 2,
          "role": "Client",
          "roleInterface": "Client"
        }
      ],
      "l1Dialogue": {
        "id": "L1-fr-en-d1",
        "situation": "Au café",
        "turns": [
          {
            "speaker": "A",
            "study": "Hello!",
            "phon": "hè-LÔ",
            "native": "Bonjour !",
            "turnIndex": 0,
            "role": "Client",
            "roleInterface": "Client"
          },
          {
            "speaker": "B",
            "study": "Hello. What would you like?",
            "phon": "hè-LÔ. ouot would you LAÏK",
            "native": "Bonjour. Vous désirez ?",
            "turnIndex": 1,
            "role": "Serveur",
            "roleInterface": "Serveur"
          },
          {
            "speaker": "A",
            "study": "One coffee, please.",
            "phon": "OUANN KO-fi, PLIZ",
            "native": "Un café, s'il vous plaît.",
            "turnIndex": 2,
            "role": "Client",
            "roleInterface": "Client"
          },
          {
            "speaker": "B",
            "study": "With milk?",
            "phon": "ouiz MILK",
            "native": "Avec du lait ?",
            "turnIndex": 3,
            "role": "Serveur",
            "roleInterface": "Serveur"
          },
          {
            "speaker": "A",
            "study": "No, thanks. How much is it?",
            "phon": "NÔ, THANKS. HAÔ MEUTCH iz it",
            "native": "Non, merci. Combien ça coûte ?",
            "turnIndex": 4,
            "role": "Client",
            "roleInterface": "Client"
          },
          {
            "speaker": "B",
            "study": "Two pounds.",
            "phon": "TOU PAÔNDZ",
            "native": "Deux livres.",
            "turnIndex": 5,
            "role": "Serveur",
            "roleInterface": "Serveur"
          }
        ],
        "practice": "Écouter les deux rôles, masquer un rôle, répondre, puis remplacer une réplique par une variante personnelle.",
        "reuses": [
          "L1-fr-en-09",
          "L1-fr-en-10"
        ],
        "roles": {
          "A": "Client",
          "B": "Serveur"
        },
        "learnerRole": "A",
        "interfaceSituation": "Au café",
        "rolesInterface": {
          "A": "Client",
          "B": "Serveur"
        }
      },
      "l2Situation": "Au café",
      "l2SourceSituation": "Au café",
      "reviewStatus": {
        "l1": "Rédigé à la main ; relecture par un anglophone conseillée.",
        "l2": "Rédigé à la main ; relecture par un anglophone conseillée."
      },
      "phoneticConvention": "Approximation pour lecteurs francophones (MAJUSCULES = syllabe accentuée ; th→z/th, h aspiré noté h, -ing→-ing). Anglais britannique standard. Ne remplace pas l'audio.",
      "previewContext": {
        "speaker": "A",
        "study": "Hello! A table for two, please.",
        "phon": "hè-LÔ. eu TÉÏ-beul for TOU, PLIZ",
        "native": "Bonjour ! Une table pour deux, s'il vous plaît.",
        "turnIndex": 0,
        "role": "Client",
        "roleInterface": "Client"
      }
    },
    {
      "id": "fr-zh",
      "label": "🇨🇳 Chinois",
      "readerLabel": "Francophone",
      "studyCode": "zh",
      "nativeCode": "fr",
      "sourceL1": {
        "file": "melunga_deploy/content/conversation/L1-fr-zh.json",
        "dialogueId": "L1-fr-zh-d1",
        "turnIndexes": [
          2
        ]
      },
      "sourceL2": {
        "file": "melunga_deploy/content/conversation/L2-fr-zh.json",
        "dialogueId": "L2-fr-zh-d1",
        "turnIndexes": [
          0,
          1,
          2
        ],
        "previewPlayedTurnIndexes": [
          1,
          2
        ],
        "contextTurnIndex": 0
      },
      "l1": {
        "speaker": "A",
        "study": "请给我一杯咖啡。",
        "reading": "qǐng gěi wǒ yì bēi kāfēi.",
        "phon": "tching gueï ouo i peï ka-feï",
        "native": "Un café, s'il vous plaît.",
        "turnIndex": 2,
        "role": "Client",
        "roleInterface": "Client"
      },
      "preview": [
        {
          "speaker": "B",
          "study": "有。几位？",
          "reading": "yǒu. jǐ wèi?",
          "phon": "yeou. ti oueï ?",
          "native": "Oui. Combien de personnes ?",
          "turnIndex": 1,
          "role": "Serveur",
          "roleInterface": "Serveur"
        },
        {
          "speaker": "A",
          "study": "两位。我们想要靠窗的座位。",
          "reading": "liǎng wèi. wǒmen xiǎng yào kào chuāng de zuòwèi.",
          "phon": "liang oueï. ouo-meun siang yao kao tchouang deu tsouo-oueï",
          "native": "Deux. Nous voudrions une table côté fenêtre.",
          "turnIndex": 2,
          "role": "Client",
          "roleInterface": "Client"
        }
      ],
      "l1Dialogue": {
        "id": "L1-fr-zh-d1",
        "situation": "Au café",
        "turns": [
          {
            "speaker": "A",
            "study": "你好！",
            "reading": "nǐ hǎo!",
            "phon": "ni hao !",
            "native": "Bonjour !",
            "turnIndex": 0,
            "role": "Client",
            "roleInterface": "Client"
          },
          {
            "speaker": "B",
            "study": "你好。您要什么？",
            "reading": "nǐ hǎo. nín yào shénme?",
            "phon": "ni hao. ninn yao cheun-meu ?",
            "native": "Bonjour. Vous désirez ?",
            "turnIndex": 1,
            "role": "Serveur",
            "roleInterface": "Serveur"
          },
          {
            "speaker": "A",
            "study": "请给我一杯咖啡。",
            "reading": "qǐng gěi wǒ yì bēi kāfēi.",
            "phon": "tching gueï ouo i peï ka-feï",
            "native": "Un café, s'il vous plaît.",
            "turnIndex": 2,
            "role": "Client",
            "roleInterface": "Client"
          },
          {
            "speaker": "B",
            "study": "加牛奶吗？",
            "reading": "jiā niúnǎi ma?",
            "phon": "tia niou-naï ma ?",
            "native": "Avec du lait ?",
            "turnIndex": 3,
            "role": "Serveur",
            "roleInterface": "Serveur"
          },
          {
            "speaker": "A",
            "study": "不用，谢谢。多少钱？",
            "reading": "búyòng, xièxie. duōshao qián?",
            "phon": "pou-yong, sié-sié. douo-chao tchyèn ?",
            "native": "Non, merci. Combien ça coûte ?",
            "turnIndex": 4,
            "role": "Client",
            "roleInterface": "Client"
          },
          {
            "speaker": "B",
            "study": "二十块。",
            "reading": "èrshí kuài.",
            "phon": "eur-chr kouaï",
            "native": "Vingt yuans.",
            "turnIndex": 5,
            "role": "Serveur",
            "roleInterface": "Serveur"
          }
        ],
        "practice": "Écouter les deux rôles, masquer un rôle, répondre, puis remplacer une réplique par une variante personnelle.",
        "reuses": [
          "L1-fr-zh-09",
          "L1-fr-zh-10"
        ],
        "roles": {
          "A": "Client",
          "B": "Serveur"
        },
        "learnerRole": "A",
        "interfaceSituation": "Au café",
        "rolesInterface": {
          "A": "Client",
          "B": "Serveur"
        }
      },
      "l2Situation": "Au restaurant",
      "l2SourceSituation": "Au restaurant",
      "reviewStatus": {
        "l1": "Relecture linguistique requise (tons, naturel des tournures).",
        "l2": "Relecture linguistique requise (tons, naturel des tournures)."
      },
      "phoneticConvention": "Approximation pour lecteurs francophones (style du deck : ouo = 我, chr = 是, dzaï = 在). Les tons ne sont pas notés dans l'approximation : se reporter au pinyin (champ reading) et à l'audio. Mandarin standard, caractères simplifiés.",
      "previewContext": {
        "speaker": "A",
        "study": "你好，有位子吗？",
        "reading": "nǐ hǎo, yǒu wèizi ma?",
        "phon": "ni hao, yeou oueï-tseu ma ?",
        "native": "Bonjour, vous avez de la place ?",
        "turnIndex": 0,
        "role": "Client",
        "roleInterface": "Client"
      }
    },
    {
      "id": "fr-it",
      "label": "🇮🇹 Italien",
      "readerLabel": "Francophone",
      "studyCode": "it",
      "nativeCode": "fr",
      "sourceL1": {
        "file": "melunga_deploy/content/conversation/L1-fr-it.json",
        "dialogueId": "L1-fr-it-d1",
        "turnIndexes": [
          2
        ]
      },
      "sourceL2": {
        "file": "melunga_deploy/content/conversation/L2-fr-it.json",
        "dialogueId": "L2-fr-it-d1",
        "turnIndexes": [
          0,
          1,
          2
        ],
        "previewPlayedTurnIndexes": [
          1,
          2
        ],
        "contextTurnIndex": 0
      },
      "l1": {
        "speaker": "A",
        "study": "Un caffè, per favore.",
        "phon": "oun kaf-FÈ, pér fa-VO-ré",
        "native": "Un café, s'il vous plaît.",
        "turnIndex": 2,
        "role": "Client",
        "roleInterface": "Client"
      },
      "preview": [
        {
          "speaker": "B",
          "study": "Subito. Qualcos'altro?",
          "phon": "SOU-bi-to. koual-ko-ZAL-tro",
          "native": "Tout de suite. Autre chose ?",
          "turnIndex": 1,
          "role": "Serveur",
          "roleInterface": "Serveur"
        },
        {
          "speaker": "A",
          "study": "Sì, un po' d'acqua e un cornetto.",
          "phon": "SI, oun po DA-koua é oun kor-NÉT-to",
          "native": "Oui, un peu d'eau et un croissant.",
          "turnIndex": 2,
          "role": "Client",
          "roleInterface": "Client"
        }
      ],
      "l1Dialogue": {
        "id": "L1-fr-it-d1",
        "situation": "Au café",
        "turns": [
          {
            "speaker": "A",
            "study": "Buongiorno!",
            "phon": "bouon-DJOR-no",
            "native": "Bonjour !",
            "turnIndex": 0,
            "role": "Client",
            "roleInterface": "Client"
          },
          {
            "speaker": "B",
            "study": "Buongiorno. Cosa desidera?",
            "phon": "bouon-DJOR-no. KO-za dé-ZI-dé-ra",
            "native": "Bonjour. Vous désirez ?",
            "turnIndex": 1,
            "role": "Serveur",
            "roleInterface": "Serveur"
          },
          {
            "speaker": "A",
            "study": "Un caffè, per favore.",
            "phon": "oun kaf-FÈ, pér fa-VO-ré",
            "native": "Un café, s'il vous plaît.",
            "turnIndex": 2,
            "role": "Client",
            "roleInterface": "Client"
          },
          {
            "speaker": "B",
            "study": "Con latte?",
            "phon": "kon LAT-té",
            "native": "Avec du lait ?",
            "turnIndex": 3,
            "role": "Serveur",
            "roleInterface": "Serveur"
          },
          {
            "speaker": "A",
            "study": "No, grazie. Quanto costa?",
            "phon": "no, GRA-tsié. KOUAN-to KOS-ta",
            "native": "Non, merci. Combien ça coûte ?",
            "turnIndex": 4,
            "role": "Client",
            "roleInterface": "Client"
          },
          {
            "speaker": "B",
            "study": "Due euro.",
            "phon": "DOU-é È-ou-ro",
            "native": "Deux euros.",
            "turnIndex": 5,
            "role": "Serveur",
            "roleInterface": "Serveur"
          }
        ],
        "practice": "Écouter les deux rôles, masquer un rôle, répondre, puis remplacer une réplique par une variante personnelle.",
        "reuses": [
          "L1-fr-it-09",
          "L1-fr-it-10"
        ],
        "roles": {
          "A": "Client",
          "B": "Serveur"
        },
        "learnerRole": "A",
        "interfaceSituation": "Au café",
        "rolesInterface": {
          "A": "Client",
          "B": "Serveur"
        }
      },
      "l2Situation": "Au bar",
      "l2SourceSituation": "Au bar",
      "reviewStatus": {
        "l1": "Rédigé à la main ; relecture par un italophone conseillée.",
        "l2": "Rédigé à la main ; relecture par un italophone conseillée."
      },
      "phoneticConvention": "Approximation pour lecteurs francophones (MAJUSCULES = syllabe accentuée ; c+e/i→tch, g+e/i→dj, gn→gn, gl→li, z→ts/dz, consonnes doubles allongées). Ne remplace pas l'audio.",
      "previewContext": {
        "speaker": "A",
        "study": "Buongiorno! Vorrei due caffè, per favore.",
        "phon": "bouon-DJOR-no. vor-RÈÏ DOU-é kaf-FÈ, pér fa-VO-ré",
        "native": "Bonjour ! Je voudrais deux cafés, s'il vous plaît.",
        "turnIndex": 0,
        "role": "Client",
        "roleInterface": "Client"
      }
    },
    {
      "id": "fr-ja",
      "label": "🇯🇵 Japonais",
      "readerLabel": "Francophone",
      "studyCode": "ja",
      "nativeCode": "fr",
      "sourceL1": {
        "file": "melunga_deploy/content/conversation/L1-fr-ja.json",
        "dialogueId": "L1-fr-ja-d1",
        "turnIndexes": [
          2
        ]
      },
      "sourceL2": {
        "file": "melunga_deploy/content/conversation/L2-fr-ja.json",
        "dialogueId": "L2-fr-ja-d1",
        "turnIndexes": [
          0,
          1,
          2
        ],
        "previewPlayedTurnIndexes": [
          1,
          2
        ],
        "contextTurnIndex": 0
      },
      "l1": {
        "speaker": "A",
        "study": "コーヒーをお願いします。",
        "reading": "こーひーをおねがいします。",
        "phon": "ko-o-hi-i o o-né-ga-i chi-ma-sou",
        "native": "Un café, s'il vous plaît.",
        "turnIndex": 2,
        "role": "Client",
        "roleInterface": "Client"
      },
      "preview": [
        {
          "speaker": "B",
          "study": "はい。ホットですか、アイスですか。",
          "reading": "はい。ほっとですか、あいすですか。",
          "phon": "ha-i. hot-to dé-sou ka, a-i-sou dé-sou ka",
          "native": "Oui. Chauds ou glacés ?",
          "turnIndex": 1,
          "role": "Serveur",
          "roleInterface": "Serveur"
        },
        {
          "speaker": "A",
          "study": "ホットをお願いします。それから、サンドイッチはありますか。",
          "reading": "ほっとをおねがいします。それから、さんどいっちはありますか。",
          "phon": "hot-to o o-né-ga-i chi-ma-sou. so-ré-ka-ra, san-do-it-tchi wa a-ri-ma-sou ka",
          "native": "Chauds, s'il vous plaît. Et puis, avez-vous des sandwichs ?",
          "turnIndex": 2,
          "role": "Client",
          "roleInterface": "Client"
        }
      ],
      "l1Dialogue": {
        "id": "L1-fr-ja-d1",
        "situation": "Au café",
        "turns": [
          {
            "speaker": "A",
            "study": "こんにちは！",
            "reading": "こんにちは！",
            "phon": "kon-ni-tchi-wa",
            "native": "Bonjour !",
            "turnIndex": 0,
            "role": "Client",
            "roleInterface": "Client"
          },
          {
            "speaker": "B",
            "study": "こんにちは。ご注文は？",
            "reading": "こんにちは。ごちゅうもんは？",
            "phon": "kon-ni-tchi-wa. go-tchou-ou-mon wa",
            "native": "Bonjour. Vous désirez ?",
            "turnIndex": 1,
            "role": "Serveur",
            "roleInterface": "Serveur"
          },
          {
            "speaker": "A",
            "study": "コーヒーをお願いします。",
            "reading": "こーひーをおねがいします。",
            "phon": "ko-o-hi-i o o-né-ga-i chi-ma-sou",
            "native": "Un café, s'il vous plaît.",
            "turnIndex": 2,
            "role": "Client",
            "roleInterface": "Client"
          },
          {
            "speaker": "B",
            "study": "ミルクは？",
            "reading": "みるくは？",
            "phon": "mi-rou-kou wa",
            "native": "Avec du lait ?",
            "turnIndex": 3,
            "role": "Serveur",
            "roleInterface": "Serveur"
          },
          {
            "speaker": "A",
            "study": "いいえ、結構です。いくらですか。",
            "reading": "いいえ、けっこうです。いくらですか。",
            "phon": "i-i-é, kek-ko-o dé-sou. i-kou-ra dé-sou ka",
            "native": "Non, merci. Combien ça coûte ?",
            "turnIndex": 4,
            "role": "Client",
            "roleInterface": "Client"
          },
          {
            "speaker": "B",
            "study": "三百円です。",
            "reading": "さんびゃくえんです。",
            "phon": "san-bya-kou én dé-sou",
            "native": "Trois cents yens.",
            "turnIndex": 5,
            "role": "Serveur",
            "roleInterface": "Serveur"
          }
        ],
        "practice": "Écouter les deux rôles, masquer un rôle, répondre, puis remplacer une réplique par une variante personnelle.",
        "reuses": [
          "L1-fr-ja-09"
        ],
        "roles": {
          "A": "Client",
          "B": "Serveur"
        },
        "learnerRole": "A",
        "interfaceSituation": "Au café",
        "rolesInterface": {
          "A": "Client",
          "B": "Serveur"
        }
      },
      "l2Situation": "Au café",
      "l2SourceSituation": "Au café",
      "reviewStatus": {
        "l1": "Relecture linguistique requise (naturel des tournures, lectures des kanji).",
        "l2": "Relecture linguistique requise (naturel des tournures, lectures des kanji)."
      },
      "phoneticConvention": "Approximation pour lecteurs francophones, syllabe par syllabe (style du deck : a-ri-ga-to-o). Voyelle longue = voyelle répétée (ko-o-hi-i, to-o) ; consonne double = consonne fermant la syllabe précédente (kip-pou, chouc-chin, kek-ko-o) ; u final souvent assourdi (dé-sou → « dès »). Le champ reading donne la lecture en hiragana. Registre poli (です / ます).",
      "previewContext": {
        "speaker": "A",
        "study": "すみません、コーヒーを二つください。",
        "reading": "すみません、こーひーをふたつください。",
        "phon": "sou-mi-ma-sén, ko-o-hi-i o fou-ta-tsou kou-da-sa-i",
        "native": "Excusez-moi, deux cafés, s'il vous plaît.",
        "turnIndex": 0,
        "role": "Client",
        "roleInterface": "Client"
      }
    },
    {
      "id": "fr-ko",
      "label": "🇰🇷 Coréen",
      "readerLabel": "Francophone",
      "studyCode": "ko",
      "nativeCode": "fr",
      "sourceL1": {
        "file": "melunga_deploy/content/conversation/L1-fr-ko.json",
        "dialogueId": "L1-fr-ko-d1",
        "turnIndexes": [
          2
        ]
      },
      "sourceL2": {
        "file": "melunga_deploy/content/conversation/L2-fr-ko.json",
        "dialogueId": "L2-fr-ko-d1",
        "turnIndexes": [
          0,
          1,
          2
        ],
        "previewPlayedTurnIndexes": [
          1,
          2
        ],
        "contextTurnIndex": 0
      },
      "l1": {
        "speaker": "A",
        "study": "커피 하나 주세요.",
        "reading": "keopi hana juseyo.",
        "phon": "keo-pi ha-na djou-sé-yo",
        "native": "Un café, s'il vous plaît.",
        "turnIndex": 2,
        "role": "Client",
        "roleInterface": "Client"
      },
      "preview": [
        {
          "speaker": "B",
          "study": "네. 따뜻한 거요, 차가운 거요?",
          "reading": "ne. ttatteutan geoyo, chagaun geoyo?",
          "phon": "nè. tta-tteu-tan geo-yo, tcha-ga-oun geo-yo ?",
          "native": "Oui. Chaud ou froid ?",
          "turnIndex": 1,
          "role": "Serveur",
          "roleInterface": "Serveur"
        },
        {
          "speaker": "A",
          "study": "따뜻한 거요. 그리고 물 조금 주세요.",
          "reading": "ttatteutan geoyo. geurigo mul jogeum juseyo.",
          "phon": "tta-tteu-tan geo-yo. geu-ri-go moul djo-geum djou-sè-yo",
          "native": "Chaud. Et un peu d'eau, s'il vous plaît.",
          "turnIndex": 2,
          "role": "Client",
          "roleInterface": "Client"
        }
      ],
      "l1Dialogue": {
        "id": "L1-fr-ko-d1",
        "situation": "Au café",
        "turns": [
          {
            "speaker": "A",
            "study": "안녕하세요!",
            "reading": "annyeonghaseyo!",
            "phon": "an-nyeong-ha-sé-yo",
            "native": "Bonjour !",
            "turnIndex": 0,
            "role": "Client",
            "roleInterface": "Client"
          },
          {
            "speaker": "B",
            "study": "안녕하세요. 뭐 드릴까요?",
            "reading": "annyeonghaseyo. mwo deurilkkayo?",
            "phon": "an-nyeong-ha-sé-yo. mwo deu-ril-kka-yo",
            "native": "Bonjour. Vous désirez ?",
            "turnIndex": 1,
            "role": "Serveur",
            "roleInterface": "Serveur"
          },
          {
            "speaker": "A",
            "study": "커피 하나 주세요.",
            "reading": "keopi hana juseyo.",
            "phon": "keo-pi ha-na djou-sé-yo",
            "native": "Un café, s'il vous plaît.",
            "turnIndex": 2,
            "role": "Client",
            "roleInterface": "Client"
          },
          {
            "speaker": "B",
            "study": "우유 넣을까요?",
            "reading": "uyu neoeulkkayo?",
            "phon": "ou-you neo-eul-kka-yo",
            "native": "Avec du lait ?",
            "turnIndex": 3,
            "role": "Serveur",
            "roleInterface": "Serveur"
          },
          {
            "speaker": "A",
            "study": "아니요, 괜찮아요. 얼마예요?",
            "reading": "aniyo, gwaenchanayo. eolmayeyo?",
            "phon": "a-ni-yo, kouèn-tchan-a-yo. eol-ma-yé-yo",
            "native": "Non, merci. Combien ça coûte ?",
            "turnIndex": 4,
            "role": "Client",
            "roleInterface": "Client"
          },
          {
            "speaker": "B",
            "study": "삼천 원이에요.",
            "reading": "samcheon won-ieyo.",
            "phon": "sam-tcheon ouon-i-é-yo",
            "native": "Trois mille wons.",
            "turnIndex": 5,
            "role": "Serveur",
            "roleInterface": "Serveur"
          }
        ],
        "practice": "Écouter les deux rôles, masquer un rôle, répondre, puis remplacer une réplique par une variante personnelle.",
        "reuses": [
          "L1-fr-ko-03",
          "L1-fr-ko-09",
          "L1-fr-ko-10"
        ],
        "roles": {
          "A": "Client",
          "B": "Serveur"
        },
        "learnerRole": "A",
        "interfaceSituation": "Au café",
        "rolesInterface": {
          "A": "Client",
          "B": "Serveur"
        }
      },
      "l2Situation": "Au café",
      "l2SourceSituation": "Au café",
      "reviewStatus": {
        "l1": "Relecture linguistique requise (particules, naturel des tournures).",
        "l2": "Relecture linguistique requise (particules, naturel des tournures)."
      },
      "phoneticConvention": "Approximation pour lecteurs francophones, syllabe par syllabe (style du deck : gam-sa-ham-ni-da ; eo = ㅓ, eu = ㅡ). Le champ reading donne la romanisation révisée. Registre poli (-요). Les particules (이/가, 을/를, 이에요/예요) sont incluses dans le morceau remplaçable.",
      "previewContext": {
        "speaker": "A",
        "study": "안녕하세요. 커피 두 잔 주세요.",
        "reading": "annyeonghaseyo. keopi du jan juseyo.",
        "phon": "an-nyeong-ha-sè-yo. keo-pi dou djan djou-sè-yo",
        "native": "Bonjour. Deux cafés, s'il vous plaît.",
        "turnIndex": 0,
        "role": "Client",
        "roleInterface": "Client"
      }
    },
    {
      "id": "zh-fr",
      "label": "🇫🇷 Français",
      "readerLabel": "Sinophone",
      "studyCode": "fr",
      "nativeCode": "zh",
      "sourceL1": {
        "file": "melunga_deploy/content/conversation/L1-zh-fr.json",
        "dialogueId": "L1-zh-fr-d1",
        "turnIndexes": [
          2
        ]
      },
      "sourceL2": {
        "file": "melunga_deploy/content/conversation/L2-zh-fr.json",
        "dialogueId": "L2-zh-fr-d1",
        "turnIndexes": [
          0,
          1,
          2
        ],
        "previewPlayedTurnIndexes": [
          1,
          2
        ],
        "contextTurnIndex": 0
      },
      "l1": {
        "speaker": "A",
        "study": "Un café, s'il vous plaît.",
        "phon": "安 卡菲，西尔 武 普莱",
        "native": "请给我一杯咖啡。",
        "turnIndex": 2,
        "role": "顾客",
        "roleInterface": "Client"
      },
      "preview": [
        {
          "speaker": "B",
          "study": "Bien sûr. Ici ou là-bas, près de la fenêtre ?",
          "phon": "比安 叙尔。伊西 乌 拉巴，普雷 德 拉 弗内特尔",
          "native": "好的。这里还是那边靠窗？",
          "turnIndex": 1,
          "role": "服务员",
          "roleInterface": "Serveur"
        },
        {
          "speaker": "A",
          "study": "Près de la fenêtre. Je voudrais deux cafés, s'il vous plaît.",
          "phon": "普雷 德 拉 弗内特尔。热 武德雷 德 卡菲，西尔 武 普莱",
          "native": "靠窗。我想要两杯咖啡。",
          "turnIndex": 2,
          "role": "顾客",
          "roleInterface": "Client"
        }
      ],
      "l1Dialogue": {
        "id": "L1-zh-fr-d1",
        "situation": "在咖啡馆",
        "turns": [
          {
            "speaker": "A",
            "study": "Bonjour !",
            "phon": "蓬茹尔",
            "native": "你好！",
            "turnIndex": 0,
            "role": "顾客",
            "roleInterface": "Client"
          },
          {
            "speaker": "B",
            "study": "Bonjour. Vous désirez ?",
            "phon": "蓬茹尔。武 德吉雷",
            "native": "你好。您要什么？",
            "turnIndex": 1,
            "role": "服务员",
            "roleInterface": "Serveur"
          },
          {
            "speaker": "A",
            "study": "Un café, s'il vous plaît.",
            "phon": "安 卡菲，西尔 武 普莱",
            "native": "请给我一杯咖啡。",
            "turnIndex": 2,
            "role": "顾客",
            "roleInterface": "Client"
          },
          {
            "speaker": "B",
            "study": "Avec du lait ?",
            "phon": "阿维克 迪 莱",
            "native": "加牛奶吗？",
            "turnIndex": 3,
            "role": "服务员",
            "roleInterface": "Serveur"
          },
          {
            "speaker": "A",
            "study": "Non, merci. Combien ça coûte ?",
            "phon": "诺，美西。孔比安 萨 库特",
            "native": "不用，谢谢。多少钱？",
            "turnIndex": 4,
            "role": "顾客",
            "roleInterface": "Client"
          },
          {
            "speaker": "B",
            "study": "Deux euros.",
            "phon": "德 厄罗",
            "native": "两欧元。",
            "turnIndex": 5,
            "role": "服务员",
            "roleInterface": "Serveur"
          }
        ],
        "practice": "先听两个角色，遮住一个角色自己回答，再把一句台词换成自己的说法。",
        "reuses": [
          "L1-zh-fr-09"
        ],
        "roles": {
          "A": "顾客",
          "B": "服务员"
        },
        "learnerRole": "A",
        "interfaceSituation": "Au café",
        "rolesInterface": {
          "A": "Client",
          "B": "Serveur"
        }
      },
      "l2Situation": "Au restaurant",
      "l2SourceSituation": "在餐厅",
      "reviewStatus": {
        "l1": "需语言校对（汉字注音的近似程度、译文自然度）。",
        "l2": "需语言校对（汉字注音的近似程度、译文自然度）。"
      },
      "phoneticConvention": "用汉字标注法语读音（沿用词库风格：美西 = merci，诺 = non）。汉字只是近似，请以音频为准。法语无声调；重音不在单词上，而是落在一个节奏组（短语或句子）的最后一个音节，并略微拉长。",
      "previewContext": {
        "speaker": "A",
        "study": "Bonjour, une table pour deux, s'il vous plaît.",
        "phon": "蓬茹尔，于讷 塔布勒 普尔 德，西尔 武 普莱",
        "native": "你好，请给我们一张两人桌。",
        "turnIndex": 0,
        "role": "顾客",
        "roleInterface": "Client"
      }
    }
  ],
  "webPricing": {
    "monthlyDisplay": "7,90 €",
    "annualDisplay": "42 €",
    "monthlyDays": 30,
    "annualDays": 365,
    "currency": "EUR",
    "country": "FR"
  }
};

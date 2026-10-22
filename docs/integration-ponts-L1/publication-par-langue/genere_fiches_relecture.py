# -*- coding: utf-8 -*-
"""Génère les sept fiches de relecture native, une par langue, rédigées dans la
langue du relecteur. Le contenu est repris tel quel de content/l1-cafe.json."""
import json, os, sys

SRC = sys.argv[1]
OUT = sys.argv[2]
os.makedirs(OUT, exist_ok=True)
d = json.load(open(SRC, encoding="utf-8"))

L = {
 "en": dict(name="English", learner="a French speaker who is an absolute beginner in English",
  title="Melunga — native check, first English lesson",
  intro="This is the very first lesson of a language app. The learner is {learner}. Everything below already exists in the app; we only need to know whether it sounds right to you. Please answer in one line each — five to ten minutes is plenty.",
  scene="The scene", you="LEARNER SAYS", other="STAFF SAYS", ph="French-reader pronunciation guide",
  q=["Does the whole exchange sound like a real café in your country? If not, what feels off?",
     "The learner greets first with « {g} ». Natural for a customer walking in?",
     "« {o} » — is this how you would order? If not, what would you say?",
     "**The key question.** « {r} » is shown on its own, as a complete reply to « {m} ». On its own, does it still sound polite — not curt?",
     "« {p} » is then said as a separate sentence. Natural right after refusing?",
     "The staff lines are « {s1} », « {s2} », « {s3} ». Would staff really say these?",
     "Anything here that sounds dated, regional, or that you would simply never say?"],
  extra=None,
  ph_q="Optional, only if you read French: a French speaker reads « {phr} » aloud to approximate « {std} ». Does that get close?"),
 "es": dict(name="Español", learner="un francófono principiante absoluto en español",
  title="Melunga — revisión nativa, primera lección de español",
  intro="Esta es la primera lección de una aplicación de idiomas. El alumno es {learner}. Todo lo que sigue ya existe en la aplicación; solo necesitamos saber si te suena bien. Una línea por respuesta basta — cinco o diez minutos.",
  scene="La escena", you="EL ALUMNO DICE", other="EL CAMARERO DICE", ph="guía de pronunciación para lectores franceses",
  q=["¿Suena como un café real en tu país? Si no, ¿qué falla?",
     "El alumno saluda primero con « {g} ». ¿Natural para un cliente que entra?",
     "« {o} » — ¿es así como pedirías? Si no, ¿qué dirías?",
     "**La pregunta clave.** « {r} » aparece solo, como respuesta completa a « {m} ». Aislado, ¿sigue sonando educado, no seco?",
     "« {p} » se dice después, como frase aparte. ¿Natural justo después de rechazar?",
     "Las frases del camarero son « {s1} », « {s2} », « {s3} ». ¿Las diría de verdad?",
     "¿Algo que suene anticuado, regional, o que simplemente nunca dirías?"],
  extra=None,
  ph_q="Opcional, solo si lees francés: un francófono lee « {phr} » en voz alta para aproximar « {std} ». ¿Se acerca?"),
 "it": dict(name="Italiano", learner="un francofono principiante assoluto in italiano",
  title="Melunga — revisione madrelingua, prima lezione di italiano",
  intro="Questa è la primissima lezione di un'app di lingue. Lo studente è {learner}. Tutto quello che segue esiste già nell'app; ci serve solo sapere se ti suona giusto. Una riga per risposta basta — cinque o dieci minuti.",
  scene="La scena", you="LO STUDENTE DICE", other="IL CAMERIERE DICE", ph="guida alla pronuncia per lettori francesi",
  q=["L'insieme suona come un bar vero in Italia? Se no, cosa non va?",
     "Lo studente saluta per primo con « {g} ». Naturale per un cliente che entra?",
     "« {o} » — ordineresti così? Se no, cosa diresti?",
     "**La domanda chiave.** « {r} » appare da solo, come risposta completa a « {m} ». Isolato, suona ancora gentile e non brusco?",
     "« {p} » viene detto dopo, come frase a sé. Naturale subito dopo aver rifiutato?",
     "Le battute del cameriere sono « {s1} », « {s2} », « {s3} ». Le direbbe davvero?",
     "Qualcosa che suoni datato, regionale, o che semplicemente non diresti mai?"],
  extra=None,
  ph_q="Facoltativo, solo se leggi il francese: un francofono legge « {phr} » ad alta voce per avvicinarsi a « {std} ». Ci va vicino?"),
 "zh": dict(name="中文", learner="一位零基础的法语母语学习者",
  title="Melunga — 母语者校对，中文第一课",
  intro="这是一个语言应用的第一课。学习者是{learner}。以下内容已经在应用里了；我们只需要知道它听起来是否地道。每题一行即可，五到十分钟。",
  scene="场景", you="学习者说", other="服务员说", ph="给法语读者的发音近似",
  q=["整段对话像真实的咖啡馆吗？如果不像，哪里不对？",
     "学习者先说「{g}」打招呼。顾客进门这样说自然吗？",
     "「{o}」——你会这样点单吗？如果不会，你会怎么说？",
     "**关键问题。** 「{r}」单独出现，作为对「{m}」的完整回答。单独说出来，还礼貌吗？会不会显得生硬？",
     "接着单独说「{p}」。刚拒绝完就这样问，自然吗？",
     "服务员的话是「{s1}」「{s2}」「{s3}」。服务员真的会这样说吗？",
     "有没有听起来过时、带地方色彩、或者你根本不会说的地方？"],
  extra="另外请特别看「不用，谢谢。」：作为拒绝加奶的完整回答，语气合适吗？还是「不用了，谢谢」更自然？",
  ph_q="可选，如果你懂法语：法语读者会把「{phr}」读出来近似「{std}」。接近吗？"),
 "ja": dict(name="日本語", learner="日本語をまったく知らないフランス語話者",
  title="Melunga — ネイティブチェック、日本語の第一課",
  intro="語学アプリの一番最初のレッスンです。学習者は{learner}です。以下はすでにアプリに入っている内容で、自然に聞こえるかどうかだけ教えてください。各問一行で結構です。五分から十分で終わります。",
  scene="場面", you="学習者のセリフ", other="店員のセリフ", ph="フランス語話者向けの発音の目安",
  q=["全体として本物のカフェのやりとりに聞こえますか。違和感があればどこですか。",
     "学習者がまず「{g}」と言います。入ってきた客として自然ですか。",
     "「{o}」——この言い方で注文しますか。しないなら何と言いますか。",
     "**一番重要な質問です。** 「{r}」が単独で、「{m}」への完全な返事として出てきます。単独でも丁寧に聞こえますか。そっけなくなりませんか。",
     "そのあと「{p}」を別の文として言います。断った直後に自然ですか。",
     "店員のセリフは「{s1}」「{s2}」「{s3}」です。店員は実際にこう言いますか。",
     "古い、地域的、あるいは自分なら絶対言わない表現はありますか。"],
  extra="特に「結構です。」について教えてください。ミルクを断る返事として、丁寧に響きますか。それともきつく聞こえますか。「いいえ、大丈夫です。」のほうが自然でしょうか。",
  ph_q="任意です。フランス語が読める場合のみ：フランス語話者は「{std}」に近づけるために「{phr}」と読みます。近いですか。"),
 "ko": dict(name="한국어", learner="한국어를 전혀 모르는 프랑스어 사용자",
  title="Melunga — 원어민 검토, 한국어 첫 수업",
  intro="언어 학습 앱의 가장 첫 수업입니다. 학습자는 {learner}입니다. 아래 내용은 이미 앱에 들어 있으며, 자연스럽게 들리는지만 알려 주시면 됩니다. 한 줄씩 답해 주세요. 오 분에서 십 분이면 충분합니다.",
  scene="상황", you="학습자가 하는 말", other="직원이 하는 말", ph="프랑스어 독자를 위한 발음 근사",
  q=["전체가 실제 카페 대화처럼 들리나요? 아니라면 어디가 어색한가요?",
     "학습자가 먼저 「{g}」라고 인사합니다. 들어오는 손님으로서 자연스러운가요?",
     "「{o}」 — 이렇게 주문하시겠어요? 아니라면 어떻게 말하시겠어요?",
     "**가장 중요한 질문입니다.** 「{r}」가 「{m}」에 대한 완전한 대답으로 단독으로 나옵니다. 따로 떼어 놓아도 여전히 공손하게 들리나요, 아니면 퉁명스러운가요?",
     "그다음에 「{p}」를 별도 문장으로 말합니다. 거절한 직후에 자연스러운가요?",
     "직원의 말은 「{s1}」 「{s2}」 「{s3}」입니다. 직원이 실제로 이렇게 말하나요?",
     "구식이거나 지역적이거나, 본인이라면 절대 쓰지 않을 표현이 있나요?"],
  extra="특히 「괜찮아요.」를 봐 주세요. 사전에는 '괜찮다'는 뜻으로만 올라 있는데, 우유를 거절하는 대답으로 쓰였을 때 공손하게 들리나요? 「아니요, 괜찮습니다.」가 더 자연스러울까요?",
  ph_q="선택 사항이며 프랑스어를 읽으실 수 있는 경우에만: 프랑스어 사용자가 「{std}」에 가깝게 발음하려고 「{phr}」를 읽습니다. 비슷한가요?"),
 "fr": dict(name="Français", learner="un sinophone débutant complet en français",
  title="Melunga — relecture native, première leçon de français",
  intro="C'est la toute première leçon d'une application de langues. L'apprenant est {learner}. Tout ce qui suit existe déjà dans l'application ; nous avons seulement besoin de savoir si cela sonne juste. Une ligne par réponse suffit — cinq à dix minutes.",
  scene="La scène", you="L'APPRENANT DIT", other="LE SERVEUR DIT", ph="approximation en caractères chinois, pour lecteurs sinophones",
  q=["L'ensemble sonne-t-il comme un vrai café ? Sinon, qu'est-ce qui cloche ?",
     "L'apprenant salue en premier avec « {g} ». Naturel pour un client qui entre ?",
     "« {o} » — commanderiez-vous ainsi ? Sinon, que diriez-vous ?",
     "**La question clé.** « {r} » apparaît seul, comme réponse complète à « {m} ». Isolé, cela reste-t-il poli, ou devient-ce sec ?",
     "« {p} » est dit ensuite, en phrase séparée. Naturel juste après un refus ?",
     "Les répliques du serveur sont « {s1} », « {s2} », « {s3} ». Un serveur dirait-il vraiment cela ?",
     "Quelque chose de daté, de régional, ou que vous ne diriez simplement jamais ?"],
  extra=None,
  ph_q=None),
}

for p in d["pairs"]:
    st = p["studyLanguage"]
    cfg = L[st]
    ph = p["phrases"]
    learner = [x for x in ph if x["kind"] == "learner"]
    recv = [x for x in ph if x["kind"] == "received"]
    g, o, r, pr = learner[0], learner[1], learner[2], learner[3]
    s1, s2, s3 = recv[0], recv[1], recv[2]
    lines = []
    lines.append(f"# {cfg['title']}\n")
    lines.append(cfg["intro"].format(learner=cfg["learner"]) + "\n")
    lines.append(f"## {cfg['scene']}\n")
    lines.append(f"| | | {cfg['ph']} |")
    lines.append("|---|---|---|")
    for x in ph:
        who = cfg["you"] if x["kind"] == "learner" else cfg["other"]
        lines.append(f"| **{who}** | {x['study']} | `{x['phon']}` |")
    lines.append("")
    lines.append("---\n")
    f = dict(g=g["study"], o=o["study"], r=r["study"], p=pr["study"],
             m=s2["study"], s1=s1["study"], s2=s2["study"], s3=s3["study"])
    for i, q in enumerate(cfg["q"], 1):
        lines.append(f"**{i}.** {q.format(**f)}\n")
        lines.append("> \n")
    if cfg.get("extra"):
        lines.append(f"**{len(cfg['q'])+1}.** {cfg['extra']}\n")
        lines.append("> \n")
    if cfg.get("ph_q"):
        n = len(cfg["q"]) + (2 if cfg.get("extra") else 1)
        lines.append(f"**{n}.** {cfg['ph_q'].format(phr=o['phon'], std=o['study'])}\n")
        lines.append("> \n")
    path = os.path.join(OUT, f"relecture-{p['nativeLanguage']}-{st}.md")
    open(path, "w", encoding="utf-8").write("\n".join(lines))
    print(f"{path}  ({cfg['name']}, {len(cfg['q'])+(1 if cfg.get('extra') else 0)+(1 if cfg.get('ph_q') else 0)} questions)")

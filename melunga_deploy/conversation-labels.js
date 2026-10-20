/* Melunga — libellés d'interface du mode « Mes phrases » sur les contenus de conversation (lot D).
   window.ConversationLabels[nat] → libellés dans la langue maternelle (contrat lot B : clés level, model, loading, error, retry,
   missing, try, reveal, another, phrase, back, close, step, of, premium, reading, pinyin, kana, romanization) + clés des lots C/F.
   window.ConversationLabels.get(nat) → même objet avec repli fr.
   window.ConversationLabels.readingLabel(nat, study) → nom de l'aide de lecture (pinyin / hiragana / romanisation) ou null.
   window.ConversationLabels.levelTitle(nat, n) → titre du niveau n (1–10) ; levelGoal(nat, n) → objectif.
   Fichier séparé de construire.js (lot B, Codex) ; les clés existantes de UI[nat] dans construire.js restent valables. */
(function (root) {
  'use strict';
  var L = {
    fr: {
      /* contrat lot B (construire.js › BText) */ model: 'Situation', error: 'Impossible de charger ce contenu.', missing: 'Ce niveau n’est pas disponible.', try: 'À moi d’essayer →', phrase: 'Ma phrase', step: 'Étape', of: 'sur', premium: 'Premium', reading: 'Lecture', pinyin: 'Pinyin', kana: 'Kana', romanization: 'Romanisation',
      level: 'Niveau', levels: 'Niveaux', situation: 'Situation', example: 'Exemple', model: 'Phrase modèle', variants: 'Quatre façons de le dire', replaced: 'Le morceau qui change',
      listen: '🔊 Écouter', slow: '🐢 Lentement', translation: 'Traduction', pronunciation: 'Prononciation',
      stepDiscover: 'Découvrir', stepReplace: 'Remplacer', stepRecall: 'À moi d’essayer', stepConverse: 'Converser',
      tryIt: 'À moi d’essayer →', sayIt: 'Dire en {lang}', reveal: 'Voir la phrase', another: 'Une autre ↻', next: 'Suivant →', back: 'Retour', close: 'Fermer', done: 'Terminé ✓',
      recallPrompt: 'Comment dis-tu : « {native} » ?', hidden: '…', yourTurn: 'À toi de répondre', hideRole: 'Masquer un rôle', showAll: 'Tout afficher', roleA: 'Personne A', roleB: 'Personne B',
      dialogue: 'Dialogue', dialogues: 'Dialogues', turns: '{n} répliques', reuses: 'Phrases déjà vues',
      loading: 'Chargement…', loadError: 'Impossible de charger ce contenu.', retry: 'Réessayer', offline: 'Vérifie ta connexion, puis réessaie.',
      reviewNotice: 'Contenu en relecture linguistique : la prononciation écrite et certaines tournures peuvent encore évoluer.', phonHint: 'La prononciation écrite est une aide, pas un remplacement de l’audio.',
      progress: 'Niveau {n} sur {total}', seen: '{n} phrases vues', goal: 'Objectif', readiness: 'À la fin de ce niveau',
      langs: { fr: 'français', en: 'anglais', es: 'espagnol', zh: 'chinois', it: 'italien', ja: 'japonais', ko: 'coréen' },
      reading: { zh: 'Pinyin', ja: 'Hiragana', ko: 'Romanisation' },
      levelTitles: ['Premiers contacts', 'Préciser', 'Échanger', 'Mon quotidien', 'Raconter', 'Projets et propositions', 'Expliquer et comparer', 'Demander et négocier', 'Nuancer et résoudre', 'Tenir une conversation'],
      levelGoals: ['Saluer, se présenter, exprimer un besoin, commander simplement.', 'Préciser une quantité, une préférence, un lieu ou un moment.', 'Poser des questions, répondre et relancer un échange court.', 'Décrire son quotidien, ses habitudes et son entourage.', 'Raconter un événement passé et demander des nouvelles.', 'Parler de projets, proposer et organiser une activité.', 'Expliquer une raison, comparer et exprimer une préférence.', 'Demander poliment, exprimer une condition et négocier simplement.', 'Reformuler, nuancer et résoudre un imprévu.', 'Soutenir une conversation mêlant récit, opinion, argument et clarification.']
    },
    en: {
      /* contrat lot B (construire.js › BText) */ model: 'Situation', error: 'This content could not be loaded.', missing: 'This level is not available.', try: 'My turn →', phrase: 'My sentence', step: 'Step', of: 'of', premium: 'Premium', reading: 'Reading', pinyin: 'Pinyin', kana: 'Kana', romanization: 'Romanisation',
      level: 'Level', levels: 'Levels', situation: 'Situation', example: 'Example', model: 'Model sentence', variants: 'Four ways to say it', replaced: 'The part that changes',
      listen: '🔊 Listen', slow: '🐢 Slowly', translation: 'Translation', pronunciation: 'Pronunciation',
      stepDiscover: 'Discover', stepReplace: 'Replace', stepRecall: 'My turn', stepConverse: 'Converse',
      tryIt: 'My turn →', sayIt: 'Say it in {lang}', reveal: 'Show the sentence', another: 'Another one ↻', next: 'Next →', back: 'Back', close: 'Close', done: 'Done ✓',
      recallPrompt: 'How do you say: “{native}”?', hidden: '…', yourTurn: 'Your turn to answer', hideRole: 'Hide one role', showAll: 'Show everything', roleA: 'Person A', roleB: 'Person B',
      dialogue: 'Dialogue', dialogues: 'Dialogues', turns: '{n} lines', reuses: 'Sentences you already know',
      loading: 'Loading…', loadError: 'This content could not be loaded.', retry: 'Try again', offline: 'Check your connection, then try again.',
      reviewNotice: 'Content under linguistic review: written pronunciation and some phrasings may still change.', phonHint: 'Written pronunciation is a help, not a replacement for the audio.',
      progress: 'Level {n} of {total}', seen: '{n} sentences seen', goal: 'Goal', readiness: 'By the end of this level',
      langs: { fr: 'French', en: 'English', es: 'Spanish', zh: 'Chinese', it: 'Italian', ja: 'Japanese', ko: 'Korean' },
      reading: { zh: 'Pinyin', ja: 'Hiragana', ko: 'Romanisation' },
      levelTitles: ['First contacts', 'Being precise', 'Exchanging', 'My daily life', 'Telling what happened', 'Plans and suggestions', 'Explaining and comparing', 'Asking and negotiating', 'Nuancing and solving', 'Holding a conversation'],
      levelGoals: ['Greet, introduce yourself, express a need, order simply.', 'Specify a quantity, a preference, a place or a time.', 'Ask questions, answer and keep a short exchange going.', 'Describe your daily life, habits and the people around you.', 'Tell about a past event and ask for news.', 'Talk about plans, suggest and organise an activity.', 'Explain a reason, compare and express a preference.', 'Ask politely, express a condition and negotiate simply.', 'Rephrase, nuance and solve an unexpected problem.', 'Hold a conversation mixing narrative, opinion, argument and clarification.']
    },
    es: {
      /* contrat lot B (construire.js › BText) */ model: 'Situación', error: 'No se pudo cargar este contenido.', missing: 'Este nivel no está disponible.', try: 'Me toca →', phrase: 'Mi frase', step: 'Paso', of: 'de', premium: 'Premium', reading: 'Lectura', pinyin: 'Pinyin', kana: 'Kana', romanization: 'Romanización',
      level: 'Nivel', levels: 'Niveles', situation: 'Situación', example: 'Ejemplo', model: 'Frase modelo', variants: 'Cuatro maneras de decirlo', replaced: 'La parte que cambia',
      listen: '🔊 Escuchar', slow: '🐢 Despacio', translation: 'Traducción', pronunciation: 'Pronunciación',
      stepDiscover: 'Descubrir', stepReplace: 'Sustituir', stepRecall: 'Me toca', stepConverse: 'Conversar',
      tryIt: 'Me toca →', sayIt: 'Dilo en {lang}', reveal: 'Ver la frase', another: 'Otra ↻', next: 'Siguiente →', back: 'Volver', close: 'Cerrar', done: 'Hecho ✓',
      recallPrompt: '¿Cómo se dice: «{native}»?', hidden: '…', yourTurn: 'Te toca responder', hideRole: 'Ocultar un papel', showAll: 'Mostrar todo', roleA: 'Persona A', roleB: 'Persona B',
      dialogue: 'Diálogo', dialogues: 'Diálogos', turns: '{n} réplicas', reuses: 'Frases que ya conoces',
      loading: 'Cargando…', loadError: 'No se pudo cargar este contenido.', retry: 'Reintentar', offline: 'Comprueba tu conexión y vuelve a intentarlo.',
      reviewNotice: 'Contenido en revisión lingüística: la pronunciación escrita y algunas expresiones pueden cambiar.', phonHint: 'La pronunciación escrita es una ayuda, no sustituye al audio.',
      progress: 'Nivel {n} de {total}', seen: '{n} frases vistas', goal: 'Objetivo', readiness: 'Al final de este nivel',
      langs: { fr: 'francés', en: 'inglés', es: 'español', zh: 'chino', it: 'italiano', ja: 'japonés', ko: 'coreano' },
      reading: { zh: 'Pinyin', ja: 'Hiragana', ko: 'Romanización' },
      levelTitles: ['Primeros contactos', 'Precisar', 'Intercambiar', 'Mi día a día', 'Contar', 'Planes y propuestas', 'Explicar y comparar', 'Pedir y negociar', 'Matizar y resolver', 'Mantener una conversación'],
      levelGoals: ['Saludar, presentarse, expresar una necesidad, pedir algo sencillo.', 'Precisar una cantidad, una preferencia, un lugar o un momento.', 'Hacer preguntas, responder y continuar un intercambio corto.', 'Describir el día a día, los hábitos y el entorno.', 'Contar un hecho pasado y pedir noticias.', 'Hablar de planes, proponer y organizar una actividad.', 'Explicar una razón, comparar y expresar una preferencia.', 'Pedir con cortesía, expresar una condición y negociar.', 'Reformular, matizar y resolver un imprevisto.', 'Mantener una conversación con relato, opinión, argumento y aclaración.']
    },
    it: {
      /* contrat lot B (construire.js › BText) */ model: 'Situazione', error: 'Impossibile caricare questo contenuto.', missing: 'Questo livello non è disponibile.', try: 'Tocca a me →', phrase: 'La mia frase', step: 'Passo', of: 'di', premium: 'Premium', reading: 'Lettura', pinyin: 'Pinyin', kana: 'Kana', romanization: 'Romanizzazione',
      level: 'Livello', levels: 'Livelli', situation: 'Situazione', example: 'Esempio', model: 'Frase modello', variants: 'Quattro modi per dirlo', replaced: 'La parte che cambia',
      listen: '🔊 Ascolta', slow: '🐢 Lentamente', translation: 'Traduzione', pronunciation: 'Pronuncia',
      stepDiscover: 'Scoprire', stepReplace: 'Sostituire', stepRecall: 'Tocca a me', stepConverse: 'Conversare',
      tryIt: 'Tocca a me →', sayIt: 'Dillo in {lang}', reveal: 'Mostra la frase', another: 'Un’altra ↻', next: 'Avanti →', back: 'Indietro', close: 'Chiudi', done: 'Fatto ✓',
      recallPrompt: 'Come si dice: «{native}»?', hidden: '…', yourTurn: 'Tocca a te rispondere', hideRole: 'Nascondi un ruolo', showAll: 'Mostra tutto', roleA: 'Persona A', roleB: 'Persona B',
      dialogue: 'Dialogo', dialogues: 'Dialoghi', turns: '{n} battute', reuses: 'Frasi che conosci già',
      loading: 'Caricamento…', loadError: 'Impossibile caricare questo contenuto.', retry: 'Riprova', offline: 'Controlla la connessione, poi riprova.',
      reviewNotice: 'Contenuto in revisione linguistica: la pronuncia scritta e alcune espressioni possono ancora cambiare.', phonHint: 'La pronuncia scritta è un aiuto, non sostituisce l’audio.',
      progress: 'Livello {n} di {total}', seen: '{n} frasi viste', goal: 'Obiettivo', readiness: 'Alla fine di questo livello',
      langs: { fr: 'francese', en: 'inglese', es: 'spagnolo', zh: 'cinese', it: 'italiano', ja: 'giapponese', ko: 'coreano' },
      reading: { zh: 'Pinyin', ja: 'Hiragana', ko: 'Romanizzazione' },
      levelTitles: ['Primi contatti', 'Precisare', 'Scambiare', 'La mia giornata', 'Raccontare', 'Progetti e proposte', 'Spiegare e confrontare', 'Chiedere e negoziare', 'Sfumare e risolvere', 'Sostenere una conversazione'],
      levelGoals: ['Salutare, presentarsi, esprimere un bisogno, ordinare qualcosa di semplice.', 'Precisare una quantità, una preferenza, un luogo o un momento.', 'Fare domande, rispondere e rilanciare uno scambio breve.', 'Descrivere la propria giornata, le abitudini e le persone vicine.', 'Raccontare un fatto passato e chiedere notizie.', 'Parlare di progetti, proporre e organizzare un’attività.', 'Spiegare una ragione, confrontare ed esprimere una preferenza.', 'Chiedere con cortesia, esprimere una condizione e negoziare.', 'Riformulare, sfumare e risolvere un imprevisto.', 'Sostenere una conversazione con racconto, opinione, argomento e chiarimento.']
    },
    zh: {
      /* contrat lot B (construire.js › BText) */ model: '情境', error: '无法加载内容。', missing: '此级别暂不可用。', try: '我来试试 →', phrase: '我的句子', step: '步骤', of: '/', premium: '高级版', reading: '读音', pinyin: '拼音', kana: '假名', romanization: '罗马字',
      level: '级别', levels: '级别', situation: '场景', example: '例句', model: '模板句', variants: '四种说法', replaced: '可替换的部分',
      listen: '🔊 听', slow: '🐢 慢速', translation: '翻译', pronunciation: '发音',
      stepDiscover: '认识', stepReplace: '替换', stepRecall: '我来试试', stepConverse: '对话',
      tryIt: '我来试试 →', sayIt: '用{lang}说', reveal: '显示句子', another: '再来一句 ↻', next: '下一步 →', back: '返回', close: '关闭', done: '完成 ✓',
      recallPrompt: '怎么说：“{native}”？', hidden: '…', yourTurn: '轮到你回答', hideRole: '隐藏一个角色', showAll: '全部显示', roleA: 'A', roleB: 'B',
      dialogue: '对话', dialogues: '对话', turns: '{n} 句', reuses: '已学过的句子',
      loading: '加载中…', loadError: '无法加载该内容。', retry: '重试', offline: '请检查网络连接后重试。',
      reviewNotice: '内容仍在语言校对中：注音和部分表达可能会调整。', phonHint: '汉字注音只是辅助，请以音频为准。',
      progress: '第 {n} 级，共 {total} 级', seen: '已学 {n} 句', goal: '目标', readiness: '学完本级后',
      langs: { fr: '法语', en: '英语', es: '西班牙语', zh: '中文', it: '意大利语', ja: '日语', ko: '韩语' },
      reading: { zh: '拼音', ja: '平假名', ko: '罗马字' },
      levelTitles: ['初次接触', '说得更具体', '一问一答', '我的日常', '讲述经历', '计划与提议', '解释与比较', '请求与商量', '委婉与应变', '持续交谈'],
      levelGoals: ['打招呼、自我介绍、表达需要、简单点单。', '说明数量、偏好、地点或时间。', '提问、回答并延续简短的交流。', '描述日常、习惯和身边的人。', '讲述过去的事并询问近况。', '谈论计划，提议并安排活动。', '说明原因、比较并表达偏好。', '礼貌地请求、提出条件并简单商量。', '换一种说法、委婉表达并处理意外。', '把叙述、观点、论证和澄清结合起来持续交谈。']
    },
    ja: {
      /* contrat lot B (construire.js › BText) */ model: '場面', error: 'この内容を読み込めませんでした。', missing: 'このレベルは利用できません。', try: '自分で言ってみる →', phrase: '私の文', step: 'ステップ', of: '/', premium: 'プレミアム', reading: '読み方', pinyin: 'ピンイン', kana: 'かな', romanization: 'ローマ字',
      level: 'レベル', levels: 'レベル', situation: '場面', example: '例文', model: 'モデル文', variants: '4つの言い方', replaced: '入れ替わる部分',
      listen: '🔊 聞く', slow: '🐢 ゆっくり', translation: '訳', pronunciation: '発音',
      stepDiscover: '知る', stepReplace: '入れ替える', stepRecall: '自分で言う', stepConverse: '会話する',
      tryIt: '自分で言ってみる →', sayIt: '{lang}で言う', reveal: '文を見る', another: 'もう一つ ↻', next: '次へ →', back: '戻る', close: '閉じる', done: '完了 ✓',
      recallPrompt: '「{native}」は何と言いますか。', hidden: '…', yourTurn: 'あなたの番です', hideRole: '片方の役を隠す', showAll: 'すべて表示', roleA: 'A', roleB: 'B',
      dialogue: '会話', dialogues: '会話', turns: '{n} 行', reuses: '学んだ文',
      loading: '読み込み中…', loadError: 'この内容を読み込めませんでした。', retry: 'もう一度', offline: '通信状態を確認して、もう一度お試しください。',
      reviewNotice: '言語校閲中の内容です。読み方の表記や一部の表現は変わることがあります。', phonHint: '読み方の表記は補助です。音声を基準にしてください。',
      progress: 'レベル {n} / {total}', seen: '{n} 文を学習', goal: '目標', readiness: 'このレベルを終えると',
      langs: { fr: 'フランス語', en: '英語', es: 'スペイン語', zh: '中国語', it: 'イタリア語', ja: '日本語', ko: '韓国語' },
      reading: { zh: 'ピンイン', ja: 'ひらがな', ko: 'ローマ字' },
      levelTitles: ['はじめての会話', 'くわしく言う', 'やりとりする', '私の毎日', '出来事を話す', '予定と提案', '説明と比較', '頼む・交渉する', '言い換える・対処する', '会話を続ける'],
      levelGoals: ['あいさつ、自己紹介、必要なことを伝える、簡単に注文する。', '数量・好み・場所・時間を具体的に言う。', '質問し、答え、短いやりとりを続ける。', '毎日の生活、習慣、身近な人について話す。', '過去の出来事を話し、近況をたずねる。', '予定について話し、活動を提案して決める。', '理由を説明し、比べて、好みを伝える。', '丁寧に頼み、条件を伝え、簡単に交渉する。', '言い換え、やわらげ、予想外のことに対処する。', '語り・意見・理由・確認を交えて会話を続ける。']
    },
    ko: {
      /* contrat lot B (construire.js › BText) */ model: '상황', error: '이 내용을 불러올 수 없어요.', missing: '이 단계는 이용할 수 없어요.', try: '직접 말해 보기 →', phrase: '내 문장', step: '단계', of: '/', premium: '프리미엄', reading: '읽기', pinyin: '병음', kana: '가나', romanization: '로마자',
      level: '단계', levels: '단계', situation: '상황', example: '예문', model: '기본 문장', variants: '네 가지 표현', replaced: '바뀌는 부분',
      listen: '🔊 듣기', slow: '🐢 천천히', translation: '번역', pronunciation: '발음',
      stepDiscover: '알아보기', stepReplace: '바꿔 말하기', stepRecall: '직접 말하기', stepConverse: '대화하기',
      tryIt: '직접 말해 보기 →', sayIt: '{lang}로 말하기', reveal: '문장 보기', another: '하나 더 ↻', next: '다음 →', back: '뒤로', close: '닫기', done: '완료 ✓',
      recallPrompt: '“{native}”은(는) 어떻게 말할까요?', hidden: '…', yourTurn: '이제 당신이 대답할 차례예요', hideRole: '한 역할 숨기기', showAll: '모두 보기', roleA: 'A', roleB: 'B',
      dialogue: '대화', dialogues: '대화', turns: '{n}개 대사', reuses: '이미 배운 문장',
      loading: '불러오는 중…', loadError: '이 내용을 불러올 수 없어요.', retry: '다시 시도', offline: '연결 상태를 확인한 뒤 다시 시도해 주세요.',
      reviewNotice: '언어 감수 중인 내용입니다. 발음 표기와 일부 표현은 바뀔 수 있어요.', phonHint: '발음 표기는 보조 수단이며 음성이 기준입니다.',
      progress: '{total}단계 중 {n}단계', seen: '{n}개 문장 학습', goal: '목표', readiness: '이 단계를 마치면',
      langs: { fr: '프랑스어', en: '영어', es: '스페인어', zh: '중국어', it: '이탈리아어', ja: '일본어', ko: '한국어' },
      reading: { zh: '병음', ja: '히라가나', ko: '로마자' },
      levelTitles: ['첫 만남', '구체적으로 말하기', '주고받기', '나의 일상', '이야기하기', '계획과 제안', '설명과 비교', '부탁과 협상', '완곡하게, 유연하게', '대화 이어가기'],
      levelGoals: ['인사하고, 자기소개하고, 필요한 것을 말하고, 간단히 주문하기.', '수량, 선호, 장소, 시간을 구체적으로 말하기.', '질문하고 대답하며 짧은 대화 이어가기.', '일상, 습관, 주변 사람 묘사하기.', '지난 일을 이야기하고 안부 묻기.', '계획을 말하고 활동을 제안하고 정하기.', '이유를 설명하고 비교하며 선호 말하기.', '정중하게 부탁하고 조건을 말하며 간단히 협상하기.', '바꿔 말하고 완곡하게 표현하며 돌발 상황 해결하기.', '서술, 의견, 논거, 확인을 섞어 대화 이어가기.']
    }
  };
  function get(nat) { return L[nat] || L.fr; }
  function fmt(s, vars) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return vars && k in vars ? vars[k] : m; }); }
  function readingLabel(nat, study) { var r = get(nat).reading; return (r && r[study]) || null; }
  function levelTitle(nat, n) { return get(nat).levelTitles[n - 1] || ''; }
  function levelGoal(nat, n) { return get(nat).levelGoals[n - 1] || ''; }
  function langName(nat, code) { return get(nat).langs[code] || code; }
  /* window.ConversationLabels[nat] (contrat lot B : BText lit les clés directement) + aides non énumérées par langue. */
  var api = {};
  Object.keys(L).forEach(function (k) { api[k] = L[k]; });
  Object.defineProperties(api, { get: { value: get }, fmt: { value: fmt }, readingLabel: { value: readingLabel }, levelTitle: { value: levelTitle }, levelGoal: { value: levelGoal }, langName: { value: langName }, LANGS: { value: Object.keys(L) } });
  root.ConversationLabels = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof self !== 'undefined' ? self : this);

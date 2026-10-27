/* A separate web presentation; learning, billing and native runtime remain in the existing app. */
(function () {
  'use strict';
  if (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) return;
  document.documentElement.classList.add('melunga-web');
  const copy = {
  "fr": [
    "7 LANGUES · DES PHRASES DU QUOTIDIEN",
    "Apprends l’essentiel d’abord.<br><em>Prononce-le dans ta langue.</em>",
    "Des phrases utiles pour les situations de tous les jours. Lis la prononciation avec les repères de ta langue, puis écoute pour affiner les sons.",
    "Essayer gratuitement",
    "Comment ça marche",
    "Niveau 1 gratuit · sans carte bancaire",
    "Un exemple de la méthode",
    "AU QUOTIDIEN",
    "Écouter et comparer",
    "Phonétique et traduction de cet exemple : français.",
    "COMMENT ÇA MARCHE",
    "Écoute. Répète. Réutilise.",
    "Écoute",
    "Découvre une phrase utile et écoute sa prononciation.",
    "Répète",
    "Lis la phonétique, puis prononce la phrase à voix haute.",
    "Réutilise",
    "Retrouve les phrases dans tes révisions pour les garder en mémoire.",
    "CHOISIS TON ACCÈS",
    "Choisis l’accès qui te convient.",
    "Sur le site : paiement unique, sans reconduction automatique.",
    "Pour découvrir",
    "Niveau 1 gratuit",
    "Découvre la méthode et commence tes premières leçons, sans limite de temps.",
    "Pour aller plus loin",
    "Toutes les langues, L1 à L10",
    "Accès annuel",
    "Ou",
    "pour 30 jours",
    "Choisir mon accès",
    "J’ai déjà un compte",
    "Tarifs",
    "Conditions",
    "Confidentialité",
    "par an",
    "Méthode",
    "Audio indisponible pour le moment. Réessaie dans l’application.",
    "Niveau 1 complet, 7 langues",
    "Phonétique dans ta langue + audio",
    "Révisions intelligentes",
    "Tous les niveaux, L1 à L10",
    "Les 7 langues incluses",
    "Accès 30 jours · sans reconduction",
    "Accès 1 an · sans reconduction",
    "Économise {pct}",
    "Pratique toute l’année",
    "soit {m} / {unit}",
    "Choisir l’annuel",
    "Choisir le mensuel",
    "Lis la phonétique à voix haute."
  ],
  "en": [
    "7 LANGUAGES · EVERYDAY PHRASES",
    "Learn what matters first.<br><em>Pronounce it in your language.</em>",
    "Useful phrases for everyday situations. Read pronunciation using familiar sounds, then listen to refine how you say each phrase.",
    "Try for free",
    "How it works",
    "Level 1 free · no payment card",
    "An example of the method",
    "EVERYDAY LIFE",
    "Listen and compare",
    "This example uses French phonetic guidance and translation.",
    "HOW IT WORKS",
    "Listen. Repeat. Use.",
    "Listen",
    "Discover a useful phrase and listen to its pronunciation.",
    "Repeat",
    "Read the phonetic guidance, then say the phrase aloud.",
    "Use",
    "Revisit phrases in your reviews to help remember them.",
    "CHOOSE YOUR ACCESS",
    "Choose the access that suits you.",
    "On the website: one-time payment, no paid trial or automatic renewal.",
    "Discover",
    "Level 1, always free",
    "Discover the method and begin your first lessons, with no time limit.",
    "Go further",
    "All languages, levels 1–10",
    "Yearly access",
    "Or",
    "for 30 days",
    "Choose my access",
    "I already have an account",
    "Pricing",
    "Terms",
    "Privacy",
    "per year",
    "Method",
    "Audio is unavailable. Try again in the application.",
    "Full Level 1, 7 languages",
    "Phonetics in your language + audio",
    "Smart reviews",
    "All levels, L1 to L10",
    "All 7 languages included",
    "30-day access · no renewal",
    "1-year access · no renewal",
    "Save {pct}",
    "Practise all year",
    "that’s {m} / {unit}",
    "Choose yearly",
    "Choose monthly",
    "Read the French phonetic guide aloud."
  ],
  "es": [
    "7 IDIOMAS · FRASES DEL DÍA A DÍA",
    "Aprende primero lo esencial.<br><em>Pronúncialo en tu idioma.</em>",
    "Frases útiles para situaciones cotidianas. Lee la pronunciación con los sonidos de tu idioma y escucha para afinarla.",
    "Probar gratis",
    "Cómo funciona",
    "Nivel 1 gratis · sin tarjeta",
    "Un ejemplo del método",
    "VIDA COTIDIANA",
    "Escuchar y comparar",
    "Este ejemplo usa fonética y traducción para francófonos.",
    "CÓMO FUNCIONA",
    "Escucha. Repite. Utiliza.",
    "Escucha",
    "Descubre una frase útil y escucha su pronunciación.",
    "Repite",
    "Lee la ayuda fonética y di la frase en voz alta.",
    "Utiliza",
    "Vuelve a las frases en tus repasos para recordarlas.",
    "ELIGE TU ACCESO",
    "Elige el acceso que te convenga.",
    "En la web: pago único, sin prueba de pago ni renovación automática.",
    "Para descubrir",
    "Nivel 1 gratis",
    "Descubre el método y tus primeras lecciones, sin límite de tiempo.",
    "Para avanzar",
    "Todos los idiomas, niveles 1–10",
    "Acceso anual",
    "O",
    "por 30 días",
    "Elegir mi acceso",
    "Ya tengo una cuenta",
    "Precios",
    "Condiciones",
    "Privacidad",
    "al año",
    "Método",
    "Audio no disponible. Inténtalo en la aplicación.",
    "Nivel 1 completo, 7 idiomas",
    "Fonética en tu idioma + audio",
    "Repasos inteligentes",
    "Todos los niveles, L1 a L10",
    "Los 7 idiomas incluidos",
    "Acceso 30 días · sin renovación",
    "Acceso 1 año · sin renovación",
    "Ahorra {pct}",
    "Practica todo el año",
    "es decir {m} / {unit}",
    "Elegir anual",
    "Elegir mensual",
    "Lee en voz alta la guía fonética francesa."
  ],
  "zh": [
    "7 种语言 · 日常实用句子",
    "先学最常用的，<br><em>用你的母语读出来。</em>",
    "从日常生活中实用的句子开始。借助母语中熟悉的声音读出发音提示，再听音频，逐步调整发音。",
    "免费体验",
    "如何学习",
    "L1 免费 · 无需银行卡",
    "学习方法示例",
    "日常生活",
    "听音频并对照",
    "本示例的发音提示和翻译面向法语使用者。",
    "如何学习",
    "听。跟读。使用。",
    "听",
    "学习一个实用的句子，听它的发音。",
    "跟读",
    "借助发音提示，大声读出句子。",
    "使用",
    "在复习中重温句子，帮助记忆。",
    "选择使用方式",
    "选择适合你的使用方式。",
    "网站：一次性付款，无付费试用，不自动续费。",
    "探索",
    "L1 免费",
    "体验学习方法和最初的课程，没有时间限制。",
    "继续进阶",
    "所有语言，L1 至 L10",
    "年度权益",
    "或",
    "使用 30 天",
    "选择权益",
    "我已有账户",
    "价格",
    "条款",
    "隐私",
    "每年",
    "方法",
    "音频暂不可用，请在应用中重试。",
    "完整 L1 · 7 种语言",
    "母语注音 + 真人发音",
    "智能复习",
    "全部等级 L1–L10",
    "包含全部 7 种语言",
    "30 天权益 · 不自动续费",
    "1 年权益 · 不自动续费",
    "节省 {pct}",
    "全年练习",
    "相当于每{unit} {m}",
    "选择年度",
    "选择月度",
    "大声读出法语发音提示。"
  ],
  "it": [
    "7 LINGUE · FRASI DI OGNI GIORNO",
    "Impara prima l’essenziale.<br><em>Pronuncialo nella tua lingua.</em>",
    "Frasi utili per le situazioni di ogni giorno. Leggi la pronuncia con i suoni della tua lingua, poi ascolta per migliorarla.",
    "Prova gratis",
    "Come funziona",
    "Livello 1 gratis · senza carta",
    "Un esempio del metodo",
    "VITA QUOTIDIANA",
    "Ascolta e confronta",
    "Questo esempio usa fonetica e traduzione per francofoni.",
    "COME FUNZIONA",
    "Ascolta. Ripeti. Usa.",
    "Ascolta",
    "Scopri una frase utile e ascolta la sua pronuncia.",
    "Ripeti",
    "Leggi la guida fonetica e pronuncia la frase ad alta voce.",
    "Usa",
    "Ritrova le frasi nei ripassi per ricordarle.",
    "SCEGLI IL TUO ACCESSO",
    "Scegli l’accesso adatto a te.",
    "Sul sito: pagamento unico, senza prova a pagamento né rinnovo automatico.",
    "Per scoprire",
    "Livello 1 gratuito",
    "Scopri il metodo e le prime lezioni, senza limiti di tempo.",
    "Per progredire",
    "Tutte le lingue, livelli 1–10",
    "Accesso annuale",
    "Oppure",
    "per 30 giorni",
    "Scegli il mio accesso",
    "Ho già un account",
    "Prezzi",
    "Condizioni",
    "Privacy",
    "all’anno",
    "Metodo",
    "Audio non disponibile. Riprova nell’applicazione.",
    "Livello 1 completo, 7 lingue",
    "Fonetica nella tua lingua + audio",
    "Ripassi intelligenti",
    "Tutti i livelli, da L1 a L10",
    "Tutte le 7 lingue incluse",
    "Accesso 30 giorni · senza rinnovo",
    "Accesso 1 anno · senza rinnovo",
    "Risparmia {pct}",
    "Esercitati tutto l’anno",
    "cioè {m} / {unit}",
    "Scegli annuale",
    "Scegli mensile",
    "Leggi ad alta voce la guida fonetica francese."
  ],
  "ja": [
    "7言語 · 毎日使える文",
    "まずは本当に使う表現を。<br><em>発音は母語で読める。</em>",
    "毎日の場面で使える文から。母語でなじみのある音を手がかりに読み、音声を聞いて発音を確かめましょう。",
    "無料で試す",
    "学習の流れ",
    "L1 無料 · カード不要",
    "学習方法の例",
    "日常会話",
    "音声を聞いて比べる",
    "この例の発音表記と訳はフランス語話者向けです。",
    "学習の流れ",
    "聞く。繰り返す。使う。",
    "聞く",
    "実用的な文とその発音を学びます。",
    "繰り返す",
    "発音ガイドを読み、声に出して練習します。",
    "使う",
    "復習で文を振り返り、記憶につなげます。",
    "アクセスを選ぶ",
    "自分に合ったアクセスを選ぼう。",
    "ウェブ：1回限りのお支払い。有料お試し・自動更新なし。",
    "まずは体験",
    "L1 は無料",
    "時間制限なく、学習方法と最初のレッスンを体験。",
    "さらに進む",
    "全言語、L1〜L10",
    "年間アクセス",
    "または",
    "30日間",
    "アクセスを選ぶ",
    "アカウントを持っています",
    "料金",
    "利用規約",
    "プライバシー",
    "年額",
    "学習方法",
    "音声は現在利用できません。アプリでお試しください。",
    "レベル1すべて · 7言語",
    "母語での発音表記 + 音声",
    "スマート復習",
    "全レベル L1〜L10",
    "7言語すべて含む",
    "30日間 · 自動更新なし",
    "1年間 · 自動更新なし",
    "{pct} お得",
    "一年を通して練習",
    "{unit}あたり {m}",
    "年間を選ぶ",
    "月間を選ぶ",
    "フランス語話者向けの発音表記を声に出して読もう。"
  ],
  "ko": [
    "7개 언어 · 일상에서 쓰는 문장",
    "가장 많이 쓰는 표현부터.<br><em>발음은 모국어로 읽어요.</em>",
    "일상에서 쓰는 유용한 문장부터 배워요. 모국어의 익숙한 소리를 바탕으로 발음을 읽고, 음성을 들으며 다듬어 보세요.",
    "무료로 체험하기",
    "학습 방법",
    "L1 무료 · 카드 불필요",
    "학습 방법 예시",
    "일상 회화",
    "듣고 비교하기",
    "이 예시의 발음 안내와 번역은 프랑스어 사용자를 위한 것입니다.",
    "학습 방법",
    "듣고, 반복하고, 사용해요.",
    "듣기",
    "실용적인 문장과 발음을 배워요.",
    "반복하기",
    "발음 안내를 읽고 문장을 소리 내어 말해요.",
    "사용하기",
    "복습에서 문장을 다시 만나며 기억해요.",
    "이용권 선택",
    "나에게 맞는 이용권을 선택하세요.",
    "웹: 1회 결제, 유료 체험 및 자동 갱신 없음.",
    "먼저 체험",
    "L1 무료",
    "시간 제한 없이 학습법과 첫 수업을 체험하세요.",
    "더 나아가기",
    "모든 언어, L1~L10",
    "연간 이용권",
    "또는",
    "30일 이용",
    "이용권 선택",
    "이미 계정이 있어요",
    "요금",
    "이용약관",
    "개인정보",
    "연간",
    "학습 방법",
    "지금은 음성을 사용할 수 없습니다. 앱에서 다시 시도하세요.",
    "레벨 1 전체 · 7개 언어",
    "모국어 발음 표기 + 음성",
    "스마트 복습",
    "모든 레벨 L1–L10",
    "7개 언어 모두 포함",
    "30일 이용 · 자동 갱신 없음",
    "1년 이용 · 자동 갱신 없음",
    "{pct} 절약",
    "일 년 내내 연습",
    "{unit} {m} 꼴",
    "연간 선택",
    "월간 선택",
    "프랑스어 발음 안내를 소리 내어 읽어 보세요."
  ]
};
  const languageNames = {fr:'Français',en:'English',es:'Español',zh:'中文',it:'Italiano',ja:'日本語',ko:'한국어'};
  const languageControlLabels = {
    fr:['Langue du site','Langue de l’exemple'],en:['Website language','Example language'],
    es:['Idioma del sitio','Idioma del ejemplo'],zh:['网站语言','示例语言'],
    it:['Lingua del sito','Lingua dell’esempio'],ja:['サイトの言語','例文の言語'],
    ko:['사이트 언어','예문 언어']
  };
  const exampleNames = {
    fr:{en:'Anglais',es:'Espagnol',zh:'Chinois'},en:{en:'English',es:'Spanish',zh:'Chinese'},
    es:{en:'Inglés',es:'Español',zh:'Chino'},zh:{en:'英语',es:'西班牙语',zh:'中文'},
    it:{en:'Inglese',es:'Spagnolo',zh:'Cinese'},ja:{en:'英語',es:'スペイン語',zh:'中国語'},
    ko:{en:'영어',es:'스페인어',zh:'중국어'}
  };
  const flag = code => `<span class="home-flag home-flag-${code}" aria-hidden="true"></span>`;
  const root = document.createElement('main');
  root.className = 'desktop-home';
  const desktopChoices = window.matchMedia('(min-width:960px)');
  const languageStep = document.querySelector('[data-screen="language"]');
  const courseLaunch = languageStep.querySelector('[data-launch-course]');
  const studyChoices = Array.from(languageStep.querySelectorAll('[data-study-language]'));
  studyChoices.forEach(function (choice) {
    const flag = document.createElement('span');
    flag.className = 'desktop-study-flag home-flag home-flag-' + choice.dataset.studyLanguage;
    flag.setAttribute('aria-hidden','true');
    choice.querySelector('.flag').append(flag);
  });
  function renderLanguageChoice() {
    const locale = typeof currentAppLocale === 'string' ? currentAppLocale : 'fr';
    const text = desktopChoices.matches && selectedAccess === 'free' ? (copy[locale] || copy.fr)[3] : window.MelungaCourseI18n.t(locale,'Démarrer ma première leçon');
    if (courseLaunch.textContent !== text) courseLaunch.textContent = text;
    studyChoices.forEach(function (choice) {
      choice.setAttribute('aria-pressed',String(!choice.hidden&&choice.classList.contains('selected')));
    });
  }
  const originalGo = window.go;
  window.go = function () { const result = originalGo.apply(this,arguments); renderLanguageChoice(); return result; };
  desktopChoices.addEventListener('change',renderLanguageChoice);
  document.addEventListener('click',function (event) {
    if (event.target.closest('[data-study-language]')) renderLanguageChoice();
  });
  const tr = i => `<span data-dh-text="${i}"></span>`;
  root.innerHTML = `
    <header class="dh-container dh-header"><a class="dh-brand" href="#"><img src="assets/melunga-logo.png" alt="">Melunga</a><nav class="dh-nav" aria-label="Melunga"><a href="#dh-method">${tr(35)}</a><a href="#dh-pricing">${tr(31)}</a><label class="dh-language-picker"><span class="home-flag home-flag-fr" data-dh-native-flag aria-hidden="true"></span><select class="dh-language" aria-label="Langue du site">${Object.entries(languageNames).map(([code,name])=>`<option value="${code}">${name}</option>`).join('')}</select><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 8 5 5 5-5"/></svg></label><button type="button" class="dh-button dh-small dh-primary dh-header-free" data-dh-free>${tr(3)}</button><button class="dh-button dh-small dh-outline" data-go="signin">${tr(30)}</button></nav></header>
    <div class="dh-container">
      <section class="dh-hero" aria-labelledby="dh-title"><div><p class="dh-kicker">${tr(0)}</p><h1 class="dh-title" id="dh-title"></h1><p class="dh-intro">${tr(2)}</p><div class="dh-actions"><button class="dh-button dh-primary" data-dh-free>${tr(3)} <span aria-hidden="true">&rarr;</span></button><a class="dh-button dh-outline" href="#dh-method">${tr(4)}</a></div><p class="dh-fine"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 10 3 3 7-7"/></svg>${tr(5)}</p></div>
      <aside class="dh-example"><div class="dh-example-top"><b>${tr(6)}</b><span>L1</span></div><div class="dh-tabs" role="group" aria-label="Langue de l’exemple"><button class="dh-tab" data-dh-example="en" aria-pressed="true">${flag('en')}<span data-dh-example-name="en">English</span></button><button class="dh-tab" data-dh-example="es" aria-pressed="false">${flag('es')}<span data-dh-example-name="es">Español</span></button><button class="dh-tab" data-dh-example="zh" aria-pressed="false">${flag('zh')}<span data-dh-example-name="zh">中文</span></button></div><div class="dh-card"><p class="dh-card-tag">${tr(7)}</p><p class="dh-phrase" lang="en"></p><div class="dh-phonetic-area"><p class="dh-trial-prompt"><span class="dh-action-step">1</span>${tr(49)}</p><div class="dh-phonetic-row"><p class="dh-phonetic" lang="fr"></p><button type="button" class="dh-ear" data-dh-listen aria-label="Écouter et comparer"><span aria-hidden="true">👂</span></button></div></div><p class="dh-translation" lang="fr"></p><button type="button" class="dh-listen" data-dh-listen><span class="dh-action-step">2</span>${tr(8)}</button></div><p class="dh-example-note" aria-live="polite">${tr(9)}</p></aside></section>
      <div class="dh-languages" aria-label="7 languages">${Object.entries(languageNames).map(([code,name])=>`<span class="dh-language-tag">${flag(code)}${name}</span>`).join('')}</div>
      <section class="dh-method" id="dh-method" aria-labelledby="dh-method-title"><p class="dh-section-label">${tr(10)}</p><h2 class="dh-section-title" id="dh-method-title">${tr(11)}</h2><div class="dh-steps">${[12,14,16].map((i,n)=>`<article class="dh-step"><span>0${n+1}</span><h3>${tr(i)}</h3><p>${tr(i+1)}</p></article>`).join('')}</div></section>
      <section class="dh-pricing-wrap" id="dh-pricing" aria-labelledby="dh-pricing-title">
        <div class="dh-pricing-head"><p class="dh-section-label">${tr(18)}</p><h2 class="dh-section-title" id="dh-pricing-title">${tr(19)}</h2><p class="dh-pricing-note">${tr(20)}</p></div>
        <div class="dh-pricing-grid">
          <article class="dh-plan"><p class="dh-plan-label">${tr(21)}</p><h3>${tr(22)}</h3><div class="dh-plan-price"><strong>0 €</strong></div><p class="dh-plan-sub">${tr(23)}</p><ul class="dh-features"><li>${tr(37)}</li><li>${tr(38)}</li><li>${tr(39)}</li></ul><button class="dh-button dh-outline" data-dh-free>${tr(3)}</button></article>
          <article class="dh-plan"><p class="dh-plan-label" data-dh-monthly-label></p><h3 data-dh-text="42"></h3><div class="dh-plan-price"><strong data-dh-monthly></strong><span data-dh-text="28"></span></div><p class="dh-plan-sub">&nbsp;</p><ul class="dh-features"><li>${tr(40)}</li><li>${tr(41)}</li><li>${tr(38)}</li></ul><button class="dh-button dh-outline" data-dh-plan="monthly">${tr(48)}</button></article>
          <article class="dh-plan dh-paid dh-best"><span class="dh-best-badge">${tr(45)}</span><p class="dh-plan-label" data-dh-yearly-label></p><h3 data-dh-text="43"></h3><div class="dh-plan-price"><strong data-dh-annual></strong><span data-dh-text="34"></span></div><p class="dh-plan-sub"><span data-dh-equivalent></span> <em class="dh-save" data-dh-save></em></p><ul class="dh-features"><li>${tr(40)}</li><li>${tr(41)}</li><li>${tr(38)}</li></ul><button class="dh-button dh-primary" data-dh-plan="yearly">${tr(47)}</button></article>
        </div>
      </section>
      <footer class="dh-footer"><span>© Melunga</span><div><a href="terms.html">${tr(32)}</a><a href="privacy.html">${tr(33)}</a><a href="app.html">Melunga</a></div></footer>
    </div>`;
  document.body.prepend(root);
  // Exemples tirés du deck (phrases complètes, phonétique « pf » réelle des cartes).
  const samples = {
    en: {text:'Can you help me?',phonetic:'kan you HÈLP mi',fr:'Tu peux m’aider ?',voice:'en-GB-Wavenet-C',code:'en-GB'},
    es: {text:'Necesito ayuda.',phonetic:'né-sé-SSI-to a-YOU-da',fr:'J’ai besoin d’aide.',voice:'es-ES-Wavenet-F',code:'es-ES'},
    zh: {text:'你能帮我吗？',phonetic:'ni neung bang ouo ma ?',fr:'Tu peux m’aider ?',voice:'cmn-CN-Wavenet-A',code:'cmn-CN'}
  };
  let example = 'en', audio = null, audioTimer = null, audioRun = 0;
  function stopAudio() {
    audioRun += 1;
    clearTimeout(audioTimer);
    if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); audio = null; }
  }
  function renderSample() {
    stopAudio();
    root.querySelector('.dh-phrase').textContent = samples[example].text;
    root.querySelector('.dh-phrase').lang = example;
    root.querySelector('.dh-phonetic').textContent = samples[example].phonetic;
    root.querySelector('.dh-translation').textContent = samples[example].fr;
    root.querySelectorAll('[data-dh-example]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.dhExample === example)));
  }
  function render() {
    renderLanguageChoice();
    const locale = typeof currentAppLocale === 'string' ? currentAppLocale : 'fr';
    const t = copy[locale] || copy.fr;
    root.querySelectorAll('[data-dh-text]').forEach(el => { el.textContent = t[Number(el.dataset.dhText)]; });
    root.querySelector('#dh-title').innerHTML = t[1]; // Static, owned translation markup only.
    root.querySelector('.dh-language').value = locale;
    const controlLabels = languageControlLabels[locale] || languageControlLabels.fr;
    root.querySelector('.dh-language').setAttribute('aria-label', controlLabels[0]);
    root.querySelector('.dh-tabs').setAttribute('aria-label', controlLabels[1]);
    root.querySelector('[data-dh-native-flag]').className = 'home-flag home-flag-' + (languageNames[locale] ? locale : 'fr');
    root.querySelectorAll('[data-dh-example-name]').forEach(el => { el.textContent = (exampleNames[locale] || exampleNames.fr)[el.dataset.dhExampleName]; });
    root.querySelectorAll('[data-dh-listen]').forEach(el => { el.setAttribute('aria-label', t[8]); });
    const pt = (typeof premiumTranslations !== 'undefined' && premiumTranslations[locale]) || {};
    root.querySelector('[data-dh-yearly-label]').textContent = pt.yearly || 'Annuel';
    root.querySelector('[data-dh-monthly-label]').textContent = pt.monthly || 'Mensuel';
    if (typeof currentPriceMarket !== 'undefined') {
      root.querySelector('[data-dh-annual]').textContent = currentPriceMarket.yearly;
      root.querySelector('[data-dh-monthly]').textContent = currentPriceMarket.monthly;
      const unit = {fr:'mois',en:'month',es:'mes',zh:'月',it:'mese',ja:'月',ko:'월'}[locale] || 'mois';
      root.querySelector('[data-dh-equivalent]').textContent = currentPriceMarket.yearlyMonthly
        ? t[46].replace('{m}', currentPriceMarket.yearlyMonthly).replace('{unit}', unit) : '';
      const num = v => parseFloat(String(v).replace(/\s/g,'').replace(',','.').replace(/[^\d.]/g,''));
      const m = num(currentPriceMarket.monthly), y = num(currentPriceMarket.yearly);
      const pct = (m > 0 && y > 0) ? Math.round((1 - y / (12 * m)) * 100) : 0;
      root.querySelector('[data-dh-save]').textContent = pct > 0 ? t[44].replace('{pct}', pct + ' %') : '';
    }
  }
  // Reuse the existing country and language decisions, including asynchronous geolocation.
  for (const name of ['applyCountryPricing','applyAppLanguage']) {
    const original = window[name];
    window[name] = function () { const result = original.apply(this, arguments); render(); return result; };
  }
  root.querySelector('.dh-language').addEventListener('change', function () {
    const option = document.querySelector(`[data-app-language="${this.value}"]`);
    applyAppLanguage(this.value, option ? option.dataset.appLanguageLabel : this.value);
  });
  root.addEventListener('click', function (e) {
    const planBtn = e.target.closest('[data-dh-plan]');
    if (planBtn) {
      const choice = document.querySelector(`.screen[data-screen="premium"] [data-plan="${planBtn.dataset.dhPlan}"]`);
      if (choice) choice.click();
      const goPremium = document.querySelector('.screen[data-screen="method"] [data-go="premium"]');
      if (goPremium) goPremium.click(); else if (typeof go === 'function') go('premium');
      return;
    }
    if (e.target.closest('[data-dh-free]')) { selectedAccess = 'free'; go('language'); }
    const tab = e.target.closest('[data-dh-example]');
    if (tab) { example = tab.dataset.dhExample; renderSample(); render(); }
    if (e.target.closest('[data-go]')) stopAudio();
    if (e.target.closest('[data-dh-listen]')) {
      stopAudio();
      const run = audioRun, s = samples[example];
      const sources = [`/.netlify/functions/tts?voice=${s.voice}&lang=${s.code}&text=${encodeURIComponent(s.text)}`, `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${example === 'zh' ? 'zh-CN' : example}&q=${encodeURIComponent(s.text)}`];
      function attempt(i) {
        if (run !== audioRun) return;
        if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); audio = null; }
        clearTimeout(audioTimer);
        if (i >= sources.length) { root.querySelector('.dh-example-note').textContent = (copy[currentAppLocale] || copy.fr)[36]; return; }
        let advanced = false;
        const next = () => { if (advanced || run !== audioRun) return; advanced = true; attempt(i + 1); };
        const candidate = new Audio(sources[i]); audio = candidate;
        candidate.onerror = next;
        candidate.onplaying = () => clearTimeout(audioTimer);
        audioTimer = setTimeout(next,5000);
        const playing = candidate.play(); if (playing && playing.catch) playing.catch(next);
      }
      attempt(0);
    }
  });
  window.addEventListener('pagehide',stopAudio);
  window.matchMedia('(min-width:960px)').addEventListener('change',stopAudio);
  renderSample(); render();
})();

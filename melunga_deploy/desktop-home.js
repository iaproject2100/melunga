/* A separate web presentation; learning, billing and native runtime remain in the existing app. */
(function () {
  'use strict';
  if (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) return;
  document.documentElement.classList.add('melunga-web');
  const copy = {
  "fr": [
    "7 LANGUES · LES 80 % QUI COMPTENT",
    "Apprends l’essentiel d’abord.<br><em>Prononce-le dans ta langue.</em>",
    "80 % d’une langue tient dans ses mots les plus utilisés : on t’apprend exactement ceux-là. La prononciation est écrite dans ta langue — zéro symbole bizarre à déchiffrer.",
    "Commencer gratuitement",
    "Comment ça marche",
    "Niveau 1 gratuit · sans carte bancaire",
    "Essaie avec une première phrase",
    "AU QUOTIDIEN",
    "Écouter la phrase",
    "La phonétique en français t’aide à te lancer. Écoute ensuite la phrase pour affiner ta prononciation.",
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
    "Audio indisponible pour le moment. Réessaie dans l’application."
  ],
  "en": [
    "7 LANGUAGES · THE 80% THAT MATTERS",
    "Learn what matters first.<br><em>Pronounce it in your language.</em>",
    "80% of a language is its most-used words: we teach you exactly those. Pronunciation is written in your own language — no weird symbols to decode.",
    "Start for free",
    "How it works",
    "Level 1 free · no payment card",
    "Try a first phrase",
    "EVERYDAY LIFE",
    "Listen to the phrase",
    "This example uses French phonetic guidance. Listen to refine your pronunciation.",
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
    "Audio is unavailable. Try again in the application."
  ],
  "es": [
    "7 IDIOMAS · EL 80 % QUE IMPORTA",
    "Aprende primero lo esencial.<br><em>Pronúncialo en tu idioma.</em>",
    "El 80 % de un idioma está en sus palabras más usadas: te enseñamos exactamente esas. La pronunciación está escrita en tu idioma, sin símbolos raros que descifrar.",
    "Empezar gratis",
    "Cómo funciona",
    "Nivel 1 gratis · sin tarjeta",
    "Prueba una primera frase",
    "VIDA COTIDIANA",
    "Escuchar la frase",
    "Este ejemplo usa fonética para francófonos. Escucha para mejorar tu pronunciación.",
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
    "Audio no disponible. Inténtalo en la aplicación."
  ],
  "zh": [
    "7 种语言 · 最重要的 80%",
    "先学最常用的，<br><em>用你的母语读出来。</em>",
    "一门语言 80% 都在最常用的词里，我们只教这些。发音直接用你的母语标注，无需破译奇怪的符号。",
    "免费开始",
    "如何学习",
    "L1 免费 · 无需银行卡",
    "试试第一个句子",
    "日常生活",
    "听句子",
    "本示例使用面向法语使用者的发音提示。听录音来改善发音。",
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
    "音频暂不可用，请在应用中重试。"
  ],
  "it": [
    "7 LINGUE · L’80% CHE CONTA",
    "Impara prima l’essenziale.<br><em>Pronuncialo nella tua lingua.</em>",
    "L’80% di una lingua sta nelle sue parole più usate: ti insegniamo esattamente quelle. La pronuncia è scritta nella tua lingua, zero simboli strani da decifrare.",
    "Inizia gratis",
    "Come funziona",
    "Livello 1 gratis · senza carta",
    "Prova una prima frase",
    "VITA QUOTIDIANA",
    "Ascolta la frase",
    "Questo esempio usa la fonetica per francofoni. Ascolta per migliorare la pronuncia.",
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
    "Audio non disponibile. Riprova nell’applicazione."
  ],
  "ja": [
    "7言語 · 大切な80%",
    "まずは本当に使う表現を。<br><em>発音は母語で読める。</em>",
    "言語の80%は最もよく使われる言葉に含まれます。それだけを教えます。発音はあなたの母語で表記、不思議な記号は一切なし。",
    "無料で始める",
    "学習の流れ",
    "L1 無料 · カード不要",
    "最初の文を試す",
    "日常会話",
    "文を聞く",
    "この例はフランス語話者向けの発音表記です。音声を聞いて発音を磨きましょう。",
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
    "音声は現在利用できません。アプリでお試しください。"
  ],
  "ko": [
    "7개 언어 · 중요한 80%",
    "가장 많이 쓰는 표현부터.<br><em>발음은 모국어로 읽어요.</em>",
    "언어의 80%는 가장 자주 쓰는 말에 담겨 있어요. 그것만 가르쳐 드려요. 발음은 당신의 모국어로 표기, 이상한 기호는 전혀 없어요.",
    "무료로 시작",
    "학습 방법",
    "L1 무료 · 카드 불필요",
    "첫 문장 체험하기",
    "일상 회화",
    "문장 듣기",
    "이 예시는 프랑스어 사용자를 위한 발음 안내입니다. 음성을 듣고 발음을 익히세요.",
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
    "지금은 음성을 사용할 수 없습니다. 앱에서 다시 시도하세요."
  ]
};
  const root = document.createElement('main');
  root.className = 'desktop-home';
  const tr = i => `<span data-dh-text="${i}"></span>`;
  root.innerHTML = `
    <header class="dh-container dh-header"><a class="dh-brand" href="#"><img src="assets/melunga-logo.png" alt="">Melunga</a><nav class="dh-nav" aria-label="Melunga"><a href="#dh-method">${tr(35)}</a><a href="#dh-pricing">${tr(31)}</a><select class="dh-language" aria-label="Language / Langue"><option value="fr">FR Français</option><option value="en">EN English</option><option value="es">ES Español</option><option value="zh">中文</option><option value="it">IT Italiano</option><option value="ja">日本語</option><option value="ko">한국어</option></select><button class="dh-button dh-small dh-outline" data-go="signin">${tr(30)}</button></nav></header>
    <div class="dh-container">
      <section class="dh-hero" aria-labelledby="dh-title"><div><p class="dh-kicker">${tr(0)}</p><h1 class="dh-title" id="dh-title"></h1><p class="dh-intro">${tr(2)}</p><div class="dh-actions"><button class="dh-button dh-primary" data-dh-free>${tr(3)} <span aria-hidden="true">&rarr;</span></button><a class="dh-button dh-outline" href="#dh-method">${tr(4)}</a></div><p class="dh-fine">${tr(5)}</p></div>
      <aside class="dh-example"><div class="dh-example-top"><b>${tr(6)}</b><span>L1</span></div><div class="dh-tabs" role="group" aria-label="Exemples / Examples"><button class="dh-tab" data-dh-example="en" aria-pressed="true">English</button><button class="dh-tab" data-dh-example="es" aria-pressed="false">Español</button><button class="dh-tab" data-dh-example="zh" aria-pressed="false">中文</button></div><div class="dh-card"><p class="dh-card-tag">${tr(7)}</p><p class="dh-phrase" lang="en"></p><p class="dh-phonetic" lang="fr"></p><p class="dh-translation" lang="fr"></p><button class="dh-listen" data-dh-listen><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM17 8a6 6 0 0 1 0 8M20 5a10 10 0 0 1 0 14"/></svg>${tr(8)}</button></div><p class="dh-example-note" aria-live="polite">${tr(9)}</p></aside></section>
      <div class="dh-languages" aria-label="7 languages"><span>Français</span><span>English</span><span>Español</span><span>中文</span><span>Italiano</span><span>日本語</span><span>한국어</span></div>
      <section class="dh-method" id="dh-method" aria-labelledby="dh-method-title"><p class="dh-section-label">${tr(10)}</p><h2 class="dh-section-title" id="dh-method-title">${tr(11)}</h2><div class="dh-steps">${[12,14,16].map((i,n)=>`<article class="dh-step"><span>0${n+1}</span><h3>${tr(i)}</h3><p>${tr(i+1)}</p></article>`).join('')}</div></section>
      <section class="dh-pricing-wrap" id="dh-pricing" aria-labelledby="dh-pricing-title"><div class="dh-pricing-head"><div><p class="dh-section-label">${tr(18)}</p><h2 class="dh-section-title" id="dh-pricing-title">${tr(19)}</h2></div><p>${tr(20)}</p></div><div class="dh-pricing-grid"><article class="dh-plan"><p class="dh-plan-label">${tr(21)}</p><h3>${tr(22)}</h3><p>${tr(23)}</p><button class="dh-button dh-outline" data-dh-free>${tr(3)}</button></article><article class="dh-plan dh-paid"><p class="dh-plan-label">${tr(24)}</p><h3>${tr(25)}</h3><div class="dh-price"><span data-dh-annual></span> <small>${tr(34)}</small></div><div class="dh-alt-price">${tr(27)} <span data-dh-monthly></span> ${tr(28)}</div><button class="dh-button dh-primary" data-go="premium">${tr(29)}</button></article></div></section>
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
    const locale = typeof currentAppLocale === 'string' ? currentAppLocale : 'fr';
    const t = copy[locale] || copy.fr;
    root.querySelectorAll('[data-dh-text]').forEach(el => { el.textContent = t[Number(el.dataset.dhText)]; });
    root.querySelector('#dh-title').innerHTML = t[1]; // Static, owned translation markup only.
    root.querySelector('.dh-language').value = locale;
    if (typeof currentPriceMarket !== 'undefined') {
      root.querySelector('[data-dh-annual]').textContent = currentPriceMarket.yearly;
      root.querySelector('[data-dh-monthly]').textContent = currentPriceMarket.monthly;
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

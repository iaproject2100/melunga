/* Melunga — mode « Construire »
 * À partir d'une STRUCTURE (Quiero, Tengo que…), d'un TEMPS et d'une ACTION, l'apprenant
 * assemble une phrase complète, lit sa phonétique dans sa langue et l'écoute.
 * Chaque brique porte sa propre phonétique : la phrase hérite de la concaténation.
 * Données disponibles : espagnol (es) pour lecteurs francophones (pf).
 * Dépend des globales de app.html : lang, nat, speak(), unlockAudio().
 */
(function () {
  'use strict';

  /* ---------- Données ---------- */
  var CONSTRUIRE = {
    es: {
      tenses: ['pres', 'pas', 'fut', 'cond'],
      structures: [
        { id: 'quiero', label: 'Quiero…', takes: 'inf',
          es: { pres: ['Quiero', 'KIÉ-ro'], pas: ['Quería', 'ké-RI-a'], fut: ['Querré', 'ké-RRÉ'], cond: ['Quisiera', 'ki-SSIÉ-ra'] },
          fr: { pres: 'je veux', pas: 'je voulais', fut: 'je voudrai', cond: 'je voudrais' } },
        { id: 'necesito', label: 'Necesito…', takes: 'inf',
          es: { pres: ['Necesito', 'né-sé-SSI-to'], pas: ['Necesitaba', 'né-sé-ssi-TA-ba'], fut: ['Necesitaré', 'né-sé-ssi-ta-RÉ'], cond: ['Necesitaría', 'né-sé-ssi-ta-RI-a'] },
          fr: { pres: "j'ai besoin de", pas: "j'avais besoin de", fut: "j'aurai besoin de", cond: "j'aurais besoin de" } },
        { id: 'voy_a', label: 'Voy a…', takes: 'inf',
          es: { pres: ['Voy a', 'BOY a'], pas: ['Iba a', 'I-ba a'], fut: ['Iré a', 'i-RÉ a'], cond: ['Iría a', 'i-RI-a a'] },
          fr: { pres: 'je vais', pas: "j'allais", fut: "j'irai", cond: "j'irais" } },
        { id: 'puedes', label: '¿Puedes…?', takes: 'inf', question: true, tu: true,
          es: { pres: ['¿Puedes', 'POUÉ-dés'], pas: ['¿Podías', 'po-DI-as'], fut: ['¿Podrás', 'po-DRAS'], cond: ['¿Podrías', 'po-DRI-as'] },
          fr: { pres: 'tu peux', pas: 'tu pouvais', fut: 'tu pourras', cond: 'tu pourrais' } },
        { id: 'me_gustaria', label: 'Me gustaría…', takes: 'inf',
          es: { pres: ['Me gusta', 'mé GOUS-ta'], pas: ['Me ha gustado', 'mé a gous-TA-do'], fut: ['Me gustará', 'mé gous-ta-RA'], cond: ['Me gustaría', 'mé gous-ta-RI-a'] },
          fr: { pres: "j'aime", pas: "j'ai aimé", fut: "j'aimerai", cond: "j'aimerais" } },
        { id: 'tengo_que', label: 'Tengo que…', takes: 'inf',
          es: { pres: ['Tengo que', 'TÉN-go ké'], pas: ['Tenía que', 'té-NI-a ké'], fut: ['Tendré que', 'tén-DRÉ ké'], cond: ['Tendría que', 'tén-DRI-a ké'] },
          fr: { pres: 'je dois', pas: 'je devais', fut: 'je devrai', cond: 'je devrais' } },
        { id: 'tengo_ganas_de', label: 'Tengo ganas de…', takes: 'inf',
          es: { pres: ['Tengo ganas de', 'TÉN-go GA-nas dé'], pas: ['Tenía ganas de', 'té-NI-a GA-nas dé'], fut: ['Tendré ganas de', 'tén-DRÉ GA-nas dé'], cond: ['Tendría ganas de', 'tén-DRI-a GA-nas dé'] },
          fr: { pres: "j'ai envie de", pas: "j'avais envie de", fut: "j'aurai envie de", cond: "j'aurais envie de" } },
        { id: 'estoy_buscando', label: 'Estoy buscando…', takes: 'noun',
          es: { pres: ['Estoy buscando', 'és-TOY bous-KAN-do'], pas: ['Estaba buscando', 'és-TA-ba bous-KAN-do'], fut: ['Buscaré', 'bous-ka-RÉ'], cond: ['Buscaría', 'bous-ka-RI-a'] },
          fr: { pres: 'je cherche', pas: 'je cherchais', fut: 'je chercherai', cond: 'je chercherais' } }
      ],
      /* [es, pf, fr, thème] */
      actions: [
        ['comer algo', 'ko-MÉR AL-go', 'manger quelque chose', 'manger'],
        ['tomar un café', 'to-MAR oun ka-FÉ', 'prendre un café', 'manger'],
        ['pedir comida', 'pé-DIR ko-MI-da', 'commander à manger', 'manger'],
        ['pedir comida para llevar', 'pé-DIR ko-MI-da PA-ra yé-BAR', 'commander à emporter', 'manger'],
        ['pagar la cuenta', 'pa-GAR la KOUÉN-ta', "payer l'addition", 'manger'],
        ['reservar una mesa', 'ré-ssér-BAR OU-na MÉ-ssa', 'réserver une table', 'manger'],
        ['beber agua', 'bé-BÉR A-goua', "boire de l'eau", 'manger'],
        ['tomar un taxi', 'to-MAR oun TAK-ssi', 'prendre un taxi', 'deplacements'],
        ['tomar el metro', 'to-MAR él MÉ-tro', 'prendre le métro', 'deplacements'],
        ['ir al trabajo', 'IR al tra-BA-kho', 'aller au travail', 'deplacements'],
        ['volver a casa', 'bol-BÉR a KA-ssa', 'rentrer à la maison', 'deplacements'],
        ['encontrar la salida', 'én-kon-TRAR la ssa-LI-da', 'trouver la sortie', 'deplacements'],
        ['aparcar el coche', 'a-par-KAR él KO-tché', 'garer la voiture', 'deplacements'],
        ['tomar el tren', 'to-MAR él TRÉN', 'prendre le train', 'deplacements'],
        ['hacer la compra', 'a-SSÉR la KOM-pra', 'faire les courses', 'quotidien'],
        ['hacer deporte', 'a-SSÉR dé-POR-té', 'faire du sport', 'quotidien'],
        ['dormir un poco', 'dor-MIR oun PO-ko', 'dormir un peu', 'quotidien'],
        ['descansar', 'dés-kan-SSAR', 'me reposer', 'quotidien'],
        ['ducharme', 'dou-TCHAR-mé', 'prendre une douche', 'quotidien'],
        ['levantarme temprano', 'lé-ban-TAR-mé tém-PRA-no', 'me lever tôt', 'quotidien'],
        ['limpiar la casa', 'lim-PIAR la KA-ssa', 'faire le ménage', 'quotidien'],
        ['salir esta noche', 'sa-LIR ÉS-ta NO-tché', 'sortir ce soir', 'quotidien'],
        ['llamar a un amigo', 'ya-MAR a oun a-MI-go', 'appeler un ami', 'demarches'],
        ['enviar un mensaje', 'én-BIAR oun mén-SSA-khé', 'envoyer un message', 'demarches'],
        ['reservar una cita', 'ré-ssér-BAR OU-na SSI-ta', 'prendre rendez-vous', 'demarches'],
        ['recoger un paquete', 'ré-ko-KHÉR oun pa-KÉ-té', 'récupérer un colis', 'demarches'],
        ['enviar un paquete', 'én-BIAR oun pa-KÉ-té', 'envoyer un colis', 'demarches'],
        ['cambiar dinero', 'kam-BIAR di-NÉ-ro', "changer de l'argent", 'demarches'],
        ['sacar dinero', 'sa-KAR di-NÉ-ro', "retirer de l'argent", 'demarches'],
        ['rellenar un formulario', 'ré-yé-NAR oun for-mou-LA-rio', 'remplir un formulaire', 'demarches'],
        ['comprar esto', 'kom-PRAR ÉS-to', 'acheter ça', 'achats'],
        ['probar esto', 'pro-BAR ÉS-to', 'essayer ça', 'achats'],
        ['cambiar esto', 'kam-BIAR ÉS-to', 'changer ça', 'achats'],
        ['devolver esto', 'dé-bol-BÉR ÉS-to', 'rendre ça', 'achats'],
        ['pagar con tarjeta', 'pa-GAR kon tar-KHÉ-ta', 'payer par carte', 'achats'],
        ['preguntar el precio', 'pré-goun-TAR él PRÉ-ssio', 'demander le prix', 'achats'],
        ['encontrar una farmacia', 'én-kon-TRAR OU-na far-MA-ssia', 'trouver une pharmacie', 'achats'],
        ['trabajar mañana', 'tra-ba-KHAR ma-GNA-na', 'travailler demain', 'travail'],
        ['terminar esto hoy', 'tér-mi-NAR ÉS-to OY', "finir ça aujourd'hui", 'travail'],
        ['enviar el documento', 'én-BIAR él do-kou-MÉN-to', 'envoyer le document', 'travail'],
        ['hablar con el responsable', 'a-BLAR kon él rés-pon-SSA-blé', 'parler avec le responsable', 'travail'],
        ['aprender español', 'a-prén-DÉR és-pa-GNOL', "apprendre l'espagnol", 'travail'],
        ['hacer una clase de prueba', 'a-SSÉR OU-na KLA-ssé dé PROUÉ-ba', "faire un cours d'essai", 'travail'],
        ['tomar notas', 'to-MAR NO-tas', 'prendre des notes', 'travail'],
        ['alquilar un piso', 'al-ki-LAR oun PI-sso', 'louer un appartement', 'logement'],
        ['firmar el contrato', 'fir-MAR él kon-TRA-to', 'signer le contrat', 'logement'],
        ['pagar el alquiler', 'pa-GAR él al-ki-LÉR', 'payer le loyer', 'logement'],
        ['llamar al propietario', 'ya-MAR al pro-pié-TA-rio', 'appeler le propriétaire', 'logement'],
        ['arreglar esto', 'a-rré-GLAR ÉS-to', 'réparer ça', 'logement'],
        ['ver a un médico', 'BÉR a oun MÉ-di-ko', 'voir un médecin', 'sante'],
        ['comprar medicamentos', 'kom-PRAR mé-di-ka-MÉN-tos', 'acheter des médicaments', 'sante'],
        ['ir al hospital', 'IR al os-pi-TAL', "aller à l'hôpital", 'sante'],
        ['ver a mis amigos', 'BÉR a mis a-MI-gos', 'voir mes amis', 'social'],
        ['invitar a alguien', 'in-bi-TAR a AL-guién', "inviter quelqu'un", 'social'],
        ['ir a una fiesta', 'IR a OU-na FIÉS-ta', 'aller à une fête', 'social'],
        ['hablar contigo', 'a-BLAR kon-TI-go', 'parler avec toi', 'social'],
        ['pedir ayuda', 'pé-DIR a-YOU-da', "demander de l'aide", 'social'],
        ['esperar aquí', 'és-pé-RAR a-KI', 'attendre ici', 'social'],
        ['salir ahora', 'sa-LIR a-O-ra', 'partir maintenant', 'social'],
        ['poner esto aquí', 'po-NÉR ÉS-to a-KI', 'mettre ça ici', 'social']
      ],
      nouns: [
        ['un taxi', 'oun TAK-ssi', 'un taxi', 'deplacements'],
        ['la salida', 'la ssa-LI-da', 'la sortie', 'deplacements'],
        ['el metro', 'él MÉ-tro', 'le métro', 'deplacements'],
        ['la estación', 'la és-ta-SSION', 'la gare', 'deplacements'],
        ['un restaurante', 'oun rés-tau-RAN-té', 'un restaurant', 'manger'],
        ['un café', 'oun ka-FÉ', 'un café', 'manger'],
        ['una farmacia', 'OU-na far-MA-ssia', 'une pharmacie', 'achats'],
        ['un cajero', 'oun ka-KHÉ-ro', 'un distributeur', 'demarches'],
        ['mi paquete', 'mi pa-KÉ-té', 'mon colis', 'demarches'],
        ['mis llaves', 'mis YA-bés', 'mes clés', 'quotidien'],
        ['mi móvil', 'mi MO-bil', 'mon téléphone', 'quotidien'],
        ['un piso', 'oun PI-sso', 'un appartement', 'logement'],
        ['trabajo', 'tra-BA-kho', 'du travail', 'travail'],
        ['un médico', 'oun MÉ-di-ko', 'un médecin', 'sante'],
        ['a mis amigos', 'a mis a-MI-gos', 'mes amis', 'social']
      ],
      /* adaptations à la 2e personne (¿Puedes…?) */
      tu: {
        es: [['ducharme', 'ducharte'], ['levantarme', 'levantarte'], ['hablar contigo', 'hablar conmigo']],
        pf: [['dou-TCHAR-mé', 'dou-TCHAR-té'], ['lé-ban-TAR-mé', 'lé-ban-TAR-té'], ['kon-TI-go', 'kon-MI-go']],
        fr: [['me reposer', 'te reposer'], ['me lever', 'te lever'], ['parler avec toi', 'parler avec moi']]
      }
    }
  };

  /* ---------- Libellés d'interface (langue native) ---------- */
  var UI = {
    fr: { title: 'Mes phrases', sub: 'Une structure + un temps + une action = une phrase complète.', structure: 'Structure', tense: 'Temps', action: 'Action', listen: '🔊 Écouter', random: '🎲 Au hasard', variants: 'La même action aux 4 temps', menu: 'Mes phrases', phon: 'Phonétique',
          tenses: { pres: 'présent', pas: 'passé', fut: 'futur', cond: 'conditionnel' },
          themes: { manger: 'Manger & boire', deplacements: 'Se déplacer', quotidien: 'Quotidien', demarches: 'Démarches', achats: 'Achats', travail: 'Travail', logement: 'Logement', sante: 'Santé', social: 'Social' } },
    en: { title: 'My sentences', sub: 'A structure + a tense + an action = a complete sentence.', structure: 'Structure', tense: 'Tense', action: 'Action', listen: '🔊 Listen', random: '🎲 Random', variants: 'Same action, 4 tenses', menu: 'My sentences', phon: 'Pronunciation',
          tenses: { pres: 'present', pas: 'past', fut: 'future', cond: 'conditional' },
          themes: { manger: 'Food & drink', deplacements: 'Getting around', quotidien: 'Daily life', demarches: 'Errands', achats: 'Shopping', travail: 'Work', logement: 'Housing', sante: 'Health', social: 'Social' } },
    zh: { title: '我的句子', sub: '结构 + 时态 + 动作 = 完整的句子。', structure: '结构', tense: '时态', action: '动作', listen: '🔊 听', random: '🎲 随机', variants: '同一动作的 4 个时态', menu: '我的句子', phon: '发音',
          tenses: { pres: '现在', pas: '过去', fut: '将来', cond: '条件式' },
          themes: { manger: '饮食', deplacements: '出行', quotidien: '日常', demarches: '办事', achats: '购物', travail: '工作', logement: '住房', sante: '健康', social: '社交' } },
    es: { title: 'Mis frases', sub: 'Una estructura + un tiempo + una acción = una frase completa.', structure: 'Estructura', tense: 'Tiempo', action: 'Acción', listen: '🔊 Escuchar', random: '🎲 Al azar', variants: 'La misma acción en 4 tiempos', menu: 'Mis frases', phon: 'Pronunciación',
          tenses: { pres: 'presente', pas: 'pasado', fut: 'futuro', cond: 'condicional' },
          themes: { manger: 'Comer y beber', deplacements: 'Desplazarse', quotidien: 'Día a día', demarches: 'Gestiones', achats: 'Compras', travail: 'Trabajo', logement: 'Vivienda', sante: 'Salud', social: 'Social' } },
    it: { title: 'Le mie frasi', sub: 'Una struttura + un tempo + un’azione = una frase completa.', structure: 'Struttura', tense: 'Tempo', action: 'Azione', listen: '🔊 Ascolta', random: '🎲 A caso', variants: 'La stessa azione in 4 tempi', menu: 'Le mie frasi', phon: 'Pronuncia',
          tenses: { pres: 'presente', pas: 'passato', fut: 'futuro', cond: 'condizionale' },
          themes: { manger: 'Mangiare e bere', deplacements: 'Spostarsi', quotidien: 'Quotidiano', demarches: 'Pratiche', achats: 'Acquisti', travail: 'Lavoro', logement: 'Casa', sante: 'Salute', social: 'Sociale' } },
    ja: { title: '自分の文', sub: '構文 + 時制 + 動作 = 完全な文。', structure: '構文', tense: '時制', action: '動作', listen: '🔊 聞く', random: '🎲 ランダム', variants: '同じ動作を4つの時制で', menu: '自分の文', phon: '発音',
          tenses: { pres: '現在', pas: '過去', fut: '未来', cond: '条件法' },
          themes: { manger: '飲食', deplacements: '移動', quotidien: '日常', demarches: '手続き', achats: '買い物', travail: '仕事', logement: '住まい', sante: '健康', social: '交流' } },
    ko: { title: '내 문장', sub: '구조 + 시제 + 행동 = 완전한 문장.', structure: '구조', tense: '시제', action: '행동', listen: '🔊 듣기', random: '🎲 무작위', variants: '같은 행동, 4가지 시제', menu: '내 문장', phon: '발음',
          tenses: { pres: '현재', pas: '과거', fut: '미래', cond: '조건법' },
          themes: { manger: '먹고 마시기', deplacements: '이동', quotidien: '일상', demarches: '볼일', achats: '쇼핑', travail: '일', logement: '주거', sante: '건강', social: '사교' } }
  };
  function L() { return UI[typeof nat === 'string' ? nat : 'fr'] || UI.fr; }
  function data() { return CONSTRUIRE[typeof lang === 'string' ? lang : ''] || null; }

  /* ---------- Assemblage ---------- */
  function replaceAll(s, pairs) { pairs.forEach(function (p) { s = s.split(p[0]).join(p[1]); }); return s; }
  function build(D, st, tense, item) {
    var es = item[0], pf = item[1], fr = item[2];
    if (st.tu) { es = replaceAll(es, D.tu.es); pf = replaceAll(pf, D.tu.pf); fr = replaceAll(fr, D.tu.fr); }
    var head = st.es[tense];
    var text = head[0] + ' ' + es + (st.question ? '?' : '.');
    var phon = head[1] + ' ' + pf;
    var pre = st.fr[tense], frm;
    if (/ de$/.test(pre) && /^[aeiouéèêh]/i.test(fr)) frm = pre.slice(0, -3) + " d'" + fr; else frm = pre + ' ' + fr;
    frm = frm.charAt(0).toUpperCase() + frm.slice(1) + (st.question ? ' ?' : '.');
    return { text: text, phon: phon, fr: frm };
  }

  /* Everyday practice: example → replace one part → recall a new sentence. */
  var places = [
    ['al mercado','al mér-KA-do','au marché'],
    ['al trabajo','al tra-BA-kho','au travail'],
    ['al cine','al SSI-né','au cinéma'],
    ['a la estación','a la és-ta-SSION','à la gare'],
    ['al supermercado','al ssou-pér-mér-KA-do','au supermarché'],
    ['a casa','a KA-ssa','à la maison']
  ];
  var families = [
    {id:'places',head:'Je vais…',example:'Je vais au marché.',icon:'🚶'},
    {id:'voy_a',head:'Je vais…',example:'Je vais manger quelque chose.',icon:'🍽',items:[0,14,20,22,10,52]},
    {id:'quiero',head:'Je veux…',example:'Je veux prendre un café.',icon:'☕',items:[1,6,5,34,41,15]},
    {id:'necesito',head:"J’ai besoin de…",example:"J’ai besoin de me reposer.",icon:'🏠',items:[17,16,18,24,27,49]},
    {id:'tengo_que',head:'Je dois…',example:'Je dois faire les courses.',icon:'🛍',items:[14,37,46,25,38,20]},
    {id:'puedes',head:'Tu peux… ?',example:'Tu peux attendre ici ?',icon:'🤝',items:[57,19,55,48,58,59]}
  ];
  var practice = {step:1,family:0,item:0,tense:'pres',revealed:false};
  var panel=null, previousFocus=null;
  var css=document.createElement('style');
  css.textContent=`
.cxPanel{position:fixed;inset:0;z-index:960;background:rgba(0,0,0,.48);display:none;align-items:center;justify-content:center}
.cxPanel.on{display:flex}
.cxSheet{box-sizing:border-box;background:var(--card,#fff);color:var(--ink,#23262b);width:100%;height:100dvh;padding:calc(18px + env(safe-area-inset-top)) 20px calc(24px + env(safe-area-inset-bottom));overflow:auto;overscroll-behavior:contain;display:flex;flex-direction:column;gap:24px}
@media(min-width:768px){.cxSheet{height:auto;max-height:90dvh;max-width:580px;border-radius:24px;padding:26px}}
.cxHead{display:flex;align-items:center;justify-content:space-between;gap:12px}.cxHead b{font-size:19px}.cxIcon{border:0;border-radius:50%;background:rgba(127,127,127,.14);color:inherit;width:42px;height:42px;font-size:24px;cursor:pointer;flex-shrink:0}
.cxDots{display:flex;gap:7px;justify-content:center}.cxDots i{width:7px;height:7px;border-radius:50%;background:currentColor;opacity:.18}.cxDots i.on{opacity:1;background:var(--accent,#167d9b);width:24px;border-radius:8px}
.cxChoices{display:grid;gap:10px}.cxChoice{display:flex;align-items:center;gap:14px;width:100%;text-align:left;border:1px solid var(--line,#d7dfe0);border-radius:16px;padding:19px 16px;background:transparent;color:inherit;font:700 17px/1.4 system-ui;cursor:pointer}.cxChoice span{flex:1}.cxChoice.selected{border:2px solid var(--accent,#167d9b);background:rgba(127,127,127,.08)}
.cxCard{text-align:center;padding:24px 4px;display:grid;gap:16px}.cxText{font-size:clamp(27px,6vw,36px);line-height:1.25;font-weight:800;margin:0;overflow-wrap:anywhere}.cxPart{color:inherit;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:7px}.cxPhon{font-size:21px;line-height:1.5;font-weight:750;color:inherit;margin:0}.cxFr{font-size:18px;line-height:1.5;margin:0}.cxBtn{align-self:center;border:0;border-radius:16px;padding:16px 25px;background:var(--ink,#173e50);color:var(--card,#fff);font:750 17px system-ui;cursor:pointer;min-height:52px}.cxNext{width:100%;margin-top:auto}.cxGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.cxGrid .cxChoice{font-size:15px;padding:15px 12px}.cxPrompt{text-align:center;font-size:30px;font-weight:800;margin:14px 0}.cxSelect{width:100%;min-height:56px;border:1px solid var(--line,#d7dfe0);border-radius:14px;background:var(--card,#fff);color:inherit;font:700 18px system-ui;padding:12px}.cxAgain{background:transparent;color:inherit;border:1px solid var(--line,#d7dfe0)}
.cxEntry{position:absolute;top:14px;left:50%;transform:translateX(-50%);z-index:6;display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(255,255,255,.28);background:rgba(255,255,255,.14);color:inherit;border-radius:999px;padding:8px 14px;font:inherit;font-size:13px;font-weight:800;letter-spacing:.2px;cursor:pointer;backdrop-filter:blur(8px);box-shadow:0 6px 18px rgba(0,0,0,.14);white-space:nowrap}
body.ambclair .cxEntry{background:rgba(55,45,65,.10);border-color:rgba(55,45,65,.18)}
.cxSheet button:focus-visible,.cxSheet select:focus-visible{outline:3px solid var(--blue,#1e7fa8);outline-offset:3px}
`;
  document.head.appendChild(css);
  function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;}
  function button(cls,text,fn){var b=el('button',cls,text);b.type='button';b.onclick=fn;return b;}
  function family(){return families[practice.family];}
  function items(){return family().id==='places'?places:family().items.map(function(i){return data().actions[i];});}
  function result(){
    var item=items()[practice.item];
    if(family().id==='places')return{text:'Voy '+item[0]+'.',phon:'BOY '+item[1],fr:'Je vais '+item[2]+'.'};
    var st=data().structures.find(function(s){return s.id===family().id;});
    return build(data(),st,practice.tense,item);
  }
  function ensurePanel(){
    if(panel)return panel;
    panel=el('div','cxPanel');panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label',L().title);
    // A swipe inside this exercise must never rate the lesson underneath it.
    ['touchstart','touchend','pointerdown','pointerup'].forEach(function(type){panel.addEventListener(type,function(e){e.stopPropagation();},{passive:true});});
    panel.addEventListener('click',function(e){if(e.target===panel)close();});
    panel.addEventListener('keydown',function(e){e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){var focusable=panel.querySelectorAll('button,select,[tabindex="0"]'),first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
    document.body.appendChild(panel);return panel;
  }
  function showPhrase(sheet,reveal){
    var r=result(),card=el('div','cxCard');card.setAttribute('aria-live','polite');
    if(reveal){
      var text=el('p','cxText');
      if(family().id==='places'){text.append(document.createTextNode('Voy '),el('span','cxPart',items()[practice.item][0]+'.'));}
      else{var st=data().structures.find(function(s){return s.id===family().id;});var head=st.es[practice.tense][0];text.append(document.createTextNode(head+' '),el('span','cxPart',r.text.slice(head.length+1)));}
      card.append(text,el('p','cxPhon',r.phon),el('p','cxFr',r.fr),button('cxBtn',L().listen,function(){say(r.text,this);}));
    }else card.appendChild(el('p','cxPrompt','…'));
    sheet.appendChild(card);
  }
  function render(){
    if(!data())return;
    var sheet=el('section','cxSheet'),head=el('div','cxHead');
    head.append(button('cxIcon','‹',function(){if(practice.step===1)close();else{practice.step--;render();}}),el('b',null,L().title),button('cxIcon','×',close));sheet.appendChild(head);
    var dots=el('div','cxDots');dots.setAttribute('aria-label','Étape '+practice.step+' sur 3');for(var i=1;i<=3;i++)dots.appendChild(el('i',i===practice.step?'on':''));sheet.appendChild(dots);
    if(practice.step===1){
      var choices=el('div','cxChoices');families.forEach(function(f,i){var b=button('cxChoice','',function(){practice.family=i;practice.item=0;practice.tense='pres';practice.step=2;render();});b.append(el('span',null,f.icon+'  '+f.example),el('b',null,'›'));choices.appendChild(b);});sheet.appendChild(choices);
    }else if(practice.step===2){
      showPhrase(sheet,true);
      var grid=el('div','cxGrid');items().forEach(function(item,i){grid.appendChild(button('cxChoice'+(i===practice.item?' selected':''),item[2],function(){practice.item=i;render();}));});sheet.appendChild(grid);
      sheet.appendChild(button('cxBtn cxNext','À moi d’essayer →',function(){practice.step=3;practice.item=(practice.item+1)%items().length;practice.revealed=false;render();}));
    }else{
      sheet.appendChild(el('p','cxPrompt',family().head));
      var select=el('select','cxSelect');select.setAttribute('aria-label','Ma phrase');items().forEach(function(item,i){var option=el('option',null,item[2]);option.value=i;select.appendChild(option);});select.value=practice.item;select.onchange=function(){practice.item=Number(select.value);practice.revealed=false;render();};sheet.appendChild(select);
      if(!practice.revealed)sheet.appendChild(button('cxBtn','Dire en espagnol',function(){practice.revealed=true;render();}));
      else showPhrase(sheet,true);
      sheet.appendChild(button('cxBtn cxAgain cxNext','Une autre ↻',function(){practice.item=(practice.item+1)%items().length;practice.revealed=false;render();}));
    }
    var P=ensurePanel();P.replaceChildren(sheet);sheet.scrollTop=0;head.querySelector('button').focus({preventScroll:true});
  }
  function say(text,btn){if(typeof speak==='function')speak(text,btn);}
  function open(){if(!data())return;previousFocus=document.activeElement;practice.step=1;ensurePanel().classList.add('on');render();}
  function close(){if(panel)panel.classList.remove('on');if(previousFocus&&previousFocus.isConnected)previousFocus.focus({preventScroll:true});}
  /* Lot B: one level loaded on demand. Legacy path remains available if the loader is absent. */
  var USE_CONVERSATION_FILES = true;
  var legacyOpen = open, legacyClose = close;
  var conversation = {step:1,level:1,unit:0,variant:0,revealed:false,data:null,loading:false,error:false,missing:false,pair:null};
  var selectionSerial = 0, unavailablePairs = Object.create(null);
  var B_LABELS = {
    fr:{level:'Niveau',model:'Situation',loading:'Chargement…',error:'Impossible de charger ce contenu.',retry:'Réessayer',missing:'Ce niveau n’est pas disponible.',try:'À moi d’essayer →',reveal:'Afficher la phrase',another:'Une autre ↻',phrase:'Ma phrase',back:'Retour',close:'Fermer',step:'Étape',of:'sur',premium:'Premium',reading:'Lecture',pinyin:'Pinyin',kana:'Kana',romanization:'Romanisation',reviewNotice:'Contenu en relecture linguistique : la prononciation écrite et certaines tournures peuvent encore évoluer.',phonHint:'La prononciation écrite est une aide, pas un remplacement de l’audio.',pronunciation:'Prononciation'},
    zh:{level:'级别',model:'情境',loading:'正在加载…',error:'无法加载内容。',retry:'重试',missing:'此级别暂不可用。',try:'我来试试 →',reveal:'显示句子',another:'换一句 ↻',phrase:'我的句子',back:'返回',close:'关闭',step:'步骤',of:'/',premium:'高级版',reading:'读音',pinyin:'拼音',kana:'假名',romanization:'罗马字',reviewNotice:'内容仍在语言校对中：注音和部分表达可能会调整。',phonHint:'汉字注音只是辅助，请以音频为准。',pronunciation:'发音'}
  };
  // Lot D may supply window.ConversationLabels[nat]; no changes to this file are required.
  function BText(key){var locale=typeof nat==='string'?nat:'fr';var supplied=window.ConversationLabels&&window.ConversationLabels[locale];return supplied&&typeof supplied[key]==='string'?supplied[key]:(B_LABELS[locale]||B_LABELS.fr)[key]||key;}
  function contentLoader(){return USE_CONVERSATION_FILES && window.ConversationContent;}
  function currentPair(){return (typeof nat==='string'?nat:'fr')+'|'+(typeof lang==='string'?lang:'');}
  function hasContentPair(){var loader=contentLoader(),parts=currentPair().split('|');return loader?loader.isPairAvailable(parts[0],parts[1])&&!unavailablePairs[currentPair()]:!!data();}
  function previewLevels(){
    var nativeApp=window.Capacitor&&typeof window.Capacitor.isNativePlatform==='function'&&window.Capacitor.isNativePlatform();
    return !nativeApp && (/^deploy-preview-\d+--/.test(location.hostname)||location.hostname==='127.0.0.1'||location.hostname==='localhost');
  }
  function canUseLevel(n){return n===1||previewLevels()||(typeof isPaid!=='undefined'&&isPaid===true);}
  /* Lot E: resume position only, never a score or an entitlement. */
  function resumeKey(){return 'melunga_conversation_resume_v1:'+currentPair().replace('|',':');}
  function readResume(){
    try{
      var saved=JSON.parse(localStorage.getItem(resumeKey())||'null');
      if(saved&&saved.version===1&&Number.isInteger(saved.level)&&saved.level>=1&&saved.level<=10){
        return {level:saved.level,unitId:typeof saved.unitId==='string'?saved.unitId:null};
      }
    }catch(_error){}
    return {level:1,unitId:null};
  }
  function saveResume(unitId){
    if(!conversation.data||conversation.pair!==currentPair())return;
    try{localStorage.setItem(resumeKey(),JSON.stringify({version:1,level:conversation.data.level,unitId:unitId||null}));}catch(_error){}
  }
  function resumeConversation(){
    var saved=readResume(),allowed=canUseLevel(saved.level);
    loadConversationLevel(allowed?saved.level:1,allowed?saved.unitId:null);
  }
  function activeUnit(){return conversation.data&&conversation.data.units[conversation.unit];}
  function activeVariant(){var u=activeUnit();return u&&u.variants[conversation.variant];}
  function discoveryIndex(u){var i=u.practice&&u.practice.discover;return Number.isInteger(i)&&i>=0&&i<u.variants.length?i:0;}
  function renderConversation(){
    if(!panel||!panel.classList.contains('on')||conversation.pair!==currentPair())return;
    var sheet=el('section','cxSheet'),head=el('div','cxHead');
    var back=button('cxIcon','‹',function(){if(conversation.step===1)close();else{conversation.step=conversation.step===4?(conversation.dialogueReturn||1):conversation.step-1;conversation.revealed=false;renderConversation();}});back.setAttribute('aria-label',BText('back'));
    var title=el('b',null,L().title),dismiss=button('cxIcon','×',close);dismiss.setAttribute('aria-label',BText('close'));head.append(back,title,dismiss);sheet.appendChild(head);
    var dots=el('div','cxDots');dots.setAttribute('aria-label',BText('step')+' '+conversation.step+' '+BText('of')+' 4');for(var i=1;i<=4;i++)dots.appendChild(el('i',i===conversation.step?'on':''));sheet.appendChild(dots);
    if(conversation.step===1){
      var levelLabel=el('label','cxLevelLabel',BText('level'));levelLabel.htmlFor='cxLevel';
      var levelSelect=el('select','cxSelect');levelSelect.id='cxLevel';
      for(var n=1;n<=10;n++){var option=el('option',null,BText('level')+' '+n+(canUseLevel(n)?'':' · '+BText('premium')));option.value=n;option.disabled=!canUseLevel(n);levelSelect.appendChild(option);}
      levelSelect.value=conversation.level;levelSelect.onchange=function(){loadConversationLevel(Number(levelSelect.value));};sheet.append(levelLabel,levelSelect);
    }
    if(conversation.data&&!conversation.loading)appendReviewNotice(sheet,conversation.data);
    if(conversation.loading){var loading=el('p','cxStatus',BText('loading'));loading.setAttribute('role','status');sheet.appendChild(loading);}
    else if(conversation.error){var error=el('p','cxStatus',BText('error'));error.setAttribute('role','alert');sheet.append(error,button('cxBtn',BText('retry'),function(){loadConversationLevel(conversation.level,conversation.pendingResumeUnit);}));}
    else if(conversation.missing){var missing=el('p','cxStatus',BText('missing'));missing.setAttribute('role','status');sheet.appendChild(missing);}
    else if(conversation.data){
      if(conversation.step===1){
        if(conversation.data.dialogues.length)sheet.appendChild(dialogueButton());
        var choices=el('div','cxChoices');conversation.data.units.forEach(function(u,index){var example=u.variants[discoveryIndex(u)];var choice=button('cxChoice cxModel','',function(){conversation.unit=index;conversation.variant=discoveryIndex(u);saveResume(u.id);conversation.step=2;conversation.revealed=false;renderConversation();});choice.append(el('span','cxModelText',u.situation),el('small','cxModelExample',example.native),el('b',null,'›'));choices.appendChild(choice);});sheet.appendChild(choices);
      }else if(conversation.step===2){
        showConversationPhrase(sheet);
        var grid=el('div','cxGrid');activeUnit().variants.forEach(function(v,index){var choice=button('cxChoice'+(index===conversation.variant?' selected':''),v.slot.native,function(){conversation.variant=index;renderConversation();});choice.setAttribute('aria-pressed',String(index===conversation.variant));grid.appendChild(choice);});sheet.appendChild(grid);
        sheet.appendChild(button('cxBtn cxNext',BText('try'),function(){conversation.step=3;conversation.variant=(conversation.variant+1)%activeUnit().variants.length;conversation.revealed=false;renderConversation();}));
      }else if(conversation.step===3){
        var v=activeVariant();
        var choices=el('select','cxSelect');choices.setAttribute('aria-label',BText('phrase'));activeUnit().variants.forEach(function(x,index){var option=el('option',null,x.slot.native);option.value=index;choices.appendChild(option);});choices.value=conversation.variant;choices.onchange=function(){conversation.variant=Number(choices.value);conversation.revealed=false;renderConversation();};sheet.appendChild(choices);
        if(conversation.revealed)showConversationPhrase(sheet);
        else{var prompt=el('p','cxPrompt',v.native);prompt.lang=conversation.data.nativeLanguage;sheet.append(prompt,button('cxBtn',BText('reveal'),function(){conversation.revealed=true;renderConversation();}));}
        sheet.appendChild(button('cxBtn cxAgain cxNext',BText('another'),function(){conversation.variant=(conversation.variant+1)%activeUnit().variants.length;conversation.revealed=false;renderConversation();}));
        if(conversation.data.dialogues.length)sheet.appendChild(dialogueButton());
      }else if(conversation.step===4){renderDialogue(sheet);}
    }
    panel.replaceChildren(sheet);panel.setAttribute('aria-label',L().title);title.tabIndex=-1;title.focus({preventScroll:true});
  }
  /* Lot F — statut éditorial : les fichiers marqués « relecture linguistique requise » (zh/ja/ko, français pour sinophones) l'affichent,
     avec la convention phonétique dépliable. reviewStatus et phoneticConvention viennent tels quels des fichiers de contenu. */
  function needsReview(data){return /requise|required|校对|校閱|감수/i.test(String(data&&data.reviewStatus||''));}
  function appendReviewNotice(sheet,data){
    if(!needsReview(data))return;
    var box=el('details','cxNotice');box.setAttribute('data-review','required');
    var sum=el('summary',null,'ⓘ '+BText('reviewNotice'));
    var conv=el('p','cxNoticeText',data.phoneticConvention||'');var hint=el('p','cxNoticeText',BText('phonHint'));var status=el('p','cxNoticeStatus',data.reviewStatus||'');
    box.append(sum,conv,hint,status);sheet.appendChild(box);
  }
  function enterDialogue(){
    if(!conversation.data||!conversation.data.dialogues.length)return;
    conversation.dialogueReturn=conversation.step;
    conversation.step=4;conversation.dialogue=0;conversation.turn=0;conversation.hiddenRole='B';conversation.turnRevealed=false;
    renderConversation();
  }
  function dialogueButton(){return button('cxBtn cxAgain cxConverse',BText('stepConverse'),enterDialogue);}
  function renderDialogue(sheet){
    var dialogues=conversation.data.dialogues;
    if(!dialogues.length)return;
    var selected=dialogues[conversation.dialogue],turn=selected.turns[conversation.turn];
    var label=el('label','cxLevelLabel',BText('dialogue'));label.htmlFor='cxDialogue';
    var select=el('select','cxSelect');select.id='cxDialogue';
    dialogues.forEach(function(d,index){var option=el('option',null,d.situation||BText('dialogue')+' '+(index+1));option.value=index;select.appendChild(option);});
    select.value=conversation.dialogue;select.onchange=function(){conversation.dialogue=Number(select.value);conversation.turn=0;conversation.turnRevealed=false;renderConversation();};sheet.append(label,select);
    var roleLabel=el('label','cxLevelLabel',BText('hideRole'));roleLabel.htmlFor='cxHiddenRole';
    var roles=el('select','cxSelect');roles.id='cxHiddenRole';
    [['',BText('showAll')],['A',BText('roleA')],['B',BText('roleB')]].forEach(function(r){var option=el('option',null,r[1]);option.value=r[0];roles.appendChild(option);});
    roles.value=conversation.hiddenRole;roles.onchange=function(){conversation.hiddenRole=roles.value;conversation.turnRevealed=false;renderConversation();};sheet.append(roleLabel,roles);
    var hidden=turn.speaker===conversation.hiddenRole&&!conversation.turnRevealed;
    var card=el('div','cxCard cxDialogueCard');card.setAttribute('aria-live','polite');
    card.appendChild(el('small','cxSpeaker',BText(turn.speaker==='A'?'roleA':'roleB')+' · '+(conversation.turn+1)+' / '+selected.turns.length));
    if(hidden){
      card.appendChild(el('p','cxPrompt',BText('yourTurn')));
      var cue=el('p','cxFr',turn.native);cue.lang=conversation.data.nativeLanguage;card.appendChild(cue);
      card.appendChild(button('cxBtn cxTurnReveal',BText('reveal'),function(){conversation.turnRevealed=true;renderConversation();}));
    }else{
      var phrase=el('p','cxText cxTurnText',turn.study);phrase.lang=conversation.data.studyLanguage;card.appendChild(phrase);
      if(turn.reading){var kind={zh:'pinyin',ja:'kana',ko:'romanization'}[conversation.data.studyLanguage]||'reading';card.appendChild(el('small','cxReadingLabel',BText(kind)));card.appendChild(el('p','cxReading',turn.reading));}
      var translation=el('p','cxFr',turn.native);translation.lang=conversation.data.nativeLanguage;
      card.append(el('p','cxPhon',turn.phon),translation,button('cxBtn cxTurnListen',BText('listen'),function(){if(conversation.pair===currentPair())say(turn.study,this);}));
    }
    sheet.appendChild(card);
    var nav=el('div','cxTurnNav');
    var prev=button('cxBtn cxAgain cxTurnPrevious',BText('back'),function(){if(conversation.turn>0){conversation.turn--;conversation.turnRevealed=false;renderConversation();}});prev.disabled=conversation.turn===0;
    var last=conversation.turn===selected.turns.length-1;
    var next=button('cxBtn cxTurnNext',BText(last?'done':'next'),function(){if(last){conversation.step=conversation.dialogueReturn||1;}else conversation.turn++;conversation.turnRevealed=false;renderConversation();});
    nav.append(prev,next);sheet.appendChild(nav);
  }

  function showConversationPhrase(sheet){
    var v=activeVariant(),card=el('div','cxCard'),text=el('p','cxText');text.lang=conversation.data.studyLanguage;card.setAttribute('aria-live','polite');
    // Only mark the slot; never rebuild an inflected or contracted sentence from its template.
    var offset=v.study.indexOf(v.slot.study);
    if(offset>=0){text.append(document.createTextNode(v.study.slice(0,offset)),el('span','cxPart',v.slot.study),document.createTextNode(v.study.slice(offset+v.slot.study.length)));}
    else text.textContent=v.study;
    card.appendChild(text);
    if(v.reading){var readingKind={zh:'pinyin',ja:'kana',ko:'romanization'}[conversation.data.studyLanguage]||'reading';card.appendChild(el('small','cxReadingLabel',BText(readingKind)));var reading=el('p','cxReading',v.reading);reading.setAttribute('aria-label',BText(readingKind));card.appendChild(reading);}
    card.append(el('p','cxPhon',v.phon),el('p','cxFr',v.native),button('cxBtn',L().listen,function(){if(conversation.pair===currentPair())say(v.study,this);}));sheet.appendChild(card);
  }
  function loadConversationLevel(n,resumeUnitId){
    if(!Number.isInteger(n)||n<1||n>10||!canUseLevel(n))return;
    var loader=contentLoader(),pair=currentPair(),parts=pair.split('|'),serial=++selectionSerial;
    conversation.pendingResumeUnit=resumeUnitId||null;conversation.level=n;conversation.pair=pair;conversation.step=1;conversation.data=null;conversation.loading=true;conversation.error=false;conversation.missing=false;renderConversation();
    loader.loadLevel(parts[0],parts[1],n).then(function(result){
      if(serial!==selectionSerial||pair!==currentPair()||!panel||!panel.classList.contains('on'))return;
      if(!canUseLevel(n)){loadConversationLevel(1);return;}
      conversation.loading=false;
      if(result.status==='ok'){
        conversation.data=result.data;
        var restored=result.data.units.findIndex(function(u){return u.id===resumeUnitId;});
        conversation.unit=restored>=0?restored:0;
        conversation.variant=discoveryIndex(result.data.units[conversation.unit]);
        conversation.revealed=false;conversation.step=restored>=0?2:1;
        saveResume(restored>=0?result.data.units[restored].id:null);
      }
      else if(result.status==='unavailable'){
        conversation.missing=true;
        if(n===1){unavailablePairs[pair]=true;close();syncEntry(false);return;}
      }else conversation.error=true;
      renderConversation();
    });
  }
  open=function(){
    if(!contentLoader()){legacyOpen();return;}
    if(!hasContentPair())return;
    previousFocus=document.activeElement;ensurePanel().classList.add('on');resumeConversation();
  };
  close=function(){selectionSerial++;conversation.pair=null;legacyClose();};
  var extraCss=document.createElement('style');extraCss.textContent='.cxNotice{border:1px solid var(--line,#d7dfe0);border-radius:14px;padding:10px 14px;font:500 14px/1.45 system-ui;opacity:.92}.cxNotice summary{cursor:pointer;list-style:none;font-weight:600}.cxNotice summary::-webkit-details-marker{display:none}.cxNoticeText{margin:8px 0 0;font-weight:400;opacity:.85}.cxNoticeStatus{margin:8px 0 0;font-size:12px;opacity:.65}.cxConverse{width:100%}.cxTurnNav{display:flex;gap:12px;margin-top:auto}.cxTurnNav>button{flex:1;min-width:0}.cxTurnNav button:disabled{opacity:.4;cursor:default}.cxDialogueCard{gap:14px;padding:12px 0}.cxDialogueCard .cxText{font-size:clamp(23px,5vw,30px)}.cxSpeaker{font:700 14px system-ui}.cxDialogueCard .cxPrompt{font-size:24px;margin:0}.cxModel{display:grid;grid-template-columns:1fr auto;gap:6px 12px}.cxModelText{grid-column:1}.cxModelExample{grid-column:1;font:400 15px/1.5 system-ui;overflow-wrap:anywhere}.cxModel>b{grid-column:2;grid-row:1/3}.cxReadingLabel{font:600 12px system-ui;margin-bottom:-10px}.cxReading{font:500 17px/1.5 system-ui;margin:0;overflow-wrap:anywhere}.cxLevelLabel{font:700 15px system-ui;margin-bottom:-16px}.cxStatus{text-align:center;font:500 17px/1.5 system-ui}.cxSheet>select{flex-shrink:0}.cxModel,.cxGrid .cxChoice{min-width:0;overflow-wrap:anywhere}';document.head.appendChild(extraCss);

  window.openConstruire=open;window.closeConstruire=close;

  /* ---------- Entrée sur la carte de leçon : visible seulement si des données existent pour la langue étudiée ---------- */
  function syncMenu() {
    var has = hasContentPair();
    if(contentLoader() && panel && panel.classList.contains('on') && conversation.pair && conversation.pair!==currentPair()){
      if(has)resumeConversation();else close();
    }
    syncEntry(has);
  }
  /* Entrée visible sur la page de leçon : pastille en haut de la carte */
  function syncEntry(has) {
    var card = document.getElementById('card'); if (!card) return;
    var e = document.getElementById('cxEntry');
    if (!has) { if (e) e.style.display = 'none'; return; }
    if (!e) {
      e = document.createElement('button'); e.id = 'cxEntry'; e.className = 'cxEntry'; e.type = 'button';
      e.addEventListener('click', function (ev) { ev.stopPropagation(); ev.preventDefault(); open(); });
      e.addEventListener('touchstart', function (ev) { ev.stopPropagation(); }, { passive: true });
      e.addEventListener('pointerdown', function (ev) { ev.stopPropagation(); });
      if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
      card.appendChild(e);
    }
    e.style.display = '';
    e.textContent = '🧩 ' + L().menu;
  }
  function install() {
    syncMenu();
    var orig = window.toggleUMenu;
    if (typeof orig === 'function' && !orig.__cx) {
      window.toggleUMenu = function () { syncMenu(); return orig.apply(this, arguments); };
      window.toggleUMenu.__cx = true;
    }
    var origShow = window.show;
    if (typeof origShow === 'function' && !origShow.__cx) {
      window.show = function () { var r = origShow.apply(this, arguments); syncMenu(); return r; };
      window.show.__cx = true;
    }
    var origNat=window.setNat;
    if(typeof origNat==='function'&&!origNat.__cx){window.setNat=function(){var r=origNat.apply(this,arguments);syncMenu();return r;};window.setNat.__cx=true;}
    var origSet = window.setLang;
    if (typeof origSet === 'function' && !origSet.__cx) {
      window.setLang = function () { var r = origSet.apply(this, arguments); syncMenu(); return r; };
      window.setLang.__cx = true;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true }); else install();
  setTimeout(syncMenu, 1200); setTimeout(syncMenu, 3000);
})();

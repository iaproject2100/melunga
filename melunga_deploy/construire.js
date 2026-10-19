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

  /* ---------- État ---------- */
  var state = { s: 0, t: 'pres', a: 0 };

  /* ---------- Styles ---------- */
  var css = document.createElement('style');
  css.textContent = [
    '.cxPanel{position:fixed;inset:0;z-index:960;background:rgba(0,0,0,.4);display:none;align-items:flex-end;justify-content:center}',
    '.cxPanel.on{display:flex}',
    '.cxSheet{background:var(--card,#fff);color:var(--ink,#23262B);width:100%;max-width:560px;border-radius:22px 22px 0 0;padding:18px 18px calc(22px + env(safe-area-inset-bottom));max-height:92dvh;overflow-y:auto;overscroll-behavior:contain;box-shadow:0 -12px 40px rgba(0,0,0,.25)}',
    '@media(min-width:960px){.cxPanel{align-items:center}.cxSheet{border-radius:22px;max-height:88vh}}',
    '.cxHead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:4px}',
    '.cxHead b{font-size:19px}.cxSub{font-size:12.5px;color:var(--soft,#8C8273);margin:0 0 14px}',
    '.cxClose{border:0;background:rgba(127,127,127,.15);color:inherit;width:34px;height:34px;border-radius:50%;font-size:16px;cursor:pointer}',
    '.cxLbl{font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:var(--soft,#8C8273);margin:12px 0 7px}',
    '.cxChips{display:flex;flex-wrap:wrap;gap:7px}',
    '.cxChip{border:1.5px solid var(--line,#ECE3D4);background:transparent;color:inherit;border-radius:999px;padding:8px 13px;font:inherit;font-size:13.5px;font-weight:700;cursor:pointer;white-space:nowrap}',
    '.cxChip.on{background:var(--accent,#C8102E);border-color:var(--accent,#C8102E);color:#fff}',
    '.cxActions{max-height:28vh;overflow-y:auto;padding:2px 2px 6px;margin-top:2px}',
    '.cxTheme{font-size:11px;font-weight:800;color:var(--soft,#8C8273);margin:10px 0 5px;text-transform:uppercase;letter-spacing:.8px}',
    '.cxCard{margin:4px 0 6px;border-radius:18px;padding:18px 16px;background:linear-gradient(160deg,rgba(30,127,168,.14),rgba(30,127,168,.04));border:1px solid rgba(30,127,168,.25);text-align:center}',
    '.cxText{font-size:26px;font-weight:800;line-height:1.2;margin:0 0 12px}',
    '.cxPhonBox{display:inline-block;background:rgba(255,255,255,.55);border:1px solid rgba(0,0,0,.06);border-radius:14px;padding:10px 16px;margin:0 0 10px}',
    '.cxPhonLbl{display:block;font-size:10.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--soft,#8C8273);margin-bottom:3px}',
    '.cxPhon{font-size:22px;font-weight:800;color:var(--blue,#1E7FA8);letter-spacing:.2px}',
    '.cxFr{font-size:15px;color:var(--soft,#8C8273);margin:0 0 14px}',
    '.cxBtns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}',
    '.cxBtn{border:0;border-radius:999px;padding:12px 20px;font:inherit;font-weight:800;font-size:15px;cursor:pointer;background:var(--accent,#C8102E);color:#fff}',
    '.cxBtn.alt{background:rgba(127,127,127,.15);color:inherit}',
    '.cxBtn.playing{opacity:.7}',
    '.cxVar{margin-top:16px;border-top:1px solid var(--line,#ECE3D4);padding-top:10px}',
    '.cxVarRow{display:grid;grid-template-columns:auto 1fr auto;gap:8px 10px;align-items:center;padding:7px 0;border-bottom:1px dashed rgba(127,127,127,.2);font-size:14px}',
    '.cxVarRow:last-child{border-bottom:0}',
    '.cxVarT{font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;color:var(--soft,#8C8273);min-width:70px}',
    '.cxVarEs{font-weight:700}.cxVarEs small{display:block;font-weight:600;color:var(--blue,#1E7FA8);font-size:12.5px}',
    '.cxVarPlay{border:0;background:rgba(127,127,127,.15);color:inherit;border-radius:50%;width:32px;height:32px;cursor:pointer}',
    '.cxEntry{position:absolute;top:14px;left:50%;transform:translateX(-50%);z-index:6;display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(255,255,255,.28);background:rgba(255,255,255,.14);color:inherit;border-radius:999px;padding:8px 14px;font:inherit;font-size:13px;font-weight:800;letter-spacing:.2px;cursor:pointer;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:0 6px 18px rgba(0,0,0,.14);white-space:nowrap}',
    '.cxEntry:active{transform:translateX(-50%) scale(.97)}',
    'body.ambclair .cxEntry{background:rgba(55,45,65,.10);border-color:rgba(55,45,65,.18)}'
  ].join('\n');
  document.head.appendChild(css);

  /* ---------- Rendu ---------- */
  var panel = null;
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function ensurePanel() {
    if (panel) return panel;
    panel = el('div', 'cxPanel');
    panel.addEventListener('click', function (e) { if (e.target === panel) close(); });
    document.body.appendChild(panel);
    return panel;
  }

  function render() {
    var D = data(); if (!D) return;
    var T = L();
    var st = D.structures[state.s];
    var items = st.takes === 'noun' ? D.nouns : D.actions;
    if (state.a >= items.length) state.a = 0;
    var item = items[state.a];
    var r = build(D, st, state.t, item);
    var showFr = (typeof nat === 'string' ? nat : 'fr') === 'fr';

    var sheet = el('div', 'cxSheet');
    var head = el('div', 'cxHead'); head.appendChild(el('b', null, '🧩 ' + T.title));
    var x = el('button', 'cxClose', '✕'); x.onclick = close; head.appendChild(x); sheet.appendChild(head);
    sheet.appendChild(el('p', 'cxSub', T.sub));
    var card = el('div', 'cxCard');
    card.appendChild(el('p', 'cxText', r.text));
    var pb = el('div', 'cxPhonBox'); pb.appendChild(el('span', 'cxPhonLbl', T.phon)); pb.appendChild(el('span', 'cxPhon', r.phon)); card.appendChild(pb);
    if (showFr) card.appendChild(el('p', 'cxFr', r.fr));
    var btns = el('div', 'cxBtns');
    var play = el('button', 'cxBtn', T.listen);
    play.onclick = function () { say(r.text, play); };
    var rnd = el('button', 'cxBtn alt', T.random);
    rnd.onclick = function () { state.s = Math.floor(Math.random() * D.structures.length); state.t = D.tenses[Math.floor(Math.random() * D.tenses.length)]; var its = D.structures[state.s].takes === 'noun' ? D.nouns : D.actions; state.a = Math.floor(Math.random() * its.length); render(); };
    btns.appendChild(play); btns.appendChild(rnd); card.appendChild(btns);
    sheet.appendChild(card);


    sheet.appendChild(el('div', 'cxLbl', T.structure));
    var sc = el('div', 'cxChips');
    D.structures.forEach(function (s, i) {
      var c = el('button', 'cxChip' + (i === state.s ? ' on' : ''), s.label);
      c.onclick = function () { var wasNoun = D.structures[state.s].takes === 'noun'; state.s = i; if (wasNoun !== (s.takes === 'noun')) state.a = 0; render(); };
      sc.appendChild(c);
    });
    sheet.appendChild(sc);

    sheet.appendChild(el('div', 'cxLbl', T.tense));
    var tc = el('div', 'cxChips');
    D.tenses.forEach(function (t) {
      var c = el('button', 'cxChip' + (t === state.t ? ' on' : ''), T.tenses[t]);
      c.onclick = function () { state.t = t; render(); };
      tc.appendChild(c);
    });
    sheet.appendChild(tc);

    sheet.appendChild(el('div', 'cxLbl', T.action));
    var ac = el('div', 'cxActions'); var lastTheme = null; var chips = null;
    items.forEach(function (a, i) {
      if (a[3] !== lastTheme) { lastTheme = a[3]; ac.appendChild(el('div', 'cxTheme', T.themes[a[3]] || a[3])); chips = el('div', 'cxChips'); ac.appendChild(chips); }
      var c = el('button', 'cxChip' + (i === state.a ? ' on' : ''), showFr ? a[2] : a[0]);
      c.onclick = function () { state.a = i; render(); };
      chips.appendChild(c);
    });
    sheet.appendChild(ac);

    var v = el('div', 'cxVar'); v.appendChild(el('div', 'cxLbl', T.variants));
    D.tenses.forEach(function (t) {
      var rr = build(D, st, t, item);
      var row = el('div', 'cxVarRow');
      row.appendChild(el('span', 'cxVarT', T.tenses[t]));
      row.appendChild(el('span', 'cxVarEs', rr.text + '<small>' + rr.phon + (showFr ? ' · ' + rr.fr : '') + '</small>'));
      var p = el('button', 'cxVarPlay', '🔊'); p.onclick = function () { say(rr.text, p); }; row.appendChild(p);
      v.appendChild(row);
    });
    sheet.appendChild(v);

    var P = ensurePanel(); P.innerHTML = ''; P.appendChild(sheet);
  }

  function say(text, btn) {
    try { if (typeof speak === 'function') { speak(text, btn); setTimeout(function () { btn.classList.remove('playing'); }, 4000); } } catch (e) {}
  }
  function open() { if (!data()) return; render(); ensurePanel().classList.add('on'); }
  function close() { if (panel) panel.classList.remove('on'); }
  window.openConstruire = open;
  window.closeConstruire = close;

  /* ---------- Entrée sur la carte de leçon : visible seulement si des données existent pour la langue étudiée ---------- */
  function syncMenu() {
    var has = !!data();
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
    var origSet = window.setLang;
    if (typeof origSet === 'function' && !origSet.__cx) {
      window.setLang = function () { var r = origSet.apply(this, arguments); syncMenu(); return r; };
      window.setLang.__cx = true;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true }); else install();
  setTimeout(syncMenu, 1200); setTimeout(syncMenu, 3000);
})();

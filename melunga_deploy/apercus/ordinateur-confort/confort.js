/* Read-only desktop layout mockups. No account, audio or progression API. */
(() => {
  'use strict';
  const stage = document.getElementById('prototypeStage');
  const status = document.getElementById('reviewStatus');
  const query = new URL(location.href).searchParams;
  let variant = ['a','b','c'].includes(query.get('variant')) ? query.get('variant') : 'b';
  let view = query.get('view') === 'lesson' ? 'lesson' : 'themes';
  let source, themeIndex = 0, cardIndex = 0, pageIndex = 0, statusTimer;
  let layoutCleanup = () => {};
  const variants = {
    a: {name:'1 · Vue centrée',description:'Une zone de 1 040 pixels, trois colonnes de thèmes, une barre de défilement contrastée et 48 pixels d’espace en bas.'},
    b: {name:'2 · Lecture calme',description:'Deux colonnes dans une zone de 980 pixels. Les photos accompagnent les titres sur le côté ; la leçon est resserrée à 880 pixels, avec 60 pixels libres en bas.'},
    c: {name:'3 · Par pages',description:'Une zone de 920 pixels. Quatre thèmes par page et des boutons Précédents / Suivants remplacent le défilement intérieur. Une marge de 56 pixels et deux liens juridiques discrets en bas.'}
  };
  const svg = paths => '<svg viewBox="0 0 24 24" aria-hidden="true">'+paths+'</svg>';
  const icons = {
    folder:svg('<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/><path d="M3 11h18"/>'),
    review:svg('<path d="M3 10a9 9 0 1 1 2 9m-2-9h6M3 10V4"/>'),
    cap:svg('<path d="m2 9 10-5 10 5-10 5L2 9Zm4 2v6c4 3 8 3 12 0v-6m4-2v8"/>'),
    menu:svg('<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>'),
    speaker:svg('<path d="m11 5-5 4H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>'),
    arrow:svg('<path d="M4 12h16m-6-6 6 6-6 6"/>'),
    down:svg('<path d="M12 4v16m-6-6 6 6 6-6"/>'),
    left:svg('<path d="m14 5-7 7 7 7"/>'),
    right:svg('<path d="m10 5 7 7-7 7"/>'),
    headphones:svg('<path d="M4 14v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="12" width="5" height="9" rx="2"/><rect x="16" y="12" width="5" height="9" rx="2"/>'),
    info:svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>'),
    person:svg('<circle cx="12" cy="7" r="3.3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3"/>')
  };
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number = n => String(n).padStart(2,'0');
  const theme = () => source.themes[themeIndex];
  const card = () => theme().cards[cardIndex];
  const photo = t => {
    const p = t.photo;
    if (!p) return '';
    return '<span class="theme-photo" aria-hidden="true" data-photo-theme="'+escape(t.id)+'" style="--photo-column:'+Number(p.column)+';--photo-row:'+Number(p.row)+';--photo-columns:'+Number(p.columns||3)+';--photo-rows:'+Number(p.rows||4)+'"><img src="../../'+escape(p.asset)+'" alt="" decoding="async" draggable="false"></span>';
  };
  function announce(message) {
    clearTimeout(statusTimer); status.textContent = message; status.hidden = false;
    statusTimer = setTimeout(() => {status.hidden = true;}, 3000);
  }
  function updateQuery() {
    const url = new URL(location.href);url.searchParams.set('variant',variant);url.searchParams.set('view',view);history.replaceState(null,'',url);
  }
  function renderHeading() {
    return '<header class="student-heading"><div class="theme-name">'+(view==='lesson'?photo(theme()):'')+'<div class="theme-copy">'+(view==='lesson'?'<p>'+escape(source.levelTitle)+'</p>':'')+'<h1>'+escape(view==='lesson'?theme().title:source.levelTitle)+'</h1></div></div><div class="student-context" aria-label="Niveau, langue et couleur"><button type="button" class="context-pill context-level" data-explain="Niveaux" aria-label="Niveau 1">L1</button><button type="button" class="context-pill" data-explain="Langues" aria-label="Espagnol"><span class="flag-es" aria-hidden="true"></span></button><button type="button" class="context-pill" data-explain="Couleur" aria-label="Couleur"><span class="color-wheel" aria-hidden="true"></span></button></div></header>';
  }
  const progress = () => '<div class="level-progress" role="progressbar" aria-label="Progression du niveau" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"><strong>0 %</strong><span>Fin</span></div>';
  function tile(t,index) {
    return '<button type="button" class="theme-tile" data-theme-index="'+index+'" aria-label="'+escape(t.title+', '+t.quantity)+'">'+photo(t)+'<span class="tile-number" aria-hidden="true">'+number(index+1)+'</span><span class="tile-copy"><strong>'+escape(t.title)+'</strong><small>'+escape(t.quantity)+'</small></span></button>';
  }
  function themes() {
    if (variant==='c') {
      const first=pageIndex*4, items=source.themes.slice(first,first+4);
      return '<section class="theme-paged" aria-label="Liste des thèmes par pages"><div class="theme-grid">'+items.map((t,i)=>tile(t,first+i)).join('')+'</div><nav class="page-controls" aria-label="Pages de thèmes"><button type="button" data-page="previous"'+(pageIndex===0?' disabled':'')+'>'+icons.left+'Précédents</button><span class="page-label" aria-live="polite">'+(first+1)+'–'+Math.min(first+4,source.themes.length)+' sur '+source.themes.length+'</span><button type="button" data-page="next"'+(first+4>=source.themes.length?' disabled':'')+'>Suivants'+icons.right+'</button></nav></section>';
    }
    let section = null;
    const tiles=source.themes.map((t,index)=>{
      let heading='';if(t.section!==section){section=t.section;heading='<h2 class="theme-section">'+(section==='situations'?'Situations':'Vocabulaire et nombres')+'</h2>';}
      return heading+tile(t,index);
    }).join('');
    return '<section class="theme-body" aria-label="Tous les thèmes"><div class="themes-scroll-frame"><div class="themes-scroll" tabindex="0" aria-label="Faire défiler les thèmes"><div class="theme-grid">'+tiles+'</div></div><div class="scroll-rail" data-scroll-rail aria-hidden="true"><div class="scroll-thumb" data-scroll-thumb></div></div></div><div class="scroll-controls"><button type="button" class="scroll-more" data-scroll-more>Autres thèmes'+icons.down+'</button><span class="scroll-end" hidden>Tous les thèmes sont affichés</span></div></section>';
  }
  function lesson() {
    const c=card();
    return '<div class="lesson-toolbar"><button type="button" class="back-themes" data-go-themes>'+icons.left+'Thèmes</button><span class="lesson-counter">'+(cardIndex+1)+' / '+theme().cards.length+'</span></div><div class="lesson-track" aria-hidden="true"><span style="width:'+((cardIndex+1)/theme().cards.length*100)+'%"></span></div><section class="lesson-card" data-card-id="'+escape(c.id)+'" aria-label="Carte à pratiquer"><header class="lesson-card-top"><span class="sequence-number">'+number(themeIndex+1)+'</span><div class="lesson-card-tools">'+icons.headphones+'<button type="button" data-explain="Aide" aria-label="Aide pour cette carte">'+icons.info+'</button></div></header><div class="lesson-body"><p class="lesson-study" lang="es">'+escape(c.study)+'</p><div class="lesson-phonetic"><p>'+escape(c.phon)+'</p></div><p class="lesson-meaning" lang="fr">'+escape(c.native)+'</p><div class="lesson-actions"><button type="button" data-review>'+icons.review+'<span>À revoir</span></button><button type="button" data-listen>'+icons.speaker+'<span>Écouter</span></button><button type="button" class="continue" data-next><span>Continuer</span>'+icons.arrow+'</button></div></div></section>';
  }
  function setupScrollRail(scroller, more, rail) {
    const thumb=rail.querySelector('[data-scroll-thumb]'),end=stage.querySelector('.scroll-end');
    let drag=null,frame=0;
    const metrics=()=>{
      const height=rail.clientHeight,maxScroll=Math.max(0,scroller.scrollHeight-scroller.clientHeight);
      const thumbHeight=Math.min(height,Math.max(64,height*scroller.clientHeight/Math.max(1,scroller.scrollHeight)));
      return {height,maxScroll,thumbHeight,travel:Math.max(0,height-thumbHeight)};
    };
    const update=()=>{
      const m=metrics(),bottom=scroller.scrollTop+scroller.clientHeight>=scroller.scrollHeight-3;
      thumb.style.height=m.thumbHeight+'px';
      thumb.style.transform='translateY('+(m.maxScroll?m.travel*scroller.scrollTop/m.maxScroll:0)+'px)';
      rail.hidden=m.maxScroll===0;more.hidden=bottom;end.hidden=!bottom;
    };
    const scrollMore=()=>scroller.scrollBy({top:Math.max(150,scroller.clientHeight*.75),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    const pointerDown=event=>{
      if(event.button!==0)return;
      event.preventDefault();scroller.focus({preventScroll:true});
      if(event.target===thumb){
        drag={id:event.pointerId,offset:event.clientY-thumb.getBoundingClientRect().top};
        rail.setPointerCapture(event.pointerId);
      }else{
        const direction=event.clientY<thumb.getBoundingClientRect().top?-1:1;
        scroller.scrollBy({top:direction*scroller.clientHeight*.9,behavior:'instant'});
        update();
      }
    };
    const pointerMove=event=>{
      if(!drag||event.pointerId!==drag.id)return;
      const m=metrics(),position=event.clientY-rail.getBoundingClientRect().top-rail.clientTop-drag.offset;
      scroller.scrollTop=m.travel?Math.max(0,Math.min(m.travel,position))/m.travel*m.maxScroll:0;
      update();
    };
    const pointerEnd=event=>{
      if(!drag||event.pointerId!==drag.id)return;
      const id=drag.id;drag=null;
      if(rail.hasPointerCapture(id))rail.releasePointerCapture(id);
    };
    const resize=new ResizeObserver(update);
    resize.observe(scroller);resize.observe(rail);resize.observe(scroller.firstElementChild);
    scroller.addEventListener('scroll',update,{passive:true});more.addEventListener('click',scrollMore);
    rail.addEventListener('pointerdown',pointerDown);rail.addEventListener('pointermove',pointerMove);
    rail.addEventListener('pointerup',pointerEnd);rail.addEventListener('pointercancel',pointerEnd);rail.addEventListener('lostpointercapture',pointerEnd);
    frame=requestAnimationFrame(update);
    return ()=>{
      cancelAnimationFrame(frame);resize.disconnect();
      scroller.removeEventListener('scroll',update);more.removeEventListener('click',scrollMore);
      rail.removeEventListener('pointerdown',pointerDown);rail.removeEventListener('pointermove',pointerMove);
      rail.removeEventListener('pointerup',pointerEnd);rail.removeEventListener('pointercancel',pointerEnd);rail.removeEventListener('lostpointercapture',pointerEnd);
      if(drag&&rail.hasPointerCapture(drag.id))rail.releasePointerCapture(drag.id);
      drag=null;
    };
  }
  function render() {
    layoutCleanup(); layoutCleanup = () => {};
    const screenHeading=renderHeading();
    stage.innerHTML='<section class="student variant-'+variant+'" data-view="'+view+'" aria-label="Écran élève proposé"><header class="student-top"><a href="?variant='+variant+'&view=themes" class="student-brand" data-go-themes aria-label="Melunga, revenir aux thèmes"><img src="../../melunga-logo.png" alt=""><span>Melunga</span></a><nav class="student-nav" aria-label="Apprendre"><button type="button" class="is-active" data-go-themes>'+icons.folder+'Thèmes</button><button type="button" data-explain="À revoir">'+icons.review+'À revoir</button><button type="button" data-explain="Révisions">'+icons.cap+'Révisions</button></nav><button type="button" class="student-menu-button" data-menu aria-expanded="false" aria-controls="studentMenu">'+icons.menu+'Menu</button><nav id="studentMenu" class="student-menu" aria-label="Menu secondaire" hidden><strong>Menu</strong><button type="button" data-explain="Voix">'+icons.headphones+'Voix</button><button type="button" data-explain="Aide">'+icons.info+'Comment ça marche</button><button type="button" data-explain="Mon compte">'+icons.person+'Mon compte</button><hr><a href="https://melunga.com/terms.html" target="_blank" rel="noopener">Conditions générales</a><a href="https://melunga.com/privacy.html" target="_blank" rel="noopener">Confidentialité</a></nav></header><main class="student-main">'+screenHeading+(view==='themes'?progress()+themes():lesson())+'</main>'+(variant==='c'?'<footer class="student-legal"><a href="https://melunga.com/terms.html" target="_blank" rel="noopener">Conditions générales</a><a href="https://melunga.com/privacy.html" target="_blank" rel="noopener">Confidentialité</a></footer>':'')+'</section>';
    stage.querySelectorAll('[data-go-themes]').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();view='themes';render();}));
    stage.querySelectorAll('[data-explain]').forEach(button=>button.addEventListener('click',()=>announce(button.dataset.explain+' : fonction conservée dans le parcours publié.')));
    stage.querySelectorAll('[data-theme-index]').forEach(button=>button.addEventListener('click',()=>{themeIndex=Number(button.dataset.themeIndex);cardIndex=0;view='lesson';render();}));
    stage.querySelector('[data-next]')?.addEventListener('click',()=>{cardIndex=(cardIndex+1)%theme().cards.length;render();});
    stage.querySelector('[data-listen]')?.addEventListener('click',()=>announce('Audio simulé dans cette maquette.'));
    stage.querySelector('[data-review]')?.addEventListener('click',()=>announce('Maquette : aucune carte n’est enregistrée.'));
    stage.querySelectorAll('[data-page]').forEach(button=>button.addEventListener('click',()=>{pageIndex+=button.dataset.page==='next'?1:-1;render();}));
    const scroller=stage.querySelector('.themes-scroll'),more=stage.querySelector('[data-scroll-more]');
    if(scroller&&more) layoutCleanup=setupScrollRail(scroller,more,stage.querySelector('[data-scroll-rail]'));
    const menu=stage.querySelector('.student-menu'),menuButton=stage.querySelector('[data-menu]');
    menuButton.addEventListener('click',()=>{menu.hidden=!menu.hidden;menuButton.setAttribute('aria-expanded',String(!menu.hidden));});
    document.querySelectorAll('[data-variant]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.variant===variant)));
    document.querySelectorAll('[data-view]').forEach(button=>{if(button.tagName==='BUTTON')button.setAttribute('aria-pressed',String(button.dataset.view===view));});
    document.getElementById('proposalName').textContent=variants[variant].name;
    document.getElementById('proposalDescription').textContent=variants[variant].description;
    document.body.dataset.variant=variant;document.body.dataset.view=view;updateQuery();
  }
  document.querySelectorAll('.review-variants [data-variant]').forEach(button=>button.addEventListener('click',()=>{variant=button.dataset.variant;render();}));
  document.querySelectorAll('.review-views [data-view]').forEach(button=>button.addEventListener('click',()=>{view=button.dataset.view;render();}));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){const menu=stage.querySelector('.student-menu');if(menu)menu.hidden=true;stage.querySelector('[data-menu]')?.setAttribute('aria-expanded','false');document.querySelector('.review-details').open=false;}});
  document.body.classList.toggle('is-capture',query.get('capture')==='1');
  window.MelungaComfortPreview=Object.freeze({state:()=>Object.freeze({variant,view,themeId:source?theme().id:null,cardId:source&&view==='lesson'?card().id:null,page:pageIndex+1,totalThemes:source?.themes.length||0})});
  const embedded=document.getElementById('comfort-source');
  const ready=embedded?Promise.resolve().then(()=>JSON.parse(embedded.textContent)):fetch('source.json',{credentials:'omit'}).then(response=>{if(!response.ok)throw new Error('Missing source');return response.json();});
  ready.then(data=>{source=data;render();}).catch(()=>{stage.innerHTML='<p class="preview-loading">La maquette n’a pas pu se charger. <a href="index.html">Réessayer</a></p>';});
})();

/* Responsive presentation: desktop controls, the mobile thumbnail and the approved mobile dock. */
(() => {
  'use strict';

  const byId = id => document.getElementById(id);
  const nodes = {
    app: document.querySelector('.mg-app'), main: document.querySelector('.mg-main'),
    brand: document.querySelector('.mg-brand'), controls: document.querySelector('.mg-controls'),
    nav: byId('mgDesktopNav'), menu: byId('mgMenuTrigger'), model: byId('mgModel'),
    lessonTheme: byId('mgLessonTheme'), listen: byId('mgListen'), next: byId('mgContinue'),
    footer: byId('mgFooter'), done: byId('mgDone'), tools: byId('mgModelTools'),
    reading: byId('mgReadingToggle'),
    level: byId('mgLevelTrigger'), language: byId('mgLanguageTrigger'), palette: byId('mgPalette'),
    phonrow: byId('mgPhonrow'), phon: byId('mgPhon'),
    themeGrid: byId('mgThemeGrid'), themeTitle: byId('mgThemeHeading'),
    themeHeading: document.querySelector('#mgThemeView .mg-sectionhead'),
    sequenceHeading: document.querySelector('#mgSequenceView .mg-sectionhead')
  };
  if (Object.values(nodes).some(node => !node)) return;

  const media = window.matchMedia('(min-width: 1101px)');
  const mobileMedia = window.matchMedia('(max-width: 760px)');
  const slots = new Map();
  const mobileSlots = new Map();
  const gridVisibility = new Map();
  const labels = {
    fr: {previous:'Précédents', next:'Suivants', pages:'Pages de thèmes', of:'sur', phonetic:'Phonétique', terms:'Conditions générales', privacy:'Confidentialité', legal:'Documents juridiques'},
    en: {previous:'Previous', next:'Next', pages:'Topic pages', of:'of', phonetic:'Phonetics', terms:'Terms and Conditions', privacy:'Privacy', legal:'Legal documents'},
    es: {previous:'Anteriores', next:'Siguientes', pages:'Páginas de temas', of:'de', phonetic:'Fonética', terms:'Términos', privacy:'Privacidad', legal:'Documentos legales'},
    it: {previous:'Precedenti', next:'Successivi', pages:'Pagine degli argomenti', of:'di', phonetic:'Fonetica', terms:'Termini', privacy:'Privacy', legal:'Documenti legali'},
    zh: {previous:'上一页', next:'下一页', pages:'主题分页', of:'/', phonetic:'发音提示', terms:'服务条款', privacy:'隐私政策', legal:'法律文件'},
    ja: {previous:'前へ', next:'次へ', pages:'テーマのページ', of:'/', phonetic:'発音ガイド', terms:'利用規約', privacy:'プライバシー', legal:'法的文書'},
    ko: {previous:'이전', next:'다음', pages:'주제 페이지', of:'/', phonetic:'발음 표기', terms:'이용약관', privacy:'개인정보', legal:'법적 문서'}
  };
  const mobileLabels = {
    fr: {language:'Langue', nextStep:'Suivant'},
    en: {language:'Language', nextStep:'Next'},
    es: {language:'Idioma', nextStep:'Siguiente'},
    it: {language:'Lingua', nextStep:'Avanti'},
    zh: {language:'语言', nextStep:'下一步'},
    ja: {language:'言語', nextStep:'次へ'},
    ko: {language:'언어', nextStep:'다음'}
  };
  let layout = null, pending = 0, moved = false;
  let mobileDock = null;
  let mobilePhoto = null, mobilePhotoSource = null;
  let pageIndex = 0, pageKey = '', firstGridNode = null, previousView = '', selectedThemeId = null;
  const locale = () => {
    const value = document.documentElement.lang.split('-')[0];
    return Object.hasOwn(labels, value) ? value : 'fr';
  };

  function move(node, parent, before = null) {
    if (node.parentNode === parent && (!before || node.nextSibling === before)) return;
    if (!slots.has(node)) {
      const marker = document.createComment('desktop slot');
      node.parentNode.insertBefore(marker, node);
      slots.set(node, marker);
    }
    parent.insertBefore(node, before);
    moved = true;
  }

  function restore(node) {
    const marker = slots.get(node);
    if (!marker?.parentNode || node.parentNode === marker.parentNode && node.previousSibling === marker) return;
    marker.parentNode.insertBefore(node, marker.nextSibling);
    moved = true;
  }

  function setText(node, value) {
    if (node.textContent !== value) {
      node.textContent = value;
      moved = true;
    }
  }

  function createLayout() {
    const header = document.createElement('header');
    header.className = 'mg-desktop-header';
    const heading = document.createElement('div');
    heading.className = 'mg-desktop-heading';
    const titles = document.createElement('div');
    titles.className = 'mg-desktop-heading-copy';
    const photo = document.createElement('div');
    photo.className = 'mg-desktop-theme-photo';
    photo.setAttribute('aria-hidden', 'true');
    photo.hidden = true;
    const levelTitle = document.createElement('p');
    levelTitle.className = 'mg-desktop-level-title';
    levelTitle.hidden = true;
    const title = document.createElement('h1');
    title.className = 'mg-desktop-theme-title';
    titles.append(levelTitle, title);
    const context = document.createElement('div');
    context.className = 'mg-desktop-context';
    heading.append(photo, titles, context);
    nodes.app.prepend(header);
    nodes.main.prepend(heading);
    const listenLabel = document.createElement('span');
    listenLabel.className = 'mg-desktop-listen-text';
    nodes.listen.append(listenLabel);
    const menuLabel = document.createElement('span');
    menuLabel.className = 'mg-desktop-menu-text';
    nodes.menu.append(menuLabel);
    const pagination = document.createElement('nav');
    pagination.className = 'mg-desktop-pagination';
    const previous = document.createElement('button');
    previous.type = 'button'; previous.className = 'mg-desktop-page mg-desktop-page-previous'; previous.dataset.page = 'previous';
    const range = document.createElement('span');
    range.className = 'mg-desktop-page-range';
    range.setAttribute('role', 'status'); range.setAttribute('aria-live', 'polite');
    const nextPage = document.createElement('button');
    nextPage.type = 'button'; nextPage.className = 'mg-desktop-page mg-desktop-page-next'; nextPage.dataset.page = 'next';
    pagination.append(previous, range, nextPage);
    nodes.themeGrid.after(pagination);
    previous.addEventListener('click', () => {pageIndex = Math.max(0, pageIndex - 1); schedule();});
    nextPage.addEventListener('click', () => {
      const pages = Number(pagination.dataset.pages) || 1;
      pageIndex = Math.min(pages - 1, pageIndex + 1); schedule();
    });
    const legal = document.createElement('footer');
    legal.className = 'mg-desktop-legal';
    const terms = document.createElement('a'), privacy = document.createElement('a');
    for (const link of [terms, privacy]) {link.target = '_blank'; link.rel = 'noopener';}
    legal.append(terms, privacy); nodes.app.append(legal);
    const phoneticCaption = document.createElement('span');
    phoneticCaption.className = 'mg-desktop-phonetic-label';
    nodes.phonrow.prepend(phoneticCaption);
    layout = {header, heading, photo, levelTitle, titles, title, context, listenLabel, menuLabel,
      pagination, previous, range, nextPage, legal, terms, privacy, phoneticCaption, photoSource:null};
    document.body.classList.add('mg-desktop-course');
    moved = true;
  }

  function restoreLayout() {
    if (!layout) return;
    for (const node of [...slots.keys()].reverse()) restore(node);
    for (const marker of slots.values()) marker.remove();
    slots.clear();
    for (const [node, hidden] of gridVisibility) node.hidden = hidden;
    gridVisibility.clear();
    nodes.themeGrid.classList.remove('mg-desktop-paged');
    nodes.tools.classList.remove('mg-desktop-tools-empty');
    layout.listenLabel.remove(); layout.menuLabel.remove();
    layout.pagination.remove(); layout.legal.remove(); layout.phoneticCaption.remove();
    layout.header.remove(); layout.heading.remove();
    document.body.classList.remove('mg-desktop-course');
    layout = null;
    moved = true;
  }

  function refreshPagination(view) {
    const selected = window.MelungaMockup?.state();
    const key = selected?.pairId ? selected.pairId + ':' + selected.level : '';
    if (key !== pageKey) {pageKey = key; pageIndex = 0; selectedThemeId = null;}
    const children = [...nodes.themeGrid.children];
    for (const [node, hidden] of gridVisibility) {
      if (node.parentNode !== nodes.themeGrid) {node.hidden = hidden; gridVisibility.delete(node);}
    }
    for (const node of children) if (!gridVisibility.has(node)) gridVisibility.set(node, node.hidden);
    const tiles = children.filter(node => node.matches('.mg-theme') && !gridVisibility.get(node));
    if (selected?.themeId && ['lesson', 'done', 'sequences'].includes(view)) {
      selectedThemeId = selected.themeId;
      const index = tiles.findIndex(node => node.dataset.themeId === selectedThemeId);
      if (index >= 0) pageIndex = Math.floor(index / 4);
    } else if (children[0] !== firstGridNode) {
      const index = ['lesson', 'done', 'sequences'].includes(previousView) && selectedThemeId
        ? tiles.findIndex(node => node.dataset.themeId === selectedThemeId) : -1;
      pageIndex = index >= 0 ? Math.floor(index / 4) : 0;
    }
    firstGridNode = children[0] || null;
    const pages = Math.max(1, Math.ceil(tiles.length / 4));
    pageIndex = Math.min(Math.max(0, pageIndex), pages - 1);
    const first = pageIndex * 4;
    for (const node of children) {
      if (node.matches('.mg-grid-section')) node.hidden = true;
      else if (node.matches('.mg-theme')) {
        const index = tiles.indexOf(node);
        node.hidden = gridVisibility.get(node) || index < first || index >= first + 4;
      }
    }
    nodes.themeGrid.classList.add('mg-desktop-paged');
    const copy = labels[locale()];
    setText(layout.previous, '‹ ' + copy.previous);
    setText(layout.nextPage, copy.next + ' ›');
    setText(layout.range, tiles.length ? (first + 1) + '–' + Math.min(first + 4, tiles.length) + ' ' + copy.of + ' ' + tiles.length : '0 / 0');
    layout.pagination.setAttribute('aria-label', copy.pages);
    layout.pagination.dataset.page = String(pageIndex + 1);
    layout.pagination.dataset.pages = String(pages);
    layout.previous.disabled = pageIndex === 0;
    layout.nextPage.disabled = pageIndex === pages - 1;
    layout.pagination.hidden = !tiles.length;
    if (document.activeElement === layout.nextPage && layout.nextPage.disabled && !layout.previous.disabled) layout.previous.focus({preventScroll:true});
    else if (document.activeElement === layout.previous && layout.previous.disabled && !layout.nextPage.disabled) layout.nextPage.focus({preventScroll:true});
  }

  function refreshDesktopLabels() {
    const native = locale(), copy = labels[native];
    const language = ['fr', 'en', 'es', 'zh'].includes(native) ? native : 'en';
    const suffix = language === 'fr' ? '' : '-' + language;
    layout.legal.setAttribute('aria-label', copy.legal);
    for (const [node, key] of [[layout.terms, 'terms'], [layout.privacy, 'privacy']]) {
      node.href = key + suffix + '.html'; node.hreflang = language;
      setText(node, copy[key] + (native === language ? '' : ' (EN)'));
    }
    const pinyin = nodes.phonrow.dataset.readingMode === 'pinyin';
    setText(layout.phoneticCaption, pinyin
      ? window.MelungaCourseI18n?.t(native, 'Pinyin') || 'Pinyin' : copy.phonetic);
    layout.phoneticCaption.hidden = nodes.phon.hidden || nodes.phonrow.hidden || nodes.phonrow.classList.contains('is-recall');
  }

  function refreshThemePhoto(view) {
    const selected = window.MelungaMockup?.state();
    const hasTheme = ['lesson', 'done', 'sequences'].includes(view) && selected?.themeId;
    const tile = hasTheme ? [...nodes.themeGrid.children].find(node => node.dataset.themeId === selected.themeId) : null;
    const source = tile?.querySelector('.mg-theme-photo');
    if (layout.photoSource !== source) {
      const copy = source?.cloneNode(true);
      const image = copy?.querySelector('img');
      if (image) {
        image.loading = 'eager';
        image.addEventListener('error', () => image.remove(), {once:true});
      }
      layout.photo.replaceChildren(...(copy ? [copy] : []));
      layout.photoSource = source;
      moved = true;
    }
    layout.photo.hidden = !source;
    layout.levelTitle.hidden = !hasTheme;
    setText(layout.levelTitle, hasTheme ? nodes.themeTitle.textContent : '');
  }

  function removeMobilePhoto() {
    if (mobilePhoto) {
      mobilePhoto.remove();
      mobilePhoto = mobilePhotoSource = null;
      moved = true;
    }
    nodes.lessonTheme.parentElement.classList.remove('mg-has-theme-photo');
  }

  function refreshMobilePhoto() {
    const selected = window.MelungaMockup?.state();
    const hasTheme = ['lesson', 'done'].includes(document.body.dataset.view) && selected?.themeId;
    const tile = hasTheme ? [...nodes.themeGrid.children].find(node => node.dataset.themeId === selected.themeId) : null;
    const source = tile?.querySelector('.mg-theme-photo');
    if (!source) {removeMobilePhoto(); return;}
    if (mobilePhotoSource !== source || !mobilePhoto?.isConnected) {
      const copy = source.cloneNode(true);
      copy.classList.add('mg-mobile-theme-photo');
      copy.setAttribute('aria-hidden', 'true');
      const image = copy.querySelector('img');
      if (image) {
        image.loading = 'eager';
        image.alt = '';
        image.addEventListener('error', () => image.remove(), {once:true});
      }
      if (mobilePhoto) mobilePhoto.replaceWith(copy);
      else nodes.lessonTheme.before(copy);
      mobilePhoto = copy;
      mobilePhotoSource = source;
      moved = true;
    }
    nodes.lessonTheme.parentElement.classList.add('mg-has-theme-photo');
  }

  function moveMobile(node, parent) {
    if (node.parentNode === parent) return;
    if (!mobileSlots.has(node)) {
      const marker = document.createComment('mobile dock slot');
      node.before(marker);
      mobileSlots.set(node, marker);
    }
    parent.append(node);
    moved = true;
  }

  function createMobileDock() {
    const dock = document.createElement('nav');
    dock.className = 'mg-mobile-dock';
    const settings = document.createElement('div');
    settings.className = 'mg-dock-settings';
    const children = new Map(), captions = new Map();
    for (const button of [nodes.level, nodes.language, nodes.palette, nodes.menu]) {
      const original = [...button.childNodes];
      const icon = document.createElement('span');
      icon.className = 'mg-dock-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.append(...original);
      const caption = document.createElement('span');
      caption.className = 'mg-dock-label';
      button.replaceChildren(icon, caption);
      button.classList.add('mg-dock-control');
      children.set(button, original);
      captions.set(button, caption);
      moveMobile(button, settings);
    }
    const nextLabel = document.createElement('span');
    nextLabel.className = 'mg-dock-next-label';
    nodes.next.append(nextLabel);
    nodes.footer.classList.add('mg-dock-actions');
    dock.append(settings);
    moveMobile(nodes.footer, dock);
    nodes.app.append(dock);
    document.body.classList.add('mg-mobile-dock-course');
    const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
    mobileDock = {dock, settings, children, captions, nextLabel, resizeObserver};
    resizeObserver?.observe(dock);
    moved = true;
  }

  function restoreMobileDock() {
    if (!mobileDock) return;
    mobileDock.resizeObserver?.disconnect();
    for (const [node, marker] of [...mobileSlots.entries()].reverse()) {
      if (marker.parentNode) marker.after(node);
    }
    for (const marker of mobileSlots.values()) marker.remove();
    mobileSlots.clear();
    for (const [button, children] of mobileDock.children) {
      button.replaceChildren(...children);
      button.classList.remove('mg-dock-control');
    }
    nodes.footer.classList.remove('mg-dock-actions');
    mobileDock.nextLabel.remove();
    mobileDock.dock.remove();
    document.body.classList.remove('mg-mobile-dock-course');
    for (const property of ['--mg-mobile-dock-space', '--mg-dock-usable-height', '--mg-dock-obstruction']) {
      document.body.style.removeProperty(property);
    }
    mobileDock = null;
    moved = true;
  }

  function setMobileProperty(name, value) {
    if (document.body.style.getPropertyValue(name) !== value) {
      document.body.style.setProperty(name, value);
      moved = true;
    }
  }

  function measureMobileDock() {
    const viewport = window.visualViewport;
    let usableHeight = viewport && viewport.scale === 1
      ? Math.min(window.innerHeight, viewport.height) : window.innerHeight;
    // Match the core's external preview-toolbar reservation without changing its variable.
    for (const element of document.body.children) {
      if (element.matches('.mg-app,.mg-previewnotice,.mg-card-toast,dialog,script,style')) continue;
      const bounds = element.getBoundingClientRect();
      if (getComputedStyle(element).position === 'fixed' && bounds.width >= window.innerWidth * 0.4
          && bounds.height >= 20 && bounds.height <= 180 && bounds.top >= window.innerHeight * 0.6
          && bounds.bottom >= window.innerHeight - 4) usableHeight = Math.min(usableHeight, bounds.top - 6);
    }
    usableHeight = Math.max(0, Math.floor(usableHeight));
    const obstruction = Math.max(0, window.innerHeight - usableHeight);
    setMobileProperty('--mg-dock-usable-height', usableHeight + 'px');
    setMobileProperty('--mg-dock-obstruction', obstruction + 'px');
    const bottom = parseFloat(getComputedStyle(mobileDock.dock).bottom) || 0;
    const height = mobileDock.dock.getBoundingClientRect().height;
    const space = Math.ceil(height + Math.max(0, bottom - obstruction) + 8);
    setMobileProperty('--mg-mobile-dock-space', space + 'px');
  }

  function refreshMobileDock() {
    if (!mobileDock) createMobileDock();
    const native = locale();
    const t = key => window.MelungaCourseI18n?.t(native, key) || key;
    for (const [button, value] of [[nodes.level, t('Niveau')], [nodes.language, mobileLabels[native].language],
      [nodes.palette, t('Couleur')], [nodes.menu, t('Menu')]]) setText(mobileDock.captions.get(button), value);
    setText(mobileDock.nextLabel, mobileLabels[native].nextStep);
    const description = t('Rubriques');
    if (mobileDock.dock.getAttribute('aria-label') !== description) mobileDock.dock.setAttribute('aria-label', description);
    const inactive = document.body.dataset.view === 'loading';
    if (mobileDock.dock.inert !== inactive) mobileDock.dock.inert = inactive;
    measureMobileDock();
  }

  function refresh() {
    pending = 0;
    moved = false;
    if (!media.matches) {
      restoreLayout();
      refreshMobilePhoto();
      if (mobileMedia.matches) refreshMobileDock();
      else restoreMobileDock();
    } else {
      restoreMobileDock();
      removeMobilePhoto();
      if (!layout) createLayout();
      move(nodes.brand, layout.header);
      // Keep this whole node: buildMenu() replaces its children on each course change.
      move(nodes.nav, layout.header);
      move(nodes.menu, layout.header);
      move(nodes.controls, layout.context);
      const view = document.body.dataset.view;
      refreshPagination(view);
      refreshDesktopLabels();
      refreshThemePhoto(view);
      if (view === 'themes') move(nodes.themeHeading, layout.titles);
      else restore(nodes.themeHeading);
      if (view === 'sequences') move(nodes.sequenceHeading, layout.titles);
      else restore(nodes.sequenceHeading);
      layout.title.hidden = !['lesson', 'done'].includes(view);
      setText(layout.title, nodes.lessonTheme.getAttribute('aria-label') || nodes.lessonTheme.title || nodes.lessonTheme.textContent);
      setText(layout.listenLabel, nodes.listen.title || nodes.listen.getAttribute('aria-label') || '');
      setText(layout.menuLabel, nodes.menu.title || nodes.menu.getAttribute('aria-label') || '');
      nodes.tools.classList.toggle('mg-desktop-tools-empty', nodes.reading.hidden);
      if (view === 'lesson') {
        move(nodes.footer, nodes.model);
        move(nodes.listen, nodes.footer, nodes.next);
      } else {
        restore(nodes.listen);
        if (view === 'done') move(nodes.footer, nodes.done);
        else restore(nodes.footer);
      }
    }
    previousView = document.body.dataset.view;
    // Reuse the application's existing viewport fit and popup positioning.
    if (moved) window.dispatchEvent(new Event('resize'));
  }

  function schedule() {
    if (!pending) pending = requestAnimationFrame(refresh);
  }

  const observer = new MutationObserver(schedule);
  observer.observe(document.body, {attributes: true, attributeFilter: ['data-view'], childList: true});
  observer.observe(nodes.footer, {attributes: true, attributeFilter: ['hidden']});
  observer.observe(nodes.nav, {childList: true});
  observer.observe(nodes.themeGrid, {childList: true});
  observer.observe(nodes.themeTitle, {childList: true, characterData: true, subtree: true});
  observer.observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
  observer.observe(nodes.phonrow, {attributes:true, attributeFilter:['data-reading-mode', 'hidden', 'class']});
  observer.observe(nodes.phon, {childList:true, characterData:true, subtree:true, attributes:true, attributeFilter:['hidden']});
  observer.observe(nodes.lessonTheme, {childList: true, characterData: true, subtree: true,
    attributes: true, attributeFilter: ['title', 'aria-label']});
  observer.observe(nodes.listen, {attributes: true, attributeFilter: ['hidden', 'title', 'aria-label']});
  observer.observe(nodes.menu, {attributes: true, attributeFilter: ['title', 'aria-label']});
  observer.observe(nodes.reading, {attributes: true, attributeFilter: ['hidden']});
  if (media.addEventListener) media.addEventListener('change', schedule);
  else media.addListener(schedule);
  if (mobileMedia.addEventListener) mobileMedia.addEventListener('change', schedule);
  else mobileMedia.addListener(schedule);
  window.addEventListener('resize', schedule);
  window.visualViewport?.addEventListener('resize', schedule);
  window.MelungaDesktopCourse = Object.freeze({refresh: schedule});
  schedule();
})();

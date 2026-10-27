/* Desktop presentation only: move existing controls, then restore their exact slots. */
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
    themeGrid: byId('mgThemeGrid'), themeTitle: byId('mgThemeHeading'),
    themeHeading: document.querySelector('#mgThemeView .mg-sectionhead'),
    sequenceHeading: document.querySelector('#mgSequenceView .mg-sectionhead')
  };
  if (Object.values(nodes).some(node => !node)) return;

  const media = window.matchMedia('(min-width: 1101px)');
  const slots = new Map();
  let layout = null, pending = 0, moved = false;

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
    layout = {header, heading, photo, levelTitle, titles, title, context, listenLabel, menuLabel, photoSource:null};
    document.body.classList.add('mg-desktop-course');
    moved = true;
  }

  function restoreLayout() {
    if (!layout) return;
    for (const node of [...slots.keys()].reverse()) restore(node);
    for (const marker of slots.values()) marker.remove();
    slots.clear();
    nodes.tools.classList.remove('mg-desktop-tools-empty');
    layout.listenLabel.remove(); layout.menuLabel.remove();
    layout.header.remove(); layout.heading.remove();
    document.body.classList.remove('mg-desktop-course');
    layout = null;
    moved = true;
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

  function refresh() {
    pending = 0;
    moved = false;
    if (!media.matches) {
      restoreLayout();
    } else {
      if (!layout) createLayout();
      move(nodes.brand, layout.header);
      // Keep this whole node: buildMenu() replaces its children on each course change.
      move(nodes.nav, layout.header);
      move(nodes.menu, layout.header);
      move(nodes.controls, layout.context);
      const view = document.body.dataset.view;
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
    // Reuse the application's existing viewport fit and popup positioning.
    if (moved) window.dispatchEvent(new Event('resize'));
  }

  function schedule() {
    if (!pending) pending = requestAnimationFrame(refresh);
  }

  const observer = new MutationObserver(schedule);
  observer.observe(document.body, {attributes: true, attributeFilter: ['data-view']});
  observer.observe(nodes.nav, {childList: true});
  observer.observe(nodes.themeGrid, {childList: true});
  observer.observe(nodes.themeTitle, {childList: true, characterData: true, subtree: true});
  observer.observe(nodes.lessonTheme, {childList: true, characterData: true, subtree: true,
    attributes: true, attributeFilter: ['title', 'aria-label']});
  observer.observe(nodes.listen, {attributes: true, attributeFilter: ['hidden', 'title', 'aria-label']});
  observer.observe(nodes.menu, {attributes: true, attributeFilter: ['title', 'aria-label']});
  observer.observe(nodes.reading, {attributes: true, attributeFilter: ['hidden']});
  if (media.addEventListener) media.addEventListener('change', schedule);
  else media.addListener(schedule);
  window.MelungaDesktopCourse = Object.freeze({refresh: schedule});
  schedule();
})();

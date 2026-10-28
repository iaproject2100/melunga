/* Mockups only: original shortcuts open the existing revision and voice panels. */
(() => {
  'use strict';
  const svg = path => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>';
  const refresh = () => {
    window.MelungaDesktopCourse.refresh();
    window.dispatchEvent(new Event('resize'));
  };
  function shortcut(panel, id) {
    const button=document.querySelector('#mgDesktopNav [data-menu-item="'+panel+'"]');
    if (!button) throw new Error('Missing original shortcut: '+panel);
    button.id=id;
    button.className='mg-round mg-dock-control mg-extra-shortcut';
    button.firstElementChild.className='mg-dock-icon';
    button.lastElementChild.className='mg-shortcut-label';
    return button;
  }
  function toggleButton(id, title, content) {
    const button=document.createElement('button');
    button.type='button';button.id=id;button.className='mg-round mg-dock-control';
    button.title=title;button.setAttribute('aria-label',title);
    const icon=document.createElement('span');icon.className='mg-dock-icon';icon.innerHTML=content;
    icon.setAttribute('aria-hidden','true');button.append(icon);return button;
  }
  window.MelungaRevisionVoiceProposal={
    apply(option) {
      if (![1,2,3,4].includes(option) || innerWidth>760 || document.body.dataset.shortcutsProposal) throw new Error('Fresh mobile mockup required');
      const dock=document.querySelector('.mg-mobile-dock'),settings=dock.querySelector('.mg-dock-settings');
      const level=document.getElementById('mgLevelTrigger'),language=document.getElementById('mgLanguageTrigger');
      const palette=document.getElementById('mgPalette'),menu=document.getElementById('mgMenuTrigger');
      const review=shortcut('review','mgRevisionShortcut'),voice=shortcut('voice','mgVoiceShortcut');
      document.body.dataset.shortcutsProposal=String(option);
      if (option===1) {
        const context=document.createElement('div');context.className='mg-shortcuts-context';
        context.setAttribute('aria-label','Niveau et langue');context.append(level,language);
        document.getElementById('mgCounter').before(context);
        settings.replaceChildren(review,voice,palette,menu);
      } else if (option===2) {
        settings.replaceChildren(level,language,palette,review,voice,menu);
      } else if (option===3) {
        const tray=document.createElement('div');tray.className='mg-shortcuts-tray';tray.id='mgShortcutSettingsTray';
        tray.setAttribute('aria-label','Réglages');tray.append(level,language,palette,menu);
        const more=toggleButton('mgShortcutSettingsToggle','Afficher ou masquer les réglages',svg('<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'));
        more.setAttribute('aria-expanded','true');more.setAttribute('aria-controls',tray.id);
        more.addEventListener('click',()=>{tray.hidden=!tray.hidden;more.setAttribute('aria-expanded',String(!tray.hidden));refresh();});
        settings.replaceChildren(review,voice,more);dock.prepend(tray);
      } else {
        const first=document.createElement('div'),second=document.createElement('div');
        first.className=second.className='mg-shortcuts-page';first.id='mgShortcutPage1';second.id='mgShortcutPage2';
        first.append(review,voice,level);second.append(language,palette,menu);second.hidden=true;
        const next=toggleButton('mgShortcutPageToggle','Autres commandes, groupe 1 sur 2',svg('<path d="m9 5 7 7-7 7"/>')+'<span class="mg-shortcuts-dots"><i></i><i></i></span>');
        next.setAttribute('aria-controls',first.id+' '+second.id);
        dock.dataset.shortcutsPage='1';
        next.addEventListener('click',()=>{
          first.hidden=!first.hidden;second.hidden=!second.hidden;
          dock.dataset.shortcutsPage=first.hidden?'2':'1';
          next.setAttribute('aria-label','Autres commandes, groupe '+dock.dataset.shortcutsPage+' sur 2');
          refresh();
        });
        settings.replaceChildren(first,second,next);
      }
      refresh();
    }
  };
})();

/* Review-only: move the original listening control into the thumb area. */
(() => {
  'use strict';
  const refresh=()=>{window.MelungaDesktopCourse.refresh();window.dispatchEvent(new Event('resize'));};
  function shortcut(panel,id){
    const button=document.querySelector('#mgDesktopNav [data-menu-item="'+panel+'"]');
    if(!button)throw new Error('Original shortcut missing: '+panel);
    button.id=id;button.className='mg-round mg-dock-control mg-extra-shortcut';
    button.firstElementChild.className='mg-dock-icon';button.lastElementChild.className='mg-shortcut-label';
    return button;
  }
  window.MelungaSpeakerDockProposal={
    apply(option){
      if(![1,2,3,4].includes(option)||innerWidth>760||document.body.dataset.speakerProposal)throw new Error('Fresh mobile mockup required');
      const byId=id=>document.getElementById(id),dock=document.querySelector('.mg-mobile-dock');
      const settings=dock.querySelector('.mg-dock-settings'),level=byId('mgLevelTrigger'),language=byId('mgLanguageTrigger');
      const review=shortcut('review','mgRevisionShortcut'),voice=shortcut('voice','mgVoiceShortcut');
      document.body.dataset.speakerProposal=String(option);
      const context=document.createElement('div');context.className='mg-speaker-context';context.setAttribute('aria-label','Niveau et langue');
      context.append(level,language);byId('mgCounter').before(context);
      settings.replaceChildren(review,voice,byId('mgPalette'),byId('mgMenuTrigger'));
      const listen=byId('mgListen'),tools=byId('mgModelTools'),reading=byId('mgReadingToggle');
      listen.classList.add('mg-speaker-dock-listen');dock.append(listen);
      let mirror=null,label=null;
      if(option===2){
        mirror=document.createElement('button');mirror.type='button';mirror.id='mgListenMirror';mirror.className='mg-listen mg-speaker-dock-listen mg-speaker-mirror';
        mirror.append(listen.querySelector('svg').cloneNode(true));mirror.addEventListener('click',()=>listen.click());dock.append(mirror);
      }
      if(option===4){label=document.createElement('span');label.className='mg-speaker-listen-label';listen.append(label);}
      const sync=()=>{
        tools.classList.toggle('mg-speaker-tools-empty',reading.hidden);
        if(label)label.textContent=listen.getAttribute('aria-label')||'Écouter la phrase';
        if(mirror){
          mirror.hidden=listen.hidden;mirror.disabled=listen.disabled;
          mirror.classList.toggle('is-playing',listen.classList.contains('is-playing'));
          for(const attribute of ['title','aria-label','aria-busy']){
            const value=listen.getAttribute(attribute);
            if(value===null)mirror.removeAttribute(attribute);else mirror.setAttribute(attribute,value);
          }
        }
      };
      new MutationObserver(sync).observe(listen,{attributes:true,attributeFilter:['hidden','disabled','title','aria-label','aria-busy','class']});
      new MutationObserver(sync).observe(reading,{attributes:true,attributeFilter:['hidden']});
      sync();refresh();
    }
  };
})();

/* Homepage v2: mobile menu + "choose your website" reminder */
(function(){
  var hdr=document.getElementById('top'), btn=document.querySelector('.mnav-btn'), menu=document.getElementById('mnav');
  function setMenu(open){
    if(!btn||!menu) return;
    btn.setAttribute('aria-expanded',open?'true':'false'); btn.setAttribute('aria-label',open?'Close menu':'Open menu');
    if(open) menu.removeAttribute('hidden'); else menu.setAttribute('hidden','');
    hdr&&hdr.classList.toggle('menu-open',open);
  }
  if(btn&&menu){
    btn.addEventListener('click',function(){ setMenu(btn.getAttribute('aria-expanded')!=='true'); });
    menu.addEventListener('click',function(e){ if(e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') setMenu(false); });
    document.addEventListener('click',function(e){ if(btn.getAttribute('aria-expanded')==='true'&&!e.target.closest('#top')) setMenu(false); });
    window.addEventListener('resize',function(){ if(innerWidth>1020) setMenu(false); });
  }

  /* reminder: shows after the hero, hides once the website choice is on screen,
     and stays out of the way of the AI captions and the SOS panel */
  var nudge=document.getElementById('nudge'), hero=document.querySelector('.hero'), paths=document.getElementById('paths');
  if(!nudge||!hero||!paths||!('IntersectionObserver' in window)) return;
  var pastHero=false, pickVisible=false, pickSeen=false, bridgeVisible=false, bridge=document.querySelector('.bridge');
  var cap=document.querySelector('.ai-cap'), sh=document.getElementById('sh');
  function upd(){
    var busy=(cap&&cap.classList.contains('on'))||(sh&&sh.open)||(hdr&&hdr.classList.contains('menu-open'));
    var show=pastHero&&!pickVisible&&!bridgeVisible&&!busy&&!(pickSeen&&paths.getBoundingClientRect().top<0);
    nudge.classList.toggle('show',show);
    nudge.setAttribute('aria-hidden',show?'false':'true'); nudge.tabIndex=show?0:-1;
  }
  new IntersectionObserver(function(es){ pastHero=!es[0].isIntersecting; upd(); },{threshold:0,rootMargin:'-40% 0px 0px 0px'}).observe(hero);
  new IntersectionObserver(function(es){ pickVisible=es[0].isIntersecting; if(pickVisible) pickSeen=true; upd(); },{threshold:0,rootMargin:'0px 0px -25% 0px'}).observe(paths);
  if(bridge) new IntersectionObserver(function(es){ bridgeVisible=es[0].isIntersecting; upd(); },{threshold:0}).observe(bridge);
  setInterval(upd,700);
})();

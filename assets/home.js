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

/* footer motto types itself out when the footer comes into view */
(function(){
  var el=document.querySelector('.ft2 .ft-tag'); if(!el) return;
  var full=el.textContent.trim();
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if(!('IntersectionObserver' in window)) return;
  el.setAttribute('aria-label',full);
  el.innerHTML='<span class="tw-text" aria-hidden="true"></span><span class="tw-caret" aria-hidden="true"></span><span class="tw-ghost" aria-hidden="true"></span>';
  var ghost=el.querySelector('.tw-ghost'), txt=el.querySelector('.tw-text'); ghost.textContent=full;
  var timer=null, busy=false;
  function type(){
    if(busy) return; busy=true; el.classList.add('typing'); var i=0; txt.textContent=''; ghost.textContent=full;
    (function step(){
      i++; txt.textContent=full.slice(0,i); ghost.textContent=full.slice(i);
      if(i<full.length){ var c=full.charAt(i-1); timer=setTimeout(step, c==='.'?380:(c===' '?70:48)); }
      else { busy=false; setTimeout(function(){ el.classList.remove('typing'); },2400); }
    })();
  }
  new IntersectionObserver(function(es){ if(es[0].isIntersecting) type(); },{threshold:.6}).observe(el);
})();

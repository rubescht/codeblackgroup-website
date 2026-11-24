/* Startups page: opening film (tries to start with sound), launch checklist, header shadow */
(function(){
  var $=function(id){ return document.getElementById(id); };
  var head=document.querySelector('.head');
  function sc(){ head.classList.toggle('sc', window.scrollY>10); }
  addEventListener('scroll', sc, {passive:true}); sc();

  /* film */
  var v=$('lfv'), sec=$('watch');
  if(v){
    var port = window.innerHeight > window.innerWidth*1.05;
    v.src = port ? v.dataset.port : v.dataset.land; if(port) v.poster=v.dataset.posterPort;
    var bar=$('lf-bar'), pb=$('lf-pause'), mb=$('lf-mute');
    function label(){ pb.textContent = v.paused ? 'Play' : 'Pause'; mb.textContent = v.muted ? 'Sound on' : 'Mute'; }
    function start(withSound){
      v.muted=!withSound; var p=v.play();
      if(p&&p.then) return p.then(function(){ sec.classList.add('on'); label(); });
      sec.classList.add('on'); label(); return Promise.resolve();
    }
    $('lf-play').addEventListener('click', function(){ if(v.ended) v.currentTime=0; start(true).catch(function(){}); });
    pb.addEventListener('click', function(){ if(v.paused){ v.play(); } else { v.pause(); } });
    mb.addEventListener('click', function(){ v.muted=!v.muted; if(!v.muted && v.paused) v.play(); label(); });
    $('lf-fs').addEventListener('click', function(){
      if(document.fullscreenElement){ document.exitFullscreen(); return; }
      if(sec.requestFullscreen) sec.requestFullscreen().catch(function(){}); else if(v.webkitEnterFullscreen) v.webkitEnterFullscreen();
    });
    v.addEventListener('play',label); v.addEventListener('pause',label); v.addEventListener('volumechange',label);
    v.addEventListener('timeupdate', function(){ if(v.duration) bar.style.width=(v.currentTime/v.duration*100)+'%'; });
    v.addEventListener('ended', function(){ sec.classList.remove('on'); sec.querySelector('.ov small').textContent='Watch again · with sound'; });
    /* start with sound where the browser allows it; otherwise wait for a tap */
    var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!RM){ start(true).catch(function(){ v.muted=true; }); }
    /* pause when scrolled away */
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){ es.forEach(function(e){
        if(!e.isIntersecting && !v.paused){ v.dataset.was='1'; v.pause(); }
        else if(e.isIntersecting && v.dataset.was==='1'){ v.dataset.was=''; v.play().catch(function(){}); }
      }); },{threshold:.25}).observe(sec);
    }
  }

  /* launch checklist, saved in this browser */
  var KEY='cbg-launch-list', boxes=[].slice.call(document.querySelectorAll('.list input')), saved={};
  if(boxes.length){
    try{ saved=JSON.parse(localStorage.getItem(KEY)||'{}')||{}; }catch(e){ saved={}; }
    boxes.forEach(function(b){ b.checked=!!saved[b.dataset.k]; });
    var render=function(){
      var n=0;
      boxes.forEach(function(b){ if(b.checked){ n++; saved[b.dataset.k]=1; } else delete saved[b.dataset.k]; });
      $('pg-n').textContent=n; $('pg-bar').style.width=(n/boxes.length*100)+'%';
      try{ localStorage.setItem(KEY, JSON.stringify(saved)); }catch(e){}
    };
    boxes.forEach(function(b){ b.addEventListener('change', render); });
    $('pg-reset').addEventListener('click', function(){ boxes.forEach(function(b){ b.checked=false; }); render(); });
    render();
  }
})();

/* Small + Medium Business page: menu, film, "I'm looking for help with" chips and the enquiry form */
(function(){
  var $=function(id){ return document.getElementById(id); };
  /* mobile menu */
  var mb=$('x-menu'), nav=$('x-nav');
  if(mb&&nav){
    mb.addEventListener('click',function(){ var o=nav.classList.toggle('open'); mb.setAttribute('aria-expanded',o?'true':'false'); });
    nav.addEventListener('click',function(e){ if(e.target.closest('a')){ nav.classList.remove('open'); mb.setAttribute('aria-expanded','false'); } });
  }
  /* brand film */
  var fd=$('film-dlg'), fv=$('film-v'), of=$('open-film');
  if(fd&&of){
    of.addEventListener('click',function(e){ e.preventDefault(); if(fd.showModal) fd.showModal(); else fd.setAttribute('open',''); try{ fv.play(); }catch(err){} });
    $('film-x').addEventListener('click',function(){ fd.close(); });
    fd.addEventListener('click',function(e){ if(e.target===fd) fd.close(); });
    fd.addEventListener('close',function(){ try{ fv.pause(); }catch(err){} });
  }
  /* "I'm looking for help with" chips pre-fill the form */
  var need=$('f-need');
  [].forEach.call(document.querySelectorAll('[data-need]'),function(a){ a.addEventListener('click',function(){ var v=a.getAttribute('data-need'); if(need&&v) need.value=v; }); });
  /* "Ask the group" prompt: carries the visitor's words into the enquiry form */
  var ask=$('ask'), q=$('ask-q');
  if(ask&&q){
    ask.addEventListener('submit',function(e){
      e.preventDefault(); var t=q.value.trim(), msg=$('f-msg');
      if(t&&msg&&!msg.value) msg.value=t;
      var s=$('start'); if(s) s.scrollIntoView({behavior:'smooth'});
      setTimeout(function(){ var f=$('f-first'); if(f) f.focus({preventScroll:true}); },500);
    });
  }

  /* enquiry form: same anti-spam check and server as before, emailed to vip@ */
  var form=$('enq'); if(!form) return;
  var GS_API='https://golden-shield.onrender.com/api/website-enquiry', powP=null;
  var POW_SRC="self.onmessage=async function(e){var s=e.data.salt,bits=e.data.bits,enc=new TextEncoder();for(var n=0;;n++){var h=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(s+':'+n)));var z=0;for(var i=0;i<h.length;i++){if(h[i]===0){z+=8;continue}z+=Math.clz32(h[i])-24;break}if(z>=bits){postMessage(n);return}}};";
  function solvePow(c){
    return new Promise(function(res,rej){
      try{ var w=new Worker(URL.createObjectURL(new Blob([POW_SRC],{type:'text/javascript'}))); w.onmessage=function(m){ w.terminate(); res(m.data); }; w.onerror=function(){ w.terminate(); rej(new Error('worker')); }; w.postMessage({salt:c.salt,bits:c.bits}); }
      catch(err){ rej(err); }
    }).catch(function(){
      var enc=new TextEncoder(), n=0;
      return (function step(){ return crypto.subtle.digest('SHA-256',enc.encode(c.salt+':'+n)).then(function(b){ var h=new Uint8Array(b),z=0; for(var i=0;i<h.length;i++){ if(h[i]===0){z+=8;continue} z+=Math.clz32(h[i])-24; break; } if(z>=c.bits) return n; n++; return step(); }); })();
    });
  }
  function startPow(){
    if(powP) return powP;
    powP=fetch(GS_API+'/challenge').then(function(r){ if(!r.ok) throw new Error('challenge '+r.status); return r.json(); })
      .then(function(c){ c.got=Date.now(); return solvePow(c).then(function(n){ c.nonce=n; return c; }); });
    powP.catch(function(){ powP=null; });
    return powP;
  }
  /* start the check quietly once someone begins filling in the form */
  form.addEventListener('focusin',function(){ startPow(); },{once:true});
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var msg=$('enq-msg'), first=$('f-first'), email=$('f-email'), btn=$('enq-send');
    msg.className='formmsg'; msg.textContent='';
    if(!first.value.trim()){ msg.textContent='Add your first name so we know who to ask for.'; msg.className='formmsg err'; first.focus(); return; }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())){ msg.textContent='Add an email we can reply to, for example name@company.com.au.'; msg.className='formmsg err'; email.focus(); return; }
    if($('f-hp').value) return;
    var d={first:first.value.trim(), last:$('f-last').value.trim(), email:email.value.trim(), phone:$('f-phone').value.trim(), company:$('f-company').value.trim()};
    d.message='Needs help with: '+$('f-need').value+($('f-msg').value.trim()?'\n\n'+$('f-msg').value.trim():'')+'\n\n(Small + Medium Business page)';
    try{ var _hsq=window._hsq=window._hsq||[]; _hsq.push(['identify',{email:d.email,firstname:d.first,lastname:d.last,phone:d.phone,company:d.company}]); _hsq.push(['trackPageView']); }catch(err){}
    btn.disabled=true; btn.textContent='Sending…';
    startPow().then(function(ch){ var wait=Math.max(0,4600-(Date.now()-ch.got)); return new Promise(function(r){ setTimeout(function(){ r(ch); },wait); }); })
    .then(function(ch){ powP=null; return fetch(GS_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({challenge:ch,first:d.first,last:d.last,email:d.email,phone:d.phone,company:d.company,message:d.message,page:location.href,website:''})}); })
    .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ if(!r.ok||!j.ok) throw new Error(j.error||'failed'); return j; }); })
    .then(function(){ msg.textContent='Thanks, '+d.first+'. Your enquiry has been sent and your account manager will be in touch.'; msg.className='formmsg ok'; btn.textContent='Sent'; form.reset(); })
    .catch(function(){
      var body='Name: '+(d.first+' '+d.last).trim()+'\nEmail: '+d.email+'\nPhone: '+(d.phone||'-')+'\nBusiness: '+(d.company||'-')+'\n\n'+d.message;
      var href='mailto:vip@codeblackgroup.com.au?subject='+encodeURIComponent('Website enquiry: '+(d.first+' '+d.last).trim()+(d.company?' ('+d.company+')':''))+'&body='+encodeURIComponent(body);
      msg.className='formmsg err'; msg.textContent='We couldn’t send that automatically. ';
      var a=document.createElement('a'); a.href=href; a.textContent='Email it to us instead'; msg.appendChild(a);
      msg.appendChild(document.createTextNode(' (it opens pre-filled), or call 1300 737 562.'));
      btn.disabled=false; btn.textContent='Book my free consult →';
    });
  });
})();

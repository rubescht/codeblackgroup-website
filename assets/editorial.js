(function(){
  var $=function(id){ return document.getElementById(id); };

  /* mobile menu */
  var mb=document.querySelector('.menu-btn'), mn=$('mnav');
  mb.addEventListener('click', function(){ var o=mn.classList.toggle('open'); mb.setAttribute('aria-expanded', String(o)); });
  mn.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ mn.classList.remove('open'); mb.setAttribute('aria-expanded','false'); }); });

  /* team photos: fall back to an elegant monogram if a photo can't load */
  document.querySelectorAll('.person img[data-mono]').forEach(function(im){
    function mono(){ var s=document.createElement('span'); s.className='mono'; s.setAttribute('aria-hidden','true'); s.textContent=im.getAttribute('data-mono'); im.replaceWith(s); }
    im.addEventListener('error', mono); if(im.complete && im.naturalWidth===0 && im.src) mono();
  });

  /* gentle reveal on scroll */
  var rv=document.querySelectorAll('.rv');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); },{rootMargin:'0px 0px -8% 0px'});
    rv.forEach(function(el){ io.observe(el); });
  } else rv.forEach(function(el){ el.classList.add('in'); });

  /* films open in a dialog and play with sound (the click allows it) */
  var dlg=$('film');
  if(dlg){ (function(){ var fv=dlg.querySelector('video');
  document.querySelectorAll('[data-film]').forEach(function(b){
    b.addEventListener('click', function(){
      fv.src=b.getAttribute('data-film'); fv.poster=b.getAttribute('data-poster')||''; fv.muted=false;
      if(dlg.showModal) dlg.showModal(); else dlg.setAttribute('open','');
      var p=fv.play(); if(p&&p.catch) p.catch(function(){});
    });
  });
  function closeFilm(){ fv.pause(); fv.removeAttribute('src'); fv.load(); if(dlg.close) dlg.close(); else dlg.removeAttribute('open'); }
  dlg.querySelector('.x').addEventListener('click', closeFilm);
  dlg.addEventListener('click', function(e){ if(e.target===dlg) closeFilm(); });
  dlg.addEventListener('cancel', function(){ fv.pause(); });

  })(); }

  /* enquiry form: same secure route as the main site (spam-proof challenge, then sent to vip@) */
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
  var form=$('enq');
  form.addEventListener('focusin', function(){ startPow().catch(function(){}); }, {once:true});
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var msg=$('form-msg'), first=$('f-first'), email=$('f-email');
    msg.className='msg';
    if(!first.value.trim()){ msg.textContent='Please add your first name.'; msg.className='msg err'; first.focus(); return; }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())){ msg.textContent='Please add a work email we can reply to.'; msg.className='msg err'; email.focus(); return; }
    if($('f-hp').value) return;
    var src=form.getAttribute('data-source')||'Website', topic=$('f-topic')?$('f-topic').value:'';
    var d={first:first.value.trim(), last:$('f-last').value.trim(), email:email.value.trim(), phone:$('f-phone').value.trim(), company:$('f-company').value.trim(), message:'['+src+(topic?' · '+topic:'')+'] '+$('f-message').value.trim()};
    var btn=$('send'); btn.disabled=true; btn.textContent='Sending…'; msg.textContent='';
    startPow().then(function(ch){ var wait=Math.max(0,4600-(Date.now()-ch.got)); return new Promise(function(r){ setTimeout(function(){ r(ch); },wait); }); })
    .then(function(ch){ powP=null; return fetch(GS_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({challenge:ch,first:d.first,last:d.last,email:d.email,phone:d.phone,company:d.company,message:d.message,page:location.href,website:$('f-hp').value})}); })
    .then(function(r){ return r.json().catch(function(){return {};}).then(function(j){ if(!r.ok||!j.ok) throw new Error(j.error||('HTTP '+r.status)); }); })
    .then(function(){ msg.textContent='Thank you, '+d.first+'. Your enquiry has been received and an account manager will be in touch.'; msg.className='msg ok'; btn.textContent='Sent'; form.reset(); })
    .catch(function(){
      var body='Name: '+(d.first+' '+d.last).trim()+'\nEmail: '+d.email+'\nPhone: '+(d.phone||'-')+'\nOrganisation: '+(d.company||'-')+'\n\n'+(d.message||'');
      var href='mailto:vip@codeblackgroup.com.au?subject='+encodeURIComponent('Website enquiry: '+(d.first+' '+d.last).trim()+(d.company?' ('+d.company+')':''))+'&body='+encodeURIComponent(body);
      msg.className='msg err'; msg.textContent='';
      msg.appendChild(document.createTextNode('We couldn’t send that automatically. '));
      var a=document.createElement('a'); a.href=href; a.textContent='Email it to us instead'; msg.appendChild(a);
      msg.appendChild(document.createTextNode(' (it opens pre-filled), or call 1300 737 562.'));
      btn.disabled=false; btn.textContent='Send enquiry';
    });
  });
})();

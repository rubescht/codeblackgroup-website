/* Code Black Group discovery engine.
   Each page defines window.CBG_DISCOVERY = {key, steps, compute, levels, ...} and a <div id="dlab"></div>.
   Answers are kept in this browser only; "Send my plan" fills the page's enquiry form. */
(function(){
  var C=window.CBG_DISCOVERY, root=document.getElementById('dlab');
  if(!C||!root) return;
  function el(t,c,txt){ var e=document.createElement(t); if(c) e.className=c; if(txt!=null) e.textContent=txt; return e; }
  var N=C.steps.length, A={}, cur=0;
  try{ var sv=JSON.parse(localStorage.getItem(C.key)||'null'); if(sv&&sv.a){ A=sv.a; } }catch(e){}
  function save(){ try{ localStorage.setItem(C.key, JSON.stringify({a:A})); }catch(e){} }

  /* ---------- build ---------- */
  var wiz=el('div','dl-wiz'), top=el('div','dl-top'), meta=el('div','dl-meta');
  var count=el('span','dl-count'); meta.appendChild(count); meta.appendChild(el('span','dl-time','About 60 seconds'));
  top.appendChild(meta);
  var steps=el('ol','dl-steps');
  C.steps.concat([{short:C.finalShort||'Your plan'}]).forEach(function(s,i){
    var li=el('li'), b=el('button'); b.type='button'; b.appendChild(el('span',null,s.short)); b.setAttribute('aria-label','Step '+(i+1)+': '+s.short);
    b.addEventListener('click',function(){ go(i); }); li.appendChild(b); steps.appendChild(li);
  });
  top.appendChild(steps); wiz.appendChild(top);
  var body=el('div','dl-body'); wiz.appendChild(body);
  var panes=[];
  C.steps.forEach(function(s){
    var fs=el('fieldset','dl-q'); fs.hidden=true;
    var lg=el('legend'); lg.tabIndex=-1; lg.appendChild(document.createTextNode(s.q)); if(s.hint) lg.appendChild(el('small',null,s.hint));
    fs.appendChild(lg);
    var box=el('div','dl-opts'+(s.cols===1?' one':'')+(s.type==='multi'?' multi':''));
    s.opts.forEach(function(o){
      var b=el('button','dl-opt'); b.type='button'; b.dataset.v=o.v;
      b.appendChild(el('span',null,o.label)); if(o.sub) b.appendChild(el('small',null,o.sub));
      b.addEventListener('click',function(){
        if(s.type==='multi'){ var m=A[s.id]||{}; if(m[o.v]) delete m[o.v]; else { if(o.solo) m={}; else if(s.opts.some(function(x){return x.solo&&m[x.v]})) s.opts.forEach(function(x){ if(x.solo) delete m[x.v]; }); m[o.v]=true; } A[s.id]=m; }
        else { A[s.id]=o.v; }
        tip.textContent=''; save(); render();
        if(s.type!=='multi' && cur<N) setTimeout(function(){ go(cur+1); },220);
      });
      box.appendChild(b);
    });
    fs.appendChild(box); body.appendChild(fs); panes.push(fs);
  });
  var fin=el('div','dl-q dl-final'); fin.hidden=true;
  var fh=el('h3',null,C.finalTitle||'Your plan is ready'); fh.tabIndex=-1; fin.appendChild(fh);
  fin.appendChild(el('p','dl-sub',C.finalSub||'Send it to an account manager and they’ll come back with practical next steps. No obligation.'));
  var acts=el('div','dl-acts');
  var send=el('button','btn','Send my plan'); send.type='button';
  var copy=el('button','btn ghost','Copy it'); copy.type='button';
  acts.appendChild(send); acts.appendChild(copy);
  if(C.extra){ var ex=el('button','btn ghost',C.extra.label); ex.type='button'; ex.addEventListener('click',function(){ C.extra.run(A, out); fmsg.textContent=C.extra.done||'Done.'; }); acts.appendChild(ex); }
  fin.appendChild(acts);
  var fmsg=el('p','dl-msg'); fmsg.setAttribute('role','status'); fin.appendChild(fmsg);
  var restart=el('button','dl-restart','Start again'); restart.type='button'; restart.addEventListener('click',function(){ A={}; save(); render(); go(0); }); fin.appendChild(restart);
  body.appendChild(fin); panes.push(fin);
  var nav=el('div','dl-nav'), back=el('button','dl-back','← Back'), next=el('button','btn','Continue'), tip=el('span','dl-tip');
  back.type=next.type='button'; nav.appendChild(back); nav.appendChild(tip); nav.appendChild(next); wiz.appendChild(nav);

  var res=el('aside','dl-res'); res.setAttribute('aria-live','polite');
  var rh=el('div','dl-rh'); rh.appendChild(el('span','dl-label',C.resultLabel||'Your plan, live')); var sum=el('p','dl-sum'); rh.appendChild(sum); res.appendChild(rh);
  var gauge=el('div','dl-gauge'); var svgNS='http://www.w3.org/2000/svg', ring=document.createElementNS(svgNS,'svg'); ring.setAttribute('viewBox','0 0 200 200'); ring.setAttribute('aria-hidden','true');
  var gc=el('div','dl-gc'), gn=el('b'), gl=el('span'); gc.appendChild(gn); gc.appendChild(gl); gauge.appendChild(ring); gauge.appendChild(gc); res.appendChild(gauge);
  var legend=el('div','dl-legend'); Object.keys(C.levels).forEach(function(k){ var s=el('span'); s.appendChild(el('i','lv-'+k)); s.appendChild(document.createTextNode(C.levels[k])); legend.appendChild(s); }); res.appendChild(legend);
  var rows=el('div','dl-rows'); res.appendChild(rows);
  var nx=el('div','dl-next'); nx.appendChild(el('span','dl-label','Your next step')); var nb=el('div','dl-big'); var nt=el('p'); var ne=el('p','dl-extra'); nx.appendChild(nb); nx.appendChild(nt); nx.appendChild(ne); res.appendChild(nx);
  var layout=el('div','dl'); layout.appendChild(wiz); layout.appendChild(res); root.appendChild(layout);

  /* ---------- logic ---------- */
  var out={};
  function arc(cx,cy,r,a0,a1){ var p0=[cx+r*Math.cos(a0),cy+r*Math.sin(a0)], p1=[cx+r*Math.cos(a1),cy+r*Math.sin(a1)]; return 'M'+p0[0].toFixed(2)+' '+p0[1].toFixed(2)+'A'+r+' '+r+' 0 '+((a1-a0)>Math.PI?1:0)+' 1 '+p1[0].toFixed(2)+' '+p1[1].toFixed(2); }
  function answered(s){ var v=A[s.id]; return s.type==='multi' ? (v&&Object.keys(v).length>0) : !!v; }
  function labelOf(s){ var v=A[s.id]; if(s.type==='multi'){ return s.opts.filter(function(o){return v&&v[o.v]}).map(function(o){return o.label}).join('; ')||'-'; } var o=s.opts.filter(function(o){return o.v===v})[0]; return o?o.label:'-'; }
  function render(){
    C.steps.forEach(function(s,i){
      [].forEach.call(panes[i].querySelectorAll('.dl-opt'),function(b){ var v=b.dataset.v, on= s.type==='multi' ? !!(A[s.id]&&A[s.id][v]) : A[s.id]===v; b.setAttribute('aria-pressed',on); });
    });
    out=C.compute(A)||{};
    sum.textContent=out.summary||'Answer the questions to build your plan.';
    gn.textContent=out.count!=null?out.count:'0'; gl.textContent=out.countLabel||'';
    rows.textContent=''; while(ring.firstChild) ring.removeChild(ring.firstChild);
    var list=out.rows||[], n=list.length||1, gap=0.07;
    list.forEach(function(r,i){
      var a0=-Math.PI/2+i*(2*Math.PI/n)+gap/2, a1=-Math.PI/2+(i+1)*(2*Math.PI/n)-gap/2;
      var p=document.createElementNS(svgNS,'path'); p.setAttribute('d',arc(100,100,84,a0,a1)); p.setAttribute('class','seg lv-'+r.level); ring.appendChild(p);
      var row=el('div','dl-row lv-'+r.level), l=el('div'); l.appendChild(el('b',null,r.name)); if(r.sub) l.appendChild(el('small',null,r.sub));
      row.appendChild(l); row.appendChild(el('span','dl-st',C.levels[r.level])); rows.appendChild(row);
    });
    nb.textContent=out.next||''; nt.textContent=out.team||''; ne.textContent=out.extra||''; ne.hidden=!out.extra;
    var q=C.steps.map(function(s){ return s.short+': '+labelOf(s); }).join('\n');
    out.text=(C.title||'Discovery')+'\n'+q+'\n\nPlan:\n'+list.map(function(r){ return '- '+r.name+': '+C.levels[r.level]; }).join('\n')+'\n\nNext step: '+(out.next||'')+(out.team?'\n'+out.team:'')+(out.extra?'\n'+out.extra:'');
    [].forEach.call(steps.children,function(li,i){ li.className=(i===cur?'cur':'')+(i<N&&answered(C.steps[i])?' done':''); });
  }
  function go(i){
    if(i<0||i>N) return;
    cur=i; panes.forEach(function(p,k){ p.hidden=k!==i; });
    count.textContent= i<N ? 'Step '+(i+1)+' of '+(N+1) : 'Your plan';
    back.disabled=i===0; next.hidden=i===N; tip.textContent='';
    render();
    var h=panes[i].querySelector('legend,h3'); if(h&&root.getBoundingClientRect().top<innerHeight&&root.getBoundingClientRect().bottom>0){ try{ h.focus({preventScroll:true}); }catch(e){} }
  }
  back.addEventListener('click',function(){ go(cur-1); });
  next.addEventListener('click',function(){ var s=C.steps[cur]; if(s&&!s.optional&&!answered(s)){ tip.textContent= s.type==='multi'?'Choose at least one to continue.':'Choose one to continue.'; return; } go(cur+1); });
  copy.addEventListener('click',function(){ var t=out.text; function ok(){ fmsg.textContent='Copied. Paste it into an email to vip@codeblackgroup.com.au.'; }
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(t).then(ok,function(){ fallback(t); ok(); }); } else { fallback(t); ok(); } });
  function fallback(t){ var ta=el('textarea'); ta.value=t; ta.style.cssText='position:fixed;left:-9999px'; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); }catch(e){} ta.remove(); }
  send.addEventListener('click',function(){
    var m=document.getElementById('f-message'), tp=document.getElementById('f-topic');
    if(!m){ fmsg.textContent='Call 1300 737 562 or email vip@codeblackgroup.com.au.'; return; }
    m.value=out.text; m.dispatchEvent(new Event('input'));
    if(tp&&out.topic){ [].some.call(tp.options,function(o){ if(o.text===out.topic){ tp.value=o.value||o.text; return true; } }); }
    var c=document.getElementById('contact'); if(c) c.scrollIntoView({behavior:'smooth',block:'start'});
    setTimeout(function(){ var f=document.getElementById('f-first'); if(f) try{ f.focus({preventScroll:true}); }catch(e){} },700);
    fmsg.textContent='Your plan is in the form below. Add your details and press send.';
  });
  go(0);
})();

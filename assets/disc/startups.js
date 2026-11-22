window.CBG_DISCOVERY={
  key:'cbg-disc-startups', title:'Code Black Group launch check (Startups site)',
  levels:{p:'Do first',r:'Next',d:'Done'}, resultLabel:'Your launch plan, live', finalShort:'Your plan',
  finalTitle:'Your launch plan is ready', finalSub:'Send it to us and we’ll come back with practical next steps, or tick off what you already have on the launch list below.',
  steps:[
    {id:'stage',short:'Stage',q:'Where is your business at?',type:'single',cols:1,opts:[
      {v:'plan',label:'Still planning'},{v:'launch',label:'Launching in the next three months'},{v:'new',label:'Trading for less than a year'},{v:'tidy',label:'Trading for a while, time to tidy up'}]},
    {id:'team',short:'Team',q:'Who’s in the business?',type:'single',opts:[
      {v:'solo',label:'Just me'},{v:'small',label:'2 to 5 people'},{v:'grow',label:'6 to 20 people'},{v:'hire',label:'Just me, hiring soon'}]},
    {id:'have',short:'What you have',q:'What do you already have in place?',hint:'Tick everything you’ve set up. It’s fine to tick nothing.',type:'multi',optional:true,opts:[
      {v:'domain',label:'A domain name in my own name'},{v:'email',label:'Email on my own domain'},{v:'mfa',label:'Multi-factor sign-in on key accounts'},{v:'pw',label:'A password manager'},{v:'updates',label:'Laptop and phone updating automatically'},{v:'backup',label:'Automatic backups'},{v:'web',label:'A website I own and control'}]},
    {id:'goal',short:'What matters',q:'What matters most right now?',hint:'Choose all that apply.',type:'multi',opts:[
      {v:'pro',label:'Looking professional'},{v:'found',label:'Getting found online'},{v:'scams',label:'Staying safe from scams'},{v:'pay',label:'Taking payments online'},{v:'anywhere',label:'Working from anywhere'},{v:'hire',label:'Bringing on my first people'}]}
  ],
  compute:function(A){
    var E=[
      {id:'domain',name:'Secure your domain',sub:'Launch list 01 · week 1',wk:1},
      {id:'email',name:'Email on your own domain',sub:'Launch list 02 · week 1',wk:1},
      {id:'mfa',name:'Multi-factor sign-in',sub:'Launch list 03 · week 1',wk:1},
      {id:'pw',name:'A password manager',sub:'Launch list 04 · week 1',wk:1},
      {id:'updates',name:'Devices updating automatically',sub:'Launch list 05 · month 1',wk:2},
      {id:'backup',name:'Automatic, tested backups',sub:'Launch list 06 · month 1',wk:2},
      {id:'web',name:'A website you own',sub:'Launch list 09 · built by Rend’r',wk:3}];
    var h=A.have||{}, g=A.goal||{};
    var boost={pro:['domain','email'],found:['web'],scams:['mfa','pw'],pay:['web','mfa'],anywhere:['backup','mfa'],hire:['pw','mfa']};
    var hot={}; Object.keys(g).forEach(function(k){ (boost[k]||[]).forEach(function(x){ hot[x]=true; }); });
    var rows=E.map(function(x){ var lv= h[x.id] ? 'd' : (x.wk===1||hot[x.id]) ? 'p' : 'r'; return {name:x.name,sub:x.sub,level:lv}; });
    if(g.scams||g.pay) rows.push({name:'A rule for changed bank details',sub:'Launch list 08 · stops fake invoices',level:'p'});
    if(g.hire||A.team==='hire'||A.team==='small'||A.team==='grow') rows.push({name:'Add people safely',sub:'Launch list 11 · own accounts, removed when they leave',level:(g.hire||A.team==='hire')?'p':'r'});
    var done=E.filter(function(x){return h[x.id]}).length, pct=Math.round(done/E.length*100);
    var stageTxt={plan:'Planning',launch:'Launching soon',new:'Trading under a year',tidy:'Established, tidying up'}[A.stage]||'';
    var teamTxt={solo:'just you',small:'2–5 people',grow:'6–20 people',hire:'just you, hiring soon'}[A.team]||'';
    var gaps=E.filter(function(x){return !h[x.id]});
    var pk=[];
    if(gaps.some(function(x){return x.id!=='web'})) pk.push('Business set-up');
    if(!h.web||g.found||g.pay) pk.push('Website and online presence');
    if(A.team==='small'||A.team==='grow'||A.team==='hire'||g.hire) pk.push('Support when you need it');
    var next={plan:'Get your foundations right before you launch: a quick chat, then we set up week 1 with you.',launch:'Get your week 1 essentials done before launch day.',new:'Close the gaps now, before they cost you.',tidy:'A quick health check of what you’ve already set up.'}[A.stage]||'Answer the questions to see your next step.';
    var top=rows.filter(function(r){return r.level==='p'}).slice(0,3).map(function(r){return r.name.toLowerCase()});
    return {summary:[stageTxt,teamTxt].filter(Boolean).join(' · '),count:pct+'%',countLabel:'launch ready',rows:rows,next:next,
      team: top.length ? 'Start with: '+top.join(', ')+'.' : 'You’re in good shape. We can check it’s all set up properly.',
      extra: pk.length ? 'Suggested: '+pk.join(' + ')+'.' : '',
      topic: (!h.domain||!h.email)?'Domain and business email':(!h.mfa||!h.pw||!h.backup)?'Security set-up':!h.web?'A website':'Not sure where to start'};
  },
  extra:{label:'Tick these on my launch list',done:'Done. What you already have is ticked on the launch list below.',run:function(A){
    var h=A.have||{}; Object.keys(h).forEach(function(k){ var b=document.querySelector('.item input[data-k="'+k+'"]'); if(b&&!b.checked){ b.checked=true; b.dispatchEvent(new Event('change')); } }); var f=document.getElementById('first'); if(f) setTimeout(function(){ f.scrollIntoView({behavior:'smooth'}); },600); }}
};

window.CBG_DISCOVERY={
  key:'cbg-disc-corporate', title:'Code Black Group executive discovery (corporate site)',
  levels:{p:'Priority',r:'Review',l:'Later'}, resultLabel:'Your executive brief, live',
  finalTitle:'Your executive brief is ready', finalSub:'Send it to a senior account manager. They’ll come back with the right division heads and a proposed briefing. No obligation.',
  steps:[
    {id:'role',short:'Your role',q:'Which best describes your role?',hint:'So we frame the conversation around what you’re accountable for.',type:'single',opts:[
      {v:'board',label:'Board or CEO'},{v:'cfo',label:'CFO or finance'},{v:'coo',label:'COO or operations'},{v:'it',label:'CIO, CTO or IT leader'},{v:'other',label:'Other executive'}]},
    {id:'size',short:'Size',q:'How large is your organisation?',hint:'Employees across all locations.',type:'single',opts:[
      {v:'s',label:'50 to 200'},{v:'m',label:'200 to 1,000'},{v:'l',label:'1,000 or more'},{v:'u',label:'Under 50'}]},
    {id:'sites',short:'Locations',q:'Where do you operate?',type:'single',cols:1,opts:[
      {v:'one',label:'One main site'},{v:'au',label:'Several sites across Australia'},{v:'intl',label:'Australia and overseas'}]},
    {id:'pri',short:'Priorities',q:'What’s on the leadership agenda?',hint:'Choose all that apply.',type:'multi',opts:[
      {v:'cyber',label:'Cyber risk and resilience'},{v:'vendors',label:'Too many vendors'},{v:'ai',label:'Secure A.I. adoption'},{v:'multi',label:'Multi-site and hybrid work'},{v:'legacy',label:'Modernising legacy systems'},{v:'phys',label:'Physical security'},{v:'unsure',label:'Not sure, we want an independent view',solo:true}]},
    {id:'time',short:'Timing',q:'When do you need to act?',type:'single',cols:1,opts:[
      {v:'now',label:'Urgently',sub:'Something needs attention now'},{v:'q',label:'This quarter',sub:'Planning or budgeting is under way'},{v:'explore',label:'Exploring',sub:'Building the picture for later'}]}
  ],
  compute:function(A){
    var P=[
      {id:'cyber',name:'Cyber risk and resilience',sub:'Strikeforce Cyber',d:['Strikeforce Cyber'],t:'Cyber risk and resilience'},
      {id:'vendors',name:'Vendor consolidation',sub:'Coordinated by Code Black Group',d:[],t:'Vendor consolidation'},
      {id:'ai',name:'Secure A.I. adoption',sub:'AI Dome with Strikeforce Cyber',d:['AI Dome','Strikeforce Cyber'],t:'Secure A.I. adoption'},
      {id:'multi',name:'Multi-site and hybrid operations',sub:'Midnight IT and Wize Solutions',d:['Midnight IT','Wize Solutions'],t:'Multi-site operations'},
      {id:'legacy',name:'Modernising legacy systems',sub:'Rend’r, Midnight IT and Strikeforce Cyber',d:['Rend’r','Midnight IT','Strikeforce Cyber'],t:'Legacy modernisation'},
      {id:'phys',name:'Physical security',sub:'3 Eyes Australia',d:['3 Eyes Australia'],t:'Physical security'}];
    var pr=A.pri||{}, unsure=!!pr.unsure, any=Object.keys(pr).length>0, heads=[];
    var rows=P.map(function(x){ var lv='l';
      if(pr[x.id]){ lv='p'; x.d.forEach(function(v){ if(heads.indexOf(v)<0) heads.push(v); }); }
      else if(unsure) lv='r';
      else if(x.id==='cyber'&&any) lv='r';
      else if(x.id==='multi'&&(A.sites==='au'||A.sites==='intl')) lv='r';
      return {name:x.name,sub:x.sub+(x.id==='cyber'&&lv==='r'&&!unsure?' · security review on every engagement':''),level:lv}; });
    var n=rows.filter(function(r){return r.level==='p'}).length;
    var roleTxt={board:'Board and CEO',cfo:'CFO',coo:'COO',it:'IT leadership',other:'Executive'}[A.role]||'Leadership team';
    var sizeTxt={s:'50–200 people',m:'200–1,000 people',l:'1,000+ people',u:'under 50 people'}[A.size]||'';
    var siteTxt={one:'one site',au:'multi-site, Australia',intl:'Australia and overseas'}[A.sites]||'';
    var model='Advisory and assessments';
    if(pr.legacy||pr.multi||pr.ai) model='Projects and transformation';
    if(pr.vendors) model='Managed services retainer';
    if(n>=3) model='Managed services retainer, with projects as needed';
    if(unsure||A.time==='explore') model='Advisory and assessments';
    var next='Choose your priorities to see your next step.';
    if(any){ next= A.time==='now' ? 'A priority call from a senior account manager.' : A.time==='explore' ? 'A short written overview, with no call unless you ask.' : 'An executive briefing with the right division heads.'; }
    var frame={board:'We’ll frame it around risk ownership and a clear, plain-English view for the board.',
      cfo:'We’ll frame it around one agreement, predictable spend, and options and phases.',
      coo:'We’ll frame it around operations that keep running and one escalation path.',
      it:'We’ll work as an extension of your team and coordinate the specialists for you.',
      other:'We’ll tailor the briefing to your area of the business.'}[A.role]||'';
    var hl=heads.length>1?heads.slice(0,-1).join(', ')+' and '+heads[heads.length-1]:heads[0];
    var team= heads.length ? 'With your account manager and specialists from '+hl+'.' : any ? 'Your account manager coordinates the right specialists.' : '';
    if(unsure) team='Your account manager and our division heads review your whole environment.';
    if(A.size==='l'||A.sites==='intl') team+=(team?' ':'')+'Includes a governance workshop for your leadership team.';
    return {summary:[roleTxt,sizeTxt,siteTxt].filter(Boolean).join(' · '),count:n,countLabel:'priority areas',rows:rows,
      next:next,team:(frame?frame+' ':'')+team,extra:any?'Suggested way to engage: '+model+'.':'',
      topic:(P.filter(function(x){return pr[x.id]})[0]||{}).t||''};
  }
};

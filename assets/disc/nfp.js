window.CBG_DISCOVERY={
  key:'cbg-disc-nfp', title:'Code Black Group organisation check (Government & NFP site)',
  levels:{p:'Priority',r:'Review',l:'Later'}, resultLabel:'Your organisation plan, live',
  finalTitle:'Your organisation plan is ready', finalSub:'Send it to an account manager and they’ll come back with practical options that fit your budget. No obligation.',
  steps:[
    {id:'type',short:'Organisation',q:'What kind of organisation are you?',type:'single',opts:[
      {v:'gov',label:'Council or government agency'},{v:'charity',label:'Charity or community organisation'},{v:'care',label:'Aged care, disability or health'},{v:'member',label:'Membership or peak body'},{v:'other',label:'Other not-for-profit'}]},
    {id:'size',short:'People',q:'How many people work with you?',hint:'Counting staff and regular volunteers.',type:'single',opts:[
      {v:'xs',label:'Fewer than 20'},{v:'s',label:'20 to 100'},{v:'m',label:'100 to 500'},{v:'l',label:'More than 500'}]},
    {id:'pri',short:'Priorities',q:'What would make the biggest difference?',hint:'Choose all that apply.',type:'multi',opts:[
      {v:'data',label:'Protecting client, donor or member data'},{v:'support',label:'Reliable support for staff and volunteers'},{v:'money',label:'Getting more from our technology budget'},{v:'modern',label:'Replacing old systems or spreadsheets'},{v:'safety',label:'Cyber-safety training for the people we care for'},{v:'sites',label:'Connecting and protecting our sites'},{v:'public',label:'Public-safety technology',sub:'Body-worn cameras, CCTV, access control'},{v:'unsure',label:'Not sure, we’d like a health check',solo:true}]},
    {id:'fund',short:'Funding',q:'How will this be funded?',type:'single',cols:1,opts:[
      {v:'budget',label:'From our operating budget'},{v:'grant',label:'A grant or funding round is coming up'},{v:'spread',label:'We’d need to spread the cost'},{v:'unsure',label:'Not sure yet'}]},
    {id:'time',short:'Timing',q:'When do you need help?',type:'single',cols:1,opts:[
      {v:'now',label:'Now',sub:'Something needs attention'},{v:'soon',label:'In the next few months'},{v:'explore',label:'Just exploring'}]}
  ],
  compute:function(A){
    var P=[
      {id:'data',name:'Protect the people and data you serve',sub:'Strikeforce Cyber and Midnight IT'},
      {id:'support',name:'Support staff and volunteers',sub:'Midnight IT, 24/7'},
      {id:'money',name:'Make every dollar go further',sub:'One agreement, coordinated by Code Black Group'},
      {id:'modern',name:'Modernise without disruption',sub:'Rend’r, Midnight IT and Strikeforce Cyber'},
      {id:'safety',name:'Cyber safety for the people you care for',sub:'Strikeforce Cyber and AI Dome'},
      {id:'sites',name:'Connect and protect every site',sub:'Wize Solutions and 3 Eyes Australia'},
      {id:'public',name:'Public-safety technology',sub:'Government and Public Safety team, 3 Eyes Australia'}];
    var pr=A.pri||{}, unsure=!!pr.unsure, any=Object.keys(pr).length>0;
    var list=P.filter(function(x){ return x.id!=='public' || A.type==='gov' || pr.public; });
    var rows=list.map(function(x){ var lv='l';
      if(pr[x.id]) lv='p'; else if(unsure) lv='r';
      else if(x.id==='data'&&any) lv='r';
      else if(x.id==='safety'&&A.type==='care') lv='r';
      return {name:x.name,sub:x.sub+(x.id==='data'&&lv==='r'&&!unsure?' · reviewed on every engagement':''),level:lv}; });
    var n=rows.filter(function(r){return r.level==='p'}).length;
    var typeTxt={gov:'Council or government',charity:'Charity or community',care:'Aged care, disability or health',member:'Membership or peak body',other:'Not-for-profit'}[A.type]||'';
    var sizeTxt={xs:'under 20 people',s:'20–100 people',m:'100–500 people',l:'500+ people'}[A.size]||'';
    var next='Choose your priorities to see your next step.';
    if(any) next= A.time==='now' ? 'A priority call from your account manager.' : A.time==='explore' ? 'A short written overview, with no call unless you ask.' : 'A no-obligation conversation, then a plan sized to your budget.';
    var fund={budget:'We’ll size the plan to this year’s budget and mark clearly what can wait.',grant:'We’ll scope options and phases you can match to your funding round.',spread:'Payment plans are available for any service through grenke.',unsure:'We’ll show options at different budgets so you can decide.'}[A.fund]||'';
    if(A.type&&A.type!=='gov') fund+=(fund?' ':'')+'We’ll also check whether you’re eligible for not-for-profit software licensing programs.';
    var team='Your account manager coordinates everything, with change management for staff and volunteers.';
    if(A.type==='gov'||pr.public) team='Your account manager and Rick Scarra, Head of Government and Public Safety, with change management built in.';
    if(A.size==='l') team+=' Larger organisations also get a briefing for your board or executive.';
    var topicMap={data:'Cyber security and data protection',support:'IT support for staff and volunteers',modern:'Membership, CRM or client system',sites:'Connectivity for our sites',safety:'Cyber-safety or A.I. training',public:'Government or public safety'};
    var first=P.filter(function(x){return pr[x.id]&&topicMap[x.id]})[0];
    return {summary:[typeTxt,sizeTxt].filter(Boolean).join(' · '),count:n,countLabel:'priority areas',rows:rows,next:next,team:team,extra:any?fund:'',topic:first?topicMap[first.id]:''};
  }
};

/* About page: reveal on scroll */
(function(){
  var rv=[].slice.call(document.querySelectorAll('.rv'));
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches){ rv.forEach(function(el){ el.classList.add('in'); }); return; }
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); },{threshold:.12});
  rv.forEach(function(el){ io.observe(el); });
})();

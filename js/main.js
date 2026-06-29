// reveal on scroll
(function(){
  const els=document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));return;}
  const io=new IntersectionObserver((ents)=>{
    ents.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
  },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  els.forEach(e=>io.observe(e));
})();

// faq accordion
document.querySelectorAll('.faq-q').forEach(q=>{
  q.addEventListener('click',()=>{
    const item=q.parentElement, a=q.nextElementSibling, open=item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(o=>{o.classList.remove('open');o.querySelector('.faq-a').style.maxHeight=null;});
    if(!open){item.classList.add('open');a.style.maxHeight=a.scrollHeight+'px';}
  });
});

// depoimentos carrossel
(function(){
  const root=document.querySelector('[data-depo]');
  if(!root) return;
  const track=root.querySelector('.depo-track');
  const slides=Array.from(track.children);
  const dotsWrap=root.querySelector('.depo-dots');
  const prev=root.querySelector('.depo-btn--prev');
  const next=root.querySelector('.depo-btn--next');
  if(slides.length<=1){ if(prev)prev.hidden=true; if(next)next.hidden=true; return; }

  let index=0, timer;
  const dots=slides.map((_,i)=>{
    const b=document.createElement('button');
    b.className='depo-dot';
    b.type='button';
    b.setAttribute('aria-label','Ir para o depoimento '+(i+1));
    b.addEventListener('click',()=>go(i,true));
    dotsWrap.appendChild(b);
    return b;
  });

  function update(){
    track.style.transform='translateX(-'+(index*100)+'%)';
    dots.forEach((d,i)=>d.setAttribute('aria-current', i===index ? 'true':'false'));
  }
  function go(i,user){
    index=(i+slides.length)%slides.length;
    update();
    if(user) restart();
  }
  function restart(){
    if(window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    clearInterval(timer);
    timer=setInterval(()=>go(index+1),6000);
  }

  prev&&prev.addEventListener('click',()=>go(index-1,true));
  next&&next.addEventListener('click',()=>go(index+1,true));

  // teclado
  root.addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft')go(index-1,true);
    if(e.key==='ArrowRight')go(index+1,true);
  });

  // suporte a swipe (toque)
  let x0=null;
  track.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;},{passive:true});
  track.addEventListener('touchend',e=>{
    if(x0===null)return;
    const dx=e.changedTouches[0].clientX-x0;
    if(Math.abs(dx)>40)go(index+(dx<0?1:-1),true);
    x0=null;
  });

  // pausa ao passar o mouse
  root.addEventListener('mouseenter',()=>clearInterval(timer));
  root.addEventListener('mouseleave',restart);

  update();
  restart();
})();

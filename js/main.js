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

// depoimentos carrossel (paginado: avanca de "per em per")
(function(){
  const root=document.querySelector('[data-depo]');
  if(!root) return;
  const viewport=root.querySelector('.depo-viewport');
  const track=root.querySelector('.depo-track');
  const slides=Array.from(track.children);
  const dotsWrap=root.querySelector('.depo-dots');
  const prev=root.querySelector('.depo-btn--prev');
  const next=root.querySelector('.depo-btn--next');

  // quantos depoimentos cabem por pagina (le a variavel CSS --per)
  const per=()=>{
    const v=parseInt(getComputedStyle(root).getPropertyValue('--per'),10);
    return Number.isFinite(v)&&v>0?v:1;
  };
  const pages=()=>Math.ceil(slides.length/per());

  let page=0, timer;

  function buildDots(){
    dotsWrap.innerHTML='';
    const n=pages();
    for(let i=0;i<n;i++){
      const b=document.createElement('button');
      b.className='depo-dot';
      b.type='button';
      b.setAttribute('aria-label','Ir para a página '+(i+1)+' de '+n);
      b.addEventListener('click',()=>go(i,true));
      dotsWrap.appendChild(b);
    }
  }

  function update(){
    const n=pages();
    if(page>n-1) page=n-1;
    if(page<0) page=0;
    // desloca uma "pagina" inteira (largura do viewport visivel)
    const shift=viewport.clientWidth*page;
    track.style.transform='translateX(-'+shift+'px)';
    const dots=Array.from(dotsWrap.children);
    dots.forEach((d,i)=>d.setAttribute('aria-current', i===page ? 'true':'false'));
    const single=n<=1;
    if(prev)prev.hidden=single;
    if(next)next.hidden=single;
  }
  function go(p,user){
    const n=pages();
    page=(p+n)%n;
    update();
    if(user) restart();
  }
  function restart(){
    clearInterval(timer);
    if(window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    if(pages()<=1) return;
    timer=setInterval(()=>go(page+1),7000);
  }

  prev&&prev.addEventListener('click',()=>go(page-1,true));
  next&&next.addEventListener('click',()=>go(page+1,true));

  root.addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft')go(page-1,true);
    if(e.key==='ArrowRight')go(page+1,true);
  });

  // swipe (toque)
  let x0=null;
  track.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;},{passive:true});
  track.addEventListener('touchend',e=>{
    if(x0===null)return;
    const dx=e.changedTouches[0].clientX-x0;
    if(Math.abs(dx)>40)go(page+(dx<0?1:-1),true);
    x0=null;
  });

  root.addEventListener('mouseenter',()=>clearInterval(timer));
  root.addEventListener('mouseleave',restart);

  // recalcula em resize (per/largura mudam)
  let rt;
  window.addEventListener('resize',()=>{
    clearTimeout(rt);
    rt=setTimeout(()=>{ buildDots(); update(); },150);
  });

  buildDots();
  update();
  restart();
})();

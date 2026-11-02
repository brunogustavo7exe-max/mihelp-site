
/* Publicidade mobile: transforma as vagas laterais + slots do outdoor
   em uma vitrine no topo. Não depende de anúncios pagos existirem. */
(function(){
  function fmtRestante(ms){ms=Math.max(0,Math.floor(ms/1000));const h=Math.floor(ms/3600),m=Math.floor(ms%3600/60),s=ms%60,p=n=>String(n).padStart(2,'0');return h?h+':'+p(m)+':'+p(s):p(m)+':'+p(s)}
  function instalarPublicidadeMobile(){
    const box=document.getElementById('adtop');
    if(!box)return;
    const vs=window.MH_ADS&&typeof window.MH_ADS.vs==='function'?window.MH_ADS.vs():null;
    const now=Date.now();
    const cards=[];
    const usados=new Set();

    if(Array.isArray(vs)){
      vs.forEach((v,i)=>{
        if(v && v.end>now){cards.push({v,i,open:false});usados.add(i)}
      });
      /* Vagas abertas só aparecem quando NÃO existe nenhum anúncio ativo. */
      if(!cards.length){
        for(let i=0;i<vs.length && cards.length<6;i++){
          if(!vs[i]){cards.push({v:null,i,open:true});usados.add(i)}
        }
      }
    }

    /* Fallback para a primeira carga, caso MH_ADS ainda não exista. */
    if(!cards.length){
      for(let i=0;i<4;i++)cards.push({v:null,i,open:true});
    }

    const sig=cards.map(c=>c.open?'o'+c.i:'a'+c.i+'|'+c.v.name+'|'+c.v.text+'|'+(c.v.link||'')+'|'+(c.v.img?String(c.v.img).length:0)+'|'+c.v.end).join('~');
    try{document.body.classList.toggle('tem-pub',cards.some(c=>!c.open))}catch(e){}
    if(box._sig===sig&&box.firstChild)return;
    box._sig=sig;
    box.hidden=false;
    box.classList.toggle('tem-ads',cards.some(function(c){return !c.open}));
    box.innerHTML='';
    const w=document.createElement('div');w.className='adw';
    const dots=document.createElement('div');dots.className='add';

    cards.forEach((item,k)=>{
      const v=item.v;
      const c=document.createElement('button');
      c.type='button';
      c.className='adc'+(item.open?' open-ad':'');
      c.setAttribute('aria-label',item.open?'Vaga aberta para anunciar':'Publicidade: '+v.name);

      if(v && v.img){
        const im=document.createElement('img');
        im.src=v.img;im.alt='';im.loading='lazy';
        c.appendChild(im);
      }else{
        const ic=document.createElement('span');ic.className='ad-icon';ic.textContent=item.open?'$':'•';c.appendChild(ic);
      }

      const t=document.createElement('div');t.className='adt';
      const small=document.createElement('small');small.textContent='Publicidade';
      const b=document.createElement('b');b.textContent=item.open?'Vaga aberta':v.name;
      const s=document.createElement('span');s.textContent=item.open?'A partir de R$ 5 · coloque sua marca aqui':v.text;
      t.append(small,b,s);c.appendChild(t);
      if(!item.open){const tm=document.createElement('span');tm.className='ad-tm';tm.dataset.end=v.end;tm.innerHTML='<small>restam</small><b>'+fmtRestante(v.end-Date.now())+'</b>';c.appendChild(tm)}
      if(item.open||(v.link&&/^https?:\/\//i.test(v.link))){const ar=document.createElement('span');ar.className='ad-arrow';ar.textContent='›';c.appendChild(ar)}

      c.addEventListener('click',function(){
        if(item.open){
          const alvo=document.getElementById('vagas');
          if(alvo)alvo.scrollIntoView({behavior:'smooth',block:'start'});
          setTimeout(function(){
            const btn=document.querySelector('#vgrid .vg.open');
            if(btn)btn.click();
          },350);
        }else if(v.link && /^https?:\/\//i.test(v.link)){
          window.open(v.link,'_blank','noopener');
        }else{
          const alvo=document.getElementById('vagas');
          if(alvo)alvo.scrollIntoView({behavior:'smooth',block:'start'});
        }
      });
      w.appendChild(c);
      const d=document.createElement('i');if(k===0)d.className='on';dots.appendChild(d);
    });

    box.appendChild(w);
    if(cards.length>1)box.appendChild(dots);

    let idx=0;
    function pintar(){
      const largura=w.clientWidth+9;
      w.scrollTo({left:idx*largura,behavior:'smooth'});
      Array.from(dots.children).forEach((d,i)=>d.className=i===idx?'on':'');
    }
    w.addEventListener('scroll',function(){
      idx=Math.round(w.scrollLeft/Math.max(1,w.clientWidth+9));
      idx=Math.max(0,Math.min(idx,cards.length-1));
      Array.from(dots.children).forEach((d,i)=>d.className=i===idx?'on':'');
    },{passive:true});

    clearInterval(box._mobileAdTimer);
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches && cards.length>1){
      box._mobileAdTimer=setInterval(function(){
        if(document.hidden)return;
        idx=(idx+1)%cards.length;
        pintar();
      },5000);
    }
  }

  /* O código original também atualiza anúncios; damos prioridade à nossa vitrine. */
  window.MH_mobileAds=instalarPublicidadeMobile;
  window.MH_MOBILE_ADS_REFRESH=instalarPublicidadeMobile;
  setInterval(function(){document.querySelectorAll('#adtop .ad-tm').forEach(function(t){const ms=Number(t.dataset.end)-Date.now(),b=t.querySelector('b');if(b)b.textContent=fmtRestante(ms);t.classList.toggle('acabando',ms<60000)})},1000);
  function tentar(){
    try{instalarPublicidadeMobile()}catch(e){console.error('MiHelp mobile ads:',e)}
  }
  setTimeout(tentar,500);
  setTimeout(tentar,1600);
  setTimeout(tentar,3200);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(tentar,150)});
})();

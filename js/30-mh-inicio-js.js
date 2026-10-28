
/* 4 botões grandes do início: levam para a parte certa da página */
(function(){function ini(){const nv=document.getElementById('mhInicio');if(!nv||nv._ok)return;nv._ok=1;
 const alvo=id=>document.getElementById(id)||(id==='prof'?document.getElementById('need'):null);
 const ok=id=>{const e=alvo(id);if(!e||e.hidden)return false;if(e.closest('.jn-s'))return true;if(document.documentElement.classList.contains('modo-foco'))return true;return getComputedStyle(e).display!=='none'};
 const mostra=()=>nv.querySelectorAll('button').forEach(b=>{b.hidden=b.id==='jnTog'?false:!ok(b.dataset.go)});
 nv.addEventListener('click',e=>{const b=e.target.closest('button[data-go]');if(!b)return;
  const id=b.dataset.go;if(id==='cw'){const cw=document.getElementById('cw');if(cw)cw.classList.remove('fechada')}
  const el=alvo(id);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
  try{window.MH_SOM&&MH_SOM.tocar('pop',0)}catch(x){}});
 mostra();setTimeout(mostra,1200);setTimeout(mostra,3500);new MutationObserver(mostra).observe(document.documentElement,{attributes:true,attributeFilter:['class']})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ini);else ini()})();

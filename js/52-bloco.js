
(function(){
 var root=document.documentElement,bt=document.querySelectorAll('#mhDuo button');
 function set(m,rolar){
  if(m!=='est')m='helpers';root.setAttribute('data-lista',m);try{if(m==='est')window.MH_ABRE&&MH_ABRE(document.getElementById('praca'));else window.MH_FECHA&&MH_FECHA()}catch(e){}
  bt.forEach(function(b){b.setAttribute('aria-selected',String(b.dataset.lista===m))});
  try{localStorage.setItem('mh_lista',m)}catch(e){}
  if(rolar){var a=document.getElementById(m==='est'?'praca':'prof');if(a)setTimeout(function(){a.scrollIntoView({behavior:'smooth',block:'start'})},60)}}
 window.MH_DUO=function(m){set(m,false)};
 bt.forEach(function(b){b.addEventListener('click',function(){set(b.dataset.lista,true)})});
 document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('[data-go]');if(!a)return;
  if(a.dataset.go==='praca')set('est',false);else if(a.dataset.go==='prof')set('helpers',false)},true);
 set('est',false);
})();

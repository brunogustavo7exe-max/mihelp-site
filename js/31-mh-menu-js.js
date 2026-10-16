
try{(function(){
const box=document.getElementById('mhMenu'),btn=document.getElementById('mhMenuBtn'),lst=document.getElementById('mhMenuLst');
if(!box)return;
const dock=k=>document.querySelector('#dock [data-dock='+k+']');
const vivo=k=>{const b=dock(k);return !!b&&b.style.display!=='none'&&getComputedStyle(b).display!=='none'};
const clicaDepois=(id,ms)=>setTimeout(()=>{const e=document.getElementById(id);if(e)e.click()},ms);
const ITENS=[
 {i:'💬',t:'Chat',ok:()=>!!document.getElementById('chatFab'),f:()=>document.getElementById('chatFab').click()},
 {i:'👤',t:'Minha conta',ok:()=>vivo('conta'),f:()=>dock('conta').click()},
 {i:'🧭',t:'Guia da Região',ok:()=>vivo('guia'),f:()=>dock('guia').click()},
 {i:'🎉',t:'Eventos',ok:()=>{const e=document.getElementById('cheers');return !!e&&!e.hidden},f:()=>document.getElementById('cheers').scrollIntoView({behavior:'smooth',block:'start'})},
 {i:'⭐',t:'Recomendar um lugar',ok:()=>vivo('guia')&&!!document.getElementById('vNovo'),f:()=>{dock('guia').click();clicaDepois('vNovo',700)}},
 {i:'🚗',t:'Caronas',ok:()=>vivo('carona'),f:()=>dock('carona').click()},
 {i:'🙋',t:'Oferecer carona',ok:()=>vivo('carona')&&!!document.getElementById('cNovo'),f:()=>{dock('carona').click();clicaDepois('cNovo',700)}},
 {i:'📣',t:'Anunciar',ok:()=>vivo('anunciar'),f:()=>dock('anunciar').click()},
 {i:'⚙️',t:'Ajustes',ok:()=>!!document.getElementById('cfgBtn'),f:()=>{const b=document.getElementById('cfgBtn');if(b&&b.getAttribute('aria-expanded')!=='true')b.click()}}
];
function abre(v){
  lst.hidden=!v;btn.setAttribute('aria-expanded',String(v));
  btn.innerHTML=v?'Fechar <span>✕</span>':'Menu <span>●</span>';
  if(v){
    lst.textContent='';
    ITENS.filter(x=>{try{return x.ok()}catch(e){return false}}).reverse().forEach((x,n)=>{
      const b=document.createElement('button');b.type='button';b.setAttribute('role','menuitem');
      b.style.animationDelay=(n*30)+'ms';
      b.innerHTML='<b>'+x.i+'</b>'+x.t;
      b.onclick=()=>{abre(false);try{x.f()}catch(e){}};
      lst.append(b)});
  }
  try{window.MH_SOM&&MH_SOM.tocar(v?'abre':'fecha',80)}catch(e){}
}
btn.onclick=()=>abre(lst.hidden);
document.addEventListener('pointerdown',e=>{if(!lst.hidden&&!box.contains(e.target))abre(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!lst.hidden){abre(false);btn.focus()}});
})()}catch(e){console.error('MiHelp (menu mobile):',e)}

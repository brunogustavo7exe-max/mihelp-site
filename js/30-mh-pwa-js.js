
try{(function(){
const $=id=>document.getElementById(id);
if(!$('pwaBtn'))return;
let ev=null;
const instalado=()=>{try{return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}catch(e){return false}};
const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
function pinta(){const i=instalado();const nb=$('navBaixar');if(nb)nb.hidden=i;$('pwaOk').hidden=!i;$('pwaBtn').hidden=i||!ev;$('pwaIos').hidden=i||!ios;$('pwaOutro').hidden=i||ios||!!ev}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();ev=e;pinta()});
window.addEventListener('appinstalled',()=>{ev=null;$('pwaMsg').textContent='Instalado! Procure o ícone do MiHelp na tela inicial.';pinta()});
$('pwaBtn').onclick=async()=>{if(!ev)return;try{ev.prompt();await ev.userChoice}catch(e){}ev=null;pinta()};
{const nb=$('navBaixar');if(nb){
 const dlg=document.createElement('dialog');dlg.className='pwa-dlg';dlg.setAttribute('aria-label','Instalar o MiHelp');
 const el=(t,x)=>{const e=document.createElement(t);if(x!=null)e.textContent=x;return e};
 const passos=ios?['Abra o site no Safari.','Toque em Compartilhar (o quadrado com a seta para cima).','Role e toque em Adicionar à Tela de Início, depois em Adicionar.']
  :/android/i.test(navigator.userAgent)?['Toque no menu do navegador (⋮ ou ☰), no canto da tela.','Toque em Instalar app (ou Adicionar à tela inicial).','Confirme. O ícone do MiHelp aparece na tela.']
  :['No Brave, Chrome ou Edge, clique no ícone de instalar na barra de endereço (do lado direito).','Se não aparecer, abra o menu do navegador e procure a opção Instalar MiHelp.','Confirme. O MiHelp abre como um app, em janela própria.'];
 const ol=el('ol');passos.forEach(p=>ol.append(el('li',p)));
 const fx=el('button','Entendi');fx.type='button';fx.className='go';fx.onclick=()=>dlg.close();
 dlg.append(el('h3','Instalar o MiHelp'),el('p','É grátis, abre rápido e fica na sua tela inicial como um app.'),ol,el('p','Abriu pelo WhatsApp ou Instagram? Toque nos três pontinhos e escolha Abrir no navegador antes de instalar.'),fx);
 dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});document.body.append(dlg);
 nb.onclick=async()=>{if(ev){try{ev.prompt();await ev.userChoice}catch(e){}ev=null;pinta();return}dlg.showModal()};
}}
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})});
pinta();
})()}catch(e){console.error('MiHelp (pwa):',e)}

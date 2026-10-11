
/* Menu único: um botão abre tema (lista + botão), sons e janelas. Sem música. */
try{(function(){
const mk=(t,id)=>{const e=document.createElement(t);if(id)e.id=id;return e};
const box=mk('div','cfg'),btn=mk('button','cfgBtn'),pan=mk('div','cfgPan'),row=mk('div','cfgRow');
btn.type='button';btn.setAttribute('aria-controls','cfgPan');
pan.hidden=true;pan.setAttribute('role','group');pan.setAttribute('aria-label','Tema e sons');
['temaBtn','somBtn'].forEach(id=>{const e=document.getElementById(id);if(e)row.append(e)});
const S0=window.MH_SOM;
const fx=mk('label');fx.className='cfgvol';fx.title='Estilo dos efeitos sonoros';
const sf=mk('select','somFx');sf.setAttribute('aria-label','Estilo dos efeitos sonoros');
if(S0){S0.packs().forEach(([k,n])=>sf.append(new Option(n,k)));sf.value=S0.pack()}
sf.onchange=()=>{if(S0){S0.pack(sf.value);S0.tocar('ok',0)}};fx.append('Sons ',sf);
const vl=mk('label');vl.className='cfgvol';vl.title='Volume dos efeitos';
const rg=mk('input','somVol');rg.type='range';rg.min=0;rg.max=100;rg.step=5;rg.setAttribute('aria-label','Volume dos efeitos');
rg.value=S0?Math.round(S0.vol()*100):50;
rg.oninput=()=>{if(S0)S0.vol(rg.value/100)};rg.onchange=()=>{if(S0)S0.tocar('ping',0)};
vl.append('🔉',rg);
const tb=mk('button');tb.type='button';tb.className='cfg-test';tb.textContent='▶ Ouvir efeitos';
tb.onclick=()=>{if(!S0)return;if(!S0.ligado()){const b=document.getElementById('somBtn');if(b)b.click()}[['ok',0],['msg',300],['pop',550],['cash',800],['tema',1100]].forEach(([n,t])=>setTimeout(()=>S0.tocar(n,0),t))};
const nb=mk('button');nb.type='button';nb.title='Avisa quando chega mensagem privada ou SOS, com a aba em segundo plano';
const pintaNb=()=>{let ok=false;try{ok=('Notification' in window)&&Notification.permission==='granted'&&localStorage.getItem('mh_noti')!=='0'}catch(e){}nb.textContent=ok?'🔔 Notificações ligadas':'🔕 Ligar notificações';nb.setAttribute('aria-pressed',String(ok))};
nb.onclick=()=>{if(!('Notification' in window)){nb.textContent='Seu navegador não tem notificações';return}
 const lig=Notification.permission==='granted'&&localStorage.getItem('mh_noti')!=='0';
 if(lig){try{localStorage.setItem('mh_noti','0')}catch(e){}pintaNb();return}
 if(Notification.permission==='denied'){nb.textContent='Bloqueadas: libere nas permissões do site';return}
 Notification.requestPermission().then(r=>{try{localStorage.setItem('mh_noti',r==='granted'?'1':'0')}catch(e){}pintaNb()})};
pintaNb();
const jn=mk('div');jn.className='cfgjan';
const bf=mk('button');bf.type='button';bf.textContent='Fechar janelas';bf.title='1 toque: informações · 2 toques: Guilda e Fliperama · 3 toques: Enquete e Cabo de guerra';
const ba=mk('button');ba.type='button';ba.textContent='Abrir tudo';ba.title='Abre de novo todas as janelas';
bf.onclick=()=>{if(window.MH_JAN)MH_JAN.fecharTodas();abre(false)};
ba.onclick=()=>{if(window.MH_JAN)MH_JAN.abrirTodas();abre(false)};
jn.append(bf,ba);
const vz=mk('div');vz.className='cfgjan col';
const RT=document.documentElement;
const tg=(cls,key,off,on,tip)=>{const b=mk('button');b.type='button';b.title=tip;
 const pinta=()=>{const v=RT.classList.contains(cls);b.textContent=v?on:off;b.setAttribute('aria-pressed',String(v))};
 b.onclick=()=>{const v=!RT.classList.contains(cls);RT.classList.toggle(cls,v);try{localStorage.setItem(key,v?'1':'0')}catch(e){}pinta();try{window.MH_SOM&&MH_SOM.tocar('pop',0)}catch(e){}};
 pinta();return b};
vz.append(tg('modo-foco','mh_foco','🎯 Modo foco: só perfil e chat','🎯 Sair do modo foco','Esconde tudo, menos o cabeçalho, o perfil e o chat'),...window.mhAnuncios());
pan.append(...(window.MH_TEMA_LABEL?[window.MH_TEMA_LABEL]:[]),vz,fx,vl,row,tb,nb,jn);box.append(btn,pan);document.body.append(box);
function abre(v){pan.hidden=!v;btn.textContent=v?'✕':'⚙️';btn.setAttribute('aria-expanded',String(v));btn.setAttribute('aria-label',v?'Fechar ajustes':'Abrir ajustes: tema e sons');try{window.MH_SOM&&MH_SOM.tocar(v?'abre':'fecha',80)}catch(e){}}
btn.onclick=()=>abre(pan.hidden);
document.addEventListener('pointerdown',e=>{if(!pan.hidden&&!box.contains(e.target))abre(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!pan.hidden){abre(false);btn.focus()}});
abre(false);
})()}catch(e){console.error('MiHelp (menu de ajustes):',e)}

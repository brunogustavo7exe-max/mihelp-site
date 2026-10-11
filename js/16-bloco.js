
/* Efeitos sonoros do MiHelp (sintetizados no navegador, sem arquivos). Botão 🔊/🔇 liga e muta; a escolha fica salva. */
try{(function(){
const KEY='mh_som',AC=window.AudioContext||window.webkitAudioContext,t0=Date.now();
let on=true;try{on=localStorage.getItem(KEY)!=='0'}catch(e){}
let ctx=null,master=null;
function pronto(){
  if(!AC)return false;
  if(!ctx){try{ctx=new AC();master=ctx.createGain();master.gain.value=vol;master.connect(ctx.destination)}catch(e){ctx=null;return false}}
  if(ctx.state==='suspended')ctx.resume().catch(()=>{});
  return ctx.state==='running'}
function ruido(ini,dur,vol,fc){
  if(!ctx||!master)return;
  const n=Math.max(64,Math.floor(ctx.sampleRate*dur)),buf=ctx.createBuffer(1,n,ctx.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
  const sr=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();
  sr.buffer=buf;f.type='bandpass';f.frequency.value=fc||1500;f.Q.value=.8;g.gain.value=vol;
  sr.connect(f);f.connect(g);g.connect(master);sr.start(ctx.currentTime+Math.max(0,ini))}
/* máquina de escrever */
const clack=(i,v)=>{i=i||0;v=v||1;ruido(i,.016,.2*v,2400+Math.random()*900);nota(140+Math.random()*30,i,.03,'sine',.05*v,70)};
const ding=()=>{nota(1568,.04,.35,'sine',.045)};
const sino=()=>{nota(1568,0,.4,'sine',.05);nota(2093,.02,.3,'sine',.02)};
const fimLinha=()=>{clack(0,.7);ding()};
/* robô: sequências de apitos que sempre soam iguais para o mesmo evento */
function robo(n){
  let h=0;for(let i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))>>>0;
  const r=()=>{h=(h*1664525+1013904223)>>>0;return h/4294967296};
  if(n==='tecla'){nota(1800+r()*900,0,.025,'sine',.05);return}
  if(n==='erro'){nota(900,0,.1,'sawtooth',.07,300);nota(500,.1,.14,'sawtooth',.07,160);return}
  const k=3+Math.floor(r()*3);
  for(let i=0;i<k;i++){const f=500+r()*2200;nota(f,i*.075,.07+r()*.04,i%2?'triangle':'sine',.13,f*(r()>.5?1.45:.65))}
}
const PACKS={padrao:{n:'🎛️ Clássico'},
  moderno:{n:'✨ Moderno'},
  maquina:{n:'⌨️ Máquina suave',fn:{tecla:()=>clack(0,.5),erro:()=>{clack(0,1);clack(.09,1)},env:fimLinha,enviar:fimLinha,msg:()=>clack(0,.6),ok:sino,notify:sino,ping:sino,cash:sino,tema:sino,level:sino,_:()=>clack(0,.35)}},
  robo:{n:'🤖 Robô',fn:{_:robo}},
  cyber:{n:'🌆 Cyberpunk',w:'sawtooth',m:.7,d:1.1,v:.45,dobra:{m:1.5,v:.6},pre:()=>ruido(0,.05,.18,6500)},
suave:{n:'🌿 Suave',w:'sine',m:.85,d:1.25,v:.75},retro:{n:'👾 Retrô 8-bit',w:'square',m:1,d:.8,v:.7},cristal:{n:'🔔 Cristal',w:'triangle',m:1.6,d:1.5,v:.85},grave:{n:'🥁 Grave',w:'triangle',m:.5,d:1.1,v:1.1},espacial:{n:'🚀 Espacial',w:'sawtooth',m:1.2,d:1.2,v:.45}};
let pack='padrao',vol=.5;try{const q=localStorage.getItem('mh_somfx');if(PACKS[q])pack=q;const w=parseFloat(localStorage.getItem('mh_somvol'));if(w>=0&&w<=1)vol=w}catch(e){}
function nota(f,ini,dur,tipo,vol,fim){
  if(!ctx||!master)return;
  if(pack==='padrao'){
    /* Clássico: exatamente o som original (envelope exponencial) */
    const t=ctx.currentTime+ini,o=ctx.createOscillator(),g=ctx.createGain();
    o.type=tipo||'sine';o.frequency.setValueAtTime(f,t);if(fim)o.frequency.exponentialRampToValueAtTime(fim,t+dur);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol||.1,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.02);return}
  {const P=PACKS[pack];if(P&&P.dobra&&!nota._r){nota._r=1;try{nota(f*P.dobra.m,ini,dur,tipo,(vol||.1)*P.dobra.v,fim?fim*P.dobra.m:0)}finally{nota._r=0}}}
  {const P=PACKS[pack];if(P&&P.w){tipo=P.w;f=f*P.m;if(fim)fim=fim*P.m;dur=dur*P.d;vol=(vol||.1)*P.v}}
  const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+Math.max(0,ini);
  const d=Math.max(.02,dur),v=Math.max(.0001,vol||.1);
  o.type=tipo||'sine';
  try{
    o.frequency.setValueAtTime(Math.max(40,f),t);
    if(fim&&fim>0)o.frequency.linearRampToValueAtTime(Math.max(40,fim),t+d);
  }catch(e){}
  try{
    g.gain.setValueAtTime(.0001,t);
    g.gain.linearRampToValueAtTime(v,t+.012);
    g.gain.linearRampToValueAtTime(.0001,t+d);
  }catch(e){g.gain.value=v}
  o.connect(g);g.connect(master);o.start(t);o.stop(t+d+.03)}
const SONS={
  tick:()=>nota(900,0,.05,'sine',.12,600),
  lig:()=>{nota(700,0,.08,'sine',.2);nota(1050,.07,.14,'sine',.2)},
  ok:()=>{nota(660,0,.14,'triangle',.22);nota(880,.1,.14,'triangle',.22);nota(1320,.2,.28,'triangle',.2)},
  erro:()=>{nota(220,0,.16,'square',.09,160);nota(165,.14,.22,'square',.09,120)},
  msg:()=>nota(520,0,.09,'sine',.16,780),
  env:()=>nota(780,0,.08,'sine',.16,1000),
  coin:()=>{nota(880,0,.06,'square',.08);nota(1320,.05,.09,'square',.08)},
  tiro:()=>nota(1200,0,.09,'square',.06,300),
  boom:()=>nota(170,0,.3,'sawtooth',.16,40),
  over:()=>{nota(440,0,.2,'triangle',.2,330);nota(330,.2,.2,'triangle',.2,220);nota(220,.4,.4,'triangle',.2,110)},
  sos:()=>{for(let i=0;i<5;i++){nota(980,i*.3,.14,'square',.3);nota(740,i*.3+.15,.14,'square',.3)}},
  /* novos efeitos UI */
  pop:()=>{nota(640,0,.04,'sine',.14,900);nota(1100,.03,.06,'triangle',.1)},
  whoosh:()=>{nota(420,0,.18,'sine',.1,180)},
  ping:()=>{nota(1200,0,.07,'sine',.14);nota(1600,.05,.1,'sine',.1)},
  soft:()=>nota(380,0,.12,'triangle',.1,520),
  swipe:()=>{nota(300,0,.1,'sine',.08,900)},
  notify:()=>{nota(880,0,.08,'triangle',.16);nota(1175,.1,.16,'triangle',.14)},
  level:()=>{nota(520,0,.08,'square',.08);nota(780,.08,.08,'square',.08);nota(1040,.16,.14,'square',.1)},
  tap:()=>nota(1100,0,.03,'sine',.1,700),
  /* efeitos novos */
  abre:()=>{nota(500,0,.07,'sine',.13,760);nota(760,.06,.1,'triangle',.12,980)},
  fecha:()=>{nota(760,0,.06,'sine',.12,520);nota(520,.05,.09,'triangle',.1,360)},
  tecla:()=>nota(1500+Math.random()*400,0,.02,'square',.025,1200),
  copia:()=>{nota(1000,0,.05,'triangle',.14);nota(1500,.05,.09,'triangle',.14)},
  enviar:()=>{nota(600,0,.07,'sine',.15,900);nota(900,.07,.1,'sine',.15,1300)},
  sai:()=>{nota(700,0,.1,'triangle',.16,500);nota(500,.1,.16,'triangle',.14,330)},
  cash:()=>{nota(1318,0,.07,'square',.07);nota(1760,.07,.07,'square',.07);nota(2093,.14,.2,'square',.08)},
  tema:()=>{nota(392,0,.08,'triangle',.14);nota(523,.07,.08,'triangle',.14);nota(659,.14,.12,'triangle',.14);nota(784,.21,.2,'triangle',.12)},
  ligou:()=>{nota(300,0,.06,'sine',.1,500);nota(500,.05,.06,'sine',.12,800)},
  magia:()=>{[0,1,2,3,4].forEach(i=>nota(900+i*220,i*.045,.12,'sine',.08))}
};
const ult={};
const CLAS=new Set(['tick','lig','ok','erro','msg','env','coin','tiro','boom','over','sos']);
function toca(n){
  if(pack==='padrao'){/* Clássico: só os sons originais; o resto vira o "tick" de sempre */
    if(n==='tecla')return;
    if(!CLAS.has(n))n=(n==='cash'?'coin':'tick');
    SONS[n]();return}
  const P=PACKS[pack];if(P&&P.pre)P.pre();if(P&&P.fn){(P.fn[n]||P.fn._||(()=>SONS[n]()))(n)}else SONS[n]()}
function som(n,gap){
  if(!on||!SONS[n])return;
  const a=Date.now();if(a-(ult[n]||0)<(gap||60))return;
  if(!pronto()){
    /* celular: o áudio pode estar suspenso (tela apagada, aba em segundo plano). Acorda e toca assim que liberar. */
    if(ctx&&ctx.state!=='running'){ctx.resume().then(()=>{if(ctx.state==='running'){ult[n]=Date.now();try{toca(n)}catch(e){}}}).catch(()=>{})}
    return}
  ult[n]=a;try{toca(n)}catch(e){}}
window.MH_SOM={packs:()=>Object.keys(PACKS).map(k=>[k,PACKS[k].n]),pack:k=>{if(k===undefined)return pack;if(PACKS[k]){pack=k;try{localStorage.setItem('mh_somfx',k)}catch(e){}}},vol:v=>{if(v===undefined)return vol;vol=Math.max(0,Math.min(1,v));if(master)master.gain.value=vol;try{localStorage.setItem('mh_somvol',String(vol))}catch(e){}},tocar:som,ligado:()=>on,ctx:()=>{pronto();return ctx},_set:v=>{on=!!v;try{localStorage.setItem(KEY,on?'1':'0')}catch(e){}}};
/* o navegador só libera áudio depois de um toque ou tecla */
['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,pronto,{capture:true,passive:true}));

/* botão liga/muta */
const b=document.createElement('button');b.id='somBtn';b.type='button';b.setAttribute('aria-label','Sons do site');
function mostra(){b.textContent=on?'🔊':'🔇';b.setAttribute('aria-pressed',String(on));b.title=on?'Sons ligados. Toque para mutar':'Sons mutados. Toque para ligar';b.dataset.som=on?'on':'off'}
b.onclick=()=>{
  on=!on;try{localStorage.setItem(KEY,on?'1':'0')}catch(e){}mostra();
  if(on){pronto();if(ctx&&ctx.state==='suspended')ctx.resume().then(()=>som('lig',0)).catch(()=>som('lig',0));else som('lig',0)}
};
mostra();document.body.append(b);

/* toque em botões, links e opções */
document.addEventListener('click',e=>{
  const t=e.target.closest&&e.target.closest('button,a,[role=button],summary,select,input[type=radio],input[type=checkbox]');
  if(!t||t.id==='somBtn'||t.disabled)return;
  if(t.id==='sosEnviar'){som('sos',300);return}
  if(t.id==='nudge'){som('notify',80);return}
  if(t.id==='pShare'||(t.classList&&t.classList.contains('wa'))){som('ping',80);return}
  if(t.id==='introHide'){som('whoosh',80);return}
  if(t.id==='introShow'){som('soft',80);return}
  if(t.closest&&t.closest('#dock')){som('pop',50);return}
  if(t.closest&&t.closest('#needRow')){som('level',80);return}
  if(t.id==='btnCad'){som('tap',40);return}
  if(t.id==='sbtn'){som('env',40);return}
  if(t.classList&&t.classList.contains('adc')){som('soft',60);return}
  som('tick',50)},true);

/* sons extras: diálogos e janelas abrindo/fechando, teclas, cópia, envio, sair, pix */
document.addEventListener('keydown',e=>{const t=e.target;if(t&&(t.id==='m'||t.tagName==='TEXTAREA'||(t.tagName==='INPUT'&&/^(text|search|email|tel|password|number)$/.test(t.type||'text')))&&e.key.length===1)som('tecla',45)},true);
document.addEventListener('submit',e=>{som('enviar',200)},true);
document.addEventListener('close',e=>{const d=e.target;if(d&&d.tagName==='DIALOG')som('fecha',120)},true);
document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.tagName==='DETAILS'&&Date.now()-t0>1500)som(d.open?'abre':'fecha',120)},true);
new MutationObserver(rs=>{for(const r of rs){const d=r.target;if(d.tagName==='DIALOG'&&d.hasAttribute('open')&&!r.oldValue&&Date.now()-t0>1500)som(d.id==='dpix'||d.id==='dap'?'cash':'abre',150)}}).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['open'],attributeOldValue:true});
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#dcopc,#dcopk,#dcopr,#dcop');if(t)som('copia',80)},true);
{const sa=document.getElementById('sairBar');if(sa){let v=!sa.hidden;new MutationObserver(()=>{const n=!sa.hidden;if(!n&&v)som('sai',500);v=n}).observe(sa,{attributes:true,attributeFilter:['hidden']})}}
/* erro de login/cadastro */
const fe=document.getElementById('ferr');
if(fe)new MutationObserver(()=>{if(fe.style.display!=='none'&&fe.textContent.trim())som('erro',250)})
  .observe(fe,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['style']});

/* entrou na conta */
const sb=document.getElementById('sairBar');
if(sb){let vis=!sb.hidden;new MutationObserver(()=>{const v=!sb.hidden;if(v&&!vis)som('ok',500);vis=v}).observe(sb,{attributes:true,attributeFilter:['hidden']})}

/* mensagens novas no chat (as suas e as dos outros) */
const lg=document.getElementById('log');
if(lg&&lg.parentNode)new MutationObserver(rs=>{
  if(Date.now()-t0<2500||document.hidden)return;
  for(const r of rs)for(const n of r.addedNodes){
    if(n.nodeType!==1||!n.matches||!n.matches('p[data-de]'))continue;
    const eu=window.MH_UI&&MH_UI.eu&&MH_UI.eu();
    som(eu&&n.dataset.de===eu.nome?'env':'msg',700);return}
}).observe(lg.parentNode,{childList:true,subtree:true});
})()}catch(e){console.error('MiHelp (sons):',e)}

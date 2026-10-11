
try{(function(){
const $=id=>document.getElementById(id),cv=$('flCv');if(!cv)return;
const g=cv.getContext('2d'),W=360,OURO='#E8B93C',OURO2='#F0CD70',FUNDO='#0D0C09';
const S=(n,t)=>{try{window.MH_SOM&&MH_SOM.tocar(n,t)}catch(e){}};
const NOME={cobra:'COBRINHA',aster:'ASTEROIDS'};
const DICA={cobra:'Coma as bolinhas sem bater em você. Setas, WASD ou deslize na tela.',aster:'Setas: girar e acelerar. Espaço ou 🔥: atirar. Destrua as pedras.'};
let jogo='cobra',est='parado',pts=0,rec=0,raf=0,last=0,K={},fimTxt='';
let sn,dir,nd,food,acc,vel,sh,bl,ro,vidas,nivel,inv,cd;
const rnd=(a,b)=>a+Math.random()*(b-a);
const EX={};
function iniJ(){jogo==='cobra'?iniCobra():jogo==='aster'?iniAster():EX[jogo].ini()}
const N=18,C=W/N,TAM=[0,9,16,28];

/* Cobrinha */
function comida(){let p;do{p={x:Math.floor(Math.random()*N),y:Math.floor(Math.random()*N)}}while(sn.some(s=>s.x===p.x&&s.y===p.y));return p}
function iniCobra(){sn=[{x:9,y:9},{x:8,y:9},{x:7,y:9}];dir={x:1,y:0};nd=dir;acc=0;vel=.12;food=comida()}
function virar(dx,dy){if(dx===-dir.x&&dy===-dir.y)return;nd={x:dx,y:dy}}
function upCobra(dt){acc+=dt;while(acc>=vel){acc-=vel;dir=nd;
  const h={x:(sn[0].x+dir.x+N)%N,y:(sn[0].y+dir.y+N)%N};
  if(sn.some(s=>s.x===h.x&&s.y===h.y))return fim();
  sn.unshift(h);
  if(h.x===food.x&&h.y===food.y){pts+=10;S('coin',30);vel=Math.max(.06,vel-.003);food=comida();hud()}else sn.pop()}}
function dCobra(){sn.forEach((s,i)=>{g.fillStyle=i?OURO:OURO2;g.fillRect(s.x*C+1,s.y*C+1,C-2,C-2)});
  g.fillStyle='#D97757';g.beginPath();g.arc(food.x*C+C/2,food.y*C+C/2,C/2-3,0,7);g.fill()}

/* Asteroids */
function pedra(x,y,t){const a=rnd(0,6.283),v=rnd(30,60)*(4-t)*.6+20+nivel*4;
  return{x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t,r:TAM[t],rot:0,vr:rnd(-1.5,1.5),p:Array.from({length:9},()=>rnd(.75,1.2))}}
function navePos(){sh={x:W/2,y:W/2,a:-Math.PI/2,vx:0,vy:0}}
function onda(){ro=[];for(let i=0;i<3+nivel;i++){let x,y;do{x=rnd(0,W);y=rnd(0,W)}while(Math.hypot(x-sh.x,y-sh.y)<110);ro.push(pedra(x,y,3))}}
function iniAster(){vidas=3;nivel=1;bl=[];inv=2;cd=0;navePos();onda()}
const env=o=>{o.x=(o.x+W)%W;o.y=(o.y+W)%W};
function upAster(dt){
  if(K.L)sh.a-=4*dt;if(K.R)sh.a+=4*dt;
  if(K.U){sh.vx+=Math.cos(sh.a)*240*dt;sh.vy+=Math.sin(sh.a)*240*dt}
  const f=Math.pow(.55,dt);sh.vx*=f;sh.vy*=f;
  const v=Math.hypot(sh.vx,sh.vy);if(v>260){sh.vx*=260/v;sh.vy*=260/v}
  sh.x+=sh.vx*dt;sh.y+=sh.vy*dt;env(sh);cd-=dt;inv-=dt;
  if(K.F&&cd<=0&&bl.length<5){bl.push({x:sh.x+Math.cos(sh.a)*12,y:sh.y+Math.sin(sh.a)*12,vx:Math.cos(sh.a)*420+sh.vx,vy:Math.sin(sh.a)*420+sh.vy,life:1});cd=.22;S('tiro',110)}
  bl.forEach(b=>{b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;env(b)});bl=bl.filter(b=>b.life>0);
  ro.forEach(r=>{r.x+=r.vx*dt;r.y+=r.vy*dt;r.rot+=r.vr*dt;env(r)});
  for(const b of bl){for(let i=0;i<ro.length;i++){const r=ro[i];
    if(Math.hypot(b.x-r.x,b.y-r.y)<r.r){b.life=0;ro.splice(i,1);pts+=[0,100,50,20][r.t];S('boom',80);
      if(r.t>1)ro.push(pedra(r.x,r.y,r.t-1),pedra(r.x,r.y,r.t-1));hud();break}}}
  bl=bl.filter(b=>b.life>0);
  if(inv<=0)for(const r of ro){if(Math.hypot(sh.x-r.x,sh.y-r.y)<r.r+7){vidas--;S('boom',80);hud();if(vidas<=0)return fim();navePos();inv=2.5;break}}
  if(!ro.length){nivel++;onda();inv=2;S('ok',500)}}
function dAster(){g.strokeStyle=OURO;g.lineWidth=2;
  ro.forEach(r=>{g.beginPath();r.p.forEach((k,i)=>{const a=r.rot+i/9*6.283,x=r.x+Math.cos(a)*r.r*k,y=r.y+Math.sin(a)*r.r*k;i?g.lineTo(x,y):g.moveTo(x,y)});g.closePath();g.stroke()});
  g.fillStyle=OURO2;bl.forEach(b=>g.fillRect(b.x-1.5,b.y-1.5,3,3));
  if(inv>0&&Math.floor(inv*8)%2)return;
  g.save();g.translate(sh.x,sh.y);g.rotate(sh.a);g.strokeStyle=OURO2;g.beginPath();g.moveTo(12,0);g.lineTo(-9,-7);g.lineTo(-5,0);g.lineTo(-9,7);g.closePath();g.stroke();
  if(K.U&&est==='jogando'){g.strokeStyle='#D97757';g.beginPath();g.moveTo(-6,-3);g.lineTo(-14-Math.random()*5,0);g.lineTo(-6,3);g.stroke()}
  g.restore()}

/* Tela, estado e interface */
function tela(){g.fillStyle=FUNDO;g.fillRect(0,0,W,W);
  if(jogo==='cobra'){if(sn)dCobra()}else if(jogo==='aster'){if(sh)dAster()}else if(EX[jogo])EX[jogo].des();
  if(est!=='jogando'){g.fillStyle='rgba(13,12,9,.72)';g.fillRect(0,0,W,W);g.textAlign='center';
    g.fillStyle=OURO;g.font='700 26px IBM Plex Mono,monospace';g.fillText(est==='pausa'?'PAUSADO':NOME[jogo],W/2,W/2-4);
    g.fillStyle=OURO2;g.font='600 13px IBM Plex Mono,monospace';g.fillText(est==='pausa'?'toque em Continuar':(fimTxt||'toque em Jogar'),W/2,W/2+22)}}
function hud(){$('flPts').textContent='Pontos: '+pts+(jogo==='aster'&&est!=='parado'?' · Vidas: '+'♥'.repeat(Math.max(vidas,0)):(EX[jogo]&&EX[jogo].hud&&est!=='parado'?EX[jogo].hud():''));$('flRec').textContent='Recorde: '+rec}
const msg=t=>{$('flMsg').textContent=t};
function ui(){$('flGo').textContent=est==='jogando'?'Pausar':est==='pausa'?'Continuar':(fimTxt?'Jogar de novo':'Jogar');
  cv.style.touchAction=est==='jogando'?'none':'auto';
  const P=(EX[jogo]&&EX[jogo].pad)||(jogo==='cobra'?'LRUD':'LRUF');['L','R','U','D','F'].forEach(k=>{const e=$('flPad').querySelector('[data-k='+k+']');e.hidden=P.indexOf(k)<0;e.textContent=((EX[jogo]&&EX[jogo].lbl)||{})[k]||{L:'◀',R:'▶',U:'▲',D:'▼',F:'🔥'}[k]})}
function fim(){est='parado';S('over',500);K={};
  const nr=window.MH_PLACAR?MH_PLACAR.reg(jogo,pts):0;rec=window.MH_PLACAR?MH_PLACAR.recorde(jogo):Math.max(rec,pts);fimTxt=(nr?'NOVO RECORDE: ':'Fim de jogo: ')+pts+' pts';
  ui();hud();msg(fimTxt+'. Toque em Jogar de novo.')}
function prepara(){est='parado';fimTxt='';K={};pts=0;
  rec=window.MH_PLACAR?MH_PLACAR.recorde(jogo):0;
  iniJ();ui();hud();msg(DICA[jogo]);tela();if(window.MH_PLACAR)MH_PLACAR.pinta()}
function loop(t){if(est!=='jogando')return;const dt=Math.min(.05,(t-last)/1000||0);last=t;
  (jogo==='cobra'?upCobra:jogo==='aster'?upAster:EX[jogo].up)(dt);tela();if(est==='jogando')raf=requestAnimationFrame(loop)}
const pausa=()=>{if(est==='jogando'){est='pausa';K={};ui();tela();msg('Pausado. Toque em Continuar.')}};

$('flGo').onclick=()=>{
  if(est==='jogando'){pausa();return}
  if(est==='parado'){pts=0;fimTxt='';iniJ()}
  est='jogando';K={};ui();hud();msg(DICA[jogo]);if(window.MH_PLACAR)MH_PLACAR.pinta();cancelAnimationFrame(raf);last=performance.now();raf=requestAnimationFrame(loop)};
document.querySelectorAll('.fl-tabs button').forEach(b=>b.onclick=()=>{
  if(b.dataset.j===jogo)return;cancelAnimationFrame(raf);jogo=b.dataset.j;
  document.querySelectorAll('.fl-tabs button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));prepara()});

/* controles: teclado, botões na tela e deslizar */
const MAPA={ArrowLeft:'L',a:'L',A:'L',ArrowRight:'R',d:'R',D:'R',ArrowUp:'U',w:'U',W:'U',ArrowDown:'D',s:'D',S:'D',' ':'F'};
function tecla(k,v){if(v&&jogo==='cobra'){k==='L'?virar(-1,0):k==='R'?virar(1,0):k==='U'?virar(0,-1):k==='D'?virar(0,1):0}K[k]=v}
addEventListener('keydown',e=>{
  if(est==='parado'||e.ctrlKey||e.metaKey||e.altKey||(e.target.closest&&e.target.closest('input,textarea,select,[contenteditable]')))return;
  if(e.key==='p'||e.key==='P'){$('flGo').click();return}
  if(est!=='jogando')return;const k=MAPA[e.key];if(!k)return;e.preventDefault();tecla(k,true)});
addEventListener('keyup',e=>{const k=MAPA[e.key];if(k)K[k]=false});
document.querySelectorAll('#flPad [data-k]').forEach(b=>{const k=b.dataset.k;
  b.addEventListener('pointerdown',e=>{e.preventDefault();if(est==='jogando')tecla(k,true)});
  ['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>{K[k]=false}));
  b.addEventListener('contextmenu',e=>e.preventDefault())});
let sx=0,sy=0;cv.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY});
cv.addEventListener('pointerup',e=>{if(est!=='jogando'||jogo!=='cobra')return;const dx=e.clientX-sx,dy=e.clientY-sy;
  if(Math.max(Math.abs(dx),Math.abs(dy))<20)return;Math.abs(dx)>Math.abs(dy)?virar(dx>0?1:-1,0):virar(0,dy>0?1:-1)});

/* pausa sozinho se a pessoa sair da aba ou rolar a página */
document.addEventListener('visibilitychange',()=>{if(document.hidden)pausa()});
if('IntersectionObserver' in window)new IntersectionObserver(es=>{if(!es[0].isIntersecting)pausa()},{threshold:.2}).observe(cv);
window.MH_FLIP={nomes:NOME,reg(id,d){EX[id]=d;NOME[id]=d.nome;DICA[id]=d.dica},prepara,refresh(){rec=window.MH_PLACAR?MH_PLACAR.recorde(jogo):0;hud();if(window.MH_PLACAR)MH_PLACAR.pinta()},get atual(){return jogo},get estado(){return est},
  api:{W,g,S,OURO,OURO2,get K(){return K},get jogo(){return jogo},add(n){pts+=n;hud()},fim}};
prepara();
})()}catch(e){console.error('MiHelp (fliperama):',e)}

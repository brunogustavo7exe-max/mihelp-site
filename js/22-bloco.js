
/* Mais jogos (Tijolos e Pong) e placar de recordes de cada jogo. */
try{(function(){
const F=window.MH_FLIP;if(!F)return;
const A=F.api,W=A.W,g=A.g,cv=document.getElementById('flCv');
const vt=v=>' · Vidas: '+'♥'.repeat(Math.max(v,0)),lim=(v,a,b)=>Math.max(a,Math.min(b,v));

/* Tijolos */
let pa,bo,tj,vd,lv;
function tijolos(){tj=[];for(let r=0;r<5;r++)for(let c=0;c<8;c++)tj.push({x:20+c*40,y:44+r*18,w:37,h:14,r})}
function bola(){bo={x:pa.x,y:330,vx:(Math.random()<.5?-1:1)*90,vy:-(190+lv*18)}}
function iniT(){pa={x:W/2,w:64};vd=3;lv=0;tijolos();bola()}
function upT(dt){const K=A.K;
  if(K.L)pa.x-=300*dt;if(K.R)pa.x+=300*dt;pa.x=lim(pa.x,pa.w/2,W-pa.w/2);
  bo.x+=bo.vx*dt;bo.y+=bo.vy*dt;
  if(bo.x<5||bo.x>W-5){bo.vx*=-1;bo.x=lim(bo.x,5,W-5)}
  if(bo.y<5){bo.vy=Math.abs(bo.vy);bo.y=5}
  if(bo.vy>0&&bo.y>=339&&bo.y<=352&&Math.abs(bo.x-pa.x)<=pa.w/2+5){const o=(bo.x-pa.x)/(pa.w/2),v=Math.hypot(bo.vx,bo.vy);bo.vx=o*v*.8;bo.vy=-Math.sqrt(Math.max(v*v-bo.vx*bo.vx,v*v*.3));A.S('tick',30)}
  for(let i=0;i<tj.length;i++){const b=tj[i];
    if(bo.x>b.x-5&&bo.x<b.x+b.w+5&&bo.y>b.y-5&&bo.y<b.y+b.h+5){
      const dx=Math.min(bo.x-b.x,b.x+b.w-bo.x),dy=Math.min(bo.y-b.y,b.y+b.h-bo.y);
      if(dx<dy)bo.vx*=-1;else bo.vy*=-1;tj.splice(i,1);A.add(10+(4-b.r)*5);A.S('coin',30);break}}
  if(!tj.length){lv++;tijolos();bola();A.S('ok',500)}
  if(bo.y>W+8){vd--;A.S('boom',80);if(vd<=0)return A.fim();bola()}}
function dT(){tj.forEach(b=>{g.fillStyle=['#D97757','#E8B93C','#F0CD70','#C9A24A','#A79C82'][b.r];g.fillRect(b.x,b.y,b.w,b.h)});
  g.fillStyle=A.OURO2;g.fillRect(pa.x-pa.w/2,344,pa.w,8);g.beginPath();g.arc(bo.x,bo.y,5,0,7);g.fill()}

/* Pong contra o computador */
let pj,cp,pb,pv,pn;
function saque(d){pb={x:W/2,y:W/2,vx:d*(200+pn*12),vy:(Math.random()*2-1)*110}}
function iniP(){pj=W/2;cp=W/2;pv=3;pn=0;saque(Math.random()<.5?-1:1)}
function upP(dt){const K=A.K,H=28;
  if(K.U)pj-=280*dt;if(K.D)pj+=280*dt;pj=lim(pj,H,W-H);
  cp+=lim((pb.y-cp)/10,-1,1)*(130+pn*6)*dt;cp=lim(cp,H,W-H);
  pb.x+=pb.vx*dt;pb.y+=pb.vy*dt;
  if(pb.y<5||pb.y>W-5){pb.vy*=-1;pb.y=lim(pb.y,5,W-5)}
  if(pb.vx<0&&pb.x<=22&&pb.x>=10&&Math.abs(pb.y-pj)<=H+5){pb.vx=Math.abs(pb.vx)*1.05;pb.vy=lim(pb.vy+(pb.y-pj)*4,-260,260);pn++;A.add(10);A.S('coin',30)}
  if(pb.vx>0&&pb.x>=W-22&&pb.x<=W-10&&Math.abs(pb.y-cp)<=H+5){pb.vx=-Math.abs(pb.vx)*1.03;pb.vy=lim(pb.vy+(pb.y-cp)*4,-260,260);A.S('tick',30)}
  if(pb.x<-10){pv--;A.S('boom',80);if(pv<=0)return A.fim();saque(1)}
  if(pb.x>W+10){A.add(30);A.S('ok',200);saque(-1)}}
function dP(){g.fillStyle='#332D20';for(let y=0;y<W;y+=20)g.fillRect(W/2-1,y,2,10);
  g.fillStyle=A.OURO2;g.fillRect(10,pj-28,8,56);g.fillRect(W-18,cp-28,8,56);g.fillRect(pb.x-4,pb.y-4,8,8)}

F.reg('tijolos',{nome:'TIJOLOS',dica:'Setas ou arraste na tela para mover a barra. Quebre todos os tijolos.',pad:'LR',ini:iniT,up:upT,des:dT,hud:()=>vt(vd)});
F.reg('pong',{nome:'PONG',dica:'Setas ▲▼ ou arraste na tela. Rebata a bola e marque contra o computador.',pad:'UD',ini:iniP,up:upP,des:dP,hud:()=>vt(pv)});
cv.addEventListener('pointermove',e=>{if(F.estado!=='jogando')return;const r=cv.getBoundingClientRect();
  if(A.jogo==='tijolos'&&pa)pa.x=lim((e.clientX-r.left)/r.width*W,32,W-32);
  if(A.jogo==='pong'&&pj!=null)pj=lim((e.clientY-r.top)/r.height*W,28,W-28)});

/* Placar: cada jogo tem o seu, guardado neste aparelho */
const PK='mh_placar',ler=()=>{try{return JSON.parse(localStorage.getItem(PK)||'{}')||{}}catch(e){return{}}},grava=o=>{try{localStorage.setItem(PK,JSON.stringify(o))}catch(e){}};
const mk=(t,x)=>{const e=document.createElement(t);if(x!=null)e.textContent=x;return e};
const eu=()=>{try{return window.MH_UI&&MH_UI.eu&&MH_UI.eu()}catch(e){return null}};
const cap=t=>t.charAt(0)+t.slice(1).toLowerCase();
function nome(){const u=eu();if(u&&u.nome)return u.nome.slice(0,16);let n='';const i=document.getElementById('flNome');if(i)n=i.value.trim();
  if(!n){try{n=localStorage.getItem('mh_apelido')||''}catch(e){}}return(n||'Visitante').slice(0,16)}
function pinta(){const b=document.getElementById('flBoard');if(!b)return;const j=F.atual,l=(ler()[j]||[]).slice(0,5),u=eu();b.textContent='';
  b.append(mk('h3','🏆 Placar · '+cap(F.nomes[j])));
  if(!l.length){const p=mk('p','Ninguém marcou ponto ainda. Seja o primeiro!');p.className='note';b.append(p)}
  else{const ol=mk('ol');l.forEach((x,i)=>{const li=mk('li');li.append(mk('span',(i+1)+'. '+x.n),mk('b',x.p+' pts'));ol.append(li)});b.append(ol)}
  if(u&&u.nome){const p=mk('p','Jogando como '+u.nome+'.');p.className='note';b.append(p)}
  else{const i=mk('input');i.id='flNome';i.maxLength=16;i.placeholder='Seu nome no placar';i.setAttribute('aria-label','Seu nome no placar');
    try{i.value=localStorage.getItem('mh_apelido')||''}catch(e){}i.oninput=()=>{try{localStorage.setItem('mh_apelido',i.value.trim())}catch(e){}};b.append(i)}
  const n=mk('p','O placar fica salvo neste aparelho.');n.className='note';b.append(n)}
window.MH_PLACAR={
  lista:()=>Object.keys(F.nomes).map(k=>[k,cap(F.nomes[k])]),
  recorde:j=>{const l=ler()[j]||[];return l.length?l[0].p:0},
  pinta,
  reg(j,p){if(!(p>0))return false;const o=ler(),l=o[j]||[],n=nome(),antes=l.length?l[0].p:0,i=l.findIndex(x=>x.n.toLowerCase()===n.toLowerCase());
    if(i>=0){if(p<=l[i].p){pinta();return false}l[i].p=p;l[i].t=Date.now()}else l.push({n,p,t:Date.now()});
    l.sort((a,b)=>b.p-a.p);o[j]=l.slice(0,10);grava(o);pinta();return p>antes},
  limpar(j){if(j){const o=ler();delete o[j];grava(o)}else{try{localStorage.removeItem(PK)}catch(e){}}F.refresh()}};
F.refresh();
})()}catch(e){console.error('MiHelp (jogos extras e placar):',e)}

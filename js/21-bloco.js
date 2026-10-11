
/* Tetris */
try{(function(){
const F=window.MH_FLIP;if(!F)return;
const A=F.api,g=A.g,CS=17,BX=20,BY=10;
const PC=[
 {m:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],c:'#8FD3E0'},{m:[[1,1],[1,1]],c:'#F0CD70'},
 {m:[[0,1,0],[1,1,1],[0,0,0]],c:'#B58AD9'},{m:[[0,1,1],[1,1,0],[0,0,0]],c:'#7FC98B'},
 {m:[[1,1,0],[0,1,1],[0,0,0]],c:'#D97757'},{m:[[1,0,0],[1,1,1],[0,0,0]],c:'#6F8FE0'},{m:[[0,0,1],[1,1,1],[0,0,0]],c:'#E8B93C'}];
let bd,cur,nx,sac,ln,lv,acc,pk,dir,das;
function sorteia(){if(!sac.length){sac=[0,1,2,3,4,5,6];for(let i=6;i>0;i--){const j=Math.floor(Math.random()*(i+1));[sac[i],sac[j]]=[sac[j],sac[i]]}}return sac.pop()}
function cabe(m,x,y){for(let j=0;j<m.length;j++)for(let i=0;i<m[j].length;i++)if(m[j][i]){const a=x+i,b=y+j;if(a<0||a>9||b>19||(b>=0&&bd[b][a]))return false}return true}
function nova(){const k=nx;nx=sorteia();cur={m:PC[k].m,c:PC[k].c,x:Math.floor((10-PC[k].m[0].length)/2),y:0};if(!cabe(cur.m,cur.x,cur.y))return A.fim()}
function gira(){const r=cur.m[0].map((_,i)=>cur.m.map(w=>w[i]).reverse());for(const o of[0,-1,1,-2,2])if(cabe(r,cur.x+o,cur.y)){cur.m=r;cur.x+=o;A.S('tick',30);return}}
function trava(){cur.m.forEach((r,j)=>r.forEach((v,i)=>{if(v&&cur.y+j>=0)bd[cur.y+j][cur.x+i]=cur.c}));
  let n=0;for(let y=19;y>=0;y--)if(bd[y].every(v=>v)){bd.splice(y,1);bd.unshift(Array(10).fill(0));n++;y++}
  if(n){ln+=n;lv=1+Math.floor(ln/10);A.add([0,100,300,500,800][n]*lv);A.S(n>3?'ok':'coin',100)}else A.S('tick',30);
  acc=0;return nova()}
function ini(){bd=Array.from({length:20},()=>Array(10).fill(0));ln=0;lv=1;acc=0;sac=[];pk={};dir=0;das=0;nx=sorteia();nova()}
function up(dt){const K=A.K,eU=K.U&&!pk.U,eF=K.F&&!pk.F,d=(K.L?-1:0)+(K.R?1:0);pk={U:K.U,F:K.F};
  if(d!==dir){dir=d;das=0;if(d&&cabe(cur.m,cur.x+d,cur.y))cur.x+=d}
  else if(d){das+=dt;if(das>.17){das-=.05;if(cabe(cur.m,cur.x+d,cur.y))cur.x+=d}}
  if(eU)gira();
  if(eF){let n=0;while(cabe(cur.m,cur.x,cur.y+1)){cur.y++;n++}A.add(2*n);return trava()}
  acc+=dt;const iv=K.D?.04:Math.max(.08,.8-(lv-1)*.07);
  while(acc>=iv){acc-=iv;if(cabe(cur.m,cur.x,cur.y+1)){cur.y++;if(K.D)A.add(1)}else return trava()}}
function cel(x,y,c,a){g.globalAlpha=a||1;g.fillStyle=c;g.fillRect(BX+x*CS+1,BY+y*CS+1,CS-2,CS-2);g.globalAlpha=1}
function des(){g.textAlign='left';g.strokeStyle='#332D20';g.lineWidth=1;g.strokeRect(BX-1,BY-1,10*CS+2,20*CS+2);
  bd.forEach((r,y)=>r.forEach((c,x)=>{if(c)cel(x,y,c)}));
  let gy=cur.y;while(cabe(cur.m,cur.x,gy+1))gy++;
  cur.m.forEach((r,j)=>r.forEach((v,i)=>{if(v){cel(cur.x+i,gy+j,cur.c,.25);cel(cur.x+i,cur.y+j,cur.c)}}));
  g.fillStyle=A.OURO2;g.font='600 12px IBM Plex Mono,monospace';g.fillText('PRÓXIMA',218,28);g.fillText('NÍVEL '+lv,218,130);g.fillText('LINHAS '+ln,218,150);
  PC[nx].m.forEach((r,j)=>r.forEach((v,i)=>{if(v){g.fillStyle=PC[nx].c;g.fillRect(222+i*13,40+j*13,12,12)}}))}
F.reg('tetris',{nome:'TETRIS',dica:'◀ ▶ mover, ▲ girar, ▼ descer rápido, espaço ou ⤓ derruba a peça. Complete linhas.',pad:'LRUDF',lbl:{U:'⟳',F:'⤓'},ini,up,des,hud:()=>' · Nível '+lv});
})()}catch(e){console.error('MiHelp (tetris):',e)}

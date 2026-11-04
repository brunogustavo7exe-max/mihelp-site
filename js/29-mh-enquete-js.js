
try{(function(){
const $=id=>document.getElementById(id),A=window.MH_API;
if(!A||!A.on()||!$('eqO'))return;
let cfg=null,busy=false;
const mostra=on=>{$('enquete').hidden=!on;const n=$('navEq');if(n)n.style.display=on?'':'none'};
const msg=t=>{$('eqM').textContent=t||''};
function pinta(j){
 if(!j||!j.ok||!j.id||!j.opcoes||!j.opcoes.length){cfg=null;mostra(false);return}
 cfg=j;mostra(true);$('eqP').textContent=j.pergunta;
 const c=j.contagem||[],tot=c.reduce((a,b)=>a+b,0),box=$('eqO');box.textContent='';
 j.opcoes.forEach((t,i)=>{const n=c[i]||0,p=tot?Math.round(n/tot*100):0;
  const b=document.createElement('button');b.type='button';b.className='eq-b'+(j.meuVoto===i?' me':'');b.disabled=!j.aberta||j.meuVoto>=0||busy;
  const barra=document.createElement('i');barra.style.width=p+'%';const sp=document.createElement('span');
  const a=document.createElement('b');a.textContent=t;const v=document.createElement('em');v.textContent=p+'% · '+n;sp.append(a,v);b.append(barra,sp);
  b.addEventListener('click',()=>votar(i));box.append(b)});
 msg(!j.aberta?'Enquete encerrada. Total: '+tot+' votos.':j.meuVoto>=0?'Seu voto foi registrado. Total: '+tot+' votos.':A.usrTk()?'Toque numa opção para votar. É grátis. Total: '+tot+' votos.':'Entre na sua conta para votar. Total: '+tot+' votos.')}
async function ler(){const r=await A.req('/enquete',{token:A.usrTk()});if(r.ok&&r.j)pinta(r.j)}
async function votar(i){
 if(!cfg||busy)return;if(!A.usrTk()){msg('Entre na sua conta para votar.');return}
 busy=true;const r=await A.req('/enquete/votar',{token:A.usrTk(),body:{opcao:i,id:cfg.id}});busy=false;
 if(r.ok&&r.j&&r.j.ok)msg('Voto registrado. Obrigado!');
 else if(r.status===401)msg('Entre na sua conta para votar.');
 else if(r.status===409)msg((r.j&&r.j.erro)||'Você já votou.');
 else if(r.status===410)msg('Essa enquete já foi encerrada.');
 else msg('Não consegui registrar o voto agora. Tente de novo.');
 ler()}
ler();setInterval(()=>{if(!document.hidden)ler()},8000);
})()}catch(e){console.error('MiHelp (enquete):',e)}

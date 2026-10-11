
try{(function(){
const A=window.MH_API,$=id=>document.getElementById(id);
if(!$('cpWin'))return;
if(!A||!A.on()){$('cpWin').hidden=true;return}
const UFS=['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const msg=t=>{$('cpMsg').textContent=t||''};
const sel=$('cpUf');[['','UF']].concat(UFS.map(u=>[u,u])).forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;sel.append(o)});
let meus=[],rest=3;
const med=['🥇','🥈','🥉'];
function erro(r){return r.status===401?'Entre na sua conta para votar.':r.status===429?((r.j&&r.j.erro)||'Limite atingido.'):r.status===409?'Você já votou nessa cidade.':(r.j&&r.j.erro)||'Não consegui agora. Tente de novo.'}
async function ler(){
 const r=await A.req('/cidades-pedidas',{token:A.usrTk()});const box=$('cpLista');box.textContent='';
 const at=mk('div','cp-r cp-on');at.append(mk('span',0,'Vale do Araguaia (MT/GO) · já ativo ✅'));box.append(at);
 if(!r.ok){box.append(mk('p','note','Não consegui carregar os pedidos agora.'));return}
 const l=r.j.itens||[];meus=r.j.meus||[];rest=typeof r.j.restantes==='number'?r.j.restantes:3;
 const max=Math.max(1,...l.map(x=>x.votos));
 if(!l.length)box.append(mk('p','note','Ninguém pediu uma cidade ainda. Seja o primeiro!'));
 l.forEach((x,i)=>{const row=mk('div','cp-r'),barra=mk('i');barra.style.width=Math.round(x.votos/max*100)+'%';
  row.append(barra,mk('span',0,(med[i]||'')+' '+x.nome+' ('+x.uf+')'),mk('em',0,x.votos+(x.votos===1?' voto':' votos')));
  const b=mk('button',0,meus.includes(x.chave)?'Votado':'Votar');b.type='button';b.disabled=meus.includes(x.chave);
  b.onclick=async()=>{if(!A.usrTk()){msg('Entre na sua conta para votar.');return}
   b.disabled=true;const q=await A.req('/cidades-pedidas/votar',{token:A.usrTk(),body:{chave:x.chave}});
   if(q.ok&&q.j.ok){msg('Voto registrado! Você ainda tem '+Math.max(0,rest-1)+' voto(s).');ler()}else{msg(erro(q));b.disabled=false}};
  row.append(b);box.append(row)});
 if(A.usrTk())msg('Você tem '+rest+' voto(s) sobrando.');}
$('cpAdd').onclick=async()=>{
 if(!A.usrTk()){msg('Entre na sua conta para pedir a sua cidade.');return}
 const nome=$('cpNome').value.trim(),uf=sel.value;
 if(nome.length<2){msg('Escreva o nome da cidade.');$('cpNome').focus();return}
 if(!uf){msg('Escolha o estado.');sel.focus();return}
 $('cpAdd').disabled=true;const r=await A.req('/cidades-pedidas',{token:A.usrTk(),body:{nome,uf}});$('cpAdd').disabled=false;
 if(r.ok&&r.j.ok){$('cpNome').value='';sel.value='';msg(r.j.nova?'Pedido enviado! Sua cidade entrou no ranking com o seu voto.':'Essa cidade já estava no ranking. Seu voto foi somado!');ler()}
 else msg(erro(r))};
ler();setInterval(()=>{if(!document.hidden)ler()},30000);
})()}catch(e){console.error('MiHelp (cidades):',e)}

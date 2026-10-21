
try{(function(){
const DUELOS={
 cidades:{titulo:'Qual cidade puxa mais forte?',a:{nome:'Barra do Garças',sigla:'MT',cor:'#E8B93C'},b:{nome:'Aragarças',sigla:'GO',cor:'#4F8EF7'}}
 /* Para outro duelo, acrescente uma entrada aqui (ex.: futebol:{titulo,a:{nome,sigla,cor},b:{...}}) e mude ATIVO. */
};
let ATIVO='cidades',D=DUELOS[ATIVO];
if(!D)return;
const $=id=>document.getElementById(id);
if(!$('tgBox'))return;
let A=0,B=0,live=false,valor=1,fast=0,busy=false;
const KT='mh_tg_teste:'+ATIVO;
const brl=n=>'R$ '+Number(n||0).toLocaleString('pt-BR',{minimumFractionDigits:0,maximumFractionDigits:2});
function nome(){try{const e=window.MH_UI&&MH_UI.eu&&MH_UI.eu();return e&&e.nome||''}catch(e){return ''}}
function aplicar(o){if(o&&o.a&&o.b){D=o;ATIVO=o.id||ATIVO}
$('tgTit').textContent=D.titulo;
$('tgNA').textContent=D.a.nome+' ('+D.a.sigla+')';$('tgNB').textContent=D.b.nome+' ('+D.b.sigla+')';
$('tgGoA').textContent='Puxar para '+D.a.nome;$('tgGoB').textContent='Puxar para '+D.b.nome;
$('tgA').style.background=D.a.cor;$('tgBar').style.background=D.b.cor;$('tgGoA').style.background=D.a.cor;$('tgGoB').style.background=D.b.cor;
}
aplicar();window.MH_aplicarDuelo=o=>{aplicar(o);ler()};
try{if(window.MH_API&&MH_API.on())MH_API.req('/config').then(r=>{if(r.ok&&r.j&&r.j.duelo){const o=JSON.parse(r.j.duelo);if(o&&o.a&&o.b){aplicar(o);ler()}}}).catch(()=>{})}catch(e){}
function pinta(ult){
 const t=A+B,pa=t?A/t*100:50;
 $('tgA').style.width=pa+'%';$('tgKnot').style.left=pa+'%';
 $('tgVA').textContent=brl(A);$('tgVB').textContent=brl(B);
 const ra=Math.round(pa);$('tgPct').textContent=ra+'% × '+(100-ra)+'%';
 $('tgBar').setAttribute('aria-label',D.a.nome+' '+ra+' por cento, '+D.b.nome+' '+(100-ra)+' por cento');
 $('tgModo').textContent=live?'Ao vivo: só conta depois do Pix confirmado.':'Modo teste: os votos ficam só neste aparelho e não cobram nada.';
 const u=$('tgUlt');u.textContent='';
 (ult||[]).slice(0,5).forEach(x=>{const d=document.createElement('div');d.textContent=(x.nome||'Alguém')+' puxou '+brl(x.valor)+' para '+(x.lado==='a'?D.a.nome:D.b.nome);u.appendChild(d)});
}
function teste(){try{const j=JSON.parse(localStorage.getItem(KT)||'{}');return{a:+j.a||0,b:+j.b||0,u:j.u||[]}}catch(e){return{a:0,b:0,u:[]}}}
async function ler(){
 let r=null;
 try{if(window.MH_API&&MH_API.on())r=await MH_API.req('/duelo?id='+encodeURIComponent(ATIVO))}catch(e){}
 if(r&&r.ok&&r.j&&r.j.ok){live=true;A=+r.j.a||0;B=+r.j.b||0;pinta(r.j.ultimas);try{window.MH_APOIO&&MH_APOIO.puxadas&&MH_APOIO.puxadas(r.j.letreiro||[])}catch(e){}}
 else{live=false;const t=teste();A=t.a;B=t.b;pinta(t.u)}
}
function msg(t){$('tgMsg').textContent=t||''}
function votar(lado){
 if(busy)return;
 const v=Math.floor(Number($('tgOutro').value)||valor);
 if(!(v>=1&&v<=500)){msg('Escolha um valor entre R$ 1 e R$ 500.');return}
 const n=nome()||'Visitante';
 if(!live){
  const t=teste();t[lado]+=v;t.u.unshift({nome:n,lado,valor:v});t.u=t.u.slice(0,10);
  try{localStorage.setItem(KT,JSON.stringify(t))}catch(e){}
  A=t.a;B=t.b;pinta(t.u);msg('Teste: puxada de '+brl(v)+' registrada neste aparelho, sem cobrança.');
  try{MH_SOM&&MH_SOM.tocar('level')}catch(e){}return}
 if(typeof window.MH_abrirPix!=='function'){msg('O Pix não está disponível agora.');return}
 const lnome=lado==='a'?D.a.nome:D.b.nome;
 MH_abrirPix({titulo:'Cabo de guerra: '+lnome,valor:v,resumo:'Contribuição ao MiHelp. Cabo de guerra, lado '+lnome+', R$ '+v+(nome()?', de '+nome():''),assunto:'Cabo de guerra MiHelp',
  extra:'Contribuição ao MiHelp. Sem prêmio e sem reembolso. A barra só anda depois que o Pix é confirmado.',
  api:{tipo:'duelo',duelo:ATIVO,lado,nome:n,valor:v}});
 fast=Date.now()+90000;
 try{MH_SOM&&MH_SOM.tocar('level')}catch(e){}
}
document.querySelectorAll('#tgBox .tg-amt button').forEach(b=>b.addEventListener('click',()=>{
 valor=+b.dataset.v;$('tgOutro').value='';
 document.querySelectorAll('#tgBox .tg-amt button').forEach(x=>x.classList.toggle('on',x===b))}));
$('tgOutro').addEventListener('input',()=>{if($('tgOutro').value)document.querySelectorAll('#tgBox .tg-amt button').forEach(x=>x.classList.remove('on'))});
$('tgGoA').addEventListener('click',()=>votar('a'));
$('tgGoB').addEventListener('click',()=>votar('b'));
const dp=$('dpix');if(dp)dp.addEventListener('close',()=>{fast=Date.now()+90000;setTimeout(ler,1500)});
ler();
let tk=0;
setInterval(()=>{if(document.hidden)return;if(Date.now()<fast||++tk%4===0)ler()},5000);
/* reenvia a foto local se o servidor não tem nenhuma (no máximo 3 tentativas) */
let rt=0;
setInterval(()=>{try{
 if(rt>=3||!window.MH_DB||!MH_DB.ok||!window.MH_FOTOS_LIDAS||!MH_DB.foto)return;
 const n=nome();if(!n)return;
 const loc=localStorage.getItem('mh_foto:'+n.toLowerCase());
 const rem=(window.MH_FOTO_PUB||{})[n];
 if(loc&&!rem){rt++;MH_DB.foto(loc).then(ok=>{if(ok)(window.MH_FOTO_PUB=window.MH_FOTO_PUB||{})[n]=loc})}
}catch(e){}},15000);
})()}catch(e){console.error('MiHelp (duelo):',e)}

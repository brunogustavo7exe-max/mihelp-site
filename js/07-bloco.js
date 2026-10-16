
// MiHelp: JavaScript da página. Se algo falhar, o erro aparece no Console (F12) com o nome MiHelp.
(function(){
// Troque para false quando cadastro, chat e anúncios estiverem ligados ao Wix
const PREVIA = !(window.MH_CFG&&window.MH_CFG.clientId);
// Mostra anúncios de exemplo para você ver o visual. Troque para false antes de abrir para o público
const EXEMPLOS = PREVIA;
window.MH_TITULOS=(function(){try{return JSON.parse(localStorage.getItem('mihelp_adm_v1:titulos'))||{}}catch(e){return {}}})();
// ====== Pix, apoio e letreiro de apoiadores ======
// Para trocar a chave Pix, o nome ou o e-mail de contato, mude só as linhas abaixo.
const PIX={chave:'mihelpmarketing@gmail.com',nome:'MIHELP',cidade:'BARRA DO GARCAS',contato:'mihelpmarketing@gmail.com'};window.MH_PIX=PIX;
// Lista do letreiro de apoiadores. Para adicionar alguém que pediu para aparecer, coloque uma linha assim:
// {nome:'Maria', valor:20, mostrarValor:true},
const APOIADORES=[];const PUXADAS=[];
const tlv=(id,v)=>id+String(v.length).padStart(2,'0')+v;
function crc16(s){let c=0xFFFF;for(let i=0;s.length>i;i++){c^=s.charCodeAt(i)*256;for(let k=0;8>k;k++){c=(c&0x8000)?(((c*2)^0x1021)&0xFFFF):((c*2)&0xFFFF)}}return c.toString(16).toUpperCase().padStart(4,'0')}
function pixPayload(valor){
const conta=tlv('00','br.gov.bcb.pix')+tlv('01',PIX.chave);
let p=tlv('00','01')+tlv('01','11')+tlv('26',conta)+tlv('52','0000')+tlv('53','986');
if(valor)p+=tlv('54',valor.toFixed(2));
p+=tlv('58','BR')+tlv('59',PIX.nome)+tlv('60',PIX.cidade)+tlv('62',tlv('05','***'))+'6304';
return p+crc16(p)}
async function copiar(texto,btn){
try{await navigator.clipboard.writeText(texto)}catch(e){const t=document.createElement('textarea');t.value=texto;document.body.append(t);t.select();try{document.execCommand('copy')}catch(x){}t.remove()}
if(btn){const o=btn.textContent;btn.textContent='Copiado!';setTimeout(()=>{btn.textContent=o},1600)}}
function abrirPix(o){
const g=id=>document.getElementById(id),d=g('dpix');
g('dpt').textContent=o.titulo;
g('dpv').textContent='R$ '+o.valor.toFixed(2).replace('.',',');
g('dpc').value=pixPayload(o.valor);
g('dpk').textContent=PIX.chave;{const q=g('dpq');if(q){if(PIX.qr){q.src=PIX.qr;q.hidden=false}else q.hidden=true}}
g('dpce').textContent=PIX.contato;
g('dpr').value=o.resumo;
g('dpe').textContent=o.extra||'';g('dpe').hidden=!o.extra;
const mail='mailto:'+PIX.contato+'?subject='+encodeURIComponent(o.assunto)+'&body='+encodeURIComponent(o.resumo+'\n\n(anexe o comprovante do Pix)');g('dpm').onclick=()=>{window.location.href=mail};
const pp=g('dpp');pp.hidden=!o.previa||!PREVIA;pp.onclick=()=>{o.previa();d.close()};
d.classList.remove('pix-auto','pix-falha');g('dps').hidden=true;pararPoll();
d.showModal();
if(o.api&&window.MH_API&&MH_API.on())pixAuto(o,d,g)}
let pixPoll=null;
function pararPoll(){if(pixPoll){clearInterval(pixPoll);pixPoll=null}}
/* Pix pelo worker: gera o código/QR do Mercado Pago e confere o pagamento sozinho; se falhar, cai no jeito manual */
async function pixAuto(o,d,g){
const A=window.MH_API,s=g('dps');
s.hidden=false;s.textContent='Gerando o Pix...';d.classList.add('pix-auto');
const r=await A.req('/pix',{body:o.api,ms:20000});
if(!(r.ok&&r.j&&r.j.copiaecola)){d.classList.add('pix-falha');s.textContent='Não consegui gerar o Pix agora. Feche esta janela e tente de novo em alguns minutos.';return}
g('dpc').value=r.j.copiaecola;
{const q=g('dpq');if(r.j.qrBase64){q.src='data:image/png;base64,'+r.j.qrBase64;q.hidden=false}}
g('dpv').textContent='R$ '+Number(r.j.valor).toFixed(2).replace('.',',');
s.textContent='Aguardando o pagamento. Quando o Pix cair, esta tela confirma sozinha.';
const id=r.j.id,t0=Date.now();pararPoll();
pixPoll=setInterval(async()=>{if(!d.open||Date.now()-t0>30*60000){pararPoll();return}
const x=await A.req('/pix/status?id='+encodeURIComponent(id));
if(x.ok&&x.j&&x.j.status==='approved'){pararPoll();s.textContent='Pagamento confirmado! Obrigado. Em instantes aparece no site.'}
else if(x.ok&&x.j&&/^(rejected|cancelled|expired)$/.test(x.j.status)){pararPoll();s.textContent='O Pix não foi concluído. Feche e tente de novo.'}},4000)}
let modoAp='apoio';
function abrirApoio(modo){
modoAp=modo;const pat=modo==='patrocinio',g=id=>document.getElementById(id);
g('dapf').reset();
g('dapt').textContent=pat?'Quero patrocinar':'Quero apoiar';
g('dapi').textContent=pat?'Patrocinadores aparecem no mural do site, com nome e logo. Digite o valor do patrocínio.':'Seu apoio ajuda a pagar as próximas etapas do desenvolvimento. Apoio não é investimento e não dá participação na empresa.';
g('dap').showModal()}
function construirTicker(){
const w=document.getElementById('tki');if(!w)return;
let lista=APOIADORES;
if(!lista.length&&EXEMPLOS)lista=[{nome:'Maria (exemplo)',valor:20,mostrarValor:true},{nome:'Empresa Exemplo',valor:100,mostrarValor:true},{nome:'João (exemplo)',valor:10,mostrarValor:false},{nome:'Apoiador Exemplo',valor:50,mostrarValor:true}];
const mk=()=>{const s=document.createElement('span');s.className='tkg';
lista.forEach(a=>{const i=document.createElement('span');i.className='tkx';const up=document.createElement('b');up.textContent='● ';i.append(up,document.createTextNode(a.nome.toUpperCase()));
const v=Number(a.valor);if(a.mostrarValor&&v>0){const em=document.createElement('em');em.textContent=' R$ '+v.toFixed(2).replace('.',',');i.append(em)}
s.append(i)});
PUXADAS.forEach(x=>{const i=document.createElement('span');i.className='tkx';const up=document.createElement('b');up.textContent='● ';const v=Number(x.valor)||0;i.append(up,document.createTextNode(String(x.nome||'Alguém').toUpperCase()+' pagou R$ '+(Number.isInteger(v)?v:v.toFixed(2).replace('.',','))+' para '+(x.lnome||'')));s.append(i)});
const c=document.createElement('span');c.className='tkx';c.textContent='Seja o primeiro apoiador do MiHelp. Clique em Empresas e apoio.';if(!lista.length&&!PUXADAS.length)s.append(c);return s};
w.textContent='';
let a=mk();w.append(a);
let n=1;while(a.offsetWidth>0&&a.offsetWidth<1400&&n<12){a.append(...mk().childNodes);n++}
const b=a.cloneNode(true);b.setAttribute('aria-hidden','true');w.append(b);
w.style.animationDuration=(a.offsetWidth>0?Math.max(8,Math.round(a.offsetWidth/90)):40)+'s'}
let _apSig='',_pxSig='';window.MH_APOIO={set:l=>{const sg=JSON.stringify(l);if(sg===_apSig)return;_apSig=sg;APOIADORES.length=0;l.forEach(x=>APOIADORES.push(x));construirTicker()},puxadas:l=>{const sg=JSON.stringify(l);if(sg===_pxSig)return;_pxSig=sg;PUXADAS.length=0;(l||[]).forEach(x=>PUXADAS.push(x));construirTicker()}};
function iniciarPix(){window.MH_abrirPix=abrirPix;
const g=id=>document.getElementById(id);
g('dcopc').onclick=e=>copiar(g('dpc').value,e.currentTarget);
g('dcopk').onclick=e=>copiar(PIX.chave,e.currentTarget);
g('dcopr').onclick=e=>copiar(g('dpr').value,e.currentTarget);
g('dpx').onclick=()=>g('dpix').close();
g('dpix').addEventListener('close',pararPoll);
g('dapx').onclick=()=>g('dap').close();
document.querySelectorAll('[data-apoio]').forEach(b=>b.addEventListener('click',()=>abrirApoio(b.dataset.apoio)));
g('dapf').addEventListener('submit',e=>{e.preventDefault();
const nome=g('apn').value.trim(),valor=Number(g('apv').value),noLet=g('apl').checked,mostra=g('apm').checked;
if(!nome||!(valor>=1))return;
const pat=modoAp==='patrocinio';g('dap').close();
try{if(window.MH_DB&&MH_DB.ok)MH_DB.pedido({tipo:pat?'patrocinio':'apoio',nome,valor,mostrarValor:mostra,noLetreiro:noLet}).then(()=>{const m=g('vgmsg');if(m)m.textContent='Pedido de '+(pat?'patrocínio':'apoio')+' registrado. Ele entra no letreiro depois que o Pix for confirmado.'}).catch(()=>{})}catch(x){}
abrirPix({titulo:pat?'Patrocínio':'Apoio ao MiHelp',valor,
resumo:(pat?'PATROCÍNIO':'APOIO')+' MIHELP\nNome: '+nome+'\nValor: R$ '+valor.toFixed(2).replace('.',',')+'\nAparecer no letreiro: '+(noLet?'sim':'não')+'\nMostrar o valor: '+(mostra?'sim':'não'),
assunto:(pat?'Patrocínio':'Apoio')+' MiHelp — '+nome,
extra:pat?'Anexe o logo da empresa no e-mail.':'',
api:pat?null:{tipo:'apoio',nome,valor,mostrarValor:mostra,noLetreiro:noLet},
previa:noLet?()=>{APOIADORES.push({nome,valor,mostrarValor:mostra});construirTicker()}:null})});
construirTicker()}

try{
const $=id=>document.getElementById(id);
// Participantes simulados (bots) para o protótipo. Troque para false para desligar.
let BOTS=(function(){try{const v=localStorage.getItem('mh_bots');if(v==='0')return false;if(v==='1')return true}catch(e){}return (window.MH_CFG||{}).bots!==false})();
document.addEventListener('click',function(e){
const b=e.target.closest&&e.target.closest('button[type=submit]');if(!b||!b.form)return;
const f=b.form;if(f.id==='f'||f.noValidate)return;
e.preventDefault();
if(!f.checkValidity()){try{f.reportValidity()}catch(x){const inv=f.querySelector(':invalid');if(inv)inv.focus()}return}
f.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}))},true);
(function(){const t=document.getElementById('topLetreiros');if(!t)return;const set=()=>document.documentElement.style.setProperty('--sticky-h',t.offsetHeight+'px');set();window.addEventListener('resize',set);if(window.ResizeObserver)new ResizeObserver(set).observe(t)})();
let eu=null,ativa='sala',respA=null;const bloqueados=new Set();
const painel={sala:$('log')};
/* ===== estado das conversas privadas e SOS privado ===== */
const PV={};function pvReg(n,sou,q){const e=PV[n]||(PV[n]={meu:0,dele:0});if(sou){if(q>e.meu)e.meu=q}else if(q>e.dele)e.dele=q;try{atualizaPsos()}catch(x){}}
const MAX_SOSPV=3,ESPERA_PV=2*60000,MARCA_PV='\u2063';
function lerSosPv(c){try{const o=JSON.parse(localStorage.getItem('mh_sospv2')||'{}');return(eu&&c&&o[eu.nome.toLowerCase()]&&o[eu.nome.toLowerCase()][c])||0}catch(e){return 0}}
function gravarSosPv(c,n){try{if(!eu||!c)return;const o=JSON.parse(localStorage.getItem('mh_sospv2')||'{}'),k=eu.nome.toLowerCase();(o[k]||(o[k]={}))[c]=n;localStorage.setItem('mh_sospv2',JSON.stringify(o))}catch(x){}}
function sosPvEstado(c){
 if(!eu||!c||c==='sala'||c.indexOf('r:')===0||por(c))return{ok:false,motivo:'O SOS privado só vale numa conversa privada com uma pessoa de verdade.'};
 const e=PV[c];
 if(!e||!e.meu)return{ok:false,motivo:'O SOS privado só libera depois que a conversa começa. Mande uma mensagem primeiro.'};
 if(e.dele>e.meu)return{ok:false,motivo:'A pessoa já respondeu depois da sua última mensagem.'};
 const falta=ESPERA_PV-(Date.now()-e.meu);if(falta>0)return{ok:false,motivo:'Espere uns '+Math.ceil(falta/60000)+' min sem resposta para chamar com o SOS privado.'};
 if(lerSosPv(c)>=MAX_SOSPV)return{ok:false,motivo:'Você já usou os '+MAX_SOSPV+' SOS privados desta conversa.'};
 return{ok:true}}
function atualizaPsos(){const b=$('psos');if(!b)return;const n=lerSosPv(ativa),st=sosPvEstado(ativa);b.textContent='🆘 SOS privado '+Math.max(0,MAX_SOSPV-n)+'/'+MAX_SOSPV;b.classList.toggle('off',!st.ok);b.title=st.ok?'Chama a atenção de quem ainda não respondeu. Restam '+(MAX_SOSPV-n)+' nesta conversa.':st.motivo}
setInterval(()=>{try{atualizaPsos()}catch(x){}},20000);
$('psos').addEventListener('click',()=>{const c=ativa,st=sosPvEstado(c);if(!st.ok){nota(painel[c]||painel.sala,'*** '+st.motivo+' ***');return}
 if(!confirm('Enviar SOS privado para '+c+'? É só para quando a pessoa demora a responder. Restam '+(MAX_SOSPV-lerSosPv(c))+' nesta conversa.'))return;
 gravarSosPv(c,lerSosPv(c)+1);
 $('m').value=MARCA_PV+'🆘 SOS privado: '+eu.nome+' está esperando sua resposta.';$('sf').requestSubmit();
 nota(painel[c],'*** SOS privado enviado a '+c+'. Restam '+(MAX_SOSPV-lerSosPv(c))+' nesta conversa. ***');try{atualizaPsos()}catch(x){}});
/* favoritos: lista de cada conta, guardada só neste aparelho */
const favK=()=>'mh_fav:'+(eu?eu.nome.toLowerCase():'');
const favs=()=>{try{return JSON.parse(localStorage.getItem(favK())||'[]')||[]}catch(e){return []}};
const ehFav=n=>!!eu&&favs().indexOf(n)>=0;
function togFav(n){if(!eu||n===eu.nome)return false;const l=favs(),i=l.indexOf(n);if(i>=0)l.splice(i,1);else l.push(n);
 try{localStorage.setItem(favK(),JSON.stringify(l.slice(-100)))}catch(e){}
 try{desenharOnline();renderMeuPerfil()}catch(e){}
 return i<0}
const PESSOAS=[
{nome:'Ana C.',role:'cliente',bot:true},
{nome:'Marcos P.',role:'cliente',bot:true},
{nome:'Seu Zé',role:'helper',work:'Pintura',bot:true},
{nome:'Duda L.',role:'helper',work:'DJ',bot:true},
{nome:'Carla M.',role:'helper',work:'Elétrica',bot:true},
{nome:'Rui T.',role:'helper',work:'Ar-condicionado',bot:true,status:'ocupado'},
{nome:'Toninho',role:'helper',work:'Encanador',bot:true,status:'ocupado'},
{nome:'Nando G.',role:'helper',work:'Gás de cozinha',bot:true},
{nome:'Beto C.',role:'helper',work:'Chaveiro',bot:true},
{nome:'Jota B.',role:'helper',work:'Borracheiro',bot:true},
{nome:'Sr. Paulo',role:'cliente',bot:true,oculto:true,missao:'Repositor para trabalho temporário'},
{nome:'Dona Lúcia',role:'cliente',bot:true,oculto:true,missao:'Gato desaparecido'},
{nome:'Bia S.',role:'cliente',bot:true,oculto:true,missao:'Ajuda com mudança de móveis'},
{nome:'Tiago R.',role:'cliente',bot:true,oculto:true,missao:'Chave perdida perto da praça'}];
const por=n=>PESSOAS.find(p=>p.nome===n);
const REAIS={};
const visiveis=()=>(BOTS?PESSOAS.filter(p=>!p.oculto&&!bloqueados.has(p.nome)):[]).concat(Object.values(REAIS).filter(p=>p.visto&&Date.now()-p.visto<7200000&&!bloqueados.has(p.nome)&&!(eu&&p.nome===eu.nome)));
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const depois=(ms,f)=>setTimeout(f,ms);
function nomeCurto(t){const p=t.replace(/[^A-Za-zÀ-ÿ ]/g,' ').trim().split(/\s+/).filter(Boolean);if(!p.length)return '';const cap=x=>x.charAt(0).toUpperCase()+x.slice(1).toLowerCase();return p.length>1?cap(p[0])+' '+p[1].charAt(0).toUpperCase()+'.':cap(p[0])}
function trabCurto(t){const x=t.replace(/[^A-Za-zÀ-ÿ ,\-]/g,' ').replace(/\s*,\s*/g,', ').replace(/(,\s*){2,}/g,', ').replace(/\s+/g,' ').replace(/^[,\s]+|[,\s]+$/g,'').slice(0,60);return x?x.charAt(0).toUpperCase()+x.slice(1):''}
function rolar(el){el.scrollTop=el.scrollHeight}
function nota(pane,t){const p=document.createElement('p');p.className='s';p.textContent=t;pane.append(p);rolar(pane)}
function papelTxt(p){return p.adm?(p.role==='helper'?'Administrador · Helper · '+p.work:'Administrador'):(p.role==='helper'?'Helper · '+p.work:'Cliente')}
function etiqueta(pes){const f=document.createDocumentFragment();
if(pes.adm){const s=document.createElement('span');s.className='tag adm';s.textContent='ADM';f.append(s)}
if(pes.role==='helper'){const s=document.createElement('span');s.className='tag h';s.textContent=pes.work;f.append(s)}
if(pes.role==='helper'&&window.MH_FUND&&window.MH_FUND.has(pes.nome)){const s=document.createElement('span');s.className='tag f';s.textContent='🏅 Fundador';f.append(s)}
if(pes.bot){const s=document.createElement('span');s.className='tag b';s.textContent='bot';f.append(s)}
const tt=(window.MH_TITULOS||{})[pes.nome];if(tt&&!(pes.adm&&tt==='ADM')){const s=document.createElement('span');s.className='tag t';s.textContent=tt;f.append(s)}
return f}
const RX_NUM=/(?:\d[\s.\-()]*){8,}/g;
const temNumero=t=>{RX_NUM.lastIndex=0;return RX_NUM.test(String(t))};
function linha(pane,pes,texto,resp,quando,mid){let sp=false;if(String(texto).charCodeAt(0)===0x2063){sp=true;texto=String(texto).slice(1)}if(!pes.adm)texto=String(texto).replace(RX_NUM,'[número oculto] ');const meu=eu&&pes===eu;const p=document.createElement('p');p.dataset.de=pes.nome;if(mid)p.dataset.mid=mid;
p.className=pes.adm?'m-adm':meu?'m-meu':pes.role==='helper'?'m-helper':'m-outro';if(sp)p.classList.add('sospv');
if(resp){const q=document.createElement('span');q.className='cit';q.textContent='↪ '+resp.nome+': '+resp.texto;p.append(q)}
const n=document.createElement('button');n.className='n nm'+(pes.role==='helper'?' hp':'');n.textContent=pes.nome;
n.type='button';n.dataset.u=pes.nome;n.title='Ver perfil de '+pes.nome;
p.append(n,etiqueta(pes),document.createTextNode(': '+texto));
const hr=document.createElement('span');hr.className='hr';hr.textContent=new Date(quando||Date.now()).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});p.append(hr);
const dx=document.createElement('button');dx.type='button';dx.className='adm-x';dx.textContent='apagar';dx.setAttribute('aria-label','Apagar mensagem (admin)');p.append(dx);
const para=!meu&&eu&&((resp&&resp.nome===eu.nome)||texto.toLowerCase().includes(eu.nome.toLowerCase()));
if(para){p.classList.add('para-mim');const tg=document.createElement('span');tg.className='tg';tg.textContent='para você';p.append(tg);
if(pane===painel.sala&&ativa!=='sala'){const t=document.querySelector('#ctabs .ctsala');if(t)t.textContent='Geral ●'}}
if(!meu){const r=document.createElement('button');r.type='button';r.className='rp';r.textContent='Responder';r.dataset.rp=pes.nome;r.dataset.tx=texto.slice(0,60);r.setAttribute('aria-label','Responder '+pes.nome);p.append(r);if(eu&&!pes.bot){const d=document.createElement('button');d.type='button';d.className='dn';d.textContent='Denunciar';d.setAttribute('aria-label','Denunciar '+pes.nome);d.onclick=()=>{if(!d.dataset.c){d.dataset.c='1';d.textContent='Toque de novo';setTimeout(()=>{delete d.dataset.c;d.textContent='Denunciar'},3500);return}d.disabled=true;d.textContent='Denúncia enviada';try{if(window.MH_denuncia)window.MH_denuncia(pes.nome)}catch(e){}};p.append(d)}}
try{balao(pane,pes,texto,quando)}catch(e){}
pane.append(p);
while(pane.children.length>80)pane.firstChild.remove();rolar(pane);return p}
/* ===== salão visual: quem está na sala aparece como bonequinho; quando fala, sai um balão em cima da cabeça ===== */
const SAL={fig:new Map(),bal:new Set(),tm:{}},SAL_MAX=24;
const salaPublica=()=>ativa==='sala'||String(ativa).indexOf('r:')===0;
function montarSalao(){
  if($('salao')||!$('log'))return;
  const box=document.createElement('div');box.className='salao';box.id='salao';
  const top=document.createElement('div');top.className='sl-top';
  const t=document.createElement('span');t.className='sl-t';
  const tg=document.createElement('button');tg.type='button';tg.className='sl-tg';tg.setAttribute('aria-controls','slGrid');
  const grid=document.createElement('div');grid.className='sl-grid';grid.id='slGrid';
  const acts=document.createElement('div');acts.className='sl-acts';
  const bs=document.createElement('button');bs.type='button';bs.className='sl-tg';bs.textContent='🔎 Buscar';bs.setAttribute('aria-expanded','false');
  acts.append(bs,tg);top.append(t,acts);box.append(top,grid);
  const who=document.querySelector('#cw .who');if(who)box.append(who);
  $('log').before(box);
  {const rb=document.createElement('button');rb.type='button';rb.className='rr-i';rb.textContent='ℹ';rb.title='Regra desta sala';rb.setAttribute('aria-label','Ver a regra desta sala');
   rb.onclick=()=>{const r=$('rrule');if(r)r.classList.toggle('open')};
   const rd=$('rooms').querySelector('.rdd');if(rd)rd.after(rb);else $('rooms').append(rb)}
  const set=(min,salvar)=>{box.classList.toggle('min',min);tg.textContent=min?'Mostrar ▸':'Minimizar ▾';tg.setAttribute('aria-expanded',String(!min));if(salvar){try{localStorage.setItem('mh_salao_min',min?'1':'0')}catch(e){}}};
  let ini=false;try{ini=localStorage.getItem('mh_salao_min')==='1'}catch(e){}
  set(ini,false);tg.onclick=()=>set(!box.classList.contains('min'),true);
  bs.onclick=()=>{if(box.classList.contains('min'))set(false,true);if(who){const o=who.classList.toggle('open');bs.setAttribute('aria-expanded',String(o));bs.textContent=o?'🔎 Fechar busca':'🔎 Buscar'}};
  desenharSalao();
}
function desenharSalao(){
  const box=$('salao');if(!box)return;box.hidden=!salaPublica();if(box.hidden)return;
  const grid=$('slGrid'),pes=visiveis().slice();if(eu)pes.push(eu);
  SAL.bal.forEach(n=>{if(!pes.some(p=>p.nome===n)){const q=pessoa(n);if(q)pes.push(q)}});
  const vivos=new Set(pes.map(p=>p.nome));
  SAL.fig.forEach((f,n)=>{if(!vivos.has(n)){f.remove();SAL.fig.delete(n)}});
  pes.slice(0,SAL_MAX).forEach(p=>{let f=SAL.fig.get(p.nome);const foto=FOTO[p.nome]||'';
    if(!f||f.dataset.foto!==foto||f.dataset.hp!==String(p.role==='helper')){
      if(f)f.remove();
      f=document.createElement('button');f.type='button';f.className='sl-p'+(p.role==='helper'?' hp':'');f.dataset.foto=foto;f.dataset.hp=String(p.role==='helper');
      f.title=p.nome+' · '+papelTxt(p);f.setAttribute('aria-label','Ver perfil de '+p.nome);
      const b=document.createElement('span');b.className='sl-b';b.hidden=true;
      const n=document.createElement('span');n.className='sl-n';n.textContent=p.nome;
      f.append(b,avatarEl(p.nome,44),n);f.onclick=()=>{try{MH_UI.perfil(p.nome)}catch(e){}};SAL.fig.set(p.nome,f)}
    grid.append(f)});
  box.querySelector('.sl-t').textContent='🏠 Salão · '+pes.length+(pes.length===1?' pessoa':' pessoas')+(pes.length>SAL_MAX?' (mostrando '+SAL_MAX+')':'')}
function balao(pane,pes,texto,quando){
  if(window._semBalao||!pes||!salaPublica()||pane!==painel[ativa])return;
  if(quando&&Date.now()-quando>8000)return;
  const tx=String(texto||'').trim();if(!tx)return;
  const n=pes.nome;SAL.bal.add(n);desenharSalao();
  const f=SAL.fig.get(n);if(!f)return;
  const b=f.querySelector('.sl-b');b.textContent=tx.length>70?tx.slice(0,67)+'…':tx;b.hidden=false;
  clearTimeout(SAL.tm[n]);SAL.tm[n]=setTimeout(()=>{b.hidden=true;SAL.bal.delete(n);desenharSalao()},6000)}
function salaMudou(){SAL.bal.clear();for(const n in SAL.tm)clearTimeout(SAL.tm[n]);SAL.fig.forEach(f=>{const b=f.querySelector('.sl-b');if(b)b.hidden=true});desenharSalao()}
setTimeout(montarSalao,0);
let lf={aba:'helper',of:'Todos',q:''};
function desenharOnline(foco){try{desenharSalao()}catch(e){}const w=$('wholist');w.textContent='';
const todos=visiveis().slice();if(eu)todos.push(eu);
const H=todos.filter(p=>p.role==='helper'),C=todos.filter(p=>p.role!=='helper');
const tb=document.createElement('div');tb.className='wtabs';
[['helper','Helpers',H.length],['cliente','Clientes',C.length]].concat(eu?[['fav','★',favs().length]]:[]).forEach(([k,t,n])=>{const b=document.createElement('button');b.type='button';b.textContent=t+' ('+n+')';if(k==='fav')b.setAttribute('aria-label','Favoritos, '+n);b.className=lf.aba===k?'on':'';b.onclick=()=>{lf.aba=k;lf.of='Todos';lf.q='';desenharOnline()};tb.append(b)});w.append(tb);
let lista=lf.aba==='helper'?H:lf.aba==='fav'?todos.filter(p=>p!==eu&&ehFav(p.nome)):C;const ofs=[...new Set(H.map(p=>p.work))];
if(lf.aba==='helper'&&ofs.length>=2){const se=document.createElement('select');se.setAttribute('aria-label','Filtrar por ofício');['Todos'].concat(ofs).forEach(o=>{const op=document.createElement('option');op.textContent=o;op.selected=o===lf.of;se.append(op)});se.onchange=()=>{lf.of=se.value;desenharOnline()};w.append(se);if(lf.of!=='Todos')lista=lista.filter(p=>p.work===lf.of)}
if(todos.length>15){const q=document.createElement('input');q.type='text';q.placeholder='Buscar nome ou ofício';q.setAttribute('aria-label','Buscar pessoa');q.value=lf.q;q.oninput=()=>{lf.q=q.value;desenharOnline(true)};w.append(q);
if(lf.q){const t=lf.q.toLowerCase();lista=lista.filter(p=>(p.nome+' '+(p.work||'')).toLowerCase().includes(t))}if(foco)setTimeout(()=>{q.focus();q.setSelectionRange(q.value.length,q.value.length)})}
const wl=document.createElement('div');wl.className='wl';
const item=(pes)=>{const voce=eu&&pes===eu,d=document.createElement('div'),dot=document.createElement('span'),col=document.createElement('span'),sm=document.createElement('small');
const stt=pes.status||'disponivel';dot.className='dot d-st-'+stt;col.className='wh';
const nm=document.createElement('button');nm.type='button';nm.className='nm'+(pes.role==='helper'?' hp':'');nm.dataset.u=pes.nome;nm.textContent=(!voce&&ehFav(pes.nome)?'★ ':'')+pes.nome+(voce?' (você)':'');nm.title='Ver perfil de '+pes.nome;
sm.textContent=papelTxt(pes)+(pes.bot?' · bot':'')+(stt==='ocupado'?' · ocupado':'')+(((window.MH_TITULOS||{})[pes.nome])?' · '+window.MH_TITULOS[pes.nome]:'');
col.append(nm,sm);d.append(dot,col);wl.append(d)};
lista.forEach(item);
if(lf.aba==='fav')favs().filter(n=>!todos.some(p=>p.nome===n)).forEach(n=>{const d=document.createElement('div'),c=document.createElement('span'),s1=document.createElement('span'),s2=document.createElement('small'),x=document.createElement('button');
 c.className='wh';s1.textContent='★ '+n;s2.textContent='fora da sala agora';c.append(s1,s2);
 x.type='button';x.className='nm';x.textContent='×';x.setAttribute('aria-label','Tirar '+n+' dos favoritos');x.onclick=()=>togFav(n);d.append(c,x);wl.append(d)});
if(!lista.length&&!(lf.aba==='fav'&&favs().length)){const m=document.createElement('small');m.textContent=lf.aba==='fav'?'Nenhum favorito ainda':'Ninguém por enquanto';wl.append(m)}
w.append(wl);const tg=$('whoTg');if(tg)tg.textContent='Online ('+todos.length+') '+(tg.getAttribute('aria-expanded')==='true'?'▴':'▾')}
function mostrarResp(){const b=$('rpBar');if(!b)return;if(!respA){b.hidden=true;return}$('rpTxt').textContent='Respondendo a '+respA.nome+': “'+respA.texto+'”';b.hidden=false}
function mostrar(c){ativa=c;respA=null;mostrarResp();try{salaMudou()}catch(e){}if(c==='sala'){const t=document.querySelector('#ctabs .ctsala');if(t)t.textContent='Geral'}for(const k in painel)painel[k].hidden=(k!==c);
document.querySelectorAll('#ctabs .ctw,#ctabs .ctsala').forEach(e=>e.classList.toggle('on',(e.dataset.c||'sala')===c));
$('ptools').hidden=(c==='sala'||c.startsWith('r:'));{const pf=$('pfav');if(pf)pf.textContent=ehFav(c)?'★ Nos favoritos':'☆ Favoritar'}
document.querySelectorAll('#rooms button[data-r]').forEach(b=>b.classList.toggle('on',b.dataset.r===c));{const rs=$('roomSel');if(rs&&SALAS.some(x=>x[0]===c)){rs.value=c;if(window.MH_roomSync)window.MH_roomSync()}}
const sr=SALAS.find(x=>x[0]===c),rr2=$('rrule');rr2.hidden=!sr;if(sr){rr2.textContent='ℹ  Regra: '+sr[2];rr2.classList.remove('open');rr2.title='Toque para ver a regra inteira';rr2.setAttribute('role','button');rr2.tabIndex=0}
$('m').placeholder=eu?(c==='sala'||c.startsWith('r:')?'Digite aqui':'Mensagem privada'):'Cadastre-se para falar';try{atualizaPsos()}catch(e){}}
function abaDe(nome){return Array.from(document.querySelectorAll('#ctabs .ctw')).find(e=>e.dataset.c===nome)}
function fechar(nome){if(painel[nome]){painel[nome].remove();delete painel[nome]}const a=abaDe(nome);if(a)a.remove();mostrar('sala')}
function abrirPrivado(nome,quieto){
if(!eu){nota(painel.sala,'*** cadastre-se para falar no privado ***');return}
if(nome===eu.nome||bloqueados.has(nome))return;
if(!painel[nome]){const d=document.createElement('div');d.className='log priv';d.hidden=true;d.setAttribute('aria-live','polite');$('sf').before(d);painel[nome]=d;
const w=document.createElement('span');w.className='ctw';w.dataset.c=nome;
const b=document.createElement('button');b.type='button';b.className='ct';b.textContent=nome;b.onclick=()=>mostrar(nome);
const x=document.createElement('button');x.type='button';x.className='ctc';x.textContent='×';x.setAttribute('aria-label','Fechar conversa com '+nome);x.onclick=()=>fechar(nome);
w.append(b,x);$('ctabs').append(w);
nota(d,'*** conversa privada com '+nome+'. As conversas privadas são protegidas e só os dois participantes têm acesso. A equipe só lê em caso de denúncia. ***');
if(por(nome))nota(d,'*** '+nome+' é um bot de demonstração: as respostas são automáticas ***');else if(window.MH_DB&&MH_DB.ok)nota(d,'*** conversa com '+nome+'. Se a pessoa estiver fora da sala, ela vê quando voltar. ***');
nota(d,'Cuidado: nunca envie senhas, códigos ou dados de banco. Para contratar com segurança, feche o serviço pelo app.');if(!por(nome))notaNoti(d)}
conversou.add(nome);if(quieto)return;mostrar(nome);$('m').focus()}
window.MH_missao=function(nome,tit){
  if(!eu)return false;
  abrirPrivado(nome);const pane=painel[nome];
  if(pane&&!pane.dataset.m){pane.dataset.m='1';depois(900,()=>fala(pane,nome,'Oi! Sobre a missão \"'+tit+'\": ainda está aberta. Me conta como você pode ajudar.'))}
  return true};
function liberarChat(){if(typeof liberarChatForcado==='function')liberarChatForcado();else{const m=$('m'),n=$('nudge'),s=$('sbtn');if(m)m.disabled=false;if(n)n.disabled=false;if(s)s.disabled=false;}}
// ---- bots ----
function fala(pane,nome,texto){const b=por(nome);if(!BOTS||!b||bloqueados.has(nome)||!pane.isConnected)return;linha(pane,b,texto)}
const CONVERSAS=[
[['Ana C.','preciso de um eletricista para trocar o quadro de luz, alguém indica?'],['Carla M.','Trabalho com elétrica aqui em Barra. Me chama no privado que a gente combina.'],['Ana C.','Vou chamar, obrigada!']],
[['Marcos P.','alguém pinta apartamento de 2 quartos? Quero um orçamento'],['Seu Zé','Pinto sim. Manda uma foto das paredes pra eu ver o estado.'],['Marcos P.','Mando já, valeu seu Zé']],
[['Duda L.','sábado estou livre para festa, alguém precisa de DJ?'],['Ana C.','Tenho um aniversário no fim do mês, quanto fica?'],['Duda L.','Depende das horas. Me chama no privado que eu explico.']],
[['Rui T.','antes do calor apertar, vale limpar o ar-condicionado'],['Marcos P.','o meu está pingando, será que é grave?'],['Rui T.','Costuma ser o dreno entupido. É rápido de resolver.']],
[['Ana C.','alguém indica um bom eletricista?'],['Seu Zé','Tem o João, trabalha bem e é rápido.'],['Carla M.','Já fiz meu cadastro de Helper, bora!']],
[['Marcos P.','como funciona o pagamento no app?'],['Carla M.','Cada Helper define o preço e a taxa aparece antes de fechar o serviço.'],['Marcos P.','Entendi, valeu']]];
let ocupado=false,ult=-1;
function conversa(){if(!BOTS||ocupado||document.hidden)return;let i;do{i=Math.floor(Math.random()*CONVERSAS.length)}while(i===ult);ult=i;ocupado=true;let t=0;
CONVERSAS[i].forEach(([n,tx],k)=>{if(k>0)t+=2500+Math.random()*2500;depois(t,()=>fala(painel.sala,n,tx))});depois(t+500,()=>{ocupado=false})}
const MAPA=[[/eletric|elétric|luz|tomada|fiação|fiacao/,'Carla M.'],[/pint|parede|tinta/,'Seu Zé'],[/\bdj\b|festa|aniversári|aniversari|som/,'Duda L.'],[/ar.?condicionado|split|geladeira/,'Rui T.']];
function responder(texto){
if(!BOTS||!eu)return;const t=texto.toLowerCase(),sala=painel.sala,ms=1500+Math.random()*1700;
const quem=(MAPA.find(([re])=>re.test(t))||[])[1];
if(/^(oi|olá|ola|e aí|e ai|bom dia|boa tarde|boa noite|opa)/.test(t)){depois(ms,()=>fala(sala,rnd(['Ana C.','Marcos P.']),eu.nome+', bem-vindo(a) à sala!'));return}
if(/preciso|procuro|alguém|alguem|indica|orçamento|orcamento|quanto/.test(t)){
if(quem)depois(ms,()=>fala(sala,quem,eu.nome+', posso ajudar com isso. Me chama no privado que a gente combina.'));
else depois(ms,()=>fala(sala,rnd(['Seu Zé','Carla M.','Duda L.','Rui T.']),eu.nome+', conta mais: o que você precisa e para quando?'));return}
if(eu.role==='helper'&&(/faço|faco|trabalho|atendo|ofere|disponível|disponivel/.test(t)||t.includes(eu.work.toLowerCase()))){
depois(ms,()=>fala(sala,rnd(['Ana C.','Marcos P.']),eu.nome+', estou precisando de '+eu.work.toLowerCase()+' aqui em Barra. Posso te chamar no privado?'));return}
if(/obrigad|valeu/.test(t)){depois(ms,()=>fala(sala,rnd(['Ana C.','Seu Zé','Carla M.']),eu.nome+', imagina!'));return}
if(Math.random()>0.5)depois(ms,()=>fala(sala,rnd(['Ana C.','Marcos P.','Seu Zé','Duda L.']),rnd(['Boa!','Concordo.','Interessante, conta mais.','Quem sabe alguém aqui indica.'])))}
const contador={};
function respPriv(pane,nome,texto){
const b=por(nome);if(!BOTS||!b||!eu)return;const t=texto.toLowerCase();let r;
if(/telefone|número|numero|whats|zap|pix|cpf|senha|código|codigo|cart/.test(t))r='Sou um bot de demonstração e não tenho telefone nem dados reais. No app de verdade, vocês combinam pelo chat e fecham o serviço pelo MiHelp.';
else{const k=contador[nome]=(contador[nome]||0)+1;let L;
if(b.missao)L=['Oi! Sobre a missão "'+b.missao+'": me conta quando você consegue e como pode ajudar.','Combinado. No app, valor e data ficam registrados antes de confirmar.','Fechado, a gente confirma tudo pelo app quando ele abrir.'];
else if(b.role==='helper'&&eu.role==='cliente')L=['Oi! Me conta o que você precisa e para quando.','Dá para fazer sim. Pode mandar mais detalhes do local e do serviço?','Combinado. No app de verdade, preço e data ficam registrados antes de confirmar.'];
else if(b.role==='cliente'&&eu.role==='helper')L=['Oi! Você atende aqui em Barra?','Quanto você costuma cobrar por esse tipo de serviço?','Fechado. Quando o app abrir, a gente combina por lá.'];
else L=['Oi! Tudo bem?','Também estou por aqui acompanhando a sala.','Combinado, a gente se fala pela sala.'];
r=L[(k-1)%3]}
depois(1500+Math.random()*1500,()=>{if(painel[nome]===pane)linha(pane,b,r)})}

// ---- mini perfil e avaliações ----
const AV={'Ana C.':[['Rui T.',5,'Cliente pontual e educada.']],'Marcos P.':[['Seu Zé',4,'Combinou direitinho.']],
'Seu Zé':[['Ana C.',5,'Pintou a sala rápido e deixou limpo.'],['Marcos P.',4,'Preço justo.']],
'Duda L.':[['Ana C.',5,'Festa animada, voltaria a chamar.']],
'Carla M.':[['Marcos P.',5,'Resolveu a queda de energia no mesmo dia.'],['Ana C.',4,'Explicou tudo antes de começar.']],
'Rui T.':[['Marcos P.',4,'Ar gelando de novo.']]};
const conversou=new Set(),msgsPriv={};
const estr=n=>'★'.repeat(n)+'☆'.repeat(5-n);
/* selinhos: vão dentro do texto da avaliação, entre ¦ ¦, então não precisam de campo novo no banco */
const SELOS=['Pontual','Caprichoso','Educado','Preço justo','Rápido','Confiável'];
function av2(t){t=String(t||'');const m=t.match(/^¦([^¦]*)¦\s*/);if(!m)return{tags:[],txt:t};return{tags:m[1].split(',').map(s=>s.trim()).filter(s=>SELOS.indexOf(s)>=0),txt:t.slice(m[0].length)}}
window.MH_av2=av2;
function selosEl(nome){const c={};(AV[nome]||[]).forEach(x=>av2(x[2]).tags.forEach(s=>{c[s]=(c[s]||0)+1}));const k=Object.keys(c);if(!k.length)return null;
  const d=document.createElement('p');d.style.cssText='display:flex;flex-wrap:wrap;gap:6px;margin:6px 0';
  k.sort((a,b)=>c[b]-c[a]).forEach(s=>{const e=document.createElement('span');e.className='tag h';e.style.margin='0';e.textContent=s+' × '+c[s];d.append(e)});return d}
/* frase do perfil e mural de recados */
const REC={},FRASE={};
function recAdd(alvo,de,texto,quando){const l=REC[alvo]||(REC[alvo]=[]);if(l.some(x=>x[0]===de&&x[1]===texto&&Math.abs(x[2]-quando)<120000))return;l.push([de,texto,quando]);l.sort((a,b)=>a[2]-b[2]);while(l.length>40)l.shift()}
function postarRec(alvo,texto){
  if(!eu||alvo===eu.nome)return 'Você não pode deixar recado no seu próprio mural.';
  texto=String(texto||'').trim().slice(0,100);if(!texto)return 'Escreva o recado.';
  const ag=Date.now();if(ag-(postarRec.t||0)<30000)return 'Espere alguns segundos para mandar outro recado.';
  postarRec.t=ag;recAdd(alvo,eu.nome,texto,ag);
  try{if(window.MH_DB&&MH_DB.ok&&!por(alvo))MH_DB.recado(alvo,eu.nome,texto)}catch(x){}
  return true}
function renderMural(d,pes,meu){
  const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
  d.append(mk('h4',0,'Mural de recados'));
  const box=mk('div');d.append(box);
  const pinta=()=>{box.textContent='';
    const l=(REC[pes.nome]||[]).filter(x=>!bloqueados.has(x[0])).slice(-5).reverse();
    if(!l.length)box.append(mk('p','note',meu?'Ninguém deixou recado ainda.':'Ainda sem recados. Seja o primeiro.'));
    l.forEach(x=>{const b=mk('div','dep');b.append(mk('b',0,x[0]+' · '+new Date(x[2]).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})));
      b.append(document.createElement('br'),document.createTextNode(x[1]));
      if(eu&&x[0]!==eu.nome){const dn=mk('button','more','denunciar');dn.type='button';dn.style.cssText='padding:2px 8px;font-size:11px;margin-left:8px';
        dn.onclick=()=>{try{window.MH_denuncia&&MH_denuncia(x[0])}catch(e){}dn.textContent='denunciado';dn.disabled=true};b.append(dn)}
      box.append(b)})};
  pinta();
  if(eu&&!meu){const f=document.createElement('form');f.style.cssText='display:flex;gap:6px;margin-top:6px';
    const i=document.createElement('input');i.type='text';i.maxLength=100;i.placeholder='Deixe um recado (até 100 letras)';i.setAttribute('aria-label','Recado para '+pes.nome);
    const bt=mk('button','more','Enviar');bt.type='submit';const er=mk('p','note');er.setAttribute('role','status');
    f.append(i,bt);f.addEventListener('submit',e=>{e.preventDefault();const r=postarRec(pes.nome,i.value);if(r===true){i.value='';er.textContent='Recado enviado.';pinta()}else er.textContent=r});
    d.append(f,er)}
  else if(!eu)d.append(mk('p','note','Cadastre-se para deixar recado.'));
  if(pes.bot)d.append(mk('p','note','Perfil de demonstração: recados aqui ficam só nesta tela.'))}
function resumo(nome){const l=AV[nome]||[];if(!l.length)return null;return {m:l.reduce((a,x)=>a+x[1],0)/l.length,n:l.length}}
/* ===== fotos de perfil, selo ✔ Verificado e lista de profissionais ===== */
const FOTO={},VER={},VERT={};
try{const v=JSON.parse(localStorage.getItem('mh_verif')||'{}');for(const k in v){VER[k]=v[k][0];VERT[k]=v[k][1]}}catch(e){}
function salvaVer(){try{const o={};for(const k in VER)o[k]=[VER[k],VERT[k]||0];localStorage.setItem('mh_verif',JSON.stringify(o))}catch(e){}}
const fotoOk=u=>typeof u==='string'&&/^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(u)&&u.length<24000;
const verificado=n=>!!(VER[n]&&FOTO[n]);
let profT=0;
function refreshProf(){clearTimeout(profT);profT=setTimeout(()=>{try{desenharProf()}catch(e){}},250)}
function fotoStatus(ok,pend){const side=document.querySelector('#reg .pf-side');if(!side)return;let p=document.getElementById('fotoSt');if(!p){p=document.createElement('p');p.className='note';p.id='fotoSt';p.setAttribute('role','status');side.appendChild(p)}
 p.textContent=pend?'Salvando a foto…':ok===true?'✔ Foto salva para todos.':ok===false?'A foto ficou só neste aparelho… tento de novo sozinho.':'Foto salva neste aparelho.'}
let salT=0;function refreshSalao(){clearTimeout(salT);salT=setTimeout(()=>{try{desenharSalao()}catch(e){}},200)}
function setFoto(n,t){if(!n)return;if(t&&fotoOk(t))FOTO[n]=t;else if(!t)delete FOTO[n];refreshProf();refreshSalao()}
window.MH_VERIF=function(n,v,quando){n=String(n||'');if(!n)return;if(quando&&quando<(VERT[n]||0))return;VERT[n]=quando||Date.now();if(v)VER[n]=1;else delete VER[n];salvaVer();refreshProf()};
window.MH_FOTOVER={foto:n=>FOTO[n]||'',ver:n=>!!VER[n]};
window.MH_profRefresh=refreshProf;
/* ===== portfólio do helper: até 4 fotos + Instagram + WhatsApp =====
   Guardado na coleção Mensagens (sala 'perfil'), igual à foto e à frase do perfil: tipo 'portfoto' (texto = "posição|foto") e tipo 'contato' (texto = JSON).
   Vale a mais recente de cada posição. Nenhuma coleção nova no CMS e nenhuma mudança no worker. */
const PORT={},CONT={},PORT_N=4;
const portOk=u=>typeof u==='string'&&/^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(u)&&u.length<19000;
const igOk=v=>{v=String(v||'').trim().replace(/^@/,'').replace(/^https?:\/\/(www\.)?instagram\.com\//i,'').replace(/[\/?#].*$/,'');return /^[A-Za-z0-9._]{1,30}$/.test(v)?v:''};
const waOk=v=>{const t=String(v||'').replace(/\D/g,'');return /^\d{10,13}$/.test(t)&&(t.length<12||t.startsWith('55'))?t:''};
function setPort(n,i,u){if(!n||!(i>=0&&i<PORT_N))return;const a=PORT[n]=PORT[n]||new Array(PORT_N).fill('');a[i]=u&&portOk(u)?u:''}
function setContato(n,o){if(!n||!o||typeof o!=='object')return;CONT[n]={ig:igOk(o.ig),wa:waOk(o.wa),mostrar:o.mostrar?1:0}}
function salvarPortLocal(){if(!eu)return;try{localStorage.setItem('mh_port:'+eu.nome.toLowerCase(),JSON.stringify({f:PORT[eu.nome]||[],c:CONT[eu.nome]||null}))}catch(e){}}
function carregarPortLocal(){if(!eu||PORT[eu.nome]||CONT[eu.nome])return;try{const o=JSON.parse(localStorage.getItem('mh_port:'+eu.nome.toLowerCase())||'null');if(o){(o.f||[]).forEach((u,i)=>setPort(eu.nome,i,u));if(o.c)setContato(eu.nome,o.c)}}catch(e){}}
const portTs={};
function carregaPort(nome){const D=window.MH_DB;if(!D||!D.ok||!D.portLer)return Promise.resolve();if(Date.now()-(portTs[nome]||0)<60000)return Promise.resolve();portTs[nome]=Date.now();return D.portLer(nome).catch(()=>{})}
function portRedim(f){return new Promise((ok,err)=>{
 if(!f||!/^image\//.test(f.type))return err(new Error('Escolha uma foto (imagem).'));
 if(f.size>12*1024*1024)return err(new Error('A foto é muito grande.'));
 const u=URL.createObjectURL(f),im=new Image();
 im.onload=()=>{try{let M=420,r='';for(let t=0;t<6;t++){const k=Math.min(1,M/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*k));c.height=Math.max(1,Math.round(im.height*k));const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(im,0,0,c.width,c.height);let q=.7;r=c.toDataURL('image/jpeg',q);while(r.length>14000&&q>.35){q-=.07;r=c.toDataURL('image/jpeg',q)}if(r.length<=14000)break;M=Math.round(M*.82)}
  URL.revokeObjectURL(u);portOk(r)?ok(r):err(new Error('Não consegui usar essa foto.'))}catch(e){err(e)}};
 im.onerror=()=>{URL.revokeObjectURL(u);err(new Error('Não consegui abrir essa foto.'))};im.src=u})}
function verFotoPort(src){const d=document.createElement('dialog');d.className='port-lb';d.setAttribute('aria-label','Foto do portfólio');const im=document.createElement('img');im.src=src;im.alt='Foto do portfólio';d.append(im);d.addEventListener('click',()=>d.close());d.addEventListener('close',()=>d.remove());document.body.append(d);d.showModal()}
/* o que aparece no perfil de quem olha (some sozinho se o helper não preencheu nada) */
function portfolioEl(nome){
 const f=(PORT[nome]||[]).filter(Boolean),c=CONT[nome]||{},ig=c.ig||'',wa=c.mostrar&&c.wa?c.wa:'';
 if(!f.length&&!ig&&!wa)return null;
 const el=(t,cl,x)=>{const e=document.createElement(t);if(cl)e.className=cl;if(x!=null)e.textContent=x;return e};
 const w=el('div','port');w.append(el('h4',0,'Portfólio'));
 if(f.length){const row=el('div','port-row');f.forEach((u,i)=>{const b=el('button','port-th');b.type='button';b.setAttribute('aria-label','Ver foto '+(i+1)+' do portfólio');const im=document.createElement('img');im.src=u;im.alt='';b.append(im);b.onclick=()=>verFotoPort(u);row.append(b)});w.append(row)}
 if(ig||wa){const lk=el('div','port-links');
  if(ig){const a=el('a',0,'📸 @'+ig);a.href='https://instagram.com/'+encodeURIComponent(ig);a.target='_blank';a.rel='noopener noreferrer';lk.append(a)}
  if(wa){const a=el('a',0,'💬 WhatsApp');a.href='https://wa.me/'+(wa.length<=11?'55'+wa:wa);a.target='_blank';a.rel='noopener noreferrer';lk.append(a)}
  w.append(lk)}
 return w}
/* editor do próprio helper: fica fechadinho até a pessoa abrir, para o perfil continuar limpo */
function editorPortfolio(){
 carregarPortLocal();
 const el=(t,cl,x)=>{const e=document.createElement(t);if(cl)e.className=cl;if(x!=null)e.textContent=x;return e};
 const det=el('details','port-ed');det.append(el('summary',0,'🖼️ Portfólio e contatos'));
 det.append(el('p','note','Mostre trabalhos que você já fez. Toque na foto para trocar.'));
 const row=el('div','port-row'),msg=el('p','note');msg.setAttribute('role','status');
 const fi=document.createElement('input');fi.type='file';fi.accept='image/*';fi.hidden=true;let slot=0;
 const desenha=()=>{row.textContent='';const a=PORT[eu.nome]||[];
  for(let i=0;i<PORT_N;i++){const u=a[i]||'',cell=el('div','port-cell'),b=el('button','port-th'+(u?'':' vazio'));b.type='button';b.setAttribute('aria-label',u?'Trocar foto '+(i+1):'Adicionar foto '+(i+1));
   if(u){const im=document.createElement('img');im.src=u;im.alt='';b.append(im)}else b.textContent='+';
   b.onclick=()=>{slot=i;fi.click()};cell.append(b);
   if(u){const x=el('button','port-x','×');x.type='button';x.setAttribute('aria-label','Remover foto '+(i+1));x.onclick=()=>{setPort(eu.nome,i,'');salvarPortLocal();try{window.MH_DB&&MH_DB.ok&&MH_DB.portfoto(i,'')}catch(e){}desenha()};cell.append(x)}
   row.append(cell)}};
 fi.onchange=async()=>{const f=fi.files[0];fi.value='';if(!f)return;msg.textContent='';try{const u=await portRedim(f);setPort(eu.nome,slot,u);salvarPortLocal();try{window.MH_DB&&MH_DB.ok&&MH_DB.portfoto(slot,u)}catch(e){}desenha()}catch(x){msg.textContent=x.message||'Não consegui usar essa foto.'}};
 det.append(row,fi,msg);
 const campo=(rot,id,ph,max)=>{const f=el('div','f'),l=el('label',0,rot);l.htmlFor=id;const i=document.createElement('input');i.id=id;i.type='text';i.maxLength=max;i.placeholder=ph;i.autocomplete='off';f.append(l,i);det.append(f);return i};
 const ig=campo('Instagram do seu trabalho (opcional)','portIg','@seunegocio',60),wa=campo('WhatsApp do seu trabalho (opcional)','portWa','(66) 99999-9999',20);
 const lab=el('label','ck'),ck=document.createElement('input');ck.type='checkbox';ck.id='portMo';lab.append(ck,el('span',0,'Mostrar meu WhatsApp no meu perfil. Se marcar, qualquer pessoa que abrir o perfil vê o número.'));det.append(lab);
 const preenche=()=>{const c=CONT[eu.nome]||{};if(document.activeElement!==ig)ig.value=c.ig?'@'+c.ig:'';if(document.activeElement!==wa)wa.value=c.wa||'';ck.checked=!!c.mostrar};
 const sv=el('button','more','Salvar contatos');sv.type='button';const m2=el('p','note');m2.setAttribute('role','status');
 sv.onclick=()=>{m2.style.color='';const igv=igOk(ig.value),wav=waOk(wa.value);
  if(ig.value.trim()&&!igv){m2.style.color='var(--red)';m2.textContent='Instagram inválido. Use só o nome de usuário, como @seunegocio.';return}
  if(wa.value.trim()&&!wav){m2.style.color='var(--red)';m2.textContent='WhatsApp inválido. Use o DDD e o número.';return}
  const o={ig:igv,wa:wav,mostrar:ck.checked&&wav?1:0};setContato(eu.nome,o);salvarPortLocal();try{window.MH_DB&&MH_DB.ok&&MH_DB.contato(o)}catch(e){}
  ig.value=igv?'@'+igv:'';wa.value=wav;ck.checked=!!o.mostrar;m2.textContent='Salvo.'};
 det.append(sv,m2);
 desenha();preenche();
 carregaPort(eu.nome).then(()=>{desenha();preenche()});
 return det}
function avatarEl(nome,px){const d=document.createElement('span');d.className='avt';d.style.width=d.style.height=px+'px';d.style.fontSize=Math.round(px*.45)+'px';
 if(FOTO[nome]){const im=document.createElement('img');im.src=FOTO[nome];im.alt='Foto de '+nome;d.append(im)}
 else{let h=0;for(const c of nome)h=(h*31+c.charCodeAt(0))%360;d.style.background='hsl('+h+',45%,32%)';d.textContent=(nome.trim()[0]||'?').toUpperCase();d.setAttribute('aria-hidden','true')}
 return d}
function selo(nome){const s=document.createElement('span');const v=verificado(nome);s.className='selo '+(v?'ok':'nao');s.textContent=v?'✔ Verificado':'Sem verificação';return s}
function fotoRedim(f){return new Promise((ok,err)=>{
 if(!f||!/^image\//.test(f.type))return err(new Error('Escolha uma foto (imagem).'));
 if(f.size>12*1024*1024)return err(new Error('A foto é muito grande.'));
 const u=URL.createObjectURL(f),im=new Image();
 im.onload=()=>{try{const S=128,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d'),m=Math.min(im.width,im.height),sx=(im.width-m)/2,sy=(im.height-m)/2;
  g.fillStyle='#fff';g.fillRect(0,0,S,S);g.drawImage(im,sx,sy,m,m,0,0,S,S);URL.revokeObjectURL(u);
  let q=.62,r=c.toDataURL('image/jpeg',q);while(r.length>16000&&q>.3){q-=.08;r=c.toDataURL('image/jpeg',q)}
  fotoOk(r)?ok(r):err(new Error('Não consegui usar essa foto.'))}catch(e){err(e)}};
 im.onerror=()=>{URL.revokeObjectURL(u);err(new Error('Não consegui abrir essa foto.'))};im.src=u})}
async function definirFoto(nome,url){if(url)FOTO[nome]=url;else delete FOTO[nome];try{if(url)localStorage.setItem('mh_foto:'+nome.toLowerCase(),url);else localStorage.removeItem('mh_foto:'+nome.toLowerCase())}catch(e){}
 refreshProf();refreshSalao();let ok=null;try{if(window.MH_DB&&MH_DB.ok&&MH_DB.foto)ok=await MH_DB.foto(url||'')}catch(e){ok=false}
 if(ok===true)(window.MH_FOTO_PUB=window.MH_FOTO_PUB||{})[nome]=url||'';return ok}
/* Lista de profissionais: Helpers e Estabelecimentos (v8). Clientes só aparecem no chat.
   Com o worker ligado, a lista vem do servidor (/profissionais e /estabelecimentos): quem escondeu o perfil nem chega aqui. */
let profPag=0,profQ='';const PROF_N=6;
const V8={tab:'lojas',tipoF:'',lojas:[],lojasOk:false,fav:{lojas:new Set()},linkFeito:false};
window.MH_LOJAS8=()=>V8.lojas;window.MH_TIPO8=t=>{V8.tab='lojas';V8.tipoF=t||'';profPag=0;desenharProf()};
const CID8={'barra-do-garcas':'Barra do Garças',aragarcas:'Aragarças','pontal-do-araguaia':'Pontal do Araguaia'};
const mk8=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const apiOn8=()=>!!(window.MH_API&&MH_API.on());
const tk8=()=>(window.MH_API?MH_API.usrTk():'');
const chama8=(path,body)=>MH_API.req(path,body===undefined?{token:tk8()}:{token:tk8(),body});
const dataBR8=ts=>new Date(ts).toLocaleDateString('pt-BR');
const waLink8=n=>{const d=String(n||'').replace(/\D/g,'');return d?'https://wa.me/'+(d.length<=11?'55'+d:d):''};
function carregaV8(){if(!apiOn8())return;
 chama8('/profissionais').then(r=>{if(r.ok&&r.j&&r.j.ok){window.MH_PROS=r.j.itens||[];window.MH_PROS_OK=true;refreshProf()}}).catch(()=>{});
 chama8('/estabelecimentos').then(r=>{if(r.ok&&r.j&&r.j.ok){V8.lojas=r.j.itens||[];V8.lojasOk=true;refreshProf()}}).catch(()=>{})}
window.MH_prosRecarrega=carregaV8;
function carregaFav8(){if(!apiOn8()||!tk8())return;chama8('/favoritos/minhas').then(r=>{if(r.ok&&r.j&&r.j.ok){V8.fav.lojas=new Set(r.j.lojas||[]);refreshProf()}}).catch(()=>{})}
/* ===== compartilhar: menu do celular (WhatsApp, Instagram...) ou copia o link ===== */
const apiBase8=()=>String((window.MH_CFG||{}).api||'').replace(/\/+$/,'');
/* links apontam para o próprio site (o site já abre o perfil quando a página tem ?helper= ou ?loja=) */
const siteBase8=()=>{try{const o=location.origin;if(/^https?:\/\//.test(o)&&!/localhost|127\.0\.0\.1/.test(o))return o+'/'}catch(e){}return 'https://www.dcastrolabs.com/'};
const linkLoja8=c=>siteBase8()+'?loja='+encodeURIComponent(c);
const linkHelper8=n=>siteBase8()+'?helper='+encodeURIComponent(n);
async function compartilharSimples8(titulo,texto,url,aviso){
 const ok=m=>{if(aviso)aviso(m)};
 /* celular: menu de compartilhar (WhatsApp, Instagram…). Computador: só copia o link, porque o menu do Windows costuma falhar */
 let toque=false;try{toque=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent||'')}catch(e){}
 if(toque&&navigator.share){try{await navigator.share({title:titulo,text:texto,url});return}catch(e){if(e&&e.name==='AbortError')return}}
 try{await navigator.clipboard.writeText(url);ok('✅ Link copiado! Cole no WhatsApp ou no Instagram.');return}catch(e){}
 try{const t=document.createElement('textarea');t.value=url;t.style.cssText='position:fixed;left:-999px;top:0';document.body.append(t);t.select();const c=document.execCommand('copy');t.remove();if(c){ok('✅ Link copiado! Cole no WhatsApp ou no Instagram.');return}}catch(e){}
 try{window.prompt('Copie o link:',url)}catch(e){}}
/* compartilhar perfil: abre direto o QR (como no Instagram) com baixar PNG, compartilhar e copiar link */
function compartilhar8(titulo,texto,url,aviso){return qrCompartilhar8(titulo,texto,url)}
async function qrCompartilhar8(titulo,texto,url){
 const d=novoDlg8('Compartilhar perfil');d.textContent='';d.addEventListener('close',()=>d.remove());
 d.append(mk8('h3',null,'Compartilhar perfil'),mk8('p','note','Gerando QR…'));d.showModal();
 let qr;try{await carregaQR8();qr=qrcode(0,'H');qr.addData(url);qr.make()}catch(e){d.close();return compartilharSimples8(titulo,texto,url,()=>{})}
 const n=qr.getModuleCount(),cel=Math.max(6,Math.floor(760/n)),real=cel*n,mg=60,W=real+mg*2,topo=170,rod=150,H=real+mg*2+topo+rod;
 const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
 g.fillStyle='#fff';g.fillRect(0,0,W,H);g.fillStyle='#111';g.fillRect(0,0,W,90);
 g.fillStyle='#f5c518';g.font='bold 54px Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('MiHelp',W/2,47);
 g.fillStyle='#111';g.textBaseline='alphabetic';g.font='bold 40px Arial,sans-serif';
 const ls=linhasTxt8(g,titulo,W-80).slice(0,2);let y=140;ls.forEach(l=>{g.fillText(l,W/2,y);y+=46});
 const y0=Math.max(topo,y-10)+mg-20,H2=y0+real+mg+rod-40;if(H2>H){cv.height=H2;g.fillStyle='#fff';g.fillRect(0,0,W,H2);g.fillStyle='#111';g.fillRect(0,0,W,90);g.fillStyle='#f5c518';g.font='bold 54px Arial,sans-serif';g.textBaseline='middle';g.textAlign='center';g.fillText('MiHelp',W/2,47);g.fillStyle='#111';g.textBaseline='alphabetic';g.font='bold 40px Arial,sans-serif';y=140;ls.forEach(l=>{g.fillText(l,W/2,y);y+=46})}
 g.fillStyle='#000';for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(qr.isDark(r,c))g.fillRect(mg+c*cel,y0+r*cel,cel,cel);
 g.fillStyle='#444';g.font='30px Arial,sans-serif';g.fillText('Aponte a câmera do celular para abrir o perfil',W/2,y0+real+50);
 g.font='24px Arial,sans-serif';g.fillStyle='#777';g.fillText(url.replace(/^https?:\/\//,'').slice(0,60),W/2,y0+real+90);
 cv.style.cssText='width:100%;max-width:min(88vw,340px);height:auto;border:1px solid #ccc;border-radius:12px;background:#fff;display:block;margin:8px auto';
 const arq='mihelp-'+String(titulo).toLowerCase().replace(/ no mihelp$/,'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'-qr';
 const st=mk8('p','note','');st.setAttribute('role','status');
 const aviso=m=>{st.textContent=m;setTimeout(()=>{if(st.textContent===m)st.textContent=''},3000)};
 const blob=()=>new Promise(r=>cv.toBlob(r,'image/png'));
 const copiar=async()=>{try{await navigator.clipboard.writeText(url);aviso('✅ Link copiado!');return}catch(e){}
  try{const t=document.createElement('textarea');t.value=url;t.style.cssText='position:fixed;left:-999px;top:0';d.append(t);t.select();const c=document.execCommand('copy');t.remove();if(c){aviso('✅ Link copiado!');return}}catch(e){}
  try{window.prompt('Copie o link:',url)}catch(e){}};
 d.textContent='';d.append(mk8('h3',null,'Compartilhar perfil'),mk8('p','note','Mostre este QR para outra pessoa ler com a câmera, ou tire um print.'),cv);
 const ac=mk8('div','v8acts');
 ac.append(botao8('⬇ Baixar QR (PNG)','cta2',()=>{const a=document.createElement('a');a.download=arq+'.png';a.href=cv.toDataURL('image/png');document.body.append(a);a.click();a.remove();aviso('✅ QR baixado.')}),
  botao8('📤 Compartilhar','more',async()=>{
   try{const b=await blob();if(b&&navigator.canShare&&navigator.share){const f=new File([b],arq+'.png',{type:'image/png'});if(navigator.canShare({files:[f]})){await navigator.share({files:[f],title:titulo,text:texto+(texto?' ':'')+url});return}}}catch(e){if(e&&e.name==='AbortError')return}
   compartilharSimples8(titulo,texto,url,aviso)}),
  botao8('🔗 Copiar link','more',copiar));
 d.append(ac,st);
 const ac2=mk8('div','v8acts');
 ac2.append(botao8('🖨 Totem de avaliação','more',()=>{d.close();qrTotem8(titulo.replace(/ no MiHelp$/,''),'',url+(url.includes('?')?'&':'?')+'avaliar=1','totem-'+arq)}),botao8('Fechar','more',()=>d.close()));d.append(ac2)}
/* favoritar Helper no servidor (o favorito local do site continua; isto deixa o Helper ver quantas pessoas o favoritaram) */
function favSrv8(nome,on){if(!apiOn8()||!tk8())return;const h=(window.MH_PROS||[]).find(x=>x.nome===nome);if(!h||!h.uid)return;chama8('/favoritos',{alvo:'h:'+h.uid,on:!!on}).catch(()=>{})}
/* link recebido (?loja=... ou ?helper=...): abre o perfil direto */
function abrirLinkV8(){if(V8.linkFeito)return;let p;try{p=new URLSearchParams(location.search)}catch(e){return}
 const loja=p.get('loja'),hp=p.get('helper'),av=p.get('avaliar')==='1';if(!loja&&!hp)return;V8.linkFeito=true;
 const alvo=document.getElementById('prof');
 if(loja&&/^[a-z0-9-]{4,70}$/.test(loja)){
  if(av){try{sessionStorage.setItem('mh_aval_pend',loja)}catch(e){}}
  setTimeout(()=>{if(alvo)alvo.scrollIntoView();abrirLoja8(loja,av?{avaliar:1}:null)},600)}
 else if(hp){if(av){QRAV.add(hp);try{sessionStorage.setItem('mh_aval_pend_h',hp)}catch(e){}}
  let n=0;const t=setInterval(()=>{n++;const h=listaHelpers().find(x=>x.nome===hp);if(h){clearInterval(t);if(alvo)alvo.scrollIntoView();chamarHelper(h);if(av)avaliarHelperDireto8(hp)}else if(n>20)clearInterval(t)},500)}}
function listaHelpers(){const m=new Map();
 if(apiOn8()){(window.MH_PROS||[]).forEach(x=>{if(x&&x.nome)m.set(x.nome,{nome:x.nome,work:String(x.work||'').trim(),lojas:x.lojas||[]})})}
 else{(window.MH_HELPERS||[]).forEach(x=>{if(x&&x.nome)m.set(x.nome,{nome:x.nome,work:String(x.oficio||'').trim()})});
  Object.values(REAIS).forEach(p=>{if(p.role==='helper'&&!m.has(p.nome))m.set(p.nome,{nome:p.nome,work:p.work||''})})}
 if(BOTS)PESSOAS.forEach(p=>{if(p.role==='helper'&&!p.oculto&&!m.has(p.nome))m.set(p.nome,{nome:p.nome,work:p.work||'',bot:true})});
 return[...m.values()].filter(h=>!bloqueados.has(h.nome)&&!(window.MH_FORA&&MH_FORA.has(h.nome))&&!(eu&&h.nome===eu.nome))}
function chamarHelper(h){if(!pessoa(h.nome))REAIS[h.nome]={nome:h.nome,role:h.role||'helper',work:h.work,real:true,status:'fora'};abrirPerfil(h.nome)}
window.MH_chamar=chamarHelper;
function avatarLoja8(l,px){const d=mk8('span','avt');d.style.width=d.style.height=px+'px';d.style.fontSize=Math.round(px*.45)+'px';
 if(l.logo&&/^data:image\//.test(l.logo)){const im=document.createElement('img');im.src=l.logo;im.alt='Logo de '+l.nome;d.append(im)}
 else{let h=0;for(const c of l.nome)h=(h*31+c.charCodeAt(0))%360;d.style.background='hsl('+h+',45%,32%)';d.textContent=(l.nome.trim()[0]||'?').toUpperCase();d.setAttribute('aria-hidden','true')}
 return d}
function cardHelper8(h){
 const c=mk8('div','pcard');c.append(avatarEl(h.nome,56));
 const t=mk8('div','pinfo');
 const r=resumo(h.nome);
 const row=mk8('span','prow');row.append(selo(h.nome));{const sm=window.MH_SELOS&&MH_SELOS.mini('p:'+h.nome);if(sm)row.append(sm)}
 if(h.bot)row.append(mk8('span','selo nao','exemplo'));
 (h.lojas||[]).forEach(l=>{const a=mk8('button','plink','🏪 Trabalha na '+l.nome);a.type='button';a.title='Ver o estabelecimento';a.onclick=()=>abrirLoja8(l.chave);row.append(a)});
 t.append(mk8('b',null,h.nome),mk8('span','pw',h.work||'Helper'),mk8('span','pe',r?estr(Math.round(r.m))+' '+r.m.toFixed(1).replace('.',',')+' ('+r.n+')':'☆☆☆☆☆ novo'),row);
 const bt=mk8('button','pcall','💬 Chamar');bt.type='button';bt.setAttribute('aria-label','Chamar '+h.nome);bt.onclick=()=>chamarHelper(h);
 c.append(t,bt);return c}
function cardLoja8(l){
 const c=mk8('div','pcard');c.append(avatarLoja8(l,56));
 const t=mk8('div','pinfo');
 const row=mk8('span','prow');{const sm=window.MH_SELOS&&MH_SELOS.mini('l:'+l.chave);if(sm)row.append(sm)}if(l.aberto!==null&&l.aberto!==undefined)row.append(mk8('span','selo '+(l.aberto?'ok':'nao'),(l.aberto?'🟢 ':'🔴 ')+l.statusTxt));
 if(!l.equipeOculta)row.append(mk8('span','selo nao','👥 '+l.equipe+(l.equipe===1?' profissional':' profissionais')));if(l.invest)row.append(mk8('span','selo ok','💼 aceita investidor'));
 t.append(mk8('b',null,l.nome),mk8('span','pw',(l.tipo||'Estabelecimento')+(CID8[l.cidade]?' · '+CID8[l.cidade]:'')),
  mk8('span','pe',l.n?estr(Math.round(l.nota))+' '+l.nota.toFixed(1).replace('.',',')+' ('+l.n+')':'☆☆☆☆☆ novo'),row);
 const bt=mk8('button','pcall','Ver perfil');bt.type='button';bt.setAttribute('aria-label','Ver perfil de '+l.nome);bt.onclick=()=>abrirLoja8(l.chave);
 c.append(t,bt);return c}
function desenhaTopo8(){const top=document.getElementById('profTop');if(!top)return;top.textContent='';
 const tabs=mk8('div','v8tabs');tabs.setAttribute('role','tablist');
 [['lojas','🏪 Estabelecimentos'],['helpers','Helpers'],['invest','💰 Investir']].concat(eu&&apiOn8()?[['fav','★ Favoritos']]:[]).forEach(([k,t])=>{const b=mk8('button',k==='lojas'?'dest':null,t);b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-selected',String(V8.tab===k));b.onclick=()=>{V8.tab=k;profPag=0;desenharProf()};tabs.append(b)});
 top.append(tabs);
 if(V8.tab==='invest')top.append(mk8('p','note','Lojas e negócios pequenos que aceitam conversar com quem quer investir. O MiHelp só apresenta: não participa do negócio, não garante retorno e não guarda dinheiro. Converse, peça tudo por escrito e combine fora do app com cuidado.'));
 if(V8.tab==='lojas'){const ts={};V8.lojas.forEach(l=>{const t=l.tipo||'Outro';ts[t]=(ts[t]||0)+1});const ks=Object.keys(ts).sort((a,b)=>a.localeCompare(b,'pt-BR'));
  if(ks.length>1||V8.tipoF){const sl=document.createElement('select');sl.setAttribute('aria-label','Filtrar estabelecimentos por tipo');sl.add(new Option('Todos os tipos ('+V8.lojas.length+')',''));ks.forEach(k=>sl.add(new Option(k+' ('+ts[k]+')',k)));
   if(V8.tipoF&&!ts[V8.tipoF])sl.add(new Option(V8.tipoF+' (0)',V8.tipoF));sl.value=V8.tipoF;sl.onchange=()=>{V8.tipoF=sl.value;profPag=0;desenharProf()};top.append(sl)}}
 const ac=mk8('div','v8acts');
 if(apiOn8()&&window.MH_API.admTk()&&document.body.classList.contains('adm')){const b=mk8('button','more','🛠 Adm: ofícios');b.type='button';b.onclick=abrirAdmOficios8;ac.append(b);const b2=mk8('button','more','🛠 Adm: pessoas');b2.type='button';b2.onclick=abrirAdmPessoas8;ac.append(b2)}
 if(ac.children.length)top.append(ac)}
function desenharProf(){
 const box=document.getElementById('profList'),pg=document.getElementById('profPg');if(!box||!pg)return;
 desenhaTopo8();
 const q=norm(profQ).trim();const itens=[];
 if(V8.tab==='helpers'||V8.tab==='fav')listaHelpers().filter(h=>(V8.tab!=='fav'||ehFav(h.nome))&&(!q||norm(h.nome).includes(q)||norm(h.work).includes(q))).forEach(h=>{const r=resumo(h.nome);itens.push({t:'h',h,v:verificado(h.nome)?1:0,nota:r?r.m:0,n:r?r.n:0,nome:h.nome})});
 if(V8.tab!=='helpers')V8.lojas.filter(l=>(V8.tab!=='fav'||V8.fav.lojas.has(l.chave))&&(V8.tab!=='lojas'||!V8.tipoF||l.tipo===V8.tipoF)&&(V8.tab!=='invest'||l.invest)&&(!q||norm(l.nome).includes(q)||norm(l.tipo).includes(q))).forEach(l=>itens.push({t:'e',l,v:0,nota:l.nota||0,n:l.n||0,nome:l.nome}));
 itens.sort((a,b)=>(b.v-a.v)||(b.nota-a.nota)||(b.n-a.n)||a.nome.localeCompare(b.nome,'pt-BR'));
 const tot=Math.max(1,Math.ceil(itens.length/PROF_N));if(profPag>=tot)profPag=tot-1;
 box.textContent='';
 if(!itens.length){const p=mk8('p','note',q?'Ninguém encontrado com esse nome ou ofício.':V8.tab==='fav'?'Você ainda não favoritou ninguém. Toque na estrela no perfil de um Helper ou de uma loja.':V8.tab==='invest'?'Nenhuma loja marcou que aceita investidor ainda. O dono marca isso na edição da loja, em "Mais informações".':V8.tab==='lojas'?'Ainda não tem estabelecimentos. Helper cria o primeiro em "Meu espaço profissional".':'Ainda não tem profissionais cadastrados. Seja o primeiro: faça o cadastro como Helper.');box.append(p)}
 itens.slice(profPag*PROF_N,profPag*PROF_N+PROF_N).forEach(it=>box.append(it.t==='h'?cardHelper8(it.h):cardLoja8(it.l)));
 pg.textContent='';
 if(tot>1){const a=document.createElement('button'),n2=document.createElement('button'),s=document.createElement('span');a.type=n2.type='button';a.textContent='Anterior';n2.textContent='Próxima';s.textContent=(profPag+1)+' de '+tot;a.disabled=profPag<=0;n2.disabled=profPag>=tot-1;
  a.onclick=()=>{profPag--;desenharProf()};n2.onclick=()=>{profPag++;desenharProf()};pg.append(a,s,n2)}}
document.addEventListener('mh-selos',()=>{try{desenharProf()}catch(e){}});
function montaProf(){const need=document.getElementById('need');if(!need||document.getElementById('prof'))return;
 const s=document.createElement('section');s.id='prof';s.className='prof';s.setAttribute('aria-label','Profissionais da Região');
 const h=mk8('h2','prof-t','Profissionais da Região');
 const p=mk8('p','prof-s','Helpers e estabelecimentos da região. Toque em "Chamar" ou "Ver perfil".');
 const top=mk8('div','v8top');top.id='profTop';
 const i=document.createElement('input');i.type='search';i.id='profQ';i.placeholder='Buscar: nome ou ofício';i.setAttribute('aria-label','Buscar profissional');i.autocomplete='off';
 i.addEventListener('input',()=>{profQ=i.value;profPag=0;desenharProf()});
 const l=document.createElement('div');l.id='profList';const g=document.createElement('div');g.id='profPg';g.className='ppg';
 s.append(h,p,top,i,l,g);need.after(s);desenharProf();carregaV8();carregaFav8();abrirLinkV8();setInterval(()=>{if(!document.hidden){carregaV8();carregaFav8()}},60000)}
setTimeout(montaProf,0);

/* ===== v8: perfil do estabelecimento ===== */
function novoDlg8(rot){const d=document.createElement('dialog');d.className='v8dlg';d.setAttribute('aria-label',rot);document.body.append(d);d.addEventListener('click',e=>{if(e.target===d)d.close()});return d}
let lojaDlg8=null,espDlg8=null,admDlg8=null;
const erro8=r=>((r&&r.j&&r.j.erro)||'Não deu certo. Tente de novo.')+(r&&r.j&&r.j.liberaEm?' Libera em '+dataBR8(r.j.liberaEm)+'.':'');
const botao8=(txt,cls,fn)=>{const b=mk8('button',cls||'more',txt);b.type='button';b.onclick=fn;return b};
/* botão que pede um segundo toque (apagar, sair, etc.) */
const botao2x8=(txt,cls,fn)=>{let t=0;const b=botao8(txt,cls,()=>{if(!t){t=setTimeout(()=>{t=0;b.textContent=txt},4000);b.textContent='Toque de novo para confirmar';return}clearTimeout(t);t=0;b.textContent=txt;fn()});return b};
async function abrirLoja8(chave,opc){
 const d=lojaDlg8||(lojaDlg8=novoDlg8('Estabelecimento'));d.textContent='';d.append(mk8('p','note','Carregando…'));if(!d.open)d.showModal();
 const r=await chama8('/estabelecimentos/ver?chave='+encodeURIComponent(chave));
 if(!r.ok||!(r.j&&r.j.ok)){d.textContent='';d.append(mk8('p','note',erro8(r)),botao8('Fechar','more',()=>d.close()));return}
 if(opc&&opc.pro)r.j._pro=opc.pro;pintaLoja8(d,r.j,(opc&&opc.aba)||(r.j.modo==='agenda'&&(r.j.servicos||[]).length?'serv':(r.j.equipeOculta?'aval':'equipe')));
 if(opc&&opc.avaliar)avaliarDireto8(d,r.j)}
function horarioTxt8(h){if(!h||!Array.isArray(h.d))return[];const N=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];return [1,2,3,4,5,6,0].map(i=>N[i]+': '+((h.d[i]||[]).length?h.d[i].map(x=>x.replace('-','–')).join(' e '):'fechado'))}
function pintaLoja8(d,L,aba,aviso){clearInterval(chatTimer8);d.textContent='';
 if(L.equipeOculta&&aba==='equipe')aba=(L.modo==='agenda'&&(L.servicos||[]).length)?'serv':'aval';
 const top=mk8('div','v8head');top.append(avatarLoja8(L,64));
 const hd=mk8('div');hd.append(mk8('h3',null,L.nome),mk8('p','note',(L.tipo||'')+(CID8[L.cidade]?' · '+CID8[L.cidade]:'')));top.append(hd);d.append(top);
 d.append(mk8('p','stars',L.n?estr(Math.round(L.nota))+'  '+L.nota.toFixed(1).replace('.',',')+' · '+L.n+(L.n>1?' avaliações':' avaliação'):'☆☆☆☆☆ · ainda sem avaliação'));
 {const sb=window.MH_SELOS&&MH_SELOS.bloco('l:'+L.chave,L.nome);if(sb)d.append(sb)}
 if(L.aberto!==null&&L.aberto!==undefined){const p=mk8('p','v8status '+(L.aberto?'on':'off'),(L.aberto?'🟢 ':'🔴 ')+L.statusTxt);d.append(p)}
 const hs=horarioTxt8(L.horario);if(hs.length){const dt=document.createElement('details');dt.append(mk8('summary',null,'Horário de funcionamento'));hs.forEach(t=>dt.append(mk8('div','note',t)));d.append(dt)}
 if(L.endereco)d.append(mk8('p','note','📍 '+L.endereco));
 if(L.descricao)d.append(mk8('p',null,L.descricao));
 if(L.donoNome)d.append(mk8('p','note','👤 Dono: '+L.donoNome));
 if(L.invest){const iv=mk8('div','v8card');iv.append(mk8('b',null,'💼 Aceita conversar com investidores'),mk8('p','note',L.invest),mk8('p','note','Quem investe combina tudo direto com o dono. O MiHelp não intermedia, não garante retorno e não recebe nada. Desconfie de promessa de lucro fácil.'));d.append(iv)}
 if(L.souDono&&L.favs!==undefined)d.append(mk8('p','note','⭐ '+L.favs+(L.favs===1?' pessoa favoritou':' pessoas favoritaram')+' a sua loja (só você vê isso).'));
 const lk=mk8('div','v8row');
 const link=(t,u)=>{const a=mk8('a','more',t);a.href=u;a.target='_blank';a.rel='noopener noreferrer';a.style.textDecoration='none';lk.append(a)};
 if(L.mapa)link('🗺 Ver no mapa',L.mapa);
 if(L.contato)link('💬 WhatsApp da loja',waLink8(L.contato));
 const stt=mk8('span','note');stt.setAttribute('role','status');
 lk.append(botao8('🔗 Compartilhar','more',()=>compartilhar8(L.nome+' no MiHelp',(L.tipo||'')+(L.statusTxt?' · '+L.statusTxt:''),linkLoja8(L.chave),m=>{stt.textContent=m;setTimeout(()=>stt.textContent='',2500)})),stt);
 if(L.logado&&!L.souDono)lk.append(botao8(L.favoritada?'★ Nos favoritos':'☆ Favoritar','more',async()=>{const on=!L.favoritada;const r=await chama8('/favoritos',{alvo:'l:'+L.chave,on});if(r.ok&&r.j&&r.j.ok){L.favoritada=on;if(on)V8.fav.lojas.add(L.chave);else V8.fav.lojas.delete(L.chave);pintaLoja8(d,L,aba);refreshProf()}else pintaLoja8(d,L,aba,erro8(r))}));
 d.append(lk);
 /* chat da loja */
 if(L.logado&&L.chat){const ch=mk8('div','v8row');
  if(L.acesso&&L.acesso.atend)ch.append(botao8('📥 Atendimento (clientes)','cta2',()=>abrirThreads8(d,L)));
  else ch.append(botao8('💬 Falar com a loja','cta2',()=>abrirChat8(d,L,'meu','Conversa com '+L.nome,()=>pintaLoja8(d,L,aba))));
  if(L.acesso&&L.acesso.interno)ch.append(botao8('🔒 Chat da equipe','more',()=>abrirChat8(d,L,'i','Chat da equipe',()=>pintaLoja8(d,L,aba))));
  d.append(ch)}
 const tabs=mk8('div','v8tabs');
 ((L.modo==='agenda'&&((L.servicos||[]).length||L.souDono)?[['serv','Serviços ('+(L.servicos||[]).length+')']]:[]).concat(L.equipeOculta?[]:[['equipe','Equipe ('+L.totalEquipe+')']]).concat([['aval','Avaliações ('+L.n+')']])).forEach(([k,t])=>{const b=mk8('button',null,t);b.type='button';b.setAttribute('aria-selected',String(aba===k));b.onclick=()=>pintaLoja8(d,L,k);tabs.append(b)});
 d.append(tabs);
 const pane=mk8('div');
 if(aba==='serv'){painelServ8(pane,d,L)}else if(aba==='equipe'){
  if(!L.equipe.length)pane.append(mk8('p','note','Nenhum profissional aparece aqui ainda.'));
  L.equipe.forEach(m=>{const c=mk8('div','pcard pteam');c.append(avatarEl(m.nome,44));const t=mk8('div','pinfo');t.append(mk8('b',null,m.nome),mk8('span','pw',[m.funcao,m.work].filter(Boolean).join(' · ')||'Equipe'));c.append(t);
   /* todos da equipe (exceto você) podem ser vistos e chamados no privado, a menos que a pessoa tenha desligado */
   if(!(eu&&m.nome===eu.nome)&&m.chamar!==false){const pp={nome:m.nome,work:m.work||m.funcao,role:m.helper===false?'cliente':'helper'};
    const r0=resumo(m.nome);if(r0)t.append(mk8('span','pe',estr(Math.round(r0.m))+' '+r0.m.toFixed(1).replace('.',',')+' ('+r0.n+')'));
    const acs=mk8('div','pacts');acs.append(botao8('👤 Perfil','pcall',()=>{d.close();chamarHelper(pp)}),botao8('💬 Privado','pcall',()=>{d.close();chamarHelper(pp);try{abrirPrivado(m.nome)}catch(e){}}));c.append(acs);
    if(m.helper!==false&&m.ag&&L.modo==='agenda'&&(L.servicos||[]).length){const mb=botao8('📅 Marcar horário','cta2',()=>reservar8(d,L,{pro:m.nome}));mb.className='cta2 pmarca';c.append(mb)}
    else if(m.helper!==false&&L.modo==='agenda'&&(L.servicos||[]).length)t.append(mk8('span','pe','📅 agenda fechada'))}
   pane.append(c)});
  const oc=L.totalEquipe-L.equipe.length;
  if(oc>0)pane.append(mk8('p','note',L.totalEquipe+' profissionais no total. '+oc+(oc>1?' preferem':' prefere')+' não aparecer aqui.'));
  if(L.modo==='agenda'&&(L.servicos||[]).length)pane.append(mk8('p','note','Para marcar horário, toque em "Marcar horário" embaixo do profissional ou abra a aba Serviços.'))}
 else{
  if(!L.n)pane.append(mk8('p','note','Ainda não tem avaliações.'));
  else{const dist=L.dist||[0,0,0,0,0];for(let k=5;k>=1;k--){const v=dist[k-1]||0;pane.append(mk8('div','note',k+'★  '+'▮'.repeat(Math.round(v/L.n*10))+'  '+v))}}
  if(L.comentariosOcultos&&L.n)pane.append(mk8('p','note','Os comentários ficam visíveis só para o dono da loja. Aqui aparecem as estrelas.'));
  else L.avaliacoes.forEach(a=>{const b=mk8('div','dep');b.append(mk8('b',null,estr(a.estrelas)+(a.autor?' · '+a.autor:'')));b.append(document.createElement('br'),document.createTextNode(a.comentario||'(sem comentário)'));
   if(apiOn8()&&MH_API.admTk()&&document.body.classList.contains('adm')){const x=botao2x8('🗑 Apagar','more',async()=>{const r=await MH_API.req('/avaliar/apagar',{token:MH_API.admTk(),body:{id:a.id}});if(r.ok)abrirLoja8(L.chave);else pintaLoja8(d,L,aba,erro8(r))});x.style.marginLeft='8px';b.append(x)}
   pane.append(b)})}
 d.append(pane);
 if(aviso){const p=mk8('p','note',aviso);p.setAttribute('role','status');d.append(p)}
 const ac=mk8('div','perfil-acoes');
 if(!L.logado)d.append(mk8('p','note','Entre na conta para favoritar, falar com a loja, avaliar ou pedir para fazer parte da equipe.'));
 else if(L.souDono)ac.append(botao8('⚙ Gerenciar minha loja','cta2 pa-main',()=>{d.close();abrirEspaco8('lojas')}));
  else{
  if(!L.meuVinculo)ac.append(botao8('🙋 Quero fazer parte','more pa-sec',()=>formPedir8(d,L)));
  else if(L.meuVinculo.status==='pedido')d.append(mk8('p','note','Seu pedido para entrar na equipe está esperando o dono.'));
  else if(L.meuVinculo.status==='convidado')d.append(mk8('p','note','O dono convidou você. Responda em "Meu espaço profissional".'));
  if(L.podeAvaliar){if(L.jaAvaliei)d.append(mk8('p','note','Você já avaliou esta loja.'));else ac.append(botao8('⭐ Avaliar','more pa-sec',()=>formAvalLoja8(d,L)))}
  else if(L.meuVinculo&&L.meuVinculo.status==='aceito')d.append(mk8('p','note','Quem trabalha na loja não avalia a própria loja.'))}
 if(apiOn8()&&MH_API.admTk()&&document.body.classList.contains('adm'))ac.append(botao2x8('🗑 Apagar loja (adm)','more pa-sec',async()=>{const r=await MH_API.req('/estabelecimentos/apagar',{token:MH_API.admTk(),body:{chave:L.chave}});if(r.ok){d.close();carregaV8()}else pintaLoja8(d,L,aba,erro8(r))}));
 if(apiOn8()&&MH_API.admTk()&&document.body.classList.contains('adm'))ac.append(botao8('🔁 Oferecer a um Helper (adm)','more pa-sec',async()=>{const t=prompt('Telefone do Helper que vai ficar com a loja (ele precisa aceitar):');if(!t)return;const r=await MH_API.req('/estabelecimentos/transferir',{token:MH_API.admTk(),body:{chave:L.chave,tel:t}});pintaLoja8(d,L,aba,r.ok&&r.j&&r.j.ok?'Oferta enviada. Se o telefone for de um Helper, ele vê em "Meu espaço profissional".':erro8(r))}));
 ac.append(botao8('Fechar','more pa-close',()=>d.close()));d.append(ac)}
/* ===== QR do totem: o QR abre a loja/Helper já na tela de avaliar ===== */
const QRAV=new Set();
function avaliarDireto8(d,L){
 if(!L.logado){
  pintaLoja8(d,L,'aval','Para avaliar, crie sua conta grátis (leva 1 minuto) ou entre. Depois a avaliação abre sozinha.');
  const ac=d.querySelector('.perfil-acoes');
  if(ac)ac.prepend(botao8('👤 Criar conta / Entrar','cta2 pa-main',()=>{d.close();const w=document.getElementById('cadWin');if(w){w.classList.remove('fechada');w.scrollIntoView({behavior:'smooth'})}}));
  return}
 try{sessionStorage.removeItem('mh_aval_pend')}catch(e){}
 if(L.jaAvaliei){pintaLoja8(d,L,'aval','Você já avaliou esta loja. Obrigado!');return}
 if(!L.podeAvaliar){pintaLoja8(d,L,'aval','Dono e equipe da loja não podem avaliar a própria loja.');return}
 formAvalLoja8(d,L)}
function avaliarHelperDireto8(nome){
 if(!eu||!tk8())return;
 if(eu.nome===nome)return;
 try{sessionStorage.removeItem('mh_aval_pend_h')}catch(e){}
 const pes=pessoa(nome);if(pes&&pfDlg&&pfDlg.open)formAval(pes)}
/* depois de criar conta/entrar, a avaliação pendente abre sozinha */
setInterval(()=>{try{
 const c=sessionStorage.getItem('mh_aval_pend');
 if(c&&window.MH_UI&&MH_UI.eu()&&tk8()&&!(espDlg8&&espDlg8.open)&&!(lojaDlg8&&lojaDlg8.open))abrirLoja8(c,{avaliar:1});
 const h=sessionStorage.getItem('mh_aval_pend_h');
 if(h&&eu&&tk8()&&!(pfDlg&&pfDlg.open)){QRAV.add(h);try{sessionStorage.removeItem('mh_aval_pend_h')}catch(e){}
  if(eu.nome!==h){const x=listaHelpers().find(y=>y.nome===h)||{nome:h};chamarHelper(x);setTimeout(()=>avaliarHelperDireto8(h),300)}}
}catch(e){}},2000);
function carregaQR8(){return new Promise((ok,no)=>{if(window.qrcode)return ok();const sc=document.createElement('script');sc.src='https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';sc.onload=()=>window.qrcode?ok():no();sc.onerror=no;document.head.append(sc)})}
function linhasTxt8(g,t,w){const ps=String(t).split(' ');const out=[];let c='';ps.forEach(x=>{const n=c?c+' '+x:x;if(g.measureText(n).width>w&&c){out.push(c);c=x}else c=n});if(c)out.push(c);return out}
async function qrTotem8(titulo,sub,url,arq){
 const d=novoDlg8('QR do totem');d.textContent='';d.addEventListener('close',()=>d.remove());
 d.append(mk8('h3',null,'QR do totem'),mk8('p','note','Gerando…'));d.showModal();
 let qr;try{await carregaQR8();qr=qrcode(0,'H');qr.addData(url);qr.make()}catch(e){
  d.textContent='';d.append(mk8('h3',null,'QR do totem'),mk8('p','note','Não consegui gerar agora (sem internet?). Tente de novo.'),botao8('Fechar','more',()=>d.close()));return}
 const W=1000,H=1400,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
 g.fillStyle='#fff';g.fillRect(0,0,W,H);g.fillStyle='#111';g.fillRect(0,0,W,150);
 g.fillStyle='#f5c518';g.font='bold 80px Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('MiHelp',W/2,78);
 g.fillStyle='#111';g.font='bold 62px Arial,sans-serif';g.textBaseline='alphabetic';
 let y=250;linhasTxt8(g,'Avalie '+titulo,W-120).slice(0,2).forEach(l=>{g.fillText(l,W/2,y);y+=74});
 g.font='40px Arial,sans-serif';g.fillStyle='#444';if(sub){g.fillText(String(sub).slice(0,48),W/2,y-4);y+=50}
 const n=qr.getModuleCount(),tam=760,cel=Math.floor(tam/n),real=cel*n,x0=(W-real)/2,y0=Math.max(y+20,380);
 g.fillStyle='#fff';g.fillRect(x0-30,y0-30,real+60,real+60);g.fillStyle='#000';
 for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(qr.isDark(r,c))g.fillRect(x0+c*cel,y0+r*cel,cel,cel);
 g.strokeStyle='#111';g.lineWidth=6;g.strokeRect(x0-30,y0-30,real+60,real+60);
 const yb=y0+real+110;g.fillStyle='#111';g.font='bold 54px Arial,sans-serif';g.fillText('⭐ Aponte a câmera do celular',W/2,yb);
 g.font='42px Arial,sans-serif';g.fillStyle='#444';g.fillText('e deixe sua avaliação e comentário',W/2,yb+60);
 g.font='30px Arial,sans-serif';g.fillStyle='#777';g.fillText(url.replace(/^https?:\/\//,'').slice(0,60),W/2,H-50);
 cv.style.cssText='width:100%;max-width:min(92vw,420px);height:auto;border:1px solid #ccc;border-radius:8px;background:#fff;display:block;margin:8px auto';
 d.textContent='';d.append(mk8('h3',null,'QR do totem'),mk8('p','note','O QR já aparece aqui na tela: dá para só tirar um print do celular e mostrar. Para imprimir, use A5 ou A4 (QR com pelo menos 4 cm) e teste com o seu celular antes de colar.'),cv);
 const ac=mk8('div','v8acts');
 ac.append(botao8('⬇ Baixar PNG','cta2',()=>{const a=document.createElement('a');a.download=(arq||'totem')+'.png';a.href=cv.toDataURL('image/png');document.body.append(a);a.click();a.remove()}),
  botao8('🖨 Imprimir','more',()=>{const w=window.open('','_blank');if(!w)return;w.document.write('<title>Totem</title><body style="margin:0;text-align:center"><img src="'+cv.toDataURL('image/png')+'" style="max-width:100%;max-height:100vh" onload="print()">');w.document.close()}),
  botao8('Fechar','more',()=>d.close()));d.append(ac)}
const qrLoja8=L=>qrTotem8(L.nome,L.tipo||'',linkLoja8(L.chave)+'&avaliar=1','totem-'+L.chave);
const qrHelper8=(n,w)=>qrTotem8(n,w||'Helper','' +linkHelper8(n)+'&avaliar=1','totem-'+String(n).toLowerCase().replace(/[^a-z0-9]+/g,'-'));
function formPedir8(d,L){d.textContent='';d.append(mk8('h3',null,'Quero fazer parte de '+L.nome));
 d.append(mk8('p','note','O dono precisa aprovar. Você escolhe se o seu nome aparece no perfil da loja.'));
 const l1=mk8('label',null,'Sua função na loja (opcional)');const f=document.createElement('input');f.type='text';f.maxLength=30;f.placeholder='Ex.: Barbeiro, Vendedor';l1.append(f);
 const l2=mk8('label','ck');const ck=document.createElement('input');ck.type='checkbox';l2.append(ck,mk8('span',null,'Mostrar meu nome no perfil público da loja'));
 const st=mk8('p','note');st.setAttribute('role','status');
 const ac=mk8('div','perfil-acoes');
 ac.append(botao8('Enviar pedido','cta2 pa-main',async()=>{st.style.color='';st.textContent='Enviando…';const cd=(()=>{try{return JSON.parse(localStorage.getItem('mh_pedidos')||'{}')}catch(e){return {}}})(),ag=Date.now();
  if(cd[L.chave]&&ag-cd[L.chave]<864e5){st.style.color='var(--red)';st.textContent='Você já pediu para entrar nesta loja. Espere o dono responder. Dá para tentar de novo em 24 horas.';return}
  if(Object.values(cd).filter(t=>ag-t<864e5).length>=3){st.style.color='var(--red)';st.textContent='Você já fez 3 pedidos hoje. Tente amanhã.';return}
  if(!confirm('Enviar pedido para entrar na equipe de '+L.nome+'? O dono vai decidir.')){st.textContent='';return}
  const r=await chama8('/equipe/pedir',{chave:L.chave,funcao:f.value.trim(),publico:ck.checked});
  if(r.ok&&r.j&&r.j.ok){const r2=await chama8('/estabelecimentos/ver?chave='+encodeURIComponent(L.chave));cd[L.chave]=ag;try{localStorage.setItem('mh_pedidos',JSON.stringify(cd))}catch(e){}pintaLoja8(d,r2.j&&r2.j.ok?r2.j:L,'equipe','Pedido enviado. Agora é só esperar o dono aprovar.')}else{st.style.color='var(--red)';st.textContent=erro8(r)}}),
  botao8('Voltar','more',()=>pintaLoja8(d,L,'equipe')));
 d.append(l1,l2,st,ac)}
function formAvalLoja8(d,L){d.textContent='';d.append(mk8('h3',null,'Avaliar '+L.nome));
 let nt=5;const row=mk8('div');row.style.cssText='display:flex;gap:6px;margin:8px 0;flex-wrap:wrap';const bs=[];
 const pinta=()=>bs.forEach((x,k)=>{x.setAttribute('aria-pressed',String(k+1===nt));x.style.background=k+1===nt?'var(--gold)':'';x.style.color=k+1===nt?'#111':''});
 for(let i=1;i<=5;i++){const b=botao8('★ '+i,'more',()=>{nt=i;pinta()});bs.push(b);row.append(b)}pinta();
 const lb=mk8('label',null,'Comentário (opcional, até 140 letras)');const ti=document.createElement('input');ti.type='text';ti.maxLength=140;lb.append(ti);
 const st=mk8('p','note');st.setAttribute('role','status');
 const ac=mk8('div','perfil-acoes');
 ac.append(botao8('Enviar avaliação','cta2 pa-main',async()=>{st.style.color='';st.textContent='Enviando…';const r=await chama8('/avaliar',{chave:L.chave,estrelas:nt,comentario:ti.value.trim()});
  if(r.ok&&r.j&&r.j.ok){carregaV8();const r2=await chama8('/estabelecimentos/ver?chave='+encodeURIComponent(L.chave));pintaLoja8(d,r2.j&&r2.j.ok?r2.j:L,'aval','Avaliação enviada. Obrigado!')}else{st.style.color='var(--red)';st.textContent=erro8(r)}}),
  botao8('Voltar','more',()=>pintaLoja8(d,L,'equipe')));
 d.append(row,lb,mk8('p','note','O seu comentário e o seu nome aparecem para todo mundo no perfil da loja.'),st,ac)}

/* ===== v9: chat da loja (clientes <-> equipe) e chat interno ===== */
let chatTimer8=0;
function abrirChat8(d,L,canal,rot,voltar){clearInterval(chatTimer8);d.textContent='';
 const cab=mk8('div','v8row');cab.append(botao8('← Voltar','more',()=>{clearInterval(chatTimer8);voltar()}),mk8('b',null,rot));d.append(cab);
 const box=mk8('div','v8chat');box.setAttribute('aria-live','polite');d.append(box);
 const st=mk8('p','note');st.setAttribute('role','status');
 if(canal==='meu')st.textContent='A loja responde aqui. Ainda não há aviso no celular: volte mais tarde para ver a resposta.';
 let desde=0;const vistos=new Set();
 const pinta=its=>{its.forEach(m=>{if(vistos.has(m.id))return;vistos.add(m.id);if(m.ts>desde)desde=m.ts;
  const b=mk8('div','v8msg'+(m.mine?' eu':'')+(m.loja?' loja':''));b.append(mk8('b',null,(m.loja?'🏪 ':'')+m.nome),mk8('span',null,m.texto),mk8('small',null,new Date(m.ts).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})));box.append(b)});box.scrollTop=box.scrollHeight};
 const busca=async()=>{if(!d.open){clearInterval(chatTimer8);return}
  const r=await chama8('/loja/chat?chave='+encodeURIComponent(L.chave)+'&canal='+encodeURIComponent(canal)+'&desde='+desde);
  if(r.ok&&r.j&&r.j.ok)pinta(r.j.itens);else if(r.status===403||r.status===404){st.style.color='var(--red)';st.textContent=erro8(r);clearInterval(chatTimer8)}};
 const f=mk8('div','v8row');const i=document.createElement('input');i.type='text';i.maxLength=500;i.placeholder='Escreva a mensagem';i.setAttribute('aria-label','Mensagem');i.style.flex='1';
 const env=async()=>{const t=i.value.trim();if(!t)return;i.value='';st.style.color='';
  const r=await chama8('/loja/chat',{chave:L.chave,canal,texto:t});if(r.ok&&r.j&&r.j.ok){st.textContent='';busca()}else{i.value=t;st.style.color='var(--red)';st.textContent=erro8(r)}};
 i.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();env()}});
 f.append(i,botao8('Enviar','cta2',env));d.append(f,st);
 busca();chatTimer8=setInterval(()=>{if(!document.hidden)busca()},4000);setTimeout(()=>{try{i.focus()}catch(e){}},50)}
async function abrirThreads8(d,L){clearInterval(chatTimer8);d.textContent='';d.append(mk8('h3',null,'Atendimento · '+L.nome),mk8('p','note','Carregando…'));
 const r=await chama8('/loja/chat/threads?chave='+encodeURIComponent(L.chave));
 d.textContent='';d.append(mk8('h3',null,'Atendimento · '+L.nome));
 if(!r.ok||!(r.j&&r.j.ok)){d.append(mk8('p','note',erro8(r)))}
 else if(!r.j.itens.length)d.append(mk8('p','note','Nenhum cliente falou com a loja nos últimos 30 dias.'));
 else r.j.itens.forEach(t=>{const c=mk8('div','pcard');const inf=mk8('div','pinfo');
  inf.append(mk8('b',null,t.cliente),mk8('span','pw',(t.daLoja?'Você/equipe: ':'')+t.texto),mk8('span','pe',new Date(t.ultimo).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+(t.daLoja?'':' · aguardando resposta')));
  c.append(inf,botao8('Abrir','pcall',()=>abrirChat8(d,L,t.canal,t.cliente,()=>abrirThreads8(d,L))));d.append(c)});
 d.append(botao8('← Voltar à loja','more',()=>abrirLoja8(L.chave)))}
/* editor de horário (7 dias, até 2 faixas por dia) */
function horarioEditor8(h){const w=mk8('div','v8hor');const N=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
 const pausa=mk8('label','ck');const pk=document.createElement('input');pk.type='checkbox';pk.checked=!!(h&&h.p);pausa.append(pk,mk8('span',null,'Fechado temporariamente (férias, reforma...)'));w.append(pausa);
 const linhas=[];
 const ordem=[1,2,3,4,5,6,0];
 ordem.forEach(i=>{const r=mk8('div','v8hrow');const cb=document.createElement('input');cb.type='checkbox';cb.setAttribute('aria-label',N[i]+' aberto');
  const fx=((h&&h.d&&h.d[i])||[]);cb.checked=fx.length>0;
  const ins=[];for(let k=0;k<4;k++){const t=document.createElement('input');t.type='time';t.setAttribute('aria-label',N[i]+(k%2?' fecha ':' abre ')+(k<2?'(1ª faixa)':'(2ª faixa)'));const f=fx[k>>1];if(f)t.value=f.split('-')[k%2];ins.push(t)}
  r.append(cb,mk8('b',null,N[i]),ins[0],mk8('span',null,'às'),ins[1],mk8('span',null,'e'),ins[2],mk8('span',null,'às'),ins[3]);w.append(r);linhas.push({i,cb,ins})});
 w.append(botao8('Copiar a segunda para todos os dias','more',()=>{const m=linhas.find(l=>l.i===1);linhas.forEach(l=>{l.cb.checked=m.cb.checked;l.ins.forEach((t,k)=>t.value=m.ins[k].value)})}));
 w.append(mk8('p','note','Para quem fecha de madrugada, use 18:00 às 02:00. Deixe a 2ª faixa vazia se não tiver pausa.'));
 return{el:w,valor:()=>{const d=[[],[],[],[],[],[],[]];linhas.forEach(l=>{if(!l.cb.checked)return;const a=[];if(l.ins[0].value&&l.ins[1].value)a.push(l.ins[0].value+'-'+l.ins[1].value);if(l.ins[2].value&&l.ins[3].value)a.push(l.ins[2].value+'-'+l.ins[3].value);d[l.i]=a});return{p:pk.checked?1:0,d}}}}

/* ===== v8: Meu espaço profissional ===== */
function atualizaPapelLocal8(role,work){
 try{if(eu){eu.role=role;eu.work=work}}catch(e){}
 try{const k=String(eu&&eu.nome||'').toLowerCase();const acc=JSON.parse(localStorage.getItem('mh_acc')||'{}');if(k&&acc[k]){acc[k].role=role;acc[k].work=work;localStorage.setItem('mh_acc',JSON.stringify(acc))}}catch(e){}
 try{const o=JSON.parse(localStorage.getItem('mh_eu')||'null');if(o){o.role=role;o.work=work;localStorage.setItem('mh_eu',JSON.stringify(o))}}catch(e){}}
function logoRedim8(f){return new Promise((ok,err)=>{if(!f||!/^image\//.test(f.type))return err(new Error('Escolha uma imagem.'));
 const u=URL.createObjectURL(f),im=new Image();
 im.onload=()=>{try{const S=128,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d'),m=Math.min(im.width,im.height),sx=(im.width-m)/2,sy=(im.height-m)/2;g.fillStyle='#fff';g.fillRect(0,0,S,S);g.drawImage(im,sx,sy,m,m,0,0,S,S);URL.revokeObjectURL(u);
  let q=.7,r=c.toDataURL('image/jpeg',q);while(r.length>19000&&q>.25){q-=.08;r=c.toDataURL('image/jpeg',q)}
  r.length<=20000?ok(r):err(new Error('Imagem complexa demais. Tente outra.'))}catch(e){err(e)}};
 im.onerror=()=>{URL.revokeObjectURL(u);err(new Error('Não consegui abrir essa imagem.'))};im.src=u})}
function pick8(cat){const w=mk8('div','v8pick');
 const t=document.createElement('input');t.type='search';t.maxLength=40;t.className='v8grande';t.placeholder='Digite para buscar: eletricista, mecânico, barbeiro…';t.setAttribute('aria-label','Buscar ofício');t.autocomplete='off';
 const res=mk8('div','v8res');res.hidden=true;
 const dica=mk8('p','note','Não achou na lista? Escreva o seu ofício do jeito que quiser: o adm aprova antes de aparecer.');
 const EXPL={diarista:'Diarista: quem trabalha por diária (dia todo ou meio período) em serviços gerais, como ajudar em obra, mudança, capina e carregar peso. Não é limpeza: para limpeza, escolha Faxineira.',faxineira:'Faxineira: limpeza de casa, apartamento e comércio.','marido de aluguel':'Marido de aluguel: pequenos reparos e consertos de casa, como trocar chuveiro, regular porta, pendurar prateleira e montar móvel.'};
 const expl=mk8('p','note');expl.setAttribute('role','status');expl.hidden=true;
 const mostraExpl=v=>{const e=EXPL[String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()];expl.hidden=!e;expl.textContent=e||''};
 const norm2=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const pinta=()=>{res.textContent='';const q=norm2(t.value).trim();
  if(!q){res.hidden=true;return}
  const l=cat.filter(n=>norm2(n).includes(q)).sort((a,b)=>(norm2(a).startsWith(q)?0:1)-(norm2(b).startsWith(q)?0:1)||a.localeCompare(b,'pt-BR')).slice(0,8);
  l.forEach(n=>{const b=mk8('button','mhp-big',n);b.type='button';b.onclick=()=>{t.value=n;res.hidden=true;mostraExpl(n)};res.append(b)});
  if(!l.length)res.append(mk8('p','note','Nenhum ofício da lista com esse nome. Vai ser enviado como "Outro", para o adm aprovar.'));
  res.hidden=false};
 t.addEventListener('input',()=>{pinta();mostraExpl(t.value)});
 w.append(t,res,expl,dica);return{el:w,valor:()=>t.value.trim()}}
function trocasTxt8(t){
 if(t.gratis)return 'Você está nos primeiros 7 dias de Helper: trocar de ofício é grátis até '+dataBR8(t.gratisAte)+'.';
 if(t.restantes>0)return 'Você ainda pode trocar de ofício '+t.restantes+(t.restantes===1?' vez':' vezes')+' (limite de '+t.max+' por ano).';
 return 'As '+t.max+' trocas do ano acabaram. Libera de novo em '+dataBR8(t.liberaEm)+'.'}
let ESPV=null;
/* sem sessão no servidor (conta antiga ou sessão vencida): pede só o telefone e a senha, sem sair da página */
function pedeSenha8(f){
 let d=document.getElementById('senhaDlg8');if(d)d.remove();
 d=novoDlg8('Confirmar senha');d.id='senhaDlg8';
 d.append(mk8('h3',null,'Confirme sua senha'),mk8('p','note','Por segurança, digite o telefone e a senha da sua conta para continuar. É rapidinho.'));
 const l1=mk8('label',null,'Telefone');const t=document.createElement('input');t.type='tel';t.inputMode='tel';t.maxLength=20;t.placeholder='(66) 99999-9999';try{t.value=(window.MH_telDe&&MH_telDe(eu&&eu.nome))||''}catch(e){}l1.append(t);
 const l2=mk8('label',null,'Senha');const p=document.createElement('input');p.type='password';p.autocomplete='current-password';p.placeholder='Sua senha';l2.append(p);
 const st=mk8('p','note');st.setAttribute('role','status');
 const ir=async()=>{if(!window.MH_reentrar){st.style.color='var(--red)';st.textContent='Saia e entre na conta de novo.';return}st.style.color='';st.textContent='Entrando…';
  const r=await MH_reentrar(t.value,p.value);if(r.ok){d.close();d.remove();if(typeof f==='function')f();else abrirEspaco8(f)}else{st.style.color='var(--red)';st.textContent=r.msg}};
 p.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ir()}});
 d.append(l1,l2,st);const ac=mk8('div','perfil-acoes');ac.append(botao8('Entrar','cta2 pa-main',ir),botao8('Cancelar','more',()=>{d.close();d.remove()}));d.append(ac);
 d.showModal();setTimeout(()=>{try{(t.value?p:t).focus()}catch(e){}},50)}
async function abrirEspaco8(f){ESPV=(typeof f==='string')?f:null;
 if(!tk8()){pedeSenha8(f);return}
 const d=espDlg8||(espDlg8=novoDlg8('Meu espaço profissional'));d.textContent='';d.append(mk8('p','note','Carregando…'));if(!d.open)d.showModal();
 const r=await chama8('/perfil/meu');
 if(r.status===401){try{MH_API.setUsrTk('')}catch(e){}d.close();pedeSenha8(f);return}
 if(!r.ok||!(r.j&&r.j.ok)){d.textContent='';d.append(mk8('p','note',erro8(r)),botao8('Fechar','more',()=>d.close()));return}
 pintaEspaco8(d,r.j)}
function pintaEspaco8(d,E,aviso){d.textContent='';
 const st=mk8('p','note');st.setAttribute('role','status');if(aviso)st.textContent=/^[✅❌]/.test(aviso)?aviso:'✅ '+aviso;
 const cab=mk8('div','v8row v8cab');cab.style.justifyContent='space-between';cab.append(mk8('h3',null,'Meu espaço profissional'),botao8('✕ Fechar','more',()=>d.close()));
 d.append(cab,st);
 if(aviso)setTimeout(()=>{if(st.isConnected&&st.textContent===(/^[✅❌]/.test(aviso)?aviso:'✅ '+aviso))st.textContent=''},4500);
 const secs=[];const sec=(id,t,ic,go)=>{const s=mk8('section','v8sec');s.append(mk8('h4',null,t));secs.push({id,t,ic,s,go});return s};
 const helper=E.papel==='helper';
 const rec=async(msg)=>{const r=await chama8('/perfil/meu');if(r.ok&&r.j&&r.j.ok){pintaEspaco8(d,r.j,msg);carregaV8()}};
 const envia=async(path,body,okMsg)=>{st.style.color='';st.textContent='⏳ Salvando…';const r=await chama8(path,body);
  if(r.ok&&r.j&&r.j.ok){await rec(okMsg||'Salvo.');return r}
  st.style.color='var(--red)';st.textContent='❌ '+erro8(r);return r};
 const reload=(role,work)=>{atualizaPapelLocal8(role,work);let p=Promise.resolve();try{if(role==='helper'&&window.MH_DB&&MH_DB.virarHelper)p=Promise.race([MH_DB.virarHelper(eu.nome,work),new Promise(r=>setTimeout(r,2500))])}catch(e){}p.then(()=>location.reload())};

 {const s=sec('horarios','Meus horários','🗓',()=>{d.close();abrirHorarios8()});s.append(mk8('p','note','Veja os horários que você marcou'+(helper?' e quem marcou com você':'')+'.'),botao8('🗓 Abrir meus horários','cta2 v8go',()=>{d.close();abrirHorarios8()}))}
 /* 1. tipo de conta */
 {const s=sec('conta',helper?'Cliente ou Helper':'Minha conta','👤');
  if(!helper){
   s.append(mk8('p','note','Você é Cliente e pode continuar assim para sempre: não precisa fazer nada. Se quiser oferecer um serviço, vire Helper: é a mesma conta, com o mesmo telefone e senha.'));
   const pk=pick8(E.catalogo);const l2=mk8('label','ck');const ck=document.createElement('input');ck.type='checkbox';ck.checked=true;l2.append(ck,mk8('span',null,'Aparecer em "Profissionais da Região"'));
   s.append(pk.el,l2,botao8('Quero ser Helper','cta2',async()=>{const o=pk.valor();if(!o){st.style.color='var(--red)';st.textContent='Escolha o seu ofício.';return}
    st.style.color='';st.textContent='Salvando…';const r=await chama8('/perfil/virar-helper',{oficio:o,aparecer:ck.checked});
    if(r.ok&&r.j&&r.j.ok){st.textContent='Pronto! Agora você é Helper. Atualizando a página…';reload('helper',r.j.oficio||o)}else{st.style.color='var(--red)';st.textContent=erro8(r)}}))}
  else{
   s.append(mk8('p','note','Você é Helper. Se parar de oferecer serviço, pode voltar a ser Cliente: o seu perfil de Helper fica guardado (só deixa de aparecer) e volta se você quiser.'));
   if(E.favoritosRecebidos>0)s.append(mk8('p','note','⭐ '+E.favoritosRecebidos+(E.favoritosRecebidos===1?' pessoa favoritou':' pessoas favoritaram')+' você.'));
   const sh=mk8('span','note');sh.setAttribute('role','status');
   s.append(botao8('🔗 Compartilhar meu perfil','more',()=>compartilhar8(eu.nome+' no MiHelp',(eu.work||'Helper')+' · Barra do Garças e região',linkHelper8(eu.nome),m=>{sh.textContent=m;setTimeout(()=>sh.textContent='',2500)})),sh);
   s.append(botao2x8('Voltar a ser Cliente','more',async()=>{st.style.color='';st.textContent='Salvando…';const r=await chama8('/perfil/virar-cliente',{});
    if(r.ok&&r.j&&r.j.ok){st.textContent='Pronto. Atualizando a página…';reload('cliente','')}else{st.style.color='var(--red)';st.textContent=erro8(r)}}))}}

 /* 2. privacidade + ofícios (só Helper) */
 if(helper){
  {const s=sec('priv','Privacidade','🔒');
   const l=mk8('label','ck');const ck=document.createElement('input');ck.type='checkbox';ck.checked=!!E.aparecer;
   ck.onchange=()=>envia('/perfil/privacidade',{aparecer:ck.checked},ck.checked?'Agora você aparece em "Profissionais da Região".':'Você saiu da busca. Continua usando o app normalmente.');
   l.append(ck,mk8('span',null,'Aparecer em "Profissionais da Região"'));s.append(l);
   s.append(mk8('p','note','Desligado, ninguém acha você na busca. Você pode esconder só um ofício (abaixo) ou só uma loja (mais abaixo).'))}
  {const s=sec('pix','Pix do coração','💛');
   s.append(mk8('p','note','Opcional. Se colocar a sua chave Pix, quem estiver logado e gostar do seu trabalho pode te agradecer com um Pix. O MiHelp não cobra nem passa por esse dinheiro.'));
   const l=mk8('label',null,'Chave Pix (CPF, telefone, e-mail ou chave aleatória)');const i=document.createElement('input');i.type='text';i.maxLength=77;i.autocomplete='off';i.value=E.pix||'';l.append(i);
   s.append(l,botao8('💾 Salvar meu Pix','cta2',()=>envia('/perfil/pix',{chave:i.value},'Pix salvo.')));
   if(E.pix)s.append(botao8('Tirar meu Pix','more',()=>envia('/perfil/pix',{chave:''},'Pix removido.')))}
  {const s=sec('oficios','Meus ofícios ('+E.oficios.length+' de '+E.maxOficios+')','🛠');
   const bloqueado=!E.trocas.gratis&&E.trocas.restantes<=0;
   if(!E.oficios.length)s.append(mk8('p','note','Você ainda não tem ofício. Adicione um abaixo.'));
   E.oficios.forEach(o=>{
    const box=mk8('div','v8card');const row=mk8('div','v8row');row.append(mk8('b',null,o.n));
    if(o.pend)row.append(mk8('span','selo nao','esperando o adm'));
    const l=mk8('label','ck');const ck=document.createElement('input');ck.type='checkbox';ck.checked=!!o.v&&!o.pend;ck.disabled=o.pend;
    ck.onchange=()=>envia('/perfil/oficios',{acao:'visivel',de:o.n,v:ck.checked},ck.checked?'Ofício visível.':'Ofício escondido.');
    l.append(ck,mk8('span',null,'Mostrar'));row.append(l);
    const tr=botao8('Trocar','more',()=>{tr.disabled=true;const pk=pick8(E.catalogo);const conf=botao8('Confirmar troca','cta2',()=>{const v=pk.valor();if(!v){st.style.color='var(--red)';st.textContent='Escolha o novo ofício.';return}envia('/perfil/oficios',{acao:'trocar',de:o.n,nome:v},'Ofício trocado.')});box.append(pk.el,conf)});
    if(bloqueado&&!o.pend){tr.disabled=true;tr.title='Libera em '+dataBR8(E.trocas.liberaEm)}
    row.append(tr,botao2x8('Remover','more',()=>envia('/perfil/oficios',{acao:'remover',de:o.n},'Ofício removido.')));
    box.append(row);s.append(box)});
   s.append(mk8('p','note',trocasTxt8(E.trocas)+' Adicionar, remover e esconder não gastam troca.'));
   if(E.oficios.length<E.maxOficios){const pk=pick8(E.catalogo);s.append(pk.el,botao8('Adicionar ofício','more',()=>{const v=pk.valor();if(!v){st.style.color='var(--red)';st.textContent='Escolha o ofício.';return}envia('/perfil/oficios',{acao:'add',nome:v},'Ofício adicionado.')}))}}}


 /* 2b. lojas que alguém quer passar para mim */
 if(E.transferencias&&E.transferencias.length){const s=sec('transf','Lojas oferecidas a você ('+E.transferencias.length+')','🔁');
  E.transferencias.forEach(c=>{const box=mk8('div','v8card');box.append(mk8('p',null,'O dono atual quer passar a loja "'+c.estNome+'" para você.'));
   if(!helper)box.append(mk8('p','note','Para ficar com uma loja, vire Helper primeiro (em "Cliente ou Helper").'));
   const row=mk8('div','v8row');
   if(helper)row.append(botao8('Aceitar a loja','cta2',()=>envia('/estabelecimentos/transferir/responder',{id:c.id,aceitar:true},'A loja agora é sua! Veja em "Meus estabelecimentos". Por padrão o seu nome não aparece como dono; você muda em "Editar".')));
   row.append(botao8('Recusar','more',()=>envia('/estabelecimentos/transferir/responder',{id:c.id,aceitar:false},'Oferta recusada.')));
   box.append(row);s.append(box)})}

 /* 3. convites recebidos */
 if(E.convites.length){const s=sec('convites','Convites para equipes ('+E.convites.length+')','📨');
  E.convites.forEach(c=>{const box=mk8('div','v8card');box.append(mk8('p',null,c.estNome+' convidou você'+(c.funcao?' como '+c.funcao:'')+'.'));
   const l=mk8('label','ck');const ck=document.createElement('input');ck.type='checkbox';l.append(ck,mk8('span',null,'Mostrar meu nome no perfil público da loja'));
   const row=mk8('div','v8row');row.append(botao8('Aceitar','cta2',()=>envia('/equipe/responder',{id:c.id,aceitar:true,publico:ck.checked},'Você entrou na equipe.')),botao8('Recusar','more',()=>envia('/equipe/responder',{id:c.id,aceitar:false},'Convite recusado.')));
   box.append(l,row);s.append(box)})}

 /* 4. meus vínculos */
 if(E.vinculos.length){const s=sec('equipes','Minhas equipes','🤝');
  E.vinculos.forEach(v=>{const box=mk8('div','v8card');const row=mk8('div','v8row');row.append(mk8('b',null,v.estNome),mk8('span','note',(v.funcao?v.funcao+' · ':'')+(v.status==='pedido'?'esperando o dono aprovar':'na equipe')));
   if(v.status==='aceito'){const l=mk8('label','ck');const ck=document.createElement('input');ck.type='checkbox';ck.checked=!!v.publico;
    ck.onchange=()=>envia('/equipe/visibilidade',{id:v.id,publico:ck.checked},ck.checked?'Seu nome aparece no perfil da loja.':'Seu nome saiu do perfil público da loja.');
    l.append(ck,mk8('span',null,'Mostrar meu nome na equipe da loja'));row.append(l);row.append(mk8('p','note','Desligado, a loja continua aparecendo normal, com as avaliações e comentários, mas o seu nome e o seu perfil não ficam ligados a ela.'))}
   row.append(botao8('Ver','more',()=>{d.close();abrirLoja8(v.est)}),botao2x8(v.status==='pedido'?'Cancelar pedido':'Sair da equipe','more',()=>envia('/equipe/remover',{id:v.id},'Pronto.')));
   box.append(row);s.append(box)})}

 /* 5. minhas lojas (só Helper) */
 if(helper){const s=sec('lojas','Meus estabelecimentos','🏪');
  if(!E.lojas.length)s.append(mk8('p','note','Você ainda não criou nenhum. Barbearia, salão, loja de motos, oficina: crie e monte a sua equipe.'));
  E.lojas.forEach(L=>{
   const box=mk8('div','v8card');const row=mk8('div','v8row');row.append(mk8('b',null,L.nome),mk8('span','note',L.tipo+(CID8[L.cidade]?' · '+CID8[L.cidade]:'')));
   const acts=mk8('div','v8acts');acts.append(botao8('💰 Serviços e preços','more',()=>formServicos8(d,E,L)),botao8('👁 Ver perfil','more',()=>{d.close();abrirLoja8(L.chave)}),botao8('✏️ Editar','more',()=>formLoja8(d,E,L)),botao8('🔗 Compartilhar','more',()=>compartilhar8(L.nome+' no MiHelp',L.tipo,linkLoja8(L.chave),m=>{st.style.color='';st.textContent=m})),botao2x8('🗑 Apagar','more',()=>envia('/estabelecimentos/apagar',{chave:L.chave},'Estabelecimento apagado.')));
   box.append(row,acts);if(L.favs>0)box.append(mk8('p','note','⭐ '+L.favs+(L.favs===1?' pessoa favoritou':' pessoas favoritaram')+' esta loja.'));
   box.append(mk8('h4',null,'Equipe'));
   if(!L.equipe.length)box.append(mk8('p','note','Ninguém na equipe ainda. Convide pelo telefone abaixo.'));
   L.equipe.forEach(m=>{const r2=mk8('div','v8row');const rot=m.status==='aceito'?'na equipe'+(m.publico?'':' (oculto no perfil público)'):m.status==='pedido'?'pediu para entrar':'convite enviado, esperando aceite';
    r2.append(mk8('span',null,m.nome+(m.funcao?' · '+m.funcao:'')+(m.eu?' (você)':'')+' — '+rot));
    if(m.status==='pedido')r2.append(botao8('Aprovar','cta2',()=>envia('/equipe/responder',{id:m.id,aceitar:true},'Pessoa aprovada.')),botao8('Recusar','more',()=>envia('/equipe/responder',{id:m.id,aceitar:false},'Pedido recusado.')));
    else{
     if(m.status==='aceito'&&!m.eu){const sel=document.createElement('select');sel.setAttribute('aria-label','Cargo de '+m.nome);[['nenhum','Sem acesso ao chat'],['atendente','Atendente (clientes + equipe)'],['interno','Só chat da equipe']].forEach(([v,t])=>sel.add(new Option(t,v)));sel.value=m.cargo||'nenhum';const sv=botao8('💾 Salvar cargo','cta2',()=>envia('/equipe/cargo',{id:m.id,cargo:sel.value},'Cargo de '+m.nome+' salvo.'));sv.hidden=true;sel.onchange=()=>{sv.hidden=sel.value===(m.cargo||'nenhum')};r2.append(sel,sv)}
     r2.append(botao2x8('Remover','more',()=>envia('/equipe/remover',{id:m.id},'Removido.')))}
    box.append(r2)});
   const cv=mk8('div');cv.hidden=true;const l1=mk8('label',null,'Telefone da pessoa');const tel=document.createElement('input');tel.type='text';tel.inputMode='tel';tel.placeholder='(66) 99999-9999';tel.maxLength=20;l1.append(tel);
   const l2=mk8('label',null,'Função da pessoa (se quiser)');const fn=document.createElement('input');fn.type='text';fn.maxLength=30;fn.placeholder='Ex.: Barbeiro, Vendedor';l2.append(fn);
   cv.append(l1,l2,botao8('Enviar convite','cta2',()=>envia('/equipe/convidar',{chave:L.chave,tel:tel.value,funcao:fn.value.trim()},'Se esse telefone tiver conta no MiHelp, o convite aparece para a pessoa. Ela decide se aceita e se o nome dela aparece.')));
   box.append(botao8('➕ Chamar alguém para a equipe','more',()=>{cv.hidden=!cv.hidden}),cv);
   if(L.transferindoPara)box.append(mk8('p','note','🔁 Oferta de transferência enviada para '+L.transferindoPara+'. Esperando a resposta.'),botao8('Cancelar transferência','more',()=>envia('/estabelecimentos/transferir/responder',{id:L.transferId,aceitar:false},'Transferência cancelada.')));
   else{const tv=mk8('div');tv.hidden=true;const t1=mk8('label',null,'Telefone do novo dono (precisa ser Helper)');const ti=document.createElement('input');ti.type='text';ti.inputMode='tel';ti.maxLength=20;ti.placeholder='(66) 99999-9999';t1.append(ti);
    tv.append(mk8('p','note','A pessoa precisa aceitar. Quando aceitar, a loja passa a ser dela e você deixa de ser o dono. A equipe, as avaliações e os favoritos ficam na loja. Sai da loja quem era só o dono.'),t1,botao2x8('Oferecer a loja','cta2',()=>envia('/estabelecimentos/transferir',{chave:L.chave,tel:ti.value},'Se esse telefone for de um Helper, a oferta aparece para a pessoa. Ela decide se aceita.')));
    box.append(botao8('🔁 Passar a loja para outro Helper','more',()=>{tv.hidden=!tv.hidden}),tv)}
   s.append(box)});
  if(E.lojas.length<3)s.append(botao8('➕ Criar meu negócio','cta2 v8go',()=>criarLoja8(d,E)))}
 {const cur=ESPV&&secs.find(x=>x.id===ESPV);
  if(cur){d.append(botao8('← Voltar ao meu espaço','more',()=>{ESPV=null;pintaEspaco8(d,E)}),cur.s)}
  else{const g=mk8('div','mhp-g');secs.forEach(x=>{const b=document.createElement('button');b.type='button';const ic=document.createElement('span');ic.textContent=x.ic;b.append(ic,x.t);b.onclick=()=>{if(x.go){x.go();return}ESPV=x.id;pintaEspaco8(d,E)};g.append(b)});d.append(g)}}
 d.append(botao8('Fechar','more pa-close',()=>d.close()))}


/* ===== v10: reservas — serviços da loja, agenda do Helper, marcar horário e "Meus horários" ===== */
const DIAS8=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],DIASN8=['domingo','segunda','terça','quarta','quinta','sexta','sábado'],ORD8=[1,2,3,4,5,6,0];
const p28=n=>String(n).padStart(2,'0');
const hm8=m=>p28(Math.floor(m/60)%24)+':'+p28(m%60);
const tmin8=t=>+String(t).slice(0,2)*60+ +String(t).slice(3,5);
const brl8=v=>'R$ '+Number(v||0).toFixed(2).replace('.',',');
const durTxt8=m=>m<60?m+'min':(Math.floor(m/60)+'h'+(m%60?':'+p28(m%60)+'min':''));
const diaBR8=k=>{const q=String(k).split('-');return q[2]+'/'+q[1]+'/'+q[0]};
const dataLoc8=k=>{const q=String(k).split('-');return new Date(+q[0],+q[1]-1,+q[2])};
const chaveDia8=x=>x.getFullYear()+'-'+p28(x.getMonth()+1)+'-'+p28(x.getDate());
function resumoDias8(ds){const o=ORD8.filter(i=>ds.includes(i));if(!o.length)return 'nenhum dia';if(o.length===7)return 'todos os dias';
 const pos=o.map(i=>ORD8.indexOf(i)),seg=pos.every((x,k)=>k===0||x===pos[k-1]+1);
 return seg&&o.length>=3?'de '+DIASN8[o[0]]+' a '+DIASN8[o[o.length-1]]:o.map(i=>DIASN8[i]).join(', ')}
let agDlg8=null,horDlg8=null;

/* aba "Serviços" do perfil da loja: cada serviço com tempo, valor e o botão Reservar */
function painelServ8(pane,d,L){const sv=L.servicos||[];
 if(!sv.length){pane.append(mk8('p','note',L.souDono?'Você ainda não cadastrou serviços. Toque em "Gerenciar minha loja" e depois em "Serviços e preços".':'Esta loja ainda não cadastrou serviços.'));return}

 sv.forEach(s=>{const c=mk8('div','v8serv'),t=mk8('div','v8servinfo');
  t.append(mk8('b',null,s.nome),mk8('span','note','🕒 '+durTxt8(s.min)),mk8('span','note','💲 a partir de '+brl8(s.valor)));c.append(t);
  const b=botao8('📅 Reservar','cta2',()=>reservar8(d,L,{sv:s.id,pro:L._pro}));b.disabled=!eu;c.append(b);pane.append(c)})}

/* o passo a passo da reserva: serviço → profissional → dia → hora → confirmar */
function reservar8(d,L,pre){pre=pre||{};
 if(!L.logado){if(eu){pedeSenha8(()=>{try{d.close()}catch(e){}abrirLoja8(L.chave,{aba:'serv'})})}else pintaLoja8(d,L,'serv','Crie a sua conta ou entre para marcar um horário.');return}
 const R={cart:[],sv:null,pro:null,dia:'',info:null,tela:'serv',msg:'',busy:false,feito:null},svs=L.servicos||[];
 const pros=()=>(L.equipe||[]).filter(m=>m.helper!==false&&m.ag&&m.uid);
 function escolheServ(s){R.sv=s;R.dia='';R.info=null;const pn=pre.pro&&pros().find(m=>m.nome===pre.pro);pre.pro=null;
  if(pn){R.pro=pn;carrega()}else{R.pro=null;R.tela='prof';pinta()}}
 async function carrega(){R.tela='dia';R.info=null;R.dia='';pinta();
  const r=await chama8('/reservas/agenda?chave='+encodeURIComponent(L.chave)+'&uid='+encodeURIComponent(R.pro.uid));
  R.info=(r.ok&&r.j&&r.j.ok&&r.j.ag)?r.j:{vazio:true};if(R.tela==='dia')pinta()}
 function horas(){const a=R.info.ag,k=R.dia;if(!k||!a.dias.includes(dataLoc8(k).getDay()))return[];
  const oc=(R.info.ocupados[k]||[]).concat(R.cart.filter(c=>c.pro.uid===R.pro.uid&&c.dia===k).map(c=>[c.ini,c.ini+c.sv.min])),out=[];
  for(let t=tmin8(a.ini);t+R.sv.min<=tmin8(a.fim);t+=R.sv.min){if(k===R.info.hoje&&t<=R.info.agora)continue;if(oc.some(x=>t<x[1]&&t+R.sv.min>x[0]))continue;out.push(t)}return out}
 async function confirma(){if(R.busy)return;R.busy=true;R.msg='';pinta();
  const r=await chama8('/reservas',{chave:L.chave,itens:R.cart.map(c=>({uid:c.pro.uid,servico:c.sv.id,dia:c.dia,ini:c.ini}))});R.busy=false;
  if(r.ok&&r.j&&r.j.ok){R.feito=R.cart;R.cart=[];R.tela='ok'}else R.msg=erro8(r);pinta()}
 function pinta(){d.textContent='';
  const top=mk8('div','v8head');top.append(avatarLoja8(L,48));const hd=mk8('div');hd.append(mk8('p','note','Reservar em'),mk8('h3',null,L.nome));top.append(hd);d.append(top);
  if(R.tela==='serv'){d.append(mk8('p','v8passo','Escolha o serviço'));
   svs.forEach(s=>{const b=mk8('button','mhp-big');b.type='button';b.append(document.createTextNode(s.nome),mk8('small',null,durTxt8(s.min)+' · a partir de '+brl8(s.valor)));b.onclick=()=>escolheServ(s);d.append(b)});
   d.append(R.cart.length?botao8('← Voltar ao meu horário','more',()=>{R.tela='cart';pinta()}):botao8('← Voltar','more',()=>pintaLoja8(d,L,'serv')))}
  else if(R.tela==='prof'){d.append(mk8('p','note','Serviço selecionado: '+R.sv.nome),mk8('p','v8passo','Escolha o profissional'));
   const ps=pros(),todos=(L.equipe||[]).filter(m=>m.helper!==false);if(!ps.length)d.append(mk8('p','note','Ninguém está recebendo marcações agora. Você pode chamar a loja pela conversa.'));
   const g=mk8('div','v8pros');todos.forEach(m=>{const ok=ps.includes(m),b=mk8('button','v8pro');b.type='button';b.append(avatarEl(m.nome,52),mk8('span',null,m.nome));if(ok)b.onclick=()=>{R.pro=m;carrega()};else{b.disabled=true;b.style.opacity='.55';b.append(mk8('small',null,'agenda fechada'))}g.append(b)});
   d.append(g,botao8('← Trocar serviço','more',()=>{R.tela='serv';pinta()}))}
  else if(R.tela==='dia'){d.append(mk8('p','note','Serviço: '+R.sv.nome+' · Profissional: '+R.pro.nome));
   if(!R.info)d.append(mk8('p','note','Carregando horários…'));
   else if(R.info.vazio)d.append(mk8('p','note','Esse profissional não está recebendo marcações agora.'));
   else{const h0=dataLoc8(R.info.hoje);d.append(mk8('p','v8passo','Qual dia?'));const sd=mk8('div','v8dias');
    for(let i=0;i<14;i++){const x=new Date(h0.getFullYear(),h0.getMonth(),h0.getDate()+i),k=chaveDia8(x),w=x.getDay();
     const b=mk8('button','v8dia'+(R.dia===k?' on':'')+(R.info.ag.dias.includes(w)?'':' off'));b.type='button';
     b.append(mk8('small',null,i===0?'HOJE':i===1?'AMANHÃ':DIAS8[w].toUpperCase()),document.createTextNode(p28(x.getDate())+'/'+p28(x.getMonth()+1)));
     b.onclick=()=>{R.dia=k;pinta()};sd.append(b)}
    d.append(sd);
    if(R.dia){const hs=horas();d.append(mk8('p','v8passo','Que horas?'));
     if(!hs.length)d.append(mk8('p','note','Nenhum horário disponível nesse dia. Escolha outro dia.'));
     else{const gh=mk8('div','v8hrs hor');hs.forEach(t=>{const b=mk8('button','mhp-chip',hm8(t));b.type='button';b.onclick=()=>{R.cart.push({sv:R.sv,pro:R.pro,dia:R.dia,ini:t});R.tela='cart';R.msg='';pinta()};gh.append(b)});d.append(gh)}}}
   d.append(botao8('← Trocar profissional','more',()=>{R.tela='prof';pinta()}))}
  else if(R.tela==='cart'){d.append(mk8('p','v8passo','Seu horário'));
   R.cart.forEach((c,i)=>{const k=mk8('div','v8card');k.append(mk8('b',null,c.sv.nome),mk8('p','note','🕒 '+diaBR8(c.dia)+', '+hm8(c.ini)+' às '+hm8(c.ini+c.sv.min)),mk8('p','note','💲 a partir de '+brl8(c.sv.valor)),mk8('p','note','Profissional: '+c.pro.nome));
    k.append(botao8('🗑 Tirar','more',()=>{R.cart.splice(i,1);if(!R.cart.length)R.tela='serv';pinta()}));d.append(k)});
   if(R.cart.length>1)d.append(mk8('p','note','Total a partir de '+brl8(R.cart.reduce((a,c)=>a+c.sv.valor,0))));
   d.append(mk8('p','note','A reserva só marca o horário. O valor você combina na hora com o profissional.'));
   if(R.msg){const m=mk8('p','note','❌ '+R.msg);m.setAttribute('role','status');m.style.color='var(--red)';d.append(m)}
   if(R.cart.length<4)d.append(botao8('➕ Adicionar outro serviço','more',()=>{R.tela='serv';pinta()}));
   const ok=botao8(R.busy?'Marcando…':'✅ Confirmar reserva','cta2 v8go',confirma);ok.disabled=R.busy;d.append(ok)}
  else if(R.tela==='ok'){d.append(mk8('div','v8ok','✅'),mk8('p','v8passo','Horário marcado!'));
   R.feito.forEach(c=>d.append(mk8('p',null,c.sv.nome+' com '+c.pro.nome+' · '+diaBR8(c.dia)+' às '+hm8(c.ini))));
   d.append(mk8('p','note','O profissional já vê a sua reserva. Para cancelar, abra "Meus horários".'),botao8('🗓 Ver meus horários','more',()=>{d.close();abrirHorarios8()}))}
  d.append(botao8(R.tela==='ok'?'Fechar':'✕ Fechar','more pa-close',()=>d.close()))}
 const s0=pre.sv&&svs.find(x=>x.id===pre.sv);
 if(s0)escolheServ(s0);else pinta()}

/* Helper: dias e horário em que atende */
async function abrirAgenda8(){
 const d=agDlg8||(agDlg8=novoDlg8('Minha agenda'));d.textContent='';d.append(mk8('p','note','Carregando…'));if(!d.open)d.showModal();
 const r=await chama8('/perfil/meu');
 if(!r.ok||!(r.j&&r.j.ok)){d.textContent='';d.append(mk8('p','note',r.status===401?'Entre na conta de novo para abrir a agenda.':erro8(r)),botao8('Fechar','more',()=>d.close()));return}
 const E=r.j;
 if(E.papel!=='helper'){d.textContent='';d.append(mk8('h3',null,'Minha agenda'),mk8('p','note','Só quem é Helper tem agenda. Em "Meu espaço profissional" toque em "Quero ser Helper".'),botao8('Fechar','more',()=>d.close()));return}
 const A=Object.assign({on:1,dias:[1,2,3,4,5,6],ini:'09:00',fim:'17:00'},E.agenda||{});A.dias=(A.dias||[]).slice();
 const naLoja=(E.lojas||[]).length>0||(E.vinculos||[]).some(v=>v.status==='aceito');
 const st=mk8('p','note');st.setAttribute('role','status');
 const horas=[];for(let m=5*60;m<=23*60+30;m+=30)horas.push(hm8(m));
 const sel=(v,fn)=>{const x=document.createElement('select');horas.forEach(h=>x.add(new Option(h,h)));x.value=v;x.onchange=()=>fn(x.value);return x};
 async function salvar(){
  if(A.on&&!A.dias.length){st.style.color='var(--red)';st.textContent='❌ Escolha pelo menos um dia.';return}
  if(tmin8(A.fim)<=tmin8(A.ini)){st.style.color='var(--red)';st.textContent='❌ O horário de terminar precisa ser depois do de começar.';return}
  st.style.color='';st.textContent='⏳ Salvando…';
  const r2=await chama8('/agenda',{on:A.on?1:0,dias:A.dias,ini:A.ini,fim:A.fim});
  if(r2.ok&&r2.j&&r2.j.ok){st.textContent='✅ Agenda salva!';setTimeout(()=>{if(st.textContent==='✅ Agenda salva!')st.textContent=''},4000)}
  else{st.style.color='var(--red)';st.textContent='❌ '+erro8(r2)}}
 function pinta(){d.textContent='';
  const cab=mk8('div','v8row v8cab');cab.style.justifyContent='space-between';cab.append(mk8('h3',null,'📅 Minha agenda'),botao8('✕ Fechar','more',()=>d.close()));
  d.append(cab,st,mk8('p','note','Escolha quando você atende. Os clientes marcam pela página da loja onde você trabalha e só veem estes dias e horários.'));
  const g=mk8('div','v8big um'),tg=mk8('button',A.on?'on':'',A.on?'✅ Estou aceitando marcações':'⏸ Marcações pausadas');tg.type='button';tg.append(mk8('small',null,A.on?'Toque para pausar':'Toque para voltar a aceitar'));tg.onclick=()=>{A.on=A.on?0:1;pinta()};g.append(tg);d.append(g);
  d.append(mk8('div','v8resumo','Você atende '+resumoDias8(A.dias)+', das '+A.ini+' às '+A.fim+'.'));
  d.append(mk8('h4',null,'1. Dias que atendo'));const cd=mk8('div','v8hrs');
  DIAS8.forEach((n,i)=>{const b=mk8('button','mhp-chip'+(A.dias.includes(i)?' on':''),n);b.type='button';b.onclick=()=>{const k=A.dias.indexOf(i);k<0?A.dias.push(i):A.dias.splice(k,1);pinta()};cd.append(b)});d.append(cd);
  d.append(mk8('h4',null,'2. Horário'));
  const l1=mk8('label',null,'Começo às');l1.append(sel(A.ini,v=>{A.ini=v;pinta()}));const l2=mk8('label',null,'Termino às');l2.append(sel(A.fim,v=>{A.fim=v;pinta()}));d.append(l1,l2);
  d.append(botao8('💾 Salvar minha agenda','cta2 v8go',salvar));
  if(!naLoja)d.append(mk8('p','note','⚠ Você ainda não está na equipe de nenhuma loja. O cliente marca pela página da loja. Crie a sua em "Meu espaço profissional" (pode ser só você) ou peça para o dono da loja te chamar para a equipe.'));
  d.append(botao8('🗓 Ver quem marcou comigo','more',()=>{d.close();abrirHorarios8()}))}
 pinta()}

/* Meus horários: o que eu marquei e (se sou Helper) quem marcou comigo, com o perfil da pessoa */
async function abrirHorarios8(){
 const d=horDlg8||(horDlg8=novoDlg8('Meus horários'));d.textContent='';d.append(mk8('p','note','Carregando…'));if(!d.open)d.showModal();
 const r=await chama8('/reservas/minhas');
 if(!r.ok||!(r.j&&r.j.ok)){d.textContent='';d.append(mk8('p','note',r.status===401?'Entre na conta para ver os seus horários.':erro8(r)),botao8('Fechar','more',()=>d.close()));return}
 const J=r.j,hoje=dataLoc8(chaveDia8(new Date()));
 const rot=k=>{const dt=dataLoc8(k),dif=Math.round((dt-hoje)/86400000);return (dif===0?'Hoje':dif===1?'Amanhã':DIAS8[dt.getDay()])+' '+p28(dt.getDate())+'/'+p28(dt.getMonth()+1)};
 const st=mk8('p','note');st.setAttribute('role','status');
 const cancela=x=>botao2x8('Cancelar horário','more',async()=>{const r2=await chama8('/reservas/cancelar',{id:x.id});if(r2.ok&&r2.j&&r2.j.ok)abrirHorarios8();else{st.style.color='var(--red)';st.textContent='❌ '+erro8(r2)}});
 const cab=mk8('div','v8row v8cab');cab.style.justifyContent='space-between';cab.append(mk8('h3',null,'🗓 Meus horários'),botao8('✕ Fechar','more',()=>d.close()));
 d.textContent='';d.append(cab,st);
 const ehHelper=(J.comoHelper||[]).length>0||(eu&&eu.role==='helper');
 if(ehHelper){d.append(mk8('h4',null,'Quem marcou comigo'));
  if(!J.comoHelper.length)d.append(mk8('p','note','Ninguém marcou com você ainda.'));
  J.comoHelper.forEach(x=>{const c=mk8('div','v8card');c.append(mk8('b',null,rot(x.dia)+' · '+hm8(x.ini)+' às '+hm8(x.ini+x.min)),mk8('p','note',x.servico+' · '+brl8(x.valor)+(x.estNome?' · '+x.estNome:'')),mk8('p',null,'👤 '+x.clienteNome));
   const ln=mk8('div','v8lin'),pp={nome:x.clienteNome,role:'cliente',work:''};
   ln.append(botao8('👤 Ver perfil e avaliações','more',()=>{d.close();chamarHelper(pp)}),botao8('💬 Privado','more',()=>{d.close();chamarHelper(pp);try{abrirPrivado(x.clienteNome)}catch(e){}}),cancela(x));c.append(ln);d.append(c)})}
 d.append(mk8('h4',null,'Horários que eu marquei'));
 if(!J.comoCliente.length)d.append(mk8('p','note','Você não tem horário marcado. Abra uma loja, toque em "Serviços" e depois em "Reservar".'));
 J.comoCliente.forEach(x=>{const c=mk8('div','v8card');c.append(mk8('b',null,rot(x.dia)+' · '+hm8(x.ini)+' às '+hm8(x.ini+x.min)),mk8('p','note',x.servico+' · '+brl8(x.valor)),mk8('p',null,'Com '+x.helperNome+(x.estNome?' · '+x.estNome:'')));
  const ln=mk8('div','v8lin');ln.append(botao8('👤 Ver perfil','more',()=>{d.close();chamarHelper({nome:x.helperNome,role:'helper',work:''})}),cancela(x));c.append(ln);d.append(c)});
 d.append(botao8('Fechar','more pa-close',()=>d.close()))}

/* dono da loja: serviços e valores (um cardápio só para a loja) */
function formServicos8(d,E,L,aviso){d.textContent='';
 const st=mk8('p','note');st.setAttribute('role','status');if(aviso)st.textContent=aviso;
 const cab=mk8('div','v8row v8cab');cab.style.justifyContent='space-between';cab.append(mk8('h3',null,'💰 Serviços de '+L.nome),botao8('✕ Fechar','more',()=>d.close()));
 d.append(cab,st,mk8('p','note','Cadastre o que a sua loja faz. O cliente escolhe o serviço, depois o profissional e o horário. Todos da equipe usam esta mesma lista.'));
 const lista=(L.servicos||[]).map(s=>({nome:s.nome,min:s.min,valor:s.valor}));if(!lista.length)lista.push({nome:'',min:30,valor:0});
 const box=mk8('div');d.append(box);
 const MINS=[15,30,45,60,75,90,120,150,180,240];
 function pinta(foco){box.textContent='';
  lista.forEach((s,i)=>{const c=mk8('div','v8card');c.append(mk8('h4',null,'Serviço '+(i+1)));
   const l1=mk8('label',null,'Nome do serviço'),n=document.createElement('input');n.type='text';n.maxLength=50;n.placeholder='Ex.: Corte, Barba, Escova';n.value=s.nome;n.oninput=()=>{s.nome=n.value};l1.append(n);
   const l2=mk8('label',null,'Quanto tempo dura'),m=document.createElement('select');(MINS.includes(s.min)?MINS:MINS.concat([s.min]).sort((a,b)=>a-b)).forEach(x=>m.add(new Option(durTxt8(x),x)));m.value=s.min;m.onchange=()=>{s.min=+m.value};l2.append(m);
   const l3=mk8('label',null,'Valor (R$)'),v=document.createElement('input');v.type='text';v.inputMode='decimal';v.maxLength=9;v.placeholder='Ex.: 25,00';v.value=s.valor?String(s.valor).replace('.',','):'';v.oninput=()=>{s.valor=Number(String(v.value).replace(',','.'))||0};l3.append(v);
   c.append(l1,l2,l3,botao2x8('🗑 Tirar este serviço','more',()=>{lista.splice(i,1);pinta()}));box.append(c);if(foco&&i===lista.length-1)setTimeout(()=>{try{n.focus()}catch(e){}},50)})}
 pinta();
 if(lista.length<20)d.append(botao8('➕ Adicionar serviço','more',()=>{lista.push({nome:'',min:30,valor:0});pinta(true)}));
 d.append(botao8('💾 Salvar serviços','cta2 v8go',async()=>{
  const limpa=lista.filter(s=>String(s.nome).trim().length>=2);
  st.style.color='';st.textContent='⏳ Salvando…';
  const r=await chama8('/estabelecimentos/servicos',{chave:L.chave,servicos:limpa.map(s=>({nome:String(s.nome).trim(),min:s.min,valor:s.valor}))});
  if(r.ok&&r.j&&r.j.ok){carregaV8();const r2=await chama8('/perfil/meu');if(r2.ok&&r2.j&&r2.j.ok)pintaEspaco8(d,r2.j,'Serviços salvos! Agora o cliente já pode reservar.');else abrirEspaco8('lojas')}
  else{st.style.color='var(--red)';st.textContent='❌ '+erro8(r)}}),botao8('← Voltar','more',()=>abrirEspaco8('lojas')))}

/* no perfil do Helper: no próprio perfil, atalho para a agenda; no dos outros, onde marcar horário */
/* Cheers para o Helper: o Pix só aparece para quem está logado e o Helper escolheu mostrar */
function blocoPix8(pes){
 const h=(window.MH_PROS||[]).find(x=>x.nome===pes.nome);if(!h||!h.pix||!h.uid)return null;
 const w=mk8('div','mhp-emb');w.append(mk8('h4',null,'💛 Agradecer com um Pix'),mk8('p','mhp-m','Gostou do trabalho? Agradeça direto no Pix dele. É por sua conta: o MiHelp não cobra nem guarda esse dinheiro.'));
 const out=mk8('p','note');out.setAttribute('role','status');
 const b=mk8('button','cta2 mhp-go','💛 Ver o Pix');b.type='button';
 b.onclick=async()=>{if(!tk8()){out.textContent='Entre na sua conta para ver o Pix.';return}
  b.disabled=true;const r=await chama8('/perfil/pix?uid='+encodeURIComponent(h.uid));b.disabled=false;
  if(r.ok&&r.j&&r.j.ok&&r.j.pix){out.textContent='Pix de '+(r.j.nome||pes.nome)+': ';out.append(mk8('code',null,r.j.pix),document.createTextNode(' '));
   out.append(botao8('Copiar','more',async()=>{try{await navigator.clipboard.writeText(r.j.pix);out.append(document.createTextNode(' Copiado!'))}catch(e){out.append(document.createTextNode(' Selecione e copie.'))}}))}
  else out.textContent=r.ok&&r.j&&r.j.ok?'Esse Helper tirou o Pix.':erro8(r)};
 w.append(b,out);return w}
function blocoReserva8(pes,meu,fechar){
 const w=mk8('div','mhp-emb');
 if(meu){w.append(mk8('h4',null,'📅 Minha agenda'),mk8('p','mhp-m','Defina os dias e horários em que você atende. Os clientes marcam pela página da sua loja.'));
  const b=mk8('button','cta2 mhp-go','📅 Abrir minha agenda');b.type='button';b.onclick=()=>{fechar();abrirAgenda8()};w.append(b);return w}
 const h=(window.MH_PROS||[]).find(x=>x.nome===pes.nome),lj=((h&&h.lojas)||[]).filter(l=>{const o=(V8.lojas||[]).find(x=>x.chave===l.chave);return o&&o.modo==='agenda'});
 if(!lj.length)return null;
 w.append(mk8('h4',null,'📅 Marcar horário'),mk8('p','mhp-m','Escolha o serviço, o dia e a hora.'));
 lj.forEach(l=>{const b=mk8('button','cta2 mhp-go','📅 Marcar em '+l.nome);b.type='button';b.onclick=()=>{fechar();abrirLoja8(l.chave,{aba:'serv',pro:pes.nome})};w.append(b)});
 return w}

const TIPOS_EXTRA8=['Construtora','Empreiteira'];
const tiposLoja8=E=>{const l=(E&&E.tipos||[]).slice();TIPOS_EXTRA8.forEach(t=>{if(!l.includes(t)){const i=l.indexOf('Construção e reformas');l.splice(i>=0?i+1:l.length,0,t)}});return l};
/* ===== criar negócio em passos (um toque por tela) ===== */
function criarLoja8(d,E){
 const S={n:1,nome:'',tipo:'',cidade:'',modo:'contato',atende:true,envio:false,donoVisivel:false,invest:false,equipeVisivel:true},TOT=6;
 const st=mk8('p','note');st.setAttribute('role','status');
 function pinta(){d.textContent='';
  const topo=mk8('div','v8row v8cab');topo.style.justifyContent='space-between';topo.append(mk8('h3',null,'Criar meu negócio'),botao8('✕ Fechar','more',()=>d.close()));
  d.append(topo,mk8('p','note','Passo '+S.n+' de '+TOT));
  const volta=botao8('← Voltar','more',()=>{if(S.n>1){S.n--;pinta()}else abrirEspaco8('lojas')});
  const opcoes=(lista,atual,fn,um)=>{const g=mk8('div','v8big'+(um?' um':''));lista.forEach(o=>{const b=mk8('button',atual===o[0]?'on':'',o[1]);b.type='button';if(o[2]){const sm=mk8('small',null,o[2]);b.append(sm)}b.onclick=()=>fn(o[0]);g.append(b)});return g};
  const prox=()=>{S.n++;pinta()};
  if(S.n===1){d.append(mk8('p','v8passo','Qual é o nome do seu negócio?'));
   const i=document.createElement('input');i.type='text';i.maxLength=60;i.className='v8grande';i.placeholder='Ex.: Barbearia do João';i.value=S.nome;i.setAttribute('aria-label','Nome do negócio');
   const ir=botao8('Continuar →','cta2 v8go',()=>{S.nome=i.value.trim();prox()});ir.disabled=i.value.trim().length<2;
   i.oninput=()=>{ir.disabled=i.value.trim().length<2};i.addEventListener('keydown',e=>{if(e.key==='Enter'&&!ir.disabled){e.preventDefault();ir.click()}});
   d.append(i,ir);setTimeout(()=>{try{i.focus()}catch(e){}},50)}
  else if(S.n===2){d.append(mk8('p','v8passo','Que tipo de negócio é?'));
   const bq=document.createElement('input');bq.type='search';bq.className='v8grande';bq.placeholder='Buscar: pastelaria, assistência de celular, mecânica…';bq.setAttribute('aria-label','Buscar tipo de negócio');
   const cx=mk8('div');cx.style.cssText='max-height:48vh;overflow:auto;margin:8px 0';
   const lis=()=>{cx.textContent='';const q=norm(bq.value).trim();const l=tiposLoja8(E).filter(t=>!q||norm(t).includes(q));
    if(!l.length)cx.append(mk8('p','note','Nada com esse nome. Escolha "Outro" e conte no nome do negócio o que ele faz.'));
    cx.append(opcoes(l.concat(l.includes('Outro')||(q&&'outro'.indexOf(q)<0)?[]:['Outro']).map(t=>[t,t]),S.tipo,v=>{S.tipo=v;prox()},true))};
   bq.oninput=lis;d.append(bq,cx);lis()}
  else if(S.n===3){d.append(mk8('p','v8passo','Em qual cidade fica?'),opcoes(Object.keys(E.cidades).map(k=>[k,E.cidades[k]]),S.cidade,v=>{S.cidade=v;prox()},true))}
  else if(S.n===4){d.append(mk8('p','v8passo','Como o cliente vai falar com vocês?'),opcoes([['contato','💬 Por conversa','O cliente toca em Chamar e fala com vocês'],['agenda','📅 Marcando horário','O cliente escolhe o dia e a hora com cada profissional']],S.modo,v=>{S.modo=v;prox()},true))}
  else if(S.n===5){d.append(mk8('p','v8passo','Você também trabalha nesse lugar?'),mk8('p','note','Se sim, o seu nome aparece na equipe.'),opcoes([['s','✅ Sim, eu atendo aqui'],['n','Não, só sou o dono']],S.atende?'s':'n',v=>{S.atende=v==='s';prox()},true))}
  else{d.append(mk8('p','v8passo','Confere se está certo'));
   const r=mk8('div','v8resumo');[['Nome',S.nome],['Tipo',S.tipo],['Cidade',E.cidades[S.cidade]||S.cidade],['Clientes falam',S.modo==='agenda'?'Marcando horário':'Por conversa'],['Você atende aí',S.atende?'Sim':'Não']].forEach(x=>{const l=document.createElement('div');const b=document.createElement('b');b.textContent=x[0]+': ';l.append(b,document.createTextNode(x[1]));r.append(l)});
   const ckb=(txt,val,fn)=>{const l=mk8('label','ck');const c=document.createElement('input');c.type='checkbox';c.checked=val;c.onchange=()=>fn(c.checked);l.append(c,mk8('span',null,txt));return l};
   d.append(r,ckb('Mostrar o meu nome como dono no perfil da loja',S.donoVisivel,v=>{S.donoVisivel=v}),mk8('p','note','Desmarcado, você só registra a loja e o seu nome não aparece como dono. Dá para mudar depois.'),(S.modo==='contato'?ckb('Mostrar a equipe no perfil da loja',S.equipeVisivel,v=>{S.equipeVisivel=v}):mk8('p','note','Loja com agenda mostra os profissionais, para o cliente escolher com quem marcar.')),mk8('p','note','Desmarcando o dono e a equipe, o perfil mostra só a loja, as avaliações e os comentários.'),ckb('Aceito conversar com quem quiser investir',S.invest,v=>{S.invest=v}),mk8('p','note','Cada um combina direto com o outro. O MiHelp não intermedia investimento.'),mk8('p','note','Depois você pode colocar endereço, WhatsApp, logo e horário tocando em "Editar".'),st);
   const ok=botao8('✅ Criar meu negócio','cta2 v8go',async()=>{if(S.envio)return;S.envio=true;ok.disabled=true;st.style.color='';st.textContent='Criando…';
    const body={nome:S.nome,tipo:S.tipo,cidade:S.cidade,endereco:'',mapa:'',contato:'',modo:S.modo,descricao:'',chat:true,horario:horarioEditor8(null).valor(),atende:S.atende,funcao:'',donoVisivel:S.donoVisivel,invest:S.invest,equipeVisivel:S.equipeVisivel};
    const r2=await chama8('/estabelecimentos',body);
    if(r2.ok&&r2.j&&r2.j.ok){carregaV8();const r3=await chama8('/perfil/meu');if(r3.ok&&r3.j&&r3.j.ok){const nl=(r3.j.lojas||[]).find(x=>x.chave===r2.j.chave);if(S.modo==='agenda'&&nl)formServicos8(d,r3.j,nl,'✅ Negócio criado! Agora cadastre os serviços para o cliente poder reservar.');else pintaEspaco8(d,r3.j,'Pronto! Seu negócio foi criado. Agora chame a sua equipe.')}else abrirEspaco8()}
    else{S.envio=false;ok.disabled=false;st.style.color='var(--red)';st.textContent=erro8(r2)}});
   d.append(ok)}
  if(S.n!==1||true)d.append(volta)}
 pinta()}
function formLoja8(d,E,L){d.textContent='';d.append(mk8('h3',null,L?'Editar '+L.nome:'Criar estabelecimento'));
 const st=mk8('p','note');st.setAttribute('role','status');
 let alvo=d;
 const campo=(rot,tipo,max,val,ph)=>{const l=mk8('label',null,rot);const i=document.createElement('input');i.type=tipo||'text';i.maxLength=max||60;i.value=val||'';if(ph)i.placeholder=ph;l.append(i);alvo.append(l);return i};
 const lista=(rot,opts,val)=>{const l=mk8('label',null,rot);const s=document.createElement('select');opts.forEach(([v,t])=>s.add(new Option(t,v)));s.value=val;l.append(s);alvo.append(l);return s};
 const nome=campo('Nome do estabelecimento','text',60,L&&L.nome,'Ex.: Social Clube');
 const tipo=(()=>{const tipos=tiposLoja8(E);let val=L&&tipos.includes(L.tipo)?L.tipo:tipos[0];
  const l=mk8('label',null,'Tipo de negócio (toque para trocar)');const cur=mk8('p','v8sel');const q=document.createElement('input');q.type='search';q.placeholder='Buscar: pastelaria, mecânica, salão…';q.setAttribute('aria-label','Buscar tipo de negócio');q.autocomplete='off';
  const res=mk8('div','v8res');res.hidden=true;const n2=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const mostra=()=>{cur.textContent='✅ Escolhido: '+val};
  q.oninput=()=>{res.textContent='';const k=n2(q.value).trim();if(!k){res.hidden=true;return}
   const m=tipos.filter(t=>n2(t).includes(k)).slice(0,10);
   m.forEach(t=>{const b=mk8('button','mhp-big',t);b.type='button';b.onclick=()=>{val=t;q.value='';res.hidden=true;mostra()};res.append(b)});
   if(!m.length)res.append(mk8('p','note','Nada com esse nome. Escolha "Outro" e diga o que faz no nome do negócio.'));res.hidden=false};
  mostra();l.append(q);alvo.append(l,cur,res);return{get value(){return val}}})();
 const cid=lista('Cidade',Object.keys(E.cidades).map(k=>[k,E.cidades[k]]),L?L.cidade:'barra-do-garcas');
 const modo=lista('Como o cliente fala com a equipe',[['contato','Conversa (botão Chamar)'],['agenda','Marcando horário (o cliente escolhe dia e hora)']],L?L.modo:'contato');
 const det=document.createElement('details');det.append(mk8('summary',null,'➕ Mais informações (só se quiser)'));d.append(det);alvo=det;
 const end=campo('Endereço (opcional)','text',100,L&&L.endereco,'Rua, número, bairro');
 const mapa=campo('Link do mapa (opcional)','text',300,L&&L.mapa,'https://maps.google.com/...');
 const wa=campo('WhatsApp da loja (opcional)','text',20,L&&L.contato,'(66) 99999-9999');
 const desc=campo('Descrição curta (opcional)','text',200,L&&L.descricao,'Horário, especialidades…');
 const lf=mk8('label',null,'Logo (opcional)');const fi=document.createElement('input');fi.type='file';fi.accept='image/*';lf.append(fi);det.append(lf);
 let logo;fi.onchange=async()=>{const f=fi.files[0];if(!f)return;try{logo=await logoRedim8(f);st.style.color='';st.textContent='Logo pronto.'}catch(e){logo=undefined;st.style.color='var(--red)';st.textContent=e.message||'Não consegui usar a imagem.'}};
 const chatCk=mk8('label','ck');const chatIn=document.createElement('input');chatIn.type='checkbox';chatIn.checked=L?L.chat!==0:true;chatCk.append(chatIn,mk8('span',null,'Receber conversas de clientes no perfil da loja (chat de atendimento)'));det.append(chatCk);
 const donoCk=mk8('label','ck');const donoIn=document.createElement('input');donoIn.type='checkbox';donoIn.checked=L?!!L.donoVisivel:false;donoCk.append(donoIn,mk8('span',null,'Mostrar o meu nome como dono no perfil da loja'));det.append(donoCk);
 const eqCk=mk8('label','ck');const eqIn=document.createElement('input');eqIn.type='checkbox';eqIn.checked=L?L.equipeVisivel!==0:true;eqCk.append(eqIn,mk8('span',null,'Mostrar a equipe no perfil da loja (só lojas de conversa; loja com agenda sempre mostra)'));det.append(eqCk);
 const invCk=mk8('label','ck');const invIn=document.createElement('input');invIn.type='checkbox';invIn.checked=!!(L&&L.invest);invCk.append(invIn,mk8('span',null,'Aceito conversar com quem quiser investir'));det.append(invCk);
 const invL=mk8('label',null,'O que você diz a quem quer investir (opcional)');const invT=document.createElement('input');invT.type='text';invT.maxLength=200;invT.placeholder='Ex.: Quero ampliar a oficina; converso com quem se interessar';invT.value=(L&&L.invest&&L.invest!=='Aceito conversar com quem quiser investir.')?L.invest:'';invL.append(invT);det.append(invL);det.append(mk8('p','note','Quem investe combina tudo direto com você. O MiHelp não intermedia, não garante retorno e não recebe nada.'));
 det.append(mk8('h4',null,'Horário de funcionamento (opcional)'));const hed=horarioEditor8(L&&L.horario);det.append(hed.el);alvo=d;
 let atende,fun;
 if(!L){const l=mk8('label','ck');atende=document.createElement('input');atende.type='checkbox';l.append(atende,mk8('span',null,'Eu também atendo aqui (aparece o meu nome na equipe)'));d.append(l);fun=campo('Minha função (opcional)','text',30,'','Ex.: Barbeiro, Dono')}
 d.append(st);
 const ac=mk8('div','perfil-acoes');
 ac.append(botao8('Salvar','cta2 pa-main',async()=>{st.style.color='';st.textContent='Salvando…';
  const body={nome:nome.value.trim(),tipo:tipo.value,cidade:cid.value,endereco:end.value.trim(),mapa:mapa.value.trim(),contato:wa.value,modo:modo.value,descricao:desc.value.trim(),chat:chatIn.checked,horario:hed.valor(),donoVisivel:donoIn.checked,equipeVisivel:eqIn.checked,invest:invIn.checked,investTxt:invT.value.trim()};
  if(logo!==undefined)body.logo=logo;
  if(L)body.chave=L.chave;else{body.atende=atende.checked;body.funcao=fun.value.trim()}
  const r=await chama8(L?'/estabelecimentos/editar':'/estabelecimentos',body);
  if(r.ok&&r.j&&r.j.ok){carregaV8();const r2=await chama8('/perfil/meu');if(r2.ok&&r2.j&&r2.j.ok)pintaEspaco8(d,r2.j,L?'Estabelecimento atualizado.':'Estabelecimento criado! Agora convide a sua equipe.')}
  else{st.style.color='var(--red)';st.textContent=erro8(r)}}),
  botao8('Voltar','more',()=>abrirEspaco8('lojas')));
 d.append(ac)}

/* ===== v8: admin (ofícios "Outro" e trocas) ===== */
async function abrirAdmOficios8(){
 const d=admDlg8||(admDlg8=novoDlg8('Administração de ofícios'));d.textContent='';d.append(mk8('p','note','Carregando…'));if(!d.open)d.showModal();
 const r=await MH_API.req('/admin/oficios',{token:MH_API.admTk()});
 d.textContent='';d.append(mk8('h3',null,'Ofícios esperando aprovação'));
 const st=mk8('p','note');st.setAttribute('role','status');d.append(st);
 if(!r.ok||!(r.j&&r.j.ok)){st.style.color='var(--red)';st.textContent=erro8(r);d.append(botao8('Fechar','more',()=>d.close()));return}
 if(!r.j.itens.length)d.append(mk8('p','note','Nenhum ofício pendente.'));
 const dec=async(it,aprovar,como)=>{const bd={tel:it.tel,oficio:it.oficio,aprovar};if(aprovar&&como&&como!==it.oficio)bd.como=como;const x=await MH_API.req('/admin/oficios/decidir',{token:MH_API.admTk(),body:bd});if(x.ok){abrirAdmOficios8();carregaV8()}else{st.style.color='var(--red)';st.textContent=erro8(x)}};
 if(r.j.itens.length)d.append(mk8('p','note','Dica: se o ofício já existe na lista, troque o nome (ex.: "Pintor") antes de aprovar.'));
 r.j.itens.forEach(it=>{const row=mk8('div','v8card v8row');const ip=document.createElement('input');ip.type='text';ip.maxLength=60;ip.value=it.oficio;ip.setAttribute('aria-label','Ofício que vai aparecer');row.append(mk8('span',null,it.nome+' pediu: '),mk8('b',null,it.oficio),ip,botao8('Aprovar','cta2',()=>dec(it,true,ip.value.trim())),botao8('Recusar','more',()=>dec(it,false)));d.append(row)});
 d.append(mk8('h4',null,'Liberar trocas de ofício (força maior)'));
 const l=mk8('label',null,'Telefone da conta');const tel=document.createElement('input');tel.type='text';tel.inputMode='tel';tel.maxLength=20;l.append(tel);
 d.append(l,botao8('Zerar as trocas dessa conta','more',async()=>{const x=await MH_API.req('/admin/oficios/liberar',{token:MH_API.admTk(),body:{tel:tel.value}});st.style.color=x.ok?'':'var(--red)';st.textContent=x.ok?'Trocas liberadas.':erro8(x)}));
 d.append(botao8('Fechar','more pa-close',()=>d.close()))}

/* ===== v8: admin — mudar tipo (Helper/Cliente) e ofício de uma pessoa ===== */
async function abrirAdmPessoas8(){
 const d=admDlg8||(admDlg8=novoDlg8('Administração'));d.textContent='';
 d.append(mk8('h3',null,'Mudar tipo ou ofício de uma pessoa'));
 const st=mk8('p','note');st.setAttribute('role','status');
 const l=mk8('label',null,'Nome ou telefone');const q=document.createElement('input');q.type='text';q.maxLength=40;l.append(q);
 const res=mk8('div');
 const busca=async()=>{res.textContent='';st.style.color='';st.textContent='Buscando…';
  const r=await MH_API.req('/admin/usuarios?q='+encodeURIComponent(q.value.trim()),{token:MH_API.admTk()});
  if(!r.ok||!(r.j&&r.j.ok)){st.style.color='var(--red)';st.textContent=erro8(r);return}
  st.textContent=r.j.itens.length?'':'Ninguém encontrado.';
  r.j.itens.forEach(u=>{const row=mk8('div','v8card');row.append(mk8('b',null,u.nome),mk8('span','note',' · '+(u.tel||'')+' · '+(u.papel==='helper'?'Helper':'Cliente')+(u.oficio?' · '+u.oficio:'')));
   const sel=document.createElement('select');sel.setAttribute('aria-label','Tipo da conta');[['helper','Helper'],['cliente','Cliente']].forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;if(v===u.papel)o.selected=true;sel.append(o)});
   const of=document.createElement('input');of.type='text';of.maxLength=60;of.value=u.oficio||'';of.placeholder='Ofício (ex.: Pintor)';of.setAttribute('aria-label','Ofício');
   row.append(sel,of,botao8('Salvar','cta2',async()=>{const x=await MH_API.req('/admin/usuario/mudar',{token:MH_API.admTk(),body:{tel:u.tel,papel:sel.value,oficio:of.value.trim()}});st.style.color=x.ok?'':'var(--red)';st.textContent=x.ok?'Pronto, salvo.':erro8(x);if(x.ok)carregaV8()}));res.append(row)})};
 q.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();busca()}});
 d.append(l,botao8('Buscar','cta2',busca),st,res,botao8('Fechar','more pa-close',()=>d.close()));if(!d.open)d.showModal()}


function pessoa(nome){return (eu&&eu.nome===nome)?eu:(por(nome)||REAIS[nome])}
function avaliar(alvo,nota_,txt){const l=AV[alvo.nome]=AV[alvo.nome]||[];const i=l.findIndex(x=>x[0]===eu.nome);const r=[eu.nome,nota_,txt];if(i>=0)l[i]=r;else l.push(r);try{if(window.MH_DB&&MH_DB.ok)MH_DB.avaliar(alvo.nome,eu.nome,nota_,txt)}catch(x){}}
let pfDlg=null;
function mhCtx(){return{eu:eu,espaco:abrirEspaco8,agenda:abrirAgenda8,horarios:abrirHorarios8,share:()=>compartilhar8(eu.nome+' no MiHelp',(eu.work||'Helper')+' · Barra do Garças e região',linkHelper8(eu.nome),m=>MH_PAINEL.toast(m)),qr:()=>qrHelper8(eu.nome,eu.work)}}
function abrirPerfil(nome,forca){
const pes=pessoa(nome)||(forca?{nome,role:'helper',work:''}:null);if(!pes)return;fecharHover();
if(!pfDlg){pfDlg=document.createElement('dialog');pfDlg.setAttribute('aria-label','Perfil');document.body.append(pfDlg);pfDlg.addEventListener('click',e=>{if(e.target===pfDlg)pfDlg.close()})}
const d=pfDlg;d.textContent='';const meu=eu&&pes===eu;
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
d.append(avatarEl(pes.nome,72));d.append(mk('h3',0,pes.nome+(meu?' (você)':'')));
d.append(mk('p','note',papelTxt(pes)+(pes.bot?' · bot de demonstração':'')));
if(pes.role==='helper'){const sp=mk('p');sp.style.margin='4px 0';sp.append(selo(pes.nome));d.append(sp)}
{const sb=window.MH_SELOS&&MH_SELOS.bloco('p:'+pes.nome,pes.nome);if(sb)d.append(sb)}
d.append(mk('p','status-line','● '+stLabel(pes)));
if(FRASE[pes.nome]){const fq=mk('p','note','“'+FRASE[pes.nome]+'”');fq.style.fontStyle='italic';d.append(fq)}
const r=resumo(pes.nome);
if(r){d.append(mk('p','stars',estr(Math.round(r.m))+'  '+r.m.toFixed(1).replace('.',',')+' · '+r.n+(r.n>1?' avaliações':' avaliação')))}
else{const q=mk('p','stars','☆☆☆☆☆ · ainda sem avaliação');d.append(q);d.append(mk('span','badge-novo','Novo na feira'))}
if(pes.bot)d.append(mk('p','note','Avaliações de exemplo, com notas inventadas para mostrar como vai funcionar.'));
{const se=selosEl(pes.nome);if(se)d.append(se)}
if(pes.role==='helper'&&!pes.bot){try{const bx=blocoReserva8(pes,meu,()=>d.close());if(bx)d.append(bx)}catch(x){}
 if(!meu){try{const bp=blocoPix8(pes);if(bp)d.append(bp)}catch(x){}}}
if(pes.role==='helper'){const ph=mk('div');d.append(ph);const pr=()=>{const e=portfolioEl(pes.nome);ph.textContent='';if(e)ph.append(e)};if(meu)carregarPortLocal();pr();if(!meu)carregaPort(pes.nome).then(()=>{if(d.open)pr()})}
d.append(mk('h4',0,pes.role==='helper'?'Comentários sobre o trabalho':'Comentários sobre o cliente'));
const l=AV[pes.nome]||[];
if(!l.length)d.append(mk('p','note','Ainda não tem comentários.'));
l.slice().reverse().forEach(x=>{const [de,n,t0]=x,a2=av2(t0),t=a2.txt;const b=mk('div','dep');b.append(mk('b',0,de+' · '+estr(n)+(a2.tags.length?' · '+a2.tags.join(', '):'')));b.append(document.createElement('br'),document.createTextNode(t||'(sem comentário)'));if(window.MH_depAdm&&document.body.classList.contains('adm'))window.MH_depAdm(pes,x,b);d.append(b)});
const ac=mk('div','perfil-acoes');
if(!meu){
 const pv=mk('button','cta2 pa-main','💬 Falar no privado');pv.type='button';pv.onclick=()=>{d.close();abrirPrivado(pes.nome)};ac.append(pv);
 if(eu){const fv=mk('button','more pa-sec',ehFav(pes.nome)?'★ Nos favoritos':'☆ Favoritar');fv.type='button';fv.setAttribute('aria-pressed',String(ehFav(pes.nome)));
  fv.onclick=()=>{const on=togFav(pes.nome);try{favSrv8(pes.nome,on)}catch(x){}fv.textContent=on?'★ Nos favoritos':'☆ Favoritar';fv.setAttribute('aria-pressed',String(on))};ac.append(fv);
  const can=conversou.has(pes.nome)||QRAV.has(pes.nome);
  const av=mk('button','more pa-sec','⭐ Avaliar');av.type='button';av.disabled=!can;av.onclick=()=>formAval(pes);ac.append(av);
  if(!can)d.append(mk('p','note','Para avaliar, converse com a pessoa no privado primeiro. Assim só avalia quem falou com ela.'))}
 else d.append(mk('p','note','Cadastre-se para conversar e avaliar.'))
}else d.append(mk('p','note','Assim as outras pessoas veem o seu perfil.'+(l.length?' Nesta prévia, as avaliações vêm de bots de demonstração.':' A média aparece depois das primeiras avaliações.')));
if(pes.role==='helper'&&!pes.bot&&window.MH_API&&MH_API.on()){const sh=mk('button','more pa-sec','🔗 Compartilhar');sh.type='button';sh.onclick=()=>compartilhar8(pes.nome+' no MiHelp',(pes.work||'Helper')+' · Barra do Garças e região',linkHelper8(pes.nome),m=>{sh.textContent=m;setTimeout(()=>{sh.textContent='🔗 Compartilhar'},2500)});ac.append(sh)}
const fc=mk('button','more pa-close','Fechar');fc.type='button';fc.onclick=()=>d.close();ac.append(fc);d.append(ac);
if(window.MH_perfilAdm&&document.body.classList.contains('adm'))window.MH_perfilAdm(pes,d);
d.showModal()}
function formAval(pes){const d=pfDlg;d.textContent='';
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
d.append(mk('h3',0,'Avaliar '+pes.nome));
let nt=5;const row=mk('div');row.style.cssText='display:flex;gap:6px;margin:8px 0';
const bs=[];for(let i=1;i<=5;i++){const b=mk('button','more','★ '+i);b.type='button';b.setAttribute('aria-pressed',i===nt);b.onclick=()=>{nt=i;bs.forEach((x,k)=>{x.setAttribute('aria-pressed',k+1===nt);x.style.background=k+1===nt?'var(--gold)':'';x.style.color=k+1===nt?'#111':''})};bs.push(b);row.append(b)}
bs[4].style.background='var(--gold)';bs[4].style.color='#111';d.append(row);
const lb=mk('label',0,'Comentário (opcional, até 80 letras)');lb.htmlFor='avt';const ti=document.createElement('input');ti.id='avt';ti.type='text';ti.maxLength=80;
const sl=mk('p','note','Selinhos (opcional):');sl.style.margin='8px 0 4px';
const sw=mk('div');sw.style.cssText='display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px';const esc=new Set();
SELOS.forEach(s=>{const b=mk('button','more',s);b.type='button';b.setAttribute('aria-pressed','false');
  b.onclick=()=>{if(esc.has(s)){esc.delete(s);b.setAttribute('aria-pressed','false');b.style.background='';b.style.color=''}else{esc.add(s);b.setAttribute('aria-pressed','true');b.style.background='var(--gold)';b.style.color='#111'}};sw.append(b)});
d.append(sl,sw,lb,ti);
const ac=mk('div');ac.style.cssText='display:flex;gap:8px;margin-top:14px';
const ok=mk('button','cta2','Enviar avaliação');ok.type='button';ok.onclick=()=>{avaliar(pes,nt,(esc.size?'¦'+[...esc].join(',')+'¦ ':'')+ti.value.trim());abrirPerfil(pes.nome)};
const ca=mk('button','more','Voltar');ca.type='button';ca.onclick=()=>abrirPerfil(pes.nome);ac.append(ok,ca);d.append(ac);ti.focus()}
// cartãozinho ao passar o mouse
let hc=null,ht=null;
function fecharHover(){clearTimeout(ht);if(hc)hc.hidden=true}
document.addEventListener('mouseover',e=>{const b=e.target.closest&&e.target.closest('[data-u]');if(!b||!matchMedia('(hover:hover)').matches)return;
clearTimeout(ht);ht=setTimeout(()=>{const pes=pessoa(b.dataset.u);if(!pes)return;
if(!hc){hc=document.createElement('div');hc.style.cssText='position:fixed;z-index:200;background:var(--surf);border:1px solid var(--gold);border-radius:10px;padding:8px 10px;font-size:13px;max-width:240px;pointer-events:none;box-shadow:0 6px 18px rgba(0,0,0,.5)';document.body.append(hc)}
const r=resumo(pes.nome);hc.textContent=pes.nome+' · '+(pes.role==='helper'?pes.work:'Cliente')+' · '+(r?'★ '+r.m.toFixed(1).replace('.',',')+' ('+r.n+')':'Novo na feira')+'. Clique para ver o perfil.';
const q=b.getBoundingClientRect();hc.hidden=false;hc.style.left=Math.min(q.left,innerWidth-250)+'px';hc.style.top=(q.bottom+6)+'px'},350)});
document.addEventListener('mouseout',e=>{if(e.target.closest&&e.target.closest('[data-u]'))fecharHover()});
document.addEventListener('scroll',fecharHover,true);
function aoFalarPrivado(c){if(!por(c)||!eu)return;msgsPriv[c]=(msgsPriv[c]||0)+1;
if(msgsPriv[c]===3&&!(AV[eu.nome]||[]).some(x=>x[0]===c))depois(4500,()=>{if(!painel[c])return;
const l=AV[eu.nome]=AV[eu.nome]||[];l.push([c,rnd([4,5,5]),rnd(['Conversa tranquila e educada.','Respondeu rápido.','Fácil de combinar.'])]);
renderMeuPerfil(true);nota(painel[c],'*** '+c+' (bot) deixou uma avaliação no seu perfil. Clique no seu nome para ver ***')})}
// ---- cadastro ----
function atualizarPapel(){const h=document.querySelector('input[name=r]:checked').value==='Helper';$('trab').hidden=!h;$('w').required=h}
document.querySelectorAll('input[name=r]').forEach(r=>r.addEventListener('change',atualizarPapel));
function mostrarErroCad(msg){
  const el=$('ferr');
  if(el){el.style.display='block';el.textContent=msg;}
  else alert(msg);
}
function liberarChatForcado(){
  try{atualizarSosCount()}catch(e){}
  ['m','nudge','sbtn'].forEach(id=>{
    const el=$(id);
    if(el){ el.disabled=false; el.removeAttribute('disabled'); }
  });
  const cr=$('catRow'); if(cr){ cr.hidden=false; cr.removeAttribute('hidden'); }
  try{desenharOnline();}catch(e){}
  try{mostrar(ativa||'sala');}catch(e){}
  if(typeof atualizarSosCount==='function') try{atualizarSosCount();}catch(e){}
  const mi=$('m');
  if(mi){ mi.placeholder='Digite aqui'; try{mi.focus();}catch(e){} }
}
const ST={disponivel:'Disponível',ocupado:'Ocupado'};
const stLabel=p=>ST[p.status||'disponivel']||'Fora da sala agora';
function atualizarQuadrado(){
  const q=$('perfSq');if(!q)return;
  const fechado=document.querySelector('.grid').classList.contains('perfil-fechado');
  q.hidden=!(eu&&fechado);if(!eu)return;
  q.dataset.st=eu.status||'disponivel';
  q.title='Meu perfil · '+stLabel(eu)+'. Clique para abrir.';
  q.setAttribute('aria-label',q.title)}
function fecharPerfilJanela(){
  document.querySelector('.grid').classList.add('perfil-fechado');
  atualizarQuadrado()}
function abrirPerfilJanela(){
  const cw=$('cw');if(cw.classList.contains('full')){const x=$('cwExp');if(x)x.click()}
  document.querySelector('.grid').classList.remove('perfil-fechado');
  const q=$('perfSq');if(q)q.classList.remove('novo');
  atualizarQuadrado();
  const w=$('cadWin');if(w)w.scrollIntoView({behavior:'smooth',block:'nearest'})}
{const q=$('perfSq');if(q)q.addEventListener('click',abrirPerfilJanela)}
/* painel do Cliente: atalhos + próximos horários marcados */
function painelCliente8(){const w=mk8('div','mhp-tiles');w.append(mk8('h4',null,'Meu painel'));
 const g=mk8('div','mhp-g');
 [['🗓','Meus agendamentos',()=>abrirHorarios8()],['🔒','Conta e privacidade',()=>abrirEspaco8('conta')],['🤝','Minhas equipes',()=>abrirEspaco8('equipes')]].forEach(x=>{const b=document.createElement('button');b.type='button';const i=document.createElement('span');i.textContent=x[0];b.append(i,x[1]);b.onclick=x[2];g.append(b)});
 w.append(g);
 const box=mk8('div');w.append(box);
 if(apiOn8()&&tk8()){chama8('/reservas/minhas').then(r=>{if(!r.ok||!(r.j&&r.j.ok))return;const l=(r.j.comoCliente||[]).slice(0,3);
  box.append(mk8('h4',null,'Onde estou agendado'));
  if(!l.length){box.append(mk8('p','note','Nenhum horário marcado. Abra uma loja, toque em "Serviços" e depois em "Reservar".'));return}
  l.forEach(x=>{const c=mk8('div','v8card');c.append(mk8('b',null,diaBR8(x.dia)+' · '+hm8(x.ini)+' às '+hm8(x.ini+x.min)),mk8('p','note',x.servico+' · '+brl8(x.valor)),mk8('p',null,'📍 '+(x.estNome?x.estNome+' · ':'')+'com '+x.helperNome));box.append(c)})}).catch(()=>{})}
 return w}
function renderMeuPerfil(novo){
  const reg=$('reg'); if(!reg||!eu) return;
  if(FRASE[eu.nome]==null){try{const fv=localStorage.getItem('mh_frase:'+eu.nome.toLowerCase());if(fv)FRASE[eu.nome]=fv}catch(e){}}
  const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
  const bar=reg.parentElement&&reg.parentElement.querySelector('.bar .t'); if(bar) bar.textContent='meu perfil';
  const bi=reg.parentElement.querySelectorAll('.bar i'),red=bi[bi.length-1];
  if(red&&!red.dataset.ok){red.dataset.ok='1';red.className='fechavel';red.setAttribute('role','button');red.tabIndex=0;red.setAttribute('aria-label','Fechar perfil');red.title='Fechar (vira uma aba no chat)';red.onclick=fecharPerfilJanela;red.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fecharPerfilJanela()}}}
  if(novo&&document.querySelector('.grid').classList.contains('perfil-fechado')){const q=$('perfSq');if(q)q.classList.add('novo')}
  reg.textContent=''; reg.classList.add('meu-perfil');
  if(!window._mhBv){window._mhBv=1;const tm=mk('div','term','> acesso liberado.\nBem-vindo(a), '+eu.nome+'!\nJá pode conversar na sala ao lado.');reg.append(tm);setTimeout(()=>{try{tm.remove()}catch(e){}},7000)}
  const mhHd=mk('div','mhp-hd');mhHd.append(mk('h3',0,eu.nome));reg.append(mhHd);
  reg.append(mk('p','note',papelTxt(eu)));
  if(FOTO[eu.nome]==null){try{const f=localStorage.getItem('mh_foto:'+eu.nome.toLowerCase());if(f&&fotoOk(f))FOTO[eu.nome]=f}catch(e){}}
  {const card=mk('div','pf-card'),side=mk('div','pf-side'),main=mk('div','pf-main');
   const fi=document.createElement('input');fi.type='file';fi.accept='image/*';fi.hidden=true;
   const bt=mk('button','avt-btn');bt.type='button';bt.setAttribute('aria-label',FOTO[eu.nome]?'Trocar minha foto':'Colocar minha foto');bt.title=FOTO[eu.nome]?'Trocar foto':'Colocar foto';const cam=mk('span','avt-cam','📷');cam.setAttribute('aria-hidden','true');bt.append(avatarEl(eu.nome,80),cam);bt.onclick=()=>fi.click();
   const em=mk('p','note');em.setAttribute('role','status');
   fi.onchange=async()=>{const f=fi.files[0];fi.value='';if(!f)return;try{const u=await fotoRedim(f);const pr=definirFoto(eu.nome,u);renderMeuPerfil();fotoStatus(null,true);const ok=await pr;fotoStatus(ok)}catch(x){em.textContent=x.message||'Não consegui usar essa foto.'}};
   side.append(bt,fi);
   if(FOTO[eu.nome]){const rm=mk('button','avt-rm','Remover foto');rm.type='button';rm.onclick=()=>{definirFoto(eu.nome,'');renderMeuPerfil()};side.append(rm)}
   /* avaliações ao lado da foto */
   const rs=resumo(eu.nome),rt=mk('div','pf-rate');
   if(rs){rt.append(mk('span','stars',estr(Math.round(rs.m))),mk('span','pf-n',rs.m.toFixed(1).replace('.',',')+' · '+rs.n+(rs.n>1?' avaliações':' avaliação')))}
   else{rt.append(mk('span','stars','☆☆☆☆☆'),mk('span','pf-n','ainda sem avaliação'),mk('span','badge-novo','Novo na feira'))}
   main.append(rt);
   if(eu.role==='helper')main.append(selo(eu.nome));
   /* frase em uma linha: toque no lápis, escreva e aperte Enter */
   const fr=mk('div','fr-bar');
   const desenhaFr=()=>{fr.textContent='';const v=FRASE[eu.nome]||'';
    const fb=mk('button','fr-btn');fb.type='button';fb.setAttribute('aria-label','Editar minha frase');
    const ic=mk('span','fr-ic','✏️');ic.setAttribute('aria-hidden','true');
    fb.append(ic,mk('span','fr-tx'+(v?'':' vazio'),v||'Escreva uma frase'));
    fb.onclick=editaFr;fr.append(fb)};
   const editaFr=()=>{fr.textContent='';
    const inp=document.createElement('input');inp.type='text';inp.maxLength=60;inp.className='fr-in';inp.value=FRASE[eu.nome]||'';inp.placeholder='Ex.: Pintor há 10 anos, orçamento sem compromisso';inp.setAttribute('aria-label','Minha frase do perfil');
    let feito=false;
    const salvar=()=>{if(feito)return;feito=true;const v=inp.value.trim().slice(0,60);
     if(v!==(FRASE[eu.nome]||'')){FRASE[eu.nome]=v;try{localStorage.setItem('mh_frase:'+eu.nome.toLowerCase(),v)}catch(e){}try{if(window.MH_DB&&MH_DB.ok)MH_DB.frase(v)}catch(e){}}
     desenhaFr()};
    inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();salvar()}else if(e.key==='Escape'){e.preventDefault();feito=true;desenhaFr()}});
    inp.addEventListener('blur',salvar);
    fr.append(inp);inp.focus();inp.select()};
   desenhaFr();main.append(fr);
   card.append(side,main);reg.append(card,em);
   if(eu.role==='helper')reg.append(mk('p','note',FOTO[eu.nome]?'Sua foto está pronta. O selo ✔ Verificado é dado pelo ADM, de graça.':'Sem foto você não pode receber o selo ✔ Verificado. Coloque uma foto do seu rosto.'))}
  if(eu.role==='helper'&&window.MH_PAINEL)reg.append(MH_PAINEL.tiles(mhCtx()));if(eu.role==='helper')reg.append(editorPortfolio());
  if(eu.role!=='helper')reg.append(painelCliente8());
  const sr=mk('div','st-row');sr.setAttribute('role','group');sr.setAttribute('aria-label','Meu status');
  Object.keys(ST).forEach(k=>{const b=mk('button','st-btn',ST[k]);b.type='button';b.dataset.s=k;b.setAttribute('aria-pressed',(eu.status||'disponivel')===k?'true':'false');
    b.onclick=()=>{eu.status=k;renderMeuPerfil();atualizarQuadrado();desenharOnline()};sr.append(b)});
  mhHd.append(sr);
  {const se=selosEl(eu.nome);if(se)reg.append(se)}
  reg.append(mk('h4',0,eu.role==='helper'?'Comentários sobre o seu trabalho':'Comentários sobre você'));
  const l=AV[eu.nome]||[];
  if(!l.length) reg.append(mk('p','note','Ainda não tem comentários. Converse com alguém no privado para começar.'));
  l.slice().reverse().forEach(([de,n,t0])=>{const a2=av2(t0),t=a2.txt;const b=mk('div','dep');b.append(mk('b',0,de+' · '+estr(n)+(a2.tags.length?' · '+a2.tags.join(', '):'')));b.append(document.createElement('br'),document.createTextNode(t||'(sem comentário)'));reg.append(b)});
  {const fl=favs();reg.append(mk('h4',0,'Meus favoritos ('+fl.length+')'));
   if(!fl.length)reg.append(mk('p','note','Ainda não tem ninguém. Abra o perfil de uma pessoa e toque em "Favoritar".'));
   else{const w=mk('div');w.style.cssText='display:flex;flex-wrap:wrap;gap:6px 12px';fl.forEach(n=>{const b=mk('button','nm','★ '+n);b.type='button';b.dataset.u=n;w.append(b)});reg.append(w)}
   reg.append(mk('p','note','Os favoritos ficam salvos só neste aparelho e só você vê.'))}
  reg.append(mk('p','note','Assim as outras pessoas veem o seu perfil. Nesta prévia, as avaliações vêm de bots de demonstração, com notas inventadas.'));
  if(eu.role==='helper'&&window.MH_PAINEL)MH_PAINEL.organiza(reg);
}
function fazerCadastro(e){
  if(e) e.preventDefault();
  try{
    const ferr=$('ferr'); if(ferr){ferr.style.display='none';ferr.textContent='';}
    const r=document.querySelector('input[name=r]:checked');
    if(!r){mostrarErroCad('Escolha: Sou Cliente ou Sou Helper.');return false;}
    const nRaw=$('n')?$('n').value:'';
    const n=nomeCurto(nRaw);
    if(!n){mostrarErroCad('Digite seu nome.');if($('n'))$('n').focus();return false;}
    const tel=($('t')&&$('t').value||'').trim();
    if(tel.length<8){mostrarErroCad('Digite um telefone válido (com DDD).');if($('t'))$('t').focus();return false;}
    const em=($('e')&&$('e').value||'').trim();
    if(!em || em.indexOf('@')<1){mostrarErroCad('Digite um e-mail válido.');if($('e'))$('e').focus();return false;}
    const ace=$('aceite');
    if(ace && !ace.checked){mostrarErroCad('Marque a caixinha de aceite para continuar.');ace.focus();return false;}
    const pw=($('pw')&&$('pw').value)||'';if(pw.length<6){mostrarErroCad('Crie uma senha com pelo menos 6 caracteres.');if($('pw'))$('pw').focus();return false;}
    const role=r.value==='Helper'?'helper':'cliente';
    const work=role==='helper'?trabCurto(($('w')&&$('w').value)||''):'';
    if(role==='helper'&&!work){mostrarErroCad('Diga com o que você trabalha.');if($('w'))$('w').focus();return false;}
    let nome=n;for(let k=2;(PESSOAS.some(p=>p.nome===nome)||(window.MH_DB&&MH_DB.tem(nome)))&&k<50;k++)nome=n+' ('+k+')';
    eu={nome,role,work,status:'disponivel'};
    try{window.MH_conta&&MH_conta.criar({nome,role,work,tel,em},pw)}catch(x){}
    try{if(window.MH_DB)MH_DB.cadastrar({nome,role,work,tel,em})}catch(x){console.error(x)}
    renderMeuPerfil();
    liberarChatForcado();
    if(typeof liberarChat==='function'){ try{liberarChat();}catch(err){console.error(err);liberarChatForcado();} }
    // garante de novo após 50ms (alguns browsers re-desabilitam)
    setTimeout(liberarChatForcado, 50);
    setTimeout(liberarChatForcado, 300);
    
    if(BOTS)depois(1300,()=>{
      try{
        if(role==='helper')fala(painel.sala,'Ana C.',nome+', bem-vindo(a)! Você trabalha com '+work.toLowerCase()+'? Tem gente procurando por aqui.');
        else fala(painel.sala,'Carla M.',nome+', bem-vindo(a)! Se precisar de alguém, é só falar na sala.');
      }catch(e){}
    });
    return true;
  }catch(err){
    console.error('MiHelp cadastro:',err);
    mostrarErroCad('Erro no cadastro: '+err.message+'. Abra o Console (F12) e me envie a mensagem vermelha.');
    return false;
  }
}
$('f').addEventListener('submit',fazerCadastro);
const btnCad=$('btnCad');
if(btnCad) btnCad.addEventListener('click',function(ev){ fazerCadastro(ev); });

function respBot(nome,v){const b=por(nome);if(!BOTS||!b||bloqueados.has(nome))return;
depois(1500+Math.random()*1500,()=>{if(bloqueados.has(nome))return;linha(painel.sala,b,eu.nome+', '+rnd(['entendi! Me conta mais detalhes.','combinado. Se preferir, me chama no privado.','boa! Pode contar comigo.']),{nome:eu.nome,texto:v.slice(0,60)})})}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button.rp');if(!b)return;
if(!eu){nota(painel[ativa]||painel.sala,'*** cadastre-se para responder ***');return}
respA={nome:b.dataset.rp,texto:b.dataset.tx};mostrarResp();$('m').focus()});
$('rpX').addEventListener('click',()=>{respA=null;mostrarResp();$('m').focus()});
const SALAS=[['sala','Geral','conversa livre e SOS. Para vender ou procurar serviço, use as outras salas.'],['r:classificados','Classificados','compra, venda e troca. Não pague antes de ver o item. Nada ilegal.'],['r:amizade','Amizade','bate-papo e conhecer gente. Sem oferta de serviço ou venda.'],['r:construcao','Construção e reformas','pedreiro, pintura, elétrica e orçamento. Combine o preço por escrito.'],['r:vagas','Vagas e bicos','diárias e trabalho temporário. Diga o que é, o valor e o dia.'],['r:cozinha','Cozinha','restaurantes, lanchonetes e padarias da cidade: cardápio do dia, promoção e horário. Uma publicação por vez, sem repetir a mesma mensagem.'],['r:doacao-moveis','Doação de móveis','só doação, de graça: móveis e eletrodomésticos. Diga o item, o estado e o bairro. Combine a retirada em local público.'],['r:doacao-pets','Doação de pets','adoção responsável: conte sobre o bichinho, vacinas e castração. Não é para vender animais. Combine a entrega em local público.'],['r:barra','Barra do Garças','conversa e avisos de Barra do Garças. Respeite os vizinhos e não repita a mesma mensagem.'],['r:pontal','Pontal do Araguaia','conversa e avisos de Pontal do Araguaia. Respeite os vizinhos.'],['r:aragarcas','Aragarças','conversa e avisos de Aragarças. Respeite os vizinhos.']];
const SEMENTE={'r:classificados':[['Marcos P.','vendo uma bicicleta aro 26, pouco uso. Quem quiser, chama no privado'],['Ana C.','alguém tem berço para vender ou doar?']],'r:amizade':[['Duda L.','bom dia, galera! Quem vai na praça no fim de semana?'],['Ana C.','eu vou! Levo o tereré']],'r:construcao':[['Marcos P.','alguém indica pedreiro para fazer um muro?'],['Carla M.','Trabalho com elétrica. Se precisar de ponto novo, me chama']],'r:vagas':[['Ana C.','preciso de diarista na terça, meio período'],['Marcos P.','ajudante de pedreiro, 3 diárias, aqui em Barra']]};
function abrirSala(c){if(painel[c])return;const d=document.createElement('div');d.className='log';d.hidden=true;d.setAttribute('aria-live','polite');$('log').after(d);painel[c]=d;if(BOTS){nota(d,'*** sala de demonstração: quem tem a etiqueta bot é simulado ***');window._semBalao=1;(SEMENTE[c]||[]).forEach(([n,t])=>linha(d,por(n),t));window._semBalao=0}}
SALAS.filter(x=>x[0]!=='sala').forEach(([k,n])=>{const b=document.createElement('button');b.type='button';b.dataset.r=k;b.textContent=n;b.onclick=()=>{abrirSala(k);mostrar(k)};$('rooms').append(b)});
{const sl=document.createElement('select');sl.id='roomSel';sl.className='roomsel';sl.setAttribute('aria-label','Escolher sala');SALAS.forEach(([k,n])=>sl.append(new Option(n,k)));sl.onchange=()=>{const k=sl.value;if(k!=='sala')abrirSala(k);mostrar(k)};$('rooms').insertBefore(sl,$('rooms').querySelector('button[data-r]'));
sl.style.display='none';
const rwrap=document.createElement('div');rwrap.className='rdd';
const rbt=document.createElement('button');rbt.type='button';rbt.className='rdd-b';rbt.setAttribute('aria-haspopup','listbox');rbt.setAttribute('aria-expanded','false');rbt.setAttribute('aria-label','Escolher sala');
const rul=document.createElement('ul');rul.className='rdd-m';rul.setAttribute('role','listbox');rul.hidden=true;
const rsync=()=>{const o=sl.options[sl.selectedIndex];rbt.textContent=o?o.text:'Salas';rul.querySelectorAll('li').forEach(li=>li.setAttribute('aria-selected',String(li.dataset.k===sl.value)))};
function rfecha(){rul.hidden=true;rbt.setAttribute('aria-expanded','false')}
SALAS.forEach(([k,n])=>{const li=document.createElement('li');li.setAttribute('role','option');li.tabIndex=0;li.dataset.k=k;li.textContent=n;
 const pick=()=>{sl.value=k;sl.onchange();rsync();rfecha();rbt.focus()};
 li.onclick=pick;
 li.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick()}else if(e.key==='ArrowDown'){e.preventDefault();li.nextElementSibling&&li.nextElementSibling.focus()}else if(e.key==='ArrowUp'){e.preventDefault();li.previousElementSibling&&li.previousElementSibling.focus()}else if(e.key==='Escape'){rfecha();rbt.focus()}};
 rul.append(li)});
rbt.onclick=()=>{const abre=rul.hidden;rul.hidden=!abre;rbt.setAttribute('aria-expanded',String(abre));if(abre){const s=rul.querySelector('[aria-selected=true]')||rul.firstChild;s&&s.focus()}};
document.addEventListener('click',e=>{if(!rwrap.contains(e.target))rfecha()});
rwrap.append(rbt,rul);$('rooms').insertBefore(rwrap,sl);window.MH_roomSync=rsync;rsync();
const rr=$('rrule');rr.addEventListener('click',()=>rr.classList.toggle('open'));rr.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();rr.classList.toggle('open')}})}
{const sg=document.createElement('button');sg.type='button';sg.className='sug';sg.textContent='+ Sugerir sala';sg.onclick=()=>{$('sugf').hidden=!$('sugf').hidden;if(!$('sugf').hidden)$('sugi').focus()};$('rooms').append(sg)}
$('sugf').addEventListener('submit',e=>{e.preventDefault();const v=$('sugi').value.trim();if(!v)return;$('sugi').value='';$('sugf').hidden=true;nota(painel[ativa]||painel.sala,'*** Sugestão "'+v+'" anotada (prévia). No app, a equipe analisa as sugestões. ***')});
mostrar('sala');
function comando(v,pane){
  const c=v.slice(1).split(/\s+/)[0].toLowerCase();
  if(c==='help'){['/help — lista os comandos','/status — quem está na sala','/guilda — missões de exemplo','/sos — quantos SOS ainda restam hoje','/emergencia — telefones de emergência','/limpar — limpa esta conversa'].forEach(t=>nota(pane,t))}
  else if(c==='status'){const n=$('wholist').querySelectorAll('div').length;nota(pane,'*** '+(n?n+(n===1?' pessoa':' pessoas')+' na sala agora':'ninguém na sala por enquanto')+' ***')}
  else if(c==='guilda'){nota(pane,'*** missões de exemplo (prévia do app) ***');(window.MH_MISSOES||[]).forEach(m=>nota(pane,'• '+m.t+' — '+m.v))}
  else if(c==='sos'){urgenciasHoje=lerSos();nota(pane,'*** SOS usados hoje: '+urgenciasHoje+'/'+MAX_URG+' ***')}
  else if(c==='emergencia'){['Bombeiros: 193 (fogo, cheiro forte de gás, resgate)','SAMU: 192 (saúde)','Polícia: 190','O SOS do MiHelp chama profissionais, não substitui esses números.'].forEach(t=>nota(pane,t))}
  else if(c==='limpar'){pane.querySelectorAll('p').forEach(x=>x.remove());nota(pane,'*** conversa limpa ***')}
  else nota(pane,'*** comando não existe. Digite /help ***');
}
$('sf').addEventListener('submit',e=>{e.preventDefault();const v=$('m').value.trim();if(!v||!eu)return;const pane=painel[ativa],c=ativa;if(v[0]==='/'){$('m').value='';comando(v,pane);return}if(!eu.adm&&temNumero(v)){nota(pane,'*** Por segurança, telefone e números de contato não podem ser enviados no chat. Combine e feche o serviço pelo MiHelp. ***');return}const rr=respA;const mid=(window.MH_DB&&MH_DB.novoId)?MH_DB.novoId():'';const el=linha(pane,eu,v,rr);if(el&&mid)el.dataset.mid=mid;try{if(window.MH_DB&&MH_DB.ok&&!(c!=='sala'&&!c.startsWith('r:')&&por(c)))MH_DB.enviar(c,eu,v,rr,mid?{id:mid}:undefined)}catch(x){}respA=null;mostrarResp();if(c!=='sala'){aoFalarPrivado(c);if(c.indexOf('r:')!==0)pvReg(c,true,Date.now())}$('m').value='';if(c==='sala'){if(rr&&por(rr.nome))respBot(rr.nome,v);else responder(v)}else respPriv(pane,c,v)});
let urgenciasHoje=0; const MAX_URG=5;
function lerSos(){try{const o=JSON.parse(localStorage.getItem('mh_sos2')||'null'),h=new Date().toDateString();return(o&&o.d===h&&eu&&o.u[eu.nome.toLowerCase()])||0}catch(e){return 0}}
function gravarSos(){try{if(!eu)return;const h=new Date().toDateString();let o=JSON.parse(localStorage.getItem('mh_sos2')||'null');if(!o||o.d!==h)o={d:h,u:{}};o.u[eu.nome.toLowerCase()]=urgenciasHoje;localStorage.setItem('mh_sos2',JSON.stringify(o))}catch(x){}} let catUrg='';
function atualizarSosCount(){
  urgenciasHoje=lerSos();
  const el=$('sosCount'); if(!el)return;
  el.textContent=urgenciasHoje>=MAX_URG?'limite':urgenciasHoje+'/'+MAX_URG;
  const bt=$('nudge'); if(bt) bt.setAttribute('aria-label','SOS, chamados urgentes usados hoje: '+urgenciasHoje+' de '+MAX_URG);
  el.classList.toggle('limite', urgenciasHoje>=MAX_URG);{const b2=$('nudge');if(b2)b2.classList.toggle('esgotado',urgenciasHoje>=MAX_URG)}
}
document.querySelectorAll('#catRow button[data-cat]').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('#catRow button[data-cat]').forEach(x=>x.classList.remove('on'));
  if(catUrg===b.dataset.cat){catUrg='';return}
  b.classList.add('on'); catUrg=b.dataset.cat;
}));
function enviarSos(){
  if(!eu||!(ativa==='sala'||ativa.startsWith('r:')))return;
  if(!catUrg){nota(painel[ativa]||painel.sala,'*** Escolha primeiro a categoria da emergência (Encanador, Gás de cozinha, Elétrica, Chaveiro ou Borracheiro) e toque em SOS. Para outros assuntos, escreva na sala. ***');const cr=$('catRow');if(cr){cr.style.outline='2px solid var(--red)';setTimeout(()=>{cr.style.outline=''},1800)}return;}
  urgenciasHoje=lerSos();
  if(urgenciasHoje>=MAX_URG){nota(painel.sala,'*** limite de 5 urgências por dia atingido — use o chat normal ***');return;}
  urgenciasHoje++; gravarSos(); atualizarSosCount();
  setTimeout(()=>{catUrg='';document.querySelectorAll('#catRow button[data-cat]').forEach(x=>x.classList.remove('on'))},1500);
  try{if(window.MH_DB&&MH_DB.ok)MH_DB.enviar('sala',eu,'SOS '+catUrg,null,{tipo:'sos',categoria:catUrg})}catch(x){}
  const w=$('cw');w.classList.remove('shake');void w.offsetWidth;w.classList.add('shake');
  // mensagem: quem é da categoria "vê" alerta (simulado no texto)
  const p=document.createElement('p'); p.className='urg';
  const al=document.createElement('span'); al.className='al'; al.textContent='⚠';
  p.append(al);sosNome(p,catUrg,eu.nome);
  painel.sala.append(p); while(painel.sala.children.length>80)painel.sala.firstChild.remove(); painel.sala.scrollTop=painel.sala.scrollHeight;
  nota(painel.sala,'*** Risco de vida, fogo, cheiro forte de gás ou violência: ligue 193 (Bombeiros), 192 (SAMU) ou 190 (Polícia). O SOS do MiHelp não substitui. ***');
  if(ativa!=='sala')nota(painel[ativa],'*** SOS enviado na sala Geral, onde os helpers recebem o alerta ***');
  // para quem não é da área, eco normal
  const soft=document.createElement('p'); soft.className='urg-soft'; soft.textContent='(quem não é de '+catUrg+' vê só: '+eu.nome+': preciso de '+catUrg.toLowerCase()+')';
  painel.sala.append(soft);
  // bot helper da categoria responde
  const cat0=catUrg;const bh=PESSOAS.find(p=>p.bot&&p.role==='helper'&&casaOficio(cat0,p.work));const quem=bh?bh.nome:'';
  setTimeout(()=>{const b=por(quem);if(BOTS&&b&&!bloqueados.has(quem))linha(painel.sala,b,eu.nome+', vi seu SOS de '+cat0+'. Me chama no privado.',{nome:eu.nome,texto:'SOS '+cat0})},1200);
}
window.MH_SOS_AUTO=function(cat){
  if(!eu)return 'login';
  cat=String(cat||'').trim().slice(0,30);if(!cat)return 'vazio';
  urgenciasHoje=lerSos();if(urgenciasHoje>=MAX_URG)return 'limite';
  if(!(ativa==='sala'||ativa.startsWith('r:'))){const t=document.querySelector('#ctabs .ctsala');if(t)t.click()}
  catUrg=cat;enviarSos();return 'ok'};
atualizarSosCount();
/* SOS em janelinha: escolhe a categoria (5 fixas ou busca de qualquer ofício) e confirma */
(function(){
const nb=$('nudge');if(!nb)return;
const mk2=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const FIXAS=[['Encanador','Cano estourado, vazamento grande'],['Gás de cozinha','O botijão acabou'],['Elétrica','Sem energia, curto, fio exposto'],['Chaveiro','Trancado para fora de casa ou do carro'],['Borracheiro','Pneu furado na estrada']];
let dlg=null;
function listaOficios(){
 const m=new Map(),add=(w,n)=>{w=String(w||'').trim();const k=norm(w);if(!k||!n)return;const o=m.get(k)||{nome:w,n:0};o.n+=n;m.set(k,o)};
 if(BOTS)PESSOAS.forEach(p=>{if(p.role==='helper'&&p.work)add(p.work,1)});
 Object.values(window.MH_OFICIOS||{}).forEach(o=>add(o.nome,o.n));
 return Array.from(m.values())}
const contaOf=cat=>listaOficios().reduce((a,o)=>a+(casaOficio(cat,o.nome)?o.n:0),0);
function monta(){
 let sel='';
 if(!dlg){dlg=document.createElement('dialog');dlg.id='sosDlg';dlg.setAttribute('aria-label','Chamado urgente SOS');document.body.append(dlg);dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()})}
 dlg.textContent='';
 const grid=mk2('div','sos-cats'),btns=[],info=mk2('p','sos-sel','Escolha um ofício acima.'),go=mk2('button','go','Enviar SOS');
 go.id='sosEnviar';go.type='button';go.disabled=true;go.style.cssText='background:var(--red);color:#fff';
 const atual=()=>{
  if(!sel){info.textContent='Escolha um ofício acima.';go.disabled=true;go.textContent='Enviar SOS';return}
  const n=contaOf(sel);
  info.textContent='Escolhido: '+sel+' · '+(n?n+(n===1?' Helper cadastrado':' Helpers cadastrados'):'ainda sem Helper cadastrado, o alerta fica na sala');
  go.disabled=false;go.textContent='Enviar SOS para '+sel};
 const marca=nome=>{const fx=FIXAS.find(([n])=>casaOficio(n,nome));sel=fx?fx[0]:nome;
  btns.forEach(b=>b.setAttribute('aria-pressed',String(casaOficio(b.dataset.cat,sel))));atual()};
 const inp=document.createElement('input');inp.type='text';inp.maxLength=30;inp.autocomplete='off';inp.placeholder='Ex.: advogado, mecânico';inp.setAttribute('aria-label','Buscar outro ofício');
 const res=mk2('div','lupa-res');
 const pinta=()=>{res.textContent='';const q=norm(inp.value).trim();if(!q)return;
  const l=listaOficios().filter(o=>norm(o.nome).includes(q)).sort((a,b)=>b.n-a.n||a.nome.localeCompare(b.nome,'pt-BR'));
  if(!l.length){res.append(mk2('p','note','Ninguém cadastrado como "'+inp.value.trim()+'" ainda. Escreva na sala ou use a Guilda.'));return}
  l.slice(0,6).forEach(o=>{const b=mk2('button','lupa-it');b.type='button';b.append(mk2('b',0,o.nome),mk2('small',0,o.n+(o.n===1?' Helper':' Helpers')));b.onclick=()=>marca(o.nome);res.append(b)})};
 inp.addEventListener('input',pinta);
 FIXAS.forEach(([n,d])=>{const b=mk2('button','sos-cat');b.type='button';b.dataset.cat=n;b.setAttribute('aria-pressed','false');b.append(mk2('span',0,n),mk2('small',0,d));b.onclick=()=>{inp.value='';pinta();marca(n)};btns.push(b);grid.append(b)});
 go.onclick=()=>{if(!sel)return;catUrg=sel;dlg.close();enviarSos()};
 const cx=mk2('button','cx','Cancelar');cx.type='button';cx.onclick=()=>dlg.close();
 const bt=mk2('div','dbt');bt.append(go,cx);
 dlg.append(mk2('h3',0,'SOS: chamado urgente'),
  mk2('p','note','Só para o que não pode esperar. O alerta vai apenas para os Helpers do ofício escolhido. Risco de vida, fogo ou cheiro forte de gás: ligue 193, 192 ou 190.'),
  mk2('p','note','Hoje: '+urgenciasHoje+'/'+MAX_URG+' usados'),grid,
  mk2('p','note','Outro tipo de profissional? Procure aqui:'),inp,res,info,bt)}
function abrir(){
 const pane=painel[ativa]||painel.sala;
 if(!eu){nota(pane,'*** cadastre-se para usar o SOS ***');return}
 if(!(ativa==='sala'||ativa.startsWith('r:'))){nota(pane,'*** O SOS funciona na sala Geral e nas salas públicas. Volte para uma delas e toque em SOS. ***');return}
 urgenciasHoje=lerSos();
 if(urgenciasHoje>=MAX_URG){nota(pane,'*** limite de 5 urgências por dia atingido: use o chat normal ***');return}
 monta();dlg.showModal()}
nb.addEventListener('click',abrir);
})();
document.addEventListener('click',e=>{const b=e.target.closest('[data-u]');if(b)abrirPerfil(b.dataset.u)});
$('ctabs').querySelector('.ctsala').addEventListener('click',()=>mostrar('sala'));
$('pfav').addEventListener('click',()=>{if(ativa==='sala'||ativa.startsWith('r:'))return;const on=togFav(ativa);$('pfav').textContent=on?'★ Nos favoritos':'☆ Favoritar'});
$('pbloq').addEventListener('click',()=>{const n=ativa;if(n==='sala')return;bloqueados.add(n);Array.from(painel.sala.querySelectorAll('p')).filter(p=>p.dataset.de===n).forEach(p=>{p.hidden=true});fechar(n);desenharOnline();nota(painel.sala,'*** você bloqueou '+n+' ***')});
$('pden').addEventListener('click',()=>{if(ativa==='sala')return;if(window.MH_denuncia)window.MH_denuncia(ativa);nota(painel[ativa],PREVIA?'*** Denúncia (prévia): no site de verdade, a conversa é enviada para a nossa equipe. ***':'*** Denúncia enviada para a nossa equipe. ***')});
let botsIni=false;
function iniciarBots(){if(botsIni)return;botsIni=true;nota(painel.sala,'*** sala de demonstração: quem tem a etiqueta bot é simulado. Clique num nome para falar no privado ***');depois(1500,conversa);setInterval(conversa,17000)}
if(BOTS)iniciarBots();
window.MH_FX={
 apagarMsg(id){if(!id)return;apagadas.add(id);try{localStorage.setItem('mh_apagadas',JSON.stringify([...apagadas].slice(-300)))}catch(e){}Object.keys(painel).forEach(k=>Array.from(painel[k].querySelectorAll('p[data-mid]')).forEach(x=>{if(x.dataset.mid===id)x.remove()}))},
 bots(on){BOTS=!!on;if(BOTS)iniciarBots();else Object.keys(painel).forEach(k=>{if(k==='sala'||k.indexOf('r:')===0)Array.from(painel[k].querySelectorAll('p[data-de]')).forEach(x=>{if(por(x.dataset.de))x.remove()})});try{desenharOnline()}catch(x){}},
 limpar(a,t){if(a==='sala'){painel.sala.textContent='';nota(painel.sala,'*** sala limpa pelo administrador ***')}
  else if(a==='salas'){Object.keys(painel).filter(k=>k.indexOf('r:')===0).forEach(k=>{painel[k].textContent='';nota(painel[k],'*** sala limpa pelo administrador ***')})}
  else if(a==='outdoor'){const A=window.MH_ADS;if(A)A.vs().forEach((v,i)=>{if(v)A.clear(i)})}
  else if(a==='guilda'){if(window.MH_guildaLimpar)MH_guildaLimpar(t||Date.now())}}
};
desenharOnline();mostrar('sala');atualizarPapel();
window.MH_UI={online:()=>desenharOnline(),nota:t=>nota(painel.sala,t),botsOn:()=>BOTS,eu:()=>eu,sos:()=>atualizarSosCount(),
perfil:n=>{if(pfDlg&&pfDlg.open)pfDlg.close();abrirPerfil(n)},
avs:()=>AV,
entrarConta:c=>{eu={nome:c.nome,role:c.role,work:c.work,status:'disponivel'};try{if(window.MH_DB)MH_DB.meu=c.nome}catch(x){}renderMeuPerfil();liberarChatForcado();desenharOnline();try{refreshProf();carregaV8();carregaFav8()}catch(x){}return true},
entrarAdm:n=>{n=String(n||'').trim().replace(/\s+/g,' ').slice(0,24);if(!n)return 'Digite um nome.';
 if(PESSOAS.some(p=>p.nome===n))return 'Esse nome já é de outra pessoa na sala. Escolha outro.';
 if(eu){const old=eu.nome;if(old!==n){if(AV[old]){AV[n]=AV[old];delete AV[old]}eu.nome=n}}
 else eu={nome:n,role:'cliente',work:'',status:'disponivel'};
 eu.adm=true;renderMeuPerfil();liberarChatForcado();desenharOnline();try{refreshProf();carregaV8();carregaFav8()}catch(x){}return true},pessoas:()=>PESSOAS.concat(eu?[eu]:[]),realN:()=>visiveis().filter(p=>!p.bot).length+(eu&&!eu.bot?1:0),
banir:n=>{bloqueados.add(n);Object.values(painel).forEach(pn=>Array.from(pn.querySelectorAll('p')).filter(x=>x.dataset.de===n).forEach(x=>{x.hidden=true}));if(painel[n])fechar(n);desenharOnline()},
desbanir:n=>{bloqueados.delete(n);Object.values(painel).forEach(pn=>Array.from(pn.querySelectorAll('p')).filter(x=>x.dataset.de===n).forEach(x=>{x.hidden=false}));desenharOnline()}};

// ---- recepção de dados reais (vindos do banco) ----
function sosNome(p,cat,nome){p.append(document.createTextNode(' SOS '+cat+' — '));const b=document.createElement('button');b.type='button';b.className='nm';b.dataset.u=nome;b.title='Ver perfil de '+nome;b.textContent=nome;p.append(b,document.createTextNode(' precisa agora'))}
function sosLinha(pane,nome,cat){const p=document.createElement('p');p.className='urg';const al=document.createElement('span');al.className='al';al.textContent='⚠';p.append(al);sosNome(p,cat,nome);pane.append(p);while(pane.children.length>80)pane.firstChild.remove();rolar(pane)}
let rxMuda=false;
const bipe=n=>{try{window.MH_SOM&&MH_SOM.tocar(n,800)}catch(e){}};
const norm=t=>String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const SOS_RX={'encanador':/encan|hidraul/,'gas de cozinha':/\bgas\b|botij/,'eletrica':/eletric/,'chaveiro':/chave/,'borracheiro':/borrach|pneu/};
/* só recebe o alerta quem é Helper da categoria (ou ADM) */
function casaOficio(cat,work){const c=norm(cat).trim(),w=norm(work).trim();if(!c||!w)return false;
 for(const k in SOS_RX){if(SOS_RX[k].test(c))return SOS_RX[k].test(w)}
 return w.split(/[,;]+/).some(x=>x.trim()===c)}
function sosParaMim(cat){if(!eu)return false;if(eu.adm)return true;if(eu.role!=='helper')return false;return casaOficio(cat,eu.work)}
const TIT0=document.title;let tflash=0;
function alertaSos(cat){
 try{navigator.vibrate&&navigator.vibrate([300,150,300,150,300])}catch(e){}
 clearInterval(tflash);let n=0;
 tflash=setInterval(()=>{document.title=(n++%2)?TIT0:'⚠ SOS '+cat;if(n>24||(!document.hidden&&n>8)){clearInterval(tflash);document.title=TIT0}},800)}
/* ===== notificações: aviso do sistema com a aba em segundo plano, contador no título e vibração ===== */
let naoLidas=0,ntTimer=0;
const notiOk=()=>{try{return 'Notification' in window&&Notification.permission==='granted'&&localStorage.getItem('mh_noti')!=='0'}catch(e){return false}};
function tituloNaoLidas(){clearInterval(ntTimer);if(!naoLidas){document.title=TIT0;return}let a=0;ntTimer=setInterval(()=>{document.title=(a++%2)?TIT0:'('+naoLidas+') nova mensagem'},1200)}
function notifica(titulo,corpo,tag,forte){
 try{if(!document.hidden&&document.hasFocus())return;
  if(!forte){naoLidas++;tituloNaoLidas()}
  try{navigator.vibrate&&navigator.vibrate(forte?[300,150,300,150,300]:[120])}catch(e){}
  if(!notiOk())return;
  const op={body:corpo,tag:tag,renotify:true,requireInteraction:!!forte};
  try{const n=new Notification(titulo,op);n.onclick=()=>{try{window.focus()}catch(e){}n.close()}}
  catch(e){try{navigator.serviceWorker&&navigator.serviceWorker.getRegistration().then(r=>{if(r&&r.showNotification)r.showNotification(titulo,op)})}catch(x){}}
 }catch(e){}}
const zeraNaoLidas=()=>{if(!document.hidden){naoLidas=0;tituloNaoLidas()}};
document.addEventListener('visibilitychange',zeraNaoLidas);window.addEventListener('focus',zeraNaoLidas);
function notaNoti(pane){try{if(!('Notification' in window)||Notification.permission!=='default'||localStorage.getItem('mh_noti_pedido'))return;
 const p=document.createElement('p');p.className='s';p.append('🔔 Quer ser avisado(a) quando responderem ou mandarem SOS, mesmo com a aba em segundo plano? ');
 const b=document.createElement('button');b.type='button';b.className='cx';b.textContent='Ativar notificações';
 b.onclick=()=>{Notification.requestPermission().then(r=>{try{localStorage.setItem('mh_noti_pedido','1');localStorage.setItem('mh_noti',r==='granted'?'1':'0')}catch(e){}p.textContent=r==='granted'?'🔔 Notificações ativadas.':'Notificações não ativadas. Dá para ligar depois nos Ajustes.'})};
 p.append(b);pane.append(p)}catch(e){}}
function realDe(nome,papel,oficio,quando,adm){if(!nome||por(nome))return null;let p=REAIS[nome];
if(!p)p=REAIS[nome]={nome,role:papel==='helper'?'helper':'cliente',work:oficio||'',real:true,adm:!!adm};
else{p.role=papel==='helper'?'helper':'cliente';if(oficio)p.work=oficio;p.adm=!!adm}
if(quando&&(!p.visto||quando>p.visto)){p.visto=quando;rxMuda=true}return p}
const apagadas=new Set();try{JSON.parse(localStorage.getItem('mh_apagadas')||'[]').forEach(x=>apagadas.add(x))}catch(e){}
window.MH_RX={
 aviso:t=>nota(painel.sala,t),
 foto(n,t){setFoto(n,t)},
 port(tp,n,t){t=String(t||'');if(tp==='portfoto'){const k=t.indexOf('|');if(k>0)setPort(n,parseInt(t.slice(0,k),10)-1,t.slice(k+1))}else if(tp==='contato'){try{setContato(n,JSON.parse(t))}catch(e){}}},
 msg(m){if(m.tipo==='portfoto'||m.tipo==='contato'){if(m.autor)window.MH_RX.port(m.tipo,m.autor,m.texto);return}if(m.tipo==='foto'){if(m.autor)setFoto(m.autor,String(m.texto||''));return}if(m.tipo==='frase'){if(m.autor&&!por(m.autor)&&!(eu&&eu.nome===m.autor))FRASE[m.autor]=String(m.texto||'').slice(0,60);return}
  const q=m._quando||Date.now();const sou=eu&&m.autor===eu.nome;const FL=window.MH_FLOOR||{};{const sl=String(m.sala||'sala');if(sl==='sala'&&q<=(FL.sala||0))return;if(sl.indexOf('r:')===0&&q<=(FL.salas||0))return}
  const p=sou?eu:realDe(m.autor,m.papel,m.oficio,q,m.categoria==='adm');
  if(m.tipo==='entrada'){if(!sou&&Date.now()-q<90000)nota(painel.sala,'*** '+m.autor+' entrou na sala ***');return}
  if(!p||bloqueados.has(m.autor))return;
  const sala=String(m.sala||'sala');
  if(m._id&&apagadas.has(m._id))return;
  const resp=m.respNome?{nome:m.respNome,texto:m.respTexto||''}:null;
  if(sala.indexOf('pv:')===0){
   if(!eu)return;const nomes=sala.slice(3).split('|');if(nomes.indexOf(eu.nome)<0)return;
   const outro=nomes.find(x=>x!==eu.nome);if(!outro||bloqueados.has(outro)||por(outro))return;
   if(!painel[outro])abrirPrivado(outro,true);
   if(!painel[outro])return;
   pvReg(outro,sou,q);const esp=String(m.texto||'').charCodeAt(0)===0x2063;
   linha(painel[outro],p,m.texto,resp,q);
   if(!sou&&Date.now()-q<10000){if(esp){bipe('sos');alertaSos('privado');notifica('🆘 SOS privado de '+outro,outro+' está esperando sua resposta.','pvsos:'+outro,true)}else{bipe('msg');notifica(outro,String(m.texto||'').slice(0,90),'pv:'+outro,false)}}
   if(!sou&&ativa!==outro){const a=abaDe(outro);if(a){const b=a.querySelector('.ct');if(b&&b.textContent.charAt(0)!=='●')b.textContent='● '+b.textContent}}
   return}
  let key=sala;if(key!=='sala'){if(!SALAS.some(x=>x[0]===key))return;abrirSala(key)}
  const pane=painel[key];if(!pane)return;
  if(m.tipo==='sos'){if(!sou){if(sosParaMim(m.categoria)){sosLinha(pane,m.autor,m.categoria||'');if(m._aoVivo||Date.now()-q<10000){bipe('sos');alertaSos(m.categoria||'');notifica('⚠ SOS: '+(m.categoria||'ajuda'),m.autor+' precisa de '+String(m.categoria||'ajuda').toLowerCase()+'.','sos',true)}}
   else linha(pane,p,'preciso de '+String(m.categoria||'ajuda').toLowerCase(),null,q)}return}
  if(sou&&m._local)return;
  linha(pane,p,m.texto,resp,q,m._id);if(!sou&&Date.now()-q<10000)bipe('msg')},
 fim(){if(rxMuda){rxMuda=false;try{desenharOnline()}catch(x){}}},
 avs(rows){rows.forEach(r=>{const l=AV[r.alvo]||(AV[r.alvo]=[]);const i=l.findIndex(x=>x[0]===r.de);const v=[r.de,r.estrelas,r.texto||''];if(i>=0)l[i]=v;else l.push(v)})},
 ads(list){const A=window.MH_ADS;if(!A)return;const novos=new Set();
  list.forEach(a=>{const i=(a.vaga|0)-1;if(i<0||i>=A.total)return;novos.add(i);A.put(i,{name:a.nome,text:a.texto||'',end:a.fim,total:a.minutos*60000,tag:a.tag||'',img:a.imagem||null,link:/^https?:\/\//i.test(a.link||'')?a.link:'',_db:1})});
  (window._mhAdsDb||new Set()).forEach(i=>{if(!novos.has(i)){const v=A.vs()[i];if(v&&v._db)A.clear(i)}});window._mhAdsDb=novos},
 rec(rows){rows.forEach(r=>{if(r.alvo&&r.de&&r.texto)recAdd(r.alvo,r.de,String(r.texto),r._quando||Date.now())})},
 frase(n,t){if(n&&!por(n)&&!(eu&&eu.nome===n))FRASE[n]=String(t||'').slice(0,60)},
 apoio:l=>{if(window.MH_APOIO)window.MH_APOIO.set(l)}
};
const h=$('h');setTimeout(()=>{h.classList.add('on');setTimeout(()=>h.classList.remove('on'),700)},600);

document.querySelectorAll('.tabs button').forEach(b=>b.addEventListener('click',()=>{
document.querySelectorAll('.tabs button').forEach(x=>x.setAttribute('aria-selected',x===b));
document.querySelectorAll('.pane').forEach(p=>p.classList.toggle('show',p.id===b.getAttribute('aria-controls')))}));



}catch(e){console.error('MiHelp (chat e cadastro):',e)}
try{(function(){
const dlg=document.getElementById('dlg'),msg=document.getElementById('vgmsg');
const PG=3,PER=8;let pag=0,seguro=false;
const cont=[[0,8,document.getElementById('vgrid')],[0,4,document.getElementById('vleft')],[4,8,document.getElementById('vright')]];
const mobMQ=matchMedia('(max-width:640px)');let pausaAte=0;
const T0=Date.now(),ex=(n,t,min)=>({name:n,text:t,end:T0+min*60000,total:min*60000,tag:'exemplo'});
let vs=new Array(PG*PER).fill(null),cur=0,imgData=null;
if(EXEMPLOS){vs[0]=ex('Seu anúncio aqui','Exemplo de anúncio com o tempo contando.',45);vs[1]=ex('Sua marca na região','Anuncie por R$ 1 o minuto.',120);vs[4]=ex('Anúncio de exemplo','Texto de até 60 letras.',30);vs[6]=ex('Sua empresa aqui','Clique numa vaga aberta para anunciar.',90);vs[8]=ex('Vaga de exemplo','O anúncio entra depois do Pix.',60);vs[12]=ex('Padaria Exemplo','Pão quente toda hora.',25);vs[17]=ex('Oficina Exemplo','Revisão e troca de óleo.',70);vs[16]=ex('Mercado Exemplo','Ofertas da semana.',50)}
const fmt=ms=>{const t=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(t/3600),m=Math.floor(t%3600/60),x=t%60,p=v=>String(v).padStart(2,'0');return (h?h+':'+p(m):m)+':'+p(x)};
function el(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function slot(v,i){
if(!v){const b=el('button','vg open');b.type='button';b.append(el('b',0,'Vaga aberta'),el('small',0,'A partir de R$ 5. Clique para anunciar'));b.onclick=()=>{window.MH_vagaEsc=i;window.MH_irTabela&&window.MH_irTabela(i)};return b}
const d=el('div','vg');d.append(el('span','tg','Publicidade'+(v.tag?' · '+v.tag:'')));if(v.img){const im=el('img');im.src=v.img;im.alt='Imagem do anúncio de '+v.name;d.append(im)}d.append(el('b',0,v.name),el('span','tx',v.text));const tm=el('span','tm',fmt(v.end-Date.now()));tm.dataset.i=i;const pg=el('div','pgb'),bar=el('i');pg.append(bar);d.append(tm,pg);return d}
const pontosEls=cont.map(([a,b,c])=>{const d=el('div','pgd');c.after(d);return d});
function pontos(){pontosEls.forEach(d=>{d.textContent='';for(let q=0;PG>q;q++){const b=el('button',q===pag?'dtp on':'dtp');b.type='button';b.setAttribute('aria-label','Vagas, página '+(q+1)+' de '+PG);b.onclick=()=>{pag=q;build()};d.append(b)}})}
function faixa(k,a,b){if(mobMQ.matches){return k===0?[0,PER]:[0,0]}return [a,b]}
let assin='';
function letreiro(){const w=document.getElementById('tkai');if(!w)return;
const ativos=[];vs.forEach(v=>{if(v&&v.end>Date.now())ativos.push(v)});
const sig=ativos.map(v=>v.name+'|'+v.text+'|'+(v.tag||'')).join('~');if(sig===assin&&w.firstChild)return;assin=sig;
const mk=()=>{const g=document.createElement('span');g.className='tkg';
if(!ativos.length){const i=document.createElement('span');i.className='tkx';i.textContent='Anuncie aqui. Toque para ver as vagas.';g.append(i);return g}
ativos.forEach(v=>{const i=document.createElement('span');i.className='tkx';const b=document.createElement('b');b.textContent='● ';i.append(b,document.createTextNode(v.name.toUpperCase()));
g.append(i)});return g};
w.textContent='';const a=mk();w.append(a);
const larg=w.parentElement.clientWidth||360;let n=1;while(a.offsetWidth*n<larg*1.2&&n<8){n++;a.after(mk())}
const base=[...w.children];base.forEach(x=>w.append(x.cloneNode(true)));[...w.children].slice(base.length).forEach(x=>x.setAttribute('aria-hidden','true'));
w.style.animationDuration=Math.max(24,a.offsetWidth*n/60)+'s'}
/* Cada "casinha" (posição i) tem uma vaga em cada página. Anúncio pago FICA PARADO na casinha dele;
   só as vagas abertas viram de página. Só roda entre anúncios quando a mesma casinha tem 2 ou mais pagos
   (isso só acontece quando todas as casinhas já estão compradas). */
function vagaDaCasinha(i){const ag=Date.now(),pagos=[];for(let q=0;q<PG;q++){const g=q*PER+i,v=vs[g];if(v&&v.end>ag)pagos.push(g)}
  if(pagos.length===1)return pagos[0];
  if(pagos.length>1)return pagos[pag%pagos.length];
  return pag*PER+i}
function build(){cont.forEach(([a0,b0,c],k)=>{const[a,b]=faixa(k,a0,b0);c.textContent='';for(let i=a;b>i;i++){const g=vagaDaCasinha(i);c.append(slot(vs[g],g))}});pontos();letreiro();topo()}
let adSig='',adI=0,adPausa=0;
function topo(){if(window.MH_MOBILE_ADS_REFRESH){try{window.MH_MOBILE_ADS_REFRESH();return}catch(e){}}const box=document.getElementById('adtop');if(!box)return;
const ativos=[];vs.forEach(v=>{if(v&&v.end>Date.now())ativos.push(v)});
const sig=ativos.map(v=>v.name+'|'+v.text+'|'+(v.img?1:0)+'|'+(v.link||'')).join('~');
if(sig===adSig)return;adSig=sig;box.textContent='';box._w=null;
box.classList.toggle('tem-ads',ativos.length>0);if(!ativos.length){box.hidden=true;return}
box.hidden=false;const w=el('div','adw'),dots=el('div','add');
ativos.forEach((v,k)=>{const lk=/^https?:\/\//i.test(v.link||'');const c=el(lk?'a':'button','adc');
 if(lk){c.href=v.link;c.target='_blank';c.rel='noopener noreferrer sponsored'}else{c.type='button';c.onclick=()=>{const t=document.getElementById('vagas');if(t)t.scrollIntoView({behavior:'smooth'})}}
 if(v.img){const im=el('img');im.src=v.img;im.alt='';im.loading='lazy';c.append(im)}
 const t=el('div','adt');t.append(el('small',0,'Publicidade'),el('b',0,v.name),el('span',0,v.text));c.append(t);w.append(c);dots.append(el('i',k===0?'on':''))});
box.append(w);if(ativos.length>1)box.append(dots);
w.addEventListener('scroll',()=>{adI=Math.round(w.scrollLeft/Math.max(1,w.clientWidth+10));[...dots.children].forEach((d,q)=>{d.className=q===adI?'on':''})},{passive:true});
['pointerdown','touchstart'].forEach(ev=>w.addEventListener(ev,()=>{adPausa=Date.now()+15000},{passive:true}));
adI=0;box._w=w}
mobMQ.addEventListener&&mobMQ.addEventListener('change',build);
['pointerdown','touchstart'].forEach(ev=>document.getElementById('vgrid').addEventListener(ev,()=>{pausaAte=Date.now()+20000},{passive:true}));
cont.forEach(([a,b,c])=>{const pai=c.parentElement;['mouseenter','focusin'].forEach(ev=>pai.addEventListener(ev,()=>{seguro=true}));['mouseleave','focusout'].forEach(ev=>pai.addEventListener(ev,()=>{seguro=false}))});
const semMov=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!semMov)setInterval(()=>{if(seguro||Date.now()<pausaAte||document.hidden||document.querySelector('dialog[open]'))return;pag=(pag+1)%PG;build();tick()},10000);
if(!semMov)setInterval(()=>{const bx=document.getElementById('adtop'),w=bx&&bx._w;if(!w||bx.hidden||document.hidden||Date.now()<adPausa)return;const n=w.children.length;if(n<2)return;adI=(adI+1)%n;w.scrollTo({left:adI*(w.clientWidth+10),behavior:'smooth'})},5000);
function tick(){let ch=false;vs.forEach((v,i)=>{if(v&&Date.now()>=v.end){vs[i]=null;ch=true}});if(ch){build();return}
document.querySelectorAll('.vg .tm').forEach(t=>{const v=vs[t.dataset.i];t.textContent=fmt(v.end-Date.now());t.nextSibling.firstChild.style.width=Math.max(0,100*(v.end-Date.now())/v.total)+'%'})}
let horasCustom=1;
const MIN_H=1, MAX_H=24;
function precoAnuncio(min){
  const cheio=min; let pct=0;
  if(min>=60*24) pct=0.35; else if(min>=60*12) pct=0.28; else if(min>=60*6) pct=0.20;
  else if(min>=60*3) pct=0.12; else if(min>=60*2) pct=0.08;
  const final=Math.max(1, Math.round(cheio*(1-pct)));
  return {cheio, final, pct, economia:cheio-final};
}
function fmtTempo(min){
  if(min<60) return min+' minutos';
  const h=Math.floor(min/60), m=min%60;
  if(m===0) return h===1?'1 hora':h+' horas';
  return h+'h '+m+'min';
}
function minutosAtuais(){
  const sel=document.querySelector('input[name=d]:checked');
  if(sel && sel.dataset.mode==='custom') return horasCustom*60;
  return sel ? +sel.value : 5;
}
function tot(){
  const m=minutosAtuais(); const p=precoAnuncio(m);
  let txt='Total: R$ '+p.final+' — '+fmtTempo(m)+' no ar';
  if(p.pct>0) txt+=' · de R$ '+p.cheio+' com '+(Math.round(p.pct*100))+'% off (economia R$ '+p.economia+')';
  document.getElementById('dtot').textContent=txt;
  document.getElementById('horasVal').textContent=String(horasCustom);
  document.getElementById('horasLbl').textContent=horasCustom===1?'1 hora':horasCustom+' horas';
  document.getElementById('dCustom').value=String(horasCustom*60);
  document.getElementById('durCustom').classList.toggle('is-on', document.getElementById('dCustom').checked);
  document.getElementById('horasMenos').disabled=horasCustom<=MIN_H;
  document.getElementById('horasMais').disabled=horasCustom>=MAX_H;
}
window.MH_vaga={abrir:i=>openD(i),livre:p=>(p>=0&&!vs[p])?p:vs.findIndex(v=>!v)};
function openD(i){
  cur=i;horasCustom=1;
  document.getElementById('df').reset();
  const p5=document.querySelector('input[name=d][value="5"]'); if(p5) p5.checked=true;
  imgData=null;document.getElementById('dprev').hidden=true;document.getElementById('dierr').textContent='';
  document.getElementById('dt').textContent='Outdoor digital — vaga '+(i+1);
  tot();dlg.showModal();
}
document.querySelectorAll('input[name=d][data-mode="preset"]').forEach(r=>r.addEventListener('change',tot));
document.getElementById('durCustom').addEventListener('click',e=>{
  if(e.target.closest('button')) return;
  document.getElementById('dCustom').checked=true;tot();
});
document.getElementById('horasMenos').onclick=()=>{ if(horasCustom<=MIN_H) return; horasCustom--; document.getElementById('dCustom').checked=true; tot(); };
document.getElementById('horasMais').onclick=()=>{ if(horasCustom>=MAX_H) return; horasCustom++; document.getElementById('dCustom').checked=true; tot(); };
document.getElementById('dcx').onclick=()=>dlg.close();
document.getElementById('df').addEventListener('submit',e=>{e.preventDefault();
const m=minutosAtuais(),p=precoAnuncio(m),nome=document.getElementById('dn').value.trim(),texto=document.getElementById('dx').value.trim(),link=document.getElementById('dl').value.trim(),vaga=cur,foto=imgData;
const item={name:nome,text:texto,end:0,total:m*60000,tag:PREVIA?"prévia":"",img:foto};
dlg.close();
try{if(window.MH_DB&&MH_DB.ok)MH_DB.pedido({tipo:'outdoor',nome,texto,link,vaga:vaga+1,minutos:m,valor:p.final,imagem:foto||''}).then(()=>{msg.textContent='Pedido registrado. Seu outdoor entra no ar depois que o Pix for confirmado.'}).catch(()=>{msg.textContent='Não consegui registrar o pedido online. Tente de novo em alguns minutos ou fale com a gente pelo Suporte.'})}catch(x){}
abrirPix({titulo:'Outdoor digital — vaga '+(vaga+1),valor:p.final,
resumo:'OUTDOOR DIGITAL MIHELP\nVaga: '+(vaga+1)+'\nTempo: '+fmtTempo(m)+'\nValor: R$ '+p.final+',00'+(p.pct?(' (de R$ '+p.cheio+' com '+(Math.round(p.pct*100))+'% off)'):'')+'\nNegócio: '+nome+'\nTexto: '+texto+'\nLink ou WhatsApp: '+(link||'-')+'\nImagem: '+(foto?'sim (anexar no e-mail)':'não'),
assunto:'Outdoor digital MiHelp — '+nome,
extra:'O tempo só começa a contar quando o anúncio entrar no ar.'+(foto&&!(window.MH_API&&MH_API.on())?' Anexe a imagem no e-mail.':''),
api:{tipo:'anuncio',nome,texto,link,vaga:vaga+1,minutos:m,imagem:foto||''},
previa:()=>{item.end=Date.now()+m*60000;vs[vaga]=item;build();tick();msg.textContent='Prévia só na sua tela: o outdoor de verdade entra depois da confirmação do Pix.'}})});

const di=document.getElementById('di'),dprev=document.getElementById('dprev'),dier=document.getElementById('dierr');
document.getElementById('dpick').addEventListener('click',()=>di.click());
di.addEventListener('change',()=>{
imgData=null;dprev.hidden=true;dier.textContent='';
const f=di.files[0];if(!f)return;
if(!/^image\/(png|jpeg|webp)$/.test(f.type)){dier.textContent='Use uma imagem PNG, JPG ou WEBP.';di.value='';return}
if(f.size>8*1024*1024){dier.textContent='Imagem muito grande. Use uma de até 8 MB.';di.value='';return}
const url=URL.createObjectURL(f),im=new Image();
im.onload=()=>{const s=Math.min(1,480/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);imgData=c.toDataURL('image/jpeg',0.8);dprev.src=imgData;dprev.hidden=false;URL.revokeObjectURL(url)};
im.onerror=()=>{dier.textContent='Não consegui abrir essa imagem.';di.value='';URL.revokeObjectURL(url)};
im.src=url});
build();tick();setInterval(tick,1000);
window.MH_ADS={vs:()=>vs,total:PG*PER,put:(i,v)=>{vs[i]=v;build();tick();try{window.MH_MOBILE_ADS_REFRESH&&window.MH_MOBILE_ADS_REFRESH()}catch(e){}},clear:i=>{vs[i]=null;build();tick();try{window.MH_MOBILE_ADS_REFRESH&&window.MH_MOBILE_ADS_REFRESH()}catch(e){}}};
document.getElementById('nojs')?.remove();
if(PREVIA)msg.textContent='Prévia: os anúncios ainda não são salvos online.';
document.querySelectorAll('.previa').forEach(e=>{e.hidden=!PREVIA});
})();

}catch(e){console.error('MiHelp (vagas):',e)}
try{iniciarPix()}catch(e){console.error('MiHelp (pix e letreiro):',e)}

async function sincronizarAnunciosPagosMobile(){
  try{
    const api=String((window.MH_CFG||{}).api||'').replace(/\/+$/,'');
    const A=window.MH_ADS;
    if(!api || !A || typeof A.put!=='function' || window._mhSem404) return;
    const r=await fetch(api+'/anuncios',{method:'GET',cache:'no-store'});
    if(!r.ok){if(r.status===404)window._mhSem404=1;try{MH_diag('worker /anuncios: HTTP '+r.status,true)}catch(e){}return}
    const j=await r.json();
    if(!j || !Array.isArray(j.anuncios)){try{MH_diag('worker /anuncios: resposta sem lista de anúncios',true)}catch(e){}return}
    try{MH_diag('worker /anuncios: '+j.anuncios.length+' recebidos')}catch(e){}
    const ativos=new Set();
    const agora=Date.now();
    j.anuncios.forEach(a=>{
      const T=x=>{if(x==null||x==='')return NaN;if(typeof x==='object'&&x.$date)x=x.$date;if(typeof x==='number')return x<1e12?x*1000:x;const n=Number(x);return Number.isFinite(n)&&String(x).trim()!==''?(n<1e12?n*1000:n):new Date(x).getTime()};
      const ini0=T(a.inicio!=null?a.inicio:(a.criado!=null?a.criado:a.criadoEm));
      const ini=Number.isFinite(ini0)?ini0:agora;
      let fim=T(a.validade!=null?a.validade:(a.fim!=null?a.fim:(a.end!=null?a.end:a.expira)));
      if(!Number.isFinite(fim))fim=ini+Number(a.minutos||a.min||0)*60000;
      if(!Number.isFinite(fim)||fim<=agora)return;
      const i=Math.max(0,Number(a.vaga||1)-1);
      if(i>=A.total)return;
      ativos.add(i);
      A.put(i,{name:String(a.nome||'Publicidade'),text:String(a.texto||''),end:fim,total:Math.max(1000,fim-ini),tag:'PATROCINADO',img:a.imagem||null,link:a.link||'',_db:true,_paid:true});
    });
    // Remove apenas anúncios vindos do banco que já não estão ativos.
    const old=window._mhPaidMobileAds||new Set();
    old.forEach(i=>{if(!ativos.has(i)){const v=A.vs()[i];if(v&&v._paid)A.clear(i)}});
    window._mhPaidMobileAds=ativos;
    if(typeof window.MH_MOBILE_ADS_REFRESH==='function')window.MH_MOBILE_ADS_REFRESH();
  }catch(e){console.warn('MiHelp anúncios mobile:',e);try{MH_diag('worker /anuncios falhou: '+e,true)}catch(x){}}
}

function iniciarStickyAds(){
  // anúncios pagos reais são carregados pelo endpoint público e entram no mesmo carrossel mobile
  const name=document.getElementById('stickyAdName');
  const text=document.getElementById('stickyAdText');
  const cta=document.getElementById('stickyAdCta');
  if(!name||!text) return;
  const slides=[
    {name:'Vaga aberta',text:'Outdoor digital · a partir de R$ 5'},
    {name:'Seu negócio na região',text:'Barra · Pontal · Aragarças · R$ 1/min'},
    {name:'Pacote 24h com 35% off',text:'Anuncie o dia todo por R$ 936'},
    {name:'Vaga aberta',text:'Clique em Anunciar e escolha o tempo'}
  ];
  let i=0;
  function paint(){
    const s=slides[i];
    name.textContent=s.name;
    text.textContent=s.text;
  }
  paint();
  if(cta){
    cta.onclick=function(e){
      e.preventDefault();
      const v=document.getElementById('vagas');
      if(v) v.scrollIntoView({behavior:'smooth',block:'start'});
      // tenta abrir primeira vaga livre
      const open=document.querySelector('#vgrid .vg.open');
      if(open) setTimeout(function(){ open.click(); }, 400);
    };
  }
  if(document.getElementById('stickyAds')&&!document.getElementById('stickyAds').dataset.rot){
    document.getElementById('stickyAds').dataset.rot='1';
    setInterval(function(){
      if(document.hidden) return;
      i=(i+1)%slides.length;
      paint();
    }, 4000);
  }
}
try{iniciarStickyAds();}catch(e){console.error('MiHelp sticky ads:',e)}
try{sincronizarAnunciosPagosMobile();setInterval(sincronizarAnunciosPagosMobile,15000)}catch(e){console.error('MiHelp sync anúncios:',e)}

try{
document.querySelectorAll('a[href^="#"]').forEach(a=>{const h=a.getAttribute('href');if(h.length>1){a.dataset.go=h.slice(1);a.removeAttribute('href');a.setAttribute('role','link');a.tabIndex=0}});
const ir=el=>{const alvo=document.getElementById(el.dataset.go);if(alvo)alvo.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})};
document.addEventListener('click',e=>{const a=e.target.closest('[data-go]');if(a){e.preventDefault();ir(a)}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'){const a=e.target.closest?e.target.closest('[data-go]'):null;if(a){e.preventDefault();ir(a)}}});
}catch(e){console.error('MiHelp (links internos):',e)}
})();

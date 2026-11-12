
/* Pedido de orçamento + contato protegido. Usa o Worker (/orcamentos/*) quando existir; sem ele, funciona em modo teste neste aparelho. */
(function(){try{
const LS='mh_orc_v1',MAX=5,DIAS=7,LIM_MES=+((window.MH_CFG||{}).orcLimiteMes)||0;
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const btn=(x,c,f)=>{const b=mk('button',c||'more',x);b.type='button';b.onclick=f;return b};
const eu=()=>window.MH_UI&&MH_UI.eu&&MH_UI.eu();
const api=()=>!!(window.MH_API&&MH_API.on());
const tk=()=>window.MH_API?MH_API.usrTk():'';
const ler=()=>{try{return JSON.parse(localStorage.getItem(LS))||{p:[]}}catch(e){return{p:[]}}};
const grava=d=>{try{localStorage.setItem(LS,JSON.stringify(d))}catch(e){}};
const prim=n=>String(n||'').trim().split(/\s+/)[0]||'Cliente';
const vivo=p=>p.st==='aberto'&&Date.now()<p.exp;
const QUANDO=['Urgente (hoje)','Esta semana','Sem pressa'];
let D=null,MODO='';
/* ---------- dados: Worker primeiro, aparelho como reserva ---------- */
async function op(path,body,local){
 if(api()){const r=await MH_API.req(path,{token:tk(),body:body||undefined});
  if(r.ok&&r.j){MODO='api';return r.j}
  if(r.status!==404&&r.status!==0)return{erro:(r.j&&r.j.erro)||'Não deu certo. Tente de novo.'}}
 MODO='local';return local()}
const E=()=>eu().nome;
const meus=()=>op('/orcamentos/meus',null,()=>({p:ler().p.filter(p=>p.dono===E())}));
const abertos=()=>op('/orcamentos/abertos',null,()=>({p:ler().p.filter(p=>vivo(p)&&p.dono!==E()&&p.resp.length<MAX)}));
const criar=p=>op('/orcamentos/novo',p,()=>{const d=ler();d.p.push({id:'o'+Date.now().toString(36),dono:E(),cat:p.cat,desc:p.desc,bairro:p.bairro,quando:p.quando,contato:p.contato,st:'aberto',em:Date.now(),exp:Date.now()+DIAS*864e5,resp:[]});grava(d);return{ok:1}});
const responder=(id,r)=>op('/orcamentos/responder',{id,msg:r.msg,valor:r.valor},()=>{const d=ler(),p=d.p.find(x=>x.id===id);
 if(!p||!vivo(p))return{erro:'Esse pedido já fechou.'};
 if(p.resp.some(x=>x.pro===E()))return{erro:'Você já respondeu esse pedido.'};
 if(p.resp.length>=MAX)return{erro:'Esse pedido já recebeu as '+MAX+' respostas.'};
 if(LIM_MES){const m=new Date().getMonth(),n=d.p.reduce((a,q)=>a+q.resp.filter(x=>x.pro===E()&&new Date(x.em).getMonth()===m).length,0);if(n>=LIM_MES)return{erro:'Você usou as '+LIM_MES+' respostas grátis deste mês.'}}
 p.resp.push({pro:E(),work:(eu().work||''),msg:r.msg,valor:r.valor,em:Date.now()});grava(d);return{ok:1}});
const acao=(id,tipo,pro)=>op('/orcamentos/acao',{id,tipo,pro},()=>{const d=ler(),p=d.p.find(x=>x.id===id);if(!p)return{erro:'Pedido não encontrado.'};
 if(tipo==='fechar'){p.st='fechado';p.esc=pro}else{const r=p.resp.find(x=>x.pro===pro);if(r)r.bloq=1}grava(d);return{ok:1}});
/* ---------- janela ---------- */
function nova(){if(D&&D.open)D.close();D=mk('dialog','v8dlg v8book');D.setAttribute('aria-label','Orçamentos');document.body.append(D);
 D.addEventListener('click',e=>{if(e.target===D)D.close()});D.addEventListener('close',()=>D.remove());D.showModal();return D}
const topo=(t,sub)=>{const h=mk('div','v8head'),a=mk('div','','📝');a.style.cssText='width:48px;height:48px;display:grid;place-items:center;font-size:24px;background:var(--bg)';const b=mk('div');b.append(mk('p','note',sub||'Orçamentos'),mk('h3',null,t));h.append(a,b);D.append(h)};
const passos=i=>{const s=mk('div','bk-steps');['Serviço','Detalhes','Contato','Enviar'].forEach((n,k)=>{const e=mk('span','bk-st'+(k<i?' done':k===i?' on':''));e.append(mk('i',null,k<i?'✓':String(k+1)),mk('em',null,n));s.append(e)});D.append(s)};
const rodape=(...b)=>{const f=mk('div','bk-foot');b.forEach(x=>f.append(x));D.append(f)};
const fecha=()=>btn('✕ Fechar','more',()=>D.close());
const cartao=(n,m,p,f)=>{const b=mk('button','mhp-big bk-sv');b.type='button';b.append(mk('span','bk-n',n),mk('span','bk-m',m));if(p)b.append(mk('span','bk-p',p));b.append(mk('span','bk-go','›'));b.onclick=f;return b};
const nota=t=>mk('p','note',t);
const brl=v=>'R$ '+Number(v).toFixed(2).replace('.',',');
const aviso=()=>{if(MODO==='local')D.append(nota('Modo teste: os pedidos ficam só neste aparelho até o servidor de orçamentos ser ligado.'))};
/* ---------- início ---------- */
function inicio(){const u=eu();if(!u){alert('Entre na sua conta para pedir ou responder orçamentos.');return}
 nova();D.textContent='';topo('Pedir orçamento','Compare antes de contratar');
 D.append(nota('Conte o que você precisa. Até '+MAX+' profissionais respondem, e você escolhe com quem falar. Seu número fica protegido.'));
 D.append(cartao('➕ Novo pedido','Descreva o serviço em 4 passos','',()=>novo({})));
 D.append(cartao('📂 Meus pedidos','Veja as respostas e escolha','',listaMeus));
 if(u.role==='helper')D.append(cartao('🔎 Pedidos na cidade','Responda e ganhe clientes','',listaAbertos));
 rodape(fecha())}
/* ---------- novo pedido ---------- */
function novo(S,i){i=i||0;D.textContent='';topo('Novo pedido','Passo '+(i+1)+' de 4');passos(i);
 if(i===0){D.append(mk('h4','v8passo','O que você precisa?'));
  const base=Object.values(window.MH_OFICIOS||{}).sort((a,b)=>(b.n||0)-(a.n||0)).map(o=>o.nome).filter(Boolean).slice(0,18);
  const lista=base.length?base:['Pintor','Pedreiro','Eletricista','Encanador','Diarista','Jardineiro','Técnico de ar-condicionado','Montador de móveis'];
  const c=mk('div','mhp-c');lista.forEach(n=>{const b=btn(n,'mhp-chip'+(S.cat===n?' on':''),()=>{S.cat=n;novo(S,1)});c.append(b)});D.append(c);
  const o=mk('input');o.placeholder='Outro serviço (ex.: instalar câmera)';o.maxLength=40;o.style.cssText='width:100%;margin-top:10px;min-height:42px';D.append(o);
  rodape(btn('Continuar','more cta2',()=>{const v=o.value.trim();if(v){S.cat=v;novo(S,1)}else if(S.cat)novo(S,1);else alert('Escolha ou digite o serviço.')}),fecha())}
 if(i===1){D.append(mk('h4','v8passo','Detalhes'));
  const t=mk('textarea');t.maxLength=400;t.rows=4;t.placeholder='Ex.: trocar o chuveiro e ver a fiação do banheiro. Casa de 2 andares.';t.value=S.desc||'';t.style.cssText='width:100%;min-height:90px';
  const b=mk('input');b.maxLength=40;b.placeholder='Bairro';b.value=S.bairro||'';b.style.cssText='width:100%;min-height:42px;margin-top:8px';D.append(t,b,mk('h4','v8passo','Para quando?'));
  const c=mk('div','mhp-c');QUANDO.forEach(q=>c.append(btn(q,'mhp-chip'+(S.quando===q?' on':''),e=>{S.quando=q;[...c.children].forEach(x=>x.classList.toggle('on',x.textContent===q))})));D.append(c);
  D.append(nota('Não coloque telefone, endereço completo nem dados de banco.'));
  rodape(btn('← Voltar','more',()=>novo(S,0)),btn('Continuar','more cta2',()=>{S.desc=t.value.trim();S.bairro=b.value.trim();if(S.desc.length<10){alert('Conte um pouco mais do que você precisa.');return}if(!S.bairro){alert('Informe o bairro.');return}if(!S.quando){alert('Escolha para quando.');return}novo(S,2)}))}
 if(i===2){D.append(mk('h4','v8passo','Como quer conversar?'));S.contato=S.contato||'chat';
  const pinta=()=>{D.querySelectorAll('.bk-sv').forEach(x=>x.classList.toggle('on',x.dataset.k===S.contato));w.hidden=S.contato!=='zap'};
  const a=cartao('💬 Pelo MiHelp (recomendado)','Seu número fica protegido','',()=>{S.contato='chat';S.ok=0;pinta()});a.dataset.k='chat';
  const z=cartao('📲 Pelo WhatsApp','O profissional vê seu número','',()=>{S.contato='zap';pinta()});z.dataset.k='zap';
  const w=mk('div','v8card');const ck=mk('input');ck.type='checkbox';ck.checked=!!S.ok;ck.onchange=()=>S.ok=ck.checked;const lb=mk('label');lb.style.cssText='display:flex;gap:8px;align-items:flex-start';lb.append(ck,mk('span',null,'Entendi: pelo WhatsApp o profissional vai ver meu número. Pelo MiHelp eu fico protegido e tenho garantia do app.'));w.append(lb);
  D.append(a,z,w);D.append(nota('Quem insistir depois do seu "não" pode ser bloqueado, e você encerra o contato quando quiser.'));pinta();
  rodape(btn('← Voltar','more',()=>novo(S,1)),btn('Continuar','more cta2',()=>{if(S.contato==='zap'&&!S.ok){alert('Marque que entendeu o aviso do WhatsApp, ou escolha conversar pelo MiHelp.');return}novo(S,3)}))}
 if(i===3){D.append(mk('h4','v8passo','Confere se está certo'));const c=mk('div','v8card');
  [['Serviço',S.cat],['Detalhes',S.desc],['Bairro',S.bairro],['Quando',S.quando],['Contato',S.contato==='chat'?'Pelo MiHelp (número protegido)':'Pelo WhatsApp']].forEach(([k,v])=>{const p=mk('p');p.append(mk('b',null,k+': '),document.createTextNode(v));c.append(p)});D.append(c);
  D.append(nota('O pedido fica aberto por '+DIAS+' dias ou até receber '+MAX+' respostas.'));
  rodape(btn('← Voltar','more',()=>novo(S,2)),btn('📨 Enviar pedido','more cta2',async e=>{const b=e.currentTarget;b.disabled=true;const r=await criar({cat:S.cat,desc:S.desc,bairro:S.bairro,quando:S.quando,contato:S.contato});if(r.erro){b.disabled=false;alert(r.erro);return}pronto()}))}}
function pronto(){D.textContent='';topo('Pedido enviado!','Tudo certo');D.append(nota('Os profissionais da sua cidade já podem responder. Você escolhe com quem conversar.'));aviso();D.append(cartao('📂 Ver meus pedidos','Acompanhe as respostas','',listaMeus));rodape(fecha())}
/* ---------- meus pedidos ---------- */
async function listaMeus(){D.textContent='';topo('Meus pedidos','Orçamentos');const r=await meus();aviso();
 const l=(r.p||[]).slice().reverse();if(!l.length)D.append(nota('Você ainda não fez nenhum pedido.'));
 l.forEach(p=>D.append(cartao(p.cat,(p.resp.length)+' de '+MAX+' respostas',p.st==='fechado'?'fechado':vivo(p)?'aberto':'expirou',()=>detalheMeu(p))));
 rodape(btn('← Voltar','more',inicio),fecha())}
function detalheMeu(p){D.textContent='';topo(p.cat,'Seu pedido');const c=mk('div','v8card');c.append(mk('p',null,p.desc),mk('p','note',p.bairro+' · '+p.quando));D.append(c);
 D.append(mk('h4','v8passo','Respostas ('+p.resp.length+')'));if(!p.resp.length)D.append(nota('Ainda ninguém respondeu. Assim que responderem, você vê aqui.'));
 p.resp.forEach(r=>{const k=mk('div','v8card');k.append(mk('p',null,r.pro+(r.work?' · '+r.work:'')),mk('p',null,r.bloq?'Contato encerrado.':r.msg));
  if(r.valor&&!r.bloq)k.append(mk('p',null,'Valor estimado: '+brl(r.valor)));
  if(!r.bloq&&p.st==='aberto'){const a=mk('div','bk-foot');
   a.append(btn('💬 Conversar no MiHelp','more',()=>{try{D.close();MH_UI.priv(r.pro)}catch(e){}}));
   if(p.contato==='zap'&&r.tel)a.append(Object.assign(mk('a','more','📲 WhatsApp'),{href:'https://wa.me/55'+String(r.tel).replace(/\D/g,''),target:'_blank',rel:'noopener'}));
   a.append(btn('✅ Fechar com este','more',async()=>{if(!confirm('Fechar o pedido com '+r.pro+'?'))return;await acao(p.id,'fechar',r.pro);listaMeus()}),
    btn('🚫 Não quero mais contato','more',async()=>{if(!confirm('Encerrar o contato com '+r.pro+'?'))return;await acao(p.id,'bloq',r.pro);listaMeus()}));k.append(a)}
  D.append(k)});
 rodape(btn('← Voltar','more',listaMeus),fecha())}
/* ---------- profissional ---------- */
async function listaAbertos(){D.textContent='';topo('Pedidos na cidade','Para Helpers');const r=await abertos();aviso();
 D.append(nota('Cada pedido recebe no máximo '+MAX+' respostas.'+(LIM_MES?' Você tem '+LIM_MES+' respostas grátis por mês.':'')));
 const l=r.p||[];if(!l.length)D.append(nota('Nenhum pedido aberto agora.'));
 l.forEach(p=>D.append(cartao(p.cat,p.bairro+' · '+p.quando,(MAX-p.resp.length)+' vagas',()=>detalheAberto(p))));
 rodape(btn('← Voltar','more',inicio),fecha())}
function detalheAberto(p){D.textContent='';topo(p.cat,'Pedido de '+prim(p.dono));const c=mk('div','v8card');c.append(mk('p',null,p.desc),mk('p','note',p.bairro+' · '+p.quando),mk('p','note',p.contato==='zap'?'Aceita conversar pelo WhatsApp.':'Prefere conversar pelo MiHelp.'));D.append(c);
 D.append(mk('h4','v8passo','Sua resposta'));const m=mk('textarea');m.maxLength=300;m.rows=3;m.placeholder='Diga como você faria e o que está incluso.';m.style.cssText='width:100%;min-height:80px';
 const v=mk('input');v.type='number';v.min=0;v.step='0.01';v.placeholder='Valor estimado em R$ (opcional)';v.style.cssText='width:100%;min-height:42px;margin-top:8px';D.append(m,v,nota('Seja direto e respeite a decisão do cliente: sem insistência fora do app.'));
 rodape(btn('← Voltar','more',listaAbertos),btn('📨 Enviar resposta','more cta2',async e=>{const t=m.value.trim();if(t.length<10){alert('Escreva um pouco mais na resposta.');return}const b=e.currentTarget;b.disabled=true;const r=await responder(p.id,{msg:t,valor:v.value?+v.value:0});if(r.erro){b.disabled=false;alert(r.erro);return}listaAbertos()}))}
window.MH_ORC={abrir:inicio};
/* botão no menu de cima */
const poe=()=>{const nv=document.querySelector('nav.nv');if(!nv||document.getElementById('navOrc'))return;const b=btn('📝 Orçamento','more',inicio);b.id='navOrc';const r=document.getElementById('navAjustes')||document.getElementById('navMais');r?r.before(b):nv.prepend(b)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(poe,0));else poe();
}catch(e){console.error('MiHelp (orçamento):',e)}})();

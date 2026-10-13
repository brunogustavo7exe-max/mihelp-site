
/* ===== Camada de dados (Wix Headless). Só liga se window.MH_CFG.clientId estiver preenchido. ===== */
(function(){
const CFG=window.MH_CFG||{};
const CDNS=[['https://esm.sh/@wix/sdk','https://esm.sh/@wix/data'],['https://esm.run/@wix/sdk','https://esm.run/@wix/data'],['https://cdn.jsdelivr.net/npm/@wix/sdk/+esm','https://cdn.jsdelivr.net/npm/@wix/data/+esm'],['https://cdn.skypack.dev/@wix/sdk','https://cdn.skypack.dev/@wix/data']];
const COL={pre:'PreCadastros',perf:'Perfis',msg:'Mensagens',av:'Avaliacoes',ped:'Pedidos',ad:'Anuncios',ap:'Apoiadores',den:'Denuncias',sup:'Suporte'};
const DIAG=/[?&]diag\b/.test(location.search);
const DB=window.MH_DB={ok:false,meu:'',nomes:new Set(),
  tem(n){n=String(n||'').toLowerCase();return !!n&&n!==this.meu.toLowerCase()&&this.nomes.has(n)}};
let client=null;
const dt=v=>v instanceof Date?v:(v&&v.$date?new Date(v.$date):new Date(v));
const rid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const q=c=>client.items.query(c);
const ins=(c,o)=>client.items.insert(c,o);
let painelDiag=null;
function diag(t,ruim){try{console[ruim?'error':'log']('MiHelp banco:',t)}catch(e){}
 if(!DIAG)return;
 if(!painelDiag){painelDiag=document.createElement('pre');painelDiag.style.cssText='position:fixed;left:8px;bottom:8px;z-index:9999;max-width:92vw;max-height:60vh;overflow:auto;margin:0;padding:10px 12px;background:#000;color:#9fe;border:1px solid #E8B93C;border-radius:8px;font:12px/1.5 monospace;white-space:pre-wrap';document.body.append(painelDiag)}
 painelDiag.textContent+=(ruim?'✗ ':'• ')+t+'\n'}
window.MH_diag=diag;
const msgErro=e=>{const t=String((e&&(e.message||e.details&&e.details.message))||e);
 if(/not.?found|does not exist|doesn.t exist|WDE0025/i.test(t))return t+' → a coleção não existe ou o nome está diferente.';
 if(/permission|not allowed|forbidden|403|unauthor|WDE0015/i.test(t))return t+' → falta liberar a permissão da coleção.';
 return t};

DB.cadastrar=async function(d){
 try{localStorage.setItem('mh_eu',JSON.stringify({nome:d.nome,role:d.role,work:d.work,tel:d.tel,em:d.em}))}catch(e){}
 DB.meu=d.nome;if(!DB.ok)return;
 const ops=[
  ins(COL.pre,{nome:d.nome,papel:d.role,oficio:d.work||'',telefone:d.tel,email:d.em}),
  ins(COL.perf,{nome:d.nome,papel:d.role,oficio:d.work||''}),
  ins(COL.msg,{_id:rid('e'),sala:'sala',autor:d.nome,papel:d.role,oficio:d.work||'',texto:'',tipo:'entrada'})];
 const r=await Promise.allSettled(ops);
 r.forEach((x,i)=>{if(x.status==='rejected')diag('cadastro, passo '+(i+1)+': '+msgErro(x.reason),true)});
 DB.nomes.add(d.nome.toLowerCase())};

DB.virarHelper=async function(nome,work){if(!DB.ok)return;try{await ins(COL.perf,{nome:nome,papel:'helper',oficio:work||''})}catch(e){diag('virar helper: '+msgErro(e),true)}};
DB.novoId=()=>rid('m');
DB.enviar=async function(c,eu,texto,resp,extra){
 if(!DB.ok)return;
 const pub=(c==='sala'||String(c).indexOf('r:')===0);
 const sala=pub?c:'pv:'+[eu.nome,c].sort().join('|');
 const id=(extra&&extra.id)||rid('m');seen.add(id);
 try{await ins(COL.msg,{_id:id,sala,autor:eu.nome,papel:eu.role,oficio:eu.work||'',texto:String(texto).slice(0,300),
  tipo:(extra&&extra.tipo)||'msg',categoria:(extra&&extra.categoria)||(eu&&eu.adm?'adm':''),respNome:resp?resp.nome:'',respTexto:resp?String(resp.texto||'').slice(0,80):''})}
 catch(e){diag('envio: '+msgErro(e),true);if(window.MH_RX)MH_RX.aviso('*** Não consegui enviar essa mensagem. Tente de novo em instantes. ***')}};

DB.avaliar=async function(alvo,de,estrelas,texto){
 if(!DB.ok)return;
 try{await ins(COL.av,{alvo,de,estrelas,texto:String(texto||'').slice(0,140)})}catch(e){diag('avaliação: '+msgErro(e),true)}};

DB.pedido=function(p){
 if(!DB.ok)return Promise.reject(new Error('sem banco'));
 return ins(COL.ped,Object.assign({status:'novo'},p))};

DB.suporte=async function(r){
 if(!DB.ok)throw new Error('sem banco');
 await ins(COL.sup,{tipo:String(r.tipo||'').slice(0,30),texto:String(r.texto||'').slice(0,500),contato:String(r.contato||'').slice(0,80),autor:String(r.autor||'').slice(0,40),pagina:String(r.pagina||'').slice(0,80),aparelho:String(r.aparelho||'').slice(0,140)})};
DB.lerSuporte=async function(){
 if(!DB.ok)throw new Error('sem banco');
 const r=await q(COL.sup).descending('_createdDate').limit(50).find();
 return ((r&&r.items)||[]).map(x=>({quando:dt(x._createdDate).getTime(),tipo:x.tipo,texto:x.texto,contato:x.contato,autor:x.autor}))};
DB.denuncia=async function(alvo){
 if(!DB.ok)return;
 const eu=window.MH_UI&&MH_UI.eu&&MH_UI.eu();
 try{await ins(COL.den,{de:eu?eu.nome:'',alvo:String(alvo),motivo:'Denúncia feita no chat'})}catch(e){diag('denúncia: '+msgErro(e),true)}};

const seen=new Set();let ultimo=null,falhas=0,avisou=false;
/* ---- controle do administrador (mensagens assinadas) ---- */
const KEYK='mihelp_ctlkey_v1';
const b64=u=>btoa(String.fromCharCode.apply(null,Array.from(new Uint8Array(u))));
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const enc=s=>new TextEncoder().encode(s);
const ALG={name:'ECDSA',namedCurve:'P-256'},SIG={name:'ECDSA',hash:'SHA-256'};
const sub=()=>window.crypto&&crypto.subtle;
const priv=()=>{try{return JSON.parse(localStorage.getItem(KEYK)||'null')}catch(e){return null}};
const pubCfg=()=>{try{let j=CFG.adminPub;if(typeof j==='string')j=JSON.parse(j);return j&&j.x&&j.y?j:null}catch(e){return null}};
let pubKey=null;
async function pubDoSite(){if(pubKey)return pubKey;try{if(!pubCfg()&&window.MH_PUBP)await window.MH_PUBP}catch(e){}const j=pubCfg();if(!j||!sub())return null;pubKey=await sub().importKey('jwk',{kty:'EC',crv:'P-256',x:j.x,y:j.y,ext:true},ALG,false,['verify']);return pubKey}
async function verificar(txt,sig){try{const k=await pubDoSite();if(!k)return false;return await sub().verify(SIG,k,unb64(sig),enc(txt))}catch(e){return false}}
async function assinar(txt){const k=await sub().importKey('jwk',priv(),ALG,false,['sign']);return b64(await sub().sign(SIG,k,enc(txt)))}
DB.chave={
 existe:()=>!!priv(),
 async gerar(){if(!sub())throw new Error('sem criptografia');const kp=await sub().generateKey(ALG,true,['sign','verify']);const j=await sub().exportKey('jwk',kp.privateKey);localStorage.setItem(KEYK,JSON.stringify(j))},
 publica(){const j=priv();return j?{x:j.x,y:j.y}:null},
 linha(){const p=this.publica();if(!p)return '';return "window.MH_CFG={clientId:'"+(CFG.clientId||'')+"',bots:"+(CFG.bots!==false)+",adminPub:{x:'"+p.x+"',y:'"+p.y+"'}};"},
 ligada(){const p=this.publica(),s=pubCfg();return !!(p&&s&&s.x===p.x&&s.y===p.y)},
 exportar:()=>localStorage.getItem(KEYK)||'',
 importar(t){const j=JSON.parse(t);if(!j.d||!j.x||!j.y)throw new Error('chave inválida');localStorage.setItem(KEYK,JSON.stringify(j))}};
DB.ctlPronto=()=>!!(DB.ok&&(DB.chave.ligada()||(window.MH_API&&MH_API.on()&&MH_API.admTk())));
/* hora de referência quando o comando só vale neste aparelho: a da última mensagem do SERVIDOR, nunca o relógio do celular */
const tsLocal=()=>window.MH_SRVT||1;
let botsT=0;try{botsT=Number(localStorage.getItem('mh_botsT')||0)}catch(e){}
function salvarFloor(){try{localStorage.setItem('mh_floor',JSON.stringify(window.MH_FLOOR))}catch(e){}}
function aplicar(c,quando){const F=window.MH_FLOOR||(window.MH_FLOOR={}),FX=window.MH_FX||{};
 if(c.a==='ad'||c.a==='adx'){const A=window.MH_ADS,i=Number(c.i);if(!A||!(i>=0&&i<A.total))return;
  if(c.a==='adx'){const v=A.vs()[i];if(v&&v._ctl&&(v._q||0)<=quando)A.clear(i);return}
  const m=Math.max(1,Math.min(10080,Number(c.m)||0)),fim=quando+m*60000;
  if(fim<=Date.now()||quando<=(F.outdoor||0))return;
  const v0=A.vs()[i];if(v0&&v0._ctl&&(v0._q||0)>quando)return;
  A.put(i,{name:String(c.nome||'').slice(0,40),text:String(c.texto||'').slice(0,60),end:fim,total:m*60000,tag:c.tag||'',img:null,_ctl:1,_q:quando});return}
 if(c.a==='verif'){if(window.MH_VERIF)MH_VERIF(c.n,!!c.v,quando);return}
 if(c.a==='aviso'){if(window.MH_AVISO)MH_AVISO.set(c.v||'',Number(c.ate)||0,quando);return}
 if(c.a==='bots'){if(quando>botsT){botsT=quando;try{localStorage.setItem('mh_botsT',String(quando))}catch(e){}if(FX.bots)FX.bots(!!c.v)}return}
if(c.a==='apagar'){if(FX.apagarMsg)FX.apagarMsg(String(c.id||''));return}
 if(c.a==='limpar'){const T=['sala','salas','guilda','outdoor'],al=c.alvo==='tudo'?T:[c.alvo];
  al.forEach(a=>{if(T.indexOf(a)<0)return;if(quando>(F[a]||0)){F[a]=quando;if(FX.limpar)FX.limpar(a,quando)}});salvarFloor()}}
DB.ctl=async function(cmd){
 const t=Date.now(),A=window.MH_API;
 if(A&&A.on()&&A.admTk()){
  const r=await A.req('/admin/ctl',{token:A.admTk(),body:{cmd}});
  if(r.ok&&r.j&&r.j.ok){seen.add(r.j.id);aplicar(cmd,Number(r.j.ts)||tsLocal());return 'todos'}
  if(r.status===401)A.setAdmTk('');
  window.MH_CTL_ERRO=(r.j&&r.j.erro)||('erro '+r.status);aplicar(cmd,tsLocal());diag('controle: '+((r.j&&r.j.erro)||r.status),true);return 'erro'}
 if(!DB.ctlPronto()){aplicar(cmd,tsLocal());return 'local'}
 try{const payload=JSON.stringify(Object.assign({n:rid('')},cmd,{t})),sig=await assinar(payload),id=rid('c');seen.add(id);
  const r=await ins(COL.msg,{_id:id,sala:'sala',autor:'ADM',papel:'cliente',oficio:'',texto:payload,categoria:sig,tipo:'ctl'});
  /* usa a hora do SERVIDOR (não a do relógio deste aparelho), senão o relógio errado esconde mensagens dos outros */
  let ts=tsLocal();try{if(r&&r._createdDate){const z=dt(r._createdDate).getTime();if(z>0)ts=z}}catch(e){}
  aplicar(cmd,ts);return 'todos'}
 catch(e){aplicar(cmd,tsLocal());diag('controle: '+msgErro(e),true);return 'erro'}};
async function tratarCtl(x){if(!(await verificar(x.texto,x.categoria)))return;let c;try{c=JSON.parse(x.texto)}catch(e){return}aplicar(c,dt(x._createdDate).getTime())}
async function lerCtl(){try{const r=await q(COL.msg).eq('tipo','ctl').descending('_createdDate').limit(200).find();const it=((r&&r.items)||[]).slice().reverse();
 for(const x of it){if(seen.has(x._id))continue;seen.add(x._id);await tratarCtl(x)}}catch(e){diag('controle: '+msgErro(e),true)}}

async function poll(){
 let b=q(COL.msg);
 b=ultimo?b.ge('_createdDate',new Date(ultimo.getTime()-60000)).ascending('_createdDate').limit(100):b.descending('_createdDate').limit(60);
 const r=await b.find();let it=(r&&r.items)||[];if(!ultimo)it=it.slice().reverse();let nov=0;const inicial=!ultimo;let ref=0;it.forEach(x=>{const z=dt(x._createdDate).getTime();if(z>ref)ref=z});
 if(ref>0){if(ref>(window.MH_SRVT||0))window.MH_SRVT=ref;
  /* conserta piso gravado com o relógio errado de um aparelho (maior que a última mensagem do servidor); os pisos de verdade voltam pelos comandos abaixo */
  if(inicial){const F=window.MH_FLOOR;if(F){let m=0;for(const a in F)if(F[a]>ref+60000){F[a]=0;m=1}if(m)salvarFloor()}}}
 for(const x of it){const d=dt(x._createdDate);if(!ultimo||d>ultimo)ultimo=d;
  if(seen.has(x._id))continue;seen.add(x._id);nov++;
  const ms=d.getTime();
  if(x.tipo==='ctl'){await tratarCtl(x);continue}
  if(x.tipo==='sos'&&inicial&&ref-ms>600000)continue;
  if(window.MH_RX)MH_RX.msg(Object.assign({},x,{_quando:ms,_aoVivo:!inicial}))}
 if(window.MH_RX)MH_RX.fim();return nov>=100?100:0}
async function ciclo(){
 try{let n;do{n=await poll()}while(n>=100);falhas=0;avisou=false}
 catch(e){falhas++;diag('leitura das mensagens: '+msgErro(e),true);
  if(falhas>=4&&!avisou&&window.MH_RX){avisou=true;MH_RX.aviso('*** Sem conexão com o banco no momento. O chat tenta voltar sozinho. ***')}}
 setTimeout(ciclo,document.hidden?12000:3500)}

let avN=-1,avUlt='';
async function lerAv(){
 try{const r=await q(COL.av).ascending('_createdDate').limit(1000).find(),it=(r&&r.items)||[];
  const ult=it.length?it[it.length-1]._id:'';
  if(it.length!==avN||ult!==avUlt){avN=it.length;avUlt=ult;if(window.MH_RX)MH_RX.avs(it)}}
 catch(e){diag('avaliações: '+msgErro(e),true)}}
async function lerAds(){
 const T=v=>{if(v==null||v==='')return NaN;if(typeof v==='object'&&v.$date)v=v.$date;if(typeof v==='number')return v<1e12?v*1000:v;const n=Number(v);return Number.isFinite(n)&&String(v).trim()!==''?(n<1e12?n*1000:n):new Date(v).getTime()};
 try{const r=await q(COL.ad).limit(100).find(),it=(r&&r.items)||[],ag=Date.now();
  const l=[],mot={pendente:0,limpo:0,vencido:0};it.forEach(x=>{if(x.status==='pendente'){mot.pendente++;return}const i0=T(x.inicio),ini=Number.isFinite(i0)?i0:T(x._createdDate),mn=Number(x.minutos)||Number(x.min)||0,fv=T(x.validade!=null?x.validade:(x.fim!=null?x.fim:x.expira));let fim=Number.isFinite(fv)?fv:ini+mn*60000;if(ini<=((window.MH_FLOOR||{}).outdoor||0)){mot.limpo++;return}
   if(fim>ag)l.push({vaga:x.vaga,nome:x.nome,texto:x.texto,minutos:mn||Math.max(1,Math.round((fim-ini)/60000)),imagem:x.imagemUrl||x.imagem,link:x.link||'',tag:x.status==='cortesia'?'cortesia':'',fim});else mot.vencido++});
  if(DIAG)it.slice().sort((a,b)=>T(b._createdDate)-T(a._createdDate)).slice(0,3).forEach(x=>diag('amostra: vaga='+x.vaga+' min='+x.minutos+' inicio='+JSON.stringify(x.inicio)+' validade='+JSON.stringify(x.validade)+' restam='+Math.round((T(x.validade!=null?x.validade:x.fim)-Date.now())/60000)+'min status='+x.status+' criado='+JSON.stringify(x._createdDate)));
  if(DIAG)diag('anúncios: '+it.length+' no banco · '+l.length+' no ar'+(l.length?' (vaga '+l.map(z=>z.vaga).join(', ')+')':'')+' · ignorados: '+mot.pendente+' pendentes, '+mot.limpo+' limpos pelo ADM, '+mot.vencido+' vencidos · tela pronta: '+(window.MH_RX?'sim':'NÃO'));
  if(window.MH_RX)MH_RX.ads(l)}
 catch(e){diag('anúncios: '+msgErro(e),true)}}
async function lerAp(){
 try{const r=await q(COL.ap).limit(100).find(),it=(r&&r.items)||[];
  if(window.MH_RX)MH_RX.apoio(it.filter(x=>x.nome).map(x=>({nome:x.nome,valor:x.valor,mostrarValor:!(x.mostrarValor===false||x.mostrarValor==='false'||x.mostrarValor==='nao'||x.mostrarValor==='não')})))}
 catch(e){diag('apoiadores: '+msgErro(e),true)}}
async function lerNomes(){
 try{const r=await q(COL.perf).ascending('_createdDate').limit(1000).find(),it=(r&&r.items)||[],hs=[],fund=new Set();
  it.forEach(x=>{if(!x.nome)return;const n=String(x.nome);DB.nomes.add(n.toLowerCase());if(x.papel==='helper'){hs.push(x);if(fund.size<100)fund.add(n)}});
  window.MH_FUND=fund;window.MH_HELPERS=hs.map(x=>({nome:String(x.nome),oficio:x.oficio||''}));try{window.MH_profRefresh&&MH_profRefresh()}catch(e){}
  {const of={};it.forEach(x0=>{String(x0.oficio||'').split(/[,;]+/).forEach(pt=>{const x={papel:x0.papel,oficio:pt};if(x.papel==='helper'&&x.oficio.trim()){const w=String(x.oficio).trim(),k=w.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();if(!k)return;(of[k]=of[k]||{nome:w,n:0}).n++}})});window.MH_OFICIOS=of}
  {const nn=new Set();it.forEach(x=>{if(x.nome)nn.add(String(x.nome).toLowerCase())});window.MH_STATS_WIX={cad:nn.size,help:hs.length};try{window.MH_pintarPulse&&MH_pintarPulse()}catch(e){}}
  const ce=document.getElementById('contaPre'),k=DB.nomes.size;if(ce&&k>0){ce.hidden=false;ce.textContent='● '+k+(k===1?' pessoa já está':' pessoas já estão')+' na lista do Vale do Araguaia'}
  const he=document.getElementById('helperSemana');if(he&&hs.length){const h=hs[Math.floor(Date.now()/604800000)%hs.length];he.hidden=false;he.textContent='⭐ Helper da semana: '+h.nome+(h.oficio?' · '+h.oficio:'')}}
 catch(e){diag('perfis: '+msgErro(e),true)}}

/* mural de recados (coleção Recados: alvo, de, texto) e frase do perfil (guardada em Mensagens, tipo "frase") */
DB.recado=async function(alvo,de,texto){
 if(!DB.ok)return;
 try{await ins(COL.rec,{alvo:String(alvo),de:String(de),texto:String(texto).slice(0,100)})}
 catch(e){diag('recado: '+msgErro(e),true);if(window.MH_RX)MH_RX.aviso('*** Não consegui enviar o recado. ***')}};
DB.frase=async function(texto){
 if(!DB.ok)return;const eu=window.MH_UI&&MH_UI.eu&&MH_UI.eu();if(!eu)return;
 const id=rid('f');seen.add(id);
 try{await ins(COL.msg,{_id:id,sala:'perfil',autor:eu.nome,papel:eu.role,oficio:eu.work||'',texto:String(texto||'').slice(0,60),tipo:'frase',categoria:'',respNome:'',respTexto:''})}
 catch(e){diag('frase: '+msgErro(e),true)}};
DB.foto=async function(url){
 if(!DB.ok)return false;const eu=window.MH_UI&&MH_UI.eu&&MH_UI.eu();if(!eu)return false;
 const id=rid('p');seen.add(id);
 try{await ins(COL.msg,{_id:id,sala:'perfil',autor:eu.nome,papel:eu.role,oficio:eu.work||'',texto:String(url||'').slice(0,20000),tipo:'foto',categoria:'',respNome:'',respTexto:''});return true}
 catch(e){diag('foto: '+msgErro(e),true);return false}};
DB.portfoto=async function(slot,u){
 if(!DB.ok)return;const eu=window.MH_UI&&MH_UI.eu&&MH_UI.eu();if(!eu)return;
 const id=rid('q');seen.add(id);
 try{await ins(COL.msg,{_id:id,sala:'perfil',autor:eu.nome,papel:eu.role,oficio:eu.work||'',texto:(Number(slot)+1)+'|'+String(u||'').slice(0,19000),tipo:'portfoto',categoria:'',respNome:'',respTexto:''})}
 catch(e){diag('portfólio: '+msgErro(e),true)}};
DB.contato=async function(o){
 if(!DB.ok)return;const eu=window.MH_UI&&MH_UI.eu&&MH_UI.eu();if(!eu)return;
 const id=rid('k');seen.add(id);
 try{await ins(COL.msg,{_id:id,sala:'perfil',autor:eu.nome,papel:eu.role,oficio:eu.work||'',texto:JSON.stringify({ig:String(o.ig||''),wa:String(o.wa||''),mostrar:o.mostrar?1:0}).slice(0,200),tipo:'contato',categoria:'',respNome:'',respTexto:''})}
 catch(e){diag('contatos: '+msgErro(e),true)}};
/* o portfólio é lido só quando alguém abre aquele perfil (não pesa na entrada do site) */
DB.portLer=async function(nome){
 const r1=await q(COL.msg).eq('tipo','portfoto').eq('autor',nome).descending('_createdDate').limit(30).find();
 ((r1&&r1.items)||[]).slice().reverse().forEach(x=>{if(window.MH_RX&&MH_RX.port)MH_RX.port('portfoto',x.autor,x.texto)});
 const r2=await q(COL.msg).eq('tipo','contato').eq('autor',nome).descending('_createdDate').limit(1).find();
 ((r2&&r2.items)||[]).forEach(x=>{if(window.MH_RX&&MH_RX.port)MH_RX.port('contato',x.autor,x.texto)})};
async function lerFotos(){
 try{const r=await q(COL.msg).eq('tipo','foto').descending('_createdDate').limit(150).find(),it=((r&&r.items)||[]).slice().reverse();
  it.forEach(x=>{(window.MH_FOTO_PUB=window.MH_FOTO_PUB||{})[x.autor]=String(x.texto||'');if(window.MH_RX&&MH_RX.foto)MH_RX.foto(x.autor,x.texto)});window.MH_FOTOS_LIDAS=true}
 catch(e){diag('fotos: '+msgErro(e),true)}}
let recOff=false;
async function lerRec(){
 if(recOff)return;
 try{const r=await q(COL.rec).ascending('_createdDate').limit(500).find(),it=(r&&r.items)||[];
  if(window.MH_RX&&MH_RX.rec)MH_RX.rec(it.map(x=>({alvo:x.alvo,de:x.de,texto:x.texto,_quando:dt(x._createdDate).getTime()})))}
 catch(e){recOff=true;diag('recados (crie a coleção Recados no CMS): '+msgErro(e),true)}}
async function lerFrases(){
 try{const r=await q(COL.msg).eq('tipo','frase').descending('_createdDate').limit(300).find(),it=((r&&r.items)||[]).slice().reverse();
  it.forEach(x=>{if(window.MH_RX&&MH_RX.frase)MH_RX.frase(x.autor,x.texto)})}
 catch(e){diag('frases: '+msgErro(e),true)}}
async function testeCompleto(){
 for(const k in COL){try{await q(COL[k]).limit(1).find();diag('ler '+COL[k]+': ok')}catch(e){diag('ler '+COL[k]+': '+msgErro(e),true)}}
 diag('Fim do teste. Linhas com ✗ mostram o que falta arrumar.')}

async function iniciar(){
 try{const sv=JSON.parse(localStorage.getItem('mh_eu')||'null');
  if(sv&&sv.nome){DB.meu=sv.nome;
   const set=(id,v)=>{const e=document.getElementById(id);if(e&&v)e.value=v};
   set('n',sv.nome);set('t',sv.tel);set('e',sv.em);set('w',sv.work);
   if(sv.role==='helper'){const r=document.querySelector('input[name=r][value=Helper]');if(r){r.checked=true;r.dispatchEvent(new Event('change',{bubbles:true}))}}}}catch(e){}
 if(!CFG.clientId){console.log('MiHelp: modo demonstração (sem Client ID).');return}
 const conectar=async(n)=>{
  let sdk,dat,ult;
  for(const [a,b] of CDNS){const suf=n?(a.indexOf('?')<0?'?':'&')+'mh='+n:'';
   try{[sdk,dat]=await Promise.all([import(a+suf),import(b+suf)]);diag('Módulos carregados de '+new URL(a).host);ult=null;break}catch(e){ult=e;diag('Falhou em '+new URL(a).host+': '+msgErro(e))}}
  if(ult)throw ult;
  client=sdk.createClient({auth:sdk.OAuthStrategy({clientId:CFG.clientId}),modules:{items:dat.items}});
  await q(COL.perf).limit(1).find();
  DB.ok=true;diag('Conectado ao Wix. Banco ligado.')};
 const seguir=async()=>{
  if(DIAG)testeCompleto();
  await lerCtl();
  lerNomes();lerAv();lerAds();lerAp();lerFrases();lerFotos();ciclo();
  setInterval(lerAv,25000);setInterval(lerAds,20000);setInterval(lerAp,15000);setInterval(lerNomes,60000);setInterval(lerFrases,60000);setInterval(lerFotos,120000);
  const antiga=window.MH_denuncia;window.MH_denuncia=n=>{try{antiga&&antiga(n)}catch(e){}DB.denuncia(n)}};
 try{await conectar(0)}catch(e){
  diag('NÃO conectou: '+msgErro(e),true);
  const aviso=()=>window.MH_RX&&MH_RX.aviso('*** Sem conexão com o banco. Nada do que você fizer agora será salvo. Tentando de novo sozinho. ***');
  setTimeout(aviso,1500);
  /* celular com sinal fraco: continua tentando em vez de desistir */
  let n=0,ocupado=false;const rep=setInterval(async()=>{
   if(DB.ok){clearInterval(rep);return}
   if(ocupado)return;ocupado=true;n++;
   try{await conectar(n)}catch(e2){diag('Nova tentativa '+n+' falhou: '+msgErro(e2),true);ocupado=false;return}
   clearInterval(rep);ocupado=false;
   if(window.MH_RX)MH_RX.aviso('*** Conectado. O chat voltou. ***');
   seguir()},15000);
  return}
 seguir();
 setTimeout(function(){try{const n=window.MH_ADS?MH_ADS.vs().filter(Boolean).length:0;diag('RESUMO: '+n+' anúncio(s) no ar neste aparelho · banco '+(DB.ok?'conectado':'SEM conexão')+' · relógio do aparelho: '+(window.MH_SKEW_RAW==null?'não medido':(Math.abs(MH_SKEW_RAW)<120000?'certo':Math.round(Math.abs(MH_SKEW_RAW)/60000)+' min '+(MH_SKEW_RAW<0?'ADIANTADO':'ATRASADO')+' (corrigido pelo site)'))+(n?'':' · se o ADM publicou anúncio, ele NÃO está chegando aqui (veja as linhas acima: permissão da coleção Anuncios ou servidor)'),!n)}catch(e){}},9000);
}
iniciar();
})();

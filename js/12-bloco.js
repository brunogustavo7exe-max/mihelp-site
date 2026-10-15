
try{(function(){
const $=id=>document.getElementById(id);
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const ADS=window.MH_ADS,UI=window.MH_UI,PIX=window.MH_PIX,TIT=window.MH_TITULOS;
if(!ADS||!UI||!PIX||!TIT){console.error('MiHelp admin: ganchos não encontrados');return}

// ---- armazenamento: hoje é o navegador. Para ligar ao Wix, troque só get/set ----
const K='mihelp_adm_v1:';
const store={
  get(k,d){try{const v=localStorage.getItem(K+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){let ok=false;try{localStorage.setItem(K+k,JSON.stringify(v));ok=true}catch(e){}
    if((k==='meta'||k==='titulos'||k==='duelo'||k==='enquete'||k==='helpers_fora'||k==='banidos'||k==='ofi_cfg')&&window.MH_API&&MH_API.on()&&MH_API.admTk())pushCfg(k,v);return ok}
};
/* meta e títulos também vão para o servidor, para todo mundo ver (não só este navegador) */
const cfgPend={};let cfgT=null;
function pushCfg(k,v){cfgPend[k]=JSON.stringify(v);clearTimeout(cfgT);cfgT=setTimeout(async()=>{const A=window.MH_API,itens=Object.assign({},cfgPend);for(const x in cfgPend)delete cfgPend[x];
  const r=await A.req('/admin/config',{token:A.admTk(),body:{itens}});
  if(!(r.ok&&r.j&&r.j.ok)){if(r.status===401)A.setAdmTk('');try{say('Salvei só neste navegador: não consegui salvar no servidor.')}catch(e){}}},500)}
if(window.MH_API&&MH_API.on())MH_API.req('/config').then(r=>{if(!r.ok||!r.j)return;
  try{if(r.j.meta){const o=JSON.parse(r.j.meta);if(o&&o.alvo>0&&window.MH_aplicarMeta)MH_aplicarMeta(o)}}catch(e){}
  try{['duelo','enquete'].forEach(c=>{if(typeof r.j[c]==='string')localStorage.setItem(K+c,r.j[c])})}catch(e){}
  try{if(r.j.titulos){const o=JSON.parse(r.j.titulos);if(o&&typeof o==='object'){Object.keys(TIT).forEach(k=>delete TIT[k]);Object.assign(TIT,o);UI.online()}}}catch(e){}
  try{if(typeof r.j.ofi_cfg==='string'){JSON.parse(r.j.ofi_cfg);localStorage.setItem(K+'ofi_cfg',r.j.ofi_cfg);window.MH_OFI&&MH_OFI.desenha()}}catch(e){}
  try{if(typeof r.j.helpers_fora==='string'){const a=JSON.parse(r.j.helpers_fora);if(Array.isArray(a)){FORA.clear();a.forEach(x=>FORA.add(String(x)));try{localStorage.setItem(K+'helpers_fora',r.j.helpers_fora)}catch(e){}try{window.MH_profRefresh&&MH_profRefresh()}catch(e){}}}}catch(e){}
  try{if(typeof r.j.banidos==='string'){const a=JSON.parse(r.j.banidos);if(Array.isArray(a)){const me=UI.eu(),novo=new Set(a.map(String));[...banidos].forEach(n=>{if(!novo.has(n)){banidos.delete(n);UI.desbanir(n)}});novo.forEach(n=>{if(!banidos.has(n)&&!(me&&me.nome===n)){banidos.add(n);UI.banir(n)}});try{localStorage.setItem(K+'banidos',JSON.stringify([...banidos]))}catch(e){}}}}catch(e){}});

// ---- aplicar o que foi salvo ----
Object.assign(PIX,store.get('pix',{}));
{const sv=store.get('avs',null);if(sv){const A=UI.avs();Object.keys(A).forEach(k=>delete A[k]);Object.assign(A,sv)}}
const banidos=new Set(store.get('banidos',[]));
banidos.forEach(n=>UI.banir(n));
/* helpers tirados da página de Profissionais (vale para todos quando o servidor guarda) */
const FORA=new Set(store.get('helpers_fora',[]));window.MH_FORA=FORA;try{window.MH_profRefresh&&MH_profRefresh()}catch(e){}
const salvaFora=()=>{store.set('helpers_fora',[...FORA]);try{window.MH_profRefresh&&MH_profRefresh()}catch(e){}};
/* lixeira do ADM: guarda o que foi removido para dar para colocar de volta */
const lixo=(tipo,rot,dados)=>{const l=store.get('lixeira',[]);l.unshift({id:Date.now()+Math.random().toString(36).slice(2,5),t:Date.now(),tipo,rot,dados});store.set('lixeira',l.slice(0,20))};
const lugarAd=i=>{const c=i%8;return 'Vaga '+(i+1)+' · Página '+(Math.floor(i/8)+1)+' · '+(c<4?'Esquerda':'Direita')+' '+(c%4+1)};
const lixoAd=(i,v)=>{if(v&&!/exemplo|prévia/.test(v.tag||''))lixo('anuncio',lugarAd(i)+' · '+v.name,{i,v:{name:v.name,text:v.text,end:v.end,total:v.total,tag:v.tag||'',img:v.img||null}})};
store.get('ads',[]).forEach(a=>{if(a&&a.end>Date.now()&&a.i>=0&&a.i<ADS.total)ADS.put(a.i,{name:a.name,text:a.text,end:a.end,total:a.total,tag:a.tag||'',img:a.img||null})});
let OC=store.get('oc',null);
if(!OC){OC=[
 {id:1,quem:'Duda L.',motivo:'(exemplo) Denúncia: combinou no chat e cobrou por fora.',origem:'chat',quando:Date.now()-3600e3,status:'aberta',nota:''},
 {id:2,quem:'Anúncio da vaga 3',motivo:'(exemplo) Texto com promessa enganosa.',origem:'anúncio',quando:Date.now()-7200e3,status:'aberta',nota:''}];
 store.set('oc',OC)}
const salvarOC=()=>store.set('oc',OC);
const abertas=()=>OC.filter(o=>o.status==='aberta').length;
window.MH_denuncia=nome=>{OC.unshift({id:Date.now(),quem:nome,motivo:'Denúncia feita no chat (prévia).',origem:'chat',quando:Date.now(),status:'aberta',nota:''});salvarOC();chipUpd()};

// ---- utilidades ----
const salvarAds=()=>store.set('ads',ADS.vs().map((v,i)=>v&&v.end>Date.now()&&!/exemplo|prévia/.test(v.tag||'')?{i,name:v.name,text:v.text,end:v.end,total:v.total,tag:v.tag||'',img:v.img||null}:null).filter(Boolean));
const salvarAvs=()=>store.set('avs',UI.avs());
const estr=k=>'★'.repeat(k)+'☆'.repeat(5-k);
const savePix=()=>store.set('pix',{chave:PIX.chave,nome:PIX.nome,cidade:PIX.cidade,contato:PIX.contato,qr:PIX.qr||null});
const rest=ms=>{const m=Math.max(0,Math.ceil(ms/60000));return m>=60?Math.floor(m/60)+'h '+String(m%60).padStart(2,'0')+'min':m+' min'};
const quando=t=>new Date(t).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});
function inp(type,max,ph){const i=document.createElement('input');i.type=type;if(max)i.maxLength=max;if(ph)i.placeholder=ph;return i}
function campo(txt,el){const d=mk('div','f');const l=mk('label',0,txt);if(!el.id)el.id='af'+Math.random().toString(36).slice(2,8);l.htmlFor=el.id;d.append(l,el);return d}
function sel(opts){const s=document.createElement('select');opts.forEach(([v,t])=>{const o=mk('option',0,t);o.value=v;s.append(o)});return s}
function lerImg(file,max,tipo,q){return new Promise((ok,err)=>{
 if(!/^image\//.test(file.type))return err(new Error('Escolha um arquivo de imagem.'));
 const url=URL.createObjectURL(file),im=new Image();
 im.onload=()=>{const k=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(url);ok(c.toDataURL(tipo,q))};
 im.onerror=()=>{URL.revokeObjectURL(url);err(new Error('Não consegui abrir essa imagem.'))};im.src=url})}

// ---- login por PIN (guardado só como hash, neste navegador) ----
async function hpin(p){try{if(window.crypto&&crypto.subtle){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('mihelp:'+p));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')}}catch(e){}return 'x'+btoa(unescape(encodeURIComponent('mihelp:'+p)))}
const logado=()=>{try{return sessionStorage.getItem('mh_adm')==='1'&&(!(window.MH_API&&MH_API.on())||!!MH_API.admTk())}catch(e){return false}};
function entrar(){try{sessionStorage.setItem('mh_adm','1')}catch(e){}document.body.classList.add('adm');bar.hidden=false;chipUpd();abrirPainel()}
function sairAdm(){try{sessionStorage.removeItem('mh_adm')}catch(e){}try{window.MH_API&&MH_API.setAdmTk('')}catch(e){}document.body.classList.remove('adm');bar.hidden=true;document.querySelectorAll('dialog[open]').forEach(x=>{try{x.close()}catch(e){}})}
function abrirLoginSenha(){
  const A=window.MH_API;
  const d=mk('dialog');d.setAttribute('aria-label','Entrar no painel');
  const f=mk('form');f.append(mk('h3',0,'Entrar no painel'));
  const a=inp('password',80,'Senha do administrador');a.required=true;a.autocomplete='current-password';
  f.append(campo('Senha do administrador',a));
  const er=mk('p','note');er.style.color='var(--red)';er.setAttribute('role','alert');f.append(er);
  const bt=mk('div','dbt');const ok=mk('button','go','Entrar');ok.type='submit';const cx=mk('button','cx','Cancelar');cx.type='button';cx.onclick=()=>d.close();bt.append(ok,cx);f.append(bt);
  f.addEventListener('submit',async e=>{e.preventDefault();er.textContent='';ok.disabled=true;ok.textContent='Entrando...';
    const r=await A.req('/admin/login',{body:{senha:a.value}});
    ok.disabled=false;ok.textContent='Entrar';
    if(r.ok&&r.j&&r.j.token){A.setAdmTk(r.j.token);d.close();entrar();return}
    er.textContent=r.status===429?'Muitas tentativas. Espere 15 minutos.':r.status===401?'Senha incorreta.':r.status===503?'O servidor ainda não tem a senha do administrador configurada.':r.status>=500?'O servidor respondeu com erro'+((r.j&&r.j.detalhe)?': '+r.j.detalhe:'.'):'Sem conexão com o servidor. Tente de novo.';
    a.value='';a.focus()});
  d.append(f);d.addEventListener('close',()=>d.remove());document.body.append(d);d.showModal();a.focus()}
function abrirLogin(){
  if(window.MH_API&&MH_API.on())return abrirLoginSenha();
  const tem=!!store.get('pin',null);
  const d=mk('dialog');d.setAttribute('aria-label','Entrar no painel');
  const f=mk('form');f.append(mk('h3',0,tem?'Entrar no painel':'Crie o PIN do painel'));
  if(!tem)f.append(mk('p','note','É a primeira vez neste navegador. Escolha um PIN de pelo menos 4 caracteres.'));
  const a=inp('password',32,'PIN');a.required=true;a.autocomplete=tem?'current-password':'new-password';
  f.append(campo('PIN',a));
  let b2=null;if(!tem){b2=inp('password',32,'Repita o PIN');b2.required=true;f.append(campo('Repita o PIN',b2))}
  const er=mk('p','note');er.style.color='var(--red)';er.setAttribute('role','alert');f.append(er);
  const bt=mk('div','dbt');const ok=mk('button','go',tem?'Entrar':'Criar PIN');ok.type='submit';const cx=mk('button','cx','Cancelar');cx.type='button';cx.onclick=()=>d.close();bt.append(ok,cx);f.append(bt);
  f.addEventListener('submit',async e=>{e.preventDefault();er.textContent='';
    if(!tem){if(a.value.length<4){er.textContent='Use pelo menos 4 caracteres.';return}if(a.value!==b2.value){er.textContent='Os dois PINs não são iguais.';return}
      if(!store.set('pin',await hpin(a.value))){er.textContent='Não consegui salvar neste navegador.';return}}
    else if(await hpin(a.value)!==store.get('pin',null)){er.textContent='PIN incorreto.';a.value='';a.focus();return}
    d.close();entrar()});
  d.append(f);d.addEventListener('close',()=>d.remove());document.body.append(d);d.showModal();a.focus()}

// ---- painel ----
const dlg=mk('dialog');dlg.id='admDlg';dlg.setAttribute('aria-label','Painel do administrador');document.body.append(dlg);
const bar=mk('div','admbar');bar.hidden=true;
const chip=mk('button','admchip','ADM');chip.type='button';chip.onclick=()=>abrirPainel();
const sair=mk('button','admexit','Sair do ADM');sair.type='button';sair.onclick=()=>sairAdm();
bar.append(chip,sair);document.body.append(bar);
function chipUpd(){const n=abertas();chip.textContent='ADM'+(n?' · '+n:'')}
let aba='ctl',aviso='',corpoEl=null;
const ADM_T0=Date.now();
const ABAS=[['ctl','Controle'],['sts','Status'],['sup','Suporte'],['ads','Anúncios'],['pes','Pessoas'],['ofi','Ofícios'],['lix','Removidos'],['pix','Pix'],['oc','Ocorrências'],['site','Meta e cargos'],['eu','Meu acesso'],['cfg','Ajustes']];
function say(t){aviso=t;desenhar()}
function abrirPainel(){if(!logado())return abrirLogin();desenhar();if(!dlg.open)dlg.showModal()}
function desenhar(){
  dlg.textContent='';
  const h=mk('div','ahead');h.append(mk('h3',0,'Painel ADM · v6'));const gx=mk('div','aact');const sx=mk('button','cx','Sair do ADM');sx.type='button';sx.onclick=sairAdm;const x=mk('button','cx','Fechar');x.type='button';x.onclick=()=>dlg.close();gx.append(sx,x);h.append(gx);
  dlg.append(h);
  const tb=mk('div','atabs');tb.setAttribute('role','tablist');
  ABAS.forEach(([k,t])=>{const n=k==='oc'?abertas():0;const bt=mk('button',k===aba?'on':'',t+(n?' ('+n+')':''));bt.type='button';bt.setAttribute('role','tab');bt.setAttribute('aria-selected',String(k===aba));bt.onclick=()=>{aba=k;aviso='';desenhar()};tb.append(bt)});
  corpoEl=mk('div','abody');dlg.append(tb,corpoEl);
  if(aviso){const a=mk('p','aviso',aviso);a.setAttribute('role','status');corpoEl.append(a)}
  ({sts:tSts,ctl:tCtl,sup:tSup,ads:tAds,pes:tPes,ofi:tOfi,lix:tLix,pix:tPix,oc:tOc,site:tSite,eu:tEu,cfg:tCfg})[aba](corpoEl);
  dlg.scrollTop=0;chipUpd()}

window.MH_chamadoAdm=(quem,motivo)=>{OC.unshift({id:Date.now(),quem,motivo,origem:'chamado',quando:Date.now(),status:'aberta',nota:''});salvarOC();chipUpd()};
{const c=store.get('cargos',{});UI.pessoas().forEach(p=>{if(c[p.nome]&&p.role==='helper')p.work=c[p.nome]})}

function tOfi(b){
  b.append(mk('p','note','Botões de "Do que você precisa?". Escolha a cor de cada um e use ⬆ ⬇ para mudar a ordem. 🆘 = pode disparar SOS. As mudanças valem para todo mundo.'));
  const O=window.MH_OFI;if(!O){b.append(mk('p','note','Os botões ainda não carregaram. Feche e abra o painel.'));return}
  const c=O.cfg(),nomes=O.lista().map(x=>x[1]);
  const salva=()=>{store.set('ofi_cfg',{ord:nomes.slice(),cor:c.cor});O.desenha()};
  const lista=mk('div');
  nomes.forEach((n,i)=>{
    const ic=O.lista().find(x=>x[1]===n)[0];
    const l=mk('div');l.style.cssText='display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--line);flex-wrap:wrap';
    const nm=mk('span',0,ic+' '+n+(O.sos(n)?' 🆘':''));nm.style.cssText='flex:1 1 140px;font-weight:700';
    const ci=document.createElement('input');ci.type='color';ci.value=/^#[0-9a-f]{6}$/i.test(c.cor[n]||'')?c.cor[n]:'#ffffff';ci.setAttribute('aria-label','Cor de '+n);ci.style.cssText='width:44px;height:36px;padding:0;border:1px solid var(--line);background:none';
    ci.onchange=()=>{c.cor[n]=ci.value;salva();say('Cor de '+n+' salva.')};
    const lc=mk('button','cx','Sem cor');lc.type='button';lc.onclick=()=>{delete c.cor[n];salva();say('Cor de '+n+' removida.')};
    const up=mk('button','cx','⬆');up.type='button';up.setAttribute('aria-label','Subir '+n);up.disabled=i===0;
    const dn=mk('button','cx','⬇');dn.type='button';dn.setAttribute('aria-label','Descer '+n);dn.disabled=i===nomes.length-1;
    const troca=d=>{const t=nomes[i];nomes[i]=nomes[i+d];nomes[i+d]=t;salva();say(n+' mudou de lugar.')};
    up.onclick=()=>troca(-1);dn.onclick=()=>troca(1);
    l.append(nm,ci,lc,up,dn);lista.append(l)});
  const rs=mk('button','cx','Voltar ao padrão');rs.type='button';rs.style.marginTop='12px';
  rs.onclick=()=>{store.set('ofi_cfg',{ord:[],cor:{}});O.desenha();say('Voltou ao padrão.')};
  b.append(lista,rs)}

let ctlConf='';
function tSts(b){
  const out=mk('div','trm');out.setAttribute('role','log');out.setAttribute('aria-live','polite');
  const linha=(x,c)=>{out.append(mk('div',c||'',x));out.scrollTop=out.scrollHeight};
  const pad=n=>String(n).padStart(2,'0'),dots=(k,v)=>k+' '+'.'.repeat(Math.max(2,16-k.length))+' '+v;
  const hora=()=>{const d=new Date();return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear()+' '+pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds())};
  const sessao=()=>{const s=Math.floor((Date.now()-ADM_T0)/1000);return pad(Math.floor(s/60))+':'+pad(s%60)};
  const on=!!(window.MH_DB&&MH_DB.ok);
  const status=()=>{linha(dots('BANCO',on?'ONLINE (compartilhado)':'LOCAL (so neste aparelho)'),on?'ok':'er');
    linha(dots('OCORRENCIAS',abertas()+' abertas'));
    try{linha(dots('PESSOAS',UI.pessoas().length+' na lista'))}catch(e){}
    linha(dots('TELA',innerWidth+'x'+innerHeight));linha(dots('SESSAO',sessao()));linha(dots('HORA',hora()))};
  const IR={ctl:'ctl',controle:'ctl',sts:'sts',status:'sts',sup:'sup',suporte:'sup',ads:'ads',anuncios:'ads',pes:'pes',pessoas:'pes',pix:'pix',oc:'oc',ocorrencias:'oc',site:'site',eu:'eu',cfg:'cfg',ajustes:'cfg'};
  const cmd=v=>{const c=v.trim().toLowerCase();if(!c)return;linha('> '+v.trim(),'mu');
    if(c==='ajuda'||c==='help')linha('comandos: status | hora | limpar | ir <aba> (ctl sts sup ads pes pix oc site eu cfg) | sair','mu');
    else if(c==='status')status();else if(c==='hora')linha(hora());
    else if(c==='limpar'||c==='clear')out.textContent='';
    else if(c==='sair'||c==='exit')sairAdm();
    else if(c.startsWith('ir ')&&IR[c.slice(3).trim()]){aba=IR[c.slice(3).trim()];aviso='';desenhar()}
    else linha('comando nao reconhecido: '+c+' (digite ajuda)','er')};
  const f=mk('form','trmin');f.append(mk('b',0,'adm@mihelp:~$'));
  const i=document.createElement('input');i.type='text';i.autocomplete='off';i.spellcheck=false;i.setAttribute('aria-label','Comando do terminal');f.append(i);
  f.addEventListener('submit',e=>{e.preventDefault();cmd(i.value);i.value=''});
  b.append(out,f);linha('MiHelp ADM v6 | digite "ajuda" para ver os comandos','mu');status()}
function tChaveSrv(b){
  const A=window.MH_API;
  b.append(mk('h4',0,'Chave de controle (servidor)'));
  const box=mk('div');b.append(box);
  const pubSite=(()=>{try{let j=(window.MH_CFG||{}).adminPub;if(typeof j==='string')j=JSON.parse(j);return j&&j.x&&j.y?j:null}catch(e){return null}})();
  const area=(rot,val)=>{const l=mk('p','note',rot);const t=mk('textarea');t.readOnly=true;t.rows=3;t.value=val;t.setAttribute('aria-label',rot);t.onfocus=()=>t.select();
    const c=mk('button','cx','Copiar');c.type='button';c.onclick=()=>{t.select();try{navigator.clipboard.writeText(t.value)}catch(e){}say('Copiado.')};box.append(l,t,c)};
  box.append(mk('p','note','Conferindo com o servidor...'));
  A.req('/admin/chave',{token:A.admTk()}).then(r=>{box.textContent='';
    if(!r.ok){box.append(mk('p','note','Não consegui falar com o servidor. Saia e entre de novo no painel.'));return}
    const j=r.j||{};
    if(!j.configurada){
      box.append(mk('p','note','Sem esta chave, limpar e apagar só valem neste aparelho. O servidor cria a chave uma vez; você copia dois textos (um para o Cloudflare e um para o index.html).'));
      const go=mk('button','go','Gerar chave no servidor');go.type='button';
      go.onclick=async()=>{go.disabled=true;const g=await A.req('/admin/chave',{token:A.admTk(),method:'POST',body:{}});
        if(!(g.ok&&g.j&&g.j.CTL_PRIV)){say(g.status===409?'Já existe uma chave no servidor. Atualize esta tela.':'Não consegui gerar a chave.');return}
        box.textContent='';box.append(mk('p','note','Guarde só agora e não mostre a ninguém. Depois de colar nos dois lugares, esta tela não mostra mais o segredo.'));
        area('1) Cloudflare: Worker > Settings > Variables and Secrets > crie o segredo CTL_PRIV com este valor (tipo Secret).',g.j.CTL_PRIV);
        area('2) index.html: dentro de window.MH_CFG={ ... } acrescente isto e publique de novo.',g.j.linha)};
      box.append(go);return}
    const ok=pubSite&&j.pub&&pubSite.x===j.pub.x&&pubSite.y===j.pub.y;
    if(ok)box.append(mk('p','note','Chave ligada: limpar, apagar, aviso e bots valem para todos, em qualquer aparelho.'));
    else{box.append(mk('p','note','O servidor já tem a chave, mas o index.html ainda não tem a parte pública (ou é de outra chave). Sem isso o site ignora os comandos. Acrescente isto dentro de window.MH_CFG={ ... } e publique de novo.'));
      area('Parte pública',"adminPub:{x:'"+j.pub.x+"',y:'"+j.pub.y+"'}")}})}
function tCtl(b){
  const DB=window.MH_DB||{},pronto=!!(DB.ctlPronto&&DB.ctlPronto());
  b.append(mk('h4',0,'Controle rápido'));
  b.append(mk('p','note',pronto?'O que você fizer aqui vale para todo mundo, na hora, mesmo com gente na sala.':'Por enquanto isto vale só neste navegador. Para valer para todo mundo, termine a "Chave de admin" lá embaixo e confirme que o banco está conectado.'));
  const run=async(cmd,ok)=>{ctlConf='';let r='local';try{r=DB.ctl?await DB.ctl(cmd):'local'}catch(e){r='erro'}
    say(r==='todos'?ok+' Vale para todos.':r==='erro'?ok+' Mas não consegui avisar os outros. Tente de novo.':ok+' Só neste navegador.')};
  const on=!!(UI.botsOn&&UI.botsOn());
  const r=mk('div','arow'),info=mk('div','ainfo');
  info.append(mk('b',0,'Bots da sala'),mk('span',0,on?'Ligados: conversam e respondem.':'Desligados: só pessoas de verdade.'));
  const sw=mk('button',on?'cx':'go',on?'Desligar bots':'Ligar bots');sw.type='button';
  sw.onclick=()=>run({a:'bots',v:!on},on?'Bots desligados.':'Bots ligados.');
  r.append(info,sw);b.append(r);
  b.append(mk('h4',0,'Aviso geral'));
  b.append(mk('p','note','Aparece numa faixa no topo do site para todo mundo, assinado como Equipe MiHelp.'));
  const avT=inp('text',120,'Ex.: Manutenção hoje às 22h'),avD=sel([['60','1 hora'],['360','6 horas'],['1440','24 horas'],['0','Até eu tirar']]);
  const avP=mk('button','go','Publicar aviso');avP.type='button';
  avP.onclick=()=>{const t=avT.value.trim();if(!t)return say('Escreva o aviso.');const m=Number(avD.value);run({a:'aviso',v:t.slice(0,120),ate:m?Date.now()+m*60000:0},'Aviso publicado.')};
  const avR=mk('button','cx','Tirar aviso');avR.type='button';avR.onclick=()=>run({a:'aviso',v:'',ate:0},'Aviso removido.');
  const avA=mk('div','aact');avA.append(avP,avR);
  b.append(campo('Texto do aviso',avT),campo('Por quanto tempo',avD),avA);
  b.append(mk('h4',0,'Limpar'));
  [['sala','Chat Geral','Esvazia a sala Geral.'],['salas','Outras salas','Classificados, Amizade, Construção e as demais.'],['guilda','Guilda','Tira as missões e os chamados.'],['outdoor','Outdoors digitais','Tira todos os anúncios do ar.'],['tudo','Tudo isso de uma vez','Faz as quatro limpezas juntas.'],...(window.MH_PLACAR?[['placar','Placar do Fliperama (todos)','Zera os recordes de todos os jogos neste aparelho.']].concat(MH_PLACAR.lista().map(([id,n])=>['p:'+id,'Placar: '+n,'Zera só este jogo.'])):[])].forEach(([k,t,d])=>{
    const row=mk('div','arow'),inf=mk('div','ainfo');inf.append(mk('b',0,t),mk('span',0,d));
    const sure=ctlConf===k;const bt=mk('button',sure?'go':'cx',sure?'Toque de novo para confirmar':'Limpar');bt.type='button';
    bt.onclick=()=>{if(!sure){ctlConf=k;desenhar();return}if(k==='placar'||k.indexOf('p:')===0){ctlConf='';try{MH_PLACAR.limpar(k==='placar'?undefined:k.slice(2))}catch(x){}say(t+' limpo.');return}run({a:'limpar',alvo:k},t+' limpo.')};
    row.append(inf,bt);b.append(row)});
  b.append(mk('p','note','Limpar esconde das telas. As mensagens e pedidos continuam guardados no banco de dados. Para apagar de vez, apague no CMS.'));
  if(window.MH_API&&MH_API.on()){tChaveSrv(b);return}
  b.append(mk('h4',0,'Chave de admin'));
  const K=DB.chave;
  if(!K){b.append(mk('p','note','Esta parte do site não carregou. Atualize a página.'));return}
  if(!K.existe()){
    b.append(mk('p','note','Esta chave prova que o pedido de limpar veio de você. Sem ela, qualquer pessoa poderia limpar o chat de todo mundo. Crie uma vez, neste navegador.'));
    const go=mk('button','go','Criar chave de admin');go.type='button';
    go.onclick=async()=>{try{await K.gerar();say('Chave criada. Agora cole a linha que apareceu abaixo no index.html e publique de novo.')}catch(e){say('Não consegui criar a chave neste navegador.')}};
    b.append(go);return}
  if(K.ligada()){b.append(mk('p','note','Chave ligada ao site. '+(DB.ok?'Banco conectado.':'Mas o banco não está conectado agora.')))}
  else{
    b.append(mk('p','note','Falta um passo: abra o index.html, troque a linha que começa com window.MH_CFG por esta, salve e publique de novo.'));
    const ta=mk('textarea');ta.readOnly=true;ta.rows=5;ta.value=K.linha();ta.setAttribute('aria-label','Linha para colar no index.html');ta.onfocus=()=>ta.select();b.append(ta);
    const cp=mk('button','cx','Copiar linha');cp.type='button';cp.onclick=()=>{ta.select();try{navigator.clipboard.writeText(ta.value)}catch(e){}say('Linha copiada.')};b.append(cp)}
  b.append(mk('h4',0,'Backup da chave'));
  b.append(mk('p','note','A chave fica só neste navegador. Para usar o painel em outro aparelho, copie o backup e importe lá. Guarde em lugar seguro e não mostre a ninguém.'));
  const bk=mk('button','cx','Copiar backup da chave');bk.type='button';bk.onclick=()=>{try{navigator.clipboard.writeText(K.exportar());say('Backup copiado.')}catch(e){say('Não consegui copiar.')}};b.append(bk);
  const im=mk('textarea');im.rows=3;im.placeholder='Cole aqui um backup para importar';im.setAttribute('aria-label','Backup da chave para importar');b.append(im);
  const ib=mk('button','cx','Importar backup');ib.type='button';ib.onclick=()=>{try{K.importar(im.value.trim());say('Chave importada.')}catch(e){say('Esse backup não é válido.')}};b.append(ib);
}

function tSup(b){
  b.append(mk('h4',0,'Mensagens do suporte'));
  const box=mk('div');b.append(box);
  const loc=()=>{try{return JSON.parse(localStorage.getItem('mh_sup_local')||'[]')||[]}catch(e){return []}};
  const lista=(arr,vazio)=>{if(!arr.length){box.append(mk('p','note',vazio));return}
    arr.forEach(m=>{const r=mk('div','arow'),inf=mk('div','ainfo');
      inf.append(mk('b',0,(m.tipo||'Mensagem')+(m.autor?' · '+m.autor:'')),mk('span',0,new Date(m.quando).toLocaleString('pt-BR')),mk('span',0,m.texto||''));
      if(m.contato)inf.append(mk('span',0,'Contato: '+m.contato));r.append(inf);box.append(r)})};
  const DB=window.MH_DB||{};
  if(DB.ok&&DB.lerSuporte){box.append(mk('p','note','Buscando...'));
    DB.lerSuporte().then(l=>{box.textContent='';lista(l,'Ninguém mandou mensagem ainda.')})
     .catch(()=>{box.textContent='';box.append(mk('p','note','As mensagens de todo mundo ficam na coleção Suporte, no CMS, onde só você pode abrir. Abaixo estão as enviadas deste aparelho.'));lista(loc(),'Nada enviado deste aparelho.')})}
  else{box.append(mk('p','note','Sem conexão com o banco agora. Abaixo estão as mensagens enviadas deste aparelho.'));lista(loc(),'Nada enviado deste aparelho.')}
}
function tSite(b){
  const M=(window.MH_metaAtual&&MH_metaAtual())||{alvo:5000,arrecadado:0,usos:[]};
  b.append(mk('h4',0,'Meta de apoio'));
  const f=mk('form'),al=inp('number',0),ar=inp('number',0);al.min=ar.min='0';al.value=M.alvo;ar.value=M.arrecadado;
  f.append(campo('Meta (R$)',al),campo('Arrecadado (R$)',ar));
  const us=M.usos.map((x,i)=>{const n=inp('text',40),p=inp('number',0);n.value=x[0];p.value=x[1];p.min='0';p.max='100';f.append(campo('Uso '+(i+1)+': nome',n),campo('Uso '+(i+1)+': %',p));return [n,p]});
  const go=mk('button','go','Salvar meta');go.type='submit';f.append(go);
  f.addEventListener('submit',e=>{e.preventDefault();const alvo=Number(al.value);if(!(alvo>0))return say('A meta precisa ser maior que zero.');
    const o={alvo,arrecadado:Math.max(0,Number(ar.value)||0),usos:us.map(([n,p])=>[n.value.trim()||'Outro',Math.max(0,Number(p.value)||0)])};
    store.set('meta',o);window.MH_aplicarMeta&&MH_aplicarMeta(o);say('Meta atualizada.')});
  b.append(f);
  b.append(mk('h4',0,'Cabo de guerra'));
  {const cur=Object.assign({id:'cidades',titulo:'Qual cidade puxa mais forte?'},store.get('duelo',{}));
  cur.a=Object.assign({nome:'Barra do Garças',sigla:'MT',cor:'#E8B93C'},cur.a);cur.b=Object.assign({nome:'Aragarças',sigla:'GO',cor:'#4F8EF7'},cur.b);
  const tt=inp('text',80),an=inp('text',40),as=inp('text',4),ac=inp('color'),bn=inp('text',40),bs=inp('text',4),bc=inp('color');
  tt.value=cur.titulo;an.value=cur.a.nome;as.value=cur.a.sigla;ac.value=cur.a.cor;bn.value=cur.b.nome;bs.value=cur.b.sigla;bc.value=cur.b.cor;
  const f=mk('form');f.append(campo('Título',tt),campo('Lado A: nome',an),campo('Lado A: sigla',as),campo('Lado A: cor',ac),campo('Lado B: nome',bn),campo('Lado B: sigla',bs),campo('Lado B: cor',bc));
  const salva=novo=>{const a=an.value.trim(),bb=bn.value.trim();if(!a||!bb)return say('Preencha o nome dos dois lados.');
    const o={id:novo?'d'+Date.now().toString(36).slice(-7):(cur.id||'cidades'),titulo:tt.value.trim()||'Cabo de guerra da torcida',a:{nome:a,sigla:as.value.trim(),cor:ac.value},b:{nome:bb,sigla:bs.value.trim(),cor:bc.value}};
    store.set('duelo',o);window.MH_aplicarDuelo&&MH_aplicarDuelo(o);say(novo?'Novo cabo de guerra criado. A barra começa do zero.':'Cabo de guerra salvo. O placar foi mantido.')};
  const go=mk('button','go','Salvar (mantém o placar)');go.type='submit';
  const nv=mk('button','cp','Começar novo (zera a barra)');nv.type='button';nv.onclick=()=>{if(confirm('Zerar a barra e começar um cabo de guerra novo?'))salva(true)};
  f.addEventListener('submit',e=>{e.preventDefault();salva(false)});f.append(go,nv);b.append(f);
  b.append(mk('p','note','Quem paga o Pix aparece no letreiro do topo: "NOME pagou R$ 10 para '+cur.a.nome+'". Só aparece depois que o Pix é confirmado.'))}
  b.append(mk('h4',0,'Enquete'));
  {const eq=Object.assign({id:'',pergunta:'',opcoes:[],aberta:true},store.get('enquete',{}));
  const ep=inp('text',120,'Pergunta'),eo=document.createElement('textarea'),ea=inp('checkbox');eo.rows=4;eo.maxLength=400;eo.placeholder='Uma opção por linha (de 2 a 6)';
  ep.value=eq.pergunta||'';eo.value=(eq.opcoes||[]).join('\n');ea.checked=eq.aberta!==false;
  const f=mk('form');f.append(campo('Pergunta',ep),campo('Opções',eo),campo('Aberta para votar',ea));
  const salva=(modo)=>{const ops=eo.value.split('\n').map(x=>x.trim()).filter(Boolean).slice(0,6);
    if(modo==='tirar'){if(eq.pergunta)lixo('enquete','Enquete: '+eq.pergunta,eq);store.set('enquete',{});return say('Enquete removida do site.')}
    if(!ep.value.trim()||ops.length<2)return say('Escreva a pergunta e pelo menos 2 opções.');
    const o={id:modo==='nova'||!eq.id?'e'+Date.now().toString(36).slice(-7):eq.id,pergunta:ep.value.trim(),opcoes:ops,aberta:ea.checked};
    store.set('enquete',o);say(modo==='nova'?'Enquete nova publicada. Os votos começam do zero.':'Enquete salva.')};
  const go=mk('button','go','Publicar enquete nova');go.type='submit';
  const sv=mk('button','cp','Salvar (mantém os votos)');sv.type='button';sv.onclick=()=>salva('manter');
  const rm=mk('button','cp','Remover enquete');rm.type='button';rm.onclick=()=>salva('tirar');
  f.addEventListener('submit',e=>{e.preventDefault();salva('nova')});f.append(go,sv,rm);b.append(f);
  b.append(mk('p','note','Voto grátis, só para quem está logado, 1 voto por conta. Mudar a pergunta ou as opções sem "nova" mantém os votos antigos.'))}
  b.append(mk('h4',0,'Guia do Vale'));
  {const box=mk('div'),AP=window.MH_API;b.append(box);
  if(!(AP&&AP.on()&&AP.admTk()))box.append(mk('p','note','Entre como adm (com a senha) para aprovar as indicações.'));
  else AP.req('/lugares?todos=1',{token:AP.admTk()}).then(r=>{
   const l=(r.ok&&r.j.itens)||[];if(!l.length){box.append(mk('p','note','Nenhuma indicação ainda.'));return}
   const acao=async(x,a,extra)=>{const q=await AP.req('/lugares/moderar',{token:AP.admTk(),body:Object.assign({id:x.id,acao:a},extra||{})});say(q.ok?'Pronto.':'Não consegui: '+((q.j&&q.j.erro)||'erro'))};
   l.forEach(x=>{const c=mk('div','vcard');c.append(mk('b',0,x.nome+(x.status==='pendente'?' (aguardando)':'')+(x.selo?' ⭐':'')),mk('span','vsub',x.categoria+' · '+x.cidade+' · por '+x.autor+(x.bairro?' · '+x.bairro:'')));
    if(x.descricao)c.append(mk('p','vdesc',x.descricao));
    const ac=mk('div','vac');const bt=(t,f)=>{const e=mk('button',0,t);e.type='button';e.onclick=f;ac.append(e)};
    if(x.status==='pendente')bt('Aprovar',()=>acao(x,'aprovar'));
    if(!x.selo)bt('⭐ Dar estrela MiHelp',()=>{const ig=prompt('Link do post no Instagram da MiHelp (opcional):','')||'';acao(x,'selo',{postIg:ig.trim()})});else bt('Tirar estrela',()=>acao(x,'tirarselo'));
    bt(x.status==='pendente'?'Rejeitar':'Apagar',()=>{if(confirm('Remover "'+x.nome+'"?'))acao(x,'apagar')});
    c.append(ac);box.append(c)})})}
  b.append(mk('h4',0,'Cidades pedidas'));
  {const box=mk('div'),AP=window.MH_API;b.append(box);
  if(!(AP&&AP.on()&&AP.admTk()))box.append(mk('p','note','Entre como adm (com a senha) para moderar o ranking de cidades.'));
  else AP.req('/cidades-pedidas').then(r=>{const l=(r.ok&&r.j.itens)||[];
   if(!l.length){box.append(mk('p','note','Nenhuma cidade pedida ainda.'));return}
   l.forEach(x=>{const c=mk('div','vcard');c.append(mk('b',0,x.nome+' ('+x.uf+') · '+x.votos+(x.votos===1?' voto':' votos')));
    const ac=mk('div','vac');const e=mk('button',0,'Remover do ranking');e.type='button';
    e.onclick=async()=>{if(!confirm('Remover "'+x.nome+'" do ranking?'))return;const q=await AP.req('/cidades-pedidas/apagar',{token:AP.admTk(),body:{chave:x.chave}});say(q.ok?'Cidade removida.':'Não consegui remover agora.')};
    ac.append(e);c.append(ac);box.append(c)})})}
  b.append(mk('h4',0,'Cargo dos Helpers'));
  b.append(mk('p','note','Muda o ofício que aparece ao lado do nome. Você pode ser ADM e Helper ao mesmo tempo: o ADM aparece como etiqueta extra.'));
  UI.pessoas().filter(p=>p.role==='helper').forEach(p=>{
    const r=mk('div','arow'),info=mk('div','ainfo');info.append(mk('b',0,p.nome+(p.adm?' (ADM)':'')),mk('span',0,'Hoje: '+p.work));
    const w=inp('text',30,'Novo cargo');w.setAttribute('aria-label','Novo cargo de '+p.nome);
    const ok=mk('button','cp','Salvar');ok.type='button';
    ok.onclick=()=>{const v=w.value.trim();if(!v)return say('Digite o cargo.');p.work=v;const c=store.get('cargos',{});c[p.nome]=v;store.set('cargos',c);UI.online();say('Cargo de '+p.nome+' agora é '+v+'.')};
    const ac=mk('div','aact');ac.append(w,ok);r.append(info,ac);b.append(r)});
}

// ---- aba Anúncios ----
function tAds(b){
  b.append(mk('h4',0,'Publicar anúncio'));
  b.append(mk('p','note','Use depois que o Pix cair (tipo Pago) ou para dar cortesia (tipo Grátis). Entra no ar na hora.'));
  const f=mk('form');
  const lugar=i=>{const c=i%8;return 'Vaga '+(i+1)+' · Página '+(Math.floor(i/8)+1)+' · '+(c<4?'Esquerda':'Direita')+' '+(c%4+1)};
  const vaga=sel([['auto','Primeira vaga livre']].concat(ADS.vs().map((v,i)=>[String(i),lugar(i)+(v?' — ocupada por '+v.name+' (será substituída)':' — livre')])));
  const nome=inp('text',40),texto=inp('text',60);nome.required=texto.required=true;
  const tempo=sel([['5','5 minutos'],['10','10 minutos'],['30','30 minutos'],['60','1 hora'],['120','2 horas'],['360','6 horas'],['720','12 horas'],['1440','24 horas'],['custom','Outro tempo (em minutos)']]);
  const cust=inp('number',0,'Minutos');cust.min='1';cust.max='10080';cust.hidden=true;
  tempo.onchange=()=>{cust.hidden=tempo.value!=='custom'};
  const tipo=sel([['pago','Pago (Pix confirmado)'],['gratis','Grátis (cortesia)']]);
  const file=inp('file');file.accept='image/png,image/jpeg,image/webp';
  f.append(campo('Vaga',vaga),campo('Nome do negócio',nome),campo('Texto (até 60 letras)',texto),campo('Tempo no ar',tempo),cust,campo('Tipo',tipo),campo('Imagem (opcional)',file));
  const go=mk('button','go','Publicar agora');go.type='submit';f.append(go);
  f.addEventListener('submit',async e=>{e.preventDefault();
    const m=tempo.value==='custom'?Math.round(Number(cust.value)):Number(tempo.value);
    if(!(m>=1))return say('Digite o tempo em minutos.');
    let i;if(vaga.value==='auto'){i=ADS.vs().findIndex(v=>!v);if(i<0)return say('Todas as vagas estão ocupadas. Escolha uma para substituir.')}else i=Number(vaga.value);
    let img=null;if(file.files[0]){try{img=await lerImg(file.files[0],480,'image/jpeg',.8)}catch(x){return say(x.message)}}
    ADS.put(i,{name:nome.value.trim(),text:texto.value.trim(),end:Date.now()+m*60000,total:m*60000,tag:tipo.value==='gratis'?'cortesia':'',img});
    const ok=salvarAds();
    let r='local',sv=false;const AP=window.MH_API;
    /* caminho principal: grava no CMS (coleção Anuncios) pelo Worker; vale para todos os aparelhos, inclusive o celular, com a imagem */
    if(AP&&AP.on()&&AP.admTk()){try{const qq=await AP.req('/admin',{token:AP.admTk(),body:{acao:'anuncio_add',dados:{vaga:i+1,minutos:m,nome:nome.value.trim(),texto:texto.value.trim(),imagem:img||'',tag:tipo.value==='gratis'?'cortesia':''}}});
      if(qq.ok&&qq.j&&qq.j.ok){sv=true;r='todos'}else{if(qq.status===401)AP.setAdmTk('');diag('anúncio do painel: '+((qq.j&&(qq.j.erro||qq.j.detalhe))||qq.status),true)}}catch(x){}}
    if(!sv){try{if(window.MH_DB&&MH_DB.ctl)r=await MH_DB.ctl({a:'ad',i,m,nome:nome.value.trim(),texto:texto.value.trim(),tag:tipo.value==='gratis'?'cortesia':''})}catch(x){r='erro'}}
    say('Anúncio publicado: '+lugar(i)+'.'+(sv?' Salvo no banco: aparece para todo mundo, inclusive no celular'+(img?', com a imagem':'')+' (pode levar até 30 segundos).':(r==='todos'||r==='ok'?' Já aparece para todo mundo, inclusive no celular'+(img?' (a imagem só aparece neste aparelho)':'')+'.':' Atenção: ficou só neste aparelho (não foi enviado para os outros).'))+(ok?'':' Não coube no armazenamento do navegador, então some ao recarregar aqui.'))});
  b.append(f);
  b.append(mk('h4',0,'No ar agora'));
  let n=0;
  ADS.vs().forEach((v,i)=>{if(!v)return;n++;
    const r=mk('div','arow'),info=mk('div','ainfo');
    info.append(mk('b',0,lugar(i)+' · '+v.name),mk('span',0,v.text+' · '+(v.tag?v.tag+' · ':'')+'restam '+rest(v.end-Date.now())));
    const rm=mk('button','cx','Remover');rm.type='button';rm.onclick=async()=>{lixoAd(i,v);ADS.clear(i);salvarAds();const AP=window.MH_API;let sv=false;if(AP&&AP.on()&&AP.admTk()){try{const qq=await AP.req('/admin',{token:AP.admTk(),body:{acao:'anuncio_del',dados:{vaga:i+1}}});sv=!!(qq.ok&&qq.j&&qq.j.ok)}catch(x){}}if(!sv){try{window.MH_DB&&MH_DB.ctl&&MH_DB.ctl({a:'adx',i})}catch(x){}}say('Anúncio removido: '+lugar(i)+'.'+(sv?' Saiu do banco: some para todo mundo em até 30 segundos.':''))};
    r.append(info,rm);b.append(r)});
  if(!n)b.append(mk('p','note','Nenhum anúncio no ar.'));
  else{const all=mk('button','cx','Remover todos');all.type='button';all.style.marginTop='10px';all.onclick=()=>{if(!all.dataset.c){all.dataset.c='1';all.textContent='Toque de novo para remover '+n;setTimeout(()=>{delete all.dataset.c;all.textContent='Remover todos'},4000);return}const AP=window.MH_API;const viaServ=AP&&AP.on()&&AP.admTk();ADS.vs().forEach((v,i)=>{if(v){lixoAd(i,v);ADS.clear(i);if(!viaServ){try{window.MH_DB&&MH_DB.ctl&&MH_DB.ctl({a:'adx',i})}catch(x){}}}});salvarAds();if(viaServ){AP.req('/admin',{token:AP.admTk(),body:{acao:'anuncio_limpar',dados:{}}}).then(qq=>{say(qq.ok&&qq.j&&qq.j.ok?'Todos os anúncios foram removidos do banco: somem para todo mundo em até 30 segundos.':'Removidos só neste aparelho: o servidor não respondeu.')}).catch(()=>{})}else say('Todos os anúncios foram removidos.')};b.append(all)}
}

// ---- aba Removidos: tudo que o ADM tirou e dá para colocar de volta ----
async function restaurar(x){
  const tira=()=>store.set('lixeira',store.get('lixeira',[]).filter(y=>y.id!==x.id));
  if(x.tipo==='titulo'){TIT[x.dados.n]=x.dados.t;store.set('titulos',TIT);UI.online();tira();return say('Título de '+x.dados.n+' voltou.')}
  if(x.tipo==='enquete'){store.set('enquete',x.dados);tira();return say('Enquete voltou ao site.')}
  if(x.tipo==='anuncio'){const v=x.dados.v;let i=x.dados.i;if(ADS.vs()[i])i=ADS.vs().findIndex(z=>!z);if(i<0)return say('Todas as vagas estão ocupadas. Remova um anúncio antes de colocar este de volta.');
    let m=Math.round((v.end-Date.now())/60000);if(!(m>=1))m=Math.max(1,Math.round(v.total/60000));
    ADS.put(i,{name:v.name,text:v.text,end:Date.now()+m*60000,total:m*60000,tag:v.tag||'',img:v.img||null});salvarAds();
    let sv=false;const AP=window.MH_API;
    if(AP&&AP.on()&&AP.admTk()){try{const qq=await AP.req('/admin',{token:AP.admTk(),body:{acao:'anuncio_add',dados:{vaga:i+1,minutos:m,nome:v.name,texto:v.text,imagem:v.img||'',tag:v.tag||''}}});sv=!!(qq.ok&&qq.j&&qq.j.ok)}catch(e){}}
    if(!sv){try{window.MH_DB&&MH_DB.ctl&&MH_DB.ctl({a:'ad',i,m,nome:v.name,texto:v.text,tag:v.tag||''})}catch(e){}}
    tira();return say('Anúncio de volta em '+lugarAd(i)+' por '+m+' min.'+(sv?' Aparece para todos em até 30 segundos.':''))}
}
function tLix(b){
  b.append(mk('h4',0,'Colocar de volta'));
  b.append(mk('p','note','Aqui ficam as coisas que você tirou. Toque em "Colocar de volta" para recuperar.'));
  let vazio=true;
  const linha=(tit,sub,fn)=>{vazio=false;const r=mk('div','arow'),info=mk('div','ainfo');info.append(mk('b',0,tit),mk('span',0,sub));const bt=mk('button','cp','Colocar de volta');bt.type='button';bt.onclick=fn;r.append(info,bt);b.append(r)};
  [...banidos].forEach(n=>linha(n,'Banido(a)',()=>{banidos.delete(n);UI.desbanir(n);store.set('banidos',[...banidos]);say(n+' voltou para a sala.')}));
  [...FORA].forEach(n=>linha(n,'Fora da página de helpers',()=>{FORA.delete(n);salvaFora();say(n+' voltou para a página de helpers.')}));
  const nome={anuncio:'Anúncio',enquete:'Enquete',titulo:'Título'};
  store.get('lixeira',[]).forEach(x=>linha(x.rot,(nome[x.tipo]||'Item')+' · removido em '+new Date(x.t).toLocaleString('pt-BR'),()=>restaurar(x)));
  if(vazio)b.append(mk('p','note','Nada removido por enquanto.'));
  b.append(mk('p','note','Pessoas banidas, helpers excluídos, anúncios, enquete e títulos voltam daqui. Indicações do Guia e cidades apagadas o servidor apaga de vez, então não dá para recuperar por aqui.'));
}

// ---- aba Pessoas ----
function tPes(b){
  b.append(mk('h4',0,'Página de helpers'));
  b.append(mk('p','note','Excluir tira a pessoa da lista de Profissionais do Vale. Ela continua com a conta e no chat, e você pode recolocar quando quiser.'));
  {const hs=new Map();(window.MH_HELPERS||[]).forEach(x=>{if(x&&x.nome)hs.set(x.nome,x.oficio||'')});UI.pessoas().forEach(p=>{if(p.role==='helper'&&!hs.has(p.nome))hs.set(p.nome,p.work||'')});FORA.forEach(n=>{if(!hs.has(n))hs.set(n,'')});
   const q=inp('search',40,'Buscar helper por nome ou ofício');q.setAttribute('aria-label','Buscar helper');const lst=mk('div');b.append(q,lst);
   const desenha=()=>{lst.textContent='';const t=(q.value||'').toLowerCase();let c=0;
    [...hs.entries()].sort((a,z)=>a[0].localeCompare(z[0],'pt-BR')).forEach(([n,w])=>{if(t&&!(n+' '+w).toLowerCase().includes(t))return;if(++c>30)return;
     const r=mk('div','arow'),info=mk('div','ainfo'),fora=FORA.has(n);info.append(mk('b',0,n+(fora?'  (fora da página)':'')),mk('span',0,w||'Helper'));
     const bt=mk('button',fora?'cp':'cx',fora?'Recolocar':'Excluir');bt.type='button';
     bt.onclick=()=>{if(fora)FORA.delete(n);else{if(!confirm('Tirar '+n+' da página de Profissionais?'))return;FORA.add(n)}salvaFora();desenha()};
     r.append(info,bt);lst.append(r)});
    if(!c)lst.append(mk('p','note','Nenhum helper encontrado.'))};
   q.addEventListener('input',desenha);desenha()}
  b.append(mk('h4',0,'Títulos e banimento'));
  b.append(mk('p','note','O título aparece como etiqueta ao lado do nome, no chat e na lista de online. Banir esconde a pessoa da sala.'));
  const pess=UI.pessoas(),nomes=pess.map(p=>p.nome);
  Object.keys(TIT).forEach(n=>{if(!nomes.includes(n))nomes.push(n)});
  banidos.forEach(n=>{if(!nomes.includes(n))nomes.push(n)}); /* banido que saiu da sala continua na lista, para dar para desbanir */
  const eu=UI.eu();
  const setTit=(n,v)=>{v=v.trim().slice(0,20);if(v)TIT[n]=v;else{if(TIT[n])lixo('titulo','Título de '+n+': '+TIT[n],{n,t:TIT[n]});delete TIT[n]}store.set('titulos',TIT);UI.online();say(v?'Título de '+n+': '+v+'.':'Título de '+n+' removido.')};
  nomes.forEach(n=>{
    const p=pess.find(x=>x.nome===n),r=mk('div','arow'),info=mk('div','ainfo');
    info.append(mk('b',0,n+(banidos.has(n)?'  (banido)':'')),mk('span',0,p?(p.role==='helper'?'Helper · '+p.work:'Cliente')+(p.bot?' · bot':''):'não está na sala agora'));
    const t=inp('text',20,'Título');t.setAttribute('list','admTit');t.value=TIT[n]||'';t.setAttribute('aria-label','Título de '+n);
    const sv=mk('button','cp','Salvar');sv.type='button';sv.onclick=()=>setTit(n,t.value);
    const ac=mk('div','aact');ac.append(t,sv);
    const pf=mk('button','cp','Perfil');pf.type='button';pf.disabled=!p;pf.onclick=()=>UI.perfil(n);ac.append(pf);
    if(!(eu&&eu.nome===n)){const bn=mk('button','cx',banidos.has(n)?'Desbanir':'Banir');bn.type='button';
      bn.onclick=()=>{if(banidos.has(n)){banidos.delete(n);UI.desbanir(n)}else{banidos.add(n);UI.banir(n)}store.set('banidos',[...banidos]);bn.textContent=banidos.has(n)?'Desbanir':'Banir';info.firstChild.textContent=n+(banidos.has(n)?'  (banido)':'');say(n+(banidos.has(n)?' foi banido(a) da sala.':' voltou para a sala.'))};ac.append(bn)}
    r.append(info,ac);b.append(r)});
  b.append(mk('h4',0,'Dar título a alguém por nome'));
  const f=mk('form'),nn=inp('text',30,'Nome como aparece no chat'),tt=inp('text',20,'Título');nn.required=tt.required=true;tt.setAttribute('list','admTit');
  f.append(campo('Nome',nn),campo('Título',tt));const go=mk('button','go','Dar título');go.type='submit';f.append(go);
  f.addEventListener('submit',e=>{e.preventDefault();setTit(nn.value.trim(),tt.value)});b.append(f);
}

// ---- aba Pix ----
let qrBusy=false;
async function aplicarQr(file){if(qrBusy)return;qrBusy=true;try{PIX.qr=await lerImg(file,600,'image/png');const ok=savePix();qrBusy=false;say(ok?'QR code salvo.':'QR code aplicado, mas não coube no armazenamento do navegador (some ao recarregar).')}catch(x){qrBusy=false;say(x.message)}}
dlg.addEventListener('paste',e=>{if(aba!=='pix')return;const it=Array.from((e.clipboardData&&e.clipboardData.files)||[]).find(x=>/^image\//.test(x.type));if(it){e.preventDefault();aplicarQr(it)}});
function tPix(b){
  b.append(mk('h4',0,'Dados do Pix'));
  const f=mk('form'),ch=inp('text',77),no=inp('text',25),ci=inp('text',15),co=inp('email',80);
  ch.value=PIX.chave||'';no.value=PIX.nome||'';ci.value=PIX.cidade||'';co.value=PIX.contato||'';ch.required=no.required=ci.required=true;
  f.append(campo('Chave Pix (e-mail, CPF/CNPJ, telefone com +55 ou chave aleatória)',ch),campo('Nome do recebedor (sem acento, até 25 letras)',no),campo('Cidade (sem acento, até 15 letras)',ci),campo('E-mail que recebe os comprovantes',co));
  const sv=mk('button','go','Salvar Pix');sv.type='submit';f.append(sv);
  f.addEventListener('submit',e=>{e.preventDefault();
    const nm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase().replace(/[^A-Z0-9 .\-]/g,'').trim();
    PIX.chave=ch.value.trim();PIX.nome=nm(no.value).slice(0,25)||'MIHELP';PIX.cidade=nm(ci.value).slice(0,15)||'BARRA DO GARCAS';PIX.contato=co.value.trim()||PIX.contato;
    say(savePix()?'Pix salvo. Use o botão de teste para conferir a tela de pagamento.':'Pix aplicado, mas não coube no armazenamento do navegador.')});
  b.append(f);
  b.append(mk('h4',0,'QR code'));
  b.append(mk('p','note','O código "copia e cola" já sai com o valor certo. O QR colado aqui é a imagem do seu banco (sem valor) e aparece na tela de pagamento.'));
  if(PIX.qr){const im=mk('img','aqr');im.src=PIX.qr;im.alt='QR code salvo';b.append(im)}
  const zona=mk('div','apaste','Clique aqui e cole (Ctrl+V) a imagem do QR code');zona.tabIndex=0;b.append(zona);
  const fl=inp('file');fl.accept='image/*';fl.onchange=()=>{if(fl.files[0])aplicarQr(fl.files[0])};b.append(campo('Ou escolha o arquivo da imagem',fl));
  if(PIX.qr){const rq=mk('button','cx','Remover QR code');rq.type='button';rq.onclick=()=>{PIX.qr=null;savePix();say('QR code removido.')};b.append(rq)}
  b.append(mk('h4',0,'Testar e levar para o código'));
  const t=mk('button','cp','Testar tela de pagamento (R$ 1)');t.type='button';t.onclick=()=>{if(window.MH_abrirPix)window.MH_abrirPix({titulo:'Teste do Pix',valor:1,resumo:'TESTE DO PAINEL ADM',assunto:'Teste Pix MiHelp',extra:''})};b.append(t);
  b.append(mk('p','note','Para os dados valerem para todo mundo hoje, cole este bloco no código da página, no lugar da linha const PIX.'));
  const q=s=>String(s||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  const ta=mk('textarea');ta.readOnly=true;ta.rows=4;ta.value="const PIX={chave:'"+q(PIX.chave)+"',nome:'"+q(PIX.nome)+"',cidade:'"+q(PIX.cidade)+"',contato:'"+q(PIX.contato)+"'};";b.append(ta);
  const cb=mk('button','cp','Copiar bloco');cb.type='button';cb.onclick=async()=>{try{await navigator.clipboard.writeText(ta.value)}catch(e){ta.select();try{document.execCommand('copy')}catch(x){}}cb.textContent='Copiado!';setTimeout(()=>{cb.textContent='Copiar bloco'},1600)};b.append(cb);
}

// ---- aba Ocorrências ----
function tOc(b){
  b.append(mk('h4',0,'Nova ocorrência'));
  const f=mk('form'),qm=inp('text',40,'Quem ou o quê'),mo=inp('text',160,'O que aconteceu'),or=sel(['chat','SOS','chamado','anúncio','avaliação','pagamento','outro'].map(x=>[x,x]));qm.required=mo.required=true;
  f.append(campo('Quem ou o quê',qm),campo('O que aconteceu',mo),campo('Origem',or));const go=mk('button','go','Registrar');go.type='submit';f.append(go);
  f.addEventListener('submit',e=>{e.preventDefault();OC.unshift({id:Date.now(),quem:qm.value.trim(),motivo:mo.value.trim(),origem:or.value,quando:Date.now(),status:'aberta',nota:''});salvarOC();say('Ocorrência registrada.')});b.append(f);
  b.append(mk('h4',0,'Lista ('+abertas()+' abertas)'));
  if(!OC.length)b.append(mk('p','note','Nenhuma ocorrência. Denúncias feitas no chat aparecem aqui.'));
  const pess=UI.pessoas(),ord=OC.slice().sort((a,c)=>(a.status===c.status?c.quando-a.quando:(a.status==='aberta'?-1:1)));
  ord.forEach(o=>{
    const r=mk('div','arow'+(o.status==='aberta'?'':' fechada')),info=mk('div','ainfo');
    const t=mk('b',0,o.quem);t.append(mk('span','badge-st'+(o.status==='aberta'?'':' ok'),o.status==='aberta'?'ABERTA':'RESOLVIDA'));
    info.append(t,mk('span',0,o.motivo+' · '+o.origem+' · '+quando(o.quando)));
    const nt=inp('text',160,'Anotação');nt.value=o.nota||'';nt.setAttribute('aria-label','Anotação sobre '+o.quem);nt.onchange=()=>{o.nota=nt.value.trim();salvarOC()};
    const ac=mk('div','aact');ac.append(nt);
    if(pess.some(p=>p.nome===o.quem)){const vp=mk('button','cp','Ver perfil');vp.type='button';vp.onclick=()=>UI.perfil(o.quem);ac.append(vp)}
    if(pess.some(p=>p.nome===o.quem)&&!(UI.eu()&&UI.eu().nome===o.quem)){const bn=mk('button','cx',banidos.has(o.quem)?'Desbanir':'Banir');bn.type='button';bn.onclick=()=>{if(banidos.has(o.quem)){banidos.delete(o.quem);UI.desbanir(o.quem)}else{banidos.add(o.quem);UI.banir(o.quem)}store.set('banidos',[...banidos]);say(o.quem+(banidos.has(o.quem)?' foi banido(a).':' voltou para a sala.'))};ac.append(bn)}
    const rs=mk('button','cp',o.status==='aberta'?'Resolver':'Reabrir');rs.type='button';rs.onclick=()=>{o.status=o.status==='aberta'?'resolvida':'aberta';salvarOC();say(o.status==='resolvida'?'Ocorrência resolvida.':'Ocorrência reaberta.')};
    const ap=mk('button','cx','Apagar');ap.type='button';ap.onclick=()=>{OC=OC.filter(x=>x!==o);salvarOC();say('Ocorrência apagada.')};
    ac.append(rs,ap);r.append(info,ac);b.append(r)});
}

// ---- aba Ajustes ----
function tCfg(b){
  b.append(mk('h4',0,'Trocar PIN'));
  const f=mk('form'),a=inp('password',32,'Novo PIN'),c=inp('password',32,'Repita');a.required=c.required=true;
  f.append(campo('Novo PIN',a),campo('Repita o novo PIN',c));const go=mk('button','go','Trocar PIN');go.type='submit';f.append(go);
  f.addEventListener('submit',async e=>{e.preventDefault();if(a.value.length<4)return say('Use pelo menos 4 caracteres.');if(a.value!==c.value)return say('Os dois PINs não são iguais.');store.set('pin',await hpin(a.value));say('PIN trocado.')});b.append(f);
  b.append(mk('h4',0,'Sessão'));
  const sa=mk('button','cx','Sair do ADM');sa.type='button';sa.onclick=()=>sairAdm();b.append(sa);
  b.append(mk('h4',0,'Dados deste navegador'));
  b.append(mk('p','note','Apaga anúncios, títulos, bans, ocorrências, PIN e dados do Pix guardados aqui. Não mexe no código da página.'));
  const lp=mk('button','cx','Apagar tudo do painel');lp.type='button';lp.onclick=()=>{if(!lp.dataset.c){lp.dataset.c='1';lp.textContent='Toque de novo para apagar tudo';setTimeout(()=>{delete lp.dataset.c;lp.textContent='Apagar tudo do painel'},4000);return}try{Object.keys(localStorage).filter(k=>k.indexOf(K)===0).forEach(k=>localStorage.removeItem(k));sessionStorage.removeItem('mh_adm')}catch(e){}location.reload()};b.append(lp);
}

// ---- ADM: clicar no nome da pessoa (perfil) mostra banir, título e ocorrência ----
{const dl=document.createElement('datalist');dl.id='admTit';['Fundador','Moderador','Verificado','Apoiador','Parceiro','Destaque'].forEach(t=>{const o=document.createElement('option');o.value=t;dl.append(o)});document.body.append(dl)}
window.MH_perfilAdm=function(pes,d){
  const n=pes.nome,eu=UI.eu(),souEu=!!(eu&&eu.nome===n);
  const box=mk('div','admbox');box.append(mk('h4',0,'Ações do ADM'));
  const msg=mk('p','note');msg.setAttribute('role','status');
  const r1=mk('div','aact adm-r1'),t=inp('text',20,'Título');t.setAttribute('list','admTit');t.value=TIT[n]||'';t.setAttribute('aria-label','Título de '+n);
  const sv=mk('button','cp adm-save','💾 Salvar');sv.type='button';
  sv.onclick=()=>{const v=t.value.trim().slice(0,20);if(v)TIT[n]=v;else{if(TIT[n])lixo('titulo','Título de '+n+': '+TIT[n],{n,t:TIT[n]});delete TIT[n]}store.set('titulos',TIT);UI.online();msg.textContent=v?'Título salvo: '+v+'.':'Título removido.'};
  r1.append(t,sv);box.append(r1);
  const r2=mk('div','aact adm-r2');
  if(!souEu){
    const bn=mk('button','go adm-ban',banidos.has(n)?'↩ Desbanir da sala':'🚫 Banir da sala');bn.type='button';
    bn.onclick=()=>{if(banidos.has(n)){banidos.delete(n);UI.desbanir(n)}else{banidos.add(n);UI.banir(n)}store.set('banidos',[...banidos]);d.close()};
    r2.append(bn)}
  if(!souEu&&pes.role==='helper'){const fx=mk('button','cx adm-fora',FORA.has(n)?'↩ Recolocar na página de helpers':'🗑 Excluir da página de helpers');fx.type='button';
    fx.onclick=()=>{if(FORA.has(n))FORA.delete(n);else{if(!confirm('Tirar '+n+' da página de Profissionais? A pessoa continua com a conta e no chat. Dá para recolocar depois.'))return;FORA.add(n)}salvaFora();d.close()};r2.append(fx)}
  const oc=mk('button','cx adm-oc','📋 Registrar ocorrência');oc.type='button';
  oc.onclick=()=>{OC.unshift({id:Date.now(),quem:n,motivo:'Aberta pelo perfil.',origem:'chat',quando:Date.now(),status:'aberta',nota:''});salvarOC();chipUpd();msg.textContent='Ocorrência registrada. Veja na aba Ocorrências.'};
  r2.append(oc);box.append(r2,msg);
  if(!souEu&&window.MH_FOTOVER){const FV=MH_FOTOVER,tem=!!FV.foto(n),vf=FV.ver(n);
    const rv=mk('div','aact adm-r1');rv.style.marginTop='8px';
    const bv=mk('button','go adm-vf',vf?'✖ Tirar verificação':'✔ Verificar pessoa');bv.type='button';bv.disabled=!vf&&!tem;
    bv.onclick=async()=>{let r='local';try{r=await MH_DB.ctl({a:'verif',n,v:vf?0:1})}catch(x){r='erro'}msg.textContent=(vf?'Verificação removida de ':'Verificada: ')+n+'.'+(r==='todos'?' Vale para todos.':' Ficou só neste aparelho.');bv.disabled=true};
    rv.append(bv);box.append(rv);
    if(!tem&&!vf)box.append(mk('p','note','Sem foto no perfil: esta pessoa não pode ser verificada.'))}
  box.append(mk('h4',0,'Avaliações que '+n+' fez'));
  const feitas=[];Object.entries(UI.avs()).forEach(([alvo,arr])=>arr.forEach(x=>{if(x[0]===n)feitas.push([alvo,x])}));
  if(!feitas.length)box.append(mk('p','note','Nenhuma até agora.'));
  feitas.forEach(([alvo,x])=>{
    const it=mk('div','dep');it.append(mk('b',0,'Sobre '+alvo+' · '+estr(x[1])));it.append(document.createElement('br'),document.createTextNode((window.MH_av2?MH_av2(x[2]).txt:x[2])||'(sem comentário)'));
    const row=mk('div','aact');row.style.marginTop='6px';
    const ver=mk('button','cp','Ver perfil de '+alvo);ver.type='button';ver.disabled=!UI.pessoas().some(q=>q.nome===alvo);ver.onclick=()=>UI.perfil(alvo);
    const ed=mk('button','cx','Editar');ed.type='button';ed.onclick=()=>editarDep({nome:alvo},x,n);
    const ap=mk('button','cx','Apagar');ap.type='button';ap.onclick=()=>apagarDep(alvo,x,n);
    row.append(ver,ed,ap);it.append(row);box.append(it)});
  d.insertBefore(box,d.lastElementChild)};

// ---- ADM: clicar numa pub no ar mostra apagar ----
function abrirAd(i){
  const v=ADS.vs()[i];if(!v)return;
  const d=mk('dialog');d.setAttribute('aria-label','Anúncio da vaga '+(i+1));
  d.append(mk('h3',0,'Vaga '+(i+1)+' · '+v.name));
  d.append(mk('p','note',v.text+' · '+(v.tag?v.tag+' · ':'')+'restam '+rest(v.end-Date.now())));
  if(v.img){const im=mk('img','aqr');im.src=v.img;im.alt='Imagem do anúncio';d.append(im)}
  const bt=mk('div','dbt');
  const del=mk('button','go','Apagar anúncio');del.type='button';del.style.cssText='background:var(--red);color:#fff';
  del.onclick=()=>{ADS.clear(i);salvarAds();d.close();if(dlg.open)desenhar()};
  const cx=mk('button','cx','Fechar');cx.type='button';cx.onclick=()=>d.close();
  bt.append(del,cx);d.append(bt);d.addEventListener('close',()=>d.remove());document.body.append(d);d.showModal()}
document.addEventListener('click',e=>{
  if(!document.body.classList.contains('adm'))return;
  const vg=e.target.closest&&e.target.closest('.vg:not(.open)');if(!vg)return;
  const tm=vg.querySelector('.tm');if(!tm)return;abrirAd(Number(tm.dataset.i))});

// ---- ADM: editar/apagar avaliações e ver quem avaliou ----
function apagarDep(alvo,x,voltar){const arr=UI.avs()[alvo]||[];const k=arr.indexOf(x);if(k>=0)arr.splice(k,1);salvarAvs();UI.perfil(voltar)}
function editarDep(pes,x,voltar){
  const d=mk('dialog');d.setAttribute('aria-label','Editar avaliação');
  d.append(mk('h3',0,'Avaliação de '+x[0]+' sobre '+pes.nome));
  const f=mk('form'),st=sel([['5','★★★★★ (5)'],['4','★★★★☆ (4)'],['3','★★★☆☆ (3)'],['2','★★☆☆☆ (2)'],['1','★☆☆☆☆ (1)']]);st.value=String(x[1]);
  const tx=inp('text',80,'Comentário');tx.value=x[2]||'';
  f.append(campo('Nota',st),campo('Comentário (até 80 letras; vazio tira o texto)',tx));
  const bt=mk('div','dbt'),ok=mk('button','go','Salvar'),cx=mk('button','cx','Cancelar');ok.type='submit';cx.type='button';cx.onclick=()=>d.close();bt.append(ok,cx);f.append(bt);
  f.addEventListener('submit',e=>{e.preventDefault();x[1]=Number(st.value);x[2]=tx.value.trim();salvarAvs();d.close();UI.perfil(voltar)});
  d.append(f);d.addEventListener('close',()=>d.remove());document.body.append(d);d.showModal();tx.focus()}
window.MH_depAdm=function(pes,x,box){
  const de=x[0],existe=UI.pessoas().some(p=>p.nome===de);
  const row=mk('div','aact');row.style.marginTop='6px';
  const ver=mk('button','cp','Ver perfil de '+de);ver.type='button';ver.disabled=!existe;ver.onclick=()=>UI.perfil(de);
  const ed=mk('button','cx','Editar');ed.type='button';ed.onclick=()=>editarDep(pes,x,pes.nome);
  const ap=mk('button','cx','Apagar');ap.type='button';ap.onclick=()=>apagarDep(pes.nome,x,pes.nome);
  row.append(ver,ed,ap);box.append(row)};

// ---- aba Meu acesso: entrar na sala como ADM com o nome que quiser ----
function tEu(b){
  b.append(mk('h4',0,'Entrar na sala como ADM'));
  b.append(mk('p','note','Escolha o nome que quiser. Você entra no chat com a etiqueta ADM, sem passar pelo cadastro, e continua com todos os poderes do painel.'));
  const eu=UI.eu();
  const f=mk('form'),nn=inp('text',24,'Ex.: Suporte MiHelp');nn.required=true;nn.value=(eu&&eu.adm)?eu.nome:store.get('admNome','');
  f.append(campo('Nome na sala',nn));
  const go=mk('button','go',eu?(eu.adm?'Trocar nome':'Usar este nome no meu cadastro'):'Entrar na sala como ADM');go.type='submit';f.append(go);
  f.addEventListener('submit',e=>{e.preventDefault();
    const old=eu&&eu.nome,r=UI.entrarAdm(nn.value);
    if(r!==true)return say(r);
    const nome=UI.eu().nome;
    if(old&&old!==nome&&TIT[old]==='ADM')delete TIT[old];
    TIT[nome]='ADM';store.set('titulos',TIT);store.set('admNome',nome);UI.online();
    dlg.close();const cw=document.getElementById('cw');if(cw)cw.scrollIntoView({behavior:'smooth',block:'center'})});
  b.append(f);
  if(eu&&eu.adm)b.append(mk('p','note','Você está na sala como '+eu.nome+'. Para ver as suas informações, clique no seu nome.'));
}

// ---- apagar mensagem do chat (só no modo ADM) ----
document.addEventListener('click',e=>{const x=e.target.closest&&e.target.closest('.adm-x');if(!x)return;const p=x.closest('p');if(!p)return;const mid=p.dataset.mid;p.remove();if(mid&&window.MH_DB&&MH_DB.ctl){MH_DB.ctl({a:'apagar',id:mid}).then(r=>{if(r!=='todos'&&window.MH_UI&&MH_UI.nota)MH_UI.nota('*** Apagada só neste aparelho: falta ligar a chave de administrador (Painel > Limpar). ***')}).catch(()=>{})}});

// ---- como entrar: ?admin na URL, ou 5 toques no logo ----
let taps=0,tt=null;const br=document.querySelector('.brand');
if(br)br.addEventListener('click',()=>{taps++;clearTimeout(tt);tt=setTimeout(()=>{taps=0},2500);if(taps>=5){taps=0;abrirPainel()}});
if(/[?&]admin(=|&|$)/.test(location.search))setTimeout(abrirPainel,300);
if(logado()){document.body.classList.add('adm');bar.hidden=false;chipUpd()}
})()}catch(e){console.error('MiHelp (painel adm):',e)}

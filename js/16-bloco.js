
try{
(function(){
const $=id=>document.getElementById(id);
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const fld=(l,el)=>{const d=mk('div','f');const lb=mk('label',0,l);if(el.id)lb.htmlFor=el.id;d.append(lb,el);return d};
const J=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}};
const S=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const b64=u=>btoa(String.fromCharCode(...u)),ub=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
/* PBKDF2-HMAC-SHA256 em JS puro (reserva quando crypto.subtle não existe, ex.: http://) */
const mhPbkdf2=(function(){
  const K=new Int32Array([0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);
  const IV=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const W=new Int32Array(64);
  function compress(h,w16){ /* h: Int32Array(8) estado; w16: Int32Array(16) bloco */
    for(let i=0;i<16;i++)W[i]=w16[i];
    for(let i=16;i<64;i++){
      const a=W[i-15],b=W[i-2];
      const s0=((a>>>7)|(a<<25))^((a>>>18)|(a<<14))^(a>>>3);
      const s1=((b>>>17)|(b<<15))^((b>>>19)|(b<<13))^(b>>>10);
      W[i]=(W[i-16]+s0+W[i-7]+s1)|0}
    let a=h[0],b=h[1],c=h[2],d=h[3],e=h[4],f=h[5],g=h[6],hh=h[7];
    for(let i=0;i<64;i++){
      const S1=((e>>>6)|(e<<26))^((e>>>11)|(e<<21))^((e>>>25)|(e<<7));
      const ch=(e&f)^(~e&g);
      const t1=(hh+S1+ch+K[i]+W[i])|0;
      const S0=((a>>>2)|(a<<30))^((a>>>13)|(a<<19))^((a>>>22)|(a<<10));
      const mj=(a&b)^(a&c)^(b&c);
      const t2=(S0+mj)|0;
      hh=g;g=f;f=e;e=(d+t1)|0;d=c;c=b;b=a;a=(t1+t2)|0}
    h[0]=(h[0]+a)|0;h[1]=(h[1]+b)|0;h[2]=(h[2]+c)|0;h[3]=(h[3]+d)|0;
    h[4]=(h[4]+e)|0;h[5]=(h[5]+f)|0;h[6]=(h[6]+g)|0;h[7]=(h[7]+hh)|0}
  function sha256(bytes){ /* bytes: Uint8Array -> Int32Array(8) */
    const n=bytes.length,tot=((n+9+63)>>6)<<6,buf=new Uint8Array(tot);
    buf.set(bytes);buf[n]=0x80;
    const dv=new DataView(buf.buffer);dv.setUint32(tot-4,(n*8)>>>0);dv.setUint32(tot-8,Math.floor(n/0x20000000));
    const h=Int32Array.from(IV),w=new Int32Array(16);
    for(let o=0;o<tot;o+=64){for(let i=0;i<16;i++)w[i]=dv.getInt32(o+i*4);compress(h,w)}
    return h}
  const toBytes=h=>{const o=new Uint8Array(32),dv=new DataView(o.buffer);for(let i=0;i<8;i++)dv.setInt32(i*4,h[i]);return o};
  return function(pw,salt,iter){
    let key=pw;if(key.length>64)key=toBytes(sha256(key));
    const ip=new Uint8Array(64),op=new Uint8Array(64);
    for(let i=0;i<64;i++){const k=i<key.length?key[i]:0;ip[i]=k^0x36;op[i]=k^0x5c}
    const st=p=>{const h=Int32Array.from(IV),w=new Int32Array(16),dv=new DataView(p.buffer);for(let i=0;i<16;i++)w[i]=dv.getInt32(i*4);compress(h,w);return h};
    const si=st(ip),so=st(op);
    /* HMAC(mensagem curta) a partir dos estados já calculados; len = 64 (pad) + 32 (mensagem) */
    const w=new Int32Array(16),h=new Int32Array(8);
    const hmac32=m=>{ /* m: Int32Array(8) -> Int32Array(8) */
      h.set(si);for(let i=0;i<8;i++)w[i]=m[i];w[8]=0x80000000|0;for(let i=9;i<15;i++)w[i]=0;w[15]=(64+32)*8;compress(h,w);
      const r=Int32Array.from(so);for(let i=0;i<8;i++)w[i]=h[i];w[8]=0x80000000|0;for(let i=9;i<15;i++)w[i]=0;w[15]=(64+32)*8;compress(r,w);return r};
    /* U1 = HMAC(senha, salt || 0x00000001) */
    const msg=new Uint8Array(salt.length+4);msg.set(salt);msg[salt.length+3]=1;
    const full=new Uint8Array(64+msg.length);full.set(ip);full.set(msg,64);
    const inner=sha256(full);
    const o2=new Uint8Array(64+32);o2.set(op);o2.set(toBytes(inner),64);
    let u=sha256(o2);const t=Int32Array.from(u);
    for(let i=1;i<iter;i++){u=hmac32(u);for(let j=0;j<8;j++)t[j]^=u[j]}
    return toBytes(t)}
})();

async function hash(pw,salt){const pb=new TextEncoder().encode(pw);
  if(window.crypto&&crypto.subtle){try{const k=await crypto.subtle.importKey('raw',pb,'PBKDF2',false,['deriveBits']);
    return b64(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:120000,hash:'SHA-256'},k,256)))}catch(e){}}
  await new Promise(r=>setTimeout(r,0));
  return b64(mhPbkdf2(pb,salt,120000))}
const sair=mk('button','exp','Sair');sair.id='sairBar';sair.type='button';sair.hidden=true;sair.setAttribute('aria-label','Sair da conta');
{const cx=document.getElementById('cwExp');if(cx&&cx.parentNode)cx.parentNode.insertBefore(sair,cx);else document.body.append(sair)}
function guarda(nome){try{localStorage.removeItem('mh_sess');sessionStorage.removeItem('mh_sess');const k=document.getElementById('mantem'),m=!k||k.checked;localStorage.setItem('mh_keep',m?'1':'0');(m?localStorage:sessionStorage).setItem('mh_sess',JSON.stringify(nome))}catch(e){}}
let sairT=null;
sair.onclick=()=>{if(!sair.dataset.c){sair.dataset.c='1';sair.textContent='Toque para sair';clearTimeout(sairT);sairT=setTimeout(()=>{delete sair.dataset.c;sair.textContent='Sair'},4000);return}
try{localStorage.removeItem('mh_sess');sessionStorage.removeItem('mh_sess');localStorage.removeItem('mh_eu');sessionStorage.removeItem('mh_adm');localStorage.removeItem('mh_tk');sessionStorage.removeItem('mh_tk');sessionStorage.removeItem('mh_admtk')}catch(e){}location.reload()};
/* a "chave" que vai ao servidor é derivada no navegador (PBKDF2); a senha em si nunca sai daqui */
const normalizaTel=v=>String(v||'').replace(/\D/g,'');
const chaveDe=(ident,pw)=>hash(pw,new TextEncoder().encode('mihelp:'+String(ident).trim().replace(/\s+/g,' ').toLowerCase()));
/* link de indicação (?ind=nome) fica guardado e vai junto no cadastro */
(function(){try{var q=new URLSearchParams(location.search).get('ind');if(q)localStorage.setItem('mh_ind',q.slice(0,40))}catch(e){}})();
/* esqueci minha senha: código por e-mail e nova senha */
window.MH_recSenha=function(){
  const A=window.MH_API;if(!A||!A.on()){alert('Sem conexão com o servidor.');return}
  let d=document.getElementById('recDlg');if(d)d.remove();
  d=document.createElement('dialog');d.id='recDlg';
  d.innerHTML='<h3>Esqueci minha senha</h3><p class="note" id="recMsg">Digite o telefone da conta. Enviamos um código para o e-mail cadastrado.</p><div class="f"><label for="recTel">Telefone</label><input id="recTel" type="tel" inputmode="tel" autocomplete="tel"></div><div id="recP2" hidden><div class="f"><label for="recCod">Código de 6 números</label><input id="recCod" inputmode="numeric" maxlength="6"></div><div class="f"><label for="recSen">Nova senha</label><input id="recSen" type="password" maxlength="64" autocomplete="new-password" placeholder="Mínimo 6 caracteres"></div></div><div class="dbt"><button type="button" class="go" id="recOk">Enviar código</button><button type="button" class="cx" id="recX">Fechar</button></div>';
  document.body.append(d);d.showModal();
  const $=i=>document.getElementById(i),msg=t=>{$('recMsg').textContent=t};let passo=1;
  $('recX').onclick=()=>d.close();
  $('recOk').onclick=async()=>{const tel=normalizaTel($('recTel').value);if(tel.length<10){msg('Digite o telefone com DDD.');return}
    $('recOk').disabled=true;
    try{
      if(passo===1){const r=await A.req('/conta/recuperar',{body:{tel}});
        msg(r.ok?'Se o telefone tiver conta, enviamos um código para o e-mail cadastrado. Vale por 15 minutos. Confira também o spam.':'Não consegui enviar agora. Tente de novo em instantes.');
        if(r.ok){passo=2;$('recP2').hidden=false;$('recOk').textContent='Trocar senha'}}
      else{const cod=$('recCod').value.replace(/\D/g,''),pw=$('recSen').value;
        if(cod.length!==6||pw.length<6){msg('Digite o código de 6 números e uma senha de pelo menos 6 caracteres.');return}
        const r=await A.req('/conta/redefinir',{body:{tel,codigo:cod,chave:await chaveDe(tel,pw)}});
        if(r.ok){msg('Senha trocada! Agora é só entrar com o telefone e a nova senha.');$('recOk').hidden=true}else msg('Código inválido ou vencido. Peça um novo código.')}
    }catch(e){msg('Algo deu errado. Tente de novo.')}
    finally{$('recOk').disabled=false}};
};
(function(){const pf=document.getElementById('pwf');if(pf&&!document.getElementById('esqSenha')){const p=document.createElement('p');p.className='note';p.innerHTML='<a href="#" id="esqSenha">Esqueci minha senha</a>';pf.after(p);p.querySelector('a').onclick=e=>{e.preventDefault();window.MH_recSenha()}}})();
/* reentrar sem recarregar: usado pelo painel quando falta a sessão do servidor */
window.MH_telDe=nome=>{try{const a=J('mh_acc',{})[String(nome||'').toLowerCase()];return a&&a.tel||''}catch(e){return ''}};
window.MH_reentrar=async(tel0,pw)=>{const A=window.MH_API,tel=normalizaTel(tel0);
  if(!A||!A.on())return{ok:false,msg:'Sem conexão com o servidor.'};
  if(!tel||tel.length<10||!pw)return{ok:false,msg:'Digite o telefone e a senha.'};
  try{const contaLeg=Object.values(J('mh_acc',{})).find(x=>normalizaTel(x&&x.tel)===tel);
   const r=await A.req('/conta/entrar',{body:{tel,chave:await chaveDe(tel,pw),chaveLegada:contaLeg?await chaveDe(contaLeg.nome,pw):'',identificador:tel}});
   if(r.ok&&r.j&&r.j.token){A.setUsrTk(r.j.token);return{ok:true}}
   if(r.status===401)return{ok:false,msg:'Telefone ou senha incorretos.'};
   if(r.status===429)return{ok:false,msg:'Muitas tentativas. Espere 15 minutos e tente de novo.'};
   return{ok:false,msg:'Não consegui entrar agora. Tente de novo.'}}catch(e){return{ok:false,msg:'Sem conexão. Tente de novo.'}}};
window.MH_conta={async criar(d,pw){
  const salt=crypto.getRandomValues(new Uint8Array(16)),a=J('mh_acc',{});
  a[d.nome.toLowerCase()]={nome:d.nome,role:d.role,work:d.work,tel:normalizaTel(d.tel),salt:b64(salt),hash:await hash(pw,salt)};
  S('mh_acc',a);guarda(d.nome);
  const A=window.MH_API;
  if(A&&A.on()){try{const r=await A.req('/conta/criar',{body:{nome:d.nome,chave:await chaveDe(normalizaTel(d.tel),pw),papel:d.role,oficio:d.work,tel:normalizaTel(d.tel),email:d.em,indicador:(function(){try{return localStorage.getItem('mh_ind')||''}catch(e){return ''}})(),cidade:d.cidade||((document.getElementById('cid')||{}).value)||''}});
    if(r.ok&&r.j&&r.j.token){A.setUsrTk(r.j.token);window.MH_numChegou&&MH_numChegou(d.nome,r.j.numero)}
    else if(r.status===409&&window.MH_UI&&MH_UI.nota)MH_UI.nota('*** Esse telefone já tem conta. Para entrar nela, toque em "Login". ***')}catch(e){}}}};
{const kb=mk('label');kb.style.cssText='display:flex;gap:8px;align-items:center;margin-top:8px;cursor:pointer';const kc=mk('input');kc.type='checkbox';kc.id='mantem';kc.checked=localStorage.getItem('mh_keep')!=='0';kb.append(kc,document.createTextNode('Manter conectado neste aparelho'));$('pwf').append(kb)}
let login=false;const f=$('f'),jt=$('jaTenho');
const esconde=()=>[document.querySelector('#f .role'),$('roleNote'),$('trab'),$('t').closest('.f'),$('e').closest('.f'),document.querySelector('#f label.chk')];
function modo(on){login=on;esconde().forEach(e=>{if(e){if(on)e.style.setProperty('display','none','important');else e.style.removeProperty('display')}});if(on)$('trab').hidden=true;else if(typeof 0==='number'){const h=document.querySelector('input[name=r]:checked');$('trab').hidden=!(h&&h.value==='Helper')}
  $('pw').autocomplete=on?'current-password':'new-password';$('pwf').querySelector('small').style.display=on?'none':'block';
  const idLabel=$('n').closest('.f')?.querySelector('label');
  if(idLabel)idLabel.textContent=on?'Telefone':'Nome';
  $('n').type=on?'tel':'text';$('n').inputMode=on?'numeric':'';$('n').autocomplete=on?'tel':'name';$('n').placeholder=on?'(66) 90000-0000':'';
  $('btnCad').textContent=on?'Entrar':'Criar minha conta';jt.textContent=on?'Quero criar uma conta':'Já tenho conta: entrar';
  const er=$('ferr');if(er){er.style.display='none'}try{marca()}catch(x){}}
jt.addEventListener('click',e=>{e.preventDefault();modo(!login)});
{const rn=$('roleNote');const atual=()=>{const h=document.querySelector('input[name=r]:checked');if(!rn)return;rn.textContent='';const b=document.createElement('b');if(h&&h.value==='Helper'){b.textContent='É só criar a conta.';rn.append(b,document.createTextNode(' Todo mundo tem acesso ao painel profissional. Só aparece como profissional quem escolher um ofício ou tiver uma loja; para o resto, é uma conta comum. Quer criar ou receber uma loja? Faça a conta e abra Meu espaço profissional.'))}else{b.textContent='É só criar a conta.';rn.append(b,document.createTextNode(' Para buscar serviços não precisa escolher nada. Quer oferecer um serviço? Depois de entrar, abra Meu espaço profissional e toque em Quero ser Helper, na mesma conta.'))}};
 document.querySelectorAll('input[name=r]').forEach(x=>x.addEventListener('change',atual));atual()}
const sgC=$('segCriar'),sgE=$('segEntrar'),pwH=$('pwHint'),pwE=$('pwEye'),API_ON=!!(window.MH_API&&MH_API.on()),HT=API_ON?'Mínimo 6 caracteres. Sua conta funciona em qualquer aparelho. Não use a senha de outros sites.':'Mínimo 6 caracteres. A conta fica salva neste aparelho. Não use a senha de outros sites.';
function marca(){sgC.setAttribute('aria-pressed',String(!login));sgE.setAttribute('aria-pressed',String(login));
 $('pwf').querySelector('label').textContent='Senha';pwH.style.display='block';pwH.classList.remove('ok');
 pwH.textContent=login?(API_ON?'Use o telefone cadastrado e a mesma senha da sua conta.':'Use o telefone cadastrado neste aparelho.'):HT;{const cn=$('cadNota');if(cn)cn.style.display=login?'none':''}$('pw').placeholder=login?'Sua senha':'Mínimo 6 caracteres'}
sgC.onclick=()=>{if(login)modo(false)};sgE.onclick=()=>{if(!login)modo(true)};
pwE.onclick=()=>{const v=$('pw').type==='password';$('pw').type=v?'text':'password';pwE.textContent=v?'Ocultar':'Mostrar';pwE.setAttribute('aria-pressed',String(v));pwE.setAttribute('aria-label',v?'Ocultar senha':'Mostrar senha')};
$('pw').addEventListener('input',()=>{if(login)return;const n=$('pw').value.length;pwH.classList.toggle('ok',n>=6);pwH.textContent=n>=6?'Senha boa. Anote para não esquecer.':HT});
{const fe=document.getElementById('faqEntrar');if(fe&&API_ON){fe.textContent='';const b=document.createElement('b');b.textContent='Entrar de novo:';fe.append(b,document.createTextNode(' toque em "Login", digite o telefone cadastrado e a senha e toque em Entrar. O telefone é o seu identificador de acesso.'))}}
const erro=m=>{const er=$('ferr');if(er){er.style.display='block';er.textContent=m}};
async function entrar(){
  const ident=$('n').value.trim(),tel=normalizaTel(ident),pw=$('pw').value;
  if(!tel||tel.length<10||!pw)return erro('Digite seu telefone cadastrado e sua senha.');
  const A=window.MH_API,on=!!(A&&A.on());let st=-1;
  if(on){
    /* Login principal por telefone. Se houver uma conta antiga salva neste aparelho,
       enviamos também a chave legada derivada do nome para permitir a migração. */
    const contasLeg=J('mh_acc',{});
    const contaLeg=Object.values(contasLeg).find(x=>normalizaTel(x&&x.tel)===tel);
    const r=await A.req('/conta/entrar',{body:{tel,chave:await chaveDe(tel,pw),chaveLegada:contaLeg?await chaveDe(contaLeg.nome,pw):'',identificador:tel}});st=r.status;
    if(r.ok&&r.j&&r.j.token){A.setUsrTk(r.j.token);const c={nome:r.j.nome,role:'helper',work:r.j.oficio||''};guarda(c.nome);MH_UI.entrarConta(c);window.MH_numChegou&&MH_numChegou(c.nome,r.j.numero);return}
    if(st===401)return erro('Telefone ou senha incorretos.');
    if(st===429)return erro('Muitas tentativas. Espere 15 minutos e tente de novo.')
  }
  /* Fallback local: procura a conta pelo telefone cadastrado. */
  const contas=J('mh_acc',{});
  const c=Object.values(contas).find(x=>normalizaTel(x&&x.tel)===tel);
  await new Promise(r=>setTimeout(r,350));
  if(!c||(await hash(pw,ub(c.salt)))!==c.hash)return erro(on?(st===0?'Sem conexão com o servidor. Tente de novo.':'Telefone ou senha incorretos.'):'Telefone ou senha incorretos.');
  guarda(c.nome);
  /* Conta antiga criada antes do login por telefone: se ainda não tiver tel, não dá para
     migrar automaticamente sem conhecer o número. */
  if(on&&st===404){try{const r=await A.req('/conta/criar',{body:{nome:c.nome,tel:tel,chave:await chaveDe(tel,pw),papel:c.role,oficio:c.work}});if(r.ok&&r.j&&r.j.token)A.setUsrTk(r.j.token)}catch(e){}}
  MH_UI.entrarConta(c)
}
const barra=ev=>{if(!login)return;ev.preventDefault();ev.stopImmediatePropagation();entrar()};
f.addEventListener('click',ev=>{if(ev.target.closest('#btnCad'))barra(ev)},true);
document.addEventListener('submit',ev=>{if(ev.target===f)barra(ev)},true);
setTimeout(()=>{let n=null;try{n=JSON.parse(sessionStorage.getItem('mh_sess')||localStorage.getItem('mh_sess')||'null')}catch(e){}
const acc=J('mh_acc',{});let c=n&&acc[String(n).toLowerCase()];
if(!c&&!n&&localStorage.getItem('mh_keep')!=='0'){try{const o=JSON.parse(localStorage.getItem('mh_eu')||'null');if(o&&o.nome)c={nome:o.nome,role:o.role,work:o.work}}catch(e){}}
if(c&&window.MH_UI)MH_UI.entrarConta(c);
else if(!n&&window.MH_API&&MH_API.on()&&MH_API.usrTk()&&window.MH_UI){const A=MH_API;A.req('/conta/eu',{token:A.usrTk()}).then(r=>{
  if(r.ok&&r.j&&r.j.ok){guarda(r.j.nome);MH_UI.entrarConta({nome:r.j.nome,role:'helper',work:r.j.oficio||''});window.MH_numChegou&&MH_numChegou(r.j.nome,r.j.numero)}
  else if(r.status===401)A.setUsrTk('')})}},400);
let ultN=null;setInterval(()=>{const e=window.MH_UI&&MH_UI.eu&&MH_UI.eu();sair.hidden=!e;const nn=e?e.nome:null;if(nn!==ultN){ultN=nn;try{MH_UI.sos()}catch(x){}}},700);
// temas (engrenagem): dourado, claro, miami, brasil, pôr do sol, terminal
{const TM=[['escuro','🌙','Dourado','#15130F'],['claro','☀️','Claro','#F5EDD3'],['miami','🌴','Miami Neon','#120A1F'],['brasil','🇧🇷','Brasil','#07140D'],['araguaia','🌅','Pôr do sol','#1A0F1E'],['terminal','💻','Terminal','#050805'],['eclipse','🔮','Eclipse','#0E0716'],['cristal','💧','Cristal','#F5F6F8'],['generico','⬜','Genérico','#FFFFFF'],['generico-noturno','🌃','Genérico Noturno','#0F1115'],['voltagem','⚡','Voltagem','#0D0F12'],['sombra','🕶️','Sombra','#08080A']];
const b=mk('button',0);b.id='temaBtn';b.type='button';document.body.append(b);
const lab=mk('label'),sel=mk('select','musFx');lab.className='cfgvol';lab.title='Tema do site';sel.setAttribute('aria-label','Tema do site');
TM.forEach(([id,em,nome])=>{const o=mk('option',0,em+' '+nome);o.value=id;sel.append(o)});lab.append('Tema ',sel);window.MH_TEMA_LABEL=lab;
const ap=x=>{if(!TM.some(y=>y[0]===x))x='generico';const i=TM.findIndex(y=>y[0]===x),nx=TM[(i+1)%TM.length];document.documentElement.dataset.tema=x;b.textContent=TM[i][1];b.setAttribute('aria-label','Tema '+TM[i][2]+'. Trocar para '+nx[2]);b.title='Tema: '+TM[i][2];sel.value=x;const m=document.querySelector('meta[name=theme-color]');if(m)m.content=TM[i][3]};
const salva=x=>{ap(x);try{localStorage.setItem('mh_tema',x)}catch(e){}try{window.MH_SOM&&MH_SOM.tocar('tema',150)}catch(e){}};
ap(document.documentElement.dataset.tema);
b.onclick=()=>{const i=TM.findIndex(y=>y[0]===document.documentElement.dataset.tema);salva(TM[(i+1)%TM.length][0])};
sel.onchange=()=>salva(sel.value)}

// Guilda: fazer chamado
const gl=$('gdList');
if(gl){
  const box=mk('div','gnewb'),bt=mk('button','go','+ Fazer chamado na Guilda');bt.type='button';bt.setAttribute('aria-expanded','false');
  const fm=mk('form','gnew');fm.hidden=true;
  const g=mk('select');['TRABALHO','SERVIÇO','RECOMPENSA','ACHADOS E PERDIDOS'].forEach(x=>g.append(new Option(x,x)));
  const t=mk('input');t.maxLength=60;t.required=true;const d=mk('textarea');d.rows=2;d.maxLength=160;d.required=true;const v=mk('input');v.maxLength=30;v.placeholder='Ex.: R$ 120 ou a combinar';
  const ok=mk('button','go','Publicar chamado');ok.type='submit';
  const msg=mk('p','note','Seu chamado fica salvo neste aparelho.');msg.setAttribute('role','status');
  fm.append(fld('Tipo',g),fld('Título',t),fld('O que você precisa ou oferece',d),fld('Valor',v),ok,msg);box.append(bt,fm);gl.after(box);
  bt.onclick=()=>{fm.hidden=!fm.hidden;bt.setAttribute('aria-expanded',String(!fm.hidden))};
  const card=(m,meu)=>{const c=mk('div','gc meu-g');c.append(mk('div','gt',m.g),mk('h3',0,m.t),mk('p',0,m.d));
    const r=mk('div','gm');r.append(mk('span','gv',m.v||'a combinar'));
    const b=mk('button',0,meu?'Apagar':'Ver perfil de '+m.p);b.type='button';
    if(meu)b.onclick=()=>{S('mh_guilda',J('mh_guilda',[]).filter(x=>x.id!==m.id));pinta()};else b.dataset.u=m.p;
    r.append(b);c.append(r);return c};
  function pinta(){gl.querySelectorAll('.meu-g').forEach(x=>x.remove());const eu=MH_UI.eu&&MH_UI.eu();
    J('mh_guilda',[]).reverse().forEach(m=>gl.prepend(card(m,eu&&eu.nome===m.p)))}
  fm.addEventListener('submit',e=>{e.preventDefault();const eu=MH_UI.eu&&MH_UI.eu();
    if(!eu){msg.textContent='Cadastre-se ou entre na sua conta para fazer um chamado.';return}
    const a=J('mh_guilda',[]);a.push({id:Date.now(),p:eu.nome,g:g.value,t:t.value.trim(),d:d.value.trim(),v:v.value.trim()});S('mh_guilda',a.slice(-30));
    t.value=d.value=v.value='';msg.textContent='Chamado publicado na Guilda.';pinta()});
  {const f=(window.MH_FLOOR||{}).guilda;if(f)S('mh_guilda',J('mh_guilda',[]).filter(x=>x.id>f))}
  window.MH_guildaLimpar=function(t){gl.querySelectorAll('.gc:not(.meu-g)').forEach(x=>x.remove());if(window.MH_MISSOES)window.MH_MISSOES.length=0;S('mh_guilda',J('mh_guilda',[]).filter(x=>x.id>t));pinta()};
  pinta();setInterval(pinta,4000);
}

// Chamar o ADM
const q=document.querySelector('#quem .body');
if(q){const b=mk('button','go','Chamar o administrador');b.type='button';b.style.marginTop='10px';q.append(b);
  const dl=mk('dialog');dl.setAttribute('aria-label','Chamar o administrador');document.body.append(dl);
  b.onclick=()=>{dl.textContent='';const eu=MH_UI.eu&&MH_UI.eu(),fm=mk('form');fm.append(mk('h3',0,'Chamar o administrador'));
    const as=mk('input');as.maxLength=60;as.required=true;as.placeholder='Assunto';const ms=mk('textarea');ms.rows=4;ms.maxLength=400;ms.required=true;
    ms.style.cssText='width:100%;background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:10px;color:var(--text);font:inherit';
    const dt=mk('div','dbt'),go=mk('button','go','Enviar');go.type='submit';const cx=mk('button','cx','Cancelar');cx.type='button';cx.onclick=()=>dl.close();dt.append(go,cx);
    fm.append(fld('Assunto',as),fld('Mensagem',ms),mk('p','note','O chamado chega à administração por e-mail (seu aplicativo de e-mail vai abrir). Quem estiver no painel ADM neste navegador também o vê em Ocorrências.'),dt);
    fm.onsubmit=e=>{e.preventDefault();const quem=eu?eu.nome:'Visitante';
      try{window.MH_chamadoAdm&&MH_chamadoAdm(quem,as.value.trim()+': '+ms.value.trim())}catch(x){}
      const mail=(window.MH_PIX&&MH_PIX.contato)||'';dl.close();
      if(mail)location.href='mailto:'+mail+'?subject='+encodeURIComponent('Chamado MiHelp: '+as.value.trim())+'&body='+encodeURIComponent(ms.value.trim()+'\n\nDe: '+quem)};
    dl.append(fm);dl.showModal()}}
})();
}catch(e){console.error('MiHelp (conta, guilda, chamado):',e)}

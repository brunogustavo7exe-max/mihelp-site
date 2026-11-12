
/* Como quero receber: chave Pix de qualquer banco ou conta bancária. A chave inteira NUNCA fica no navegador: vai ao Worker (/recebimento/*); em modo teste guarda só a versão mascarada. */
(function(){try{
const LS='mh_receb_v1';
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const btn=(x,c,f)=>{const b=mk('button',c||'more',x);b.type='button';b.onclick=f;return b};
const eu=()=>window.MH_UI&&MH_UI.eu&&MH_UI.eu();
const api=()=>!!(window.MH_API&&MH_API.on());
const tk=()=>window.MH_API?MH_API.usrTk():'';
const dig=s=>String(s||'').replace(/\D/g,'');
/* validações */
const cpfOk=s=>{s=dig(s);if(s.length!==11||/^(\d)\1+$/.test(s))return false;for(let t=9;t<11;t++){let d=0;for(let i=0;i<t;i++)d+=s[i]*(t+1-i);d=(d*10)%11%10;if(+s[t]!==d)return false}return true};
const cnpjOk=s=>{s=dig(s);if(s.length!==14||/^(\d)\1+$/.test(s))return false;const f=(n)=>{let p=n-7,d=0;for(let i=0;i<n;i++){d+=s[i]*p--;if(p<2)p=9}d=d%11;return d<2?0:11-d};return f(12)==s[12]&&f(13)==s[13]};
const TIPOS={cpf:['CPF',cpfOk,'000.000.000-00'],cnpj:['CNPJ',cnpjOk,'00.000.000/0000-00'],tel:['Telefone',s=>{s=dig(s);return s.length===11&&s[2]==='9'||s.length===10},'(66) 90000-0000'],email:['E-mail',s=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s),'voce@email.com'],rand:['Chave aleatória',s=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s),'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx']};
const mascara=(t,v)=>{if(t==='cpf'||t==='cnpj'){const d=dig(v);return '•••'+d.slice(-4,-2)+'•'+d.slice(-2)}if(t==='tel'){const d=dig(v);return '(••) •••••-'+d.slice(-4)}if(t==='email'){const[a,b]=v.split('@');return a.slice(0,2)+'•••@'+b}return v.slice(0,4)+'••••-••••'};
const BANCOS=['Caixa Econômica Federal','Banco do Brasil','Bradesco','Itaú','Santander','Nubank','Inter','Sicredi','Sicoob','C6 Bank','Mercado Pago','PicPay','Outro banco'];
const ler=()=>{try{return JSON.parse(localStorage.getItem(LS))||{}}catch(e){return{}}};
const sal=o=>{try{localStorage.setItem(LS,JSON.stringify(o))}catch(e){}};
let D=null,MODO='';
async function op(path,body,local){if(api()){const r=await MH_API.req(path,{token:tk(),body:body||undefined});if(r.ok&&r.j){MODO='api';return r.j}if(r.status!==404&&r.status!==0)return{erro:(r.j&&r.j.erro)||'Não deu certo. Tente de novo.'}}MODO='local';return local()}
const status=()=>op('/recebimento/status',null,()=>({r:(ler()[eu().nome])||null}));
const salvar=d=>op('/recebimento/salvar',d,()=>{const o=ler();o[eu().nome]={tipo:d.via,mask:d.via==='pix'?mascara(d.tipoChave,d.chave):(d.banco+' · ag '+d.ag+' · cc •••'+dig(d.conta).slice(-2)),em:Date.now()};sal(o);return{ok:1}});
/* janela */
function nova(){if(D&&D.open)D.close();D=mk('dialog','v8dlg v8book');D.setAttribute('aria-label','Como quero receber');document.body.append(D);D.addEventListener('click',e=>{if(e.target===D)D.close()});D.addEventListener('close',()=>D.remove());D.showModal();return D}
const topo=(t,sub)=>{const h=mk('div','v8head'),a=mk('div','','💰');a.style.cssText='width:48px;height:48px;display:grid;place-items:center;font-size:24px;background:var(--bg)';const b=mk('div');b.append(mk('p','note',sub||'Carteira'),mk('h3',null,t));h.append(a,b);D.append(h)};
const nota=t=>mk('p','note',t);
const rodape=(...b)=>{const f=mk('div','bk-foot');b.forEach(x=>f.append(x));D.append(f)};
const fecha=()=>btn('✕ Fechar','more',()=>D.close());
const cartao=(n,m,p,f)=>{const b=mk('button','mhp-big bk-sv');b.type='button';b.append(mk('span','bk-n',n),mk('span','bk-m',m));if(p)b.append(mk('span','bk-p',p));b.append(mk('span','bk-go','›'));b.onclick=f;return b};
const campo=(ph,max,v,inp)=>{const i=mk('input');i.placeholder=ph;i.maxLength=max;i.value=v||'';i.style.cssText='width:100%;min-height:44px;margin-top:8px';if(inp)i.inputMode=inp;return i};
async function inicio(){if(!eu()){alert('Entre na sua conta para cadastrar como quer receber.');return}
 nova();topo('Como quero receber','Recebimentos');const s=await status();
 if(MODO==='local')D.append(nota('Modo teste: nada é enviado e a chave completa não é guardada neste aparelho.'));
 const c=mk('div','v8card');if(s.r){c.append(mk('p',null,'✅ Recebimentos ativos'),mk('p','note',(s.r.tipo==='pix'?'Chave Pix: ':'Conta: ')+s.r.mask))}else c.append(mk('p',null,'⏳ Ainda não configurado'),mk('p','note','Sem isso você usa o app normalmente, mas não recebe pagamentos pelo MiHelp.'));D.append(c);
 D.append(cartao(s.r?'Trocar forma de receber':'Configurar agora','Qualquer banco, você escolhe','',()=>escolha()));
 D.append(cartao('Como criar minha chave Pix','Passo a passo rápido','',guia));
 rodape(fecha())}
function escolha(){D.textContent='';topo('Escolha como receber','Passo 1 de 2');
 D.append(cartao('🔑 Chave Pix (recomendado)','Funciona com qualquer banco','',()=>pix({tipo:'cpf'})));
 D.append(cartao('🏦 Conta bancária','Banco, agência e conta','',()=>conta()));
 const m=cartao('🟦 Mercado Pago','Para quem já tem conta','em breve',()=>alert('A conexão com Mercado Pago entra quando o servidor de pagamentos for ligado.'));m.style.opacity='.6';D.append(m);
 D.append(nota('A chave ou conta precisa estar no mesmo CPF ou CNPJ do seu cadastro.'));rodape(btn('← Voltar','more',inicio),fecha())}
function pix(S){D.textContent='';topo('Sua chave Pix','Passo 2 de 2');
 const c=mk('div','mhp-c');const inp=campo(TIPOS[S.tipo][2],77,S.v);
 const pinta=()=>{[...c.children].forEach(b=>b.classList.toggle('on',b.dataset.k===S.tipo));inp.placeholder=TIPOS[S.tipo][2];inp.inputMode=S.tipo==='email'?'email':S.tipo==='rand'?'text':'numeric'};
 Object.keys(TIPOS).forEach(k=>{const b=btn(TIPOS[k][0],'mhp-chip',()=>{S.tipo=k;pinta()});b.dataset.k=k;c.append(b)});D.append(c,inp);pinta();
 D.append(nota('Confere se digitou certinho. A chave é só o destino do repasse (toda terça).'));
 rodape(btn('← Voltar','more',escolha),btn('💾 Salvar','more cta2',async e=>{const v=inp.value.trim();if(!TIPOS[S.tipo][1](v)){alert('Essa chave não parece válida para o tipo '+TIPOS[S.tipo][0]+'.');return}
  e.currentTarget.disabled=true;const r=await salvar({via:'pix',tipoChave:S.tipo,chave:v});if(r.erro){e.currentTarget.disabled=false;alert(r.erro);return}pronto()}))}
function conta(){D.textContent='';topo('Sua conta bancária','Passo 2 de 2');
 const b=mk('select');b.style.cssText='width:100%;min-height:44px';BANCOS.forEach(n=>b.append(new Option(n,n)));
 const t=mk('select');t.style.cssText='width:100%;min-height:44px;margin-top:8px';['Conta corrente','Poupança','Conta de pagamento'].forEach(n=>t.append(new Option(n,n)));
 const ag=campo('Agência (sem dígito)',5,'','numeric'),cc=campo('Conta com dígito',14,'','numeric');D.append(b,t,ag,cc,nota('Dica: se der trabalho, crie uma chave Pix no app do seu banco. É grátis e bem mais rápido.'));
 rodape(btn('← Voltar','more',escolha),btn('💾 Salvar','more cta2',async e=>{const a=dig(ag.value),c=dig(cc.value);if(a.length<3||a.length>5||c.length<4||c.length>13){alert('Confira agência e conta.');return}
  e.currentTarget.disabled=true;const r=await salvar({via:'banco',banco:b.value,tipoConta:t.value,ag:a,conta:c});if(r.erro){e.currentTarget.disabled=false;alert(r.erro);return}pronto()}))}
function pronto(){D.textContent='';topo('Tudo certo!','Recebimentos');D.append(nota('Quando o servidor de pagamentos estiver ligado, você será avisado pelo WhatsApp. Se trocar a chave depois, o repasse fica retido por um tempo, por segurança.'));rodape(btn('Ver status','more',inicio),fecha())}
function guia(){D.textContent='';topo('Como criar minha chave Pix','Ajuda');
 [['Em qualquer banco','Abra o app do seu banco, procure "Pix" e depois "Minhas chaves" ou "Cadastrar chave".'],['Qual chave escolher','O CPF é a mais simples. Telefone e e-mail também servem.'],['Se não achar','Os nomes dos menus mudam de banco pra banco. Chame no suporte do seu banco ou do MiHelp.'],['Bancos mais usados aqui','Caixa, Banco do Brasil, Bradesco, Sicredi, Nubank, Inter e Itaú: todos têm Pix, e a chave é gratuita.']].forEach(([a,b])=>{const c=mk('div','v8card');c.append(mk('p',null,a),mk('p','note',b));D.append(c)});
 rodape(btn('← Voltar','more',inicio),fecha())}
window.MH_RECEBER={abrir:inicio};
const poe=()=>{const nv=document.querySelector('nav.nv');if(!nv||document.getElementById('navRec'))return;const b=btn('💰 Receber','more',inicio);b.id='navRec';const r=document.getElementById('navOrc')||document.getElementById('navAjustes');r?r.before(b):nv.prepend(b)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(poe,10));else poe();
}catch(e){console.error('MiHelp (receber):',e)}})();

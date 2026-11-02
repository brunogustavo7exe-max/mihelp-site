
/* MiHelp — Classificados (estilo Marketplace). Olhar é livre; anunciar, ver contato, editar e denunciar exigem conta. */
try{(function(){
const A=window.MH_API;if(!A)return;
const CID={'barra-do-garcas':'Barra do Garças',aragarcas:'Aragarças','pontal-do-araguaia':'Pontal do Araguaia'};try{Object.assign(CID,window.MH_REGIAO.nomes);if(window.MH_CIDADE)CID[MH_CIDADE.slug]=MH_CIDADE.nome}catch(e){}
const CATS=['Veículos','Casa e móveis','Eletrônicos','Roupas e acessórios','Ferramentas e construção','Animais','Bebês e crianças','Esporte e lazer','Outros'];
const ICO={'Veículos':'🚗','Casa e móveis':'🛋️','Eletrônicos':'📱','Roupas e acessórios':'👕','Ferramentas e construção':'🧰','Animais':'🐾','Bebês e crianças':'🧸','Esporte e lazer':'⚽','Outros':'📦'};
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const bt=(t,c,f)=>{const b=mk('button',c||'more',t);b.type='button';b.onclick=f;return b};
const bt2=(t,c,f)=>{let k=0;const b=bt(t,c,()=>{if(!k){k=setTimeout(()=>{k=0;b.textContent=t},4000);b.textContent='Toque de novo para confirmar';return}clearTimeout(k);k=0;b.textContent=t;f()});return b};
const rs=v=>'R$ '+(Number(v)||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const rsC=v=>rs(v).replace(',00','');
const num=v=>{let s=String(v==null?'':v).trim();if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');return Number(s)||0};
const erro=r=>(r&&r.j&&r.j.erro)||'Não deu certo. Tente de novo.';
const campo=(rot,tipo,at)=>{const l=mk('label',null,rot);const i=document.createElement(tipo==='select'||tipo==='textarea'?tipo:'input');if(tipo!=='select'&&tipo!=='textarea')i.type=tipo||'text';Object.assign(i,at||{});l.append(i);return {l,i}};
const admOn=()=>!!(document.body.classList.contains('adm')&&A.admTk());
const tok=()=>A.usrTk();
const logado=()=>!!tok();
const idade=ts=>{const h=Math.floor((Date.now()-ts)/3600000);return h<1?'agora':h<24?'há '+h+' h':'há '+Math.floor(h/24)+' d'};
const zap=n=>{n=String(n).replace(/\D/g,'');return 'https://wa.me/'+(n.length<=11?'55':'')+n};
const preco=x=>x.tp==='doacao'?'🎁 Doação':x.tp==='troca'?'🔄 Troca':rsC(x.p);
const aviso='⚠️ Não pague adiantado. Combine em lugar público e confira o produto antes de pagar. O MiHelp não participa da negociação.';

/* estilo da grade (usa as cores do tema) */
const sty=document.createElement('style');sty.textContent='#clsBox .cls-grid{display:block;column-width:150px;column-gap:12px;margin-top:12px}#clsBox .cls-grid>p{column-span:all}#clsBox .cls-c,.cls-c{border:1px solid var(--line);border-radius:12px;overflow:hidden;cursor:pointer;display:flex;flex-direction:column;text-align:left;padding:0;font:inherit;color:inherit;background:transparent;width:100%;margin:0 0 12px;break-inside:avoid;-webkit-column-break-inside:avoid}.cls-c:focus-visible{outline:2px solid currentColor}.cls-f{min-height:96px;background:#8883;display:flex;align-items:center;justify-content:center;font-size:42px;overflow:hidden}.cls-f img{width:100%;height:auto;display:block}.cls-i{padding:8px 10px 10px}.cls-p{font-weight:800;font-size:17px}.cls-t{font-size:14px;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin:2px 0}.cls-m{font-size:12px;opacity:.75}.cls-v{position:relative}.cls-tag{position:absolute;top:6px;left:6px;background:#000b;color:#fff;border-radius:6px;padding:2px 6px;font-size:11px}';document.head.append(sty);

/* ---- fotos: reduz no aparelho. A miniatura (pequena) é a que aparece na grade ---- */
function carrega(src){return new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=src})}
function desenha(img,max,q){const k=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);return c.toDataURL('image/jpeg',q)}
async function reduz(file){const u=URL.createObjectURL(file);try{const img=await carrega(u);for(const [m,q] of [[900,.72],[800,.6],[700,.5],[560,.45]]){const s=desenha(img,m,q);if(s.length<=155000)return s}return ''}catch(e){return ''}finally{URL.revokeObjectURL(u)}}
async function miniDe(dataUrl){try{const img=await carrega(dataUrl);for(const q of [.55,.4,.3]){const s=desenha(img,240,q);if(s.length<=23000)return s}return ''}catch(e){return ''}}

/* ---- janela (formulários, detalhe, meus anúncios) ---- */
let d=null;
const dlg=()=>{if(d)return d;d=document.createElement('dialog');d.className='v8dlg';d.setAttribute('aria-label','Classificados');document.body.append(d);d.addEventListener('click',e=>{if(e.target===d)d.close()});return d};
const abreDlg=()=>{dlg();if(!d.open)d.showModal();d.textContent=''};
const cab=t=>{const c=mk('div','v8row v8cab');c.style.justifyContent='space-between';c.append(mk('h3',null,t),bt('✕ Fechar','more',()=>d.close()));return c};
const pedeLogin=st=>{st.style.color='var(--red)';st.textContent='Entre na sua conta para fazer isso. Toque em "Conta" aqui embaixo.';try{const b=document.querySelector('[data-dock="conta"]');if(b)setTimeout(()=>{if(d&&d.open)d.close();b.click()},1100)}catch(e){}};
const fotoReq=(id,n)=>A.req('/classificados/foto?id='+encodeURIComponent(id)+'&n='+n);

/* ---- a seção na página: filtros + grade de cartões ---- */
const box=document.getElementById('clsBox');
let F={cidade:window.MH_REGIAO.param(),cat:'',q:''};
async function lista(off){
 if(!box)return;off=off||0;
 if(!off){box.textContent='';
  const st=mk('p','note');st.id='clsSt';st.setAttribute('role','status');
  const ac=mk('div','v8acts');ac.append(bt('➕ Anunciar','cta2',()=>logado()?form():(abreDlg(),d.append(cab('Classificados'),mk('p','note','Entre na sua conta para anunciar. Toque em "Conta" aqui embaixo.')))),bt('📦 Meus anúncios','more',()=>logado()?meus():(abreDlg(),d.append(cab('Classificados'),mk('p','note','Entre na sua conta para ver os seus anúncios. Toque em "Conta" aqui embaixo.')))));
  if(admOn())ac.append(bt('🛠 Adm: denúncias','more',adm));
  const fc=campo('Cidade','select');fc.i.add(new Option('Todas',''));if(window.MH_REGIAO.on)fc.i.add(new Option('Toda a minha região',window.MH_REGIAO.param()));{const cs=Object.assign({},CID,window.MH_REGIAO.nomes);Object.keys(cs).forEach(k=>fc.i.add(new Option(cs[k],k)))}fc.i.value=F.cidade;
  const fk=campo('Categoria','select');fk.i.add(new Option('Todas',''));CATS.forEach(k=>fk.i.add(new Option(ICO[k]+' '+k,k)));fk.i.value=F.cat;
  const fq=campo('Buscar','search',{value:F.q,maxLength:40,placeholder:'Ex.: geladeira, bicicleta, filhote'});
  const go=()=>{F={cidade:fc.i.value,cat:fk.i.value,q:fq.i.value.trim()};lista(0)};fc.i.onchange=go;fk.i.onchange=go;fq.i.onkeydown=e=>{if(e.key==='Enter')go()};
  box.append(mk('p','note',aviso),ac,fk.l,fq.l,bt('🔎 Buscar','more',go),st);
  const g=mk('div','cls-grid');g.id='clsGrid';const mm=mk('div');mm.id='clsMais';box.append(g,mm)}
 const g=document.getElementById('clsGrid'),mais=document.getElementById('clsMais');
 if(!off)g.append(mk('p','note','Carregando…'));
 const r=await A.req('/classificados?cidade='+encodeURIComponent(F.cidade)+'&cat='+encodeURIComponent(F.cat)+'&q='+encodeURIComponent(F.q)+'&off='+off,{token:tok()});
 if(!off)g.textContent='';mais.textContent='';
 if(!(r.ok&&r.j&&r.j.ok)){g.append(mk('p','note','❌ '+erro(r)+' Tente de novo em instantes.'));return}
 if(!r.j.itens.length&&!off){g.append(mk('p','note','Nenhum anúncio por aqui ainda. Seja o primeiro: toque em "Anunciar".'));return}
 r.j.itens.forEach(x=>g.append(cartaoGrade(x)));
 if(r.j.mais)mais.append(bt('Ver mais anúncios','more',()=>lista(off+48)))}

function cartaoGrade(x){
 const b=mk('button','cls-c');b.type='button';b.setAttribute('aria-label',x.t+', '+preco(x));
 const v=mk('div','cls-f cls-v');if(x.mi){const im=mk('img');im.src=x.mi;im.alt='';im.loading='lazy';v.append(im)}else v.append(mk('span',null,ICO[x.c]||'📦'));
 if(x.st==='vendido')v.append(mk('span','cls-tag',x.tp==='doacao'?'Doado':'Vendido'));
 const i=mk('div','cls-i');i.append(mk('div','cls-p',preco(x)),mk('div','cls-t',x.t),mk('div','cls-m',[CID[x.cid]||'',idade(x.d)].filter(Boolean).join(' · ')));
 b.append(v,i);b.onclick=()=>detalhe(x);return b}

/* ---- detalhe do anúncio (fotos grandes, contato, denunciar; dono edita) ---- */
function detalhe(x,voltaMeus,admin){
 abreDlg();const st=mk('p','note');st.setAttribute('role','status');
 d.append(cab(x.t),st);
 if(x.f>0){const im=mk('img');im.alt='Foto de '+x.t;im.style.cssText='width:100%;max-height:320px;object-fit:contain;border-radius:10px;background:#0002';if(x.mi)im.src=x.mi;d.append(im);
  const ver=n=>fotoReq(x.id,n).then(r=>{if(r.ok&&r.j&&r.j.f)im.src=r.j.f});ver(1);
  if(x.f>1){const fs=mk('div','v8acts');for(let n=1;n<=x.f;n++)fs.append(bt('📷 '+n,'more',()=>ver(n)));d.append(fs)}}
 const h=mk('div','v8row');h.style.justifyContent='space-between';h.append(mk('b',null,preco(x)));d.append(h,mk('h4',null,x.t));
 d.append(mk('p','note',[x.c,x.es==='novo'?'Novo':x.es==='usado'?'Usado':'',CID[x.cid]||'',x.b,'Publicado '+idade(x.d)+' por '+x.nome].filter(Boolean).join(' · ')));
 if(x.x)d.append(mk('p',null,x.x));
 if(x.st==='vendido')d.append(mk('p','note','✅ '+(x.tp==='doacao'?'Já foi doado':'Já foi vendido')));
 const out=mk('p','note');out.setAttribute('role','status');
 const ac=mk('div','v8acts');
 if(x.st!=='vendido')ac.append(bt('💬 Ver contato (WhatsApp)','cta2',async()=>{if(!logado()){pedeLogin(st);return}out.textContent='⏳…';const r=await A.req('/classificados/contato?id='+encodeURIComponent(x.id),{token:tok()});
  if(r.ok&&r.j&&r.j.ok){out.textContent='';const a=mk('a','more','Abrir WhatsApp de '+(r.j.nome||'anunciante'));a.href=zap(r.j.contato);a.target='_blank';a.rel='noopener noreferrer';out.append(a)}else{out.style.color='var(--red)';out.textContent='❌ '+erro(r)}}));
 if(!x.meu&&!admin)ac.append(bt2('🚩 Denunciar','more',async()=>{if(!logado()){pedeLogin(st);return}const r=await A.req('/classificados/denunciar',{token:tok(),body:{id:x.id}});out.style.color=r.ok?'':'var(--red)';out.textContent=r.ok&&r.j&&r.j.ok?'Denúncia enviada. O administrador vai analisar.':'❌ '+erro(r)}));
 if(x.meu&&!admin)ac.append(bt('✏️ Editar este anúncio','more',()=>form(x.id)),bt('📦 Meus anúncios','more',meus));
 d.append(ac,out,mk('p','note',aviso))}

/* ---- meus anúncios ---- */
async function meus(){
 abreDlg();const st=mk('p','note');st.setAttribute('role','status');d.append(cab('📦 Meus anúncios'),st);
 const bx=mk('div');d.append(bx);bx.append(mk('p','note','Carregando…'));
 const r=await A.req('/classificados/meus',{token:tok()});bx.textContent='';
 if(!(r.ok&&r.j&&r.j.ok)){bx.append(mk('p','note','❌ '+erro(r)));return}
 if(!r.j.itens.length)bx.append(mk('p','note','Você ainda não anunciou nada.'));
 const faz=async(path,body)=>{st.style.color='';st.textContent='⏳…';const q=await A.req(path,{token:tok(),body});if(q.ok&&q.j&&q.j.ok){meus();lista(0)}else{st.style.color='var(--red)';st.textContent='❌ '+erro(q)}};
 r.j.itens.forEach(x=>{x.meu=true;const c=mk('div','v8card');
  const top=mk('div','v8row');top.style.justifyContent='space-between';top.append(mk('b',null,x.t),mk('b',null,preco(x)));c.append(top);
  c.append(mk('p','note',x.oculto?'🚫 Escondido pelo administrador.':x.vencido?'⌛ Venceu. Renove para voltar a aparecer.':(x.st==='vendido'?'✅ '+(x.tp==='doacao'?'Doado':'Vendido')+' · ':'')+'Vence em '+Math.max(0,Math.ceil((x.ex-Date.now())/86400000))+' dias.'));
  const ac=mk('div','v8acts');
  ac.append(bt('👁 Ver','more',()=>detalhe(x)),bt('✏️ Editar','more',()=>form(x.id)),bt(x.st==='vendido'?'↩️ Reabrir':(x.tp==='doacao'?'🎁 Doado':'✅ Vendido'),'more',()=>faz('/classificados/status',{id:x.id,status:x.st==='vendido'?'ativo':'vendido'})),bt('🔁 Renovar 30 dias','more',()=>faz('/classificados/renovar',{id:x.id})),bt2('🗑 Apagar','more',()=>faz('/classificados/apagar',{id:x.id})));
  c.append(ac);bx.append(c)})}

/* ---- formulário: serve para anunciar e para editar (o dono, ou o adm) ---- */
async function form(editId,comoAdm){
 abreDlg();const st=mk('p','note');st.setAttribute('role','status');d.append(cab(editId?'✏️ Editar anúncio':'➕ Novo anúncio'),st);
 const T=()=>comoAdm?A.admTk():tok();
 let ed=null;
 if(editId){st.textContent='⏳ Carregando…';const r=await A.req('/classificados/um?id='+encodeURIComponent(editId),{token:T()});st.textContent='';if(!(r.ok&&r.j&&r.j.ok)){st.style.color='var(--red)';st.textContent='❌ '+erro(r);return}ed=r.j.a}
 let fotos=null;let mini='';   /* null = não mexer nas fotos que já estão no anúncio */
 const tp=campo('O que você quer fazer?','select');[['venda','💰 Vender'],['doacao','🎁 Doar'],['troca','🔄 Trocar']].forEach(([v,t])=>tp.i.add(new Option(t,v)));
 const ti=campo('Título','text',{maxLength:80,placeholder:'Ex.: Geladeira Brastemp 350 L'});
 const ca=campo('Categoria','select');CATS.forEach(k=>ca.i.add(new Option(k,k)));
 const es=campo('Estado','select');[['','Não se aplica'],['novo','Novo'],['usado','Usado']].forEach(([v,t])=>es.i.add(new Option(t,v)));
 const pr=campo('Preço (R$)','text',{inputMode:'decimal',maxLength:12,placeholder:'Ex.: 850,00'});
 const ci=campo('Cidade','select');Object.keys(CID).forEach(k=>ci.i.add(new Option(CID[k],k)));
 const ba=campo('Bairro','text',{maxLength:40,placeholder:'Ex.: Centro'});
 const de=campo('Descrição','textarea',{maxLength:600,rows:4,placeholder:'Conte o estado, o tamanho, o motivo, se aceita troca…'});
 const co=campo('WhatsApp (com DDD)','tel',{maxLength:20,placeholder:'(66) 99999-9999'});
 const ft=campo(ed&&ed.f?'Fotos (hoje o anúncio tem '+ed.f+'; escolha novas só se quiser trocar todas)':'Fotos (até 3)','file',{accept:'image/*',multiple:true});
 if(ed){tp.i.value=ed.tipo;ti.i.value=ed.titulo;ca.i.value=ed.categoria;es.i.value=ed.estado;pr.i.value=ed.preco?String(ed.preco).replace('.',','):'';ci.i.value=ed.cidade;ba.i.value=ed.bairro;de.i.value=ed.descricao;co.i.value=ed.contato}
 tp.i.onchange=()=>{pr.l.hidden=tp.i.value!=='venda'};tp.i.onchange();
 const pv=mk('div','v8acts');
 const pinta=()=>{pv.textContent='';(fotos||[]).forEach((s,i)=>{const w=mk('div');const im=mk('img');im.src=s;im.alt='Foto '+(i+1);im.style.cssText='width:84px;height:84px;object-fit:cover;border-radius:8px';w.append(im,bt('✕','more',async()=>{fotos.splice(i,1);if(i===0)mini=fotos[0]?await miniDe(fotos[0]):'';if(!fotos.length)fotos=ed&&ed.f?[]:fotos;pinta()}));pv.append(w)})};
 ft.i.onchange=async()=>{st.style.color='';if(fotos===null)fotos=[];for(const f of [...ft.i.files]){if(fotos.length>=3)break;st.textContent='⏳ Preparando foto…';const s=await reduz(f);if(s){fotos.push(s);if(fotos.length===1)mini=await miniDe(s)}else{st.style.color='var(--red)';st.textContent='❌ Não consegui usar uma das fotos. Tente outra.'}}ft.i.value='';if(!st.style.color)st.textContent='';pinta()};
 d.append(tp.l,ti.l,ca.l,es.l,pr.l,ci.l,ba.l,de.l,co.l,ft.l,pv,mk('p','note','🔒 O WhatsApp só aparece para quem está logado. O anúncio fica 30 dias e pode ser renovado. Animais silvestres não podem ser anunciados.'));
 d.append(bt(editId?'💾 Salvar alterações':'🚀 Publicar anúncio','cta2 v8go',async()=>{st.style.color='';st.textContent='⏳ Salvando…';
  const corpo={tipo:tp.i.value,titulo:ti.i.value,categoria:ca.i.value,estado:es.i.value,preco:num(pr.i.value),cidade:ci.i.value,bairro:ba.i.value,descricao:de.i.value,contato:co.i.value};
  if(fotos!==null){corpo.fotos=fotos;corpo.mini=mini}
  if(editId)corpo.id=editId;
  const r=await A.req(editId?'/classificados/editar':'/classificados',{token:T(),body:corpo});
  if(r.ok&&r.j&&r.j.ok){lista(0);if(comoAdm)adm();else meus()}else{st.style.color='var(--red)';st.textContent='❌ '+erro(r)}}),bt('← Voltar','more',()=>{if(comoAdm)adm();else if(editId)meus();else d.close()}))}

/* ---- adm: denúncias, esconder, editar, apagar ---- */
async function adm(){
 abreDlg();const st=mk('p','note');d.append(cab('🛠 Classificados: administração'),st);
 const bx=mk('div');d.append(bx);bx.append(mk('p','note','Carregando…'));const r=await A.req('/admin/classificados',{token:A.admTk()});bx.textContent='';
 if(!(r.ok&&r.j&&r.j.ok)){bx.append(mk('p','note','❌ '+erro(r)));return}
 const faz=async(acao,x,v)=>{const q=await A.req('/admin/classificados/acao',{token:A.admTk(),body:{acao,id:x.id,v}});if(q.ok&&q.j&&q.j.ok){adm();lista(0)}else{st.style.color='var(--red)';st.textContent='❌ '+erro(q)}};
 r.j.itens.forEach(x=>{const c=mk('div','v8card');const top=mk('div','v8row');top.style.justifyContent='space-between';top.append(mk('b',null,x.t),mk('b',null,preco(x)));c.append(top,mk('p','note','🚩 '+x.reps+' denúncia(s) · '+x.nome+' · tel '+x.tel+(x.oculto?' · ESCONDIDO':'')));
  const ac=mk('div','v8acts');ac.append(bt('👁 Ver','more',()=>detalhe(x,false,true)),bt('✏️ Editar','more',()=>form(x.id,true)),bt(x.oculto?'👁 Mostrar':'🙈 Esconder','more',()=>faz('ocultar',x,!x.oculto)),bt('✔ Zerar denúncias','more',()=>faz('zerar',x)),bt2('🗑 Apagar','more',()=>faz('apagar',x)));c.append(ac);bx.append(c)})}

/* carrega a lista na primeira vez que a seção aparece (a página começa limpa) */
const sec=document.getElementById('classificados');let carregou=false;
if(sec&&'IntersectionObserver' in window){new IntersectionObserver((es,ob)=>{if(!carregou&&es.some(e=>e.isIntersecting)){carregou=true;lista(0);ob.disconnect()}}).observe(sec)}else if(sec){lista(0)}
})()}catch(e){console.error('classificados:',e)}

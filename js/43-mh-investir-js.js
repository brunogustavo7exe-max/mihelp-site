
/* ===== Investir: vitrine regional de franquias, negócios e oportunidades =====
   O MiHelp só divulga e conecta. Sem pagamento, sem garantia de retorno.
   Dados: servidor (GET /investir etc.) quando a rota existir; senão MODO LOCAL, avisado na tela (fica só neste aparelho). */
(function(){try{
const CIDS=[['barra-do-garcas','Barra do Garças-MT'],['pontal-do-araguaia','Pontal do Araguaia-MT'],['aragarcas','Aragarças-GO']];
const CN=Object.fromEntries(CIDS);
const CATS=[['franquia','Franquias'],['regiao','Negócios da região'],['oportunidade','Oportunidades de investimento']];
const CATN=Object.fromEntries(CATS);
const PROC={franqueado:'Procura franqueado',socio:'Procura sócio',investidor:'Procura investidor',comprador:'Procura comprador'};
const PLANOS=[['basico','Básico',['Perfil da empresa','Apresentação da oportunidade','Botão de contato','Presença na categoria correspondente']],
 ['destaque','Destaque',['Tudo do plano Básico','Maior destaque visual','Posição privilegiada na listagem','Identificação de oportunidade patrocinada']],
 ['exclusivo','Exclusivo',['Maior destaque na página','Espaço de divulgação especial','Relatório de visualizações e manifestações de interesse, quando esses dados estiverem disponíveis']]];
const DEMC=['Lavanderia automática','Mercado autônomo','Cafeteria','Academia','Restaurante','Loja de materiais de construção','Outro'];
const EXEMPLOS=['Velox','Prepara IA','Mr. Cheney','Mestre das Tintas','Easy Market','market4u','Lavland','Mordidela'];
const FAIXAS=['Prefiro não informar','Até R$ 50 mil','R$ 50 mil a R$ 150 mil','R$ 150 mil a R$ 300 mil','R$ 300 mil a R$ 500 mil','Acima de R$ 500 mil'];
const TIPOI=['Quero ser franqueado','Quero ser sócio','Quero investir','Quero comprar o negócio','Só quero mais informações'];
const GARANTIA=/(retorno|lucro|rentabilidade|ganho|rendimento)s?\s+(garantid|certo|assegurad|fixo)|garant(e|imos|ido|ia)\s+(o\s+|de\s+)?(retorno|lucro|ganho|rendimento)|sem\s+risco|risco\s+zero|dinheiro\s+de\s+volta/i;
const K={it:'mh_inv_itens_v1',int:'mh_inv_int_v1',dem:'mh_inv_dem_v1',vt:'mh_inv_voto_v1'};
const LS={get:(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?d:v}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}};
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const uid=()=>'o'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const isAdm=()=>document.body.classList.contains('adm');
const usr=()=>window.MH_API?MH_API.usrTk():'';
const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const digs=v=>String(v||'').replace(/\D/g,'');
const D={mode:'carregando',itens:[],dem:[],precos:{},p:null};
const S={cat:'franquia',cid:'',seg:'',lim:12,box:null,q:''};

/* ---------- dados ---------- */
function carregar(f){if(D.p&&!f)return D.p;
 D.p=(async()=>{
  if(window.MH_API&&MH_API.on()){const r=await MH_API.req('/investir');if(r.ok&&r.j&&r.j.ok){D.mode='servidor';D.itens=r.j.itens||[];D.dem=r.j.demanda||[];D.precos=r.j.precos||{};return}}
  D.mode='local';D.itens=LS.get(K.it,[]);D.dem=LS.get(K.dem,[])})();return D.p}
const srv=()=>D.mode==='servidor';
const pub=()=>D.itens.filter(i=>i.status==='aprovado'&&i.ativo!==false);
const plRank=i=>i.plano==='exclusivo'?0:(i.plano==='destaque'||i.patrocinado)?1:2;
const patroc=i=>!!(i.patrocinado||i.plano==='exclusivo'||i.plano==='destaque');
const okImg=u=>typeof u==='string'&&/^(data:image\/(jpeg|png|webp);base64,|https:\/\/)/.test(u);
const okSite=u=>{try{const x=new URL(u);return x.protocol==='https:'||x.protocol==='http:'}catch(e){return false}};
function demContagem(cid){const m={};
 if(srv()){D.dem.filter(x=>!cid||x.cidade===cid).forEach(x=>{m[x.categoria]=(m[x.categoria]||0)+(+x.n||0)})}
 else D.dem.filter(x=>!cid||x.cidade===cid).forEach(x=>{m[x.categoria]=(m[x.categoria]||0)+1});return m}
async function api(path,body,adm){if(!(window.MH_API&&MH_API.on()))return{ok:false,erro:'Servidor não conectado.'};
 const r=await MH_API.req(path,{token:adm?MH_API.admTk():usr(),body});
 return r.ok&&r.j&&r.j.ok!==false?{ok:true,j:r.j}:{ok:false,erro:(r.j&&r.j.erro)||'Não deu certo. Tente de novo.',status:r.status}}
async function enviarInteresse(op,b){
 if(srv()){const r=await api('/investir/interesse',Object.assign({opId:op.id,consentimento:true},b));return r}
 const l=LS.get(K.int,[]);l.push(Object.assign({id:uid(),opId:op.id,opNome:op.nome,ts:Date.now(),consentimento:true},b));LS.set(K.int,l.slice(-300));return{ok:true,local:true}}
async function enviarSugestao(b){
 if(srv()){const r=await api('/investir/sugestao',b);if(r.ok)await carregar(true);return r}
 D.dem.push(Object.assign({ts:Date.now()},b));LS.set(K.dem,D.dem.slice(-2000));return{ok:true,local:true}}
async function salvarItem(it,adm){
 if(srv()){const r=await api(adm?'/admin/investir/salvar':'/investir/meu',it,adm);if(r.ok)await carregar(true);return r}
 const l=LS.get(K.it,[]),i=l.findIndex(x=>x.id===it.id);if(i>=0)l[i]=Object.assign(l[i],it);else l.push(it);
 if(!LS.set(K.it,l))return{ok:false,erro:'Sem espaço para salvar neste aparelho.'};D.itens=l;return{ok:true,local:true}}
async function apagarItem(id){
 if(srv()){const r=await api('/admin/investir/apagar',{id},true);if(r.ok)await carregar(true);return r}
 D.itens=LS.get(K.it,[]).filter(x=>x.id!==id);LS.set(K.it,D.itens);return{ok:true,local:true}}
async function listarAdm(){
 if(srv()){const r=await api('/admin/investir',undefined,true);if(!r.ok)return r;return{ok:true,itens:r.j.itens||[],ints:r.j.interesses||[],precos:r.j.precos||{}}}
 return{ok:true,itens:LS.get(K.it,[]),ints:LS.get(K.int,[]),local:true}}
function visto(it){if(srv())MH_API.req('/investir/visto',{body:{id:it.id}}).catch(()=>{});else{const l=LS.get(K.it,[]),x=l.find(y=>y.id===it.id);if(x){x.views=(x.views||0)+1;LS.set(K.it,l)}}}

/* ---------- peças de interface ---------- */
function dlg(rot){const d=document.createElement('dialog');d.className='v8dlg inv-dlg';d.setAttribute('aria-label',rot);document.body.append(d);d.addEventListener('click',e=>{if(e.target===d)d.close()});d.addEventListener('close',()=>d.remove());return d}
function btn(t,c,fn){const b=mk('button','inv-b '+(c||''),t);b.type='button';b.onclick=fn;return b}
function avatar(it){const a=mk('div','inv-av');a.setAttribute('aria-hidden','true');
 if(okImg(it.logo)){const im=document.createElement('img');im.src=it.logo;im.alt='';im.loading='lazy';a.append(im)}
 else{let h=0;for(const c of String(it.nome||'?'))h=(h*31+c.charCodeAt(0))%360;a.style.background='hsl('+h+',45%,32%)';a.textContent=(String(it.nome||'?').trim()[0]||'?').toUpperCase()}return a}
function fld(rot,tag,at){const l=mk('label',null,rot),i=document.createElement(tag==='select'||tag==='textarea'?tag:'input');if(!['select','textarea'].includes(tag))i.type=tag||'text';Object.assign(i,at||{});l.append(i);return{l,i}}
function sel(rot,opts,val){const f=fld(rot,'select');opts.forEach(o=>f.i.add(new Option(Array.isArray(o)?o[1]:o,Array.isArray(o)?o[0]:o)));if(val!=null)f.i.value=val;return f}
const local=()=>D.mode==='local';
function avisoLocal(){const p=mk('p','note inv-warn','⚠ Servidor de Investir ainda não conectado (falta a rota /investir). Neste momento o que for cadastrado aqui fica só neste aparelho e não aparece para outras pessoas.');p.setAttribute('role','note');return p}
function redim(f){return new Promise((ok,err)=>{if(!f||!/^image\//.test(f.type))return err(new Error('Escolha uma imagem.'));if(f.size>12*1048576)return err(new Error('Imagem muito grande.'));
 const u=URL.createObjectURL(f),im=new Image();im.onload=()=>{try{const S=160,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,S,S);const k=Math.min(S/im.width,S/im.height),w=im.width*k,h=im.height*k;g.drawImage(im,(S-w)/2,(S-h)/2,w,h);URL.revokeObjectURL(u);
  let q=.8,r=c.toDataURL('image/jpeg',q);while(r.length>24000&&q>.3){q-=.1;r=c.toDataURL('image/jpeg',q)}ok(r)}catch(e){err(e)}};im.onerror=()=>{URL.revokeObjectURL(u);err(new Error('Não consegui abrir a imagem.'))};im.src=u})}
const linhas=(p,rot,v)=>{if(v==null||String(v).trim()==='')return;const s=mk('div','inv-sec');s.append(mk('b',null,rot),document.createTextNode(String(v)));p.append(s)};

/* ---------- vitrine ---------- */
function filtrados(){const q=norm(S.q).trim();
 return pub().filter(i=>i.categoria===S.cat&&(!S.cid||i.cidadeOrigem===S.cid||(i.cidades||[]).includes(S.cid))&&(!S.seg||i.segmento===S.seg)&&(!q||norm(i.nome).includes(q)||norm(i.segmento).includes(q)||norm(i.descricao).includes(q)))
  .sort((a,b)=>plRank(a)-plRank(b)||String(a.nome).localeCompare(String(b.nome),'pt-BR'))}
function localTxt(i){const o=CN[i.cidadeOrigem]||'';const d=(i.cidades||[]).map(c=>CN[c]).filter(Boolean);
 return i.categoria==='franquia'?(d.length?'Quer abrir em: '+d.join(', '):'Cidades de interesse a informar'):(o?o+(d.length?' → '+d.join(', '):''):d.join(', '))}
function card(i){const c=mk('article','inv-card'+(i.plano==='exclusivo'?' ex dest':patroc(i)?' dest':''));
 const t=mk('div','inv-top'),x=mk('div');x.append(mk('b',null,i.nome),mk('small',null,[i.segmento,CATN[i.categoria]].filter(Boolean).join(' · ')));t.append(avatar(i),x);
 const tg=mk('div','inv-tags');if(patroc(i))tg.append(mk('span','inv-tag sp','Patrocinado'));if(i.procura&&PROC[i.procura])tg.append(mk('span','inv-tag',PROC[i.procura]));const lt=localTxt(i);if(lt)tg.append(mk('span','inv-tag',lt));
 c.append(t,tg);
 if(i.invest)c.append(mk('div','inv-inv','Investimento estimado pela empresa: '+i.invest));
 const a=mk('div','inv-acts');a.append(btn('Ver perfil','r',()=>perfil(i)),btn('Tenho interesse','p r',()=>interesse(i)));c.append(a);return c}
function render(box,q){S.box=box;S.q=q||'';box.textContent='';const w=mk('section','inv');box.append(w);
 if(D.mode==='carregando'){w.append(mk('p','note','Carregando oportunidades…'));carregar().then(()=>{if(S.box===box)render(box,S.q)});return}
 const h=mk('div','inv-hero');h.append(mk('h3',null,'Invista no futuro da sua cidade'),mk('p',null,'Descubra franquias, novos negócios e oportunidades de expansão na sua região.'));
 const segs=[...new Set(pub().filter(i=>i.categoria===S.cat).map(i=>i.segmento).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
 const fc=sel('Cidade',[['','Todas as cidades']].concat(CIDS),S.cid),fs=sel('Categoria (segmento)',[['','Todos os segmentos']].concat(segs.map(s=>[s,s])),S.seg);
 fc.i.onchange=()=>{S.cid=fc.i.value;S.lim=12;redraw()};fs.i.onchange=()=>{S.seg=fs.i.value;S.lim=12;redraw()};
 const fl=mk('div','inv-fil');fl.append(fc.l,fs.l);h.append(fl,mk('p','note','O MiHelp apenas divulga e conecta as partes. Não vende franquias, não administra investimentos e não garante retorno financeiro. Valores são estimativas informadas pelas próprias empresas.'));
 if(local())h.append(avisoLocal());w.append(h);
 const ch=mk('div','inv-chips');ch.setAttribute('role','group');ch.setAttribute('aria-label','Categorias');
 CATS.forEach(([k,n])=>{const b=mk('button',null,n);b.type='button';b.setAttribute('aria-pressed',String(S.cat===k));b.append(mk('b',null,String(pub().filter(i=>i.categoria===k).length)));b.onclick=()=>{S.cat=k;S.seg='';S.lim=12;redraw()};ch.append(b)});w.append(ch);
 const lista=filtrados(),g=mk('div','inv-grid');
 if(!lista.length){const e=mk('p','note',(S.cid||S.seg||S.q)?'Nada encontrado com esses filtros.':'Ainda não há '+(S.cat==='franquia'?'franquias cadastradas':S.cat==='regiao'?'negócios da região cadastrados':'oportunidades cadastradas')+'. Quem quiser divulgar a sua pode cadastrar mais abaixo.');w.append(e);
  if(isAdm()&&!(S.cid||S.seg||S.q)){const b=btn('🛠 Cadastrar '+(S.cat==='franquia'?'franquia':'oportunidade'),'p',()=>formItem(null,true));w.append(b)}}
 else{lista.slice(0,S.lim).forEach(i=>g.append(card(i)));w.append(g);if(lista.length>S.lim){const m=btn('Mostrar mais ('+(lista.length-S.lim)+')','',()=>{S.lim+=12;redraw()});m.style.marginTop='10px';w.append(m)}}
 /* oportunidades por cidade (sem mapa externo) */
 const r=mk('div','inv-bloco');r.append(mk('h4',null,'Oportunidades na sua região'));const cg=mk('div','inv-cid');
 CIDS.forEach(([k,n])=>{const c=pub().filter(i=>i.cidadeOrigem===k||(i.cidades||[]).includes(k)).length,b=mk('button',null,n);b.type='button';b.setAttribute('aria-pressed',String(S.cid===k));b.append(mk('small',null,c?c+(c>1?' oportunidades':' oportunidade'):'nenhuma ainda'));b.onclick=()=>{S.cid=S.cid===k?'':k;S.lim=12;redraw();w.scrollIntoView({behavior:'smooth',block:'start'})};cg.append(b)});r.append(cg);w.append(r);
 /* demanda */
 const dm=mk('div','inv-bloco');dm.append(mk('h4',null,'Que negócio você gostaria de ver na sua cidade?'),mk('p','note','Diga o que falta e o MiHelp conta quantas pessoas querem a mesma coisa. Nenhum dado pessoal aparece.'));
 const dc=sel('Cidade',CIDS,S.cid||CIDS[0][0]),dk=sel('Tipo de negócio',DEMC,DEMC[0]),dt=fld('Qual? (se escolheu Outro)','text',{maxLength:60,placeholder:'Ex.: padaria artesanal'});dt.l.hidden=true;dk.i.onchange=()=>{dt.l.hidden=dk.i.value!=='Outro'};
 const st=mk('p','note');st.setAttribute('role','status');const lst=mk('div','inv-dem');
 const lista2=()=>{lst.textContent='';const m=demContagem(dc.i.value),es=Object.entries(m).sort((a,b)=>b[1]-a[1]);if(!es.length)lst.append(mk('p','note','Ninguém pediu nada para '+CN[dc.i.value]+' ainda. Seja o primeiro.'));es.slice(0,8).forEach(([k,n])=>{const r2=mk('div');r2.append(mk('span',null,k),mk('b',null,n+(n>1?' interessados':' interessado')));lst.append(r2)})};
 dc.i.onchange=lista2;
 const vb=btn('Quero isso na minha cidade','p',async()=>{const cat=dk.i.value,tx=dt.i.value.trim(),cid=dc.i.value;if(cat==='Outro'&&tx.length<3){st.textContent='Escreva qual negócio.';return}
  const chv=cid+'|'+(cat==='Outro'?norm(tx):cat),vt=LS.get(K.vt,[]);if(vt.includes(chv)){st.textContent='Você já pediu esse neste aparelho.';return}
  vb.disabled=true;const r2=await enviarSugestao({cidade:cid,categoria:cat==='Outro'?tx:cat,texto:cat==='Outro'?tx:''});vb.disabled=false;
  if(r2.ok){vt.push(chv);LS.set(K.vt,vt.slice(-100));st.textContent=r2.local?'Anotado só neste aparelho (servidor ainda não conectado).':'Obrigado! Seu pedido foi contado.';lista2()}else st.textContent=r2.erro});
 dm.append(dc.l,dk.l,dt.l,vb,st,lst);lista2();w.append(dm);
 /* empresas */
 const em=mk('div','inv-bloco');em.append(mk('h4',null,'Quer divulgar sua franquia ou expansão?'),mk('p','note','Cadastre a oportunidade. O MiHelp analisa e publica; nada vai ao ar sem aprovação.'));
 const ac=mk('div','inv-acts');ac.style.cssText='display:flex;gap:8px;flex-wrap:wrap';ac.append(btn('Cadastrar minha oportunidade','p',()=>formItem(null,false)));if(isAdm())ac.append(btn('🛠 Administrar Investir','',()=>admin()));em.append(ac);
 /* Planos ocultos por enquanto: troque para true para a vitrine mostrar Básico, Destaque e Exclusivo. O admin continua definindo plano e patrocínio de cada anúncio. */
 const MOSTRAR_PLANOS=false;
 if(MOSTRAR_PLANOS){const pl=mk('div','inv-pl');pl.style.marginTop='12px';PLANOS.forEach(([k,n,fs2])=>{const c=mk('div');c.append(mk('b',null,'Plano '+n));const u=mk('ul');fs2.forEach(f=>u.append(mk('li',null,f)));c.append(u,mk('p','note',(D.precos&&D.precos[k])||'Preço a definir.'));pl.append(c)});em.append(pl)}
 em.append(mk('p','note',MOSTRAR_PLANOS?'Planos de divulgação comercial. Pagamento ainda não existe nesta versão: o MiHelp define o plano de cada empresa depois da aprovação. Todo conteúdo patrocinado é identificado.':'Depois que o MiHelp aprovar a publicação, as condições da divulgação são combinadas direto com você. Todo conteúdo patrocinado é identificado.'));w.append(em)}
function redraw(){if(S.box)render(S.box,S.q)}

/* ---------- perfil e interesse ---------- */
function perfil(i){visto(i);const d=dlg('Perfil de '+i.nome);const h=mk('div','inv-top');const x=mk('div');x.append(mk('h3',null,i.nome),mk('small',null,[i.segmento,CATN[i.categoria]].filter(Boolean).join(' · ')));h.append(avatar(i),x);d.append(h);
 const tg=mk('div','inv-tags');tg.style.marginTop='8px';if(patroc(i))tg.append(mk('span','inv-tag sp','Patrocinado'));if(PROC[i.procura])tg.append(mk('span','inv-tag',PROC[i.procura]));d.append(tg);
 linhas(d,'Sobre o negócio',i.descricao);linhas(d,i.categoria==='franquia'?'Modelo de operação':'Modelo de negócio',i.modelo);linhas(d,'Tipo de expansão desejada',i.tipoExpansao);
 linhas(d,'Cidade de origem',CN[i.cidadeOrigem]);linhas(d,'Cidades de interesse',(i.cidades||[]).map(c=>CN[c]).filter(Boolean).join(', '));
 linhas(d,'Investimento inicial estimado (informado pela empresa)',i.invest);linhas(d,'Taxa de franquia (informada pela empresa)',i.taxa);linhas(d,'Área necessária',i.area);linhas(d,'Requisitos para abertura',i.requisitos);linhas(d,'Informações adicionais',i.extra);
 d.append(mk('p','note','Valores são estimativas informadas pela empresa, não garantia de retorno. O MiHelp não vende franquias nem administra investimentos. Peça tudo por escrito e combine direto com a empresa.'));
 const r=mk('div','inv-row');r.append(btn('Tenho interesse','p',()=>{d.close();interesse(i)}));
 const w=digs(i.contato);if(w.length>=10){const a=mk('a','inv-b','Falar com a empresa');a.href='https://wa.me/'+(w.length<12?'55'+w:w)+'?text='+encodeURIComponent('Oi! Vi '+i.nome+' na aba Investir do MiHelp.');a.target='_blank';a.rel='noopener nofollow';a.style.cssText='display:inline-flex;align-items:center;text-decoration:none';r.append(a)}
 if(i.site&&okSite(i.site)){const a=mk('a','inv-b','Site oficial');a.href=i.site;a.target='_blank';a.rel='noopener nofollow'+(patroc(i)?' sponsored':'');a.style.cssText='display:inline-flex;align-items:center;text-decoration:none';r.append(a)}
 r.append(btn('Fechar','',()=>d.close()));d.append(r);d.showModal()}
function interesse(i){const d=dlg('Tenho interesse em '+i.nome);d.append(mk('h3',null,'Tenho interesse'),mk('p','note','Em: '+i.nome+'. Só pedimos o necessário para a empresa falar com você.'));
 const no=fld('Nome','text',{maxLength:60,autocomplete:'name'}),ci=sel('Sua cidade',CIDS.concat([['outra','Outra cidade']]),CIDS[0][0]),te=fld('Telefone ou WhatsApp com DDD','tel',{maxLength:16,autocomplete:'tel'}),ti=sel('Tipo de interesse',TIPOI,TIPOI[4]),fa=sel('Quanto você tem para investir (opcional)',FAIXAS,FAIXAS[0]),ms=fld('Mensagem (opcional)','textarea',{maxLength:300});
 const ck=mk('label','ck'),cb=document.createElement('input');cb.type='checkbox';ck.append(cb,mk('span',null,'Autorizo o MiHelp a compartilhar estes dados (nome, cidade, telefone e o que escrevi acima) com '+i.nome+' para que entrem em contato comigo. Meus dados não aparecem publicamente.'));
 const er=mk('p','inv-er');er.setAttribute('role','alert');
 const env=btn('Enviar meu interesse','p',async()=>{const n=no.i.value.trim(),t=digs(te.i.value);er.textContent='';
  if(n.length<2){er.textContent='Escreva seu nome.';return}if(t.length<10){er.textContent='Informe o telefone com DDD.';return}if(!cb.checked){er.textContent='Marque a autorização para enviar.';return}
  env.disabled=true;const r=await enviarInteresse(i,{nome:n,cidade:ci.i.value,tel:te.i.value.trim(),tipo:ti.i.value,faixa:fa.i.value===FAIXAS[0]?'':fa.i.value,msg:ms.i.value.trim()});env.disabled=!cb.checked;
  if(r.ok){d.textContent='';d.append(mk('h3',null,r.local?'Guardado neste aparelho':'Interesse enviado'),mk('p',null,r.local?'O servidor de Investir ainda não está conectado, então seu interesse NÃO foi enviado à empresa. Ele ficou salvo só aqui.':'A empresa recebeu seus dados porque você autorizou. Eles não aparecem para outras pessoas.'),btn('Fechar','p',()=>d.close()))}else er.textContent=r.erro});
 env.disabled=true;cb.onchange=()=>{env.disabled=!cb.checked};
 const row=mk('div','inv-row');row.append(env,btn('Cancelar','',()=>d.close()));d.append(no.l,ci.l,te.l,ti.l,fa.l,ms.l,ck,er,row);if(local())d.append(avisoLocal());d.showModal();no.i.focus()}

/* ---------- cadastro (dono do negócio ou administrador) ---------- */
function formItem(it,adm,pre){const e=!!it,d=dlg(e?'Editar oportunidade':'Cadastrar oportunidade');const o=it||pre||{};let logo=o.logo||'';
 d.append(mk('h3',null,e?'Editar oportunidade':adm?'Nova oportunidade':'Cadastrar minha oportunidade'),mk('p','note','Informe só o que for verdadeiro. Não pode prometer retorno garantido. Campos em branco não aparecem no perfil.'));
 const ca=sel('Onde aparece',CATS,o.categoria||'franquia'),no=fld('Nome do negócio ou marca *','text',{maxLength:60,value:o.nome||''});
 if(adm){const dl=document.createElement('datalist');dl.id='invEx';EXEMPLOS.forEach(x=>dl.append(new Option(x)));no.i.setAttribute('list','invEx');d.append(dl)}
 const lg=fld('Logo ou foto (opcional)','file',{accept:'image/*'}),lgs=mk('p','note',logo?'Logo atual mantida.':'');lg.i.onchange=async()=>{try{logo=await redim(lg.i.files[0]);lgs.textContent='Logo pronta.'}catch(x){lgs.textContent=x.message}};
 const sg=fld('Segmento de atuação *','text',{maxLength:50,value:o.segmento||'',placeholder:'Ex.: Alimentação, Serviços'}),co=sel('Cidade de origem',[['','Não se aplica']].concat(CIDS),o.cidadeOrigem||''),
  ds=fld('Descrição do negócio *','textarea',{maxLength:600,value:o.descricao||''}),mo=fld('Modelo de operação / de negócio','textarea',{maxLength:400,value:o.modelo||''}),
  pr=sel('Quem você procura',Object.entries(PROC),o.procura||'franqueado'),te=fld('Tipo de expansão desejada','text',{maxLength:80,value:o.tipoExpansao||'',placeholder:'Ex.: segunda unidade'}),
  iv=fld('Investimento inicial estimado (como a empresa informa)','text',{maxLength:80,value:o.invest||'',placeholder:'Ex.: a partir de R$ 80 mil (estimativa)'}),tx=fld('Taxa de franquia (se houver)','text',{maxLength:60,value:o.taxa||''}),
  ar=fld('Área necessária (se houver)','text',{maxLength:60,value:o.area||''}),rq=fld('Requisitos para abertura','textarea',{maxLength:400,value:o.requisitos||''}),ex=fld('Informações adicionais','textarea',{maxLength:400,value:o.extra||''}),
  si=fld('Site oficial (https://…)','url',{maxLength:200,value:o.site||'',placeholder:'https://'}),wa=fld('WhatsApp da empresa (opcional, aparece no perfil)','tel',{maxLength:16,value:o.contato||''});
 const cks=mk('div','inv-cks'),cbs=CIDS.map(([k,n])=>{const l=mk('label','ck'),c=document.createElement('input');c.type='checkbox';c.value=k;c.checked=(o.cidades||[]).includes(k);l.append(c,mk('span',null,n));cks.append(l);return c});
 const adx=mk('div','inv-adm');let pl,pat,at,stt;
 if(adm){adx.append(mk('b',null,'🛠 Controle do administrador'));pl=sel('Plano',PLANOS.map(p=>[p[0],p[1]]),o.plano||'basico');pat=fld('','checkbox');pat.i.checked=!!o.patrocinado;pat.l.className='ck';pat.l.append(mk('span',null,'Marcar como patrocinada'));at=fld('','checkbox');at.i.checked=o.ativo!==false;at.l.className='ck';at.l.append(mk('span',null,'Ativa (aparece na vitrine)'));stt=sel('Situação do cadastro',[['pendente','Pendente'],['aprovado','Aprovado'],['rejeitado','Rejeitado']],o.status||'aprovado');adx.append(pl.l,pat.l,at.l,stt.l)}
 const er=mk('p','inv-er');er.setAttribute('role','alert');
 const sv=btn('Salvar','p',async()=>{er.textContent='';const n=no.i.value.trim(),s=sg.i.value.trim(),ds2=ds.i.value.trim();
  if(n.length<2)return er.textContent='Escreva o nome.';if(s.length<2)return er.textContent='Informe o segmento.';if(ds2.length<10)return er.textContent='Descreva o negócio (mínimo 10 letras).';
  if(si.i.value.trim()&&!okSite(si.i.value.trim()))return er.textContent='Site inválido. Use https://…';
  const todos=[n,s,ds2,mo.i.value,te.i.value,iv.i.value,tx.i.value,rq.i.value,ex.i.value].join(' ');if(GARANTIA.test(todos))return er.textContent='Anúncios não podem prometer retorno, lucro ou ganho garantido. Tire essa frase.';
  const cat=ca.i.value,item=Object.assign({},o,{id:o.id||uid(),categoria:cat,nome:n,logo:logo||'',segmento:s,cidadeOrigem:co.i.value,descricao:ds2,modelo:mo.i.value.trim(),procura:cat==='franquia'?'franqueado':pr.i.value,tipoExpansao:te.i.value.trim(),cidades:cbs.filter(c=>c.checked).map(c=>c.value),invest:iv.i.value.trim(),taxa:tx.i.value.trim(),area:ar.i.value.trim(),requisitos:rq.i.value.trim(),extra:ex.i.value.trim(),site:si.i.value.trim(),contato:wa.i.value.trim(),ts:o.ts||Date.now()});
  if(adm){item.plano=pl.i.value;item.patrocinado=pat.i.checked;item.ativo=at.i.checked;item.status=stt.i.value;item.origem=o.origem||'admin'}else{item.plano='basico';item.patrocinado=false;item.ativo=true;item.status='pendente';item.origem='dono';if(o.chave)item.lojaChave=o.chave}
  sv.disabled=true;const r=await salvarItem(item,adm);sv.disabled=false;
  if(!r.ok)return er.textContent=r.erro||'Não consegui salvar.';
  if(adm){d.close();redraw();admin()}else{d.textContent='';d.append(mk('h3',null,'Cadastro recebido'),mk('p',null,r.local?'Servidor de Investir ainda não conectado: o cadastro ficou salvo só neste aparelho e NÃO foi enviado ao MiHelp para aprovação.':'Seu cadastro foi enviado e aguarda aprovação do MiHelp. Depois de aprovado, aparece na aba Investir.'),btn('Fechar','p',()=>d.close()))}});
 const row=mk('div','inv-row');row.append(sv,btn('Cancelar','',()=>d.close()));
 d.append(ca.l,no.l,lg.l,lgs,sg.l,co.l,ds.l,mo.l,pr.l,te.l,mk('label',null,'Cidades onde pretende expandir'),cks,iv.l,tx.l,ar.l,rq.l,ex.l,si.l,wa.l);if(adm)d.append(adx);d.append(er,row);if(!adm&&local())d.append(avisoLocal());
 const sync=()=>{const f=ca.i.value==='franquia';pr.l.hidden=f;te.l.hidden=f;tx.l.hidden=!f;ar.l.hidden=!f};ca.i.onchange=sync;sync();d.showModal();no.i.focus()}

/* ---------- administração (dentro da lista de Profissionais, ao lado dos outros botões Adm) ---------- */
async function admin(){const d=document.querySelector('dialog.inv-adm-dlg')||dlg('Administração de Investir');d.classList.add('inv-adm-dlg');d.textContent='';d.append(mk('p','note','Carregando…'));if(!d.open)d.showModal();
 await carregar(true);const r=await listarAdm();d.textContent='';d.append(mk('h3',null,'Administração de Investir'));
 if(!r.ok){d.append(mk('p','inv-er',r.erro),btn('Fechar','',()=>d.close()));return}
 if(r.local)d.append(avisoLocal());
 const top=mk('div','inv-row');top.append(btn('＋ Nova oportunidade','p',()=>{d.close();formItem(null,true)}),btn('Fechar','',()=>d.close()));d.append(top);
 if(!r.local){const pb=mk('div','inv-adm');pb.append(mk('b',null,'💰 Preço dos planos (aparece na vitrine)'));const pin=PLANOS.map(([k,n])=>{const f=fld('Plano '+n,'text',{maxLength:40,value:(r.precos&&r.precos[k])||'',placeholder:'Ex.: R$ 99 por mês'});pb.append(f.l);return[k,f.i]});
  const ps=mk('p','note');ps.setAttribute('role','status');pb.append(btn('Salvar preços','r',async()=>{const o={};pin.forEach(([k,i])=>{o[k]=i.value.trim()});const x=await api('/admin/investir/precos',{precos:o},true);ps.textContent=x.ok?'Preços salvos.':x.erro;if(x.ok)await carregar(true)}),ps);d.append(pb)}
 const cnt={};(r.ints||[]).forEach(x=>{cnt[x.opId]=(cnt[x.opId]||0)+1});
 d.append(mk('h4',null,'Oportunidades ('+r.itens.length+')'));if(!r.itens.length)d.append(mk('p','note','Nenhuma cadastrada.'));
 const seq=async(f)=>{const x=await f;if(!x.ok)alert(x.erro);await carregar(true);redraw();admin()};
 r.itens.slice().sort((a,b)=>(a.status==='pendente'?0:1)-(b.status==='pendente'?0:1)||String(a.nome).localeCompare(String(b.nome),'pt-BR')).forEach(i=>{
  const c=mk('div','inv-adm');c.append(mk('b',null,i.nome+' · '+(CATN[i.categoria]||'')),mk('div','note',['Situação: '+i.status,'Plano: '+(i.plano||'basico'),i.patrocinado?'Patrocinada':'',i.ativo===false?'Desativada':'Ativa',(i.views?'👁 '+i.views:''),(cnt[i.id]?'✉ '+cnt[i.id]+' interessados':'')].filter(Boolean).join(' · ')));
  const ac=mk('div','inv-row');const up=(ch)=>seq(salvarItemAdm(Object.assign({},i,ch)));
  if(i.status!=='aprovado')ac.append(btn('Aprovar','r',()=>up({status:'aprovado'})));if(i.status!=='rejeitado')ac.append(btn('Rejeitar','r',()=>up({status:'rejeitado'})));
  ac.append(btn(i.ativo===false?'Ativar':'Desativar','r',()=>up({ativo:i.ativo===false})),btn(i.patrocinado?'Tirar patrocínio':'Patrocinar','r',()=>up({patrocinado:!i.patrocinado})),btn('Editar','r',()=>{d.close();formItem(i,true)}),btn('Excluir','r',()=>{if(confirm('Excluir "'+i.nome+'"?'))seq(apagarItem(i.id))}));
  c.append(ac);d.append(c)});
 d.append(mk('h4',null,'Manifestações de interesse ('+(r.ints||[]).length+')'),mk('p','note','Dados pessoais: só o administrador vê. Cada pessoa autorizou o compartilhamento com a empresa.'));
 (r.ints||[]).slice().reverse().slice(0,60).forEach(x=>{const c=mk('div','inv-adm');const op=r.itens.find(i=>i.id===x.opId);c.append(mk('b',null,(x.nome||'?')+' → '+(op?op.nome:x.opNome||x.opId)),mk('div','note',[CN[x.cidade]||x.cidade,x.tel,x.tipo,x.faixa,x.msg].filter(Boolean).join(' · ')));d.append(c)});
 const dm=demContagem('');d.append(mk('h4',null,'Demanda por tipo de negócio'));const es=Object.entries(dm).sort((a,b)=>b[1]-a[1]);if(!es.length)d.append(mk('p','note','Sem pedidos ainda.'));es.forEach(([k,n])=>d.append(mk('div','note',k+': '+n)))}
const salvarItemAdm=it=>salvarItem(it,true);

window.MH_INVESTIR8={render,admin,carregar,expandir:L=>{carregar().then(()=>formItem(null,false,{categoria:'regiao',nome:L&&L.nome||'',segmento:L&&L.tipo||'',cidadeOrigem:L&&L.cidade||'',chave:L&&L.chave||'',procura:'investidor'}))}};
}catch(e){console.error('MiHelp (investir):',e)}})();

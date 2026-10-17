
try{(function(){
const A=window.MH_API,sec=document.getElementById('gastos');
if(!sec)return;
if(!A||!A.on()){sec.hidden=true;return}
sec.hidden=false;
const $=id=>document.getElementById(id),mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const CID=[['barra-do-garcas','Barra do Garças'],['pontal-do-araguaia','Pontal do Araguaia'],['aragarcas','Aragarças']];
const SIT={andamento:'🟡 Em andamento',concluida:'🟢 Concluída',planejada:'🔵 Planejada',paralisada:'🔴 Paralisada'};
const OF={
 'barra-do-garcas':[['Prefeitura de Barra do Garças','https://www.barradogarcas.mt.gov.br'],['TCE-MT (Tribunal de Contas de MT)','https://www.tce.mt.gov.br'],['IBGE Cidades','https://www.ibge.gov.br/cidades-e-estados/mt/barra-do-garcas.html']],
 'pontal-do-araguaia':[['TCE-MT (Tribunal de Contas de MT)','https://www.tce.mt.gov.br'],['IBGE Cidades','https://www.ibge.gov.br/cidades-e-estados/mt/pontal-do-araguaia.html']],
 'aragarcas':[['TCM-GO (Tribunal de Contas dos Municípios de GO)','https://www.tcm.go.gov.br'],['IBGE Cidades','https://www.ibge.gov.br/cidades-e-estados/go/aragarcas.html']]};
let cid='barra-do-garcas',fil='todos',L=[];
try{const s=localStorage.getItem('mh_gcid');if(CID.some(x=>x[0]===s))cid=s}catch(e){}
const ok=r=>!!(r&&r.ok&&r.j&&r.j.ok),brl=n=>'R$ '+Number(n||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const seguro=u=>/^https:\/\/[^\s]+$/i.test(String(u||''))?u:'';
const dataBR=d=>/^\d{4}-\d{2}-\d{2}$/.test(d)?d.split('-').reverse().join('/'):'';
const adm=()=>{try{return !!A.admTk()}catch(e){return false}};
const msg=t=>{$('gaMsg').textContent=t||''};
/* abas de cidade */
CID.forEach(([k,n])=>{const b=mk('button',0,n);b.type='button';b.setAttribute('role','tab');b.dataset.k=k;b.setAttribute('aria-selected',String(k===cid));
 b.onclick=()=>{cid=k;try{localStorage.setItem('mh_gcid',k)}catch(e){}$('gaTabs').querySelectorAll('button').forEach(x=>x.setAttribute('aria-selected',String(x===b)));carregar()};$('gaTabs').append(b)});
/* filtros */
[['todos','Todos'],['andamento','🟡 Em andamento'],['concluida','🟢 Concluídas'],['planejada','🔵 Planejadas'],['paralisada','🔴 Paralisadas']].forEach(([k,t])=>{
 const b=mk('button',0,t);b.type='button';b.setAttribute('aria-pressed',String(k===fil));
 b.onclick=()=>{fil=k;$('gaFil').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));pinta()};$('gaFil').append(b)});
async function carregar(){
 $('gaLista').textContent='Carregando…';msg('');
 const r=await A.req('/gastos?cidade='+cid);
 if(!ok(r)){$('gaLista').textContent='';msg((r&&r.j&&r.j.erro)||'Não consegui carregar agora. Tente de novo em instantes.');return}
 L=r.j.itens||[];pinta()}
function pinta(){
 const box=$('gaLista');box.textContent='';
 const l=L.filter(x=>fil==='todos'||x.s===fil);
 const tot=l.reduce((a,x)=>a+(x.v||0),0);
 $('gaTot').textContent=l.length?(l.length+(l.length===1?' projeto':' projetos')+' · soma dos valores informados: '+brl(tot)):'';
 if(!l.length)box.append(mk('p','note',L.length?'Nenhum projeto nessa situação.':'Ainda não temos projetos cadastrados para essa cidade. Estamos conferindo as fontes oficiais e organizando aos poucos.'));
 l.forEach(x=>{const d=mk('article','gp'),m=mk('div','gm');
  m.append(mk('span','gs g-'+x.s,SIT[x.s]||x.s));if(x.c)m.append(mk('span',0,'· '+x.c));if(x.d)m.append(mk('span',0,'· dado de '+dataBR(x.d)));
  d.append(m,mk('h3',0,x.t));
  if(x.v)d.append(mk('div','gv',brl(x.v)));
  const lk=mk('div','gl');lk.append(document.createTextNode('Fonte: '+(x.f||'oficial')+' '));
  if(seguro(x.l)){const a=mk('a',0,'ver na fonte ↗');a.href=x.l;a.target='_blank';a.rel='noopener noreferrer';lk.append(a)}
  d.append(lk);
  if(adm()){const ac=mk('div','vzrow');
   const ed=mk('button','vzb','✏️ Editar');ed.type='button';ed.onclick=()=>form(x);
   const ap=mk('button','vzb','🗑 Apagar');ap.type='button';ap.onclick=async()=>{if(!confirm('Apagar "'+x.t+'"?'))return;const r=await A.req('/admin/gastos',{token:A.admTk(),body:{acao:'apagar',id:x.id}});if(ok(r))carregar();else msg((r&&r.j&&r.j.erro)||'Não consegui apagar.')};
   ac.append(ed,ap);d.append(ac)}
  box.append(d)});
 const of=$('gaOf');of.textContent='';of.append(document.createTextNode('Fontes oficiais para consultar por conta própria: '));
 (OF[cid]||[]).forEach(([n,u],i)=>{if(i)of.append(' · ');const a=mk('a',0,n);a.href=u;a.target='_blank';a.rel='noopener noreferrer';of.append(a)});
 painelAdm()}
function painelAdm(){
 const box=$('gaAdm');box.textContent='';
 if(!adm())return;
 const b=mk('button','cta2','+ Cadastrar projeto (adm)');b.type='button';b.onclick=()=>form(null);box.append(b)}
function form(x){
 const box=$('gaAdm');box.textContent='';
 const w=mk('form','gadm');w.append(mk('h4',0,x?'Editar projeto':'Novo projeto em '+CID.find(c=>c[0]===cid)[1]));
 const f=(rot,el)=>{const l=mk('label',0,rot);l.append(el);w.append(l);return el};
 const inp=(max,v,ph)=>{const i=document.createElement('input');i.type='text';i.maxLength=max;i.value=v||'';if(ph)i.placeholder=ph;return i};
 const t=f('Nome do projeto',inp(120,x&&x.t,'Ex.: Pavimentação do bairro X'));
 const s=document.createElement('select');Object.keys(SIT).forEach(k=>s.add(new Option(SIT[k],k)));s.value=(x&&x.s)||'andamento';f('Situação',s);
 const v=f('Valor em R$ (só números, ex.: 1500000.50)',inp(15,x&&x.v?String(x.v):'','0 se não informado'));
 const c=f('Categoria (opcional)',inp(30,x&&x.c,'Ex.: Saúde, Educação, Obra viária'));
 const fo=f('Nome da fonte',inp(60,x&&x.f,'Ex.: Portal da Transparência da Prefeitura'));
 const li=f('Link da fonte oficial (obrigatório, https://)',inp(300,x&&x.l,'https://...'));
 const da=document.createElement('input');da.type='date';da.value=(x&&x.d)||'';f('Data do dado na fonte (opcional)',da);
 const er=mk('p','note');er.setAttribute('role','alert');
 const go=mk('button','cta2','Salvar');go.type='submit';const cn=mk('button','vzghost','Cancelar');cn.type='button';cn.onclick=painelAdm;
 w.append(er,go,cn);
 w.onsubmit=async e=>{e.preventDefault();go.disabled=true;
  const r=await A.req('/admin/gastos',{token:A.admTk(),body:{acao:'salvar',id:x&&x.id,cidade:cid,titulo:t.value,situacao:s.value,valor:Number(String(v.value).replace(',','.'))||0,categoria:c.value,fonte:fo.value,link:li.value,data:da.value}});
  go.disabled=false;if(ok(r)){carregar()}else er.textContent=(r&&r.j&&r.j.erro)||'Não consegui salvar.'};
 box.append(w);w.scrollIntoView({behavior:'smooth',block:'nearest'})}
carregar();setInterval(()=>{if(!document.hidden&&!document.querySelector('#gaAdm form'))painelAdm()},4000);
})()}catch(e){console.error('MiHelp (gastos):',e)}

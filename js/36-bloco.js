
/* Selos MiHelp: o adm dá e tira selos de lojas e de pessoas. Ficam no servidor (chave "selos" da config) e valem para todo mundo. */
try{(function(){
const CAT=[
 {id:'verificado',ic:'✔',nome:'Verificado MiHelp',cor:'#22a55a',txt:'A equipe do MiHelp confirmou que este negócio ou profissional existe e é quem diz ser.'},
 {id:'estrela',ic:'⭐',nome:'Estrela MiHelp',cor:'#e0a100',txt:'Visitado pela equipe do MiHelp e aprovado.'},
 {id:'obra',ic:'🏗️',nome:'Obra aprovada',cor:'#b4690e',txt:'Obras e reformas conferidas e aprovadas pela equipe (construtoras, empreiteiras, reformas).'},
 {id:'sabor',ic:'🍽️',nome:'Sabor aprovado',cor:'#d94141',txt:'Provado e aprovado pela equipe (restaurantes, lanchonetes, padarias).'},
 {id:'qualidade',ic:'💎',nome:'Qualidade aprovada',cor:'#0891b2',txt:'Serviço ou produto de qualidade, conferido pela equipe.'},
 {id:'confianca',ic:'🤝',nome:'Confiança comprovada',cor:'#2f6fe4',txt:'Cumpre o que combina. A equipe conferiu o trabalho.'},
 {id:'destaque',ic:'🏆',nome:'Destaque do mês',cor:'#ea6a0a',txt:'Escolhido como destaque do mês na região.'},
 {id:'parceiro',ic:'🤲',nome:'Parceiro do MiHelp',cor:'#9b51e0',txt:'Apoia o MiHelp e ajuda o projeto a crescer.'},
 {id:'pioneiro',ic:'🌱',nome:'Pioneiro',cor:'#6aa80f',txt:'Entrou no começo do MiHelp.'}];
const POR={};CAT.forEach(c=>POR[c.id]=c);
const KL='mihelp_selos_v1';
let D={};try{D=JSON.parse(localStorage.getItem(KL)||'{}')||{}}catch(e){D={}}
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const api=()=>!!(window.MH_API&&MH_API.on());
const adm=()=>!!(document.body&&document.body.classList.contains('adm')&&(!api()||MH_API.admTk()));
const get=k=>{const l=Array.isArray(D[k])?D[k]:[];return CAT.filter(c=>l.includes(c.id))};
const avisa=()=>{try{document.dispatchEvent(new Event('mh-selos'))}catch(e){}};
function tile(c){const i=el('i','mhs-i',c.ic);i.style.setProperty('--c',c.cor);i.setAttribute('aria-hidden','true');return i}
function mini(k,max){const l=get(k);if(!l.length)return null;max=max||4;const w=el('span','mhs-m');w.setAttribute('aria-label','Selos MiHelp: '+l.map(c=>c.nome).join(', '));
 l.slice(0,max).forEach(c=>{const t=tile(c);t.title=c.nome;w.append(t)});if(l.length>max)w.append(el('small',null,'+'+(l.length-max)));return w}
async function salva(){let ok=false;try{localStorage.setItem(KL,JSON.stringify(D))}catch(e){}
 if(api()&&MH_API.admTk()){const r=await MH_API.req('/admin/config',{token:MH_API.admTk(),body:{itens:{selos:JSON.stringify(D)}}});ok=!!(r.ok&&r.j&&r.j.ok);if(r.status===401)MH_API.setAdmTk('')}
 return ok}
function editar(k,rot,pronto){
 const d=document.createElement('dialog');d.className='v8dlg';d.setAttribute('aria-label','Selos');document.body.append(d);
 const fecha=()=>{try{d.close()}catch(e){}d.remove()};d.addEventListener('click',e=>{if(e.target===d)fecha()});d.addEventListener('cancel',()=>setTimeout(()=>d.remove(),0));
 const cur=get(k).map(c=>c.id),box=[];
 d.append(el('h3',null,'🏅 Selos de '+rot),el('p','note','Marque os selos que essa página merece e toque em Salvar. Quem abrir a página vê os selos marcados.'));
 CAT.forEach(c=>{const l=el('label','mhs-lin');const ck=document.createElement('input');ck.type='checkbox';ck.checked=cur.includes(c.id);box.push([c.id,ck]);
  const tx=el('div');tx.append(el('b',null,c.nome),el('small',null,c.txt));l.append(ck,tile(c),tx);d.append(l)});
 const st=el('p','note');st.setAttribute('role','status');d.append(st);
 const ac=el('div','perfil-acoes');
 const sv=el('button','cta2 pa-main','💾 Salvar selos');sv.type='button';
 sv.onclick=async()=>{sv.disabled=true;st.style.color='';st.textContent='⏳ Salvando…';
  const ids=box.filter(x=>x[1].checked).map(x=>x[0]);if(ids.length)D[k]=ids;else delete D[k];
  const ok=await salva();avisa();if(pronto)pronto();
  if(ok){st.textContent='✅ Selos salvos para todo mundo.';setTimeout(fecha,900)}
  else{sv.disabled=false;st.style.color='var(--red)';st.textContent=api()?'⚠ Salvei só neste navegador: o servidor não aceitou. Confira se o Worker está com a atualização dos selos.':'⚠ Salvei só neste navegador (o site está sem servidor).'}};
 const cn=el('button','more','Cancelar');cn.type='button';cn.onclick=fecha;ac.append(sv,cn);d.append(ac);d.showModal()}
function bloco(k,rot){const l=get(k),a=adm();if(!l.length&&!a)return null;
 const w=el('div','mhs-bloco');
 const pinta=()=>{w.textContent='';const ls=get(k);
  if(ls.length){w.append(el('h4',null,'Selos MiHelp'));const g=el('div','mhs-g'),dd=el('p','mhs-d');dd.hidden=true;dd.setAttribute('role','status');
   ls.forEach(c=>{const b=el('button','mhs-b');b.style.setProperty('--c',c.cor);b.type='button';b.append(tile(c),document.createTextNode(c.nome));b.setAttribute('aria-pressed','false');
    b.onclick=()=>{const on=b.getAttribute('aria-pressed')==='true';g.querySelectorAll('.mhs-b').forEach(x=>x.setAttribute('aria-pressed','false'));if(on){dd.hidden=true}else{b.setAttribute('aria-pressed','true');dd.hidden=false;dd.textContent=c.nome+': '+c.txt}};g.append(b)});
   w.append(g,dd)}
  if(adm()){const b=el('button','more','🏅 '+(ls.length?'Editar selos':'Dar selos')+' (adm)');b.type='button';b.onclick=()=>editar(k,rot||'esta página',pinta);w.append(b)}};
 pinta();return w}
window.MH_SELOS={cat:CAT,get,mini,bloco,editar};
/* lê os selos do servidor (todo mundo vê) */
if(api())MH_API.req('/config').then(r=>{try{if(r.ok&&r.j&&typeof r.j.selos==='string'){const o=JSON.parse(r.j.selos);if(o&&typeof o==='object'){D=o;try{localStorage.setItem(KL,JSON.stringify(D))}catch(e){}avisa()}}}catch(e){}}).catch(()=>{});
})()}catch(e){console.error('MiHelp (selos):',e)}

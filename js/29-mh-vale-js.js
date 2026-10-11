
try{(function(){
const A=window.MH_API,$=id=>document.getElementById(id);
if(!$('vale'))return;
if(!A||!A.on()){$('vale').hidden=true;if($('carona'))$('carona').hidden=true;document.querySelectorAll('a[href="#vale"],a[href="#carona"]').forEach(n=>{n.style.display='none'});document.querySelectorAll('#dock [data-dock=guia],#dock [data-dock=carona]').forEach(b=>{b.style.display='none'});return}
const CID=[['barra-do-garcas','Barra do Garças'],['aragarcas','Aragarças'],['pontal-do-araguaia','Pontal do Araguaia']];
const CATS=['Restaurante','Lanchonete','Bar','Loja','Serviço','Turismo','Hotel/Pousada','Saúde','Outro'];
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const seguro=u=>/^https?:\/\/[^\s]+$/i.test(String(u||''))?u:'';
const logado=()=>!!A.usrTk();
const msg=t=>{$('vMsg').textContent=t||''};const msgC=t=>{$('cMsg').textContent=t||''};
const dica=r=>{try{return A.admTk()&&r&&r.j&&r.j.detalhe?' ('+r.j.detalhe+')':''}catch(e){return ''}};
let cid='barra-do-garcas',cat='';
try{const s=localStorage.getItem('mh_cidade');if(CID.some(x=>x[0]===s))cid=s}catch(e){}
const opt=(sel,arr)=>arr.forEach(v=>{const o=document.createElement('option');o.value=Array.isArray(v)?v[0]:v;o.textContent=Array.isArray(v)?v[1]:v;sel.append(o)});
opt($('vCid'),CID);$('vCid').value=cid;opt($('vCat'),[['','Todas as categorias']].concat(CATS));
let fil='todos';
{const fb=mk('div','vfil');fb.id='vFil';fb.setAttribute('role','group');fb.setAttribute('aria-label','Filtrar lugares');
 [['todos','Todos'],['selo','⭐ Visitados'],['top','👍 Mais recomendados']].forEach(([k,t])=>{const b=mk('button',0,t);b.type='button';b.setAttribute('aria-pressed',String(k===fil));
  b.onclick=()=>{fil=k;fb.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));guia()};fb.append(b)});
 const vb=$('vCid').closest('.vbar');if(vb)vb.after(fb)}
function link(txt,href){const a=mk('a',0,txt);a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a}
function form(titulo,nota,campos,botao,envia){
 let d=$('valeDlg');if(!d){d=document.createElement('dialog');d.id='valeDlg';document.body.append(d);d.addEventListener('click',e=>{if(e.target===d)d.close()})}
 d.textContent='';d.append(mk('h3',0,titulo));if(nota)d.append(mk('p','note',nota));
 const ins={};
 campos.forEach(c=>{const l=mk('label',0,c.l);let i;
  if(c.t==='select'){i=document.createElement('select');opt(i,c.o||[])}
  else if(c.t==='area'){i=document.createElement('textarea');i.rows=3}
  else{i=document.createElement('input');i.type=c.t||'text'}
  if(c.max&&c.t!=='number')i.maxLength=c.max;if(c.ph)i.placeholder=c.ph;if(c.v!=null)i.value=c.v;if(c.min!=null)i.min=c.min;if(c.mx!=null)i.max=c.mx;
  l.htmlFor=i.id='vf_'+c.k;ins[c.k]=i;d.append(l,i)});
 const er=mk('p','note','');er.setAttribute('role','alert');
 const go=mk('button','go',botao);go.type='button';const cx=mk('button','cx','Cancelar');cx.type='button';cx.onclick=()=>d.close();
 go.onclick=async()=>{const o={};for(const k in ins)o[k]=ins[k].value;go.disabled=true;const e=await envia(o);go.disabled=false;if(e)er.textContent=e;else d.close()};
 const bt=mk('div','dbt');bt.append(go,cx);d.append(er,bt);d.showModal()}
async function guia(){
 const box=$('vLista');box.textContent='Carregando…';
 const r=await A.req('/lugares?cidade='+cid);box.textContent='';
 if(!r.ok){box.append(mk('p','note','Não consegui carregar agora. Tente de novo em instantes.'+dica(r)));return}
 let l=(r.j.itens||[]).filter(x=>!cat||x.categoria===cat);
 if(!l.length){box.append(mk('p','note','Ainda não tem indicação por aqui. Seja o primeiro: toque em "Indicar um lugar".'));return}
 const rec=x=>x.recs||0,sl=x=>x.selo?1:0;
 const melhor=l.slice().sort((a,b)=>(sl(b)-sl(a))||(rec(b)-rec(a)))[0];
 if(fil==='selo'){l=l.filter(x=>x.selo);if(!l.length){box.append(mk('p','note','Ainda não tem lugar visitado pela MiHelp por aqui.'));return}}
 if(fil==='top')l.sort((a,b)=>rec(b)-rec(a));else l.sort((a,b)=>(sl(b)-sl(a))||(rec(b)-rec(a)));
 const dest=(fil==='todos'&&l.length>=3&&(melhor.selo||rec(melhor)>0))?melhor:null;
 if(dest)l=l.filter(x=>x!==dest);
 const pinta=(x,ehDest)=>{const c=mk('div','vcard'+(ehDest?' vdest':''));if(ehDest)c.append(mk('span','vtag','🏆 DESTAQUE DO VALE'));c.append(mk('b',0,x.nome));
  if(x.selo){const s=mk('span','vselo','⭐ Visitado pela MiHelp');if(seguro(x.postIg)){s.append(' · ',link('ver no Instagram',x.postIg))}c.append(s)}
  c.append(mk('span','vsub',x.categoria+(x.bairro?' · '+x.bairro:'')));
  if(x.descricao)c.append(mk('p','vdesc',x.descricao));
  const ac=mk('div','vac');const rb=mk('button',0,'👍 Recomendo · '+(x.recs||0));rb.type='button';
  rb.onclick=async()=>{if(!logado()){msg('Entre na sua conta para recomendar.');return}
   const q=await A.req('/lugares/recomendar',{token:A.usrTk(),body:{id:x.id}});
   if(q.ok&&q.j.ok){rb.textContent='👍 Recomendo · '+q.j.recs;rb.disabled=true;msg('')}
   else msg(q.status===409?'Você já recomendou esse lugar.':q.status===401?'Entre na sua conta para recomendar.':'Não consegui registrar agora.')};
  ac.append(rb);if(seguro(x.mapa))ac.append(link('📍 Mapa',x.mapa));if(x.contato)ac.append(link('💬 WhatsApp','https://wa.me/'+x.contato));
  c.append(ac);box.append(c)};
 if(dest)pinta(dest,true);l.forEach(x=>pinta(x,false))}
const fmt=x=>{const p=String(x.data).split('-'),dt=new Date(x.data+'T12:00:00');return ['dom','seg','ter','qua','qui','sex','sáb'][dt.getDay()]+' '+p[2]+'/'+p[1]+' às '+x.hora};
async function caronas(){
 const box=$('cLista');box.textContent='Carregando…';
 const r=await A.req('/caronas',{token:A.usrTk()});box.textContent='';
 if(!r.ok){box.append(mk('p','note','Não consegui carregar agora. Tente de novo em instantes.'+dica(r)));return}
 const l=r.j.itens||[];
 if(!l.length){box.append(mk('p','note','Nenhuma carona marcada ainda. Vai viajar? Toque em "Oferecer carona".'));return}
 l.forEach(x=>{const c=mk('div','vcard');c.append(mk('b',0,x.origem+' → '+x.destino));
  c.append(mk('span','vsub',fmt(x)+' · '+x.vagas+(x.vagas===1?' vaga':' vagas')+(x.valor?' · dividir custos: R$ '+x.valor+' por pessoa':' · sem custo')));
  if(x.ponto)c.append(mk('p','vdesc','Encontro: '+x.ponto));
  if(x.obs)c.append(mk('p','vdesc',x.obs));
  c.append(mk('span','vsub','Motorista: '+x.autor));
  const ac=mk('div','vac');const b=mk('button',0,x.meu?'Cancelar minha carona':'💬 Falar com o motorista');b.type='button';
  b.onclick=async()=>{
   if(x.meu){if(!confirm('Cancelar essa carona?'))return;const q=await A.req('/caronas/cancelar',{token:A.usrTk(),body:{id:x.id}});if(q.ok)caronas();else msgC('Não consegui cancelar agora.');return}
   if(!logado()){msgC('Entre na sua conta para falar com o motorista.');return}
   if(window.MH_chamar)MH_chamar({nome:x.autor,work:'Motorista'});else msgC('Chame '+x.autor+' pelo chat.')};
  ac.append(b);c.append(ac);box.append(c)})}
function indicar(){
 if(!logado()){msg('Entre na sua conta para indicar um lugar.');return}
 form('Indicar um lugar','Vai para a análise da equipe MiHelp antes de aparecer. Se visitarmos, o lugar ganha o selo "Visitado pela MiHelp".',
  [{k:'nome',l:'Nome do lugar',max:60},{k:'categoria',l:'Categoria',t:'select',o:CATS},{k:'bairro',l:'Bairro (opcional)',max:40},{k:'descricao',l:'Por que você recomenda? (até 300 letras)',t:'area',max:300},{k:'contato',l:'WhatsApp do lugar (opcional)',t:'tel',ph:'66 99999-9999',max:20},{k:'mapa',l:'Link do mapa (opcional)',ph:'https://maps.app.goo.gl/...',max:300}],
  'Enviar indicação',async o=>{const r=await A.req('/lugares',{token:A.usrTk(),body:Object.assign(o,{cidade:cid})});
   if(r.ok&&r.j.ok){msg('Indicação enviada! Ela aparece depois que a equipe aprovar.');return ''}
   return r.status===429?'Você já tem 5 indicações esperando aprovação.':r.status===401?'Entre na sua conta.':(r.j&&r.j.erro)||'Não consegui enviar agora.'})}
function oferecer(){
 if(!logado()){msgC('Entre na sua conta para oferecer uma carona.');return}
 const hoje=new Date().toISOString().slice(0,10);
 form('Oferecer carona','Carona é divisão de custos, não é serviço de transporte: o MiHelp não cobra nem guarda dinheiro. Combine tudo no chat privado e avise alguém de confiança sobre a viagem.',
  [{k:'origem',l:'Saindo de',max:40,ph:'Ex.: Barra do Garças'},{k:'destino',l:'Indo para',max:40,ph:'Ex.: Goiânia'},{k:'data',l:'Dia',t:'date',min:hoje},{k:'hora',l:'Hora de saída',t:'time'},{k:'vagas',l:'Vagas livres',t:'number',min:1,mx:8,v:3},{k:'valor',l:'Dividir custos: R$ por pessoa (0 = sem custo)',t:'number',min:0,mx:1000,v:0},{k:'ponto',l:'Ponto de encontro',max:80},{k:'obs',l:'Observações (opcional)',max:140}],
  'Publicar carona',async o=>{const r=await A.req('/caronas',{token:A.usrTk(),body:Object.assign(o,{cidade:cid})});
   if(r.ok&&r.j.ok){msgC('Carona publicada!');caronas();return ''}
   return r.status===429?'Você já tem 5 caronas abertas.':r.status===401?'Entre na sua conta.':(r.j&&r.j.erro)||'Não consegui publicar agora.'})}
$('vCid').onchange=()=>{cid=$('vCid').value;try{localStorage.setItem('mh_cidade',cid)}catch(e){}guia()};
$('vCat').onchange=()=>{cat=$('vCat').value;guia()};
$('vNovo').onclick=indicar;$('cNovo').onclick=oferecer;
guia();caronas();
})()}catch(e){console.error('MiHelp (vale):',e)}

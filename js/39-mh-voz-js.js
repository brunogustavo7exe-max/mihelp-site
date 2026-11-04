
/* Voz da Cidade: usa o servidor (worker v14). Sem servidor, a aba se esconde. */
try{(function(){
const A=window.MH_API,sec=document.getElementById('voz');
if(!A||!A.on()){if(sec)sec.hidden=true;document.querySelectorAll('a[href="#voz"]').forEach(n=>n.style.display='none');return}
const $=id=>document.getElementById(id),mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const CATS=['🕳️ Buraco / asfalto','💡 Iluminação','🗑️ Lixo / entulho','🌳 Praça / espaço público','🏫 Escola / saúde','🚦 Trânsito / sinalização','🐾 Animais','💧 Água / esgoto','📌 Outros'];
const ST=['🔴 Aberto','🟡 Em análise','🟢 Concluído (conferido pela equipe MiHelp)'],UR=['','Incomoda','Perigoso','Risco de acidente'];
const call=(p,body,adm)=>{const o={token:adm?A.admTk():A.usrTk()};if(body)o.body=body;return A.req(p,o)};
const ok=r=>!!(r&&r.ok&&r.j&&r.j.ok),er=r=>(r&&r.j&&r.j.erro)||'Não consegui agora. Tente de novo.';
const msg=t=>{$('vzMsg').textContent=t||''};
CATS.forEach((c,i)=>{$('vzCat').append(new Option(c,i))});$('vzFc').append(new Option('Todas as categorias','all'));CATS.forEach((c,i)=>$('vzFc').append(new Option(c,i)));
let L=[],foto='',mapa='';
async function load(){const r=await call('/vozes');if(ok(r)){L=r.j.itens;draw()}else msg(er(r))}
$('vzNovo').onclick=()=>{$('vzForm').hidden=!$('vzForm').hidden};
$('vzCan').onclick=()=>{$('vzForm').hidden=true;$('vzForm').reset();foto='';mapa='';$('vzGeoSt').textContent='Use só quando estiver no local do problema.';$('vzPrev').hidden=true};
$('vzGeo').onclick=()=>{const g=navigator.geolocation;if(!g){$('vzGeoSt').textContent='Seu aparelho não permite pegar a localização.';return}$('vzGeoSt').textContent='Buscando…';g.getCurrentPosition(x=>{mapa='https://www.google.com/maps?q='+x.coords.latitude.toFixed(5)+','+x.coords.longitude.toFixed(5);$('vzGeoSt').textContent='✔ Local marcado (só o ponto do problema vai para o post).'},()=>{$('vzGeoSt').textContent='Não consegui. Escreva o bairro e a rua, que já ajuda.'},{enableHighAccuracy:true,timeout:10000})};
$('vzFoto').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{let m=Math.min(1,800/Math.max(im.width,im.height)),q=.7,s;const c=document.createElement('canvas');for(let i=0;i<4;i++){c.width=im.width*m;c.height=im.height*m;c.getContext('2d').drawImage(im,0,0,c.width,c.height);s=c.toDataURL('image/jpeg',q);if(s.length<360000)break;m*=.75;q-=.1}foto=s;$('vzPrev').src=foto;$('vzPrev').hidden=false};im.src=r.result};r.readAsDataURL(f)};
$('vzForm').onsubmit=async e=>{e.preventDefault();msg('Publicando…');
 const r=await call('/vozes',{titulo:$('vzTit').value,cat:+$('vzCat').value,bairro:$('vzBai').value,urg:+$('vzUrg').value,texto:$('vzTxt').value,tipo:$('vzTipo').value,mostrarNome:$('vzNome').checked,foto,mapa,cidade:(window.MH_CIDADE||{}).slug||'barra-do-garcas'});
 if(ok(r)){$('vzCan').click();msg('Publicado! Compartilhe o link para o povo apoiar.');load()}else msg(r&&r.status===401?'Entre na sua conta para denunciar.':er(r))};
function draw(){const Lc=$('vzLista');Lc.textContent='';const fc=$('vzFc').value;let l=L.filter(p=>fc==='all'||p.c===+fc);
 l.sort($('vzOrd').value==='top'?(a,b)=>b.ap-a.ap:(a,b)=>b.d-a.d);
 if(!l.length)Lc.append(mk('p','note','Nada por aqui ainda. Seja o primeiro a denunciar.'));
 l.forEach(p=>{const d=mk('article','vzp'),m=mk('div','vzm');
  m.append(mk('span','vzs s'+p.st,p.st===2?'🟢 Concluído':ST[p.st]),mk('span',0,CATS[p.c]),mk('span',0,'· '+p.b),mk('span',0,'· '+UR[p.u]),mk('span',0,p.tp==='fato'?'· 📎 Fato com prova':'· 💬 Opinião'),mk('span',0,'· '+new Date(p.d).toLocaleDateString('pt-BR')),mk('span',0,p.meu?'· você':p.nome?'· '+p.nome:'· anônimo'));
  d.append(m,mk('h3',0,p.t),mk('p',0,p.x));
  {const dd=Math.floor(((p.st===2&&p.verTs?p.verTs:Date.now())-p.d)/864e5),q=mk('p','vzd',p.st===2?'⏱ Resolvido em '+dd+(dd===1?' dia':' dias'):dd<1?'⏳ Postado hoje':'⏳ Há '+dd+(dd===1?' dia':' dias')+' sem solução');if(p.st!==2&&dd>=30)q.style.color='var(--red)';d.append(q)}
  if(p.m){const a=mk('a','vzb','📍 Ver no mapa');a.href=p.m;a.target='_blank';a.rel='noopener noreferrer';a.style.display='inline-block';a.style.textDecoration='none';d.append(a)}
  if(p.st===2)d.append(mk('p','vzv','✔ Conferido pela equipe MiHelp'+(p.verTs?' em '+new Date(p.verTs).toLocaleDateString('pt-BR'):'')+(p.ver?': '+p.ver:'')));
  else if(p.st===1)d.append(mk('p','note','A equipe MiHelp vai conferir o local. Só marcamos como concluído depois de checar.'));
  const ac=mk('div','vzrow');
  if(p.foto){const fb=mk('button','vzb','📷 Ver foto');fb.type='button';fb.onclick=async()=>{fb.disabled=true;const r=await call('/vozes/foto?id='+encodeURIComponent(p.id));if(ok(r)&&r.j.f){const i=mk('img');i.src=r.j.f;i.alt='Foto do problema';fb.replaceWith(i)}else fb.textContent='Sem foto'};ac.append(fb)}
  const ap=mk('button','vzb'+(p.apoiei?' on':''),'🙋 Também acontece comigo ('+p.ap+')');ap.type='button';
  ap.onclick=async()=>{const r=await call('/vozes/apoiar',{id:p.id,on:!p.apoiei});if(ok(r)){p.apoiei=!p.apoiei;p.ap=r.j.apoios;draw()}else msg(r&&r.status===401?'Entre na sua conta para apoiar.':er(r))};ac.append(ap);
  const cm=mk('button','vzb','💬 Comentar ('+p.co+')');cm.type='button';ac.append(cm);
  const sh=mk('button','vzb','🔗 Compartilhar');sh.type='button';sh.onclick=async()=>{const u=location.href.split('#')[0]+'#voz',tx=p.t+' - Voz da Cidade (MiHelp)';try{if(navigator.share)await navigator.share({title:tx,url:u});else{await navigator.clipboard.writeText(tx+' '+u);msg('Link copiado.')}}catch(e){}};ac.append(sh);
  const rp=mk('button','vzb','🚩');rp.type='button';rp.title='Denunciar post (spam, ameaça, dado pessoal)';rp.onclick=async()=>{if(!confirm('Reportar esse post para a equipe revisar?'))return;const r=await call('/vozes/denunciar',{id:p.id});msg(ok(r)?'Reportado. A equipe vai revisar.':r&&r.status===401?'Entre na sua conta.':er(r))};ac.append(rp);
  d.append(ac);const cw=mk('div','vzc');cw.hidden=true;d.append(cw);
  cm.onclick=async()=>{if(!cw.hidden){cw.hidden=true;return}cw.hidden=false;cw.textContent='Carregando…';const r=await call('/vozes/comentarios?id='+encodeURIComponent(p.id));cw.textContent='';
   if(ok(r))r.j.itens.forEach(c=>cw.append(mk('div',0,'💬 '+(c.meu?'(você) ':c.nome?c.nome+': ':'Anônimo: ')+c.texto)));
   const f=mk('div','vzrow'),i=mk('input');i.maxLength=240;i.placeholder='Seu comentário ou sugestão';
   const lb=mk('label','vzan'),ck=mk('input');ck.type='checkbox';lb.append(ck,document.createTextNode(' Mostrar meu nome'));
   const b=mk('button','vzb','Enviar');b.type='button';b.onclick=async()=>{const v=i.value.trim();if(v.length<2)return;const x=await call('/vozes/comentar',{id:p.id,texto:v,mostrarNome:ck.checked});if(ok(x)){await load()}else msg(x&&x.status===401?'Entre na sua conta para comentar.':er(x))};
   f.append(i,lb,b);cw.append(f)};
  Lc.append(d)})}
$('vzFc').onchange=$('vzOrd').onchange=draw;
/* ===== painel do adm ===== */
let dlg=null;const adm=()=>{try{return !!A.admTk()}catch(e){return false}};
function showAdm(){$('vzAdmBtn').hidden=!adm()}
let ITENS=[],mf='',stEl=mk('p','note');
const act=async body=>{const x=await call('/admin/vozes/acao',body,true);if(ok(x)){mf='';abreAdm();load()}else stEl.textContent=er(x)};
function rend(){dlg.textContent='';dlg.append(mk('h3',0,'Moderar Voz da Cidade'),stEl);
 if(mf){const bn=mk('p','vzv','🔀 Escolha abaixo a denúncia que vai FICAR. A selecionada some e seus apoios e comentários passam para a escolhida.'),cn=mk('button','vzb','Cancelar mesclagem');cn.type='button';cn.onclick=()=>{mf='';rend()};dlg.append(bn,cn)}
 if(!ITENS.length)dlg.append(mk('p','note','Nenhuma denúncia ainda.'));
 ITENS.forEach(p=>{const d=mk('article','vzp'),dd=Math.floor((Date.now()-p.d)/864e5);
  d.append(mk('div','vzm',(p.oculto?'🙈 OCULTO · ':'')+ST[p.st].split(' (')[0]+' · há '+dd+'d · 🚩 '+p.reps+' · 🙋 '+p.ap+' · 💬 '+p.co+' · autor real: '+p.real+' ('+p.tel+')'+(p.nome?' · mostra nome':' · anônimo')));
  d.append(mk('h3',0,p.t),mk('p',0,p.x+' ['+CATS[p.c]+' · '+p.b+']'));if(p.ver)d.append(mk('p','vzv','Checagem: '+p.ver));
  const ac=mk('div','vzrow'),B=(t,f)=>{const b=mk('button','vzb',t);b.type='button';b.onclick=f;ac.append(b)};
  if(mf){if(p.id===mf)ac.append(mk('span','note','(esta será mesclada)'));else B('👉 Mesclar aqui',()=>{if(confirm('Mesclar nesta? A outra será apagada.'))act({id:mf,acao:'mesclar',para:p.id})})}
  else{
   B('✏️ Editar',()=>{const t=prompt('Título:',p.t);if(t===null)return;const x=prompt('Texto:',p.x);if(x===null)return;act({id:p.id,acao:'editar',t,x})});
   B('✅ Concluir (conferi no local)',()=>{const n=prompt('O que a equipe conferiu? (aparece publicamente)\nEx.: Buraco tapado, conferido dia 20/10');if(n)act({id:p.id,acao:'concluir',nota:n})});
   if(p.st!==1)B('🟡 Em análise',()=>act({id:p.id,acao:'analise'}));
   if(p.st!==0)B('🔴 Reabrir',()=>act({id:p.id,acao:'reabrir'}));
   B('🔀 Mesclar em outra',()=>{mf=p.id;rend()});
   B(p.oculto?'👁 Mostrar':'🙈 Ocultar',()=>act({id:p.id,acao:'ocultar',v:!p.oculto}));
   if(p.reps)B('🚩 Zerar reports',()=>act({id:p.id,acao:'zerar'}));
   B('🗑 Apagar',()=>{if(confirm('Apagar essa denúncia e os comentários?'))act({id:p.id,acao:'apagar'})});
   if(p.m){const a=mk('a','vzb','📍 Mapa');a.href=p.m;a.target='_blank';a.rel='noopener noreferrer';a.style.textDecoration='none';ac.append(a)}
   if(p.co)B('💬 Ver comentários',async()=>{const x=await call('/vozes/comentarios?id='+encodeURIComponent(p.id),null,true);if(!ok(x))return;const w=mk('div','vzc');x.j.itens.forEach(c=>{const l=mk('div',0,'💬 '+c.texto+'  — '+(c.real||'?')+(c.nome?' (mostra nome)':' (anônimo)')+' ');const b=mk('button','vzb','🗑');b.type='button';b.onclick=()=>act({acao:'apagar-comentario',id:c.id});l.append(b);w.append(l)});d.append(w)});
  }
  d.append(ac);dlg.append(d)});
 const f=mk('button','vzb','Fechar');f.type='button';f.onclick=()=>dlg.close();dlg.append(f)}
async function abreAdm(){if(!dlg){dlg=document.createElement('dialog');dlg.id='vzAdm';document.body.append(dlg);dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()})}
 if(!dlg.open){dlg.textContent='Carregando…';dlg.showModal()}
 const r=await call('/admin/vozes',null,true);if(!ok(r)){dlg.textContent='';dlg.append(mk('p','note',er(r)));return}
 ITENS=r.j.itens;rend()}
$('vzAdmBtn').onclick=()=>{mf='';abreAdm()};
showAdm();setInterval(showAdm,4000);load();
})()}catch(e){console.error('voz',e)}

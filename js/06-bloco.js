
window.MH_PAINEL=(function(){
const K=n=>'mh_painel:'+String(n||'').toLowerCase(),DIAS=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const pad=()=>({agenda:{dias:[1,2,3,4,5,6],ini:'09:00',fim:'17:00',dur:60},servicos:[],marcados:[]});
const ler=n=>{try{return Object.assign(pad(),JSON.parse(localStorage.getItem(K(n))||'{}'))}catch(e){return pad()}};
const gravar=(n,o)=>{try{localStorage.setItem(K(n),JSON.stringify(o));return true}catch(e){return false}};
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fd=k=>k.split('-').reverse().slice(0,2).join('/');
let dlg,modo,D,snap,nome,B;
const dirty=()=>modo==='h'&&D&&JSON.stringify(D)!==snap;
const sair=()=>!dirty()||confirm('Você mudou algo e não salvou. Sair sem salvar?');
function box(){if(!dlg){dlg=document.createElement('dialog');dlg.className='mhp';dlg.setAttribute('aria-label','Agenda');document.body.append(dlg);
 dlg.addEventListener('click',e=>{if(e.target===dlg)fechar();else clique(e)});
 dlg.addEventListener('change',e=>{const k=e.target.dataset&&e.target.dataset.k;if(!k||modo!=='h')return;const p=k.split('.');D[p[0]][p[1]]=p[1]==='dur'?+e.target.value:e.target.value;tela()});
 dlg.addEventListener('cancel',e=>{if(!sair())e.preventDefault()})}return dlg}
function fechar(){if(!sair())return;D=null;if(dlg&&dlg.open)dlg.close()}
function toast(m){let t=document.getElementById('mhpT');if(!t){t=document.createElement('div');t.id='mhpT';t.className='mhp-t';document.body.append(t)}t.textContent=m;t.hidden=false;clearTimeout(t._x);t._x=setTimeout(()=>t.hidden=true,2500)}
/* ---- agenda do Helper ---- */
function agenda(ctx){if(!ctx.eu)return;modo='h';nome=ctx.eu.nome;D=ler(nome);snap=JSON.stringify(D);tela()}
function tela(){const a=D.agenda,h=[];for(let i=6;i<=22;i++)h.push(String(i).padStart(2,'0')+':00');
 const sel=(k,v)=>'<select data-k="'+k+'">'+h.map(x=>'<option'+(x===v?' selected':'')+'>'+x+'</option>').join('')+'</select>';
 const mar=D.marcados.map((m,i)=>({m,i})).sort((x,y)=>(x.m.dia+x.m.hora).localeCompare(y.m.dia+y.m.hora));
 box().innerHTML='<div class="mhp-b"><button class="mhp-x" data-a="fechar">✕ Fechar</button><h3>📅 Minha agenda</h3><p class="mhp-m">Escolha quando você atende. Quem quiser marcar só vê esses horários.</p>'
 +'<h4>Dias que atendo</h4><div class="mhp-c">'+DIAS.map((d,i)=>'<button class="mhp-chip'+(a.dias.includes(i)?' on':'')+'" data-a="dia" data-v="'+i+'">'+d+'</button>').join('')+'</div>'
 +'<label>Começo às'+sel('agenda.ini',a.ini)+'</label><label>Termino às'+sel('agenda.fim',a.fim)+'</label>'
 +'<label>Cada atendimento dura<select data-k="agenda.dur">'+[30,45,60,90,120].map(m=>'<option value="'+m+'"'+(m==a.dur?' selected':'')+'>'+m+' minutos</option>').join('')+'</select></label>'
 +'<h4>O que eu faço</h4><p class="mhp-m">Ex.: corte, pintura, conserto, aula.</p>'
 +(D.servicos.map((s,i)=>'<div class="mhp-i"><span>'+esc(s)+'</span><button data-a="tirar" data-v="'+i+'">Tirar</button></div>').join('')||'<p class="mhp-m">Nenhum serviço ainda. Sem serviço, ninguém consegue marcar.</p>')
 +'<div class="mhp-add"><input id="mhpNovo" maxlength="40" placeholder="Novo serviço"><button data-a="add">Adicionar</button></div>'
 +'<h4>Horários marcados ('+mar.length+')</h4>'+(mar.map(x=>'<div class="mhp-i"><span><b>'+esc(x.m.cliente)+'</b> · '+esc(x.m.serv)+'<br><small>'+fd(x.m.dia)+' às '+x.m.hora+'</small></span><button data-a="canc" data-v="'+x.i+'">Cancelar</button></div>').join('')||'<p class="mhp-m">Ninguém marcou ainda.</p>')+'</div>'
 +(dirty()?'<div class="mhp-s"><p>Você mudou algo e ainda não salvou</p><div><button data-a="desf">Desfazer</button><button class="ok" data-a="salvar">💾 Salvar</button></div></div>':'');
 if(!dlg.open)dlg.showModal()}
function salvar(){const ant=JSON.parse(snap).marcados,cur=ler(nome).marcados;cur.forEach(m=>{if(!ant.some(x=>x.id===m.id)&&!D.marcados.some(x=>x.id===m.id))D.marcados.push(m)});
 if(gravar(nome,D)){snap=JSON.stringify(D);toast('✅ Salvo!')}else alert('Não consegui salvar neste aparelho.')}
/* ---- cliente marca horário ---- */
const tem=n=>{const P=ler(n);return P.servicos.length>0&&P.agenda.dias.length>0};
function marcar(prof,ctx){const e=ctx.eu;if(!e){alert('Entre na sua conta para marcar um horário.');return}
 if(prof===e.nome){alert('Você não pode marcar horário com você mesmo.');return}
 modo='c';B={prof,st:1,serv:'',dia:'',hora:'',cli:e.nome};pintaB()}
function pintaB(){const P=ler(B.prof),a=P.agenda,n=B.st,t=s=>+s.slice(0,2)*60+ +s.slice(3);let h='<div class="mhp-b"><button class="mhp-x" data-a="fechar">✕ Fechar</button>';
 const nav=(off)=>'<div class="mhp-n">'+(n>1?'<button data-a="volt">Voltar</button>':'')+'<button class="ok" data-a="prox"'+(off?' disabled':'')+'>Próximo</button></div>';
 if(n===1)h+='<h3>1. O que você precisa?</h3><p class="mhp-m">Com '+esc(B.prof)+'</p>'+P.servicos.map((s,i)=>'<button class="mhp-big'+(B.serv===s?' on':'')+'" data-a="serv" data-v="'+i+'">'+esc(s)+'</button>').join('')+nav(!B.serv);
 if(n===2){const r=[],d0=new Date();for(let i=0;i<21&&r.length<9;i++){const x=new Date(d0.getFullYear(),d0.getMonth(),d0.getDate()+i);if(a.dias.includes(x.getDay()))r.push([x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0'),DIAS[x.getDay()]+'<br>'+String(x.getDate()).padStart(2,'0')+'/'+String(x.getMonth()+1).padStart(2,'0')])}
  h+='<h3>2. Qual dia?</h3><div class="mhp-c">'+r.map(x=>'<button class="mhp-chip'+(B.dia===x[0]?' on':'')+'" data-a="dia" data-v="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>'+nav(!B.dia)}
 if(n===3){const r=[];for(let m=t(a.ini);m+a.dur<=t(a.fim);m+=a.dur)r.push(String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0'));
  h+='<h3>3. Que horas?</h3><div class="mhp-c">'+r.map(x=>'<button class="mhp-chip'+(B.hora===x?' on':'')+'" data-a="hora" data-v="'+x+'"'+(P.marcados.some(m=>m.dia===B.dia&&m.hora===x)?' disabled':'')+'>'+x+'</button>').join('')+'</div>'+nav(!B.hora)}
 if(n===4)h+='<h3>4. Confere se está certo</h3><div class="mhp-r"><b>Com:</b> '+esc(B.prof)+'<br><b>Serviço:</b> '+esc(B.serv)+'<br><b>Dia:</b> '+fd(B.dia)+'<br><b>Hora:</b> '+B.hora+'</div><div class="mhp-n"><button data-a="volt">Voltar</button><button class="ok" data-a="conf">✅ Confirmar</button></div>';
 if(n===5)h+='<div style="text-align:center"><div style="font-size:52px">✅</div><h3>Marcado!</h3><p class="mhp-m">'+esc(B.serv)+' com '+esc(B.prof)+'<br>'+fd(B.dia)+' às '+B.hora+'<br>O horário aparece na agenda de '+esc(B.prof)+'.</p></div><div class="mhp-n"><button class="ok" data-a="fechar">Fechar</button></div>';
 box().innerHTML=h+'</div>';if(!dlg.open)dlg.showModal()}
function clique(e){const b=e.target.closest('[data-a]');if(!b||b.disabled)return;const a=b.dataset.a,v=b.dataset.v;
 if(a==='fechar')return fechar();
 if(modo==='h'){if(a==='dia'){const d=D.agenda.dias,i=d.indexOf(+v);i<0?d.push(+v):d.splice(i,1)}
  else if(a==='tirar')D.servicos.splice(+v,1);
  else if(a==='add'){const t=document.getElementById('mhpNovo').value.trim();if(!t)return;D.servicos.push(t.slice(0,40))}
  else if(a==='canc'){if(!confirm('Cancelar este horário?'))return;D.marcados.splice(+v,1)}
  else if(a==='desf')D=JSON.parse(snap);
  else if(a==='salvar')salvar();
  return tela()}
 const P=ler(B.prof);
 if(a==='serv')B.serv=P.servicos[+v];else if(a==='dia'){B.dia=v;B.hora=''}else if(a==='hora')B.hora=v;
 else if(a==='prox')B.st++;else if(a==='volt')B.st--;
 else if(a==='conf'){if(P.marcados.some(m=>m.dia===B.dia&&m.hora===B.hora)){B.st=3;B.hora='';pintaB();return toast('Esse horário acabou de ser marcado. Escolha outro.')}
  P.marcados.push({id:Date.now(),cliente:B.cli,serv:B.serv,dia:B.dia,hora:B.hora});if(!gravar(B.prof,P))return alert('Não consegui marcar. Tente de novo.');B.st=5}
 pintaB()}
/* ---- botões do Meu perfil ---- */
let ABERTA='';
function aplica(){const r=document.getElementById('reg');if(!r)return;r.querySelectorAll('.mhp-sec').forEach(x=>{x.hidden=x.dataset.s!==ABERTA;if(!x.hidden&&x.dataset.s==='port'){const d=x.querySelector('details');if(d)d.open=true}});r.querySelectorAll('.mhp-g button[data-s]').forEach(b=>b.classList.toggle('on',b.dataset.s===ABERTA))}
function mostrar(k){ABERTA=ABERTA===k?'':k;aplica();const el=ABERTA&&document.querySelector('#reg .mhp-sec[data-s="'+k+'"]');if(el)el.scrollIntoView({behavior:'smooth',block:'nearest'})}
function organiza(r){const kids=[...r.children],txt=n=>n.textContent||'';
 const sec=(k,ns)=>{if(!ns.length)return;const w=document.createElement('div');w.className='mhp-sec';w.dataset.s=k;ns[0].before(w);ns.forEach(n=>w.append(n))};
 const det=kids.find(n=>n.classList.contains('port-ed')||(n.tagName==='DETAILS'&&txt(n).indexOf('Portfólio e contatos')>=0));if(det)sec('port',[det]);
 const ia=kids.findIndex(n=>n.tagName==='H4'&&txt(n).indexOf('Comentários')===0),ifv=kids.findIndex(n=>n.tagName==='H4'&&txt(n).indexOf('Meus favoritos')===0);
 if(ia>=0)sec('aval',kids.slice(ia,ifv>ia?ifv:undefined));if(ifv>=0)sec('fav',kids.slice(ifv));aplica()}
function tiles(ctx){const w=document.createElement('div');w.className='mhp-tiles';w.innerHTML='<h4>Meu painel</h4><div class="mhp-g"></div>';const g=w.lastChild;
 [['📅','Minha agenda',()=>agenda(ctx)],['🏪','Minha loja',()=>ctx.espaco(/^(Meus estabelecimentos|Minhas equipes|Convites)/)],['⭐','Avaliações',()=>mostrar('aval'),'aval'],['🖼️','Portfólio e contatos',()=>mostrar('port'),'port'],['❤️','Favoritos',()=>mostrar('fav'),'fav'],['🔒','Conta e privacidade',()=>ctx.espaco(/^(Privacidade|Meus ofícios|Minha conta)/)],['📤','Compartilhar perfil',()=>ctx.share()]]
 .forEach(x=>{const b=document.createElement('button');b.type='button';if(x[3])b.dataset.s=x[3];b.innerHTML='<span>'+x[0]+'</span>'+x[1];b.onclick=x[2];g.append(b)});return w}
return{tiles,tem,marcar,toast,organiza}})();

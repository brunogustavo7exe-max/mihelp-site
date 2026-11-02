
/* Widget Rivo: so encaminha. A logica de carona, pedido e mapa mora no Rivo. */
try{(function(){
 var sec=document.getElementById('rivo');if(!sec)return;var CH=null;
 var BUSCA={moto:['Mototaxista','mototaxista'],entrega:['Entregador','entregador'],carro:['Motorista','motorista'],frete:['Frete e mudança','frete e mudanca'],maquinas:['Máquinas e terra','maquinas']};
 sec.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-rv]');if(!b||b.disabled)return;
  var k=b.getAttribute('data-rv');
  if(k==='carona'){if(!window.open('rivo.html#carona','_blank','noopener'))location.href='rivo.html#carona';return}
  if((k==='moto'||k==='entrega')&&CH){CH.abrir(k);return}
  var q=BUSCA[k];if(!q)return;
  if(typeof window.MH_verOficio==='function'){window.MH_verOficio(q[0],q[1]);return}
  /* plano B: se a busca por ofício ainda não carregou, filtra a lista direto */
  var pq=document.getElementById('profQ');
  if(pq){try{window.MH_ABA8&&MH_ABA8('helpers')}catch(x){}pq.value=q[1];pq.dispatchEvent(new Event('input'));
   var pr=document.getElementById('prof');if(pr)pr.scrollIntoView({behavior:'smooth',block:'nearest'})}
 });
 /* ---- Chamado: pede mototáxi/entregador como num app de corrida. O pedido vai para a fila do Rivo e este card acompanha o status. ---- */
 CH=(function(){
  var KF='rivo_fila_v1',KS='rivo_status_v1',KC='rivo_cancel_v1',KA='rivo_chamado_v1',KP='rivo_cliente_v1';
  var box=document.getElementById('rvCh');if(!box)return null;
  var T={
   moto:{tit:'Chamar mototáxi',bt:'Chamar mototáxi agora',de:'Onde você está',para:'Para onde vai',quem:'mototaxista',busca:'Chamando os mototaxistas cadastrados no Rivo.',
    ok:{atribuida:['aceitou sua corrida','Ele já sabe onde você está e vai até você.'],a_coleta:['está a caminho de você','Fique no ponto combinado.'],coletado:['Corrida iniciada','Boa viagem!'],em_rota:['Indo para o destino','Você será avisado ao chegar.'],entregue:['Corrida finalizada','Obrigado por usar o Rivo.']}},
   entrega:{tit:'Chamar entregador',bt:'Chamar entregador agora',de:'Onde buscar',para:'Onde entregar',quem:'entregador',busca:'Chamando os entregadores cadastrados no Rivo.',
    ok:{atribuida:['aceitou seu chamado','Ele vai até o local de coleta.'],a_coleta:['está indo buscar','Deixe o item pronto para entrega.'],coletado:['Item coletado','Já está com o entregador.'],em_rota:['A caminho do destino','Acompanhe por aqui.'],entregue:['Entrega concluída','Obrigado por usar o Rivo.']}}
  };
  var cur=null,tm=null,tipoForm='moto',ultimo='';
  var reduz=false;try{reduz=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches}catch(e){}
  function lg(k,d){try{var v=JSON.parse(localStorage.getItem(k)||'null');return v==null?d:v}catch(e){return d}}
  function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
  function bt(c,x,fn){var b=el('button','rv-b '+(c||''),x);b.type='button';b.onclick=fn;return b}
  function campo(l,tag,at){var w=el('label',null,l),i=document.createElement(tag||'input');if(!tag)i.type='text';for(var k in at)i[k]=at[k];[['background','#0c0e11'],['color','#f3f5f8'],['border','1px solid #2a2f38']].forEach(function(p){i.style.setProperty(p[0],p[1],'important')});w.append(i);return{w:w,i:i}}
  function velo(rapido){[].forEach.call(sec.querySelectorAll('.rv-mo'),function(a){a.setAttribute('dur',rapido?'2.4s':'6s')})}
  if(reduz){[].forEach.call(sec.querySelectorAll('.rv-mo'),function(a){var c=a.parentNode;c.setAttribute('cx','12');c.setAttribute('cy','21');c.removeChild(a)})}
  function mm(ms){var s=Math.max(0,Math.floor(ms/1000));return Math.floor(s/60)+':'+('0'+s%60).slice(-2)}
  function digs(v){return String(v||'').replace(/\D/g,'')}
  function abrirTela(){sec.classList.add('rv-chon')}
  function fechar(){clearInterval(tm);tm=null;cur=null;ultimo='';try{localStorage.removeItem(KA)}catch(e){}sec.classList.remove('rv-chon');box.textContent='';velo(false)}

  /* ---- passo 1: formulário curto (é um chamado, não uma escolha de profissional) ---- */
  function form(k){
   tipoForm=k;var t=T[k],cli=lg(KP,{}),geo=null;abrirTela();box.textContent='';velo(false);
   var de=campo(t.de,0,{maxLength:120,placeholder:'Rua, número, bairro ou ponto de referência',autocomplete:'street-address'}),
       pa=campo(t.para,0,{maxLength:120,placeholder:'Rua, número, bairro ou ponto de referência'}),
       ob=campo(k==='entrega'?'O que levar ou buscar (opcional)':'Observação (opcional)','textarea',{rows:2,maxLength:140,placeholder:k==='entrega'?'Ex.: documento, marmita, remédio':'Ex.: portão azul, estou de capacete'}),
       no=campo('Seu nome',0,{maxLength:40,value:cli.nome||'',autocomplete:'name'}),
       te=campo('Telefone com DDD',0,{maxLength:16,value:cli.tel||'',inputMode:'tel',autocomplete:'tel'}),
       va=campo('Quanto você paga (R$, opcional)',0,{maxLength:8,inputMode:'decimal',placeholder:'Em branco = combinar'}),
       er=el('p','rv-er');er.setAttribute('role','alert');
   var gb=bt('',  '📍 Usar minha localização',function(){
    if(!navigator.geolocation){er.textContent='Este aparelho não oferece localização.';return}
    gb.textContent='Localizando…';
    navigator.geolocation.getCurrentPosition(function(p){geo={lat:+p.coords.latitude.toFixed(6),lng:+p.coords.longitude.toFixed(6),acc:Math.round(p.coords.accuracy)};if(!de.i.value.trim())de.i.value='Minha localização atual';gb.textContent='📍 Localização marcada'},function(){gb.textContent='📍 Usar minha localização';er.textContent='Localização negada. Escreva o endereço.'},{enableHighAccuracy:true,timeout:10000,maximumAge:30000})});
   gb.style.marginBottom='10px';
   var two=el('div','rv-two');two.append(no.w,te.w);
   var go=bt('p w',t.bt,function(){
    var o=de.i.value.trim(),d=pa.i.value.trim(),n=no.i.value.trim(),tl=digs(te.i.value),vs=va.i.value.trim().replace(/^R\$\s*/i,'').replace(',','.'),vc=0;
    if(o.length<3)return er.textContent='Diga '+t.de.toLowerCase()+'.',de.i.focus();
    if(d.length<3)return er.textContent='Diga '+t.para.toLowerCase()+'.',pa.i.focus();
    if(n.length<2)return er.textContent='Escreva seu nome.',no.i.focus();
    if(tl.length<10)return er.textContent='Informe o telefone com DDD.',te.i.focus();
    if(vs){var f=parseFloat(vs);if(!(f>0&&f<10000))return er.textContent='Valor inválido. Ex.: 12,50 (ou deixe em branco).',va.i.focus();vc=Math.round(f*100)}
    enviar({tipo:k,orig:o,dest:d,obs:ob.i.value.trim(),cliente:n,tel:te.i.value.trim(),valor:vc,geo:geo})});
   var row=el('div','rv-row');row.append(bt('','← Voltar',fechar));
   box.append(el('h3',null,t.tit),de.w,gb,pa.w,ob.w,two,va.w,er,go,row);
   de.i.focus({preventScroll:true})}

  /* ---- passo 2: o chamado sai e o card fica "solicitando" ---- */
  function enviar(o){
   var rid='ch'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),now=Date.now();
   sv(KP,{nome:o.cliente,tel:o.tel});
   var fila=lg(KF,[]);if(!Array.isArray(fila))fila=[];
   fila=fila.filter(function(x){return x&&x.ts&&now-x.ts<864e5});
   fila.push({rid:rid,chamado:1,tipo:o.tipo,orig:o.orig,dest:o.dest,obs:o.obs,cliente:o.cliente,tel:o.tel,valor:o.valor,geo:o.geo,cidade:'',ts:now});
   sv(KF,fila);
   cur={rid:rid,tipo:o.tipo,orig:o.orig,dest:o.dest,valor:o.valor,ts:now};sv(KA,cur);ultimo='';
   tela();clearInterval(tm);tm=setInterval(tela,1000)}

  /* ---- passo 3: acompanha o que o Rivo devolve (aceito, a caminho, concluído) ---- */
  function cancelar(){
   if(!confirm('Cancelar este chamado?'))return;
   var c=lg(KC,[]);if(!Array.isArray(c))c=[];c.push(cur.rid);sv(KC,c.slice(-50));
   var f=lg(KF,[]);if(Array.isArray(f))sv(KF,f.filter(function(x){return x&&x.rid!==cur.rid}));
   cur.cancelado=1;sv(KA,cur);ultimo='';tela()}
  function linkTel(t,txt,cls){var a=el('a','rv-b '+(cls||''),txt);a.href='tel:'+digs(t);return a}
  function linkZap(t,txt){var d=digs(t);if(d.length<12)d='55'+d;var a=el('a','rv-b','WhatsApp');a.href='https://wa.me/'+d;a.target='_blank';a.rel='noopener';return a}
  function tela(){
   if(!cur)return;
   var t=T[cur.tipo]||T.moto,mp=lg(KS,{}),st=mp[cur.rid]||null,s=cur.cancelado?'cancelada':(st&&st.st)||'enviando';
   if(Date.now()-cur.ts>432e5&&(s==='entregue'||s==='cancelada')){fechar();return}
   var chave=s+'|'+(st&&st.nome||'')+'|'+(st&&st.pin||'');
   var espera=Date.now()-cur.ts;
   if(chave===ultimo){var tt=box.querySelector('[data-tempo]');if(tt)tt.textContent=mm(espera);var lg2=box.querySelector('[data-longo]');if(lg2&&espera>12e4)lg2.hidden=false;return}
   ultimo=chave;abrirTela();box.textContent='';
   var wrap=el('div','rv-st'),h1=el('b'),sub=el('span'),rad=el('div','rv-radar');rad.setAttribute('aria-hidden','true');
   var row=el('div','rv-row');
   var rota=el('div','rv-rs');rota.append(el('b',null,'De: '),document.createTextNode(cur.orig),document.createElement('br'),el('b',null,'Para: '),document.createTextNode(cur.dest),
     document.createElement('br'),el('b',null,'Valor: '),document.createTextNode(cur.valor?(cur.valor/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):'a combinar'));
   var nome=(st&&st.nome)||'O '+t.quem;
   if(s==='enviando'||s==='solicitada'){
    velo(true);h1.textContent='Solicitando '+t.quem+'…';sub.textContent=(s==='enviando'?'Enviando o chamado ao Rivo. ':t.busca+' ')+'Assim que alguém aceitar, aparece aqui.';
    var tp=el('span');tp.append('Esperando há ');var tn=el('b',null,mm(espera));tn.setAttribute('data-tempo','');tp.append(tn);
    var longo=el('span','','Ainda sem resposta. Você pode continuar esperando ou procurar um profissional na lista.');longo.setAttribute('data-longo','');longo.hidden=espera<=12e4;
    wrap.append(rad,h1,sub,tp,longo);
    row.append(bt('','Cancelar chamado',cancelar));
    var vb=bt('','Ver profissionais',function(){fechar();if(typeof window.MH_verOficio==='function')window.MH_verOficio(cur0.tipo==='moto'?'Mototaxista':'Entregador',cur0.tipo==='moto'?'mototaxista':'entregador')});var cur0=cur;row.append(vb);
   }else if(s==='cancelada'){
    velo(false);wrap.className='rv-st er';h1.textContent='Chamado cancelado';sub.textContent='Nenhum '+t.quem+' vai até você por este chamado.';wrap.append(rad,h1,sub);
    var fila=lg(KF,[]);if(Array.isArray(fila))sv(KF,fila.filter(function(x){return x&&x.rid!==cur.rid}));
    row.append(bt('p','Fazer novo chamado',function(){var k=cur.tipo;fechar();form(k)}),bt('','Voltar',fechar));
   }else{
    var m=t.ok[s]||t.ok.atribuida;velo(s!=='entregue');wrap.className='rv-st ok';
    h1.textContent=(s==='atribuida'||s==='a_coleta')?nome+' '+m[0]:m[0];sub.textContent=m[1];wrap.append(rad,h1,sub);
    if(st&&st.pin&&cur.tipo==='entrega'&&s!=='entregue'){wrap.append(el('span',null,'Código de confirmação (passe a quem recebe):'));wrap.append(el('b','rv-pin',st.pin))}
    var info=[];if(st&&st.nome)info.push(st.nome);if(st&&st.veic)info.push(st.veic);
    if(s==='entregue'){
     var f2=lg(KF,[]);if(Array.isArray(f2))sv(KF,f2.filter(function(x){return x&&x.rid!==cur.rid}));
     row.append(bt('p','Novo chamado',function(){var k=cur.tipo;fechar();form(k)}),bt('','Voltar',fechar));
    }else{
     if(st&&st.tel){row.append(linkTel(st.tel,'Ligar','p'),linkZap(st.tel))}
     if(s==='atribuida'||s==='a_coleta')row.append(bt('','Cancelar',cancelar));
    }
    if(info.length){var ic=el('div','rv-rs');ic.append(el('b',null,(cur.tipo==='moto'?'Mototaxista: ':'Entregador: ')),document.createTextNode(info.join(' · ')));wrap.append(ic)}
   }
   wrap.append(rota);box.append(wrap,row)}

  window.addEventListener('storage',function(ev){if(cur&&(ev.key===KS||ev.key===null))tela()});
  /* retoma um chamado aberto se a página for recarregada */
  var ant=lg(KA,null);
  if(ant&&ant.rid&&Date.now()-ant.ts<432e5){cur=ant;tela();tm=setInterval(tela,1000)}
  else if(ant)try{localStorage.removeItem(KA)}catch(e){}
  return{abrir:function(k){if(cur){tela();return}form(k)}}
 })();

 /* numero de caronas (so leitura), se a API estiver ligada */
 var A=window.MH_API;
 if(A&&A.on&&A.on()){
  A.req('/caronas',{token:A.usrTk?A.usrTk():''}).then(function(r){
   if(!r||!r.ok||!r.j)return;var l=r.j.itens||[],hoje=new Date().toISOString().slice(0,10);
   var n=l.filter(function(x){return x.data===hoje}).length,el=document.getElementById('rvCar');
   if(el)el.textContent=n?n+(n===1?' hoje':' hoje'):(l.length?l.length+(l.length===1?' aberta':' abertas'):'dividir viagem');
  }).catch(function(){});
 }
})()}catch(e){console.error('MiHelp (rivo):',e)}

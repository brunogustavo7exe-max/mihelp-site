
(function(){
window.MH_CENTRAL=async function(ctx){
 var tkn=window.MH_API&&MH_API.usrTk&&MH_API.usrTk();
 if(!tkn)return ctx.espaco(); /* só para pedir o login */
 var d=document.getElementById('mhCentral');
 if(!d){d=document.createElement('dialog');d.id='mhCentral';document.body.append(d);
  var st=document.createElement('style');
  st.textContent='#mhCentral{max-width:480px;width:calc(100% - 24px);border:1px solid var(--line,#444);border-radius:16px;background:var(--surf,#1d1b16);color:var(--text,#eee);padding:18px}#mhCentral::backdrop{background:rgba(0,0,0,.6)}#mhCentral h3{margin:0 0 4px}#mhCentral p{margin:0 0 12px;opacity:.8}#mhCentral select{font:inherit;width:100%;min-height:42px;margin:0 0 12px;padding:4px 10px;border-radius:10px;border:1px solid var(--line,#555);background:transparent;color:inherit}#mhCentral .mc-a{display:flex;flex-wrap:wrap;gap:8px}#mhCentral button,#mhCentral a.mc-b{font:inherit;min-height:42px;padding:6px 14px;border-radius:10px;border:1px solid var(--line,#555);background:transparent;color:inherit;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}#mhCentral button:disabled{opacity:.45;cursor:not-allowed}#mhCentral .mc-p{background:#37d8e6;color:#06222a;border-color:#37d8e6;font-weight:700}';
  document.head.append(st)}
 d.textContent='';
 var h3=document.createElement('h3');h3.textContent='Minha loja';
 var p=document.createElement('p');p.textContent='Carregando…';
 d.append(h3,p);if(!d.open)d.showModal();

 var r=null;try{r=await MH_API.req('/perfil/meu',{token:tkn})}catch(e){}
 var ok=!!(r&&r.ok&&r.j&&r.j.ok),lojas=ok?(r.j.lojas||[]):[];
 p.textContent=!ok?'Não consegui carregar agora, mas você ainda pode abrir o Labs.'
  :lojas.length?'Dados, logo, serviços, produtos, equipe, caixa e orçamentos ficam no D\u2019Castro Labs.'
  :'Você ainda não tem uma empresa. Crie a sua no D\u2019Castro Labs.';

 var p0=p.textContent,sel=null;
 if(lojas.length>1){sel=document.createElement('select');sel.setAttribute('aria-label','Empresa');
  lojas.forEach(function(l){sel.add(new Option(l.nome,l.chave))});d.append(sel)}
 function cur(){return lojas.find(function(l){return sel?l.chave===sel.value:true})||null}

 var f=document.createElement('div');f.className='mc-a';
 var lb=document.createElement('a');lb.className='mc-b mc-p';lb.target='_blank';lb.textContent='Abrir no Domin';
 lb.onclick=function(e){var w=null;try{w=window.open(lb.href,'_blank')}catch(x){}if(w){e.preventDefault();try{w.opener=null}catch(x){}}};
 var pb=document.createElement('button');pb.type='button';pb.textContent='Perfil público';
 var mb=document.createElement('a');mb.className='mc-b';mb.target='_blank';mb.rel='noopener noreferrer';mb.textContent='Abrir no MESA';mb.href=window.MH_MESA_URL||'mesa.html';
 var eb=document.createElement('button');eb.type='button';eb.textContent='Editar';
 var ab=document.createElement('button');ab.type='button';ab.textContent='Apagar';ab.className='mc-d';
 var c=document.createElement('button');c.type='button';c.textContent='Fechar';
 function atualiza(){var l=cur();lb.href='labs.html'+(l?'?loja='+encodeURIComponent(l.chave):'');pb.disabled=!l;eb.disabled=!l;ab.disabled=!l}
 eb.onclick=function(){var l=cur();if(!l)return;d.close();if(window.MH_V8)MH_V8.editar(l.chave);else ctx.espaco('lojas')};
 var armado=0;
 ab.onclick=async function(){var l=cur();if(!l)return;
  if(!armado){armado=setTimeout(function(){armado=0;ab.textContent='Apagar';p.textContent=p0},5000);ab.textContent='Toque de novo para apagar';p.textContent='Isso remove \u201c'+l.nome+'\u201d do MiHelp (perfil, equipe e cardápio publicado). Não dá para desfazer.';return}
  clearTimeout(armado);armado=0;ab.disabled=true;ab.textContent='Apagando…';
  var r=null;try{r=await MH_API.req('/estabelecimentos/apagar',{token:tkn,body:{chave:l.chave}})}catch(e){}
  if(r&&r.ok&&!(r.j&&r.j.ok===false)){try{MH_V8&&MH_V8.recarrega()}catch(e){}d.close();MH_CENTRAL(ctx)}
  else{ab.disabled=false;ab.textContent='Apagar';p.textContent=(r&&r.j&&r.j.erro)||'Não consegui apagar agora. Tente de novo.'}};
 if(sel)sel.onchange=atualiza;atualiza();
 pb.onclick=function(){var l=cur();if(!l)return;d.close();location.href='?loja='+encodeURIComponent(l.chave)};
 c.onclick=function(){d.close()};
 f.append(lb,mb,pb,eb,ab,c);d.append(f);
};
})();


(function(){
window.MH_CENTRAL=async function(ctx){
 try{
  if(!window.MH_API||!MH_API.usrTk())return ctx.espaco('lojas');
  var r=await MH_API.req('/perfil/meu',{token:MH_API.usrTk()});
  if(!r.ok||!r.j||!r.j.ok)return ctx.espaco('lojas');
  var lojas=r.j.lojas||[];
  var d=document.getElementById('mhCentral');
  if(!d){d=document.createElement('dialog');d.id='mhCentral';document.body.append(d);
   var st=document.createElement('style');st.textContent='#mhCentral{max-width:520px;width:calc(100% - 24px);border:1px solid var(--line,#444);border-radius:16px;background:var(--surf,#1d1b16);color:var(--text,#eee);padding:18px}#mhCentral::backdrop{background:rgba(0,0,0,.6)}#mhCentral h3{margin:0 0 4px}#mhCentral p{margin:0 0 10px;opacity:.8}#mhCentral .mc-l{border:1px solid var(--line,#444);border-radius:12px;padding:10px 12px;margin:8px 0}#mhCentral .mc-a{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}#mhCentral button,#mhCentral a.mc-b{font:inherit;min-height:42px;padding:6px 14px;border-radius:10px;border:1px solid var(--line,#555);background:transparent;color:inherit;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}#mhCentral .mc-p{background:#37d8e6;color:#06222a;border-color:#37d8e6;font-weight:700}';document.head.append(st)}
  d.textContent='';
  var h3=document.createElement('h3');h3.textContent='Minha loja';
  var p=document.createElement('p');p.textContent=lojas.length?'Escolha onde quer trabalhar.':'Você ainda não tem uma empresa cadastrada.';
  d.append(h3,p);
  lojas.forEach(function(l){
   var b=document.createElement('div');b.className='mc-l';
   var n=document.createElement('strong');n.textContent=l.nome;
   var m=document.createElement('div');m.style.opacity='.75';m.textContent=[l.tipo,l.cidade].filter(Boolean).join(' · ');
   var a=document.createElement('div');a.className='mc-a';
   var lb=document.createElement('a');lb.className='mc-b mc-p';lb.href='labs.html?loja='+encodeURIComponent(l.chave);lb.textContent='Abrir no D\u2019Castro Labs';
   var pb=document.createElement('button');pb.textContent='Perfil público';pb.onclick=function(){d.close();location.href='?loja='+encodeURIComponent(l.chave)};
   a.append(lb,pb);b.append(n,m,a);d.append(b)});
  var f=document.createElement('div');f.className='mc-a';
  var e=document.createElement('button');e.className=lojas.length?'':'mc-p';e.textContent=lojas.length?'Editar loja, equipe e serviços':'Criar minha empresa';e.onclick=function(){d.close();ctx.espaco('lojas')};
  var c=document.createElement('button');c.textContent='Fechar';c.onclick=function(){d.close()};
  f.append(e,c);d.append(f);d.showModal();
 }catch(err){ctx.espaco('lojas')}
};
})();

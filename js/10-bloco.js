
try{
(function(){
  const cw=document.getElementById('cw'),btn=document.getElementById('cwExp');
  if(!cw||!btn)return;
  function set(on){
    cw.classList.toggle('full',on);
    document.documentElement.classList.toggle('cw-open',on);
    btn.textContent=on?'Reduzir':'Ampliar';
    btn.setAttribute('aria-pressed',on?'true':'false');
    btn.setAttribute('aria-label',on?'Voltar ao tamanho normal':'Ampliar a sala de conversa');
    const log=document.getElementById('log');
    if(log)log.scrollTop=log.scrollHeight;
    if(on){const m=document.getElementById('m');if(m&&!m.disabled)m.focus()}
    else cw.scrollIntoView({block:'center'});
  }
  btn.addEventListener('click',()=>set(!cw.classList.contains('full')));
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&cw.classList.contains('full')&&!document.querySelector('dialog[open]'))set(false);
  });
})();
}catch(e){console.error('MiHelp (sala ampliada):',e)}

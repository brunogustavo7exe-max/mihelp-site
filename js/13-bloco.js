
try{
(function(){
  const tg=document.getElementById('whoTg'),w=document.querySelector('.who');
  if(tg&&w)tg.addEventListener('click',()=>{const o=w.classList.toggle('open');tg.setAttribute('aria-expanded',o);tg.textContent=tg.textContent.replace(/[▴▾]/,o?'▴':'▾')});
  if(window.visualViewport){const v=window.visualViewport,r=document.documentElement.style,u=()=>{r.setProperty('--vvh',v.height+'px');r.setProperty('--vvt',v.offsetTop+'px')};v.addEventListener('resize',u);v.addEventListener('scroll',u);u()}
})();
}catch(e){console.error('MiHelp (chat celular):',e)}

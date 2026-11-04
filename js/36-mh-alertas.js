
/* qualquer aviso de erro ou de "entre na conta" vira uma faixa vermelha e toca um som */
(function(){
const SEL='[role=status],[role=alert],#vMsg,#cMsg,#eqM,#flMsg';
const ERR=/^\s*❌|entre na (sua )?conta|entre como|crie (a sua|sua) conta|não consegui|saia e entre|sessão|senha (incorreta|errada)|telefone inválido|já (tem|indicou|recomendou)|faltou|tente (de novo|amanhã)/i;
const fila=new Set();let t=0;
function checa(){t=0;fila.forEach(el=>{if(!el.isConnected)return;const x=(el.textContent||'').trim();
  if(x&&ERR.test(x)&&!/^\s*✅/.test(x)){if(!el.classList.contains('mh-alerta')||el.dataset.alt!==x){el.classList.add('mh-alerta');el.dataset.alt=x;
    try{if(window.MH_SOM)MH_SOM.tocar('erro',0)}catch(e){}try{el.scrollIntoView({block:'nearest',behavior:'smooth'})}catch(e){}}}
  else{el.classList.remove('mh-alerta');delete el.dataset.alt}});fila.clear()}
new MutationObserver(ms=>{for(const m of ms){let n=m.target;if(n.nodeType===3)n=n.parentElement;if(!n||!n.closest)continue;const el=n.closest(SEL);if(el)fila.add(el)}
 if(fila.size&&!t)t=setTimeout(checa,60)}).observe(document.body,{childList:true,characterData:true,subtree:true});
})();

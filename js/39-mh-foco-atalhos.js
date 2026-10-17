
/* Modo Foco: tocar num atalho escondido mostra o aviso (com botão de sair) em vez de não fazer nada; ao sair, vai para o lugar que a pessoa queria */
(function(){const R=document.documentElement;let pend='';
const alvo=id=>id==='prof'?document.getElementById('need'):document.getElementById(id);
const vis=e=>!!(e&&(e.offsetWidth||e.offsetHeight||e.getClientRects().length));
document.addEventListener('click',e=>{if(!R.classList.contains('modo-foco'))return;
 const b=e.target.closest&&e.target.closest('#mhInicio button[data-go],#dock button[data-dock]');if(!b)return;
 const id=b.dataset.go||({conta:'cadWin',sala:'cw',guia:'vale',carona:'carona',anunciar:'vagas'})[b.dataset.dock]||'';
 if(vis(alvo(id)))return;
 e.preventDefault();e.stopPropagation();pend=id;if(window.MH_avisoFoco)window.MH_avisoFoco()},true);
new MutationObserver(()=>{if(R.classList.contains('modo-foco')||!pend)return;const id=pend;pend='';
 setTimeout(()=>{const t=alvo(id);if(t)t.scrollIntoView({behavior:'smooth',block:'start'})},500)}).observe(R,{attributes:true,attributeFilter:['class']});
})();

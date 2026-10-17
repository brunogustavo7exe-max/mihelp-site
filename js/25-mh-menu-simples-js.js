
(function(){function ini(){const nv=document.querySelector('nav.nv');if(!nv||nv.dataset.simples)return;nv.dataset.simples='1';nv.classList.add('nv-s');
const su=document.getElementById('navSup');if(su){su.textContent='🆘 Suporte';nv.prepend(su)}
const m=document.createElement('button');m.type='button';m.id='navMais';m.className='more';m.setAttribute('aria-expanded','false');m.textContent='ℹ️ Mais informações';
m.onclick=()=>{const o=nv.classList.toggle('nv-aberto');m.setAttribute('aria-expanded',String(o));m.textContent=o?'✕ Fechar':'ℹ️ Mais informações'};
if(su)su.after(m);else nv.prepend(m)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ini);else ini()})();

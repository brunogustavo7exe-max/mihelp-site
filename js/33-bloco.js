document.addEventListener('DOMContentLoaded',function(){var nv=document.querySelector('nav.nv'),g=document.getElementById('cfgBtn');if(!nv||!g)return;
var b=document.createElement('button');b.type='button';b.id='navAjustes';b.className='more';b.textContent='⚙️ Ajustes';b.setAttribute('aria-expanded','false');
b.addEventListener('pointerdown',function(e){e.stopPropagation()});
b.onclick=function(){g.click();b.setAttribute('aria-expanded',String(g.getAttribute('aria-expanded')==='true'))};
document.addEventListener('pointerdown',function(){b.setAttribute('aria-expanded','false')});
var m=document.getElementById('navMais');if(m)m.after(b);else nv.prepend(b)});
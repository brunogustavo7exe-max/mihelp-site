
try{(function(){
const E=document.getElementById('jcE'),D=document.getElementById('jcD');if(!E||!D)return;
const secs=['classificados','voz','gastos'].map(i=>document.getElementById(i)).filter(Boolean);
secs.forEach(s=>s.classList.add('mh-bal'));
const GAP=22,H=el=>el.getBoundingClientRect().height,vis=s=>!s.hidden&&getComputedStyle(s).display!=='none';
let busy=false,t=0,moves=0;
function balancear(){
 if(busy||moves>12)return;
 if(getComputedStyle(E).display==='contents'||getComputedStyle(D).display==='contents')return;
 if(Math.abs(E.getBoundingClientRect().left-D.getBoundingClientRect().left)<20)return;   /* uma coluna só (celular) */
 const ae=document.activeElement;if(ae&&/INPUT|TEXTAREA|SELECT/.test(ae.tagName)&&secs.some(s=>s.contains(ae)))return;
 let le=H(E),ld=H(D);
 secs.forEach(s=>{if(!vis(s))return;const h=H(s)+GAP;if(s.parentNode===E)le-=h;else if(s.parentNode===D)ld-=h});
 const alvo=secs.map(s=>{
  if(!vis(s))return s.parentNode;
  const h=H(s)+GAP;let c=le<=ld?E:D;
  if(Math.abs(le-ld)<90&&(s.parentNode===E||s.parentNode===D))c=s.parentNode;   /* evita ficar trocando de lado */
  if(c===E)le+=h;else ld+=h;return c});
 if(secs.every((s,i)=>s.parentNode===alvo[i]))return;
 busy=true;moves++;secs.forEach((s,i)=>alvo[i].appendChild(s));setTimeout(()=>{busy=false},60);
}
const agenda=()=>{clearTimeout(t);t=setTimeout(balancear,300)};
if(window.ResizeObserver){const ro=new ResizeObserver(agenda);ro.observe(E);ro.observe(D);secs.forEach(s=>ro.observe(s))}
addEventListener('resize',()=>{moves=0;agenda()});addEventListener('load',agenda);agenda();
})()}catch(e){console.error('escadinha:',e)}

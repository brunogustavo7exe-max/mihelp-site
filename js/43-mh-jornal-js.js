
/* MiHelp — Página limpa, como a primeira página de um jornal: o resto só aparece quando a pessoa toca no atalho. "Ver tudo" volta ao modo antigo. */
try{(function(){
const R=document.documentElement,KEY='mh_jornal';
const IDS=['classificados','voz','gastos','carona','vale','cheers','duelo','enquete','instalar','hoje','tutorial','aovivo','guilda','reputacao','saiba','taxas','guia-chat','seguranca','privacidade','fliperama','duvidas','quem','apoie','patrocinio'];
const lerModo=()=>{try{return localStorage.getItem(KEY)==='limpo'?'limpo':'tudo'}catch(e){return 'tudo'}};
const gravaModo=v=>{try{localStorage.setItem(KEY,v)}catch(e){}};
const st=document.createElement('style');
st.textContent='html.jn section.jn-s:not(.jn-o){display:none!important}html.jn section.jn-o{display:block!important}.jn-bar{display:flex;justify-content:flex-end;margin:0 0 8px}.jn-bar button{font:600 14px var(--sans,system-ui);padding:8px 14px;border-radius:999px;border:1px solid var(--line,#8886);background:transparent;color:inherit;cursor:pointer}';
document.head.append(st);
IDS.forEach(id=>{const e=document.getElementById(id);if(e)e.classList.add('jn-s')});
const ligado=()=>R.classList.contains('jn');
const topo=()=>{const t=document.getElementById('mhInicio')||document.body;t.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})};
function fechaTudo(){document.querySelectorAll('section.jn-o').forEach(x=>x.classList.remove('jn-o'))}
function barra(s){if(s.querySelector(':scope>.jn-bar'))return;const b=document.createElement('div');b.className='jn-bar';const x=document.createElement('button');x.type='button';x.textContent='← Voltar ao início';x.onclick=()=>{fechaTudo();topo()};b.append(x);s.prepend(b)}
function abreSecao(el){if(!ligado())return;const s=el.closest&&el.closest('section.jn-s');if(!s)return;document.querySelectorAll('section.jn-o').forEach(x=>{if(x!==s)x.classList.remove('jn-o')});s.classList.add('jn-o');barra(s)}
const DOCK={guia:'vale',carona:'carona',anunciar:'vagas'};
/* captura: abre a seção ANTES dos outros códigos do site rolarem até ela. No Modo Foco quem manda é o aviso do próprio Modo Foco. */
document.addEventListener('click',e=>{
 if(R.classList.contains('modo-foco'))return;
 const a=e.target.closest&&e.target.closest('[data-go],#dock button[data-dock]');if(!a)return;
 const id=a.dataset.go||DOCK[a.dataset.dock]||'';if(!id||id==='prof')return;
 const el=document.getElementById(id);if(el)abreSecao(el)},true);
/* botão "Ver tudo" / "Esconder" (8 letras cada) junto dos atalhos grandes */
const nav=document.getElementById('mhInicio');
function pinta(){const b=document.getElementById('jnTog');if(!b)return;const lim=ligado();b.textContent='';const i=document.createElement('span');i.textContent=lim?'📰':'🧹';b.append(i,lim?'Ver tudo':'Esconder');b.setAttribute('aria-pressed',lim?'false':'true')}
if(nav){const b=document.createElement('button');b.type='button';b.id='jnTog';b.onclick=()=>{if(ligado()){R.classList.remove('jn');gravaModo('tudo')}else{R.classList.add('jn');fechaTudo();gravaModo('limpo')}pinta()};nav.append(b)}
if(lerModo()==='limpo')R.classList.add('jn');
pinta();
/* quem chega por um link já apontando para uma seção (ex.: #classificados) vê essa seção */
const h=location.hash.slice(1);if(h){const el=document.getElementById(h);if(el)abreSecao(el)}
})()}catch(e){console.error('jornal:',e)}

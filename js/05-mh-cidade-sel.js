
(function(){
var DEF={slug:'barra-do-garcas',nome:'Barra do Garças',uf:'MT'};
var LEG={'barra do garcas|MT':'barra-do-garcas','pontal do araguaia|MT':'pontal-do-araguaia','aragarcas|GO':'aragarcas'};
var UFS='AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
function norm(t){return String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
function slugOf(n,uf){var k=norm(n)+'|'+uf;if(LEG[k])return LEG[k];return norm(n).replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')+'-'+uf.toLowerCase()}
var c=DEF;try{var j=JSON.parse(localStorage.getItem('mh_cidade_sel')||'null');if(j&&j.slug&&j.nome&&j.uf)c=j}catch(e){}
window.MH_CIDADE=c;window.MH_SLUG=slugOf;window.MH_SALA=function(x){return c.slug===DEF.slug?x:x+'@'+c.slug};
function init(){
 var css=document.createElement('style');css.textContent='#mhCidBar{position:relative;display:flex;justify-content:flex-end;margin:6px 0 10px;font:600 14px var(--sans,system-ui)}#mhCidBtn{min-height:34px;max-width:100%;padding:4px 12px;border-radius:999px;border:1px solid var(--line,#444);background:var(--surf,#222);color:var(--text,#eee);font:600 13px var(--sans,system-ui);cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#mhCidBtn:hover,#mhCidBtn[aria-expanded=true]{border-color:var(--gold,#c9a24b)}#mhCidPan{position:absolute;top:calc(100% + 6px);right:0;z-index:60;display:none;flex-direction:column;gap:8px;width:min(92vw,300px);padding:12px;border-radius:14px;border:1px solid var(--line,#444);background:var(--surf,#222);box-shadow:0 10px 28px rgba(0,0,0,.35)}#mhCidPan.on{display:flex}#mhCidPan select{width:100%;font:inherit;min-height:38px;padding:4px 10px;border-radius:10px;border:1px solid var(--line,#444);background:var(--bg,#111);color:var(--text,#eee)}#vCid{display:none!important}nav.nv #mhCidBar{margin:0 0 0 auto;flex:0 0 auto}nav.nv #mhCidBtn{min-height:42px;padding:6px 16px;font-size:14px}';document.head.append(css);
 var bar=document.createElement('div');bar.id='mhCidBar';
 var lb=document.createElement('span');lb.textContent='📍 Você está em:';
 var su=document.createElement('select');su.setAttribute('aria-label','Estado');
 UFS.forEach(function(u){var o=document.createElement('option');o.value=u;o.textContent=u;su.append(o)});su.value=c.uf;
 var sc=document.createElement('select');sc.className='mhc-c';sc.setAttribute('aria-label','Cidade');
 var bt=document.createElement('button');bt.type='button';bt.id='mhCidBtn';bt.setAttribute('aria-expanded','false');bt.setAttribute('aria-controls','mhCidPan');bt.textContent='📍 '+c.nome+' · '+c.uf+' ▾';
 var pan=document.createElement('div');pan.id='mhCidPan';pan.append(lb,su,sc);bar.append(bt,pan);
 function fecha(){pan.classList.remove('on');bt.setAttribute('aria-expanded','false')}
 bt.onclick=function(e){e.stopPropagation();var o=pan.classList.toggle('on');bt.setAttribute('aria-expanded',String(o))};
 document.addEventListener('click',function(e){if(!bar.contains(e.target))fecha()});document.addEventListener('keydown',function(e){if(e.key==='Escape')fecha()});
 var nv=document.querySelector('nav.nv');if(nv)nv.append(bar);else{var h=document.querySelector('header.top');if(h)h.insertAdjacentElement('afterend',bar);else document.body.prepend(bar)}
 function opt(v,t,sel){var o=document.createElement('option');o.value=v;o.textContent=t;if(sel)o.selected=true;sc.append(o)}
 function carregar(uf){sc.textContent='';opt('','Carregando…');
  fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados/'+uf+'/municipios?orderBy=nome').then(function(r){return r.json()}).then(function(l){
   sc.textContent='';if(uf!==c.uf)opt('','Escolha a cidade');
   l.forEach(function(m){opt(m.nome,m.nome,uf===c.uf&&m.nome===c.nome)})}).catch(function(){sc.textContent='';if(uf===c.uf)opt(c.nome,c.nome,true);else opt('','Sem conexão, tente de novo')})}
 su.onchange=function(){carregar(su.value)};
 sc.onchange=function(){if(!sc.value)return;var n={slug:slugOf(sc.value,su.value),nome:sc.value,uf:su.value};
  try{localStorage.setItem('mh_cidade_sel',JSON.stringify(n))}catch(e){}location.reload()};
 carregar(c.uf);
 /* cadastro: a cidade é a que está escolhida */
 var cid=document.getElementById('cid');if(cid){cid.textContent='';var o=document.createElement('option');o.value=c.nome;o.textContent=c.nome+' · '+c.uf;o.selected=true;cid.append(o)}
 /* textos que citavam só a região antiga */
 {var N=c.nome;
  var mq=document.querySelector('.mq');if(mq)mq.innerHTML=mq.innerHTML.split('BARRA DO GARÇAS · PONTAL DO ARAGUAIA · ARAGARÇAS').join(N.toUpperCase()+' · '+c.uf);
  var sb=document.querySelector('p.sub');if(sb)sb.textContent=sb.textContent.replace('de Barra do Garças, Pontal do Araguaia e Aragarças','de '+N);
  document.querySelectorAll('span').forEach(function(e){if(e.children.length===0&&e.textContent==='MiHelp · Barra do Garças e região')e.textContent='MiHelp · '+N});
  var md=document.querySelector('meta[name=description]');if(md)md.content='MiHelp: quem precisa de ajuda encontra, quem sabe fazer trabalha. Profissionais, guia, caronas e chat em '+N+'.'}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();


(function(){
var DEF={slug:'barra-do-garcas',nome:'Barra do Garças',uf:'MT'};
var LEG={'barra do garcas|MT':'barra-do-garcas','pontal do araguaia|MT':'pontal-do-araguaia','aragarcas|GO':'aragarcas'};
var UFS='AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
function norm(t){return String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
function slugOf(n,uf){var k=norm(n)+'|'+uf;if(LEG[k])return LEG[k];return norm(n).replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')+'-'+uf.toLowerCase()}
var c=DEF;try{var j=JSON.parse(localStorage.getItem('mh_cidade_sel')||'null');if(j&&j.slug&&j.nome&&j.uf)c=j}catch(e){}
window.MH_CIDADE=c;window.MH_SLUG=slugOf;window.MH_SALA=function(x){return c.slug===DEF.slug?x:x+'@'+c.slug};
function init(){
 var css=document.createElement('style');css.textContent='#mhCidBar{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:8px 0 12px;font:600 14px var(--sans,system-ui)}#mhCidBar select{font:inherit;min-height:38px;padding:4px 10px;border-radius:10px;border:1px solid var(--line,#444);background:var(--surf,#222);color:var(--text,#eee);max-width:100%}#mhCidBar .mhc-c{flex:1 1 180px}#vCid{display:none!important}';document.head.append(css);
 var bar=document.createElement('div');bar.id='mhCidBar';
 var lb=document.createElement('span');lb.textContent='📍 Você está em:';
 var su=document.createElement('select');su.setAttribute('aria-label','Estado');
 UFS.forEach(function(u){var o=document.createElement('option');o.value=u;o.textContent=u;su.append(o)});su.value=c.uf;
 var sc=document.createElement('select');sc.className='mhc-c';sc.setAttribute('aria-label','Cidade');
 bar.append(lb,su,sc);
 var h=document.querySelector('header.top');if(h)h.insertAdjacentElement('afterend',bar);else document.body.prepend(bar);
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

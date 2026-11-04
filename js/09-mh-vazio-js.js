
/* estados vazios com convite, erro com "tentar de novo" e esqueleto de carregamento */
window.MH_ESQ=function(box,n){var w=document.createElement('div');w.className='mh-esq';w.setAttribute('aria-hidden','true');for(var i=0;i<(n||3);i++){w.append(document.createElement('i'))}box.append(w);var s=document.createElement('span');s.className='mh-sr';s.setAttribute('role','status');s.textContent='Carregando…';box.append(s)};
window.MH_VAZIO=function(box,o){var c=document.createElement('div');c.className='mh-vazio'+(o.erro?' erro':'');
 var i=document.createElement('span');i.className='mh-vi';i.setAttribute('aria-hidden','true');i.textContent=o.ic||'✨';
 var t=document.createElement('b');t.textContent=o.t||'';var p=document.createElement('p');p.textContent=o.p||'';c.append(i,t,p);
 if(o.cta&&o.fn){var b=document.createElement('button');b.type='button';b.className='mh-vb';b.textContent=o.cta;b.onclick=o.fn;c.append(b)}
 box.append(c)};
/* clica no botão de uma seção pelo texto (reaproveita o botão que já existe) */
window.MH_CLICA=function(secId,re){return function(){var s=document.getElementById(secId);if(!s)return;var b=[].slice.call(s.querySelectorAll('button')).find(function(x){return re.test(x.textContent)});if(b)b.click()}};

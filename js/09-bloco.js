
try{
(function(){
  const M=[
    {p:'Sr. Paulo',g:'TRABALHO',t:'Repositor para trabalho temporário',d:'Mercado da cidade procura repositor por alguns dias.',v:'diária a combinar'},
    {p:'Dona Lúcia',g:'RECOMPENSA',t:'Gato desaparecido',d:'Sumiu perto da praça. Publique só informações seguras.',v:'recompensa'},
    {p:'Bia S.',g:'SERVIÇO',t:'Ajuda com mudança de móveis',d:'Desmontar e transportar móveis para outro endereço.',v:'a combinar'},
    {p:'Tiago R.',g:'ACHADOS E PERDIDOS',t:'Chave perdida perto da praça',d:'Chaveiro com chaveiro azul. Quem achar combina a devolução.',v:'recompensa'}
  ];
  window.MH_MISSOES=M;
  if((window.MH_FLOOR||{}).guilda)M.length=0;
  const gl=document.getElementById('gdList'),gm=document.getElementById('gdMsg');
  if(gl){M.forEach(m=>{
    const c=document.createElement('div');c.className='gc';
    const a=document.createElement('div');a.className='gt';a.textContent=m.g;
    const h=document.createElement('h3');h.textContent=m.t;
    const p=document.createElement('p');p.textContent=m.d;
    const r=document.createElement('div');r.className='gm';
    const v=document.createElement('span');v.className='gv';v.textContent=m.v;
    const b=document.createElement('button');b.type='button';b.textContent='Falar com '+m.p;
    b.addEventListener('click',()=>{
      if(window.MH_missao&&window.MH_missao(m.p,m.t)){if(gm)gm.textContent='Conversa aberta com '+m.p+' no chat (aba privada).';const cw=document.getElementById('cw');if(cw)cw.scrollIntoView({behavior:'smooth',block:'center'})}
      else{if(gm)gm.textContent='Cadastre-se no formulário para falar com '+m.p+', quem publicou esta missão.';const r=document.getElementById('reg');if(r)r.scrollIntoView({behavior:'smooth',block:'center'})}});
    r.append(v,b);c.append(a,h,p,r);gl.append(c)})}

  const L=document.getElementById('lvList');let k=0;
  const hh=d=>d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  const pess=()=>{try{return MH_UI.pessoas().filter(p=>p.bot)}catch(e){return []}};
  const rola=(id,fn)=>()=>{const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:'smooth',block:'center'});if(fn)fn()};
  function evento(){
    const n=k++,H=pess().filter(p=>p.role==='helper'),A=pess(),t=n%4;
    if(t===0&&H.length){const h=H[Math.floor(n/4)%H.length];return {t:h.nome+' ficou disponível',s:h.work+' · toque para ver o perfil',u:h.nome}}
    if(t===1||t===3){const m=M[Math.floor(n/2)%M.length];return {t:'Nova missão: '+m.t,s:m.v+' · toque para ver na Guilda',go:()=>{const c=[...document.querySelectorAll('#gdList .gc')].find(c=>{const h=c.querySelector('h3');return h&&h.textContent===m.t});if(c){c.scrollIntoView({behavior:'smooth',block:'center'});c.classList.add('flash');setTimeout(()=>c.classList.remove('flash'),2500)}else rola('guilda')()}}}
    if(t===2&&A.length&&n%8===2){const a=A[n%A.length];return {t:a.nome+' entrou na Sala do Vale',s:'toque para abrir o chat',go:rola('cw')}}
    return {t:'Vaga aberta no outdoor digital',s:'a partir de R$ 5 · toque para ver',go:rola('apoie')}}
  function add(d,novo){
    const e=evento(),row=document.createElement('button');row.type='button';row.className='ev'+(novo?' novo':'');
    if(e.u)row.dataset.u=e.u;else row.addEventListener('click',e.go);
    const t=document.createElement('time');t.textContent=hh(d);
    const w=document.createElement('div'),b=document.createElement('b'),s=document.createElement('span');
    b.textContent=e.t;s.textContent=e.s;w.append(b,s);row.append(t,w);L.prepend(row);
    while(L.children.length>6)L.lastChild.remove();
    if(novo)setTimeout(()=>row.classList.remove('novo'),4000);
  }
  if(L){
    const n=Date.now();for(let i=4;i>=1;i--)add(new Date(n-i*3*60000),false);
    setInterval(()=>{if(document.hidden)return;add(new Date(),true)},9000);
  }
  const fab=document.getElementById('chatFab'),x=document.getElementById('cwExp');
  if(fab&&x)fab.addEventListener('click',()=>{if(x.getAttribute('aria-pressed')!=='true')x.click()});
})();
}catch(e){console.error('MiHelp (ao vivo e guilda):',e)}


/* MiHelp — pulse, cidade, fundador, dock mobile */
try{(function(){
const CIDADES=['Barra do Garças','Pontal do Araguaia','Aragarças','Outra'];
const shortCity=c=>({
  'Barra do Garças':'Barra',
  'Pontal do Araguaia':'Pontal',
  'Aragarças':'Aragarças',
  'Outra':'Região'
})[c]||'Vale';

/* Números REAIS vindos do servidor (/stats). Sem servidor, mostra "—" em vez de inventar. */
const STATS={cad:null,help:null};
function accLocal(){
  try{return Object.values(JSON.parse(localStorage.getItem('mh_acc')||'{}')||{})}catch(e){return []}
}
/* número de fundador = posição REAL no cadastro, dada pelo servidor (0 = ainda não sabemos) */
function fundadorDe(nome){
  try{const n=Number(localStorage.getItem('mh_num:'+String(nome||'').toLowerCase()));return n>0?n:0}catch(e){return 0}
}
window.MH_numChegou=function(nome,num){
  try{num=Number(num);if(nome&&num>0)localStorage.setItem('mh_num:'+String(nome).toLowerCase(),String(num))}catch(e){}
  setTimeout(function(){try{const UI=window.MH_UI,eu=UI&&UI.eu&&UI.eu();if(eu&&nome&&eu.nome===nome){eu.fundador=fundadorDe(nome);enriquecerPerfil()}}catch(e){}},400);
};
function cidadeDe(nome){
  try{return localStorage.getItem('mh_cid:'+String(nome||'').toLowerCase())||''}catch(e){return ''}
}
function setCidade(nome,cid){
  try{if(nome&&cid)localStorage.setItem('mh_cid:'+String(nome).toLowerCase(),cid)}catch(e){}
}

function pintarPulse(){
  const cad=document.getElementById('pCad');
  const on=document.getElementById('pOn');
  const help=document.getElementById('pHelp');
  if(!cad)return;
  let nOn=0;
  try{const UI=window.MH_UI;if(UI&&UI.realN)nOn=UI.realN()}catch(e){}
  const W=window.MH_STATS_WIX||{};
  const pega=(a,b)=>(a==null&&b==null)?'—':String(Math.max(a==null?0:a,b==null?0:b));
  cad.textContent=pega(STATS.cad,W.cad);
  help.textContent=pega(STATS.help,W.help);
  on.textContent=String(Math.max(nOn,0));
}
window.MH_pintarPulse=pintarPulse;
async function carregarStats(){
  try{
    const A=window.MH_API;if(!A||!A.on()||STATS._404)return;
    const r=await A.req('/stats',{ms:8000});if(r.status===404)STATS._404=1;
    try{window.MH_diag&&MH_diag('worker /stats: '+(r.ok&&r.j&&r.j.ok?'ok':'HTTP '+r.status),!(r.ok&&r.j&&r.j.ok))}catch(e){}
    if(r.ok&&r.j&&r.j.ok){STATS.cad=Number(r.j.cad)||0;STATS.help=Number(r.j.helpers)||0;pintarPulse();try{hydrateEu()}catch(e){}}else if(STATS.cad==null&&!STATS._r){STATS._r=1;setTimeout(function(){STATS._r=0;carregarStats()},8000)}
  }catch(e){}
}

function shareZap(){
  const txt='Entrei no MiHelp — a feira digital do Vale do Araguaia (Barra, Pontal e Aragarças). Cadastro grátis, chat, guia, caronas e outdoors. Vem comigo: '+location.href.split('#')[0];
  const url='https://wa.me/?text='+encodeURIComponent(txt);
  window.open(url,'_blank','noopener');
}

/* Dock mobile */
function setupDock(){
  const dock=document.getElementById('dock');
  if(!dock)return;
  document.body.classList.add('has-dock');
  function go(id){
    const el=document.getElementById(id);
    if(!el)return;
    try{if(id==='cadWin'&&window.MH_abrirConta)MH_abrirConta()}catch(e){}
    el.scrollIntoView({behavior:'smooth',block:'start'});
    if(id==='cw'){
      try{const w=document.getElementById('cw');if(w)w.classList.remove('fechada')}catch(e){}
    }
    if(id==='cadWin'){
      try{const w=document.getElementById('cadWin');if(w)w.classList.remove('fechada')}catch(e){}
    }
  }
  dock.querySelectorAll('[data-dock]').forEach(b=>{
    b.addEventListener('click',()=>{
      const k=b.dataset.dock;
      dock.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));
      if(k==='conta')go('cadWin');
      if(k==='sala')go('cw');
      if(k==='guia')go('vale');if(k==='carona')go('carona');
      if(k==='anunciar'){
        go('vagas');
        setTimeout(()=>{const btn=document.querySelector('#vgrid .vg.open');if(btn)btn.click()},400);
      }
    });
  });
}

/* Esconde cidade no modo login */
function syncCidLogin(){
  const f=document.getElementById('cidF');
  if(!f)return;
  const login=document.getElementById('segEntrar')&&document.getElementById('segEntrar').getAttribute('aria-pressed')==='true';
  f.style.display=login?'none':'';
  const cid=document.getElementById('cid');
  if(cid)cid.required=!login;
}

/* Hook no cadastro: cidade + fundador */
function patchCadastro(){
  const form=document.getElementById('f');
  if(!form||form._mhPulse)return;
  form._mhPulse=1;
  form.addEventListener('submit',function(ev){
    try{
      const login=document.getElementById('segEntrar')&&document.getElementById('segEntrar').getAttribute('aria-pressed')==='true';
      if(!login){
        const cidEl=document.getElementById('cid');
        if(cidEl&&!cidEl.value){
          ev.preventDefault();ev.stopImmediatePropagation();
          const ferr=document.getElementById('ferr');
          if(ferr){ferr.style.display='block';ferr.textContent='Escolha sua cidade no Vale.';}
          cidEl.focus();return;
        }
      }
    }catch(e){}
    setTimeout(function(){
      try{
        const UI=window.MH_UI, eu=UI&&UI.eu&&UI.eu();
        if(!eu)return;
        const cidEl=document.getElementById('cid');
        const cid=cidEl&&cidEl.value;
        if(cid){setCidade(eu.nome,cid);eu.cidade=cid}
        eu.fundador=fundadorDe(eu.nome);
        try{localStorage.setItem('mh_eu',JSON.stringify({nome:eu.nome,role:eu.role,work:eu.work,cidade:eu.cidade,fundador:eu.fundador}))}catch(e){}
        enriquecerPerfil();
        pintarPulse();
        setTimeout(carregarStats,4000);
        try{if(window.MH_hideIntro)MH_hideIntro()}catch(e){}
      }catch(e){}
    },80);
  },true);
  ['segCriar','segEntrar','jaTenho'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.addEventListener('click',()=>setTimeout(syncCidLogin,0));
  });
  syncCidLogin();
}

function enriquecerPerfil(){
  const reg=document.getElementById('reg');
  if(!reg||!reg.classList.contains('meu-perfil'))return;
  const UI=window.MH_UI, eu=UI&&UI.eu&&UI.eu();
  if(!eu)return;
  if(!eu.fundador)eu.fundador=fundadorDe(eu.nome);
  if(!eu.cidade)eu.cidade=cidadeDe(eu.nome);
  {const bx=reg.querySelector('.fund-badge');if(bx){bx.textContent=eu.fundador?('Fundador #'+eu.fundador):'Conta criada';return}}
  const h3=reg.querySelector('h3');
  if(!h3)return;
  const wrap=document.createElement('div');
  wrap.style.margin='4px 0 10px';
  const badge=document.createElement('span');
  badge.className='fund-badge';
  badge.textContent=eu.fundador?('Fundador #'+eu.fundador):'Conta criada';
  wrap.appendChild(badge);
  if(eu.cidade){
    const c=document.createElement('span');
    c.className='city-badge';
    c.textContent=shortCity(eu.cidade);
    wrap.appendChild(c);
  }
  (h3.parentElement&&h3.parentElement.classList.contains('mhp-hd')?h3.parentElement:h3).after(wrap);
}

/* Empty state da lista online */
function patchOnlineEmpty(){
  const w=document.getElementById('wholist');
  if(!w)return;
  const obs=new MutationObserver(()=>{
    const sm=w.querySelector('small');
    if(sm && /Ninguém por enquanto/i.test(sm.textContent||'')){
      sm.textContent='Sala quieta — entra e manda um oi. Helpers e clientes do Vale aparecem aqui.';
    }
    pintarPulse();
  });
  obs.observe(w,{childList:true,subtree:true});
}

/* WhatsApp link do formulário */
function patchWa(){
  document.querySelectorAll('a.wa').forEach(a=>{
    a.addEventListener('click',function(e){
      e.preventDefault();
      shareZap();
    });
  });
  const btn=document.getElementById('pShare');
  if(btn)btn.addEventListener('click',shareZap);
}

/* Restaura cidade/fundador ao reentrar */
function hydrateEu(){
  try{
    const UI=window.MH_UI, eu=UI&&UI.eu&&UI.eu();
    if(!eu)return;
    if(!eu.cidade)eu.cidade=cidadeDe(eu.nome);
    if(!eu.fundador)eu.fundador=fundadorDe(eu.nome);
    enriquecerPerfil();
  }catch(e){}
}


function setupIntroDismiss(){
  const KEY='mh_intro_hide';
  const pack=document.getElementById('introPack');
  const mini=document.getElementById('introMini');
  const hide=document.getElementById('introHide');
  const show=document.getElementById('introShow');
  if(!pack||!mini)return;
  function apply(hidden){
    pack.classList.toggle('is-hidden',!!hidden);
    mini.hidden=!hidden;
    try{localStorage.setItem(KEY,hidden?'1':'0')}catch(e){}
  }
  window.MH_hideIntro=()=>apply(true);
  let saved=false;
  try{saved=localStorage.getItem(KEY)==='1'}catch(e){}
  /* quem já tem conta neste aparelho: intro some sozinha */
  try{
    const sess=sessionStorage.getItem('mh_sess')||localStorage.getItem('mh_sess');
    const tk=localStorage.getItem('mh_tk')||sessionStorage.getItem('mh_tk');
    if(sess||tk) saved=true;
  }catch(e){}
  apply(saved);
  if(hide)hide.onclick=()=>apply(true);
  if(show)show.onclick=()=>apply(false);
}


function setupNeed(){
  const row=document.getElementById('needRow');
  if(!row||row._ok)return;row._ok=1;
  const ofs=[['⚡','Eletricista'],['🚰','Encanador'],['🧹','Diarista'],['🧱','Pedreiro'],['🎨','Pintor'],['❄️','Ar-condicionado'],['🔧','Mecânico'],['🛞','Borracheiro'],['🔑','Chaveiro'],['🔥','Gás'],['🔲','Azulejista']];
  ofs.push(['✏️','Outro']);
  const irChat=()=>{const cw=document.getElementById('cw');if(cw){cw.classList.remove('fechada');cw.scrollIntoView({behavior:'smooth',block:'start'})}};
  let tm=0,toast=null;
  function aviso(txt,cancel){
    if(!toast){toast=document.createElement('div');toast.id='sosToast';toast.setAttribute('role','status');document.body.append(toast)}
    toast.textContent='';const sp=document.createElement('span');sp.textContent=txt;toast.append(sp);
    if(cancel){const c=document.createElement('button');c.type='button';c.textContent='Cancelar';c.onclick=cancel;toast.append(c)}
    toast.hidden=false}
  function fim(txt){clearTimeout(tm);if(txt){aviso(txt);tm=setTimeout(()=>{if(toast)toast.hidden=true},5000)}else if(toast)toast.hidden=true}
  function disparar(cat,direto){
    cat=({'Eletricista':'Elétrica','Gás':'Gás de cozinha'})[cat]||cat;
    const som=(x)=>{try{window.MH_SOM&&MH_SOM.tocar(x,0)}catch(e){}};
    let n=direto?0:4;const tick=()=>{
      if(n>0)som(n===1?'ping':'tick');
      aviso('🆘 Enviando SOS de '+cat.toLowerCase()+' em '+n+'s…',()=>{som('soft');fim('SOS cancelado.')});
      if(n<=0){const r=window.MH_SOS_AUTO?MH_SOS_AUTO(cat):'login';irChat();
        if(r==='ok'){som('sos');fim('✅ SOS enviado para os helpers de '+cat.toLowerCase()+'.')}
        else if(r==='limite'){som('erro');fim('Você já usou os 5 SOS de hoje. Escreva na sala.')}
        else{som('erro');fim('Para pedir SOS, entre ou faça o cadastro rápido no chat. É grátis.')}
        return}
      n--;tm=setTimeout(tick,1000)};
    clearTimeout(tm);tick()}
  function outro(){
    let d=document.getElementById('outroDlg');
    if(!d){d=document.createElement('dialog');d.id='outroDlg';d.setAttribute('aria-label','Outro serviço');
      const h=document.createElement('h3');h.textContent='Do que você precisa?';
      const p=document.createElement('p');p.className='note';p.textContent='Escreva o serviço. Ao tocar em Enviar, o SOS vai para os helpers dessa área.';
      const i=document.createElement('input');i.type='text';i.maxLength=30;i.placeholder='Ex.: advogado, fotógrafo';i.autocomplete='off';i.setAttribute('aria-label','Serviço que você precisa');
      const g=document.createElement('button');g.type='button';g.className='go';g.textContent='🆘 Enviar SOS';g.style.cssText='background:var(--red);color:#fff';
      const c=document.createElement('button');c.type='button';c.className='cx';c.textContent='Cancelar';
      const bt=document.createElement('div');bt.className='dbt';bt.append(g,c);
      const ok=()=>{const v=i.value.trim();if(!v){i.focus();return}d.close();i.value='';disparar(v)};
      g.onclick=ok;c.onclick=()=>d.close();i.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ok()}});
      d.addEventListener('click',e=>{if(e.target===d)d.close()});
      d.append(h,p,i,bt);document.body.append(d)}
    d.showModal();setTimeout(()=>{const i=d.querySelector('input');if(i)i.focus()},50)}
  /* 1º toque: mostra os profissionais da categoria · 2º toque (só nas urgentes): pergunta se é emergência e só então manda o SOS */
  const URG=['Eletricista','Encanador','Chaveiro','Gás','Borracheiro'];
  let sel='';const info=document.createElement('div');info.id='needInfo';info.hidden=true;row.after(info);
  const filtra=v=>{const q=document.getElementById('profQ');if(q){q.value=v||'';q.dispatchEvent(new Event('input'))}};
  const marca=o=>{sel=o;row.querySelectorAll('.need-cat').forEach(b=>b.classList.toggle('on',b.dataset.cat===o))};
  const limpa=()=>{marca('');filtra('');info.hidden=true;info.textContent=''};
  function mostraInfo(o){
    info.textContent='';const t=document.createElement('span');t.textContent='Mostrando '+o+' em Profissionais do Vale.';info.append(t);
    if(URG.includes(o)){const sb=document.createElement('button');sb.type='button';sb.className='ni-sos';sb.textContent='🆘 SOS '+o;sb.onclick=()=>confirmaSos(o);info.append(sb)}
    const x=document.createElement('button');x.type='button';x.className='ni-x';x.textContent='Limpar';x.onclick=limpa;info.append(x);
    const d=document.createElement('small');d.textContent=URG.includes(o)?'É emergência de verdade? Toque de novo em '+o+' ou no botão vermelho.':o+' não é emergência: chame um profissional da lista.';info.append(d);
    info.hidden=false}
  function confirmaSos(o){
    let d=document.getElementById('sosConfDlg');
    if(!d){d=document.createElement('dialog');d.id='sosConfDlg';d.setAttribute('aria-label','Confirmar SOS');document.body.append(d);d.addEventListener('click',e=>{if(e.target===d)d.close()})}
    d.textContent='';
    const h=document.createElement('h3');h.textContent='É emergência agora?';
    const p=document.createElement('p');p.className='note';p.textContent='O SOS de '+o.toLowerCase()+' avisa os helpers dessa área na hora e conta no seu limite de 5 por dia. Risco de vida, fogo ou cheiro forte de gás: ligue 193, 192 ou 190.';
    const g=document.createElement('button');g.type='button';g.className='go';g.style.cssText='background:var(--red);color:#fff';g.textContent='Sim, enviar SOS de '+o.toLowerCase();
    const c=document.createElement('button');c.type='button';c.className='cx';c.textContent='Não, foi sem querer';
    const bt=document.createElement('div');bt.className='dbt';bt.append(g,c);
    g.onclick=()=>{d.close();disparar(o,true)};c.onclick=()=>d.close();
    d.append(h,p,bt);d.showModal()}
  function toque(o){
    if(sel===o){if(URG.includes(o))confirmaSos(o);else fim(o+' não é emergência. Chame um profissional da lista ou escreva na sala.');return}
    marca(o);filtra(o);mostraInfo(o);
    const pr=document.getElementById('prof');if(pr)pr.scrollIntoView({behavior:'smooth',block:'nearest'})}
  /* cor e posição dos ofícios: o ADM escolhe na aba "Ofícios" (guardado em mihelp_adm_v1:ofi_cfg) */
  const CK='mihelp_adm_v1:ofi_cfg',HEX=/^#[0-9a-f]{6}$/i;
  const lerCfg=()=>{try{const c=JSON.parse(localStorage.getItem(CK)||'{}')||{};return{ord:Array.isArray(c.ord)?c.ord.map(String):[],cor:c.cor&&typeof c.cor==='object'?c.cor:{}}}catch(e){return{ord:[],cor:{}}}};
  const OUTRO=ofs.find(x=>x[1]==='Outro');
  const lista=()=>{const c=lerCfg(),base=ofs.filter(x=>x[1]!=='Outro');
    const pos=n=>{const i=c.ord.indexOf(n);return i<0?1000+base.findIndex(x=>x[1]===n):i};
    return base.slice().sort((a,b)=>pos(a[1])-pos(b[1]))};
  const txtSobre=h=>{const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return (r*299+g*587+b*114)/1000>150?'#111':'#fff'};
  function desenha(){
    row.textContent='';const c=lerCfg();
    const L0=lista(),sosL=L0.filter(x=>URG.includes(x[1])),resto=L0.filter(x=>!URG.includes(x[1]));
    const sep=t=>{const p=document.createElement('p');p.className='need-sep';p.textContent=t;row.appendChild(p)};
    const seq=[];if(sosL.length){seq.push(['sep','🆘 Urgência: avisa os helpers na hora']);sosL.forEach(x=>seq.push(x))}
    seq.push(['sep','Serviços do dia a dia']);resto.forEach(x=>seq.push(x));seq.push(OUTRO);
    seq.forEach(([ic,o])=>{
      if(ic==='sep'){sep(o);return}
      const b=document.createElement('button');
      b.type='button';b.className='need-cat';b.dataset.cat=o;b.setAttribute('aria-label',o==='Outro'?'Outro serviço':'Ver profissionais de '+o+(URG.includes(o)?'. Toque de novo para pedir SOS':''));
      const a=document.createElement('span');a.className='nc-ic';a.textContent=ic;a.setAttribute('aria-hidden','true');
      const t=document.createElement('span');t.className='nc-t';t.textContent=o;b.append(a,t);
      const cor=c.cor[o];if(HEX.test(cor||'')){b.style.background=cor;b.style.borderColor=cor;b.style.color=txtSobre(cor)}
      if(URG.includes(o)){const s=document.createElement('span');s.className='nc-sos';s.textContent='🆘';s.setAttribute('aria-hidden','true');b.append(s)}
      b.onclick=()=>{try{window.MH_SOM&&MH_SOM.tocar(o==='Outro'?'abre':'pop',0)}catch(e){}o==='Outro'?outro():toque(o)};
      row.appendChild(b)});
    marca(sel)}
  desenha();
  window.MH_OFI={lista:()=>lista().map(x=>x.slice()),cfg:lerCfg,desenha,sos:o=>URG.includes(o)};

  /* ===== aba Categorias: grupos de serviços, busca e "Novos no Vale" (ofícios que os helpers escrevem no cadastro) ===== */
  const box=document.getElementById('need'),tabs=document.getElementById('needTabs'),cats=document.getElementById('needCats');
  if(!box||!tabs||!cats)return;
  const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  const GRUPOS=[
   ['🚜','Máquinas e terra',[['Operador de máquinas pesadas','maquinas pesadas','🚧'],['Operador de máquinas agrícolas','maquinas agricolas','🌾'],['Tratorista','trator','🚜'],['Operador de empilhadeira','empilhadeira','🏭'],['Operador de retroescavadeira','retroescavadeira','🚧'],['Operador de mini escavadeira','mini escavadeira','⛏️'],['Operador de bobcat','bobcat','🚜'],['Operador de escavadeira','escavadeira','⛏️'],['Operador de pá carregadeira','pa carregadeira','🚜'],['Operador de motoniveladora','motoniveladora','🚧'],['Operador de rolo compactador','rolo compactador','🚧'],['Operador de munck','munck','🏗️'],['Operador de guindaste','guindaste','🏗️'],['Operador de colheitadeira','colheitadeira','🌾'],['Furador de poço','poco','🕳️'],['Limpador de lote','lote','🌿'],['Terraplanagem','terraplan','🏗️'],['Caminhão pipa','pipa','💧'],['Roçador','rocador','🌿'],['Cercador','cercador','🪵'],['Máquinas pesadas','maquinas pesadas','🚧'],['Máquinas agrícolas','agricolas','🌾'],['Empilhadeira','empilhadeira','🏭'],['Retroescavadeira','retroescav','🚧'],['Mini escavadeira','mini escav','⛏️'],['Bobcat','bobcat','🚜'],['Munck e guindaste','munck','🏗️']]],
   ['🌾','Campo e agro',[['Peão','peao','🤠'],['Vaqueiro','vaqueiro','🐂'],['Agricultor','agricultor','🌽'],['Capinador','capinador','🌿'],['Podador de árvores','podador de arvores','🌳'],['Apicultor','apicultor','🐝'],['Piscicultor','piscicultor','🐟'],['Ordenhador','ordenhador','🥛'],['Inseminador','inseminador','🐄'],['Ferrador','ferrador','🐴'],['Domador','domador','🐎'],['Agrônomo','agronomo','🌱'],['Técnico agrícola','tecnico agricola','🌱'],['Zootecnista','zootecnista','🐖'],['Veterinário rural','veterinario rural','🐄'],['Aplicador de defensivos','defensivos','🧪'],['Guia de pesca','pesca','🎣'],['Pescador','pescador','🎣'],['Barqueiro','barqueiro','⛵']]],
   ['🧱','Reformas e obras',[['Armador','armador','🏗️'],['Carpinteiro','carpinteiro','🪚'],['Impermeabilizador','impermeabilizador','💧'],['Instalador de piso','piso','🔲'],['Instalador de drywall','drywall','🏗️'],['Instalador de forro','forro','🏠'],['Instalador de papel de parede','papel de parede','🖼️'],['Instalador de persianas','persianas','🪟'],['Instalador de box','instalador de box','🚿'],['Instalador de calhas','calhas','🏠'],['Instalador de energia solar','energia solar','☀️'],['Instalador de portão eletrônico','portao eletronico','🚪'],['Instalador de alarme e cerca elétrica','alarme e cerca eletrica','🚨'],['Instalador de interfone','interfone','📞'],['Instalador de gás','instalador de gas','🔥'],['Marmorista','marmorista','🪨'],['Grafiteiro','grafiteiro','🎨'],['Demolidor','demolidor','🔨'],['Desentupidor','desentupidor','🚽'],['Limpeza pós-obra','limpeza pos-obra','🧽'],['Engenheiro civil','engenheiro civil','📐'],['Arquiteto','arquiteto','📐'],['Topógrafo','topografo','📏'],['Projetista','projetista','📐'],['Eletricista predial','eletricista predial','⚡'],['Eletricista industrial','eletricista industrial','🏭'],['Encanador industrial','encanador industrial','🚰'],['Pedreiro','pedrei','🧱'],['Pintor','pintor','🎨'],['Gesseiro','gess','🏗️'],['Telhadista','telha','🏠'],['Soldador','solda','🔥'],['Mestre de obras','mestre','📐'],['Serralheiro','serralh','⚙️'],['Vidraceiro','vidrace','🪟'],['Azulejista','azulej','🔲'],['Marceneiro','marcen','🪚'],['Eletricista','eletric','⚡'],['Encanador','encanad','🚰']]],
   ['🏡','Casa e jardim',[['Diarista','diarista','🧹'],['Faxineira','faxineira','🧼'],['Passadeira','passadeira','👔'],['Lavadeira','lavadeira','🧺'],['Caseiro','caseiro','🏡'],['Zelador','zelador','🔑'],['Governanta','governanta','🏠'],['Organizador de casas','organizador de casas','🗂️'],['Jardineiro','jardin','🌱'],['Paisagista','paisagista','🌳'],['Piscineiro','piscin','🏊'],['Dedetizador','dedetiz','🐜'],['Limpador de caixa d\'água','caixa d\'agua','💧'],['Limpeza de vidros','limpeza de vidros','🪟'],['Higienização de colchão','higienizacao de colchao','🛏️'],['Lavagem de estofados','estofad','🛋️'],['Lavador de tapetes','lavador de tapetes','🧶'],['Estofador','estofador','🛋️'],['Tapeceiro','tapeceiro','🛋️'],['Instalador de cortinas','cortinas','🪟'],['Montador de móveis','montador','🪑'],['Chaveiro','chave','🔑'],['Antenista','antena','📡'],['Instalador de câmeras','camera','📹'],['Mudança','mudanc','📦']]],
   ['🔌','Assistência técnica',[['Técnico de geladeira','geladeira','🧊'],['Técnico de máquina de lavar','maquina de lavar','🧺'],['Técnico de fogão','fogao','🍳'],['Técnico de micro-ondas','micro-ondas','📻'],['Técnico de TV','tecnico de tv','📺'],['Técnico de notebook','notebook','💻'],['Técnico de computador','computador','🖥️'],['Técnico de celular','celular','📱'],['Técnico de tablet','tablet','📱'],['Técnico de impressora','impressora','🖨️'],['Técnico de videogame','videogame','🎮'],['Técnico de som','tecnico de som','🔊'],['Técnico de ar-condicionado','ar-condicionado','❄️'],['Técnico em refrigeração','refrigeracao','🧊'],['Técnico em eletrônica','eletronica','🔧'],['Técnico em eletrodomésticos','eletrodomesticos','🔌'],['Técnico de aquecedor','aquecedor','🔥'],['Técnico de redes','redes','🌐'],['Técnico de portão eletrônico','portao eletronico','🚪'],['Instalador de internet','internet','📶'],['Relojoeiro','relojoeiro','⌚'],['Sapateiro','sapateiro','👞'],['Mecânico de bicicleta','bicicleta','🚲'],['Ar-condicionado','condicionado','❄️',['Manutenção de filtros de água','manutencao de filtros de agua','💧'],['Manutenção de bebedouros','manutencao de bebedouros','🚰'],['Manutenção de climatizadores','manutencao de climatizadores','🌬️'],['Manutenção de purificadores','manutencao de purificadores','💧'],['Instalador de climatizador','instalador de climatizador','🌬️'],['Técnico de câmara fria','tecnico de camara fria','🧊'],['Técnico em refrigeração comercial','tecnico em refrigeracao comercial','🧊'],['Técnico de freezer','tecnico de freezer','🧊'],['Técnico de máquina de gelo','tecnico de maquina de gelo','🧊'],['Técnico de ventilador','tecnico de ventilador','🌀'],['Técnico de bomba d\'água','tecnico de bomba d\'agua','💧'],['Técnico de lavadora de alta pressão','tecnico de lavadora de alta pressao','💦'],['Técnico de máquina de costura','tecnico de maquina de costura','🧵'],['Técnico de balança','tecnico de balanca','⚖️'],['Técnico de nobreak','tecnico de nobreak','🔋'],['Técnico de elevadores','tecnico de elevadores','🛗']]]],
   ['💅','Moda e beleza',[['Manicure','manicure','💅'],['Pedicure','pedicure','🦶'],['Nail designer','nail','✨'],['Cabeleireiro','cabelei','💇'],['Barbeiro','barbei','💈'],['Trancista','trancista','🧑‍🦱'],['Colorista','colorista','🎨'],['Maquiador','maqui','💄'],['Esteticista','esteticist','🧖'],['Designer de sobrancelhas','sobrancelha','🖌️'],['Micropigmentador','micropigmentador','🖋️'],['Lash designer','lash','👁️'],['Depilador','depila','🪒'],['Podólogo','podologo','🦶'],['Massagista','massag','💆'],['Tatuador','tatuador','🖋️'],['Piercer','piercer','💎'],['Costureira','costureira','🧵'],['Alfaiate','alfaiate','🧵'],['Bordadeira','bordadeira','🪡'],['Estilista','estilista','👗'],['Consultor de imagem','consultor de imagem','👔'],['Personal stylist','personal stylist','👗']]],
   ['💪','Saúde e bem-estar',[['Personal trainer','personal','🏋️'],['Nutricionista','nutri','🥗'],['Fisioterapeuta','fisio','🦴'],['Massoterapeuta','massoterap','🙌'],['Psicólogo','psicolog','🧠'],['Psicanalista','psicanalista','🧠'],['Terapeuta','terapeuta','🧘'],['Coach','coach','🎯'],['Dentista','dentista','🦷'],['Médico','medico','🩺'],['Enfermeiro','enfermei','🩺'],['Técnico de enfermagem','enfermagem','💉'],['Cuidador de idosos','idoso','👵'],['Acompanhante hospitalar','acompanhante hospitalar','🏥'],['Fonoaudiólogo','fonoaudiologo','🗣️'],['Terapeuta ocupacional','terapeuta ocupacional','🖐️'],['Acupunturista','acupunturista','📍'],['Quiropraxista','quiropraxista','🦴'],['Osteopata','osteopata','🦴'],['Farmacêutico','farmaceutico','💊'],['Doula','doula','🤰'],['Instrutor de pilates','pilates','🤸'],['Instrutor de yoga','yoga','🧘'],['Instrutor de natação','natacao','🏊'],['Instrutor de artes marciais','artes marciais','🥋'],['Instrutor de dança','danca','💃'],['Treinador de futebol','treinador de futebol','⚽'],['Pilates','pilates','🤸'],['Yoga','yoga','🧘']]],
   ['📚','Aulas',[['Professor particular','professor','👩‍🏫'],['Professor de reforço escolar','reforco escolar','📝'],['Professor de matemática','matematica','➗'],['Professor de português','portugues','📖'],['Professor de redação','redacao','✍️'],['Professor de física','fisica','⚛️'],['Professor de química','quimica','🧪'],['Professor de inglês','ingles','🗣️'],['Professor de espanhol','espanhol','🗣️'],['Professor de francês','frances','🗣️'],['Professor de alemão','alemao','🗣️'],['Professor de italiano','italiano','🗣️'],['Professor de japonês','japones','🗣️'],['Professor de violão','violao','🎸'],['Professor de piano','piano','🎹'],['Professor de canto','canto','🎤'],['Professor de bateria','bateria','🥁'],['Professor de informática','informatica','💻'],['Professor de programação','programacao','👨‍💻'],['Professor de desenho','desenho','✏️'],['Professor de culinária','culinaria','🍳'],['Professor de artesanato','artesanato','🧶'],['Professor de dança','danca','💃'],['Professor de natação','natacao','🏊'],['Preparatório para concursos','preparatorio para concursos','📚'],['Preparatório para ENEM','preparatorio para enem','🎓'],['Alfabetizador','alfabetizador','🔤'],['Instrutor de direção','direcao','🚗'],['Instrutor de moto','moto','🏍️'],['Reforço escolar','reforco','📝'],['Aula de música','musica','🎸'],['Aula de inglês','ingles','🗣️']]],
   ['🎉','Eventos e festas',[['Cerimonialista','cerimonialista','🎊'],['Mestre de cerimônias','mestre de cerimonias','🎙️'],['Decorador de festas','decorador de festas','🎈'],['Florista','florista','💐'],['Garçom','garcom','🤵'],['Bartender','bartender','🍸'],['Churrasqueiro','churrasqueiro','🥩'],['Cozinheiro','cozinheiro','👨‍🍳'],['Chef particular','chef particular','👨‍🍳'],['Confeiteiro','confeit','🎂'],['Doceira','doceira','🍬'],['Salgadeira','salgadeira','🥟'],['Buffet','buffet','🍽️'],['Copeira','copeira','🍽️'],['Fotógrafo','fotograf','📸'],['Videomaker','video','🎥'],['Piloto de drone','piloto de drone','🚁'],['DJ','dj','🎧'],['Cantor','cantor','🎤'],['Músico','musico','🎷'],['Banda','banda','🎸'],['Sonorização','sonorizacao','🔊'],['Iluminação para eventos','iluminacao para eventos','💡'],['Animador de festas','animador de festas','🤹'],['Palhaço','palhaco','🤡'],['Mágico','magico','🎩'],['Recepcionista de eventos','recepcionista de eventos','🙋'],['Promotor de eventos','promotor de eventos','📣'],['Locação de mesas e cadeiras','locacao de mesas e cadeiras','🪑'],['Aluguel de brinquedos','aluguel de brinquedos','🏰'],['Cabine de fotos','cabine de fotos','📷'],['Buffet e salgados','buffet','🍽️'],['Decoração de festas','decora','🎈'],['Recreador','recrea','🤹'],['Som e iluminação','iluminacao','🔊']]],
   ['💻','Tecnologia',[['Programador','programador','👨‍💻'],['Desenvolvedor web','desenvolvedor web','🌐'],['Desenvolvedor mobile','mobile','📱'],['Desenvolvedor front-end','front-end','🖥️'],['Desenvolvedor back-end','back-end','🗄️'],['Desenvolvedor WordPress','wordpress','📝'],['Desenvolvedor de jogos','jogos','🎮'],['Analista de dados','analista de dados','📊'],['Cientista de dados','cientista de dados','🧪'],['Engenheiro de software','engenheiro de software','⚙️'],['Testador de software','testador de software','🐞'],['DevOps','devops','♾️'],['Suporte técnico de TI','suporte tecnico de ti','🛠️'],['Segurança da informação','seguranca da informacao','🔐'],['Administrador de redes','administrador de redes','🌐'],['Criador de sites','criador de sites','🌐'],['Criador de lojas virtuais','criador de lojas virtuais','🛒'],['Técnico de informática','informatica','🖥️'],['Criação de sites','site','🌐']]],
   ['🎨','Design e criação',[['Designer gráfico','grafic','🖼️'],['Designer','designer','✏️'],['Designer de logotipos','logotipos','🔰'],['Designer de embalagens','embalagens','📦'],['Designer UI UX','designer ui ux','📐'],['Web designer','web designer','🖥️'],['Ilustrador','ilustrador','🖍️'],['Cartunista','cartunista','🖍️'],['Animador 2D','animador 2d','🎞️'],['Animador 3D','animador 3d','🧊'],['Modelador 3D','modelador 3d','🧊'],['Motion designer','motion designer','🎬'],['Editor de vídeo','editor de video','🎞️'],['Editor de fotos','editor de fotos','🖼️'],['Fotógrafo de produtos','produtos','📷'],['Designer de interiores','interiores','🛋️'],['Designer de moda','moda','👗'],['Designer de joias','joias','💍'],['Produtor musical','produtor musical','🎛️'],['Produtor de áudio','produtor de audio','🎚️'],['Compositor','compositor','🎼'],['Locutor','locutor','🎙️'],['Dublador','dublador','🎭'],['Podcaster','podcaster','🎧'],['Roteirista','roteirista','📜']]],
   ['📣','Marketing e conteúdo',[['Social media','social media','📲'],['Gestor de tráfego','gestor de trafego','📈'],['Especialista em SEO','especialista em seo','🔎'],['Copywriter','copywriter','✍️'],['Redator','redator','📝'],['Revisor de textos','revisor de textos','🧐'],['Tradutor','tradutor','🌍'],['Intérprete','interprete','🗣️'],['Legendador','legendador','💬'],['Criador de conteúdo','criador de conteudo','📹'],['Influenciador digital','influenciador digital','🤳'],['Community manager','community manager','👥'],['Consultor de marketing','consultor de marketing','📊'],['Gestor de e-commerce','gestor de e-commerce','🛒'],['Assessor de imprensa','assessor de imprensa','📰'],['Email marketing','email marketing','📧'],['Panfletista','panfletista','📄']]],
   ['💼','Escritório e consultoria',[['Contador','contador','🧮'],['Advogado','advogado','⚖️'],['Despachante','despachante','📑'],['Consultor financeiro','consultor financeiro','💰'],['Planejador financeiro','planejador financeiro','💰'],['Consultor de negócios','consultor de negocios','💼'],['Consultor de RH','consultor de rh','👥'],['Recrutador','recrutador','🧑‍💼'],['Auxiliar administrativo','auxiliar administrativo','🗂️'],['Secretária','secretaria','📋'],['Recepcionista','recepcionista','🙋'],['Assistente virtual','assistente virtual','💻'],['Digitador','digitador','⌨️'],['Transcritor','transcritor','🎧'],['Telemarketing','telemarketing','📞'],['Vendedor','vendedor','🛍️'],['Corretor de imóveis','corretor de imoveis','🏠'],['Corretor de seguros','corretor de seguros','🛡️'],['Avaliador de imóveis','avaliador de imoveis','🏘️'],['Engenheiro elétrico','engenheiro eletrico','⚡'],['Técnico de segurança do trabalho','seguranca do trabalho','🦺'],['Perito','perito','🔍'],['Pesquisador','pesquisador','🔬']]],
   ['🏭','Indústria e oficina',[['Mecânico hidráulico','mecanico hidraulico','💧'],['Reparador de cilindros hidráulicos','reparador de cilindros hidraulicos','💧'],['Reparador de mangueiras hidráulicas','reparador de mangueiras hidraulicas','💧'],['Fresador','fresador','⚙️'],['Usinador','usinador','⚙️'],['Soldador industrial','soldador industrial','🔥'],['Caldeireiro','caldeireiro','🏭'],['Bobinador de motores','bobinador de motores','🌀'],['Mecânico industrial','mecanico industrial','🏭'],['Reparador de compressores','reparador de compressores','🌬️'],['Afiador de ferramentas','afiador de ferramentas','🔪'],['Afiador de facas e alicates','afiador de facas e alicates','🔪'],['Pintor industrial','pintor industrial','🎨'],['Eletricista de painéis','eletricista de paineis','⚡'],['Técnico de automação','tecnico de automacao','🤖'],['Técnico em mecatrônica','tecnico em mecatronica','🤖'],['Reparador de motosserras','reparador de motosserras','🪚']]],
   ['🔧','Mecânica e autos',[['Mecânico','mecanico','🔧'],['Mecânico de carro','mecanic','🚗'],['Mecânico de moto','mecanico de moto','🏍️'],['Mecânico de caminhão','caminh','🚚'],['Mecânico de ônibus','onibus','🚌'],['Mecânico diesel','mecanico diesel','⛽'],['Mecânico de barco','barco','⛵'],['Eletricista automotivo','automotiv','🔌'],['Funileiro','funileiro','🛠️'],['Pintor automotivo','pintor automotivo','🎨'],['Martelinho de ouro','martelinho de ouro','🔨'],['Polidor automotivo','polidor automotivo','✨'],['Higienizador automotivo','higienizador automotivo','🧼'],['Instalador de som automotivo','som automotivo','🔊'],['Instalador de insulfilm','insulfilm','🚘'],['Retificador de motores','retificador de motores','⚙️'],['Alinhador e balanceador','alinhador e balanceador','🛞'],['Técnico de ar automotivo','ar automotivo','❄️'],['Vidraceiro automotivo','vidraceiro automotivo','🪟'],['Borracheiro','borrach','🛞'],['Guincho','guincho','🛻'],['Lavador de carros','lavador','🚿'],['Vistoriador','vistoriador','📋'],['Despachante de veículos','despachante de veiculos','📑'],['Vendedor de carros','carros','🚗'],['Vendedor de motos','motos','🏍️'],['Funilaria e pintura','funil','🛠️',['Torneiro mecânico','torneiro mecanico','⚙️'],['Plainador de cabeçote','plainador de cabecote','⚙️'],['Retificador de cabeçote','retificador de cabecote','⚙️'],['Recuperador de radiadores','recuperador de radiadores','♨️'],['Técnico de radiadores','tecnico de radiadores','♨️'],['Mecânico de injeção eletrônica','mecanico de injecao eletronica','💉'],['Mecânico de suspensão','mecanico de suspensao','🛞'],['Mecânico de freios','mecanico de freios','🛑'],['Mecânico de câmbio','mecanico de cambio','⚙️'],['Mecânico de embreagem','mecanico de embreagem','⚙️'],['Mecânico de direção hidráulica','mecanico de direcao hidraulica','🛞'],['Mecânico de trator','mecanico de trator','🚜'],['Mecânico de máquinas pesadas','mecanico de maquinas pesadas','🚧'],['Mecânico de empilhadeira','mecanico de empilhadeira','🏭'],['Mecânico de motor de popa','mecanico de motor de popa','⛵'],['Mecânico de motosserra e roçadeira','mecanico de motosserra e rocadeira','🪚'],['Troca de óleo','troca de oleo','🛢️'],['Escapamentos','escapamentos','💨'],['Reparador de turbinas','reparador de turbinas','🌀'],['Reparador de bomba injetora','reparador de bomba injetora','💉'],['Reparador de alternador e partida','reparador de alternador e partida','🔋'],['Lanterneiro','lanterneiro','🛠️'],['Eletricista de caminhão','eletricista de caminhao','🔌'],['Reparador de cardan','reparador de cardan','⚙️'],['Manutenção de carretas','manutencao de carretas','🚛']]]],
   ['🐶','Pets',[['Cuidador de pets','pet','🐕'],['Pet sitter','pet sitter','🏠'],['Passeador de cães','passeador de caes','🦮'],['Banho e tosa','tosa','🛁'],['Adestrador','adestr','🎾'],['Veterinário','veterin','🐾'],['Fotógrafo de pets','pets','📷'],['Motorista de pets','pets','🚐'],['Passeador','passead','🦮']]],
   ['🚚','Fretes e transporte',[['Frete e mudança','frete e mudanca','🚛'],['Carreto','carreto','🛻'],['Caminhoneiro','caminhoneiro','🚚'],['Motorista','motorista','🚘'],['Motorista particular','motorista particular','🚘'],['Motorista de aplicativo','aplicativo','📱'],['Motorista de van','motorista de van','🚐'],['Motorista de ônibus','onibus','🚌'],['Taxista','taxista','🚕'],['Mototaxista','mototaxista','🏍️'],['Motoboy','motoboy','🛵'],['Entregador','entregador','📦'],['Transporte escolar','transporte escolar','🚌'],['Caroneiro','carone','🤝'],['Guia de turismo','turismo','🧭'],['Agente de viagens','agente de viagens','✈️'],['Frete','frete','🚛']]],
   ['🍽️','Alimentação',[['Marmiteiro','marmiteiro','🍱'],['Padeiro','padeiro','🥖'],['Pizzaiolo','pizzaiolo','🍕'],['Açougueiro','acougueiro','🥩'],['Sushiman','sushiman','🍣'],['Barista','barista','☕'],['Cozinheiro industrial','cozinheiro industrial','👨‍🍳'],['Ajudante de cozinha','ajudante de cozinha','🥘'],['Salgadinhos e bolos','salgadinhos e bolos','🎂'],['Vendedor de lanches','lanches','🌭']]],
   ['🛡️','Segurança',[['Segurança','seguranca','🛡️'],['Vigilante','vigilante','👮'],['Porteiro','porteiro','🚪'],['Vigia','vigia','🔦'],['Monitor de câmeras','monitor de cameras','📹'],['Bombeiro civil','bombeiro civil','🧑‍🚒'],['Brigadista','brigadista','🧯']]],
   ['🙋','Ajudantes',[['Ajudante geral','ajudante','🙋'],['Ajudante de obra','ajudante de obra','👷'],['Carregador','carreg','📦'],['Babá','baba','🍼'],['Auxiliar de limpeza','auxiliar de limpeza','🧽'],['Auxiliar de serviços gerais','auxiliar de servicos gerais','🧰'],['Promotor de vendas','promotor de vendas','🛍️'],['Repositor','repositor','📦']]]
  ];
  const conhecidos=[...ofs.map(o=>norm(o[1])),...GRUPOS.flatMap(g=>g[2].map(i=>i[1]))];
  const ehConhecido=n=>conhecidos.some(k=>k.length<4?n===k:n.includes(k));
  const helpersOk=()=>(window.MH_HELPERS||[]).filter(h=>h&&h.nome&&!(window.MH_FORA&&MH_FORA.has(h.nome)));
  function novos(){const m=new Map();helpersOk().forEach(h=>{String(h.oficio||'').split(/[,;/]+/).forEach(t=>{const n=norm(t);if(n.length<3||n.length>30||ehConhecido(n))return;const e=m.get(n)||{rot:t.trim().replace(/^./,c=>c.toUpperCase()),q:n,n:0};e.n++;m.set(n,e)})});return[...m.values()].sort((a,b)=>b.n-a.n).slice(0,24)}
  const som=x=>{try{window.MH_SOM&&MH_SOM.tocar(x,0)}catch(e){}};
  function verCat(rot,q){
    som('pop');marca('');filtra(q);info.textContent='';
    const t=document.createElement('span');t.textContent='Mostrando '+rot+' em Profissionais do Vale.';info.append(t);
    const x=document.createElement('button');x.type='button';x.className='ni-x';x.textContent='Limpar';x.onclick=limpa;info.append(x);
    info.hidden=false;const pr=document.getElementById('prof');if(pr)pr.scrollIntoView({behavior:'smooth',block:'nearest'})}
  const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
  const chip=(rot,q,n,ic)=>{const b=mk('button','nc-chip',(ic?ic+' ':'')+(n?rot+' · '+n:rot));b.type='button';b.onclick=()=>{if(URG.includes(rot)){som('pop');toque(rot)}else verCat(rot,q)};return b};
  const busca=mk('input','nc-q');busca.type='search';busca.placeholder='Buscar serviço (ex.: massagista, nail designer)';busca.autocomplete='off';busca.setAttribute('aria-label','Buscar serviço');
  const corpo=mk('div','nc-body');cats.append(busca,corpo);cats.after(info);
  let aberto=null;
  const contaH=itens=>helpersOk().filter(h=>itens.some(i=>norm(h.oficio).includes(i[1]))).length;
  function desenhaCats(){
    corpo.textContent='';const q=norm(busca.value);
    if(q){
      const ach=[];GRUPOS.forEach(g=>g[2].forEach(i=>{if(norm(i[0]).includes(q)||i[1].includes(q)||(i[1].length>=4&&q.includes(i[1])))ach.push(i)}));
      const nv=novos().filter(i=>i.q.includes(q));
      const w=mk('div','nc-chips');ach.forEach(i=>w.append(chip(i[0],i[1],0,i[2])));nv.forEach(i=>w.append(chip(i.rot,i.q,i.n,'✨')));corpo.append(w);
      const b=mk('button','nc-chip nc-busca','🔎 Procurar “'+busca.value.trim()+'” nos profissionais');b.type='button';b.onclick=()=>verCat(busca.value.trim(),busca.value.trim());corpo.append(b);
      return}
    if(aberto){
      const bk=mk('button','nc-back','← Todas as categorias');bk.type='button';bk.onclick=()=>{som('soft');aberto=null;desenhaCats()};
      const nv=aberto==='novos';const g=GRUPOS.find(x=>x[1]===aberto);
      corpo.append(bk,mk('h4','nc-h',nv?'✨ Novos no Vale':g[0]+' '+g[1]));
      const w=mk('div','nc-chips');
      if(nv){novos().forEach(i=>w.append(chip(i.rot,i.q,i.n,'✨')))}else g[2].forEach(i=>w.append(chip(i[0],i[1],0,i[2])));
      corpo.append(w);return}
    const gr=mk('div','nc-grid');
    const nv=novos();
    const card=(ic,nome,sub,fn)=>{const b=mk('button','need-cat');b.type='button';b.append(mk('span','nc-ic',ic),mk('span','nc-t',nome),mk('small','nc-n',sub));b.onclick=()=>{som('pop');fn()};return b};
    GRUPOS.forEach(g=>{const h=contaH(g[2]);gr.append(card(g[0],g[1],g[2].length+' serviços'+(h?' · '+h+' no Vale':''),()=>{aberto=g[1];desenhaCats()}))});
    if(nv.length)gr.append(card('✨','Novos no Vale',nv.length+(nv.length>1?' serviços':' serviço')+' por helpers',()=>{aberto='novos';desenhaCats()}));
    corpo.append(gr);
    corpo.append(mk('p','nc-dica','Não achou o seu? Escreva na busca acima. Helpers novos podem cadastrar qualquer serviço, e ele aparece aqui em “Novos no Vale”.'))}
  busca.addEventListener('input',()=>{aberto=null;desenhaCats()});
  const aba=(id,rot)=>{const b=mk('button',null,rot);b.type='button';b.id='nt-'+id;b.setAttribute('role','tab');b.dataset.aba=id;return b};
  const TG=[['🍽️','Alimentação',['Restaurante','Lanchonete','Pastelaria','Padaria','Pizzaria','Hamburgueria','Sorveteria','Açaiteria','Cafeteria','Bar e petiscaria','Churrascaria','Marmitaria','Doceria e confeitaria','Buffet','Açougue','Peixaria','Hortifruti','Mercado e mercearia','Supermercado','Distribuidora de bebidas','Distribuidora de gás','Depósito de água']],
   ['📱','Manutenção de eletrônicos',['Loja de assistência de celulares','Assistência técnica de eletrodomésticos','Refrigeração e ar-condicionado','Filtros e bebedouros','Loja de informática']],
   ['🛍️','Lojas e comércio',['Loja','Loja de eletrônicos','Loja de eletrodomésticos','Loja de móveis','Loja de roupas','Loja de calçados','Loja de acessórios','Loja de cosméticos e perfumaria','Ótica','Joalheria e relojoaria','Papelaria','Livraria','Loja de brinquedos','Loja de presentes','Floricultura','Costura e ajustes','Sapataria','Lavanderia']],
   ['💈','Beleza e bem-estar',['Barbearia','Salão de beleza','Clínica de estética','Estúdio de tatuagem','Spa e massagem','Academia','Estúdio de pilates e yoga']],
   ['🏥','Saúde',['Clínica','Clínica médica','Clínica odontológica','Clínica de fisioterapia','Laboratório','Farmácia','Clínica veterinária']],
   ['🔧','Autos e mecânica',['Oficina mecânica','Loja de motos','Loja de carros','Concessionária','Autopeças','Auto elétrica','Borracharia','Lava jato','Estética automotiva','Funilaria e pintura','Mecânica diesel','Mecânica hidráulica','Retífica de motores','Torneadora e usinagem','Radiadores','Auto center','Troca de óleo','Oficina de motos','Loja de bicicletas','Oficina de bicicletas','Locadora de veículos']],
   ['🧱','Construção e casa',['Construção e reformas','Construtora','Empreiteira','Loja de materiais de construção','Madeireira','Vidraçaria','Serralheria','Marcenaria','Marmoraria','Loja de tintas','Eletricista e instalações','Hidráulica e encanamento','Pintura e acabamento','Energia solar','Segurança eletrônica','Chaveiro']],
   ['🐶','Pets e campo',['Pet shop','Banho e tosa','Agropecuária','Loja de pesca','Pesqueiro']],
   ['💼','Escritórios e serviços',['Escritório','Despachante','Escritório de contabilidade','Escritório de advocacia','Imobiliária','Corretora de seguros','Agência de viagens','Escola de idiomas','Escola e cursos','Autoescola','Gráfica e comunicação visual','Estúdio fotográfico','Produtora de vídeo','Agência de marketing']],
   ['🎉','Festas e eventos',['Casa de festas','Locadora de equipamentos']],
   ['🚚','Transporte e hospedagem',['Transportadora','Mudanças e fretes','Locadora de máquinas','Hotel e pousada','Camping']]];
  const estC=mk('div');estC.hidden=true;cats.append(estC);let estAb=null;
  const lojasN=t=>{try{return (MH_LOJAS8()||[]).filter(l=>(l.tipo||'Outro')===t).length}catch(e){return 0}};
  function desenhaEst(){
    estC.textContent='';
    const todas=TG.flatMap(g=>g[2]);const outros=[];try{(MH_LOJAS8()||[]).forEach(l=>{const t=l.tipo||'Outro';if(!todas.includes(t)&&!outros.includes(t))outros.push(t)})}catch(e){}
    const G=TG.concat(outros.length?[['📦','Outros',outros]]:[]);
    const ver=t=>{som('pop');try{MH_TIPO8(t)}catch(e){}const pr=document.getElementById('prof');if(pr)pr.scrollIntoView({behavior:'smooth',block:'nearest'})};
    if(estAb){const g=G.find(x=>x[1]===estAb);
      const bk=mk('button','nc-back','← Todas as categorias');bk.type='button';bk.onclick=()=>{som('soft');estAb=null;desenhaEst()};
      estC.append(bk,mk('h4','nc-h',g[0]+' '+g[1]));const w=mk('div','nc-chips');
      g[2].forEach(t=>{const n=lojasN(t);w.append(Object.assign(chipE(t,n),{onclick:()=>ver(t)}))});estC.append(w);return}
    const gr=mk('div','nc-grid');
    G.forEach(g=>{const n=g[2].reduce((a,t)=>a+lojasN(t),0);const b=mk('button','need-cat');b.type='button';b.append(mk('span','nc-ic',g[0]),mk('span','nc-t',g[1]),mk('small','nc-n',n?n+(n>1?' estabelecimentos':' estabelecimento'):g[2].length+' tipos'));b.onclick=()=>{som('pop');estAb=g[1];desenhaEst()};gr.append(b)});
    const all=mk('button','nc-chip nc-busca','🏪 Ver todos os estabelecimentos');all.type='button';all.onclick=()=>ver('');
    estC.append(all,gr,mk('p','nc-dica','Não achou o seu tipo de negócio? Quem cria o estabelecimento escolhe “Outro” e escreve o que faz no nome.'))}
  const EIC={"Restaurante": "🍽️", "Lanchonete": "🥪", "Pastelaria": "🥟", "Padaria": "🥖", "Pizzaria": "🍕", "Hamburgueria": "🍔", "Sorveteria": "🍦", "Açaiteria": "🍇", "Cafeteria": "☕", "Bar e petiscaria": "🍻", "Churrascaria": "🥩", "Marmitaria": "🍱", "Doceria e confeitaria": "🎂", "Buffet": "🍴", "Açougue": "🥩", "Peixaria": "🐟", "Hortifruti": "🥬", "Mercado e mercearia": "🛒", "Supermercado": "🛒", "Distribuidora de bebidas": "🍺", "Distribuidora de gás": "🔥", "Depósito de água": "💧", "Loja de assistência de celulares": "📱", "Assistência técnica de eletrodomésticos": "🔌", "Refrigeração e ar-condicionado": "❄️", "Filtros e bebedouros": "🚰", "Loja de informática": "💻", "Loja": "🛍️", "Loja de eletrônicos": "📺", "Loja de eletrodomésticos": "🧺", "Loja de móveis": "🛋️", "Loja de roupas": "👗", "Loja de calçados": "👟", "Loja de acessórios": "👜", "Loja de cosméticos e perfumaria": "💄", "Ótica": "👓", "Joalheria e relojoaria": "💍", "Papelaria": "✏️", "Livraria": "📚", "Loja de brinquedos": "🧸", "Loja de presentes": "🎁", "Floricultura": "💐", "Costura e ajustes": "🧵", "Sapataria": "👞", "Lavanderia": "🧺", "Barbearia": "💈", "Salão de beleza": "💇", "Clínica de estética": "🧖", "Estúdio de tatuagem": "🖋️", "Spa e massagem": "💆", "Academia": "🏋️", "Estúdio de pilates e yoga": "🧘", "Clínica": "🏥", "Clínica médica": "🩺", "Clínica odontológica": "🦷", "Clínica de fisioterapia": "🦴", "Laboratório": "🧪", "Farmácia": "💊", "Clínica veterinária": "🐾", "Oficina mecânica": "🔧", "Loja de motos": "🏍️", "Loja de carros": "🚗", "Concessionária": "🚘", "Autopeças": "⚙️", "Auto elétrica": "🔌", "Borracharia": "🛞", "Lava jato": "🚿", "Estética automotiva": "✨", "Funilaria e pintura": "🎨", "Mecânica diesel": "⛽", "Mecânica hidráulica": "💧", "Retífica de motores": "⚙️", "Torneadora e usinagem": "🔩", "Radiadores": "♨️", "Auto center": "🏁", "Troca de óleo": "🛢️", "Oficina de motos": "🏍️", "Loja de bicicletas": "🚲", "Oficina de bicicletas": "🚲", "Locadora de veículos": "🔑", "Construção e reformas": "🏗️", "Construtora": "🏢", "Empreiteira": "👷", "Loja de materiais de construção": "🧱", "Madeireira": "🪵", "Vidraçaria": "🪟", "Serralheria": "🔥", "Marcenaria": "🪚", "Marmoraria": "🪨", "Loja de tintas": "🎨", "Eletricista e instalações": "⚡", "Hidráulica e encanamento": "🚰", "Pintura e acabamento": "🖌️", "Energia solar": "☀️", "Segurança eletrônica": "📹", "Chaveiro": "🔑", "Pet shop": "🐶", "Banho e tosa": "🛁", "Agropecuária": "🌾", "Loja de pesca": "🎣", "Pesqueiro": "🐟", "Escritório": "🗂️", "Despachante": "📑", "Escritório de contabilidade": "🧮", "Escritório de advocacia": "⚖️", "Imobiliária": "🏠", "Corretora de seguros": "🛡️", "Agência de viagens": "✈️", "Escola de idiomas": "🗣️", "Escola e cursos": "🎓", "Autoescola": "🚦", "Gráfica e comunicação visual": "🖨️", "Estúdio fotográfico": "📸", "Produtora de vídeo": "🎥", "Agência de marketing": "📣", "Casa de festas": "🎉", "Locadora de equipamentos": "🪑", "Transportadora": "🚚", "Mudanças e fretes": "📦", "Locadora de máquinas": "🚜", "Hotel e pousada": "🏨", "Camping": "⛺"};
  const chipE=(t,n)=>{const b=mk('button','nc-chip',(EIC[t]?EIC[t]+' ':'📦 ')+(n?t+' · '+n:t));b.type='button';return b};
  const t1=aba('dia','⚡ Do dia a dia'),t2=aba('cat','🗂 Categorias'),t3=aba('est','🏪 Estabelecimentos');tabs.append(t1,t2,t3);
  function irAba(id,quieto){
    box.dataset.aba=id;t1.setAttribute('aria-selected',String(id==='dia'));t2.setAttribute('aria-selected',String(id==='cat'));t3.setAttribute('aria-selected',String(id==='est'));
    cats.hidden=id==='dia';busca.hidden=corpo.hidden=id!=='cat';estC.hidden=id!=='est';if(id==='cat'){aberto=null;busca.value='';desenhaCats()}if(id==='est'){estAb=null;desenhaEst()}if(!quieto)som('pop')}
  t1.onclick=()=>irAba('dia');t2.onclick=()=>irAba('cat');t3.onclick=()=>irAba('est');irAba('dia',true);
  setInterval(()=>{if(box.dataset.aba==='cat'&&!cats.hidden&&!busca.value&&document.activeElement!==busca)desenhaCats();if(box.dataset.aba==='est'&&!estC.hidden&&!estAb)desenhaEst()},15000);
}

/* minimizar a grade "Do que você precisa?" (o site lembra a escolha) */
function setupNeedMin(){
  const box=document.getElementById('need'),l=box&&box.querySelector('.need-l'),row=document.getElementById('needRow');
  if(!box||!l||!row||l.tagName==='BUTTON')return;
  const b=document.createElement('button');b.type='button';b.className='need-l need-tg';b.setAttribute('aria-controls','needRow');
  const t=document.createElement('span');t.textContent=l.textContent;
  const ch=document.createElement('span');ch.className='need-ch';ch.setAttribute('aria-hidden','true');ch.textContent='▾';
  b.append(t,ch);l.replaceWith(b);
  const set=(min,salvar)=>{box.dataset.min=min?'1':'0';b.setAttribute('aria-expanded',String(!min));b.title=min?'Mostrar':'Minimizar';
    if(salvar){try{localStorage.setItem('mh_need_min',min?'1':'0')}catch(e){}}};
  let ini=false;try{ini=localStorage.getItem('mh_need_min')==='1'}catch(e){}
  set(ini,false);
  b.addEventListener('click',()=>set(box.dataset.min!=='1',true));
}

function boot(){
  setupIntroDismiss();
  setupDock();
  setupNeed();
  setupNeedMin();
  patchCadastro();
  patchOnlineEmpty();
  patchWa();
  pintarPulse();
  setTimeout(hydrateEu,600);
  setTimeout(hydrateEu,1500);
  setInterval(pintarPulse,8000);
  carregarStats();setInterval(carregarStats,60000);
  /* reenriquece perfil quando a janela de perfil for re-renderizada */
  const reg=document.getElementById('reg');
  if(reg){
    new MutationObserver(()=>{if(reg.classList.contains('meu-perfil'))setTimeout(enriquecerPerfil,30)}).observe(reg,{childList:true,attributes:true,attributeFilter:['class']});
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
else boot();
})()}catch(e){console.error('MiHelp (pulse):',e)}

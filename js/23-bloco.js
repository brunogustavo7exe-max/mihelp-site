
/* Janelas: todas fecham (botão vermelho da barra), menos os letreiros do topo. O menu do cabeçalho traz de volta. */
try{(function(){
const $=id=>document.getElementById(id);
const ok=w=>!w.closest('aside.side')&&!w.closest('dialog')&&w.id!=='cw';
const wins=[...document.querySelectorAll('.win')].filter(ok);
const toast=document.createElement('div');toast.className='xtoast';toast.setAttribute('role','status');toast.hidden=true;document.body.append(toast);
let tt=0;
function aviso(t){toast.textContent=t;toast.hidden=false;clearTimeout(tt);tt=setTimeout(()=>{toast.hidden=true},4000)}
const KJ='mh_janelas';
const chave=w=>{const t=w.querySelector(':scope>.bar .t');return t?t.textContent.trim():''};
const lembra=w=>w.id!=='cadWin'&&w.id!=='cw'; /* cadastro e chat sempre voltam abertos */
function salva(){try{localStorage.setItem(KJ,JSON.stringify(wins.filter(w=>lembra(w)&&w.classList.contains('fechada')).map(chave)))}catch(e){}}
function atualiza(){document.querySelectorAll('section').forEach(s=>{const ws=[...s.querySelectorAll('.win')];s.classList.toggle('sec-vazia',ws.length>0&&ws.every(w=>w.classList.contains('fechada')))});salva()}
function fechar(w){
  if(w.id==='cadWin'&&$('reg')&&$('reg').classList.contains('meu-perfil'))return; /* logado: o perfil já tem o próprio fechar */
  if(w.id==='cw'&&w.classList.contains('full')){const x=$('cwExp');if(x)x.click()}
  w.classList.add('fechada');atualiza();
  aviso('Janela fechada. Para abrir de novo, use o menu lá no topo do site.')}
function abrirConta(){const gr=document.querySelector('.grid'),q=$('perfSq');
  if(gr&&gr.classList.contains('perfil-fechado')){if(q&&!q.hidden)q.click();else gr.classList.remove('perfil-fechado')}
  const w=$('cadWin');if(w)w.classList.remove('fechada');atualiza()}
window.MH_abrirConta=abrirConta;
function abrir(id){
  if(id==='cadWin')abrirConta();
  const el=$(id);if(!el)return;
  let ws;
  if(el.matches('.win'))ws=[el];else if(el.closest('.win'))ws=[el.closest('.win')];else ws=[...el.querySelectorAll('.win')];
  ws.forEach(w=>w.classList.remove('fechada'));atualiza()}
wins.forEach(w=>{
  const is=w.querySelectorAll(':scope>.bar i');if(!is.length)return;
  const x=is[is.length-1];x.classList.add('xw');x.setAttribute('role','button');x.tabIndex=0;x.setAttribute('aria-label','Fechar janela');x.title='Fechar (reabre pelo menu do topo)';
  x.addEventListener('click',e=>{e.stopPropagation();fechar(w)});
  x.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fechar(w)}})});
/* menu do cabeçalho e links internos reabrem a janela de destino */
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('[data-go]');if(a)abrir(a.dataset.go)},true);
const fab=$('chatFab');if(fab)fab.addEventListener('click',()=>abrir('cw'),true);
/* qualquer rolagem até algo dentro de uma janela fechada (ex.: Guilda, Ao vivo) abre a janela */
const si=Element.prototype.scrollIntoView;
Element.prototype.scrollIntoView=function(){
  try{const w=this.closest&&this.closest('.win.fechada');if(w){w.classList.remove('fechada');atualiza()}
  const s=this.closest&&this.closest('section.sec-vazia');if(s){s.querySelectorAll('.win').forEach(x=>x.classList.remove('fechada'));atualiza()}}catch(e){}
  return si.apply(this,arguments)};
window.MH_JAN={
  /* 1º toque: janelas de informação · 2º: Guilda e Fliperama · 3º: Enquete e Cabo de guerra. Cada toque fecha o próximo grupo que ainda estiver aberto. */
  fecharTodas(){
    const G3=['duelo','enquete'],G2=['guilda','fliperama'];
    const nivel=w=>{if(w.id==='cadWin'||w.id==='vagas'||chave(w)==='publicidade')return 0;const sc=w.closest('section[id]'),id=sc?sc.id:'';if(id==='vale'||id==='carona')return 0;return G3.includes(id)?3:G2.includes(id)?2:1};
    const msgs={1:'Janelas de informação fechadas. Toque de novo para fechar Guilda e Fliperama.',2:'Guilda e Fliperama fechados. Toque de novo para fechar Enquete e Cabo de guerra.',3:'Enquete e Cabo de guerra fechados. Use \"Abrir tudo\" para voltar.'};
    for(const n of [1,2,3]){
      const ab=wins.filter(w=>nivel(w)===n&&!w.classList.contains('fechada')&&!w.closest('[hidden]'));
      if(ab.length){ab.forEach(w=>w.classList.add('fechada'));atualiza();aviso(msgs[n]);return}}
    aviso('Já está tudo fechado. Use \"Abrir tudo\" na engrenagem.')},
  abrirTodas(){
    wins.forEach(w=>w.classList.remove('fechada'));atualiza();
    const q=$('perfSq');if(q&&!q.hidden)q.click();
    aviso('Janelas abertas de novo.')}};
try{const sv=JSON.parse(localStorage.getItem(KJ)||'[]')||[];
  if(sv.length){wins.forEach(w=>{if(lembra(w)&&sv.indexOf(chave(w))>=0)w.classList.add('fechada')});atualiza();
    setTimeout(()=>aviso('Você deixou janelas fechadas. Use "Abrir tudo" na engrenagem ou o menu do topo.'),800)}}catch(e){}
const mm=window.MH_missao;if(mm)window.MH_missao=function(){abrir('cw');return mm.apply(this,arguments)};
})()}catch(e){console.error('MiHelp (janelas fecháveis):',e)}

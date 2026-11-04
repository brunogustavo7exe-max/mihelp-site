
/* Aviso geral: faixa no topo publicada pelo painel ADM (mensagem assinada) */
try{(function(){
const $=id=>document.getElementById(id),K='mh_aviso',KX='mh_avisoX';
let cur={txt:'',ate:0,t:0};try{cur=JSON.parse(localStorage.getItem(K)||'null')||cur}catch(e){}
function mostra(){const b=$('avg');if(!b)return;
  let x=0;try{x=Number(localStorage.getItem(KX)||0)}catch(e){}
  const vivo=!!cur.txt&&(!cur.ate||Date.now()<cur.ate)&&x!==cur.t;
  b.hidden=!vivo;if(vivo)$('avgT').textContent=cur.txt}
window.MH_AVISO={set(txt,ate,t){if(t&&t<cur.t)return;cur={txt:String(txt||'').slice(0,120),ate:Number(ate)||0,t:t||Date.now()};try{localStorage.setItem(K,JSON.stringify(cur))}catch(e){}mostra()}};
const bx=$('avgX');if(bx)bx.onclick=()=>{try{localStorage.setItem(KX,String(cur.t))}catch(e){}mostra()};
mostra();setInterval(mostra,60000);
})()}catch(e){console.error('MiHelp (aviso):',e)}

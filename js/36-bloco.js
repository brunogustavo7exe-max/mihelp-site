
/* ===== ajustes v14: máscara do telefone, aviso do Modo Foco, outdoor e títulos ===== */
try{(function(){
const R=document.documentElement;
/* telefone: (66) 99999-8888 */
function mascara(v){let d=String(v).replace(/\D/g,'');if(d.length>11&&d.indexOf('55')===0)d=d.slice(2);d=d.slice(0,11);
 if(d.length<=2)return d.length?'('+d:'';if(d.length<=6)return '('+d.slice(0,2)+') '+d.slice(2);
 if(d.length<=10)return '('+d.slice(0,2)+') '+d.slice(2,6)+(d.length>6?'-'+d.slice(6):'');
 return '('+d.slice(0,2)+') '+d.slice(2,7)+'-'+d.slice(7)}
document.addEventListener('input',function(e){const i=e.target;if(!i||i.tagName!=='INPUT'||i.type!=='tel')return;
 const antes=(i.dataset.dg||'');let dg=i.value.replace(/\D/g,'');
 if(e.inputType==='deleteContentBackward'&&dg===antes&&dg)dg=dg.slice(0,-1);
 i.dataset.dg=dg;i.value=mascara(dg);try{i.setSelectionRange(i.value.length,i.value.length)}catch(x){}});
/* aviso do Modo Foco */
let av=null,tm=0;
function sairFoco(){const b=[...document.querySelectorAll('button')].find(x=>/Sair do modo foco/i.test(x.textContent));if(b)b.click();else{R.classList.remove('modo-foco');try{localStorage.setItem('mh_foco','0')}catch(e){}}esconde()}
function esconde(){if(av)av.hidden=true}
function aviso(txt,btn){if(!av){av=document.createElement('div');av.setAttribute('role','status');
 av.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:16px;z-index:99999;max-width:92vw;width:420px;background:#1b1230;color:#fff;border:2px solid #f5c542;border-radius:12px;padding:12px 14px;font:600 14px/1.4 system-ui,sans-serif;box-shadow:0 8px 30px #0008';
 document.body.append(av)}
 av.textContent='';const p=document.createElement('div');p.textContent=txt;av.append(p);
 if(btn){const b=document.createElement('button');b.type='button';b.textContent='Sair do Modo Foco';b.style.cssText='margin-top:8px;margin-right:8px;padding:8px 12px;border:0;border-radius:8px;background:#f5c542;color:#201804;font-weight:800;cursor:pointer';b.onclick=sairFoco;av.append(b)}
 const x=document.createElement('button');x.type='button';x.textContent='Fechar';x.style.cssText='margin-top:8px;padding:8px 12px;border:1px solid #fff6;border-radius:8px;background:transparent;color:#fff;cursor:pointer';x.onclick=esconde;av.append(x);
 av.hidden=false;clearTimeout(tm);tm=setTimeout(esconde,12000)}
const MSG_FOCO='O Modo Foco está ligado: o site mostra só o seu perfil e o chat. Não está estragado! Para ver o resto, saia do Modo Foco.';
window.MH_avisoFoco=()=>aviso(MSG_FOCO,true);
new MutationObserver(()=>{if(R.classList.contains('modo-foco'))aviso(MSG_FOCO,true)}).observe(R,{attributes:true,attributeFilter:['class']});
function visivel(e){return !!(e&&(e.offsetWidth||e.offsetHeight||e.getClientRects().length))}
document.addEventListener('click',function(e){if(!R.classList.contains('modo-foco'))return;
 const a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;
 const h=a.getAttribute('href'),alvo=h&&h.length>1?document.getElementById(h.slice(1)):null;
 if(alvo&&!visivel(alvo)){e.preventDefault();e.stopPropagation();aviso(MSG_FOCO,true)}},true);
try{if(R.classList.contains('modo-foco')&&!sessionStorage.getItem('mh_foco_av')){sessionStorage.setItem('mh_foco_av','1');setTimeout(()=>aviso(MSG_FOCO,true),900)}}catch(e){}
/* outdoor: vaga aberta leva à tabela de preços; o botão abre a compra */
window.MH_irTabela=function(i){const t=document.getElementById('tabelaOutdoor');
 if(!visivel(t)){window.MH_vaga&&window.MH_vaga.abrir(i);return}
 t.scrollIntoView({behavior:'smooth',block:'start'});const o=t.style.boxShadow;t.style.boxShadow='0 0 0 3px #ff4d97';setTimeout(()=>{t.style.boxShadow=o},2200);
 aviso('Veja os preços e, quando decidir, toque em "Quero um Outdoor Digital" para escolher o tempo e pagar.',false)};
document.addEventListener('click',function(e){const c=e.target.closest&&e.target.closest('#ctaOutdoor');if(!c)return;e.preventDefault();
 if(R.classList.contains('modo-foco')){aviso(MSG_FOCO,true);return}
 if(R.classList.contains('sem-outdoor')){aviso('Os outdoors estão desligados nos Ajustes (⚙️). Ligue de novo para anunciar.',false);return}
 const v=window.MH_vaga;if(!v){aviso('Os outdoors ainda estão carregando. Tente de novo em alguns segundos.',false);return}
 const i=v.livre(window.MH_vagaEsc);if(i<0)aviso('Todas as vagas estão ocupadas agora. Volte daqui a pouco!',false);else v.abrir(i)});
/* títulos das janelas sempre com iniciais maiúsculas (inclusive os que o JavaScript troca) */
const PEQ={de:1,da:1,do:1,das:1,dos:1,e:1,o:1,a:1,para:1,no:1,na:1,em:1,ao:1};
function tc(t){let n=0;return t.replace(/[A-Za-zÀ-ÿ0-9]+/g,w=>{const l=w.toLowerCase(),f=n++===0;if(l==='mihelp')return 'MiHelp';if(!f&&PEQ[l])return l;return /^[a-zà-ÿ]/.test(w)?w[0].toUpperCase()+w.slice(1):w})}
function titulos(){document.querySelectorAll('.bar .t').forEach(e=>{const a=e.textContent,b=tc(a);if(a!==b&&/^[a-zà-ÿ]/.test(a))e.textContent=b})}
titulos();new MutationObserver(titulos).observe(document.body,{childList:true,characterData:true,subtree:true});
})()}catch(e){console.error('MiHelp (ajustes v14):',e)}

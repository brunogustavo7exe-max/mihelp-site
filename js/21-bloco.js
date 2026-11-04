
/* Música ambiente desativada — só efeitos sonoros (MH_SOM). Stub evita erros no menu. */
try{(function(){
window.MH_MUS={lista:()=>[],faixa:()=>null,get:()=>0,vol:()=>{}};
const old=document.getElementById('musBtn');if(old)old.remove();
})()}catch(e){console.error('MiHelp (música):',e)}

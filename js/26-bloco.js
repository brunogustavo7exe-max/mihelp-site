
/* Guarda os anúncios no aparelho: ao recarregar ou sair da conta eles aparecem na hora, e o banco só confirma ou corrige depois. */
try{(function(){
const A=window.MH_ADS;if(!A||A._cache)return;A._cache=1;const K='mh_adscache';let t=0;
function salvar(){clearTimeout(t);t=setTimeout(()=>{try{const ag=Date.now(),l=[];A.vs().forEach((v,i)=>{if(v&&v.end>ag)l.push({i,v});});
  let j=JSON.stringify(l);if(j.length>1200000)j=JSON.stringify(l.map(x=>({i:x.i,v:Object.assign({},x.v,{img:null})})));
  localStorage.setItem(K,j)}catch(e){}},400)}
try{const l=JSON.parse(localStorage.getItem(K)||'[]'),ag=Date.now(),db=new Set(window._mhAdsDb||[]);
  l.forEach(a=>{if(a&&a.v&&a.v.end>ag&&a.i>=0&&a.i<A.total&&!A.vs()[a.i]){A.put(a.i,a.v);if(a.v._db)db.add(a.i)}});window._mhAdsDb=db}catch(e){}
const p0=A.put,c0=A.clear;A.put=function(i,v){const r=p0.apply(A,arguments);salvar();return r};A.clear=function(i){const r=c0.apply(A,arguments);salvar();return r};
})()}catch(e){console.error('MiHelp (cache de anúncios):',e)}

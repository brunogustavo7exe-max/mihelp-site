
/* ===== LIGAÇÃO COM O WIX ===== 
   Para ligar o site ao banco de dados do Wix, cole o Client ID entre as aspas de clientId.
   Deixe vazio ('') para o site rodar só em modo demonstração, sem salvar nada.
   bots: true  = mantém os bonecos de demonstração na sala (com a etiqueta "bot")
   bots: false = só pessoas de verdade                                                */
/* api: endereço do worker (Cloudflare), ex.: 'https://mihelp-api.SEUNOME.workers.dev'. Vazio = o site funciona como antes
   (contas só no aparelho, painel por PIN, Pix manual). Preenchido = contas em qualquer aparelho, painel por senha,
   limpar/apagar para todos e Pix automático. */
window.MH_CFG={
  clientId:'a633f724-c9b4-4ba8-a3f0-ef20c3c17279',
  bots:false,
  api:'https://mihelp-api.mihelpmarketing.workers.dev',
  adminPub:{x:'EhfJtAdwAwQa2XUxsuxWOTAjR7s7wxFfuCSHbSVn_SQ',y:'2MgeBeGOiZTDWP6EPkiS5AZN-LtYHDK-oBqymMta8MI'}
};
window.MH_API=(function(){
 const base=String((window.MH_CFG||{}).api||'').replace(/\/+$/,'');
 const ls=(f)=>{try{return f()}catch(e){return ''}};
 async function req(path,o){o=o||{};const hd={'content-type':'application/json'};if(o.token)hd.authorization='Bearer '+o.token;
  const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),o.ms||12000);
  try{const r=await fetch(base+path,{method:o.method||(o.body?'POST':'GET'),headers:hd,body:o.body?JSON.stringify(o.body):undefined,signal:ctl.signal});
   let j={};try{j=await r.json()}catch(e){}return {ok:r.ok,status:r.status,j}}
  catch(e){return {ok:false,status:0,j:{erro:'sem conexão'}}}finally{clearTimeout(to)}}
 return {on:()=>!!base,req,
  admTk:()=>ls(()=>sessionStorage.getItem('mh_admtk')||''),
  setAdmTk:v=>ls(()=>{v?sessionStorage.setItem('mh_admtk',v):sessionStorage.removeItem('mh_admtk')}),
  usrTk:()=>ls(()=>localStorage.getItem('mh_tk')||sessionStorage.getItem('mh_tk')||''),
  setUsrTk:v=>ls(()=>{localStorage.removeItem('mh_tk');sessionStorage.removeItem('mh_tk');if(v)(localStorage.getItem('mh_keep')==='0'?sessionStorage:localStorage).setItem('mh_tk',v)})}})();
window.MH_PUBP=(window.MH_API&&MH_API.on())?MH_API.req('/config').then(r=>{try{if(r&&r.ok&&r.j&&r.j.pub&&r.j.pub.x&&r.j.pub.y&&!(window.MH_CFG||{}).adminPub)window.MH_CFG.adminPub={x:r.j.pub.x,y:r.j.pub.y}}catch(e){}}).catch(()=>{}):Promise.resolve();
window.MH_DISCORD='https://discord.gg/eEe4nw7ss';
window.MH_FLOOR=(function(){try{if(localStorage.getItem('mh_floor_v')!=='2'){localStorage.setItem('mh_floor_v','2');localStorage.removeItem('mh_floor');localStorage.removeItem('mh_botsT');return {}}return JSON.parse(localStorage.getItem('mh_floor')||'{}')||{}}catch(e){return {}}})();

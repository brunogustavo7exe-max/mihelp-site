
try{
(function(){
  let META={alvo:5000,arrecadado:0,usos:[['Desenvolvimento do app',50],['Servidor, domínio e segurança',20],['Divulgação em Barra, Pontal e Aragarças',20],['Custos de pagamento e legais',10]]};
  try{const o=JSON.parse(localStorage.getItem('mihelp_adm_v1:meta'));if(o&&o.alvo>0)META=o}catch(e){}
  const f=n=>'R$ '+Number(n).toLocaleString('pt-BR');
  function desenhaMeta(){
  const pct=Math.min(100,Math.round(META.arrecadado/META.alvo*100));
  document.getElementById('mArr').textContent=f(META.arrecadado);
  document.getElementById('mAlvo').textContent=f(META.alvo);
  document.querySelector('#mBar i').style.width=pct+'%';
  document.getElementById('mBar').setAttribute('aria-valuenow',pct);
  document.getElementById('mPct').textContent=pct+'% da meta.';
  const u=document.getElementById('mUsos');u.textContent='';
  META.usos.forEach(x=>{const li=document.createElement('li');const b=document.createElement('b');b.textContent=x[1]+'% ';li.append(b,document.createTextNode(x[0]+' · '+f(Math.round(META.alvo*x[1]/100))));u.append(li)});}
  window.MH_aplicarMeta=o=>{if(o&&o.alvo>0)META=o;desenhaMeta()};window.MH_metaAtual=()=>META;desenhaMeta();
  const t='Vem para o MiHelp! Quem precisa de ajuda encontra, quem sabe fazer trabalha. Cadastro grátis: '+location.href.split('#')[0];
  document.querySelectorAll('a.wa').forEach(a=>{a.href='https://wa.me/?text='+encodeURIComponent(t)});
})();
}catch(e){console.error('MiHelp (meta):',e)}

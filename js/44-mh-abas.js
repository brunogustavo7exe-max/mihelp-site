
(function(){
 function ini(){
  if(document.getElementById('mhAbas')){return}
  var praca=document.getElementById('praca'),prof=document.getElementById('prof');
  if(!praca||!prof){return false}
  var w=document.createElement('div');w.className='mh-abas';w.id='mhAbas';w.setAttribute('role','group');w.setAttribute('aria-label','Profissionais ou estabelecimentos');
  var def='prof';try{def=localStorage.getItem('mh_aba_lista')||'prof'}catch(e){}
  var bs={};
  function set(k){document.documentElement.classList.toggle('mh-aba-prof',k==='prof');document.documentElement.classList.toggle('mh-aba-est',k==='est');
   for(var x in bs)bs[x].setAttribute('aria-pressed',String(x===k));try{localStorage.setItem('mh_aba_lista',k)}catch(e){}}
  [['prof','🔧','Profissionais'],['est','🏪','Estabelecimentos']].forEach(function(a){
   var b=document.createElement('button');b.type='button';b.setAttribute('aria-pressed','false');
   var s=document.createElement('span');s.textContent=a[1];b.append(s,document.createTextNode(a[2]));
   b.onclick=function(){set(a[0])};bs[a[0]]=b;w.append(b)});
  praca.before(w);set(def==='est'?'est':'prof');return true}
 var n=0,t=setInterval(function(){if(ini()!==false||++n>40)clearInterval(t)},250);
 /* atalhos "data-go=praca" abrem a aba de estabelecimentos */
 document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('[data-go="praca"]');if(a){var b=document.querySelector('#mhAbas button:last-child');if(b)b.click()}
  var p=e.target.closest&&e.target.closest('[data-go="prof"],[data-go="need"]');if(p){var c=document.querySelector('#mhAbas button:first-child');if(c)c.click()}},true);
})();

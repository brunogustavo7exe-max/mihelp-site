
(function(){var INFO=['saiba','hoje','tutorial','guia-chat','seguranca','taxas','duvidas','apoie','patrocinio','quem','privacidade'];
document.addEventListener('click',function(e){try{
if(!/^generico/.test(document.documentElement.dataset.tema||''))return;
var a=e.target.closest&&e.target.closest('nav.nv a.more[data-go]');if(!a)return;
var id=a.dataset.go;if(INFO.indexOf(id)<0)return;var t=document.getElementById(id);if(!t)return;
document.querySelectorAll('.mh-ver').forEach(function(x){x.classList.remove('mh-ver')});t.classList.add('mh-ver')}catch(_){}},true);})();

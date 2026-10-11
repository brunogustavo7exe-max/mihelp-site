/* Corrige relógio errado do celular: anúncios "vencem" cedo demais se o aparelho estiver adiantado. */
(function(){try{var o=Date.now.bind(Date),k=0;window.MH_SKEW_RAW=null;Date.now=function(){return o()+k};
fetch(location.pathname||'/',{method:'HEAD',cache:'no-store'}).then(function(r){var d=r.headers.get('date');if(!d)return;var s=new Date(d).getTime()+(Number(r.headers.get('age'))||0)*1000;if(!isFinite(s))return;var df=s-o();window.MH_SKEW_RAW=df;if(Math.abs(df)>120000)k=df}).catch(function(){})}catch(e){}})();

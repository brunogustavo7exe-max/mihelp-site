
try{(function(){
const $=id=>document.getElementById(id);
const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const btn=$('navSup');if(!btn)return;
const d=document.createElement('dialog');d.id='supDlg';d.setAttribute('aria-label','Falar com o suporte');document.body.append(d);
const lerLoc=()=>{try{return JSON.parse(localStorage.getItem('mh_sup_local')||'[]')||[]}catch(e){return []}};
function abrir(){
  d.textContent='';
  const f=mk('form');
  f.append(mk('h3',0,'Falar com o suporte'),mk('p','note','Conte o erro, a dúvida ou a sugestão. Quanto mais detalhe, mais rápido a gente resolve. Não envie senha.'));
  const fld=(l,el,id)=>{const w=mk('div','f');el.id=id;const lb=mk('label',0,l);lb.htmlFor=id;w.append(lb,el);return w};
  const tipo=mk('select');['Erro no site','Dúvida','Sugestão','Reclamação'].forEach(x=>tipo.append(new Option(x,x)));
  const tx=mk('textarea');tx.rows=5;tx.maxLength=500;tx.required=true;tx.placeholder='O que aconteceu? Em que parte do site?';
  const ct=mk('input');ct.type='text';ct.maxLength=80;ct.placeholder='E-mail ou telefone (opcional, só o suporte vê)';
  const cnt=mk('small','note','0/500');tx.addEventListener('input',()=>{cnt.textContent=tx.value.length+'/500'});
  const st=mk('p','note','');st.setAttribute('role','status');
  const bar=mk('div','dbt');const ok=mk('button','go','Enviar');ok.type='submit';const cx=mk('button','cx','Fechar');cx.type='button';cx.onclick=()=>d.close();bar.append(ok,cx);
  f.append(fld('Assunto',tipo,'supTipo'),fld('Mensagem',tx,'supTexto'),cnt,fld('Contato',ct,'supContato'),st,bar);
  f.addEventListener('submit',async e=>{e.preventDefault();
    const agora=Date.now(),ult=Number(sessionStorage.getItem('mh_sup_t')||0);
    if(agora-ult<20000){st.textContent='Espere alguns segundos para mandar outra mensagem.';return}
    const eu=window.MH_UI&&MH_UI.eu&&MH_UI.eu();
    const rec={tipo:tipo.value,texto:tx.value.trim(),contato:ct.value.trim(),autor:eu?eu.nome:'',pagina:location.pathname+location.hash,aparelho:navigator.userAgent.slice(0,140)};
    if(!rec.texto){st.textContent='Escreva a mensagem.';return}
    ok.disabled=true;st.textContent='Enviando...';
    const loc=lerLoc();loc.unshift(Object.assign({quando:agora},rec));try{localStorage.setItem('mh_sup_local',JSON.stringify(loc.slice(0,30)));sessionStorage.setItem('mh_sup_t',String(agora))}catch(x){}
    try{
      if(window.MH_DB&&MH_DB.ok){await MH_DB.suporte(rec);st.textContent='Enviado. Obrigado! O suporte vai ler a sua mensagem.'}
      else st.textContent='Sem conexão com o banco agora. Sua mensagem ficou guardada só neste aparelho.';
      tx.value='';cnt.textContent='0/500'}
    catch(x){st.textContent='Não consegui enviar. Tente de novo em instantes.'}
    ok.disabled=false});
  d.append(f);d.showModal();tx.focus()}
btn.addEventListener('click',abrir);
})()}catch(e){console.error('MiHelp (suporte):',e)}

(() => {
  const select=document.querySelector('#activity'),frame=document.querySelector('#preview'),status=document.querySelector('#status');
  const options=[...select.options];
  let timeout;
  function openActivity(id) {
    const option=options.find(item=>item.value===id);if(!option)return;
    clearTimeout(timeout);select.value=id;frame.hidden=false;
    document.querySelector('#previous').disabled=select.selectedIndex===0;
    document.querySelector('#next').disabled=select.selectedIndex===options.length-1;
    status.textContent='Chargement de la page de fin…';
    history.replaceState(null,'','#'+id);
    frame.title='Page de fin — '+option.textContent;
    frame.src='pages/'+id+'.html?v=1';
    timeout=setTimeout(()=>{status.textContent='Le chargement prend plus de temps que prévu. Vous pouvez ouvrir la page de fin directement avec le lien ci-dessous.';},12000);
    document.querySelector('#open-page').href=frame.src;
  }
  frame.addEventListener('load',()=>{
    clearTimeout(timeout);
    try {
      if(!frame.contentDocument?.querySelector('main')){
        status.textContent='Cette page de fin est absente du site. Le dossier apercus-fins/pages doit aussi être publié.';return;
      }
    } catch {
      // En ouverture directe depuis le disque, le navigateur peut interdire
      // l’inspection du cadre. Le document HTML reste consultable sans script.
    }
    status.textContent=(select.selectedIndex+1)+' / '+options.length+' — '+select.selectedOptions[0].textContent;
  });
  select.onchange=()=>openActivity(select.value);
  document.querySelector('#previous').onclick=()=>openActivity(options[select.selectedIndex-1]?.value);
  document.querySelector('#next').onclick=()=>openActivity(options[select.selectedIndex+1]?.value);
  document.querySelector('#format').onchange=event=>document.querySelector('#viewport').classList.toggle('mobile',event.target.value==='mobile');
  const hash=location.hash.slice(1);
  openActivity(options.some(option=>option.value===hash)?hash:options[0].value);
})();

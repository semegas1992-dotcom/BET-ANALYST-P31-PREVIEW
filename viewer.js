'use strict';
const status=document.getElementById('status'),out=document.getElementById('c4-output');
const selector=document.getElementById('sport');
function sync(){for(const b of document.querySelectorAll('[data-sport]'))b.setAttribute('aria-pressed',String(b.dataset.sport===selector.value))}
for(const b of document.querySelectorAll('[data-sport]'))b.onclick=()=>{selector.value=b.dataset.sport;sync();out.replaceChildren();status.textContent='Sport sélectionné : '+b.textContent;};
selector.addEventListener('change',sync);
document.getElementById('load').onclick=async()=>{
 const sport=document.getElementById('sport').value;
 const button=document.getElementById('load');button.disabled=true;for(const b of document.querySelectorAll('[data-sport]'))b.disabled=true;
 status.textContent='Chargement '+sport;out.replaceChildren();
 try{
 const response=await fetch('./reports.json');if(!response.ok)throw Error('Rapports indisponibles');
 const data=await response.json(),v=data[sport];
 if(!v||v.scope!=='PRECOMPUTED_SYNTHETIC'||v.registered_result.engine_access!==false||v.registered_result.qualification!=='BLOCKED'||v.registered_result.publication!=='BLOCKED')throw Error('Verrous absents');
 // Reuse existing reader via its browser export.
 window.P31Reader.render(v.report,out,document);
 status.textContent='Rejeu précalculé — '+sport+' — contrôle Python enregistré : '+v.registered_result.state+' ; aucune conclusion sportive.';
 }catch(e){out.replaceChildren();status.textContent='Refus : '+e.message}finally{button.disabled=false;for(const b of document.querySelectorAll('[data-sport]'))b.disabled=false}
};
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(e=>{status.textContent='Cache indisponible : '+e.message});

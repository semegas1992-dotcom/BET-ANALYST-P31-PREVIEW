export async function readCalendar(bytes,expected){
 if(!(bytes instanceof Uint8Array)||bytes.length>1048576||!bytes.length||!/^[a-f0-9]{64}$/.test(expected))throw Error('Fichier ou empreinte invalide');
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
 if(hash!==expected)throw Error('Empreinte différente');
 const d=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
 if(d.schema!=='OPENLIGA_SELECTIVE_V1'||d.source!=='OpenLigaDB'||d.license!=='ODbL-1.0'||d.original_retained!==false||d.engine_access!==false||d.publication!=='BLOCKED'||d.qualification!=='BLOCKED'||!/^[a-f0-9]{64}$/.test(d.source_sha256))throw Error('Quarantaine obligatoire');
 const cutoff=Date.parse(d.cutoff),captured=Date.parse(d.captured_at);
 if(!Number.isFinite(cutoff)||!Number.isFinite(captured)||captured>cutoff||!Array.isArray(d.matches)||d.matches.length>1000)throw Error('Archive invalide');
 const ids=new Set();
 const matches=d.matches.map(m=>{if(!Number.isSafeInteger(m.id)||ids.has(m.id)||!Number.isFinite(Date.parse(m.kickoff))||Date.parse(m.kickoff)<=cutoff||typeof m.home!=='string'||typeof m.away!=='string'||!m.home.trim()||!m.away.trim()||m.home.length>200||m.away.length>200||Object.keys(m).sort().join(',')!=='away,home,id,kickoff')throw Error('Rencontre invalide');ids.add(m.id);return {id:m.id,kickoff:m.kickoff,home:m.home,away:m.away}});
 return {matches,captured_at:d.captured_at,hash};
}
if(typeof document!=='undefined'){
 const button=document.getElementById('ol-read'),out=document.getElementById('ol-output');
 button?.addEventListener('click',async()=>{out.replaceChildren();try{
 const f=document.getElementById('ol-file').files[0],h=document.getElementById('ol-hash').value.trim();
 if(!f||f.size>1048576)throw Error('Choisir un fichier JSON valide');
 const d=await readCalendar(new Uint8Array(await f.arrayBuffer()),h);
 const p=document.createElement('p');p.textContent=d.matches.length+' rencontres — capture '+d.captured_at+' — quarantaine, aucune admission';out.append(p);
 for(const m of d.matches){const p=document.createElement('p');p.textContent=m.kickoff+' — '+m.home+' / '+m.away;out.append(p)}
 }catch(e){out.textContent='Import refusé : '+e.message}});
 document.getElementById('ol-clear')?.addEventListener('click',()=>{out.replaceChildren();document.getElementById('ol-file').value='';document.getElementById('ol-hash').value=''});
}

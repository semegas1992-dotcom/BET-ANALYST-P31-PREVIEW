export async function readCalendar(bytes,expected){
 if(!(bytes instanceof Uint8Array)||bytes.length>1048576||!bytes.length||!/^[a-f0-9]{64}$/.test(expected))throw Error('Fichier ou empreinte invalide');
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
 if(hash!==expected)throw Error('Empreinte différente');
 const d=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
 if(d.schema!=='OPENLIGA_SELECTIVE_V1'||d.source!=='OpenLigaDB'||d.license!=='ODbL-1.0'||d.original_retained!==false||d.engine_access!==false||d.publication!=='BLOCKED'||d.qualification!=='BLOCKED'||!/^[a-f0-9]{64}$/.test(d.source_sha256))throw Error('Quarantaine obligatoire');
 const cutoff=Date.parse(d.cutoff),captured=Date.parse(d.captured_at);
 if(!Number.isFinite(cutoff)||!Number.isFinite(captured)||captured>cutoff||!Array.isArray(d.matches)||d.matches.length>1000)throw Error('Archive invalide');
 const ids=new Set();
 const matches=d.matches.map(m=>{if(!Number.isSafeInteger(m.id)||ids.has(m.id)||typeof m.kickoff!=='string'||!/(Z|[+-]\d{2}:\d{2})$/.test(m.kickoff)||!Number.isFinite(Date.parse(m.kickoff))||Date.parse(m.kickoff)<=cutoff||typeof m.home!=='string'||typeof m.away!=='string'||!m.home.trim()||!m.away.trim()||m.home.length>200||m.away.length>200||Object.keys(m).sort().join(',')!=='away,home,id,kickoff')throw Error('Rencontre invalide');ids.add(m.id);return {id:m.id,kickoff:m.kickoff,home:m.home,away:m.away}});
 return {matches,captured_at:d.captured_at,hash};
}
export async function readBundle(bytes){
 if(!(bytes instanceof Uint8Array)||!bytes.length||bytes.length>1500000)throw Error('Paquet invalide');
 const b=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
 if(b.schema!=='OPENLIGA_BUNDLE_V1'||Object.keys(b).sort().join(',')!=='calendar, schema, sha256'.replaceAll(' ','')||typeof b.calendar!=='string')throw Error('Paquet invalide');
 const d=await readCalendar(new TextEncoder().encode(b.calendar),b.sha256);
 return {...d,integrity:'SELF_CONTAINED_UNAUTHENTICATED'};
}
const fmt=new Intl.DateTimeFormat('fr-FR',{timeZone:'Europe/Paris',dateStyle:'medium',timeStyle:'short'});
const day=new Intl.DateTimeFormat('fr-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'});
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export function calendarPage(matches,query='',date='',page=1){
 const rows=matches.filter(m=>norm(m.home+' '+m.away).includes(norm(query))&&(!date||day.formatToParts(new Date(m.kickoff)).filter(p=>['year','month','day'].includes(p.type)).sort((a,b)=>['year','month','day'].indexOf(a.type)-['year','month','day'].indexOf(b.type)).map(p=>p.value).join('-')===date)).sort((a,b)=>Date.parse(a.kickoff)-Date.parse(b.kickoff)||a.id-b.id);
 const pages=Math.max(1,Math.ceil(rows.length/20));page=Math.max(1,Math.min(pages,page));
 return {rows:rows.slice((page-1)*20,page*20),total:rows.length,pages,page};
}


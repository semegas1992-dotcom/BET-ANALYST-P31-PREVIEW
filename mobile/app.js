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

const $=id=>document.getElementById(id), key='bet.mobile.calendar.v1', hist='bet.mobile.reports.v1';let d=null,page=1,chosen=null,generation=0;
function tab(id){for(const x of ['fixtures','analysis','history','settings'])$(x).hidden=x!==id;for(const b of document.querySelectorAll('[data-tab]'))b.setAttribute('aria-selected',String(b.dataset.tab===id));if(id==='history')showHistory();window.scrollTo(0,0)}
for(const b of document.querySelectorAll('[data-tab]'))b.onclick=()=>tab(b.dataset.tab);
function node(tag,txt,parent){const n=document.createElement(tag);n.textContent=txt;parent.append(n);return n}
function render(){const list=$('list');list.replaceChildren();if(!d){$('prev').disabled=$('next').disabled=true;return}const v=calendarPage(d.matches.filter(m=>Date.parse(m.kickoff)>Date.now()),$('query').value,$('date').value,page);page=v.page;$('status').textContent=v.total+' rencontres à venir · page '+page+'/'+v.pages+' · heure de Paris non confirmée';for(const m of v.rows){const a=node('article','',list);node('small',fmt.format(new Date(m.kickoff))+' · Bundesliga',a);const b=node('button','Analyser',a);b.onclick=()=>select(m);node('p',m.home,a);node('p',m.away,a)}$('prev').disabled=page===1;$('next').disabled=page===v.pages}
function select(m){chosen=m;$('selected').textContent=m.home+' – '+m.away;$('prompt').value=['BET ANALYST V3 — Analyse sportive MVP','Football : '+m.home+' – '+m.away,'Coup d’envoi UTC : '+new Date(m.kickoff).toISOString(),'Heure de Paris calculée : '+fmt.format(new Date(m.kickoff)),'OpenLigaDB ID : '+m.id,'Capture : '+d.captured_at,'Calendrier en quarantaine, aucune admission moteur. Vérifie identité et horaire auprès de la compétition officielle ; signale toute divergence. Recherche les données pré-match autorisées, cite les sources, distingue les manques. Applique KRAFT V3.0 si disponible, sans inventer de chiffres. Contexte, forme, rapport de force, match-up, scénarios, incertitudes. Sans mise ni décision de pari.'].join('\n');for(const x of ['prompt','copy','chat'])$(x).hidden=false;$('copy').textContent='Copier la demande';tab('analysis')}
async function restore(raw,token){const v=await readBundle(new TextEncoder().encode(raw));if(token!==generation)return false;d=v;page=1;$('importer').hidden=true;render();return true}
$('load').onclick=async()=>{const token=++generation;try{const f=$('file').files[0];if(!f||f.size>1500000)throw Error('Choisir un fichier valide');const raw=await f.text();if(await restore(raw,token)){try{localStorage.setItem(key,raw)}catch{$('status').textContent+=' · stockage local indisponible'}}}catch(e){if(token===generation)$('status').textContent='Import refusé : '+e.message}};
$('forget').onclick=()=>{generation++;localStorage.removeItem(key);d=null;chosen=null;$('importer').hidden=false;$('status').textContent='Calendrier effacé';$('prompt').value='';$('selected').textContent='Choisis une rencontre.';for(const x of ['prompt','copy','chat'])$(x).hidden=true;render();tab('fixtures')};
$('query').oninput=$('date').oninput=()=>{page=1;render()};$('prev').onclick=()=>{page--;render()};$('next').onclick=()=>{page++;render()};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText($('prompt').value);$('copy').textContent='Copié'}catch{$('prompt').focus();$('prompt').select();$('copy').textContent='Copier le texte sélectionné'}};
function reports(){try{return JSON.parse(localStorage.getItem(hist)||'[]')}catch{return []}}
$('save').onclick=()=>{if(!chosen||!$('report').value.trim()){alert('Choisis une rencontre et colle le rapport.');return}try{localStorage.setItem(hist,JSON.stringify([{title:chosen.home+' – '+chosen.away,report:$('report').value,at:new Date().toISOString()},...reports()]));$('report').value='';tab('history')}catch{alert('Stockage indisponible')}};
function showHistory(){const p=$('saved');p.replaceChildren();for(const r of reports()){const a=node('details','',p);node('summary',r.title,a);const t=node('p',r.report,a);t.style.whiteSpace='pre-wrap'}if(!p.children.length)node('p','Aucun rapport enregistré.',p)}
try{const raw=localStorage.getItem(key);if(raw)restore(raw,++generation).catch(e=>$('status').textContent='Calendrier local refusé : '+e.message);else $('status').textContent='Importe ton calendrier une première fois.'}catch{$('status').textContent='Stockage local indisponible'}

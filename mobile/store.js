export const HISTORY='bet.mobile.reports.v1';
export const MAX=4000000;
export function validateReports(rows){
 if(!Array.isArray(rows)||rows.length>500)throw Error('Historique invalide (500 rapports maximum)');
 return rows.map(r=>{
  if(!r||typeof r.title!=='string'||!r.title.trim()||r.title.length>400||typeof r.report!=='string'||!r.report.trim()||r.report.length>300000||typeof r.at!=='string'||!Number.isFinite(Date.parse(r.at)))throw Error('Rapport invalide');
  const sport=r.sport||'Non renseigné';if(!['Football','NBA','Tennis','Non renseigné'].includes(sport))throw Error('Sport invalide');
  for(const k of ['prompt','dossier'])if(r[k]!==undefined&&(typeof r[k]!=='string'||r[k].length>400000))throw Error('Dossier invalide');
  return {title:r.title,report:r.report,at:r.at,sport,prompt:r.prompt||'',dossier:r.dossier||''};
 });
}
export function readReports(storage){return validateReports(JSON.parse(storage.getItem(HISTORY)||'[]'))}
export function mergeReports(existing,incoming){
 const map=new Map();for(const r of [...validateReports(incoming),...validateReports(existing)])map.set(JSON.stringify([r.title,r.at,r.report]),r);
 const rows=validateReports([...map.values()]).sort((a,b)=>Date.parse(b.at)-Date.parse(a.at));if(JSON.stringify(rows).length>MAX)throw Error('Historique trop volumineux');return rows;
}
export function parseBackup(raw){
 if(typeof raw!=='string'||new TextEncoder().encode(raw).length>MAX)throw Error('Sauvegarde trop volumineuse');
 const b=JSON.parse(raw);if(b.schema!=='BET_MOBILE_BACKUP_V1')throw Error('Format de sauvegarde inconnu');
 if(b.calendar!==null&&typeof b.calendar!=='string')throw Error('Calendrier invalide');
 return {reports:validateReports(b.reports),calendar:b.calendar};
}
export function makeBackup(reports,calendar){const b={schema:'BET_MOBILE_BACKUP_V1',exported_at:new Date().toISOString(),reports:validateReports(reports),calendar};const raw=JSON.stringify(b,null,2);parseBackup(raw);return raw}

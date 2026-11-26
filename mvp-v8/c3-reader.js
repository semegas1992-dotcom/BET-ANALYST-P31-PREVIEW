'use strict';
// Only reads a validated snapshot, never writes to the editor, history, or storage.
function c3RenderModel(sheet){
 if(!sheet||sheet.schema!=='BET_ANALYST_CONSOLIDATION_V1'||!['FOOTBALL','TENNIS','NBA'].includes(sheet.sport)||!Array.isArray(sheet.markets))throw Error('Fiche C2 non reconnue');
 const keys=['event','date','cutoff','sources','force','matchup','scenarios','summary','decision','reason'];
 if(keys.some(k=>typeof sheet[k]!=='string'))throw Error('Champs C2 incomplets');
 if(sheet.markets.some(m=>!m||['label','period','threshold','evidence','status'].some(k=>typeof m[k]!=='string')))throw Error('Marchés C2 incomplets');
 return {sport:sheet.sport,event:sheet.event,date:sheet.date,cutoff:sheet.cutoff,sections:[['Synthèse','summary'],['Rapport de force','force'],['Match-up','matchup'],['Scénarios A/B/C et incertitudes','scenarios'],['Sources / références D0','sources']].map(([label,key])=>({label,value:sheet[key]||'Information non renseignée'})),markets:sheet.markets.map(m=>({...m})),decision:sheet.decision,reason:sheet.reason||'Réserves non renseignées'};
}
function c3Show(sheet){
 const d=c3RenderModel(sheet),root=document.getElementById('c3-reader-content');root.replaceChildren();
 const element=(tag,value)=>{const e=document.createElement(tag);e.textContent=value;return e};
 root.append(element('h3',d.event||'Rencontre non renseignée'),element('p',[d.sport,d.date||'Date manquante',d.cutoff||'Coupure non renseignée'].join(' · ')));
 for(const s of d.sections){const a=element('article','');a.append(element('h3',s.label),element('pre',s.value));root.append(a)}
 const m=element('article','');m.append(element('h3','Marchés déclarés — collectif / individuel non précisé dans C2'));
 if(!d.markets.length)m.append(element('p','Aucun marché enregistré'));
 for(const market of d.markets){const a=element('article','');a.append(element('strong',market.label+' — '+market.status),element('p','Période : '+market.period+' | Seuil : '+(market.threshold||'Non renseigné')),element('p','Preuves déclarées : '+market.evidence));m.append(a)}
 root.append(m,element('h3','Décision finale'),element('p',d.decision),element('h3','Justification et réserves documentaires'),element('pre',d.reason));
 document.getElementById('c3-reader').hidden=false;document.getElementById('c3-reader').scrollIntoView({behavior:'smooth'});
}
if(typeof module!=='undefined')module.exports={c3RenderModel};

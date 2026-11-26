'use strict';
(function(root){
function validate(r){
 if(!r||r.schema!=='C4_KRAFT_REPORT_SYNTHETIC_V1'||!Array.isArray(r.sections)||r.sections.length!==7||r.sections.some((s,i)=>!s||s.number!==i+1))throw Error('Rapport incompatible');
 const q=r.quick_summary;
 if(!q||!/^([a-f0-9]{64})$/.test(r.event_sha256)||q.event_sha256!==r.event_sha256)throw Error('Identité incohérente');
 for(const x of [r,q])if(x.engine_access!==false||x.publication!=='BLOCKED'||x.qualification!=='BLOCKED')throw Error('Verrous absents');
 if(q.sporting_conclusion!=='NOT_ESTABLISHED'||q.decision!=='NOT_ESTABLISHED'||q.dominant_trajectory!==null||!Array.isArray(q.markets)||q.markets.length>5||q.markets.some(m=>!m||m.status!=='NOT_EVALUATED'||!Object.hasOwn(m,'contract')))throw Error('Conclusion non autorisée');
 return q;
}
const labels={detail:'Détail',status:'Statut',evidence:'Éléments de preuve',missing:'Données manquantes',identity:'Identité',context:'Contexte',matched_opposition:'Opposition comparable',interactions:'Interactions',observation_prompts:'Points à observer',opposition_context:'Contexte adverse',scenarios:'Scénarios',scoped_uncertainty:'Incertitudes',trajectories:'Trajectoires',descriptive_envelopes:'Plages descriptives',scoped_arguments:'Arguments contextualisés',sequences:'Séquences',availability_routing:'Disponibilité',event_contracts:'Contrats de marché',market_scopes:'Périmètres des marchés',data_quality:'Qualité des données',market_arguments:'Arguments de marché',sporting_reasoning:'Raisonnement sportif',NOT_ESTABLISHED:'Non établi',NOT_EVALUATED:'Non évalué',BLOCKED:'Bloqué', 'Event identity only matched to synthetic labels and kickoff':'Identité rapprochée uniquement des libellés et horaires synthétiques', 'Documentary records not authenticated or linked to individual observations':'Documents non authentifiés ou non reliés aux observations individuelles', 'No verified tactical or sequence projection':'Aucune projection tactique ou séquentielle vérifiée', 'No event market evaluation':'Aucune évaluation des marchés de la rencontre'};
function render(r,el,doc){
 el.replaceChildren();const q=validate(r);
 function add(tag,value,parent=el){const n=doc.createElement(tag);n.textContent=value;parent.append(n);return n}
 add('h3','Synthèse rapide — rapport synthétique non authentifié');
 add('p','Conclusion sportive : non établie');
 add('p','Trajectoire dominante : non déterminée');
 add('p','Décision opérationnelle : non établie');
 for(const m of q.markets)add('p','Marché non évalué : '+JSON.stringify(m.contract));
 add('p','Données manquantes : '+(Array.isArray(q.missing)?q.missing.map(x=>labels[x]??x).join(', ')||'Aucune renseignée':'Non renseignées'));
 add('h4','Limites documentaires');const ul=add('ul','');for(const x of q.limitations??[])add('li',labels[x]??x,ul);
 const envelopes=r.sections[4].descriptive_envelopes??{};
 if(Object.keys(envelopes).length){
   add('h4','Contrastes historiques — descriptifs uniquement');
   for(const [metric,v] of Object.entries(envelopes)){
     const direction={POSITIVE:'positive',NEGATIVE:'négative',UNRESOLVED:'non résolue'}[v.direction]??'non renseignée';
     add('p',metric+' : '+direction+' ; plage '+JSON.stringify(v.envelope)+' ; couverture '+(v.complete===true?'complète':'incomplète'));
   }
   add('p','Ces contrastes ne sont ni des prévisions ni des probabilités.');
 }
 const d=add('details','');add('summary','Analyse approfondie — données déclaratives',d);
 function readable(v,parent){if(v===null){add('span','Non renseigné',parent);return}if(typeof v!=='object'){add('span',typeof v==='boolean'?(v?'Oui':'Non'):String(labels[v]??v),parent);return}const entries=Object.entries(v);if(!entries.length){add('span','Aucun élément renseigné',parent);return}const list=add('dl','',parent);for(const [k,x] of entries){add('dt',Array.isArray(v)?'Élément '+(Number(k)+1):labels[k]??k,list);readable(x,add('dd','',list))}}
 for(const s of r.sections){const panel=add('article','',d);add('h4',s.number+'. '+String(s.title??s.number),panel);for(const [k,v] of Object.entries(s)){if(k==='number'||k==='title')continue;add('h5',labels[k]??k,panel);readable(v,panel)}}
 const raw=add('details','',el);add('summary','Données originales — JSON intégral',raw);add('pre',JSON.stringify(r,null,2),raw);
}
if(typeof module!=='undefined')module.exports={validate,render};
root.P31Reader={validate,render};
if(root.document){const doc=root.document;const f=doc.getElementById('c4-file'),out=doc.getElementById('c4-output');f.addEventListener('change',async()=>{out.replaceChildren();try{const file=f.files[0];if(!file)return;if(file.size>1048576)throw Error('Maximum 1 Mo');render(JSON.parse(await file.text()),out,doc)}catch(e){out.textContent='Import refusé : '+e.message}})}
})(typeof globalThis==='undefined'?this:globalThis);

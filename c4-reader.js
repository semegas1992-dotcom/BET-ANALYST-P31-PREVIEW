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
function render(r,el,doc){
 el.replaceChildren();const q=validate(r);
 function add(tag,value,parent=el){const n=doc.createElement(tag);n.textContent=value;parent.append(n);return n}
 add('h3','Synthèse rapide — rapport synthétique non authentifié');
 add('p','Conclusion sportive : non établie');
 add('p','Trajectoire dominante : non déterminée');
 add('p','Décision opérationnelle : non établie');
 for(const m of q.markets)add('p','Marché non évalué : '+JSON.stringify(m.contract));
 add('p','Données manquantes : '+JSON.stringify(q.missing??null));
 add('p','Limites : '+JSON.stringify(q.limitations??null));
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
 for(const s of r.sections){add('h4',String(s.title??s.number),d);add('pre',JSON.stringify(s,null,2),d)}
}
if(typeof module!=='undefined')module.exports={validate,render};
root.P31Reader={validate,render};
if(root.document){const doc=root.document;const f=doc.getElementById('c4-file'),out=doc.getElementById('c4-output');f.addEventListener('change',async()=>{out.replaceChildren();try{const file=f.files[0];if(!file)return;if(file.size>1048576)throw Error('Maximum 1 Mo');render(JSON.parse(await file.text()),out,doc)}catch(e){out.textContent='Import refusé : '+e.message}})}
})(typeof globalThis==='undefined'?this:globalThis);

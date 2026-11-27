// Presentation only. Source report remains stored and exportable byte-for-byte.
export function splitReport(raw){
 const sections=[];let current={title:'Repères',lines:[]};
 for(const line of raw.split(/\r?\n/)){
  const m=line.match(/^\s*(?:#{1,4}\s+|\*\*)?(\d{1,2})[.)]\s+(.+?)(?:\*\*)?\s*$/);
  if(m&&Number(m[1])>=1&&Number(m[1])<=7){if(current.lines.some(x=>x.trim()))sections.push(current);current={title:m[1]+'. '+m[2].replace(/\*\*$/,''),lines:[]}}
  else current.lines.push(line);
 }
 if(current.lines.some(x=>x.trim()))sections.push(current);
 return sections;
}
const clean=s=>s.replace(/\*\*([^*]+)\*\*/g,'$1').replace(/\*([^*]+)\*/g,'$1');
function node(tag,text,parent){const n=document.createElement(tag);n.textContent=text;parent.append(n);return n}
function blocks(lines,parent){
 let i=0;
 while(i<lines.length){
  if(lines[i].trim().startsWith('|')&&i+1<lines.length&&/^\s*\|?[\s:|\-]+\|\s*$/.test(lines[i+1])){
   const cells=s=>s.trim().replace(/^\||\|$/g,'').split('|').map(x=>clean(x.trim()));
   const headings=cells(lines[i]);i+=2;
   while(i<lines.length&&lines[i].trim().startsWith('|')){const values=cells(lines[i++]),card=node('div','',parent);card.className='report-record';values.forEach((v,j)=>{const p=node('p','',card);node('strong',(headings[j]||'')+' : ',p);p.append(document.createTextNode(v))})}
  }else{const text=[];while(i<lines.length&&!(lines[i].trim().startsWith('|')&&i+1<lines.length&&/^\s*\|?[\s:|\-]+\|\s*$/.test(lines[i+1])))text.push(lines[i++]);const t=text.join('\n').trim();if(t)node('p',clean(t),parent)}
 }
}
export function renderReport(raw,parent){
 const sections=splitReport(raw);const body=node('div','',parent);body.className='report-body';
 sections.forEach((s,i)=>{const d=node('details','',body);d.className='report-section';d.open=i===0||/^1[.)]/.test(s.title);node('summary',s.title,d);blocks(s.lines,d)});
 const source=node('details','',parent);source.className='source-report';node('summary','Texte original et références',source);node('pre',raw,source);
}

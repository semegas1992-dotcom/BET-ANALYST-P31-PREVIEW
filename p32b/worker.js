
let runtime;
async function initialize(){
 importScripts('./runtime/pyodide.js');
 const py=await loadPyodide({indexURL:new URL('./runtime/',self.location.href).href});
 const r=await fetch('./engine.zip');if(!r.ok)throw Error('Moteur indisponible');
 py.unpackArchive(await r.arrayBuffer(),'zip',{extractDir:'/engine'});
 await py.runPythonAsync("import sys,json\nsys.path.insert(0,'/engine')\nfrom p32_diagnostics import browser_generate");
 return py;
}
self.onmessage=async({data:sport})=>{try{
 if(!['football','nba','tennis'].includes(sport))throw Error('Sport refusé');
 const py=await(runtime??=initialize());
 py.globals.set('requested_sport',sport);
 const result=JSON.parse(await py.runPythonAsync("json.dumps(browser_generate(requested_sport))"));
 self.postMessage({result});
}catch(e){runtime=undefined;self.postMessage({error:String(e.stack||e)});}};

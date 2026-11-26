const CACHE='bet-p31-preview-v5';
const ASSETS=['./','./index.html','./viewer.js','./c4-reader.js','./reports.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url),scope=new URL(self.registration.scope);
 if(e.request.method!=='GET'||!u.href.startsWith(scope.href))return;
 e.respondWith((async()=>{
 const c=await caches.open(CACHE);
 if(e.request.mode==='navigate'&&(u.pathname===scope.pathname||u.pathname===scope.pathname+'index.html')){
 u.searchParams.delete('utm_source');
 if(!u.search)return (await c.match(u.href))||fetch(e.request);
 }
 return (await c.match(e.request))||fetch(e.request);
 })());
});
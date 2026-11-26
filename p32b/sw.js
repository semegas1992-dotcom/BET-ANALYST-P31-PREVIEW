const CACHE='p32-browser-v1';self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('message',e=>{if(e.data!=='prepare')return;e.waitUntil((async()=>{try{const c=await caches.open(CACHE);const r=await fetch('./assets.json');if(!r.ok)throw Error('manifest');const assets=await r.json();await c.addAll(['./','./assets.json',...assets]);e.ports[0].postMessage({ok:true})}catch{e.ports[0].postMessage({ok:false})}})())});self.addEventListener('fetch',e=>{
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

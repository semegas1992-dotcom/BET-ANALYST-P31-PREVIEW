'use strict';
const CACHE='bet-hybrid-mvp-v9';
const ASSETS=['./','./index.html','./c3-reader.js','./c4-reader.js','./openliga-reader.js','./manifest.webmanifest'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const names=await caches.keys();
  await Promise.all(names.filter(name=>name.startsWith('bet-hybrid-mvp-')&&name!==CACHE).map(name=>caches.delete(name)));
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const req=event.request;
 const url=new URL(req.url);
 const scope=new URL(self.registration.scope);
 if(req.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 event.respondWith((async()=>{
   const cache=await caches.open(CACHE);
   const cached=await cache.match(req);
   if(cached)return cached;
   try{return await fetch(req)}catch(error){
     if(req.mode==='navigate'){
       const fallback=await cache.match(new URL('./index.html',scope).href);
       if(fallback)return fallback;
     }
     throw error;
   }
 })());
});

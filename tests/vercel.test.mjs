import test from 'node:test';
import assert from 'node:assert/strict';
import extract from '../api/extract.js';
import download from '../api/pdf-download.js';
import {handleExtraction} from '../server/worker.mjs';

const origin='https://cvmaker.example';
test('Vercel PDF function preserves attachment bytes and same-origin protection',async()=>{
 const pdf='%PDF-1.4\nexample\n%%EOF';
 const request=(from)=>new Request(origin+'/api/pdf-download',{
  method:'POST',headers:{Origin:from},
  body:new URLSearchParams({pdf:btoa(pdf),filename:'resume.pdf'})
 });
 const response=await download.fetch(request(origin));
 assert.equal(response.status,200);
 assert.match(response.headers.get('content-disposition'),/^attachment;/);
 assert.equal(await response.text(),pdf);
 assert.equal((await download.fetch(request('https://elsewhere.example'))).status,403);
});
test('Vercel extraction function rejects unrelated origins before provider access',async()=>{
 const response=await extract.fetch(new Request(origin+'/api/extract',{
  method:'POST',headers:{Origin:'https://elsewhere.example','Content-Type':'application/json'},
  body:JSON.stringify({text:'Taylor Example is a developer with JavaScript experience.'})
 }));
 assert.equal(response.status,403);
});
test('Vercel extraction rate limit uses forwarded client IP, not spoofed Cloudflare headers',async()=>{
 const env={VERCEL:'1',GEMINI_API_KEY:'test-only-secret'};
 const request=(ip,spoof)=>new Request(origin+'/api/extract',{
  method:'POST',headers:{Origin:origin,'Content-Type':'application/json','x-forwarded-for':ip,'CF-Connecting-IP':spoof},
  body:JSON.stringify({text:'Taylor Example is a developer with JavaScript experience.'})
 });
 const provider=async()=>new Response('',{status:429});
 for(let i=0;i<6;i++)await handleExtraction(request('192.0.2.10',String(i)),env,provider);
 let contacted=false;
 assert.equal((await handleExtraction(request('192.0.2.10','changed'),env,async()=>{contacted=true})).status,429);
 assert.equal(contacted,false);
 await handleExtraction(request('192.0.2.11','changed'),env,async()=>{contacted=true;return provider()});
 assert.equal(contacted,true);
});

import http from 'node:http';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import worker from '../dist/server/index.js';
const envPath=fileURLToPath(new URL('../.env',import.meta.url));
if(existsSync(envPath))process.loadEnvFile(envPath);
const env={GEMINI_API_KEY:process.env.GEMINI_API_KEY?.trim()||'',GEMINI_MODEL:process.env.GEMINI_MODEL||'gemini-3.1-flash-lite'};
console.log(env.GEMINI_API_KEY?'Local AI connection configured.':'Local AI is unavailable: set GEMINI_API_KEY in .env.');
http.createServer(async(req,res)=>{try{const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>(req.url==='/api/pdf-download'?2*1024*1024:65536)){res.writeHead(413);res.end('Request too large');return}chunks.push(chunk)}const request=new Request('http://127.0.0.1:4173'+req.url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});const response=await worker.fetch(request,env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()))}catch(e){res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Local preview error.'}))}}).listen(4173,'127.0.0.1',()=>console.log('Folio preview: http://127.0.0.1:4173'));

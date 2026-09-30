import http from 'node:http';
import {createInterface} from 'node:readline';
import worker from '../dist/server/index.js';
const isTTY=Boolean(process.stdin.isTTY);if(isTTY)process.stdin.setRawMode(true);
process.stdout.write('Ready for local preview key on hidden stdin (or leave blank for manual editing).\n');
let secret='';for await(const chunk of process.stdin){secret+=chunk.toString();if(/[\r\n]/.test(secret))break}if(isTTY)process.stdin.setRawMode(false);process.stdin.pause();secret=secret.trim();
const env={GEMINI_API_KEY:secret,GEMINI_MODEL:'gemini-3.1-flash-lite'};
http.createServer(async(req,res)=>{try{const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>65536){res.writeHead(413);res.end('Request too large');return}chunks.push(chunk)}const request=new Request('http://127.0.0.1:4173'+req.url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});const response=await worker.fetch(request,env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()))}catch(e){res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Local preview error.'}))}}).listen(4173,'127.0.0.1',()=>console.log('Folio preview: http://127.0.0.1:4173'));

import {readFile,mkdir,writeFile} from 'node:fs/promises';
const types={'index.html':'text/html; charset=utf-8','app.js':'text/javascript; charset=utf-8','ai.js':'text/javascript; charset=utf-8','style.css':'text/css; charset=utf-8','ai.css':'text/css; charset=utf-8'};
const assets={};for(const [file,type] of Object.entries(types))assets['/'+file]={body:await readFile(new URL('../dist/'+file,import.meta.url),'utf8'),type};
const server=await readFile(new URL('../server/worker.mjs',import.meta.url),'utf8');
await mkdir(new URL('../dist/server/',import.meta.url),{recursive:true});
await writeFile(new URL('../dist/server/index.js',import.meta.url),'const FOLIO_ASSETS='+JSON.stringify(assets)+';\n'+server);
console.log('Built self-contained Folio Worker with '+Object.keys(assets).length+' assets.');

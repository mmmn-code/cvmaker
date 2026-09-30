import {readFile,mkdir,writeFile,rm,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const types={'photo.css':'text/css; charset=utf-8','photo.js':'text/javascript; charset=utf-8','demo-photo.js':'text/javascript; charset=utf-8','pdf.js':'text/javascript; charset=utf-8','vendor/pdfmake.min.js':'text/javascript; charset=utf-8','vendor/folio-fonts.js':'text/javascript; charset=utf-8','catalog.js':'text/javascript; charset=utf-8','resume.js':'text/javascript; charset=utf-8','templates.css':'text/css; charset=utf-8','index.html':'text/html; charset=utf-8','app.js':'text/javascript; charset=utf-8','ai.js':'text/javascript; charset=utf-8','style.css':'text/css; charset=utf-8','ai.css':'text/css; charset=utf-8'};
const assets={};for(const [file,type] of Object.entries(types))assets['/'+file]={body:await readFile(new URL('../dist/'+file,import.meta.url),'utf8'),type};
// Each release gets fresh asset URLs so restored browser pages cannot mix old
// export handlers with the current dialog after a reload.
const revision=createHash('sha256').update(Object.values(assets).map(asset=>asset.body).join('\0')).digest('hex').slice(0,12);
assets['/index.html'].body=assets['/index.html'].body.replace(/(src|href)="([^"?]+\.(?:js|css))"/g,(match,attribute,path)=>`${attribute}="${path}?v=${revision}"`);
// Only this directory is served by Vercel. Keep server code and secrets out.
const publicDir=new URL('../public/',import.meta.url);
await rm(publicDir,{recursive:true,force:true});
for(const [path,asset] of Object.entries(assets)){
 const target=new URL('.'+path,publicDir);
 await mkdir(new URL('.',target),{recursive:true});
 await writeFile(target,asset.body);
}
for(const file of ['pdfmake-LICENSE.txt','Liberation-LICENSE.txt']){
 await copyFile(new URL('../dist/vendor/'+file,import.meta.url),new URL('vendor/'+file,publicDir));
}
const server=await readFile(new URL('../server/worker.mjs',import.meta.url),'utf8');
await mkdir(new URL('../dist/server/',import.meta.url),{recursive:true});
await writeFile(new URL('../dist/server/index.js',import.meta.url),'const FOLIO_ASSETS='+JSON.stringify(assets)+';\n'+server);
console.log('Built public assets for Vercel and a self-contained Folio Worker with '+Object.keys(assets).length+' assets.');

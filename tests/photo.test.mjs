import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const context=vm.createContext({});
vm.runInContext(readFileSync(new URL('../dist/photo.js',import.meta.url),'utf8')+'\nthis.api={validResumePhoto,resumePhotoPosition,photoCropRect,normalizeResumePhoto};',context);
const {validResumePhoto,resumePhotoPosition,photoCropRect,normalizeResumePhoto}=context.api;
test('only bounded embedded image data can be loaded from a saved draft',()=>{
 assert(validResumePhoto('data:image/jpeg;base64,YWJj'));
 for(const source of ['https://example.com/image.jpg','data:image/svg+xml;base64,YWJj','javascript:alert(1)','data:image/jpeg;base64,'+'A'.repeat(900000),null])assert.equal(validResumePhoto(source),false);
});
test('photo positioning stays in bounds and crop geometry matches object-fit cover',()=>{
 assert.equal(JSON.stringify(resumePhotoPosition({x:-10,y:180})),JSON.stringify({x:0,y:100}));
 assert.equal(JSON.stringify(photoCropRect(600,1000,{x:50,y:75})),JSON.stringify({x:0,y:300,size:600}));
 assert.equal(JSON.stringify(photoCropRect(1000,600,{x:25,y:50})),JSON.stringify({x:100,y:0,size:600}));
});
test('unsupported and oversized uploads reject before image decoding',async()=>{
 await assert.rejects(normalizeResumePhoto({type:'image/svg+xml',size:500}),/JPG, PNG, or WebP/);
 await assert.rejects(normalizeResumePhoto({type:'image/jpeg',size:9*1024*1024}),/smaller than 8 MB/);
});

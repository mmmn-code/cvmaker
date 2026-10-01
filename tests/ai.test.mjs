import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const source=await readFile(new URL('../dist/ai.js',import.meta.url),'utf8');
const resume={name:'Taylor Example',role:'Developer',email:'taylor@example.com',phone:'',location:'',website:'',summary:'',skills:'JavaScript',extraTitle:'',extra:'',experience:[],education:[],projects:[]};
function builder(){
 const nodes=new Map(),notices=[];let requests=0;
 const node=selector=>{
  if(!nodes.has(selector))nodes.set(selector,{innerHTML:'',textContent:'',classList:{toggle(){}},setAttribute(){},focus(){}});
  return nodes.get(selector);
 };
 const context=vm.createContext({
  $:node,$$:()=>[],document:{addEventListener(){}},location:{hash:''},
  currentView:'ai',window:{scrollTo(){}},AbortController,setTimeout,clearTimeout,
  esc:String,empty:()=>structuredClone(resume),state:{},resumeMarkup:()=>'<div>Resume preview</div>',
  templates:Array.from({length:5},(_,i)=>({id:'style'+i,name:'Style '+i,category:'Minimal',color:'#123456'})),
  notify:message=>notices.push(message),
  fetch:async()=>{requests++;return {ok:true,json:async()=>({data:resume})}}
 });
 vm.runInContext(source,context);
 return {context,nodes,notices,node,get requests(){return requests},run:code=>vm.runInContext(code,context)};
}

test('AI builder enables and generates exactly 1–4 selected previews, with matching singular copy',async()=>{
 for(const count of [1,2,3,4]){
  const app=builder();
  app.run(`aiDraft.text='Taylor Example is a frontend developer with JavaScript experience.';aiDraft.selected=templates.slice(0,${count}).map(t=>t.id);updateAiInputControls()`);
  assert.equal(app.node('#ai-build-button').disabled,false);
  assert.equal(app.node('#ai-build-button').innerHTML,count===1?'Create my preview':'Create my previews');
  await app.run('buildAiPreviews()');
  assert.equal(app.requests,1);
  const html=app.node('#ai-view').innerHTML;
  assert.equal((html.match(/data-ai-card=/g)||[]).length,count);
  assert(html.includes(count===1?'Review your preview, then export it for free.':`Compare your ${count} previews`));
  assert.equal(app.run('aiDraft.chosen'),'style0');
 }
});

test('AI builder requires one style, caps selection at four, and still requires resume text',async()=>{
 const app=builder();
 app.run("aiDraft.text='Taylor Example is a frontend developer with JavaScript experience.';updateAiInputControls()");
 assert.equal(app.node('#ai-build-button').disabled,true);
 assert.match(app.node('#ai-selection-hint').textContent,/at least 1 style/);
 await app.run('buildAiPreviews()');assert.equal(app.requests,0);
 app.run("templates.forEach(t=>pickAiStyle(t.id))");
 assert.equal(app.run('aiDraft.selected.length'),4);
 assert.match(app.notices[0],/up to 4 templates/);
 app.run("aiDraft.text='short';updateAiInputControls()");
 assert.equal(app.node('#ai-build-button').disabled,true);
 await app.run('buildAiPreviews()');assert.equal(app.requests,0);
 app.run("aiDraft.text='Taylor Example is a frontend developer with JavaScript experience.';aiDraft.selected=templates.map(t=>t.id)");
 await app.run('buildAiPreviews()');assert.equal(app.requests,0);
});

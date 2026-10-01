import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=read('dist/app.js');
const context=vm.createContext({});
vm.runInContext(read('dist/catalog.js')+'\n'+read('dist/photo.js')+'\n'+app.match(/^const esc=.*$/m)[0]+'\n'+read('dist/resume.js')+'\nthis.api={templates,matchingTemplates,resumeMarkup};',context);
const {templates,matchingTemplates,resumeMarkup}=context.api;
const data={name:'Taylor Example',role:'Research Engineer',email:'test@example.com',phone:'+1 555 0100',location:'Example City',website:'example.com',summary:'PROFILE_SENTINEL',experience:[{title:'ROLE_SENTINEL',company:'COMPANY_SENTINEL',dates:'2022–2026',details:'WORK_SENTINEL\nSECOND_BULLET'}],education:[{degree:'DEGREE_SENTINEL',school:'SCHOOL_SENTINEL',dates:'2018–2022',details:'EDUCATION_SENTINEL'}],skills:'SKILL_SENTINEL, JavaScript',projects:[{title:'PROJECT_SENTINEL',link:'example.com/project',details:'PROJECT_DETAIL'}],extraTitle:'Publications',extra:'EXTRA_SENTINEL'};
test('67 unique templates preserve all existing saved IDs and offer nine layouts',()=>{
 assert.equal(templates.length,67);assert.equal(new Set(templates.map(t=>t.id)).size,67);
 for(const id of ['everyday','editorial','momentum','first','studio','signal','classic','scholar'])assert(templates.some(t=>t.id===id));
 assert.equal(new Set(templates.map(t=>t.structure)).size,9);assert.equal(new Set(templates.map(t=>t.category)).size,7);
});
test('every template preserves every resume section, entry, and contact exactly once',()=>{
 for(const t of templates){const html=resumeMarkup(data,t.id,t.color);for(const value of ['Taylor Example','test@example.com','PROFILE_SENTINEL','ROLE_SENTINEL','COMPANY_SENTINEL','WORK_SENTINEL','SECOND_BULLET','DEGREE_SENTINEL','SCHOOL_SENTINEL','EDUCATION_SENTINEL','SKILL_SENTINEL','PROJECT_SENTINEL','PROJECT_DETAIL','EXTRA_SENTINEL'])assert.equal(html.split(value).length-1,1,`${t.id} must retain ${value} exactly once`);assert.equal((html.match(/<article /g)||[]).length,1);assert(html.includes('structure-'+t.structure));}
});
test('education-first and project-first designs prioritize the intended content',()=>{
 for(const t of templates.filter(t=>t.order==='education')){const html=resumeMarkup(data,t.id,t.color);assert(html.indexOf('DEGREE_SENTINEL')<html.indexOf('ROLE_SENTINEL'),t.id);}
 const html=resumeMarkup(data,'folio','#123456');assert(html.indexOf('PROJECT_SENTINEL')<html.indexOf('ROLE_SENTINEL'));
});
test('search combines category, multiple words, and structural filters',()=>{
 assert.equal(matchingTemplates('All templates','  ATLAS ').length,1);
 assert.equal(matchingTemplates('Tech','','sidebar').length,1);
 assert.equal(matchingTemplates('Student','left sidebar')[0].id,'campus');
 assert.equal(matchingTemplates('Creative','zzzz').length,0);
});
test('all designs escape user input and omit empty sections without blank sidebars',()=>{
 for(const t of templates){const html=resumeMarkup({...data,name:'<script>alert(1)</script>',summary:'<img src=x onerror=alert(1)>',experience:[],education:[],projects:[],skills:'',extra:''},t.id,t.color);assert(!html.includes('<script'));assert(!html.includes('<img'));assert(!html.includes('<aside'));assert(!html.includes('>Education<'));assert(html.includes('&lt;script&gt;'));}
});
test('twelve photo styles are filterable and photos stay out of text-only templates',()=>{
 const photo='data:image/jpeg;base64,'+readFileSync(new URL('../assets/demo-profile-portrait.jpg',import.meta.url)).toString('base64');
 const styles=matchingTemplates('With photo');assert.equal(styles.length,12);
 for(const t of templates){const html=resumeMarkup(data,t.id,t.color,photo,{x:25,y:75});assert.equal(html.includes('<img'),Boolean(t.photo),t.id);if(t.photo){assert(html.includes('object-position:25% 75%'));assert(html.includes('photo-'+t.photo));}}
 assert(!resumeMarkup(data,'portrait','#345f54','https://untrusted.example/portrait.jpg').includes('<img'));
});

test('fresh styles and career filters combine with search and layouts',()=>{
 assert.equal(matchingTemplates('Fresh styles').length,20);
 assert(matchingTemplates('Fresh styles','','all','Healthcare').some(t=>t.id==='care'));
 assert.equal(matchingTemplates('All templates','recruiter','profile-right','Human resources')[0].id,'people');
 assert.equal(matchingTemplates('All templates','recruiter','profile-right','Finance').length,0);
 const fresh=matchingTemplates('Fresh styles');
 for(const t of fresh){assert(t.careers.length);assert(t.keywords);}
 assert.equal(new Set(fresh.map(t=>[t.structure,t.header,t.font,t.heading,t.order,t.panel,t.photo,t.summary,t.skills,t.banner].join('|'))).size,20);
});
test('profile rails retain identity once, while all project-first layouts lead with projects',()=>{
 for(const t of templates.filter(t=>['profile-left','profile-right'].includes(t.structure))){
  const html=resumeMarkup(data,t.id,t.color);
  assert.equal((html.match(/resume-profile-rail/g)||[]).length,1);
  assert.equal((html.match(/resume-identity/g)||[]).length,1);
  assert(html.includes('panel-'+t.panel));
 }
 for(const t of templates.filter(t=>t.order==='projects')){const html=resumeMarkup(data,t.id,t.color);assert(html.indexOf('PROJECT_SENTINEL')<html.indexOf('ROLE_SENTINEL'),t.id);}
});
test('skills-first styles retain each skill once and prioritize skills before experience',()=>{
 for(const id of ['pitch','toolkit']){
  const html=resumeMarkup(data,id,'#315b64');
  assert(html.indexOf('SKILL_SENTINEL')<html.indexOf('ROLE_SENTINEL'));
  assert.equal(html.split('SKILL_SENTINEL').length-1,1);
 }
 const html=resumeMarkup({...data,skills:'  , <script>x</script>, Very long skill name, , C++  '},'toolkit','#315b64');
 assert(!html.includes('<script>'));assert(html.includes('&lt;script&gt;'));
 assert(html.includes('Very long skill name'));assert(html.includes('C++'));assert(!html.includes('<li></li>'));
 assert(!resumeMarkup({...data,summary:''},'pitch','#74494f').includes('resume-summary-spotlight'));
});

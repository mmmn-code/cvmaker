/* Text-based, locally generated PDFs. Template metadata also drives the HTML preview. */
const folioPdfFonts = Object.fromEntries(['Sans', 'Serif', 'Mono'].map(family => [family, {
 normal: `Liberation${family}-Regular.ttf`, bold: `Liberation${family}-Bold.ttf`,
 italics: `Liberation${family}-Regular.ttf`, bolditalics: `Liberation${family}-Bold.ttf`
}]));

function resumePdfDefinition(data, templateId, accent, paperSize = 'A4', photo = '') {
 const t = templates.find(item => item.id === templateId) || templates[0];
 const color = /^#[\da-f]{6}$/i.test(accent || '') ? accent : t.color;
 const tint = amount => '#' + color.slice(1).match(/../g).map(v => Math.round(parseInt(v, 16) * amount + 255 * (1 - amount)).toString(16).padStart(2, '0')).join('');
 const text = value => String(value || '').trim();
 // Give very long emails, URLs, and pasted words safe line-break opportunities.
 const wrap = value => text(value).replace(/[^\s\u200b]{30,}/gu, word => Array.from(word).join('\u200b'));
 const filled = items => (items || []).filter(item => Object.values(item).some(value => text(value)));
 const compact = t.density === 'compact';
 const font = t.font === 'serif' || t.layout === 'academic' ? 'Serif' : 'Sans';
 const headingFont = t.font === 'mono' ? 'Mono' : font;
 const headerFont = t.font === 'mono' || t.layout === 'tech' ? 'Mono' : ['editorial', 'classic', 'academic'].includes(t.layout) || t.font === 'serif' ? 'Serif' : 'Sans';
 const margin = 42;
 const width = (paperSize === 'Letter' ? 612 : 595.28) - margin * 2;
 const gap = compact ? 13 : t.id === 'linen' ? 23 : 18;
 const rule = (length, lineColor = '#d7dcd7', lineWidth = 0.7) => ({canvas: [{type: 'line', x1: 0, y1: 0, x2: length, y2: 0, lineWidth, lineColor}]});
 const paragraph = value => ({text: wrap(value), margin: [0, 0, 0, 3]});
 const bullets = value => {
  const lines = text(value).split('\n').map(line => line.replace(/^\s*[•\-]\s*/, '').trim()).filter(Boolean);
  return lines.length ? {ul: lines.map(line => ({text: wrap(line), margin: [0, 1, 0, 1]})), margin: [11, 4, 0, 0]} : null;
 };
 const entry = (title, dates, body) => {
 if(t.structure==='dated')return {columns:[{width:74,text:wrap(dates),fontSize:8,color,margin:[0,2,0,0]},{width:'*',stack:[{text:wrap(title),bold:true,unbreakable:true},...body.filter(Boolean)]}],columnGap:14,margin:[0,0,0,12],unbreakable:text(title).length+text(dates).length+JSON.stringify(body).length<700};
 const item={stack: [
  {stack: [{text: wrap(title), bold: true}, ...(text(dates) ? [{text: wrap(dates), fontSize: 8, color: '#59665f', margin: [0, 2, 0, 0]}] : [])], unbreakable: true},
  ...body.filter(Boolean)
 ], margin: [0, 0, 0, 9], unbreakable: text(title).length + text(dates).length + JSON.stringify(body).length < 700};
 if(t.structure!=='timeline')return item;
 return {table:{widths:[9,'*'],body:[[{canvas:[{type:'ellipse',x:3,y:6,r1:2.5,r2:2.5,color}],border:[false,false,false,false]},item]]},layout:{hLineWidth:()=>0,vLineWidth:i=>i===1?.7:0,vLineColor:()=>tint(.4),paddingLeft:i=>i===1?10:0,paddingRight:()=>0,paddingTop:()=>0,paddingBottom:()=>0},margin:[0,0,0,6]};
 };
 const content = {
  profile: text(data.summary) ? [paragraph(data.summary)] : [],
  experience: filled(data.experience).map(e => entry([e.title, e.company].filter(Boolean).join(' · '), e.dates, [bullets(e.details)])),
  education: filled(data.education).map(e => entry(e.degree, e.dates, [text(e.school) && paragraph(e.school), text(e.details) && paragraph(e.details)])),
  projects: filled(data.projects).map(e => entry(e.title, '', [text(e.link) && {text: wrap(e.link), fontSize: 9, color, margin: [0, 3, 0, 0]}, bullets(e.details)])),
  skills: text(data.skills) ? [paragraph(text(data.skills).split(',').map(s => s.trim()).filter(Boolean).join(' · '))] : [],
  extra: text(data.extra) ? [paragraph(data.extra)] : []
 };
 const titles = {profile: 'Profile', experience: 'Experience', education: 'Education', projects: 'Projects', skills: 'Skills', extra: text(data.extraTitle) || 'Additional information'};
 if(t.skills==='tags'){
  const skills=text(data.skills).split(',').map(s=>s.trim()).filter(Boolean);
  const rows=[];
  for(let i=0;i<skills.length;i+=3)rows.push(Array.from({length:3},(_,j)=>skills[i+j]?{text:wrap(skills[i+j]),fontSize:9,fillColor:tint(.09),margin:[6,5,6,5]}:{text:''}));
  content.skills=rows.length?[{table:{widths:['*','*','*'],body:rows},layout:{hLineWidth:()=>3,vLineWidth:()=>3,hLineColor:()=>'#ffffff',vLineColor:()=>'#ffffff',paddingTop:()=>0,paddingBottom:()=>0,paddingLeft:()=>0,paddingRight:()=>0}}]:[];
 }
 function section(key, sectionWidth = width, rail = t.structure === 'rail', inSolidPanel = false) {
  if (!content[key].length) return [];
  if(key==='profile'&&t.summary==='spotlight')return [{table:{widths:['*'],body:[[{stack:[{text:'PROFILE',id:'heading-profile',font:headingFont,bold:true,fontSize:9,characterSpacing:.8,color,margin:[0,0,0,8]},...content.profile],fillColor:tint(.1),margin:[13,11,13,11]}]]},layout:{hLineWidth:()=>0,vLineWidth:i=>i===0?3:0,vLineColor:()=>color,paddingTop:()=>0,paddingBottom:()=>0,paddingLeft:()=>0,paddingRight:()=>0},margin:[0,gap,0,0]}];
  const label = {text: wrap(titles[key].toUpperCase()), font: headingFont, bold: true, fontSize: rail ? 8.5 : 9, characterSpacing: 0.8, color: inSolidPanel?'#ffffff':t.layout === 'academic' ? '#273337' : color, margin: [0, 0, 0, 7]};
  if (rail) return [{stack: [rule(sectionWidth), {columns: [{width: 83, stack: [label]}, {width: '*', stack: content[key]}], columnGap: 16, margin: [0, 12, 0, 0]}], margin: [0, gap, 0, 0]}];
  let heading;
  if (t.heading === 'blocks' || t.layout === 'tech') {
   heading = {table: {widths: ['*'], body: [[{...label, margin: [7, 5, 7, 5], fillColor: tint(.09)}]]}, layout: 'noBorders'};
  } else if (t.heading === 'centered') {
   heading = {stack: [rule(sectionWidth), {...label, alignment: 'center', margin: [0, 6, 0, 7]}]};
  } else heading = {stack: [label, ...(t.heading === 'plain' ? [] : [rule(sectionWidth)])]};
  heading.id = `heading-${key}`;
  return [{stack: [heading, {stack: content[key], margin: [0, 8, 0, 0]}], margin: [0, gap, 0, 0]}];
 }
 const centered = t.header === 'centered' || t.header === 'photo-centered' || t.layout === 'classic';
 const nameSize = t.layout === 'creative' ? 35 : t.layout === 'editorial' ? 32 : t.layout === 'bold' || ['summit', 'horizon'].includes(t.id) ? 30 : t.id === 'outline' ? 23 : 27;
 const identity = [
  {text: wrap(headerFont === 'Serif' ? data.name : text(data.name).toUpperCase()), font: headerFont, bold: headerFont !== 'Serif', fontSize: nameSize, lineHeight: 1.02, color: ['bold', 'creative'].includes(t.layout) || t.header === 'banner' ? color : '#243530'},
  ...(text(data.role) ? [{text: wrap(data.role), fontSize: 10, characterSpacing: 0.6, margin: [0, 7, 0, 0]}] : []),
  {text: wrap([data.email, data.phone, data.location, data.website].filter(Boolean).join(' · ')), fontSize: 8, lineHeight: 1.3, margin: [0, 9, 0, 0]}
 ];
 if(t.banner==='solid')for(const item of identity)item.color='#ffffff';
 let header = {stack: identity, alignment: centered ? 'center' : 'left'};
 if (t.header === 'monogram') {
  const initials = text(data.name).split(/\s+/).slice(0, 2).map(part => Array.from(part)[0]).join('').toUpperCase();
  const mark = t.id === 'muse' ? {type: 'rect', x: 0, y: 0, w: 44, h: 44, lineColor: color, color: tint(.1)} : {type: 'ellipse', x: 22, y: 22, r1: 22, r2: 22, lineColor: color};
  header = {columns: [{width: 44, stack: [{canvas: [mark]}, {text: initials, font: 'Serif', fontSize: 20, color, alignment: 'center', relativePosition: {x: 0, y: -34}}]}, {width: '*', stack: identity}], columnGap: 16};
 } else if (['banner', 'framed', 'stripe', 'ruled'].includes(t.header)) {
  const style = t.header;
  header = {table: {widths: ['*'], body: [[{stack: identity, fillColor: style === 'banner' ? tint(.12) : null}]]}, layout: {
   hLineWidth: i => style === 'framed' ? .7 : ['banner', 'ruled'].includes(style) ? i === 0 ? style === 'banner' ? 6 : 3 : style === 'ruled' ? .7 : 0 : 0,
   vLineWidth: i => style === 'framed' ? .7 : style === 'stripe' && i === 0 ? 6 : 0,
   hLineColor: () => color, vLineColor: () => color,
   paddingLeft: () => style === 'ruled' ? 0 : 16, paddingRight: () => style === 'ruled' ? 0 : 16,
   paddingTop: () => 16, paddingBottom: () => 16
  }};
 }
 if (t.photo && validResumePhoto(photo)) {
  const photoNode = {image: photo, width: t.header === 'photo-centered' ? 78 : 84, height: t.header === 'photo-centered' ? 78 : 84};
  if (t.header === 'photo-centered') header = {stack: [{...photoNode, alignment: 'center', margin: [0, 0, 0, 15]}, ...identity], alignment: 'center'};
  else {
   const picture = {...photoNode, width: 84};
   const details = {width: '*', stack: identity, margin: [0, 4, 0, 0]};
   header = {columns: t.header === 'photo-right' ? [details, picture] : [picture, details], columnGap: 20};
  }
 }
 if(t.banner==='solid')header={table:{widths:['*'],body:[[{...header,fillColor:color}]]},layout:{hLineWidth:()=>0,vLineWidth:()=>0,paddingTop:()=>16,paddingBottom:()=>16,paddingLeft:()=>16,paddingRight:()=>16}};
 else if (t.id === 'spotlight') header = {table: {widths: ['*'], body: [[{...header, fillColor: tint(.1)}]]}, layout: {hLineWidth: i => i === 1 ? 3 : 0, vLineWidth: () => 0, hLineColor: () => color, paddingTop: () => 18, paddingBottom: () => 18, paddingLeft: () => 18, paddingRight: () => 18}};
 else if (['portrait','hello','toolkit'].includes(t.id)) header = {stack: [header, {...rule(width, color, t.id === 'portrait' ? 3 : t.id==='toolkit'?1.5:.7), margin: [0, 15, 0, 0]}]};
 if(t.header==='contact-band'){
  const contact=identity[identity.length-1];
  header={stack:[...identity.slice(0,-1).map((item,i)=>i===0?{...item,color}:item),{table:{widths:['*'],body:[[{...contact,color:'#ffffff',fillColor:color,margin:[10,7,10,7]}]]},layout:'noBorders',margin:[0,14,0,0]}]};
 }
 const body = [];
 if(['profile-left','profile-right'].includes(t.structure)){
  const sideWidth=Math.round((width-24)*.32),mainWidth=width-24-sideWidth,solid=t.panel==='solid';
  const sideIdentity=identity.map((item,i)=>({...item,color:solid?'#ffffff':i===0?color:'#273337',fontSize:i===0?19:i===identity.length-1?8:9,alignment:'left'}));
  sideIdentity[sideIdentity.length-1]={stack:[data.email,data.phone,data.location,data.website].filter(Boolean).map(value=>({text:wrap(value),margin:[0,0,0,4]})),fontSize:8,color:solid?'#ffffff':'#273337',margin:[0,12,0,0]};
  const portrait=t.photo&&validResumePhoto(photo)?[{image:photo,width:68,height:68,margin:[0,0,0,16]}]:[];
  const side={stack:[...portrait,...sideIdentity,...['skills','extra'].flatMap(key=>section(key,sideWidth-24,false,solid))],fillColor:solid?color:tint(.09),color:solid?'#ffffff':'#273337',margin:[12,16,12,16]};
  const order=t.order==='education'?['education','projects','experience']:t.order==='projects'?['projects','experience','education']:['experience','education','projects'];
  const main={stack:['profile',...order].flatMap(key=>section(key,mainWidth,false))};
  const left=t.structure==='profile-left';
  body.push({table:{widths:left?[sideWidth,24,mainWidth]:[mainWidth,24,sideWidth],body:[left?[side,{text:''},main]:[main,{text:''},side]]},layout:{hLineWidth:()=>0,vLineWidth:()=>0,paddingLeft:()=>0,paddingRight:()=>0,paddingTop:()=>0,paddingBottom:()=>0}});
 }else{
 if (t.layout === 'bold') body.push({...rule(width, color, 9), margin: [0, 0, 0, 18]});
 body.push({...header, unbreakable: true});
 if (t.layout === 'student' && text(data.role)) body.push({...rule(width, color, 3), margin: [0, 13, 0, 0]});
 body.push(...section('profile'));
 if (['sidebar', 'sidebar-right', 'split'].includes(t.structure)) {
  const primary = t.order === 'education' ? ['education', 'projects', 'experience'] : t.order==='projects'?['projects','experience']:['experience', 'projects'];
  const secondary = t.order === 'education' ? ['skills', 'extra'] : ['education', 'skills', 'extra'];
  if (secondary.some(key => content[key].length)) {
   const sideWidth = Math.round((width - 22) * (t.structure === 'split' ? .44 : .34));
   const mainWidth = width - 22 - sideWidth;
   const side = {stack: secondary.flatMap(key => section(key, sideWidth - 20, false)), fillColor: t.structure === 'split' ? null : tint(.08), margin: [10, 0, 10, 9]};
   const main = {stack: primary.flatMap(key => section(key, mainWidth, false))};
   const left = t.structure === 'sidebar';
   body.push({table: {widths: left ? [sideWidth, 22, mainWidth] : [mainWidth, 22, sideWidth], body: [left ? [side, {text: ''}, main] : [main, {text: ''}, side]]}, layout: {hLineWidth: () => 0, vLineWidth: () => 0, paddingLeft: () => 0, paddingRight: () => 0, paddingTop: () => 0, paddingBottom: () => 0}, margin: [0, 4, 0, 0]});
  } else body.push(...primary.flatMap(key => section(key)));
 } else {
  const order = t.order === 'education' ? ['education', 'projects', 'experience'] : t.order === 'projects' ? ['projects', 'experience', 'education'] : ['experience', 'education', 'projects'];
  body.push(...(t.order==='skills'?['skills',...order,'extra']:[...order,'skills','extra']).flatMap(key => section(key)));
 }
 }
 return {
  pageSize: paperSize === 'Letter' ? 'LETTER' : 'A4', pageMargins: [margin, margin, margin, margin],
  info: {title: `${text(data.name)} - Resume`, author: text(data.name), subject: t.name, creator: 'Folio'},
  defaultStyle: {font, fontSize: compact ? 9.5 : 10, lineHeight: compact ? 1.14 : 1.2, color: '#273337'},
  content: body,
  ...(t.layout === 'creative' ? {background: (_page, size) => ({canvas: [{type: 'rect', x: 23, y: 42, w: 7, h: size.height - 84, color}]})} : {}),
  pageBreakBefore: (node, following) => Boolean(node.id?.startsWith('heading-') && following.length === 0)
 };
}

function resumePdfFilename(name, templateId) {
 const safe = String(name || 'Resume').normalize('NFKC').replace(/[\x00-\x1f\x7f<>:"/\\|?*]/g, '').replace(/\s+/g, '-').replace(/^\.+|\.+$/g, '').slice(0, 80) || 'Resume';
 return `${safe}-${templateId}-resume.pdf`;
}

let pdfEnginePromise;
function loadPdfEngine() {
 if (!pdfEnginePromise) pdfEnginePromise = (async () => {
  for (const src of ['vendor/pdfmake.min.js', 'vendor/folio-fonts.js']) {
   await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timeout = setTimeout(() => {script.remove(); reject(new Error('PDF tools took too long to load. Please try again.'));}, 20000);
    script.src = src;
    script.onload = () => {clearTimeout(timeout); resolve();};
    script.onerror = () => {clearTimeout(timeout); script.remove(); reject(new Error('Could not load PDF tools. Please check your connection and try again.'));};
    document.head.appendChild(script);
   });
  }
  return window.pdfMake;
 })().catch(error => {pdfEnginePromise = null; throw error;});
 return pdfEnginePromise;
}

function createResumePdfBlob(engine, definition) {
 // All fonts are bundled locally, so the synchronous stream API also exposes generation errors.
 return new Promise((resolve, reject) => {
  try {
   const stream = engine.createPdf(definition, undefined, folioPdfFonts).getStream();
   const chunks = [];
   stream.on('data', chunk => chunks.push(chunk));
   stream.on('error', reject);
   stream.on('end', () => resolve(new Blob(chunks, {type: 'application/pdf'})));
   stream.end();
  } catch (error) {reject(error);}
 });
}

let pdfDownloadUrl;
let pdfExportBusy = false;
function resetPdfExport() {
 if (pdfExportBusy) return;
 const link = document.querySelector('#pdf-download-link');
 link.hidden = true;
 link.removeAttribute('href');
 pdfDownloadUrl = undefined;
 link.onclick = null;
 document.querySelector('#pdf-export-status').textContent = '';
 document.querySelector('#pdf-export-status').classList.remove('export-error');
 document.querySelector('#download-pdf-button').textContent = 'Download PDF · ₹0 / Free';
}

async function downloadResumePdf() {
 if (pdfExportBusy) return;
 resetPdfExport();
 pdfExportBusy = true;
 const button = document.querySelector('#download-pdf-button');
 const status = document.querySelector('#pdf-export-status');
 const paper = document.querySelector('#paper-size');
 const dialog = document.querySelector('#export-dialog');
 const snapshot = structuredClone(state);
 const size = paper.value;
 button.disabled = paper.disabled = true;
 button.textContent = 'Creating your PDF…';
 dialog.setAttribute('aria-busy', 'true');
 status.textContent = 'Preparing your selected template…';
 try {
  const engine = await loadPdfEngine();
  const photo = await resumePhotoForPdf(snapshot.photo, templates.find(t => t.id === snapshot.template)?.photo, snapshot.photoPosition);
  const blob = await createResumePdfBlob(engine, resumePdfDefinition(snapshot.data, snapshot.template, snapshot.color, size, photo));
  if (!blob.size) throw new Error('Your PDF was empty. Please try again.');
  pdfDownloadUrl = await new Promise((resolve, reject) => {
   const reader = new FileReader();
   reader.onload = () => resolve(reader.result);
   reader.onerror = () => reject(new Error('Could not prepare the PDF download.'));
   reader.readAsDataURL(blob);
  });
  const downloadFields = {pdf: pdfDownloadUrl.split(',')[1], filename: resumePdfFilename(snapshot.data.name, snapshot.template)};
  if (new URLSearchParams(downloadFields).toString().length > 2 * 1024 * 1024) throw new Error('This PDF is too large. Please shorten your resume and try again.');
  const link = document.querySelector('#pdf-download-link');
  link.href = pdfDownloadUrl;
  link.download = resumePdfFilename(snapshot.data.name, snapshot.template);
  link.onclick = event => {
   event.preventDefault();
   const form = document.createElement('form');
   form.method = 'POST';
   form.action = '/api/pdf-download';
   form.hidden = true;
   for (const [name, value] of Object.entries(downloadFields)) {
    const input = document.createElement('input');
    input.type = 'hidden'; input.name = name; input.value = value; form.appendChild(input);
   }
   dialog.appendChild(form);
   form.submit();
   setTimeout(() => form.remove(), 1000);
  };
  link.hidden = false;
  link.click();
  status.textContent = 'Your PDF is ready. Check your downloads, or use the link below to save it.';
  button.textContent = 'Download PDF again · Free';
 } catch (error) {
  status.textContent = error.message?.startsWith('Could not load') || error.message?.startsWith('PDF tools') || error.message?.startsWith('This PDF is too large') ? error.message : 'We couldn’t create your PDF. Your draft is saved. Please try again.';
  status.classList.add('export-error');
  button.textContent = 'Try PDF download again';
 } finally {
  pdfExportBusy = false;
  button.disabled = paper.disabled = false;
  dialog.removeAttribute('aria-busy');
 }
}

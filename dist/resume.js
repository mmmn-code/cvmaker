function bullets(value){const lines=value.split('\n').map(s=>s.replace(/^\s*[•\-]\s*/, '').trim()).filter(Boolean);return lines.length?`<ul>${lines.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`:''}
function section(title,body,variant=''){return body?`<section class="resume-section ${variant}"><h2>${esc(title)}</h2><div class="resume-section-content">${body}</div></section>`:''}
function filledEntry(e){return Object.values(e).some(v=>String(v).trim())}
function resumeMarkup(d,templateId=state.template,color=state.color,photo="",photoPosition={x:50,y:50}){
 const t=templates.find(t=>t.id===templateId)||templates[0];
 const entry=(title,dates,body)=>t.structure==='dated'?`<div class="resume-entry resume-dated-entry"><span class="resume-entry-date">${esc(dates||'')}</span><div class="resume-entry-detail"><h3>${esc(title)}</h3>${body}</div></div>`:`<div class="resume-entry"><div class="resume-entry-head"><h3>${esc(title)}</h3><span>${esc(dates||'')}</span></div>${body}</div>`;
 const exp=section('Experience',d.experience.filter(filledEntry).map(e=>entry([e.title,e.company].filter(Boolean).join(' · '),e.dates,bullets(e.details||''))).join(''));
 const education=section('Education',d.education.filter(filledEntry).map(e=>entry(e.degree,e.dates,`${e.school?`<p class="institution">${esc(e.school)}</p>`:''}${e.details?`<p class="preserve">${esc(e.details)}</p>`:''}`)).join(''));
 const projects=section('Projects',d.projects.filter(filledEntry).map(e=>{const body=`${e.link?`<p class="project-link">${esc(e.link)}</p>`:''}${bullets(e.details||'')}`;return t.structure==='dated'?entry(e.title,'',body):`<div class="resume-entry"><h3>${esc(e.title)}</h3>${body}</div>`}).join(''));
 const profile=section('Profile',d.summary?`<p class="preserve">${esc(d.summary)}</p>`:'',t.summary==='spotlight'?'resume-summary-spotlight':'');
 const skillItems=d.skills.split(',').map(s=>s.trim()).filter(Boolean);
 const skills=section('Skills',skillItems.length?(t.skills==='tags'?`<ul class="resume-skill-tags">${skillItems.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`:`<p>${esc(skillItems.join(' · '))}</p>`):'');
 const extra=section(d.extraTitle||'Additional information',d.extra.trim()?`<p class="preserve">${esc(d.extra)}</p>`:'');
 const initials=(d.name||'Your name').trim().split(/\s+/).slice(0,2).map(v=>v[0]).join('');
 const header=`<header class="resume-header">${t.photo?resumePhotoMarkup(photo,t.photo,photoPosition):''}${t.header==='monogram'?`<div class="resume-monogram" aria-hidden="true">${esc(initials)}</div>`:''}<div class="resume-identity"><h1>${esc(d.name||'Your name')}</h1>${d.role?`<p class="resume-role">${esc(d.role)}</p>`:''}<div class="resume-contact">${[d.email,d.phone,d.location,d.website].filter(Boolean).map(s=>`<span>${esc(s)}</span>`).join('<span aria-hidden="true"> · </span>')}</div></div></header>`;
 let body;
 if(['profile-left','profile-right'].includes(t.structure)){
  const main=t.order==='education'?education+projects+exp:t.order==='projects'?projects+exp+education:exp+education+projects;
  return `<article class="resume-paper resume-${t.layout} structure-${t.structure} header-${t.header} font-${t.font} heading-${t.heading} density-${t.density} panel-${t.panel} template-${t.id}" style="--resume-accent:${color}"><div class="resume-profile-layout"><div class="resume-profile-rail">${header}${skills}${extra}</div><div class="resume-profile-main">${profile}${main}</div></div></article>`;
 }
 if(['sidebar','sidebar-right','split'].includes(t.structure)){
  const primary=t.order==='education'?education+projects+exp:t.order==='projects'?projects+exp:exp+projects;
  const secondary=(t.order==='education'?'':education)+skills+extra;
  body=`${profile}<div class="resume-columns ${secondary?'':'no-secondary'}"><div class="resume-main">${primary}</div>${secondary?`<aside class="resume-aside">${secondary}</aside>`:''}</div>`;
 }else body=profile+(t.order==='skills'?skills:'')+(t.order==='education'?education+projects+exp:t.order==='projects'?projects+exp+education:exp+education+projects)+(t.order==='skills'?'':skills)+extra;
 return `<article class="resume-paper resume-${t.layout} structure-${t.structure} header-${t.header} font-${t.font} heading-${t.heading} density-${t.density} ${t.banner==='solid'?'banner-solid':''} template-${t.id}" style="--resume-accent:${color}">${header}<div class="resume-body">${body}</div></article>`;
}

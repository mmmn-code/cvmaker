function bullets(value){const lines=value.split('\n').map(s=>s.replace(/^\s*[•\-]\s*/, '').trim()).filter(Boolean);return lines.length?`<ul>${lines.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`:''}
function section(title,body){return body?`<section class="resume-section"><h2>${esc(title)}</h2><div class="resume-section-content">${body}</div></section>`:''}
function filledEntry(e){return Object.values(e).some(v=>String(v).trim())}
function resumeMarkup(d,templateId=state.template,color=state.color,photo="",photoPosition={x:50,y:50}){
 const t=templates.find(t=>t.id===templateId)||templates[0];
 const exp=section('Experience',d.experience.filter(filledEntry).map(e=>`<div class="resume-entry"><div class="resume-entry-head"><h3>${esc([e.title,e.company].filter(Boolean).join(' · '))}</h3><span>${esc(e.dates)}</span></div>${bullets(e.details||'')}</div>`).join(''));
 const education=section('Education',d.education.filter(filledEntry).map(e=>`<div class="resume-entry"><div class="resume-entry-head"><h3>${esc(e.degree)}</h3><span>${esc(e.dates)}</span></div>${e.school?`<p class="institution">${esc(e.school)}</p>`:''}${e.details?`<p class="preserve">${esc(e.details)}</p>`:''}</div>`).join(''));
 const projects=section('Projects',d.projects.filter(filledEntry).map(e=>`<div class="resume-entry"><h3>${esc(e.title)}</h3>${e.link?`<p class="project-link">${esc(e.link)}</p>`:''}${bullets(e.details||'')}</div>`).join(''));
 const profile=section('Profile',d.summary?`<p class="preserve">${esc(d.summary)}</p>`:'');
 const skills=section('Skills',d.skills.trim()?`<p>${esc(d.skills.split(',').map(s=>s.trim()).filter(Boolean).join(' · '))}</p>`:'');
 const extra=section(d.extraTitle||'Additional information',d.extra.trim()?`<p class="preserve">${esc(d.extra)}</p>`:'');
 const initials=(d.name||'Your name').trim().split(/\s+/).slice(0,2).map(v=>v[0]).join('');
 const header=`<header class="resume-header">${t.photo?resumePhotoMarkup(photo,t.photo,photoPosition):''}${t.header==='monogram'?`<div class="resume-monogram" aria-hidden="true">${esc(initials)}</div>`:''}<div class="resume-identity"><h1>${esc(d.name||'Your name')}</h1>${d.role?`<p class="resume-role">${esc(d.role)}</p>`:''}<div class="resume-contact">${[d.email,d.phone,d.location,d.website].filter(Boolean).map(s=>`<span>${esc(s)}</span>`).join('<span aria-hidden="true"> · </span>')}</div></div></header>`;
 let body;
 if(['sidebar','sidebar-right','split'].includes(t.structure)){
  const primary=t.order==='education'?education+projects+exp:exp+projects;
  const secondary=(t.order==='education'?'':education)+skills+extra;
  body=`${profile}<div class="resume-columns ${secondary?'':'no-secondary'}"><div class="resume-main">${primary}</div>${secondary?`<aside class="resume-aside">${secondary}</aside>`:''}</div>`;
 }else body=profile+(t.order==='education'?education+projects+exp:t.order==='projects'?projects+exp+education:exp+education+projects)+skills+extra;
 return `<article class="resume-paper resume-${t.layout} structure-${t.structure} header-${t.header} font-${t.font} heading-${t.heading} density-${t.density} template-${t.id}" style="--resume-accent:${color}">${header}<div class="resume-body">${body}</div></article>`;
}

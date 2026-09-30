function validResumePhoto(value) {
 return typeof value === 'string' && value.length < 900000 && /^data:image\/(?:jpeg|png|webp);base64,[a-zA-Z0-9+/]+={0,2}$/.test(value);
}
function resumePhotoPosition(value) {
 return Object.fromEntries(['x', 'y'].map(axis => [axis, Number.isFinite(value?.[axis]) ? Math.max(0, Math.min(100, value[axis])) : 50]));
}
function photoCropRect(width, height, position) {
 const {x, y} = resumePhotoPosition(position), size = Math.min(width, height);
 return {x: (width - size) * x / 100, y: (height - size) * y / 100, size};
}
function loadResumePhoto(source) {
 return new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error('This image could not be opened. Choose a JPG, PNG, or WebP photo.'));
  img.src = source;
 });
}
async function normalizeResumePhoto(file) {
 if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose a JPG, PNG, or WebP photo.');
 if (!file.size || file.size > 8 * 1024 * 1024) throw new Error('Choose a photo smaller than 8 MB.');
 const url = URL.createObjectURL(file);
 try {
  const img = await loadResumePhoto(url);
  if (!img.naturalWidth || !img.naturalHeight || img.naturalWidth * img.naturalHeight > 40000000) throw new Error('Choose a smaller photo, up to 40 megapixels.');
  const scale = Math.min(1, 720 / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const result = canvas.toDataURL('image/jpeg', .86);
  if (!validResumePhoto(result)) throw new Error('This photo is too large to save. Choose a smaller image.');
  return result;
 } finally {URL.revokeObjectURL(url);}
}
async function resumePhotoForPdf(source, shape, position) {
 if (!validResumePhoto(source) || !shape) return '';
 const img = await loadResumePhoto(source);
 const crop = photoCropRect(img.naturalWidth, img.naturalHeight, position);
 const canvas = document.createElement('canvas'); canvas.width = canvas.height = 360;
 const ctx = canvas.getContext('2d');
 if (shape === 'circle') {ctx.beginPath(); ctx.arc(180, 180, 180, 0, Math.PI * 2); ctx.clip();}
 ctx.drawImage(img, crop.x, crop.y, crop.size, crop.size, 0, 0, 360, 360);
 return canvas.toDataURL(shape === 'circle' ? 'image/png' : 'image/jpeg', .9);
}
function resumePhotoMarkup(photo, shape, position, placeholder = true) {
 const pos = resumePhotoPosition(position);
 if (validResumePhoto(photo)) return `<img class="resume-profile-photo photo-${shape}" src="${photo}" alt="Profile photo" style="object-position:${pos.x}% ${pos.y}%">`;
 return placeholder ? `<div class="resume-photo-placeholder photo-${shape}" aria-label="Your profile photo goes here"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="17" r="7"/><path d="M10 40c0-9 6-14 14-14s14 5 14 14"/></svg><span>Your photo</span></div>` : '';
}
function photoEditorMarkup() {
 const t = templates.find(item => item.id === state.template);
 if (!t.photo) return `<div class="photo-discovery"><span>Want a resume with a photo?</span><button type="button" class="text-button" data-photo-templates>Explore 4 photo styles →</button></div>`;
 const hasPhoto = validResumePhoto(state.photo), pos = resumePhotoPosition(state.photoPosition);
 return `<section class="photo-editor" aria-labelledby="photo-editor-title"><div class="photo-editor-heading"><div><span class="photo-kicker">A LITTLE MORE YOU</span><h3 id="photo-editor-title">Profile photo <span>· optional</span></h3></div><span class="photo-template-label">${t.name}</span></div><div class="photo-upload-row"><div class="photo-upload-preview">${resumePhotoMarkup(state.photo, t.photo, pos)}</div><div class="photo-upload-copy"><label class="photo-file-label" for="profile-photo">${hasPhoto ? 'Replace photo' : 'Upload your photo'}</label><input type="file" id="profile-photo" accept="image/jpeg,image/png,image/webp" aria-describedby="photo-help"><p id="photo-help">JPG, PNG, or WebP · up to 8 MB</p>${hasPhoto ? '<button type="button" class="text-button" id="remove-profile-photo">Remove photo</button>' : ''}</div></div>${hasPhoto ? `<div class="photo-framing"><p>Adjust the framing</p><label for="photo-position-x">Left / right<input id="photo-position-x" type="range" min="0" max="100" value="${pos.x}" data-photo-axis="x"></label><label for="photo-position-y">Up / down<input id="photo-position-y" type="range" min="0" max="100" value="${pos.y}" data-photo-axis="y"></label></div>` : ''}<p class="photo-privacy">Saved with your draft on this device. Included in photo templates and PDF exports.</p><p id="photo-status" role="status" aria-live="polite"></p></section>`;
}
let photoUploadVersion = 0;
function refreshPhotoEditor() {const host = document.querySelector('#photo-editor-host'); if (host) host.innerHTML = photoEditorMarkup();}
if (typeof document !== 'undefined') {
 document.addEventListener('change', async event => {
  if (event.target.id !== 'profile-photo') return;
  const file = event.target.files?.[0]; if (!file) return;
  const version = ++photoUploadVersion;
  event.target.disabled = true;
  const status = document.querySelector('#photo-status');
  if (status) status.textContent = 'Preparing your photo…';
  try {
   const photo = await normalizeResumePhoto(file);
   if (version !== photoUploadVersion) return;
   state.photo = photo; state.photoPosition = {x: 50, y: 50};
   save(); refreshPhotoEditor(); renderPreview();
   const ready = document.querySelector('#photo-status');
   if (ready) ready.textContent = saveOk ? 'Photo added. Your preview is updated.' : 'Photo added, but this browser could not save it. Export before leaving.';
  } catch (error) {
   if (version !== photoUploadVersion) return;
   const message = document.querySelector('#photo-status');
   if (message) {message.textContent = error.message; message.classList.add('photo-error');}
  } finally {event.target.disabled = false; event.target.value = '';}
 });
 document.addEventListener('input', event => {
  const axis = event.target.dataset.photoAxis; if (!['x', 'y'].includes(axis)) return;
  state.photoPosition = {...resumePhotoPosition(state.photoPosition), [axis]: Number(event.target.value)};
  save(); renderPreview();
  const thumbnail = document.querySelector('.photo-upload-preview img');
  if (thumbnail) thumbnail.style.objectPosition = `${state.photoPosition.x}% ${state.photoPosition.y}%`;
 });
 document.addEventListener('click', event => {
  if (event.target.closest('#remove-profile-photo')) {photoUploadVersion++; state.photo = ''; state.photoPosition = {x: 50, y: 50}; save(); refreshPhotoEditor(); renderPreview(); notify('Photo removed.');}
  if (event.target.closest('[data-photo-templates]')) {currentCategory = 'With photo'; galleryQuery = ''; galleryLayout = 'all'; document.querySelector('#template-search').value = ''; document.querySelector('#layout-filter').value = 'all'; renderGallery(); showView('templates'); document.querySelector('.workspace').scrollIntoView({block: 'start'});}
 });
}

// frontend/app.js
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const listEl = document.getElementById('list');
const progressWrap = document.querySelector('.progress-wrap');
const progressBar = document.getElementById('progressBar');

function showProgress(pct){
  progressWrap.style.display = pct === 0 ? 'none' : 'block';
  progressBar.style.width = pct + '%';
  if(pct === 100){
    setTimeout(()=> { progressWrap.style.display='none'; progressBar.style.width='0%'; }, 700);
  }
}

async function fetchList(){
  try{
    const res = await fetch('/documents');
    const docs = await res.json();
    listEl.innerHTML = docs.length ? docs.map(d=> docCardHtml(d)).join('') : '<p class="muted">No documents uploaded yet.</p>';
    // attach actions
    docs.forEach(d => {
      const dl = document.getElementById(`dl-${d.id}`);
      const del = document.getElementById(`del-${d.id}`);
      if(dl) dl.onclick = ()=> window.open(`/documents/${d.id}`, '_blank');
      if(del) del.onclick = ()=> deleteDoc(d.id);
    });
  }catch(e){
    listEl.innerHTML = `<p class="muted">Unable to load documents: ${e.message}</p>`;
  }
}

function docCardHtml(d){
  return `
    <div class="doc-card">
      <div class="doc-left">
        <div class="icon" aria-hidden>📄</div>
        <div>
          <div class="doc-name">${escapeHtml(d.filename)}</div>
          <div class="doc-meta">${(d.filesize/1024).toFixed(1)} KB • ${new Date(d.created_at).toLocaleString()}</div>
        </div>
      </div>
      <div class="doc-actions">
        <button id="dl-${d.id}" class="btn-download">Download</button>
        <button id="del-${d.id}" class="btn-delete">Delete</button>
      </div>
    </div>
  `;
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

async function uploadFile(file){
  if(!file) return;
  if(file.type !== 'application/pdf'){ alert('Only PDF files are allowed.'); return; }
  if(file.size > 10 * 1024 * 1024){ alert('File too large (max 10 MB).'); return; }

  const form = new FormData();
  form.append('file', file);

  // show fake progress using intervals with actual network onload
  showProgress(5);
  try {
    // Use XMLHttpRequest to show progress
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/documents/upload', true);
      xhr.upload.onprogress = e => {
        if(e.lengthComputable){
          const pct = Math.round((e.loaded / e.total) * 100);
          showProgress(Math.min(100, pct));
        }
      };
      xhr.onload = () => {
        if(xhr.status >= 200 && xhr.status < 300){
          resolve(xhr.responseText);
        } else {
          reject(new Error('Upload failed: ' + xhr.status));
        }
      };
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(form);
    });

    // refresh list
    await fetchList();
    alert('Upload successful');
  } catch (err) {
    alert('Upload error: ' + err.message);
  } finally {
    showProgress(0);
  }
}

async function deleteDoc(id){
  if(!confirm('Delete this file permanently?')) return;
  try{
    await fetch(`/documents/${id}`, { method: 'DELETE' });
    await fetchList();
  }catch(e){
    alert('Delete failed: ' + e.message);
  }
}

// drag & drop
['dragenter','dragover'].forEach(evt => dropzone.addEventListener(evt, e => {
  e.preventDefault(); dropzone.classList.add('dragover');
}));
['dragleave','drop'].forEach(evt => dropzone.addEventListener(evt, e => {
  e.preventDefault(); dropzone.classList.remove('dragover');
}));
dropzone.addEventListener('drop', e => {
  const f = e.dataTransfer.files && e.dataTransfer.files[0];
  if(f) uploadFile(f);
});

// file input
fileInput.addEventListener('change', e => {
  const f = e.target.files && e.target.files[0];
  if(f) uploadFile(f);
});

// initial load
fetchList();

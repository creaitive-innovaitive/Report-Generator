// Export validation, copy, Excel/Word download, and save-report modal.

function checkGenders(single){
  const missing = students.filter(s => !s.gender);
  if(single){
    const s = students.find(x => x.id === single);
    if(s && !s.gender){ alert(`Please set gender (M/F) for ${s.fullName} before copying.`); return false; }
    return true;
  }
  if(missing.length){
    alert(`Please set gender (M/F) for the following students before exporting:\n\n${missing.map(s => '• ' + s.fullName).join('\n')}`);
    return false;
  }
  return true;
}

function copyOne(id){
  if(!checkGenders(id)) return;
  const s = students.find(x => x.id === id);
  const sel = selections[id] || { mode: 'auto', s1: 0, s2cat: 's2_academic', s2: 0, s3: 0, s4: -1 };
  navigator.clipboard.writeText(assembleFull(s, sel)).then(() => {
    document.querySelectorAll(`button[onclick="copyOne(${id})"]`).forEach(btn => {
      const o = btn.textContent; btn.textContent = '✅ Copied!';
      setTimeout(() => btn.textContent = o, 1500);
    });
  });
}

function copyAll(){
  if(!checkGenders()) return;
  const txt = students.map(s => {
    const sel = selections[s.id] || { mode: 'auto', s1: 0, s2cat: 's2_academic', s2: 0, s3: 0, s4: -1 };
    return `${displayName(s)} (${s.grade})\n${assembleFull(s, sel)}`;
  }).join('\n\n');
  navigator.clipboard.writeText(txt).then(() => alert('All comments copied!'));
}

// ── Filename helper ───────────────────────────────────────────────────────────

function buildFilename(level, subject, year){
  // e.g. "Report Comments - IG1 Economics 2025-26"
  const parts = [level, subject, year].filter(Boolean).join(' ');
  return parts ? `Report Comments - ${parts}` : 'Report Comments';
}

// ── Download Excel ────────────────────────────────────────────────────────────

function _buildExportRows(){
  const rows = [['Student Name','Nickname','Gender','Grade','%','Progress','Effort','Behaviour','Comment']];
  students.forEach(s => {
    const sel = selections[s.id] || { mode: 'auto', s1: 0, s2cat: 's2_academic', s2: 0, s3: 0, s4: -1 };
    rows.push([
      s.fullName, s.nickname,
      s.gender === 'M' ? 'Male' : s.gender === 'F' ? 'Female' : '',
      s.grade, s.percent || '', s.progress, s.effort, s.behaviour,
      assembleFull(s, sel)
    ]);
  });
  return rows;
}

function _doDownloadExcel(filename){
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(_buildExportRows());
  ws['!cols'] = [
    {wch:28},{wch:14},{wch:8},{wch:7},{wch:5},
    {wch:18},{wch:18},{wch:18},{wch:80}
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Report Comments');
  XLSX.writeFile(wb, filename + '.xlsx');
}

// ── Download Word ─────────────────────────────────────────────────────────────

function _doDownloadWord(filename){
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  let body = '';
  students.forEach((s, i) => {
    const sel     = selections[s.id] || { mode: 'auto', s1: 0, s2cat: 's2_academic', s2: 0, s3: 0, s4: -1 };
    const dn      = displayName(s);
    const comment = assembleFull(s, sel);
    const meta    = [s.grade, s.percent ? s.percent + '%' : ''].filter(Boolean).join(' · ');
    if(i > 0) body += '<p>&nbsp;</p>';
    body += `<p><b>${esc(dn)}</b> <span style="color:#888">(${esc(meta)})</span></p>`;
    body += `<p>${esc(comment)}</p>`;
  });

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:w="urn:schemas-microsoft-com:office:word"
    xmlns="http://www.w3.org/TR/REC-html40">
  <head><meta charset="utf-8">
  <style>body{font-family:Calibri,sans-serif;font-size:11pt;line-height:1.5}</style>
  </head><body>${body}</body></html>`;

  const blob = new Blob([html], { type: 'application/msword' });
  const a = Object.assign(document.createElement('a'), {
    href:     URL.createObjectURL(blob),
    download: filename + '.doc'
  });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}

// ── Download modal (Export tab) ───────────────────────────────────────────────

let _dlFormat = 'word';

function openDownloadModal(format){
  if(!students.length){ alert('No students to export.'); return; }
  if(!checkGenders()) return;
  _dlFormat = format;

  const curr = currentAcademicYear();
  document.getElementById('dl-modal-title').textContent =
    format === 'word' ? '📄 Download Word' : '⬇ Download Excel';
  document.getElementById('dl-level').innerHTML = YEAR_LEVELS.map(l =>
    `<option value="${l}">${l}</option>`).join('');
  document.getElementById('dl-subject').innerHTML = SUBJECTS.map(s =>
    `<option value="${s}">${s}</option>`).join('');
  document.getElementById('dl-year').innerHTML = ACADEMIC_YEARS.map(y =>
    `<option value="${y}"${y === curr ? ' selected' : ''}>${y}</option>`).join('');

  document.getElementById('download-modal').style.display = 'flex';
}

function closeDownloadModal(){
  document.getElementById('download-modal').style.display = 'none';
}

function confirmDownload(){
  const level   = document.getElementById('dl-level').value;
  const subject = document.getElementById('dl-subject').value;
  const year    = document.getElementById('dl-year').value;
  const fname   = buildFilename(level, subject, year);
  closeDownloadModal();
  if(_dlFormat === 'excel') _doDownloadExcel(fname);
  else _doDownloadWord(fname);
}

// ── Cloud save helpers ────────────────────────────────────────────────────────

function openCloudModal(){
  if(!students.length){ alert('No students to export.'); return; }
  document.getElementById('cloud-modal').style.display = 'flex';
}

function closeCloudModal(){
  document.getElementById('cloud-modal').style.display = 'none';
}

function cloudDownloadAndOpen(format, service){
  // Trigger the download modal first, then open cloud after confirm
  _cloudServicePending = service;
  openDownloadModal(format);
}

let _cloudServicePending = null;

// Override confirmDownload to also open cloud if triggered from cloud modal
const _confirmDownloadBase = confirmDownload;
// (cloud modal calls openDownloadModal directly — after download the user uploads manually)

// ── Save Report Modal ─────────────────────────────────────────────────────────

let blankAfterSave = false;

function archiveAndStartNext(){
  blankAfterSave = true;
  openSaveModal();
}

function openSaveModal(){
  if(!students.length){ alert('No students to save.'); return; }

  const ySelect = document.getElementById('m-year');
  const curr    = currentAcademicYear();
  ySelect.innerHTML = ACADEMIC_YEARS.map(y =>
    `<option value="${y}"${y === curr ? ' selected' : ''}>${y}</option>`
  ).join('');

  document.getElementById('m-level').innerHTML = YEAR_LEVELS.map(l =>
    `<option value="${l}">${l}</option>`
  ).join('');

  document.getElementById('m-subject').innerHTML = SUBJECTS.map(s =>
    `<option value="${s}">${s}</option>`
  ).join('');

  document.getElementById('m-term').value = 'Term 1';
  document.getElementById('m-name').value = '';
  document.getElementById('save-modal').style.display = 'flex';
  document.getElementById('m-year').focus();
}

function closeSaveModal(){
  blankAfterSave = false;
  document.getElementById('save-modal').style.display = 'none';
}

function confirmSave(){
  const meta = {
    academicYear: document.getElementById('m-year').value,
    yearLevel:    document.getElementById('m-level').value,
    subject:      document.getElementById('m-subject').value,
    term:         document.getElementById('m-term').value.trim(),
    name:         document.getElementById('m-name').value.trim(),
    className:    classes[activeClass].name
  };
  if(!meta.academicYear || !meta.term || !meta.yearLevel || !meta.subject){
    alert('Please fill in all fields.');
    return;
  }
  saveReport(meta);
  const blank = blankAfterSave;
  closeSaveModal();
  if(blank) blankForNextReport();

  const btn = document.getElementById('btn-save-report');
  if(btn){ const o = btn.textContent; btn.textContent = '✅ Saved!'; setTimeout(() => btn.textContent = o, 2000); }
}

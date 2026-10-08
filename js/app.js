// Tab switching, selection management, manual entry form, and app init.

function switchTab(name, btn){
  document.querySelectorAll('.pane').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById(`pane-${name}`).classList.add('active');
  btn.classList.add('active');
  if(name === 'past-reports') renderPastReports();
}

function ensureSel(id){
  if(!selections[id]) selections[id] = { mode: 'auto', s1: 0, s2cat: 's2_academic', s2: 0, s3: 0, s4: -1 };
}

function setMode(id, mode){
  ensureSel(id);
  selections[id].mode = mode;
  saveState(); renderComments(); renderExport();
}

function setAllMode(mode){
  students.forEach(s => { ensureSel(s.id); selections[s.id].mode = mode; });
  saveState(); renderComments(); renderExport();
}

function updateS(id, field, val){
  ensureSel(id);
  selections[id][field] = +val;
  delete selections[id].custom;
  saveState(); liveUpdate(id);
}

function updateS2(id, val){
  ensureSel(id);
  const [cat, idx] = val.split(':');
  selections[id].s2cat = cat;
  selections[id].s2    = +idx;
  delete selections[id].custom;
  saveState(); liveUpdate(id);
}

function editComment(id, text){
  ensureSel(id);
  selections[id].custom = text;
  saveState();
  const len = text.length;
  const cnt = document.getElementById(`cc-${id}`);
  if(cnt){
    cnt.textContent = len > 350 ? `⚠ ${len}/350 — too long` : `${len} / 350 chars`;
    cnt.className = `cc ${len > 350 ? 'over' : len >= 330 ? 'good' : len >= 300 ? 'near' : 'low'}`;
  }
  renderExport();
}

function resetComment(id){
  ensureSel(id);
  delete selections[id].custom;
  saveState(); renderComments(); renderExport();
}

function newRoster(){
  if(students.length && !confirm('Start a new roster? Your current students will be cleared.\n\nTip: save your current report first from the Export tab.')) return;
  students = []; selections = {};
  saveState(); renderAll();
}

function addManual(){
  const raw = document.getElementById('i-name').value.trim();
  if(!raw){ alert('Please enter a name.'); return; }
  const parsed = parseBracketed(raw);
  const nick   = document.getElementById('i-nick').value.trim() || parsed.nickname;
  const gender = document.querySelector('input[name="i-gender"]:checked');
  pushStudent(
    parsed.fullName, nick,
    document.getElementById('i-grade').value,
    document.getElementById('i-pct').value,
    document.getElementById('i-prog').value,
    document.getElementById('i-effort').value,
    document.getElementById('i-beh').value,
    gender ? gender.value : ''
  );
  ['i-name', 'i-nick', 'i-pct'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('i-grade').selectedIndex = 0;
  ['i-prog', 'i-effort', 'i-beh'].forEach(id => document.getElementById(id).selectedIndex = 0);
  const checked = document.querySelector('input[name="i-gender"]:checked');
  if(checked) checked.checked = false;
  document.getElementById('i-name').focus();
}

// ── Init ──────────────────────────────────────────────────────────────────────
loadState();
renderAll();

// Student data and localStorage persistence.

let students  = [];
let selections = {};
let nextId    = 1;
let currentSheetName = '';

function setRosterLabel(name){
  currentSheetName = name || '';
  const el = document.getElementById('roster-label');
  if(el) el.textContent = name ? `Current Roster — ${name}` : 'Current Roster';
}

function loadState(){
  try {
    const ss = localStorage.getItem('igcse_s2');
    const se = localStorage.getItem('igcse_sel2');
    if(ss) students   = JSON.parse(ss);
    if(se) selections = JSON.parse(se);
    if(students.length) nextId = Math.max(...students.map(x => x.id)) + 1;
  } catch(e) {}
}

function saveState(){
  localStorage.setItem('igcse_s2',   JSON.stringify(students));
  localStorage.setItem('igcse_sel2', JSON.stringify(selections));
}

function pushStudent(fullName, nickname, grade, percent, progress, effort, behaviour, gender){
  const id = nextId++;
  students.push({
    id, fullName,
    nickname:  nickname  || '',
    grade:     grade     || '',
    percent:   parseFloat(percent) || 0,
    progress:  progress  || progressForGrade(grade),
    effort:    effort    || '',
    behaviour: behaviour || '',
    gender:    gender    || '',
    viet:    isViet(fullName),
    jap:     !isViet(fullName) && isJapanese(fullName),
    korean:  !isViet(fullName) && !isJapanese(fullName) && isKorean(fullName)
  });
  if(!selections[id]) selections[id] = { mode: 'auto', s1: 0, s2cat: 's2_academic', s2: 0, s3: 0, s4: -1 };
  saveState();
  renderAll();
}

function setGender(id, g){
  const s = students.find(x => x.id === id);
  if(s){ s.gender = g; saveState(); renderAll(); }
}

function setField(id, field, val){
  const s = students.find(x => x.id === id);
  if(!s) return;
  if(field === 'percent'){ s.percent = parseFloat(val) || 0; saveState(); return; }
  s[field] = val;
  if(field === 'grade') s.progress = progressForGrade(val);
  saveState(); renderAll();
}

// Keeps names/gender, blanks everything entered per report period.
function blankForNextReport(){
  students.forEach(s => { s.grade = ''; s.percent = 0; s.progress = ''; s.effort = ''; s.behaviour = ''; });
  selections = {};
  students.forEach(s => { selections[s.id] = { mode: 'auto', s1: 0, s2cat: 's2_academic', s2: 0, s3: 0, s4: -1 }; });
  saveState(); renderAll();
}

function delStudent(id){
  students = students.filter(s => s.id !== id);
  delete selections[id];
  saveState();
  renderAll();
}

function clearAll(){
  if(!students.length || confirm('Clear all students? This cannot be undone.')){
    students = []; selections = {};
    saveState(); renderAll();
  }
}

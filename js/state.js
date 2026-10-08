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

// Five switchable classes, each with its own students and comment selections.
const CLASSES_KEY = 'betr_classes';
const CLASS_COUNT = 5;
let classes = [];
let activeClass = 0;

function loadState(){
  try {
    const raw = JSON.parse(localStorage.getItem(CLASSES_KEY));
    if(raw && raw.classes && raw.classes.length === CLASS_COUNT){
      classes = raw.classes; activeClass = raw.active || 0;
    }
  } catch(e) {}
  if(!classes.length){
    // First run with classes: existing roster becomes Class 1.
    let ss = [], se = {};
    try {
      ss = JSON.parse(localStorage.getItem('igcse_s2')) || [];
      se = JSON.parse(localStorage.getItem('igcse_sel2')) || {};
    } catch(e) {}
    classes = Array.from({ length: CLASS_COUNT }, (_, i) => ({ name: `Class ${i + 1}`, students: [], selections: {} }));
    classes[0].students = ss; classes[0].selections = se;
    activeClass = 0;
  }
  students   = classes[activeClass].students;
  selections = classes[activeClass].selections;
  nextId = students.length ? Math.max(...students.map(x => x.id)) + 1 : 1;
}

function saveState(){
  classes[activeClass].students   = students;
  classes[activeClass].selections = selections;
  localStorage.setItem(CLASSES_KEY, JSON.stringify({ active: activeClass, classes }));
}

function switchClass(i){
  saveState();
  activeClass = i;
  students   = classes[i].students;
  selections = classes[i].selections;
  nextId = students.length ? Math.max(...students.map(x => x.id)) + 1 : 1;
  saveState();
  renderAll();
}

function swapClasses(){
  const n = parseInt(prompt(`Swap "${classes[activeClass].name}" with which class? (1-${CLASS_COUNT})`), 10);
  if(!(n >= 1 && n <= CLASS_COUNT) || n - 1 === activeClass) return;
  saveState();
  const j = n - 1;
  [classes[activeClass], classes[j]] = [classes[j], classes[activeClass]];
  switchClass(j);
}

function renameClass(i){
  const n = prompt('Class name:', classes[i].name);
  if(n && n.trim()){ classes[i].name = n.trim(); saveState(); renderAll(); }
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

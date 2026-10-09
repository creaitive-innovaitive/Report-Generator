// Persistence layer for saved reports.
// Each report is stored as a snapshot of students + selections at save time.

const REPORTS_KEY = 'betr_past_reports';

const YEAR_LEVELS = ['IG1', 'IG2', 'AS', 'A'];

const SUBJECTS = [
  'Art', 'Biology', 'Business', 'Chemistry', 'Co-ordinated Science',
  'Computer Science', 'Digital Media', 'Economics', 'English (EFL)',
  'English (ESL)', 'Global Perspectives', 'HPE', 'Maths',
  'Physics', 'Sociology', 'STEM'
];

function currentAcademicYear(){
  const now = new Date();
  const y   = now.getFullYear();
  const startYear = now.getMonth() >= 8 ? y : y - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
}

function genAcademicYears(){
  const out = [];
  const curr = new Date().getFullYear();
  for(let y = curr - 2; y <= curr + 6; y++){
    out.push(`${y}-${String(y + 1).slice(-2)}`);
  }
  return out;
}
const ACADEMIC_YEARS = genAcademicYears();

function getSavedReports(){
  try { return JSON.parse(localStorage.getItem(REPORTS_KEY)) || []; }
  catch(e){ return []; }
}

function saveReport(meta){
  const reports = getSavedReports();
  const report  = {
    id:           'rpt_' + Date.now(),
    savedAt:      new Date().toISOString(),
    academicYear: meta.academicYear,
    yearLevel:    meta.yearLevel,
    subject:      meta.subject,
    name:         meta.name || '',
    className:    meta.className || '',
    term:         meta.term || '',
    studentCount: students.length,
    students:     JSON.parse(JSON.stringify(students)),
    selections:   JSON.parse(JSON.stringify(selections))
  };
  reports.unshift(report);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  return report;
}

function renameTerm(year, oldTerm, newTerm){
  const reports = getSavedReports().map(r => {
    if(r.academicYear === year && (r.term || 'Unlabelled') === oldTerm){
      return Object.assign({}, r, { term: newTerm });
    }
    return r;
  });
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

function moveReport(id, newYear, newTerm){
  const reports = getSavedReports().map(r => {
    if(r.id === id) return Object.assign({}, r, { academicYear: newYear, term: newTerm });
    return r;
  });
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

function deleteSavedReport(id){
  if(!confirm('Delete this saved report? This cannot be undone.')) return;
  const reports = getSavedReports().filter(r => r.id !== id);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  renderPastReports();
}

function loadSavedReportToWorkspace(id){
  const r = getSavedReports().find(r => r.id === id);
  if(!r) return;
  const label = [r.subject, r.yearLevel, r.academicYear, r.term].filter(Boolean).join(' · ');
  if(students.length && !confirm(`Load "${label}" into the workspace?\n\nYour current students will be replaced.`)) return;
  students   = JSON.parse(JSON.stringify(r.students));
  selections = JSON.parse(JSON.stringify(r.selections));
  if(SUBJECT_BANKS[r.subject]) classes[activeClass].subject = r.subject;
  nextId     = students.length ? Math.max(...students.map(x => x.id)) + 1 : 1;
  saveState();
  renderAll();
  document.querySelectorAll('.tab-btn')[0].click();
}


// ── Backup / restore ──────────────────────────────────────────────────────────
// One JSON file holds every class and every saved report, so data can move between browsers.

function exportBackup(){
  saveState();
  const data = { app: 'report-generator', version: 1, exportedAt: new Date().toISOString(), activeClass, classes, reports: getSavedReports() };
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' })),
    download: `Report Generator Backup ${new Date().toISOString().slice(0, 10)}.json`
  });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}

function importBackup(e){
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const d = JSON.parse(ev.target.result);
      if(d.app !== 'report-generator' || !Array.isArray(d.classes) || d.classes.length !== CLASS_COUNT) throw new Error('bad file');
      const nStud = d.classes.reduce((n, c) => n + c.students.length, 0);
      if(!confirm(`Restore this backup?\n\n${nStud} students across ${d.classes.length} classes and ${(d.reports || []).length} saved reports.\n\nYour current classes will be replaced. Saved reports are merged (nothing is deleted).`)) return;
      classes = d.classes;
      activeClass = d.activeClass || 0;
      students = classes[activeClass].students;
      selections = classes[activeClass].selections;
      nextId = students.length ? Math.max(...students.map(x => x.id)) + 1 : 1;
      const have = new Set(getSavedReports().map(r => r.id));
      const merged = getSavedReports().concat((d.reports || []).filter(r => !have.has(r.id)))
        .sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt)));
      localStorage.setItem(REPORTS_KEY, JSON.stringify(merged));
      saveState(); renderAll(); renderPastReports();
      alert('Backup restored.');
    } catch(err){
      alert('That is not a valid Report Generator backup file.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

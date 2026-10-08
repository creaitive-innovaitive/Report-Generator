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

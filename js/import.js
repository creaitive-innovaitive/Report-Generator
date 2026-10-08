// Spreadsheet import and Excel template generation.
// xlsx is built entirely from scratch using JSZip so there is no round-trip
// through SheetJS that could corrupt internal zip structure.

// ── Template download ─────────────────────────────────────────────────────────

async function downloadTemplate(){
  // Shared-string table: intern every text value, return its index
  const sst = [], sstMap = {};
  function S(v){
    if(v === null || v === undefined || v === '') return null;
    const s = String(v);
    if(!(s in sstMap)){ sstMap[s] = sst.length; sst.push(s); }
    return sstMap[s];
  }
  // XML-safe escape
  const xs = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  // Cell helpers — must be called in order so S() populates sst before sharedStrings is built
  const sc = (r, v, si) => {        // string cell with style index si
    const i = S(v);
    return i === null
      ? `<c r="${r}" s="${si}"/>`
      : `<c r="${r}" s="${si}" t="s"><v>${i}</v></c>`;
  };
  const nc = (r, v, si) => `<c r="${r}" s="${si}"><v>${v}</v></c>`; // number cell
  const tc = (r, v) => {            // plain text cell (Instructions sheet, no style)
    const i = S(v); return i === null ? '' : `<c r="${r}" t="s"><v>${i}</v></c>`;
  };

  const COLS = 'ABCDEFGH';
  const PEB  = 'Needs Improvement,Satisfactory,Good,Very Good';

  // ── Student Data sheet ─────────────────────────────────────────────────────
  const HDRS = ['Student Name','Nickname','Gender','Grade','%','Progress','Effort','Behaviour'];
  const hdrRow   = HDRS.map((h,i) => sc(COLS[i]+'1', h, 1)).join('');
  const exRow1   = [
    sc('A2','[EXAMPLE] Le Thanh Hung (Nancy)',2), sc('B2','Nancy',2),
    sc('C2','F',2), sc('D2','A',2), nc('E2',87,2),
    sc('F2','Very Good',2), sc('G2','Good',2), sc('H2','Very Good',2),
  ].join('');
  const exRow2   = [
    sc('A3','[EXAMPLE] Araki Shoei',2), sc('B3','',2),
    sc('C3','M',2), sc('D3','B',2), nc('E3',72,2),
    sc('F3','Good',2), sc('G3','Satisfactory',2), sc('H3','Good',2),
  ].join('');

  const sheet1 = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetViews><sheetView tabSelected="1" workbookViewId="0">
<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
</sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15"/>
<cols>
<col min="1" max="1" width="36" customWidth="1"/>
<col min="2" max="2" width="14" customWidth="1"/>
<col min="3" max="3" width="9" customWidth="1"/>
<col min="4" max="4" width="8" customWidth="1"/>
<col min="5" max="5" width="7" customWidth="1"/>
<col min="6" max="6" width="20" customWidth="1"/>
<col min="7" max="7" width="20" customWidth="1"/>
<col min="8" max="8" width="20" customWidth="1"/>
</cols>
<sheetData>
<row r="1" ht="20" customHeight="1" s="1" customFormat="1">${hdrRow}</row>
<row r="2" s="2" customFormat="1">${exRow1}</row>
<row r="3" s="2" customFormat="1">${exRow2}</row>
</sheetData>
<dataValidations count="5">
<dataValidation type="list" allowBlank="1" showDropDown="0" showErrorMessage="1" sqref="C2:C3000"><formula1>"M,F"</formula1></dataValidation>
<dataValidation type="list" allowBlank="1" showDropDown="0" showErrorMessage="1" sqref="D2:D3000"><formula1>"A*,A,B,C,D,E,F,G"</formula1></dataValidation>
<dataValidation type="list" allowBlank="1" showDropDown="0" showErrorMessage="1" sqref="F2:F3000"><formula1>"${PEB}"</formula1></dataValidation>
<dataValidation type="list" allowBlank="1" showDropDown="0" showErrorMessage="1" sqref="G2:G3000"><formula1>"${PEB}"</formula1></dataValidation>
<dataValidation type="list" allowBlank="1" showDropDown="0" showErrorMessage="1" sqref="H2:H3000"><formula1>"${PEB}"</formula1></dataValidation>
</dataValidations>
</worksheet>`;

  // ── Instructions sheet ─────────────────────────────────────────────────────
  const instrData = [
    ['BETR Report Generator — Class Data Template','',''],
    ['','',''],
    ['HOW TO USE THIS TEMPLATE','',''],
    ['1. Delete the two [EXAMPLE] rows in the “Student Data” tab.','',''],
    ['2. Fill in your class — use the dropdowns for Gender, Grade, Progress, Effort & Behaviour.','',''],
    ['3. Excel: File → Save As → Excel Workbook (.xlsx)','',''],
    ['   Google Sheets: File → Download → Microsoft Excel (.xlsx)  or  → CSV','',''],
    ['4. Upload the completed file to the Report Generator website.','',''],
    ['','',''],
    ['COLUMN GUIDE','',''],
    ['Column','Description','Valid values'],
    ['Student Name','Full legal name. Put nickname in brackets: Le Thanh Hung (Nancy)','Any text'],
    ['Nickname','Optional — leave blank for automatic short-name rules.','Any text'],
    ['Gender','Required to generate comments.','M  or  F'],
    ['Grade','Achieved grade for this reporting period.','A*, A, B, C, D, E, F, G'],
    ['%','Percentage score — no % symbol needed.','0–100'],
    ['Progress','Progress rating for the term.','Needs Improvement / Satisfactory / Good / Very Good'],
    ['Effort','Effort rating for the term.','Needs Improvement / Satisfactory / Good / Very Good'],
    ['Behaviour','Behaviour rating for the term.','Needs Improvement / Satisfactory / Good / Very Good'],
    ['','',''],
    ['TIPS','',''],
    ['• Gender, Grade, Progress, Effort and Behaviour columns have dropdown menus in Excel.','',''],
    ['• Names with nicknames in brackets — Le Thanh Hung (Nancy) — are parsed automatically.','',''],
    ['• P/E/B are optional but drive auto sentence selection on the website.','',''],
    ['• Text matching is case-insensitive — "very good" and "Very Good" both work.','',''],
  ];
  const instrRows = instrData.map((row, ri) => {
    const cells = ['A','B','C'].map((col, ci) => tc(col+(ri+1), row[ci])).join('');
    return cells ? `<row r="${ri+1}">${cells}</row>` : '';
  }).filter(Boolean).join('\n');

  const sheet2 = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetFormatPr defaultRowHeight="15"/>
<cols>
<col min="1" max="1" width="18" customWidth="1"/>
<col min="2" max="2" width="60" customWidth="1"/>
<col min="3" max="3" width="42" customWidth="1"/>
</cols>
<sheetData>${instrRows}</sheetData>
</worksheet>`;

  // ── Shared strings (built after all S() calls above) ──────────────────────
  const sharedStrings = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${sst.length}" uniqueCount="${sst.length}">
${sst.map(s => `<si><t xml:space="preserve">${xs(s)}</t></si>`).join('\n')}
</sst>`;

  // ── Styles ─────────────────────────────────────────────────────────────────
  // xf 0=default, 1=header (blue bg, white bold), 2=example row (light blue tint)
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="2">
<font><sz val="12"/><color theme="1"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font>
<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font>
</fonts>
<fills count="4">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF1D4ED8"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFEFF6FF"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="3">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
<xf numFmtId="0" fontId="0" fillId="3" borderId="0" xfId="0" applyFill="1"/>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

  // ── Package XML ────────────────────────────────────────────────────────────
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<bookViews><workbookView activeTab="0"/></bookViews>
<sheets>
<sheet name="Student Data" sheetId="1" r:id="rId1"/>
<sheet name="Instructions" sheetId="2" r:id="rId2"/>
</sheets>
</workbook>`;

  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  // ── Assemble zip and download ──────────────────────────────────────────────
  const zip = new JSZip();
  zip.file('[Content_Types].xml', contentTypes);
  zip.file('_rels/.rels', rootRels);
  zip.file('xl/workbook.xml', workbook);
  zip.file('xl/_rels/workbook.xml.rels', workbookRels);
  zip.file('xl/worksheets/sheet1.xml', sheet1);
  zip.file('xl/worksheets/sheet2.xml', sheet2);
  zip.file('xl/sharedStrings.xml', sharedStrings);
  zip.file('xl/styles.xml', styles);

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    compression: 'DEFLATE',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Report Generator - Input Template.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// ── Google Sheets import ──────────────────────────────────────────────────────

async function importFromGoogleSheets(){
  const input = document.getElementById('gs-url');
  const url   = (input ? input.value : '').trim();
  if(!url){ alert('Please paste a Google Sheets link first.'); return; }

  // Extract the spreadsheet ID from any Google Sheets URL format
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if(!match){ alert('That doesn\'t look like a Google Sheets link.\n\nPaste the full URL from your browser address bar, e.g.\nhttps://docs.google.com/spreadsheets/d/abc123/edit'); return; }

  const id     = match[1];
  const csvUrl = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;

  const btn = document.getElementById('gs-btn');
  if(btn){ btn.textContent = 'Importing…'; btn.disabled = true; }

  try {
    const res = await fetch(csvUrl);
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    // Parse CSV via SheetJS then hand off to the shared import logic
    const wb   = XLSX.read(text, { type: 'string' });
    const dataSheets = wb.SheetNames.filter(n => !/instructions/i.test(n));
    if(dataSheets.length > 1){
      _pendingWb = wb;
      openSheetPicker(dataSheets);
    } else {
      _importWorkbook(wb, dataSheets[0] || wb.SheetNames[0], 'Google Sheets');
    }
    if(input) input.value = '';
  } catch(err){
    alert('Could not fetch the sheet.\n\nMake sure:\n• The sheet is shared as "Anyone with the link can view"\n• You copied the full URL from the browser address bar');
  } finally {
    if(btn){ btn.textContent = 'Import'; btn.disabled = false; }
  }
}

// ── Spreadsheet upload ────────────────────────────────────────────────────────

// Holds the workbook between sheet-picker interactions
let _pendingWb = null;

function handleSheet(e){
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const wb = XLSX.read(ev.target.result, { type: 'binary' });
      const dataSheets = wb.SheetNames.filter(n => !/instructions/i.test(n));
      if(dataSheets.length > 1){
        _pendingWb = wb;
        openSheetPicker(dataSheets);
      } else {
        _importWorkbook(wb, dataSheets[0] || wb.SheetNames[0], dataSheets[0] || wb.SheetNames[0]);
      }
    } catch(err){
      alert('Could not read file.\n\nMake sure you are uploading the Input Template or a CSV/Excel file with a "Student Name" column.');
    }
  };
  reader.readAsBinaryString(file);
  e.target.value = '';
}

function openSheetPicker(sheetNames){
  const list = document.getElementById('sheet-picker-list');
  list.innerHTML = sheetNames.map(name => {
    const q = `'${name.replace(/'/g, "\\'")}'`; // single-quote safe for onclick attribute
    return `<button class="btn btn-ghost sheet-pick-btn" data-sheet="${name.replace(/"/g,'&quot;')}"
      style="justify-content:flex-start;text-align:left;padding:.5rem .85rem"
      onclick="pickSheet(${q})">📄 ${name}</button>`;
  }).join('');
  const status = document.getElementById('sheet-picker-status');
  if(status) status.textContent = '';
  document.getElementById('sheet-picker-modal').style.display = 'flex';
}

function closeSheetPicker(){
  document.getElementById('sheet-picker-modal').style.display = 'none';
  _pendingWb = null;
}

function pickerNewRoster(){
  if(students.length && !confirm('Clear the current roster and start fresh?')) return;
  students = []; selections = {};
  saveState(); renderAll();
  const status = document.getElementById('sheet-picker-status');
  if(status) status.textContent = 'Roster cleared — ready for next class.';
}

function pickSheet(name){
  if(!_pendingWb) return;

  if(students.length){
    const replace = confirm(
      `You have ${students.length} student${students.length !== 1 ? 's' : ''} in the current roster.\n\n` +
      `OK = Replace roster\nCancel = Add to current roster`
    );
    if(replace){ students = []; selections = {}; }
  }

  const [added, skipped] = _importSheet(_pendingWb, name);
  saveState(); renderAll();

  // Mark button as done — keep modal open for next sheet
  const btn = document.querySelector(`.sheet-pick-btn[data-sheet=${JSON.stringify(name)}]`);
  if(btn){
    btn.disabled = true;
    btn.style.cssText += ';background:#dcfce7;border-color:#059669;color:#059669;opacity:1';
    btn.textContent = `✓ ${name} — ${added} student${added !== 1 ? 's' : ''} imported`;
  }
  const status = document.getElementById('sheet-picker-status');
  setRosterLabel(name);
  if(status) status.textContent =
    `"${name}" imported (${added} student${added !== 1 ? 's' : ''}${skipped ? `, ${skipped} skipped` : ''}).`
    + ' Click another sheet or close.';
}

function importAllSheets(){
  if(!_pendingWb) return;
  const sheets = _pendingWb.SheetNames.filter(n => !/instructions/i.test(n));
  const wb = _pendingWb;
  closeSheetPicker();

  // Clear once if roster has existing students
  if(students.length){
    const replace = confirm(
      `You have ${students.length} student${students.length !== 1 ? 's' : ''} in the current roster.\n\n` +
      `OK = Replace roster\nCancel = Add all sheets to current roster`
    );
    if(replace){ students = []; selections = {}; }
  }

  let totalAdded = 0, totalSkipped = 0;
  sheets.forEach(name => {
    const [added, skipped] = _importSheet(wb, name);
    totalAdded += added; totalSkipped += skipped;
  });

  alert(`Imported ${totalAdded} student${totalAdded !== 1 ? 's' : ''} from ${sheets.length} sheets.`
    + (totalSkipped > 0 ? ` (${totalSkipped} rows skipped)` : ''));
  saveState(); renderAll();
}

function _importWorkbook(wb, sheetName, sourceName){
  if(students.length){
    const replace = confirm(
      `You have ${students.length} student${students.length !== 1 ? 's' : ''} in the current roster.\n\n` +
      `OK = Replace roster\nCancel = Add to current roster`
    );
    if(replace){ students = []; selections = {}; }
  }
  const [added, skipped] = _importSheet(wb, sheetName);
  const msg = `Imported ${added} student${added !== 1 ? 's' : ''} from "${sourceName || sheetName}".`
    + (skipped > 0 ? ` (${skipped} rows skipped)` : '');
  alert(msg);
  setRosterLabel(sourceName || sheetName);
  saveState(); renderAll();
}

// Parse one sheet and push students; returns [added, skipped]
function _importSheet(wb, sheetName){
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName] || {}, { defval: '' });
  let added = 0, skipped = 0;
  rows.forEach(row => {
    const get = (...names) => {
      for(const n of names){
        const k = Object.keys(row).find(k => k.toLowerCase().replace(/[\s_%]/g,'').includes(n));
        if(k !== undefined && row[k] !== '') return String(row[k]).trim();
      }
      return '';
    };
    const rawName = get('studentname','name','student');
    if(!rawName || /^\[?example/i.test(rawName)){ skipped++; return; }
    const parsed = parseBracketed(rawName);
    const nick   = get('nickname','englishname','nick') || parsed.nickname;
    const grade  = get('grade','symbol','mark');
    const pct    = get('percent','percentage','score');
    const prog   = normalise(get('progress'));
    const eff    = normalise(get('effort'));
    const beh    = normalise(get('behaviour','behavior'));
    const rawG   = get('gender','sex');
    const gender = rawG ? (/^f/i.test(rawG) ? 'F' : 'M') : '';
    if(parsed.fullName){ pushStudent(parsed.fullName, nick, grade, pct, prog, eff, beh, gender); added++; }
    else skipped++;
  });
  return [added, skipped];
}

// Normalise P/E/B text — case-insensitive, forgiving of minor typos
function normalise(val){
  const v = (val || '').trim().toLowerCase();
  if(!v) return '';
  if(v.includes('very') && v.includes('good'))   return 'Very Good';
  if(v.includes('good'))                         return 'Good';
  if(v.includes('satisf'))                       return 'Satisfactory';
  if(v.includes('need') || v.includes('improv')) return 'Needs Improvement';
  return '';
}

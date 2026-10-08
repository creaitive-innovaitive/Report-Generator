// DOM rendering for all three tabs.

function renderClassTabs(){
  const el = document.getElementById('class-tabs');
  if(!el) return;
  el.innerHTML = classes.map((c, i) =>
    `<button class="class-tab${i === activeClass ? ' active' : ''}" onclick="switchClass(${i})" ondblclick="renameClass(${i})" title="Double-click to rename">${c.name}${c.students.length ? ` <span class="class-n">${c.students.length}</span>` : ''}</button>`
  ).join('') + `<button class="class-tab-edit" onclick="renameClass(activeClass)" title="Rename this class">✏️</button><button class="class-tab-edit" onclick="swapClasses()" title="Swap this class with another position">⇄</button>
    <select class="class-subject" onchange="setClassSubject(this.value)" title="Comment bank for this class">${Object.keys(SUBJECT_BANKS).map(x => `<option${x === currentSubject() ? ' selected' : ''}>${x}</option>`).join('')}</select>`;
}

function renderAll(){
  renderClassTabs();
  document.getElementById('s-count').textContent = students.length;
  renderRoster();
  renderComments();
  renderExport();
}

function pebClass(v){
  if(!v) return '';
  if(v === 'Very Good')         return 'peb-vg';
  if(v === 'Good')              return 'peb-g';
  if(v === 'Satisfactory')      return 'peb-s';
  return 'peb-ni';
}

function nameTypeTag(s){
  if(s.viet)   return '<span class="tag-viet">Vietnamese</span>';
  if(s.jap)    return '<span class="tag-viet" style="background:#fdf4ff;color:#7c3aed;border-color:#d8b4fe">Japanese</span>';
  if(s.korean) return '<span class="tag-viet" style="background:#fff7ed;color:#c2410c;border-color:#fed7aa">Korean</span>';
  return '<span style="color:var(--muted);font-size:.72rem">International</span>';
}

function rateSel(id, field, val){
  const opts = ['Very Good', 'Good', 'Satisfactory', 'Needs Improvement']
    .map(o => `<option${o === val ? ' selected' : ''}>${o}</option>`).join('');
  return `<select class="s-sel" onchange="setField(${id},'${field}',this.value)"><option value="">—</option>${opts}</select>`;
}

// <option>s for a bank array, split into Theory / Programming groups when the bank defines `split`.
function splitOpts(list, split, selIdx, mk, labels){
  if(!split) return labels[2] === '' ? list.map(mk).join('') : `<optgroup label="Academic Skills">${list.map(mk).join('')}</optgroup>`;
  return `<optgroup label="${labels[0]}">${list.slice(0, split).map(mk).join('')}</optgroup>` +
         `<optgroup label="${labels[1]}">${list.slice(split).map((x, i) => mk(x, i + split)).join('')}</optgroup>`;
}

function renderRoster(){
  const w = document.getElementById('roster-wrap');
  if(!students.length){
    w.innerHTML = `<div class="empty"><div class="ei">👨‍🎓</div><p>No students yet — add one above or import a file.</p></div>`;
    return;
  }
  const missingGender = students.filter(s => !s.gender).length;
  let h = '';
  if(missingGender){
    h += `<div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:6px;padding:.6rem .9rem;margin-bottom:.75rem;font-size:.82rem;color:#92400e;">
      ⚠️ <strong>${missingGender} student${missingGender > 1 ? 's are' : ' is'} missing gender</strong> — set M/F below before exporting.
    </div>`;
  }
  h += `<div style="overflow-x:auto"><table><thead><tr>
    <th>#</th><th>Full Name</th><th>Short Name</th>
    <th>Gender <span style="color:var(--danger)">*</span></th>
    <th>Grade</th><th>%</th>
    <th>Progress</th><th>Effort</th><th>Behaviour</th><th>Name type</th><th></th>
  </tr></thead><tbody>`;

  students.forEach((s, i) => {
    const t  = tier(s.grade);
    const sn = shortName(s);
    const genderBtns = `
      <button class="gender-btn${s.gender === 'M' ? ' active-m' : ''}" onclick="setGender(${s.id},'M')" title="Male">M</button>
      <button class="gender-btn${s.gender === 'F' ? ' active-f' : ''}" onclick="setGender(${s.id},'F')" title="Female">F</button>
      ${!s.gender ? '<span style="color:var(--danger);font-size:.7rem;margin-left:.2rem">⚠</span>' : ''}`;
    h += `<tr>
      <td style="color:var(--muted)">${i + 1}</td>
      <td><strong>${s.fullName}</strong>${s.nickname ? ` <span style="color:var(--muted);font-size:.75rem">(${s.nickname})</span>` : ''}</td>
      <td><span class="tag-short">${sn}</span></td>
      <td><div style="display:flex;align-items:center;gap:.2rem">${genderBtns}</div></td>
      <td><select class="s-sel" style="width:64px" onchange="setField(${s.id},'grade',this.value)"><option value="">—</option>${['A*','A','B','C','D','E','F','G','U'].map(g => `<option${g === s.grade ? ' selected' : ''}>${g}</option>`).join('')}</select></td>
      <td><input type="number" min="0" max="100" style="width:64px" value="${s.percent || ''}" onchange="setField(${s.id},'percent',this.value)"/></td>
      <td>${rateSel(s.id, 'progress', s.progress)}</td>
      <td>${rateSel(s.id, 'effort', s.effort)}</td>
      <td>${rateSel(s.id, 'behaviour', s.behaviour)}</td>
      <td>${nameTypeTag(s)}</td>
      <td><button class="btn btn-red btn-sm" onclick="delStudent(${s.id})">✕</button></td>
    </tr>`;
  });

  h += '</tbody></table></div>';
  w.innerHTML = h;
}

function renderComments(){
  const w = document.getElementById('comments-wrap');
  if(!students.length){
    w.innerHTML = `<div class="empty"><div class="ei">✏️</div><p>Add students in Tab 1 first.</p></div>`;
    return;
  }
  let h = '';
  students.forEach(s => {
    const t   = tier(s.grade);
    const dn  = displayName(s);
    const sn  = shortName(s);
    const g   = s.gender || '';
    const sel = selections[s.id] || { mode: 'auto', s1: 0, s2cat: 's2_academic', s2: 0, s3: 0, s4: -1 };
    const isAuto  = sel.mode === 'auto';
    const s2cat   = isAuto ? autoS2Cat(s) : (sel.s2cat || 's2_academic');
    const s2CatLabel = { s2_academic: 'Academic', s2_effort: 'Effort & Work Ethic', s2_behaviour: 'Behaviour' }[s2cat];
    const comment = assembleFull(s, sel);
    const len     = comment.length;
    const ccClass = len > 350 ? 'over' : len >= 330 ? 'good' : len >= 300 ? 'near' : 'low';
    const ccMsg   = len > 350 ? `⚠ ${len}/350 — too long` : `${len} / 350 chars`;

    const s2Opts = [
      splitOpts(currentBank()[t].s2_academic, currentBank()[t].split, sel.s2,
        (tmpl, i) => `<option value="s2_academic:${i}"${s2cat === 's2_academic' && sel.s2 === i ? ' selected' : ''}>${renderTmpl(tmpl, dn, sn, g)}</option>`,
        ['Academic — Theory', 'Academic — Programming']),
      `<optgroup label="Effort & Work Ethic">`,
      ...currentBank()[t].s2_effort.map((tmpl, i) => `<option value="s2_effort:${i}"${s2cat === 's2_effort' && sel.s2 === i ? ' selected' : ''}>${renderTmpl(tmpl, dn, sn, g)}</option>`),
      `</optgroup><optgroup label="Behaviour">`,
      ...currentBank()[t].s2_behaviour.map((tmpl, i) => `<option value="s2_behaviour:${i}"${s2cat === 's2_behaviour' && sel.s2 === i ? ' selected' : ''}>${renderTmpl(tmpl, dn, sn, g)}</option>`),
      `</optgroup>`
    ].join('');

    const s4Opts = [
      `<option value="-1"${sel.s4 === -1 ? ' selected' : ''}>Auto (add if needed)</option>`,
      `<option value="-2"${sel.s4 === -2 ? ' selected' : ''}>None</option>`,
      ...currentBank()[t].s4.map((tmpl, i) => `<option value="${i}"${sel.s4 === i ? ' selected' : ''}>${renderTmpl(tmpl, dn, sn, g)}</option>`)
    ].join('');

    h += `<div class="sc-card">
      <div class="sc-hdr">
        <span class="sc-name">${dn}</span>
        <span class="badge b${t}">${s.grade}</span>
        ${s.percent ? `<span style="font-size:.75rem;color:var(--muted)">${s.percent}%</span>` : ''}
        <span class="tag-short">${sn}</span>
        <div class="mode-toggle">
          <button class="mode-btn${isAuto ? ' active' : ''}" onclick="setMode(${s.id},'auto')">⚡ Auto</button>
          <button class="mode-btn${!isAuto ? ' active' : ''}" onclick="setMode(${s.id},'manual')">✏️ Manual</button>
        </div>
      </div>
      ${(s.progress || s.effort || s.behaviour) ? `<div class="peb-row">
        ${s.progress  ? `<span class="peb-item"><span class="peb-label">Progress:</span><span class="${pebClass(s.progress)}">${s.progress}</span></span>`  : ''}
        ${s.effort    ? `<span class="peb-item"><span class="peb-label">Effort:</span><span class="${pebClass(s.effort)}">${s.effort}</span></span>`            : ''}
        ${s.behaviour ? `<span class="peb-item"><span class="peb-label">Behaviour:</span><span class="${pebClass(s.behaviour)}">${s.behaviour}</span></span>`  : ''}
        ${isAuto ? `<span class="peb-item" style="margin-left:auto"><span class="peb-label">S2 type auto-selected:</span> <span class="auto-tag">${s2CatLabel}</span></span>` : ''}
      </div>` : ''}
      <div class="s-row${isAuto ? ' auto-row' : ''}">
        <span class="s-lbl">S1 · Opening${isAuto ? '<small>editable</small>' : ''}</span>
        <select class="s-sel" onchange="updateS(${s.id},'s1',this.value)">
          ${splitOpts(currentBank()[t].s1, currentBank()[t].split, sel.s1, (tmpl, i) => `<option value="${i}"${sel.s1 === i ? ' selected' : ''}>${renderTmpl(tmpl, dn, sn, g)}</option>`, ['Theory', 'Programming', ''])}
        </select>
      </div>
      <div class="s-row${isAuto ? ' auto-row' : ''}">
        <span class="s-lbl">S2 · Improvement${isAuto ? `<small>auto: ${s2CatLabel}</small>` : '<small>choose category</small>'}</span>
        <select class="s-sel" onchange="updateS2(${s.id},this.value)">${s2Opts}</select>
      </div>
      <div class="s-row${isAuto ? ' auto-row' : ''}">
        <span class="s-lbl">S3 · Close${isAuto ? '<small>editable</small>' : ''}</span>
        <select class="s-sel" onchange="updateS(${s.id},'s3',this.value)">
          ${currentBank()[t].s3.map((tmpl, i) => `<option value="${i}"${sel.s3 === i ? ' selected' : ''}>${renderTmpl(tmpl, dn, sn, g)}</option>`).join('')}
        </select>
      </div>
      ${len < 330 || !isAuto ? `<div class="s-row">
        <span class="s-lbl">S4 · Extra<small>padding sentence</small></span>
        <select class="s-sel" onchange="updateS(${s.id},'s4',this.value)">${s4Opts}</select>
      </div>` : ''}
      ${isAuto
        ? `<div class="preview" id="prev-${s.id}">${comment}</div>`
        : `<textarea class="preview preview-edit" id="prev-${s.id}" rows="5" oninput="editComment(${s.id},this.value)">${comment.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</textarea>`}
      <div class="sc-foot">
        <span class="cc ${ccClass}" id="cc-${s.id}">${ccMsg}</span>
        ${!isAuto && sel.custom ? `<button class="btn btn-ghost btn-sm" onclick="resetComment(${s.id})">↺ Reset to generated</button>` : ''}
        <button class="btn btn-ghost btn-sm" onclick="copyOne(${s.id})">📋 Copy</button>
      </div>
    </div>`;
  });
  w.innerHTML = h;
}

function renderExport(){
  const w = document.getElementById('export-wrap');
  if(!students.length){
    w.innerHTML = `<div class="empty"><div class="ei">📄</div><p>Add students first.</p></div>`;
    return;
  }
  let h = '';
  students.forEach(s => {
    const t       = tier(s.grade);
    const dn      = displayName(s);
    const comment = assembleFull(s, selections[s.id] || { mode: 'auto', s1: 0, s2cat: 's2_academic', s2: 0, s3: 0, s4: -1 });
    const len     = comment.length;
    h += `<div class="exp-card">
      <div class="exp-hdr">
        <span class="exp-name">${dn} <span class="badge b${t}">${s.grade}</span></span>
        <button class="btn btn-ghost btn-sm" onclick="copyOne(${s.id})">📋 Copy</button>
      </div>
      <div class="exp-txt">${comment}</div>
      <div style="text-align:right;margin-top:.25rem">
        <span class="cc ${len > 350 ? 'over' : len >= 330 ? 'good' : 'near'}" style="font-size:.7rem">${len} / 350</span>
      </div>
    </div>`;
  });
  w.innerHTML = h;
}

function liveUpdate(id){
  const s       = students.find(x => x.id === id);
  const comment = assembleFull(s, selections[id]);
  const len     = comment.length;
  const ccClass = len > 350 ? 'over' : len >= 330 ? 'good' : len >= 300 ? 'near' : 'low';
  const prev    = document.getElementById(`prev-${id}`);
  const cnt     = document.getElementById(`cc-${id}`);
  if(prev) prev[prev.tagName === 'TEXTAREA' ? 'value' : 'textContent'] = comment;
  if(cnt){ cnt.textContent = len > 350 ? `⚠ ${len}/350 — too long` : `${len} / 350 chars`; cnt.className = `cc ${ccClass}`; }
  renderExport();
}

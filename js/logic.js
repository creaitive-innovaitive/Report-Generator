// Core logic: grade tiers, template rendering, auto S2 selection, comment assembly.

const LEVELS = { 'Very Good': 3, 'Good': 2, 'Satisfactory': 1, 'Needs Improvement': 0 };
function lvl(v){ return LEVELS[(v || '').trim()] ?? 2; }

function tier(grade){
  const g = (grade || '').toString().trim().toUpperCase();
  if(g === 'A+' || g === 'A*' || g === 'A') return 'A';
  if(g === 'B') return 'B';
  return 'C'; // C, D, E, F, G all use the C-tier comment bank
}

// Grade -> default progress rating
function progressForGrade(grade){
  const g = (grade || '').toString().trim().toUpperCase();
  if(!g) return '';
  if(g === 'A*' || g === 'A+' || g === 'A') return 'Very Good';
  if(g === 'B') return 'Good';
  if(g === 'C') return 'Satisfactory';
  return 'Needs Improvement'; // D-G
}

function renderTmpl(t, dn, sn, gender){
  const g = gender || '';
  return t
    .replace(/\[FULL_NAME\]/g, dn)
    .replace(/\[SHORT_NAME\]/g, sn)
    .replace(/\[THEIR\]/g,  g === 'M' ? 'his'  : g === 'F' ? 'her'  : 'their')
    .replace(/\[THEM\]/g,   g === 'M' ? 'him'  : g === 'F' ? 'her'  : 'them')
    .replace(/\[THEY\]/g,   g === 'M' ? 'he'   : g === 'F' ? 'she'  : 'they');
}

function autoS2Cat(s){
  const b = lvl(s.behaviour), e = lvl(s.effort);
  if(b <= 1) return 's2_behaviour';
  if(e <= 1) return 's2_effort';
  return 's2_academic';
}

// ── Repetition avoidance ──────────────────────────────────────────────────────
// Auto mode picks S2/S3/S4 that share the fewest content words with what is already written.

const STOP_WORDS = new Set(['with','that','this','their','have','more','should','would','will','from','been','term','also','make','into','each','which','they','there','when','than','every','over','such','some','must','needs','need','shown','shows','both','across','throughout','other','these','those','where','while','being','about','after','before','still','even']);

function contentKeys(text, names){
  const skip = new Set(names.flatMap(n => String(n).toLowerCase().match(/[a-z]+/g) || []));
  return (String(text).toLowerCase().match(/[a-z]+/g) || [])
    .filter(w => w.length >= 4 && !STOP_WORDS.has(w) && !skip.has(w))
    .map(w => w.slice(0, 5)); // crude stem: focus/focused/focusing
}

function overlapScore(existing, candidate, names){
  const have = new Set(contentKeys(existing, names));
  return contentKeys(candidate, names).filter(k => have.has(k)).length;
}

// Index in `list` whose rendered text overlaps least with `existing`; ties go to the lowest index.
function leastRepeated(list, existing, names, render){
  let best = 0, bestScore = Infinity;
  list.forEach((tmpl, i) => {
    const sc = overlapScore(existing, render(tmpl), names);
    if(sc < bestScore){ best = i; bestScore = sc; }
  });
  return best;
}

// Resolves the three main sentences; untouched dropdowns in auto mode are chosen to avoid repetition.
function resolveParts(s, sel, bank){
  const t  = tier(s.grade);
  const dn = displayName(s), sn = shortName(s), g = s.gender || '';
  const isAuto = sel.mode === 'auto';
  const touched = sel.touched || {};
  const names = [s.fullName, s.nickname, sn].filter(Boolean);
  const r = tmpl => renderTmpl(tmpl, dn, sn, g);

  const s2cat = isAuto ? autoS2Cat(s) : (sel.s2cat || 's2_academic');
  const p1 = r(bank[t].s1[sel.s1 || 0]);
  const i2 = (isAuto && !touched.s2) ? leastRepeated(bank[t][s2cat], p1, names, r) : (sel.s2 || 0);
  const p2 = r(bank[t][s2cat][i2]);
  const i3 = (isAuto && !touched.s3) ? leastRepeated(bank[t].s3, `${p1} ${p2}`, names, r) : (sel.s3 || 0);
  const p3 = r(bank[t].s3[i3]);
  return { t, dn, sn, g, isAuto, s2cat, p1, p2, p3, i2, i3, names, r };
}

// subject: optional, so saved reports render with their own subject's bank
function assembleFull(s, sel, subject){
  const bank = subject ? bankFor(subject) : currentBank();
  if(sel.mode === 'manual' && sel.custom) return sel.custom; // hand-edited text wins
  const { t, dn, sn, g, isAuto, p1, p2, p3, names, r } = resolveParts(s, sel, bank);
  let comment = `${p1} ${p2} ${p3}`;

  if(comment.length < 300){
    const s4idx = isAuto ? -1 : (sel.s4 ?? -1);
    if(s4idx === -1){
      const bank4 = bank[t].s4.map((tmpl, i) => ({ i, txt: renderTmpl(tmpl, dn, sn, g), rep: overlapScore(comment, renderTmpl(tmpl, dn, sn, g), names) }));
      const fits  = bank4.filter(x => comment.length + 1 + x.txt.length <= 350).sort((a, b) => a.rep - b.rep || b.txt.length - a.txt.length);
      if(fits.length) comment = `${comment} ${fits[0].txt}`;
    } else if(s4idx >= 0 && bank[t].s4[s4idx]){
      comment = `${comment} ${renderTmpl(bank[t].s4[s4idx], dn, sn, g)}`;
    }
  } else if(sel.s4 >= 0 && !isAuto && bank[t].s4[sel.s4]){
    const s4txt = renderTmpl(bank[t].s4[sel.s4], dn, sn, g);
    if(comment.length + 1 + s4txt.length <= 355) comment = `${comment} ${s4txt}`;
  }

  return comment;
}

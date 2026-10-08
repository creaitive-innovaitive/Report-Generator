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

function assembleFull(s, sel){
  const t  = tier(s.grade);
  const dn = displayName(s);
  const sn = shortName(s);
  const g  = s.gender || '';
  const isAuto = sel.mode === 'auto';

  const s2cat = isAuto ? autoS2Cat(s) : (sel.s2cat || 's2_academic');
  const p1 = renderTmpl(BANK[t].s1[sel.s1 || 0], dn, sn, g);
  const p2 = renderTmpl(BANK[t][s2cat][sel.s2 || 0], dn, sn, g);
  const p3 = renderTmpl(BANK[t].s3[sel.s3 || 0], dn, sn, g);
  let comment = `${p1} ${p2} ${p3}`;

  if(comment.length < 300){
    const s4idx = isAuto ? -1 : (sel.s4 ?? -1);
    if(s4idx === -1){
      const bank4 = BANK[t].s4.map((tmpl, i) => ({ i, txt: renderTmpl(tmpl, dn, sn, g) }));
      const fits  = bank4.filter(x => comment.length + 1 + x.txt.length <= 350).sort((a, b) => b.txt.length - a.txt.length);
      if(fits.length) comment = `${comment} ${fits[0].txt}`;
    } else if(s4idx >= 0 && BANK[t].s4[s4idx]){
      comment = `${comment} ${renderTmpl(BANK[t].s4[s4idx], dn, sn, g)}`;
    }
  } else if(sel.s4 >= 0 && !isAuto && BANK[t].s4[sel.s4]){
    const s4txt = renderTmpl(BANK[t].s4[sel.s4], dn, sn, g);
    if(comment.length + 1 + s4txt.length <= 355) comment = `${comment} ${s4txt}`;
  }

  return comment;
}

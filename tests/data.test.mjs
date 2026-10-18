// Data integrity tests: names, expansions, taxonomy, sources, diagrams.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { LEGACY_NAMES, REQUESTED, ANIMATED_IDS, PENDING_OK, PENDING_GROUP, PENDING_CONTENT, PENDING_FORBIDDEN, MONITOR_USE_UNVERIFIED,
  NEWLY_SOURCED, VERIFIED_ADDITIONS, REJECTED_URLS, S23_CITED_BY, S23_DIAGRAMS } from './fixtures.mjs';

const require = createRequire(import.meta.url);
const D = require('../js/data.js');
const DG = require('../js/diagrams.js');
const norm = (s) => s.toLowerCase().replace(/[-‐–]/g, ' ').replace(/\s+/g, ' ').trim();

test('keeps all 39 legacy guide names searchable by exact name or alias', () => {
  assert.equal(LEGACY_NAMES.length, 39);
  for (const n of LEGACY_NAMES) {
    const hit = D.entries.find((e) => [e.name, ...(e.aka || [])].some((x) => norm(x) === norm(n)));
    assert.ok(hit, `legacy name not found: ${n}`);
  }
});

test('every requested name is its own entry with its exact expansion', () => {
  for (const [name, expansion] of REQUESTED) {
    const e = D.entries.find((x) => x.name === name);
    assert.ok(e, `missing entry ${name}`);
    assert.ok(norm(e.full).includes(norm(expansion)), `${name} full "${e.full}" lacks "${expansion}"`);
  }
  const ids = new Set(REQUESTED.map(([n]) => D.entries.find((x) => x.name === n).id));
  assert.equal(ids.size, REQUESTED.length, 'requested names must be distinct entries');
});

test('consumer QLED and QD-LED are distinct; QLED makes no claim about what QD-LED is', () => {
  const q = D.entries.find((e) => e.name === 'QLED');
  const qd = D.entries.find((e) => e.name === 'QD-LED');
  assert.notEqual(q.id, qd.id);
  assert.equal(q.family, 'lcd');
  assert.equal(qd.family, 'pending');
  assert.match(q.caveat, /QD-LED, which has the same requested expansion, is a separate entry here and is still source pending/);
  assert.doesNotMatch(q.caveat, /quantum dots themselves|would emit/);
});

test('source-pending entries carry only the requested name, expansion and a pending notice', () => {
  for (const [id, want] of Object.entries(PENDING_CONTENT)) {
    const e = D.entry(id);
    assert.equal(e.name, want.name, `${id} exact requested name`);
    assert.equal(e.full, want.full, `${id} exact requested expansion, nothing appended`);
    assert.deepEqual(e.aka, want.aka, `${id} aliases limited to the requested expansion`);
    assert.equal(e.pending, true);
    assert.deepEqual(e.sources, []);
    assert.equal(e.traits, undefined, `${id} is not in compare`);
    assert.equal(e.more, undefined, `${id} has no extra copy`);
    assert.deepEqual([e.family, e.axis, e.status], ['pending', 'pending', 'pending'], `${id} has no asserted family/axis/adoption status`);
    assert.equal(e.kind, 'Unclassified name');
    assert.match(e.plain, /^Source pending\./, `${id} opens with an explicit pending notice`);
    assert.ok(e.plain.includes(want.full), `${id} plain repeats only the expansion`);
    assert.match(e.caveat, /^Source pending:/);
    for (const text of [e.full, e.kind, e.plain, e.overlap, e.caveat, ...e.aka]) {
      assert.doesNotMatch(text, PENDING_FORBIDDEN[id], `${id}: unsupported claim in "${text}"`);
    }
  }
  assert.equal(D.families.pending, PENDING_GROUP.name);
  assert.equal(D.axes.pending.label, 'No axis assigned');
  assert.equal(D.statuses.pending, 'Source pending');
});

test('source-pending names sit only in the neutral "Unclassified / source pending" branch', () => {
  const top = D.tree.find((n) => n.id === PENDING_GROUP.id);
  assert.ok(top, 'pending group is a top-level branch, not under a physical family');
  assert.deepEqual(top.children.map((c) => c.id).sort(), [...PENDING_OK].sort());
  assert.ok(top.children.every((c) => !c.children), 'no sub-branches asserted');
  const g = D.groups[PENDING_GROUP.id];
  assert.equal(g.name, PENDING_GROUP.name);
  assert.deepEqual([g.family, g.axis], ['pending', 'pending']);
  const parentOf = {};
  (function walk(ns, p) { ns.forEach((n) => { parentOf[n.id] = p; walk(n.children || [], n.id); }); })(D.tree, null);
  for (const id of PENDING_OK) assert.equal(parentOf[id], PENDING_GROUP.id, `${id} only under the pending group`);
  for (const e of D.entries.filter((x) => !x.pending)) assert.notEqual(e.family, 'pending', `${e.id} is classified`);
  // No other copy asserts what the pending names are.
  const names = PENDING_OK.map((id) => D.entry(id).name);
  for (const e of D.entries.filter((x) => !x.pending && x.id !== 'qled')) {
    for (const text of [e.plain, e.overlap, e.caveat, e.more || '', ...(e.aka || [])]) {
      for (const n of names) assert.ok(!text.includes(n), `${e.id} mentions pending ${n}`);
    }
  }
});

test('source-pending diagram is a static, neutral labelled card; axis figures no longer place pending names', () => {
  for (const id of [...PENDING_OK, PENDING_GROUP.id]) assert.equal(DG.keyFor(D.entry(id) || { id, ...D.groups[id] }), 'pending', `${id} -> pending card`);
  const f = DG.figures.pending;
  assert.equal(f.animated, false);
  assert.equal(f.staticTag, 'static labelled card');
  assert.ok(f.steps.every((s) => s.src.length === 0 && !s.bg), 'pending card cites nothing');
  for (const id of PENDING_OK) {
    const e = D.entry(id), svg = DG.render(e);
    assert.match(svg, /role="img"/);
    assert.ok(svg.includes(`>${e.name}<`) && svg.includes(`>${e.full}<`), `${id} card shows name and expansion`);
    assert.equal((svg.match(/>not assigned</g) || []).length, 2, `${id} family and axis marked not assigned`);
    assert.doesNotMatch(svg, /class="[^"]*(glow|ph |ray|emit)/, `${id} card draws no mechanism`);
  }
  assert.equal(DG.figures['qled-vs-qdled'], undefined, 'old QLED vs QD-LED mechanism figure removed');
  for (const [key, fig] of Object.entries(DG.figures)) {
    if (key === 'pending') continue;
    const sample = D.entries.find((e) => DG.keyFor(e) === key) || null;
    const text = [fig.title, fig.desc, ...fig.steps.map((s) => s.text), sample ? DG.render(sample) : ''].join(' ');
    for (const id of PENDING_OK) assert.ok(!text.includes(D.entry(id).name), `${key} figure mentions pending ${id}`);
  }
});

test('S23 (UDC OLED page) is an exact record cited only for basic OLED and WOLED', () => {
  const s = D.source('S23');
  assert.equal(D.sources[D.sources.length - 1].id, 'S23', 'S23 is the next source id');
  assert.equal(s.type, 'Manufacturer (materials)');
  assert.match(s.use, /organic thin films between conductive electrodes/);
  assert.match(s.use, /electroluminescence/);
  assert.match(s.use, /patterned red, green and blue OLED subpixels, or white light in every pixel with colour filters/);
  assert.match(s.caveat, /not a monitor maker/);
  assert.match(s.caveat, /not for monitor prevalence or product performance/);
  assert.deepEqual(D.entries.filter((e) => e.sources.includes('S23')).map((e) => e.id).sort(), [...S23_CITED_BY].sort());
  for (const e of D.entries) for (const t of Object.values(e.traits || {})) assert.ok(!t.src.includes('S23'), `${e.id} trait must not cite S23 for performance`);
  assert.match(D.entry('oled').plain, /organic thin films between conductive electrodes/);
  assert.match(D.entry('oled').plain, /electroluminescence/);
  assert.match(D.entry('woled').overlap, /white light in every pixel with colour filters/);
  const withS23 = Object.entries(DG.figures).filter(([, f]) => f.steps.some((x) => x.src.includes('S23'))).map(([k]) => k);
  assert.deepEqual(withS23.sort(), [...S23_DIAGRAMS].sort());
  for (const k of S23_DIAGRAMS) {
    const step = DG.figures[k].steps.find((x) => x.src.includes('S23'));
    assert.doesNotMatch(step.text, /monitor|common|bright|efficien|lifetime|\d/i, `${k} S23 step stays on mechanism`);
  }
});

test('monitor adoption is labelled separately from source verification', () => {
  assert.ok(!Object.values(D.statuses).some((v) => /status not yet verified/i.test(v)), 'ambiguous "Status not yet verified" removed');
  assert.equal(D.statuses['monitor-unverified'], 'Monitor use not verified');
  for (const id of MONITOR_USE_UNVERIFIED) {
    const e = D.entry(id);
    assert.equal(e.status, 'monitor-unverified', `${id} adoption badge`);
    assert.ok(!e.pending && e.sources.length > 0, `${id} sources verified`);
    assert.match(e.caveat, /monitors/, `${id} caveat keeps the monitor-use limit`);
  }
  const ph = D.entry('pholed');
  assert.match(ph.caveat, /does not claim blue PHOLED is in products/);
  const affirmative = (ph.caveat + ' ' + ph.plain).replace('does not claim blue PHOLED is in products', '');
  assert.doesNotMatch(affirmative, /blue (PH)?OLEDs? (are|is) (commercially )?(deployed|in products)/i, 'no affirmative blue-PHOLED deployment claim');
  const used = new Set(D.entries.map((e) => e.status));
  for (const k of Object.keys(D.statuses)) assert.ok(used.has(k), `status ${k} unused`);
  for (const e of D.entries) assert.ok(D.statuses[e.status], `${e.id} status ${e.status} defined`);
});

test('entry ids unique; axes and parents resolve', () => {
  const ids = D.entries.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const e of D.entries) {
    assert.ok(D.axes[e.axis], `${e.id} axis ${e.axis}`);
    assert.ok(e.plain && e.plain.length < 420, `${e.id} plain copy present and concise`);
    assert.ok(e.caveat, `${e.id} caveat`);
    assert.ok(e.overlap, `${e.id} overlap/where-it-sits note`);
  }
});

test('every entry and group appears exactly once in the map tree', () => {
  const seen = [];
  (function walk(n) { seen.push(n.id); (n.children || []).forEach(walk); })({ id: '_', children: D.tree });
  seen.shift();
  for (const id of seen) assert.ok(D.entry(id) || D.groups[id], `tree id unresolved: ${id}`);
  for (const e of D.entries) assert.equal(seen.filter((x) => x === e.id).length, 1, `${e.id} in tree once`);
  for (const g of Object.keys(D.groups)) assert.equal(seen.filter((x) => x === g).length, 1, `${g} in tree once`);
});

test('source registry: unique ids, https links, every cited id exists and every source is cited', () => {
  const sids = D.sources.map((s) => s.id);
  assert.equal(new Set(sids).size, sids.length);
  for (const s of D.sources) {
    assert.match(s.url, /^https:\/\//, s.id);
    assert.ok(s.publisher && s.title && s.type && s.use, `${s.id} metadata`);
  }
  const cited = new Set();
  const cite = (arr, where) => (arr || []).forEach((id) => { assert.ok(sids.includes(id), `${where} cites unknown ${id}`); cited.add(id); });
  for (const e of D.entries) {
    cite(e.sources, e.id);
    for (const [k, t] of Object.entries(e.traits || {})) cite(t.src, `${e.id}.${k}`);
  }
  for (const id of sids) assert.ok(cited.has(id), `source ${id} never cited`);
});

test('every entry is sourced, or explicitly marked background / source-pending (never fake citations)', () => {
  for (const e of D.entries) {
    const flagged = !!e.background || !!e.pending;
    assert.ok(e.sources.length > 0 || flagged, `${e.id} has no sources and no flag`);
    if (e.pending) assert.equal(e.sources.length, 0, `${e.id} pending must not carry citations`);
  }
  for (const e of D.entries.filter((x) => x.pending)) assert.ok(PENDING_OK.includes(e.id), `${e.id} unexpectedly pending`);
  for (const id of PENDING_OK) assert.equal(D.entry(id).pending, true, `${id} must stay visibly source pending`);
});

test('verified additions S19–S23 are exact, sequential bibliography records', () => {
  assert.deepEqual(D.sources.map((s) => s.id), Array.from({ length: D.sources.length }, (_, i) => 'S' + String(i + 1).padStart(2, '0')));
  for (const [id, publisher, title, url] of VERIFIED_ADDITIONS) {
    const s = D.source(id);
    assert.ok(s, `missing ${id}`);
    assert.deepEqual([s.publisher, s.title, s.url], [publisher, title, url], id);
    assert.ok(s.type && s.use && s.caveat, `${id} type/use/caveat`);
  }
  const urls = D.sources.flatMap((s) => [s.url, s.url2].filter(Boolean));
  for (const bad of REJECTED_URLS) assert.ok(!urls.some((u) => u.includes(bad)), `rejected url cited: ${bad}`);
  assert.match(D.source('S02').caveat, /not re-verified/, 'S02 flagged as not re-verified');
});

test('QLED is cited as branding (Samsung + RTINGS) and kept apart from QD-OLED and QD-LED', () => {
  const q = D.entry('qled');
  assert.deepEqual([...q.sources].sort(), ['S19', 'S20']);
  assert.match(q.plain, /marketing term|brand/i);
  assert.match(q.full, /commonly/i, 'construction stated as common, not universal');
  assert.match(q.caveat, /QD-OLED/);
  assert.match(q.caveat, /not a standard/);
  const f = DG.figures[DG.keyFor(q)];
  const cited = f.steps.flatMap((s) => s.src);
  assert.ok(cited.includes('S19') && cited.includes('S20'), 'QLED figure cites S19 and S20');
  assert.ok(!cited.includes('S02'), 'QLED figure no longer leans on unverified S02');
  assert.ok(!/Blue LEDs/.test(DG.render(q)), 'QLED figure does not assert blue LEDs');
  const qd = D.entry('qd-led');
  assert.equal(qd.pending, true);
  assert.equal(qd.status, 'pending');
});

test('MLA OLED and PHOLED are cited, no longer pending, and use static labelled diagrams', () => {
  for (const [id, { src, diagram }] of Object.entries(NEWLY_SOURCED)) {
    const e = D.entry(id);
    assert.ok(!e.pending, `${id} pending flag removed`);
    assert.deepEqual(e.sources, [src], `${id} cites ${src}`);
    assert.equal(DG.keyFor(e), diagram);
    const f = DG.figures[diagram];
    assert.equal(f.animated, false, `${id} diagram static`);
    assert.ok(f.title && f.desc && f.steps.length >= 2, `${id} diagram title/desc/steps`);
    assert.ok(f.steps.some((s) => s.src.includes(src)), `${id} diagram steps cite ${src}`);
    const svg = DG.render(e);
    assert.match(svg, /role="img"/);
    assert.match(svg, new RegExp(`<title id="dg-${diagram}-t">${f.title}</title>`));
    for (const text of [e.plain, e.caveat, ...f.steps.map((s) => s.text)]) assert.ok(!/\d\s*(%|nits?|x\b|times)/i.test(text), `${id}: no numeric performance claim in "${text}"`);
  }
  const mla = D.entry('mla-oled');
  assert.equal(mla.axis, 'optics');
  assert.match(mla.plain, /convex lenses/);
  assert.match(mla.plain, /total reflection/);
  assert.match(mla.overlap, /not a new emitter/);
  assert.match(mla.caveat, /LG/);
  const ph = D.entry('pholed');
  assert.equal(ph.axis, 'chem');
  assert.match(ph.plain, /excitons/);
  assert.match(ph.plain, /not the panel family, colour architecture, drive method or backplane/);
  assert.match(ph.caveat, /UDC states/);
  assert.match(ph.caveat, /blue remains a development focus/);
  assert.match(ph.caveat, /does not claim blue PHOLED is in products/);
});

test('compare entries carry a tendency for every trait', () => {
  assert.ok(D.compareIds.length >= 6);
  for (const id of D.compareIds) {
    const e = D.entry(id);
    for (const k of D.traitKeys) {
      assert.ok(e.traits[k.key], `${id} trait ${k.key}`);
      assert.ok(D.tendencies[e.traits[k.key].t], `${id}.${k.key} tendency`);
    }
  }
});

test('no priority chooser data is exported', () => {
  assert.equal(D.priorities, undefined);
});

test('every entry maps to a diagram; LCD/OLED and key subtypes are animated', () => {
  for (const e of D.entries) {
    const key = DG.keyFor(e);
    assert.ok(DG.figures[key], `${e.id} -> diagram ${key}`);
    const f = DG.figures[key];
    assert.ok(f.title && f.desc, `${key} has accessible title/description`);
  }
  for (const id of ANIMATED_IDS) {
    const f = DG.figures[DG.keyFor(D.entry(id))];
    assert.ok(f.animated, `${id} should be animated`);
  }
  for (const id of PENDING_OK) {
    const f = DG.figures[DG.keyFor(D.entry(id))];
    assert.ok(!f.animated, `${id} is source-pending: static diagram only`);
  }
});

test('SOURCES.md mirrors every source id and url', () => {
  const md = readFileSync(new URL('../SOURCES.md', import.meta.url), 'utf8');
  for (const s of D.sources) {
    assert.ok(md.includes(`| ${s.id} |`), `SOURCES.md lacks ${s.id}`);
    assert.ok(md.includes(s.url), `SOURCES.md lacks url for ${s.id}`);
  }
});

test('SOURCES.md rows match the registry field for field', () => {
  const md = readFileSync(new URL('../SOURCES.md', import.meta.url), 'utf8');
  const esc = (x) => x.replace(/\|/g, '\\|');
  for (const s of D.sources) {
    const row = md.split('\n').find((l) => l.startsWith(`| ${s.id} |`));
    const url = s.url2 ? `${s.url} and ${s.url2}` : s.url;
    const want = `| ${s.id} | ${esc(s.publisher)} | ${esc(s.title)} | ${esc(s.type)} | ${url} | ${esc(s.use)} ${esc(s.caveat)} |`;
    assert.ok(row && row.startsWith(want), `SOURCES.md row ${s.id} differs from js/data.js`);
    const citedBy = row.slice(want.length).replace(/\|\s*$/, '').trim().split(', ').sort();
    assert.deepEqual(citedBy, D.entries.filter((e) => e.sources.includes(s.id)).map((e) => e.name).sort(), `SOURCES.md "Cited by" for ${s.id}`);
  }
});

test('README and SOURCES.md state current coverage and remaining gaps honestly', () => {
  const md = readFileSync(new URL('../SOURCES.md', import.meta.url), 'utf8');
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  for (const doc of [md, readme]) {
    assert.doesNotMatch(doc, /\/tmp\//, 'no /tmp paths');
    assert.doesNotMatch(doc, /no new (web )?research/i);
    assert.doesNotMatch(doc, /when the research matrix arrives/i);
    assert.match(doc, /S01–S23/);
    assert.doesNotMatch(doc, /S01–S22\b/);
    for (const id of PENDING_OK) assert.ok(doc.includes(D.entry(id).name), `${id} listed as a gap`);
    assert.ok(doc.includes(PENDING_GROUP.name), 'names the neutral pending branch');
    assert.match(doc, /Monitor use not verified/);
    assert.doesNotMatch(doc, /electroluminescent quantum dots|its place on the map|Samsung term/i, 'no stale pending claims');
    assert.match(doc, /not fully sourced/);
  }
  const gaps = md.slice(md.indexOf('## Source gaps'), md.indexOf('Resolved in'));
  for (const id of PENDING_OK) {
    const e = D.entry(id);
    assert.ok(gaps.includes(`**${e.name}** (${e.full}):`), `SOURCES.md pending list has ${id} with its exact expansion`);
  }
  assert.equal((gaps.match(/^- \*\*/gm) || []).length, PENDING_OK.length, 'pending list matches the data exactly');
  for (const id of Object.keys(NEWLY_SOURCED)) assert.ok(!gaps.includes(`**${D.entry(id).name}**`), `${id} not listed as still pending`);
});

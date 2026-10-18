// Browser tests: serve the static site locally and drive it with Playwright.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { startServer } from './server.mjs';
import { LEGACY_NAMES, REQUESTED, ANIMATED_IDS, PENDING_OK, PENDING_GROUP, PENDING_CONTENT, PENDING_FORBIDDEN, MONITOR_USE_UNVERIFIED, NEWLY_SOURCED } from './fixtures.mjs';

const require = createRequire(import.meta.url);
const D = require('../js/data.js');
let server, browser, base;

before(async () => {
  server = await startServer();
  base = `http://127.0.0.1:${server.address().port}/`;
  browser = await chromium.launch();
});
after(async () => { await browser?.close(); await new Promise((r) => server.close(r)); });

async function open(opts = {}) {
  const context = await browser.newContext({ viewport: opts.viewport || { width: 1280, height: 900 }, reducedMotion: opts.reducedMotion || 'no-preference', hasTouch: !!opts.touch });
  const page = await context.newPage();
  const errors = [], external = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.route('**/*', (route) => {
    const u = route.request().url();
    if (u.startsWith(base)) return route.continue();
    external.push(u); return route.abort();
  });
  await page.goto(base);
  await page.waitForSelector('html.js-ready');
  return { page, context, errors, external };
}
const pressed = (page) => page.$$eval('#map .node[aria-pressed="true"]', (els) => els.map((e) => e.dataset.id));
const title = (page) => page.textContent('#detail-title');

async function search(page, q) {
  await page.fill('#q', q);
  return page.$$eval('#results .result', (els) => els.map((e) => ({ id: e.dataset.id, name: e.querySelector('.r-name').textContent })));
}
async function pick(page, name) {
  const hits = await search(page, name);
  const hit = hits.find((h) => h.name === name);
  assert.ok(hit, `no exact result for ${name}: ${hits.map((h) => h.name).join(', ')}`);
  await page.click(`#results .result[data-id="${hit.id}"]`);
  return hit.id;
}

test('loads cleanly with local assets only, compact header, overlap note and no priority section', async () => {
  const { page, context, errors, external } = await open();
  assert.match(await page.title(), /Display Tech Explorer/);
  assert.equal(await page.locator('h1').count(), 1);
  const note = page.locator('#map .overlap-note');
  assert.ok(await note.isVisible());
  assert.match(await note.textContent(), /overlapping dimensions/i);
  assert.match(await note.textContent(), /not a mutually exclusive/i);
  const body = await page.textContent('body');
  assert.doesNotMatch(body, /what matters most/i);
  assert.equal(await page.locator('#priorities, [data-section="priorities"], .priority').count(), 0);
  // Section order: explorer (map + detail) then compare then sources.
  const order = await page.$$eval('main > section', (s) => s.map((x) => x.id));
  assert.deepEqual(order, ['explorer', 'compare', 'sources']);
  assert.equal(await page.locator('#detail #q').count(), 1, 'search lives in the right panel');
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  const assets = await page.$$eval('script[src], link[href]', (els) => els.map((e) => e.getAttribute('src') || e.getAttribute('href')));
  for (const a of assets) assert.doesNotMatch(a, /^(https?:)?\/\//, `asset must be relative: ${a}`);
  await context.close();
});

test('defaults to LCD selected with populated detail panel and LCD diagram', async () => {
  const { page, context } = await open();
  assert.deepEqual(await pressed(page), ['lcd']);
  assert.equal((await title(page)).trim(), 'LCD');
  assert.match(await page.textContent('#entry'), /backlight/i);
  assert.equal(await page.getAttribute('#entry figure.dg', 'data-diagram'), 'lcd-stack');
  // Desktop layout: map left of the detail panel.
  const m = await page.locator('#map').boundingBox(), dbox = await page.locator('#detail').boundingBox();
  assert.ok(m.x + m.width <= dbox.x + 1, 'map is left of detail');
  await context.close();
});

test('selecting map rows (family, group, subtype) updates highlight and panel', async () => {
  const { page, context, errors } = await open();
  await page.click('#map .node[data-id="oled"]');
  assert.deepEqual(await pressed(page), ['oled']);
  assert.equal((await title(page)).trim(), 'OLED');
  assert.equal(await page.getAttribute('#entry figure.dg', 'data-diagram'), 'oled-emit');
  // Expand OLED colour group and pick QD-OLED.
  await page.click('#map .node[data-id="g-oled-color"]');
  assert.match(await title(page), /Colour architecture/);
  assert.ok((await page.locator('#entry .members .chip').count()) >= 3, 'group lists its member names');
  await page.click('#map .node[data-id="qd-oled"]');
  assert.deepEqual(await pressed(page), ['qd-oled']);
  assert.equal(await page.getAttribute('#entry figure.dg', 'data-diagram'), 'qd-oled');
  // Path breadcrumb shows where it sits.
  assert.match(await page.textContent('#entry .where'), /OLED/);
  // Twisty collapses/expands with aria-expanded.
  const tw = page.locator('#map .twisty[aria-controls="sub-g-oled-color"]');
  assert.equal(await tw.getAttribute('aria-expanded'), 'true');
  await tw.click();
  assert.equal(await tw.getAttribute('aria-expanded'), 'false');
  assert.ok(!(await page.locator('#sub-g-oled-color').isVisible()));
  assert.deepEqual(errors, []);
  await context.close();
});

test('every requested exact name is searchable and selecting it syncs map + panel', async () => {
  const { page, context, errors } = await open();
  for (const [name, expansion] of REQUESTED) {
    const id = await pick(page, name);
    assert.equal((await title(page)).trim(), name);
    assert.deepEqual(await pressed(page), [id]);
    assert.ok(await page.locator(`#map .node[data-id="${id}"]`).isVisible(), `${name} row visible (ancestors expanded)`);
    const full = (await page.textContent('#entry .full')).toLowerCase().replace(/-/g, ' ');
    assert.ok(full.includes(expansion.toLowerCase().replace(/-/g, ' ')), `${name} shows expansion`);
    assert.ok(await page.locator('#entry .caveat').isVisible());
    assert.ok(await page.locator('#entry .overlap').isVisible());
    assert.equal(await page.locator('#entry figure.dg svg[role="img"]').count(), 1, `${name} has a diagram`);
  }
  assert.deepEqual(errors, []);
  await context.close();
});

test('all 39 legacy names remain findable; result count reflects matches', async () => {
  const { page, context } = await open();
  await page.fill('#q', '');
  assert.match(await page.textContent('#count'), new RegExp(`${D.entries.length} names`));
  for (const n of LEGACY_NAMES) {
    await page.fill('#q', n);
    const names = await page.$$eval('#results .result', (els) => els.map((e) => e.textContent));
    assert.ok(names.length >= 1, `no results for legacy ${n}`);
    assert.match(await page.textContent('#count'), /\d+ (name|names)/);
  }
  await page.fill('#q', 'zzzz-nothing');
  assert.match(await page.textContent('#count'), /No names match/i);
  await context.close();
});

test('empty search shows only the count; typing lists results that select, clearing hides them again', async () => {
  const { page, context, errors } = await open();
  const rows = () => page.locator('#results .result').count();
  assert.equal(await rows(), 0, 'no result rows on load');
  assert.ok(!(await page.locator('#results').isVisible()), 'empty results list is hidden');
  assert.match(await page.textContent('#count'), new RegExp(`${D.entries.length} names in the guide`));
  await page.fill('#q', 'ips');
  assert.ok((await rows()) >= 1, 'typing shows results');
  await page.click('#results .result[data-id="ips"]');
  assert.deepEqual(await pressed(page), ['ips']);
  assert.equal((await title(page)).trim(), 'IPS LCD');
  assert.equal(await page.getAttribute('#results .result[data-id="ips"]', 'aria-current'), 'true');
  await page.fill('#q', '   ');
  assert.equal(await rows(), 0, 'whitespace-only query shows no rows');
  await page.fill('#q', '');
  assert.equal(await rows(), 0, 'clearing the field clears the results');
  assert.match(await page.textContent('#count'), new RegExp(`${D.entries.length} names`));
  assert.deepEqual(await pressed(page), ['ips'], 'clearing search keeps the selection');
  await page.fill('#q', 'oled');
  assert.ok((await rows()) >= 1);
  await page.press('#q', 'Escape');
  assert.equal(await page.inputValue('#q'), '');
  assert.equal(await rows(), 0, 'Escape clears the results');
  assert.deepEqual(errors, []);
  await context.close();
});

test('detail panel puts the diagram right after summary/where-it-sits, above the caveat; extras collapsed', async () => {
  const { page, context } = await open();
  const order = await page.$$eval('#entry > *', (els) => els.map((e) => e.matches('figure.dg') ? 'figure' : e.querySelector('.overlap') ? 'overlap'
    : e.querySelector('.caveat') ? 'caveat' : e.matches('details.extra') ? 'extra' : e.matches('.plain') ? 'plain' : null).filter(Boolean));
  assert.deepEqual(order, ['plain', 'overlap', 'figure', 'caveat', 'extra']);
  // The LCD animation starts inside the initial 1280x900 viewport.
  const fig = await page.locator('#entry figure.dg').boundingBox();
  assert.ok(fig.y + 120 < 900, `diagram visible early (top at ${Math.round(fig.y)})`);
  assert.ok(await page.locator('#entry figure.dg svg').isVisible());
  assert.ok(await page.locator('#entry .caveat').isVisible(), 'caveat stays visible');
  // Nonessential copy lives in one collapsed <details>.
  assert.equal(await page.locator('#entry details').count(), 1);
  const extra = page.locator('#entry details.extra');
  assert.equal(await extra.evaluate((d) => d.open), false);
  assert.ok(!(await extra.locator('.more').isVisible()) && !(await extra.locator('.aka').isVisible()));
  await extra.locator('summary').click();
  assert.ok(await extra.locator('.more').isVisible());
  assert.match(await extra.locator('.aka').textContent(), /LED monitor/);
  // Same order for a group and an OLED entry.
  await page.click('#map .node[data-id="oled"]');
  assert.ok((await page.locator('#entry figure.dg').boundingBox()).y + 120 < 900, 'OLED diagram visible early');
  assert.equal(await page.locator('#entry .overlap + figure.dg, #entry .facts:has(.overlap) + figure.dg').count(), 1);
  await context.close();
});

test('QLED panel stays branding-only; QD-LED panel is name + expansion + pending notice only', async () => {
  const { page, context, errors } = await open();
  await pick(page, 'QLED');
  const q = await page.textContent('#entry');
  assert.match(q, /Not QD-OLED/);
  assert.match(q, /QD-LED, which has the same requested expansion, is a separate entry here and is still source pending/);
  assert.doesNotMatch(q, /quantum dots themselves|would emit/);
  assert.match(await page.textContent('#entry .plain'), /marketing term/);
  for (const sid of ['S19', 'S20']) assert.equal(await page.locator(`#entry .src-list a.cite[href="#src-${sid}"]`).count(), 1, `QLED lists ${sid}`);
  assert.match(await page.textContent('#entry .where'), /LCD/);
  for (const [id, want] of Object.entries(PENDING_CONTENT)) {
    await pick(page, want.name);
    assert.equal((await title(page)).trim(), want.name);
    assert.equal((await page.textContent('#entry .full')).trim(), want.full, `${id} shows exact expansion only`);
    assert.equal((await page.textContent('#entry .where')).replace(/\s+/g, ' ').trim(), `Where it sits: ${PENDING_GROUP.name} › ${want.name}`);
    assert.match(await page.textContent('#entry .plain'), /^Source pending\./);
    assert.match(await page.textContent('#entry .src-list'), /Source pending\./);
    assert.equal(await page.locator('#entry .badge-status').count(), 0, `${id}: no adoption badge`);
    assert.equal(await page.locator('#entry .badge-pending').count(), 1);
    assert.equal(await page.getAttribute('#entry figure.dg', 'data-diagram'), 'pending');
    assert.match(await page.textContent('#entry figcaption'), /static labelled card/);
    const labels = await page.$$eval('#entry figure.dg svg text', (t) => t.map((x) => x.textContent));
    for (const l of [want.name, want.full, 'not assigned']) assert.ok(labels.includes(l), `${id} card label ${l}`);
    const body = await page.$eval('#entry', (el) => { const c = el.cloneNode(true); c.querySelector('.related')?.remove(); return c.textContent; });
    assert.doesNotMatch(body, PENDING_FORBIDDEN[id], `${id}: no unsupported claim on the panel`);
    assert.equal(await page.locator('#entry a.cite').count(), 0, `${id}: no citations`);
    assert.ok(await page.locator(`#map .node[data-id="${id}"]`).isVisible());
    assert.equal(await page.$eval(`#map .node[data-id="${id}"]`, (n) => n.closest('ul.sub').id), `sub-${PENDING_GROUP.id}`);
  }
  // The pending group itself asserts no family or axis.
  await page.click(`#map .node[data-id="${PENDING_GROUP.id}"]`);
  assert.equal((await title(page)).trim(), PENDING_GROUP.name);
  assert.match(await page.textContent('#entry .full'), /No axis assigned/);
  assert.equal(await page.getAttribute('#entry figure.dg', 'data-diagram'), 'pending');
  assert.deepEqual(await page.$$eval('#entry .members .chip', (c) => c.map((x) => x.dataset.id).sort()), [...PENDING_OK].sort());
  // Other figures no longer place the pending names.
  for (const n of ['OLED', 'AMOLED', 'Micro-LED', 'E-paper']) {
    await pick(page, n);
    const svgText = await page.textContent('#entry figure.dg');
    for (const id of PENDING_OK) assert.ok(!svgText.includes(D.entry(id).name), `${n} figure mentions ${id}`);
  }
  await page.click('#map .node[data-id="g-self"]');
  assert.ok(!(await page.textContent('#entry .members')).includes('QD-LED'), 'QD-LED not under Other self-lit');
  assert.deepEqual(errors, []);
  await context.close();
});

test('S23 is cited on the OLED and WOLED panels and in the bibliography', async () => {
  const { page, context, errors } = await open();
  for (const name of ['OLED', 'WOLED']) {
    await pick(page, name);
    assert.equal(await page.locator('#entry .src-list a.cite[href="#src-S23"]').count(), 1, `${name} lists S23`);
    assert.ok(await page.locator('#entry .dg-steps a.cite[href="#src-S23"]').count() >= 1, `${name} diagram step cites S23`);
  }
  for (const name of ['QD-OLED', 'Direct RGB OLED', 'MLA OLED', 'PHOLED']) {
    await pick(page, name);
    assert.equal(await page.locator('#entry .src-list a.cite[href="#src-S23"]').count(), 0, `${name} does not list S23`);
  }
  await pick(page, 'OLED');
  await page.click('#entry .src-list a.cite[href="#src-S23"]');
  assert.equal(await page.locator('#src-S23 details').evaluate((d) => d.open), true);
  assert.match(await page.textContent('#src-S23 summary'), /Universal Display Corporation.*Organic Light Emitting Diodes \(OLEDs\)/);
  assert.equal(await page.getAttribute('#src-S23 a.ext', 'href'), 'https://oled.com/oleds/');
  assert.equal((await page.textContent('#src-S23 .b-cited')).trim(), 'Cited for: OLED, WOLED');
  assert.deepEqual(errors, []);
  await context.close();
});

test('MLA OLED and PHOLED show "Monitor use not verified", separate from source state', async () => {
  const { page, context, errors } = await open();
  assert.doesNotMatch(await page.textContent('body'), /Status not yet verified/);
  for (const id of MONITOR_USE_UNVERIFIED) {
    await pick(page, D.entry(id).name);
    assert.equal((await page.textContent('#entry .badge-status')).trim(), 'Availability: Monitor use not verified');
    assert.equal(await page.locator('#entry .badge-pending').count(), 0, `${id} not marked source pending`);
    assert.ok(await page.locator('#entry .src-list a.ext').count() >= 1, `${id} lists its verified source`);
    assert.match(await page.textContent('#entry .caveat'), /monitors/);
  }
  assert.match(await page.textContent('#entry .caveat'), /does not claim blue PHOLED is in products/);
  assert.deepEqual(errors, []);
  await context.close();
});

test('desktop 1280x900: selected MLA and PHOLED diagrams are fully visible at the initial scroll position, no inner scroll', async () => {
  const { page, context, errors } = await open();
  const geo = () => page.evaluate(() => {
    const d = document.getElementById('detail'), cs = getComputedStyle(d);
    const box = (sel) => { const r = document.querySelector(sel).getBoundingClientRect(); return { top: r.top, bottom: r.bottom, height: r.height, width: r.width }; };
    return { scrollY: window.scrollY, vh: window.innerHeight, overflowY: cs.overflowY, maxHeight: cs.maxHeight, inner: d.scrollHeight - d.clientHeight,
      cap: box('#entry figure.dg figcaption'), svg: box('#entry figure.dg svg'), pageH: document.documentElement.scrollHeight };
  });
  // Select MLA OLED from the map, the way a reader would.
  await page.click('#map .node[data-id="g-oled-extra"]');
  await page.click('#map .node[data-id="mla-oled"]');
  await page.evaluate(() => window.scrollTo(0, 0));
  for (const id of ['mla-oled', 'pholed']) {
    if (id === 'pholed') { await page.click('#map .node[data-id="pholed"]'); await page.evaluate(() => window.scrollTo(0, 0)); }
    assert.equal(await page.getAttribute('#entry figure.dg', 'data-diagram'), NEWLY_SOURCED[id].diagram);
    const g = await geo();
    assert.equal(g.scrollY, 0);
    assert.ok(!/auto|scroll/.test(g.overflowY) && g.maxHeight === 'none', `${id}: detail is not a fixed-height scroller (${g.overflowY}, ${g.maxHeight})`);
    assert.ok(g.inner <= 1, `${id}: no hidden inner-scroll content (${g.inner}px)`);
    assert.ok(g.cap.top >= 0, `${id}: caption on screen`);
    assert.ok(g.svg.top >= 0 && g.svg.bottom <= g.vh, `${id}: whole diagram on screen (svg ${Math.round(g.svg.top)}–${Math.round(g.svg.bottom)} of ${g.vh})`);
    assert.ok(g.svg.height >= 200 && g.svg.width >= 600, `${id}: diagram not shrunk (${Math.round(g.svg.width)}x${Math.round(g.svg.height)})`);
    assert.ok(g.pageH < 5000, `${id}: sensible page length (${g.pageH}px)`);
    // The figure's labels are really painted there: hit-test the SVG centre.
    const hit = await page.evaluate(() => { const r = document.querySelector('#entry figure.dg svg').getBoundingClientRect();
      const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!el && !!el.closest('#entry figure.dg'); });
    assert.ok(hit, `${id}: diagram not covered or clipped`);
  }
  // Two columns preserved; map is the pinned column.
  const m = await page.locator('#map').boundingBox(), dbox = await page.locator('#detail').boundingBox();
  assert.ok(m.x + m.width <= dbox.x + 1, 'map left of detail');
  assert.equal(await page.$eval('#map', (el) => getComputedStyle(el).position), 'sticky');
  // Picking a map row after scrolling down brings the detail panel's top back into view.
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.click('#map .node[data-id="tandem"]');
  const top = await page.$eval('#detail', (el) => el.getBoundingClientRect().top);
  assert.ok(top >= -1 && top < 50, `detail top in view after map pick (${Math.round(top)})`);
  assert.equal((await title(page)).trim(), 'Tandem / stacked OLED');
  assert.deepEqual(errors, []);
  await context.close();
});

test('panel shows source links, badges and clickable related names', async () => {
  const { page, context } = await open();
  await page.click('#map .node[data-id="lcd"]');
  const cites = await page.$$eval('#entry a.cite', (a) => a.map((x) => x.getAttribute('href')));
  assert.ok(cites.includes('#src-S01'));
  for (const h of cites) assert.equal(await page.locator(h).count(), 1, `anchor ${h}`);
  const srcLinks = await page.$$eval('#entry .src-list a.ext', (a) => a.map((x) => [x.href, x.target, x.rel]));
  assert.ok(srcLinks.length >= 1);
  for (const [href, target, rel] of srcLinks) { assert.match(href, /^https:/); assert.equal(target, '_blank'); assert.match(rel, /noopener/); }
  // Related names navigate.
  const rel = page.locator('#entry .related .chip[data-id="tft-lcd"]');
  await rel.click();
  assert.equal((await title(page)).trim(), 'TFT LCD');
  // Pending + background badges.
  await pick(page, 'S-AMOLED');
  assert.match(await page.textContent('#entry .badges'), /Source pending/);
  assert.equal(await page.locator('#entry .badge-status').count(), 0, 'pending entry has no adoption badge');
  assert.equal(await page.locator('#entry a.cite').count(), 0, 'pending entry carries no citations');
  await pick(page, 'QD-LED');
  assert.match(await page.textContent('#entry .badges'), /Source pending/);
  assert.equal(await page.locator('#entry .src-list a.cite').count(), 0, 'pending entry lists no sources');
  // Newly sourced entries: no pending badge, cite their verified source.
  for (const [id, { src }] of Object.entries(NEWLY_SOURCED)) {
    await pick(page, D.entry(id).name);
    assert.doesNotMatch(await page.textContent('#entry .badges'), /Source pending/, `${id} badge removed`);
    assert.equal(await page.locator(`#entry .src-list a.cite[href="#src-${src}"]`).count(), 1, `${id} lists ${src}`);
  }
  await pick(page, 'CRT');
  assert.match(await page.textContent('#entry .badges'), /General background/);
  await context.close();
});

test('animated diagrams for LCD/OLED subtypes; static figures for source-pending names', async () => {
  const { page, context } = await open();
  for (const id of ANIMATED_IDS) {
    const name = D.entry(id).name;
    await pick(page, name);
    const fig = page.locator('#entry figure.dg');
    assert.equal(await fig.getAttribute('data-animated'), 'true', `${id} animated`);
    assert.ok(await fig.locator('svg title').count() && await fig.locator('svg desc').count(), `${id} svg title/desc`);
    assert.equal(await fig.locator('.dg-toggle').count(), 1, `${id} pause control`);
    assert.ok((await fig.locator('.dg-steps li').count()) >= 2, `${id} static step text`);
    const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
    assert.ok(running > 0, `${id} has running animations`);
  }
  for (const id of PENDING_OK) {
    await pick(page, D.entry(id).name);
    const fig = page.locator('#entry figure.dg');
    assert.equal(await fig.getAttribute('data-animated'), 'false');
    assert.equal(await fig.locator('.dg-toggle').count(), 0);
  }
  await context.close();
});

test('MLA OLED shows an accessible, static, cited microlens diagram', async () => {
  const { page, context, errors } = await open();
  await pick(page, 'MLA OLED');
  const fig = page.locator('#entry figure.dg');
  assert.equal(await fig.getAttribute('data-diagram'), 'mla');
  assert.equal(await fig.getAttribute('data-animated'), 'false');
  assert.equal(await fig.locator('.dg-toggle').count(), 0, 'no pause control on a static figure');
  assert.match(await fig.locator('figcaption').textContent(), /static schematic/);
  const a11y = await fig.locator('svg').evaluate((svg) => ({
    role: svg.getAttribute('role'),
    names: svg.getAttribute('aria-labelledby').split(' ').map((id) => document.getElementById(id)?.textContent || ''),
    labels: [...svg.querySelectorAll('text')].map((t) => t.textContent)
  }));
  assert.equal(a11y.role, 'img');
  assert.match(a11y.names[0], /MLA OLED/);
  assert.match(a11y.names[1], /convex microlenses/);
  for (const l of ['Without lenses', 'With micro lens array', 'Convex microlenses', 'OLED emitter']) assert.ok(a11y.labels.includes(l), `label ${l}`);
  assert.ok((await fig.locator('.dg-steps li').count()) >= 2, 'facts listed as text');
  assert.ok(await fig.locator('.dg-steps a.cite[href="#src-S21"]').count() >= 1, 'steps cite S21');
  const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
  assert.equal(running, 0, 'MLA figure has no motion');
  await page.click('#entry .src-list a.cite[href="#src-S21"]');
  assert.equal(await page.locator('#src-S21 details').evaluate((d) => d.open), true, 'visible bibliography entry opens');
  assert.match(await page.textContent('#src-S21 summary'), /LG Display Newsroom/);
  assert.deepEqual(errors, []);
  await context.close();
});

test('pause/play control stops and resumes motion', async () => {
  const { page, context } = await open();
  const btn = page.locator('#entry .dg-toggle');
  assert.equal(await btn.getAttribute('aria-pressed'), 'false');
  assert.match(await btn.textContent(), /Pause/);
  await btn.click();
  assert.equal(await btn.getAttribute('aria-pressed'), 'true');
  assert.match(await btn.textContent(), /Play/);
  const states = await page.evaluate(() => document.getAnimations().map((a) => a.playState));
  assert.ok(states.length > 0 && states.every((s) => s === 'paused'), `all paused: ${states}`);
  // Preference persists across selections.
  await page.click('#map .node[data-id="oled"]');
  assert.match(await page.textContent('#entry .dg-toggle'), /Play/);
  await page.click('#entry .dg-toggle');
  const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
  assert.ok(running > 0);
  await context.close();
});

test('reduced-motion preference starts diagrams paused, with play available', async () => {
  const { page, context } = await open({ reducedMotion: 'reduce' });
  const btn = page.locator('#entry .dg-toggle');
  assert.match(await btn.textContent(), /Play/);
  const states = await page.evaluate(() => document.getAnimations().map((a) => a.playState));
  assert.ok(states.every((s) => s === 'paused'), `paused under reduced motion: ${states}`);
  assert.ok(await page.locator('#entry .dg-steps').isVisible(), 'facts remain visible as text');
  await btn.click();
  const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
  assert.ok(running > 0, 'user can opt in to motion');
  await context.close();
});

test('keyboard: arrow keys move through map rows, Enter selects; search results are keyboard reachable', async () => {
  const { page, context } = await open();
  await page.focus('#map .node[data-id="lcd"]');
  await page.keyboard.press('ArrowDown');
  const next = await page.evaluate(() => document.activeElement.dataset.id);
  assert.equal(next, 'g-lcd-drive');
  await page.keyboard.press('Enter');
  assert.deepEqual(await pressed(page), ['g-lcd-drive']);
  await page.keyboard.press('End');
  const last = await page.evaluate(() => document.activeElement.dataset.id);
  assert.equal(last, PENDING_GROUP.id);
  await page.keyboard.press('Home');
  assert.equal(await page.evaluate(() => document.activeElement.dataset.id), 'lcd');
  // Search: type, ArrowDown into results, Enter.
  await page.focus('#q');
  await page.keyboard.type('Mini-LED');
  await page.keyboard.press('ArrowDown');
  assert.equal(await page.evaluate(() => document.activeElement.classList.contains('result')), true);
  await page.keyboard.press('Enter');
  assert.equal((await title(page)).trim(), 'Mini-LED');
  // Focus is visible on buttons.
  await page.focus('#map .node[data-id="oled"]');
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
  assert.notEqual(outline, 'none');
  await context.close();
});

test('compare: selections, swap, cross-dimension and same-dimension notes', async () => {
  const { page, context, errors } = await open();
  const opts = await page.$$eval('#cmp-a option', (o) => o.map((x) => x.value));
  assert.deepEqual(opts.sort(), [...D.compareIds].sort());
  await page.selectOption('#cmp-a', 'ips');
  await page.selectOption('#cmp-b', 'mini-led');
  assert.match(await page.textContent('#cmp-note'), /different questions/i);
  assert.match(await page.textContent('#cmp-note'), /same monitor|combine/i);
  assert.equal(await page.locator('#cmp-table tbody tr').count(), D.traitKeys.length);
  assert.match(await page.textContent('#cmp-table thead'), /IPS-type LCD/);
  await page.click('#cmp-swap');
  assert.equal(await page.inputValue('#cmp-a'), 'mini-led');
  assert.equal(await page.inputValue('#cmp-b'), 'ips');
  await page.selectOption('#cmp-a', 'woled');
  await page.selectOption('#cmp-b', 'qd-oled');
  assert.match(await page.textContent('#cmp-note'), /same question/i);
  await page.selectOption('#cmp-a', 'micro-led');
  assert.match(await page.textContent('#cmp-table'), /Not enough to say/);
  assert.ok(await page.locator('#cmp-table a.cite').count() > 0, 'comparison cells cite sources');
  await page.selectOption('#cmp-a', 'ips');
  await page.selectOption('#cmp-b', 'woled');
  assert.match(await page.textContent('#cmp-note'), /alternatives/i);
  // Compare names open in the explorer.
  await page.click('#cmp-table thead .open-entry[data-id="woled"]');
  assert.equal((await title(page)).trim(), 'WOLED');
  assert.match(await page.textContent('#compare'), /no product-level claim|not measurements/i);
  assert.deepEqual(errors, []);
  await context.close();
});

test('bibliography lists every source with safe external links and all cites resolve', async () => {
  const { page, context } = await open();
  const items = await page.$$eval('#biblio > li', (l) => l.map((x) => x.id));
  assert.deepEqual(items, D.sources.map((s) => `src-${s.id}`));
  const links = await page.$$eval('#biblio a.ext', (a) => a.map((x) => [x.href, x.target, x.rel]));
  assert.ok(links.length >= D.sources.length);
  for (const [href, target, rel] of links) { assert.match(href, /^https:\/\//); assert.equal(target, '_blank'); assert.match(rel, /noopener/); assert.match(rel, /noreferrer/); }
  const all = await page.$$eval('a.cite', (a) => a.map((x) => x.getAttribute('href')));
  for (const h of new Set(all)) assert.equal(await page.locator(h).count(), 1, `cite ${h}`);
  assert.match(await page.textContent('#sources'), /Source pending/);
  await context.close();
});

test('source rows are collapsed <details> with ID, publisher and title, and expand to use/caveat and link', async () => {
  const { page, context } = await open();
  const rows = page.locator('#biblio > li');
  assert.equal(await rows.count(), D.sources.length);
  for (const s of D.sources) {
    const li = page.locator(`#src-${s.id}`);
    assert.equal(await li.locator('details').evaluate((d) => d.open), false, `${s.id} collapsed by default`);
    const sum = await li.locator('summary').textContent();
    for (const part of [s.id, s.publisher, s.title]) assert.ok(sum.includes(part), `${s.id} summary shows ${part}`);
    assert.ok(!(await li.locator('a.ext').first().isVisible()), `${s.id} link hidden while collapsed`);
  }
  const s = D.sources[0], li = page.locator(`#src-${s.id}`);
  await li.locator('summary').click();
  assert.equal(await li.locator('details').evaluate((d) => d.open), true);
  const body = await li.locator('.b-body').textContent();
  assert.ok(body.includes(s.use) && body.includes(s.caveat), 'expanded row shows use and caveat');
  const link = li.locator('a.ext').first();
  assert.ok(await link.isVisible());
  assert.equal(await link.getAttribute('href'), s.url);
  assert.equal(await link.getAttribute('target'), '_blank');
  assert.match(await link.getAttribute('rel'), /noopener noreferrer/);
  // Following an inline citation opens the matching (collapsed) row.
  await li.locator('summary').click();
  assert.equal(await page.locator('#src-S01 details').evaluate((d) => d.open), false);
  await page.click('#entry a.cite[href="#src-S01"]');
  assert.equal(await page.locator('#src-S01 details').evaluate((d) => d.open), true);
  assert.ok(await page.locator('#src-S01 a.ext').first().isVisible());
  // Status lists stay visible.
  assert.ok(await page.locator('#gaps').isVisible());
  assert.match(await page.textContent('#gaps'), /Source pending:/);
  assert.match(await page.textContent('#gaps'), /General background/);
  const pendingLine = await page.textContent('#gaps p:first-child');
  assert.ok(pendingLine.includes(PENDING_GROUP.name), 'gaps names the neutral pending group');
  assert.match(pendingLine, /not fully sourced/);
  for (const id of PENDING_OK) assert.ok(pendingLine.includes(D.entry(id).name), `gaps lists ${id}`);
  for (const id of Object.keys(NEWLY_SOURCED)) assert.ok(!pendingLine.includes(D.entry(id).name), `gaps no longer lists ${id}`);
  await context.close();
});

test('390px phone: stacked layout, no horizontal overflow, details easy to reach, touch works', async () => {
  const { page, context, errors } = await open({ viewport: { width: 390, height: 844 }, touch: true });
  const check = async (label) => {
    const o = await page.evaluate(() => {
      const w = document.documentElement.clientWidth;
      const bad = [...document.querySelectorAll('body *')].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.right > w + 1 || r.left < -1) && !el.closest('.cmp-scroll, #results');
      }).map((el) => el.tagName + '.' + el.className);
      return { sw: document.documentElement.scrollWidth, w, bad: bad.slice(0, 5) };
    });
    assert.ok(o.sw <= o.w, `${label}: scrollWidth ${o.sw} > ${o.w}`);
    assert.deepEqual(o.bad, [], `${label}: elements outside viewport`);
  };
  await check('default');
  const m = await page.locator('#map').boundingBox(), dbox = await page.locator('#detail').boundingBox();
  assert.ok(dbox.y >= m.y + m.height - 1, 'detail stacked below map');
  assert.ok(await page.locator('#map .to-detail').isVisible(), 'jump-to-detail link visible on phone');
  await page.tap('#map .node[data-id="oled"]');
  assert.deepEqual(await pressed(page), ['oled']);
  for (const n of ['QD-OLED', 'Mini-LED', 'QD-LED', 'S-AMOLED', 'MLA OLED', 'PHOLED', 'QLED', 'S-IPS · H-IPS · e-IPS · AH-IPS', 'DLP / LCoS / 3LCD']) { await pick(page, n); await check(n); }
  await page.selectOption('#cmp-a', 'micro-led');
  await check('compare');
  assert.deepEqual(errors, []);
  await context.close();
});

test('controls meet 44px touch targets and diagram labels stay inside their SVG at 390px', async () => {
  const { page, context } = await open({ viewport: { width: 390, height: 844 }, touch: true });
  const small = async () => page.$$eval('#explorer button, #explorer input, #explorer a, #compare button, #compare select, #sources a.ext, .site-head nav a', (els) => els
    .filter((el) => el.offsetParent !== null && !el.classList.contains('cite'))
    .map((el) => [el.className || el.tagName, el.getBoundingClientRect()])
    .filter(([, r]) => r.height < 43.5 || r.width < 43.5)
    .map(([c, r]) => `${c} ${Math.round(r.width)}x${Math.round(r.height)}`));
  assert.deepEqual(await small(), []);
  for (const n of ['LCD', 'QD-OLED', 'WOLED', 'QD-LED', 'S-AMOLED', 'PHOLED', 'MLA OLED', 'QLED', 'Mini-LED', 'TFT', 'E-paper', 'RGWB', 'Micro-LED']) {
    await pick(page, n);
    const out = await page.$eval('#entry figure.dg svg', (svg) => {
      const vb = svg.viewBox.baseVal;
      return [...svg.querySelectorAll('text')].map((t) => [t.textContent, t.getBBox()])
        .filter(([, b]) => b.x < vb.x - 0.5 || b.y < vb.y - 0.5 || b.x + b.width > vb.x + vb.width + 0.5 || b.y + b.height > vb.y + vb.height + 0.5)
        .map(([s]) => s);
    });
    assert.deepEqual(out, [], `${n}: SVG labels clipped`);
  }
  assert.deepEqual(await small(), []);
  await context.close();
});

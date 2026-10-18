/* Display Tech Explorer: UI. Name map (left), detail panel with search (right),
 * compare table and bibliography. Vanilla JS, no dependencies.
 */
(function () {
  'use strict';
  var D = window.DTE, DG = window.DTE_DIAGRAMS;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function norm(s) { return String(s).toLowerCase().replace(/[-‐–]/g, ' ').replace(/\s+/g, ' ').trim(); }

  /* ---------- Tree index: parents, items ---------- */
  var parent = {}, childIds = {};
  (function walk(nodes, p) {
    nodes.forEach(function (n) {
      parent[n.id] = p;
      childIds[n.id] = (n.children || []).map(function (c) { return c.id; });
      if (n.children) walk(n.children, n.id);
    });
  })(D.tree, null);
  var topIds = D.tree.map(function (n) { return n.id; });

  function item(id) {
    var e = D.entry(id);
    if (e) return e;
    var g = D.groups[id];
    if (!g) return null;
    var o = { id: id, isGroup: true };
    for (var k in g) o[k] = g[k];
    return o;
  }
  function path(id) { var p = []; for (var x = id; x; x = parent[x]) p.unshift(x); return p; }

  var state = {
    selected: 'lcd',
    expanded: { lcd: true, oled: true },
    paused: !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  };

  /* ---------- Shared bits ---------- */
  function cites(ids) {
    return (ids || []).map(function (id) { return '<a class="cite" href="#src-' + id + '">' + id + '</a>'; }).join('');
  }
  function extLink(url, text) {
    return '<a class="ext" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(text) + ' <span aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span></a>';
  }
  function chip(id) {
    var it = item(id);
    return '<li><button type="button" class="chip' + (it.isGroup ? ' chip-group' : '') + '" data-id="' + id + '">' + esc(it.name) + '</button></li>';
  }

  /* ---------- Map ---------- */
  function nodeHtml(id) {
    var it = item(id), kids = childIds[id], has = kids.length > 0;
    var sub = it.isGroup ? (D.axes[it.axis] ? D.axes[it.axis].label : '') : it.kind;
    var up = parent[id] && D.groups[parent[id]];
    if (norm(sub) === norm(it.name) || (up && norm(sub) === norm(up.name))) sub = '';
    var h = '<li class="' + (it.isGroup ? 'is-group' : 'is-entry') + (topIds.indexOf(id) >= 0 ? ' is-top' : '') + '"><div class="row">';
    h += has
      ? '<button type="button" class="twisty" tabindex="-1" aria-controls="sub-' + id + '" aria-expanded="false" aria-label="Show names under ' + esc(it.name) + '"><span aria-hidden="true">▸</span></button>'
      : '<span class="twisty-sp" aria-hidden="true"></span>';
    h += '<button type="button" class="node" data-id="' + id + '" aria-pressed="false" tabindex="-1">' +
      '<span class="n-name">' + esc(it.name) + '</span>' + (sub ? '<span class="n-sub">' + esc(sub) + '</span>' : '') +
      (it.pending ? '<span class="n-flag">source pending</span>' : '') + '</button></div>';
    if (has) h += '<ul id="sub-' + id + '" class="sub" hidden>' + kids.map(nodeHtml).join('') + '</ul>';
    return h + '</li>';
  }

  function syncMap() {
    var onPath = path(state.selected);
    $$('#map .twisty').forEach(function (t) {
      var id = t.getAttribute('aria-controls').slice(4), open = !!state.expanded[id];
      t.setAttribute('aria-expanded', String(open));
      t.setAttribute('aria-label', (open ? 'Hide' : 'Show') + ' names under ' + item(id).name);
      document.getElementById('sub-' + id).hidden = !open;
    });
    $$('#map .node').forEach(function (n) {
      var id = n.dataset.id, sel = id === state.selected;
      n.setAttribute('aria-pressed', String(sel));
      n.tabIndex = sel ? 0 : -1;
      n.classList.toggle('on-path', !sel && onPath.indexOf(id) >= 0);
    });
    $('#map .to-detail-name').textContent = item(state.selected).name;
  }

  function visibleNodes() { return $$('#map .node').filter(function (n) { return n.offsetParent !== null; }); }

  function onMapKey(ev) {
    var n = ev.target.closest('.node');
    if (!n) return;
    var list = visibleNodes(), i = list.indexOf(n), id = n.dataset.id, to = null;
    switch (ev.key) {
      case 'ArrowDown': to = list[Math.min(i + 1, list.length - 1)]; break;
      case 'ArrowUp': to = list[Math.max(i - 1, 0)]; break;
      case 'Home': to = list[0]; break;
      case 'End': to = list[list.length - 1]; break;
      case 'ArrowRight':
        if (childIds[id].length && !state.expanded[id]) { state.expanded[id] = true; syncMap(); }
        else if (childIds[id].length) to = $('#map .node[data-id="' + childIds[id][0] + '"]');
        break;
      case 'ArrowLeft':
        if (childIds[id].length && state.expanded[id]) { state.expanded[id] = false; syncMap(); }
        else if (parent[id]) to = $('#map .node[data-id="' + parent[id] + '"]');
        break;
      default: return;
    }
    ev.preventDefault();
    if (to) { list.forEach(function (x) { x.tabIndex = -1; }); to.tabIndex = 0; to.focus(); }
  }

  /* ---------- Selection ---------- */
  function select(id) {
    if (!item(id)) return;
    state.selected = id;
    path(id).forEach(function (x) { if (childIds[x].length) state.expanded[x] = true; });
    syncMap();
    renderEntry();
    syncResults();
    $('#announce').textContent = 'Showing ' + item(id).name;
  }

  /* ---------- Detail panel ---------- */
  function related(id) {
    var out = [];
    function add(x) { if (x && x !== id && out.indexOf(x) < 0) out.push(x); }
    add(parent[id]);
    childIds[id].forEach(function (c) { add(c); if (D.groups[c]) childIds[c].forEach(add); });
    if (parent[id]) childIds[parent[id]].forEach(add);
    return out;
  }

  function figureHtml(it) {
    var key = DG.keyFor(it), f = DG.figures[key];
    var h = '<figure class="dg' + (f.animated && state.paused ? ' paused' : '') + '" data-diagram="' + key + '" data-animated="' + !!f.animated + '">';
    h += '<div class="dg-head"><figcaption>' + esc(f.title) + (f.animated ? '' : ' <span class="dg-static">' + esc(f.staticTag || 'static schematic') + '</span>') + '</figcaption>';
    if (f.animated) h += '<button type="button" class="btn dg-toggle" aria-label="Pause animation" aria-pressed="' + state.paused + '">' + (state.paused ? '▶ Play' : '❚❚ Pause') + '</button>';
    h += '</div><div class="dg-box">' + DG.render(it) + '</div><ol class="dg-steps">';
    f.steps.forEach(function (s) {
      h += '<li>' + esc(s.text) + ' ' + cites(s.src) + (s.bg ? ' <span class="bg-mark">general background</span>' : '') + '</li>';
    });
    return h + '</ol></figure>';
  }

  function renderEntry() {
    var it = item(state.selected), h = '';
    var crumbs = path(it.id).map(function (x) { return esc(item(x).name); }).join(' <span aria-hidden="true">›</span> ');
    h += '<p class="where"><span class="sr-only">Where it sits: </span>' + crumbs + '</p>';
    h += '<h2 id="detail-title">' + esc(it.name) + '</h2>';
    if (it.isGroup) {
      var ax = D.axes[it.axis];
      h += '<p class="full">Map group · ' + esc(ax.label) + '</p>';
      h += '<p class="badges"><span class="badge">' + esc(D.families[it.family]) + '</span></p>';
      h += '<p class="plain">' + esc(it.plain) + '</p>';
      h += '<p class="axis-q"><strong>Question it answers:</strong> ' + esc(ax.q) + '</p>';
      h += figureHtml(it);
      h += '<div class="members"><h3>Names in this group</h3><ul class="chips">' + childIds[it.id].map(chip).join('') + '</ul></div>';
    } else {
      h += '<p class="full">' + esc(it.full) + '</p>';
      // Product-adoption status and source state are separate badges; a
      // source-pending entry gets only the source badge (no adoption claim).
      h += '<p class="badges"><span class="badge">' + esc(it.kind) + '</span>' +
        (it.pending ? '' : '<span class="badge badge-status"><span class="sr-only">Availability: </span>' + esc(D.statuses[it.status]) + '</span>') +
        (it.pending ? '<span class="badge badge-pending"><span class="sr-only">Sourcing: </span>Source pending</span>' : '') +
        (it.background ? '<span class="badge badge-bg"><span class="sr-only">Sourcing: </span>General background</span>' : '') + '</p>';
      h += '<p class="plain">' + esc(it.plain) + '</p>';
      h += '<dl class="facts"><div class="overlap"><dt>Where it sits</dt><dd><span class="axis-tag">' + esc(D.axes[it.axis].label) + '</span> ' + esc(it.overlap) + '</dd></div></dl>';
      h += figureHtml(it);
      h += '<dl class="facts"><div class="caveat"><dt>Watch out</dt><dd>' + esc(it.caveat) + '</dd></div></dl>';
      var hasAka = it.aka && it.aka.length;
      if (it.more || hasAka) {
        h += '<details class="extra"><summary>' + (it.more ? 'A bit more' : 'Also searched as') + '</summary><dl class="facts">' +
          (it.more ? '<div class="more"><dt>A bit more</dt><dd>' + esc(it.more) + '</dd></div>' : '') +
          (hasAka ? '<div class="aka"><dt>Also searched as</dt><dd>' + it.aka.map(esc).join(' · ') + '</dd></div>' : '') +
          '</dl></details>';
      }
      h += '<div class="src-list"><h3>Sources</h3>';
      if (it.sources.length) {
        h += '<ul>' + it.sources.map(function (sid) {
          var s = D.source(sid);
          return '<li>' + cites([sid]) + ' ' + extLink(s.url, s.publisher + ': ' + s.title) + '</li>';
        }).join('') + '</ul>';
      } else if (it.pending) {
        h += '<p class="muted">Source pending. Only the requested name and its expansion are given; no display family or axis is assigned until a source is checked.</p>';
      } else {
        h += '<p class="muted">General background from the earlier guide; no dedicated source.</p>';
      }
      h += '</div>';
    }
    var rel = related(it.id);
    if (rel.length) h += '<div class="related"><h3>Related names</h3><ul class="chips">' + rel.map(chip).join('') + '</ul></div>';
    $('#entry').innerHTML = h;
  }

  function onEntryClick(ev) {
    var c = ev.target.closest('button.chip');
    if (c) { select(c.dataset.id); $('#detail-title').scrollIntoView({ block: 'nearest' }); return; }
    var t = ev.target.closest('.dg-toggle');
    if (t) {
      state.paused = !state.paused;
      t.setAttribute('aria-pressed', String(state.paused));
      t.textContent = state.paused ? '▶ Play' : '❚❚ Pause';
      t.closest('.dg').classList.toggle('paused', state.paused);
    }
  }

  /* ---------- Search ---------- */
  function rank(e, q) {
    if (!q) return 0;
    var names = [e.name].concat(e.aka || []).map(norm), best = 9;
    names.forEach(function (n) {
      if (n === q) best = Math.min(best, 0);
      else if (n.indexOf(q) === 0) best = Math.min(best, 1);
      else if (n.indexOf(q) >= 0) best = Math.min(best, 2);
    });
    if (best === 9 && (norm(e.full).indexOf(q) >= 0 || norm(e.kind).indexOf(q) >= 0)) best = 3;
    return best;
  }

  function runSearch() {
    var raw = $('#q').value, q = norm(raw);
    var hits = D.entries.map(function (e, i) { return { e: e, r: rank(e, q), i: i }; })
      .filter(function (x) { return x.r < 9; })
      .sort(function (a, b) { return a.r - b.r || a.i - b.i; });
    var n = hits.length;
    $('#count').textContent = !q ? n + ' names in the guide · type to search' : n ? n + (n === 1 ? ' name' : ' names') + ' match' : 'No names match “' + raw.trim() + '”';
    $('#results').innerHTML = !q ? '' : hits.map(function (x) {
      var e = x.e, alias = '';
      if (q && x.r > 0 && norm(e.name).indexOf(q) < 0) {
        var a = (e.aka || []).filter(function (s) { return norm(s).indexOf(q) >= 0; })[0];
        if (a) alias = ' <span class="r-alias">also “' + esc(a) + '”</span>';
      }
      return '<li><button type="button" class="result" data-id="' + e.id + '">' +
        '<span class="r-name">' + esc(e.name) + '</span>' + alias +
        '<span class="r-meta">' + esc(e.kind) + (e.pending ? ' · source pending' : '') + '</span></button></li>';
    }).join('');
    syncResults();
  }
  function syncResults() {
    $$('#results .result').forEach(function (b) {
      if (b.dataset.id === state.selected) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
  }
  function onResultsKey(ev) {
    var list = $$('#results .result'), i = list.indexOf(document.activeElement);
    if (ev.key === 'ArrowDown' && list.length) { ev.preventDefault(); list[Math.min(i + 1, list.length - 1)].focus(); }
    else if (ev.key === 'ArrowUp' && i >= 0) { ev.preventDefault(); if (i === 0) $('#q').focus(); else list[i - 1].focus(); }
    else if (ev.key === 'Escape' && ev.target.id === 'q') { $('#q').value = ''; runSearch(); }
  }

  /* ---------- Compare ---------- */
  function cmpName(id) { var e = D.entry(id); return e.compareName || e.name; }
  function compareNote(a, b) {
    if (a.id === b.id) return 'Same name picked twice: choose a different second option.';
    if (a.family === b.family && a.axis === b.axis) {
      return 'Same question (' + D.axes[a.axis].label.toLowerCase() + '): ' + cmpName(a.id) + ' and ' + cmpName(b.id) + ' are alternatives to each other.';
    }
    if (a.family === b.family) {
      return 'Different questions: ' + cmpName(a.id) + ' is a ' + D.axes[a.axis].label.toLowerCase() + ' and ' + cmpName(b.id) + ' is a ' +
        D.axes[b.axis].label.toLowerCase() + '. They can combine in the same monitor, so this is not an either/or choice.';
    }
    var fam = function (e) { return D.families[e.family].replace(/ \(.*\)$/, ''); };
    return 'Different display families (' + fam(a) + ' vs ' + fam(b) + '): alternatives at the light-source level, so most differences follow from that.';
  }
  function renderCompare() {
    var a = D.entry($('#cmp-a').value), b = D.entry($('#cmp-b').value);
    $('#cmp-note').textContent = compareNote(a, b);
    $('#cmp-table thead').innerHTML = '<tr><th scope="col">Trait</th>' + [a, b].map(function (e) {
      return '<th scope="col"><button type="button" class="open-entry" data-id="' + e.id + '" aria-label="Open ' + esc(e.name) + ' on the map">' + esc(cmpName(e.id)) + '</button></th>';
    }).join('') + '</tr>';
    $('#cmp-table tbody').innerHTML = D.traitKeys.map(function (k) {
      return '<tr><th scope="row">' + esc(k.label) + '</th>' + [a, b].map(function (e) {
        var t = e.traits[k.key];
        return '<td><span class="tend tend-' + t.t + '">' + esc(D.tendencies[t.t]) + '</span> ' + esc(t.text) + ' ' + cites(t.src) + '</td>';
      }).join('') + '</tr>';
    }).join('');
  }
  function initCompare() {
    var opts = D.compareIds.map(function (id) { return '<option value="' + id + '">' + esc(cmpName(id)) + '</option>'; }).join('');
    $('#cmp-a').innerHTML = opts; $('#cmp-b').innerHTML = opts;
    $('#cmp-a').value = 'ips'; $('#cmp-b').value = 'woled';
    $('#cmp-a').addEventListener('change', renderCompare);
    $('#cmp-b').addEventListener('change', renderCompare);
    $('#cmp-swap').addEventListener('click', function () {
      var a = $('#cmp-a').value; $('#cmp-a').value = $('#cmp-b').value; $('#cmp-b').value = a; renderCompare();
    });
    $('#cmp-table').addEventListener('click', function (ev) {
      var b = ev.target.closest('.open-entry');
      if (!b) return;
      select(b.dataset.id);
      $('#detail').scrollIntoView({ block: 'start' });
      $('#detail').focus({ preventScroll: true });
    });
    renderCompare();
  }

  /* ---------- Bibliography ---------- */
  function initSources() {
    var citedBy = {};
    D.entries.forEach(function (e) { e.sources.forEach(function (s) { (citedBy[s] = citedBy[s] || []).push(e.name); }); });
    $('#biblio').innerHTML = D.sources.map(function (s) {
      var links = extLink(s.url, 'Open source') + (s.url2 ? ' ' + extLink(s.url2, 'Second page') : '');
      return '<li id="src-' + s.id + '"><details><summary class="b-head"><span class="b-id">' + s.id + '</span> <span><strong>' + esc(s.publisher) + '</strong>: ' + esc(s.title) +
        ' <span class="b-type">' + esc(s.type) + '</span></span></summary><div class="b-body"><p>' + esc(s.use) + ' <em>' + esc(s.caveat) + '</em></p>' +
        (citedBy[s.id] ? '<p class="b-cited">Cited for: ' + citedBy[s.id].map(esc).join(', ') + '</p>' : '') +
        '<p class="b-links">' + links + '</p></div></details></li>';
    }).join('');
    var names = function (f) { return D.entries.filter(f).map(function (e) { return esc(e.name); }).join(', '); };
    $('#gaps').innerHTML =
      '<p><strong>Source pending:</strong> ' + names(function (e) { return e.pending; }) + '. These sit in the “Unclassified / source pending” group and show only the requested name and its expansion, with no citations, no assigned family or axis, no structure or performance claims, and a static labelled card instead of a diagram. The guide is not fully sourced while these remain.</p>' +
      '<p><strong>General background</strong> (inherited from the earlier guide, no dedicated source): ' + names(function (e) { return e.background; }) + '.</p>';
  }

  function openSource(hash) {
    var li = /^#src-S\d+$/.test(hash) && document.getElementById(hash.slice(1));
    if (li) li.querySelector('details').open = true;
  }

  /* ---------- Init ---------- */
  function init() {
    $('#tree').innerHTML = D.tree.map(function (n) { return nodeHtml(n.id); }).join('');
    $('#map').addEventListener('click', function (ev) {
      var t = ev.target.closest('.twisty');
      if (t) { var id = t.getAttribute('aria-controls').slice(4); state.expanded[id] = !state.expanded[id]; syncMap(); return; }
      var n = ev.target.closest('.node');
      if (!n) return;
      select(n.dataset.id);
      // Desktop: the map stays pinned beside a naturally scrolling detail
      // panel; if the panel's top has scrolled away, bring it back.
      var d = $('#detail');
      if (getComputedStyle($('#map')).position === 'sticky' && d.getBoundingClientRect().top < 0) d.scrollIntoView({ block: 'start' });
    });
    $('#map').addEventListener('keydown', onMapKey);
    $('#entry').addEventListener('click', onEntryClick);
    $('#q').addEventListener('input', runSearch);
    $('#q').addEventListener('keydown', onResultsKey);
    $('#results').addEventListener('keydown', onResultsKey);
    $('#results').addEventListener('click', function (ev) {
      var r = ev.target.closest('.result');
      if (r) select(r.dataset.id);
    });
    runSearch();
    select('lcd');
    initCompare();
    initSources();
    // Following a citation opens that (otherwise collapsed) source row.
    document.addEventListener('click', function (ev) {
      var c = ev.target.closest('a[href^="#src-"]');
      if (c) openSource(c.getAttribute('href'));
    });
    window.addEventListener('hashchange', function () { openSource(location.hash); });
    openSource(location.hash);
    document.documentElement.classList.add('js-ready');
  }
  init();
})();

/* Display Tech Explorer: compact schematic diagrams (inline SVG strings).
 * Each figure has an accessible title + description and a static list of
 * steps that carries the essential facts, so nothing depends on motion.
 * Animated figures use CSS keyframes (styles.css, `.dg-art` rules) that the
 * pause control and prefers-reduced-motion can stop. Figures for
 * source-pending entries are a static, neutral labelled card (name and
 * expansion only, family and axis marked "not assigned"), never mechanics;
 * MLA and PHOLED figures are static too, so no unsourced motion is implied.
 */
(function (root) {
  'use strict';

  function S(text, src, bg) { return { text: text, src: src || [], bg: !!bg }; }
  function svg(id, body, vb) {
    return '<svg class="dg-art" viewBox="' + (vb || '0 0 320 150') + '" role="img" aria-labelledby="' + id + '-t ' + id + '-d" focusable="false">' +
      '<title id="' + id + '-t">{{title}}</title><desc id="' + id + '-d">{{desc}}</desc>' + body + '</svg>';
  }
  function txt(x, y, s, cls, anchor) {
    return '<text x="' + x + '" y="' + y + '" class="' + (cls || 'lbl') + '" text-anchor="' + (anchor || 'middle') + '">' + s + '</text>';
  }
  function d(n) { return 'style="animation-delay:' + n + 's"'; }
  var RGB = ['r', 'g', 'b'];

  /* ---------- LCD stack: backlight -> shutters -> colour filter ---------- */
  function lcdStack() {
    var b = '<rect class="backlight" x="14" y="22" width="16" height="96" rx="3"/>' + txt(22, 136, 'Backlight');
    b += '<rect class="beam beam-on" x="30" y="28" width="80" height="84"/>';
    for (var i = 0; i < 3; i++) {
      var y = 28 + i * 30;
      b += '<rect class="plate" x="110" y="' + y + '" width="8" height="24"/>';
      b += '<rect class="shutter" x="122" y="' + y + '" width="10" height="24" ' + d(-i * 1.1) + '/>';
      b += '<rect class="beam beam-pass" x="134" y="' + (y + 4) + '" width="76" height="16" ' + d(-i * 1.1) + '/>';
      b += '<rect class="cf cf-' + RGB[i] + '" x="210" y="' + y + '" width="14" height="24"/>';
      b += '<rect class="out out-' + RGB[i] + '" x="246" y="' + (y + 2) + '" width="20" height="20" rx="2" ' + d(-i * 1.1) + '/>';
    }
    b += txt(122, 136, 'LC shutters') + txt(217, 136, 'Colour filter') + txt(256, 16, 'Subpixels');
    b += '<path class="eye" d="M284 75q12-12 24 0q-12 12-24 0z"/><circle class="eye-dot" cx="296" cy="75" r="3"/>';
    return svg('dg-lcd', b);
  }

  /* ---------- Active matrix: a transistor per subpixel, rows addressed ---------- */
  function activeMatrix() {
    var b = '';
    for (var r = 0; r < 3; r++) for (var c = 0; c < 6; c++) {
      var x = 40 + c * 40, y = 24 + r * 34;
      b += '<rect class="cell cell-' + RGB[c % 3] + '" x="' + x + '" y="' + y + '" width="30" height="24" rx="2" ' + d(-(2 - r) * 0.9 - c * 0.13) + '/>';
      b += '<rect class="tft-chip" x="' + (x + 2) + '" y="' + (y + 16) + '" width="7" height="6"/>';
    }
    b += '<rect class="scan" x="34" y="20" width="252" height="32" rx="4"/>';
    b += txt(160, 140, 'Each subpixel has its own transistor (small square)');
    return svg('dg-am', b);
  }

  /* ---------- LC modes: rods between glass plates ---------- */
  function lcMode(kind) {
    var b = '', i, label;
    if (kind === 'ips') {
      b += '<rect class="glass-top" x="30" y="20" width="260" height="96" rx="6"/>';
      for (i = 0; i < 6; i++) b += '<rect class="rod rod-ips" x="' + (52 + i * 40) + '" y="64" width="26" height="8" rx="4" ' + d(-i * 0.15) + '/>';
      b += '<line class="electrode" x1="40" y1="108" x2="280" y2="108"/>';
      label = 'Top view: crystals turn sideways, staying flat to the glass';
    } else {
      b += '<rect class="plate-h" x="30" y="18" width="260" height="6"/><rect class="plate-h" x="30" y="112" width="260" height="6"/>';
      for (i = 0; i < 6; i++) {
        var a0 = kind === 'tn' ? i * 18 : 90, a1 = kind === 'tn' ? 90 : 40;
        b += '<rect class="rod rod-tilt" x="' + (52 + i * 40) + '" y="64" width="26" height="8" rx="4" style="--a0:' + a0 + 'deg;--a1:' + a1 + 'deg"/>';
      }
      label = kind === 'tn' ? 'Side view: crystals twist plate to plate; voltage untwists them' : 'Side view: crystals stand upright; voltage tilts them';
    }
    return svg('dg-lc', b + txt(160, 140, label));
  }

  /* ---------- LED backlights ---------- */
  function ledBacklight(entry) {
    var hi = entry && entry.id;
    var b = '<g class="' + (hi === 'direct-lit' ? 'dim' : '') + '"><rect class="panel" x="20" y="22" width="130" height="90" rx="4"/>' +
      '<rect class="guide" x="28" y="30" width="114" height="74"/>';
    for (var i = 0; i < 5; i++) b += '<circle class="led" cx="24" cy="' + (34 + i * 16) + '" r="3.5" ' + d(-i * 0.3) + '/>';
    b += txt(85, 132, 'Edge-lit') + '</g>';
    b += '<g class="' + (hi === 'edge-lit' ? 'dim' : '') + '"><rect class="panel" x="170" y="22" width="130" height="90" rx="4"/>';
    for (var r = 0; r < 4; r++) for (var c = 0; c < 6; c++) b += '<circle class="led" cx="' + (184 + c * 20) + '" cy="' + (36 + r * 21) + '" r="3.5" ' + d(-(r + c) * 0.25) + '/>';
    b += txt(235, 132, 'Direct-lit') + '</g>';
    return svg('dg-led', b);
  }

  /* ---------- Zone dimming / Mini-LED ---------- */
  function dimming() {
    var b = '<rect class="panel" x="20" y="16" width="280" height="104" rx="4"/>';
    for (var r = 0; r < 4; r++) for (var c = 0; c < 10; c++) {
      b += '<rect class="zone" x="' + (24 + c * 27.6) + '" y="' + (20 + r * 24.5) + '" width="25" height="22" rx="2" ' + d(-(9 - c) * 0.42 + (r === 1 || r === 2 ? 0 : 0.2)) + '/>';
    }
    b += '<circle class="moon" cx="40" cy="68" r="9"/>';
    b += txt(160, 140, 'Zones near the bright object light up; others stay dim');
    return svg('dg-dim', b);
  }

  /* ---------- Quantum-dot colour conversion in an LCD backlight ---------- */
  function qdConvert() {
    var b = '<rect class="backlight" x="14" y="22" width="16" height="96" rx="3"/>' + txt(4, 136, 'LED backlight', 'lbl', 'start');
    for (var i = 0; i < 3; i++) b += '<circle class="ph ph-w ph-in" cx="40" cy="' + (40 + i * 30) + '" r="4" ' + d(-i * 0.5) + '/>';
    b += '<rect class="qd-layer" x="112" y="22" width="18" height="96" rx="2"/>' + txt(121, 136, 'QD layer');
    for (i = 0; i < 3; i++) b += '<circle class="ph ph-' + RGB[i] + ' ph-out" cx="140" cy="' + (40 + i * 30) + '" r="4" ' + d(-i * 0.5) + '/>';
    b += '<rect class="plate" x="232" y="22" width="40" height="96" rx="2"/>' + txt(252, 76, 'LCD', 'lbl-in') + txt(252, 136, 'then shutters + filter');
    return svg('dg-qd', b);
  }

  /* ---------- OLED self-emission ---------- */
  function oledEmit() {
    var b = '<rect class="nobl" x="20" y="102" width="280" height="12" rx="2"/>' + txt(160, 111, 'No backlight', 'lbl-in');
    for (var i = 0; i < 9; i++) {
      var off = i === 4;
      b += '<rect class="sp sp-' + RGB[i % 3] + (off ? ' sp-off' : ' glow') + '" x="' + (34 + i * 29) + '" y="34" width="22" height="56" rx="3" ' + d(-i * 0.37) + '/>';
    }
    b += txt(150, 24, 'black pixel = switched off', 'lbl', 'middle');
    b += txt(160, 140, 'Each subpixel makes its own light');
    return svg('dg-oled', b);
  }

  /* ---------- WOLED: white emitters + colour filters ---------- */
  function woled() {
    var cls = ['r', 'g', 'b', 'w'], b = '';
    for (var i = 0; i < 4; i++) {
      var x = 44 + i * 64;
      b += '<rect class="sp sp-w glow" x="' + x + '" y="96" width="40" height="14" rx="2" ' + d(-i * 0.4) + '/>';
      b += '<rect class="cf ' + (cls[i] === 'w' ? 'cf-clear' : 'cf-' + cls[i]) + '" x="' + x + '" y="62" width="40" height="12"/>';
      b += '<rect class="out out-' + cls[i] + '" x="' + (x + 8) + '" y="20" width="24" height="24" rx="3" ' + d(-i * 0.4) + '/>';
    }
    b += txt(10, 106, 'White', 'lbl', 'start') + txt(10, 72, 'Filter', 'lbl', 'start');
    b += txt(160, 140, 'White OLED light through R, G, B filters; fourth stays white');
    return svg('dg-woled', b);
  }

  /* ---------- QD-OLED: blue emitters + QD conversion ---------- */
  function qdOled() {
    var conv = ['QD red', 'QD green', 'clear'], b = '';
    for (var i = 0; i < 3; i++) {
      var x = 60 + i * 76;
      b += '<rect class="sp sp-b glow" x="' + x + '" y="96" width="48" height="14" rx="2" ' + d(-i * 0.4) + '/>';
      b += '<rect class="qd-cell qd-' + RGB[i] + '" x="' + x + '" y="62" width="48" height="12"/>' + txt(x + 24, 88, conv[i]);
      b += '<rect class="out out-' + RGB[i] + '" x="' + (x + 12) + '" y="20" width="24" height="24" rx="3" ' + d(-i * 0.4) + '/>';
    }
    b += txt(10, 106, 'Blue', 'lbl', 'start');
    b += txt(160, 140, 'Blue OLED light; quantum dots convert it to red or green');
    return svg('dg-qdoled', b);
  }

  /* ---------- Micro-LED ---------- */
  function microLed() {
    var b = '<rect class="panel" x="40" y="16" width="240" height="104" rx="4"/>';
    for (var r = 0; r < 4; r++) for (var c = 0; c < 8; c++) {
      var x = 56 + c * 28, y = 26 + r * 24;
      for (var k = 0; k < 3; k++) b += '<rect class="chip chip-' + RGB[k] + ' glow" x="' + (x + k * 6) + '" y="' + y + '" width="4" height="10" rx="1" ' + d(-((r * 8 + c) % 7) * 0.35 - k * 0.1) + '/>';
    }
    b += txt(160, 140, 'Each subpixel is a microscopic inorganic LED');
    return svg('dg-micro', b);
  }

  /* ---------- Static figures ---------- */
  function tandem() {
    var b = '<rect class="layer" x="70" y="20" width="180" height="16" rx="2"/>' + txt(160, 32, 'Electrode', 'lbl-in') +
      '<rect class="layer emit" x="70" y="42" width="180" height="20" rx="2"/>' + txt(160, 56, 'Emitting unit 1', 'lbl-in') +
      '<rect class="layer" x="70" y="68" width="180" height="8" rx="2"/>' +
      '<rect class="layer emit" x="70" y="82" width="180" height="20" rx="2"/>' + txt(160, 96, 'Emitting unit 2', 'lbl-in') +
      '<rect class="layer" x="70" y="108" width="180" height="16" rx="2"/>' + txt(160, 120, 'Electrode', 'lbl-in');
    return svg('dg-tandem', b + txt(160, 142, 'Stacked units share the work (schematic)'));
  }
  function layouts(entry) {
    var hi = entry && entry.id, b = '';
    function box(x, id, label, cells) {
      var on = hi === id || (!hi || ['rgb-stripe', 'rgwb', 'triangle'].indexOf(hi) < 0);
      return '<g class="' + (on ? '' : 'dim') + '"><rect class="frame' + (hi === id ? ' frame-hi' : '') + '" x="' + x + '" y="20" width="88" height="88" rx="4"/>' + cells + txt(x + 44, 128, label) + '</g>';
    }
    var s = '', w = '', t = '';
    for (var i = 0; i < 3; i++) s += '<rect class="sp sp-' + RGB[i] + '" x="' + (28 + i * 26) + '" y="30" width="20" height="68" rx="2"/>';
    var four = ['r', 'w', 'b', 'g'];
    for (i = 0; i < 4; i++) w += '<rect class="sp sp-' + four[i] + '" x="' + (124 + i * 20) + '" y="30" width="16" height="68" rx="2"/>';
    t += '<rect class="sp sp-r" x="226" y="32" width="30" height="28" rx="3"/><rect class="sp sp-g" x="226" y="68" width="30" height="28" rx="3"/><rect class="sp sp-b" x="262" y="46" width="30" height="34" rx="3"/>';
    b += box(20, 'rgb-stripe', 'RGB stripe', s) + box(116, 'rgwb', 'RGWB', w) + box(212, 'triangle', 'Triangular', t);
    return svg('dg-lay', b);
  }
  function reflective() {
    var b = '<circle class="sun" cx="40" cy="34" r="12"/>' + txt(40, 62, 'Room light') +
      '<line class="ray" x1="56" y1="40" x2="140" y2="86"/><line class="ray" x1="170" y1="86" x2="262" y2="44"/>' +
      '<rect class="panel" x="110" y="86" width="100" height="26" rx="3"/>';
    for (var i = 0; i < 8; i++) b += '<circle class="pig ' + (i % 3 ? 'pig-w' : 'pig-k') + '" cx="' + (120 + i * 11.5) + '" cy="99" r="4"/>';
    b += '<path class="eye" d="M262 40q12-12 24 0q-12 12-24 0z"/>' + txt(160, 132, 'Charged pigments reflect room light; no glow');
    return svg('dg-refl', b);
  }
  function pendingCard(entry) {
    var b = '<rect class="frame" x="10" y="10" width="300" height="122" rx="5"/>' + txt(160, 30, 'Source pending', 'lbl-strong');
    var rows = entry && entry.full
      ? [['Requested name', entry.name], ['Requested expansion', entry.full], ['Display family', 'not assigned'], ['Axis', 'not assigned']]
      : [['Contents', 'requested names only'], ['Display family', 'not assigned'], ['Axis', 'not assigned']];
    rows.forEach(function (r, i) {
      var y = 44 + i * 21;
      b += '<rect class="axis-row" x="22" y="' + y + '" width="276" height="17" rx="3"/>' +
        txt(32, y + 12, r[0], 'lbl', 'start') + txt(288, y + 12, r[1], 'lbl-strong', 'end');
    });
    return svg('dg-pending', b + txt(160, 146, 'No mechanism is drawn until a source is checked'));
  }
  function mla() {
    var b = '<rect class="frame" x="10" y="14" width="146" height="112" rx="5"/><rect class="frame" x="164" y="14" width="146" height="112" rx="5"/>' +
      txt(83, 30, 'Without lenses', 'lbl-strong') + txt(237, 30, 'With micro lens array', 'lbl-strong');
    b += '<rect class="layer" x="22" y="58" width="122" height="6"/>' + txt(83, 52, 'Flat surface');
    b += '<polyline class="ray" points="48,98 52,64 55,40"/><polyline class="ray ray-lost" points="80,98 118,64 140,96"/>';
    for (var i = 0; i < 6; i++) b += '<path class="lens" d="M' + (176 + i * 20) + ' 64a10 10 0 0 1 20 0z"/>';
    b += '<rect class="layer" x="176" y="64" width="120" height="4"/>' + txt(237, 48, 'Convex microlenses');
    b += '<polyline class="ray" points="202,98 206,58 208,40"/><polyline class="ray" points="234,98 262,58 270,40"/>';
    b += '<rect class="layer emit" x="22" y="98" width="122" height="14" rx="2"/>' + txt(83, 105, 'OLED emitter', 'lbl-in');
    b += '<rect class="layer emit" x="176" y="98" width="122" height="14" rx="2"/>' + txt(237, 105, 'Same OLED emitter', 'lbl-in');
    b += txt(83, 140, 'Some light trapped') + txt(237, 140, 'More light gets out');
    return svg('dg-mla', b);
  }
  function pholed() {
    var b = txt(91, 26, 'OLED (schematic)', 'lbl-strong') +
      '<rect class="layer emit" x="16" y="36" width="150" height="28" rx="2"/>' + txt(91, 50, 'Emitter material: PHOLED', 'lbl-in') +
      '<rect class="layer" x="16" y="70" width="150" height="28" rx="2"/>' + txt(91, 84, 'Drive / backplane', 'lbl-in') +
      txt(91, 118, 'Separate layers, separate axes');
    b += '<rect class="frame" x="176" y="14" width="136" height="94" rx="5"/>' + txt(244, 32, 'Per UDC', 'lbl-strong') +
      '<rect class="sp sp-r" x="184" y="48" width="10" height="10" rx="1"/><rect class="sp sp-g" x="197" y="48" width="10" height="10" rx="1"/>' + txt(212, 57, 'widely deployed', 'lbl', 'start') +
      '<rect class="sp sp-b" x="184" y="76" width="10" height="10" rx="1"/>' + txt(212, 85, 'development focus', 'lbl', 'start');
    b += txt(160, 140, 'Deployment status is UDC’s account, not this guide’s');
    return svg('dg-pholed', b);
  }
  function oledAxes(entry) {
    var rows = [
      ['drive', 'Drive', 'AMOLED'],
      ['oledcolor', 'Colour', 'WOLED · QD-OLED · RGB'],
      ['stack', 'Stack', 'Tandem'],
      ['optics', 'Optics', 'MLA'],
      ['chem', 'Material', 'PHOLED'],
      ['layout', 'Layout', 'Stripe · RGWB · Triangle']
    ];
    var ax = entry && entry.axis, b = '';
    rows.forEach(function (r, i) {
      var y = 8 + i * 23, on = r[0] === ax;
      b += '<rect class="axis-row' + (on ? ' axis-hi' : '') + '" x="10" y="' + y + '" width="300" height="19" rx="3"/>' +
        txt(20, y + 13, r[1], on ? 'lbl-strong' : 'lbl', 'start') + txt(300, y + 13, r[2], 'lbl', 'end');
    });
    return svg('dg-axes', b, '0 0 320 148');
  }
  function lightAxis(entry) {
    var cols = [
      ['lcd', ['Backlight', '+ shutters'], ['LCD family']],
      ['self', ['Self-lit', 'pixels'], ['OLED', 'Micro-LED', 'CRT · plasma']],
      ['refl', ['Reflected', 'room light'], ['E-paper', 'Reflective', 'LCD']],
      ['proj', ['Projected'], ['DLP', 'LCoS', '3LCD']]
    ];
    var map = { lcd: 'lcd', oled: 'self', self: 'self', epaper: 'refl', 'reflective-lcd': 'refl', projection: 'proj', crt: 'self', plasma: 'self' };
    var hi = entry && (map[entry.id] || map[entry.family]), b = '';
    cols.forEach(function (c, i) {
      var x = 8 + i * 78, on = c[0] === hi, cx = x + 36;
      b += '<rect class="axis-row' + (on ? ' axis-hi' : '') + '" x="' + x + '" y="12" width="72" height="112" rx="4"/>';
      c[1].forEach(function (l, j) { b += txt(cx, 30 + j * 13, l, 'lbl-strong'); });
      c[2].forEach(function (l, j) { b += txt(cx, 66 + j * 13, l); });
    });
    return svg('dg-light', b + txt(160, 140, 'Where does the light come from?'));
  }

  var figures = {
    'lcd-stack': { title: 'LCD: backlight, shutters, colour filter', animated: true, svg: lcdStack,
      desc: 'A backlight on the left shines through three liquid-crystal shutters that open and close by different amounts, then through red, green and blue filters, producing three subpixels of varying brightness.',
      steps: [S('The backlight stays on.', ['S01']), S('Liquid crystals, set per subpixel by the TFT layer, pass more or less light.', ['S01', 'S02']), S('A colour filter tints each subpixel red, green or blue.', ['S01'])] },
    'active-matrix': { title: 'Active matrix: a transistor per subpixel', animated: true, svg: activeMatrix,
      desc: 'A grid of subpixels, each with a small transistor. A highlight moves down row by row as rows are addressed; each subpixel keeps its setting afterwards.',
      steps: [S('A thin-film transistor sits at each subpixel; Samsung Display’s OLED structure shows this TFT layer.', ['S02']), S('Rows are addressed in turn and each subpixel holds its setting until the next refresh.', [], true)] },
    'lc-tn': { title: 'TN: crystals twist, then untwist', animated: true, svg: function () { return lcMode('tn'); },
      desc: 'Side view of six rod-shaped liquid crystals between two glass plates. At rest each is rotated a little more than the last (a twist); with voltage they all line up.',
      steps: [S('At rest the crystals twist from one plate to the other.', ['S12']), S('Voltage untwists them, changing how much light passes.', ['S12'])] },
    'lc-va': { title: 'VA: crystals stand up, then tilt', animated: true, svg: function () { return lcMode('va'); },
      desc: 'Side view of six rod-shaped liquid crystals standing upright between two glass plates, then tilting together when voltage is applied.',
      steps: [S('At rest the crystals stand upright and block light well.', ['S12']), S('Voltage tilts them to let light through.', ['S12'])] },
    'lc-ips': { title: 'IPS-type: crystals turn in the plane of the glass', animated: true, svg: function () { return lcMode('ips'); },
      desc: 'Top view of six rod-shaped liquid crystals lying flat, rotating sideways together while staying parallel to the glass.',
      steps: [S('Crystals lie flat (LG describes a horizontal arrangement).', ['S01']), S('Voltage rotates them sideways, staying parallel to the glass, which helps colours hold up at angles.', ['S01', 'S12'])] },
    'led-backlight': { title: 'LED backlights: edge-lit vs direct-lit', animated: true, svg: ledBacklight,
      desc: 'Two panels. Left: LEDs along one edge feeding a light guide. Right: a grid of LEDs directly behind the panel.',
      steps: [S('In an LED LCD the LEDs light the panel from behind; they are not the pixels.', ['S01', 'S09']), S('Edge-lit uses a light guide; direct-lit places LEDs behind the screen.', [], true)] },
    'dimming': { title: 'Local dimming: zones follow the picture', animated: true, svg: dimming,
      desc: 'A backlight grid of ten by four zones. A bright object sits at the left; zones brighten in sequence as a highlight sweeps across, while the rest stay dim.',
      steps: [S('The backlight is split into zones that dim independently.', ['S09']), S('Mini-LED uses many small LEDs for many more zones; it is still an LCD backlight.', ['S09', 'S18']), S('Zones are far bigger than pixels, so bright objects on black can bloom.', ['S09'])] },
    'qd-convert': { title: 'QLED: quantum dots in an LED-backlit LCD', animated: true, svg: qdConvert,
      desc: 'Light travels from an LED backlight into a quantum-dot layer; red, green and blue light leaves it and continues into the LCD’s shutters and colour filter.',
      steps: [S('Samsung calls its QLED TVs “Quantum Dot LED” TVs: quantum dots lit from behind by LEDs emit different colours.', ['S19']), S('RTINGS describes QLED as primarily a marketing term for panels with an LED backlight supplemented with quantum dots.', ['S20']), S('In an LCD the light then passes the liquid-crystal shutters and colour filter, so such a panel is still an LCD, not self-lit.', ['S01'])] },
    'oled-emit': { title: 'OLED: every subpixel makes its own light', animated: true, svg: oledEmit,
      desc: 'A row of red, green and blue subpixels glowing at varying levels, with one pixel switched fully off. A label shows there is no backlight.',
      steps: [S('Organic thin films between conductive electrodes give off light when electricity flows (electroluminescence).', ['S23']), S('Each subpixel emits its own light; there is no backlight.', ['S02']), S('A black pixel can simply switch off.', ['S13'])] },
    'woled': { title: 'WOLED: white light through colour filters', animated: true, svg: woled,
      desc: 'Four white-emitting subpixels; three pass through red, green and blue filters and the fourth stays white.',
      steps: [S('UDC describes white light in every pixel with colour filters as one full-colour OLED approach; patterned RGB subpixels are the other it names.', ['S23']), S('Each subpixel emits white; LG stacks R/G/B sources to make that white.', ['S03']), S('Filters make red, green and blue; an unfiltered white subpixel adds brightness (RGWB).', ['S06'])] },
    'qd-oled': { title: 'QD-OLED: blue light converted by quantum dots', animated: true, svg: qdOled,
      desc: 'Three blue-emitting subpixels; red and green quantum-dot layers convert their light, and the third passes blue through a clear layer.',
      steps: [S('A TFT layer drives blue self-emitting OLED subpixels.', ['S02']), S('Red and green quantum dots convert the blue; blue passes through.', ['S02'])] },
    'micro-led': { title: 'Micro-LED: microscopic inorganic LEDs as pixels', animated: true, svg: microLed,
      desc: 'A panel filled with tiny red, green and blue LED chips that light up individually.',
      steps: [S('Each subpixel is its own inorganic micro-LED.', ['S10']), S('Different from Mini-LED, which is an LCD backlight.', ['S18'])] },
    'tandem': { title: 'Tandem OLED: stacked emitting units', animated: false, svg: tandem,
      desc: 'A vertical stack of electrode, emitting unit 1, a middle layer, emitting unit 2 and electrode.',
      steps: [S('Two or more emitting units are stacked in each subpixel.', ['S04']), S('LG’s Tandem WOLED stacks R/G/B light sources to make white.', ['S03'])] },
    'layouts': { title: 'Subpixel layouts compared', animated: false, svg: layouts,
      desc: 'Three pixel layouts side by side: RGB stripe (three bars), RGWB (four bars including white) and a triangular arrangement.',
      steps: [S('LG Display contrasts RGB stripe with RGWB and triangular layouts used in gaming OLED monitors.', ['S06']), S('Layout is one factor in how text edges look.', ['S13'])] },
    'reflective': { title: 'E-paper: reflected room light', animated: false, svg: reflective,
      desc: 'Room light hits a layer of black and white pigment particles and reflects to the viewer’s eye. The display itself does not glow.',
      steps: [S('Charged pigment particles move under an electric field to form the image.', ['S16']), S('You see it by reflected room light, like paper.', ['S16'])] },
    'pending': { title: 'Source pending: name and expansion only', animated: false, staticTag: 'static labelled card', svg: pendingCard,
      desc: 'Static labelled card, not a mechanism. It shows the requested name and its requested expansion, with display family and axis both marked not assigned, because no source has been directly checked yet.',
      steps: [S('Only the requested name and its expansion are given.', []), S('No display family, axis or mechanism is shown until a direct, credible source is checked.', [])] },
    'mla': { title: 'MLA OLED: microlenses help light out', animated: false, svg: mla,
      desc: 'Static side-by-side schematic. Left: an OLED emitter under a flat surface; one ray exits and a shallow ray reflects back inside, labelled as trapped. Right: the same OLED emitter under a row of convex microlenses; both rays exit. Labelled schematic, not to scale.',
      steps: [S('LG Display’s MLA adds a layer of micrometre-sized convex lenses to the OLED panel.', ['S21']), S('LG says the lenses recover light that would otherwise be lost through total reflection, so more of the emitted light gets out.', ['S21']), S('The emitter and colour architecture are unchanged; LG’s brightness, power and viewing-angle figures are not repeated here.', ['S21'])] },
    'pholed': { title: 'PHOLED: an emitter-material choice', animated: false, svg: pholed,
      desc: 'Static schematic. Left: an OLED stack where the emitting layer is labelled “Emitter material: PHOLED”, separate from the drive / backplane layer. Right: Universal Display Corporation’s stated status, with red and green labelled widely deployed and blue labelled development focus.',
      steps: [S('PHOLED names the emitter material: phosphorescent emitters, which UDC says can harvest electrically generated excitons.', ['S22']), S('It is a separate question from the drive method or backplane (AMOLED, TFT) and the colour architecture (WOLED, QD-OLED).', []), S('UDC states red and green phosphorescent OLEDs are widely deployed and blue remains a development focus. That is UDC’s account; no blue PHOLED product claim is made here.', ['S22'])] },
    'oled-axes': { title: 'OLED: independent questions, not rival types', animated: false, svg: oledAxes,
      desc: 'Static table of six OLED axes: drive (AMOLED), colour (WOLED, QD-OLED, RGB), stack (tandem), optics (MLA), material (PHOLED) and layout. The row for the selected name is highlighted.',
      steps: [S('One OLED panel has an answer on every row at once: a drive method, a colour architecture, a stack, optics, an emitter material and a layout.', []), S('Only names on the same row are alternatives to each other.', [])] },
    'light-axis': { title: 'Where does the light come from?', animated: false, svg: lightAxis,
      desc: 'Static comparison of four answers: backlight plus shutters (LCD), self-lit pixels (OLED, Micro-LED, CRT, plasma), reflected room light (e-paper, reflective LCD) and projection (DLP, LCoS, 3LCD). The selected name’s answer is highlighted.',
      steps: [S('LCD uses a backlight with shutters; OLED is self-lit.', ['S01', 'S02']), S('E-paper reflects room light; projectors cast an image onto a separate screen.', ['S16', 'S17'])] }
  };

  var byId = {
    lcd: 'lcd-stack', 'tft-lcd': 'lcd-stack', 'dual-cell': 'lcd-stack', tft: 'active-matrix', amoled: 'active-matrix',
    tn: 'lc-tn', va: 'lc-va', mva: 'lc-va', pva: 'lc-va', amva: 'lc-va', 'fast-va': 'lc-va',
    ips: 'lc-ips', 'ips-gen': 'lc-ips', 'ips-black': 'lc-ips', 'fast-ips': 'lc-ips', ffs: 'lc-ips', hfs: 'lc-ips', pls: 'lc-ips', ahva: 'lc-ips', ads: 'lc-ips',
    'led-lcd': 'led-backlight', 'edge-lit': 'led-backlight', 'direct-lit': 'led-backlight',
    'local-dimming': 'dimming', 'mini-led': 'dimming', qled: 'qd-convert',
    oled: 'oled-emit', 'rgb-oled': 'oled-emit', woled: 'woled', 'qd-oled': 'qd-oled', tandem: 'tandem',
    'rgb-stripe': 'layouts', rgwb: 'layouts', triangle: 'layouts',
    'micro-led': 'micro-led', epaper: 'reflective', 'mla-oled': 'mla', pholed: 'pholed',
    's-amoled': 'pending', 'qd-led': 'pending', 'g-pending': 'pending',
    'g-lcd-drive': 'active-matrix', 'g-mode': 'lc-ips', 'g-wide': 'lc-ips', 'g-va-names': 'lc-va', 'g-backlight': 'led-backlight',
    'g-color': 'qd-convert', 'g-oled-drive': 'active-matrix', 'g-oled-color': 'oled-axes', 'g-oled-extra': 'oled-axes', 'g-layout': 'layouts'
  };

  function keyFor(item) {
    if (item && byId[item.id]) return byId[item.id];
    if (item && item.family === 'oled') return 'oled-axes';
    return 'light-axis';
  }

  function render(item) {
    var key = keyFor(item), f = figures[key];
    return f.svg(item).replace('{{title}}', f.title).replace('{{desc}}', f.desc);
  }

  var api = { figures: figures, keyFor: keyFor, render: render };
  root.DTE_DIAGRAMS = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

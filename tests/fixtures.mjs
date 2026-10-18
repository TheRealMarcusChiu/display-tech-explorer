// Shared expectations for data and browser tests.

// The 39 technology names from the original monitor-tech-guide (js/data.js).
export const LEGACY_NAMES = [
  'LCD', 'OLED', 'MicroLED', 'TFT', 'AMOLED / PMOLED', 'TN', 'VA', 'IPS', 'FFS',
  'MVA', 'PVA / S-PVA', 'AMVA', 'Fast VA', 'S-IPS · H-IPS · e-IPS · AH-IPS',
  'PLS / Super PLS', 'AHVA', 'ADS / ADS Pro', 'HFS', 'IPS Black', 'Fast IPS / Rapid IPS',
  'Edge-lit', 'Direct-lit', 'Local dimming / FALD', 'Mini-LED', 'Dual-cell LCD',
  'Quantum-dot film (“QLED”)', 'Nano IPS', 'WOLED', 'QD-OLED', 'Direct RGB OLED',
  'Tandem / stacked OLED', 'RGB stripe', 'RGWB', 'Triangular layout', 'E-paper',
  'Reflective / transflective LCD', 'CRT', 'Plasma', 'DLP / LCoS / 3LCD'
];

// Requested names and the user-supplied exact expansions.
export const REQUESTED = [
  ['TFT LCD', 'Thin-Film Transistor'],
  ['IPS LCD', 'In-Plane Switching'],
  ['LED LCD', 'Light Emitting Diode'],
  ['QLED', 'Quantum Dot LED'],
  ['QD-LED', 'Quantum Dot LED'],
  ['Mini-LED', 'Mini-LED'],
  ['Micro-LED', 'Micro-LED'],
  ['OLED', 'Organic LED'],
  ['WOLED', 'White OLED'],
  ['QD-OLED', 'Quantum Dot OLED'],
  ['MLA OLED', 'Micro Lens Array OLED'],
  ['AMOLED', 'Active Matrix OLED'],
  ['S-AMOLED', 'Super AMOLED'],
  ['PHOLED', 'Phosphorescent OLED']
];

// Entries whose diagram must animate (sourced mechanics).
export const ANIMATED_IDS = ['lcd', 'tft-lcd', 'ips', 'led-lcd', 'mini-led', 'local-dimming', 'qled', 'oled', 'woled', 'qd-oled', 'amoled', 'micro-led'];

// Names still awaiting a directly checked source: must be "source pending".
export const PENDING_OK = ['qd-led', 's-amoled'];

// The neutral map branch that holds them (no physical family or axis), and
// the only content each may carry: exact name, requested expansion, aliases.
export const PENDING_GROUP = { id: 'g-pending', name: 'Unclassified / source pending' };
export const PENDING_CONTENT = {
  's-amoled': { name: 'S-AMOLED', full: 'Super AMOLED', aka: ['Super AMOLED'] },
  'qd-led': { name: 'QD-LED', full: 'Quantum Dot LED', aka: [] }
};
// Claims the pending entries previously made without a verified source.
export const PENDING_FORBIDDEN = {
  's-amoled': /Samsung|terminology|vendor|drive|under AMOLED|AMOLED branch|separate (panel )?family|SAMOLED/i,
  'qd-led': /electrolumin|QDEL|emits? light|dots .*emit|self-lit|research|emerging|concept|driven electrically|light emitting diode/i
};

// Sourced technologies whose monitor adoption is not established by the sources.
export const MONITOR_USE_UNVERIFIED = ['mla-oled', 'pholed'];

// Formerly pending names now cited from browser-verified sources, with the
// static diagram each must use.
export const NEWLY_SOURCED = { 'mla-oled': { src: 'S21', diagram: 'mla' }, pholed: { src: 'S22', diagram: 'pholed' } };

// Sources added in the verified update (exact bibliographic records).
export const VERIFIED_ADDITIONS = [
  ['S19', 'Samsung US', 'What are QLED TVs? | Choosing a QLED TV', 'https://www.samsung.com/us/tvs/tv-buying-guide/what-is-qled-tv/'],
  ['S20', 'RTINGS', 'TV Panel Types: What Is QLED?', 'https://www.rtings.com/tv/learn/what-is-qled'],
  ['S21', 'LG Display Newsroom', '[Beyond TV] A New Brilliance of OLED Technology, MLA+ (Apr 2024)', 'https://news.lgdisplay.com/en/2024/04/beyond-tv-a-new-brilliance-of-oled-technology-mla/'],
  ['S22', 'Universal Display Corporation', 'Unlocking Blue: A Deep Dive into Phosphorescent Blue OLEDs', 'https://oled.com/blog/unlocking-blue-a-deep-dive-into-phosphorescent-blue-oleds/'],
  ['S23', 'Universal Display Corporation', 'Organic Light Emitting Diodes (OLEDs)', 'https://oled.com/oleds/']
];

// S23 (UDC OLED page) is cited for exactly these entries and diagrams.
export const S23_CITED_BY = ['oled', 'woled'];
export const S23_DIAGRAMS = ['oled-emit', 'woled'];

// URLs checked and rejected: must never be cited. (S02's Samsung Display page
// also failed to load; it stays as an inherited, explicitly unverified source.)
export const REJECTED_URLS = [
  'samsung.com/global/galaxy/what-is/super-amoled',
  'lgdisplay.com/eng/technology/meta-technology',
  '10.1038/nphoton.2013.226'
];

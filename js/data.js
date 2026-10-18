/* Display Tech Explorer: content registry.
 * Sources, entries, map tree and comparison traits. Loaded as a classic
 * script (works from file:// and GitHub Pages) and as a CommonJS module in
 * tests. Validated by tests/data.test.mjs.
 *
 * Rules: every entry cites sources, or is flagged `background` (well-known
 * context with no checked source, inherited from the original guide) or
 * `pending` (requested name still awaiting a directly checked source; copy
 * is limited to the user-supplied name and expansion, with no citations, and
 * the entry sits in the neutral "Unclassified / source pending" branch with
 * no physical family or axis asserted).
 */
(function (root) {
  'use strict';

  var sources = [
    { id: 'S01', publisher: 'LG Display', title: 'LCD technology overview (incl. IPS)', type: 'Manufacturer',
      url: 'https://www.lgdisplay.com/eng/technology/lcd',
      use: 'LCD needs a backlight; liquid crystals modulate it; a colour filter makes colour. LG describes its IPS as a horizontal liquid-crystal arrangement.',
      caveat: 'Vendor description, not a universal performance guarantee.' },
    { id: 'S02', publisher: 'Samsung Display', title: 'Quantum dot / QD-OLED structure and principle', type: 'Manufacturer',
      url: 'https://samsungdisplay.com/eng/tech/quantum-dot.jsp',
      use: 'TFT layer, blue self-emitting source and a QD colour-conversion layer: red and green QDs convert blue light; blue passes through. Contrasted with an LCD backlight.',
      caveat: 'Structure used for a schematic only. Performance and contrast claims are Samsung’s. Inherited from the earlier audited guide; the page returned “Request Rejected” in the latest direct browser check, so it is not re-verified here.' },
    { id: 'S03', publisher: 'LG Display', title: 'Tandem WOLED', type: 'Manufacturer',
      url: 'https://www.lgdisplay.com/eng/technology/tandem-woled',
      use: 'LG stacks R/G/B light sources in a tandem structure to produce white light in its large TV/monitor WOLED.',
      caveat: 'Company-specific architecture; not a blueprint for every WOLED or tandem OLED.' },
    { id: 'S04', publisher: 'LG Display', title: 'Tandem OLED', type: 'Manufacturer',
      url: 'https://www.lgdisplay.com/eng/technology/tandem-oled',
      use: 'Tandem (stacked emitting layers) as its own technology axis, with applications.',
      caveat: 'Don’t import its laptop/automotive details into large-panel WOLED.' },
    { id: 'S05', publisher: 'LG Display Newsroom', title: 'CES 2022: 27-inch IPS Black (Jan 2022)', type: 'Manufacturer announcement',
      url: 'https://news.lgdisplay.com/en/2022/01/ces2022-09-27-inch-ips-black/',
      use: 'IPS Black exists as an LG Display-branded IPS LCD technology.',
      caveat: 'Contrast improvement is LG’s claim, bounded to that implementation. Still an IPS LCD.' },
    { id: 'S06', publisher: 'LG Display Newsroom', title: 'LG Display unveils 240 Hz RGB-stripe OLED panel (23 Dec 2025)', type: 'Manufacturer press release',
      url: 'https://news.lgdisplay.com/en/2025/12/lg-display-unveils-worlds-first-240hz-rgb-stripe-oled-panel/',
      use: 'LG announced a 27-inch 4K 240 Hz OLED monitor panel with R, G and B subpixels in a straight row, contrasted with RGWB and triangular layouts used in gaming OLED monitors.',
      caveat: 'An announcement and LG’s own claim (“world’s first”), not proof of broad availability.' },
    { id: 'S07', publisher: 'BOE America', title: 'ADS Pro', type: 'Manufacturer',
      url: 'https://boe-us.com/technologies/ads-pro/',
      use: 'BOE positions ADS Pro as its LCD technology and lists wide viewing angle among its claimed features.',
      caveat: 'Not evidence that ADS is literally IPS, or that all ADS generations are identical.' },
    { id: 'S08', publisher: 'TCL CSOT', title: 'HFS technology', type: 'Manufacturer',
      url: 'https://en.tclcsot.com/Innovativetechnology/398.html',
      use: 'HFS is TCL CSOT’s independently developed FFS (fringe-field switching) technology; “H” comes from Huaxing and stands for “High Transparency”.',
      caveat: 'Performance claims are the vendor’s.' },
    { id: 'S09', publisher: 'AUO', title: 'Mini LED Backlight', type: 'Manufacturer',
      url: 'https://www.auo.com/en-global/technologies/index/Display/MiniLED_Backlight',
      use: 'Explicitly labels Mini LED as a backlight technology: a Mini-LED LCD is still an LCD.',
      caveat: 'AUO’s performance claims are not universal guarantees.' },
    { id: 'S10', publisher: 'AUO', title: 'Micro LED', type: 'Manufacturer',
      url: 'https://www.auo.com/en-global/technologies/index/display/MicroLED',
      use: 'Micro LED presented as a distinct technology family from AUO’s Mini LED backlight.',
      caveat: 'Does not mean desktop Micro-LED monitors are common.' },
    { id: 'S11', publisher: 'AUO Display Plus', title: 'Medical-grade display technology', type: 'Manufacturer (subsidiary)',
      url: 'https://auodplus.com/en-global/technology/medical_display_technology',
      use: 'Associates AUO’s AHVA (“Advanced Hyper-Viewing Angle”) technology with its LCD products.',
      caveat: 'AHVA is AUO’s name; the letters “VA” do not make it a vertical-alignment panel.' },
    { id: 'S12', publisher: 'TFTCentral', title: 'Panel Technologies (2015)', type: 'Specialist secondary (independent)',
      url: 'https://tftcentral.co.uk/articles/panel_technologies',
      use: 'Historical taxonomy of TN, VA and IPS and their named variants (MVA, PVA, S-IPS and later brand/technology names).',
      caveat: 'Dated 2015: terminology and history only, not current model performance or proof a name is still sold.' },
    { id: 'S13', publisher: 'RTINGS', title: 'IPS vs OLED', type: 'Independent test outlet',
      url: 'https://www.rtings.com/monitor/learn/ips-vs-oled',
      use: 'Buyer-facing monitor trade-offs between IPS LCD and OLED.',
      caveat: 'Measurements apply to tested products and vary by model.' },
    { id: 'S14', publisher: 'RTINGS', title: 'QD-OLED vs WOLED', type: 'Independent test outlet',
      url: 'https://www.rtings.com/tv/learn/qd-oled-vs-woled',
      use: 'Practical comparison of the two large-panel OLED implementations.',
      caveat: 'Largely TV-based; monitor panels and panel generations can behave differently.' },
    { id: 'S15', publisher: 'LG Business Solutions', title: 'Elevating Display Tech with Nano IPS (PDF one-pager)', type: 'Manufacturer marketing',
      url: 'https://www.lg.com/us/business/commercial-display/resources-hub/pdfs/LG_Elevating_Display_Tech_with_Nano_IPS_one-pager.pdf',
      use: 'What LG means by its Nano IPS brand.',
      caveat: 'Marketing material: a brand on IPS LCD, not a standardised liquid-crystal mode or an emissive technology.' },
    { id: 'S16', publisher: 'E Ink', title: 'How it works', type: 'Manufacturer',
      url: 'https://www.eink.com/tech/detail/How_it_works',
      use: 'Electrophoretic e-paper as a reflective display technology.',
      caveat: 'Not a general-purpose, high-refresh monitor technology.' },
    { id: 'S17', publisher: 'ProjectorCentral', title: 'Digital Projector Imaging Technologies Explained', type: 'Specialist secondary',
      url: 'https://www.projectorcentral.com/Digital-Projector-Imaging-Technologies-Explained.htm',
      use: 'Separates DLP, LCoS and 3LCD projector imaging systems from direct-view panels.',
      caveat: 'Projection context; not a desktop monitor buying guide.' },
    { id: 'S18', publisher: 'AUO', title: 'Mini LED backlight vs Micro LED (paired technology pages)', type: 'Manufacturer',
      url: 'https://www.auo.com/en-global/technologies/index/Display/MiniLED_Backlight',
      url2: 'https://www.auo.com/en-global/technologies/index/display/MicroLED',
      use: 'Cited where the guide contrasts Mini LED (backlight) with Micro LED (emissive pixels) directly.',
      caveat: 'Same pages as S09 and S10.' },
    { id: 'S19', publisher: 'Samsung US', title: 'What are QLED TVs? | Choosing a QLED TV', type: 'Manufacturer',
      url: 'https://www.samsung.com/us/tvs/tv-buying-guide/what-is-qled-tv/',
      use: 'Samsung says “QLED TV is a Quantum Dot LED TV”, describes quantum dots that are illuminated from behind and emit different colours, and says its QLED TVs use LEDs behind the screen with backlight dimming.',
      caveat: 'Samsung’s naming and its own TVs only: not evidence that every QLED-branded display is built the same way or that QLED is a standard. Picture-quality claims are Samsung’s.' },
    { id: 'S20', publisher: 'RTINGS', title: 'TV Panel Types: What Is QLED?', type: 'Specialist secondary (independent)',
      url: 'https://www.rtings.com/tv/learn/what-is-qled',
      use: 'Describes QLED as primarily a marketing term for various panel technologies that use an LED backlight supplemented with quantum dots.',
      caveat: 'Independent, TV-oriented explainer, not a manufacturer specification. Its product and performance remarks apply to tested TVs.' },
    { id: 'S21', publisher: 'LG Display Newsroom', title: '[Beyond TV] A New Brilliance of OLED Technology, MLA+ (Apr 2024)', type: 'Manufacturer article',
      url: 'https://news.lgdisplay.com/en/2024/04/beyond-tv-a-new-brilliance-of-oled-technology-mla/',
      use: 'Expands MLA+ as “Micro Lens Array Plus”; says MLA uses a layer of micrometre-sized convex lenses to maximise emitted light, recovering light otherwise lost through total reflection. An optical light-extraction layer, not a new emitter.',
      caveat: 'LG Display describing its own panels. Its brightness, power and viewing-angle figures are LG’s claims and are not repeated here.' },
    { id: 'S22', publisher: 'Universal Display Corporation', title: 'Unlocking Blue: A Deep Dive into Phosphorescent Blue OLEDs', type: 'Manufacturer (materials) blog',
      url: 'https://oled.com/blog/unlocking-blue-a-deep-dive-into-phosphorescent-blue-oleds/',
      use: 'Phosphorescence as an OLED emitter-material approach that can harvest electrically generated excitons. UDC states red and green phosphorescent OLEDs are widely deployed and blue remains a development focus.',
      caveat: 'UDC’s own account of its field; deployment and efficiency statements are UDC’s. Does not establish that blue phosphorescent OLEDs are commercially deployed, or which monitors use phosphorescent emitters.' },
    { id: 'S23', publisher: 'Universal Display Corporation', title: 'Organic Light Emitting Diodes (OLEDs)', type: 'Manufacturer (materials)',
      url: 'https://oled.com/oleds/',
      use: 'Describes OLEDs as solid-state devices with organic thin films between conductive electrodes, where electricity produces electroluminescence. Describes two full-colour approaches: patterned red, green and blue OLED subpixels, or white light in every pixel with colour filters.',
      caveat: 'UDC is an OLED materials and technology supplier, not a monitor maker. Used only for the basic OLED mechanism and the white-plus-filters vs patterned-RGB approaches; not for monitor prevalence or product performance.' }
  ];

  /* Axes: the independent questions a display name can answer. */
  var axes = {
    light:     { label: 'Light source',        q: 'Where does the light come from?' },
    combo:     { label: 'Combined label',      q: 'Which two questions does this one label answer at once?' },
    drive:     { label: 'Drive method',        q: 'How is each pixel switched?' },
    mode:      { label: 'LCD panel mode',      q: 'How do the liquid crystals move?' },
    vendor:    { label: 'Vendor / brand name', q: 'Whose name is this, and what does it sit on?' },
    backlight: { label: 'Backlight',           q: 'How is the light behind the shutters arranged?' },
    color:     { label: 'Colour layer',        q: 'What makes an LCD’s colours purer?' },
    oledcolor: { label: 'OLED colour architecture', q: 'How does each OLED subpixel end up red, green or blue?' },
    stack:     { label: 'Emitter stack',       q: 'How many emitting layers are stacked?' },
    optics:    { label: 'Optical layer',       q: 'How is more of the light guided out of the panel?' },
    chem:      { label: 'Emitter material',    q: 'What kind of material gives off the light?' },
    layout:    { label: 'Subpixel layout',     q: 'How are the coloured dots arranged?' },
    special:   { label: 'Specialist / historical', q: 'Is this a normal desktop choice today?' },
    pending:   { label: 'No axis assigned',    q: 'Not answered here: which question this name answers is source pending.' }
  };

  var statuses = {
    mainstream: 'Common in monitors today',
    available:  'Available, less common',
    niche:      'Niche / specialised',
    announced:  'Announced (Dec 2025)',
    historical: 'Historical name',
    legacy:     'Legacy / historical',
    rare:       'Rare on desktops',
    projection: 'Projection, not a panel',
    'monitor-unverified': 'Monitor use not verified',
    pending:    'Source pending'
  };

  var families = {
    lcd:     'LCD family (backlight + shutters)',
    oled:    'OLED family (self-lit, organic)',
    self:    'Other self-lit',
    special: 'Specialist & historical',
    pending: 'Unclassified / source pending'
  };

  /* Comparison tendencies: directional, never measurements. */
  var tendencies = { strong: 'Tends strong', mixed: 'Mixed / depends', weak: 'Tends weak', na: 'Not enough to say' };

  var traitKeys = [
    { key: 'black',   label: 'Blacks in a dark room' },
    { key: 'viewing', label: 'Viewing angle' },
    { key: 'motion',  label: 'Motion / response' },
    { key: 'bright',  label: 'Bright-room use' },
    { key: 'text',    label: 'Text clarity' },
    { key: 'static',  label: 'Static-content tolerance' },
    { key: 'price',   label: 'Price accessibility' }
  ];

  function T(t, text, src) { return { t: t, text: text, src: src || [] }; }

  var lcdTraitsCommon = {
    text:   T('strong', 'LCD stripe layout renders text cleanly.', ['S13']),
    static: T('strong', 'No organic emitters; permanent burn-in is not a typical LCD concern.', ['S13'])
  };
  var oledTraitsCommon = {
    black:  T('strong', 'Pixels switch off for true black in a dark room.', ['S13', 'S14']),
    viewing:T('strong', 'Wide viewing angles.', ['S14']),
    motion: T('strong', 'Near-instant pixel transitions are typical of OLED.', ['S13']),
    static: T('weak', 'Static elements carry burn-in risk over long use; mitigation and warranties vary.', ['S13']),
    price:  T('mixed', 'Typically mid-to-high tier.', ['S13'])
  };
  function merge(a, b) { var o = {}, k; for (k in a) o[k] = a[k]; for (k in b) o[k] = b[k]; return o; }

  var entries = [
    /* ---------- LCD family ---------- */
    { id: 'lcd', name: 'LCD', full: 'Liquid-crystal display', family: 'lcd', axis: 'light', kind: 'Light-source family', status: 'mainstream',
      aka: ['liquid crystal display', 'LED monitor', 'LED-backlit LCD'],
      plain: 'A backlight shines all the time. Liquid crystals act like millions of tiny adjustable shutters, and a colour filter tints each subpixel red, green or blue.',
      overlap: 'A family, not one product type. Every LCD also has a panel mode (TN, VA, IPS…), a backlight and a TFT backplane. Those combine; they don’t compete.',
      caveat: '“LED monitor” almost always means an LCD with an LED backlight. The LEDs are not the pixels.',
      more: 'Light passes a rear polariser, the liquid-crystal layer (set per subpixel by the TFT active matrix), a colour filter and a front polariser.',
      sources: ['S01'] },
    { id: 'tft-lcd', name: 'TFT LCD', full: 'Thin-Film Transistor LCD', family: 'lcd', axis: 'combo', kind: 'Combined label (drive + family)', status: 'mainstream',
      aka: ['TFT-LCD', 'thin film transistor LCD', 'active-matrix LCD'],
      plain: 'An LCD whose subpixels are switched by a grid of thin-film transistors. That describes nearly every modern LCD monitor, so on a spec sheet “TFT LCD” mostly just means “LCD”.',
      overlap: 'Joins two axes in one label: the drive layer (TFT) and the light-source family (LCD). A TFT LCD can be TN, VA or IPS.',
      caveat: '“TFT” tells you nothing about viewing angle or contrast. Look for the panel mode instead.',
      sources: ['S01', 'S02'] },
    { id: 'tft', name: 'TFT', full: 'Thin-film transistor (active-matrix backplane)', family: 'lcd', axis: 'drive', kind: 'Backplane, not a panel type', status: 'mainstream',
      aka: ['thin-film transistor', 'active matrix', 'backplane'],
      plain: 'A grid of tiny transistors on glass that switches each subpixel. Almost every modern monitor has one; it is not an alternative to IPS or VA.',
      overlap: 'Used under LCDs and OLEDs alike: Samsung Display’s QD-OLED structure lists a TFT layer under the blue emitter.',
      caveat: 'A drive layer, not a panel mode.',
      sources: ['S02', 'S01'] },

    { id: 'tn', name: 'TN', full: 'Twisted nematic', family: 'lcd', axis: 'mode', kind: 'LCD panel mode', status: 'available',
      aka: ['TN film', 'twisted nematic'],
      plain: 'The oldest of the three main LCD modes. Crystals twist between the glass plates and untwist under voltage. Historically fast and cheap; colours shift when viewed from an angle.',
      overlap: 'One of three alternative LCD modes (TN, VA, IPS-type). It still pairs with any backlight.',
      caveat: 'Less common in mainstream monitors today. History comes from a 2015 source.',
      sources: ['S12'], compareName: 'TN LCD',
      traits: merge(lcdTraitsCommon, {
        black:  T('weak', 'Backlight leaks through “closed” shutters, so blacks look grey in a dark room.', ['S12']),
        viewing:T('weak', 'Brightness and colour shift noticeably off-axis.', ['S12']),
        motion: T('strong', 'Historically the fastest LCD mode; modern fast IPS and VA narrow the gap.', ['S12']),
        bright: T('mixed', 'Depends on the backlight and coating, not on TN itself.'),
        price:  T('strong', 'Usually at the budget end.', ['S12'])
      }) },
    { id: 'va', name: 'VA', full: 'Vertical alignment', family: 'lcd', axis: 'mode', kind: 'LCD panel mode', status: 'mainstream',
      aka: ['vertical alignment'],
      plain: 'At rest the crystals stand upright, which blocks light well, so VA often has the deepest blacks of the LCD modes. Voltage tilts them to let light through.',
      overlap: 'An alternative to TN and IPS-type modes. Combines with any backlight, including Mini-LED.',
      caveat: 'Motion behaviour, especially dark transitions, varies widely by product.',
      more: 'Multi-domain designs (MVA, PVA and successors) split each pixel into regions tilting different ways to improve off-axis viewing.',
      sources: ['S12'], compareName: 'VA LCD',
      traits: merge(lcdTraitsCommon, {
        black:  T('strong', 'Often the deepest native blacks among LCD modes.', ['S12']),
        viewing:T('mixed', 'Better than TN, but contrast can shift off-axis.', ['S12']),
        motion: T('mixed', 'Varies widely; some models smear in dark transitions.', ['S12']),
        bright: T('mixed', 'Depends on backlight and coating.'),
        price:  T('strong', 'Spans budget to upper-mid ranges.')
      }) },
    { id: 'ips', name: 'IPS LCD', full: 'In-Plane Switching LCD', family: 'lcd', axis: 'mode', kind: 'LCD panel mode', status: 'mainstream',
      aka: ['IPS', 'in-plane switching', 'IPS-type', 'IPS panel'],
      plain: 'The crystals lie flat and turn sideways, staying parallel to the glass. Colours stay consistent from wide angles, which made IPS a common default for office and photo work.',
      overlap: 'A panel mode inside an LCD. It pairs with any backlight (edge-lit, Mini-LED) and colour layer (QLED, Nano IPS), on a TFT backplane.',
      caveat: '“IPS” is often used loosely for every wide-view LCD, including technically distinct vendor modes.',
      sources: ['S01', 'S12', 'S13'], compareName: 'IPS-type LCD',
      traits: merge(lcdTraitsCommon, {
        black:  T('mixed', 'Greyer blacks than VA in a dark room; angled “IPS glow” varies by unit.', ['S13']),
        viewing:T('strong', 'Wide viewing angles with stable colour.', ['S01', 'S13']),
        motion: T('mixed', 'Modern fast models respond quickly, though OLED is typically faster.', ['S13']),
        bright: T('strong', 'Many models get bright enough for sunlit rooms.', ['S13']),
        price:  T('strong', 'Very wide range, from budget to professional.', ['S13'])
      }) },
    { id: 'ffs', name: 'FFS', full: 'Fringe-field switching', family: 'lcd', axis: 'mode', kind: 'Sibling wide-view mode', status: 'mainstream',
      aka: ['fringe field switching', 'AFFS', 'Advanced FFS'],
      plain: 'A close relative of IPS. Crystals still turn in a flat plane, but the electrodes make the field “fringe” over them. Several panel makers build wide-view LCDs on this idea.',
      overlap: 'Sits beside IPS on the wide-view side of the panel-mode question.',
      caveat: 'Related to IPS but not literally “an IPS panel”. Vendor implementations differ.',
      sources: ['S08', 'S12'] },
    { id: 'mva', name: 'MVA', full: 'Multi-domain vertical alignment', family: 'lcd', axis: 'vendor', kind: 'Historical term', status: 'historical',
      aka: ['multi-domain VA'],
      plain: 'An early way of splitting each VA pixel into regions that tilt different ways, so the picture holds up better from angles.',
      overlap: 'A VA design, not a separate mode.', caveat: 'Historical name; current VA products rarely advertise it.', sources: ['S12'] },
    { id: 'pva', name: 'PVA / S-PVA', full: 'Patterned (Super-Patterned) vertical alignment', family: 'lcd', axis: 'vendor', kind: 'Historical term', status: 'historical',
      aka: ['PVA', 'S-PVA', 'Super PVA', 'patterned vertical alignment'],
      plain: 'Samsung’s historical family of VA designs, using patterned electrodes to create the multiple tilt regions.',
      overlap: 'A VA design, not a separate mode.', caveat: 'Historical terminology; don’t assume a modern VA panel uses this design.', sources: ['S12'] },
    { id: 'amva', name: 'AMVA', full: 'AUO’s VA technology name', family: 'lcd', axis: 'vendor', kind: 'Vendor name', status: 'historical',
      aka: ['A-MVA', 'AUO VA'],
      plain: 'AUO’s name for its VA panels, a genuine VA design. Don’t confuse it with AUO’s AHVA, which is a wide-view IPS-like LCD.',
      overlap: 'A vendor name on the VA branch.', caveat: 'Branding varies by generation; check the specific product.', sources: ['S12'] },
    { id: 'fast-va', name: 'Fast VA', full: 'Faster-response VA (marketing)', family: 'lcd', axis: 'vendor', kind: 'Marketing label', status: 'available',
      aka: ['Rapid VA', 'HVA', 'fast vertical alignment'],
      plain: 'A label on some VA monitors signalling faster pixel response. It describes a product goal, not a new kind of panel.',
      overlap: 'Still VA.', caveat: 'General background: no dedicated source. Judge motion from independent reviews of the model.',
      background: true, sources: [] },
    { id: 'ips-gen', name: 'S-IPS · H-IPS · e-IPS · AH-IPS', full: 'IPS generations', family: 'lcd', axis: 'vendor', kind: 'Engineering refinement', status: 'historical',
      aka: ['S-IPS', 'Super IPS', 'H-IPS', 'Horizontal IPS', 'e-IPS', 'AH-IPS', 'IPS generations'],
      plain: 'Successive refinements of IPS over the years, improving speed, light transmission and cost. They are all IPS.',
      overlap: 'Generations within IPS, not alternatives to it.', caveat: 'Historical names; exact expansions vary between sources, so the guide does not lean on them.', sources: ['S12'] },
    { id: 'ips-black', name: 'IPS Black', full: 'LG Display IPS Black', family: 'lcd', axis: 'vendor', kind: 'Brand on IPS LCD', status: 'available',
      aka: [],
      plain: 'An LG Display–branded IPS panel that LG says improves contrast over its regular IPS. Still an IPS LCD with a backlight.',
      overlap: 'A brand on the IPS branch.', caveat: 'The improvement is LG’s claim and depends on the product.', sources: ['S05'] },
    { id: 'fast-ips', name: 'Fast IPS / Rapid IPS', full: 'Faster-response IPS (marketing)', family: 'lcd', axis: 'vendor', kind: 'Marketing label', status: 'available',
      aka: ['Fast IPS', 'Rapid IPS'],
      plain: 'Labels used on gaming monitors to signal faster pixel response. Still IPS-type LCD.',
      overlap: 'Still IPS-type.', caveat: 'General background: no dedicated source. Check measured response in independent reviews.',
      background: true, sources: [] },
    { id: 'hfs', name: 'HFS', full: 'TCL CSOT’s FFS technology', family: 'lcd', axis: 'vendor', kind: 'Vendor name', status: 'available',
      aka: ['High Transparency FFS', 'Huaxing', 'TCL CSOT'],
      plain: 'TCL CSOT’s own fringe-field-switching LCD technology. The “H” stands for Huaxing (the company) and “High Transparency”.',
      overlap: 'Sits on the FFS branch, not under IPS or VA.', caveat: 'Performance claims are the vendor’s.', sources: ['S08'] },
    { id: 'pls', name: 'PLS / Super PLS', full: 'Samsung’s wide-view LCD technology', family: 'lcd', axis: 'vendor', kind: 'Sibling wide-view mode', status: 'available',
      aka: ['PLS', 'Super PLS', 'plane to line switching'],
      plain: 'Samsung’s own wide-view LCD technology, developed as an IPS alternative. Most viewers would call it IPS-like.',
      overlap: 'Wide-view sibling of IPS.', caveat: 'IPS-like, not literally IPS. Electrode details aren’t covered by this guide’s sources.', sources: ['S12'] },
    { id: 'ahva', name: 'AHVA', full: 'Advanced Hyper-Viewing Angle (AUO)', family: 'lcd', axis: 'vendor', kind: 'Vendor name', status: 'available',
      aka: ['Advanced Hyper-Viewing Angle', 'AUO IPS'],
      plain: 'AUO’s name for its wide-view, IPS-like LCD. Despite the letters, it is not a vertical-alignment panel: “VA” here means “Viewing Angle”.',
      overlap: 'Wide-view sibling of IPS, not on the VA branch.', caveat: 'A common naming trap.', sources: ['S11', 'S12'] },
    { id: 'ads', name: 'ADS / ADS Pro', full: 'BOE’s wide-view LCD technology', family: 'lcd', axis: 'vendor', kind: 'Vendor name', status: 'mainstream',
      aka: ['ADS', 'ADS Pro', 'BOE'],
      plain: 'BOE’s branded wide-view LCD technology. BOE lists a wide viewing angle among its features. Some monitors labelled “IPS” may use panels like this.',
      overlap: 'Wide-view sibling of IPS.', caveat: 'Feature claims are BOE’s; this guide doesn’t claim it is literally IPS.', sources: ['S07'] },

    { id: 'led-lcd', name: 'LED LCD', full: 'LCD with a Light Emitting Diode (LED) backlight', family: 'lcd', axis: 'backlight', kind: 'Combined label (backlight + family)', status: 'mainstream',
      aka: ['LED monitor', 'LED TV', 'LED-backlit LCD', 'LED backlight'],
      plain: 'An ordinary LCD whose backlight is made of LEDs. Sold as “LED monitors”, but the LEDs only light the panel from behind; the liquid crystals still form the picture.',
      overlap: 'Names the backlight, not the panel mode. An LED LCD can be TN, VA or IPS. Mini-LED is a finer-grained LED backlight.',
      caveat: 'Not self-lit like OLED or Micro-LED.',
      sources: ['S01', 'S09'] },
    { id: 'edge-lit', name: 'Edge-lit', full: 'Edge-lit LED backlight', family: 'lcd', axis: 'backlight', kind: 'Backlight layout', status: 'mainstream',
      aka: ['edge LED', 'edge lighting'],
      plain: 'LEDs line the edges of the screen; a light guide spreads their light across the back. Thin and inexpensive, but blacks can look grey.',
      overlap: 'One way to build an LED LCD backlight.', caveat: 'General background on backlight construction.', background: true, sources: [] },
    { id: 'direct-lit', name: 'Direct-lit', full: 'Direct-lit LED backlight', family: 'lcd', axis: 'backlight', kind: 'Backlight layout', status: 'mainstream',
      aka: ['direct LED', 'back-lit', 'full array'],
      plain: 'LEDs sit in a grid directly behind the screen. With independently controlled zones it becomes full-array local dimming.',
      overlap: 'One way to build an LED LCD backlight.', caveat: 'General background on backlight construction.', background: true, sources: [] },
    { id: 'local-dimming', name: 'Local dimming / FALD', full: 'Full-array local dimming', family: 'lcd', axis: 'backlight', kind: 'Backlight feature', status: 'available',
      aka: ['FALD', 'local dimming', 'full array local dimming', 'dimming zones'],
      plain: 'The backlight is split into zones that dim independently, so dark areas get darker. A zone is much bigger than a pixel, so bright objects on black can glow at the edges (“blooming”).',
      overlap: 'A backlight feature; works with any LCD mode.', caveat: 'Zone counts are product-specific and not a complete quality measure.', sources: ['S09'] },
    { id: 'mini-led', name: 'Mini-LED', full: 'Mini-LED backlight (many small LEDs)', family: 'lcd', axis: 'backlight', kind: 'Backlight', status: 'available',
      aka: ['Mini LED', 'miniLED', 'Mini-LED backlight'],
      plain: 'A backlight made from many very small LEDs, allowing many more dimming zones. A Mini-LED monitor is still an LCD: liquid crystals still do the shuttering.',
      overlap: 'A backlight inside an LCD. Combines with any LC mode (IPS, VA) and often with a quantum-dot layer.',
      caveat: 'Not Micro-LED, where each LED is a pixel.',
      sources: ['S09', 'S18'], compareName: 'Mini-LED LCD (local dimming)',
      traits: merge(lcdTraitsCommon, {
        black:  T('strong', 'Zones dim dark areas for much deeper blacks than non-dimming LCD, but bright objects can bloom.', ['S09']),
        viewing:T('mixed', 'Set by the LC mode underneath (IPS-type, VA…).'),
        motion: T('mixed', 'Set by the LC mode, plus how quickly dimming keeps up.'),
        bright: T('strong', 'Often designed for high brightness; AUO markets Mini LED for HDR.', ['S09']),
        price:  T('mixed', 'Usually priced above non-dimming LCDs.')
      }) },
    { id: 'dual-cell', name: 'Dual-cell LCD', full: 'Dual-layer LCD', family: 'lcd', axis: 'backlight', kind: 'Specialised LCD design', status: 'niche',
      aka: ['dual layer LCD', 'dual cell'],
      plain: 'Two LCD layers stacked: one acts as a fine-grained dimmer for the other. Very deep blacks for an LCD, but niche (mostly professional reference monitors).',
      overlap: 'A light-control approach inside LCD.', caveat: 'General background: no dedicated source.', background: true, sources: [] },
    { id: 'qled', name: 'QLED', full: 'Quantum Dot LED: consumer branding, commonly an LED-backlit LCD with a quantum-dot layer', family: 'lcd', axis: 'color', kind: 'Colour layer (brand term)', status: 'mainstream',
      aka: ['Quantum-dot film (“QLED”)', 'Quantum-dot film', 'QDEF', 'quantum dot LCD', 'quantum dot'],
      plain: 'A consumer brand term. Samsung expands its QLED TV name as “Quantum Dot LED”, with quantum dots lit from behind by LEDs. RTINGS calls QLED primarily a marketing term for panels that use an LED backlight supplemented with quantum dots: commonly an LCD with a quantum-dot colour layer, not a self-lit display.',
      overlap: 'A colour layer in an LED-backlit LCD. Combines with any LC mode and backlight, including Mini-LED.',
      caveat: 'Not QD-OLED (self-lit OLED with quantum-dot colour conversion). “QLED” is a brand convention, not a standard; check how a specific product is built. QD-LED, which has the same requested expansion, is a separate entry here and is still source pending.',
      sources: ['S19', 'S20'] },
    { id: 'nano-ips', name: 'Nano IPS', full: 'LG brand on IPS LCD', family: 'lcd', axis: 'color', kind: 'Brand / colour layer', status: 'available',
      aka: ['Nano IPS Black'],
      plain: 'LG’s brand for IPS monitors with an added layer that widens the colour range. Still an IPS LCD with a backlight, not a self-lit “nano” display.',
      overlap: 'A colour-layer brand on an IPS LCD.', caveat: 'Marketing name; LG’s claims are LG’s.', sources: ['S15'] },

    /* ---------- OLED family ---------- */
    { id: 'oled', name: 'OLED', full: 'Organic LED (organic light-emitting diode)', family: 'oled', axis: 'light', kind: 'Light-source family', status: 'mainstream',
      aka: ['organic light-emitting diode', 'self-emissive'],
      plain: 'Every subpixel makes its own light: organic thin films between conductive electrodes glow when electricity flows (electroluminescence). There is no backlight, so a pixel showing black can simply switch off.',
      overlap: 'A family. Each OLED also has a drive method (AMOLED), a colour architecture (WOLED, QD-OLED, RGB), a stack, an emitter material and a subpixel layout: separate choices.',
      caveat: 'Strengths and weaknesses depend heavily on the panel generation and product.',
      sources: ['S02', 'S13', 'S23'] },
    { id: 'amoled', name: 'AMOLED', full: 'Active Matrix OLED', family: 'oled', axis: 'drive', kind: 'Drive method', status: 'mainstream',
      aka: ['AMOLED / PMOLED', 'PMOLED', 'active matrix OLED', 'passive matrix OLED'],
      plain: 'Describes how OLED pixels are switched: a transistor circuit per subpixel holds it on between refreshes. Monitors and phones use active matrix; passive matrix (PMOLED) suits tiny, simple displays.',
      overlap: 'A drive method, so it says nothing about colour: an AMOLED can be WOLED, QD-OLED or direct RGB.',
      caveat: 'Samsung Display’s OLED structure shows the TFT layer; the active-vs-passive explanation is general background.',
      background: true, sources: ['S02'] },
    { id: 'woled', name: 'WOLED', full: 'White OLED + colour filters (LG Display)', family: 'oled', axis: 'oledcolor', kind: 'Colour architecture', status: 'mainstream',
      aka: ['WRGB OLED', 'W-OLED', 'white OLED', 'LG OLED', 'Tandem WOLED'],
      plain: 'Every subpixel emits white light; colour filters turn three of them red, green and blue, and a fourth stays white for extra brightness.',
      overlap: 'One answer to “how does OLED make colour”: UDC describes white light in every pixel with colour filters as one full-colour OLED approach, alongside patterned RGB subpixels. Pairs with a tandem stack and an RGWB layout in LG’s panels.',
      caveat: 'Implementations vary by generation; LG’s pages describe LG’s own panels.',
      sources: ['S03', 'S06', 'S14', 'S23'], compareName: 'WOLED',
      traits: merge(oledTraitsCommon, {
        bright: T('mixed', 'Full-screen brightness is usually below bright LCDs; varies with coating and generation.', ['S13', 'S14']),
        text:   T('mixed', 'Four-subpixel layout can add colour fringing to text; density and scaling help.', ['S06', 'S13'])
      }) },
    { id: 'qd-oled', name: 'QD-OLED', full: 'Quantum Dot OLED: blue OLED + quantum-dot conversion (Samsung Display)', family: 'oled', axis: 'oledcolor', kind: 'Colour architecture', status: 'mainstream',
      aka: ['QD OLED', 'quantum dot OLED'],
      plain: 'Every subpixel emits blue light. Quantum dots over the red and green subpixels convert that blue into red or green; blue subpixels let it pass.',
      overlap: 'One answer to “how does OLED make colour”, alongside WOLED and direct RGB.',
      caveat: 'Not “QLED” (a brand term, commonly an LED-backlit LCD with quantum dots). Samsung’s contrast and colour claims are Samsung’s.',
      sources: ['S02', 'S14'], compareName: 'QD-OLED',
      traits: merge(oledTraitsCommon, {
        bright: T('mixed', 'Under room light, blacks on some QD-OLED panels look slightly lifted in RTINGS’ testing.', ['S14']),
        text:   T('mixed', 'Triangular subpixel layout can show coloured fringes on text edges.', ['S06', 'S13'])
      }) },
    { id: 'rgb-oled', name: 'Direct RGB OLED', full: 'Separately emitting R, G, B subpixels', family: 'oled', axis: 'oledcolor', kind: 'Colour architecture', status: 'announced',
      aka: ['RGB OLED', 'RGB stripe OLED', 'true RGB'],
      plain: 'Each subpixel emits its own colour directly, with no filter or conversion. LG Display announced an RGB-stripe OLED monitor panel in December 2025.',
      overlap: 'Third answer to “how does OLED make colour”.', caveat: 'Announcement, not broad availability. “World’s first” is LG’s claim.', sources: ['S06'] },
    { id: 'tandem', name: 'Tandem / stacked OLED', full: 'Multiple stacked emitting units', family: 'oled', axis: 'stack', kind: 'Emitter stack', status: 'available',
      aka: ['tandem OLED', 'stacked OLED', 'two-stack', 'multi-stack'],
      plain: 'Two or more emitting layers are stacked inside each subpixel, sharing the work. It describes the stack, not how colour is made.',
      overlap: 'Independent of colour architecture and layout; LG’s Tandem WOLED combines it with WOLED.', caveat: 'Don’t generalise one company’s tandem design to every tandem panel.', sources: ['S03', 'S04'] },
    { id: 'mla-oled', name: 'MLA OLED', full: 'Micro Lens Array OLED', family: 'oled', axis: 'optics', kind: 'Optical light-extraction layer', status: 'monitor-unverified',
      aka: ['MLA', 'MLA+', 'Micro Lens Array Plus', 'micro lens array', 'microlens OLED'],
      plain: 'An OLED with an added layer of micrometre-sized convex lenses. LG Display says the lenses maximise the light emitted, recovering light that would otherwise be lost through total reflection inside the panel. It is an optical layer: the emitter and how colour is made stay the same.',
      overlap: 'An optical light-extraction layer on an OLED, not a new emitter. Not a rival to WOLED or QD-OLED.',
      caveat: 'Described by LG Display for its own panels (MLA and MLA+, “Micro Lens Array Plus”). LG’s brightness, power and viewing-angle figures are its claims and are not repeated; which monitors use it is not verified here.',
      sources: ['S21'] },
    { id: 'pholed', name: 'PHOLED', full: 'Phosphorescent OLED', family: 'oled', axis: 'chem', kind: 'Emitter material', status: 'monitor-unverified',
      aka: ['phosphorescent OLED', 'phosphorescent emitter'],
      plain: 'Names the kind of light-emitting material inside an OLED: phosphorescent emitters. Universal Display Corporation (UDC) describes phosphorescence as a way to harvest the excitons generated electrically in an OLED. It is about material, not the panel family, colour architecture, drive method or backplane.',
      overlap: 'Sits on its own emitter-material axis, so it isn’t an alternative to WOLED, QD-OLED or AMOLED.',
      caveat: 'UDC states that red and green phosphorescent OLEDs are widely deployed and that blue remains a development focus. That is UDC’s account; this guide does not claim blue PHOLED is in products, or say which monitors use phosphorescent emitters.',
      sources: ['S22'] },
    { id: 'rgb-stripe', name: 'RGB stripe', full: 'Red, green, blue in a straight row', family: 'oled', axis: 'layout', kind: 'Subpixel layout', status: 'mainstream',
      aka: ['stripe layout'],
      plain: 'Three coloured bars side by side in each pixel. Standard on LCDs and what most desktop text rendering expects.',
      overlap: 'A layout, found on LCDs and some OLEDs.', caveat: 'Layout is one factor in text clarity; pixel density and scaling matter too.', sources: ['S06'] },
    { id: 'rgwb', name: 'RGWB', full: 'Four-subpixel layout with white (WOLED)', family: 'oled', axis: 'layout', kind: 'Subpixel layout', status: 'mainstream',
      aka: ['WRGB', 'RWBG'],
      plain: 'Four subpixels per pixel: red, green, blue and an unfiltered white. Used on LG Display WOLED panels.',
      overlap: 'The layout that goes with WOLED.', caveat: 'Text may show coloured fringes depending on OS rendering and scaling.', sources: ['S06', 'S13'] },
    { id: 'triangle', name: 'Triangular layout', full: 'Triangular subpixel arrangement (QD-OLED)', family: 'oled', axis: 'layout', kind: 'Subpixel layout', status: 'mainstream',
      aka: ['triangle', 'delta'],
      plain: 'Subpixels arranged in a triangle rather than a row. Used on QD-OLED gaming monitors.',
      overlap: 'The layout that goes with QD-OLED monitors.', caveat: 'Text may show coloured fringes depending on OS rendering and scaling.', sources: ['S06', 'S13'] },

    /* ---------- Other self-lit ---------- */
    { id: 'micro-led', name: 'Micro-LED', full: 'Micro-LED (micro light-emitting diode)', family: 'self', axis: 'light', kind: 'Light-source family', status: 'rare',
      aka: ['MicroLED', 'Micro LED', 'µLED'],
      plain: 'Each subpixel is its own microscopic, inorganic LED. Self-lit like OLED, but made from the same family of materials as ordinary LEDs.',
      overlap: 'A separate self-lit family. Mini-LED is a backlight for an LCD, not this.',
      caveat: 'Ordinary desktop Micro-LED monitors are not common.',
      sources: ['S10', 'S18'], compareName: 'Micro-LED',
      traits: {
        black:  T('strong', 'Self-lit pixels can switch off, like OLED.', ['S10']),
        viewing:T('na', 'Too few desktop products to generalise.'),
        motion: T('na', 'Too few desktop products to generalise.'),
        bright: T('na', 'Too few desktop products to generalise.'),
        text:   T('na', 'Depends on the product’s layout and pixel density.'),
        static: T('na', 'Too few desktop products to generalise.'),
        price:  T('weak', 'Rare and premium; not a typical desktop purchase.', ['S10'])
      } },

    /* ---------- Specialist & historical ---------- */
    { id: 'epaper', name: 'E-paper', full: 'Electrophoretic display', family: 'special', axis: 'special', kind: 'Specialist', status: 'niche',
      aka: ['E Ink', 'electrophoretic', 'e-ink'],
      plain: 'Like printed paper: no glow. Tiny charged pigment particles move to form the image, which you see by reflected room light.',
      overlap: 'Reflective: a different answer to the light-source question.',
      caveat: 'Built for reading and static content; far too slow for gaming or video.',
      sources: ['S16'], compareName: 'E-paper',
      traits: {
        black:  T('mixed', 'No glow at all; contrast depends on room light, like paper.', ['S16']),
        viewing:T('strong', 'Reflective, paper-like viewing from wide angles.', ['S16']),
        motion: T('weak', 'Slow refresh; unsuitable for video or games.', ['S16']),
        bright: T('strong', 'Reflects ambient light, so bright rooms help.', ['S16']),
        text:   T('mixed', 'Good for reading; colour and update speed are limited.', ['S16']),
        static: T('strong', 'Designed for static pages.', ['S16']),
        price:  T('weak', 'Desktop e-paper monitors are niche and not cheap for their size.')
      } },
    { id: 'reflective-lcd', name: 'Reflective / transflective LCD', full: 'LCD lit by room light', family: 'special', axis: 'special', kind: 'Specialist', status: 'niche',
      aka: ['transflective', 'reflective LCD', 'memory LCD'],
      plain: 'An LCD that uses room light bouncing off a reflector instead of (or as well as) a backlight. Found in watches, calculators and outdoor devices.',
      overlap: 'An LCD variant that swaps the light source.', caveat: 'General background: no dedicated source.', background: true, sources: [] },
    { id: 'crt', name: 'CRT', full: 'Cathode-ray tube', family: 'special', axis: 'special', kind: 'Historical', status: 'legacy',
      aka: ['tube', 'cathode ray tube'],
      plain: 'The deep glass-tube monitors of the past: an electron beam swept the screen, making phosphor dots glow.',
      overlap: 'Historical context only.', caveat: 'General background: no dedicated source.', background: true, sources: [] },
    { id: 'plasma', name: 'Plasma', full: 'Plasma display panel (PDP)', family: 'special', axis: 'special', kind: 'Historical', status: 'legacy',
      aka: ['PDP', 'plasma display'],
      plain: 'A historical TV technology: tiny gas cells lit by electrical discharge make phosphors glow. Self-lit but heavy and power-hungry.',
      overlap: 'Historical context only.', caveat: 'General background: no dedicated source.', background: true, sources: [] },
    { id: 'projection', name: 'DLP / LCoS / 3LCD', full: 'Projector imaging systems', family: 'special', axis: 'special', kind: 'Projection', status: 'projection',
      aka: ['DLP', 'LCoS', '3LCD', 'projector', 'DMD'],
      plain: 'The chips inside projectors. They modulate light that is projected onto a separate screen; they aren’t monitor panels you look at directly.',
      overlap: 'Included to clear up names, not as a monitor option.', caveat: 'Projection context.', sources: ['S17'] },

    /* ---------- Unclassified / source pending ----------
     * Requested names with no directly checked source yet. Only the name and
     * the requested expansion are given; no family, axis, structure, vendor,
     * emission, status or relation to other names is asserted. */
    { id: 's-amoled', name: 'S-AMOLED', full: 'Super AMOLED', family: 'pending', axis: 'pending', kind: 'Unclassified name', status: 'pending',
      aka: ['Super AMOLED'],
      plain: 'Source pending. Only the requested name and its expansion, Super AMOLED, are given here, because no source for what it describes has been directly checked yet.',
      overlap: 'Listed under Unclassified / source pending: no display family or axis is assigned until a source is checked.',
      caveat: 'Source pending: nothing is stated about its structure, who uses the name, which branch it belongs on or how it performs.',
      pending: true, sources: [] },
    { id: 'qd-led', name: 'QD-LED', full: 'Quantum Dot LED', family: 'pending', axis: 'pending', kind: 'Unclassified name', status: 'pending',
      aka: [],
      plain: 'Source pending. Only the requested name and its expansion, Quantum Dot LED, are given here, because no source for what it describes has been directly checked yet.',
      overlap: 'Listed under Unclassified / source pending: no display family or axis is assigned until a source is checked.',
      caveat: 'Source pending: nothing is stated about its structure, how it produces light, its product status or how it relates to other quantum-dot names (QLED, QD-OLED).',
      pending: true, sources: [] }
  ];

  /* Map groups: headings that explain one axis. Selectable like entries. */
  var groups = {
    'g-lcd-drive':  { name: 'Drive / backplane', axis: 'drive', family: 'lcd', plain: 'How each LCD subpixel is switched. Almost every modern LCD uses a TFT active matrix, so this sits under every panel mode below.' },
    'g-mode':       { name: 'Panel mode', axis: 'mode', family: 'lcd', plain: 'How the liquid crystals move. One mode per panel: these are genuine alternatives to each other.' },
    'g-va-names':   { name: 'VA names', axis: 'vendor', family: 'lcd', plain: 'Historical and marketing names for VA designs.' },
    'g-wide':       { name: 'Wide-view names', axis: 'vendor', family: 'lcd', plain: 'IPS and its relatives. Some are IPS generations, some sibling modes (FFS), some vendor names whose design isn’t public. They aren’t one standard.' },
    'g-backlight':  { name: 'Backlight', axis: 'backlight', family: 'lcd', plain: 'What is behind the shutters and whether it can dim in zones. Combines with any panel mode.' },
    'g-color':      { name: 'Colour layer', axis: 'color', family: 'lcd', plain: 'Optical layers that make LCD colours purer. They don’t make an LCD self-lit.' },
    'g-oled-drive': { name: 'Drive method', axis: 'drive', family: 'oled', plain: 'How OLED pixels are switched. Says nothing about colour.' },
    'g-oled-color': { name: 'Colour architecture', axis: 'oledcolor', family: 'oled', plain: 'How each OLED subpixel becomes red, green or blue. These are the real alternatives within OLED.' },
    'g-oled-extra': { name: 'Stack, optics & material', axis: 'stack', family: 'oled', plain: 'Three more independent OLED axes: how many emitting layers are stacked, optical layers on top, and the emitter chemistry. Each can combine with a colour architecture.' },
    'g-layout':     { name: 'Subpixel layout', axis: 'layout', family: 'oled', plain: 'How the coloured dots are arranged. Affects how text edges look.' },
    'g-self':       { name: 'Other self-lit', axis: 'light', family: 'self', plain: 'Self-lit approaches that are not organic OLED.' },
    'g-special':    { name: 'Specialist & historical', axis: 'special', family: 'special', plain: 'Real display technologies, but not what most people buy as a desktop monitor today.' },
    'g-pending':    { name: 'Unclassified / source pending', axis: 'pending', family: 'pending', plain: 'Requested names with no directly checked source yet. They are not placed in a display family or on an axis, because that would itself be a claim. Each shows only its name and requested expansion.' }
  };

  var tree = [
    { id: 'lcd', children: [
      { id: 'g-lcd-drive', children: [ { id: 'tft' }, { id: 'tft-lcd' } ] },
      { id: 'g-mode', children: [
        { id: 'tn' },
        { id: 'va', children: [ { id: 'g-va-names', children: [ { id: 'mva' }, { id: 'pva' }, { id: 'amva' }, { id: 'fast-va' } ] } ] },
        { id: 'g-wide', children: [
          { id: 'ips', children: [ { id: 'ips-gen' }, { id: 'ips-black' }, { id: 'fast-ips' } ] },
          { id: 'ffs', children: [ { id: 'hfs' } ] },
          { id: 'pls' }, { id: 'ahva' }, { id: 'ads' }
        ] }
      ] },
      { id: 'g-backlight', children: [
        { id: 'led-lcd', children: [ { id: 'edge-lit' }, { id: 'direct-lit' } ] },
        { id: 'local-dimming' }, { id: 'mini-led' }, { id: 'dual-cell' }
      ] },
      { id: 'g-color', children: [ { id: 'qled' }, { id: 'nano-ips' } ] }
    ] },
    { id: 'oled', children: [
      { id: 'g-oled-drive', children: [ { id: 'amoled' } ] },
      { id: 'g-oled-color', children: [ { id: 'woled' }, { id: 'qd-oled' }, { id: 'rgb-oled' } ] },
      { id: 'g-oled-extra', children: [ { id: 'tandem' }, { id: 'mla-oled' }, { id: 'pholed' } ] },
      { id: 'g-layout', children: [ { id: 'rgb-stripe' }, { id: 'rgwb' }, { id: 'triangle' } ] }
    ] },
    { id: 'g-self', children: [ { id: 'micro-led' } ] },
    { id: 'g-special', children: [ { id: 'epaper' }, { id: 'reflective-lcd' }, { id: 'crt' }, { id: 'plasma' }, { id: 'projection' } ] },
    { id: 'g-pending', children: [ { id: 's-amoled' }, { id: 'qd-led' } ] }
  ];

  var compareIds = entries.filter(function (e) { return e.traits; }).map(function (e) { return e.id; });

  var byId = {};
  entries.forEach(function (e) { byId[e.id] = e; });

  var api = {
    sources: sources, axes: axes, statuses: statuses, families: families, tendencies: tendencies,
    traitKeys: traitKeys, entries: entries, groups: groups, tree: tree, compareIds: compareIds,
    entry: function (id) { return byId[id] || null; },
    source: function (id) { for (var i = 0; i < sources.length; i++) if (sources[i].id === id) return sources[i]; return null; }
  };
  root.DTE = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

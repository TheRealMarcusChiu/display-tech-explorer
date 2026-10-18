# Sources: Display Tech Explorer

Each factual claim on the site carries an inline source ID (S01–S23) linking to the bibliography at the bottom of `index.html`. This file mirrors that bibliography and the registry in `js/data.js` (`DTE.sources`); `tests/data.test.mjs` checks that they stay in sync.

- **S01–S18** and their wording are inherited from the earlier, separately audited guide (`monitor-tech-guide`, research pass of 2026-10-17/18). In the 2026-10-18 source update, S01, S03, S09, S10 and S14 were re-checked by direct browser load and still support their stated use. S02 returned “Request Rejected” and is carried over unverified (see its caveat).
- **S19–S22** were added in the 2026-10-18 source update. Each page was loaded directly in a browser and its title and quoted text checked; each is cited only for the narrow claim in its row.
- **S23** was added in the second 2026-10-18 polish pass, after the page was opened directly in a browser (page title “ORGANIC LIGHT EMITTING DIODES (OLEDS)”). It is cited only for the basic OLED mechanism (OLED) and the white-plus-colour-filters approach (WOLED), not for monitor prevalence or product performance.

Links can move; publisher and title are given so a source can be found again.

**Checked and not cited** (do not use): Samsung Super AMOLED pages (redirected to the Samsung home/support pages), LG Display `/eng/technology/meta-technology` (404; the S21 newsroom story is used instead) and DOI `10.1038/nphoton.2013.226` (an unrelated article, not a QD-LED source). Search snippets and unsupported agent summaries are not treated as verified sources.

**Source types**

- **Manufacturer**: the company describing its own technology. Good for what a name means to that company and for basic structure. Performance claims are the company’s.
- **Independent test outlet**: measures products. Results apply to tested products and vary by model.
- **Specialist secondary**: independent explainer/reference. Check the date.

| ID | Publisher | Title / topic | Type | URL | Use on the site and caveat | Cited by |
|----|-----------|---------------|------|-----|----------------------------|----------|
| S01 | LG Display | LCD technology overview (incl. IPS) | Manufacturer | https://www.lgdisplay.com/eng/technology/lcd | LCD needs a backlight; liquid crystals modulate it; a colour filter makes colour. LG describes its IPS as a horizontal liquid-crystal arrangement. Vendor description, not a universal performance guarantee. | LCD, TFT LCD, TFT, IPS LCD, LED LCD |
| S02 | Samsung Display | Quantum dot / QD-OLED structure and principle | Manufacturer | https://samsungdisplay.com/eng/tech/quantum-dot.jsp | TFT layer, blue self-emitting source and a QD colour-conversion layer: red and green QDs convert blue light; blue passes through. Contrasted with an LCD backlight. Structure used for a schematic only. Performance and contrast claims are Samsung’s. Inherited from the earlier audited guide; the page returned “Request Rejected” in the latest direct browser check, so it is not re-verified here. | TFT LCD, TFT, OLED, AMOLED, QD-OLED |
| S03 | LG Display | Tandem WOLED | Manufacturer | https://www.lgdisplay.com/eng/technology/tandem-woled | LG stacks R/G/B light sources in a tandem structure to produce white light in its large TV/monitor WOLED. Company-specific architecture; not a blueprint for every WOLED or tandem OLED. | WOLED, Tandem / stacked OLED |
| S04 | LG Display | Tandem OLED | Manufacturer | https://www.lgdisplay.com/eng/technology/tandem-oled | Tandem (stacked emitting layers) as its own technology axis, with applications. Don’t import its laptop/automotive details into large-panel WOLED. | Tandem / stacked OLED |
| S05 | LG Display Newsroom | CES 2022: 27-inch IPS Black (Jan 2022) | Manufacturer announcement | https://news.lgdisplay.com/en/2022/01/ces2022-09-27-inch-ips-black/ | IPS Black exists as an LG Display-branded IPS LCD technology. Contrast improvement is LG’s claim, bounded to that implementation. Still an IPS LCD. | IPS Black |
| S06 | LG Display Newsroom | LG Display unveils 240 Hz RGB-stripe OLED panel (23 Dec 2025) | Manufacturer press release | https://news.lgdisplay.com/en/2025/12/lg-display-unveils-worlds-first-240hz-rgb-stripe-oled-panel/ | LG announced a 27-inch 4K 240 Hz OLED monitor panel with R, G and B subpixels in a straight row, contrasted with RGWB and triangular layouts used in gaming OLED monitors. An announcement and LG’s own claim (“world’s first”), not proof of broad availability. | WOLED, Direct RGB OLED, RGB stripe, RGWB, Triangular layout |
| S07 | BOE America | ADS Pro | Manufacturer | https://boe-us.com/technologies/ads-pro/ | BOE positions ADS Pro as its LCD technology and lists wide viewing angle among its claimed features. Not evidence that ADS is literally IPS, or that all ADS generations are identical. | ADS / ADS Pro |
| S08 | TCL CSOT | HFS technology | Manufacturer | https://en.tclcsot.com/Innovativetechnology/398.html | HFS is TCL CSOT’s independently developed FFS (fringe-field switching) technology; “H” comes from Huaxing and stands for “High Transparency”. Performance claims are the vendor’s. | FFS, HFS |
| S09 | AUO | Mini LED Backlight | Manufacturer | https://www.auo.com/en-global/technologies/index/Display/MiniLED_Backlight | Explicitly labels Mini LED as a backlight technology: a Mini-LED LCD is still an LCD. AUO’s performance claims are not universal guarantees. | LED LCD, Local dimming / FALD, Mini-LED |
| S10 | AUO | Micro LED | Manufacturer | https://www.auo.com/en-global/technologies/index/display/MicroLED | Micro LED presented as a distinct technology family from AUO’s Mini LED backlight. Does not mean desktop Micro-LED monitors are common. | Micro-LED |
| S11 | AUO Display Plus | Medical-grade display technology | Manufacturer (subsidiary) | https://auodplus.com/en-global/technology/medical_display_technology | Associates AUO’s AHVA (“Advanced Hyper-Viewing Angle”) technology with its LCD products. AHVA is AUO’s name; the letters “VA” do not make it a vertical-alignment panel. | AHVA |
| S12 | TFTCentral | Panel Technologies (2015) | Specialist secondary (independent) | https://tftcentral.co.uk/articles/panel_technologies | Historical taxonomy of TN, VA and IPS and their named variants (MVA, PVA, S-IPS and later brand/technology names). Dated 2015: terminology and history only, not current model performance or proof a name is still sold. | TN, VA, IPS LCD, FFS, MVA, PVA / S-PVA, AMVA, S-IPS · H-IPS · e-IPS · AH-IPS, PLS / Super PLS, AHVA |
| S13 | RTINGS | IPS vs OLED | Independent test outlet | https://www.rtings.com/monitor/learn/ips-vs-oled | Buyer-facing monitor trade-offs between IPS LCD and OLED. Measurements apply to tested products and vary by model. | IPS LCD, OLED, RGWB, Triangular layout |
| S14 | RTINGS | QD-OLED vs WOLED | Independent test outlet | https://www.rtings.com/tv/learn/qd-oled-vs-woled | Practical comparison of the two large-panel OLED implementations. Largely TV-based; monitor panels and panel generations can behave differently. | WOLED, QD-OLED |
| S15 | LG Business Solutions | Elevating Display Tech with Nano IPS (PDF one-pager) | Manufacturer marketing | https://www.lg.com/us/business/commercial-display/resources-hub/pdfs/LG_Elevating_Display_Tech_with_Nano_IPS_one-pager.pdf | What LG means by its Nano IPS brand. Marketing material: a brand on IPS LCD, not a standardised liquid-crystal mode or an emissive technology. | Nano IPS |
| S16 | E Ink | How it works | Manufacturer | https://www.eink.com/tech/detail/How_it_works | Electrophoretic e-paper as a reflective display technology. Not a general-purpose, high-refresh monitor technology. | E-paper |
| S17 | ProjectorCentral | Digital Projector Imaging Technologies Explained | Specialist secondary | https://www.projectorcentral.com/Digital-Projector-Imaging-Technologies-Explained.htm | Separates DLP, LCoS and 3LCD projector imaging systems from direct-view panels. Projection context; not a desktop monitor buying guide. | DLP / LCoS / 3LCD |
| S18 | AUO | Mini LED backlight vs Micro LED (paired technology pages) | Manufacturer | https://www.auo.com/en-global/technologies/index/Display/MiniLED_Backlight and https://www.auo.com/en-global/technologies/index/display/MicroLED | Cited where the guide contrasts Mini LED (backlight) with Micro LED (emissive pixels) directly. Same pages as S09 and S10. | Mini-LED, Micro-LED |
| S19 | Samsung US | What are QLED TVs? \| Choosing a QLED TV | Manufacturer | https://www.samsung.com/us/tvs/tv-buying-guide/what-is-qled-tv/ | Samsung says “QLED TV is a Quantum Dot LED TV”, describes quantum dots that are illuminated from behind and emit different colours, and says its QLED TVs use LEDs behind the screen with backlight dimming. Samsung’s naming and its own TVs only: not evidence that every QLED-branded display is built the same way or that QLED is a standard. Picture-quality claims are Samsung’s. | QLED |
| S20 | RTINGS | TV Panel Types: What Is QLED? | Specialist secondary (independent) | https://www.rtings.com/tv/learn/what-is-qled | Describes QLED as primarily a marketing term for various panel technologies that use an LED backlight supplemented with quantum dots. Independent, TV-oriented explainer, not a manufacturer specification. Its product and performance remarks apply to tested TVs. | QLED |
| S21 | LG Display Newsroom | [Beyond TV] A New Brilliance of OLED Technology, MLA+ (Apr 2024) | Manufacturer article | https://news.lgdisplay.com/en/2024/04/beyond-tv-a-new-brilliance-of-oled-technology-mla/ | Expands MLA+ as “Micro Lens Array Plus”; says MLA uses a layer of micrometre-sized convex lenses to maximise emitted light, recovering light otherwise lost through total reflection. An optical light-extraction layer, not a new emitter. LG Display describing its own panels. Its brightness, power and viewing-angle figures are LG’s claims and are not repeated here. | MLA OLED |
| S22 | Universal Display Corporation | Unlocking Blue: A Deep Dive into Phosphorescent Blue OLEDs | Manufacturer (materials) blog | https://oled.com/blog/unlocking-blue-a-deep-dive-into-phosphorescent-blue-oleds/ | Phosphorescence as an OLED emitter-material approach that can harvest electrically generated excitons. UDC states red and green phosphorescent OLEDs are widely deployed and blue remains a development focus. UDC’s own account of its field; deployment and efficiency statements are UDC’s. Does not establish that blue phosphorescent OLEDs are commercially deployed, or which monitors use phosphorescent emitters. | PHOLED |
| S23 | Universal Display Corporation | Organic Light Emitting Diodes (OLEDs) | Manufacturer (materials) | https://oled.com/oleds/ | Describes OLEDs as solid-state devices with organic thin films between conductive electrodes, where electricity produces electroluminescence. Describes two full-colour approaches: patterned red, green and blue OLED subpixels, or white light in every pixel with colour filters. UDC is an OLED materials and technology supplier, not a monitor maker. Used only for the basic OLED mechanism and the white-plus-filters vs patterned-RGB approaches; not for monitor prevalence or product performance. | OLED, WOLED |

## General background (no dedicated source)

Inherited from the earlier guide and shown with a visible **General background** badge; copy stays general:
- Fast VA
- Fast IPS / Rapid IPS
- Edge-lit
- Direct-lit
- Dual-cell LCD
- AMOLED
- Reflective / transflective LCD
- CRT
- Plasma

## Source gaps: still source pending

The guide is **not fully sourced** while these remain. Each sits in the map’s **Unclassified / source pending** group, which assigns no display family and no axis. The entry gives **only** the requested name and the requested expansion, plus a visible **Source pending** badge and notice. It has no citations, no availability badge, no structural, vendor, emission, performance, product-status or relationship claims, and a static labelled card (name, expansion, “family: not assigned”, “axis: not assigned”) instead of a mechanism diagram. They stay pending until a direct, credible source is checked:
- **S-AMOLED** (Super AMOLED): the Samsung candidate pages checked so far redirect away. The guide does not say whose term it is, which branch it belongs on or whether it is a separate family. Searchable as “S-AMOLED” and “Super AMOLED”.
- **QD-LED** (Quantum Dot LED): no source has been verified. The guide does not say how it produces light, whether it is in products or research, or how it relates to QLED or QD-OLED. Searchable as “QD-LED”. (The QLED entry notes only that QD-LED is a separate, source-pending entry with the same requested expansion.)

Resolved in the 2026-10-18 source update (no longer pending):
- **MLA OLED**: S21 (LG Display: a microlens light-extraction layer). LG’s performance figures are omitted.
- **PHOLED**: S22 (UDC: phosphorescent emitter material). Deployment status is attributed to UDC; no blue-PHOLED product claim.

Source verification and monitor adoption are tracked separately. MLA OLED and PHOLED have verified technology sources but carry a **Monitor use not verified** availability badge: S21 and S22 don’t establish which monitors currently use them.

Partially covered (the sources don’t use the exact term, or don’t cover every detail):
- **TFT LCD**: S01 (LCD; its stack illustration labels TFT) + S02 (TFT layer); the exact phrase “TFT LCD” is not quoted from a source.
- **LED LCD**: S01 (LCD needs a backlight) + S09 (Mini LED as a backlight technology); no source here defines “LED LCD” directly.
- **QLED**: S19 is Samsung’s own naming and implementation; S20 (independent) calls QLED primarily a marketing term for LED-backlit panels with quantum dots. Neither is treated as proof that every QLED-branded product shares one construction.
- **AMOLED**: S02 shows a TFT layer in an OLED stack; active- vs passive-matrix detail is general background.

Deliberately omitted: top- vs bottom-emission OLED, PenTile/diamond layouts, per-vendor LC chemistry, and any numerical brightness/lifetime/zone-count/efficiency figures.

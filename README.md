# Display Tech Explorer

A compact, dark, static learning map of monitor display technology names. It covers LCD, OLED and Micro-LED, plus the independent labels that combine with them (drive method, LCD panel mode, backlight, colour layer, OLED colour architecture, stack, optics, emitter material and subpixel layout).

It's a map of **overlapping dimensions**, not a mutually exclusive product taxonomy. For example, one monitor can be a TFT, IPS, Mini-LED and quantum-dot LCD all at once.

## What's on the page

- **Name map (left):** a collapsible hierarchy. Selecting a family, an axis group or a name highlights it and updates the panel on the right. LCD is selected by default.
- **Detail panel (right):**
  - **“Find any name in the guide”**: searches every entry by name or alias, including all 39 names from the earlier guide. Picking a result highlights it on the map.
  - For the selected name: its expansion, where it sits, a caveat, sources and related names.
  - A small diagram. Animated diagrams have a Pause/Play control and start paused under `prefers-reduced-motion`. Every diagram also lists its key facts as text.
- **Compare:** two pickers, a swap button and qualitative tendencies with citations. A note says when the two names answer different questions and can be combined.
- **Sources:** a bibliography (S01–S23) that the inline citations link to, plus lists of source-pending and general-background entries.

## Content status

- S01–S18 and their wording come from the earlier, separately audited `monitor-tech-guide`. S19–S23 (Samsung and RTINGS on QLED, LG Display on MLA, Universal Display Corporation on PHOLED and on basic OLED / white-OLED colour) were added after direct browser checks of each page. See [SOURCES.md](SOURCES.md) for what each source does and doesn’t support.
- **QLED** is treated as consumer branding (commonly an LED-backlit LCD with a quantum-dot layer), kept distinct from QD-OLED. **MLA OLED** and **PHOLED** are cited for what the technologies are; their **Monitor use not verified** badge is separate from source status, because the sources don’t say which monitors use them. Vendor performance and deployment statements are omitted or attributed.
- **Source pending:** S-AMOLED and QD-LED still have no verified source. They sit in a neutral **Unclassified / source pending** map group with no family or axis, give only the requested name and expansion, and show a static labelled card instead of a diagram. Nothing is said about their structure or how they relate to other names.
- **General background:** a few inherited entries without a dedicated source carry a visible badge.
- **Publication status:** publicly hosted at https://git.marcuschiu.com/display-tech-explorer/, but still not fully sourced. The open gaps above are shown on the page itself.

## Layout

On desktop (above 860px) the name map is a pinned column beside a detail panel that scrolls with the page, so the selected diagram is never cut off by a fixed panel height. Below 860px the map stacks above the details.

## Files

```
index.html        page shell (relative asset paths; works from a sub-path or file://)
styles.css        all styling and diagram animations
js/data.js        sources, entries, axes, map tree, compare traits
js/diagrams.js    inline-SVG schematics with titles, descriptions and step text
js/app.js         map, detail panel, search, compare, bibliography
tests/            node:test data tests + Playwright browser tests, static test server
SOURCES.md        bibliography mirror (checked against js/data.js by tests)
```

There's no build step, no backend and no remote assets (no fonts, CDNs or analytics).

## Run locally

```sh
npm install          # Playwright, for tests only
npm run serve        # http://127.0.0.1:8766/
npm test             # data + browser tests
npm run test:data    # data tests only
```

Opening `index.html` directly also works.

# QA 0.1.0 — local release verification

Date: 2026-10-18, Asia/Shanghai. Independent checkout: `E:/workspace/qa`.

## Result

The current real vault exports **8 knowledge articles, 6 examples and 5 images**, with no build warnings. Draft body is kept; source frontmatter and private learning fields are not emitted. The local plugin and original vault are not edited by the exporter. The standalone source is versioned in this repository; generated snapshots and local configuration are ignored.

The document layout follows the existing blog: dark grey background, Helvetica/Arial, blue links and a simple article list. The orange, white-node header mark echoes the blog RSS icon. It is decorative; the adjacent `telingc atlas` title remains a home link. A footer link below “A learning process, left open.” returns to the original blog. The original blog navigation, title and About are unaffected.

## Checks passed

1. Six Node tests (`npm test`): stage thresholds, direct relationships, draft and source-byte preservation, local images/wiki links, missing/private links, math/code angle brackets, active HTML removal, table wrapping, stage withdrawal, invalid data, four-example layout and fifth-example rejection.
2. Actual generated pages in an isolated headless Microsoft Edge: all 14 articles/examples and the menu at 1440/390/320px; images decode; no page-wide overflow; no external resource requests while reading. A long inline formula initially overflowed on mobile and is now constrained to its own scrolling region.
3. Actual SVG graph: six example leaves visible without Focus; selected node/leaf and correct Details destination; Back preserves selection and camera; wheel zoom, panning, keyboard selection and simulated two-touch pinch. SVG path sampling found no connector crossing an unrelated knowledge/example box.
4. Header icon loads on every page and has no link/button ancestor. The title points to `/qa/`; footer blog link points to `https://telingc.github.io/`. Narrow headers fit.
5. Publication integration against an isolated **local bare Git repository only**: prepare does not push; a changed unreviewed snapshot is rejected; only generated files enter the publication branch; lowering a stage removes the obsolete article; subsequent commits preserve history without force push; a bad graph leaves the prior successful build intact.

The real GitHub remote has not been configured or contacted. Pages deployment, GitHub credentials and the final public URL remain unverified. These are browser width/touch simulations, not physical iPhone Safari tests.

## Evidence and related blog fix

Local checks and screenshots are retained at `test-results/` (ignored by Git), with originals under `E:/workspace/life-project/output/qa-public-design/site-checks/`. This includes `qa-report.json`, `publish-report.json`, `qa-home-1440.png`, `qa-home-390.png`, `qa-atlas-desktop.png`, `qa-atlas-mobile.png` and `qa-example-mobile.png`.

Separately, the authorized blog repair changes only `_layouts/default.html`, `css/main.css` and `scripts/table-scroll.js`. It wraps tables in keyboard-focusable horizontal scroll regions, with a CSS fallback when JavaScript is disabled. Normal Jekyll build output was generated in an independent temporary folder, not written over `_site`. All four actual Kaggle HTML tables passed at 320/375/390/430/1280px, including captions and reaching the last column by keyboard; repeated initialization and long code/link cells also passed. Original posts, About and navigation were not edited. Physical Safari remains untested.

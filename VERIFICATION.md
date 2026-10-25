# Preview port reuse — 2026-10-25

The build succeeded, but a previous QA preview still owned port 5190. Preview QA now opens the browser only after startup or successful reuse. Repeated launches reuse a matching checkout and base path, identified by a local response header. A different checkout or unrelated service is left running and receives a clear port-conflict message instead of an unhandled Node error. The browser URL respects PORT and basePath.

Validation: all 19 automated tests pass. New lifecycle checks cover repeated launch, later build files served without restarting, a custom port/base path, rejection of a different checkout and preservation of an unrelated service. The real daily preview at http://127.0.0.1:5190/qa/ returned HTTP 200, includes Capacitors, and a second npm start exited successfully with a reuse message. README, Capacitors, graph and import state retained their original SHA256 values. These are local server/HTTP checks; default-browser opening was not visually verified. No remote publication was performed.

---
# Method of Images import — 2026-10-25

Method of Images is at UI stage 2 (stored atlas_status 1), so it is eligible as a node article. Import was stopped by an unsupported SVG image and a home-relative script link, leaving the previous content/preview intact.

Local SVG diagrams now use the same hashed image assets as PNG/JPEG and are referenced through img elements. SVG bytes are retained, not inserted into article HTML. Paths starting with ~/ are explicitly rejected even when basename lookup could find a similarly named file. Errors identify the note, original link and suggested relative path; the import CLI appends timestamped diagnostic details to ignored import-error.log and explains that Preview shows successful imports only.

Only the ~/ prefix was removed from three verified script links (Method of Images, Charge from a Radial Field and Infinite-line Reference). Original notes were backed up; no equations, prose, learning stages or history were edited. Source scripts remain byte-for-byte copies. The source's case-only rename to Superposition of Fields retains its ID and examples.

Graph relationship keys are serialized in stable ID order. Adding a node between existing titles no longer causes an order-only graph.json modification on the next import; relationship values are retained.

Validation: 17 automated tests pass, including SVG import/re-read/idempotence, unchanged image bytes, rejection of ~/ links and graph stability after adding a node. The real snapshot builds 12 node articles, 12 examples, 17 images and 9 source files with no warnings. The Method of Images page passed at 1280/390/320px: its SVG loads, 21 formulas render, no TeX fallbacks and no page-wide overflow. Local evidence and original-file backups are under E:/workspace/life-project/output/qa-method-images-20261025/. Hosted deployment is a separate step.

---

# Potential examples import — 2026-10-24

The import threshold is unchanged: UI stage 2 (Can explain, stored 1) includes node articles; UI stage 3 (Reproduce unaided, stored 2) includes their examples. Electric potential is stored at 2 and all four examples are eligible.

The source note's sphere_potential_heatmap link was corrected to include .py, with the original note backed up. No extension guessing was added. Broken script links now identify the file and request an exact path with its extension; invalid TeX reports the source note and KaTeX error. Failed imports still preserve existing content and import state.

Display math is parsed before Markdown setext headings, including prose adjacent to $$ delimiters. This prevents an isolated equals sign inside valid TeX from splitting the block. Original formulas and worked solutions are unchanged; inline/fenced code and escaped delimiters remain literal.

Validation: all 14 tests pass. The real import produces 11 node articles, 12 examples, 13 images and 5 source files with no warnings. All four Potential examples passed browser checks at 1280/390/320px, with no math fallbacks or page-wide overflow. The sphere plot loads after scrolling and its script link points to the exact .py file. Evidence is under E:/workspace/life-project/output/qa-potential-import-20261024/. These are local checks; this fix has not been deployed remotely.

Windows refused to rename the existing content directory (EPERM), although an adjacent empty-directory probe could be renamed. This update contained eight additions and no modified/deleted content. A one-time helper made a complete content/state backup, created only those eight files without overwrite, re-read the four examples, and updated the checked import state. A subsequent normal preview reports no changes. The regular import transaction was not replaced with a fallback; if Windows holds the directory again, close applications using content before retrying.

---

# QA 0.3.0 — standalone Markdown content

Date: 2026-10-22, Asia/Shanghai.

Build reads only contentDir. Quiet Atlas is an optional, separately reviewed one-way import. Public source Markdown, relationships, images and source code are committed to main. Existing node/example IDs, article paths and giscus terms are retained. Site identity and repository are configurable; neutral defaults disable comments. Fork builds use their repository for source links and do not reuse another repository's giscus configuration.

Validation: 11 focused tests cover imports, stage withdrawal, idempotence, local/manual edits, stale previews, invalid-input preservation, symbolic-link rejection, zero-article source publication, byte preservation, comments, math/HTML sanitization, graph integrity and a real isolated bare Git publisher in Actions/branch modes. Actual content: 11 articles, 7 examples, 8 images, 2 source files; no warnings. All 18 article/example pages passed at 1280, 390 and 320px (54 checks), with no horizontal overflow or broken images.

A disposable example verified that an ordinary browser reload loads a new graph fingerprint and discards a prior version's camera state. The fixture was removed and real content rebuilt. Graph requests revalidate cache; graph, JS and CSS use content-specific resource URLs. Browser reports/screenshots are under E:/workspace/life-project/output/qa-standalone-20261022/.

The separate clean-computer acceptance exercise was explicitly skipped by the user. Live Actions deployment is verified separately after installation; local checks alone do not establish hosted deployment success. No authenticated test comments were submitted. The original blog, author README and source vault are unchanged.

---

# QA 0.1.0 — local release verification

## 0.2.0 update — 2026-10-21

Scope: stage-independent source publication and separate giscus discussions for node articles and examples. The original blog and local Obsidian plugin are not changed. The author-owned README stays empty.

All 13 automated checks pass (including verbatim CRLF publication with core.autocrlf=true), including a real isolated bare Git repository: all scripts without stage gates; original bytes and nested/encoded file names; same-name files in Nodes vs Examples; source updates and deletion; stale snapshot rejection; normal publication history without force push; missing-comment-configuration blocks; last good output survives a failed build; private Markdown stays local; linked source directories cannot escape the vault. Client tests cover deferred loading, single mounting, network failure/retry and rejection of unrelated window messages.

The actual current vault generates 11 articles, 6 examples, 7 images and 1 source file, with no export warnings. In the Codex in-app browser, all 17 generated article/example pages have exactly one comment section at 1280/390/320px; all 51 checks have no page-wide horizontal overflow. The actual Boundary Conditions & Uniqueness Theorems article resolves “The script” to the matching GitHub gh-pages/code/Nodes file. Local image/math/code rendering is preserved. Reports and screenshots: `E:/workspace/life-project/output/qa-code-comments-20261021/`.

Live follow-up on 2026-10-21: the official giscus configuration page now recognizes telingc/qa and its existing Announcements category. Public IDs are stored in config.example.json so ordinary builds work without another setup step. Real giscus widgets on the generated node and example pages both show 0 comments, Write/Preview and Sign in with GitHub. At 390px the node page has no horizontal overflow. The redundant Comments heading and introductory link are removed; a GitHub fallback appears only if the widget fails. Screenshot: output/qa-code-comments-20261021/comments-live-mobile.jpg under the life-project workspace. No real comment was posted; authenticated submission remains untested. GitHub Pages deployment is verified separately after publication.

Comment settings are defined in config.example.json and may be overridden in ignored config.local.json. The original manual prepare/review/confirm publication flow remains; it will not publish an enabled-but-unconfigured giscus feature. Source files are emitted into the same gh-pages snapshot as the website, so their GitHub URLs become reachable when that reviewed snapshot is published.

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

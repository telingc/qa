'use strict';
console.log(`QA — a Markdown atlas

Write directly:
  Copy templates/node.md to content/nodes/Your title.md.
  Copy templates/example.md to content/examples/Your example.md.
  id stays stable; parent is the node ID. A filename supplies the title.
  Optional draft: true hides a page from the website (the file is still public in Git).
  Add prerequisite IDs in content/graph.json. Missing graph means no connections.
  Images go in content/images; code goes in content/scripts.

Preview: npm ci, npm run build, npm start

Publish:
  Edit site.config.json: title, blog, github.repository and basePath.
  Comments are optional; use your own giscus configuration or enabled: false.
  npm run publish
  Review publish-review.json and the local preview.
  npm run publish -- --confirm
  GitHub Pages Source must be GitHub Actions. Check its run for completion.

Optional Quiet Atlas import:
  npm run import:atlas -- --from "PATH TO VAULT"
  Review import-review.json, then repeat with --confirm.
  Or save {"vault":"PATH TO VAULT"} in ignored atlas-import.local.json.
  Import never publishes or writes to the vault. Local edits cause conflicts.
  Manual notes are preserved; prior content is retained in .content-backup-*.
`);

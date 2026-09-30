FOLIO — RESUME STUDIO

A responsive, static resume builder with eight original layouts in six categories.

Run locally:
  python3 -m http.server 4173 --directory dist
  Open http://localhost:4173

Features:
- Template filtering: Minimal, Professional, Creative, Student, Tech, Academic.
- Seven editable content sections, repeatable experience/education/project entries.
- Live preview, template switching, five accent colors, local browser draft saving.
- PDF export through the browser print dialog (A4 / US Letter), plain-text download.
- Writing guidance and a linked review of 12 major resume builders.
- Feature-detected WebMCP status and template selection tools.

Data and export:
- Resume data is stored only in this browser's localStorage; no account or cloud sync.
- Clear draft removes this browser's saved content. Export before moving devices.
- PDF export uses the browser print engine. Select Save as PDF, disable headers and
  footers, and review page breaks. Preview is continuous; printed pages may differ.
- The checklist checks content presence. It is not an ATS compatibility score.
- No AI service or API key is required. Google Fonts is the only external asset.

Source files:
  dist/index.html — document structure
  dist/style.css — responsive styles and print layouts
  dist/app.js — template gallery, editor, local state, export, and guidance

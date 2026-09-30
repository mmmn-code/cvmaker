FOLIO — RESUME STUDIO

A responsive resume builder with eight layouts, guided editing, Gemini extraction,
three- or four-template comparison, sharing, and free single-template PDF export.

Build and run locally (Node.js 22+):
  node scripts/build.mjs
  node scripts/dev.mjs
  Paste your Gemini API key at the hidden prompt, then open http://127.0.0.1:4173
  Leave the key blank to use manual editing without AI extraction.

Validate:
  node --test tests/worker.test.mjs

Features:
- Templates: Minimal, Professional, Creative, Student, Tech, and Academic.
- Paste resume details and explicitly select 3 or 4 templates.
- Gemini extracts structured fields once; every preview uses the same extracted data.
- Review/edit the result, select one template, and export for INR 0 (free).
- The free export summary does not collect card details or process a payment.
- Seven editable sections with repeatable experience, education, and projects.
- Local browser drafts, live preview, template switching, and accent colors.
- WhatsApp/email messages, native sharing, clipboard, and saved-PDF file sharing.
- Feature-detected browser agent tools for status and template selection.

Server and deployment:
- server/worker.mjs is a Cloudflare-compatible Worker with a default fetch handler.
- scripts/build.mjs embeds public assets into dist/server/index.js.
- /api/extract accepts bounded, same-origin JSON POST requests.
- Set GEMINI_API_KEY as a server secret and GEMINI_MODEL as a runtime variable.
- Default model: gemini-3.1-flash-lite. No key is bundled in client assets or source.
- The current hosted site's existing owner-private access is preserved.
- Request throttling is best-effort per Worker isolate, not a global quota.
- Archive-based deployment packages .openai/hosting.json and dist/server/index.js.

Data and export:
- AI extraction sends the pasted text to Google Gemini only after the user clicks
  Create my previews. The server does not store resume text or AI responses.
- Extracted data is staged for review; it only replaces the saved draft when used.
- Existing drafts require confirmation before replacement with a new AI result.
- Saved drafts stay in this browser's localStorage; there is no cloud account sync.
- Review AI output for accuracy. Missing information stays blank; no facts are
  intentionally invented. Provider API usage is associated with the owner's key.
- Export uses the browser print engine. Select Save as PDF, disable headers and
  footers, and review page breaks. Preview is continuous; printed pages may differ.
- Sharing opens a composer or device share menu; users choose recipients and send.
- Selected PDF files are not uploaded or stored by Folio.
- The content checklist is not an ATS compatibility score.

Source files:
  dist/index.html, dist/style.css, dist/app.js — core resume builder
  dist/ai.js, dist/ai.css — AI input, comparison, and free export interface
  server/worker.mjs — Gemini integration and HTTP handlers
  scripts/build.mjs, scripts/dev.mjs — local build and preview
  tests/worker.test.mjs — server validation, privacy, and failure-path tests

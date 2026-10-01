FOLIO — RESUME STUDIO

A responsive resume builder with 47 templates, guided editing, AI extraction,
one- to four-template previews, sharing, and free single-template PDF export.

Build and run locally (Node.js 24):
  node scripts/build.mjs
  node scripts/dev.mjs
  Set GEMINI_API_KEY in a local .env file (use .env.example as a guide).
  The server loads .env on startup. Open http://127.0.0.1:4173.
  Keep .env private; it is excluded from source control and downloads.
  Leave the key blank to use manual editing without AI extraction.

Validate:
  node --test tests/*.test.mjs

Features:
- Templates: Minimal, Professional, Creative, Student, Tech, and Academic.
- Paste resume details and explicitly select 1 to 4 templates.
- AI extracts structured fields once; every preview uses the same extracted data.
- Review/edit the result, select one template, and export for INR 0 (free).
- The free export summary does not collect card details or process a payment.
- Seven editable sections with repeatable experience, education, and projects.
- Local browser drafts, live preview, template switching, and accent colors.
- WhatsApp/email messages, native sharing, clipboard, and saved-PDF file sharing.
- Feature-detected browser agent tools for status and template selection.

Server and deployment:
- server/worker.mjs is a Cloudflare-compatible Worker with a default fetch handler.
- scripts/build.mjs writes safe static assets to public/ for Vercel and embeds
  the same assets into dist/server/index.js for localhost / Worker hosting.
- /api/extract accepts bounded, same-origin JSON POST requests.
- Set GEMINI_API_KEY as a server secret and GEMINI_MODEL as a runtime variable.
- Default model: gemini-3.1-flash-lite. No key is bundled in client assets or source.
- Vercel serves public/ and the two Node.js functions in api/.
- Request throttling is best-effort per server instance, not a global quota.
- vercel.json configures Node.js functions, build output, and response headers.
- Import mmmn-code/cvmaker into Vercel, use the Other framework preset, and
  configure private GEMINI_API_KEY plus GEMINI_MODEL=gemini-3.1-flash-lite
  environment variables before deploying. No client-side API key is required.
- The production Vercel deployment is public; browser drafts remain local.

Data and export:
- AI extraction sends the pasted text to Google Gemini only after the user clicks
  Create my previews. The server does not store resume text or AI responses.
- Extracted data is staged for review; it only replaces the saved draft when used.
- Existing drafts require confirmation before replacement with a new AI result.
- Saved drafts stay in this browser's localStorage; there is no cloud account sync.
- Review AI output for accuracy. Missing information stays blank; no facts are
  intentionally invented. Provider API usage is associated with the owner's key.
- Export downloads a real PDF directly, with selectable text, embedded fonts,
  A4/US Letter sizes, template colors, and automatic page breaks. It is free.
- PDFs are generated in the browser using locally bundled pdfmake 0.2.20 and
  Liberation fonts. The same-origin /api/pdf-download endpoint returns the PDF
  as an attachment for in-app/Safari compatibility, without storing it or using AI.
  With localhost hosting, the PDF stays on your computer.
- Long resumes paginate automatically; always review the PDF before sending.
- Sharing opens a composer or device share menu; users choose recipients and send.
- Selected PDF files are not uploaded or stored by Folio.
- The content checklist is not an ATS compatibility score.

Source files:
  dist/index.html, dist/style.css, dist/app.js — core resume builder
  dist/ai.js, dist/ai.css — AI input, comparison, and free export interface
  dist/pdf.js, dist/vendor/ — PDF renderer, bundled engine, fonts, and licenses
  tests/pdf.test.mjs — template PDF generation and attachment-download tests
  server/worker.mjs — Gemini integration and HTTP handlers
  api/, vercel.json — Vercel API functions and deployment configuration
  scripts/build.mjs, scripts/dev.mjs — build and local preview
  tests/worker.test.mjs — server validation, privacy, and failure-path tests

Template collection update: 43 original templates across Minimal, Professional, Creative, Student, Tech, Academic, and Executive. Search and five layout filters are available in the gallery; AI selection has category/search controls and removable favorites. Thumbnails and full previews use the HTML resume renderer. PDF output uses the same template metadata for structure, section order, fonts, and accents. Existing template IDs are preserved. Inspiration: Resume Now's public 43-template Microsoft Word collection (reviewed September 30, 2026), including its color variants. No third-party template files, source, logos, or sample identities are copied.

Photo templates update:
- Four additional styles: The Portrait, The Spotlight, The Halo, and The Hello.
- Use the With photo filter in the gallery or AI style selector.
- Select a photo template, then upload JPG, PNG, or WebP in The basics.
- Photos up to 8 MB are resized locally; framing, replacing, and removal are supported.
- The photo and framing are saved with the browser draft and included in PDF exports.
- Photos are not sent to Gemini. Text-only templates keep the saved photo hidden.
- assets/demo-profile-portrait.jpg is a fictional AI-generated example used only
  in gallery thumbnails. Its full generation prompt is included alongside it.
- Verified on a 390 px phone viewport and in an actual downloaded photo PDF.

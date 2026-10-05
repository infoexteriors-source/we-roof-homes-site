# Preview delivery and verification

Preview: https://weroof-homes-9sae8ovr8-infoexteriors-8123s-projects.vercel.app

Local production preview: http://localhost:3001

The Vercel preview inherits account authentication protection. Sign in with the owning Vercel account. The live domain and DNS have not been changed.

## Final checks

- Production build: passes. 33 authored website routes, plus sitemap, robots, Open Graph image and server endpoints.
- Browser checks: 1440px desktop, 390px mobile, 360px compact mobile, reduced motion and JavaScript disabled. No horizontal overflow or browser exceptions. Keyboard activation of numbered roof controls passes.
- Automated WCAG A/AA checks: no reported violations in tested homepage states. This is not a complete accessibility certification.
- Diagram screenshots: assembled, expanded, staged and reassembled. Mobile uses static exploded artwork with expandable HTML explanations.
- Content checks: 32 main routes return 200, with unique titles, one H1, canonical links and parseable JSON-LD. Thank-you is tested through form acceptance. Four legacy redirects return 308 directly; missing pages return 404.
- Forms: unit/API tests cover validation, normalization, HMAC signatures, CRM success/failure, spam challenge, honeypot, cross-origin rejection, shared rate limiting, unchecked SMS consent and native-form recovery. Browser tests simulate delivery failure and acceptance to verify preserved data and navigation. No real customer leads were sent.
- Final local mobile Lighthouse: performance **98**, accessibility **100**, best practices **100**; LCP **2.3 seconds**, CLS **0**, TBT **10 ms**. INP needs real-user field measurement after launch; TBT is not INP. These are lab results, not a guarantee for deployed traffic.
- Preview SEO score is 69 because indexing is intentionally disabled. Indexing must only be enabled on the reviewed production deployment. Unverified location drafts remain excluded from indexing and the sitemap.

Evidence is in `artifacts/verification/`. The initial Lighthouse run scored 79 with 5.9-second LCP. Font subsetting/compression, hero image prioritization and deferred roof-motion loading resolved that performance finding; `lighthouse-final.json` contains the final result. The intermediate run is retained as `lighthouse-optimized.json`.

## Launch inputs still required

1. Actual CRM endpoint/signing secret, Turnstile and shared rate-limit credentials; then a real end-to-end delivery test.
2. Sanity project/dataset and content ownership setup; analytics and call-tracking IDs if used.
3. Approved price eligibility, lender disclosures, business/license verification and privacy/consent review.
4. Real completed-project photos, attributable reviews and service evidence for each local page. Current location pages are drafts, not an assertion of verified local project history.
5. Real-device Safari/Android review, production monitoring, domain cutover preserving email DNS, and Search Console sitemap submission.

## Scroll Craft design record

The user's approved brief supplied the journey: offer → reassurance → roof-system clarity → process confidence → payment possibilities → evidence → answers → inspection request. The intended peak is understanding how the layers protect a home.

The chosen grammar is an inspection dossier: a strong photographic opening, stable conversion form, natural-flow information and one short technical scroll scene. Long cinematic flights, horizontal journeys, staged takeover navigation and repeated full-screen acts were rejected because they would delay the inspection request. The user-approved short diagram sequence takes precedence over the skill's device quota.

The bespoke signature is the numbered three-quarter roof assembly that separates into four explanatory stages and reassembles. No generated raster media or video was used. The supplied eagle logo and fonts remain the branding anchors. The feel-check shortened the mobile opening, repaired tight form-heading spacing, improved contrast, and widened roof-layer separation. The final interaction keeps essential text readable without animation.

There was no prior fingerprint row to compare against. The build adds the first recorded shape; no prior entries were rewritten.

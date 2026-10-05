# WeRoof

UI refinement: see `UI-AUDIT.md` for the competitor-informed visual/interaction audit, implementation decisions, verification and remaining launch inputs. Services now has a photo-led grouped layout; Contact is form-first on mobile; navigation, disclosures and touch targets are more readable. Existing-site roofing photography is locally served as optimized WebP with provenance in `assets/photo-sources.md`. Current hero regression checks use `node scripts/verify-hero-motion.mjs`; full-page UI checks use `node scripts/audit-ui-technical.mjs`.

Typography update: all live website text now uses the native Apple system font stack (`-apple-system`, `BlinkMacSystemFont`, with platform fallbacks). Headings use medium weight rather than the previous heavy condensed face. Original font assets remain on disk but are no longer downloaded by the website. Logo lettering and text embedded in the supplied roof image remain unchanged. `node scripts/verify-typography.mjs` checks responsive typography at 1440, 768, 390 and 360px.

Next.js website with a custom SVG roofing system, Sanity content studio and server-side CRM delivery.

## Local preview

`npm install`, then `npm run dev`. Open http://localhost:3000.

`npm run build` creates the production application; `npm start` serves it. `npm test` verifies lead validation and signed delivery. `npm run typecheck` validates TypeScript. `npm run test:browser` runs the browser verification script against port 3000.

## Configuration

Copy `.env.example` to `.env.local` and fill in the account values. No credentials are committed. The site works without Sanity using the authored content in `lib/content.ts`. Missing lead credentials result in an explicit failure, never a simulated success.

For Sanity, create or select a project and dataset, set `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`, then run `npm run studio`. Content schemas cover services, locations, articles, offers, projects, testimonials, FAQs and roof explanations. `published`, `verified` and permission fields control publication. Author complete documents before publishing. Revalidation is hourly; optionally POST to `/api/revalidate` with the configured Bearer secret after publishing.

### Live Google reviews

The Reviews page requests Google Maps feedback through the server-only Places API (New). Enable billing and Places API (New) in Google Cloud, obtain the Place ID for WeRoof's own verified listing, then set `GOOGLE_PLACE_ID` and `GOOGLE_PLACES_API_KEY` in the deployment environment. Restrict the key to Places API (New) and set a sensible daily quota. Never use a `NEXT_PUBLIC_` prefix for the key or commit it. The page does not claim a rating while either value is missing or the API is unavailable.

Google returns at most five reviews in relevance order, not a complete or newest-first feed. The endpoint fetches on each Reviews-page visit without storing response content and includes Google Maps, author and direct review attribution. To display every review, a separately authorized Google Business Profile integration would be required.

The approved offer is centralized in Sanity or the local fallback. Generic financing qualifiers are provided; obtain the actual lender disclosures and $2,999 eligibility before launch. The original logo and fonts are used. The two remote roofing photos come from the user's existing website and are illustrative; they are not labeled as completed WeRoof projects. No reviews or project outcomes have been invented. Add real project photos and sourced testimonials in Sanity.

## CRM contract

### Online property roof view

Calculator requests require a street address, city and ZIP. The PDF and email include a `View your roof online` link to `/roof-report`. The address lives in the URL fragment, so it is not sent in the initial page request; the link is shareable and should be treated as containing the property address. No name, phone or email is placed in it. The page is noindex and excluded from the sitemap. It displays Google imagery directly in a Google iframe, without downloading or embedding imagery into the PDF. It does not use satellite imagery to calculate measurements or prices.

Set `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` after enabling **Maps Embed API** in Google Cloud. Restrict the key to Maps Embed API and HTTP referrers `https://www.weroofhomes.com/*`, `https://weroofhomes.com/*`, and the exact preview domains you use (`http://127.0.0.1:3000/*` and `http://localhost:3000/*` for local development). Rebuild/restart after changing this public environment variable. Without a key, the view provides an explicit Google Maps link and instructions to select Satellite. Use a real property to verify Google resolves the correct roof and imagery is available before launch. `NEXT_PUBLIC_SITE_URL` must point to the deployed site so PDF links open the new page.

The roof calculator starts with property confirmation, an optional explicit early contact submission, and project qualification. Roof, siding and gutter calculators collect/review contact details before final delivery. `POST /api/calculator-drafts` sends contact details only after the customer clicks “Send details & continue”; no abandoned-field scraping is used. CRM integrations should merge draft and completed requests by `journeyId`. Optional browser saving uses tab-scoped sessionStorage, expires after 24 hours and can be cleared. Never treat a saved draft as an estimate request or marketing/SMS consent.

`POST /api/calculator-leads` recalculates the range server-side, forwards the signed lead, generates a branded PDF and requests delivery through Resend. Qualified roof reports have a second page with material comparisons, project priorities and assumptions. Phone is optional unless an inspection or phone call is requested. Success requires provider acceptance; CRM-accepted/email-failed responses are identified separately and the form retains all data. Configure `RESEND_API_KEY` and verified `ESTIMATE_EMAIL_FROM` plus CRM, Turnstile and Upstash variables. Retries reuse the submission ID and content-specific idempotency keys. No durable email retry worker is configured: failed delivery currently requires retry or staff follow-up. Render sample reports with `node --import tsx scripts/render-calculator-report.ts`.

All calculator property steps offer Google Places autocomplete, which fills street, city and ZIP from a selected Maryland street address. Enable Maps JavaScript API and Places API (New) on the Google project, and permit both in browser-key API restrictions. `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` can supply a separate referrer-restricted key; otherwise the existing embed key is used. Search loads only in the property step, requests address components only, and uses Google's built-in session handling. Missing credentials, network failure or API denial leave manual fields usable. Address suggestions are biased toward central Maryland; the returned state is checked explicitly. Selection does not establish address validation, roof measurements or driving-time eligibility.

Calculator rates in `lib/estimator.ts` remain draft assumptions. The on-screen copy, email and PDF call the output an illustrative planning range, not a quote. Approve actual rates and scope language before enabling this flow for live prospects. Do not insert an unverified price or lender term into the report.

`POST /api/leads` accepts JSON or URL-encoded HTML forms. Required fields: firstName, email, phone, address, zip, service. Optional fields: lastName, smsConsent (false by default), sourcePage, utm_source, utm_medium, utm_campaign, gclid, msclkid, submissionId. Website is a honeypot. JSON requests use turnstileToken when configured.

The server forwards a normalized payload with a UUID, timestamp and consent version. Headers: `X-WeRoof-Timestamp`, `X-WeRoof-Signature` (HMAC-SHA256 of `timestamp.body`) and `Idempotency-Key`. Configure your receiving CRM automation to verify the signature, reject timestamps older than five minutes, and deduplicate the idempotency key. Only a 2xx response counts as accepted. No automatic retries after ambiguous timeouts: the same request ID is reused when the homeowner retries. The endpoint times out after ten seconds, and does not log personal information.

Production requires Upstash REST credentials for shared rate limiting and Turnstile for enhanced JSON submissions. Non-JavaScript URL-encoded submissions use the same validation, honeypot, origin check and shared rate limit, and receive a 303 redirect only after CRM acceptance. An error responds with a plain HTML recovery page. Do not configure a client-accessible CRM URL or secret.

## Analytics

Set the GTM ID to enable the opt-in analytics prompt. Configure GA4 and Consent Mode within GTM. Events: form_start, form_step_complete, generate_lead, click_to_call and financing_cta. No form contents go to analytics. Optional CallRail loading is consent-gated; configure the GTM tags and CallRail account independently. Call tracking requires the actual provider URL. Consent selection is stored locally. Provider-level cookie blocking and regional policy should be reviewed in the configured container.

## Launch gate

`SITE_LAUNCH_READY=false` keeps preview pages noindex. Set it true only on the production deployment after the final content and integration review. Unverified location pages remain noindex and outside the sitemap until their unique local evidence is approved in Sanity. This prevents draft local pages from being indexed. Review business address, license, experience, insurance, photos, review rights, price terms, financing, privacy and SMS text.

Deploy with Vercel after selecting the user's actual project/account. Configure env vars, run production tests, then connect apex/www while preserving email/MX/TXT records. Old Wix About, Services, Contact and Terms URLs redirect permanently. Submit `/sitemap.xml` through the domain's Search Console property after DNS and indexability are verified. No live website or DNS change has been made by this build.

## Diagram

Update: the user requested the exact supplied Owens Corning reference image instead of the custom SVG. The homepage, projects and roof-system pages now use `public/assets/roof-system-reference.png` unchanged (640 × 367 pixels), capped at its native display width. No layer animation runs. Expandable explanations are server-rendered HTML. Obtain the original high-resolution artwork and confirm publication rights/product applicability before launch. Run `node scripts/verify-roof-reference.mjs` for the replacement-specific checks; the original browser script's animated-roof assertions describe the superseded version.

Artwork is authored in `components/RoofArt.tsx`. RoofSystem progressively enhances it with a short sticky sequence on desktop. Eight HTML controls and four explanation stages cover all layers. Mobile/reduced motion and `/roof-system` expose the complete exploded diagram and readable explanations. The default server output contains all educational text. The artwork is generic, not a manufacturer installation specification.

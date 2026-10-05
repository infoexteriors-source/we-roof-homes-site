# WeRoof UI audit and implementation

September 21, 2026. Local preview only; no live domain or DNS changes.

## Outcome

The site had a considered homepage but generic text-first interior pages. The Impeccable critique and technical audit drove a site-wide refinement, preserving the user's native Apple typography, medium-weight headings, eagle branding, reference roof illustration, manufacturer logos and hero scroll interaction.

The original design critique scored usability 27/40. This was a qualitative assessment, not a conversion score. A fresh visual review found no must-fix regressions after implementation; no unsupported new numerical design score is claimed.

## Reference study

| Reference | Useful pattern observed | WeRoof adaptation |
| --- | --- | --- |
| [Erie Home](https://eriehome.com/) | Strong residential imagery, visible estimate path, separated financing information | Photo-led Services, About, Financing and service-detail openings; immediate inquiry CTA; clear qualifiers retained |
| [Home Genius Exteriors](https://homegeniusexteriors.com/) | Prominent inspection form, recognizable service presentation, explanatory benefits | Readable form with explicit progress, contextual service defaults and grouped service selection |
| [Roof Simple](https://roofsimple.com/) | Plain-language roofing focus, compact initial request, expectation-setting | Repair-versus-upgrade service groups, direct form links and concrete estimate information |

These are design observations, not a claim that WeRoof has better conversion performance. No competitor photos, reviews, ratings, certification claims, or proprietary copy were imported. Some competitor lower-page assets were deferred in browser captures, so missing reference imagery was not treated as a verified defect.

## Verified findings and changes

| Priority | Before | Implemented |
| --- | --- | --- |
| P1 | Services was seven similarly weighted text entries under an empty hero | Photo-led opening, repair/recovery and replacement/upgrade groups, dedicated inspection entry, stronger closing CTA |
| P1 | Mobile Contact form began 1,282–1,346px below page start | Form-first mobile layout; now approximately472px at390px width; shared primary CTA anchors directly to the form |
| P1 | Homepage service photo failed to render | Local optimized roofing photograph; source retained and documented; unrelated solar-installation image no longer used |
| P2 | Form labels11px, controls12px desktop, consent9px, progress8px | Labels14px, controls16px, consent12px, progress11px; clear step-one button and visual progress indicator |
| P2 | No active navigation,32px menu toggle, small links, no Escape dismissal | Active page/section indication,44px toggle,48px mobile links, Escape closes menu and restores toggle focus |
| P2 | Mobile navigation unavailable without JavaScript | Existing server-rendered links exposed as a wrapping navigation; inert toggle hidden |
| P2 | Form Back removed the focused button without moving focus | Focus returns to ZIP; entered values preserved; step-two service/ZIP recap added |
| P2 | Persistent mobile CTA competed with visible form | Bottom action strip hides while any inspection form is in view; safe-area padding retained |
| P2 | “Work speaks for itself” area contained a quote-like placeholder, not proof | Three concrete estimate topics replace the placeholder when verified projects are absent |
| P2 | Repeated pale-green template on every interior page | Warm neutral tokens, photo-led openings, shorter Contact opening, article contents links, distinct directory closing section, distraction-free legal pages |
| P2 | Roof/FAQ clickable summaries smaller than their apparent rows | Padding moved to summaries; interactive rows exceed44px |
| P3 | Small footer/auxiliary navigation and heavy visual drift | Readable footer links, unified form/control styles, retained500-weight headlines, neutralized green cast |

## Verification

- Production build passes. Five lead validation/API unit tests pass.
- 33 routes ×1440px and360px:66 views, all HTTP200; zero axe WCAG2A/AA/2.1AA violations, page overflow, missing image alt attributes, H1/heading defects, or JavaScript errors in the scan.
- All57 tested image instances loaded after scrolling, across17 representative pages including service routes.
- Separate visual review: Home, Services and Contact at1440px and390px; no must-fix layout regression.
- Menu Escape/focus, current-page indicators, form Back/focus, no-JavaScript menu/form, and mobile action-strip behavior verified.
- Mocked browser lead delivery: failure retains data and remains on Contact; confirmed mock acceptance redirects; no real lead was submitted. SMS remains optional and unchecked.
- Hero-motion regression passes desktop, mobile, compact360px, reduced motion and JavaScript-disabled modes. Stable form controls retained.
- Final FAQ target-height check passes after increasing clickable rows.

Evidence: `artifacts/ui-audit/technical-baseline.json`, `technical-after.json`, `interactions-after.json`, and accompanying assessment notes. `scripts/audit-ui-technical.mjs` and `scripts/verify-hero-motion.mjs` are repeatable checks. The deterministic design CLI reported one false-positive warning about a top border. Its live visual overlay was unavailable because DESIGN.md was missing; no overlay result is claimed.

## Remaining launch inputs and honest limits

1. Real completed-project photographs and attributable customer reviews are the biggest remaining credibility improvement. Current illustrative photography must not be relabeled as WeRoof project evidence.
2. Actual offer eligibility, lender disclosures, installed products, manufacturer-mark permissions and business/license details still need approval.
3. Real CRM/Turnstile/shared-rate-limit credentials and a controlled accepted live lead test remain required. Mocked UI acceptance is not proof of production CRM delivery.
4. Real-device Safari/Android, screen-reader review and a fresh production Core Web Vitals measurement remain launch checks. Automated axe results are not a claim of complete accessibility conformance.
5. Mobile pages remain content-rich. Real user testing can determine which explanations to shorten; no claimed conversion lift or competitor superiority is measurable yet.
6. PRODUCT.md now captures the previously approved brief. DESIGN.md can be generated with Impeccable document to formalize the refined token/component system for future passes.

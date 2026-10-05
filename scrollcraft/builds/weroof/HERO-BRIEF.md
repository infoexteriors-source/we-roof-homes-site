# Hero-only Scroll Craft revision

User request: “add scroll craft in hero section involving a roof”. Reuses the approved WeRoof brief, existing roof photography, red brand accents, system typography, offer and form. Does not reopen the replaced roof diagram or redesign other sections.

Grammar remains the existing inspection dossier. A short natural-flow hero gives immediate access to the form; no pinning, extra scroll distance, hidden heading or moving controls. The other page grammars would require changing navigation, sequence or ending outside the requested scope. This is a revision, not a new independent fingerprint: it deliberately shares navigation, grammar and close with the original.

Feeling curve: recognition at the existing roof photograph → curiosity as a foreground roof edge comes forward and its ridge line draws → confidence as the view settles into the trust strip. Peak/tell-someone sentence: “It’s the site where the roof comes forward and its edge traces as you scroll, while you can still request an inspection.” No empty-scroll silence.

Layer contract:
- Background: existing documentary roof photograph, modest 50px travel and 5% scale change. Not represented as a verified completed project.
- Foreground: clearly graphic shingle/eave silhouette, independently moving 70px toward the viewer. No extracted duplicate photo subject; no claim of a manufacturer detail.
- Detail: thin brand-red roof-edge trace, driven by the same normalized progress, no glow or autoplay.
- Copy/form: ordinary HTML in flow, no transform, no fading and no pointer interception.

Mobile: shorter photo movement, shallow foreground roof edge kept behind the form. Reduced motion/no JavaScript: complete static composition. Motion stops offscreen and listeners clean up on navigation. Use a tiny page-local driver rather than mounting the shared engine, whose global persistent listeners lack a destroy API needed by App Router. Shared engine is not modified. Four-device and new-site fingerprint quotas do not apply to this expressly hero-only revision.

Score: photographic camera drift → foreground roof approach + edge trace → natural-flow exit. Existing services/FAQ/form remain unchanged.

Verification: production build passes. Headless Chrome checks desktop 1440×1000, mobile 390×844, compact 360×640, reduced motion and JavaScript disabled. Opening/middle/exit screenshots are in `artifacts/hero-motion`; actual photo/foreground transforms differ with scroll while the form transform stays `none`. No console errors or horizontal overflow; automated hero contrast/accessibility check passes. ZIP/service keyboard progression still reaches contact fields. Real-device touch/Safari testing remains a launch check.

Visual feel-check: opening reads familiar; the midpoint adds depth and the red edge focuses attention on the roof; the normal-flow exit keeps the inspection offer practical rather than cinematic. The graphic foreground is intentionally an architectural accent, not another manufacturer diagram or project photograph. No new images/video were generated. The short mobile motion is subordinate to the form. No added pinned span.

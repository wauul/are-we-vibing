# R We Vibing — visual system

The redesign applies [TypeUI fundamentals](https://github.com/bergside/typeui/tree/main/skills/fundamentals), MIT licensed, to the existing music identity.

- Palette: paper #f7f3e8, ink #202923, orange #b84222, forest #48695b, support text #62665c.
- Typography: Arial/system sans for controls and display; Georgia for the expressive accent and verdict. Primary copy 16px+, supporting copy 14px+, small metadata 10–12px.
- Rhythm: 4/8/12/16/24/32/48/64/80px; distinct spacing within controls, between content, and between sections.
- Buttons: 44px minimum target, visible keyboard focus, loading label, disabled state, subtle hover/press response. Save is the primary result action; sharing is secondary.
- Motion: existing record and matching animation preserved; reduced-motion disables decorative animation.
- Layout: mobile single column; results combine the score and participants on desktop. Safe-area padding is preserved.
- Export: isolated 480×600 composition rendered outside document flow, exported at 2× (960×1200). Fixed pixel units prevent html-to-image's detached SVG clone from resolving container units against a different ancestor. No generated image is injected into the results page. Android still saves through the existing Gallery plugin; browsers download PNG.
- QA: inspect landing/session/friends/results, narrow-screen overflow, long-name wrapping, exported PNG, download feedback and absence of duplicate image, TypeScript and production build.

Decorative lettering on the record artwork and image-card masthead intentionally uses small print; all actionable content has readable equivalents in the page.

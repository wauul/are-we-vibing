---
name: "R We Vibing? — Mixtape Exchange"
description: "Two tastes become a collectible shared mix."
colors:
  "bg": "#f3f3ef"
  "surface": "#fff"
  "quiet": "#e9e9e4"
  "ink": "#242426"
  "muted": "#626267"
  "line": "#ceced0"
  "accent": "#b83e16"
  "on-accent": "#fff"
  "orange": "#ed642f"
  "side-b": "#62354b"
  "focus": "#62354b"
  "error": "#ab2735"
  "error-bg": "#fff0f2"
  "success": "#236648"
  "success-bg": "#edf7f1"
  "dark-bg": "#171719"
  "dark-surface": "#222225"
  "dark-quiet": "#2c2c30"
  "dark-ink": "#f4f4ef"
  "dark-muted": "#b8b8be"
  "dark-line": "#49494f"
  "dark-accent": "#ff986b"
  "dark-on-accent": "#231710"
  "dark-side-b": "#d7aac4"
  "dark-focus": "#f2c77d"
  "dark-error": "#ff9ba8"
  "dark-error-bg": "#3b242b"
  "dark-success": "#8ed6b5"
  "dark-success-bg": "#22362c"
  "art-paper": "#f7f0e7"
  "art-ink": "#242426"
  "art-orange": "#ed642f"
  "art-plum": "#62354b"
  "art-pink": "#edc9d7"
  "cover-ground": "#2a202c"
  "scene-ground": "#302932"
  "scene-deck": "#201d25"
  "art-peach": "#ed986c"
typography:
  "display":
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "clamp(4rem, 6.5vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  "display-mobile":
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "3.45rem"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  "headline":
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "3rem"
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  "headline-mobile":
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  "section":
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "2rem"
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  "title":
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  "body":
    fontFamily: "Manrope, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  "label":
    fontFamily: "Manrope, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.6
  "button":
    fontFamily: "Manrope, sans-serif"
    fontSize: "14px"
    fontWeight: 750
    lineHeight: 1.4
  "cover-score":
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "136px"
    fontWeight: 750
    lineHeight: 1
    letterSpacing: "-5px"
rounded:
  "control": "6px"
  "panel": "12px"
  "compact": "4px"
  "selection": "8px"
  "circle": "50%"
spacing:
  "4": "4px"
  "8": "8px"
  "12": "12px"
  "16": "16px"
  "20": "20px"
  "24": "24px"
  "28": "28px"
  "32": "32px"
  "40": "40px"
  "48": "48px"
  "56": "56px"
  "64": "64px"
  "72": "72px"
  "80": "80px"
  "96": "96px"
components:
  "button-primary":
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 21px"
  "button-primary-hover":
    backgroundColor: "color-mix(in srgb, var(--accent), var(--ink) 12%)"
  "button-primary-dark":
    backgroundColor: "{colors.dark-accent}"
    textColor: "{colors.dark-on-accent}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 21px"
  "button-outline":
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 21px"
  "button-outline-hover":
    backgroundColor: "{colors.quiet}"
  "button-text":
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "8px 4px"
  "button-icon":
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    size: "44px"
  "field":
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "13px 15px"
  "field-disabled":
    backgroundColor: "{colors.quiet}"
    textColor: "{colors.muted}"
  "genre-chip":
    textColor: "{colors.ink}"
    rounded: "{rounded.compact}"
    padding: "3px 8px"
  "task-card":
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "32px"
  "task-card-dark":
    backgroundColor: "{colors.dark-surface}"
    textColor: "{colors.dark-ink}"
    rounded: "{rounded.panel}"
    padding: "32px"
  "navigation":
    textColor: "{colors.ink}"
    padding: "24px 40px"
  "side-a":
    textColor: "{colors.accent}"
    rounded: "{rounded.circle}"
    size: "44px"
  "side-b":
    textColor: "{colors.side-b}"
    rounded: "{rounded.circle}"
    size: "44px"
  "ruled-track":
    textColor: "{colors.ink}"
    padding: "14px 0"
  "feedback-error":
    backgroundColor: "{colors.error-bg}"
    textColor: "{colors.error}"
    rounded: "{rounded.control}"
    padding: "14px 16px"
  "feedback-success":
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.success}"
    rounded: "{rounded.control}"
    padding: "14px 16px"
  "share-cover":
    backgroundColor: "{colors.cover-ground}"
    textColor: "{colors.art-paper}"
    padding: "30px"
    width: "480px"
    height: "854px"
---

# Design System: R We Vibing? — Mixtape Exchange

## Overview

**Creative North Star: "Mixtape Exchange"**

Mixtape Exchange treats a two-person music comparison as passing a record sleeve between listeners. Orange listening equipment, circular A/B labels, vinyl and an illustrated music universe make that exchange recognizable. The retained orange waveform ties the brand in the header, footer and shared-cover masthead to the existing product identity.

Bricolage Grotesque supplies expressive, tightly set display lettering; Manrope keeps repeated tasks and longer reading comfortable. Spacious split compositions introduce the experience, while ruled music rows, compact forms and record-label identities keep input, listening and Music Circle useful. Panels are calm and tonal; most dimensional depth belongs to the original artwork.

The interface has semantic light and dark themes. The collectible cover keeps its own print palette in either theme and uses the same component and assets for preview and export. Motion is visibly musical, with reduced-motion and offscreen handling; the interface has no manual animation pause/resume controls. English and French are persistent interface choices; identities, song titles and stored AI text retain their original content.

**Key Characteristics:**

- Orange waveform, tactile listening objects and vinyl.
- Circular A/B contribution markers and ruled music lists.
- Bricolage Grotesque display with Manrope reading text.
- Semantic light/dark surfaces around fixed collectible artwork.
- Noticeable musical motion with reduced-motion and offscreen handling.
- Compact bilingual navigation and full participant identities.

The normative token values above come from [globals.css](src/app/globals.css) and the components cited in the sidecar. The selected world and confirmed refinements are recorded in [DIRECTION.md](artifacts/DIRECTION.md) and [QUALITY_BAR.md](artifacts/QUALITY_BAR.md). This document records the current implementation; final review disposition belongs to [current-finish-review.md](artifacts/review/current-finish-review.md).

## Colors

Warm label orange, plum and cream give the listening objects character; neutral semantic surfaces make task content legible in both themes. The frontmatter contains each default light value, each dark override and the separate fixed artwork colors.

### Primary

- **Listening accent** (accent / dark-accent): primary actions, Side A, selected music source, focused brand punctuation and active progress rules. On-accent supplies its text.
- **Label orange** (orange / art-orange): fixed waveform badge and physical listening material; it is brighter than the light-mode action accent.

### Secondary

- **Second-side plum** (side-b / dark-side-b): Side B and the second contributor's genre presence. Focus uses plum in light mode and the dark-focus warm highlight in dark mode.
- **Artwork plum and pink** (art-plum / art-pink): fixed record labels, sculptural objects and linked musical worlds. Artwork peach is the fixed highlight for notes, moons and Side A in the cover.

### Neutral

- **Page, paper and quiet surfaces** (bg / surface / quiet and their dark siblings): page ground, active form panels and quieter social/award containers.
- **Reading ink, supporting text and rules** (ink / muted / line and their dark siblings): main content, help text and thin dividers.
- **Artwork paper and ink** (art-paper / art-ink): fixed cream print and carbon vinyl. Cover ground, scene ground and scene deck are distinct fixed plum grounds, independent of the app theme.

### Semantic feedback

Error and success each have foreground and background pairs in both themes. Keep the icon and message with the color; feedback is never conveyed by color alone.

### Named Rules

**The Artwork Palette Rule.** Keep collectible artwork colors fixed across light/dark modes; use semantic theme colors for surrounding controls and reading surfaces.

**The Two Sides Rule.** Use the established A/B relationship consistently through input, invitation, waiting, matching, summaries and awards. Both complete participant identities must remain visible where those identities are shown.

## Typography

**Display Font:** Bricolage Grotesque, with sans-serif fallback.
**Body Font:** Manrope, with sans-serif fallback.

Both are self-hosted variable fonts loaded in the root layout, with their OFL license files in the font directory. There is no separate mono face. The display has a compact, expressive rhythm; the reading face is steady and open.

### Hierarchy

- **Display:** the display token is the desktop home title; display-mobile is the final phone override. The desktop size is fluid, with tight tracking and near-solid leading.
- **Headline:** headline sets general page titles; headline-mobile is the general phone title. Session context, sign-in and Music Circle have source-specific responsive overrides rather than one invented universal clamp.
- **Section / Title:** section supplies the default section heading; title supplies default item headings. Result detail headings use more relaxed leading (1.25), and award headings use 1.2 to accommodate longer text.
- **Body:** the body token is the base reading size and rhythm. Ordinary paragraphs are capped at 68 characters; legal prose uses 1.8 leading.
- **Label / Button:** label is for native form labels; button is the common action label. Help and supporting copy use the observed 12–15px roles according to context, rather than reducing primary reading text.
- **Cover score:** cover-score belongs only to the fixed export composition. A score of 100 reduces the number to 120px with -4px tracking. Participant names have explicit length-based sizing and wrap; the complete identity is retained. The verdict and award title are bounded artwork excerpts, with full content available in the result surface.

### Named Rules

**The Reading Voice Rule.** Use Bricolage Grotesque for display, headings and record labels; use Manrope for task text, controls and legal reading. Small cover print is specific to the artwork and must not set the size of actionable interface text.

## Layout

The app uses centered reading and task containers. Home, header and footer have a 1280px maximum; session, results and friends use 1160px; single-flow and legal reading surfaces use 760px. Desktop page gutters are generally 40px, single-flow gutters 32px and phone gutters 20px. Header padding includes the top safe area; footer padding includes the bottom safe area.

Desktop home is a two-column introduction. Session entry pairs a smaller context column with the form (0.8fr / 1.2fr). The current result uses a cover/details split (0.9fr / 1.1fr) with a 40px gap; its outer surface is open rather than one large filled card. Ruled track rows and stacked participant summaries organize reading. The observed spacing rhythm is in the frontmatter; it is an extracted set of repeated values, not a pre-existing spacing-variable API.

At 1024px and below, gaps and artwork reduce. At 767px and below, major splits stack, gutters tighten and results put the portrait cover before details. The phone home order is title, supporting text, scene and full-width action. New Session retains a compact heading/kit pairing beside the form; its final artwork widths are 164px, reducing to 124px below 350px. Music Circle friend cards remain a deliberate two-column phone grid; history, detail, listening and award groups stack.

At 370px and below, the header uses 16px horizontal padding, a smaller brand and a 50px language control. Music Circle navigation becomes an accessible icon, and the desktop New Session header button hides below 767px. Native select and theme button retain their compact targets. Short controls fit both EN and FR; long identities and recommendations wrap rather than widening the page.

The shared cover has fixed geometry (480 × 854px). The live preview scales that geometry to a maximum width of 360px; export renders it at 2× (960 × 1708px). Keep fixed pixel geometry and a top-left scale origin so the exported clone and live preview use the same composition.

## Elevation & Depth

Depth is a hybrid: quiet surfaces and thin rules organize task content, while generated listening objects and record grooves carry dimensionality. Form panels and standard social containers do not acquire a default shadow. The source defines a reusable soft shadow, but current major task cards are flat.

### Shadow Vocabulary

- **Available surface shadow:** the --shadow custom property changes with the theme; its exact light/dark values are preserved in the sidecar. It is not a mandate to shadow all cards.
- **Record identity:** a soft lower shadow gives the vinyl avatar physical presence; pointer hover increases it.
- **Portrait cover:** a diffuse shadow separates the scaled cover from the page.
- **Scene vinyl:** the A/B records have a soft physical shadow against their fixed artwork ground.

### Named Rules

**The Tonal Surface Rule.** Let surface, quiet and line separate task content. Reserve soft shadows for the physical artwork, record identities and scaled cover; do not spread card shadows across every section.

## Shapes

Controls have restrained small corners (control); form and social panels use panel; genre tags use compact; source selections and suggestion panels use selection. A/B markers, waveform badges, record labels, trophy rings and orbits are circular. Thin rules are native to this world: they structure track lists, genre comparisons, progress and legal/footer boundaries.

The listening scene has one asymmetric sleeve corner (16px / 72px / 16px / 16px); compact waiting/matching scenes use 10px / 48px / 10px / 10px. Preserve those scene silhouettes without applying oversized corners to normal form fields. The artwork and export use clipping where needed for their contained composition; readable dynamic identities remain allowed to wrap.

## Components

### Buttons

Actions are compact and confident. Primary buttons use accent/on-accent, control corners and the frontmatter padding, with a 48px minimum height; large home actions use 54px. Outline actions use a thin line border and quiet hover fill. Text actions are underlined with a 44px minimum target. Icon buttons are at least 44px in both dimensions.

Hover darkens the primary with a small ink mix; pointer-capable hover lifts buttons 2px. Press scales them to 0.97. The final common transition is 180ms with the source easing. Disabled actions use quiet/muted/line. Keyboard focus is a 3px focus outline with 4px offset.

### Chips

Genre tags are compact, non-interactive labels: thin line border, compact corners and the frontmatter padding. They wrap with a 6px gap. Do not give them selected or filter states that the implementation does not have.

### Cards / Containers

Form panels use surface with panel corners and 32px padding, reducing to 24px vertical / 20px horizontal on phones. Award and social cards use quiet, comfortable padding and no general card shadow. Music Circle combines record-label avatars, original sharing art and image-backed mix history; profile editing stays behind a native disclosure.

### Inputs / Fields

Native fields use surface/ink, a thin line border, control corners and a 50px minimum height. Hover raises border contrast; focus changes it to focus and retains the visible keyboard outline. Invalid input uses error; disabled and read-only fields use quiet. Textareas resize vertically and start at 160px tall.

Manual music suggestions are in document flow, keyboard operated and bounded by a scrollable list. Selected suggestions receive a focus outline inside the row. Source selection is a three-column group with distinct outline icons; the active source uses accent/on-accent rather than only a small label change.

### Navigation

The waveform and product name lead the header. Music Circle, EN/FR native select and one sun/moon button precede the desktop New Session action. The theme button exposes its pressed state, persists an explicit light/dark choice and otherwise follows the operating system; it has no dropdown. The language select persists through a functional cookie and local storage, updates document language and is server-rendered on return.

Translate navigation, known errors, legal reading, sharing and accessible labels. Language selection updates context without discarding form values. Keep proper names, music and stored AI copy intact. Footer Terms and Privacy links remain present and crosslink their reading pages.

### A/B markers and ruled music lists

Circular A/B labels distinguish contributors with accent and side-b while the letter itself carries meaning. The mix marker overlaps two outlined circles. Recommendations use numbered rows with a top and bottom rule, comfortable target height and wrapping titles. Only genuine external links retain an external-link icon.

### Listening scenes, trophies and recovery art

Use the original record player for home, waiting and matching; use the headphone/record kit for entry and the listening pair for Music Circle. Waiting makes the second side pending; matching brings the two records together. Real status text and actions remain beside decorative motion.

Title-selected trophies use a bounded vocabulary: moon for after-hours, aux cable for selector/DJ, disco ball for dance, microphone for vocals/lyrics, compass for exploration, split heart for romantic/heartbreak, guitar for rock, sun for sunshine, headphones for listening and vinyl for unfamiliar titles. Selection reads the stored title; it is not a live image-generation service.

Recovery has three distinct subjects: saved records and replay for retry, safely stored records and a spent hourglass for exhausted attempts, and a locked vinyl envelope for protected invitations. They animate automatically; the hourglass conveys exhausted attempts without claiming a reset timer.

Normal motion includes four-second player sway, six-second record turns, rising notes, trophy lift/rotation, flowing music streams and a shooting star. Route/scroll arrival, source choice, feedback and loading have short state animations. Source-specific motion values and keyframes are in the sidecar. Reduced motion stops decorative animation and transitions; offscreen observed surfaces pause. There are no manual animation pause/resume controls, by the latest confirmed user instruction.

### Shared cover

Preview and PNG export render ShareableResultCard with the same assets, names, score, verdict excerpt and title-selected awards. The preview alone animates; the export is static. Both preserve the waveform masthead and fixed print palette. Keep artwork identities and the print footer unobstructed.

## Do's and Don'ts

### Do:

- **Do** preserve the orange waveform in every brand lockup, including the share cover.
- **Do** use semantic light/dark tokens for the interface and fixed artwork tokens for the collectible cover.
- **Do** keep A/B contribution markers, ruled song lists and complete participant identities clear.
- **Do** use the same shared-cover component, illustration and fixed geometry for preview and static export.
- **Do** choose trophy art from the award title's meaning and use vinyl for unfamiliar titles.
- **Do** give retry, exhausted attempts and protected invitations their distinct saved-record, record-case and locked-envelope imagery.
- **Do** retain visibly musical motion, reduced-motion support and automatic offscreen pause.
- **Do** translate interface, legal, share and accessible labels for EN/FR while retaining names, songs, entered fields and stored AI content.
- **Do** keep short labels concise, full-sentence punctuation intact and external-link cues on actual external links.

### Don't:

- **Don't** restore the removed decorative flow/home side stripes or scene grid.
- **Don't** add manual animation pause/resume controls.
- **Don't** introduce a theme dropdown; the chosen appearance control is one two-state icon button.
- **Don't** turn fixed album-art colors into theme-dependent interface colors.
- **Don't** truncate participant identities to make the cover or awards fit; allow wrapping and the implemented bounded size adjustment.
- **Don't** use system display typography, fake technical lettering, glyph icons or invented kickers.
- **Don't** replace meaningful award subjects with one identical trophy or promise bespoke generation for every title.
- **Don't** imply a countdown or automatic reset from the exhausted-attempt hourglass.
- **Don't** use fabricated portraits, statistics, endorsements or scientific claims for the playful score.
- **Don't** impose tiny decorative cover metadata sizes on task controls or legal reading.

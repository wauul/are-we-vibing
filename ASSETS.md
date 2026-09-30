# Music artwork

The record player, ten trophy illustrations, two workflow illustrations and three recovery illustrations were generated with the built-in image generation tool for this project. The collectible cover uses an original illustrated music universe, informed by the user's request for the layered geometric visual language of Kurzgesagt. It does not reuse their artwork or mascots. The app's orange, plum, pink and cream remain the palette anchors; turquoise appears inside the second musical world.

Production files live in `public/art/`. Exact prompts, generation method and derivative information are saved beside every asset in its `.webp.json` file. The original generated PNGs are kept locally in ignored `artifacts/asset-source/`. Alpha is preserved on the isolated objects. Player, music-picks kit and recovery illustrations are 640px wide; friends artwork is 960 × 640; trophy images are 320px wide; the cover is 960 × 1708. All seventeen assets are served as compressed WebP; Next.js additionally sizes on-page illustrations.

Trophy selection reads the award title using `src/lib/trophy-art.ts`. After-hours and night-owl titles use a crescent moon, aux-cord and DJ titles an audio cable, dance titles a disco ball, vocal or lyrical titles a microphone, discovery or eclectic titles a compass, heartbreak titles a split heart, guitar or rock titles a guitar, sunshine titles a sun. Sound/listening titles use headphones; unfamiliar titles use a vinyl sculpture. This is a bounded title-to-art vocabulary, not a live image service. Existing result JSON and old sessions need no migration.

The app preview and PNG export render the same `ShareableResultCard` component, illustration and text. Live motion drifts the illustrated universe, carries notes and dashed music streams between worlds, and animates stars, a moon and a shooting star. PNG export uses the static composition. Waiting and generating scenes have moving records, a dancing player, sound bars and travelling notes. Workflow artwork uses larger rocking movement, orbiting record-label dots and rising notes. Trophy sculptures sway and lift above their bases. Scroll reveals, source selections, taps, feedback and loading states also animate. Offscreen artwork pauses automatically; device reduced-motion preferences stop decorative motion. There are no animation pause/play buttons anywhere, per the user's latest request. The cover's art palette stays consistent in light and dark app modes, like an album cover; the surrounding interface uses its selected semantic theme.

| Asset | Role |
| --- | --- |
| `record-player.webp` | Home, waiting and generating scenes |
| `music-universe.webp` | Full illustrated share cover |
| `friends-exchange.webp` | Music Circle, sign-in and friends banner |
| `music-picks.webp` | New-session and join artwork |
| `saved-mix.webp` | Saved records and replay arrow for retry |
| `mix-rest.webp` | Safe record case and spent hourglass for exhausted attempts |
| `private-invite.webp` | Locked vinyl envelope for protected direct invitations |
| `trophy-night.webp` | After-hours / night owl |
| `trophy-aux.webp` | Aux cord / playlist curator |
| `trophy-dance.webp` | Dance / party / disco |
| `trophy-voice.webp` | Voice / lyrics / singing |
| `trophy-explorer.webp` | Discovery / genre exploration |
| `trophy-heart.webp` | Heartbreak / romantic / emotional music |
| `trophy-rock.webp` | Guitar / rock / riffs |
| `trophy-sun.webp` | Sunshine / upbeat music |
| `trophy-headphones.webp` | Listening / sound |
| `trophy-vinyl.webp` | General music award fallback |

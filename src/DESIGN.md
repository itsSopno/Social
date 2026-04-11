# Design System Document: Kinetic High-Contrast Editorial

## 1. Overview & Creative North Star

### Creative North Star: "The Obsidian Edge"
This design system is built for high-performance impact. It rejects the soft, approachable aesthetics of traditional SaaS in favor of an **Aggressive Tech-Forward** identity. It is designed to feel like a high-end gaming peripheral—precision-engineered, dark, and lethal. 

The system breaks from the "template" look by utilizing heavy typographic weight, sharp 0px corners, and "Neon-on-Obsidian" contrast. We avoid traditional grid-based boxing in favor of expansive, cinematic layouts where imagery and typography overlap to create a sense of depth and momentum. This is an editorial experience for the digital age: bold, premium, and unapologetically edgy.

---

## 2. Colors

The palette is anchored in deep blacks to maximize the "pop" of the neon accents. Contrast is not just a requirement; it is the primary design tool.

### Core Tones
*   **Surface (Obsidian):** `#131313` — The foundation. High-end, deep, and void-like.
*   **Primary (Neutral Silver):** `#c6c6c6` — Used for functional elements to maintain a tech-industrial feel.
*   **Secondary/Tertiary (Neon Lime):** `#c3f400` / `#2ae500` — The "high-voltage" accent. Use these sparingly for CTAs, highlights, and critical path indicators.

### The "No-Line" Rule
Traditional 1px borders are strictly prohibited for sectioning. Structural boundaries must be defined through background shifts. For example:
*   Use `surface-container-low` (`#1c1b1b`) to separate a footer from a `surface` (`#131313`) body.
*   The transition between content blocks should feel like tectonic plates shifting—solid, heavy, and defined by color value rather than strokes.

### Surface Hierarchy & Nesting
Layering follows a "Deep-to-Surface" logic.
1.  **Foundation:** `surface-container-lowest` (`#0e0e0e`) for the deepest background layers.
2.  **Base:** `surface` (`#131313`) for the main content area.
3.  **Elevated:** `surface-container-high` (`#2a2a2a`) for interactive modules or focused cards.

### Signature Textures
Main CTAs and hero backgrounds should utilize a subtle vertical gradient from `tertiary` (`#2ae500`) to `tertiary-container` (`#000000`) at 15% opacity to provide a "lit from within" tech glow.

---

## 3. Typography

The typography strategy is built on extreme contrast between the "Aggressive" display face and the "Precise" body face.

*   **Display & Headlines (Space Grotesk):** Modern, condensed, and powerful. These should be set with tight letter-spacing (`-0.02em` to `-0.05em`) to evoke a sense of high-speed performance. Use `display-lg` (3.5rem) for hero moments.
*   **Body & Titles (Inter):** Clean, utilitarian, and highly readable. Inter provides the technical "blueprint" feel that balances the aggressive headlines.
*   **Hierarchy as Identity:** Use `label-sm` (uppercase, tracked out) for metadata to create an "instrument panel" aesthetic.

---

## 4. Elevation & Depth

In this system, depth is a product of light and layering, not structural lines.

### The Layering Principle
Achieve lift by stacking surface tiers. A `surface-container-highest` (`#353534`) element sitting on `surface` (`#131313`) creates a physical presence. 

### Ambient Shadows
Shadows should be rare. When used, they must be "Neon Ambient." Instead of black shadows, use a 4% opacity shadow of the `tertiary` green to simulate the glow of a screen or a backlit LED. Use high blur (40px+) and 0 spread.

### Glassmorphism
For floating menus or tooltips, use `surface-bright` (`#3a3939`) at 60% opacity with a `20px` backdrop blur. This maintains the "tech-forward" feel while allowing the rich obsidian background to peak through.

### The "Ghost Border" Fallback
If a container requires a boundary (e.g., an input field), use the `outline-variant` token at 20% opacity. **Never use 100% opaque borders.**

---

## 5. Components

### Buttons
*   **Primary:** High-contrast `secondary-fixed` (`#c3f400`) background with `on-secondary-fixed` (`#161e00`) text. Sharp 0px corners.
*   **Secondary:** Ghost style. Transparent background with a `secondary` (`#ffffff`) "Ghost Border" (20% opacity).
*   **Hover State:** Shift from `secondary` to `tertiary`. The transition should be instant (0.1s) to feel responsive and "clicky."

### Cards
*   **No Dividers:** Separate header/body/footer of a card using `surface-container-low` vs `surface-container-high`.
*   **Image Handling:** Images should be high-contrast, desaturated, or treated with a dark overlay to ensure text remains legible and on-brand.

### Input Fields
*   **State:** Background `surface-container-highest`.
*   **Focus:** 2px solid `tertiary` (`#2ae500`) left-side border only. This "indicator bar" feels more like a diagnostic tool than a standard text box.

### Lists
*   Remove all horizontal rules. Use a `spacing-8` (1.75rem) vertical gap between items. Use `label-md` for list headers in uppercase `secondary` color.

---

## 6. Do's and Don'ts

### Do
*   **Do** use 0px border-radii for everything. Precision is key.
*   **Do** lean into asymmetry. Overlap a headline over an image to create an editorial feel.
*   **Do** use extreme scale. If a headline is big, make it massive.
*   **Do** use the Spacing Scale strictly to maintain a rhythmic "industrial" layout.

### Don't
*   **Don't** use soft shadows or rounded corners (this isn't a "friendly" app).
*   **Don't** use standard 1px grey dividers; they clutter the "Obsidian" purity.
*   **Don't** use multiple accent colors. Stick to the Neon Lime to maintain the signature identity.
*   **Don't** center-align long blocks of body text. Keep it flush-left for a rigid, engineered look.
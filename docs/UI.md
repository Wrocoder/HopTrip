Redesign the website using the visual language of the WartoMetr Decision Explorer. Preserve the new website’s existing content, functionality, and information architecture—transfer only the visual system, interaction style, and overall atmosphere. Do not copy WartoMetr’s wording or real-estate-specific components.

VISUAL DIRECTION

Create a calm, trustworthy, premium consumer interface with a subtle editorial feel. The design should feel human and reassuring rather than corporate, technical, or dashboard-like.

Use generous whitespace, strong typography, soft natural colors, rounded cards, thin borders, restrained shadows, and small warm accents. The overall experience should communicate clarity, credibility, and thoughtful decision-making.

COLOR SYSTEM

Use these colors as global design tokens:

* Page background: `#F5F7F2`
* Primary surface/card: `#FFFFFF`
* Primary text: `#1F302E`
* Secondary text: `#4E625D`
* Muted text and metadata: `#81908A`
* Borders and separators: `#DFE7DF`
* Light sage surface: `#D9E8D7`
* Medium sage accent: `#6D9C77`
* Primary green: `#38734E`
* Dark green: `#245C40`
* Coral accent: `#D97C5D`
* Light coral background: `#F7E3DA`
* Warm yellow highlight: `#F2CF72`

Apply colors according to these rules:

* Use `#F5F7F2` as the main page background.
* Use white for standard content cards.
* Use `#245C40` for the most important result, summary, or featured card.
* Use `#D97C5D` for one secondary highlight card or meaningful accent.
* Use `#F2CF72` sparingly for scores, key values, selected indicators, or important actions.
* Use sage colors for supporting states, icons, tags, focus rings, and subtle backgrounds.
* Avoid bright blue, pure black, saturated gradients, neon colors, and generic gray dashboard palettes.

TYPOGRAPHY

Use:

* `Fraunces`, Georgia, serif for large headings and important conclusions.
* `DM Sans`, system-ui, sans-serif for body text, navigation, controls, and labels.

Typography characteristics:

* Large headings should have slightly tight letter spacing around `-0.05em`.
* Use confident but not overly heavy weights.
* Body text should remain compact and highly readable.
* Use small uppercase labels with increased letter spacing for section numbers, categories, and status labels.
* Keep body text at 16px or larger where possible.
* Use 14px as the normal minimum for controls and frequently read labels.

SURFACES AND COMPONENTS

Use rounded cards with:

* Large card radius: `24px`
* Medium component radius: `16px`
* Inputs and compact controls: `8–11px`
* Pills and status badges: fully rounded

Standard card style:

* White background
* `1px` border using `#DFE7DF`
* Soft shadow: `0 18px 50px rgba(53, 78, 62, 0.09)`

Featured cards:

* Dark green background with white text
* Very subtle oversized circular line decoration in the background
* Soft green secondary text
* Warm yellow highlights

Accent cards:

* Coral background
* White text
* Pale coral supporting text
* Yellow used only for small highlights

INPUTS AND CONTROLS

Inputs should use an almost-white background such as `#FCFDFB`, thin sage-gray borders, dark green text, and compact rounded corners.

Focus state:

* Border color: `#6D9C77`
* Focus ring: `0 0 0 3px rgba(109, 156, 119, 0.12)`

Segmented controls should sit inside a pale sage container. The selected option should become white with a thin border and a small soft shadow.

Use compact pill-shaped chips for presets, filters, or categories. Their selected state should use a pale sage background with dark green text.

LAYOUT

Use a centered content container with a maximum width around `1160px`.

Prefer:

* Generous vertical spacing
* Strong visual hierarchy
* Asymmetric two-column sections
* Large cards grouped into clear decision-oriented blocks
* Content density that feels informative but never crowded

Avoid excessive navigation, heavy sidebars, dense tables, and generic dashboard grids unless required by the product.

The most important user result or action should be visually dominant and immediately recognizable.

DETAILS

Add an extremely subtle grain texture over the page at approximately `0.05` opacity to prevent the interface from feeling digitally flat.

Use:

* Thin separators
* Small status dots
* Compact badges
* Minimal line icons
* Gentle progress indicators
* Very subtle green-to-yellow-to-coral scales when displaying a range or comparison

Do not overuse icons, gradients, glass effects, or decorative elements.

MOTION

Keep animation understated:

* Transition duration: `200–300ms`
* Buttons and links may shift by 2–3px on hover
* Cards should not dramatically scale
* Interactive values and markers should move smoothly
* Respect reduced-motion preferences

RESPONSIVENESS

On mobile:

* Collapse multi-column layouts into a single column
* Reduce card radius to approximately `18px`
* Keep important controls visible near the top
* Preserve generous spacing without creating excessive scrolling
* Hide secondary navigation if necessary
* Never introduce horizontal scrolling

FINAL QUALITY

The finished interface should feel warm, modern, intelligent, and trustworthy—closer to a premium editorial consumer product than a SaaS administration panel.

Maintain accessible contrast and visible keyboard focus states. Use the palette consistently through reusable CSS variables or theme tokens. Do not merely recolor existing components: update typography, spacing, card hierarchy, borders, controls, and interaction states so the entire product shares the same visual language.

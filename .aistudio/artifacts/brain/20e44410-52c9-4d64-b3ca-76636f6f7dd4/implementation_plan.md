# Implementation Plan: Color Contrast, PostCard Layout Consistency & Social Card Margins

Fix text contrast issues in the share modal, resolve PostCard mobile layout wrapping, and fix Twitter landscape card margins and text overflow.

## User Feedback & Requirements Addressed

1. **Text Visibility & Color Contrast (Screenshot 1)**:
   - Theme button labels in the card modal have low contrast in dark mode (light text on pastel backgrounds).
   - Canvas preview element failed to draw immediately in dark mode on initial open.
   - Solution: Apply explicit high-contrast text colors (`text-slate-900` for pastel themes, `text-white` for Midnight plum), add clear border/active indicators, and ensure canvas renders synchronously when the modal opens.

2. **PostCard Layout Inconsistencies & Mobile Wrapping (Screenshot 2)**:
   - On mobile screens, the card footer wraps so the Share button drops to an isolated second line below reactions.
   - The card header expiration badge wraps underneath the author name in an unbalanced way.
   - Solution: Enforce single-row action bar on mobile with compact touch-friendly spacing (`flex-nowrap`, compact paddings, responsive text labels), and tighten the header so the avatar, alias, time, and expiration indicator remain on one clean line.

3. **Twitter Landscape Social Card Margins & Overflow (Screenshot 3)**:
   - In Twitter 16:9 mode (1200x630), the text overflows into the footer stats and clips outside the bottom card border.
   - Solution: Dynamically scale font size, line-height, and vertical spacing based on card aspect ratio and text length. Calculate available vertical space between divider and footer stats, dynamically reducing font size so every thought fits comfortably with ample breathing margins.

---

## Proposed Changes

### 1. `src/components/ghostline/share-card-modal.tsx`

- **Text Contrast Fix**:
  - Update theme swatch buttons with explicit text contrast colors:
    - Lavender, Sunset, Mint, Sakura: dark slate label (`#0F172A`)
    - Midnight: crisp white label (`#FFFFFF`)
  - Add explicit white background badge to theme buttons for high contrast in dark mode.
- **Canvas Rendering Timing**:
  - Add `requestAnimationFrame` or `setTimeout(..., 50)` on dialog open to ensure the `<canvas>` DOM node is attached and sized before drawing.
- **Twitter Landscape & Layout Margins**:
  - Recalculate layout metrics for `landscape` (1200x630):
    - Reduce card padding from 70px to 48px.
    - Reduce header top offset to 42px.
    - Reduce avatar size to 52px and divider spacing to 18px.
    - Calculate `availableHeight = footerY - contentStartY - 30`.
    - Auto-scale body font size between 22px and 36px based on line count and character length so text never collides with footer stats or clips outside the card.
    - Cap maximum lines or ensure text fits within the designated bounding box with at least 32px padding above footer stats.

### 2. `src/components/ghostline/post-card.tsx`

- **Single-Row Action Bar**:
  - Change the actions container to `flex items-center gap-1 sm:gap-2 flex-nowrap overflow-x-auto no-scrollbar`.
  - Use compact padding on mobile (`px-2 py-1` on mobile, `px-3 py-1.5` on desktop) so Love, Dislike, Replies, and Share fit on a single line across all mobile screen sizes.
  - Keep button labels responsive (e.g. icon + count, with "Replies" / "Share" label hidden on extra-small screens so nothing ever wraps).
- **Header Alignment**:
  - Group expiration badge and more options in a unified flex container `shrink-0 items-center gap-1.5`.
  - On narrow screens, format expiration indicator concisely (`20h 53m`) so it never pushes other elements onto broken lines.

### 3. `src/styles.css`

- Ensure `.post-card`, `.post-top`, and `.post-actions` have strict layout rules that prevent awkward line breaks and maintain consistent margins across light and dark modes.

---

## Verification Plan

### Automated Verification

- Run `npm run lint` to verify zero ESLint and Prettier errors.
- Run `compile_applet` to ensure TypeScript compilation passes.
- Run `npm test` to verify all test suites continue to pass.

### Visual & Interactive Verification

- Test Share Modal in both dark and light modes:
  - Verify theme buttons have clear high-contrast text.
  - Verify canvas renders immediately upon opening the modal.
  - Switch to "Twitter (16:9)" with a long thought and verify text scales properly and does not overlap footer stats or bleed off the bottom.
- Test PostCard on mobile viewport (360px - 420px):
  - Verify all 4 action buttons (Love, Dislike, Replies, Share) stay on a single balanced line.
  - Verify header avatar, name, timestamp, and expiration timer align cleanly without dropping to new lines.

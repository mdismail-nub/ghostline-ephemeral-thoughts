# Ghostline: Ephemeral Thoughts

Build Ghostline — Anonymous, Text-Only Social Network UI/UX

Act as a senior product designer and frontend engineer. Design and build a polished, responsive web application called Ghostline (working title), a global pseudonymous social network where users can share text-only thoughts, participate in conversations, and have their content expire after 24 hours.

Use the two attached reference images as the primary visual direction. Do not copy their original content or build a scooter-rental or SEO dashboard. Translate their design principles into a unique, cohesive social networking experience.

1. Product vision

Ghostline is a place to express thoughts without creating a permanent public identity.

Core principles:

- Pseudonymous identities instead of public real names.

- Text-only posts and conversations.

- Posts expire 24 hours after publication.

- Replies, reactions, and polls follow the parent post's expiration rules.

- Minimal data collection and privacy-conscious UX.

- A global community accessible from mobile and desktop.

- Light and dark theme switching.

The experience should feel modern, calm, approachable, premium, and privacy-focused. Avoid a generic Twitter/X clone.

2. Analyze and apply the uploaded design references

Reference 1: Mobile onboarding screens

Use the first attached image as inspiration for:

- Three-step onboarding.

- Large, friendly illustrations.

- Rounded mobile-screen layouts.

- Generous whitespace.

- Pastel lavender and sky-blue backgrounds.

- White content panels.

- Green or violet accent colors.

- Clear progress indicators.

- Large headings and concise supporting text.

- Prominent rounded CTA buttons.

- Skip and Next navigation.

Adapt the three onboarding steps to Ghostline:

Screen 1 — Say what you think

Explain that users can share thoughts under a pseudonym without displaying their real name.

Screen 2 — Conversations that fade

Explain that posts and replies are temporary and become unavailable after their 24-hour lifetime.

Screen 3 — Your space, your rules

Explain text-only conversations, privacy controls, blocking, and reporting.

Use original illustrations featuring abstract speech bubbles, floating text cards, clocks, and disappearing particles. Do not use scooter imagery or irrelevant stock illustrations.

Provide a functional onboarding carousel with Next, Back, Skip, and Get Started actions. Include accessible progress indicators and responsive layouts.

Onboarding should appear on the first visit and remain skippable. Do not repeatedly force returning users through onboarding.

Reference 2: Card-based dashboard

Use the second attached image as inspiration for:

- A clean horizontal navigation bar.

- Rounded white navigation containers.

- A spacious, pale background.

- A responsive grid of rounded cards.

- Small colorful icon containers.

- Subtle shadows and borders.

- Clear typographic hierarchy.

- Generous spacing.

- Minimal, uncluttered controls.

Adapt this visual system to a social feed and topic-discovery experience.

Do not reproduce the reference's four-column card grid everywhere. The main social feed should remain a readable, centered, single-column feed, while Explore can use a responsive grid of topic cards.

Maintain consistent radii, typography, spacing, icon sizes, and interaction states across the application.

3. Visual design system

Create a consistent design system with reusable tokens.

Typography

- Use Inter or a similarly readable modern sans-serif.

- Use clear, medium-weight headings.

- Keep post text comfortable to read.

- Use subdued secondary text for timestamps and expiration information.

- Avoid excessively large headings inside individual feed cards.

Light theme

- Background: soft off-white or pale blue-grey.

- Surfaces: white.

- Primary text: near-black.

- Secondary text: muted grey.

- Accent: refined violet or indigo.

- Supporting colors: pastel green, lavender, pale blue, and soft amber.

Dark theme

- Background: deep charcoal.

- Surfaces: slightly lighter charcoal.

- Primary text: off-white.

- Secondary text: muted grey.

- Accent: accessible violet or indigo.

- Preserve semantic colors and readable contrast.

Component styling

- Rounded cards, approximately 12–18px radius.

- Rounded primary buttons.

- Subtle borders and restrained shadows.

- Consistent spacing based on a 4px scale.

- Smooth, short transitions.

- Visible focus indicators.

- Clear hover, active, disabled, loading, and error states.

Use semantic design tokens so the theme switcher updates the entire application consistently. Do not duplicate components for light and dark themes.

4. Main application layout

Build a complete multi-page interface.

Desktop navigation

Create a clean, rounded top navigation bar inspired by Reference 2.

Left:

- Ghostline logo or a simple custom wordmark.

- A small abstract speech-bubble or fading-dot symbol.

Center:

- Home

- Explore

- Communities

Right:

- Compose Post button.

- Theme switcher.

- Pseudonymous user menu.

Keep navigation compact and uncluttered.

Mobile navigation

Use a responsive mobile layout with:

- A compact top bar.

- Ghostline wordmark.

- Theme toggle and profile menu.

- Bottom navigation for Home, Explore, Compose, and Profile/Settings.

- A floating compose button if it improves usability.

Ensure content is not hidden behind the mobile bottom navigation or device safe areas.

5. Required screens

A. Onboarding

- Three illustrated slides.

- Headline and concise supporting text.

- Progress dots.

- Skip, Back, Next, and Get Started actions.

- Responsive mobile and desktop layouts.

B. Home feed

- Centered, single-column feed with a comfortable maximum width.

- A prominent text composer at the top.

- Recent and trending feed tabs.

- Post cards displaying the pseudonym, timestamp, expiration countdown, and plain-text content.

- Reply, reaction, and report actions.

- Topic tags where appropriate.

- Clear loading, empty, and error states.

Use believable mock posts that demonstrate different content lengths and topics. Do not fill the feed with generic marketing copy.

C. Create Post

- Large, distraction-free text area.

- Maximum length of 280 characters.

- Live character counter.

- Optional topic selection.

- Publish and Cancel actions.

- Clear information that the post becomes unavailable after 24 hours.

- Disabled Publish button when the text is empty or invalid.

- Accessible validation messages.

Do not include image uploads, attachments, video, audio, or rich-media controls.

D. Post Detail

- Full post content.

- Author pseudonym.

- Time remaining.

- Replies in chronological order.

- Reply composer.

- Reaction controls.

- Report and block actions.

- Expired-post state that does not expose expired content.

E. Explore

Use a responsive card grid inspired by Reference 2.

Include:

- Trending topics.

- Popular conversations.

- Daily question.

- Topic categories such as University, Technology, Programming, Life, Ideas, and Random.

- Topic activity indicators based only on currently available content.

Each topic card should use a small colorful icon container, a title, a short description, and a clear action.

Never display expired posts in search results or trending sections.

F. Communities

- Community/topic cards.

- Community descriptions.

- Current discussion count.

- Join or leave controls.

- Empty states for new communities.

Keep community membership separate from public identity information.

G. Pseudonymous profile

- Generated alias, such as "QuietFox42".

- Alias customization if enabled.

- Current posts and active replies.

- Account expiration information.

- Rotate identity or create a new temporary identity action.

- Delete account action.

Do not include a real-name field, profile-photo upload, permanent follower count, or personal biography.

H. Settings and privacy

- Light, dark, and system theme options.

- Pseudonym and identity lifecycle settings.

- Blocked identities.

- Account deletion.

- Sign out.

- Privacy explanation.

- Content expiration explanation.

Clearly distinguish automatic post expiration from account deletion.

I. Authentication

Create clean Sign In and Create Account screens consistent with the design system.

Use pseudonymous public profiles. If email or another authentication method is used, keep the underlying authentication identifier private.

Do not promise that users are completely anonymous to the service itself.

6. Post card component

Create a reusable PostCard component.

Each card should contain:

- A generated pseudonym.

- A relative publication time.

- A small expiration indicator.

- Plain-text post body.

- Optional topic tags.

- Reply count.

- Reaction controls.

- A contextual menu for reporting or blocking.

The expiration indicator should be understated but understandable. Use a small clock icon and text such as "Expires in 3h 24m".

Do not use an oversized countdown, flashing warning, or distracting progress animation.

Post content must render as text, never as executable HTML.

7. Interactions and functional behavior

All visible controls must have meaningful behavior.

Implement:

- Working onboarding navigation.

- Theme switching across every screen.

- Responsive desktop and mobile navigation.

- Composer validation and character counting.

- Feed tabs and topic filters.

- Post detail and reply interactions.

- Reaction selection.

- Search input and empty states.

- Profile menu.

- Privacy settings.

- Confirmation dialogs for destructive actions.

- Toast feedback for successful local interactions.

- Loading skeletons and error states.

- Accessible keyboard navigation.

If the project is not yet connected to a backend, use a clearly isolated mock-data service and local interaction state for the prototype.

Do not present simulated authentication, publication, or deletion as production functionality. Do not use local browser storage as the authoritative source for content expiration.

8. Expiration UX and privacy disclosures

Design the interface to support the following backend rules:

- Each post expires 24 hours after server-recorded publication.

- Replies and reactions do not outlive their parent post.

- Expired content becomes inaccessible through the API immediately.

- A scheduled backend process physically removes expired records.

- Temporary identity records are deleted according to the defined identity-retention policy.

- Account deletion invalidates the user's active sessions and removes their identity associations.

Use a short, understandable privacy notice:

"Posts disappear from Ghostline after 24 hours. Screenshots, external copies, and certain backup or legally required records may persist."

Show the expiration policy near the composer and in Settings.

Do not claim that a frontend timer deletes content. Actual expiration and deletion must be enforced by the backend.

9. Accessibility and responsive behavior

- Use semantic HTML.

- Add labels to every form control.

- Ensure adequate text contrast in both themes.

- Provide keyboard focus indicators.

- Respect reduced-motion preferences.

- Make touch targets comfortably usable on mobile.

- Support narrow screens without horizontal scrolling.

- Ensure dialogs and menus work with keyboard and screen readers.

- Test the layout at mobile, tablet, and desktop widths.

10. Engineering structure

Organize the project into reusable components and clear service boundaries.

Suggested structure:

- "components/layout/"

- "components/navigation/"

- "components/posts/"

- "components/composer/"

- "components/onboarding/"

- "components/topics/"

- "components/settings/"

- "pages or app routes"

- "lib/services/"

- "lib/validation/"

- "lib/theme/"

- "types/"

Use TypeScript interfaces for Profile, Post, Reply, Reaction, Topic, and Report.

Keep mock data isolated from UI components so a real backend can replace it without rewriting the application.

Do not hardcode secrets or expose privileged Supabase keys.

11. Development sequence

Build in these stages:

Stage 1: Design system, onboarding, navigation, theme switcher, and responsive layout.

Stage 2: Home feed, reusable post cards, composer, Explore, and topic cards.

Stage 3: Post detail, replies, reactions, profile, and settings.

Stage 4: Authentication and Supabase integration.

Stage 5: Server-enforced expiration, database security policies, automated cleanup, and temporary identity deletion.

Stage 6: Reporting, blocking, rate limiting, automated tests, and deployment hardening.

For the first iteration, prioritize Stage 1 and Stage 2. Keep the architecture ready for the remaining stages, but do not pretend that future backend functionality already exists.

12. Final quality requirements

The finished interface should look like a professionally designed startup product, not a generic generated dashboard.

Prioritize:

- Fidelity to the two attached visual references.

- Clear typography and whitespace.

- Beautiful rounded surfaces and subtle pastel accents.

- A coherent light/dark theme system.

- A distinctive, privacy-focused brand identity.

- Functional interactions rather than decorative controls.

- A polished mobile experience.

- Maintainable, reusable components.

First inspect the existing project and preserve any working implementation. Then build the UI in the defined stages, verify responsive behavior, and report what is functional, what uses mock data, and what still requires backend integration.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/79ffddb2-d045-4b92-b979-9adb32d4fdff).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

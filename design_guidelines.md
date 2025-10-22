# Evergreen Website Design Guidelines

## Design Approach

**Selected Approach:** Reference-Based with nature-inspired branding
**Primary References:** Stripe (clean professionalism), Airbnb (trust & approachability), Notion (modern simplicity)
**Core Principle:** Professional service credibility meets organic, nature-inspired warmth

## Brand Identity: Evergreen

**Design Philosophy:** Fresh growth, sustainable excellence, natural reliability
**Personality:** Trustworthy, growth-oriented, clean, approachable, professional

## Color Palette

### Light Mode
- **Primary Green:** 145 65% 42% (forest green - headers, primary CTAs)
- **Secondary Green:** 160 45% 55% (soft sage - accents, hover states)
- **Background:** 0 0% 98% (warm off-white)
- **Surface:** 0 0% 100% (pure white cards)
- **Text Primary:** 0 0% 15% (near black)
- **Text Secondary:** 0 0% 45% (medium gray)
- **Accent Teal:** 175 55% 48% (supporting highlights)

### Dark Mode
- **Primary Green:** 145 50% 55% (lighter forest for contrast)
- **Secondary Green:** 160 40% 45% (muted sage)
- **Background:** 0 0% 8% (deep charcoal)
- **Surface:** 0 0% 12% (elevated cards)
- **Text Primary:** 0 0% 95% (off-white)
- **Text Secondary:** 0 0% 65% (light gray)

## Typography

**Font Families:**
- **Headlines:** Inter (700-800 weight) - clean, modern, professional
- **Body Text:** Inter (400-500 weight) - excellent readability
- **Accents:** Inter (600 weight) - subheadings, labels

**Scale:**
- Hero Headline: text-5xl md:text-7xl (bold)
- Section Headlines: text-3xl md:text-5xl (bold)
- Subsection Headers: text-2xl md:text-3xl (semibold)
- Card Titles: text-xl md:text-2xl (semibold)
- Body Large: text-lg md:text-xl
- Body Standard: text-base
- Small Text: text-sm

## Layout System

**Spacing Primitives:** Use Tailwind units of 4, 6, 8, 12, 16, 20, 24 for consistency
- **Section Padding:** py-16 md:py-24 lg:py-32
- **Container Width:** max-w-7xl for full sections, max-w-6xl for content
- **Card Spacing:** p-6 md:p-8
- **Element Gaps:** gap-4, gap-6, gap-8, gap-12

**Grid Patterns:**
- Services: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Packages: grid-cols-1 md:grid-cols-3
- Testimonials: Single column carousel
- Partners: grid-cols-2 md:grid-cols-4

## Component Library

### Hero Section
- Full viewport height (min-h-screen) with large nature-inspired hero image (forest/mountains/greenery)
- Centered content with max-w-4xl
- Large headline + compelling subheadline
- Two CTAs: Primary (solid green) + Secondary (outline with blur backdrop)
- Subtle organic shapes overlay (subtle curves, not geometric)

### Service Cards
- Rounded corners (rounded-2xl)
- Image at top (aspect-ratio-video)
- Icon or illustration integrated with image
- Title, description, "Learn More" link
- Hover: subtle lift (transform) + shadow increase
- Background: white/surface color with border

### Pricing Cards
- Three tiers: Essential, Standard, Standard Pro (Best Value badge)
- Rounded containers with subtle shadows
- Green accent for "Best Value"
- Feature list with checkmarks (green)
- Large "Get Started" button
- Consistent heights using min-h

### Testimonial Carousel
- Large quote marks (decorative)
- Star ratings (5 stars, gold/green)
- Client name + title
- Rotating mechanism with smooth transitions
- Navigation dots below
- Max-w-4xl centered content

### How It Works Section
- 4-step horizontal flow on desktop, vertical on mobile
- Numbered circles with icons
- Step title + description
- Connecting lines between steps (organic curves, not straight)
- Alternating left/right imagery (optional)

### Calendly Integration
- Embedded iframe with rounded corners
- Surrounding context: "Schedule Your Free Consultation"
- Supporting text about what to expect
- Generous padding around embed

### Contact Form (Custom Packages)
- Two-column layout (form left, info right) on desktop
- Fields: Number selectors, textarea for message
- Green primary button
- Validation states with green/red indicators
- Adjacent info: response time, support hours

### Footer
- Three-column layout: Company info, Quick links, Social
- Logo + tagline
- Contact information (email, phone)
- Social media icons (LinkedIn, Facebook, Instagram)
- Copyright + legal links
- Subtle green accent line at top

## Visual Treatment

**Imagery Strategy:**
- Hero: Large, inspiring nature photograph (forest canopy, mountain vista, or sustainable growth metaphor)
- Service Cards: High-quality relevant imagery for each service
- About Section: Team photo or office environment
- Partners: Clean logo grid with consistent sizing
- Testimonials: Optional client headshots (circular crops)

**Borders & Shadows:**
- Cards: border border-gray-200 shadow-sm hover:shadow-md
- Elevated elements: shadow-lg
- Organic shapes: No harsh corners, prefer rounded-2xl to rounded-3xl

**Animations:**
- Fade-in on scroll for sections (subtle, one-time)
- Hover states: smooth 200ms transitions
- Carousel: 500ms smooth transitions
- NO excessive motion - keep it professional

**Icons:**
- Use Heroicons (outline style for consistency)
- Green color for checkmarks, feature highlights
- Neutral for navigation, utility icons

## Accessibility

- Maintain WCAG AA contrast ratios (4.5:1 text, 3:1 UI)
- Dark mode: ensure green colors have sufficient brightness
- Focus states: visible green outline (ring-2 ring-primary)
- Form labels: always visible, not placeholder-only
- Alt text: descriptive for all images

## Images

**Required Images:**
1. **Hero Background:** Wide panoramic nature scene (forest/mountains/greenery) - full viewport width, subtle overlay for text readability
2. **Service Cards (4-6 images):** Professional imagery representing each service offering
3. **About Section:** Team photo or modern office environment showing professionalism
4. **Partner Logos:** 4-8 company logos in grid format (grayscale, consistent sizing)
5. **Testimonial Avatars:** Circular client photos (optional but recommended for trust)

All images should convey growth, sustainability, professionalism, and natural reliability aligned with the Evergreen brand.
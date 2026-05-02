# LERE Kids Design System

## 1. Visual Theme & Atmosphere

LERE Kids is a socioeducational toy store: playful, trustworthy, inclusive, and easy for families, educators, and caregivers to navigate. The interface should feel like a bright learning space, not a loud toy aisle. Use generous whitespace, soft color blocks, friendly product imagery, and clear shopping flows.

Primary inspiration: Miro's collaborative, colorful design language from `design-reference/awesome-design-md/design-md/miro/DESIGN.md`, softened for children and adapted for e-commerce.

## 2. Color Palette & Roles

- **Ink** `#1c1c1e`: primary text and high-contrast labels.
- **Paper** `#ffffff`: main surface.
- **Cloud** `#f6f7fb`: page background and quiet sections.
- **Learning Blue** `#5b76fe`: primary actions, links, focus rings.
- **Play Yellow** `#ffd966`: highlights, badges, educational tags.
- **Care Coral** `#ff8f8f`: warm accents, sale labels, emotional moments.
- **Calm Teal** `#46c7bd`: progress, trust, accessibility and social impact cues.
- **Leaf Green** `#00b473`: success, availability, positive feedback.
- **Slate** `#555a6a`: secondary text.
- **Line** `#e0e2e8`: borders and dividers.

Use color with purpose. Product cards may use soft pastel headers, but checkout, navigation, filters, and product information should remain calm and readable.

## 3. Typography Rules

- **Display font**: Inter, Nunito Sans, or a rounded geometric sans-serif.
- **Body font**: Inter, system-ui, Segoe UI, Arial, sans-serif.
- **Hero heading**: 48-56px desktop, 34-40px mobile, weight 700.
- **Section heading**: 28-36px desktop, 24-30px mobile, weight 700.
- **Product title**: 18-22px, weight 700.
- **Body text**: 16-18px, line-height 1.5.
- **Small labels**: 12-14px, weight 600.

Avoid childish novelty fonts. The brand can be warm without sacrificing readability.

## 4. Component Styling

### Buttons

- Primary: Learning Blue background, white text, 8px radius, strong hover and focus states.
- Secondary: white background, `1px solid #c7cad5`, Ink text.
- Icon buttons: square or circular, 40-44px touch target.
- Checkout buttons should be unmistakable and consistent.

### Product Cards

- 8px radius.
- White surface with subtle border or ring shadow.
- Clear product image area with stable aspect ratio.
- Show age range, skill focus, price, and stock status.
- Use badges such as "STEM", "Montessori", "Social Skills", "Inclusive Play", and "Eco".

### Navigation

- Top navigation should prioritize: Shop, Age, Skills, Educators, About, Cart.
- Search must be visible and easy to reach.
- Mobile navigation should collapse into a clear menu with large tap targets.

### Forms

- Inputs: white background, `1px solid #e0e2e8`, 8px radius, 14-16px padding.
- Error text should be plain and helpful.
- Checkout should minimize distractions and keep progress visible.

## 5. Layout Principles

- Use a bright full-width hero with real product or play imagery.
- Keep category discovery close to the first viewport.
- Use grid layouts for product browsing: 2 columns mobile when practical, 3-4 desktop.
- Keep educational value visible beside commercial value.
- Avoid nested cards and overdecorated sections.

## 6. Content Principles

The store should speak to adults buying for children, while still feeling joyful. Copy should explain what each toy develops: creativity, coordination, emotional intelligence, literacy, logic, collaboration, or sensory exploration.

Use clear labels:

- Age range
- Development skill
- Material and safety note
- Social or educational impact
- Recommended setting: home, classroom, therapy, group play

## 7. Do's And Don'ts

Do:

- Use real or generated product imagery.
- Make accessibility visible through contrast, focus states, and readable type.
- Design for quick comparison between toys.
- Balance playfulness with parental trust.

Don't:

- Use dark luxury e-commerce styling as the main direction.
- Hide prices, ages, or educational value.
- Overload the page with every color at once.
- Make the first screen a marketing-only landing page.

## 8. Responsive Behavior

- Mobile first.
- Minimum touch target: 44px.
- Product grids must keep image ratios stable.
- Filters should become a drawer or sheet on mobile.
- Cart and checkout should remain readable on small screens with no horizontal scrolling.

## 9. Agent Prompt Guide

When building the app, use this prompt:

"Build LERE Kids as a socioeducational toy store using DESIGN.md. Make the first screen a usable storefront, with search, categories, featured products, cart access, and visible educational value for each toy. The design should feel bright, trustworthy, inclusive, and family-friendly, inspired by Miro's colorful collaborative style but adapted for e-commerce."

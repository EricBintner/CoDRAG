# Design Systems Research

Evaluating modern design systems and visual patterns for Halley's UI upgrade.

---

## Current Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | React 18 | Standard |
| Build | Vite | Fast dev, good DX |
| Styling | Tailwind CSS | Utility-first |
| Components | shadcn/ui (partial) | 16 base components |
| Icons | Lucide React | Consistent icon set |
| State | Zustand | Minimal stores |
| Primitives | Radix UI (partial) | Accessibility |

---

## Design System Options

### Option 1: Full shadcn/ui Adoption

**What it is:** Component collection built on Radix primitives + Tailwind

**Pros:**
- Already partially adopted (16 components)
- Copy-paste model (own the code)
- Excellent accessibility via Radix
- Active community, frequent updates
- Works with existing Tailwind setup

**Cons:**
- Need to add 20+ missing components
- Requires manual theming work
- No design tokens out of box
- CLI installation can conflict

**Effort:** Medium

**Recommendation:** ⭐⭐⭐⭐ Strong candidate - build on existing foundation

### Option 2: Radix Themes

**What it is:** Pre-styled component library from Radix team

**Pros:**
- Full design system with tokens
- Built-in theming (light/dark/accent colors)
- Exceptional accessibility
- Professional, polished look
- Consistent spacing/typography

**Cons:**
- Different from shadcn approach
- May conflict with existing Tailwind patterns
- Less customizable than shadcn
- Newer, smaller community

**Effort:** High (migration)

**Recommendation:** ⭐⭐⭐ Consider for future, not now

### Option 3: Tailwind UI

**What it is:** Premium component templates from Tailwind team

**Pros:**
- Beautiful, production-ready designs
- Copy-paste friendly
- Matches existing Tailwind setup
- Great responsive patterns

**Cons:**
- Paid license required
- Templates, not a system
- No accessibility primitives
- No state management

**Effort:** Medium

**Recommendation:** ⭐⭐ Use for inspiration/patterns only

### Option 4: Custom Design System

**What it is:** Build from scratch with Tailwind + Radix

**Pros:**
- Complete control
- Tailored to app's unique needs
- No external dependencies
- Deep understanding of codebase

**Cons:**
- Significant time investment
- Must solve accessibility ourselves
- Documentation burden
- Maintenance overhead

**Effort:** Very High

**Recommendation:** ⭐⭐ Only if other options fail

### Option 5: Hybrid Approach (Recommended)

**What it is:** Expand shadcn/ui + add design token layer

**Strategy:**
1. Keep existing shadcn components
2. Add missing shadcn components (~20)
3. Create design token system on top
4. Build app-specific components using shadcn patterns

**Pros:**
- Minimal migration
- Leverages existing work
- Progressive enhancement
- Flexible customization

**Cons:**
- Requires careful planning
- Token system needs design

**Effort:** Medium-High

**Recommendation:** ⭐⭐⭐⭐⭐ Best path forward

---

## Visual Design Directions

### Current Identity: "Intimate Dark"

```
┌──────────────────────────────────────┐
│  Characteristics:                    │
│  • Dark backgrounds (280° hue)       │
│  • Pink/purple accent palette        │
│  • Soft, rounded corners (0.75rem)   │
│  • Subdued, non-competing UI         │
│  • Trans pride color influence       │
└──────────────────────────────────────┘
```

### Direction A: Refined Dark

Evolve current aesthetic with more polish:
- Deeper, richer darks
- Subtle gradients
- Glassmorphism accents
- Improved contrast
- Micro-animations

**Mood:** Sophisticated, intimate, premium
**Effort:** Low-Medium

### Direction B: Neon Cyberpunk

Lean into bold, vibrant colors:
- High contrast neons
- Glowing accents
- Sharp edges
- Tech aesthetic
- Animated elements

**Mood:** Edgy, futuristic, bold
**Effort:** High (significant redesign)

### Direction C: Soft Gradient

Softer, more approachable:
- Gradient backgrounds
- Pastel accents
- Organic shapes
- Gentle animations
- Warm feeling

**Mood:** Friendly, warm, accessible
**Effort:** Medium

### Direction D: Minimal Monochrome

Strip back to essentials:
- Mostly grayscale
- Single accent color
- Maximum contrast
- Clean typography
- Functional focus

**Mood:** Clean, professional, focused
**Effort:** Medium

**Recommendation:** Direction A (Refined Dark) - Preserve identity, add polish

---

## Typography System

### Current State
- No defined type scale
- Mix of text-sm, text-base, text-lg
- Inconsistent heading sizes
- No line-height system

### Proposed Type Scale

```css
/* Font Sizes */
--text-xs:   0.75rem;   /* 12px - Labels, captions */
--text-sm:   0.875rem;  /* 14px - Body small, UI text */
--text-base: 1rem;      /* 16px - Body default */
--text-lg:   1.125rem;  /* 18px - Body large */
--text-xl:   1.25rem;   /* 20px - Heading small */
--text-2xl:  1.5rem;    /* 24px - Heading medium */
--text-3xl:  1.875rem;  /* 30px - Heading large */
--text-4xl:  2.25rem;   /* 36px - Display */

/* Line Heights */
--leading-none:   1;
--leading-tight:  1.25;
--leading-snug:   1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose:  2;

/* Font Weights */
--font-normal:  400;
--font-medium:  500;
--font-semibold: 600;
--font-bold:    700;
```

---

## Spacing System

### Proposed Scale (8px base)

```css
--space-0:  0;
--space-1:  0.25rem;  /* 4px */
--space-2:  0.5rem;   /* 8px */
--space-3:  0.75rem;  /* 12px */
--space-4:  1rem;     /* 16px */
--space-5:  1.25rem;  /* 20px */
--space-6:  1.5rem;   /* 24px */
--space-8:  2rem;     /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

---

## Animation & Motion

### Principles
1. **Purposeful** - Animation should convey meaning
2. **Subtle** - Don't distract from content
3. **Quick** - Respect user's time
4. **Consistent** - Same patterns throughout

### Proposed Durations

```css
--duration-instant: 0ms;
--duration-fast:    150ms;
--duration-normal:  250ms;
--duration-slow:    350ms;
--duration-slower:  500ms;
```

### Easing Functions

```css
--ease-default:    cubic-bezier(0.4, 0, 0.2, 1);
--ease-in:         cubic-bezier(0.4, 0, 1, 1);
--ease-out:        cubic-bezier(0, 0, 0.2, 1);
--ease-in-out:     cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring:     cubic-bezier(0.175, 0.885, 0.32, 1.275);
```

### Animation Patterns

| Pattern | Use Case | Duration | Easing |
|---------|----------|----------|--------|
| Fade | Modals, tooltips | fast | ease-out |
| Slide | Sidebars, sheets | normal | ease-out |
| Scale | Buttons, cards | fast | ease-spring |
| Collapse | Accordions | normal | ease-in-out |
| Spin | Loading | continuous | linear |

---

## Color System Enhancement

### Semantic Color Additions

```css
/* Status Colors */
--color-success:    142 76% 36%;   /* Green */
--color-warning:    38 92% 50%;    /* Amber */
--color-error:      0 84% 60%;     /* Red */
--color-info:       199 89% 48%;   /* Blue */

/* Interactive States */
--color-hover:      /* primary + 10% lightness */
--color-active:     /* primary - 10% lightness */
--color-disabled:   /* muted + reduced opacity */
--color-focus:      /* ring color */

/* Surface Hierarchy */
--surface-0:        /* base background */
--surface-1:        /* raised (cards) */
--surface-2:        /* elevated (modals) */
--surface-3:        /* highest (popovers) */
```

---

## Component Patterns to Adopt

### From shadcn/ui (Add)

| Component | Priority | Use Case |
|-----------|----------|----------|
| `select.tsx` | High | Form dropdowns |
| `checkbox.tsx` | High | Boolean inputs |
| `switch.tsx` | High | Toggle settings |
| `avatar.tsx` | High | User/persona images |
| `tooltip.tsx` | High | Help text |
| `toast.tsx` | High | Notifications |
| `alert.tsx` | Medium | Inline messages |
| `skeleton.tsx` | Medium | Loading states |
| `separator.tsx` | Medium | Visual dividers |
| `scroll-area.tsx` | Medium | Scrollable regions |
| `radio-group.tsx` | Medium | Single selection |
| `accordion.tsx` | Low | Collapsible sections |
| `navigation-menu.tsx` | Low | Complex nav |
| `command.tsx` | Low | Command palette |
| `calendar.tsx` | Low | Date picking |
| `data-table.tsx` | Low | Complex tables |

### Custom Components (Build)

| Component | Purpose | Base |
|-----------|---------|------|
| `PersonaAvatar` | Persona display | Avatar |
| `MessageBubble` | Chat messages | Card |
| `MemoryCard` | Memory display | Card |
| `ProgressRing` | Circular progress | Custom SVG |
| `EmotionIndicator` | Emotion display | Custom |
| `WorldCard` | World preview | Card |

---

## Accessibility Checklist

### WCAG 2.1 AA Requirements

- [ ] Color contrast 4.5:1 for normal text
- [ ] Color contrast 3:1 for large text
- [ ] Focus indicators visible
- [ ] Keyboard navigation complete
- [ ] Screen reader labels
- [ ] Reduced motion support
- [ ] Touch targets 44x44px minimum

### Testing Tools
- axe DevTools
- WAVE
- Lighthouse
- VoiceOver/NVDA testing

---

## Implementation Roadmap

### Phase 1: Token Foundation (Week 1)
- Define complete token system
- Create token CSS files
- Update tailwind.config.js
- Document token usage

### Phase 2: Component Completion (Week 2-3)
- Add missing shadcn components
- Update existing components with tokens
- Create custom app components
- Write component documentation

### Phase 3: Visual Polish (Week 4)
- Refine color palette
- Add micro-animations
- Improve typography
- Accessibility audit

### Phase 4: Giant Component Refactor (Week 5-8)
- Break up PersonasDialog
- Break up SettingsTabs
- Apply new patterns throughout
- Final integration testing

---

## Research Resources

### Design Systems
- [shadcn/ui](https://ui.shadcn.com/) - Component reference
- [Radix Themes](https://www.radix-ui.com/themes) - Design system
- [Tailwind UI](https://tailwindui.com/) - Pattern library

### CSS/Styling
- [Open Props](https://open-props.style/) - CSS custom properties
- [Utopia](https://utopia.fyi/) - Fluid type/space scales
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility reference

### Accessibility
- [Radix Primitives](https://www.radix-ui.com/primitives) - Accessible components
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Standards
- [Inclusive Components](https://inclusive-components.design/) - Patterns

### Inspiration
- [Refactoring UI](https://www.refactoringui.com/) - Design tactics
- [Dribbble](https://dribbble.com/tags/dark_ui) - Dark UI inspiration
- [Mobbin](https://mobbin.com/) - UI patterns

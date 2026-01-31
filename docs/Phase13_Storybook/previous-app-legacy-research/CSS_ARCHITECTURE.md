# CSS Architecture Analysis

Current CSS patterns and future design system strategy.

---

## Current Architecture

### Stack
- **Tailwind CSS** - Utility-first CSS framework
- **CSS Custom Properties** - Theme variables
- **cn() utility** - clsx + tailwind-merge for conditional classes

### Theme System (`index.css`)

```css
/* 3 themes defined via CSS custom properties */
:root, .theme-intimate { ... }  /* Default: Pink/Blue/Purple - always dark */
.theme-neutral { ... }           /* Teal/Slate - always dark */
.theme-professional { ... }      /* Gray/Blue - supports light/dark */
```

### Design Tokens (Current)

| Token | Purpose | Intimate | Neutral | Professional |
|-------|---------|----------|---------|--------------|
| `--background` | Page background | 280 30% 6% | 220 20% 8% | 220 14% 96% |
| `--foreground` | Primary text | 280 10% 95% | 220 10% 95% | 220 20% 15% |
| `--card` | Card background | 280 30% 9% | 220 20% 11% | 0 0% 100% |
| `--primary` | Primary actions | 330 85% 60% (pink) | 172 66% 45% (teal) | 217 91% 50% (blue) |
| `--secondary` | Secondary elements | 197 85% 55% (blue) | 199 70% 50% (blue) | 220 13% 69% (gray) |
| `--accent` | Accent highlights | 270 85% 60% (purple) | 180 50% 40% (teal) | 221 83% 53% (blue) |
| `--muted` | Muted backgrounds | 280 25% 15% | 220 15% 18% | 220 14% 92% |
| `--destructive` | Error/danger | 0 70% 45% | 0 65% 45% | 0 84% 55% |
| `--border` | Borders | 280 25% 18% | 220 15% 22% | 220 13% 88% |
| `--ring` | Focus rings | 330 85% 60% | 172 66% 45% | 217 91% 50% |
| `--radius` | Border radius | 0.75rem | (inherited) | (inherited) |

### Observations

#### Strengths ✅
1. CSS custom properties enable runtime theme switching
2. Dark-first approach matches app personality
3. HSL color format allows easy manipulation
4. Tailwind provides consistent spacing/sizing

#### Weaknesses ❌
1. **No spacing scale tokens** - using raw Tailwind values
2. **No typography scale** - font sizes inconsistent
3. **No animation tokens** - transitions vary per component
4. **Limited semantic tokens** - mostly just colors
5. **No component-specific tokens** - all global
6. **Missing states** - hover, active, disabled not tokenized

---

## Design Token Gaps

### Missing Token Categories

#### Typography
```css
/* NEEDED */
--font-family-sans: ...
--font-family-mono: ...
--font-size-xs: ...
--font-size-sm: ...
--font-size-base: ...
--font-size-lg: ...
--font-size-xl: ...
--font-size-2xl: ...
--font-weight-normal: ...
--font-weight-medium: ...
--font-weight-bold: ...
--line-height-tight: ...
--line-height-normal: ...
--line-height-loose: ...
```

#### Spacing
```css
/* NEEDED */
--spacing-0: 0
--spacing-1: 0.25rem
--spacing-2: 0.5rem
--spacing-3: 0.75rem
--spacing-4: 1rem
--spacing-6: 1.5rem
--spacing-8: 2rem
--spacing-12: 3rem
--spacing-16: 4rem
```

#### Shadows
```css
/* NEEDED */
--shadow-sm: ...
--shadow-md: ...
--shadow-lg: ...
--shadow-xl: ...
```

#### Transitions
```css
/* NEEDED */
--transition-fast: 150ms ease
--transition-normal: 250ms ease
--transition-slow: 350ms ease
--transition-spring: 500ms cubic-bezier(...)
```

#### Z-Index Scale
```css
/* NEEDED */
--z-dropdown: 50
--z-modal: 100
--z-popover: 150
--z-toast: 200
--z-tooltip: 250
```

---

## Component-Level Patterns

### Current Patterns in Use

#### Button Variants (button.tsx)
```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center...",
  {
    variants: {
      variant: { default, destructive, outline, secondary, ghost, link },
      size: { default, sm, lg, icon }
    }
  }
)
```
✅ Good pattern - using CVA for variant composition

#### Card Structure (card.tsx)
```tsx
Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent
```
✅ Good pattern - compound component structure

#### Dialog (dialog.tsx)
```tsx
// Currently custom implementation, NOT using Radix
<div className="fixed inset-0 z-50...">
```
⚠️ Custom implementation - should migrate to Radix for accessibility

---

## CSS Pain Points

### 1. Inline Style Overuse
```tsx
// Found in multiple components
<div style={{ display: dialogTab === 'worlds' ? 'block' : 'none' }}>
```
- Should use Tailwind classes or CSS

### 2. Magic Numbers
```tsx
// Found throughout
className="max-h-64"  // Why 64? What's the scale?
className="w-[400px]" // Arbitrary width
```
- Should use design tokens

### 3. Inconsistent Spacing
```tsx
// Different padding approaches in same file
className="p-4"
className="px-3 py-2"
className="space-y-6"
className="gap-4"
```
- Need consistent spacing system

### 4. Color Inconsistency
```tsx
// Direct color values instead of tokens
className="text-green-500"
className="bg-red-500/10"
```
- Should use semantic tokens (success, error)

### 5. Responsive Breakpoints
```tsx
// Inconsistent responsive patterns
className="grid-cols-1 md:grid-cols-2"
className="hidden lg:block"
```
- Need documented breakpoint strategy

---

## Recommended Design System Structure

### Token Layers

```
┌─────────────────────────────────────┐
│ Layer 3: Component Tokens           │
│ --button-padding, --card-radius     │
├─────────────────────────────────────┤
│ Layer 2: Semantic Tokens            │
│ --color-success, --text-heading     │
├─────────────────────────────────────┤
│ Layer 1: Primitive Tokens           │
│ --green-500, --spacing-4            │
└─────────────────────────────────────┘
```

### File Structure (Proposed)

```
src/
├── styles/
│   ├── tokens/
│   │   ├── colors.css       # Primitive colors
│   │   ├── typography.css   # Font scale
│   │   ├── spacing.css      # Spacing scale
│   │   ├── shadows.css      # Shadow scale
│   │   └── animations.css   # Transitions/animations
│   ├── themes/
│   │   ├── intimate.css     # Theme overrides
│   │   ├── neutral.css
│   │   └── professional.css
│   └── index.css            # Imports all
```

---

## Visual Design Considerations

### Current Identity: "Intimate/Personal AI"
- Dark, moody color palette
- Pink/purple accents (trans pride colors)
- Soft, rounded corners
- Subdued UI that doesn't compete with content

### Design System Options to Research

1. **Radix Themes** - Built on Radix primitives we already use
2. **shadcn/ui** - Already partially adopted
3. **Tailwind UI** - Premium components
4. **Custom** - Full control, more work

### Accessibility Requirements
- WCAG AA contrast ratios
- Focus visible states
- Reduced motion support
- Screen reader compatibility

---

## Migration Strategy

### Phase 1: Token Foundation
1. Define complete primitive token set
2. Define semantic token layer
3. Update index.css with new structure
4. Document token usage

### Phase 2: Component Tokens
1. Add component-specific tokens
2. Refactor button.tsx as reference
3. Apply pattern to all ui/ components

### Phase 3: Application
1. Replace magic numbers with tokens
2. Standardize responsive patterns
3. Add animation tokens
4. Audit accessibility

---

## Research Questions

1. Should we adopt Radix Themes for component styling?
2. Is shadcn/ui the right base, or build custom?
3. How do we handle the 3-theme system efficiently?
4. What's the animation/motion design language?
5. How do we ensure consistency across 80+ components?

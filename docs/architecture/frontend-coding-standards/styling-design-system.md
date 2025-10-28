# Styling & Design System

All styles must reference the design system defined in `src/index.css`. This ensures visual consistency, automatic dark mode support, and maintainability.

## Single Source of Truth

**`src/index.css` is the single source of truth** for all design tokens:
- Colors (semantic: primary, secondary, destructive, success, etc.)
- Typography (font families: sans, serif, mono)
- Shadows (2xs, xs, sm, md, lg, xl, 2xl)
- Border radius (sm, md, lg, xl)
- All values use oklch color space for better interpolation

## Mandatory: Semantic Classes Only

### Colors
**Always use semantic color classes that reference CSS variables:**

```tsx
// ✅ GOOD: Semantic classes
<button className="bg-primary text-primary-foreground">Save</button>
<div className="bg-card text-card-foreground border-border">Card</div>
<p className="text-muted-foreground">Helper text</p>
<button className="bg-destructive text-destructive-foreground">Delete</button>
<span className="text-success">Success message</span>

// ❌ BAD: Magic color values
<button className="bg-blue-600 text-white">Save</button>
<div className="bg-white text-gray-900 border-gray-200">Card</div>
<p className="text-gray-500">Helper text</p>
<button className="bg-red-500 text-white">Delete</button>
<span className="text-green-600">Success message</span>
```

### Available Semantic Colors
- **Surfaces**: `background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`
- **Brand**: `primary`, `primary-foreground`, `secondary`, `secondary-foreground`
- **States**: `muted`, `muted-foreground`, `accent`, `accent-foreground`, `destructive`, `destructive-foreground`, `success`
- **UI Elements**: `border`, `input`, `ring`
- **Charts**: `chart-1`, `chart-2`, `chart-3`, `chart-4`, `chart-5`
- **Sidebar**: `sidebar`, `sidebar-foreground`, `sidebar-primary`, `sidebar-accent`, etc.

### Typography
**Use defined font families:**

```tsx
// ✅ GOOD
<h1 className="font-sans">Heading</h1>
<code className="font-mono">code snippet</code>
<blockquote className="font-serif">Quote</blockquote>

// ❌ BAD
<h1 className="font-['Arial']">Heading</h1>
<code style={{ fontFamily: 'Courier' }}>code snippet</code>
```

### Shadows
**Use shadow scale, not arbitrary values:**

```tsx
// ✅ GOOD
<div className="shadow-sm">Subtle elevation</div>
<div className="shadow-md">Card elevation</div>
<div className="shadow-lg">Modal elevation</div>

// ❌ BAD
<div className="shadow-[0px_4px_6px_rgba(0,0,0,0.1)]">Custom shadow</div>
<div style={{ boxShadow: '0 2px 4px gray' }}>Inline shadow</div>
```

### Border Radius
**Use radius scale:**

```tsx
// ✅ GOOD
<button className="rounded-md">Button</button>
<div className="rounded-lg">Card</div>

// ❌ BAD
<button className="rounded-[8px]">Button</button>
<div style={{ borderRadius: '12px' }}>Card</div>
```

## Extending the Design System

**When you need a new semantic value:**

1. **Add to `src/index.css`** in both `:root` and `.dark` blocks:
   ```css
   :root {
     --warning: oklch(0.85 0.15 85);
     --warning-foreground: oklch(0.2 0.1 85);
   }

   .dark {
     --warning: oklch(0.65 0.18 85);
     --warning-foreground: oklch(0.95 0.05 85);
   }
   ```

2. **Add to `@theme inline` block** for Tailwind:
   ```css
   @theme inline {
     --color-warning: var(--warning);
     --color-warning-foreground: var(--warning-foreground);
   }
   ```

3. **Now use the semantic class**:
   ```tsx
   <div className="bg-warning text-warning-foreground">Warning</div>
   ```

## Dark Mode

**Dark mode is automatic** via CSS variable switching. Never use `dark:` modifiers for colors:

```tsx
// ✅ GOOD: Automatically adapts to dark mode
<div className="bg-card text-card-foreground">
  Content
</div>

// ❌ BAD: Manual dark mode handling
<div className="bg-white text-black dark:bg-gray-900 dark:text-white">
  Content
</div>
```

**Only use `dark:` for non-color properties** if truly needed (rare):
```tsx
// Acceptable if there's a design reason
<div className="opacity-100 dark:opacity-90">...</div>
```

## Color Space: oklch

All custom colors must use **oklch** color space (not hex, rgb, or hsl):

**Why oklch?**
- Perceptually uniform (equal lightness = equal perceived brightness)
- Better color interpolation (no gray mid-points)
- Consistent across light/dark modes

```css
/* ✅ GOOD */
--custom-blue: oklch(0.65 0.21 250);

/* ❌ BAD */
--custom-blue: #3b82f6;
--custom-blue: rgb(59, 130, 246);
--custom-blue: hsl(217, 91%, 60%);
```

## Component-Specific Styles

**When component needs custom styles**, create colocated CSS/module:

```
AnimalCard.tsx
AnimalCard.module.css  // Component-specific styles
```

**But still reference design tokens:**
```css
/* AnimalCard.module.css */
.card {
  background: var(--card);
  color: var(--card-foreground);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
  border-radius: var(--radius-lg);
}
```

---

**Enforcement**: ESLint plugin `@stylistic/tailwindcss` should flag arbitrary values. Code review blocks PRs using magic colors.

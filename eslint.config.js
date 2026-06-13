import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import reactYouMightNotNeedAnEffect from "eslint-plugin-react-you-might-not-need-an-effect";

// Design-system guardrails. See CLAUDE.md §2 (Shadcn-First) and §3 (UI Consistency).
// Tailwind palette colors and arbitrary hex bypass the semantic token system and
// will not dark-mode. Use semantic tokens (primary/success/warning/error/info/
// breeding/muted-foreground/...) or the canonical --v2-* tokens instead.
const PALETTE =
  '(?:text|bg|border|ring|fill|stroke|from|to|via|divide|outline|decoration|shadow|accent|caret)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d'
const COLOR_UTIL = '(?:text|bg|border|ring|fill|stroke|from|to|via|divide|outline|decoration|accent|caret)'
// Arbitrary color values in color utilities: hex, rgb(a), hsl(a), oklch/oklab/lab/lch/hwb/color().
const ARBITRARY_COLOR = `${COLOR_UTIL}-\\[(?:#|(?:rgba?|hsla?|oklch|oklab|hwb|lab|lch|color)\\()`
// Inline CSS gradients bypass the palette entirely.
const ARBITRARY_GRADIENT = 'bg-\\[(?:linear|radial|conic)-gradient'

const paletteMessage =
  'Hardcoded Tailwind palette color. Use a semantic token (e.g. text-muted-foreground, bg-destructive, border-info) or a --v2-* token instead. See CLAUDE.md §3.'
const arbitraryColorMessage =
  'Arbitrary color value (hex/rgb/hsl/oklch/gradient) in a utility class. Define a semantic/--v2-* token instead of inlining the value. See CLAUDE.md §3.'

const noPaletteColors = [
  // Static strings: className="...", cn("..."), clsx("...")
  { selector: `Literal[value=/${PALETTE}/]`, message: paletteMessage },
  { selector: `Literal[value=/${ARBITRARY_COLOR}/]`, message: arbitraryColorMessage },
  { selector: `Literal[value=/${ARBITRARY_GRADIENT}/]`, message: arbitraryColorMessage },
  // Template-literal segments: `... ${x}`
  { selector: `TemplateElement[value.raw=/${PALETTE}/]`, message: paletteMessage },
  { selector: `TemplateElement[value.raw=/${ARBITRARY_COLOR}/]`, message: arbitraryColorMessage },
  { selector: `TemplateElement[value.raw=/${ARBITRARY_GRADIENT}/]`, message: arbitraryColorMessage },
]

// Native HTML controls that have a shadcn/ui equivalent. Compose the primitives
// in src/components/ui/* instead. See CLAUDE.md §2.
const noNativeControls = ['input', 'select', 'textarea', 'button', 'label'].map(
  (tag) => ({
    selector: `JSXOpeningElement[name.name='${tag}']`,
    message: `Native <${tag}> bypasses shadcn/ui. Use the matching component from @/components/ui instead. See CLAUDE.md §2.`,
  }),
)

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, reactYouMightNotNeedAnEffect.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  // Design-system guardrails — scoped to feature/page/app code, NOT the shadcn
  // primitives in src/components/ui (which legitimately wrap native elements and
  // define token-backed variants). The existing backlog has been cleaned, so
  // these are errors: new hardcoded colors / native controls fail `npm run lint`.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/components/ui/**'],
    rules: {
      'no-restricted-syntax': ['error', ...noPaletteColors, ...noNativeControls],
    },
  },
)

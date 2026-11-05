import { createTheme, rem } from '@mantine/core'

import { variantColorResolver } from './colors-resolver'
import components from './overrides'
import { BOLT_TOKENS } from './tokens'

const FONT_STACK =
    '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI Variable Text", "Segoe UI", Roboto, system-ui, Vazirmatn, "Noto Sans SC", "Twemoji Country Flags", sans-serif'

export const theme = createTheme({
    variantColorResolver,
    components,
    cursorType: 'pointer',
    fontFamily: FONT_STACK,
    // Моноширинного в интерфейсе нет: код показывает только редактор Monaco со своим шрифтом.
    fontFamilyMonospace: FONT_STACK,
    breakpoints: {
        xs: '30em',
        sm: '40em',
        md: '48em',
        lg: '64em',
        xl: '80em',
        '2xl': '96em',
        '3xl': '120em',
        '4xl': '160em'
    },

    scale: 1,
    fontSmoothing: true,
    focusRing: 'auto',
    white: BOLT_TOKENS.light.surface,
    black: BOLT_TOKENS.light.text,
    colors: {
        dark: [
            BOLT_TOKENS.dark.text,
            BOLT_TOKENS.dark.text,
            '#e6e6e9',
            '#3a3a40',
            BOLT_TOKENS.dark.line,
            BOLT_TOKENS.dark.surfaceHover,
            BOLT_TOKENS.dark.surface,
            BOLT_TOKENS.dark.body,
            '#070708',
            '#000000'
        ],
        gray: [
            BOLT_TOKENS.light.surfaceRaised,
            BOLT_TOKENS.light.body,
            BOLT_TOKENS.light.surfaceHover,
            BOLT_TOKENS.light.line,
            '#d6d6da',
            '#c8c8cd',
            BOLT_TOKENS.light.text,
            BOLT_TOKENS.light.text,
            BOLT_TOKENS.light.text,
            BOLT_TOKENS.light.text
        ]
    },
    primaryShade: { light: 6, dark: 4 },
    primaryColor: 'gray',
    autoContrast: false,
    fontSizes: {
        xs: rem(13),
        sm: rem(14),
        md: rem(15),
        lg: rem(17),
        xl: rem(20)
    },
    lineHeights: {
        xs: '1.35',
        sm: '1.4',
        md: '1.45',
        lg: '1.45',
        xl: '1.35'
    },
    radius: {
        xs: rem(6),
        sm: rem(8),
        md: rem(12),
        lg: rem(14),
        xl: rem(16)
    },
    shadows: {
        xs: 'none',
        sm: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none'
    },
    headings: {
        fontFamily: FONT_STACK,
        fontWeight: '700',
        sizes: {
            h1: { fontSize: rem(28), lineHeight: '1.2' },
            h2: { fontSize: rem(22), lineHeight: '1.25' },
            h3: { fontSize: rem(19), lineHeight: '1.3' },
            h4: { fontSize: rem(17), lineHeight: '1.35' },
            h5: { fontSize: rem(15), lineHeight: '1.4' },
            h6: { fontSize: rem(14), lineHeight: '1.4' }
        }
    },
    defaultRadius: 'md'
})

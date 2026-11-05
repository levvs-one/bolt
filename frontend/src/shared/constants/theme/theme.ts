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
    fontFamilyMonospace: FONT_STACK,
    breakpoints: {
        xs: '25em',
        sm: '30em',
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
        md: rem(16),
        lg: rem(17),
        xl: rem(20)
    },
    radius: {
        xs: rem(6),
        sm: rem(8),
        md: rem(12),
        lg: rem(14),
        xl: rem(16)
    },
    shadows: { xs: 'none', sm: 'none', md: 'none', lg: 'none', xl: 'none' },
    headings: {
        fontFamily: FONT_STACK,
        fontWeight: '700'
    },
    defaultRadius: 'md'
})

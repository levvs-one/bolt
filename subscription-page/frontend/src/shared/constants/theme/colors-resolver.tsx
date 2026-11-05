import { CSSVariablesResolver, DEFAULT_THEME, VariantColorsResolver } from '@mantine/core'

import { BOLT_TOKENS, BoltScheme } from './tokens'

// Палитры, которые остаются поверхностями, а не цветом.
const SURFACE_PALETTES = new Set(['dark', 'gray'])

const ACCENT = 'var(--bolt-accent)'
const ON_ACCENT = 'var(--bolt-on-accent)'
const TEXT = 'var(--bolt-text)'
const TINT = 'color-mix(in srgb, var(--bolt-text) 8%, transparent)'
const TINT_HOVER = 'color-mix(in srgb, var(--bolt-text) 12%, transparent)'

export const variantColorResolver: VariantColorsResolver = (input) => {
    switch (input.variant) {
        case 'filled':
        case 'gradient':
        case 'white':
            return {
                background: ACCENT,
                hover: `color-mix(in srgb, ${ACCENT} 88%, var(--bolt-body))`,
                color: ON_ACCENT,
                border: '1px solid transparent'
            }
        case 'outline':
            return {
                background: 'transparent',
                hover: TINT,
                color: TEXT,
                border: '1px solid var(--bolt-line)'
            }
        case 'subtle':
        case 'transparent':
            return {
                background: 'transparent',
                hover: input.variant === 'subtle' ? TINT : 'transparent',
                color: TEXT,
                border: '1px solid transparent'
            }
        default:
            return {
                background: 'var(--bolt-surface-raised)',
                hover: 'var(--bolt-surface-hover)',
                color: TEXT,
                border: '1px solid transparent'
            }
    }
}

function colorVariables(scheme: BoltScheme) {
    const { text } = BOLT_TOKENS[scheme]
    const variables: Record<string, string> = {}

    for (const name of Object.keys(DEFAULT_THEME.colors)) {
        if (SURFACE_PALETTES.has(name)) continue

        for (let shade = 0; shade < 10; shade++) {
            variables[`--mantine-color-${name}-${shade}`] = text
        }
        variables[`--mantine-color-${name}-text`] = text
        variables[`--mantine-color-${name}-filled`] = text
        variables[`--mantine-color-${name}-filled-hover`] = text
        variables[`--mantine-color-${name}-light`] = TINT
        variables[`--mantine-color-${name}-light-hover`] = TINT_HOVER
        variables[`--mantine-color-${name}-light-color`] = text
        variables[`--mantine-color-${name}-outline`] = text
        variables[`--mantine-color-${name}-outline-hover`] = TINT
    }

    return variables
}

function primaryVariables(scheme: BoltScheme) {
    const { accent, onAccent } = BOLT_TOKENS[scheme]
    const variables: Record<string, string> = {
        '--mantine-primary-color-filled': accent,
        '--mantine-primary-color-filled-hover': accent,
        '--mantine-primary-color-light': TINT,
        '--mantine-primary-color-light-hover': TINT_HOVER,
        '--mantine-primary-color-light-color': accent,
        '--mantine-primary-color-contrast': onAccent
    }

    for (let shade = 0; shade < 10; shade++) {
        variables[`--mantine-primary-color-${shade}`] = accent
    }

    return variables
}

function schemeVariables(scheme: BoltScheme) {
    const tokens = BOLT_TOKENS[scheme]

    return {
        '--bolt-body': tokens.body,
        '--bolt-surface': tokens.surface,
        '--bolt-surface-raised': tokens.surfaceRaised,
        '--bolt-surface-hover': tokens.surfaceHover,
        '--bolt-line': tokens.line,
        '--bolt-text': tokens.text,
        '--bolt-accent': tokens.accent,
        '--bolt-on-accent': tokens.onAccent,
        '--mantine-color-body': tokens.body,
        '--mantine-color-text': tokens.text,
        '--mantine-color-bright': tokens.text,
        '--mantine-color-dimmed': tokens.text,
        '--mantine-color-anchor': tokens.text,
        '--mantine-color-default': tokens.surfaceRaised,
        '--mantine-color-default-hover': tokens.surfaceHover,
        '--mantine-color-default-color': tokens.text,
        '--mantine-color-default-border': tokens.line,
        '--mantine-color-placeholder': `color-mix(in srgb, ${tokens.text} 45%, transparent)`,
        '--mantine-color-error': tokens.text,
        ...colorVariables(scheme),
        ...primaryVariables(scheme)
    }
}

export function createBoltCssVariablesResolver(base: CSSVariablesResolver): CSSVariablesResolver {
    return (theme) => {
        const resolved = base(theme)

        return {
            variables: resolved.variables,
            dark: { ...resolved.dark, ...schemeVariables('dark') },
            light: { ...resolved.light, ...schemeVariables('light') }
        }
    }
}

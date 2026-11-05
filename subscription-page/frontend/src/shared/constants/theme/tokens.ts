// Bolt: фон, поверхность, текст и один акцент. Цветовые палитры Mantine сводятся к этим токенам.
export const BOLT_TOKENS = {
    dark: {
        body: '#0b0b0c',
        surface: '#161618',
        surfaceRaised: '#1e1e21',
        surfaceHover: '#242428',
        line: '#2c2c31',
        text: '#f5f5f7',
        accent: '#f5f5f7',
        onAccent: '#0b0b0c'
    },
    light: {
        body: '#f2f2f4',
        surface: '#ffffff',
        surfaceRaised: '#f7f7f8',
        surfaceHover: '#ececef',
        line: '#e2e2e6',
        text: '#1d1d1f',
        accent: '#1d1d1f',
        onAccent: '#ffffff'
    }
} as const

export type BoltScheme = keyof typeof BOLT_TOKENS

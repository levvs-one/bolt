// Bolt: фон, поверхность, текст и один акцент. Цветовые палитры Mantine сводятся к этим токенам.
// Тона по образцу macOS: сайдбар, окно и группы различаются явно, выбранное — светлый ползунок
// на дорожке, а не инверсия цветом акцента.
export const BOLT_TOKENS = {
    dark: {
        body: '#1c1c1e',
        sidebar: '#262628',
        surface: '#2c2c2e',
        surfaceRaised: '#3a3a3c',
        surfaceHover: '#363638',
        line: '#3f3f42',
        track: '#2c2c2e',
        selected: '#5a5a5e',
        text: '#f5f5f7',
        accent: '#f5f5f7',
        onAccent: '#1c1c1e'
    },
    light: {
        body: '#f2f2f5',
        sidebar: '#e6e6ea',
        surface: '#ffffff',
        surfaceRaised: '#ebebef',
        surfaceHover: '#e2e2e7',
        line: '#d8d8dd',
        track: '#e3e3e8',
        selected: '#ffffff',
        text: '#1d1d1f',
        accent: '#1d1d1f',
        onAccent: '#ffffff'
    }
} as const

export type BoltScheme = keyof typeof BOLT_TOKENS

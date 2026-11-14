import { BOLT_TOKENS } from '@shared/constants/theme/tokens'

export const monacoTheme = {
    base: 'vs-dark',
    inherit: true,
    rules: [
        {
            background: '161b22',
            token: ''
        },
        {
            foreground: '8b949e',
            token: 'comment'
        },
        {
            foreground: '54aeff',
            token: 'constant'
        },
        {
            foreground: 'ffb77c',
            token: 'entity'
        },
        {
            foreground: 'fae17d',
            token: 'keyword'
        },
        {
            foreground: 'fae17d',
            token: 'storage'
        },
        {
            foreground: 'aceebb',
            token: 'string'
        },
        {
            foreground: 'aceebb',
            token: 'meta.verbatim'
        },
        {
            foreground: '54aeff',
            token: 'support'
        },
        {
            foreground: 'fb8f44',
            fontStyle: 'italic',
            token: 'invalid.deprecated'
        },
        {
            foreground: 'c9d1d9',
            background: '7d4e00',
            token: 'invalid.illegal'
        },
        {
            foreground: 'ffb77c',
            fontStyle: 'italic',
            token: 'entity.other.inherited-class'
        },
        {
            foreground: 'ffd8b5',
            token: 'string constant.other.placeholder'
        },
        {
            foreground: '80ccff',
            token: 'meta.function-call.py'
        },
        {
            foreground: '6e7681',
            token: 'meta.tag'
        },
        {
            foreground: '6e7681',
            token: 'meta.tag entity'
        },
        {
            foreground: 'b1bac4',
            token: 'entity.name.section'
        },
        {
            foreground: 'b1bac4',
            token: 'keyword.type.variant'
        },
        {
            foreground: 'c9d1d9',
            token: 'source.ocaml keyword.operator.symbol'
        },
        {
            foreground: '54aeff',
            token: 'source.ocaml keyword.operator.symbol.infix'
        },
        {
            foreground: '54aeff',
            token: 'source.ocaml keyword.operator.symbol.prefix'
        },
        {
            fontStyle: 'underline',
            token: 'source.ocaml keyword.operator.symbol.infix.floating-point'
        },
        {
            fontStyle: 'underline',
            token: 'source.ocaml keyword.operator.symbol.prefix.floating-point'
        },
        {
            fontStyle: 'underline',
            token: 'source.ocaml constant.numeric.floating-point'
        },
        {
            background: 'ffffff08',
            token: 'text.tex.latex meta.function.environment'
        },
        {
            background: '218bff10',
            token: 'text.tex.latex meta.function.environment meta.function.environment'
        },
        {
            foreground: 'fae17d',
            token: 'text.tex.latex support.function'
        },
        {
            foreground: 'c9d1d9',
            token: 'source.plist string.unquoted'
        },
        {
            foreground: 'c9d1d9',
            token: 'source.plist keyword.operator'
        }
    ],
    colors: {
        'editor.foreground': '#c9d1d9',
        // Фон и выделения — тона Bolt: редактор не выглядит вставкой из другого приложения.
        'editor.background': BOLT_TOKENS.dark.surface,
        'editor.selectionBackground': '#0969da55',
        'editor.lineHighlightBackground': BOLT_TOKENS.dark.surfaceHover,
        'minimap.background': BOLT_TOKENS.dark.surface,
        'scrollbar.shadow': '#00000000',
        'editorCursor.foreground': '#54aeff',
        'editorWhitespace.foreground': '#484f58',
        'editorLineNumber.foreground': '#6e7681',
        'editorLineNumber.activeForeground': '#c9d1d9',
        'editorWidget.background': BOLT_TOKENS.dark.surfaceRaised,
        'editorWidget.border': BOLT_TOKENS.dark.line,
        'editorWidget.foreground': '#c9d1d9',
        'editorHoverWidget.background': BOLT_TOKENS.dark.surfaceRaised,
        'editorHoverWidget.border': BOLT_TOKENS.dark.line,
        'editorHoverWidget.foreground': '#c9d1d9',
        'editorSuggestWidget.background': BOLT_TOKENS.dark.surfaceRaised,
        'editorSuggestWidget.border': BOLT_TOKENS.dark.line,
        'editorSuggestWidget.foreground': '#c9d1d9',
        'editorSuggestWidget.selectedBackground': BOLT_TOKENS.dark.surfaceHover,
        'editorSuggestWidget.highlightForeground': '#54aeff',

        'menu.background': BOLT_TOKENS.dark.surfaceRaised,
        'menu.foreground': '#c9d1d9',
        'menu.selectionBackground': '#22b8cf29',
        'menu.selectionForeground': '#e6edf3',
        'menu.separatorBackground': BOLT_TOKENS.dark.line,
        'menu.border': BOLT_TOKENS.dark.line
    }
}

import { Badge, ThemeIcon } from '@mantine/core'

import classes from './badge.module.css'

// Бейджей в Bolt нет: статус и метки — обычный текст строки.
export default {
    Badge: Badge.extend({
        classNames: classes,
        defaultProps: {
            variant: 'transparent'
        }
    }),
    // Подложек под иконками нет ни в одном варианте.
    ThemeIcon: ThemeIcon.extend({
        defaultProps: {
            variant: 'transparent'
        },
        styles: {
            // Без подложки значок занимает только свой размер, а не квадрат кнопки, и не сжимается
            // рядом с длинным текстом.
            root: {
                flexShrink: 0,
                width: 'auto',
                height: 'auto',
                minWidth: 0,
                minHeight: 0,
                background: 'transparent',
                border: 0,
                color: 'var(--bolt-text)'
            }
        }
    })
}

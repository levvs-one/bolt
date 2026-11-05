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
            root: {
                background: 'transparent',
                border: 0,
                color: 'var(--bolt-text)'
            }
        }
    })
}

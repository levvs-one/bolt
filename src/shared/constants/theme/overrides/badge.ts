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
    ThemeIcon: ThemeIcon.extend({
        defaultProps: {
            variant: 'transparent'
        }
    })
}

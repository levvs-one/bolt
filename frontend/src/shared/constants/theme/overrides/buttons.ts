import { ActionIcon, Button } from '@mantine/core'

import classes from './buttons.module.css'

export default {
    ActionIcon: ActionIcon.extend({
        defaultProps: {
            radius: 'md',
            variant: 'subtle'
        }
    }),
    // Кнопка — только текст: иконки по бокам скрываются.
    Button: Button.extend({
        classNames: { section: classes.section },
        defaultProps: {
            radius: 'md',
            variant: 'default'
        },
        styles: {
            root: { fontWeight: 600 }
        }
    })
}

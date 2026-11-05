// oxlint-disable
import { ActionIcon, Button, CloseButton, Switch } from '@mantine/core'

import classes from './buttons.module.css'

export default {
    ActionIcon: ActionIcon.extend({
        defaultProps: {
            radius: 'md',
            variant: 'subtle'
        }
    }),
    // Кнопка — только текст: иконки по бокам скрываются во всём интерфейсе.
    Button: Button.extend({
        classNames: { section: classes.section },
        defaultProps: {
            radius: 'md',
            variant: 'default'
        },
        styles: {
            root: {
                fontWeight: 600,
                transition: 'background-color 150ms ease, opacity 150ms ease'
            }
        }
    }),
    CloseButton: CloseButton.extend({
        defaultProps: {
            size: 'lg'
        }
    }),
    Switch: Switch.extend({
        defaultProps: {
            radius: 'xl',
            color: 'gray'
        }
    })
}

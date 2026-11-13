// oxlint-disable
import { ActionIcon, Button, CloseButton, Switch } from '@mantine/core'

import classes from './buttons.module.css'
import switchClasses from './switch.module.css'

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
    // Переключатель как в macOS: сплошная дорожка и круглый бегунок без точки внутри.
    Switch: Switch.extend({
        classNames: {
            body: switchClasses.body,
            input: switchClasses.input,
            labelWrapper: switchClasses.labelWrapper,
            root: switchClasses.root,
            thumb: switchClasses.thumb,
            track: switchClasses.track
        },
        defaultProps: {
            labelPosition: 'left',
            radius: 'xl',
            withThumbIndicator: false
        }
    })
}

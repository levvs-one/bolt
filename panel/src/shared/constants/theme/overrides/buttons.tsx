// oxlint-disable
import { ActionIcon, Button, CloseButton, Switch } from '@mantine/core'

import classes from './buttons.module.css'
import switchClasses from './switch.module.css'

export default {
    // Иконка-кнопка — голая линейная иконка в любом варианте, подложка только при наведении.
    ActionIcon: ActionIcon.extend({
        defaultProps: {
            radius: 'md',
            variant: 'subtle'
        },
        vars: (_theme, props) =>
            props.variant === 'filled'
                ? { root: {} }
                : {
                      root: {
                          '--ai-bg': 'transparent',
                          '--ai-bd': '1px solid transparent',
                          '--ai-hover': 'var(--bolt-surface-hover)'
                      }
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
            size: 'md',
            withThumbIndicator: false
        }
    })
}

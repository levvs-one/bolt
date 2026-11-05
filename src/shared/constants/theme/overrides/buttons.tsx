// oxlint-disable
import { ActionIcon, Button, CloseButton, Switch } from '@mantine/core'

export default {
    ActionIcon: ActionIcon.extend({
        defaultProps: {
            radius: 'md',
            variant: 'subtle'
        }
    }),
    Button: Button.extend({
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

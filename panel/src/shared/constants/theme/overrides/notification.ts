import { Notification } from '@mantine/core'

import classes from './notification.module.css'

export default {
    Notification: Notification.extend({
        classNames: classes,
        defaultProps: {
            radius: 'md',
            withBorder: true
        }
    })
}

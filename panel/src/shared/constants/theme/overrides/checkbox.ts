import { Checkbox } from '@mantine/core'

import classes from './checkbox.module.css'

export default {
    Checkbox: Checkbox.extend({
        classNames: { input: classes.input, icon: classes.icon, label: classes.label },
        defaultProps: {
            radius: 'xs'
        }
    })
}

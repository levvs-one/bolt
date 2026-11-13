import { Paper } from '@mantine/core'

import classes from './paper.module.css'

export default {
    Paper: Paper.extend({
        classNames: classes,
        defaultProps: {
            radius: 'md',
            shadow: 'none'
        }
    })
}

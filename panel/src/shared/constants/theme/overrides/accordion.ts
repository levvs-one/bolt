import { Accordion } from '@mantine/core'

import classes from './accordion.module.css'

// Пункт аккордеона — строка группы: без своей подложки и рамки, раскрывается внутри той же группы.
export default {
    Accordion: Accordion.extend({
        classNames: classes,
        defaultProps: {
            chevronPosition: 'right'
        }
    })
}

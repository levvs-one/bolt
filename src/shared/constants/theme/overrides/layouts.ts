import { Paper } from '@mantine/core'

export default {
    Paper: Paper.extend({
        defaultProps: {
            radius: 'md',
            shadow: 'none',
            bg: 'var(--bolt-surface)'
        }
    })
}

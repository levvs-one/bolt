import { Tooltip } from '@mantine/core'

export default {
    Tooltip: Tooltip.extend({
        defaultProps: {
            radius: 'sm',
            withArrow: false,
            transitionProps: { transition: 'fade', duration: 150 },
            styles: {
                tooltip: {
                    background: 'var(--bolt-accent)',
                    color: 'var(--bolt-on-accent)',
                    fontWeight: 600
                }
            }
        }
    })
}

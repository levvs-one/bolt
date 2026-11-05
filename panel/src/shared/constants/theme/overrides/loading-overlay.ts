import { LoadingOverlay } from '@mantine/core'

export default {
    LoadingOverlay: LoadingOverlay.extend({
        defaultProps: {
            zIndex: 1000,
            overlayProps: {
                radius: 'md',
                blur: 0,
                backgroundOpacity: 0.6
            }
        }
    })
}

import '@mantine/core/styles.layer.css'
import '@mantine/notifications/styles.layer.css'
import '@mantine/nprogress/styles.layer.css'
import '@gfazioli/mantine-spinner/styles.css'

import './global.css'

import { DirectionProvider, MantineProvider, v8CssVariablesResolver } from '@mantine/core'
import { polyfillCountryFlagEmojis } from 'country-flag-emoji-polyfill'
import { enableMainThreadBlocking } from 'ios-vibrator-pro-max'
import { NavigationProgress } from '@mantine/nprogress'
import { Notifications } from '@mantine/notifications'
import { ModalsProvider } from '@mantine/modals'
import { useMediaQuery } from '@mantine/hooks'

import { initDayjs } from '@shared/utils/time-utils'
import { createBoltCssVariablesResolver, theme } from '@shared/constants'

import { Router } from './app/router/router'

polyfillCountryFlagEmojis()

enableMainThreadBlocking(false)

initDayjs()

const cssVariablesResolver = createBoltCssVariablesResolver(v8CssVariablesResolver)

export function App() {
    const mq = useMediaQuery('(min-width: 40em)')

    return (
        <DirectionProvider>
            <MantineProvider
                cssVariablesResolver={cssVariablesResolver}
                defaultColorScheme="auto"
                theme={theme}
            >
                <ModalsProvider>
                    <Notifications position={mq ? 'top-right' : 'bottom-right'} />
                    <NavigationProgress />

                    <Router />
                </ModalsProvider>
            </MantineProvider>
        </DirectionProvider>
    )
}

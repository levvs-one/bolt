import { QuickLauncher } from '@shared/ui/quick-launcher'

import { BoltShell } from './bolt-shell/bolt-shell'
import { useQuickLauncherRoutes } from './menu-sections/use-quick-launcher-routes'

import '@shared/_modals/modal-registry'

export function MainLayout() {
    const launcherRoutes = useQuickLauncherRoutes()

    return (
        <>
            <BoltShell />
            <QuickLauncher routes={launcherRoutes} />
        </>
    )
}

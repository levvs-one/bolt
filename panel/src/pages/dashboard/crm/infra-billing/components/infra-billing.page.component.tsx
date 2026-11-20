import { Stack } from '@mantine/core'
import { DesktopColumnsInfraBillingWidget } from '@widgets/dashboard/infra-billing/desktop-columns'
import { MobileInfraBillingWidget } from '@widgets/dashboard/infra-billing/mobile'
import { StatsWidget } from '@widgets/dashboard/infra-billing/stats-widget/stats.widget'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { useIsMobile, usePreventTableBackScroll } from '@shared/hooks'
import { Page } from '@shared/ui/page'
import { PageHeaderShared } from '@shared/ui/page-header'

export const InfraBillingPageComponent = () => {
    const { t } = useTranslation()
    const isMobile = useIsMobile()

    usePreventTableBackScroll()

    return (
        <Page title={t('constants.infra-billing')}>
            <motion.div
                animate={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                {isMobile ? (
                    <MobileInfraBillingWidget />
                ) : (
                    <>
                        <PageHeaderShared title={t('constants.infra-billing')} />

                        <Stack>
                            <StatsWidget />

                            <DesktopColumnsInfraBillingWidget />
                        </Stack>
                    </>
                )}
            </motion.div>
        </Page>
    )
}

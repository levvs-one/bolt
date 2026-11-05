import { TSubscriptionPagePlatformKey } from '@remnawave/subscription-page-types'

import { BoltLinksWidget, BoltStatusWidget, InstallationGuideConnector, RawKeysWidget } from '@widgets/main'
import { useAppConfig, useAppConfigStoreActions, useCurrentLang } from '@entities/app-config-store'
import { LanguagePicker } from '@shared/ui/language-picker/language-picker.shared'
import { Page, BoltLogo } from '@shared/ui'

import classes from './main.page.module.css'

interface IMainPageComponentProps {
    isMobile: boolean
    platform: TSubscriptionPagePlatformKey | undefined
}

// Логотип по умолчанию из документации Remnawave не показываем: вместо него знак Bolt.
const DEFAULT_LOGO_HOST = 'docs.rw'

export const MainPageComponent = ({ isMobile, platform }: IMainPageComponentProps) => {
    const config = useAppConfig()
    const currentLang = useCurrentLang()
    const { setLanguage } = useAppConfigStoreActions()

    const logoUrl = config.brandingSettings.logoUrl
    const hasCustomLogo = Boolean(logoUrl) && !logoUrl.includes(DEFAULT_LOGO_HOST)

    const hasPlatformApps = Object.fromEntries(
        Object.entries(config.platforms).map(([key, value]) => [key, Boolean(value?.apps.length)])
    ) as Record<TSubscriptionPagePlatformKey, boolean>
    const hasApps = Object.values(hasPlatformApps).some(Boolean)

    return (
        <Page>
            <header className={classes.header}>
                <div className={classes.brand}>
                    {hasCustomLogo ? (
                        <img alt="" className={classes.logo} src={logoUrl} />
                    ) : (
                        <BoltLogo className={classes.logo} />
                    )}
                    <span className={classes.title}>{config.brandingSettings.title}</span>
                </div>
                <LanguagePicker
                    currentLang={currentLang}
                    locales={config.locales}
                    onLanguageChange={setLanguage}
                />
            </header>

            <main className={classes.content}>
                {config.uiConfig.subscriptionInfoBlockType !== 'hidden' && <BoltStatusWidget />}

                {hasApps && (
                    <InstallationGuideConnector hasPlatformApps={hasPlatformApps} platform={platform} />
                )}

                <BoltLinksWidget
                    hideGetLink={config.baseSettings.hideGetLinkButton}
                    supportUrl={config.brandingSettings.supportUrl}
                />

                <RawKeysWidget isMobile={isMobile} />
            </main>
        </Page>
    )
}

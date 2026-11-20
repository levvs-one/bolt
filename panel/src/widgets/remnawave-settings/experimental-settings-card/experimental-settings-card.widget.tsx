import { Switch } from '@mantine/core'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { TbFlask, TbLayoutSidebar, TbPlugConnected, TbRocket, TbTerminal2 } from 'react-icons/tb'

import { useIsMobile } from '@shared/hooks'
import { BoltField } from '@shared/ui/bolt-list'
import { SettingsCardShared } from '@shared/ui/settings-card'

import {
    IExperimentalFeatures,
    useExperimentalFeatures,
    useViewPreferencesStoreActions
} from '@entities/dashboard/view-preferences-store'

interface IExperimentalFeatureItem {
    desktopOnly?: boolean
    feature: keyof IExperimentalFeatures
    IconComponent: typeof TbFlask
    label: string
}

const getExperimentalFeatures = (t: TFunction): IExperimentalFeatureItem[] => [
    {
        desktopOnly: true,
        feature: 'legacyLayoutStyle',
        IconComponent: TbLayoutSidebar,
        label: t('experimental-settings-card.widget.legacy-layout-style')
    },
    {
        feature: 'nodeIntegrations',
        IconComponent: TbPlugConnected,
        label: t('node-integrations.modal.title')
    },
    {
        desktopOnly: true,
        feature: 'sshTerminal',
        IconComponent: TbTerminal2,
        label: t('node-ssh.title')
    },
    {
        desktopOnly: true,
        feature: 'quickLauncher',
        IconComponent: TbRocket,
        label: t('constants.quick-launcher')
    }
]

export const ExperimentalSettingsCardWidget = () => {
    const { t } = useTranslation()

    const isMobile = useIsMobile()

    const experimental = useExperimentalFeatures()
    const { setExperimentalFeature } = useViewPreferencesStoreActions()

    return (
        <SettingsCardShared.Container>
            <SettingsCardShared.Header
                description={t('experimental-settings-card.widget.description')}
                icon={<TbFlask size={24} />}
                iconColor="grape"
                iconVariant="soft"
                title={t('experimental-settings-card.widget.experimental-features')}
            />

            <SettingsCardShared.Content>
                <div>
                    {getExperimentalFeatures(t)
                        .filter(({ desktopOnly }) => !desktopOnly || !isMobile)
                        .map(({ feature, IconComponent, label }) => (
                            <BoltField icon={IconComponent} key={feature} label={label}>
                                <Switch
                                    checked={experimental[feature]}
                                    onChange={(event) =>
                                        setExperimentalFeature(feature, event.currentTarget.checked)
                                    }
                                />
                            </BoltField>
                        ))}
                </div>
            </SettingsCardShared.Content>
        </SettingsCardShared.Container>
    )
}

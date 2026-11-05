import {
    TSubscriptionPageButtonConfig,
    TSubscriptionPagePlatformKey
} from '@remnawave/subscription-page-types'
import { IconApps, IconCheck, IconChevronDown, IconDevices } from '@tabler/icons-react'
import { Button, Menu, UnstyledButton } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useClipboard } from '@mantine/hooks'
import { useState } from 'react'

import { constructSubscriptionUrl } from '@shared/utils/construct-subscription-url'
import { useSubscription } from '@entities/subscription-info-store'
import { getLocalizedText } from '@shared/utils/config-parser'
import { TemplateEngine } from '@shared/utils/template-engine'
import { useAppConfig } from '@entities/app-config-store'
import { boltText } from '@shared/constants/bolt-texts'
import { vibrate } from '@shared/utils/vibrate'
import { useTranslation } from '@shared/hooks'

import classes from './installation-guide.module.css'

interface IProps {
    hasPlatformApps: Record<TSubscriptionPagePlatformKey, boolean>
    platform: TSubscriptionPagePlatformKey | undefined
}

const ICON_SIZE = 18
const ICON_STROKE = 1.75

export const InstallationGuideConnector = ({ hasPlatformApps, platform }: IProps) => {
    const { t, currentLang, baseTranslations } = useTranslation()
    const { platforms } = useAppConfig()
    const { copy } = useClipboard({ timeout: 2_000 })
    const subscription = useSubscription()

    const [selectedAppIndex, setSelectedAppIndex] = useState(0)
    const [selectedPlatform, setSelectedPlatform] = useState<TSubscriptionPagePlatformKey>(() => {
        if (platform && hasPlatformApps[platform]) return platform

        return (Object.keys(hasPlatformApps) as TSubscriptionPagePlatformKey[]).find(
            (key) => hasPlatformApps[key]
        )!
    })

    const platformApps = platforms[selectedPlatform]!.apps
    const selectedApp = platformApps[selectedAppIndex] ?? platformApps[0]
    const availablePlatforms = (Object.keys(hasPlatformApps) as TSubscriptionPagePlatformKey[])
        .filter((key) => hasPlatformApps[key])
        .map((key) => ({ value: key, label: t(platforms[key]!.displayName) }))
    const currentPlatformLabel = availablePlatforms.find(
        (item) => item.value === selectedPlatform
    )?.label

    const subscriptionUrl = constructSubscriptionUrl(
        window.location.href,
        subscription.user.shortUuid
    )

    const handleButtonClick = (button: TSubscriptionPageButtonConfig) => {
        const formattedUrl =
            button.type === 'subscriptionLink' || button.type === 'copyButton'
                ? TemplateEngine.formatWithMetaInfo(button.link, {
                      username: subscription.user.username,
                      subscriptionUrl
                  })
                : undefined

        switch (button.type) {
            case 'copyButton':
                if (!formattedUrl) return
                copy(formattedUrl)
                notifications.show({
                    title: t(baseTranslations.linkCopied),
                    message: t(baseTranslations.linkCopiedToClipboard)
                })
                break
            case 'external':
                window.open(button.link, '_blank')
                break
            case 'subscriptionLink':
                if (!formattedUrl) return
                window.open(formattedUrl, '_blank')
                break
            default:
                break
        }
    }

    const selectPlatform = (value: TSubscriptionPagePlatformKey) => {
        vibrate([80])
        setSelectedPlatform(value)
        setSelectedAppIndex(0)
    }

    return (
        <>
            <div className={classes.group}>
                {availablePlatforms.length > 1 && (
                    <Menu position="bottom-end" width={220}>
                        <Menu.Target>
                            <UnstyledButton className={classes.row}>
                                <IconDevices size={ICON_SIZE + 2} stroke={ICON_STROKE} />
                                <span className={classes.rowLabel}>
                                    {boltText('platform', currentLang)}
                                </span>
                                <span className={classes.rowValue}>{currentPlatformLabel}</span>
                                <IconChevronDown size={16} stroke={ICON_STROKE} />
                            </UnstyledButton>
                        </Menu.Target>
                        <Menu.Dropdown>
                            {availablePlatforms.map((item) => (
                                <Menu.Item
                                    fw={item.value === selectedPlatform ? 700 : 500}
                                    key={item.value}
                                    onClick={() => selectPlatform(item.value)}
                                >
                                    {item.label}
                                </Menu.Item>
                            ))}
                        </Menu.Dropdown>
                    </Menu>
                )}

                {platformApps.map((app, index) => {
                    const isActive = index === selectedAppIndex

                    return (
                        <UnstyledButton
                            aria-pressed={isActive}
                            className={classes.row}
                            data-active={isActive || undefined}
                            key={app.name}
                            onClick={() => {
                                vibrate('toggle')
                                setSelectedAppIndex(index)
                            }}
                        >
                            <IconApps size={ICON_SIZE + 2} stroke={ICON_STROKE} />
                            <span className={classes.rowLabel}>{app.name}</span>
                            {app.featured && (
                                <span className={classes.rowValue}>
                                    {boltText('recommended', currentLang)}
                                </span>
                            )}
                            <span className={classes.check}>
                                {isActive && <IconCheck size={ICON_SIZE} stroke={2} />}
                            </span>
                        </UnstyledButton>
                    )
                })}
            </div>

            {selectedApp?.blocks.map((block, index) => {
                const primary = block.buttons.filter((button) => button.type === 'subscriptionLink')
                const secondary = block.buttons.filter((button) => button.type !== 'subscriptionLink')

                return (
                    <div className={classes.step} key={`${selectedApp.name}-${index}`}>
                        <div className={classes.stepNumber}>
                            {boltText('step', currentLang, { n: index + 1 })}
                        </div>
                        <div
                            className={classes.stepTitle}
                            dangerouslySetInnerHTML={{
                                __html: getLocalizedText(block.title, currentLang)
                            }}
                        />
                        <div
                            className={classes.stepText}
                            dangerouslySetInnerHTML={{
                                __html: getLocalizedText(block.description, currentLang)
                            }}
                        />
                        {secondary.length > 0 && (
                            <div className={classes.buttons}>
                                {secondary.map((button, buttonIndex) => (
                                    <Button
                                        h={44}
                                        key={buttonIndex}
                                        onClick={() => handleButtonClick(button)}
                                    >
                                        {t(button.text)}
                                    </Button>
                                ))}
                            </div>
                        )}
                        {primary.map((button, buttonIndex) => (
                            <Button
                                fullWidth
                                h={48}
                                key={buttonIndex}
                                mt={12}
                                onClick={() => handleButtonClick(button)}
                                variant="filled"
                            >
                                {t(button.text)}
                            </Button>
                        ))}
                    </div>
                )
            })}
        </>
    )
}

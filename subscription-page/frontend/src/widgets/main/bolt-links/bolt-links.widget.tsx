import { IconChevronRight, IconCopy, IconLifebuoy, IconQrcode } from '@tabler/icons-react'
import { Image, Stack, Text, UnstyledButton } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useClipboard } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { renderSVG } from 'uqr'

import { constructSubscriptionUrl } from '@shared/utils/construct-subscription-url'
import { useSubscription } from '@entities/subscription-info-store'
import { boltText } from '@shared/constants/bolt-texts'
import { vibrate } from '@shared/utils/vibrate'
import { useTranslation } from '@shared/hooks'

import classes from './bolt-links.module.css'

interface IProps {
    hideGetLink: boolean
    supportUrl: string
}

const ICON_SIZE = 20
const ICON_STROKE = 1.75
const COPY_FEEDBACK_MS = 10_000
// QR всегда чёрный на белом: так его читает любая камера независимо от темы.
const QR_DARK = '#1d1d1f'
const QR_LIGHT = '#ffffff'

export const BoltLinksWidget = ({ hideGetLink, supportUrl }: IProps) => {
    const { t, currentLang, baseTranslations } = useTranslation()
    const subscription = useSubscription()
    const clipboard = useClipboard({ timeout: COPY_FEEDBACK_MS })

    const subscriptionUrl = constructSubscriptionUrl(
        window.location.href,
        subscription.user.shortUuid
    )

    const copyLink = () => {
        vibrate('tap')
        clipboard.copy(subscriptionUrl)
        notifications.show({
            title: t(baseTranslations.linkCopied),
            message: t(baseTranslations.linkCopiedToClipboard)
        })
    }

    const openQr = () => {
        vibrate('tap')
        const qr = renderSVG(subscriptionUrl, { whiteColor: QR_LIGHT, blackColor: QR_DARK })

        modals.open({
            centered: true,
            title: t(baseTranslations.scanQrCode),
            children: (
                <Stack align="center" gap={12}>
                    <Image
                        className={classes.qr}
                        src={`data:image/svg+xml;utf8,${encodeURIComponent(qr)}`}
                    />
                    <Text fw={500} size="md" ta="center">
                        {t(baseTranslations.scanQrCodeDescription)}
                    </Text>
                </Stack>
            )
        })
    }

    return (
        <div className={classes.group}>
            {!hideGetLink && (
                <>
                    <UnstyledButton className={classes.row} onClick={copyLink}>
                        <IconCopy size={ICON_SIZE} stroke={ICON_STROKE} />
                        <span className={classes.label}>{t(baseTranslations.copyLink)}</span>
                    </UnstyledButton>
                    <UnstyledButton className={classes.row} onClick={openQr}>
                        <IconQrcode size={ICON_SIZE} stroke={ICON_STROKE} />
                        <span className={classes.label}>{boltText('qr', currentLang)}</span>
                        <IconChevronRight size={16} stroke={ICON_STROKE} />
                    </UnstyledButton>
                </>
            )}
            {supportUrl !== '' && (
                <a
                    className={classes.row}
                    href={supportUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    <IconLifebuoy size={ICON_SIZE} stroke={ICON_STROKE} />
                    <span className={classes.label}>{boltText('support', currentLang)}</span>
                    <IconChevronRight size={16} stroke={ICON_STROKE} />
                </a>
            )}
        </div>
    )
}

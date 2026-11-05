import { ActionIcon, Box, CopyButton, Progress, Stack } from '@mantine/core'
import { modals } from '@mantine/modals'
import { GetUserByIdCommand } from '@remnawave/backend-contract'
import dayjs from 'dayjs'
import { githubDarkTheme, JsonEditor } from 'json-edit-react'
import { ForwardRefComponent, HTMLMotionProps, Variants } from 'motion/react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import {
    TbBraces,
    TbCalendar,
    TbChartArcs,
    TbCheck,
    TbCopy,
    TbDevices,
    TbFlame,
    TbHistory,
    TbId,
    TbKey,
    TbLink,
    TbQrcode,
    TbRadar,
    TbServer,
    TbServerCog,
    TbUserCircle,
    TbWifi
} from 'react-icons/tb'

import { showModal } from '@shared/_modals/show-modal'
import { useGetUserMetadata } from '@shared/api/hooks'
import { BoltGroup, BoltRow } from '@shared/ui/bolt-list'
import { compactBytesUtil } from '@shared/utils/bytes'
import { getTimeAgoUtil } from '@shared/utils/time-utils'

import classes from './user-identification-card.module.css'

interface IProps {
    cardVariants: Variants
    lastConnectedNode?: null | { countryCode: string; name: string; uuid: string }
    motionWrapper: ForwardRefComponent<HTMLDivElement, HTMLMotionProps<'div'>>
    user: GetUserByIdCommand.Response['response']
}

const UNLIMITED_EXPIRE_YEAR = 2099
const ONLINE_WINDOW_MS = 2 * 60 * 1000
const PERCENT = 100

export const UserIdentificationCard = memo((props: IProps) => {
    const { t, i18n } = useTranslation()
    const { cardVariants, lastConnectedNode, motionWrapper: MotionWrapper, user } = props

    const { data: metadata } = useGetUserMetadata({ route: { userId: user.id } })

    const usedBytes = user.userTraffic.usedTrafficBytes
    const limitBytes = user.trafficLimitBytes
    const isUnlimitedTraffic = limitBytes === 0
    const percentage = isUnlimitedTraffic ? 0 : Math.min(PERCENT, (usedBytes * PERCENT) / limitBytes)

    const expireAt = dayjs(user.expireAt).locale(i18n.language)
    const onlineAt = user.userTraffic.onlineAt
    const isOnline = onlineAt !== null && Date.now() - onlineAt.getTime() < ONLINE_WINDOW_MS

    const openMetadata = () => {
        if (!metadata) return
        modals.open({
            centered: true,
            size: 'auto',
            title: t('bolt.user.metadata'),
            children: (
                <Box>
                    <JsonEditor
                        collapse={3}
                        data={metadata.metadata as object}
                        indent={4}
                        maxWidth="100%"
                        rootName=""
                        theme={githubDarkTheme}
                        viewOnly
                    />
                </Box>
            )
        })
    }

    return (
        <MotionWrapper variants={cardVariants}>
            <Stack gap={12}>
                <BoltGroup className={classes.hero}>
                    <div className={classes.heroTop}>
                        <span className={classes.status}>{t(`bolt.status.${user.status}`)}</span>
                        <span className={classes.seen}>
                            {isOnline
                                ? t('bolt.users.online')
                                : getTimeAgoUtil(onlineAt, t, i18n.language)}
                        </span>
                    </div>
                    <div className={classes.traffic}>
                        <span className={classes.trafficUsed}>{compactBytesUtil(usedBytes)}</span>
                        <span className={classes.trafficLimit}>
                            {t('bolt.user.of-limit', {
                                limit: isUnlimitedTraffic ? '∞' : compactBytesUtil(limitBytes)
                            })}
                        </span>
                    </div>
                    {!isUnlimitedTraffic && (
                        <Progress
                            classNames={{ root: classes.progress, section: classes.progressBar }}
                            size={4}
                            value={percentage}
                        />
                    )}
                </BoltGroup>

                <BoltGroup>
                    <BoltRow
                        icon={TbCalendar}
                        label={t('bolt.user.expires')}
                        value={
                            expireAt.year() === UNLIMITED_EXPIRE_YEAR
                                ? t('bolt.users.no-expiry')
                                : expireAt.format('D MMM YYYY, HH:mm')
                        }
                    />
                    <BoltRow
                        icon={TbChartArcs}
                        label={t('bolt.user.lifetime')}
                        value={compactBytesUtil(user.userTraffic.lifetimeUsedTrafficBytes)}
                    />
                    <BoltRow icon={TbId} label="ID" value={user.id} />
                    {lastConnectedNode && (
                        <BoltRow
                            icon={TbServer}
                            label={t('bolt.user.last-node')}
                            onClick={() =>
                                showModal('nodes_editNodeModal', {
                                    nodeUuid: lastConnectedNode.uuid
                                })
                            }
                            value={lastConnectedNode.name}
                        />
                    )}
                    <BoltRow
                        icon={TbLink}
                        label={t('bolt.user.subscription')}
                        rightSection={
                            <CopyButton value={user.subscriptionUrl}>
                                {({ copied, copy }) => (
                                    <ActionIcon
                                        aria-label={t('bolt.user.copy-link')}
                                        onClick={copy}
                                        size={32}
                                    >
                                        {copied ? <TbCheck size={18} /> : <TbCopy size={18} />}
                                    </ActionIcon>
                                )}
                            </CopyButton>
                        }
                        value={user.subscriptionUrl.replace(/^https?:\/\//, '')}
                    />
                </BoltGroup>

                <BoltGroup>
                    <BoltRow
                        icon={TbQrcode}
                        label={t('view-user-modal.widget.qr-code')}
                        onClick={() =>
                            showModal('users_subscriptionQrCodeModal', {
                                subscriptionUrl: user.subscriptionUrl,
                                username: user.username
                            })
                        }
                    />
                    <BoltRow
                        icon={TbKey}
                        label={t('get-user-subscription-links.feature.connection-keys')}
                        onClick={() =>
                            showModal('users_connectionKeysDrawer', {
                                userId: user.id,
                                shortUuid: user.shortUuid
                            })
                        }
                    />
                    <BoltRow
                        icon={TbDevices}
                        label={t('get-hwid-user-devices.feature.hwid-devices')}
                        onClick={() => showModal('users_userHwidDevicesModal', { userId: user.id })}
                        value={user.hwidDeviceLimit ?? undefined}
                    />
                    <BoltRow
                        icon={TbRadar}
                        label={t('common.field.active-sessions')}
                        onClick={() => showModal('users_userActiveSessionDrawer', { userId: user.id })}
                    />
                    <BoltRow
                        icon={TbWifi}
                        label={t('common.field.usage-stats')}
                        onClick={() => showModal('users_userUsageModal', { userId: user.id })}
                    />
                    <BoltRow
                        icon={TbHistory}
                        label={t('get-user-subscription-request-history.feature.request-history')}
                        onClick={() =>
                            showModal('users_userSubscriptionRequestsModal', { userId: user.id })
                        }
                    />
                    <BoltRow
                        icon={TbServerCog}
                        label={t('view-user-modal.widget.accessible-nodes')}
                        onClick={() =>
                            showModal('users_userAccessibleNodesModal', { userId: user.id })
                        }
                    />
                    <BoltRow
                        icon={TbFlame}
                        label={t('get-user-torrent-blocker-reports.feature.blocker-reports')}
                        onClick={() =>
                            showModal('users_userTorrentBlockerReportsModal', { userId: user.id })
                        }
                    />
                    <BoltRow
                        icon={TbUserCircle}
                        label={t('view-user-modal.widget.detailed-info')}
                        onClick={() => showModal('users_detailedUserInfoDrawer', { userId: user.id })}
                    />
                    {metadata && (
                        <BoltRow icon={TbBraces} label={t('bolt.user.metadata')} onClick={openMetadata} />
                    )}
                </BoltGroup>
            </Stack>
        </MotionWrapper>
    )
})

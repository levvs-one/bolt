import { modals } from '@mantine/modals'
import { GetNodesCommand, USERS_STATUS } from '@remnawave/backend-contract'
import { useTranslation } from 'react-i18next'
import {
    TbActivity,
    TbCalendarMonth,
    TbCalendarStats,
    TbCalendarWeek,
    TbClockHour4,
    TbCpu,
    TbDatabase,
    TbServer,
    TbServerOff,
    TbSun,
    TbUser,
    TbUserCancel,
    TbUserExclamation,
    TbUserOff,
    TbUsers
} from 'react-icons/tb'
import { useNavigate } from 'react-router'

import { showModal } from '@shared/_modals/show-modal'
import { useGetNodes } from '@shared/api/hooks'
import { ROUTES } from '@shared/constants'
import { useIsMobile } from '@shared/hooks'
import { LoadingScreen } from '@shared/ui'
import { BoltGroup, BoltRow } from '@shared/ui/bolt-list'
import { DisclaimerOverlay } from '@shared/ui/disclaimer-overlay'
import { Page } from '@shared/ui/page'
import { compactBytesUtil } from '@shared/utils/bytes'
import dayjs from 'dayjs'

import classes from './home.module.css'
import { IProps } from './interfaces'
import { RuntimeInfoModalContent } from './runtime-info-modal/runtime-info-modal'

type TNode = GetNodesCommand.Response['response'][number]

function nodeState(node: TNode): 'connecting' | 'disabled' | 'offline' | 'online' {
    if (node.isDisabled) return 'disabled'
    if (node.isConnected) return 'online'
    if (node.isConnecting) return 'connecting'
    return 'offline'
}

export const HomePage = (props: IProps) => {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const isMobile = useIsMobile()
    const { data: nodes } = useGetNodes()

    const { systemInfo, bandwidthStats, remnawaveHealth } = props

    if (!systemInfo || !bandwidthStats || !remnawaveHealth) {
        return <LoadingScreen />
    }

    const counts = systemInfo.users.statusCounts
    const online = systemInfo.onlineStats
    const nodeList = nodes ?? []
    const onlineNodes = nodeList.filter((node) => nodeState(node) === 'online').length
    const openUsers = () => navigate(ROUTES.DASHBOARD.MANAGEMENT.USERS)
    const bytes = (value: string) => compactBytesUtil(Number(value))

    const openRuntime = () =>
        modals.open({
            title: t('home.runtime-info.title'),
            size: 'xl',
            centered: true,
            fullScreen: isMobile,
            children: <RuntimeInfoModalContent />
        })

    return (
        <Page title={t('constants.home')}>
            <div className={classes.hero}>
                <div className={classes.heroItem}>
                    <span className={classes.heroValue}>{online.onlineNow}</span>
                    <span className={classes.heroLabel}>{t('bolt.home.online-now')}</span>
                </div>
                <div className={classes.heroItem}>
                    <span className={classes.heroValue}>
                        {onlineNodes}
                        <span className={classes.heroOf}>/{nodeList.length}</span>
                    </span>
                    <span className={classes.heroLabel}>{t('bolt.home.nodes-online')}</span>
                </div>
                <div className={classes.heroItem}>
                    <span className={classes.heroValue}>{bytes(bandwidthStats.bandwidthLastTwoDays.current)}</span>
                    <span className={classes.heroLabel}>{t('bolt.home.traffic-today')}</span>
                </div>
            </div>

            <div className={classes.columns}>
                <div className={classes.column}>
                    <BoltGroup>
                        {nodeList.map((node) => {
                            const state = nodeState(node)

                            return (
                                <BoltRow
                                    icon={state === 'online' ? TbServer : TbServerOff}
                                    key={node.uuid}
                                    label={node.name}
                                    onClick={() =>
                                        showModal('nodes_editNodeModal', { nodeUuid: node.uuid })
                                    }
                                    value={
                                        state === 'online'
                                            ? t('bolt.home.node-users', { count: node.usersOnline })
                                            : t(`bolt.node-state.${state}`)
                                    }
                                />
                            )
                        })}
                        <BoltRow
                            icon={TbServer}
                            label={t('bolt.home.all-nodes')}
                            onClick={() => navigate(ROUTES.DASHBOARD.MANAGEMENT.NODES)}
                            value={nodeList.length}
                        />
                    </BoltGroup>

                    <BoltGroup>
                        <BoltRow icon={TbSun} label={t('bolt.home.traffic-day')} value={bytes(bandwidthStats.bandwidthLastTwoDays.current)} />
                        <BoltRow icon={TbCalendarWeek} label={t('bolt.home.traffic-week')} value={bytes(bandwidthStats.bandwidthLastSevenDays.current)} />
                        <BoltRow icon={TbCalendarStats} label={t('bolt.home.traffic-30')} value={bytes(bandwidthStats.bandwidthLast30Days.current)} />
                        <BoltRow icon={TbCalendarMonth} label={t('bolt.home.traffic-month')} value={bytes(bandwidthStats.bandwidthCalendarMonth.current)} />
                        <BoltRow icon={TbDatabase} label={t('bolt.home.traffic-lifetime')} value={bytes(systemInfo.nodes.totalBytesLifetime)} />
                    </BoltGroup>
                </div>

                <div className={classes.column}>
                    <BoltGroup>
                        <BoltRow icon={TbUsers} label={t('bolt.status-plural.ALL')} onClick={openUsers} value={systemInfo.users.totalUsers} />
                        <BoltRow icon={TbUser} label={t('bolt.status-plural.ACTIVE')} onClick={openUsers} value={counts[USERS_STATUS.ACTIVE] ?? 0} />
                        <BoltRow icon={TbUserExclamation} label={t('bolt.status-plural.EXPIRED')} onClick={openUsers} value={counts[USERS_STATUS.EXPIRED] ?? 0} />
                        <BoltRow icon={TbUserCancel} label={t('bolt.status-plural.LIMITED')} onClick={openUsers} value={counts[USERS_STATUS.LIMITED] ?? 0} />
                        <BoltRow icon={TbUserOff} label={t('bolt.status-plural.DISABLED')} onClick={openUsers} value={counts[USERS_STATUS.DISABLED] ?? 0} />
                    </BoltGroup>

                    <BoltGroup>
                        <BoltRow icon={TbActivity} label={t('bolt.home.online-day')} value={online.lastDay} />
                        <BoltRow icon={TbActivity} label={t('bolt.home.online-week')} value={online.lastWeek} />
                        <BoltRow icon={TbUserOff} label={t('bolt.home.never-online')} value={online.neverOnline} />
                    </BoltGroup>

                    <BoltGroup>
                        <BoltRow icon={TbClockHour4} label={t('bolt.home.uptime')} value={dayjs.duration(systemInfo.uptime, 'seconds').locale(i18n.language).humanize()} />
                        <BoltRow icon={TbCpu} label={t('bolt.home.cpu')} value={systemInfo.cpu.cores} />
                        <BoltRow
                            icon={TbDatabase}
                            label={t('bolt.home.memory')}
                            value={`${compactBytesUtil(systemInfo.memory.used)} ${t('bolt.user.of-limit', { limit: compactBytesUtil(systemInfo.memory.total) })}`}
                        />
                        <BoltRow icon={TbActivity} label={t('home.runtime-info.title')} onClick={openRuntime} />
                    </BoltGroup>
                </div>
            </div>
            <DisclaimerOverlay />
        </Page>
    )
}

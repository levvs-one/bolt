import { OptimisticSortingPlugin } from '@dnd-kit/dom/sortable'
import { useSortable } from '@dnd-kit/react/sortable'
import { Progress } from '@mantine/core'
import clsx from 'clsx'
import { CSSProperties, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { TbGripVertical, TbServer, TbServerOff } from 'react-icons/tb'

import { compactBytesUtil, prettySiRealtimeBytesUtil } from '@shared/utils/bytes'

import { IProps } from './interfaces'
import classes from './NodeCard.module.css'

const PERCENT = 100
const ICON_STROKE = 1.75

type TNodeState = 'connecting' | 'disabled' | 'misconfigured' | 'offline' | 'online'

function getNodeState(node: IProps['node']): TNodeState {
    if (node.isDisabled) return 'disabled'
    if (
        node.configProfile.activeConfigProfileUuid === null ||
        node.configProfile.activeInbounds.length === 0
    )
        return 'misconfigured'
    if (node.isConnected) return 'online'
    if (node.isConnecting) return 'connecting'
    return 'offline'
}

export const NodeCardWidget = memo((props: IProps) => {
    const { t } = useTranslation()
    const {
        handleViewNode,
        node,
        index,
        isDragOverlay = false,
        isMobile,
        disableReordering = false,
        integrationsNames,
        pluginsName
    } = props

    const sortable = useSortable({
        id: node.uuid,
        index,
        disabled: isDragOverlay || disableReordering,
        plugins: (defaults) => defaults.filter((plugin) => plugin !== OptimisticSortingPlugin)
    })

    const isDragging = !isDragOverlay && sortable.isDragging
    const { ref, handleRef } = sortable
    const style: CSSProperties = {
        opacity: isDragging ? 0 : 1,
        zIndex: isDragging ? 1000 : 'auto'
    }

    const state = getNodeState(node)
    const isTracked = node.isTrafficTrackingActive && (node.trafficLimitBytes ?? 0) > 0
    const usedBytes = node.trafficUsedBytes ?? 0
    const percentage = isTracked
        ? Math.min(PERCENT, (usedBytes * PERCENT) / (node.trafficLimitBytes ?? 1))
        : 0
    const traffic = isTracked
        ? t('bolt.users.traffic', {
              used: compactBytesUtil(usedBytes),
              limit: compactBytesUtil(node.trafficLimitBytes)
          })
        : compactBytesUtil(usedBytes)

    const system = node.system
    const ramPercent = system
        ? Math.round((system.stats.memoryUsed * PERCENT) / system.info.memoryTotal)
        : null
    const speed = system?.stats.interface
        ? `${prettySiRealtimeBytesUtil(system.stats.interface.rxBytesPerSec, true, true)} / ${prettySiRealtimeBytesUtil(system.stats.interface.txBytesPerSec, true, true)}`
        : null

    const extras = [node.provider?.name, pluginsName, ...integrationsNames].filter(Boolean)
    const Icon = state === 'online' ? TbServer : TbServerOff

    return (
        <div
            className={clsx(classes.row, { [classes.rowDragging]: isDragging })}
            data-drag-overlay={isDragOverlay || undefined}
            onClick={() => handleViewNode(node.uuid)}
            ref={isDragOverlay ? undefined : ref}
            style={style}
        >
            {!disableReordering && !isMobile && (
                <span
                    className={classes.handle}
                    onClick={(event) => event.stopPropagation()}
                    ref={isDragOverlay ? undefined : handleRef}
                >
                    <TbGripVertical size={18} strokeWidth={ICON_STROKE} />
                </span>
            )}
            <Icon className={classes.icon} size={20} strokeWidth={ICON_STROKE} />

            <div className={classes.main}>
                <div className={classes.name}>
                    {node.countryCode !== 'XX' && (
                        <span className={classes.country}>{node.countryCode}</span>
                    )}
                    {node.name}
                </div>
                <div className={classes.facts}>
                    <span>{node.address}</span>
                    {extras.length > 0 && <span>{extras.join(', ')}</span>}
                    {isMobile && <span>{traffic}</span>}
                </div>
            </div>

            {!isMobile && (
                <>
                    <div className={classes.metric}>
                        <span className={classes.metricValue}>{traffic}</span>
                        {isTracked && (
                            <Progress
                                classNames={{ root: classes.bar, section: classes.barFill }}
                                size={3}
                                value={percentage}
                            />
                        )}
                    </div>
                    <div className={classes.metric}>
                        {ramPercent !== null && (
                            <span className={classes.metricValue}>
                                {t('bolt.nodes.ram', { percent: ramPercent })}
                            </span>
                        )}
                        {speed && <span className={classes.metricSub}>{speed}</span>}
                    </div>
                </>
            )}

            <div className={classes.side}>
                <div className={classes.state}>{t(`bolt.node-state.${state}`)}</div>
                {state === 'online' && (
                    <div className={classes.sub}>
                        {t('bolt.home.node-users', { count: node.usersOnline })}
                    </div>
                )}
            </div>
        </div>
    )
})

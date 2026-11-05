import { OptimisticSortingPlugin } from '@dnd-kit/dom/sortable'
import { useSortable } from '@dnd-kit/react/sortable'
import { Checkbox } from '@mantine/core'
import {
    GetConfigProfilesCommand,
    GetHostsCommand,
    GetNodesCommand,
    INTERNAL_SQUADS_MODE
} from '@remnawave/backend-contract'
import cx from 'clsx'
import { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { TbEyeOff, TbGripVertical, TbWorld, TbWorldOff } from 'react-icons/tb'

import { showModal } from '@shared/_modals/show-modal'
import { useIsMobile } from '@shared/hooks'

import classes from './HostCard.module.css'

export interface IProps {
    configProfiles: GetConfigProfilesCommand.Response['response']['configProfiles'] | undefined
    disableReordering?: boolean
    index?: number
    isDragOverlay?: boolean
    isSelected?: boolean
    item: GetHostsCommand.Response['response'][number]
    nodesByUuid: Map<string, GetNodesCommand.Response['response'][number]>
    onSelect?: () => void
    viewOnly?: boolean
}

const ICON_STROKE = 1.75

function isParamSet(value: unknown): boolean {
    if (value == null) return false
    if (typeof value === 'string') return value.trim().length > 0
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'object') return Object.keys(value as object).length > 0
    return true
}

export function HostCardWidget(props: IProps) {
    const {
        nodesByUuid,
        item,
        configProfiles,
        index = 0,
        isSelected,
        onSelect,
        isDragOverlay = false,
        viewOnly = false,
        disableReordering = false
    } = props

    const { t } = useTranslation()
    const isMobile = useIsMobile()

    const sortable = useSortable({
        id: item.uuid,
        index,
        disabled: isDragOverlay || disableReordering || viewOnly,
        plugins: (defaults) => defaults.filter((plugin) => plugin !== OptimisticSortingPlugin)
    })
    const isDragging = !isDragOverlay && sortable.isDragging
    const { ref, handleRef } = sortable
    const style: CSSProperties = {
        opacity: isDragging ? 0 : 1,
        zIndex: isDragging ? 1000 : 'auto',
        position: 'relative'
    }

    if (!configProfiles) return null

    const configProfile = configProfiles.find(
        (profile) => profile.uuid === item.inbound.configProfileUuid
    )
    const inboundTag = configProfile?.inbounds.find(
        (inbound) => inbound.uuid === item.inbound.configProfileInboundUuid
    )?.tag

    const nodeNames = item.nodes
        .map((nodeUuid) => nodesByUuid.get(nodeUuid)?.name)
        .filter((name): name is string => Boolean(name))

    const options = [
        isParamSet(item.muxParams) && 'Mux',
        isParamSet(item.sockoptParams) && 'Sockopt',
        isParamSet(item.finalMask) && t('bolt.hosts.mask'),
        item.xrayJsonTemplateUuid && t('bolt.hosts.template'),
        item.internalSquads.squads.length > 0 &&
            (item.internalSquads.mode === INTERNAL_SQUADS_MODE.ALLOW_ONLY
                ? t('bolt.hosts.squads-only')
                : t('bolt.hosts.squads-except')),
        ...item.tags
    ].filter(Boolean)

    const state = item.isDisabled ? 'disabled' : item.isHidden ? 'hidden' : 'active'
    const Icon = state === 'disabled' ? TbWorldOff : state === 'hidden' ? TbEyeOff : TbWorld
    const openHost = () => showModal('hosts_editHostDrawer', { hostUuid: item.uuid })

    return (
        <div
            className={cx(classes.row, {
                [classes.rowDragging]: isDragging,
                [classes.rowSelected]: isSelected
            })}
            data-drag-overlay={isDragOverlay || undefined}
            onClick={viewOnly ? undefined : openHost}
            ref={isDragOverlay ? undefined : ref}
            style={style}
        >
            {!viewOnly && (
                <Checkbox
                    checked={Boolean(isSelected)}
                    color="gray"
                    onChange={() => onSelect?.()}
                    onClick={(event) => event.stopPropagation()}
                    radius="sm"
                />
            )}
            {!viewOnly && !disableReordering && !isMobile && (
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
                <div className={classes.title}>{item.remark}</div>
                <div className={classes.facts}>
                    <span>
                        {item.address}:{item.port}
                    </span>
                    <span>
                        {configProfile
                            ? `${configProfile.name} ${inboundTag ?? ''}`.trim()
                            : t('bolt.hosts.no-profile')}
                    </span>
                    {nodeNames.length > 0 && <span>{nodeNames.join(', ')}</span>}
                    {options.length > 0 && <span>{options.join(', ')}</span>}
                </div>
            </div>

            <div className={classes.side}>{t(`bolt.hosts.state-${state}`)}</div>
        </div>
    )
}

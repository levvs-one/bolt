import type { ModalId } from './modal-registry'
import type { ParseKeys } from 'i18next'
import type { ComponentType } from 'react'

import {
    TbAdjustmentsHorizontal,
    TbBrowser,
    TbCirclesRelation,
    TbListDetails,
    TbPackage,
    TbServer,
    TbUsers,
    TbWebhook
} from 'react-icons/tb'

import { OPEN_ENTITY, ROUTES } from '@shared/constants'
import { isValidUuid } from '@shared/utils/misc'

import { showModal } from './show-modal'

interface IOpenEntityBase {
    fallback: string
    Icon: ComponentType<{ size?: number }>
    idPlaceholder: string
    titleKey: ParseKeys
    validate: (id: string) => boolean
}

interface IModalTarget extends IOpenEntityBase {
    kind: 'modal'
    modalId: ModalId
    open: (id: string) => void
}

interface IRouteTarget extends IOpenEntityBase {
    buildPath: (id: string) => string
    kind: 'route'
}

export type TOpenEntityModalTarget = IModalTarget
export type TOpenEntityTarget = IModalTarget | IRouteTarget

export const OPEN_ENTITY_TARGETS: Record<string, TOpenEntityTarget> = {
    [OPEN_ENTITY.USER]: {
        Icon: TbUsers,
        idPlaceholder: 'ID',
        titleKey: 'constants.users',
        kind: 'modal',
        modalId: 'users_viewUserModal',
        fallback: ROUTES.DASHBOARD.MANAGEMENT.USERS,
        open: (id) => showModal('users_viewUserModal', { userId: Number(id) }),
        validate: (id) => /^\d+$/.test(id)
    },
    [OPEN_ENTITY.HOST]: {
        Icon: TbListDetails,
        idPlaceholder: 'UUID',
        titleKey: 'constants.hosts',
        kind: 'modal',
        modalId: 'hosts_editHostDrawer',
        fallback: ROUTES.DASHBOARD.MANAGEMENT.HOSTS,
        open: (id) => showModal('hosts_editHostDrawer', { hostUuid: id }),
        validate: isValidUuid
    },
    [OPEN_ENTITY.NODE]: {
        Icon: TbServer,
        idPlaceholder: 'UUID',
        titleKey: 'constants.nodes',
        kind: 'modal',
        modalId: 'nodes_editNodeModal',
        fallback: ROUTES.DASHBOARD.MANAGEMENT.NODES,
        open: (id) => showModal('nodes_editNodeModal', { nodeUuid: id }),
        validate: isValidUuid
    },
    [OPEN_ENTITY.CONFIG_PROFILE]: {
        Icon: TbAdjustmentsHorizontal,
        idPlaceholder: 'UUID',
        titleKey: 'constants.config-profiles',
        kind: 'route',
        buildPath: (id) => ROUTES.DASHBOARD.MANAGEMENT.CONFIG_PROFILE_BY_UUID.replace(':uuid', id),
        fallback: ROUTES.DASHBOARD.MANAGEMENT.CONFIG_PROFILES,
        validate: isValidUuid
    },
    [OPEN_ENTITY.INTERNAL_SQUAD]: {
        Icon: TbCirclesRelation,
        idPlaceholder: 'UUID',
        titleKey: 'constants.internal-squads',
        kind: 'modal',
        modalId: 'internalSquads_internalSquadsInboundsDrawer',
        fallback: ROUTES.DASHBOARD.MANAGEMENT.INTERNAL_SQUADS,
        open: (id) => showModal('internalSquads_internalSquadsInboundsDrawer', { squadUuid: id }),
        validate: isValidUuid
    },
    [OPEN_ENTITY.EXTERNAL_SQUAD]: {
        Icon: TbWebhook,
        idPlaceholder: 'UUID',
        titleKey: 'constants.external-squads',
        kind: 'modal',
        modalId: 'externalSquads_externalSquadsDrawer',
        fallback: ROUTES.DASHBOARD.MANAGEMENT.EXTERNAL_SQUADS,
        open: (id) => showModal('externalSquads_externalSquadsDrawer', { uuid: id }),
        validate: isValidUuid
    },
    [OPEN_ENTITY.NODE_PLUGIN]: {
        Icon: TbPackage,
        idPlaceholder: 'UUID',
        titleKey: 'constants.node-plugins',
        kind: 'route',
        buildPath: (id) =>
            ROUTES.DASHBOARD.MANAGEMENT.NODE_PLUGINS.NODE_PLUGIN_BY_UUID.replace(':uuid', id),
        fallback: ROUTES.DASHBOARD.MANAGEMENT.NODE_PLUGINS.ROOT,
        validate: isValidUuid
    },
    [OPEN_ENTITY.SUBPAGE_CONFIG]: {
        Icon: TbBrowser,
        idPlaceholder: 'UUID',
        titleKey: 'constants.subscription-page',
        kind: 'route',
        buildPath: (id) =>
            ROUTES.DASHBOARD.SUBPAGE_CONFIGS.SUBPAGE_CONFIG_BY_UUID.replace(':uuid', id),
        fallback: ROUTES.DASHBOARD.SUBPAGE_CONFIGS.ROOT,
        validate: isValidUuid
    }
}

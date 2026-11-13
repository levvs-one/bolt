import { notifications } from '@mantine/notifications'
import {
    BulkNodesActionsCommand,
    BulkNodesProfileModificationCommand,
    BulkNodesUpdateCommand,
    CreateNodeCommand,
    DeleteNodeCommand,
    DisableNodeCommand,
    EnableNodeCommand,
    ReorderNodesCommand,
    ResetNodeTrafficCommand,
    RestartAllNodesCommand,
    RestartNodeCommand,
    UpdateNodeCommand
} from '@remnawave/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '../../tsq-helpers'

export const useCreateNode = createMutationHook({
    endpoint: CreateNodeCommand.TSQ_url,
    bodySchema: CreateNodeCommand.RequestBodySchema,
    responseSchema: CreateNodeCommand.ResponseSchema,
    requestMethod: CreateNodeCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.node-created'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useUpdateNode = createMutationHook({
    endpoint: UpdateNodeCommand.TSQ_url,
    bodySchema: UpdateNodeCommand.RequestBodySchema,
    responseSchema: UpdateNodeCommand.ResponseSchema,
    requestMethod: UpdateNodeCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.node-updated'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useDeleteNode = createMutationHook({
    endpoint: DeleteNodeCommand.TSQ_url,
    routeParamsSchema: DeleteNodeCommand.RequestParamSchema,
    requestMethod: DeleteNodeCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.node-deleted'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useEnableNode = createMutationHook({
    endpoint: EnableNodeCommand.TSQ_url,
    responseSchema: EnableNodeCommand.ResponseSchema,
    routeParamsSchema: EnableNodeCommand.RequestParamSchema,
    requestMethod: EnableNodeCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.node-enabled'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useDisableNode = createMutationHook({
    endpoint: DisableNodeCommand.TSQ_url,
    responseSchema: DisableNodeCommand.ResponseSchema,
    routeParamsSchema: DisableNodeCommand.RequestParamSchema,
    requestMethod: DisableNodeCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.node-disabled'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useRestartAllNodes = createMutationHook({
    endpoint: RestartAllNodesCommand.TSQ_url,
    bodySchema: RestartAllNodesCommand.RequestBodySchema,
    requestMethod: RestartAllNodesCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.please-wait-for-the-nodes-to-reconnect'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})
export const useReorderNodes = createMutationHook({
    endpoint: ReorderNodesCommand.TSQ_url,
    bodySchema: ReorderNodesCommand.RequestBodySchema,
    responseSchema: ReorderNodesCommand.ResponseSchema,
    requestMethod: ReorderNodesCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useRestartNode = createMutationHook({
    endpoint: RestartNodeCommand.TSQ_url,
    routeParamsSchema: RestartNodeCommand.RequestParamSchema,
    bodySchema: RestartNodeCommand.RequestBodySchema,
    requestMethod: RestartNodeCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.node-restarted'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useResetNodeTraffic = createMutationHook({
    endpoint: ResetNodeTrafficCommand.TSQ_url,
    routeParamsSchema: ResetNodeTrafficCommand.RequestParamSchema,
    requestMethod: ResetNodeTrafficCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.node-traffic-reset'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useBulkNodesProfileModification = createMutationHook({
    endpoint: BulkNodesProfileModificationCommand.TSQ_url,
    bodySchema: BulkNodesProfileModificationCommand.RequestBodySchema,
    requestMethod: BulkNodesProfileModificationCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.task-added-to-queue'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useBulkNodesActions = createMutationHook({
    endpoint: BulkNodesActionsCommand.TSQ_url,
    bodySchema: BulkNodesActionsCommand.RequestBodySchema,
    requestMethod: BulkNodesActionsCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.actions-added-to-queue'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useBulkNodesUpdate = createMutationHook({
    endpoint: BulkNodesUpdateCommand.TSQ_url,
    bodySchema: BulkNodesUpdateCommand.RequestBodySchema,
    requestMethod: BulkNodesUpdateCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.nodes-updated'),
                color: 'teal'
            })
        },
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})

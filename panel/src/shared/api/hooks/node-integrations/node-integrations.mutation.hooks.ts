import { notifications } from '@mantine/notifications'
import {
    CreateNodeIntegrationCommand,
    DeleteNodeIntegrationCommand,
    UpdateNodeIntegrationCommand
} from '@remnawave/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '../../tsq-helpers'

export const useCreateNodeIntegration = createMutationHook({
    endpoint: CreateNodeIntegrationCommand.TSQ_url,
    bodySchema: CreateNodeIntegrationCommand.RequestBodySchema,
    responseSchema: CreateNodeIntegrationCommand.ResponseSchema,
    requestMethod: CreateNodeIntegrationCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.node-integration-created'),
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

export const useUpdateNodeIntegration = createMutationHook({
    endpoint: UpdateNodeIntegrationCommand.TSQ_url,
    bodySchema: UpdateNodeIntegrationCommand.RequestBodySchema,
    responseSchema: UpdateNodeIntegrationCommand.ResponseSchema,
    requestMethod: UpdateNodeIntegrationCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.node-integration-updated'),
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

export const useDeleteNodeIntegration = createMutationHook({
    endpoint: DeleteNodeIntegrationCommand.TSQ_url,
    routeParamsSchema: DeleteNodeIntegrationCommand.RequestParamSchema,
    requestMethod: DeleteNodeIntegrationCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.node-integration-deleted'),
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

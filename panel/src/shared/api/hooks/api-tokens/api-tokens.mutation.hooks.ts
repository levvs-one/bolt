import { notifications } from '@mantine/notifications'
import {
    CreateApiTokenCommand,
    DeleteApiTokenCommand,
    GetOttCommand
} from '@remnawave/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '@shared/api/tsq-helpers/create-mutation-hook'

export const useCreateApiToken = createMutationHook({
    endpoint: CreateApiTokenCommand.TSQ_url,
    bodySchema: CreateApiTokenCommand.RequestBodySchema,
    responseSchema: CreateApiTokenCommand.ResponseSchema,
    requestMethod: CreateApiTokenCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.api-token-created'),
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

export const useDeleteApiToken = createMutationHook({
    endpoint: DeleteApiTokenCommand.TSQ_url,
    routeParamsSchema: DeleteApiTokenCommand.RequestParamSchema,
    requestMethod: DeleteApiTokenCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.api-token-deleted'),
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

export const useIssueOtt = createMutationHook({
    endpoint: GetOttCommand.TSQ_url,
    responseSchema: GetOttCommand.ResponseSchema,
    requestMethod: GetOttCommand.endpointDetails.REQUEST_METHOD
})

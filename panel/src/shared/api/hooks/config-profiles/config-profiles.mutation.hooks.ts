import { notifications } from '@mantine/notifications'
import {
    CreateConfigProfileCommand,
    DeleteConfigProfileCommand,
    ReorderConfigProfileCommand,
    SetConfigProfileTagsCommand,
    UpdateConfigProfileCommand
} from '@remnawave/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '../../tsq-helpers'

export const useUpdateConfigProfile = createMutationHook({
    endpoint: UpdateConfigProfileCommand.TSQ_url,
    bodySchema: UpdateConfigProfileCommand.RequestBodySchema,
    responseSchema: UpdateConfigProfileCommand.ResponseSchema,
    requestMethod: UpdateConfigProfileCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.config-updated'),
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

export const useDeleteConfigProfile = createMutationHook({
    endpoint: DeleteConfigProfileCommand.TSQ_url,
    routeParamsSchema: DeleteConfigProfileCommand.RequestParamSchema,
    requestMethod: DeleteConfigProfileCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.config-deleted'),
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

export const useCreateConfigProfile = createMutationHook({
    endpoint: CreateConfigProfileCommand.TSQ_url,
    responseSchema: CreateConfigProfileCommand.ResponseSchema,
    bodySchema: CreateConfigProfileCommand.RequestBodySchema,
    requestMethod: CreateConfigProfileCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.config-created'),
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

export const useReorderConfigProfiles = createMutationHook({
    endpoint: ReorderConfigProfileCommand.TSQ_url,
    bodySchema: ReorderConfigProfileCommand.RequestBodySchema,
    responseSchema: ReorderConfigProfileCommand.ResponseSchema,
    requestMethod: ReorderConfigProfileCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useSetConfigProfilesTags = createMutationHook({
    endpoint: SetConfigProfileTagsCommand.TSQ_url,
    bodySchema: SetConfigProfileTagsCommand.RequestBodySchema,
    responseSchema: SetConfigProfileTagsCommand.ResponseSchema,
    requestMethod: SetConfigProfileTagsCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})

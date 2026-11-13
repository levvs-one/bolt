import { notifications } from '@mantine/notifications'
import {
    CloneSubpageConfigCommand,
    CreateSubpageConfigCommand,
    DeleteSubpageConfigCommand,
    ReorderSubpageConfigsCommand,
    SetSubpageConfigTagsCommand,
    UpdateSubpageConfigCommand
} from '@remnawave/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '../../tsq-helpers'

export const useUpdateSubpageConfig = createMutationHook({
    endpoint: UpdateSubpageConfigCommand.TSQ_url,
    bodySchema: UpdateSubpageConfigCommand.RequestBodySchema,
    responseSchema: UpdateSubpageConfigCommand.ResponseSchema,
    requestMethod: UpdateSubpageConfigCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.subscription-page-config-updated'),
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

export const useCreateSubpageConfig = createMutationHook({
    endpoint: CreateSubpageConfigCommand.TSQ_url,
    bodySchema: CreateSubpageConfigCommand.RequestBodySchema,
    responseSchema: CreateSubpageConfigCommand.ResponseSchema,
    requestMethod: CreateSubpageConfigCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.subscription-page-config-created'),
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

export const useDeleteSubpageConfig = createMutationHook({
    endpoint: DeleteSubpageConfigCommand.TSQ_url,
    routeParamsSchema: DeleteSubpageConfigCommand.RequestParamSchema,
    requestMethod: DeleteSubpageConfigCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.subscription-page-config-deleted'),
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

export const useReorderSubpageConfigs = createMutationHook({
    endpoint: ReorderSubpageConfigsCommand.TSQ_url,
    bodySchema: ReorderSubpageConfigsCommand.RequestBodySchema,
    responseSchema: ReorderSubpageConfigsCommand.ResponseSchema,
    requestMethod: ReorderSubpageConfigsCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useCloneSubpageConfig = createMutationHook({
    endpoint: CloneSubpageConfigCommand.TSQ_url,
    bodySchema: CloneSubpageConfigCommand.RequestBodySchema,
    responseSchema: CloneSubpageConfigCommand.ResponseSchema,
    requestMethod: CloneSubpageConfigCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.subscription-page-config-cloned'),
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

export const useSetSubpageConfigsTags = createMutationHook({
    endpoint: SetSubpageConfigTagsCommand.TSQ_url,
    bodySchema: SetSubpageConfigTagsCommand.RequestBodySchema,
    responseSchema: SetSubpageConfigTagsCommand.ResponseSchema,
    requestMethod: SetSubpageConfigTagsCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})

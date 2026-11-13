import { notifications } from '@mantine/notifications'
import {
    CreateSnippetCommand,
    DeleteSnippetCommand,
    UpdateSnippetCommand,
    SyncSnippetCommand
} from '@remnawave/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '../../tsq-helpers'

export const useUpdateSnippet = createMutationHook({
    endpoint: UpdateSnippetCommand.TSQ_url,
    bodySchema: UpdateSnippetCommand.RequestBodySchema,
    responseSchema: UpdateSnippetCommand.ResponseSchema,
    requestMethod: UpdateSnippetCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.snippet-updated'),
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

export const useDeleteSnippet = createMutationHook({
    endpoint: DeleteSnippetCommand.TSQ_url,
    bodySchema: DeleteSnippetCommand.RequestBodySchema,
    requestMethod: DeleteSnippetCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.snippet-deleted'),
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

export const useCreateSnippet = createMutationHook({
    endpoint: CreateSnippetCommand.TSQ_url,
    responseSchema: CreateSnippetCommand.ResponseSchema,
    bodySchema: CreateSnippetCommand.RequestBodySchema,
    requestMethod: CreateSnippetCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.snippet-created'),
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

export const useSyncSnippet = createMutationHook({
    endpoint: SyncSnippetCommand.TSQ_url,
    bodySchema: SyncSnippetCommand.RequestBodySchema,
    requestMethod: SyncSnippetCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.snippet-synced'),
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

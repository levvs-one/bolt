import { notifications } from '@mantine/notifications'
import {
    CreateSubscriptionTemplateCommand,
    DeleteSubscriptionTemplateCommand,
    ReorderSubscriptionTemplateCommand,
    SetSubscriptionTemplateTagsCommand,
    UpdateSubscriptionTemplateCommand
} from '@remnawave/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '../../tsq-helpers'

export const useUpdateSubscriptionTemplate = createMutationHook({
    endpoint: UpdateSubscriptionTemplateCommand.TSQ_url,
    bodySchema: UpdateSubscriptionTemplateCommand.RequestBodySchema,
    responseSchema: UpdateSubscriptionTemplateCommand.ResponseSchema,
    requestMethod: UpdateSubscriptionTemplateCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.subscription-template-updated'),
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

export const useCreateSubscriptionTemplate = createMutationHook({
    endpoint: CreateSubscriptionTemplateCommand.TSQ_url,
    bodySchema: CreateSubscriptionTemplateCommand.RequestBodySchema,
    responseSchema: CreateSubscriptionTemplateCommand.ResponseSchema,
    requestMethod: CreateSubscriptionTemplateCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.subscription-template-created'),
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

export const useDeleteSubscriptionTemplate = createMutationHook({
    endpoint: DeleteSubscriptionTemplateCommand.TSQ_url,
    routeParamsSchema: DeleteSubscriptionTemplateCommand.RequestParamSchema,
    requestMethod: DeleteSubscriptionTemplateCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.subscription-template-deleted'),
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

export const useReorderSubscriptionTemplates = createMutationHook({
    endpoint: ReorderSubscriptionTemplateCommand.TSQ_url,
    bodySchema: ReorderSubscriptionTemplateCommand.RequestBodySchema,
    responseSchema: ReorderSubscriptionTemplateCommand.ResponseSchema,
    requestMethod: ReorderSubscriptionTemplateCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useSetSubscriptionTemplatesTags = createMutationHook({
    endpoint: SetSubscriptionTemplateTagsCommand.TSQ_url,
    bodySchema: SetSubscriptionTemplateTagsCommand.RequestBodySchema,
    responseSchema: SetSubscriptionTemplateTagsCommand.ResponseSchema,
    requestMethod: SetSubscriptionTemplateTagsCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})

import { notifications } from '@mantine/notifications'
import {
    CreateInfraBillingRecordCommand,
    CreateInfraBillingNodeCommand,
    CreateInfraProviderCommand,
    DeleteInfraBillingRecordCommand,
    DeleteInfraBillingNodeCommand,
    DeleteInfraProviderCommand,
    UpdateInfraBillingNodeCommand,
    UpdateInfraProviderCommand
} from '@remnawave/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '../../tsq-helpers'

export const useUpdateInfraProvider = createMutationHook({
    endpoint: UpdateInfraProviderCommand.TSQ_url,
    bodySchema: UpdateInfraProviderCommand.RequestBodySchema,
    responseSchema: UpdateInfraProviderCommand.ResponseSchema,
    requestMethod: UpdateInfraProviderCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.infra-provider-updated'),
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

export const useDeleteInfraProvider = createMutationHook({
    endpoint: DeleteInfraProviderCommand.TSQ_url,
    routeParamsSchema: DeleteInfraProviderCommand.RequestParamSchema,
    requestMethod: DeleteInfraProviderCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.infra-provider-deleted'),
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

export const useCreateInfraProvider = createMutationHook({
    endpoint: CreateInfraProviderCommand.TSQ_url,
    responseSchema: CreateInfraProviderCommand.ResponseSchema,
    bodySchema: CreateInfraProviderCommand.RequestBodySchema,
    requestMethod: CreateInfraProviderCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.infra-provider-created'),
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

export const useDeleteInfraBillingHistoryRecord = createMutationHook({
    endpoint: DeleteInfraBillingRecordCommand.TSQ_url,
    routeParamsSchema: DeleteInfraBillingRecordCommand.RequestParamSchema,
    requestMethod: DeleteInfraBillingRecordCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.infra-billing-history-record-deleted'),
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

export const useCreateInfraBillingHistoryRecord = createMutationHook({
    endpoint: CreateInfraBillingRecordCommand.TSQ_url,
    responseSchema: CreateInfraBillingRecordCommand.ResponseSchema,
    bodySchema: CreateInfraBillingRecordCommand.RequestBodySchema,
    requestMethod: CreateInfraBillingRecordCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.infra-billing-history-record-created'),
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

export const useCreateInfraBillingNode = createMutationHook({
    endpoint: CreateInfraBillingNodeCommand.TSQ_url,
    responseSchema: CreateInfraBillingNodeCommand.ResponseSchema,
    bodySchema: CreateInfraBillingNodeCommand.RequestBodySchema,
    requestMethod: CreateInfraBillingNodeCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.infra-billing-node-created'),
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

export const useDeleteInfraBillingNode = createMutationHook({
    endpoint: DeleteInfraBillingNodeCommand.TSQ_url,
    routeParamsSchema: DeleteInfraBillingNodeCommand.RequestParamSchema,
    requestMethod: DeleteInfraBillingNodeCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.infra-billing-node-deleted'),
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

export const useUpdateInfraBillingNode = createMutationHook({
    endpoint: UpdateInfraBillingNodeCommand.TSQ_url,
    bodySchema: UpdateInfraBillingNodeCommand.RequestBodySchema,
    responseSchema: UpdateInfraBillingNodeCommand.ResponseSchema,
    requestMethod: UpdateInfraBillingNodeCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.infra-billing-node-updated'),
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

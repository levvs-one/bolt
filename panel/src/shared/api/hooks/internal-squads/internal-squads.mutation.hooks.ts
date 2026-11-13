import { notifications } from '@mantine/notifications'
import {
    AddUsersToInternalSquadCommand,
    CreateInternalSquadCommand,
    DeleteInternalSquadCommand,
    DeleteUsersFromInternalSquadCommand,
    ReorderInternalSquadCommand,
    SetInternalSquadTagsCommand,
    UpdateInternalSquadCommand
} from '@remnawave/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '../../tsq-helpers'

export const useUpdateInternalSquad = createMutationHook({
    endpoint: UpdateInternalSquadCommand.TSQ_url,
    bodySchema: UpdateInternalSquadCommand.RequestBodySchema,
    responseSchema: UpdateInternalSquadCommand.ResponseSchema,
    requestMethod: UpdateInternalSquadCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.internal-squad-updated'),
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

export const useDeleteInternalSquad = createMutationHook({
    endpoint: DeleteInternalSquadCommand.TSQ_url,
    routeParamsSchema: DeleteInternalSquadCommand.RequestParamSchema,
    requestMethod: DeleteInternalSquadCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.internal-squad-deleted'),
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

export const useCreateInternalSquad = createMutationHook({
    endpoint: CreateInternalSquadCommand.TSQ_url,
    responseSchema: CreateInternalSquadCommand.ResponseSchema,
    bodySchema: CreateInternalSquadCommand.RequestBodySchema,
    requestMethod: CreateInternalSquadCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.internal-squad-created'),
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

export const useAddUsersToInternalSquad = createMutationHook({
    endpoint: AddUsersToInternalSquadCommand.TSQ_url,
    routeParamsSchema: AddUsersToInternalSquadCommand.RequestParamSchema,
    requestMethod: AddUsersToInternalSquadCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useDeleteUsersFromInternalSquad = createMutationHook({
    endpoint: DeleteUsersFromInternalSquadCommand.TSQ_url,
    routeParamsSchema: DeleteUsersFromInternalSquadCommand.RequestParamSchema,
    requestMethod: DeleteUsersFromInternalSquadCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useReorderInternalSquads = createMutationHook({
    endpoint: ReorderInternalSquadCommand.TSQ_url,
    bodySchema: ReorderInternalSquadCommand.RequestBodySchema,
    responseSchema: ReorderInternalSquadCommand.ResponseSchema,
    requestMethod: ReorderInternalSquadCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useSetInternalSquadsTags = createMutationHook({
    endpoint: SetInternalSquadTagsCommand.TSQ_url,
    bodySchema: SetInternalSquadTagsCommand.RequestBodySchema,
    responseSchema: SetInternalSquadTagsCommand.ResponseSchema,
    requestMethod: SetInternalSquadTagsCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})

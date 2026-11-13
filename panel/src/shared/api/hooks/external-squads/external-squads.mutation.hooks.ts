import { notifications } from '@mantine/notifications'
import {
    AddUsersToExternalSquadCommand,
    CreateExternalSquadCommand,
    DeleteExternalSquadCommand,
    DeleteUsersFromExternalSquadCommand,
    ReorderExternalSquadCommand,
    SetExternalSquadTagsCommand,
    UpdateExternalSquadCommand
} from '@remnawave/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '../../tsq-helpers'

export const useUpdateExternalSquad = createMutationHook({
    endpoint: UpdateExternalSquadCommand.TSQ_url,
    bodySchema: UpdateExternalSquadCommand.RequestBodySchema,
    responseSchema: UpdateExternalSquadCommand.ResponseSchema,
    requestMethod: UpdateExternalSquadCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.external-squad-updated'),
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

export const useDeleteExternalSquad = createMutationHook({
    endpoint: DeleteExternalSquadCommand.TSQ_url,
    routeParamsSchema: DeleteExternalSquadCommand.RequestParamSchema,
    requestMethod: DeleteExternalSquadCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.external-squad-deleted'),
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

export const useCreateExternalSquad = createMutationHook({
    endpoint: CreateExternalSquadCommand.TSQ_url,
    responseSchema: CreateExternalSquadCommand.ResponseSchema,
    bodySchema: CreateExternalSquadCommand.RequestBodySchema,
    requestMethod: CreateExternalSquadCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.external-squad-created'),
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

export const useAddUsersToExternalSquad = createMutationHook({
    endpoint: AddUsersToExternalSquadCommand.TSQ_url,
    routeParamsSchema: AddUsersToExternalSquadCommand.RequestParamSchema,
    requestMethod: AddUsersToExternalSquadCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useDeleteUsersFromExternalSquad = createMutationHook({
    endpoint: DeleteUsersFromExternalSquadCommand.TSQ_url,
    routeParamsSchema: DeleteUsersFromExternalSquadCommand.RequestParamSchema,
    requestMethod: DeleteUsersFromExternalSquadCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useReorderExternalSquads = createMutationHook({
    endpoint: ReorderExternalSquadCommand.TSQ_url,
    bodySchema: ReorderExternalSquadCommand.RequestBodySchema,
    responseSchema: ReorderExternalSquadCommand.ResponseSchema,
    requestMethod: ReorderExternalSquadCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})

export const useSetExternalSquadsTags = createMutationHook({
    endpoint: SetExternalSquadTagsCommand.TSQ_url,
    bodySchema: SetExternalSquadTagsCommand.RequestBodySchema,
    responseSchema: SetExternalSquadTagsCommand.ResponseSchema,
    requestMethod: SetExternalSquadTagsCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onError: (error) => {
            notifications.show({
                message: error instanceof Error ? error.message : t('bolt.toast.unknown-error'),
                color: 'red'
            })
        }
    }
})

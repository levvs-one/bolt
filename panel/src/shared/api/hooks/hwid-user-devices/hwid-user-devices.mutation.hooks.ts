import { notifications } from '@mantine/notifications'
import {
    DeleteAllUserHwidDevicesCommand,
    DeleteUserHwidDeviceCommand
} from '@remnawave/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '../../tsq-helpers'

export const useDeleteUserHwidDevice = createMutationHook({
    endpoint: DeleteUserHwidDeviceCommand.TSQ_url,
    bodySchema: DeleteUserHwidDeviceCommand.RequestBodySchema,
    responseSchema: DeleteUserHwidDeviceCommand.ResponseSchema,
    requestMethod: DeleteUserHwidDeviceCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.device-deleted'),
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

export const useDeleteAllUserHwidDevices = createMutationHook({
    endpoint: DeleteAllUserHwidDevicesCommand.TSQ_url,
    bodySchema: DeleteAllUserHwidDevicesCommand.RequestBodySchema,
    responseSchema: DeleteAllUserHwidDevicesCommand.ResponseSchema,
    requestMethod: DeleteAllUserHwidDevicesCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.all-devices-deleted'),
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

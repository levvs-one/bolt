import { notifications } from '@mantine/notifications'
import { UpdateSubscriptionSettingsCommand } from '@remnawave/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '../../tsq-helpers'

export const useUpdateSubscriptionSettings = createMutationHook({
    endpoint: UpdateSubscriptionSettingsCommand.TSQ_url,
    bodySchema: UpdateSubscriptionSettingsCommand.RequestBodySchema,
    responseSchema: UpdateSubscriptionSettingsCommand.ResponseSchema,
    requestMethod: UpdateSubscriptionSettingsCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.subscription-settings-updated'),
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

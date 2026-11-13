import { notifications } from '@mantine/notifications'
import { UpdateRemnawaveSettingsCommand } from '@remnawave/backend-contract'
import { t } from 'i18next'

import { createMutationHook } from '../../tsq-helpers'

export const useUpdateRemnawaveSettings = createMutationHook({
    endpoint: UpdateRemnawaveSettingsCommand.TSQ_url,
    bodySchema: UpdateRemnawaveSettingsCommand.RequestBodySchema,
    responseSchema: UpdateRemnawaveSettingsCommand.ResponseSchema,
    requestMethod: UpdateRemnawaveSettingsCommand.endpointDetails.REQUEST_METHOD,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                message: t('bolt.toast.remnawave-settings-updated'),
                color: 'teal'
            })
        }
    }
})

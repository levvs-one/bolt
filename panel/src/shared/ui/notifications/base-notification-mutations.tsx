import { notifications } from '@mantine/notifications'
import { t } from 'i18next'
import { TbCheck as IconCheck } from 'react-icons/tb'

export const baseNotificationsMutations = (id: string, refetch: () => void) => {
    return {
        onMutate: () => {
            notifications.show({
                id,
                loading: true,
                title: t('bolt.text.processing'),
                message: t('bolt.text.may-take-time'),
                autoClose: false,
                withCloseButton: false
            })

            return undefined
        },
        onSettled(error: unknown) {
            if (error) {
                notifications.update({
                    id,
                    color: 'red',
                    title: t('bolt.text.error'),
                    message: error instanceof Error ? error.message : 'Unknown error',
                    loading: false,
                    autoClose: 5000
                })
            }
        },
        onSuccess: () => {
            notifications.update({
                icon: <IconCheck size={18} />,
                id,
                color: 'teal',
                title: t('bolt.text.success'),
                message: t('bolt.text.task-queued'),
                loading: false,
                autoClose: 3000
            })

            refetch()
        }
    }
}

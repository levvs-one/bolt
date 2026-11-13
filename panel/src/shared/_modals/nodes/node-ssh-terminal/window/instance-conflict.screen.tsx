import { Center } from '@mantine/core'
import { t } from 'i18next'
import { TbBrowserX } from 'react-icons/tb'

import { EmptyPageLayout } from '@shared/ui/layouts/empty-page'

export const InstanceConflictScreen = () => (
    <Center flex={1} p="md">
        <EmptyPageLayout icon={<TbBrowserX size={32} />} title={t('bolt.text.open-elsewhere')} />
    </Center>
)

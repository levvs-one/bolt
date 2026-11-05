import { SegmentedControl, Stack } from '@mantine/core'
import { useLocalStorage } from '@mantine/hooks'
import { BoltUsersListWidget } from '@widgets/dashboard/users/bolt-users-list'
import { UserTableWidget } from '@widgets/dashboard/users/users-table'
import { useTranslation } from 'react-i18next'

import { Page } from '@shared/ui/page'

import classes from './users.page.module.css'

type TUsersView = 'list' | 'table'

const VIEW_STORAGE_KEY = 'bolt-users-view'

export default function UsersPageComponent() {
    const { t } = useTranslation()
    const [view, setView] = useLocalStorage<TUsersView>({
        key: VIEW_STORAGE_KEY,
        defaultValue: 'list'
    })

    return (
        <Page title={t('bolt.users.title')}>
            <Stack gap={12}>
                <div className={classes.header}>
                    <h1 className={classes.title}>{t('bolt.users.title')}</h1>
                    <SegmentedControl
                        data={[
                            { value: 'list', label: t('bolt.users.view-list') },
                            { value: 'table', label: t('bolt.users.view-table') }
                        ]}
                        onChange={(value) => setView(value as TUsersView)}
                        size="sm"
                        value={view}
                    />
                </div>
                {view === 'list' ? <BoltUsersListWidget /> : <UserTableWidget />}
            </Stack>
        </Page>
    )
}

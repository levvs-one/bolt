import { createSpotlight, Spotlight } from '@mantine/spotlight'
import { useDebouncedValue } from '@mantine/hooks'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbSearch, TbUser, TbUserPlus } from 'react-icons/tb'
import { useNavigate } from 'react-router'

import { showModal } from '@shared/_modals/show-modal'
import { useGetUsers } from '@shared/api/hooks'

import { MenuItem } from '../menu-sections/interfaces'
import classes from './command-palette.module.css'

const [paletteStore, paletteActions] = createSpotlight()

export const openCommandPalette = paletteActions.open

const SHORTCUT = ['mod + K', '/']
const USER_SEARCH_MIN_LENGTH = 2
const USER_SEARCH_LIMIT = 8
const USER_SEARCH_DEBOUNCE_MS = 200
const ICON_SIZE = 18
const ICON_STROKE = 1.75

interface IProps {
    groups: MenuItem[]
}

export function CommandPalette({ groups }: IProps) {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [query, setQuery] = useState('')
    const [debouncedQuery] = useDebouncedValue(query.trim(), USER_SEARCH_DEBOUNCE_MS)
    const isUserSearch = debouncedQuery.length >= USER_SEARCH_MIN_LENGTH

    const { data: usersResponse } = useGetUsers({
        query: {
            start: 0,
            size: USER_SEARCH_LIMIT,
            filters: [{ id: 'username', value: debouncedQuery }],
            filterModes: { username: 'contains' }
        },
        rQueryParams: { enabled: isUserSearch, refetchInterval: false }
    })

    const pages = useMemo(
        () =>
            groups.flatMap((group) =>
                group.section.map((item) => ({
                    id: item.id,
                    label: item.name,
                    group: group.header,
                    href: item.href,
                    Icon: item.icon
                }))
            ),
        [groups]
    )

    const normalizedQuery = query.trim().toLowerCase()
    const matchedPages = pages.filter(
        (page) =>
            !normalizedQuery ||
            page.label.toLowerCase().includes(normalizedQuery) ||
            page.group?.toLowerCase().includes(normalizedQuery)
    )
    const users = isUserSearch ? (usersResponse?.users ?? []) : []

    const createUser = () => showModal('users_createUserModal')

    return (
        <Spotlight.Root
            classNames={{ content: classes.content, body: classes.body }}
            onQueryChange={setQuery}
            query={query}
            scrollable
            shortcut={SHORTCUT}
            store={paletteStore}
        >
            <Spotlight.Search
                classNames={{ input: classes.search }}
                leftSection={<TbSearch size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
                placeholder={t('bolt.palette.placeholder')}
            />
            <Spotlight.ActionsList className={classes.list}>
                {users.map((user) => (
                    <Spotlight.Action
                        className={classes.action}
                        key={user.shortUuid}
                        leftSection={<TbUser size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
                        onClick={() => showModal('users_viewUserModal', { userId: user.id })}
                        rightSection={<span className={classes.meta}>{user.status}</span>}
                    >
                        <span className={classes.label}>{user.username}</span>
                    </Spotlight.Action>
                ))}

                {!normalizedQuery && (
                    <Spotlight.Action
                        className={classes.action}
                        leftSection={<TbUserPlus size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
                        onClick={createUser}
                    >
                        <span className={classes.label}>{t('bolt.palette.create-user')}</span>
                    </Spotlight.Action>
                )}

                {matchedPages.map(({ Icon, ...page }) => (
                    <Spotlight.Action
                        className={classes.action}
                        key={page.id}
                        leftSection={<Icon size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
                        onClick={() => navigate(page.href)}
                        rightSection={
                            page.group && page.group !== page.label ? (
                                <span className={classes.meta}>{page.group}</span>
                            ) : undefined
                        }
                    >
                        <span className={classes.label}>{page.label}</span>
                    </Spotlight.Action>
                ))}

                {users.length === 0 && matchedPages.length === 0 && (
                    <Spotlight.Empty className={classes.empty}>
                        {t('bolt.palette.nothing-found')}
                    </Spotlight.Empty>
                )}
            </Spotlight.ActionsList>
        </Spotlight.Root>
    )
}

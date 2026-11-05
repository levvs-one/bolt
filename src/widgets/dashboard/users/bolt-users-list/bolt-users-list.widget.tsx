import { ActionIcon, Button, Checkbox, Menu, TextInput } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { GetUsersCommand, TUsersStatus, USERS_STATUS } from '@remnawave/backend-contract'
import dayjs from 'dayjs'
import { KeyboardEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbArrowsSort, TbPlus, TbSearch, TbUser, TbUserOff } from 'react-icons/tb'

import { showModal } from '@shared/_modals/show-modal'
import { QueryKeys, useGetSystemStats, useGetUsers } from '@shared/api/hooks'
import { queryClient } from '@shared/api/query-client'
import { useIsMobile } from '@shared/hooks'
import { compactBytesUtil } from '@shared/utils/bytes'
import { getTimeAgoUtil, sToMs } from '@shared/utils/time-utils'

import {
    useUsersTableSelectionStoreActions,
    useUsersTableSelectionStoreTableSelection
} from '@entities/dashboard/users/users-table-selection'

import classes from './bolt-users-list.module.css'

type TUser = GetUsersCommand.Response['response']['users'][number]
type TStatusFilter = 'ALL' | TUsersStatus
type TSort = 'created' | 'expire' | 'online' | 'traffic'

const PAGE_SIZE = 50
const SEARCH_DEBOUNCE_MS = 250
const ONLINE_WINDOW_MS = 2 * 60 * 1000
const UNLIMITED_EXPIRE_YEAR = 2099
const ICON_STROKE = 1.75

const SORTING: Record<TSort, GetUsersCommand.RequestQuery['sorting']> = {
    created: [{ id: 'createdAt', desc: true }],
    expire: [{ id: 'expireAt', desc: false }],
    traffic: [{ id: 'usedTrafficBytes', desc: true }],
    online: [{ id: 'userTraffic.onlineAt', desc: true }]
}

const STATUS_ORDER: TStatusFilter[] = [
    'ALL',
    USERS_STATUS.ACTIVE,
    USERS_STATUS.EXPIRED,
    USERS_STATUS.LIMITED,
    USERS_STATUS.DISABLED
]

function isOnline(user: TUser) {
    const onlineAt = user.userTraffic.onlineAt
    return onlineAt !== null && Date.now() - onlineAt.getTime() < ONLINE_WINDOW_MS
}

function UserRow({ user, isSelected, onToggle }: { isSelected: boolean; onToggle: () => void; user: TUser }) {
    const { t, i18n } = useTranslation()
    const used = compactBytesUtil(user.userTraffic.usedTrafficBytes)
    const limit = user.trafficLimitBytes > 0 ? compactBytesUtil(user.trafficLimitBytes) : '∞'
    const expiresAt = dayjs(user.expireAt).locale(i18n.language)
    const isUnlimited = expiresAt.year() === UNLIMITED_EXPIRE_YEAR
    const Icon = user.status === USERS_STATUS.DISABLED ? TbUserOff : TbUser

    const open = () => showModal('users_viewUserModal', { userId: user.id })
    const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') open()
    }

    return (
        <div
            className={classes.row}
            data-selected={isSelected || undefined}
            onClick={open}
            onKeyDown={handleKey}
            role="button"
            tabIndex={0}
        >
            <Checkbox
                aria-label={user.username}
                checked={isSelected}
                className={classes.check}
                color="gray"
                onChange={onToggle}
                onClick={(event) => event.stopPropagation()}
                radius="sm"
            />
            <Icon className={classes.rowIcon} size={20} strokeWidth={ICON_STROKE} />
            <div className={classes.rowMain}>
                <div className={classes.rowTitle}>{user.username}</div>
                <div className={classes.rowFacts}>
                    <span>
                        {isUnlimited
                            ? t('bolt.users.no-expiry')
                            : t('bolt.users.until', { date: expiresAt.format('D MMM YYYY') })}
                    </span>
                    <span>{t('bolt.users.traffic', { used, limit })}</span>
                </div>
            </div>
            <div className={classes.rowSide}>
                <div className={classes.rowStatus}>{t(`bolt.status.${user.status}`)}</div>
                <div className={classes.rowSeen}>
                    {isOnline(user)
                        ? t('bolt.users.online')
                        : getTimeAgoUtil(user.userTraffic.onlineAt, t, i18n.language)}
                </div>
            </div>
        </div>
    )
}

export function BoltUsersListWidget() {
    const { t } = useTranslation()
    const isMobile = useIsMobile()
    const [search, setSearch] = useState('')
    const [debouncedSearch] = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS)
    const [status, setStatus] = useState<TStatusFilter>('ALL')
    const [sort, setSort] = useState<TSort>('created')
    const [page, setPage] = useState(0)

    const selection = useUsersTableSelectionStoreTableSelection()
    const selectionActions = useUsersTableSelectionStoreActions()
    const selectedCount = Object.keys(selection).length

    const { data: stats } = useGetSystemStats()
    const filters: NonNullable<GetUsersCommand.RequestQuery['filters']> = []
    if (debouncedSearch) filters.push({ id: 'username', value: debouncedSearch })
    if (status !== 'ALL') filters.push({ id: 'status', value: status })

    const { data, isLoading } = useGetUsers({
        query: {
            start: page * PAGE_SIZE,
            size: PAGE_SIZE,
            filters,
            filterModes: { username: 'contains', status: 'equals' },
            sorting: SORTING[sort]
        },
        rQueryParams: { refetchInterval: selectedCount === 0 ? sToMs(25) : false }
    })

    const users = data?.users ?? []
    const total = data?.total ?? 0
    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const counts = stats?.users.statusCounts

    const changeStatus = (next: TStatusFilter) => {
        setStatus(next)
        setPage(0)
    }

    const toggle = (id: number) =>
        selectionActions.setTableSelection((previous) => {
            const next = { ...previous }
            if (next[id]) delete next[id]
            else next[id] = true
            return next
        })

    const selectPage = () =>
        selectionActions.setTableSelection((previous) => ({
            ...previous,
            ...Object.fromEntries(users.map((user) => [user.id, true]))
        }))

    const finishBulk = async () => {
        selectionActions.resetState()
        await queryClient.refetchQueries({ queryKey: QueryKeys.users.getAllUsers._def })
        await queryClient.refetchQueries({ queryKey: QueryKeys.system._def })
    }

    const statusValue = (filter: TStatusFilter) =>
        filter === 'ALL' ? (stats?.users.totalUsers ?? 0) : (counts?.[filter] ?? 0)

    return (
        <>
            <div className={classes.toolbar}>
                <TextInput
                    aria-label={t('bolt.users.search')}
                    className={classes.search}
                    classNames={{ input: classes.searchInput }}
                    leftSection={<TbSearch size={18} strokeWidth={ICON_STROKE} />}
                    onChange={(event) => {
                        setSearch(event.currentTarget.value)
                        setPage(0)
                    }}
                    placeholder={t('bolt.users.search')}
                    value={search}
                />
                <Menu position="bottom-end" width={220}>
                    <Menu.Target>
                        {isMobile ? (
                            <ActionIcon
                                aria-label={t(`bolt.users.sort-${sort}`)}
                                size={40}
                                variant="default"
                            >
                                <TbArrowsSort size={20} strokeWidth={ICON_STROKE} />
                            </ActionIcon>
                        ) : (
                            <Button h={40}>{t(`bolt.users.sort-${sort}`)}</Button>
                        )}
                    </Menu.Target>
                    <Menu.Dropdown>
                        {(Object.keys(SORTING) as TSort[]).map((key) => (
                            <Menu.Item
                                fw={key === sort ? 700 : 500}
                                key={key}
                                onClick={() => setSort(key)}
                            >
                                {t(`bolt.users.sort-${key}`)}
                            </Menu.Item>
                        ))}
                    </Menu.Dropdown>
                </Menu>
                {isMobile ? (
                    <ActionIcon
                        aria-label={t('bolt.users.create')}
                        onClick={() => showModal('users_createUserModal')}
                        size={40}
                        variant="filled"
                    >
                        <TbPlus size={20} strokeWidth={2} />
                    </ActionIcon>
                ) : (
                    <Button h={40} onClick={() => showModal('users_createUserModal')} variant="filled">
                        {t('bolt.users.create')}
                    </Button>
                )}
            </div>

            <div className={classes.summary}>
                {STATUS_ORDER.map((filter) => (
                    <button
                        className={classes.summaryCell}
                        data-active={status === filter || undefined}
                        key={filter}
                        onClick={() => changeStatus(filter)}
                        type="button"
                    >
                        <span>{t(`bolt.status-plural.${filter}`)}</span>
                        <span className={classes.summaryValue}>{statusValue(filter)}</span>
                    </button>
                ))}
            </div>

            <div className={classes.list}>
                {users.map((user) => (
                    <UserRow
                        isSelected={Boolean(selection[user.id])}
                        key={user.id}
                        onToggle={() => toggle(user.id)}
                        user={user}
                    />
                ))}
                {!isLoading && users.length === 0 && (
                    <div className={classes.empty}>{t('bolt.users.empty')}</div>
                )}
            </div>

            {pageCount > 1 && (
                <div className={classes.footer}>
                    <span>
                        {t('bolt.users.range', {
                            from: page * PAGE_SIZE + 1,
                            to: Math.min(total, (page + 1) * PAGE_SIZE),
                            total
                        })}
                    </span>
                    <Button.Group>
                        <Button disabled={page === 0} onClick={() => setPage(page - 1)}>
                            {t('bolt.users.prev')}
                        </Button>
                        <Button disabled={page + 1 >= pageCount} onClick={() => setPage(page + 1)}>
                            {t('bolt.users.next')}
                        </Button>
                    </Button.Group>
                </div>
            )}

            {selectedCount > 0 && (
                <div className={classes.selectionBar}>
                    <span className={classes.selectionCount}>
                        {t('common.message.selected', { count: selectedCount })}
                    </span>
                    <Button onClick={selectPage} variant="subtle">
                        {t('common.action.select-all')}
                    </Button>
                    <Button onClick={() => selectionActions.resetState()} variant="subtle">
                        {t('common.action.clear-selection')}
                    </Button>
                    <Button
                        onClick={() =>
                            showModal('users_bulkManyUsersUpdateModal', {
                                usersCount: selectedCount,
                                onClose: finishBulk
                            })
                        }
                    >
                        {t('common.action.bulk-edit')}
                    </Button>
                    <Button
                        onClick={() =>
                            showModal('users_bulkManyUsersActionsModal', {
                                usersCount: selectedCount,
                                onClose: finishBulk
                            })
                        }
                        variant="filled"
                    >
                        {t('common.action.actions')}
                    </Button>
                </div>
            )}
        </>
    )
}

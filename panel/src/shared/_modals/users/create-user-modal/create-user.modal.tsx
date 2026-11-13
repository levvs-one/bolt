import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { Button, Checkbox, Modal, SegmentedControl, TextInput } from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { CreateUserCommand, USERS_STATUS } from '@remnawave/backend-contract'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbCalendar, TbChartArcs, TbCirclesRelation, TbLink, TbUser } from 'react-icons/tb'
import { renderSVG } from 'uqr'

import { showModal } from '@shared/_modals/show-modal'
import { useNiceMantineModal } from '@shared/_modals/use-nice-modal'
import { queryClient } from '@shared/api'
import { QueryKeys, useCreateUser, useGetInternalSquads } from '@shared/api/hooks'
import { BoltField, BoltGroup, BoltPicker, BoltRow } from '@shared/ui/bolt-list'
import { compactBytesUtil } from '@shared/utils/bytes'

import classes from './create-user.module.css'

type TCreatedUser = NonNullable<ReturnType<typeof useCreateUser>['data']>

const GIB = 1024 ** 3
const UNLIMITED = 0
const UNLIMITED_MARK = '∞'
const UNLIMITED_EXPIRE_YEAR = 2099
const MODAL_WIDTH = 440
const USERNAME_MAX_LENGTH = 36

const TERMS = [
    { days: 30, label: 'bolt.create.term-1m' },
    { days: 90, label: 'bolt.create.term-3m' },
    { days: 180, label: 'bolt.create.term-6m' },
    { days: 365, label: 'bolt.create.term-1y' }
] as const

const LIMITS_GIB = [50, 100, 300, 1024]

const DEFAULT_TERM_DAYS = 30
const DEFAULT_LIMIT_GIB = UNLIMITED

const expireAtFor = (days: number) =>
    days === UNLIMITED
        ? dayjs().year(UNLIMITED_EXPIRE_YEAR).endOf('year')
        : dayjs().add(days, 'day')

export const CreateUserModal = NiceModal.create(() => {
    const { t, i18n } = useTranslation()
    const modal = useModal()
    const clipboard = useClipboard()

    const { modalProps, hide } = useNiceMantineModal({
        modal,
        onClose: () => {
            queryClient.refetchQueries({ queryKey: QueryKeys.users.getAllUsers._def })
            queryClient.refetchQueries({ queryKey: QueryKeys.system.getSystemStats.queryKey })
        }
    })

    const { data: squads } = useGetInternalSquads()
    const squadList = squads?.internalSquads ?? []

    const [username, setUsername] = useState('')
    const [termDays, setTermDays] = useState(DEFAULT_TERM_DAYS)
    const [limitGib, setLimitGib] = useState(DEFAULT_LIMIT_GIB)
    // Пока сквады не выбирали вручную, отмечен единственный сквад панели.
    const [pickedSquads, setPickedSquads] = useState<null | string[]>(null)
    const [created, setCreated] = useState<null | TCreatedUser>(null)

    const selectedSquads = pickedSquads ?? (squadList.length === 1 ? [squadList[0].uuid] : [])

    const { mutate: createUser, isPending } = useCreateUser({
        mutationFns: { onSuccess: (user) => setCreated(user) }
    })

    const expireAt = expireAtFor(termDays).locale(i18n.language)
    const termValue =
        termDays === UNLIMITED
            ? t('bolt.users.no-expiry')
            : t('bolt.users.until', { date: expireAt.format('D MMM YYYY') })
    const limitValue =
        limitGib === UNLIMITED ? t('bolt.create.no-limit') : compactBytesUtil(limitGib * GIB)

    const toggleSquad = (uuid: string) =>
        setPickedSquads(
            selectedSquads.includes(uuid)
                ? selectedSquads.filter((item) => item !== uuid)
                : [...selectedSquads, uuid]
        )

    const submit = () => {
        const name = username.trim()
        if (!CreateUserCommand.RequestBodySchema.shape.username.safeParse(name).success) {
            notifications.show({ message: t('bolt.create.name-invalid') })
            return
        }

        createUser({
            variables: {
                username: name,
                status: USERS_STATUS.ACTIVE,
                trafficLimitBytes: limitGib * GIB,
                trafficLimitStrategy: 'NO_RESET',
                // @ts-expect-error - схема контракта принимает строку ISO и сама делает из неё Date
                expireAt: expireAt.toISOString(),
                activeInternalSquads: selectedSquads
            }
        })
    }

    const copyLink = () => {
        if (!created) return
        clipboard.copy(created.subscriptionUrl)
        notifications.show({ message: t('bolt.create.copied') })
    }

    const openUser = () => {
        if (!created) return
        hide()
        showModal('users_viewUserModal', { userId: created.id })
    }

    if (created) {
        return (
            <Modal {...modalProps} size={MODAL_WIDTH} title={created.username}>
                <div className={classes.stack}>
                    <BoltGroup className={classes.qr}>
                        <div
                            className={classes.qrImage}
                            // SVG собирает uqr из ссылки подписки: чужой разметки в нём нет.
                            dangerouslySetInnerHTML={{
                                __html: renderSVG(created.subscriptionUrl, {
                                    blackColor: 'var(--bolt-text)',
                                    whiteColor: 'var(--bolt-surface)'
                                })
                            }}
                        />
                    </BoltGroup>

                    <BoltGroup>
                        <BoltRow
                            icon={TbLink}
                            label={t('bolt.create.link')}
                            value={created.subscriptionUrl.replace(/^https?:\/\//, '')}
                        />
                        <BoltRow
                            icon={TbCalendar}
                            label={t('bolt.create.term')}
                            value={termValue}
                        />
                        <BoltRow
                            icon={TbChartArcs}
                            label={t('bolt.create.traffic')}
                            value={limitValue}
                        />
                    </BoltGroup>

                    <div className={classes.actions}>
                        <Button fullWidth onClick={copyLink} size="lg" variant="filled">
                            {t('bolt.user.copy-link')}
                        </Button>
                        <Button fullWidth onClick={openUser} size="lg">
                            {t('bolt.create.open')}
                        </Button>
                    </div>
                </div>
            </Modal>
        )
    }

    return (
        <Modal {...modalProps} size={MODAL_WIDTH} title={t('bolt.users.create')}>
            <div className={classes.stack}>
                <BoltGroup>
                    <BoltField icon={TbUser} label={t('bolt.create.name')}>
                        <TextInput
                            autoComplete="off"
                            data-autofocus
                            maxLength={USERNAME_MAX_LENGTH}
                            onChange={(event) => setUsername(event.currentTarget.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') submit()
                            }}
                            placeholder="ivan_petrov"
                            value={username}
                        />
                    </BoltField>
                </BoltGroup>

                <BoltGroup>
                    <BoltRow icon={TbCalendar} label={t('bolt.create.term')} value={termValue} />
                    <BoltPicker>
                        <SegmentedControl
                            data={[
                                ...TERMS.map((term) => ({
                                    label: t(term.label),
                                    value: String(term.days)
                                })),
                                { label: UNLIMITED_MARK, value: String(UNLIMITED) }
                            ]}
                            fullWidth
                            onChange={(value) => setTermDays(Number(value))}
                            value={String(termDays)}
                        />
                    </BoltPicker>
                </BoltGroup>

                <BoltGroup>
                    <BoltRow
                        icon={TbChartArcs}
                        label={t('bolt.create.traffic')}
                        value={limitValue}
                    />
                    <BoltPicker>
                        <SegmentedControl
                            data={[
                                ...LIMITS_GIB.map((gib) => ({
                                    label: compactBytesUtil(gib * GIB),
                                    value: String(gib)
                                })),
                                { label: UNLIMITED_MARK, value: String(UNLIMITED) }
                            ]}
                            fullWidth
                            onChange={(value) => setLimitGib(Number(value))}
                            value={String(limitGib)}
                        />
                    </BoltPicker>
                </BoltGroup>

                {squadList.length > 0 && (
                    <BoltGroup>
                        {squadList.map((squad) => (
                            <BoltField icon={TbCirclesRelation} key={squad.uuid} label={squad.name}>
                                <Checkbox
                                    checked={selectedSquads.includes(squad.uuid)}
                                    className={classes.check}
                                    onChange={() => toggleSquad(squad.uuid)}
                                />
                            </BoltField>
                        ))}
                    </BoltGroup>
                )}

                <Button fullWidth loading={isPending} onClick={submit} size="lg" variant="filled">
                    {t('common.action.create')}
                </Button>
            </div>
        </Modal>
    )
})

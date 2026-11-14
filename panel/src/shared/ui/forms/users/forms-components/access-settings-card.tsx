import { Select, Stack } from '@mantine/core'
import { DateTimePicker, getTimeRange } from '@mantine/dates'
import { UseFormReturnType } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import {
    CreateUserCommand,
    GetExternalSquadsCommand,
    GetInternalSquadsCommand,
    UpdateUserCommand
} from '@remnawave/backend-contract'
import { InternalSquadsListWidget } from '@widgets/dashboard/users/internal-squads-list'
import dayjs from 'dayjs'
import { ForwardRefComponent, HTMLMotionProps, Variants } from 'motion/react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbCalendar, TbWebhook } from 'react-icons/tb'

import { BoltField, BoltGroup } from '@shared/ui/bolt-list'

import classes from './access-settings-card.module.css'

interface IProps<T extends CreateUserCommand.RequestBody | UpdateUserCommand.RequestBody> {
    cardVariants: Variants
    externalSquads: GetExternalSquadsCommand.Response['response'] | undefined
    form: UseFormReturnType<T>
    internalSquads: GetInternalSquadsCommand.Response['response'] | undefined
    motionWrapper: ForwardRefComponent<HTMLDivElement, HTMLMotionProps<'div'>>
}

export const AccessSettingsCard = <
    T extends CreateUserCommand.RequestBody | UpdateUserCommand.RequestBody
>(
    props: IProps<T>
) => {
    const { t, i18n } = useTranslation()

    const { cardVariants, motionWrapper, form, internalSquads, externalSquads } = props

    const [searchQuery, setSearchQuery] = useState('')
    const [localExpireAt, setLocalExpireAt] = useState<Date | undefined>(undefined)

    const MotionWrapper = motionWrapper

    const filteredInternalSquads = useMemo(() => {
        const allInternalSquads = internalSquads?.internalSquads || []
        if (!searchQuery.trim()) return allInternalSquads

        const query = searchQuery.toLowerCase().trim()
        return allInternalSquads.filter((internalSquad) =>
            internalSquad.name?.toLowerCase().includes(query)
        )
    }, [internalSquads, searchQuery])

    form.watch('expireAt', (value) => {
        setLocalExpireAt(value.value)
    })

    return (
        <MotionWrapper variants={cardVariants}>
            <Stack gap={12}>
                <BoltGroup>
                    <BoltField icon={TbCalendar} label={t('bolt.user.expires')}>
                        <DateTimePicker
                            dropdownType="modal"
                            headerControlsOrder={['previous', 'next', 'level']}
                            highlightToday
                            key={form.key('expireAt')}
                            locale={i18n.language}
                            minDate={new Date()}
                            modalProps={{
                                centered: true
                            }}
                            styles={{
                                calendarHeaderLevel: {
                                    justifyContent: 'flex-start',
                                    paddingInlineStart: 8
                                }
                            }}
                            submitButtonProps={{
                                style: {
                                    borderRadius: 'var(--mantine-radius-md)',
                                    width: '20%'
                                }
                            }}
                            timePickerProps={{
                                withDropdown: true,
                                scrollAreaProps: {
                                    styles: {
                                        content: {
                                            minWidth: 'fit-content' // TODO: MantineUI bug
                                        }
                                    }
                                },
                                presets: getTimeRange({
                                    startTime: '06:00:00',
                                    endTime: '18:00:00',
                                    interval: '01:30:00'
                                })
                            }}
                            valueFormat="D MMM YYYY, HH:mm"
                            {...form.getInputProps('expireAt')}
                            onChange={(date) => {
                                const formInputProps = form.getInputProps('expireAt')
                                if (formInputProps.onChange) {
                                    formInputProps.onChange(date)
                                }

                                if (date === 'Invalid Date') {
                                    notifications.show({
                                        title: t('bolt.text.invalid-date'),
                                        message:
                                            'Please select a valid date. Defaulting to 1 month from now.',
                                        color: 'red'
                                    })

                                    const currentDate = form.values.expireAt || new Date()
                                    const newDate = new Date(currentDate)
                                    newDate.setMonth(newDate.getMonth() + 1)
                                    // @ts-expect-error - TODO: fix ZOD schema
                                    form.setFieldValue('expireAt', newDate)
                                }
                            }}
                            presets={[
                                {
                                    value: dayjs(localExpireAt)
                                        .add(1, 'month')
                                        .format('YYYY-MM-DD HH:mm:ss'),
                                    label: t('create-user-modal.widget.1-month')
                                },
                                {
                                    value: dayjs(localExpireAt)
                                        .add(3, 'months')
                                        .format('YYYY-MM-DD HH:mm:ss'),
                                    label: t('create-user-modal.widget.3-months')
                                },
                                {
                                    value: dayjs(localExpireAt)
                                        .add(1, 'year')
                                        .format('YYYY-MM-DD HH:mm:ss'),
                                    label: t('create-user-modal.widget.1-year')
                                },
                                {
                                    value: dayjs().year(2099).format('YYYY-MM-DD HH:mm:ss'),
                                    label: t('create-user-modal.widget.2099-year')
                                }
                            ]}
                        />
                    </BoltField>
                    <BoltField icon={TbWebhook} label={t('access-settings-card.external-squad')}>
                        <Select
                            allowDeselect={true}
                            clearable
                            data={externalSquads?.externalSquads.map((externalSquad) => ({
                                label: externalSquad.name,
                                value: externalSquad.uuid
                            }))}
                            limit={100}
                            defaultValue={form.values.externalSquadUuid}
                            key={form.key('externalSquadUuid')}
                            placeholder={t('bolt.text.none')}
                            {...form.getInputProps('externalSquadUuid')}
                        />
                    </BoltField>
                </BoltGroup>

                <BoltGroup className={classes.squads}>
                    <InternalSquadsListWidget
                        filteredInternalSquads={filteredInternalSquads}
                        formKey={form.key('activeInternalSquads')}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        {...form.getInputProps('activeInternalSquads')}
                    />
                </BoltGroup>
            </Stack>
        </MotionWrapper>
    )
}

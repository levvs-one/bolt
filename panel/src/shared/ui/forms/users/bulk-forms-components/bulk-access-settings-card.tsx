import { Select } from '@mantine/core'
import { DateTimePicker, getTimeRange } from '@mantine/dates'
import { UseFormReturnType } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { BulkAllUpdateUsersCommand, GetExternalSquadsCommand } from '@remnawave/backend-contract'
import dayjs from 'dayjs'
import { ForwardRefComponent, HTMLMotionProps, Variants } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbCalendar, TbCircleCheck } from 'react-icons/tb'

import { userStatusValues } from '@shared/constants/forms'
import { BoltField, BoltGroup } from '@shared/ui/bolt-list'

interface IProps {
    cardVariants: Variants
    externalSquads: GetExternalSquadsCommand.Response['response'] | undefined
    form: UseFormReturnType<BulkAllUpdateUsersCommand.RequestBody>
    motionWrapper: ForwardRefComponent<HTMLDivElement, HTMLMotionProps<'div'>>
}

export const BulkAccessSettingsCard = (props: IProps) => {
    const { t, i18n } = useTranslation()

    const { cardVariants, motionWrapper, form } = props

    const [localExpireAt, setLocalExpireAt] = useState<Date | undefined>(undefined)

    const MotionWrapper = motionWrapper

    form.watch('expireAt', (value) => {
        setLocalExpireAt(value.value)
    })

    return (
        <MotionWrapper variants={cardVariants}>
            <BoltGroup>
                <BoltField icon={TbCircleCheck} label={t('common.field.status')}>
                    <Select
                        allowDeselect={true}
                        clearable
                        data={userStatusValues.filter(
                            (status) => status.value !== 'EXPIRED' && status.value !== 'LIMITED'
                        )}
                        key={form.key('status')}
                        placeholder={t('bolt.text.no-change')}
                        {...form.getInputProps('status')}
                    />
                </BoltField>

                <BoltField icon={TbCalendar} label={t('bolt.user.expires')}>
                    <DateTimePicker
                        dropdownType="popover"
                        headerControlsOrder={['previous', 'next', 'level']}
                        highlightToday
                        key={form.key('expireAt')}
                        locale={i18n.language}
                        minDate={new Date()}
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
                        valueFormat="MMMM D, YYYY - HH:mm"
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
            </BoltGroup>
        </MotionWrapper>
    )
}

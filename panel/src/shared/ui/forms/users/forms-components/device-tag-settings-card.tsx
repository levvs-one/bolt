import { Checkbox, NumberInput, Stack, Textarea } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import {
    CreateUserCommand,
    GetUsersTagsCommand,
    UpdateUserCommand
} from '@remnawave/backend-contract'
import { ForwardRefComponent, HTMLMotionProps, Variants } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { TbDevices2, TbDevicesOff } from 'react-icons/tb'

import { BoltField, BoltGroup } from '@shared/ui/bolt-list'
import { CreateableTagInputShared } from '@shared/ui/createable-tag-input/createable-tag-input'

import classes from './device-tag-settings-card.module.css'

interface IProps<T extends CreateUserCommand.RequestBody | UpdateUserCommand.RequestBody> {
    cardVariants: Variants
    form: UseFormReturnType<T>
    motionWrapper: ForwardRefComponent<HTMLDivElement, HTMLMotionProps<'div'>>
    tags: GetUsersTagsCommand.Response['response'] | undefined
}

export function DeviceTagSettingsCard<
    T extends CreateUserCommand.RequestBody | UpdateUserCommand.RequestBody
>(props: IProps<T>) {
    const { t } = useTranslation()

    const { cardVariants, motionWrapper, form, tags } = props

    const MotionWrapper = motionWrapper

    return (
        <MotionWrapper variants={cardVariants}>
            <Stack gap={12}>
                <BoltGroup>
                    <BoltField
                        icon={TbDevices2}
                        label={t('create-user-modal.widget.hwid-device-limit')}
                    >
                        <NumberInput
                            allowDecimal={false}
                            allowNegative={false}
                            disabled={form.getValues().hwidDeviceLimit === 0}
                            hideControls
                            key={form.key('hwidDeviceLimit')}
                            placeholder={t('bolt.text.device-limit-fallback')}
                            {...form.getInputProps('hwidDeviceLimit')}
                        />
                    </BoltField>
                    <BoltField
                        icon={TbDevicesOff}
                        label={t('create-user-modal.widget.disable-hwid-limit')}
                    >
                        <Checkbox
                            checked={form.getValues().hwidDeviceLimit === 0}
                            className={classes.check}
                            onChange={(event) => {
                                const { checked } = event.currentTarget
                                form.setFieldValue(
                                    'hwidDeviceLimit',
                                    // @ts-expect-error TODO: fix this
                                    checked ? 0 : null
                                )
                            }}
                        />
                    </BoltField>
                </BoltGroup>

                <BoltGroup className={classes.form}>
                    <CreateableTagInputShared
                        key={form.key('tag')}
                        {...form.getInputProps('tag')}
                        tags={tags?.tags ?? []}
                        value={form.getValues().tag}
                    />

                    <Textarea
                        key={form.key('description')}
                        label={t('common.field.description')}
                        resize="vertical"
                        {...form.getInputProps('description')}
                    />
                </BoltGroup>
            </Stack>
        </MotionWrapper>
    )
}

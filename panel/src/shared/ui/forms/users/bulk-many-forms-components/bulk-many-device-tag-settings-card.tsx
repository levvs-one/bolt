import { Checkbox, NumberInput, Stack, Textarea } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { BulkUpdateUsersCommand, GetUsersTagsCommand } from '@remnawave/backend-contract'
import { ForwardRefComponent, HTMLMotionProps, Variants } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { TbDevices2, TbDevicesOff } from 'react-icons/tb'

import { BoltField, BoltGroup } from '@shared/ui/bolt-list'
import { CreateableTagInputShared } from '@shared/ui/createable-tag-input/createable-tag-input'
import classes from '@shared/ui/forms/users/forms-components/device-tag-settings-card.module.css'

interface IProps {
    cardVariants: Variants
    form: UseFormReturnType<BulkUpdateUsersCommand.RequestBody>
    motionWrapper: ForwardRefComponent<HTMLDivElement, HTMLMotionProps<'div'>>
    tags: GetUsersTagsCommand.Response['response'] | undefined
}

export function BulkDeviceTagSettingsCard(props: IProps) {
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
                            disabled={form.getValues().fields.hwidDeviceLimit === 0}
                            hideControls
                            key={form.key('fields.hwidDeviceLimit')}
                            placeholder={t('bolt.text.device-limit-fallback')}
                            {...form.getInputProps('fields.hwidDeviceLimit')}
                        />
                    </BoltField>
                    <BoltField
                        icon={TbDevicesOff}
                        label={t('create-user-modal.widget.disable-hwid-limit')}
                    >
                        <Checkbox
                            checked={form.getValues().fields.hwidDeviceLimit === 0}
                            className={classes.check}
                            onChange={(event) => {
                                const { checked } = event.currentTarget
                                form.setFieldValue('fields.hwidDeviceLimit', checked ? 0 : null)
                            }}
                        />
                    </BoltField>
                </BoltGroup>

                <BoltGroup className={classes.form}>
                    <CreateableTagInputShared
                        key={form.key('fields.tag')}
                        {...form.getInputProps('fields.tag')}
                        tags={tags?.tags ?? []}
                        value={form.getValues().fields.tag}
                    />

                    <Textarea
                        key={form.key('fields.description')}
                        label={t('common.field.description')}
                        resize="vertical"
                        {...form.getInputProps('fields.description')}
                    />
                </BoltGroup>
            </Stack>
        </MotionWrapper>
    )
}

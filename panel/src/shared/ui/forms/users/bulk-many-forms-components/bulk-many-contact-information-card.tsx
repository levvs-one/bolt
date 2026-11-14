import { NumberInput, TextInput } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { BulkUpdateUsersCommand } from '@remnawave/backend-contract'
import { ForwardRefComponent, HTMLMotionProps, Variants } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { TbBrandTelegram, TbMail } from 'react-icons/tb'

import { BoltField, BoltGroup } from '@shared/ui/bolt-list'

interface IProps {
    cardVariants: Variants
    form: UseFormReturnType<BulkUpdateUsersCommand.RequestBody>
    motionWrapper: ForwardRefComponent<HTMLDivElement, HTMLMotionProps<'div'>>
}

export function BulkContactInformationCard(props: IProps) {
    const { t } = useTranslation()

    const { cardVariants, motionWrapper, form } = props

    const MotionWrapper = motionWrapper

    return (
        <MotionWrapper variants={cardVariants}>
            <BoltGroup>
                <BoltField icon={TbBrandTelegram} label="Telegram ID">
                    <NumberInput
                        allowDecimal={false}
                        allowNegative={false}
                        hideControls
                        key={form.key('fields.telegramId')}
                        {...form.getInputProps('fields.telegramId')}
                    />
                </BoltField>

                <BoltField icon={TbMail} label={t('bolt.text.email')}>
                    <TextInput
                        key={form.key('fields.email')}
                        {...form.getInputProps('fields.email')}
                    />
                </BoltField>
            </BoltGroup>
        </MotionWrapper>
    )
}

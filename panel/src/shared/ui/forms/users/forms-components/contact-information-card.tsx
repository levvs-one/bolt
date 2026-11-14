import { NumberInput, TextInput } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { CreateUserCommand, UpdateUserCommand } from '@remnawave/backend-contract'
import { ForwardRefComponent, HTMLMotionProps, Variants } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { TbBrandTelegram, TbMail } from 'react-icons/tb'

import { BoltField, BoltGroup } from '@shared/ui/bolt-list'

interface IProps<T extends CreateUserCommand.RequestBody | UpdateUserCommand.RequestBody> {
    cardVariants: Variants
    form: UseFormReturnType<T>
    motionWrapper: ForwardRefComponent<HTMLDivElement, HTMLMotionProps<'div'>>
}

export function ContactInformationCard<
    T extends CreateUserCommand.RequestBody | UpdateUserCommand.RequestBody
>(props: IProps<T>) {
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
                        key={form.key('telegramId')}
                        {...form.getInputProps('telegramId')}
                    />
                </BoltField>
                <BoltField icon={TbMail} label={t('bolt.text.email')}>
                    <TextInput key={form.key('email')} {...form.getInputProps('email')} />
                </BoltField>
            </BoltGroup>
        </MotionWrapper>
    )
}

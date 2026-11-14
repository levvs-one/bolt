import { NumberInput } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { CreateNodeCommand, UpdateNodeCommand } from '@remnawave/backend-contract'
import { ForwardRefComponent, HTMLMotionProps, Variants } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { TbServer, TbUsers } from 'react-icons/tb'

import { BoltField, BoltGroup } from '@shared/ui/bolt-list'

import classes from './node-consumption.card.module.css'

interface IProps {
    cardVariants: Variants
    form: UseFormReturnType<CreateNodeCommand.RequestBody | UpdateNodeCommand.RequestBody>
    motionWrapper: ForwardRefComponent<HTMLDivElement, HTMLMotionProps<'div'>>
}

const MULTIPLIER_MAX = 100
const MULTIPLIER_STEP = 0.1

// Множители расхода — строки со степпером, как числовые поля в настройках macOS.
export const NodeConsumptionCard = (props: IProps) => {
    const { t } = useTranslation()
    const { cardVariants, form, motionWrapper: MotionWrapper } = props

    const multiplierProps = {
        allowDecimal: true,
        allowedDecimalSeparators: ['.'],
        allowNegative: false,
        className: classes.multiplier,
        clampBehavior: 'strict' as const,
        decimalScale: 1,
        fixedDecimalScale: true,
        max: MULTIPLIER_MAX,
        min: 0,
        step: MULTIPLIER_STEP
    }

    return (
        <MotionWrapper variants={cardVariants}>
            <BoltGroup>
                <BoltField
                    icon={TbUsers}
                    label={t('node-consumption.card.user-consumption-multiplier')}
                >
                    <NumberInput
                        key={form.key('consumptionMultiplier')}
                        {...multiplierProps}
                        {...form.getInputProps('consumptionMultiplier')}
                    />
                </BoltField>
                <BoltField
                    icon={TbServer}
                    label={t('node-consumption.card.node-consumption-multiplier')}
                >
                    <NumberInput
                        key={form.key('nodeConsumptionMultiplier')}
                        {...multiplierProps}
                        {...form.getInputProps('nodeConsumptionMultiplier')}
                    />
                </BoltField>
            </BoltGroup>
        </MotionWrapper>
    )
}

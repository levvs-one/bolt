import { Select } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { CreateUserCommand, UpdateUserCommand } from '@remnawave/backend-contract'
import { ForwardRefComponent, HTMLMotionProps, Variants } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { TbChartArcs, TbRefresh } from 'react-icons/tb'

import { resetDataStrategy } from '@shared/constants/forms'
import { BoltField, BoltGroup } from '@shared/ui/bolt-list'
import { TrafficLimitInput } from '@shared/ui/forms/traffic-limit-input'

interface IProps<T extends CreateUserCommand.RequestBody | UpdateUserCommand.RequestBody> {
    cardVariants: Variants
    form: UseFormReturnType<T>
    motionWrapper: ForwardRefComponent<HTMLDivElement, HTMLMotionProps<'div'>>
}

export const TrafficLimitsCard = <
    T extends CreateUserCommand.RequestBody | UpdateUserCommand.RequestBody
>(
    props: IProps<T>
) => {
    const { t } = useTranslation()

    const { cardVariants, motionWrapper, form } = props

    const MotionWrapper = motionWrapper

    return (
        <MotionWrapper variants={cardVariants}>
            <BoltGroup>
                <BoltField icon={TbChartArcs} label={t('traffic-limits-card.traffic-limit')}>
                    <TrafficLimitInput
                        key={form.key('trafficLimitBytes')}
                        {...form.getInputProps('trafficLimitBytes')}
                    />
                </BoltField>
                <BoltField icon={TbRefresh} label={t('bolt.text.traffic-reset')}>
                    <Select
                        allowDeselect={false}
                        data={resetDataStrategy(t)}
                        defaultValue={form.values.trafficLimitStrategy}
                        key={form.key('trafficLimitStrategy')}
                        {...form.getInputProps('trafficLimitStrategy')}
                    />
                </BoltField>
            </BoltGroup>
        </MotionWrapper>
    )
}

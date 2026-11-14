import { Select } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { BulkAllUpdateUsersCommand } from '@remnawave/backend-contract'
import { ForwardRefComponent, HTMLMotionProps, Variants } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { TbChartArcs, TbRefresh } from 'react-icons/tb'

import { resetDataStrategy } from '@shared/constants/forms'
import { BoltField, BoltGroup } from '@shared/ui/bolt-list'
import { TrafficLimitInput } from '@shared/ui/forms/traffic-limit-input'

interface IProps {
    cardVariants: Variants
    form: UseFormReturnType<BulkAllUpdateUsersCommand.RequestBody>
    motionWrapper: ForwardRefComponent<HTMLDivElement, HTMLMotionProps<'div'>>
}

export const BulkTrafficLimitsCard = (props: IProps) => {
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
                        comboboxProps={{
                            transitionProps: { transition: 'fade', duration: 200 }
                        }}
                        data={resetDataStrategy(t)}
                        defaultValue={form.values.trafficLimitStrategy}
                        key={form.key('trafficLimitStrategy')}
                        placeholder={t('bolt.text.no-change')}
                        {...form.getInputProps('trafficLimitStrategy')}
                    />
                </BoltField>
            </BoltGroup>
        </MotionWrapper>
    )
}

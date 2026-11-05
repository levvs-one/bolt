import { Card, Text, ThemeIconProps } from '@mantine/core'
import { PiTrendDown, PiTrendUp } from 'react-icons/pi'

import { ShimmerSkeleton } from '@shared/ui/shimmer-skeleton'
import { formatPercentage, match } from '@shared/utils/misc'

import classes from './metric-card.module.css'

export interface IMetricCardWithTrendProps {
    difference: number | string
    iconColor?: ThemeIconProps['color']
    IconComponent: React.ComponentType<{ size: number }>
    iconSize?: number
    iconVariant: ThemeIconProps['variant']
    isLoading?: boolean
    period?: string
    themeIconProps?: ThemeIconProps
    title: string
    value: number | string
}

const getTrendData = (difference: number | string) => {
    let color = ''
    let TrendIcon = PiTrendUp
    let valuePrinted: number | string = difference

    if (typeof difference === 'number') {
        const result = match(
            [
                difference > 0,
                {
                    sign: '+',
                    color: 'var(--mantine-color-teal-6)',
                    icon: PiTrendUp
                }
            ],
            [
                difference < 0,
                {
                    sign: '',
                    color: 'var(--mantine-color-red-6)',
                    icon: PiTrendDown
                }
            ]
        )
        color = result.color
        TrendIcon = result.icon
        valuePrinted = formatPercentage(difference, {
            prefix: result.sign,
            precision: 0,
            thousandSeparator: ' '
        })
    } else if (typeof difference === 'string') {
        if (difference.startsWith('-')) {
            color = 'var(--mantine-color-red-6)'
            TrendIcon = PiTrendDown
        } else {
            color = 'var(--mantine-color-teal-6)'
            TrendIcon = PiTrendUp
        }
        valuePrinted = difference
    }

    return { color, TrendIcon, valuePrinted }
}

export function MetricCardWithTrendShared(props: IMetricCardWithTrendProps) {
    const {
        IconComponent,
        iconSize = 20,
        isLoading,
        title,
        value,
        difference,
        period
    } = props

    const { valuePrinted } = getTrendData(difference)

    return (
        <Card className={classes.card}>
            <IconComponent size={iconSize > 20 ? 20 : iconSize} />
            <div className={classes.body}>
                <Text className={classes.title} truncate="end">
                    {title}
                </Text>
                <Text className={classes.subtitle}>
                    {valuePrinted} {period}
                </Text>
            </div>
            {isLoading ? (
                <ShimmerSkeleton height={22} width={64} />
            ) : (
                <Text className={classes.value} truncate="end">
                    {value}
                </Text>
            )}
        </Card>
    )
}

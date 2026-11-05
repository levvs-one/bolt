import { Card, Text, ThemeIconProps } from '@mantine/core'
import { ReactNode } from 'react'

import { ShimmerSkeleton } from '@shared/ui/shimmer-skeleton'
import { formatInt } from '@shared/utils/misc'

import classes from './metric-card.module.css'

export interface IMetricCardProps {
    iconColor?: ThemeIconProps['color']
    IconComponent: React.ComponentType<{ size: number }>
    iconSize?: number
    iconVariant: ThemeIconProps['variant']
    isLoading?: boolean
    subtitle?: string
    themeIconProps?: ThemeIconProps
    title: string
    value: number | string
    rollingNumberComponent?: ReactNode
}

export function MetricCardShared(props: IMetricCardProps) {
    const {
        IconComponent,
        iconSize = 20,
        isLoading,
        title,
        value,
        subtitle,
        rollingNumberComponent
    } = props

    return (
        <Card className={classes.card}>
            <IconComponent size={iconSize > 20 ? 20 : iconSize} />
            <div className={classes.body}>
                <Text className={classes.title} truncate="end">
                    {title}
                </Text>
                {subtitle && <Text className={classes.subtitle}>{subtitle}</Text>}
            </div>
            {isLoading ? (
                <ShimmerSkeleton height={22} width={64} />
            ) : (
                (rollingNumberComponent ?? (
                    <Text className={classes.value} truncate="end">
                        {typeof value === 'number' ? formatInt(value) : value}
                    </Text>
                ))
            )}
        </Card>
    )
}

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { TbAlertTriangle, TbCreditCard, TbServer, TbTrendingUp } from 'react-icons/tb'

import { useGetInfraBillingNodes } from '@shared/api/hooks'
import {
    IMetricCardProps,
    MetricCardShared,
    MetricGridShared
} from '@shared/ui/metrics/metric-card'
import { formatCurrency } from '@shared/utils/misc'

export function StatsWidget() {
    const currentMonthOnly = dayjs().format('MMMM')

    const { data: nodes, isLoading } = useGetInfraBillingNodes()
    const { t } = useTranslation()

    const today = dayjs().startOf('day')
    const billingNodes = nodes?.billingNodes ?? []

    const overdueCount = billingNodes.filter((node) =>
        dayjs(node.nextBillingAt).startOf('day').isBefore(today)
    ).length

    const stats: IMetricCardProps[] = [
        {
            title: t('common.message.overdue'),
            value: overdueCount,
            IconComponent: TbAlertTriangle,
            iconColor: overdueCount > 0 ? 'red' : 'teal',
            iconVariant: 'soft'
        },
        {
            title: t('stats.widget.upcoming-in', { month: currentMonthOnly }),
            value: nodes?.stats.upcomingNodesCount ?? 0,
            IconComponent: TbServer,
            iconColor: 'orange',
            iconVariant: 'soft'
        },
        {
            title: t('stats.widget.payments-in', { month: currentMonthOnly }),
            value: formatCurrency(nodes?.stats.currentMonthPayments ?? 0),
            IconComponent: TbCreditCard,
            iconColor: 'green',
            iconVariant: 'soft'
        },
        {
            title: t('stats.widget.total-spent'),
            value: formatCurrency(nodes?.stats.totalSpent ?? 0),
            IconComponent: TbTrendingUp,
            iconColor: 'violet',
            iconVariant: 'soft'
        }
    ]

    return (
        <MetricGridShared>
            {stats.map((stat, index) => (
                <MetricCardShared isLoading={isLoading} key={index} {...stat} />
            ))}
        </MetricGridShared>
    )
}

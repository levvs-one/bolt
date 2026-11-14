import { RollingNumber, Text } from '@mantine/core'
import { GetHttpStatsCommand } from '@remnawave/backend-contract'
import { memo } from 'react'

import classes from './http-stats-table.module.css'

interface HttpStatRowProps {
    percentOfTotal: number
    route: GetHttpStatsCommand.Response['response']['routes'][number]
}

// Маршрут — строка группы: метод и путь слева, доля и число запросов справа.
function HttpStatRowBase({ route, percentOfTotal }: HttpStatRowProps) {
    return (
        <div className={classes.row}>
            <span className={classes.method}>{route.method}</span>
            <Text className={classes.path} title={route.route} truncate="end">
                {route.route}
            </Text>
            <span className={classes.percent}>{percentOfTotal.toFixed(1)}%</span>
            <RollingNumber fw={700} thousandSeparator value={route.count} />
        </div>
    )
}

export const HttpStatRow = memo(HttpStatRowBase)

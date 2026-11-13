import { Sparkline } from '@mantine/charts'
import { Box, Card, Group, Skeleton, Stack, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'

import { prettifyBytesUtil } from '@shared/utils/bytes'

interface IProps {
    isLoading: boolean
    sparklineData: number[] | undefined
}

export const NodesStatisticSparklineCardWidget = (props: IProps) => {
    const { sparklineData = [], isLoading } = props

    const { t } = useTranslation()

    const totalUsage = sparklineData.reduce((sum, val) => sum + val, 0)

    let dailyAverage = 0
    let peakDay = 0
    let isDataAvailable = false

    if (sparklineData.length > 0) {
        peakDay = Math.max(...sparklineData)
        dailyAverage = totalUsage / sparklineData.length
        isDataAvailable = true
    }

    return (
        <Card p="md" withBorder>
            <Stack gap="sm">
                {[
                    {
                        label: t('statistic-nodes.component.total-traffic'),
                        value: totalUsage
                    },
                    { label: t('bolt.text.per-day'), value: dailyAverage },
                    { label: t('statistic-sparkline-card.widget.peak'), value: peakDay }
                ].map((row) => (
                    <Group gap="sm" justify="space-between" key={row.label} wrap="nowrap">
                        <Text fw={600} size="md" truncate>
                            {row.label}
                        </Text>
                        {isLoading ? (
                            <Skeleton height={20} width={80} />
                        ) : (
                            <Text fw={700} size="md" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {prettifyBytesUtil(row.value) || '0 GiB'}
                            </Text>
                        )}
                    </Group>
                ))}

                <Box style={{ flex: 1 }}>
                    {isLoading ? (
                        <Skeleton height={108} />
                    ) : (
                        <Sparkline
                            curveType="bump"
                            data={isDataAvailable ? sparklineData : [1, 1, 1]}
                            fillOpacity={0.3}
                            h={100}
                            strokeWidth={2}
                            trendColors={{
                                negative: 'red.6',
                                neutral: 'gray.5',
                                positive: 'teal.6'
                            }}
                            w="100%"
                        />
                    )}
                </Box>
            </Stack>
        </Card>
    )
}

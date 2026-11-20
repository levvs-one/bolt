import { ComboboxItem, Group, Text } from '@mantine/core'
import { forwardRef } from 'react'

import { CountryFlag } from '@shared/ui/get-country-flag'

export interface NodeSelectItemProps extends ComboboxItem {
    countryCode?: null | string
}

export const NodeSelectItem = forwardRef<HTMLDivElement, NodeSelectItemProps>(
    ({ countryCode, label, ...others }, ref) => (
        <div ref={ref} {...others}>
            <Group gap="sm">
                {countryCode && countryCode !== 'XX' && <CountryFlag countryCode={countryCode} />}
                <Text size="sm">{label}</Text>
            </Group>
        </div>
    )
)

import { Group, Text } from '@mantine/core'

import { CountryFlag } from '@shared/ui/get-country-flag'

import { IProps } from './interface'

export function ConnectedNodeColumnEntity(props: IProps) {
    const { node } = props

    return (
        <Group
            align="center"
            gap="sm"
            style={{
                flex: 1,
                minWidth: 0
            }}
            wrap="nowrap"
        >
            {node?.countryCode && node.countryCode !== 'XX' && (
                <CountryFlag countryCode={node.countryCode} />
            )}
            <Text ff="monospace" fw={500} size="md">
                {node?.name || '–'}
            </Text>
        </Group>
    )
}

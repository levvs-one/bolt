import { CodeHighlight } from '@mantine/code-highlight'
import { Group, Stack, Text } from '@mantine/core'
import { Trans } from 'react-i18next'
import { TbBrandDocker, TbClock, TbRadar } from 'react-icons/tb'

const DOCKER_SNIPPET = `
    cap_add:
      - NET_ADMIN
`

const HIGHLIGHT_SPAN = <Text component="span" fw={600} size="sm" />

export const RequirementsWidget = () => {
    return (
        <Stack gap="md">
            <Stack gap="xs">
                <Group align="flex-start" gap="sm" wrap="nowrap">
                    <TbBrandDocker size={20} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                    <Text fw={500} size="sm">
                        <Trans
                            components={{
                                highlight: HIGHLIGHT_SPAN
                            }}
                            i18nKey="active-sessions-drawer.widget.warning-docker"
                        />
                    </Text>
                </Group>
                <CodeHighlight
                    background="var(--bolt-surface-raised)"
                    code={DOCKER_SNIPPET}
                    language="yaml"
                    radius="md"
                    style={{
                        borderRadius: 'var(--mantine-radius-md)'
                    }}
                />
            </Stack>

            <Group align="flex-start" gap="sm" wrap="nowrap">
                <TbClock size={20} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                <Text fw={500} size="sm">
                    <Trans
                        components={{
                            highlight: HIGHLIGHT_SPAN
                        }}
                        i18nKey="active-sessions-drawer.widget.warning-activity"
                    />
                </Text>
            </Group>

            <Group align="flex-start" gap="sm" wrap="nowrap">
                <TbRadar size={20} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                <Text fw={500} size="sm">
                    <Trans
                        components={{
                            highlight: HIGHLIGHT_SPAN
                        }}
                        i18nKey="active-sessions-drawer.widget.warning-n-plus-one"
                    />
                </Text>
            </Group>
        </Stack>
    )
}

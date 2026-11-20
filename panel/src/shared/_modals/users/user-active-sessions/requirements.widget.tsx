import { CodeHighlight } from '@mantine/code-highlight'
import { Group, Stack, Text } from '@mantine/core'
import { Trans, useTranslation } from 'react-i18next'
import { TbBrandDocker, TbClock, TbHourglass, TbTag } from 'react-icons/tb'

const DOCKER_SNIPPET = `
    cap_add:
      - NET_ADMIN
`

const HIGHLIGHT_SPAN = <Text component="span" fw={600} size="sm" />

export const RequirementsWidget = () => {
    const { t } = useTranslation()

    return (
        <Stack gap="md">
            <Group align="flex-start" gap="sm" wrap="nowrap">
                <TbTag size={20} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                <Text fw={500} size="sm">
                    <Trans
                        components={{ highlight: HIGHLIGHT_SPAN }}
                        i18nKey="active-sessions-drawer.widget.warning-version"
                        values={{ version: '2.7.0' }}
                    />
                </Text>
            </Group>

            <Stack gap="xs">
                <Group align="flex-start" gap="sm" wrap="nowrap">
                    <TbBrandDocker size={20} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                    <Text fw={500} size="sm">
                        <Trans
                            components={{ highlight: HIGHLIGHT_SPAN }}
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
                        components={{ highlight: HIGHLIGHT_SPAN }}
                        i18nKey="active-sessions-drawer.widget.warning-activity"
                    />
                </Text>
            </Group>

            <Group align="flex-start" gap="sm" wrap="nowrap">
                <TbHourglass size={20} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                <Text fw={500} size="sm">
                    {t('active-sessions-drawer.widget.warning-patience')}
                </Text>
            </Group>
        </Stack>
    )
}

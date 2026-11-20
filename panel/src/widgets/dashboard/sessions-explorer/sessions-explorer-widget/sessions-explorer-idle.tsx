import { CodeHighlight } from '@mantine/code-highlight'
import { Button, Group, Stack, Text } from '@mantine/core'
import { Trans, useTranslation } from 'react-i18next'
import { TbAlertTriangle, TbBrandDocker, TbClock, TbRadar, TbRadar2 } from 'react-icons/tb'

import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'
import { SectionCard } from '@shared/ui/section-card'

const DOCKER_SNIPPET = `
    cap_add:
      - NET_ADMIN
`

const HIGHLIGHT_SPAN = <Text component="span" fw={600} size="sm" />

interface IProps {
    onlineNodesCount: number
    onStart: () => void
}

export function SessionsExplorerIdle({ onlineNodesCount, onStart }: IProps) {
    const { t } = useTranslation()

    return (
        <Stack gap="md">
            <SectionCard.Root gap="md">
                <SectionCard.Section>
                    <BaseOverlayHeader
                        iconColor="yellow"
                        IconComponent={TbAlertTriangle}
                        iconVariant="soft"
                        title={t('active-sessions-drawer.widget.requirements')}
                    />
                </SectionCard.Section>

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
                    <TbRadar size={20} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                    <Text fw={500} size="sm">
                        {t('sessions-explorer-idle.description-1')}
                    </Text>
                </Group>
            </SectionCard.Root>

            <Button
                color="teal"
                disabled={onlineNodesCount === 0}
                fullWidth
                leftSection={<TbRadar2 size={20} />}
                onClick={onStart}
                size="md"
                variant="light"
            >
                {t('sessions-explorer-idle.start-exploring')}
            </Button>
        </Stack>
    )
}

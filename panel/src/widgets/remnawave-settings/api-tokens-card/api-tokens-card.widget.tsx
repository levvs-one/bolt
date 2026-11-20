import { ActionIcon, Button, Group, ScrollArea, Tooltip } from '@mantine/core'
import { modals } from '@mantine/modals'
import { GetApiTokensCommand } from '@remnawave/backend-contract'
import { useTranslation } from 'react-i18next'
import { TbCookie, TbRefresh } from 'react-icons/tb'

import { useGetApiTokens } from '@shared/api/hooks'
import { useIsMobile } from '@shared/hooks'
import { BoltRow } from '@shared/ui/bolt-list'
import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'
import { SettingsCardShared } from '@shared/ui/settings-card'

import { ApiTokenItem } from './api-token-item'
import { CreateApiTokenContentWidget } from './modals/create-api-token-modal.widget'

interface IProps {
    apiTokensData: GetApiTokensCommand.Response['response']
}

export const ApiTokensCardWidget = (props: IProps) => {
    const { apiTokensData } = props
    const { t } = useTranslation()
    const isMobile = useIsMobile()

    const { isRefetching, refetch } = useGetApiTokens()

    return (
        <SettingsCardShared.Container>
            <SettingsCardShared.Header
                description={t('api-tokens-card.widget.api-tokens-description')}
                icon={<TbCookie size={24} />}
                iconColor="cyan"
                iconVariant="soft"
                title={t('api-tokens-card.widget.api-tokens')}
            />

            <SettingsCardShared.Content>
                {apiTokensData.tokens.length === 0 ? (
                    <BoltRow label={t('api-tokens-card.widget.no-api-tokens-found')} />
                ) : (
                    <ScrollArea.Autosize mah={300}>
                        {apiTokensData.tokens.map((apiToken) => (
                            <ApiTokenItem apiToken={apiToken} key={apiToken.uuid} />
                        ))}
                    </ScrollArea.Autosize>
                )}
            </SettingsCardShared.Content>

            <SettingsCardShared.Bottom>
                <Group justify="space-between">
                    <Tooltip label={t('common.action.refresh')}>
                        <ActionIcon
                            aria-label={t('common.action.refresh')}
                            loading={isRefetching}
                            onClick={() => refetch()}
                            size={36}
                        >
                            <TbRefresh size={20} strokeWidth={1.75} />
                        </ActionIcon>
                    </Tooltip>

                    <Button
                        onClick={() => {
                            modals.open({
                                title: (
                                    <BaseOverlayHeader
                                        iconColor="teal"
                                        IconComponent={TbCookie}
                                        iconVariant="soft"
                                        title={t('api-tokens-card.widget.create-api-token')}
                                    />
                                ),
                                fullScreen: isMobile,
                                centered: true,
                                size: 'min(800px, 90vw)',
                                children: <CreateApiTokenContentWidget isMobile={isMobile} />
                            })
                        }}
                        size="md"
                    >
                        {t('common.action.create')}
                    </Button>
                </Group>
            </SettingsCardShared.Bottom>
        </SettingsCardShared.Container>
    )
}

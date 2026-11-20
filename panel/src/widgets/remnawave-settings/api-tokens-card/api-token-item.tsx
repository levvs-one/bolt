import { ActionIcon, Menu, Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { GetApiTokensCommand } from '@remnawave/backend-contract'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { TbCookie, TbDots, TbEye, TbTrash } from 'react-icons/tb'

import { queryClient } from '@shared/api'
import { QueryKeys, useDeleteApiToken } from '@shared/api/hooks'
import { useIsMobile } from '@shared/hooks'
import { BoltRow } from '@shared/ui/bolt-list'
import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'

import { ViewApiTokenContentWidget } from './modals/view-api-token-modal.widget'

interface IProps {
    apiToken: GetApiTokensCommand.Response['response']['tokens'][number]
}

export const ApiTokenItem = ({ apiToken }: IProps) => {
    const { t } = useTranslation()
    const isMobile = useIsMobile()

    const { mutate: deleteApiToken, isPending: isDeletingApiToken } = useDeleteApiToken({
        mutationFns: {
            onSuccess: async () => {
                await queryClient.refetchQueries({
                    queryKey: QueryKeys.apiTokens.getAllApiTokens.queryKey
                })
            }
        }
    })

    const isFull = apiToken.scopes.includes('*')
    const isExpired = dayjs(apiToken.expireAt).isBefore(dayjs())

    return (
        <BoltRow
            label={apiToken.name}
            rightSection={
                <Menu position="bottom-end" shadow="lg" trigger="click-hover" width={190}>
                    <Menu.Target>
                        <ActionIcon onClick={(event) => event.stopPropagation()} size={36}>
                            <TbDots size={20} strokeWidth={1.75} />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown onClick={(event) => event.stopPropagation()}>
                        <Menu.Item
                            leftSection={<TbEye size={15} />}
                            onClick={() => {
                                modals.open({
                                    title: (
                                        <BaseOverlayHeader
                                            iconColor="teal"
                                            IconComponent={TbCookie}
                                            iconVariant="soft"
                                            title={apiToken.name}
                                        />
                                    ),
                                    fullScreen: isMobile,
                                    centered: true,
                                    size: 'min(800px, 90vw)',
                                    children: (
                                        <ViewApiTokenContentWidget
                                            isMobile={isMobile}
                                            token={apiToken}
                                        />
                                    )
                                })
                            }}
                        >
                            {t('common.action.view')}
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                            color="red"
                            disabled={isDeletingApiToken}
                            leftSection={<TbTrash size={15} />}
                            onClick={() => deleteApiToken({ route: { uuid: apiToken.uuid } })}
                        >
                            {t('common.action.delete')}
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            }
            value={
                isExpired ? (
                    <Text c="red.5" fw={600} inherit span>
                        {t('api-tokens-card.widget.expired')}
                    </Text>
                ) : isFull ? (
                    t('api-tokens-card.widget.full-access')
                ) : (
                    apiToken.scopes.length
                )
            }
        />
    )
}

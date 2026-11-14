import { GetActiveSessionsOnNodeFeature } from '@features/ui/dashboard/nodes/get-active-sesions-on-node'
import { GetNodeGeocheckFeature } from '@features/ui/dashboard/nodes/get-node-geocheck'
import { GetNodeInboundsHostsFeature } from '@features/ui/dashboard/nodes/get-node-inbounds-hosts'
import { GetNodeLinkedHostsFeature } from '@features/ui/dashboard/nodes/get-node-linked-hosts'
import { GetNodeUsersUsageFeature } from '@features/ui/dashboard/nodes/get-node-users-usage'
import { OpenNodeSshFeature } from '@features/ui/dashboard/nodes/open-node-ssh'
import {
    ActionIcon,
    Badge,
    Box,
    Divider,
    Group,
    Loader,
    Progress,
    ThemeIconProps,
    Tooltip
} from '@mantine/core'
import { modals } from '@mantine/modals'
import { GetNodeCommand, UpdateNodeCommand } from '@remnawave/backend-contract'
import { githubDarkTheme, JsonEditor } from 'json-edit-react'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PiCloudArrowUpDuotone, PiWarningCircle } from 'react-icons/pi'
import {
    TbChartArcs,
    TbClockHour4,
    TbCpu,
    TbJson,
    TbPower,
    TbRefresh,
    TbServer,
    TbUsers,
    TbWifi,
    TbWifiOff
} from 'react-icons/tb'

import { queryClient } from '@shared/api'
import { QueryKeys, useDisableNode, useEnableNode, useGetNodeMetadata } from '@shared/api/hooks'
import { BoltRow } from '@shared/ui/bolt-list'
import { XrayLogo } from '@shared/ui/logos'
import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'
import { SectionCard } from '@shared/ui/section-card'
import { prettifyBytesUtil } from '@shared/utils/bytes'
import { getNodeResetDaysUtil, getXrayUptimeUtil } from '@shared/utils/time-utils'

import classes from './node-details-card.module.css'

interface IProps {
    node: GetNodeCommand.Response['response']
}

export const NodeDetailsCardWidget = memo((props: IProps) => {
    const { node } = props

    const { t } = useTranslation()

    const mutationParams = {
        route: {
            uuid: node.uuid
        },
        mutationFns: {
            onSuccess: async (node: UpdateNodeCommand.Response['response']) => {
                await queryClient.setQueryData(
                    QueryKeys.nodes.getNode({ uuid: node.uuid }).queryKey,
                    node
                )
            }
        }
    }

    const { data: metadata, isLoading: isMetadataLoading } = useGetNodeMetadata({
        route: { uuid: node.uuid }
    })
    const { mutate: disableNode, isPending: isDisableNodePending } = useDisableNode(mutationParams)
    const { mutate: enableNode, isPending: isEnableNodePending } = useEnableNode(mutationParams)

    const isConfigMissing = useMemo(() => {
        return (
            node.configProfile.activeConfigProfileUuid === null ||
            node.configProfile.activeInbounds.length === 0
        )
    }, [node.configProfile])

    const { IconComponent, themeIconColor } = useMemo(() => {
        let IconComponent: React.ComponentType<{ size: number }>
        let themeIconColor: ThemeIconProps['color'] = 'red'

        if (isConfigMissing) {
            IconComponent = PiWarningCircle
            themeIconColor = 'red'
            return { IconComponent, themeIconColor }
        }

        if (node.isDisabled) {
            IconComponent = TbWifiOff
            themeIconColor = 'gray'
            return { IconComponent, themeIconColor }
        }

        if (node.isConnected) {
            IconComponent = TbWifi
            themeIconColor = 'teal'
        } else if (node.isConnecting) {
            IconComponent = PiCloudArrowUpDuotone
            themeIconColor = 'yellow'
        } else {
            IconComponent = PiWarningCircle
            themeIconColor = 'red'
        }

        return { IconComponent, themeIconColor }
    }, [node.isConnected, node.isConnecting, node.isDisabled, isConfigMissing])

    const trafficData = useMemo(() => {
        let maxData = '∞'
        let percentage = 0

        const prettyUsedData = prettifyBytesUtil(node.trafficUsedBytes || 0) || '0 B'

        if (node.isTrafficTrackingActive) {
            maxData = prettifyBytesUtil(node.trafficLimitBytes || 0) || '∞'
            if (node.trafficLimitBytes === 0) {
                percentage = 100
            } else {
                percentage = Math.floor(
                    ((node.trafficUsedBytes ?? 0) * 100) / (node.trafficLimitBytes ?? 0)
                )
            }
        }

        return {
            maxData,
            percentage,
            prettyUsedData,
            isUnlimited: !node.isTrafficTrackingActive || node.trafficLimitBytes === 0
        }
    }, [node.trafficUsedBytes, node.trafficLimitBytes, node.isTrafficTrackingActive])

    const handleToggleNodeStatus = () => {
        if (node.isDisabled) {
            enableNode({})
        } else {
            disableNode({})
        }
    }

    return (
        <SectionCard.Root>
            <SectionCard.Section>
                <Group align="flex-center" justify="space-between">
                    <BaseOverlayHeader
                        iconColor={themeIconColor}
                        IconComponent={IconComponent}
                        iconSize={20}
                        iconVariant="soft"
                        title={t('node-details-card.widget.node-details')}
                        titleOrder={5}
                    />

                    <Group gap="xs">
                        {node.isConnected && (
                            <Tooltip
                                label={t('node-stats.card.represents-the-uptime-of-the-xray-core')}
                            >
                                <Badge
                                    color="teal"
                                    h={28}
                                    leftSection={<XrayLogo size={14} />}
                                    size="lg"
                                    variant="light"
                                    visibleFrom="sm"
                                >
                                    {getXrayUptimeUtil(node.xrayUptime)}
                                </Badge>
                            </Tooltip>
                        )}
                        {!isConfigMissing && (
                            <Tooltip
                                label={
                                    node.isDisabled
                                        ? t('node-details-card.widget.enable-node')
                                        : t('node-details-card.widget.disable-node')
                                }
                            >
                                <ActionIcon
                                    color={node.isDisabled ? 'teal' : 'red'}
                                    disabled={isDisableNodePending || isEnableNodePending}
                                    onClick={handleToggleNodeStatus}
                                    size="md"
                                    variant="light"
                                >
                                    {isDisableNodePending || isEnableNodePending ? (
                                        <Loader
                                            color={node.isDisabled ? 'teal' : 'red'}
                                            size="xs"
                                        />
                                    ) : (
                                        <TbPower size={16} />
                                    )}
                                </ActionIcon>
                            </Tooltip>
                        )}

                        {isConfigMissing && (
                            <Tooltip
                                label={t(
                                    'node-details-card.widget.config-profile-or-inbounds-is-missing'
                                )}
                            >
                                <ActionIcon color="gray" disabled size="md" variant="light">
                                    <TbPower size={16} />
                                </ActionIcon>
                            </Tooltip>
                        )}
                    </Group>
                </Group>
            </SectionCard.Section>

            <SectionCard.Section>
                <Group gap="xs" justify="flex-end">
                    <Group gap="xs" justify="center">
                        <Tooltip label={t('bolt.user.metadata')}>
                            <ActionIcon
                                color="teal"
                                disabled={!metadata}
                                loading={isMetadataLoading}
                                onClick={() => {
                                    if (!metadata) return
                                    modals.open({
                                        centered: true,
                                        size: 'auto',
                                        title: (
                                            <BaseOverlayHeader
                                                iconColor="teal"
                                                IconComponent={TbJson}
                                                iconVariant="soft"
                                                title={t('bolt.user.metadata')}
                                            />
                                        ),
                                        children: (
                                            <Box>
                                                <JsonEditor
                                                    collapse={3}
                                                    data={metadata.metadata as object}
                                                    indent={4}
                                                    maxWidth="100%"
                                                    rootName=""
                                                    theme={githubDarkTheme}
                                                    viewOnly
                                                />
                                            </Box>
                                        )
                                    })
                                }}
                                size="lg"
                                variant="soft"
                            >
                                <TbJson size={22} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>

                    <Divider opacity={0.3} orientation="vertical" />

                    <Group gap="xs" justify="center">
                        <GetNodeLinkedHostsFeature nodeUuid={node.uuid} />
                        <GetNodeInboundsHostsFeature nodeUuid={node.uuid} />
                    </Group>

                    <Divider opacity={0.3} orientation="vertical" />

                    <Group gap="xs" justify="center">
                        <GetNodeGeocheckFeature node={node} />
                        <OpenNodeSshFeature node={node} />
                        <GetNodeUsersUsageFeature nodeUuid={node.uuid} />
                        <GetActiveSessionsOnNodeFeature nodeUuid={node.uuid} />
                    </Group>
                </Group>
            </SectionCard.Section>

            {/* Строки выравниваются по строкам соседних групп: поле карточки 16 px минус поле строки 12 px. */}
            <SectionCard.Section mx={-12}>
                <BoltRow
                    icon={TbChartArcs}
                    label={t('bolt.create.traffic')}
                    value={`${trafficData.prettyUsedData} ${t('bolt.user.of-limit', { limit: trafficData.maxData })}`}
                />
                {!trafficData.isUnlimited && (
                    <Progress
                        classNames={{ root: classes.bar, section: classes.barFill }}
                        size={4}
                        value={trafficData.percentage}
                    />
                )}
                {node.isTrafficTrackingActive && node.trafficResetDay && (
                    <BoltRow
                        icon={TbRefresh}
                        label={t('bolt.text.traffic-reset')}
                        value={t('bolt.text.in-days', {
                            count: getNodeResetDaysUtil(node.trafficResetDay)
                        })}
                    />
                )}
                {node.isConnected && (
                    <>
                        <BoltRow
                            icon={TbUsers}
                            label={t('bolt.users.online')}
                            value={node.usersOnline ?? 0}
                        />
                        {node.xrayUptime !== 0 && (
                            <BoltRow
                                icon={TbClockHour4}
                                label={t('bolt.text.xray-uptime')}
                                value={getXrayUptimeUtil(node.xrayUptime)}
                            />
                        )}
                        {node.versions && (
                            <>
                                <BoltRow
                                    icon={TbCpu}
                                    label={t('node-details-card.widget.xray-core-version')}
                                    value={node.versions.xray}
                                />
                                <BoltRow
                                    icon={TbServer}
                                    label={t('bolt.text.node-version')}
                                    value={node.versions.node}
                                />
                            </>
                        )}
                    </>
                )}
            </SectionCard.Section>
        </SectionCard.Root>
    )
})

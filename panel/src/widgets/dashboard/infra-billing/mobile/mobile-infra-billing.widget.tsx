import { ActionIcon, Group, Stack, Tabs, Transition } from '@mantine/core'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbCloud, TbCreditCard, TbPlus, TbRefresh, TbServer } from 'react-icons/tb'

import { showModal } from '@shared/_modals/show-modal'
import {
    useGetInfraBillingHistoryRecordsInfinite,
    useGetInfraBillingNodes,
    useGetInfraProviders
} from '@shared/api/hooks'
import { LoadingScreen } from '@shared/ui'

import { MobileNodesListWidget } from './mobile-nodes-list.widget'
import { MobileProvidersListWidget } from './mobile-providers-list.widget'
import { StatsWidget } from '../stats-widget/stats.widget'
import { VirtualizedRecordsList } from './virtualized-records-list.widget'

const RECORDS_HEIGHT = 'calc(100vh - 280px)'

type TabValue = 'nodes' | 'providers' | 'records'

export function MobileInfraBillingWidget() {
    const [activeTab, setActiveTab] = useState<TabValue>('nodes')
    const {
        data: infraProviders,
        isLoading: isInfraProvidersLoading,
        refetch: refetchInfraProviders,
        isRefetching: isInfraProvidersRefetching
    } = useGetInfraProviders()
    const {
        data: infraBillingNodes,
        isLoading: isInfraBillingNodesLoading,
        refetch: refetchInfraBillingNodes,
        isRefetching: isInfraBillingNodesRefetching
    } = useGetInfraBillingNodes()
    const {
        data: infraBillingRecordsData,
        refetch: refetchRecords,
        isLoading: isInfraBillingRecordsLoading,
        isRefetching: isInfraBillingRecordsRefetching,
        fetchNextPage: fetchNextRecordsPage,
        hasNextPage: hasNextRecordsPage,
        isFetchingNextPage: isFetchingNextRecordsPage
    } = useGetInfraBillingHistoryRecordsInfinite()

    const billingRecords = infraBillingRecordsData?.pages.flatMap((page) => page.records) ?? []

    const handleLoadMoreRecords = () => {
        if (hasNextRecordsPage && !isFetchingNextRecordsPage) {
            fetchNextRecordsPage()
        }
    }

    const { t } = useTranslation()

    const handleAdd = () => {
        switch (activeTab) {
            case 'nodes':
                showModal('infraBilling_createInfraBillingNodeModal')
                break
            case 'providers':
                showModal('infraBilling_createInfraProviderModal')
                break
            case 'records':
                showModal('infraBilling_createInfraBillingRecordModal')
                break
            default:
                break
        }
    }

    const handleRefetch = () => {
        refetchRecords()
        refetchInfraBillingNodes()
        refetchInfraProviders()
    }

    if (
        isInfraBillingNodesLoading ||
        isInfraProvidersLoading ||
        isInfraBillingRecordsLoading ||
        !infraBillingNodes ||
        !infraProviders ||
        !infraBillingRecordsData
    ) {
        return <LoadingScreen />
    }

    return (
        <Stack gap="xs" pos="relative">
            <StatsWidget />

            <Tabs
                color="cyan"
                keepMountedMode="display-none"
                onChange={(value) => {
                    if (value) {
                        setActiveTab(value as TabValue)
                    }
                }}
                value={activeTab}
            >
                <Tabs.List grow mb="md">
                    <Tabs.Tab leftSection={<TbServer size={16} />} value="nodes">
                        {t('constants.nodes')}
                    </Tabs.Tab>
                    <Tabs.Tab leftSection={<TbCreditCard size={16} />} value="records">
                        {t('mobile-infra-billing.widget.history')}
                    </Tabs.Tab>
                    <Tabs.Tab leftSection={<TbCloud size={16} />} value="providers">
                        {t('mobile-infra-billing.widget.providers')}
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="nodes">
                    <Transition
                        duration={200}
                        keepMounted
                        mounted={activeTab === 'nodes'}
                        timingFunction="linear"
                        transition="fade"
                    >
                        {(styles) => (
                            <MobileNodesListWidget
                                nodes={infraBillingNodes.billingNodes}
                                style={styles}
                            />
                        )}
                    </Transition>
                </Tabs.Panel>

                <Tabs.Panel value="records">
                    <Transition
                        duration={200}
                        keepMounted
                        mounted={activeTab === 'records'}
                        timingFunction="linear"
                        transition="fade"
                    >
                        {(styles) => (
                            <VirtualizedRecordsList
                                height={RECORDS_HEIGHT}
                                isLoadingMore={isFetchingNextRecordsPage}
                                onReachBottom={handleLoadMoreRecords}
                                records={billingRecords}
                                refetchRecords={refetchRecords}
                                style={styles}
                            />
                        )}
                    </Transition>
                </Tabs.Panel>

                <Tabs.Panel value="providers">
                    <Transition
                        duration={200}
                        keepMounted
                        mounted={activeTab === 'providers'}
                        timingFunction="linear"
                        transition="fade"
                    >
                        {(styles) => (
                            <MobileProvidersListWidget
                                providers={infraProviders.providers}
                                style={styles}
                            />
                        )}
                    </Transition>
                </Tabs.Panel>
            </Tabs>

            {/* Над нижней панелью вкладок, а не под ней: высота панели — 72 px плюс безопасная зона. */}
            <Group
                gap={8}
                pos="fixed"
                right={16}
                style={{
                    bottom: 'calc(84px + env(safe-area-inset-bottom, 0px))',
                    zIndex: 100,
                    padding: 4,
                    border: '1px solid var(--bolt-line)',
                    borderRadius: 'var(--mantine-radius-md)',
                    backgroundColor: 'var(--bolt-surface-raised)'
                }}
            >
                <ActionIcon
                    color="cyan"
                    loading={
                        isInfraProvidersRefetching ||
                        isInfraBillingNodesRefetching ||
                        isInfraBillingRecordsRefetching
                    }
                    onClick={handleRefetch}
                    size={40}
                    variant="soft"
                >
                    <TbRefresh size={22} />
                </ActionIcon>
                <ActionIcon color="teal" onClick={handleAdd} size={40} variant="soft">
                    <TbPlus size={22} />
                </ActionIcon>
            </Group>
        </Stack>
    )
}

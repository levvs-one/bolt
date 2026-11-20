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
import { PageHeaderShared } from '@shared/ui/page-header'

import { StatsWidget } from '../stats-widget/stats.widget'
import { MobileNodesListWidget } from './mobile-nodes-list.widget'
import { MobileProvidersListWidget } from './mobile-providers-list.widget'
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
        <>
            <PageHeaderShared
                actions={
                    <Group gap={8}>
                        <ActionIcon
                            aria-label={t('common.action.refresh')}
                            loading={
                                isInfraProvidersRefetching ||
                                isInfraBillingNodesRefetching ||
                                isInfraBillingRecordsRefetching
                            }
                            onClick={handleRefetch}
                            size={36}
                        >
                            <TbRefresh size={20} strokeWidth={1.75} />
                        </ActionIcon>
                        <ActionIcon
                            aria-label={t('common.action.create')}
                            onClick={handleAdd}
                            size={36}
                        >
                            <TbPlus size={20} strokeWidth={1.75} />
                        </ActionIcon>
                    </Group>
                }
                title={t('constants.infra-billing')}
            />

            <Stack gap="xs">
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
            </Stack>
        </>
    )
}

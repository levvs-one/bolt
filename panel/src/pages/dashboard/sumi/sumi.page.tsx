import {
    Button,
    Checkbox,
    NumberInput,
    SegmentedControl,
    Select,
    Switch,
    Textarea,
    TextInput
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { instance } from '@shared/api/axios'
import { useGetHosts, useGetInternalSquads, useGetNodes } from '@shared/api/hooks'
import { queryClient } from '@shared/api/query-client'
import { BoltGroup, BoltRow } from '@shared/ui/bolt-list'
import { LoadingScreen } from '@shared/ui/loading-screen'
import { Page } from '@shared/ui/page'
import { PageHeaderShared } from '@shared/ui/page-header'

import classes from './sumi.module.css'

// Эндпоинт модуля Bolt; в npm-контракте Remnawave его нет.
const SETTINGS_URL = '/api/bolt/sumi/settings'
const SETTINGS_QUERY_KEY = ['bolt', 'sumi', 'settings']
const GIB = 1024 ** 3

const BrandSchema = z.object({
    prefix: z.string(),
    internalSquadUuids: z.array(z.string()),
    title: z.string(),
    announce: z.string(),
    blockedLabel: z.string(),
    blockedAnnounce: z.string()
})

const SettingsSchema = z.object({
    entryTagPrefix: z.string(),
    meteredNodes: z.array(z.string()),
    hostKeys: z.record(z.string(), z.enum(['ENTRY', 'METERED'])),
    autoSelectedHost: z.string().nullable(),
    nodeDns: z.record(z.string(), z.array(z.string())),
    brands: z.array(BrandSchema),
    defaultMeteredLimitBytes: z.number(),
    defaultDeviceLimit: z.number(),
    allowWithoutDeviceId: z.boolean(),
    deviceForgetDays: z.number(),
    subscriptionBaseUrl: z.string().nullable(),
    mirrorBaseUrl: z.string().nullable(),
    routingProfiles: z.array(z.record(z.string(), z.unknown()))
})

type TSettings = z.infer<typeof SettingsSchema>
type TBrand = z.infer<typeof BrandSchema>
type THostKey = 'ENTRY' | 'METERED' | 'SHARED'

const EMPTY_BRAND: TBrand = {
    prefix: '',
    internalSquadUuids: [],
    title: '',
    announce: '',
    blockedLabel: '',
    blockedAnnounce: ''
}

const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value]

export function SumiPage() {
    const { t } = useTranslation()
    const { data: nodes, isLoading: isNodesLoading } = useGetNodes()
    const { data: hosts, isLoading: isHostsLoading } = useGetHosts()
    const { data: squads, isLoading: isSquadsLoading } = useGetInternalSquads()
    const { data: saved, isLoading: isSettingsLoading } = useQuery({
        queryKey: SETTINGS_QUERY_KEY,
        queryFn: async () => SettingsSchema.parse((await instance.get(SETTINGS_URL)).data.response)
    })

    // Правки живут в черновике, пока их не сохранили; до первой правки — сохранённое.
    const [edited, setDraft] = useState<null | TSettings>(null)
    const [editedRouting, setRoutingText] = useState<null | string>(null)
    const [isSaving, setIsSaving] = useState(false)

    if (isNodesLoading || isHostsLoading || isSquadsLoading || isSettingsLoading || !saved) {
        return <LoadingScreen />
    }

    const draft = edited ?? saved
    const routingText = editedRouting ?? JSON.stringify(saved.routingProfiles, null, 2)

    const nodeList = nodes ?? []
    const hostList = hosts ?? []
    const squadList = squads?.internalSquads ?? []
    const set = (patch: Partial<TSettings>) => setDraft({ ...draft, ...patch })

    const setBrand = (index: number, patch: Partial<TBrand>) =>
        set({
            brands: draft.brands.map((brand, position) =>
                position === index ? { ...brand, ...patch } : brand
            )
        })

    const setHostKey = (hostUuid: string, key: THostKey) => {
        const { [hostUuid]: _, ...rest } = draft.hostKeys
        set({ hostKeys: key === 'SHARED' ? rest : { ...rest, [hostUuid]: key } })
    }

    const setNodeDns = (nodeUuid: string, text: string) => {
        const servers = text
            .split(',')
            .map((server) => server.trim())
            .filter(Boolean)
        const { [nodeUuid]: _, ...rest } = draft.nodeDns
        set({ nodeDns: servers.length > 0 ? { ...rest, [nodeUuid]: servers } : rest })
    }

    const save = async () => {
        let routingProfiles: TSettings['routingProfiles']
        try {
            routingProfiles = z
                .array(z.record(z.string(), z.unknown()))
                .parse(JSON.parse(routingText || '[]'))
        } catch {
            notifications.show({ message: t('bolt.sumi.routing-invalid') })
            return
        }

        setIsSaving(true)
        try {
            const response = await instance.patch(SETTINGS_URL, {
                ...draft,
                routingProfiles
            })
            queryClient.setQueryData(
                SETTINGS_QUERY_KEY,
                SettingsSchema.parse(response.data.response)
            )
            setDraft(null)
            setRoutingText(null)
            notifications.show({ message: t('bolt.sumi.saved') })
        } finally {
            // Причину отказа показывает уведомлением общий обработчик axios.
            setIsSaving(false)
        }
    }

    return (
        <Page title={t('bolt.sumi.title')}>
            <PageHeaderShared title={t('bolt.sumi.title')} />

            <div className={classes.layout}>
                <div className={classes.column}>
                    {draft.brands.map((brand, index) => (
                        <BoltGroup className={classes.form} key={index}>
                            <TextInput
                                label={t('bolt.sumi.brand-prefix')}
                                onChange={(event) =>
                                    setBrand(index, { prefix: event.currentTarget.value.trim() })
                                }
                                value={brand.prefix}
                            />
                            <TextInput
                                label={t('bolt.sumi.brand-title')}
                                onChange={(event) =>
                                    setBrand(index, { title: event.currentTarget.value })
                                }
                                value={brand.title}
                            />
                            <Textarea
                                autosize
                                label={t('bolt.sumi.brand-announce')}
                                minRows={2}
                                onChange={(event) =>
                                    setBrand(index, { announce: event.currentTarget.value })
                                }
                                value={brand.announce}
                            />
                            <TextInput
                                label={t('bolt.sumi.brand-blocked-label')}
                                onChange={(event) =>
                                    setBrand(index, { blockedLabel: event.currentTarget.value })
                                }
                                value={brand.blockedLabel}
                            />
                            <Textarea
                                autosize
                                label={t('bolt.sumi.brand-blocked-announce')}
                                minRows={2}
                                onChange={(event) =>
                                    setBrand(index, { blockedAnnounce: event.currentTarget.value })
                                }
                                value={brand.blockedAnnounce}
                            />
                            {squadList.map((squad) => (
                                <Checkbox
                                    checked={brand.internalSquadUuids.includes(squad.uuid)}
                                    color="gray"
                                    key={squad.uuid}
                                    label={squad.name}
                                    onChange={() =>
                                        setBrand(index, {
                                            internalSquadUuids: toggle(
                                                brand.internalSquadUuids,
                                                squad.uuid
                                            )
                                        })
                                    }
                                />
                            ))}
                        </BoltGroup>
                    ))}

                    <Button
                        onClick={() => set({ brands: [...draft.brands, EMPTY_BRAND] })}
                        variant="default"
                    >
                        {t('bolt.sumi.brand-add')}
                    </Button>

                    <BoltGroup>
                        {hostList.map((host) => (
                            <BoltRow
                                key={host.uuid}
                                label={host.remark}
                                rightSection={
                                    <SegmentedControl
                                        data={[
                                            { value: 'SHARED', label: t('bolt.sumi.key-shared') },
                                            { value: 'ENTRY', label: t('bolt.sumi.key-entry') },
                                            { value: 'METERED', label: t('bolt.sumi.key-metered') }
                                        ]}
                                        onChange={(value) =>
                                            setHostKey(host.uuid, value as THostKey)
                                        }
                                        size="xs"
                                        value={draft.hostKeys[host.uuid] ?? 'SHARED'}
                                    />
                                }
                            />
                        ))}
                    </BoltGroup>
                </div>

                <div className={classes.column}>
                    <BoltGroup className={classes.form}>
                        <NumberInput
                            allowDecimal={false}
                            hideControls
                            label={t('bolt.sumi.metered-default-gb')}
                            min={0}
                            onChange={(value) =>
                                set({ defaultMeteredLimitBytes: Number(value) * GIB })
                            }
                            value={Math.round(draft.defaultMeteredLimitBytes / GIB)}
                        />
                        {nodeList.map((node) => (
                            <Checkbox
                                checked={draft.meteredNodes.includes(node.uuid)}
                                color="gray"
                                key={node.uuid}
                                label={t('bolt.sumi.metered-node', { node: node.name })}
                                onChange={() =>
                                    set({ meteredNodes: toggle(draft.meteredNodes, node.uuid) })
                                }
                            />
                        ))}
                    </BoltGroup>

                    <BoltGroup className={classes.form}>
                        <Select
                            clearable
                            data={hostList.map((host) => ({
                                value: host.uuid,
                                label: host.remark
                            }))}
                            label={t('bolt.sumi.auto-host')}
                            onChange={(value) => set({ autoSelectedHost: value })}
                            searchable
                            value={draft.autoSelectedHost}
                        />
                    </BoltGroup>

                    <BoltGroup className={classes.form}>
                        {nodeList.map((node) => (
                            <TextInput
                                key={node.uuid}
                                label={t('bolt.sumi.node-dns', { node: node.name })}
                                onChange={(event) =>
                                    setNodeDns(node.uuid, event.currentTarget.value)
                                }
                                placeholder="tcp+local://127.0.0.2:53"
                                value={(draft.nodeDns[node.uuid] ?? []).join(', ')}
                            />
                        ))}
                    </BoltGroup>

                    <BoltGroup className={classes.form}>
                        <TextInput
                            label={t('bolt.sumi.subscription-url')}
                            onChange={(event) =>
                                set({ subscriptionBaseUrl: event.currentTarget.value || null })
                            }
                            placeholder="https://sub.example.com/s/"
                            value={draft.subscriptionBaseUrl ?? ''}
                        />
                        <TextInput
                            label={t('bolt.sumi.mirror-url')}
                            onChange={(event) =>
                                set({ mirrorBaseUrl: event.currentTarget.value || null })
                            }
                            placeholder="https://cdn.example.com/s/"
                            value={draft.mirrorBaseUrl ?? ''}
                        />
                        <TextInput
                            label={t('bolt.sumi.entry-prefix')}
                            onChange={(event) => set({ entryTagPrefix: event.currentTarget.value })}
                            value={draft.entryTagPrefix}
                        />
                    </BoltGroup>

                    <BoltGroup className={classes.form}>
                        <div className={classes.pair}>
                            <NumberInput
                                allowDecimal={false}
                                hideControls
                                label={t('bolt.sumi.device-limit')}
                                max={50}
                                min={1}
                                onChange={(value) => set({ defaultDeviceLimit: Number(value) })}
                                value={draft.defaultDeviceLimit}
                            />
                            <NumberInput
                                allowDecimal={false}
                                hideControls
                                label={t('bolt.sumi.device-forget-days')}
                                max={3650}
                                min={1}
                                onChange={(value) => set({ deviceForgetDays: Number(value) })}
                                value={draft.deviceForgetDays}
                            />
                        </div>
                    </BoltGroup>
                    <BoltGroup>
                        <BoltRow
                            label={t('bolt.sumi.allow-without-device-id')}
                            rightSection={
                                <Switch
                                    checked={draft.allowWithoutDeviceId}
                                    color="gray"
                                    onChange={(event) =>
                                        set({ allowWithoutDeviceId: event.currentTarget.checked })
                                    }
                                />
                            }
                        />
                    </BoltGroup>

                    <BoltGroup className={classes.form}>
                        <Textarea
                            autosize
                            label={t('bolt.sumi.routing-profiles')}
                            maxRows={14}
                            minRows={4}
                            onChange={(event) => setRoutingText(event.currentTarget.value)}
                            value={routingText}
                        />
                    </BoltGroup>

                    <Button fullWidth h={48} loading={isSaving} onClick={save} variant="filled">
                        {t('bolt.sumi.save')}
                    </Button>
                </div>
            </div>
        </Page>
    )
}

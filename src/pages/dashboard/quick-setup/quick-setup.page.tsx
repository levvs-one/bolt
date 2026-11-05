import { Button, Checkbox, NumberInput, Switch, TextInput } from '@mantine/core'
import {
    CreateConfigProfileCommand,
    CreateHostCommand,
    UpdateInternalSquadCommand,
    UpdateNodeCommand
} from '@remnawave/backend-contract'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbCheck, TbCircle, TbLoader2, TbX } from 'react-icons/tb'
import { useNavigate } from 'react-router'
import { z } from 'zod'

import { instance } from '@shared/api/axios'
import { QueryKeys, useGetInternalSquads, useGetNodes } from '@shared/api/hooks'
import { queryClient } from '@shared/api/query-client'
import { ROUTES } from '@shared/constants'
import {
    buildRealityXhttpConfig,
    generateTagSuffix,
    generateXhttpPath,
    REALITY_XHTTP_DEFAULTS,
    realityXhttpTags
} from '@shared/lib/bolt-presets/reality-xhttp.preset'
import { BoltGroup, BoltRow } from '@shared/ui/bolt-list'
import { LoadingScreen } from '@shared/ui/loading-screen'
import { Page } from '@shared/ui/page'
import { PageHeaderShared } from '@shared/ui/page-header'

import classes from './quick-setup.module.css'

// Эндпоинт модуля Bolt на бэкенде; в npm-контракте Remnawave его нет.
const REALITY_KEYS_URL = '/api/bolt/reality-keys'
const RealityKeysSchema = z.object({
    response: z.object({
        privateKey: z.string(),
        publicKey: z.string(),
        shortIds: z.array(z.string())
    })
})

const STEPS = ['keys', 'profile', 'nodes', 'hosts', 'squads'] as const
type TStep = (typeof STEPS)[number]
type TStepState = 'done' | 'error' | 'idle' | 'running' | 'skipped'

const STEP_ICONS = {
    idle: TbCircle,
    running: TbLoader2,
    done: TbCheck,
    skipped: TbCircle,
    error: TbX
} as const

const MIN_PORT = 1
const MAX_PORT = 65535

export function QuickSetupPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { data: nodes, isLoading: isNodesLoading } = useGetNodes()
    const { data: squads, isLoading: isSquadsLoading } = useGetInternalSquads()

    const [profileName, setProfileName] = useState('Bolt Reality')
    const [serverName, setServerName] = useState('')
    const [realityPort, setRealityPort] = useState<number>(REALITY_XHTTP_DEFAULTS.realityPort)
    const [xhttpPort, setXhttpPort] = useState<number>(REALITY_XHTTP_DEFAULTS.xhttpPort)
    const [hiddenPort, setHiddenPort] = useState<number>(REALITY_XHTTP_DEFAULTS.hiddenXhttpPort)
    const [selectedNodes, setSelectedNodes] = useState<null | string[]>(null)
    const [selectedSquads, setSelectedSquads] = useState<null | string[]>(null)
    const [createHosts, setCreateHosts] = useState(true)
    const [steps, setSteps] = useState<Record<TStep, TStepState>>(() =>
        Object.fromEntries(STEPS.map((step) => [step, 'idle'])) as Record<TStep, TStepState>
    )
    const [isRunning, setIsRunning] = useState(false)
    const [createdProfileUuid, setCreatedProfileUuid] = useState<null | string>(null)

    if (isNodesLoading || isSquadsLoading) return <LoadingScreen />

    const nodeList = nodes ?? []
    const squadList = squads?.internalSquads ?? []
    const nodeUuids = selectedNodes ?? nodeList.map((node) => node.uuid)
    const squadUuids = selectedSquads ?? squadList.slice(0, 1).map((squad) => squad.uuid)
    const ports = [realityPort, xhttpPort, hiddenPort]
    const isValid =
        profileName.trim().length > 0 &&
        serverName.trim().length > 0 &&
        new Set(ports).size === ports.length

    const toggle = (list: string[], uuid: string) =>
        list.includes(uuid) ? list.filter((item) => item !== uuid) : [...list, uuid]

    const mark = (step: TStep, state: TStepState) =>
        setSteps((previous) => ({ ...previous, [step]: state }))

    // Шаг выполняется отдельно: ошибка на нодах не мешает создать хосты и обновить сквады.
    const step = async (name: TStep, enabled: boolean, action: () => Promise<void>) => {
        if (!enabled) {
            mark(name, 'skipped')
            return true
        }
        mark(name, 'running')
        try {
            await action()
            mark(name, 'done')
            return true
        } catch {
            // Причину показывает уведомлением общий обработчик axios.
            mark(name, 'error')
            return false
        }
    }

    const run = async () => {
        setIsRunning(true)
        setCreatedProfileUuid(null)
        STEPS.forEach((name) => mark(name, 'idle'))

        const tagSuffix = generateTagSuffix()
        const tags = realityXhttpTags(tagSuffix)
        let keys: null | z.infer<typeof RealityKeysSchema>['response'] = null
        let profile: CreateConfigProfileCommand.Response['response'] | null = null

        await step('keys', true, async () => {
            keys = RealityKeysSchema.parse((await instance.post(REALITY_KEYS_URL)).data).response
        })
        const generatedKeys = keys as null | z.infer<typeof RealityKeysSchema>['response']

        if (generatedKeys) {
            await step('profile', true, async () => {
                const config = buildRealityXhttpConfig({
                    privateKey: generatedKeys.privateKey,
                    shortIds: generatedKeys.shortIds,
                    serverName: serverName.trim(),
                    realityPort,
                    xhttpPort,
                    hiddenXhttpPort: hiddenPort,
                    xhttpPath: generateXhttpPath(),
                    tagSuffix
                })
                profile = CreateConfigProfileCommand.ResponseSchema.parse(
                    (
                        await instance.post(CreateConfigProfileCommand.url, {
                            name: profileName.trim(),
                            config
                        })
                    ).data
                ).response
            })
        }

        const created = profile as CreateConfigProfileCommand.Response['response'] | null
        if (!created) {
            ;(['nodes', 'hosts', 'squads'] as const).forEach((name) => mark(name, 'skipped'))
            setIsRunning(false)
            return
        }

        setCreatedProfileUuid(created.uuid)
        const inboundUuids = created.inbounds.map((inbound) => inbound.uuid)
        const inboundByTag = new Map(created.inbounds.map((inbound) => [inbound.tag, inbound]))
        const targetNodes = nodeList.filter((node) => nodeUuids.includes(node.uuid))
        const publicInbounds = [
            { tag: tags.reality, port: realityPort, suffix: '' },
            { tag: tags.xhttp, port: xhttpPort, suffix: ' XHTTP' }
        ]

        await step('nodes', targetNodes.length > 0, async () => {
            for (const node of targetNodes) {
                const body: z.input<typeof UpdateNodeCommand.RequestBodySchema> = {
                    uuid: node.uuid,
                    configProfile: {
                        activeConfigProfileUuid: created.uuid,
                        activeInbounds: inboundUuids
                    }
                }
                await instance.patch(UpdateNodeCommand.url, body)
            }
        })

        await step('hosts', createHosts && targetNodes.length > 0, async () => {
            for (const node of targetNodes) {
                for (const entry of publicInbounds) {
                    const inbound = inboundByTag.get(entry.tag)
                    if (!inbound) continue
                    const body: z.input<typeof CreateHostCommand.RequestBodySchema> = {
                        remark: `${node.name}${entry.suffix}`,
                        address: node.address,
                        port: entry.port,
                        sni: serverName.trim(),
                        fingerprint: 'chrome',
                        inbound: {
                            configProfileUuid: created.uuid,
                            configProfileInboundUuid: inbound.uuid
                        },
                        nodes: [node.uuid]
                    }
                    await instance.post(CreateHostCommand.url, body)
                }
            }
        })

        const targetSquads = squadList.filter((squad) => squadUuids.includes(squad.uuid))
        await step('squads', targetSquads.length > 0, async () => {
            for (const squad of targetSquads) {
                const body: z.input<typeof UpdateInternalSquadCommand.RequestBodySchema> = {
                    uuid: squad.uuid,
                    inbounds: [
                        ...new Set([...squad.inbounds.map((inbound) => inbound.uuid), ...inboundUuids])
                    ]
                }
                await instance.patch(UpdateInternalSquadCommand.url, body)
            }
        })

        await Promise.all(
            [QueryKeys.configProfiles, QueryKeys.nodes, QueryKeys.hosts, QueryKeys.internalSquads].map(
                (key) => queryClient.invalidateQueries({ queryKey: key._def })
            )
        )
        setIsRunning(false)
    }

    const portInput = (value: number, onChange: (next: number) => void, label: string) => (
        <NumberInput
            allowDecimal={false}
            className={classes.port}
            hideControls
            label={label}
            max={MAX_PORT}
            min={MIN_PORT}
            onChange={(next) => onChange(Number(next))}
            value={value}
        />
    )

    return (
        <Page title={t('bolt.quick-setup.title')}>
            <PageHeaderShared title={t('bolt.quick-setup.title')} />

            <div className={classes.layout}>
                <div className={classes.column}>
                    <BoltGroup className={classes.form}>
                        <TextInput
                            label={t('bolt.quick-setup.profile-name')}
                            onChange={(event) => setProfileName(event.currentTarget.value)}
                            value={profileName}
                        />
                        <TextInput
                            label={t('bolt.quick-setup.server-name')}
                            onChange={(event) => setServerName(event.currentTarget.value)}
                            placeholder="www.microsoft.com"
                            value={serverName}
                        />
                        <div className={classes.ports}>
                            {portInput(realityPort, setRealityPort, 'Reality')}
                            {portInput(xhttpPort, setXhttpPort, 'XHTTP')}
                            {portInput(hiddenPort, setHiddenPort, t('bolt.quick-setup.hidden'))}
                        </div>
                    </BoltGroup>

                    <BoltGroup>
                        <BoltRow
                            label={t('bolt.quick-setup.create-hosts')}
                            rightSection={
                                <Switch
                                    checked={createHosts}
                                    color="gray"
                                    onChange={(event) => setCreateHosts(event.currentTarget.checked)}
                                />
                            }
                        />
                    </BoltGroup>

                    <BoltGroup>
                        {nodeList.map((node) => (
                            <BoltRow
                                key={node.uuid}
                                label={node.name}
                                rightSection={
                                    <Checkbox
                                        aria-label={node.name}
                                        checked={nodeUuids.includes(node.uuid)}
                                        color="gray"
                                        onChange={() => setSelectedNodes(toggle(nodeUuids, node.uuid))}
                                    />
                                }
                                value={node.address}
                            />
                        ))}
                    </BoltGroup>

                    {squadList.length > 0 && (
                        <BoltGroup>
                            {squadList.map((squad) => (
                                <BoltRow
                                    key={squad.uuid}
                                    label={squad.name}
                                    rightSection={
                                        <Checkbox
                                            aria-label={squad.name}
                                            checked={squadUuids.includes(squad.uuid)}
                                            color="gray"
                                            onChange={() =>
                                                setSelectedSquads(toggle(squadUuids, squad.uuid))
                                            }
                                        />
                                    }
                                    value={t('bolt.quick-setup.squad')}
                                />
                            ))}
                        </BoltGroup>
                    )}
                </div>

                <div className={classes.column}>
                    <BoltGroup>
                        {STEPS.map((step) => {
                            const Icon = STEP_ICONS[steps[step]]

                            return (
                                <BoltRow
                                    icon={Icon}
                                    key={step}
                                    label={t(`bolt.quick-setup.step-${step}`)}
                                    value={t(`bolt.quick-setup.state-${steps[step]}`)}
                                />
                            )
                        })}
                    </BoltGroup>

                    <Button
                        disabled={!isValid}
                        fullWidth
                        h={48}
                        loading={isRunning}
                        onClick={run}
                        variant="filled"
                    >
                        {t('bolt.quick-setup.apply')}
                    </Button>

                    {createdProfileUuid && !isRunning && (
                        <BoltGroup>
                            <BoltRow
                                label={t('bolt.quick-setup.open-profile')}
                                onClick={() =>
                                    navigate(
                                        ROUTES.DASHBOARD.MANAGEMENT.CONFIG_PROFILE_BY_UUID.replace(
                                            ':uuid',
                                            createdProfileUuid
                                        )
                                    )
                                }
                            />
                        </BoltGroup>
                    )}
                </div>
            </div>
        </Page>
    )
}

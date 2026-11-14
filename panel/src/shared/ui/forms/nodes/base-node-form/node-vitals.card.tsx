import {
    CheckIcon,
    ComboboxItem,
    Group,
    MultiSelect,
    NumberInput,
    Select,
    Stack,
    Text,
    TextInput
} from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import {
    CreateNodeCommand,
    GetNodeIntegrationsCommand,
    GetNodePluginsCommand,
    GetNodeSecretKeyCommand,
    UpdateNodeCommand
} from '@remnawave/backend-contract'
import { ForwardRefComponent, HTMLMotionProps, Variants } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { TbMapPin, TbNetwork, TbPackage, TbPlug, TbServer, TbWorld } from 'react-icons/tb'

import { BoltField, BoltGroup } from '@shared/ui/bolt-list'
import { CopyableFieldShared } from '@shared/ui/copyable-field/copyable-field'
import { TagInputPill } from '@shared/ui/tag-input-pill'

import { useExperimentalFeature } from '@entities/dashboard/view-preferences-store'

import { getCountryOptions } from './constants'
import integrationsClasses from './integrations-select.module.css'
import classes from './node-vitals.card.module.css'

interface IProps<T extends CreateNodeCommand.RequestBody | UpdateNodeCommand.RequestBody> {
    cardVariants: Variants
    form: UseFormReturnType<T>
    motionWrapper: ForwardRefComponent<HTMLDivElement, HTMLMotionProps<'div'>>
    nodeIntegrations: GetNodeIntegrationsCommand.Response['response']['nodeIntegrations']
    nodePlugins: GetNodePluginsCommand.Response['response']['nodePlugins']
    secretKey: GetNodeSecretKeyCommand.Response['response'] | undefined
}

export const NodeVitalsCard = <
    T extends CreateNodeCommand.RequestBody | UpdateNodeCommand.RequestBody
>(
    props: IProps<T>
) => {
    const { t, i18n } = useTranslation()
    const { cardVariants, form, motionWrapper, nodeIntegrations, nodePlugins, secretKey } = props

    const isNodeIntegrationsEnabled = useExperimentalFeature('nodeIntegrations')

    const MotionWrapper = motionWrapper

    return (
        <MotionWrapper variants={cardVariants}>
            <Stack gap={12}>
                <BoltGroup>
                    <BoltField icon={TbMapPin} label={t('base-node-form.country')}>
                        <Select
                            key={form.key('countryCode')}
                            {...form.getInputProps('countryCode')}
                            data={getCountryOptions(i18n.language, t('bolt.text.unknown-country'))}
                            searchable
                        />
                    </BoltField>
                    <BoltField icon={TbServer} label={t('base-node-form.internal-name')}>
                        <TextInput key={form.key('name')} {...form.getInputProps('name')} />
                    </BoltField>
                    <BoltField icon={TbWorld} label={t('common.field.address')}>
                        <TextInput
                            key={form.key('address')}
                            {...form.getInputProps('address')}
                            placeholder={t('base-node-form.e-g-example-com')}
                        />
                    </BoltField>
                    <BoltField icon={TbPlug} label={t('bolt.text.node-port')}>
                        <NumberInput
                            key={form.key('port')}
                            {...form.getInputProps('port')}
                            allowDecimal={false}
                            allowNegative={false}
                            clampBehavior="strict"
                            decimalScale={0}
                            hideControls
                            max={65535}
                            placeholder="2222"
                        />
                    </BoltField>
                    <BoltField icon={TbPackage} label={t('node-vitals.card.plugin')}>
                        <Select
                            key={form.key('activePluginUuid')}
                            {...form.getInputProps('activePluginUuid')}
                            allowDeselect
                            clearable
                            data={nodePlugins.map((nodePlugin) => ({
                                label: nodePlugin.name,
                                value: nodePlugin.uuid
                            }))}
                            nothingFoundMessage={t('node-vitals.card.nothing-found')}
                            placeholder={t('bolt.text.none')}
                            searchable
                        />
                    </BoltField>
                    <BoltField icon={TbNetwork} label={t('node-vitals.card.proxy-url')}>
                        <TextInput
                            key={form.key('proxyUrl')}
                            {...form.getInputProps('proxyUrl')}
                            placeholder="socks5://"
                        />
                    </BoltField>
                </BoltGroup>

                <BoltGroup className={classes.form}>
                    <CopyableFieldShared
                        label="SECRET_KEY"
                        size="sm"
                        value={`${secretKey?.secretKey.trimEnd() ?? ''}`}
                    />

                    {isNodeIntegrationsEnabled && (
                        <MultiSelect
                            key={form.key('integrationUuids')}
                            label={t('node-integrations.select.label')}
                            {...form.getInputProps('integrationUuids')}
                            clearable
                            data={nodeIntegrations.map((integration) => ({
                                label: integration.name,
                                value: integration.uuid,
                                description: integration.description
                            }))}
                            nothingFoundMessage={t('common.message.nothing-found')}
                            placeholder={t('node-integrations.select.placeholder')}
                            classNames={{ option: integrationsClasses.option }}
                            scrollAreaProps={{ styles: { content: { minWidth: '100%' } } }}
                            renderOption={({ option, checked }) => {
                                const { description } = option as ComboboxItem & {
                                    description?: null | string
                                }

                                return (
                                    <Group gap="xs" miw={0} w="100%" wrap="nowrap">
                                        <CheckIcon
                                            size={12}
                                            style={{
                                                flexShrink: 0,
                                                opacity: checked ? 1 : 0.25
                                            }}
                                        />
                                        <Stack flex={1} gap={0} miw={0}>
                                            <Text size="sm" truncate="end">
                                                {option.label}
                                            </Text>
                                            {description && (
                                                <Text c="dimmed" size="xs" truncate="end">
                                                    {description}
                                                </Text>
                                            )}
                                        </Stack>
                                    </Group>
                                )
                            }}
                            renderPill={({ option, value, onRemove }) => (
                                <TagInputPill onRemove={onRemove} value={option?.label ?? value} />
                            )}
                            searchable
                            styles={{
                                label: { fontWeight: 500 }
                            }}
                        />
                    )}
                </BoltGroup>
            </Stack>
        </MotionWrapper>
    )
}

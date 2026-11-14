import {
    Anchor,
    Button,
    Divider,
    Group,
    NumberInput,
    Popover,
    Select,
    Stack,
    TagsInput,
    Text,
    TextInput,
    UnstyledButton
} from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { CreateNodeCommand } from '@remnawave/backend-contract'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PiTagDuotone } from 'react-icons/pi'
import {
    TbChevronDown,
    TbMapPin,
    TbPackage,
    TbPlug,
    TbServer,
    TbSettings,
    TbWorld
} from 'react-icons/tb'

import { useGetNodePlugins, useGetNodesTags } from '@shared/api/hooks'
import { BoltField, BoltGroup } from '@shared/ui/bolt-list'
import { CopyableFieldShared } from '@shared/ui/copyable-field/copyable-field'
import { getCountryOptions } from '@shared/ui/forms/nodes/base-node-form/constants'
import { SelectInfraProviderShared } from '@shared/ui/infra-billing/select-infra-provider/select-infra-provider.shared'
import { TagInputPill } from '@shared/ui/tag-input-pill'

import { CopyDockerComposeWidget } from './copy-docker-compose.widget'
import classes from './create-node-step-1-connection.module.css'

interface IProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: UseFormReturnType<CreateNodeCommand.RequestBody, any>
    onNext: () => void
    port: number
    secretKey: string | undefined
}

export const CreateNodeStep1Connection = ({ form, onNext, secretKey, port }: IProps) => {
    const { t, i18n } = useTranslation()

    const { data: nodePlugins } = useGetNodePlugins()
    const { data: nodesTags } = useGetNodesTags()

    const [additionalOpened, setAdditionalOpened] = useState(false)

    const handleNext = async () => {
        const nameErrors = form.validateField('name')
        const countryCodeErrors = form.validateField('countryCode')
        const addressErrors = form.validateField('address')
        const portErrors = form.validateField('port')

        if (
            nameErrors.hasError ||
            countryCodeErrors.hasError ||
            addressErrors.hasError ||
            portErrors.hasError
        ) {
            return
        }

        onNext()
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                handleNext()
            }}
        >
            <Stack gap="xs" mih={400}>
                <Text c="dimmed" size="sm">
                    {t('create-node-step-1-connection.copy-the')}{' '}
                    <strong>docker-compose.yml</strong>{' '}
                    {t('create-node-step-1-connection.content-for-the-remnawave-node-below')}{' '}
                    <Anchor
                        fw="700"
                        href="https://docs.rw/docs/install/remnawave-node"
                        inherit
                        rel="noopener noreferrer"
                        target="_blank"
                        underline="hover"
                    >
                        {t('create-node-step-1-connection.learn-more')}
                    </Anchor>
                </Text>

                <Stack gap={12}>
                    <BoltGroup className={classes.padded}>
                        <CopyableFieldShared label="SECRET_KEY" size="sm" value={secretKey ?? ''} />
                    </BoltGroup>

                    <BoltGroup>
                        <BoltField icon={TbServer} label={t('base-node-form.internal-name')}>
                            <TextInput
                                key={form.key('name')}
                                placeholder={t('base-node-form.internal-name-placeholder')}
                                {...form.getInputProps('name')}
                            />
                        </BoltField>
                        <BoltField icon={TbMapPin} label={t('base-node-form.country')}>
                            <Select
                                key={form.key('countryCode')}
                                {...form.getInputProps('countryCode')}
                                data={getCountryOptions(
                                    i18n.language,
                                    t('bolt.text.unknown-country')
                                )}
                                placeholder={t('bolt.text.unknown-country')}
                                searchable
                            />
                        </BoltField>
                        <BoltField
                            icon={TbWorld}
                            label={t('create-node-step-1-connection.domain-or-ip')}
                        >
                            <TextInput
                                key={form.key('address')}
                                {...form.getInputProps('address')}
                                placeholder="192.168.1.1"
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
                    </BoltGroup>

                    <Popover
                        closeOnClickOutside={false}
                        onChange={setAdditionalOpened}
                        opened={additionalOpened}
                        position="bottom"
                        shadow="md"
                        width={340}
                        withArrow
                    >
                        <Divider
                            label={
                                <Popover.Target>
                                    <UnstyledButton
                                        c="dimmed"
                                        onClick={() => setAdditionalOpened((opened) => !opened)}
                                        px={4}
                                        type="button"
                                    >
                                        <Group gap={6}>
                                            <TbSettings size={16} />
                                            <Text fw={500} size="sm">
                                                {t(
                                                    'create-node-step-1-connection.additional-options'
                                                )}
                                            </Text>
                                            <TbChevronDown
                                                size={14}
                                                style={{
                                                    transform: additionalOpened
                                                        ? 'rotate(180deg)'
                                                        : undefined,
                                                    transition: 'transform 200ms ease'
                                                }}
                                            />
                                        </Group>
                                    </UnstyledButton>
                                </Popover.Target>
                            }
                            labelPosition="center"
                        />

                        <Popover.Dropdown>
                            <Stack gap="sm">
                                <SelectInfraProviderShared
                                    selectedInfraProviderUuid={form.getValues().providerUuid}
                                    setSelectedInfraProviderUuid={(providerUuid) => {
                                        form.setValues({ providerUuid })
                                        form.setTouched({ providerUuid: true })
                                        form.setDirty({ providerUuid: true })
                                    }}
                                />

                                <Select
                                    key={form.key('activePluginUuid')}
                                    label={t('node-vitals.card.plugin')}
                                    {...form.getInputProps('activePluginUuid')}
                                    allowDeselect
                                    clearable
                                    data={(nodePlugins?.nodePlugins ?? []).map((nodePlugin) => ({
                                        label: nodePlugin.name,
                                        value: nodePlugin.uuid
                                    }))}
                                    description={t(
                                        'node-vitals.card.review-documentation-for-more-information'
                                    )}
                                    leftSection={<TbPackage size={16} />}
                                    nothingFoundMessage={t('node-vitals.card.nothing-found')}
                                    placeholder={t('node-vitals.card.select-plugin')}
                                    searchable
                                    size="sm"
                                    styles={{
                                        label: { fontWeight: 500 }
                                    }}
                                />

                                <TagsInput
                                    clearable
                                    data={nodesTags?.tags || []}
                                    key={form.key('tags')}
                                    label={t('common.field.tags')}
                                    leftSection={<PiTagDuotone size="16px" />}
                                    maxTags={10}
                                    placeholder={t('bolt.text.tags-placeholder')}
                                    size="sm"
                                    splitChars={[',', ' ', ';']}
                                    {...form.getInputProps('tags')}
                                    error={
                                        Object.keys(form.errors)
                                            .filter((key) => key.startsWith('tags.'))
                                            .map((key) => form.errors[key])
                                            .join(', ') || form.getInputProps('tags').error
                                    }
                                    renderPill={({ value, onRemove }) => (
                                        <TagInputPill onRemove={onRemove} value={value} />
                                    )}
                                    styles={{
                                        label: { fontWeight: 500 }
                                    }}
                                />
                            </Stack>
                        </Popover.Dropdown>
                    </Popover>
                </Stack>

                <Stack gap="xs" mt="auto">
                    <CopyDockerComposeWidget port={port} />

                    <Button fullWidth size="lg" type="submit" variant="filled">
                        {t('common.action.next')}
                    </Button>
                </Stack>
            </Stack>
        </form>
    )
}

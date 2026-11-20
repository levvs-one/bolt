import {
    ActionIcon,
    Box,
    Button,
    Code,
    Divider,
    Group,
    HoverCard,
    Stack,
    Text,
    TextInput
} from '@mantine/core'
import { useForm, schemaResolver } from '@mantine/form'
import { modals } from '@mantine/modals'
import {
    GetRemnawaveSettingsCommand,
    UpdateRemnawaveSettingsCommand
} from '@remnawave/backend-contract'
import { useTranslation } from 'react-i18next'
import { TbAlertCircle, TbHelpCircle, TbLink, TbStar } from 'react-icons/tb'

import { queryClient } from '@shared/api'
import { QueryKeys } from '@shared/api/hooks/keys-factory'
import { useUpdateRemnawaveSettings } from '@shared/api/hooks/remnawave-settings/remnawave-settings.mutation.hooks'
import { Logo } from '@shared/ui'
import { BoltField } from '@shared/ui/bolt-list'
import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'
import { SettingsCardShared } from '@shared/ui/settings-card'
import { handleFormErrors } from '@shared/utils/misc'

interface IProps {
    brandingSettings: NonNullable<
        GetRemnawaveSettingsCommand.Response['response']['brandingSettings']
    >
}

export const BrandingSettingsCardWidget = (props: IProps) => {
    const { brandingSettings } = props
    const { t } = useTranslation()

    const form = useForm<NonNullable<UpdateRemnawaveSettingsCommand.RequestBody>>({
        name: 'branding-settings',
        mode: 'uncontrolled',
        onValuesChange: (values) => {
            if (
                values.brandingSettings &&
                typeof values.brandingSettings.logoUrl === 'string' &&
                values.brandingSettings.logoUrl === ''
            ) {
                form.setFieldValue('brandingSettings.logoUrl', null)
            }
        },
        validate: schemaResolver(
            UpdateRemnawaveSettingsCommand.RequestBodySchema.pick({
                brandingSettings: true
            })
        ),
        initialValues: {
            brandingSettings
        }
    })

    const { mutate: updateSettings, isPending: isUpdatePending } = useUpdateRemnawaveSettings({
        mutationFns: {
            onSuccess() {
                queryClient.refetchQueries({
                    queryKey: QueryKeys.remnawaveSettings.getRemnawaveSettings.queryKey
                })
                queryClient.refetchQueries({
                    queryKey: QueryKeys.auth.getAuthStatus.queryKey
                })
            },
            onError(error) {
                handleFormErrors(form, error)

                modals.open({
                    title: (
                        <BaseOverlayHeader
                            iconColor="red"
                            IconComponent={TbAlertCircle}
                            iconVariant="soft"
                            title={t('auth-settings.error-modal.title')}
                        />
                    ),
                    centered: true,
                    children: (
                        <Stack gap="md">
                            <Text c="dimmed" size="sm">
                                {t('auth-settings.error-modal.description')}
                            </Text>
                            <Code p="md">
                                <Text c="red.1" fw={500} size="sm">
                                    {error instanceof Error
                                        ? error.message
                                        : t('auth-settings.error-modal.unknown-error')}
                                </Text>
                            </Code>
                            <Button
                                color="red"
                                fullWidth
                                onClick={() => modals.closeAll()}
                                variant="light"
                            >
                                {t('common.action.close')}
                            </Button>
                        </Stack>
                    )
                })
            }
        }
    })

    const handleSubmit = form.onSubmit((values) => {
        updateSettings({
            variables: {
                brandingSettings: values.brandingSettings
            }
        })
    })

    const brandingTitleHoverCard = () => {
        return (
            <HoverCard shadow="md" width={350} withArrow>
                <HoverCard.Target>
                    <ActionIcon size={36}>
                        <TbHelpCircle size={20} strokeWidth={1.75} />
                    </ActionIcon>
                </HoverCard.Target>
                <HoverCard.Dropdown>
                    <Stack gap="md">
                        <Stack gap="sm">
                            <Stack gap={4}>
                                <Text fw={600} size="sm">
                                    {t('branding-settings-card.widget.colored-title-format')}
                                </Text>
                                <Text c="dimmed" size="xs">
                                    {t('branding-settings-card.widget.colored-title-description')}
                                </Text>
                            </Stack>

                            <Divider />

                            <Stack gap={8}>
                                <Box>
                                    <Text c="dimmed" fw={500} mb={4} size="xs">
                                        {t('branding-settings-card.widget.example-hex-colors')}:
                                    </Text>
                                    <Code block c="blue" fz="xs">
                                        {'{#B8F2E6}Re{#FFA69E}mna{#AEC6CF}wave'}
                                    </Code>
                                </Box>

                                <Box>
                                    <Text c="dimmed" fw={500} mb={4} size="xs">
                                        {t('branding-settings-card.widget.example-mantine-colors')}:
                                    </Text>
                                    <Code block c="blue" fz="xs">
                                        {'{cyan}Remna{white}wave'}
                                    </Code>
                                </Box>

                                <Box>
                                    <Text c="dimmed" fw={500} mb={4} size="xs">
                                        {t('branding-settings-card.widget.example-mixed')}:
                                    </Text>
                                    <Code block c="blue" fz="xs">
                                        {'{#B8F2E6}Re{#FFA69E}mna{cyan}wave'}
                                    </Code>
                                </Box>
                            </Stack>

                            <Divider />

                            <Box>
                                <Text c="dimmed" size="xs">
                                    {t('branding-settings-card.widget.color-format-note')}
                                </Text>
                            </Box>
                        </Stack>
                    </Stack>
                </HoverCard.Dropdown>
            </HoverCard>
        )
    }

    return (
        <>
            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
                <SettingsCardShared.Container>
                    <SettingsCardShared.Header
                        description={t(
                            'branding-settings-card.widget.customize-your-remnawave-instance'
                        )}
                        icon={<Logo size={24} />}
                        iconColor="cyan"
                        iconVariant="soft"
                        title={t('branding-settings-card.widget.branding-settings')}
                    />

                    <SettingsCardShared.Content>
                        <div>
                            <BoltField
                                icon={TbStar}
                                label={t('branding-settings-card.widget.brand-name')}
                            >
                                <TextInput
                                    key={form.key('brandingSettings.title')}
                                    placeholder="Remnawave"
                                    rightSection={brandingTitleHoverCard()}
                                    {...form.getInputProps('brandingSettings.title')}
                                />
                            </BoltField>

                            <BoltField icon={TbLink} label={t('common.field.logo-url')}>
                                <TextInput
                                    key={form.key('brandingSettings.logoUrl')}
                                    placeholder="https://example.com/logo.png"
                                    {...form.getInputProps('brandingSettings.logoUrl')}
                                />
                            </BoltField>
                        </div>
                    </SettingsCardShared.Content>

                    <SettingsCardShared.Bottom>
                        <Group justify="flex-end">
                            <Button
                                color="teal"
                                loading={isUpdatePending}
                                size="md"
                                type="submit"
                                variant="soft"
                            >
                                {t('common.action.save')}
                            </Button>
                        </Group>
                    </SettingsCardShared.Bottom>
                </SettingsCardShared.Container>
            </form>
        </>
    )
}

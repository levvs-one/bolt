import { ShowConfigProfilesWithInboundsFeature } from '@features/ui/dashboard/nodes/show-config-profiles-with-inbounds'
import { Button, Skeleton, Stack } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { CreateNodeCommand } from '@remnawave/backend-contract'
import { useTranslation } from 'react-i18next'

import { useGetConfigProfiles } from '@shared/api/hooks'

import { CopyDockerComposeWidget } from './copy-docker-compose.widget'

interface IProps {
    // oxlint-disable-next-line
    form: UseFormReturnType<CreateNodeCommand.RequestBody, any>
    isCreating: boolean
    onCreateNode: () => void
    onPrev: () => void
    port: number
}

export const CreateNodeStep2ConfigProfiles = ({
    form,
    isCreating,
    onCreateNode,
    onPrev,
    port
}: IProps) => {
    const { t } = useTranslation()

    const { data: configProfiles, isLoading: isConfigProfilesLoading } = useGetConfigProfiles()

    const saveInbounds = (inbounds: string[], configProfileUuid: string) => {
        form.setValues({
            configProfile: {
                activeInbounds: inbounds,
                activeConfigProfileUuid: configProfileUuid
            }
        })
        form.setTouched({
            activeConfigProfileUuid: true,
            activeInbounds: true
        })
        form.setDirty({
            activeConfigProfileUuid: true,
            activeInbounds: true
        })
    }

    const handleCreateNode = () => {
        const configProfileErrors = form.validateField('configProfile')
        const activeConfigProfileUuidErrors = form.validateField(
            'configProfile.activeConfigProfileUuid'
        )
        const activeInboundsErrors = form.validateField('configProfile.activeInbounds')

        if (
            !configProfileErrors.hasError &&
            !activeConfigProfileUuidErrors.hasError &&
            !activeInboundsErrors.hasError
        ) {
            onCreateNode()
            return
        }

        notifications.show({ message: t('bolt.text.pick-profile') })
    }

    return (
        <Stack gap={12} mih={400}>
            {isConfigProfilesLoading && <Skeleton height={56} radius="md" />}

            {!isConfigProfilesLoading && configProfiles && (
                <ShowConfigProfilesWithInboundsFeature
                    activeConfigProfileInbounds={
                        form.getValues().configProfile?.activeInbounds ?? []
                    }
                    activeConfigProfileUuid={
                        form.getValues().configProfile?.activeConfigProfileUuid
                    }
                    configProfiles={configProfiles.configProfiles}
                    onSaveInbounds={saveInbounds}
                />
            )}

            <Stack gap="xs" mt="auto">
                <CopyDockerComposeWidget port={port} />

                <Button
                    fullWidth
                    loading={isCreating}
                    onClick={handleCreateNode}
                    size="lg"
                    type="submit"
                    variant="filled"
                >
                    {t('create-node-modal.widget.create-node')}
                </Button>
                <Button fullWidth onClick={onPrev} size="lg">
                    {t('create-node-modal.widget.back')}
                </Button>
            </Stack>
        </Stack>
    )
}

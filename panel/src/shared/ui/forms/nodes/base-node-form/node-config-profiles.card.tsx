import { ShowConfigProfilesWithInboundsFeature } from '@features/ui/dashboard/nodes/show-config-profiles-with-inbounds'
import { Skeleton, Stack } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { CreateNodeCommand, UpdateNodeCommand } from '@remnawave/backend-contract'
import { ForwardRefComponent, HTMLMotionProps, Variants } from 'motion/react'

import { useGetConfigProfiles } from '@shared/api/hooks'

interface IProps<T extends CreateNodeCommand.RequestBody | UpdateNodeCommand.RequestBody> {
    cardVariants: Variants
    form: UseFormReturnType<T>
    motionWrapper: ForwardRefComponent<HTMLDivElement, HTMLMotionProps<'div'>>
}

export const NodeConfigProfilesCard = <
    T extends CreateNodeCommand.RequestBody | UpdateNodeCommand.RequestBody
>(
    props: IProps<T>
) => {
    const { cardVariants, form, motionWrapper } = props

    const MotionWrapper = motionWrapper

    const { data: configProfiles, isLoading: isConfigProfilesLoading } = useGetConfigProfiles()

    const saveInbounds = (inbounds: string[], configProfileUuid: string) => {
        form.setFieldValue('configProfile', {
            activeInbounds: inbounds,
            activeConfigProfileUuid: configProfileUuid
        } as never)
    }

    return (
        <MotionWrapper variants={cardVariants}>
            {isConfigProfilesLoading && (
                <Stack gap="md">
                    <Skeleton height={56} radius="md" />
                </Stack>
            )}

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
        </MotionWrapper>
    )
}

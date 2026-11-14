import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TbAdjustmentsHorizontal } from 'react-icons/tb'

import { showModal } from '@shared/_modals/show-modal'
import { BoltGroup, BoltRow } from '@shared/ui/bolt-list'

import { IProps } from './interfaces'

export function ShowConfigProfilesWithInboundsFeature(props: IProps) {
    const { activeConfigProfileInbounds, activeConfigProfileUuid, configProfiles, onSaveInbounds } =
        props

    const { t } = useTranslation()

    const activeProfile = configProfiles.find((profile) => profile.uuid === activeConfigProfileUuid)

    const activeProfileInboundsPorts = useMemo(() => {
        const ports = activeConfigProfileInbounds
            ?.map((inbound) => {
                const inboundConfig = activeProfile?.inbounds.find((i) => i.uuid === inbound)
                return inboundConfig?.port ?? null
            })
            .filter((port) => port !== null)

        return [...new Set(ports)]
    }, [activeConfigProfileInbounds, activeProfile])

    const openDrawer = () =>
        showModal('nodes_nodesConfigProfilesDrawer', {
            activeConfigProfileInbounds: activeProfile ? activeConfigProfileInbounds : [],
            activeConfigProfileUuid: activeProfile ? activeConfigProfileUuid : undefined,
            onSaveInbounds
        })

    return (
        <BoltGroup>
            <BoltRow
                icon={TbAdjustmentsHorizontal}
                label={
                    activeProfile?.name ??
                    t('show-config-profiles-with-inbounds.feature.no-config-profile-selected')
                }
                onClick={openDrawer}
                value={activeProfileInboundsPorts.join(', ') || undefined}
            />
        </BoltGroup>
    )
}

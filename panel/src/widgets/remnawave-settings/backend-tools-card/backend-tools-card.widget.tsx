import { Loader } from '@mantine/core'
import { useOs } from '@mantine/hooks'
import { BULLBOARD_ROOT, ROOT, SCALAR_ROOT, SWAGGER_ROOT } from '@remnawave/backend-contract'
import { TFunction } from 'i18next'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbApi, TbBook2, TbServer, TbStack2 } from 'react-icons/tb'

import { getBackendDomain } from '@shared/api'
import { useIssueOtt } from '@shared/api/hooks/api-tokens/api-tokens.mutation.hooks'
import { BoltRow } from '@shared/ui/bolt-list'
import { SettingsCardShared } from '@shared/ui/settings-card'

interface BackendTool {
    icon: typeof TbApi
    key: string
    path: string
    title: string
}

const getBackendTools = (t: TFunction): BackendTool[] => [
    {
        key: 'queues',
        title: t('backend-tools-card.widget.queue-viewer'),
        icon: TbStack2,
        path: `${ROOT}${BULLBOARD_ROOT}`
    },
    {
        key: 'scalar',
        title: 'Scalar',
        icon: TbBook2,
        path: `${ROOT}${SCALAR_ROOT}`
    },
    {
        key: 'swagger',
        title: 'Swagger',
        icon: TbApi,
        path: `${ROOT}${SWAGGER_ROOT}`
    }
]

export const BackendToolsCardWidget = () => {
    const { t } = useTranslation()

    const os = useOs()

    const backendTools = getBackendTools(t)

    const { mutateAsync: issueOtt } = useIssueOtt()

    const [pendingTool, setPendingTool] = useState<null | string>(null)

    const handleLogin = async (tool: BackendTool) => {
        setPendingTool(tool.key)
        try {
            const { ott } = await issueOtt({})
            const url = `${getBackendDomain()}${tool.path}?ott=${encodeURIComponent(ott)}`

            if (os === 'ios') {
                window.location.assign(url)
            } else {
                window.open(url, '_blank', 'noopener,noreferrer')
            }
        } finally {
            setPendingTool(null)
        }
    }

    return (
        <SettingsCardShared.Container>
            <SettingsCardShared.Header
                description={t('backend-tools-card.widget.backend-tools-description')}
                icon={<TbServer size={24} />}
                iconColor="blue"
                iconVariant="soft"
                title={t('backend-tools-card.widget.backend-tools')}
            />

            <SettingsCardShared.Content>
                <div>
                    {backendTools.map((tool) => (
                        <BoltRow
                            icon={tool.icon}
                            key={tool.key}
                            label={tool.title}
                            onClick={() => handleLogin(tool)}
                            rightSection={pendingTool === tool.key && <Loader size="xs" />}
                        />
                    ))}
                </div>
            </SettingsCardShared.Content>
        </SettingsCardShared.Container>
    )
}

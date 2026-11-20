import { ActionIcon, Tooltip } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { TbRefresh } from 'react-icons/tb'

interface RefreshButtonProps {
    loading: boolean
    onClick: () => void
}

export function RefreshButton(props: RefreshButtonProps) {
    const { loading, onClick } = props
    const { t } = useTranslation()

    return (
        <Tooltip label={t('common.action.refresh')} withArrow>
            <ActionIcon loading={loading} onClick={onClick} size={32}>
                <TbRefresh size={18} strokeWidth={1.75} />
            </ActionIcon>
        </Tooltip>
    )
}

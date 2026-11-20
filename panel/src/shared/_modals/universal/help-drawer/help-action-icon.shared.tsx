import { ActionIcon, ActionIconProps, Tooltip } from '@mantine/core'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { IconBaseProps } from 'react-icons/lib'
import { TbHelpCircle } from 'react-icons/tb'

import { showModal } from '@shared/_modals/show-modal'

import { THelpDrawerAvailableScreen } from './help-drawer.types'

interface IProps {
    actionIconProps?: Omit<ActionIconProps, 'onClick'>
    hidden?: boolean
    iconProps?: IconBaseProps
    screen: THelpDrawerAvailableScreen
}

export const HelpActionIconShared = memo((props: IProps) => {
    const { actionIconProps, hidden, iconProps, screen } = props

    const { t } = useTranslation()

    if (hidden) {
        return null
    }

    const handleOpenHelpDrawer = () => {
        showModal('helpDrawer', {
            screen
        })
    }

    return (
        <Tooltip label={t('help-action-icon.shared.help-article')}>
            <ActionIcon
                aria-label={t('help-action-icon.shared.help-article')}
                onClick={handleOpenHelpDrawer}
                size={36}
                {...actionIconProps}
            >
                <TbHelpCircle size={20} strokeWidth={1.75} {...iconProps} />
            </ActionIcon>
        </Tooltip>
    )
})

import { ActionIcon, ActionIconProps } from '@mantine/core'
import clsx from 'clsx'
import { TbArrowsMaximize, TbArrowsMinimize } from 'react-icons/tb'

import styles from './Fullscreen.module.css'

interface IProps extends ActionIconProps {
    className?: string
    floating?: boolean
    iconSize?: number
    isFullscreen: boolean
    onToggle: () => void
}

export function FullscreenToggleButton(props: IProps) {
    const {
        className,
        floating = true,
        iconSize = 20,
        isFullscreen,
        onToggle,
        ...actionIconProps
    } = props

    return (
        <ActionIcon
            className={clsx(floating && styles.button, className)}
            onClick={onToggle}
            size={36}
            {...actionIconProps}
        >
            {isFullscreen ? (
                <TbArrowsMinimize size={iconSize} strokeWidth={1.75} />
            ) : (
                <TbArrowsMaximize size={iconSize} strokeWidth={1.75} />
            )}
        </ActionIcon>
    )
}

export { styles as fullscreenClasses }

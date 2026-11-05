import { ComponentType, ReactNode } from 'react'
import { TbChevronRight } from 'react-icons/tb'

import classes from './bolt-list.module.css'

const ICON_SIZE = 20
const ICON_STROKE = 1.75
const CHEVRON_SIZE = 16

interface IGroupProps {
    children: ReactNode
    className?: string
}

export function BoltGroup({ children, className }: IGroupProps) {
    return <div className={className ? `${classes.group} ${className}` : classes.group}>{children}</div>
}

interface IRowProps {
    icon?: ComponentType<{ className?: string; size?: number; strokeWidth?: number }>
    label: ReactNode
    onClick?: () => void
    rightSection?: ReactNode
    value?: ReactNode
}

// Строка группы: иконка, подпись, значение справа. Строка с onClick открывает экран — у неё шеврон.
export function BoltRow({ icon: Icon, label, onClick, rightSection, value }: IRowProps) {
    const content = (
        <>
            {Icon && <Icon className={classes.icon} size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
            <span className={classes.label}>{label}</span>
            {value !== undefined && <span className={classes.value}>{value}</span>}
            {rightSection}
            {onClick && <TbChevronRight className={classes.chevron} size={CHEVRON_SIZE} />}
        </>
    )

    if (!onClick) return <div className={classes.row}>{content}</div>

    return (
        <button className={classes.row} data-interactive onClick={onClick} type="button">
            {content}
        </button>
    )
}

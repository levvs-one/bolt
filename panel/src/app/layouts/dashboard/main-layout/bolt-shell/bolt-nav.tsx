import { Collapse } from '@mantine/core'
import { useState } from 'react'
import { TbChevronRight } from 'react-icons/tb'
import { Link } from 'react-router'

import { MenuItem } from '../menu-sections/interfaces'
import classes from './bolt-shell.module.css'
import { useActiveRoute } from './use-active-route'

const ICON_STROKE = 1.75

interface IGroupProps {
    group: MenuItem
    onNavigate?: () => void
}

function NavGroup({ group, onNavigate }: IGroupProps) {
    const isActive = useActiveRoute()
    const hasActiveChild = group.section.some((item) => isActive(item.href))
    const [isOpen, setIsOpen] = useState(hasActiveChild)
    const GroupIcon = group.icon

    if (group.section.length === 1) {
        const [item] = group.section
        const Icon = item.icon

        return (
            <Link
                className={classes.row}
                data-active={isActive(item.href) || undefined}
                onClick={onNavigate}
                to={item.href}
            >
                <Icon className={classes.rowIcon} strokeWidth={ICON_STROKE} />
                <span className={classes.rowLabel}>{group.header ?? item.name}</span>
            </Link>
        )
    }

    const expanded = isOpen || hasActiveChild

    return (
        <div className={classes.group}>
            <button
                aria-expanded={expanded}
                className={classes.row}
                onClick={() => setIsOpen(!expanded)}
                type="button"
            >
                {GroupIcon && <GroupIcon className={classes.rowIcon} strokeWidth={ICON_STROKE} />}
                <span className={classes.rowLabel}>{group.header}</span>
                <TbChevronRight
                    className={classes.chevron}
                    data-open={expanded || undefined}
                    size={14}
                />
            </button>
            <Collapse expanded={expanded} transitionDuration={180}>
                <div className={classes.children}>
                    {group.section.map((item) => {
                        const Icon = item.icon

                        return (
                            <Link
                                className={classes.row}
                                data-active={isActive(item.href) || undefined}
                                key={item.id}
                                onClick={onNavigate}
                                rel={item.newTab ? 'noopener noreferrer' : undefined}
                                target={item.newTab ? '_blank' : undefined}
                                to={item.href}
                            >
                                <Icon className={classes.rowIcon} strokeWidth={ICON_STROKE} />
                                <span className={classes.rowLabel}>{item.name}</span>
                            </Link>
                        )
                    })}
                </div>
            </Collapse>
        </div>
    )
}

interface IProps {
    groups: MenuItem[]
    onNavigate?: () => void
}

export function BoltNav({ groups, onNavigate }: IProps) {
    return (
        <nav className={classes.nav}>
            {groups.map((group) => (
                <NavGroup group={group} key={group.id} onNavigate={onNavigate} />
            ))}
        </nav>
    )
}

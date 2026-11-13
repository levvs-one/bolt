import classes from './entity-card.module.css'

interface EntityCardIconProps {
    children: React.ReactNode
}

export function EntityCardIcon({ children }: EntityCardIconProps) {
    return <div className={classes.icon}>{children}</div>
}

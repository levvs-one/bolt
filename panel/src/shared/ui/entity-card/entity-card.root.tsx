import { Card } from '@mantine/core'

import classes from './entity-card.module.css'

interface EntityCardProps {
    children: React.ReactNode
    onClick?: () => void
}

export function EntityCardRoot(props: EntityCardProps) {
    const { children, onClick } = props

    return (
        <Card
            className={classes.card}
            data-clickable={onClick ? true : undefined}
            data-layout="row"
            onClick={onClick}
            onKeyDown={
                onClick
                    ? (event) => {
                          if (event.key !== 'Enter' && event.key !== ' ') return
                          if (event.target !== event.currentTarget) return

                          event.preventDefault()
                          onClick()
                      }
                    : undefined
            }
            pb={4}
            pl={12}
            pr={8}
            pt={4}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {children}
        </Card>
    )
}

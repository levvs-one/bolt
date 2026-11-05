import { Box, BoxProps, Title } from '@mantine/core'
import { forwardRef, ReactNode } from 'react'

import classes from './page-header.module.css'

export interface PageHeaderSharedProps extends BoxProps {
    actions?: ReactNode
    customThemeIcon?: ReactNode
    description?: string
    icon?: ReactNode
    title: ReactNode
    withBorder?: boolean
    wrapActions?: boolean
}

// Шапка экрана Bolt: название слева, действия справа. Значок и подзаголовок не показываются.
export const PageHeaderShared = forwardRef<HTMLDivElement, PageHeaderSharedProps>(
    (
        {
            title,
            actions,
            wrapActions = false,
            icon: _icon,
            customThemeIcon: _customThemeIcon,
            description: _description,
            withBorder: _withBorder,
            ...props
        },
        ref
    ) => (
        <Box className={classes.header} mb={12} ref={ref} {...props}>
            <Title className={classes.title} order={1}>
                {title}
            </Title>
            {actions && (
                <Box className={classes.actions} data-wrap={wrapActions || undefined}>
                    {actions}
                </Box>
            )}
        </Box>
    )
)

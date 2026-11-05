import { ActionIconProps, Box, CardSection, CardSectionProps, Title } from '@mantine/core'
import { forwardRef, ReactNode } from 'react'

import classes from './table.module.css'

export interface CardTitleProps extends Omit<CardSectionProps, 'c' | 'fw' | 'size' | 'tt'> {
    actions?: ReactNode
    description?: string
    icon?: ReactNode
    iconProps?: ActionIconProps
    title: ReactNode
}

// Заголовок раздела Bolt: название и действия справа, без значка, пояснения и анимации.
export const CardTitle = forwardRef<HTMLDivElement, CardTitleProps>(
    (
        {
            title,
            style,
            actions,
            withBorder = false,
            description: _description,
            icon: _icon,
            iconProps: _iconProps,
            ...sectionProps
        },
        ref
    ) => {

        return (
            <CardSection
                className={classes.card}
                inheritPadding
                py={12}
                ref={ref}
                style={style}
                withBorder={withBorder}
                {...sectionProps}
            >
                <Box className={classes.headerWrapper}>
                    <Title className={classes.title} order={2}>
                        {title}
                    </Title>
                    {actions && <Box className={classes.actionsSection}>{actions}</Box>}
                </Box>
            </CardSection>
        )
    }
)

import { ThemeIconProps, Title } from '@mantine/core'
import { ReactNode } from 'react'

interface SettingsCardHeaderProps {
    description: ReactNode | string
    icon: ReactNode
    iconColor: ThemeIconProps['color']
    iconVariant: ThemeIconProps['variant']
    title: string
}

// Заголовок карточки настроек: только название, без значка, пояснения и линии.
export function SettingsCardHeader({ title }: SettingsCardHeaderProps) {
    return (
        <Title fw={700} fz={17} mb={8} order={3}>
            {title}
        </Title>
    )
}

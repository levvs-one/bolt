import { Group, ThemeIconProps, Title, TitleProps } from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { ReactNode } from 'react'

import { TOpenEntity } from '@shared/constants'
import { CopyEntityLinkButton } from '@shared/ui/copy-entity-link-button'

type IProps = {
    countryCode?: string
    hideIcon?: boolean
    icon?: ReactNode
    iconColor?: ThemeIconProps['color']
    IconComponent: React.ComponentType<{ size: number }>
    iconSize?: number
    iconVariant: ThemeIconProps['variant']
    openEntity?: { entity: TOpenEntity; id: number | string }
    subtitle?: ReactNode | string
    themeIconProps?: ThemeIconProps
    title: string
    titleOrder?: TitleProps['order']
    truncateTitle?: boolean
    withCopy?: boolean
}

// Заголовок окна или секции Bolt: только название. Значок, флаг и подзаголовок не показываются —
// пропсы для них остались от Remnawave, чтобы не трогать сотню вызовов.
export const BaseOverlayHeader = (props: IProps) => {
    const { openEntity, title, titleOrder = 4, withCopy = false, truncateTitle = false } = props

    const { copy } = useClipboard()

    return (
        <Group gap="sm" style={truncateTitle ? { minWidth: 0 } : undefined} wrap="nowrap">
            <Title
                onClick={() => withCopy && copy(title)}
                order={titleOrder}
                style={{
                    cursor: withCopy ? 'copy' : 'default',
                    ...(truncateTitle && {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    })
                }}
            >
                {title}
            </Title>

            {openEntity && <CopyEntityLinkButton entity={openEntity.entity} id={openEntity.id} />}
        </Group>
    )
}

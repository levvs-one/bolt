import { Text, TextProps } from '@mantine/core'
import { TUsersStatus } from '@remnawave/backend-contract'
import { useTranslation } from 'react-i18next'

interface IProps extends Omit<TextProps, 'children'> {
    status: TUsersStatus
}

// Статус — слово, без цвета и значка.
export function UserStatusBadge({ status, ...props }: IProps) {
    const { t } = useTranslation()

    return (
        <Text component="span" fw={700} fz="sm" {...props}>
            {t(`bolt.status.${status}`)}
        </Text>
    )
}

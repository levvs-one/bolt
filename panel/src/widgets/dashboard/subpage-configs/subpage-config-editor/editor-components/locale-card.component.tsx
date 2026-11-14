import { Group, Text, UnstyledButton } from '@mantine/core'
import { getLanguageInfo, TSubscriptionPageLanguageCode } from '@remnawave/subscription-page-types'
import { TbCheck } from 'react-icons/tb'

import styles from '../subpage-config-visual-editor.module.css'

const CHECK_SIZE = 18

interface IProps {
    code: TSubscriptionPageLanguageCode
    isActive: boolean
    isToggleDisabled?: boolean
    onToggle: () => void
}

export function LocaleCard(props: IProps) {
    const { code, isActive, isToggleDisabled, onToggle } = props

    const localeInfo = getLanguageInfo(code)

    if (!localeInfo) {
        return null
    }

    // Язык — строка: название, самоназвание мельче, у включённого — галочка справа.
    return (
        <UnstyledButton
            className={styles.localeCard}
            disabled={isToggleDisabled}
            onClick={onToggle}
        >
            <Group gap="sm" justify="space-between" wrap="nowrap">
                <div className={styles.localeNames}>
                    <Text fw={600} size="md" truncate>
                        {localeInfo.name}
                    </Text>
                    <Text fw={500} size="xs" truncate>
                        {localeInfo.nativeName}
                    </Text>
                </div>
                {isActive && <TbCheck size={CHECK_SIZE} strokeWidth={2} />}
            </Group>
        </UnstyledButton>
    )
}

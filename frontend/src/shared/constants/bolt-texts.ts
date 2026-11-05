import { TSubscriptionPageLanguageCode } from '@remnawave/subscription-page-types'

// Подписи интерфейса Bolt, которых нет в базовых переводах конфига страницы подписки.
const TEXTS = {
    en: {
        platform: 'Device',
        recommended: 'Recommended',
        step: 'Step {n}',
        support: 'Support',
        qr: 'QR code'
    },
    ru: {
        platform: 'Устройство',
        recommended: 'Рекомендуем',
        step: 'Шаг {n}',
        support: 'Поддержка',
        qr: 'QR-код'
    }
} as const

type TBoltTextKey = keyof (typeof TEXTS)['en']

export function boltText(
    key: TBoltTextKey,
    lang: TSubscriptionPageLanguageCode,
    values: Record<string, number | string> = {}
) {
    const dictionary = lang in TEXTS ? TEXTS[lang as keyof typeof TEXTS] : TEXTS.en
    return Object.entries(values).reduce(
        (text, [name, value]) => text.replace(`{${name}}`, String(value)),
        dictionary[key] as string
    )
}

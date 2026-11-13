import { TSubscriptionPageLanguageCode } from '@remnawave/subscription-page-types'

// Подписи интерфейса Bolt, которых нет в базовых переводах конфига страницы подписки.
const TEXTS = {
    en: {
        platform: 'Device',
        recommended: 'Recommended',
        support: 'Support',
        qr: 'QR code'
    },
    ru: {
        platform: 'Устройство',
        recommended: 'Рекомендуем',
        support: 'Поддержка',
        qr: 'QR-код'
    }
} as const

type TBoltTextKey = keyof (typeof TEXTS)['en']

export function boltText(key: TBoltTextKey, lang: TSubscriptionPageLanguageCode) {
    const dictionary = lang in TEXTS ? TEXTS[lang as keyof typeof TEXTS] : TEXTS.en
    return dictionary[key]
}

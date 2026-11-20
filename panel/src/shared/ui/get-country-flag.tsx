interface IProps {
    className?: string
    countryCode: null | string | undefined
}

const COUNTRY_CODE_STYLE = { fontSize: 13, fontWeight: 700 } as const

// Страна — двухбуквенный код, как в строках нод, а не флаг-эмодзи.
export function CountryFlag({ countryCode, className }: IProps) {
    if (!countryCode || countryCode === 'XX') return null
    return (
        <span className={className} style={COUNTRY_CODE_STYLE}>
            {countryCode.toUpperCase()}
        </span>
    )
}

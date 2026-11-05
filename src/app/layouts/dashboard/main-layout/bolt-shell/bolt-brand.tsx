import { Link } from 'react-router'

import { useGetAuthStatus } from '@shared/api/hooks/auth/auth.query.hooks'
import { ROUTES } from '@shared/constants'
import { Logo } from '@shared/ui'
import { parseColoredTextUtil } from '@shared/utils/misc'

import classes from './bolt-shell.module.css'

const DEFAULT_TITLE = 'Bolt'

export function BoltBrand() {
    const { data: authStatus } = useGetAuthStatus()
    const logoUrl = authStatus?.branding.logoUrl
    const brandingTitle = authStatus?.branding.title

    // Цветовая разметка заголовка из брендинга Remnawave в Bolt не нужна: оставляем только текст.
    const title = brandingTitle
        ? parseColoredTextUtil(brandingTitle)
              .map((part) => part.text)
              .join('')
        : DEFAULT_TITLE

    return (
        <Link className={classes.brand} to={ROUTES.DASHBOARD.HOME}>
            {logoUrl ? (
                <img alt="" className={classes.brandMark} src={logoUrl} />
            ) : (
                <Logo className={classes.brandMark} />
            )}
            <span className={classes.brandTitle}>{title}</span>
        </Link>
    )
}

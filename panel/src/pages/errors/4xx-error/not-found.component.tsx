import { Button } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { ROUTES } from '@shared/constants'
import { Logo } from '@shared/ui/logo'

import classes from './NotFound.module.css'

const LOGO_SIZE = 40

export function NotFoundPageComponent() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    return (
        <main className={classes.root}>
            <div className={classes.inner}>
                <Logo className={classes.logo} size={LOGO_SIZE} />
                <h1 className={classes.title}>{t('bolt.errors.not-found-title')}</h1>
                <p className={classes.description}>{t('bolt.errors.not-found-text')}</p>
                <Button
                    className={classes.action}
                    fullWidth
                    size="lg"
                    onClick={() => navigate(ROUTES.DASHBOARD.ROOT)}
                    variant="filled"
                >
                    {t('bolt.errors.go-home')}
                </Button>
            </div>
        </main>
    )
}

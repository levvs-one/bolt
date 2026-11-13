import { CodeHighlight } from '@mantine/code-highlight'
import { Button } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { ErrorBoundaryFallbackProps } from '@shared/hocs/error-boundary'
import { Logo } from '@shared/ui/logo'

import classes from './ServerError.module.css'

const LOGO_SIZE = 40

export function ErrorPageComponent({ componentStack, error }: Partial<ErrorBoundaryFallbackProps>) {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const details = [
        error instanceof Error ? (error.stack ?? '') : '',
        componentStack ? `Component stack:${componentStack}` : ''
    ]
        .filter(Boolean)
        .join('\n\n')

    return (
        <main className={classes.root}>
            <div className={classes.inner}>
                <Logo className={classes.logo} size={LOGO_SIZE} />
                <h1 className={classes.title}>{t('bolt.errors.crash-title')}</h1>
                <p className={classes.description}>{t('bolt.errors.crash-text')}</p>
                <Button
                    className={classes.action}
                    fullWidth
                    size="lg"
                    onClick={() => navigate(0)}
                    variant="filled"
                >
                    {t('bolt.errors.reload')}
                </Button>
                {details && (
                    <CodeHighlight
                        className={classes.details}
                        code={details}
                        collapseCodeLabel=""
                        defaultExpanded={false}
                        expandCodeLabel=""
                        radius="md"
                        withLineNumbers
                    />
                )}
            </div>
        </main>
    )
}

import { LoginFormFeature } from '@features/auth/login-form'
import { OAuth2LoginButtonsFeature } from '@features/auth/oauth2-login-button/oauth2-login-button.feature'
import { PasskeyLoginButtonFeature } from '@features/auth/passkey-login-button'
import { RegisterFormFeature } from '@features/auth/register-form'
import { Box, Center, Divider, Image, Stack, Text } from '@mantine/core'
import { GetStatusCommand } from '@remnawave/backend-contract'

import { useGetAuthStatus } from '@shared/api/hooks/auth/auth.query.hooks'
import { Logo, Page } from '@shared/ui'
import { parseColoredTextUtil } from '@shared/utils/misc'

import classes from './login.module.css'

const DEFAULT_TITLE = 'Bolt'

const getAuthMethods = (authStatus: GetStatusCommand.Response['response'] | undefined) => {
    const isPasswordEnabled = authStatus?.authentication?.password?.enabled ?? false
    const isPasskeyEnabled = authStatus?.authentication?.passkey?.enabled ?? false
    const isOAuth2Enabled =
        Object.values(authStatus?.authentication?.oauth2?.providers ?? {}).some(Boolean) ?? false

    return {
        isOAuth2Enabled,
        isPasskeyEnabled,
        isPasswordEnabled,
        hasAlternativeMethods: isPasskeyEnabled || isOAuth2Enabled,
        hasPrimaryMethods: isPasswordEnabled
    }
}

const BrandLogo = ({ logoUrl }: { logoUrl?: null | string }) => {
    if (!logoUrl) return <Logo className={classes.logo} />

    return <Image alt="" className={classes.logo} fit="contain" src={logoUrl} />
}

const AlternativeAuthMethods = ({
    authentication,
    isOAuth2Enabled,
    isPasskeyEnabled,
    isPasswordEnabled
}: {
    authentication: GetStatusCommand.Response['response']['authentication']
    isOAuth2Enabled: boolean
    isPasskeyEnabled: boolean
    isPasswordEnabled: boolean
}) => (
    <Center>
        <Stack gap="md" maw={isPasswordEnabled ? 300 : 150} w="100%">
            {isPasskeyEnabled && authentication && (
                <PasskeyLoginButtonFeature authentication={authentication} />
            )}
            {isOAuth2Enabled && authentication && (
                <OAuth2LoginButtonsFeature authentication={authentication} />
            )}
        </Stack>
    </Center>
)

export const LoginPage = () => {
    const { data: authStatus } = useGetAuthStatus()

    // Цветовая разметка заголовка из брендинга в Bolt не нужна: только текст.
    const title = authStatus?.branding.title
        ? parseColoredTextUtil(authStatus.branding.title)
              .map((part) => part.text)
              .join('')
        : DEFAULT_TITLE

    const isRegister = !authStatus?.isLoginAllowed && authStatus?.isRegisterAllowed
    const authMethods = getAuthMethods(authStatus)

    return (
        <Page title="Login">
            <Stack align="center" gap="xs">
                <div className={classes.brand}>
                    <BrandLogo logoUrl={authStatus?.branding.logoUrl} />
                    <span className={classes.title}>{title}</span>
                </div>

                {!authStatus && <Text fw={600}>Server is not responding. Check logs.</Text>}

                {!isRegister && authStatus && authStatus.authentication && (
                    <Box className={classes.form}>
                        <Stack gap="lg">
                            {authMethods.isPasswordEnabled && <LoginFormFeature />}

                            {authMethods.hasPrimaryMethods && authMethods.hasAlternativeMethods && (
                                <Center>
                                    <Divider
                                        label="OR"
                                        labelPosition="center"
                                        maw="400px"
                                        w="100%"
                                    />
                                </Center>
                            )}

                            {authMethods.hasAlternativeMethods && (
                                <AlternativeAuthMethods
                                    authentication={authStatus.authentication}
                                    isOAuth2Enabled={authMethods.isOAuth2Enabled}
                                    isPasskeyEnabled={authMethods.isPasskeyEnabled}
                                    isPasswordEnabled={authMethods.isPasswordEnabled}
                                />
                            )}
                        </Stack>
                    </Box>
                )}

                {isRegister && (
                    <Box className={classes.form}>
                        <RegisterFormFeature />
                    </Box>
                )}
            </Stack>
        </Page>
    )
}

export default LoginPage

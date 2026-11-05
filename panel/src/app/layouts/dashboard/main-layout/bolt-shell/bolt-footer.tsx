import { Menu, useComputedColorScheme, useDirection, useMantineColorScheme } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { TbLanguage, TbLogout, TbMoon, TbSearch, TbSun } from 'react-icons/tb'
import { useNavigate } from 'react-router'

import { clearQueryClient } from '@shared/api'
import { ROUTES } from '@shared/constants'
import { logoutEvents } from '@shared/emitters'
import { resetAllStores } from '@shared/hocs/store-wrapper'
import { useAuth } from '@shared/hooks'

import { removeToken } from '@entities/auth'

import classes from './bolt-shell.module.css'
import { openCommandPalette } from './command-palette'

const ICON_STROKE = 1.75
const RTL_LANGUAGE = 'fa'

const LANGUAGES = [
    { label: 'Русский', value: 'ru' },
    { label: 'English', value: 'en' },
    { label: 'فارسی', value: 'fa' },
    { label: '简体中文', value: 'zh' }
]

export function useLogout() {
    const { setIsAuthenticated } = useAuth()
    const navigate = useNavigate()

    return () => {
        logoutEvents.emit()
        setIsAuthenticated(false)
        removeToken()
        resetAllStores()
        clearQueryClient()
        navigate(ROUTES.AUTH.LOGIN)
    }
}

export function SearchRow() {
    const { t } = useTranslation()

    return (
        <button className={classes.row} onClick={openCommandPalette} type="button">
            <TbSearch className={classes.rowIcon} strokeWidth={ICON_STROKE} />
            <span className={classes.rowLabel}>{t('bolt.shell.search')}</span>
            <span className={classes.rowMeta}>Ctrl K</span>
        </button>
    )
}

export function ThemeRow() {
    const { t } = useTranslation()
    const { setColorScheme } = useMantineColorScheme()
    const scheme = useComputedColorScheme('dark')
    const isDark = scheme === 'dark'
    const Icon = isDark ? TbMoon : TbSun

    return (
        <button
            className={classes.row}
            onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
            type="button"
        >
            <Icon className={classes.rowIcon} strokeWidth={ICON_STROKE} />
            <span className={classes.rowLabel}>{t('bolt.shell.theme')}</span>
            <span className={classes.rowMeta}>
                {isDark ? t('bolt.shell.theme-dark') : t('bolt.shell.theme-light')}
            </span>
        </button>
    )
}

export function LanguageRow() {
    const { t, i18n } = useTranslation()
    const { dir, setDirection } = useDirection()
    const current = LANGUAGES.find((language) => i18n.language.startsWith(language.value))

    const changeLanguage = (value: string) => {
        i18n.changeLanguage(value)
        const nextDirection = value === RTL_LANGUAGE ? 'rtl' : 'ltr'
        if (dir !== nextDirection) setDirection(nextDirection)
    }

    return (
        <Menu position="right-end" width={180}>
            <Menu.Target>
                <button className={classes.row} type="button">
                    <TbLanguage className={classes.rowIcon} strokeWidth={ICON_STROKE} />
                    <span className={classes.rowLabel}>{t('bolt.shell.language')}</span>
                    <span className={classes.rowMeta}>{current?.label}</span>
                </button>
            </Menu.Target>
            <Menu.Dropdown>
                {LANGUAGES.map((language) => (
                    <Menu.Item key={language.value} onClick={() => changeLanguage(language.value)}>
                        {language.label}
                    </Menu.Item>
                ))}
            </Menu.Dropdown>
        </Menu>
    )
}

export function LogoutRow() {
    const { t } = useTranslation()
    const logout = useLogout()

    return (
        <button className={classes.row} onClick={logout} type="button">
            <TbLogout className={classes.rowIcon} strokeWidth={ICON_STROKE} />
            <span className={classes.rowLabel}>{t('bolt.shell.logout')}</span>
        </button>
    )
}

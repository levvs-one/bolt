import { ActionIcon, Drawer } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { TbDots, TbHome, TbListDetails, TbSearch, TbServer, TbUsers } from 'react-icons/tb'
import { Link, Outlet, ScrollRestoration } from 'react-router'

import { ROUTES } from '@shared/constants'
import { useIsMobile } from '@shared/hooks'

import { useDesktopMenuSections } from '../menu-sections/desktop-menu-sections'
import { BoltBrand } from './bolt-brand'
import { LanguageRow, LogoutRow, SearchRow, ThemeRow } from './bolt-footer'
import { BoltNav } from './bolt-nav'
import classes from './bolt-shell.module.css'
import { CommandPalette, openCommandPalette } from './command-palette'
import { useActiveRoute } from './use-active-route'

const SIDEBAR_WIDTH = 248
const TAB_ICON_SIZE = 24

function MobileTabs({ onMore }: { onMore: () => void }) {
    const { t } = useTranslation()
    const isActive = useActiveRoute()

    const tabs = [
        { href: ROUTES.DASHBOARD.HOME, label: t('constants.home'), Icon: TbHome },
        { href: ROUTES.DASHBOARD.MANAGEMENT.USERS, label: t('bolt.shell.clients'), Icon: TbUsers },
        { href: ROUTES.DASHBOARD.MANAGEMENT.NODES, label: t('constants.nodes'), Icon: TbServer },
        {
            href: ROUTES.DASHBOARD.MANAGEMENT.HOSTS,
            label: t('constants.hosts'),
            Icon: TbListDetails
        }
    ]

    return (
        <nav className={classes.tabBar}>
            {tabs.map(({ href, label, Icon }) => {
                const active = isActive(href)

                return (
                    <Link className={classes.tab} data-active={active || undefined} key={href} to={href}>
                        <Icon size={TAB_ICON_SIZE} strokeWidth={active ? 2.25 : 1.75} />
                        {label}
                    </Link>
                )
            })}
            <button className={classes.tab} onClick={onMore} type="button">
                <TbDots size={TAB_ICON_SIZE} strokeWidth={1.75} />
                {t('bolt.shell.more')}
            </button>
        </nav>
    )
}

export function BoltShell() {
    const { t } = useTranslation()
    const isMobile = useIsMobile()
    const groups = useDesktopMenuSections()
    const [isMoreOpen, more] = useDisclosure(false)

    if (isMobile) {
        return (
            <div className={classes.shell}>
                <header className={classes.mobileHeader}>
                    <BoltBrand />
                    <ActionIcon
                        aria-label={t('bolt.shell.search')}
                        onClick={openCommandPalette}
                        size={44}
                        variant="subtle"
                    >
                        <TbSearch size={22} strokeWidth={1.75} />
                    </ActionIcon>
                </header>
                <main className={classes.mobileMain}>
                    <Outlet />
                    <ScrollRestoration />
                </main>
                <MobileTabs onMore={more.open} />
                <Drawer
                    onClose={more.close}
                    opened={isMoreOpen}
                    position="bottom"
                    size="90%"
                    title={t('bolt.shell.more')}
                >
                    <div className={classes.sheetGroup}>
                        <BoltNav groups={groups} onNavigate={more.close} />
                    </div>
                    <div className={classes.sheetGroup}>
                        <ThemeRow />
                        <LanguageRow />
                        <LogoutRow />
                    </div>
                </Drawer>
                <CommandPalette groups={groups} />
            </div>
        )
    }

    return (
        <div
            className={classes.shell}
            style={{ '--bolt-sidebar-width': `${SIDEBAR_WIDTH}px` } as CSSProperties}
        >
            <aside className={classes.sidebar}>
                <BoltBrand />
                <SearchRow />
                <BoltNav groups={groups} />
                <div className={classes.footer}>
                    <ThemeRow />
                    <LanguageRow />
                    <LogoutRow />
                </div>
            </aside>
            <main className={classes.main}>
                <Outlet />
                <ScrollRestoration />
            </main>
            <CommandPalette groups={groups} />
        </div>
    )
}

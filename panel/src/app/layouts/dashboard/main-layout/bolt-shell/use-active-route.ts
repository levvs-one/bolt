import { useLocation } from 'react-router'

export function isRouteActive(pathname: string, href: string) {
    return pathname === href || pathname.startsWith(`${href}/`)
}

export function useActiveRoute() {
    const { pathname } = useLocation()

    return (href: string) => isRouteActive(pathname, href)
}

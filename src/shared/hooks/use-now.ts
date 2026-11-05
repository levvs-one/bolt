import { useEffect, useState } from 'react'

const DEFAULT_TICK_MS = 30_000

// Текущее время для отрисовки: обновляется по таймеру, чтобы компонент оставался чистым.
export function useNow(tickMs = DEFAULT_TICK_MS) {
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), tickMs)
        return () => window.clearInterval(timer)
    }, [tickMs])

    return now
}

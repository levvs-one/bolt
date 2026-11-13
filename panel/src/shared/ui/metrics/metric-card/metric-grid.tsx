import { Children, ReactNode } from 'react'

import classes from './metric-card.module.css'

const TRIPLE = 3
const PAIR = 2

// Метрики экрана — одна группа. Ячейки встают по две в ряд, а если их кратно трём — по три,
// чтобы в последнем ряду не оставалась одна.
export function MetricGridShared({ children }: { children: ReactNode }) {
    const count = Children.count(children)

    return (
        <div className={classes.grid} data-columns={count % TRIPLE === 0 ? TRIPLE : PAIR}>
            {children}
        </div>
    )
}

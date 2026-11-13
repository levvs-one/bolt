import { CheckboxCard, RadioCard } from '@mantine/core'

import classes from './choice-cards.module.css'

// Карточка-выбор — это строка группы, а не отдельная рамка внутри неё.
export default {
    CheckboxCard: CheckboxCard.extend({ classNames: classes }),
    RadioCard: RadioCard.extend({ classNames: classes })
}

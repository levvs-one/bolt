// oxlint-disable
import { Breadcrumbs } from '@mantine/core'
import { TbChevronRight as BreadcrumbsSeparator } from 'react-icons/tb'

export default {
    Breadcrumbs: Breadcrumbs.extend({
        defaultProps: {
            separator: <BreadcrumbsSeparator size={14} strokeWidth={2} />
        }
    })
}

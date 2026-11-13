import { Combobox, Menu } from '@mantine/core'

import classes from './menu.module.css'

export default {
    Menu: Menu.extend({
        classNames: { itemSection: classes.itemSection },
        defaultProps: {
            withArrow: false,
            radius: 'md',
            transitionProps: {
                transition: 'fade',
                duration: 150,
                timingFunction: 'ease-out'
            },
            styles: {
                dropdown: {
                    backgroundColor: 'var(--bolt-surface-raised)',
                    border: '1px solid var(--bolt-line)',
                    padding: 4
                },
                item: {
                    fontWeight: 500,
                    minHeight: 36
                },
                label: {
                    color: 'var(--bolt-text)',
                    fontWeight: 700
                },
                divider: {
                    borderColor: 'var(--bolt-line)',
                    margin: '4px 0'
                }
            }
        }
    }),
    Combobox: Combobox.extend({
        defaultProps: {
            transitionProps: { transition: 'fade', duration: 150 }
        }
    })
}

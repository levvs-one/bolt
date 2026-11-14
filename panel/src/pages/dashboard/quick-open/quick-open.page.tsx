import { ActionIcon, TextInput } from '@mantine/core'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbChevronRight } from 'react-icons/tb'
import { useNavigate } from 'react-router'

import { OPEN_ENTITY_TARGETS } from '@shared/_modals/open-entity-targets'
import { ROUTES, TOpenEntity } from '@shared/constants'
import { CopyEntityLinkButton, Page, PageHeaderShared } from '@shared/ui'
import { BoltField, BoltGroup } from '@shared/ui/bolt-list'

import classes from './quick-open.module.css'

const CHEVRON_SIZE = 16

export function QuickOpenPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const [ids, setIds] = useState<Record<string, string>>({})

    const entities = Object.entries(OPEN_ENTITY_TARGETS) as [
        TOpenEntity,
        (typeof OPEN_ENTITY_TARGETS)[string]
    ][]

    return (
        <Page title={t('constants.quick-open')}>
            <PageHeaderShared title={t('constants.quick-open')} />

            <BoltGroup>
                {entities.map(([entity, target]) => {
                    const id = ids[entity] ?? ''
                    const isValid = target.validate(id)

                    const open = () => {
                        if (!isValid) return

                        navigate(
                            ROUTES.DASHBOARD.OPEN_ENTITY.replace(':entity', entity).replace(
                                ':id',
                                id
                            )
                        )
                    }

                    return (
                        <BoltField icon={target.Icon} key={entity} label={t(target.titleKey)}>
                            <span className={classes.control}>
                                <TextInput
                                    className={classes.input}
                                    error={Boolean(id) && !isValid}
                                    onChange={(event) => {
                                        const value = event.currentTarget.value.trim()

                                        setIds((prev) => ({ ...prev, [entity]: value }))
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') open()
                                    }}
                                    placeholder={target.idPlaceholder}
                                    value={id}
                                />
                                <CopyEntityLinkButton disabled={!isValid} entity={entity} id={id} />
                                <ActionIcon
                                    aria-label={t('constants.quick-open')}
                                    disabled={!isValid}
                                    onClick={open}
                                    size="md"
                                    variant="subtle"
                                >
                                    <TbChevronRight size={CHEVRON_SIZE} />
                                </ActionIcon>
                            </span>
                        </BoltField>
                    )
                })}
            </BoltGroup>
        </Page>
    )
}

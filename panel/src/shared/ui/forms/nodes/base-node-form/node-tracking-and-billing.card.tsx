import { Button, Collapse, NumberInput, Stack, Switch, TagsInput, Textarea } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { CreateNodeCommand, UpdateNodeCommand } from '@remnawave/backend-contract'
import { ForwardRefComponent, HTMLMotionProps, Variants } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbBell, TbCalendar, TbChartArcs, TbChartLine } from 'react-icons/tb'

import { useGetNodesTags } from '@shared/api/hooks'
import { BoltField, BoltGroup } from '@shared/ui/bolt-list'
import { TrafficLimitInput } from '@shared/ui/forms/traffic-limit-input'
import { SelectInfraProviderShared } from '@shared/ui/infra-billing/select-infra-provider/select-infra-provider.shared'
import { TagInputPill } from '@shared/ui/tag-input-pill'

import classes from './node-tracking-and-billing.card.module.css'

const URL_REGEX = /https?:\/\/[^\s]+/i

function extractFirstUrl(text: string): null | string {
    const match = text.match(URL_REGEX)
    return match ? match[0] : null
}

interface IProps<T extends CreateNodeCommand.RequestBody | UpdateNodeCommand.RequestBody> {
    cardVariants: Variants
    form: UseFormReturnType<T>
    motionWrapper: ForwardRefComponent<HTMLDivElement, HTMLMotionProps<'div'>>
}

export const NodeTrackingAndBillingCard = <
    T extends CreateNodeCommand.RequestBody | UpdateNodeCommand.RequestBody
>(
    props: IProps<T>
) => {
    const { t } = useTranslation()
    const { data: nodesTags } = useGetNodesTags()
    const { cardVariants, form, motionWrapper } = props

    const [advancedOpened, setAdvancedOpened] = useState<boolean>(false)
    const [firstNoteUrl, setFirstNoteUrl] = useState<null | string>(null)

    form.watch('isTrafficTrackingActive', ({ value }) => {
        setAdvancedOpened(value ?? false)
    })

    form.watch('note', ({ value }) => {
        setFirstNoteUrl(extractFirstUrl(typeof value === 'string' ? value : ''))
    })

    const MotionWrapper = motionWrapper

    return (
        <MotionWrapper variants={cardVariants}>
            <Stack gap={12}>
                <BoltGroup>
                    <BoltField icon={TbChartLine} label={t('base-node-form.traffic-tracking')}>
                        <span className={classes.switch}>
                            <Switch
                                key={form.key('isTrafficTrackingActive')}
                                {...form.getInputProps('isTrafficTrackingActive', {
                                    type: 'checkbox'
                                })}
                                onChange={(event) => {
                                    form.getInputProps('isTrafficTrackingActive').onChange(event)
                                    setAdvancedOpened(event.currentTarget.checked)
                                }}
                            />
                        </span>
                    </BoltField>
                    <Collapse expanded={advancedOpened}>
                        <BoltField icon={TbChartArcs} label={t('base-node-form.limit')}>
                            <TrafficLimitInput
                                hideControls
                                key={form.key('trafficLimitBytes')}
                                {...form.getInputProps('trafficLimitBytes')}
                            />
                        </BoltField>
                        <BoltField icon={TbCalendar} label={t('base-node-form.reset-day')}>
                            <NumberInput
                                key={form.key('trafficResetDay')}
                                {...form.getInputProps('trafficResetDay')}
                                allowDecimal={false}
                                allowNegative={false}
                                clampBehavior="strict"
                                decimalScale={0}
                                hideControls
                                max={31}
                                min={1}
                                placeholder={t('base-node-form.e-g-1-31')}
                            />
                        </BoltField>
                        <BoltField icon={TbBell} label={t('base-node-form.notify-percent')}>
                            <NumberInput
                                key={form.key('notifyPercent')}
                                {...form.getInputProps('notifyPercent')}
                                allowDecimal={false}
                                allowNegative={false}
                                clampBehavior="strict"
                                decimalScale={0}
                                hideControls
                                max={100}
                                placeholder={t('base-node-form.e-g-50')}
                            />
                        </BoltField>
                    </Collapse>
                </BoltGroup>

                <BoltGroup className={classes.form}>
                    <SelectInfraProviderShared
                        selectedInfraProviderUuid={form.getValues().providerUuid}
                        setSelectedInfraProviderUuid={(providerUuid) => {
                            form.setFieldValue('providerUuid', providerUuid as never)
                        }}
                    />

                    <TagsInput
                        clearable
                        data={nodesTags?.tags || []}
                        key={form.key('tags')}
                        label={t('common.field.tags')}
                        maxTags={10}
                        placeholder={t('bolt.text.tags-placeholder')}
                        splitChars={[',', ' ', ';']}
                        {...form.getInputProps('tags')}
                        error={
                            Object.keys(form.errors)
                                .filter((key) => key.startsWith('tags.'))
                                .map((key) => form.errors[key])
                                .join(', ') || form.getInputProps('tags').error
                        }
                        renderPill={({ value, onRemove }) => (
                            <TagInputPill onRemove={onRemove} value={value} />
                        )}
                    />

                    <Stack gap={6}>
                        <Textarea
                            key={form.key('note')}
                            label={t('node-tracking-and-billing.card.note')}
                            resize="vertical"
                            {...form.getInputProps('note')}
                        />
                        {firstNoteUrl && (
                            <Button
                                component="a"
                                href={firstNoteUrl}
                                maw="100%"
                                rel="noopener noreferrer"
                                size="xs"
                                target="_blank"
                                variant="soft"
                                w="fit-content"
                            >
                                {t('common.action.open')}
                            </Button>
                        )}
                    </Stack>
                </BoltGroup>
            </Stack>
        </MotionWrapper>
    )
}

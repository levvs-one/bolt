import { NumberInput, Stack, Switch, TextInput } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { TbAntenna, TbKey } from 'react-icons/tb'
import { z } from 'zod'

import { instance } from '@shared/api/axios'
import { queryClient } from '@shared/api/query-client'
import { BoltGroup, BoltRow } from '@shared/ui/bolt-list'
import { compactBytesUtil } from '@shared/utils/bytes'

// Эндпоинт модуля Bolt; в npm-контракте Remnawave его нет.
const userSumiUrl = (userId: number) => `/api/bolt/sumi/users/${userId}`
const GIB = 1024 ** 3

const UserSumiSchema = z.object({
    enabled: z.boolean(),
    meteredLimitBytes: z.number(),
    meteredUsedBytes: z.number(),
    meteredBlocked: z.boolean(),
    personal: z.boolean(),
    title: z.string(),
    announce: z.string(),
    notice: z.string(),
    proxyExtra: z.number()
})

type TUserSumi = z.infer<typeof UserSumiSchema>

interface IProps {
    userId: number
}

/** Ключи SUMI и квота «Мобильной связи»: обычные страны безлимитные, считается только она. */
export function UserSumiGroup({ userId }: IProps) {
    const { t } = useTranslation()
    const queryKey = ['bolt', 'sumi', 'user', userId]
    const { data: sumi } = useQuery({
        queryKey,
        queryFn: async () =>
            UserSumiSchema.parse((await instance.get(userSumiUrl(userId))).data.response)
    })

    if (!sumi) return null

    const update = async (patch: Partial<TUserSumi>) => {
        const response = await instance.patch(userSumiUrl(userId), patch)
        queryClient.setQueryData(queryKey, UserSumiSchema.parse(response.data.response))
    }

    if (!sumi.enabled) {
        return (
            <BoltGroup>
                <BoltRow
                    icon={TbKey}
                    label={t('bolt.sumi.user-enable')}
                    rightSection={
                        <Switch
                            checked={false}
                            color="gray"
                            onChange={() => update({ enabled: true })}
                        />
                    }
                />
            </BoltGroup>
        )
    }

    const textField = (field: 'announce' | 'notice' | 'title', label: string, max: number) => (
        <TextInput
            defaultValue={sumi[field]}
            key={`${field}-${sumi[field]}`}
            label={label}
            maxLength={max}
            onBlur={(event) => {
                if (event.currentTarget.value !== sumi[field]) {
                    update({ [field]: event.currentTarget.value })
                }
            }}
        />
    )

    return (
        <>
            <BoltGroup>
                <BoltRow
                    icon={TbAntenna}
                    label={t('bolt.sumi.user-metered')}
                    value={t('bolt.sumi.user-metered-value', {
                        used: compactBytesUtil(sumi.meteredUsedBytes),
                        limit: compactBytesUtil(sumi.meteredLimitBytes)
                    })}
                />
                <BoltRow
                    label={t('bolt.sumi.user-metered-blocked')}
                    rightSection={
                        <Switch
                            checked={sumi.meteredBlocked}
                            color="gray"
                            onChange={(event) =>
                                update({ meteredBlocked: event.currentTarget.checked })
                            }
                        />
                    }
                />
                <BoltRow
                    label={t('bolt.sumi.user-personal')}
                    rightSection={
                        <Switch
                            checked={sumi.personal}
                            color="gray"
                            onChange={(event) => update({ personal: event.currentTarget.checked })}
                        />
                    }
                />
            </BoltGroup>

            <BoltGroup>
                <Stack gap={12} px={12} py={12}>
                    <NumberInput
                        allowDecimal={false}
                        defaultValue={Math.round(sumi.meteredLimitBytes / GIB)}
                        hideControls
                        key={`limit-${sumi.meteredLimitBytes}`}
                        label={t('bolt.sumi.user-metered-limit')}
                        min={0}
                        onBlur={(event) => {
                            const bytes = Number(event.currentTarget.value.replace(/\D/g, '')) * GIB
                            if (bytes !== sumi.meteredLimitBytes)
                                update({ meteredLimitBytes: bytes })
                        }}
                    />
                    {textField('title', t('bolt.sumi.user-title'), 32)}
                    {textField('announce', t('bolt.sumi.user-announce'), 120)}
                    {textField('notice', t('bolt.sumi.user-notice'), 64)}
                </Stack>
            </BoltGroup>
        </>
    )
}

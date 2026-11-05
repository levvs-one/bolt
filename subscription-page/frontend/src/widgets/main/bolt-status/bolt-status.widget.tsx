import { Progress } from '@mantine/core'
import dayjs from 'dayjs'

import { useSubscription } from '@entities/subscription-info-store'
import { formatDate } from '@shared/utils/config-parser'
import { useTranslation } from '@shared/hooks'

import classes from './bolt-status.module.css'

const PERCENT = 100
const UNLIMITED_EXPIRE_YEAR = 2099

export const BoltStatusWidget = () => {
    const { t, currentLang, baseTranslations } = useTranslation()
    const { user } = useSubscription()

    const isActive = user.userStatus === 'ACTIVE'
    const isUnlimitedTime = dayjs(user.expiresAt).year() === UNLIMITED_EXPIRE_YEAR
    const limitBytes = Number(user.trafficLimitBytes)
    const usedBytes = Number(user.trafficUsedBytes)
    const isUnlimitedTraffic = limitBytes === 0
    const percentage = isUnlimitedTraffic ? 0 : Math.min(PERCENT, (usedBytes * PERCENT) / limitBytes)

    return (
        <div className={classes.group}>
            <div className={classes.top}>
                <span className={classes.name}>{user.username}</span>
                <span className={classes.status}>
                    {isActive ? t(baseTranslations.active) : t(baseTranslations.inactive)}
                </span>
            </div>

            <div className={classes.key}>
                {isUnlimitedTime ? (
                    <span className={classes.keyValue}>{t(baseTranslations.indefinitely)}</span>
                ) : (
                    <>
                        <span className={classes.keyValue}>
                            {dayjs(user.expiresAt).locale(currentLang).fromNow(true)}
                        </span>
                        <span className={classes.keyLabel}>
                            {formatDate(user.expiresAt, currentLang, baseTranslations)}
                        </span>
                    </>
                )}
            </div>

            <div className={classes.row}>
                <span className={classes.rowLabel}>{t(baseTranslations.bandwidth)}</span>
                <span className={classes.rowValue}>
                    {user.trafficUsed} / {isUnlimitedTraffic ? '∞' : user.trafficLimit}
                </span>
            </div>
            {!isUnlimitedTraffic && (
                <Progress
                    classNames={{ root: classes.bar, section: classes.barFill }}
                    size={4}
                    value={percentage}
                />
            )}
        </div>
    )
}

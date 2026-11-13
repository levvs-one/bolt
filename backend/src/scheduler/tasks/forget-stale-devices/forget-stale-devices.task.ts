import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { SumiSettingsService } from '@modules/sumi/sumi-settings.service';

import { JOBS_INTERVALS } from '../../intervals';

const DAY_MS = 86_400_000;

/**
 * Устройство, которое давно не приходило за подпиской, освобождает место:
 * иначе проданный год назад телефон вечно занимал бы лимит.
 */
@Injectable()
export class ForgetStaleDevicesTask {
    private static readonly CRON_NAME = 'forgetStaleDevices';
    private readonly logger = new Logger(ForgetStaleDevicesTask.name);

    constructor(
        private readonly prisma: TransactionHost<TransactionalAdapterPrisma>,
        private readonly sumiSettings: SumiSettingsService,
    ) {}

    @Cron(JOBS_INTERVALS.FORGET_STALE_DEVICES, {
        name: ForgetStaleDevicesTask.CRON_NAME,
        waitForCompletion: true,
    })
    async handleCron() {
        try {
            const { deviceForgetDays } = await this.sumiSettings.get();
            const { count } = await this.prisma.tx.hwidUserDevices.deleteMany({
                where: { updatedAt: { lt: new Date(Date.now() - deviceForgetDays * DAY_MS) } },
            });

            if (count > 0) {
                this.logger.log(`Forgot ${count} devices idle for ${deviceForgetDays} days`);
            }
        } catch (error) {
            this.logger.error(`Error in ForgetStaleDevicesTask: ${error}`);
        }
    }
}

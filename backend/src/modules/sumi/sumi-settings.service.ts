import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

import { Injectable } from '@nestjs/common';

import {
    SUMI_SETTINGS_DEFAULTS,
    SumiSettingsSchema,
    TSumiBrand,
    TSumiSettings,
} from '@libs/contracts/models';

const SETTINGS_ROW_ID = 1;

/**
 * Сколько процесс верит прочитанным настройкам. Их читают на каждой раздаче
 * клиентов ноде и на каждой подписке, а API, обработчик очередей и
 * планировщик — разные процессы: общий сброс кэша стоил бы больше, чем
 * несколько секунд старых настроек.
 */
const CACHE_TTL_MS = 5_000;

@Injectable()
export class SumiSettingsService {
    private cached: { value: TSumiSettings; expiresAt: number } | null = null;

    constructor(private readonly prisma: TransactionHost<TransactionalAdapterPrisma>) {}

    public async get(): Promise<TSumiSettings> {
        if (this.cached && this.cached.expiresAt > Date.now()) {
            return this.cached.value;
        }

        const row = await this.prisma.tx.boltSettings.findUnique({
            where: { id: SETTINGS_ROW_ID },
        });

        const value = SumiSettingsSchema.parse({ ...SUMI_SETTINGS_DEFAULTS, ...row?.sumi });
        this.cached = { value, expiresAt: Date.now() + CACHE_TTL_MS };
        return value;
    }

    public async update(patch: Partial<TSumiSettings>): Promise<TSumiSettings> {
        const value = SumiSettingsSchema.parse({ ...(await this.get()), ...patch });

        await this.prisma.tx.boltSettings.upsert({
            where: { id: SETTINGS_ROW_ID },
            create: { id: SETTINGS_ROW_ID, sumi: value },
            update: { sumi: value },
        });

        this.cached = { value, expiresAt: Date.now() + CACHE_TTL_MS };
        return value;
    }

    /**
     * Бренд аккаунта по приставке имени. Самая длинная подходящая приставка,
     * иначе `w` отобрал бы аккаунты у более длинной `wl`.
     */
    public static brandOf(settings: TSumiSettings, username: string): TSumiBrand | null {
        let best: TSumiBrand | null = null;
        for (const brand of settings.brands) {
            if (!username.startsWith(brand.prefix)) continue;
            if (!best || brand.prefix.length > best.prefix.length) best = brand;
        }
        return best;
    }
}

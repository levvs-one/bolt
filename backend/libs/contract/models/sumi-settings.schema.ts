import { z } from 'zod';

const GIB = 1024 ** 3;

/** Какой ключ хост отдаёт в подписке. Нет записи — общий ключ пользователя. */
export const SUMI_HOST_KEY = {
    /** Свой UUID на каждый вход: скопированный профиль одной страны не открывает другую. */
    ENTRY: 'ENTRY',
    /** Ключ «Мобильной связи»: только по нему считается квота. */
    METERED: 'METERED',
} as const;

export const SumiHostKeySchema = z.enum([SUMI_HOST_KEY.ENTRY, SUMI_HOST_KEY.METERED]);

export const SumiBrandSchema = z.object({
    /**
     * Приставка имени аккаунта: `u` — SUMI, `w` — Dr. Watson. Берётся самая длинная
     * подходящая; пустая — бренд для всех остальных аккаунтов.
     */
    prefix: z.string().regex(/^([a-z][a-z0-9-]{0,15})?$/),
    /** Внутренние сквады, в которые бот кладёт новых людей этого бренда. */
    internalSquadUuids: z.array(z.uuid()),
    /** Название профиля в приложении. */
    title: z.string().max(256),
    /** Строка под названием. */
    announce: z.string().max(256),
    /** Единственная запись вместо серверов, когда доступ закончился. */
    blockedLabel: z.string().max(256),
    /** Строка под названием, когда доступ закончился. */
    blockedAnnounce: z.string().max(256),
});

export const SumiSettingsSchema = z.object({
    /** Тег инбаунда без этой приставки — имя входа в выработке ключа (`in-de4x2` → `de4x2`). */
    entryTagPrefix: z.string().max(32),
    /** Ноды, на которых действует ключ «Мобильной связи». */
    meteredNodes: z.array(z.uuid()),
    hostKeys: z.record(z.uuid(), SumiHostKeySchema),
    /** Хост, выбранный замерами для «Авто»: в балансере он первый и служит запасным выходом. */
    autoSelectedHost: z.uuid().nullable(),
    /** DNS ноды для фильтра рекламы: подставляется в `dns.servers` конфига ноды. */
    nodeDns: z.record(z.uuid(), z.array(z.string().min(1))),
    brands: z.array(SumiBrandSchema),
    defaultMeteredLimitBytes: z.number().int().min(0),
    defaultDeviceLimit: z.number().int().min(1).max(50),
    /**
     * Запрос без идентификатора и модели — скрипт или браузер, а не устройство:
     * подписку отдать, место не занимать. Иначе Bolt отказывает «HWID не поддерживается».
     */
    allowWithoutDeviceId: z.boolean(),
    /** Устройство, не приходившее за подпиской столько дней, забывается. */
    deviceForgetDays: z.number().int().min(1).max(3650),
    /** База ссылки подписки, к ней дописывается короткий ID: `https://sub.example.com/s/`. */
    subscriptionBaseUrl: z.string().url().nullable(),
    /** То же через зеркало для РФ. */
    mirrorBaseUrl: z.string().url().nullable(),
    /** Маршрутные профили Happ: уходят строками `happ://routing/add/…` в base64-подписку. */
    routingProfiles: z.array(z.record(z.string(), z.unknown())),
});

export const SUMI_SETTINGS_DEFAULTS: z.infer<typeof SumiSettingsSchema> = {
    entryTagPrefix: 'in-',
    meteredNodes: [],
    hostKeys: {},
    autoSelectedHost: null,
    nodeDns: {},
    brands: [],
    defaultMeteredLimitBytes: 500 * GIB,
    defaultDeviceLimit: 5,
    allowWithoutDeviceId: false,
    deviceForgetDays: 30,
    subscriptionBaseUrl: null,
    mirrorBaseUrl: null,
    routingProfiles: [],
};

export type TSumiSettings = z.infer<typeof SumiSettingsSchema>;
export type TSumiBrand = z.infer<typeof SumiBrandSchema>;
export type TSumiHostKey = z.infer<typeof SumiHostKeySchema>;

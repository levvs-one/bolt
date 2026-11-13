import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import dayjs from 'dayjs';
import { randomUUID } from 'node:crypto';

import { Injectable, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

import { TypedConfigService } from '@common/config/app-config';
import { TResult } from '@common/types';
import { ERRORS, USERS_STATUS } from '@libs/contracts/constants';
import { TSumiBrand, TSumiSettings } from '@libs/contracts/models';

import { AddUserToNodeEvent } from '@modules/nodes/events/add-user-to-node';
import { NodesService } from '@modules/nodes/nodes.service';
import { sharedUuid } from '@modules/sumi/sumi-credentials';
import { SumiSettingsService } from '@modules/sumi/sumi-settings.service';
import {
    IUserSumi,
    SumiUsersRepository,
    TUserSumiPatch,
} from '@modules/sumi/sumi-users.repository';
import { UserEntity } from '@modules/users/entities/user.entity';
import { UsersService } from '@modules/users/users.service';

/** Те же три вида отказа, что у `sumi api`: бот по ним решает, повторять ли запрос. */
export type TSumiRpcErrorKind = 'not_found' | 'bad_request' | 'internal';

export class SumiRpcError extends Error {
    constructor(
        public readonly kind: TSumiRpcErrorKind,
        message: string,
    ) {
        super(message);
    }
}

type TRequest = Record<string, unknown>;

type TStateUser = Pick<
    UserEntity,
    'username' | 'shortUuid' | 'expireAt' | 'hwidDeviceLimit' | 'createdAt'
> & { status: string };

/** Срок `0` у sumi значит «бессрочно»; Bolt хранит дату и считает 2099 год бессрочным. */
const NO_EXPIRE_DATE = new Date('2099-12-31T00:00:00Z');
const NO_EXPIRE_YEAR = 2099;

const NAME_RE = /^[a-zA-Z0-9_-]{1,32}$/;
const MAX_DEVICE_LIST = 20;
const DEVICE_LIMIT_MIN = 1;
const DEVICE_LIMIT_MAX = 50;
const PROXY_EXTRA_MAX = 20;
const TEXT_LIMITS = { notice: 64, title: 32, announce: 120, brandText: 256, nodeLabel: 48 };

const BRAND_TEXT_FIELDS = {
    title: 'title',
    announce: 'announce',
    blocked_label: 'blockedLabel',
    blocked_announce: 'blockedAnnounce',
} as const satisfies Record<string, keyof TSumiBrand>;

const USER_OPS = new Set([
    'show',
    'create',
    'renew',
    'add_quota',
    'set_quota',
    'set_expire',
    'reset',
    'disable',
    'delete',
    'reissue',
    'set_title',
    'set_personal',
    'set_notice',
    'set_devices',
    'device_forget',
    'set_proxy_extra',
    'set_announce',
]);

/**
 * Машинный интерфейс для Telegram-бота: те же операции и тот же ответ, что у
 * `sumi api`. Бот меняет только транспорт — SSH на HTTPS с токеном.
 */
@Injectable()
export class SumiRpcService {
    private readonly logger = new Logger(SumiRpcService.name);
    private readonly subPublicDomain: string;

    constructor(
        private readonly prisma: TransactionHost<TransactionalAdapterPrisma>,
        private readonly eventBus: EventBus,
        private readonly configService: TypedConfigService,
        private readonly usersService: UsersService,
        private readonly nodesService: NodesService,
        private readonly sumiSettings: SumiSettingsService,
        private readonly sumiUsers: SumiUsersRepository,
    ) {
        this.subPublicDomain = this.configService.getOrThrow('SUB_PUBLIC_DOMAIN');
    }

    public async call(request: TRequest): Promise<Record<string, unknown>> {
        try {
            const op = String(request.op ?? '').trim();
            const settings = await this.sumiSettings.get();

            switch (op) {
                case 'list':
                    return { ok: true, users: await this.listStates(settings) };
                case 'nodes':
                    return { ok: true, nodes: await this.nodes() };
                case 'node_update':
                    return { ok: true, node: await this.nodeUpdate(request) };
                case 'config_get':
                    return { ok: true, config: this.configGet(settings, request) };
                case 'config_update':
                    return { ok: true, config: await this.configUpdate(settings, request) };
            }

            if (!USER_OPS.has(op)) {
                throw new SumiRpcError('bad_request', `unknown op: ${op || '(none)'}`);
            }

            const name = this.name(request);
            if (op === 'create') {
                return { ok: true, user: await this.create(settings, name, request) };
            }

            const user = await this.findUser(name);
            if (op === 'show') {
                return { ok: true, user: await this.state(settings, user) };
            }
            if (op === 'delete') {
                this.unwrap(await this.usersService.deleteUser(Number(user.id)));
                return { ok: true, deleted: name };
            }

            const updated = await this.write(settings, op, user, request);
            return { ok: true, user: await this.state(settings, updated) };
        } catch (error) {
            if (error instanceof SumiRpcError) {
                return { ok: false, error: error.message, kind: error.kind };
            }
            this.logger.error(error);
            return { ok: false, error: String(error), kind: 'internal' };
        }
    }

    // ── пользователи ──────────────────────────────────────────

    private async create(settings: TSumiSettings, name: string, request: TRequest) {
        const exists = await this.usersService.getUserByUniqueFields({ username: name });
        if (exists.isOk) throw new SumiRpcError('not_found', `user ${name} already exists`);

        const brand = SumiSettingsService.brandOf(settings, name);
        const credentialSeed = randomUUID();
        const telegram = brand ? name.slice(brand.prefix.length) : '';

        const created = this.unwrap(
            await this.usersService.createUser({
                username: name,
                status: USERS_STATUS.ACTIVE,
                vlessUuid: sharedUuid(credentialSeed, name),
                trafficLimitBytes: 0,
                trafficLimitStrategy: 'NO_RESET',
                expireAt: this.expireDate(this.int(request, 'expire', 0)),
                telegramId: /^\d+$/.test(telegram) ? Number(telegram) : null,
                hwidDeviceLimit: settings.defaultDeviceLimit,
                activeInternalSquads: brand?.internalSquadUuids ?? [],
            } as Parameters<UsersService['createUser']>[0]),
        );

        await this.sumiUsers.create(created.id, {
            credentialSeed,
            meteredLimitBytes: BigInt(this.int(request, 'quota_bytes')),
            notice: this.text(request.notice, TEXT_LIMITS.notice) || null,
        });
        // Пользователь ушёл на ноды раньше, чем появились его ключи SUMI: досылаем их.
        this.eventBus.publish(new AddUserToNodeEvent(created.id));

        return this.state(settings, created);
    }

    private async write(
        settings: TSumiSettings,
        op: string,
        user: UserEntity,
        request: TRequest,
    ): Promise<UserEntity> {
        const sumi = await this.ensureSumi(settings, user);
        const used = sumi.meteredUsedBytes;
        const patch: TUserSumiPatch = {};
        let status: string | undefined;

        switch (op) {
            case 'reissue':
                return this.unwrap(await this.usersService.revokeUserSubscription(Number(user.id)));
            case 'disable':
                return this.unwrap(await this.usersService.disableUser(Number(user.id)));
            case 'set_expire':
                return this.updateUser(user, {
                    expireAt: this.expireDate(this.int(request, 'expire')),
                });
            case 'set_devices':
                return this.updateUser(user, {
                    hwidDeviceLimit: this.clamp(
                        this.int(request, 'device_limit'),
                        DEVICE_LIMIT_MIN,
                        DEVICE_LIMIT_MAX,
                    ),
                });
            case 'device_forget':
                // Вернётся, если снова придёт за подпиской: отрезать насовсем умеет только перевыпуск.
                await this.prisma.tx.hwidUserDevices.deleteMany({
                    where: { userId: user.id, hwid: String(request.key ?? '') },
                });
                return user;
            case 'renew': {
                // Оплаченный период одним шагом: иначе было бы окно, когда деньги
                // заплачены, а человека ещё нет в конфигах нод.
                const limit = BigInt(
                    this.int(request, 'quota_bytes', Number(sumi.meteredLimitBytes)),
                );
                Object.assign(patch, {
                    meteredUsedBytes: 0n,
                    meteredLimitBytes: limit,
                    meteredBlocked: false,
                });
                if ('notice' in request)
                    patch.notice = this.text(request.notice, TEXT_LIMITS.notice);
                await this.sumiUsers.update(user.id, patch);
                return this.updateUser(user, {
                    status: USERS_STATUS.ACTIVE,
                    expireAt: this.expireDate(this.int(request, 'expire', this.expireUnix(user))),
                });
            }
            case 'add_quota': {
                const limit = this.maxBigInt(
                    0n,
                    sumi.meteredLimitBytes + BigInt(this.int(request, 'delta_bytes')),
                );
                const hasQuota = used < limit;
                patch.meteredLimitBytes = limit;
                if (hasQuota) patch.meteredBlocked = false;
                // Докупка трафика оживляет отключённого за трафик, но не того, у кого кончился срок.
                if (hasQuota && user.status !== USERS_STATUS.ACTIVE && !this.isExpired(user)) {
                    status = USERS_STATUS.ACTIVE;
                }
                break;
            }
            case 'set_quota': {
                const limit = BigInt(this.int(request, 'quota_bytes'));
                patch.meteredLimitBytes = limit;
                if (used < limit) patch.meteredBlocked = false;
                break;
            }
            case 'reset':
                Object.assign(patch, { meteredUsedBytes: 0n, meteredBlocked: false });
                status = USERS_STATUS.ACTIVE;
                break;
            case 'set_title':
                patch.title = this.text(request.title, TEXT_LIMITS.title) || null;
                break;
            case 'set_announce':
                patch.announce = this.text(request.announce, TEXT_LIMITS.announce) || null;
                break;
            case 'set_notice':
                patch.notice = this.text(request.notice, TEXT_LIMITS.notice) || null;
                break;
            case 'set_personal':
                patch.personal = Boolean(request.personal);
                break;
            case 'set_proxy_extra':
                patch.proxyExtra = this.clamp(this.int(request, 'proxy_extra'), 0, PROXY_EXTRA_MAX);
                break;
        }

        const updatedSumi = await this.sumiUsers.update(user.id, patch);
        if (status && status !== user.status) {
            return this.updateUser(user, { status });
        }
        if (updatedSumi.meteredBlocked !== sumi.meteredBlocked) {
            // Ключ «Мобильной связи» вернуть или снять на нодах.
            this.eventBus.publish(new AddUserToNodeEvent(user.id));
        }
        return user;
    }

    /** Аккаунт, заведённый в Bolt руками, получает запись SUMI при первом обращении бота. */
    private async ensureSumi(settings: TSumiSettings, user: UserEntity): Promise<IUserSumi> {
        const existing = await this.sumiUsers.find(user.id);
        if (existing) return existing;

        await this.sumiUsers.create(user.id, {
            credentialSeed: randomUUID(),
            meteredLimitBytes: BigInt(settings.defaultMeteredLimitBytes),
        });
        this.eventBus.publish(new AddUserToNodeEvent(user.id));
        return (await this.sumiUsers.find(user.id))!;
    }

    private async updateUser(
        user: UserEntity,
        fields: Record<string, unknown>,
    ): Promise<UserEntity> {
        return this.unwrap(
            await this.usersService.updateUser({
                username: user.username,
                ...fields,
            } as Parameters<UsersService['updateUser']>[0]),
        );
    }

    private async state(
        settings: TSumiSettings,
        user: UserEntity,
    ): Promise<Record<string, unknown>> {
        const sumi = await this.sumiUsers.find(user.id);
        const devices = await this.prisma.tx.hwidUserDevices.findMany({
            where: { userId: user.id },
            orderBy: { updatedAt: 'desc' },
        });
        return this.stateOf(settings, user, sumi, devices);
    }

    /** Все сразу, одним запросом: бот сверяет список с записями оплат по расписанию. */
    private async listStates(settings: TSumiSettings): Promise<Record<string, unknown>[]> {
        const users = await this.prisma.tx.users.findMany({
            include: { sumi: true, hwidUserDevices: { orderBy: { updatedAt: 'desc' } } },
            orderBy: { id: 'asc' },
        });
        return users.map((user) => this.stateOf(settings, user, user.sumi, user.hwidUserDevices));
    }

    private stateOf(
        settings: TSumiSettings,
        user: TStateUser,
        sumi: IUserSumi | null,
        devices: {
            hwid: string;
            deviceModel: string | null;
            platform: string | null;
            osVersion: string | null;
            userAgent: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[],
    ): Record<string, unknown> {
        const limit = Number(sumi?.meteredLimitBytes ?? 0n);
        const used = Number(sumi?.meteredUsedBytes ?? 0n);
        const subUrl = this.subscriptionUrl(settings.subscriptionBaseUrl, user.shortUuid);

        return {
            name: user.username,
            subpath: user.shortUuid,
            sub_url: subUrl,
            // Без зеркала — пустая строка, как у sumi: бот тогда не показывает вторую ссылку.
            sub_url_ru: settings.mirrorBaseUrl
                ? this.subscriptionUrl(settings.mirrorBaseUrl, user.shortUuid)
                : '',
            // MTProto-прокси Bolt не раздаёт: их до сих пор ведёт sumi на своей ноде.
            proxy_links: [],
            proxy_extra: sumi?.proxyExtra ?? 0,
            personal: sumi?.personal ?? false,
            title: sumi?.title ?? '',
            quota_bytes: limit,
            // Bolt считает трафик одной суммой; бот складывает эти два поля.
            used_up: 0,
            used_down: used,
            used_bytes: used,
            left_bytes: Math.max(0, limit - used),
            blocked: user.status !== USERS_STATUS.ACTIVE,
            white_blocked: sumi?.meteredBlocked ?? false,
            expire: this.expireUnix(user),
            notice: sumi?.notice ?? '',
            devices: devices.length,
            device_list: devices.slice(0, MAX_DEVICE_LIST).map((device) => ({
                key: device.hwid,
                hwid: device.hwid,
                model: device.deviceModel ?? '',
                os: device.platform ?? '',
                os_ver: device.osVersion ?? '',
                agent: device.userAgent ?? '',
                first: dayjs(device.createdAt).unix(),
                last: dayjs(device.updatedAt).unix(),
                online: false,
            })),
            device_limit: user.hwidDeviceLimit ?? settings.defaultDeviceLimit,
            created: dayjs(user.createdAt).unix(),
        };
    }

    // ── ноды и тексты ─────────────────────────────────────────

    private async nodes(): Promise<Record<string, unknown>[]> {
        const nodes = await this.prisma.tx.nodes.findMany({ orderBy: { viewPosition: 'asc' } });
        return nodes.map((node) => ({
            id: node.name,
            label: node.note || node.name,
            country: node.note || '',
            flag: this.flagOf(node.countryCode),
            host: node.address,
            port: node.port,
            kind: 'reality',
            enabled: !node.isDisabled,
            xray: node.isConnected ? 'active' : node.isDisabled ? 'inactive' : 'unreachable',
        }));
    }

    /** Имя, флаг и доступность. Адреса и ключи из чата не правятся: опечатка там — это авария. */
    private async nodeUpdate(request: TRequest): Promise<Record<string, unknown>> {
        const id = String(request.id ?? '').trim();
        const node = await this.prisma.tx.nodes.findUnique({ where: { name: id } });
        if (!node) throw new SumiRpcError('not_found', `no such node: ${id}`);

        if ('enabled' in request) {
            this.unwrap(
                request.enabled
                    ? await this.nodesService.enableNode(node.uuid)
                    : await this.nodesService.disableNode(node.uuid),
            );
        }

        const label = 'label' in request ? request.label : request.country;
        const fields: Record<string, unknown> = {};
        if (label !== undefined) fields.note = this.text(label, TEXT_LIMITS.nodeLabel);
        if ('flag' in request) {
            const code = this.countryCodeOf(String(request.flag));
            if (!code) throw new SumiRpcError('bad_request', 'flag must be a country flag emoji');
            fields.countryCode = code;
        }
        if (Object.keys(fields).length > 0) {
            this.unwrap(
                await this.nodesService.updateNode({ uuid: node.uuid, ...fields } as Parameters<
                    NodesService['updateNode']
                >[0]),
            );
        }

        const [updated] = (await this.nodes()).filter((entry) => entry.id === id);
        return updated;
    }

    /** Тексты бренда, от имени которого спрашивает бот. Без бренда — первого заведённого. */
    private configGet(settings: TSumiSettings, request: TRequest): Record<string, string> {
        const brand = this.brandByPrefix(settings, request.brand);
        return Object.fromEntries(
            Object.entries(BRAND_TEXT_FIELDS).map(([key, field]) => [key, brand?.[field] ?? '']),
        );
    }

    private async configUpdate(settings: TSumiSettings, request: TRequest) {
        const prefix = String(request.brand ?? '').trim();
        if (!prefix) throw new SumiRpcError('bad_request', 'brand is required');

        const current: TSumiBrand = this.brandByPrefix(settings, prefix) ?? {
            prefix,
            internalSquadUuids: [],
            title: '',
            announce: '',
            blockedLabel: '',
            blockedAnnounce: '',
        };
        const changed: Record<string, string> = {};
        const next = { ...current };
        for (const [key, field] of Object.entries(BRAND_TEXT_FIELDS)) {
            if (!(key in request)) continue;
            next[field] = this.text(request[key], TEXT_LIMITS.brandText);
            changed[key] = next[field];
        }
        if (Object.keys(changed).length === 0)
            throw new SumiRpcError('bad_request', 'nothing to change');

        // Правка одного бренда не достаёт до соседа: второй продаётся под своим именем.
        await this.sumiSettings.update({
            brands: [...settings.brands.filter((brand) => brand.prefix !== prefix), next],
        });
        return changed;
    }

    // ── мелочи ────────────────────────────────────────────────

    private brandByPrefix(settings: TSumiSettings, prefix: unknown): TSumiBrand | null {
        const wanted = String(prefix ?? '').trim();
        if (!wanted) return settings.brands[0] ?? null;
        return settings.brands.find((brand) => brand.prefix === wanted) ?? null;
    }

    private async findUser(name: string): Promise<UserEntity> {
        const user = await this.usersService.getUserByUniqueFields({ username: name });
        if (!user.isOk) throw new SumiRpcError('not_found', `no such user: ${name}`);
        return user.response;
    }

    private name(request: TRequest): string {
        const name = String(request.name ?? '').trim();
        if (!NAME_RE.test(name)) {
            throw new SumiRpcError(
                'bad_request',
                'name must be 1-32 chars of a-z, 0-9, dash, underscore',
            );
        }
        return name;
    }

    private int(request: TRequest, key: string, fallback?: number): number {
        const value = request[key] ?? fallback;
        if (value === undefined || value === null) {
            throw new SumiRpcError('bad_request', `missing field: ${key}`);
        }
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            throw new SumiRpcError('bad_request', `field ${key} must be a number`);
        }
        return Math.trunc(value);
    }

    private text(value: unknown, limit: number): string {
        return String(value ?? '').slice(0, limit);
    }

    private clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    private maxBigInt(a: bigint, b: bigint): bigint {
        return a > b ? a : b;
    }

    private expireDate(unix: number): Date {
        return unix > 0 ? dayjs.unix(unix).toDate() : NO_EXPIRE_DATE;
    }

    private expireUnix(user: Pick<UserEntity, 'expireAt'>): number {
        return user.expireAt.getUTCFullYear() >= NO_EXPIRE_YEAR ? 0 : dayjs(user.expireAt).unix();
    }

    private isExpired(user: UserEntity): boolean {
        const expire = this.expireUnix(user);
        return expire > 0 && dayjs().unix() >= expire;
    }

    private subscriptionUrl(base: string | null, shortUuid: string): string {
        if (base) return `${base.replace(/\/+$/, '')}/${shortUuid}`;
        return `https://${this.subPublicDomain}/${shortUuid}`;
    }

    private flagOf(countryCode: string): string {
        if (!/^[A-Z]{2}$/.test(countryCode)) return '';
        return String.fromCodePoint(
            ...[...countryCode].map((letter) => 0x1f1e6 + letter.charCodeAt(0) - 65),
        );
    }

    private countryCodeOf(flag: string): string | null {
        const letters = [...flag]
            .map((symbol) => symbol.codePointAt(0)!)
            .filter((code) => code >= 0x1f1e6 && code <= 0x1f1ff)
            .map((code) => String.fromCharCode(code - 0x1f1e6 + 65));
        return letters.length === 2 ? letters.join('') : null;
    }

    private unwrap<T>(result: TResult<T>): T {
        if (result.isOk) return result.response;
        const kind: TSumiRpcErrorKind =
            result.code === ERRORS.USER_NOT_FOUND.code ? 'not_found' : 'internal';
        throw new SumiRpcError(kind, result.message ?? 'error');
    }
}

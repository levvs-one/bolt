import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

import { Injectable } from '@nestjs/common';

import { TxKyselyService } from '@common/database/tx-kysely.service';

export interface ISumiCredentials {
    userId: bigint;
    username: string;
    credentialSeed: string;
    meteredBlocked: boolean;
}

export interface IUserSumi {
    userId: bigint;
    credentialSeed: string;
    meteredLimitBytes: bigint;
    meteredUsedBytes: bigint;
    meteredBlocked: boolean;
    personal: boolean;
    title: string | null;
    announce: string | null;
    notice: string | null;
    proxyExtra: number;
}

export type TUserSumiPatch = Partial<Omit<IUserSumi, 'userId'>>;

@Injectable()
export class SumiUsersRepository {
    constructor(
        private readonly prisma: TransactionHost<TransactionalAdapterPrisma>,
        private readonly qb: TxKyselyService,
    ) {}

    public async getCredentials(userIds: bigint[]): Promise<Map<bigint, ISumiCredentials>> {
        if (userIds.length === 0) return new Map();

        const rows = await this.qb.kysely
            .selectFrom('userSumi')
            .innerJoin('users', 'users.id', 'userSumi.userId')
            .where('userSumi.userId', 'in', userIds)
            .select([
                'userSumi.userId',
                'users.username',
                'userSumi.credentialSeed',
                'userSumi.meteredBlocked',
            ])
            .execute();

        return new Map(rows.map((row) => [row.userId, row]));
    }

    public async existingUserIds(userIds: bigint[]): Promise<Set<bigint>> {
        if (userIds.length === 0) return new Set();

        const rows = await this.qb.kysely
            .selectFrom('users')
            .where('users.id', 'in', userIds)
            .select('users.id')
            .execute();

        return new Set(rows.map((row) => row.id));
    }

    public async find(userId: bigint): Promise<IUserSumi | null> {
        return this.prisma.tx.userSumi.findUnique({ where: { userId } });
    }

    public async create(userId: bigint, data: TUserSumiPatch & { credentialSeed: string }) {
        return this.prisma.tx.userSumi.create({ data: { userId, ...data } });
    }

    public async update(userId: bigint, data: TUserSumiPatch): Promise<IUserSumi> {
        return this.prisma.tx.userSumi.update({ where: { userId }, data });
    }

    public async forgetDevices(userId: bigint): Promise<void> {
        await this.prisma.tx.hwidUserDevices.deleteMany({ where: { userId } });
    }

    /**
     * Добавить трафик «Мобильной связи» и вернуть тех, кто только что упёрся в
     * квоту. Одним запросом: счётчики приходят с каждой ноды каждые полминуты.
     */
    public async addMeteredUsage(usage: Map<bigint, bigint>): Promise<bigint[]> {
        if (usage.size === 0) return [];

        const ids = [...usage.keys()];
        const bytes = ids.map((id) => usage.get(id)!.toString());

        const rows = await this.prisma.tx.$queryRaw<{ user_id: bigint; newly_blocked: boolean }[]>`
            WITH d AS (
                SELECT * FROM unnest(${ids}::bigint[], ${bytes}::bigint[]) AS d(user_id, bytes)
            ), before AS (
                SELECT s.user_id, s.metered_blocked AS was_blocked
                FROM user_sumi s JOIN d USING (user_id)
                FOR UPDATE OF s
            )
            UPDATE user_sumi AS s
            SET metered_used_bytes = s.metered_used_bytes + d.bytes,
                metered_blocked = s.metered_blocked
                    OR (s.metered_used_bytes + d.bytes >= s.metered_limit_bytes),
                updated_at = now()
            FROM d JOIN before b USING (user_id)
            WHERE s.user_id = d.user_id
            RETURNING s.user_id, (s.metered_blocked AND NOT b.was_blocked) AS newly_blocked
        `;

        return rows.filter((row) => row.newly_blocked).map((row) => row.user_id);
    }
}

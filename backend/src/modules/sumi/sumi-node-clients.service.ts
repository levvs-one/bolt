import { Injectable } from '@nestjs/common';

import { AddUsersCommand } from '@remnawave/node-contract';

import { getVlessFlowFromDbInbound } from '@common/utils/flow/get-vless-flow';

import { ConfigProfileInboundEntity } from '@modules/config-profiles/entities';

import {
    clientEmail,
    entryIdFromTag,
    entryUuid,
    METERED_SUFFIX,
    meteredUuid,
} from './sumi-credentials';
import { SumiSettingsService } from './sumi-settings.service';
import { ISumiCredentials, SumiUsersRepository } from './sumi-users.repository';

/**
 * Клиент ноды сверх общего `<id>`: свой ключ на вход и ключ «Мобильной связи».
 * Агент ноды кладёт `userId` в email и перед добавлением снимает этот email со
 * всех инбаундов, поэтому у каждого такого клиента свой email и свой набор тегов.
 */
export interface ISumiNodeClient {
    userId: string;
    uuid: string;
    tags: string[];
}

export interface ISumiNodeContext {
    isMetered: boolean;
    entryTagPrefix: string;
}

export function buildSumiNodeClients(
    credentials: ISumiCredentials,
    vlessTags: string[],
    context: ISumiNodeContext,
): ISumiNodeClient[] {
    const { userId, username, credentialSeed } = credentials;

    const clients = vlessTags.map((tag) => {
        const entryId = entryIdFromTag(tag, context.entryTagPrefix);
        return {
            userId: clientEmail(userId, entryId),
            uuid: entryUuid(credentialSeed, username, entryId),
            tags: [tag],
        };
    });

    // Перерасход квоты снимает только этот ключ: обычные страны продаются безлимитными.
    if (context.isMetered && !credentials.meteredBlocked && vlessTags.length > 0) {
        clients.push({
            userId: clientEmail(userId, METERED_SUFFIX),
            uuid: meteredUuid(credentialSeed, username),
            tags: vlessTags,
        });
    }

    return clients;
}

@Injectable()
export class SumiNodeClientsService {
    constructor(
        private readonly settings: SumiSettingsService,
        private readonly sumiUsers: SumiUsersRepository,
    ) {}

    public async nodeContext(nodeUuid: string): Promise<ISumiNodeContext> {
        const settings = await this.settings.get();
        return {
            isMetered: settings.meteredNodes.includes(nodeUuid),
            entryTagPrefix: settings.entryTagPrefix,
        };
    }

    /**
     * Что отправить ноде для этих людей: клиентов SUMI на добавление и ключи
     * «Мобильной связи», которые надо снять у упёршихся в квоту.
     */
    public async nodePlan(
        nodeUuid: string,
        users: { id: bigint; inbounds: ConfigProfileInboundEntity[] }[],
        nodeInbounds: ConfigProfileInboundEntity[],
    ): Promise<{
        add: AddUsersCommand.Request['users'];
        remove: { userId: string; hashUuid: string }[];
        affectedTags: string[];
    }> {
        const add: AddUsersCommand.Request['users'] = [];
        const remove: { userId: string; hashUuid: string }[] = [];
        const affected = new Set<string>();

        const credentials = await this.credentials(users.map((user) => user.id));
        if (credentials.size === 0) return { add, remove, affectedTags: [] };

        const context = await this.nodeContext(nodeUuid);
        const nodeVlessTags = nodeInbounds
            .filter((inbound) => inbound.type === 'vless')
            .map((inbound) => inbound.tag);

        for (const user of users) {
            const known = credentials.get(user.id);
            if (!known) continue;

            // Только инбаунды, которые человеку дают его сквады: лишний ключ — лишний доступ.
            const vless = user.inbounds.filter((inbound) => inbound.type === 'vless');
            const byTag = new Map(vless.map((inbound) => [inbound.tag, inbound]));
            const tags = [...byTag.keys()];
            tags.forEach((tag) => affected.add(tag));

            for (const client of buildSumiNodeClients(known, tags, context)) {
                add.push({
                    userData: {
                        userId: client.userId,
                        hashUuid: client.uuid,
                        vlessUuid: client.uuid,
                        // Пароли нужны контракту, но у клиента VLESS не используются.
                        trojanPassword: client.uuid,
                        ssPassword: client.uuid,
                    },
                    inboundData: client.tags.map((tag) => ({
                        type: 'vless' as const,
                        tag,
                        flow: getVlessFlowFromDbInbound(byTag.get(tag)!),
                    })),
                });
            }

            // Вход, который у человека забрали сменой сквада, уносит и свой ключ.
            for (const tag of nodeVlessTags) {
                if (byTag.has(tag)) continue;
                const entryId = entryIdFromTag(tag, context.entryTagPrefix);
                remove.push({
                    userId: clientEmail(known.userId, entryId),
                    hashUuid: entryUuid(known.credentialSeed, known.username, entryId),
                });
            }

            if (context.isMetered && known.meteredBlocked) {
                remove.push({
                    userId: clientEmail(known.userId, METERED_SUFFIX),
                    hashUuid: meteredUuid(known.credentialSeed, known.username),
                });
            }
        }

        return { add, remove, affectedTags: [...affected] };
    }

    public credentials(userIds: bigint[]): Promise<Map<bigint, ISumiCredentials>> {
        return this.sumiUsers.getCredentials(userIds);
    }

    /**
     * Что снять с ноды вместе с общим клиентом. Email выводится из id и тегов,
     * поэтому снимается и у удалённого человека; ключ для хэша инбаунда — только
     * пока запись жива, иначе агент получит общий UUID и просто пересоберёт хэш.
     */
    public async removalClients(
        users: { id: bigint; vlessUuid: string }[],
        vlessTags: string[],
        context: ISumiNodeContext,
    ): Promise<{ userId: string; hashUuid: string }[]> {
        const credentials = await this.credentials(users.map((user) => user.id));
        const alive = await this.sumiUsers.existingUserIds(
            users.filter((user) => !credentials.has(user.id)).map((user) => user.id),
        );
        const result: { userId: string; hashUuid: string }[] = [];

        for (const user of users) {
            const known = credentials.get(user.id);
            if (known) {
                const all = buildSumiNodeClients(
                    { ...known, meteredBlocked: false },
                    vlessTags,
                    context,
                );
                result.push(
                    ...all.map((client) => ({ userId: client.userId, hashUuid: client.uuid })),
                );
                continue;
            }

            // Живой человек без записи SUMI работает одним общим ключом — снимать нечего.
            if (alive.has(user.id)) continue;

            for (const tag of vlessTags) {
                result.push({
                    userId: clientEmail(user.id, entryIdFromTag(tag, context.entryTagPrefix)),
                    hashUuid: user.vlessUuid,
                });
            }
            if (context.isMetered) {
                result.push({
                    userId: clientEmail(user.id, METERED_SUFFIX),
                    hashUuid: user.vlessUuid,
                });
            }
        }

        return result;
    }
}

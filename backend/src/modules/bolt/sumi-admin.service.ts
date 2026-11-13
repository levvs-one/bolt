import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

import { fail, ok, TResult } from '@common/types';
import { UserSumiSchema } from '@libs/contracts/commands';
import { ERRORS } from '@libs/contracts/constants';
import { TSumiSettings } from '@libs/contracts/models';

import { AddUserToNodeEvent } from '@modules/nodes/events/add-user-to-node';
import { SumiSettingsService } from '@modules/sumi/sumi-settings.service';
import { IUserSumi, SumiUsersRepository } from '@modules/sumi/sumi-users.repository';

import { NodesQueuesService } from '@queue/_nodes';

type TUserSumiView = z.infer<typeof UserSumiSchema>;

/** Настройки SUMI и SUMI-поля пользователя — для панели. */
@Injectable()
export class SumiAdminService {
    constructor(
        private readonly eventBus: EventBus,
        private readonly sumiSettings: SumiSettingsService,
        private readonly sumiUsers: SumiUsersRepository,
        private readonly nodesQueuesService: NodesQueuesService,
    ) {}

    public async getSettings(): Promise<TResult<TSumiSettings>> {
        return ok(await this.sumiSettings.get());
    }

    public async updateSettings(patch: Partial<TSumiSettings>): Promise<TResult<TSumiSettings>> {
        const before = await this.sumiSettings.get();
        const after = await this.sumiSettings.update(patch);

        // Ноды, у которых поменялся ключ «Мобильной связи», DNS или имена входов,
        // получают конфиг заново: иначе правка дойдёт до них только с рестартом.
        if (before.entryTagPrefix !== after.entryTagPrefix) {
            await this.nodesQueuesService.startAllNodes({ emitter: SumiAdminService.name });
            return ok(after);
        }
        for (const nodeUuid of this.nodesToRestart(before, after)) {
            await this.nodesQueuesService.startNode({ nodeUuid, force: false });
        }

        return ok(after);
    }

    public async setAutoSelection(hostUuid: string | null): Promise<TResult<TSumiSettings>> {
        return ok(await this.sumiSettings.update({ autoSelectedHost: hostUuid }));
    }

    public async getUser(userId: bigint): Promise<TResult<TUserSumiView>> {
        return ok(this.view(await this.sumiUsers.find(userId)));
    }

    public async updateUser(
        userId: bigint,
        patch: Partial<TUserSumiView>,
    ): Promise<TResult<TUserSumiView>> {
        const { enabled, ...fields } = patch;
        let current = await this.sumiUsers.find(userId);

        if (!current && !enabled) return fail(ERRORS.USER_NOT_FOUND);

        if (!current) {
            const settings = await this.sumiSettings.get();
            await this.sumiUsers.create(userId, {
                credentialSeed: randomUUID(),
                meteredLimitBytes: BigInt(settings.defaultMeteredLimitBytes),
            });
            current = (await this.sumiUsers.find(userId))!;
        }

        const updated = await this.sumiUsers.update(userId, {
            ...(fields.meteredLimitBytes !== undefined && {
                meteredLimitBytes: BigInt(fields.meteredLimitBytes),
            }),
            ...(fields.meteredUsedBytes !== undefined && {
                meteredUsedBytes: BigInt(fields.meteredUsedBytes),
            }),
            ...(fields.meteredBlocked !== undefined && { meteredBlocked: fields.meteredBlocked }),
            ...(fields.personal !== undefined && { personal: fields.personal }),
            ...(fields.title !== undefined && { title: fields.title || null }),
            ...(fields.announce !== undefined && { announce: fields.announce || null }),
            ...(fields.notice !== undefined && { notice: fields.notice || null }),
            ...(fields.proxyExtra !== undefined && { proxyExtra: fields.proxyExtra }),
        });

        if (enabled || updated.meteredBlocked !== current.meteredBlocked) {
            this.eventBus.publish(new AddUserToNodeEvent(userId));
        }

        return ok(this.view(updated));
    }

    private view(sumi: IUserSumi | null): TUserSumiView {
        return {
            enabled: sumi !== null,
            meteredLimitBytes: Number(sumi?.meteredLimitBytes ?? 0n),
            meteredUsedBytes: Number(sumi?.meteredUsedBytes ?? 0n),
            meteredBlocked: sumi?.meteredBlocked ?? false,
            personal: sumi?.personal ?? false,
            title: sumi?.title ?? '',
            announce: sumi?.announce ?? '',
            notice: sumi?.notice ?? '',
            proxyExtra: sumi?.proxyExtra ?? 0,
        };
    }

    private nodesToRestart(before: TSumiSettings, after: TSumiSettings): Set<string> {
        const nodes = new Set<string>();
        const allNodes = new Set([
            ...before.meteredNodes,
            ...after.meteredNodes,
            ...Object.keys(before.nodeDns),
            ...Object.keys(after.nodeDns),
        ]);

        for (const node of allNodes) {
            const meteredChanged =
                before.meteredNodes.includes(node) !== after.meteredNodes.includes(node);
            const dnsChanged =
                JSON.stringify(before.nodeDns[node] ?? []) !==
                JSON.stringify(after.nodeDns[node] ?? []);
            if (meteredChanged || dnsChanged) nodes.add(node);
        }

        return nodes;
    }
}

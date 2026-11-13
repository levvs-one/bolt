import { Logger } from '@nestjs/common';
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';

import { RemoveUsersCommand as RemoveUsersFromNodeCommandSdk } from '@remnawave/node-contract';

import { SumiNodeClientsService } from '@modules/sumi/sumi-node-clients.service';

import { NodesQueuesService } from '@queue/_nodes';

import { NodesRepository } from '../../repositories/nodes.repository';
import { RemoveUsersFromNodeEvent } from './remove-users-from-node.event';

@EventsHandler(RemoveUsersFromNodeEvent)
export class RemoveUsersFromNodeHandler implements IEventHandler<RemoveUsersFromNodeEvent> {
    public readonly logger = new Logger(RemoveUsersFromNodeHandler.name);

    constructor(
        private readonly nodesRepository: NodesRepository,
        private readonly nodesQueuesService: NodesQueuesService,
        private readonly sumiNodeClients: SumiNodeClientsService,
    ) {}
    async handle(event: RemoveUsersFromNodeEvent) {
        try {
            const nodes = await this.nodesRepository.findConnectedNodesWithoutInbounds();

            if (nodes.length === 0 || event.users.length === 0) {
                return;
            }

            const userData: RemoveUsersFromNodeCommandSdk.Request = {
                users: event.users.map((user) => ({
                    userId: user.id.toString(),
                    hashUuid: user.vlessUuid,
                })),
            };

            for (const node of nodes) {
                await this.nodesQueuesService.removeUsersFromNode({
                    data: userData,
                    node: node.connectionOpts,
                });
            }

            await this.removeSumiClients(event.users);

            return;
        } catch (error) {
            this.logger.error(`Error in Event RemoveUsersFromNodeHandler: ${error}`);
        }
    }

    /** Снять клиентов SUMI (`<id>~вход`, `<id>~white`) вместе с общим. */
    private async removeSumiClients(users: { id: bigint; vlessUuid: string }[]) {
        const nodes = await this.nodesRepository.findConnectedNodes();

        for (const node of nodes) {
            const vlessTags = node.activeInbounds
                .filter((inbound) => inbound.type === 'vless')
                .map((inbound) => inbound.tag);
            if (vlessTags.length === 0) continue;

            const clients = await this.sumiNodeClients.removalClients(
                users,
                vlessTags,
                await this.sumiNodeClients.nodeContext(node.uuid),
            );
            if (clients.length === 0) continue;

            await this.nodesQueuesService.removeUsersFromNode({
                data: { users: clients },
                node: { address: node.address, port: node.port, proxyUrl: node.proxyUrl },
            });
        }
    }
}

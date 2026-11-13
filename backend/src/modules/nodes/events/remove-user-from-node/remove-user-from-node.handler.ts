import { Logger } from '@nestjs/common';
import { IEventHandler, EventsHandler } from '@nestjs/cqrs';

import { RemoveUserCommand as RemoveUserFromNodeCommandSdk } from '@remnawave/node-contract';

import { SumiNodeClientsService } from '@modules/sumi/sumi-node-clients.service';

import { NodesQueuesService } from '@queue/_nodes';

import { NodesRepository } from '../../repositories/nodes.repository';
import { RemoveUserFromNodeEvent } from './remove-user-from-node.event';

@EventsHandler(RemoveUserFromNodeEvent)
export class RemoveUserFromNodeHandler implements IEventHandler<RemoveUserFromNodeEvent> {
    public readonly logger = new Logger(RemoveUserFromNodeHandler.name);

    constructor(
        private readonly nodesRepository: NodesRepository,
        private readonly nodesQueuesService: NodesQueuesService,
        private readonly sumiNodeClients: SumiNodeClientsService,
    ) {}
    async handle(event: RemoveUserFromNodeEvent) {
        try {
            const nodes = await this.nodesRepository.findConnectedNodesWithoutInbounds();

            if (nodes.length === 0) {
                return;
            }

            const userData: RemoveUserFromNodeCommandSdk.Request = {
                username: event.id.toString(),
                hashData: {
                    vlessUuid: event.vlessUuid,
                },
            };

            await this.nodesQueuesService.removeUserFromNodeBulk(
                nodes.map((node) => ({
                    data: userData,
                    node: node.connectionOpts,
                })),
            );

            await this.removeSumiClients([{ id: event.id, vlessUuid: event.vlessUuid }]);

            return;
        } catch (error) {
            this.logger.error(`Error in Event RemoveUserFromNodeHandler: ${error}`);
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

import { Logger } from '@nestjs/common';
import { IEventHandler, QueryBus } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs';

import { AddUserCommand as AddUserToNodeCommandSdk } from '@remnawave/node-contract';

import {
    getCipherTypeFromString,
    getSsPassword,
    isSS2022Method,
} from '@common/helpers/xray-config/ss-cipher';
import { getVlessFlowFromDbInbound } from '@common/utils/flow/get-vless-flow';

import { ConfigProfileInboundEntity } from '@modules/config-profiles/entities/config-profile-inbound.entity';
import { SumiNodeClientsService } from '@modules/sumi/sumi-node-clients.service';
import { GetUserWithResolvedInboundsQuery } from '@modules/users/queries/get-user-with-resolved-inbounds';

import { NodesQueuesService } from '@queue/_nodes';

import { NodesRepository } from '../../repositories/nodes.repository';
import { AddUserToNodeEvent } from './add-user-to-node.event';

@EventsHandler(AddUserToNodeEvent)
export class AddUserToNodeHandler implements IEventHandler<AddUserToNodeEvent> {
    public readonly logger = new Logger(AddUserToNodeHandler.name);

    constructor(
        private readonly nodesRepository: NodesRepository,
        private readonly nodesQueuesService: NodesQueuesService,
        private readonly queryBus: QueryBus,
        private readonly sumiNodeClients: SumiNodeClientsService,
    ) {}
    async handle(event: AddUserToNodeEvent) {
        try {
            const userEntity = await this.queryBus.execute(
                new GetUserWithResolvedInboundsQuery(event.userId),
            );

            if (!userEntity.isOk) {
                return;
            }

            const { id, trojanPassword, vlessUuid, ssPassword, inbounds } = userEntity.response;

            if (inbounds.length === 0) {
                return;
            }

            const nodes = await this.nodesRepository.findConnectedNodes();

            if (nodes.length === 0) {
                return;
            }

            const userData: AddUserToNodeCommandSdk.Request = {
                hashData: {
                    vlessUuid,
                    prevVlessUuid: event.prevVlessUuid,
                },

                data: inbounds.map((inbound) => {
                    const inboundType = this.resolveInboundType(inbound);

                    switch (inboundType) {
                        case 'trojan':
                            return {
                                type: inboundType,
                                username: id.toString(),
                                password: trojanPassword,
                                tag: inbound.tag,
                            };
                        case 'vless':
                            return {
                                type: inboundType,
                                username: id.toString(),
                                uuid: vlessUuid,
                                flow: getVlessFlowFromDbInbound(inbound),
                                tag: inbound.tag,
                            };
                        case 'shadowsocks':
                            return {
                                type: inboundType,
                                username: id.toString(),
                                password: ssPassword,
                                tag: inbound.tag,
                                cipherType: getCipherTypeFromString(inbound.rawInbound),
                                ivCheck: false,
                            };
                        case 'shadowsocks22':
                            return {
                                type: inboundType,
                                username: id.toString(),
                                password: getSsPassword(ssPassword, true),
                                tag: inbound.tag,
                            };
                        case 'hysteria':
                            return {
                                type: inboundType,
                                username: id.toString(),
                                password: vlessUuid,
                                tag: inbound.tag,
                            };
                        default:
                            throw new Error(`Unsupported inbound type: ${inboundType}`);
                    }
                }),
            };

            for (const node of nodes) {
                if (node.activeInbounds.length === 0 || !node.activeConfigProfileUuid) {
                    continue;
                }

                const activeTags = new Set(node.activeInbounds.map((inbound) => inbound.tag));

                const filteredData = {
                    ...userData,
                    data: userData.data.filter((item) => activeTags.has(item.tag)),
                };

                const connection = {
                    address: node.address,
                    port: node.port,
                    proxyUrl: node.proxyUrl,
                };
                const nodeInbounds = inbounds.filter((inbound) => activeTags.has(inbound.tag));

                if (filteredData.data.length === 0) {
                    const sumiRemoval = await this.sumiNodeClients.removalClients(
                        [{ id, vlessUuid: event.prevVlessUuid || vlessUuid }],
                        node.activeInbounds
                            .filter((inbound) => inbound.type === 'vless')
                            .map((inbound) => inbound.tag),
                        await this.sumiNodeClients.nodeContext(node.uuid),
                    );
                    if (sumiRemoval.length > 0) {
                        await this.nodesQueuesService.removeUsersFromNode({
                            data: { users: sumiRemoval },
                            node: connection,
                        });
                    }

                    await this.nodesQueuesService.removeUserFromNode({
                        data: {
                            username: id.toString(),
                            hashData: {
                                vlessUuid: event.prevVlessUuid || vlessUuid,
                            },
                        },
                        node: {
                            address: node.address,
                            port: node.port,
                            proxyUrl: node.proxyUrl,
                        },
                    });

                    continue;
                }

                await this.nodesQueuesService.addUserToNode({
                    data: filteredData,
                    node: connection,
                });

                const sumi = await this.sumiNodeClients.nodePlan(
                    node.uuid,
                    [{ id, inbounds: nodeInbounds }],
                    node.activeInbounds,
                );
                if (sumi.add.length > 0) {
                    await this.nodesQueuesService.addUsersToNode({
                        data: { affectedInboundTags: sumi.affectedTags, users: sumi.add },
                        node: connection,
                    });
                }
                if (sumi.remove.length > 0) {
                    await this.nodesQueuesService.removeUsersFromNode({
                        data: { users: sumi.remove },
                        node: connection,
                    });
                }
            }

            return;
        } catch (error) {
            this.logger.error(`Error in Event AddUserToNodeHandler: ${error}`);
        }
    }

    private resolveInboundType(inbound: ConfigProfileInboundEntity): string {
        if (inbound.type === 'shadowsocks' && isSS2022Method(inbound.rawInbound)) {
            return 'shadowsocks22';
        }
        return inbound.type;
    }
}

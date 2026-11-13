import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { NodesModule } from '@modules/nodes/nodes.module';
import { UsersModule } from '@modules/users/users.module';

import { BoltController } from './bolt.controller';
import { BoltService } from './bolt.service';
import { SumiAdminService } from './sumi-admin.service';
import { SumiRpcService } from './sumi-rpc.service';

@Module({
    imports: [CqrsModule, UsersModule, NodesModule],
    controllers: [BoltController],
    providers: [BoltService, SumiRpcService, SumiAdminService],
})
export class BoltModule {}

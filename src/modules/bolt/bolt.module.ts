import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { BoltController } from './bolt.controller';
import { BoltService } from './bolt.service';

@Module({
    imports: [CqrsModule],
    controllers: [BoltController],
    providers: [BoltService],
})
export class BoltModule {}

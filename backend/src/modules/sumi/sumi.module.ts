import { Global, Module } from '@nestjs/common';

import { SumiNodeClientsService } from './sumi-node-clients.service';
import { SumiSettingsService } from './sumi-settings.service';
import { SumiUsersRepository } from './sumi-users.repository';

/** Глобальный: ключи SUMI нужны раздаче клиентов нодам, учёту трафика и подписке. */
@Global()
@Module({
    providers: [SumiSettingsService, SumiUsersRepository, SumiNodeClientsService],
    exports: [SumiSettingsService, SumiUsersRepository, SumiNodeClientsService],
})
export class SumiModule {}

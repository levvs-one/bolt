import { Body, Controller, HttpStatus, Param, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Endpoint } from '@common/decorators/base-endpoint';
import { Roles } from '@common/decorators/roles/roles';
import { ApiScopeResource } from '@common/decorators/scopes';
import { HttpExceptionFilter } from '@common/exception/http-exception.filter';
import { JwtDefaultGuard } from '@common/guards/jwt-guards/def-jwt-guard';
import { RolesGuard } from '@common/guards/roles';
import { ScopesGuard } from '@common/guards/scopes';
import { errorHandler } from '@common/helpers/error-handler.helper';
import { BOLT_CONTROLLER, CONTROLLERS_INFO } from '@libs/contracts/api';
import {
    GenerateRealityKeysCommand,
    GetSumiSettingsCommand,
    GetUserSumiCommand,
    SetSumiAutoSelectionCommand,
    SumiRpcCommand,
    UpdateSumiSettingsCommand,
    UpdateUserSumiCommand,
} from '@libs/contracts/commands';
import { ROLE } from '@libs/contracts/constants';

import { BoltService } from './bolt.service';
import {
    GenerateRealityKeysResponseDto,
    GetSumiSettingsResponseDto,
    GetUserSumiResponseDto,
    SetSumiAutoSelectionRequestDto,
    SetSumiAutoSelectionResponseDto,
    SumiRpcRequestDto,
    SumiRpcResponseDto,
    UpdateSumiSettingsRequestDto,
    UpdateSumiSettingsResponseDto,
    UpdateUserSumiRequestDto,
    UpdateUserSumiResponseDto,
    UserSumiParamDto,
} from './dtos';
import { SumiAdminService } from './sumi-admin.service';
import { SumiRpcService } from './sumi-rpc.service';

@ApiBearerAuth('Authorization')
@ApiScopeResource(CONTROLLERS_INFO.BOLT.resource)
@ApiTags(CONTROLLERS_INFO.BOLT.tag)
@Roles(ROLE.ADMIN, ROLE.API)
@UseGuards(JwtDefaultGuard, RolesGuard, ScopesGuard)
@UseFilters(HttpExceptionFilter)
@Controller(BOLT_CONTROLLER)
export class BoltController {
    constructor(
        private readonly boltService: BoltService,
        private readonly sumiRpcService: SumiRpcService,
        private readonly sumiAdminService: SumiAdminService,
    ) {}

    @Endpoint({
        command: GenerateRealityKeysCommand,
        httpCode: HttpStatus.OK,
        type: GenerateRealityKeysResponseDto,
    })
    async generateRealityKeys(): Promise<GenerateRealityKeysResponseDto> {
        const data = errorHandler(this.boltService.generateRealityKeys());

        return { response: data };
    }

    /** Ответ — ровно то, что отдавал `sumi api`: бот разбирает его тем же кодом. */
    @Endpoint({
        command: SumiRpcCommand,
        httpCode: HttpStatus.OK,
        type: SumiRpcResponseDto,
    })
    async sumiRpc(@Body() body: SumiRpcRequestDto): Promise<SumiRpcResponseDto> {
        return (await this.sumiRpcService.call(body)) as SumiRpcResponseDto;
    }

    @Endpoint({
        command: GetSumiSettingsCommand,
        httpCode: HttpStatus.OK,
        type: GetSumiSettingsResponseDto,
    })
    async getSumiSettings(): Promise<GetSumiSettingsResponseDto> {
        return { response: errorHandler(await this.sumiAdminService.getSettings()) };
    }

    @Endpoint({
        command: UpdateSumiSettingsCommand,
        httpCode: HttpStatus.OK,
        type: UpdateSumiSettingsResponseDto,
    })
    async updateSumiSettings(
        @Body() body: UpdateSumiSettingsRequestDto,
    ): Promise<UpdateSumiSettingsResponseDto> {
        return { response: errorHandler(await this.sumiAdminService.updateSettings(body)) };
    }

    @Endpoint({
        command: SetSumiAutoSelectionCommand,
        httpCode: HttpStatus.OK,
        type: SetSumiAutoSelectionResponseDto,
    })
    async setSumiAutoSelection(
        @Body() body: SetSumiAutoSelectionRequestDto,
    ): Promise<SetSumiAutoSelectionResponseDto> {
        return {
            response: errorHandler(await this.sumiAdminService.setAutoSelection(body.hostUuid)),
        };
    }

    @Endpoint({
        command: GetUserSumiCommand,
        httpCode: HttpStatus.OK,
        type: GetUserSumiResponseDto,
    })
    async getUserSumi(@Param() param: UserSumiParamDto): Promise<GetUserSumiResponseDto> {
        return {
            response: errorHandler(await this.sumiAdminService.getUser(BigInt(param.userId))),
        };
    }

    @Endpoint({
        command: UpdateUserSumiCommand,
        httpCode: HttpStatus.OK,
        type: UpdateUserSumiResponseDto,
    })
    async updateUserSumi(
        @Param() param: UserSumiParamDto,
        @Body() body: UpdateUserSumiRequestDto,
    ): Promise<UpdateUserSumiResponseDto> {
        return {
            response: errorHandler(
                await this.sumiAdminService.updateUser(BigInt(param.userId), body),
            ),
        };
    }
}

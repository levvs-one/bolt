import { Controller, HttpStatus, UseFilters, UseGuards } from '@nestjs/common';
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
import { GenerateRealityKeysCommand } from '@libs/contracts/commands';
import { ROLE } from '@libs/contracts/constants';

import { BoltService } from './bolt.service';
import { GenerateRealityKeysResponseDto } from './dtos';

@ApiBearerAuth('Authorization')
@ApiScopeResource(CONTROLLERS_INFO.BOLT.resource)
@ApiTags(CONTROLLERS_INFO.BOLT.tag)
@Roles(ROLE.ADMIN, ROLE.API)
@UseGuards(JwtDefaultGuard, RolesGuard, ScopesGuard)
@UseFilters(HttpExceptionFilter)
@Controller(BOLT_CONTROLLER)
export class BoltController {
    constructor(private readonly boltService: BoltService) {}

    @Endpoint({
        command: GenerateRealityKeysCommand,
        httpCode: HttpStatus.OK,
        type: GenerateRealityKeysResponseDto,
    })
    async generateRealityKeys(): Promise<GenerateRealityKeysResponseDto> {
        const data = errorHandler(this.boltService.generateRealityKeys());

        return { response: data };
    }
}

import { createZodDto } from 'nestjs-zod';

import {
    GetSumiSettingsCommand,
    GetUserSumiCommand,
    SetSumiAutoSelectionCommand,
    SumiRpcCommand,
    UpdateSumiSettingsCommand,
    UpdateUserSumiCommand,
} from '@libs/contracts/commands';

export class SumiRpcRequestDto extends createZodDto(SumiRpcCommand.RequestSchema) {}
export class SumiRpcResponseDto extends createZodDto(SumiRpcCommand.ResponseSchema) {}

export class GetSumiSettingsResponseDto extends createZodDto(
    GetSumiSettingsCommand.ResponseSchema,
) {}
export class UpdateSumiSettingsRequestDto extends createZodDto(
    UpdateSumiSettingsCommand.RequestSchema,
) {}
export class UpdateSumiSettingsResponseDto extends createZodDto(
    UpdateSumiSettingsCommand.ResponseSchema,
) {}

export class UserSumiParamDto extends createZodDto(GetUserSumiCommand.RequestParamSchema) {}
export class GetUserSumiResponseDto extends createZodDto(GetUserSumiCommand.ResponseSchema) {}
export class UpdateUserSumiRequestDto extends createZodDto(UpdateUserSumiCommand.RequestSchema) {}
export class UpdateUserSumiResponseDto extends createZodDto(UpdateUserSumiCommand.ResponseSchema) {}

export class SetSumiAutoSelectionRequestDto extends createZodDto(
    SetSumiAutoSelectionCommand.RequestSchema,
) {}
export class SetSumiAutoSelectionResponseDto extends createZodDto(
    SetSumiAutoSelectionCommand.ResponseSchema,
) {}

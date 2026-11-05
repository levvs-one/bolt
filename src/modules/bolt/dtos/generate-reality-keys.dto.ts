import { createZodDto } from 'nestjs-zod';

import { GenerateRealityKeysCommand } from '@libs/contracts/commands';

export class GenerateRealityKeysResponseDto extends createZodDto(
    GenerateRealityKeysCommand.ResponseSchema,
) {}

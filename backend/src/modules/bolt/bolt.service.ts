import { generateKeyPairSync, randomBytes } from 'node:crypto';

import { Injectable, Logger } from '@nestjs/common';

import { fail, ok, TResult } from '@common/types';
import { ERRORS } from '@libs/contracts/constants/errors';

// Короткие ID Reality: Xray принимает чётное число hex-символов длиной до 16.
const SHORT_ID_BYTE_LENGTHS = [8, 4, 2] as const;

export interface IRealityKeys {
    privateKey: string;
    publicKey: string;
    shortIds: string[];
}

@Injectable()
export class BoltService {
    private readonly logger = new Logger(BoltService.name);

    public generateRealityKeys(): TResult<IRealityKeys> {
        try {
            const { privateKey, publicKey } = generateKeyPairSync('x25519');
            const privateJwk = privateKey.export({ format: 'jwk' });
            const publicJwk = publicKey.export({ format: 'jwk' });

            if (!privateJwk.d || !publicJwk.x) {
                return fail(ERRORS.INTERNAL_SERVER_ERROR);
            }

            // JWK кодирует ключи в base64url без паддинга — ровно тот формат, что ждёт Xray.
            return ok({
                privateKey: privateJwk.d,
                publicKey: publicJwk.x,
                shortIds: SHORT_ID_BYTE_LENGTHS.map((length) => randomBytes(length).toString('hex')),
            });
        } catch (error) {
            this.logger.error(error);
            return fail(ERRORS.INTERNAL_SERVER_ERROR);
        }
    }
}

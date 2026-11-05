import { z } from 'zod';

import { BOLT_ROUTES, REST_API } from '../../api';
import { getEndpointDetails } from '../../constants';

export namespace GenerateRealityKeysCommand {
    export const url = REST_API.BOLT.GENERATE_REALITY_KEYS;
    export const TSQ_url = url;

    export const endpointDetails = getEndpointDetails(
        BOLT_ROUTES.GENERATE_REALITY_KEYS,
        'post',
        'Generate X25519 key pair and short IDs for an Xray Reality inbound',
        { scope: 'create', kind: 'write' },
    );

    export const ResponseSchema = z.object({
        response: z.object({
            privateKey: z.string(),
            publicKey: z.string(),
            shortIds: z.array(z.string()),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}

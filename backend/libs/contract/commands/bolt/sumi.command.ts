import { z } from 'zod';

import { BOLT_ROUTES, REST_API } from '../../api';
import { getEndpointDetails } from '../../constants';
import { SumiSettingsSchema } from '../../models/sumi-settings.schema';

/**
 * Машинный интерфейс бота: тело и ответ — те же, что у `sumi api`
 * (`{"op": ..., ...}` → `{"ok": true, ...}` или `{"ok": false, "kind": ...}`).
 */
export namespace SumiRpcCommand {
    export const url = REST_API.BOLT.SUMI_RPC;
    export const TSQ_url = url;

    export const endpointDetails = getEndpointDetails(
        BOLT_ROUTES.SUMI_RPC,
        'post',
        'SUMI bot API: one operation per request, the same shape as `sumi api`',
        { scope: 'sumi-rpc', kind: 'write' },
    );

    export const RequestSchema = z.looseObject({ op: z.string() });
    export const ResponseSchema = z.looseObject({ ok: z.boolean() });

    export type Request = z.infer<typeof RequestSchema>;
    export type Response = z.infer<typeof ResponseSchema>;
}

export namespace GetSumiSettingsCommand {
    export const url = REST_API.BOLT.SUMI_SETTINGS;
    export const TSQ_url = url;

    export const endpointDetails = getEndpointDetails(
        BOLT_ROUTES.SUMI_SETTINGS,
        'get',
        'Get SUMI settings',
        { scope: 'sumi-settings-get', kind: 'read' },
    );

    export const ResponseSchema = z.object({ response: SumiSettingsSchema });
    export type Response = z.infer<typeof ResponseSchema>;
}

export namespace UpdateSumiSettingsCommand {
    export const url = REST_API.BOLT.SUMI_SETTINGS;
    export const TSQ_url = url;

    export const endpointDetails = getEndpointDetails(
        BOLT_ROUTES.SUMI_SETTINGS,
        'patch',
        'Update SUMI settings',
        { scope: 'sumi-settings-update', kind: 'write' },
    );

    export const RequestSchema = SumiSettingsSchema.partial();
    export const ResponseSchema = z.object({ response: SumiSettingsSchema });

    export type Request = z.infer<typeof RequestSchema>;
    export type Response = z.infer<typeof ResponseSchema>;
}

export const UserSumiSchema = z.object({
    enabled: z.boolean(),
    meteredLimitBytes: z.number().int().min(0),
    meteredUsedBytes: z.number().int().min(0),
    meteredBlocked: z.boolean(),
    personal: z.boolean(),
    title: z.string().max(32),
    announce: z.string().max(120),
    notice: z.string().max(64),
    proxyExtra: z.number().int().min(0).max(20),
});

export namespace GetUserSumiCommand {
    export const url = REST_API.BOLT.SUMI_USER;
    export const TSQ_url = url(':userId');

    export const endpointDetails = getEndpointDetails(
        BOLT_ROUTES.SUMI_USER(':userId'),
        'get',
        'Get SUMI fields of a user',
        { scope: 'sumi-user-get', kind: 'read' },
    );

    export const RequestParamSchema = z.object({ userId: z.string().regex(/^\d+$/) });
    export const ResponseSchema = z.object({ response: UserSumiSchema });

    export type RequestParam = z.infer<typeof RequestParamSchema>;
    export type Response = z.infer<typeof ResponseSchema>;
}

export namespace UpdateUserSumiCommand {
    export const url = REST_API.BOLT.SUMI_USER;
    export const TSQ_url = url(':userId');

    export const endpointDetails = getEndpointDetails(
        BOLT_ROUTES.SUMI_USER(':userId'),
        'patch',
        'Update SUMI fields of a user; enabling creates the credential seed',
        { scope: 'sumi-user-update', kind: 'write' },
    );

    export const RequestParamSchema = z.object({ userId: z.string().regex(/^\d+$/) });
    export const RequestSchema = UserSumiSchema.partial();
    export const ResponseSchema = z.object({ response: UserSumiSchema });

    export type RequestParam = z.infer<typeof RequestParamSchema>;
    export type Request = z.infer<typeof RequestSchema>;
    export type Response = z.infer<typeof ResponseSchema>;
}

/** Внешний замерщик сообщает, какой вход сейчас лучший для «Авто». */
export namespace SetSumiAutoSelectionCommand {
    export const url = REST_API.BOLT.SUMI_AUTO_SELECTION;
    export const TSQ_url = url;

    export const endpointDetails = getEndpointDetails(
        BOLT_ROUTES.SUMI_AUTO_SELECTION,
        'post',
        'Set the host measurements chose for the Auto profile',
        { scope: 'sumi-auto-selection', kind: 'write' },
    );

    export const RequestSchema = z.object({ hostUuid: z.uuid().nullable() });
    export const ResponseSchema = z.object({ response: SumiSettingsSchema });

    export type Request = z.infer<typeof RequestSchema>;
    export type Response = z.infer<typeof ResponseSchema>;
}

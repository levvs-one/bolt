import { Request } from 'express';
import { createHash } from 'node:crypto';

import { truncateHeader } from '../truncate-header.util';

export interface HwidHeaders {
    hwid: string;
    platform?: string;
    osVersion?: string;
    deviceModel?: string;
    userAgent?: string;
}

const HWID_REGEX = /^[a-zA-Z0-9=-]{10,64}$/;

/** Приставка ключа устройства, собранного из модели: так его видно в списке устройств. */
const MODEL_KEY_PREFIX = 'm-';
const MODEL_KEY_HASH_LENGTH = 40;
/** Сколько от каждого заголовка входит в ключ — как у sumi, чтобы перенесённые устройства узнавались. */
const MODEL_KEY_PARTS = { userAgent: 64, deviceModel: 48, platform: 24, osVersion: 24 } as const;

export function extractHwidHeaders(request: Request): HwidHeaders | null {
    const rawHwid = request.headers['x-hwid'];
    const sentHwid = Array.isArray(rawHwid) ? rawHwid[0] : rawHwid;

    const platform = truncateHeader(request.headers['x-device-os']);
    const osVersion = truncateHeader(request.headers['x-ver-os']);
    const deviceModel = truncateHeader(request.headers['x-device-model']);
    const userAgent = truncateHeader(request.headers['user-agent']);

    let hwid = sentHwid && HWID_REGEX.test(sentHwid) ? sentHwid : null;

    // Часть клиентов идентификатора не шлёт, но называет модель. Ключ из клиента,
    // модели и версии ОС устойчив между запросами — так считал устройства sumi.
    if (!hwid && deviceModel) {
        hwid =
            MODEL_KEY_PREFIX +
            createHash('sha256')
                .update(
                    [
                        (userAgent ?? '').trim().slice(0, MODEL_KEY_PARTS.userAgent),
                        deviceModel.trim().slice(0, MODEL_KEY_PARTS.deviceModel),
                        (platform ?? '').trim().slice(0, MODEL_KEY_PARTS.platform),
                        (osVersion ?? '').trim().slice(0, MODEL_KEY_PARTS.osVersion),
                    ].join('|'),
                )
                .digest('hex')
                .slice(0, MODEL_KEY_HASH_LENGTH);
    }

    if (!hwid) {
        return null;
    }

    return { hwid, platform, osVersion, deviceModel, userAgent };
}

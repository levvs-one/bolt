import { createHash } from 'node:crypto';

/**
 * Ключи SUMI. Выработка повторяет `sumi` байт в байт: после переезда у людей
 * остаются те же UUID, что уже лежат в их клиентах.
 */

/** Email второго клиента на ноде: `<id>~white`, `<id>~de4x2`. Агент ноды кладёт userId в email. */
export const CLIENT_SUFFIX_SEPARATOR = '~';

/** Ключ «Мобильной связи». Только трафик этого клиента считается в квоту. */
export const METERED_SUFFIX = 'white';

const UUID_VERSION_5 = 0x50;
const UUID_VARIANT_RFC4122 = 0x80;

/** UUID версии 5 (RFC 4122): то же, что `uuid.uuid5` в Python. */
export function uuidV5(namespace: string, name: string): string {
    const namespaceBytes = Buffer.from(namespace.replace(/-/g, ''), 'hex');
    const hash = createHash('sha1')
        .update(namespaceBytes)
        .update(Buffer.from(name, 'utf8'))
        .digest();

    hash[6] = (hash[6] & 0x0f) | UUID_VERSION_5;
    hash[8] = (hash[8] & 0x3f) | UUID_VARIANT_RFC4122;

    const hex = hash.subarray(0, 16).toString('hex');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function entryUuid(seed: string, username: string, entryId: string): string {
    return uuidV5(seed, `sumi-user:${username}:entry:${entryId}`);
}

export function meteredUuid(seed: string, username: string): string {
    return uuidV5(seed, `sumi-user:${username}:white`);
}

/** Общий ключ на все ноды. У перенесённых из sumi он же лежит в `users.vless_uuid`. */
export function sharedUuid(seed: string, username: string): string {
    return uuidV5(seed, `sumi-user:${username}:bolt`);
}

/** Имя входа, из которого выводится ключ: тег инбаунда без приставки. */
export function entryIdFromTag(tag: string, prefix: string): string {
    return prefix && tag.startsWith(prefix) ? tag.slice(prefix.length) : tag;
}

export function clientEmail(userId: bigint | string, suffix: string): string {
    return `${userId}${CLIENT_SUFFIX_SEPARATOR}${suffix}`;
}

/** Разбор email клиента из статистики ноды. Чужие записи (`transit-cdn`) — null. */
export function parseClientEmail(email: string): { userId: bigint; suffix: string | null } | null {
    const separator = email.indexOf(CLIENT_SUFFIX_SEPARATOR);
    const id = separator === -1 ? email : email.slice(0, separator);

    if (!/^\d+$/.test(id)) return null;

    return {
        userId: BigInt(id),
        suffix: separator === -1 ? null : email.slice(separator + 1),
    };
}

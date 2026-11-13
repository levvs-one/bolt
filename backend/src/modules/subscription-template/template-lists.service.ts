import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

import { Injectable } from '@nestjs/common';

const EXT_PREFIX = 'ext:';

/** Списки меняют руками в панели; подписку за ними отдают сотни раз в минуту. */
const CACHE_TTL_MS = 5_000;

type TListItems = (string | number)[];

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Общие списки (`ext:имя`) внутри шаблонов подписки. Строка `ext:ads` в массиве
 * правил заменяется содержимым списка — так список рекламы или сайтов РФ
 * правится в одном месте, а не в каждом шаблоне.
 */
@Injectable()
export class TemplateListsService {
    private cached: { lists: Map<string, TListItems>; expiresAt: number } | null = null;

    constructor(private readonly prisma: TransactionHost<TransactionalAdapterPrisma>) {}

    public async expand<T>(template: T): Promise<T> {
        if (!this.hasReferences(template)) return template;

        const lists = await this.lists();
        return this.expandValue(template, lists) as T;
    }

    private async lists(): Promise<Map<string, TListItems>> {
        if (this.cached && this.cached.expiresAt > Date.now()) return this.cached.lists;

        const rows = await this.prisma.tx.sharedLists.findMany();
        const lists = new Map<string, TListItems>();
        for (const row of rows) {
            const config = row.config as { items?: unknown };
            if (Array.isArray(config.items)) lists.set(row.name, config.items as TListItems);
        }

        this.cached = { lists, expiresAt: Date.now() + CACHE_TTL_MS };
        return lists;
    }

    private hasReferences(value: unknown): boolean {
        if (typeof value === 'string') return value.startsWith(EXT_PREFIX);
        if (Array.isArray(value)) return value.some((item) => this.hasReferences(item));
        if (isRecord(value)) return Object.values(value).some((item) => this.hasReferences(item));
        return false;
    }

    private expandValue(value: unknown, lists: Map<string, TListItems>): unknown {
        if (Array.isArray(value)) {
            return value.flatMap((item) => {
                if (typeof item === 'string' && item.startsWith(EXT_PREFIX)) {
                    // Неизвестный список оставляем как есть: пусть ошибку покажет клиент,
                    // а не пустое правило, молча пропускающее всё.
                    return lists.get(item.slice(EXT_PREFIX.length)) ?? [item];
                }
                return [this.expandValue(item, lists)];
            });
        }

        if (isRecord(value)) {
            return Object.fromEntries(
                Object.entries(value).map(([key, nested]) => [
                    key,
                    this.expandValue(nested, lists),
                ]),
            );
        }

        return value;
    }
}

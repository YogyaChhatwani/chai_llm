import { Prisma } from "../generated/prisma/client.js";
import prisma from "../lib/db.js";
import { ListSourcesQuery } from "../validators/source.validator.js";

export const sourceSelect = {
    id: true,
    workspaceId: true,
    type: true,
    title: true,
    description: true,
    url: true,
    status: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
} as const;

export type SourceRecord = Prisma.SourceGetPayload<{
    select: typeof sourceSelect;
}>;

export type CreateSourceData = {
    workspaceId: string;
    type: SourceRecord["type"];
    title?: string;
    description?: string | null;
    url?: string | null;
    status?: SourceRecord["status"];
    metadata?: Prisma.InputJsonValue;
    content?: string | null;
};


export function findSourcesByWorkspaceId(

    workspaceId: string,
    filters: ListSourcesQuery = {},
) {
    const where: Prisma.SourceWhereInput = { workspaceId };

    if (filters.type) {
        where.type = filters.type;
    }

    if (filters.status) {
        where.status = filters.status;
    }

    if (filters.query) {
        where.OR = [
            { title: { contains: filters.query, mode: "insensitive" } },
            { url: { contains: filters.query, mode: "insensitive" } },
        ];
    }

    return prisma.source.findMany({
        where,
        select: sourceSelect,
        orderBy: { createdAt: "desc" },
    });

}

export function findSourceByIdAndWorkspaceId(sourceId: string, workspaceId: string) {
    return prisma.source.findFirst({
        where: { id: sourceId, workspaceId },
        select: sourceSelect,
    });
}

export function findSourceById(sourceId: string) {
    return prisma.source.findUnique({
        where: { id: sourceId },
        select: sourceSelect,
    });
}

export function createSourceRecord(data: CreateSourceData) {
    return prisma.source.create({
        data: {
            workspaceId: data.workspaceId,
            type: data.type,
            title: data.title,
            // Pipeline reads text from `description` (no separate content column).
            description: data.description ?? data.content ?? null,
            url: data.url,
            status: data.status,
            metadata: data.metadata,
        },
        select: sourceSelect,
    });
}

export function updateSourceRecord(sourceId: string, data: {
    description?: string | null;
    status?: SourceRecord["status"];
    metadata?: Prisma.InputJsonValue;
}) {
    return prisma.source.update({
        where: { id: sourceId },
        data,
        select: sourceSelect,
    });
}

export function deleteSourceRecord(sourceId: string) {
    return prisma.source.delete({
        where: { id: sourceId },
    });
}
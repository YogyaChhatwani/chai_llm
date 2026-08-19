import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../lib/db.js";

export const artifactSelect = {
    id: true,
    workspaceId: true,
    type: true,
    title: true,
    content: true,
    sourceIds: true,
    status: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
} as const;

export type ArtifactRecord = Prisma.ArtifactGetPayload<{
    select: typeof artifactSelect;
}>;

export type CreateArtifactData = {
    workspaceId: string;
    type: ArtifactRecord["type"];
    title: string;
    sourceIds: string[];
    status?: ArtifactRecord["status"];
    metadata?: Prisma.InputJsonValue;
};

export function findArtifactsByWorkspaceId(workspaceId: string) {
    return prisma.artifact.findMany({
        where: { workspaceId },
        select: artifactSelect,
        orderBy: { createdAt: "desc" },
    });
}

export function findArtifactByIdAndWorkspaceId(
    artifactId: string,
    workspaceId: string,
) {
    return prisma.artifact.findFirst({
        where: { id: artifactId, workspaceId },
        select: artifactSelect,
    });
}

export function createArtifactRecord(data: CreateArtifactData) {
    return prisma.artifact.create({
        data: {
            workspaceId: data.workspaceId,
            type: data.type,
            title: data.title,
            sourceIds: data.sourceIds,
            status: data.status ?? "PENDING",
            metadata: data.metadata,
        },
        select: artifactSelect,
    });
}

export function updateArtifactRecord(
    artifactId: string,
    data: {
        title?: string;
        content?: Prisma.InputJsonValue;
        status?: ArtifactRecord["status"];
        metadata?: Prisma.InputJsonValue;
    },
) {
    return prisma.artifact.update({
        where: { id: artifactId },
        data,
        select: artifactSelect,
    });
}

export async function deleteArtifactRecord(artifactId: string) {
    await prisma.artifact.delete({
        where: { id: artifactId },
    });
}

export function findArtifactById(artifactId: string) {
    return prisma.artifact.findUnique({
        where: { id: artifactId },
        select: artifactSelect,
    });
}
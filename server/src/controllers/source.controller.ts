
import { Request, Response } from "express";
import { getZodFieldErrors } from "../utils/zod-error.js";
import { workspaceIdParamSchema } from "../validators/workspace.validator.js";
import { ValidationError } from "../types/app-error.js";
import { createSourceSchema, listSourcesQuerySchema, sourceIdParamSchema } from "../validators/source.validator.js";
import { createTextOrMarkdownSource, deleteSourceForWorkspace, getSourceForWorkspace, listSourcesForWorkspace } from "../services/source.services.js";
import { getWorkspaceByIdForUser } from "../services/workspace.services.js";

function parseWorkspaceId(params: Request["params"]) {
    const parsed = workspaceIdParamSchema.safeParse(params);
    if (!parsed.success) {
        throw new ValidationError(
            "Validation failed",
            getZodFieldErrors(parsed.error),
        );
    }
    return parsed.data;
}
export function parseSourceParams(params: Request["params"]) {
    const parsed = sourceIdParamSchema.safeParse(params);
    if (!parsed.success) {
        throw new ValidationError(
            "Validation failed",
            getZodFieldErrors(parsed.error),
        );
    }
    return parsed.data;
}

function parseListQuery(query: Request["query"]) {
    const parsed = listSourcesQuerySchema.safeParse(query);
    if (!parsed.success) {
        throw new ValidationError(
            "Validation failed",
            getZodFieldErrors(parsed.error),
        );
    }
    return parsed.data;
}

function parseCreateBody(body: Request["body"]) {
    const parsed = createSourceSchema.safeParse(body);
    if (!parsed.success) {
        throw new ValidationError("Validation failed", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
}
export async function listSources(req: Request, res: Response) {
    const { workspaceId } = parseWorkspaceId(req.params);
    const filters = parseListQuery(req.query);
    const sources = await listSourcesForWorkspace(workspaceId,req.session.user.id, filters);
    res.json(sources);
}
export async function createSource(req: Request, res: Response) {
    const { workspaceId } = parseWorkspaceId(req.params);
    const input = parseCreateBody(req.body);
    const source = await createTextOrMarkdownSource(workspaceId, req.session.user.id, input);
    res.status(201).json(source);
}

export async function getSource(req: Request, res: Response) {
    const { workspaceId, sourceId } = sourceIdParamSchema.parse(req.params);
    const source = await getSourceForWorkspace(
        workspaceId,
        sourceId,
        req.session.user.id,
    );
    res.json(source);
}
export async function deleteSource(req: Request, res: Response) {
    const { workspaceId, sourceId } = sourceIdParamSchema.parse(req.params);
    await deleteSourceForWorkspace(
        workspaceId,
        sourceId,
        req.session.user.id,
    );
    res.status(204).send();
}
export async function bulkDeleteSources(req: Request, res: Response) {
    const { workspaceId, sourceId} = sourceIdParamSchema.parse(req.params);
    await getWorkspaceByIdForUser(workspaceId, req.session.user.id);

    for (const id of sourceId) {
        await deleteSourceForWorkspace(workspaceId, id, req.session.user.id);
    }
}
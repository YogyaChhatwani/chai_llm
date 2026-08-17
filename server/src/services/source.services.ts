import { uploadPdfToCloudinary } from "../lib/cloudinary.js";
import { scrapeWebsite } from "../lib/firecrawl.js";
import { extractPdfFromBuffer } from "../lib/pdf.js";
import { enqueueSourceProcessing } from "../lib/source-events.js";
import { fetchYoutubeTranscript } from "../lib/youtube.js";
import {
    createSourceRecord,
    deleteSourceRecord,
    findSourceByIdAndWorkspaceId,
    findSourcesByWorkspaceId,
    SourceRecord,
} from "../repository/source.repository.js";
import { NotFoundError } from "../types/app-error.js";
import { CreateSourceInput, ImportWebsiteInput, ImportYoutubeInput, ListSourcesQuery } from "../validators/source.validator.js";
import { getWorkspaceByIdForUser } from "./workspace.services.js";
// Why: the source repo only filters by workspaceId. It never checks “does this userId own that workspace?” That check lives in getWorkspaceByIdForUser.
export async function listSourcesForWorkspace(
    workspaceId: string,
    userId: string,
    filters: ListSourcesQuery = {},
) {
    await getWorkspaceByIdForUser(workspaceId, userId);
    return findSourcesByWorkspaceId(workspaceId, filters);
}

export async function createAndProcessSource(data: Parameters<typeof createSourceRecord>[0],) {
    const source = await createSourceRecord(data);

    await enqueueSourceProcessing({
        sourceId: source.id,
        workspaceId: source.workspaceId,
    });
    return source;
}

export async function createTextOrMarkdownSource(
    workspaceId: string,
    userId: string,
    input: CreateSourceInput,
) {
    await getWorkspaceByIdForUser(workspaceId, userId);

    // return createAndProcessSource({
    //     workspaceId,
    //     type: input.type,
    //     title: input.title,
    //     content: input.content,
    //     status: "PENDING",
    // });
}

export async function getSourceForWorkspace(
    workspaceId: string,
    sourceId: string,
    userId: string,
): Promise<SourceRecord> {
    await getWorkspaceByIdForUser(workspaceId, userId);

    const source = await findSourceByIdAndWorkspaceId(sourceId, workspaceId);

    if (!source) {
        throw new NotFoundError("Source not found");
    }

    return source;
}

export async function bulkDeleteSourcesForWorkspace(
    workspaceId: string,
    userId: string,
    sourceIds: string[],
) {
    await getWorkspaceByIdForUser(workspaceId, userId);

    for (const sourceId of sourceIds) {
        await deleteSourceForWorkspace(workspaceId, sourceId, userId);
    }
}


export async function deleteSourceForWorkspace(
    workspaceId: string,
    sourceId: string,
    userId: string,
) {
    await getSourceForWorkspace(workspaceId, sourceId, userId);
   // await removeSourceFromIndex(workspaceId, sourceId);
    await deleteSourceRecord(sourceId);
}

export async function importWebsiteUrl(workspaceId: string, userId: string, input: ImportWebsiteInput) {

    await getWorkspaceByIdForUser(workspaceId, userId);

    const scrapedData = await scrapeWebsite(input.url);

    return createAndProcessSource({
        workspaceId,
        type: "WEBSITE",
        title: input.title,
        content: scrapedData.markdown,
        status: "PENDING",
        url: scrapedData.sourceUrl,
    });
}

export async function uploadPdfSource(
    workspaceId: string,
    userId: string,
    file: Express.Multer.File,
    title?: string,
) {
    await getWorkspaceByIdForUser(workspaceId, userId);

    const uploadFile = await uploadPdfToCloudinary(
        file.buffer,
        file.originalname,
    );

    let content: string | null = null;
    let pageCount: number | undefined;

    try {
        const extracted = await extractPdfFromBuffer(file.buffer);
        content = extracted.text;
        pageCount = extracted.pageCount;
    } catch {
        // Inngest will retry extraction from Cloudinary if upload-time parse fails.
    }

    return createAndProcessSource({
        workspaceId,
        type: "PDF",
        title: title?.trim() || file.originalname.replace(/\.pdf$/i, ""),
        content,
        status: "PENDING",
        metadata: {
            fileUrl: uploadFile.secureUrl,
            fileName: uploadFile.originalFilename,
            fileSize: uploadFile.bytes,
            publicId: uploadFile.publicId,
            resourceType: uploadFile.resourceType,
            pageCount,
        },
    });
}

export async function importYoutubeUrl(workspaceId: string, userId: string, input: ImportYoutubeInput) {
    await getWorkspaceByIdForUser(workspaceId, userId);
    const transcript = await fetchYoutubeTranscript(input.url);
    return createAndProcessSource({
        workspaceId,
        type: "YOUTUBE",
        title: input.title || `Youtube Video ${transcript.videoId}`,
        content: transcript.content,
        status: "PENDING",
        metadata: {
            videoId: transcript.videoId
                },
    });
}
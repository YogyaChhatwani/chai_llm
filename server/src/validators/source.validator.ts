import { z } from "zod";

export const SOURCE_TYPES = z.enum([
    "YOUTUBE",
    "WEBSITE",
    "PDF",
    "TEXT",
    "MARKDOWN"
]);

export const SOURCE_STATUS = z.enum([
    "PENDING",
    "PROCESSING",
    "COMPLETED",
    "FAILED"
]);

 export const createTextSourceSchema = z.object({
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().max(500).optional(),
    type: z.literal("TEXT"),
 });

 export const createMarkdownSourceSchema = z.object({
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().max(500).optional(),
    type: z.literal("MARKDOWN"),
   
 });

 export const workspaceIdParamSchema = z.object({
   workspaceId: z.string().trim().min(1),
});
 export const sourceIdParamSchema = z.object({
    workspaceId: z.string().trim().min(1),
    sourceId: z.string().trim().min(1),
 });
 
 export const createSourceSchema = z.discriminatedUnion("type", [
    createTextSourceSchema,
    createMarkdownSourceSchema,
 ]);
 export const importWebsiteSchema = z.object({
    title:z.string().trim().min(1).optional(),
    url: z.string().trim().min(1, "URL is required"),
 });

 export const listSourcesQuerySchema = z.object({
    query: z.string().trim().optional(),
    type: SOURCE_TYPES.optional(),
    status: SOURCE_STATUS.optional(),
 })

 export const bulkDeleteSourcesSchema = z.object({
    sourceIds: z.array(z.string().trim().min(1)).min(1),
});
export const importYoutubeSchema = z.object({
    title:z.string().trim().min(1).optional(),
    url:z.string().trim().min(1, "URL is required"),
});


export type CreateSourceInput = z.infer<typeof createSourceSchema>;
export type ListSourcesQuery = z.infer<typeof listSourcesQuerySchema>;
export type ImportWebsiteInput = z.infer<typeof importWebsiteSchema>;
export type ImportYoutubeInput = z.infer<typeof importYoutubeSchema>;
export type BulkDeleteSourcesInput = z.infer<typeof bulkDeleteSourcesSchema>;
// export type ReprocessSourcesInput = z.infer<typeof reprocessSourcesSchema>;
// export type ImportWebSearchInput = z.infer<typeof importWebSearchSchema>;



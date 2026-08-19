import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { requireAuth } from "../middleware/require-auth.middleware.js";
import { bulkDeleteSources, createSource, deleteSource, getSource, importWebsite, importYoutube, listSources, uploadPdf } from "../controllers/source.controller.js";
import { uploadSinglePdf } from "../middleware/upload.middleware.js";

export const sourceRoutes = Router({ mergeParams: true });
sourceRoutes.use(requireAuth);

 sourceRoutes.get("/", asyncHandler(listSources));
 sourceRoutes.post("/upload", uploadSinglePdf, asyncHandler(uploadPdf));
 sourceRoutes.post("/import/website", asyncHandler(importWebsite));
 sourceRoutes.post("/import/youtube", asyncHandler(importYoutube));
 sourceRoutes.post("/", asyncHandler(createSource));
sourceRoutes.get("/:sourceId", asyncHandler(getSource));
sourceRoutes.post("/bulk-delete", asyncHandler(bulkDeleteSources));
 sourceRoutes.delete("/:sourceId", asyncHandler(deleteSource));
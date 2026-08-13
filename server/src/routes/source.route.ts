import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { requireAuth } from "../middleware/require-auth.middleware.js";
import { bulkDeleteSources, createSource, deleteSource, getSource, listSources } from "../controllers/source.controller.js";

export const sourceRoutes = Router();
sourceRoutes.use(requireAuth);

 sourceRoutes.get("/", asyncHandler(listSources));
 sourceRoutes.post("/", asyncHandler(createSource));
sourceRoutes.get("/:sourceId", asyncHandler(getSource));
sourceRoutes.post("/bulk-delete", asyncHandler(bulkDeleteSources));
 sourceRoutes.delete("/:sourceId", asyncHandler(deleteSource));
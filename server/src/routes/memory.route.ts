import { Router } from "express";
import { requireAuth } from "../middleware/require-auth.middleware.js";
import { createMemory, deleteMemory, listMemories, updateMemory } from "../controllers/memory.controller.js";

export const memoryRoutes = Router();

memoryRoutes.use(requireAuth);

memoryRoutes.get("/", listMemories);
memoryRoutes.post("/", createMemory);
memoryRoutes.patch("/:memoryId", updateMemory);
memoryRoutes.delete("/:memoryId", deleteMemory);

export default memoryRoutes;
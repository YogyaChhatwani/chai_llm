import { sourceRoutes } from "./source.route.js";
import { workspaceRoutes } from "./workspace.route.js";
import { chatRoutes, conversationRoutes } from "./chat.route.js";
import type { Express } from "express";
import memoryRoutes from "./memory.route.js";
import { artifactRoutes } from "./artifact.route.js";

export function registerRoutes(app: Express) {
    workspaceRoutes.use("/:workspaceId/sources", sourceRoutes);
    workspaceRoutes.use("/:workspaceId/conversations", conversationRoutes);
    workspaceRoutes.use("/:workspaceId/chat", chatRoutes);
    workspaceRoutes.use("/:workspaceId/artifacts", artifactRoutes);
    app.use("/api/v1/workspaces", workspaceRoutes);
    app.use("/api/v1/memory", memoryRoutes);
}
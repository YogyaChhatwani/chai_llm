import { z } from "zod";
import { ValidationError } from "../types/app-error.js";
import { findSourcesByWorkspaceId, SourceRecord } from "./source.repository.js";
import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { CHAT_MODEL } from "../lib/ai-config.js";
import { ArtifactRecord } from "./artifact.repository.js";

const MAX_CONTEXT_CHARS = 120_000;

const flashcardsSchema = z.object({
    cards: z
        .array(
            z.object({
                front: z.string(),
                back: z.string(),
            }),
        )
        .min(3)
        .max(30),
});

const quizSchema = z.object({
    questions: z
        .array(
            z.object({
                question: z.string(),
                options: z.array(z.string()).min(2).max(5),
                correctIndex: z.number().int().min(0),
                explanation: z.string(),
            }),
        )
        .min(3)
        .max(15),
});

const mindmapNodeSchema: z.ZodType = z.object({
    id: z.string(),
    label: z.string(),
    category: z.enum(["root", "domain", "module", "component"]).optional(),
    files: z.array(z.string()).optional(),
    apis: z.array(z.string()).optional(),
    dependencies: z.array(z.string()).optional(),
    issues: z.array(z.string()).optional(),
    complexity: z.enum(["low", "medium", "high"]).optional(),
    testCoverage: z.enum(["none", "partial", "good"]).optional(),
    children: z.lazy(() => z.array(mindmapNodeSchema)).optional(),
});

const mindmapSchema = z.object({
    root: mindmapNodeSchema,
});

const takeawaysSchema = z.object({
    items: z.array(z.string()).min(3).max(20),
});

const reportSchema = z.object({
    markdown: z.string(),
    sections: z.array(
        z.object({
            title: z.string(),
            content: z.string(),
        }),
    ),
});

export async function gatherSourceContext(
    workspaceId: string,
    sourceIds?: string[],
) {
    const sources = await findSourcesByWorkspaceId(workspaceId, {
        status: "COMPLETED",
    });

    const selected = sourceIds?.length
        ? sources.filter((source: SourceRecord) => sourceIds.includes(source.id))
        : sources;

    if (selected.length === 0) {
        throw new ValidationError(
            "No ready sources found. Add and process sources before generating learning tools.",
        );
    }

    const withContent = selected.flatMap((source: SourceRecord) => {
        const content = source.description?.trim();
        return content ? [{ title: source.title, content }] : [];
    });

    if (withContent.length === 0) {
        throw new ValidationError(
            "Selected sources have no extracted content yet.",
        );
    }

    const text = withContent
        .map((source: { title: string | null; content: string }) => `# ${source.title}\n\n${source.content}`)
        .join("\n\n---\n\n")
        .slice(0, MAX_CONTEXT_CHARS);

    return {
        text,
        sourceIds: selected.map((source: SourceRecord) => source.id),
    };
}

export async function generateArtifactContent(
    type: ArtifactRecord["type"],
    sourceText: string,
) {
    const system = [
        `You are Chaibook, an expert learning assistant generating a ${type.toLowerCase()} from workspace source materials.`,
        "Use ONLY the provided source content. Do not invent facts not supported by the sources.",
        "Be clear, educational, and well-structured.",
    ].join("\n");

    switch (type) {
        case "SUMMARY": {
            const result = await generateText({
                model: openai(CHAT_MODEL),
                system,
                prompt: `Write a comprehensive markdown summary of the following sources:\n\n${sourceText}`,
            });
            return { markdown: result.text };
        }
        case "TAKEAWAY" : {
            const result = await generateText({
                model: openai(CHAT_MODEL),
                system,
                output: Output.object({ schema: takeawaysSchema }),
                prompt: `Extract the most important key takeaways as concise bullet points from:\n\n${sourceText}`,
            });
            return result.output;
        }
        case "FLASHCARDS": {
            const result = await generateText({
                model: openai(CHAT_MODEL),
                system,
                output: Output.object({ schema: flashcardsSchema }),
                prompt: `Create study flashcards (front/back) covering the main concepts from:\n\n${sourceText}`,
            });
            return result.output;
        }
        case "QUIZ": {
            const result = await generateText({
                model: openai(CHAT_MODEL),
                system,
                output: Output.object({ schema: quizSchema }),
                prompt: `Create a multiple-choice quiz with explanations from:\n\n${sourceText}`,
            });
            return result.output;
        }
        case "MINDMAP": {
            const result = await generateText({
                model: openai(CHAT_MODEL),
                system: [
                    system,
                    "You are generating a project architecture mind map.",
                    "Structure it as a tree: root → domains (Frontend, Backend, Data, etc.) → modules → components.",
                    "For each node, include relevant metadata when available:",
                    "- files: key files involved (e.g. src/auth/login.ts)",
                    "- apis: API endpoints or interfaces (e.g. POST /api/auth/login)",
                    "- dependencies: libraries or internal deps (e.g. bcrypt, jwt)",
                    "- issues: potential problems or tech debt",
                    "- complexity: low | medium | high",
                    "- testCoverage: none | partial | good",
                    "Leaf nodes should be specific (Authentication, Routing, Database) not generic.",
                    "Return a single root object with nested children arrays.",
                ].join("\n"),
                output: Output.object({ schema: mindmapSchema }),
                prompt: `Analyze this codebase/documentation and generate a hierarchical project architecture map:\n\n${sourceText}`,
            });
            return result.output;
        }
        case "REPORT": {
            const result = await generateText({
                model: openai(CHAT_MODEL),
                system,
                output: Output.object({ schema: reportSchema }),
                prompt: `Write a structured long-form report with sections and a full markdown version from:\n\n${sourceText}`,
            });
            return result.output;
        }
        default:
            throw new ValidationError(`Unsupported artifact type: ${type}`);
    }
}

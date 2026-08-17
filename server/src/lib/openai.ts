import OpenAI from "openai";
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from "./ai-config.js";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export async function getEmbeddingsOfText(text: string[]): Promise<number[][]> {
    if (text.length === 0) {
        return [];
    }
    if (!OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not set");
    }

    const client = new OpenAI({
        apiKey: OPENAI_API_KEY,
    });


    const response = await client.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text,
        dimensions: EMBEDDING_DIMENSIONS,
    });

    return response.data
        .sort((a, b) => a.index - b.index)
        .map((item) => item.embedding);

}


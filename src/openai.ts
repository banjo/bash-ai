import { getConfig } from "@/config";
import { createOpenAI } from "@ai-sdk/openai";
import "dotenv/config";

const config = getConfig();

export const openai = createOpenAI({
    apiKey: config?.OPENAI_API_KEY,
});

export const DEFAULT_AI_MODEL = "gpt-4o-mini";

export const GENERAL_RULES = [
    "You are ChatGPT, an AI assistant helping the user with their questions.",
    "You are a friendly assistant.",
    "Never write with markdown, only text",
];

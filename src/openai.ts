import { stripRegexPatterns } from "@/utils";
import { defaults } from "@banjoanton/utils";
import "dotenv/config";
import OpenAI from "openai";
import { Stream } from "openai/streaming";

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_AI_MODEL = "gpt-4-turbo-preview";

const GENERAL_RULES = [
    "You are ChatGPT, an AI assistant helping the user with their questions.",
    "You are a friendly assistant.",
    "Never write with markdown, only text",
];

const GENERAL_REGEX_EXCLUSIONS = [/```[a-z]*\n/gi, /```[a-z]*/gi, "\n"]; // Remove code blocks

type CreateChatCompletionParams = {
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
    model?: OpenAI.Chat.Completions.ChatCompletionCreateParams["model"];
    rules?: string[];
};

const DEFAULT_CHAT_COMPLETION_PARAMS = {
    model: DEFAULT_AI_MODEL,
    rules: [] as string[],
};
export const createChatStream = async (props: CreateChatCompletionParams) => {
    const { messages, model, rules } = defaults(props, DEFAULT_CHAT_COMPLETION_PARAMS);

    return await openai.chat.completions.create({
        model,
        stream: true,
        messages: [{ role: "system", content: [...GENERAL_RULES, rules].join("\n") }, ...messages],
    });
};

type Options = {
    onText?: (text: string) => void;
    onStart?: () => void;
    onEnd?: (fullText: string) => void;
    regexExclusions?: (RegExp | string | undefined)[];
};

export const streamHandler = async (
    stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>,
    options: Options
) => {
    const { onEnd, onStart, onText, regexExclusions = [] } = options;

    let started = false;
    let fullAnswer = "";
    for await (const chunk of stream) {
        if (!started && onStart) {
            onStart();
            started = true;
        }
        const content = chunk.choices[0]?.delta?.content;
        fullAnswer += content ?? "";
        if (content && onText) {
            onText(content);
        }
    }
    if (onEnd) {
        const strippedAnswer = stripRegexPatterns(fullAnswer, [
            ...GENERAL_REGEX_EXCLUSIONS,
            ...regexExclusions,
        ]);
        onEnd(strippedAnswer);
    }
};

import { defineCommand } from "citty";
import clipboard from "clipboardy";
import "dotenv/config";
import OpenAI from "openai";
import { Stream } from "openai/streaming";
import { version } from "../package.json";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const aiRules = [
    "assume all code question are bash commands.",
    "do not write code in markdown code blocks",
    "code should be ready to copy and run directly in the terminal.",
    "only provide the code, no explanation or comments.",
];

type CreateChatCompletionParams = {
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
    model: OpenAI.Chat.Completions.ChatCompletionCreateParams["model"];
};

const createChatStream = async ({ messages, model }: CreateChatCompletionParams) =>
    openai.chat.completions.create({
        model,
        stream: true,
        messages,
    });

export const main = defineCommand({
    meta: {
        name: "cl-ai",
        version,
        description: "Example CLI",
    },
    args: {
        dev: {
            type: "boolean",
            description: "Run in development mode",
            required: false,
            default: false,
            alias: "d",
        },
    },
    subCommands: {
        helloWorld: () => import("@/commands/hello-world").then(m => m.helloWorldCommand),
    },
    run: async ({ args }) => {
        const stream = await createChatStream({
            messages: [
                {
                    role: "system",
                    content: aiRules.join("\n"),
                },
                {
                    role: "user",
                    content: "How do I create a patch from a commit in git?",
                },
            ],
            model: "gpt-4-turbo-preview",
        });

        let fullAnswer = "";
        await streamHandler(stream, {
            onText: text => {
                fullAnswer += text;
                process.stdout.write(text);
            },
            onEnd: () => {
                process.stdout.write("\n");
                clipboard.writeSync(fullAnswer);
            },
        });
    },
});

type Callbacks = {
    onText?: (text: string) => void;
    onStart?: () => void;
    onEnd?: () => void;
};

async function streamHandler(
    stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>,
    callbacks: Callbacks
) {
    let started = false;
    for await (const chunk of stream) {
        if (!started && callbacks.onStart) {
            callbacks.onStart();
            started = true;
        }
        const content = chunk.choices[0]?.delta?.content;
        if (content && callbacks.onText) {
            callbacks.onText(content);
        }
    }
    if (callbacks.onEnd) {
        callbacks.onEnd();
    }
}

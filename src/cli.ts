import { defineCommand } from "citty";
import "dotenv/config";
import OpenAI from "openai";
import { Stream } from "openai/streaming";
import { version } from "../package.json";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const stripRegexPatterns = (
    inputString: string,
    patternList: (RegExp | string | undefined)[]
) =>
    patternList.reduce(
        (currentString: string, pattern) =>
            pattern ? currentString.replaceAll(pattern, "") : currentString,
        inputString
    );

const shellCodeExclusions = [/```[a-z]*\n/gi, /```[a-z]*/gi, "\n"]; // remove for example ```js\n and ```js

const aiRules = [
    "assume all code question are bash commands.",
    "do not write code in markdown code blocks",
    "code should be ready to copy and run directly in the terminal.",
    "only provide the code, no explanation or comments.",
];

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
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            stream: true,
            messages: [
                {
                    role: "system",
                    content: aiRules.join("\n"),
                },
                {
                    role: "user",
                    content: "How do I create a new file with Python?",
                },
            ],
        });

        await streamHandler(response, {
            onText: text => {
                // const strippedText = stripRegexPatterns(text, shellCodeExclusions);
                process.stdout.write(text);
                // console.log(text);
            },
            onEnd: () => process.stdout.write("\n"),
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

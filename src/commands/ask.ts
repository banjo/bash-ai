import { getConfig } from "@/config";
import { fileArgs, handleFiles } from "@/files";
import { DEFAULT_AI_MODEL, GENERAL_RULES, openai } from "@/openai";
import { Message } from "@/types";
import { content, filesToMessage, loadFiles } from "@/utils";
import { parseNumber } from "@banjoanton/utils";

import { isCancel, log, spinner, text } from "@clack/prompts";
import { generateText } from "ai";
import { defineCommand } from "citty";

const ASK_RULES = [
    "Do not ask how you can help me.",
    "Do not ask for personal information.",
    "Do not ask questions",
    "Provide simple answers",
    "Do not use markdown",
];

export const ask = defineCommand({
    meta: {
        name: "Ask",
        description: "Ask AI about a anything",
    },
    args: {
        input: {
            type: "positional",
            required: false,
            description: "A question to ask the AI.",
        },
        ...fileArgs,
    },
    async run(ctx) {
        const { input, files, filesMax } = ctx.args;
        const config = getConfig();
        const model = config?.MODEL ?? DEFAULT_AI_MODEL;

        const messages: Message[] = [
            {
                role: "system",
                content: [...GENERAL_RULES, ...ASK_RULES].join("\n"),
            },
        ];

        if (files) {
            const filesMessage = await handleFiles(files, filesMax);
            messages.push(filesMessage);
        }

        let userInput: string | symbol = input;

        if (!userInput) {
            userInput = await text({ message: "What do you want to ask AI about?" });
        }

        if (isCancel(userInput)) {
            return;
        }

        messages.push({ role: "user", content: userInput });

        const s = spinner();
        s.start("Thinking...");
        const { text: responseText } = await generateText({
            model: openai(model),
            messages,
        });

        s.stop(`Response:\n ${content(responseText)}`);
    },
});

import { getConfig } from "@/config";
import { DEFAULT_AI_MODEL, GENERAL_RULES, openai } from "@/openai";
import { content } from "@/utils";
import { isCancel, spinner, text } from "@clack/prompts";
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
    },
    async run(ctx) {
        const { input } = ctx.args;

        let userInput: string | symbol = input;

        if (!userInput) {
            userInput = await text({ message: "What do you want to ask AI about?" });
        }

        if (isCancel(userInput)) {
            return;
        }

        const config = getConfig();
        const model = config?.MODEL ?? DEFAULT_AI_MODEL;

        const s = spinner();
        s.start("Thinking...");
        const { text: responseText } = await generateText({
            model: openai(model),
            messages: [
                {
                    role: "system",
                    content: [...GENERAL_RULES, ...ASK_RULES].join("\n"),
                },
                { role: "user", content: userInput },
            ],
        });

        s.stop(`Response:\n ${content(responseText)}`);
    },
});

import { getConfig } from "@/config";
import { DEFAULT_AI_MODEL, GENERAL_RULES, openai } from "@/openai";
import { content } from "@/utils";
import { Maybe } from "@banjoanton/utils";
import { isCancel, spinner, text } from "@clack/prompts";
import { generateText } from "ai";
import { defineCommand } from "citty";

const RULES: string[] = [];

type Message = {
    role: "user" | "system";
    content: string;
};

export const chat = defineCommand({
    meta: {
        name: "Chat",
        description: "Chat with AI",
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
        const config = getConfig();
        const model = config?.MODEL ?? DEFAULT_AI_MODEL;
        const messages: Message[] = [
            {
                role: "system",
                content: [...GENERAL_RULES, ...RULES].join("\n"),
            },
        ];

        let firstInput: Maybe<string | symbol> = input;
        while (true) {
            let userInput: Maybe<string | symbol> = firstInput;
            firstInput = undefined;

            if (!userInput) {
                userInput = await text({ message: "Message prompt: " });
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
        }
    },
});

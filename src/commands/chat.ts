import { getConfig } from "@/config";
import { fileArgs, handleFiles } from "@/files";
import { DEFAULT_AI_MODEL, GENERAL_RULES, openai } from "@/openai";
import { Message } from "@/types";
import { content } from "@/utils";
import { Maybe } from "@banjoanton/utils";
import { isCancel, spinner, stream, text } from "@clack/prompts";
import { streamText } from "ai";
import { defineCommand } from "citty";

const RULES: string[] = [];

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
        ...fileArgs,
    },
    async run(ctx) {
        const { input, files, filesMax } = ctx.args;
        const config = getConfig();
        const model = config?.MODEL ?? DEFAULT_AI_MODEL;
        const messages: Message[] = [
            {
                role: "system",
                content: [...GENERAL_RULES, ...RULES].join("\n"),
            },
        ];

        if (files) {
            const filesMessage = await handleFiles(files, filesMax);
            messages.push(filesMessage);
        }

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

            const { textStream } = await streamText({
                model: openai(model),
                messages,
            });

            let fullResponse = "";

            await stream.info(
                (async function* () {
                    for await (const textPart of textStream) {
                        fullResponse += textPart;
                        yield textPart;
                    }

                    process.stdout.write("\n");
                })()
            );
            messages.push({ role: "user", content: fullResponse });
        }
    },
});

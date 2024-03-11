import { getConfig } from "@/config";
import { createChatStream, streamHandler } from "@/openai";
import { content, toned } from "@/utils";
import { isCancel, log, spinner, text } from "@clack/prompts";
import { defineCommand } from "citty";
import clipboard from "clipboardy";

const UNRELATED_QUESTION = "NOT_RELATED";

const BASH_RULES = [
    "assume all code question are bash commands.",
    "code should be ready to copy and run directly in the terminal.",
    "only provide the code, no explanation or comments.",
    `if the question is not terminal or bash related, say "${UNRELATED_QUESTION}"`,
];

export const bash = defineCommand({
    meta: {
        name: "Bash",
        description: "Ask AI about a bash command.",
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
        let hasPrompted = false;

        if (!userInput) {
            hasPrompted = true;
            userInput = await text({ message: "What do you want to ask AI about bash?" });
        }

        if (isCancel(userInput)) {
            return;
        }

        const config = getConfig();

        const stream = await createChatStream({
            messages: [{ role: "user", content: userInput }],
            rules: BASH_RULES,
            model: config?.MODEL,
        });

        const s = spinner();

        await streamHandler(stream, {
            onStart: () => {
                if (!hasPrompted) {
                    log.info(toned(userInput as string));
                }
                s.start("Thinking...");
            },

            onEnd: text => {
                if (text === UNRELATED_QUESTION) {
                    log.error(toned("This question is not related to bash."));
                    return;
                }
                s.stop(content(text));
                clipboard.writeSync(text);
                log.info(toned("Copied to clipboard!"));
            },
        });
    },
});

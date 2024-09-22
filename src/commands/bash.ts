import { getConfig } from "@/config";
import { DEFAULT_AI_MODEL, GENERAL_RULES, openai } from "@/openai";
import { content, toned } from "@/utils";
import { isCancel, log, spinner, text } from "@clack/prompts";
import { generateText } from "ai";
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

        if (!userInput) {
            userInput = await text({ message: "What do you want to ask AI about bash?" });
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
            system: [...GENERAL_RULES, ...BASH_RULES].join(","),
            prompt: userInput,
        });

        if (responseText === UNRELATED_QUESTION) {
            s.stop("Oops!");
            log.error(toned("This question is not related to bash."));
            return;
        }

        s.stop(content(responseText));
        clipboard.writeSync(responseText);
        log.info(toned("Copied to clipboard!"));
    },
});

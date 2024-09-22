import { bash } from "@/commands/bash";
import { config } from "@/commands/config";
import { update } from "@/commands/update";
import { createConfig, getConfig } from "@/config";
import { isSubCommand, title } from "@/utils";
import { intro, isCancel, outro, select, text } from "@clack/prompts";
import { defineCommand, runCommand } from "citty";
import { version } from "../package.json";
import { DEFAULT_AI_MODEL } from "./openai";
import { ask } from "./commands/ask";

let runDefaultCommand = false;

const subCommands = {
    ask,
    bash,
    config,
    update,
};

export const main = defineCommand({
    meta: {
        name: "bash-ai",
        version,
        description: "A CLI for AI commands",
    },
    args: {
        input: {
            type: "positional",
            required: false,
            description: "A question to ask the AI.",
        },
    },
    setup: async ctx => {
        intro(title("bash-ai"));

        const config = getConfig();
        const model = config?.MODEL ?? DEFAULT_AI_MODEL;
        if (!config?.OPENAI_API_KEY) {
            const key = await text({
                message: "You need to set a OpenAPI key to continue.",
            });

            if (isCancel(key)) {
                outro(title("Goodbye!"));
                process.exit(0);
            }

            createConfig({ OPENAI_API_KEY: key, MODEL: model });
        }

        if (isSubCommand(ctx)) return;
        if (ctx.cmd.run) await ctx.cmd.run(ctx);
    },
    subCommands,
    cleanup: async ctx => {
        // If the command is a sub command and has an input, do not show usage
        if (isSubCommand(ctx) || ctx.args.input || runDefaultCommand) {
            outro(title("Goodbye!"));
            process.exit(0);
        }
    },
    run: async ctx => {
        if (isSubCommand(ctx) || runDefaultCommand) return;
        runDefaultCommand = true;

        const answer = await select({
            message: "What do you want to do?",
            options: [
                { label: "Ask a question", value: "ask" },
                { label: "Ask a bash command", value: "bash" },
                { label: "Set configuration", value: "config" },
                { label: "Update the CLI", value: "update" },
            ],
        });

        if (isCancel(answer)) return;

        // @ts-ignore
        await runCommand(subCommands[answer], {
            rawArgs: ctx.rawArgs,
            data: ctx.data,
            showUsage: false,
        });
    },
});

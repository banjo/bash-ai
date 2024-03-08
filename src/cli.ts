import { bash } from "@/commands/bash";
import { config } from "@/commands/config";
import { createConfig, getConfig } from "@/config";
import { isSubCommand, title } from "@/utils";
import { intro, isCancel, outro, text } from "@clack/prompts";
import { defineCommand, runCommand } from "citty";
import { version } from "../package.json";

let runDefaultCommand = false;

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
        if (!config?.OPENAI_API_KEY) {
            const key = await text({
                message: "You need to set a OPENAI_API_KEY to continue.",
            });

            if (isCancel(key)) {
                outro(title("Goodbye!"));
                process.exit(0);
            }

            createConfig({ OPENAI_API_KEY: key });
        }

        if (isSubCommand(ctx)) return;
        if (ctx.cmd.run) await ctx.cmd.run(ctx);
    },
    subCommands: {
        bash,
        config,
    },
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

        // @ts-ignore
        await runCommand(ctx.cmd.subCommands?.bash, {
            rawArgs: ctx.rawArgs,
            data: ctx.data,
            showUsage: false,
        });
    },
});

import { bash } from "@/commands/bash";
import { isSubCommand, title } from "@/utils";
import { intro, outro } from "@clack/prompts";
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
        if (isSubCommand(ctx)) return;
        if (ctx.cmd.run) await ctx.cmd.run(ctx);
    },
    subCommands: {
        bash,
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

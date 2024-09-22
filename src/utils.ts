import { CommandContext } from "citty";
import pc from "picocolors";

import fs from "node:fs";
import glob from "fast-glob";
import { Message } from "./types";

export const isSubCommand = (ctx: CommandContext<any>) => {
    // @ts-ignore
    const subCommands = Object.keys(ctx.cmd?.subCommands ?? {});
    return subCommands.includes(ctx.args.input);
};

export const title = (text: string) => pc.bold(pc.cyan(` ${text} `));
export const toned = (text: string) => pc.bold(pc.dim(text));
export const content = (text: string) => pc.green(text);

type File = { name: string; content: string };

export const loadFiles = async (files: string | string[], maxAmount: number): Promise<File[]> => {
    if (!files || files.length === 0) return [];

    const filenames = await glob(files, { onlyFiles: true });

    return await Promise.all(
        filenames.slice(0, maxAmount).map(async name => {
            const content = await fs.promises.readFile(name, "utf8");
            return { name, content };
        })
    );
};

export const filesToMessage = (files: File[]): Message => {
    const intro = "These files are provided as context: \n\n";
    const createFile = (f: File) => `--- ${f.name} ---\n${f.content}\n`;
    const content = `${intro}${files.map(createFile).join("\n")}`;

    return {
        role: "user",
        content,
    };
};

import { CommandContext } from "citty";
import pc from "picocolors";

export const isSubCommand = (ctx: CommandContext<any>) => {
    // @ts-ignore
    const subCommands = Object.keys(ctx.cmd?.subCommands ?? {});
    return subCommands.includes(ctx.args.input);
};

export const title = (text: string) => pc.bold(pc.cyan(` ${text} `));
export const toned = (text: string) => pc.bold(pc.dim(text));
export const content = (text: string) => pc.green(text);

export const stripRegexPatterns = (
    inputString: string,
    patternList: (RegExp | string | undefined)[]
) =>
    patternList.reduce(
        (currentString: string, pattern) =>
            pattern ? currentString.replaceAll(pattern, "") : currentString,
        inputString
    );

import { parseNumber } from "@banjoanton/utils";
import { filesToMessage, loadFiles } from "./utils";
import { log } from "@clack/prompts";

export const fileArgs = {
    files: {
        type: "string",
        required: false,
        description: "Files to load to the cli context.",
        alias: "f",
        valueHint: "*.ts",
    },
    filesMax: {
        type: "string",
        required: false,
        description: "Maximum number of files to load.",
        alias: "m",
        default: "10",
    },
} as const;

export const handleFiles = async (files: string, filesMax: string) => {
    const number = parseNumber(filesMax);
    const filesList = await loadFiles(files, number ?? 10);
    log.info(`Adding files to context:\n ${filesList.map(f => f.name).join(", ")}`);
    return filesToMessage(filesList);
};

import { Config, ConfigFields, getConfig, updateConfig } from "@/config";
import { isEmpty, truncate } from "@banjoanton/utils";
import { isCancel, log, select, text } from "@clack/prompts";
import { defineCommand } from "citty";

export const config = defineCommand({
    meta: {
        name: "Config",
        description: "Set configuration for the CLI.",
    },
    args: {
        openai: {
            type: "string",
            description: "Set the OpenAI API key.",
        },
    },
    async run(ctx) {
        const entries = Object.entries(ctx.args).filter(([key]) => key !== "_");
        if (!isEmpty(entries)) {
            const options = Object.fromEntries(entries);
            const updatedConfig = Config.fromRecord(options);
            updateConfig(updatedConfig);
            return;
        }

        const currentConfig = getConfig();

        const answer = await select({
            message: "Select a configuration to update:",
            options: [
                {
                    label: "OpenAI KEY",
                    value: ConfigFields.OPENAI_API_KEY,
                    hint: truncate(currentConfig?.OPENAI_API_KEY ?? "", 3),
                },
            ],
        });

        if (isCancel(answer)) return;

        const selected = answer as string;

        const key = await text({
            message: `Set the new value for ${selected}`,
            initialValue: currentConfig?.OPENAI_API_KEY ?? "",
        });

        if (isCancel(key)) return;

        updateConfig({ [selected]: key });
        log.success("Configuration updated!");
    },
});

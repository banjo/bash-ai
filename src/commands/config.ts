import { ConfigField, ConfigFields, getConfig, updateConfig } from "@/config";
import { DEFAULT_AI_MODEL } from "@/openai";
import { truncate } from "@banjoanton/utils";
import { isCancel, log, select, text } from "@clack/prompts";
import { defineCommand } from "citty";

export const config = defineCommand({
    meta: {
        name: "Config",
        description: "Set configuration for the CLI.",
    },
    async run() {
        const currentConfig = getConfig();

        const answer: ConfigField | symbol = await select({
            message: "Select a configuration to update:",
            options: [
                {
                    label: "OpenAI key",
                    value: ConfigFields.OPENAI_API_KEY,
                    hint: truncate(currentConfig?.OPENAI_API_KEY ?? "", 3),
                },
                {
                    label: "Model",
                    value: ConfigFields.MODEL,
                    hint: currentConfig?.MODEL ?? DEFAULT_AI_MODEL,
                },
            ],
        });

        if (isCancel(answer)) return;

        const key = await text({
            message: `Set the new value for ${answer}`,
            placeholder: currentConfig?.[answer] ?? "",
        });

        if (isCancel(key)) return;

        updateConfig({ [answer]: key });
        log.success("Configuration updated!");
    },
});

import { spinner } from "@clack/prompts";
import { defineCommand } from "citty";
import { execa } from "execa";

export const update = defineCommand({
    meta: {
        name: "Update",
        description: "Update to the latest version.",
    },

    async run(ctx) {
        const s = spinner();
        s.start("Updating...");
        await execa("npm", ["install", "-g", "bash-ai"]);
        s.stop("Updated!");
    },
});

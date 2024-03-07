import { defineConfig } from "hoks";

export default defineConfig({
    installOnLockChange: true,
    staged: {
        "*": ["prettier --write --ignore-unknown", "eslint --fix"],
    },
    syncBeforePush: true,
    enforceConventionalCommits: true,
});

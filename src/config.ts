import { Maybe, merge } from "@banjoanton/utils";
import { readUser, writeUser } from "rc9";

const FILE_NAME = ".bash-ai";

export const CONFIG_FIELDS = ["OPENAI_API_KEY", "MODEL"] as const;
export type ConfigField = (typeof CONFIG_FIELDS)[number];

export const ConfigFields = CONFIG_FIELDS.reduce(
    (acc, field) => {
        acc[field] = field;
        return acc;
    },
    {} as Record<ConfigField, ConfigField>
);

type Config = Record<ConfigField, string>;

export const Config = {
    fromRecord: (record: Record<string, any>) => {
        const config = {} as Config;
        for (const field of CONFIG_FIELDS) {
            config[field] = record[field];
        }
        return config;
    },
};

export const getConfig = (): Maybe<Config> => readUser(FILE_NAME) as Maybe<Config>;

export const createConfig = (config?: Config) => writeUser(config ?? {}, FILE_NAME);

export const updateConfig = (newConfig: Record<string, string>) => {
    const current = readUser(FILE_NAME);
    const updated = merge(current, newConfig);
    writeUser(updated, FILE_NAME);
};

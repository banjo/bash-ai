import { Maybe, merge } from "@banjoanton/utils";
import { readUser, writeUser } from "rc9";

const FILE_NAME = ".bash-ai";

type Config = {
    OPENAI_API_KEY: string;
};

const Config = {
    from: (data: Config) => data,
};

export const getConfig = (): Maybe<Config> => readUser(FILE_NAME) as Maybe<Config>;

export const createConfig = (config?: Config) => writeUser(config ?? {}, FILE_NAME);

export const updateConfig = (newConfig: Config) => {
    const current = readUser(FILE_NAME);
    const updated = merge(current, newConfig);
    writeUser(updated, FILE_NAME);
};

import { IConfigProvider } from "./config-provider/types";
import { InternalCache } from "./internal-cache";

export enum StringMatchType {
    SUFFIX = "SUFFIX",
    PREFIX = "PREFIX",
    EXACT = "EXACT"
}

export interface IConfigService {
    isConfigEnabled(config: string): boolean
    isConfigEnabledForString(config: string, stringToMatch: string, option?: StringMatchType): boolean
}

export class ConfigService implements IConfigService {
    private readonly internalCache = InternalCache.getInstance()

    constructor(private readonly configProvider: IConfigProvider) {}

    isConfigEnabled(config: string): boolean {
        const cacheKey = `config:${config}`
        const cachedValue = this.internalCache.get<boolean>(cacheKey)
        if (cachedValue !== undefined) {
            return cachedValue
        }
        const newValue: boolean = this.fetchFromProvider(config)
        this.internalCache.set<boolean>(cacheKey, newValue, 60000)
        return newValue
    }

    private isMatchedBySuffix (stringToMatch: string, suffix: string): boolean {
        return stringToMatch.endsWith(suffix)
    }

    private isMatchedByPrefix (stringToMatch: string, prefix: string): boolean {
        return stringToMatch.startsWith(prefix)
    }

    private isExactMatch (stringToMatch: string, match: string): boolean {
        return stringToMatch === match
    }

    private pickStringMatchFunction (option: StringMatchType) {
        if (option === StringMatchType.SUFFIX) {
            return this.isMatchedBySuffix
        }
        if (option === StringMatchType.PREFIX) {
            return this.isMatchedByPrefix
        }
        return this.isExactMatch
    }

    isConfigEnabledForString(config: string, stringToMatch: string, option?: StringMatchType): boolean {
        const cacheKey = `config:${config}`
        const cachedValues = this.internalCache.get<string[]>(cacheKey)
        const matchFunction = this.pickStringMatchFunction(option ?? StringMatchType.EXACT)
        if (cachedValues !== undefined) {
            return cachedValues.some(value => matchFunction(stringToMatch, value))
        }
        const newValue: string[] = this.fetchFromProvider(config)
        this.internalCache.set<string[]>(cacheKey, newValue, 60000)
        return newValue.some(value => matchFunction(stringToMatch, value.toString()))
    }

    private fetchFromProvider<T>(config: string): NonNullable<T> {
        const value = this.configProvider.get<T>(config)
        if (!value) {
            throw new Error(`Config ${config} not found`)
        }
        return value
    }
}
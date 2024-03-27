type CacheValueType = object | boolean

interface CacheItem {
    value: CacheValueType
    ttl: number
}

export class InternalCache {
    private static instance: InternalCache
    private readonly configCache: { [key: string]: CacheItem } = {}

    private constructor () {}

    static getInstance(): InternalCache {
        if (!InternalCache.instance) {
            InternalCache.instance = new InternalCache()
        }

        return InternalCache.instance
    }

    get<T>(key: string): T | undefined {
        const item = this.configCache[key]
        if (!item) {
            return undefined
        }

        if (item.ttl < Date.now()) {
            return undefined
        }

        return item.value as T
    }

    set<T extends CacheValueType>(key: string, value: T, ttl: number) {
        this.configCache[key] = {
            value,
            ttl: Date.now() + ttl
        }
    }

    del(key: string) {
        delete this.configCache[key]
    }
}
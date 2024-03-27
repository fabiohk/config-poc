import { IConfigProvider } from "./types"

export class InternalConfigProvider implements IConfigProvider {
    private static instance: InternalConfigProvider
    private config: { [key: string]: unknown } = {
        "config1": true,
        "config2": ["licensePlate3", "licensePlate4"]
    }

    private constructor () {}

    static getInstance(): InternalConfigProvider {
        if (!InternalConfigProvider.instance) {
            InternalConfigProvider.instance = new InternalConfigProvider()
        }

        return InternalConfigProvider.instance
    }

    get<T>(key: string) {
        return this.config[key] as T
    }

    set<T>(key: string, value: T) {
        this.config[key] = value
    }
}
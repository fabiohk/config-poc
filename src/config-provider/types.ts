export interface IConfigProvider {
    get: <T>(key: string) => T | undefined
    set: <T>(key: string, value: T) => void
}
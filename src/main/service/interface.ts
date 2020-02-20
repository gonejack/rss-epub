export interface Service {
    start(): Promise<boolean>
    stop(): Promise<boolean>
}
export interface MessageHandler<P> {
    onMessage: (e: string, payload: P) => unknown;
    [method: string]: ((e: string, payload: P) => unknown)|undefined;
}
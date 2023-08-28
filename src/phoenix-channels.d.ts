declare module 'phoenix-channels' {
    export type SocketOpts = {
        params: object;
    }
    export class Socket {
        constructor(endPoint: string, opts: SocketOpts);
        onOpen(callback: () => void): void;
        onError(callback: () => void): void;
        connect(): void;
        close(): void;
        channel(route: string, params: object): Channel;
    }

    class AfterJoin {
        receive(event: string, callback: (resp: any) => any): AfterJoin;
    }

    export class Channel {
        on(event: string, callback: (payload: any) => void): void;
        join(): AfterJoin;
        push(event: string, payload: object): void;
        leave(): void;
    }
}


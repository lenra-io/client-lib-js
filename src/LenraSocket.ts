import { Socket } from 'phoenix-channels';
import LenraRoute, { Callback } from './LenraRoute';

export type LenraSocketOpts = {
    appName: string,
    token: string,
    isProd?: boolean
    wsUri?: string,
}

export default class LenraSocket {
    socket: Socket;
    opts: LenraSocketOpts;

    constructor(opts: LenraSocketOpts) {
        opts.isProd = opts.isProd ?? false;
        opts.wsUri = opts.wsUri ?? (opts.isProd ? "wss://api.lenra.io/socket" : "wss://api.lenra.io/socket");
        this.opts = opts;

        let params = {
            token: opts.token,
            app: opts.appName,
        }
        this.socket = new Socket(opts.wsUri, { params: params });
    }

    connect() {
        return new Promise<void>((resolve, reject) => {
            this.socket.onOpen(() => {
                resolve();
            });
            this.socket.onError(() => {
                reject();
            });
            this.socket.connect();
        });
    }

    close() {
        if (this.socket) this.socket.close();
    }

    route(routeName: string, callback: Callback) {
        return new LenraRoute(this.socket, routeName, callback);;
    }

    isConnected() {
        return !!this.socket;
    }
}
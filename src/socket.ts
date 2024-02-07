import { Socket } from 'phoenix';
import LenraRoute, { Callback } from './route.js';

export type LenraSocketOpts = {
    appName?: string,
    token?: string,
    additionalParams?: Record<string, any>,
    socketEndpoint: string,
}

export default class LenraSocket {
    socket: Socket;
    opts: LenraSocketOpts;

    constructor(opts: LenraSocketOpts) {
        this.opts = opts;

        let params: any = {}
        if (opts.token) params.token = opts.token;
        if (opts.appName) params.app = opts.appName;
        this.socket = new Socket(opts.socketEndpoint, { params: { ...opts.additionalParams, ...params } });
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
            return this;
        });
    }

    close() {
        if (this.socket) this.socket.disconnect();
    }

    route(routeName: string, callback: Callback) {
        return new LenraRoute(this.socket, routeName, callback);;
    }

    isConnected() {
        return !!this.socket;
    }
}
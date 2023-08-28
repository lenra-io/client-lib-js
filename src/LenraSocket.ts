import { Socket } from 'phoenix-channels';
import LenraRoute, { Callback } from './LenraRoute';

export default class LenraSocket {
    socket: Socket;

    constructor(appName: string, token: string, wsUri: string) {
        let params = {
            token: token,
            app: appName,
        }
        this.socket = new Socket(wsUri, { params: params });
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

    channel(route: string, callback: Callback) {
        const channel = new LenraRoute(this.socket, route, callback);
        return channel;
    }

    isConnected() {
        return !!this.socket;
    }
}
import { Socket } from 'phoenix-channels';
import LenraRoute from './LenraRoute';
import { rejects } from 'assert';



export default class LenraSocket {
    constructor(appName, token, wsUri) {
        let params = {
            token: token,
            app: appName,
            context: {},
        }
        this.socket = new Socket(wsUri, { params: params });
    }

    connect() {
        return new Promise((resolve, reject) => {
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

    channel(route, callback) {
        const channel = new LenraRoute(this.socket, route, callback);
        return channel;
    }

    isConnected() {
        return !!this.socket && this.connected;
    }
}
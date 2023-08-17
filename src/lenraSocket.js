import { Socket } from 'phoenix-channels';
import RouteChannel from './RouteChannel';



export default class LenraSocket {
    constructor(appName, opts) {
        let isProd = opts.prod || false;
        let url = isProd ? "ws://api.lenra.io/socket" : "ws://localhost:4000/socket";
        let params = {
            app: appName,
            context: {},
        }
        this.socket = new Socket(url, { params: params });
        this.socket.connect();
    }

    channel(route) {
        const channel = new RouteChannel(this.socket, route);
        return channel;
    }
}
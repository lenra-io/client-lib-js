import { Socket } from 'phoenix-channels';
import LenraRoute from './LenraRoute';



export default class LenraSocket {
    constructor(appName, opts) {
        let isProd = opts.prod || false;
        let url = opts.url ?? (isProd ? "ws://api.lenra.io/socket" : "ws://localhost:4001/socket");
        let token = opts.token ?? "SFMyNTY.g2gDdAAAAAFkAAVzY29wZW0AAAANYXBwOndlYnNvY2tldG4GAGFcWwOKAWIAAVGA.eIKY-EJthL5EXoPLVTV9EHW3sqAXFexn6tZGwtldz4Y";
        let params = {
            token: token,
            app: appName,
            context: {},
        }
        this.socket = new Socket(url, { params: params });
        this.socket.connect();
    }

    channel(route, callback) {
        const channel = new LenraRoute(this.socket, route, callback);
        return channel;
    }
}
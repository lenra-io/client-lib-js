import LenraOAuth2Client, { LenraOAuth2Opts } from "./oauth2.js"
import { Callback } from "./route.js";
import LenraSocket, { LenraSocketOpts } from "./socket.js";

type LenraAppOpts = {
    appName?: string,
    clientId: string,
    redirectUri?: string,
    scopes?: string[],
    isProd?: boolean
    socketEndpoint?: string,
    oauthBaseUri?: string,
}

export default class LenraApp {
    lenraAppOpts: LenraAppOpts;
    lenraOAuth2Client: LenraOAuth2Client;
    lenraSocket?: LenraSocket;

    constructor(opts: LenraAppOpts) {
        opts.oauthBaseUri = opts.oauthBaseUri ?? (opts.isProd ? "https://api.lenra.io" : "http://localhost:4444");
        opts.redirectUri = opts.redirectUri ?? window.location.origin + "/redirect.html";
        opts.scopes = opts.scopes ?? ["app:websocket"];
        this.lenraAppOpts = opts;
        const oAuth2Opts: LenraOAuth2Opts = {
            clientId: opts.clientId,
            redirectUri: opts.redirectUri,
            scopes: opts.scopes,
            authorizeUrl: opts.oauthBaseUri + "/oauth2/auth",
            tokenUrl: opts.oauthBaseUri + "/oauth2/token",
        }
        this.lenraOAuth2Client = new LenraOAuth2Client(oAuth2Opts);
    }

    async connect(params?: Record<string, any>) {
        const accessToken = await this.lenraOAuth2Client.authenticate();
        const socketOpts: LenraSocketOpts = {
            appName: this.lenraAppOpts.appName,
            token: accessToken,
            additionalParams: params,
            socketEndpoint: this.lenraAppOpts.socketEndpoint ?? (this.lenraAppOpts.isProd ? "wss://api.lenra.io/socket" : "ws://localhost:4001/socket"),
        }
        this.lenraSocket = new LenraSocket(socketOpts);
        return this.lenraSocket.connect().then(() => this.lenraSocket!);
    }

    route(routeName: string, callback: Callback) {
        if (!this.lenraSocket) throw new Error("Lenra app is not connected. Please call the connect function first.");

        return this.lenraSocket.route(routeName, callback);
    }

    disconnect() {
        this.lenraSocket?.close();
    }

}
import LenraOAuth2Client, { LenraOAuth2Opts } from "./LenraOAuth2Client"
import { Callback } from "./LenraRoute";
import LenraSocket, { LenraSocketOpts } from "./LenraSocket";

type LenraAppOpts = {
    appName: string,
    clientId: string,
    redirectUri: string,
    scope: string[],
    isProd?: boolean
    wsUri?: string,
    server?: string,
    tokenEndpoint?: string,
    authorizationEndpoint?: string,
}

export default class LenraApp {
    lenraAppOpts: LenraAppOpts;
    lenraOAuth2Client: LenraOAuth2Client;
    lenraSocket?: LenraSocket;

    constructor(opts: LenraAppOpts) {
        this.lenraAppOpts = opts;
        const oAuth2Opts: LenraOAuth2Opts = {
            clientId: opts.clientId,
            redirectUri: opts.redirectUri,
            scope: opts.scope,
            isProd: opts.isProd,
            server: opts.server,
            tokenEndpoint: opts.tokenEndpoint,
            authorizationEndpoint: opts.authorizationEndpoint,
        }
        this.lenraOAuth2Client = new LenraOAuth2Client(oAuth2Opts);
    }

    connect() {
        return this.lenraOAuth2Client.authenticate().then((accessToken) => {
            const socketOpts: LenraSocketOpts = {
                appName: this.lenraAppOpts.appName,
                token: accessToken,
                isProd: this.lenraAppOpts.isProd,
                wsUri: this.lenraAppOpts.wsUri,
            }
            this.lenraSocket = new LenraSocket(socketOpts);
        });
    }

    route(routeName: string, callback: Callback) {
        if (!this.lenraSocket) throw "Lenra app is not connected. Please call the connect function first.";

        return this.lenraSocket.route(routeName, callback);
    }

    disconnect() {
        this.lenraSocket?.close();
    }

}
import LenraOAuth2Client, { LenraOAuth2Opts } from "./oauth2.js"
import { Callback } from "./route.js";
import LenraSocket, { LenraSocketOpts } from "./socket.js";

type OAuth2Opts = {
    clientId: string,
    redirectUri: string,
    scopes: string[],
    oauthBaseUri: string,
}

type LenraAppOpts = Partial<OAuth2Opts> & {
    appName?: string,
    isProd?: boolean
    socketEndpoint?: string,
}

export default class LenraApp {
    lenraAppOpts: LenraAppOpts;
    lenraOAuth2Client?: LenraOAuth2Client;
    lenraSocket?: LenraSocket;

    constructor(opts: LenraAppOpts) {
        if (!opts.appName && !opts.clientId) throw new Error("At least one of appName or clientId must be provided.");
        opts.oauthBaseUri = opts.oauthBaseUri ?? (opts.isProd ? "https://auth.lenra.io" : "http://localhost:4444");
        opts.redirectUri = opts.redirectUri ?? window.location.origin + "/redirect.html";
        opts.scopes = opts.scopes ?? ["app:websocket"];
        this.lenraAppOpts = opts;
    }

    initOAuth2Client(opts: OAuth2Opts) {
        const oAuth2Opts: LenraOAuth2Opts = {
            clientId: opts.clientId,
            redirectUri: opts.redirectUri,
            scopes: opts.scopes,
            authorizeUrl: opts.oauthBaseUri + "/oauth2/auth",
            tokenUrl: opts.oauthBaseUri + "/oauth2/token",
            revokeUrl: opts.oauthBaseUri + "/oauth2/revoke",
            logoutUrl: opts.oauthBaseUri + "/oauth2/sessions/logout",
        }
        this.lenraOAuth2Client = new LenraOAuth2Client(oAuth2Opts);
    }

    async connect(params?: Record<string, any>) {
        const accessToken = await this.authenticate();
        return this.openSocket(accessToken, params);
    }

    authenticate() {
        if (!this.lenraOAuth2Client) {
            this.initOAuth2Client({
                clientId: this.lenraAppOpts.clientId!,
                redirectUri: this.lenraAppOpts.redirectUri!,
                scopes: this.lenraAppOpts.scopes!,
                oauthBaseUri: this.lenraAppOpts.oauthBaseUri!,
            });
        };
        return this.lenraOAuth2Client!.authenticate();
    }

    openSocket(accessToken?: string, params?: Record<string, any>) {
        const socketOpts: LenraSocketOpts = {
            appName: this.lenraAppOpts.appName,
            token: accessToken,
            additionalParams: params,
            socketEndpoint: this.lenraAppOpts.socketEndpoint ?? (this.lenraAppOpts.isProd ? "wss://api.lenra.io/socket" : "ws://localhost:4001/socket"),
        }
        this.lenraSocket = new LenraSocket(socketOpts);
        return this.lenraSocket.connect().then(() => this.lenraSocket!);
    }

    route<T>(routeName: string, callback: Callback<T>) {
        if (!this.lenraSocket) throw new Error("Lenra app is not connected. Please call the connect function first.");

        return this.lenraSocket.route(routeName, callback);
    }

    /**
     * Close the socket connection and logout the user.
     * @returns 
     */
    async disconnect() {
        this.closeSocket();
        return this.logout();
    }

    closeSocket() {
        this.lenraSocket?.close();
    }

    async logout() {
        await this.lenraOAuth2Client?.disconnect();
    }

}
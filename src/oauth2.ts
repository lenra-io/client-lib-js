import { OAuth2Client, generateCodeVerifier } from '@badgateway/oauth2-client';

export interface LenraOAuth2Opts {
    clientId: string,
    redirectUri: string,
    scopes: string[],
    authorizeUrl: string,
    tokenUrl: string,
    revokeUrl: string,
    logoutUrl: string,
}

export default class LenraOAuth2Client {
    client: OAuth2Client;
    popup?: OAuthPopup;
    opts: LenraOAuth2Opts;
    private state: string = (Math.random() + 1).toString(36).substring(2);


    constructor(
        opts: LenraOAuth2Opts,
    ) {
        this.opts = opts;


        this.client = new OAuth2Client({
            // server: opts.server,
            clientId: opts.clientId,
            tokenEndpoint: opts.tokenUrl,
            authorizationEndpoint: opts.authorizeUrl,
        });

        this.popup = undefined;
    }

    async authenticate() {
        let access_token = sessionStorage.getItem("access_token")
        if (access_token === null) {
            const codeVerifier = await generateCodeVerifier();
            const authUrl = await this.client.authorizationCode.getAuthorizeUri({
                redirectUri: this.opts.redirectUri,
                codeVerifier,
                scope: this.opts.scopes,
                state: this.state,
            });

            this.popup = new OAuthPopup(authUrl);
            const popupLocation = await this.popup.open();
            const token = await this.client.authorizationCode.getTokenFromCodeRedirect(
                popupLocation,
                {
                    redirectUri: this.opts.redirectUri,
                    codeVerifier,
                    state: this.state,
                }
            );
            sessionStorage.setItem("access_token", token.accessToken);
            access_token = token.accessToken;
        }
        return access_token;
    }

    async revoke() {
        const access_token = sessionStorage.getItem("access_token")
        if (access_token !== null) {
            sessionStorage.removeItem("access_token");
            await fetch(this.opts.revokeUrl, {
                method: "POST",
                body: JSON.stringify({ 
                    client_id: this.opts.clientId,
                    token: access_token 
                }),
            });
        }
    }

    disconnect() {
        return new Promise((resolve, reject) => {
            let close = false;
            const onDisconnect = () => {
                if (close) resolve(undefined);
                else close = true;
            };
            const popup = window.open(this.opts.logoutUrl, "Logout Popup");
            popup!.onclose = onDisconnect;
            this.revoke().then(onDisconnect).catch(reject);
        });
    }
}

class OAuthPopup {
    id: string = "LenraOauth2Popup";
    url: string;
    popupOptions: string = "";
    iid?: number = undefined;
    promise?: Promise<string> = undefined;
    window: Window | null = null;

    constructor(url: string) {
        this.url = url;
    }

    open() {
        this.window = window.open(this.url, this.id, this.popupOptions);
        return this.listenMessage();
    }

    listenMessage() {
        const self: OAuthPopup = this;
        return new Promise<string>((resolve, reject) => {
            const handleMessage = (event: MessageEvent) => {
                const href = self.window!.location.href;
                window.removeEventListener('message', handleMessage);
                self.close();
                resolve(href);
            };
            window.addEventListener('message', handleMessage);
        });
    }

    close() {
        this.cancel();
        this.window?.close();
    }

    cancel() {
        if (this.iid) {
            window.clearInterval(this.iid);
            this.iid = undefined;
        }
    }
}
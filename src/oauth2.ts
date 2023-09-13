import { OAuth2Client, generateCodeVerifier } from '@badgateway/oauth2-client';

export type LenraOAuth2Opts = {
    clientId: string,
    redirectUri: string,
    scopes: string[],
    authorizeUrl: string,
    tokenUrl: string,
}

export default class LenraOAuth2Client {
    client: OAuth2Client;
    popup?: OAuthPopup;
    opts: LenraOAuth2Opts;


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
            });

            this.popup = new OAuthPopup(authUrl);
            const popupLocation = await this.popup.open();
            const token = await this.client.authorizationCode.getTokenFromCodeRedirect(
                popupLocation,
                {
                    redirectUri: this.opts.redirectUri,
                    codeVerifier,
                }
            );
            sessionStorage.setItem("access_token", token.accessToken);
            access_token = token.accessToken;
        }
        return access_token;
    }

}

class OAuthPopup {
    id: string = "LenraOauth2Popup";
    url: string;
    popupOptions: string = "popup=true";
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
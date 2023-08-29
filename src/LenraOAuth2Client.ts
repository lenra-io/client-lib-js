import { OAuth2Client, generateCodeVerifier } from '@badgateway/oauth2-client';
import OAuthPopup from "./OAuthPopup";

export type LenraOAuth2Opts = {
    clientId: string,
    redirectUri: string,
    scope: string[],
    isProd?: boolean,
    server?: string,
    tokenEndpoint?: string,
    authorizationEndpoint?: string,
}

export default class LenraOAuth2Client {
    client: OAuth2Client;
    popup?: OAuthPopup;
    opts: LenraOAuth2Opts;


    constructor(
        opts: LenraOAuth2Opts,
    ) {
        opts.isProd = opts.isProd ?? false;
        opts.server = opts.server ?? (opts.isProd ? "https://auth.lenra.io" : "http://localhost:4444");
        opts.tokenEndpoint = opts.tokenEndpoint ?? "/oauth2/token";
        opts.authorizationEndpoint = opts.authorizationEndpoint ?? "/oauth2/auth";
        this.opts = opts;


        this.client = new OAuth2Client({
            server: opts.server,
            clientId: opts.clientId,
            tokenEndpoint: opts.tokenEndpoint,
            authorizationEndpoint: opts.authorizationEndpoint,
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
                scope: this.opts.scope,
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
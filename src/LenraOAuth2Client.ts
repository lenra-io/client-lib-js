import { OAuth2Client, generateCodeVerifier } from '@badgateway/oauth2-client';
import OAuthPopup from "./OAuthPopup";

export default class LenraOAuth2Client {
    client: OAuth2Client;
    redirectUri: string;
    scope: string[];
    popup?: OAuthPopup;


    constructor(
        clientId: string,
        redirectUri: string,
        scope: string[],
        opts: {
            isProd: boolean;
            server?: string;
            tokenEndpoint?: string;
            authorizationEndpoint?: string;
        }
    ) {
        const server = opts.server ?? (opts.isProd ? "https://auth.lenra.io" : "http://localhost:4444");
        const tokenEndpoint = opts.tokenEndpoint ?? '/oauth2/token';
        const authorizationEndpoint = opts.authorizationEndpoint ?? '/oauth2/auth';

        this.client = new OAuth2Client({
            server,
            clientId,
            tokenEndpoint,
            authorizationEndpoint,
        });

        this.redirectUri = redirectUri;
        this.scope = scope;
        this.popup = undefined;
    }

    async authenticate() {
        const codeVerifier = await generateCodeVerifier();
        const authUrl = await this.client.authorizationCode.getAuthorizeUri({
            redirectUri: this.redirectUri,
            codeVerifier,
            scope: this.scope,
        });

        this.popup = new OAuthPopup(authUrl);
        const popupLocation = await this.popup.open();
        const token = await this.client.authorizationCode.getTokenFromCodeRedirect(
            popupLocation,
            {
                redirectUri: this.redirectUri,
                codeVerifier,
            }
        );
        return token;
    }

}
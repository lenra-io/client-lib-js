export default class OAuthPopup {
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
        return this.startPolling();
    }

    startPolling() {
        this.promise = new Promise<string>((resolve, reject) => {
            this.iid = window.setInterval(() => {
                // The popup is closed
                if (!this.window || this.window.closed !== false) {
                    this.close();
                    reject(new Error('The popup authentication was closed for an unexpected reason'));
                    return;
                }

                // The location didn't change yet (still logging)
                if (this.window.location.href === this.url || this.window.location.pathname === 'blank') {
                    return;
                }

                resolve(this.window.location.href);
                this.close();
            }, 50);
        });

        return this.promise;
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
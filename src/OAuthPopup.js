export default class OAuthPopup {
    constructor(url) {
        this.id = "LenraOauth2Popup";
        this.url = url;
        this.popupOptions = "popup=true";
        this.response = null;
        this.window = null;
        this.iid = null;
        this.promise = null;
    }

    open() {
        this.window = window.open(this.url, this.id, this.popupOptions);
        return this.startPolling();
    }

    startPolling() {
        this.promise = new Promise((resolve, reject) => {
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
        this.window.close();
    }

    cancel() {
        if (this.iid) {
            window.clearInterval(this.iid);
            this.iid = null;
        }
    }
}
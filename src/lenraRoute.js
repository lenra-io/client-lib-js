import { applyPatch } from 'fast-json-patch';



export default class LenraRoute {
    constructor(socket, route, callback) {
        this.json = null;
        this.callback = callback;
        this.route = route;
        this.channel = socket.channel("route:" + this.route, { "mode": "json" });

        this.channel.on("ui", (data) => {
            this.json = data;
            console.log(`New UI from ${this.route}`, this.json)

            this.notify();
        });

        this.channel.on("patchUi", (payload) => {
            this.json = applyPatch({ ...this.json }, payload.patch).newDocument;
            console.log(`New Patch from ${this.route}`, payload.patch, this.json)

            this.notify();
        });

        this.channel.join()
            .receive("ok", resp => { console.log(`${this.route} joined successfully`, resp) })
            .receive("error", resp => { console.log(`Unable to join ${this.route}`, resp) })

    }

    callListener(listenerCall, event = {}) {
        let call = {
            ...listenerCall,
            event: event
        }
        this.channel.push("run", call)
    }

    notify() {
        this.callback(this.json);
    }


    close() {
        console.log(`Leaving the channel ${this.route}`)
        this.channel.leave();
    }
}
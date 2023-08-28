import { applyPatch } from 'fast-json-patch';
import { Channel, Socket } from 'phoenix-channels';

export type Callback = (json: unknown) => void;
export type ListenerCall = {
    code: string,
    event?: object,
}

export default class LenraRoute {
    json?: object = undefined;
    callback: Callback;
    route: string;
    channel: Channel;

    constructor(socket: Socket, route: string, callback: Callback) {
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

    callListener(listenerCall: ListenerCall) {
        let call = {
            ...listenerCall
        }
        this.channel.push("run", call)
    }

    notify() {
        if (!!this.json) {
            this.callback(this.json!);
        }
    }


    close() {
        console.log(`Leaving the channel ${this.route}`)
        this.channel.leave();
    }
}
import { applyPatch } from 'fast-json-patch';
import { Channel, Socket } from 'phoenix';


export type Callback<T = any> = (json: T) => void;
export type ListenerCall<T = any> = {
    code: string,
    event?: T,
}

export interface Listener<T = any> {
    code: string;
    call(event?: T):Promise<void>;
}

export default class LenraRoute<T = any> {
    json?: T
    parsedJson?: T
    callback: Callback<T>
    route: string
    channel: Channel

    constructor(socket: Socket, route: string, callback: Callback<T>) {
        this.callback = callback;
        this.route = route;
        this.channel = socket.channel("route:" + this.route, { "mode": "json" });

        this.channel.on("ui", (data) => {
            this.json = data;
            console.log(`New UI from ${this.route}`, this.json);
            this.parsedJson = parseDataListeners(this, this.json);

            this.notify();
        });

        this.channel.on("patchUi", (payload) => {
            this.json = applyPatch({ ...this.json }, payload.patch).newDocument as T;
            console.log(`New Patch from ${this.route}`, payload.patch, this.json);
            this.parsedJson = parseDataListeners(this, this.json);

            this.notify();
        });

        this.channel.join()
            .receive("ok", resp => { console.log(`${this.route} joined successfully`, resp) })
            .receive("error", resp => { console.log(`Unable to join ${this.route}`, resp) })

    }

    callListener(listenerCall: ListenerCall) {
        return new Promise<void>((resolve, reject) => {
            let call = {
                ...listenerCall
            }
            this.channel.push("run", call)
                .receive("ok", (_) => { resolve() })
                .receive("error", (reasons) => { console.error(reasons); reject(new Error("An error occured while running the listener")) });
        });
    }

    notify() {
        if (!!this.parsedJson) {
            this.callback(this.parsedJson!);
        }
    }

    close() {
        console.log(`Leaving the channel ${this.route}`)
        this.channel.leave();
    }
}

function parseDataListeners(route: LenraRoute, data: any): any {
    if (data._type === "listener" && "code" in data) {
        // create Listener
        if (!("call" in data)) {
            const code = data.code;
            Object.defineProperty(data, "call", {
                enumerable: false,
                writable: false,
                configurable: false,
                value: (event?: any) => route.callListener({code, event})
            });
        }
        return data;
    }
    if (data instanceof Array) {
        return data.map((d: any) => parseDataListeners(route, d));
    }
    if (data instanceof Object) {
        for (const [key, value] of Object.entries(data)) {
            data[key] = parseDataListeners(route, value);
        }
    }
    return data;
}
import { applyPatch } from 'fast-json-patch';
import { Channel, Socket } from 'phoenix';


export type Callback<T = any> = (json: T) => void;
export type ListenerCall<T = any> = {
    code: string,
    event?: T,
}

class ExtensibleFunction extends Function {
    constructor(f: Function) {
        super();
      return Object.setPrototypeOf(f, new.target.prototype);
    }
  }

export class Listener<T = any> extends ExtensibleFunction {
    readonly code: string;
    constructor(route: LenraRoute, code: string) {
        super((event?: T) => route.callListener({ code, event }));
        this.code = code;
    }

    toJSON() {
        return {code: this.code};
    }
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
            this.parsedJson = parseData(this, this.json);

            this.notify();
        });

        this.channel.on("patchUi", (payload) => {
            this.json = applyPatch({ ...this.json }, payload.patch).newDocument as T;
            console.log(`New Patch from ${this.route}`, payload.patch, this.json);
            this.parsedJson = parseData(this, this.json);

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

export function parseData(route: LenraRoute, data: any): any {
    if (data instanceof Object) {
        if ("_type" in data) {
            switch (data._type) {
                case "listener":
                    if ("code" in data && !("call" in data)) {
                        return new Listener(route, data.code);
                    }
                    break;
                // add other types here
            }
        }
        else {
            for (const [key, value] of Object.entries(data)) {
                data[key] = parseData(route, value);
            }
        }
    }
    if (data instanceof Array) {
        return data.map((d: any) => parseData(route, d));
    }
    return data;
}
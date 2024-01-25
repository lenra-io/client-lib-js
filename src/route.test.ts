import { Channel, Push } from "phoenix";
import LenraRoute, { Listener, parseData } from "./route";

describe("parseData", () => {
    const route: any = { callListener: jest.fn() };

    function expectListener(listener: Listener | any, code: string) {
        expect(listener).toBeInstanceOf(Function);
        expect(listener.code).toBe(code);
    }

    it("parse listener", () => {
        const listener = { _type: "listener", code: "test" };
        const parsedListener = parseData(route, listener);
        expectListener(parsedListener, "test");
    })

    it("parse listener in object", () => {
        const data = {
            listener1: { _type: "listener", code: "test1" },
            listener2: { _type: "listener", code: "test2" },
            value: "some value"
        };
        expect(parseData(route, data)).toEqual({
            listener1: expect.any(Function),
            listener2: expect.any(Function),
            value: "some value"
        });
        expectListener(data.listener1, "test1");
        expectListener(data.listener2, "test2");
    });

    it("parse listener in array", () => {
        const data = [
            { _type: "listener", code: "test1" },
            { _type: "listener", code: "test2" },
            "some value"
        ];
        expect(parseData(route, data)).toEqual([
            expect.any(Function),
            expect.any(Function),
            "some value"
        ]);
        expectListener(data[0], "test1");
        expectListener(data[1], "test2");
    });

    it("parse data without listener", () => {
        const data = {
            value1: "some value",
            value2: 123
        };
        expect(parseData(route, data)).toEqual(data);
    });

    it("should return null when input is null", () => {
        expect(parseData(route, null)).toBeNull();
    });

    it("should return undefined when input is undefined", () => {
        expect(parseData(route, undefined)).toBeUndefined();
    });

    it("should return the same boolean value when input is boolean", () => {
        expect(parseData(route, true)).toBe(true);
        expect(parseData(route, false)).toBe(false);
    });

    it("do not stringify call function", () => {
        const data = { _type: "listener", code: "test" };
        const parsedData = parseData(route, data);
        expect(JSON.stringify(parsedData)).toBe(JSON.stringify({code: "test"}));
    });
});

describe("LenraRoute", () => {
    let push: Push;
    let channel: Channel;
    let route: LenraRoute<any>;
    let callListenerSpy: jest.SpyInstance;

    beforeEach(() => {
        push = {
            receive: jest.fn().mockImplementation(() => push),
        } as any;
        channel = {
            on: jest.fn(),
            join: push.receive,
            push: push.receive,
        } as any;
        route = new LenraRoute<any>({ channel: () => channel } as any, "", () => { });
        callListenerSpy = jest.spyOn(route, "callListener");
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("call listener from Route.callListener", () => {
        const listenerCall = { code: "test", event: "some event" };
        route.callListener(listenerCall);
        expect(callListenerSpy).toHaveBeenCalledWith(listenerCall);
    });

    it("call listener from Listener.call", () => {
        const listener: Listener<string> = parseData(route, { _type: "listener", code: "test" });
        listener("some event");
        expect(callListenerSpy).toHaveBeenCalledWith({ code: "test", event: "some event" });
    });
});


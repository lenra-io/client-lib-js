import { LenraApp } from '@lenra/client';

const app = new LenraApp({
    clientId: "XXX-XXX-XXX",
});

console.log("connecting...");
app.connect().then(() => {
    console.log("Connected !");

    const counters = document.querySelectorAll(".counter");

    counters.forEach((counter) => {
        const button = counter.querySelector("button");
        const output = counter.querySelector("output");
        const route = app.route(`/counter/${counter.id}`, (data) => {
            output.textContent = data.value;
            button.onclick = () => {
                output.classList.add("loading");
                route.callListener({code: data.onIncrement.code, event: {value: "custom value"}}).then(() => {
                    output.classList.remove("loading");
                });
            };
        });
    });
});
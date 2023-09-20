import { LenraApp } from '@lenra/client';

const app = new LenraApp({
    appName: "Example Client",
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
                route.callListener(data.onIncrement).then(() => {
                    output.classList.remove("loading");
                });
            };
        });
    });
});
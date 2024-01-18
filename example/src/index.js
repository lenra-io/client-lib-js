import { LenraApp, Listener } from '@lenra/client';

const app = new LenraApp({
    clientId: "XXX-XXX-XXX",
});

console.log("connecting...");
app.connect().then(() => {
    console.log("Connected !");

    const disconnectButton = document.createElement("button");
    disconnectButton.textContent = "Disconnect";
    disconnectButton.onclick = () => {
        app.disconnect();
        disconnectButton.remove();
    };
    document.body.appendChild(disconnectButton);

    const counters = document.querySelectorAll(".counter");

    counters.forEach((counter) => {
        const button = counter.querySelector("button");
        const output = counter.querySelector("output");
        app.route(`/counter/${counter.id}`, 
            /**
             * @param {{value: number, onIncrement: Listener<{value: string}>}} data 
             */
            (data) => {
            output.textContent = data.value;
            button.onclick = () => {
                output.classList.add("loading");
                data.onIncrement.call({value: "custom value"}).then(() => {
                    output.classList.remove("loading");
                });
            };
        });
    });
});
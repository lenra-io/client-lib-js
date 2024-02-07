import { LenraApp, Listener } from '@lenra/client';

const app = new LenraApp({
    appName: "XXX-XXX-XXX",
    clientId: "XXX-XXX-XXX",
});

let authenticated = false;

console.log("connecting...");
app.openSocket().then(appConnected);

const authenticationButton = document.querySelector("body > button");
authenticationButton.onclick = () => {
    app.disconnect();
    authenticated = true;
    app.connect().then(appConnected);
};
const disconnectButton = document.createElement("button");
disconnectButton.textContent = "Disconnect";
disconnectButton.onclick = () => {
    app.disconnect();
    disconnectButton.style.display = "none";
};
document.body.appendChild(disconnectButton);

function appConnected() {
    console.log("Connected !");

    disconnectButton.style.display = undefined;

    const counters = document.querySelectorAll(".counter");

    counters.forEach((counter) => {
        // Filter counters that need authentication
        if (!authenticated && counter.classList.contains("authenticated")) return;

        const button = counter.querySelector("button");
        const output = counter.querySelector("output");
        console.log("Open route for counter", counter.id);
        app.route(`/counter/${counter.id}`,
            /**
             * @param {{value: number, onIncrement: Listener<{value: string}>}} data 
             */
            (data) => {
                output.textContent = data.value;
                button.onclick = () => {
                    output.classList.add("loading");
                    data.onIncrement({ value: "custom value" }).then(() => {
                        output.classList.remove("loading");
                    });
                };
            });
    });
}
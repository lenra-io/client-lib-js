
// import { LenraApp } from 'lenra-js';
const { LenraApp } = require("lenra-js");


var button = document.getElementById("button");

let app = new LenraApp({
    appName: "test",
    clientId: "foo",
    redirectUri: "http://127.0.0.1:3030",
    scope: ["app:websocket"]
});

console.log("connecting...");
app.connect().then(() => {
    console.log("Connected !");
    app.route("/global", (data) => {
        console.log(data);
    });
})


// // HIGH LEVEL API
// let opts = {
//     appName: "myApp",
//     clientId: "my-client-id",
//     redirectUri: "http://localhost:3001",
//     scope: "app:websocket",
//     isProd: false, // Optional, Default to false
//     wsUri: "wss://myServer.com/socket", // Optional, default to "wss://api.lenra.io/socket" if prod or "wss://api.lenra.io/socket" for dev.

//     server: "http://my-server.com", // Optional, default "https://auth.lenra.io" for prod or "http://localhost:4444" for dev
//     tokenEndpoint: "/oauth2/token", // Optional, default "/oauth2/token"
//     authorizationEndpoint: "/oauth2/auth", // Optional, default "/oauth2/auth"
// }

// let lenraApp = new LenraApp(opts);
// lenraApp.connect().then(() => {
//     let route = lenraApp.route("/foo", (data) => {
//         // Got my data !

//         // You probably don't want to call the increment here, but it's for the example.
//         route.callListener(data.increment);
//     });
// });



// // Create the oauth2 Client
// let oauthOpts = {
//     clientId: "my-client-id",
//     redirectUri: "http://localhost:3001",
//     scope: "app:websocket",
//     isProd: false, // Optional, default false
//     server: "http://my-server.com", // Optional, default "https://auth.lenra.io" for prod or "http://localhost:4444" for dev
//     tokenEndpoint: "/oauth2/token", // Optional, default "/oauth2/token"
//     authorizationEndpoint: "/oauth2/auth", // Optional, default "/oauth2/auth"
// }
// let client = new LenraOAuth2Client(oauthOpts);
// // Authenticate and get token
// let token = await client.authenticate();
// // Save token in localStorage or other secured place.
// // Use token to connect to websocket !
// let socketOpts = {
//     appName: "myApp",
//     token: token,
//     isProd: false, // Default to false
//     wsUri: "wss://myServer.com/socket", // default to "wss://api.lenra.io/socket" if prod or "wss://api.lenra.io/socket" for dev.
// }

// let socket = new LenraSocket(socketOpts);
// socket.connect().then(() => {
//     let route = socket.route("/foo", (data) => {
//         // Got my data !

//         // You probably don't want to call the increment here, but it's for the example.
//         route.callListener(data.increment);
//     });
// });

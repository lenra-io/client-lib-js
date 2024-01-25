<div id="top"></div>
<!--
*** This README was created with https://github.com/othneildrew/Best-README-Template
-->



<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">

<h3 align="center">Lenra's JavaScript client lib</h3>

  <p align="center">
    Let you create your JavaScript application with Lenra backend.
    <br />
    <br />
    <a href="https://github.com/lenra-io/client-lib-js/issues">Report Bug</a>
    ·
    <a href="https://github.com/lenra-io/client-lib-js/issues">Request Feature</a>
  </p>
</div>




<!-- GETTING STARTED -->

## Prerequisites

Add the dependency to your project:

```console
npm i @lenra/client
```

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- USAGE EXAMPLES -->
## Usage

Create a `LenraApp` in your :

```javascript
import { LenraApp } from '@lenra/client';

const app = new LenraApp({
    appName: "Example Client",
    clientId: "XXX-XXX-XXX",
});
```

Open the websocket connection:

```javascript
app.connect();
```

This while automatically start the authentication flow.

You can then connect to a Lenra route to use it data:

```javascript
const route = app.route(`/${counter.id}`, (data) => {
    // Handle data
});
```

You can also call a listener given by the route:

```javascript
// calling directly the listener
button1.onclick = () => {
  data.increment().then(() => {
      // When the listener is finished
  });
};
// or from the route
button2.onclick = () => {
  route.callListener(data.decrement).then(() => {
      // When the listener is finished
  });
};
```

This [the full example](./example/src/index.js) for more informations.


For the web target, you also have to add the following JavaScript to a redirect file (default to `redirect.html`) to handle OAuth2 redirection (see the [example](./example/redirect.html)):

```javascript
window.onload = function() {
  window.opener.postMessage(window.location.href, `${window.location.protocol}//${window.location.host}`);
}
```

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please open an issue with the tag "enhancement".
Don't forget to give the project a star if you liked it! Thanks again!

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the **MIT** License. See [LICENSE](./LICENSE) for more information.

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Lenra - [@lenra_dev](https://twitter.com/lenra_dev) - contact@lenra.io

Project Link: [https://github.com/lenra-io/client-lib-js](https://github.com/lenra-io/client-lib-js)

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/lenra-io/client-lib-js.svg?style=for-the-badge
[contributors-url]: https://github.com/lenra-io/client-lib-js/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/lenra-io/client-lib-js.svg?style=for-the-badge
[forks-url]: https://github.com/lenra-io/client-lib-js/network/members
[stars-shield]: https://img.shields.io/github/stars/lenra-io/client-lib-js.svg?style=for-the-badge
[stars-url]: https://github.com/lenra-io/client-lib-js/stargazers
[issues-shield]: https://img.shields.io/github/issues/lenra-io/client-lib-js.svg?style=for-the-badge
[issues-url]: https://github.com/lenra-io/client-lib-js/issues
[license-shield]: https://img.shields.io/github/license/lenra-io/client-lib-js.svg?style=for-the-badge
[license-url]: https://github.com/lenra-io/client-lib-js/blob/master/LICENSE

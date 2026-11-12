<p align="center">
  <a href="https://fusionproxy.net/?utm_source=github&utm_medium=puppeteer-proxy">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/FusionProxies/.github/main/assets/logo-on-dark.png">
      <img src="https://raw.githubusercontent.com/FusionProxies/.github/main/assets/logo-on-light.png" alt="Fusion Proxy" height="52">
    </picture>
  </a>
</p>

# Puppeteer with residential proxies

How to use [Fusion Proxy](https://fusionproxy.net/?utm_source=github&utm_medium=puppeteer-proxy) residential proxies in Puppeteer: authenticated proxy, country targeting, and one sticky IP per browser context.

## Setup

```bash
export FUSION_USER="your_username"
export FUSION_PASS="your_password"
export FUSION_COUNTRY="us"   # optional, two-letter country code

npm install
node example.mjs
```

Your username and password are in the [dashboard](https://dashboard.fusionproxy.net/?utm_source=github&utm_medium=puppeteer-proxy). The script opens two browser contexts and prints the exit IP each one got.

## How it works

Chromium does not accept a username and password inside `--proxy-server`, so the proxy address goes into the launch arguments and the credentials go to `page.authenticate()`:

```js
const browser = await puppeteer.launch({ args: ['--proxy-server=http://resi.fusionproxy.net:12286'] });
const context = await browser.createBrowserContext({ proxyServer: 'http://resi.fusionproxy.net:12286' });
const page = await context.newPage();
await page.authenticate({
  username: `${FUSION_USER}-country-us-sessid-4821937-sessTime-600s`,
  password: FUSION_PASS,
});
await page.goto('https://ipinfo.io/json');
```

| Username part | Meaning |
|---|---|
| `-country-us` | Exit country (two-letter ISO code). Add `-state-` and `-city-` codes from the endpoint generator for narrower targeting |
| `-sessid-4821937` | Session ID. The same ID keeps the same IP; a new ID gets a new IP |
| `-sessTime-600s` | How long the session holds its IP, 1 to 120 minutes, in seconds |

A page loads many resources, and on the rotating port each new connection can get a different IP. A sticky session per context keeps every request of that context on one residential IP. All options are explained in the [endpoint generator guide](https://fusionproxy.net/guides/endpoint-generator?utm_source=github&utm_medium=puppeteer-proxy).

## Notes

- Use the HTTP endpoint in browsers. Chromium does not support SOCKS5 proxies with a username and password.
- `createBrowserContext({ proxyServer })` needs Puppeteer 22 or newer.
- A residential IP can change before the session ends if its device goes offline. Retry failed navigations in a new context.

## More

- [Code examples in 8 languages](https://github.com/FusionProxies/fusionproxy)
- [Playwright version](https://github.com/FusionProxies/playwright-proxy)
- [Residential proxies](https://fusionproxy.net/proxies/residential?utm_source=github&utm_medium=puppeteer-proxy) · [Pricing](https://fusionproxy.net/pricing?utm_source=github&utm_medium=puppeteer-proxy) · [Free trial](https://fusionproxy.net/free-trial?utm_source=github&utm_medium=puppeteer-proxy)

## License

MIT, see [LICENSE](LICENSE).

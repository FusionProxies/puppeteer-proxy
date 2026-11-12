// Puppeteer with Fusion Proxy residential proxies.
// Each browser context gets its own sticky session: one IP per context.
//
// npm install
// export FUSION_USER=... FUSION_PASS=... [FUSION_COUNTRY=us]
import puppeteer from 'puppeteer';

const { FUSION_USER, FUSION_PASS, FUSION_COUNTRY = 'us' } = process.env;
if (!FUSION_USER || !FUSION_PASS) throw new Error('set FUSION_USER and FUSION_PASS');

const PROXY = 'http://resi.fusionproxy.net:12286';
const stickyUser = (minutes = 10) =>
  `${FUSION_USER}-country-${FUSION_COUNTRY}-sessid-${Math.floor(Math.random() * 9e6) + 1e6}-sessTime-${minutes * 60}s`;

const browser = await puppeteer.launch({ args: [`--proxy-server=${PROXY}`] });

for (const n of [1, 2]) {
  // a separate context per session keeps cookies and IPs apart
  const context = await browser.createBrowserContext({ proxyServer: PROXY });
  const page = await context.newPage();
  // Chromium does not take credentials in the proxy URL; page.authenticate answers the 407
  await page.authenticate({ username: stickyUser(), password: FUSION_PASS });
  await page.goto('https://ipinfo.io/json', { timeout: 60000 });
  console.log(`context ${n}:`, (await page.$eval('body', (b) => b.innerText)).replace(/\n/g, ' ').slice(0, 120));
  await context.close();
}

await browser.close();

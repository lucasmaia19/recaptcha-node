// npm install @antiadmin/anticaptchaofficial
// npm install puppeteer
// node index.js

const ac = require("@antiadmin/anticaptchaofficial");
const pup = require("puppeteer");

ac.setAPIKey('3e7851ded010dc4c1e0bcee497304de6');
ac.getBalance()
    .then(balance => console.log('my balance is: ' + balance))
    .catch(error => console.log('an error with API key: ' + error));

const url = 'https://www.detran.mg.gov.br/veiculos/situacao-do-veiculo/consulta-situacao-do-veiculo';
const recaptchToken = '6LfVpnIUAAAAAHkISk6Z6juZcsUx6hbyJGwfnfPL';
const placa = 'HOC9880';
const chassi = '9C6KE1500B0001618';

(async () => {

    console.log('solving recaptcha ...');
    let token = await ac.solveRecaptchaV2Proxyless(url, recaptchToken);
    if (!token) {
        console.log('something went wrong');
        return;
    }

    console.log('token ...', token);

    console.log('opening browser ..');
    const browser = await pup.launch({headless: true});

    console.log('creating new tab ..');
    const tab = await browser.newPage();

    console.log('changing window size .. ');
    await tab.setViewport({ width: 1360, height: 1000 });

    console.log('opening target page ..');
    await tab.goto(url, { waitUntil: "networkidle0" });

    console.log('filling placa input ..');
    await tab.$eval('#ConsultarSituacaoVeiculoPlaca', (element, placa) => {
        element.value = placa;
    }, placa);

    console.log('filling chassi input');
    await tab.$eval('#ConsultarSituacaoVeiculoChassi', (element, chassi) => {
        element.value = chassi;
    }, chassi);

    console.log('setting recaptcha g-response ...');
    await tab.$eval('#g-recaptcha-response', (element, token) => {
        element.value = token;
    }, token);

    console.log('submitting form .. ');
    await Promise.all([
        tab.click('.formulario > .uma_coluna > button'),
        tab.waitForNavigation({ waitUntil: "networkidle0" })
    ]);

    console.log('making a screenshot ...');
    await tab.screenshot({ path: 'screenshot.png' });

    //console.log('closing browser .. ');
    //await browser.close();

})();

const express = require('express');
const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const debug = require('debug')('hvc:app')

dotenv.config();
const app = express();
const expressWs = require('express-ws')(app);
const port = process.env.PORT || 5000;


const LOGIN_POPUP_BTN = '#loginli > button';
const EMAIL_INPUT = '#usernameBox';
const PASSWORD_INPUT = '#login_user_form > input:nth-child(2)';
const LOGIN_BTN = '#login-button';
const INVALID_LOGIN = '#email_error';

const TARGETS = "#cronometerApp > div > div:nth-child(1) > div > table > tbody > tr > " 
  + "td:nth-child(2) > div > div.GL-TVABCGUB.diary_side_box";
const ALL_TARGETS = TARGETS + " div.GL-TVABCOT";

const puppeteerOptions = {};
if (process.env.HEADLESS === 'false' || process.env.HEADLESS === '0') {
  puppeteerOptions.headless = false;
  debug('Running with GUI');
}
else {
  debug('Running headless');
}

const sockets = [];
app.ws('/status', function(ws, req) {
  debug('Socket connected.');
  sockets.push(ws);

  ws.on('close', function(msg) {
    debug('Socket closed.');
    let res = sockets.splice(sockets.indexOf(ws), 1);
  });
});

let broadcast = (message) => {
  sockets.forEach((s) => { s.send(JSON.stringify(message)) });
};

app.get('/api/targets', async (req, res) => {

  let email = req.query.email;
  let password = req.query.password;

  debug(`Got /api/targets request: ${email}`);

  debug('Logging in...');
  broadcast({ progress: "10%", message: 'Logging in...' });

  const browser = await puppeteer.launch(puppeteerOptions);
  const page = await browser.newPage();
  
  await page.goto(process.env.SITE_URL);

  await page.click(LOGIN_POPUP_BTN);
  await page.waitFor(1000);

  await page.click(EMAIL_INPUT);
  await page.keyboard.type(email);

  await page.click(PASSWORD_INPUT);
  await page.keyboard.type(password);

  await page.click(LOGIN_BTN);

  page.waitFor(INVALID_LOGIN, { visible: true }).then(async () => {
    debug('Invalid login');
    res.send({error: 'login invalid'});
    browser.close();
  }).catch(targetClosedErrorHandler);

  page.waitForSelector(ALL_TARGETS).then(async () => {
    debug('Login OK');
    debug('Got targets div selector, waiting for 3s...');
    await page.waitFor(3000);

    debug('Getting targets....');

    let targets = await getTargets(page);
    browser.close();

    debug('All done');

    res.send({ targets: targets });
  }).catch(targetClosedErrorHandler);

});

let targetClosedErrorHandler = (err) => {
  if (err.message && err.message.indexOf('Target closed') !== -1) {
    return;
  }
  debug(`Error waiting for invalid login ${err.message}`);
}

let getTargets = async (page) => {
  const hoverSel = TARGETS + " > div:nth-child(3) > div > div:nth-child(2)";

  let targetArray = await getTargetValues(page);

  for (let i = 2; i <= 8; i++) {
    await fetchHoverValue(page, targetArray, i);
  }

  let targets = parseTargetValues(targetArray);

  return targets;
}

let fetchHoverValue = async (page, targetArray, index) => {
  const hoverSel = TARGETS + ` > div:nth-child(3) > div > div:nth-child(${index})`;
  await page.hover(hoverSel);
  debug(`Fetching hover value index (${index})`);

  await page.waitFor(100);

  let values = await getTargetValues(page);
  let targetArrayIndex = index - 1;
  let hoverVal = values[targetArrayIndex].join("");

  targetArray[targetArrayIndex][2] = hoverVal;

  return hoverVal;
}

let parseTargetValues = (data) => {
  let result = {};
  data.map(val => {
    let percent = val[0];
    let label = val[1];
    let amount = val[2];
    if (label === 'TARGETS') return;
    result[label] = { percent: percent, amount: amount };
  })
  return result;  
}

let getTargetValues = async (page) => {
  const ALL_TARGETS = TARGETS + " div.GL-TVABCOT";

  let result = await page.evaluate((sel) => {
    let divs = Array.from(document.querySelectorAll(sel));
    let data = divs.map(d => { 
      return [ 
        d.querySelector('.GL-TVABCAU').innerText, 
        d.querySelector('.GL-TVABCNT').innerText 
      ] 
    });
    return data;
  }, ALL_TARGETS)

  return result;
}



app.listen(port, () => debug(`Listening on port ${port}`));


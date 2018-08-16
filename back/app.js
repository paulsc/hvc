const express = require('express');
const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const debug = require('debug')('hvc:app');
const path = require('path');

dotenv.config();
const app = express();
const expressWs = require('express-ws')(app);
const port = process.env.PORT || 5000;
app.use( express.static( `${__dirname}/../front/build` ) );


const LOGIN_POPUP_BTN = '#loginli > button';
const EMAIL_INPUT = '#usernameBox';
const PASSWORD_INPUT = '#login_user_form > input:nth-child(2)';
const LOGIN_BTN = '#login-button';
const INVALID_LOGIN = '#email_error';

// const TARGETS = "#cronometerApp > div > div:nth-child(1) > div > table > tbody > tr > " 
//   + "td:nth-child(2) > div > div.GL-TVABCGUB.diary_side_box";
// const ALL_TARGETS = TARGETS + " div.GL-TVABCOT";

const TARGETS = "#cronometerApp > div > div:nth-child(1) > div > table > tbody > tr > " 
  + "td:nth-child(2) > div > div.GL-TVABCNVB.diary_side_box";
const ALL_TARGETS = TARGETS + " div.GL-TVABCCU";

const puppeteerOptions = { headless: true };
let page;

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
  broadcast({ progress: "10%", message: 'Opening cronometer.com...' });

  const browser = await puppeteer.launch(puppeteerOptions);
  page = await browser.newPage();

  await page.goto(process.env.SITE_URL);

  await page.click(LOGIN_POPUP_BTN);
  broadcast({ progress: "20%", message: 'Clicked login button...' });
  await page.waitFor(1000);

  await page.click(EMAIL_INPUT);
  await page.keyboard.type(email);

  await page.click(PASSWORD_INPUT);
  await page.keyboard.type(password);

  await page.click(LOGIN_BTN);
  broadcast({ progress: "30%", message: 'Credentials sent...' });

  page.waitFor(INVALID_LOGIN, { visible: true }).then(async () => {
    debug('Invalid login');
    broadcast({ progress: "100%", message: 'Login incorrect.' });
    res.send({error: 'login invalid'});
    browser.close();
  }).catch(targetClosedErrorHandler);

  page.waitForSelector(ALL_TARGETS).then(async () => {
    debug('Login OK');
    debug('Got targets div selector, waiting for 3s...');
    broadcast({ progress: "40%", message: 'Login OK...' });
    await page.waitFor(3000);

    debug('Getting targets....');
    broadcast({ progress: "50%", message: 'Getting nutrition targets...' });

    let targets = await getTargets(page);
    browser.close();

    broadcast({ progress: "100%", message: 'All done.' });
    debug('All done');

    res.send({ targets: targets });
  }).catch(targetClosedErrorHandler);

});

let targetClosedErrorHandler = (err) => {
  if (err.message && err.message.indexOf('Target closed') !== -1) {
    return;
  }
  debug('Taking screenshot...');
  page.screenshot({ path: 'ss.png' });
  debug(`Error waiting for invalid login ${err.message}`);
}

let getTargets = async (page) => {
  let targetArray = await getTargetValues(page);

  debug("Got target array", targetArray);

  let progress = 50;
  for (let i = 2; i <= 8; i++) {
    await fetchHoverValue(page, targetArray, i);
    progress += 7;
    broadcast({ progress: progress + "%", message: 'Getting nutrition targets...' });
  }

  let targets = parseTargetValues(targetArray);

  return targets;
}

let fetchHoverValue = async (page, targetArray, index) => {
  debug("Enabling manual hover index:", index);
  const hoverSel = TARGETS + ` > div:nth-child(3) > div > div:nth-child(${index})`;
  await page.hover(hoverSel);
  debug(`Fetching hover value index (${index})`);

  await page.waitFor(100);

  let values = await getTargetValues(page);
  // debug("Got values after hover:", values);
  let targetArrayIndex = index - 1;
  let hoverVal = values[targetArrayIndex].join("");

  debug("Read value:", hoverVal);
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
  let result = await page.evaluate((sel) => {
    let divs = Array.from(document.querySelectorAll(sel));
    let data = divs.map(d => { 
      return [ 
        // d.querySelector('.GL-TVABCAU').innerText, 
        // d.querySelector('.GL-TVABCNT').innerText 
        d.querySelector('.GL-TVABCEU').innerText, 
        d.querySelector('.GL-TVABCBU').innerText 
      ] 
    });
    return data;
  }, ALL_TARGETS)

  return result;
}

app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname + '/../front/build/index.html'));
});

app.listen(port, () => debug(`Listening on port ${port}`));


const express = require('express');
const puppeteer = require('puppeteer');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;


LOGIN_POPUP_BTN = '#loginli > button';
EMAIL_INPUT = '#usernameBox';
PASSWORD_INPUT = '#login_user_form > input:nth-child(2)';
LOGIN_BTN = '#login-button';

// TARGETS = "#cronometerApp > div > div:nth-child(1) > div > table > tbody > tr > " 
//   + "td:nth-child(2) > div > div.GL-TVABCGUB.diary_side_box > div:nth-child(3) > div";

TARGETS = "#cronometerApp > div > div:nth-child(1) > div > table > tbody > tr > " 
  + "td:nth-child(2) > div > div.GL-TVABCGUB.diary_side_box";

app.get('/api/home', async (req, res) => {

  let email = req.query.email;
  let password = req.query.password;

  let options = {};

  if (process.env.HEADLESS === 'false' || process.env.HEADLESS === '0') {
    options.headless = false;
  }

  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();
  
  await page.goto(process.env.SITE_URL);

  await page.click(LOGIN_POPUP_BTN);
  await page.waitFor(1000);

  await page.click(EMAIL_INPUT);
  await page.keyboard.type(email);

  await page.click(PASSWORD_INPUT);
  await page.keyboard.type(password);

  await page.click(LOGIN_BTN);

  await page.waitForNavigation();

  //await page.waitFor(10000);
  console.log('waiting...');

  let sel = "#cronometerApp > div > div:nth-child(1) > div > table > tbody > tr > td:nth-child(2) > div > div.GL-TVABCGUB.diary_side_box div.GL-TVABCOT";

  let fiberSelector = TARGETS + " div.GL-TVABCOT";
  await page.waitForSelector(fiberSelector);
  console.log('got selector, waiting for 3s');

  await page.waitFor(3000);

  let result = await page.evaluate((sel) => {
    let divs = Array.from(document.querySelectorAll(sel));
    let data = divs.map(d => { 
      return [ 
        d.querySelector('.GL-TVABCAU').innerText, 
        d.querySelector('.GL-TVABCNT').innerText 
      ] 
    });
    return data;
  }, sel)

  /*
  let divs = await page.$$eval(sel, (element) => {
    return element.innerHTML;
  });
  */

  console.log('RES', result);

  await page.waitFor(60000);
  
  browser.close();

  res.send({ express: 'Hello From Express' });

});

app.listen(port, () => console.log(`Listening on port ${port}`));


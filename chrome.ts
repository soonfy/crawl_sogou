const puppeteer = require('puppeteer');
import * as tool from './tool';
import * as moment from 'moment';
import * as fs from 'fs';
const devices = require('puppeteer/DeviceDescriptors');
const iPhone = devices['iPhone 6'];

const start = async () => {
  try {
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'));
    let index = 0;
    let ids = fs.readFileSync('./weixin.txt', 'utf-8').split('\n');
    console.log(ids);
    process.exit();

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://weixin.sogou.com/');

    while (index < 1000) {
      console.log('=== next ===');
      console.log(++index);
      let random = Math.floor(Math.random() * 100);

      await page.type('.qborder2 input[name=query]', ids[random], { delay: 20 })
      await page.click('.swz2', { delay: 20 });

      await page.waitFor(1000)
      console.log('=== title ===');
      console.log(await page.title());
      console.log('=== uri ===');
      let uri = await page.url();
      console.log(uri);
      console.log('=== cookies ===');
      let cookies = await page.cookies(uri)
      console.log(cookies);
      fs.writeFileSync('./cookies/weixin-cookie-' + index + '-' + random + '.json', JSON.stringify(cookies));

      for (let cookie of cookies) {
        await page.deleteCookie(cookie)
      }
      console.log('=== delete cookies ===');
      cookies = await page.cookies(uri)
      console.log(cookies);

      // console.log(await page.content());
      
      // console.log(await page.$eval('body', el => el.outerHTML));
      // const searchValue = await page.$eval('.tit', el => el.outerHTML);
      // console.log(searchValue);
      // const divsCounts = await page.$$eval('.tit', divs => divs.length);
      // console.log(divsCounts);

      // await page.goto('https://mp.weixin.qq.com/profile?src=3&timestamp=1513823903&ver=1&signature=bSSQMK1LY77M4O22qTi37cbhjhwNV7C9V4aor9HLhAuw-fwHbfpoRrtNm0KGPhOFOrOC5OvcUd-3fB1BI*KAyQ==');

      // const scriptValue = await page.$eval('script', el => el.outerHTML);
      // console.log(scriptValue);
      // const scriptsCounts = await page.$$eval('script', divs => divs.length);
      // console.log(scriptsCounts);
      let time = Math.random() * 10 + 60;
      await tool.sleep(time);
    }

    await browser.close();

  } catch (error) {
    console.error(error);
  }
}

start();

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
    // console.log(ids);

    const browser = await puppeteer.launch({
      headless: true
    });
    const page = await browser.newPage();
    await page.goto('http://weixin.sogou.com/');
    console.log(await page.title());
    await browser.close();

  } catch (error) {
    console.error(error);
    await start();
  }
}

start();
